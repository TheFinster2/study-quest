# The shared tool tray — `SQ.Tools` and `SQ.Expr`

Files: `js/sq/tools.js`, `js/sq/expr.js`, `css/tools.css`, tests in `tests/tools/`.

## For a subject port

```js
// once, in boot()
SQ.Tools.registerSheet("phys", {
  title: "HSC Physics data sheet",
  render: html => PHYS.U.math(html),               // optional; applied to body, note, symbol, unit
  constants: [{ id: "g", name: "Earth's gravitational acceleration", symbol: "g", value: 9.8,
                unit: "m s^-2", free: true, aliases: ["gE"], display: "9.8", note: "" }],
  sections: [{ id: "motion", title: "Motion",
               items: [{ id: "suvat", name: "v = u + at", body: "v = u + at", free: true, note: "" }] }]
});
```

- `gameShell` mounts the tray: `SQ.Tools.mount({ subject, scored, calc = true, sheet = true, pad = true })`.
  Pass `tools: false` for screens that should not have it, and `scored: false` for practice screens.
- The router calls `SQ.Tools.unmount()` on every route change.
- Mark answer fields `class="… js-answer"`. "→ Answer" fills the first visible, enabled `.js-answer` in `#view`
  (or else the input/textarea in `#view` that last had focus). It sets `.value` (or `textContent`) and dispatches a
  bubbling `input` event. It does **not** focus the field.
- The question mirror copies `#view .qtext`, with buttons, inputs and ids stripped. A MutationObserver keeps it current.

## API

| call | returns |
|---|---|
| `registerSheet(id, sheet)`, `getSheet(id)` | the normalised sheet |
| `mount(opts)`, `unmount()` | — |
| `penalty()` | `1, 0.9, 0.8, 0.7` (−10 % per distinct paid reveal, capped at −30 %) |
| `lookups()` | `[{ id, name }]` revealed this run, in order |
| `lookupLabel()` | `"Off-sheet: Coulomb constant, GM_E (−20%)"`, or `null` if nothing was revealed |
| `open(tab)`, `close()`, `toggle(tab)`, `isOpen()`, `tab()` | tab is `"calc"`, `"sheet"` or `"pad"` |
| `reveal(id)`, `isRevealed(id)` | charge for an entry from your own UI, or ask whether one is revealed |
| `resetRun()` | clears the ledger by hand (mount already does this) |
| `constants()` | `{ id: value }` for the constants the calculator can use right now |
| `sheetPanel(host, { subject, scored:false })` | a sheet element for a subject's own reference screen |
| `mounted()` | `{ subject, scored, tabs }`, or `null` |

## How charging works

- An item or constant with `free: true` is always shown.
- Anything else is locked while the run is scored. Its content is **not in the DOM** until the student pays
  "Show (−10%)", and a locked constant is refused by the calculator.
- A reveal is one-way. Re-reading an entry, closing the tray or switching tabs refunds nothing and charges
  nothing twice. Once the charge reaches −30 %, more reveals cost nothing extra and the button says so.
- An unscored mount shows everything and never charges.
- The ledger resets on `mount()`. It stays in force for one route change after the run, so a results
  route still pays the charge. It then clears, so it cannot tax an unrelated screen.
- `UI.award` multiplies XP by `penalty()`.
- `UI.results` shows the number of lookups. It does not name them; use `lookupLabel()` if your screen should.

## The calculator

- Nothing in the calculator can take text focus. There is no `<input>`, and every key calls `preventDefault()`
  on pointerdown. Opening the tray blurs any focused answer field, which drops the soft keyboard.
- **⌨** is opt-in. It swaps in an `<input inputmode="text">` for typing with the device keyboard.
- A physical keyboard types straight into the calculator while it is open. Those keys are stopped there, so a
  mode's 1–4 and Enter handlers do not fire.
- Keypad: 6 × 7 keys, at least 44 px each at 360 px wide.
  - Main layer: DEG/RAD, sin, cos, tan, x², √, ln, log, π, e, xʸ, x!, 1/x, nCr, %, ±, Ans, ×10ˣ, M+, MR, → Answer.
  - 2nd layer (one-shot): the inverse trig functions, x³, ∛, eˣ, 10ˣ, the comma, |x|, nPr, **const** (a picker for
    the sheet's constants) and MC.
- Each `=` adds a line to the working tape. The Working tab lists the tape; tap a line to reuse it.
- The calculator pays nothing.

`SQ.Expr.evaluate(src, { deg, ans, mem, consts })` returns `{ ok, value }` or `{ ok:false, error }`. It is a
recursive-descent parser with no `eval` or `Function`. See the header of `expr.js` for the grammar. Some rules:

- `-2^2` is −4.
- `2^3^2` is 512.
- Implicit multiplication covers a name or a bracket (`2pi`, `3(4+5)`), but never a number after a number.
- `e` is Euler's number unless the subject's sheet defines a constant `e`.

Helpers:

- `format(x)` — display form, e.g. `6.626×10⁻³⁴`.
- `tex(x)` — `6.626 \times 10^{-34}`.
- `plain(x)` — the number typed into an answer box.
- `evalString(src)` — a number, or `null`.

## Keyboard

| key | action |
|---|---|
| **C** | calculator |
| **F** | sheet |
| **W** | working pad |
| **Esc** | close the tray |

The plain letters work only when the screen has no `.choice` answer buttons, because on such a screen C is
answer C. **Alt + letter** always works.

## Saved data

Stored in `SQ.Store.data.tools`, created lazily:

```js
{ calc: { deg: true, qsize: 1, tape: { phys: [{ src, value }] } },   // ≤ 12 lines per subject
  pad:  { phys: { notes: "" } } }                                    // ≤ 4 000 chars per subject
```

The whole object is kept under 8 kB. When it would go over, the oldest tape lines are dropped first, then the
note being typed is cut. Drawings on the pad are kept only for the run.

## Tests

- `node tests/tools/expr.js` — the Physics calculator table, the Maths Advanced sums and the merged features.
- `node tests/tools/tray.js` — Playwright at 360 px on a scored `gameShell` test route. It uses the demo sheet
  in `tests/tools/fixtures.js`; the app registers no demo sheet.
