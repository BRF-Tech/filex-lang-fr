#!/usr/bin/env node
/**
 * validate-fr.mjs — the French-specific check of translations/fr.json.
 *
 *   node scripts/validate-fr.mjs [--src ../filex] [--file translations/fr.json]
 *                                [--lengths] [--no-compiler] [--quiet-warnings] [--partial]
 *
 * It complements scripts/validate.mjs (the platform validator, copied verbatim from filex): the
 * same syntax checks per catalogue, plus what only a French pack needs — the vous register, the
 * glossary, French typography (non-breaking spaces, guillemets, apostrophe) and a length report.
 *
 * English source, in this order:
 *   --src <dir>   a filex checkout: web/src/locales/en.json (admin SPA, vue-i18n, nested) and
 *                 packages/core/src/locales/en.ts (explorer + shared components, flat, plain `{var}`);
 *   $FILEX_SRC    the same;
 *   catalogue/    otherwise: this repository's filex-catalogue-en.json + -context.json, whose `in`
 *                 field (explorer / admin / both) says which renderer draws each key.
 * vue-i18n's parser (`@intlify/message-compiler`) is taken from this repository's node_modules
 * (`npm install`) or from the checkout's; without either, a regex fallback runs.
 *
 * --file    the pack: ONE flat object { "<dotted key>": "<text>" } covering both catalogues.
 * --partial check only the keys the file contains (no MISSING errors) — for a chunk in progress.
 *
 * Adapted from the Spanish pack's validator.
 *
 * The two catalogues are rendered by different engines, so the syntax rules differ per key:
 *   admin SPA (vue-i18n): `{name}` named args, `a | b` plural branches, `{'@'}` literals;
 *                         a bare `@` starts a linked message and breaks the string.
 *   explorer (core t()):  `{name}` replaced verbatim, plurals are separate `key` / `key_one`
 *                         entries, `@` is an ordinary character and `{'@'}` would print literally.
 * A key present in BOTH catalogues is checked against both.
 *
 * Exit code: 0 = no errors (warnings allowed), 1 = errors, 2 = could not run.
 */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
// The plural rules are the PLATFORM's: imported from the validator filex
// itself runs, never re-implemented here (they moved once already, in
// v0.43.0, from "_one means 1" to the CLDR categories).
import { COUNT_VARS, formOf, impliesNumber, plainTokens, pluralCategories } from './validate.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, '..');

/* ── arguments ─────────────────────────────────────────────────────────── */
const argv = process.argv.slice(2);
const flag = (name) => argv.includes(name);
const opt = (name, dflt) => {
  const i = argv.indexOf(name);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : dflt;
};
const CATDIR = path.join(repo, 'catalogue');
const SRC_ARG = opt('--src', process.env.FILEX_SRC || '');
const USE_CATALOGUE = !SRC_ARG && fs.existsSync(path.join(CATDIR, 'filex-catalogue-en.json'));
const SRC = USE_CATALOGUE ? CATDIR : path.resolve(SRC_ARG || path.join(repo, '..', 'filex'));
const FILE = path.resolve(opt('--file', path.join(repo, 'translations', 'fr.json')));
const SHOW_LENGTHS = flag('--lengths');
const QUIET_WARN = flag('--quiet-warnings');
const PARTIAL = flag('--partial');

/* ── the host's limits (backend/pkg/pluginkit/wire/langpack.go, v0.43.0) ──
 * Bytes, not key counts: v0.43.0 replaced the old 2,000-key cap. */
const MAX_LOCALE_BYTES = 1048576; // one language: keys + values, UTF-8
const MAX_KEY_BYTES = 128;
const MAX_VALUE_BYTES = 4096;
const bytes = (s) => Buffer.byteLength(s, 'utf8');

/* ── load English ──────────────────────────────────────────────────────── */
function die(msg) {
  console.error(`validate: ${msg}`);
  process.exit(2);
}
function flatten(obj, prefix = '', out = {}) {
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object') flatten(v, key, out);
    else out[key] = v;
  }
  return out;
}
function loadCoreTs(file) {
  const src = fs.readFileSync(file, 'utf8');
  const start = src.indexOf('{', src.search(/export const \w+\s*:[^=]*=/));
  const end = src.lastIndexOf('}');
  if (start < 0 || end < start) die(`cannot find the object literal in ${file}`);
  // The catalogue is a plain object literal of string keys and string values (comments allowed).
  return new Function(`return (${src.slice(start, end + 1)});`)();
}
let webEn = {};
let coreEn = {};
let catEn = {};
let catCtx = {};
if (USE_CATALOGUE) {
  const en = JSON.parse(fs.readFileSync(path.join(CATDIR, 'filex-catalogue-en.json'), 'utf8'));
  const ctx = JSON.parse(fs.readFileSync(path.join(CATDIR, 'filex-catalogue-context.json'), 'utf8')).keys ?? {};
  catEn = en;
  catCtx = ctx;
  // `server` — the e-mails, the notifications, the no-JS public pages and
  // the permission names — is written with the explorer's plain grammar, so
  // it is checked as core. Left out of this list, all 237 of its keys came
  // back UNKNOWN on a clean pack (v0.43.0 sync).
  for (const [k, v] of Object.entries(en)) {
    const where = ctx[k]?.in;
    if (where === 'admin' || where === 'both') webEn[k] = v;
    if (where === 'explorer' || where === 'both' || where === 'server') coreEn[k] = v;
    if (!where) die(`catalogue context has no "in" for ${k}`);
  }
} else {
  const webFile = path.join(SRC, 'web', 'src', 'locales', 'en.json');
  const coreFile = path.join(SRC, 'packages', 'core', 'src', 'locales', 'en.ts');
  for (const f of [webFile, coreFile]) if (!fs.existsSync(f)) die(`English source not found: ${f} (use --src)`);
  webEn = flatten(JSON.parse(fs.readFileSync(webFile, 'utf8')));
  coreEn = loadCoreTs(coreFile);
}

/* ── load the pack ─────────────────────────────────────────────────────── */
if (!fs.existsSync(FILE)) die(`pack not found: ${FILE}`);
let pack;
try {
  pack = JSON.parse(fs.readFileSync(FILE, 'utf8'));
} catch (e) {
  die(`${FILE} is not valid JSON: ${e.message}`);
}
if (!pack || typeof pack !== 'object' || Array.isArray(pack)) die('the pack must be a flat JSON object');

/* ── the vue-i18n message parser, from the source checkout ─────────────── */
let parser = null;
let parserNote = 'regex fallback (vue-i18n compiler not found)';
if (!flag('--no-compiler')) {
  try {
    let mcPkg;
    try {
      mcPkg = createRequire(path.join(repo, 'package.json')).resolve('@intlify/message-compiler/package.json');
    } catch {
      const webReq = createRequire(path.join(SRC, 'web', 'package.json'));
      const vi18n = fs.realpathSync(webReq.resolve('vue-i18n/package.json'));
      const coreBase = fs.realpathSync(createRequire(vi18n).resolve('@intlify/core-base/package.json'));
      mcPkg = createRequire(coreBase).resolve('@intlify/message-compiler/package.json');
    }
    const mc = createRequire(mcPkg)('./dist/message-compiler.cjs');
    const version = JSON.parse(fs.readFileSync(mcPkg, 'utf8')).version;
    parser = (text) => {
      const errors = [];
      const p = mc.createParser({ onError: (e) => errors.push(e.message) });
      return { ast: p.parse(text), errors };
    };
    parserNote = `@intlify/message-compiler ${version} (the parser vue-i18n uses)`;
  } catch {
    /* fall back to regexes */
  }
}

/* ── token extraction ──────────────────────────────────────────────────── */
const sortJoin = (arr) => [...arr].sort().join(' ');
const codeSpans = (s) => s.match(/`[^`]*`/g) ?? [];
const angleTokens = (s) => s.match(/<[^<>\s][^<>]*>/g) ?? [];
const literalExprs = (s) => s.match(/\{\s*'[^']*'\s*\}/g) ?? [];

/** Admin SPA: per plural branch, the named/list/literal/linked tokens. */
function webShape(text) {
  if (parser) {
    const { ast, errors } = parser(text);
    const cases = ast.body.type === 1 ? ast.body.cases : [ast.body];
    const shape = cases.map((c) => {
      const toks = [];
      for (const it of c.items ?? []) {
        if (it.type === 4) toks.push(`{${it.key}}`);
        else if (it.type === 5) toks.push(`{${it.index}}`);
        else if (it.type === 9) toks.push(`{'${it.value}'}`);
        else if (it.type === 6) toks.push('@linked');
      }
      return sortJoin(toks);
    });
    return { shape, errors };
  }
  // fallback: split on `|` outside braces
  const branches = [];
  let depth = 0;
  let cur = '';
  for (const ch of text) {
    if (ch === '{') depth++;
    if (ch === '}') depth = Math.max(0, depth - 1);
    if (ch === '|' && depth === 0) {
      branches.push(cur);
      cur = '';
    } else cur += ch;
  }
  branches.push(cur);
  const errors = [];
  if (/@/.test(text.replace(/\{\s*'[^']*'\s*\}/g, ''))) errors.push('bare @ (starts a linked message)');
  return { shape: branches.map((b) => sortJoin(b.match(/\{[^{}]*\}/g) ?? [])), errors };
}
/** Explorer: `{name}` tokens, replaced verbatim by t(). */
const coreShape = (text) => sortJoin(text.match(/\{[A-Za-z0-9_]+\}/g) ?? []);

/* ── what may legitimately stay identical to English ───────────────────── */
// Words that are the same in French UI: product/protocol names, units, acronyms, syntax.
const KEEP_WORDS = new Set(
  (
    'filex OK PIN ID IP URL URLs API MCP REST SSO OIDC LDAP TOTP 2FA RBAC JWT SMTP TLS SSL HTTPS HTTP ' +
    'SFTP FTP FTPS WebDAV NFS NFSv3 SMB CIFS NAS S3 MinIO Hetzner AWS ClamAV clamd ETag MIME SHA-256 SHA ' +
    'HMAC ed25519 PEM PKCS WebAssembly Wasm wasm GitHub Claude rclone restic Cyberduck WinSCP FileZilla ' +
    'PuTTYgen davfs2 sshfs s3fs WinFsp macFUSE Finder Dolphin GNOME PowerShell Markdown CSV PDF PDFs PWA ' +
    'Windows macOS Linux Debian Ubuntu AppImage deb dmg exe Apple Silicon Keycloak Auth0 Authentik Bleve Vue React Go ' +
    'TypeScript JavaScript Python Rust PHP Ruby Java Kotlin Swift YAML XML TOML SQL JSON HTML CSS ' +
    'cron webhook Webhook Webhooks endpoint Endpoint bucket Bucket proxy Proxy backend Backend ' +
    'StartTLS CIDR DN known_hosts clamdscan clamscan B KB MB GB TB PB px OnlyOffice ONLYOFFICE drawio ' +
    'Admin Hex hex base64 Figma Office Word Excel PowerPoint OpenDocument X-Filex-Token Bearer Authorization ' +
    'Backblaze B2 ms v x y z patch Min Max Enterprise Pro ' +
    // ordinary words spelled the same in French
    'Antivirus antivirus Normal Local Total Audio Active Directory Actions actions Action action Description ' +
    'description Type type Message message Instance instance Version version Versions versions Date date ' +
    'Minimum Maximum Source source Signature signature Portrait Paysage Format format Options Option Transport ' +
    'Initiales Image Images Documents Document Code code Notifications Notification Session ' +
    'Pages Page Destination Collection Correction Question Questions Texte Menu Contact Sections Section ' +
    'Standard Global Public Privé Service Services Configuration Application Applications Quota quota ' +
    'Stockages Direction Zone Zones Style Styles Protection Solution Position Mode mode Modes ' +
    'Instances Microsoft Google Amazon Dropbox OneDrive Nextcloud Port Ports Notes Note Score Auto Portable portable Documentation Logo Secret Archive Archives archive Navigation Danger ' +
    'Administration ' +
    // sample values and input masks
    'fileman foo bar XXXX'
  ).split(/\s+/),
);
// Keys whose English value is also the right French, beyond what KEEP_WORDS covers.
const IDENTICAL_OK = new Set([
  'app.name',
  'apiMcp.fields.usernamesPlaceholder', // sample identifiers ("work, fishapp")
  'conn.tokens.rootPlaceholder', // syntax: storage://folder
  'e2e.recover.recovery_placeholder', // input mask XXXX-XXXX-…
  'appearance.namePlaceholder', // sample product name ("Acme Cloud")
]);
function identicalAllowed(key, en) {
  if (IDENTICAL_OK.has(key)) return true;
  const words = en.replace(/\{[^{}]*\}/g, ' ').match(/[A-Za-zÀ-ÿ][A-Za-z0-9À-ÿ_+#-]*/g) ?? [];
  return words.every((w) => KEEP_WORDS.has(w) || KEEP_WORDS.has(w.replace(/s$/, '')));
}

/* ── register / glossary lint (vous, standard French) ──────────────────── */
const TU_PRONOUNS = /(^|[^\p{L}])(tu|toi|ton|ta|tes|te|t[’'])(?=[^\p{L}]|$)/iu;
const TU_IMPERATIVE_START =
  /(^|[.!?—:]\s+|^\s*)(Clique|Saisis|Choisis|Sélectionne|Ouvre|Essaie|Essaye|Vérifie|Ajoute|Utilise|Appuie|Fais|Glisse|Dépose|Colle|Ferme|Attends|Demande|Crée|Active|Désactive|Coche|Supprime|Indique|Configure|Télécharge|Téléverse|Regarde|Cherche|Enregistre|Génère|Mets|Tiens|Va|Sors|Dis|Réessaie|Reviens|Tape|Renseigne|Relance)\s/u;
// "Recherche", "Copie", "Entre", "Installe", "Exécute" are left out on purpose: in UI French they are
// far more often a noun, a preposition or a third person ("Installe filex…") than a "tu" imperative.
// Keys where a glossary lint hit is a proper name: macOS's own « Réglages Système », a git "tag".
const GLOSSARY_OK = new Set(['install.dl.dmg_hint', 'appPlugins.wizard.ref']);
const GLOSSARY_LINT = [
  [/\bcrypt(er|é|ée|és|ées|age)\b/i, 'use "chiffrer / chiffré" (never "crypter")'],
  [/\bcourriel/i, 'use "e-mail" (France), not "courriel"'],
  [/\bpoubelle\b/i, 'use "corbeille" for "trash"'],
  [/(?<![\p{L}])réglages?(?![\p{L}])/iu, 'use "paramètres" for "settings"'],
  // Not before "/": a path segment the reader types (downloads/incomplete/**) is a literal, not prose.
  [/(?<![\p{L}-])(tokens?|uploads?|downloads?|plugins?|tags?)(?![\p{L}:/-])/iu, 'English word left in prose (glossary: jeton / téléverser / télécharger / extension / étiquette)'],
  [/\bappli\b/i, 'use "application"'],
  [/\bmodules? de stockage\b/i, 'storage plugin → "extension de stockage"'],
  [/\bétiquette\b.*\b(jeton|clé|token)\b|\b(jeton|clé)\b.*\bétiquette\b/i, 'a token/key "label" is a "libellé", not an "étiquette"'],
];

/* ── French typography (see glossary.md → Typography) ───────────────────── */
// Prose only: code spans, placeholders, literals, URLs / scheme paths, `tag:` syntax, times,
// key combos and CLI-looking tokens are removed before looking.
function proseOf(s) {
  return s
    .replace(/`[^`]*`/g, ' ')
    .replace(/\{[^{}]*\}/g, 'X')
    .replace(/\b[A-Za-z_][\w-]*:(?=<)/g, ' ')
    .replace(/<[^<>]*>/g, ' ')
    .replace(/:\/\//g, ' ')
    .replace(/\b[\w.+-]+:\/\/\S*/g, ' ')
    .replace(/\bhttps?:\S*/g, ' ')
    .replace(/\b(tag|plugin|data|mailto|urn|ldap|ldaps|smb|nfs|s3|sftp|ftp|ftps):\S*/gi, ' ')
    .replace(/\d+:\d+/g, '0')
    .replace(/(?<![\p{L}\p{N}])[A-Z]:(?=[\\\s]|$)/gu, ' ')
    .replace(/\b(Ctrl|Cmd|Alt|Shift|Mod|Meta|Option|⌘|⌥)\+\S+/g, ' ');
}
function typographyIssues(s) {
  const p = proseOf(s);
  const out = [];
  if (/ [:;!?]/.test(p)) out.push('ordinary space before : ; ! ? (use U+00A0 before :, U+202F before ; ! ?)');
  if (/[\p{L}\p{N})»][;!?](\s|$)/u.test(p) || /[\p{L})»][:](\s|$)/u.test(p)) out.push('no space before : ; ! ?');
  if (/\u202F:/.test(p)) out.push('U+202F before ":" (use U+00A0)');
  if (/\u00A0[;!?]/.test(p)) out.push('U+00A0 before ; ! ? (use U+202F)');
  if (/«(?!\u00A0)|(?<!\u00A0)»/.test(p)) out.push('guillemets without U+00A0 inside');
  if (/[“”"]/.test(p)) out.push('English quotation marks in prose (use « »)');
  if (/\p{L}'\p{L}/u.test(p)) out.push("straight apostrophe in prose (use ’)");
  return out;
}

/* ── run ───────────────────────────────────────────────────────────────── */
const errors = [];
const warnings = [];
const err = (key, code, msg) => errors.push({ key, code, msg });
const warn = (key, code, msg) => warnings.push({ key, code, msg });

const expected = new Map(); // key -> [{cat, en}]
for (const [k, v] of Object.entries(webEn)) expected.set(k, [{ cat: 'web', en: v }]);
for (const [k, v] of Object.entries(coreEn)) {
  if (expected.has(k)) expected.get(k).push({ cat: 'core', en: v });
  else expected.set(k, [{ cat: 'core', en: v }]);
}
const collisions = [...expected.entries()].filter(([, s]) => s.length > 1);

const LANG = 'fr';
const CATS = pluralCategories(LANG);
/** A plural FORM key (`x_few`) of a catalogue key that counts — `x` is its base. */
function pluralBase(key) {
  const f = formOf(key);
  if (!f || !(f.base in catEn) || !catCtx[f.base]?.plural) return null;
  const table = catCtx[f.base].in;
  if (table !== 'explorer' && table !== 'both' && table !== 'server') return null;
  return f;
}

const packKeys = Object.keys(pack);
// A plural form for a category the English has no key for is a real key
// filex reads — checked against its base's English, and never required.
for (const k of packKeys) {
  if (expected.has(k)) continue;
  const f = pluralBase(k);
  if (!f) continue;
  if (!CATS.includes(f.cat)) {
    err(k, 'UNUSED', `${LANG} has no "${f.cat}" plural category (${CATS.join(', ')}) — this form is never shown`);
    continue;
  }
  expected.set(k, [{ cat: 'core', en: catEn[f.base] }]);
}
if (!PARTIAL) for (const k of expected.keys()) if (!(k in pack)) err(k, 'MISSING', 'key missing from the pack');
for (const k of packKeys) if (!expected.has(k)) err(k, 'UNKNOWN', 'key not in either English catalogue');

for (const [key, sources] of expected) {
  if (!(key in pack)) continue;
  const es = pack[key];
  if (typeof es !== 'string') {
    err(key, 'TYPE', 'value is not a string');
    continue;
  }
  if (!es.trim()) {
    err(key, 'EMPTY', 'empty value');
    continue;
  }
  if (bytes(key) > MAX_KEY_BYTES) err(key, 'LIMIT', `key longer than ${MAX_KEY_BYTES} bytes`);
  if (bytes(es) > MAX_VALUE_BYTES) err(key, 'LIMIT', `value longer than ${MAX_VALUE_BYTES} bytes`);

  // A shared key whose English differs between the catalogues cannot match both; it passes
  // when it satisfies at least one of them (the difference itself is reported above).
  const englishDiffers = sources.length > 1 && sources[0].en !== sources[1].en;
  const perSource = [];
  for (const { cat, en } of sources) {
    const where = sources.length > 1 ? ` [vs ${cat} English]` : '';
    const before = errors.length;

    if (cat === 'web') {
      const a = webShape(en);
      const b = webShape(es);
      if (b.errors.length && !a.errors.length) err(key, 'SYNTAX', `vue-i18n cannot parse it: ${b.errors.join('; ')}${where}`);
      // Plurals (docs/PLUGIN-KIT.md): a plural may have 1, 2 (one | other) or 3 forms
      // (zero | one | other — vue-i18n's default rule: 0 → first, 1 → second, else third).
      // French uses 3, so that 0 takes the singular. Every form receives the same values,
      // so a form may use any placeholder of the English — but none the English lacks.
      // A string that is not a plural in English must not become one (a stray bar).
      if (a.shape.length === b.shape.length) {
        a.shape.forEach((s, i) => {
          if (s !== b.shape[i])
            err(key, 'PLACEHOLDER', `branch ${i + 1}: has [${b.shape[i]}], English has [${s}]${where}`);
        });
      } else if (a.shape.length === 1 || b.shape.length > 3) {
        err(key, 'PLURAL', `${b.shape.length} plural branch(es), English has ${a.shape.length}${where}`);
      } else {
        const union = new Set(a.shape.flatMap((x) => x.split(' ').filter(Boolean)));
        b.shape.forEach((x, i) => {
          for (const tok of x.split(' ').filter(Boolean))
            if (!union.has(tok)) err(key, 'PLACEHOLDER', `form ${i + 1} has ${tok}, which the English does not${where}`);
        });
        const used = new Set(b.shape.flatMap((x) => x.split(' ').filter(Boolean)));
        for (const tok of union) if (!used.has(tok)) err(key, 'PLACEHOLDER', `${tok} is used by no form${where}`);
      }
      if (/%{/.test(es.replace(/{s*'[^']*'s*}/g, ''))) err(key, 'PERCENT', `"%{" is vue-i18n's modulo form and eats the % — write {'%'}{x}${where}`);
      if (sortJoin(literalExprs(es)) !== sortJoin(literalExprs(en)))
        err(key, 'LITERAL', `{'…'} literals differ from English${where}`);
    } else {
      const form = USE_CATALOGUE ? pluralBase(key) : null;
      if (form) {
        // The platform's rule: every form is handed the whole sentence's
        // values, so it may use any of them; it must keep those the plain key
        // has, except the count when this category holds exactly one number
        // (French `one` is 0 AND 1, so the count always stays) — and it MAY
        // put the count back where the English form typed a literal digit.
        const allowed = new Set([...plainTokens(catEn[form.base]), ...plainTokens(en)]);
        const implied = impliesNumber(LANG, form.cat);
        const required = plainTokens(catEn[form.base]).filter((t) => !(implied && COUNT_VARS.includes(t)));
        const got = plainTokens(es);
        const bad = got.filter((t) => !allowed.has(t));
        const gone = required.filter((t) => !got.includes(t));
        if (bad.length) err(key, 'PLACEHOLDER', `uses {${bad.join('} {')}}, which the English does not${where}`);
        if (gone.length) err(key, 'PLACEHOLDER', `leaves out {${gone.join('} {')}}${where}`);
      } else if (coreShape(es) !== coreShape(en))
        err(key, 'PLACEHOLDER', `has [${coreShape(es)}], English has [${coreShape(en)}]${where}`);
      if (literalExprs(es).length) err(key, 'AT', `explorer strings print {'…'} literally — write a bare @${where}`);
      if ((es.match(/@/g) ?? []).length !== (en.match(/@/g) ?? []).length)
        err(key, 'AT', `number of @ differs from English${where}`);
    }

    if (sortJoin(codeSpans(es)) !== sortJoin(codeSpans(en))) err(key, 'CODE', `backtick code spans differ from English${where}`);
    if (angleTokens(es).length !== angleTokens(en).length) err(key, 'ANGLE', `<…> tokens differ in number${where}`);
    const lead = (s) => s.match(/^\s*/)[0];
    const trail = (s) => s.match(/\s*$/)[0];
    if (lead(es) !== lead(en) || trail(es) !== trail(en)) err(key, 'SPACE', `leading/trailing whitespace differs${where}`);
    const endEn = en.trimEnd().slice(-1);
    const endEs = es.trimEnd().slice(-1);
    if ((endEn === '…' || endEn === ':') && endEs !== endEn) err(key, 'ENDING', `English ends with "${endEn}", the translation does not${where}`);
    if (endEn !== '…' && endEn !== ':' && (endEs === '…' || endEs === ':')) err(key, 'ENDING', `translation ends with "${endEs}", English does not${where}`);
    if ((endEn === '.') !== (endEs === '.') && !/[.)»”"]$/.test(es.trimEnd()))
      warn(key, 'PERIOD', `terminal period differs from English${where}`);
    if (es === en && !identicalAllowed(key, en)) err(key, 'IDENTICAL', `identical to English: ${JSON.stringify(en)}`);
    perSource.push(errors.splice(before));
  }
  if (englishDiffers && perSource.some((e) => e.length === 0)) {
    /* satisfied one of the two English originals */
  } else for (const e of perSource) errors.push(...e);

  const plain = es.replace(/`[^`]*`/g, '').replace(/\{[^{}]*\}/g, '');
  if (TU_PRONOUNS.test(plain)) err(key, 'REGISTER', `informal "tu" form: ${JSON.stringify(es)}`);
  for (const t of typographyIssues(es)) warn(key, 'TYPO', `${t}: ${JSON.stringify(es)}`);
  if (!key.startsWith('server.perm.') && TU_IMPERATIVE_START.test(plain))
    warn(key, 'REGISTER', `possible "tu" imperative: ${JSON.stringify(es)}`);
  for (const [re, why] of GLOSSARY_LINT) if (!GLOSSARY_OK.has(key) && re.test(plain)) warn(key, 'GLOSSARY', `${why}: ${JSON.stringify(es)}`);
}

/* consistency: the same short English label translated two ways */
const byEn = new Map();
for (const [key, sources] of expected) {
  if (!(key in pack)) continue;
  const en = sources[0].en;
  if (en.split(/\s+/).length > 3) continue;
  if (!byEn.has(en)) byEn.set(en, new Map());
  const m = byEn.get(en);
  const es = pack[key];
  if (!m.has(es)) m.set(es, []);
  m.get(es).push(key);
}
const inconsistent = [...byEn.entries()].filter(([, m]) => m.size > 1);

/* ── report ────────────────────────────────────────────────────────────── */
const webKeys = Object.keys(webEn).length;
const srvKeys = Object.keys(catEn).filter((k) => catCtx[k]?.in === 'server').length;
const coreKeys = Object.keys(coreEn).length - srvKeys;
console.log(`filex language-pack validator`);
console.log(`  English source : ${path.relative(process.cwd(), SRC) || SRC}${USE_CATALOGUE ? ' (catalogue in this repository)' : ' (filex checkout)'}`);
console.log(`                   admin panel (vue-i18n)             ${webKeys} strings`);
console.log(`                   explorer (plain {var})             ${coreKeys} strings`);
console.log(`                   server (mails, public pages)       ${srvKeys} strings`);
console.log(`                   ${collisions.length} keys exist in both catalogues -> ${USE_CATALOGUE ? Object.keys(catEn).length : expected.size} strings`);
console.log(`  plurals        : ${CATS.join(', ')}${USE_CATALOGUE ? ` — ${expected.size - Object.keys(catEn).length} extra form key(s) beyond the catalogue` : ''}`);
console.log(`  pack           : ${path.relative(process.cwd(), FILE) || FILE}  (${packKeys.length} strings)`);
console.log(`  syntax check   : ${parserNote}`);
console.log('');

if (collisions.length) {
  const differ = collisions.filter(([, s]) => s[0].en !== s[1].en);
  console.log(`Keys shared by both catalogues: ${collisions.length} (one flat pack value serves both).`);
  console.log(`  identical English in both: ${collisions.length - differ.length}`);
  for (const [k, s] of differ) console.log(`  ENGLISH DIFFERS: ${k}\n    web : ${JSON.stringify(s[0].en)}\n    core: ${JSON.stringify(s[1].en)}\n    pack: ${JSON.stringify(pack[k])}`);
  console.log('');
}
{
  const total = packKeys.reduce((n, k) => n + bytes(k) + bytes(String(pack[k])), 0);
  if (total > MAX_LOCALE_BYTES) err('(pack)', 'LIMIT', `${total} bytes — one language may be at most ${MAX_LOCALE_BYTES} bytes`);
  console.log(`Size: ${total} bytes of keys + values (limit ${MAX_LOCALE_BYTES}).`);
}

const group = (list) => {
  const m = new Map();
  for (const x of list) m.set(x.code, (m.get(x.code) ?? 0) + 1);
  return [...m.entries()].map(([c, n]) => `${c}=${n}`).join(' ') || 'none';
};
console.log(`Errors  : ${errors.length} (${group(errors)})`);
console.log(`Warnings: ${warnings.length} (${group(warnings)})`);
console.log(`Consistency: ${inconsistent.length} short English labels translated more than one way (see below)`);
for (const e of errors) console.log(`  ERROR ${e.code.padEnd(11)} ${e.key}: ${e.msg}`);
if (!QUIET_WARN) {
  for (const w of warnings) console.log(`  warn  ${w.code.padEnd(11)} ${w.key}: ${w.msg}`);
  if (inconsistent.length) {
    console.log('');
    console.log('Same English, different French (review — context may justify it):');
    for (const [en, m] of inconsistent) {
      console.log(`  ${JSON.stringify(en)}`);
      for (const [es, keys] of m) console.log(`      ${JSON.stringify(es)}  <- ${keys.slice(0, 4).join(', ')}${keys.length > 4 ? ` (+${keys.length - 4})` : ''}`);
    }
  }
}

/* ── length report ─────────────────────────────────────────────────────── */
if (SHOW_LENGTHS) {
  const TIGHT = /(^|\.)(col|cols|tabs?|filter|sort|ctx|toolbar|sidenav|opc|nav|state|states|statuses|caps|badge|kinds|stats|actions|legs|mode|severity|roles|perm|sum|where|scope|access\.sum)(\.|$)|(^common\.)|(_short$)|(badge)/;
  const rows = [];
  for (const [key, sources] of expected) {
    const en = sources[0].en;
    const es = pack[key];
    if (typeof es !== 'string') continue;
    if (en.length > 28 || /[.!?]\s|[.!?]$/.test(en.trim())) continue;
    const tight = TIGHT.test(key);
    const grow = es.length - en.length;
    if (es.length > Math.max(Math.ceil(en.length * 1.3), en.length + 5)) rows.push({ key, en, es, grow, tight });
  }
  rows.sort((a, b) => Number(b.tight) - Number(a.tight) || b.grow - a.grow);
  const all = [...expected.values()].map((s) => s[0].en);
  const esAll = [...expected.keys()].map((k) => pack[k] ?? '');
  const sum = (a) => a.reduce((x, y) => x + y.length, 0);
  console.log('');
  console.log(`Length: French is ${((sum(esAll) / sum(all) - 1) * 100).toFixed(1)}% longer than English overall.`);
  console.log(`Short labels (English <= 28 chars) that grew by > 30% and > 5 chars: ${rows.length}; tight-UI ones first:`);
  for (const r of rows.slice(0, 80))
    console.log(`  ${r.tight ? 'TIGHT' : '     '} +${String(r.grow).padStart(2)}  ${r.key}: ${JSON.stringify(r.en)} -> ${JSON.stringify(r.es)}`);
}

process.exit(errors.length ? 1 : 0);
