import detail from "./dogs-detail.json";
import { bundles, dogs } from "./site";

/** Each dog's page accent. */
const accent: Record<string, string> = {
  malinois: "#2ed4bf", bloodhound: "#ff8a3d", doberman: "#ff4d7a", husky: "#64d2ff", collie: "#b388ff", beagle: "#ffd60a", rottweiler: "#ff6a3d",
  shepherd: "#3dffb4", dachshund: "#ff9fd6", akita: "#ff3b30", pointer: "#c6ff3d", shiba: "#ffb020", saintbernard: "#ff6b6b", pyrenees: "#e9e6dc",
};

export const accentOf = (id: string) => accent[id] ?? "#2ed4bf";

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
