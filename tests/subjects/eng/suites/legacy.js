/* LEGACY IMPORT — a Close Reading save (closereading.save.v1) maps onto the new slot:
   subject fields kept, power-ups renamed to the shared set (adrenaline → double), themes
   prefixed eng-, the starter 50/50 + Skip not double-counted. */
"use strict";
const { loadData } = require("../lib/measure");

module.exports = {
  name: "legacy",
  about: "importLegacy maps an old Close Reading save onto the StudyQuest slot",
  run(t, { ROOT }) {
    const { EN } = loadData(ROOT, ["subjects/eng/core/util.js", "subjects/eng/boot.js"]);
    const old = {
      profile: { name: "Ada", avatar: "🪶", theme: "foolscap" },
      xp: 5000, level: 7, xpIntoLevel: 120, coins: 900, prestige: 0, lifetimeXp: 5000,
      streak: { count: 3, lastDay: "2026-09-01", longest: 11 },
      stats: { answered: 300, correct: 200, clozeSolved: 40 },
      modules: { common: { seen: 40, correct: 30 } }, texts: { "1984": { seen: 20, correct: 15 } },
      topics: { Techniques: { seen: 12, correct: 8 } }, puzzlesSolved: { p1: 1 },
      bossesBeaten: { party: 1 }, srs: { "q1": { box: 3, due: "2026-09-02", reps: 4, lapses: 1 } },
      mistakes: [{ id: "c1", misses: 2 }], achievements: { a_first: 1 },
      inventory: { fifty: 3, skip: 1, freeze: 2, adrenaline: 4 },
      owned: { themes: ["marginalia", "foolscap"], avatars: ["🖋️", "📖", "🪶"] },
      settings: { sound: true, motion: "auto", difficulty: "hard", layerC: true, onboarded: true },
      freeText: { day: null, scored: {}, hashes: {} },
      drafts: [{ id: "d1", title: "Essay", body: "Words." }],
      manifest: { common: "1984", moduleA: ["donne", "wit"], moduleB: "henry4", moduleC: "craft" },
      poems: { donne: ["hs10"] }
    };
    const r = EN.importLegacy(old);
    const s = r.slot;
    t.eq([s.xp, s.level, s.coins, s.lifetimeXp], [5000, 7, 900, 5000], "level, XP and Marks kept");
    t.eq(s.texts["1984"], { seen: 20, correct: 15 }, "per-text mastery kept");
    t.eq(s.drafts.length, 1, "drafts kept");
    t.eq(s.manifest.moduleB, "henry4", "the chosen texts kept");
    t.eq(s.poems.donne, ["hs10"], "the Donne selection kept");
    t.eq(s.srs.q1.lapses, 1, "Vault boxes and lapses kept");
    t.eq([s.settings.difficulty, s.settings.layerC, s.settings.theme], ["hard", true, "eng-foolscap"], "subject settings mapped");
    t.eq(r.inventory, { fifty: 2, skip: 0, freeze: 2, double: 4 }, "power-ups renamed, starter pack not double-counted");
    t.eq(r.themes, ["eng-marginalia", "eng-foolscap"], "themes prefixed eng-");
    t.eq(r.avatars, ["🖋️", "📖", "🪶"], "avatars kept");
    t.eq(r.streak.longest, 11, "longest streak offered to the app");
    t.ok(!("inventory" in s) && !("owned" in s) && !("profile" in s), "shared fields are not written into the slot");
  }
};
