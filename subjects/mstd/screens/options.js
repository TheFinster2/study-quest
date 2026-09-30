/* ============================================================================
   options.js — the subject-only settings (`options`, since `/settings` is the
   app's), the About page, and the subject shop.

   What moved to the app: name, avatar, sound, volume, motion, export/import,
   reset-everything and the build/refresh card (Settings), power-ups (the
   general shop, paid in Stars) and arcade tickets (the shared arcade).
   ========================================================================== */
window.MS = window.MS || {};
window.MS.Screens = window.MS.Screens || {};
(function () {
  'use strict';
  var MS = window.MS, U = MS.U, UI = MS.UI, State = MS.State, Bank = MS.Bank, Audio = MS.Audio;

  function toggle(label, on, fn) {
    var b = U.el('button.btn.sm' + (on ? '.pri' : ''), { 'aria-pressed': on ? 'true' : 'false',
      onclick: function () { fn(!on); Audio.play('toggle'); UI.handleRoute(); } }, on ? 'On' : 'Off');
    return U.el('.spread', { style: { marginTop: '6px' } }, [U.el('span.sub', label), b]);
  }

  /* ============================================================== options */
  MS.Screens.options = function (root) {
    var d = State.data;

    /* ------------------------------------------------------- question tier */
    var tierRow = U.el('.switch');
    State.TIER_ORDER.forEach(function (k) {
      var t = State.TIERS[k];
      U.add(tierRow, U.el('button' + (State.tierKey() === k ? '.on' : ''), {
        'aria-pressed': State.tierKey() === k ? 'true' : 'false',
        onclick: function () { State.setTier(k); Audio.play('toggle'); UI.toast(t.ic + ' ' + t.nm, 'acc', 2000); UI.handleRoute(); }
      }, t.ic + ' ' + t.nm));
    });
    U.add(root, U.el('.card', [
      U.el('strong', '📚 Question level'),
      U.el('.tiny.dim', { style: { margin: '4px 0 8px' } },
        'Which questions you are shown, in every mode, boss and daily challenge. Separate from difficulty, which changes the clock and the XP.'),
      tierRow,
      U.el('.why', { style: { marginTop: '8px' } },
        State.tier().ic + ' ' + State.tier().nm + ' — ' + State.tier().ds + ' ' + State.tier().note),
      U.el('.stack', { style: { marginTop: '8px' } }, State.TIER_ORDER.map(function (k) {
        var t = State.TIERS[k];
        var lo = t.diffMin || 0, hi = t.diffMax == null ? 3 : t.diffMax;
        var n = Bank.all().filter(function (q) { return q.diff >= lo && q.diff <= hi; }).length;
        return U.el('.spread', [
          U.el('span.tiny' + (State.tierKey() === k ? '.acc' : '.dim'), t.ic + ' ' + t.nm),
          U.el('span.tiny.dim', U.commas(n) + ' questions')
        ]);
      })),
      U.el('.tiny.dim', { style: { marginTop: '6px' } },
        'Foundation questions pay a little less XP than harder ones (×0.6), so working at your own level costs you nothing but grinding the easy band is not a shortcut.')
    ]));

    /* ------------------------------------------------------ difficulty */
    var df = State.difficulty();
    U.add(root, U.el('.card', [
      U.el('strong', '🎚️ Difficulty'),
      U.el('.why', { style: { marginTop: '8px' } }, df.icon + ' ' + df.name + ' — ' + df.desc + ' Current XP multiplier: ×' + U.round(State.xpMultiplier(), 2) +
        (d.prestige ? ' (includes +' + (d.prestige * 12) + '% from ' + d.prestige + ' ascension' + (d.prestige > 1 ? 's' : '') + ')' : '')),
      U.el('button.btn.sm.ghost', { style: { marginTop: '8px' }, onclick: function () { UI.go('/shop'); } }, 'Change it in the Maths Standard shop →')
    ]));

    /* ------------------------------------------------------- coverage */
    var cov = U.el('.stack');
    Bank.TOPICS.forEach(function (t) {
      var on = !State.tagHidden(t.code);
      U.add(cov, toggle(t.ic + ' ' + t.code + ' ' + t.nm, on, function (v) { State.setTagHidden(t.code, !v); }));
    });
    U.add(root, U.el('.card', [
      U.el('strong', '🗂️ Coverage'),
      U.el('.tiny.dim', { style: { margin: '4px 0 8px' } },
        'Hide topics you are not studying yet. Hidden topics drop out of mixed runs, Survival, Crunch and bosses that span several topics. Payouts and achievement targets never change.'),
      cov
    ]));

    /* ------------------------------------------------------- keyboard */
    U.add(root, U.el('.card', [
      U.el('strong', '⌨️ Keyboard'),
      toggle('Keyboard shortcuts', d.kbd !== false, function (on) { d.kbd = on; State.emit(); }),
      U.el('.kbdhint', { style: { marginTop: '6px' }, html: '<kbd>1</kbd>–<kbd>4</kbd> or <kbd>A</kbd>–<kbd>D</kbd> answer · <kbd>Enter</kbd> advance · <kbd>Space</kbd> flip a card · <kbd>1</kbd>–<kbd>4</kbd> grade it · <kbd>Esc</kbd> close' })
    ]));

    U.add(root, U.el('.card.tight', U.el('.row', [
      U.el('button.btn.sm.ghost', { onclick: function () { UI.go('/settings'); } }, '⚙️ App settings (sound, save, export)'),
      U.el('button.btn.sm.ghost', { onclick: function () { UI.go('/about'); } }, 'ℹ️ About'),
      U.el('button.btn.sm.ghost', { onclick: function () { UI.go('/progress'); } }, '‹ Progress')
    ])));
  };

  /* ================================================================ about */
  MS.Screens.about = function (root) {
    U.add(root, U.el('.card', [
      U.el('.big', '📐 Maths Standard'),
      U.el('.sub', 'HSC Mathematics Standard 2 — formerly the stand-alone app NumberCrunch.'),
      U.el('.hr'),
      U.el('.stack', [
        U.el('.sub', 'Thirteen study modes, five bosses and The Final Paper. ' +
          U.commas((MS.QUESTIONS || []).length) + ' multiple-choice questions, ' +
          (MS.CARDS || []).length + ' flashcards, ' + MS.Calc.GENS.length + ' problem generators and ' +
          MS.ACHIEVEMENTS.length + ' achievements.'),
        U.el('strong', 'How the XP works'),
        U.el('.sub', 'Correct answers pay 10 × difficulty (foundation questions ×0.6), multiplied by a streak multiplier that climbs to ×3. Wrong answers subtract. The end-of-run bonus is withheld entirely below 50% accuracy or under 5 answers. Answers submitted faster than the question can be read pay nothing. There is no floor — a bad run pays nothing, and that is on purpose.'),
        U.el('strong', 'The tool tray'),
        U.el('.sub', 'Every run has a calculator, the Standard 2 reference sheet and a working pad. Anything printed on the NESA reference sheet is free. Formulas the exam does NOT give you are marked, and revealing one costs 10% of the run’s XP (at most 30%).'),
        U.el('strong', 'Why the arcade pays nothing'),
        U.el('.sub', 'A game that paid XP per second would be a better use of your time than studying. The shared arcade costs Stars and pays only a high score.')
      ])
    ]));
    U.add(root, U.el('.card.tight', U.el('.row', [
      U.el('button.btn.sm.ghost', { onclick: function () { UI.go('/options'); } }, '‹ Options'),
      U.el('button.btn.sm.ghost', { onclick: function () { UI.go('/'); } }, '🏠 Home')
    ])));
  };

  /* ================================================================= shop */
  var SWATCH = {
    ledger: ['#0d1117', '#4cc9f0'], blueprint: ['#071a2f', '#59d0ff'], payslip: ['#f5f7fa', '#0b7fd4'],
    compound: ['#0a1410', '#4ade80'], offpeak: ['#161320', '#c084fc'], bearing: ['#04161a', '#22d3ee'],
    normal: ['#fbf7f0', '#b45309'], critical: ['#14100c', '#fb923c'], graphite: ['#101010', '#e5e5e5'],
    overtime: ['#0a0a12', '#ff2d95']
  };
  MS.Screens.catalog = function () {
    var SHOP = MS.SHOP;
    return {
      themes: SHOP.themes.map(function (t) {
        return { id: 'mstd-' + t.id, name: t.nm, desc: t.ds, price: t.cost, level: t.lv, swatch: SWATCH[t.id] || ['#222', '#888'] };
      }),
      avatars: SHOP.avatars.map(function (a) { return { emoji: a.g, price: a.cost, level: a.lv }; }),
      /* NumberCrunch's three crates, rolled by the shared crate table (its
         per-crate loot tables used power-ups the shared set does not have). */
      crates: SHOP.crates.map(function (c, i) {
        return { id: 'mstd-' + c.id, icon: c.ic, name: c.nm, price: c.cost, level: c.lv, rolls: c.rolls, better: i > 0, desc: c.ds.replace(', plus a Credits chance', '') };
      })
    };
  };
  MS.Screens.shop = function (root) {
    SQ.Shop.subject(root, 'mstd', MS.Screens.catalog());
    /* Crates are opened by the shared shop; mirror its counter for the crate achievements. */
    State.data.stats.cratesOpened = Math.max(State.data.stats.cratesOpened || 0, SQ.Store.data.stats.cratesOpened || 0);
  };
})();
