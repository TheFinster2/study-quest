/* Achievements.
   Targets measure against Bank.all(), never Bank.active() — so hiding content
   with a coverage pack can never shorten a collection.

   StudyQuest shape: { id, name, icon, desc, reward, check(stats) } — checked by
   the shared factory (S.checkAchievements) after every award, reward paid in
   biocredits. The 23 Biosphere achievements keep their ids; 22 more cover the
   systems StudyQuest added (HP bosses, the Final Paper, difficulties, prestige,
   dailies, weekly quests, graded cards and leeches). */
window.BIO = window.BIO || {}; BIO.DATA = BIO.DATA || {};

BIO.DATA.achievements = [
/* ── Biosphere's originals ─────────────────────────────────────────── */
{ id:"first-run",   name:"First light",        icon:"🌱", reward:40,  desc:"Finish your first run in any mode.",              check: function (s) { return s.runs >= 1; } },
{ id:"acc-90",      name:"Clean sweep",        icon:"🎯", reward:80,  desc:"Finish a run of 10+ questions at 90% or better.", check: function (s) { return s.cleanSweeps >= 1; } },
{ id:"streak-15",   name:"On a roll",          icon:"🔥", reward:80,  desc:"Reach a 15-answer streak in one run.",            check: function (s) { return s.bestStreak >= 15; } },
{ id:"streak-30",   name:"Unbroken",           icon:"⚡", reward:200, desc:"Reach a 30-answer streak in one run.",            check: function (s) { return s.bestStreak >= 30; } },
{ id:"days-7",      name:"Week of it",         icon:"📅", reward:120, desc:"Study on 7 consecutive days.",                    check: function (s) { return s.longestDayStreak >= 7; } },
{ id:"days-30",     name:"Month of it",        icon:"🗓️", reward:500, desc:"Study on 30 consecutive days.",                   check: function (s) { return s.longestDayStreak >= 30; } },
{ id:"lv-10",       name:"Level 10",           icon:"⭐", reward:150, desc:"Reach Biology level 10.",                          check: function (s) { return s.level >= 10 || s.prestige > 0; } },
{ id:"lv-25",       name:"Level 25",           icon:"🌟", reward:400, desc:"Reach Biology level 25.",                          check: function (s) { return s.level >= 25 || s.prestige > 0; } },
{ id:"lv-60",       name:"Apex",               icon:"👑", reward:1500,desc:"Reach Biology level 60.",                          check: function (s) { return s.level >= 60 || s.prestige > 0; } },
{ id:"seen-100",    name:"Century",            icon:"💯", reward:100, desc:"Answer 100 different questions.",                 check: function (s) { return s.seenCount >= 100; } },
{ id:"seen-half",   name:"Halfway through",    icon:"📚", reward:400, desc:"See half of every multiple-choice question in the bank.", check: function (s) { return s.totalMcq > 0 && s.seenMcq >= Math.ceil(s.totalMcq / 2); } },
{ id:"seen-all",    name:"Completionist",      icon:"🏆", reward:1200,desc:"See every multiple-choice question in the bank.",  check: function (s) { return s.totalMcq > 0 && s.seenMcq >= s.totalMcq; } },
{ id:"cards-100",   name:"Card shark",         icon:"🃏", reward:120, desc:"Review 100 different flashcards.",                 check: function (s) { return s.cardsSeen >= 100; } },
{ id:"cards-box4",  name:"Long-term memory",   icon:"🧠", reward:400, desc:"Get 50 flashcards into the final review box.",    check: function (s) { return s.cardsMastered >= 50; } },
{ id:"diagram-all", name:"Cartographer",       icon:"🗺️", reward:500, desc:"Complete a Label It round on every diagram.",      check: function (s) { return s.diagramsTotal > 0 && s.diagramsDone >= s.diagramsTotal; } },
{ id:"punnett-25",  name:"Mendel's apprentice",icon:"🧬", reward:200, desc:"Solve 25 Punnett Lab crosses correctly.",          check: function (s) { return s.punnettSolved >= 25; } },
{ id:"pedigree-10", name:"Family tree",        icon:"🌳", reward:200, desc:"Solve 10 pedigrees correctly.",                    check: function (s) { return s.pedigreeSolved >= 10; } },
{ id:"response-20", name:"In your own words",  icon:"✍️", reward:300, desc:"Complete 20 different Response Builder questions.", check: function (s) { return s.shortCount >= 20; } },
{ id:"rehab-clear", name:"Nothing left to fix",icon:"🩹", reward:200, desc:"Clear your Mistake Rehab pool completely (after 40+ questions).", check: function (s) { return s.missedCount === 0 && s.seenCount >= 40; } },
{ id:"boss-1",      name:"Module master",      icon:"🛡️", reward:200, desc:"Defeat any module boss.",                          check: function (s) { return s.moduleBosses >= 1; } },
{ id:"boss-all",    name:"Eight for eight",    icon:"🏅", reward:1000,desc:"Defeat the boss of all eight modules.",            check: function (s) { return s.moduleBosses >= 8; } },
{ id:"honest",      name:"Unassisted",         icon:"🕊️", reward:250, desc:"Finish a 15-question Module Drill at 100% without opening the reference.", check: function (s) { return s.honestRuns >= 1; } },
{ id:"arcade-1",    name:"Time off",           icon:"🕹️", reward:30,  desc:"Play an arcade game. It pays nothing — that's the point.", check: function (s) { return s.arcadePlayed >= 1; } },

/* ── StudyQuest systems ─────────────────────────────────────────────── */
{ id:"boss-final",  name:"Pens down",          icon:"📜", reward:2000,desc:"Defeat the Final Paper.",                           check: function (s) { return s.finalBoss; } },
{ id:"boss-flawless",name:"Untouched",         icon:"💎", reward:500, desc:"Defeat a boss without taking any damage.",          check: function (s) { return s.flawlessBoss >= 1; } },
{ id:"boss-clutch", name:"By a thread",        icon:"🩸", reward:300, desc:"Defeat a boss with 10% HP or less left.",           check: function (s) { return s.clutchWins >= 1; } },
{ id:"boss-hard",   name:"Selection pressure", icon:"🔥", reward:400, desc:"Defeat a boss on Hard difficulty.",                 check: function (s) { return s.hardWins >= 1; } },
{ id:"boss-night",  name:"Extremophile",       icon:"💀", reward:900, desc:"Defeat a boss on Nightmare difficulty.",            check: function (s) { return s.nightmareWins >= 1; } },
{ id:"boss-4",      name:"Half the syllabus",  icon:"⚔️", reward:400, desc:"Defeat four module bosses.",                        check: function (s) { return s.moduleBosses >= 4; } },
{ id:"prestige-1",  name:"Speciation",         icon:"🔱", reward:2500,desc:"Ascend in Biology for the first time.",             check: function (s) { return s.prestige >= 1; } },
{ id:"prestige-3",  name:"Adaptive radiation", icon:"🌌", reward:5000,desc:"Ascend three times.",                               check: function (s) { return s.prestige >= 3; } },
{ id:"daily-1",     name:"Daily dose",         icon:"☀️", reward:60,  desc:"Complete a Biology daily challenge.",               check: function (s) { return s.dailiesDone >= 1; } },
{ id:"daily-10",    name:"Circadian",          icon:"🌙", reward:400, desc:"Complete ten Biology daily challenges.",            check: function (s) { return s.dailiesDone >= 10; } },
{ id:"quest-1",     name:"Field trip",         icon:"🧭", reward:80,  desc:"Claim a Biology weekly quest.",                     check: function (s) { return s.questsDone >= 1; } },
{ id:"quest-12",    name:"Expedition",         icon:"🗺️", reward:600, desc:"Claim twelve Biology weekly quests.",               check: function (s) { return s.questsDone >= 12; } },
{ id:"cards-500",   name:"Hippocampus",        icon:"🗂️", reward:300, desc:"Grade 500 flashcard reviews.",                      check: function (s) { return s.cardsReviewed >= 500; } },
{ id:"cards-150m",  name:"Consolidated",       icon:"🧠", reward:800, desc:"Get 150 flashcards into the final box.",           check: function (s) { return s.cardsMastered >= 150; } },
{ id:"punnett-100", name:"Mendel himself",     icon:"🫛", reward:600, desc:"Solve 100 Punnett Lab crosses.",                    check: function (s) { return s.punnettSolved >= 100; } },
{ id:"pedigree-40", name:"Genealogist",        icon:"🏛️", reward:600, desc:"Solve 40 pedigrees.",                              check: function (s) { return s.pedigreeSolved >= 40; } },
{ id:"survival-15", name:"Survivor",           icon:"🪨", reward:250, desc:"Survive 15 questions in Survival.",                 check: function (s) { return s.survivalBest >= 15; } },
{ id:"fixed-50",    name:"Immune response",    icon:"🧪", reward:300, desc:"Retire 50 questions from Mistake Rehab.",           check: function (s) { return s.mistakesFixed >= 50; } },
{ id:"modes-all",   name:"Biodiversity",       icon:"🦋", reward:300, desc:"Finish a run in twelve different modes.",           check: function (s) { return s.modesPlayedCount >= 12; } },
{ id:"mastery-gold",name:"Gold standard",      icon:"🥇", reward:500, desc:"Reach Gold mastery (65%) in any module.",           check: function (s) { return s.masteries.some(function (m) { return m >= 65; }); } },
{ id:"mastery-all", name:"Whole organism",     icon:"🌍", reward:1500,desc:"Reach Silver mastery (45%) in all eight modules.",   check: function (s) { return s.masteries.length === 8 && s.masteries.every(function (m) { return m >= 45; }); } },
{ id:"answers-1000",name:"Thousand cuts",      icon:"🔬", reward:400, desc:"Answer 1,000 Biology questions.",                   check: function (s) { return s.answered >= 1000; } }
];

/* Run-shaped achievements (a clean sweep, an unassisted drill) are recorded as
   counters here from the award record, then the factory checks everything.
   Nothing in here pays XP. */
(function (root) {
  "use strict";
  var BIO = root.BIO = root.BIO || {};
  var A = {};

  A.all = function () { return BIO.DATA.achievements.slice(); };
  A.byId = function (id) { return BIO.DATA.achievements.filter(function (a) { return a.id === id; })[0] || null; };

  A.check = function (rec) {
    var S = BIO.State;
    if (rec && rec.accuracy !== null && rec.accuracy >= 0.9 && rec.questions >= 10 && rec.xp > 0) S.bump("cleanSweeps");
    if (rec && rec.mode === "drill" && rec.accuracy === 1 && !rec.refPenalty && rec.questions >= 15 && rec.xp > 0) S.bump("honestRuns");
    var got = S.checkAchievements() || [];
    got.forEach(function (a, i) {
      setTimeout(function () {
        if (SQ.Sound) SQ.Sound.achievement();
        SQ.UI.toast({ icon: a.icon, kind: "good", ms: 3400,
          text: "<b>" + SQ.U.escapeHtml(a.name) + "</b> unlocked" + (a.reward ? " · +" + a.reward + " ◉" : "") });
      }, 600 + i * 800);
    });
    return got.map(function (a) { return a.id; });
  };

  A.progress = function () {
    var S = BIO.State, total = BIO.DATA.achievements.length;
    var have = BIO.DATA.achievements.filter(function (a) { return S.has(a.id); }).length;
    return { have: have, total: total };
  };

  BIO.Achievements = A;
})(typeof window !== "undefined" ? window : globalThis);
