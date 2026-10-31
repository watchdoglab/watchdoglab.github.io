"use client";
/* eslint-disable @next/next/no-img-element -- static export: plain <img> with basePath-aware src */
import { useEffect, useState } from "react";
import { asset } from "@/lib/site";

type Scene = {
  file: string; dog: string; dogName: string; cmd: string;
  code: string[]; bad: number; fix: string;
  sev: "crit" | "high"; title: string; exploit: string;
};

/** Three short stories: write code → a dog sniffs → flags the exact line → the fix lands. */
const scenes: Scene[] = [
  {
    file: "src/routes/users.ts", dog: "malinois", dogName: "Malinois", cmd: "/watchdog-go-vapt code",
    code: [
      'users.get("/:id", async (req, res) => {',
      '  const sql = "SELECT * FROM users WHERE id = " + req.params.id;',
      "  const row = await db.raw(sql);",
      "  res.json(row);",
      "});",
    ],
    bad: 1, fix: '  const row = await db.query("SELECT * FROM users WHERE id = $1", [req.params.id]);',
    sev: "crit", title: "SQL injection", exploit: "GET /users/1 OR 1=1 dumps every user",
  },
  {
    file: "infra/storage.tf", dog: "husky", dogName: "Husky", cmd: "/watchdog-go-cloud",
    code: [
      'resource "aws_s3_bucket" "uploads" {',
      '  bucket = "acme-user-uploads"',
      '  acl    = "public-read"',
      "  tags   = { team = \"core\" }",
      "}",
    ],
    bad: 2, fix: '  acl    = "private"',
    sev: "high", title: "Public S3 bucket", exploit: "Anyone can list and download user files",
  },
  {
    file: "agent/tools.py", dog: "collie", dogName: "Collie", cmd: "/watchdog-go-ai",
    code: [
      "@tool",
      "def run(cmd: str) -> str:",
      "    return subprocess.check_output(cmd, shell=True)",
      "",
      "agent = Agent(tools=[search, run])",
    ],
    bad: 2, fix: "    return run_allowlisted(cmd)  # approval + allowlist",
    sev: "crit", title: "Agent tool runs any shell command", exploit: "A prompt-injected web page can wipe the server",
  },
];

// phase timings (ms): write → sniff → flag → fix
const PHASES = [1900, 1300, 2600, 2200];

export default function HeroDemo() {
  const [s, setS] = useState(0);
  const [p, setP] = useState(0);
  const [found, setFound] = useState(0);
  const [fixed, setFixed] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setP(2); return; }
    const t = setTimeout(() => {
      if (p === 1) setFound((n) => n + 1);
      if (p === 2) setFixed((n) => n + 1);
      if (p < PHASES.length - 1) setP(p + 1);
      else { setP(0); setS((s + 1) % scenes.length); }
    }, PHASES[p]);
    return () => clearTimeout(t);
  }, [p, s]);

  const sc = scenes[s];
  const phase = ["write", "sniff", "flag", "fix"][p];

  return (
    <div className={`demo ph-${phase}`} aria-label="Animated example: a Watchdog dog finds a vulnerable line and fixes it">
      <div className="demo-bar">
        <span /><span /><span />
        <code>claude · acme-app</code>
        <em className="live"><i />watching</em>
      </div>

      <div className="demo-tabs">
        {scenes.map((x, k) => <span key={x.file} className={k === s ? "on" : ""}>{x.file.split("/").pop()}</span>)}
      </div>

      <div className="demo-code" key={s}>
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
          <span><b>{sc.dogName}</b> {phase === "write" ? "is watching" : phase === "sniff" ? "is sniffing…" : phase === "flag" ? "found a risk" : "verified the fix"}</span>
        </div>
        <code className="cmdline">$ {sc.cmd}</code>
        <div className="tally"><b>{found}</b> found · <b className="g">{fixed}</b> fixed</div>
      </div>
    </div>
  );
}
