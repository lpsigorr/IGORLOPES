/* The motion layer, shared by every page.
   - Smooth scroll (Lenis) on computers; phones keep their native scroll.
   - Pinned sequences ([data-seq]) expose progress as --p, plus named ramps
     (data-ramps="name:start:end, ...") as CSS variables between 0 and 1.
   - Items with [data-fly] come out of the middle of the screen and are always kept whole on screen.
   - Scroll speed as --v (signed) and --av (absolute), 0 to 1, set on the sequence only.
   - Custom cursor, hover previews, header colour per section, videos that only play while visible.
   - prefers-reduced-motion: no pinning, no flying, everything still.
   One clock runs everything (GSAP's ticker), and only transform, opacity and clipping change
   while scrolling, so the page stays smooth. */
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
gsap.registerPlugin(ScrollTrigger, SplitText);

const root = document.documentElement;
const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
// the page head sets these before the first paint; repeated here in case that script was blocked
root.classList.add(reduce ? "is-still" : "is-moving");
if (fine) root.classList.add("has-mouse");

const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (e0: number, e1: number, x: number) => {
  const t = clamp((x - e0) / (e1 - e0), 0, 1);
  return t * t * (3 - 2 * t);
};

/* ---------- smooth scroll ---------- */
const lenis = !reduce && fine ? new Lenis({ lerp: 0.1 }) : null;
document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((a) => {
  a.addEventListener("click", (e) => {
    const id = a.getAttribute("href") || "";
    if (id.length < 2) return;
    const el = document.querySelector<HTMLElement>(id);
    if (!el) return;
    e.preventDefault();
    if (lenis) lenis.scrollTo(el);
    else el.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
    el.focus({ preventScroll: true });
  });
});

/* ---------- sequences ---------- */
type Fly = { el: HTMLElement; word: boolean; x: number; y: number; r: number; a: number; b: number; w: number; h: number; vis: boolean | null };
type Seq = { el: HTMLElement; stage: HTMLElement | null; sw: number; sh: number; wordW: number; wordH: number; ramps: { name: string; a: number; b: number; last: string }[]; items: Fly[]; p: number; top: number; h: number; tl?: gsap.core.Timeline };

// the width without the scrollbar, so nothing is measured against space that is not there
let vw = root.clientWidth, vh = window.innerHeight;
const seqs: Seq[] = Array.from(document.querySelectorAll<HTMLElement>("[data-seq]")).map((el) => {
  const ramps = (el.dataset.ramps || "").split(",").map((s) => {
    const p = s.trim().split(":");
    return p.length === 3 ? { name: p[0], a: parseFloat(p[1]), b: parseFloat(p[2]), last: "" } : null;
  }).filter(Boolean) as Seq["ramps"];
  const items = Array.from(el.querySelectorAll<HTMLElement>("[data-fly]")).map((it) => {
    const o: Record<string, number> = {};
    (it.dataset.fly || "").split(";").forEach((kv) => {
      const [k, v] = kv.split("=");
      if (k && v !== undefined) o[k.trim()] = parseFloat(v);
    });
    return { el: it, word: !!o.word, x: o.x || 0, y: o.y || 0, r: o.r || 0, a: o.a || 0, b: isNaN(o.b) ? 1 : o.b, w: 0, h: 0, vis: null } as Fly;
  });
  return { el, stage: el.querySelector<HTMLElement>(".stage"), sw: 0, sh: 0, wordW: 0, wordH: 0, ramps, items, p: -1, top: 0, h: 1 };
});

// Text that must span the screen exactly at its widest ([data-fit="<font-stretch at its widest>"]).
const fits = Array.from(document.querySelectorAll<HTMLElement>("[data-fit]"));
function fitText() {
  const side = clamp(vw * 0.022, 16, 32); // same as --side in the styles
  fits.forEach((el) => {
    el.style.fontSize = "100px";
    el.style.fontStretch = el.dataset.fit + "%";
    const w = el.offsetWidth;
    el.style.fontStretch = "";
    if (w > 0) el.style.fontSize = ((100 * (vw - side * 2) * 0.955) / w).toFixed(2) + "px";
  });
}

function measure() {
  vw = root.clientWidth; vh = window.innerHeight;
  if (!reduce) fitText();
  const y = window.scrollY;
  seqs.forEach((s) => {
    s.top = s.el.getBoundingClientRect().top + y;
    s.h = Math.max(1, s.el.offsetHeight - vh);
    s.sw = s.stage?.offsetWidth || vw; s.sh = s.stage?.offsetHeight || vh;
    s.items.forEach((it) => { it.w = it.el.offsetWidth; it.h = it.el.offsetHeight; });
    const words = s.items.filter((it) => it.word);
    s.wordW = Math.max(0, ...words.map((it) => it.w)); s.wordH = Math.max(0, ...words.map((it) => it.h));
    s.p = -1;
  });
  setupWiden();
  themeDirty = true;
  if (built) { ScrollTrigger.refresh(); redraws.forEach((f) => f()); }
}

/* The sequence is one GSAP timeline, scrubbed by the scroll with a short catch-up so it glides
   instead of jumping with every wheel step. Pieces open like a curtain where they belong (no zoom),
   drift upward at their own pace, and close the same way. Words and the name rise letter by letter
   out of their own line. Everything is placed so it is whole on screen and never crosses the word. */
const PAD = 12;
const redraws: (() => void)[] = [];
function spot(it: Fly, q: Seq, drift: number) {
  const sw = q.sw, sh = q.sh, rot = it.r * 0.6;
  const sin = Math.abs(Math.sin((rot * Math.PI) / 180)), cos = Math.cos((rot * Math.PI) / 180);
  const bw = it.w * cos + it.h * sin, bh = it.h * cos + it.w * sin;
  const roomX = Math.max(0, sw / 2 - bw / 2 - PAD), roomY = Math.max(0, sh / 2 - bh / 2 - PAD);
  const x = clamp(it.x * sw * 0.5, -roomX, roomX);
  let y = clamp(it.y * sh * 0.5 + drift, -roomY, roomY);
  if (q.wordH && Math.abs(x) - bw / 2 < q.wordW / 2) {
    const clear = q.wordH / 2 + bh / 2 + PAD;
    const side = it.y >= 0 ? 1 : -1;
    if (side * y < clear) y = side * Math.min(clear, roomY);
  }
  return { x, y, rot };
}

function build(q: Seq) {
  const tl = gsap.timeline({ paused: true, defaults: { ease: "none" } });
  tl.set({}, {}, 1); // the timeline runs from 0 to 1, like the scroll

  /* The green cube: it turns slowly on its own (and leans toward the mouse). The first bit of scroll
     straightens it to face you and brings it closer; then its front face opens into the whole screen. */
  const flood = q.el.querySelector<HTMLElement>(".flood");
  const cube = q.el.querySelector<HTMLElement>(".cube");
  const spin = cube?.querySelector<HTMLElement>(".cube__spin");
  if (flood && cube && spin) {
    const P = 900, GROW = vw < 700 ? 2.6 : 3.2; // perspective, and how much bigger it gets
    const c = { v: 0 }, f = { v: 0 };
    cube.style.setProperty("--g", String(GROW));
    let ax = -22, ay = 32, tx = 0, ty = 0, last = 0;
    const cubeAt = () => {
      const rem = parseFloat(getComputedStyle(root).fontSize) || 16;
      const size = cube.offsetWidth || 56;
      const off = parseFloat(getComputedStyle(cube).getPropertyValue("--cy")) || 6; // in rem, same as the CSS
      return { cx: q.sw / 2, cy: q.sh / 2 + off * rem, size };
    };
    const place = () => {
      const k = c.v, s = 1 + (GROW - 1) * k * k * (3 - 2 * k);
      // the turn unwinds to zero, so the front face ends flat and square
      const nx = ((ax % 360) + 540) % 360 - 180, ny = ((ay % 360) + 540) % 360 - 180;
      const rx = (nx + ty) * (1 - k), ry = (ny + tx) * (1 - k);
      const z = (s / GROW).toFixed(4);
      spin.style.transform = `scale3d(${z},${z},${z}) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`;
    };
    const draw = () => {
      const { cx, cy, size } = cubeAt();
      // where the front face appears when it is flat: its size, enlarged by the perspective
      const half = (size * GROW) / 2, r = half * (P / (P - half));
      const k = 1 - f.v;
      flood.style.clipPath = `inset(${((cy - r) * k).toFixed(1)}px ${((q.sw - cx - r) * k).toFixed(1)}px ${((q.sh - cy - r) * k).toFixed(1)}px ${((cx - r) * k).toFixed(1)}px)`;
      flood.style.visibility = f.v > 0 ? "visible" : "hidden";
      cube.style.visibility = f.v > 0 ? "hidden" : "visible";
    };
    redraws.push(draw, place);
    tl.to(c, { v: 1, ease: "power2.inOut", duration: 0.05, onUpdate: place }, 0);
    tl.to(f, { v: 1, ease: "expo.inOut", duration: 0.08, onUpdate: draw }, 0.05);
    draw(); place();
    // idle turn, only while the cube is on screen and not yet straightened
    gsap.ticker.add((t) => {
      const dt = last ? Math.min(64, t * 1000 - last) : 16; last = t * 1000;
      if (c.v > 0.001 || f.v > 0) return;
      ay += dt * 0.012; ax = -22 + Math.sin(t * 0.5) * 10;
      if (fine) { tx = lerp(tx, ((mx / vw) - 0.5) * 30, 0.06); ty = lerp(ty, -((my / vh) - 0.5) * 22, 0.06); }
      place();
    });
  }

  // the name rises letter by letter, holds, then leaves upward
  const giant = q.el.querySelector<HTMLElement>(".giant");
  if (giant) {
    const chars = SplitText.create(giant, { type: "chars" }).chars;
    tl.fromTo(chars, { yPercent: 140 }, { yPercent: 0, ease: "expo.out", duration: 0.12, stagger: { amount: 0.05 } }, 0.07);
    tl.to(chars, { yPercent: -140, ease: "expo.in", duration: 0.045, stagger: { amount: 0.02 } }, 0.215);
  }

  for (const it of q.items) {
    const a = it.a, len = it.b - it.a;
    if (it.word) {
      const chars = SplitText.create(it.el, { type: "chars" }).chars;
      tl.set(it.el, { autoAlpha: 1 }, a);
      tl.fromTo(chars, { yPercent: 140 }, { yPercent: 0, ease: "expo.out", duration: len * 0.4, stagger: { amount: len * 0.12 } }, a);
      tl.to(chars, { yPercent: -140, ease: "expo.in", duration: len * 0.24, stagger: { amount: len * 0.06 } }, a + len * 0.74);
      tl.set(it.el, { autoAlpha: 0 }, it.b);
      continue;
    }
    const media = it.el.querySelector(".fly__m > *");
    const caps = it.el.querySelectorAll("figcaption span");
    // the position is worked out from the screen as it is now, so a resize never leaves a piece behind
    const m = { v: 0 };
    const draw = () => {
      const d = q.sh * 0.07 * (1 - 2 * m.v); // drifts upward while it is on screen
      const o = spot(it, q, d);
      gsap.set(it.el, { xPercent: -50, yPercent: -50, x: o.x, y: o.y, rotation: o.rot });
    };
    draw(); redraws.push(draw);
    tl.set(it.el, { autoAlpha: 1 }, a);
    tl.to(m, { v: 1, duration: len, onUpdate: draw }, a);
    tl.fromTo(it.el, { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", ease: "power4.out", duration: len * 0.34 }, a);
    if (media) tl.fromTo(media, { scale: 1.32 }, { scale: 1, ease: "power3.out", duration: len * 0.6 }, a);
    if (caps.length) tl.fromTo(caps, { yPercent: 110 }, { yPercent: 0, ease: "expo.out", duration: len * 0.2, stagger: len * 0.03 }, a + len * 0.16);
    tl.to(it.el, { clipPath: "inset(0% 0% 100% 0%)", ease: "power3.in", duration: len * 0.22 }, a + len * 0.78);
    if (media) tl.to(media, { scale: 1.08, ease: "power3.in", duration: len * 0.22 }, a + len * 0.78);
    tl.set(it.el, { autoAlpha: 0 }, it.b);
  }

  q.tl = tl;
  ScrollTrigger.create({
    trigger: q.el, start: "top top", end: "bottom bottom",
    animation: tl, scrub: fine ? 1.1 : 1.3,
  });
}

// the ramps (CSS variables) follow the smoothed timeline, not the raw scroll
function updateSeq(s: Seq) {
  const p = s.tl ? s.tl.progress() : 0;
  if (Math.abs(p - s.p) < 0.0003) return;
  s.p = p;
  s.el.style.setProperty("--p", p.toFixed(4));
  for (const r of s.ramps) {
    const val = smooth(r.a, r.b, p).toFixed(3);
    if (val !== r.last) { s.el.style.setProperty("--" + r.name, val); r.last = val; }
  }
}

/* ---------- display type that widens on hover ([data-widen]) ----------
   The text is first locked into the lines it already has, so widening can never re-wrap it,
   and it widens only as far as its space allows, so it can never run into its neighbour.
   data-widen: "self" (its own box is the limit), "parent" (its parent's width), "beside" (parent minus the element before it). */
const WIDE = 8; // points of font width, the same everywhere
const wideners = Array.from(document.querySelectorAll<HTMLElement>("[data-widen]"));
function setupWiden() {
  if (!fine || reduce) return;
  const range = document.createRange();
  for (const el of wideners) {
    const text = el.dataset.text ?? (el.dataset.text = (el.textContent || "").trim().replace(/\s+/g, " "));
    el.textContent = text;
    el.style.removeProperty("--wide-to");
    const node = el.firstChild as Text | null;
    if (!node || !el.offsetWidth) continue;
    // 1. which words share a line right now
    const lines: string[][] = [];
    let pos = 0, lastTop = NaN;
    for (const word of text.split(" ")) {
      const at = text.indexOf(word, pos);
      range.setStart(node, at); range.setEnd(node, at + word.length);
      const top = Math.round(range.getBoundingClientRect().top);
      if (isNaN(lastTop) || Math.abs(top - lastTop) > 2) lines.push([]);
      lines[lines.length - 1].push(word);
      lastTop = top; pos = at + word.length;
    }
    el.textContent = "";
    const spans = lines.map((l, n) => {
      const sp = document.createElement("span");
      sp.className = "ln";
      sp.textContent = l.join(" ");
      el.append(sp);
      if (n < lines.length - 1) el.append(" ");
      return sp;
    });
    // 2. how far it may widen
    const base = parseFloat(getComputedStyle(el).fontStretch) || 100;
    const mode = el.dataset.widen;
    const parent = el.parentElement!;
    let room = el.clientWidth;
    if (mode === "parent" || mode === "beside") {
      const cs = getComputedStyle(parent);
      room = parent.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      const prev = el.previousElementSibling as HTMLElement | null;
      if (mode === "beside" && prev) room -= prev.offsetWidth + (parseFloat(cs.columnGap) || 0);
    }
    room -= vw * 0.012; // a little air, and the small slide some of them make
    const widest = (stretch: number) => {
      el.style.fontStretch = stretch + "%";
      return Math.max(...spans.map((sp) => { range.selectNodeContents(sp); return range.getBoundingClientRect().width; }));
    };
    el.style.transition = "none";
    const w0 = widest(base), w1 = widest(base + WIDE);
    el.style.fontStretch = "";
    void el.offsetWidth;
    el.style.transition = "";
    const to = w1 <= room ? base + WIDE : base + WIDE * clamp((room - w0) / Math.max(1, w1 - w0), 0, 1);
    el.style.setProperty("--wide-to", to.toFixed(1) + "%");
  }
}

/* ---------- cursor ----------
   A dot that sits exactly on the pointer (no delay). It remembers where it was across page loads,
   and reads what is under it to stay visible: dark on light, light on dark or green, ringed over pictures. */
const POS_KEY = "il-cursor";
let mx = vw / 2, my = vh / 2, seen = false, cursorDirty = true;
try {
  const saved = JSON.parse(sessionStorage.getItem(POS_KEY) || "null");
  if (Array.isArray(saved)) { mx = clamp(saved[0], 0, vw); my = clamp(saved[1], 0, vh); seen = true; }
} catch { /* storage can be blocked; the cursor simply waits for the first move */ }
let cur: HTMLElement | null = null, curLabel: HTMLElement | null = null, curRing: HTMLElement | null = null;
let rx = mx, ry = my; // the ring trails the dot
const moveCursor = () => { if (cur) cur.style.transform = `translate3d(${mx}px,${my}px,0)`; };
if (fine && !reduce) {
  cur = document.createElement("div");
  cur.className = "cur";
  cur.setAttribute("aria-hidden", "true");
  cur.innerHTML = '<span class="cur__ring"></span><span class="cur__dot"></span><span class="cur__label"></span>';
  document.body.appendChild(cur);
  root.classList.add("has-cursor"); // only now is the system pointer hidden
  curLabel = cur.querySelector(".cur__label");
  curRing = cur.querySelector(".cur__ring");
  if (seen) { cur.classList.add("is-on"); moveCursor(); }
  document.addEventListener("pointermove", (e) => {
    if (e.pointerType === "touch") return;
    mx = e.clientX; my = e.clientY; seen = true; cursorDirty = true;
    moveCursor();
    cur!.classList.add("is-on");
  }, { passive: true });
  document.addEventListener("pointerover", (e) => {
    const target = e.target as Element;
    const link = target.closest?.("a, button, summary, label, select, [data-cursor]") as HTMLElement | null;
    cur!.classList.toggle("is-link", !!link);
    const label = link?.getAttribute("data-cursor") || "";
    if (label) curLabel!.textContent = label;
    cur!.classList.toggle("has-label", !!label);
    cur!.classList.toggle("is-typing", !!target.closest?.("input, textarea"));
  }, { passive: true });
  root.addEventListener("pointerleave", () => cur!.classList.remove("is-on"));
  document.addEventListener("pointerdown", () => cur!.classList.add("is-down"));
  document.addEventListener("pointerup", () => cur!.classList.remove("is-down"));
  const save = () => { if (!seen) return; try { sessionStorage.setItem(POS_KEY, JSON.stringify([Math.round(mx), Math.round(my)])); } catch { /* ignore */ } };
  window.addEventListener("pagehide", save);
}

function rampOn(el: HTMLElement): boolean {
  const sw = el.dataset.themeSwitch;
  if (!sw) return false;
  const [name, at] = sw.split(":");
  return (parseFloat(el.style.getPropertyValue("--" + name)) || 0) > parseFloat(at);
}
function toneAt(x: number, y: number): "light" | "dark" | "media" {
  const el = document.elementFromPoint(x, y) as HTMLElement | null;
  if (!el) return "light";
  if (el.closest("img, video, canvas, .browser, .phone")) return "media";
  const sw = el.closest<HTMLElement>("[data-theme-switch]");
  if (sw && rampOn(sw)) return "dark";
  for (let n: HTMLElement | null = el; n; n = n.parentElement) {
    const m = getComputedStyle(n).backgroundColor.match(/[\d.]+/g);
    if (!m) continue;
    const [r, g, b, a = "1"] = m;
    if (parseFloat(a) < 0.5) continue;
    return (0.299 * +r + 0.587 * +g + 0.114 * +b) / 255 < 0.55 ? "dark" : "light";
  }
  return "light";
}
let curTone = "";
function updateCursorTone() {
  if (!cur || !seen) return;
  const tone = toneAt(mx, my);
  if (tone === curTone) return;
  cur.classList.toggle("on-dark", tone === "dark");
  cur.classList.toggle("on-media", tone === "media");
  curTone = tone;
}

/* ---------- hover previews ---------- */
const pv = document.querySelector<HTMLElement>(".preview");
let px = mx, py = my, pvOn = false, pvW = 0, pvH = 0;
if (pv && fine) {
  document.querySelectorAll<HTMLElement>("[data-preview]").forEach((rowEl) => {
    const key = rowEl.dataset.preview;
    rowEl.addEventListener("pointerenter", () => {
      if (!pvOn) { px = mx; py = my; }
      pvOn = true;
      pv.classList.add("is-on");
      Array.from(pv.children).forEach((c) => {
        const on = (c as HTMLElement).dataset.key === key;
        c.classList.toggle("is-on", on);
        if (on) { pvW = (c as HTMLElement).offsetWidth; pvH = (c as HTMLElement).offsetHeight; }
        if (c instanceof HTMLVideoElement) { if (on) c.play().catch(() => {}); else c.pause(); }
      });
    });
    rowEl.addEventListener("pointerleave", () => { pvOn = false; pv.classList.remove("is-on"); });
  });
}

/* ---------- videos play only while visible ---------- */
const vids = document.querySelectorAll<HTMLVideoElement>("video[data-autoplay]");
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      const v = en.target as HTMLVideoElement;
      if (en.isIntersecting && !reduce) v.play().catch(() => {});
      else v.pause();
    });
  }, { threshold: 0.05 });
  vids.forEach((v) => io.observe(v));
}

/* ---------- reveal once in view ---------- */
const reveals = document.querySelectorAll<HTMLElement>("[data-reveal]");
if ("IntersectionObserver" in window && !reduce) {
  const rv = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("is-in"); rv.unobserve(en.target); } });
  }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
  reveals.forEach((el) => rv.observe(el));
} else reveals.forEach((el) => el.classList.add("is-in"));

/* ---------- header colour follows the section under it ---------- */
const themed = Array.from(document.querySelectorAll<HTMLElement>("[data-theme]")).filter((el) => el !== root);
let curTheme: string | null = null, curBg = "", curBare: boolean | null = null, themeDirty = true;
function updateTheme() {
  const y = 32;
  let th: string | null = null, bare = false, bg = "";
  for (const el of themed) {
    const r = el.getBoundingClientRect();
    if (r.top <= y && r.bottom > y) {
      th = el.dataset.theme || null;
      bare = el.hasAttribute("data-bare");
      const c = getComputedStyle(el).backgroundColor;
      if (c && c !== "transparent" && !c.endsWith(", 0)")) bg = c;
      const sw = el.dataset.themeSwitch;
      if (sw && rampOn(el)) th = sw.split(":")[2];
    }
  }
  if (th && th !== curTheme) { root.dataset.theme = th; curTheme = th; }
  if (bare !== curBare) { root.classList.toggle("top-bare", bare); curBare = bare; }
  if (bg && bg !== curBg) { root.style.setProperty("--top-bg", bg); curBg = bg; }
}

/* ---------- mobile menu ---------- */
const menuBtn = document.querySelector<HTMLButtonElement>(".top__menu");
function setMenu(open: boolean) {
  if (!menuBtn) return;
  menuBtn.setAttribute("aria-expanded", String(open));
  root.classList.toggle("menu-open", open);
  if (lenis) open ? lenis.stop() : lenis.start();
}
if (menuBtn) {
  menuBtn.addEventListener("click", () => setMenu(menuBtn.getAttribute("aria-expanded") !== "true"));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && root.classList.contains("menu-open")) { setMenu(false); menuBtn.focus(); } });
  window.matchMedia("(min-width: 760px)").addEventListener("change", (e) => { if (e.matches) setMenu(false); });
}

/* ---------- the one clock ---------- */
let lastY = -1, v = 0, lastV = "", lastAv = "", tick = 0;
function frame(time: number) {
  lenis?.raf(time);
  const y = window.scrollY;
  const dy = lastY < 0 ? 0 : y - lastY;
  const moved = y !== lastY;
  lastY = y;

  if (seqs.length) {
    v = lerp(v, clamp(dy / 60, -1, 1), 0.12);
    if (Math.abs(v) < 0.002) v = 0;
    const sv = v.toFixed(2), sav = Math.abs(v).toFixed(2);
    if (sv !== lastV || sav !== lastAv) {
      for (const s of seqs) { s.el.style.setProperty("--v", sv); s.el.style.setProperty("--av", sav); }
      lastV = sv; lastAv = sav;
    }
    for (const s of seqs) updateSeq(s);
  }

  if (moved) {
    // header: slides away while scrolling down, comes back on the way up
    if (y < 120) root.classList.remove("top-away", "is-scrolled");
    else if (!root.classList.contains("menu-open")) {
      root.classList.add("is-scrolled");
      if (dy > 3) root.classList.add("top-away");
      else if (dy < -3) root.classList.remove("top-away");
    }
    themeDirty = true; cursorDirty = true;
  }
  tick++;
  if (themeDirty && tick % 2 === 0) { updateTheme(); themeDirty = false; }
  if (cursorDirty && tick % 3 === 0) { updateCursorTone(); cursorDirty = false; }

  if (curRing && (Math.abs(mx - rx) > 0.2 || Math.abs(my - ry) > 0.2)) {
    rx = lerp(rx, mx, 0.2); ry = lerp(ry, my, 0.2);
    curRing.style.transform = `translate3d(${(rx - mx).toFixed(1)}px,${(ry - my).toFixed(1)}px,0)`;
  }
  if (pv && (pvOn || Math.abs(mx - px) > 0.5 || Math.abs(my - py) > 0.5)) {
    px = lerp(px, mx, 0.16); py = lerp(py, my, 0.16);
    const tilt = clamp((mx - px) * 0.06, -8, 8);
    // the picture hangs from the cursor at a third of its height; it never leaves the screen
    const bx = clamp(px, pvW / 2 + PAD, Math.max(pvW / 2 + PAD, vw - pvW / 2 - PAD));
    const by = clamp(py, pvH * 0.32 + PAD, Math.max(pvH * 0.32 + PAD, vh - pvH * 0.68 - PAD));
    pv.style.transform = `translate3d(${bx.toFixed(1)}px,${by.toFixed(1)}px,0) rotate(${tilt.toFixed(2)}deg)`;
  }
}

let built = false;
measure();
if (!reduce) { seqs.forEach(build); built = true; }
updateTheme();
let resizeTimer = 0;
window.addEventListener("resize", () => { window.clearTimeout(resizeTimer); resizeTimer = window.setTimeout(measure, 80); });
window.addEventListener("load", measure);
document.fonts?.ready.then(measure);
// one clock: GSAP's ticker drives Lenis, ScrollTrigger and everything else here
if (lenis) lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.lagSmoothing(0);
gsap.ticker.add((t) => frame(t * 1000));

/* ---------- contact form ---------- */
const form = document.querySelector<HTMLFormElement>("form[data-endpoint]");
if (form) {
  const status = form.querySelector<HTMLElement>("[data-status]");
  const say = (key: string) => { if (status) status.textContent = form.dataset[key] || ""; };
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const endpoint = form.dataset.endpoint;
    if (!endpoint) { say("notready"); return; }
    say("sending");
    try {
      const res = await fetch(endpoint, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } });
      if (!res.ok) throw new Error(String(res.status));
      form.reset();
      say("ok");
    } catch { say("error"); }
  });
}

// Remember a language picked by hand, so the root page stops sending French and Dutch browsers away.
document.addEventListener("click", (e) => {
  const a = (e.target as Element | null)?.closest?.("[data-lang-pick]");
  if (a) try { localStorage.setItem("lang", a.getAttribute("data-lang-pick") || "en"); } catch {}
});
