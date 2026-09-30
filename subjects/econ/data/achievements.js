/* Achievements (StudyQuest format: {id, name, icon, desc, reward, check(s)}).

   The 23 from the stand-alone app keep their ids; 20 more were added in the
   port. Targets measure against Bank.all(), never Bank.active() — so hiding
   content with a coverage pack can never shorten a collection (brief §8).
   `reward` is paid in Dollars by SQ.SubjectState.checkAchievements(). */
window.ECON = window.ECON || {}; ECON.DATA = ECON.DATA || {};

ECON.DATA.achievements = [
{ id:"first-run",   name:"Opening bell",       icon:"🔔", reward:40,  desc:"Finish your first run in any mode.",              check: function (s) { return s.runs >= 1; } },
{ id:"acc-90",      name:"Clean sweep",        icon:"🎯", reward:120, desc:"Finish a run of 10+ questions at 90% or better.", check: function (s) { return s.acc90Runs >= 1; } },
{ id:"streak-15",   name:"On a roll",          icon:"🔥", reward:120, desc:"Reach a 15-answer streak in one run.",            check: function (s) { return s.bestStreak >= 15; } },
{ id:"streak-30",   name:"Unbroken",           icon:"⚡", reward:300, desc:"Reach a 30-answer streak in one run.",            check: function (s) { return s.bestStreak >= 30; } },
{ id:"days-7",      name:"Week of it",         icon:"📅", reward:150, desc:"Study on 7 consecutive days.",                    check: function (s) { return s.longestDayStreak >= 7; } },
{ id:"days-30",     name:"Month of it",        icon:"🗓️", reward:500, desc:"Study on 30 consecutive days.",                   check: function (s) { return s.longestDayStreak >= 30; } },
{ id:"lv-10",       name:"Level 10",           icon:"⭐", reward:150, desc:"Reach Economics level 10.",                       check: function (s) { return s.level >= 10 || s.prestige > 0; } },
{ id:"lv-25",       name:"Level 25",           icon:"🌟", reward:400, desc:"Reach Economics level 25.",                       check: function (s) { return s.level >= 25 || s.prestige > 0; } },
{ id:"lv-60",       name:"Blue chip",          icon:"👑", reward:1500,desc:"Reach Economics level 60.",                       check: function (s) { return s.level >= 60 || s.prestige > 0; } },
{ id:"seen-100",    name:"Century",            icon:"💯", reward:200, desc:"Answer 100 different questions.",                 check: function (s) { return s.seenCount >= 100; } },
{ id:"seen-half",   name:"Halfway through",    icon:"📚", reward:300, desc:"See half of every multiple-choice question in the bank.", check: function (s) { return s.totalMcq > 0 && s.seenMcq >= Math.ceil(s.totalMcq / 2); } },
{ id:"seen-all",    name:"Completionist",      icon:"🏆", reward:800, desc:"See every multiple-choice question in the bank.",  check: function (s) { return s.totalMcq > 0 && s.seenMcq >= s.totalMcq; } },
{ id:"cards-100",   name:"Card shark",         icon:"🃏", reward:200, desc:"Start 100 different flashcards.",                 check: function (s) { return s.cardsSeen >= 100; } },
{ id:"cards-box4",  name:"Long-term memory",   icon:"🧠", reward:500, desc:"Get 50 flashcards into the final review box.",    check: function (s) { return s.cardsMastered >= 50; } },
{ id:"diagram-all", name:"Draw it from memory",icon:"🗺️", reward:400, desc:"Complete a Label It round on every diagram.",      check: function (s) { return s.diagramTotal > 0 && s.diagramDone >= s.diagramTotal; } },
{ id:"calc-25",     name:"Show your working",  icon:"🧮", reward:200, desc:"Get 25 Calculation Lab questions right.",          check: function (s) { return s.calcSolved >= 25; } },
{ id:"shift-10",    name:"Comparative statics",icon:"📈", reward:200, desc:"Diagnose 10 market shocks completely correctly.",  check: function (s) { return s.shiftsSolved >= 10; } },
{ id:"response-20", name:"In your own words",  icon:"✍️", reward:400, desc:"Complete 20 paid Response Builder answers.",       check: function (s) { return s.responses >= 20; } },
{ id:"rehab-clear", name:"Nothing left to fix",icon:"🩹", reward:250, desc:"Clear your Mistake Rehab pool completely (after 40+ questions).", check: function (s) { return s.missedCount === 0 && s.seenCount >= 40 && s.mistakesFixed >= 1; } },
{ id:"boss-1",      name:"Topic master",       icon:"🛡️", reward:250, desc:"Defeat any Economics boss.",                      check: function (s) { return s.topicBossesBeaten >= 1; } },
{ id:"boss-all",    name:"Five for five",      icon:"🏅", reward:800, desc:"Defeat all five topic bosses.",                   check: function (s) { return s.topicBossesBeaten >= s.topicBossTotal && s.topicBossTotal > 0; } },
{ id:"honest",      name:"Unassisted",         icon:"🕊️", reward:300, desc:"Finish a 15-question Topic Drill at 100% without opening the reference.", check: function (s) { return s.honestRuns >= 1; } },
{ id:"arcade-1",    name:"Time off",           icon:"🕹️", reward:30,  desc:"Play an arcade game. It pays nothing — that's the point.", check: function (s) { return s.arcadePlayed >= 1; } },

/* ── added in the StudyQuest port ─────────────────────────────────── */
{ id:"runs-50",      name:"Regular trader",     icon:"🏃", reward:250, desc:"Finish 50 runs.",                              check: function (s) { return s.runs >= 50; } },
{ id:"runs-200",     name:"Institutional investor", icon:"🏛️", reward:700, desc:"Finish 200 runs.",                        check: function (s) { return s.runs >= 200; } },
{ id:"answered-500", name:"Five hundred",       icon:"📝", reward:250, desc:"Answer 500 Economics questions.",               check: function (s) { return s.answered >= 500; } },
{ id:"correct-1000", name:"Thousand in the black", icon:"💰", reward:600, desc:"Get 1,000 answers right.",                  check: function (s) { return s.correct >= 1000; } },
{ id:"perfect-5",    name:"Balanced books",     icon:"✨", reward:300, desc:"Finish 5 perfect runs of 5+ questions.",         check: function (s) { return s.perfectRuns >= 5; } },
{ id:"final-paper",  name:"Pens down",          icon:"📜", reward:1000,desc:"Defeat the Final Paper.",                        check: function (s) { return s.finalBeaten; } },
{ id:"flawless-boss",name:"No recession",       icon:"🛡️", reward:400, desc:"Defeat a boss without losing any HP.",           check: function (s) { return s.flawlessBoss >= 1; } },
{ id:"clutch",       name:"Soft landing",       icon:"🪂", reward:300, desc:"Defeat a boss with 10% HP or less left.",        check: function (s) { return s.clutchWins >= 1; } },
{ id:"hard-win",     name:"Tight money",        icon:"🔥", reward:400, desc:"Defeat a boss on Hard.",                         check: function (s) { return s.hardWins >= 1; } },
{ id:"nightmare-win",name:"Stagflation survivor", icon:"💀", reward:800, desc:"Defeat a boss on Nightmare.",                  check: function (s) { return s.nightmareWins >= 1; } },
{ id:"survival-15",  name:"Automatic stabiliser", icon:"💀", reward:300, desc:"Survive 15 questions in Survival.",            check: function (s) { return s.survivalBest >= 15; } },
{ id:"calc-100",     name:"Econometrician",     icon:"📐", reward:500, desc:"Get 100 Calculation Lab questions right.",       check: function (s) { return s.calcSolved >= 100; } },
{ id:"shift-40",     name:"General equilibrium",icon:"⚖️", reward:500, desc:"Diagnose 40 market shocks completely correctly.", check: function (s) { return s.shiftsSolved >= 40; } },
{ id:"daily-5",      name:"Daily habit",        icon:"📆", reward:250, desc:"Claim 5 Economics daily challenges.",            check: function (s) { return s.dailiesDone >= 5; } },
{ id:"quest-3",      name:"Forward guidance",   icon:"🧭", reward:250, desc:"Claim 3 Economics weekly quests.",               check: function (s) { return s.questsDone >= 3; } },
{ id:"mastery-gold", name:"Gold standard",      icon:"🥇", reward:500, desc:"Reach Gold mastery (65%) in any topic.",         check: function (s) { return s.bestMastery >= 65; } },
{ id:"mastery-broad",name:"Diversified portfolio", icon:"🧺", reward:500, desc:"Reach Bronze mastery (25%) in all ten topics.", check: function (s) { return s.worstMastery >= 25; } },
{ id:"prestige-1",   name:"Ascended",           icon:"🔱", reward:1000,desc:"Ascend in Economics (prestige once).",           check: function (s) { return s.prestige >= 1; } },
{ id:"cards-500",    name:"Spaced out",         icon:"🗂️", reward:400, desc:"Review 500 flashcards.",                         check: function (s) { return s.cardsReviewed >= 500; } },
{ id:"modes-all",    name:"Mixed economy",      icon:"🎲", reward:400, desc:"Play every Economics mode at least once.",       check: function (s) { return s.modesPlayedCount >= s.modeTotal && s.modeTotal > 0; } },
{ id:"coins-5000",   name:"Budget surplus",     icon:"💲", reward:300, desc:"Hold 5,000 Dollars at once.",                    check: function (s) { return s.peakCoins >= 5000; } }
];

/* Stats the checks read. Computed at check time, against Bank.all(). */
(function (root) {
  "use strict";
  var ECON = root.ECON = root.ECON || {};
  var A = {};

  A.all = function () { return ECON.DATA.achievements.slice(); };

  A.stats = function (d, base) {
    var Bank = ECON.Bank, S = ECON.State;
    var mcq = Bank ? Bank.all("mcq") : [];
    var seenMcq = mcq.filter(function (q) { return d.seen[q.id]; }).length;
    var mods = ECON.U.MODULES.map(function (m) { return S.mastery(m.id); });
    var bosses = (ECON.Boss && ECON.Boss.BOSSES) || [];
    var topic = bosses.filter(function (b) { return b.id !== "final"; });
    var arcade = (SQ.Store.data.arcade && SQ.Store.data.arcade.played) || {};
    var played = Object.keys(arcade).length;
    return Object.assign(base, {
      seenCount: Object.keys(d.seen).length,
      seenMcq: seenMcq, totalMcq: mcq.length,
      diagramDone: Object.keys(d.diagramSeen).length,
      diagramTotal: Bank ? Bank.diagrams().length : 0,
      missedCount: d.mistakes.length,
      topicBossesBeaten: topic.filter(function (b) { return d.bossesBeaten[b.id]; }).length,
      topicBossTotal: topic.length,
      finalBeaten: !!d.bossesBeaten.final,
      survivalBest: Math.max(d.scores.survival || 0, d.stats.survivalBest || 0),
      bestMastery: Math.max.apply(null, mods.concat([0])),
      worstMastery: mods.length ? Math.min.apply(null, mods) : 0,
      arcadePlayed: played,
      modeTotal: ECON.Run ? ECON.Run.MODES.length : 0
    });
  };

  A.byId = function (id) {
    var list = ECON.DATA.achievements;
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  };

  A.progress = function () {
    var total = ECON.DATA.achievements.length;
    var have = ECON.DATA.achievements.filter(function (a) { return ECON.State.has(a.id); }).length;
    return { have: have, total: total };
  };

  /* Kept for callers that used to trigger a check; the core checks inside award(). */
  A.check = function () { return ECON.State.checkAchievements(); };

  ECON.Achievements = A;
})(typeof window !== "undefined" ? window : globalThis);
