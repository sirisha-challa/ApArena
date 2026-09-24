#!/usr/bin/env node
// Guarantees: no duplicate questions across the 12-mock series (prelims + mains).
// Normalises question text (lowercase, strip non-alphanumerics) and fails on any repeat.
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

const ROOT = new URL('..', import.meta.url).pathname;
const norm = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '');

const files = readdirSync(join(ROOT, 'data/topics')).filter((f) => /^veda-mock-\d+\.json$/.test(f)).sort();
if (!files.length) { console.error('no mock files found'); process.exit(1); }

const seen = new Map();
let errors = 0;
let total = 0;
for (const f of files) {
  const mock = JSON.parse(readFileSync(join(ROOT, 'data/topics', f), 'utf8'));
  const check = (id, q) => {
    total++;
    const k = norm(q);
    if (k.length < 2) { console.error(`EMPTY/BROKEN [${f}] ${id}: ${q}`); errors++; return; }
    if (seen.has(k)) { console.error(`DUPLICATE\n  first: [${seen.get(k).file}] ${seen.get(k).id}\n  again: [${f}] ${id}\n  text: ${q.slice(0, 90)}`); errors++; }
    else seen.set(k, { file: f, id });
  };
  for (const sec of mock.prelims.sections) for (const q of sec.questions) check(q.id, q.q);
  for (const sec of mock.mains.sections) for (const q of sec.questions) check(q.id, q.q);
}
console.log(`${files.join(', ')} — ${total} questions checked`);
if (errors) { console.error(`FAILED: ${errors} problem(s)`); process.exit(1); }
console.log('OK: all mock questions unique');
