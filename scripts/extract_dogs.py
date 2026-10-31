"""Builds lib/dogs-detail.json from the plugin's docs and lens skills. Run from the watchdog repo root."""
import json, re, pathlib
P = pathlib.Path("plugin")
LENS = {"malinois":"vapt","husky":"cloud","collie":"ai","bloodhound":"api","beagle":"privacy","rottweiler":"supply-chain","doberman":"auth",
        "shepherd":"mobile","dachshund":"database","akita":"secrets","pointer":"frontend","saintbernard":"incident-response","shiba":"web3","pyrenees":"compliance"}
def strip(s): return re.sub(r"\*\*(.+?)\*\*", r"\1", re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", s)).strip()
def section(md, name):
    m = re.search(rf"^## {name}.*?\n(.*?)(?=^## |\Z)", md, re.S | re.M)
    return m.group(1).strip() if m else ""
out = {}
for dog, lens in LENS.items():
    doc = (pathlib.Path("docs") / f"{dog}.md").read_text()
    sk = (P / "skills" / lens / "SKILL.md").read_text()
    h1 = re.search(r"^# .*?—\s*(.+)$", doc, re.M)
    intro = re.search(r"^# [^\n]*\n\n([^\n]+)", doc, re.M)
    cmds = [{"cmd": a.strip("` "), "does": strip(b)} for a, b in re.findall(r"^\| (`/[^|]+`) \| ([^|]+) \|$", section(doc, "Commands"), re.M)]
    lensnote = re.sub(r"\s*Turn it off.*", "", next((p for p in section(doc, "Commands").split("\n\n") if not p.startswith("|")), ""))
    checks = [{"t": t, "d": strip(d)} for t, d in re.findall(r"^\d+\. \*\*(.+?)\*\* — (.+)$", sk, re.M)]
    rules = [strip(r) for r in re.findall(r"^- (.+)$", section(sk, "Rules of engagement"), re.M)]
    persona = section(sk, r"[A-Za-z /-]+ dog") or ""
    scanners = re.findall(r"`([a-z0-9][a-z0-9_.-]+)`", (section(doc, "Scanners") or section(doc, "Tools it wraps")))
    bench = section(doc, "Benchmark").split("\n\n")[0]
    planted = re.search(r"(\d+) planted", bench)
    rows = re.findall(r"^\| (Haiku|Sonnet|Opus)[^|]*\| (\d+)", section(doc, "Benchmark"), re.M)
    total = re.search(r"\| \w+ / (\d+)", section(doc, "Benchmark"))
    unit = re.search(r"\| (\w+) / \d+", section(doc, "Benchmark"))
    out[dog] = {
        "tagline": h1.group(1).strip() if h1 else "",
        "intro": strip(re.sub(r"\s*Part of Watchdog\.?", "", strip(intro.group(1)))) if intro else "",
        "lens": strip(lensnote),
        "commands": cmds, "checks": checks, "rules": rules, "scanners": list(dict.fromkeys(scanners)),
        "bench": strip(bench), "planted": int(planted.group(1)) if planted else None,
        "results": [{"model": m, "found": int(f)} for m, f in rows], "total": int(total.group(1)) if total else None, "unit": unit.group(1).lower() if unit else "found",
    }
pathlib.Path("site/lib/dogs-detail.json").write_text(json.dumps(out, indent=1, ensure_ascii=False))
for d, v in out.items(): print(d, len(v["checks"]), len(v["rules"]), len(v["commands"]), v["scanners"][:3], v["planted"], v["total"], len(v["results"]))
