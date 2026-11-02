import type { Metadata } from "next";
import Link from "next/link";
import { Cmd } from "@/components/Bits";
import { DotGlobe, Footer, Nav } from "@/components/Chrome";
import PrDemo from "@/components/PrDemo";
import { absoluteUrl } from "@/lib/site";

const ACTION = "https://github.com/watchdoglab/watchdog-action";
const desc = "Security review on every pull request by the Watchdog dogs. Inline comments on risky lines with a fix, then one summary.";

export const metadata: Metadata = {
  title: "Watchdog PR Review, the GitHub Action",
  description: desc,
  alternates: { canonical: absoluteUrl("/action/") },
  openGraph: { title: "Watchdog PR Review · GitHub Action", description: desc, url: absoluteUrl("/action/") },
};

const workflow = `name: Watchdog PR Review

on:
  pull_request:
    types: [opened, synchronize, ready_for_review, reopened]

permissions:
  contents: read
  pull-requests: write
  id-token: write

jobs:
  review:
    if: github.event.pull_request.draft == false
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 1
      - uses: watchdoglab/watchdog-action@v1
        with:
          anthropic_api_key: \${{ secrets.ANTHROPIC_API_KEY }}
          dogs: all          # or web, api, auth, ai-app, secrets, ...
          min_severity: medium`;

const providers = [
  { ai: "Claude", pay: "Anthropic API key", set: "anthropic_api_key" },
  { ai: "Claude", pay: "Claude Pro/Max plan", set: "claude_code_oauth_token (from claude setup-token)" },
  { ai: "Claude", pay: "Amazon Bedrock", set: "provider: bedrock + AWS credentials step" },
  { ai: "Claude", pay: "Google Vertex AI", set: "provider: vertex + Google auth step" },
  { ai: "GPT, Gemini, Grok, DeepSeek, Qwen…", pay: "OpenRouter key", set: "provider: openrouter, openrouter_api_key, model" },
  { ai: "OpenAI Codex", pay: "OpenAI API key", set: "engine: codex, openai_api_key" },
  { ai: "OpenAI Codex", pay: "ChatGPT Plus/Pro (private repos)", set: "engine: codex, codex_auth_json" },
  { ai: "Gemini", pay: "Gemini API key", set: "engine: gemini, gemini_api_key" },
  { ai: "Gemini", pay: "Vertex AI or Code Assist", set: "engine: gemini, gemini_auth + gcp_* inputs" },
];

const inputs = [
  { t: "engine", d: "claude (default), codex or gemini." },
  { t: "dogs", d: "Which review: all, web, api, auth, ai-app, secrets, …" },
  { t: "min_severity", d: "Skip findings below this. Default medium." },
  { t: "model", d: "Model ID for your provider. Empty uses the engine default." },
  { t: "provider", d: "Claude only: anthropic, bedrock, vertex or openrouter." },
  { t: "github_token", d: "Token used to post comments. Defaults to the job token." },
];

const safety = [
  "Runs on pull_request, not pull_request_target, so PRs from forks never see your secrets.",
  "The reviewer can only read code and post comments. It cannot push or run project code.",
  "Codex runs in a read-only sandbox and Gemini gets read-only tools.",
  "PR text is treated as untrusted input, never as instructions.",
];

export default function ActionPage() {
  return (
    <div className="dogpage" style={{ "--dog": "#fb923c" } as React.CSSProperties}>
      <Nav />
      <main id="main">
        <section className="hero">
          <div className="hero-planet"><DotGlobe dense /></div>
          <div className="wrap hero-grid">
            <div className="hero-copy">
              <a className="announce" href={ACTION}><span className="dot" />GitHub Action · watchdoglab/watchdog-action@v1 <span>↗</span></a>
              <div className="eyebrow">Watchdog PR Review</div>
              <h1>The pack, on every pull request.</h1>
              <p className="lead"><b>Security review in CI.</b> Watchdog comments on risky lines with a fix, then posts one summary. Bring Claude, GPT, Gemini or Codex.</p>
              <div className="ctas">
                <a className="btn blue" href="#setup">Set up in 2 minutes <span>→</span></a>
                <a className="btn ghost" href={ACTION}>View on GitHub <span>↗</span></a>
              </div>
            </div>
            <div className="hero-art"><PrDemo /></div>
          </div>
          <div className="strip-band">
            <div className="wrap strip">
              <div><Icon d="M4 5h16v11H8l-4 4zM8 10h8" />Inline comments with a fix</div>
              <div><Icon d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" />Claude, GPT, Gemini or Codex</div>
              <div><Icon d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" />Read-only and fork-safe</div>
            </div>
          </div>
        </section>

        <section className="sec" id="setup">
          <div className="wrap two">
            <div>
              <div className="eyebrow">Setup</div>
              <h2>Three steps.</h2>
              <ol className="steps">
                <li><span>1</span><div><p>Add your AI key as a repo secret, e.g. <code>ANTHROPIC_API_KEY</code> (Settings → Secrets and variables → Actions).</p></div></li>
                <li><span>2</span><div><p>Save the workflow as <code>.github/workflows/watchdog-review.yml</code>.</p></div></li>
                <li><span>3</span><div><p>Open a PR. Watchdog comments on risky lines and posts a summary.</p></div></li>
              </ol>
            </div>
            <div className="panel"><div className="eyebrow">watchdog-review.yml</div><pre className="diff">{workflow}</pre></div>
          </div>
        </section>

        <section className="sec tint">
          <div className="wrap">
            <div className="head"><div className="eyebrow">Your AI, your bill</div><h2>Pick the AI and how you pay.</h2></div>
            <div className="table" role="table">
              <div className="tr th tr3" role="row"><span>AI</span><span>How you pay</span><span className="wd">Set in with:</span></div>
              {providers.map((p) => (
                <div className="tr tr3" role="row" key={p.ai + p.pay}><span><b>{p.ai}</b></span><span>{p.pay}</span><span className="wd"><code>{p.set}</code></span></div>
              ))}
            </div>
            <p className="muted mt">Store every key or token as a repo secret.</p>
          </div>
        </section>

        <section className="sec">
          <div className="wrap">
            <div className="head"><div className="eyebrow">Inputs</div><h2>Tune the review.</h2></div>
            <div className="cards three">
              {inputs.map((c) => <article className="card" key={c.t}><span className="num">{c.t}</span><p>{c.d}</p></article>)}
            </div>
          </div>
        </section>

        <section className="sec tint">
          <div className="wrap two">
            <div><div className="eyebrow">Safety</div><h2>Built for untrusted PRs.</h2></div>
            <ol className="steps">{safety.map((r, k) => <li key={k}><span>{k + 1}</span><div><p>{r}</p></div></li>)}</ol>
          </div>
        </section>

        <section className="cta">
          <div className="wrap">
            <h2>Want the dogs while you code, too?</h2>
            <div className="term-in"><Cmd text="/plugin marketplace add watchdoglab/watchdog" dark /></div>
            <div className="ctas">
              <Link className="btn blue" href="/watchdog/">Watchdog for Claude Code <span>→</span></Link>
              <a className="btn ghost light" href={ACTION}>Action on GitHub <span>↗</span></a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

function Icon({ d }: { d: string }) {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" aria-hidden="true"><path d={d} /></svg>;
}
