import type { MetadataRoute } from "next";
import { absoluteUrl, dogs } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date("2026-10-30");
  return [
    { url: absoluteUrl("/"), lastModified, changeFrequency: "weekly", priority: 1 },
    ...dogs.map((d) => ({ url: absoluteUrl(`/dogs/${d.id}/`), lastModified, changeFrequency: "monthly" as const, priority: 0.8 })),
  ];
}
