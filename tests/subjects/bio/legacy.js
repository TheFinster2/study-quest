#!/usr/bin/env node
/* tests/subjects/bio/legacy.js — a Biosphere save (biosphere.save.v1) comes
   across into the StudyQuest slot, and every dev preset runs cleanly. */
"use strict";
const B = require("./browser.js");

(async () => {
  const r = B.reporter("legacy");
  const rig = await B.launch({ width: 390 });
  const { page } = rig;

  const res = await page.evaluate(() => {
    const cardId = window.BIO.Bank.all("card")[0].id, qId = window.BIO.Bank.all("mcq")[0].id;
    const old = {
      v: 1, build: "1.6.1", xp: 5000, coins: 1234, theme: "reef",
      seen: { [qId]: { n: 2, wrong: 1, last: Date.now() } }, missed: { [qId]: { n: 1, last: Date.now() } },
      cards: { [cardId]: { box: 2, due: Date.now() - 86400000, n: 3, lapses: 1, last: Date.now() } },
      shortLog: { "s-x": "2026-01-01" }, bests: { punnettSolved: 12, pedigreeSolved: 4, survival: 9, drill: 14 },
      runs: 30, correct: 200, answered: 260, streakDays: 3, bestStreakDays: 11,
      achievements: { "first-run": 1 }, coverage: { "m6-biotech": true },
      owned: { themes: ["verdant", "reef"], avatars: ["🧬", "🌱", "🔬"] }, avatar: "🔬", difficulty: "hard",
      inventory: { fifty: 2, skip: 0, freeze: 1, shield: 0, insight: 0, double: 1, revive: 0 },
      bosses: { M1: { cleared: true, best: 17 }, M2: { cleared: false, best: 9 } },
      settings: { hintsInResponse: false }, diagramSeen: {}, genSeeds: {}
    };
    const out = SQ.Subjects.getManifest("bio").importLegacy(old);
    const S = window.BIO.State;
    return {
      same: out.slot === S.data, level: out.slot.level, xp: out.slot.xp, into: out.slot.xpIntoLevel,
      expectLevel: (function () { let l = 1, x = 5000; while (x >= S.xpNeeded(l)) { x -= S.xpNeeded(l); l++; } return l; })(),
      coins: out.slot.coins, srs: out.slot.srs[cardId], seen: !!out.slot.seen[qId], missed: !!out.slot.missed[qId],
      boss: !!out.slot.bossesBeaten["b-M1"], boss2: !!out.slot.bossesBeaten["b-M2"],
      diff: out.slot.settings.difficulty, hidden: out.slot.settings.hidden["m6-biotech"], hints: out.slot.settings.hintsInResponse,
      theme: out.slot.settings.theme, themes: out.themes, inv: out.inventory, punnett: out.slot.stats.punnettSolved,
      streak: out.streak.longest, soundLinked: typeof S.data.settings.sound
    };
  });
  r.check(res.same, "import did not rebuild the loaded slot in place");
  r.check(res.level === res.expectLevel && res.xp === 5000, "5000 XP should be level " + res.expectLevel + ", got " + res.level);
  r.check(res.coins === 1234, "biocredits not carried");
  r.check(res.srs && res.srs.box === 3 && res.srs.lapses === 1, "Leitner box 2 (0-based) should become srs box 3");
  r.check(res.seen && res.missed, "seen / missed ledgers not carried");
  r.check(res.boss && !res.boss2, "cleared bosses should map to bossesBeaten b-M1 only");
  r.check(res.diff === "hard" && res.hidden === true && res.hints === false, "settings not carried");
  r.check(res.theme === "bio-reef" && res.themes.indexOf("bio-verdant") >= 0, "themes not renamed to bio-*");
  r.check(res.inv.fifty === 2 && res.inv.double === 1, "power-ups not carried");
  r.check(res.punnett === 12 && res.streak === 11, "stats / longest streak not carried");
  r.check(res.soundLinked === "boolean", "the shared settings link was lost on the slot");

  // every dev preset runs without an error
  const labels = await page.evaluate(() => window.BIO.devActions.map((a) => a.label));
  r.check(labels.length >= 6, "expected Biosphere's dev presets as BIO.devActions");
  for (let i = 0; i < labels.length; i++) {
    const err = await page.evaluate((i) => { try { window.BIO.devActions[i].run(); return null; } catch (e) { return String(e); } }, i);
    r.check(!err, "dev action '" + labels[i] + "' threw: " + err);
  }
  await B.goto(page, "/progress");
  const flagged = await page.evaluate(() => /Dev-unlocked/i.test(document.querySelector("#view").textContent));
  r.check(flagged, "a dev-touched save does not say so on Progress");

  const errs = B.realErrors(rig.errors);
  r.check(errs.length === 0, "console errors — " + errs.slice(0, 3).join(" | "));
  await r.done(rig);
})();
