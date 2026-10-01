# Economics — core requests

(Resolved since the port started, so dropped: navbar overflow at 360 px; route
names carrying a `?query`. Economics' dispatcher still reads `location.hash`
itself, which is harmless.)

1. **`results()` cannot show subject rows.** Economics shows its own rows
   (completion bonus withheld and why, multiplier, reference charge) on the
   screen under the results modal. `extraStats` suits 1–2 cells; a `rows`
   option rendering a compact list would let subjects drop the duplicate screen.

2. **A partial pace gate.** `pace:{items,tooFast}` zeroes a run only when EVERY
   item was too fast. Equilibrium also withheld the completion bonus when more
   than half were too fast (`readRatio < 0.5`); Economics keeps that in its own
   award wrapper. Wanted (optional): `pace.bonusBelow: 0.5` in SQ.UI.award.

3. **Precache.** subjects/econ added files (core/state.js, core/ui.js,
   data/mcq-extra.js, screens/*.js, css/econ.css, manifest.js changes); sw.js
   needs `node tools/precache.js` (not run: sw.js is outside subjects/econ).
