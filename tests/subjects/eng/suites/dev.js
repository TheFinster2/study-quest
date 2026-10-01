/* DEV PRESETS — ported from Close Reading's dev suite onto EN.devActions.
   The stand-alone dev menu became `EN.devActions = [{ label, run }]`, listed by the app's
   own #/dev and by the unlinked #/s/eng/dev. The suite still presses every action and
   reads the SAVE rather than the screen, checks the stamp, and that nothing links it. */
"use strict";
const { harness } = require("../lib/browser");

const ACTIONS = [
  ["Level 60",                        "() => EN.State.data.level",                             60],
  ["Level 1",                         "() => EN.State.data.level",                              1],
  ["+5,000 Marks",                    "() => EN.State.data.coins",                          "up"],
  ["Marks → 0",                       "() => EN.State.data.coins",                             0],
  ["Own every English theme + avatar","() => SQ.Store.data.owned.themes.filter(t => /^eng-/.test(t)).length", 10],
  ["9 of every power-up",             "() => Object.values(SQ.Store.data.inventory).every(n => n === 9)", true],
  ["All bosses beaten",               "() => Object.keys(EN.State.data.bossesBeaten).length",   5],
  ["Every achievement",               "() => Object.keys(EN.State.data.achievements).length", "up"],
  ["Lock English unlocks back",       "() => Object.keys(EN.State.data.bossesBeaten).length",   0],
  ["Vault: master everything",        "() => EN.State.dueCards().length",                       0],
  ["Vault: everything due",           "() => EN.State.dueCards().length",                   "up"],
  ["Vault: make 5 leeches",           "() => EN.State.leeches().length",                        5],
  ["Vault: forget it all",            "() => Object.keys(EN.State.data.srs).length",            0],
  ["Seed a lopsided skill profile",   "() => Object.keys(EN.State.data.topics).length",     "up"],
  ["Seed 12 mistakes",                "() => EN.State.data.mistakes.length",                   12],
  ["Clear answer history",            "() => EN.State.data.mistakes.length",                    0],
  ["Finish today's English challenge","() => EN.State.daily().progress >= EN.State.daily().spec.target", true]
];

module.exports = {
  name: "dev",
  needsBrowser: true,
  about: "the dev presets do what they say, stamp the save, and are not linked",

  async run(t, { ROOT }) {
    const h = await harness(ROOT);
    try {
      const page = await h.open("/dev");
      await page.waitForTimeout(500);
      const open = await page.evaluate(() => ({
        heading: (document.querySelector("#view h1") || {}).textContent || "",
        chips: document.querySelectorAll("#view .chip-btn").length,
        actions: EN.devActions.length,
        ov: document.documentElement.scrollWidth - document.documentElement.clientWidth
      }));
      t.ok(/dev/i.test(open.heading), "the subject dev screen renders");
      t.eq(open.chips, open.actions, "every preset has a button");
      t.eq(open.ov, 0, "no horizontal overflow");

      const hidden = await page.evaluate(() => {
        const navText = (document.querySelector("#navbar") || {}).textContent || "";
        const links = Array.from(document.querySelectorAll("a[href]")).map(a => a.getAttribute("href")).filter(x => /dev/i.test(x));
        return { inNav: /dev/i.test(navText), links };
      });
      t.ok(!hidden.inNav, "the navigation does not mention it");
      t.eq(hidden.links, [], "and nothing links to it");

      /* The snapshot is namespaced and survives a subject reset. */
      const snap = await page.evaluate(() => {
        const a = EN.devActions.find(x => /Snapshot English/.test(x.label));
        a.run();
        EN.State.reset();
        return !!localStorage.getItem("studyquest.dev.eng");
      });
      t.ok(snap, "the snapshot lives under studyquest.dev.eng and survives a reset");

      for (const [label, probeSrc, expect] of ACTIONS) {
        const before = await page.evaluate("(" + probeSrc + ")()");
        const ok = await page.evaluate(l => {
          const a = EN.devActions.find(x => x.label === l);
          if (!a) return false;
          a.run();
          return true;
        }, label);
        t.ok(ok, "“" + label + "” exists");
        if (!ok) continue;
        const after = await page.evaluate("(" + probeSrc + ")()");
        if (expect === "up") t.ok(after > before, "  " + label + " moves it up (" + before + " → " + after + ")");
        else t.eq(after, expect, "  " + label + " sets it");
      }

      const stamped = await page.evaluate(() => {
        SQ.Store.flush();
        const raw = JSON.parse(localStorage.getItem("studyquest.save.v1"));
        return { disk: raw.subjects.eng.dev };
      });
      t.ok(stamped.disk && stamped.disk.actions >= ACTIONS.length, "every action stamps the English save on disk");

      /* The app-wide dev menu lists the presets. */
      await page.evaluate(() => { location.hash = "#/dev"; });
      await page.waitForTimeout(500);
      const listed = await page.evaluate(() => document.querySelector("#view").textContent.includes("Vault: make 5 leeches"));
      t.ok(listed, "the app's #/dev lists English's presets");
      t.eq(page.errors.slice(0, 4), [], "console and page errors");
      await page.close();
    } finally {
      await h.close();
    }
  }
};
