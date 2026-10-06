# Maths Extension 1 (`mext`, namespace `MX`)

Split out of Maths Advanced (MathQuest), where Extension 1 used to be a tier toggled on
and off inside one subject. It is now its own subject with its own levels, Lemmas 📜,
shop, daily, weekly quests and achievements.

- Same engine as `subjects/madv` (copied, namespace `MA` → `MX`), with
  `data/tiers.js` pinned to `["ME"]`: only ME- questions, cards, proofs, generators,
  formulas and reference sheets.
- Modes: everything with Extension 1 content, plus Vector Lab and the Induction
  Builder. Calculus Lab is Advanced-only and is not offered here (nor in the daily, its
  weekly quest or its achievements). The bosses draw Extension 1 questions in their
  areas, and The Inductor is here.
- Choosing Extension 1 also enrols Maths Advanced (every Extension 1 student sits it);
  removing Advanced removes Extension 1.
- An old MathQuest save imports into Maths Advanced only (one save, one import), so
  Extension 1 starts fresh — no XP is counted twice.
- Tests: `tests/subjects/mext/` (validate, smoke, align, marking, exploit).
