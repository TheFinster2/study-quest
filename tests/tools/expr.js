/* tests/tools/expr.js — SQ.Expr, the calculator's arithmetic, pinned to a table.

   Ported from Physics-Study-App tests/calculator.js (every assertion, with the data
   sheet's constants supplied through opts.consts the way SQ.Tools passes them) and
   the arithmetic of Maths-advanced-app tests/calc.js, plus the merged features
   (nCr/nPr, factorial, percent, memory, Euler's e when no sheet defines e).

   Run:  node tests/tools/expr.js */
const { load } = require("../lib/vm");
const { constants } = require("./fixtures");

const ctx = load(["js/sq/expr.js"]);
const Expr = ctx.SQ.Expr;

/* The map SQ.Tools builds for Physics: every constant by id, plus its aliases. */
const PHYS = {};
constants.forEach(c => { PHYS[c.id] = c.value; (c.aliases || []).forEach(a => (PHYS[a] = c.value)); });
const T = id => constants.find(c => c.id === id).value;

let pass = 0, fail = 0;
const bad_ = m => { fail++; console.log("  ✗ " + m); };
function eq(src, expected, opts) {
  const o = Object.assign({ consts: PHYS }, opts || {});
  const r = Expr.evaluate(src, o);
  if (!r.ok) return bad_(`${src} → error "${r.error}", expected ${expected}`);
  const tol = Math.max(1e-9, Math.abs(expected) * 1e-9);
  if (Math.abs(r.value - expected) > tol) return bad_(`${src} → ${r.value}, expected ${expected}`);
  pass++;
}
function bad(src, opts) {
  const r = Expr.evaluate(src, Object.assign({ consts: PHYS }, opts || {}));
  if (r.ok) return bad_(`${src} → ${r.value}, expected a refusal`);
  if (!r.error || /\[object|undefined|null/.test(r.error)) return bad_(`${src} refused unhelpfully: "${r.error}"`);
  pass++;
}
const check = (cond, msg) => (cond ? pass++ : bad_(msg));
const D = { deg: true }, R = { deg: false };

/* ── Physics: precedence and associativity ── */
eq("1+2*3", 7); eq("(1+2)*3", 9); eq("8/4/2", 1); eq("2-3-4", -5);
eq("2^3^2", 512); eq("-2^2", -4); eq("(-2)^2", 4); eq("2^-3", 0.125);
eq("-3^2+1", -8); eq("--5", 5); eq("+7", 7); eq("2*-3", -6);
/* implicit multiplication */
eq("3(4+5)", 27); eq("(1+2)(3+4)", 21); eq("2pi", 2 * Math.PI); eq("4pi^2", 4 * Math.PI * Math.PI);
bad("2(3)4");
/* numbers as typed */
eq("1.5E3", 1500); eq("1.5E-3", 0.0015); eq("2e3", 2000); eq(".5+.25", 0.75);
bad("1 000 + 1"); bad("2 3");
/* functions, degrees */
eq("sin30", 0.5, D); eq("sin(30)", 0.5, D); eq("cos60", 0.5, D); eq("tan45", 1, D);
eq("sin(pi/2)", 1, R); eq("asin(0.5)", 30, D); eq("atan(1)", 45, D); eq("atan(1)", Math.PI / 4, R);
eq("sin30+1", 1.5, D); eq("2sin30", 1, D); eq("sqrt(16)", 4); eq("√16", 4); eq("sqrt(9)+sqrt(16)", 7);
eq("ln(exp(2))", 2); eq("log(1000)", 3); eq("abs(-4.5)", 4.5); eq("5²", 25); eq("2³", 8);
{
  const a = Expr.evaluate("sin30", D).value, b = Expr.evaluate("sin30", R).value;
  check(Math.abs(a - b) > 0.01, "the degrees/radians mode makes no difference to sin30");
}
/* the data sheet's own values */
eq("g", 9.8); eq("c", 3.0e8); eq("h", 6.626e-34); eq("G", 6.67e-11); eq("me", 9.109e-31);
eq("e", 1.602e-19);                 // e is the ELEMENTARY CHARGE when the sheet says so
eq("exp(1)", Math.E);
eq("k", T("kCoulomb")); eq("kCoulomb", T("kCoulomb")); eq("GME", T("GME")); eq("mSun", T("mSun"));
eq("qe", T("e")); eq("eps", T("eps0")); eq("GMe", T("GME"));
for (const c of constants) {
  const r = Expr.evaluate(c.id, { consts: PHYS });
  check(r.ok && r.value === c.value, `constant ${c.id} is not reachable from the calculator`);
}
/* a real physics calculation, end to end */
eq("sqrt(2*GME/rE)", Math.sqrt(2 * T("GME") / T("rE")));
eq("h*c/500E-9", 6.626e-34 * 3.0e8 / 500e-9);
eq("h*c/500E-9/eV", 6.626e-34 * 3.0e8 / 500e-9 / T("eV"));
eq("20^2*sin60/g", 400 * Math.sin(60 * Math.PI / 180) / 9.8, D);
eq("gh", 9.8 * 6.626e-34);          // longest-known-prefix names
/* ans */
eq("ans*2", 84, { ans: 42 }); eq("ans", 0, {});
/* refusals */
["1/0", "(1+2", "1+2)", "sqrt(-4)", "ln(0)", "log(-1)", "asin(2)", "2+", "*3", "nonsense", "1 $ 2", "1e999*1e999"].forEach(s => bad(s));
/* formatting (Physics' notation form is tex()) */
const fmt = [[0, "0"], [42, "42"], [0.5, "0.5"], [1 / 3, "0.3333333333"], [1500, "1500"],
  [6.626e-34, "6.626 \\times 10^{-34}"], [3e8, "300000000"], [4e14, "4 \\times 10^{14}"]];
for (const [v, want] of fmt) { const got = Expr.tex(v); check(got === want, `tex(${v}) → "${got}", expected "${want}"`); }
/* the display form of the same numbers */
const disp = [[0, "0"], [1 / 3, "0.3333333333"], [6.626e-34, "6.626×10⁻³⁴"], [4e14, "4×10¹⁴"], [-2.5e-7, "-2.5×10⁻⁷"]];
for (const [v, want] of disp) { const got = Expr.format(v); check(got === want, `format(${v}) → "${got}", expected "${want}"`); }
/* plain() round-trips through the parser */
for (const v of [1 / 3, 6.626e-34, 1500, -0.0025, 3e8]) {
  const p = Expr.plain(v);
  const back = Expr.evaluate(p, {});
  check(isFinite(Number(p)) && back.ok && Math.abs(back.value - v) <= Math.abs(v) * 1e-9, `plain(${v}) → "${p}" does not read back`);
}

/* ── Maths Advanced: the keypad sums (as the expressions the keys insert) ── */
eq("7*8", 56); eq("2+3*4", 14); eq("(2+3)*4", 20); eq("2^10", 1024);
eq("9sqrt(9)", 27);                  // sqrt is a function, not a postfix
eq("10!", 3628800); eq("50%*80", 40); eq("1/3", 1 / 3);
eq("sin(30)", 0.5, D); eq("sin(pi/2)", 1, R); eq("asin(0.5)", 30, D);
eq("ans+8", 50, { ans: 42 });
eq("12*3", 36);

/* ── merged features ── */
eq("e", Math.E, { consts: {} });     // Euler's e when no sheet defines it
eq("ln(e)", 1, { consts: {} });
eq("5 nCr 2", 10); eq("nCr(5,2)", 10); eq("ncr(10,3)", 120); eq("5 nPr 2", 20); eq("nPr(6,6)", 720);
eq("0!", 1); eq("3!^2", 36); eq("-3!", -6); eq("2^3!", 64);
eq("mem*2", 14, { mem: 7 }); eq("M+1", 8, { mem: 7 });
eq("cbrt(27)", 3); eq("∛8", 2); eq("logb(2,8)", 3); eq("log(2,8)", 3); eq("log10(100)", 2);
eq("|-3|+|2|", 5); eq("sin(30)^2", 0.25, D); eq("2^(-1)", 0.5); eq("4⁻¹", 0.25);
eq("sind(30)", 0.5, R); eq("sinh(0)", 0); eq("cosh(0)", 1); eq("tanh(0)", 0);
eq("6×7", 42); eq("8÷2", 4); eq("5−7", -2); eq("π", Math.PI);
bad("(-1)^0.5"); bad("3.5!"); bad("nCr(2,5)"); bad("nCr(5)"); bad("171!"); bad("tan(90)", D);
bad("acosh(0)"); bad("1,2");
check(Expr.evalString("1+1") === 2 && Expr.evalString("1+") === null, "evalString returns a number or null");
check(Expr.evaluate("", {}).ok === false && Expr.evaluate("", {}).error === "", "empty input is a quiet non-result");
/* no eval anywhere in the engine */
{
  const src = require("fs").readFileSync(require("path").join(__dirname, "../../js/sq/expr.js"), "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
  check(!/\beval\s*\(|new\s+Function|Function\s*\(/.test(src), "expr.js must not use eval or Function");
}
/* hostile input never throws */
for (const s of ["constructor", "__proto__", "toString", "alert(1)", "))))", "^^^", "9".repeat(400), "(".repeat(300)]) {
  let threw = false, r;
  try { r = Expr.evaluate(s, { consts: PHYS }); } catch (e) { threw = true; }
  check(!threw && r && typeof r.ok === "boolean", `"${s.slice(0, 20)}" threw instead of returning a result`);
}

console.log(`tools/expr: ${pass} passed, ${fail} failed`);
if (fail) process.exitCode = 1;
