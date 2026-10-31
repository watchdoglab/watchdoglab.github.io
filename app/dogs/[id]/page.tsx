/* eslint-disable @next/next/no-img-element -- static export: plain <img> with basePath-aware src */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Cmd } from "@/components/Bits";
import { Footer, Nav } from "@/components/Chrome";
import { getDog } from "@/lib/dogs";
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
  const total = d.total ?? Math.max(...d.results.map((r) => r.found));

  return (
    <>
      <Nav />
      <main id="main">
        <section className="dhero">
          <div className="wrap dhero-grid">
            <div>
              <Link className="announce" href="/#pack"><span className="dot" />The pack · {pad(d.ix)} / {dogs.length} <span>→</span></Link>
              <div className="eyebrow">{d.role}</div>
              <h1>{d.name}</h1>
              <p className="lead"><b>{d.tagline}.</b> {d.desc}</p>
              <div className="ctas"><Cmd text={d.cmd} dark /></div>
            </div>
            <div className="dog-art"><img src={asset(`/media/dogs/${d.id}.gif`)} alt={`${d.name}, the Watchdog ${d.role} dog`} width={320} height={320} /></div>
          </div>
        </section>

        <section className="sec">
          <div className="wrap two">
            <div><div className="eyebrow">What it does</div><h2>On duty while you build.</h2></div>
            <div className="why"><p className="big">{d.intro}</p><p>{d.lens}</p></div>
          </div>
        </section>

        <section className="sec tint">
          <div className="wrap">
            <div className="head"><div className="eyebrow">What it checks</div><h2>{d.checks.length} things {d.name} looks for.</h2></div>
            <div className="cards three">
              {d.checks.map((c, k) => <article className="card" key={c.t}><span className="num">{pad(k + 1)}</span><h3>{c.t}</h3><p>{c.d}</p></article>)}
            </div>
          </div>
        </section>

        <section className="sec">
          <div className="wrap two">
            <div>
              <div className="eyebrow">Commands</div>
              <h2>Send {d.name} out.</h2>
              {d.scanners.length > 0 && <>
                <p className="muted">Runs these scanners when installed, then reads the code they can&apos;t understand:</p>
                <ul className="chips">{d.scanners.map((s) => <li key={s}>{s}</li>)}</ul>
              </>}
            </div>
            <div className="cmdlist">
              {d.commands.map((c) => <div className="cmdrow" key={c.cmd}><Cmd text={c.cmd} /><p>{c.does}</p></div>)}
              {d.inBundles.length > 0 && <div className="cmdrow"><ul className="chips">{[...d.inBundles, "/watchdog-go-all"].map((b) => <li key={b}>{b}</li>)}</ul><p>Also runs in these bundles.</p></div>}
            </div>
          </div>
        </section>

        {d.results.length > 0 && (
          <section className="sec tint">
            <div className="wrap two">
              <div><div className="eyebrow">Benchmark</div><h2>Tested, not promised.</h2><p className="muted">{d.bench}</p></div>
              <div className="panel">
                <div className="eyebrow">{d.unit}</div>
                {d.results.map((r) => (
                  <div className="lane" key={r.model}>
                    <span>{r.model} 5.5</span>
                    <span className="track"><i style={{ width: `${(r.found / total) * 100}%` }} /></span>
                    <b>{r.found}/{total}</b>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="sec">
          <div className="wrap two">
            <div><div className="eyebrow">Rules of engagement</div><h2>What {d.name} will never do.</h2></div>
            <ol className="steps">{d.rules.map((r, k) => <li key={k}><span>{k + 1}</span><div><p>{r}</p></div></li>)}</ol>
          </div>
        </section>

        <section className="cta">
          <div className="wrap">
            <h2>{d.name} comes with the pack.</h2>
            <div className="term-in">{installCommands.map((c) => <Cmd key={c} text={c} dark />)}</div>
            <div className="ctas">
              <Link className="btn blue" href={`/dogs/${d.next.id}/`}>Next: {d.next.name} <span>→</span></Link>
              <a className="btn ghost light" href={`${REPO}/blob/main/docs/${d.id}.md`}>Docs on GitHub <span>↗</span></a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
