/* ============================================================================
   boss.js — 💀 the five HP duels plus The Final Paper (§5).

   One engine, five gimmicks, all declared as data in js/data/bosses.js:
     heal            The Taxman heals 10% every third question
     grow            Compound's HP grows 6% between turns — slow play is punished
     rotate          The Surveyor rotates the answer options every 3 seconds
     randomPowerups  Sigma randomises which power-ups are available each turn
     turnLimit       The Critical Path gives you a fixed number of turns
     exam            The Final Paper: 25 questions, three lives, no gimmick

   Rewards still go through UI.award(), so a boss cannot pay more than the
   economy allows and cannot skip the accuracy gate.
   ========================================================================== */
window.MS = window.MS || {};
window.MS.Games = window.MS.Games || {};
(function () {
  'use strict';
  var MS = window.MS, U = MS.U, UI = MS.UI, State = MS.State, Bank = MS.Bank, Audio = MS.Audio, FX = MS.FX;

  MS.Games.bossById = function (id) {
    for (var i = 0; i < MS.BOSSES.length; i++) if (MS.BOSSES[i].id === id) return MS.BOSSES[i];
    return null;
  };
  /* Unlock rule: beat one to unlock the next; all five unlock The Final Paper. */
  MS.Games.bossUnlocked = function (boss) {
    var list = MS.BOSSES.filter(function (b) { return !b.final; });
    if (boss.final) return list.every(function (b) { return State.bossBeaten(b.id); });
    var idx = list.indexOf(boss);
    if (idx <= 0) return State.level() >= boss.lv;
    return State.bossBeaten(list[idx - 1].id) && State.level() >= boss.lv;
  };

  MS.Games.boss = function (root, params) {
    var boss = MS.Games.bossById(params.id);
    if (!boss) { UI.go('/bosses'); return; }
    if (!MS.Games.bossUnlocked(boss)) {
      U.add(root, U.el('.card', [
        U.el('strong', '🔒 ' + boss.nm + ' is locked'),
        U.el('.sub', boss.final ? 'Beat all five bosses to unlock The Final Paper.' : 'Beat the previous boss and reach level ' + boss.lv + '.'),
        U.el('button.btn.pri.wide', { onclick: function () { UI.go('/bosses'); } }, 'Back to the ladder')
      ]));
      return;
    }

    var pool = UI.pool();
    var maxHp = boss.hp, hp = boss.hp;
    var lives = boss.yourHp, turns = boss.turns || 0, turnsUsed = 0;
    var qNum = 0, ended = false, startedAt = Date.now();
    var rotateTimer = 0, perTimer = 0;
    var allowed = null;                       // Sigma's per-turn power-up lottery

    var supply = Bank.stream(boss.mods ? { mod: boss.mods } : {});

    /* ------------------------------------------------------------- chrome */
    var face = U.el('.bossface', boss.face);
    var hpBar = U.el('.bosshp', U.el('i', { style: { width: '100%' } }));
    var hpText = U.el('.tiny.dim');
    var heartRow = U.el('.hearts');
    var turnChip = boss.gimmick === 'turnLimit' ? UI.chip(boss.turns + ' turns left', 'warn') : null;
    var timerBar = U.el('.bar.warn', U.el('i', { style: { width: '100%' } }));

    var shell = UI.gameShell(boss.face + ' ' + boss.nm, {
      sub: boss.final ? 'The Final Paper' : boss.mods.join(' · '),
      meta: [UI.chip(boss.gimmickShort || gimmickShort(boss), 'bad'), turnChip].filter(Boolean),
      backTo: '/bosses',
      help: boss.gimmickDs,
      onQuit: function () {
        if (qNum === 0) { UI.go('/bosses'); return; }
        UI.confirmDialog('Flee the fight?', 'You forfeit the run and keep only the XP earned so far.', function () { finish('flee'); });
      }
    });
    var arena = U.el('.card', [
      U.el('.center', face),
      U.el('.bossbar', [hpBar, U.el('.spread', [hpText, heartRow])])
    ]);
    var qHost = U.el('.card');
    var powerRow = U.el('.row', { style: { justifyContent: 'center' } });
    U.add(shell.body, [arena, qHost, powerRow]);

    UI.onLeave(function () {
      ended = true;
      if (rotateTimer) clearInterval(rotateTimer);
      if (perTimer) clearInterval(perTimer);
    });

    function gimmickShort(b) {
      return { heal: 'Heals every 3rd', grow: 'HP grows', rotate: 'Options rotate',
               randomPowerups: 'Power-up lottery', turnLimit: 'Limited turns', exam: '25 questions' }[b.gimmick] || 'Gimmick';
    }

    function syncBars() {
      hpBar.firstChild.style.width = U.clamp(100 * hp / maxHp, 0, 100) + '%';
      hpText.textContent = Math.max(0, Math.round(hp)) + ' / ' + Math.round(maxHp) + ' HP';
      heartRow.textContent = '❤️'.repeat(Math.max(0, lives)) || '💀';
      if (turnChip) turnChip.textContent = Math.max(0, turns - turnsUsed) + ' turns left';
    }
    syncBars();

    /* --------------------------------------------------------- power-ups */
    function rollAllowed() {
      /* Sigma: a random subset each turn (§5). Everything else: all of them. */
      if (boss.gimmick !== 'randomPowerups') { allowed = null; return; }
      var owned = Object.keys(State.POWERUPS).filter(function (k) { return State.powerupCount(k) > 0; });
      allowed = U.sample(owned, Math.max(1, Math.floor(owned.length / 2)));
      if (owned.length) UI.toast('🎲 Sigma allows: ' + (allowed.length ? allowed.join(', ') : 'nothing') + ' this turn', 'warn', 2000);
    }
    function renderPowerups(ctl, q) {
      U.clear(powerRow);
      if (boss.final) { U.add(powerRow, U.el('.tiny.dim', 'No power-ups in The Final Paper.')); return; }
      [['fifty', '✂️'], ['skip', '⏭️'], ['insight', '💡'], ['boost', '⚡'], ['buffer', '🛡️']].forEach(function (p) {
        var k = p[0], n = State.powerupCount(k);
        if (!n) return;
        if ((k === 'fifty' || k === 'skip') && !State.powerupsAllowed()) return;
        if (allowed && allowed.indexOf(k) < 0) return;
        U.add(powerRow, U.el('button.btn.sm.ghost', {
          onclick: function () {
            if (k === 'fifty') { if (State.usePowerup(k)) { ctl.fifty(q.a); Audio.play('fifty'); } }
            else if (k === 'skip') { if (State.usePowerup(k)) { Audio.play('skip'); pool.skip(); nextQ(); } }
            else if (k === 'insight') { if (State.usePowerup(k)) { Audio.play('insight'); UI.toast('💡 ' + hint(q), 'warn', 4000); } }
            else if (k === 'boost') { if (State.usePowerup(k)) { pool.boost = 2; Audio.play('boost'); UI.toast('⚡ Double XP', 'good'); } }
            else if (k === 'buffer') { UI.toast('🛡️ Buffer is automatic — it absorbs your next wrong answer', 'acc', 2200); }
            renderPowerups(ctl, q);
          }
        }, p[1] + ' ' + n));
      });
    }
    function hint(q) {
      var t = U.mathText(q.why || '');
      var m = /^[^.]{6,140}\./.exec(t);
      return m ? m[0] : t.slice(0, 130);
    }

    /* -------------------------------------------------------------- rounds */
    function nextQ() {
      if (ended) return;
      if (boss.final && qNum >= 25) { finish('survived'); return; }
      if (boss.gimmick === 'turnLimit' && turnsUsed >= turns) { Audio.play('bossLose'); finish('outOfTurns'); return; }

      var q = supply();
      if (!q) { finish('empty'); return; }
      q = Bank.shuffleChoices(q);
      qNum++;
      rollAllowed();

      U.clear(qHost);
      U.add(qHost, U.el('.spread', [
        U.el('.tiny.dim', boss.final ? 'Question ' + qNum + ' of 25' : 'Question ' + qNum),
        U.el('.tiny.dim', boss.gimmick === 'exam' ? Bank.topicIcon(q.mod) + ' ' + Bank.topicName(q.mod)
          : boss.id === 'compound' ? '📈 growing' : Bank.topicIcon(q.mod) + ' ' + Bank.topicName(q.mod))
      ]));
      U.add(qHost, UI.questionBlock(q));
      U.add(qHost, timerBar);

      var ctl = UI.choiceBlock({
        q: q,
        onPick: function (idx, node, ms, minMs) { answer(q, ctl, idx, node, ms, minMs); }
      });
      U.add(qHost, ctl.node);
      renderPowerups(ctl, q);

      /* -- per-question clock ------------------------------------------- */
      var per = Math.round(boss.perQuestion * State.timeScale());
      var left = per;
      if (perTimer) clearInterval(perTimer);
      perTimer = setInterval(function () {
        if (ended) return;
        left -= 0.1;
        timerBar.firstChild.style.width = U.clamp(100 * left / per, 0, 100) + '%';
        if (left <= 0) { clearInterval(perTimer); answer(q, ctl, -1, null, 99999, 0); }
      }, 100);

      /* -- The Surveyor rotates the options every 3 seconds -------------- */
      if (rotateTimer) clearInterval(rotateTimer);
      if (boss.gimmick === 'rotate') {
        rotateTimer = setInterval(function () {
          if (ended) return;
          Audio.play('shuffleOpts');
          var parent = ctl.node;
          var kids = U.$$('.choice', parent);
          if (kids.length) parent.appendChild(kids[0]);          // cycle by one
        }, 3000);
      }

      /* -- Compound's HP grows between turns ---------------------------- */
      if (boss.gimmick === 'grow' && qNum > 1) {
        var before = hp;
        hp = Math.min(maxHp * 1.6, hp * 1.06);
        maxHp = Math.max(maxHp, hp);
        if (hp > before + 0.5) {
          Audio.play('bossGrow');
          UI.toast('📈 Compound grew to ' + Math.round(hp) + ' HP', 'bad', 1600);
        }
        syncBars();
      }
    }

    function answer(q, ctl, idx, node, ms, minMs) {
      if (ended) return;
      if (perTimer) clearInterval(perTimer);
      if (rotateTimer) clearInterval(rotateTimer);
      var right = idx === q.a;
      ctl.mark(idx, q.a);
      turnsUsed++;

      if (right) {
        var gained = pool.right(q.diff, ms, minMs);
        var dmg = boss.dmg * (1 + (pool.streak >= 5 ? 0.25 : 0));
        hp -= dmg;
        Audio.play('hitBoss');
        UI.pulse(face, 'hit');
        FX.shake(4);
        if (node) {
          var c = FX.centreOf(node);
          FX.burst(c.x, c.y, null, 12);
          if (gained > 0) FX.floatText('+' + gained, c.x, c.y);
        }
      } else {
        if (State.powerupCount('buffer') > 0 && State.usePowerup('buffer')) {
          Audio.play('shield');
          UI.toast('🛡️ Buffer absorbed that', 'acc');
        } else {
          lives--;
          pool.wrongAnswer(q.diff);
          Audio.play('hitYou');
          FX.shake(9);
        }
      }
      if (q.id) State.recordAnswer(q.id, right, q.mod, ms);
      State.noteStreak(pool.bestStreak);

      /* -- The Taxman claims a deduction every third question ------------ */
      if (boss.gimmick === 'heal' && qNum % 3 === 0 && hp > 0) {
        var healed = Math.min(maxHp - hp, maxHp * 0.1);
        if (healed > 0.5) {
          hp += healed;
          Audio.play('bossHeal');
          UI.toast('🧾 The Taxman claimed a deduction: +' + Math.round(healed) + ' HP', 'bad', 1900);
        }
      }
      syncBars();

      U.add(qHost, UI.whyBlock(q));

      if (hp <= 0) { Audio.play('bossWin'); FX.confetti(90); finish('win'); return; }
      if (lives <= 0) { Audio.play('bossLose'); finish('lose'); return; }
      if (boss.gimmick === 'turnLimit' && turnsUsed >= turns) { Audio.play('bossLose'); finish('outOfTurns'); return; }

      var adv = U.el('button.btn.pri.wide', { onclick: nextQ }, 'Next →');
      U.add(qHost, adv);
      UI.keys({ Enter: function () { adv.click(); } });
      qHost.scrollIntoView({ block: 'nearest' });
    }

    /* -------------------------------------------------------------- finish */
    function finish(reason) {
      if (ended) return;
      ended = true;
      if (perTimer) clearInterval(perTimer);
      if (rotateTimer) clearInterval(rotateTimer);
      var win = reason === 'win' || (reason === 'survived' && lives > 0);
      var acc = pool.accuracy();
      State.bump('playSecs', Math.round((Date.now() - startedAt) / 1000));

      var firstKill = false;
      if (win) firstKill = State.beatBoss(boss.id);

      /* The boss reward rides on top of the run pool and still passes through
         the accuracy gate in UI.award(). */
      var res = UI.award({
        xp: pool.xp + (win ? boss.reward.xp : 0),
        bonus: win ? 200 : 40,
        coins: win ? boss.reward.coins : Math.round(pool.correct * 4),
        accuracy: acc,
        answered: pool.answered(),
        mode: 'boss-' + boss.id,
        node: face
      });
      State.recordScore('boss-' + boss.id, pool.correct);

      var rows = [
        ['Result', win ? 'Victory' : reason === 'outOfTurns' ? 'Out of turns' : reason === 'flee' ? 'Fled' : 'Defeated'],
        ['Questions', pool.answered()],
        ['Correct', pool.correct],
        ['Accuracy', U.pct(pool.correct, Math.max(1, pool.answered()))],
        ['Boss HP left', Math.max(0, Math.round(hp))],
        ['Lives left', Math.max(0, lives)],
        ['XP earned', U.commas(res.xp)],
        ['Credits', '+' + res.coins]
      ];
      if (firstKill) rows.push(['First victory', 'Next boss unlocked']);

      UI.results({
        title: win ? boss.face + ' ' + boss.nm + ' defeated' : boss.nm + ' wins',
        outcome: win ? 'win' : 'loss',           // §H4 — reconcile it with the rank
        accuracy: acc,
        rows: rows,
        note: win
          ? (boss.final ? 'The Final Paper is done. That is the whole course in twenty-five questions.'
                        : firstKill ? boss.blurb + ' The next fight is open.' : 'Beaten again — the unlock was already yours.')
          : boss.gimmickDs,
        backTo: '/bosses',
        again: function () { UI.closeModal(); UI.go('/game/boss/' + boss.id); UI.handleRoute(); }
      });
    }

    /* Intro: the gimmick must be visible BEFORE the fight, not discovered. */
    UI.modal({
      title: boss.face + ' ' + boss.nm,
      sub: boss.blurb,
      body: U.el('.stack', [
        U.el('.why', boss.gimmickDs),
        U.el('.row', [
          UI.chip(boss.hp + ' HP', 'bad'),
          UI.chip(boss.yourHp + ' ' + (boss.yourHp === 1 ? 'life' : 'lives'), 'good'),
          UI.chip(boss.perQuestion + 's per question', 'warn'),
          UI.chip('+' + U.commas(boss.reward.xp) + ' XP', 'acc')
        ]),
        U.el('.tiny.dim', boss.final ? 'Every topic in the course.' : 'Topics: ' + boss.mods.map(Bank.topicName).join(', '))
      ]),
      dismissable: false,
      buttons: [
        { label: 'Fight', pri: true, onclick: function () { Audio.play('bossIntro'); nextQ(); } },
        { label: 'Back out', onclick: function () { UI.go('/bosses'); } }
      ]
    });
  };
})();
