#!/usr/bin/env node
/* English smoke.   node tests/subjects/eng/smoke.js
   1. file:// through the app's own harness (tests/lib/browser.js): every English route
      and mode at 390 and 360 px — zero console errors, zero horizontal overflow.
   2. the ported Close Reading smoke suite over http (the same routes, plus "the primary
      action is on screen, clear of the nav bar, and really clickable" per mode). */
"use strict";
const B = require("../../lib/browser.js");
const { ROUTES } = require("./lib/browser.js");

(async () => {
  const c = B.checker("smoke (file://)");
  const br = await B.launch();
  try {
    for (const width of [390, 360]) {
      const page = await B.boot(br, { subject: "eng", viewport: { width, height: 844 },
        save: { settings: { onboarded: true, sound: false, motion: "off" }, enrolled: ["eng"], migrateOffered: true,
                subjects: { eng: { settings: { onboarded: true } } } } });
      const failed = [];
      page.on("requestfailed", r => { if (/subjects\/eng\//.test(r.url())) failed.push(r.url()); });
      for (const r of ROUTES) {
        await page.evaluate(h => { SQ.UI.closeModal(true); location.hash = h; }, "#/s/eng" + r);
        await page.waitForTimeout(350);
        const o = await B.overflow(page);
        const ok = await page.evaluate(() => !!document.querySelector("#view h1, #view .gtitle, #view .empty"));
        c.ok(o.px <= 1, width + "px " + r + ": no horizontal overflow (" + o.px + "px " + o.wide.join(", ") + ")");
        c.ok(ok, width + "px " + r + ": rendered a heading or an empty state");
      }
      /* Resource 404s for the app shell's own icons are not English's; English's files are
         checked by URL above. */
      const errs = page.errors.filter(e => !/Failed to load resource/.test(e));
      c.ok(errs.length === 0, width + "px: no console/page errors — " + errs.slice(0, 3).join(" | "));
      c.ok(failed.length === 0, width + "px: every English file loaded — " + failed.slice(0, 3).join(" | "));
      await page.close();
    }
  } finally { await br.close(); }
  const okFile = c.done();
  const code = await require("./run.js").main(["smoke"]);
  process.exit(okFile && code === 0 ? 0 : 1);
})();
