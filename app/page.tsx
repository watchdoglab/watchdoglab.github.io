/* eslint-disable @next/next/no-img-element -- static export: plain <img> with basePath-aware src */
import Link from "next/link";
import { BundlePicker, Cmd } from "@/components/Bits";
import { Footer, HeroRadar, Nav } from "@/components/Chrome";
import { REPO, VERSION, asset, dogs, faqs, features, installCommands, installSteps } from "@/lib/site";

const scanners = ["semgrep", "gitleaks", "trivy", "checkov", "osv-scanner", "bandit", "slither", "mobsf"];

const uses = [
  { k: "01", t: "Live lens while you code", d: "Each dog stays on all session and flags risky code the moment it's written: the line, the exploit, the smallest fix." },
  { k: "02", t: "Whole-repo audit", d: "One command reviews the entire repo and returns a ranked report, Critical to Low, with file:line for every finding." },
  { k: "03", t: "Bundles per product", d: "Pick what you're building and one command sends the right dogs. No guessing which checks apply." },
  { k: "04", t: "Client-ready report", d: "/watchdog-go-vapt report turns the session's findings into one report you can hand over." },
  { k: "05", t: "Compliance mapping", d: "Pyrenees maps findings to SOC 2, ISO 27001, PCI DSS and OWASP ASVS before the auditor asks." },
];

const sev = [
  { k: "crit", label: "Critical", n: 2 },
  { k: "high", label: "High", n: 5 },
  { k: "med", label: "Medium", n: 9 },
  { k: "low", label: "Low", n: 4 },
];
const sevTotal = sev.reduce((a, s) => a + s.n, 0);

const findings = [
  { s: "crit", t: "SQL injection in GET /users/:id", f: "src/routes/users.ts:12", dog: "malinois" },
  { s: "crit", t: "IDOR: any user can read any invoice", f: "src/routes/invoices.ts:31", dog: "bloodhound" },
  { s: "high", t: "JWT accepted with alg=none", f: "src/auth/jwt.ts:18", dog: "doberman" },
  { s: "high", t: "S3 bucket is public-read", f: "infra/storage.tf:7", dog: "husky" },
  { s: "med", t: "Agent tool can run shell without approval", f: "agent/tools.py:44", dog: "collie" },
];
const sevName = { crit: "Critical", high: "High", med: "Medium" } as const;

const compare = [
  { area: "Code", old: "SAST and dependency scanners", gap: "Exploitability and business logic", wd: "Dogs read the code scanners can't understand" },
  { area: "While building", old: "Review happens after the PR", gap: "Bugs ship before anyone looks", wd: "Live lens flags risk as the line is written" },
  { area: "Pen testing", old: "Deep, point-in-time, expensive", gap: "Nothing between engagements", wd: "Run a full audit any time, for free" },
  { area: "Reporting", old: "Long PDF, security jargon", gap: "Devs don't know what to fix first", wd: "Ranked, plain English, smallest fix" },
];

export default function Home() {
  return (
    <>
      <Nav />
      <main id="main">
        {/* ── Hero ─────────────────────────────────────────────── */}
        <section id="top" className="hero">
          <div className="wrap hero-grid">
            <div className="hero-copy">
              <a className="announce" href={REPO}><span className="dot" />v{VERSION} · 14 dogs, one install <span>→</span></a>
              <h1>Security review,<br />running while you build.</h1>
              <p className="lead">A pack of security dogs inside Claude Code. They flag real vulnerabilities as you write code and audit the whole repo with one command.</p>
              <div className="ctas">
                <Link className="btn dark" href="#install">Install the pack <span>→</span></Link>
                <a className="btn ghost" href={REPO}>View on GitHub <span>↗</span></a>
              </div>
            </div>
            <div className="hero-art">
              <HeroRadar />
              <div className="float f1"><span className="sev crit" />SQL injection · users.ts:12</div>
              <div className="float f2"><span className="sev high" />Public S3 bucket · storage.tf:7</div>
              <div className="float f3"><span className="ok" />Fix verified</div>
            </div>
          </div>
          <div className="wrap strip">
            <div><Icon k="pulse" />Always-on security lens</div>
            <div><Icon k="grid" />14 dogs, one per surface</div>
            <div><Icon k="flow" />Built into Claude Code</div>
          </div>
        </section>

        {/* ── Tools ───────────────────────────────────────────── */}
        <section className="logos">
          <div className="wrap">
            <p>Works with the scanners you already use</p>
            <ul>{scanners.map((s) => <li key={s}>{s}</li>)}</ul>
          </div>
        </section>

        {/* ── Why ─────────────────────────────────────────────── */}
        <section className="sec">
          <div className="wrap two">
            <div>
              <div className="eyebrow">Why Watchdog</div>
              <h2>From late, costly reviews to a pack on duty.</h2>
            </div>
            <div className="why">
              <p className="big">Security review usually comes late, costs a lot, or never happens.</p>
              <p>Watchdog moves it into the moment you write the code. Find vulnerabilities as your product changes, not months later, then go straight from the finding to the fix.</p>
            </div>
          </div>
        </section>

        {/* ── How teams use it ────────────────────────────────── */}
        <section id="how" className="sec tint">
          <div className="wrap">
            <div className="head">
              <div className="eyebrow">How teams use Watchdog</div>
              <h2>Run it while you build, or send the whole pack.</h2>
              <p className="muted">Use a single dog for one surface, a bundle for your product type, or every dog at once.</p>
            </div>
            <div className="cards five">
              {uses.map((u) => (
                <article className="card" key={u.k}>
                  <span className="num">{u.k}</span>
                  <h3>{u.t}</h3>
                  <p>{u.d}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ── Report mock ─────────────────────────────────────── */}
        <section className="sec">
          <div className="wrap">
            <div className="head">
              <div className="eyebrow">The report</div>
              <h2>Every finding, ranked in one place.</h2>
              <p className="muted">Severity, the exact line, how it gets abused and the smallest fix. Every report ends with what was not checked.</p>
            </div>
            <div className="dash">
              <div className="dash-bar"><span /><span /><span /><code>/watchdog-go-web · acme-api</code></div>
              <div className="dash-grid">
                <div className="panel">
                  <div className="eyebrow">Findings</div>
                  <div className="stat">{sevTotal}</div>
                  <div className="sevbar">{sev.map((s) => <i key={s.k} className={s.k} style={{ flex: s.n }} />)}</div>
                  <ul className="sevlist">{sev.map((s) => <li key={s.k}><span className={`sev ${s.k}`} />{s.label}<b>{s.n}</b></li>)}</ul>
                </div>
                <div className="panel wide">
                  <div className="eyebrow">Top findings</div>
                  <ul className="flist">
                    {findings.map((f) => (
                      <li key={f.t}>
                        <span className={`tagsev ${f.s}`}>{sevName[f.s as keyof typeof sevName]}</span>
                        <span className="ft"><b>{f.t}</b><code>{f.f}</code></span>
                        <img src={asset(`/media/dogs/${f.dog}.gif`)} alt={f.dog} width={28} height={28} />
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="panel">
                  <div className="eyebrow">Fix · users.ts:12</div>
                  <pre className="diff"><span className="del">- const sql = &quot;SELECT … id = &quot; + id;</span>{"\n"}<span className="add">+ db.query(&quot;… id = $1&quot;, [id]);</span></pre>
                </div>
                <div className="panel">
                  <div className="eyebrow">Not checked</div>
                  <ul className="nc"><li>Runtime config on prod</li><li>Third-party SaaS settings</li><li>Business rules outside the repo</li></ul>
                </div>
                <div className="panel">
                  <div className="eyebrow">Secrets</div>
                  <p className="small">2 found, reported by location and type only. Values are never printed.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── The pack ────────────────────────────────────────── */}
        <section id="pack" className="sec tint">
          <div className="wrap">
            <div className="head">
              <div className="eyebrow">The pack</div>
              <h2>Fourteen dogs. Each guards one surface.</h2>
              <p className="muted">Start with the dog you need, then add more.</p>
            </div>
            <div className="pack">
              {dogs.map((d) => (
                <Link className="dogcard" key={d.id} href={`/dogs/${d.id}/`}>
                  <img src={asset(`/media/dogs/${d.id}.gif`)} alt="" width={64} height={64} />
                  <div className="eyebrow">{d.role}</div>
                  <h3>{d.name}</h3>
                  <p>{d.desc}</p>
                  <code>{d.cmd}</code>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── Commands ────────────────────────────────────────── */}
        <section id="commands" className="sec">
          <div className="wrap">
            <div className="head">
              <div className="eyebrow">Commands</div>
              <h2>One command for what you&apos;re building.</h2>
            </div>
            <BundlePicker />
          </div>
        </section>

        {/* ── Comparison ──────────────────────────────────────── */}
        <section className="sec tint">
          <div className="wrap">
            <div className="head">
              <div className="eyebrow">Why Watchdog</div>
              <h2>Close the gaps between your scanners and your pen test.</h2>
            </div>
            <div className="table" role="table">
              <div className="tr th" role="row"><span>Coverage</span><span>Traditional approach</span><span>The gap</span><span>Watchdog</span></div>
              {compare.map((c) => (
                <div className="tr" role="row" key={c.area}>
                  <span><b>{c.area}</b></span><span>{c.old}</span><span className="gap">{c.gap}</span><span className="wd">{c.wd}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Features ────────────────────────────────────────── */}
        <section className="sec">
          <div className="wrap">
            <div className="head">
              <div className="eyebrow">What you get</div>
              <h2>Findings your team can act on.</h2>
            </div>
            <div className="cards three">
              {features.map((f) => <article className="card flat" key={f.title}><h3>{f.title}</h3><p>{f.body}</p></article>)}
            </div>
            <div className="stats">
              <div><b>14</b><span>security dogs</span></div>
              <div><b>40</b><span>commands and lenses</span></div>
              <div><b>0</b><span>accounts or telemetry</span></div>
              <div><b>MIT</b><span>free and open source</span></div>
            </div>
          </div>
        </section>

        {/* ── Install ─────────────────────────────────────────── */}
        <section id="install" className="sec tint">
          <div className="wrap two">
            <div>
              <div className="eyebrow">Install</div>
              <h2>Up and running in a minute.</h2>
              <ol className="steps">{installSteps.map((s, k) => <li key={s.name}><span>{k + 1}</span><div><b>{s.name}</b><p>{s.text}</p></div></li>)}</ol>
            </div>
            <div className="term">
              <div className="dash-bar"><span /><span /><span /><code>claude</code></div>
              <div className="term-in">{installCommands.map((c) => <Cmd key={c} text={c} dark />)}<Cmd text="/watchdog-go-all" dark /></div>
            </div>
          </div>
        </section>

        {/* ── FAQ ─────────────────────────────────────────────── */}
        <section id="faq" className="sec">
          <div className="wrap two">
            <div>
              <div className="eyebrow">FAQ</div>
              <h2>Questions, answered.</h2>
            </div>
            <div className="faq">
              {faqs.map((f) => <details key={f.q}><summary>{f.q}</summary><p>{f.a}</p></details>)}
            </div>
          </div>
        </section>

        {/* ── CTA ─────────────────────────────────────────────── */}
        <section className="cta">
          <div className="wrap">
            <h2>From the first finding to the fix.</h2>
            <div className="ctas">
              <Link className="btn blue" href="#install">Install the pack <span>→</span></Link>
              <a className="btn ghost light" href={REPO}>Star on GitHub <span>↗</span></a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function Icon({ k }: { k: "pulse" | "grid" | "flow" }) {
  const p = {
    pulse: "M2 12h4l3-7 4 14 3-7h6",
    grid: "M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z",
    flow: "M5 6h8a3 3 0 0 1 0 6H9a3 3 0 0 0 0 6h10M17 15l3 3-3 3",
  }[k];
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d={p} /></svg>;
}
