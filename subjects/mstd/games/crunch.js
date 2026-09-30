/* ============================================================================
   crunch.js — 🔢 Calculation Crunch. Procedurally generated problems with typed
   numeric answers. Standard 2 generates beautifully: almost every topic is a
   formula with plug-in values.

   Answers are checked with U.numClose through the §6.3 parser, so "3/8",
   "0.375", "37.5%", "$1,234.50" and "sqrt(50)" all mark correctly. eval() is
   never involved.
   ========================================================================== */
window.MS = window.MS || {};
window.MS.Games = window.MS.Games || {};
(function () {
  'use strict';
  var MS = window.MS, U = MS.U, UI = MS.UI, State = MS.State, Bank = MS.Bank, Calc = MS.Calc, Audio = MS.Audio, FX = MS.FX;

  var LIMIT = 10;

  MS.Games.crunch = function (root, params) {
    var filterMod = (params && params.topic) || null;
    var pool = UI.pool();
    var asked = 0, ended = false;
    var startedAt = Date.now();
    var current = null, shownAt = 0, minMs = 0;

    var scoreChip = UI.chip('0/' + LIMIT);
    var multChip = UI.chip('×1');
    var shell = UI.gameShell('🔢 Calculation Crunch', {
      sub: filterMod ? filterMod : 'Mixed',
      meta: [scoreChip, multChip],
      backTo: '/play',
      help: 'Type the answer — no options to guess between. Fractions (3/8), percentages (37.5%), dollar amounts ($1,234.50) and sqrt(50) are all accepted. Money must be right to the cent; measurements are accepted within 0.5%. Every problem is generated fresh, so this mode never runs out.'
    });
    UI.onLeave(function () { ended = true; });
    var host = U.el('.card');
    U.add(shell.body, host);

    function next() {
      if (ended) return;
      if (asked >= LIMIT) { finish(); return; }
      asked++;
      var gens = Calc.filter({ mod: filterMod, diffMax: State.level() < 6 ? 2 : 3 });
      if (!gens.length) gens = Calc.GENS;
      current = Calc.make(U.pick(gens));
      shownAt = Date.now();
      minMs = UI.readMs((current.stem || '') + ' ' + current.q);

      U.clear(host);
      U.add(host, U.el('.spread', [
        U.el('.tiny.dim', 'Problem ' + asked + ' of ' + LIMIT),
        U.el('.tiny.dim', Bank.topicIcon(current.mod) + ' ' + current.topic)
      ]));
      U.add(host, UI.questionBlock(current));

      var fld = UI.numberField({
        label: current.units ? 'Answer (' + current.units + ')' : 'Answer',
        hint: current.tol && current.tol.money ? 'Exact to the cent.' : 'Within 0.5% is accepted.',
        money: !!(current.tol && current.tol.money),
        percent: current.units === '%'
      });
      U.add(host, fld.node);

      var row = U.el('.row', { style: { marginTop: '10px' } });
      var submit = U.el('button.btn.pri.grow', { onclick: function () { grade(fld.input.value, fld); } }, 'Submit');
      U.add(row, submit);
      if (current.hint || State.powerupCount('insight')) {
        U.add(row, U.el('button.btn.sm.ghost', {
          onclick: function () {
            if (!State.usePowerup('insight')) { Audio.play('refused'); UI.toast('No Insight power-ups left', 'warn'); return; }
            Audio.play('insight');
            UI.toast('💡 ' + (current.hint || firstStep(current.why)), 'warn', 4200);
          }
        }, '💡'));
      }
      U.add(row, U.el('button.btn.sm.ghost', {
        onclick: function () {
          if (!State.usePowerup('skip')) { Audio.play('refused'); UI.toast('No Skip power-ups left', 'warn'); return; }
          Audio.play('skip'); pool.skip(); next();
        }
      }, '⏭️'));
      U.add(host, row);
      U.add(host, U.el('.kbdhint', { style: { marginTop: '6px' } }, 'Contract: ' + current.contract.steps + ' step' + (current.contract.steps > 1 ? 's' : '') + ' · ' + (current.contract.calculator ? 'calculator assumed' : 'doable by hand')));

      fld.input.focus();
      UI.keys({ Enter: function () { submit.click(); } });
    }

    function firstStep(why) {
      var t = U.mathText(why || '');
      var m = /^[^.]{6,140}\./.exec(t);
      return m ? m[0] : t.slice(0, 120);
    }

    function grade(raw, fld) {
      if (ended || !current) return;
      var ms = Date.now() - shownAt;
      if (!String(raw).trim()) { Audio.play('refused'); UI.toast('Type an answer first', 'warn'); return; }
      var right = U.numClose(raw, current.answer, current.tol);
      fld.input.disabled = true;
      fld.input.classList.add(right ? 'ok' : 'no');

      if (right) {
        var gained = pool.right(current.diff, ms, minMs);
        Audio.play(pool.streak >= 5 ? 'streak2' : 'correct');
        var c = FX.centreOf(fld.input);
        FX.burst(c.x, c.y, null, 14);
        if (gained > 0) FX.floatText('+' + gained, c.x, c.y);
        else UI.toast('Too fast to have read that — no XP', 'warn', 1600);
        State.bump('crunchSolved');
      } else {
        pool.wrongAnswer(current.diff);
        Audio.play('wrong');
        FX.shake(5);
      }
      State.answer(null, right, current.mod, ms);
      State.noteStreak(pool.bestStreak);
      scoreChip.textContent = pool.correct + '/' + LIMIT;
      multChip.textContent = '×' + pool.stepMult();

      U.add(host, U.el('.stack', { style: { marginTop: '10px' } }, [
        U.el('.spread', [
          U.el('strong' + (right ? '.good' : '.bad'), right ? '✓ Correct' : '✗ Not quite'),
          U.el('.chip' + (right ? '.good' : '.bad'), 'Answer: ' + fmtAnswer(current))
        ]),
        UI.whyBlock(current)
      ]));
      var adv = U.el('button.btn.pri.wide', { style: { marginTop: '10px' }, onclick: next }, asked >= LIMIT ? 'See results →' : 'Next problem →');
      U.add(host, adv);
      UI.keys({ Enter: function () { adv.click(); } });
      adv.scrollIntoView({ block: 'nearest' });
    }

    function fmtAnswer(item) {
      if (item.tol && item.tol.money) return U.money$(item.answer);
      var v = U.round(item.answer, 4);
      return U.commas(v) + (item.units ? ' ' + item.units : '');
    }

    function finish() {
      if (ended) return;
      ended = true;
      var acc = pool.accuracy();
      State.bump('playSecs', Math.round((Date.now() - startedAt) / 1000));
      if (pool.wrong === 0 && pool.correct >= LIMIT) State.bump('perfect');
      var res = UI.award({
        xp: pool.xp, bonus: 110, coins: Math.round(pool.correct * 7), answered: pool.answered(),
        accuracy: acc, mode: 'crunch', node: scoreChip
      });
      var best = State.recordScore('crunch', pool.correct);
      State.progressDaily('crunch', pool.correct);
      if (best && pool.correct > 0) { Audio.play('newBest'); UI.toast('🏅 New best: ' + pool.correct, 'good'); }
      UI.results({
        title: 'Crunch complete',
        accuracy: acc,
        rows: [
          ['Solved', pool.correct + ' / ' + pool.answered()],
          ['Best streak', pool.bestStreak],
          ['Skipped', pool.skipped],
          ['XP earned', U.commas(res.xp)],
          ['Credits', '+' + res.coins]
        ],
        note: pool.fast ? pool.fast + ' answer' + (pool.fast === 1 ? '' : 's') + ' came in faster than the question could be read, so they paid nothing.' : null,
        backTo: '/play',
        again: function () { UI.go(UI.path()); }
      });
    }

    next();
  };
})();
