/**
 * One-time migration: re-encodes raster images already sitting in the
 * `public-assets` bucket to resized WebP, so legacy uploads (multi-MB PNG/JPG
 * screenshots) match what the media-uploader now produces for new files.
 *
 * Safe + reversible:
 *   - Compressed copies are written to NEW paths; originals are never deleted
 *     or overwritten.
 *   - DB references (profile.avatar_url, projects.hero/media/image_url) are
 *     rewritten to the new URLs. To roll back, revert those columns.
 *
 * Usage (from repo root):
 *   node scripts/compress-storage-images.mjs           # dry run — reports only
 *   node scripts/compress-storage-images.mjs --apply   # upload + update DB
 */
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";

const APPLY = process.argv.includes("--apply");
const MAX_DIMENSION = 1920;
const WEBP_QUALITY = 82;
const BUCKET = "public-assets";

// --- env ---------------------------------------------------------------
const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i), l.slice(i + 1)];
    }),
);
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SERVICE_KEY) throw new Error("Missing Supabase env vars");

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
});

const publicPrefix = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/`;
const isImage = (url) =>
  typeof url === "string" &&
  url.startsWith(publicPrefix) &&
  /\.(png|jpe?g)$/i.test(url);

const fmtKB = (n) => `${(n / 1024).toFixed(0)}KB`;

// Map of original URL -> new URL, built as we process each unique image once.
const remap = new Map();
let totalBefore = 0;
let totalAfter = 0;

async function compressOne(url) {
  if (remap.has(url)) return remap.get(url);
  const storagePath = url.slice(publicPrefix.length).split("?")[0];

  const res = await fetch(url);
  if (!res.ok) {
    console.warn(`  ! skip (fetch ${res.status}): ${storagePath}`);
    return null;
  }
  const input = Buffer.from(await res.arrayBuffer());
  const webp = await sharp(input)
    .rotate() // respect EXIF orientation before stripping metadata
    .resize({
      width: MAX_DIMENSION,
      height: MAX_DIMENSION,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: WEBP_QUALITY })
    .toBuffer();

  if (webp.length >= input.length) {
    console.log(
      `  = keep original (webp not smaller): ${storagePath} ${fmtKB(input.length)}`,
    );
    remap.set(url, null);
    return null;
  }

  const newPath = storagePath.replace(/\.(png|jpe?g)$/i, "") + ".webp";
  totalBefore += input.length;
  totalAfter += webp.length;
  console.log(
    `  ~ ${storagePath}  ${fmtKB(input.length)} -> ${fmtKB(webp.length)}  (${newPath})`,
  );

  let newUrl = null;
  if (APPLY) {
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(newPath, webp, {
        contentType: "image/webp",
        upsert: true,
        cacheControl: "31536000",
      });
    if (error) {
      console.warn(`  ! upload failed: ${error.message}`);
      remap.set(url, null);
      return null;
    }
    newUrl = supabase.storage.from(BUCKET).getPublicUrl(newPath).data.publicUrl;
  }
  remap.set(url, newUrl ?? url);
  return newUrl ?? url;
}

// --- profile avatar ----------------------------------------------------
console.log("\n# profile.avatar_url");
const { data: profiles } = await supabase.from("profile").select("id, avatar_url");
for (const p of profiles ?? []) {
  if (!isImage(p.avatar_url)) continue;
  const next = await compressOne(p.avatar_url);
  if (APPLY && next && next !== p.avatar_url) {
    await supabase.from("profile").update({ avatar_url: next }).eq("id", p.id);
  }
}

// --- projects: image_url, hero, media ---------------------------------
console.log("\n# projects");
const { data: projects } = await supabase
  .from("projects")
  .select("id, slug, image_url, hero, media");
for (const proj of projects ?? []) {
  console.log(`- ${proj.slug}`);
  const patch = {};

  if (isImage(proj.image_url)) {
    const next = await compressOne(proj.image_url);
    if (next && next !== proj.image_url) patch.image_url = next;
  }

  if (proj.hero && isImage(proj.hero.url)) {
    const next = await compressOne(proj.hero.url);
    if (next && next !== proj.hero.url)
      patch.hero = { ...proj.hero, url: next };
  }

  if (Array.isArray(proj.media)) {
    let changed = false;
    const media = [];
    for (const m of proj.media) {
      if (m?.type === "image" && isImage(m.url)) {
        const next = await compressOne(m.url);
        if (next && next !== m.url) {
          media.push({ ...m, url: next });
          changed = true;
          continue;
        }
      }
      media.push(m);
    }
    if (changed) patch.media = media;
  }

  if (APPLY && Object.keys(patch).length > 0) {
    const { error } = await supabase.from("projects").update(patch).eq("id", proj.id);
    if (error) console.warn(`  ! db update failed: ${error.message}`);
  }
}

console.log(
  `\n${APPLY ? "APPLIED" : "DRY RUN"} — ${remap.size} images processed, ` +
    `${fmtKB(totalBefore)} -> ${fmtKB(totalAfter)} ` +
    `(saved ${fmtKB(totalBefore - totalAfter)})`,
);
if (!APPLY) console.log("Re-run with --apply to upload and update the database.");
