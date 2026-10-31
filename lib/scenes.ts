/** One short story per dog for the editor demo: a risky line, the finding, and the smallest fix. */
export type Scene = {
  dog: string; file: string; cmd: string;
  code: string[]; bad: number; fix: string;
  sev: "crit" | "high"; title: string; exploit: string;
};

export const scenes: Record<string, Scene> = {
  malinois: {
    dog: "malinois", file: "src/routes/users.ts", cmd: "/watchdog-go-vapt code",
    code: ['users.get("/:id", async (req, res) => {', '  const sql = "SELECT * FROM users WHERE id = " + req.params.id;', "  const row = await db.raw(sql);", "  res.json(row);", "});"],
    bad: 1, fix: '  const row = await db.query("SELECT * FROM users WHERE id = $1", [req.params.id]);',
    sev: "crit", title: "SQL injection", exploit: "GET /users/1 OR 1=1 dumps every user",
  },
  bloodhound: {
    dog: "bloodhound", file: "src/routes/invoices.ts", cmd: "/watchdog-go-api",
    code: ['invoices.get("/:id", requireUser, async (req, res) => {', "  const inv = await db.invoices.findById(req.params.id);", "  res.json(inv);", "});", ""],
    bad: 1, fix: "  const inv = await db.invoices.findOne({ id: req.params.id, ownerId: req.user.id });",
    sev: "crit", title: "IDOR on invoices", exploit: "Change the id and read any customer's invoice",
  },
  doberman: {
    dog: "doberman", file: "src/auth/jwt.ts", cmd: "/watchdog-go-auth",
    code: ["export function verify(token: string) {", "  return jwt.decode(token);", "}", "", "app.use(auth(verify));"],
    bad: 1, fix: '  return jwt.verify(token, KEY, { algorithms: ["RS256"] });',
    sev: "crit", title: "JWT never verified", exploit: "Forge a token and log in as any user",
  },
  husky: {
    dog: "husky", file: "infra/storage.tf", cmd: "/watchdog-go-cloud",
    code: ['resource "aws_s3_bucket" "uploads" {', '  bucket = "acme-user-uploads"', '  acl    = "public-read"', '  tags   = { team = "core" }', "}"],
    bad: 2, fix: '  acl    = "private"',
    sev: "high", title: "Public S3 bucket", exploit: "Anyone can list and download user files",
  },
  collie: {
    dog: "collie", file: "agent/tools.py", cmd: "/watchdog-go-ai",
    code: ["@tool", "def run(cmd: str) -> str:", "    return subprocess.check_output(cmd, shell=True)", "", "agent = Agent(tools=[search, run])"],
    bad: 2, fix: "    return run_allowlisted(cmd)  # approval + allowlist",
    sev: "crit", title: "Agent tool runs any shell command", exploit: "A prompt-injected web page can wipe the server",
  },
  beagle: {
    dog: "beagle", file: "src/signup.ts", cmd: "/watchdog-go-privacy",
    code: ["export async function signup(user: User) {", "  await db.users.create(user);", '  logger.info("new user", user);', '  analytics.track("signup", user);', "}"],
    bad: 2, fix: '  logger.info("new user", { id: user.id });',
    sev: "high", title: "Personal data in logs", exploit: "Emails and phone numbers land in your log vendor",
  },
  rottweiler: {
    dog: "rottweiler", file: "package.json", cmd: "/watchdog-go-supply-chain",
    code: ['"dependencies": {', '  "express": "^4.19.2",', '  "reqeusts": "^1.0.3",', '  "zod": "^3.23.8"', "}"],
    bad: 2, fix: '  "lodash": "4.17.21",',
    sev: "crit", title: "Typosquatted package", exploit: "Its install script steals your env vars",
  },
  shepherd: {
    dog: "shepherd", file: "lib/storage.dart", cmd: "/watchdog-go-mobile-app",
    code: ["Future<void> saveSession(String token) async {", "  final prefs = await SharedPreferences.getInstance();", '  await prefs.setString("token", token);', "}", ""],
    bad: 2, fix: '  await secure.write(key: "token", value: token);',
    sev: "high", title: "Token in plain storage", exploit: "Any backup or rooted phone exposes the session",
  },
  dachshund: {
    dog: "dachshund", file: "supabase/migrations/004.sql", cmd: "/watchdog-go-database",
    code: ["create table orders (", "  id uuid primary key, user_id uuid, total int", ");", "alter table orders disable row level security;", ""],
    bad: 3, fix: "alter table orders enable row level security;",
    sev: "crit", title: "Row-level security off", exploit: "Any signed-in user can read every order",
  },
  akita: {
    dog: "akita", file: "src/config.ts", cmd: "/watchdog-go-secrets",
    code: ["export const config = {", '  region: "ap-south-1",', '  stripeKey: "sk_live_••••••••",', "  port: 8080,", "};"],
    bad: 2, fix: "  stripeKey: process.env.STRIPE_KEY,",
    sev: "crit", title: "Live secret in code", exploit: "Anyone with repo access can charge cards",
  },
  pointer: {
    dog: "pointer", file: "src/Comment.tsx", cmd: "/watchdog-go-frontend",
    code: ["export function Comment({ body }: Props) {", "  return (", "    <div dangerouslySetInnerHTML={{ __html: body }} />", "  );", "}"],
    bad: 2, fix: "    <div>{body}</div>",
    sev: "high", title: "Stored XSS", exploit: "A comment with a script steals every viewer's session",
  },
  shiba: {
    dog: "shiba", file: "src/Vault.sol", cmd: "/watchdog-go-web3",
    code: ["function withdraw(uint amt) external {", '  (bool ok,) = msg.sender.call{value: amt}("");', "  balances[msg.sender] -= amt;", "}", ""],
    bad: 1, fix: "  balances[msg.sender] -= amt; // effects before interaction",
    sev: "crit", title: "Reentrancy", exploit: "A contract re-enters and drains the vault",
  },
  saintbernard: {
    dog: "saintbernard", file: "logs/nginx/access.log", cmd: "/watchdog-go-incident",
    code: ['10.0.4.2 "GET /health" 200', '10.0.4.2 "GET /health" 200', '185.220.1.9 "GET /.env" 200 1532', '185.220.1.9 "POST /api/admin/export" 200', ""],
    bad: 2, fix: "→ rotate every key in .env, block 185.220.1.9, start timeline at 02:14",
    sev: "crit", title: ".env served to an attacker", exploit: "All app secrets leaked at 02:14 UTC",
  },
  pyrenees: {
    dog: "pyrenees", file: "findings.md", cmd: "/watchdog-go-compliance",
    code: ["## Access control", "- Admin panel has no MFA", "- Sessions last 30 days", "- No access review process", ""],
    bad: 1, fix: "- Admin MFA → SOC 2 CC6.1 · ISO 27001 A.8.5 · fix before audit",
    sev: "high", title: "Fails SOC 2 CC6.1", exploit: "The auditor will flag this control",
  },
};
