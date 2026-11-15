// Makes the smaller copies of every picture and the list the site reads sizes from.
//
// How to add a picture: save it as .webp in public/media/<project>/ at its best quality
// (up to 2400 px wide), then run:  npm run images
//
// For every picture this writes copies at 640, 1024 and 1600 px wide (only sizes smaller than
// the picture itself), named like  photo.640.webp , and updates src/data/media.json with the
// real width and height. Browsers then load the copy that fits the screen.
import { readdir, stat, writeFile, unlink } from "node:fs/promises";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

let sharp;
try { sharp = (await import("sharp")).default; }
catch { console.error("sharp is missing. Run: npm install"); process.exit(1); }

const ROOT = fileURLToPath(new URL("../public/media/", import.meta.url));
const OUT = fileURLToPath(new URL("../src/data/media.json", import.meta.url));
const WIDTHS = [640, 1024, 1600];
const isCopy = (f) => /\.\d+\.webp$/.test(f);

async function walk(dir) {
  const out = [];
  for (const name of (await readdir(dir)).sort()) {
    const p = join(dir, name);
    if ((await stat(p)).isDirectory()) out.push(...(await walk(p)));
    else if (name.endsWith(".webp")) out.push(p);
  }
  return out;
}

const files = await walk(ROOT);
const masters = files.filter((f) => !isCopy(f));
const wanted = new Set();
const manifest = {};

for (const file of masters) {
  const key = relative(ROOT, file).split("\\").join("/");
  const { width, height } = await sharp(file).metadata();
  const made = [];
  for (const w of WIDTHS) {
    if (w > width / 1.2) continue; // too close to the original to be worth a copy
    const copy = file.replace(/\.webp$/, `.${w}.webp`);
    wanted.add(copy);
    made.push(w);
    try { if ((await stat(copy)).mtimeMs >= (await stat(file)).mtimeMs) continue; } catch { /* not made yet */ }
    await sharp(file).resize({ width: w }).webp({ quality: 80, effort: 5 }).toFile(copy);
    console.log("made", relative(ROOT, copy));
  }
  manifest[key] = { w: width, h: height, v: made };
}

// copies whose picture is gone or got smaller
for (const f of files.filter(isCopy)) if (!wanted.has(f)) { await unlink(f); console.log("removed", relative(ROOT, f)); }

await writeFile(OUT, JSON.stringify(manifest, null, 1) + "\n");
console.log(`${masters.length} pictures listed in src/data/media.json`);
