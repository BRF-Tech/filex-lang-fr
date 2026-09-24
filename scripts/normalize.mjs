#!/usr/bin/env node
/**
 * normalize.mjs — apply French typography to a filex language pack, deterministically.
 *
 *   node scripts/normalize.mjs [--file translations/fr.json] [--dry-run]
 *
 * Translators (human or AI) write ordinary spaces before `: ; ! ?` and inside « », and either
 * apostrophe; this script turns them into the convention in glossary.md → Typography:
 *
 *   U+00A0 NO-BREAK SPACE          before `:`, and inside « guillemets »
 *   U+202F NARROW NO-BREAK SPACE   before `;` `!` `?`
 *   ’ (U+2019)                     for the apostrophe between two letters
 *   “…” and "…"                    become « … »
 *
 * Only PROSE is touched. Masked first, and restored untouched:
 *   `code spans`, {placeholders} and {'@'} literals, <tags>, URLs and scheme paths
 *   (https://…, storage://folder), tag:/plugin:/data:/mailto: syntax, times (12:30),
 *   Windows drive letters (Z:), key combos (Ctrl+K).
 * A rule only fires when the punctuation is followed by whitespace, the end of the string or a
 * masked token, so `!important`, `:root`, `host:port` and the like are never split.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const argv = process.argv.slice(2);
const opt = (n, d) => (argv.includes(n) && argv[argv.indexOf(n) + 1]) || d;
const FILE = path.resolve(opt('--file', path.join(here, '..', 'translations', 'fr.json')));
const DRY = argv.includes('--dry-run');

const NBSP = ' ';
const NNBSP = ' ';
const PROTECT = new RegExp(
  [
    '`[^`]*`', // code spans
    "\\{[^{}]*\\}", // placeholders, {'@'} literals
    '\\b[A-Za-z_][\\w-]*:(?=<)', // a scheme prefix in front of an <angle> token: root:<storage>://<folder>
    '<[^<>\\s][^<>]*>', // tags
    '\\b[\\w.+-]+://\\S*', // scheme URLs / storage paths
    '\\b(?:https?|mailto|data|tag|plugin|urn|ldaps?|smb|nfs|s3|sftp|ftps?):[^\\s,;)»]*', // syntax
    '\\d+:\\d+', // times, ports after digits
    '(?<![\\p{L}\\p{N}])[A-Z]:(?=[\\\\\\s]|$)', // drive letters
    '\\b(?:Ctrl|Cmd|Alt|Shift|Mod|Meta|Option)\\+[^\\s,.;)]+', // key combos
  ].join('|'),
  'gu',
);
const M0 = '';
const M1 = '';

export function frenchTypography(text) {
  const saved = [];
  let s = text.replace(PROTECT, (m) => {
    saved.push(m);
    return `${M0}${saved.length - 1}${M1}`;
  });
  const after = `(?=\\s|$|${M0}|[)\\]»])`;

  // quotation marks → guillemets
  s = s.replace(/“\s*/g, `«${NBSP}`).replace(/\s*”/g, `${NBSP}»`);
  s = s.replace(/"([^"\n]+)"/g, (_, inner) => `«${NBSP}${inner.trim()}${NBSP}»`);
  s = s.replace(/«[   ]*/g, `«${NBSP}`).replace(/[   ]*»/g, `${NBSP}»`);

  // space before : ; ! ?
  s = s.replace(new RegExp(`[ \\u00A0\\u202F]+:${after}`, 'gu'), `${NBSP}:`);
  s = s.replace(new RegExp(`[ \\u00A0\\u202F]+([;!?])${after}`, 'gu'), `${NNBSP}$1`);
  s = s.replace(new RegExp(`([\\p{L}\\p{N})»${M1}])([;!?]+)${after}`, 'gu'), `$1${NNBSP}$2`);
  s = s.replace(new RegExp(`([\\p{L})»${M1}]):${after}`, 'gu'), `$1${NBSP}:`);

  // apostrophe
  s = s.replace(/(\p{L})'(\p{L})/gu, '$1’$2');

  return s.replace(new RegExp(`${M0}(\\d+)${M1}`, 'g'), (_, i) => saved[Number(i)]);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const pack = JSON.parse(fs.readFileSync(FILE, 'utf8'));
  let changed = 0;
  const out = {};
  for (const [k, v] of Object.entries(pack)) {
    const n = typeof v === 'string' ? frenchTypography(v) : v;
    if (n !== v) {
      changed++;
      if (DRY) console.log(`${k}\n  - ${JSON.stringify(v)}\n  + ${JSON.stringify(n)}`);
    }
    out[k] = n;
  }
  if (!DRY) fs.writeFileSync(FILE, JSON.stringify(out, null, 2) + '\n');
  console.log(`${DRY ? 'would change' : 'changed'} ${changed} of ${Object.keys(pack).length} strings in ${FILE}`);
}
