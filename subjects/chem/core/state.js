/* Chemistry's State — the shared subject-state factory configured with MoleQuest's
   numbers (level curve round(115·n^1.5), 60 titles, its daily targets, its twelve
   weekly quests and its 65 achievements).

   What used to live here and now belongs to the app: the save file itself, the
   profile, the power-up inventory, the day streak, sound/motion settings and the
   owned themes/avatars (see js/sq/store.js). Chemistry keeps xp, level, prestige,
   Moles, stats, module mastery, the Leitner deck, mistakes, achievements, the
   daily/weekly, difficulty and course coverage. */
window.CHEM = window.CHEM || {};

CHEM.State = (function () {
  /* MoleQuest's twelve-quest pool, unchanged. Progress is the stat minus the
     snapshot taken at week rollover (the factory does the diffing). */
  const QUEST_POOL = [
    { id:"q_answer",  stat:"answered",          target:180, xp:1400, coins:700, icon:"📝",
      name:"Grind it out", desc:"Answer 180 questions" },
    { id:"q_correct", stat:"correct",           target:120, xp:1600, coins:800, icon:"🎯",
      name:"On target", desc:"Get 120 questions right" },
    { id:"q_balance", stat:"equationsBalanced", target:30,  xp:1300, coins:650, icon:"⚖️",
      name:"Conservation duty", desc:"Balance 30 equations" },
    { id:"q_ions",    stat:"ionsMatched",       target:60,  xp:1100, coins:550, icon:"🧩",
      name:"Ion sweep", desc:"Match 60 ion pairs" },
    { id:"q_titrate", stat:"titrations",        target:10,  xp:1500, coins:750, icon:"🧪",
      name:"Volumetric week", desc:"Complete 10 titrations" },
    { id:"q_path",    stat:"pathways",          target:12,  xp:1400, coins:700, icon:"🔗",
      name:"Synthesis sprint", desc:"Solve 12 pathway puzzles" },
    { id:"q_calc",    stat:"calcsCorrect",      target:45,  xp:1400, coins:700, icon:"🔢",
      name:"Number crunch", desc:"Solve 45 calculations" },
    { id:"q_name",    stat:"namingCorrect",     target:45,  xp:1300, coins:650, icon:"🏷️",
      name:"Nomenclature drill", desc:"Name 45 compounds correctly" },
    { id:"q_boss",    stat:"bossWins",          target:3,   xp:2200, coins:1100, icon:"⚔️",
      name:"Boss hunter", desc:"Defeat 3 Exam Bosses" },
    { id:"q_perfect", stat:"perfectRuns",       target:5,   xp:2000, coins:1000, icon:"✨",
      name:"Flawless five", desc:"Finish 5 perfect runs" },
    { id:"q_cards",   stat:"cardsMastered",     target:20,  xp:1500, coins:750, icon:"🃏",
      name:"Deck builder", desc:"Have 20 flashcards mastered" },
    { id:"q_survive", stat:"survivalBest",      target:25,  xp:1800, coins:900, icon:"💀",
      name:"Last stand", desc:"Reach a 25-question Survival run" }
  ];

  const S = SQ.SubjectState.create("chem", {
    defaults: () => ({
      stats: {
        equationsBalanced: 0, ionsMatched: 0, titrations: 0, perfectTitrations: 0, concordantSets: 0,
        pathways: 0, namingCorrect: 0, calcsCorrect: 0, perfectPrecipitation: 0,
        nightOwl: false, earlyBird: false
      },
      pathwaysSolved: {}
    }),
    startCoins: 100,
    levelTitles: CHEM.DATA.levelTitles,
    xpCurve: n => Math.round(115 * Math.pow(n, 1.5)),
    /* The daily challenge's modes and targets are MoleQuest's. Rapid Fire and Module
       Drill both count towards "quiz". */
    dailyModes: { quiz: 12, balance: 6, ionmatch: 1, naming: 10, calc: 8,
                  precipitate: 1, titration: 2, pathway: 3 },
    dailyReward: { coins: 120, xp: 150 },
    questPool: QUEST_POOL,
    achievements: () => CHEM.DATA.achievements,
    achievementStats: (data, base) => Object.assign(base, {
      pathwaysSolvedUnique: Object.keys(data.pathwaysSolved || {}).length,
      /* night owl / early bird were set by the old streak code; the app's streak
         now owns the clock, so they are set here when an achievement check runs. */
      nightOwl: data.stats.nightOwl || isHour(0, 4) && noteFlag(data, "nightOwl"),
      earlyBird: data.stats.earlyBird || isHour(5, 7) && noteFlag(data, "earlyBird")
    }),
    cards: () => CHEM.Bank.activeCards()
  });

  function isHour(lo, hi) { const h = new Date().getHours(); return h >= lo && h < hi; }
  function noteFlag(data, k) { data.stats[k] = true; return true; }

  /* The ported modes read `timeScale` and `damage`; the shared difficulties call
     them `time` and `boss`. Alias rather than rewrite forty call sites. */
  const baseDifficulty = S.difficulty;
  S.difficulty = function () {
    const d = baseDifficulty();
    return Object.assign({}, d, { timeScale: d.time, damage: d.boss });
  };

  /* Only the ids of hidden packs are stored; the bank wants a Set. */
  const baseHidden = S.hiddenTags;
  S.hiddenTags = () => new Set(baseHidden());

  /* MoleQuest kept stats.cardsMastered current on every review; keep doing so. */
  const baseReview = S.reviewCard;
  S.reviewCard = function (id, grade) {
    const r = baseReview(id, grade);
    S.data.stats.cardsMastered = S.cardsMastered();
    return r;
  };

  return S;
})();
