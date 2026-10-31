import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

/** Shared chrome for every page: smooth scroll, reticle cursor, magnetic buttons. Returns a cleanup. */
export function setupChrome(): { lenis: Lenis; cleanup: () => void } {
  const $ = <T extends Element = HTMLElement>(s: string) => document.querySelector<T>(s);
  const $$ = <T extends Element = HTMLElement>(s: string) => Array.from(document.querySelectorAll<T>(s));
  const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const cleanups: (() => void)[] = [];

  gsap.registerPlugin(ScrollTrigger);
  const lenis = new Lenis({ lerp: 0.085 });
  lenis.on("scroll", ScrollTrigger.update);
  const raf = (t: number) => lenis.raf(t * 1000);
  gsap.ticker.add(raf);
  gsap.ticker.lagSmoothing(0);
  cleanups.push(() => { gsap.ticker.remove(raf); lenis.destroy(); });

  $$<HTMLAnchorElement>('a[href^="#"]').forEach((a) => {
    const h = (e: Event) => { const t = a.getAttribute("href")!; if (t.length > 1) { e.preventDefault(); lenis.scrollTo(t === "#top" ? 0 : t, { duration: 1.6 }); } };
    a.addEventListener("click", h);
    cleanups.push(() => a.removeEventListener("click", h));
  });

  if (fine) {
    const ret = $(".reticle"), xy = $(".rt-xy"), lbl = $(".rt-lbl");
    if (ret && xy && lbl) {
      const qx = gsap.quickTo(ret, "x", { duration: 0.35, ease: "power3" }), qy = gsap.quickTo(ret, "y", { duration: 0.35, ease: "power3" });
      const move = (e: PointerEvent) => {
        qx(e.clientX); qy(e.clientY);
        xy.textContent = `${String(Math.round(e.clientX)).padStart(3, "0")} · ${String(Math.round(e.clientY + window.scrollY)).padStart(4, "0")}`;
        const h = (e.target as Element).closest<HTMLElement>("[data-hover]");
        ret.classList.toggle("lock", !!h);
        lbl.textContent = h?.dataset.hover ?? "";
      };
      window.addEventListener("pointermove", move);
      cleanups.push(() => window.removeEventListener("pointermove", move));
    }
    $$(".btn, .pill").forEach((b) => {
      const mx = gsap.quickTo(b, "x", { duration: 0.5, ease: "elastic.out(1,0.4)" }), my = gsap.quickTo(b, "y", { duration: 0.5, ease: "elastic.out(1,0.4)" });
      const m = (e: PointerEvent) => { const r = b.getBoundingClientRect(); mx((e.clientX - r.left - r.width / 2) * 0.3); my((e.clientY - r.top - r.height / 2) * 0.4); };
      const l = () => { mx(0); my(0); };
      b.addEventListener("pointermove", m); b.addEventListener("pointerleave", l);
      cleanups.push(() => { b.removeEventListener("pointermove", m); b.removeEventListener("pointerleave", l); });
    });
  }

  const nav = ScrollTrigger.create({ start: 200, onUpdate: (s) => document.documentElement.classList.toggle("nav-up", s.direction === 1 && s.scroll() > 600) });
  cleanups.push(() => { nav.kill(); document.documentElement.classList.remove("nav-up"); });

  return { lenis, cleanup: () => cleanups.forEach((c) => c()) };
}

/**
 * Page transition: [data-wipe] links slide the .wipe panel over the page, then do a full load.
 * A full load (not client routing) because GSAP pins and SplitText rewrap DOM that React would then fail to unmount;
 * the next page opens under the same colour, so it still reads as one move.
 */
export function setupWipe(): () => void {
  const wipe = document.querySelector<HTMLElement>(".wipe");
  const click = (e: MouseEvent) => {
    const a = (e.target as Element).closest<HTMLAnchorElement>("a[data-wipe]");
    if (!a || !wipe || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    const href = a.getAttribute("href")!;
    const label = wipe.querySelector("span");
    if (label) { label.textContent = a.dataset.wipeLabel ?? ""; gsap.set(label, { yPercent: 0, opacity: 1 }); }
    if (a.dataset.wipeColor) wipe.style.setProperty("--wc", a.dataset.wipeColor); else wipe.style.removeProperty("--wc");
    gsap.timeline()
      .set(wipe, { display: "grid", clipPath: "inset(100% 0 0 0)" })
      .to(wipe, { clipPath: "inset(0% 0 0 0)", duration: 0.7, ease: "expo.inOut" })
      .from(label, { yPercent: 100, opacity: 0, duration: 0.45, ease: "expo.out" }, 0.35)
      .add(() => { window.location.href = href; });
    // Backgrounded tabs pause GSAP's ticker; never leave the click hanging.
    setTimeout(() => { window.location.href = href; }, 1200);
  };
  document.addEventListener("click", click, true);
  return () => document.removeEventListener("click", click, true);
}
