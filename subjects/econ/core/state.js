/* Economics — js/core/state.js (StudyQuest port)

   The stand-alone Equilibrium app kept its own save (fresh()/migrate(), a flat
   `seen / missed / cards / shortLog / genSeeds` ledger, level derived from xp).
   Here the slot lives inside the one StudyQuest save and the levelling, coins,
   prestige, difficulty, daily/weekly, Leitner cards, mistakes and achievements
   come from SQ.SubjectState. What is kept as Economics-only:

     seen       questionId -> {n, wrong, last}   (draw weighting, coverage, mastery)
     shortLog   shortId -> dayKey last paid     (§4.4 once-per-day payment)
     genSeeds   Calculation Lab seeds
     diagramSeen, bosses (legacy per-module clears)

   Slot mapping from the old save (see manifest.importLegacy):
     cards  -> srs          (box 0..4 -> 1..5, due ms -> dayKey, n -> reps)
     missed -> mistakes     ({id, mod, topic, misses, n, ts}; n = clean answers still owed)
     bests  -> scores       (calcSolved / shiftsSolved moved into stats)
     runs/answered/correct  -> stats
     coverage -> settings.hidden (via setTagHidden)
     xp (cumulative) -> level / xpIntoLevel
   Exposes: window.ECON.State */
(function (root) {
  "use strict";

  var ECON = root.ECON = root.ECON || {};
  var U = ECON.U;

  var S = SQ.SubjectState.create("econ", {
    defaults: function () {
      return {
        stats: {
          runs: 0, calcSolved: 0, shiftsSolved: 0, acc90Runs: 0, honestRuns: 0,
          responses: 0, labelled: 0, sorted: 0, sequences: 0, dataRead: 0, termsMatched: 0,
          bestRunXp: 0
        },
        seen: {}, shortLog: {}, genSeeds: {}, diagramSeen: {}, bosses: {},
        settings: { theme: "econ-ledger", hintsInResponse: true, refAck: false },
        devUnlocked: false
      };
    },
    startCoins: 0,
    levelTitles: (ECON.DATA && ECON.DATA.levelTitles) || [],
    xpCurve: function (n) { return Math.round(115 * Math.pow(n, 1.5)); },
    dailyModes: { rapidfire: 15, drill: 12, calculate: 5, shiftit: 4, termmatch: 6,
                  labelit: 4, flashcards: 15, survival: 8, datadetective: 3, sortit: 10 },
    dailyReward: { coins: 150, xp: 160 },
    questPool: [
      { id: "q_answer",  stat: "answered",      target: 150, xp: 600, coins: 260, icon: "📝", name: "Busy week",          desc: "Answer 150 Economics questions" },
      { id: "q_correct", stat: "correct",       target: 100, xp: 650, coins: 280, icon: "🎯", name: "In the black",       desc: "Get 100 answers right" },
      { id: "q_calc",    stat: "calcSolved",    target: 25,  xp: 600, coins: 260, icon: "🧮", name: "Number cruncher",    desc: "Solve 25 Calculation Lab questions" },
      { id: "q_shift",   stat: "shiftsSolved",  target: 12,  xp: 560, coins: 240, icon: "📈", name: "Comparative statics", desc: "Diagnose 12 market shocks fully" },
      { id: "q_cards",   stat: "cardsReviewed", target: 80,  xp: 520, coins: 220, icon: "🃏", name: "Spaced out",         desc: "Review 80 flashcards" },
      { id: "q_boss",    stat: "bossWins",      target: 1,   xp: 700, coins: 300, icon: "⚔️", name: "Market correction",  desc: "Defeat an Economics boss" },
      { id: "q_resp",    stat: "responses",     target: 5,   xp: 560, coins: 240, icon: "✍️", name: "Extended response",  desc: "Complete 5 paid Response Builder answers" },
      { id: "q_runs",    stat: "runs",          target: 12,  xp: 500, coins: 220, icon: "🏃", name: "Steady growth",      desc: "Finish 12 runs" },
      { id: "q_perfect", stat: "perfectRuns",   target: 2,   xp: 640, coins: 280, icon: "✨", name: "Balanced budget",    desc: "Finish 2 perfect runs of 5+ questions" },
      { id: "q_diagram", stat: "labelled",      target: 10,  xp: 520, coins: 220, icon: "🔬", name: "Draw the diagram",   desc: "Answer 10 Label It items correctly" },
      { id: "q_seen",    stat: "seenCount",     target: 40,  xp: 540, coins: 240, icon: "📚", name: "Broaden the base",   desc: "See 40 new multiple-choice questions" }
    ],
    achievements: function () { return (ECON.DATA && ECON.DATA.achievements) || []; },
    achievementStats: function (d, base) { return ECON.Achievements ? ECON.Achievements.stats(d, base) : base; },
    cards: function () { return ECON.Bank ? ECON.Bank.all("card") : []; },
    statFor: function (k, d) {
      if (k === "seenCount") return Object.keys(d.seen || {}).length;
      return undefined;
    },
    migrate: function (d) {
      d.stats = d.stats || {};
      if (!Array.isArray(d.mistakes)) d.mistakes = [];
    }
  });

  /* ── economy constants (brief §9) — unchanged from the stand-alone app ── */
  S.BUILD            = "studyquest";
  S.XP_PER_CORRECT   = 10;      // × difficulty × streak multiplier
  S.LEVEL_CAP        = S.MAX_LEVEL;
  S.COIN_RATE        = 0.75;    // currency = run XP × 0.75 (bound UI coinRate)
  S.MIN_READ_MS      = 1200;    // floor; MCQ uses UI.readFloor(stem) which is ≥ this
  S.MIN_ACC_BONUS    = 0.50;    // completion bonus withheld below this
  S.SHORT_MIN_CHARS  = 20;      // §4.4
  S.MAX_MULTIPLIER   = SQ.Economy.MAX_MULTIPLIER;

  /* Streak multiplier: ×1 → ×3 in half steps every 5 correct. */
  S.streakMult = function (streak) {
    return Math.min(3, 1 + Math.floor(streak / 5) * 0.5);
  };

  /* The multiplier award() will apply: difficulty × prestige × Double XP, capped. */
  S.runMultiplier = function (boostActive) {
    var m = S.xpMultiplier() * (boostActive ? 2 : 1);
    return Math.max(1, Math.min(S.MAX_MULTIPLIER, m));
  };

  /* Level, xp into it and xp needed — what the old code read off levelFromXp(). */
  S.levelInfo = function () {
    var d = S.data;
    var need = d.level >= S.MAX_LEVEL ? 0 : S.xpNeeded(d.level);
    return { level: d.level, into: d.xpIntoLevel, need: need };
  };

  /* ── question history ────────────────────────────────────────────────
     `seen` is Economics' own ledger (draw weighting, mastery). The mistake
     pool is the shared `mistakes` array, with Economics' rule kept: a miss is
     retired by as many clean answers as it has misses outstanding. */
  function modOf(id) {
    var m = /^([ph]\d)/i.exec(String(id || ""));
    return m ? m[1].toUpperCase() : null;
  }
  function mistake(id) {
    var list = S.data.mistakes;
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return i;
    return -1;
  }

  S.markSeen = function (id, correct, mod, topic) {
    if (!mod && ECON.Bank) { var q = ECON.Bank.byId("mcq", id); if (q) { mod = q.mod; topic = topic || q.topic; } }
    mod = mod || modOf(id);
    var s = S.data.seen[id] || (S.data.seen[id] = { n: 0, wrong: 0, last: 0 });
    s.n++; s.last = Date.now();
    S.recordAnswer(mod, !!correct, null, topic || null);
    var i = mistake(id);
    if (!correct) {
      s.wrong++;
      if (i >= 0) { S.data.mistakes[i].misses++; S.data.mistakes[i].n++; S.data.mistakes[i].ts = Date.now(); }
      else {
        S.data.mistakes.unshift({ id: id, mod: mod, topic: topic || null, misses: 1, n: 1, ts: Date.now() });
        if (S.data.mistakes.length > 150) S.data.mistakes.pop();
      }
    } else if (i >= 0) {
      var m = S.data.mistakes[i];
      m.n = (m.n || 1) - 1;
      if (m.n <= 0) { S.data.mistakes.splice(i, 1); S.bump("mistakesFixed"); }
    }
    S.save();
  };

  /* Shift It: a wrong diagnosis goes in the pool too (the stand-alone app
     called this without defining it, so a wrong answer threw). */
  S.markMissed = function (id, mod) {
    var i = mistake(id);
    if (i >= 0) { S.data.mistakes[i].misses++; S.data.mistakes[i].n++; S.data.mistakes[i].ts = Date.now(); }
    else S.data.mistakes.unshift({ id: id, mod: mod || modOf(id), topic: null, misses: 1, n: 1, ts: Date.now() });
    S.save();
  };

  /* A graded answer from a non-MCQ mode: stats, mastery axis, weekly quests. */
  S.tally = function (mod, ok, topic) { S.recordAnswer(mod || null, !!ok, null, topic || null); };

  S.missedIds = function () { return S.data.mistakes.map(function (m) { return m.id; }); };
  S.isMissed = function (id) { return mistake(id) >= 0; };
  S.missedN = function (id) { var i = mistake(id); return i >= 0 ? (S.data.mistakes[i].n || 1) : 0; };

  /* ── spaced repetition: the shared Leitner (graded) ─────────────────── */
  S.GRADES = ["again", "hard", "good", "easy"];
  /** Ids from `ids` that are due now (the old dueCards(ids) contract). */
  S.dueIds = function (ids) {
    var today = U.dayKey();
    return ids.filter(function (id) {
      var c = S.data.srs[id];
      return !c || U.daysBetween(c.due, today) >= 0;
    });
  };
  S.cardStarted = function (id) { return !!S.data.srs[id]; };

  /* ── short-answer daily payment ledger (§4.4) ────────────────────── */
  S.shortPaidToday = function (id) { return S.data.shortLog[id] === U.dayKey(); };
  S.markShortPaid  = function (id) { S.data.shortLog[id] = U.dayKey(); S.save(); };

  /* ── achievements / coverage / inventory helpers ─────────────────── */
  S.has = function (id) { return !!S.data.achievements[id]; };
  S.isHidden = S.tagHidden;
  S.setHidden = S.setTagHidden;
  S.powerupCount = function (id) { return (SQ.Store.data.inventory && SQ.Store.data.inventory[id]) || 0; };

  /* ── per-topic mastery (Economics' definition) ───────────────────────
     Coverage of the topic × accuracy on it, measured against Bank.all() so it
     cannot be bought and does not move when a coverage pack hides content. */
  S.mastery = function (modId) {
    var seen = 0, correct = 0, total = 0;
    var d = S.data.seen;
    var bank = ECON.Bank ? ECON.Bank.all("mcq") : [];
    for (var i = 0; i < bank.length; i++) {
      var q = bank[i];
      if (q.mod !== modId) continue;
      total++;
      var rec = d[q.id];
      if (!rec) continue;
      seen++;
      if ((rec.n || 0) > (rec.wrong || 0)) correct++;
    }
    if (!total) return 0;
    var coverage = seen / total;
    var accuracy = seen ? correct / seen : 0;
    return Math.round(coverage * accuracy * 100);
  };

  ECON.State = S;
})(typeof window !== "undefined" ? window : globalThis);
