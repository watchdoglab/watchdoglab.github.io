import type { MetadataRoute } from "next";
import { absoluteUrl, dogs } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date(); // build date: every deploy refreshes it
  return [
    { url: absoluteUrl("/"), lastModified, changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/watchdog/"), lastModified, changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/action/"), lastModified, changeFrequency: "monthly", priority: 0.9 },
    ...dogs.map((d) => ({ url: absoluteUrl(`/dogs/${d.id}/`), lastModified, changeFrequency: "monthly" as const, priority: 0.8 })),
  ];
}
