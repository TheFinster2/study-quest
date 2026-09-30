/* Biosphere — subjects/bio/core/state.js
   The Biology State, rebuilt on the shared factory (SQ.SubjectState.create).

   Biology came from the second lineage (shared with Economics): a `fresh()` save
   with `seen / missed / cards / shortLog / genSeeds`, the level DERIVED from total
   XP, Leitner cards keyed by timestamp. In StudyQuest the slot is the factory's
   shape, and the old fields map onto it like this:

     xp (total)              → xp / level / xpIntoLevel     (same curve: round(115·n^1.5))
     cards {box 0-4, due ms} → srs {box 1-5, due dayKey}    (factory cardState / reviewCard)
     coverage {pack: true}   → settings.hidden {pack: true} (factory tagHidden / setTagHidden)
     bosses {M1: {cleared}}  → bossesBeaten {"b-M1": ts} + bossBest
     streakDays / lastDay    → the app's day streak (SQ.Store.data.streak)
     owned / theme / avatar  → the global wardrobe and the subject theme
     inventory               → the app's shared power-ups (linked onto the slot)

   Kept as Biology-only fields because the adaptive bank, Mistake Rehab and the
   genetics generators need them exactly as they were:
     seen      questionId → {n, wrong, last}   (adaptive draw weighting, mastery, boss unlocks)
     missed    questionId → {n, last}          (Mistake Rehab: two clean answers retire one)
     shortLog  shortId → dayKey                (a written response pays once per day)
     genSeeds, diagramSeen, bests, runs, timeMs

   Exposes: window.BIO.State */
(function (root) {
  "use strict";

  var BIO = root.BIO = root.BIO || {};
  var U = BIO.U;

  var MODULES = ["M1", "M2", "M3", "M4", "M5", "M6", "M7", "M8"];

  var S = SQ.SubjectState.create("bio", {
    defaults: function () {
      return {
        stats: {
          punnettSolved: 0, pedigreeSolved: 0, responsesMarked: 0, labelRounds: 0,
          sortRuns: 0, processSolved: 0, dataSolved: 0, rehabRuns: 0,
          cleanSweeps: 0, honestRuns: 0, survivalBest: 0, rapidBest: 0
        },
        seen: {}, missed: {}, shortLog: {}, genSeeds: {}, diagramSeen: {},
        bests: {}, runs: 0, timeMs: 0, bossBest: {},
        settings: { hintsInResponse: true, refAck: false },
        seenIntro: false, devUnlocked: false
      };
    },
    startCoins: 0,                                   // Biosphere started every student at 0 ◉
    levelTitles: (BIO.DATA && BIO.DATA.levelTitles) || [],
    xpCurve: function (n) { return Math.round(115 * Math.pow(n, 1.5)); },
    /* The subject daily: a target SCORE (correct answers / crosses / marks) in one
       mode. Only runs that actually paid XP move it — see UI.award. */
    dailyModes: {
      rapidfire: 15, drill: 12, punnett: 5, pedigree: 4, termmatch: 7, labelit: 4,
      datadetective: 6, sortit: 12, processorder: 3, survival: 8, response: 6, flashcards: 15
    },
    dailyReward: { coins: 150, xp: 180 },
    questPool: [
      { id: "bq-answer",   stat: "answered",       target: 150, xp: 600, coins: 260, icon: "📝", name: "Field work",        desc: "Answer 150 Biology questions" },
      { id: "bq-correct",  stat: "correct",        target: 100, xp: 700, coins: 300, icon: "🎯", name: "Sharp eye",         desc: "Get 100 Biology answers right" },
      { id: "bq-punnett",  stat: "punnettSolved",  target: 20,  xp: 650, coins: 280, icon: "🧬", name: "Cross-breeder",     desc: "Solve 20 Punnett Lab crosses" },
      { id: "bq-pedigree", stat: "pedigreeSolved", target: 10,  xp: 650, coins: 280, icon: "🌳", name: "Family historian",  desc: "Solve 10 pedigrees" },
      { id: "bq-cards",    stat: "cardsReviewed",  target: 80,  xp: 550, coins: 240, icon: "🃏", name: "Spaced out",        desc: "Review 80 flashcards" },
      { id: "bq-response", stat: "responsesMarked",target: 6,   xp: 600, coins: 260, icon: "✍️", name: "In your own words", desc: "Self-mark 6 written responses" },
      { id: "bq-label",    stat: "labelRounds",    target: 12,  xp: 550, coins: 240, icon: "🔬", name: "Cartographer",      desc: "Answer 12 Label It items" },
      { id: "bq-boss",     stat: "bossWins",       target: 1,   xp: 800, coins: 350, icon: "⚔️", name: "Boss hunter",       desc: "Defeat a Biology boss" },
      { id: "bq-fixed",    stat: "mistakesFixed",  target: 15,  xp: 600, coins: 260, icon: "🩹", name: "Rehabilitated",     desc: "Retire 15 questions from Mistake Rehab" },
      { id: "bq-data",     stat: "dataSolved",     target: 15,  xp: 550, coins: 240, icon: "📈", name: "Data literate",     desc: "Answer 15 Data Detective questions right" }
    ],
    achievements: function () { return (BIO.DATA && BIO.DATA.achievements) || []; },
    achievementStats: function (d, base) {
      var Bank = BIO.Bank;
      var mcq = Bank ? Bank.all("mcq") : [];
      var seenMcq = 0;
      mcq.forEach(function (q) { if (d.seen[q.id]) seenMcq++; });
      var bosses = Object.keys(d.bossesBeaten || {});
      return Object.assign(base, {
        seenCount: Object.keys(d.seen).length,
        seenMcq: seenMcq, totalMcq: mcq.length,
        missedCount: Object.keys(d.missed).length,
        shortCount: Object.keys(d.shortLog).length,
        diagramsDone: Object.keys(d.diagramSeen).length,
        diagramsTotal: Bank ? Bank.diagrams().length : 0,
        runs: d.runs || 0,
        moduleBosses: bosses.filter(function (b) { return /^b-M\d$/.test(b); }).length,
        finalBoss: !!(d.bossesBeaten && d.bossesBeaten["b-final"]),
        arcadePlayed: Object.keys((SQ.Store.data.arcade && SQ.Store.data.arcade.played) || {}).length,
        dailyStreak: base.dayStreak,
        leeches: S.leeches().length,
        masteries: MODULES.map(function (m) { return S.mastery(m); }),
        punnettSolved: d.stats.punnettSolved || 0,
        pedigreeSolved: d.stats.pedigreeSolved || 0
      });
    },
    cards: function () { return BIO.Bank ? BIO.Bank.all("card") : []; },
    migrate: function (d) {
      /* One-way fixes: a slot written by an early build of this port might carry
         a Biosphere-shaped `cards` map; fold it into srs. */
      if (d.cards && typeof d.cards === "object") {
        Object.keys(d.cards).forEach(function (id) { if (!d.srs[id]) d.srs[id] = convertCard(d.cards[id]); });
        delete d.cards;
      }
    }
  });

  /* ── Biosphere's economy constants (kept: modes read them) ─────────── */
  S.BUILD            = "2.0.0-sq";
  S.XP_PER_CORRECT   = 10;       // × item difficulty × streak multiplier
  S.LEVEL_CAP        = S.MAX_LEVEL;
  S.COIN_RATE        = 0.75;     // biocredits = run XP × 0.75 (bound UI coinRate)
  S.MIN_READ_MS      = 1200;     // faster than this earns nothing
  S.MIN_ACC_BONUS    = 0.50;     // completion bonus withheld below this
  S.SHORT_MIN_CHARS  = 20;       // a written response under this pays nothing
  S.MAX_MULTIPLIER   = SQ.Economy.MAX_MULTIPLIER;

  S.levelCost = S.xpNeeded;
  S.totalXpForLevel = function (n) { var t = 0; for (var i = 1; i < n; i++) t += S.xpNeeded(i); return t; };

  /* Streak multiplier: ×1 → ×3 in half steps every 5 correct. */
  S.streakMult = function (streak) { return Math.min(3, 1 + Math.floor(streak / 5) * 0.5); };

  /* The whole run multiplier, clamped: difficulty × prestige × Catalyst. It only
     ever MULTIPLIES (0 × anything is 0) — tests/subjects/bio/exploit.js. */
  S.runMultiplier = function (boostActive) {
    var m = S.xpMultiplier() * (boostActive ? 2 : 1);
    return Math.max(1, Math.min(S.MAX_MULTIPLIER, m));
  };

  /* ── question history (the adaptive bank's memory) ─────────────────── */
  S.markSeen = function (id, correct, q) {
    var d = S.data;
    var s = d.seen[id] || (d.seen[id] = { n: 0, wrong: 0, last: 0 });
    s.n++; s.last = Date.now();
    var retired = false;
    if (!correct) {
      s.wrong++;
      var m = d.missed[id] || (d.missed[id] = { n: 0, last: 0 });
      m.n++; m.last = Date.now();
    } else if (d.missed[id]) {
      // two clean answers retires it from the rehab pool
      d.missed[id].n--;
      if (d.missed[id].n <= 0) { delete d.missed[id]; retired = true; }
    }
    if (retired) d.stats.mistakesFixed = (d.stats.mistakesFixed || 0) + 1;
    var item = q || (BIO.Bank ? BIO.Bank.byId("mcq", id) : null);
    /* Stats, module mastery and the app-wide counters. The questionId is NOT
       passed: Biology keeps its own rehab pool (`missed`) with its own rule. */
    S.recordAnswer(item ? item.mod : null, !!correct, null, item ? item.topic : null);
  };
  S.missedIds = function () { return Object.keys(S.data.missed); };

  /* An answer in a mode that is not a bank MCQ (a cross, a pedigree, a sort). */
  S.noteAnswer = function (mod, ok, topic) { S.recordAnswer(mod || null, !!ok, null, topic || null); };

  S.saveSoon = S.save;

  /* ── short-answer daily payment ledger ─────────────────────────────── */
  S.shortPaidToday = function (id) { return S.data.shortLog[id] === U.dayKey(); };
  S.markShortPaid  = function (id) { S.data.shortLog[id] = U.dayKey(); S.save(); };

  /* ── achievements (the factory stores them; these are Biosphere's names) ── */
  S.has = function (id) { return !!S.data.achievements[id]; };

  /* ── coverage: a pack id is the factory's hidden tag ───────────────── */
  S.isHidden = S.tagHidden;
  S.setHidden = S.setTagHidden;

  /* ── power-ups: the shared inventory ───────────────────────────────── */
  S.powerupCount = function (id) { return (SQ.Store.data.inventory[id]) || 0; };

  /* ── mastery: coverage × accuracy against Bank.all() ───────────────────
     Biosphere's definition, kept: hiding content with a coverage pack cannot
     inflate it, and three right answers are not mastery of a sixty-question
     module. Replaces the factory's per-answer mastery for Biology. */
  S.mastery = function (modId) {
    var seen = 0, correct = 0, total = 0;
    var d = S.data.seen;
    var bank = BIO.Bank ? BIO.Bank.all("mcq") : [];
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
    return Math.round((seen / total) * (seen ? correct / seen : 0) * 100);
  };

  /* Questions seen in a module — what unlocks its boss (Biosphere's rule). */
  S.seenInModule = function (modId) {
    var bank = BIO.Bank ? BIO.Bank.all("mcq") : [];
    var n = 0;
    bank.forEach(function (q) { if (q.mod === modId && S.data.seen[q.id]) n++; });
    return n;
  };

  /* A Biosphere card → a factory srs entry. Box 0-4 → 1-5; a timestamp due → a day key. */
  function convertCard(c) {
    c = c || {};
    var due = typeof c.due === "number" && c.due > 0 ? U.dayKey(c.due) : U.dayKey();
    return { box: Math.max(1, Math.min(5, (c.box || 0) + 1)), due: due, reps: c.n || 0,
             lapses: c.lapses || 0, last: c.last ? U.dayKey(c.last) : null };
  }
  S.convertCard = convertCard;

  BIO.State = S;
})(typeof window !== "undefined" ? window : globalThis);
