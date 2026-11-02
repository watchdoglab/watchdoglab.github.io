/* eslint-disable @next/next/no-img-element -- static export: plain <img> with basePath-aware src */
import Link from "next/link";
import { ThemeToggle } from "@/components/Bits";
import { ORG, REPO, SPONSORS, asset, dogs } from "@/lib/site";

export function Nav() {
  return (
    <header className="nav">
      <div className="nav-in">
        <Link className="brand" href="/"><img src={asset("/watchdog-icon-128.png")} alt="" width={28} height={28} /><span>Watchdog Lab</span></Link>
        <nav className="links" aria-label="Main">
          <Link href="/watchdog/">Watchdog</Link>
          <Link href="/action/">GitHub Action</Link>
        </nav>
        <div className="nav-cta">
          <ThemeToggle />
          <a className="btn sm ghost" href={ORG}>GitHub</a>
          <Link className="btn sm blue" href="/#products">Products</Link>
        </div>
      </div>
    </header>
  );
}

/** Dotted globe for the hero: a sphere of dots plus a ring of dog nodes. */
export function DotGlobe({ dense }: { dense?: boolean }) {
  if (dense) return <Scope />;
  const dots: { x: number; y: number; r: number; o: number }[] = [];
  for (let lat = -80; lat <= 80; lat += 8) {
    const rl = Math.cos((lat * Math.PI) / 180);
    const n = Math.max(6, Math.round(46 * rl));
    for (let k = 0; k < n; k++) {
      const lon = (k / n) * Math.PI * 2;
      const z = Math.cos(lon) * rl;
      if (z < -0.05) continue;
      dots.push({ x: 300 + Math.sin(lon) * rl * 250, y: 300 - Math.sin((lat * Math.PI) / 180) * 250, r: 1.2 + z * 1.6, o: 0.25 + z * 0.65 });
    }
  }
  return (
    <svg className="globe" viewBox="0 0 600 600" aria-hidden="true">
      <defs>
        <radialGradient id="gl" cx="40%" cy="35%" r="70%"><stop offset="0" stopColor="var(--surface)" stopOpacity=".9" /><stop offset="1" stopColor="var(--acc-100)" stopOpacity="0" /></radialGradient>
      </defs>
      <circle cx="300" cy="300" r="262" fill="url(#gl)" />
      {dots.map((d, k) => <circle key={k} cx={d.x.toFixed(1)} cy={d.y.toFixed(1)} r={d.r.toFixed(2)} fill="var(--acc-600)" opacity={d.o.toFixed(2)} />)}
    </svg>
  );
}

/** Full-bleed hero backdrop: a giant radar scope. Dotted range rings, a rotating sweep, and blips. */
function Scope() {
  const C = 500, rings = [90, 170, 250, 330, 410, 490];
  const dots: string[] = [];
  const dot = (x: number, y: number, r: number) => `M${x.toFixed(1)} ${y.toFixed(1)}m-${r} 0a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 -${2 * r} 0`;
  rings.forEach((R, i) => {
    const n = Math.round((2 * Math.PI * R) / 9);
    for (let k = 0; k < n; k++) { const a = (k / n) * Math.PI * 2; dots.push(dot(C + Math.cos(a) * R, C + Math.sin(a) * R, i === rings.length - 1 ? 2.4 : 1.7)); }
  });
  // radial spokes every 30°, dotted
  for (let s = 0; s < 12; s++) {
    const a = (s / 12) * Math.PI * 2;
    for (let r = 40; r < 490; r += 14) dots.push(dot(C + Math.cos(a) * r, C + Math.sin(a) * r, 1.2));
  }
  const blips = [{ a: 200, r: 300 }, { a: 245, r: 190 }, { a: 300, r: 380 }, { a: 160, r: 420 }, { a: 330, r: 240 }];
  return (
    <div className="scope" aria-hidden="true">
      <svg viewBox="0 0 1000 1000">
        <path d={dots.join("")} fill="var(--planet-dot)" />
        {Array.from({ length: 120 }, (_, k) => <line key={k} x1="500" y1="2" x2="500" y2={k % 10 ? 14 : 30} transform={`rotate(${k * 3} 500 500)`} stroke="var(--planet-dot)" strokeWidth={k % 10 ? 1.5 : 3} />)}
        <circle cx="500" cy="500" r="8" fill="var(--planet-dot)" />
      </svg>
      <div className="scope-sweep" />
      {blips.map((b, k) => {
        const a = (b.a * Math.PI) / 180;
        return <span key={k} className="blip" style={{ left: `${50 + (Math.cos(a) * b.r) / 10}%`, top: `${50 + (Math.sin(a) * b.r) / 10}%`, animationDelay: `${((b.a + 90) / 360) * 8 - 8}s` }} />;
      })}
    </div>
  );
}

export function Footer() {
  return (
    <footer className="foot">
      <div className="wrap foot-grid">
        <div>
          <Link className="brand" href="/"><img src={asset("/watchdog-icon-128.png")} alt="" width={28} height={28} /><span>Watchdog Lab</span></Link>
          <p className="muted">Security for autonomous coding. AI writes the code. Watchdog guards it.</p>
        </div>
        <div>
          <div className="eyebrow">Products</div>
          <ul>
            <li><Link href="/watchdog/">Watchdog for Claude Code</Link></li>
            <li><Link href="/action/">GitHub Action</Link></li>
          </ul>
        </div>
        <div>
          <div className="eyebrow">Watchdog</div>
          <ul>
            <li><Link href="/watchdog/#pack">The pack ({dogs.length} dogs)</Link></li>
            <li><Link href="/watchdog/#commands">Commands</Link></li>
            <li><Link href="/watchdog/#install">Install</Link></li>
            <li><Link href="/watchdog/#faq">FAQ</Link></li>
          </ul>
        </div>
        <div>
          <div className="eyebrow">Lab</div>
          <ul>
            <li><Link href="/#philosophy">Philosophy</Link></li>
            <li><a href={ORG}>GitHub</a></li>
            <li><a href={`${REPO}/issues`}>Issues</a></li>
            <li><a href={SPONSORS}>Sponsor</a></li>
          </ul>
        </div>
      </div>
      <div className="wrap foot-bar"><span>© {new Date().getFullYear()} Watchdog Lab · MIT</span><span>Static by default · secrets never printed</span></div>
    </footer>
  );
}
