"use client";
import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { setupChrome, setupWipe } from "@/lib/motion-kit";

/**
 * The motion layer. Markup and copy live in page.tsx (so crawlers see everything);
 * this component choreographs it. prefers-reduced-motion skips all of it.
 */
export default function Motion() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const $ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => r.querySelector<T>(s);
    const $$ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => Array.from(r.querySelectorAll<T>(s));
    const root = document.documentElement;
    const loader = $("#loader");

    if (reduce) { loader?.remove(); root.classList.add("ready", "static"); return; }

    gsap.registerPlugin(ScrollTrigger, SplitText);
    const chrome = setupChrome();
    const unwipe = setupWipe();
    window.scrollTo(0, 0);
    const lenis = chrome.lenis;
    // Coming back from a dog page skips the loader.
    let seen = false;
    try { seen = sessionStorage.getItem("wd-seen") === "1"; sessionStorage.setItem("wd-seen", "1"); } catch {}
    if (!seen) lenis.stop();

    const splits: SplitText[] = [];
    const cleanups: (() => void)[] = [];
    const mm = gsap.matchMedia();

    const ctx = gsap.context(() => {
      /* ── Loader → hero intro ──────────────────────────────────── */
      const mega = new SplitText("[data-mega] .row", { type: "chars", charsClass: "ch", mask: "chars" });
      splits.push(mega);
      const n = { v: 0 }, num = $("[data-load]")!, status = $("[data-load-status]");
      // The ASCII dog decodes top to bottom: solved rows, a scrambling front, faint noise below.
      const pre = $("[data-ascii]"), art = (pre?.textContent ?? "").split("\n");
      const glyphs = "!<>-_\\/[]{}=+*^?#%@$01";
      const rnd = () => glyphs[(Math.random() * glyphs.length) | 0];
      const decode = (p: number) => {
        if (!pre) return;
        const front = p * (art.length + 4);
        pre.textContent = art.map((row, r) => {
          if (r < front - 3) return row;
          if (r < front) return row.replace(/\S/g, () => (Math.random() < 0.55 ? rnd() : "@"));
          return row.replace(/\S/g, () => (Math.random() < 0.06 ? "." : " "));
        }).join("\n");
      };
      const notes = ["scanning…", "loading 14 dogs", "reading the scent", "locking on", "ready"];
      const intro = gsap.timeline({ onComplete: () => { lenis.start(); root.classList.add("ready"); } });
      if (seen) {
        loader?.remove();
        // Arriving from a dog page: lift the wipe that covered the jump.
        intro.set(".wipe", { display: "grid", clipPath: "inset(0 0 0% 0)" })
          .to(".wipe", { clipPath: "inset(0 0 100% 0)", duration: 0.9, ease: "expo.inOut" }, 0.1)
          .set(".wipe", { display: "none" });
      }
      else intro
        .add(() => decode(0))
        .to(n, { v: 100, duration: 2.4, ease: "power2.inOut", onUpdate: () => {
          num.textContent = String(Math.round(n.v)).padStart(3, "0");
          decode(n.v / 100);
          if (status) status.textContent = notes[Math.min(notes.length - 1, Math.floor(n.v / 21))];
        } })
        .to("[data-load-bar]", { scaleX: 1, duration: 2.4, ease: "power2.inOut" }, "<")
        .to("[data-ascii]", { color: "var(--bone)", textShadow: "0 0 18px rgba(220,230,242,.9)", duration: 0.12, yoyo: true, repeat: 3 })
        .to("[data-ascii]", { scaleY: 0.02, opacity: 0, duration: 0.35, ease: "power4.in" }, "+=0.15")
        .to("#loader .ld-foot, #loader .ld-top", { yPercent: -120, opacity: 0, duration: 0.45, ease: "power3.in" }, "<")
        .to("#loader", { clipPath: "inset(0 0 100% 0)", duration: 0.9, ease: "expo.inOut" }, "-=0.15");
      intro
        .from(".field", { opacity: 0, scale: 1.08, duration: 1.6, ease: "expo.out" }, "-=0.5")
        .from(mega.chars, { yPercent: 120, rotate: 8, duration: 1.1, ease: "expo.out", stagger: 0.025 }, "-=1.4")
        .from("[data-intro]", { y: 30, opacity: 0, duration: 1, ease: "expo.out", stagger: 0.12 }, "-=0.9")
        .from(".hud, nav", { opacity: 0, y: (i) => (i % 2 ? -12 : 12), duration: 0.8, stagger: 0.05 }, "-=0.8")
        .add(() => loader?.remove());

      // Threat counter ticks up while the hero is on screen.
      const threat = $("[data-threat]")!;
      let tcount = 0;
      const tick = gsap.to({}, { duration: 0.6, repeat: -1, onRepeat: () => { tcount += gsap.utils.random(1, 4, 1); threat.textContent = String(tcount); } });
      ScrollTrigger.create({ trigger: ".hero", start: "top top", end: "bottom top", onToggle: (s) => (s.isActive ? tick.resume() : tick.pause()) });

      // Leaving the hero: headline stretches and drops away, field dims.
      gsap.timeline({ scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } })
        .to(".hero-in", { yPercent: -18, opacity: 0, ease: "none" }, 0)
        .to(mega.chars, { yPercent: (i) => -40 - (i % 5) * 18, ease: "none", stagger: 0.004 }, 0)
        .to(".field", { opacity: 0.25, scale: 1.12, ease: "none" }, 0);

      /* ── Section titles: lines rise from a mask ───────────────── */
      $$("[data-split]").forEach((el) => {
        const s = new SplitText(el, { type: "lines,words", linesClass: "ln-mask", mask: "lines" });
        splits.push(s);
        gsap.from(s.words, { yPercent: 110, duration: 1.1, ease: "expo.out", stagger: 0.04, scrollTrigger: { trigger: el, start: "top 85%" } });
      });
      $$(".sec-head p, .sec-head .tag").forEach((el) => gsap.from(el, { y: 24, opacity: 0, duration: 1, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 88%" } }));

      /* ── Statement: words light up with scroll ────────────────── */
      const words = new SplitText("[data-words]", { type: "words", wordsClass: "w" });
      splits.push(words);
      gsap.fromTo(words.words, { opacity: 0.12 }, { opacity: 1, stagger: 0.1, ease: "none", scrollTrigger: { trigger: ".statement", start: "top 70%", end: "bottom 60%", scrub: true } });

      /* ── The hunt: one pinned, scrubbed sequence ──────────────── */
      mm.add("(min-width: 900px)", () => {
        const lines = $$("[data-ln]"), vuln = $(".ln.vuln")!, bar = $("[data-scanbar]")!;
        const steps = $$("[data-step]");
        const target = () => vuln.offsetTop;
        const setStep = (i: number) => steps.forEach((s, k) => s.classList.toggle("on", k <= i));
        const tl = gsap.timeline({
          scrollTrigger: { trigger: ".hunt", start: "top top", end: "+=2600", pin: ".hunt-pin", scrub: 0.6, anticipatePin: 1,
            onUpdate: (st) => {
              const p = st.progress;
              setStep(p < 0.3 ? 0 : p < 0.45 ? 1 : p < 0.72 ? 2 : 3);
              const y = Number(gsap.getProperty(bar, "y"));
              lines.forEach((l) => l.classList.toggle("seen", l.offsetTop <= y + 2));
              vuln.classList.toggle("hit", p >= 0.3);
              vuln.classList.toggle("done", p >= 0.75);
            } },
        });
        tl.fromTo("[data-scanbar]", { y: 0 }, { y: () => target(), ease: "none", duration: 0.3 })
          .to("[data-scanbar]", { scaleY: 1.6, backgroundColor: "rgba(255,59,48,.22)", duration: 0.04 })
          .to(".editor", { x: -6, duration: 0.01, repeat: 5, yoyo: true }, "<")
          .fromTo("[data-fdog]", { xPercent: 140, rotate: 12 }, { xPercent: 0, rotate: 0, ease: "back.out(1.6)", duration: 0.12 })
          .fromTo(".f-card", { clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0% 0)", ease: "expo.out", duration: 0.12 }, "<0.04")
          .from("[data-frow]", { x: 40, opacity: 0, stagger: 0.04, duration: 0.1 })
          .to({}, { duration: 0.08 })
          .to("[data-scanbar]", { backgroundColor: "rgba(220,230,242,.18)", scaleY: 1, duration: 0.05 })
          .from("[data-fok]", { scaleX: 0, transformOrigin: "left", duration: 0.08 })
          .to({}, { duration: 0.12 });
        return () => lines.forEach((l) => l.classList.remove("seen", "hit"));
      });

      /* ── The pack: horizontal reel driven by vertical scroll ──── */
      mm.add("(min-width: 900px)", () => {
        const track = $("[data-track]")!;
        const dist = () => track.scrollWidth - window.innerWidth + 80;
        const tween = gsap.to(track, { x: () => -dist(), ease: "none",
          scrollTrigger: { trigger: ".pack", start: "top top", end: () => `+=${dist()}`, pin: ".pack-pin", scrub: 0.8, invalidateOnRefresh: true } });
        $$(".dossier").forEach((d) => {
          gsap.fromTo(d.querySelector(".d-ix"), { xPercent: 40 }, { xPercent: -40, ease: "none", scrollTrigger: { trigger: d, containerAnimation: tween, start: "left right", end: "right left", scrub: true } });
          gsap.from(d, { rotate: 4, y: 60, opacity: 0.2, ease: "none", scrollTrigger: { trigger: d, containerAnimation: tween, start: "left 105%", end: "left 60%", scrub: true } });
        });
      });

      /* ── Dossier image tilt ───────────────────────────────────── */
      if (fine) $$(".dossier").forEach((d) => {
        const img = d.querySelector(".d-img")!;
        const rx = gsap.quickTo(img, "rotationY", { duration: 0.6 }), ry = gsap.quickTo(img, "rotationX", { duration: 0.6 });
        const m = (e: PointerEvent) => { const r = d.getBoundingClientRect(); rx(((e.clientX - r.left) / r.width - 0.5) * 24); ry(-((e.clientY - r.top) / r.height - 0.5) * 24); };
        const l = () => { rx(0); ry(0); };
        d.addEventListener("pointermove", m); d.addEventListener("pointerleave", l);
        cleanups.push(() => { d.removeEventListener("pointermove", m); d.removeEventListener("pointerleave", l); });
      });

      /* ── Radar enters ─────────────────────────────────────────── */
      gsap.from(".radar", { scale: 0.7, rotate: -30, opacity: 0, duration: 1.4, ease: "expo.out", scrollTrigger: { trigger: ".radar", start: "top 80%" } });
      gsap.from(".bundle-list li", { x: -40, opacity: 0, stagger: 0.06, duration: 0.9, ease: "expo.out", scrollTrigger: { trigger: ".bundle-list", start: "top 80%" } });

      /* ── Report bars and counters ─────────────────────────────── */
      gsap.from("[data-bar]", { scaleX: 0, transformOrigin: "left", duration: 1.4, ease: "expo.out", stagger: 0.12, scrollTrigger: { trigger: "[data-bars]", start: "top 75%" } });
      $$<HTMLElement>("[data-count]").forEach((el) => {
        const end = +el.dataset.count!, o = { v: 0 };
        gsap.to(o, { v: end, duration: 1.6, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 85%" }, onUpdate: () => { el.textContent = String(Math.round(o.v)); } });
      });
      gsap.from(".notchecked li", { opacity: 0, x: -20, stagger: 0.1, duration: 0.8, scrollTrigger: { trigger: ".notchecked", start: "top 85%" } });

      /* ── Install: the terminal types itself ───────────────────── */
      const typed = $$<HTMLElement>("[data-type]");
      typed.forEach((t) => (t.textContent = ""));
      const tt = gsap.timeline({ paused: true });
      typed.forEach((t, k) => {
        const full = t.dataset.type!, o = { n: 0 };
        tt.to(o, { n: full.length, duration: full.length * 0.035, ease: "none", onUpdate: () => { t.textContent = full.slice(0, Math.round(o.n)); } }, k ? "+=0.35" : 0);
        if (k === typed.length - 2) tt.from("[data-tout]", { opacity: 0, y: 8, duration: 0.4 }, "+=0.3");
      });
      ScrollTrigger.create({ trigger: "[data-term]", start: "top 75%", once: true, onEnter: () => tt.play() });
      gsap.from("[data-term]", { y: 80, rotateX: 18, opacity: 0, duration: 1.4, ease: "expo.out", scrollTrigger: { trigger: "[data-term]", start: "top 90%" } });

      /* ── FAQ rows ─────────────────────────────────────────────── */
      gsap.from(".faq details", { y: 30, opacity: 0, stagger: 0.06, duration: 0.9, ease: "expo.out", scrollTrigger: { trigger: ".faq details", start: "top 85%" } });

      /* ── Outro: giant words slam in, parade follows scroll speed ── */
      gsap.from("[data-giant] span", { yPercent: 100, scaleY: 1.6, opacity: 0, transformOrigin: "bottom", stagger: 0.12, duration: 1.2, ease: "expo.out", scrollTrigger: { trigger: "[data-giant]", start: "top 80%" } });
      const parade = $("[data-parade]")!;
      const loop = gsap.to(parade, { xPercent: -50, duration: 40, ease: "none", repeat: -1 });
      const skewTo = gsap.quickTo("[data-giant]", "skewX", { duration: 0.5, ease: "power3" });
      ScrollTrigger.create({ onUpdate: (s) => {
        const v = s.getVelocity();
        gsap.to(loop, { timeScale: 1 + Math.min(6, Math.abs(v) / 300) * Math.sign(v || 1), duration: 0.3, overwrite: true });
        skewTo(gsap.utils.clamp(-8, 8, v / -300));
        settle.restart(true);
      } });
      const settle = gsap.delayedCall(0.12, () => { skewTo(0); gsap.to(loop, { timeScale: 1, duration: 0.8 }); });

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
