import { ogCard, ogSize } from "@/lib/og";

export const dynamic = "force-static";
export const alt = "Watchdog Lab: security for autonomous coding";
export const size = ogSize;
export const contentType = "image/png";

export default function Image() {
  return ogCard({
    eyebrow: "Watchdog Lab",
    title: "AI writes the code. Watchdog guards it.",
    sub: "Security for autonomous coding: a Claude Code plugin and a GitHub Action. Free and open source.",
    image: "watchdog",
  });
}
