/* ============================================================================
   reference.js — 📖 the reference shelf. Formula sheet, unit conversions, tax
   brackets, the annuity tables, the normal distribution, network algorithms.
   ========================================================================== */
window.MS = window.MS || {};
window.MS.Screens = window.MS.Screens || {};
(function () {
  'use strict';
  var MS = window.MS, U = MS.U, UI = MS.UI, Audio = MS.Audio, State = MS.State;

  MS.Screens.reference = function (root) {
    U.add(root, U.el('.card', [
      U.el('strong', '📖 Reference'),
      U.el('.sub', 'Everything you are allowed to look up, and the traps that come with it. Works offline like the rest of the app.'),
      /* §C3 — the count is information, not a scold. NESA gives you this
         sheet in the exam, so reaching for it costs nothing here either. */
      U.el('.why', State.data.stats.sheetRuns
        ? 'You have opened the sheet during ' + State.data.stats.sheetRuns + ' run' +
          (State.data.stats.sheetRuns === 1 ? '' : 's') + '. That costs no XP and never will — ' +
          'you get this exact sheet in the exam. The marks are in knowing which formula to reach for, ' +
          'so if one topic keeps sending you here, that is the topic to drill.'
        : 'Press 📄 or F during any run to pull this up mid-question. It costs no XP — you get the same sheet in the exam.')
    ]));
    var grid = U.el('.tiles.one');
    (MS.REFERENCE || []).forEach(function (r) {
      U.add(grid, U.el('button.tile', {
        onclick: function () { Audio.play('tap'); UI.go('/reference/' + r.id); }
      }, [
        U.el('.spread', [
          U.el('div', [U.el('.nm', r.ic + ' ' + r.nm), U.el('.ds', r.ds)]),
          U.el('.chip.dim', (r.sections || []).length + ' parts')
        ])
      ]));
    });
    U.add(root, grid);
  };

  MS.Screens.referencePage = function (root, params) {
    var page = null;
    (MS.REFERENCE || []).forEach(function (r) { if (r.id === params.id) page = r; });
    if (!page) { UI.go('/reference'); return; }

    U.add(root, U.el('.card', [
      U.el('.spread', [
        U.el('div', [U.el('.big', page.ic + ' ' + page.nm), U.el('.sub', page.ds)]),
        U.el('button.btn.sm.ghost', { onclick: function () { UI.go('/reference'); } }, '‹')
      ])
    ]));

    (page.sections || []).forEach(function (s) {
      var card = U.el('.card');
      if (s.h) U.add(card, U.el('strong', { html: U.mathHtml(s.h) }));
      if (s.kind === 'table') {
        U.add(card, UI.table({ head: s.head, rows: s.rows }));
      } else if (s.kind === 'list') {
        U.add(card, U.el('ul', { style: { marginTop: '8px' } }, (s.items || []).map(function (it) {
          return U.el('li', { style: { marginBottom: '5px', fontSize: '13.5px', lineHeight: '1.5' }, html: U.mathHtml(it) });
        })));
      } else if (s.kind === 'note') {
        U.add(card, U.el('.why', { html: U.mathHtml(s.text) }));
      } else if (s.kind === 'annuity') {
        U.add(card, annuityTable(s.which));
      } else if (s.text) {
        U.add(card, U.el('.sub', { html: U.mathHtml(s.text) }));
      }
      U.add(root, card);
    });

    /* The formula sheet page gets a quick jump into practice. */
    U.add(root, U.el('.card.tight', U.el('.row', [
      U.el('button.btn.sm.ghost', { onclick: function () { UI.go('/reference'); } }, '‹ Reference'),
      U.el('button.btn.sm.ghost', { onclick: function () { UI.go('/game/crunch'); } }, '🔢 Practise this'),
      page.id === 'annuity' ? U.el('button.btn.sm.ghost', { onclick: function () { UI.go('/game/trek'); } }, '📋 Table Trek') : null
    ].filter(Boolean))));
  };

  function annuityTable(which) {
    var A = MS.ANNUITY;
    var tbl = U.el('table');
    var hr = U.el('tr');
    U.add(hr, U.el('th', 'n'));
    A.rateLabels.forEach(function (l) { U.add(hr, U.el('th', l)); });
    U.add(tbl, U.el('thead', hr));
    var tb = U.el('tbody');
    A[which].forEach(function (row) {
      var tr = U.el('tr');
      U.add(tr, U.el('td', String(row[0])));
      for (var i = 1; i < row.length; i++) U.add(tr, U.el('td', row[i].toFixed(4)));
      U.add(tb, tr);
    });
    U.add(tbl, tb);
    return U.el('.tblwrap.tall', tbl);
  }
})();
