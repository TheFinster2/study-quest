#!/usr/bin/env node
/* Chemistry smoke test: every route and mode at 390 and 360 px, no console errors,
   no horizontal overflow. Also opens a flashcard session, a results screen and the
   tool tray's sheet registration.   node tests/subjects/chem/smoke.js */
"use strict";
const B = require("../../lib/browser.js");

const ROUTES = [
  "home", "play", "study", "study/leeches", "study/reference", "progress", "shop", "achievements", "options",
  "game/rapid", "game/drill", "game/drill/M5", "game/drill/M1", "game/mistakes", "game/balance", "game/ionmatch",
  "game/naming", "game/calc", "game/titration", "game/pathway", "game/precipitate", "game/survival",
  "game/boss/b5", "game/boss/b6", "game/boss/b7", "game/boss/b8", "game/boss/bf"
];

const SAVE = {
  settings: { onboarded: true, sound: false, motion: "off" },
  enrolled: ["chem"], migrateOffered: true,
  subjects: { chem: { level: 12, bossesBeaten: { b5: 1, b6: 1, b7: 1, b8: 1 },
    mistakes: [{ id: "m5-01", mod: "M5", misses: 2, ts: 1 }] } }
};

(async () => {
  const t = B.checker("chem smoke");
  const browser = await B.launch();
  for (const width of [390, 360]) {
    const page = await B.boot(browser, { viewport: { width, height: 800 }, subject: "chem", save: SAVE });
    for (const r of ROUTES) {
      await page.evaluate(h => { location.hash = h; }, "#/s/chem/" + r);
      await page.waitForTimeout(350);
      const title = await page.evaluate(() => document.querySelector("#view").textContent.trim().length);
      t.ok(title > 0, `${width}px ${r}: renders something`);
      const o = await B.overflow(page);
      t.ok(o.px <= 0, `${width}px ${r}: no horizontal overflow (${o.px}px ${o.wide.join(" ")})`);
    }
    // answer one MCQ and open the results of a run
    await page.evaluate(() => { location.hash = "#/s/chem/game/drill/M6"; });
    await page.waitForTimeout(300);
    for (let i = 0; i < 15; i++) {
      await page.evaluate(() => {
        const c = document.querySelector(".choice:not([disabled])");
        if (c) c.click();
        const n = document.querySelector(".js-next");
        if (n) n.click();
      });
      await page.waitForTimeout(40);
    }
    await page.waitForTimeout(700);
    t.ok(await page.evaluate(() => !!document.querySelector(".modal .result-grid")), `${width}px drill: results open`);
    let o = await B.overflow(page);
    t.ok(o.px <= 0, `${width}px results: no overflow`);
    // flashcard session
    await page.evaluate(() => { SQ.UI.closeModal(true); location.hash = "#/s/chem/study"; });
    await page.waitForTimeout(300);
    await page.evaluate(() => { const b = [...document.querySelectorAll("#view .btn-primary")][0]; if (b) b.click(); });
    await page.waitForTimeout(200);
    await page.evaluate(() => { const f = document.querySelector(".fcard"); if (f) f.click(); });
    t.ok(await page.evaluate(() => document.querySelectorAll(".js-grade").length === 4), `${width}px flashcards: four grades`);
    o = await B.overflow(page);
    t.ok(o.px <= 0, `${width}px flashcards: no overflow (${o.wide.join(" ")})`);
    t.ok(await page.evaluate(() => !!SQ.Tools.getSheet("chem")), "sheet registered");
    /* index.html links every subject's themes.css; subjects not yet ported 404
       on file://. Those are not Chemistry's, so resource 404s are filtered and
       Chemistry's own files are asserted loaded instead. */
    const errs = page.errors.filter(e => !/Failed to load resource/.test(e));
    t.ok(await page.evaluate(() => [...document.styleSheets].some(ss => /chem\/css\/chem\.css/.test(ss.href || ""))), "chem.css loaded");
    t.ok(errs.length === 0, `${width}px: no console errors\n    ${errs.join("\n    ")}`);
    await page.close();
  }
  await browser.close();
  t.done();
})().catch(e => { console.error(e); process.exit(1); });
