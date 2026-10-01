#!/usr/bin/env node
/* tests/subjects/econ/smoke.js — every Economics route and mode, at 390 and 360 px.
   Fails on any console error, any horizontal overflow, or a screen that renders
   nothing. Each mode is also played a few steps (and most to their results). */
"use strict";
const E = require("./_browser.js");

const SCREENS = ["home", "play", "study", "cards", "atlas", "reference", "progress", "you", "options", "shop",
  "play/drill", "play/boss"];
const MODES = ["rapidfire", "drill?mod=P3", "calculate", "termmatch", "labelit", "datadetective", "sortit",
  "shiftit", "processorder", "survival", "rehab", "response", "flashcards", "boss?b=hand", "boss?b=final"];

(async () => {
  const r = E.checker("econ smoke");
  // a save where every boss is open and the rehab pool is non-empty
  const seed = async (page) => page.evaluate(() => {
    const S = ECON.State;
    ECON.Bank.all("mcq").forEach((q) => { S.data.seen[q.id] = { n: 1, wrong: 0, last: Date.now() }; });
    ECON.Boss.BOSSES.forEach((b) => { if (b.id !== "final") S.data.bossesBeaten[b.id] = Date.now(); });
    ECON.Bank.all("mcq").slice(0, 5).forEach((q) => S.markSeen(q.id, false, q.mod, q.topic));
    S.save();
  });

  for (const width of [390, 360]) {
    const { browser, page } = await E.open({ width });
    await seed(page);
    const diagrams = await page.evaluate(() => ECON.Diagram.all().map((d) => d.id));
    const routes = SCREENS.concat(diagrams.map((d) => "atlas?d=" + d)).concat(MODES.map((m) => "play/" + m));
    for (const route of routes) {
      await E.go(page, route);
      const content = await page.evaluate(() => document.querySelector("#view").innerText.trim().length);
      r.ok(content > 20, width + "px " + route + ": rendered nothing");
      let o = await E.overflow(page);
      r.ok(o.px <= 0 && o.wide.length === 0, width + "px " + route + ": horizontal overflow " + JSON.stringify(o));
      if (route.startsWith("play/") && MODES.indexOf(route.slice(5)) >= 0) {
        const limit = /rapidfire/.test(route) ? 6 : 90;
        let last = "", stuck = 0;
        for (let i = 0; i < limit; i++) {
          last = await E.step(page, "first");
          if (last === "results") break;
          if (last === "stuck") { stuck++; if (stuck > 4) break; await page.waitForTimeout(400); continue; }
          stuck = 0;
          await page.waitForTimeout(/sortit/.test(route) ? 1500 : 60);
          if (i === 3) {
            o = await E.overflow(page);
            r.ok(o.px <= 0 && o.wide.length === 0, width + "px " + route + " (mid-run): horizontal overflow " + JSON.stringify(o));
          }
        }
        if (!/rapidfire|rehab/.test(route)) {
          await page.waitForTimeout(500);
          const res = await page.evaluate(() => !!document.querySelector("#modal-root:not([hidden]) .js-again, #modal-root:not([hidden]) .result-grid"));
          r.ok(res, width + "px " + route + ": never reached a results screen (last step: " + last + ")");
        }
        o = await E.overflow(page);
        r.ok(o.px <= 0 && o.wide.length === 0, width + "px " + route + " (results): horizontal overflow " + JSON.stringify(o));
      }
    }
    // keyboard: 1–4 answers, Enter continues
    await E.go(page, "play/drill?mod=P1");
    const kb = await page.evaluate(() => {
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "2", bubbles: true }));
      const answered = document.querySelectorAll("#view .opt:disabled").length > 0;
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
      return answered;
    });
    r.ok(kb, width + "px: pressing 2 did not answer the question");
    // tap targets on the main buttons
    const small = await page.evaluate(() => [...document.querySelectorAll("#view .opt, #view .btn")]
      .filter((b) => b.offsetParent && b.getBoundingClientRect().height < 43.5).map((b) => b.className + ":" + b.textContent.slice(0, 20)));
    r.ok(small.length === 0, width + "px: tap targets under 44px — " + small.slice(0, 4).join(" | "));
    r.ok(page.errors.length === 0, width + "px: console errors — " + page.errors.slice(0, 4).join(" | "));
    await browser.close();
  }
  r.done();
})().catch((e) => { console.error(e); process.exit(1); });
