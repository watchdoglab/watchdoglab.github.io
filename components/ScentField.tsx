"use client";
import { useEffect, useRef } from "react";

/**
 * Hero canvas: a field of source code. A radar sweep and the cursor's "nose" light it up;
 * hidden vulnerabilities flare red when either passes over them, then fade back into the code.
 */
const SRC = `const user = await db.query("SELECT * FROM users WHERE id=" + req.query.id);
if (token == process.env.ADMIN) grant(req.user, "*");
fetch(req.body.url).then(r => r.text()).then(send);
res.setHeader("Access-Control-Allow-Origin", req.headers.origin);
const key = "sk_live_51H8x9QeZ"; // TODO move
el.innerHTML = params.get("q");
exec(\`convert \${file.name} out.png\`);
allow read, write: if true;
jwt.verify(t, secret, { algorithms: ["none", "HS256"] });
tools.shell({ cmd: llm.output });
`;
const VULN = ["+ req.query.id", "sk_live_51H8x9QeZ", "innerHTML", "if true", "\"none\"", "llm.output", "req.body.url", "exec("];

export default function ScentField() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current!;
    const ctx = cv.getContext("2d")!;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let W = 0, H = 0, cols = 0, rows = 0, cw = 0, ch = 0, dpr = 1;
    let chars: string[] = [], vuln: Uint8Array = new Uint8Array(0), heat = new Float32Array(0), alarm = new Float32Array(0);
    const mouse = { x: -999, y: -999, tx: -999, ty: -999 };
    let raf = 0, angle = -Math.PI / 2, visible = true;

    const build = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = cv.clientWidth; H = cv.clientHeight;
      cv.width = W * dpr; cv.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const fs = W < 700 ? 11 : 13;
      ctx.font = `${fs}px ${getComputedStyle(document.documentElement).getPropertyValue("--mono") || "monospace"}`;
      cw = Math.ceil(ctx.measureText("M").width); ch = Math.round(fs * 1.55);
      cols = Math.ceil(W / cw); rows = Math.ceil(H / ch);
      const lines = SRC.split("\n").filter(Boolean);
      chars = []; vuln = new Uint8Array(cols * rows);
      for (let r = 0; r < rows; r++) {
        // Each row is a source line, offset so the field doesn't look tiled.
        const ln = lines[(r * 7) % lines.length];
        const pad = " ".repeat((r * 13) % 9);
        let row = "";
        while (row.length < cols) row += pad + ln + "   ";
        row = row.slice((r * 17) % 23, ((r * 17) % 23) + cols).padEnd(cols);
        for (let c = 0; c < cols; c++) chars.push(row[c]);
        for (const v of VULN) {
          let i = row.indexOf(v);
          while (i !== -1) { for (let k = 0; k < v.length && i + k < cols; k++) vuln[r * cols + i + k] = 1; i = row.indexOf(v, i + 1); }
        }
      }
      heat = new Float32Array(cols * rows); alarm = new Float32Array(cols * rows);
    };

    const draw = (dt: number) => {
      ctx.clearRect(0, 0, W, H);
      mouse.x += (mouse.tx - mouse.x) * 0.16; mouse.y += (mouse.ty - mouse.y) * 0.16;
      angle += dt * 0.9;
      const cx = W * 0.5, cy = H * 0.56, R = Math.hypot(W, H) * 0.6, nose = W < 700 ? 110 : 170;
      const sweep = ((angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);

      for (let r = 0; r < rows; r++) {
        const y = r * ch + ch * 0.8;
        for (let c = 0; c < cols; c++) {
          const i = r * cols + c, s = chars[i];
          if (s === " ") continue;
          const x = c * cw;
          // Radar: brightness trails behind the sweep line.
          let a = Math.atan2(y - cy, x - cx); if (a < 0) a += Math.PI * 2;
          let d = sweep - a; if (d < 0) d += Math.PI * 2;
          const trail = d < 1.1 ? 1 - d / 1.1 : 0;
          const md = Math.hypot(x - mouse.x, y - mouse.y);
          const sniff = md < nose ? 1 - md / nose : 0;
          const h = Math.max(trail * 0.42, sniff);
          heat[i] = Math.max(h, heat[i] * 0.92);
          if (vuln[i] && h > 0.35) alarm[i] = 1;
          alarm[i] *= 0.985;
          const al = alarm[i], he = heat[i];
          if (al > 0.05) {
            ctx.fillStyle = `rgba(255,59,48,${0.25 + al * 0.75})`;
          } else {
            const base = 0.05 + he * 0.7;
            ctx.fillStyle = he > 0.08 ? `rgba(220,230,242,${base})` : "rgba(214,228,245,.055)";
          }
          ctx.fillText(s, x, y);
        }
      }
      // Sweep line + rings.
      ctx.save();
      ctx.translate(cx, cy);
      const g = ctx.createLinearGradient(0, 0, Math.cos(angle) * R, Math.sin(angle) * R);
      g.addColorStop(0, "rgba(220,230,242,.55)"); g.addColorStop(1, "rgba(220,230,242,0)");
      ctx.strokeStyle = g; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(angle) * R, Math.sin(angle) * R); ctx.stroke();
      ctx.strokeStyle = "rgba(214,228,245,.06)";
      for (let k = 1; k <= 4; k++) { ctx.beginPath(); ctx.arc(0, 0, k * Math.min(W, H) * 0.17, 0, Math.PI * 2); ctx.stroke(); }
      ctx.restore();
    };

    let last = performance.now();
    const loop = (t: number) => {
      const dt = Math.min(0.05, (t - last) / 1000); last = t;
      if (visible) draw(dt);
      raf = requestAnimationFrame(loop);
    };
    const move = (e: PointerEvent) => { const b = cv.getBoundingClientRect(); mouse.tx = e.clientX - b.left; mouse.ty = e.clientY - b.top; if (mouse.x < -900) { mouse.x = mouse.tx; mouse.y = mouse.ty; } };
    const leave = () => { mouse.tx = -999; mouse.ty = -999; };
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });

    build();
    if (reduce) { angle = 0.6; draw(0); }
    else {
      raf = requestAnimationFrame(loop);
      window.addEventListener("pointermove", move);
      document.addEventListener("pointerleave", leave);
      io.observe(cv);
    }
    const ro = new ResizeObserver(() => { build(); if (reduce) draw(0); });
    ro.observe(cv);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); window.removeEventListener("pointermove", move); document.removeEventListener("pointerleave", leave); };
  }, []);

  return <canvas ref={ref} className="field" aria-hidden="true" />;
}
