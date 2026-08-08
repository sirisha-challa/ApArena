#!/usr/bin/env python3
"""Rebuild number-system.json: deep reading sections (stacked math), enriched
formulas, practice converted to MCQs, MCQ pool deduplicated + expanded.

Data stages: READINGS, FORMULAS, PRACTICE_OPTS, MCQ_TAGS, NEW_MCQS.
Run from repo root:  python3 scripts/rebuild_number_system.py
"""

import json, re, copy

SRC = 'data/topics/number-system.json'

# ---------------------------------------------------------------- READINGS ---
# Deep study content per section. Stacked math: one $$...$$ pair per line so
# derivations render line-by-line, not collapsed into one line.

READINGS = [
{
  "id": "classification",
  "title": "The Number Family (Classification)",
  "type": "concept",
  "quickSummary": "Every exam number question starts with knowing which family a number belongs to: natural, whole, integer, rational, irrational, real, complex.",
  "content": [
    "Numbers are grouped into nested families. Each family adds new members, and the key to classification questions is knowing exactly which family a given number falls into — and which it does NOT.",
    "The nesting from inside out:",
    "$$\\mathbb{N} \\subset \\mathbb{W} \\subset \\mathbb{Z} \\subset \\mathbb{Q} \\subset \\mathbb{R} \\subset \\mathbb{C}$$"
  ],
  "subsections": [
    {
      "title": "Natural numbers",
      "content": [
        "Counting numbers starting from 1: $1, 2, 3, 4, \\ldots$",
        "There is no largest natural number — the set is infinite. Note that $0$ is NOT a natural number (it is the first whole number)."
      ]
    },
    {
      "title": "Whole numbers",
      "content": [
        "Natural numbers plus zero: $0, 1, 2, 3, \\ldots$",
        "The only new member compared to naturals is $0$."
      ],
      "example": {
        "prompt": "Which of these is a whole number but not a natural number?",
        "steps": ["Naturals start at $1$.", "$0$ is a whole number and is not natural.", "Negative numbers are integers, not whole numbers."],
        "answer": "$0$"
      }
    },
    {
      "title": "Integers",
      "content": [
        "Whole numbers plus their negatives: $\\ldots, -3, -2, -1, 0, 1, 2, 3, \\ldots$",
        "Integers are closed under addition, subtraction and multiplication, but NOT under division (e.g. $1 \\div 2$ is not an integer)."
      ]
    },
    {
      "title": "Rational and irrational numbers",
      "content": [
        "Rational: any number expressible as $\\frac{p}{q}$ with integers $p, q$ and $q \\neq 0$. Terminating decimals ($0.5$) and repeating decimals ($0.\\overline{3}$) are rational.",
        "Irrational: cannot be written as a fraction — non-terminating, non-repeating decimals. Examples: $\\sqrt{2}, \\pi, e$.",
        "Key fact: between any two rationals there is another rational (and an irrational too) — the rationals are dense, but so are the irrationals."
      ],
      "example": {
        "prompt": "Which of the following is irrational? $\\frac{3}{4},\\ \\sqrt{81},\\ \\sqrt{2},\\ 2.5$",
        "steps": [
          "$\\frac{3}{4} = 0.75$ terminates — rational.",
          "$\\sqrt{81} = 9$ — rational.",
          "$\\sqrt{2}$ cannot be written as a fraction — irrational.",
          "$2.5 = \\frac{5}{2}$ — rational."
        ],
        "answer": "$\\sqrt{2}$"
      }
    },
    {
      "title": "Real and complex numbers",
      "content": [
        "Real = rational $\\cup$ irrational — everything on the number line.",
        "Complex = $a + bi$ where $i = \\sqrt{-1}$. Every real number is complex with $b = 0$.",
        "Numbers with no real square root like $\\sqrt{-4}$ live in the complex family."
      ]
    },
    {
      "title": "Place value and face value",
      "content": [
        "Face value of a digit is the digit itself. Place value is digit $\\times$ its positional power of 10.",
        "In $4567$: the place value of $5$ is $5 \\times 100 = 500$; its face value is $5$."
      ],
      "example": {
        "prompt": "In the number $82931$, what is the difference between the place values of the digit $2$ and the digit $3$?",
        "steps": [
          "Digit $2$ is in the thousands place: place value $= 2 \\times 1000 = 2000$.",
          "Digit $3$ is in the tens place: place value $= 3 \\times 10 = 30$.",
          "Difference $= 2000 - 30 = 1970$."
        ],
        "answer": "$1970$"
      }
    }
  ],
  "tricks": [
    "Memorize one chain: natural ⊂ whole ⊂ integer ⊂ rational ⊂ real ⊂ complex.",
    "0 and negative numbers are the usual 'trick' answers — check the boundary.",
    "A square root of a perfect square ($\\sqrt{81}$) is rational; a square root of a non-perfect square ($\\sqrt{2}$) is irrational.",
    "Every integer is rational (write it as $\\frac{n}{1}$), but not every rational is an integer."
  ],
  "patterns": [
    "'Which is NOT ...?' questions test the boundary members of one family.",
    "If options mix fractions, roots and decimals, test each option against the definition, don't guess by look.",
    "Repeating decimal (e.g. $0.\\overline{12}$) = rational; non-repeating infinite decimal = irrational."
  ],
  "pyqPatterns": [
    {
      "source": "Placement pattern (TCS/Wipro)",
      "question": "Which is the smallest whole number? (Options: 0, 1, -1, none)",
      "approach": "Whole numbers start at 0 — pick 0. Only integers include negatives."
    },
    {
      "source": "Placement pattern (Cognizant)",
      "question": "How many rational numbers lie between 3 and 4?",
      "approach": "Infinitely many — rationals are dense. Never pick a finite count."
    }
  ],
  "quickRevision": [
    "Natural: 1,2,3,...  |  Whole: add 0  |  Integer: add negatives",
    "Rational = p/q form or terminating/repeating decimal",
    "Irrational = non-terminating, non-repeating decimal (√2, π)",
    "Real = rational + irrational; every real is complex (b=0)"
  ],
  "companyNote": "Classification questions appear in nearly every placement test as the first 'easy' question — do not lose it."
},
{
  "id": "primes-composites",
  "title": "Primes & Composites — The Building Blocks",
  "type": "concept",
  "quickSummary": "A prime has exactly 2 factors. Every composite is a product of primes. Mastering primality tests and the prime checklist solves a huge share of number-system questions.",
  "content": [
    "Think of primes as the atoms of the number world: every composite number is built from primes, and every question about factors, divisibility or LCM/HCF ultimately runs on primes.",
    "Prime: a natural number $> 1$ with exactly two factors — $1$ and itself. Composite: a natural number $> 1$ with more than two factors."
  ],
  "subsections": [
    {
      "title": "The prime checklist",
      "content": [
        "$2$ is the smallest prime and the ONLY even prime — every other even number is composite.",
        "The first ten primes:",
        "$$2,\\ 3,\\ 5,\\ 7,\\ 11,\\ 13,\\ 17,\\ 19,\\ 23,\\ 29$$",
        "$1$ is neither prime nor composite. $0$ is neither."
      ],
      "example": {
        "prompt": "Which is the only even prime number?",
        "steps": ["Every even number $> 2$ is divisible by $2$, so it has more than two factors.", "Only $2$ itself escapes — its factors are $1$ and $2$."],
        "answer": "$2$"
      }
    },
    {
      "title": "Checking if a number is prime",
      "content": [
        "Step 1: Find $\\sqrt{n}$.",
        "Step 2: Divide $n$ by each prime $\\leq \\sqrt{n}$.",
        "Step 3: If none divides it, $n$ is prime."
      ],
      "example": {
        "prompt": "Is 97 prime?",
        "steps": [
          "$$\\sqrt{97} \\approx 9.8$$",
          "Check primes up to $9.8$: $2, 3, 5, 7$.",
          "$97$ is odd; digit sum $9+7=16$ not divisible by $3$; doesn't end in $5$; $97 \\div 7 = 13$ remainder $6$.",
          "No prime divides $97$, so it is prime."
        ],
        "answer": "Yes, 97 is prime."
      }
    },
    {
      "title": "Twin primes and co-primes",
      "content": [
        "Twin primes: primes differing by 2, like $(3,5), (5,7), (11,13), (17,19)$.",
        "Co-prime (relatively prime): two numbers whose HCF is 1. They need not be prime: $(8, 15)$ is co-prime.",
        "Any two consecutive numbers are always co-prime, e.g. $(14, 15)$.",
        "Consecutive odd numbers differ by 2 and are co-prime."
      ],
      "example": {
        "prompt": "Which pair is NOT co-prime? (a) (4,9) (b) (6,35) (c) (14,21) (d) (8,15)",
        "steps": [
          "$(4,9)$: HCF is $1$ — co-prime.",
          "$(6,35)$: HCF is $1$ — co-prime.",
          "$(14,21)$: $14$ and $21$ share factor $7$ — HCF is $7$, NOT co-prime.",
          "$(8,15)$: HCF is $1$ — co-prime."
        ],
        "answer": "$(14,21)$"
      }
    },
    {
      "title": "Fundamental theorem of arithmetic",
      "content": [
        "Every composite number has ONE unique prime factorisation (up to ordering).",
        "This is why prime factorisation is the universal tool: $360 = 2^3 \\times 3^2 \\times 5$ is the only way to break 360 into primes."
      ]
    }
  ],
  "tricks": [
    "Primes up to 100 — memorize the list: 2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97 (25 primes).",
    "Quick filters in order: even? ends in 5? digit sum divisible by 3? then check 7, 11, 13.",
    "For 'how many primes between a and b', list the candidates after applying the 2/3/5 filters — rarely need to test all.",
    "2 and 3 are the only consecutive primes. (2,3) is the only twin-prime pair involving 2."
  ],
  "patterns": [
    "'Which is NOT a prime' — test 2 (even), digit sum 3, ends in 5 first.",
    "Product/sum of primes questions: remember 2 is the only even prime — sum of two primes is odd unless one of them is 2.",
    "If two primes differ by 2 (twins), and the middle number is between them — the middle is always even (and composite if > 4)."
  ],
  "pyqPatterns": [
    {
      "source": "Campus placement PYQ set",
      "question": "How many prime numbers exist between 1 and 100?",
      "approach": "25 primes. Known list — memorize rather than sieve in exam."
    },
    {
      "source": "Placement pattern (Infosys)",
      "question": "Product of the first 25 primes is even or odd?",
      "approach": "Contains 2, so the product is even — and divisible by every prime on the list."
    }
  ],
  "quickRevision": [
    "Prime = exactly 2 factors; smallest is 2; only even prime is 2",
    "1 is neither prime nor composite",
    "Test: √n, divide by primes ≤ √n",
    "Twin primes differ by 2; co-prime = HCF 1 (need not be prime)"
  ],
  "companyNote": "Primality checks up to 100 (and 100–200) are direct exam favourites — TCS, Infosys and Cognizant have all repeated them."
},
{
  "id": "divisibility",
  "title": "Divisibility Rules",
  "type": "concept",
  "quickSummary": "Divisibility rules replace long division with digit tricks. Master 2,3,4,5,6,8,9,10,11 first; 7 and 13 have standard shortcuts that appear regularly.",
  "content": [
    "A number $N$ is divisible by $d$ if $N \\div d$ leaves remainder 0. Rules let you check this from the digits alone. The two workhorses: last-digit rules (2,4,5,8,10) and sum-of-digits rules (3,9)."
  ],
  "subsections": [
    {
      "title": "Rules by 2, 3, 4, 5, 6, 8, 9, 10, 11",
      "content": [
        "$$2: \\text{ last digit even} \\qquad 5: \\text{ last digit } 0 \\text{ or } 5 \\qquad 10: \\text{ last digit } 0$$",
        "$$3: \\text{ sum of digits divisible by } 3 \\qquad 9: \\text{ sum of digits divisible by } 9$$",
        "$$4: \\text{ last two digits divisible by } 4 \\qquad 8: \\text{ last three digits divisible by } 8$$",
        "$$6: \\text{ divisible by both } 2 \\text{ and } 3$$",
        "$$11: \\text{ (sum of digits in odd places)} - \\text{(sum in even places)} \\text{ is } 0, 11, \\text{ or multiple of } 11$$"
      ],
      "example": {
        "prompt": "Which of 4512, 4513, 4515 is divisible by 9?",
        "steps": [
          "Digit sums: $4+5+1+2 = 12$; $4+5+1+3 = 13$; $4+5+1+5 = 15$.",
          "Divisible by 9 requires digit sum divisible by 9.",
          "None of $12, 13, 15$ is divisible by $9$ — so NONE of them is divisible by 9."
        ],
        "answer": "None"
      }
    },
    {
      "title": "Rule for 7 (shortcut)",
      "content": [
        "Double the last digit, subtract from the rest, repeat:",
        "$$N \\to \\lfloor N/10 \\rfloor - 2 \\times \\text{(last digit)}$$",
        "If the result is $0$ or divisible by $7$, $N$ is divisible by $7$."
      ],
      "example": {
        "prompt": "Is 343 divisible by 7?",
        "steps": ["$$34 - 2 \\times 3 = 34 - 6 = 28$$", "$28$ is divisible by $7$."],
        "answer": "Yes — 343 = 7 × 49"
      }
    },
    {
      "title": "Rule for 11 in detail",
      "content": [
        "From the RIGHT, mark digits alternately +, −, +, − … then add them with signs. Or from the left — the rule is the same, sign flips are consistent.",
        "$$N = 918082: (9 - 1 + 8 - 0 + 8 - 2) = 22$$",
        "$22$ is a multiple of $11$ — so $918082$ is divisible by $11$."
      ],
      "example": {
        "prompt": "Is 123456789 divisible by 11?",
        "steps": [
          "Sum odd places from left: $1+3+5+7+9 = 25$.",
          "Sum even places: $2+4+6+8 = 20$.",
          "Difference $25 - 20 = 5$, not a multiple of 11."
        ],
        "answer": "No"
      }
    },
    {
      "title": "Composite rules: build from factors",
      "content": [
        "Divisible by $ab$ (with co-prime $a, b$) iff divisible by both $a$ and $b$: $6 = 2 \\times 3$, $12 = 3 \\times 4$, $15 = 3 \\times 5$, $18 = 2 \\times 9$.",
        "Caveat: $a, b$ must be co-prime — $36 = 4 \\times 9$ works, but you cannot use $36 = 6 \\times 6$ as a test."
      ],
      "example": {
        "prompt": "Which number is divisible by 12? (a) 314 (b) 312 (c) 322",
        "steps": [
          "$12 = 3 \\times 4$ with $(3,4)$ co-prime — check both.",
          "$314$: digit sum $8$, not div by 3.",
          "$312$: digit sum $6$ (div by 3); last two digits $12$ (div by 4).",
          "$322$: last two digits $22$ not div by 4."
        ],
        "answer": "$312$"
      }
    }
  ],
  "tricks": [
    "3 and 9 use the SAME digit-sum idea — if divisible by 9 then by 3, never the reverse.",
    "For 6: test 2 first (cheaper), then 3.",
    "For 7, 11, 13 combined: $7 \\times 11 \\times 13 = 1001$. Any number of form $abcabc$ (e.g. $217217$) is divisible by 7, 11 and 13.",
    "When a question asks 'divisible by 8', only the last three digits matter — ignore everything to the left.",
    "Digit sum trick for remainder: remainder of $N \\div 9$ equals digit-sum of $N$ mod 9 (casting out nines)."
  ],
  "patterns": [
    "'Replace * in 23*4 to make divisible by 9' — solve from the digit-sum equation.",
    "'Smallest number to add/subtract to make divisible by 9' — use remainder from digit sum.",
    "Tests like 12, 15, 18 decompose into co-prime pairs — always decompose, never test directly."
  ],
  "pyqPatterns": [
    {
      "source": "TCS NQT / campus PYQ",
      "question": "If 451*603 (star = one digit) is divisible by 9, what digit replaces *?",
      "approach": "Digit sum $4+5+1+*+6+0+3 = 19+*$ must be divisible by 9 → $* = 8$. (Several published answers say 7 — verified: 27 is the only multiple in range, and $19+8=27$.)"
    },
    {
      "source": "Placement pattern",
      "question": "What least number should be added to 6709 to make it divisible by 9?",
      "approach": "Digit sum $6+7+0+9 = 22$; next multiple of 9 is 27; add $27-22 = 5$."
    }
  ],
  "quickRevision": [
    "2/5/10: last digit | 4: last two | 8: last three",
    "3/9: digit sum | 6: 2 and 3 | 12: 3 and 4 | 15: 3 and 5",
    "11: alternate-sum difference is 0 or multiple of 11",
    "7: n → ⌊n/10⌋ − 2×last digit, repeat",
    "abcabc is always divisible by 7, 11, 13"
  ],
  "companyNote": "Digit-replacement divisibility questions are a certified TCS NQT repeat — always solve via digit sum."
},
{
  "id": "hcf-lcm",
  "title": "HCF & LCM",
  "type": "concept",
  "quickSummary": "HCF is the largest common divisor; LCM is the smallest common multiple. Their product identity — HCF × LCM = product of the numbers — is the single most tested relation.",
  "content": [
    "HCF (GCD): the largest number that divides all given numbers. LCM: the smallest number divisible by all given numbers.",
    "The master identity for two numbers $a, b$:",
    "$$HCF(a,b) \\times LCM(a,b) = a \\times b$$"
  ],
  "subsections": [
    {
      "title": "HCF by prime factorisation",
      "content": [
        "HCF = product of common prime factors with the SMALLEST exponent.",
        "For $24 = 2^3 \\times 3$ and $36 = 2^2 \\times 3^2$:",
        "$$HCF = 2^2 \\times 3^1 = 12$$"
      ]
    },
    {
      "title": "LCM by prime factorisation",
      "content": [
        "LCM = product of ALL prime factors with the LARGEST exponent.",
        "For $24$ and $36$:",
        "$$LCM = 2^3 \\times 3^2 = 72$$"
      ],
      "example": {
        "prompt": "Find HCF and LCM of 40 and 56.",
        "steps": [
          "$$40 = 2^3 \\times 5, \\qquad 56 = 2^3 \\times 7$$",
          "Common factor: $2^3$ → $HCF = 8$.",
          "All factors max exponent: $2^3 \\times 5 \\times 7 = 280$ → $LCM = 280$.",
          "Check: $8 \\times 280 = 2240 = 40 \\times 56$ ✓"
        ],
        "answer": "HCF 8, LCM 280"
      }
    },
    {
      "title": "LCM of fractions",
      "content": [
        "$$LCM\\left(\\frac{a}{b}, \\frac{c}{d}\\right) = \\frac{LCM(a, c)}{HCF(b, d)}$$",
        "$$HCF\\left(\\frac{a}{b}, \\frac{c}{d}\\right) = \\frac{HCF(a, c)}{LCM(b, d)}$$"
      ],
      "example": {
        "prompt": "Find LCM of 2/3 and 4/9.",
        "steps": ["Numerators: $LCM(2,4) = 4$.", "Denominators: $HCF(3,9) = 3$.", "$$LCM = \\frac{4}{3}$$"]
      }
    },
    {
      "title": "Co-prime and product relations",
      "content": [
        "For co-prime numbers, HCF = 1 and LCM = product.",
        "If HCF of two numbers is $h$ and ratio is $a : b$ (with $a, b$ co-prime), the numbers are $ah$ and $bh$.",
        "Least number exactly divisible by 2,3,4,5,6 = LCM(2,3,4,5,6) = 60."
      ],
      "example": {
        "prompt": "Two numbers are in ratio 3:5 and their HCF is 12. Find the numbers.",
        "steps": ["Numbers $= 3h$ and $5h$ with $h = HCF = 12$.", "$$3 \\times 12 = 36, \\qquad 5 \\times 12 = 60$$"]
      }
    },
    {
      "title": "n numbers: pairwise identity caveat",
      "content": [
        "For THREE or more numbers, HCF × LCM ≠ product — the identity holds only for two numbers.",
        "$$HCF \\text{ of } (a, b, c) \\times LCM(a, b, c) \\neq a \\times b \\times c \\quad \\text{(in general)}$$",
        "This is a classic trap: the two-number identity gets misapplied."
      ]
    }
  ],
  "tricks": [
    "HCF × LCM = a × b — use it to find any one unknown from the other three.",
    "Co-prime numbers: HCF = 1, LCM = product.",
    "HCF of fractions: HCF of numerators / LCM of denominators (swap!).",
    "Greatest number dividing all of them = HCF; smallest number divisible by all = LCM.",
    "HCF of consecutive numbers = 1; LCM of consecutive numbers = their product (they are co-prime)."
  ],
  "patterns": [
    "Ratio + HCF questions: numbers = ratio × HCF.",
    "'Least number divisible by a,b,c' = LCM.",
    "'Greatest number that divides a,b,c leaving same remainder r' = HCF(a−r, b−r, c−r) or HCF(a,b,c) if remainder 0.",
    "Bell-ringing / traffic-light / circular-track questions = LCM of the intervals."
  ],
  "pyqPatterns": [
    {
      "source": "Campus placement PYQ",
      "question": "HCF of two numbers is 12 and their product is 2880. Find LCM.",
      "approach": "$LCM = \\frac{2880}{12} = 240$ — direct identity application."
    },
    {
      "source": "Placement pattern (Wipro)",
      "question": "Find the largest number which divides 245 and 1029 leaving remainder 5 in each case.",
      "approach": "Subtract the remainder: HCF(240, 1024) = 16."
    }
  ],
  "quickRevision": [
    "HCF: common primes, smallest exponents",
    "LCM: all primes, largest exponents",
    "HCF × LCM = a × b (two numbers only!)",
    "Fractions: LCM = LCM(nums)/HCF(dens); HCF = HCF(nums)/LCM(dens)",
    "Co-prime: HCF 1, LCM = product"
  ],
  "companyNote": "The product identity and ratio+HCF questions appear in TCS, Infosys and Cognizant with very high frequency."
},
{
  "id": "cyclicity",
  "title": "Cyclicity & Unit Digit Patterns",
  "type": "concept",
  "quickSummary": "The unit digit of powers repeats in cycles. Find the cycle length, divide the exponent by it, and read the answer from the remainder — no big powers needed.",
  "content": [
    "The unit digit of $a^n$ depends only on the unit digit of $a$, and repeats in a fixed cycle. This turns 'unit digit of $7^{345}$' into a small division problem."
  ],
  "subsections": [
    {
      "title": "The four cycle families",
      "content": [
        "Cycle 1 (always same): $0, 1, 5, 6$ — unit digit never changes: $6^n$ ends in 6 for every $n \\geq 1$.",
        "Cycle 2: $4^n$ alternates $4, 6$; $9^n$ alternates $9, 1$.",
        "Cycle 4: $2, 3, 7, 8$ repeat every 4 powers.",
        "$$2: 2, 4, 8, 6 \\qquad 3: 3, 9, 7, 1 \\qquad 7: 7, 9, 3, 1 \\qquad 8: 8, 4, 2, 6$$"
      ]
    },
    {
      "title": "The division method",
      "content": [
        "Cycle length $c$; compute $n \\bmod c$; if remainder is 0, use the $c$-th (last) power in the cycle.",
        "For $7^{345}$: cycle of 7 is $7, 9, 3, 1$ (length 4).",
        "$$345 \\bmod 4 = 1 \\Rightarrow \\text{ first power } \\Rightarrow 7$$"
      ],
      "example": {
        "prompt": "Find the unit digit of $2^{99}$.",
        "steps": [
          "Cycle of 2: $2, 4, 8, 6$ (length 4).",
          "$$99 \\bmod 4 = 3$$",
          "3rd member of the cycle is $8$."
        ],
        "answer": "$8$"
      }
    },
    {
      "title": "Products and sums of unit digits",
      "content": [
        "Unit digit of a product = unit digit of (unit digits of factors).",
        "$$\\text{unit}(8314 \\times 8415) = \\text{unit}(4 \\times 5) = \\text{unit}(20) = 0$$",
        "Same idea for sums and differences."
      ],
      "example": {
        "prompt": "Unit digit of $7^{23} \\times 3^{45}$?",
        "steps": [
          "$7^{23}$: $23 \\bmod 4 = 3$ → cycle member $3$.",
          "$3^{45}$: $45 \\bmod 4 = 1$ → cycle member $3$.",
          "$$3 \\times 3 = 9$$"
        ],
        "answer": "$9$"
      }
    },
    {
      "title": "Negative exponents? No — but negative bases",
      "content": [
        "If base is negative, use the unit digit of |base| and fix the sign: $(-7)^n$ has unit digit of $7^n$, sign depends on parity of $n$.",
        "When the base itself ends in 0 or 1 (like $2026^{2026}$), answer is immediately 6 or 1 — no cycle needed."
      ]
    }
  ],
  "tricks": [
    "0, 1, 5, 6: any power → same unit digit. 4/9: alternate. 2/3/7/8: cycle of 4.",
    "If exponent is a multiple of 4, unit digit is the 4th member: 2→6, 3→1, 7→1, 8→6.",
    "For a number ending in digit d raised to n, ONLY d matters — strip the rest.",
    "Unit digit of (a × b × c) = unit digit of (unit(a) × unit(b) × unit(c))."
  ],
  "patterns": [
    "Huge exponents with bases ending in 2/3/7/8 → exponent mod 4.",
    "Exponents with bases ending 4/9 → parity of exponent (mod 2).",
    "Bases ending 0/1/5/6 → trivial, answer is the base's last digit.",
    "Product/sum of powers → solve each factor's unit digit, then combine."
  ],
  "pyqPatterns": [
    {
      "source": "hitbullseye / TCS NQT",
      "question": "Unit digit of $7^{345}$?",
      "approach": "Cycle 4 → $345 \\bmod 4 = 1$ → unit digit 7."
    },
    {
      "source": "Placement pattern (Infosys)",
      "question": "Unit digit of $8314 \\times 8415$?",
      "approach": "$4 \\times 5 = 20$ → unit digit 0."
    }
  ],
  "quickRevision": [
    "Cycle 1: 0,1,5,6 | Cycle 2: 4,9 | Cycle 4: 2,3,7,8",
    "Exponent mod cycle-length; remainder 0 → last member",
    "2: 2,4,8,6 | 3: 3,9,7,1 | 7: 7,9,3,1 | 8: 8,4,2,6",
    "Product: multiply unit digits only"
  ],
  "companyNote": "Cyclicity is a guaranteed question in TCS NQT, Infosys and Wipro. One cycle table = all variants."
},
{
  "id": "remainders",
  "title": "Remainders — Wilson, Euler, Fermat & CRT",
  "type": "concept",
  "quickSummary": "Big-power remainders are solved with modular shortcuts: binomial splitting for 1±mod patterns, Fermat for prime moduli, Wilson for factorials, Euler for general moduli, and CRT to combine congruences.",
  "content": [
    "Remainder questions with enormous exponents are impossible by brute force — they are solved by modular arithmetic. The four tools cover the exam universe of remainder problems."
  ],
  "subsections": [
    {
      "title": "Binomial splitting: the workhorse",
      "content": [
        "Split the base as (multiple of modulus ± 1) or (multiple ± small k), then expand: only the last term survives.",
        "$$\\text{Rem}\\left(\\frac{8^{103}}{7}\\right) = \\text{Rem}\\left(\\frac{(7+1)^{103}}{7}\\right) = \\text{Rem}\\left(\\frac{1^{103}}{7}\\right) = 1$$"
      ],
      "example": {
        "prompt": "Find the remainder when $17^{200}$ is divided by 18.",
        "steps": [
          "$$17 \\equiv -1 \\pmod{18}$$",
          "$$17^{200} \\equiv (-1)^{200} \\equiv 1 \\pmod{18}$$"
        ],
        "answer": "$1$"
      }
    },
    {
      "title": "Fermat's little theorem",
      "content": [
        "If $p$ is prime and $p \\nmid a$:",
        "$$a^{p-1} \\equiv 1 \\pmod p$$",
        "Reduce the exponent by multiples of $p-1$ first, then handle the remainder."
      ],
      "example": {
        "prompt": "Find the remainder when $5^{100}$ is divided by 13.",
        "steps": [
          "13 is prime → $5^{12} \\equiv 1 \\pmod{13}$ (Fermat).",
          "$$100 = 12 \\times 8 + 4 \\Rightarrow 5^{100} \\equiv 5^4 \\pmod{13}$$",
          "$$5^4 = 625 = 13 \\times 48 + 1 \\Rightarrow 5^4 \\equiv 1 \\pmod{13}$$"
        ],
        "answer": "$1$"
      }
    },
    {
      "title": "Euler's totient extension",
      "content": [
        "For any modulus $m$ with $\\gcd(a, m) = 1$:",
        "$$a^{\\varphi(m)} \\equiv 1 \\pmod m, \\qquad \\varphi(m) = m\\prod_{p \\mid m}\\left(1 - \\frac{1}{p}\\right)$$"
      ],
      "example": {
        "prompt": "Find the remainder when $3^{100}$ is divided by 10 using Euler's theorem.",
        "steps": [
          "$\\varphi(10) = 10(1-\\frac{1}{2})(1-\\frac{1}{5}) = 4$.",
          "$$3^4 \\equiv 1 \\pmod{10} \\Rightarrow 3^{100} = 3^{4 \\times 25} \\equiv 1 \\pmod{10}$$"
        ],
        "answer": "$1$"
      }
    },
    {
      "title": "Wilson's theorem",
      "content": [
        "For prime $p$:",
        "$$(p-1)! \\equiv -1 \\pmod p$$",
        "Most exam versions ask for remainder of $(p-1)!$ or a rearranged factorial product mod a small prime."
      ],
      "example": {
        "prompt": "Find the remainder when $6!$ is divided by 7.",
        "steps": ["Wilson: $(7-1)! \\equiv -1 \\pmod 7$ i.e. $6! \\equiv -1 \\equiv 6 \\pmod 7$."],
        "answer": "$6$"
      }
    },
    {
      "title": "Chinese Remainder Theorem (CRT)",
      "content": [
        "Combine congruences with pairwise co-prime moduli:",
        "$$x \\equiv a_1 \\pmod{m_1}, \\quad x \\equiv a_2 \\pmod{m_2}, \\quad m = m_1 m_2$$",
        "Find $M_1 = m/m_1$, its inverse mod $m_1$, then $x = \\sum a_i M_i M_i^{-1} \\bmod m$."
      ],
      "example": {
        "prompt": "Find the smallest $x$ with $x \\equiv 1 \\pmod 3$ and $x \\equiv 2 \\pmod 5$.",
        "steps": [
          "List $x = 2, 7, 12, \\ldots$ from $x \\equiv 2 \\pmod 5$.",
          "First value with $x \\equiv 1 \\pmod 3$: $2 \\bmod 3 = 2$, $7 \\bmod 3 = 1$ ✓",
          "Smallest $x = 7$."
        ],
        "answer": "$7$"
      }
    },
    {
      "title": "Remainder of a number by 9 (casting out nines)",
      "content": [
        "Remainder of $N \\div 9$ = digit-sum of $N$ reduced mod 9 (0 → 9).",
        "$$\\text{Rem}\\left(\\frac{123456789}{9}\\right): \\quad 1+2+3+4+5+6+7+8+9 = 45 \\equiv 0 \\pmod 9$$"
      ]
    }
  ],
  "tricks": [
    "Try binomial split (base = multiple of modulus ± k) FIRST — it solves most problems in one line.",
    "If modulus is prime and exponent ≥ modulus − 1, Fermat applies: reduce exponent mod (p−1).",
    "Remainder of N ÷ 9 = digit sum mod 9; remainder of N ÷ 11 = alternate-sum difference mod 11.",
    "For (a + b) mod m with huge a: compute a mod m, then add.",
    "When a and m share a factor, Fermat/Euler do NOT apply — factor out the common divisor first."
  ],
  "patterns": [
    "Base ≡ ±1 mod m → answer ±1 by parity of exponent.",
    "Exponent huge + prime modulus → exponent mod (p−1) via Fermat.",
    "Two simultaneous congruences with co-prime moduli → CRT (or just list from the bigger modulus).",
    "Factorial mod prime p → Wilson.",
    "Remainder by 9/11 → digit tricks, not long division."
  ],
  "pyqPatterns": [
    {
      "source": "Campus placement PYQ",
      "question": "Remainder of $2^{50} \\div 7$?",
      "approach": "$2^3 \\equiv 1 \\pmod 7$; $50 = 3\\times16+2$; remainder $= 2^2 = 4$."
    },
    {
      "source": "Placement pattern (TCS)",
      "question": "A number divided by 56 leaves remainder 29. What is the remainder when divided by 8?",
      "approach": "$29 \\bmod 8 = 5$ — the quotient part is divisible by 8, only the remainder matters."
    }
  ],
  "quickRevision": [
    "Binomial: (km ± 1)^n → ±1; (km ± r)^n → r^n",
    "Fermat: p prime, a^(p−1) ≡ 1 (mod p)",
    "Euler: a^φ(m) ≡ 1 (mod m) when gcd(a,m)=1",
    "Wilson: (p−1)! ≡ −1 (mod p)",
    "CRT: combine congruences, co-prime moduli",
    "N mod 9 = digit sum mod 9"
  ],
  "companyNote": "Fermat- and binomial-based remainders are the hardest routinely-asked number-system questions in TCS NQT — worth mastering fully."
}
]

# --------------------------------------------------------------- FORMULAS ---
# Enrich the existing 23 formula cards with whenToUse / memoryTip /
# commonMistake and a structured example {prompt, steps, answer}.

def formula_meta():
    meta = {
      "sum-natural": {
        "title": "Sum of First n Natural Numbers",
        "whenToUse": "Any question summing $1 + 2 + \\cdots + n$ or a consecutive range 1 to n.",
        "memoryTip": "n(n+1) over 2 — 'nn plus one, cut in two'.",
        "commonMistake": "Do NOT use n/2×… on the last term: for 1..n the sum is always n(n+1)/2. For a range a..b, subtract: S(b) − S(a−1).",
        "example": {"prompt": "Find $1+2+\\cdots+100$.", "steps": ["$$S = \\frac{n(n+1)}{2} = \\frac{100 \\times 101}{2}$$", "$$= 50 \\times 101 = 5050$$"], "answer": "$5050$"}
      },
      "sum-odd": {
        "title": "Sum of First n Odd Numbers",
        "whenToUse": "Sum of odd numbers 1,3,5,… up to n terms, or 1..n where n is odd.",
        "memoryTip": "Sum of first n odds = n². The nth odd number is 2n−1.",
        "commonMistake": "Using the odd count as (last+1)/2 wrongly when the sequence does not start at 1.",
        "example": {"prompt": "Find $1+3+5+\\cdots+99$.", "steps": ["Count of odd terms: $(99+1)/2 = 50$.", "$$S = n^2 = 50^2 = 2500$$"], "answer": "$2500$"}
      },
      "sum-even": {
        "title": "Sum of First n Even Numbers",
        "whenToUse": "Sum of even numbers 2,4,6,… up to n terms.",
        "memoryTip": "Sum of first n evens = n(n+1). The nth even number is 2n.",
        "commonMistake": "Confusing the count n with the last term: for evens up to 100, n = 50, not 100.",
        "example": {"prompt": "Find $2+4+6+\\cdots+100$.", "steps": ["Number of even terms: $100/2 = 50$.", "$$S = n(n+1) = 50 \\times 51 = 2550$$"], "answer": "$2550$"}
      },
      "sum-squares": {
        "title": "Sum of Squares of First n Natural Numbers",
        "whenToUse": "Sum $1^2+2^2+\\cdots+n^2$.",
        "memoryTip": "n(n+1)(2n+1) over 6 — 'two friends in the middle'.",
        "commonMistake": "Forgetting the (2n+1) factor, or using the natural-sum formula.",
        "example": {"prompt": "Find $1^2+2^2+\\cdots+10^2$.", "steps": ["$$S = \\frac{n(n+1)(2n+1)}{6} = \\frac{10 \\times 11 \\times 21}{6}$$", "$$= \\frac{2310}{6} = 385$$"], "answer": "$385$"}
      },
      "sum-cubes": {
        "title": "Sum of Cubes of First n Natural Numbers",
        "whenToUse": "Sum $1^3+2^3+\\cdots+n^3$.",
        "memoryTip": "Sum of cubes = (sum of numbers)² — the beautiful identity.",
        "commonMistake": "Writing n²(n+1)²/4 as n(n+1)²/4 — keep BOTH squares.",
        "example": {"prompt": "Find $1^3+2^3+\\cdots+10^3$.", "steps": ["$$S = \\left(\\frac{n(n+1)}{2}\\right)^2 = \\left(\\frac{10 \\times 11}{2}\\right)^2$$", "$$= 55^2 = 3025$$"], "answer": "$3025$"}
      },
      "hcf-lcm-product": {
        "title": "HCF × LCM = Product of Two Numbers",
        "whenToUse": "Whenever two numbers, their HCF and their LCM appear — find the fourth from any three.",
        "memoryTip": "h times l equals a times b — one equation, four unknowns.",
        "commonMistake": "Applying it to 3+ numbers — it fails there.",
        "example": {"prompt": "Product of two numbers is 288, HCF is 12. Find LCM.", "steps": ["$$HCF \\times LCM = a \\times b$$", "$$12 \\times LCM = 288 \\Rightarrow LCM = 24$$"], "answer": "$24$"}
      },
      "num-factors": {
        "title": "Number of Factors (Divisors)",
        "whenToUse": "Counting total factors of a number: factorise, add 1 to each exponent, multiply.",
        "memoryTip": "$$N = p^a q^b r^c \\Rightarrow \\text{factors} = (a+1)(b+1)(c+1)$$",
        "commonMistake": "Forgetting the +1, or factorising incompletely (e.g. missing $37$ in $888888$).",
        "example": {"prompt": "How many factors does 360 have?", "steps": ["$$360 = 2^3 \\times 3^2 \\times 5^1$$", "Factors $= (3+1)(2+1)(1+1)$", "$$= 4 \\times 3 \\times 2 = 24$$"], "answer": "$24$"}
      },
      "sum-factors": {
        "title": "Sum of Factors",
        "whenToUse": "Sum of all divisors of a number.",
        "memoryTip": "Product of geometric sums: $\\frac{p^{a+1}-1}{p-1}$ for each prime power.",
        "commonMistake": "Summing the divisors by hand for large numbers; or using (a+1) instead of the geometric series.",
        "example": {"prompt": "Sum of all factors of 12?", "steps": ["$$12 = 2^2 \\times 3$$", "$$\\frac{2^3-1}{2-1} \\times \\frac{3^2-1}{3-1} = 7 \\times 4 = 28$$", "Check: $1+2+3+4+6+12 = 28$ ✓"], "answer": "$28$"}
      },
      "fermat": {
        "title": "Fermat's Little Theorem",
        "whenToUse": "Remainder of $a^n \\bmod p$ with prime $p$ and $p \\nmid a$: reduce exponent mod $p-1$.",
        "memoryTip": "For prime p, a^(p−1) ≡ 1 (mod p). Exponent modulo p−1.",
        "commonMistake": "Using it when p and a share a factor — it breaks. Reduce the exponent correctly.",
        "example": {"prompt": "Remainder of $5^{100} \\div 13$?", "steps": ["$5^{12} \\equiv 1 \\pmod{13}$ (Fermat, p=13).", "$$100 = 12 \\times 8 + 4 \\Rightarrow 5^{100} \\equiv 5^4 \\pmod{13}$$", "$5^4 = 625 \\equiv 1 \\pmod{13}$."], "answer": "$1$"}
      },
      "euler": {
        "title": "Euler's Totient Theorem",
        "whenToUse": "Remainder of $a^n \\bmod m$ when $m$ is composite but $\\gcd(a,m)=1$.",
        "memoryTip": "φ(m) = m·Π(1−1/p) over distinct primes of m; then a^φ ≡ 1 (mod m).",
        "commonMistake": "Forgetting the 1−1/p factors or using distinct primes instead of prime powers.",
        "example": {"prompt": "Remainder of $3^{100} \\div 10$?", "steps": ["$\\varphi(10) = 10 \\cdot \\frac{1}{2} \\cdot \\frac{4}{5} = 4$.", "$3^4 \\equiv 1 \\pmod{10}$ → $3^{100} = 3^{4 \\times 25} \\equiv 1$."], "answer": "$1$"}
      },
      "cyclicity": {
        "title": "Unit Digit Cycles",
        "whenToUse": "Unit digit of $a^n$ — cycles of length 1, 2 or 4.",
        "memoryTip": "2,3,7,8 cycle in 4; 4,9 in 2; 0,1,5,6 forever.",
        "commonMistake": "Using mod 4 when the cycle is 2 (4 and 9).",
        "example": {"prompt": "Unit digit of $7^{345}$?", "steps": ["Cycle of 7: $7,9,3,1$ (length 4).", "$$345 \\bmod 4 = 1$$", "1st member = 7."], "answer": "$7$"}
      },
      "trailing-zeros": {
        "title": "Trailing Zeros in n!",
        "whenToUse": "Count of zeros at the end of $n!$ = number of factors of 10 = count of 5s (since 2s are plentiful).",
        "memoryTip": "Keep dividing by 5, 25, 125, … and add the quotients.",
        "commonMistake": "Counting 2s instead of 5s, or stopping at n/5 without n/25, n/125…",
        "example": {"prompt": "How many trailing zeros in $100!$?", "steps": ["$$\\left\\lfloor \\frac{100}{5} \\right\\rfloor = 20, \\quad \\left\\lfloor \\frac{100}{25} \\right\\rfloor = 4, \\quad \\left\\lfloor \\frac{100}{125} \\right\\rfloor = 0$$", "$$20 + 4 = 24$$"], "answer": "$24$"}
      },
      "digital-root": {
        "title": "Digital Root",
        "whenToUse": "Remainder of N ÷ 9 (with 0 mapped to 9): sum digits until a single digit.",
        "memoryTip": "Digital root of N = N mod 9 (9 instead of 0). Works for sums, products, differences — mod 9 arithmetic.",
        "commonMistake": "Mixing up 'digital root 9' with 'remainder 0'.",
        "example": {"prompt": "Digital root of 987?", "steps": ["$$9+8+7 = 24, \\quad 2+4 = 6$$"], "answer": "$6$"}
      },
      "last-two": {
        "title": "Last Two Digits",
        "whenToUse": "Last two digits of powers — work mod 100; cycles of length 20 for most bases, binomial for 1- and -1-ending bases.",
        "memoryTip": "For bases ending in 1: last two digits of (…1)^n = last two of (1 + n×tens part).",
        "commonMistake": "Applying single-digit cyclicity to last-two-digits problems.",
        "example": {"prompt": "Last two digits of $31^{24}$?", "steps": ["$31 \\equiv 31 \\pmod{100}$, powers of …1: $(1 + 24 \\times 30) \\bmod 100$", "$$1 + 720 \\equiv 21 \\pmod{100}$$"], "answer": "$21$"}
      },
      "binomial-remainder": {
        "title": "Binomial Remainder Trick",
        "whenToUse": "Remainder of (km ± r)^n ÷ m — only the last binomial term survives.",
        "memoryTip": "Expand (km+r)^n; every term except r^n is divisible by m.",
        "commonMistake": "Ignoring the ± sign: (−1)^n flips with parity.",
        "example": {"prompt": "Remainder of $17^{200} \\div 18$?", "steps": ["$$17 \\equiv -1 \\pmod{18}$$", "$$(-1)^{200} \\equiv 1 \\pmod{18}$$"], "answer": "$1$"}
      },
      "chinese-remainder": {
        "title": "Chinese Remainder Theorem",
        "whenToUse": "Smallest x satisfying several congruences with co-prime moduli.",
        "memoryTip": "List from the largest modulus and check — fast for 2 congruences in exams.",
        "commonMistake": "Forgetting the solution must be least positive; or moduli not co-prime.",
        "example": {"prompt": "Smallest x with $x \\equiv 1 \\pmod 3$, $x \\equiv 2 \\pmod 5$?", "steps": ["From $x \\equiv 2 \\pmod 5$: $2,7,12,\\ldots$", "$7 \\equiv 1 \\pmod 3$ ✓"], "answer": "$7$"}
      },
      "product-factors": {
        "title": "Product of All Factors",
        "whenToUse": "Product of all divisors of N.",
        "memoryTip": "$$\\text{product} = N^{\\text{(number of factors)}/2}$$",
        "commonMistake": "Using N^factors instead of N^(factors/2).",
        "example": {"prompt": "Product of all factors of 12?", "steps": ["Factors of $12$: $1,2,3,4,6,12$ → count 6.", "$$12^{6/2} = 12^3 = 1728$$"], "answer": "$1728$"}
      },
      "odd-even-factors": {
        "title": "Odd / Even Factor Counts",
        "whenToUse": "Count factors that are odd or even separately.",
        "memoryTip": "Odd factors = drop the 2-power: (b+1)(c+1)…; even factors = total − odd.",
        "commonMistake": "Counting even factors as just the 2-exponent options.",
        "example": {"prompt": "How many even factors does 36 have?", "steps": ["$$36 = 2^2 \\times 3^2$$", "Odd factors: $(2+1) = 3$; total: $(2+1)(2+1) = 9$.", "Even $= 9 - 3 = 6$."], "answer": "$6$"}
      },
      "make-perfect-square": {
        "title": "Making a Number a Perfect Square",
        "whenToUse": "Least multiplier/divisor to turn N into a perfect square.",
        "memoryTip": "Every prime exponent must become even — multiply by the odd-exponent primes.",
        "commonMistake": "Multiplying by the whole square-root instead of the missing factor.",
        "example": {"prompt": "Least number to multiply 180 by to make it a perfect square?", "steps": ["$$180 = 2^2 \\times 3^2 \\times 5$$", "Only $5$ has odd exponent.", "Multiply by $5$ → $900 = 30^2$."], "answer": "$5$"}
      },
      "product-two-factors": {
        "title": "Ways to Write N as Product of Two Factors",
        "whenToUse": "Count ordered/unordered factor pairs of N.",
        "memoryTip": "Unordered pairs: ⌈factors/2⌉ for non-square; (factors+1)/2 … use ceil(factors/2) — covers both.",
        "commonMistake": "Forgetting the (n, n) pair for perfect squares.",
        "example": {"prompt": "In how many ways can 48 be written as a product of two co-prime factors?", "steps": ["$$48 = 2^4 \\times 3$$", "Co-prime split: put $2^4$ and $3$ in different boxes → $2$ ways: $1 \\times 48$, $3 \\times 16$."], "answer": "$2$"}
      },
      "check-primality": {
        "title": "Primality Test",
        "whenToUse": "Deciding if n is prime quickly.",
        "memoryTip": "Check √n with primes only. 2,3,5 filters first.",
        "commonMistake": "Testing all numbers up to n, or all numbers up to √n instead of primes only.",
        "example": {"prompt": "Is 149 prime?", "steps": ["$$\\sqrt{149} \\approx 12.2$$", "Test primes $2,3,5,7,11$: none divide $149$."], "answer": "Yes"}
      },
      "digital-root-square": {
        "title": "Digital Root of a Square",
        "whenToUse": "Checking if N can be a perfect square — squares have digital root 1, 4, 7 or 9.",
        "memoryTip": "Square mod 9 ∈ {0,1,4,7} (digital root 9,1,4,7). Quick reject filter.",
        "commonMistake": "Treating digital root 1 as proof of square — it is only a filter.",
        "example": {"prompt": "Can $123456$ be a perfect square? (digital root check)", "steps": ["Digit sum: $1+2+3+4+5+6 = 21 \\to 3$.", "Squares have digital root $1,4,7,9$ — $3$ is impossible."], "answer": "No"}
      },
      "last-two-five": {
        "title": "Last Two Digits of Powers of 5",
        "whenToUse": "Last two digits of $5^n$ for n ≥ 2 — always 25.",
        "memoryTip": "5² = 25; multiplying by 5 keeps …25 forever.",
        "commonMistake": "Answering 25 for n=1 (that's 5).",
        "example": {"prompt": "Last two digits of $5^{50}$?", "steps": ["$5^2 = 25$, $5^3 = 125$ → last two 25.", "All $n \\geq 2$: last two digits $25$."], "answer": "$25$"}
      }
    }
    return meta

def build_formulas(old_formulas):
    meta = formula_meta()
    out = []
    for f in old_formulas:
        m = meta.get(f['id'], {})
        f = dict(f)
        f['title'] = m.get('title', f.get('title'))
        f['formula'] = m.get('formula', f.get('formula')) or f.get('formula')
        if m.get('whenToUse'): f['whenToUse'] = m['whenToUse']
        if m.get('memoryTip'): f['memoryTip'] = m['memoryTip']
        if m.get('commonMistake'): f['commonMistake'] = m['commonMistake']
        if m.get('example'): f['example'] = m['example']
        out.append(f)
    return out

# ------------------------------------------------------------- PRACTICE -----
# Hand-authored distractor sets live in ns_practice_opts.py (PRACTICE_OPTS +
# REWRITES for the 5 problems whose stored answers were wrong).

from ns_practice_opts import PRACTICE_OPTS, REWRITES
from ns_mcq_upgrade import generate_new, tag_mcq, SUBTOPICS

def convert_practice(practice, opts):
    out = {}
    for fid, problems in practice.items():
        entries = opts.get(fid, [])
        assert len(entries) == len(problems), f"opts count mismatch for {fid}: {len(entries)} vs {len(problems)}"
        converted = []
        for i, (p, e) in enumerate(zip(problems, entries)):
            p = dict(p)
            rw = REWRITES.get((fid, i))
            if rw:
                for k in ('q', 's', 'a'):
                    if k in rw:
                        p[k] = rw[k]
            p['opts'] = e[0:4]
            p['c'] = e[4]
            assert len(p['opts']) == 4 and len(set(p['opts'])) == 4, \
                f"opts not 4-unique for {fid}#{i}"
            assert 0 <= p['c'] < 4, f"c out of range for {fid}#{i}"
            norm = lambda s: re.sub(r'\(.*?\)', '', s).replace('$', '').replace('\\', '').replace(' ', '').lower()
            assert norm(p['opts'][p['c']]) == norm(p['a']), \
                f"opts[c] != answer for {fid}#{i}: {p['opts'][p['c']]} vs {p['a']} (q: {p['q']})"
            converted.append(p)
        out[fid] = converted
    return out

# ---------------------------------------------------------------- MCQS -------
def dedupe_mcqs(mcqs):
    seen = set()
    out = []
    for m in mcqs:
        key = re.sub(r'\s+', ' ', m['q']).strip()
        if key in seen:
            continue
        seen.add(key)
        out.append(m)
    return out

def load():
    with open(SRC, encoding='utf-8') as fh:
        return json.load(fh)

def save(topic):
    with open(SRC, 'w', encoding='utf-8') as fh:
        json.dump(topic, fh, ensure_ascii=False, indent=2)

def build():
    topic = load()
    topic['readingSections'] = READINGS
    topic['formulas'] = build_formulas(topic['formulas'])
    topic['practiceProblems'] = convert_practice(topic['practiceProblems'], PRACTICE_OPTS)

    mcqs = dedupe_mcqs(topic['mcqs'])
    legacy = [m for m in mcqs if m.get('source') != 'Auto-verified']
    seen_q = set(re.sub(r'\s+', ' ', m['q']).strip() for m in legacy)
    tagged = [tag_mcq(m, i) for i, m in enumerate(legacy)]
    fresh = []
    for m in generate_new():
        if re.sub(r'\s+', ' ', m['q']).strip() not in seen_q:
            fresh.append(m)
    topic['mcqs'] = tagged + fresh
    return topic

if __name__ == '__main__':
    import sys
    if '--build' in sys.argv:
        topic = build()
        save(topic)
        from collections import Counter
        print('readings:', len(topic['readingSections']))
        print('formulas:', len(topic['formulas']))
        print('practice keys:', len(topic['practiceProblems']),
              'problems:', sum(len(v) for v in topic['practiceProblems'].values()))
        print('mcqs:', len(topic['mcqs']),
              dict(Counter(m['t'] for m in topic['mcqs'])))
    else:
        print('run: python3 scripts/rebuild_number_system.py --build')
