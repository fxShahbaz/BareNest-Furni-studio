#!/usr/bin/env node
// Regenerate public/logo-mark.png by cropping the icon-only portion of
// public/logo.png (which is already keyed transparent).
import sharp from "sharp";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const SOURCE = path.join(ROOT, "public/logo.png");
const MARK = path.join(ROOT, "public/logo-mark.png");

const img = sharp(SOURCE);
const meta = await img.metadata();
const W = meta.width;
const H = meta.height;

// The icon (house + nest + sapling + ground line) occupies the top
// ~62% of the original image; the rest is the "bare nest" wordmark + underline.
const cropH = Math.round(H * 0.62);

await sharp(SOURCE)
  .extract({ left: 0, top: 0, width: W, height: cropH })
  .png({ compressionLevel: 9 })
  .toFile(MARK);

console.log(`✓ ${path.relative(ROOT, MARK)}  (${W}×${cropH} from ${W}×${H})`);
