/* tests/subjects/phys/economy.js — PHYSICS-BRIEF.md §8 and addendum §I.

   Prints the effort-per-purchase table. The point of keeping this as a test is
   that the next "make it slightly easier to earn currency but keep the arcade
   costing about the same" request becomes a five-minute job instead of an argument.

   The unit is deliberate: EFFORT PER PURCHASE, measured in "runs that nominally pay
   1000 XP". Nothing else is comparable across a change that moves three coupled
   numbers at once.

   Addendum §B1 is why the measurement is taken the way it is. Tuning the payout
   from 0.60 to 0.75 — a 25% rise — measured as a 1% change on a real run, because
   level-ups pay 30 × level coins RAW, bypassing the payout multiplier, and swamped
   the run's own award. Pinning to the level cap swapped one confound for another,
   because achievement rewards are also raw. The clean number came from awarding a
   fixed amount with no level-up and no achievement in flight. This test therefore
   pins the level mid-range and pre-marks every achievement as earned, and it
   asserts that it actually managed to.

   Run:  node tests/subjects/phys/economy.js
*/
const { chromium, EXE, boot } = require("./_harness");

const NOMINAL_RUN_XP = 1000;

(async () => {
  const browser = await chromium.launch({ executablePath: EXE });
  const page = await boot(browser);

  const m = await page.evaluate(nominal => {
    const S = PHYS.State, UI = PHYS.UI;
    PHYS.UI.closeModal();

    /* ── silence every other reward source ─────────────────────────────────── */
    PHYS.DATA.achievements.forEach(a => (S.data.achievements[a.id] = 1));
    S.data.level = 30;                 // mid-range: far from a level-up boundary
    S.data.xpIntoLevel = 0;
    S.data.prestige = 0;
    S.data.settings.difficulty = "standard";
    S.data.coins = 0;
    S.data.streak = { count: 0, lastDay: null, longest: 0 };

    const before = { xp: S.data.xp, coins: S.data.coins, level: S.data.level,
                     ach: Object.keys(S.data.achievements).length };
    /* One clean award of the nominal run value, with nothing else in flight.
       `coins` has to be passed as well as `xp`: the payout rate is the multiplier
       award() applies to the COIN figure, so a measurement that only sends xp
       reports a payout rate of zero and looks like a catastrophic regression. */
    const res = UI.award({ xp: nominal, coins: nominal, silent: true });
    const after = { xp: S.data.xp, coins: S.data.coins, level: S.data.level,
                    ach: Object.keys(S.data.achievements).length };

    const levelCurve = [];
    for (const lv of [1, 5, 10, 20, 30, 40, 50, 60]) {
      let total = 0;
      for (let n = 1; n < lv; n++) total += S.xpNeeded(n);
      levelCurve.push({ level: lv, toNext: S.xpNeeded(lv), cumulative: total });
    }

    return {
      confounds: {
        levelChanged: after.level !== before.level,
        achievementsFired: after.ach !== before.ach
      },
      award: { xp: res.xp, coins: res.coins, multiplier: res.multiplier },
      payoutRate: res.coins / nominal,
      xpPerCorrect: { formula: "10 × difficulty × streak multiplier",
                      diff1: 10, diff3: 30, maxMultiplier: 3 },
      levelCurve,
      /* StudyQuest: arcade time and power-ups are the app's, priced in Stars. */
      stars: res.stars, starRate: SQ.Economy.STAR_RATE, exchange: SQ.Economy.EXCHANGE_RATE,
      tickets: SQ.Economy.TICKETS.map(t => ({ label: t.name, price: t.price, minutes: t.mins || null })),
      shop: {
        cheapestTheme: Math.min.apply(null, PHYS.DATA.themes.filter(t => t.price > 0).map(t => t.price)),
        dearestTheme: Math.max.apply(null, PHYS.DATA.themes.map(t => t.price)),
        powerups: SQ.Economy.POWERUPS.map(p => ({ name: p.name, price: p.price })),
        crates: PHYS.DATA.crates.map(c => ({ name: c.name, price: c.price, rolls: c.rolls }))
      },
      gates: { minBonusAccuracy: UI.MIN_BONUS_ACCURACY, minReadMs: UI.MIN_READ_MS }
    };
  }, NOMINAL_RUN_XP);

  await browser.close();

  const fails = [];
  if (m.confounds.levelChanged)
    fails.push("the measurement caused a level-up — its raw 30 × level coin grant is now in the number");
  if (m.confounds.achievementsFired)
    fails.push("an achievement fired during the measurement — its raw reward is now in the number");

  const effort = coins => coins / m.award.coins;      // in nominal-1000-XP runs

  console.log("Economy — effort per purchase\n");
  console.log(`  A run that nominally pays ${NOMINAL_RUN_XP} XP actually pays:`);
  console.log(`    ${m.award.xp} XP  (×${m.award.multiplier.toFixed(2)} difficulty/prestige)`);
  console.log(`    ${m.award.coins} Joules  (payout rate ${m.payoutRate.toFixed(2)})`);
  console.log(`\n  XP per correct answer: ${m.xpPerCorrect.formula}`);
  console.log(`    difficulty 1 → ${m.xpPerCorrect.diff1} XP, difficulty 3 → ` +
              `${m.xpPerCorrect.diff3} XP, up to ×${m.xpPerCorrect.maxMultiplier} on a streak`);

  console.log("\n  Level curve (round(115 × n^1.5)):");
  console.log("    level     to next    cumulative");
  for (const l of m.levelCurve) {
    console.log(`    ${String(l.level).padStart(5)} ${String(l.toNext).padStart(11)} ` +
                `${l.cumulative.toLocaleString().padStart(13)}`);
  }

  /* Arcade time is bought with STARS now (15% of XP), so its effort is in nominal
     runs' worth of Stars. Informational: the app-level economy suite owns it. */
  const starEffort = stars => stars / m.stars;
  console.log(`\n  The same run pays ${m.stars} Stars (rate ${m.starRate}); the Exchange is ${m.exchange} Joules per Star.`);
  console.log("\n  Arcade tickets (Stars, general shop — informational):");
  console.log("    ticket              price      effort   Stars/min");
  for (const t of m.tickets) {
    const perMin = t.minutes ? (t.price / t.minutes).toFixed(1) : "—";
    console.log(`    ${t.label.padEnd(18)} ${String(t.price).padStart(6)} ` +
                `${starEffort(t.price).toFixed(3).padStart(11)} ${String(perMin).padStart(12)}`);
  }
  console.log("\n  Shop:");
  console.log(`    themes            ${m.shop.cheapestTheme} – ${m.shop.dearestTheme} Joules ` +
              `(${effort(m.shop.cheapestTheme).toFixed(2)} – ${effort(m.shop.dearestTheme).toFixed(2)} runs)`);
  for (const p of m.shop.powerups) {
    console.log(`    ${p.name.padEnd(17)} ${String(p.price).padStart(4)} Stars   ` +
                `${starEffort(p.price).toFixed(3)} runs (general shop)`);
  }
  for (const c of m.shop.crates) {
    console.log(`    ${c.name.padEnd(17)} ${String(c.price).padStart(4)} Joules  ` +
                `${effort(c.price).toFixed(3)} runs for ${c.rolls} power-ups`);
  }

  console.log("\n  Gates:");
  console.log(`    completion bonus withheld below ${(m.gates.minBonusAccuracy * 100).toFixed(0)}% accuracy`);
  console.log(`    answers faster than ${m.gates.minReadMs} ms pay nothing, and a run in which`);
  console.log(`    EVERY answer was that fast pays nothing at all — bonus included`);

  /* The tuned targets this subject still owns: the Joules payout rate and the
     level curve. (The stand-alone ticket assertion — 315 Joules ≈ 0.42 of a run —
     moved with the arcade to the app, priced in Stars.) */
  if (Math.abs(m.payoutRate - 0.75) > 0.001)
    fails.push(`payout rate is ${m.payoutRate.toFixed(3)}, the tuned value is 0.75`);
  const lv20 = m.levelCurve.find(l => l.level === 20).cumulative;
  const lv60 = m.levelCurve.find(l => l.level === 60).cumulative;
  console.log(`  level 20 at ${lv20.toLocaleString()} XP, level 60 at ${lv60.toLocaleString()} XP ` +
              `(brief §8: ~77,000 / ~1.26M)`);
  if (Math.abs(lv20 - 77000) / 77000 > 0.08)
    fails.push(`reaching level 20 costs ${lv20} XP, the brief's tuned curve gives ~77,000`);
  if (Math.abs(lv60 - 1260000) / 1260000 > 0.08)
    fails.push(`reaching level 60 costs ${lv60} XP, the brief's tuned curve gives ~1.26M`);

  console.log("");
  if (fails.length) {
    console.log("❌ " + fails.join("\n   "));
    console.log("\n   If you meant to retune, retune all three together (payout rate, level curve,");
    console.log("   ticket prices) and update the expected values here in the same commit.");
    process.exit(1);
  }
  console.log("✅ Economy matches the brief's tuned numbers.");
})();
