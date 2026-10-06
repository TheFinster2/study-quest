# Maths Extension 1 — core requests

1. **SQ.Tools sheet items carry `tier`.** Every item in the registered sheet has `tier: "MA"|"ME"`.
   Today mext re-registers the sheet whenever its Extension 1 toggle changes (`MX.State.onChange`).
   Wanted: `registerSheet` accepts `filter(item) → bool`, evaluated when the tray opens, so a subject
   doesn't have to re-register. Optional.
2. **`SQ.UI.bind` → `handleRoute`.** Every MathQuest mode's "Play again" re-runs the current route.
   mext adds `handleRoute: () => SQ.UI.handleRoute()` through `extend`. Wanted: bound
   `UI.handleRoute()` (or `UI.reload()`) as standard. Other ports will want it too.
3. **SQ.FX glyph particles.** MathQuest's confetti included maths-symbol glyphs, and `FX.symbols()`
   showered them. The shared canvas draws only circle/ring/line/paper, so mext fakes it with DOM spans
   (`MX.FX.symbols`). Wanted: `burst(..., { shape: "glyph", glyphs: [...] })` on the shared canvas,
   plus exposing `SQ.FX.burst(x, y, opts)` publicly.
4. **Legacy themes map to app theme ids.** MathQuest's ten themes were promoted to app themes, so
   `importLegacy` returns `themes` as **app** ids (`midnight`, `ember`, `lime`…), not `mext-` ids,
   and `profile.theme` likewise. `SQ.Migrate` should add them to `owned.themes` as given, without
   prefixing.
5. **Night-owl / early-bird flags.** These moved with the day streak into `SQ.Overall.touchStreak()`.
   mext's achievements read `SQ.Store.data.stats.nightOwl/earlyBird`. Please keep those names.
6. **Dev menu.** `MX.devActions` is defined in `manifest.js`, so it exists before the subject's code
   has loaded. Each `run()` needs the subject loaded, so the dev menu should `SQ.Loader.load("mext")`
   before calling it.
