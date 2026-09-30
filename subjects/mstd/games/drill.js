/* ============================================================================
   drill.js — 🎯 Topic Drill. 15 adaptive questions from one topic, no clock.
   Thin wrapper on the shared quiz engine in rapid.js.
   ========================================================================== */
window.MS = window.MS || {};
window.MS.Games = window.MS.Games || {};
(function () {
  'use strict';
  var MS = window.MS, U = MS.U, UI = MS.UI, State = MS.State, Bank = MS.Bank, Audio = MS.Audio;

  MS.Games.drillPick = function (root) {
    U.add(root, U.el('.card', [
      U.el('strong', '🎯 Topic Drill'),
      U.el('.sub', '15 adaptive questions, no clock. The draw favours questions you have missed and topics you are weak in.')
    ]));
    U.add(root, U.el('.card.tight', U.el('.spread', [
      U.el('.tiny.dim', 'Question level: ' + State.tier().ic + ' ' + State.tier().nm),
      U.el('button.btn.sm.ghost', { onclick: function () { UI.go('/play'); } }, 'change')
    ])));

    var byYear = [11, 12];
    byYear.forEach(function (yr) {
      var list = Bank.TOPICS.filter(function (t) { return t.yr === yr && Bank.filter({ mod: t.code, allTiers: true }).length > 0; });
      if (!list.length) return;
      U.add(root, U.el('.card.tight', U.el('.spread', [
        U.el('strong', yr === 11 ? 'Year 11' : 'Year 12'),
        U.el('.tiny.dim', list.length + ' topics')
      ])));
      var grid = U.el('.tiles.one');
      list.forEach(function (t) {
        var m = State.masteryFrac(t.code), tier = State.tierOf(m);
        U.add(grid, U.el('button.tile', {
          onclick: function () { Audio.play('tap'); UI.go('/game/drill/' + t.code); }
        }, [
          U.el('.spread', [
            U.el('div', [
              U.el('.nm', t.ic + ' ' + t.nm),
              U.el('.ds', t.code + ' · ' + Bank.tierCount(t.code) + ' of ' + Bank.totalCount(t.code) + ' questions at this level')
            ]),
            U.el('.chip.' + tier.cls, tier.ic)
          ]),
          U.el('.bar', U.el('i', { style: { width: Math.round(m * 100) + '%' } }))
        ]));
      });
      U.add(root, grid);
    });
  };

  MS.Games.drill = function (root, params) {
    var code = params.topic;
    var topic = Bank.topic(code);
    if (!topic) { UI.go('/game/drill'); return; }
    var queue = Bank.draw(15, { mod: code }).map(Bank.shuffleChoices);
    if (!queue.length) {
      U.add(root, U.el('.card', [
        U.el('strong', 'Nothing to drill yet'),
        U.el('.sub', 'No questions are loaded for ' + code + '.'),
        U.el('button.btn.pri.wide', { onclick: function () { UI.go('/game/drill'); } }, 'Pick another topic')
      ]));
      return;
    }
    var i = 0;
    MS.Games.quiz({
      title: topic.ic + ' ' + topic.nm,
      sub: code,
      mode: 'drill',
      limit: queue.length,
      backTo: '/game/drill',
      supply: function () { return queue[i++]; },
      bonus: 120,
      help: '15 questions drawn from ' + topic.nm + ', weighted towards the ones you have missed before. No clock — read the whole stem.',
      onEnd: function (s) {
        if (s.accuracy >= 0.8) State.bump('perfect', 0);
      },
      note: 'Mastery is confidence-weighted: it needs about 25 questions in a topic before it will read as mastered.'
    });
  };

  /* StudyQuest upgrade: practise bookmarked questions. Pays like Topic Drill. */
  MS.Games.bookmarks = function (root) {
    var ids = (State.data.bookmarks || []).filter(function (id) { return !!Bank.byId(id); });
    if (!ids.length) { UI.go('/study/bookmarks'); return; }
    var queue = U.shuffle(ids).slice(0, 15).map(Bank.byId).map(Bank.shuffleChoices);
    var i = 0;
    MS.Games.quiz({
      title: '🔖 Bookmarks', sub: queue.length + ' saved', mode: 'bookmarks',
      limit: queue.length, backTo: '/study/bookmarks',
      supply: function () { return queue[i++]; },
      bonus: 120, daily: false,
      help: 'The questions you saved with 🏷️ Save. No clock.'
    });
  };
})();
