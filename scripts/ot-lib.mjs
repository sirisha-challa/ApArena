#!/usr/bin/env node
/**
 * generate-output-tracing.mjs
 *
 * Rebuilds data/topics/output-tracing.json:
 *  - 6 formulas, 60 practice problems (10 per formula), 60 validated MCQs,
 *    5 reading sections, learning path.
 *
 * Every question's pseudocode is EXECUTED by a tiny interpreter before the
 * file is written. If a stated answer disagrees with the executed output,
 * the build fails loudly. Nothing ships unverified.
 */
import { readFileSync, writeFileSync } from 'fs';

/* ------------------------------------------------------------------ */
/* Tiny pseudocode interpreter                                          */
/* ------------------------------------------------------------------ */
// Dialect: x = expr | print a[, b...] | IF c THEN / ELSE IF c THEN / ELSE /
// ENDIF | WHILE c / ENDWHILE.  "/" = integer division. Strings in "quotes".

function tokenizeExpr(s) {
  const toks = [];
  let i = 0;
  while (i < s.length) {
    const ch = s[i];
    if (ch === ' ') { i++; continue; }
    if (ch === '"') {
      let j = i + 1, str = '';
      while (j < s.length && s[j] !== '"') { str += s[j]; j++; }
      toks.push({ t: 'str', v: str });
      i = j + 1;
      continue;
    }
    if (/[0-9]/.test(ch)) {
      let j = i, num = '';
      while (j < s.length && /[0-9]/.test(s[j])) { num += s[j]; j++; }
      toks.push({ t: 'num', v: parseInt(num, 10) });
      i = j;
      continue;
    }
    if (/[a-zA-Z_]/.test(ch)) {
      let j = i, name = '';
      while (j < s.length && /[a-zA-Z0-9_]/.test(s[j])) { name += s[j]; j++; }
      toks.push({ t: 'id', v: name });
      i = j;
      continue;
    }
    const two = s.slice(i, i + 2);
    if (['<=', '>=', '==', '!=', '<>'].includes(two)) { toks.push({ t: 'op', v: two === '<>' ? '!=' : two }); i += 2; continue; }
    if ('+-*/%()<>=,'.includes(ch)) { toks.push({ t: 'op', v: ch }); i++; continue; }
    throw new Error('bad char ' + JSON.stringify(ch) + ' in ' + JSON.stringify(s));
  }
  return toks;
}

function evalExpr(src, env) {
  const toks = tokenizeExpr(src);
  let p = 0;
  const peek = () => toks[p];
  const eat = (v) => { if (!toks[p] || toks[p].v !== v) throw new Error(`expected ${v} at ${p} in ${src}`); p++; };

  function primary() {
    const tk = peek();
    if (!tk) throw new Error('unexpected end of ' + src);
    if (tk.t === 'num') { p++; return tk.v; }
    if (tk.t === 'str') { p++; return tk.v; }
    if (tk.t === 'id') {
      p++;
      // bare keywords used as values are not allowed
      if (!(tk.v in env)) throw new Error(`undefined variable ${tk.v} in ${src}`);
      return env[tk.v];
    }
    if (tk.v === '(') { eat('('); const v = orExpr(); eat(')'); return v; }
    if (tk.v === '-') { eat('-'); return -primaryNum(); }
    throw new Error('unexpected token ' + JSON.stringify(tk) + ' in ' + src);
  }
  function primaryNum() { const v = primary(); if (typeof v !== 'number') throw new Error('unary - on non-number'); return v; }

  function mul() {
    let v = primary();
    while (peek() && (
      (peek().t === 'op' && ['*', '/', '%'].includes(peek().v)) ||
      (peek().t === 'id' && ['MOD', 'DIV'].includes(peek().v))
    )) {
      const tk = toks[p++];
      const op = tk.t === 'id' ? (tk.v === 'MOD' ? '%' : '/') : tk.v;
      const r = primary();
      if (typeof v !== 'number' || typeof r !== 'number') throw new Error('arith on string in ');
      if (op === '*') v = v * r;
      else if (op === '/') v = Math.trunc(v / r);   // integer division
      else v = ((v % r) + r) % r;                   // MOD, sign-safe
    }
    return v;
  }
  function add() {
    let v = mul();
    while (peek() && peek().t === 'op' && ['+', '-'].includes(peek().v)) {
      const op = toks[p++].v;
      const r = mul();
      if (op === '+') {
        if (typeof v === 'string' || typeof r === 'string') {
          if (typeof v !== typeof r) throw new Error('string+number mix in ' + src);
          v = v + r;                                // concatenation
        } else v = v + r;
      } else {
        if (typeof v !== 'number' || typeof r !== 'number') throw new Error('subtract on string in ' + src);
        v = v - r;
      }
    }
    return v;
  }
  function rel() {
    let v = add();
    while (peek() && peek().t === 'op' && ['<', '<=', '>', '>=', '==', '!='].includes(peek().v)) {
      const op = toks[p++].v;
      const r = add();
      switch (op) {
        case '<': v = v < r; break; case '<=': v = v <= r; break;
        case '>': v = v > r; break; case '>=': v = v >= r; break;
        case '==': v = v === r; break; case '!=': v = v !== r; break;
      }
    }
    return v;
  }
  function andExpr() {
    let v = rel();
    while (peek() && peek().t === 'id' && peek().v === 'AND') { p++; const r = rel(); v = v && r; }
    return v;
  }
  function orExpr() {
    let v = andExpr();
    while (peek() && peek().t === 'id' && peek().v === 'OR') { p++; const r = andExpr(); v = v || r; }
    return v;
  }

  const out = orExpr();
  if (p !== toks.length) throw new Error('trailing tokens in ' + src);
  return out;
}

const isStrLit = (s) => /^"[^"]*"$/.test(s.trim());

/** Execute pseudocode; returns array of printed lines (strings). */
export function runTrace(code) {
  const lines = code.split('\n').map(l => l.trim()).filter(Boolean);
  const env = {};
  const out = [];
  let i = 0;

  function block(until) {
    while (i < lines.length) {
      const ln = lines[i];
      if (until && until.test(ln)) return;
      execLine(ln);
    }
    if (until) throw new Error('missing closer ' + until + ' after: ' + lines.slice(0, i).join(' | '));
  }

  function execLine(ln) {
    let m;
    if ((m = ln.match(/^IF\s+(.+?)\s+THEN$/i))) {
      i++;
      const taken = !!evalExpr(m[1], env);
      if (taken) { block(/^(ELSE|ELSE\s*IF|END\s*IF)/i); skipToElseEndif(); }
      else { skipToElseOrEndif(); runElseTail(); }
      return;
    }
    if (/^(ELSE|END\s*IF|ENDIF)/i.test(ln)) throw new Error('unexpected ' + ln);
    if ((m = ln.match(/^WHILE\s+(.+)$/i))) {
      i++;
      const start = i;
      let guard = 0;
      while (evalExpr(m[1], env)) {
        i = start; block(/^ENDWHILE$/i);
        if (++guard > 100000) throw new Error('possible infinite loop');
      }
      // loop finished: skip past the body WITHOUT executing it again
      i = start;
      let depth = 0;
      while (i < lines.length) {
        const l = lines[i];
        if (/^WHILE\b/i.test(l)) depth++;
        else if (/^ENDWHILE$/i.test(l)) { if (depth === 0) { i++; return; } depth--; }
        i++;
      }
      throw new Error('missing ENDWHILE');
    }
    if (/^ENDWHILE$/i.test(ln)) throw new Error('unexpected ENDWHILE');
    if ((m = ln.match(/^print\s+(.+)$/i))) {
      i++;
      const parts = splitArgs(m[1]).map(a => show(evalExpr(a, env)));
      out.push(parts.join(', '));
      return;
    }
    if ((m = ln.match(/^(?:SET\s+)?([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*(.+)$/))) {
      i++;
      env[m[1]] = evalExpr(m[2], env);
      return;
    }
    throw new Error('cannot parse line: ' + JSON.stringify(ln));
  }
  function runElseTail() {
    // we are positioned at ELSE / ELSEIF / ENDIF
    if (i >= lines.length) throw new Error('missing ENDIF');
    if (/^ELSE\s*IF/i.test(lines[i])) {
      const m = lines[i].match(/^ELSE\s*IF\s+(.+?)\s+THEN$/i);
      i++;
      if (evalExpr(m[1], env)) { block(/^(ELSE|ELSE\s*IF|END\s*IF)/i); skipToElseEndif(); }
      else { skipToElseOrEndif(); runElseTail(); }
      return;
    }
    if (/^ELSE$/i.test(lines[i])) {
      i++;
      block(/^END\s*IF$/i);
    }
    if (/^END\s*IF$/i.test(lines[i])) i++;
  }
  function skipToElseOrEndif() {
    let depth = 0;
    while (i < lines.length) {
      const l = lines[i];
      if (/^IF\b/i.test(l)) depth++;
      else if (/^END\s*IF$/i.test(l)) { if (depth === 0) return; depth--; }
      else if (depth === 0 && /^(ELSE|ELSE\s*IF)\b/i.test(l)) return;
      i++;
    }
    throw new Error('missing ENDIF');
  }
  function skipToElseEndif() {
    let depth = 0;
    while (i < lines.length) {
      const l = lines[i];
      if (/^IF\b/i.test(l)) depth++;
      else if (/^END\s*IF$/i.test(l)) { if (depth === 0) { i++; return; } depth--; }
      i++;
    }
    throw new Error('missing ENDIF');
  }

  block(null);
  return out;
}

function splitArgs(s) {
  const parts = []; let depth = 0, cur = '', inStr = false;
  for (const ch of s) {
    if (ch === '"') inStr = !inStr;
    if (!inStr && ch === '(') depth++;
    if (!inStr && ch === ')') depth--;
    if (!inStr && ch === ',' && depth === 0) { parts.push(cur); cur = ''; continue; }
    cur += ch;
  }
  if (cur.trim()) parts.push(cur);
  return parts.map(x => x.trim());
}

function show(v) {
  if (typeof v === 'boolean') return v ? 'true' : 'false';
  return String(v);
}

/** Normalize a printed line to the option format used in the banks. */
function normPrint(line) {
  return line.split(',').map(x => x.trim()).join(', ');
}
/** Full program output as one flat string, prints joined by ', '. */
const computedAnswer = (code) => runTrace(code).map(normPrint).join(', ');

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */
let CHECKS = 0;
function check(cond, msg) {
  CHECKS++;
  if (!cond) { console.error('VALIDATION FAILED: ' + msg); process.exit(1); }
}
function assertOutput(code, expected, label) {
  const got = computedAnswer(code);
  check(got === expected, `${label}: code prints "${got}" but expected "${expected}"`);
}

/* Build one practice problem. Verifies code -> correct option. */
let PID = 0;
function P(fid, q, opts, correctIdx, s, extra = {}) {
  PID++;
  const got = computedAnswer(q);
  check(opts[correctIdx] === got,
    `practice ${fid}#${PID}: option "${opts[correctIdx]}" != executed "${got}"`);
  check(new Set(opts).size === 4, `practice ${fid}#${PID}: duplicate options`);
  return { q, opts, c: correctIdx, s, a: opts[correctIdx], ...extra };
}

/* Build one MCQ. Same verification. */
let MID = 0;
function M(q, opts, correctIdx, d, t, exp, extra = {}) {
  MID++;
  const got = computedAnswer(q);
  check(opts[correctIdx] === got,
    `mcq #${MID}: option "${opts[correctIdx]}" != executed "${got}"`);
  check(new Set(opts).size === 4, `mcq #${MID}: duplicate options`);
  return { id: MID, q, opts, c: correctIdx, d, t, exp, ...extra };
}

/* ------------------------------------------------------------------ */
/* FORMULAS                                                            */
/* ------------------------------------------------------------------ */
const formulas = [
  {
    id: 'seq-overwrite',
    title: 'Sequential Overwrite Rule',
    formula: 'Read top to bottom. Each assignment uses the CURRENT values and immediately replaces the old ones.',
    whenToUse: 'Any trace where variables are assigned and reassigned down the page.',
    explanation: [
      'Execute lines strictly in order. On every assignment, first evaluate the right-hand side with the CURRENT variable values.',
      'Only after the whole right side is evaluated does the result replace the left-side variable. Old values are gone instantly.',
      '$x = y$ copies the value of $y$ INTO $x$. $y$ keeps its value. The direction matters: $x = y$ and $y = x$ are different.',
      'A later $\\text{print}$ always reports the latest value, never a historical one.'
    ],
    example: {
      prompt: 'x = 3\ny = x + 4\nx = y * 2\nprint x, y',
      steps: [
        '$x = 3$.',
        '$y = x + 4 = 3 + 4 = 7$ (uses current $x = 3$).',
        '$x = y \\times 2 = 7 \\times 2 = 14$ (uses current $y = 7$; old $x = 3$ is gone).',
        'print shows $x = 14$, $y = 7$.'
      ],
      answer: '14, 7'
    },
    memoryTip: 'Right side first, left side last. A variable never remembers its past.',
    commonMistake: 'Using the NEW value of the left-side variable while evaluating its own right side, e.g. treating x = y * 2 with stale y. Always evaluate fully, then store.'
  },
  {
    id: 'swap-temp',
    title: 'Temp-Swap Rule',
    formula: 'temp = a; a = b; b = temp  =>  values exchange',
    whenToUse: 'Traces that copy one variable into a temporary holder before exchanging two values.',
    explanation: [
      'A real swap needs three moves: save ONE old value in temp, overwrite it with the other variable, then restore the saved value into the second slot.',
      '$b = a$ (without temp) destroys the original $b$: afterwards both hold the old $a$. Two identical values usually means the trap was $m = n;\\ n = m$.',
      'After any genuine swap of $a$ and $b$: $a + b$ and $a \\times b$ are unchanged, because addition and multiplication ignore order.'
    ],
    example: {
      prompt: 'a = 4\nb = 9\ntemp = a\na = b\nb = temp\nprint a + b',
      steps: [
        '$temp = 4$ saves the old $a$.',
        '$a = 9$, so now $a$ holds the old $b$.',
        '$b = temp = 4$ restores the old $a$.',
        'The pair swapped: $(9, 4)$. Sum $= 13$.'
      ],
      answer: '13'
    },
    memoryTip: 'Save one, move the other, put the saved one back.',
    commonMistake: 'Believing m = n followed by n = m swaps anything. After those two lines both variables hold the old n.'
  },
  {
    id: 'arith-swap',
    title: 'Arithmetic Swap Rule',
    formula: 'a = a + b;  b = a - b;  a = a - b   =>   a and b exchange',
    whenToUse: 'Swaps done with plus/minus instead of a third variable — very common in placement papers.',
    explanation: [
      'After $a = a + b$, the variable $a$ holds the sum $S = a_{old} + b_{old}$.',
      '$b = a - b = S - b_{old} = a_{old}$: the first slot is recovered into $b$.',
      '$a = a - b = S - a_{old} = b_{old}$: the second slot lands back in $a$. Swapped.',
      'The multiply version works identically: $a{=}a{\\times}b;\\ b{=}a{/}b;\\ a{=}a{/}b$ (needs all values nonzero).'
    ],
    example: {
      prompt: 'p = 12\nq = 5\np = p + q\nq = p - q\np = p - q\nprint p, q',
      steps: [
        '$p = 12 + 5 = 17$ (the sum).',
        '$q = 17 - 5 = 12$ (old $p$).',
        '$p = 17 - 12 = 5$ (old $q$).',
        'Final: $p = 5$, $q = 12$.'
      ],
      answer: '5, 12'
    },
    memoryTip: 'Sum stores both. Subtract to peel off first one, then the other.',
    commonMistake: 'Stopping after two lines, or subtracting in the wrong order. Line 2 recovers the OLD FIRST value, line 3 the OLD SECOND.'
  },
  {
    id: 'div-mod-pair',
    title: 'DIV-MOD Pairing Rule',
    formula: 'n = k * (n / k) + (n MOD k)',
    whenToUse: 'Any trace using integer division and MOD together, especially splitting numbers by 10 or 100.',
    explanation: [
      'In placement pseudocode, $/$ between integers discards the fractional part: $17 / 5 = 3$. MOD keeps only the remainder: $17 \\bmod 5 = 2$.',
      'Quotient and remainder always recombine exactly: $k \\times (n / k) + (n \\bmod k) = n$. If a trace builds an expression of this shape, the printed value equals the original number.',
      'With $k = 10$: $n / 10$ chops the last digit, $n \\bmod 10$ IS the last digit.',
      'With $k = 100$: $n / 100$ removes the last TWO digits, $n \\bmod 100$ keeps the last two.',
      'Division and MOD bind at the same strength as multiplication — evaluate them left to right with $\\times$ and $+$.'
    ],
    example: {
      prompt: 'n = 456\na = n / 10\nb = n MOD 10\nc = a * 10 + b\nprint c',
      steps: [
        '$a = 456 / 10 = 45$ (last digit dropped).',
        '$b = 456 \\bmod 10 = 6$ (last digit kept).',
        '$c = 45 \\times 10 + 6 = 456$ — the original number rebuilt.',
        'print shows 456.'
      ],
      answer: '456'
    },
    memoryTip: '/ deletes digits from the right; MOD harvests them.',
    commonMistake: 'Treating 7 / 2 as 3.5 or rounding 3.5 up to 4. Integer division truncates: 7 / 2 = 3, and 3 MOD 5 = 3 (remainder equals the number itself when it is smaller).'
  },
  {
    id: 'digit-loop',
    title: 'Digit Loop Accumulators',
    formula: 'WHILE n > 0: digit = n MOD 10; acc = f(acc, digit); n = n / 10',
    whenToUse: 'Traces that loop over digits to build a sum, product, count or reversed number.',
    explanation: [
      'Every pass peels the LAST digit ($n \\bmod 10$) and shrinks $n$ by one digit ($n / 10$). The loop ends when $n = 0$ — the final pass processes the leading digit.',
      'Sum accumulator: $s = s + digit$. Product: $p = p \\times digit$ (start $p$ at 1, not 0). Count: $c = c + 1$ counts digits.',
      'Reversal accumulator: $rev = rev \\times 10 + digit$ appends each new digit to the right. Tracing 1234 gives $4 \\to 43 \\to 432 \\to 4321$.',
      'Number of iterations = number of digits. A $d$-digit number loops exactly $d$ times.'
    ],
    example: {
      prompt: 'n = 231\nrev = 0\nWHILE n > 0\n  d = n MOD 10\n  rev = rev * 10 + d\n  n = n / 10\nENDWHILE\nprint rev',
      steps: [
        'Pass 1: $d = 1$, $rev = 0 \\times 10 + 1 = 1$, $n = 23$.',
        'Pass 2: $d = 3$, $rev = 1 \\times 10 + 3 = 13$, $n = 2$.',
        'Pass 3: $d = 2$, $rev = 13 \\times 10 + 2 = 132$, $n = 0$. Loop ends.',
        'print shows 132.'
      ],
      answer: '132'
    },
    memoryTip: 'MOD grabs, DIV shrinks, accumulator rebuilds.',
    commonMistake: 'Starting a product accumulator at 0 (it stays 0 forever), or forgetting the loop also runs for the last (single-digit) value of n — that final digit IS processed.'
  },
  {
    id: 'string-concat',
    title: 'String Concatenation Rule',
    formula: '"a" + "b" = "ab"   (glue, never add)',
    whenToUse: 'Traces where quoted text values are combined or compared with numeric results.',
    explanation: [
      'Values written in quotes are TEXT. Joining two texts glues them character by character: $"12" + "3" = "123"$, not $15$.',
      'Gluing never simplifies: leading zeros survive ($"07" + "5" = "075"$) and order matters ($"ab" + "c" \\ne "c" + "ab"$).',
      'The length of a concatenation is the sum of lengths: $LEN(s + t) = LEN(s) + LEN(t)$.',
      'If a question mixes both, it prints the STRING result in one branch and the NUMBER result in another — evaluate each branch separately.'
    ],
    example: {
      prompt: 'a = "9"\nb = "10"\nc = a + b\nd = 9 + 10\nprint c, d',
      steps: [
        '$c = "9" + "10" = "910"$ (text glue).',
        '$d = 9 + 10 = 19$ (numeric add).',
        'Same digits, different meaning — print shows both.',
        ''
      ],
      answer: '910, 19'
    },
    memoryTip: 'Quotes mean glue. No quotes means add.',
    commonMistake: 'Adding glued text numerically ("910" read as 19), or dropping a leading zero when it is part of the text.'
  }
];

/* ------------------------------------------------------------------ */
/* READING SECTIONS                                                    */
/* ------------------------------------------------------------------ */
const readingSections = [
  {
    id: 'intro-output-tracing',
    title: 'What Is Output Tracing?',
    type: 'concept',
    quickSummary: 'Output tracing is executing short pseudocode on paper and predicting exactly what it prints.',
    content: [
      'Output tracing (also called "predict the output" or dry running) asks you to act as the computer: read the pseudocode line by line, track every variable, and state exactly what gets printed.',
      'These questions appear in TCS NQT, Infosys, Wipro, Capgemini, Accenture and Cocubes tests. They look like programming but are really bookkeeping: no creativity is needed, only careful tracking.',
      'The whole skill reduces to one discipline — never do two lines in your head at once.'
    ],
    subsections: [
      {
        title: 'What a computer actually does',
        content: 'It keeps one box per variable holding the CURRENT value. Every assignment evaluates the right-hand side completely, then overwrites the box on the left. Every print reports the boxes AT THAT MOMENT. Nothing is remembered beyond that.'
      },
      {
        title: 'The two failure modes',
        content: 'Candidates fail tracing in exactly two ways. First, direction errors: reading x = y as "y becomes x". Second, staleness errors: using an outdated value after a variable was overwritten. Both vanish when you write states down instead of memorising them.'
      },
      {
        title: 'Why examiners love this topic',
        content: 'One small snippet separates careful readers from fast guessers in under a minute. That is why the same six or seven patterns — assignment chains, swaps, division/MOD, digit loops, string glue, condition branches — recur in every drive.'
      }
    ],
    quickRevision: [
      'Trace = execute, do not read holistically.',
      'One line per row; record every change.',
      'Print shows the current value, never the history.'
    ],
    companyNote: 'Expect 3-6 output-tracing questions in service-company exams; they are among the fastest marks available if you write the trace out.'
  },
  {
    id: 'trace-table-method',
    title: 'The Trace Table Method',
    type: 'concept',
    quickSummary: 'A four-step paper routine that turns any trace into mechanical bookkeeping.',
    content: [
      'A trace table is a scratch grid with one column per changing variable plus one column for output. You fill one row per executed line (or per loop pass). It is slower than guessing for one line and much faster than repairing a wrong answer.',
      'THE ROUTINE:\nStep 1 — List every variable that appears as columns.\nStep 2 — Execute one line at a time. After each line, cross out changed values and write the new ones.\nStep 3 — When a print runs, copy the exact current values into an OUTPUT column.\nStep 4 — Answer from the output column, never from memory.'
    ],
    subsections: [
      {
        title: 'Worked trace table',
        content: 'a = 5\nb = 2\na = a * b\nb = a - b\nprint a, b\n\nRow-by-row:\na=5, b=2  (after line 1)\na=5, b=2  (after line 2)\na=10, b=2 (line 3: a = 5 * 2)\na=10, b=8 (line 4: b = 10 - 2)\nOUTPUT: 10, 8'
      },
      {
        title: 'Loop rows: one row per PASS',
        content: 'WHILE n > 0\n  print n MOD 10\n  n = n / 10\nENDWHILE\nwith n = 47:\nn=47 -> prints 7, n becomes 4\nn=4  -> prints 4, n becomes 0\nstop (0 > 0 is false).\nOUTPUT: 7 then 4. Two passes, two rows — never merge them.'
      },
      {
        title: 'Mark conventions before you start',
        content: 'Circle whether "/" is integer division here. Note whether indices start at 0 or 1 if arrays appear. Underline the exact print statement being asked about — some snippets print several things and ask for only one.'
      }
    ],
    quickRevision: [
      'Columns = variables. Rows = lines or passes.',
      'Copy print outputs verbatim into an OUTPUT column.',
      'Answer from paper, not from your head.'
    ],
    patterns: [
      'Predict-the-output: trace until the print.',
      'Count-iterations: count TRUE condition checks.',
      'Final-variable-value: read the column after the last executed line.'
    ]
  },
  {
    id: 'sequence-precedence',
    title: 'Assignments, Overwrites & Operator Order',
    type: 'concept',
    quickSummary: 'Right side first, left side last; multiplication binds tighter than addition.',
    content: [
      'Assignment is not algebra. x = x + 3 means "take the current x, add 3, store back into x". The old x disappears the instant the store completes.',
      'Direction test: in A = B, only A changes. Read it as "A receives B". If you catch yourself thinking "B becomes A", stop and re-read.'
    ],
    subsections: [
      {
        title: 'Precedence ladder for arithmetic',
        content: 'Highest to lowest: brackets ( ), then unary minus, then * / MOD (equal rank, evaluated left to right), then + - (left to right).\na = 2 + 3 * 4       -> 2 + 12 = 14\nb = 20 / 2 / 5      -> 10 / 5 = 2 (left to right!)\nc = 2 + 3 MOD 4     -> 2 + 3 = 5 (MOD before +)'
      },
      {
        title: 'Chained overwrites',
        content: 'x = 10\ny = x + 5\nx = x + 20\nz = x + y\nLine by line: y uses OLD x -> y = 15. Then x grows to 30. Finally z = 30 + 15 = 45. z mixes the new x with the y frozen earlier — a classic exam shape.'
      },
      {
        title: 'Self-reference shortcuts',
        content: 'n = n * 2 doubles. s = s + v accumulates. These are safe ONLY because the right side finishes evaluating before the store happens. If you ever need the old value AFTER overwriting, you needed a temp variable.'
      }
    ],
    quickRevision: [
      'A = B changes only A.',
      '* / MOD before + -, equal ranks go left to right.',
      'Each print sees the latest values only.'
    ],
    pyqPatterns: [
      { source: 'Pattern seen in TCS NQT-style papers', question: 'Three-variable chain ending in a mixed sum (new + frozen values)', approach: 'Freeze y at its creation moment; only x continues to evolve.' }
    ]
  },
  {
    id: 'div-mod-digits',
    title: 'Division, MOD & Digit Loops',
    type: 'concept',
    quickSummary: 'Integer division truncates; MOD keeps the remainder; together they walk a number digit by digit.',
    content: [
      'Placement pseudocode uses integer division: both operands are whole numbers, the fraction is thrown away. 17 / 5 = 3, never 3.4, never rounded.',
      'MOD answers "what is left after removing all whole ks": 17 MOD 5 = 2. If the left value is smaller, the remainder is itself: 3 MOD 5 = 3.',
      'Identity to memorise: k * (n / k) + (n MOD k) = n. Questions love printing this rebuilt form — it always collapses to the original n.'
    ],
    subsections: [
      {
        title: 'Base-10 superpowers',
        content: 'n MOD 10 = last digit. n / 10 = number minus its last digit. n MOD 100 = last two digits. n / 100 = number minus its last two digits.\nn = 3407: n MOD 10 = 7, n / 10 = 340, n MOD 100 = 7 (since 3407 MOD 100 looks at 07), n / 100 = 34.'
      },
      {
        title: 'The digit-walk loop',
        content: 'WHILE n > 0\n  d = n MOD 10\n  n = n / 10\nENDWHILE\nruns exactly (digit count of n) times. Inside the loop, d walks the digits right to left: for 592 you see 2, 9, 5.'
      },
      {
        title: 'Four standard accumulators',
        content: 'sum = sum + d      -> digit sum (592 -> 16)\nprod = prod * d    -> digit product (start prod = 1; 592 -> 90)\ncount = count + 1  -> digit count (592 -> 3)\nrev = rev*10 + d   -> reversed number (592 -> 295)\nAll four finish when n hits 0. The failed final check is NOT an iteration.'
      }
    ],
    quickRevision: [
      '7 / 2 = 3 and 3 MOD 5 = 3.',
      'Loop passes = digit count.',
      'rev = rev * 10 + d reverses; s = s + d sums.'
    ],
    companyNote: 'Digit-sum and reversal traces are the two most repeated output questions across TCS, Infosys and Accenture papers.'
  },
  {
    id: 'swaps-strings-checklist',
    title: 'Swaps, String Glue & the Exam Checklist',
    type: 'concept',
    quickSummary: 'Recognise the swap family instantly; treat quoted values as untouchable text.',
    content: [
      'Swap questions come in two costumes. With temp: temp = a; a = b; b = temp genuinely exchanges. Without temp: a = a+b; b = a-b; a = a-b also exchanges. Fake swap: m = n; n = m leaves BOTH holding the old n.',
      'Fast tell: after a REAL swap, a+b is unchanged. Compute the sum mentally — if a variant breaks the sum, someone overwrote a value early.'
    ],
    subsections: [
      {
        title: 'String glue rules',
        content: 'Anything in quotes is text. + between texts joins them: "go" + "ld" = "gold". Numbers inside quotes are inert: "5" + "3" = "53", while 5 + 3 = 8. LEN("gold") = 4; gluing adds lengths.'
      },
      {
        title: 'Branch discipline for IF questions',
        content: 'Evaluate conditions top-down and enter exactly ONE branch. Boundary values satisfy >= checks: score = 75 enters "score >= 75", not "score >= 90". Never execute two branches.'
      },
      {
        title: 'The 30-second pre-flight checklist',
        content: 'Before tracing any snippet:\n1. Is / integer division here? (Almost always yes.)\n2. Any quoted values? Mark them TEXT.\n3. Which print is the question asking about?\n4. Loop bounds: does it start at 0 or 1, end at n or n-1?\n5. Direction check on every assignment: left receives right.'
      }
    ],
    quickRevision: [
      'Real swap preserves a + b; fake swap duplicates.',
      'Quotes = glue, no quotes = arithmetic.',
      'One branch per IF chain; >= swallows the boundary.'
    ],
    patterns: [
      'Swap variants differing by one line — spot which move is missing.',
      'Mixed prints: string result and numeric result of "similar" inputs.',
      'Boundary-value branches (exactly equal to the threshold).'
    ]
  }
];

const learningPath = [
  { type: 'concept', sectionId: 'intro-output-tracing' },
  { type: 'concept', sectionId: 'trace-table-method' },
  { type: 'concept', sectionId: 'sequence-precedence' },
  { type: 'concept', sectionId: 'div-mod-digits' },
  { type: 'concept', sectionId: 'swaps-strings-checklist' },
  { type: 'practice', sectionId: 'mcq-practice' },
  { type: 'mastery', sectionId: 'speed-drill' }
];

const subtopics = [
  'Assignments & Overwrites',
  'Swaps (Temp & Arithmetic)',
  'Operator Precedence',
  'Integer Division & MOD',
  'Digit Extraction Loops',
  'String Concatenation'
];

export { formulas, readingSections, learningPath, subtopics, computedAnswer, P, M };
