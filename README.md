# filex — French (fr) language pack

The whole [filex](https://github.com/BRF-Tech/filex) interface in French — the file explorer, the
admin panel, the settings dialog and the public share pages — as a filex **language pack**: a
data-only app (no module, nothing runs) that any filex **v0.43.0** or newer server installs from
`filex-app.json`.

> **AI-translated, awaiting review by a native speaker — corrections welcome.**
> Standard French (France), addressing the reader as *vous*, with French typography (non-breaking
> spaces before `: ; ! ?` and inside « guillemets »). Terminology is fixed in
> [`glossary.md`](glossary.md); please keep to it (or change it there first) when you correct a string.

Version **0.1.0** · 3,588 of 3,588 strings (100 %) of the v0.43.0 catalogue — 227 of them the
text the server writes — plus 3 extra plural forms.

## Contents

| Path | What it is |
|---|---|
| `filex-app.json` | The pack filex installs — written by `pack.mjs build` from `translations/` |
| `translations/fr.json` | The translation — the file you edit: one flat `{ "<key>": "<text>" }` over both catalogues |
| `glossary.md` | Terms, voice, typography, the syntax rules a string must keep, hard decisions, measured length fixes |
| `catalogue/` | The v0.43.0 English catalogue + per-key context (renderer, grammar, where used) |
| `scripts/pack.mjs` | `build` / `next` / `sync` — from the filex language-pack template |
| `scripts/validate.mjs` | The platform validator — a verbatim copy of filex's `scripts/i18n-validate.mjs` |
| `scripts/validate-fr.mjs` | The French checks on top: *vous* register, glossary lint, typography, length report |
| `scripts/normalize.mjs` | Applies the French typography mechanically (outside code, placeholders and syntax) |
| `validate-output.txt` | The last run of both validators |

The repository follows the layout of the filex language-pack template, so `pack.mjs sync --from
v0.44.0` picks up the strings a newer filex adds.

## Correcting a string

```sh
npm install                                   # optional: vue-i18n's own parser, for the strictest check
# edit translations/fr.json — type ordinary spaces before : ; ! ? and inside « »
node scripts/normalize.mjs                    # turns them into U+00A0 / U+202F, typographic ’
node scripts/pack.mjs build                   # rewrites filex-app.json
node scripts/validate.mjs filex-app.json --complete
node scripts/validate-fr.mjs                  # add --lengths for the length report
```

Both validators must report 0 errors and 0 warnings. `validate-fr.mjs` reads `catalogue/` by
default; `--src <filex checkout>` checks against a checkout instead. Admin-panel strings are
compiled with vue-i18n's parser: write a literal `@` as `{'@'}` there, never in explorer strings
(the context file says which catalogue a key belongs to).

## Install

**Plugins → Apps → Install an app** on a filex v0.43.0+ server: *GitHub* with `BRF-Tech/filex-lang-fr`, or
*Files* with `filex-app.json` alone (leave the module empty). Then pick *Français* in
**Settings → Preferences → Language**.

## Platform notes found while translating

Three filex issues found while translating were **fixed in v0.43.0**: the admin
panel's `formatBytes` now passes the catalogue's unit labels (so admin screens
say *Go / To / o* like the explorer), the colon after the last-sync time moved
inside the string (`dashboard.lastSyncAt`), and the split "create then send"
sentence became one message (`access.ui.create_then_send`). What remains is
this pack's own:

- `scripts/normalize.mjs` used to turn `root:<storage>://<folder>` into `root :<storage>…`: its
  `<…>` mask made the colon look like the end of a French word. Fixed here (a scheme prefix in
  front of an `<angle>` token is protected), and the same blind spot is fixed in `validate-fr.mjs`.

## License

MIT — see [`LICENSE`](LICENSE).
