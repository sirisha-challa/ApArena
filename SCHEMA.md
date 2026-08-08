# Content schema

ApArena accepts the legacy string fields so existing lessons remain visible. New and revised content should use the structured fields below. This is the supported way to keep prose, formulas, examples, and steps separate.

## Formula

Use an object for every mathematical formula. `latex` is rendered by KaTeX; put all explanatory words in `text`, never inside the LaTeX expression unless they are intentionally written with `\\text{...}`.

```json
{
  "id": "basic-work-rate",
  "title": "Basic work-rate formula",
  "formula": {
    "latex": "W = R \\times T",
    "text": "Work equals rate multiplied by time."
  },
  "whenToUse": "When the question gives any two of work, rate, and time.",
  "explanation": [
    "Let $W$ represent the complete job.",
    "A worker who finishes in $10$ days has rate $R = \\frac{1}{10}$ job per day."
  ],
  "example": {
    "prompt": "A finishes a job in 10 days. Find A's one-day work.",
    "steps": [
      "Use $R = \\frac{1}{T}$.",
      "Substitute $T=10$: $R=\\frac{1}{10}$."
    ],
    "answer": "$\\frac{1}{10}$ of the job per day."
  },
  "memoryTip": "Time and rate move in opposite directions.",
  "commonMistake": "Do not add times; add rates."
}
```

## Lesson section

Use short paragraphs in `content`, and make each subsection a single teachable point. Do not concatenate `Step 1`, `Step 2`, and so on into one string; use a `steps` array for a solution or example.

```json
{
  "id": "intro-work-time",
  "title": "What is work and time?",
  "type": "concept",
  "quickSummary": "Work-rate questions connect output, time, and efficiency.",
  "content": [
    "A work-rate problem asks how quickly a person or group completes a job.",
    "If a person finishes a job in $X$ days, their one-day work is $\\frac{1}{X}$."
  ],
  "subsections": [
    {
      "title": "The core relationship",
      "content": ["Use $W = R \\times T$ to connect the three quantities."],
      "example": {
        "prompt": "A completes a job in 10 days.",
        "steps": ["$R = \\frac{1}{T}$", "$R = \\frac{1}{10}$"],
        "answer": "$\\frac{1}{10}$ job per day"
      }
    }
  ],
  "quickRevision": [
    "Convert time to a one-day rate first.",
    "Add rates for people working together."
  ],
  "companyNote": "These questions are common in placement aptitude tests."
}
```

## Rules

- Delimit inline mathematics with `$...$`; use `$$...$$` (on its own line) for standalone display mathematics in prose.
- Use LaTex commands such as `\\frac`, `\\times`, `\\sqrt`, `^`, `_`, `\\leq`, and `\\text{}`. Do not use Unicode superscripts, `×`, `÷`, or `|` as formula separators in `latex`.
- Keep narrative text out of the `latex` field. Use `text`, `explanation`, `whenToUse`, or `memoryTip` instead.
- Store a sequence as an array (`steps`), not a single paragraph with embedded step labels.
- Use plain text only for titles and icons. Do not include emoji; the interface removes legacy emoji at render time.

## MCQ

Every MCQ carries a difficulty level and may carry optional rich-explanation fields. The renderer shows the explanation only after the user picks an option.

```json
{
  "id": "ns-factors-007",
  "q": "How many factors does $888888$ have?",
  "opts": ["96", "128", "120", "144"],
  "c": 1,
  "d": "medium",
  "t": "factors",
  "source": "Asked in TCS NQT (2022)",
  "exp": ["$888888 = 2^3 \\times 3 \\times 7 \\times 11 \\times 13 \\times 37$.", "Number of factors $= (3+1)(1+1)^5 = 128$."],
  "shortcut": "Use the exponents: factors = product of (exponent + 1).",
  "pattern": "BIG composite numbers in factor questions: prime-factorise completely, never guess."
}
```

Fields:
- `d` — difficulty: `easy` | `medium` | `hard` (drives the easy → medium → hard progression and filter chips).
- `t` — subtopic tag shown as a filter chip (e.g. `divisibility`, `factors`, `remainders`).
- `source` — optional placement/PYQ origin tag shown on the card.
- `exp` — string or array of steps (array renders as numbered steps).
- `shortcut` — optional quick-trick callout in the explanation.
- `pattern` — optional "pattern to spot" callout in the explanation.
- `wrongOptions` — optional explanation of why the distractors are wrong.

## Practice problem (formula-based practice)

10 MCQs per formula. Each formula group is rendered with a "how to use this formula" worked example before its problems.

```json
{
  "q": "Find the number of factors of $72$.",
  "opts": ["6", "10", "12", "18"],
  "c": 2,
  "s": ["$72 = 2^3 \\times 3^2$.", "Number of factors $= (3+1)(2+1) = 12$."],
  "a": "$12$",
  "shortcut": "Prime-factorise, add 1 to each exponent, multiply.",
  "pattern": "Pure factor-count questions are always this pipeline."
}
```

Fields: `opts` + `c` (correct option index) make the problem a MCQ with reveal-on-select; `s` is the step-by-step solution; `a` the final answer. Legacy `{q, s, a}` free-response problems still render with a "Show Solution" button.

## Reading section extras

Optional fields per reading section, rendered as callouts below the prose:

- `tricks` — array of strings: tips, tricks, shortcuts for the section.
- `patterns` — array of strings: patterns to recognise in questions.
- `pyqPatterns` — array of `{source, question, approach}`: previous-year question patterns with the solving approach.
- `companyNote` — string, exam-specific note callout.

## Rules (addition)

- Author exactly N formulas × 10 practice MCQs per topic.
- Target 50–500 MCQs per topic with a clear easy → medium → hard progression.
- Every MCQ answer must be validated by reasoning (and web cross-check where possible) before authoring. Many "official" answers published on the web are wrong.
- Standalone display mathematics must use `$$...$$` (one pair per line) so multi-line derivations stack line-by-line instead of collapsing onto one line. Do NOT use `\[...\]` in prose: the prose renderer escapes backslashes and KaTeX never sees it.
