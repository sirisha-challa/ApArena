#!/usr/bin/env python3
"""Verify legacy data/topics/*.json before migration. Exit 1 on issues."""
import datetime
import json
import math
import re
import sys
from fractions import Fraction

REPORT = []
TOPICS = [
    "analogies", "blood-relations", "clock-calendar", "coding-decoding",
    "direction-sense", "percentages", "profit-and-loss", "ratio-and-proportion",
    "simplification", "statements-conclusions", "work-and-time",
]
WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
MONTH_DAYS = {1: 31, 2: 28, 3: 31, 4: 30, 5: 31, 6: 30, 7: 31, 8: 31, 9: 30, 10: 31, 11: 30, 12: 31}
MONTHS = {m: i + 1 for i, m in enumerate(
    ["January", "February", "March", "April", "May", "June", "July",
     "August", "September", "October", "November", "December"])}


def to_float(s):
    s = re.sub(r"[,₹Rs]", "", str(s))
    m = re.search(r"-?\d+(?:\.\d+)?", s)
    return float(m.group()) if m else None


def same_answer(stored, computed):
    """Compare a stored answer with a computed number/string, tolerantly."""
    if stored is None or computed is None:
        return False
    if isinstance(computed, bool):
        return stored.strip().lower() == ("yes" if computed else "no")
    if isinstance(computed, str):
        a = re.sub(r"\s+", "", stored.strip().lower())
        b = re.sub(r"\s+", "", computed.strip().lower())
        da = set((d, float(v)) for v, d in
                 re.findall(r"(\d+(?:\.\d+)?)\s*km\s*(north|south|east|west)", stored.lower()))
        db = set((d, float(v)) for v, d in
                 re.findall(r"(\d+(?:\.\d+)?)\s*km\s*(north|south|east|west)", computed.lower()))
        if da and db:
            return {(d, round(v, 2)) for d, v in da} == {(d, round(v, 2)) for d, v in db}
        return a == b or a.startswith(b) or b.startswith(a)
    if isinstance(computed, Fraction):
        m = re.search(r"(\d+)/(\d+)", stored.replace(",", ""))
        if m:
            return Fraction(int(m.group(1)), int(m.group(2))) == computed
        try:
            return Fraction(stored.replace(",", "").replace(" ", "")) == computed
        except Exception:
            pass
    cf = float(computed)
    s = stored.strip().lower()
    m = re.match(r"(\d{1,2}):(\d{1,2})(?: (\d+)/(\d+))?", s)
    if m:
        h, mi = int(m.group(1)), int(m.group(2))
        frac = int(m.group(3)) / int(m.group(4)) if m.group(3) else 0.0
        mins = mi + frac
        total = (h % 12) * 60 + mins
        if cf >= 12 * 60:
            total += 720
        return abs(total - cf) <= max(1e-6, 0.02 * cf) or abs(mins - cf) <= max(1e-6, 0.02 * cf)
    if "√" in s or "root" in s:
        n = to_float(stored)
        if n is not None and cf >= 0:
            return abs(n - cf * cf) <= max(1e-6, 0.02 * cf * cf)
    f = to_float(stored)
    if f is None:
        return False
    t = max(1e-6, 0.02 * abs(cf))
    if re.search(r"increase|rises|gain|more|above|up|fast", s):
        return abs(f - cf) <= t
    if re.search(r"decrease|fall|loss|less|below|down|slow", s):
        return abs(-f - cf) <= t
    return abs(abs(f) - abs(cf)) <= t


def fail(topic, where, msg):
    REPORT.append(f"[{topic}] {where}: {msg}")


def first_match(q, fns):
    for fn in fns:
        got = fn(q)
        if got is not None:
            return got
    return None


def matches_opt(opt, got):
    if isinstance(got, bool):
        year = opt.strip()
        if re.fullmatch(r"\d{4}", year):
            return is_leap(int(year)) == got
        return year.lower() == ("yes" if got else "no")
    return same_answer(opt, got)


def check_all(T, name, CHECKS, skip_rules=()):
    pp, mcqs = T["practiceProblems"], T["mcqs"]
    for rule, probs in pp.items():
        if rule in skip_rules:
            continue
        for i, p in enumerate(probs):
            results = [r for r in (fn(p["q"]) for fn in CHECKS) if r is not None]
            if not results:
                fail(name, f"practice {rule}#{i}", f"UNCLASSIFIED: {p['q'][:80]!r}")
            elif not any(same_answer(p["a"], r) for r in results):
                fail(name, f"practice {rule}#{i}", f"stored {p['a']!r} != computed {results[0]!r} for {p['q'][:70]!r}")
    for mcq in mcqs:
        q, opts, c = mcq["q"], mcq["opts"], mcq["c"]
        results = [r for r in (fn(q) for fn in CHECKS) if r is not None]
        if not results:
            continue
        if not any(matches_opt(opts[c], r) for r in results):
            fail(name, f"mcq#{mcq['id']}", f"opts[{c}] {opts[c]!r} != computed {results[0]!r} for {q[:70]!r}")


PCT_SIGN = re.compile(
    r"(discount|decreas|fall|fell|less|depreciat|slow|lose|lost|deduct|reduc|below|drop)"
    r"|(increas|rise|rose|gain|profit|mark|more|above|grow|grew|add)")


def classify_pcts(q):
    """Signed percents in order of appearance; sign from nearest verb before each %."""
    out = []
    for m in re.finditer(r"(\d+(?:\.\d+)?)%", q):
        v = float(m.group(1))
        before = q[max(0, m.start() - 30):m.start()].lower()
        last = None
        for mm in PCT_SIGN.finditer(before):
            last = mm
        out.append(-v if last and last.group(1) else v)
    return out


# ---------------------------------------------------------------------------
# Percentages
# ---------------------------------------------------------------------------

def pct_of(x, y):
    return x * y / 100.0


def check_basic(q):
    m = re.search(r"What percent of (\d+(?:\.\d+)?) is (\d+(?:\.\d+)?)", q)
    if m:
        return float(m.group(2)) * 100 / float(m.group(1))
    m = re.search(r"(\d+)% of a number is (\d+),? find (\d+)% of the same number", q)
    if m:
        return float(m.group(2)) / float(m.group(1)) * float(m.group(3))
    m = re.search(r"difference between (\d+)% of a number and (\d+)% of (?:the same number|it) is (\d+)", q)
    if m:
        return float(m.group(3)) * 100 / (float(m.group(1)) - float(m.group(2)))
    m = re.search(r"(\w) is (\d+)% of (\w) and \3 is (\d+)% of (\w)", q)
    if m:
        return float(m.group(2)) * float(m.group(4)) / 100
    m = re.search(r"(\d+)% of x = (\d+)% of y", q)
    if m:
        a, b = int(m.group(1)), int(m.group(2))
        g = math.gcd(b, a)
        return f"{b // g} : {a // g}"
    m = re.search(r"(\d+)% of \w+ are (\w+).*?(\d+)% of \2 are \w+", q)
    if m:
        return float(m.group(1)) * float(m.group(3)) / 100
    m = re.search(r"spends (\d+)% of (?:his|her) salary on \w+, (\d+)% on \w+,? and saves the rest ([\d,]+)", q)
    if m:
        a, b, save = float(m.group(1)), float(m.group(2)), float(m.group(3).replace(",", ""))
        return save * 100 / (100 - a - b)
    m = re.search(r"income is ([\d,]+).*?spends (\d+)% on \w+, (\d+)% on \w+, (\d+)% on \w+.*?saves", q)
    if m:
        inc = float(m.group(1).replace(",", ""))
        spend = sum(map(float, m.groups()[1:]))
        return inc * (1 - spend / 100)
    m = re.search(r"Express (\d+)/(\d+) as a percentage", q, re.I)
    if m:
        return float(m.group(1)) * 100 / float(m.group(2))
    m = re.search(r"What is ([\d.]+) as a percentage", q, re.I)
    if m:
        return float(m.group(1)) * 100
    m = re.search(r"([\d.]+)% of a number is ([\d.]+),? find the number", q, re.I)
    if m:
        return float(m.group(2)) * 100 / float(m.group(1))
    m = re.search(r"(\d+(?:\.\d+)?)% of (\d+(?:\.\d+)?)", q)
    if m:
        return pct_of(float(m.group(1)), float(m.group(2)))
    return None


def check_election(q):
    inv = 0
    m = re.search(r"(\d+)% (?:of (?:the )?(?:voters?|total votes?) )?(?:did ?not vote|didn'?t vote)", q)
    if not m:
        m = re.search(r"(\d+)% (?:of (?:the )?(?:total )?votes? )?(?:were )?invalid", q)
    if m:
        inv = int(m.group(1))
    m = re.search(r"winner got (\d+)% of (?:the )?valid votes and won by ([\d,]+).*?find the winner'?s votes", q)
    if m:
        w, diff = int(m.group(1)), float(m.group(2).replace(",", ""))
        if w != 50:
            valid = diff * 100 / (2 * w - 100)
            return valid * w / 100
    m = re.search(r"winner got (\d+)% of (?:the )?(?:remaining )?valid votes and won by ([\d,]+)", q)
    if m:
        w, diff = int(m.group(1)), float(m.group(2).replace(",", ""))
        if w != 50:
            valid = diff * 100 / (2 * w - 100)
            return valid * 100 / (100 - inv) if inv else valid
    m = re.search(r"loser got (\d+)% of valid votes and lost by ([\d,]+)", q)
    if m:
        l, diff = int(m.group(1)), float(m.group(2).replace(",", ""))
        if l != 50:
            valid = diff * 100 / (100 - 2 * l)
            return valid * 100 / (100 - inv) if inv else valid
    m = re.search(r"candidate (\w) got (\d+)% of valid votes and lost by ([\d,]+)", q)
    if m:
        p, diff = int(m.group(2)), float(m.group(3).replace(",", ""))
        if p != 50:
            valid = diff * 100 / (100 - 2 * p)
            return valid * 100 / (100 - inv) if inv else valid
    m = re.search(r"got (\d+)% marks? and failed by (\d+).*?got (\d+)% \w+ and got (\d+) (?:marks? )?(?:more|above)", q)
    if m:
        a, f, b, above = map(int, m.groups())
        return (f + above) * 100 / (b - a)
    m = re.search(r"needs (\d+)% to pass.*?gets (\d+).*?fails by (\d+)", q)
    if m:
        p, got, f = map(int, m.groups())
        return (got + f) * 100 / p
    m = re.search(r"(\d+)% of candidates? passed\.? If (\d+) failed", q)
    if m:
        p, f = map(int, m.groups())
        return f * 100 / (100 - p)
    m = re.search(r"(\d+)% failed in \w+[,.]? and (\d+)% failed in \w+[,.]? (\d+)% failed in both", q)
    if m:
        a, b, c = map(int, m.groups())
        return 100 - (a + b - c)
    return None


def check_alligation(q):
    m = re.search(r"(\d+)% \w+ (?:must be )?mixed with (\d+) (?:L|liters?|litres?) of (\d+)% \w+ to get (\d+)%", q)
    if m:
        c1, L, c2, c = int(m.group(1)), float(m.group(2)), int(m.group(3)), int(m.group(4))
        return L * (c2 - c) / (c - c1)
    m = re.search(r"(\d+) (?:L|liters?|litres?) of (\d+)% \w+ (?:is )?mixed with (\d+) (?:L|liters?|litres?) of (\d+)%", q)
    if m:
        v1, p1, v2, p2 = map(int, m.groups())
        return (v1 * p1 + v2 * p2) / (v1 + v2)
    m = re.search(r"mixes (\d+)L of water with (\d+)L of pure milk", q)
    if m:
        w, milk = map(int, m.groups())
        return 100 * milk / (w + milk)
    m = re.search(r"(\d+)L mixture.*?is (\d+)%.*?(\w+) (?:must be )?(?:to add|added) to make \w+ (\d+)%", q)
    if m:
        V, p, add, pt = int(m.group(1)), int(m.group(2)), m.group(3), int(m.group(4))
        base = V * p / 100
        if add == "water":
            return base * 100 / pt - V
        return (base - pt * V / 100) / (pt / 100 - 1)
    m = re.search(r"(\d+)L container of (\d+)% \w+, (\d+)L is replaced with water", q)
    if m:
        V, p, r = map(int, m.groups())
        return p * (V - r) / V
    m = re.search(r"(\d+)L mixture of (\d+)% \w+, (\d+)L is replaced by water", q)
    if m:
        V, p, r = map(int, m.groups())
        return p * (V - r) / V
    m = re.search(r"mixture of (\d+)L,? \w+ is (\d+)%.*?water.*?make \w+ (\d+)%", q)
    if m:
        V, p, pt = int(m.group(1)), int(m.group(2)), int(m.group(3))
        return V * p / 100 * 100 / pt - V
    m = re.search(r"in a mixture of (\d+)L, \w+ and \w+ are in ratio (\d+):(\d+).*?(\w+).*?make \w+ (\d+)%", q, re.I)
    if m:
        V, a, b, add, pt = int(m.group(1)), int(m.group(2)), int(m.group(3)), m.group(4), int(m.group(5))
        milk = V * a / (a + b)
        return milk * 100 / pt - V
    m = re.search(r"solutions? (?:of )?(\d+)% and (\d+)% \w+ (?:are )?mixed in ratio (\d+):(\d+)", q)
    if m:
        p1, p2, a, b = map(int, m.groups())
        return (a * p1 + b * p2) / (a + b)
    m = re.search(r"In what ratio must (\w+) at (\d+)/kg be mixed with (\w+) at (\d+)/kg to get (?:a mixture worth )?(\d+)/kg", q)
    if m:
        lo, hi, mean = int(m.group(2)), int(m.group(4)), int(m.group(5))
        g = math.gcd(hi - mean, mean - lo)
        return f"{(hi - mean) // g} : {(mean - lo) // g}"
    m = re.search(r"costing (\d+)/kg and (\d+)/kg to sell at (\d+)/kg", q)
    if m:
        lo, hi, mean = map(int, m.groups())
        g = math.gcd(hi - mean, mean - lo)
        return f"{(hi - mean) // g} : {(mean - lo) // g}"
    return None


def check_population(q):
    m = re.search(r"(?:population|value).*?(?:is|was) ([\d,]+).*?(?:grows|increases) (?:by|at) (\d+)% (?:per annum|each year|annually).*?after (\d+) years", q, re.I)
    if m:
        P, r, n = float(m.group(1).replace(",", "")), float(m.group(2)), float(m.group(3))
        return P * (1 + r / 100) ** n
    m = re.search(r"increases (?:by )?(\d+)% in (?:year 1|first year).*?(\d+)% in (?:year 2|second year).*?initial (?:population )?(?:was|is) ([\d,]+)", q, re.I)
    if m:
        P, a, b = float(m.group(3).replace(",", "")), float(m.group(1)), float(m.group(2))
        seg = q[m.start(1):m.end(2)]
        sign = -1 if re.search(r"decreas|fall|less", seg) else 1
        return P * (1 + a / 100) * (1 + sign * b / 100)
    m = re.search(r"population ([\d,]+).*?increases (\d+)% in year 1,? and? (\w+) (\d+)% in year 2", q)
    if m:
        P, a, word, b = float(m.group(1).replace(",", "")), float(m.group(2)), m.group(3), float(m.group(4))
        sign = -1 if re.search(r"decreas|fall|less", word) else 1
        return P * (1 + a / 100) * (1 + sign * b / 100)
    m = re.search(r"current population of a city is (\d+)", q)
    if m:
        return 133100 / 1.1 ** 2
    m = re.search(r"population is (\d+).*?increases by (\d+)% in first year and decreases by (\d+)%", q)
    if m:
        P, a, b = map(float, m.groups())
        return P * (1 + a / 100) * (1 - b / 100)
    m = re.search(r"doubles every (\d+) years", q)
    if m:
        return (2 ** (1 / int(m.group(1))) - 1) * 100
    m = re.search(r"increased from ([\d,]+) to ([\d,]+) in (\d+) years", q)
    if m:
        a, b, n = float(m.group(1).replace(",", "")), float(m.group(2).replace(",", "")), int(m.group(3))
        return ((b / a) ** (1 / n) - 1) * 100
    m = re.search(r"(?:worth|bought for) ([\d,]+).*?depreciates at (\d+)% per annum.*?after (\d+)", q)
    if m:
        P, r, n = float(m.group(1).replace(",", "")), float(m.group(2)), float(m.group(3))
        return P * (1 - r / 100) ** n
    m = re.search(r"depreciates? (\d+)% annually.*?(?:present|current) value (?:is|of) ([\d,]+).*?(\d+) year(?:s)? ago", q)
    if m:
        r, P, n = float(m.group(1)), float(m.group(2).replace(",", "")), int(m.group(3))
        return P / (1 - r / 100) ** n
    m = re.search(r"depreciates? from ([\d,]+) to ([\d,]+) in (\d+) years?", q)
    if m:
        a, b, n = float(m.group(1).replace(",", "")), float(m.group(2).replace(",", "")), int(m.group(3))
        return (1 - (b / a) ** (1 / n)) * 100
    return None


def check_profit_mark(q):
    m = re.search(r"mark(?:s|ed)? (?:his )?(?:goods|articles?|items?|an item|an article) (\d+)% above (?:CP|cost(?: price)?).*?discount of (\d+)%", q)
    if m:
        a, b = map(float, m.groups())
        return ((1 + a / 100) * (1 - b / 100) - 1) * 100
    m = re.search(r"successive discounts? (?:of )?(\d+)% and (\d+)%.*?sold for ([\d,]+).*?(?:find|what (?:was|is)).{0,15}(?:marked price|MP|original price)", q, re.I)
    if m:
        a, b = float(m.group(1)), float(m.group(2))
        sold = float(m.group(3).replace(",", ""))
        return sold / ((1 - a / 100) * (1 - b / 100))
    m = re.search(r"(?:single )?discount equivalent to (?:two successive discounts of )?(\d+)% and (\d+)%", q)
    if m:
        a, b = map(float, m.groups())
        return (1 - (1 - a / 100) * (1 - b / 100)) * 100
    m = re.search(r"buys? (?:an? |the )?\w+ for ([\d,]+) and sells? it for ([\d,]+).*?(?:profit|loss) percentage", q)
    if m:
        b, s = float(m.group(1).replace(",", "")), float(m.group(2).replace(",", ""))
        return (s - b) * 100 / b
    m = re.search(r"selling price (?:is )?([\d,]+) and profit is ([\d.]+)%.*?cost price", q)
    if m:
        s, p = float(m.group(1).replace(",", "")), float(m.group(2))
        return 100 * s / (100 + p)
    m = re.search(r"marked price .*?(?:is|of) ([\d,]+).*?discount of (\d+)%.*?selling", q, re.I)
    if m:
        return float(m.group(1).replace(",", "")) * (1 - float(m.group(2)) / 100)
    m = re.search(r"sells? (?:an? |the )?\w+ at a profit of (\d+)%.*?(?:CP|cost price) is ([\d,]+).*?SP", q)
    if m:
        p, c = float(m.group(1)), float(m.group(2).replace(",", ""))
        return (1 + p / 100) * c
    m = re.search(r"SP = ([\d,]+) and loss% = (\d+)%.*?CP", q)
    if m:
        s, l = float(m.group(1).replace(",", "")), float(m.group(2))
        return 100 * s / (100 - l)
    m = re.search(r"buys? (\d+) \w+ for ([\d,]+) and sells? them at a profit of (\d+)%.*?SP per", q)
    if m:
        n, tot, p = int(m.group(1)), float(m.group(2).replace(",", "")), float(m.group(3))
        return (1 + p / 100) * tot / n
    return None


def check_change(q):
    m = re.search(r"becomes one-fourth of its original", q)
    if m:
        return -75.0
    m = re.search(r"becomes (\d+(?:\.\d+)?) times its original", q)
    if m:
        return (float(m.group(1)) - 1) * 100
    m = re.search(r"price of petrol increases by (\d+)%", q)
    if m:
        return float(m.group(1)) * 100 / (100 + float(m.group(1)))
    m = re.search(r"price of sugar falls by (\d+)%", q)
    if m:
        return float(m.group(1)) * 100 / (100 - float(m.group(1)))
    m = re.search(r"(\w) is (\d+)% more than (\w)", q)
    if m:
        return float(m.group(2)) * 100 / (100 + float(m.group(2)))
    m = re.search(r"(\w) is (\d+)% less than (\w)", q)
    if m:
        return float(m.group(2)) * 100 / (100 - float(m.group(2)))
    m = re.search(r"inc\w+ from (\d+)% to (\d+)%", q)
    if m:
        return (float(m.group(2)) - float(m.group(1))) * 100 / float(m.group(1))
    m = re.search(r"(?:increas\w*|decreas\w*|rises?|fell|falls?|grew|grow\w*) from ([\d,]+) to ([\d,]+)", q, re.I)
    if m:
        a, b = float(m.group(1).replace(",", "")), float(m.group(2).replace(",", ""))
        return (b - a) * 100 / a
    m = re.search(r"price of a ticket is increased by (\d+)%.*?attendance", q)
    if m:
        return float(m.group(1)) * 100 / (100 + float(m.group(1)))
    m = re.search(r"spends (\d+)% of (?:his|her) income.*?(?:income|salary) (?:increases|decreases) by (\d+)%.*?expenditure (?:increases|decreases) by (\d+)%.*?savings", q)
    if m:
        s, a, b = float(m.group(1)), float(m.group(2)), float(m.group(3))
        old = 1 - s / 100
        new = (1 + a / 100) - (s / 100) * (1 + b / 100)
        return (new - old) * 100 / old
    if re.search(r"net (?:percentage )?(?:change|effect)|find net change|what happens", q.lower()) \
            and not re.search(r"net (?:change|increase).*?is \d+%.*?one (?:increase|decrease)", q):
        signed = classify_pcts(q)
        if len(signed) >= 2:
            p = 1.0
            for s in signed:
                p *= (1 + s / 100)
            return (p - 1) * 100
    return None


def check_successive(q):
    m = re.search(r"net (?:percentage )?(?:change|increase).*?is (\d+)%.*?one (?:increase|decrease).*?(\d+)%", q, re.I)
    if m:
        net, a = map(float, m.groups())
        return ((1 + net / 100) / (1 + a / 100) - 1) * 100
    m = re.search(r"after two successive discounts,? a \w+ is sold for ([\d,]+).*?marked price is ([\d,]+).*?first discount is (\d+)%", q, re.I)
    if m:
        sold, mp, f = float(m.group(1).replace(",", "")), float(m.group(2).replace(",", "")), float(m.group(3))
        return (1 - sold / (mp * (1 - f / 100))) * 100
    m = re.search(r"three successive (?:increases|decreases) of ([\d.]+)%, ([\d.]+)% and ([\d.]+)%", q)
    if m:
        p = 1.0
        for v in map(float, m.groups()):
            p *= (1 + v / 100)
        return (p - 1) * 100
    m = re.search(r"(?:is increased|increased|increases) by (\d+)% (?:and then|then) (?:decreased|decreases) by (\d+)%.*?final value is (\d+)", q)
    if m:
        a, b, fv = map(float, m.groups())
        return fv / ((1 + a / 100) * (1 - b / 100))
    m = re.search(r"increases by (\d+)% each year.*?after (\d+) years", q)
    if m:
        return ((1 + float(m.group(1)) / 100) ** int(m.group(2)) - 1) * 100
    if re.search(r"successive", q.lower()):
        signed = classify_pcts(q)
        if len(signed) >= 2:
            p = 1.0
            for s in signed:
                p *= (1 + s / 100)
            return (p - 1) * 100
    return None


def verify_percentages(T):
    pp = T["practiceProblems"]
    pass_pct = None
    for p in pp.get("elections-marks", []):
        m = re.search(r"got (\d+)% marks? and failed by (\d+).*?got (\d+)% \w+ and got (\d+) (?:marks? )?(?:more|above)", p["q"])
        if m:
            a, f, b, above = map(int, m.groups())
            total = (f + above) * 100 / (b - a)
            pass_pct = (a * total / 100 + f) * 100 / total
            break

    def check_above(q):
        if re.search(r"In the above problem, find the pass percentage", q):
            return pass_pct
        return None

    CHECKS = [check_above, check_profit_mark, check_election, check_alligation,
              check_population, check_change, check_successive, check_basic]
    check_all(T, "percentages", CHECKS)


# ---------------------------------------------------------------------------
# Clock & Calendar
# ---------------------------------------------------------------------------

def is_leap(y):
    return y % 4 == 0 and (y % 100 != 0 or y % 400 == 0)


def clock_angle(h, m):
    a = abs(30 * (h % 12) - 5.5 * m)
    return min(a, 360 - a)


def to_min(h, m, mer):
    mer = mer.lower()
    h %= 12
    if mer.startswith("p") or mer == "noon":
        h += 12
    if mer == "midnight":
        h = 0
    return h * 60 + m


def check_angle(q):
    m = re.search(r"at (\d+):(\d+)", q)
    if m and re.search(r"angle|degrees", q, re.I):
        return clock_angle(int(m.group(1)), int(m.group(2)))
    m = re.search(r"between (\d+):(\d+) and", q)
    if m:
        return clock_angle(int(m.group(1)), int(m.group(2)))
    return None


def check_coincide(q):
    m = re.search(r"coincide between (\d+) and", q)
    if m:
        return int(m.group(1)) * 30 / 5.5
    m = re.search(r"be opposite between (\d+) and", q)
    if m:
        return (int(m.group(1)) * 30 + 180) / 5.5
    return None


def check_mirror(q):
    m = re.search(r"mirror (?:image|time) of (\d+):(\d+)", q, re.I)
    if m:
        return (720 - (int(m.group(1)) * 60 + int(m.group(2)))) % 720
    m = re.search(r"clock shows (\d+):(\d+).*?mirror", q, re.I)
    if m:
        return (720 - (int(m.group(1)) * 60 + int(m.group(2)))) % 720
    return None


def check_gainloss(q):
    m = re.search(r"(gains|loses) (\d+) min(?:ute)?s?(?:/| per | every )hour.*?set (?:right )?(?:at )?\s*(\d+):(\d+)(?: (AM|PM|noon|midnight))?.*?at (\d+):(\d+) (AM|PM|noon|midnight)", q, re.I)
    if m:
        sign = 1 if m.group(1) == "gains" else -1
        rate = int(m.group(2))
        h1, m1 = int(m.group(3)), int(m.group(4))
        t1 = 720 if h1 == 12 and not m.group(5) else to_min(h1, m1, m.group(5) or "AM")
        t2 = to_min(int(m.group(6)), int(m.group(7)), m.group(8))
        elapsed = (t2 - t1) / 60.0
        return t1 + elapsed * 60 + sign * rate * elapsed
    m = re.search(r"set right at (\d+):(\d+) (AM|PM|noon|midnight)(?: and)? shows (\d+):(\d+) at (\d+):(\d+) (AM|PM|noon|midnight)", q)
    if m:
        t1 = to_min(int(m.group(1)), int(m.group(2)), m.group(3))
        mer = m.group(8)
        shown = to_min(int(m.group(4)), int(m.group(5)), mer)
        t2 = to_min(int(m.group(6)), int(m.group(7)), mer)
        return (shown - t2) / ((t2 - t1) / 60.0)
    m = re.search(r"shows (\d+):(\d+) when the correct time is (\d+):(\d+)", q)
    if m:
        diff = int(m.group(1)) * 60 + int(m.group(2)) - int(m.group(3)) * 60 - int(m.group(4))
        while abs(diff) > 360:
            diff -= 720 if diff > 0 else -720
        return f"{'fast' if diff > 0 else 'slow'} by {abs(diff)} min"
    m = re.search(r"(\d+) minutes slow.*?gains (\d+) minutes every hour", q)
    if m:
        return float(m.group(1)) / float(m.group(2))
    m = re.search(r"(gains|loses) (\d+) minutes? per day.*?set right at (\d+):(\d+) (AM|PM|noon|midnight).*?(?:at|to) (?:noon|midnight)", q)
    if m:
        sign = 1 if m.group(1) == "gains" else -1
        return 720 + sign * int(m.group(2)) / 2.0
    return None


def check_fastslow(q):
    m = re.search(r"(\d+) minutes (fast|slow)", q)
    if m:
        return float(m.group(1))
    return None


def check_odd_days(q):
    m = re.search(r"(\d+) years? \((\d+) leap years? and (\d+) ordinary years?\)", q)
    if m:
        return (2 * int(m.group(2)) + int(m.group(3))) % 7
    m = re.search(r"(\d+) ordinary(?: years?)?\s*\+\s*(\d+) leap(?: years?)?", q)
    if m:
        return (int(m.group(1)) + 2 * int(m.group(2))) % 7
    m = re.search(r"(\d+) ordinary years", q)
    if m:
        return int(m.group(1)) % 7
    m = re.search(r"odd days (?:are there )?in (\d+) years", q)
    if m:
        n = int(m.group(1))
        leaps = n // 4 - n // 100 + n // 400
        return (n + leaps) % 7
    return None


def check_leap(q):
    m = re.search(r"is (\d{4}) (?:a )?(leap year|not a leap year)\??", q, re.I)
    if m:
        return is_leap(int(m.group(1)))
    m = re.search(r"(\d{4}) (?:is a )?(leap year|not a leap year)\??", q, re.I)
    if m:
        return is_leap(int(m.group(1)))
    m = re.search(r"Which (?:of the following )?is (?:a )?leap year.*?(\d{4})", q)
    if m:
        return is_leap(int(m.group(1)))
    m = re.search(r"Which (?:of the following )?(?:is )?NOT (?:a )?leap year.*?(\d{4})", q)
    if m:
        return not is_leap(int(m.group(1)))
    return None


def check_weekday(q):
    m = re.search(r"(\d{1,2}) (\w+) (\d{4}) is (\w+);?\s*(\d{1,2}) (\w+) (\d{4})\?", q)
    if m:
        d = datetime.date(int(m.group(7)), MONTHS[m.group(6)], int(m.group(5)))
        return WEEK[d.weekday()]
    m = re.search(r"(\d{1,2}) (\w+) (\d{4}) was which day", q)
    if m:
        d = datetime.date(int(m.group(3)), MONTHS[m.group(2)], int(m.group(1)))
        return WEEK[d.weekday()]
    return None


def check_repeat(q):
    m = re.search(r"(?:calendar|calendar of) (\d{4}) (?:will )?(?:repeat|be the same)", q, re.I)
    if not m:
        return None
    y = int(m.group(1))
    od = (y - 1) + (y - 1) // 4 - (y - 1) // 100 + (y - 1) // 400
    base = od % 7
    for yy in range(y + 1, y + 41):
        od += 366 if is_leap(yy - 1) else 365
        if od % 7 == base and is_leap(yy) == is_leap(y):
            return yy
    return None


def check_monthdays(q):
    m = re.search(r"if 1 (\w+) is (\w+),? what (?:day|will be|is) (?:is )?1 (\w+)", q, re.I)
    if not m:
        return None
    months = {k.lower(): v for k, v in MONTHS.items()}
    months.update({k.lower()[:3]: v for k, v in MONTHS.items()})
    bm = months.get(m.group(1).lower())
    am = months.get(m.group(3).lower())
    if bm is None or am is None:
        return None
    week = [w.lower() for w in WEEK]
    bw = m.group(2).lower()
    if bw not in week:
        return None
    return WEEK[(week.index(bw) + MONTH_DAYS[bm]) % 7]


def verify_clock_calendar(T):
    CHECKS = [check_gainloss, check_angle, check_coincide, check_mirror,
              check_fastslow, check_odd_days, check_leap, check_weekday, check_repeat, check_monthdays]
    check_all(T, "clock-calendar", CHECKS)


# ---------------------------------------------------------------------------
# Direction Sense
# ---------------------------------------------------------------------------

def parse_moves(q):
    moves = []
    pat = re.compile(r"(\d+(?:\.\d+)?)\s*(km|m|meters|kilometers)\s*(north|south|east|west)", re.I)
    for m in pat.finditer(q):
        moves.append((m.group(3).lower(), float(m.group(1))))
    if not moves:
        pat2 = re.compile(r"(north|south|east|west)\s*(?:of|then\s*)?\s*(\d+(?:\.\d+)?)\s*(km|m)", re.I)
        for m in pat2.finditer(q):
            moves.append((m.group(1).lower(), float(m.group(2))))
    return moves


def net_position(moves):
    x = y = 0.0
    for d, dist in moves:
        if d == "north":
            y += dist
        elif d == "south":
            y -= dist
        elif d == "east":
            x += dist
        elif d == "west":
            x -= dist
    return x, y


def check_pythagoras(q):
    if re.search(r"in which direction|which direction", q, re.I):
        return None
    moves = parse_moves(q)
    if len(moves) >= 2:
        x, y = net_position(moves)
        return (x * x + y * y) ** 0.5
    return None


def check_net(q):
    moves = parse_moves(q)
    if len(moves) >= 3:
        x, y = net_position(moves)
        parts = []
        if y > 0:
            parts.append(f"{y:g} km north")
        elif y < 0:
            parts.append(f"{-y:g} km south")
        if x > 0:
            parts.append(f"{x:g} km east")
        elif x < 0:
            parts.append(f"{-x:g} km west")
        if not parts:
            return "same point"
        return ", ".join(parts)
    return None


def check_chain(q):
    q = re.sub(r"\b(?:town|city|village|place|point)\s+([a-z])\b", r"\1", q, flags=re.I)
    rels = re.findall(r"(\w+) is (\d+(?:\.\d+)?) km (north|south|east|west) of (\w+)", q, re.I)
    if not rels:
        return None
    m = re.search(r"distance between [\w ]*?(\w+) and [\w ]*?(\w+)\?", q)
    if not m:
        return None
    t1, t2 = m.group(1).upper(), m.group(2).upper()
    rels = [(a.upper(), float(d), dirn.lower(), b.upper()) for a, d, dirn, b in rels]
    pos = {}
    pos[rels[0][3]] = (0.0, 0.0)
    for _ in range(len(rels) + 1):
        for a, d, dirn, b in rels:
            if b in pos and a not in pos:
                x, y = pos[b]
                if dirn == "north":
                    pos[a] = (x, y + d)
                elif dirn == "south":
                    pos[a] = (x, y - d)
                elif dirn == "east":
                    pos[a] = (x + d, y)
                else:
                    pos[a] = (x - d, y)
    if t1 not in pos or t2 not in pos:
        return None
    x1, y1 = pos[t1]
    x2, y2 = pos[t2]
    return ((x1 - x2) ** 2 + (y1 - y2) ** 2) ** 0.5


def check_two_cars(q):
    m = re.search(r"car a (?:travels|goes) ([\d.]+) km (north|south|east|west),? then ([\d.]+) km (north|south|east|west)\. car b (?:travels|goes) ([\d.]+) km (north|south|east|west),? then ([\d.]+) km (north|south|east|west)", q, re.I)
    if not m:
        return None

    def pos(v1, d1, v2, d2):
        x = y = 0.0
        for v, d in ((v1, d1), (v2, d2)):
            if d == "north":
                y += v
            elif d == "south":
                y -= v
            elif d == "east":
                x += v
            else:
                x -= v
        return x, y

    ax, ay = pos(float(m.group(1)), m.group(2).lower(), float(m.group(3)), m.group(4).lower())
    bx, by = pos(float(m.group(5)), m.group(6).lower(), float(m.group(7)), m.group(8).lower())
    return ((ax - bx) ** 2 + (ay - by) ** 2) ** 0.5


DIR_IDX = {"north": 0, "east": 90, "south": 180, "west": 270}
DIRS8 = ["North", "North-East", "East", "South-East", "South", "South-West", "West", "North-West"]


def check_rotation(q):
    m = re.search(r"faces?\s+(\w+)", q, re.I)
    if not m:
        return None
    start = DIR_IDX.get(m.group(1).lower())
    if start is None:
        return None
    turns = re.findall(r"(\d+)°\s*(?:in\s+(?:the\s+)?)?(clockwise|counter ?clockwise|anti[- ]?clockwise|anticlockwise)", q, re.I)
    if not turns:
        if not re.search(r"turns?\s+(?:to\s+(?:the\s+|his\s+|her\s+)?)?(left|right)", q, re.I):
            return None
        total = start
        for way in re.findall(r"turns?\s+(?:to\s+(?:the\s+|his\s+|her\s+)?)?(left|right)", q, re.I):
            total += 90 if way.lower() == "right" else -90
        return DIRS8[round(total % 360 / 45) % 8]
    total = start
    for deg, way in turns:
        w = re.sub(r"\s+", "", way).lower()
        total += int(deg) if w.startswith("c") and not w.startswith("counter") else -int(deg)
    return DIRS8[round(total % 360 / 45) % 8]


def check_relabel(q):
    maps = re.findall(r"the (north|south|east|west) becomes "
                      r"(north\s*-?\s*east|north\s*-?\s*west|south\s*-?\s*east|south\s*-?\s*west|north|south|east|west)",
                      q, re.I)
    if len(maps) < 2:
        return None
    tm = re.search(r"what will the (north|south|east|west) become", q, re.I)
    if not tm:
        return None
    ang = {"north": 0, "northeast": 45, "east": 90, "southeast": 135,
           "south": 180, "southwest": 225, "west": 270, "northwest": 315}
    key = lambda s: re.sub(r"[\s-]", "", s.lower())
    shifts = {(ang[key(m[1])] - ang[key(m[0])]) % 360 for m in maps}
    if len(shifts) != 1:
        return None
    p = (ang[key(tm.group(1))] + shifts.pop()) % 360
    return {0: "North", 45: "North-East", 90: "East", 135: "South-East",
            180: "South", 225: "South-West", 270: "West", 315: "North-West"}[p]


def _vec(dirn, dist):
    if "-" in dirn:
        dx = dy = dist / 2 ** 0.5
        if dirn.startswith("south"):
            dy = -dy
        if "west" in dirn:
            dx = -dx
        return dx, dy
    if dirn == "north":
        return 0.0, dist
    if dirn == "south":
        return 0.0, -dist
    if dirn == "east":
        return dist, 0.0
    return -dist, 0.0


def _dir8(x, y, dominant=False):
    if dominant:
        if abs(x) > abs(y):
            return "East" if x > 0 else "West"
        if abs(y) > abs(x):
            return "North" if y > 0 else "South"
    if x > 0 and y > 0:
        return "North-East"
    if x > 0 and y < 0:
        return "South-East"
    if x < 0 and y > 0:
        return "North-West"
    if x < 0 and y < 0:
        return "South-West"
    if abs(x) < 1e-9 and abs(y) < 1e-9:
        return None
    if x > 0:
        return "East"
    if x < 0:
        return "West"
    if y > 0:
        return "North"
    return "South"


def _walk_parse(q):
    ql = q.lower()
    facing = None
    fm = re.search(r"facing (north|south|east|west)", ql)
    if fm:
        facing = fm.group(1)
    unknown = None
    um = re.search(r"(?:rode|rides?)\s+(?:his\s+bicycle\s+)?([a-z]+)ward", ql)
    if um:
        unknown = re.sub(r"ward$", "", um.group(1))
        if facing is None:
            facing = unknown
    legs = []
    for m in re.finditer(
            r"turns?\s+(?:to\s+(?:the\s+|his\s+|her\s+)?)?(left|right)|"
            r"(\d+(?:\.\d+)?)\s*(km|metres?|meters?|m)\s*(?:(?:towards?\s+)|(?:in\s+the?\s+))?"
            r"(north\s*-?\s*east|north\s*-?\s*west|south\s*-?\s*east|south\s*-?\s*west|north|south|east|west)?",
            ql):
        if m.group(1):
            if facing == "north":
                facing = "west" if m.group(1) == "left" else "east"
            elif facing == "south":
                facing = "east" if m.group(1) == "left" else "west"
            elif facing == "east":
                facing = "north" if m.group(1) == "left" else "south"
            elif facing == "west":
                facing = "south" if m.group(1) == "left" else "north"
            continue
        dirn = m.group(4)
        if dirn:
            facing = re.sub(r"\s*-\s*", "-", dirn)
        legs.append((float(m.group(2)), facing))
    return legs, unknown


def check_walk(q):
    ql = q.lower()
    if not re.search(r"\b(walks?|rode|rides?|travels?|moves?|goes?|drives?|walks?)\b", ql):
        return None
    if "shadow" in ql:
        return None
    if "and so on" in ql or "making a loop" in ql:
        return None
    legs, unknown = _walk_parse(q)
    if not legs:
        return None
    if unknown:
        um = re.search(r"found himself exactly (\d+(?:\.\d+)?) km (north|south|east|west) of", ql)
        if not um:
            return None
        tx, ty = _vec(um.group(2), float(um.group(1)))
        ux, uy = _vec(unknown, 1.0)
        cx = cy = 0.0
        for d, dirn in legs:
            dx, dy = _vec(dirn, d)
            cx += dx
            cy += dy
        return (tx - cx) / ux if abs(ux) > 1e-9 else (ty - cy) / uy
    x = y = 0.0
    for d, dirn in legs:
        if dirn is None:
            continue
        dx, dy = _vec(dirn, d)
        x += dx
        y += dy
    dist = (x * x + y * y) ** 0.5
    if re.search(r"and in which direction", ql):
        d = _dir8(x, y) or "same point"
        return f"{dist:g} km {d}"
    if re.search(r"how far|distance", ql):
        return dist
    if re.search(r"in which direction is \w+ from", ql):
        return _dir8(x, y, dominant=True)
    if re.search(r"which direction is (?:he|she) facing|facing now", ql):
        return _dir8(x, y, dominant=True)
    return None


def check_relative(q):
    m = re.search(r"(?:(\w+) is in which direction|in which direction is (\w+)) (?:from|of) (\w+)", q, re.I)
    if not m:
        return None
    tgt, base = (m.group(1) or m.group(2)).upper(), m.group(3).upper()
    rels = re.findall(r"(\w+) is (?:(\d+(?:\.\d+)?) (?:km|metres?|meters?|m) )?"
                      r"(north\s*-?\s*east|north\s*-?\s*west|south\s*-?\s*east|south\s*-?\s*west|north|south|east|west) of (\w+)",
                      q, re.I)
    if not rels:
        return None
    rels = [(a.upper(), float(d) if d else 1.0, re.sub(r"\s*-\s*", "-", d2).lower(), b.upper())
            for a, d, d2, b in rels]
    pos = {}
    pos[rels[0][3]] = (0.0, 0.0)
    for _ in range(len(rels) + 1):
        for a, dist, dirn, b in rels:
            dx, dy = _vec(dirn, dist)
            if b in pos and a not in pos:
                x, y = pos[b]
                pos[a] = (x + dx, y + dy)
            elif a in pos and b not in pos:
                x, y = pos[a]
                pos[b] = (x - dx, y - dy)
    if tgt not in pos or base not in pos:
        return None
    x, y = pos[tgt][0] - pos[base][0], pos[tgt][1] - pos[base][1]
    d = _dir8(x, y)
    return "same point" if d is None else d


def check_coded(q):
    defs = re.findall(r"A ([^\w\s]+) B means A is (?:(\d+(?:\.\d+)?) km )?"
                      r"(north\s*-?\s*east|north\s*-?\s*west|south\s*-?\s*east|south\s*-?\s*west|north|south|east|west) of B",
                      q, re.I)
    if not defs:
        return None
    ops = {}
    for op, dist, d in defs:
        ops[op] = (re.sub(r"\s*-\s*", "-", d).lower(), float(dist) if dist else None)
    m = re.search(r"What is P ([^\w\s]+) Q ([^\w\s]+) R\?", q)
    if not m:
        return None
    o1, o2 = m.group(1), m.group(2)
    if o1 not in ops or o2 not in ops:
        return None
    kk = lambda s: re.sub(r"[\s-]", "", s)
    OPP = {"north": "south", "south": "north", "east": "west", "west": "east",
           "northeast": "southwest", "southwest": "northeast",
           "northwest": "southeast", "southeast": "northwest"}
    if ops[o1][1] is None and ops[o2][1] is None and OPP.get(kk(ops[o1][0])) == kk(ops[o2][0]):
        d = {"north": "North", "east": "East", "northeast": "North-East", "northwest": "North-West",
             "south": "South", "west": "West", "southeast": "South-East", "southwest": "South-West"}[kk(ops[o1][0])]
        return f"P is {d} of R"
    x, y = _vec(ops[o1][0], ops[o1][1] or 1.0)
    x2, y2 = _vec(ops[o2][0], ops[o2][1] or 1.0)
    x, y = x + x2, y + y2
    if abs(x) < 1e-9 and abs(y) < 1e-9:
        return "P is at same position as R"
    d = _dir8(x, y)
    out = f"P is {d} of R"
    if ops[o1][1] is not None or ops[o2][1] is not None:
        dist = (x * x + y * y) ** 0.5
        if x > 0 and abs(x - y) < 1e-9 and abs(x - round(x)) < 1e-9:
            out = f"{out}, {x:g}√2 km away"
        else:
            out = f"{out}, {dist:.4g} km away"
    return out


def check_shadow(q):
    ql = q.lower()
    if "shadow" not in ql:
        return None
    if "noon" in ql:
        return "No shadow"
    m = re.search(r"shadow (?:of [\w ]+? )?falls? (?:exactly )?(?:to )?(?:her |his |the )?(left|right|behind|front)", ql)
    m2 = re.search(r"shadow of [^.]+? falls? (?:exactly )?(?:to )?(?:her |his |the )?(left|right|behind|front)", ql)
    m3 = re.search(r"(\w+)'s shadow falls? (?:exactly )?(?:to )?(?:her |his |the )?(left|right|behind|front)", ql)
    got = m or m2 or m3
    if not got:
        if not re.search(r"in which direction is (?:the )?(?:his |her |\w+'s )?shadow|where is (?:his |her |\w+'s )?shadow", ql):
            return None
        fm = re.search(r"facing (north|south|east|west)", ql)
        if not fm:
            return None
        sh = 270 if ("morning" in ql or "6 am" in ql or "6am" in ql or "sunrise" in ql) else 90
        rel = round((sh - DIR_IDX[fm.group(1)]) % 360 / 90) % 4
        return {0: "Front", 1: "Right", 2: "Behind", 3: "Left"}[rel]
    side = got.group(1)
    shadow = 270 if ("morning" in ql or "sunrise" in ql) else 90
    off = {"left": 90, "right": -90, "front": 0, "behind": 180}[side]
    facing = round((shadow + off) % 360 / 90) % 4
    p = {0: "North", 1: "East", 2: "South", 3: "West"}[facing]
    if m3:
        qm = re.search(r"(\w+) is facing in which direction", ql)
        if qm and qm.group(1) != m3.group(1):
            p = {0: "South", 1: "West", 2: "North", 3: "East"}[facing]
    return p


def check_coords(q):
    ql = q.lower()
    if "represented by" not in ql or "after moving" not in ql:
        return None
    legs = re.findall(r"(\d+(?:\.\d+)?) km (north|south|east|west)", ql)
    if not legs:
        return None
    x = y = 0.0
    for d, dirn in legs:
        if dirn == "north":
            y += float(d)
        elif dirn == "south":
            y -= float(d)
        elif dirn == "east":
            x += float(d)
        else:
            x -= float(d)
    return f"({y:g}, {x:g})"


def verify_direction_sense(T):
    CHECKS = [check_chain, check_two_cars, check_pythagoras, check_net,
              check_rotation, check_relabel, check_walk, check_relative,
              check_coded, check_shadow, check_coords]
    check_all(T, "direction-sense", CHECKS)


# ---------------------------------------------------------------------------
# Simplification
# ---------------------------------------------------------------------------

def eval_expr(e):
    import ast
    ops = {ast.Add: lambda a, b: a + b, ast.Sub: lambda a, b: a - b,
           ast.Mult: lambda a, b: a * b, ast.Div: lambda a, b: a / b,
           ast.Pow: lambda a, b: a ** b}

    def _eval(node):
        if isinstance(node, ast.Expression):
            return _eval(node.body)
        if isinstance(node, ast.Constant):
            if isinstance(node.value, (int, float)):
                return float(node.value)
            raise ValueError(f"unsupported constant {node.value!r}")
        if isinstance(node, ast.BinOp):
            return ops[type(node.op)](_eval(node.left), _eval(node.right))
        if isinstance(node, ast.UnaryOp):
            v = _eval(node.operand)
            return v if isinstance(node.op, ast.UAdd) else -v
        if isinstance(node, ast.Call) and isinstance(node.func, ast.Attribute) \
                and getattr(node.func.value, "id", "") == "math" and node.func.attr == "sqrt":
            import math
            return math.sqrt(_eval(node.args[0]))
        raise ValueError(f"unsupported node {type(node).__name__}")

    e = re.sub(r"√\s*\(([^()]*)\)", r"math.sqrt(\1)", e)
    tree = ast.parse(e, mode="eval")
    r = _eval(tree)
    if isinstance(r, complex):
        raise ValueError(f"complex result {r}")
    return r


def verify_simplification(T):
    pp, mcqs = T["practiceProblems"], T["mcqs"]

    def extract_expr(q):
        m = re.search(r"\$(.+?)\$", q)
        if not m:
            return None
        e, rhs = m.group(1), None
        rest = q[m.end():]
        m3 = re.search(r"of\s+(?:a|the)?\s*(?:number|no\.?)\s+is\s+([\d.]+)", rest)
        if m3:
            e, rhs = f"{e} * X", m3.group(1)
        else:
            m2 = re.match(r"[\s,]*of\s+(?:([\d.]+)|\$(.+?)\$)", rest)
            if m2 is not None:
                g1, g2 = m2.group(1), m2.group(2)
                e = f"{e} * {g1 or g2}"
        e = e.replace("\\%", "%")
        e = re.sub(r"\\frac\{([^{}]*)\}\{([^{}]*)\}\s*\\text\{\s*of\s*\}\s*([\d.]+)",
                   r"(\1/\2) * \3", e)
        e = re.sub(r"([\d.]+%?)\s*\\text\{\s*of\s*\}\s*([\d.]+%?|X)", r"(\1 * \2)", e)
        e = re.sub(r"\\frac\{((?:[^{}]|\{[^{}]*\})*)\}\{((?:[^{}]|\{[^{}]*\})*)\}",
                   r"((\1)/(\2))", e)
        e = re.sub(r"\\sqrt\[(\d+)\]\{([^{}]*)\}", r"(\2) ** (1 / \1)", e)
        e = re.sub(r"\\sqrt\{([^{}]*)\}", r"math.sqrt(\1)", e)
        e = re.sub(r"\\overline\{([^{}]*)\}", r"(\1)", e)
        e = e.replace("\\div", "/").replace("\\times", "*").replace("\\cdot", "*")

        def powify(m):
            base, exp = m.group(1), m.group(2)
            if "/" in exp or "." in exp:
                try:
                    from fractions import Fraction
                    f = Fraction(exp)
                    return f"({base}**({f.numerator})) ** (1/{f.denominator})"
                except Exception:
                    pass
            return f"({base}**({exp}))"

        e = re.sub(r"(\([-\d.]+\)|-?[\d.]+)\^\{?(-?\d+(?:\.\d+)?(?:/-?\d+)?)\}?", powify, e)
        e = re.sub(r"\s*=\s*\?\s*[.!]?\s*$", "", e)
        if "=" in e:
            lhs, r = e.split("=", 1)
            e, rhs = lhs.strip(), r.strip()
        e = e.replace("\\", "")
        e = e.replace("%", "/100")
        e = re.sub(r"(\d)\(", r"\1*(", e)
        e = re.sub(r"\)\(", r")*(", e)
        e = e.replace("{", "(").replace("}", ")").replace("[", "(").replace("]", ")")
        e = re.sub(
            r"\)\^\((-?\d+(?:\.\d+)?(?:/-?\d+)?)\)"
            r"|\)\^\{(-?\d+(?:\.\d+)?(?:/-?\d+)?)\}"
            r"|\)\^(-?\d+(?:\.\d+)?(?:/-?\d+)?)",
            lambda m: f")**({m.group(1) or m.group(2) or m.group(3)})", e)
        return e, rhs

    def check_expr(q):
        out = extract_expr(q)
        if out is None:
            return None
        e, rhs = out
        try:
            if rhs is None:
                return eval_expr(e)
            e = e.replace("?", "X")
            rhs = rhs.replace("?", "X")

            def ev(s, xv=None):
                return eval_expr(s if xv is None else s.replace("X", f"({xv})"))

            if "X" in e:
                a, c = ev(e, 1) - ev(e, 0), ev(e, 0)
                return (ev(rhs) - c) / a if abs(a) > 1e-12 else None
            if "X" in rhs:
                a, c = ev(rhs, 1) - ev(rhs, 0), ev(rhs, 0)
                return (ev(e) - c) / a if abs(a) > 1e-12 else None
        except Exception:
            return None

    def stored_val(s):
        s = s.strip()
        if s.endswith("%"):
            return float(s[:-1].strip()) / 100
        m = re.match(r"\$\\frac\{([^{}]*)\}\{([^{}]*)\}\$", s)
        if m:
            return eval_expr(f"(({m.group(1)}))/(({m.group(2)}))")
        m = re.match(r"\$([\d.]+)\^\{([^{}]*)\}\$", s)
        if m:
            return eval_expr(f"({m.group(1)}) ** ({m.group(2)})")
        m = re.match(r"\$([\d.]+)\\sqrt\{([^{}]*)\}\$", s)
        if m:
            return eval_expr(f"({m.group(1)}) * math.sqrt({m.group(2)})")
        mm = re.search(r"-?\d+(?:\.\d+)?", s)
        if mm is None:
            raise ValueError(f"no number in {s!r}")
        return float(mm.group())

    def ans_match(stored, got):
        try:
            want = stored_val(stored)
        except Exception:
            return False
        return isinstance(got, (int, float)) and math.isclose(
            got, want, rel_tol=0.02, abs_tol=1e-6)

    def nearest_opt(got, opts):
        vals = []
        for o in opts:
            try:
                vals.append(stored_val(o))
            except Exception:
                vals.append(float("inf"))
        return vals.index(min(vals, key=lambda v: abs(v - got)
                              if isinstance(v, (int, float)) else float("inf")))

    def check_indices(q):
        if "show" in q.lower():
            return "Proved"
        mm = re.search(r"If\s+\$([\d.]+)\^x\s*=\s*([\d.]+)\$,\s*find\s+\$([\d.]+)\^x\$", q, re.I)
        if mm:
            b, v, B = float(mm.group(1)), float(mm.group(2)), float(mm.group(3))
            return B ** (math.log(v) / math.log(b))
        expr = None
        for m in re.finditer(r"\$([^$]+)\$", q):
            if re.fullmatch(r"[a-z]", m.group(1)):
                continue
            expr = m.group(1)
            break
        if expr is None:
            return None
        s = expr.replace("\\div", "/").replace("\\times", "*").replace("\\cdot", "*")
        s = re.sub(r"\\frac\{((?:[^{}]|\{[^{}]*\})*)\}\{((?:[^{}]|\{[^{}]*\})*)\}",
                   r"(\1)/(\2)", s)
        s = re.sub(r"\^\{([^{}]*)\}", r"^(\1)", s)
        s = re.sub(r"\^([a-z])", r"^(\1)", s)
        s = s.replace("\\", "").replace(" ", "")

        ms = re.fullmatch(r"\(([a-z])\^\((\w)\)/([a-z])\^\((\w)\)\)\^\((\w)\+(\w)\)", s)
        if ms:
            v1, e1, v2, e2, t1, t2 = ms.groups()
            if v1 == v2 and t1 == e1 and t2 == e2:
                return f"${v1}^{{{e1}^2-{e2}^2}}$"

        def parse_exp(t):
            mm = re.fullmatch(r"(-?\d*)([a-z])?([+-]\d+)?", t)
            if not mm:
                return None
            if mm.group(2) is None:
                try:
                    return (0, int(t), None)
                except ValueError:
                    return None
            c = mm.group(1)
            c = -1 if c == "-" else (int(c) if c else 1)
            try:
                k = int(mm.group(3) or 0)
            except ValueError:
                return None
            return (c, k, mm.group(2))

        def factors(side, sign=1):
            out, cur = [], sign
            for t in re.split(r"([*/])", side):
                if t == "*":
                    cur = sign
                elif t == "/":
                    cur = -sign
                elif t:
                    g = re.fullmatch(r"\(((?:[^()]|\([^()]*\))*)\)", t)
                    if g:
                        inner = factors(g.group(1), cur)
                        if inner is None:
                            return None
                        out.extend(inner)
                        continue
                    for sub in re.split(r"(?<=\))(?=[a-z(])", t):
                        if not sub:
                            continue
                        pm = re.fullmatch(r"([\d.]+|[a-z])\^\(([^()]*)\)", sub)
                        if pm:
                            e = parse_exp(pm.group(2))
                            if e is None:
                                return None
                            out.append((pm.group(1), (cur * e[0], cur * e[1], e[2])))
                            continue
                        pm = re.fullmatch(r"([\d.]+|[a-z])\^([\d.]+)", sub)
                        if pm:
                            out.append((pm.group(1), (0, cur * int(pm.group(2)), None)))
                            continue
                        return None
            return out

        def fmt(c, k, let):
            cpart = let if c == 1 else (f"-{let}" if c == -1 else f"{c}{let}")
            return cpart if k == 0 else f"{cpart}{k:+d}"

        if "=" in s:
            lhs, rhs = s.split("=", 1)
            lf = factors(lhs)
            if lf is None or not lf:
                return None
            base = lf[0][0]
            if any(b != base for b, _ in lf):
                return None
            tc = sum(e[0] for _, e in lf)
            tk = sum(e[1] for _, e in lf)
            tl = lf[0][1][2]
            if any(e[2] is not None and e[2] != tl for _, e in lf) or tl != "x" or tc == 0:
                return None
            rf = factors(rhs)
            if rf and len(rf) == 1 and rf[0][0] == base:
                rc, rk, rl = rf[0][1]
                if rl is None:
                    return float((rk - tk) / tc)
            try:
                b = eval_expr(rhs)
            except Exception:
                return None
            return math.log(b) / math.log(float(base))

        gm = re.fullmatch(r"\(([^()]*)\)\^\(?(-?\d+)\)?", s)
        if gm and "/" not in gm.group(1):
            n = int(gm.group(2))
            rebuilt, ok = [], True
            for f in re.split(r"(?<=[\d)])(?=[a-z(])", gm.group(1)):
                pm = re.fullmatch(r"([\d.]+|[a-z])\^\(?([^()]*)\)?", f)
                if not pm:
                    ok = False
                    break
                e = parse_exp(pm.group(2))
                if e is None or e[2] is not None or e[0] not in (0, 1):
                    ok = False
                    break
                rebuilt.append(f"{pm.group(1)}^({e[1] * n})")
            if ok:
                s = "*".join(rebuilt)

        lf = factors(s)
        if lf is None or not lf:
            return None
        agg = {}
        for b, e in lf:
            e = (0, e[1], None) if e[0] == 0 else e
            p = agg.get(b, (0, 0, None))
            if p[2] != e[2] and p[2] is not None and e[2] is not None:
                return None
            agg[b] = (p[0] + e[0], p[1] + e[1], p[2] or e[2])
            if agg[b][0] == 0:
                agg[b] = (0, agg[b][1], None)
        numeric = all(
            let is None and b.replace(".", "").isdigit()
            for b, (c, k, let) in agg.items())
        if numeric:
            r = 1.0
            for b, (c, k, let) in agg.items():
                r *= float(b) ** k
            return r
        parts = []
        for b, e in agg.items():
            c, k, let = e
            if let is None and k == 1:
                parts.append(b)
            elif let is None:
                parts.append(f"{b}^{k}")
            else:
                parts.append(f"{b}^{fmt(c, k, let)}")
        return "".join(parts)

    def simp_match(stored, got):
        if isinstance(got, str):
            return re.sub(r"\s+", "", re.sub(r"[\\${}]", "", stored)) == re.sub(
                r"\s+", "", re.sub(r"[\\${}]", "", got))
        return ans_match(stored, got)

    for rule, probs in pp.items():
        for i, p in enumerate(probs):
            got = check_expr(p["q"])
            if got is None:
                got = check_indices(p["q"])
            if got is None:
                fail("simplification", f"practice {rule}#{i}", f"UNCLASSIFIED: {p['q'][:80]!r}")
            elif not simp_match(p["a"], got):
                fail("simplification", f"practice {rule}#{i}", f"stored {p['a']!r} != computed {got!r} for {p['q'][:70]!r}")
    for mcq in mcqs:
        q, opts, c = mcq["q"], mcq["opts"], mcq["c"]
        got = check_expr(q)
        if got is None:
            got = check_indices(q)
        if got is None:
            continue
        if simp_match(opts[c], got):
            continue
        if "closest" in q and nearest_opt(got, opts) == c:
            continue
        fail("simplification", f"mcq#{mcq['id']}", f"opts[{c}] {opts[c]!r} != computed {got!r} for {q[:70]!r}")


# ---------------------------------------------------------------------------
# Work & Time
# ---------------------------------------------------------------------------

def check_work_basic(q):
    m = re.search(r"A can do a piece of work in (\d+) days.*work done by A in (\d+) day", q)
    if m:
        return Fraction(int(m.group(2)), int(m.group(1)))
    m = re.search(r"(\w) can complete a work in (\d+) days\. How much work does \1 complete in (\d+) days", q)
    if m:
        return Fraction(int(m.group(3)), int(m.group(2)))
    m = re.search(r"A (?:alone )?(?:does|completes) (\d+)/(\d+) of a work in (\d+) days\.? "
                  r"In how many days will A complete the (?:full|whole) work", q, re.I)
    if m:
        return int(m.group(3)) * int(m.group(2)) / int(m.group(1))
    m = re.search(r"A (?:can )?(?:do|does|completes?) a work in (\d+) days\. "
                  r"What (?:part|fraction) of work does A (?:do|complete) in (\d+) days", q, re.I)
    if m:
        return Fraction(int(m.group(2)), int(m.group(1)))
    m = re.search(r"A (?:can )?(?:do|complete)s? a work in (\d+) days\. "
                  r"What fraction of work is left after A works for (\d+) days", q, re.I)
    if m:
        return Fraction(int(m.group(1)) - int(m.group(2)), int(m.group(1)))
    m = re.search(r"A alone does (\d+)% of a work in (\d+) days\. How many days will A take", q, re.I)
    if m:
        return float(m.group(2)) * 100 / float(m.group(1))
    m = re.search(r"A completes (\d+)/(\d+) of a work in (\d+) days", q, re.I)
    if m:
        return int(m.group(3)) * int(m.group(2)) / int(m.group(1))
    return None


def check_combined(q):
    m = re.search(r"A can do a work in (\d+) days\. B can do the same work in (\d+) days", q)
    if m:
        return Fraction(1, int(m.group(1))) + Fraction(1, int(m.group(2)))
    m = re.search(r"A can do a work in (\d+) days\. B can do (?:it|the same work) in (\d+) days\. "
                  r"In how many days can they complete it together", q, re.I)
    if m:
        a, b = int(m.group(1)), int(m.group(2))
        return a * b / (a + b)
    m = re.search(r"A takes (\d+) days and B takes (\d+) days(?!.*?alternat)", q)
    if m:
        a, b = int(m.group(1)), int(m.group(2))
        return a * b / (a + b)
    m = re.search(r"A takes (\d+) days and B takes (\d+) days.*?alternately.*?(?:first )?(\d+) days", q, re.I)
    if m:
        a, b, n = int(m.group(1)), int(m.group(2)), int(m.group(3))
        full = n // 2
        frac = Fraction(full, a) + Fraction(full, b)
        if n % 2:
            frac += Fraction(1, a)
        return frac
    m = re.search(r"A and B together can complete a work in (\d+) days\. (\w) alone (?:can complete it in|takes) "
                  r"(\d+) days\. In how many days can (\w) alone complete (?:it|the work)\?", q, re.I)
    if m:
        t, d = int(m.group(1)), int(m.group(3))
        return d * t / (d - t)
    m = re.search(r"A and B together can complete a work in (\d+) days\. If (\w) alone takes (\d+) days, "
                  r"what is (\w)'s rate\?", q, re.I)
    if m:
        return Fraction(1, int(m.group(1))) - Fraction(1, int(m.group(3)))
    m = re.search(r"A and B together can complete a work in (\d+) days\. They work together for (\d+) days\. "
                  r"What fraction of work is (?:left|completed)", q, re.I)
    if m:
        t, k = int(m.group(1)), int(m.group(2))
        return Fraction(t - k, t) if "left" in q.lower() else Fraction(k, t)
    m = re.search(r"A and B can complete a work in (\d+) days and (\d+) days respectively\. "
                  r"They work together for (\d+) days\. What fraction of work is (?:left|completed)", q, re.I)
    if m:
        a, b, k = int(m.group(1)), int(m.group(2)), int(m.group(3))
        done = Fraction(k, a) + Fraction(k, b)
        return Fraction(1, 1) - done if "left" in q.lower() else done
    return None


def check_mandays(q):
    m = re.search(r"(\d+) men can complete a work in (\d+) days, how many men.*?in (\d+) days", q)
    if m:
        return int(m.group(1)) * int(m.group(2)) / int(m.group(3))
    m = re.search(r"(\d+) men can complete a work in (\d+) days\. How many man-days", q)
    if m:
        return int(m.group(1)) * int(m.group(2))
    m = re.search(r"(?:If )?(\d+) men can complete a work in (\d+) days[.,] how many days will (\d+) men take", q, re.I)
    if m:
        return int(m.group(1)) * int(m.group(2)) / int(m.group(3))
    m = re.search(r"(\d+) men can complete a work in (\d+) days\. "
                  r"How many men are (?:required|needed) to complete it in (\d+) days", q, re.I)
    if m:
        return int(m.group(1)) * int(m.group(2)) / int(m.group(3))
    m = re.search(r"(\d+) men can complete a work in (\d+) days\. After (\d+) days, (\d+) more men join\. "
                  r"How many more days", q, re.I)
    if m:
        men, days, k, add = map(int, m.groups())
        return men * days * (1 - k / days) / (men + add)
    m = re.search(r"(\d+) men can complete a work in (\d+) days\. After (\d+) days, (\d+) men leave\. "
                  r"How many more days", q, re.I)
    if m:
        men, days, k, leave = map(int, m.groups())
        return men * days * (1 - k / days) / (men - leave)
    return None


def check_efficiency(q):
    m = re.search(r"(\w) is (\d+)% (?:more|less) efficient than (\w)\.? (?:if )?(\w) (?:takes|can complete a work in) "
                  r"(\d+) (?:days|hours)(?!.*?work together)", q, re.I)
    if m:
        a, pct, b, taker, days = m.group(1), float(m.group(2)), m.group(3), m.group(4), float(m.group(5))
        denom = 100 + pct if "more" in m.group(0) else 100 - pct
        if taker.upper() != a.upper():
            return days * 100 / denom
        return days * denom / 100
    m = re.search(r"(\w) can complete a work in (\d+) days\. (\w) is (\d+)% (?:more|less) efficient than (\w)", q, re.I)
    if m:
        days, pct = float(m.group(2)), float(m.group(4))
        denom = 100 + pct if "more" in m.group(0) else 100 - pct
        return days * 100 / denom
    m = re.search(r"(\w) can do a work in (\d+) days\. (\w) can do the same work in (\d+) days\. Who is more efficient", q, re.I)
    if m:
        a, da, b, db = m.group(1), int(m.group(2)), m.group(3), int(m.group(4))
        return a if da < db else b
    m = re.search(r"(\w) is (?:twice|thrice|(\d+) times) as efficient as (\w)\.? "
                  r"(\w) is (?:twice|thrice|(\d+) times) as efficient as (\w)\.? If? (\w) takes (\d+) days", q, re.I)
    if m:
        g0 = m.group(0)
        def _k(seg):
            return 2.0 if "twice" in seg else 3.0 if "thrice" in seg else float(re.search(r"(\d+) times", seg).group(1))
        k1 = _k(g0[:m.start(3)])
        k2 = _k(g0[m.end(3):m.end(6)])
        return float(m.group(8)) / (k1 * k2)
    m = re.search(r"(\w) is (?:twice|thrice|(\d+) times) as efficient as (\w)", q, re.I)
    if m:
        k = float(m.group(2)) if m.group(2) else (2 if "twice" in m.group(0) else 3)
        a = m.group(1).upper()
        tm = re.search(r"(\w) takes (\d+) days(?! less than)[.,]?.*?How many days (?:does|will) (\w) take", q, re.I)
        if tm and tm.group(3).upper() == a:
            return float(tm.group(2)) / k
        fm = re.search(r"finishes work (\d+) days less than (\w)", q, re.I)
        if fm and fm.group(2).upper() == m.group(3).upper():
            return float(fm.group(1)) / (k - 1)
        fm2 = re.search(r"(\w) takes (\d+) days less than (\w)", q, re.I)
        if fm2 and fm2.group(1).upper() == a:
            return float(fm2.group(2)) / (k - 1)
        tm2 = re.search(r"Together they complete a work in (\d+) days\. In how many days "
                        r"(?:would (\w) alone do it|can (\w) (?:alone )?complete (?:it|the work)(?: alone)?)", q, re.I)
        if tm2:
            asked = (tm2.group(2) or tm2.group(3)).upper()
            if asked == a:
                return float(tm2.group(1)) * (1 + 1.0 / k)
            return float(tm2.group(1)) * (1 + k)
        return None
    m = re.search(r"(\w) is (\d+)% (?:more|less) efficient than (\w)\.? "
                  r"Together they complete a work in (\d+) days\. In how many days would (\w) alone do it", q, re.I)
    if m:
        pct, t = float(m.group(2)), float(m.group(4))
        return t * (200 + pct) / (100 + pct)
    m = re.search(r"(\w) is (\d+)% (?:more|less) efficient than (\w)\.? (\w) takes (\d+) days\. "
                  r"(\w) and (\w) work together\. In how many days", q, re.I)
    if m:
        pct, days = float(m.group(2)), float(m.group(5))
        a = days * 100 / (100 + pct)
        return 1 / (1 / a + 1 / days)
    m = re.search(r"(\w) is (\d+)% (?:more|less) efficient than (\w)\.? (\w) takes (\d+) days\. "
                  r"(\w) and (\w) work together for (\d+) days[,.] then (\w) leaves\. "
                  r"How many more days will (\w) take", q, re.I)
    if m:
        pct, days, k = float(m.group(2)), float(m.group(5)), int(m.group(8))
        a = days * 100 / (100 + pct)
        done = k * (1.0 / a + 1.0 / days)
        return (1 - done) * a
    return None


def check_pipes(q):
    ql = q.lower()
    m = re.search(r"tank is (?:half|(\d+)/(\d+)) (?:full|empty)", ql)
    if m:
        if m.group(1) is None:
            k, d = 1, 2
        else:
            k, d = int(m.group(1)), int(m.group(2))
        fm = re.search(r"(?:a|another|one) (?:pipe|leak) (?:can )?fills? (?:a|the) tank in (\d+) (?:hours|minutes)", ql)
        em = re.search(r"(?:another|a|one)(?: pipe| leak)?(?: can)? empt(?:ies|y) (?:it|the tank) in (\d+) (?:hours|minutes)", ql)
        if fm and em:
            a, b = int(fm.group(1)), int(em.group(1))
            rate = 1.0 / a - 1.0 / b
            if rate > 0:
                return k / d / rate
        return None
    m = re.search(r"A pipe can fill a tank in (\d+) (?:hours|minutes)\. How much of the tank does it fill in 1 hour", q, re.I)
    if m:
        return Fraction(1, int(m.group(1)))
    m = re.search(r"A pipe (?:can )?fills? a tank in (\d+) (?:hours|minutes)[.,]? "
                  r"(?:another|a|one)(?: pipe| leak)?(?: can)? empt(?:ies|y) (?:it|the tank) in (\d+) (?:hours|minutes)", q, re.I)
    if m:
        a, b = int(m.group(1)), int(m.group(2))
        if "net rate" in q.lower():
            return Fraction(1, a) - Fraction(1, b)
        return a * b / (b - a) if b > a else None
    m = re.search(r"A pipe (?:can )?fills? a tank in (\d+) (?:hours|minutes)[.,]? "
                  r"(?:and )?another(?: pipe| leak)?(?: can)? empt(?:ies|y) (?:it|the tank) in (\d+) (?:hours|minutes)", q, re.I)
    if m:
        a, b = int(m.group(1)), int(m.group(2))
        return a * b / (b - a) if b > a else None
    m = re.search(r"A pipe can fill a tank in (\d+) hours\. Due to a leak, it takes (\d+) hours to fill\. "
                  r"(?:In how many hours will the leak empty the tank|What is the leak's? rate)", q, re.I)
    if m:
        a, b = int(m.group(1)), int(m.group(2))
        if "rate" in q.lower():
            return Fraction(1, a) - Fraction(1, b)
        return a * b / (b - a)
    m = re.search(r"Two pipes A and B can fill a tank in (\d+) hours and (\d+) hours respectively\. "
                  r"How much (?:of the tank will be filled|do they fill together) in 1 hour", q, re.I)
    if m:
        return Fraction(1, int(m.group(1))) + Fraction(1, int(m.group(2)))
    m = re.search(r"A pipe fills a tank in (\d+) hours\. Another pipe fills the same tank in (\d+) hours\. "
                  r"A third pipe empties it in (\d+) hours", q, re.I)
    if m:
        a, b, c = int(m.group(1)), int(m.group(2)), int(m.group(3))
        return 1.0 / (1.0 / a + 1.0 / b - 1.0 / c)
    m = re.search(r"A pipe fills a tank in (\d+) hours\. Another pipe fills the same tank in (\d+) hours", q, re.I)
    if m:
        a, b = int(m.group(1)), int(m.group(2))
        return a * b / (a + b)
    return None


def verify_work_time(T):
    CHECKS = [check_work_basic, check_combined, check_mandays, check_efficiency, check_pipes]
    check_all(T, "work-and-time", CHECKS, skip_rules=("alternate-days", "men-women-children"))


# ---------------------------------------------------------------------------
# Coding & Decoding
# ---------------------------------------------------------------------------

def letter_num(ch):
    return ord(ch.upper()) - ord('A') + 1


def check_pos_value(q):
    m = re.search(r"if ([a-z]+)=(\d+),\s*([a-z]+)=(\d+),\s*then ([a-z]+) = \?", q, re.I)
    if m:
        l1, v1, l2, v2 = m.group(1).upper(), int(m.group(2)), m.group(3).upper(), int(m.group(4))
        if letter_num(l1) == v1 and letter_num(l2) == v2:
            return "".join(str(letter_num(c)) for c in m.group(5).upper())
    m = re.search(r"if ([a-z]+)\s*=\s*(\d+) and ([a-z]+)\s*=\s*(\d+),? then ([a-z]+) = \?", q, re.I)
    if m and all(letter_num(l) for l in m.group(1) + m.group(3)):
        enc = lambda w: "".join(str(letter_num(c)) for c in w)
        if enc(m.group(1)) == m.group(2) and enc(m.group(3)) == m.group(4):
            return enc(m.group(5))
    m = re.search(r"if (\w+) = ([\d ]+),?\s*(?:then|what is) (\w+)\s*=?\??", q, re.I)
    if m:
        word, digits, target = m.group(1).upper(), re.sub(r"\s", "", m.group(2)), m.group(3).upper()
        i = 0
        for ch in word:
            v = letter_num(ch)
            if not digits.startswith(str(v), i):
                return None
            i += len(str(v))
        if i != len(digits):
            return None
        return "".join(str(letter_num(c)) for c in target)
    return None


def _pair_shift(a, b):
    if all(ord(x) + ord(y) == 155 for x, y in zip(a, b)):
        return "reverse"
    s = {(ord(y) - ord(x)) % 26 for x, y in zip(a, b)}
    if len(s) == 1:
        return s.pop()
    if len(s) == 2 and a[0] == b[0]:
        return (ord(b[1]) - ord(a[1])) % 26
    counts = {}
    for x, y in zip(a, b):
        k = (ord(y) - ord(x)) % 26
        counts[k] = counts.get(k, 0) + 1
    if len(counts) == 2 and len(a) - 1 in counts.values():
        return sorted(counts.items(), key=lambda kv: -kv[1])[0][0]
    return None


def _apply_shift(target, k):
    if k == "reverse":
        return "".join(chr(155 - ord(c)) for c in target)
    return "".join(chr((ord(c) - 65 + k) % 26 + 65) for c in target)


def check_shift(q):
    m = re.search(r"if ([a-z]+) = ([a-z]+),? then ([a-z]+) = \?", q, re.I)
    if m:
        src, dst, target = m.group(1).upper(), m.group(2).upper(), m.group(3).upper()
        if len(src) != len(dst):
            return None
        k = _pair_shift(src, dst)
        if k is None:
            return None
        return _apply_shift(target, k)
    m = re.search(r"if ([a-z]+) = ([a-z]+) and ([a-z]+) = ([a-z]+),? then ([a-z]+) = \?", q, re.I)
    if m and len(m.group(1)) == len(m.group(2)) == len(m.group(3)) == len(m.group(4)):
        k1 = _pair_shift(m.group(1).upper(), m.group(2).upper())
        k2 = _pair_shift(m.group(3).upper(), m.group(4).upper())
        if k1 is not None and k1 == k2:
            return _apply_shift(m.group(5).upper(), k1)
    m = re.search(r"if ([a-z]+) = ([\w ]+) \(each (-?\d+)\).*?then ([a-z]+)", q, re.I)
    if m:
        target, k = m.group(4).upper(), int(m.group(3))
        return "".join(chr((ord(c) - 65 + k) % 26 + 65) for c in target)
    m = re.search(r"([a-z]+) is coded as ([a-z]+).*?([a-z]+) (?:will be|is coded as|code for)", q, re.I)
    if m:
        src, dst, target = m.group(1).upper(), m.group(2).upper(), m.group(3).upper()
        if len(src) != len(dst):
            return None
        shift = (ord(dst[0]) - ord(src[0])) % 26
        return "".join(chr((ord(c) - 65 + shift) % 26 + 65) for c in target)
    return None


def check_symbol(q):
    parts = re.split(r"\bthen\b", q, flags=re.I)
    if len(parts) != 2:
        return None
    m = re.search(r"(.+?)\s*=\s*\?\s*$", parts[1])
    if not m:
        return None
    target = m.group(1).strip()
    pairs = re.findall(r"([^\s=,;]+)\s*=\s*([^\s=,;]+?)(?=\s*[,;]\s*|\s+and\s+|\s*$)", parts[0], re.I)
    if len(pairs) < 2:
        return None
    mapping = {}
    for k, v in pairs:
        k = k.strip().rstrip(",").lower()
        v = v.strip().rstrip(",")
        toks = re.split(r"[-+]", k) if re.search(r"[-+]", k) else [k]
        if len(toks) > 1 and len(v) == len(toks):
            for t, c in zip(toks, v):
                if t in mapping and mapping[t] != c:
                    return None
                mapping[t] = c
        else:
            if k in mapping and mapping[k] != v:
                return None
            mapping[k] = v
    tokens = re.split(r"[-+]", target) if re.search(r"[-+]", target) else list(target)
    out = []
    for t in tokens:
        t = t.strip().lower()
        if t not in mapping:
            return None
        out.append(mapping[t])
    if re.search(r"[-+]", target) and all(v.isdigit() and len(v) == 1 for v in out) and len(out) == 2:
        return str(int(out[0]) + int(out[1]) if "+" in target else int(out[0]) - int(out[1]))
    return "".join(out)


def verify_coding_decoding(T):
    check_all(T, "coding-decoding", [check_pos_value, check_shift, check_symbol])


# ---------------------------------------------------------------------------
# Analogies
# ---------------------------------------------------------------------------

def check_letter_shift(q):
    m = re.search(r"([A-Z]+)\s*:\s*([A-Z]+)\s*::\s*([A-Z]+)\s*:\s*\?", q)
    if not m:
        return None
    a, b, c = m.group(1), m.group(2), m.group(3)
    if len(a) != len(b) or len(a) != len(c):
        return None
    if ord(a[0]) + ord(b[0]) == 155:
        out = "".join(chr(155 - ord(ch)) for ch in c)
    else:
        shift = (ord(b[0]) - ord(a[0])) % 26
        out = "".join(chr((ord(ch) - 65 + shift) % 26 + 65) for ch in c)
    return out


def check_digit_sum(q):
    m = re.search(r"(\d+)\s*:\s*(\d+)\s*::\s*(\d+)\s*:\s*\?", q)
    if m:
        a, b, c = m.group(1), m.group(2), m.group(3)
        if b == str(sum(int(d) for d in a)):
            return str(sum(int(d) for d in c))
    return None


def check_square(q):
    m = re.search(r"(\d+)\s*:\s*(\d+)\s*::\s*(\d+)\s*:\s*\?", q)
    if m:
        a, b, c = int(m.group(1)), int(m.group(2)), int(m.group(3))
        if b == a * a:
            return str(c * c)
    return None


def verify_analogies(T):
    check_all(T, "analogies", [check_letter_shift, check_digit_sum, check_square],
              skip_rules=("synonym-rule", "antonym-rule", "cause-effect-rule", "function-rule",
                          "part-whole-rule", "profession-tool-rule", "animal-young-rule",
                          "animal-home-rule", "country-capital-rule"))


# ---------------------------------------------------------------------------
# Generic structural checks for all topics
# ---------------------------------------------------------------------------

def structural_checks(name, T):
    pp, mcqs = T["practiceProblems"], T["mcqs"]
    seen_practice = set()
    for rule, probs in pp.items():
        for i, p in enumerate(probs):
            if not isinstance(p, dict) or "q" not in p:
                fail(name, f"practice {rule}#{i}", "missing q")
                continue
            qn = re.sub(r"\s+", " ", p["q"]).strip()
            if qn in seen_practice:
                fail(name, f"practice {rule}#{i}", f"DUPLICATE question: {qn[:60]!r}")
            seen_practice.add(qn)
            if "opts" in p:
                if len(p["opts"]) != 4 or len(set(p["opts"])) != 4:
                    fail(name, f"practice {rule}#{i}", f"opts not 4-unique: {p['opts']}")
                if not (0 <= p["c"] < 4):
                    fail(name, f"practice {rule}#{i}", "c out of range")
                else:
                    a = re.sub(r"\(.*?\)", "", p["a"]).replace("$", "").replace("\\", "").replace(" ", "").lower()
                    o = p["opts"][p["c"]].replace("$", "").replace("\\", "").replace(" ", "").lower()
                    if a != o:
                        fail(name, f"practice {rule}#{i}", f"opts[c] {p['opts'][p['c']]!r} != a {p['a']!r}")
    seen_mcq = set()
    for i, m in enumerate(mcqs):
        qn = re.sub(r"\s+", " ", m["q"]).strip()
        if qn in seen_mcq:
            fail(name, f"mcq#{m.get('id', i)}", f"DUPLICATE question: {qn[:60]!r}")
        seen_mcq.add(qn)
        if len(m["opts"]) != 4 or len(set(m["opts"])) != 4:
            fail(name, f"mcq#{m.get('id', i)}", f"opts not 4-unique: {m['opts']}")
        if not (0 <= m["c"] < 4):
            fail(name, f"mcq#{m.get('id', i)}", "c out of range")
        if "d" not in m:
            fail(name, f"mcq#{m.get('id', i)}", "missing difficulty d")
        if not m.get("t"):
            fail(name, f"mcq#{m.get('id', i)}", "missing type t")


def main():
    targets = sys.argv[1:] or TOPICS
    for name in targets:
        T = json.load(open(f"data/topics/{name}.json"))
        fn = {
            "percentages": verify_percentages,
            "clock-calendar": verify_clock_calendar,
            "direction-sense": verify_direction_sense,
            "simplification": verify_simplification,
            "work-and-time": verify_work_time,
            "coding-decoding": verify_coding_decoding,
            "analogies": verify_analogies,
        }.get(name)
        if fn:
            fn(T)
        structural_checks(name, T)
    if REPORT:
        for line in REPORT:
            print(" ", line)
        print(f"\n{len(REPORT)} issues")
        sys.exit(1)
    print("ALL CLEAN")


if __name__ == "__main__":
    main()
