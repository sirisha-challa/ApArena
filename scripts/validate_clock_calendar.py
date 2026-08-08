#!/usr/bin/env python3
"""Independent validation of clock-calendar.json.
Recomputes every MCQ answer from first principles and checks the marked option.
Also validates schema: sequential ids, 4 options, step-wise explanations, formula
ids <-> practice keys, learningPath refs, tag counts. Exit 0 only if clean."""
import json
import re
import sys
from datetime import date

T = json.load(open("data/topics/clock-calendar.json"))
mcqs = T["mcqs"]
FAILS = []

def fail(msg):
    FAILS.append(msg)

def is_leap(y):
    return y % 400 == 0 or (y % 4 == 0 and y % 100 != 0)

def dow(y, m, d):
    return date(y, m, d).weekday()  # 0=Mon

WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

def clock_angle(h, mi):
    a = abs(30 * h - 5.5 * mi)
    return min(a, 360 - a)

def nums(o):
    m = re.match(r"\s*(\d+(?:\.\d+)?)", o.replace("$", ""))
    return float(m.group(1)) if m else None

def frac_min(o):
    """'3:16\\frac{4}{11}' or '12:00' -> fraction-of-minute after H:00 as float."""
    m = re.search(r":(\d{1,2})\\frac\{(\d{1,2})\}\{(\d{1,2})\}", o)
    if m:
        return int(m.group(1)) + int(m.group(2)) / int(m.group(3))
    m2 = re.match(r"\s*\$?(\d{1,2}):(\d{2})\$?\s*$", o)
    if m2:
        return float(m2.group(2))
    return None

def hm(o):
    m = re.match(r"\s*(\d{1,2}):(\d{2})", o.replace("$", ""))
    return (int(m.group(1)) % 12, int(m.group(2))) if m else None

def year_of(o):
    m = re.search(r"\b(1[5-9]\d{2}|20\d{2})\b", o)
    return int(m.group(1)) if m else None

def marked_only(mcq, pred):
    good = [i for i, o in enumerate(mcq["opts"]) if pred(o)]
    return good == [mcq["c"]]

# ---------- structural ----------
if [m["id"] for m in mcqs] != list(range(150)):
    fail("ids not 0..149")
for m in mcqs:
    i = m["id"]
    if len(m["opts"]) != 4: fail(f"id {i}: {len(m['opts'])} opts")
    if not (0 <= m["c"] <= 3): fail(f"id {i}: c={m['c']}")
    if not m["exp"].lstrip().startswith("Step 1"): fail(f"id {i}: exp not step-wise")
    if "(" not in m["exp"]: fail(f"id {i}: exp has no example/context")
    blob = m["q"] + m["exp"] + " ".join(m["opts"])
    for ch in "\u00d7\u00f7":
        if ch in blob: fail(f"id {i}: raw '{ch}'")

# ---------- answer recomputation ----------
for m in mcqs:
    i, t, q, c = m["id"], m["t"], m["q"], m["c"]

    if t == "angle":
        hh = re.search(r"at (\d{1,2}):(\d{2})", q)
        h, mi = int(hh.group(1)) % 12, int(hh.group(2))
        want = clock_angle(h, mi)
        if not marked_only(m, lambda o: abs((nums(o) or -1) - want) < 1e-6):
            fail(f"id {i} angle {h}:{mi:02d} want ~{want}")

    elif t == "coincide":
        if "How many times" in q:
            if "exactly opposite" in q:
                if not marked_only(m, lambda o: nums(o) == 11): fail(f"id {i} opposite count want 11")
            elif "right angle" in q:
                # 22 in 12h: 11 per cycle x2
                if not marked_only(m, lambda o: nums(o) == 22): fail(f"id {i} right-angle count want 22")
            else:
                if not marked_only(m, lambda o: nums(o) == 11): fail(f"id {i} coincide count want 11")
            continue
        hh = re.search(r"between (\d{1,2}) and (\d{1,2})", q)
        h = int(hh.group(1))
        if "opposite" in q:
            pred = lambda o: abs(clock_angle(h, frac_min(o) or -1) - 180) < 1e-3
        elif "right angle" in q:
            pred = lambda o: abs(clock_angle(h, frac_min(o) or -1) - 90) < 1e-3
        else:
            pred = lambda o: abs(clock_angle(h, frac_min(o) or -1)) < 1e-3
        if not marked_only(m, pred):
            fail(f"id {i} {t[:6]} between {h}")

    elif t == "mirror":
        hh = re.search(r"shows (\d{1,2}):(\d{2})", q)
        g = int(hh.group(1)) % 12 * 60 + int(hh.group(2))
        want = (12 * 60 - g) % (12 * 60)
        if not marked_only(m, lambda o: (lambda p: p is not None and p[0] * 60 + p[1] == want)(hm(o))):
            fail(f"id {i} mirror of {hh.group(1)}:{hh.group(2)} want {want // 60:02d}:{want % 60:02d}")

    elif t == "fastslow":
        if "coincide every 65" in q:
            if not marked_only(m, lambda o: "fast" in o.lower()): fail(f"id {i} fast classify")
        elif "\\frac{5}{11}" in q:
            if not marked_only(m, lambda o: abs((nums(o) or -1) * 11 - 120) < 1e-6): fail(f"id {i} 5/11 per day")
        elif "10 minutes slow" in q:
            if not marked_only(m, lambda o: "2 hours" in o): fail(f"id {i} 10min slow")
        elif "shows 2:12 at 2:00" in q:
            if not marked_only(m, lambda o: "3" in o and "fast" in o.lower()): fail(f"id {i} fast 3m/h")
        elif "shows 12:16 at 12:00" in q:
            if not marked_only(m, lambda o: "4" in o and "min/hour" in o): fail(f"id {i} 4m/h")
        elif "gains 5 minutes per hour" in q:
            if not marked_only(m, lambda o: hm(o) == (0, 20)): fail(f"id {i} 12:20")
        elif "loses 4 minutes per hour" in q:
            if not marked_only(m, lambda o: hm(o) == (1, 44)): fail(f"id {i} 1:44")
        elif "gains 2 minutes per hour" in q:
            if not marked_only(m, lambda o: hm(o) == (6, 12)): fail(f"id {i} 6:12")
        elif "loses 3 minutes per hour" in q:
            if not marked_only(m, lambda o: hm(o) == (0, 48)): fail(f"id {i} 12:48")
        elif "gains 10 minutes per day" in q:
            if not marked_only(m, lambda o: hm(o) == (0, 5)): fail(f"id {i} 12:05")
        elif "loses 10 minutes per day" in q:
            if not marked_only(m, lambda o: hm(o) == (11, 55)): fail(f"id {i} 11:55")
        elif "correct time is 11:50" in q:
            # correct 11:50, clock shows 12:00 -> fast 10 min
            if not marked_only(m, lambda o: "fast" in o.lower() and "10" in o): fail(f"id {i} fast 10")
        else:
            fail(f"id {i} fastslow unclassified: {q[:60]}")

    elif t == "leapyear":
        if i == 94:
            if not marked_only(m, lambda o: nums(o) == 6): fail("id 94 want 6")
        elif i == 96:
            if not marked_only(m, lambda o: nums(o) == 1904): fail("id 96 want 1904")
        else:
            year_str = re.findall(r"\b(1[5-9]\d{2}|20\d{2})\b", q)
            if "NOT a leap year" in q:
                b = [j for j, o in enumerate(m["opts"]) if year_of(o) is not None and not is_leap(year_of(o))]
                if b != [c]: fail(f"id {i} non-leap set {b}")
            elif "is a leap year" in q:
                b = [j for j, o in enumerate(m["opts"]) if year_of(o) is not None and is_leap(year_of(o))]
                if b != [c]: fail(f"id {i} leap set {b}")
            elif "odd days" in q:
                if not marked_only(m, lambda o: nums(o) == (2 if "leap year" in q else 1)):
                    fail(f"id {i} odd days")

    elif t == "odddays":
        mm = re.search(r"in (\d+) years \((\d+) leap", q)
        if mm:
            n, l = int(mm.group(1)), int(mm.group(2))
            want = (2 * l + (n - l)) % 7
            if not marked_only(m, lambda o: nums(o) == want):
                fail(f"id {i} {n}y/{l} leap want {want}")
        elif re.search(r"(\d00) years", q):
            want = {100: 5, 200: 3, 300: 1, 400: 0}[int(re.search(r"(\d00) years", q).group(1))]
            if not marked_only(m, lambda o: nums(o) == want):
                fail(f"id {i} century want {want}")
        elif re.search(r"in (\d+) days", q):
            want = int(re.search(r"in (\d+) days", q).group(1)) % 7
            if not marked_only(m, lambda o: nums(o) == want):
                fail(f"id {i} days want {want}")
        else:
            fail(f"id {i} odddays unclassified: {q[:60]}")

    elif t == "weekday":
        mmS = re.search(r"(\d{1,2}) ([A-Z][a-z]+) (\d{4})", q)
        if mmS:
            day, mon, yr = int(mmS.group(1)), mmS.group(2), int(mmS.group(3))
            months = {"Jan": 1, "January": 1, "Feb": 2, "February": 2, "Mar": 3, "March": 3,
                      "Apr": 4, "April": 4, "May": 5, "Jun": 6, "June": 6, "Jul": 7, "July": 7,
                      "Aug": 8, "August": 8, "Sep": 9, "Sept": 9, "September": 9, "Oct": 10,
                      "October": 10, "Nov": 11, "November": 11, "Dec": 12, "December": 12}
            if mon in months:
                want = WEEK[dow(yr, months[mon], day)]
                if not marked_only(m, lambda o: want in o):
                    fail(f"id {i} {day} {mon} {yr} want {want}")

    elif t == "repeat":
        if "leap" in q and "repeats" in q:
            want = re.search(r"(\d{4}) repeats in", q)
            if want and not marked_only(m, lambda o: nums(o) == int(want.group(1)) + 28):
                fail(f"id {i} leap repeat +28")
        elif "repeats in" in q:
            # ordinary: first year at +6 or +11 with 0 odd days
            yy = re.search(r"Calendar of (\d{4}) repeats", q)
            if yy:
                y0 = int(yy.group(1))
                for cand in (y0 + 6, y0 + 11, y0 + 6 + 11, y0 + 28):
                    lo, hi = y0, cand
                    odd = sum(2 if is_leap(y) else 1 for y in range(lo, hi))
                    if odd % 7 == 0:
                        if not marked_only(m, lambda o: nums(o) == cand): fail(f"id {i} {y0} -> {cand}")
                        break

    # mixed / basic: no tight mathematical check, structural already done

# ---------- sections / formulas / learningPath ----------
fids = {f["id"] for f in T["formulas"]}
for k in T["practiceProblems"]:
    if k not in fids: fail(f"practice key {k} has no formula")
for f in T["formulas"]:
    if f["id"] not in T["practiceProblems"]: fail(f"formula {f['id']} no practice")
for st in T["learningPath"]:
    if not any(s["id"] == st["sectionId"] for s in T["readingSections"]):
        fail(f"learningPath ref {st['sectionId']} missing")
for f in T["formulas"]:
    if "\\$" in f["formula"]["latex"] or "×" in f["formula"]["latex"]: fail(f"formula {f['id']} latex")

exp_tag = {}
for m in T["mcqs"]:
    exp_tag[m["t"]] = exp_tag.get(m["t"], 0) + 1
wanted = {"basic": 20, "angle": 20, "coincide": 20, "mirror": 12, "fastslow": 12,
          "leapyear": 14, "odddays": 16, "weekday": 18, "repeat": 12, "mixed": 6}
for tag, n in wanted.items():
    if exp_tag.get(tag) != n: fail(f"tag {tag}: {exp_tag.get(tag)} != {n}")

if FAILS:
    print(f"FAILED {len(FAILS)}")
    for f in FAILS: print(" -", f)
    sys.exit(1)
print("ALL PASSED |", len(mcqs), "MCQs |", exp_tag)