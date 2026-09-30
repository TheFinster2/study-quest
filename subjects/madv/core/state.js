/* The Maths Advanced slot of the one StudyQuest save.

   The stand-alone app owned a whole localStorage key; here the shared factory
   (js/sq/subject-state.js) owns persistence, levels, prestige, cards, daily and
   weekly, and this file supplies what is MathQuest's own: its stats, its level
   curve (130·n^1.5 — a whole-HSC-year progression, deliberately), its titles,
   its daily modes and weekly quest pool, and its achievements.

   Shared (linked, never saved twice): profile, power-up inventory, day streak,
   sound/motion. Owned themes/avatars are the global wardrobe. */
window.MA = window.MA || {};

MA.State = (function () {
  const U = MA.U;

  const STATS = () => ({
    answered: 0, correct: 0, bestStreak: 0, perfectRuns: 0,
    equivalences: 0, pairsMatched: 0, curvesRead: 0, calcsCorrect: 0,
    tangentsPlaced: 0, perfectTangents: 0, areasFound: 0,
    proofsSolved: 0, inductionsSolved: 0, gridsFilled: 0, perfectGrids: 0,
    projectilesLanded: 0, bullseyes: 0,
    bossWins: 0, flawlessBoss: 0, clutchWins: 0,
    mistakesFixed: 0, peakCoins: 100, nightOwl: false, earlyBird: false,
    timePlayed: 0, survivalBest: 0, hardWins: 0, nightmareWins: 0,
    cardsMastered: 0, questsDone: 0, extAnswered: 0, extCorrect: 0,
    finalPaperBest: 0, referenceReads: 0, formulaLookups: 0, cardsReviewed: 0
  });

  /* Weekly quests: each names a cumulative stat; progress is that stat minus a
     snapshot taken at week rollover. */
  const QUEST_POOL = [
    { id:"q_answer",  stat:"answered",     target:180, xp:1400, coins:700, icon:"📝",
      name:"Grind it out",      desc:"Answer 180 questions" },
    { id:"q_correct", stat:"correct",      target:120, xp:1600, coins:800, icon:"🎯",
      name:"On target",         desc:"Get 120 questions right" },
    { id:"q_equiv",   stat:"equivalences", target:30,  xp:1300, coins:650, icon:"🔁",
      name:"Same thing twice",  desc:"Verify 30 equivalences" },
    { id:"q_pairs",   stat:"pairsMatched", target:60,  xp:1100, coins:550, icon:"🃏",
      name:"Pair sweep",        desc:"Match 60 pairs" },
    { id:"q_lab",     stat:"tangentsPlaced", target:20, xp:1500, coins:750, icon:"📐",
      name:"Gradient week",     desc:"Place 20 tangents in the Calculus Lab" },
    { id:"q_proof",   stat:"proofsSolved", target:12,  xp:1400, coins:700, icon:"🪜",
      name:"Proof sprint",      desc:"Assemble 12 proofs" },
    { id:"q_calc",    stat:"calcsCorrect", target:45,  xp:1400, coins:700, icon:"🔢",
      name:"Number crunch",     desc:"Solve 45 calculations" },
    { id:"q_curve",   stat:"curvesRead",   target:45,  xp:1300, coins:650, icon:"📈",
      name:"Curve literacy",    desc:"Read 45 graphs correctly" },
    { id:"q_boss",    stat:"bossWins",     target:3,   xp:2200, coins:1100, icon:"⚔️",
      name:"Boss hunter",       desc:"Defeat 3 Exam Bosses" },
    { id:"q_perfect", stat:"perfectRuns",  target:5,   xp:2000, coins:1000, icon:"✨",
      name:"Flawless five",     desc:"Finish 5 perfect runs" },
    { id:"q_cards",   stat:"cardsMastered",target:20,  xp:1500, coins:750, icon:"🗂️",
      name:"Deck builder",      desc:"Have 20 flashcards mastered" },
    { id:"q_survive", stat:"survivalBest", target:25,  xp:1800, coins:900, icon:"💀",
      name:"Last stand",        desc:"Reach a 25-question Survival run" }
  ];

  /* The four shared difficulties, with MathQuest's own field names aliased on
     (its modes read `timeScale` and `damage`). */
  const DIFFS = SQ.SubjectState.DIFFICULTIES.map(d =>
    Object.assign({}, d, { timeScale: d.time, damage: d.boss }));

  const TIERS = MA.DATA.masteryTiers.map((t, i) => Object.assign({ cls: "m" + i }, t));

  const cfg = {
    defaults: () => ({
      stats: STATS(),
      proofsSolved: {},
      /* Subject-only settings live under settings too; the Extension 1 toggle
         is the coverage tag "ME" in settings.hidden. */
      settings: { difficulty: "standard", theme: null, hidden: {} }
    }),
    startCoins: 100,
    levelTitles: MA.DATA.levelTitles,
    xpCurve: level => Math.round(130 * Math.pow(level, 1.5)),
    difficulties: DIFFS,
    masteryTiers: TIERS,
    /* A getter, so Vector Lab drops out of the daily rotation when Extension 1
       is switched off (the factory re-reads this on every call). */
    get dailyModes() {
      const m = { rapid: 14, equiv: 6, match: 1, curve: 10, crunch: 8, panic: 1, lab: 3, proof: 3 };
      if (MA.DATA.hasExt()) m.vector = 3;
      return m;
    },
    dailyReward: { coins: 120, xp: 150 },
    questPool: QUEST_POOL,
    achievements: () => MA.DATA.enabledAchievements(),
    cards: () => MA.Cards.all(),
    achievementStats: (data, base) => {
      const g = SQ.Store.data;
      const madvThemes = (MA.DATA.shop.themes || []).map(t => t.id);
      return Object.assign(base, {
        topics: data.topics,
        proofsSolvedUnique: Object.keys(data.proofsSolved || {}).length,
        inductionsSolvedUnique: MA.Proofs.inductions().filter(p => (data.proofsSolved || {})[p.id]).length,
        bookmarks: data.bookmarks.length,
        /* The day-streak clock moved to the app, and with it the night-owl and
           early-bird flags; a save imported from the stand-alone app keeps its own. */
        nightOwl: !!(data.stats.nightOwl || (g.stats && g.stats.nightOwl)),
        earlyBird: !!(data.stats.earlyBird || (g.stats && g.stats.earlyBird)),
        madvThemesOwned: madvThemes.filter(id => g.owned.themes.includes(id)).length,
        masteryOf: t => MA.State.mastery(t)
      });
    },
    migrate: data => {
      data.proofsSolved = data.proofsSolved || {};
      /* Mastery reads `modules`; MathQuest tracked it on `topics`. Keep them in
         step for a slot that only ever had the one. */
      if (data.topics && (!data.modules || !Object.keys(data.modules).length)) {
        data.modules = JSON.parse(JSON.stringify(data.topics));
      }
    }
  };

  const S = SQ.SubjectState.create("madv", cfg);
  const base = {
    recordAnswer: S.recordAnswer,
    dueCards: S.dueCards,
    reviewCard: S.reviewCard
  };

  Object.assign(S, {
    /** MathQuest's signature: recordAnswer(topic, isCorrect, questionId).
        Mastery is tracked on the topic code on both axes. */
    recordAnswer(topic, isCorrect, questionId) {
      const d = S.data;
      if (topic && MA.DATA.tierOf(topic) === "ME") {
        d.stats.extAnswered = (d.stats.extAnswered || 0) + 1;
        if (isCorrect) d.stats.extCorrect = (d.stats.extCorrect || 0) + 1;
      }
      base.recordAnswer(topic, isCorrect, questionId, topic);
    },

    /** dueCards(deckArray?) — MathQuest passed a deck, the factory takes a filter. */
    dueCards(deck) {
      if (Array.isArray(deck)) {
        const ids = new Set(deck.map(c => c.id));
        return base.dueCards(c => ids.has(c.id));
      }
      return base.dueCards(deck);
    },

    /** Graded review, with the stat MathQuest's weekly quest reads kept in step. */
    reviewCard(id, grade) {
      const out = base.reviewCard(id, grade);
      S.data.stats.cardsMastered = S.cardsMastered();
      return out;
    },

    /** The Extension 1 setting ("I study Extension 1"). */
    studiesExt: () => !S.tagHidden("ME"),
    setStudiesExt(on) { S.setTagHidden("ME", !on); },

    QUEST_POOL
  });
  return S;
})();
