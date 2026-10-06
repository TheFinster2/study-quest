/* Two bots for Chemistry's economy tests.

   random  — knows nothing and never waits: picks a random option the instant it
             appears, types junk, declares a titration at 0 mL, flips memory cards at
             random, taps every solubility cell once, marks flashcards "Easy" at once.
   honest  — knows the answer (reads CHEM.__current, a test affordance each mode
             sets) and waits just past the shared read floor before answering.

   Each driver plays one run of one mode to its results screen (or gives up after a
   step budget) and returns the XP it gained. */
"use strict";

const xp = page => page.evaluate(() => CHEM.State.data.xp);

async function go(page, r) {
  await page.evaluate(h => { SQ.UI.closeModal(true); location.hash = h; }, "#/s/chem/" + r);
  await page.waitForTimeout(250);
}
const resultsOpen = page => page.evaluate(() => !!document.querySelector(".modal .result-grid"));
async function waitFloor(page, honest) {
  if (!honest) return;
  const ms = await page.evaluate(() => {
    const c = CHEM.__current || {};
    return CHEM.UI.readFloor(c.stem || c.text || "") - (performance.now() - (c.shownAt || performance.now()));
  });
  await page.waitForTimeout(Math.max(0, ms) + 150);
}
const clickNext = page => page.evaluate(() => {
  const n = [...document.querySelectorAll("#view .js-next")].pop();
  if (n && !n.disabled) { n.click(); return true; } return false;
});

/* ── MCQ modes: rapid, drill, mistakes, naming, survival, boss ── */
async function mcq(page, route, honest, budget, missAt) {
  await go(page, route);
  let answered = 0;
  for (let i = 0; i < (budget || 60); i++) {
    if (await resultsOpen(page)) break;
    const has = await page.evaluate(() => !!document.querySelector("#view .choice:not([disabled])"));
    if (has) {
      await waitFloor(page, honest);
      answered++;
      const miss = missAt && answered >= missAt;
      await page.evaluate(([h, miss]) => {
        const bs = [...document.querySelectorAll("#view .choice")];
        const c = CHEM.__current || {};
        let k = h ? c.answer : Math.floor(Math.random() * bs.length);
        if (miss) k = (c.answer + 1) % bs.length;
        if (bs[k] && !bs[k].disabled) bs[k].click();
      }, [honest, miss]);
    } else if (!(await clickNext(page))) {
      await page.waitForTimeout(honest ? 300 : 120);
      continue;
    }
    await page.waitForTimeout(honest ? 60 : 15);
  }
  await page.waitForTimeout(900);
}

async function balance(page, honest) {
  await go(page, "game/balance");
  for (let i = 0; i < (honest ? 30 : 40); i++) {
    if (await resultsOpen(page)) break;
    if (await clickNext(page)) { await page.waitForTimeout(80); continue; }
    if (honest) await page.waitForTimeout(1500);
    await page.evaluate(h => {
      const ins = [...document.querySelectorAll("#view .coeff")];
      const ans = (CHEM.__current || {}).answer || [];
      ins.forEach((inp, k) => { inp.value = String(h ? ans[k] : 1 + Math.floor(Math.random() * 4)); });
      const chk = [...document.querySelectorAll("#view .btn-primary")].find(b => /Check/.test(b.textContent));
      if (chk && !chk.disabled) chk.click();
    }, honest);
    await page.waitForTimeout(40);
  }
  await page.waitForTimeout(900);
}

async function ionmatch(page, honest) {
  await go(page, "game/ionmatch");
  if (honest) {
    const pairs = await page.evaluate(() => CHEM.__current.pairs);
    for (const [a, b] of pairs) {
      await page.evaluate(([a, b]) => { const n = document.querySelectorAll("#view .mcard"); n[a].click(); n[b].click(); }, [a, b]);
      await page.waitForTimeout(450);
    }
  } else {
    for (let i = 0; i < 400; i++) {
      if (await resultsOpen(page)) break;
      await page.evaluate(() => {
        const n = [...document.querySelectorAll("#view .mcard:not(.done):not(.flip)")];
        if (n.length) n[Math.floor(Math.random() * n.length)].click();
      });
      await page.waitForTimeout(i % 2 ? 900 : 10);   // wait out the mismatch flip-back
    }
  }
  await page.waitForTimeout(1200);
}

async function calc(page, honest) {
  await go(page, "game/calc");
  for (let i = 0; i < 30; i++) {
    if (await resultsOpen(page)) break;
    if (await clickNext(page)) { await page.waitForTimeout(60); continue; }
    if (honest) await page.waitForTimeout(1500);
    await page.evaluate(h => {
      const inp = document.querySelector("#view .numin:not([disabled])");
      if (!inp) return;
      inp.value = h ? String(CHEM.__current.answer) : String(Math.floor(Math.random() * 10));
      const sub = [...document.querySelectorAll("#view .btn-primary")].find(b => /Submit/.test(b.textContent) && !b.disabled);
      if (sub) sub.click();
    }, honest);
    await page.waitForTimeout(40);
  }
  await page.waitForTimeout(900);
}

async function titration(page, honest) {
  await go(page, "game/titration");
  const btn = label => page.evaluate(l => {
    const b = [...document.querySelectorAll("#view .btn")].find(x => x.textContent.trim().startsWith(l));
    if (b && !b.disabled && !b.hidden) { b.click(); return true; } return false;
  }, label);
  /* Deliver titrant in descending steps up to `target` mL of this run. */
  async function deliver(target) {
    let vb = await page.evaluate(() => 0);
    for (const [step, label] of [[5, "+5.00"], [1, "+1.00"], [0.1, "+0.10"], [0.05, "+1 drop"]]) {
      while (vb + step <= target + 0.025) { await btn(label); vb = +(vb + step).toFixed(2); }
    }
  }
  /* The prac: a rough run, then accurate runs until three are concordant. The honest
     bot overshoots the rough run by about a millilitre (as a real one does), then
     fast-fills and goes dropwise to the end point. The random bot records every run
     the instant it starts — three "concordant" zeros — and types junk. */
  const vEq = await page.evaluate(() => CHEM.__current.vEq);
  if (honest) { await deliver(Math.floor(vEq) + 1); await page.waitForTimeout(400); }
  await btn("Record end point");
  for (let i = 0; i < 6; i++) {
    if (await page.evaluate(() => [...document.querySelectorAll("#view .btn")].some(b => /^Calculate/.test(b.textContent.trim())))) break;
    await btn("Next accurate titration");
    await page.waitForTimeout(80);
    if (honest) {
      await btn("⏩ Fast to");
      const fromHere = await page.evaluate(() => { const r = CHEM.__current; return r.rough - 1; });
      await deliver(vEq - Math.max(0, fromHere));
      await page.waitForTimeout(300);
    }
    await btn("Record end point");
    await page.waitForTimeout(80);
  }
  await btn("Calculate");
  await page.waitForTimeout(150);
  if (honest) await page.waitForTimeout(1500);
  await page.evaluate(h => {
    const [m, c] = [...document.querySelectorAll("#view .numin:not([disabled])")];
    m.value = h ? CHEM.__current.mean.toFixed(2) : "0";
    c.value = h ? String(CHEM.__current.answer) : "0";
    const sub = [...document.querySelectorAll("#view .btn-primary")].find(b => /Submit/.test(b.textContent));
    sub.click();
  }, honest);
  await page.waitForTimeout(150);
  await clickNext(page);
  await page.waitForTimeout(900);
}

async function pathway(page, honest) {
  await go(page, "game/pathway");
  for (let i = 0; i < (honest ? 160 : 3000); i++) {
    if (await resultsOpen(page)) break;
    if (await clickNext(page)) { await page.waitForTimeout(80); continue; }
    if (honest) await page.waitForTimeout(700);
    await page.evaluate(h => {
      const bs = [...document.querySelectorAll("#view .reagent:not([disabled])")];
      /* the random bot also hits "Restart this route" now and then, or one dead end
         (a polymer, an ester) strands it for good */
      const reset = [...document.querySelectorAll("#view .btn-ghost")].find(x => /Restart/.test(x.textContent));
      if (!h && reset && Math.random() < 0.12) { reset.click(); return; }
      const want = h ? (CHEM.__current || {}).next : null;
      const b = want ? bs.find(x => x.dataset.id === want) : bs[Math.floor(Math.random() * bs.length)];
      if (b) b.click();
    }, honest);
    await page.waitForTimeout(20);
  }
  await page.waitForTimeout(900);
}

async function precipitate(page, honest) {
  await go(page, "game/precipitate");
  if (honest) await page.waitForTimeout(3000);
  await page.evaluate(h => {
    const cells = CHEM.__current.cells;
    document.querySelectorAll("#view .pcell").forEach(b => {
      const c = cells.find(x => x.key === b.dataset.key);
      const taps = h ? (c.soluble ? 2 : 1) : 1;
      for (let i = 0; i < taps; i++) b.click();
    });
    const chk = [...document.querySelectorAll("#view .btn-primary")].find(b => /Check board/.test(b.textContent));
    chk.click();
  }, honest);
  await page.waitForTimeout(1800);
}

async function flashcards(page, honest) {
  await go(page, "study");
  await page.evaluate(() => { const b = document.querySelector("#view .btn-primary"); if (b) b.click(); });
  await page.waitForTimeout(150);
  for (let i = 0; i < 25; i++) {
    if (await resultsOpen(page)) break;
    await page.evaluate(() => { const f = document.querySelector("#view .fcard:not(.flip)"); if (f) f.click(); });
    await waitFloor(page, honest);
    await page.evaluate(h => {
      const g = document.querySelector(`#view .js-grade[data-grade="${h ? "good" : "easy"}"]`);
      if (g) g.click();
    }, honest);
    await page.waitForTimeout(honest ? 40 : 10);
  }
  await page.waitForTimeout(900);
}

const MODES = {
  "Rapid Fire":          (p, h) => mcq(p, "game/rapid", h, 4000),
  "Module Drill":        (p, h) => mcq(p, "game/drill/M5", h),
  /* seeded right before, since the modes before it may have fixed every mistake */
  "Mistake Rehab":       async (p, h) => { await seedMistakes(p); return mcq(p, "game/mistakes", h); },
  "Name That Compound":  (p, h) => mcq(p, "game/naming", h),
  /* Survival only ends on a miss, so the honest bot misses on purpose at Q14 */
  "Survival":            (p, h) => mcq(p, "game/survival", h, 60, h ? 14 : 0),
  "Boss (Le Chatelier)": (p, h) => mcq(p, "game/boss/b5", h, 80),
  "Balance Blitz":       balance,
  "Ion Memory":          ionmatch,
  "Calculation Crunch":  calc,
  "Titration Lab":       titration,
  "Pathway Puzzle":      pathway,
  "Precipitation Panic": precipitate,
  "Flashcards":          flashcards
};

/** Put some questions into the mistakes list so Mistake Rehab has a pool. */
async function seedMistakes(page) {
  await page.evaluate(() => {
    CHEM.Bank.all().slice(0, 12).forEach(q => { CHEM.State.data.mistakes.push({ id: q.id, mod: q.mod, misses: 1, ts: 1 }); });
    CHEM.State.save();
  });
}

module.exports = { MODES, xp, go, seedMistakes };
