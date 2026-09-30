/* ============================================================================
   state.js — Maths Standard's save, rebuilt on SQ.SubjectState.create.

   The stand-alone NumberCrunch had its own State (fresh()/hydrate(), fields
   q{}, topics{code:{seen,right}}, modes{}, cards{}, pow{}, themes[], ach{} …).
   Here the slot is the shared Chemistry-lineage shape, and this file maps the
   NumberCrunch vocabulary onto it:

     NumberCrunch                StudyQuest slot / store
     ─────────────────────────   ─────────────────────────────────────────
     topics[code]{seen,right}  → modules[code]{seen,correct} (+ topics mirror)
     q[id]{s,r,w,lw}           → q[id]  (kept: Mistake Rehab + adaptive draw)
     modes[k]{plays,best}      → modesPlayed[k], scores[k]
     cards[id]{box,due,paid}   → srs[id]{box,due,reps,lapses,xpDay}
     pow{…}                    → SQ.Store inventory (buffer→shield, boost→double)
     themes[] / avatars[]      → the global wardrobe (mstd-<name> themes)
     ach{}                     → achievements{}
     bosses{}                  → bossesBeaten{}
     ascensions                → prestige
     difficulty                → settings.difficulty (now four tiers, + Gentle)
     qtier                     → qtier (subject setting, on the `options` route)
     hi{}, ticket{}            → gone (the arcade is the app's)

   Names that collide with the core API but meant something else in
   NumberCrunch were renamed at their call sites:
     recordAnswer(id,right,topic,ms) → answer(...)
     mastery(code) 0‥1               → masteryFrac(code)   (core mastery is 0‥100)
     masteryTier(m) {nm,cls,ic}      → tierOf(m)
     dueCards(ids)                   → dueIds(ids)
   Namespace: window.MS.State
   ========================================================================== */
window.MS = window.MS || {};
(function () {
  'use strict';
  var MS = window.MS, U = MS.U;

  var TITLES = [
    'Enrolled', 'Pencil Case', 'Rounding Up', 'Unit Aware', 'Substituter',
    'Formula Reader', 'Timetable Literate', 'Payslip Reader', 'Gross Earner', 'Net Earner',
    'Budget Keeper', 'GST Inclusive', 'Tally Marker', 'Frequency Filler', 'Mean Spirited',
    'Median Finder', 'Quartile Cutter', 'Box Plotter', 'Outlier Spotter', 'Data Analyst',
    'Sample Spacer', 'Tree Diagrammer', 'Complement Taker', 'Odds Reader', 'Expected Value',
    'Simple Interest', 'Compounder', 'Appreciator', 'Straight-Liner', 'Declining Balance',
    'Dividend Collector', 'Inflation Adjusted', 'Table Reader', 'Present Value', 'Future Value',
    'Annuitant', 'Superannuated', 'Amortiser', 'Refinancer', 'Debt Free',
    'Right Triangle', 'Sine Ruler', 'Cosine Ruler', 'Area Ruler', 'Bearing Taker',
    'Radial Surveyor', 'Ambiguous Case', 'Scale Drawer', 'Rate Setter', 'Unit Converter',
    'Fuel Efficient', 'Correlator', 'Least Squares', 'Extrapolation Sceptic', 'Z-Scorer',
    'Empirical Ruler', 'Quality Controller', 'Spanning Tree', 'Critical Path', 'Band Six'
  ];
  /* Tuned in the reference app; do not soften. Level 20 ≈ 87k, level 60 ≈ 1.42M. */
  var xpNeeded = function (n) { return Math.round(130 * Math.pow(n, 1.5)); };

  var DAILY_KINDS = [
    { mode: 'rapid',    nm: 'Rapid Fire',         target: 14, verb: 'correct answers' },
    { mode: 'drill',    nm: 'Topic Drill',        target: 12, verb: 'correct answers' },
    { mode: 'crunch',   nm: 'Calculation Crunch', target: 8,  verb: 'solved' },
    { mode: 'survival', nm: 'Survival',           target: 10, verb: 'correct answers' },
    { mode: 'panic',    nm: 'Conversion Panic',   target: 16, verb: 'net cells' },
    { mode: 'display',  nm: 'Read the Display',   target: 10, verb: 'correct reads' },
    { mode: 'chain',    nm: 'Unit Chain',         target: 5,  verb: 'chains' },
    { mode: 'trek',     nm: 'Table Trek',         target: 8,  verb: 'lookups' }
  ];
  var dailyModes = {};
  DAILY_KINDS.forEach(function (k) { dailyModes[k.mode] = k.target; });

  /* NumberCrunch's twelve quests, in the core shape. */
  var QUEST_POOL = [
    ['q-answer', 'Put in the reps', 'Answer 120 questions', 'answered', 120, 1600, 220, '📝'],
    ['q-correct', 'Get them right', 'Answer 80 correctly', 'correct', 80, 1800, 240, '✅'],
    ['q-runs', 'Clock on', 'Finish 12 games', 'gamesFinished', 12, 1400, 200, '🎮'],
    ['q-cards', 'Deck maintenance', 'Review 60 flashcards', 'cardsReviewed', 60, 1300, 190, '🃏'],
    ['q-crunch', 'Show your working', 'Solve 40 Crunch problems', 'crunchSolved', 40, 1700, 230, '🔢'],
    ['q-boss', 'Pick a fight', 'Beat 2 bosses', 'bossWins', 2, 2200, 300, '💀'],
    ['q-perfect', 'Flawless', 'Finish 3 perfect runs', 'perfect', 3, 2000, 280, '💎'],
    ['q-paths', 'Trace the path', 'Solve 8 network puzzles', 'pathsSolved', 8, 1750, 240, '🕸️'],
    ['q-chain', 'Cancel it down', 'Complete 15 unit chains', 'chainsDone', 15, 1500, 210, '📏'],
    ['q-tables', 'Read the table', 'Make 30 table lookups', 'tablesRead', 30, 1450, 205, '📋'],
    ['q-labs', 'Lab work', 'Pass 6 lab challenges', 'labsPassed', 6, 1900, 260, '🧪'],
    ['q-pairs', 'Matched up', 'Clear 6 Match Pairs boards', 'pairsCleared', 6, 1350, 195, '🃏']
  ].map(function (r) {
    return { id: r[0], name: r[1], desc: r[2], stat: r[3], target: r[4], xp: r[5], coins: r[6], icon: r[7],
             /* NumberCrunch field names, for its screens */
             nm: r[1], ds: r[2], need: r[4] };
  });

  function stats0() {
    return {
      answered: 0, correct: 0, wrong: 0, runs: 0, bestStreak: 0, playSecs: 0,
      xpEarned: 0, coinsEarned: 0, coinsSpent: 0, cardsReviewed: 0, cardsPaid: 0,
      bossWins: 0, perfect: 0, cratesOpened: 0, crunchSolved: 0, chainsDone: 0,
      pathsSolved: 0, labsPassed: 0, tablesRead: 0, pairsCleared: 0, daysActive: 1,
      fastest: 0, questsDone: 0, dailiesDone: 0, gamesFinished: 0, sheetRuns: 0
    };
  }

  /* Achievement defs in the core shape, keeping NumberCrunch's own fields. */
  var coreAch = null;
  function achievements() {
    if (coreAch) return coreAch;
    coreAch = (MS.ACHIEVEMENTS || []).map(function (a) {
      return Object.assign({}, a, {
        name: a.nm, icon: a.ic, desc: a.ds, reward: a.coins || 0,
        check: function (st) {
          if (a.stat) return (st[a.stat] || 0) >= a.at;
          if (typeof a.fn === 'function') return !!a.fn(st, compatD());
          return false;
        }
      });
    });
    return coreAch;
  }

  var S = SQ.SubjectState.create('mstd', {
    defaults: function () {
      return {
        stats: stats0(),
        q: {},                   // question id -> {s, r, w, lw}
        qtier: 'mixed',          // Warm-up / Mixed / Exam — WHICH questions, not how fast
        kbd: true,
        seen: {},                // one-off tutorial flags
        lastActiveDay: U.dayKey()
      };
    },
    startCoins: 0,
    levelTitles: TITLES,
    xpCurve: xpNeeded,
    dailyModes: dailyModes,
    dailyReward: { coins: 85, xp: 575 },   // midpoint of NumberCrunch's 400–750 XP / 60–110 Credits
    questPool: QUEST_POOL,
    achievements: achievements,
    achievementStats: function (data, base) { return Object.assign(base, flatStats(data)); },
    cards: function () { return MS.CARDS || []; },
    migrate: function (data) {
      if (!data.stats) data.stats = stats0();
      if (!data.q) data.q = {};
      if (!data.qtier) data.qtier = 'mixed';
      if (!data.seen) data.seen = {};
    }
  });

  var D = function () { return S.data; };

  /* The `d` NumberCrunch's compound achievement checks were written against. */
  function compatD() {
    var d = D();
    return { bosses: d.bossesBeaten, difficulty: d.settings.difficulty, stats: d.stats };
  }

  function catalogOwned(kind) {
    var cat = MS.SHOP || {};
    var owned = SQ.Store.data.owned;
    if (kind === 'themes') return (cat.themes || []).filter(function (t) { return owned.themes.indexOf('mstd-' + t.id) >= 0; }).length;
    return (cat.avatars || []).filter(function (a) { return owned.avatars.indexOf(a.g) >= 0; }).length;
  }

  function flatStats(d) {
    var s = d.stats;
    var codes = Object.keys(d.modules || {});
    var mastered = codes.filter(function (c) { return masteryFrac(c) >= 0.9; }).length;
    var strong = codes.filter(function (c) { return masteryFrac(c) >= 0.7; }).length;
    var box5 = Object.keys(d.srs).filter(function (id) { return d.srs[id].box >= 5; }).length;
    var streak = SQ.Store.data.streak;
    var arcadeScores = (SQ.Store.data.arcade && SQ.Store.data.arcade.scores) || {};
    return {
      answered: s.answered || 0, correct: s.correct || 0, wrong: s.wrong || 0,
      level: d.level, coins: d.coins || 0, coinsEarned: s.coinsEarned || 0,
      xpEarned: d.lifetimeXp || 0, streak: streak.count || 0, bestStreak: s.bestStreak || 0,
      dayStreak: streak.count || 0, bestDayStreak: streak.longest || 0,
      runs: s.gamesFinished || 0, perfect: s.perfect || 0, bossWins: s.bossWins || 0,
      cardsReviewed: s.cardsReviewed || 0, cardsPaid: s.cardsPaid || 0, box5: box5,
      crunchSolved: s.crunchSolved || 0, chainsDone: s.chainsDone || 0,
      pathsSolved: s.pathsSolved || 0, labsPassed: s.labsPassed || 0,
      tablesRead: s.tablesRead || 0, pairsCleared: s.pairsCleared || 0,
      cratesOpened: s.cratesOpened || 0, questsDone: s.questsDone || 0,
      dailiesDone: s.dailiesDone || 0, daysActive: s.daysActive || 0,
      themes: catalogOwned('themes'), avatars: catalogOwned('avatars'),
      ascensions: d.prestige || 0, mastered: mastered, strong: strong,
      topicsTouched: codes.length, accuracy: Math.round(S.overallAccuracy()),
      hiscores: Object.keys(arcadeScores).length,
      bossesBeaten: Object.keys(d.bossesBeaten || {}).length
    };
  }

  /* ------------------------------------------------------- question tier ---
     SEPARATE from difficulty. Difficulty changes the clock and the XP
     multiplier; the TIER changes which questions you are shown. Applied
     centrally in Bank.filter() and Calc.filter(). */
  var TIERS = {
    warmup: { nm: 'Warm-up', ic: '🌱', diffMax: 1,
      ds: 'Foundation and easy questions only. One step, small numbers, and the definitions.',
      note: 'Good for a new topic or a tired brain.' },
    mixed: { nm: 'Mixed', ic: '⚖️', ds: 'The whole bank, from foundation to hardest.',
      note: 'The default, and what the exam actually looks like.' },
    exam: { nm: 'Exam', ic: '🎯', diffMin: 2,
      ds: 'Nothing below exam standard. Multi-step questions with context.',
      note: 'Harder questions are worth more XP.' }
  };

  /* NumberCrunch's power-ups, on the shared inventory ids. */
  var POWERUPS = {
    fifty:   { nm: '50/50',       ic: '✂️', ds: 'Removes two wrong options.' },
    skip:    { nm: 'Skip',        ic: '⏭️', ds: 'Next question, no penalty.' },
    freeze:  { nm: 'Time Freeze', ic: '❄️', ds: 'Stops the clock for 10 seconds.' },
    shield:  { nm: 'Shield',      ic: '🛡️', ds: 'Absorbs one wrong answer.' },
    double:  { nm: 'Double XP',   ic: '✨', ds: 'Double XP for the rest of the run.' },
    insight: { nm: 'Insight',     ic: '💡', ds: 'Shows a hint for this question.' }
  };

  function masteryFrac(code) { return S.mastery(code) / 100; }

  function cardDue(id) {
    var c = D().srs[id];
    return !c || U.daysBetween(c.due, U.dayKey()) >= 0;
  }

  Object.assign(S, {
    TITLES: TITLES,
    DAILY_KINDS: DAILY_KINDS,
    POWERUPS: POWERUPS,
    TIERS: TIERS,
    TIER_ORDER: ['warmup', 'mixed', 'exam'],

    cumulativeXp: function (level) { var t = 0; for (var i = 1; i < level; i++) t += xpNeeded(i); return t; },
    level: function () { return D().level; },
    levelProgress: function () {
      var d = D();
      return { level: d.level, into: d.xpIntoLevel, need: d.level >= S.MAX_LEVEL ? 0 : xpNeeded(d.level) };
    },

    timeScale: function () { return S.difficulty().time; },
    powerupsAllowed: function () { return !S.powerupBanned('fifty'); },
    powerupCount: function (k) { return SQ.Store.data.inventory[k] || 0; },

    tierKey: function () { return TIERS[D().qtier] ? D().qtier : 'mixed'; },
    tier: function () { return TIERS[S.tierKey()]; },
    setTier: function (k) { if (!TIERS[k]) return false; D().qtier = k; S.emit(); return true; },
    tierRange: function () {
      var t = S.tier();
      return { diffMin: t.diffMin || 0, diffMax: t.diffMax == null ? 3 : t.diffMax };
    },

    /** NumberCrunch's answer record. Feeds the core record (modules, mistakes,
        the overall counters) and keeps the per-question ledger the adaptive
        draw and Mistake Rehab read. */
    answer: function (id, right, topic, ms) {
      var d = D(), st = d.stats;
      if (!right) st.wrong = (st.wrong || 0) + 1;
      if (right && ms && (!st.fastest || ms < st.fastest)) st.fastest = ms;
      if (id) {
        var q = d.q[id] || (d.q[id] = { s: 0, r: 0, w: 0, lw: null });
        q.s++;
        if (right) q.r++; else { q.w++; q.lw = U.dayKey(); }
      }
      S.recordAnswer(topic || null, !!right, id || null, topic || null);
    },

    masteryFrac: masteryFrac,
    tierOf: function (m) {
      if (m >= 0.9) return { nm: 'Mastered', cls: 'good', ic: '★★★' };
      if (m >= 0.7) return { nm: 'Strong', cls: 'good', ic: '★★☆' };
      if (m >= 0.45) return { nm: 'Developing', cls: 'warn', ic: '★☆☆' };
      if (m > 0) return { nm: 'Shaky', cls: 'bad', ic: '☆☆☆' };
      return { nm: 'Untouched', cls: 'dim', ic: '—' };
    },
    weakestTopics: function (codes, n) {
      return codes.slice().sort(function (a, b) { return masteryFrac(a) - masteryFrac(b); }).slice(0, n || 3);
    },
    topicRecord: function (code) {
      var m = D().modules[code];
      return m ? { seen: m.seen, right: m.correct } : { seen: 0, right: 0 };
    },

    cardDue: cardDue,
    dueIds: function (ids) { return ids.filter(cardDue); },
    deckSpread: function (ids) {
      var out = [0, 0, 0, 0, 0], srs = D().srs;
      ids.forEach(function (id) { out[U.clamp((srs[id] ? srs[id].box : 1), 1, 5) - 1]++; });
      return out;
    },

    hasAch: function (id) { return !!D().achievements[id]; },
    achProgress: function (a) {
      if (!a.stat) return D().achievements[a.id] ? 1 : 0;
      var st = S.achievementStats();
      return U.clamp((st[a.stat] || 0) / a.at, 0, 1);
    },

    bossBeaten: function (id) { return !!D().bossesBeaten[id]; },
    beatBoss: function (id, info) { return S.markBoss(id, info); },
    bestScore: function (key) { return D().scores[key] || 0; },

    /** Daily challenge in NumberCrunch's shape (nm, verb, topic, xp, coins). */
    dailyInfo: function () {
      var spec = S.daily().spec;
      var kind = DAILY_KINDS.filter(function (k) { return k.mode === spec.mode; })[0] || DAILY_KINDS[0];
      var codes = (MS.TOPICS || []).map(function (t) { return t.code; });
      var rnd = U.seededRandom('daily|' + spec.day);
      return { day: spec.day, mode: spec.mode, nm: kind.nm, verb: kind.verb, target: spec.target,
               topic: codes[Math.floor(rnd() * codes.length)] || 'MS-F1', xp: spec.xp, coins: spec.reward };
    },
    dailyReady: function () { var d = S.daily(); return !d.claimed && d.progress >= d.spec.target; },

    seenOnce: function (key) {
      var d = D();
      if (d.seen[key]) return true;
      d.seen[key] = 1; S.save();
      return false;
    },

    /** Called by the award wrapper: NumberCrunch counted distinct study days. */
    noteActiveDay: function () {
      var d = D(), today = U.dayKey();
      if (d.lastActiveDay === today) return;
      d.lastActiveDay = today;
      d.stats.daysActive = (d.stats.daysActive || 0) + 1;
      S.save();
    }
  });

  MS.State = S;
})();
