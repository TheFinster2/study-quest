/* ============================================================================
   rehab.js — 🩹 Mistake Rehab. Only questions you have previously missed,
   worst first. The pool shrinks as you stop missing them, which is the point.
   ========================================================================== */
window.MS = window.MS || {};
window.MS.Games = window.MS.Games || {};
(function () {
  'use strict';
  var MS = window.MS, U = MS.U, UI = MS.UI, State = MS.State, Bank = MS.Bank;

  MS.Games.rehab = function (root) {
    var pool = Bank.mistakeQuestions();
    if (pool.length < 4) {
      U.add(root, U.el('.card', [
        U.el('strong', '🩹 Mistake Rehab'),
        U.el('.sub', 'Nothing to rehab yet — you need at least 4 questions you have got wrong. Play a few rounds and come back.'),
        U.el('button.btn.pri.wide', { onclick: function () { UI.go('/game/rapid'); } }, 'Play Rapid Fire →')
      ]));
      return;
    }
    var queue = pool.slice(0, 15).map(Bank.shuffleChoices);
    var i = 0;
    var startCount = pool.length;

    MS.Games.quiz({
      title: '🩹 Mistake Rehab',
      sub: startCount + ' in the pool',
      mode: 'rehab',
      limit: queue.length,
      supply: function () { return queue[i++]; },
      bonus: 130,
      backTo: '/play',
      help: 'Only questions you have missed before, worst first. Getting one right does not remove it from the pool immediately — it has to earn its way out.',
      onEnd: function () {
        var left = Bank.mistakeQuestions().length;
        if (left < startCount) UI.toast('Pool down to ' + left, 'good');
      },
      note: 'A question graduates out of this pool once you have answered it right two more times than wrong. One lucky guess does not count as having learned it.'
    });
  };
})();
