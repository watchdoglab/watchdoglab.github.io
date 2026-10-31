"use client";
/* eslint-disable @next/next/no-img-element -- static export: plain <img> with basePath-aware src */
import { useState } from "react";
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
