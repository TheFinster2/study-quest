# ★ StudyQuest — HSC, all in one

One offline study game for NSW HSC **Chemistry, Physics, Biology, Economics, English
Advanced, Maths Standard 2 and Maths Advanced / Extension 1**. It merges seven
stand-alone apps — MoleQuest, Newton's Notebook, Biosphere, Equilibrium, Close Reading,
NumberCrunch and MathQuest — into one, keeping every question, mode and boss, and
giving each subject the best version of every shared system.

No build step, no dependencies, no account, no network. **Open `index.html` and play.**

## How it fits together

- **Subjects stay separate.** Each has its own levels (60, with Ascension), its own
  coins (Moles, Joules, Biocredits, Dollars, Marks, Credits, Primes, Lemmas), modes, bosses,
  flashcards, mistakes, achievements, daily challenge, weekly quests, difficulty and
  shop. Only the subjects you pick appear on your hub.
- **The whole has a level too.** Every XP you earn in any subject also builds your
  **overall level** (100 levels) and pays **Stars ⭐**, the general currency.
- **Two kinds of shop.** The *general shop* (Stars) sells power-ups usable in every
  subject, crates, arcade time, app themes and avatars. Each *subject shop* (that
  subject's coins) sells its themes, avatars, arcade skins and crates, sets the
  subject's difficulty, and has the Exchange (coins → Stars) for coins you no longer need.
- **One arcade.** The best engine of each genre from the seven apps — match-3, runner,
  2048, memory pairs, Phagocyte, Bargain Hunt — with a skin per subject. Time is
  rented with Stars and only runs while a game is on screen. The arcade pays nothing
  but high scores.
- **One tool tray** in every scored mode: a scientific calculator that never raises
  the phone keyboard and types its answer into the box, the subject's reference sheet
  (free where the exam gives it, a latched XP cost where it doesn't), and a working pad.

## Your old progress

If you used the old apps from `thefinster2.github.io`, StudyQuest served from the same
site finds their saves on first launch and offers to bring them across (Settings →
*Bring across the old apps* to look again). An exported JSON from any old app can be
imported from Settings too. The old apps keep their copies.

## Putting it on your phone

Publish with GitHub Pages (**Settings → Pages → Deploy from a branch**), open
`https://thefinster2.github.io/study-quest/` once while online, then *Add to Home
Screen*. The service worker precaches everything, so it then works with no signal.
(English's optional semantic-marking model is a separate 34 MB download you opt into
inside English.)

## What's in each subject

| Subject | Content | Notable |
|---|---|---|
| ⚗️ Chemistry | 1,091 MCQs, 263 cards, 44 pathway puzzles | 11 modes, 5 Exam Bosses, titration lab, coverage switches |
| 🔭 Physics | 159 MCQs + 101 seeded generators, 257 cards | Unit-aware marking, free-body builder, circuit bench, 5 bosses |
| 🧬 Biology | 522 MCQs, 112 short answers, 461 cards, 35 diagrams | Genetics engine, Atlas, **new** HP-duel bosses (8 + Final Paper) |
| 📊 Economics | 182 MCQs, 113 cards, 14 calc templates | Shift It, diagrams, **new** HP-duel bosses (5 + Final Paper) |
| 🖋️ English Advanced | 403 MCQs, 324 quotes, 62 free-text prompts | Marking Desk, Quote Vault, optional offline AI marking |
| 📐 Maths Standard | 534 MCQs, 105 cards, 75 generators | **New:** calculator, reference sheet, working pad |
| ∫ Maths Advanced | 424 MCQs, Advanced cards, 55 generators | Calculus Lab, Equivalence Engine, 5 bosses |
| ∑ Maths Extension 1 | 205 MCQs, Ext 1 cards, 20 generators, 11 proofs | Vector Lab, Induction Builder, The Inductor — its own subject; choosing it enrols Advanced too |

Every subject has: four difficulties (Gentle → Nightmare), Ascension at level 60, a
daily challenge and weekly quests, graded flashcards (again/hard/good/easy) with
named leeches, Mistake Rehab, coverage toggles, keyboard play, and the shared tool tray.

## Known gaps

- Biology and Economics have less content than their own original targets
  (Biology 522/1000 MCQ, Economics 182/1000 MCQ and 6 short answers). The 50 new
  Economics MCQs are the newest content and worth a read-through.
- Physics' puzzle modes (Free-Body Builder, Circuit Bench, …) take no power-ups; its
  quiz modes and bosses take all of them.
- Biology's boss re-clears are its best-paying activity (within the anti-farm limits).

## For developers

- `docs/ARCHITECTURE.md` — the shape of the app and the contract every subject follows.
- `node tests/run.js` runs every suite (`node tests/run.js chem` for one subject) —
  57 suites: the shell (hub, migration, offline, validation), the tool tray, the
  arcade, and each subject's content validation, browser smoke test at 390/360 px,
  and anti-farm bots (a random-fast bot must earn ~0 XP; an honest one must be paid).
- Each subject's `subjects/<id>/README.md` says what changed from its stand-alone app.
- After changing any shipped file: `node tools/precache.js` (the tests fail otherwise).
