/* The shell, in a browser: onboarding, the hub screens, the reward pipeline, the shops,
   the Exchange, and the overall level — driven through a synthetic subject so this
   suite does not depend on any real subject being ported.
   node tests/app/hub.js */
const B = require("../lib/browser");

(async () => {
  const t = B.checker("app/hub");
  const br = await B.launch();

  /* ── first run: onboarding appears, picking subjects enrols them ── */
  {
    const page = await B.boot(br, { save: { settings: { sound: false, motion: "off" } } });
    await B.until(page, () => !document.querySelector("#modal-root").hidden, { message: "onboarding never opened" });
    t.ok(await page.evaluate(() => /Welcome to StudyQuest/.test(document.querySelector("#modal-root").textContent)), "onboarding modal shows");
    await page.evaluate(() => {
      const picks = [...document.querySelectorAll(".pick")];
      picks.find(p => /Chemistry/.test(p.textContent)).click();
      [...document.querySelectorAll(".pick")].find(p => /Maths Standard/.test(p.textContent)).click();
      [...document.querySelectorAll(".pick")].find(p => /Maths Advanced/.test(p.textContent)).click();
      /* Extension 1 brings Advanced with it (it is already chosen here; still chosen after). */
      [...document.querySelectorAll(".pick")].find(p => /Maths Extension 1/.test(p.textContent)).click();
    });
    const enrolled = await page.evaluate(() => { document.querySelector("#modal-root .btn-primary.btn-block").click(); return SQ.Store.data.enrolled; });
    t.ok(JSON.stringify(enrolled) === JSON.stringify(["chem", "madv", "mext"]), "Maths Standard and Advanced are either/or; Extension 1 rides with Advanced: " + enrolled);
    t.ok(await page.evaluate(() => SQ.Store.data.settings.onboarded), "onboarded flag set");
    t.ok(!page.errors.length, "no console errors on first run: " + page.errors.join(" | "));
    await page.close();
  }

  /* ── the reward pipeline, through a synthetic subject ── */
  const page = await B.boot(br, {});
  await page.evaluate(() => {
    SQ.Subjects.register({ id: "test", ns: "TESTSUBJ", name: "Test Subject", short: "Test", icon: "🧪",
      color: "#fff", currency: { name: "Tokens", one: "Token", icon: "🪙" }, group: "Test" });
    window.TESTSUBJ = {};
    TESTSUBJ.State = SQ.SubjectState.create("test", {
      levelTitles: ["One", "Two", "Three"],
      achievements: () => [{ id: "t_first", name: "First", icon: "1", reward: 50, check: s => s.answered >= 1 }]
    });
    TESTSUBJ.UI = SQ.UI.bind("test", { coinRate: 0.75 });
  });

  const r1 = await page.evaluate(() => {
    const S = TESTSUBJ.State;
    const before = { xp: S.data.xp, coins: S.data.coins, stars: SQ.Store.data.stars, ov: SQ.Store.data.overall.xp };
    S.recordAnswer("M1", true, "q1");
    const got = TESTSUBJ.UI.award({ xp: 100, bonus: 100, accuracy: 0.4, answered: 10, coins: 100 });
    return { before, got, after: { xp: S.data.xp, coins: S.data.coins, stars: SQ.Store.data.stars, ov: SQ.Store.data.overall.xp } };
  });
  t.ok(r1.got.xp === 100, "bonus withheld below 50% accuracy (xp " + r1.got.xp + ")");
  t.ok(r1.after.xp - r1.before.xp === 100, "subject XP rose by what award() reported");
  t.ok(r1.after.ov - r1.before.ov === 100, "overall XP rose by the same amount");
  t.ok(r1.got.coins === 75, "subject coins scaled by the subject's coin rate (" + r1.got.coins + ")");
  t.ok(r1.got.stars === 15, "Stars = 15% of XP (" + r1.got.stars + ")");
  t.ok(r1.after.coins - r1.before.coins >= 75 + 50, "subject achievement paid subject coins");

  const r2 = await page.evaluate(() => {
    const S = TESTSUBJ.State;
    S.setDifficulty("nightmare");
    S.data.prestige = 3;
    const got = TESTSUBJ.UI.award({ xp: 100, boost: 2 });
    S.setDifficulty("standard"); S.data.prestige = 0;
    const few = TESTSUBJ.UI.award({ xp: 0, bonus: 100, accuracy: 1, answered: 3 });
    const gentle = (S.setDifficulty("gentle"), TESTSUBJ.UI.award({ xp: 100 }));
    S.setDifficulty("standard");
    return { capped: got.xp, few: few.xp, gentle: gentle.xp, banned: (S.setDifficulty("nightmare"), S.usePowerup("fifty")) };
  });
  t.ok(r2.capped === 400, "multipliers are capped at ×4 (" + r2.capped + ")");
  t.ok(r2.few === 0, "no completion bonus with fewer than 5 answers");
  t.ok(r2.gentle === 85, "Gentle pays ×0.85 (" + r2.gentle + ")");
  t.ok(r2.banned === false, "Nightmare bans 50/50");
  await page.evaluate(() => TESTSUBJ.State.setDifficulty("standard"));

  /* ── cards: graded review and leeches ── */
  const cards = await page.evaluate(() => {
    const S = TESTSUBJ.State;
    S.reviewCard("c1", "easy");
    const easy = S.cardState("c1").box;
    for (let i = 0; i < 4; i++) S.reviewCard("c2", "again");
    return { easy, leech: S.isLeech("c2"), hard: (S.reviewCard("c3", "good"), S.reviewCard("c3", "hard"), S.cardState("c3").box) };
  });
  t.ok(cards.easy === 3, "easy moves a card up two boxes");
  t.ok(cards.leech, "four lapses make a leech");
  t.ok(cards.hard === 2, "hard keeps the box");

  /* ── overall level-ups pay Stars; overall achievements pay Stars ── */
  const ov = await page.evaluate(() => {
    const s0 = SQ.Store.data.stars, l0 = SQ.Store.data.overall.level;
    TESTSUBJ.UI.award({ xp: 20000, raw: true });
    return { levels: SQ.Store.data.overall.level - l0, stars: SQ.Store.data.stars - s0, got: Object.keys(SQ.Store.data.achievements) };
  });
  t.ok(ov.levels > 3, "20k XP gains several overall levels (" + ov.levels + ")");
  t.ok(ov.stars > 0, "overall level-ups paid Stars (" + ov.stars + ")");
  t.ok(ov.got.includes("ov_first"), "app achievement 'First steps' unlocked");

  /* ── the general shop sells a power-up for Stars ── */
  await page.evaluate(() => { SQ.Store.data.stars = 500; location.hash = "#/shop/powerups"; });
  await page.waitForTimeout(200);
  const buy = await page.evaluate(() => {
    const before = { stars: SQ.Store.data.stars, n: SQ.Store.data.inventory.freeze };
    const card = [...document.querySelectorAll(".shop-item")].find(c => /Time Freeze/.test(c.textContent));
    card.querySelector(".btn-primary").click();
    return { before, after: { stars: SQ.Store.data.stars, n: SQ.Store.data.inventory.freeze } };
  });
  t.ok(buy.after.n === buy.before.n + 1, "power-up added to the shared inventory");
  t.ok(buy.after.stars === buy.before.stars - 38, "priced in Stars");
  const inv = await page.evaluate(() => TESTSUBJ.State.data.inventory === SQ.Store.data.inventory);
  t.ok(inv, "a subject's data.inventory IS the shared inventory");
  const noDup = await page.evaluate(() => !("inventory" in JSON.parse(JSON.stringify(SQ.Store.data.subjects.test))));
  t.ok(noDup, "linked fields are not written into the subject slot");

  /* ── a subject shop: difficulty, Exchange ── */
  await page.evaluate(() => {
    TESTSUBJ.UI.route("shop", v => SQ.Shop.subject(v, "test", { themes: [], avatars: [{ emoji: "🧪", price: 10, level: 1 }] }));
    SQ.Loader.isLoaded = (orig => id => id === "test" || orig(id))(SQ.Loader.isLoaded);
    TESTSUBJ.State.data.coins = 1000;
    location.hash = "#/s/test/shop";
  });
  await page.waitForTimeout(250);
  const ex = await page.evaluate(() => {
    const s0 = SQ.Store.data.stars;
    const sec = [...document.querySelectorAll(".shop-sec")].find(s => /Exchange/.test(s.textContent));
    const r = sec.querySelector("input[type=range]"); r.value = 500; r.dispatchEvent(new Event("input"));
    sec.querySelector(".btn-primary").click();
    const hard = [...document.querySelectorAll(".diff-card")].find(c => /Hard/.test(c.textContent)); hard.click();
    return { coins: TESTSUBJ.State.data.coins, stars: SQ.Store.data.stars - s0, diff: TESTSUBJ.State.difficulty().id,
             header: document.querySelector("#coin-pill").hidden === false };
  });
  t.ok(ex.coins === 500 && ex.stars === 100, `Exchange: 500 coins → 100 Stars (got coins ${ex.coins}, +${ex.stars} ⭐)`);
  t.ok(ex.diff === "hard", "difficulty set from the subject shop");
  t.ok(ex.header, "subject coin pill shows inside a subject");
  const ctx = await page.evaluate(() => ({ subj: document.documentElement.dataset.subject, nav: [...document.querySelectorAll(".nav-item")].map(a => a.getAttribute("href")) }));
  t.ok(ctx.subj === "test", "html[data-subject] set in a subject");
  t.ok(ctx.nav[0] === "#/home" && ctx.nav.some(h => h === "#/s/test/play"), "subject nav links resolve inside the subject");
  t.ok(await page.evaluate(() => TESTSUBJ.UI.resolve("/arcade") === "/arcade" && TESTSUBJ.UI.resolve("/play") === "/s/test/play"), "bound go() keeps app routes app-level");

  /* ── every hub screen renders at 390 and 360 with no overflow ── */
  for (const w of [390, 360]) {
    await page.setViewportSize({ width: w, height: 800 });
    for (const h of ["#/home", "#/subjects", "#/progress", "#/achievements", "#/shop/powerups", "#/shop/cosmetics", "#/shop/arcade", "#/settings", "#/dev", "#/arcade", "#/s/test/shop"]) {
      await page.evaluate(h => { location.hash = h; }, h);
      await page.waitForTimeout(150);
      const o = await B.overflow(page);
      t.ok(o.px <= 0, `${h} @${w}px overflows by ${o.px}px: ${o.wide.join(", ")}`);
    }
  }
  /* modals: profile + switcher open and close */
  await page.evaluate(() => { location.hash = "#/home"; });
  await page.waitForTimeout(100);
  const modals = await page.evaluate(() => {
    SQ.Hub.profileSheet(); const a = !document.querySelector("#modal-root").hidden;
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    const b = document.querySelector("#modal-root").hidden;
    SQ.Hub.switcher(); const c = document.querySelectorAll(".switch-row").length;
    SQ.UI.closeModal();
    return { a, b, c };
  });
  t.ok(modals.a && modals.b, "profile sheet opens and Esc closes it");
  t.ok(modals.c >= 2, "switcher lists the hub and subjects");

  /* ── persistence: flush writes, a reload keeps everything ── */
  const stars = await page.evaluate(() => { SQ.Store.flush(); return SQ.Store.data.stars; });
  await page.reload();
  await B.until(page, () => window.SQ && SQ.Store && SQ.Store.data);
  t.ok(await page.evaluate(() => SQ.Store.data.stars) === stars, "Stars survive a reload");

  t.ok(!page.errors.length, "no console errors: " + page.errors.slice(0, 3).join(" | "));
  await br.close();
  t.done();
})().catch(e => { console.error(e); process.exit(1); });
