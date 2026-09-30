# ★ StudyQuest — HSC, all in one

One offline study game for NSW HSC **Chemistry, Physics, Biology, Economics, English
Advanced, Maths Standard 2 and Maths Advanced / Extension 1**. It merges seven
stand-alone apps — MoleQuest, Newton's Notebook, Biosphere, Equilibrium, Close Reading,
NumberCrunch and MathQuest — into one, keeping every question, mode and boss, and
giving each subject the best version of every shared system.

No build step, no dependencies, no account, no network. **Open `index.html` and play.**

## How it fits together

- **Subjects stay separate.** Each has its own levels (60, with Ascension), its own
  coins (Moles, Joules, Biocredits, Dollars, Marks, Credits, Primes), modes, bosses,
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

## For developers

- `docs/ARCHITECTURE.md` — the shape of the app and the contract every subject follows.
- `node tests/run.js` runs every suite (`node tests/run.js chem` for one subject).
- After changing any shipped file: `node tools/precache.js` (the tests fail otherwise).
