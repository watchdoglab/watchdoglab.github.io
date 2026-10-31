"use client";
/* eslint-disable @next/next/no-img-element -- static export: plain <img> with basePath-aware src */
import { useEffect, useState } from "react";
import { scenes as all } from "@/lib/scenes";
import { asset, dogs } from "@/lib/site";

// phase timings (ms): write → sniff → flag → fix
const PHASES = [1900, 1300, 2600, 2200];

/** Write → sniff → flag → fix, looping through the given dogs' scenes. */
export default function HeroDemo({ ids = ["malinois", "husky", "collie"] }: { ids?: string[] }) {
  const scenes = ids.map((id) => all[id]);
  const [s, setS] = useState(0);
  const [p, setP] = useState(0);
  const [found, setFound] = useState(0);
  const [fixed, setFixed] = useState(0);
  const [run, setRun] = useState(0); // restarts the typing animation, even with one scene

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setP(2); return; }
    const t = setTimeout(() => {
      if (p === 1) setFound((n) => n + 1);
      if (p === 2) setFixed((n) => n + 1);
      if (p < PHASES.length - 1) setP(p + 1);
      else { setP(0); setS((s + 1) % scenes.length); setRun((r) => r + 1); }
    }, PHASES[p]);
    return () => clearTimeout(t);
  }, [p, s, scenes.length]);

  const sc = scenes[s];
  const dogName = dogs.find((d) => d.id === sc.dog)?.name;
  const phase = ["write", "sniff", "flag", "fix"][p];

  return (
    <div className={`demo ph-${phase}`} aria-label="Animated example: a Watchdog dog finds a vulnerable line and fixes it">
      <div className="demo-bar">
        <span /><span /><span />
        <code>claude · acme-app</code>
        <em className="live"><i />watching</em>
      </div>

      <div className="demo-tabs">
        {scenes.map((x, k) => <span key={x.dog} className={k === s ? "on" : ""}>{x.file.split("/").pop()}</span>)}
      </div>

      <div className="demo-code" key={run}>
        <div className="sniffer" />
        {sc.code.map((line, k) => {
          const bad = k === sc.bad;
          return (
            <div key={k} className={`ln${bad ? " bad" : ""}`} style={{ animationDelay: `${k * 260}ms` }}>
              <span className="no">{k + 12}</span>
              <span className="tx">
                {bad && <span className="old">{line}</span>}
                {bad ? <span className="new">{sc.fix}</span> : line || " "}
              </span>
            </div>
          );
        })}

        <div className="finding" style={{ top: `${(sc.bad + 1) * 28 + 18}px` }}>
          <img src={asset(`/media/dogs/${sc.dog}.gif`)} alt="" width={34} height={34} />
          <div>
            <div className="f-top"><span className={`tagsev ${sc.sev}`}>{sc.sev === "crit" ? "Critical" : "High"}</span><b>{sc.title}</b></div>
            <p><span>Exploit</span>{sc.exploit}</p>
            <p className="f-fix"><span>Fix</span>{phase === "fix" ? "Applied, line " + (sc.bad + 12) : "Smallest change suggested"}</p>
          </div>
        </div>
      </div>

      <div className="demo-foot">
        <div className="who">
          <img src={asset(`/media/dogs/${sc.dog}.gif`)} alt="" width={26} height={26} />
          <span><b>{dogName}</b> {phase === "write" ? "is watching" : phase === "sniff" ? "is sniffing…" : phase === "flag" ? "found a risk" : "verified the fix"}</span>
        </div>
        <code className="cmdline">$ {sc.cmd}</code>
        <div className="tally"><b>{found}</b> found · <b className="g">{fixed}</b> fixed</div>
      </div>
    </div>
  );
}
