/* ============================================================================
   util.js — DOM helpers, notation renderer, seeded RNG, money, numeric compare.
   Zero dependencies. Loaded first; nothing else may be assumed to exist.
   Namespace: window.MS.U  (no global alias: StudyQuest shares one window)
   ========================================================================== */
window.MS = window.MS || {};
(function () {
  'use strict';
  var U = {};

  /* ---------------------------------------------------------------- queries */
  U.$ = function (sel, root) { return (root || document).querySelector(sel); };
  U.$$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  /* --------------------------------------------------------------- el() ---
     el('div.card#main', {attrs}, children)  — children may be a node, string,
     array, or nested arrays. Falsy children are skipped so you can inline
     `cond && el(...)`. This ~45 lines replaces the whole of React here.       */
  U.add = function (node, kids) {
    if (kids == null || kids === false) return node;
    if (Array.isArray(kids)) { for (var i = 0; i < kids.length; i++) U.add(node, kids[i]); return node; }
    node.appendChild(kids instanceof Node ? kids : document.createTextNode(String(kids)));
    return node;
  };

  U.el = function (spec, attrs, kids) {
    if (attrs != null && (Array.isArray(attrs) || typeof attrs === 'string' ||
        typeof attrs === 'number' || attrs instanceof Node)) { kids = attrs; attrs = null; }
    var m = /^([a-zA-Z][a-zA-Z0-9]*)?((?:[.#][^.#\s]+)*)$/.exec(spec || 'div');
    var node = document.createElement((m && m[1]) || 'div');
    if (m && m[2]) {
      m[2].replace(/([.#])([^.#]+)/g, function (_, kind, val) {
        if (kind === '.') node.classList.add(val); else node.id = val;
        return '';
      });
    }
    if (attrs) {
      for (var k in attrs) {
        if (!Object.prototype.hasOwnProperty.call(attrs, k)) continue;
        var v = attrs[k];
        if (v == null || v === false) continue;
        if (k === 'html') node.innerHTML = v;
        else if (k === 'text') node.textContent = v;
        else if (k === 'style' && typeof v === 'object') { for (var s in v) node.style[s] = v[s]; }
        else if (k === 'dataset') { for (var d in v) node.dataset[d] = v[d]; }
        else if (k.slice(0, 2) === 'on' && typeof v === 'function') node.addEventListener(k.slice(2), v);
        else if (k === 'class') node.setAttribute('class', v);
        else if (v === true) node.setAttribute(k, '');
        else node.setAttribute(k, v);
      }
    }
    return U.add(node, kids);
  };

  U.clear = function (node) { while (node && node.firstChild) node.removeChild(node.firstChild); return node; };

  U.escapeHtml = function (s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  };

  /* ------------------------------------------------------------- numbers */
  U.clamp = function (n, lo, hi) { return n < lo ? lo : n > hi ? hi : n; };
  U.randInt = function (lo, hi) { return lo + Math.floor(Math.random() * (hi - lo + 1)); };
  U.pick = function (arr) { return arr[Math.floor(Math.random() * arr.length)]; };
  U.shuffle = function (arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  };
  U.sample = function (arr, n) { return U.shuffle(arr).slice(0, n); };
  U.sum = function (arr) { return arr.reduce(function (a, b) { return a + b; }, 0); };
  U.mean = function (arr) { return arr.length ? U.sum(arr) / arr.length : 0; };
  U.round = function (n, dp) { var f = Math.pow(10, dp || 0); return Math.round((n + Number.EPSILON) * f) / f; };
  U.pct = function (part, whole, dp) {
    if (!whole) return '0%';
    return U.round(100 * part / whole, dp == null ? 0 : dp) + '%';
  };
  U.sigFig = function (n, k) {
    if (n === 0 || !isFinite(n)) return n;
    var d = Math.ceil(Math.log10(Math.abs(n)));
    var p = (k || 3) - d, f = Math.pow(10, p);
    return Math.round(n * f) / f;
  };
  /* 1234567 -> "1,234,567" */
  U.commas = function (n) {
    var parts = String(n).split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
  };
  U.ordinal = function (n) {
    var s = ['th', 'st', 'nd', 'rd'], v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  /* ------------------------------------------------------------ money -----
     §6.4 — money lives in integer cents. Never accumulate in floats.        */
  U.toCents = function (dollars) { return Math.round((Number(dollars) || 0) * 100); };
  U.fromCents = function (cents) { return (Number(cents) || 0) / 100; };
  U.money = function (cents, opts) {
    opts = opts || {};
    var neg = cents < 0, v = Math.abs(Math.round(cents));
    var s = '$' + U.commas(Math.floor(v / 100)) + (opts.whole && v % 100 === 0 ? '' : '.' + String(v % 100).padStart(2, '0'));
    return (neg ? '-' : '') + s;
  };
  /* money from a float dollar amount, rounded to the cent */
  U.money$ = function (dollars, opts) { return U.money(U.toCents(dollars), opts); };

  /* --------------------------------------------------------------- dates */
  U.dayKey = function (d) {
    d = d || new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  };
  U.parseDay = function (key) {
    var p = String(key).split('-');
    return new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
  };
  U.daysBetween = function (a, b) {
    if (!a || !b) return Infinity;
    var ms = U.parseDay(b).getTime() - U.parseDay(a).getTime();
    return Math.round(ms / 86400000);
  };
  /* ISO week key, e.g. "2026-W31" — used for weekly quests */
  U.weekKey = function (d) {
    d = new Date(d || Date.now());
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));       // Thursday of this ISO week
    var jan4 = new Date(d.getFullYear(), 0, 4);
    var week = 1 + Math.round(((d - jan4) / 86400000 - 3 + ((jan4.getDay() + 6) % 7)) / 7);
    return d.getFullYear() + '-W' + String(week).padStart(2, '0');
  };
  U.fmtTime = function (secs) {
    secs = Math.max(0, Math.round(secs));
    var m = Math.floor(secs / 60), s = secs % 60;
    return m + ':' + String(s).padStart(2, '0');
  };
  U.fmtClock = function (mins24) {                              // 930 -> "9:30 am" (MS-M2)
    var h = Math.floor(mins24 / 60) % 24, m = mins24 % 60;
    var ap = h < 12 ? 'am' : 'pm', h12 = h % 12 === 0 ? 12 : h % 12;
    return h12 + ':' + String(m).padStart(2, '0') + ' ' + ap;
  };
  U.fmt24 = function (mins24) {
    var h = Math.floor(mins24 / 60) % 24, m = mins24 % 60;
    return String(h).padStart(2, '0') + String(m).padStart(2, '0');
  };

  /* ----------------------------------------------------------- seeded RNG */
  U.hash = function (str) {
    var h = 2166136261 >>> 0; str = String(str);
    for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  };
  /* mulberry32 — small, fast, good enough, and identical across engines */
  U.seededRandom = function (seed) {
    var a = (typeof seed === 'number' ? seed : U.hash(seed)) >>> 0;
    if (a === 0) a = 0x9e3779b9;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      var t = a;
      t = Math.imul(t ^ (t >>> 15), 1 | t);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };
  U.seededShuffle = function (arr, seed) {
    var rnd = typeof seed === 'function' ? seed : U.seededRandom(seed);
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rnd() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  };
  U.seededInt = function (rnd, lo, hi) { return lo + Math.floor(rnd() * (hi - lo + 1)); };
  U.seededPick = function (rnd, arr) { return arr[Math.floor(rnd() * arr.length)]; };

  /* =========================================================== NOTATION ===
     §6.1 — a small inline mini-language, rendered to HTML. Standard 2 needs
     fractions, a few superscripts, roots and a symbol table. That's it.

     Word tokens REQUIRE a backslash (\pi, \deg, \pm) because bare words are
     landmines in this course: "3:30 pm", "degree of a vertex", "pi charts".
     Bare operator forms (->, >=, <=, !=, ~=) are safe and supported.

     ORDER MATTERS: escape HTML first, then substitute. Reversing this is an
     XSS hole in a study app (§6.1).
     ====================================================================== */
  var SUP = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '-': '⁻', '+': '⁺', 'n': 'ⁿ' };
  var SUB = { '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄', '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉', 'n': 'ₙ', 'i': 'ᵢ', 'x': 'ₓ' };

  var WORD_SYMBOLS = {
    'pi': 'π', 'theta': 'θ', 'alpha': 'α', 'beta': 'β', 'mu': 'μ', 'sigma': 'σ',
    'Sigma': 'Σ', 'Delta': 'Δ', 'deg': '°', 'pm': '±', 'mp': '∓', 'times': '×',
    'div': '÷', 'cdot': '·', 'approx': '≈', 'ne': '≠', 'le': '≤', 'ge': '≥',
    'to': '→', 'infty': '∞', 'therefore': '∴', 'because': '∵', 'in': '∈',
    'cup': '∪', 'cap': '∩', 'empty': '∅', 'sub': '⊂', 'perp': '⊥', 'angle': '∠',
    'tri': '△', 'sim': '∼', 'propto': '∝', 'sqrt2': '√2', 'dollar': '$',
    /* Function names are set upright, which is why they carry a backslash
       rather than being typed literally — \sin θ, not sin θ in italics. */
    'sin': 'sin', 'cos': 'cos', 'tan': 'tan', 'ln': 'ln', 'log': 'log',
    'sinv': 'sin⁻¹', 'cinv': 'cos⁻¹', 'tinv': 'tan⁻¹',
    /* Sizing commands have no meaning here — drop them rather than print them. */
    'left': '', 'right': '', 'big': '', 'displaystyle': ''
  };

  function supUni(txt) {
    var out = '';
    for (var i = 0; i < txt.length; i++) { if (!SUP[txt[i]]) return null; out += SUP[txt[i]]; }
    return out;
  }
  function subUni(txt) {
    var out = '';
    for (var i = 0; i < txt.length; i++) { if (!SUB[txt[i]]) return null; out += SUB[txt[i]]; }
    return out;
  }

  /* Render notation source -> HTML string. Input is escaped first. */
  U.mathHtml = function (src) {
    var s = U.escapeHtml(src);

    // \frac{a}{b} — innermost first so nesting one level deep works
    for (var guard = 0; guard < 4 && /\\frac\{/.test(s); guard++) {
      s = s.replace(/\\frac\{([^{}]*)\}\{([^{}]*)\}/g, function (_, a, b) {
        return '<span class="frac"><span class="fnum">' + a + '</span><span class="fden">' + b + '</span></span>';
      });
    }
    // \sqrt{...} and sqrt(...)
    s = s.replace(/\\sqrt\{([^{}]*)\}/g, function (_, a) { return '<span class="sq">√<span class="rad">' + a + '</span></span>'; });
    s = s.replace(/\bsqrt\(([^()]*)\)/g, function (_, a) { return '<span class="sq">√<span class="rad">' + a + '</span></span>'; });
    // \bar{x} -> x̄  (combining macron)
    s = s.replace(/\\bar\{([^{}]*)\}/g, function (_, a) { return a + '̄'; });
    s = s.replace(/\bx_bar\b/g, 'x̄');
    // \hat{y}
    s = s.replace(/\\hat\{([^{}]*)\}/g, function (_, a) { return a + '̂'; });

    // superscripts / subscripts
    s = s.replace(/\^\{([^{}]*)\}/g, function (_, a) { return supUni(a) || '<sup>' + a + '</sup>'; });
    s = s.replace(/\^(-?[0-9]+|[a-zA-Z])/g, function (_, a) { return supUni(a) || '<sup>' + a + '</sup>'; });
    s = s.replace(/_\{([^{}]*)\}/g, function (_, a) { return subUni(a) || '<sub>' + a + '</sub>'; });
    s = s.replace(/([A-Za-z0-9̄])_([0-9a-zA-Z])(?![a-zA-Z0-9_])/g, function (_, pre, a) {
      return pre + (subUni(a) || '<sub>' + a + '</sub>');
    });

    // word symbols (backslash-prefixed)
    s = s.replace(/\\([A-Za-z]+)/g, function (m, w) {
      return Object.prototype.hasOwnProperty.call(WORD_SYMBOLS, w) ? WORD_SYMBOLS[w] : m;
    });
    // safe operator forms — note >= became &gt;= after escaping
    s = s.replace(/&gt;=/g, '≥').replace(/&lt;=/g, '≤')
         .replace(/!=/g, '≠').replace(/~=/g, '≈')
         .replace(/-&gt;/g, '→').replace(/=&gt;/g, '⇒')
         .replace(/(\d)\s*\*\s*(?=[\d(])/g, '$1 × ');
    return s;
  };

  /* Convenience: a <span> carrying rendered notation. */
  U.math = function (src, cls) {
    return U.el('span' + (cls ? '.' + cls : ''), { html: U.mathHtml(src) });
  };
  /* Set rendered notation as the content of an existing node. */
  U.setMath = function (node, src) { node.innerHTML = U.mathHtml(src); return node; };

  /* Plain-text version of notation source — for aria-labels, tests, sorting. */
  U.mathText = function (src) {
    return String(src == null ? '' : src)
      .replace(/\\frac\{([^{}]*)\}\{([^{}]*)\}/g, '($1)/($2)')
      .replace(/\\sqrt\{([^{}]*)\}/g, '√($1)')
      .replace(/\\([A-Za-z]+)/g, function (m, w) { return WORD_SYMBOLS[w] || w; })
      .replace(/[{}]/g, '');
  };

  /* ==================================================== numeric comparison */
  /* §6.4 — accepts "1,234.50", "$1 234.50", "37.5%", "3/8", "sqrt(50)",
     "1.2e3", "1.2 x 10^3". Percentages are only auto-scaled when the caller
     opts in, because "6% interest" and "6" are both legitimate answers. */
  U.parseNumber = function (raw, opts) {
    opts = opts || {};
    if (raw == null) return NaN;
    var s = String(raw).trim();
    if (!s) return NaN;
    var hadPct = /%\s*$/.test(s);
    s = s.replace(/[$ \s,]/g, '').replace(/%/g, '');
    if (!s) return NaN;
    // scientific: 1.2x10^3 / 1.2*10^3 / 1.2e3
    s = s.replace(/([\d.])\s*[x×*]\s*10\^?\s*(-?\d+)/gi, function (_, a, b) { return a + 'e' + b; });
    var n;
    if (/^-?(\d+\.?\d*|\.\d+)(e-?\d+)?$/i.test(s)) {
      n = Number(s);
    } else {
      var E = window.MS && window.MS.Expr;
      if (!E) return NaN;
      var r = E.evalSafe(s);
      if (!r.ok) return NaN;
      n = r.value;
    }
    if (!isFinite(n)) return NaN;
    if (hadPct && opts.percent) n = n / 100;
    return n;
  };

  /* Compare a typed answer with an expected value.
     opts.money    -> must match to the cent, exactly
     opts.tolAbs   -> absolute tolerance
     opts.tolRel   -> relative tolerance (default 0.005 = 0.5%, §6.4)
     opts.percent  -> a trailing % divides by 100                            */
  U.numClose = function (raw, expected, opts) {
    if (typeof opts === 'number') opts = { tolRel: opts };
    opts = opts || {};
    var got = U.parseNumber(raw, opts);
    if (!isFinite(got) || !isFinite(expected)) return false;
    if (opts.money) return Math.round(got * 100) === Math.round(expected * 100);
    if (opts.tolAbs != null) return Math.abs(got - expected) <= opts.tolAbs + 1e-12;
    var tol = opts.tolRel == null ? 0.005 : opts.tolRel;
    if (expected === 0) return Math.abs(got) <= (tol || 1e-9);
    return Math.abs(got - expected) / Math.abs(expected) <= tol + 1e-12;
  };

  /* ------------------------------------------------------------- misc DOM */
  U.on = function (node, evt, fn, opts) { node.addEventListener(evt, fn, opts); return function () { node.removeEventListener(evt, fn, opts); }; };
  U.reducedMotion = function () {
    return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  };
  /* Words in a stem — feeds the length-scaled MIN_READ_MS of §9.5.3 */
  U.words = function (s) {
    var t = U.mathText(s).trim();
    return t ? t.split(/\s+/).length : 0;
  };
  /* A DPR-aware canvas. drawFn(ctx, w, h) is called in CSS pixel space. */
  U.canvas = function (w, h, cls) {
    var dpr = Math.min(3, window.devicePixelRatio || 1);
    var c = U.el('canvas' + (cls ? '.' + cls : ''), { width: Math.round(w * dpr), height: Math.round(h * dpr) });
    c.style.width = w + 'px'; c.style.height = h + 'px';
    var ctx = c.getContext('2d');
    ctx.scale(dpr, dpr);
    c._cssW = w; c._cssH = h;
    return c;
  };

  U.SUP = SUP; U.SUB = SUB; U.WORD_SYMBOLS = WORD_SYMBOLS;

  window.MS.U = U;
})();
