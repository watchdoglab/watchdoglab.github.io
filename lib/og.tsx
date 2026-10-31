import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ImageResponse } from "next/og";

// Shared look for the social share cards (1200×630), rendered once at build time.
export const ogSize = { width: 1200, height: 630 };

const img = (name: string) => `data:image/png;base64,${readFileSync(join(process.cwd(), "lib/og", `${name}.png`)).toString("base64")}`;

export function ogCard({ eyebrow, title, sub, image }: { eyebrow: string; title: string; sub: string; image: string }) {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#f3f7ff", fontFamily: "sans-serif", position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, display: "flex", backgroundImage: "radial-gradient(circle at 1px 1px, #c3d1ea 1.5px, transparent 0)", backgroundSize: "28px 28px", opacity: 0.6 }} />
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "64px 0 64px 72px", width: 760 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <img src={img("watchdog")} width={56} height={56} style={{ borderRadius: 12 }} alt="" />
            <span style={{ fontSize: 32, fontWeight: 700, color: "#0b1220" }}>Watchdog</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 22, letterSpacing: 3, textTransform: "uppercase", color: "#2a56c4", marginBottom: 18 }}>{eyebrow}</span>
            <span style={{ fontSize: 64, lineHeight: 1.05, fontWeight: 700, color: "#0b1220", letterSpacing: -2 }}>{title}</span>
            <span style={{ fontSize: 28, lineHeight: 1.35, color: "#3b4659", marginTop: 22 }}>{sub}</span>
          </div>
          <span style={{ fontSize: 24, color: "#2a56c4" }}>watchdoglab.github.io</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1 }}>
          <div style={{ display: "flex", width: 340, height: 340, borderRadius: 40, background: "#fff", border: "2px solid #c3d1ea", alignItems: "center", justifyContent: "center", boxShadow: "0 30px 60px -20px rgba(42,86,196,.35)" }}>
            <img src={img(image)} width={280} height={280} style={{ borderRadius: 32 }} alt="" />
          </div>
        </div>
      </div>
    ),
    ogSize,
  );
}
