import { ogCard, ogSize } from "@/lib/og";

export const dynamic = "force-static";
export const alt = "Watchdog: a Claude Code security plugin with 14 security dogs";
export const size = ogSize;
export const contentType = "image/png";

export default function Image() {
  return ogCard({
    eyebrow: "Claude Code security plugin",
    title: "Security review, running while you build.",
    sub: "14 security dogs flag vulnerabilities as you code. Free and open source.",
    image: "watchdog",
  });
}
