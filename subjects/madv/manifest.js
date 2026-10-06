/* Maths Advanced + Extension 1 (MathQuest) — the subject manifest.

   Scripts are listed in dependency order (the order IS the dependency graph,
   exactly as it was in the stand-alone app's index.html), minus what the app
   now owns: the router/header/modals (js/sq/ui.js), the save file
   (js/sq/store.js), the toolbelt + calculator (SQ.Tools), the arcade, the
   service worker and app.js. */
(function () {
  const B = "subjects/madv/";
  const js = f => B + f;

  SQ.Subjects.manifest("madv", {
    css: [B + "css/themes.css", B + "css/madv.css"],
    scripts: [
      /* the engine — content-bearing, kept as MathQuest wrote it */
      "core/util.js", "core/expr.js", "core/draw.js", "core/audio.js", "core/fx.js",
      /* the live Advanced / Extension 1 toggle, then what State needs at load */
      "data/tiers.js", "data/shop.js",
      "core/state.js", "core/bank.js", "core/ui.js",
      /* Advanced banks */
      "data/questions-ma-functions.js", "data/questions-ma-trig.js", "data/questions-ma-calculus.js",
      "data/questions-ma-integration.js", "data/questions-ma-financial.js",
      "data/questions-ma-statistics.js", "data/questions-ma-mixed.js",
      /* Extension 1 banks (always loaded now; the toggle filters them live) */
      "data/questions-me-functions.js", "data/questions-me-trig.js", "data/questions-me-calculus.js",
      "data/questions-me-discrete.js", "data/questions-me-vectors.js",
      /* the rest of the content */
      "data/generators.js", "data/flashcards.js", "data/proofs.js", "data/reference.js",
      "data/formulas.js", "data/achievements.js",
      /* modes */
      "games/quiz.js", "games/equiv.js", "games/match.js", "games/curve.js", "games/crunch.js",
      "games/panic.js", "games/lab.js", "games/proof.js", "games/vector.js", "games/survival.js",
      "games/boss.js",
      /* screens */
      "screens/home.js", "screens/play.js", "screens/study.js", "screens/reference.js",
      "screens/progress.js", "screens/shop.js", "screens/misc.js"
    ].map(js),

    boot() {
      const UI = MA.UI, Sc = MA.Screens;

      UI.route("home",         view => Sc.home(view));
      UI.route("play",         view => Sc.play.screen(view));
      UI.route("game",   (view, args) => Sc.play.dispatch(view, args));
      UI.route("study",  (view, args) => Sc.study.screen(view, args));
      UI.route("reference", (view, args) => Sc.reference(view, args));
      UI.route("formulas",     view => Sc.formulas(view));
      UI.route("progress",     view => Sc.progress(view));
      UI.route("achievements", view => Sc.achievements(view));
      UI.route("shop",         view => Sc.shop(view));
      UI.route("options",      view => Sc.options(view));

      registerSheet();
      /* Keep the tray's sheet in step with the live Extension 1 toggle. */
      MA.State.onChange(registerSheet);
      MA.State.daily();
      MA.State.weekly();
    },

    importLegacy
  });

  /* ── the formula sheet, for the shared tool tray ─────────────
     Sections are js/data/formulas.js's groups. `free` is the NESA flag: ✅
     printed on the exam reference sheet → free mid-run; 🧠 memorise → costs
     the run when revealed. Built from the formulas of the tiers the student
     studies, and re-registered whenever the Extension 1 toggle changes. */
  let sheetKey = null;
  function registerSheet() {
    const key = MA.DATA.tierKey();
    if (key === sheetKey) return;
    sheetKey = key;
    const all = MA.Formulas.all();
    SQ.Tools.registerSheet("madv", {
      title: "Mathematics Advanced / Extension 1 reference sheet",
      render: tex => MA.U.math(tex),
      sections: MA.DATA.formulaGroups.map(g => ({
        id: g.id, title: g.icon + " " + g.name,
        items: all.filter(f => f.g === g.id).map(f => ({
          id: f.id, name: f.name, body: f.tex, note: f.hint || "",
          free: f.nesa === true, tier: f.tier
        }))
      })).filter(sec => sec.items.length)
    });
  }

  /* ── the stand-alone MathQuest save → this slot ──────────────
     old: localStorage "mathquest.save.v1" (js/core/state.js in the old repo). */
  function importLegacy(old) {
    if (!old || typeof old !== "object") return null;
    const copy = o => JSON.parse(JSON.stringify(o || {}));
    const topics = copy(old.topics);
    const settings = old.settings || {};
    const slot = {
      xp: old.xp || 0, level: old.level || 1, xpIntoLevel: old.xpIntoLevel || 0,
      coins: old.coins === undefined ? 100 : old.coins, prestige: old.prestige || 0,
      lifetimeXp: old.lifetimeXp || old.xp || 0,
      stats: copy(old.stats),
      topics, modules: copy(topics),
      modesPlayed: copy(old.modesPlayed), proofsSolved: copy(old.proofsSolved),
      bossesBeaten: copy(old.bossesBeaten),
      srs: copy(old.srs), mistakes: (old.mistakes || []).map(m => Object.assign({ mod: m.topic }, m)),
      bookmarks: (old.bookmarks || []).slice(), achievements: copy(old.achievements),
      history: copy(old.history), scores: copy(old.scores),
      settings: { difficulty: ["standard", "hard", "nightmare"].indexOf(settings.difficulty) >= 0 ? settings.difficulty : "standard",
                  theme: null, hidden: {} },
      daily: copy(old.daily), weekly: copy(old.weekly)
    };
    /* The old save's ten themes are the app's general themes now, under new ids. */
    const LT = (window.MA && MA.DATA && MA.DATA.LEGACY_THEMES) || { graph: "midnight", golden: "golden", paper: "paper",
      complex: "ocean", euler: "ember", chalk: "chalk", imaginary: "neon", montecarlo: "aurora", manifold: "mono", radian: "lime" };
    const owned = old.owned || {};
    const themes = (owned.themes || []).map(t => LT[t]).filter(Boolean);
    const inv = {};
    const RENAME = { boost: "double", adrenaline: "revive", pass: "skip" };
    Object.keys(old.inventory || {}).forEach(k => {
      const id = RENAME[k] || k;
      inv[id] = (inv[id] || 0) + (old.inventory[k] || 0);
    });
    const profile = old.profile ? {
      name: old.profile.name, avatar: old.profile.avatar,
      theme: LT[old.profile.theme] || undefined
    } : undefined;
    return { slot, inventory: inv, themes, avatars: (owned.avatars || []).slice(), profile };
  }
  /* Exposed for tests/subjects/madv/validate.js. */
  window.MA_IMPORT_LEGACY = importLegacy;
})();

/* Dev presets (listed by the app's dev menu). Defined lazily: MA exists only
   after the subject's scripts run. */
window.MA = window.MA || {};
MA.devActions = [
  { label: "Maths Adv: +5,000 Primes", run() { MA.State.addCoins(5000); } },
  { label: "Maths Adv: jump to level 30", run() { const d = MA.State.data; d.level = 30; d.xpIntoLevel = 0; MA.State.emit(); } },
  { label: "Maths Adv: jump to level 60 (Ascension)", run() { const d = MA.State.data; d.level = 60; d.xpIntoLevel = 0; MA.State.emit(); } },
  { label: "Maths Adv: beat every boss", run() { MA.Games.boss.BOSSES.forEach(b => (MA.State.data.bossesBeaten[b.id] = Date.now())); MA.State.emit(); } },
  { label: "Maths Adv: make every card due", run() { MA.State.data.srs = {}; MA.State.emit(); } },
];
