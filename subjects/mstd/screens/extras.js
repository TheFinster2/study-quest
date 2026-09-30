/* ============================================================================
   extras.js — achievements, weekly quests, the daily challenge detail, the
   ascension screen and the boss ladder.
   ========================================================================== */
window.MS = window.MS || {};
window.MS.Screens = window.MS.Screens || {};
(function () {
  'use strict';
  var MS = window.MS, U = MS.U, UI = MS.UI, State = MS.State, Bank = MS.Bank, Audio = MS.Audio, FX = MS.FX;

  /* Weekly quests in NumberCrunch's shape, over the core's weekly state. */
  MS.Screens.questRows = function () {
    return State.weeklyQuests().map(function (e) {
      var q = e.quest;
      return { id: q.id, nm: q.name, ds: q.desc, need: e.target, xp: q.xp, coins: q.coins,
               prog: e.done, done: e.complete, claimed: e.claimed };
    });
  };
  function unlockedOn(v) {
    if (typeof v === 'number') return U.dayKey(new Date(v));
    return String(v);
  }

  /* ========================================================= achievements */
  MS.Screens.achievements = function (root) {
    var defs = MS.ACHIEVEMENTS;
    var d = State.data;
    var unlocked = defs.filter(function (a) { return d.achievements[a.id]; });

    U.add(root, U.el('.card', [
      U.el('.spread', [
        U.el('strong', '🏆 Achievements'),
        UI.chip(unlocked.length + ' / ' + defs.length, unlocked.length ? 'good' : 'dim')
      ]),
      U.el('.bar' + (unlocked.length === defs.length ? '.good' : ''), U.el('i', { style: { width: Math.round(100 * unlocked.length / defs.length) + '%' } })),
      U.el('.tiny.dim', { style: { marginTop: '6px' } }, 'Each one pays Credits the moment it unlocks.')
    ]));

    var filterRow = U.el('.switch');
    var mode = 'all';
    var list = U.el('.stack');
    ['all', 'unlocked', 'locked'].forEach(function (m) {
      U.add(filterRow, U.el('button' + (m === mode ? '.on' : ''), {
        onclick: function () {
          mode = m;
          Audio.play('toggle');
          U.$$('button', filterRow).forEach(function (b) { b.classList.remove('on'); });
          U.$$('button', filterRow).forEach(function (b) { if (b.textContent.toLowerCase() === m) b.classList.add('on'); });
          render();
        }
      }, m.charAt(0).toUpperCase() + m.slice(1)));
    });
    U.add(root, U.el('.card', [filterRow, U.el('.hr'), list]));

    function render() {
      U.clear(list);
      defs.forEach(function (a) {
        var got = !!d.achievements[a.id];
        if (mode === 'unlocked' && !got) return;
        if (mode === 'locked' && got) return;
        var prog = State.achProgress(a);
        U.add(list, U.el('.ach' + (got ? '' : '.locked'), [
          U.el('.ic', got ? a.ic : '🔒'),
          U.el('div', [
            U.el('.nm', a.nm),
            U.el('.ds', a.ds + (got ? ' · ' + unlockedOn(d.achievements[a.id]) : a.stat ? ' · ' + Math.round(prog * 100) + '%' : '')),
            !got && a.stat ? U.el('.bar', { style: { marginTop: '4px', height: '4px' } }, U.el('i', { style: { width: Math.round(prog * 100) + '%' } })) : null
          ]),
          U.el('.chip' + (got ? '.good' : '.dim'), got ? '✓' : '💳' + a.coins)
        ]));
      });
      if (!list.children.length) U.add(list, U.el('.sub.center', 'Nothing here yet.'));
    }
    render();
  };

  /* ========================================================= weekly quests */
  MS.Screens.quests = function (root) {
    var quests = MS.Screens.questRows();
    var wk = State.weekly();

    U.add(root, U.el('.card', [
      U.el('.spread', [
        U.el('strong', '🗓️ Weekly quests'),
        UI.chip(wk.week)
      ]),
      U.el('.sub', 'Three quests, drawn from a pool of twelve by a seeded shuffle of the week number. They change on Monday.')
    ]));

    quests.forEach(function (q) {
      U.add(root, U.el('.card', [
        U.el('.spread', [
          U.el('strong', q.nm),
          UI.chip(q.claimed ? 'Claimed' : q.done ? 'Ready!' : q.prog + '/' + q.need, q.claimed ? 'dim' : q.done ? 'good' : null)
        ]),
        U.el('.sub', q.ds),
        U.el('.bar' + (q.done ? '.good' : ''), U.el('i', { style: { width: U.clamp(100 * q.prog / q.need, 0, 100) + '%' } })),
        U.el('.row', [UI.chip('+' + U.commas(q.xp) + ' XP', 'acc'), UI.chip('+' + q.coins + ' 💳', 'warn')]),
        q.claimed ? U.el('.tiny.dim', 'Done for this week.')
          : q.done ? U.el('button.btn.pri.wide', {
              onclick: function () {
                if (!State.claimQuest(q.id)) return;       // the core pays it
                State.bump('coinsEarned', q.coins);
                Audio.play('questDone');
                FX.confetti(60);
                UI.handleRoute();
              }
            }, '🎁 Claim')
          : U.el('.tiny.dim', 'Progress is measured against a snapshot taken when the week rolled over.')
      ]));
    });

    U.add(root, U.el('.card.tight', U.el('.tiny.dim',
      'Quest progress is derived by diffing your cumulative stats against that snapshot, so nothing can be lost or double-counted.')));
  };

  /* ======================================================= daily challenge */
  MS.Screens.daily = function (root) {
    var spec = State.dailyInfo();
    var dy = State.daily();
    dy.prog = dy.progress;
    var ready = State.dailyReady();

    U.add(root, U.el('.card', [
      U.el('.spread', [
        U.el('strong', '📅 Daily challenge'),
        UI.chip(spec.day)
      ]),
      U.el('.big', spec.nm),
      U.el('.sub', 'Reach ' + spec.target + ' ' + spec.verb + ' in ' + spec.nm + ' today.'),
      U.el('.bar' + (ready ? '.good' : ''), U.el('i', { style: { width: U.clamp(100 * dy.prog / spec.target, 0, 100) + '%' } })),
      U.el('.spread', [
        U.el('.tiny.dim', dy.prog + ' / ' + spec.target),
        U.el('.tiny.dim', dy.claimed ? 'claimed' : ready ? 'ready to claim' : 'in progress')
      ]),
      U.el('.row', [UI.chip('+' + U.commas(spec.xp) + ' XP', 'acc'), UI.chip('+' + spec.coins + ' 💳', 'warn')]),
      dy.claimed ? U.el('.why', 'Back tomorrow — the challenge is derived from the date, so everyone gets the same one.')
        : ready ? U.el('button.btn.pri.wide', {
            onclick: function () {
              if (!State.claimDaily()) return;              // the core pays it
              State.bump('coinsEarned', spec.coins);
              Audio.play('dailyClaim');
              FX.confetti(60);
              UI.handleRoute();
            }
          }, '🎁 Claim reward')
        : U.el('button.btn.pri.wide', { onclick: function () { UI.go('/game/' + spec.mode); } }, 'Play ' + spec.nm + ' →')
    ]));
    U.add(root, U.el('.card.tight', U.el('.tiny.dim',
      'Generated from today\'s date with a seeded PRNG, so it is stable all day and identical for every player.')));
  };

  /* ============================================================== ascension */
  MS.Screens.ascend = function (root) {
    var can = State.canPrestige();
    var d = State.data;
    U.add(root, U.el('.card', [
      U.el('.big', '✦ Ascension'),
      U.el('.sub', can
        ? 'You are at level 60. Ascending resets your level and XP but keeps every unlock, achievement, flashcard box and statistic — and grants a permanent +12% XP that stacks with each ascension.'
        : 'Available at level 60. You are level ' + State.level() + '.'),
      U.el('.hr'),
      U.el('.stack', [
        U.el('.spread', [U.el('span.sub', 'Ascensions so far'), U.el('strong', String(d.prestige || 0))]),
        U.el('.spread', [U.el('span.sub', 'Permanent XP bonus'), U.el('strong', '+' + ((d.prestige || 0) * 12) + '%')]),
        U.el('.spread', [U.el('span.sub', 'After ascending'), U.el('strong', '+' + (((d.prestige || 0) + 1) * 12) + '%')]),
        U.el('.spread', [U.el('span.sub', 'Current level'), U.el('strong', String(State.level()) + ' / 60')])
      ]),
      U.el('.why', { style: { marginTop: '10px' } }, 'Kept: themes, avatars, achievements, flashcard boxes, boss victories and every statistic. Reset: level and XP only. Ascending also pays 2,500 Credits and three Double XP power-ups.'),
      can ? U.el('button.btn.pri.wide', {
        onclick: function () {
          UI.confirmDialog('Ascend now?',
            'Your level goes back to 1 and your XP to zero. Everything else stays, and you keep a permanent +' + (((d.prestige || 0) + 1) * 12) + '% XP.',
            function () {
              if (!State.doPrestige()) return;
              Audio.play('prestige');
              FX.confetti(140);
              UI.toast('✦ Ascended — +12% XP forever', 'good', 3200);
              UI.go('/');
            }, '✦ Ascend');
        }
      }, '✦ Ascend') : U.el('.bar', U.el('i', { style: { width: Math.round(100 * State.level() / 60) + '%' } }))
    ]));
  };

  /* ============================================================ boss ladder */
  MS.Screens.bosses = function (root) {
    var beaten = Object.keys(State.data.bossesBeaten || {}).length;
    U.add(root, U.el('.card', [
      U.el('.spread', [
        U.el('strong', '💀 Boss ladder'),
        UI.chip(beaten + ' beaten', beaten ? 'good' : 'dim')
      ]),
      U.el('.sub', 'Five HP duels, each with one gimmick you can read before you commit. Beat one to unlock the next; all five open The Final Paper.')
    ]));

    MS.BOSSES.forEach(function (b) {
      var won = State.bossBeaten(b.id);
      var open = MS.Games.bossUnlocked(b);
      U.add(root, U.el('.card' + (open ? '' : '.tight'), [
        U.el('.spread', [
          U.el('div', [
            U.el('.big', (open ? b.face : '🔒') + ' ' + b.nm),
            U.el('.sub', b.final ? 'The whole course' : b.mods.map(Bank.topicName).join(' · '))
          ]),
          U.el('.chip' + (won ? '.good' : open ? '.bad' : '.dim'), won ? 'Beaten' : open ? 'Open' : 'Locked')
        ]),
        open ? U.el('.stack', [
          U.el('.why', b.gimmickDs),
          U.el('.row', [
            UI.chip(Math.round(b.hp * (State.difficulty().boss || 1)) + ' HP', 'bad'),
            UI.chip(b.yourHp + (b.yourHp === 1 ? ' life' : ' lives'), 'good'),
            UI.chip(b.perQuestion + 's/question', 'warn'),
            UI.chip('+' + U.commas(b.reward.xp) + ' XP', 'acc')
          ]),
          U.el('button.btn' + (won ? '' : '.pri') + '.wide', {
            onclick: function () { Audio.play('tap'); UI.go('/game/boss/' + b.id); }
          }, won ? '↻ Fight again' : '⚔️ Fight ' + b.nm)
        ]) : U.el('.tiny.dim', b.final ? 'Beat all five bosses to unlock.' : 'Beat the previous boss and reach level ' + b.lv + '.')
      ]));
    });
  };
})();
