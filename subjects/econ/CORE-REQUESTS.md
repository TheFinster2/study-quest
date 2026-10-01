# Economics — core requests

1. **Navbar overflows at 360 px.** With "All" + five subject items, `.nav-item`
   boxes extend past the right edge at 360 px (document scrollWidth is fine, the
   fixed bar clips). tests/lib/browser.js `overflow()` reports it on every subject
   screen, so the Economics smoke test uses its own check scoped to `#view` and
   `#modal-root`. Wanted: `.navbar` items `flex:1 1 0; min-width:0` (or smaller
   padding under 380 px).

2. **Route names with a query.** `#/s/econ/atlas?d=x` makes `parseHash` return the
   name `atlas?d=x`, which no table has, so it falls back to `home`. Economics
   works around it by re-reading `location.hash` in its dispatcher. Wanted:
   `parseHash` strips `?…` into `r.query` (and passes it as a third argument),
   and `highlightNav` uses the stripped name.

3. **`results()` cannot show subject rows.** Economics shows its own rows
   (completion bonus withheld and why, multiplier, reference charge) on the
   screen under the modal. `extraStats` is fine for 1–2 cells; a `rows`
   option rendering a compact list would let subjects drop the duplicate screen.

4. **A readRatio-style pace gate.** `pace:{items,tooFast}` zeroes a run only when
   EVERY item was too fast. Equilibrium also withheld the completion bonus when
   more than half were too fast (`readRatio < 0.5`); Economics keeps that in its
   own award wrapper. Wanted (optional): `pace.bonusBelow: 0.5`.
