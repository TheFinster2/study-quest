# Chemistry (MoleQuest), `chem` / `CHEM`

NSW HSC Chemistry, Modules 1–8, ported from the stand-alone MoleQuest app
(/home/user/Study-App). Currency: Moles 🪙 (coin rate 0.75). Level n costs
round(115·n^1.5), across 60 levels with Ascension.

## Contents (everything ported, ids unchanged)
- **1,091 MCQs** (M1 110 · M2 112 · M3 85 · M4 75 · M5 175 · M6 176 · M7 177 · M8 181)
- **263 flashcards**, 36 equations, 28 naming entries, a 29-node reaction graph with
  **44 pathway puzzles** and 19 reagents, ions/solubility/Ka/indicator tables,
  generated calculations, **65 achievements**, 10 themes, 22 avatars, 12 weekly quests.
- **11 modes**: Rapid Fire, Module Drill, Balance Blitz, Ion Memory, Name That Compound,
  Calculation Crunch, Precipitation Panic, Titration Lab, Pathway Puzzle, Survival,
  Mistake Rehab.
- **5 Exam Bosses**: Le Chatelier (heals), Titration Titan (draining clock), Carbon the
  Chainmaster (double damage), Spectra (hidden labels), The Final Paper (all four).
- **11 course-coverage switches** on `#/s/chem/options`.
- Routes: `home play game/<mode>/<arg> study study/leeches study/reference progress
  shop achievements options`.

## What changed from the stand-alone app
- The app now owns the router, header, modals, save, shop chrome, tool tray, sound
  context and particles. chem keeps its own util, bank, sounds and modes.
- **Data sheet**: the flat −20 % for opening it is gone. Everything is registered with
  `SQ.Tools.registerSheet`. Items on the NESA data sheet are free (constants, the main
  formulae, Ka/pKa, indicator colour ranges). Memorise-yourself items cost the core's
  off-sheet charge: flame tests, NaOH precipitates, polyatomic ions, the qualitative
  solubility grid, indicator choice, pOH, Ksp/K expressions and the combined gas law.
  The uncertain calls are commented in manifest.js. The atom tally (−25 %) and the pH
  meter (−30 %) are unchanged.
- **Upgrades**: Gentle difficulty (easier draws, more time, softer bosses). Graded
  flashcards (Again/Hard/Good/Easy) with named leeches, paying only for genuinely due
  cards after the shared read floor. The shared read floor on every MCQ mode, now also
  in Survival and in boss consolation XP. Keyboard play (1–4/A–D) in every MCQ mode
  and in flashcards. Mistake Rehab, daily and weekly run on the factory.
- **Exploit fixes found by the new bot tests**:
  - Balance Blitz added the streak bonus even after zero solves; it now goes through
    the accuracy gate.
  - Ion Memory's 0.25 efficiency floor paid random flipping; below 0.35 a board now
    pays nothing.
  - Titration: declaring at 0 mL and answering "0" paid the calculation XP. It now
    needs a titre of at least 1 mL, and full pay only after a good end point.
  - Pathway Puzzle floored XP per round, so one lucky one-step guess paid however much
    the run wasted. XP is now netted over the whole run.
  - Precipitation Panic: a one-answer board could still net about 50 XP. Boards are now
    drawn 40–60 % soluble against a 60 % baseline.
  - Flashcards: a double-tap on the last card ran finish (and paid) twice. Fixed.
- Crates roll shared power-ups only, so roll counts were raised in place of the old
  Moles. Power-up ids map to the shared set (Catalyst → double, Adrenaline → revive).
- `importLegacy` maps a `molequest.save.v1` save. Themes become `chem-<name>`.
- The old arcade isn't ported; see arcade-skins.md for its visuals.
- Dev presets are in `CHEM.devActions` (new; the old app had none).

## Tests
`node tests/subjects/chem/{validate,smoke,exploit,honest}.js`. bots.js is shared by
the last two, and each mode sets `CHEM.__current` as the honest bot's answer key.

## Known gaps
- Rapid Fire pays fast honest play well: about 5,000 XP for 2 minutes at roughly 1.6 s
  per answer, with the ×3 streak multiplier. This is MoleQuest's tuning and was left
  as is.
- The bots don't drive Balance Blitz to the end at random. Random coefficients never
  balance, so that run stops on equation 1 having earned 0.
