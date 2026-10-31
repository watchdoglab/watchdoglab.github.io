import { REPO, absoluteUrl, bundles, dogs, faqs, features, installSteps, site } from "@/lib/site";

export const dynamic = "force-static";

/** Everything on the site as plain text, for answer engines. */
export function GET() {
  const body = [
    `# ${site.title}`,
    "",
    site.description,
    "",
    `Website: ${absoluteUrl("/")}  Source: ${REPO}`,
    "",
    "## Features",
    ...features.flatMap((f) => [`### ${f.title}`, f.body, ""]),
    "## Commands",
    ...bundles.map((b) => `- ${b.cmd} (${b.for}): ${b.dogs.join(", ")}`),
    "",
    "## Dogs",
    ...dogs.map((d) => `- ${d.name} (${d.role}, ${d.cmd}): ${d.desc}`),
    "",
    "## Install",
    ...installSteps.map((s, i) => `${i + 1}. ${s.name}: ${s.text}`),
    "",
    "## FAQ",
    ...faqs.flatMap((f) => [`### ${f.q}`, f.a, ""]),
  ].join("\n");
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
