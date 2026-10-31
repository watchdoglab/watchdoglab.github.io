/* eslint-disable @next/next/no-img-element -- static export: plain <img> with basePath-aware src */
import Link from "next/link";
import { BundleRadar, Cmd } from "@/components/Bits";
import Motion from "@/components/Motion";
import ScentField from "@/components/ScentField";
import { ASCII_DOG } from "@/lib/ascii-dog";
import { accentOf } from "@/lib/dogs";
import { REPO, SPONSORS, VERSION, asset, dogs, faqs, installCommands, site } from "@/lib/site";

const code: { t: string; v?: boolean; fix?: string }[] = [
  { t: "import { Router } from \"express\";" },
  { t: "import { db } from \"../db\";" },
  { t: "import { requireUser } from \"../auth\";" },
  { t: "" },
  { t: "export const users = Router();" },
  { t: "" },
  { t: "users.get(\"/me\", requireUser, async (req, res) => {" },
  { t: "  res.json(req.user);" },
  { t: "});" },
  { t: "" },
  { t: "users.get(\"/:id\", async (req, res) => {" },
  { t: "  const sql = \"SELECT * FROM users WHERE id = \" + req.params.id;", v: true, fix: "  const row = await db.query(\"SELECT * FROM users WHERE id = $1\", [req.params.id]);" },
  { t: "  const row = await db.raw(sql);" },
  { t: "  res.json(row);" },
  { t: "});" },
  { t: "" },
  { t: "users.post(\"/\", requireUser, async (req, res) => {" },
  { t: "  const user = await db.users.create(pick(req.body, FIELDS));" },
  { t: "  res.status(201).json(user);" },
  { t: "});" },
];
const VULN_LINE = code.findIndex((l) => l.v) + 1;

const sev = [
  { k: "crit", label: "Critical", n: 2, w: 18 },
  { k: "high", label: "High", n: 5, w: 42 },
  { k: "med", label: "Medium", n: 9, w: 74 },
  { k: "low", label: "Low", n: 4, w: 32 },
];

export default function Home() {
  return (
    <>
      <Motion />
      <div id="loader" aria-hidden="true">
        <div className="ld-top"><span>watchdog://boot</span><span data-load-status>scanning…</span></div>
        <pre className="ld-ascii" data-ascii>{ASCII_DOG}</pre>
        <div className="ld-foot">
          <div className="ld-num"><span data-load>000</span><i>%</i></div>
          <p>sniffing the perimeter<span className="caret" /></p>
        </div>
        <div className="ld-bar"><i data-load-bar /></div>
      </div>
      <div className="wipe" aria-hidden="true"><span /></div>
      <div className="reticle" aria-hidden="true"><i /><b /><span className="rt-xy">000 · 000</span><span className="rt-lbl" /></div>
      <div className="scan" aria-hidden="true" />

      <nav aria-label="Main">
        <a className="brand" href="#top" data-hover="home"><img src={asset("/watchdog-icon.png")} alt="" width={30} height={30} /><span>WATCHDOG</span></a>
        <div className="links">
          <a href="#hunt" data-hover="go">Hunt</a>
          <a href="#pack" data-hover="go">Pack</a>
          <a href="#radar" data-hover="go">Commands</a>
          <a href="#faq" data-hover="go">FAQ</a>
          <a href={REPO} data-hover="repo">GitHub ↗</a>
        </div>
        <a className="pill" href="#install" data-hover="install"><span>Install</span><span>Install</span></a>
      </nav>

      <main id="main">
        {/* ── 01 Hero: a field of code that the pack sweeps ───────────── */}
        <section id="top" className="hero">
          <ScentField />
          <div className="hero-glow" aria-hidden="true" />
          <img className="hero-dog" src={asset("/watchdog-icon.png")} alt="" width={720} height={720} />
          <div className="hud tl"><span className="blink">●</span> live · perimeter 01</div>
          <div className="hud tr">v{VERSION} · MIT · claude code</div>
          <div className="hero-in">
            <p className="kicker" data-intro>Security review inside Claude Code</p>
            <h1 className="mega" data-mega>
              <span className="row">Your code</span>
              <span className="row">has a <em>scent.</em></span>
            </h1>
            <div className="hero-foot" data-intro>
              <p>
                Fourteen security dogs live in your editor. They sniff every change, <b>lock onto the exact line</b>, and tell you
                how it gets abused and the smallest fix. Move your cursor. Find what they find.
              </p>
              <div className="ctas">
                <a className="btn" href="#install" data-hover="install">Unleash the pack <span>→</span></a>
                <a className="btn line" href={REPO} data-hover="repo">Source ↗</a>
              </div>
            </div>
          </div>
          <div className="hud bl">scroll to start the hunt <span className="arrow">↓</span></div>
          <div className="hud br"><span data-threat>0</span> threats sniffed</div>
        </section>

        {/* ── 02 Statement: words light up as you scroll ─────────────── */}
        <section className="statement" aria-label="Why">
          <p data-words>
            Security review comes late. It costs a lot. Usually it never happens, and by then the bug has shipped.
            <em> A good dog doesn&apos;t wait for the audit.</em> It sits next to you and barks the second something smells wrong.
          </p>
        </section>

        {/* ── 03 The hunt: pinned, scrubbed sequence ─────────────────── */}
        <section id="hunt" className="hunt" aria-labelledby="hunt-h">
          <div className="hunt-pin">
            <header className="hunt-head">
              <h2 id="hunt-h" className="sr">How a dog finds a bug</h2>
              <ol className="steps">
                {["Sniff", "Lock", "Explain", "Fix"].map((s, k) => <li key={s} data-step={k}><span>0{k + 1}</span>{s}</li>)}
              </ol>
            </header>
            <div className="hunt-grid">
              <div className="editor">
                <div className="ed-bar"><span>routes/users.ts</span><span className="ed-dog"><img src={asset("/media/dogs/malinois.gif")} alt="" width={22} height={22} />malinois watching</span></div>
                <div className="ed-body">
                  <div className="scanbar" data-scanbar />
                  {code.map((l, k) => (
                    <div key={k} className={`ln${l.v ? " vuln" : ""}`} data-ln={k}>
                      <span className="no">{k + 1}</span>
                      <code className="src">{l.t || " "}</code>
                      {l.fix && <code className="fixed">{l.fix}</code>}
                    </div>
                  ))}
                </div>
              </div>
              <aside className="finding" data-finding aria-label="Finding">
                <img className="f-dog" src={asset("/media/dogs/malinois.gif")} alt="Malinois, the VAPT dog" data-fdog />
                <div className="f-card">
                  <div className="f-sev">● CRITICAL <span>SQL injection</span></div>
                  <div className="f-loc">routes/users.ts:{VULN_LINE}</div>
                  <dl>
                    <div data-frow><dt>What</dt><dd>The id from the URL is pasted into the SQL query.</dd></div>
                    <div data-frow><dt>Abuse</dt><dd><code>/users/1 OR 1=1</code> returns every user in the table.</dd></div>
                    <div data-frow><dt>Fix</dt><dd>Pass it as a parameter. One line, shown in the editor.</dd></div>
                    <div data-frow><dt>If not</dt><dd>Full database read. Breach notice. Bad week.</dd></div>
                  </dl>
                  <div className="f-ok" data-fok>✓ fixed · re-sniffed · clean</div>
                </div>
              </aside>
            </div>
          </div>
        </section>

        {/* ── 04 The pack: horizontal dossier reel ──────────────────── */}
        <section id="pack" className="pack" aria-labelledby="pack-h">
          <div className="pack-pin">
            <div className="pack-head">
              <h2 id="pack-h" data-split>Fourteen noses.<br />One pack.</h2>
              <p>Each dog guards one surface and answers to its own command. One install brings them all.</p>
            </div>
            <div className="pack-track" data-track>
              {dogs.map((d, k) => (
                <Link className="dossier" key={d.id} href={`/dogs/${d.id}/`} data-hover={`open ${d.name.toLowerCase()}`} data-wipe data-wipe-label={d.name} data-wipe-color={accentOf(d.id)} style={{ "--acc": accentOf(d.id) } as React.CSSProperties}>
                  <span className="d-ix">{String(k + 1).padStart(2, "0")}</span>
                  <div className="d-img"><img src={asset(`/media/dogs/${d.id}.gif`)} alt={`${d.name}, the ${d.role} dog`} width={220} height={220} loading="lazy" data-dimg /></div>
                  <span className="d-role">{d.role}</span>
                  <h3>{d.name}</h3>
                  <p>{d.desc}</p>
                  <code>{d.cmd}</code>
                  <span className="d-open">Open case file →</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── 05 Radar: pick a bundle ───────────────────────────────── */}
        <section id="radar" className="sec" aria-labelledby="radar-h">
          <div className="wrap">
            <div className="sec-head">
              <span className="tag">05 / commands</span>
              <h2 id="radar-h" data-split>What are you building?</h2>
              <p>One command sends the right dogs. They come back with one report.</p>
            </div>
            <BundleRadar />
          </div>
        </section>

        {/* ── 06 Report ─────────────────────────────────────────────── */}
        <section id="report" className="sec" aria-labelledby="report-h">
          <div className="wrap report">
            <div className="sec-head">
              <span className="tag">06 / the report</span>
              <h2 id="report-h" data-split>Ranked. Merged. Honest.</h2>
              <p>Critical to Low, duplicates merged, every finding with <code>file:line</code>. Secrets by location only. And every report ends with what it didn&apos;t check.</p>
            </div>
            <div className="bars" data-bars>
              {sev.map((s) => (
                <div className={`bar ${s.k}`} key={s.k}>
                  <span className="lbl">{s.label}</span>
                  <span className="track"><i style={{ width: `${s.w}%` }} data-bar /></span>
                  <span className="num" data-count={s.n}>{s.n}</span>
                </div>
              ))}
              <div className="notchecked">
                <span>Not checked</span>
                <ul><li>runtime config on production</li><li>third-party payment flow</li><li>physical / social engineering</li></ul>
              </div>
            </div>
          </div>
        </section>

        {/* ── 07 Install ────────────────────────────────────────────── */}
        <section id="install" className="sec install" aria-labelledby="install-h">
          <div className="wrap">
            <div className="sec-head">
              <span className="tag">07 / install</span>
              <h2 id="install-h" data-split>Two lines. Whole pack.</h2>
            </div>
            <div className="term" data-term>
              <div className="t-bar"><i /><i /><i /><span>claude</span></div>
              <div className="t-body">
                {installCommands.map((c) => <div className="t-line" key={c}><span className="pr">›</span><span data-type={c}>{c}</span></div>)}
                <div className="t-out" data-tout>✓ watchdog installed · 14 dogs · 21 commands</div>
                <div className="t-line"><span className="pr">›</span><span data-type="/watchdog-go-web">/watchdog-go-web</span><i className="caret" /></div>
              </div>
            </div>
            <div className="copyrow">{installCommands.map((c) => <Cmd key={c} text={c} />)}</div>
          </div>
        </section>

        {/* ── 08 FAQ ────────────────────────────────────────────────── */}
        <section id="faq" className="sec" aria-labelledby="faq-h">
          <div className="wrap faq">
            <div className="sec-head">
              <span className="tag">08 / faq</span>
              <h2 id="faq-h" data-split>Questions.</h2>
            </div>
            <div>
              {faqs.map((f, i) => (
                <details key={f.q} open={i === 0}>
                  <summary data-hover="open"><span className="q-ix">{String(i + 1).padStart(2, "0")}</span><h3>{f.q}</h3><span className="pm" /></summary>
                  <p>{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ── 09 Outro ──────────────────────────────────────────────── */}
        <section className="outro" aria-labelledby="outro-h">
          <h2 id="outro-h" className="giant" data-giant>
            <span>Sit.</span><span>Stay.</span><span className="sig">Secure.</span>
          </h2>
          <div className="parade" aria-hidden="true">
            <div className="parade-track" data-parade>
              {[0, 1].map((r) => dogs.map((d) => <img key={`${r}${d.id}`} src={asset(`/media/dogs/${d.id}.gif`)} alt="" width={96} height={96} loading="lazy" />))}
            </div>
          </div>
          <a className="btn" href="#install" data-hover="install">Install Watchdog <span>→</span></a>
        </section>
      </main>

      <footer>
        <span>© 2026 {site.author.name}</span>
        <span>Static by default · active tests only in your written scope</span>
        <span><a href={REPO}>Source</a> · <a href={`${REPO}/issues`}>Issues</a> · <a href={SPONSORS}>Sponsor</a></span>
      </footer>
    </>
  );
}
