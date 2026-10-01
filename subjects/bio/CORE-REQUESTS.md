# Biology → core requests

1. **Navbar built before the subject binds.** `SQ.UI.handleRoute` calls
   `setContext(id)` (and so `buildNav()`) while showing "Opening Biology…", before
   the subject's `SQ.UI.bind(id, {nav})` has run; after loading, `setContext` sees
   no change and never rebuilds, so a subject's custom `nav` is ignored on first
   open. *Workaround:* `manifest.boot()` calls `SQ.UI.buildNav()`.
   *Want:* `bind()` calls `buildNav()` when `id === context()` (or the loader
   rebuilds the nav after `boot()`).

2. **`SQ.Migrate.apply` leaves the loaded State stale.** It writes
   `d.subjects[id] = res.slot`, but `SQ.Store.slot()` caches the object it merged
   at load, which `X.State.data` still points at — mutations after import go to
   the orphaned object until reload. *Workaround:* Biology's `importLegacy`
   rebuilds the current (empty) slot object in place and returns it.
   *Want:* after assigning, `delete slotCache[id]` (export `SQ.Store.invalidate(id)`)
   and call `ns.State.load()`; or reload the page after a migration.

3. **Route names cannot carry a query.** `#/s/bio/atlas?d=x` parses as route
   name `atlas?d=x` and falls through to `home`. *Workaround:* `BIO.UI.go/href`
   rewrite `/atlas?d=x` → `/atlas/?d=x`. *Want:* `parseHash` strips `?…` from the
   name and passes `query` (an object) as a third argument to route handlers.

4. **Per-sheet reference pricing.** Biosphere charged a flat, latched **25 %** for
   opening its glossary (no exam data sheet exists for Biology). The shared tray
   charges −10 % per off-sheet item, latched, capped at −30 %. Biology registers
   every glossary term as `free:false` and accepts the shared rule for now.
   *Want (optional):* `registerSheet(id, { …, pricing: { flat: 0.25 } })` so a
   subject with no official sheet can price the whole sheet as one crutch.

5. **No "hide navbar" in game shells** (Biosphere hid its tab bar in runs).
   Not needed — noted only because `BIO.UI.hideTabs` is now a no-op.

6. The shell's `assets/icon*.png|svg` are referenced by index.html but not in
   the repo yet; each page load logs one `Failed to load resource`. Biology's
   browser tests filter that one message (as Biosphere's did for favicons).
