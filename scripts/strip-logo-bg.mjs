#!/usr/bin/env node
// Regenerate public/logo-mark.png from public/logo.png (which is already
// keyed transparent). Three steps:
//
//   1. Crop the top portion that contains only the icon — house, nest,
//      sapling, and the ground line under the nest — so the wordmark
//      below ("bare nest") is dropped.
//   2. Trim any remaining transparent border so the icon hugs its bounds.
//   3. Pad to a square with transparent breathing room so the file fits
//      cleanly inside square tiles (navbar mark, popup hero) without the
//      template needing scale-[N] hacks that risk clipping.
import sharp from "sharp";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const SOURCE = path.join(ROOT, "public/logo.png");
const MARK = path.join(ROOT, "public/logo-mark.png");

const meta = await sharp(SOURCE).metadata();
const W = meta.width;
const H = meta.height;

// The icon (house + nest + sapling + ground line) ends around 67% of
// the image height; the "bare nest" wordmark starts just below. Cropping
// at 0.67 captures the full ground line under the nest without picking
// up the tops of the wordmark letters.
const cropH = Math.round(H * 0.67);

// 1 — crop the top portion of the logo.
const cropped = await sharp(SOURCE)
  .extract({ left: 0, top: 0, width: W, height: cropH })
  .png()
  .toBuffer();

// 2 — auto-trim transparent margins (separate pipeline so chained
// extract+trim doesn't trip sharp's bounds check).
const trimmed = await sharp(cropped)
  .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 }, threshold: 1 })
  .png()
  .toBuffer({ resolveWithObject: true });

const { width: tw, height: th } = trimmed.info;

// 3 — square-pad with 12% breathing room around the longest side.
const side = Math.round(Math.max(tw, th) * 1.12);
const left = Math.round((side - tw) / 2);
const top = Math.round((side - th) / 2);

await sharp({
  create: {
    width: side,
    height: side,
    channels: 4,
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  },
})
  .composite([{ input: trimmed.data, left, top }])
  .png({ compressionLevel: 9 })
  .toFile(MARK);

console.log(
  `✓ ${path.relative(ROOT, MARK)}  (${side}×${side} square, icon ${tw}×${th})`
);
