/* Physics state — a slot in the one StudyQuest save, built by SQ.SubjectState.

   The stand-alone Newton's Notebook kept its own save (newtonsnotebook.save.v1);
   the economy numbers here are that app's tuned values, carried across verbatim:
   the 115·n^1.5 level curve, 100 starting Joules, the daily targets and the
   thirteen weekly quests.

   What changed in the port:
     · difficulties are the shared four (Gentle 0.85, Standard 1, Hard 1.45,
       Nightmare 2.1). The stand-alone app had Hard ×1.25 and Nightmare ×1.55; its
       timer scale and "maxDiff" draw cap are kept as extra fields on each entry
       (`timer` mirrors the shared `time`, `maxDiff` caps Gentle at ★★).
     · profile, power-ups, the day streak and owned cosmetics are app-wide now.
     · flashcards are graded (again/hard/good/easy) with leeches at four lapses.
     · Year 11 / per-module coverage toggles (settings.hidden) — they filter the
       draw only and never change a payout. */
window.PHYS = window.PHYS || {};

(function () {
  const U = PHYS.U;

  const LEVEL_TITLES = [
    "Apprentice", "Note Taker", "Graph Reader", "Vector Cadet", "Free-Body Sketcher",
    "Kinematicist", "Momentum Keeper", "Energy Accountant", "Wave Watcher", "Ray Tracer",
    "Circuit Wirer", "Ohm's Apprentice", "Field Mapper", "Projectile Plotter", "Orbit Setter",
    "Kepler's Clerk", "Torque Turner", "Flux Finder", "Lenz's Deputy", "Induction Engineer",
    "Transformer Tech", "Spectrum Splitter", "Photon Counter", "Quantum Cadet", "Relativist",
    "Lorentz Adept", "Mass–Energy Broker", "Bohr's Understudy", "Nucleon Wrangler", "Isotope Sorter",
    "Decay Analyst", "Fission Foreman", "Fusion Fitter", "Standard Modeller", "Quark Herder",
    "Neutrino Netter", "Stellar Cartographer", "Hertzsprung Reader", "Doppler Diagnostician", "Redshift Reader",
    "Gravity Surveyor", "Escape Artist", "Geostationary Engineer", "Slingshot Strategist", "Tensor Trainee",
    "Interferometer Operator", "Diffraction Draughtsman", "Polarisation Purist", "Blackbody Curator", "Wien's Warden",
    "Stefan's Steward", "Michelson's Match", "Einstein's Correspondent", "Simultaneity Sceptic", "Twin Paradoxer",
    "Band 6 Candidate", "Exam Room Veteran", "Notebook Master", "Laureate", "Newton's Equal"
  ];

  /* The shared difficulties, with the two fields Physics' modes read. */
  const DIFFICULTIES = SQ.SubjectState.DIFFICULTIES.map(d => Object.assign({}, d, {
    timer: d.time, maxDiff: d.id === "gentle" ? 2 : 3
  }));

  const QUEST_POOL = [
    { id:"q_answer",  stat:"answered",       target:180, xp:1400, coins:700, icon:"📝",
      name:"Grind it out",       desc:"Answer 180 questions" },
    { id:"q_correct", stat:"correct",        target:120, xp:1600, coins:800, icon:"🎯",
      name:"On target",          desc:"Get 120 questions right" },
    { id:"q_calc",    stat:"calcsCorrect",   target:45,  xp:1400, coins:700, icon:"🔢",
      name:"Number crunch",      desc:"Solve 45 calculations" },
    { id:"q_fbd",     stat:"fbdSolved",      target:24,  xp:1300, coins:650, icon:"🧲",
      name:"Forces in balance",  desc:"Build 24 correct free-body diagrams" },
    { id:"q_chain",   stat:"chainsSolved",   target:12,  xp:1400, coins:700, icon:"🔗",
      name:"Derivation sprint",  desc:"Complete 12 derivation chains" },
    { id:"q_graph",   stat:"graphsRead",     target:40,  xp:1300, coins:650, icon:"📈",
      name:"Read the gradient",  desc:"Match 40 motion graphs" },
    { id:"q_bench",   stat:"benchesSolved",  target:10,  xp:1500, coins:750, icon:"🔌",
      name:"Bench week",         desc:"Finish 10 circuit benches" },
    { id:"q_units",   stat:"unitCells",      target:120, xp:1200, coins:600, icon:"📐",
      name:"Dimensional sweep",  desc:"Fill 120 unit-grid cells correctly" },
    { id:"q_formula", stat:"formulaMatched", target:60,  xp:1100, coins:550, icon:"🧩",
      name:"Formula sweep",      desc:"Match 60 formula triples" },
    { id:"q_boss",    stat:"bossWins",       target:3,   xp:2200, coins:1100, icon:"⚔️",
      name:"Boss hunter",        desc:"Defeat 3 Exam Bosses" },
    { id:"q_perfect", stat:"perfectRuns",    target:5,   xp:2000, coins:1000, icon:"✨",
      name:"Flawless five",      desc:"Finish 5 perfect runs" },
    { id:"q_cards",   stat:"cardsMastered",  target:20,  xp:1500, coins:750, icon:"🃏",
      name:"Deck builder",       desc:"Have 20 flashcards mastered" },
    { id:"q_survive", stat:"survivalBest",   target:25,  xp:1800, coins:900, icon:"💀",
      name:"Last stand",         desc:"Reach a 25-question Survival run" }
  ];

  const DAILY_TARGETS = { rapid: 14, drill: 12, fbd: 4, formula: 1, graph: 8, calc: 8,
                          unitgrid: 1, bench: 3, chain: 3 };

  const physThemesOwned = () => SQ.Store.data.owned.themes.filter(t => /^phys-/.test(t)).length;

  const S = SQ.SubjectState.create("phys", {
    startCoins: 100,
    levelTitles: LEVEL_TITLES,
    xpCurve: level => Math.round(115 * Math.pow(level, 1.5)),
    difficulties: DIFFICULTIES,
    dailyModes: DAILY_TARGETS,
    dailyReward: { coins: 120, xp: 150 },
    questPool: QUEST_POOL,
    defaults: () => ({
      stats: {
        answered: 0, correct: 0, bestStreak: 0, perfectRuns: 0,
        calcsCorrect: 0, fbdSolved: 0, formulaMatched: 0, graphsRead: 0,
        unitCells: 0, benchesSolved: 0, chainsSolved: 0, derivationSteps: 0,
        bossWins: 0, flawlessBoss: 0, clutchWins: 0, perfectUnitGrid: 0,
        mistakesFixed: 0, peakCoins: 100, timePlayed: 0, survivalBest: 0,
        hardWins: 0, nightmareWins: 0, cardsMastered: 0, questsDone: 0,
        sigFigStreak: 0, sigFigChecked: 0, dualRouteSeen: 0
      },
      chainsSolvedIds: {},
      settings: { sigfig: false }
    }),
    achievements: () => PHYS.DATA.achievements,
    achievementStats: (data, base) => Object.assign(base, {
      chainsSolvedUnique: Object.keys(data.chainsSolvedIds || {}).length,
      /* Only Physics' own themes count towards "own five themes", the same set
         the stand-alone shop sold (Graphite is free and counts, as it did). */
      themesOwned: physThemesOwned(),
      nightOwl: !!SQ.Store.data.stats.nightOwl,
      earlyBird: !!SQ.Store.data.stats.earlyBird
    }),
    cards: () => PHYS.Bank.cards(),
    migrate: data => {
      for (const k of Object.keys(data.modules || {})) {
        const m = data.modules[k];
        if (m && !m.topics) m.topics = {};
      }
      /* Graphite was the stand-alone app's default, owned from the start. */
      const owned = SQ.Store.data.owned.themes;
      if (owned.indexOf("phys-graphite") < 0) owned.push("phys-graphite");
    }
  });

  const base = {
    recordAnswer: S.recordAnswer, reviewCard: S.reviewCard, dueCards: S.dueCards
  };
  const data = () => S.data;

  /** recordAnswer keeps Physics' per-module topic ledger (the adaptive draw and
      "Worth a look" read `modules[mod].topics`) on top of the shared record. */
  function recordAnswer(mod, ok, qid, topic, meta) {
    base.recordAnswer(mod, ok, qid, topic, meta);
    if (mod && topic) {
      const m = data().modules[mod];
      if (m) {
        m.topics = m.topics || {};
        const t = m.topics[topic] || (m.topics[topic] = { seen: 0, correct: 0 });
        t.seen++;
        if (ok) t.correct++;
      }
    }
  }

  /* A generated question has no permanent id worth storing (its seed will never
     come round again), so Mistake Rehab remembers the TEMPLATE and the
     misconception instead — which is the thing actually worth re-testing. */
  function recordGenMistake(template, mod, topic, misconception) {
    const d = data();
    const id = "gen:" + template;
    const idx = d.mistakes.findIndex(x => x.id === id);
    if (idx >= 0) {
      d.mistakes[idx].misses++;
      d.mistakes[idx].ts = Date.now();
      if (misconception) d.mistakes[idx].why = misconception;
    } else {
      d.mistakes.unshift({ id, template, mod, topic, why: misconception,
                           misses: 1, ts: Date.now(), gen: true });
      if (d.mistakes.length > 150) d.mistakes.pop();
    }
    S.save();
  }
  function clearGenMistake(template) {
    const d = data();
    const idx = d.mistakes.findIndex(x => x.id === "gen:" + template);
    if (idx >= 0) { d.mistakes.splice(idx, 1); d.stats.mistakesFixed++; S.save(); }
  }

  /** Topics with the worst accuracy, for "Worth a look". → [{ mod, topic, acc, seen }] */
  function weakTopics(n) {
    const out = [];
    for (const [mod, m] of Object.entries(data().modules)) {
      if (PHYS.Bank && !PHYS.Bank.covered(mod)) continue;
      for (const [topic, t] of Object.entries((m && m.topics) || {})) {
        if (t.seen >= 4) out.push({ mod, topic, acc: t.correct / t.seen, seen: t.seen });
      }
    }
    return out.sort((a, b) => a.acc - b.acc).slice(0, n || 3);
  }

  function reviewCard(id, grade) {
    const r = base.reviewCard(id, grade);
    data().stats.cardsMastered = S.cardsMastered();
    return r;
  }

  /** Due cards, inside the student's coverage unless a filter says otherwise. */
  function dueCards(filter) {
    return base.dueCards(c => PHYS.Bank.covered(c.mod) && (!filter || filter(c)));
  }

  Object.assign(S, {
    LEVEL_TITLES, DAILY_MODES: Object.keys(DAILY_TARGETS),
    recordAnswer, recordGenMistake, clearGenMistake, weakTopics, reviewCard, dueCards,
    sigFigOn: () => !!data().settings.sigfig,
    setSigFig: v => { data().settings.sigfig = !!v; S.emit(); }
  });

  PHYS.State = S;
})();
