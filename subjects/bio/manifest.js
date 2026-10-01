/* Biology (Biosphere) — the StudyQuest manifest.
   Script order IS the dependency graph: util, content, state (the factory needs
   the level titles), the bound UI, engines, modes, screens. */
SQ.Subjects.manifest("bio", {
  css: ["subjects/bio/css/themes.css", "subjects/bio/css/bio.css"],
  scripts: [
    "subjects/bio/core/util.js",
    // content (data only)
    "subjects/bio/data/glossary.js",
    "subjects/bio/data/glossary-extra.js",
    "subjects/bio/data/mcq-m1.js",
    "subjects/bio/data/mcq-m2.js",
    "subjects/bio/data/mcq-m3.js",
    "subjects/bio/data/mcq-m4.js",
    "subjects/bio/data/mcq-m5.js",
    "subjects/bio/data/mcq-m6.js",
    "subjects/bio/data/mcq-m7.js",
    "subjects/bio/data/mcq-m8.js",
    "subjects/bio/data/mcq-extra.js",
    "subjects/bio/data/mcq-extra2.js",
    "subjects/bio/data/mcq-extra3.js",
    "subjects/bio/data/mcq-extra4.js",
    "subjects/bio/data/mcq-extra5.js",
    "subjects/bio/data/cards-y11.js",
    "subjects/bio/data/cards-y12.js",
    "subjects/bio/data/cards-extra.js",
    "subjects/bio/data/cards-extra2.js",
    "subjects/bio/data/short-y11.js",
    "subjects/bio/data/short-y12.js",
    "subjects/bio/data/short-extra.js",
    "subjects/bio/data/short-extra2.js",
    "subjects/bio/data/short-extra3.js",
    "subjects/bio/data/short-extra4.js",
    "subjects/bio/data/short-extra5.js",
    "subjects/bio/data/sequences.js",
    "subjects/bio/data/sorts.js",
    "subjects/bio/data/datasets.js",
    "subjects/bio/data/play-extra.js",
    "subjects/bio/data/gen-templates.js",
    "subjects/bio/data/diagrams/cells.js",
    "subjects/bio/data/diagrams/systems.js",
    "subjects/bio/data/diagrams/genetics.js",
    "subjects/bio/data/diagrams/ecology.js",
    "subjects/bio/data/diagrams/neuro.js",
    "subjects/bio/data/diagrams/extra.js",
    "subjects/bio/data/packs.js",
    "subjects/bio/data/achievements.js",
    "subjects/bio/data/shop.js",
    "subjects/bio/data/bosses.js",
    // core
    "subjects/bio/core/state.js",
    "subjects/bio/core/ui.js",
    "subjects/bio/core/genetics.js",
    "subjects/bio/core/mark.js",
    "subjects/bio/core/bank.js",
    "subjects/bio/core/coverage.js",
    "subjects/bio/core/diagram.js",
    "subjects/bio/core/tools.js",
    // modes
    "subjects/bio/modes/common.js",
    "subjects/bio/modes/rapidfire.js",
    "subjects/bio/modes/drill.js",
    "subjects/bio/modes/punnett.js",
    "subjects/bio/modes/termmatch.js",
    "subjects/bio/modes/labelit.js",
    "subjects/bio/modes/datadetective.js",
    "subjects/bio/modes/sortit.js",
    "subjects/bio/modes/pedigree.js",
    "subjects/bio/modes/processorder.js",
    "subjects/bio/modes/survival.js",
    "subjects/bio/modes/rehab.js",
    "subjects/bio/modes/response.js",
    "subjects/bio/modes/boss.js",
    "subjects/bio/modes/flashcards.js",
    // screens
    "subjects/bio/screens/home.js",
    "subjects/bio/screens/play.js",
    "subjects/bio/screens/study.js",
    "subjects/bio/screens/atlas.js",
    "subjects/bio/screens/reference.js",
    "subjects/bio/screens/progress.js",
    "subjects/bio/screens/options.js",
    "subjects/bio/screens/shop.js",
    "subjects/bio/screens/dev.js"
  ],

  boot: function () {
    BIO.UI.mountRoutes();
    // The shell built the navbar for #/s/bio before this subject was bound
    // (the loading screen), so rebuild it with Biology's items (CORE-REQUESTS #1).
    SQ.UI.buildNav();
    BIO.Tools.register();
  },

  /* Biosphere's save (biosphere.save.v1) → the StudyQuest slot. */
  importLegacy: function (old) {
    var S = BIO.State, U = BIO.U;
    var o = old && old.save ? old.save : (old || {});
    var xp = Math.max(0, Math.round(o.xp || 0));
    var level = 1, into = xp;
    while (level < S.MAX_LEVEL && into >= S.xpNeeded(level)) { into -= S.xpNeeded(level); level++; }
    if (level >= S.MAX_LEVEL) into = Math.min(into, S.xpNeeded(S.MAX_LEVEL));

    var srs = {};
    Object.keys(o.cards || {}).forEach(function (id) { srs[id] = S.convertCard(o.cards[id]); });

    var beaten = {}, best = {};
    Object.keys(o.bosses || {}).forEach(function (m) {
      var b = o.bosses[m] || {};
      if (b.cleared) beaten["b-" + m] = Date.now();
    });

    var themeMap = {};
    (BIO.DATA.shop.themes || []).forEach(function (t) { themeMap[t.legacy] = t.id; });
    var themes = ((o.owned && o.owned.themes) || []).map(function (t) { return themeMap[t]; }).filter(Boolean);
    var diff = { standard: "standard", hard: "hard", nightmare: "nightmare" }[o.difficulty] || "standard";

    var bests = Object.assign({}, o.bests || {});
    var stats = {
      answered: o.answered || 0, correct: o.correct || 0,
      punnettSolved: bests.punnettSolved || 0, pedigreeSolved: bests.pedigreeSolved || 0,
      survivalBest: bests.survival || 0, peakCoins: o.coins || 0,
      responsesMarked: Object.keys(o.shortLog || {}).length, timePlayed: Math.round((o.timeMs || 0) / 1000)
    };
    delete bests.punnettSolved; delete bests.pedigreeSolved;

    var slot = {
      xp: xp, level: level, xpIntoLevel: into, lifetimeXp: xp, coins: Math.max(0, Math.round(o.coins || 0)),
      prestige: 0, stats: stats,
      seen: o.seen || {}, missed: o.missed || {}, shortLog: o.shortLog || {}, genSeeds: o.genSeeds || {},
      diagramSeen: o.diagramSeen || {}, bests: bests, runs: o.runs || 0, timeMs: o.timeMs || 0,
      srs: srs, achievements: o.achievements || {}, bossesBeaten: beaten, bossBest: best,
      seenIntro: true, devUnlocked: !!o.devUnlocked,
      settings: {
        difficulty: diff, theme: themeMap[o.theme] && themes.indexOf(themeMap[o.theme]) >= 0 ? themeMap[o.theme] : null,
        hidden: Object.assign({}, o.coverage || {}),
        hintsInResponse: !(o.settings && o.settings.hintsInResponse === false)
      }
    };

    /* The loaded slot object is cached by SQ.Store, so writing a new object to
       save.subjects.bio would leave BIO.State.data stale until a reload
       (CORE-REQUESTS.md #2). When the current slot has no progress — the only
       case the importer replaces without asking — rebuild it IN PLACE and hand
       back the same object. */
    var cur = S.data;
    if (!((cur.lifetimeXp || cur.xp || 0) > 0)) {
      var fresh = U && SQ.U.deepMerge(SQ.U.clone(cur), slot);
      Object.keys(cur).forEach(function (k) { if (k !== "settings") delete cur[k]; });
      Object.keys(fresh).forEach(function (k) { if (k !== "settings") cur[k] = fresh[k]; });
      Object.keys(slot.settings).forEach(function (k) { cur.settings[k] = slot.settings[k]; });
      slot = cur;
    }

    var inv = {};
    var RENAME = { halve: "fifty", pass: "skip", coldstorage: "freeze", homeostasis: "shield",
                   fieldnote: "insight", catalyst: "double", adrenaline: "revive" };
    Object.keys(o.inventory || {}).forEach(function (k) {
      var id = RENAME[k] || k;
      inv[id] = (inv[id] || 0) + Math.max(0, Math.floor(o.inventory[k] || 0));
    });
    return {
      slot: slot, inventory: inv, themes: themes,
      avatars: (o.owned && o.owned.avatars) || [],
      profile: { avatar: o.avatar },
      streak: { longest: o.bestStreakDays || 0 }
    };
  }
});
