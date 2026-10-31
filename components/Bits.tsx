"use client";
/* eslint-disable @next/next/no-img-element -- static export: plain <img> with basePath-aware src */
import Link from "next/link";
import { useState } from "react";
import { asset, bundles, dogs } from "@/lib/site";

/** Copy-to-clipboard command. */
export function Cmd({ text, big }: { text: string; big?: boolean }) {
  const [ok, setOk] = useState(false);
  const copy = () => navigator.clipboard?.writeText(text).then(() => { setOk(true); setTimeout(() => setOk(false), 1400); });
  return (
    <button className={`cmd${big ? " big" : ""}`} onClick={copy} data-hover="copy" aria-label={`Copy ${text}`}>
      <span className="pr">$</span><code>{text}</code><span className="cp">{ok ? "copied" : "copy"}</span>
    </button>
  );
}

/** Pick what you're building: the radar draws a line from the command to every dog it sends. */
export function BundleRadar() {
  const [sel, setSel] = useState(0);
  const b = bundles[sel];
  const pts = dogs.map((d, k) => {
    const a = (k / dogs.length) * Math.PI * 2 - Math.PI / 2;
    return { ...d, x: 50 + Math.cos(a) * 41, y: 50 + Math.sin(a) * 41 };
  });
  return (
    <div className="radar-wrap">
      <ol className="bundle-list" role="tablist" aria-label="What are you building?">
        {bundles.map((x, k) => (
          <li key={x.cmd}>
            <button role="tab" aria-selected={k === sel} className={k === sel ? "on" : ""} onClick={() => setSel(k)} data-hover="pick">
              <span className="ix">{String(k + 1).padStart(2, "0")}</span>
              <span className="for">{x.for}</span>
              <span className="n">{x.dogs.length}</span>
            </button>
          </li>
        ))}
      </ol>
      <div className="radar" role="tabpanel" aria-live="polite">
        <svg viewBox="0 0 100 100" aria-hidden="true">
          {[14, 26, 38, 46].map((r) => <circle key={r} cx="50" cy="50" r={r} className="ring" />)}
          <line x1="50" y1="4" x2="50" y2="96" className="axis" /><line x1="4" y1="50" x2="96" y2="50" className="axis" />
          {pts.map((p) => {
            const on = b.dogs.includes(p.id);
            return <line key={`${p.id}-${sel}`} x1="50" y1="50" x2={p.x} y2={p.y} pathLength={1} className={`link${on ? " on" : ""}`}
              style={{ transitionDelay: on ? `${b.dogs.indexOf(p.id) * 70}ms` : "0ms" }} />;
          })}
          <g className="sweep"><path d="M50 50 L50 4 A46 46 0 0 1 82.5 17.5 Z" /></g>
        </svg>
        {pts.map((p) => {
          const on = b.dogs.includes(p.id);
          return (
            <Link key={p.id} href={`/dogs/${p.id}/`} data-wipe data-wipe-label={p.name} data-hover={`open ${p.name.toLowerCase()}`} className={`node${on ? " on" : ""}`} style={{ left: `${p.x}%`, top: `${p.y}%`, transitionDelay: on ? `${b.dogs.indexOf(p.id) * 70 + 200}ms` : "0ms" }}>
              <img src={asset(`/media/dogs/${p.id}.gif`)} alt="" width={56} height={56} loading="lazy" />
              <span>{p.name}</span>
            </Link>
          );
        })}
        <div className="core">
          <small>sends {b.dogs.length} dog{b.dogs.length > 1 ? "s" : ""}</small>
          <Cmd text={b.cmd} />
        </div>
      </div>
    </div>
  );
}
