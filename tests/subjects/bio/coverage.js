#!/usr/bin/env node
/* tests/coverage.js — course coverage packs (brief §8).

   Two rules make coverage safe rather than exploitable, and both are measured:
     • every pack removes what it claims
     • hiding content grants no advantage — it never raises what the remaining
       questions pay, and never lowers an achievement target */
"use strict";
const B = require("./browser.js");

(async () => {
  const r = B.reporter("coverage");
  const rig = await B.launch({ width: 390 });
  const { page } = rig;

  const packs = await page.evaluate(() => window.BIO.Coverage.packs().map((p) => p.id));
  console.log("coverage — " + packs.length + " packs");

  const baseline = await page.evaluate(() => ({
    kinds: window.BIO.Bank.kinds.reduce((o, k) => { o[k] = window.BIO.Bank.active(k).length; return o; }, {}),
    all: window.BIO.Bank.kinds.reduce((o, k) => { o[k] = window.BIO.Bank.all(k).length; return o; }, {}),
    diagrams: window.BIO.Bank.activeDiagrams().length,
    allDiagrams: window.BIO.Bank.diagrams().length
  }));

  for (const id of packs) {
    const res = await page.evaluate((packId) => {
      const before = window.BIO.Bank.kinds.reduce((o, k) => { o[k] = window.BIO.Bank.active(k).length; return o; }, {});
      before.diagram = window.BIO.Bank.activeDiagrams().length;
      window.BIO.State.setHidden(packId, true);
      const after = window.BIO.Bank.kinds.reduce((o, k) => { o[k] = window.BIO.Bank.active(k).length; return o; }, {});
      after.diagram = window.BIO.Bank.activeDiagrams().length;
      const allAfter = window.BIO.Bank.kinds.reduce((o, k) => { o[k] = window.BIO.Bank.all(k).length; return o; }, {});
      allAfter.diagram = window.BIO.Bank.diagrams().length;
      const impact = window.BIO.Coverage.impact(packId);
      window.BIO.State.setHidden(packId, false);
      return { before, after, allAfter, impact };
    }, id);

    const removed = Object.keys(res.before).reduce((s, k) => s + (res.before[k] - res.after[k]), 0);
    r.check(removed > 0, "pack " + id + " removed nothing — the toggle appears, flips, and does nothing (§8)");
    r.check(removed === res.impact.total,
      "pack " + id + " claims to remove " + res.impact.total + " items but actually removed " + removed);

    // the COMPLETE bank must be untouched — achievement targets read all()
    Object.keys(baseline.all).forEach((k) => {
      r.check(res.allAfter[k] === baseline.all[k],
        "pack " + id + " changed Bank.all('" + k + "') from " + baseline.all[k] + " to " + res.allAfter[k] +
        " — hiding content must never shorten a collection (§8)");
    });
    r.check(res.allAfter.diagram === baseline.allDiagrams, "pack " + id + " changed the complete diagram count");
  }

  // ── hiding content must not raise what a run pays
  const payouts = await page.evaluate(() => {
    const S = window.BIO.State, UI = window.BIO.UI;
    function runOnce() {
      return UI.award({ xp: 300, bonus: 120, accuracy: 1, readRatio: 1, answered: 10, silent: true }).xp;
    }
    const open = runOnce();
    window.BIO.Coverage.packs().forEach((p) => S.setHidden(p.id, true));
    const hidden = runOnce();
    window.BIO.Coverage.packs().forEach((p) => S.setHidden(p.id, false));
    return { open, hidden };
  });
  r.check(payouts.open === payouts.hidden,
    "a run paid " + payouts.hidden + " XP with everything hidden but " + payouts.open +
    " with everything on — hiding content must never raise the payout (§8)");

  // ── achievement targets are measured against the complete bank
  const targets = await page.evaluate(() => {
    const S = window.BIO.State;
    const before = window.BIO.Bank.all("mcq").length;
    window.BIO.Coverage.packs().forEach((p) => S.setHidden(p.id, true));
    const after = window.BIO.Bank.all("mcq").length;
    window.BIO.Coverage.packs().forEach((p) => S.setHidden(p.id, false));
    return { before, after };
  });
  r.check(targets.before === targets.after,
    "the 'see every question' target fell from " + targets.before + " to " + targets.after + " when content was hidden");

  // ── a mode whose pool is emptied says so rather than failing silently
  await page.evaluate(() => {
    window.BIO.Coverage.packs().forEach((p) => window.BIO.State.setHidden(p.id, true));
  });
  /* Biosphere's version opened Rapid Fire here, but the packs never hide every
     module (154 M5–M8 questions stay on), so it only passed because the word
     "nothing" appeared in some question text. A Year 11 drill IS emptied. */
  const leftM1 = await page.evaluate(() => window.BIO.Bank.activeByModule("mcq", "M1").length);
  r.check(leftM1 === 0, "with every pack hidden, " + leftM1 + " M1 questions are still active");
  await B.goto(page, "/play/drill?mod=M1");
  await page.waitForTimeout(300);
  const warned = await page.evaluate(() => !document.querySelector("#modal-root").hidden ||
                                            /nothing left to ask/i.test(document.querySelector("#modal-root").textContent));
  r.check(warned, "with every pack hidden, an M1 drill did not tell the student why there is nothing to play");
  await page.evaluate(() => {
    window.BIO.UI.closeModal();
    window.BIO.Coverage.packs().forEach((p) => window.BIO.State.setHidden(p.id, false));
  });

  // ── the settings screen shows the switches and they flip
  await B.goto(page, "/options");
  const switches = await page.evaluate(() => document.querySelectorAll(".switch input").length);
  r.check(switches >= packs.length, "Options shows " + switches + " switches for " + packs.length + " packs");

  const errs = B.realErrors(rig.errors);
  r.check(errs.length === 0, "console errors — " + errs.slice(0, 3).join(" | "));

  await r.done(rig);
})();
