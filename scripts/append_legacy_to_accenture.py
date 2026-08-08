#!/usr/bin/env python3
"""Append the 11 legacy ApArena Classic topics into accenture/data/syllabus.json.

Maps each data/topics/*.json module onto the matching accenture topic (or a new
topic in the right section), converting readingSections/formulas/practiceProblems
into the accenture content schema (introduction / sections+blocks / quickRevision /
practiceQuestions). Marks appended topics as status "complete".

Idempotent: re-running skips topics already carrying content.
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SYLLABUS = ROOT / "accenture/data/syllabus.json"
TOPICS_DIR = ROOT / "data/topics"

# legacy id -> (section id, target topic id or None to add new topic)
MAPPING = {
    "number-system": ("quantitative", "number-system"),
    "percentages": ("quantitative", "percentages"),
    "profit-and-loss": ("quantitative", "profit-loss"),
    "ratio-and-proportion": ("quantitative", "ratios-proportions"),
    "work-and-time": ("quantitative", "time-work"),
    "simplification": ("quantitative", None),
    "clock-calendar": ("quantitative", None),
    "statements-conclusions": ("critical-reasoning", "statement-conclusion"),
    "blood-relations": ("critical-reasoning", None),
    "direction-sense": ("critical-reasoning", None),
    "coding-decoding": ("critical-reasoning", None),
    "analogies": ("abstract-reasoning", "analogies"),
}

NEW_TOPIC_TITLES = {
    "simplification": "Simplification (BODMAS, Surds & Fractions)",
    "clock-calendar": "Clocks & Calendars",
    "blood-relations": "Blood Relations & Family Trees",
    "direction-sense": "Direction Sense",
    "coding-decoding": "Coding & Decoding",
}

TABLE_RE = re.compile(r"^\|(.+)\|$", re.MULTILINE)


def split_table(content: str):
    """If content is (or starts with) a markdown pipe table, return (headers, rows)."""
    lines = [l.strip() for l in content.splitlines()]
    if not lines or not lines[0].startswith("|"):
        return None
    rows = [l.strip("|") for l in lines if l.startswith("|")]
    if len(rows) < 2:
        return None
    headers = [c.strip() for c in rows[0].split("|")]
    if all(re.fullmatch(r":?-{2,}:?", h.strip()) for h in rows[1].split("|")):
        data = rows[2:]
    else:
        data = rows[1:]
    return headers, [[c.strip() for c in r.split("|")] for r in data]


def to_paragraphs(content):
    """Normalize content (str or list of str) into a list of paragraph strings."""
    if isinstance(content, list):
        return [str(p) for p in content]
    return [content]


def content_blocks(text):
    """Convert one paragraph string into renderer blocks (splitting pipe tables)."""
    tbl = split_table(text)
    if tbl:
        return [{"type": "table", "headers": tbl[0], "rows": tbl[1]}]
    return [{"type": "p", "text": text}]


def content_from_legacy(legacy: dict) -> dict:
    """Convert a legacy topic module into the accenture content schema."""
    intro = []
    if legacy.get("subtitle"):
        intro.append("**" + legacy["title"] + "** — " + legacy["subtitle"])

    sections = []
    for rs in legacy.get("readingSections") or []:
        blocks = []
        for para in to_paragraphs(rs.get("content")):
            blocks.extend(content_blocks(para))
        for sub in rs.get("subsections") or []:
            paras = to_paragraphs(sub.get("content"))
            if not paras:
                continue
            if sub.get("title"):
                blocks.extend(content_blocks("**" + sub["title"] + "**"))
            for para in paras:
                blocks.extend(content_blocks(para))
        if blocks:
            sections.append({"id": rs.get("id") or "sec", "title": rs.get("title") or "", "blocks": blocks})

    if legacy.get("formulas"):
        formula_blocks = []
        for f in legacy["formulas"]:
            fb = {"type": "formula", "title": f.get("title", ""), "latex": f.get("formula", "")}
            if f.get("explanation"):
                fb["text"] = f["explanation"]
            if f.get("example"):
                fb["example"] = {"prompt": f["example"], "answer": ""}
            formula_blocks.append(fb)
        sections.append({"id": "formulas", "title": "Formulas", "blocks": formula_blocks})

    quick = list(legacy.get("subtopics") or [])
    if not quick and legacy.get("formulas"):
        quick = [f.get("title", "") for f in legacy["formulas"]]

    pq = []
    for key, items in (legacy.get("practiceProblems") or {}).items():
        for p in items if isinstance(items, list) else [items]:
            if not isinstance(p, dict):
                continue
            q = {"prompt": p.get("q", ""), "options": [], "answer": p.get("a", ""),
                 "explanation": " ".join(p.get("s") or [])}
            if q["prompt"]:
                pq.append(q)

    content = {"introduction": intro, "sections": sections, "quickRevision": quick,
               "practiceQuestions": pq, "companyNote": None}
    return content


def main() -> int:
    force = "--force" in sys.argv
    syllabus = json.loads(SYLLABUS.read_text())
    changed = 0
    for legacy_id, (sec_id, target_topic) in MAPPING.items():
        legacy_path = TOPICS_DIR / (legacy_id + ".json")
        if not legacy_path.exists():
            print(f"SKIP  {legacy_id}: legacy file missing")
            continue
        legacy = json.loads(legacy_path.read_text())
        section = next((s for s in syllabus["sections"] if s["id"] == sec_id), None)
        if section is None:
            print(f"SKIP  {legacy_id}: section {sec_id} not found")
            continue
        topic = next((t for t in section["topics"] if t["id"] == (target_topic or legacy_id)), None)
        if topic is None:
            topic = {"id": legacy_id, "title": NEW_TOPIC_TITLES.get(legacy_id, legacy["title"]),
                     "status": "pending", "content": None}
            section["topics"].append(topic)
        if topic.get("content") and not force:
            print(f"SKIP  {legacy_id}: content already present")
            continue
        topic["title"] = NEW_TOPIC_TITLES.get(legacy_id, legacy["title"])
        topic["content"] = content_from_legacy(legacy)
        topic["status"] = "complete"
        print(f"ADD   {legacy_id} -> {sec_id}/{topic['id']} "
              f"({len(topic['content']['sections'])} sections, {len(topic['content']['practiceQuestions'])} practice)")
        changed += 1
    if changed:
        SYLLABUS.write_text(json.dumps(syllabus, indent=2, ensure_ascii=False) + "\n")
        print(f"Wrote {SYLLABUS} ({changed} topics appended)")
    else:
        print("Nothing to do")
    return 0


if __name__ == "__main__":
    sys.exit(main())
