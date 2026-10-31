// Single source of truth for page copy, SEO metadata, JSON-LD and llms.txt.

export const BASE_PATH = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/$/, "");
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://watchdoglab.github.io").replace(/\/$/, "");
export const REPO = "https://github.com/watchdoglab/watchdog";
export const SPONSORS = "https://github.com/sponsors/salahu01";
export const INSTALL = "#install";
export const VERSION = "0.2.3";
/** Prefix for files in /public (static export does not add basePath to plain <img> src). */
export const asset = (p: string) => `${BASE_PATH}${p}`;
export const absoluteUrl = (p = "/") => `${SITE_URL}${p === "/" ? "/" : p}`;

export const installCommands = ["/plugin marketplace add watchdoglab/watchdog", "/plugin install watchdog@watchdog"];

export const site = {
  name: "Watchdog",
  title: "Watchdog: Claude Code Security Plugin for Code Review",
  tagline: "A pack of security dogs that guard your code while you build.",
  /** Meta description: under 160 characters so Google shows it whole. */
  metaDescription:
    "Free, open-source Claude Code security plugin. 14 security dogs flag vulnerabilities as you code and audit your whole repo with one command.",
  description:
    "Watchdog is a free, open-source Claude Code plugin: 14 security dogs that each guard one part of your product (VAPT, cloud, AI, APIs, privacy, supply chain, auth, mobile, databases, secrets, frontend, Web3, incidents and compliance). They flag risks as you code and audit the whole repo with one command.",
  keywords: [
    "claude code security plugin",
    "claude code plugin",
    "ai code security review",
    "vapt tool",
    "security audit for developers",
    "owasp review",
    "api security review",
    "mobile app security audit",
    "terraform security review",
    "llm prompt injection review",
    "supply chain security",
    "secrets scanning",
    "open source security tool",
    "Watchdog",
  ],
  author: { name: "Muhammed Swalahudheen C V", url: "https://salahu01.github.io", github: "https://github.com/salahu01" },
  themeColor: "#f2f5f8",
  requirements: "Claude Code · any language, any stack",
};

/** One entry per dog: id = asset name, cmd = its single-dog command. */
export const dogs = [
  { id: "malinois", name: "Malinois", role: "VAPT", cmd: "/watchdog-go-vapt", desc: "Vulnerability assessment for source code, web apps, APKs and IPAs, then the report. Active tests stay in scope." },
  { id: "bloodhound", name: "Bloodhound", role: "APIs", cmd: "/watchdog-go-api", desc: "Reads your OpenAPI or GraphQL spec and handlers together for BOLA, mass assignment, SSRF and shadow routes." },
  { id: "doberman", name: "Doberman", role: "Auth", cmd: "/watchdog-go-auth", desc: "Guards the front door: login, OAuth/OIDC, sessions, password reset, MFA, JWTs and SSO." },
  { id: "husky", name: "Husky", role: "Cloud", cmd: "/watchdog-go-cloud", desc: "Misconfigurations in Terraform, Kubernetes, Dockerfiles and CI pipelines." },
  { id: "collie", name: "Collie", role: "AI", cmd: "/watchdog-go-ai", desc: "Prompt injection, over-powered agent tools, unsafe model output, RAG leaks and risky MCP config." },
  { id: "beagle", name: "Beagle", role: "Privacy", cmd: "/watchdog-go-privacy", desc: "Follows personal data into logs, analytics and SDKs. Maps findings to GDPR and India's DPDP Act." },
  { id: "rottweiler", name: "Rottweiler", role: "Supply chain", cmd: "/watchdog-go-supply-chain", desc: "Lockfiles, typosquats, install scripts, pinning, SBOMs, signed releases and licences." },
  { id: "shepherd", name: "Shepherd", role: "Mobile", cmd: "/watchdog-go-mobile-app", desc: "Android, iOS, Flutter and React Native: storage, pinning, deep links, WebViews and bridges." },
  { id: "dachshund", name: "Dachshund", role: "Database", cmd: "/watchdog-go-database", desc: "Digs into migrations, row-level security, DB roles and Firebase/Supabase rules." },
  { id: "akita", name: "Akita", role: "Secrets", cmd: "/watchdog-go-secrets", desc: "Finds secrets in code and git history, helps rotate them and blocks them at commit." },
  { id: "pointer", name: "Pointer", role: "Frontend", cmd: "/watchdog-go-frontend", desc: "XSS sinks, CSP, postMessage, token storage and third-party scripts." },
  { id: "shiba", name: "Shiba", role: "Web3", cmd: "/watchdog-go-web3", desc: "Solidity and Rust contracts: reentrancy, access control, oracles and upgrades." },
  { id: "saintbernard", name: "Saint Bernard", role: "Incident", cmd: "/watchdog-go-incident", desc: "After a breach: reads the logs, builds the timeline, sizes the blast radius, lists containment steps." },
  { id: "pyrenees", name: "Pyrenees", role: "Compliance", cmd: "/watchdog-go-compliance", desc: "Maps the pack's findings to SOC 2, ISO 27001, PCI DSS and OWASP ASVS." },
];

/** One-command bundles, mirrors the README table. */
export const bundles = [
  { cmd: "/watchdog-go-web", for: "Web app + API (SaaS)", dogs: ["malinois", "bloodhound", "doberman", "pointer", "dachshund", "akita", "rottweiler"] },
  { cmd: "/watchdog-go-mobile", for: "Mobile app + backend", dogs: ["shepherd", "bloodhound", "doberman", "dachshund", "akita"] },
  { cmd: "/watchdog-go-ai-app", for: "AI product, chatbot or agent", dogs: ["collie", "bloodhound", "beagle", "akita"] },
  { cmd: "/watchdog-go-infra", for: "Cloud- or infra-heavy system", dogs: ["husky", "akita", "rottweiler"] },
  { cmd: "/watchdog-go-marketplace", for: "Marketplace with payments", dogs: ["malinois", "bloodhound", "doberman", "dachshund", "shepherd", "beagle"] },
  { cmd: "/watchdog-go-defi", for: "Web3 / DeFi", dogs: ["shiba", "pointer", "akita"] },
  { cmd: "/watchdog-go-all", for: "Everything at once", dogs: ["malinois", "bloodhound", "doberman", "husky", "collie", "beagle", "rottweiler", "shepherd", "dachshund", "akita", "pointer", "shiba", "saintbernard", "pyrenees"] },
];

export const features = [
  { title: "Catches bugs while you code", body: "Each dog's lens stays on all session. When you or Claude write a login handler, a SQL query or an agent tool, the dog flags the risk on the spot: the line, why it's exploitable, and the smallest fix." },
  { title: "A full audit in one command", body: "Run one bundle for what you're building, or /watchdog-go-all for everything. You get one ranked report, Critical to Low, each finding with file:line, a concrete exploit and a fix." },
  { title: "Plain English", body: "Every finding says what it is, how someone would abuse it, how to fix it, and what happens if you don't. Useful to a junior dev or a client, not only to a security expert." },
  { title: "Honest about its limits", body: "Every report ends with Not checked, so you know what still needs a human." },
  { title: "Never leaks what it finds", body: "Secrets are reported by location and type only. The value is never printed." },
  { title: "Uses the tools you have", body: "Dogs run installed scanners (semgrep, gitleaks, trivy, checkov, osv-scanner) and read the code those scanners can't understand." },
];

export const installSteps = [
  { name: "Add the marketplace", text: "In Claude Code, run /plugin marketplace add watchdoglab/watchdog." },
  { name: "Install the pack", text: "Run /plugin install watchdog@watchdog. One plugin brings all 14 dogs and every command." },
  { name: "Send the dogs out", text: "Work as usual and the dogs flag risks as you go. Run /watchdog-go-web (or the bundle for your product) for a full audit." },
];

export const faqs = [
  {
    q: "What is Watchdog?",
    a: "Watchdog is a free, open-source plugin for Claude Code. It adds 14 security \"dogs\", each an expert on one surface: VAPT, APIs, auth, cloud, AI, privacy, supply chain, mobile, databases, secrets, frontend, Web3, incident response and compliance. They review your code as you build and audit the whole repo on demand.",
  },
  {
    q: "How do I install it?",
    a: "In Claude Code run /plugin marketplace add watchdoglab/watchdog, then /plugin install watchdog@watchdog. That single plugin includes every dog and every command.",
  },
  {
    q: "Which command should I run?",
    a: "Run the bundle for what you're building: /watchdog-go-web, /watchdog-go-mobile, /watchdog-go-ai-app, /watchdog-go-infra, /watchdog-go-marketplace or /watchdog-go-defi. /watchdog-go-all runs every dog. Each dog also has its own command, like /watchdog-go-api or /watchdog-go-secrets.",
  },
  {
    q: "Is Watchdog free?",
    a: "Yes. It's MIT licensed, with no accounts, subscriptions or telemetry. It runs inside your own Claude Code session.",
  },
  {
    q: "Does it attack live systems?",
    a: "No, not by default. Every dog does static review. Only Malinois can run active tests, and only against targets you list in its authorized scope. Anything out of scope is refused.",
  },
  {
    q: "Does it send my code anywhere?",
    a: "Watchdog adds no servers of its own. It works through Claude Code, so your code is handled the same way as in any other Claude Code session. Secrets it finds are never printed, only their location and type.",
  },
  {
    q: "Does it replace a professional pen test?",
    a: "No. It catches a lot early and cheaply, and every report ends with a Not checked list. For a client audit, run /watchdog-go-compliance to map findings to SOC 2, ISO 27001, PCI DSS or ASVS, then bring in a human for what's left.",
  },
  {
    q: "Which languages and stacks does it support?",
    a: "Any. The dogs read code, specs, infrastructure files, mobile binaries and smart contracts. They also use scanners you already have installed, such as semgrep, gitleaks, trivy, checkov and osv-scanner.",
  },
];
