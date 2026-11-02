"use client";
/* eslint-disable @next/next/no-img-element -- static export: plain <img> with basePath-aware src */
import { useEffect, useState } from "react";
import { scenes as all } from "@/lib/scenes";
import { asset } from "@/lib/site";

// What really happens on GitHub: PR opened → the workflow job runs → one review is posted
// (summary body + inline comment with a suggestion block), as scripts/post-review.js does.
const STEPS = ["Set up job", "Run actions/checkout@v4", "Run watchdoglab/watchdog-action@v1", "Post review"];
const PHASES = [1600, 3400, 4200, 3600]; // opened, checks, review, done

const SEV = { crit: { icon: "🔴", word: "critical" }, high: { icon: "🟠", word: "high" } } as const;
const PRS = ["Add user lookup route", "Verify session tokens", "Add invoice download"];

/** A pull request reviewed by the Watchdog Action, step by step as it happens on GitHub. */
export default function PrDemo({ ids = ["malinois", "doberman", "bloodhound"] }: { ids?: string[] }) {
  const scenes = ids.map((id) => all[id]);
  const [s, setS] = useState(0);
  const [p, setP] = useState(0);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setP(2); setStep(STEPS.length); return; }
    const t = setTimeout(() => {
      if (p < PHASES.length - 1) { setP(p + 1); setStep(0); }
      else { setP(0); setS((s + 1) % scenes.length); }
    }, PHASES[p]);
    return () => clearTimeout(t);
  }, [p, s, scenes.length]);

  // tick the job steps while the check runs
  useEffect(() => {
    if (p !== 1 || step >= STEPS.length) return;
    const t = setTimeout(() => setStep(step + 1), step === 2 ? 1300 : 600);
    return () => clearTimeout(t);
  }, [p, step]);

  const sc = scenes[s];
  const sev = SEV[sc.sev];
  const num = 41 + s;
  const tab = p === 2 ? "files" : p === 1 ? "checks" : "conv";
  const checkDone = p >= 2;

  return (
    <div className="gh" aria-label="Animated example: the Watchdog GitHub Action reviews a pull request">
      <div className="gh-head">
        <div className="gh-title">{PRS[s]} <span>#{num}</span></div>
        <div className="gh-meta"><span className="gh-open">Open</span><b>dev-ana</b> wants to merge 1 commit into <code>main</code></div>
        <div className="gh-tabs">
          <span className={tab === "conv" ? "on" : ""}>Conversation</span>
          <span className={tab === "checks" ? "on" : ""}>Checks <i>1</i></span>
          <span className={tab === "files" ? "on" : ""}>Files changed <i>1</i></span>
        </div>
      </div>

      <div className="gh-body" key={`${s}-${tab}`}>
        {tab === "checks" && (
          <div className="gh-job">
            <div className="gh-jobhead"><Status done={step >= STEPS.length} /> <b>Watchdog PR Review / review</b> <small>pull_request</small></div>
            <ol>
              {STEPS.map((x, k) => (
                <li key={x} className={k < step ? "is-done" : k === step ? "is-run" : ""}><Status done={k < step} idle={k > step} /><span>{x}</span></li>
              ))}
            </ol>
            {step >= 3 && <pre className="gh-log">🐕 dogs: all · min_severity: medium{"\n"}Found 1 issue · posting review…</pre>}
          </div>
        )}

        {tab === "files" && (
          <div className="gh-files">
            <div className="gh-file"><code>{sc.file}</code><small>+{sc.code.length}</small></div>
            {sc.code.map((line, k) => (
              <div key={k}>
                <div className={`gh-ln${k === sc.bad ? " hit" : ""}`}><span>{k + 12}</span><em>+</em><code>{line || " "}</code></div>
                {k === sc.bad && (
                  <div className="gh-comment">
                    <div className="gh-who"><img src={asset("/action-icon.png")} alt="" width={20} height={20} /><b>github-actions</b><small>bot</small> commented</div>
                    <p><b>{sev.icon} [{sev.word}] {sc.title}</b></p>
                    <p className="gh-muted">{sc.exploit}. Smallest fix below.</p>
                    <div className="gh-sugg">
                      <div className="gh-sugg-h">Suggested change</div>
                      <code className="del">- {line.trim()}</code>
                      <code className="add">+ {sc.fix.trim()}</code>
                      <button type="button" tabIndex={-1}>Commit suggestion</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {tab === "conv" && (
          <div className="gh-conv">
            <div className="gh-event"><span className="gh-dot" /><b>dev-ana</b> opened this pull request</div>
            {p === 3 && (
              <>
                <div className="gh-review">
                  <div className="gh-who"><img src={asset("/action-icon.png")} alt="" width={20} height={20} /><b>github-actions</b><small>bot</small> reviewed</div>
                  <h4>🐕 Watchdog security review</h4>
                  <p>{sev.icon} 1 {sev.word}</p>
                  <p className="gh-muted"><b>{sc.title}</b> in <code>{sc.file}:{sc.bad + 12}</code>. See the inline comment for the fix.</p>
                  <p className="gh-muted"><b>Not checked:</b> runtime config, deployed infrastructure.</p>
                </div>
              </>
            )}
            <div className={`gh-checks${checkDone ? " is-done" : ""}`}>
              <Status done={checkDone} idle={p === 0} />
              <span><b>{checkDone ? "All checks have passed" : "Some checks haven't completed yet"}</b><small>Watchdog PR Review / review (pull_request)</small></span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Status({ done, idle }: { done?: boolean; idle?: boolean }) {
  return <i className={`gh-st ${done ? "is-done" : idle ? "is-idle" : "is-run"}`} aria-hidden="true" />;
}
