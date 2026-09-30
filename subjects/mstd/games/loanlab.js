/* ============================================================================
   loanlab.js — 💰 Loan Lab (§5). The Titration Lab translation, and Standard 2's
   best possible version of it: a slider, a curve, an end condition, then the
   exact maths.

   Drag the repayment and watch the balance curve bend. Land the payoff inside
   the target window, then do the calculation exactly. The reference app's
   titration sim was its most-praised mode, and this is the same shape.

   §9.9 is load-bearing here. The titration sim randomised concentrations and
   volumes independently and generated titres past the burette's capacity — an
   unanswerable question the user hit in normal play. So this lab picks the
   TERM and the RATE first, derives the exact repayment from them, and only then
   sets the slider range around that answer. The target is always reachable.
   ========================================================================== */
window.MS = window.MS || {};
window.MS.Games = window.MS.Games || {};
(function () {
  'use strict';
  var MS = window.MS, U = MS.U, UI = MS.UI, State = MS.State, M = MS.Money, D = MS.Draw, Audio = MS.Audio, FX = MS.FX;

  var ROUNDS = 3;

  MS.Games.loanlab = function () {
    var pool = UI.pool();
    var round = 0, ended = false, startedAt = Date.now(), passed = 0;

    var scoreChip = UI.chip('0/' + ROUNDS);
    var shell = UI.gameShell('💰 Loan Lab', {
      sub: 'Amortisation',
      meta: [scoreChip],
      backTo: '/play',
      help: 'Drag the repayment slider until the loan clears in the target term — watch the curve bend as you go. A repayment barely above the monthly interest never clears the loan at all, which the curve shows you immediately. Once you are inside the window, do the exact calculation.'
    });
    UI.onLeave(function () { ended = true; });
    var host = U.el('.stack');
    U.add(shell.body, host);

    function next() {
      if (ended) return;
      if (round >= ROUNDS) { finish(); return; }
      round++;

      /* ---- §9.9: answer first ------------------------------------------- */
      var principal = U.randInt(12, 90) * 5000;              // $60k – $450k
      var annual = U.pick([0.048, 0.054, 0.06, 0.066, 0.072, 0.078]);
      var r = annual / 12;
      var years = U.pick([10, 15, 20, 25]);
      var months = years * 12;
      var exact = M.repayment(M.c(principal), r, months);     // cents — the answer
      var interestOnly = Math.round(M.c(principal) * r);      // the "never clears" floor

      /* The slider spans a window around the exact repayment, floored above
         interest-only so every position on the slider is a loan that behaves.  */
      var lo = Math.max(interestOnly + 100, Math.round(exact * 0.55));
      var hi = Math.round(exact * 1.9);
      var current = Math.round((lo + hi) / 2);

      var tolMonths = 6;                                      // within half a year
      var locked = false;
      var attempts = 0;
      var shownAt = Date.now();

      U.clear(host);
      var info = U.el('.card', [
        U.el('.spread', [
          U.el('.tiny.dim', 'Loan ' + round + ' of ' + ROUNDS),
          U.el('.tiny.dim', '💰 Reducing balance')
        ]),
        U.el('.qtext', { html: U.mathHtml(U.money$(principal) + ' borrowed at ' + U.round(annual * 100, 2) + '% p.a. compounded monthly.') }),
        U.el('.sub', 'Find the monthly repayment that clears it in exactly ' + years + ' years (' + months + ' months).')
      ]);
      var figHost = U.el('.card.tight');
      var ctrl = U.el('.card');
      U.add(host, [info, figHost, ctrl]);

      var readout = U.el('.stack');
      var slider = U.el('input', {
        type: 'range', min: String(lo), max: String(hi), step: '50', value: String(current),
        'aria-label': 'monthly repayment'
      });
      var fine = U.el('.row', [
        U.el('button.btn.sm', { onclick: function () { nudge(-500); } }, '−$5'),
        U.el('button.btn.sm', { onclick: function () { nudge(-50); } }, '−50c'),
        U.el('button.btn.sm', { onclick: function () { nudge(50); } }, '+50c'),
        U.el('button.btn.sm', { onclick: function () { nudge(500); } }, '+$5')
      ]);
      var lockBtn = U.el('button.btn.pri.wide', { onclick: lock }, '🔒 Lock in this repayment');
      U.add(ctrl, [readout, slider, fine, lockBtn]);

      slider.addEventListener('input', function () {
        current = Number(slider.value);
        Audio.throttled('slide', 40);
        draw();
      });
      function nudge(byCents) {
        current = U.clamp(current + byCents, lo, hi);
        slider.value = String(current);
        Audio.play('tapSoft');
        draw();
      }

      function draw() {
        var periods = M.periodsToClear(M.c(principal), r, current);
        var clears = isFinite(periods);
        var shownPeriods = clears ? periods : months * 2;
        var series = M.balanceCurve(M.c(principal), r, current, Math.min(shownPeriods + 6, months * 2));
        var inWindow = clears && Math.abs(periods - months) <= tolMonths;

        U.clear(figHost);
        var w = Math.min(316, Math.max(280, window.innerWidth - 44));
        var made = D.make(w, 200, 'fig');
        D.curve(made.ctx, w, 200, {
          series: series, hi: principal, target: 0,
          colour: inWindow ? made.P.good : clears ? made.P.accent : made.P.bad,
          xlab: 'months', P: made.P
        });
        made.canvas.setAttribute('role', 'img');
        made.canvas.setAttribute('aria-label', 'balance falling over ' + (clears ? periods + ' months' : 'never clearing'));
        U.add(figHost, U.el('.center', made.canvas));

        U.clear(readout);
        U.add(readout, [
          U.el('.spread', [
            U.el('span.sub', 'Monthly repayment'),
            U.el('strong.big', M.fmt(current))
          ]),
          U.el('.spread', [
            U.el('span.tiny.dim', 'Interest in month 1'),
            U.el('strong.mono', M.fmt(interestOnly))
          ]),
          U.el('.spread', [
            U.el('span.tiny.dim', 'Clears in'),
            U.el('strong' + (inWindow ? '.good' : clears ? '' : '.bad'),
                 clears ? periods + ' months (' + U.round(periods / 12, 1) + ' years)' : 'never — the interest outruns it')
          ]),
          U.el('.spread', [
            U.el('span.tiny.dim', 'Target'),
            U.el('strong.dim', months + ' months ± ' + tolMonths)
          ]),
          U.el('.bar' + (inWindow ? '.good' : ''), U.el('i', {
            style: { width: U.clamp(100 - Math.abs((clears ? periods : months * 2) - months) / months * 100, 2, 100) + '%' }
          })),
          U.el('.tiny' + (inWindow ? '.good' : '.dim'), inWindow
            ? '✓ Inside the window. Lock it in.'
            : clears ? (periods > months ? 'Too slow — raise the repayment.' : 'Too fast — lower the repayment.')
                     : 'Below the monthly interest, the balance grows. No repayment schedule can clear it.')
        ]);
      }

      function lock() {
        if (ended || locked) return;
        attempts++;
        var periods = M.periodsToClear(M.c(principal), r, current);
        var inWindow = isFinite(periods) && Math.abs(periods - months) <= tolMonths;
        if (!inWindow) {
          Audio.play('outTol');
          FX.shake(5);
          pool.wrongAnswer(1);
          UI.toast(isFinite(periods) ? 'Clears in ' + periods + ' months — not within ' + tolMonths + ' of ' + months : 'That never clears the loan', 'bad', 2200);
          draw();
          return;
        }
        locked = true;
        Audio.play('lock');
        Audio.play('inTol');
        FX.confetti(34);
        pool.right(2, Date.now() - shownAt, UI.readMs(info.textContent));
        State.bump('labsPassed');
        slider.disabled = true;
        lockBtn.disabled = true;
        stageExact();
      }

      /* -------------------------------- stage 2: now do it exactly ------- */
      function stageExact() {
        var factor = M.pvFactor(r, months);
        var card = U.el('.card', [
          U.el('strong', '🧮 Now the exact calculation'),
          U.el('.sub', 'The slider got you close. The exam wants the number.'),
          U.el('.why', { html: U.mathHtml('Rate per period r = \\frac{' + U.round(annual * 100, 2) + '\\%}{12} = ' + U.round(r, 6) + ', and n = ' + years + ' × 12 = ' + months + ' periods. Principal = repayment × PV factor.') }),
          U.el('.row', [UI.chip('PV factor = ' + U.round(factor, 4), 'acc')])
        ]);
        var fld = UI.numberField({ label: 'Exact monthly repayment ($)', hint: 'To the nearest cent.', money: true });
        var go = U.el('button.btn.pri.wide', { onclick: function () { grade(fld); } }, 'Submit');
        U.add(card, [fld.node, go]);
        U.add(host, card);
        fld.input.focus();
        UI.keys({ Enter: function () { go.click(); } });
        card.scrollIntoView({ block: 'nearest' });

        function grade(f) {
          if (ended) return;
          var raw = f.input.value;
          if (!String(raw).trim()) { Audio.play('refused'); UI.toast('Type the repayment', 'warn'); return; }
          /* A cent either way — banks and textbooks disagree at that level. */
          var right = U.numClose(raw, M.d(exact), { tolAbs: 0.02 });
          f.input.disabled = true;
          f.input.classList.add(right ? 'ok' : 'no');
          if (right) {
            passed++;
            var gained = pool.right(3, 9999, 0);
            Audio.play('correct');
            var c = FX.centreOf(f.input);
            FX.burst(c.x, c.y, null, 16);
            FX.floatText('+' + gained, c.x, c.y);
          } else {
            pool.wrongAnswer(3);
            Audio.play('wrong');
          }
          State.answer(null, right, 'MS-F5', 9999);
          scoreChip.textContent = passed + '/' + ROUNDS;
          var sched = M.schedule(M.c(principal), r, exact, months);
          U.add(card, U.el('.stack', { style: { marginTop: '10px' } }, [
            U.el('.spread', [
              U.el('strong' + (right ? '.good' : '.bad'), right ? '✓ Correct' : '✗ Not quite'),
              U.el('.chip' + (right ? '.good' : '.bad'), M.fmt(exact))
            ]),
            U.el('.why', { html: U.mathHtml('Repayment = \\frac{' + U.commas(principal) + '}{' + U.round(factor, 4) + '} = ' + M.fmt(exact) + ' per month. Over ' + months + ' months that is ' + M.fmt(sched.totalPaid) + ' paid in total, of which ' + M.fmt(sched.totalInterest) + ' is interest — ' + U.round(sched.totalInterest / M.c(principal) * 100, 0) + '% of what was borrowed.') }),
            UI.table({
              head: ['Month', 'Opening', 'Interest', 'Repayment', 'Closing'],
              rows: sched.rows.slice(0, 3).map(function (row) {
                return [String(row.n), M.fmt(row.opening), M.fmt(row.interest), M.fmt(row.payment), M.fmt(row.closing)];
              }).concat([['…', '', '', '', ''],
                         [String(months), M.fmt(sched.rows[months - 1].opening), M.fmt(sched.rows[months - 1].interest), M.fmt(sched.rows[months - 1].payment), M.fmt(sched.rows[months - 1].closing)]])
            }),
            U.el('.tiny.dim', 'Interest is rounded to the cent EVERY month. Rounding once at the end gives a different balance after ' + years + ' years.'),
            U.el('button.btn.pri.wide', { onclick: next }, round >= ROUNDS ? 'See results →' : 'Next loan →')
          ]));
          card.scrollIntoView({ block: 'nearest' });
        }
      }

      draw();
    }

    function finish() {
      if (ended) return;
      ended = true;
      var acc = pool.accuracy();
      State.bump('playSecs', Math.round((Date.now() - startedAt) / 1000));
      if (pool.wrong === 0 && passed === ROUNDS) State.bump('perfect');
      var res = UI.award({ xp: pool.xp, bonus: 150, coins: passed * 22, accuracy: acc,
        answered: pool.answered(), mode: 'loanlab', node: scoreChip });
      State.recordScore('loanlab', passed);
      State.progressDaily('loanlab', passed);
      UI.results({
        title: 'Lab complete',
        accuracy: acc,
        rows: [
          ['Loans solved exactly', passed + ' / ' + ROUNDS],
          ['XP earned', U.commas(res.xp)],
          ['Credits', '+' + res.coins]
        ],
        note: 'The curve is the intuition; the PV factor is the mark. A repayment just above the monthly interest takes decades — that flat curve is worth remembering.',
        backTo: '/play',
        again: function () { UI.go(UI.path()); }
      });
    }

    next();
  };
})();
