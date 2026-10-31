import detail from "./dogs-detail.json";
import { bundles, dogs } from "./site";

/** Each dog's page color, taken from the dominant hue of its artwork. */
const accent: Record<string, string> = {
  malinois: "#3fbfa6", bloodhound: "#e8b030", doberman: "#d13030", husky: "#4fb0c6", collie: "#8b6fd6", beagle: "#d9822b", rottweiler: "#a8561e",
  shepherd: "#1fa855", dachshund: "#c2203a", akita: "#3a7bd5", pointer: "#d6b448", shiba: "#e06a10", saintbernard: "#d0453a", pyrenees: "#2a9a94",
};

export const accentOf = (id: string) => accent[id] ?? "#3fbfa6";

type Detail = (typeof detail)[keyof typeof detail];

export type Dog = (typeof dogs)[number] & Detail & {
  ix: number; accent: string; inBundles: string[]; next: (typeof dogs)[number]; prev: (typeof dogs)[number];
};

const clean = (s: string) => s.replace(/`bench\/`/g, "Its test target").replace(/`([^`]+)`/g, "$1");

export function getDog(id: string): Dog | undefined {
  const k = dogs.findIndex((d) => d.id === id);
  if (k < 0) return undefined;
  const d = detail[id as keyof typeof detail];
  return {
    ...dogs[k], ...d, bench: clean(d.bench), intro: clean(d.intro), lens: clean(d.lens),
    ix: k + 1, accent: accent[id], inBundles: bundles.filter((b) => b.dogs.includes(id) && b.cmd !== "/watchdog-go-all").map((b) => b.cmd),
    next: dogs[(k + 1) % dogs.length], prev: dogs[(k - 1 + dogs.length) % dogs.length],
  };
}

const plain = (s: string) => s.replace(/`([^`]+)`/g, "$1").replace(/\*\*(.+?)\*\*/g, "$1");
const list = (xs: string[]) => (xs.length < 2 ? xs.join("") : `${xs.slice(0, -1).join(", ")} and ${xs[xs.length - 1]}`);

/** Per-dog questions people actually search for; rendered on the page and as FAQPage data. */
export function dogFaqs(d: Dog) {
  const faqs = [
    {
      q: `What does ${d.name} check for?`,
      a: `${d.name} is Watchdog's ${d.role.toLowerCase()} dog for Claude Code. It looks for ${list(d.checks.map((c) => c.t))}. Each finding comes with the exact file and line, how it could be abused, and the smallest fix.`,
    },
    {
      q: `How do I run ${d.name} in Claude Code?`,
      a: `Install Watchdog with /plugin marketplace add watchdoglab/watchdog and /plugin install watchdog@watchdog, then run ${d.cmd}.${d.commands.length > 1 ? ` It also has ${list(d.commands.slice(1).map((c) => c.cmd))}.` : ""} Its lens also stays on while you code and flags risky lines as they're written.`,
    },
  ];
  if (d.scanners.length) faqs.push({
    q: `Which tools does ${d.name} use?`,
    a: `When they're installed, ${d.name} runs ${list(d.scanners)}, then reads the code those scanners can't understand. Anything it couldn't check is listed under Not checked in the report.`,
  });
  faqs.push({
    q: `Is ${d.name} safe to run on my project?`,
    a: `Yes. Its first rule: ${plain(d.rules[0])} Secrets it finds are reported by location and type only, never printed. Watchdog is free and open source (MIT).`,
  });
  return faqs;
}
