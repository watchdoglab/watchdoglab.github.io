import { REPO, VERSION, absoluteUrl, bundles, dogs, installCommands, site } from "@/lib/site";

export const dynamic = "force-static";

/** llms.txt: concise, LLM-friendly summary (https://llmstxt.org). */
export function GET() {
  const body = [
    `# ${site.name}`,
    "",
    `> ${site.description}`,
    "",
    `- Runs in: ${site.requirements}`,
    `- Price: free, open source (MIT)`,
    `- Latest version: ${VERSION}`,
    `- Install: ${installCommands.join(" then ")}`,
    `- Source code: ${REPO}`,
    "",
    "## Commands",
    ...bundles.map((b) => `- ${b.cmd}: ${b.for}`),
    "",
    "## Dogs",
    ...dogs.map((d) => `- ${d.name} (${d.role}, ${d.cmd}): ${d.desc}`),
    "",
    "## Optional",
    `- [Full details and FAQ](${absoluteUrl("/llms-full.txt")})`,
    `- [Website](${absoluteUrl("/")})`,
    "",
  ].join("\n");
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
