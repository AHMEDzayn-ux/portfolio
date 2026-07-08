/**
 * Generates a small (~800px) WebP thumbnail for each project's hero image and
 * stores its URL in `projects.hero.card_url`. Project cards render at ~400px,
 * so the full 1536px hero was ~4x oversized for that view; the card now loads
 * the thumbnail while the detail-page hero keeps the full-size image.
 *
 * Safe + reversible: thumbnails are written to new `-card.webp` paths; only
 * the `card_url` field is added to the hero JSON (originals untouched).
 *
 * Usage (from repo root):
 *   node scripts/generate-card-thumbs.mjs           # dry run
 *   node scripts/generate-card-thumbs.mjs --apply   # upload + update DB
 */
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";

const APPLY = process.argv.includes("--apply");
const CARD_WIDTH = 800; // covers a ~400px card at 2x DPR
const WEBP_QUALITY = 78;
const BUCKET = "public-assets";

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
const isStorageImage = (url) =>
  typeof url === "string" &&
  url.startsWith(publicPrefix) &&
  /\.(png|jpe?g|webp)$/i.test(url);
const fmtKB = (n) => `${(n / 1024).toFixed(0)}KB`;

let totalBefore = 0;
let totalAfter = 0;

const { data: projects } = await supabase
  .from("projects")
  .select("id, slug, hero");

for (const proj of projects ?? []) {
  const hero = proj.hero;
  if (!hero || hero.type !== "image" || !isStorageImage(hero.url)) {
    console.log(`- ${proj.slug}: no hero image, skip`);
    continue;
  }
  if (hero.card_url) {
    console.log(`- ${proj.slug}: card_url already set, skip`);
    continue;
  }

  const storagePath = hero.url.slice(publicPrefix.length).split("?")[0];
  const res = await fetch(hero.url);
  if (!res.ok) {
    console.warn(`- ${proj.slug}: fetch ${res.status}, skip`);
    continue;
  }
  const input = Buffer.from(await res.arrayBuffer());
  const thumb = await sharp(input)
    .rotate()
    .resize({ width: CARD_WIDTH, withoutEnlargement: true })
    .webp({ quality: WEBP_QUALITY })
    .toBuffer();

  const cardPath = storagePath.replace(/\.(png|jpe?g|webp)$/i, "") + "-card.webp";
  totalBefore += input.length;
  totalAfter += thumb.length;
  console.log(
    `- ${proj.slug}: ${fmtKB(input.length)} -> ${fmtKB(thumb.length)} (${cardPath})`,
  );

  if (APPLY) {
    const { error: upErr } = await supabase.storage
      .from(BUCKET)
      .upload(cardPath, thumb, {
        contentType: "image/webp",
        upsert: true,
        cacheControl: "31536000",
      });
    if (upErr) {
      console.warn(`    ! upload failed: ${upErr.message}`);
      continue;
    }
    const cardUrl = supabase.storage.from(BUCKET).getPublicUrl(cardPath).data
      .publicUrl;
    const { error: dbErr } = await supabase
      .from("projects")
      .update({ hero: { ...hero, card_url: cardUrl } })
      .eq("id", proj.id);
    if (dbErr) console.warn(`    ! db update failed: ${dbErr.message}`);
  }
}

console.log(
  `\n${APPLY ? "APPLIED" : "DRY RUN"} — card thumbs ${fmtKB(totalBefore)} -> ${fmtKB(totalAfter)} ` +
    `(saved ${fmtKB(totalBefore - totalAfter)})`,
);
if (!APPLY) console.log("Re-run with --apply to upload and update the database.");
