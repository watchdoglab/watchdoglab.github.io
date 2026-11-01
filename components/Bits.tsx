"use client";
/* eslint-disable @next/next/no-img-element -- static export: plain <img> with basePath-aware src */
import { useEffect, useState } from "react";
import { asset, bundles, dogs } from "@/lib/site";

/** Copy-to-clipboard command. */
export function Cmd({ text, dark }: { text: string; dark?: boolean }) {
  const [ok, setOk] = useState(false);
  const copy = () => navigator.clipboard?.writeText(text).then(() => { setOk(true); setTimeout(() => setOk(false), 1400); });
  return (
    <button className={`cmd${dark ? " dark" : ""}`} onClick={copy} aria-label={`Copy ${text}`}>
      <span className="pr">$</span><code>{text}</code><span className="cp">{ok ? "Copied" : "Copy"}</span>
    </button>
  );
}

type Theme = "light" | "dark";
const ICON: Record<Theme, string> = {
  light: "M12 4V2m0 20v-2m8-8h2M2 12h2m13.66-5.66 1.41-1.41M4.93 19.07l1.41-1.41m0-11.32L4.93 4.93m14.14 14.14-1.41-1.41M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10z",
  dark: "M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z",
};

/**
 * Light / dark toggle. Until the visitor picks one, the site follows the system theme and the
 * button shows it. The inline script in layout.tsx applies a saved choice before paint.
 */
export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const sync = () => {
      let saved: string | null = null;
      try { saved = localStorage.getItem("theme"); } catch {}
      setTheme(saved === "light" || saved === "dark" ? saved : mq.matches ? "dark" : "light");
    };
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  const next: Theme = theme === "dark" ? "light" : "dark";
  const toggle = () => {
    setTheme(next);
    try { localStorage.setItem("theme", next); } catch {}
    document.documentElement.setAttribute("data-theme", next);
  };
  return (
    <button className="theme" onClick={toggle} aria-label={`Switch to ${next} theme`} title={`Switch to ${next} theme`}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={ICON[theme]} /></svg>
    </button>
  );
}

/** Pick what you're building: shows the one command and the dogs it sends. */
export function BundlePicker() {
  const [sel, setSel] = useState(0);
  const b = bundles[sel];
  return (
    <div className="picker">
      <div className="picker-tabs" role="tablist" aria-label="What are you building?">
        {bundles.map((x, k) => (
          <button key={x.cmd} role="tab" aria-selected={k === sel} className={k === sel ? "on" : ""} onClick={() => setSel(k)}>
            {x.for}
          </button>
        ))}
      </div>
      <div className="picker-body" role="tabpanel">
        <div className="eyebrow">One command</div>
        <Cmd text={b.cmd} />
        <div className="eyebrow mt">Sends {b.dogs.length} dogs</div>
        <ul className="picker-dogs">
          {b.dogs.map((id) => {
            const d = dogs.find((x) => x.id === id)!;
            return (
              <li key={id}>
                <img src={asset(`/media/dogs/${id}.gif`)} alt="" width={36} height={36} loading="lazy" />
                <span><b>{d.name}</b><small>{d.role}</small></span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
