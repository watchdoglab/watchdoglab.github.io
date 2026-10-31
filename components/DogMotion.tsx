"use client";
import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { setupChrome, setupWipe } from "@/lib/motion-kit";

/** Motion for a dog's case-file page. Markup lives in the page; this only choreographs it. */
export default function DogMotion() {

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const $ = <T extends Element = HTMLElement>(s: string) => document.querySelector<T>(s);
    const $$ = <T extends Element = HTMLElement>(s: string) => Array.from(document.querySelectorAll<T>(s));
    const root = document.documentElement;

    if (reduce) { root.classList.add("static"); gsap.set(".wipe", { display: "none" }); return; }
    root.classList.remove("static");
    window.scrollTo(0, 0);

    gsap.registerPlugin(ScrollTrigger, SplitText);
    const chrome = setupChrome();
    const unwipe = setupWipe();
    const splits: SplitText[] = [];
    const cleanups: (() => void)[] = [];
    const mm = gsap.matchMedia();

    const ctx = gsap.context(() => {
      /* ── Entrance: the wipe lifts, the name fills, the dog lands ── */
      gsap.timeline()
        .set(".wipe", { display: "grid", clipPath: "inset(0 0 0% 0)" })
        .to(".wipe span", { yPercent: -100, opacity: 0, duration: 0.5, ease: "power3.in" }, 0.15)
        .to(".wipe", { clipPath: "inset(0 0 100% 0)", duration: 0.9, ease: "expo.inOut" }, 0.3)
        .set(".wipe", { display: "none" })
        .from("[data-rings]", { scale: 0.4, rotate: -120, opacity: 0, duration: 1.8, ease: "expo.out" }, 0.6)
        .from("[data-dogimg]", { scale: 0.2, y: 120, rotate: -14, opacity: 0, duration: 1.4, ease: "back.out(1.4)" }, 0.75)
        .from(".dname .stroke", { yPercent: 40, opacity: 0, duration: 1.1, ease: "expo.out" }, 0.7)
        .fromTo(".dname .fill", { clipPath: "inset(100% 0 0 0)" }, { clipPath: "inset(0% 0 0 0)", duration: 1.4, ease: "expo.inOut" }, 1.0)
        .from("[data-dintro]", { y: 30, opacity: 0, stagger: 0.1, duration: 1, ease: "expo.out" }, 1.3)
        .from(".hud", { opacity: 0, duration: 0.8, stagger: 0.06 }, 1.3)
        .from("[data-bgrow]", { opacity: 0, duration: 1.5 }, 0.8);

      /* ── Hero: rings spin, role words drift, dog follows the cursor ── */
      gsap.to("[data-rings] .r1, [data-rings] .tick", { rotate: 360, transformOrigin: "50px 50px", duration: 60, ease: "none", repeat: -1 });
      gsap.to("[data-rings] .r2", { rotate: -360, transformOrigin: "50px 50px", duration: 40, ease: "none", repeat: -1 });
      const rows = $$("[data-bgrow]").map((r, k) => gsap.fromTo(r, { xPercent: k % 2 ? -50 : 0 }, { xPercent: k % 2 ? 0 : -50, duration: 50 + k * 10, ease: "none", repeat: -1 }));
      if (fine) {
        const stage = $("[data-dogstage]")!, rings = $("[data-rings]")!;
        const sx = gsap.quickTo(stage, "x", { duration: 1, ease: "power3" }), sy = gsap.quickTo(stage, "y", { duration: 1, ease: "power3" });
        const sr = gsap.quickTo(stage, "rotate", { duration: 1, ease: "power3" });
        const rx = gsap.quickTo(rings, "x", { duration: 1.4, ease: "power3" }), ry = gsap.quickTo(rings, "y", { duration: 1.4, ease: "power3" });
        const m = (e: PointerEvent) => {
          const nx = e.clientX / innerWidth - 0.5, ny = e.clientY / innerHeight - 0.5;
          sx(nx * 60); sy(ny * 40); sr(nx * 8); rx(nx * -30); ry(ny * -20);
        };
        window.addEventListener("pointermove", m);
        cleanups.push(() => window.removeEventListener("pointermove", m));
      }
      gsap.timeline({ scrollTrigger: { trigger: ".dhero", start: "top top", end: "bottom top", scrub: true } })
        .to(".dname", { yPercent: -40, scale: 0.9, ease: "none" }, 0)
        .to("[data-dogimg]", { yPercent: 30, scale: 1.25, opacity: 0, ease: "none" }, 0)
        .to("[data-rings]", { scale: 1.8, opacity: 0, ease: "none" }, 0);

      /* ── Titles and statement ───────────────────────────────── */
      $$("[data-split]").forEach((el) => {
        const s = new SplitText(el, { type: "lines,words", linesClass: "ln-mask", mask: "lines" });
        splits.push(s);
        gsap.from(s.words, { yPercent: 110, duration: 1.1, ease: "expo.out", stagger: 0.04, scrollTrigger: { trigger: el, start: "top 85%" } });
      });
      $$(".sec-head p, .sec-head .tag, .checks-head .tag").forEach((el) => gsap.from(el, { y: 24, opacity: 0, duration: 1, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 88%" } }));
      const words = new SplitText("[data-words]", { type: "words", wordsClass: "w" });
      splits.push(words);
      gsap.fromTo(words.words, { opacity: 0.12 }, { opacity: 1, stagger: 0.1, ease: "none", scrollTrigger: { trigger: ".statement", start: "top 70%", end: "bottom 60%", scrub: true } });

      /* ── Checks: cards stack up while the section is pinned ──── */
      mm.add("(min-width: 900px)", () => {
        const cards = $$("[data-scard]");
        gsap.set(cards, { yPercent: (i) => (i ? 120 : 0), rotate: (i) => (i ? (i % 2 ? 4 : -4) : 0) });
        const tl = gsap.timeline({ scrollTrigger: { trigger: ".checks", start: "top top", end: () => `+=${cards.length * 520}`, pin: true, scrub: 0.7, anticipatePin: 1 } });
        cards.forEach((c, i) => {
          if (!i) return;
          tl.to(c, { yPercent: i * 2.4, rotate: 0, ease: "power2.out", duration: 1 }, i - 1)
            .to(cards.slice(0, i), { scale: (k) => 1 - (i - k) * 0.035, y: (k) => -(i - k) * 14, filter: (k) => `brightness(${1 - (i - k) * 0.12})`, duration: 1, ease: "power2.out" }, i - 1);
        });
        tl.to({}, { duration: 0.4 });
      });
      mm.add("(max-width: 899px)", () => {
        $$("[data-scard]").forEach((c) => gsap.from(c, { y: 60, opacity: 0, duration: 1, ease: "expo.out", scrollTrigger: { trigger: c, start: "top 88%" } }));
      });

      /* ── Commands ───────────────────────────────────────────── */
      gsap.from("[data-cmdrow]", { x: -60, opacity: 0, stagger: 0.08, duration: 1, ease: "expo.out", scrollTrigger: { trigger: ".cmdlist", start: "top 80%" } });

      /* ── Orbit: chips fly out to their slots, then the ring turns with scroll ── */
      if ($("[data-orbit]")) {
        gsap.fromTo(".o-chip", { "--k": 0, opacity: 0 }, { "--k": 1, opacity: 1, stagger: 0.07, duration: 1.4, ease: "expo.out", scrollTrigger: { trigger: "[data-orbit]", start: "top 75%" } });
        gsap.from(".o-dog", { scale: 0, rotate: -90, duration: 1.2, ease: "back.out(1.6)", scrollTrigger: { trigger: "[data-orbit]", start: "top 75%" } });
        gsap.to("[data-oring]", { rotate: 120, ease: "none", scrollTrigger: { trigger: ".orbit-sec", start: "top bottom", end: "bottom top", scrub: true } });
        gsap.to(".o-chip code", { rotate: -120, ease: "none", scrollTrigger: { trigger: ".orbit-sec", start: "top bottom", end: "bottom top", scrub: true } });
      }

      /* ── Benchmark race ─────────────────────────────────────── */
      gsap.from("[data-lane]", { scaleX: 0, transformOrigin: "left", stagger: 0.18, duration: 1.8, ease: "expo.out", scrollTrigger: { trigger: ".race", start: "top 80%" } });
      $$<HTMLElement>("[data-count]").forEach((el) => {
        const end = +el.dataset.count!, o = { v: 0 };
        gsap.to(o, { v: end, duration: 1.8, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 85%" }, onUpdate: () => { el.textContent = String(Math.round(o.v)); } });
      });

      /* ── Rules: the tape snaps across, rules slide in ───────── */
      gsap.fromTo("[data-tape]", { rotate: -8, xPercent: -30 }, { rotate: -3, xPercent: 0, ease: "none", scrollTrigger: { trigger: ".rules", start: "top bottom", end: "center center", scrub: true } });
      gsap.to("[data-tape] div", { xPercent: -50, duration: 30, ease: "none", repeat: -1 });
      gsap.from("[data-rule]", { y: 50, opacity: 0, stagger: 0.12, duration: 1, ease: "expo.out", scrollTrigger: { trigger: ".rlist", start: "top 80%" } });

      /* ── Next dog: the image trails the cursor across the link ── */
      const next = $("[data-next]"), img = $("[data-nextimg]");
      if (next && img) {
        gsap.from(".nname", { yPercent: 100, duration: 1.2, ease: "expo.out", scrollTrigger: { trigger: next, start: "top 85%" } });
        if (fine) {
          const ix = gsap.quickTo(img, "x", { duration: 0.6, ease: "power3" }), iy = gsap.quickTo(img, "y", { duration: 0.6, ease: "power3" });
          const ir = gsap.quickTo(img, "rotate", { duration: 0.6, ease: "power3" });
          let lx = 0;
          const m = (e: PointerEvent) => { const r = next.getBoundingClientRect(); const x = e.clientX - r.left; ix(x); iy(e.clientY - r.top); ir(gsap.utils.clamp(-20, 20, (x - lx) * 0.8)); lx = x; };
          const en = () => gsap.to(img, { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(2)" });
          const lv = () => gsap.to(img, { scale: 0, opacity: 0, duration: 0.3 });
          next.addEventListener("pointermove", m); next.addEventListener("pointerenter", en); next.addEventListener("pointerleave", lv);
          cleanups.push(() => { next.removeEventListener("pointermove", m); next.removeEventListener("pointerenter", en); next.removeEventListener("pointerleave", lv); });
        }
      }

      /* ── Scroll speed drives the background words and tape ──── */
      ScrollTrigger.create({ onUpdate: (s) => {
        const v = Math.min(6, Math.abs(s.getVelocity()) / 400);
        rows.forEach((r) => gsap.to(r, { timeScale: 1 + v * 4, duration: 0.3, overwrite: true }));
        settle.restart(true);
      } });
      const settle = gsap.delayedCall(0.15, () => rows.forEach((r) => gsap.to(r, { timeScale: 1, duration: 1 })));
    });

    document.fonts?.ready.then(() => ScrollTrigger.refresh());

    return () => {
      cleanups.forEach((c) => c());
      ctx.revert();
      mm.revert();
      splits.forEach((s) => s.revert());
      unwipe();
      chrome.cleanup();
    };
  }, []);

  return null;
}
