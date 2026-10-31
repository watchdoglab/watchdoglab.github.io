/* eslint-disable @next/next/no-img-element -- static export: plain <img> with basePath-aware src */
import Link from "next/link";
import { ThemeToggle } from "@/components/Bits";
import { REPO, SPONSORS, VERSION, asset, dogs } from "@/lib/site";

export function Nav() {
  return (
    <header className="nav">
      <div className="nav-in">
        <Link className="brand" href="/"><img src={asset("/watchdog-icon-128.png")} alt="" width={28} height={28} /><span>Watchdog</span></Link>
        <nav className="links" aria-label="Main">
          <Link href="/#how">How it works</Link>
          <Link href="/#pack">The pack</Link>
          <Link href="/#commands">Commands</Link>
          <Link href="/#faq">FAQ</Link>
        </nav>
        <div className="nav-cta">
          <ThemeToggle />
          <a className="btn sm ghost" href={REPO}>GitHub</a>
          <Link className="btn sm blue" href="/#install">Install</Link>
        </div>
      </div>
    </header>
  );
}

/** Dotted globe for the hero: a sphere of dots plus a ring of dog nodes. */
export function DotGlobe({ dense }: { dense?: boolean }) {
  if (dense) return <Planet />;
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
        <radialGradient id="gl" cx="40%" cy="35%" r="70%"><stop offset="0" stopColor="var(--surface)" stopOpacity=".9" /><stop offset="1" stopColor="var(--blue-100)" stopOpacity="0" /></radialGradient>
      </defs>
      <circle cx="300" cy="300" r="262" fill="url(#gl)" />
      {dots.map((d, k) => <circle key={k} cx={d.x.toFixed(1)} cy={d.y.toFixed(1)} r={d.r.toFixed(2)} fill="var(--blue-600)" opacity={d.o.toFixed(2)} />)}
    </svg>
  );
}

/** Full-bleed hero backdrop: a big halftone planet lit from the top left, rising out of the corner. */
function Planet() {
  const dots: string[] = [];
  const R = 500, L = [-0.55, -0.6, 0.58]; // light direction
  for (let lat = -88; lat <= 88; lat += 3.2) {
    const la = (lat * Math.PI) / 180, rl = Math.cos(la);
    const n = Math.max(8, Math.round(150 * rl));
    for (let k = 0; k < n; k++) {
      const lon = (k / n) * Math.PI * 2 + lat * 0.013;
      const x = Math.sin(lon) * rl, y = -Math.sin(la), z = Math.cos(lon) * rl;
      if (z < 0.02) continue;
      const lit = Math.max(0, x * L[0] + y * L[1] + z * L[2]);
      // pseudo-continents: a few smooth bumps make some regions denser
      const land = Math.sin(lon * 3 + la * 2) + Math.cos(lon * 2 - la * 4) > 0.9;
      const r = (land ? 3.4 : 1.9) * (0.4 + lit * 0.9);
      dots.push(`M${(R + x * R).toFixed(1)} ${(R + y * R).toFixed(1)}m-${r.toFixed(2)} 0a${r.toFixed(2)} ${r.toFixed(2)} 0 1 0 ${(2 * r).toFixed(2)} 0a${r.toFixed(2)} ${r.toFixed(2)} 0 1 0 -${(2 * r).toFixed(2)} 0`);
    }
  }
  return (
    <svg className="planet" viewBox="0 0 1000 1000" aria-hidden="true">
      <defs>
        <radialGradient id="pl" cx="30%" cy="25%" r="80%"><stop offset="0" stopColor="#fff" stopOpacity=".8" /><stop offset=".6" stopColor="#fff" stopOpacity=".3" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></radialGradient>
      </defs>
      <circle cx="500" cy="500" r="500" fill="url(#pl)" />
      <path d={dots.join("")} fill="var(--planet-dot)" />
      <circle cx="500" cy="500" r="499" fill="none" stroke="var(--planet-dot)" strokeOpacity=".5" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="foot">
      <div className="wrap foot-grid">
        <div>
          <Link className="brand" href="/"><img src={asset("/watchdog-icon-128.png")} alt="" width={28} height={28} /><span>Watchdog</span></Link>
          <p className="muted">Security review that runs while you build, inside Claude Code. Free and MIT licensed.</p>
        </div>
        <div>
          <div className="eyebrow">The pack</div>
          <ul>{dogs.slice(0, 7).map((d) => <li key={d.id}><Link href={`/dogs/${d.id}/`}>{d.name}</Link></li>)}</ul>
        </div>
        <div>
          <div className="eyebrow">&nbsp;</div>
          <ul>{dogs.slice(7).map((d) => <li key={d.id}><Link href={`/dogs/${d.id}/`}>{d.name}</Link></li>)}</ul>
        </div>
        <div>
          <div className="eyebrow">Project</div>
          <ul>
            <li><a href={REPO}>GitHub</a></li>
            <li><a href={`${REPO}/issues`}>Issues</a></li>
            <li><a href={SPONSORS}>Sponsor</a></li>
            <li><Link href="/#faq">FAQ</Link></li>
          </ul>
        </div>
      </div>
      <div className="wrap foot-bar"><span>v{VERSION} · MIT</span><span>Static by default · secrets never printed</span></div>
    </footer>
  );
}
