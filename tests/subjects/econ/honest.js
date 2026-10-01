#!/usr/bin/env node
/* tests/subjects/econ/honest.js — a bot that plays Economics WELL.
   (Ported from Equilibrium's tests/honest.js.)

   The counterpart to exploit.js: a student who knows the economics, reading
   each question for as long as the read floor asks, earns real XP — at
   broadly consistent rates, so no single mode is the obvious grind. It reads
   the answer key (a test affordance applied only here), not the screen. */
"use strict";
const E = require("./_browser.js");

(async () => {
  const r = E.checker("econ honest");
  const { browser, page } = await E.open({ width: 390 });
  console.log("honest — playing every mode well");

  await page.evaluate(() => {
    const real = ECON.UI.renderMCQ;
    ECON.UI.renderMCQ = function (host, q, onAnswer, opts) {
      const out = real.call(this, host, q, onAnswer, opts);
      out.buttons.forEach((b) => { if (+b.dataset.oi === q.answer) b.dataset.right = "1"; });
      return out;
    };
    const S = ECON.State;
    ECON.Bank.all("mcq").slice(0, 8).forEach((q) => S.markSeen(q.id, false, q.mod, q.topic));
    // the Invisible Hand needs 12 questions seen in P1/P2
    ECON.Bank.all("mcq").filter((q) => q.mod === "P1" || q.mod === "P2").forEach((q) => { S.data.seen[q.id] = S.data.seen[q.id] || { n: 1, wrong: 0, last: Date.now() }; });
  });

  const xp = () => page.evaluate(() => ECON.State.data.lifetimeXp || 0);
  const results = [];
  async function measure(name, fn) {
    const before = await xp(), t = Date.now();
    await fn();
    const gained = (await xp()) - before, mins = (Date.now() - t) / 60000;
    results.push({ name, gained, perMin: gained / Math.max(mins, 0.0001) });
    console.log("  " + name.padEnd(18) + String(gained).padStart(6) + " XP in " + mins.toFixed(2) + " min");
  }
  /* wait as long as a real reader would: the read floor for what is on screen, plus a beat */
  const readWait = () => page.evaluate(() => {
    const q = document.querySelector("#view .qtext");
    const back = document.querySelector("#view .card div + hr + div");
    return ECON.UI.readFloor((q ? q.textContent : "") + " " + (back ? back.textContent : "")) + 200;
  });
  async function play(route, maxSteps, untilMs) {
    await E.go(page, route);
    const end = untilMs ? Date.now() + untilMs : Infinity;
    for (let i = 0; i < maxSteps && Date.now() < end; i++) {
      const live = await page.evaluate(() => !!document.querySelector("#view .opt:not([disabled])") ||
        [...document.querySelectorAll("#view button")].some((b) => /reveal the marking|record and continue/i.test(b.textContent)) ||
        [...document.querySelectorAll("#view .btn-sm")].some((b) => b.textContent.trim() === "Good"));
      if (live) await page.waitForTimeout(await readWait());
      const s = await E.step(page, "right");
      if (s === "results") break;
      if (s === "stuck") await page.waitForTimeout(400);
      else await page.waitForTimeout(60);
    }
    await page.waitForTimeout(600);
  }

  await measure("Topic Drill", () => play("play/drill?mod=P3", 60));
  await measure("Mistake Rehab", () => play("play/rehab", 40));
  await measure("Rapid Fire", async () => {
    await play("play/rapidfire", 400, 128000);
    await page.waitForTimeout(800);
  });
  await measure("Response Builder", () => play("play/response", 40));
  await page.evaluate(() => { const t = ECON.U.dayKey(); ECON.Bank.all("card").slice(0, 20).forEach((c) => { ECON.State.data.srs[c.id] = { box: 2, due: t, reps: 1, lapses: 0 }; }); });
  await measure("Flashcards", () => play("play/flashcards", 60));
  await measure("Boss (Invisible Hand)", () => play("play/boss?b=hand", 60));

  const beaten = await page.evaluate(() => !!ECON.State.data.bossesBeaten.hand);
  r.ok(beaten, "a student who knows the answers did not beat The Invisible Hand");
  results.forEach((x) => r.ok(x.gained > 0, x.name + " paid nothing to a student who played it well"));
  const rates = results.map((x) => x.perMin).filter((v) => v > 0);
  const hi = Math.max.apply(null, rates), lo = Math.min.apply(null, rates);
  console.log("  XP per minute: " + Math.round(lo) + " – " + Math.round(hi));
  r.ok(hi / lo < 25, "the best mode pays " + (hi / lo).toFixed(1) + "× the worst per minute — one mode is the obvious grind");
  const total = results.reduce((a, x) => a + x.gained, 0);
  r.ok(total > 400, "an honest bot earned only " + total + " XP across every mode");
  r.ok(page.errors.length === 0, "console errors during honest play — " + page.errors.slice(0, 3).join(" | "));
  await browser.close();
  r.done();
})().catch((e) => { console.error(e); process.exit(1); });
