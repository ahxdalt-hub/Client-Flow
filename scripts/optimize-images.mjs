/**
 * Re-encodes the photographic backdrops in public/images.
 *
 * Why this exists: `next/image` optimisation is disabled on Cloudflare Workers
 * (no Node image optimiser in the runtime — see next.config.ts), so whatever is
 * in public/images is exactly what the browser downloads. Two of these files
 * shipped at 4000px and ~400 KB, which is most of the homepage's page weight.
 *
 * Rules:
 *  - these images are all decorative backdrops rendered `object-cover` behind
 *    gradient washes, so they tolerate a lower quality than a hero photograph;
 *  - nothing is upscaled;
 *  - originals are kept in `assets/image-originals/` on first run so a change
 *    can be reviewed or reverted.
 *
 * Usage: node scripts/optimize-images.mjs [--dry]
 */
import { mkdir, copyFile, readdir, readFile, stat, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const IMAGES = path.join(ROOT, "public", "images");
const BACKUP = path.join(ROOT, "assets", "image-originals");

/** maxWidth is only applied when the source is wider. */
const PLAN = {
  "flow-art.jpg": { maxWidth: 2400, quality: 80 },
  "desk-dark.jpg": { maxWidth: 1800, quality: 78 },
  "workspace.jpg": { maxWidth: 1600, quality: 78 },
  "meeting.jpg": { maxWidth: 1600, quality: 80 },
  "notes-desk.jpg": { maxWidth: 1600, quality: 80 },
  "desk-warm.jpg": { maxWidth: 1600, quality: 80 },
  "team.jpg": { maxWidth: 1600, quality: 80 },
};

const dry = process.argv.includes("--dry");
const fmt = (n) => `${(n / 1024).toFixed(0)} KB`;

await mkdir(BACKUP, { recursive: true });

let before = 0;
let after = 0;

for (const [file, opts] of Object.entries(PLAN)) {
  const src = path.join(IMAGES, file);
  if (!existsSync(src)) {
    console.log(`skip  ${file} (missing)`);
    continue;
  }

  const original = await stat(src);
  before += original.size;

  // Read into memory first: libvips holds a file handle on the source until
  // the pipeline is consumed, and Windows will not let us replace the file
  // while that handle is open.
  const input = await readFile(src);
  const meta = await sharp(input).metadata();
  const targetWidth = Math.min(meta.width ?? 0, opts.maxWidth);

  const pipeline = sharp(input).rotate();
  if (meta.width && meta.width > opts.maxWidth) {
    pipeline.resize({ width: targetWidth, withoutEnlargement: true });
  }
  pipeline.jpeg({ quality: opts.quality, mozjpeg: true, progressive: true });

  const out = await pipeline.toBuffer();
  after += out.length;

  const pct = Math.round((1 - out.length / original.size) * 100);
  console.log(
    `${file.padEnd(18)} ${fmt(original.size).padStart(8)} -> ${fmt(out.length).padStart(8)}  ` +
      `(-${pct}%)  ${meta.width}x${meta.height} -> ${targetWidth}px`,
  );

  if (!dry) {
    const keep = path.join(BACKUP, file);
    if (!existsSync(keep)) await copyFile(src, keep);
    await writeFile(src, out);
  }
}

const done = await readdir(IMAGES);
console.log(`\nimages in public/images: ${done.length}`);
console.log(`photo total: ${fmt(before)} -> ${fmt(after)} (-${Math.round((1 - after / before) * 100)}%)`);
if (dry) console.log("\n(dry run — nothing written)");
else console.log(`\noriginals backed up to assets/image-originals/`);
