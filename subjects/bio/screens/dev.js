/* Biosphere's dev presets, as StudyQuest dev actions (the app's #/dev lists them).

   Everything here writes to State DIRECTLY and never through UI.award(): award()
   is the one reward path and the thing tests/subjects/bio/exploit.js measures.
   Any save touched here is flagged devUnlocked, and Progress says so. */
(function (root) {
  "use strict";
  var BIO = root.BIO, U = BIO.U, S = BIO.State;

  function setLevel(n) {
    var d = S.data;
    d.level = Math.min(S.MAX_LEVEL, n); d.xpIntoLevel = 0;
    d.xp = S.totalXpForLevel(d.level);
    d.lifetimeXp = Math.max(d.lifetimeXp || 0, d.xp);
  }
  function seeAll(frac) {
    var all = BIO.Bank.all("mcq");
    U.sample(all, Math.floor(all.length * frac)).forEach(function (q, i) {
      S.data.seen[q.id] = { n: 1 + (i % 3), wrong: i % 5 === 0 && frac < 1 ? 1 : 0, last: Date.now() - i * 3600000 };
      if (i % 5 === 0 && frac < 1) S.data.missed[q.id] = { n: 1, last: Date.now() };
    });
  }
  function apply(fn) {
    return function () {
      fn();
      S.data.devUnlocked = true;
      SQ.Store.data.devUnlocked = true;
      S.emit(); S.flush();
      if (SQ.UI.context() === "bio") SQ.UI.handleRoute();
    };
  }

  BIO.devActions = [
    { label: "Bio: max everything", run: apply(function () {
      setLevel(S.MAX_LEVEL);
      S.data.coins = 500000;
      var owned = SQ.Store.data.owned;
      BIO.DATA.shop.themes.forEach(function (t) { if (owned.themes.indexOf(t.id) < 0) owned.themes.push(t.id); });
      BIO.DATA.shop.avatars.forEach(function (a) { if (owned.avatars.indexOf(a.emoji) < 0) owned.avatars.push(a.emoji); });
      BIO.DATA.achievements.forEach(function (a) { S.data.achievements[a.id] = Date.now(); });
      (BIO.DATA.bosses || []).forEach(function (b) { S.data.bossesBeaten[b.id] = Date.now(); });
      seeAll(1);
      BIO.Bank.diagrams().forEach(function (d) { S.data.diagramSeen[d.id] = Date.now(); });
      Object.assign(S.data.stats, { punnettSolved: 120, pedigreeSolved: 60, survivalBest: 42 });
      Object.keys(SQ.Store.data.inventory).forEach(function (k) { SQ.Store.data.inventory[k] = 25; });
      S.data.runs = 250;
      S.data.missed = {};
    }) },
    { label: "Bio: rich but unskilled", run: apply(function () { S.data.coins = 500000; }) },
    { label: "Bio: mid-year student", run: apply(function () {
      setLevel(22);
      S.data.coins = 8000;
      seeAll(0.55);
      var cards = BIO.Bank.all("card");
      U.sample(cards, Math.floor(cards.length * 0.4)).forEach(function (c, i) {
        var due = new Date(); due.setDate(due.getDate() + (i % 3) - 1);
        S.data.srs[c.id] = { box: 1 + (i % 5), due: U.dayKey(due.getTime()), reps: 1 + (i % 4), lapses: i % 7 === 0 ? 1 : 0 };
      });
      S.data.runs = 60;
      ["M1", "M2", "M3"].forEach(function (m) { S.data.bossesBeaten["b-" + m] = Date.now(); });
    }) },
    { label: "Bio: unlock every boss", run: apply(function () {
      BIO.Bank.all("mcq").forEach(function (q) { if (!S.data.seen[q.id]) S.data.seen[q.id] = { n: 1, wrong: 0, last: Date.now() }; });
    }) },
    { label: "Bio: everything due", run: apply(function () {
      var y = new Date(); y.setDate(y.getDate() - 1);
      BIO.Bank.all("card").forEach(function (c) { S.data.srs[c.id] = { box: 3, due: U.dayKey(y.getTime()), reps: 4, lapses: 0 }; });
    }) },
    { label: "Bio: big rehab pool", run: apply(function () {
      U.sample(BIO.Bank.all("mcq"), 40).forEach(function (q) {
        S.data.seen[q.id] = { n: 2, wrong: 2, last: Date.now() };
        S.data.missed[q.id] = { n: 2, last: Date.now() };
      });
    }) },
    { label: "Bio: five leeches", run: apply(function () {
      BIO.Bank.all("card").slice(0, 5).forEach(function (c) { S.data.srs[c.id] = { box: 1, due: U.dayKey(), reps: 6, lapses: 5 }; });
    }) },
    { label: "Bio: clear short-answer day lock", run: apply(function () { S.data.shortLog = {}; }) },
    { label: "Bio: reset bosses", run: apply(function () { S.data.bossesBeaten = {}; S.data.bossBest = {}; }) }
  ];
})(typeof window !== "undefined" ? window : globalThis);
