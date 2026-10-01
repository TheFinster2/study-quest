# Biology (Biosphere) in StudyQuest

Subject id `bio`, namespace `BIO`, currency Biocredits ◉. Ported from
`/home/user/Biology-App` (Biosphere 1.6.1).

## What it contains
- **Content (unchanged, ids stable):** 522 MCQ (with a `why` and a reason per
  distractor), 112 short-answer questions with criteria and samples, 461
  flashcards, 35 labelled SVG diagrams, 23 genetics templates (13 cross + 10
  pedigree families), 20 process sequences, 22 sort sets, 15 datasets, 216
  glossary terms, 14 coverage packs, 60 level titles, 22 avatars, 5 themes.
- **14 modes:** Rapid Fire, Module Drill, Punnett Lab, Pedigree Detective, Term
  Match, Label It, Data Detective, Sort It, Process Order, Survival, Mistake Rehab,
  Response Builder, Flashcards, Module Bosses.
- **Screens** (`#/s/bio/…`): `home` (dashboard), `play` (mode list), `play/<mode>`
  (alias `game/<mode>`), `study` (cards, leeches), `atlas`, `reference`, `progress`,
  `options` (coverage packs, Response Builder hints), `shop`.
- Subject code kept as it was: `core/util.js`, `genetics.js`, `diagram.js`,
  `mark.js`, `coverage.js`, `bank.js`.

## What changed from the stand-alone app
- **State** is `SQ.SubjectState.create("bio")` (see header of `core/state.js` for
  the field mapping): level/xpIntoLevel replace the XP-derived level (same curve),
  `cards` → `srs` (factory `reviewCard` with again/hard/good/easy), coverage →
  factory hidden tags, bosses → `bossesBeaten`. `seen`, `missed` (rehab: two clean
  answers retire), `shortLog`, `genSeeds`, `diagramSeen`, `bests` stay.
- **UI** is `SQ.UI.bind("bio")`; `core/ui.js` keeps Biosphere's call shapes
  (`route(path, fn(view, r))`, `gameShell(view, cfg)`, `modal({title, body, actions})`,
  full-screen `results`) on top of the shared shell, so the modes barely changed.
  `award()` translates Biosphere's options and calls the shared pipeline — the only
  place in the subject that pays XP (asserted by `exploit.js`).
- **Tool tray** is the shared one. The glossary is the sheet: every term
  `free:false`, grouped by module; withheld in Term Match, Label It and bosses.
  The flat 25 % reference charge became the shared per-lookup charge (CORE-REQUESTS #4).
- **Upgrades:** four difficulties and prestige (factory; Ascension on Progress);
  subject daily + 3 weekly quests from a pool of 10 (quest stats only move on
  read, paid work, so a bot cannot complete them); graded cards with named
  leeches; **HP-duel bosses** — 8 module bosses (shield, heal, rotate, drain,
  lifesteal, obscure, double, chronic) + the Final Paper (unlocks when all 8 are
  beaten), unlocked by 30 questions seen per module as before, no reference;
  45 achievements (23 original ids + 22 new) paying biocredits; the shared read
  floor (`UI.readFloor`) on MCQ answers; keyboard play (1–4 / A–D, Enter);
  timers in Sort It and Survival now scale with difficulty.
- Themes renamed `bio-verdant|reef|savanna|tundra|daylight` on core tokens;
  Biosphere's tokens (`--bg`, `--ink-2`, `--card-3`…) aliased under
  `html[data-subject="bio"]`. Verdant is no longer free (the app default is shared).
- Arcade, router, service worker, export/import, sound/motion settings, the
  onboarding modal and the dev panel UI are the app's. Dev presets →
  `BIO.devActions`. Arcade skin notes: `arcade-skins.md`.
- `importLegacy` maps a `biosphere.save.v1` save (XP → level, cards → srs, bosses,
  themes, coverage, difficulty, power-ups).
- Fixed on the way: 50/50 could disable the correct option (it indexed the
  shuffled buttons by original option index).

## Tests (`tests/subjects/bio/`)
`validate.js` (content, per-module length bias ≤ 36 %, bigram near-duplicates,
recorded length-bias rewrites, bosses, achievements, manifest load list, CSS
scoping), `genetics.js` (3125 cross verifications, 240 pedigrees), `smoke.js`
(every screen/mode/boss at 390 + 360 px), `diagram.js` (44 px hit areas, label
bank below the artwork), `coverage.js`, `tools.js`, `legacy.js`, `exploit.js`
(bad bot earns 0), `honest.js` (good bot earns in every mode, beats a boss),
`prove.js` (every fault-injection mode must be caught; `QUICK=1` = node suites only).
`fix-length-bias.js` + `length-bias-patches.js` are Biosphere's authoring record.

## Known gaps
- MCQ 522 / 1000 and short answers 112 / 150 against Biosphere's own targets.
- Biosphere's `offline.js` / `update.js` (service worker) belong to the app now.
- The reference sheet uses the placeholder `SQ.Tools`; its UI and latch are
  exercised through stubs until the real tray lands.
- Biosphere's coverage test had an accidental pass (it expected Rapid Fire to
  empty with every pack hidden; 154 Year-12 questions stay on). The port tests a
  Year 11 drill instead.
