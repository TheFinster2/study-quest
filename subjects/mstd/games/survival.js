/* ============================================================================
   survival.js — 💀 Survival. One life, a tightening clock, escalating
   difficulty. Built on the shared quiz engine.
   ========================================================================== */
window.MS = window.MS || {};
window.MS.Games = window.MS.Games || {};
(function () {
  'use strict';
  var MS = window.MS, U = MS.U, UI = MS.UI, State = MS.State, Bank = MS.Bank, Audio = MS.Audio;

  MS.Games.survival = function () {
    var n = 0;
    /* The per-question clock starts generous and closes in; difficulty climbs
       with the run so a long survival is genuinely harder, not just longer. */
    function perQuestion() { return Math.max(7, Math.round(26 - n * 0.9)); }
    function diffCap() { return n < 5 ? 1 : n < 12 ? 2 : 3; }

    var supply = function () {
      n++;
      var pool = Bank.draw(1, { diffMax: diffCap(), diffMin: n > 14 ? 2 : 1 });
      if (!pool.length) pool = Bank.draw(1, {});
      return pool.length ? Bank.shuffleChoices(pool[0]) : null;
    };

    MS.Games.quiz({
      title: '💀 Survival',
      sub: 'One life',
      mode: 'survival',
      lives: 1,
      supply: supply,
      /* The engine reads perQuestion once per question, so recompute it there. */
      get perQuestion() { return perQuestion(); },
      bonus: 100,
      backTo: '/play',
      help: 'One wrong answer ends the run. The per-question clock tightens as you go and the questions get harder. A Buffer power-up absorbs one mistake.',
      onAnswer: function (right) {
        if (right && n % 5 === 0) { Audio.play('survive'); UI.toast('🎖️ ' + n + ' survived', 'good', 1200); }
      },
      note: 'Survival rewards caution: there is no partial credit for a good guess.'
    });
  };
})();
