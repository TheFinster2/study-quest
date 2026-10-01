# Maths Standard — core requests

Worked around inside the subject for now; these would let the workarounds go.

1. **`SQ.Tools.used(kind)` → boolean** (and ideally `SQ.Tools.open(kind)`).
   NumberCrunch's results screen reported "Formula sheet: used — no XP cost" and
   kept a `sheetRuns` count, and its **F** key opened the sheet mid-run. The tray
   only exposes `penalty()` and `lookups()` (off-sheet reveals). Wanted:
   `SQ.Tools.used('sheet')` — true if the sheet panel was opened this run (free
   items included), reset by `mount()`; `SQ.Tools.open('sheet'|'calc'|'pad')`.
   `core/ui.js` already calls both if they exist.

2. **`SQ.UI.bind` should keep the core `route` reachable after `extend`.**
   `extend` overwrites bound methods of the same name; a subject that keeps its
   own `route(pattern)` loses the core `route(name)` it needs to register with.
   Worked around by binding without `extend`, capturing `bound.route`, then
   `Object.assign`. Wanted: `bound.coreRoute` (or `extend` never overriding
   `route/go/href/resolve`).

3. **A route-level error boundary.** `handleRoute` does not catch a throwing
   subject route; NumberCrunch's router rendered a "Something broke" card.
   Wanted: try/catch around `fn(view, args)` that logs with `console.error` and
   renders a card with a Back button.

4. **Crate loot tables.** `SQ.Shop.subject` crates take `rolls` + `better`
   only. NumberCrunch's crates had per-crate weight tables (and the top crate
   could roll Credits back). Wanted: optional `crate.table: [[powerupId|"coins", weight]]`
   and `crate.coinRoll`. Mapped onto `better` for now.

5. **`SQ.Shop` crate/purchase counters per subject.** Crates opened in a subject
   shop only bump the global `stats.cratesOpened`; the subject's crate
   achievements mirror that global number on shop render. Wanted: a hook
   (`catalog.onCrate(crate)`) or the subject id passed to `openCrate`.

6. **Toast icon.** `toast({icon:""})` falls back to ✨. NumberCrunch's messages
   lead with their own emoji; the wrapper strips it into `icon`. Fine as is —
   noting it in case other ports hit the same thing.
