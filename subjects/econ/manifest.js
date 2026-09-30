/* Economics (Equilibrium) — the subject manifest.
   Scripts in dependency order: util → data → state → ui → engines → modes → screens. */
(function () {
  var B = "subjects/econ/";
  var scripts = [
    "core/util.js",
    "data/glossary.js", "data/mcq-y11.js", "data/mcq-y11-b.js", "data/mcq-y12.js", "data/mcq-y12-b.js",
    "data/mcq-extra.js", "data/cards.js", "data/short.js", "data/play.js", "data/calc-templates.js",
    "data/shifts.js", "data/diagrams/market.js", "data/diagrams/macro.js", "data/packs.js",
    "data/achievements.js", "data/shop.js",
    "core/state.js", "core/ui.js", "core/econcalc.js", "core/mark.js",
    "core/bank.js", "core/coverage.js", "core/diagram.js",
    "modes/common.js", "modes/rapidfire.js", "modes/drill.js", "modes/calculate.js", "modes/termmatch.js",
    "modes/labelit.js", "modes/datadetective.js", "modes/sortit.js", "modes/shiftit.js",
    "modes/processorder.js", "modes/survival.js", "modes/rehab.js", "modes/response.js",
    "modes/boss.js", "modes/flashcards.js",
    "screens/home.js", "screens/study.js", "screens/atlas.js", "screens/reference.js",
    "screens/progress.js", "screens/options.js", "screens/shop.js", "screens/dev.js"
  ].map(function (p) { return B + p; });

  var POWERUP_RENAME = { multiplier: "double", buffer: "shield", research: "insight", extension: "freeze",
                         narrow: "fifty", pass: "skip", adrenaline: "revive" };
  var BOSS_GROUPS = { hand: ["P1", "P2"], shock: ["P3", "P4"], deficit: ["P5", "P6"], current: ["H1", "H2"], rba: ["H3", "H4"] };

  function dayKey(t) {
    var d = new Date(t === undefined ? Date.now() : t);
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }
  function modOf(id) { var m = /^([ph]\d)/i.exec(String(id || "")); return m ? m[1].toUpperCase() : null; }
  function cost(n) { return Math.round(115 * Math.pow(n, 1.5)); }

  /** Map the stand-alone Equilibrium save (equilibrium.save.v1) onto the new slot. */
  function importLegacy(raw) {
    var old = raw && raw.save ? raw.save : raw;
    if (!old || typeof old !== "object") return null;
    var xp = Math.max(0, Math.round(old.xp || 0));
    var lv = 1, acc = 0;
    while (lv < 60 && xp >= acc + cost(lv)) { acc += cost(lv); lv++; }
    var bests = old.bests || {};
    var scores = {};
    Object.keys(bests).forEach(function (k) { if (k !== "calcSolved" && k !== "shiftsSolved") scores[k] = bests[k]; });

    var srs = {};
    Object.keys(old.cards || {}).forEach(function (id) {
      var c = old.cards[id] || {};
      srs[id] = { box: Math.min(5, Math.max(1, (c.box || 0) + 1)), due: dayKey(c.due || Date.now()),
                  reps: c.n || 0, lapses: c.lapses || 0, last: c.last ? dayKey(c.last) : undefined };
    });
    var mistakes = Object.keys(old.missed || {}).map(function (id) {
      var m = old.missed[id] || {};
      return { id: id, mod: modOf(id), topic: null, misses: m.n || 1, n: m.n || 1, ts: m.last || Date.now() };
    });
    var beaten = {};
    var ob = old.bosses || {};
    Object.keys(BOSS_GROUPS).forEach(function (b) {
      if (BOSS_GROUPS[b].every(function (m) { return ob[m] && ob[m].cleared; })) beaten[b] = Date.now();
    });
    var inv = {};
    Object.keys(old.inventory || {}).forEach(function (k) {
      var id = POWERUP_RENAME[k] || k;
      inv[id] = (inv[id] || 0) + (old.inventory[k] || 0);
    });
    var theme = old.theme ? "econ-" + old.theme : "econ-ledger";
    return {
      slot: {
        xp: xp, level: lv, xpIntoLevel: lv >= 60 ? 0 : xp - acc, lifetimeXp: xp,
        coins: Math.max(0, Math.round(old.coins || 0)), prestige: 0,
        stats: { runs: old.runs || 0, answered: old.answered || 0, correct: old.correct || 0,
                 calcSolved: bests.calcSolved || 0, shiftsSolved: bests.shiftsSolved || 0,
                 timePlayed: Math.round((old.timeMs || 0) / 1000) },
        scores: scores, seen: old.seen || {}, mistakes: mistakes, srs: srs,
        shortLog: old.shortLog || {}, genSeeds: old.genSeeds || {}, diagramSeen: old.diagramSeen || {},
        bosses: ob, bossesBeaten: beaten, achievements: old.achievements || {},
        settings: {
          difficulty: ["standard", "hard", "nightmare"].indexOf(old.difficulty) >= 0 ? old.difficulty : "standard",
          hidden: old.coverage || {}, theme: theme,
          hintsInResponse: !old.settings || old.settings.hintsInResponse !== false
        }
      },
      inventory: inv,
      themes: ((old.owned && old.owned.themes) || []).map(function (t) { return "econ-" + t; }),
      avatars: (old.owned && old.owned.avatars) || [],
      profile: old.avatar ? { avatar: old.avatar } : undefined
    };
  }

  function boot() {
    var ECON = window.ECON, U = ECON.U;
    /* The glossary is the reference. HSC Economics supplies no data sheet, so
       every entry is free:false: revealing one mid-run costs 10% (latched,
       capped at 30%). Term Match and Label It withhold the sheet entirely. */
    var slug = function (s) { return U.norm(s).replace(/[^a-z0-9]+/g, "-"); };
    SQ.Tools.registerSheet("econ", {
      title: "Economics glossary",
      constants: [],
      sections: U.MODULES.map(function (m) {
        return {
          id: m.id, title: m.id + " — " + m.name,
          items: (ECON.DATA.glossary || []).filter(function (g) { return g.mod === m.id; }).map(function (g) {
            return { id: "g-" + slug(g.term), name: g.term, body: U.esc(g.def), free: false, note: "Not on the exam paper" };
          })
        };
      }).filter(function (s) { return s.items.length; })
    });
    /* The default Economics look is free and owned from the start. */
    var owned = SQ.Store.data.owned.themes;
    if (owned.indexOf("econ-ledger") < 0) { owned.push("econ-ledger"); SQ.Store.save(); }
    ECON.Bank.invalidate();
  }

  SQ.Subjects.manifest("econ", {
    css: [B + "css/themes.css", B + "css/econ.css"],
    scripts: scripts,
    boot: boot,
    importLegacy: importLegacy
  });
})();
