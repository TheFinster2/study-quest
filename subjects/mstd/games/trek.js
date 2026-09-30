/* ============================================================================
   trek.js — 📋 Table Trek (§5). Standard-only, and non-negotiable per §4.3.

   NESA examines annuities by having the student read a factor out of a
   periods × rate grid and multiply. An app that only teaches the closed-form
   formula produces a student who can compute the right number and still cannot
   answer the exam question. So this mode drills the exam skill directly: find
   the cell, then use it.

   Two stages per round: TAP the right cell in the real table, then USE the
   factor. The formula is shown afterwards as the cross-check, never instead.
   ========================================================================== */
window.MS = window.MS || {};
window.MS.Games = window.MS.Games || {};
(function () {
  'use strict';
  var MS = window.MS, U = MS.U, UI = MS.UI, State = MS.State, M = MS.Money, Audio = MS.Audio, FX = MS.FX;

  var ROUNDS = 6;
  var SECONDS = 40;                     // per round, scaled by difficulty

  MS.Games.trek = function () {
    var A = MS.ANNUITY;
    var pool = UI.pool();
    var round = 0, ended = false, startedAt = Date.now();
    var found = 0, used = 0;

    var timerChip = UI.chip('—');
    timerChip.classList.add('timer');
    var scoreChip = UI.chip('0/' + ROUNDS);
    var shell = UI.gameShell('📋 Table Trek', {
      sub: 'Annuity tables',
      meta: [timerChip, scoreChip],
      backTo: '/play',
      help: 'Rows are the number of PERIODS, columns the rate PER PERIOD. A loan at 6% p.a. compounded monthly uses the 0.5% column and counts periods in months — that conversion is where most marks are lost. Tap the right cell, then use the factor.'
    });
    var host = U.el('.stack');
    U.add(shell.body, host);

    var tick = 0;
    UI.onLeave(function () { ended = true; if (tick) clearInterval(tick); });

    function startClock(secs, onOut) {
      var left = Math.round(secs * State.timeScale());
      timerChip.textContent = U.fmtTime(left);
      if (tick) clearInterval(tick);
      tick = setInterval(function () {
        if (ended) return;
        left--;
        timerChip.textContent = U.fmtTime(left);
        timerChip.classList.toggle('low', left <= 8);
        if (left <= 3 && left > 0) Audio.play('tickLow');
        if (left <= 0) { clearInterval(tick); Audio.play('timeUp'); onOut(); }
      }, 1000);
    }

    /* ------------------------------------------------------- round builder */
    function next() {
      if (ended) return;
      if (round >= ROUNDS) { finish(); return; }
      round++;
      /* §9.9: choose the CELL first, then build a scenario that needs it. */
      var kind = Math.random() < 0.5 ? 'fv' : 'pv';
      var ri = U.randInt(0, A.rates.length - 1);
      var pi = U.randInt(2, A.periods.length - 1);
      var rate = A.rates[ri], periods = A.periods[pi];
      var factor = MS.annuityFactor(kind, periods, rate);
      var amount = U.randInt(4, 60) * 50;
      var scenario = buildScenario(kind, rate, periods, amount, ri);
      var target = kind === 'fv' ? amount * factor : amount * factor;

      stageFind();

      /* ------------------------------------------ stage 1: find the cell */
      function stageFind() {
        U.clear(host);
        U.add(host, U.el('.card', [
          U.el('.spread', [
            U.el('.tiny.dim', 'Round ' + round + ' of ' + ROUNDS),
            U.el('.tiny.dim', '📋 ' + (kind === 'fv' ? 'Future value' : 'Present value') + ' table')
          ]),
          U.el('.qstem', { html: U.mathHtml(scenario.stem) }),
          U.el('.qtext', 'Tap the interest factor you need.'),
          U.el('.row', [
            UI.chip(scenario.periodsLabel, 'acc'),
            UI.chip(scenario.rateLabel, 'acc')
          ])
        ]));
        U.add(host, U.el('.card.tight', [
          U.el('.tiny.dim', { style: { marginBottom: '6px' } },
            (kind === 'fv' ? 'Future value' : 'Present value') + ' of $1 per period'),
          buildTable(kind, function (p, r, cell) { pickCell(p, r, cell); })
        ]));
        startClock(SECONDS, function () { onFindResult(false, null); });
      }

      function pickCell(p, r, cell) {
        if (ended) return;
        if (tick) clearInterval(tick);
        var correct = p === periods && Math.abs(r - rate) < 1e-12;
        cell.classList.add(correct ? 'hit' : 'wrong');
        onFindResult(correct, cell);
      }

      function onFindResult(correct, cell) {
        if (correct) {
          found++;
          State.bump('tablesRead');
          pool.right(2, 9999, 0);
          Audio.play('correct');
          if (cell) { var c = FX.centreOf(cell); FX.burst(c.x, c.y, null, 12); }
        } else {
          pool.wrongAnswer(1);
          Audio.play('wrong');
        }
        U.clear(host);
        U.add(host, U.el('.card', [
          U.el('.spread', [
            U.el('strong' + (correct ? '.good' : '.bad'), correct ? '✓ Right cell' : '✗ Wrong cell'),
            UI.chip(periods + ' periods @ ' + A.rateLabels[ri], correct ? 'good' : 'bad')
          ]),
          U.el('.why', { html: U.mathHtml(scenario.cellWhy + ' The factor is ' + factor.toFixed(4) + '.') }),
          U.el('button.btn.pri.wide', { onclick: stageUse }, 'Now use the factor →')
        ]));
      }

      /* ------------------------------------------ stage 2: use the factor */
      function stageUse() {
        if (ended) return;
        U.clear(host);
        var card = U.el('.card', [
          U.el('.qstem', { html: U.mathHtml(scenario.stem) }),
          U.el('.row', [UI.chip('Factor = ' + factor.toFixed(4), 'acc')]),
          U.el('.qtext', { html: U.mathHtml(scenario.q) })
        ]);
        var fld = UI.numberField({ label: 'Answer in dollars', hint: 'Within 0.1% is accepted.', money: false });
        var go = U.el('button.btn.pri.wide', { onclick: function () { grade(fld); } }, 'Submit');
        U.add(card, [fld.node, go]);
        U.add(host, card);
        fld.input.focus();
        UI.keys({ Enter: function () { go.click(); } });
        startClock(SECONDS, function () { grade(fld, true); });

        function grade(f, timedOut) {
          if (ended) return;
          if (tick) clearInterval(tick);
          var raw = f.input.value;
          if (!timedOut && !String(raw).trim()) { Audio.play('refused'); UI.toast('Type an answer', 'warn'); return; }
          var right = !timedOut && U.numClose(raw, target, { tolRel: 0.001 });
          f.input.disabled = true;
          f.input.classList.add(right ? 'ok' : 'no');
          if (right) {
            used++;
            pool.right(3, 9999, 0);
            Audio.play('correct');
            var c = FX.centreOf(f.input);
            FX.burst(c.x, c.y, null, 14);
          } else {
            pool.wrongAnswer(2);
            Audio.play('wrong');
          }
          State.recordAnswer(null, right, 'MS-F5', 9999);
          scoreChip.textContent = used + '/' + ROUNDS;
          U.add(card, U.el('.stack', { style: { marginTop: '10px' } }, [
            U.el('.spread', [
              U.el('strong' + (right ? '.good' : '.bad'), right ? '✓ Correct' : timedOut ? '✗ Out of time' : '✗ Not quite'),
              U.el('.chip' + (right ? '.good' : '.bad'), U.money$(target))
            ]),
            U.el('.why', { html: U.mathHtml(scenario.why(factor, target)) }),
            U.el('.why', { html: U.mathHtml('Cross-check with the formula: ' +
              (kind === 'fv'
                ? 'FV factor = \\frac{(1+r)^n - 1}{r} = \\frac{(1 + ' + rate + ')^{' + periods + '} - 1}{' + rate + '} = ' + U.round(M.fvFactor(rate, periods), 4)
                : 'PV factor = \\frac{(1+r)^n - 1}{r(1+r)^n} = ' + U.round(M.pvFactor(rate, periods), 4)) +
              ' — the same number the table gave you. Learn both: the exam asks for the table.') }),
            U.el('button.btn.pri.wide', { onclick: next }, round >= ROUNDS ? 'See results →' : 'Next round →')
          ]));
          card.scrollIntoView({ block: 'nearest' });
        }
      }
    }

    /* ------------------------------------------------------ table renderer */
    function buildTable(kind, onPick) {
      var tbl = U.el('table');
      var hr = U.el('tr');
      U.add(hr, U.el('th', 'n'));
      A.rateLabels.forEach(function (l) { U.add(hr, U.el('th', l)); });
      U.add(tbl, U.el('thead', hr));
      var tb = U.el('tbody');
      A[kind].forEach(function (row) {
        var tr = U.el('tr');
        U.add(tr, U.el('td', String(row[0])));
        A.rates.forEach(function (r, i) {
          var td = U.el('td.pick', { onclick: function () { onPick(row[0], r, td); } }, row[i + 1].toFixed(4));
          U.add(tr, td);
        });
        U.add(tb, tr);
      });
      U.add(tbl, tb);
      return U.el('.tblwrap.tall', tbl);
    }

    /* ------------------------------------------------------ scenario text */
    function buildScenario(kind, rate, periods, amount, ri) {
      var perYear = rate === 0.005 ? 12 : rate === 0.01 ? 12 : rate === 0.02 ? 4 : rate === 0.03 ? 4 : 2;
      var annual = rate * perYear;
      var unit = perYear === 12 ? 'month' : perYear === 4 ? 'quarter' : 'half-year';
      var years = U.round(periods / perYear, 3);
      var rateLabel = A.rateLabels[ri] + ' per ' + unit;
      var periodsLabel = periods + ' ' + unit + 's';
      var common = 'That is ' + U.round(annual * 100, 2) + '% p.a. compounded ' +
        (perYear === 12 ? 'monthly' : perYear === 4 ? 'quarterly' : 'half-yearly') +
        ', so the rate per period is ' + A.rateLabels[ri] + ' and there are ' + periods + ' periods.';
      if (kind === 'fv') {
        return {
          stem: U.money$(amount) + ' is paid into a fund at the end of every ' + unit +
            ' for ' + periods + ' ' + unit + 's, earning ' + U.round(annual * 100, 2) + '% p.a. compounded ' +
            (perYear === 12 ? 'monthly' : perYear === 4 ? 'quarterly' : 'half-yearly') + '.',
          q: 'What is the future value of the annuity?',
          periodsLabel: periodsLabel, rateLabel: rateLabel,
          cellWhy: common,
          why: function (f, t) {
            return 'FV = contribution × factor = ' + U.money$(amount) + ' × ' + f.toFixed(4) + ' = ' + U.money$(t) + '.';
          }
        };
      }
      return {
        stem: 'A loan is repaid with ' + U.money$(amount) + ' at the end of every ' + unit +
          ' for ' + periods + ' ' + unit + 's, at ' + U.round(annual * 100, 2) + '% p.a. compounded ' +
          (perYear === 12 ? 'monthly' : perYear === 4 ? 'quarterly' : 'half-yearly') + '.',
        q: 'How much was borrowed?',
        periodsLabel: periodsLabel, rateLabel: rateLabel,
        cellWhy: common,
        why: function (f, t) {
          return 'PV = repayment × factor = ' + U.money$(amount) + ' × ' + f.toFixed(4) + ' = ' + U.money$(t) +
            '. To go the other way — principal to repayment — you DIVIDE by the factor.';
        }
      };
    }

    function finish() {
      if (ended) return;
      ended = true;
      if (tick) clearInterval(tick);
      var acc = pool.accuracy();
      State.bump('playSecs', Math.round((Date.now() - startedAt) / 1000));
      if (pool.wrong === 0) State.bump('perfect');
      var res = UI.award({ xp: pool.xp, bonus: 120, coins: (found + used) * 7, accuracy: acc,
        answered: pool.answered(), mode: 'trek', node: scoreChip });
      State.recordScore('trek', used);
      State.progressDaily('trek', found + used);
      UI.results({
        title: 'Trek complete',
        accuracy: acc,
        rows: [
          ['Cells found', found + ' / ' + ROUNDS],
          ['Factors used correctly', used + ' / ' + ROUNDS],
          ['XP earned', U.commas(res.xp)],
          ['Credits', '+' + res.coins]
        ],
        note: 'The rate per period, not the annual rate, picks the column. Monthly compounding at 6% p.a. is the 0.5% column with n counted in months.',
        backTo: '/play',
        again: function () { UI.closeModal(); MS.Games.trek(); }
      });
    }

    next();
  };
})();
