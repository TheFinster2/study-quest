#!/usr/bin/env node
/* tests/subjects/econ/tools.js — the shared tool tray as Economics uses it
   (adapted from Equilibrium's tests/tools.js, whose own tray is gone).

   What Economics is responsible for now:
     • the glossary is registered as the sheet, grouped by topic, and EVERY
       entry is free:false — the HSC Economics exam supplies no data sheet
     • scored runs mount the tray with the calculator on
     • Term Match and Label It mount it with the sheet OFF (the glossary and
       the labels are the answer key there); unscored screens mount nothing
     • the tray's latched crutch charge reaches what a run actually pays, and
       closing the reference cannot refund it (C3: award() reads the latch). */
"use strict";
const E = require("./_browser.js");

(async () => {
  const r = E.checker("econ tools");
  const { browser, page } = await E.open({ width: 360 });

  const sheet = await page.evaluate(() => {
    const s = SQ.Tools.getSheet("econ");
    if (!s) return null;
    const items = [].concat(...s.sections.map((x) => x.items));
    return { sections: s.sections.map((x) => x.id), n: items.length, free: items.filter((i) => i.free !== false).length,
             glossary: ECON.DATA.glossary.length, ids: new Set(items.map((i) => i.id)).size,
             mods: ECON.U.MODULES.map((m) => m.id) };
  });
  r.ok(!!sheet, "no sheet registered for econ");
  if (sheet) {
    r.ok(sheet.n === sheet.glossary, "sheet has " + sheet.n + " items for " + sheet.glossary + " glossary terms");
    r.ok(sheet.free === 0, sheet.free + " glossary items are free:true — there is no exam data sheet");
    r.ok(sheet.ids === sheet.n, "sheet item ids are not unique");
    r.ok(sheet.sections.every((s) => sheet.mods.indexOf(s) >= 0), "sheet sections are not the syllabus topics: " + sheet.sections.join(","));
  }

  // record every mount
  await page.evaluate(() => {
    window.__mounts = [];
    const real = SQ.Tools.mount;
    SQ.Tools.mount = function (o) { window.__mounts.push(Object.assign({ route: location.hash }, o)); return real.apply(this, arguments); };
  });
  const expect = {
    "play/drill?mod=P2": { sheet: true, calc: true }, "play/calculate": { sheet: true, calc: true },
    "play/rapidfire": { sheet: true, calc: true }, "play/response": { sheet: true },
    "play/termmatch": { sheet: false, calc: true }, "play/labelit": { sheet: false, calc: true }
  };
  for (const route of Object.keys(expect)) {
    await page.evaluate(() => { window.__mounts = []; });
    await E.go(page, route);
    const m = await page.evaluate(() => window.__mounts[window.__mounts.length - 1] || null);
    r.ok(!!m, route + ": the tool tray was not mounted in a scored run");
    if (!m) continue;
    Object.keys(expect[route]).forEach((k) => r.ok(m[k] === expect[route][k], route + ": tray " + k + " is " + m[k] + ", expected " + expect[route][k]));
    r.ok(m.subject === "econ" && m.scored !== false, route + ": tray not mounted as a scored Economics run");
  }
  for (const route of ["home", "study", "reference", "atlas", "play/flashcards"]) {
    await page.evaluate(() => { window.__mounts = []; });
    await E.go(page, route);
    const n = await page.evaluate(() => window.__mounts.length);
    r.ok(n === 0, route + ": mounted the tray on an unscored screen");
  }

  // the latched crutch reaches the payout, and cannot be refunded
  const pay = await page.evaluate(() => {
    const real = SQ.Tools.penalty;
    const base = ECON.UI.award({ xp: 200, questions: 10, accuracy: 1, silent: true });
    let latched = 0.9;
    SQ.Tools.penalty = () => latched;
    const charged = ECON.UI.award({ xp: 200, questions: 10, accuracy: 1, silent: true });
    SQ.Tools.penalty = real;
    return { base: base.xp, charged: charged.xp, ref: charged.refPenalty };
  });
  r.ok(pay.charged < pay.base, "a run with the reference latched paid " + pay.charged + " vs " + pay.base + " without it");
  r.ok(Math.abs(pay.charged / pay.base - 0.9) < 0.02, "the latched ×0.9 did not reach the payout (" + pay.charged + "/" + pay.base + ")");
  r.ok(pay.ref > 0, "the results rows would not show the reference charge");

  r.ok(page.errors.length === 0, "console errors — " + page.errors.slice(0, 3).join(" | "));
  await browser.close();
  r.done();
})().catch((e) => { console.error(e); process.exit(1); });
