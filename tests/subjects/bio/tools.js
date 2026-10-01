#!/usr/bin/env node
/* tests/subjects/bio/tools.js — Biology's policy on the shared tool tray.

   Biosphere's tools.js measured its own docked tray. The tray is the app's now
   (SQ.Tools), so this suite checks what Biology still owns:
     • the glossary is registered as the sheet, grouped by module, and NOTHING in
       it is free — the HSC Biology exam supplies no data sheet
     • the sheet is withheld in Term Match, Label It and every boss (the answer
       key), and offered in every other scored mode
     • a latched lookup reduces what award() pays, and a run with no lookup pays
       in full
   BREAK=sheetleak | freesheet | nolatch  must fail (tests/subjects/bio/prove.js). */
"use strict";
const B = require("./browser.js");
const BREAK = process.env.BREAK || "";

(async () => {
  const r = B.reporter("tools");
  const rig = await B.launch({ width: 390 });
  const { page } = rig;
  console.log("tools — Biology on the shared tray" + (BREAK ? "  [BREAK=" + BREAK + "]" : ""));

  await page.evaluate((mode) => {
    if (mode === "sheetleak") window.BIO.Tools.referenceAllowed = () => true;
    if (mode === "freesheet") { const s = window.BIO.Tools.sheet(); s.sections[0].items[0].free = true; SQ.Tools.registerSheet("bio", s); }
    if (mode === "nolatch") window.BIO.UI.formulaPenalty = () => 1;
    window.__mounts = [];
    const real = SQ.Tools.mount;
    SQ.Tools.mount = function (o) { window.__mounts.push(JSON.parse(JSON.stringify(o || {}))); return real.apply(this, arguments); };
  }, BREAK);

  const sheet = await page.evaluate(() => {
    const s = SQ.Tools.getSheet("bio");
    if (!s) return null;
    const items = s.sections.reduce((a, x) => a.concat(x.items), []);
    return { title: s.title, sections: s.sections.map((x) => x.id), n: items.length,
             free: items.filter((i) => i.free !== false).length, glossary: window.BIO.DATA.glossary.length,
             ids: new Set(items.map((i) => i.id)).size };
  });
  r.check(!!sheet, "Biology did not register a sheet with SQ.Tools");
  if (sheet) {
    r.check(sheet.n === sheet.glossary, "the sheet has " + sheet.n + " terms but the glossary has " + sheet.glossary);
    r.check(sheet.free === 0, sheet.free + " sheet items are free — Biology's exam has no data sheet, so none may be");
    r.check(sheet.sections.length === 8, "the sheet should be grouped into the eight modules, found " + sheet.sections.length);
    r.check(sheet.ids === sheet.n, "sheet item ids are not unique");
  }

  const WITHHELD = ["termmatch", "labelit", "boss"];
  const modes = await page.evaluate(() => window.BIO.Run.MODES.map((m) => ({ id: m.id, route: m.route })));
  await page.evaluate(() => {
    const S = window.BIO.State;
    window.BIO.Bank.all("mcq").forEach((q) => { S.data.seen[q.id] = { n: 1, wrong: 0, last: Date.now() }; });
    window.BIO.State.missedIds = () => window.BIO.Bank.all("mcq").slice(0, 5).map((q) => q.id);
  });
  for (const m of modes) {
    let route = /^\/study/.test(m.route) ? "/play/flashcards" : m.route;
    if (m.id === "boss") route = "/play/boss?b=b-M2";
    if (m.id === "drill") route = "/play/drill?mod=M4";
    await page.evaluate(() => { window.__mounts = []; });
    await B.goto(page, route);
    const mounts = await page.evaluate(() => window.__mounts);
    r.check(mounts.length === 1, m.id + ": the tool tray was mounted " + mounts.length + " times");
    const last = mounts[mounts.length - 1] || {};
    if (WITHHELD.indexOf(m.id) >= 0) r.check(last.sheet === false, m.id + ": the reference sheet is offered — it is the answer key here");
    else r.check(last.sheet !== false, m.id + ": the reference sheet is withheld in a mode that should offer it (priced)");
    r.check(last.scored !== false, m.id + ": the tray was mounted as unscored");
  }

  // the latch: a lookup this run → award() pays less; no lookup → full
  const pay = await page.evaluate(() => {
    const T = SQ.Tools, rp = T.penalty, rl = T.lookups;
    const clean = window.BIO.UI.award({ xp: 200, silent: true }).xp;
    T.penalty = () => 0.9; T.lookups = () => ["g-allele"];
    const looked = window.BIO.UI.award({ xp: 200, silent: true });
    const latched = window.BIO.Tools.refLatched();
    T.penalty = rp; T.lookups = rl;
    return { clean, looked: looked.xp, ref: looked.refPenalty, latched };
  });
  r.check(pay.looked < pay.clean, "a run with a sheet lookup paid " + pay.looked + " XP against " + pay.clean + " without — the crutch is not applied");
  r.check(pay.ref > 0, "the award record does not report the reference penalty");
  r.check(pay.latched, "BIO.Tools.refLatched() does not report a lookup made this run");

  // the free reference screens are unscored
  for (const p of ["/reference", "/atlas"]) {
    await page.evaluate(() => { window.__mounts = []; });
    await B.goto(page, p);
    const n = await page.evaluate(() => window.__mounts.length);
    r.check(n === 0, p + " mounted the scored tool tray — it is a free reference screen");
  }

  const errs = B.realErrors(rig.errors);
  r.check(errs.length === 0, "console errors — " + errs.slice(0, 3).join(" | "));
  await r.done(rig);
})();
