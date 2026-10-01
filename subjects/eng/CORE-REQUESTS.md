# English — core requests

Status: 1–4 done in the core (sw.js, forceRefresh, modal aria-labelledby, nav aria-label, crate `table`); 5–6 handled subject-side.

1. **Service worker: never touch the Layer C model caches.** (sw.js does not exist yet.)
   - The activate-time sweep must never delete `closereading-model-v1` (written by
     `subjects/eng/core/mark.js`, 23 MB the student chose to download) nor
     `transformers-cache` (transformers.js with `useBrowserCache = true`). Sweep by the
     app's own prefix only.
   - Do **not** precache `subjects/eng/models/**` or `subjects/eng/vendor/**` (33 MB).
     `vendor/transformers/transformers.min.js` is a lazily `import()`ed ES module; it is
     deliberately absent from `manifest.js` and must stay out of any precache list.
   - Do not runtime-cache those paths into the app cache on fetch either (it would store
     33 MB twice). The fetch handler should serve them from `closereading-model-v1` when
     present: `caches.match(req, { cacheName: "closereading-model-v1" })`, then network.
   - `SQ.forceRefresh()` deletes **every** cache; it must keep `closereading-model-v1`
     (and `transformers-cache`). Wanted: `keys.filter(k => !/^closereading-model|^transformers-cache/.test(k))`.

2. **`SQ.UI.modal`: label the dialog.** Set `aria-labelledby` on the `.modal` box to its
   first `h2/h3` (give it an id). English's a11y suite asserted this in the stand-alone
   app; it now logs a note instead.

3. **`#navbar`: `aria-label="Main"`.** Same suite, same reason.

4. **Crates with a weight table.** `SQ.Shop.openCrate` only knows `better: true|false`.
   English's three crates had their own tables (`[["fifty",34],["skip",30],…]`,
   `data/shop.js`). Wanted: honour `crate.table` (array of `[powerupId, weight]`) when
   present. Until then English maps them to the shared common/better rolls.

5. **Keyboard play is per-subject.** The app has no global "1–4 / A–D picks a
   `.choice`, Enter presses `.js-next`/`.js-submit`" binding, so English installs its own
   (guarded by `SQ.UI.context() === "eng"`). Worth making app-wide.

6. **Results screen gating.** English's results open behind a "See your results ↑"
   button so the worked solutions stay readable (and a "Review the working" reopen).
   English keeps its own `results()` in `UI.bind(...).extend`; if the core grows a
   `gate: true` option English can drop it.
