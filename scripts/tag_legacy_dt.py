#!/usr/bin/env python3
"""Backfill difficulty (d) and type (t) tags on legacy topic mcqs.

d: easy|medium|hard via regex rules over question text (ns_mcq_upgrade convention).
t: category label derived from the matching practice rule:
   1. exact duplicate of a practice question -> that rule
   2. solver checker match (work-and-time) -> rule via majority vote
   3. token overlap with rule question corpus -> best rule
Skips mcqs that already carry both tags.
"""
import json
import re
from collections import Counter

import migrate_legacy as ml

HARD = re.compile(
    r"remainder|euler|fermat|wilson|crt\b|mod\b|successive|compounded|alligation|"
    r"mixture|partnership|depreciat|false.?weight|discount\b|efficiency|chain|"
    r"leak|cistern", re.I)
MED = re.compile(
    r"√|sqrt|cube root|alternat|mirror|shadow|leap|odd days|coded|coincide|"
    r"right angles|man.?days|relative|pointing|generation|in.?law", re.I)
EASY = re.compile(
    r"statement|conclusion|family|relation|son|daughter|gender|cousin|represents|"
    r"similar|opposite|analog|synonym|antonym|direction|north|south|east|west|"
    r"faces?\b|turns?\b|walked?\b|percent|fraction|ratio\b", re.I)


def difficulty(q):
    ql = q.lower()
    if HARD.search(ql):
        return "hard"
    if MED.search(ql):
        return "medium"
    n = len(re.findall(r"\d+", q))
    if n <= 1 and EASY.search(ql):
        return "easy"
    return "medium"


def norm(s):
    return re.sub(r"\s+", " ", s).strip().lower()


def build_checker_map(T, CHECKS):
    cmap = {}
    for rule, probs in T["practiceProblems"].items():
        hits = Counter()
        for p in probs:
            for fn in CHECKS:
                try:
                    if fn(p["q"]) is not None:
                        hits[fn] += 1
                        break
                except Exception:
                    pass
        if hits:
            cmap.setdefault(hits.most_common(1)[0][0], rule)
    return cmap


def rule_for(mcq, T, cmap):
    qn = norm(mcq["q"])
    for rule, probs in T["practiceProblems"].items():
        for p in probs:
            if norm(p["q"]) == qn:
                return rule
    if cmap:
        for fn, rule in cmap.items():
            try:
                if fn(mcq["q"]) is not None:
                    return rule
            except Exception:
                pass
    best, score = None, 0
    for rule, probs in T["practiceProblems"].items():
        corpus = set()
        for p in probs:
            corpus |= set(norm(p["q"]).split())
        ov = len(set(qn.split()) & corpus)
        if ov > score:
            best, score = rule, ov
    return best


def main():
    wt = [ml.check_work_basic, ml.check_combined, ml.check_mandays,
          ml.check_efficiency, ml.check_pipes]
    for name in ml.TOPICS:
        T = json.load(open(f"data/topics/{name}.json"))
        cmap = build_checker_map(T, wt) if name == "work-and-time" else None
        for m in T["mcqs"]:
            if "d" not in m:
                m["d"] = difficulty(m["q"])
            if not m.get("t"):
                m["t"] = rule_for(m, T, cmap)
        json.dump(T, open(f"data/topics/{name}.json", "w"), ensure_ascii=False, indent=2)
        print(f"{name}: tagged")


if __name__ == "__main__":
    main()
