import { ogCard, ogSize } from "@/lib/og";
import { dogs } from "@/lib/site";

export const dynamic = "force-static";
export const dynamicParams = false;
export const alt = "A Watchdog security dog";
export const size = ogSize;
export const contentType = "image/png";

export function generateStaticParams() {
  return dogs.map((d) => ({ id: d.id }));
}

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const dog = dogs.find((x) => x.id === id)!;
  return ogCard({ eyebrow: `Watchdog · ${dog.role}`, title: `${dog.name}, the ${dog.role} dog`, sub: dog.desc, image: dog.id });
}
