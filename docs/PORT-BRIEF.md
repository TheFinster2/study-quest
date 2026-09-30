# Brief for a subject port (read with ARCHITECTURE.md)

You are porting ONE stand-alone HSC study app into StudyQuest at /home/user/study-quest.
Read docs/ARCHITECTURE.md first, then the shared core in js/sq/ (util, store,
subject-state, ui, loader, subjects), js/hub/shop.js, js/app.js and index.html, so you
use the real APIs. Then read your source app thoroughly (README, index.html script
order, js/, css/, tests/).

## Hard rules
- Write ONLY under `subjects/<id>/` and `tests/subjects/<id>/`. Do not edit js/sq, js/hub,
  js/arcade, css/*.css, index.html, sw.js or another subject. Core gaps → work around
  inside your subject where reasonable AND write them up in `subjects/<id>/CORE-REQUESTS.md`
  (what, why, exact API wanted). Keep that file short and concrete.
- No git commands (no commit, no branch). The coordinator commits.
- Do not delete or modify anything in the source repo (/home/user/<Source-App>). Copy.
- Content is the product: port EVERY question, card, generator, dataset, diagram,
  text, boss and mode. Nothing is dropped. Keep ids stable (saves and tests key on them).
- No build step, no dependencies, classic scripts, must run from file://.

## What "done" means
1. `subjects/<id>/manifest.js` registers css + scripts in dependency order and a `boot()`
   that registers every route on your bound UI, registers your sheet with SQ.Tools, and
   sets `importLegacy`.
2. Opening `index.html#/s/<id>/home` in Chromium shows your subject's dashboard; every
   mode, boss, study/flashcard screen, reference, progress, options and shop screen
   works; no console errors; no horizontal overflow at 390 and 360 px.
3. Rewards go through `X.UI.award()` (→ SQ.UI.award). Your anti-farm gates are intact
   (wrong answers cost, rushed answers pay 0, crutches latch, net scoring on grids,
   once-per-day card/short-answer payment). Nothing in your subject can pay XP without
   award().
4. The upgrades in ARCHITECTURE §7 are in, where your app lacked them.
5. Your subject shop route calls `SQ.Shop.subject(view, id, catalog)` with your themes
   (renamed `<id>-<name>`, defined on core tokens in subjects/<id>/css/themes.css),
   avatars and crates.
6. Subject-only settings (coverage toggles, tier, texts, sig-figs…) live on a subject
   route named `options` (because `/settings` is the app's). Link to it from your
   progress or home screen.
7. Dev presets your app had: expose `X.devActions = [{ label, run() }]`; the app's dev
   menu lists them.
8. `importLegacy(old)` maps your app's old save (see its state.js) to the new slot.
9. Tests in `tests/subjects/<id>/`: `validate.js` (content integrity, ported from your
   app's validator, plus answer-length bias + near-duplicate checks), `smoke.js`
   (browser: every route/mode at 390 + 360 px, zero console errors, zero overflow), and
   ports of your exploit/honest bot tests if your app had them. Use tests/lib/browser.js
   and tests/lib/vm.js. All pass. Run them.
10. A `subjects/<id>/README.md`: what the subject contains, what changed from the
    stand-alone app, known gaps.

## Practical notes
- The shared tool tray (SQ.Tools: calculator, sheet, working pad) is being written in
  parallel by someone else; the current js/sq/tools.js is a placeholder with the same
  API. Register your sheet anyway; don't build your own calculator UI.
- The shared arcade is also being written in parallel. Don't port your arcade games;
  instead write `subjects/<id>/arcade-skins.md` describing your app's arcade games'
  visual theme (tile glyphs/labels/colours for match-3, runner obstacles/pickups, 2048
  ladder) so it can be turned into a skin — or note if the arcade author already has it.
- `SQ.UI.bind` resolves "/play" → "#/s/<id>/play". The bound UI has no `init()`.
- Test with: `node tests/subjects/<id>/smoke.js`. A save can be pre-seeded via
  `boot(browser, { subject: "<id>", save: {...} })`.
- Your subject's sound module should play through `SQ.Sound.shared()` (one AudioContext);
  if that is awkward, keep a lazily-created context but respect `SQ.Store.data.settings.sound`.
- Your subject's FX calls: alias to `SQ.FX` (it has pop, burst via confetti/sparks, rise,
  floatText, shake, marked, confetti, setReduced, applyMotion). Add any missing FX as a
  small subject-local wrapper that falls back to SQ.FX.
- Be efficient with context: read files in chunks, prefer targeted sed/python edits
  for mechanical renames across many files.

## Final report (keep it under 400 words)
What you ported (counts of questions/modes/etc.), what you upgraded, test results
(the actual pass/fail lines), anything left undone, and a pointer to CORE-REQUESTS.md.
