/* ============================================================================
   progress.js — 📈 stats, mastery per topic, and the honest version of them.
   Mastery is confidence-weighted (§7): accuracy × min(1, seen/25), so a
   perfect 3-question run does not read as mastered.
   ========================================================================== */
window.MS = window.MS || {};
window.MS.Screens = window.MS.Screens || {};
(function () {
  'use strict';
  var MS = window.MS, U = MS.U, UI = MS.UI, State = MS.State, Bank = MS.Bank, D = MS.Draw, Audio = MS.Audio;

  MS.Screens.progress = function (root) {
    var d = State.data, p = State.levelProgress();
    var stats = Bank.statsByTopic();

    /* ---------------------------------------------------------- headline */
    U.add(root, U.el('.card', [
      U.el('.spread', [
        U.el('div', [
          U.el('.big', 'Level ' + p.level + (d.ascensions ? ' ✦' + d.ascensions : '')),
          U.el('.sub', State.levelTitle(p.level))
        ]),
        U.el('.huge', d.avatar)
      ]),
      U.el('.bar', U.el('i', { style: { width: (p.need ? U.clamp(100 * p.into / p.need, 0, 100) : 100) + '%' } })),
      U.el('.spread', [
        U.el('.tiny.dim', p.need ? U.commas(p.into) + ' / ' + U.commas(p.need) + ' XP this level' : 'Level 60 — ascension available'),
        U.el('.tiny.dim', U.commas(d.stats.xpEarned) + ' XP all time')
      ]),
      p.need ? null : U.el('button.btn.pri.wide', { style: { marginTop: '10px' }, onclick: function () { UI.go('/ascend'); } }, '✦ Ascend')
    ]));

    /* ------------------------------------------------------------- numbers */
    var acc = State.overallAccuracy();
    U.add(root, U.el('.card', [
      U.el('strong', '📊 The numbers'),
      U.el('.hr'),
      U.el('.stack', [
        row('Questions answered', U.commas(d.stats.answered)),
        row('Correct', U.commas(d.stats.correct) + ' (' + U.pct(d.stats.correct, Math.max(1, d.stats.answered)) + ')'),
        row('Best answer streak', U.commas(d.stats.bestStreak || 0)),
        row('Day streak', (d.streak.count || 0) + ' (best ' + (d.streak.best || 0) + ')'),
        row('Days studied', U.commas(d.stats.daysActive || 0)),
        row('Games finished', U.commas(d.stats.gamesFinished || 0)),
        row('Perfect runs', U.commas(d.stats.perfect || 0)),
        row('Time played', U.fmtTime(d.stats.playSecs || 0)),
        row('Flashcards reviewed', U.commas(d.stats.cardsReviewed || 0)),
        row('Crunch problems solved', U.commas(d.stats.crunchSolved || 0)),
        row('Unit chains completed', U.commas(d.stats.chainsDone || 0)),
        row('Network puzzles solved', U.commas(d.stats.pathsSolved || 0)),
        row('Lab challenges passed', U.commas(d.stats.labsPassed || 0)),
        row('Annuity table lookups', U.commas(d.stats.tablesRead || 0)),
        row('Bosses beaten', Object.keys(d.bosses || {}).length + ' / ' + MS.BOSSES.length),
        row('Achievements', Object.keys(d.ach || {}).length + ' / ' + MS.ACHIEVEMENTS.length),
        row('Credits earned all time', U.commas(d.stats.coinsEarned || 0))
      ])
    ]));

    /* ------------------------------------------------- mastery bar chart */
    var chart = U.el('.card.tight');
    var withData = stats.filter(function (s) { return s.total > 0; });
    if (withData.length) {
      var w = Math.min(316, Math.max(280, window.innerWidth - 44));
      var h = 40 + withData.length * 22;
      var made = D.make(w, h, 'fig');
      drawMastery(made.ctx, w, h, withData, made.P);
      made.canvas.setAttribute('role', 'img');
      made.canvas.setAttribute('aria-label', 'mastery by topic');
      U.add(chart, [
        U.el('.spread', [U.el('strong', '🎓 Mastery by topic'), U.el('.tiny.dim', 'accuracy × confidence')]),
        U.el('.center', made.canvas),
        U.el('.tiny.dim', 'Confidence-weighted: a topic needs about 25 questions before it can read as mastered.')
      ]);
      U.add(root, chart);
    }

    /* ------------------------------------------------------ topic list */
    [11, 12].forEach(function (yr) {
      var list = stats.filter(function (s) { return s.yr === yr; });
      if (!list.length) return;
      U.add(root, U.el('.card.tight', U.el('.spread', [
        U.el('strong', yr === 11 ? 'Year 11' : 'Year 12'),
        U.el('.tiny.dim', list.length + ' topics')
      ])));
      var grid = U.el('.tiles.one');
      list.forEach(function (s) {
        U.add(grid, U.el('button.tile', {
          onclick: function () { Audio.play('tap'); UI.go('/progress/' + s.code); }
        }, [
          U.el('.spread', [
            U.el('div', [
              U.el('.nm', s.ic + ' ' + s.nm),
              U.el('.ds', s.seen ? s.right + '/' + s.seen + ' correct · ' + U.pct(s.right, s.seen) : 'not started · ' + s.total + ' questions')
            ]),
            U.el('.chip.' + s.tier.cls, s.tier.nm)
          ]),
          U.el('.bar' + (s.mastery >= 0.7 ? '.good' : s.mastery >= 0.45 ? '.warn' : ''), U.el('i', { style: { width: Math.round(s.mastery * 100) + '%' } }))
        ]));
      });
      U.add(root, grid);
    });

    U.add(root, U.el('.card.tight', U.el('.row', [
      U.el('button.btn.sm.ghost', { onclick: function () { UI.go('/achievements'); } }, '🏆 Achievements'),
      U.el('button.btn.sm.ghost', { onclick: function () { UI.go('/quests'); } }, '🗓️ Weekly quests'),
      U.el('button.btn.sm.ghost', { onclick: function () { UI.go('/settings'); } }, '⚙️ Settings')
    ])));
  };

  function row(label, value) {
    return U.el('.spread', [U.el('span.sub', label), U.el('strong.mono', String(value))]);
  }

  function drawMastery(ctx, w, h, list, P) {
    var L = 92, R = 12, T = 10;
    var barH = 14, gap = 8;
    list.forEach(function (s, i) {
      var y = T + i * (barH + gap);
      D.font(ctx, 10);
      ctx.fillStyle = P.dim;
      ctx.textAlign = 'right';
      ctx.fillText(s.code, L - 8, y + barH / 2);
      ctx.textAlign = 'left';
      var full = w - L - R;
      ctx.fillStyle = P.panel2;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(L, y, full, barH, 7); else ctx.rect(L, y, full, barH);
      ctx.fill();
      var val = Math.max(0.008, s.mastery);
      ctx.fillStyle = s.mastery >= 0.9 ? P.good : s.mastery >= 0.7 ? P.accent : s.mastery >= 0.45 ? P.warn : P.bad;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(L, y, full * val, barH, 7); else ctx.rect(L, y, full * val, barH);
      ctx.fill();
      D.font(ctx, 9);
      ctx.fillStyle = P.dim;
      ctx.textAlign = 'right';
      ctx.fillText(Math.round(s.mastery * 100) + '%', w - R - 2, y + barH / 2);
      ctx.textAlign = 'left';
    });
    /* mastery threshold marker */
    var x90 = L + (w - L - R) * 0.9;
    ctx.setLineDash([3, 3]);
    D.line(ctx, x90, T - 2, x90, h - 14, P.good, 1);
    ctx.setLineDash([]);
    D.label(ctx, 'mastered', x90, h - 6, P.good, 9);
  }

  /* ==================================================== topic detail page */
  MS.Screens.topicDetail = function (root, params) {
    var t = Bank.topic(params.topic);
    if (!t) { UI.go('/progress'); return; }
    var rec = State.data.topics[t.code] || { seen: 0, right: 0 };
    var m = State.mastery(t.code), tier = State.masteryTier(m);
    var subs = Bank.subStats(t.code);
    var total = Bank.filter({ mod: t.code }).length;
    var cards = (MS.CARDS || []).filter(function (c) { return c.mod === t.code; });

    U.add(root, U.el('.card', [
      U.el('.spread', [
        U.el('div', [U.el('.big', t.ic + ' ' + t.nm), U.el('.sub', t.code + ' · Year ' + t.yr + ' · ' + t.strand)]),
        U.el('.chip.' + tier.cls, tier.nm)
      ]),
      U.el('.bar' + (m >= 0.7 ? '.good' : ''), U.el('i', { style: { width: Math.round(m * 100) + '%' } })),
      U.el('.spread', [
        U.el('.tiny.dim', Math.round(m * 100) + '% mastery'),
        U.el('.tiny.dim', rec.seen + ' answered of ' + total + ' questions')
      ]),
      U.el('.hr'),
      U.el('.stack', [
        row('Answered', U.commas(rec.seen)),
        row('Correct', U.commas(rec.right) + (rec.seen ? ' (' + U.pct(rec.right, rec.seen) + ')' : '')),
        row('Questions available', U.commas(total)),
        row('Flashcards', U.commas(cards.length)),
        row('Confidence', rec.seen >= 25 ? 'full' : rec.seen + '/25 towards full weighting')
      ]),
      U.el('.row', { style: { marginTop: '10px' } }, [
        U.el('button.btn.pri.grow', { onclick: function () { UI.go('/game/drill/' + t.code); } }, '🎯 Drill this topic'),
        cards.length ? U.el('button.btn.grow', { onclick: function () { UI.go('/study/deck/' + t.code); } }, '🃏 Cards') : null
      ].filter(Boolean))
    ]));

    if (subs.length) {
      U.add(root, U.el('.card', [
        U.el('strong', 'Sub-topics'),
        U.el('.tiny.dim', { style: { marginBottom: '8px' } }, 'Where the marks are actually going.'),
        U.el('.stack', subs.map(function (s) {
          return U.el('.stack', { style: { gap: '3px' } }, [
            U.el('.spread', [
              U.el('.tiny', s.nm),
              U.el('.tiny.dim', s.seen ? s.right + '/' + s.seen : '0/' + s.total + ' seen')
            ]),
            U.el('.bar' + (s.accuracy >= 0.8 ? '.good' : s.accuracy >= 0.5 ? '.warn' : s.seen ? '.bad' : ''),
                 U.el('i', { style: { width: (s.seen ? Math.round(s.accuracy * 100) : 0) + '%' } }))
          ]);
        }))
      ]));
    }

    U.add(root, U.el('.card.tight', U.el('.row', [
      U.el('button.btn.sm.ghost', { onclick: function () { UI.go('/progress'); } }, '‹ All topics'),
      U.el('button.btn.sm.ghost', { onclick: function () { UI.go('/reference'); } }, '📖 Reference')
    ])));
  };
})();
