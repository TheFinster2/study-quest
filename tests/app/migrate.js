/* Bringing old progress across: saves left in localStorage by the stand-alone apps
   (same origin on GitHub Pages) are found on first launch, offered, and imported
   through each subject's own importLegacy().
   node tests/app/migrate.js

   Only subjects that are already ported take part; the rest are skipped with a note,
   so this suite grows with the ports instead of failing on them. */
const fs = require("fs");
const path = require("path");
const B = require("../lib/browser");

const ported = id => fs.existsSync(path.join(B.ROOT, "subjects", id, "manifest.js"));

/* Minimal but realistic old saves, shaped like each source app's state.js DEFAULT(). */
const LEGACY = {
  madv: { key: "mathquest.save.v1", save: {
    v: 1, profile: { name: "Fin", avatar: "🧮", theme: "euler" },
    xp: 41000, level: 14, xpIntoLevel: 1200, coins: 3210, prestige: 0, lifetimeXp: 41000,
    streak: { count: 4, lastDay: "2026-09-20", longest: 12 },
    stats: { answered: 812, correct: 640, bestStreak: 21 },
    topics: { "MA-C1": { seen: 60, correct: 48 } }, srs: { "fc-ma-001": { box: 3, due: "2026-09-25", reps: 4, lapses: 1 } },
    mistakes: [{ id: "ma-c1-004", topic: "MA-C1", misses: 2, ts: 1 }], bookmarks: ["ma-c1-010"],
    achievements: { first_blood: 1 }, inventory: { fifty: 2, boost: 3, adrenaline: 1 },
    owned: { themes: ["graph", "euler"], avatars: ["🧮", "📐"] }, settings: { difficulty: "hard" } } },
  phys: { key: "newtonsnotebook.save.v1", save: {
    v: 1, profile: { name: "Fin", avatar: "🔭", theme: "graphite" },
    xp: 9000, level: 8, xpIntoLevel: 300, coins: 900, prestige: 0, lifetimeXp: 9000,
    streak: { count: 2, lastDay: "2026-09-20", longest: 30 },
    stats: { answered: 300, correct: 210, bestStreak: 9 },
    modules: { M5: { seen: 40, correct: 30, topics: {} } }, srs: {}, mistakes: [],
    achievements: {}, inventory: { fifty: 1, skip: 4 },
    owned: { themes: ["graphite"], avatars: ["🔭"] }, settings: { difficulty: "standard" } } }
};

(async () => {
  const t = B.checker("app/migrate");
  const ids = Object.keys(LEGACY).filter(ported);
  Object.keys(LEGACY).filter(id => !ported(id)).forEach(id => console.log("  · " + id + ": not ported yet, skipped"));
  if (!ids.length) { console.log("app/migrate: nothing ported yet"); return; }

  const br = await B.launch();
  const page = await br.newPage({ viewport: { width: 390, height: 844 } });
  const errors = [];
  page.on("pageerror", e => errors.push(e.message));
  /* Old keys plus a StudyQuest save that is onboarded but has not been offered an import. */
  await page.addInitScript(arg => {
    if (localStorage.getItem("sq-test-seeded")) return;
    localStorage.setItem("sq-test-seeded", "1");
    arg.ids.forEach(id => localStorage.setItem(arg.legacy[id].key, JSON.stringify(arg.legacy[id].save)));
    localStorage.setItem("studyquest.save.v1", JSON.stringify({
      settings: { onboarded: true, sound: false, motion: "off" }, enrolled: ["chem"], migrateOffered: false }));
  }, { ids, legacy: LEGACY });
  await page.goto(B.appUrl("index.html") + "#/home");

  await B.until(page, () => /Found your old progress/.test((document.querySelector("#modal-root") || {}).textContent || ""),
    { message: "the import prompt never appeared", timeout: 8000 });
  const rows = await page.evaluate(() => document.querySelectorAll("#modal-root .migrate-row").length);
  t.ok(rows === ids.length, `one row per old save found (${rows}/${ids.length})`);

  await page.evaluate(() => [...document.querySelectorAll("#modal-root .btn-primary")].find(b => /Bring it across/.test(b.textContent)).click());
  await B.until(page, () => /Welcome back|Nothing imported/.test(document.querySelector("#modal-root").textContent),
    { message: "import never finished", timeout: 30000 });
  const after = await page.evaluate(() => JSON.parse(JSON.stringify(SQ.Store.data)));

  for (const id of ids) {
    const old = LEGACY[id].save, slot = after.subjects[id];
    t.ok(!!slot, id + ": slot created");
    if (!slot) continue;
    t.ok(slot.level === old.level, `${id}: level kept (${slot.level})`);
    t.ok((slot.lifetimeXp || slot.xp) >= old.xp, `${id}: XP kept`);
    t.ok(slot.coins === old.coins, `${id}: coins kept`);
    t.ok(after.migrated[id] > 0, id + ": marked migrated");
    t.ok(after.enrolled.includes(id), id + ": enrolled");
    t.ok(!("inventory" in slot) && !("profile" in slot), id + ": shared fields not duplicated into the slot");
  }
  if (ids.includes("madv")) {
    const s = after.subjects.madv;
    t.ok(s.stats.answered === 812 && s.srs["fc-ma-001"] && s.srs["fc-ma-001"].box === 3, "madv: stats and cards came across");
    t.ok(s.mistakes.length === 1 && s.bookmarks[0] === "ma-c1-010", "madv: mistakes and bookmarks came across");
    t.ok(s.settings.difficulty === "hard", "madv: difficulty kept");
    t.ok(after.owned.themes.includes("ember") && !after.owned.themes.includes("madv-euler"), "madv: legacy themes map to app ids");
    t.ok(after.inventory.double >= 3 && after.inventory.revive >= 1, "madv: power-ups renamed (boost→double, adrenaline→revive)");
    t.ok(after.profile.theme === "ember", "madv: profile theme carried across (euler → ember)");
  }
  t.ok(after.profile.name === "Fin", "profile name filled from the old app");
  t.ok(after.streak.longest >= 12, "longest streak carried across");
  t.ok(after.overall.lifetimeXp >= ids.reduce((n, id) => n + LEGACY[id].save.xp, 0), "past XP counts toward the overall level");
  t.ok(after.overall.level > 1, `overall level rose (${after.overall.level})`);

  /* The old saves are untouched. */
  const kept = await page.evaluate(arg => arg.ids.every(id => !!localStorage.getItem(arg.legacy[id].key)), { ids, legacy: LEGACY });
  t.ok(kept, "old apps' saves are left in place");

  /* After the reload, the subject opens on the imported level, and a second offer finds nothing. */
  await page.evaluate(() => location.reload());
  await B.until(page, () => window.SQ && SQ.Store && SQ.Store.data && SQ.Store.data.migrateOffered);
  const id = ids[0];
  await page.evaluate(id => { location.hash = "#/s/" + id + "/home"; }, id);
  await B.until(page, id => SQ.Loader.isLoaded(id), { arg: id, timeout: 20000 });
  const lvl = await page.evaluate(id => SQ.Subjects.ns(id).State.data.level, id);
  t.ok(lvl === LEGACY[id].save.level, `${id} opens on the imported level (${lvl})`);
  t.ok(await page.evaluate(() => SQ.Migrate.found().length === 0), "nothing left to offer");

  /* A subject that already has progress here is not overwritten by the automatic offer. */
  const skipped = await page.evaluate(arg => {
    const meta = SQ.Subjects.get(arg.id);
    SQ.Store.data.subjects[arg.id].lifetimeXp = 99999;
    return SQ.Migrate.apply(meta, arg.old).then(r => r.skipped);
  }, { id, old: LEGACY[id].save });
  t.ok(skipped === true, "an automatic import never overwrites progress made in StudyQuest");

  t.ok(!errors.length, "no page errors: " + errors.slice(0, 3).join(" | "));
  await br.close();
  t.done();
})().catch(e => { console.error(e); process.exit(1); });
