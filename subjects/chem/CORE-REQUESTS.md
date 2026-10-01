# Chemistry → core requests

1. **Missing subject themes.css 404 on file://.** index.html links
   `subjects/<id>/css/themes.css` for all seven subjects; until every port lands,
   the missing ones log `Failed to load resource` console errors on every page.
   chem's smoke test filters resource 404s (and asserts chem.css loaded instead).
   Wanted: index.html skips missing files (e.g. `onerror="this.remove()"`), or every
   subject dir gets a stub themes.css up front.
2. **A shared test hook for the answer key.** chem sets `CHEM.__current = { mode, kind,
   answer, stem, shownAt, … }` in every mode so the honest bot can play well. If
   others do the same, a core name helps: `SQ.UI.testHook(subjectId, obj)` →
   `window.__sq.current`.
3. **Crates that pay subject coins.** MoleQuest's crates gave a few Moles as well as
   power-ups. The shared crate only rolls power-ups, so chem raised the roll counts
   instead. Wanted (optional): a crate field `coins: [min, max]` paid in the subject's
   currency.
4. **Small API mismatches I aliased inside chem** (no action needed unless you want
   the names unified): `difficulty().timeScale/.damage` ↔ `.time/.boss`;
   `hiddenTags()` returns an array, chem's bank wants a Set.
