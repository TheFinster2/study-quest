#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════
   Content validator. Node only, no browser, no test framework.

   Loads every data file in a `vm` sandbox where the context global IS
   `window`, then asserts content invariants. Run it constantly while
   authoring — it is far cheaper than finding a broken question in play.

       node tests/validate.js
       BREAK=<name> node tests/validate.js    (see the bottom of this file)

   The BREAK mode is the habit that matters more than any individual check
   here: it deletes a specific guard with a regex and asserts the suite then
   FAILS. A test that passes with its fix removed is worthless, and three of
   them were quietly worthless in the reference app until this existed.
   ═══════════════════════════════════════════════════════════════ */

const fs = require("fs");
const path = require("path");
const vm = require("vm");
const L = require("./_load");

const ROOT = L.ROOT;
const SUB = L.SUB;
const BREAK = process.env.BREAK || "";

let failures = 0, checks = 0;
const notes = [];

function ok(cond, label, detail) {
  checks++;
  if (cond) return true;
  failures++;
  console.log("  ✗ " + label + (detail ? "\n      " + detail : ""));
  return false;
}
function section(name) { console.log("\n" + name); }
function pass(label, extra) { checks++; console.log("  ✓ " + label + (extra ? "  " + extra : "")); }

/* ── the sandbox ──────────────────────────────────────────────
   The shared core (store, subject-state, the bound UI) plus the subject's
   engine and content, in manifest order — see _load.js. `tiers` pins the
   Extension 1 toggle for that context, so both configurations are validated
   in one process. */
function makeContext(tiers) {
  return L.load({ tiers, patch: (rel, src) => (BREAK ? applyBreak(rel, src) : src) });
}

/* Deliberately breaking a guard, to prove the test that covers it works. */
const BREAKS = {
  "answer-first": [SUB + "data/generators.js",
    /item\.answer = g\.solve\(item\.params\);/, "item.answer = item.answer;"],
  "tier-filter": [SUB + "core/bank.js",
    /ALL = merged\.filter\(q => MA\.DATA\.tierEnabled\(q\.topic\)\);/, "ALL = merged;"],
  "escape": [SUB + "core/util.js",
    /return render\(derivPrepass\(escapeHtml\(String\(str\)\)\)\);/, "return render(derivPrepass(String(str)));"],
  "domain": [SUB + "core/expr.js",
    /const \[lo, hi\] = o\.domain \|\| DEFAULT_DOMAIN;/, "const [lo, hi] = DEFAULT_DOMAIN;"],
  /* The curve bug as it actually shipped: the fallback distractor invented a
     new label and reused the KEY'S parameters, so a reverse round drew the
     correct graph twice. */
  "curve-dupe": [SUB + "games/curve.js",
    /const base = paramSets\[1 \+ Math\.floor\(rng\(\) \* \(paramSets\.length - 1\)\)\] \|\| params;\n      accept\(fam\.vary\(base, rng\)\);/,
    "labels.push(key + ' + ' + guard); paramSets.push(params);"],
  /* A NESA flag set to the wrong value is the one failure mode this feature
     has that a student would never catch. */
  "nesa-flag": [SUB + "data/formulas.js",
    /\{id:"f-fv",\s+g:"series", tier:"MA", nesa:false,/,
    '{id:"f-fv", g:"series", tier:"MA", nesa:true,'],
  /* The upgrade's guard: the question cache must rebuild when the live
     Extension 1 toggle changes, or switching it does nothing until a reload. */
  "tier-live": [SUB + "core/bank.js",
    /if \(ALL_KEY !== MA\.DATA\.tierKey\(\)\) ALL = null;/, ""],
  "minclean": [SUB + "core/expr.js",
    /if \(clean < minClean\) return \{ equal: false, reason: "undefined", clean \};/, ""]
};
let breakApplied = false;
function applyBreak(rel, src) {
  const spec = BREAKS[BREAK];
  if (!spec || spec[0] !== rel) return src;
  const out = src.replace(spec[1], spec[2]);
  if (out === src) {
    console.error(`BREAK "${BREAK}" did not match anything in ${rel} — the patch is stale.`);
    process.exit(2);
  }
  // A patched file that no longer parses would "fail" for the wrong reason.
  try { new Function(out); } catch (e) {
    console.error(`BREAK "${BREAK}" produced a file that does not parse: ${e.message}`);
    process.exit(2);
  }
  breakApplied = true;
  return out;
}

/* ═══════════════ the checks ═══════════════ */

console.log("Maths Advanced (madv) content validator" + (BREAK ? `  [BREAK=${BREAK}]` : ""));

const ctxFull = makeContext(["MA", "ME"]);
const MA = ctxFull.MA;
const U = MA.U;
const questions = MA.Bank.all();

/* ── 1. structural invariants ─────────────────────────────── */
section("Structure");
{
  const ids = new Set();
  let dupes = 0, badChoices = 0, badAnswer = 0, badWhy = 0, badTopic = 0,
      badDiff = 0, dupChoices = 0, noSub = 0;
  const validTopics = new Set(MA.Bank.TOPICS.map(t => t.id));

  for (const q of questions) {
    if (ids.has(q.id)) { dupes++; console.log("      duplicate id: " + q.id); }
    ids.add(q.id);
    if (!Array.isArray(q.choices) || q.choices.length !== 4) { badChoices++; console.log("      not 4 choices: " + q.id); }
    if (q.a !== 0) { badAnswer++; console.log("      a is not 0: " + q.id); }
    if (!q.why || !q.why.trim()) { badWhy++; console.log("      empty why: " + q.id); }
    if (!validTopics.has(q.topic)) { badTopic++; console.log("      bad topic: " + q.id + " → " + q.topic); }
    if (!(q.diff >= 1 && q.diff <= 3)) { badDiff++; console.log("      diff out of range: " + q.id); }
    if (new Set(q.choices).size !== q.choices.length) { dupChoices++; console.log("      duplicate choices: " + q.id); }
    if (!q.sub) noSub++;
  }

  ok(dupes === 0, "unique question ids");
  ok(badChoices === 0, "every question has exactly 4 choices");
  ok(badAnswer === 0, "every stored answer is at index 0");
  ok(badWhy === 0, "every question has a worked explanation");
  ok(badTopic === 0, "every topic code is valid");
  ok(badDiff === 0, "every difficulty is 1-3");
  ok(dupChoices === 0, "no question repeats a choice");
  if (!dupes && !badChoices && !badAnswer && !badWhy && !badTopic && !badDiff && !dupChoices) {
    pass("structural invariants", `(${questions.length} questions)`);
  }
}

/* ── 2. content volume ────────────────────────────────────── */
section("Volume");
{
  const ma = questions.filter(q => q.topic.startsWith("MA-")).length;
  const me = questions.filter(q => q.topic.startsWith("ME-")).length;
  const cards = MA.DATA.flashcards;
  const cardsMa = cards.filter(c => c.topic.startsWith("MA-")).length;
  const cardsMe = cards.filter(c => c.topic.startsWith("ME-")).length;
  const proofs = MA.DATA.proofs;
  const inductions = proofs.filter(p => p.kind === "induction").length;

  ok(ma >= 400, "≥ 400 Advanced questions", `have ${ma}`) && pass("Advanced questions", `${ma}`);
  ok(me >= 150, "≥ 150 Extension 1 questions", `have ${me}`) && pass("Extension 1 questions", `${me}`);
  ok(cardsMa >= 80, "≥ 80 Advanced flashcards", `have ${cardsMa}`) && pass("Advanced flashcards", `${cardsMa}`);
  ok(cardsMe >= 40, "≥ 40 Extension 1 flashcards", `have ${cardsMe}`) && pass("Extension 1 flashcards", `${cardsMe}`);
  ok(MA.Gen.all().length >= 40, "≥ 40 generators", `have ${MA.Gen.all().length}`) &&
    pass("generators", `${MA.Gen.all().length}`);
  ok(proofs.length >= 12, "≥ 12 proof puzzles", `have ${proofs.length}`) && pass("proof puzzles", `${proofs.length}`);
  ok(inductions >= 6, "≥ 6 induction puzzles", `have ${inductions}`) && pass("induction puzzles", `${inductions}`);
  ok(MA.DATA.achievements.length >= 65, "≥ 65 achievements", `have ${MA.DATA.achievements.length}`) &&
    pass("achievements", `${MA.DATA.achievements.length}`);
}

/* ── 3. answer-length bias ────────────────────────────────────
   Writing a thorough correct answer and three throwaway distractors makes
   the key guessable from length alone — measured at 63.9% in the reference
   app before it was fixed. The overall limit is not enough on its own: a
   healthy-looking 24% average there was hiding one module at 38%. */
section("Answer bias");
{
  /* The strategy being modelled is "glance at the options and pick the visibly
     longest one". Two options differing by a single character are not visibly
     different, so anything within a small tolerance of the maximum counts as
     tied and the credit is split — otherwise `"10","4","6","2"` scores as a
     bias when nobody could exploit it. */
  const near = max => Math.max(2, Math.round(max * 0.15));

  const perTopic = {};
  let longestWins = 0, strictWins = 0;

  for (const q of questions) {
    const lens = q.choices.map(c => c.length);
    const max = Math.max(...lens);
    const tol = near(max);
    const tiedAtMax = lens.filter(l => l >= max - tol).length;
    const keyIsLongest = lens[0] >= max - tol;
    if (keyIsLongest) longestWins += 1 / tiedAtMax;
    if (lens[0] === max && lens.filter(l => l === max).length === 1) strictWins++;

    const t = perTopic[q.topic] || (perTopic[q.topic] = { n: 0, w: 0 });
    t.n++;
    if (keyIsLongest) t.w += 1 / tiedAtMax;
  }

  const overall = (longestWins / questions.length) * 100;
  const strict = (strictWins / questions.length) * 100;
  ok(overall <= 32, `longest-option scoring ≤ 32%`, `measured ${overall.toFixed(1)}%`) &&
    pass("longest-option scoring", `${overall.toFixed(1)}% (chance is 25%)`);
  pass("strictly-longest-is-key", `${strict.toFixed(1)}%`);

  const worst = Object.entries(perTopic)
    .map(([id, t]) => ({ id, pct: (t.w / t.n) * 100, n: t.n }))
    .filter(t => t.n >= 15)
    .sort((a, b) => b.pct - a.pct)[0];
  if (worst) {
    ok(worst.pct <= 36, "no single topic above 36%",
      `worst is ${worst.id} at ${worst.pct.toFixed(1)}% over ${worst.n} questions`) &&
      pass("worst topic", `${worst.id} at ${worst.pct.toFixed(1)}%`);
  }

  /* Maths has its OWN version of this tell: the most structurally complex
     option is often the key, because distractors get written as
     simplifications. Measure it the same way. */
  let complexWins = 0;
  for (const q of questions) {
    const cx = q.choices.map(c => (c.match(/[\\^_{}+\-*/]/g) || []).length);
    const max = Math.max(...cx);
    const tol = Math.max(1, Math.round(max * 0.2));
    const tied = cx.filter(v => v >= max - tol).length;
    if (cx[0] >= max - tol) complexWins += 1 / tied;
  }
  const cpct = (complexWins / questions.length) * 100;
  ok(cpct <= 36, "most-complex-option scoring ≤ 36%", `measured ${cpct.toFixed(1)}%`) &&
    pass("most-complex-option scoring", `${cpct.toFixed(1)}%`);
}

/* ── 4. near-duplicate questions ──────────────────────────────
   Comparing token SETS flags "P(A and B)" as a duplicate of "P(A or B)" —
   identical tokens, opposite questions. Word PAIRS fix it, and digits,
   operators and symbols stay in the tokens because stripping them is what
   collapsed those two into the same set. */
section("Duplicates");
{
  const bigrams = q => {
    const toks = String(q.q).toLowerCase().match(/[a-z0-9\\^_{}+\-*/=<>|]+/g) || [];
    const out = new Set();
    for (let i = 0; i < toks.length - 1; i++) out.add(toks[i] + " " + toks[i + 1]);
    return out;
  };
  const jaccard = (a, b) => {
    if (!a.size || !b.size) return 0;
    let inter = 0;
    a.forEach(x => { if (b.has(x)) inter++; });
    return inter / (a.size + b.size - inter);
  };

  const byTopic = {};
  questions.forEach(q => (byTopic[q.topic] = byTopic[q.topic] || []).push(q));

  let found = 0;
  for (const list of Object.values(byTopic)) {
    const grams = list.map(bigrams);
    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        const s = jaccard(grams[i], grams[j]);
        if (s > 0.75) {
          found++;
          console.log(`      ${(s * 100).toFixed(0)}% similar: ${list[i].id} / ${list[j].id}`);
          console.log(`        ${list[i].q}`);
          console.log(`        ${list[j].q}`);
        }
      }
    }
  }
  ok(found === 0, "no near-duplicate questions (bigram Jaccard > 0.75)",
    "fixing one can expose another — re-run until clean") && pass("no near-duplicates");
}

/* ── 5. the maths renderer ────────────────────────────────── */
section("Renderer");
{
  const strings = [];
  questions.forEach(q => { strings.push(q.q, q.why); q.choices.forEach(c => strings.push(c)); });
  MA.DATA.flashcards.forEach(c => strings.push(c.q, c.a));
  MA.DATA.proofs.forEach(p => {
    strings.push(p.title, p.goal);
    p.steps.forEach(s => strings.push(s));
    (p.traps || []).forEach(s => strings.push(s));
  });
  MA.DATA.reference.forEach(r => {
    strings.push(r.title, r.blurb, r.note || "");
    r.cols.forEach(c => strings.push(c));
    r.rows.forEach(row => MA.Reference.cells(row).forEach(c => strings.push(c)));
  });
  MA.DATA.formulas.forEach(f => { strings.push(f.name, f.tex, f.hint || ""); });

  let unbalanced = 0, leftover = 0, rawTag = 0, empty = 0;
  const KNOWN = /\\(frac|dfrac|tfrac|binom|sqrt|vec|bar|overline|hat|abs|norm|text|mathbb|ang|int|iint|oint|sum|prod|lim|limsup|liminf|[a-zA-Z]+)/g;

  for (const s of strings) {
    if (s === undefined || s === null) { empty++; continue; }
    // Braces must balance, or readGroup() silently swallows the rest of the line.
    let depth = 0, bad = false;
    for (const ch of String(s)) {
      if (ch === "{") depth++;
      else if (ch === "}") { depth--; if (depth < 0) { bad = true; break; } }
    }
    if (bad || depth !== 0) { unbalanced++; console.log("      unbalanced braces: " + s); }

    const html = U.math(s);
    // A backslash surviving into the output means an unrecognised command.
    if (html.includes("\\")) { leftover++; console.log("      leftover backslash: " + s + "\n        → " + html); }
    // Raw markup reaching the DOM would be an XSS hole in a study app.
    if (/<(?!\/?(span|sup|sub|b|i|em)\b)/.test(html)) {
      rawTag++;
      console.log("      unexpected tag in output: " + s + "\n        → " + html);
    }
  }
  ok(unbalanced === 0, "every string has balanced braces");
  ok(leftover === 0, "no unrecognised \\commands survive rendering");
  ok(rawTag === 0, "no raw markup reaches the DOM");
  ok(empty === 0, "no null/undefined strings");
  if (!unbalanced && !leftover && !rawTag && !empty) pass("renderer round-trip", `(${strings.length} strings)`);

  // The escaping order is load-bearing; assert it directly.
  const xss = U.math('<img src=x onerror="alert(1)">');
  ok(!xss.includes("<img"), "HTML is escaped before substitution", xss) && pass("XSS: input is escaped first");

  // Nesting three deep, which Extension 1 does routinely.
  const deep = U.math("\\frac{\\frac{1}{\\sqrt{\\frac{a}{b}}}}{2}");
  ok((deep.match(/class="frac"/g) || []).length === 3, "fractions nest three deep") &&
    pass("nested fractions render");
}

/* -- 5b. the formula sheet and its NESA flags ------------------
   The flag is the entire value of this feature. A formula wrongly marked
   "printed on the reference sheet" teaches a student not to learn something
   nobody is going to give them, so the shape of the data is checked hard even
   though its truth can only be checked against NESA's PDF by a human. */
section("Formula sheet");
{
  const F = MA.DATA.formulas;
  const groupIds = MA.DATA.formulaGroups.map(g => g.id);

  ok(F.length >= 120, "the formula sheet is a sheet, not a sample", F.length + " formulas");

  const ids = F.map(f => f.id);
  ok(new Set(ids).size === ids.length, "formula ids are unique",
    ids.filter((id, i) => ids.indexOf(id) !== i).join(", "));

  const badGroup = F.filter(f => groupIds.indexOf(f.g) < 0);
  ok(badGroup.length === 0, "every formula sits in a declared group",
    badGroup.map(f => f.id).join(", "));

  const badTier = F.filter(f => ["MA", "ME"].indexOf(f.tier) < 0);
  ok(badTier.length === 0, "every formula declares a tier", badTier.map(f => f.id).join(", "));

  /* A missing flag reads as false in JS, which would silently mark a printed
     formula "memorise". Require the property to be an actual boolean. */
  const badFlag = F.filter(f => typeof f.nesa !== "boolean");
  ok(badFlag.length === 0, "every formula declares nesa as a boolean, not by omission",
    badFlag.map(f => f.id).join(", "));

  const noName = F.filter(f => !f.name || !f.tex);
  ok(noName.length === 0, "every formula has a name and a body", noName.map(f => f.id).join(", "));

  /* Both lists have to be substantial or the distinction is decorative. */
  const printed = F.filter(f => f.nesa).length;
  ok(printed >= 40, "enough formulas are marked as printed to be useful", printed + " printed");
  ok(F.length - printed >= 40, "enough are marked memorise-only",
    (F.length - printed) + " to memorise");

  /* Spot-checks against facts about the NESA sheet that do NOT change with a
     revision, and that the app would be actively misleading if it got wrong. */
  const flagOf = id => { const f = F.find(x => x.id === id); return f && f.nesa; };
  const spot = [
    ["f-quad",    true,  "the quadratic formula is printed"],
    ["f-ci",      true,  "compound interest is printed"],
    ["f-dquot",   true,  "the quotient rule is printed"],
    ["f-z",       true,  "the z-score is printed"],
    ["f-fv",      false, "annuity future value is NOT printed"],
    ["f-exact",   false, "exact trig values are NOT printed"],
    ["f-vproj",   false, "vector projections are NOT printed"],
    ["f-proj-r",  false, "the projectile range formula is NOT printed"],
    ["f-logprod", false, "the log laws are NOT printed"]
  ];
  let wrong = 0;
  spot.forEach(([id, want, why]) => {
    const got = flagOf(id);
    if (got !== want) { wrong++; console.log("      " + why + " - flag reads " + got); }
  });
  ok(wrong === 0, "the spot-checked NESA flags are right");

  /* Tier filtering, same mechanism as every other bank. */
  const leaked = MA.Formulas.all().filter(f => MA.DATA.TIERS.indexOf(f.tier) < 0);
  ok(leaked.length === 0, "MA.Formulas.all() respects the tier toggle",
    leaked.map(f => f.id).join(", "));

  ok(MA.Formulas.search("quotient").length > 0, "search finds a formula by name");
  ok(MA.Formulas.search("zzzznothing").length === 0, "search returns nothing for nonsense");
  ok(MA.Formulas.grouped("", "sheet").every(sec => sec.items.every(f => f.nesa)),
    "the on-the-sheet filter really filters");
  ok(MA.Formulas.grouped("", "learn").every(sec => sec.items.every(f => !f.nesa)),
    "the memorise filter really filters");

  /* The reference tables carry the same marker, via the leading asterisk. */
  let markers = 0, stripped = 0;
  MA.DATA.reference.forEach(r => r.rows.forEach(row => {
    if (MA.Reference.isNesa(row)) markers++;
    if (/^\*/.test(MA.Reference.cells(row)[0])) stripped++;
  }));
  ok(markers > 0, "the reference tables mark printed rows too", markers + " marked rows");
  ok(stripped === 0, "MA.Reference.cells() strips the marker before rendering");

  /* Every row must have as many cells as the sheet has columns, or a marker
     edit has knocked a table out of shape. */
  const ragged = [];
  MA.DATA.reference.forEach(r => r.rows.forEach((row, i) => {
    if (row.length !== r.cols.length) ragged.push(r.id + " row " + i);
  }));
  ok(ragged.length === 0, "every reference row matches its column count", ragged.join(", "));

  pass("formula sheet", `${F.length} formulas · ${printed} on the NESA sheet · ${F.length - printed} to memorise`);
  pass("reference tables carry the marker too", markers + " printed rows across " +
    MA.DATA.reference.length + " sheets");
}

/* ── 6. equivalence checking, and its four traps ────────────── */
section("Equivalence");
{
  const E = MA.Expr;
  const cases = [
    ["accepts a genuinely different form", () =>
      E.equivalent("2sin(x)cos(x)", "sin(2x)", { seed: "t" }).equal],
    ["rejects a wrong answer", () =>
      !E.equivalent("x^2", "x^3", { seed: "t" }).equal],

    /* Trap 1 — DOMAIN. sqrt(x^2) is x only for x >= 0. */
    ["trap 1: domain-restricted pair rejected over ℝ", () =>
      !E.equivalent("sqrt(x^2)", "x", { seed: "t" }).equal],
    ["trap 1: same pair accepted on its declared domain", () =>
      E.equivalent("sqrt(x^2)", "x", { seed: "t", domain: [0.5, 4] }).equal],

    /* Trap 2 — BRANCH CUTS. arcsin(sin x) is x only on [-pi/2, pi/2]. */
    ["trap 2: arcsin(sin x) rejected outside the principal range", () =>
      !E.equivalent("arcsin(sin(x))", "x", { seed: "t", domain: [-3, 3] }).equal],
    ["trap 2: accepted inside the principal range", () =>
      E.equivalent("arcsin(sin(x))", "x", { seed: "t", domain: [-1.5, 1.5] }).equal],

    /* Trap 3 — POLES. Rejected samples must never read as agreement. */
    ["trap 3: an all-undefined comparison is NOT 'equivalent'", () => {
      const r = E.equivalent("ln(x)", "ln(x)", { seed: "t", domain: [-5, -1] });
      return !r.equal && r.reason === "undefined";
    }],
    ["trap 3: a pole-carrying pair still compares where it is defined", () =>
      E.equivalent("1/(x-1)", "1/(x-1)", { seed: "t", domain: [2, 6] }).equal],

    /* Trap 4 — COINCIDENCE. Two different expressions agreeing at a couple of
       points must not pass. x^2 and 2x - 1 meet only at x = 1. */
    ["trap 4: coincidental agreement is rejected", () =>
      !E.equivalent("x^2", "2x - 1", { seed: "t" }).equal],
    ["trap 4: eight samples are demanded, not two", () =>
      E.equivalent("x", "x", { seed: "t" }).clean >= 8],

    ["parser reports a useful error", () => {
      const r = E.tryParse("2*(x+1");
      return !r.ok && /bracket/i.test(r.error);
    }],
    ["exact numeric forms parse", () =>
      Math.abs(U.parseNum("pi/4") - Math.PI / 4) < 1e-12 &&
      Math.abs(U.parseNum("sqrt(2)") - Math.SQRT2) < 1e-12 &&
      Math.abs(U.parseNum("3/8") - 0.375) < 1e-12 &&
      Math.abs(U.parseNum("ln(3)") - Math.log(3)) < 1e-12 &&
      Math.abs(U.parseNum("e^2") - Math.exp(2)) < 1e-12],
    ["vectors compare componentwise", () =>
      E.vectorClose("(3,-4)", [3, -4]) && E.vectorClose("3i - 4j", [3, -4]) &&
      !E.vectorClose("(3,4)", [3, -4])]
  ];
  let bad = 0;
  cases.forEach(([label, fn]) => {
    let r = false;
    try { r = !!fn(); } catch (e) { r = false; }
    if (!ok(r, label)) bad++;
  });
  if (!bad) pass("equivalence checks", `(${cases.length} cases)`);
}

/* ── 7. generators: answer-first, contract-honouring ──────────
   Every generated question is solved independently by `solve()`, which works
   FORWARDS from the inputs while `make()` worked BACKWARDS from the answer.
   A stored answer that was never re-derived by a second path is an assertion,
   not a fact. */
section("Generators");
{
  const SAMPLES = 500;
  let broken = 0;
  for (const g of MA.Gen.all()) {
    let firstFail = null;
    for (let i = 0; i < SAMPLES; i++) {
      const seed = g.id + "#" + i;
      let item;
      try { item = MA.Gen.build(g, seed); }
      catch (e) { firstFail = "threw: " + e.message; break; }

      const rebuilt = g.solve(item.params);
      if (!isFinite(rebuilt)) { firstFail = "solve() is not finite for " + JSON.stringify(item.params); break; }
      /* Check the stored answer is a NUMBER before comparing. Without this the
         comparison is `NaN > tolerance`, which is false — so a missing answer
         reads as agreement and the whole check quietly stops testing anything.
         BREAK=answer-first is what surfaced this. */
      if (typeof item.answer !== "number" || !isFinite(item.answer)) {
        firstFail = "no finite answer was stored (got " + item.answer + ")"; break;
      }
      if (Math.abs(rebuilt - item.answer) > 1e-9 * Math.max(1, Math.abs(rebuilt))) {
        firstFail = "make/solve disagree: " + item.answer + " vs " + rebuilt; break;
      }
      if (Math.abs(item.answer) > 1e9) { firstFail = "answer out of range: " + item.answer; break; }
      if (!item.prompt || !item.why) { firstFail = "missing prompt or explanation"; break; }
      if (!g.contract || !g.contract.answerType) { firstFail = "no difficulty contract"; break; }
      // The contract's promise about the answer's SHAPE must hold.
      if (/integer/.test(g.contract.answerType) && Math.abs(item.answer - Math.round(item.answer)) > 1e-9) {
        firstFail = "contract says integer but answer is " + item.answer; break;
      }
      if (!(g.diff >= 1 && g.diff <= 3)) { firstFail = "diff out of range"; break; }
      if (!MA.Bank.TOPICS.some(t => t.id === g.topic)) { firstFail = "unknown topic " + g.topic; break; }
    }
    if (firstFail) { broken++; console.log("      " + g.id + ": " + firstFail); }
  }
  ok(broken === 0, `every generator survives ${SAMPLES} samples`) &&
    pass("generators re-derived independently", `(${MA.Gen.all().length} × ${SAMPLES})`);

  // Determinism: the same seed must give the same question, or a bug report
  // from the wild cannot be turned into a test case.
  const a = MA.Gen.build(MA.Gen.all()[0], "fixed");
  const b = MA.Gen.build(MA.Gen.all()[0], "fixed");
  ok(a.prompt === b.prompt && a.answer === b.answer && typeof a.answer === "number",
    "generators are deterministic per seed") &&
    pass("seeded generation is reproducible");
}

/* ── 8. proof puzzles ─────────────────────────────────────── */
section("Proofs");
{
  let bad = 0;
  for (const p of MA.DATA.proofs) {
    if (!p.steps || p.steps.length < 3) { bad++; console.log("      too few steps: " + p.id); continue; }
    if (new Set(p.steps).size !== p.steps.length) { bad++; console.log("      repeated step: " + p.id); }
    if (p.phases && p.phases.length !== p.steps.length) {
      bad++; console.log("      phases/steps length mismatch: " + p.id);
    }
    // A trap that duplicates a real step would make the puzzle unsolvable.
    (p.traps || []).forEach(t => {
      if (p.steps.includes(t)) { bad++; console.log("      trap duplicates a real step: " + p.id); }
    });
    // Recompute the declared step count rather than trusting it.
    const solvedIn = p.steps.length;
    if (solvedIn !== p.steps.length) { bad++; console.log("      step count mismatch: " + p.id); }
    if (!(p.traps || []).length) { bad++; console.log("      no traps — solvable by elimination: " + p.id); }
    if (!MA.Bank.TOPICS.some(t => t.id === p.topic)) { bad++; console.log("      unknown topic: " + p.id); }
    if (p.kind === "induction" && !p.phases) { bad++; console.log("      induction without phases: " + p.id); }
  }
  ok(bad === 0, "every proof puzzle is well-formed and solvable in its declared steps") &&
    pass("proof puzzles", `(${MA.DATA.proofs.length})`);
}

/* ── 9. a fresh save unlocks nothing ──────────────────────── */
section("Fresh save");
{
  const ctx2 = makeContext(["MA", "ME"]);
  ctx2.MA.State.load();
  const unlocked = ctx2.MA.State.checkAchievements();
  ok(unlocked.length === 0, "no achievement unlocks on a brand-new save",
    unlocked.map(a => a.id).join(", ")) && pass("fresh save unlocks nothing");
  ok(ctx2.MA.State.data.level === 1 && ctx2.MA.State.data.xp === 0, "a fresh save starts at level 1") &&
    pass("fresh save starts clean");
}

/* ── 10. Table Panic boards are never trivially uniform ──────
   A randomly drawn grid can come up almost all one answer, making "tap the
   same thing sixteen times" a legitimately perfect score. */
section("Generated boards");
{
  const src = fs.readFileSync(path.join(ROOT, SUB + "games/panic.js"), "utf8");
  const tablesMatch = /MA\.DATA\.panicTables = (\[[\s\S]*?\n\];)/.exec(src);
  ok(!!tablesMatch, "panic tables are parseable");
  if (tablesMatch) {
    vm.runInContext("MA.DATA.panicTables = " + tablesMatch[1], ctxFull);
    const tables = ctxFull.MA.DATA.panicTables;
    let badTable = 0, uniform = 0;
    for (const t of tables) {
      if (t.rows.length < 10) { badTable++; console.log("      too few rows: " + t.id); }
      // Simulate the constrained draw the game performs.
      for (let trial = 0; trial < 200; trial++) {
        const rows = ctxFull.MA.U.sample(t.rows, 10);
        const counts = {};
        rows.forEach(r => (counts[r[1]] = (counts[r[1]] || 0) + 1));
        const share = Math.max(...Object.values(counts)) / rows.length;
        if (share > 0.6) uniform++;
      }
    }
    ok(badTable === 0, "every panic table has enough rows");
    // The unconstrained draw DOES occasionally go uniform — which is exactly
    // why the game constrains it. This just proves the risk is real.
    pass("uniform-board risk measured", `${uniform} of ${tables.length * 200} raw draws exceed 60%`);
  }
}

/* -- 10b. Read the Curve: four DISTINCT curves ----------------
   A reverse round ("which graph shows this equation?") draws one canvas per
   option, so two options that draw the same picture make the question
   unanswerable and mark a correct pick wrong. Deduplicating the LABELS is not
   enough to prevent it, which is exactly how the bug shipped: the old
   fallback distractor invented a new label and reused the key's parameters.

   Run the real buildRound() over a few thousand seeds and compare the drawn
   curves, not the strings. */
section("Curve rounds");
{
  /* Read through applyBreak so BREAK=curve-dupe can reinstate the bug and
     prove these checks would have caught it. */
  const src = applyBreak(SUB + "games/curve.js",
    fs.readFileSync(path.join(ROOT, SUB + "games/curve.js"), "utf8"));
  vm.runInContext(src, ctxFull);
  const G = ctxFull.MA.Games.curve;
  ok(typeof G.buildRound === "function", "buildRound is exposed for testing");

  let dupCurve = 0, dupLabel = 0, short = 0, samples = 0;
  const seen = {};
  if (G.buildRound) {
    for (let i = 0; i < 3000; i++) {
      const r = G.buildRound("v-" + i);
      samples++;
      seen[r.fam.id] = (seen[r.fam.id] || 0) + 1;
      if (r.labels.length !== 4 || r.paramSets.length !== 4) {
        short++;
        continue;
      }
      if (new Set(r.labels).size !== 4) {
        dupLabel++;
        if (dupLabel < 4) console.log("      duplicate label: " + r.labels.join(" | "));
      }
      for (let a = 0; a < 4; a++) {
        for (let b = a + 1; b < 4; b++) {
          if (G.sameCurve(r.fam, r.paramSets[a], r.paramSets[b])) {
            dupCurve++;
            if (dupCurve < 4) {
              console.log("      identical curves in " + r.fam.id + ": " +
                r.labels[a] + "  ==  " + r.labels[b]);
            }
          }
        }
      }
    }
  }
  ok(short === 0, "every round offers exactly four options", short + " short rounds");
  ok(dupLabel === 0, "no round repeats an equation", dupLabel + " rounds");
  ok(dupCurve === 0, "no round draws the same curve twice", dupCurve + " pairs");

  // Every family must actually come up, or a broken one could hide behind
  // never being drawn.
  const families = Object.keys(seen).length;
  ok(families >= 10, "the seeds reach the whole family list", families + " families in " + samples + " rounds");

  pass("curve rounds are four distinct curves", `${samples} rounds · ${families} families`);
}

/* ── 11. the tier toggle ──────────────────────────────────────
   The only thing stopping this toggle from rotting is asserting BOTH
   configurations pass. */
section("Tier toggle");
{
  const maOnly = makeContext(["MA"]);
  const maQs = maOnly.MA.Bank.all();
  const leaks = maQs.filter(q => q.topic.startsWith("ME-"));
  ok(leaks.length === 0, "an Advanced-only build ships no ME- questions",
    leaks.slice(0, 3).map(q => q.id).join(", ")) && pass("MA-only build is clean");

  const cardLeaks = maOnly.MA.Cards.all().filter(c => c.topic.startsWith("ME-"));
  ok(cardLeaks.length === 0, "an Advanced-only build ships no ME- flashcards") &&
    pass("MA-only flashcards are clean");

  const proofLeaks = maOnly.MA.Proofs.all().filter(p => p.topic.startsWith("ME-"));
  ok(proofLeaks.length === 0, "an Advanced-only build ships no ME- proofs") &&
    pass("MA-only proofs are clean");

  const achLeaks = maOnly.MA.DATA.enabledAchievements().filter(a => a.tier === "ME");
  ok(achLeaks.length === 0,
    "an Advanced-only build hides Extension achievements (no permanently unobtainable ones)") &&
    pass("MA-only achievements are clean");

  const genLeaks = maOnly.MA.Gen.enabled().filter(g => g.topic.startsWith("ME-"));
  ok(genLeaks.length === 0, "an Advanced-only build ships no ME- generators") &&
    pass("MA-only generators are clean");

  const refLeaks = maOnly.MA.Reference.all().filter(r => r.tier === "ME");
  ok(refLeaks.length === 0, "an Advanced-only build ships no ME- reference sheets") &&
    pass("MA-only reference is clean");

  // And every achievement must still be REACHABLE in the MA-only build.
  maOnly.MA.State.load();
  let evalFail = 0;
  const stats = maOnly.MA.State.achievementStats();
  for (const a of maOnly.MA.DATA.enabledAchievements()) {
    try { a.check(stats); } catch (e) { evalFail++; console.log("      throws: " + a.id + " — " + e.message); }
  }
  ok(evalFail === 0, "every enabled achievement evaluates without throwing") &&
    pass("achievement checks are safe on a fresh MA-only save");

  ok(maQs.length >= 400, "the Advanced-only build still has ≥ 400 questions", `have ${maQs.length}`) &&
    pass("MA-only volume", `${maQs.length} questions`);
}

/* ── 12. the manifest ────────────────────────────────────────
   The stand-alone app's precache check, re-aimed: the subject's scripts are
   loaded from manifest.js, so every file must be listed there and exist. */
section("Manifest");
{
  const { scripts, css } = L.manifestScripts();
  const missing = scripts.concat(css).filter(p => !fs.existsSync(path.join(ROOT, p)));
  ok(missing.length === 0, "every manifest path exists on disk", missing.join(", ")) && pass("manifest ⊆ disk");
  const onDisk = [];
  ["core", "data", "games", "screens"].forEach(dir => fs.readdirSync(path.join(ROOT, SUB + dir))
    .filter(f => f.endsWith(".js")).forEach(f => onDisk.push(SUB + dir + "/" + f)));
  const orphan = onDisk.filter(f => !scripts.includes(f));
  ok(orphan.length === 0, "every subject js file is loaded by the manifest", orphan.join(", ")) &&
    pass("no orphaned source files", `(${scripts.length} scripts)`);
  const order = s => scripts.indexOf(SUB + s);
  ok(order("data/tiers.js") < order("core/state.js") && order("data/shop.js") < order("core/state.js") &&
     order("core/state.js") < order("core/bank.js") && order("core/bank.js") < order("data/questions-ma-functions.js"),
    "dependency order: tiers + shop data → state → bank → banks") && pass("script order");
}

/* ── 13. nothing pays except through award() ──────────────────
   The arcade is the app's now. What stays checkable here is the structural
   rule: no subject file adds XP directly. */
section("Reward pipeline");
{
  let violations = 0;
  ["core", "data", "games", "screens"].forEach(dir => fs.readdirSync(path.join(ROOT, SUB + dir))
    .filter(f => f.endsWith(".js")).forEach(f => {
      const src = fs.readFileSync(path.join(ROOT, SUB + dir, f), "utf8")
        .replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
      if (/\baddXP\s*\(/.test(src)) { violations++; console.log("      " + dir + "/" + f + " calls addXP()"); }
    }));
  ok(violations === 0, "no subject file calls addXP() — XP is paid only through UI.award()") &&
    pass("award() is the only way XP is paid");
}

/* ── 14. the anti-farm guards are present ─────────────────── */
section("Anti-farm guards");
{
  const uiSrc = fs.readFileSync(path.join(ROOT, "js/sq/ui.js"), "utf8");
  ok(/MIN_BONUS_ACCURACY = 0\.5/.test(uiSrc), "the completion bonus is accuracy-gated at 50%");
  ok(/acc < MIN_BONUS_ACCURACY \? 0 :/.test(uiSrc), "below the gate the bonus is withheld entirely, not scaled");
  ok(/MIN_READ_MS = 1200/.test(uiSrc), "a minimum read time of 1200 ms is defined");
  const boundUi = fs.readFileSync(path.join(ROOT, SUB + "core/ui.js"), "utf8");
  ok(/coinRate:\s*0\.6\b/.test(boundUi), "Primes pay at MathQuest's 0.6 coin rate");

  const gameFiles = fs.readdirSync(path.join(ROOT, SUB + "games")).filter(f => f.endsWith(".js"));
  let floors = 0;
  gameFiles.forEach(f => {
    const src = fs.readFileSync(path.join(ROOT, SUB + "games", f), "utf8")
      .replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
    const m = src.match(/Math\.max\(\s*[1-9]\d*\s*,[^)]*(?:xp|score|gain|award)/gi);
    if (m) { floors++; console.log("      possible score floor in " + f + ": " + m[0]); }
  });
  ok(floors === 0, "no per-item score floors in any game");

  let readGate = 0;
  ["quiz.js", "crunch.js", "equiv.js", "curve.js", "survival.js", "boss.js", "proof.js"].forEach(f => {
    const src = fs.readFileSync(path.join(ROOT, SUB + "games", f), "utf8");
    if (!/MIN_READ_MS/.test(src)) { readGate++; console.log("      " + f + " does not check MIN_READ_MS"); }
  });
  ok(readGate === 0, "every scored mode enforces a minimum think/read time");
  const studySrc = fs.readFileSync(path.join(ROOT, SUB + "screens/study.js"), "utf8");
  ok(/cardXpEligible/.test(studySrc) && /MIN_READ_MS/.test(studySrc) && /paid \/ cards\.length/.test(studySrc),
    "flashcards pay once per card per day, after the read floor, with accuracy = paid ÷ deck");

  ["equiv.js", "lab.js"].forEach(f => {
    const src = fs.readFileSync(path.join(ROOT, SUB + "games", f), "utf8");
    const body = src.replace(/\b(?:let|var|const)\s+\w+\s*=\s*false\s*;/g, "");
    const reassigned = /\w*Used\s*=\s*false/.test(body);
    ok(/Used = true/.test(src) && !reassigned,
      `${f}: the optional helper latches on first use and is never cleared`);
  });
  pass("anti-farm guards present");
}

/* ── 15. the old MathQuest save imports ───────────────────── */
section("Legacy import");
{
  const ctx3 = makeContext(["MA", "ME"]);
  const imp = L.manifestScripts().manifest.importLegacy;
  ok(typeof imp === "function", "manifest exposes importLegacy()");
  const old = {
    xp: 5000, level: 7, xpIntoLevel: 120, coins: 4242, prestige: 1, lifetimeXp: 9000,
    profile: { name: "Old", avatar: "🧮", theme: "euler" },
    stats: { answered: 50, correct: 40, bestStreak: 9, extAnswered: 5 },
    topics: { "MA-C2": { seen: 10, correct: 8 } },
    proofsSolved: { "p-x": 1 }, bossesBeaten: { asymptote: 1 },
    inventory: { fifty: 2, boost: 1, revive: 1 },
    owned: { themes: ["graph", "euler", "radian"], avatars: ["🧮", "📐", "🐐"] },
    srs: { c1: { box: 3, due: "2026-01-01", reps: 2, lapses: 0 } },
    mistakes: [{ id: "q1", topic: "MA-C2", misses: 1, ts: 1 }], bookmarks: ["q2"],
    achievements: { a_first: 1 }, settings: { difficulty: "hard" }
  };
  let r = null;
  try { r = imp(old); } catch (e) { console.log("      threw: " + e.message); }
  ok(!!(r && r.slot), "an old save maps to a slot");
  if (r && r.slot) {
    ok(r.slot.coins === 4242 && r.slot.level === 7 && r.slot.prestige === 1, "level, Primes and Ascensions carry across");
    ok(r.slot.modules["MA-C2"] && r.slot.topics["MA-C2"].seen === 10, "topic mastery carries across on both axes");
    ok(r.slot.settings.difficulty === "hard", "difficulty carries across");
    ok(r.inventory.double === 1 && r.inventory.fifty === 2 && r.inventory.revive === 1, "power-ups map to the shared ids (boost → double)");
    ok(r.themes.join() === "midnight,ember,lime", "old themes map to the promoted app themes", r.themes.join());
    ok(r.profile && r.profile.theme === "ember", "the worn theme maps too");
  }
  pass("legacy import");
}

/* ── 16. the live Extension 1 toggle ──────────────────────────
   The upgrade: the build-time constant is a subject setting now. Flip it on a
   live context and assert everything re-filters, then flip it back. */
section("Pinned tier");
{
  /* Advanced and Extension 1 are separate StudyQuest subjects; this one holds the
     MA tier and nothing else, with no toggle that could leak the other in. */
  const c = makeContext(null);
  ok(c.MA.DATA.TIERS.join() === "MA", "TIERS is pinned to MA");
  ok(c.MA.Bank.all().length > 0 && c.MA.Bank.all().every(q => q.topic.startsWith("MA-")), "every question is MA");
  ok(c.MA.Cards.all().length > 0 && c.MA.Cards.all().every(x => x.topic.startsWith("MA-")), "every flashcard is MA");
  ok(c.MA.Formulas.all().every(f => f.tier === "MA"), "every sheet formula is MA");
  ok(c.MA.Gen.enabled().every(g => g.topic.startsWith("MA-")), "every generator is MA");
  ok(typeof c.MA.State.setStudiesExt !== "function" || c.MA.DATA.TIERS.join() === "MA", "no toggle changes the tier");
  pass("Maths Advanced holds the MA tier only");
}

/* ── result ───────────────────────────────────────────────── */
console.log("\n" + "─".repeat(58));
if (BREAK && !breakApplied) {
  console.log(`BREAK="${BREAK}" was requested but never applied — check the patch.`);
  process.exit(2);
}
if (BREAK) {
  // In BREAK mode a FAILURE is the expected, correct outcome.
  if (failures > 0) {
    console.log(`✓ BREAK="${BREAK}": ${failures} check(s) failed, as they must.`);
    console.log("  The guard this covers is genuinely load-bearing.");
    process.exit(0);
  }
  console.log(`✗ BREAK="${BREAK}": everything still passed with the guard removed.`);
  console.log("  That check is not testing what it claims to test.");
  process.exit(1);
}
console.log(failures === 0
  ? `✓ all ${checks} checks passed`
  : `✗ ${failures} of ${checks} checks FAILED`);
notes.forEach(n => console.log("  " + n));
process.exit(failures === 0 ? 0 : 1);
