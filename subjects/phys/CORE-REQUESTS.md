# Physics — core requests

1. **Subject nav overflows at 360 px** (`js/sq/ui.js` buildNav). "All" + five items
   pushes "Shop" off the right edge of the fixed navbar at 360 px (screenshot-visible;
   `overflow()` in tests/lib/browser.js skips `position:fixed` so tests do not see it).
   Wanted: `.navbar` items `flex:1; min-width:0` with the label ellipsised, or allow
   `nav` ≤ 4 items when the hub item is prepended.

2. **A read floor that tells modes the floor it used.** `SQ.UI.readFloor(text)` is
   fine; Physics keeps its own `pacer()` in front of `award()` (a run where EVERY
   answer was under the floor pays nothing, coins included). Wanted, optional:
   `award({ pace: { items, tooFast } })` honoured by `SQ.UI.award` so every subject
   gets the all-too-fast gate structurally. Worked around in `subjects/phys/core/ui.js`.

3. **Off-sheet charge on coins.** The stand-alone app applied the sheet penalty to
   Joules as well as XP; `SQ.UI.award` applies `formulaPenalty()` to XP only. Worked
   around by pre-multiplying coins in PHYS.UI.award. Wanted: apply `crutch` to coins
   in `award()` too.

4. **`registerSheet` extras.** Physics passes `aliases` (`k`→`kCoulomb`, `qe`→`e`,
   `eps`→`eps0`, `GMe`→`GME`), `sf` on constants, and the 10 question-supplied values
   (`mSun`, `AU`, `ly`…) as `free:false` constants — the stand-alone calculator
   accepted all of these by name. Please honour `aliases` and supplied ids in SQ.Expr.

5. **Double XP / Freeze / Shield** power-ups were sold but never implemented in the
   stand-alone Physics modes. Not added here; a shared `SQ.UI.powerups(row, {...})`
   helper (the Chemistry-lineage row) would let every subject wire them identically.
