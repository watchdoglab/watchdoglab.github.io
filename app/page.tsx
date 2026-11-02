import type { Metadata } from "next";
import Link from "next/link";
import { DotGlobe, Footer, Nav } from "@/components/Chrome";
import { ORG, absoluteUrl, dogs } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: "Watchdog Lab · Security for autonomous coding" },
  description: "AI writes the code. Watchdog guards it. Watchdog Lab builds the security that keeps pace with AI agents.",
  alternates: { canonical: absoluteUrl("/") },
  openGraph: { title: "Watchdog Lab · Security for autonomous coding", description: "AI writes the code. Watchdog guards it.", url: absoluteUrl("/"), siteName: "Watchdog Lab" },
  twitter: { title: "Watchdog Lab · Security for autonomous coding", description: "AI writes the code. Watchdog guards it." },
};

const principles = [
  { t: "Always on guard", d: "Security runs while you build, not after. Every change gets watched the moment it's written." },
  { t: "Fix, not fear", d: "Every finding comes with the line, why it matters, and the smallest fix." },
  { t: "Safe by design", d: "Static by default, read-only in CI, and secrets are never printed." },
];

const products = [
  { k: "Claude Code plugin", t: "Watchdog", d: `${dogs.length} security dogs that review your code live while you build, plus whole-repo audits.`, href: "/watchdog/", cta: "Meet the pack" },
  { k: "GitHub Action", t: "Watchdog PR Review", d: "The pack on every pull request: inline comments on risky lines with a fix, then one summary.", href: "/action/", cta: "Set it up" },
];

export default function Home() {
  return (
    <>
      <Nav />
      <main id="main">
        <section className="dhero hero ahero">
          <div className="hero-planet"><DotGlobe dense /></div>
          <div className="wrap">
            <div className="eyebrow">Watchdog Lab · Security for autonomous coding</div>
            <h1>AI writes the code. Watchdog guards it.</h1>
            <p className="lead">AI agents now write, review and ship code on their own. <b>Watchdog Lab builds the security that keeps pace:</b> dogs that watch every change, flag the risk, and hand you the fix, without slowing you down.</p>
            <div className="ctas">
              <a className="btn blue" href="#products">See the products <span>→</span></a>
              <a className="btn ghost" href={ORG}>GitHub <span>↗</span></a>
            </div>
          </div>
        </section>

        <section className="sec" id="philosophy">
          <div className="wrap">
            <div className="head"><div className="eyebrow">Philosophy</div><h2>Autonomous code needs autonomous security.</h2></div>
            <div className="cards three">
              {principles.map((p, k) => <article className="card" key={p.t}><span className="num">0{k + 1}</span><h3>{p.t}</h3><p>{p.d}</p></article>)}
            </div>
          </div>
        </section>

        <section className="sec tint" id="products">
          <div className="wrap">
            <div className="head"><div className="eyebrow">Products</div><h2>One pack, wherever code is written.</h2></div>
            <div className="cards two-up">
              {products.map((p) => (
                <Link className="card" href={p.href} key={p.href}>
                  <span className="num">{p.k}</span><h3>{p.t}</h3><p>{p.d}</p>
                  <span className="more">{p.cta} →</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
