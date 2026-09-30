/* Physics smoke test: every route and every mode at 390 and 360 px, failing on a
   console error or horizontal overflow. Each game is also played one step (a
   choice tapped, an answer typed, a cell tapped) so the answer paths render too.

     node tests/subjects/phys/smoke.js */
const { launch, boot, overflow, until, checker } = require("../../lib/browser");

const ROUTES = [
  "home", "play", "study", "study/deck/due", "study/deck/all", "study/deck/M5", "study/deck/leech",
  "reference", "progress", "shop", "achievements", "options",
  "game/rapid", "game/drill", "game/drill/M6", "game/survival", "game/rehab", "game/calc", "game/calc/M7",
  "game/fbd", "game/formula", "game/graph", "game/unitgrid", "game/bench", "game/chain",
  "game/boss/boss-m5", "game/boss/boss-m6", "game/boss/boss-m7", "game/boss/boss-m8", "game/boss/boss-final"
];

(async () => {
  const t = checker("phys smoke");
  const browser = await launch();
  for (const width of [390, 360]) {
    const page = await boot(browser, { subject: "phys", viewport: { width, height: 800 } });
    /* Other subjects' theme files may not exist yet while they are being ported in
       parallel; only a missing PHYSICS file is this suite's business. */
    const physMissing = [];
    page.on("requestfailed", r => { if (/subjects\/phys\//.test(r.url())) physMissing.push(r.url()); });
    /* Seed what the locked screens need: mastery for the bosses, mistakes for rehab,
       a leech for the leech deck. Through the subject's own dev presets. */
    await page.evaluate(() => { PHYS.devActions.forEach((a, i) => { if (i > 0 && i < 3) a.run(); }); });
    for (const r of ROUTES) {
      await page.evaluate(h => { location.hash = h; }, "#/s/phys/" + r);
      await page.waitForTimeout(250);
      const ok = await page.evaluate(() => document.querySelector("#view").children.length > 0);
      t.ok(ok, `${width}px ${r}: rendered something`);
      /* One interaction, so the feedback path is exercised. */
      await page.evaluate(() => {
        const ch = document.querySelector("#view .choice:not([disabled])");
        if (ch) { ch.click(); return; }
        const inp = document.querySelector("#view input.numin:not([disabled])");
        if (inp) { inp.value = "12"; const b = [...document.querySelectorAll("#view .btn-primary")].find(x => /Submit|Check|Measure/i.test(x.textContent)); if (b) b.click(); return; }
        const cell = document.querySelector("#view .ucell, #view .tri-cell, #view .fbd-force, #view .eqcard, #view .gs-opt, #view .fcard");
        if (cell) cell.click();
      });
      await page.waitForTimeout(150);
      const o = await overflow(page);
      t.ok(o.px <= 0, `${width}px ${r}: no horizontal overflow (${o.px}px ${o.wide.join(", ")})`);
      await page.evaluate(() => SQ.UI.closeModal(true));
    }
    /* The sheet is registered with the shared tray. */
    const sheet = await page.evaluate(() => {
      const s = SQ.Tools.getSheet("phys");
      return s && { c: s.constants.length, free: s.constants.filter(c => c.free).length,
        f: s.sections.filter(x => x.id !== "units").reduce((n, x) => n + x.items.length, 0),
        ff: s.sections.filter(x => x.id !== "units").reduce((n, x) => n + x.items.filter(i => i.free).length, 0),
        ids: s.constants.map(c => c.id) };
    });
    t.ok(sheet && sheet.free === 21, `${width}px sheet: 21 free constants (got ${sheet && sheet.free})`);
    t.ok(sheet && sheet.f === 64 && sheet.ff === 54, `${width}px sheet: 64 formulas, 54 free (got ${sheet && sheet.f}/${sheet && sheet.ff})`);
    t.ok(sheet && ["g", "c", "h", "me", "kCoulomb", "GME"].every(id => sheet.ids.includes(id)), `${width}px sheet: calculator ids present`);
    const errs = page.errors.filter(e => !/ERR_FILE_NOT_FOUND/.test(e));
    t.ok(physMissing.length === 0, `${width}px: every Physics file loads ${physMissing.join(" ")}`);
    t.ok(errs.length === 0, `${width}px: no console errors\n    ` + errs.slice(0, 6).join("\n    "));
    await page.close();
  }
  await browser.close();
  t.done();
})().catch(e => { console.error(e); process.exit(1); });
