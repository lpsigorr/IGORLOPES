/* The finishing layer: light, magnets and reveals. Loaded after the engine.
   - Lamps: a soft green light on dark sections ([data-lamp]) that follows the hand, or drifts on phones.
   - Magnets: big calls to action lean toward the pointer ([data-magnet]).
   - Reveals: big type rises line by line out of its own line; pictures open upward like a blind,
     the picture settling inside its frame. Everything else keeps the gentle fade of the engine.
   Only transform, opacity and clipping move. Nothing here runs when motion is reduced. */
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
gsap.registerPlugin(ScrollTrigger, SplitText);

const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
const OUT = "expo.out";

if (!reduce) {
  /* ---------- lamps ---------- */
  const lamps: { host: HTMLElement; el: HTMLElement; x: number; y: number; tx: number; ty: number; seed: number }[] = [];
  document.querySelectorAll<HTMLElement>("[data-lamp]").forEach((host, i) => {
    const el = document.createElement("i");
    el.className = "lamp";
    el.setAttribute("aria-hidden", "true");
    host.prepend(el);
    const r = host.getBoundingClientRect();
    lamps.push({ host, el, x: r.width * 0.75, y: r.height * 0.2, tx: r.width * 0.75, ty: r.height * 0.2, seed: i * 1.7 });
  });
  let px = -1, py = -1;
  if (fine) addEventListener("pointermove", (e) => { px = e.clientX; py = e.clientY; }, { passive: true });
  if (lamps.length) gsap.ticker.add((t) => {
    for (const L of lamps) {
      const r = L.host.getBoundingClientRect();
      if (r.bottom < 0 || r.top > innerHeight) continue;
      if (fine && px >= 0 && py >= r.top && py <= r.bottom) { L.tx = px - r.left; L.ty = py - r.top; }
      else if (!fine) { L.tx = r.width * (0.5 + 0.35 * Math.sin(t * 0.25 + L.seed)); L.ty = r.height * (0.4 + 0.3 * Math.cos(t * 0.2 + L.seed)); }
      L.x += (L.tx - L.x) * 0.06; L.y += (L.ty - L.y) * 0.06;
      L.el.style.transform = `translate3d(${L.x.toFixed(1)}px,${L.y.toFixed(1)}px,0)`;
    }
  });

  /* ---------- magnets ---------- */
  if (fine) document.querySelectorAll<HTMLElement>("[data-magnet]").forEach((el) => {
    const toX = gsap.quickTo(el, "x", { duration: 0.6, ease: "power3.out" });
    const toY = gsap.quickTo(el, "y", { duration: 0.6, ease: "power3.out" });
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      toX((e.clientX - (r.left + r.width / 2)) * 0.18);
      toY((e.clientY - (r.top + r.height / 2)) * 0.28);
    });
    el.addEventListener("pointerleave", () => { toX(0); toY(0); });
  });

  /* ---------- reveals ---------- */
  const start = "top 88%";
  // big type: line by line
  const lineSel = ".page-head h1, .case__lead, .case__end, .about__lead, .credits__name, .lab__head h1, .lab__head h2, .outro-none";
  const ready = document.fonts ? document.fonts.ready : Promise.resolve();
  ready.then(() => {
    document.querySelectorAll<HTMLElement>(lineSel).forEach((el) => {
      const split = SplitText.create(el, { type: "lines", mask: "lines", linesClass: "fx-line" });
      el.classList.add("fx-lines");
      gsap.set(el, { opacity: 1, y: 0, visibility: "visible" });
      el.style.transition = "none";
      gsap.from(split.lines, { yPercent: 115, duration: 1.15, ease: OUT, stagger: 0.09,
        scrollTrigger: { trigger: el, start, once: true } });
    });
    ScrollTrigger.refresh();
  });

  // pictures: a blind that opens upward, the picture settling inside it
  const picSel = ".case__body .pics figure, .case__body .browser, .case__body .phone, .about__photo, .lab__frame, .next__thumb";
  document.querySelectorAll<HTMLElement>(picSel).forEach((el) => {
    const img = el.querySelector("img, video");
    const host = el.closest<HTMLElement>("[data-reveal]");
    if (host === el) { el.style.transition = "none"; gsap.set(el, { opacity: 1, y: 0 }); }
    const tl = gsap.timeline({ scrollTrigger: { trigger: el, start, once: true } });
    tl.fromTo(el, { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.25, ease: "expo.inOut", clearProps: "clipPath" });
    // the picture only settles where its own frame hides the extra size; elsewhere it would push the page sideways or cover a caption
    const box = img?.parentElement, clips = !!box && /hidden|clip/.test(getComputedStyle(box).overflowX);
    if (img && clips) tl.fromTo(img, { scale: 1.18 }, { scale: 1, duration: 1.6, ease: OUT, clearProps: "transform" }, 0.1);
  });

  // project rows: the rule draws, the name rises
  const rows = document.querySelectorAll<HTMLElement>(".row");
  if (rows.length && "IntersectionObserver" in window) {
    const io = new IntersectionObserver((es) => es.forEach((en) => {
      if (!en.isIntersecting) return;
      const el = en.target as HTMLElement, i = Array.from(rows).indexOf(el);
      el.style.setProperty("--d", "0s");
      setTimeout(() => el.classList.add("is-in"), (i % 3) * 70);
      io.unobserve(el);
    }), { rootMargin: "0px 0px -8% 0px" });
    rows.forEach((r) => io.observe(r));
  }
} else {
  document.querySelectorAll(".row").forEach((r) => r.classList.add("is-in"));
}

// ---------- Scroll cue on the home intro ----------
// "Scroll down" until the visitor moves, then "Keep scrolling". If they stop before the end, the pill nudges.
{
  const seq = document.querySelector<HTMLElement>(".seq[data-seq]");
  const cue = seq?.querySelector<HTMLElement>(".cue");
  if (seq && cue && !document.documentElement.classList.contains("is-still")) {
    const prog = () => parseFloat(seq.style.getPropertyValue("--p")) || 0;
    let idle = 0;
    const wait = () => {
      cue.classList.remove("is-idle");
      clearTimeout(idle);
      idle = window.setTimeout(() => { if (prog() < 0.87) cue.classList.add("is-idle"); }, prog() < 0.01 ? 3200 : 2400);
    };
    const check = () => { seq.classList.toggle("has-started", prog() > 0.01); };
    window.addEventListener("scroll", () => { check(); wait(); }, { passive: true });
    // the engine smooths the scroll, so read the settled progress a moment later too
    window.addEventListener("scroll", () => { setTimeout(check, 400); }, { passive: true });
    check(); wait();
  }
}
