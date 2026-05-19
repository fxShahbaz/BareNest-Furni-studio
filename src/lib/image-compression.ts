// Client-side image compression. Browser-only — uses <canvas> + the
// File / Blob APIs. No dependencies.
//
// Why client-side, not server-side: customers in India often upload over
// patchy mobile networks. Compressing in the browser turns a 6 × 8 MB
// upload (48 MB body) into a 6 × ~400 KB upload (~2.5 MB), cutting wait
// time by ~20× and reducing Supabase storage usage by the same factor.
//
// What it does:
//   1. Loads the file as an <img>
//   2. Downscales to `maxDimension` on the longest side (preserves aspect)
//   3. Re-encodes as JPEG at `quality` (default 0.82)
//   4. Returns a new File. Falls back to the original if the result is
//      larger than the source (rare; happens with already-optimised PNGs).
//
// Non-image files (PDFs, etc.) pass through untouched.

export type CompressOptions = {
  maxDimension?: number; // longest side in pixels
  quality?: number; // 0..1, JPEG quality
  mimeType?: "image/jpeg" | "image/webp";
};

const DEFAULTS: Required<CompressOptions> = {
  maxDimension: 1800,
  quality: 0.82,
  mimeType: "image/jpeg",
};

export async function compressImage(
  file: File,
  opts: CompressOptions = {}
): Promise<File> {
  const { maxDimension, quality, mimeType } = { ...DEFAULTS, ...opts };

  // Pass through anything that isn't an image we can decode in a canvas.
  if (!file.type.startsWith("image/")) return file;
  // SVGs aren't bitmaps; HEIC isn't decodable in most browsers.
  if (file.type === "image/svg+xml" || file.type === "image/heic") {
    return file;
  }

  let url: string | null = null;
  try {
    url = URL.createObjectURL(file);
    const img = await loadImage(url);

    const { width, height } = scaleDown(
      img.naturalWidth,
      img.naturalHeight,
      maxDimension
    );

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file; // can't compress in this browser — pass through
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, 0, 0, width, height);

    const blob = await canvasToBlob(canvas, mimeType, quality);
    if (!blob) return file;

    // Don't replace the source with a larger file. PNG screenshots of
    // text/UI sometimes encode larger as JPEG; keep the original then.
    if (blob.size >= file.size) return file;

    const ext = mimeType === "image/webp" ? "webp" : "jpg";
    const newName = file.name.replace(/\.[a-zA-Z0-9]+$/, "") + `.${ext}`;
    return new File([blob], newName, {
      type: mimeType,
      lastModified: file.lastModified,
    });
  } catch {
    // Any decode failure (corrupt file, unsupported codec) — return source
    return file;
  } finally {
    if (url) URL.revokeObjectURL(url);
  }
}

export async function compressMany(
  files: File[],
  opts: CompressOptions = {}
): Promise<File[]> {
  // Sequential, not parallel: many simultaneous canvas decodes
  // can crash low-end mobile browsers.
  const out: File[] = [];
  for (const f of files) {
    out.push(await compressImage(f, opts));
  }
  return out;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("image decode failed"));
    img.src = src;
  });
}

function scaleDown(w: number, h: number, max: number) {
  if (w <= max && h <= max) return { width: w, height: h };
  const ratio = w >= h ? max / w : max / h;
  return {
    width: Math.round(w * ratio),
    height: Math.round(h * ratio),
  };
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number
): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), type, quality);
  });
}
