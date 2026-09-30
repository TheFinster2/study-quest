/* ============================================================================
   figures.js — turns a question's `figure` spec into a themed canvas node.
   Content files describe figures declaratively; only this file knows about
   canvases, so a question bank stays pure data.
   Namespace: window.MS.Figures
   ========================================================================== */
window.MS = window.MS || {};
(function () {
  'use strict';
  var U = window.MS.U, D = window.MS.Draw;
  var F = {};

  /* Default sizes chosen so nothing overflows at 360px (the app has 20px of
     padding, so 320 is the safe ceiling). */
  var SIZES = {
    boxplot: [316, 100], histogram: [316, 190], scatter: [316, 210],
    normal: [316, 165], bearings: [300, 300], triangle: [300, 210],
    network: [316, 230], curve: [316, 190], lines: [316, 210],
    dotplot: [316, 130], pie: [280, 200], solid: [280, 200]
  };

  F.build = function (spec) {
    if (!spec || !spec.kind) return null;
    var fn = D[spec.kind === 'solid' ? 'solid' : spec.kind];
    if (typeof fn !== 'function') return null;
    var sz = SIZES[spec.kind] || [316, 200];
    var w = Math.min(spec.w || sz[0], Math.max(280, Math.min(window.innerWidth - 44, 520)));
    var h = spec.h || sz[1];
    var made = D.make(w, h, 'fig');
    try { fn(made.ctx, w, h, spec); }
    catch (e) { console.error('figure ' + spec.kind, e); return null; }
    made.canvas.setAttribute('role', 'img');
    made.canvas.setAttribute('aria-label', spec.alt || (spec.kind + ' diagram'));
    return made.canvas;
  };

  /* Redraw every figure on screen — called after a theme change so diagrams
     follow the palette (the whole reason draw.js reads CSS variables). */
  F.repaintAll = function () {
    U.$$('canvas.fig').forEach(function (c) {
      if (c._spec) {
        var made = c.getContext('2d');
        made.clearRect(0, 0, c._cssW, c._cssH);
        var fn = D[c._spec.kind];
        if (fn) try { fn(made, c._cssW, c._cssH, c._spec); } catch (e) { /* ignore */ }
      }
    });
  };

  /* A stem-and-leaf plot is text, not a drawing — HTML renders it better. */
  F.stemLeaf = function (spec) {
    var tbl = U.el('table');
    U.add(tbl, U.el('thead', U.el('tr', [U.el('th', 'Stem'), U.el('th', { style: { textAlign: 'left' } }, 'Leaf')])));
    var tb = U.el('tbody');
    spec.rows.forEach(function (r) {
      U.add(tb, U.el('tr', [
        U.el('td', String(r[0])),
        U.el('td', { style: { textAlign: 'left', letterSpacing: '3px', fontFamily: 'ui-monospace, monospace' } }, String(r[1]))
      ]));
    });
    U.add(tbl, tb);
    var wrap = U.el('.tblwrap', tbl);
    if (spec.key) U.add(wrap, U.el('.tiny.dim', { style: { padding: '6px 10px' } }, 'Key: ' + spec.key));
    return wrap;
  };

  /* Frequency table with optional cumulative and fx columns — MS-S1 workhorse. */
  F.freqTable = function (spec) {
    var head = ['Score', 'f'];
    if (spec.fx) head.push('fx');
    if (spec.cf) head.push('cf');
    var rows = [], total = 0, totalFx = 0, run = 0;
    spec.data.forEach(function (r) {
      var row = [String(r[0]), String(r[1])];
      total += r[1]; run += r[1]; totalFx += r[0] * r[1];
      if (spec.fx) row.push(String(r[0] * r[1]));
      if (spec.cf) row.push(String(run));
      rows.push(row);
    });
    var tot = ['Total', String(total)];
    if (spec.fx) tot.push(String(totalFx));
    if (spec.cf) tot.push('');
    if (spec.total !== false) rows.push(tot);
    return window.MS.UI.table({ head: head, rows: rows });
  };

  window.MS.Figures = F;
})();
