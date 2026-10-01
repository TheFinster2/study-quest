# English Advanced — Close Reading, in StudyQuest

Subject id `eng`, namespace `EN`, currency Marks ✒️ (coin rate 0.6). Ported from the
stand-alone *Close Reading* app (`English-Study-app`).

## What it contains
- **15 modes**: Marking Desk, Thesis Forge, Name That Technique, Cloze Crunch, Section I
  (paper), Say It In One, Essay Architect, Rapid Fire, Module Drill, Quote Match, Band
  Grid, Rewrite Rescue, Question Deconstruction, Survival, Mistake Rehab.
- **5 module bosses** (Party, Double, Critic, Blank Page, Examiner) + **The Final Paper**.
- **Quote Vault** (Leitner, leeches), **Draft Desk** (earns nothing, structurally),
  **Texts** (per-module text choice, 54 Donne poems switchable), **Reference** (search),
  "Do this next" ladder, glossary chips, achievements, weekly quests, daily challenge.
- Content: 403 MCQs, 324 quotes, 229 techniques, 60 band paragraphs, 62 free-text
  prompts, 14 essay puzzles, 42 topic pairs, 84 achievements, 10 themes, 22 avatars,
  60 level titles. `tests/subjects/eng/validate.js` asserts the exact counts.
- **Layer C** sentence marking: `models/minilm` (23 MB ONNX) + `vendor/transformers`
  (lazy ES-module import, never in the manifest), `allowRemoteModels = false`, opt-in
  download from Options into the `closereading-model-v1` cache. Needs http(s); from
  `file://` it reports "unavailable" and pays nothing, as before.

Routes (`#/s/eng/…`): `home play game/<mode> boss[/id|/final] vault[/card/<id>] study
reference[/…] progress shop draft[/new|/<id>] texts[/<module>|/poems/<id>] options
achievements dev`.

## What changed from the stand-alone app
- State is `SQ.SubjectState.create("eng", …)`; English-only parts (texts{}, topics,
  puzzlesSolved, freeText guards, drafts, manifest, poems) kept via `defaults()` +
  `Object.assign`. `recordAnswer(mod, ok, qid, text, topic)` is overridden to keep
  per-text mastery. Profile, inventory, streak, sound/motion and owned cosmetics are the app's.
- UI is `SQ.UI.bind("eng", …)`; English's reading-time model (`timeBudget`, `rushFloor`,
  `rushHint`), crutches, glossary, Layer C banner, `copy` and its **gated results** screen
  live in `extend`. `award()` translates `crutchCost` and hands off to `SQ.UI.award`.
- Sound plays through `SQ.Sound.shared()`; FX are `SQ.FX`.
- **Four difficulties** (Gentle added); timers still cut only the slack over reading time.
  Boss player HP scales with `difficulty().boss`. Nightmare bans 50/50 + Skip.
- **Graded review** (Again/Hard/Good/Easy) in Vault browse (still pays nothing).
- Adrenaline is the shared `double`, applied as `award({boost:2})` under the ×4 ceiling.
- Shop → `SQ.Shop.subject` (themes `eng-<name>`, avatars, three crates with their original weight tables). Power-ups are in
  the general shop. Settings → `options` (texts, Layer C, reset English); sound/motion/
  export/import/Force refresh are the app's.
- Tool tray: `calc:false, sheet:true, pad:true`; the sheet (techniques by category +
  rubric verbs) is all free. Hidden in Name That Technique and The Critic, whose point is
  reasoning without the label.
- Dev menu → `EN.devActions` (listed by the app's `#/dev`, and at `#/s/eng/dev`);
  snapshot key `studyquest.dev.eng`.
- `importLegacy` maps `closereading.save.v1`.
- CSS: `css/eng.css` was generated from the source `styles.css` — every rule scoped under
  `html[data-subject="eng"]`, keyframes `eng-*`, app chrome/arcade rules dropped;
  `css/themes.css` holds the 10 themes with `--mark-bg/--mark-ink` (zero-specificity
  fallback in eng.css). Marginalia is owned free and dresses English on first visit.
- Arcade games not ported (see `arcade-skins.md`).

## Tests
`node tests/subjects/eng/validate.js`, `node tests/subjects/eng/smoke.js`,
`node tests/subjects/eng/run.js [suite]` (the ported runner). Suites: validate, bias,
legacy, economy, marking, calibrate, a11y, storage, search, nextup, glossary, skills,
paper, leech, cite, play, smoke, dev. Not ported (the app owns them now): offline,
runner, arcade, motion.

## Known gaps
- CORE-REQUESTS 1–4 are implemented in the core; 5–6 stay subject-side.
- `EN.DATA.difficulties` / `EN.DATA.shop.tickets` / `EN.DATA.arcade` remain as data only.
