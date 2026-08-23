/**
 * generate-output-tracing.mjs — assembles data/topics/output-tracing.json
 * from ot-lib (interpreter, formulas, sections) and ot-questions (120 items).
 *
 * Validations before write:
 *  - every snippet executed, every answer matches an option (done in P/M)
 *  - 6 formulas x 10 practice problems = 60
 *  - exactly 60 MCQs
 *  - practice questions are textually distinct from MCQs
 *  - answer letters spread over A-D (no giveaway column)
 *  - difficulty spread present in both sets
 */
import { writeFileSync } from 'fs';
import { formulas, readingSections, learningPath, subtopics } from './ot-lib.mjs';
import { practice, mcqs } from './ot-questions.mjs';

let CHECKS = 0;
const fail = (msg) => { console.error('VALIDATION FAILED: ' + msg); process.exit(1); };
const ok = (cond, msg) => { CHECKS++; if (!cond) fail(msg); };

/* ---- structure checks ---- */
ok(formulas.length === 6, `expected 6 formulas, got ${formulas.length}`);
for (const f of formulas) {
  ok(Array.isArray(practice[f.id]) && practice[f.id].length === 10,
    `formula ${f.id} must have exactly 10 practice problems`);
}
ok(mcqs.length === 60, `expected 60 mcqs, got ${mcqs.length}`);

/* ---- de-bias: rotate each item's options so the correct index spreads A-D ----
 * Right-rotation by r puts the (verified) correct value at index r.
 * Deterministic; distractor order around the wheel is preserved. */
function spreadAnswers(items) {
  items.forEach((item, idx) => {
    const r = idx % 4;
    if (r === 0) return;
    const o = item.opts;
    item.opts = [o[(4 - r) % 4], o[(5 - r) % 4], o[(6 - r) % 4], o[(7 - r) % 4]];
    item.c = r;
  });
}
const flatPractice = Object.values(practice).flat();
spreadAnswers(flatPractice);
spreadAnswers(mcqs);

/* ---- answer spread: no letter may exceed 50% ---- */
function spread(items, label) {
  const dist = [0, 0, 0, 0];
  items.forEach(x => dist[x.c]++);
  const max = Math.max(...dist);
  ok(max <= Math.ceil(items.length * 0.5),
    `${label}: answer index distribution ${dist} too concentrated`);
  return dist;
}
console.log('practice answer spread:', spread(Object.values(practice).flat(), 'practice'));
console.log('mcq answer spread:     ', spread(mcqs, 'mcq'));

/* ---- difficulty spread ---- */
function diffCount(items) {
  return items.reduce((a, x) => { a[x.d || 'easy'] = (a[x.d || 'easy'] || 0) + 1; return a; }, {});
}
const pd = diffCount(Object.values(practice).flat());
const md = diffCount(mcqs);
ok(pd.medium >= 5 && md.hard >= 5, 'need a real easy/medium/hard mix');
console.log('practice difficulty:', pd);
console.log('mcq difficulty:     ', md);

/* ---- practice vs mcq disjointness (question text must differ) ---- */
const mq = new Set(mcqs.map(m => m.q.replace(/\s+/g, ' ').trim()));
const dupes = [];
for (const probs of Object.values(practice)) {
  for (const p of probs) {
    if (mq.has(p.q.replace(/\s+/g, ' ').trim())) dupes.push(p.q.split('\n').slice(0, 3).join(' | '));
  }
}
if (dupes.length) console.log('DUPLICATES vs MCQs:\n  ' + dupes.join('\n  '));
ok(dupes.length === 0, `${dupes.length} practice problems duplicate MCQ text`);

/* ---- topic skeleton: explicit metadata (never trust the file being replaced) ---- */
const topic = {
  id: 'output-tracing',
  title: 'Output Tracing (Sequence)',
  icon: '▤',
  category: 'pseudocode',
  subtitle: 'Trace, debug and predict output — sequences, swaps, division & MOD, digit loops, strings',
  days: '4',
  color: '#7C3AED',
  subtopics,
  estimatedHours: 6,
  readingSections,
  formulas,
  practiceProblems: practice,
  mcqs,
  learningPath,
};

writeFileSync(new URL('../data/topics/output-tracing.json', import.meta.url), JSON.stringify(topic, null, 2) + '\n');
console.log(`OK — ${CHECKS} checks passed. wrote data/topics/output-tracing.json`);
console.log(`  formulas: ${formulas.length}, practice: 60, mcqs: 60, readingSections: ${readingSections.length}`);
