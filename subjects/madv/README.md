# Maths Advanced + Extension 1 (`madv`, namespace `MA`)

Port of the stand-alone **MathQuest** (`Maths-advanced-app`). Every `MQ` reference is renamed to `MA`,
since Maths Standard is `MS`. Currency: Primes 🔢. Coin rate is 0.6 and the level curve is `round(130·n^1.5)`.

## What it contains
- **629 MCQ** (424 Advanced, 205 Extension 1). All have worked explanations, all ids unchanged.
- **137 flashcards** (92 + 45) with graded Leitner review and named leeches.
- **75 generators**. Calculation Crunch checks make() against solve().
- **20 proofs** (12 derivations, 8 inductions), **124 formulas** with ✅/🧠 NESA flags, **17 reference sheets**, **84 achievements**.
- **Modes:** Rapid Fire, Topic Drill, Equivalence Engine (numeric equivalence via `MA.Expr`), Match Pairs,
  Read the Curve, Calculation Crunch, Table Panic, Calculus Lab, Proof Builder, Vector Lab (Ext 1),
  Induction Builder (Ext 1), Survival, Mistake Rehab and Starred.
- **Bosses:** 6 (The Inductor is Ext 1), plus The Final Paper.
- **Routes:** `home play game/<mode>/… study study/deck/<deck> study/leeches reference reference/<id>
  formulas progress achievements shop options`.

## What changed from the stand-alone app
- **The Extension 1 tier is now a live subject setting.** It was a build-time constant; now it is
  "I study Extension 1" on `options`, ON by default. It is stored as the coverage tag `ME`.
  `MA.DATA.TIERS` is a live getter, and every cache is keyed on `MA.DATA.tierKey()`. Switching it
  re-filters questions, cards, formulas, proofs, generators, reference sheets, modes, bosses,
  achievements, the daily rotation and the tool tray's sheet immediately. It never changes payouts.
- **State** now runs on `SQ.SubjectState`: 4 difficulties (with MathQuest's `timeScale`/`damage`
  aliased onto them), Ascension, daily plus 3 weekly quests, and graded Again/Hard/Good/Easy cards with
  leeches (4+ lapses). Rewards go through `SQ.UI.award`. The anti-farm gates are unchanged.
- **Read floor:** quiz, boss and Survival answers now use the length-scaled
  `max(MIN_READ_MS, UI.readFloor(stem))`.
- **Keyboard:** 1–4 or A–D answers, Enter moves on.
- **Home** gains "Up next": due cards, weak topics and leeches.
- **Removed, now owned by the app:** router, header, modals, save file, settings, profile sheet,
  service worker, arcade, and the toolbelt/calculator UI. The formula sheet is registered with
  `SQ.Tools.registerSheet("madv", …)` (`free` = NESA-printed). `#/formulas` keeps an unscored copy of
  the list.
- **CSS:** the maths render components (`.math .frac .sqrt .bigop .limop .vec .binom`, indices,
  `dot1/dot2`) now live in `css/madv.css`, scoped to `html[data-subject="madv"]`, with the
  `vertical-align` values copied exactly.
- **Themes:** the 10 old themes became app themes, so the shop sells 5 new ones: `madv-graphpaper`,
  `madv-blackboard`, `madv-blueprint`, `madv-parchment` and `madv-contour`. It keeps the 22 avatars
  and 3 crates.
- **Legacy import** (`importLegacy` in `manifest.js`) maps `mathquest.save.v1`. Old themes map to the
  app theme ids, and `boost` maps to `double`.

## Tests (`tests/subjects/madv/`)
- `validate.js`: 148 checks, including both tier configurations, legacy import and the live toggle.
  `BREAK=answer-first|tier-filter|escape|domain|minclean|curve-dupe|nesa-flag|tier-live` each makes it
  fail, as it should.
- `smoke.js`: every route and mode at 390 and 360 px, plus behaviour checks.
- `align.js`: alignment of the maths components, plus a parity check against the stand-alone app.
- `exploit.js`: the farming bot against an honest player.
- `marking.js`: the answer-marking half of the old `calc.js`.
- **Skipped:** `offline.js` and `arcade.js`, because offline and the arcade are app-level now.

## Known gaps
- Four alignment cases measure 0.405–0.407 em against the 0.344 axis, both here and in the
  stand-alone app on this machine's font. The values are unchanged and parity is checked.
- The off-sheet 🧠 reveal cost is set by `SQ.Tools` (−10 % latched, capped at −30 %) instead of
  MathQuest's −20 %.
- Radians/degrees was a calculator setting, so it goes to the shared tray.
- The typed working-out pad (`scratch`) goes to the shared tray and is not imported.
