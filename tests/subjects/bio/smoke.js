#!/usr/bin/env node
/* tests/subjects/bio/smoke.js — every Biology screen and mode driven end to end.

   Ported from Biosphere's smoke test. Asserts, at 390 AND 360 px: zero console
   errors, no horizontal overflow, no overlapping rows, no text crushed to
   nothing, and a readable primary button in every bio-* theme. */
"use strict";
const B = require("./browser.js");

(async () => {
  const r = B.reporter("smoke");

  for (const width of [390, 360]) {
    const rig = await B.launch({ width });
    const { page } = rig;
    console.log("smoke — driving every Biology screen at " + width + "px");

    const firstDiagram = await page.evaluate(() => Object.keys(window.BIO.DATA.diagrams)[0]);
    const screens = ["/home", "/play", "/study", "/atlas", "/atlas?d=" + firstDiagram, "/shop", "/progress",
      "/options", "/reference", "/play/drill", "/play/boss", "/play/rehab", "/game/rapidfire"];
    for (const s of screens) {
      await B.goto(page, s);
      const over = await B.overflow(page);
      r.check(over.length === 0, width + "px " + s + ": horizontal overflow — " + over.join("; "));
      const hasContent = await page.evaluate(() => document.querySelector("#view").children.length > 0);
      r.check(hasContent, width + "px " + s + ": rendered nothing");
      const collide = await B.overlaps(page);
      r.check(collide.length === 0, width + "px " + s + ": overlapping UI — " + collide.join("; "));
      const crushed = await B.squeezed(page);
      r.check(crushed.length === 0, width + "px " + s + ": text crushed to nothing — " + crushed.join("; "));
    }
    const atlasOne = await (async () => { await B.goto(page, "/atlas?d=" + firstDiagram); return page.evaluate(() => !!document.querySelector("#view .dg-wrap, #view svg")); })();
    r.check(atlasOne, "atlas?d= did not open a single diagram");

    // unlock every boss, then open each one
    await page.evaluate(() => {
      const S = window.BIO.State;
      window.BIO.Bank.all("mcq").forEach((q) => { S.data.seen[q.id] = S.data.seen[q.id] || { n: 1, wrong: 0, last: Date.now() }; });
      window.BIO.DATA.bosses.forEach((b) => { if (b.mod) S.data.bossesBeaten[b.id] = Date.now(); });
      S.save();
    });
    const bosses = await page.evaluate(() => window.BIO.DATA.bosses.map((b) => b.id));
    for (const id of bosses) {
      await B.goto(page, "/play/boss?b=" + id);
      const ok = await page.evaluate(() => !!document.querySelector(".boss-hud") && !!document.querySelector(".gs-body .opt"));
      r.check(ok, width + "px boss " + id + ": the duel did not start");
      const over = await B.overflow(page);
      r.check(over.length === 0, width + "px boss " + id + ": overflow — " + over.join("; "));
      await page.evaluate(() => { const o = document.querySelector(".gs-body .opt:not([disabled])"); if (o) o.click(); });
      await page.waitForTimeout(150);
      const fed = await page.evaluate(() => !!document.querySelector(".gs-body .why"));
      r.check(fed, width + "px boss " + id + ": answering gave no feedback");
    }

    const modes = await page.evaluate(() => window.BIO.Run.MODES.map((m) => ({ id: m.id, route: m.route })));
    r.check(modes.length === 14, "expected 14 registered modes, found " + modes.length);

    for (const m of modes) {
      const route = /^\/study/.test(m.route) ? "/play/flashcards" : m.route;
      await B.goto(page, route);
      await page.waitForTimeout(200);
      const over = await B.overflow(page);
      r.check(over.length === 0, width + "px " + m.id + ": horizontal overflow — " + over.join("; "));
      const collide = await B.overlaps(page);
      r.check(collide.length === 0, width + "px " + m.id + ": overlapping UI — " + collide.join("; "));
      const crushed = await B.squeezed(page);
      r.check(crushed.length === 0, width + "px " + m.id + ": text crushed to nothing — " + crushed.join("; "));

      const clicked = await page.evaluate(() => {
        const pick = document.querySelector(".gs-body .opt:not([disabled])") ||
                     document.querySelector(".dg-chip:not([disabled])") ||
                     document.querySelector(".rb-answer") ||
                     document.querySelector(".gs-body .btn-primary") ||
                     document.querySelector("#view .li-btn, #view .boss-row") ||
                     document.querySelector("#view .btn-primary") ||
                     document.querySelector("#view button:not([disabled])");
        if (!pick) return false;
        if (pick.tagName === "TEXTAREA") { pick.value = "test answer for the smoke test, long enough to count"; return true; }
        pick.click();
        return true;
      });
      r.check(clicked, width + "px " + m.id + ": nothing interactive on the first screen");
      await page.waitForTimeout(220);
      const over2 = await B.overflow(page);
      r.check(over2.length === 0, width + "px " + m.id + " after interaction: overflow — " + over2.join("; "));
    }

    // a full Module Drill to the results screen, keyboard only
    await B.goto(page, "/play/drill?mod=M3");
    for (let i = 0; i < 40; i++) {
      const done = await page.evaluate(() => !!document.querySelector(".bio-results"));
      if (done) break;
      await page.keyboard.press("1");
      await page.waitForTimeout(40);
      await page.keyboard.press("Enter");
      await page.waitForTimeout(40);
    }
    const results = await page.evaluate(() => !!document.querySelector(".bio-results"));
    r.check(results, width + "px: a Module Drill played with the keyboard (1 / Enter) never reached results");
    const over3 = await B.overflow(page);
    r.check(over3.length === 0, width + "px results: overflow — " + over3.join("; "));

    // H2 contrast, in every Biology theme
    const themes = await page.evaluate(() => window.BIO.DATA.shop.themes.map((t) => t.id));
    for (const t of themes.concat(["midnight"])) {
      const c = await page.evaluate((t) => {
        document.documentElement.dataset.theme = t;
        const btn = document.createElement("button");
        btn.className = "btn btn-primary"; btn.textContent = "Test";
        document.querySelector("#view").appendChild(btn);
        const cs = getComputedStyle(btn);
        const out = { bg: cs.backgroundColor, fg: cs.color };
        btn.remove();
        return out;
      }, t);
      const lum = (col) => {
        const m = /rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(col);
        if (!m) return 0.5;
        const [rr, gg, bb] = [1, 2, 3].map((i) => { const v = Number(m[i]) / 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
        return 0.2126 * rr + 0.7152 * gg + 0.0722 * bb;
      };
      const l1 = lum(c.bg), l2 = lum(c.fg);
      const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
      r.check(ratio >= 4.5, "theme " + t + ": btn-primary contrast " + ratio.toFixed(2) + ":1 (needs 4.5)");
    }
    await page.evaluate(() => SQ.UI.applyTheme());

    const errs = B.realErrors(rig.errors);
    r.check(errs.length === 0, width + "px: console errors — " + errs.slice(0, 5).join(" | "));
    await rig.close();
  }
  await r.done();
})();
