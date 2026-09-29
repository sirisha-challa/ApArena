#!/usr/bin/env python3
"""Build data/topics/accenture-mock-01.json — AXIS 2026 Mock Test 1.
Technical 45 MCQs (Pseudocode 14 + MS Office 11 + Networking/Security/Cloud 9 + CS Foundations 11),
sampled deterministically from ready banks. Coding: DSA + SQL (embedded) + UI task.
Fails on bad option index, wrong option count, or intra-mock duplicates.
"""
import json, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
TOP = ROOT / "data" / "topics"
OUT = TOP / "accenture-mock-01.json"

def load_mcqs(tid):
    d = json.loads((TOP / f"{tid}.json").read_text())
    return d.get("mcqs", [])

QUOTAS = [
    ("Pseudocode", [("output-tracing", 6), ("while-loop", 4), ("repeat-until", 4)]),
    ("MS Office", [("ms-office-common-apps", 2), ("computer-fundamentals", 1), ("ms-word", 1),
                   ("ms-excel", 2), ("ms-powerpoint", 1), ("ms-outlook", 1), ("internet-browser", 1),
                   ("shortcut-keys", 1), ("command-prompt", 1)]),
    ("Networking", [("networking-security-cloud", 2), ("osi-tcpip", 1), ("ip-addressing", 1),
                    ("protocols", 1), ("security-attacks", 1), ("encryption", 1),
                    ("cloud-computing", 1), ("firewalls-vpn", 1)]),
    ("CS Foundations", [("oops", 3), ("sql-queries", 3), ("dbms-basics", 1), ("os-basics", 2),
                        ("javascript", 1), ("data-structures-algo", 1)]),
]

def sample(tid, n):
    pool = sorted(load_mcqs(tid), key=lambda m: (str(m.get("d", "")), str(m.get("id", ""))))
    if len(pool) < n:
        raise SystemExit(f"short pool: {tid} has {len(pool)}, need {n}")
    easy = [m for m in pool if m.get("d") == "easy"]
    med = [m for m in pool if m.get("d") == "medium"]
    hard = [m for m in pool if m.get("d") not in ("easy", "medium")]
    out, i = [], 0
    # round-robin easy -> medium -> hard for balanced papers, deterministic
    while len(out) < n:
        for grp in (easy, med, hard):
            if len(out) >= n:
                break
            if i < len(grp) and grp[i] not in out:
                out.append(grp[i])
        i += 1
        if i > max(len(easy), len(med), len(hard)) + 1:
            for m in pool:
                if m not in out and len(out) < n:
                    out.append(m)
            break
    return out[:n]

sections, seen, qn = [], set(), 0
for sec_name, files in QUOTAS:
    qs = []
    for tid, n in files:
        for m in sample(tid, n):
            qn += 1
            opts = m["opts"]
            assert len(opts) == 4, f"{tid}/{m.get('id')}: {len(opts)} opts"
            assert isinstance(m["c"], int) and 0 <= m["c"] < 4, f"{tid}/{m.get('id')}: bad c"
            key = "".join(str(m["q"]).lower().split())
            assert key not in seen, f"duplicate question in mock: {tid}/{m.get('id')}"
            seen.add(key)
            exp = m.get("exp", [])
            exp = exp if isinstance(exp, list) else [exp]
            qs.append({"id": f"m1-t{qn:02d}", "sec": sec_name, "q": m["q"], "opts": opts,
                       "c": m["c"], "exp": exp, "source": tid})
    sections.append({"id": sec_name.lower().replace(" ", "-").replace("/", "-"),
                     "title": sec_name, "questions": qs})

n_mcq = sum(len(s["questions"]) for s in sections)
assert n_mcq == 45, f"expected 45 MCQs, got {n_mcq}"

cp = json.loads((ROOT / "data" / "coding-problems.json").read_text())
def pick_cp(*prefs):
    by_id = {p["id"]: p for p in cp}
    for pid in prefs:
        if pid in by_id:
            return by_id[pid]
    raise SystemExit(f"no DSA candidate found among {prefs}")
dsa = pick_cp("large-small-sum", "rat-count-house", "array-rotation", "equilibrium-point")

sp = json.loads((ROOT / "data" / "sql-problems.json").read_text())
by_sql = {p["id"]: p for p in sp}
sql = by_sql.get("three-table-axis") or by_sql.get("mock-join-agg-having")
assert sql, "no SQL JOIN task found"

ui_task = {
    "kind": "ui",
    "id": "ui-colored-boxes",
    "title": "UI Task — Colored Boxes Row",
    "difficulty": "easy",
    "statement": ("Build a single-page UI: a heading 'My Boxes', one row of 3 equal boxes "
                  "(red, green, blue, 100x100px) using flexbox with 12px gaps, and a button "
                  "that toggles the middle box between green and yellow on each click."),
    "checklist": [
        "Heading 'My Boxes' renders at the top",
        "3 boxes in one horizontal row (flex, 12px gap)",
        "Box colors red / green / blue, 100x100px each",
        "Button toggles middle box green <-> yellow on every click",
    ],
    "starter": ("<!-- My Boxes UI -->\n<h2>My Boxes</h2>\n<div class=\"row\">\n"
                "  <div class=\"box r\"></div>\n  <div class=\"box g\" id=\"mid\"></div>\n  <div class=\"box b\"></div>\n</div>\n"
                "<button id=\"tgl\">Toggle middle</button>\n<style>\n.row{display:flex;gap:12px}\n"
                ".box{width:100px;height:100px}\n.r{background:red}.g{background:green}.b{background:blue}\n</style>"),
}

mock = {
    "id": "accenture-mock-01",
    "title": "Accenture Mock 1",
    "pattern": ("AXIS 2026: Technical 45 MCQs / 45 min (Pseudocode 14 + MS Office 11 + "
                "Networking/Security/Cloud 9 + CS Foundations 11), no negative marking; "
                "Coding 3 tasks / 60 min (DSA + SQL JOINs + UI)."),
    "technical": {"durationMin": 45, "totalMarks": 45, "correctMarks": 1, "negative": 0,
                  "sections": sections},
    "coding": {"durationMin": 60,
               "tasks": [{"kind": "dsa", "problem": dsa},
                         {"kind": "sql", "problem": sql},
                         ui_task]},
}
OUT.write_text(json.dumps(mock, indent=1))
print(f"wrote {OUT}: {n_mcq} MCQs + 3 coding tasks "
      f"(dsa={dsa['id']}, sql={sql['id']})")
