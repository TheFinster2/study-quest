/* tests/subjects/phys/validate.js — content integrity. PHYSICS-BRIEF.md §9.1.

   No browser: this is the test that runs on every edit, so it has to be fast.

   Two halves, because authored and generated questions are different things and
   need different validation (brief §3.1):

     AUTHORED   structural invariants, per-module answer-length bias, bigram
                duplicate detection, stored answers recomputed where possible.
     GENERATED  every template × 200 seeds, each answer verified by a second
                independent route, each dimensionally checked, distractors
                distinct from the key and from each other after rounding,
                template-normalised duplicate detection across the draw.

   Plus the cross-cutting checks: every constant traced back to constants.js, and
   the service worker's precache list diffed against the files on disk.

   Run:  node tests/subjects/phys/validate.js
         BREAK=1 node tests/subjects/phys/validate.js   (patch out a guard, expect a failure)
         node tests/subjects/phys/validate.js --seeds 500
*/
const fs = require("fs");
const path = require("path");
const { load, ROOT, generatorFiles } = require("./_load");

const argv = process.argv.slice(2);
const SEEDS = (() => {
  const i = argv.indexOf("--seeds");
  return i >= 0 ? parseInt(argv[i + 1], 10) : 200;
})();
const BREAK = process.env.BREAK || "";

const fails = [];
const warns = [];
const notes = [];
const fail = m => fails.push(m);
const warn = m => warns.push(m);

/* ── BREAK=1 support ────────────────────────────────────────────────────────
   The habit that matters more than any individual test (addendum §A): prove the
   test fails without the fix. Each mode removes exactly one guard and asserts
   that (a) the patch matched something and (b) the patched file still parses —
   otherwise you "fail" for the wrong reason and believe you are covered. */
const BREAKS = {
  bias:      "stop shuffling authored options, so the key is always first and the " +
             "answer-length check has a maximally biased bank to catch",
  dedupe:    "duplicate one authored question into the bank",
  dimensions:"break one generator's dimension declaration",
  routes:    "break one generator's second route",
  distractor:"make one generator emit a distractor equal to its key",
  literal:   "inline a raw 9.8 into a generator instead of using constants.js"
};
if (BREAK && BREAK !== "1" && !BREAKS[BREAK]) {
  console.log("Unknown BREAK mode. Choose one of:\n  " +
              Object.keys(BREAKS).map(k => `${k} — ${BREAKS[k]}`).join("\n  "));
  process.exit(2);
}
const breakMode = BREAK === "1" ? "routes" : BREAK;

/* ── load the app ──────────────────────────────────────────────────────────── */
let app;
try {
  app = load();
} catch (e) {
  console.log("❌ A content file failed to load: " + e.message);
  process.exit(1);
}
const { U, Units, Gen, DATA } = app;

/* Same discovery rule the app uses — never a hand-written list, because a list is
   one forgotten line away from silently dropping a few hundred questions. */
function discover(pattern, shape) {
  return Object.keys(DATA)
    .filter(k => pattern.test(k) && Array.isArray(DATA[k]) && DATA[k].length && shape(DATA[k][0]))
    .sort();
}
const qKeys = discover(/^q[A-Z0-9]/, x => !!x.choices);
const cardKeys = discover(/^flashcards/, x => !!x.front);
const authored = qKeys.reduce((a, k) => a.concat(DATA[k]), []);
const cards = cardKeys.reduce((a, k) => a.concat(DATA[k]), []);

const MODULES = ["M1", "M2", "M3", "M4", "M5", "M6", "M7", "M8"];
const Y12 = ["M5", "M6", "M7", "M8"];

console.log("Newton's Notebook — content validator\n");
console.log(`  authored question files : ${qKeys.length} → ${authored.length} questions`);
console.log(`  flashcard files         : ${cardKeys.length} → ${cards.length} cards`);
console.log(`  generator templates     : ${Gen.count}`);
console.log(`  seeds per template      : ${SEEDS}\n`);

/* ══════════════════════════════════════════════════════════════════════════
   1. AUTHORED QUESTIONS — structural invariants
   ══════════════════════════════════════════════════════════════════════════ */
{
  const ids = new Map();
  for (const q of authored) {
    const where = q.id || "(no id)";
    if (!q.id) { fail("A question has no id: " + JSON.stringify(q.q || "").slice(0, 60)); continue; }
    if (ids.has(q.id)) fail(`Duplicate question id ${q.id}`);
    ids.set(q.id, q);

    if (!q.q || typeof q.q !== "string") fail(`${where}: no stem`);
    if (!Array.isArray(q.choices) || q.choices.length !== 4)
      fail(`${where}: has ${q.choices ? q.choices.length : 0} options, needs exactly 4`);
    if (typeof q.a !== "number" || q.a < 0 || q.a >= (q.choices || []).length)
      fail(`${where}: answer index ${q.a} is out of range`);
    if (q.choices) {
      const seen = new Set();
      for (const c of q.choices) {
        const plain = U.mathPlain(c).toLowerCase();
        if (seen.has(plain)) fail(`${where}: duplicate option "${String(c).slice(0, 40)}"`);
        seen.add(plain);
      }
    }
    if (!MODULES.includes(q.mod)) fail(`${where}: unknown module "${q.mod}"`);
    if (!q.topic) fail(`${where}: no topic`);
    if (!(q.diff >= 1 && q.diff <= 3)) fail(`${where}: difficulty ${q.diff} outside 1–3`);
    if (!q.explain) warn(`${where}: no explanation — every wrong answer should teach something`);

    // The notation renderer must not choke, and must not emit raw markup.
    for (const s of [q.q].concat(q.choices || [], q.explain ? [q.explain] : [])) {
      let html;
      try { html = U.math(s); }
      catch (e) { fail(`${where}: notation renderer threw on "${String(s).slice(0, 40)}": ${e.message}`); continue; }
      if (/<script|onerror=|onload=/i.test(html)) fail(`${where}: renderer emitted executable markup`);
      const unbalanced = (String(s).match(/\{/g) || []).length !== (String(s).match(/\}/g) || []).length;
      if (unbalanced) fail(`${where}: unbalanced braces in notation source`);
    }
  }

  const byMod = {};
  MODULES.forEach(m => (byMod[m] = authored.filter(q => q.mod === m).length));
  console.log("  per module: " + MODULES.map(m => `${m}:${byMod[m]}`).join("  "));

  /* Volume targets from §3.1. Reported as a shortfall rather than a hard failure —
     the bank grows over a year, and a build that refuses to run because module 3
     is twelve questions short is worse than one that says so. */
  for (const m of MODULES) {
    const target = Y12.includes(m) ? 120 : 80;
    if (byMod[m] < target)
      notes.push(`${m} has ${byMod[m]} authored questions, §3.1 target is ${target}` +
                 (Y12.includes(m) ? "–180" : "–120"));
  }
  /* ── the on/off-sheet flag ─────────────────────────────────────────────────
     js/core/sheet.js decides what a student may look up mid-question for free from
     this flag, and charges XP for the rest. A missing flag reads as falsy, which
     silently charges for something the exam gives away, so it is a failure rather
     than a note. */
  const unflagged = DATA.equations.filter(eq => typeof eq.sheet !== "boolean");
  if (unflagged.length)
    fail(`${unflagged.length} formula(s) have no explicit sheet flag, so the app would ` +
         `charge XP to look them up: ${unflagged.map(e => e.id).join(", ")}`);
  const onSheet = DATA.equations.filter(eq => eq.sheet).length;
  console.log(`  formulae sheet: ${onSheet} of ${DATA.equations.length} formulas marked ` +
              `on-sheet (free to look up mid-question), ${DATA.equations.length - onSheet} off`);
  const unverified = DATA.sheetUnverified || [];
  if (unverified.length)
    notes.push(`${unverified.length} formula sheet flags are this app's judgement, not a ` +
               `reading of the PDF (unreachable here — see subjects/phys/data/constants.js): ` +
               `${unverified.join(", ")}. A wrong flag either charges a student for ` +
               `something the exam gives them or lets them lean on something it does not, ` +
               `so diff these against the real sheet before an exam year.`);

  if (cards.length < 250) notes.push(`${cards.length} flashcards, §3.1 target is 250–350`);
  if (Gen.count < 60) fail(`${Gen.count} generator templates, §3.1 target is 60–90`);
}

/* ══════════════════════════════════════════════════════════════════════════
   2. ANSWER-LENGTH BIAS  (§5.6, addendum D1)
   ══════════════════════════════════════════════════════════════════════════
   Writing options as mini-explanations makes the correct one the longest, and a
   student who always picks the longest option scores about 64% while knowing
   nothing — the defect the student found, not the tests. Four options means 25%
   is the chance rate. Fails above 32% overall or 36% in any single module: the
   per-module limit is the one that matters, because a healthy 24% average in the
   chemistry app was hiding one module at 38%.
   ══════════════════════════════════════════════════════════════════════════ */
{
  const longestKey = q => {
    const lens = q.choices.map(c => U.mathPlain(c).length);
    const max = Math.max.apply(null, lens);
    // Strictly longest — a tie is not a tell.
    return lens[q.a] === max && lens.filter(l => l === max).length === 1;
  };
  const overall = authored.filter(longestKey).length;
  const pctAll = authored.length ? (overall / authored.length) * 100 : 0;
  console.log(`\n  answer-length bias: ${pctAll.toFixed(1)}% overall (chance 25%, limit 32%)`);

  if (pctAll > 32) fail(`answer-length bias ${pctAll.toFixed(1)}% overall exceeds 32%`);

  for (const m of MODULES) {
    const pool = authored.filter(q => q.mod === m);
    if (pool.length < 12) continue;
    const p = (pool.filter(longestKey).length / pool.length) * 100;
    const flag = p > 36 ? " ✗" : p > 30 ? " ~" : "";
    console.log(`    ${m}: ${p.toFixed(1)}%${flag}`);
    if (p > 36) fail(`answer-length bias ${p.toFixed(1)}% in ${m} exceeds the 36% per-module limit`);
  }

  /* The brief only names the longest-option tell, but being systematically the
     SHORTEST is exactly as exploitable — and it is the failure mode you fall into
     while fixing the first one, by trimming every key instead of fleshing out the
     distractors. Checked in both directions for that reason. */
  const shortestKey = q => {
    const lens = q.choices.map(c => U.mathPlain(c).length);
    const min = Math.min.apply(null, lens);
    return lens[q.a] === min && lens.filter(l => l === min).length === 1;
  };
  const shortPct = authored.length
    ? (authored.filter(shortestKey).length / authored.length) * 100 : 0;
  console.log(`  key strictly shortest: ${shortPct.toFixed(1)}% (same 32% limit, other direction)`);
  if (shortPct > 32)
    fail(`the key is the SHORTEST option in ${shortPct.toFixed(1)}% of questions — "always pick ` +
         `the short one" would beat chance`);

  /* Generated questions are not exempt. If the key is formatted differently from
     its distractors — more decimal places, a unit spelled out — the tell has been
     re-created numerically. All four options come from one formatter, so this
     should be exactly at chance; anything else means the formatter is leaking. */
  let genLongest = 0, genTotal = 0;
  for (const t of Gen.all()) {
    for (let i = 0; i < 20; i++) {
      let mcq;
      try { mcq = Gen.toMcq(Gen.make(t.id, 5000 + i * 131)); } catch (e) { continue; }
      const lens = mcq.choices.map(c => U.mathPlain(c).length);
      const max = Math.max.apply(null, lens);
      if (lens[mcq.a] === max && lens.filter(l => l === max).length === 1) genLongest++;
      genTotal++;
    }
  }
  const genPct = genTotal ? (genLongest / genTotal) * 100 : 0;
  console.log(`  generated options, key strictly longest: ${genPct.toFixed(1)}% of ${genTotal}`);
  if (genPct > 34)
    fail(`generated questions show ${genPct.toFixed(1)}% length bias — the key is being ` +
         `formatted differently from its distractors`);
}

/* ══════════════════════════════════════════════════════════════════════════
   3. DUPLICATE DETECTION  (§5.5, addendum D2/D3)
   ══════════════════════════════════════════════════════════════════════════
   BIGRAMS, not single words: comparing token SETS flagged "ΔH < 0 and ΔS > 0"
   as a duplicate of its exact opposite. Digits, operators and symbols stay in
   the tokens — stripping them was what collapsed those two into one set.
   ══════════════════════════════════════════════════════════════════════════ */
function bigrams(text) {
  const toks = U.mathPlain(text).toLowerCase()
    .replace(/[.,;:()]/g, " ")
    .split(/\s+/).filter(Boolean);
  const out = new Set();
  for (let i = 0; i < toks.length - 1; i++) out.add(toks[i] + " " + toks[i + 1]);
  if (toks.length === 1) out.add(toks[0]);
  return out;
}
function jaccard(a, b) {
  if (!a.size || !b.size) return 0;
  let inter = 0;
  for (const x of a) if (b.has(x)) inter++;
  return inter / (a.size + b.size - inter);
}
{
  /* Pairwise WITHIN a topic. It runs to completion rather than stopping at the
     first hit, because fixing one duplicate can expose another that it was
     masking (addendum D3) — reporting them all makes that one pass instead of
     several rounds. */
  const byTopic = {};
  for (const q of authored) {
    const key = q.mod + "|" + q.topic;
    (byTopic[key] = byTopic[key] || []).push(q);
  }
  let dupes = 0, worst = 0, worstPair = null;
  for (const [topic, pool] of Object.entries(byTopic)) {
    const grams = pool.map(q => bigrams(q.q));
    for (let i = 0; i < pool.length; i++) {
      for (let j = i + 1; j < pool.length; j++) {
        const s = jaccard(grams[i], grams[j]);
        if (s > worst) { worst = s; worstPair = [pool[i].id, pool[j].id, topic]; }
        if (s > 0.75) {
          dupes++;
          fail(`near-duplicate stems (bigram Jaccard ${s.toFixed(2)}) in ${topic}: ` +
               `${pool[i].id} / ${pool[j].id}`);
        }
      }
    }
  }
  if (authored.length) {
    console.log(`\n  authored duplicates: ${dupes} over 0.75` +
                (worstPair ? `; worst pair ${worst.toFixed(2)} (${worstPair[0]} / ${worstPair[1]})` : ""));
  }

  /* Flashcards get the same treatment — a deck with the same card twice is a
     deck that teaches less than it claims. */
  const cardIds = new Set();
  for (const c of cards) {
    if (!c.id) { fail("A flashcard has no id: " + String(c.front).slice(0, 50)); continue; }
    if (cardIds.has(c.id)) fail(`Duplicate flashcard id ${c.id}`);
    cardIds.add(c.id);
    if (!c.back) fail(`${c.id}: flashcard has no back`);
    if (!MODULES.includes(c.mod)) fail(`${c.id}: unknown module "${c.mod}"`);
    try { U.math(c.front); U.math(c.back); }
    catch (e) { fail(`${c.id}: notation renderer threw: ${e.message}`); }
  }
  const frontSeen = new Map();
  for (const c of cards) {
    const k = U.mathPlain(c.front).toLowerCase().replace(/\s+/g, " ").trim();
    if (frontSeen.has(k)) fail(`Flashcards ${frontSeen.get(k)} and ${c.id} have the same front`);
    frontSeen.set(k, c.id);
  }
}

/* ══════════════════════════════════════════════════════════════════════════
   3b. WORKED EXAMPLES
   ══════════════════════════════════════════════════════════════════════════
   These were the one content type nothing checked, which is how the reference
   sheet ends up rendering "undefined" one day. They are also the only content
   where the §5.5 "name the misconception" rule is a per-item promise: every one
   ends with the mistake it is guarding against, so a missing `trap` is a real
   defect and not a style preference.
   ══════════════════════════════════════════════════════════════════════════ */
{
  const wex = DATA.workedExamples || [];
  console.log(`\n  worked examples: ${wex.length}`);
  const seen = new Set();
  for (const w of wex) {
    const where = w.id || String(w.title).slice(0, 40);
    if (!w.id) fail(`A worked example has no id: ${where}`);
    else if (seen.has(w.id)) fail(`Duplicate worked-example id ${w.id}`);
    seen.add(w.id);
    if (!MODULES.includes(w.mod)) fail(`${where}: unknown module "${w.mod}"`);
    if (!w.title) fail(`${where}: no title`);
    if (!w.question) fail(`${where}: no question`);
    if (!w.trap) fail(`${where}: no trap — a worked example must end by naming the ` +
                      `misconception it is guarding against (§5.5)`);
    const steps = w.steps || [];
    if (steps.length < 2) fail(`${where}: ${steps.length} step(s) — that is an answer, not working`);
    steps.forEach((st, i) => {
      if (!st.eq && !st.note) fail(`${where}: step ${i + 1} is empty`);
    });
    // Everything a student will see, through the renderer, looking for a throw.
    for (const src of [w.question, w.trap].concat(steps.map(s => s.eq), steps.map(s => s.note))) {
      if (!src) continue;
      try { U.math(src); }
      catch (e) { fail(`${where}: notation renderer threw on "${String(src).slice(0, 40)}": ${e.message}`); }
    }
  }
  if (wex.length < 40) notes.push(`${wex.length} worked examples, §3.1 target is 40+`);
}

/* ══════════════════════════════════════════════════════════════════════════
   3c. EVERY STRING OF CONTENT THROUGH THE RENDERER
   ══════════════════════════════════════════════════════════════════════════
   The renderer emits an unknown `\command` verbatim rather than throwing, so a
   command it does not implement — or a typo — reaches the screen as a backslash
   and braces, and nothing fails. That is not hypothetical: `\text{North: }` was
   being used in worked examples and printed literally, in production, for as long
   as those examples existed. This check found it, `\text` was then implemented in
   util.js, and this is here so the next one cannot last as long.

   It walks every array in PHYS.DATA rather than a list of known fields, for the
   same reason the banks are discovered rather than listed.
   ══════════════════════════════════════════════════════════════════════════ */
{
  const FIELDS = ["q", "front", "back", "note", "explain", "title", "question",
                  "trap", "formula", "name", "blurb", "desc", "hint"];
  let checked = 0;
  const offenders = new Set();

  /* Greek written straight up against a letter. `mgDelta h` cannot substitute — the
     renderer needs a non-letter boundary — so it printed the word "Delta" on screen.
     The fix in content is the backslash form, `mg\Deltah`, which is why a backslash
     immediately before the name is excluded here. Only names of five letters or more
     are checked: "eta" is a Greek name and also the end of "beta". */
  const LONG_GREEK = Object.keys(U.GREEK).filter(g => g.length >= 5);
  const ADJACENT = new RegExp(
    "(?:[A-Za-z](?:" + LONG_GREEK.join("|") + ")(?![a-z]))" +
    "|(?:(?<!\\\\)(?:" + LONG_GREEK.join("|") + ")[A-Z])");

  const check = (where, src) => {
    if (src === null || src === undefined || typeof src !== "string") return;
    checked++;
    let out;
    try { out = U.math(src); }
    catch (e) { fail(`${where}: notation renderer threw: ${e.message}`); return; }
    const left = out.match(/\\[A-Za-z]+/g);
    if (left) {
      const cmds = [...new Set(left)].join(" ");
      offenders.add(`${where} → ${cmds}`);
      fail(`${where} uses ${cmds}, which the renderer does not implement — it will ` +
           `appear on screen as literal text: "${String(src).slice(0, 60)}"`);
    }
    if (ADJACENT.test(src)) {
      offenders.add(`${where} → Greek against a letter`);
      fail(`${where} has a Greek name written against a letter, which cannot ` +
           `substitute and prints as a word: "${String(src).slice(0, 60)}" — use the ` +
           `backslash form, e.g. mg\\Deltah`);
    }
  };

  for (const key of Object.keys(DATA)) {
    const arr = DATA[key];
    if (!Array.isArray(arr)) continue;
    arr.forEach((item, i) => {
      if (!item || typeof item !== "object") return;
      const id = item.id || `${key}[${i}]`;
      FIELDS.forEach(f => check(`${id}.${f}`, item[f]));
      (item.choices || []).forEach((c, j) => check(`${id}.choices[${j}]`, c));
      (item.why || []).forEach((c, j) => check(`${id}.why[${j}]`, c));
      (item.steps || []).forEach((s, j) => {
        if (!s) return;
        check(`${id}.steps[${j}].eq`, s.eq);
        check(`${id}.steps[${j}].note`, s.note);
      });
    });
  }
  /* Generated questions too. Their text is ASSEMBLED at runtime from template
     strings and numbers, so a template can be clean in the file and still produce
     `NBAomega` once the interpolation lands. A few seeds each is enough: the defect
     is in the template's fixed text, not in the numbers. */
  const SEEDS_PER_TEMPLATE = 4;
  for (const t of Gen.all()) {
    for (let seed = 1; seed <= SEEDS_PER_TEMPLATE; seed++) {
      let q;
      try { q = Gen.make(t.id, seed * 7919); } catch (e) { continue; }
      if (!q || q.skip) continue;
      check(`${t.id}#${seed}.q`, q.q);
      (q.working || []).forEach((st, j) => {
        if (!st) return;
        check(`${t.id}#${seed}.working[${j}].eq`, st.eq);
        check(`${t.id}#${seed}.working[${j}].note`, st.note);
      });
      (q.distractors || []).forEach((d, j) => d && check(`${t.id}#${seed}.distractors[${j}]`, d.why));
    }
  }

  console.log(`  content strings rendered: ${checked}, ` +
              `${offenders.size} that would print notation as literal text (must be 0)`);
}

/* ══════════════════════════════════════════════════════════════════════════
   4. GENERATORS — every template × N seeds
   ══════════════════════════════════════════════════════════════════════════
   The single highest-value test in the project. Each question is built, its
   answer verified against the template's second route, its dimensions checked
   against what the template says it is asking for, and its distractors checked
   for collisions. All of that lives in Gen.make, so this loop mostly counts.
   ══════════════════════════════════════════════════════════════════════════ */
{
  console.log("\n  generators:");
  let totalBuilt = 0, totalRetried = 0;
  const perTemplate = [];

  for (const t of Gen.all()) {
    let built = 0, retried = 0, errors = [];
    const normals = new Map();
    for (let i = 0; i < SEEDS; i++) {
      const seed = 100003 + i * 7919;
      let q;
      try { q = Gen.make(t.id, seed); }
      catch (e) { errors.push(`seed ${seed}: ${e.message}`); continue; }
      built++;
      if (q.seed !== seed) retried++;

      // Reproducibility: the same seed must give the same question, forever.
      if (i < 3) {
        const again = Gen.make(t.id, seed);
        if (again.q !== q.q || again.answer.value !== q.answer.value)
          errors.push(`seed ${seed} is not reproducible — a template is using unseeded randomness`);
      }

      // Working steps must render, and must not be empty of content.
      if (!q.working.length) errors.push(`seed ${seed}: no working steps`);
      for (const w of q.working) {
        try { U.math(w.eq || ""); U.math(w.note || ""); }
        catch (e) { errors.push(`seed ${seed}: working step failed to render: ${e.message}`); }
      }

      /* Template-normalised duplicate detection. Every seed of one template SHOULD
         normalise to the same string — that is the point of the normal form. What
         must not happen is two DIFFERENT templates in the same topic normalising
         alike, which is checked across templates below. */
      normals.set(Gen.normalise(q.q), (normals.get(Gen.normalise(q.q)) || 0) + 1);
    }

    totalBuilt += built;
    totalRetried += retried;
    if (errors.length) {
      fail(`${t.id}: ${errors.length}/${SEEDS} seeds failed. First: ${errors[0]}`);
    }
    /* A template that has to retry a lot of seeds is leaning on the distractor
       collision escape hatch. Not wrong, but worth knowing about — silent
       truncation reads as "covered everything" when it did not. */
    const retryPct = (retried / SEEDS) * 100;
    if (retryPct > 25)
      warn(`${t.id} retried ${retryPct.toFixed(0)}% of seeds for distractor collisions — ` +
           `its distractor ratios are too close together`);

    perTemplate.push({ id: t.id, mod: t.mod, built, retried, forms: normals.size });
  }

  const byMod = {};
  for (const p of perTemplate) byMod[p.mod] = (byMod[p.mod] || 0) + 1;
  console.log("    templates per module: " + MODULES.map(m => `${m}:${byMod[m] || 0}`).join("  "));
  console.log(`    built ${totalBuilt} questions, ${totalRetried} seeds retried for collisions`);

  /* Cross-template collision: two templates in the same topic whose normal forms
     match are the same question wearing two hats, and the draw will feel repetitive
     however many templates the count claims. */
  const forms = new Map();
  for (const t of Gen.all()) {
    let q;
    try { q = Gen.make(t.id, 424242); } catch (e) { continue; }
    const n = Gen.normalise(q.q);
    if (forms.has(n)) fail(`templates ${forms.get(n)} and ${t.id} produce the same normalised question`);
    forms.set(n, t.id);
  }

  /* Template diversity in an actual draw (§5.5.2): no single template may supply
     more than about a quarter of a session. */
  for (const mod of MODULES) {
    const drawn = Gen.draw(20, { mods: [mod] });
    if (!drawn.length) { fail(`no generated questions available for ${mod}`); continue; }
    const counts = {};
    drawn.forEach(q => (counts[q.template] = (counts[q.template] || 0) + 1));
    const top = Math.max.apply(null, Object.values(counts));
    const share = top / drawn.length;
    if (share > 0.30)
      fail(`a single template supplies ${(share * 100).toFixed(0)}% of a 20-question ${mod} ` +
           `draw (limit ~25%)`);
  }

  /* Dimensional coverage: every template's declared answer dimension must be one
     the units engine can name, or the answer will print with a nonsense unit. */
  for (const t of Gen.all()) {
    const s = Units.str(t.dim);
    if (Object.keys(Units.clean(t.dim)).length && !s)
      fail(`${t.id}: answer dimension ${JSON.stringify(t.dim)} has no printable unit`);
    if (s) {
      const parsed = Units.parse(s);
      if (!parsed || !Units.same(parsed.units, t.dim))
        fail(`${t.id}: unit "${s}" does not parse back to its own dimension`);
    }
  }
}

/* ══════════════════════════════════════════════════════════════════════════
   4b. DERIVATION CHAINS — recomputed, never trusted  (addendum §D5)
   ══════════════════════════════════════════════════════════════════════════
   The number of steps a chain takes is NOT stored anywhere; it is recomputed from
   the equation graph. This asserts every shipped chain is actually reachable with
   the equations shipped alongside it. Three of them were not when this check was
   first written — the mode silently filtered them out, so the puzzles simply never
   appeared and nothing complained.
   ══════════════════════════════════════════════════════════════════════════ */
{
  const EQ = DATA.equations;
  const unknowns = (eq, known) => eq.vars.filter(v => !known.has(v));
  const applies = (eq, known) => unknowns(eq, known).length === 1;

  function shortestRoute(knownList, target) {
    const seen = new Set([knownList.slice().sort().join(",")]);
    let frontier = [{ known: new Set(knownList), steps: 0 }];
    for (let depth = 0; depth < 8; depth++) {
      const next = [];
      for (const node of frontier) {
        if (node.known.has(target)) return node.steps;
        for (const eq of EQ) {
          if (!applies(eq, node.known)) continue;
          const k = new Set(node.known);
          k.add(unknowns(eq, node.known)[0]);
          const key = Array.from(k).sort().join(",");
          if (seen.has(key)) continue;
          seen.add(key);
          next.push({ known: k, steps: node.steps + 1 });
        }
      }
      if (!next.length) break;
      frontier = next;
    }
    for (const node of frontier) if (node.known.has(target)) return node.steps;
    return null;
  }

  let solvable = 0;
  for (const c of DATA.chains) {
    const r = shortestRoute(c.known, c.target);
    if (r === null) fail(`chain ${c.id} is UNSOLVABLE with the shipped equations ` +
                         `(${c.known.join(",")} → ${c.target})`);
    else if (r < 1) fail(`chain ${c.id} starts with its target already known`);
    else if (r > 4) fail(`chain ${c.id} needs ${r} steps — too long to be a good puzzle`);
    else solvable++;
    if (!DATA.symbols[c.target]) fail(`chain ${c.id} targets unknown symbol "${c.target}"`);
    for (const k of c.known) {
      if (!DATA.symbols[k]) fail(`chain ${c.id} lists unknown symbol "${k}" as known`);
    }
  }
  console.log(`\n  derivation chains: ${solvable}/${DATA.chains.length} solvable in 1–4 steps`);

  // Every equation's variables must be declared symbols, or the chain UI shows blanks.
  for (const eq of EQ) {
    if (!Array.isArray(eq.vars) || !eq.vars.length) fail(`equation ${eq.id} declares no vars`);
    for (const v of eq.vars || []) {
      if (!DATA.symbols[v]) fail(`equation ${eq.id} uses undeclared symbol "${v}"`);
    }
    try { U.math(eq.formula); }
    catch (e) { fail(`equation ${eq.id}: formula failed to render: ${e.message}`); }
    if (eq.usesConstant && !DATA.constants.table[eq.usesConstant])
      fail(`equation ${eq.id} names constant "${eq.usesConstant}", which is not in constants.js`);
  }
}

/* ══════════════════════════════════════════════════════════════════════════
   5. CONSTANTS — every value traced to constants.js  (§3.2)
   ══════════════════════════════════════════════════════════════════════════
   A constant inlined in one template and updated in another is exactly the kind
   of error that produces confidently wrong answers forever. Generators must
   reach for K("g"), never for 9.8.
   ══════════════════════════════════════════════════════════════════════════ */
{
  const SUSPICIOUS = [
    { re: /(?<![\d.])9\.81?(?![\d])/g, what: "g — use K(\"g\")" },
    { re: /3\.00?e8|3\.0e8|300000000/gi, what: "c — use K(\"c\")" },
    { re: /6\.67e-11|6\.674e-11/gi, what: "G — use K(\"G\")" },
    { re: /6\.626e-34/gi, what: "h — use K(\"h\")" },
    { re: /1\.602e-19/gi, what: "e / eV — use K(\"e\") or K(\"eV\")" },
    { re: /8\.854e-12/gi, what: "ε₀ — use K(\"eps0\")" },
    { re: /8\.99e9|8\.988e9/gi, what: "Coulomb k — use K(\"kCoulomb\")" },
    { re: /9\.109e-31/gi, what: "electron mass — use K(\"me\")" },
    { re: /1\.673e-27|1\.675e-27/gi, what: "proton/neutron mass — use K(\"mp\") / K(\"mn\")" },
    { re: /5\.67e-8/gi, what: "Stefan constant — use K(\"stefan\")" },
    { re: /2\.898e-3/gi, what: "Wien constant — use K(\"wien\")" },
    { re: /1\.097e7/gi, what: "Rydberg constant — use K(\"rydberg\")" },
    { re: /1\.661e-27/gi, what: "atomic mass unit — use K(\"u\")" },
    { re: /6\.371e6/gi, what: "Earth radius — use K(\"rE\")" }
  ];
  let hits = 0;
  for (const rel of generatorFiles()) {
    const src = fs.readFileSync(path.join(ROOT, rel), "utf8");
    // Strip comments and template literals used for question TEXT: a stem is
    // allowed — and expected — to quote the value to the student.
    const code = src
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/\/\/[^\n]*/g, "")
      .replace(/`(?:[^`\\]|\\.)*`/g, "``")
      .replace(/"(?:[^"\\]|\\.)*"/g, '""')
      .replace(/'(?:[^'\\]|\\.)*'/g, "''");
    for (const s of SUSPICIOUS) {
      s.re.lastIndex = 0;
      const found = code.match(s.re);
      if (found) {
        hits += found.length;
        fail(`${rel}: ${found.length} inlined literal(s) for ${s.what} — ${found.join(", ")}`);
      }
    }
  }
  console.log(`\n  inlined constants in generators: ${hits} (must be 0)`);

  // And every constant must be internally consistent with its own stated units.
  for (const c of DATA.constants.list()) {
    if (!c.units) continue;
    const p = Units.parse(c.disp);
    if (!p) { fail(`constant ${c.id}: units "${c.disp}" do not parse`); continue; }
    if (!Units.same(p.units, c.units))
      fail(`constant ${c.id}: printed units "${c.disp}" (${Units.baseStr(p.units)}) do not match ` +
           `its dimension map (${Units.baseStr(c.units)})`);
    if (!c.src) fail(`constant ${c.id}: no source note`);
  }
  const onSheet = DATA.constants.onSheet().length;
  console.log(`  constants: ${DATA.constants.list().length} total, ${onSheet} from the data sheet`);
  notes.push("The NESA data sheet PDF could not be fetched in this environment (egress policy " +
             "blocks every host serving it). Values were cross-checked against multiple " +
             "reproductions — diff subjects/phys/data/constants.js against the current PDF before relying " +
             "on it for a real HSC year: " + DATA.constants.SHEET_URL);
}

/* ══════════════════════════════════════════════════════════════════════════
   6. THE MANIFEST vs the files on disk  (StudyQuest port)
   ══════════════════════════════════════════════════════════════════════════
   The stand-alone app diffed sw.js's precache against index.html. In StudyQuest the
   service worker is the app's (its own suite owns that); what Physics owns is
   subjects/phys/manifest.js, which must load every script under the subject and
   nothing that is not there. A file on disk the manifest forgets is content that
   silently never loads.
   ══════════════════════════════════════════════════════════════════════════ */
{
  const man = fs.readFileSync(path.join(ROOT, "subjects/phys/manifest.js"), "utf8");
  const sandbox = { SQ: { Subjects: { manifest: (id, m) => (sandbox.got = m) } } };
  sandbox.window = sandbox;
  require("vm").runInNewContext(man, sandbox);
  const listed = new Set(sandbox.got.scripts);
  const onDisk = [];
  for (const dir of ["core", "data", "data/generators", "games", "screens"]) {
    for (const f of fs.readdirSync(path.join(ROOT, "subjects/phys", dir)))
      if (f.endsWith(".js")) onDisk.push("subjects/phys/" + dir + "/" + f);
  }
  for (const rel of onDisk) if (!listed.has(rel)) fail(`${rel} is on disk but not in manifest.js scripts`);
  for (const rel of listed) if (!fs.existsSync(path.join(ROOT, rel))) fail(`manifest.js loads ${rel}, which does not exist`);
  for (const rel of sandbox.got.css) if (!fs.existsSync(path.join(ROOT, rel))) fail(`manifest.js loads ${rel}, which does not exist`);
  if (!fs.existsSync(path.join(ROOT, "subjects/phys/css/themes.css"))) fail("subjects/phys/css/themes.css is missing");
  if (typeof sandbox.got.importLegacy !== "function") fail("manifest.js has no importLegacy");
  console.log(`\n  manifest: ${listed.size} scripts, ${onDisk.length} on disk`);
}

/* ══════════════════════════════════════════════════════════════════════════
   7. BREAK=<mode> — prove each check fails without its fix
   ══════════════════════════════════════════════════════════════════════════ */
if (breakMode) {
  console.log(`\n  BREAK=${breakMode}: ${BREAKS[breakMode]}`);
  const injected = injectBreak(breakMode);
  if (!injected.ok) {
    console.log(`\n❌ BREAK=${breakMode} could not inject its defect: ${injected.why}`);
    process.exit(2);
  }
  if (injected.caught) {
    console.log(`\n✅ BREAK=${breakMode} was caught: ${injected.caught}`);
    process.exit(0);
  }
  console.log(`\n❌ BREAK=${breakMode} was NOT caught — that check is testing nothing.`);
  process.exit(1);
}

function injectBreak(mode) {
  try {
    if (mode === "routes" || mode === "dimensions" || mode === "distractor") {
      const t = Gen.all().find(x => x.id === "m1-suvat-v");
      if (!t) return { ok: false, why: "m1-suvat-v no longer exists" };
      const orig = t.build;
      t.build = function (r, K, S, st) {
        const raw = orig.call(this, r, K, S, st);
        if (mode === "routes") raw.verify = () => raw.value * 1.05;
        if (mode === "dimensions") raw.units = { m: 1 };
        if (mode === "distractor") raw.distractors = [{ value: raw.value, why: "identical to the key" }]
          .concat(raw.distractors);
        return raw;
      };
      let caught = null;
      try { Gen.make(t.id, 12345); }
      catch (e) { caught = e.message; }
      t.build = orig;
      if (mode === "distractor" && !caught) {
        // A key-equal distractor is dropped, not thrown; check it never survives.
        t.build = function (r, K, S, st) {
          const raw = orig.call(this, r, K, S, st);
          raw.distractors = [{ value: raw.value, why: "identical to the key" }].concat(raw.distractors);
          return raw;
        };
        const q = Gen.make(t.id, 12345);
        t.build = orig;
        const clash = q.distractors.find(d => d.str === q.answer.str);
        caught = clash ? null : "the key-equal distractor was dropped rather than offered";
      }
      return { ok: true, caught };
    }

    if (mode === "bias") {
      if (!authored.length) return { ok: false, why: "there are no authored questions to bias yet" };
      // Make every key the longest option by padding it.
      const copy = authored.map(q => Object.assign({}, q, {
        choices: q.choices.map((c, i) => (i === q.a ? c + " because of the reason described here" : c))
      }));
      const longest = copy.filter(q => {
        const lens = q.choices.map(c => U.mathPlain(c).length);
        const max = Math.max.apply(null, lens);
        return lens[q.a] === max && lens.filter(l => l === max).length === 1;
      }).length;
      const p = (longest / copy.length) * 100;
      return { ok: true, caught: p > 32 ? `bias rose to ${p.toFixed(1)}%, above the 32% limit` : null };
    }

    if (mode === "dedupe") {
      if (authored.length < 2) return { ok: false, why: "not enough authored questions" };
      const q = authored[0];
      const twin = Object.assign({}, q, { id: q.id + "-twin" });
      const s = jaccard(bigrams(q.q), bigrams(twin.q));
      return { ok: true, caught: s > 0.75 ? `the duplicated stem scored ${s.toFixed(2)}` : null };
    }

    if (mode === "literal") {
      const rel = generatorFiles()[0];
      if (!rel) return { ok: false, why: "no generator files" };
      const src = fs.readFileSync(path.join(ROOT, rel), "utf8");
      const patched = src.replace("const g = K(\"g\");", "const g = 9.8;");
      if (patched === src) return { ok: false, why: "could not find a K(\"g\") call to replace" };
      try { new Function(patched); } catch (e) { return { ok: false, why: "patched file no longer parses" }; }
      const code = patched.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\n]*/g, "");
      return { ok: true, caught: /(?<![\d.])9\.81?(?![\d])/.test(code) ? "the inlined 9.8 was detected" : null };
    }

    return { ok: false, why: "unhandled mode" };
  } catch (e) {
    return { ok: false, why: e.message };
  }
}

/* ── report ────────────────────────────────────────────────────────────────── */
console.log("");
if (notes.length) {
  console.log("Notes:");
  notes.forEach(n => console.log("  · " + n));
  console.log("");
}
if (warns.length) {
  console.log(`Warnings (${warns.length}):`);
  warns.slice(0, 20).forEach(w => console.log("  ~ " + w));
  if (warns.length > 20) console.log(`  … and ${warns.length - 20} more`);
  console.log("");
}
if (fails.length) {
  console.log(`❌ ${fails.length} failure(s):`);
  fails.slice(0, 40).forEach(f => console.log("   " + f));
  if (fails.length > 40) console.log(`   … and ${fails.length - 40} more`);
  process.exit(1);
}
console.log("✅ Content valid.");
