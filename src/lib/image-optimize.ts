import "server-only";
import sharp from "sharp";

// Server-side image optimizer for files heading into Supabase storage.
//
// Why: we don't want to rely on Vercel/Next's on-demand image
// optimization for things we own. We compress and convert ONCE at upload
// time and serve the optimized bytes from Supabase directly. This is:
//   - cheaper (no per-request transform billing)
//   - faster (no transform latency on first paint)
//   - portable (the file is just a file; works without Vercel)
//
// Defaults are tuned for furniture photography:
//   - WebP when the input was a JPEG/PNG/HEIC bitmap — smaller than
//     either at equivalent quality.
//   - Strip EXIF (orientation, GPS, camera) for privacy + bytes.
//   - Auto-rotate based on EXIF Orientation before stripping, so the
//     output isn't sideways.

export type OptimizeOptions = {
  /** Longest side in pixels. Aspect ratio preserved. */
  maxDimension?: number;
  /** WebP quality (1–100). 80–85 looks indistinguishable for product shots. */
  quality?: number;
  /** Output format. "webp" gives the smallest file; "jpeg" is maximally compatible. */
  format?: "webp" | "jpeg";
};

const DEFAULTS: Required<OptimizeOptions> = {
  maxDimension: 2400,
  quality: 82,
  format: "webp",
};

export type OptimizedFile = {
  buffer: Buffer;
  contentType: string;
  /** Suggested extension WITH dot, e.g. ".webp". */
  extension: string;
  /** Size in bytes for logging / reporting. */
  bytes: number;
  /** True if we re-encoded; false means we passed the input through. */
  optimized: boolean;
};

const BITMAP_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
  "image/avif",
  "image/tiff",
]);

/**
 * Optimize a raw file. Pass any File / Blob from a FormData upload.
 * Returns a fresh Buffer plus the right Content-Type + extension to
 * write into Supabase storage.
 *
 * Non-bitmap files (PDFs, SVGs) pass through unchanged.
 */
export async function optimizeImage(
  file: File,
  opts: OptimizeOptions = {}
): Promise<OptimizedFile> {
  const { maxDimension, quality, format } = { ...DEFAULTS, ...opts };

  const arrayBuf = await file.arrayBuffer();
  const input = Buffer.from(arrayBuf);

  // Pass-through for anything sharp can't handle predictably.
  if (!BITMAP_TYPES.has(file.type)) {
    return {
      buffer: input,
      contentType: file.type || "application/octet-stream",
      extension: extOf(file.name) || "",
      bytes: input.byteLength,
      optimized: false,
    };
  }

  try {
    let pipeline = sharp(input, {
      // Treat truncated/bad files as best-effort instead of throwing.
      failOn: "none",
    })
      .rotate() // honour EXIF orientation, then strip it
      .withMetadata({}); // drop EXIF/IPTC/XMP

    // Only downscale; never upscale a small input.
    pipeline = pipeline.resize({
      width: maxDimension,
      height: maxDimension,
      fit: "inside",
      withoutEnlargement: true,
    });

    pipeline =
      format === "webp"
        ? pipeline.webp({ quality, effort: 4 })
        : pipeline.jpeg({ quality, mozjpeg: true, progressive: true });

    const out = await pipeline.toBuffer();

    // If re-encoding made it bigger (rare — happens with already-tiny
    // inputs), keep the source. Wasted CPU, but storage is what matters.
    if (out.byteLength >= input.byteLength) {
      return {
        buffer: input,
        contentType: file.type,
        extension: extOf(file.name) || ".jpg",
        bytes: input.byteLength,
        optimized: false,
      };
    }

    return {
      buffer: out,
      contentType: format === "webp" ? "image/webp" : "image/jpeg",
      extension: format === "webp" ? ".webp" : ".jpg",
      bytes: out.byteLength,
      optimized: true,
    };
  } catch (err) {
    // Sharp failed (corrupt input, codec missing). Pass the raw bytes
    // through so the order doesn't fail because of an EXIF quirk.
    console.error("[image-optimize] sharp failed:", err);
    return {
      buffer: input,
      contentType: file.type || "application/octet-stream",
      extension: extOf(file.name) || ".jpg",
      bytes: input.byteLength,
      optimized: false,
    };
  }
}

function extOf(name: string): string {
  const m = /\.[a-zA-Z0-9]+$/.exec(name);
  return m ? m[0].toLowerCase() : "";
}
