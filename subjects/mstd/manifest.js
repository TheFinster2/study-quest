/* Maths Standard (was NumberCrunch, namespace MQ → MS). Script order IS the
   dependency graph: util/notation → content → state → bank/engines → UI → modes
   → screens. */
(function () {
  var B = 'subjects/mstd/';
  var DATA = ['topics', 'q-warmup', 'q-a1', 'q-a2', 'q-m1', 'q-m2', 'q-f1', 'q-s1', 'q-s2', 'q-a4', 'q-m6',
    'q-m7', 'q-f4', 'q-f5', 'q-s4', 'q-s5', 'q-n1', 'q-n2', 'flashcards', 'annuity', 'reference',
    'achievements', 'shop', 'networks', 'pairs', 'bosses'];
  var scripts = ['core/util', 'core/expr', 'core/units', 'core/draw', 'core/audio', 'core/fx']
    .concat(DATA.map(function (f) { return 'data/' + f; }))
    .concat(['core/state', 'core/bank', 'core/money', 'core/net', 'core/figures', 'core/calc', 'core/sheet', 'core/ui',
      'games/rapid', 'games/drill', 'games/survival', 'games/rehab', 'games/pairs', 'games/display', 'games/crunch',
      'games/chain', 'games/panic', 'games/trek', 'games/loanlab', 'games/bearings', 'games/critpath', 'games/boss',
      'screens/home', 'screens/play', 'screens/study', 'screens/progress', 'screens/reference', 'screens/extras',
      'screens/options'])
    .map(function (f) { return B + f + '.js'; });

  var xpNeeded = function (n) { return Math.round(130 * Math.pow(n, 1.5)); };
  var POWERUP_MAP = { fifty: 'fifty', skip: 'skip', freeze: 'freeze', buffer: 'shield', boost: 'double',
                      insight: 'insight', adrenaline: 'double' };

  function boot() {
    var MS = window.MS, UI = MS.UI, S = MS.Screens, G = MS.Games;
    var reg = function (p, fn) { UI.route(p, fn); };

    reg('/', S.home);
    reg('/play', S.play);
    reg('/study', S.study);
    reg('/study/deck/:topic', S.deck);
    reg('/study/leeches', S.leeches);
    reg('/study/bookmarks', S.bookmarks);
    reg('/progress', S.progress);
    reg('/progress/:topic', S.topicDetail);
    reg('/shop', S.shop);
    reg('/reference', S.reference);
    reg('/reference/:id', S.referencePage);
    reg('/options', S.options);
    reg('/achievements', S.achievements);
    reg('/quests', S.quests);
    reg('/daily', S.daily);
    reg('/ascend', S.ascend);
    reg('/bosses', S.bosses);
    reg('/about', S.about);

    reg('/game/rapid', G.rapid);
    reg('/game/drill', G.drillPick);
    reg('/game/drill/:topic', G.drill);
    reg('/game/survival', G.survival);
    reg('/game/rehab', G.rehab);
    reg('/game/bookmarks', G.bookmarks);
    reg('/game/pairs', G.pairs);
    reg('/game/display', G.display);
    reg('/game/crunch', G.crunch);
    reg('/game/crunch/:topic', G.crunch);
    reg('/game/chain', G.chain);
    reg('/game/panic', G.panic);
    reg('/game/trek', G.trek);
    reg('/game/loanlab', G.loanlab);
    reg('/game/bearings', G.bearings);
    reg('/game/critpath', G.critpath);
    reg('/game/boss/:id', G.boss);

    SQ.Tools.registerSheet('mstd', MS.SHEET());

    /* NumberCrunch had no dev presets; these two exist so every mode and boss
       can be reached for testing without grinding. */
    MS.devActions = [
      { label: 'Maths Std: jump to level 40', run: function () {
        var d = MS.State.data; d.level = Math.max(d.level, 40); d.xpIntoLevel = 0; MS.State.emit(); } },
      { label: 'Maths Std: beat the five bosses', run: function () {
        ['taxman', 'compound', 'surveyor', 'sigma', 'critical'].forEach(function (id) { MS.State.data.bossesBeaten[id] = Date.now(); });
        MS.State.emit(); } }
    ];
  }

  /* The stand-alone save (numbercrunch.save.v1) → this slot. */
  function importLegacy(old) {
    old = old || {};
    var xp = Math.max(0, old.xp || 0), level = 1, left = xp;
    while (level < 60 && left >= xpNeeded(level)) { left -= xpNeeded(level); level++; }
    var st = Object.assign({}, old.stats || {});
    st.perfectRuns = st.perfect || 0;
    var modules = {};
    Object.keys(old.topics || {}).forEach(function (c) {
      var t = old.topics[c] || {};
      modules[c] = { seen: t.seen || 0, correct: t.right || 0 };
    });
    var srs = {};
    Object.keys(old.cards || {}).forEach(function (id) {
      var c = old.cards[id] || {};
      srs[id] = { box: c.box || 1, due: c.due || null, reps: 0, lapses: 0, xpDay: c.paid || null };
    });
    var modesPlayed = {}, scores = {};
    Object.keys(old.modes || {}).forEach(function (k) {
      var m = old.modes[k] || {};
      modesPlayed[k] = m.plays || 0;
      if (m.best) scores[k] = m.best;
    });
    var mistakes = [];
    Object.keys(old.q || {}).forEach(function (id) {
      var r = old.q[id];
      if (r && r.w > 0 && r.r < r.w + 2) mistakes.push({ id: id, mod: null, topic: null, misses: r.w, ts: Date.now() });
    });
    var inventory = {};
    Object.keys(old.pow || {}).forEach(function (k) {
      var to = POWERUP_MAP[k];
      if (to && old.pow[k] > 0) inventory[to] = (inventory[to] || 0) + old.pow[k];
    });
    var themes = (old.themes || []).map(function (t) { return 'mstd-' + t; });
    var diff = ['standard', 'hard', 'nightmare'].indexOf(old.difficulty) >= 0 ? old.difficulty : 'standard';
    return {
      slot: {
        xp: xp, level: level, xpIntoLevel: left, coins: old.coins || 0, prestige: old.ascensions || 0,
        lifetimeXp: st.xpEarned || xp, stats: st, modules: modules, topics: JSON.parse(JSON.stringify(modules)),
        q: old.q || {}, srs: srs, mistakes: mistakes.slice(0, 150), achievements: old.ach || {},
        bossesBeaten: old.bosses || {}, modesPlayed: modesPlayed, scores: scores,
        qtier: old.qtier || 'mixed', kbd: old.kbd !== false, seen: old.seen || {},
        settings: { difficulty: diff, theme: old.theme ? 'mstd-' + old.theme : null, hidden: {} }
      },
      inventory: inventory,
      themes: themes,
      avatars: old.avatars || [],
      profile: { name: old.name, avatar: old.avatar }
    };
  }

  SQ.Subjects.manifest('mstd', {
    css: [B + 'css/mstd.css'],
    scripts: scripts,
    boot: boot,
    importLegacy: importLegacy
  });
})();
