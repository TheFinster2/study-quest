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
    /* Upgrades: coverage, graded cards + leeches, legacy import. */
    const up = await page.evaluate(() => {
      const S = PHYS.State, B = PHYS.Bank;
      S.setTagHidden("y11", true);
      const draw = B.draw(30).every(q => !["M1", "M2", "M3", "M4"].includes(q.mod));
      const gen = PHYS.Gen.draw(12, {}).every(q => !["M1", "M2", "M3", "M4"].includes(q.mod));
      const due = S.dueCards().every(c => !["M1", "M2", "M3", "M4"].includes(c.mod));
      S.setTagHidden("y11", false);
      const id = B.cards()[5].id;
      ["again", "again", "again", "again"].forEach(g => S.reviewCard(id, g));
      const leech = S.isLeech(id);
      S.reviewCard(id, "easy");
      const box = S.cardState(id).box;
      const m = SQ.Subjects.getManifest("phys");
      const imp = m.importLegacy({ level: 12, xp: 900, xpIntoLevel: 40, coins: 777, stats: { answered: 50 },
        srs: { x: { box: 3 } }, owned: { themes: ["graphite", "fusion"], avatars: ["🧲"] },
        inventory: { fifty: 2, adrenaline: 1 }, profile: { name: "A", avatar: "🧲", theme: "fusion" },
        settings: { difficulty: "hard", sigfig: true } });
      return { draw, gen, due, leech, box,
        imp: imp.slot.coins === 777 && imp.slot.level === 12 && imp.themes.includes("phys-fusion") &&
             imp.inventory.revive === 1 && imp.slot.settings.theme === "phys-fusion" && imp.slot.settings.sigfig === true };
    });
    t.ok(up.draw && up.gen && up.due, `${width}px coverage: hiding Year 11 filters draws, generators and due cards`);
    t.ok(up.leech && up.box === 3, `${width}px graded cards: 4 × again makes a leech, easy jumps two boxes`);
    t.ok(up.imp, `${width}px importLegacy maps the stand-alone save`);
    const errs = page.errors.filter(e => !/ERR_FILE_NOT_FOUND/.test(e));
    t.ok(physMissing.length === 0, `${width}px: every Physics file loads ${physMissing.join(" ")}`);
    t.ok(errs.length === 0, `${width}px: no console errors\n    ` + errs.slice(0, 6).join("\n    "));
    await page.close();
  }
  await browser.close();
  t.done();
})().catch(e => { console.error(e); process.exit(1); });
