/* ============================================================================
   play.js — the game-mode menu. Thirteen study modes, the boss ladder and the
   arcade, with level gates on the heavier ones.
   ========================================================================== */
window.MS = window.MS || {};
window.MS.Screens = window.MS.Screens || {};
(function () {
  'use strict';
  var MS = window.MS, U = MS.U, UI = MS.UI, State = MS.State, Bank = MS.Bank, Audio = MS.Audio;

  /* star:true marks the modes where Standard 2 is a genuinely better fit than
     the reference app's chemistry equivalent (§5) — those lead the list. */
  var MODES = [
    { to: '/game/rapid',   ic: '⚡', nm: 'Rapid Fire',       ds: '2 minutes, endless questions, streak to ×3', lv: 1 },
    { to: '/game/drill',   ic: '🎯', nm: 'Topic Drill',      ds: '15 adaptive questions, no clock', lv: 1 },
    { to: '/game/crunch',  ic: '🔢', nm: 'Calculation Crunch', ds: 'Generated problems — never runs out', lv: 1, star: true },
    { to: '/game/display', ic: '📊', nm: 'Read the Display', ds: 'Box plots, histograms, scatterplots', lv: 2, star: true },
    { to: '/game/trek',    ic: '📋', nm: 'Table Trek',       ds: 'Annuity tables, against the clock', lv: 3, star: true },
    { to: '/game/chain',   ic: '📏', nm: 'Unit Chain',       ds: 'Convert through a chain, watch units cancel', lv: 3, star: true },
    { to: '/game/pairs',   ic: '🃏', nm: 'Match Pairs',      ds: 'Concentration: formulae, units, definitions', lv: 2 },
    { to: '/game/panic',   ic: '⏱️', nm: 'Conversion Panic', ds: 'Fill the grid before the clock runs out', lv: 4 },
    { to: '/game/critpath', ic: '🕸️', nm: 'Critical Path',   ds: 'Build the network, scan it, find the path', lv: 5, star: true },
    { to: '/game/loanlab', ic: '💰', nm: 'Loan Lab',         ds: 'Drag the repayment, bend the balance curve', lv: 5, star: true },
    { to: '/game/bearings', ic: '🧭', nm: 'Bearings Lab',    ds: 'Plot a radial survey, then find its area', lv: 6, star: true },
    { to: '/game/survival', ic: '💀', nm: 'Survival',        ds: 'One life, tightening clock', lv: 7 },
    { to: '/game/rehab',   ic: '🩹', nm: 'Mistake Rehab',    ds: 'Only what you have got wrong before', lv: 1 }
  ];
  MS.Screens.MODES = MODES;

  MS.Screens.play = function (root) {
    var lvl = State.level();

    /* ------------------------------------------------ question tier picker
       Front and centre on the mode menu, not buried in Settings, because the
       whole point is that you can drop to easier questions the moment you find
       a topic hard. */
    var tierRow = U.el('.switch');
    State.TIER_ORDER.forEach(function (k) {
      var t = State.TIERS[k];
      U.add(tierRow, U.el('button' + (State.tierKey() === k ? '.on' : ''), {
        onclick: function () {
          State.setTier(k);
          Audio.play('toggle');
          UI.toast(t.ic + ' ' + t.nm + ' — ' + t.ds, 'acc', 2800);
          UI.handleRoute();
        }
      }, t.ic + ' ' + t.nm));
    });
    var tier = State.tier();
    var reach = Bank.tierCount(), all = Bank.totalCount();

    var head = U.el('.card', [
      U.el('.spread', [
        U.el('strong', '🎮 Game modes'),
        UI.chip('Lv ' + lvl)
      ]),
      U.el('.hr'),
      U.el('.spread', [
        U.el('.tiny.dim', 'Question level'),
        U.el('.tiny.dim', U.commas(reach) + ' of ' + U.commas(all) + ' questions in reach')
      ]),
      tierRow,
      U.el('.tiny.dim', { style: { marginTop: '6px' } }, tier.ds + ' ' + tier.note),
      U.el('.hr'),
      U.el('.tiny.dim', 'Difficulty: ' + State.difficulty().icon + ' ' + State.difficulty().name + ' — ' + State.difficulty().desc +
        ' (that is the clock and the XP; the question level above is which questions you see. Change it in the Shop.)')
    ]);

    var starred = MODES.filter(function (m) { return m.star; });
    var rest = MODES.filter(function (m) { return !m.star; });

    var grid = U.el('.tiles');
    rest.concat(starred).sort(function (a, b) { return a.lv - b.lv; }).forEach(function (m) {
      var locked = lvl < m.lv;
      var mistakes = m.to === '/game/rehab' ? Bank.mistakeQuestions().length : null;
      var empty = m.to === '/game/rehab' && mistakes < 4;
      var best = State.bestScore(m.to.split('/').pop());
      U.add(grid, U.el('button.tile' + (locked || empty ? '.lock' : '') + (m.star ? '.star' : ''), {
        onclick: function () {
          if (locked) { Audio.play('refused'); UI.toast('🔒 Unlocks at level ' + m.lv, 'warn'); return; }
          if (empty) { Audio.play('refused'); UI.toast('Get a few questions wrong first — then come back', 'warn', 2400); return; }
          Audio.play('tap');
          UI.go(m.to);
        }
      }, [
        U.el('.ic', locked ? '🔒' : m.ic),
        U.el('.nm', m.nm),
        U.el('.ds', locked ? 'Unlocks at level ' + m.lv : empty ? 'Nothing to rehab yet' : m.ds),
        best ? U.el('.tiny.dim', 'Best: ' + best) : null
      ]));
    });

    var bossCard = U.el('.card', [
      U.el('.spread', [
        U.el('strong', '💀 Boss fights'),
        UI.chip(Object.keys(State.data.bossesBeaten).filter(function (k) { return k !== 'final'; }).length + '/5 beaten')
      ]),
      U.el('.sub', 'Five HP duels, each with a gimmick. Beat one to unlock the next; all five open The Final Paper.'),
      U.el('button.btn.pri.wide', { onclick: function () { UI.go('/bosses'); } }, 'Enter the ladder →')
    ]);

    var arcadeCard = U.el('.card', [
      U.el('strong', '🕹️ Arcade'),
      U.el('.sub', 'The arcade is shared by every subject now, and paid in Stars. It still pays no XP, no Credits and no achievements — only a high score.'),
      U.el('button.btn.wide', { onclick: function () { UI.go('/arcade'); } }, 'Open the arcade →')
    ]);

    U.add(root, [head, grid, bossCard, arcadeCard]);
  };
})();
