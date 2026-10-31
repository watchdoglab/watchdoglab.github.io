/* eslint-disable @next/next/no-img-element -- static export: plain <img> with basePath-aware src */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Cmd } from "@/components/Bits";
import DogMotion from "@/components/DogMotion";
import { accentOf, getDog } from "@/lib/dogs";
import { REPO, absoluteUrl, asset, dogs, installCommands } from "@/lib/site";

export const dynamicParams = false;
export function generateStaticParams() {
  return dogs.map((d) => ({ id: d.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const d = getDog((await params).id);
  if (!d) return {};
  const title = `${d.name}, the ${d.role} dog`;
  return {
    title, description: `${d.desc} ${d.intro}`,
    alternates: { canonical: absoluteUrl(`/dogs/${d.id}/`) },
    openGraph: { title: `${title} · Watchdog`, description: d.desc, url: absoluteUrl(`/dogs/${d.id}/`) },
  };
}

const pad = (n: number) => String(n).padStart(2, "0");

export default async function DogPage({ params }: { params: Promise<{ id: string }> }) {
  const d = getDog((await params).id);
  if (!d) notFound();
  const best = Math.max(...d.results.map((r) => r.found));

  return (
    <div className="dog" style={{ "--acc": d.accent } as React.CSSProperties}>
      <DogMotion key={d.id} />
      <div className="wipe" aria-hidden="true"><span>{d.name}</span></div>
      <div className="reticle" aria-hidden="true"><i /><b /><span className="rt-xy">000 · 000</span><span className="rt-lbl" /></div>
      <div className="scan" aria-hidden="true" />

      <nav aria-label="Main">
        <Link className="brand" href="/" data-hover="home" data-wipe data-wipe-label="the pack" data-wipe-color="#2ed4bf"><img src={asset("/watchdog-icon.png")} alt="" width={30} height={30} /><span>WATCHDOG</span></Link>
        <div className="links">
          <Link href={`/dogs/${d.prev.id}/`} data-hover="prev" data-wipe data-wipe-label={d.prev.name} data-wipe-color={accentOf(d.prev.id)}>← {d.prev.name}</Link>
          <span className="pos">{pad(d.ix)} / {dogs.length}</span>
          <Link href={`/dogs/${d.next.id}/`} data-hover="next" data-wipe data-wipe-label={d.next.name} data-wipe-color={accentOf(d.next.id)}>{d.next.name} →</Link>
        </div>
        <a className="pill" href="#install" data-hover="install"><span>Install</span><span>Install</span></a>
      </nav>

      <main id="main">
        {/* ── Dossier hero ─────────────────────────────────────────── */}
        <section id="top" className="dhero">
          <div className="bgwords" aria-hidden="true">
            {[0, 1, 2].map((r) => (
              <div className="bgrow" key={r} data-bgrow={r}>{Array.from({ length: 6 }, (_, k) => <span key={k}>{d.role} ·&nbsp;</span>)}</div>
            ))}
          </div>
          <svg className="rings" viewBox="0 0 100 100" aria-hidden="true" data-rings>
            <circle cx="50" cy="50" r="48" className="r1" /><circle cx="50" cy="50" r="38" className="r2" /><circle cx="50" cy="50" r="28" className="r3" />
            {Array.from({ length: 60 }, (_, k) => <line key={k} x1="50" y1="1" x2="50" y2={k % 5 ? 3 : 5} transform={`rotate(${k * 6} 50 50)`} className="tick" />)}
          </svg>
          <div className="dog-stage" data-dogstage>
            <img src={asset(`/media/dogs/${d.id}.gif`)} alt={`${d.name}, the Watchdog ${d.role} dog`} width={420} height={420} data-dogimg />
          </div>

          <div className="hud tl"><span className="blink">●</span> case file {pad(d.ix)} · {d.role}</div>
          <div className="hud tr">on duty · {d.checks.length} checks · {d.scanners.length} tools</div>

          <h1 className="dname" data-dname aria-label={d.name}>
            <span className="stroke" aria-hidden="true">{d.name}</span>
            <span className="fill" aria-hidden="true">{d.name}</span>
          </h1>
          <div className="dhero-foot">
            <p className="tagline" data-dintro><span>{d.tagline}.</span> {d.desc}</p>
            <div data-dintro><Cmd text={d.cmd} /></div>
          </div>
          <div className="hud bl">open the file <span className="arrow">↓</span></div>
          <div className="hud br">{d.inBundles.length ? `in ${d.inBundles.length} bundle${d.inBundles.length > 1 ? "s" : ""}` : "runs alone"}</div>
        </section>

        {/* ── Statement ────────────────────────────────────────────── */}
        <section className="statement" aria-label="About">
          <p data-words>{d.intro} <em>{d.lens}</em></p>
        </section>

        {/* ── Checks: a stack of case cards ───────────────────────── */}
        <section className="checks" aria-labelledby="checks-h">
          <div className="checks-head">
            <span className="tag">01 / what it sniffs</span>
            <h2 id="checks-h" data-split>{d.checks.length} things {d.name} never misses.</h2>
          </div>
          <div className="stack" data-stack>
            {d.checks.map((c, k) => (
              <article className="scard" key={c.t} data-scard>
                <span className="s-ix">{pad(k + 1)}</span>
                <div>
                  <h3>{c.t}</h3>
                  <p>{c.d}</p>
                </div>
                <span className="s-count">{pad(k + 1)} / {pad(d.checks.length)}</span>
              </article>
            ))}
          </div>
        </section>

        {/* ── Commands ─────────────────────────────────────────────── */}
        <section className="sec" aria-labelledby="cmd-h">
          <div className="wrap">
            <div className="sec-head">
              <span className="tag">02 / commands</span>
              <h2 id="cmd-h" data-split>Send {d.name} out.</h2>
            </div>
            <div className="cmdlist">
              {d.commands.map((c) => (
                <div className="cmdrow" key={c.cmd} data-cmdrow><Cmd text={c.cmd} /><p>{c.does}</p></div>
              ))}
              {d.inBundles.length > 0 && (
                <div className="cmdrow" data-cmdrow>
                  <div className="bund">{d.inBundles.map((b) => <code key={b}>{b}</code>)}<code>/watchdog-go-all</code></div>
                  <p>Also runs as part of these bundles.</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ── Tools: an orbit ─────────────────────────────────────── */}
        {d.scanners.length > 0 && (
          <section className="sec orbit-sec" aria-labelledby="tools-h">
            <div className="wrap orbit-grid">
              <div className="sec-head">
                <span className="tag">03 / tools it runs</span>
                <h2 id="tools-h" data-split>Brings its own kit.</h2>
                <p>{d.name} runs these scanners when they&apos;re installed, then reads the code they can&apos;t understand. Anything missing is listed under Not checked.</p>
              </div>
              <div className="orbit" data-orbit>
                <img src={asset(`/media/dogs/${d.id}.gif`)} alt="" width={180} height={180} className="o-dog" />
                <div className="o-ring" data-oring>
                  {d.scanners.map((s, k) => (
                    <span key={s} className="o-chip" style={{ "--a": `${(k / d.scanners.length) * 360}deg` } as React.CSSProperties}><code>{s}</code></span>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ── Benchmark ────────────────────────────────────────────── */}
        {d.results.length > 0 && (
          <section className="sec" aria-labelledby="bench-h">
            <div className="wrap bench">
              <div className="sec-head">
                <span className="tag">04 / tested, not promised</span>
                <h2 id="bench-h" data-split>The benchmark.</h2>
                <p>{d.bench}</p>
              </div>
              <div className="score">
                <div className="big"><span data-count={best}>{best}</span><i>/{d.total ?? best}</i></div>
                <small>best score · {d.unit}</small>
                <div className="race">
                  {d.results.map((r) => (
                    <div className="lane" key={r.model}>
                      <span>{r.model} 5.5</span>
                      <span className="track"><i style={{ width: `${(r.found / (d.total ?? best)) * 100}%` }} data-lane /></span>
                      <b>{r.found}</b>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ── Rules of engagement ─────────────────────────────────── */}
        <section className="rules" aria-labelledby="rules-h">
          <div className="tape" aria-hidden="true" data-tape><div>{Array.from({ length: 8 }, (_, k) => <span key={k}>Rules of engagement ✕ do not cross ✕&nbsp;</span>)}</div></div>
          <div className="wrap">
            <h2 id="rules-h" className="sr">Rules of engagement</h2>
            <ol className="rlist">
              {d.rules.map((r, k) => <li key={k} data-rule><span>{pad(k + 1)}</span><p>{r}</p></li>)}
            </ol>
          </div>
        </section>

        {/* ── Install ─────────────────────────────────────────────── */}
        <section id="install" className="sec" aria-labelledby="install-h">
          <div className="wrap">
            <div className="sec-head">
              <span className="tag">05 / install</span>
              <h2 id="install-h" data-split>{d.name} comes with the pack.</h2>
              <p>One plugin brings all {dogs.length} dogs. Then run <code>{d.cmd}</code>.</p>
            </div>
            <div className="copyrow">{installCommands.map((c) => <Cmd key={c} text={c} />)}</div>
          </div>
        </section>

        {/* ── Next dog ────────────────────────────────────────────── */}
        <section className="nextdog" aria-label="Next dog">
          <Link href={`/dogs/${d.next.id}/`} data-hover="next dog" data-wipe data-wipe-label={d.next.name} data-wipe-color={accentOf(d.next.id)} data-next>
            <span className="tag">next case file · {pad(d.ix === dogs.length ? 1 : d.ix + 1)}</span>
            <span className="nname">{d.next.name}</span>
            <span className="nrole">{d.next.role} →</span>
            <img src={asset(`/media/dogs/${d.next.id}.gif`)} alt="" width={240} height={240} data-nextimg />
          </Link>
        </section>
      </main>

      <footer>
        <Link href="/" data-wipe data-wipe-label="the pack" data-wipe-color="#2ed4bf">← all dogs</Link>
        <span>Static by default · secrets never printed</span>
        <a href={`${REPO}/blob/main/plugins/watchdog/docs/${d.id}.md`}>Docs on GitHub ↗</a>
      </footer>
    </div>
  );
}
