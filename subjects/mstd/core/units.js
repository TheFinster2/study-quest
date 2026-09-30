/* ============================================================================
   units.js — the tiny dimensional-analysis engine behind Unit Chain (§6.3).
   A quantity is { value, dim:{L:1, T:-1} } in SI base units. Unit *names* carry
   a factor to base, so 1 kL and 1 m^3 land on the same dim map and the same
   value — which is exactly the insight the mode is trying to teach.
   Namespace: window.MS.Units
   ========================================================================== */
window.MS = window.MS || {};
(function () {
  'use strict';
  var Un = {};

  /* factor = how many base units in one of these. dim in {L, M, T, C(count)} */
  var TABLE = {
    // length (base m)
    'mm': { f: 0.001, d: { L: 1 } }, 'cm': { f: 0.01, d: { L: 1 } }, 'm': { f: 1, d: { L: 1 } },
    'km': { f: 1000, d: { L: 1 } },
    // area (base m^2)
    'mm^2': { f: 1e-6, d: { L: 2 } }, 'cm^2': { f: 1e-4, d: { L: 2 } }, 'm^2': { f: 1, d: { L: 2 } },
    'ha': { f: 1e4, d: { L: 2 } }, 'km^2': { f: 1e6, d: { L: 2 } },
    // volume + capacity share dim L^3 — this is the point
    'mm^3': { f: 1e-9, d: { L: 3 } }, 'cm^3': { f: 1e-6, d: { L: 3 } }, 'm^3': { f: 1, d: { L: 3 } },
    'mL': { f: 1e-6, d: { L: 3 } }, 'L': { f: 1e-3, d: { L: 3 } },
    'kL': { f: 1, d: { L: 3 } }, 'ML': { f: 1000, d: { L: 3 } },
    // mass (base kg)
    'mg': { f: 1e-6, d: { M: 1 } }, 'g': { f: 1e-3, d: { M: 1 } }, 'kg': { f: 1, d: { M: 1 } },
    't': { f: 1000, d: { M: 1 } },
    // time (base s)
    's': { f: 1, d: { T: 1 } }, 'min': { f: 60, d: { T: 1 } }, 'h': { f: 3600, d: { T: 1 } },
    'day': { f: 86400, d: { T: 1 } }, 'week': { f: 604800, d: { T: 1 } }, 'yr': { f: 31536000, d: { T: 1 } },
    // counts / money-ish scalars used in rates
    'beat': { f: 1, d: { C: 1 } }, 'item': { f: 1, d: { C: 1 } }, 'person': { f: 1, d: { C: 1 } },
    '$': { f: 1, d: { $: 1 } }, 'c': { f: 0.01, d: { $: 1 } },
    // energy / power (base J, W)
    'J': { f: 1, d: { M: 1, L: 2, T: -2 } }, 'kJ': { f: 1000, d: { M: 1, L: 2, T: -2 } },
    'W': { f: 1, d: { M: 1, L: 2, T: -3 } }, 'kW': { f: 1000, d: { M: 1, L: 2, T: -3 } },
    'kWh': { f: 3.6e6, d: { M: 1, L: 2, T: -2 } }
  };

  Un.TABLE = TABLE;
  Un.known = function (name) { return Object.prototype.hasOwnProperty.call(TABLE, name); };

  function mergeDim(a, b, sign) {
    var out = {}, k;
    for (k in a) out[k] = a[k];
    for (k in b) { out[k] = (out[k] || 0) + sign * b[k]; if (!out[k]) delete out[k]; }
    return out;
  }
  Un.mul = function (x, y) { return { value: x.value * y.value, dim: mergeDim(x.dim, y.dim, 1) }; };
  Un.div = function (x, y) { return { value: x.value / y.value, dim: mergeDim(x.dim, y.dim, -1) }; };
  Un.sameDim = function (a, b) {
    var keys = {}, k;
    for (k in a) keys[k] = 1;
    for (k in b) keys[k] = 1;
    for (k in keys) if ((a[k] || 0) !== (b[k] || 0)) return false;
    return true;
  };
  Un.dimKey = function (d) {
    return Object.keys(d).sort().map(function (k) { return k + (d[k] === 1 ? '' : '^' + d[k]); }).join('·') || '1';
  };

  /* "mL/min" or "kg" or "km/h" -> {factor, dim} */
  Un.parseUnit = function (spec) {
    var parts = String(spec).split('/');
    var num = parts[0].trim(), dens = parts.slice(1);
    if (!Un.known(num)) throw new Error('unknown unit "' + num + '"');
    var out = { factor: TABLE[num].f, dim: mergeDim({}, TABLE[num].d, 1) };
    for (var i = 0; i < dens.length; i++) {
      var d = dens[i].trim();
      if (!Un.known(d)) throw new Error('unknown unit "' + d + '"');
      out.factor /= TABLE[d].f;
      out.dim = mergeDim(out.dim, TABLE[d].d, -1);
    }
    return out;
  };

  /* value in `from` units -> value in `to` units. Throws when dims disagree. */
  Un.convert = function (value, from, to) {
    var f = Un.parseUnit(from), t = Un.parseUnit(to);
    if (!Un.sameDim(f.dim, t.dim)) {
      throw new Error("can't convert " + from + ' to ' + to + ' — ' + Un.dimKey(f.dim) + ' vs ' + Un.dimKey(t.dim));
    }
    return value * f.factor / t.factor;
  };
  Un.compatible = function (from, to) {
    try { return Un.sameDim(Un.parseUnit(from).dim, Un.parseUnit(to).dim); } catch (e) { return false; }
  };

  /* Live feedback for Unit Chain: given a start quantity and a list of
     multiply/divide steps, report the running unit map and what cancelled. */
  Un.applyChain = function (start, steps) {
    var q;
    try { var s = Un.parseUnit(start.unit); q = { value: start.value * s.factor, dim: s.dim }; }
    catch (e) { return { ok: false, error: e.message }; }
    var trace = [{ label: start.value + ' ' + start.unit, dim: Un.dimKey(q.dim) }];
    for (var i = 0; i < steps.length; i++) {
      var st = steps[i];
      var u;
      try { u = Un.parseUnit(st.unit); } catch (e) { return { ok: false, error: e.message, trace: trace }; }
      var f = { value: st.value * u.factor, dim: u.dim };
      q = st.op === '/' ? Un.div(q, f) : Un.mul(q, f);
      trace.push({ label: (st.op === '/' ? '÷ ' : '× ') + st.value + ' ' + st.unit, dim: Un.dimKey(q.dim) });
    }
    return { ok: true, value: q.value, dim: q.dim, key: Un.dimKey(q.dim), trace: trace };
  };

  /* ======================================================= symbolic units ==
     Dimension maps alone cannot check a metric conversion: mL/min and L/h have
     the identical dimension (L³·T⁻¹), so a dimension tracker says "fine" before
     any work is done. What actually gets taught — and what Unit Chain shows —
     is SYMBOL cancellation: multiply by 1 L / 1000 mL and the mL cancels.
     So we track unit NAMES with powers, not just dimensions.               */

  /* 'mL/min' -> {mL:1, min:-1};  'm^3' -> {m:3};  'kg.m/s' -> {kg:1,m:1,s:-1} */
  Un.parseNames = function (spec) {
    var out = {};
    var parts = String(spec).split('/');
    parts.forEach(function (part, pi) {
      var sign = pi === 0 ? 1 : -1;
      part.split(/[.·*]/).forEach(function (tok) {
        tok = tok.trim();
        if (!tok || tok === '1') return;
        var m = /^([A-Za-z$]+)(?:\^(-?\d+))?$/.exec(tok);
        if (!m) throw new Error('cannot read unit "' + tok + '"');
        var name = m[1], pow = m[2] ? Number(m[2]) : 1;
        out[name] = (out[name] || 0) + sign * pow;
        if (!out[name]) delete out[name];
      });
    });
    return out;
  };

  Un.addNames = function (into, names, sign) {
    for (var k in names) {
      into[k] = (into[k] || 0) + sign * names[k];
      if (!into[k]) delete into[k];
    }
    return into;
  };

  /* {L:1, h:-1} -> 'L/h'  ·  {m:3} -> 'm^3'  ·  {} -> '1' */
  Un.formatNames = function (names) {
    var num = [], den = [];
    Object.keys(names).sort().forEach(function (k) {
      var p = names[k];
      if (p > 0) num.push(k + (p === 1 ? '' : '^' + p));
      else den.push(k + (p === -1 ? '' : '^' + (-p)));
    });
    return (num.length ? num.join('·') : '1') + (den.length ? '/' + den.join('·') : '');
  };

  Un.sameNames = function (a, b) {
    var keys = {}, k;
    for (k in a) keys[k] = 1;
    for (k in b) keys[k] = 1;
    for (k in keys) if ((a[k] || 0) !== (b[k] || 0)) return false;
    return true;
  };

  /* Is `numValue numUnit` genuinely equal to `denValue denUnit`? A conversion
     factor is only legitimate when its numerator and denominator are the same
     physical quantity — that is what makes multiplying by it multiplying by 1. */
  Un.validFactor = function (numValue, numUnit, denValue, denUnit) {
    try {
      var a = Un.parseUnit(numUnit), b = Un.parseUnit(denUnit);
      if (!Un.sameDim(a.dim, b.dim)) return false;
      return Math.abs(numValue * a.factor - denValue * b.factor) <= 1e-9 * Math.max(1, Math.abs(numValue * a.factor));
    } catch (e) { return false; }
  };

  /* Apply a chain of conversion factors, tracking the value and the symbols.
     steps: [{ numValue, numUnit, denValue, denUnit }]                       */
  Un.symChain = function (start, steps) {
    var syms;
    try { syms = Un.parseNames(start.unit); }
    catch (e) { return { ok: false, error: e.message }; }
    var value = start.value;
    var trace = [{ label: start.value + ' ' + start.unit, key: Un.formatNames(syms) }];
    var bogus = [];
    for (var i = 0; i < steps.length; i++) {
      var s = steps[i];
      if (!Un.validFactor(s.numValue, s.numUnit, s.denValue, s.denUnit)) bogus.push(i);
      try {
        Un.addNames(syms, Un.parseNames(s.numUnit), 1);
        Un.addNames(syms, Un.parseNames(s.denUnit), -1);
      } catch (e) { return { ok: false, error: e.message, trace: trace }; }
      value = value * s.numValue / s.denValue;
      trace.push({
        label: '× ' + s.numValue + ' ' + s.numUnit + ' / ' + s.denValue + ' ' + s.denUnit,
        key: Un.formatNames(syms)
      });
    }
    return {
      ok: true, value: value, syms: syms, key: Un.formatNames(syms),
      trace: trace, bogus: bogus
    };
  };

  /* Which symbols have fully cancelled between the start and now. */
  Un.cancelled = function (startUnit, syms) {
    var out = [];
    try {
      var s0 = Un.parseNames(startUnit);
      for (var k in s0) if (!syms[k]) out.push(k);
    } catch (e) { /* ignore */ }
    return out;
  };

  /* Pretty-print a unit spec with notation superscripts (m^3 -> m³) */
  Un.pretty = function (spec) { return window.MS.U.mathHtml(String(spec)); };

  window.MS.Units = Un;
})();
