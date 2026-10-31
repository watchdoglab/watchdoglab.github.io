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

type Theme = "light" | "dark" | "system";
const THEMES: { k: Theme; label: string; d: string }[] = [
  { k: "light", label: "Light", d: "M12 4V2m0 20v-2m8-8h2M2 12h2m13.66-5.66 1.41-1.41M4.93 19.07l1.41-1.41m0-11.32L4.93 4.93m14.14 14.14-1.41-1.41M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10z" },
  { k: "dark", label: "Dark", d: "M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" },
  { k: "system", label: "System", d: "M3 5h18v11H3zM8 20h8M12 16v4" },
];

/** Light / dark / system. The inline script in layout.tsx applies the saved choice before paint. */
export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("system");
  useEffect(() => {
    try { setTheme((localStorage.getItem("theme") as Theme) || "system"); } catch {}
  }, []);
  const pick = (t: Theme) => {
    setTheme(t);
    try { t === "system" ? localStorage.removeItem("theme") : localStorage.setItem("theme", t); } catch {}
    if (t === "system") document.documentElement.removeAttribute("data-theme");
    else document.documentElement.setAttribute("data-theme", t);
  };
  const k = THEMES.findIndex((t) => t.k === theme);
  const cur = THEMES[k], next = THEMES[(k + 1) % THEMES.length];
  return (
    <button className="theme" onClick={() => pick(next.k)} aria-label={`Theme: ${cur.label}. Switch to ${next.label}`} title={`Theme: ${cur.label}`}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={cur.d} /></svg>
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
        <Cmd text={b.cmd} dark />
        <div className="eyebrow mt">Sends {b.dogs.length} dogs</div>
        <ul className="picker-dogs">
          {b.dogs.map((id) => {
            const d = dogs.find((x) => x.id === id)!;
            return (
              <li key={id}>
                <img src={asset(`/media/dogs/${id}.gif`)} alt="" width={36} height={36} />
                <span><b>{d.name}</b><small>{d.role}</small></span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
