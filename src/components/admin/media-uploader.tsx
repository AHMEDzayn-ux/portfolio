"use client";

import { useRef, useState } from "react";
import { Film, ImagePlus, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { compressImage } from "@/lib/compress-image";
import type { ProjectMedia } from "@/lib/data/types";

const MAX_FILE_MB = 50;

/**
 * Photo/video gallery manager for the project form. Uploads go straight from
 * the browser to the public-assets bucket (no server action body limits), so
 * large videos work. Emits the updated media list to the parent form.
 */
export function MediaUploader({
  media,
  onChange,
  maxItems,
  addLabel = "Add photos / videos",
}: {
  media: ProjectMedia[];
  onChange: (media: ProjectMedia[]) => void;
  maxItems?: number;
  addLabel?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    const supabase = createClient();
    const added: ProjectMedia[] = [];

    for (const original of Array.from(files)) {
      const type = original.type.startsWith("video/")
        ? ("video" as const)
        : original.type.startsWith("image/")
          ? ("image" as const)
          : null;
      if (!type) {
        toast.error(`${original.name}: only images and videos are supported.`);
        continue;
      }

      // Downscale + WebP-encode images in the browser so we don't ship
      // multi-MB screenshots to storage (and to every visitor).
      const file = type === "image" ? await compressImage(original) : original;

      if (file.size > MAX_FILE_MB * 1024 * 1024) {
        toast.error(`${file.name} is larger than ${MAX_FILE_MB}MB.`);
        continue;
      }

      const path = `projects/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
      const { error } = await supabase.storage
        .from("public-assets")
        // Filenames are timestamp-prefixed and never overwritten, so the bytes
        // at a URL are immutable — cache them for a year instead of the 1h
        // Supabase default.
        .upload(path, file, { upsert: true, cacheControl: "31536000" });
      if (error) {
        toast.error(`${file.name}: ${error.message}`);
        continue;
      }
      const { data } = supabase.storage.from("public-assets").getPublicUrl(path);
      added.push({ url: data.publicUrl, type });
    }

    if (added.length > 0) {
      const next = [...media, ...added];
      onChange(maxItems ? next.slice(-maxItems) : next);
      toast.success(
        added.length === 1 ? "File uploaded." : `${added.length} files uploaded.`
      );
    }
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  function removeAt(index: number) {
    onChange(media.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/*"
        multiple={maxItems !== 1}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {media.length > 0 && (
        <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {media.map((item, index) => (
            <li
              key={item.url}
              className="group relative aspect-video overflow-hidden rounded-lg border border-border/60 bg-secondary/40"
            >
              {item.type === "image" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.url}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
              ) : (
                <>
                  <video
                    src={item.url}
                    muted
                    playsInline
                    preload="metadata"
                    className="h-full w-full object-cover"
                  />
                  <Film className="absolute bottom-1.5 left-1.5 h-4 w-4 text-white drop-shadow" />
                </>
              )}
              <button
                type="button"
                aria-label="Remove media"
                onClick={() => removeAt(index)}
                className="absolute right-1.5 top-1.5 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity hover:bg-black/80 group-hover:opacity-100"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="flex items-center gap-2 rounded-lg border border-dashed border-border px-4 py-2.5 text-sm text-foreground/70 transition-colors hover:border-brand/60 hover:text-brand disabled:opacity-60"
      >
        {uploading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <ImagePlus className="h-4 w-4" />
        )}
        {uploading ? "Uploading…" : addLabel}
      </button>
    </div>
  );
}
