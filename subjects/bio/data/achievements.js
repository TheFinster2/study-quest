/* Achievements.
   Targets measure against Bank.all(), never Bank.active() — so hiding content
   with a coverage pack can never shorten a collection (brief §8). */
window.BIO = window.BIO || {}; BIO.DATA = BIO.DATA || {};

BIO.DATA.achievements = [
{ id:"first-run",   name:"First light",        desc:"Finish your first run in any mode.",              icon:"🌱" },
{ id:"acc-90",      name:"Clean sweep",        desc:"Finish a run of 10+ questions at 90% or better.", icon:"🎯" },
{ id:"streak-15",   name:"On a roll",          desc:"Reach a 15-answer streak in one run.",            icon:"🔥" },
{ id:"streak-30",   name:"Unbroken",           desc:"Reach a 30-answer streak in one run.",            icon:"⚡" },
{ id:"days-7",      name:"Week of it",         desc:"Study on 7 consecutive days.",                    icon:"📅" },
{ id:"days-30",     name:"Month of it",        desc:"Study on 30 consecutive days.",                   icon:"🗓️" },
{ id:"lv-10",       name:"Level 10",           desc:"Reach level 10.",                                 icon:"⭐" },
{ id:"lv-25",       name:"Level 25",           desc:"Reach level 25.",                                 icon:"🌟" },
{ id:"lv-60",       name:"Apex",               desc:"Reach level 60.",                                 icon:"👑" },
{ id:"seen-100",    name:"Century",            desc:"Answer 100 different questions.",                 icon:"💯" },
{ id:"seen-half",   name:"Halfway through",    desc:"See half of every multiple-choice question in the bank.", icon:"📚" },
{ id:"seen-all",    name:"Completionist",      desc:"See every multiple-choice question in the bank.",  icon:"🏆" },
{ id:"cards-100",   name:"Card shark",         desc:"Review 100 flashcards.",                          icon:"🃏" },
{ id:"cards-box4",  name:"Long-term memory",   desc:"Get 50 flashcards into the final review box.",    icon:"🧠" },
{ id:"diagram-all", name:"Cartographer",       desc:"Complete a Label It round on every diagram.",      icon:"🗺️" },
{ id:"punnett-25",  name:"Mendel's apprentice",desc:"Solve 25 Punnett Lab crosses correctly.",          icon:"🧬" },
{ id:"pedigree-10", name:"Family tree",        desc:"Solve 10 pedigrees correctly.",                    icon:"🌳" },
{ id:"response-20", name:"In your own words",  desc:"Complete 20 Response Builder questions.",          icon:"✍️" },
{ id:"rehab-clear", name:"Nothing left to fix",desc:"Clear your Mistake Rehab pool completely.",        icon:"🩹" },
{ id:"boss-1",      name:"Module master",      desc:"Clear any module boss.",                           icon:"🛡️" },
{ id:"boss-all",    name:"Eight for eight",    desc:"Clear the boss for all eight modules.",            icon:"🏅" },
{ id:"honest",      name:"Unassisted",         desc:"Finish a 15-question run at 100% without opening the reference.", icon:"🕊️" },
{ id:"arcade-1",    name:"Time off",           desc:"Play an arcade game. It pays nothing — that's the point.", icon:"🕹️" }
];

/* Achievement checking lives here rather than in ui.js so that adding an
   achievement never means editing the reward path. */
(function (root) {
  "use strict";
  var BIO = root.BIO = root.BIO || {};
  var A = {};

  A.all = function () { return BIO.DATA.achievements.slice(); };

  A.check = function (rec) {
    var S = BIO.State, U = BIO.U, Bank = BIO.Bank;
    var d = S.data, got = [];

    function win(id) { if (S.unlock(id)) got.push(id); }

    if (d.runs >= 1) win("first-run");
    if (rec && rec.accuracy !== null && rec.accuracy >= 0.9 && rec.questions >= 10) win("acc-90");

    var lv = S.levelFromXp(d.xp).level;
    if (lv >= 10) win("lv-10");
    if (lv >= 25) win("lv-25");
    if (lv >= 60) win("lv-60");

    if ((d.streakDays || 0) >= 7) win("days-7");
    if ((d.streakDays || 0) >= 30) win("days-30");

    var seen = Object.keys(d.seen).length;
    if (seen >= 100) win("seen-100");

    // targets measure against the COMPLETE bank
    var totalMcq = Bank.all("mcq").length;
    var seenMcq = Bank.all("mcq").filter(function (q) { return d.seen[q.id]; }).length;
    if (totalMcq && seenMcq >= Math.ceil(totalMcq / 2)) win("seen-half");
    if (totalMcq && seenMcq >= totalMcq) win("seen-all");

    var cardIds = Object.keys(d.cards);
    if (cardIds.length >= 100) win("cards-100");
    if (cardIds.filter(function (id) { return d.cards[id].box >= S.BOX_DAYS.length - 1; }).length >= 50) win("cards-box4");

    var diagramTotal = Bank.diagrams().length;
    var diagramDone = Object.keys(d.diagramSeen).length;
    if (diagramTotal && diagramDone >= diagramTotal) win("diagram-all");

    if ((d.bests.punnettSolved || 0) >= 25) win("punnett-25");
    if ((d.bests.pedigreeSolved || 0) >= 10) win("pedigree-10");
    if (Object.keys(d.shortLog).length >= 20) win("response-20");

    if (Object.keys(d.missed).length === 0 && seen >= 40) win("rehab-clear");

    var cleared = Object.keys(d.bosses).filter(function (b) { return d.bosses[b].cleared; });
    if (cleared.length >= 1) win("boss-1");
    if (cleared.length >= 8) win("boss-all");

    if (rec && rec.mode === "drill" && rec.accuracy === 1 && rec.refPenalty === 0 && rec.questions >= 15) win("honest");
    if (d.arcade && Object.keys(d.arcade.bests).length >= 1) win("arcade-1");

    got.forEach(function (id) {
      var a = A.byId(id);
      if (!a) return;
      setTimeout(function () {
        BIO.UI.toast(a.icon + "  " + a.name + " unlocked", "good", 2600);
      }, 700);
    });
    return got;
  };

  A.byId = function (id) {
    var list = BIO.DATA.achievements;
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  };

  A.progress = function () {
    var total = BIO.DATA.achievements.length;
    var have = BIO.DATA.achievements.filter(function (a) { return BIO.State.has(a.id); }).length;
    return { have: have, total: total };
  };

  BIO.Achievements = A;
})(typeof window !== "undefined" ? window : globalThis);
