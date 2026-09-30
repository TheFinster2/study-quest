/* ============================================================================
   draw.js — canvas drawing helpers (§6.2). Box plots, histograms, scatterplots
   with a regression line, normal curves, bearings compasses, triangles,
   weighted network graphs, amortisation curves.

   Every function reads its colours from CSS custom properties on :root, so
   diagrams follow the active theme without being told about it.
   Namespace: window.MS.Draw
   ========================================================================== */
window.MS = window.MS || {};
(function () {
  'use strict';
  var U = window.MS.U;
  var D = {};

  /* ------------------------------------------------------------- palette */
  /* §G1 — getComputedStyle forces a style recalculation, and this is called
     once per figure and once per confetti burst. The values only change when
     the theme does, so cache them and let UI.applyTheme drop the cache. */
  var paletteCache = null;
  D.invalidatePalette = function () { paletteCache = null; };

  D.palette = function () {
    if (paletteCache) return paletteCache;
    var cs = getComputedStyle(document.documentElement);
    function v(name, fb) { var s = cs.getPropertyValue(name).trim(); return s || fb; }
    paletteCache = {
      ink: v('--ink', '#e8eef7'),
      dim: v('--dim', '#93a2b8'),
      line: v('--line', '#2b3648'),
      panel: v('--panel', '#141b26'),
      panel2: v('--panel2', '#1b2430'),
      accent: v('--accent', '#5ac8fa'),
      accent2: v('--accent2', '#a78bfa'),
      good: v('--good', '#3ddc84'),
      bad: v('--bad', '#ff6b6b'),
      warn: v('--warn', '#ffca3a')
    };
    return paletteCache;
  };

  /* Make a themed canvas and give the caller a ready ctx in CSS-pixel space. */
  D.make = function (w, h, cls) {
    var c = U.canvas(w, h, cls);
    var ctx = c.getContext('2d');
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    ctx.textBaseline = 'middle';
    return { canvas: c, ctx: ctx, w: w, h: h, P: D.palette() };
  };

  function font(ctx, px, weight) {
    ctx.font = (weight || 600) + ' ' + px + 'px ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
  }
  D.font = font;

  D.clear = function (ctx, w, h) { ctx.clearRect(0, 0, w, h); };

  function line(ctx, x1, y1, x2, y2, col, lw) {
    ctx.strokeStyle = col; ctx.lineWidth = lw || 1;
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  }
  D.line = line;

  function label(ctx, txt, x, y, col, px, align) {
    font(ctx, px || 11);
    ctx.fillStyle = col; ctx.textAlign = align || 'center';
    ctx.fillText(txt, x, y);
    ctx.textAlign = 'left';
  }
  D.label = label;

  /* Nice axis ticks — the classic 1/2/5 ladder. */
  D.niceStep = function (span, target) {
    var raw = span / (target || 5);
    var mag = Math.pow(10, Math.floor(Math.log10(raw)));
    var n = raw / mag;
    var step = n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10;
    return step * mag;
  };

  /* ============================================================== box plot */
  /* spec: {min, q1, med, q3, max, outliers:[], lo, hi, title} */
  D.boxplot = function (ctx, w, h, spec) {
    var P = spec.P || D.palette();
    var pad = 24, top = spec.title ? 26 : 14, bh = 34;
    var all = [spec.min, spec.max].concat(spec.outliers || []);
    var lo = spec.lo != null ? spec.lo : Math.min.apply(null, all);
    var hi = spec.hi != null ? spec.hi : Math.max.apply(null, all);
    if (hi === lo) hi = lo + 1;
    var padFrac = (hi - lo) * 0.08;
    lo -= padFrac; hi += padFrac;
    var x = function (v) { return pad + (v - lo) / (hi - lo) * (w - 2 * pad); };
    var cy = top + bh / 2;

    if (spec.title) label(ctx, spec.title, w / 2, 12, P.dim, 11);

    // whiskers
    line(ctx, x(spec.min), cy, x(spec.q1), cy, P.dim, 1.5);
    line(ctx, x(spec.q3), cy, x(spec.max), cy, P.dim, 1.5);
    line(ctx, x(spec.min), cy - 9, x(spec.min), cy + 9, P.dim, 1.5);
    line(ctx, x(spec.max), cy - 9, x(spec.max), cy + 9, P.dim, 1.5);
    // box
    ctx.fillStyle = P.panel2;
    ctx.strokeStyle = P.accent; ctx.lineWidth = 1.5;
    var bx = x(spec.q1), bw = Math.max(2, x(spec.q3) - x(spec.q1));
    ctx.beginPath(); ctx.rect(bx, top, bw, bh); ctx.fill(); ctx.stroke();
    // median
    line(ctx, x(spec.med), top, x(spec.med), top + bh, P.warn, 2.5);
    // outliers
    (spec.outliers || []).forEach(function (o) {
      ctx.strokeStyle = P.bad; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(x(o), cy, 3.5, 0, Math.PI * 2); ctx.stroke();
    });
    // axis
    var ay = top + bh + 20;
    line(ctx, pad, ay, w - pad, ay, P.line, 1);
    var step = D.niceStep(hi - lo, 4);
    var start = Math.ceil(lo / step) * step;
    for (var v = start; v <= hi + 1e-9; v += step) {
      line(ctx, x(v), ay, x(v), ay + 4, P.line, 1);
      label(ctx, String(U.round(v, 2)), x(v), ay + 13, P.dim, 10);
    }
    return { x: x, cy: cy };
  };

  /* ============================================================= histogram */
  /* spec: {bins:[{label, count}], title, ylab} */
  D.histogram = function (ctx, w, h, spec) {
    var P = spec.P || D.palette();
    var L = 30, R = 8, T = spec.title ? 24 : 10, B = 30;
    var bins = spec.bins, n = bins.length;
    var maxC = Math.max.apply(null, bins.map(function (b) { return b.count; })) || 1;
    var yTop = Math.ceil(maxC / D.niceStep(maxC, 4)) * D.niceStep(maxC, 4);
    if (spec.title) label(ctx, spec.title, w / 2, 11, P.dim, 11);
    var plotW = w - L - R, plotH = h - T - B;
    var y = function (c) { return T + plotH - (c / yTop) * plotH; };
    // gridlines + y labels
    var step = D.niceStep(yTop, 4);
    for (var g = 0; g <= yTop + 1e-9; g += step) {
      line(ctx, L, y(g), w - R, y(g), P.line, 1);
      label(ctx, String(U.round(g, 2)), L - 5, y(g), P.dim, 10, 'right');
    }
    var bw = plotW / n;
    bins.forEach(function (b, i) {
      var bx = L + i * bw, top = y(b.count);
      ctx.fillStyle = spec.hl === i ? P.warn : P.accent;
      ctx.globalAlpha = 0.85;
      ctx.fillRect(bx + bw * 0.12, top, bw * 0.76, T + plotH - top);
      ctx.globalAlpha = 1;
      ctx.strokeStyle = P.panel; ctx.lineWidth = 1;
      ctx.strokeRect(bx + bw * 0.12, top, bw * 0.76, T + plotH - top);
      label(ctx, b.label, bx + bw / 2, h - B + 12, P.dim, 10);
    });
    line(ctx, L, T + plotH, w - R, T + plotH, P.dim, 1.5);
    line(ctx, L, T, L, T + plotH, P.dim, 1.5);
  };

  /* ================================================== scatter + regression */
  /* spec: {pts:[[x,y]], line:{m,b}|null, xlab, ylab, title, showLine} */
  D.scatter = function (ctx, w, h, spec) {
    var P = spec.P || D.palette();
    var L = 34, R = 10, T = spec.title ? 24 : 12, B = 28;
    var xs = spec.pts.map(function (p) { return p[0]; }), ys = spec.pts.map(function (p) { return p[1]; });
    var x0 = spec.x0 != null ? spec.x0 : Math.min.apply(null, xs), x1 = spec.x1 != null ? spec.x1 : Math.max.apply(null, xs);
    var y0 = spec.y0 != null ? spec.y0 : Math.min.apply(null, ys), y1 = spec.y1 != null ? spec.y1 : Math.max.apply(null, ys);
    var xp = (x1 - x0) * 0.1 || 1, yp = (y1 - y0) * 0.1 || 1;
    x0 -= xp; x1 += xp; y0 -= yp; y1 += yp;
    var plotW = w - L - R, plotH = h - T - B;
    var X = function (v) { return L + (v - x0) / (x1 - x0) * plotW; };
    var Y = function (v) { return T + plotH - (v - y0) / (y1 - y0) * plotH; };
    if (spec.title) label(ctx, spec.title, w / 2, 11, P.dim, 11);
    // grid
    var sx = D.niceStep(x1 - x0, 4), sy = D.niceStep(y1 - y0, 4);
    for (var gx = Math.ceil(x0 / sx) * sx; gx <= x1; gx += sx) {
      line(ctx, X(gx), T, X(gx), T + plotH, P.line, 1);
      label(ctx, String(U.round(gx, 2)), X(gx), h - B + 11, P.dim, 10);
    }
    for (var gy = Math.ceil(y0 / sy) * sy; gy <= y1; gy += sy) {
      line(ctx, L, Y(gy), w - R, Y(gy), P.line, 1);
      label(ctx, String(U.round(gy, 2)), L - 5, Y(gy), P.dim, 10, 'right');
    }
    if (spec.showLine && spec.line) {
      ctx.strokeStyle = P.warn; ctx.lineWidth = 2; ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(X(x0), Y(spec.line.m * x0 + spec.line.b));
      ctx.lineTo(X(x1), Y(spec.line.m * x1 + spec.line.b));
      ctx.stroke();
    }
    spec.pts.forEach(function (p) {
      ctx.fillStyle = P.accent;
      ctx.beginPath(); ctx.arc(X(p[0]), Y(p[1]), 3.2, 0, Math.PI * 2); ctx.fill();
    });
    line(ctx, L, T + plotH, w - R, T + plotH, P.dim, 1.5);
    line(ctx, L, T, L, T + plotH, P.dim, 1.5);
    if (spec.xlab) label(ctx, spec.xlab, w / 2, h - 3, P.dim, 10);
    return { X: X, Y: Y };
  };

  /* Pearson's r and the least-squares line — used by content AND validated. */
  D.regression = function (pts) {
    var n = pts.length;
    if (n < 2) return { m: 0, b: 0, r: 0 };
    var sx = 0, sy = 0, sxy = 0, sxx = 0, syy = 0;
    pts.forEach(function (p) { sx += p[0]; sy += p[1]; sxy += p[0] * p[1]; sxx += p[0] * p[0]; syy += p[1] * p[1]; });
    var num = n * sxy - sx * sy;
    var denX = n * sxx - sx * sx, denY = n * syy - sy * sy;
    var m = denX === 0 ? 0 : num / denX;
    var b = (sy - m * sx) / n;
    var r = (denX === 0 || denY === 0) ? 0 : num / Math.sqrt(denX * denY);
    return { m: m, b: b, r: r };
  };

  /* ============================================================ normal curve */
  /* spec: {shade:[zlo,zhi]|null, marks:[z], label} — the 68/95/99.7 workhorse */
  D.normal = function (ctx, w, h, spec) {
    var P = spec.P || D.palette();
    var L = 12, R = 12, T = 10, B = 26;
    var plotW = w - L - R, plotH = h - T - B;
    var zlo = -3.6, zhi = 3.6;
    var X = function (z) { return L + (z - zlo) / (zhi - zlo) * plotW; };
    var phi = function (z) { return Math.exp(-z * z / 2) / Math.sqrt(2 * Math.PI); };
    var peak = phi(0);
    var Y = function (d) { return T + plotH - (d / peak) * plotH * 0.94; };

    if (spec.shade) {
      ctx.fillStyle = P.accent; ctx.globalAlpha = 0.28;
      ctx.beginPath();
      var a = Math.max(zlo, spec.shade[0]), b = Math.min(zhi, spec.shade[1]);
      ctx.moveTo(X(a), Y(0));
      for (var z = a; z <= b; z += 0.02) ctx.lineTo(X(z), Y(phi(z)));
      ctx.lineTo(X(b), Y(0)); ctx.closePath(); ctx.fill();
      ctx.globalAlpha = 1;
    }
    ctx.strokeStyle = P.accent2; ctx.lineWidth = 2;
    ctx.beginPath();
    for (var z2 = zlo; z2 <= zhi; z2 += 0.02) {
      var px = X(z2), py = Y(phi(z2));
      if (z2 === zlo) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.stroke();
    line(ctx, L, Y(0), w - R, Y(0), P.dim, 1.5);
    for (var t = -3; t <= 3; t++) {
      line(ctx, X(t), Y(0), X(t), Y(0) + 4, P.line, 1);
      label(ctx, (spec.axis ? spec.axis(t) : (t === 0 ? 'μ' : (t > 0 ? '+' : '') + t + 'σ')), X(t), Y(0) + 14, P.dim, 10);
    }
    (spec.marks || []).forEach(function (z) {
      line(ctx, X(z), Y(0), X(z), Y(phi(z)), P.warn, 2);
    });
    return { X: X, Y: Y, phi: phi };
  };

  /* ============================================================== bearings */
  /* spec: {legs:[{bearing, dist, label}], origin:'O', showAngles} */
  D.bearings = function (ctx, w, h, spec) {
    var P = spec.P || D.palette();
    var cx = w / 2, cy = h / 2;
    var legs = spec.legs || [];
    var maxD = Math.max.apply(null, legs.map(function (l) { return l.dist; }).concat([1]));
    var scale = Math.min(w, h) * 0.36 / maxD;

    // compass rose
    ctx.strokeStyle = P.line; ctx.lineWidth = 1; ctx.setLineDash([3, 4]);
    ctx.beginPath(); ctx.arc(cx, cy, Math.min(w, h) * 0.42, 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([]);
    line(ctx, cx, cy - Math.min(w, h) * 0.46, cx, cy + Math.min(w, h) * 0.46, P.line, 1);
    line(ctx, cx - Math.min(w, h) * 0.46, cy, cx + Math.min(w, h) * 0.46, cy, P.line, 1);
    label(ctx, 'N', cx, cy - Math.min(w, h) * 0.46 - 7, P.dim, 10);
    label(ctx, 'S', cx, cy + Math.min(w, h) * 0.46 + 8, P.dim, 10);
    label(ctx, 'E', cx + Math.min(w, h) * 0.46 + 8, cy, P.dim, 10);
    label(ctx, 'W', cx - Math.min(w, h) * 0.46 - 8, cy, P.dim, 10);

    var pts = [{ x: cx, y: cy, name: spec.origin || 'O' }];
    var px = cx, py = cy;
    legs.forEach(function (l, i) {
      var rad = (l.bearing - 90) * Math.PI / 180;
      var nx = px + Math.cos(rad) * l.dist * scale;
      var ny = py + Math.sin(rad) * l.dist * scale;
      ctx.strokeStyle = i === spec.hl ? P.warn : P.accent; ctx.lineWidth = 2.2;
      ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(nx, ny); ctx.stroke();
      var mx = (px + nx) / 2, my = (py + ny) / 2;
      if (l.label !== false) label(ctx, l.label != null ? l.label : (l.dist + ' ' + (spec.unit || 'km')), mx + 12, my - 8, P.ink, 10);
      pts.push({ x: nx, y: ny, name: l.to || String.fromCharCode(65 + i) });
      px = nx; py = ny;
    });
    if (spec.close && pts.length > 2) {
      ctx.strokeStyle = P.good; ctx.lineWidth = 2; ctx.setLineDash([5, 4]);
      ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(cx, cy); ctx.stroke();
      ctx.setLineDash([]);
    }
    pts.forEach(function (p) {
      ctx.fillStyle = P.ink;
      ctx.beginPath(); ctx.arc(p.x, p.y, 3.5, 0, Math.PI * 2); ctx.fill();
      label(ctx, p.name, p.x, p.y - 12, P.ink, 11);
    });
    return { pts: pts, cx: cx, cy: cy, scale: scale };
  };

  /* =============================================================== triangle */
  /* spec: {sides:{a,b,c}, angles:{A,B,C}, show:{a:'12 cm', A:'?'}} — draws to
     shape using the given sides where possible, else a generic scalene. */
  D.triangle = function (ctx, w, h, spec) {
    var P = spec.P || D.palette();
    var s = spec.sides || {}, ang = spec.angles || {};
    var a = s.a, b = s.b, c = s.c;                 // a opposite A, etc.
    // Derive a drawable shape: need all three sides. Fill gaps with the rules.
    if (a == null && b != null && c != null && ang.A != null) {
      a = Math.sqrt(b * b + c * c - 2 * b * c * Math.cos(ang.A * Math.PI / 180));
    }
    if (b == null && a != null && ang.A != null && ang.B != null) b = a * Math.sin(ang.B * Math.PI / 180) / Math.sin(ang.A * Math.PI / 180);
    if (c == null && a != null && ang.A != null && ang.C != null) c = a * Math.sin(ang.C * Math.PI / 180) / Math.sin(ang.A * Math.PI / 180);
    if (a == null || b == null || c == null) { a = 5; b = 6; c = 7; }

    // place B(0,0), C(a,0), A from the two remaining sides
    var Ax = (c * c + a * a - b * b) / (2 * a);
    var Ay2 = c * c - Ax * Ax;
    var Ay = Ay2 > 0 ? Math.sqrt(Ay2) : 1;
    var minX = Math.min(0, a, Ax), maxX = Math.max(0, a, Ax);
    var minY = 0, maxY = Ay;
    var pad = 34;
    var sc = Math.min((w - 2 * pad) / Math.max(1e-6, maxX - minX), (h - 2 * pad) / Math.max(1e-6, maxY - minY));
    var ox = pad + (w - 2 * pad - (maxX - minX) * sc) / 2 - minX * sc;
    var oy = h - pad - (h - 2 * pad - (maxY - minY) * sc) / 2;
    var Bp = { x: ox, y: oy }, Cp = { x: ox + a * sc, y: oy }, Ap = { x: ox + Ax * sc, y: oy - Ay * sc };

    ctx.strokeStyle = P.accent; ctx.lineWidth = 2.2; ctx.fillStyle = P.panel2;
    ctx.beginPath(); ctx.moveTo(Ap.x, Ap.y); ctx.lineTo(Bp.x, Bp.y); ctx.lineTo(Cp.x, Cp.y); ctx.closePath();
    ctx.globalAlpha = 0.5; ctx.fill(); ctx.globalAlpha = 1; ctx.stroke();

    var show = spec.show || {};
    function mid(p, q) { return { x: (p.x + q.x) / 2, y: (p.y + q.y) / 2 }; }
    function out(p, cxy, d) {
      var dx = p.x - cxy.x, dy = p.y - cxy.y, L2 = Math.hypot(dx, dy) || 1;
      return { x: p.x + dx / L2 * d, y: p.y + dy / L2 * d };
    }
    var centroid = { x: (Ap.x + Bp.x + Cp.x) / 3, y: (Ap.y + Bp.y + Cp.y) / 3 };
    if (show.a) { var m = out(mid(Bp, Cp), centroid, 15); label(ctx, show.a, m.x, m.y, P.ink, 11); }
    if (show.b) { var m2 = out(mid(Ap, Cp), centroid, 18); label(ctx, show.b, m2.x, m2.y, P.ink, 11); }
    if (show.c) { var m3 = out(mid(Ap, Bp), centroid, 18); label(ctx, show.c, m3.x, m3.y, P.ink, 11); }
    // vertex labels + angle marks
    [['A', Ap, show.A], ['B', Bp, show.B], ['C', Cp, show.C]].forEach(function (t) {
      var p = out(t[1], centroid, 14);
      label(ctx, t[0], p.x, p.y, P.dim, 11);
      if (t[2]) {
        var q = out(t[1], centroid, -26);
        ctx.fillStyle = P.warn; font(ctx, 10); ctx.textAlign = 'center';
        ctx.fillText(t[2], q.x, q.y); ctx.textAlign = 'left';
      }
    });
    if (spec.right) {                                    // right-angle square at B
      var d = 10;
      ctx.strokeStyle = P.dim; ctx.lineWidth = 1.4;
      ctx.strokeRect(Bp.x, Bp.y - d, d, d);
    }
    return { A: Ap, B: Bp, C: Cp, sides: { a: a, b: b, c: c } };
  };

  /* ============================================================== network */
  /* spec: {nodes:[{id,x,y}], edges:[{a,b,w}], hl:[edgeIdx], path:[ids],
            directed, labels:{id:'text'}} — coordinates are 0..1 fractions. */
  D.network = function (ctx, w, h, spec) {
    var P = spec.P || D.palette();
    var pad = 26;
    var nodes = spec.nodes, byId = {};
    nodes.forEach(function (n) {
      byId[n.id] = { x: pad + n.x * (w - 2 * pad), y: pad + n.y * (h - 2 * pad), id: n.id };
    });
    var hl = {};
    (spec.hl || []).forEach(function (i) { hl[i] = 1; });
    var onPath = {};
    if (spec.path) for (var i = 0; i < spec.path.length - 1; i++) onPath[spec.path[i] + '|' + spec.path[i + 1]] = 1;

    (spec.edges || []).forEach(function (e, i) {
      var A = byId[e.a], B = byId[e.b];
      if (!A || !B) return;
      var lit = hl[i] || onPath[e.a + '|' + e.b] || onPath[e.b + '|' + e.a];
      ctx.strokeStyle = lit ? P.warn : (e.dim ? P.line : P.dim);
      ctx.lineWidth = lit ? 3.2 : 1.8;
      ctx.beginPath(); ctx.moveTo(A.x, A.y); ctx.lineTo(B.x, B.y); ctx.stroke();
      if (spec.directed) {
        var ang = Math.atan2(B.y - A.y, B.x - A.x), r = 15;
        var tx = B.x - Math.cos(ang) * r, ty = B.y - Math.sin(ang) * r;
        ctx.fillStyle = lit ? P.warn : P.dim;
        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.lineTo(tx - Math.cos(ang - 0.4) * 8, ty - Math.sin(ang - 0.4) * 8);
        ctx.lineTo(tx - Math.cos(ang + 0.4) * 8, ty - Math.sin(ang + 0.4) * 8);
        ctx.closePath(); ctx.fill();
      }
      if (e.w != null) {
        var mx = (A.x + B.x) / 2, my = (A.y + B.y) / 2;
        ctx.fillStyle = P.panel;
        var tw = String(e.w).length * 6 + 8;
        ctx.beginPath();
        if (ctx.roundRect) { ctx.roundRect(mx - tw / 2, my - 8, tw, 16, 5); } else { ctx.rect(mx - tw / 2, my - 8, tw, 16); }
        ctx.fill();
        label(ctx, String(e.w), mx, my, lit ? P.warn : P.ink, 10);
      }
    });
    nodes.forEach(function (n) {
      var p = byId[n.id];
      var lit = spec.path && spec.path.indexOf(n.id) >= 0;
      ctx.fillStyle = lit ? P.warn : P.panel2;
      ctx.strokeStyle = lit ? P.warn : P.accent; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(p.x, p.y, 14, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      label(ctx, (spec.labels && spec.labels[n.id]) || n.id, p.x, p.y + 0.5, lit ? P.panel : P.ink, 11);
      if (n.sub) label(ctx, n.sub, p.x, p.y + 24, P.dim, 9);
    });
    return { pos: byId };
  };

  /* ========================================================= amortisation */
  /* spec: {series:[balance...], target, months, hl} — the Loan Lab curve */
  D.curve = function (ctx, w, h, spec) {
    var P = spec.P || D.palette();
    var L = 40, R = 10, T = 12, B = 24;
    var pw = w - L - R, ph = h - T - B;
    var ser = spec.series, n = ser.length;
    var hi = spec.hi != null ? spec.hi : Math.max.apply(null, ser.concat([1]));
    var X = function (i) { return L + (n <= 1 ? 0 : i / (n - 1)) * pw; };
    var Y = function (v) { return T + ph - (v / hi) * ph; };
    var step = D.niceStep(hi, 4);
    for (var g = 0; g <= hi + 1e-9; g += step) {
      line(ctx, L, Y(g), w - R, Y(g), P.line, 1);
      label(ctx, g >= 1000 ? U.round(g / 1000, 0) + 'k' : String(U.round(g, 0)), L - 5, Y(g), P.dim, 10, 'right');
    }
    if (spec.target != null) {
      ctx.setLineDash([4, 4]);
      line(ctx, L, Y(spec.target), w - R, Y(spec.target), P.good, 1.5);
      ctx.setLineDash([]);
    }
    ctx.strokeStyle = spec.colour || P.accent; ctx.lineWidth = 2.4;
    ctx.beginPath();
    for (var i = 0; i < n; i++) {
      var px = X(i), py = Y(Math.max(0, ser[i]));
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.stroke();
    // fill under
    ctx.globalAlpha = 0.16; ctx.fillStyle = spec.colour || P.accent;
    ctx.lineTo(X(n - 1), Y(0)); ctx.lineTo(X(0), Y(0)); ctx.closePath(); ctx.fill();
    ctx.globalAlpha = 1;
    line(ctx, L, T + ph, w - R, T + ph, P.dim, 1.5);
    line(ctx, L, T, L, T + ph, P.dim, 1.5);
    if (spec.xlab) label(ctx, spec.xlab, L + pw / 2, h - 4, P.dim, 10);
    return { X: X, Y: Y };
  };

  /* ============================================================ line graph */
  /* spec: {lines:[{pts:[[x,y]], colour, label}], x0,x1,y0,y1} — break-even etc. */
  D.lines = function (ctx, w, h, spec) {
    var P = spec.P || D.palette();
    var L = 38, R = 12, T = 12, B = 26;
    var pw = w - L - R, ph = h - T - B;
    var X = function (v) { return L + (v - spec.x0) / (spec.x1 - spec.x0) * pw; };
    var Y = function (v) { return T + ph - (v - spec.y0) / (spec.y1 - spec.y0) * ph; };
    var sx = D.niceStep(spec.x1 - spec.x0, 4), sy = D.niceStep(spec.y1 - spec.y0, 4);
    for (var gx = Math.ceil(spec.x0 / sx) * sx; gx <= spec.x1; gx += sx) {
      line(ctx, X(gx), T, X(gx), T + ph, P.line, 1);
      label(ctx, String(U.round(gx, 2)), X(gx), h - B + 11, P.dim, 10);
    }
    for (var gy = Math.ceil(spec.y0 / sy) * sy; gy <= spec.y1; gy += sy) {
      line(ctx, L, Y(gy), w - R, Y(gy), P.line, 1);
      label(ctx, gy >= 1000 ? U.round(gy / 1000, 1) + 'k' : String(U.round(gy, 2)), L - 5, Y(gy), P.dim, 10, 'right');
    }
    (spec.lines || []).forEach(function (ln) {
      ctx.strokeStyle = ln.colour === 'accent2' ? P.accent2 : ln.colour === 'good' ? P.good : ln.colour === 'bad' ? P.bad : ln.colour || P.accent;
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ln.pts.forEach(function (p, i) { if (i === 0) ctx.moveTo(X(p[0]), Y(p[1])); else ctx.lineTo(X(p[0]), Y(p[1])); });
      ctx.stroke();
      if (ln.label) {
        var last = ln.pts[ln.pts.length - 1];
        label(ctx, ln.label, X(last[0]) - 16, Y(last[1]) - 9, ctx.strokeStyle, 10, 'right');
      }
    });
    (spec.marks || []).forEach(function (m) {
      ctx.fillStyle = P.warn;
      ctx.beginPath(); ctx.arc(X(m[0]), Y(m[1]), 4.5, 0, Math.PI * 2); ctx.fill();
      if (m[2]) label(ctx, m[2], X(m[0]), Y(m[1]) - 13, P.warn, 10);
    });
    line(ctx, L, T + ph, w - R, T + ph, P.dim, 1.5);
    line(ctx, L, T, L, T + ph, P.dim, 1.5);
    if (spec.xlab) label(ctx, spec.xlab, L + pw / 2, h - 4, P.dim, 10);
    return { X: X, Y: Y };
  };

  /* ============================================================= dot plot */
  D.dotplot = function (ctx, w, h, spec) {
    var P = spec.P || D.palette();
    var vals = spec.values, lo = Math.min.apply(null, vals), hi = Math.max.apply(null, vals);
    if (hi === lo) hi = lo + 1;
    var pad = 26, ay = h - 24;
    var X = function (v) { return pad + (v - lo) / (hi - lo) * (w - 2 * pad); };
    var counts = {};
    vals.slice().sort(function (a, b) { return a - b; }).forEach(function (v) {
      counts[v] = (counts[v] || 0) + 1;
      ctx.fillStyle = P.accent;
      ctx.beginPath(); ctx.arc(X(v), ay - 8 - (counts[v] - 1) * 9, 3.4, 0, Math.PI * 2); ctx.fill();
    });
    line(ctx, pad - 6, ay, w - pad + 6, ay, P.dim, 1.5);
    var step = Math.max(1, Math.round(D.niceStep(hi - lo, 5)));
    for (var v2 = Math.ceil(lo / step) * step; v2 <= hi; v2 += step) {
      line(ctx, X(v2), ay, X(v2), ay + 4, P.line, 1);
      label(ctx, String(v2), X(v2), ay + 14, P.dim, 10);
    }
  };

  /* ============================================================= pie chart */
  D.pie = function (ctx, w, h, spec) {
    var P = spec.P || D.palette();
    var cx = w / 2, cy = h / 2 - 4, r = Math.min(w, h) * 0.34;
    var total = U.sum(spec.slices.map(function (s) { return s.v; })) || 1;
    var cols = [P.accent, P.accent2, P.good, P.warn, P.bad, P.dim];
    var a0 = -Math.PI / 2;
    spec.slices.forEach(function (s, i) {
      var a1 = a0 + (s.v / total) * Math.PI * 2;
      ctx.fillStyle = s.colour || cols[i % cols.length];
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, r, a0, a1); ctx.closePath(); ctx.fill();
      var mid = (a0 + a1) / 2;
      if (s.v / total > 0.06) {
        label(ctx, s.label, cx + Math.cos(mid) * r * 0.66, cy + Math.sin(mid) * r * 0.66, P.panel, 10);
      }
      a0 = a1;
    });
  };

  /* ========================================== shapes for measurement (M1) */
  D.solid = function (ctx, w, h, spec) {
    var P = spec.P || D.palette();
    var cx = w / 2, cy = h / 2;
    ctx.strokeStyle = P.accent; ctx.lineWidth = 2; ctx.fillStyle = P.panel2;
    var k = spec.kind;
    if (k === 'cylinder') {
      var rw = Math.min(w, h) * 0.26, hh = h * 0.3;
      ctx.globalAlpha = 0.5;
      ctx.beginPath(); ctx.ellipse(cx, cy + hh, rw, rw * 0.3, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillRect(cx - rw, cy - hh, rw * 2, hh * 2);
      ctx.globalAlpha = 1;
      ctx.beginPath(); ctx.moveTo(cx - rw, cy - hh); ctx.lineTo(cx - rw, cy + hh); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx + rw, cy - hh); ctx.lineTo(cx + rw, cy + hh); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(cx, cy - hh, rw, rw * 0.3, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(cx, cy + hh, rw, rw * 0.3, 0, 0, Math.PI); ctx.stroke();
      if (spec.r) label(ctx, spec.r, cx + rw / 2, cy - hh - 12, P.ink, 11);
      if (spec.h) label(ctx, spec.h, cx + rw + 18, cy, P.ink, 11);
    } else if (k === 'prism' || k === 'box') {
      var bw = w * 0.34, bh = h * 0.3, d = Math.min(w, h) * 0.14;
      ctx.globalAlpha = 0.5; ctx.fillRect(cx - bw / 2, cy - bh / 2, bw, bh); ctx.globalAlpha = 1;
      ctx.strokeRect(cx - bw / 2, cy - bh / 2, bw, bh);
      ctx.beginPath();
      ctx.moveTo(cx - bw / 2, cy - bh / 2); ctx.lineTo(cx - bw / 2 + d, cy - bh / 2 - d);
      ctx.lineTo(cx + bw / 2 + d, cy - bh / 2 - d); ctx.lineTo(cx + bw / 2, cy - bh / 2);
      ctx.moveTo(cx + bw / 2 + d, cy - bh / 2 - d); ctx.lineTo(cx + bw / 2 + d, cy + bh / 2 - d);
      ctx.lineTo(cx + bw / 2, cy + bh / 2);
      ctx.stroke();
      if (spec.l) label(ctx, spec.l, cx, cy + bh / 2 + 13, P.ink, 11);
      if (spec.h) label(ctx, spec.h, cx - bw / 2 - 16, cy, P.ink, 11);
      if (spec.d) label(ctx, spec.d, cx + bw / 2 + d + 16, cy - bh / 2 - d / 2, P.ink, 11);
    } else if (k === 'cone') {
      var crw = Math.min(w, h) * 0.26, chh = h * 0.32;
      ctx.globalAlpha = 0.5;
      ctx.beginPath(); ctx.moveTo(cx, cy - chh); ctx.lineTo(cx - crw, cy + chh); ctx.lineTo(cx + crw, cy + chh); ctx.closePath(); ctx.fill();
      ctx.globalAlpha = 1; ctx.stroke();
      ctx.beginPath(); ctx.ellipse(cx, cy + chh, crw, crw * 0.28, 0, 0, Math.PI * 2); ctx.stroke();
      if (spec.r) label(ctx, spec.r, cx + crw / 2, cy + chh + 14, P.ink, 11);
      if (spec.h) label(ctx, spec.h, cx + 14, cy, P.ink, 11);
    } else if (k === 'sphere') {
      var sr = Math.min(w, h) * 0.28;
      ctx.globalAlpha = 0.5; ctx.beginPath(); ctx.arc(cx, cy, sr, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
      ctx.beginPath(); ctx.arc(cx, cy, sr, 0, Math.PI * 2); ctx.stroke();
      ctx.strokeStyle = P.dim; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.ellipse(cx, cy, sr, sr * 0.28, 0, 0, Math.PI * 2); ctx.stroke();
      if (spec.r) { line(ctx, cx, cy, cx + sr, cy, P.warn, 1.5); label(ctx, spec.r, cx + sr / 2, cy - 10, P.ink, 11); }
    } else {                                    // 'trapezium' / composite fallback
      var tw = w * 0.4, th = h * 0.28;
      ctx.globalAlpha = 0.5;
      ctx.beginPath();
      ctx.moveTo(cx - tw / 2, cy + th); ctx.lineTo(cx + tw / 2, cy + th);
      ctx.lineTo(cx + tw / 3, cy - th); ctx.lineTo(cx - tw / 3, cy - th); ctx.closePath();
      ctx.fill(); ctx.globalAlpha = 1; ctx.stroke();
      if (spec.a) label(ctx, spec.a, cx, cy - th - 12, P.ink, 11);
      if (spec.b) label(ctx, spec.b, cx, cy + th + 13, P.ink, 11);
      if (spec.h) label(ctx, spec.h, cx + 12, cy, P.ink, 11);
    }
  };

  window.MS.Draw = D;
})();
