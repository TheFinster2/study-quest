/* Dev presets for the app's developer menu (#/dev): ECON.devActions.

   Everything writes to State DIRECTLY and never through award() — if a debug
   button went through the reward path, "the bad bot earns 0 XP" would stop
   being a property of the app. The app stamps the save as dev-unlocked; the
   Economics slot is flagged too, and Progress says so. */
(function (root) {
  "use strict";
  var ECON = root.ECON, U = ECON.U, S = ECON.State;

  function setLevel(n) {
    var d = S.data;
    d.level = Math.min(S.MAX_LEVEL, n); d.xpIntoLevel = 0;
    var t = 0; for (var i = 1; i < d.level; i++) t += S.xpNeeded(i);
    d.xp = t; d.lifetimeXp = Math.max(d.lifetimeXp || 0, t);
  }
  function flag() { S.data.devUnlocked = true; S.save(); }
  function soon(days) { var t = new Date(); t.setDate(t.getDate() + days); return U.dayKey(t); }

  ECON.devActions = [
    { label: "Max everything", run: function () {
      setLevel(S.MAX_LEVEL);
      S.data.coins = 500000;
      ECON.DATA.shop.themes.forEach(function (t) { if (!S.ownsTheme(t.id)) SQ.Store.data.owned.themes.push(t.id); });
      ECON.DATA.shop.avatars.forEach(function (a) { if (!S.ownsAvatar(a.emoji)) SQ.Store.data.owned.avatars.push(a.emoji); });
      ECON.DATA.achievements.forEach(function (a) { S.data.achievements[a.id] = Date.now(); });
      ECON.Boss.BOSSES.forEach(function (b) { S.data.bossesBeaten[b.id] = Date.now(); });
      ECON.Bank.all("mcq").forEach(function (q) { S.data.seen[q.id] = { n: 3, wrong: 0, last: Date.now() }; });
      ECON.Bank.diagrams().forEach(function (d) { S.data.diagramSeen[d.id] = Date.now(); });
      S.data.stats.calcSolved = 120; S.data.stats.shiftsSolved = 60; S.data.scores.survival = 42; S.data.stats.runs = 250;
      S.data.mistakes = [];
      flag(); return "Economics maxed";
    } },
    { label: "Rich but unskilled", run: function () { S.data.coins = 500000; flag(); } },
    { label: "Mid-year student", run: function () {
      setLevel(22); S.data.xpIntoLevel = 400; S.data.coins = 8000;
      var all = ECON.Bank.all("mcq");
      U.sample(all, Math.floor(all.length * 0.55)).forEach(function (q, i) {
        S.data.seen[q.id] = { n: 1 + (i % 3), wrong: i % 5 === 0 ? 1 : 0, last: Date.now() - i * 3600000 };
        if (i % 5 === 0 && !S.isMissed(q.id)) S.data.mistakes.push({ id: q.id, mod: q.mod, topic: q.topic, misses: 1, n: 1, ts: Date.now() });
      });
      U.sample(ECON.Bank.all("card"), 45).forEach(function (c, i) {
        S.data.srs[c.id] = { box: 1 + (i % 5), reps: 1 + (i % 4), lapses: i % 7 === 0 ? 1 : 0, due: soon((i % 3) - 1), last: soon(-1) };
      });
      S.data.stats.runs = 60;
      ["hand", "shock"].forEach(function (b) { S.data.bossesBeaten[b] = Date.now(); });
      flag();
    } },
    { label: "Everything due", run: function () {
      ECON.Bank.all("card").forEach(function (c) { S.data.srs[c.id] = { box: 3, reps: 4, lapses: 0, due: soon(-1), last: soon(-4) }; });
      flag();
    } },
    { label: "Big rehab pool", run: function () {
      U.sample(ECON.Bank.all("mcq"), 40).forEach(function (q) {
        S.data.seen[q.id] = { n: 2, wrong: 2, last: Date.now() };
        if (!S.isMissed(q.id)) S.data.mistakes.push({ id: q.id, mod: q.mod, topic: q.topic, misses: 2, n: 2, ts: Date.now() });
      });
      flag();
    } },
    { label: "Unlock every boss", run: function () {
      ECON.Bank.all("mcq").forEach(function (q) { if (!S.data.seen[q.id]) S.data.seen[q.id] = { n: 1, wrong: 0, last: Date.now() }; });
      ECON.Boss.BOSSES.forEach(function (b) { if (b.id !== "final") S.data.bossesBeaten[b.id] = S.data.bossesBeaten[b.id] || Date.now(); });
      flag();
    } },
    { label: "Four leeches", run: function () {
      ECON.Bank.all("card").slice(0, 4).forEach(function (c) { S.data.srs[c.id] = { box: 1, reps: 6, lapses: 5, due: soon(0), last: soon(-1) }; });
      flag();
    } },
    { label: "Clear short-answer day lock", run: function () { S.data.shortLog = {}; flag(); } }
  ];
})(typeof window !== "undefined" ? window : globalThis);
