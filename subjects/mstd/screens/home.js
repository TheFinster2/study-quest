/* ============================================================================
   home.js — the landing screen: daily challenge, streak, quick resume, quests.
   ========================================================================== */
window.MS = window.MS || {};
window.MS.Screens = window.MS.Screens || {};
(function () {
  'use strict';
  var MS = window.MS, U = MS.U, UI = MS.UI, State = MS.State, Bank = MS.Bank, Audio = MS.Audio;

  function greet() {
    var h = new Date().getHours();
    if (h < 5) return 'Late one';
    if (h < 12) return 'Morning';
    if (h < 17) return 'Afternoon';
    if (h < 21) return 'Evening';
    return 'Late one';
  }

  MS.Screens.home = function (root) {
    var d = State.data, p = State.levelProgress();
    var prof = SQ.Store.data.profile, streak = SQ.Store.data.streak;

    /* --------------------------------------------------------- hero card */
    var hero = U.el('.card', [
      U.el('.spread', [
        U.el('div', [
          U.el('.big', greet() + ', ' + prof.name),
          U.el('.sub', State.levelTitle(p.level) + ' · ' + (p.need ? U.commas(p.need - p.into) + ' XP to Lv ' + (p.level + 1) : 'Level 60 — ascension available'))
        ]),
        U.el('.huge', prof.avatar)
      ]),
      U.el('.hr'),
      U.el('.row', [
        UI.chip('🔥 ' + (streak.count || 0) + ' day streak', (streak.count || 0) > 0 ? 'warn' : null),
        UI.chip('🎯 ' + U.pct(d.stats.correct, Math.max(1, d.stats.answered)) + ' accuracy'),
        UI.chip('📚 ' + U.commas(d.stats.answered) + ' answered'),
        d.prestige ? UI.chip('✦ ' + d.prestige + ' ascension' + (d.prestige > 1 ? 's' : ''), 'acc') : null
      ])
    ]);

    /* ---------------------------------------------------- daily challenge */
    var spec = State.dailyInfo();
    var dy = State.daily();
    dy.prog = dy.progress;
    var ready = State.dailyReady();
    var daily = U.el('.card', [
      U.el('.spread', [
        U.el('strong', '📅 Daily challenge'),
        UI.chip(dy.claimed ? 'Claimed' : ready ? 'Ready!' : dy.prog + '/' + spec.target, dy.claimed ? 'dim' : ready ? 'good' : null)
      ]),
      U.el('.sub', spec.nm + ' — ' + spec.target + ' ' + spec.verb + '. Same challenge for everyone today.'),
      U.el('.bar' + (ready ? '.good' : ''), U.el('i', { style: { width: U.clamp(100 * dy.prog / spec.target, 0, 100) + '%' } })),
      U.el('.row', [
        UI.chip('+' + U.commas(spec.xp) + ' XP', 'acc'),
        UI.chip('+' + spec.coins + ' 💳', 'warn')
      ]),
      dy.claimed
        ? U.el('.tiny.dim', 'Back tomorrow for a new one.')
        : ready
          ? U.el('button.btn.pri.wide', {
              onclick: function () {
                /* The core pays it (coins at face value, XP through the one pipeline). */
                if (!State.claimDaily()) return;
                State.bump('coinsEarned', spec.coins);
                Audio.play('dailyClaim');
                MS.FX.confetti(60);
                UI.handleRoute();
              }
            }, '🎁 Claim reward')
          : U.el('button.btn.wide', { onclick: function () { UI.go('/game/' + spec.mode); } }, 'Play ' + spec.nm + ' →')
    ]);

    /* ---------------------------------------------------- weekly quests */
    var quests = MS.Screens.questRows();
    var anyReady = quests.some(function (q) { return q.done && !q.claimed; });
    var qCard = U.el('.card', [
      U.el('.spread', [
        U.el('strong', '🗓️ This week'),
        U.el('button.btn.sm.ghost', { onclick: function () { UI.go('/quests'); } }, anyReady ? 'Claim →' : 'All →')
      ]),
      U.el('.stack', quests.map(function (q) {
        return U.el('.stack', { style: { gap: '3px' } }, [
          U.el('.spread', [
            U.el('.tiny', q.nm + (q.claimed ? ' ✓' : '')),
            U.el('.tiny.dim', q.prog + '/' + q.need)
          ]),
          U.el('.bar' + (q.claimed ? '' : q.done ? '.good' : ''), U.el('i', { style: { width: U.clamp(100 * q.prog / q.need, 0, 100) + '%' } }))
        ]);
      }))
    ]);

    /* ------------------------------------------------------ jump back in */
    var weak = State.weakestTopics(Bank.TOPIC_CODES.filter(function (c) { return Bank.filter({ mod: c }).length > 0; }), 1)[0];
    var mistakes = Bank.mistakeQuestions().length;
    var leeches = State.leeches().length;
    var due = MS.CARDS ? State.dueIds(MS.CARDS.map(function (c) { return c.id; })).length : 0;

    var suggest = U.el('.card', [
      U.el('strong', '⚡ Straight in'),
      U.el('.tiles', { style: { marginTop: '8px' } }, [
        tile('⚡', 'Rapid Fire', '2 minutes, mixed topics', '/game/rapid'),
        weak ? tile(Bank.topicIcon(weak), 'Drill ' + Bank.topicName(weak), 'Your weakest topic right now', '/game/drill/' + weak) : null,
        mistakes >= 4 ? tile('🩹', 'Mistake Rehab', mistakes + ' questions you have missed', '/game/rehab') : null,
        due > 0 ? tile('🃏', 'Flashcards', due + ' card' + (due === 1 ? '' : 's') + ' due today', '/study') : null,
        leeches > 0 ? tile('🩸', 'Leeches', leeches + ' card' + (leeches === 1 ? '' : 's') + ' you keep missing', '/study/leeches') : null
      ].filter(Boolean))
    ]);

    var links = U.el('.card.tight', [
      U.el('.row', [
        U.el('button.btn.sm.ghost', { onclick: function () { UI.go('/bosses'); } }, '💀 Bosses'),
        U.el('button.btn.sm.ghost', { onclick: function () { UI.go('/reference'); } }, '📖 Reference'),
        U.el('button.btn.sm.ghost', { onclick: function () { UI.go('/achievements'); } }, '🏆 Achievements'),
        U.el('button.btn.sm.ghost', { onclick: function () { UI.go('/study/bookmarks'); } }, '🔖 Bookmarks'),
        U.el('button.btn.sm.ghost', { onclick: function () { UI.go('/arcade'); } }, '🕹️ Arcade'),
        U.el('button.btn.sm.ghost', { onclick: function () { UI.go('/options'); } }, '⚙️ Maths options')
      ])
    ]);

    U.add(root, [hero, daily, suggest, qCard, links]);

    /* First run: one short orientation modal, never shown again. */
    if (!State.seenOnce('welcome')) {
      UI.modal({
        title: 'Maths Standard',
        sub: 'Mathematics Standard 2, built as a game (this was NumberCrunch). Everything is stored on this device — no account, no signal needed.',
        body: U.el('.stack', [
          U.el('.why', 'Thirteen game modes, five bosses and The Final Paper. A calculator, the Standard 2 reference sheet and a working pad sit in the tool tray during every run. XP comes from getting things right, not from tapping fast — wrong answers cost XP and the completion bonus is withheld below 50% accuracy.'),
          U.el('.tiny.dim', 'Tip: add this to your home screen and it works offline on the train.')
        ]),
        buttons: [{ label: 'Start', pri: true, onclick: function () { UI.go('/play'); } }, { label: 'Look around first' }]
      });
    }
  };

  function tile(ic, nm, ds, to) {
    return U.el('button.tile', { onclick: function () { Audio.play('tap'); UI.go(to); } }, [
      U.el('.ic', ic), U.el('.nm', nm), U.el('.ds', ds)
    ]);
  }
  MS.Screens.tile = tile;
})();
