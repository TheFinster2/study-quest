# Maths Standard (`mstd`, namespace `MS`)

HSC Mathematics Standard 2, ported from the stand-alone **NumberCrunch**
(`/home/user/Maths-Study-App`, namespace `MQ`). Every `MQ` is now `MS`, and the
stand-alone `window.U`, `window.State`, `window.UI` and `window.Bank` globals are
gone (validate.js asserts no global `U`/`MQ` leaks).

## What is in it

- **534 multiple-choice questions** (406 across the 16 topics + 128 foundation
  "warm-up" questions), **105 flashcards**, **75 procedural generators** (money in
  integer cents), **81 achievements**, **16 topics** MS-A1 … MS-N2, 7 reference
  pages, annuity FV/PV tables, network puzzle data, pair sets.
- **Modes:** Rapid Fire, Topic Drill, Survival, Mistake Rehab, Calculation Crunch
  (also per topic: `game/crunch/<code>`), Read the Display, Table Trek, Unit Chain,
  Match Pairs, Conversion Panic, Critical Path, Loan Lab, Bearings Lab.
- **Bosses:** The Taxman (heals), Compound (HP grows), The Surveyor (rotating
  options), Sigma (power-up lottery), The Critical Path (turn limit), and The Final
  Paper (25 questions, 3 lives), unlocked in a ladder.
- Flashcards by topic, reference shelf, progress with per-topic detail,
  achievements, weekly quests, daily challenge, Ascension.

Routes (all under `#/s/mstd/`): `home play study study/deck/:topic study/leeches
study/bookmarks progress progress/:topic shop reference reference/:id options
achievements quests daily ascend bosses about game/<mode> game/drill/:topic
game/crunch/:topic game/boss/:id game/bookmarks`.

## How it sits on the core

- `core/state.js` — `MS.State = SQ.SubjectState.create('mstd', …)`, with the
  NumberCrunch → slot mapping documented at the top of the file (topics →
  modules, cards → srs, modes → modesPlayed/scores, pow → shared inventory,
  ach → achievements, bosses → bossesBeaten, ascensions → prestige). Kept: the
  per-question ledger `q{}` (adaptive draw + Mistake Rehab), `qtier`, `kbd`,
  `seen`, and all NumberCrunch stats. Colliding names were renamed at call sites:
  `answer()`, `masteryFrac()`, `tierOf()`, `dueIds()`. Curve 130·n^1.5, 60 titles.
- `core/ui.js` — `MS.UI = SQ.UI.bind('mstd', …)` plus NumberCrunch's vocabulary:
  pattern routes (`/game/drill/:topic`, dispatched per first segment), the spec
  modal, results (rank, §H4 reconcile line, §H1 "Review the working"), `pool()`,
  `choiceBlock`, `numberField` (`js-answer`), keyboard maps. **award()** keeps
  NumberCrunch's rules in front of `SQ.UI.award`: no `answered` → no bonus;
  coins ×0.35 below 50% accuracy (then the 0.6 coin rate); the day-streak bonus
  (+4/day, max 60); `mode` marks a finished game. Read floor = `SQ.UI.readFloor`.
  Diff-0 questions pay ×0.6 in the pool.
- Audio plays through `SQ.Sound.shared()`; FX forwards to `SQ.FX`.
- Every screen and dialog renders inside `.ms-root`; `css/mstd.css` is scoped to
  `html[data-subject="mstd"] .ms-root`, so NumberCrunch's `.btn/.card/.chip`
  never touch the shared chrome or shop. Its tokens (`--bg --panel --panel2 --dim
  --accent2`) are aliased onto the core tokens.

## Upgrades from the stand-alone app

- **Tool tray** (calculator, sheet, working pad) in every run — NumberCrunch had
  none. `core/sheet.js` registers the NESA Standard 2 reference sheet: on-sheet
  formulas `free:true`; recall-only ones (I = Prn, annuity formulas, GST, mean,
  IQR, gradient, fuel, Pythagoras…) `free:false`. Uncertain calls are commented.
- Four difficulties (adds **Gentle**); boss HP scales by `difficulty().boss`.
- **Graded flashcards** (Again/Hard/Good/Easy, keys 1–4) and a **Leeches** page.
- **Bookmarks** (🏷️ Save under any bank question, a bookmark run).
- **Coverage toggles** per topic on `options` (hidden topics drop out of mixed
  draws; payouts unchanged). Keyboard A–D as well as 1–4.
- Shared daily/weekly (NumberCrunch's 8 daily kinds and 12 quests kept), Ascension
  on the core (+12%/prestige, 2,500 Credits, 3 Double XP).
- Shop via `SQ.Shop.subject`: the 10 themes as `mstd-<name>` (css/themes.css),
  22 avatars, 3 crates.

## Changed / dropped

- Router, header, toasts, modal root, save/persistence, service worker, arcade and
  app boot are the app's. Name/avatar/sound/export/import live in app Settings.
- Power-ups are sold in the general shop (Stars). `buffer` → `shield`, `boost` →
  `double`; **Adrenaline** (+50% XP, faster clock) has no shared equivalent and was
  removed from the modes (legacy stock imports as Double XP).
- Daily reward is fixed at 575 XP / 85 Credits (was 400–750 / 60–110 by date).
- Crates use the shared loot table (see CORE-REQUESTS.md #4).
- The sheet's F key and "sheet used" report wait on `SQ.Tools.open/used`
  (CORE-REQUESTS.md #1); the tray placeholder has no UI yet.
- `bossWins` now counts every victory (NumberCrunch counted first kills only).

## Tests (`tests/subjects/mstd/`)

- `validate.js` — the 117-check content validator ported (bank shape, tiers,
  answer-length bias, near-duplicates, notation, money, annuity tables, networks,
  generators, economy), plus sheet, manifest wiring, CSS scoping, stray-`MQ` and
  legacy-import checks.
- `smoke.js` — every route/mode at 390 and 360 px; console, overflow and
  behaviour checks.
- `exploit.js` — spam bot vs honest bot, and the award()/pool gate arithmetic.
- `break.js` — mutation harness for the guards that are still subject code.
- Not ported (app-level now): offline.js, update.js, fingerprint.js, perf.js,
  arcade.js.

## Known gaps

- Crates lost their per-crate tables and the Credits-back roll.
- Crate achievements read the global crate counter.
- No dev presets existed; two were added (`MS.devActions`: level 40, beat bosses).
