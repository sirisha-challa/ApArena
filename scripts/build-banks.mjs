#!/usr/bin/env node
// ponytail: DRY bank pages — single template -> 9 index.html files. Keeps Vercel static (no build step) but removes 9-way duplication.
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const ROOT = new URL('..', import.meta.url).pathname;
const banks = JSON.parse(readFileSync(join(ROOT, 'data/banks.json'), 'utf8')).banks;
const tmpl = readFileSync(join(ROOT, 'templates/bank.html'), 'utf8');

let ok=0;
for (const b of banks){
  const html = tmpl
    .replaceAll('{{BANK_ID}}', b.id)
    .replaceAll('{{TITLE}}', b.title)
    .replaceAll('{{SUBTITLE}}', b.subtitle);
  const dir = join(ROOT, b.id);
  if(!existsSync(dir)) mkdirSync(dir, {recursive:true});
  writeFileSync(join(dir, 'index.html'), html);
  console.log(`wrote ${b.id}/index.html`);
  ok++;
}
console.log(`done ${ok} banks`);
