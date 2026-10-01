/* ============================================================================
   rapid.js — ⚡ Rapid Fire. 2 minutes, endless questions, streak multiplier
   to ×3. Also hosts the shared quiz engine that Drill, Survival, Rehab, the
   daily challenge and Read the Display all reuse.
   ========================================================================== */
window.MS = window.MS || {};
window.MS.Games = window.MS.Games || {};
(function () {
  'use strict';
  var MS = window.MS, U = MS.U, UI = MS.UI, State = MS.State, Bank = MS.Bank, Audio = MS.Audio, FX = MS.FX;

  /* ======================================================== the quiz engine
     Every multiple-choice mode is this function with different options. All
     the §9.5 gates live in UI.pool() / UI.award(), so a new mode built on top
     of this cannot accidentally become farmable.

     opts = {
       title, sub, help, mode, backTo,
       supply()     -> next question object (already Bank-shaped), or null to end
       limit        -> stop after N questions (omit for endless)
       seconds      -> countdown (omit for untimed)
       lives        -> stop after N wrong (Survival)
       perQuestion  -> per-question timer in seconds (bosses)
       onAnswer(right, q, ctx), onEnd(summary), decorate(ctx)
       bonus        -> completion bonus before the accuracy gate
       coins        -> coin payout before the 60% scale in UI.award()
     }                                                                       */
  function quiz(opts) {
    var pool = UI.pool();
    var asked = 0, ended = false, wrongCount = 0;
    var seconds = opts.seconds ? Math.round(opts.seconds * State.timeScale()) : 0;
    var timeLeft = seconds;
    var tick = 0, frozen = 0;
    var startedAt = Date.now();

    var timerChip = UI.chip(seconds ? U.fmtTime(seconds) : '∞');
    timerChip.classList.add('timer');
    var scoreChip = UI.chip('0');
    var multChip = UI.chip('×1');
    var livesChip = opts.lives ? UI.chip('❤️'.repeat(opts.lives)) : null;

    var meta = [timerChip, scoreChip, multChip];
    if (livesChip) meta.push(livesChip);

    var shell = UI.gameShell(opts.title, {
      sub: opts.sub, help: opts.help, meta: meta, backTo: opts.backTo,
      onQuit: function () {
        if (asked === 0) { UI.go(opts.backTo || '/play'); return; }
        UI.confirmDialog('Leave now?', 'The run ends here and pays what you have earned so far.', function () { finish('quit'); });
      }
    });

    var qHost = U.el('.card');
    var powerRow = U.el('.row', { style: { justifyContent: 'center' } });
    U.add(shell.body, [qHost, powerRow]);

    /* ---------------------------------------------------------- power-ups */
    var used = { fifty: false, insight: false };
    var currentCtl = null, currentQ = null;
    function renderPowerups() {
      U.clear(powerRow);
      if (!State.powerupsAllowed() && opts.allowPowerups !== true) {
        U.add(powerRow, U.el('.tiny.dim', 'Nightmare mode — no 50/50 or Skip.'));
      }
      [['fifty', '✂️'], ['skip', '⏭️'], ['freeze', '❄️'], ['insight', '💡'], ['double', '✨']].forEach(function (p) {
        var k = p[0], n = State.powerupCount(k);
        if (!n) return;
        if ((k === 'fifty' || k === 'skip') && !State.powerupsAllowed()) return;
        if (k === 'freeze' && !seconds) return;
        var b = U.el('button.btn.sm.ghost', {
          onclick: function () { usePower(k, b); }
        }, p[1] + ' ' + n);
        U.add(powerRow, b);
      });
    }
    function usePower(k, btn) {
      if (k === 'fifty') {
        if (used.fifty || !currentCtl) return;
        if (!State.usePowerup('fifty')) return;
        used.fifty = true;
        currentCtl.fifty(currentQ.a);
        Audio.play('fifty');
      } else if (k === 'skip') {
        if (!currentCtl || !State.usePowerup('skip')) return;
        Audio.play('skip');
        pool.skip();
        next();
        return;
      } else if (k === 'freeze') {
        if (!State.usePowerup('freeze')) return;
        frozen += 10;
        Audio.play('freeze');
        UI.toast('❄️ Clock frozen for 10 s', 'acc');
      } else if (k === 'insight') {
        if (used.insight || !currentQ || !State.usePowerup('insight')) return;
        used.insight = true;
        Audio.play('insight');
        var hint = currentQ.hint || firstSentence(currentQ.why);
        UI.toast('💡 ' + hint, 'warn', 3800);
      } else if (k === 'double') {
        if (!State.usePowerup('double')) return;
        pool.boost = 2;
        Audio.play('boost');
        UI.toast('✨ Double XP for the rest of the run', 'good');
      }
      renderPowerups();
    }
    function firstSentence(s) {
      var t = U.mathText(s || '');
      var m = /^[^.]{4,120}\./.exec(t);
      return m ? m[0] : t.slice(0, 110);
    }

    /* ------------------------------------------------------------- clock */
    if (seconds) {
      tick = setInterval(function () {
        if (ended) return;
        if (frozen > 0) { frozen -= 1; timerChip.textContent = '❄️ ' + U.fmtTime(timeLeft); return; }
        timeLeft -= 1;
        timerChip.textContent = U.fmtTime(timeLeft);
        timerChip.classList.toggle('low', timeLeft <= 10);
        if (timeLeft <= 5 && timeLeft > 0) Audio.play('tickLow');
        if (timeLeft <= 0) { Audio.play('timeUp'); finish('time'); }
      }, 1000);
    }
    /* Teardown is registered with the router, not left to chance (§3.2). */
    UI.onLeave(function () { ended = true; if (tick) clearInterval(tick); if (perTick) clearInterval(perTick); });

    var perTick = 0, perLeft = 0;
    var perBar = null;

    /* ------------------------------------------------------------ rounds */
    function next() {
      if (ended) return;
      if (opts.limit && asked >= opts.limit) { finish('done'); return; }
      var q = opts.supply();
      if (!q) { finish('done'); return; }
      asked++;
      currentQ = q;
      U.clear(qHost);
      used.fifty = false; used.insight = false;

      var counter = U.el('.spread', [
        U.el('.tiny.dim', opts.limit ? 'Question ' + asked + ' of ' + opts.limit : 'Question ' + asked),
        U.el('.tiny.dim', Bank.topicIcon(q.mod) + ' ' + (opts.hideTopic ? '???' : Bank.topicName(q.mod)))
      ]);
      U.add(qHost, [counter, UI.questionBlock(q)]);

      if (opts.perQuestion) {
        perBar = U.el('.bar.warn', U.el('i', { style: { width: '100%' } }));
        U.add(qHost, perBar);
        perLeft = opts.perQuestion;
        if (perTick) clearInterval(perTick);
        perTick = setInterval(function () {
          perLeft -= 0.1;
          perBar.firstChild.style.width = U.clamp(100 * perLeft / opts.perQuestion, 0, 100) + '%';
          if (perLeft <= 0) { clearInterval(perTick); answer(-1, null, 9999, 0); }
        }, 100);
      }

      var ctl = UI.choiceBlock({
        q: q,
        onPick: function (idx, node, ms, minMs) { answer(idx, node, ms, minMs); }
      });
      currentCtl = ctl;
      U.add(qHost, ctl.node);
      if (opts.decorate) opts.decorate({ host: qHost, q: q, ctl: ctl, pool: pool });
      renderPowerups();
    }

    function answer(idx, node, ms, minMs) {
      if (ended) return;
      if (perTick) clearInterval(perTick);
      var right = idx === currentQ.a;
      currentCtl.mark(idx, currentQ.a);

      if (right) {
        var gained = pool.right(currentQ.diff, ms, minMs);
        Audio.play(pool.streak >= 15 ? 'streakMax' : pool.streak >= 5 ? 'streak2' : 'correct');
        if (node) {
          var c = FX.centreOf(node);
          FX.burst(c.x, c.y, null, 12);
          if (gained > 0) FX.floatText('+' + gained, c.x, c.y);
        }
        if (gained === 0 && ms < minMs) UI.toast('Too fast to have read that — no XP', 'warn', 1600);
      } else {
        wrongCount++;
        if (State.powerupCount('shield') > 0 && State.usePowerup('shield')) {
          Audio.play('shield');
          UI.toast('🛡️ Shield absorbed that one', 'acc');
          wrongCount--;
        } else {
          pool.wrongAnswer(currentQ.diff);
          Audio.play('wrong');
          FX.shake(5);
        }
      }
      State.answer(currentQ.id, right, currentQ.mod, ms);
      State.noteStreak(pool.bestStreak);
      scoreChip.textContent = String(pool.correct);
      multChip.textContent = '×' + pool.stepMult();
      if (livesChip) livesChip.textContent = '❤️'.repeat(Math.max(0, opts.lives - wrongCount)) || '💀';

      U.add(qHost, UI.whyBlock(currentQ));
      if (opts.onAnswer) opts.onAnswer(right, currentQ, { pool: pool, wrongCount: wrongCount });

      var advance = U.el('button.btn.pri.wide', {
        onclick: function () {
          if (opts.lives && wrongCount >= opts.lives) { Audio.play('gameOver'); finish('dead'); return; }
          next();
        }
      }, opts.lives && wrongCount >= opts.lives ? 'Game over →' : 'Next →');
      U.add(qHost, advance);
      UI.keys({ Enter: function () { advance.click(); }, ' ': function () { advance.click(); } });
      qHost.scrollIntoView({ block: 'nearest' });
    }

    /* ------------------------------------------------------------ finish */
    function finish(reason) {
      if (ended) return;
      ended = true;
      if (tick) clearInterval(tick);
      if (perTick) clearInterval(perTick);
      var acc = pool.accuracy();
      var perfect = pool.correct > 0 && pool.wrong === 0 && pool.answered() >= (opts.limit || 5);
      if (perfect) State.bump('perfect');
      var secs = Math.round((Date.now() - startedAt) / 1000);
      State.bump('playSecs', secs);

      var res = UI.award({
        xp: pool.xp,
        bonus: opts.bonus == null ? 60 : opts.bonus,
        answered: pool.answered(), pace: { items: pool.answered(), tooFast: pool.fast },
        coins: opts.coins == null ? Math.round(pool.correct * 6) : opts.coins,
        accuracy: acc,
        mode: opts.mode,
        node: scoreChip
      });
      var best = State.recordScore(opts.mode, pool.correct);
      if (best && pool.correct > 0) { Audio.play('newBest'); UI.toast('🏅 New best: ' + pool.correct, 'good'); }
      if (opts.daily !== false) State.progressDaily(opts.mode, pool.correct);

      var rows = [
        ['Correct', pool.correct + ' / ' + pool.answered()],
        ['Accuracy', U.pct(pool.correct, Math.max(1, pool.answered()))],
        ['Best streak', pool.bestStreak],
        ['XP earned', U.commas(res.xp) + (res.mult !== 1 ? ' (×' + U.round(res.mult, 2) + ')' : '')],
        ['Credits', '+' + res.coins]
      ];
      if (pool.fast) rows.push(['Skipped as too fast', pool.fast]);
      if (res.bonus) rows.push(['Completion bonus', '+' + res.bonus + ' XP']);
      else if (opts.bonus !== 0 && acc < UI.MIN_BONUS_ACCURACY) rows.push(['Completion bonus', 'withheld — under 50%']);
      if (res.streakBonus) rows.push(['Day streak bonus', '+' + res.streakBonus + ' XP']);

      if (opts.onEnd) opts.onEnd({ pool: pool, accuracy: acc, reason: reason, res: res });

      UI.results({
        title: reason === 'time' ? 'Time!' : reason === 'dead' ? 'Out of lives' : 'Run complete',
        outcome: reason === 'dead' ? 'loss' : null,     // §H4
        accuracy: acc, rows: rows, backTo: opts.backTo || '/play',
        again: function () { UI.go(UI.path()); },
        note: perfect ? 'Perfect run. That counts towards the weekly quest.' : opts.note
      });
    }

    next();
    return { finish: finish, pool: pool };
  }
  MS.Games.quiz = quiz;

  /* ============================================================ Rapid Fire */
  MS.Games.rapid = function () {
    var supply = Bank.stream({});
    quiz({
      title: '⚡ Rapid Fire',
      sub: '2 minutes',
      mode: 'rapid',
      seconds: 120,
      supply: supply,
      bonus: 80,
      help: 'Two minutes, as many questions as you can. Every 5 correct in a row lifts the multiplier, up to ×3. Wrong answers cost XP, so a wild guess is worse than a pause. Keys <kbd>1</kbd>–<kbd>4</kbd> answer, <kbd>Enter</kbd> advances.'
    });
  };
})();
