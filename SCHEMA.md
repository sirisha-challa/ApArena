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

- Delimit inline mathematics with `$...$`; use `\\[...\\]` only for standalone display mathematics in prose.
- Use LaTex commands such as `\\frac`, `\\times`, `\\sqrt`, `^`, `_`, `\\leq`, and `\\text{}`. Do not use Unicode superscripts, `×`, `÷`, or `|` as formula separators in `latex`.
- Keep narrative text out of the `latex` field. Use `text`, `explanation`, `whenToUse`, or `memoryTip` instead.
- Store a sequence as an array (`steps`), not a single paragraph with embedded step labels.
- Use plain text only for titles and icons. Do not include emoji; the interface removes legacy emoji at render time.
