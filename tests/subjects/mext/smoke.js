/* Maths Advanced smoke test: every route and every mode at 390 and 360 px,
   failing on a console error or horizontal overflow. Each mode is also played
   one step so the answer paths render. Then the things specific to this port:
   the live Extension 1 toggle, graded flashcard review, the shared shop, the
   formula sheet registered with SQ.Tools, and the mext themes.

     node tests/subjects/mext/smoke.js */
const { launch, boot, overflow, until, checker } = require("../../lib/browser");

const ROUTES = [
  "home", "play", "study", "study/deck/all", "study/leeches", "reference", "reference/ref-derivs",
  "formulas", "progress", "achievements", "shop", "options",
  "game/rapid", "game/drill", "game/drill/MA-C2", "game/drill/ME-V1", "game/equiv", "game/match",
  "game/curve", "game/crunch", "game/panic", "game/proof", "game/induction", "game/vector",
  "game/survival", "game/mistakes", "game/starred",
  "game/boss/asymptote", "game/boss/radian", "game/boss/leibniz", "game/boss/integrator",
  "game/boss/sigma", "game/boss/inductor", "game/boss/final"
];

/* Each mode with a selector proving it actually rendered (from MathQuest's smoke). */
const EXPECT = {
  "game/rapid": ".qcard", "game/drill": ".game-card", "game/equiv": ".equiv-target", "game/match": ".mgrid",
  "game/curve": "canvas.plot", "game/crunch": ".numin", "game/panic": ".ptable", "game/lab": "canvas.plot",
  "game/proof": ".proof-pool", "game/induction": ".proof-pool", "game/vector": "canvas.plot",
  "game/survival": ".qcard", "game/mistakes": ".empty, .qcard", "game/starred": ".empty, .qcard",
  "game/boss/asymptote": ".hpbar.enemy", "game/boss/inductor": ".hpbar.enemy", "game/boss/final": ".qcard"
};

const clean = errs => errs.filter(e => !/Failed to load resource/.test(e));

(async () => {
  const t = checker("mext smoke");
  const browser = await launch();
  for (const width of [390, 360]) {
    const page = await boot(browser, { subject: "mext", viewport: { width, height: 800 } });
    const missing = [];
    page.on("requestfailed", r => { if (/subjects\/mext\//.test(r.url())) missing.push(r.url()); });
    /* Unlock every boss and the Final Paper through the subject's own dev preset. */
    await page.evaluate(() => MX.devActions.find(a => /every boss/.test(a.label)).run());

    for (const r of ROUTES) {
      await page.evaluate(h => { location.hash = h; }, "#/s/mext/" + r);
      await page.waitForTimeout(r.startsWith("game/") ? 450 : 250);
      const sel = EXPECT[r] || null;
      const ok = await page.evaluate(s => {
        const v = document.querySelector("#view");
        return v.children.length > 0 && (!s || !!v.querySelector(s));
      }, sel);
      t.ok(ok, `${width}px ${r}: rendered${sel ? " " + sel : ""}`);
      const o = await overflow(page);
      t.ok(o.px <= 0, `${width}px ${r}: no horizontal overflow`, o.wide.join(", "));
      /* One interaction, so the feedback path is exercised too. */
      await page.evaluate(() => {
        const ch = document.querySelector("#view .choice:not([disabled])");
        if (ch) { ch.click(); return; }
        const inp = document.querySelector("#view input.numin:not([disabled])");
        if (inp) {
          inp.value = "2"; inp.dispatchEvent(new Event("input", { bubbles: true }));
          const b = [...document.querySelectorAll("#view button")].find(x => /Submit|Check/i.test(x.textContent) && !x.disabled);
          if (b) b.click(); return;
        }
        const cell = document.querySelector("#view .mcard, #view .pcell, #view .proof-card, #view .fcard");
        if (cell) cell.click();
      });
      await page.waitForTimeout(250);
      const o2 = await overflow(page);
      t.ok(o2.px <= 0, `${width}px ${r}: no overflow after answering`, o2.wide.join(", "));
      await page.evaluate(() => SQ.UI.closeModal(true));
    }
    t.ok(missing.length === 0, `${width}px: every subjects/mext file loads`, missing.join(", "));
    t.ok(clean(page.errors).length === 0, `${width}px: zero console errors`, clean(page.errors).slice(0, 4).join(" | "));
    await page.close();
  }

  /* ── the behaviours this port added or rewired ── */
  const page = await boot(browser, { subject: "mext" });
  const go = async h => { await page.evaluate(x => { location.hash = x; }, "#/s/mext/" + h); await page.waitForTimeout(350); };

  /* Answering records, reveals and waits for Next. */
  await go("game/drill/MA-C2");
  await page.waitForTimeout(1300);
  const before = await page.evaluate(() => MX.State.data.stats.answered);
  await page.click("#view .choice");
  await page.waitForTimeout(250);
  t.ok(await page.evaluate(() => !!document.querySelector(".feedback") && !!document.querySelector(".js-next")),
    "answering reveals the worked explanation and waits for Next");
  t.ok(await page.evaluate(b => MX.State.data.stats.answered === b + 1, before), "the answer is recorded");
  await page.click(".bookmark-btn");
  t.ok(await page.evaluate(() => MX.State.data.bookmarks.length > 0), "starring a question saves it");

  /* Keyboard: B picks the second option. */
  await go("game/drill/MA-C2");
  await page.keyboard.press("b");
  await page.waitForTimeout(200);
  t.ok(await page.evaluate(() => !!document.querySelector(".feedback")), "keyboard A–D answers a question");

  /* Graded flashcard review. */
  await go("study/deck/all");
  await page.click(".fcard");
  await page.waitForTimeout(200);
  const grades = await page.evaluate(() => [...document.querySelectorAll(".grade-row button")].map(b => b.textContent.trim()));
  t.ok(grades.length === 4 && /Again/.test(grades[0]) && /Easy/.test(grades[3]), "flashcards grade Again / Hard / Good / Easy", grades.join(","));
  const tgt = await page.evaluate(() => {
    const b = [...document.querySelectorAll(".grade-row button")].find(x => /Hard/.test(x.textContent));
    b.click();
    return Object.values(MX.State.data.srs).some(s => s.reps === 1);
  });
  t.ok(tgt, "a graded review updates the card's schedule");

  /* The formula sheet reaches the shared tool tray. */
  const sheet = await page.evaluate(() => {
    const s = SQ.Tools.getSheet("mext");
    if (!s) return null;
    const items = [].concat(...s.sections.map(x => x.items));
    return { n: items.length, free: items.filter(i => i.free).length, learn: items.filter(i => !i.free).length,
             rendered: typeof s.render === "function" && /class="frac"/.test(s.render("\\frac{1}{2}")) };
  });
  t.ok(sheet && sheet.n >= 30 && sheet.free >= 10 && sheet.learn >= 10 && sheet.rendered,
    "the formula sheet is registered with SQ.Tools (✅ free, 🧠 not) and renders maths", JSON.stringify(sheet));

  /* Advanced and Extension 1 are separate subjects: this one holds the ME tier only. */
  const pinned = await page.evaluate(() => ({ tiers: MX.DATA.TIERS.join(),
    other: MX.Bank.all().filter(q => !q.topic.startsWith("ME-")).length,
    sheet: [].concat(...SQ.Tools.getSheet("mext").sections.map(x => x.items)).filter(i => i.tier && i.tier !== "ME").length }));
  t.ok(pinned.tiers === "ME" && pinned.other === 0 && pinned.sheet === 0, "only ME questions and formulas", JSON.stringify(pinned));
  await go("play");
  const playText = await page.evaluate(() => document.querySelector("#view").innerText);
  t.ok(/Vector Lab|Induction Builder/.test(playText), "Extension 1 offers Vector Lab and the Induction Builder");
  await go("options");
  t.ok(await page.evaluate(() => !document.querySelector("#view .switch") && /Open (Maths|Extension)/.test(document.querySelector("#view").innerText)),
    "Options links to the other maths subject instead of a toggle");

  /* The shared shop with MathQuest's catalogue. */
  await go("shop");
  const shop = await page.evaluate(() => {
    const txt = document.querySelector("#view").innerText;
    return { themes: /Graph Paper/.test(txt) && /Blackboard/.test(txt), avatars: /GOAT|Fields Medallist/.test(txt),
             crates: /Supply Crate/.test(txt) };
  });
  t.ok(shop.themes && shop.avatars && shop.crates, "the shop lists mext themes, avatars and crates", JSON.stringify(shop));

  /* mext themes are defined on the core tokens. */
  const themes = await page.evaluate(() => MX.DATA.shop.themes.map(th => {
    document.documentElement.dataset.theme = th.id;
    return getComputedStyle(document.documentElement).getPropertyValue("--bg-0").trim().toLowerCase() === th.dots[0];
  }));
  t.ok(themes.length >= 4 && themes.every(Boolean), "every mext theme sets the core tokens", themes.join(","));

  /* Leaving the subject: the maths CSS must not leak into the hub. */
  await page.evaluate(() => { location.hash = "#/home"; });
  await page.waitForTimeout(300);
  const leak = await page.evaluate(() => {
    const s = document.createElement("span"); s.className = "frac"; document.body.appendChild(s);
    const d = getComputedStyle(s).display; s.remove(); return d;
  });
  t.ok(leak !== "inline-flex", "subject CSS is scoped (a .frac outside the subject is unstyled)", leak);

  t.ok(clean(page.errors).length === 0, "zero console errors in the behaviour checks", clean(page.errors).slice(0, 4).join(" | "));
  await browser.close();
  t.done();
})().catch(e => { console.error(e); process.exit(1); });
