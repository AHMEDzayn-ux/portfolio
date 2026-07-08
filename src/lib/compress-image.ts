/**
 * Downscales and re-encodes an image File to WebP in the browser before
 * upload. Portfolio screenshots are routinely 1500px-wide, multi-MB PNGs but
 * never display larger than ~750px, so shrinking to a sane max dimension and
 * switching to WebP typically turns a ~2MB PNG into a ~150KB file with no
 * visible quality loss.
 *
 * Returns the original file untouched when it can't safely be re-encoded:
 * non-images, animated GIFs (canvas would flatten them to one frame), SVGs
 * (vector), or if anything in the decode/encode pipeline fails.
 */
const MAX_DIMENSION = 1920;
const WEBP_QUALITY = 0.82;

export async function compressImage(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) return file;
  // GIFs may be animated and SVGs are vector — leave both alone.
  if (file.type === "image/gif" || file.type === "image/svg+xml") return file;

  try {
    const bitmap = await createImageBitmap(file);
    const { width, height } = bitmap;
    const scale = Math.min(1, MAX_DIMENSION / Math.max(width, height));
    const targetW = Math.round(width * scale);
    const targetH = Math.round(height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      bitmap.close();
      return file;
    }
    ctx.drawImage(bitmap, 0, 0, targetW, targetH);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/webp", WEBP_QUALITY),
    );
    // Bail if encoding failed or somehow produced a larger file.
    if (!blob || blob.size >= file.size) return file;

    const name = file.name.replace(/\.[^.]+$/, "") + ".webp";
    return new File([blob], name, { type: "image/webp" });
  } catch {
    return file;
  }
}
