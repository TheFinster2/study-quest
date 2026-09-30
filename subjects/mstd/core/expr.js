/* ============================================================================
   expr.js — recursive-descent expression parser + evaluator.
   §6.3: NEVER eval() or new Function() student input. This is not safety
   theatre — the parser gives better errors ("unmatched bracket at char 7").
   Namespace: window.MS.Expr
   ========================================================================== */
window.MS = window.MS || {};
(function () {
  'use strict';
  var Expr = {};

  var CONSTS = { pi: Math.PI, e: Math.E, PI: Math.PI };
  var FUNCS = {
    sqrt: Math.sqrt, abs: Math.abs, round: Math.round, floor: Math.floor, ceil: Math.ceil,
    sin: function (x) { return Math.sin(x); }, cos: function (x) { return Math.cos(x); },
    tan: function (x) { return Math.tan(x); },
    // Standard 2 works in degrees; the d-suffixed forms are the ones content uses.
    sind: function (x) { return Math.sin(x * Math.PI / 180); },
    cosd: function (x) { return Math.cos(x * Math.PI / 180); },
    tand: function (x) { return Math.tan(x * Math.PI / 180); },
    asind: function (x) { return Math.asin(x) * 180 / Math.PI; },
    acosd: function (x) { return Math.acos(x) * 180 / Math.PI; },
    atand: function (x) { return Math.atan(x) * 180 / Math.PI; },
    ln: Math.log, log: function (x) { return Math.log10(x); }, log10: function (x) { return Math.log10(x); },
    exp: Math.exp, min: Math.min, max: Math.max
  };

  /* ------------------------------------------------------------- tokenizer */
  function tokenize(src) {
    var t = [], i = 0, s = String(src);
    while (i < s.length) {
      var c = s[i];
      if (c === ' ' || c === '\t' || c === '\n') { i++; continue; }
      if (c === ',' && /[\d\s]/.test(s[i + 1] || '') && /\d/.test(s[i - 1] || '')) { i++; continue; } // thousands
      if (c === '$' || c === '_') { i++; continue; }
      if (/[0-9]/.test(c) || (c === '.' && /[0-9]/.test(s[i + 1] || ''))) {
        var j = i;
        while (j < s.length && /[0-9.]/.test(s[j])) j++;
        var num = s.slice(i, j);
        if ((num.match(/\./g) || []).length > 1) throw err('malformed number "' + num + '"', i);
        t.push({ k: 'num', v: Number(num), i: i });
        i = j; continue;
      }
      if (/[A-Za-z]/.test(c)) {
        var j2 = i;
        while (j2 < s.length && /[A-Za-z0-9]/.test(s[j2])) j2++;
        t.push({ k: 'name', v: s.slice(i, j2), i: i });
        i = j2; continue;
      }
      if ('+-*/^()%'.indexOf(c) >= 0) { t.push({ k: c, i: i }); i++; continue; }
      if (c === '×') { t.push({ k: '*', i: i }); i++; continue; }
      if (c === '÷') { t.push({ k: '/', i: i }); i++; continue; }
      if (c === '√') { t.push({ k: 'name', v: 'sqrt', i: i }); i++; continue; }
      if (c === 'π') { t.push({ k: 'name', v: 'pi', i: i }); i++; continue; }
      throw err('unexpected character "' + c + '"', i);
    }
    return t;
  }

  function err(msg, pos) {
    var e = new Error(msg + (pos == null ? '' : ' at character ' + (pos + 1)));
    e.pos = pos; e.parse = true;
    return e;
  }

  /* ---------------------------------------------------------------- parser
     expr    := term (('+'|'-') term)*
     term    := unary (('*'|'/'|implicit) unary)*
     unary   := ('-'|'+') unary | power
     power   := atom ('^' unary)?        (right-associative)
     atom    := num | name | name '(' args ')' | '(' expr ')' | atom '%'       */
  function parse(src) {
    var t = tokenize(src), p = 0;

    function peek() { return t[p]; }
    function next() { return t[p++]; }
    function expect(k) {
      if (!t[p] || t[p].k !== k) throw err(k === ')' ? 'unmatched bracket' : 'expected "' + k + '"', t[p] ? t[p].i : (src ? src.length - 1 : 0));
      return t[p++];
    }

    function parseExpr() {
      var left = parseTerm();
      while (peek() && (peek().k === '+' || peek().k === '-')) {
        var op = next().k;
        left = { t: op, a: left, b: parseTerm() };
      }
      return left;
    }
    function startsAtom(tok) {
      return tok && (tok.k === 'num' || tok.k === 'name' || tok.k === '(');
    }
    function parseTerm() {
      var left = parseUnary();
      for (;;) {
        var tok = peek();
        if (!tok) break;
        if (tok.k === '*' || tok.k === '/') { var op = next().k; left = { t: op, a: left, b: parseUnary() }; continue; }
        // implicit multiplication: 2pi, 3(4+1), 2 sqrt(9)
        if (startsAtom(tok)) { left = { t: '*', a: left, b: parseUnary() }; continue; }
        break;
      }
      return left;
    }
    function parseUnary() {
      var tok = peek();
      if (tok && (tok.k === '-' || tok.k === '+')) { var op = next().k; return { t: op === '-' ? 'neg' : 'pos', a: parseUnary() }; }
      return parsePower();
    }
    function parsePower() {
      var base = parseAtom();
      if (peek() && peek().k === '^') { next(); return { t: '^', a: base, b: parseUnary() }; }
      return base;
    }
    function parseAtom() {
      var tok = next();
      if (!tok) throw err('unexpected end of expression', src ? src.length - 1 : 0);
      var node;
      if (tok.k === 'num') node = { t: 'num', v: tok.v };
      else if (tok.k === 'name') {
        if (peek() && peek().k === '(') {
          next();
          var args = [];
          if (peek() && peek().k !== ')') {
            args.push(parseExpr());
            while (peek() && peek().k === ',') { next(); args.push(parseExpr()); }
          }
          expect(')');
          node = { t: 'call', name: tok.v, args: args };
        } else node = { t: 'var', name: tok.v };
      } else if (tok.k === '(') {
        node = parseExpr();
        expect(')');
      } else if (tok.k === ')') {
        throw err('unmatched bracket', tok.i);
      } else {
        throw err('unexpected "' + tok.k + '"', tok.i);
      }
      // trailing percent: 15% -> 0.15
      while (peek() && peek().k === '%') { next(); node = { t: '/', a: node, b: { t: 'num', v: 100 } }; }
      return node;
    }

    var ast = parseExpr();
    if (p < t.length) throw err('unexpected "' + (t[p].v != null ? t[p].v : t[p].k) + '"', t[p].i);
    return ast;
  }

  /* -------------------------------------------------------------- evaluator */
  function evaluate(ast, vars) {
    vars = vars || {};
    switch (ast.t) {
      case 'num': return ast.v;
      case 'neg': return -evaluate(ast.a, vars);
      case 'pos': return evaluate(ast.a, vars);
      case '+': return evaluate(ast.a, vars) + evaluate(ast.b, vars);
      case '-': return evaluate(ast.a, vars) - evaluate(ast.b, vars);
      case '*': return evaluate(ast.a, vars) * evaluate(ast.b, vars);
      case '/': return evaluate(ast.a, vars) / evaluate(ast.b, vars);
      case '^': return Math.pow(evaluate(ast.a, vars), evaluate(ast.b, vars));
      case 'var':
        if (Object.prototype.hasOwnProperty.call(vars, ast.name)) return vars[ast.name];
        if (Object.prototype.hasOwnProperty.call(CONSTS, ast.name)) return CONSTS[ast.name];
        throw err('unknown name "' + ast.name + '"');
      case 'call':
        var f = FUNCS[ast.name];
        if (!f) throw err('unknown function "' + ast.name + '"');
        return f.apply(null, ast.args.map(function (a) { return evaluate(a, vars); }));
    }
    throw err('cannot evaluate');
  }

  Expr.parse = parse;
  Expr.evaluate = evaluate;
  Expr.FUNCS = FUNCS;

  /* Parse+evaluate, returning {ok, value} or {ok:false, error} — never throws. */
  Expr.evalSafe = function (src, vars) {
    try {
      var v = evaluate(parse(src), vars);
      if (typeof v !== 'number' || !isFinite(v)) return { ok: false, error: 'not a finite number' };
      return { ok: true, value: v };
    } catch (e) {
      return { ok: false, error: e && e.message ? e.message : 'could not read that' };
    }
  };

  /* Structural equivalence by numeric sampling. Used by any typed-expression
     check. Seeded from a caller-supplied key so it is deterministic (§6.3). */
  Expr.equivalent = function (a, b, opts) {
    opts = opts || {};
    var rnd = window.MS.U.seededRandom(opts.seed || 'equiv');
    var astA, astB;
    try { astA = typeof a === 'string' ? parse(a) : a; astB = typeof b === 'string' ? parse(b) : b; }
    catch (e) { return false; }
    var clean = 0, samples = opts.samples || 8, vars = opts.vars || ['x'];
    for (var i = 0; i < samples * 4 && clean < samples; i++) {
      var env = {};
      for (var v = 0; v < vars.length; v++) env[vars[v]] = (rnd() * 8) - 4 + 0.12345;
      var va, vb;
      try { va = evaluate(astA, env); vb = evaluate(astB, env); } catch (e) { continue; }
      if (!isFinite(va) || !isFinite(vb)) continue;
      clean++;
      var scale = Math.max(1, Math.abs(va), Math.abs(vb));
      if (Math.abs(va - vb) / scale > 1e-9) return false;
    }
    return clean >= Math.min(5, samples);
  };

  window.MS.Expr = Expr;
})();
