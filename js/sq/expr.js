/* SQ.Expr — the calculator's arithmetic. A recursive-descent parser; no eval, no
   Function, nothing that can run a string as code.

   Merged from Physics (js/core/expr.js — the precedence rules, implicit
   multiplication, the data-sheet constants, the friendly errors) and Maths Advanced
   (js/core/calc.js + expr.js — factorial, nCr/nPr, percent, cbrt, logb, memory).

   ── What it accepts ─────────────────────────────────────────────────────────
     1 + 2*3            ordinary precedence
     2^3^2              right-associative powers → 512, not 64
     -2^2               → -4   (unary minus binds LOOSER than ^, as on a hand calculator)
     2^-3               → 0.125 (…but the exponent may be signed)
     3(4+5)  2pi  2sin30  9sqrt(9)    implicit multiplication (never number·number:
                        "1 000 + 1" is refused rather than read as 1 × 000 + 1)
     1.5E-3  2e3        scientific entry (the ×10ˣ key inserts E)
     5!  50%            postfix factorial and percent (x% = x/100)
     5 nCr 2  nCr(5,2)  combinations / permutations, infix or as a function
     sin30  sin(30)     degrees or radians per opts.deg; sind/cosd… always degrees
     sin(30)^2          (sin 30)² — a bracketed argument ends at its bracket
     |x|                absolute value bars
     π pi e             e is Euler's number UNLESS the subject's sheet defines `e`
                        (Physics: the elementary charge; Euler's is then exp(1))
     ans Ans mem        the previous result, the memory register
     any constant id    passed in opts.consts — the active subject's sheet values

   evaluate(src, opts) → { ok:true, value } | { ok:false, error }. It never throws for
   input, because the calculator runs it on every key press to drive the preview.
   opts: { deg:bool, ans:number, mem:number, consts:{ id: number } }            */
window.SQ = window.SQ || {};

SQ.Expr = (function () {
  const DEG = Math.PI / 180;

  function err(message) { const e = new Error(message); e.friendly = true; return e; }

  function inverse(fn, x, deg, name) {
    if (x < -1 || x > 1) throw err(name + " needs a value between -1 and 1");
    const r = fn(x);
    return deg ? r / DEG : r;
  }
  function positive(fn, name) {
    return x => { if (x <= 0) throw err(name + " needs a positive number"); return fn(x); };
  }

  /* One-argument functions. The degrees flag is threaded in, never read from a
     global, so a test can pin both modes without touching app state. */
  const FUNCS = {
    sin: (x, d) => Math.sin(d ? x * DEG : x),
    cos: (x, d) => Math.cos(d ? x * DEG : x),
    tan: (x, d) => {
      if (d && Math.abs(((x % 180) + 180) % 180 - 90) < 1e-9) throw err("tan is undefined there");
      return Math.tan(d ? x * DEG : x);
    },
    asin: (x, d) => inverse(Math.asin, x, d, "sin⁻¹"),
    acos: (x, d) => inverse(Math.acos, x, d, "cos⁻¹"),
    atan: (x, d) => (d ? Math.atan(x) / DEG : Math.atan(x)),
    sind: x => FUNCS.sin(x, true), cosd: x => FUNCS.cos(x, true), tand: x => FUNCS.tan(x, true),
    asind: x => FUNCS.asin(x, true), acosd: x => FUNCS.acos(x, true), atand: x => FUNCS.atan(x, true),
    sinh: Math.sinh, cosh: Math.cosh, tanh: Math.tanh,
    asinh: Math.asinh,
    acosh: x => { if (x < 1) throw err("cosh⁻¹ needs a value of at least 1"); return Math.acosh(x); },
    atanh: x => { if (x <= -1 || x >= 1) throw err("tanh⁻¹ needs a value between -1 and 1"); return Math.atanh(x); },
    ln: positive(Math.log, "ln"),
    log: positive(Math.log10, "log"),
    log10: positive(Math.log10, "log"),
    log2: positive(Math.log2, "log₂"),
    sqrt: x => { if (x < 0) throw err("no square root of a negative number"); return Math.sqrt(x); },
    cbrt: Math.cbrt,
    abs: Math.abs,
    exp: Math.exp
  };
  const ALIAS_FN = { arcsin: "asin", arccos: "acos", arctan: "atan", Sin: "sin", Cos: "cos", Tan: "tan",
                     Ln: "ln", Log: "log", nCr: "ncr", nPr: "npr" };

  /* Two-argument functions. */
  const FUNCS2 = {
    ncr: (n, r) => choose(n, r),
    npr: (n, r) => perm(n, r),
    logb: (b, x) => {
      if (b <= 0 || b === 1) throw err("the base of a log must be positive and not 1");
      if (x <= 0) throw err("log needs a positive number");
      return Math.log(x) / Math.log(b);
    }
  };

  const BUILTIN = { pi: Math.PI, PI: Math.PI, Pi: Math.PI, e: Math.E, tau: 2 * Math.PI };

  function factorial(n) {
    if (!Number.isInteger(n) || n < 0) throw err("factorial needs a whole number, 0 or more");
    if (n > 170) throw err("the result is too big to show");
    let r = 1;
    for (let i = 2; i <= n; i++) r *= i;
    return r;
  }
  function checkNR(n, r, what) {
    if (!Number.isInteger(n) || !Number.isInteger(r) || n < 0 || r < 0)
      throw err(what + " needs whole numbers, 0 or more");
    if (r > n) throw err(what + " needs r no bigger than n");
  }
  function choose(n, r) {
    checkNR(n, r, "nCr");
    const k = Math.min(r, n - r);
    let v = 1;
    for (let i = 1; i <= k; i++) v = (v * (n - k + i)) / i;
    return Math.round(v);
  }
  function perm(n, r) {
    checkNR(n, r, "nPr");
    let v = 1;
    for (let i = 0; i < r; i++) v *= n - i;
    return v;
  }

  const isAns = w => w === "ans" || w === "Ans" || w === "ANS";
  const isMem = w => w === "mem" || w === "M" || w === "MR";

  /* ── tokeniser ─────────────────────────────────────────────── */
  function known(word, consts) {
    return !!(FUNCS[word] || FUNCS2[word] || (word in ALIAS_FN) || isAns(word) || isMem(word) ||
      (consts && Object.prototype.hasOwnProperty.call(consts, word)) || BUILTIN[word] !== undefined);
  }

  function tokenize(src, consts) {
    const s = String(src);
    const out = [];
    let i = 0;
    while (i < s.length) {
      const c = s[i];
      if (c === " " || c === "\t" || c === "\n" || c === "_") { i++; continue; }

      /* A number, with a scientific exponent only when digits follow the E, so a
         half-typed "2E" is still two tokens rather than a broken number. */
      if (/[0-9]/.test(c) || (c === "." && /[0-9]/.test(s[i + 1] || ""))) {
        let j = i;
        while (j < s.length && /[0-9]/.test(s[j])) j++;
        if (s[j] === ".") { j++; while (j < s.length && /[0-9]/.test(s[j])) j++; }
        if (s[j] === "e" || s[j] === "E") {
          let k = j + 1;
          if (s[k] === "+" || s[k] === "-" || s[k] === "−") k++;
          if (/[0-9]/.test(s[k] || "")) { while (k < s.length && /[0-9]/.test(s[k])) k++; j = k; }
        }
        out.push({ t: "num", v: parseFloat(s.slice(i, j).replace("−", "-")) });
        i = j; continue;
      }

      if (/[A-Za-z]/.test(c)) {
        let j = i;
        while (j < s.length && /[A-Za-z0-9]/.test(s[j])) j++;
        const full = s.slice(i, j);
        let word = full;
        /* Longest known prefix, so `2pi`, `sin30` and `gh` work without operators
           the calculator can infer. */
        while (word.length > 1 && !known(word, consts)) word = word.slice(0, -1);
        if (!known(word, consts)) throw err('unknown name "' + full + '"');
        out.push({ t: "name", v: word });
        i += word.length; continue;
      }

      if ("+-*/^()!%|,".indexOf(c) >= 0) { out.push({ t: c }); i++; continue; }
      if (c === "×" || c === "·" || c === "⋅") { out.push({ t: "*" }); i++; continue; }
      if (c === "÷") { out.push({ t: "/" }); i++; continue; }
      if (c === "−" || c === "–") { out.push({ t: "-" }); i++; continue; }
      if (c === "√") { out.push({ t: "name", v: "sqrt" }); i++; continue; }
      if (c === "∛") { out.push({ t: "name", v: "cbrt" }); i++; continue; }
      if (c === "π") { out.push({ t: "name", v: "pi" }); i++; continue; }
      if (c === "²") { out.push({ t: "^" }, { t: "num", v: 2 }); i++; continue; }
      if (c === "³") { out.push({ t: "^" }, { t: "num", v: 3 }); i++; continue; }
      if (c === "⁻" && s[i + 1] === "¹") { out.push({ t: "^" }, { t: "-" }, { t: "num", v: 1 }); i += 2; continue; }
      throw err('"' + c + '" is not something I can calculate with');
    }
    return out;
  }

  /* ── parser (evaluates as it goes) ─────────────────────────────
       expr    := term (('+'|'-') term)*
       term    := combo (('*'|'/') combo | <implicit> combo)*
       combo   := unary (('nCr'|'nPr') unary)*
       unary   := ('-'|'+') unary | power
       power   := postfix ('^' unary)?          right-assoc via unary → power
       postfix := primary ('!'|'%')*
       primary := num | '(' expr ')' | '|' expr '|' | name args? | const          */
  function parse(tokens, opts) {
    let p = 0;
    let barDepth = 0;
    const peek = () => tokens[p];
    const next = () => tokens[p++];
    const deg = !!opts.deg;
    const consts = opts.consts || {};

    const infixCombo = t => !!t && t.t === "name" && (t.v === "nCr" || t.v === "nPr" || t.v === "ncr" || t.v === "npr");

    /* Can the token at p begin an IMPLICIT product? A name or a bracket — never a
       bare number: two numbers in a row is a typo, and multiplying them would hand
       the student a wrong answer with total confidence. */
    function startsValue() {
      const t = peek();
      if (!t) return false;
      if (t.t === "(") return true;
      if (t.t === "|") return barDepth === 0;
      return t.t === "name" && !infixCombo(t);
    }

    function expr() {
      let v = term();
      for (;;) {
        const t = peek();
        if (t && t.t === "+") { next(); v += term(); }
        else if (t && t.t === "-") { next(); v -= term(); }
        else return v;
      }
    }

    function term() {
      let v = combo();
      for (;;) {
        const t = peek();
        if (t && t.t === "*") { next(); v *= combo(); }
        else if (t && t.t === "/") {
          next();
          const d = combo();
          if (d === 0) throw err("division by zero");
          v /= d;
        } else if (startsValue()) v *= combo();
        else return v;
      }
    }

    function combo() {
      let v = unary();
      for (;;) {
        const t = peek();
        if (infixCombo(t)) {
          next();
          const r = unary();
          v = (t.v === "nCr" || t.v === "ncr") ? choose(v, r) : perm(v, r);
        } else return v;
      }
    }

    function unary() {
      const t = peek();
      if (t && t.t === "-") { next(); return -unary(); }
      if (t && t.t === "+") { next(); return unary(); }
      return power();
    }

    function power() {
      const base = postfix();
      const t = peek();
      if (t && t.t === "^") {
        next();
        const ex = unary();
        const v = Math.pow(base, ex);
        if (Number.isNaN(v) && base < 0) throw err("a negative number to a fractional power has no real value");
        return v;
      }
      return base;
    }

    function postfix() {
      let v = primary();
      for (;;) {
        const t = peek();
        if (t && t.t === "!") { next(); v = factorial(v); }
        else if (t && t.t === "%") { next(); v = v / 100; }
        else return v;
      }
    }

    function args() {
      next(); // (
      const list = [expr()];
      while (peek() && peek().t === ",") { next(); list.push(expr()); }
      const close = next();
      if (!close || close.t !== ")") throw err("a bracket is not closed");
      return list;
    }

    function primary() {
      const t = next();
      if (!t) throw err("the expression stops early");
      if (t.t === "num") return t.v;
      if (t.t === "(") {
        const v = expr();
        const close = next();
        if (!close || close.t !== ")") throw err(close && close.t === "," ? "a comma only goes between a function's values" : "a bracket is not closed");
        return v;
      }
      if (t.t === "|") {
        barDepth++;
        const v = expr();
        barDepth--;
        const close = next();
        if (!close || close.t !== "|") throw err("an absolute-value bar | is not closed");
        return Math.abs(v);
      }
      if (t.t === "name") {
        let name = t.v;
        /* The subject's constants win over the built-ins: in Physics `e` is the
           elementary charge, because that is what the data sheet calls e. */
        if (Object.prototype.hasOwnProperty.call(consts, name) && !FUNCS[name] && !FUNCS2[name]) return +consts[name];
        if (isAns(name)) return +(opts.ans || 0);
        if (isMem(name)) return +(opts.mem || 0);
        if (ALIAS_FN[name]) name = ALIAS_FN[name];
        if (FUNCS2[name]) {
          if (!peek() || peek().t !== "(") throw err(t.v + " needs two values, like " + t.v + "(5,2)");
          const a = args();
          if (name === "logb" && a.length !== 2) throw err("logb needs a base and a value, like logb(2,8)");
          if (a.length !== 2) throw err(t.v + " needs two values, like " + t.v + "(5,2)");
          return FUNCS2[name](a[0], a[1]);
        }
        const fn = FUNCS[name];
        if (fn) {
          /* sin(30) — the bracket closes the argument, so sin(30)^2 is (sin 30)².
             sin30 — the argument is a unary, so sin30+1 is (sin 30) + 1. */
          if (peek() && peek().t === "(") {
            const a = args();
            if (a.length === 2 && name === "log") return FUNCS2.logb(a[0], a[1]);
            if (a.length !== 1) throw err(t.v + " takes one value");
            return fn(a[0], deg);
          }
          if (!peek()) throw err("the expression stops early");
          return fn(unary(), deg);
        }
        if (BUILTIN[name] !== undefined) return BUILTIN[name];
        throw err('unknown name "' + t.v + '"');
      }
      if (t.t === ",") throw err("a comma only goes between a function's values");
      throw err('"' + t.t + '" is out of place here');
    }

    const value = expr();
    if (p < tokens.length) {
      const t = tokens[p];
      if (t.t === ")") throw err("there is a ) with no ( to match it");
      if (t.t === "num") throw err("two numbers in a row — put an operator between them");
      throw err("I could not read the whole expression");
    }
    return value;
  }

  function evaluate(src, opts) {
    const o = opts || {};
    if (!String(src === undefined || src === null ? "" : src).trim()) return { ok: false, error: "" };
    try {
      const value = parse(tokenize(src, o.consts), o);
      if (typeof value !== "number" || Number.isNaN(value)) return { ok: false, error: "that does not come out as a number" };
      if (!isFinite(value)) return { ok: false, error: "the result is too big to show" };
      return { ok: true, value: Object.is(value, -0) ? 0 : value };
    } catch (e) {
      return { ok: false, error: e && e.friendly ? e.message : "I cannot read that expression" };
    }
  }

  /** The placeholder's API: a number, or null. */
  function evalString(src, opts) {
    const r = evaluate(src, opts);
    return r.ok ? r.value : null;
  }

  function trim(s) {
    if (/e/i.test(s)) return String(Number(s));
    return s.indexOf(".") >= 0 ? s.replace(/0+$/, "").replace(/\.$/, "") : s;
  }
  function split(x, sig) {
    const exp = Math.floor(Math.log10(Math.abs(x)));
    let mant = x / Math.pow(10, exp);
    let e = exp;
    let m = trim(mant.toPrecision(Math.min(sig, 10)));
    if (Math.abs(Number(m)) >= 10) { e++; m = trim((mant / 10).toPrecision(Math.min(sig, 10))); }
    return { m, e };
  }
  const bandOut = mag => mag >= 1e10 || mag < 1e-4;

  /** Display form: 10 significant figures, "6.626×10⁻³⁴" outside 10⁻⁴…10¹⁰. */
  function format(x, sig) {
    const digits = sig || 10;
    if (!isFinite(x)) return "—";
    if (x === 0) return "0";
    if (bandOut(Math.abs(x))) {
      const { m, e } = split(x, digits);
      return m + "×10" + sup(String(e));
    }
    return trim(x.toPrecision(digits));
  }
  const SUP = { "-": "⁻", "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹" };
  const sup = s => s.split("").map(ch => SUP[ch] || ch).join("");

  /** Notation-source form (Physics' U.math): "6.626 \times 10^{-34}". */
  function tex(x, sig) {
    const digits = sig || 10;
    if (x === 0) return "0";
    if (bandOut(Math.abs(x))) {
      const { m, e } = split(x, digits);
      return m + " \\times 10^{" + e + "}";
    }
    return trim(x.toPrecision(digits));
  }

  /** A plain number string for typing into an answer box; reads back exactly. */
  function plain(x, sig) { return trim(Number(x).toPrecision(sig || 12)); }

  /** Every name the engine knows, for a reference list. */
  function names(consts) {
    const out = [{ name: "pi", what: "π" }, { name: "ans", what: "the previous result" },
                 { name: "mem", what: "the memory" }];
    if (!consts || !Object.prototype.hasOwnProperty.call(consts, "e")) out.splice(1, 0, { name: "e", what: "Euler's number" });
    Object.keys(consts || {}).forEach(k => out.push({ name: k, value: consts[k] }));
    return out;
  }

  return { evaluate, evalString, format, tex, plain, names, tokenize, factorial, choose, perm,
           FUNCS, FUNCS2, BUILTIN };
})();
