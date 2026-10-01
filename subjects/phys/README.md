# Physics (`phys`, namespace `PHYS`) — ported from Newton's Notebook

HSC Physics, Joules ⚡, coin rate 0.75, level curve `round(115·n^1.5)`.

## What it contains
- **11 modes**: Rapid Fire, Module Drill, Survival, Mistake Rehab, Calculation Crunch
  (101 seeded generators, unit-aware marking at 2 % via `core/units.js`, any
  equivalent unit, one charged retry), Free-Body Builder, Formula Match, Graph Story,
  Unit Grid, Circuit Bench, Derivation Chain (22 chains).
- **5 Exam Bosses** (HP duels, mastery-gated: 35 % in their module, 55 % in every Y12
  module for The Trial Paper).
- **159 MCQs**, **257 flashcards**, **20 worked examples**, **48 achievements**,
  64 formulas, 23 constants + 10 question-supplied values, 38 quantities.
- Screens: `home` (Lab), `play`, `game/<mode>/<module?>`, `game/boss/<id>`, `study`
  (+ `study/deck/due|all|leech|M1…M8`), `reference`, `progress`, `achievements`,
  `options`, `shop`.
- Themes (10): `phys-graphite` (free, granted on first load), `phys-blueprint`,
  `phys-chalkboard`, `phys-daylight`, `phys-redshift`, `phys-starfield`,
  `phys-cherenkov`, `phys-magnetite`, `phys-fusion`, `phys-quantum`. 16 avatars, 2 crates.

## What changed from the stand-alone app
- **Difficulties** are the shared four: Gentle ×0.85, Standard ×1, Hard **×1.45**
  (was ×1.25), Nightmare **×2.1** (was ×1.55); timers use the shared `time`
  (Hard 0.75, was 0.80; Nightmare 0.55, was 0.62). Gentle still caps draws at ★★.
  Nightmare now bans 50:50/Skip; bosses hit back ×`difficulty().boss`.
- **Rewards** go through `SQ.UI.award`; Physics' read-pace gate stays in front of it
  (`core/ui.js`): an all-too-fast run pays nothing, coins included. The per-answer
  floor is now the shared length-scaled `readFloor` (1.2 s + 12 ms/word, ≤ 4 s).
- **Calculator and in-question sheet** are the shared tool tray. The sheet is
  registered in `manifest.js` from the same data: 21 free constants, 54/64 free
  formulas (the source's `sheet` flags; `sheetNote` → `note`), `kCoulomb`/`GME`/supplied
  values and the units table off-sheet. `calculator.js`/`sheet.js` UI not ported.
- **Flashcards**: graded again/hard/good/easy (keys 1–4, space flips), leeches (≥ 4
  lapses) listed on Study and Home with a leech deck. Card XP now pays only when due.
- **Coverage** (Options): hide Year 11 or any module; filters mixed draws, generators,
  due cards and "Worth a look" — never payouts; an explicitly chosen module still works.
- **Options route**: the significant-figure check (informational, ±1 s.f.; the 2 %
  value marking is unchanged) and coverage. Linked from Home and Progress.
- **Power-ups** (shared inventory, `core/powerups.js`) in the quiz engine and bosses:
  fifty, skip (quiz), freeze (+15 s), shield (next wrong keeps the streak / blocks a
  boss hit), double (arm before the first answer → `award({ boost: 2 })`, core-capped
  ×4), insight (topic, a named trap, the topic's formulas), revive (automatic, once, in
  Survival and bosses). `S.powerupBanned` respected (Nightmare bans fifty/skip).
- Fixed a source bug: Survival's per-question clock and the boss clock kept running
  after an answer, so reading the feedback past the deadline logged a second,
  timed-out wrong answer (Survival runs died on correct answers).
- Keyboard play in MCQ modes and bosses (1–4 / A–D, Enter). Answer inputs are `js-answer`.
- Removed (app-owned now): router, header, toasts/modals, save, settings, service
  worker, profile sheet, arcade (see `arcade-skins.md`), power-up sales (general shop).
- Boss wins go through `S.markBoss`. `themesOwned` counts Physics themes only.
- `importLegacy` maps `newtonsnotebook.save.v1` (themes → `phys-*`, `adrenaline`→`revive`).
- Dev presets (`PHYS.devActions`): +5000 Joules, unlock bosses, seed mistakes/leech, level 60.

## Tests (`tests/subjects/phys/`)
`powerups.js` (each power-up offered, consumed, effective; Nightmare bans), `validate.js` (20,200 generated questions, dimensions, routes, distractors, bias,
near-duplicates, manifest vs disk; `BREAK=…`), `notation.js` (+`notation.png`),
`smoke.js`, `helpers.js`, `exploit.js [--minutes n]`, `honest.js`, `economy.js`
(ticket/power-up effort now informational, in Stars).
Not ported (app-level suites own them): offline, update, import, perf, and the
calculator/calcpanel/sheet UI tests (the shared tool tray's author owns those).

## Known gaps
- Power-ups are wired into the MCQ modes and bosses only, not the puzzle modes
  (Calculation Crunch, Free-Body, Formula Match, …). Authored bank still short of target (159 MCQs, 20
  worked examples); the NESA sheet values/flags need a diff against the real PDF.
