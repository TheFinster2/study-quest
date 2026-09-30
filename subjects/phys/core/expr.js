/* Arithmetic expression engine for the on-screen calculator.

   ── Why a parser and not eval() ──────────────────────────────────────────────
   `eval` on a text field is a script-injection hole with extra steps, and it also
   gets the physics wrong: it has no degrees mode, no data-sheet constants, no
   implicit multiplication, and it answers `-2^2` with 4 because JavaScript's `**`
   binds tighter than unary minus. A student typing -2^2 means -(2²). So this is a
   recursive-descent parser, about 200 lines, and tests/calculator.js pins every
   one of those behaviours against a table of expected values.

   ── What it accepts ─────────────────────────────────────────────────────────
     1 + 2*3            ordinary precedence
     2^3^2              right-associative powers → 512, not 64
     -2^2               → -4   (unary minus binds LOOSER than ^)
     2^-3               → 0.125 (…but the exponent may be signed)
     3(4+5)  2pi  2sin30    implicit multiplication
     1.5E-3             scientific entry, the ×10ˣ key
     sin30              degrees or radians, per the mode
     g  c  h  me  kCoulomb    the data sheet's own values at the sheet's precision
     ans                the previous result

   Every constant comes from PHYS.DATA.constants, so the calculator cannot
   disagree with the questions: if a question was computed with g = 9.8, the
   calculator uses 9.8 too. */
window.PHYS = window.PHYS || {};

PHYS.Expr = (function () {
  const DEG = Math.PI / 180;

  /* Functions of one argument. The degrees flag is threaded in rather than read
     from a global, so a test can pin both modes without touching app state. */
  const FUNCS = {
    sin:   (x, deg) => Math.sin(deg ? x * DEG : x),
    cos:   (x, deg) => Math.cos(deg ? x * DEG : x),
    tan:   (x, deg) => Math.tan(deg ? x * DEG : x),
    asin:  (x, deg) => wrapInverse(Math.asin, x, deg, -1, 1, "arcsin"),
    acos:  (x, deg) => wrapInverse(Math.acos, x, deg, -1, 1, "arccos"),
    atan:  (x, deg) => (deg ? Math.atan(x) / DEG : Math.atan(x)),
    sinh:  x => Math.sinh(x),
    cosh:  x => Math.cosh(x),
    tanh:  x => Math.tanh(x),
    ln:    x => { if (x <= 0) throw err("ln needs a positive number"); return Math.log(x); },
    log:   x => { if (x <= 0) throw err("log needs a positive number"); return Math.log10(x); },
    sqrt:  x => { if (x < 0) throw err("no square root of a negative number"); return Math.sqrt(x); },
    exp:   x => Math.exp(x),
    abs:   x => Math.abs(x)
  };

  function wrapInverse(fn, x, deg, lo, hi, name) {
    if (x < lo || x > hi) throw err(name + " needs a value between " + lo + " and " + hi);
    const r = fn(x);
    return deg ? r / DEG : r;
  }

  /* Names that are not from the data sheet. `e` is deliberately NOT Euler's
     number: this is a physics calculator, where e is the elementary charge, and
     Euler's is available as exp(1). Scientific entry still works, because the
     number scanner takes `2e3` as 2000 before `e` is ever looked up. */
  const EXTRA = {
    pi: Math.PI, PI: Math.PI, Pi: Math.PI,
    inf: Infinity
  };

  /** Aliases onto data-sheet ids, for the symbols students actually write. */
  const ALIAS = { k: "kCoulomb", qe: "e", eps: "eps0", GMe: "GME" };

  function err(message) {
    const e = new Error(message);
    e.friendly = true;
    return e;
  }

  /** Every name the engine knows, for the calculator's own reference list. */
  function names() {
    const C = (PHYS.DATA && PHYS.DATA.constants) || null;
    const out = Object.keys(EXTRA).filter(k => k === "pi").map(k => ({ name: k, what: "π" }));
    out.push({ name: "ans", what: "the previous result" });
    if (C) {
      for (const c of C.list()) out.push({ name: c.id, what: c.name, sym: c.sym, value: c.value });
    }
    return out;
  }

  function lookup(name, opts) {
    if (name === "ans" || name === "ANS" || name === "Ans") return opts.ans || 0;
    if (EXTRA[name] !== undefined) return EXTRA[name];
    const id = ALIAS[name] || name;
    const C = PHYS.DATA && PHYS.DATA.constants;
    if (C && C.table[id] !== undefined) return C.table[id].value;
    if (C && C.supplied[id] !== undefined) return C.supplied[id].value;
    throw err('unknown name "' + name + '"');
  }

  /* ── tokeniser ──────────────────────────────────────────────────────────── */
  function tokenize(src) {
    const s = String(src);
    const out = [];
    let i = 0;
    while (i < s.length) {
      const c = s[i];
      if (c === " " || c === "\t" || c === "," || c === "_") { i++; continue; }

      // Number, including a scientific exponent — but only when digits follow the
      // E, so a half-typed "2E" is still two tokens rather than a broken number.
      if (/[0-9]/.test(c) || (c === "." && /[0-9]/.test(s[i + 1] || ""))) {
        let j = i;
        while (j < s.length && /[0-9]/.test(s[j])) j++;
        if (s[j] === ".") { j++; while (j < s.length && /[0-9]/.test(s[j])) j++; }
        const expMark = s[j];
        if (expMark === "e" || expMark === "E") {
          let k = j + 1;
          if (s[k] === "+" || s[k] === "-") k++;
          if (/[0-9]/.test(s[k] || "")) {
            while (k < s.length && /[0-9]/.test(s[k])) k++;
            j = k;
          }
        }
        out.push({ t: "num", v: parseFloat(s.slice(i, j)) });
        i = j; continue;
      }

      if (/[A-Za-z]/.test(c)) {
        let j = i;
        while (j < s.length && /[A-Za-z0-9]/.test(s[j])) j++;
        let word = s.slice(i, j);
        /* Longest known prefix, so `2pi` and `sin30` and `gh` all work without the
           student having to insert operators the calculator can infer. */
        while (word.length > 1 && !isKnown(word)) word = word.slice(0, -1);
        out.push({ t: "name", v: word });
        i += word.length; continue;
      }

      if ("+-*/^()".indexOf(c) >= 0) { out.push({ t: c }); i++; continue; }
      // The keypad's prettier glyphs.
      if (c === "×" || c === "·") { out.push({ t: "*" }); i++; continue; }
      if (c === "÷") { out.push({ t: "/" }); i++; continue; }
      if (c === "−") { out.push({ t: "-" }); i++; continue; }
      if (c === "√") { out.push({ t: "name", v: "sqrt" }); i++; continue; }
      if (c === "π") { out.push({ t: "name", v: "pi" }); i++; continue; }
      if (c === "²") { out.push({ t: "^" }, { t: "num", v: 2 }); i++; continue; }
      if (c === "³") { out.push({ t: "^" }, { t: "num", v: 3 }); i++; continue; }
      throw err('"' + c + '" is not something I can calculate with');
    }
    return out;
  }

  function isKnown(word) {
    if (FUNCS[word]) return true;
    if (word === "ans" || word === "ANS" || word === "Ans") return true;
    if (EXTRA[word] !== undefined) return true;
    if (ALIAS[word]) return true;
    const C = PHYS.DATA && PHYS.DATA.constants;
    return !!(C && (C.table[word] !== undefined || C.supplied[word] !== undefined));
  }

  /* ── parser ─────────────────────────────────────────────────────────────── */
  function parser(tokens, opts) {
    let p = 0;
    const peek = () => tokens[p];
    const next = () => tokens[p++];

    /** Can the token at p begin an IMPLICIT product? That is what makes 3(4+5) and
        2pi work. Deliberately NOT a bare number: "1 000 + 1" would then read as
        1 × 000 + 1 = 1, a wrong answer delivered with total confidence, where the
        student meant a thousand. Two numbers in a row is a typo, so it is refused. */
    function startsValue() {
      const t = peek();
      return !!t && (t.t === "name" || t.t === "(");
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
      let v = unary();
      for (;;) {
        const t = peek();
        if (t && t.t === "*") { next(); v *= unary(); }
        else if (t && t.t === "/") {
          next();
          const d = unary();
          if (d === 0) throw err("division by zero");
          v /= d;
        } else if (startsValue()) {
          // Implicit multiplication: 2pi, 3(4+5), 2sin30.
          v *= unary();
        } else return v;
      }
    }

    function unary() {
      const t = peek();
      if (t && t.t === "-") { next(); return -unary(); }
      if (t && t.t === "+") { next(); return unary(); }
      return power();
    }

    /* Right-associative, and the exponent goes through unary() so `2^-3` parses.
       Note what this does NOT do: bind tighter than unary minus. -2^2 is -4. */
    function power() {
      const base = primary();
      const t = peek();
      if (t && t.t === "^") { next(); return Math.pow(base, unary()); }
      return base;
    }

    function primary() {
      const t = next();
      if (!t) throw err("the expression stops early");
      if (t.t === "num") return t.v;
      if (t.t === "(") {
        const v = expr();
        const close = next();
        if (!close || close.t !== ")") throw err("a bracket is not closed");
        return v;
      }
      if (t.t === "name") {
        const fn = FUNCS[t.v];
        if (fn) {
          /* Both sin(30) and sin30 — the argument is a unary, so sin30+1 is
             (sin 30) + 1 and sin2pi is sin(2π), which is how a calculator behaves. */
          const arg = unary();
          return fn(arg, !!opts.deg);
        }
        return lookup(t.v, opts);
      }
      throw err('"' + (t.t === "num" ? t.v : t.t) + '" is out of place here');
    }

    const value = expr();
    if (p < tokens.length) throw err("I could not read the whole expression");
    return value;
  }

  /**
   * Evaluate an expression.
   * opts: { deg: boolean, ans: number }
   * Returns { ok:true, value } or { ok:false, error } — never throws for input,
   * because this runs on every keystroke to drive the live preview.
   */
  function evaluate(src, opts) {
    const o = opts || {};
    if (!String(src || "").trim()) return { ok: false, error: "" };
    try {
      const value = parser(tokenize(src), o);
      if (typeof value !== "number" || Number.isNaN(value))
        return { ok: false, error: "that does not come out as a number" };
      if (!isFinite(value)) return { ok: false, error: "the result is too big to show" };
      return { ok: true, value };
    } catch (e) {
      return { ok: false, error: e && e.friendly ? e.message : "I cannot read that expression" };
    }
  }

  /**
   * Format a result as notation source (so U.math renders the ×10 properly).
   * Physics answers span 10⁻³⁴ to 10²⁴, so this switches to scientific notation
   * outside a comfortable middle band rather than printing twenty zeros.
   */
  function format(x, sig) {
    const digits = sig || 10;
    if (x === 0) return "0";
    const mag = Math.abs(x);
    if (mag >= 1e10 || mag < 1e-4) {
      const exp = Math.floor(Math.log10(mag));
      const mant = x / Math.pow(10, exp);
      return trim(mant.toPrecision(Math.min(digits, 10))) + " \\times 10^{" + exp + "}";
    }
    return trim(x.toPrecision(digits));
  }

  /** The same number as a plain string, for typing into an answer box. */
  function plain(x, sig) {
    return trim(Number(x).toPrecision(sig || 12));
  }

  function trim(s) {
    if (s.indexOf("e") >= 0 || s.indexOf("E") >= 0) return String(Number(s));
    return s.indexOf(".") >= 0 ? s.replace(/0+$/, "").replace(/\.$/, "") : s;
  }

  return { evaluate, format, plain, names, tokenize, FUNCS, ALIAS };
})();
