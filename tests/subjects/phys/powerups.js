/* Physics power-ups: each one is offered, consumed from the shared inventory
   (SQ.Store.data.inventory), and has its effect — in the quiz engine and the bosses.
   Nightmare's bans are respected.

     node tests/subjects/phys/powerups.js */
const { launch, boot, until, checker } = require("./_harness");

/* Helpers that run in the page: record every question shown, and find the right
   option on the card from the app's own data (as tests/subjects/phys/honest.js does). */
function installSpy() {
  window.__seen = [];
  const G = PHYS.Gen, draw = G.draw, toMcq = G.toMcq;
  G.draw = function () { const qs = draw.apply(G, arguments); qs.forEach(q => __seen.push(q)); return qs; };
  G.toMcq = function () { const m = toMcq.apply(G, arguments); __seen.push(m); return m; };
  window.__correct = () => {
    const stem = document.querySelector("#view .qtext");
    if (!stem) return -1;
    const opts = [...document.querySelectorAll("#view .choice .choice-txt")].map(n => n.innerHTML);
    const q = PHYS.Bank.all().concat(__seen).find(x => PHYS.U.math(x.q) === stem.innerHTML);
    if (!q) return -1;
    const key = PHYS.U.math(q.choices[q.a]);
    return opts.indexOf(key);
  };
  window.__awards = [];
  const award = SQ.UI.award;
  SQ.UI.award = function (id, o) { const r = award.apply(SQ.UI, arguments); __awards.push({ boost: o.boost, mult: r.multiplier, xp: r.xp }); return r; };
  const inv = SQ.Store.data.inventory;
  ["fifty", "skip", "freeze", "shield", "double", "insight", "revive"].forEach(k => (inv[k] = 3));
  PHYS.State.setDifficulty("standard");
}

(async () => {
  const t = checker("phys power-ups");
  const browser = await launch();
  const page = await boot(browser, { subject: "phys" });
  await page.evaluate(installSpy);
  const inv = () => page.evaluate(() => Object.assign({}, SQ.Store.data.inventory));
  const click = sel => page.evaluate(s => { const b = document.querySelector(s); if (b && !b.disabled) { b.click(); return true; } return false; }, sel);

  /* ── Rapid Fire: fifty, freeze, insight, double, shield, skip ── */
  await page.evaluate(() => { location.hash = "#/s/phys/game/rapid"; });
  await until(page, () => !!document.querySelector("#view .choice"));
  const offered = await page.evaluate(() => [...document.querySelectorAll("#view [data-pu]")].map(b => b.dataset.pu));
  t.ok(["fifty", "skip", "freeze", "shield", "insight", "double"].every(id => offered.includes(id)),
    "quiz offers fifty, skip, freeze, shield, insight, double (got " + offered.join(",") + ")");

  let before = await inv();
  t.ok(await click('[data-pu="double"]'), "double can be armed before the first answer");
  let after = await inv();
  t.ok(after.double === before.double - 1, "double is consumed from SQ.Store.data.inventory on arming");

  const t0 = await page.evaluate(() => document.querySelector("#view .timer-ring").textContent);
  await click('[data-pu="freeze"]');
  const t1 = await page.evaluate(() => document.querySelector("#view .timer-ring").textContent);
  const secs = s => { const [m, x] = s.split(":").map(Number); return m * 60 + x; };
  after = await inv();
  t.ok(after.freeze === before.freeze - 1 && secs(t1) >= secs(t0) + 14, `freeze consumed and +15 s (${t0} → ${t1})`);

  await click('[data-pu="insight"]');
  after = await inv();
  t.ok(after.insight === before.insight - 1, "insight consumed");
  t.ok(await page.evaluate(() => !!document.querySelector("#view [data-insight]")), "insight shows the topic/trap hint");

  await click('[data-pu="fifty"]');
  after = await inv();
  t.ok(after.fifty === before.fifty - 1, "fifty consumed");
  t.ok(await page.evaluate(() => document.querySelectorAll("#view .choice.dimmed").length === 2), "fifty removes two wrong options");

  /* Build a streak of 1, arm the shield, answer wrong: the streak survives. */
  await page.waitForTimeout(300);
  await page.evaluate(() => { const i = __correct(); document.querySelectorAll("#view .choice")[i].click(); });
  await page.evaluate(() => [...document.querySelectorAll("#view .btn-primary")].pop().click());
  await until(page, () => !!document.querySelector("#view .choice:not([disabled])"));
  before = await inv();
  await click('[data-pu="shield"]');
  after = await inv();
  t.ok(after.shield === before.shield - 1, "shield consumed on arming");
  await page.evaluate(() => { const i = __correct(); const ch = [...document.querySelectorAll("#view .choice")]; ch[(i + 1) % ch.length].click(); });
  const streak = await page.evaluate(() => [...document.querySelectorAll("#view .gmeta .chip")].find(c => /🔥/.test(c.textContent)).textContent);
  t.ok(/🔥 1/.test(streak), "shield: a wrong answer keeps the streak (" + streak.trim() + ")");

  await page.evaluate(() => [...document.querySelectorAll("#view .btn-primary")].pop().click());
  await until(page, () => !!document.querySelector("#view .choice:not([disabled])"));
  before = await inv();
  const stem1 = await page.evaluate(() => document.querySelector("#view .qtext").textContent);
  await click('[data-pu="skip"]');
  after = await inv();
  const stem2 = await page.evaluate(() => document.querySelector("#view .qtext").textContent);
  t.ok(after.skip === before.skip - 1 && stem1 !== stem2, "skip consumed and moves on");

  /* Finish the run (answer one correctly, slowly enough to pay) → award gets boost 2. */
  await page.waitForTimeout(4300);
  await page.evaluate(() => { const i = __correct(); document.querySelectorAll("#view .choice")[Math.max(0, i)].click(); });
  await page.evaluate(() => { __awards.length = 0; });
  await page.evaluate(() => { location.hash = "#/s/phys/game/rapid"; });   // leaving does not pay
  await page.evaluate(() => { location.hash = "#/s/phys/game/drill"; });
  await until(page, () => !!document.querySelector("#view .choice"));
  await click('[data-pu="double"]');
  for (let i = 0; i < 15; i++) {
    await page.waitForTimeout(i < 2 ? 4300 : 30);
    await page.evaluate(() => {
      const i = __correct(); const ch = document.querySelectorAll("#view .choice:not([disabled])");
      if (ch.length) (document.querySelectorAll("#view .choice")[i] || ch[0]).click();
      const nx = [...document.querySelectorAll("#view .btn-primary")].pop(); if (nx) nx.click();
    });
  }
  await until(page, () => window.__awards.length > 0, { timeout: 5000 }).catch(() => {});
  const aw = await page.evaluate(() => __awards[0]);
  t.ok(aw && aw.boost === 2 && aw.mult >= 2 && aw.mult <= 4, "double: the run's award carries boost 2 (multiplier " + (aw && aw.mult) + ", capped ×4)");
  await page.evaluate(() => SQ.UI.closeModal(true));

  /* ── Survival: revive saves the one life ── */
  before = await inv();
  await page.evaluate(() => { location.hash = "#/s/phys/game/survival"; });
  await until(page, () => !!document.querySelector("#view .choice"));
  await page.evaluate(() => { const i = __correct(); const ch = [...document.querySelectorAll("#view .choice")]; ch[(i + 1) % ch.length].click(); });
  await page.waitForTimeout(1200);
  after = await inv();
  const alive = await page.evaluate(() => !document.querySelector("#modal-root:not([hidden]) .result-grid") &&
    [...document.querySelectorAll("#view .btn-primary")].some(b => /Next/.test(b.textContent)));
  t.ok(after.revive === before.revive - 1 && alive, "revive consumed automatically and Survival continues after a knockout");

  /* ── Boss: freeze, shield, insight, double offered; shield blocks; revive ── */
  await page.evaluate(() => { PHYS.devActions[1].run(); location.hash = "#/s/phys/game/boss/boss-m5"; });
  await until(page, () => !!document.querySelector("#view .choice"));
  const bossOff = await page.evaluate(() => [...document.querySelectorAll("#view [data-pu]")].map(b => b.dataset.pu));
  t.ok(["freeze", "shield", "insight", "double"].every(id => bossOff.includes(id)), "boss offers freeze, shield, insight, double (" + bossOff.join(",") + ")");
  before = await inv();
  await click('[data-pu="freeze"]'); await click('[data-pu="insight"]'); await click('[data-pu="shield"]');
  after = await inv();
  t.ok(after.freeze === before.freeze - 1 && after.insight === before.insight - 1 && after.shield === before.shield - 1, "boss consumes freeze, insight, shield");
  await page.evaluate(() => { const i = __correct(); const ch = [...document.querySelectorAll("#view .choice")]; ch[(i + 1) % ch.length].click(); });
  const hp1 = await page.evaluate(() => document.querySelector("#my-hp-text").textContent);
  t.ok(/^100 /.test(hp1), "boss shield blocks one hit (" + hp1 + ")");
  before = await inv();
  let revivedHp = null;
  for (let k = 0; k < 14 && !revivedHp; k++) {
    await page.evaluate(() => { const b = [...document.querySelectorAll("#view .btn-primary")].pop(); if (b && /Strike/.test(b.textContent)) b.click(); });
    await page.waitForTimeout(40);
    revivedHp = await page.evaluate(() => {
      const ch = [...document.querySelectorAll("#view .choice")];
      if (!ch.length || ch[0].disabled) return null;
      const i = __correct(); ch[(i + 1) % ch.length].click();
      return SQ.Store.data.inventory.revive < 3 ? document.querySelector("#my-hp-text").textContent : null;
    });
  }
  after = await inv();
  t.ok(after.revive === before.revive - 1 && revivedHp && /^50 /.test(revivedHp), "boss revive fires on a knockout, back to 50 HP (" + revivedHp + ")");
  await page.evaluate(() => SQ.UI.closeModal(true));

  /* ── Nightmare bans fifty and skip ── */
  await page.evaluate(() => { PHYS.State.setDifficulty("nightmare"); location.hash = "#/s/phys/game/rapid"; });
  await until(page, () => !!document.querySelector("#view .choice"));
  before = await inv();
  const banned = await page.evaluate(() => ["fifty", "skip"].map(id => {
    const b = document.querySelector(`[data-pu="${id}"]`); b.disabled = false; b.click(); return !!b && /Banned/.test(b.title);
  }));
  after = await inv();
  t.ok(banned.every(Boolean) && after.fifty === before.fifty && after.skip === before.skip, "Nightmare: fifty/skip banned and not consumed even if forced");
  await page.evaluate(() => PHYS.State.setDifficulty("standard"));

  t.ok(page.errors.length === 0, "no console errors " + page.errors.slice(0, 3).join(" | "));
  await browser.close();
  t.done();
})().catch(e => { console.error(e); process.exit(1); });
