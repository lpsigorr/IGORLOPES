// Pictures: real sizes and the smaller copies come from src/data/media.json (made by `npm run images`).
import manifest from "./data/media.json";
import { media } from "./config";

type Entry = { w: number; h: number; v: number[] };
const list = manifest as Record<string, Entry>;

/** Everything an <img> needs for a picture in public/media: the right copy for each screen, and its true size. */
export function pic(src: string, sizes = "100vw") {
  const m = list[src];
  if (!m) throw new Error(`Picture "${src}" is not in src/data/media.json. Run: npm run images`);
  const srcset = m.v.length
    ? [...m.v.map((w) => `${media(src.replace(/\.webp$/, `.${w}.webp`))} ${w}w`), `${media(src)} ${m.w}w`].join(", ")
    : undefined;
  return { src: media(src), srcset, sizes: srcset ? sizes : undefined, width: m.w, height: m.h, ar: m.w / m.h };
}
