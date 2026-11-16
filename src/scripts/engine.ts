/* The motion layer, shared by every page.
   - Smooth scroll (Lenis) on computers; phones keep their native scroll.
   - Pinned sequences ([data-seq]) expose progress as --p, plus named ramps
     (data-ramps="name:start:end, ...") as CSS variables between 0 and 1.
   - Items with [data-fly] come out of the middle of the screen and are always kept whole on screen.
   - Scroll speed as --v (signed) and --av (absolute), 0 to 1, set on the sequence only.
   - Custom cursor, hover previews, header colour per section, videos that only play while visible.
   - prefers-reduced-motion: no pinning, no flying, everything still.
   One clock runs everything (a single requestAnimationFrame), and only transform and opacity change
   while scrolling, so the page stays smooth. */
import Lenis from "lenis";

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
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

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
type Seq = { el: HTMLElement; stage: HTMLElement | null; sw: number; sh: number; wordW: number; wordH: number; ramps: { name: string; a: number; b: number; last: string }[]; items: Fly[]; p: number; top: number; h: number };

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
}

/* A piece of work comes out of the middle of the screen, grows to its real size where it belongs,
   rests there, then lets go. It is kept whole on screen the entire time. */
const PAD = 12;
function place(it: Fly, t: number, q: Seq) {
  const sw = q.sw, sh = q.sh;
  if (it.word) {
    // a word of the sequence: rises into the middle, holds, leaves upward
    const y = (1 - easeOut(clamp(t / 0.3, 0, 1))) * it.h * 0.45 - smooth(0.78, 1, t) * it.h * 0.35;
    it.el.style.transform = `translate3d(0,${y.toFixed(1)}px,0)`;
    it.el.style.opacity = (smooth(0, 0.18, t) * (1 - smooth(0.8, 1, t))).toFixed(3);
    return;
  }
  const grow = easeOut(clamp(t / 0.6, 0, 1));
  const push = smooth(0.6, 1, t);
  const s = lerp(0.08, 1, grow) + push * 0.06;
  const k = lerp(0.1, 1, grow) + push * 0.04;
  const rot = it.r * (1.6 - grow * 0.6);
  // the space a tilted piece takes is a little larger than the piece itself
  const sin = Math.abs(Math.sin((rot * Math.PI) / 180)), cos = Math.cos((rot * Math.PI) / 180);
  const bw = (it.w * cos + it.h * sin) * s, bh = (it.h * cos + it.w * sin) * s;
  const roomX = Math.max(0, sw / 2 - bw / 2 - PAD), roomY = Math.max(0, sh / 2 - bh / 2 - PAD);
  const x = clamp(it.x * sw * 0.5 * k, -roomX, roomX);
  let y = it.y * sh * 0.5 * k;
  // the word in the middle stays readable: a piece that would cross it sits above or below it instead
  if (q.wordH && Math.abs(x) - bw / 2 < q.wordW / 2) {
    const clear = q.wordH / 2 + bh / 2 + PAD;
    if (Math.abs(y) < clear) y = (it.y >= 0 ? 1 : -1) * clear;
  }
  y = clamp(y, -roomY, roomY);
  it.el.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0) rotate(${rot.toFixed(2)}deg) scale(${s.toFixed(4)})`;
  it.el.style.opacity = (smooth(0, 0.1, t) * (1 - smooth(0.82, 1, t))).toFixed(3);
}

function updateSeq(s: Seq, scrollY: number) {
  const p = clamp((scrollY - s.top) / s.h, 0, 1);
  if (Math.abs(p - s.p) < 0.0003) return;
  s.p = p;
  s.el.style.setProperty("--p", p.toFixed(4));
  for (const r of s.ramps) {
    const val = smooth(r.a, r.b, p).toFixed(3);
    if (val !== r.last) { s.el.style.setProperty("--" + r.name, val); r.last = val; }
  }
  if (reduce) return;
  for (const it of s.items) {
    const t = (p - it.a) / (it.b - it.a);
    if (t <= 0 || t >= 1) {
      if (it.vis !== false) { it.el.style.visibility = "hidden"; it.el.style.willChange = "auto"; it.vis = false; }
      continue;
    }
    if (it.vis !== true) { it.el.style.visibility = "visible"; it.el.style.willChange = "transform, opacity"; it.vis = true; }
    place(it, t, s);
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
let cur: HTMLElement | null = null, curLabel: HTMLElement | null = null;
const moveCursor = () => { if (cur) cur.style.transform = `translate3d(${mx}px,${my}px,0)`; };
if (fine && !reduce) {
  cur = document.createElement("div");
  cur.className = "cur";
  cur.setAttribute("aria-hidden", "true");
  cur.innerHTML = '<span class="cur__dot"></span><span class="cur__label"></span>';
  document.body.appendChild(cur);
  root.classList.add("has-cursor"); // only now is the system pointer hidden
  curLabel = cur.querySelector(".cur__label");
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
    for (const s of seqs) updateSeq(s, y);
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

  if (pv && (pvOn || Math.abs(mx - px) > 0.5 || Math.abs(my - py) > 0.5)) {
    px = lerp(px, mx, 0.16); py = lerp(py, my, 0.16);
    const tilt = clamp((mx - px) * 0.06, -8, 8);
    // the picture hangs from the cursor at a third of its height; it never leaves the screen
    const bx = clamp(px, pvW / 2 + PAD, Math.max(pvW / 2 + PAD, vw - pvW / 2 - PAD));
    const by = clamp(py, pvH * 0.32 + PAD, Math.max(pvH * 0.32 + PAD, vh - pvH * 0.68 - PAD));
    pv.style.transform = `translate3d(${bx.toFixed(1)}px,${by.toFixed(1)}px,0) rotate(${tilt.toFixed(2)}deg)`;
  }
  requestAnimationFrame(frame);
}

measure();
updateTheme();
let resizeTimer = 0;
window.addEventListener("resize", () => { window.clearTimeout(resizeTimer); resizeTimer = window.setTimeout(measure, 80); });
window.addEventListener("load", measure);
document.fonts?.ready.then(measure);
requestAnimationFrame(frame);

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
