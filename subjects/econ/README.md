# Economics (Equilibrium) in StudyQuest

Subject id `econ`, namespace `ECON`, currency Dollars 💲. Ported from the
stand-alone Equilibrium app (/home/user/Economics-App), which was a fork of
the Biology app's engine.

## What it contains

| | count |
|---|---|
| Multiple choice | 182 (132 ported + 50 new, 5 per topic) |
| Flashcards | 113 |
| Short answer (Response Builder) | 6 |
| Calculation templates (two-route verified) | 14 |
| Shift It scenarios (outcome derived by `C.shiftOutcome`) | 17 |
| Diagrams (Label It / Atlas) | 12 |
| Datasets / sort sets / sequences | 5 / 7 / 6 |
| Glossary terms (the tool-tray reference sheet) | 142 |
| Achievements | 43 (23 ported + 20 new) |
| Avatars / themes | 22 / 5 |

Modes: Rapid Fire, Topic Drill, Calculation Lab, Shift It, Term Match, Label It,
Data Detective, Sort It, Process Order, Survival, Mistake Rehab, Response
Builder, Topic Bosses, Flashcards. Screens: Home (dashboard), Play, Study (cards,
leeches, Atlas, Glossary), Progress (Ascension, bosses, mastery, coverage,
totals, achievements), Options (course coverage packs, Response Builder hints),
Shop (shared renderer). Routes keep Equilibrium's paths: `#/s/econ/play/drill?mod=P3`.

## What changed from the stand-alone app

- **State** is `SQ.SubjectState.create("econ")`. Slot mapping: `cards → srs`
  (box 0–4 → 1–5, due ms → day key), `missed → mistakes` (Equilibrium's rule
  kept: a miss is retired by as many clean answers as it has outstanding),
  `bests → scores` (calc/shift counts into `stats`), `coverage → settings.hidden`,
  level from cumulative xp → `level / xpIntoLevel`. `seen`, `shortLog`,
  `genSeeds`, `diagramSeen` stay as Economics ledgers. `importLegacy` maps an old
  `equilibrium.save.v1` save, renames power-ups and prefixes themes `econ-`.
- **UI** is `SQ.UI.bind("econ")` plus Economics helpers (core/ui.js): a path
  router dispatched from the core's first segment, an `award()` that maps
  Equilibrium's options onto `SQ.UI.award` (difficulty, prestige, ×4 cap,
  crutch, coin rate 0.75, Stars all in the core; Economics keeps its
  "bonus withheld when more than half the run was answered too fast" gate and
  passes `pace`), `shell()` over the core gameShell, `report()` = Equilibrium's
  results screen with the core results modal over it.
- **Read floor**: MCQ, calc, term, diagram, data, shift, card and boss answers
  use `UI.readFloor(text)` instead of a flat 1.2 s.
- **Tool tray**: Equilibrium's own tray is gone. The glossary is registered with
  `SQ.Tools.registerSheet` grouped by topic, every item `free:false` (there is no
  HSC Economics data sheet) — the old flat −25% became the shared −10%-per-reveal
  latch, capped at −30%. Term Match and Label It mount `sheet:false`;
  flashcards and reference screens mount nothing. Calculator on.
- **Upgrades**: four difficulties (shop), Ascension on Progress, a subject daily
  and three weekly quests (Home), graded cards with named leeches (Study), HP-duel
  bosses (below), keyboard play (1–4/A–D, Enter), 44 px targets.
- **Bosses**: the five 20-question module tests became timed HP duels:
  The Invisible Hand (P1–P2, hides topic labels), Market Shock (P3–P4, options
  rotate every 3 s), Budget Deficit (P5–P6, heals every third question), The
  Current Account (H1–H2, double damage), The Reserve Bank (H3–H4, damage rises
  25% every three questions), and The Final Paper (everything, all gimmicks).
  Unread answers deal no damage, so a tap-bot cannot win.
- **Themes** converted to core tokens as `econ-ledger` (default, free), `econ-indigo`,
  `econ-ochre`, `econ-slate`, `econ-daylight`; Economics' own token names are
  aliased under `html[data-subject="econ"]`. Component CSS is scoped to the
  `.econ-app` wrapper each screen renders into.
- **Bug fixes found in porting**: Bank.draw stopped early (a 15-question drill
  from 18 drew 9); Shift It called an undefined `S.markMissed` on a wrong
  answer; Narrow the field could disable the correct option (it indexed the
  shuffled DOM by option index); streak achievements were never checked;
  "In your own words" needed 20 of 6 short answers (now 20 paid answers).
- Dropped: Equilibrium's router, header, modals/toasts, save/persist, service
  worker, tool tray, own arcade (the shared arcade has Economics skins — see
  arcade-skins.md) and the #/dev screen (its presets are `ECON.devActions`).

## Tests (`tests/subjects/econ/`)

validate, calc, coverage, diagram, tools (adapted to SQ.Tools), exploit, honest,
smoke (every route/mode at 390 and 360 px), prove (fault injection; skipped
under tests/run.js unless `PROVE=1`).

## Known gaps

- Content is still thin against Equilibrium's own targets (MCQ 182/1000, short
  answer 6/150, cards 113/400).
- See CORE-REQUESTS.md.
