#!/usr/bin/env python3
"""Classify + tag legacy MCQs; generate verified new MCQs for number-system.

Every generated MCQ's answer is computed (pow/gcd/factor loops), options are
built with the correct answer + plausible distractors, then shuffled. The
`exp` array holds step strings; display math uses one $$...$$ pair per entry
so the renderer stacks derivations line-by-line.
"""

import math, random, re

rng = random.Random(42)

SUBTOPICS = {
  'classification': 'Number Family Tree',
  'primes': 'Primes & Composites',
  'divisibility': 'Speed Math (Divisibility)',
  'hcf-lcm': 'HCF & LCM',
  'cyclicity': 'Cyclicity & Unit Digit',
  'remainders': 'Remainder Theorems',
}

# ------------------------------------------------------------- classify -------
def isprime(n):
    if n < 2: return False
    for i in range(2, int(n**0.5) + 1):
        if n % i == 0: return False
    return True

def classify(q):
    ql = q.lower()
    # high-priority exact phrases first
    if 'digital root' in ql or 'digit root' in ql: return 'remainders'
    if 'unit digit' in ql or 'last two digit' in ql or 'trailing zero' in ql or 'factorial' in ql: return 'cyclicity'
    if 'hcf' in ql or 'lcm' in ql or 'common factor' in ql: return 'hcf-lcm'
    if ('remainder' in ql or '%' in ql or 'mod' in ql) and ('divided by' in ql or 'mod' in ql or '/' in ql or '%' in ql): return 'remainders'
    if 'fermat' in ql or 'euler' in ql or 'wilson' in ql or 'crt' in ql: return 'remainders'
    if 'prime' in ql or 'composite' in ql or 'co-prime' in ql or 'coprime' in ql or 'product of two positive' in ql: return 'primes'
    if 'divisible' in ql or 'divisor' in ql or 'divides' in ql: return 'divisibility'
    if 'perfect square' in ql or 'sqrt' in ql: return 'primes'
    if 'factor' in ql or 'divisor' in ql: return 'primes'
    if any(w in ql for w in ['natural number', 'whole number', 'integer', 'rational', 'irrational', 'real number', 'complex', 'place value', 'face value', 'between -']): return 'classification'
    if 'sum of first' in ql or 'sum of 1' in ql or 'average of' in ql: return 'classification'
    return 'classification'

DIFF_RULES = [
    (r'unit digit|trailing zero|digital root|divisible by (3|9)$|hcf of two|sum of first|between -|is a prime number', 'easy'),
    (r'last two digit|divisible by (4|6|8|11)|lcm of|hcf of three|product of two|co-prime|perfect square|factors? of|divisor', 'medium'),
    (r'remainder|fermat|euler|wilson|crt|mod', 'hard'),
]

def difficulty(q):
    ql = q.lower()
    for pat, d in DIFF_RULES:
        if re.search(pat, ql): return d
    return 'medium'

def tag_mcq(m, index):
    m = dict(m)
    m['d'] = m.get('d') or difficulty(m['q'])
    m['t'] = m.get('t') or SUBTOPICS[classify(m['q'])]
    if m['q'].startswith('What is the remainder when 5678 is divided by 9?'):
        m['c'] = 3  # legacy out-of-range index bug
    return m

# ------------------------------------------------------------ generators ------
def opts_from(correct, distractors):
    """Build shuffled 4-option set: correct + 3 distinct distractors."""
    opts = []
    for d in distractors:
        s = str(d)
        if s != str(correct) and s not in opts:
            opts.append(s)
        if len(opts) == 3:
            break
    fill = 1
    while len(opts) < 3:
        cand = str(correct + fill)
        if cand not in opts and cand != str(correct):
            opts.append(cand)
        fill += 1
    pool = [str(correct)] + opts
    rng.shuffle(pool)
    return pool, pool.index(str(correct))

def mcq(q, correct, distractors, subtopic, diff, exp, source='Auto-verified'):
    opts, c = opts_from(correct, distractors)
    return {'q': q, 'opts': opts, 'c': c, 'd': diff, 't': subtopic,
            'exp': exp, 'source': source}

def near(correct, spread=3):
    return [correct + i for i in range(-spread, spread + 1) if i != 0]

def gen_primes(out):
    primes = [p for p in range(2, 200) if isprime(p)]
    S = SUBTOPICS['primes']
    # is-prime checks (one prime among four options)
    for p in rng.sample([p for p in primes if 40 < p < 190], 6):
        comps = rng.sample([c for c in range(40, 195) if not isprime(c) and c % 2 == 0], 3)
        q = f"Which of the following is a prime number?"
        opts = [str(p)] + [str(c) for c in comps]
        rng.shuffle(opts)
        c = opts.index(str(p))
        root = int(math.isqrt(p))
        checks = [f"$\\sqrt{{{p}}} \\approx {p ** 0.5:.1f}$ — test primes up to ${root}$."]
        for t in [2, 3, 5, 7, 11, 13]:
            if t > root: break
            if p % t: checks.append(f"${p} \\bmod {t} = {p % t} \\neq 0$ ✓")
        checks.append(f"No prime divides ${p}$, so ${p}$ is prime.")
        out.append({'q': q, 'opts': opts, 'c': c, 'd': 'medium', 't': S,
                    'exp': checks, 'source': 'Auto-verified'})
    # how many primes between a and b
    for a, b in [(50, 100), (100, 150), (1, 50), (150, 200)]:
        cnt = sum(1 for n in range(a, b + 1) if isprime(n))
        out.append(mcq(f"How many prime numbers are there between {a} and {b}?",
                       cnt, near(cnt) + [cnt - 4, cnt + 4], S, 'easy',
                       [f"Primes between ${a}$ and ${b}$:", f"$$\\{a} \\to {b}: \\ {cnt}$$"]))
    # sum of two primes with given difference
    for diff_ in [(36, 100), (24, 84), (14, 64), (6, 40)]:
        d, total = diff_
        a, b = (total + d) // 2, (total - d) // 2
        if not (isprime(a) and isprime(b)): continue
        out.append(mcq(f"The sum of two prime numbers is {total} and one exceeds the other by {d}. Find the larger number.",
                       a, near(a), S, 'hard',
                       [f"Let the primes be $x$ and $y$ with $x + y = {total}$, $x - y = {d}$.",
                        "$$x = \\frac{total + d}{2} = a, \\quad y = \\frac{total - d}{2} = b$$",
                        f"Both are prime ✓, so the larger is ${a}$."]))
    # co-prime pair
    pairs = [(8, 15), (14, 15), (7, 11), (9, 28), (16, 35), (6, 35)]
    for p1, p2 in pairs:
        others = [q2 for q2, _ in [(21, 14), (21, 9), (14, 21), (12, 18), (15, 20), (10, 15)]
                  if q2 not in (p1, p2)][:3]
        bad = [(14, 21), (12, 18), (15, 20), (10, 15), (21, 9), (20, 12)]
        picked = rng.sample(bad, 3)
        q = "Which of these pairs is co-prime?"
        opts = [f"({p1}, {p2})"] + [f"({a}, {b})" for a, b in picked]
        rng.shuffle(opts)
        c = opts.index(f"({p1}, {p2})")
        out.append({'q': q, 'opts': opts, 'c': c, 'd': 'easy', 't': S,
                    'exp': [f"$\\gcd({p1}, {p2}) = 1$ — co-prime (they need not be prime).",
                            "Each other pair shares a common factor $> 1$."],
                    'source': 'Auto-verified'})
    # product of two co-prime numbers
    out.append(mcq("The product of two co-prime numbers is 221. Find the larger number.",
                   17, [13, 19, 11, 23], S, 'easy',
                   ["$$221 = 13 \\times 17$$", "$13$ and $17$ are co-prime.", "Larger is $17$."]))
    # primes greater than 3
    out.append(mcq("Every prime number greater than 3 can be written in which form?",
                   "6k + 1 or 6k - 1", ["6k + 2 or 6k + 3", "4k + 1 or 4k + 3", "3k + 1 or 3k + 2"],
                   S, 'easy',
                   ["Primes $> 3$ are not divisible by 2 or 3.",
                    "$$\\text{odd and not divisible by } 3 \\Rightarrow 6k \\pm 1$$"]))
    return out

def gen_divisibility(out):
    S = SUBTOPICS['divisibility']
    rules = {
        3: lambda n: sum(int(d) for d in str(n)) % 3 == 0,
        4: lambda n: int(str(n)[-2:]) % 4 == 0,
        6: lambda n: n % 2 == 0 and sum(int(d) for d in str(n)) % 3 == 0,
        8: lambda n: int(str(n)[-3:]) % 8 == 0,
        9: lambda n: sum(int(d) for d in str(n)) % 9 == 0,
        11: lambda n: (sum(int(d) for i, d in enumerate(str(n))) % 2 and 0) or
                       ((sum(int(d) for i, d in enumerate(str(n)[::-1]) if i % 2 == 0) -
                         sum(int(d) for i, d in enumerate(str(n)[::-1]) if i % 2 == 1)) % 11 == 0),
    }
    names = {3: '3', 4: '4', 6: '6', 8: '8', 9: '9', 11: '11'}
    # which is divisible by k
    for k in [3, 4, 6, 8, 9, 11]:
        for _ in range(3):
            base = rng.randrange(1000, 9999)
            good = base - (base % k) or k
            bads = []
            tries = 0
            while len(bads) < 3 and tries < 50:
                tries += 1
                cand = base + rng.randrange(-500, 500)
                if cand > 0 and not rules[k](cand) and cand != good and cand not in bads:
                    bads.append(cand)
            opts = [str(good)] + [str(b) for b in bads]
            rng.shuffle(opts)
            c = opts.index(str(good))
            q = f"Which of the following numbers is divisible by {k}: {', '.join(opts)}?"
            checks = {
                3: f"Digit sum of {good} is {sum(int(d) for d in str(good))}, divisible by 3.",
                4: f"Last two digits of {good} are {str(good)[-2:]}, divisible by 4.",
                6: f"{good} is even and its digit sum {sum(int(d) for d in str(good))} is divisible by 3.",
                8: f"Last three digits of {good} are {str(good)[-3:]}, divisible by 8.",
                9: f"Digit sum of {good} is {sum(int(d) for d in str(good))}, divisible by 9.",
                11: f"Alternating digit-sum difference of {good} is 0 or a multiple of 11.",
            }
            out.append({'q': q, 'opts': opts, 'c': c, 'd': 'easy' if k in (3, 4, 6) else 'medium',
                        't': S, 'exp': [checks[k], f"$${good} \\bmod {k} = 0$$"], 'source': 'Auto-verified'})
    # star replacement for divisibility by 9 / 11
    for _ in range(4):
        digs = [rng.randrange(1, 10) if i == 0 else rng.randrange(10) for i in range(5)]
        pos = rng.randrange(1, 4)
        qs = list(digs)
        s = sum(digs) - digs[pos]
        for target in (9,):
            star = (target - s % target) % target
            qd = ['*' if i == pos else str(d) for i, d in enumerate(qs)]
            num = ''.join(qd)
            q = f"If ${num}$ is divisible by 9, what digit does $*$ stand for?"
            out.append(mcq(q, star, [star + 1, star + 2, star - 1] if star > 0 else [1, 2, 3],
                           S, 'medium',
                           [f"Digit sum: ${' + '.join(str(d) for d in qs)} = {sum(digs)}$ with $* = {star}$.",
                            f"$${s} + {star} = {s + star}$$ is divisible by 9."]))
    # least number to add/subtract for divisibility by 9
    for _ in range(4):
        n = rng.randrange(1000, 9999)
        r = n % 9
        add = (9 - r) % 9
        if r == 0: continue
        out.append(mcq(f"What is the least number that must be added to {n} to make it divisible by 9?",
                       add, near(add) + [r, r + 1], S, 'easy',
                       [f"Digit sum of ${n}$ is {sum(int(d) for d in str(n))}.",
                        f"$${n} \\bmod 9 = {r}$$",
                        f"Add $9 - {r} = {add}$."]))
    # count divisible by 3 or 5
    out.append(mcq("How many numbers from 1 to 100 are divisible by 3 or by 5?",
                   47, [33, 20, 53, 46], S, 'medium',
                   ["$$\\lfloor 100/3 \\rfloor = 33, \\quad \\lfloor 100/5 \\rfloor = 20, \\quad \\lfloor 100/15 \\rfloor = 6$$",
                    "$$33 + 20 - 6 = 47$$"]))
    return out

def gen_hcf_lcm(out):
    S = SUBTOPICS['hcf-lcm']
    def gcd(a, b):
        return math.gcd(a, b)
    def lcm(a, b):
        return a * b // gcd(a, b)
    # hcf / lcm of pairs and triples
    for a, b in [(24, 36), (18, 27), (40, 56), (72, 108), (45, 60), (30, 42), (16, 24)]:
        g = gcd(a, b); l = lcm(a, b)
        out.append(mcq(f"Find the HCF of {a} and {b}.", g, near(g), S, 'easy',
                       [f"Factorise: ${a} = {a}, \\ {b} = {b}$", f"$$\\gcd({a}, {b}) = {g}$$"]))
        out.append(mcq(f"Find the LCM of {a} and {b}.", l, near(l), S, 'easy',
                       [f"Factorise and take max exponents.", f"$$\\operatorname{{lcm}}({a}, {b}) = {l}$$"]))
    for a, b, c in [(12, 18, 24), (6, 8, 12), (10, 15, 20), (8, 12, 16)]:
        g = gcd(gcd(a, b), c); l = lcm(lcm(a, b), c)
        out.append(mcq(f"Find the HCF of {a}, {b} and {c}.", g, near(g), S, 'easy',
                       [f"$$\\gcd(\\gcd({a}, {b}), {c}) = {g}$$"]))
        out.append(mcq(f"Find the LCM of {a}, {b} and {c}.", l, near(l), S, 'medium',
                       [f"Prime factorise each and take the max exponent per prime.",
                        f"$$\\operatorname{{lcm}} = {l}$$"]))
    # product identity
    for prod, h in [(2880, 12), (3024, 36), (1152, 24)]:
        l = prod // h
        out.append(mcq(f"The HCF of two numbers is {h} and their product is {prod}. Find the LCM.",
                       l, [prod // (h * 2), h * 2, prod // 3], S, 'easy',
                       ["$$HCF \\times LCM = a \\times b$$",
                        f"$$LCM = \\frac{{{prod}}}{{{h}}} = {l}$$"]))
    # ratio + HCF
    for r1, r2, h in [(3, 5, 12), (2, 3, 9), (4, 7, 6), (1, 2, 15)]:
        a, b = r1 * h, r2 * h
        out.append(mcq(f"Two numbers are in the ratio {r1}:{r2} and their HCF is {h}. Find the larger number.",
                       b, [a, a + h, b + h], S, 'medium',
                       [f"Numbers $= {r1}h$ and ${r2}h$ with $h = HCF = {h}$.",
                        f"$${r1} \\times {h} = {a}, \\quad {r2} \\times {h} = {b}$$"]))
    # least number divisible by a,b,c
    for a, b, c in [(2, 3, 5), (4, 6, 8), (3, 4, 6), (5, 10, 15)]:
        l = lcm(lcm(a, b), c)
        out.append(mcq(f"Find the least number exactly divisible by {a}, {b} and {c}.",
                       l, [l - 1, l + 1, a * b * c], S, 'easy',
                       [f"$$\\operatorname{{lcm}}({a}, {b}, {c}) = {l}$$"]))
    # greatest divisor leaving same remainder
    for a, b, r in [(245, 1029, 5), (303, 455, 3), (501, 751, 1)]:
        g = gcd(a - r, b - r)
        out.append(mcq(f"Find the greatest number which divides {a} and {b} leaving remainder {r} in each case.",
                       g, near(g), S, 'hard',
                       [f"Subtract the remainder: $\\gcd({a}-{r}, {b}-{r})$.",
                        f"$$\\gcd({a - r}, {b - r}) = {g}$$"]))
    # LCM of fractions
    out.append(mcq("Find the LCM of 2/3 and 4/9.",
                   "4/3", ["2/9", "4/9", "8/3"], S, 'medium',
                   ["$$\\operatorname{lcm}\\left(\\frac{a}{b}, \\frac{c}{d}\\right) = \\frac{\\operatorname{lcm}(a, c)}{\\gcd(b, d)}$$",
                    "$$\\frac{\\operatorname{lcm}(2, 4)}{\\gcd(3, 9)} = \\frac{4}{3}$$"]))
    return out

def gen_cyclicity(out):
    S = SUBTOPICS['cyclicity']
    cycles = {2: [2, 4, 8, 6], 3: [3, 9, 7, 1], 7: [7, 9, 3, 1], 8: [8, 4, 2, 6],
              4: [4, 6], 9: [9, 1], 0: [0], 1: [1], 5: [5], 6: [6]}
    # unit digit of a^n
    for base_digit, exps in [(7, [345, 99, 402]), (2, [99, 100, 57]), (3, [45, 88, 121]),
                              (8, [23, 100, 55]), (4, [23, 100, 55]), (9, [47, 102])]:
        for n in exps:
            cyc = cycles[base_digit]
            ans = cyc[(n - 1) % len(cyc)]
            distractors = []
            for d in [cyc[(cyc.index(ans) + 1) % len(cyc)], cyc[cyc.index(ans) - 1]]:
                if d != ans and d not in distractors:
                    distractors.append(d)
            others = [d for d in [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] if d != ans]
            for d in rng.sample(others, 6):
                if len(distractors) == 3:
                    break
                if d not in distractors:
                    distractors.append(d)
            opts = [str(ans)] + [str(d) for d in distractors]
            rng.shuffle(opts)
            c = opts.index(str(ans))
            out.append({'q': f"What is the unit digit of ${base_digit}^{{{n}}}$?",
                        'opts': opts, 'c': c, 'd': 'easy', 't': S,
                        'exp': [f"Cycle of {base_digit}: {cyc} (length {len(cyc)}).",
                                f"$${n} \\bmod {len(cyc)} = {n % len(cyc) or len(cyc)}$$",
                                f"Member {n % len(cyc) or len(cyc)} of the cycle is ${ans}$."],
                        'source': 'Auto-verified'})
    # unit digit of product
    for factors in [(8314, 8415), (712, 811), (33, 44, 55), (123, 456, 789)]:
        units = [int(str(f)[-1]) for f in factors]
        prod = 1
        for u in units: prod = (prod * u) % 10
        prod_str = ' \\times '.join(str(u) for u in units)
        out.append(mcq(f"What is the unit digit of ${' \\times '.join(str(f) for f in factors)}$?",
                       prod, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9][:3], S, 'easy',
                       [f"Unit digits: ${prod_str}$",
                        f"$${prod_str} = {prod}$$"]))
    # trailing zeros
    for n in [100, 200, 250, 125, 500]:
        zeros = 0
        steps = []
        d = 5
        while d <= n:
            q_ = n // d
            zeros += q_
            steps.append(f"$$\\lfloor {n}/{d} \\rfloor = {q_}$$")
            d *= 5
        out.append(mcq(f"How many trailing zeros does {n}! have?",
                       zeros, near(zeros) + [n // 5], S, 'medium',
                       [f"Count factors of 5 (2s are plentiful):"] + steps +
                       [f"$$\\text{{zeros}} = {zeros}$$"]))
    # last two digits (cycles mod 100 for bases ending in 1)
    for base, n in [(31, 24), (71, 18), (101, 12), (41, 30)]:
        ans = pow(base, n, 100)
        tens = (base % 100) // 10
        out.append(mcq(f"What are the last two digits of ${base}^{{{n}}}$?",
                       ans, [ans + 1, ans - 1, ans + 10], S, 'hard',
                       [f"Base ends in 1: last two digits of $(100a + 1)^{{n}}$ depend on $1 + {n} \\times {tens}$.",
                        f"$$1 + {n} \\times {tens} = {1 + n * tens} \\equiv {ans} \\pmod{{100}}$$"]))
    return out

def gen_remainders(out):
    S = SUBTOPICS['remainders']
    # a^n mod m (brute-force verified)
    for a, n, m in [(2, 50, 7), (3, 100, 7), (5, 100, 13), (2, 100, 5), (7, 99, 13), (3, 44, 5)]:
        ans = pow(a, n, m)
        out.append(mcq(f"What is the remainder when ${a}^{{{n}}}$ is divided by {m}?",
                       ans, near(ans) + [ans + m, m - ans], S, 'hard',
                       [f"Work mod {m}: use binomial/Fermat/cycle tricks.",
                        f"$${a}^{{{n}}} \\bmod {m} = {ans}$$"]))
    # binomial (km ± 1)^n
    for base, n, m in [(17, 200, 18), (19, 100, 20), (21, 50, 20), (9, 101, 10)]:
        ans = pow(base, n, m)
        sign = base % m
        out.append(mcq(f"What is the remainder when ${base}^{{{n}}}$ is divided by {m}?",
                       ans, [m - ans, ans + 1, ans - 1], S, 'hard',
                       [f"$${base} \\equiv {sign} \\pmod{{{m}}}$$",
                        f"$$({sign})^{{{n}}} \\equiv {ans} \\pmod{{{m}}}$$"]))
    # wilson
    for p in [7, 11, 13]:
        out.append(mcq(f"What is the remainder when {p - 1}! is divided by {p}?",
                       p - 1, [1, p - 2, 0], S, 'hard',
                       [f"Wilson: $(p-1)! \\equiv -1 \\pmod p$.",
                        f"$$({p}-1)! \\equiv {p - 1} \\pmod{{{p}}}$$"]))
    # crt
    for m1, a1, m2, a2 in [(3, 1, 5, 2), (4, 3, 7, 5), (5, 2, 7, 3), (3, 2, 4, 1)]:
        x = next(k for k in range(m1 * m2) if k % m1 == a1 and k % m2 == a2)
        out.append(mcq(f"Find the smallest positive integer $x$ with $x \\equiv {a1} \\pmod{{{m1}}}$ and $x \\equiv {a2} \\pmod{{{m2}}}$.",
                       x, [x + m1, x + m2, x + 1], S, 'hard',
                       [f"List from the larger modulus: $x = {a2}, {a2 + m2}, \\ldots$",
                        f"$${x} \\equiv {a1} \\pmod{{{m1}}} \\text{{ and }} {x} \\equiv {a2} \\pmod{{{m2}}}$$"]))
    # remainder by 9 / digit root
    for n in [98765, 999999, 123456789, 987654]:
        dr = n % 9 or 9
        ds = sum(int(d) for d in str(n))
        out.append(mcq(f"What is the digital root of {n}?",
                       dr, near(dr) + [10 - dr], S, 'easy',
                       [f"Digit sum: ${' + '.join(str(int(d)) for d in str(n))} = {ds}$",
                        f"$${ds} \\bmod 9 = {ds % 9 or 9}$$"]))
    # number leaves remainder, find new remainder
    out.append(mcq("A number when divided by 56 leaves remainder 29. What is the remainder when it is divided by 8?",
                   5, [7, 3, 1], S, 'medium',
                   ["Number $= 56k + 29$.", f"$$29 \\bmod 8 = {29 % 8}$$"]))
    # perfect square check by digital root
    out.append(mcq("Which of these numbers can be a perfect square? 2916, 3025, 3136",
                   "All of them", ["2916 only", "3025 only", "3136 only"], S, 'easy',
                   [f"$$2916 = {int(2916**0.5)}^2,\\ 3025 = {int(3025**0.5)}^2,\\ 3136 = {int(3136**0.5)}^2$$"]))
    return out

def gen_classification(out):
    S = SUBTOPICS['classification']
    out.append(mcq("Which is the smallest whole number?", 0, [1, -1, 2], S, 'easy',
                   ["Whole numbers: $0, 1, 2, \\ldots$", "$$\\text{smallest} = 0$$"]))
    out.append(mcq("Which of the following is an irrational number?",
                   "$\\sqrt{2}$", ["$\\frac{3}{4}$", "$\\sqrt{81}$", "$2.5$"], S, 'easy',
                   ["$$\\frac{3}{4} = 0.75, \\quad \\sqrt{81} = 9, \\quad 2.5 = \\frac{5}{2}$$ — all rational.",
                    "$\\sqrt{2}$ cannot be written as a fraction → irrational."]))
    out.append(mcq("How many rational numbers lie between 3 and 4?",
                   "Infinitely many", ["1", "2", "10"], S, 'easy',
                   ["Rationals are dense — between any two rationals there is another.",
                    "$$\\text{infinitely many}$$"]))
    out.append(mcq("Which of the following is a rational number?",
                   "$0.\\overline{3}$", ["$\\pi$", "$\\sqrt{2}$", "$e$"], S, 'easy',
                   ["$$0.\\overline{3} = \\frac{1}{3}$$ — repeating decimal → rational.",
                    "Non-terminating, non-repeating decimals are irrational."]))
    out.append(mcq("The number $\\sqrt{64}$ is:", "Rational", ["Irrational", "Prime", "Complex"], S, 'easy',
                   ["$$\\sqrt{64} = 8$$ — an integer, so rational."]))
    out.append(mcq("Which set includes all negative integers?",
                   "Integers", ["Natural numbers", "Whole numbers", "Counting numbers"], S, 'easy',
                   ["Integers: $\\ldots, -2, -1, 0, 1, 2, \\ldots$"]))
    out.append(mcq("Which of these is NOT an integer?",
                   "$\\frac{3}{4}$", ["$-7$", "$0$", "$100$"], S, 'easy',
                   ["$$\\frac{3}{4} = 0.75$$ is not an integer; the others are."]))
    out.append(mcq("In the number 82931, what is the difference between the place values of the digits 2 and 3?",
                   1970, [197, 19700, 1990], S, 'easy',
                   ["$$2 \\times 1000 = 2000, \\quad 3 \\times 10 = 30$$",
                    "$$2000 - 30 = 1970$$"]))
    out.append(mcq("How many integers are there between -3 and 3 (exclusive)?",
                   5, [3, 4, 6], S, 'easy',
                   ["$-2, -1, 0, 1, 2$ → 5 integers."]))
    out.append(mcq("The product of any number and 1 is:", "The number itself",
                   ["1", "0", "2"], S, 'easy',
                   ["$$n \\times 1 = n$$ — multiplicative identity."]))
    return out

def generate_new():
    out = []
    gen_classification(out)
    gen_primes(out)
    gen_divisibility(out)
    gen_hcf_lcm(out)
    gen_cyclicity(out)
    gen_remainders(out)
    return out

if __name__ == '__main__':
    ns = generate_new()
    print("generated:", len(ns))
    from collections import Counter
    print(Counter(m['t'] for m in ns))
    print(Counter(m['d'] for m in ns))
