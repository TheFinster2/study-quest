/* ============================================================================
   validate.js — Maths Standard content invariants, ported from NumberCrunch's
   tests/validate.js (117 checks there). Plain Node, no test framework.

   Loads the shared core (SQ util/store/subject-state) and the subject's data
   and engine files in a vm sandbox where the context global IS `window`.
   App-level sections (service worker precache, update chain, manifest.webmanifest,
   app.js flush wiring) are the app's now and are checked by the app's own tests;
   in their place: manifest.js wiring and CSS scoping.

   Run: node tests/subjects/mstd/validate.js
   ========================================================================== */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..', '..', '..');
const SUB = 'subjects/mstd/';
let fails = 0, checks = 0, warns = 0;

function ok(cond, msg, detail) {
  checks++;
  if (!cond) {
    fails++;
    console.log('  FAIL  ' + msg + (detail ? '\n        ' + detail : ''));
  }
  return !!cond;
}
function warn(cond, msg, detail) {
  if (!cond) { warns++; console.log('  warn  ' + msg + (detail ? '\n        ' + detail : '')); }
}
function head(t) { console.log('\n' + t); }

/* ------------------------------------------------------------- the sandbox */
function makeSandbox() {
  const store = {};
  const ctx = {
    console, Math, Number, String, Object, Array, JSON, Date, RegExp, Error,
    isFinite, isNaN, parseFloat, parseInt, setTimeout, clearTimeout,
    setInterval, clearInterval, encodeURIComponent, decodeURIComponent
  };
  ctx.window = ctx;
  ctx.self = ctx;
  ctx.localStorage = {
    getItem: k => (k in store ? store[k] : null),
    setItem: (k, v) => { store[k] = String(v); },
    removeItem: k => { delete store[k]; },
    clear: () => { Object.keys(store).forEach(k => delete store[k]); }
  };
  ctx.navigator = { serviceWorker: null, userAgent: 'node' };
  ctx.location = { hash: '#/', protocol: 'http:', href: 'http://localhost/' };
  ctx.matchMedia = () => ({ matches: false, addEventListener() {} });
  ctx.devicePixelRatio = 1;
  ctx.innerWidth = 390; ctx.innerHeight = 800;
  ctx.requestAnimationFrame = () => 0;
  ctx.cancelAnimationFrame = () => {};
  ctx.addEventListener = () => {};
  ctx.removeEventListener = () => {};
  ctx.getComputedStyle = () => ({ getPropertyValue: () => '' });

  const fakeNode = () => {
    const n = {
      style: {}, dataset: {}, classList: { add() {}, remove() {}, toggle() {}, contains: () => false },
      children: [], childNodes: [], firstChild: null, innerHTML: '', textContent: '',
      appendChild(c) { this.children.push(c); return c; },
      removeChild() {}, setAttribute() {}, getAttribute: () => null,
      addEventListener() {}, removeEventListener() {}, querySelector: () => null,
      querySelectorAll: () => [], getContext: () => ({
        scale() {}, clearRect() {}, beginPath() {}, moveTo() {}, lineTo() {}, stroke() {},
        fill() {}, arc() {}, rect() {}, fillRect() {}, strokeRect() {}, closePath() {},
        ellipse() {}, save() {}, restore() {}, translate() {}, rotate() {}, fillText() {},
        setLineDash() {}, createLinearGradient: () => ({ addColorStop() {} })
      }),
      getBoundingClientRect: () => ({ left: 0, top: 0, width: 0, height: 0 }),
      remove() {}, scrollIntoView() {}, focus() {}, blur() {}, click() {}
    };
    return n;
  };
  ctx.document = {
    createElement: fakeNode, createTextNode: t => ({ text: t }),
    querySelector: () => null, querySelectorAll: () => [],
    getElementById: () => null, addEventListener: () => {},
    documentElement: Object.assign(fakeNode(), { setAttribute() {}, getAttribute: () => 'ledger' }),
    body: fakeNode(), readyState: 'complete', visibilityState: 'visible'
  };
  ctx.Node = function () {};
  vm.createContext(ctx);
  return ctx;
}

/* Files loaded in dependency order — the same order as manifest.js. */
const SQ_CORE = ['js/sq/util.js', 'js/sq/economy.js', 'js/sq/subjects.js', 'js/sq/store.js', 'js/sq/overall.js', 'js/sq/subject-state.js'];
const CORE_1 = ['core/util.js', 'core/expr.js', 'core/units.js', 'core/draw.js'].map(f => SUB + f);
const DATA = fs.readdirSync(path.join(ROOT, SUB + 'data')).filter(f => f.endsWith('.js')).sort((a, b) => {
  if (a === 'topics.js') return -1;
  if (b === 'topics.js') return 1;
  return a.localeCompare(b);
}).map(f => SUB + 'data/' + f);
const CORE_2 = ['core/state.js', 'core/bank.js', 'core/money.js', 'core/net.js', 'core/calc.js', 'core/sheet.js'].map(f => SUB + f);

const ctx = makeSandbox();
head('Loading files');
[...SQ_CORE, ...CORE_1, ...DATA, ...CORE_2].forEach(rel => {
  const file = path.join(ROOT, rel);
  try {
    vm.runInContext(fs.readFileSync(file, 'utf8'), ctx, { filename: rel });
  } catch (e) {
    fails++;
    console.log('  FAIL  ' + rel + ' threw on load: ' + e.message);
  }
});
const MS = ctx.window.MS;
ok(!!MS, 'window.MS exists');
ok(ctx.window.U === undefined && ctx.window.MQ === undefined && ctx.window.Bank === undefined && ctx.window.State === undefined, 'no global U / MQ / Bank / State leaks from the subject');
const U = MS.U, Bank = MS.Bank, State = MS.State, Calc = MS.Calc, Net = MS.Net, Money = MS.Money;
/* The save must exist before anything reads or writes it — the tier checks in
   section 1 call State.setTier(), and Bank.filter() reads the tier. */
ctx.SQ.Store.load();
State.load();
console.log('  loaded ' + (SQ_CORE.length + CORE_1.length + DATA.length + CORE_2.length) + ' files, ' +
            (MS.QUESTIONS || []).length + ' questions, ' + (MS.CARDS || []).length + ' cards, ' +
            Calc.GENS.length + ' generators');

/* ====================================================== 1. question shape */
head('1. Question bank shape');
const QS = MS.QUESTIONS || [];
const codes = new Set(MS.TOPICS.map(t => t.code));
const subsByCode = {};
MS.TOPICS.forEach(t => { subsByCode[t.code] = new Set(t.subs); });
const seenIds = new Set();
let shapeBad = [];
QS.forEach(q => {
  if (!q.id || seenIds.has(q.id)) shapeBad.push((q.id || '?') + ': duplicate or missing id');
  seenIds.add(q.id);
  if (!Array.isArray(q.choices) || q.choices.length !== 4) shapeBad.push(q.id + ': needs exactly 4 choices');
  if (q.a !== 0) shapeBad.push(q.id + ': `a` must be 0 (the key is always choices[0])');
  if (!q.why || String(q.why).trim().length < 12) shapeBad.push(q.id + ': `why` missing or too short');
  if (!q.q || String(q.q).trim().length < 8) shapeBad.push(q.id + ': `q` missing or too short');
  if (!codes.has(q.mod)) shapeBad.push(q.id + ': unknown topic code "' + q.mod + '"');
  if (!q.topic) shapeBad.push(q.id + ': missing sub-topic');
  else if (subsByCode[q.mod] && !subsByCode[q.mod].has(q.topic)) {
    shapeBad.push(q.id + ': sub-topic "' + q.topic + '" is not listed under ' + q.mod);
  }
  if (!(q.diff >= 0 && q.diff <= 3)) shapeBad.push(q.id + ': diff must be 0, 1, 2 or 3');
  if (new Set(q.choices.map(c => String(c).trim())).size !== 4) shapeBad.push(q.id + ': duplicate choices');
  if (q.table && (!q.table.head || !Array.isArray(q.table.rows))) shapeBad.push(q.id + ': malformed table');
  if (q.table) {
    const w = q.table.head.length;
    q.table.rows.forEach((r, i) => {
      if (r.length !== w) shapeBad.push(q.id + ': table row ' + i + ' has ' + r.length + ' cells, head has ' + w);
    });
  }
});
ok(shapeBad.length === 0, shapeBad.length + ' question shape problems', shapeBad.slice(0, 25).join('\n        '));
ok(QS.length >= 400, 'at least 400 questions (§4.4) — have ' + QS.length);

/* Year 12 weighting: roughly 60/40 towards Year 12 (§4.4) */
const yrOf = {};
MS.TOPICS.forEach(t => { yrOf[t.code] = t.yr; });
const y12 = QS.filter(q => yrOf[q.mod] === 12).length;
const share = QS.length ? y12 / QS.length : 0;
ok(share >= 0.5 && share <= 0.7, 'Year 12 share between 50% and 70% — is ' + Math.round(share * 100) + '%');

/* Every topic has enough questions to run a 15-question drill. */
const perTopic = {};
QS.forEach(q => { perTopic[q.mod] = (perTopic[q.mod] || 0) + 1; });
const thin = MS.TOPICS.filter(t => (perTopic[t.code] || 0) < 15).map(t => t.code + '=' + (perTopic[t.code] || 0));
ok(thin.length === 0, 'every topic has 15+ questions for Topic Drill', thin.join(', '));

/* ---------------------------------------------------- question tiers ---
   A tier the player can select must be able to deal a real run in every
   topic, or picking Warm-up silently falls back to the full bank. */
const TIER_MIN = 6;
const tierGaps = [];
Object.keys(State.TIERS).forEach(k => {
  const t = State.TIERS[k];
  const lo = t.diffMin || 0, hi = t.diffMax == null ? 3 : t.diffMax;
  const total = QS.filter(q => q.diff >= lo && q.diff <= hi).length;
  console.log('  ' + (t.ic + ' ' + t.nm).padEnd(14) + 'diff ' + lo + '-' + hi + ': ' + total + ' questions');
  if (total < 100) tierGaps.push(t.nm + ' tier has only ' + total + ' questions overall');
  MS.TOPICS.forEach(tp => {
    const n = QS.filter(q => q.mod === tp.code && q.diff >= lo && q.diff <= hi).length;
    if (n < TIER_MIN) tierGaps.push(t.nm + '/' + tp.code + ' has only ' + n);
  });
});
ok(tierGaps.length === 0, 'every tier can deal ' + TIER_MIN + '+ questions in every topic', tierGaps.slice(0, 12).join('\n        '));

/* The foundation band must genuinely be easier: no tables, no figures, short
   stems. A "diff 0" question with a data table in it is mislabelled. */
const notEasy = [];
QS.filter(q => q.diff === 0).forEach(q => {
  if (q.table) notEasy.push(q.id + ': diff 0 with a table');
  if (q.stem && U.words(q.stem) > 25) notEasy.push(q.id + ': diff 0 with a ' + U.words(q.stem) + '-word stem');
  if (U.words(q.q) > 30) notEasy.push(q.id + ': diff 0 question is ' + U.words(q.q) + ' words');
});
ok(notEasy.length === 0, 'foundation questions are actually short and simple', notEasy.slice(0, 10).join('\n        '));
ok(QS.filter(q => q.diff === 0).length >= 100, 'at least 100 foundation questions — have ' + QS.filter(q => q.diff === 0).length);

/* Bank.filter must actually honour the tier, and allTiers must bypass it. */
State.setTier('warmup');
const warmPool = Bank.filter({});
ok(warmPool.length > 0 && warmPool.every(q => q.diff <= 1), 'Bank.filter honours the Warm-up tier (' + warmPool.length + ' questions, max diff ' + Math.max(...warmPool.map(q => q.diff)) + ')');
State.setTier('exam');
const examPool = Bank.filter({});
ok(examPool.length > 0 && examPool.every(q => q.diff >= 2), 'Bank.filter honours the Exam tier (' + examPool.length + ' questions, min diff ' + Math.min(...examPool.map(q => q.diff)) + ')');
ok(Bank.filter({ allTiers: true }).length === QS.length, 'allTiers:true bypasses the tier entirely');
/* A narrow tier must soften, never deal an empty run. */
State.setTier('warmup');
ok(Bank.draw(15, { mod: 'MS-A4' }).length > 0, 'a thin tier still deals a run rather than nothing');
State.setTier('mixed');
ok(Bank.filter({}).length === QS.length, 'the Mixed tier reaches the whole bank');

/* ========================================= 2. answer-length bias (§9.7) */
head('2. Answer-length bias (§9.7)');
/* Two measures, both from the reference app's post-mortem:
   - longest-or-tied: picking any longest option and being right
   - strictly longest: the key is the unique longest option
   The build fails above 32% on the first. */
let longestHit = 0, strictHit = 0, dollarOnly = 0, dollarQs = 0;
QS.forEach(q => {
  const lens = q.choices.map(c => String(c).length);
  const max = Math.max(...lens);
  const winners = lens.filter(l => l === max).length;
  if (lens[0] === max) { longestHit += 1 / winners; if (winners === 1) strictHit++; }
  /* §9.7's second, Standard-specific tell: the only option formatted to the
     cent is the answer. */
  const cents = q.choices.map(c => /\$[\d,]+\.\d{2}/.test(String(c)));
  if (cents.some(Boolean)) {
    dollarQs++;
    if (cents[0] && cents.filter(Boolean).length === 1) dollarOnly++;
  }
});
const longestPct = QS.length ? longestHit / QS.length : 0;
const strictPct = QS.length ? strictHit / QS.length : 0;
console.log('  longest-option scoring: ' + (longestPct * 100).toFixed(1) + '%  (chance = 25%, budget = 32%)');
console.log('  strictly-longest-is-key: ' + (strictPct * 100).toFixed(1) + '%');
ok(longestPct <= 0.32, 'longest-option scoring at or below 32%');
/* Measured per tier as well: the foundation band is where lazy distractors are
   most tempting, and a bias that only exists there would hide in the average. */
[[0, 0, 'foundation'], [0, 1, 'warm-up'], [2, 3, 'exam']].forEach(([lo, hi, label]) => {
  const band = QS.filter(q => q.diff >= lo && q.diff <= hi);
  if (!band.length) return;
  let hit = 0;
  band.forEach(q => {
    const lens = q.choices.map(c => String(c).length);
    const max = Math.max(...lens);
    const winners = lens.filter(l => l === max).length;
    if (lens[0] === max) hit += 1 / winners;
  });
  const pct = hit / band.length;
  console.log('  ' + label.padEnd(12) + (pct * 100).toFixed(1) + '% (' + band.length + ' questions)');
  ok(pct <= 0.36, label + ' band longest-option scoring at or below 36%');
});
if (dollarQs) {
  const dollarPct = dollarOnly / dollarQs;
  console.log('  money questions where only the key is formatted to the cent: ' + (dollarPct * 100).toFixed(1) + '% of ' + dollarQs);
  ok(dollarPct <= 0.15, 'the cent-formatted option is not a tell (at or below 15%)');
}
/* And per TOPIC (§D1). A 32% average is easy to hit while one topic sits at
   60%, and a student drilling that topic meets only the biased half. */
{
  const worst = [];
  Bank.TOPICS.forEach(t => {
    const band = QS.filter(q => q.mod === t.code);
    if (band.length < 12) return;
    let hit = 0;
    band.forEach(q => {
      const lens = q.choices.map(c => String(c).length);
      const max = Math.max(...lens);
      const winners = lens.filter(l => l === max).length;
      if (lens[0] === max) hit += 1 / winners;
    });
    const pct = hit / band.length;
    if (pct > 0.36) worst.push(t.code + ' ' + (pct * 100).toFixed(1) + '% of ' + band.length);
  });
  ok(worst.length === 0, 'no single topic scores above 36% on longest-option', worst.join('\n        '));
}

/* Position bias cannot exist — Bank.shuffleChoices randomises at runtime —
   but assert the stored convention holds so that stays true. */
ok(QS.every(q => q.a === 0), 'every stored key is at index 0');

/* ------------------------------------------- §D2, near-duplicate questions
   Compare BIGRAMS, not word sets. A unigram set cannot tell "increase by 15%"
   from "decrease by 15%" — same words, opposite question — so it reports
   false duplicates on exactly the pairs that make a good bank, and a
   threshold loose enough to survive that noise stops catching anything. Word
   ORDER carries the meaning, so pairs of adjacent words are the unit.

   Three verbatim copies were sitting between the warm-up bank and the main
   bank when this went in, which meant the "easier" tier was partly just the
   same questions again. */
{
  const norm = q => ((q.stem || '') + ' ' + (q.q || '')).toLowerCase()
    .replace(/\\[a-z]+/g, ' ').replace(/[^a-z0-9%$. ]/g, ' ').split(/\s+/).filter(Boolean);
  const grams = w => {
    const s = new Set();
    for (let i = 0; i + 1 < w.length; i++) s.add(w[i] + ' ' + w[i + 1]);
    return s;
  };
  const jaccard = (a, b) => {
    let inter = 0;
    a.forEach(x => { if (b.has(x)) inter++; });
    const uni = a.size + b.size - inter;
    return uni ? inter / uni : 0;
  };
  const prep = QS.map(q => ({ q, g: grams(norm(q)) }));
  const dupes = [];
  let compared = 0;
  for (let i = 0; i < prep.length; i++) {
    for (let j = i + 1; j < prep.length; j++) {
      if (prep[i].q.mod !== prep[j].q.mod) continue;   // cross-topic echoes are fine
      compared++;
      const sim = jaccard(prep[i].g, prep[j].g);
      /* 0.95 is near-verbatim. Legitimate template variants — same wording,
         different numbers or the opposite ask — measure 0.75 to 0.89, and
         those are good questions, not duplicates. */
      if (sim >= 0.95) {
        dupes.push(prep[i].q.id + ' / ' + prep[j].q.id + ' (' + sim.toFixed(2) + ') ' +
                   String(prep[i].q.q).slice(0, 52));
      }
    }
  }
  console.log('  question pairs compared for near-duplication: ' + compared);
  ok(dupes.length === 0, 'no two questions in a topic are near-verbatim copies (§D2)',
     dupes.slice(0, 12).join('\n        '));
}

/* ------------------------------------------------------- §D5, the working
   states the answer. `a: 0` is a convention, not a proof — nothing above
   would notice if a key quietly pointed at a distractor. Where the answer is
   a bare number or amount, the worked solution has to arrive at that same
   number, which ties the stored key to real arithmetic and doubles as a
   promise to the student that the explanation actually explains THIS answer.
   Prose answers are exempt: their numbers are incidental. */
{
  const BARE = /^-?\$?\d[\d,\s]*(?:\.\d+)?\s*(?:%|°|km\/h|m\/s|km|cm|mm|kg|mL|min|units|marks|m|g|t|L|h|s)?$/;
  const flat = s => String(s).replace(/[\s,]/g, '').replace(/[−–—]/g, '-');
  const orphans = [];
  let checked = 0;
  QS.forEach(q => {
    if (!q.choices) return;
    const key = String(q.choices[q.a]).trim();
    if (!BARE.test(key)) return;
    checked++;
    const num = flat(key.match(/-?\$?\d[\d,\s]*(?:\.\d+)?/)[0]);
    if (!flat(q.why || '').includes(num)) orphans.push(q.id + ' — key "' + key + '" never appears in the working');
  });
  console.log('  bare numeric keys cross-checked against their working: ' + checked);
  ok(orphans.length === 0, 'every numeric answer is reached by its own worked solution (§D5)',
     orphans.slice(0, 15).join('\n        '));
  ok(checked > 200, 'the cross-check covers a real share of the bank (' + checked + ' questions)');
}

/* ================================================ 3. notation round-trip */
head('3. Notation renderer round-trip (§8.1)');
const notationBad = [];
function checkNotation(src, where) {
  if (src == null) return;
  const s = String(src);
  const html = U.mathHtml(s);
  /* Unbalanced braces in the SOURCE are an authoring error. */
  const open = (s.match(/\{/g) || []).length, close = (s.match(/\}/g) || []).length;
  if (open !== close) notationBad.push(where + ': unbalanced braces');
  /* Any backslash command left in the output means the symbol table is missing
     it, or the command was misspelled. */
  const leftover = html.match(/\\[A-Za-z]+/g);
  if (leftover) notationBad.push(where + ': unrendered command ' + leftover.join(' '));
  /* No raw markup may reach the DOM: every < in the output must be a tag we
     generated ourselves. */
  const tags = html.match(/<\/?[a-z]+[^>]*>/g) || [];
  const allowed = /^<\/?(span|sup|sub)(\s+class="(frac|fnum|fden|sq|rad)")?>$/;
  tags.forEach(t => { if (!allowed.test(t)) notationBad.push(where + ': unexpected tag ' + t); });
  if (/<(?!\/?(span|sup|sub))/.test(html)) notationBad.push(where + ': raw < reached the output');
  if (/[{}]/.test(html)) notationBad.push(where + ': braces survived rendering');
}
QS.forEach(q => {
  checkNotation(q.q, q.id + '.q');
  checkNotation(q.stem, q.id + '.stem');
  checkNotation(q.why, q.id + '.why');
  q.choices.forEach((c, i) => checkNotation(c, q.id + '.choice' + i));
  if (q.table) {
    q.table.head.forEach((h, i) => checkNotation(h, q.id + '.thead' + i));
    q.table.rows.forEach((r, ri) => r.forEach((c, ci) => checkNotation(c, q.id + '.tr' + ri + 'c' + ci)));
  }
});
(MS.CARDS || []).forEach(c => { checkNotation(c.front, c.id + '.front'); checkNotation(c.back, c.id + '.back'); });
(MS.PAIR_SETS || []).forEach(s => s.pairs.forEach((p, i) => {
  checkNotation(p[0], s.id + '.pair' + i + 'a'); checkNotation(p[1], s.id + '.pair' + i + 'b');
}));
(MS.REFERENCE || []).forEach(r => (r.sections || []).forEach((s, si) => {
  checkNotation(s.h, r.id + '.s' + si + '.h');
  checkNotation(s.text, r.id + '.s' + si + '.text');
  (s.items || []).forEach((it, i) => checkNotation(it, r.id + '.s' + si + '.item' + i));
  (s.head || []).forEach((h, i) => checkNotation(h, r.id + '.s' + si + '.head' + i));
  (s.rows || []).forEach((row, ri) => row.forEach((c, ci) => checkNotation(c, r.id + '.s' + si + '.r' + ri + 'c' + ci)));
}));
ok(notationBad.length === 0, notationBad.length + ' notation problems', notationBad.slice(0, 20).join('\n        '));
/* XSS: escaping must happen BEFORE substitution (§6.1). */
ok(U.mathHtml('<img src=x onerror=alert(1)>').indexOf('<img') < 0, 'renderer escapes HTML before substituting');
ok(U.mathHtml('\\frac{<b>}{2}').indexOf('<b>') < 0, 'renderer escapes inside \\frac arguments');

/* ================================================ 4. flashcards and pairs */
head('4. Flashcards, pairs, bosses');
const CARDS = MS.CARDS || [];
const cardIds = new Set();
const cardBad = [];
CARDS.forEach(c => {
  if (!c.id || cardIds.has(c.id)) cardBad.push((c.id || '?') + ': duplicate or missing id');
  cardIds.add(c.id);
  if (!c.front || !c.back) cardBad.push(c.id + ': missing front or back');
  if (!codes.has(c.mod)) cardBad.push(c.id + ': unknown topic code ' + c.mod);
});
ok(cardBad.length === 0, cardBad.length + ' flashcard problems', cardBad.slice(0, 10).join('\n        '));
ok(CARDS.length >= 80, 'at least 80 flashcards (§4.4) — have ' + CARDS.length);

const pairBad = [];
(MS.PAIR_SETS || []).forEach(s => {
  if (s.pairs.length < 6) pairBad.push(s.id + ': needs at least 6 pairs to deal a board');
  const lefts = new Set(s.pairs.map(p => p[0])), rights = new Set(s.pairs.map(p => p[1]));
  if (lefts.size !== s.pairs.length) pairBad.push(s.id + ': duplicate left-hand items');
  if (rights.size !== s.pairs.length) pairBad.push(s.id + ': duplicate right-hand items');
});
ok(pairBad.length === 0, pairBad.length + ' pair-set problems', pairBad.join('\n        '));

const bossBad = [];
(MS.BOSSES || []).forEach(b => {
  if (!b.id || !b.nm || !b.gimmick) bossBad.push((b.id || '?') + ': incomplete');
  if (b.mods) b.mods.forEach(m => { if (!codes.has(m)) bossBad.push(b.id + ': unknown topic ' + m); });
  if (b.mods) {
    const pool = QS.filter(q => b.mods.indexOf(q.mod) >= 0).length;
    if (pool < 25) bossBad.push(b.id + ': only ' + pool + ' questions in its topics — needs 25+');
  }
});
ok(bossBad.length === 0, bossBad.length + ' boss problems', bossBad.join('\n        '));
ok((MS.ACHIEVEMENTS || []).length >= 65, 'at least 65 achievements (§4.4) — have ' + (MS.ACHIEVEMENTS || []).length);
const achIds = new Set();
const achBad = [];
(MS.ACHIEVEMENTS || []).forEach(a => {
  if (achIds.has(a.id)) achBad.push(a.id + ': duplicate id');
  achIds.add(a.id);
  if (!a.stat && typeof a.fn !== 'function') achBad.push(a.id + ': needs a stat+at or an fn');
  if (a.stat && !(a.at > 0)) achBad.push(a.id + ': stat achievements need a positive threshold');
});
ok(achBad.length === 0, achBad.length + ' achievement problems', achBad.join('\n        '));

/* ====================================== 5. nothing unlocks on a fresh save */
head('5. Fresh save unlocks nothing (§8.1)');
ctx.localStorage.clear();
State.reset();
const freshUnlocks = State.checkAchievements();
ok(freshUnlocks.length === 0, 'no achievement unlocks on a fresh save',
   freshUnlocks.map(a => a.id).join(', '));
const st0 = State.achievementStats();
ok(st0.answered === 0 && st0.level === 1 && st0.coins === 0, 'fresh stats are zeroed');
ok(State.data.xp === 0 && State.level() === 1, 'fresh save is level 1 with 0 XP');

/* XP curve tuning (§7) — level 20 ≈ 87k, level 60 ≈ 1.42M. */
const cum20 = State.cumulativeXp(20), cum60 = State.cumulativeXp(60);
console.log('  cumulative XP: level 20 = ' + cum20.toLocaleString() + ', level 60 = ' + cum60.toLocaleString());
ok(cum20 > 84000 && cum20 < 90000, 'level 20 costs about 87,000 XP');
ok(cum60 > 1380000 && cum60 < 1460000, 'level 60 costs about 1.42M XP');
ok(State.TITLES.length === 60, '60 level titles');

/* =============================================== 6. money in cents (§6.4) */
head('6. Money as integer cents (§6.4)');
const moneyBad = [];
/* Every money string in the banks must round-trip through cents unchanged. */
QS.forEach(q => {
  const strs = [q.q, q.stem, q.why].concat(q.choices).filter(Boolean).join(' ');
  (strs.match(/\$[\d,]+\.\d{2}/g) || []).forEach(m => {
    const n = Number(m.replace(/[$,]/g, ''));
    const back = U.money(U.toCents(n));
    if (back !== m) moneyBad.push(q.id + ': ' + m + ' -> ' + back);
  });
});
ok(moneyBad.length === 0, moneyBad.length + ' money values drift through cents', moneyBad.slice(0, 12).join('\n        '));
ok(U.toCents(0.07 * 3) === 21, '0.07 × 3 lands on 21c, not 21.000000000000004');
ok(U.money(U.toCents(1234.5)) === '$1,234.50', 'money formats to the cent with separators');
/* The brief's own worked example (§4.2): $18,000 at 6% p.a. monthly, $350/month. */
const sched = Money.schedule(Money.c(18000), 0.06 / 12, Money.c(350), 4);
ok(sched.rows[0].interest === 9000, 'month 1 interest is $90.00');
ok(sched.rows[0].closing === 1774000, 'month 1 closing balance is $17,740.00');
ok(sched.rows[1].interest === 8870, 'month 2 interest is $88.70');
ok(sched.rows[2].closing === 1721609, 'month 3 closing balance is $17,216.09');
/* Rounding every period must differ from rounding once at the end (§6.4). */
const perPeriod = Money.compound(Money.c(10000), 0.075 / 12, 300);
const onceOnly = Money.compoundClosed(Money.c(10000), 0.075 / 12, 300);
warn(perPeriod !== onceOnly, 'per-period and end rounding differ over 25 years (they should, by cents)');
/* Tax table consistency. */
ok(Money.taxOn(18200) === 0, 'no tax at the threshold');
ok(Money.taxOn(45000) === 428800, 'tax at $45,000 is $4,288.00');
ok(Money.taxOn(135000) === 3128800, 'tax at $135,000 is $31,288.00');
ok(Money.taxOn(190000) === 5163800, 'tax at $190,000 is $51,638.00');
ok(Money.taxOn(62000) === 938800, 'tax at $62,000 is $9,388.00');

/* ===================================== 7. annuity tables match the formula */
head('7. Annuity tables (§4.3, §8.1)');
const A = MS.ANNUITY;
const tableBad = [];
['fv', 'pv'].forEach(kind => {
  A[kind].forEach(row => {
    const n = row[0];
    A.rates.forEach((r, i) => {
      const stored = row[i + 1];
      const derived = kind === 'fv' ? Money.fvFactor(r, n) : Money.pvFactor(r, n);
      if (Math.abs(stored - derived) > 0.00005 + Math.abs(derived) * 1e-9) {
        tableBad.push(kind + ' n=' + n + ' r=' + r + ': stored ' + stored + ', derived ' + derived.toFixed(6));
      }
    });
  });
});
ok(tableBad.length === 0, tableBad.length + ' annuity factors drift from the formula', tableBad.slice(0, 10).join('\n        '));
ok(MS.annuityFactor('fv', 10, 0.05) === 12.5779, 'FV lookup for 10 periods at 5%');
ok(MS.annuityFactor('pv', 20, 0.06) === 11.4699, 'PV lookup for 20 periods at 6%');
ok(MS.annuityFactor('fv', 13, 0.05) === null, 'a missing row returns null rather than a wrong number');

/* Every annuity factor quoted in a question must match the shipped table. */
const quoteBad = [];
QS.filter(q => q.mod === 'MS-F5').forEach(q => {
  const text = [q.stem, q.q, q.why].filter(Boolean).join(' ');
  const m = text.match(/factor[^.]*?(\d+\.\d{4})/i);
  if (!m) return;
  const val = Number(m[1]);
  const exists = ['fv', 'pv'].some(k => A[k].some(row => row.slice(1).some(v => Math.abs(v - val) < 0.00005)));
  if (!exists) quoteBad.push(q.id + ': quotes factor ' + val + ' which is not in either table');
});
ok(quoteBad.length === 0, quoteBad.length + ' quoted annuity factors are not in the tables', quoteBad.join('\n        '));

/* ================================== 8. network puzzles solved independently */
head('8. Network puzzles (§8.1)');
/* An independent critical-path implementation. Deliberately written a
   different way from js/core/net.js so a shared bug cannot hide. */
function independentCPM(activities) {
  const dur = {}, pre = {};
  activities.forEach(a => { dur[a.id] = a.dur; pre[a.id] = a.pre; });
  const memoEF = {};
  function ef(id, seen) {
    if (memoEF[id] != null) return memoEF[id];
    if (seen[id]) throw new Error('cycle at ' + id);
    seen[id] = 1;
    let start = 0;
    pre[id].forEach(p => { start = Math.max(start, ef(p, Object.assign({}, seen))); });
    return (memoEF[id] = start + dur[id]);
  }
  let total = 0;
  activities.forEach(a => { total = Math.max(total, ef(a.id, {})); });
  /* Longest path by exhaustive descent from every source. */
  const succ = {};
  activities.forEach(a => { succ[a.id] = []; });
  activities.forEach(a => a.pre.forEach(p => succ[p].push(a.id)));
  let bestPath = [], bestLen = -1;
  function walk(id, pathSoFar, len) {
    const p2 = pathSoFar.concat([id]), l2 = len + dur[id];
    if (!succ[id].length) {
      if (l2 > bestLen) { bestLen = l2; bestPath = p2; }
      return;
    }
    succ[id].forEach(s => walk(s, p2, l2));
  }
  activities.filter(a => !a.pre.length).forEach(a => walk(a.id, [], 0));
  return { total, path: bestPath, len: bestLen };
}
const projBad = [];
(MS.PROJECTS || []).forEach(P => {
  const ids = new Set(P.activities.map(a => a.id));
  P.activities.forEach(a => a.pre.forEach(p => {
    if (!ids.has(p)) projBad.push(P.id + ': ' + a.id + ' depends on unknown ' + p);
  }));
  if (!P.activities.some(a => !a.pre.length)) projBad.push(P.id + ': no starting activity');
  let mine;
  try { mine = independentCPM(P.activities); }
  catch (e) { projBad.push(P.id + ': ' + e.message); return; }
  const theirs = Net.analyse(P.activities);
  if (theirs.error) { projBad.push(P.id + ': Net.analyse says ' + theirs.error); return; }
  if (theirs.duration !== mine.total) {
    projBad.push(P.id + ': duration ' + theirs.duration + ' vs independent ' + mine.total);
  }
  /* The reported critical path must be contiguous, start to finish, all zero
     float, and as long as the project itself. */
  let len = 0;
  theirs.critical.forEach(id => { len += theirs.nodes[id].dur; });
  if (len !== theirs.duration) projBad.push(P.id + ': critical path length ' + len + ' != duration ' + theirs.duration);
  theirs.critical.forEach(id => {
    if (theirs.nodes[id].float !== 0) projBad.push(P.id + ': ' + id + ' on critical path with float ' + theirs.nodes[id].float);
  });
  for (let i = 1; i < theirs.critical.length; i++) {
    const prev = theirs.critical[i - 1], cur = theirs.critical[i];
    if (theirs.nodes[cur].pre.indexOf(prev) < 0) projBad.push(P.id + ': critical path jumps ' + prev + '->' + cur);
  }
  /* Every float must be non-negative, and at least one activity must have slack
     or the puzzle teaches nothing about float. */
  Object.keys(theirs.nodes).forEach(id => {
    if (theirs.nodes[id].float < 0) projBad.push(P.id + ': negative float at ' + id);
  });
  if (!Object.keys(theirs.nodes).some(id => theirs.nodes[id].float > 0)) {
    projBad.push(P.id + ': every activity is critical — no float to find');
  }
});
ok(projBad.length === 0, projBad.length + ' project-network problems', projBad.slice(0, 15).join('\n        '));
ok((MS.PROJECTS || []).length >= 10, 'at least 10 network puzzles (§4.4) — have ' + (MS.PROJECTS || []).length);

/* Prim and Kruskal must agree on total weight, and both must span. */
const graphBad = [];
(MS.GRAPHS || []).forEach(G => {
  const ids = new Set(G.nodes.map(n => n.id));
  G.edges.forEach(e => {
    if (!ids.has(e.a) || !ids.has(e.b)) graphBad.push(G.id + ': edge ' + e.a + '-' + e.b + ' references an unknown node');
    if (!(e.w > 0)) graphBad.push(G.id + ': edge ' + e.a + '-' + e.b + ' needs a positive weight');
  });
  if (!Net.connected(G.nodes, G.edges)) graphBad.push(G.id + ': graph is not connected');
  const p = Net.prim(G.nodes, G.edges), k = Net.kruskal(G.nodes, G.edges);
  if (p.total !== k.total) graphBad.push(G.id + ": Prim total " + p.total + " != Kruskal total " + k.total);
  if (p.edges.length !== G.nodes.length - 1) graphBad.push(G.id + ': Prim chose ' + p.edges.length + ' edges, needs ' + (G.nodes.length - 1));
  if (k.edges.length !== G.nodes.length - 1) graphBad.push(G.id + ': Kruskal chose ' + k.edges.length + ' edges');
  if (G.shortest) {
    const s = Net.shortest(G.nodes, G.edges, G.shortest.from, G.shortest.to);
    if (!isFinite(s.total)) graphBad.push(G.id + ': no path from ' + G.shortest.from + ' to ' + G.shortest.to);
    /* The reported path's weights must add to the reported total. */
    let sum = 0;
    for (let i = 1; i < s.path.length; i++) {
      const e = G.edges.find(x => (x.a === s.path[i - 1] && x.b === s.path[i]) || (x.b === s.path[i - 1] && x.a === s.path[i]));
      if (!e) { graphBad.push(G.id + ': shortest path uses a non-existent edge'); break; }
      sum += e.w;
    }
    if (sum !== s.total) graphBad.push(G.id + ': shortest path sums to ' + sum + ' not ' + s.total);
  }
});
ok(graphBad.length === 0, graphBad.length + ' graph problems', graphBad.slice(0, 12).join('\n        '));

/* ============================ 9. generators: 500 samples each (§8.1, §9.10) */
head('9. Procedural generators — 500 samples each (§9.9, §9.10)');
ok(Calc.GENS.length >= 40, 'at least 40 generators (§4.4) — have ' + Calc.GENS.length);
const SAMPLES = 500;
const genBad = [];
const genIds = new Set();
Calc.GENS.forEach(gen => {
  if (genIds.has(gen.id)) genBad.push(gen.id + ': duplicate generator id');
  genIds.add(gen.id);
  if (!codes.has(gen.mod)) genBad.push(gen.id + ': unknown topic code ' + gen.mod);
  if (!subsByCode[gen.mod] || !subsByCode[gen.mod].has(gen.topic)) {
    genBad.push(gen.id + ': sub-topic "' + gen.topic + '" not listed under ' + gen.mod);
  }
  const c = gen.contract;
  if (!c) { genBad.push(gen.id + ': no difficulty contract (§9.10)'); return; }
  if (!(c.steps >= 1)) genBad.push(gen.id + ': contract needs a step count');
  if (!c.mag) genBad.push(gen.id + ': contract needs a magnitude note');
  if (!c.answer) genBad.push(gen.id + ': contract needs an answer shape');
  if (typeof c.calculator !== 'boolean') genBad.push(gen.id + ': contract must say whether a calculator is assumed');
  if (!Array.isArray(c.range)) genBad.push(gen.id + ': contract needs an answer range');

  let outOfRange = 0, notFinite = 0, wrongShape = 0, noWhy = 0, unrendered = 0, wrongUnits = 0;
  const distinct = new Set();
  for (let s = 0; s < SAMPLES; s++) {
    let item;
    try { item = Calc.make(gen, 'v|' + gen.id + '|' + s); }
    catch (e) { genBad.push(gen.id + ' threw on sample ' + s + ': ' + e.message); break; }

    /* The answer must exist, be finite, and land inside the declared range. */
    if (typeof item.answer !== 'number' || !isFinite(item.answer)) { notFinite++; continue; }
    if (c.range && (item.answer < c.range[0] - 1e-9 || item.answer > c.range[1] + 1e-9)) outOfRange++;

    /* The answer shape must match the contract. */
    if (c.answer === 'integer' && Math.abs(item.answer - Math.round(item.answer)) > 1e-9) wrongShape++;
    if (c.answer === 'money' && Math.abs(item.answer * 100 - Math.round(item.answer * 100)) > 1e-6) wrongShape++;

    if (!item.why || String(item.why).length < 12) noWhy++;
    if (!item.q || String(item.q).length < 8) noWhy++;

    /* Same renderer round-trip as the static banks. */
    [item.q, item.stem, item.why].filter(Boolean).forEach(str => {
      const html = U.mathHtml(String(str));
      if (/\\[A-Za-z]+/.test(html) || /[{}]/.test(html)) unrendered++;
    });
    if (item.units && !/^[A-Za-z0-9^%$/ .]+$/.test(item.units)) wrongUnits++;

    /* Answers must be recoverable by U.numClose from their own printed form —
       this is what stops a generator producing an unmarkable answer. */
    if (s < 40) {
      const printed = c.answer === 'money' ? U.money$(item.answer).replace(/[$,]/g, '') : String(U.round(item.answer, 6));
      if (!U.numClose(printed, item.answer, item.tol)) {
        genBad.push(gen.id + ': its own answer ' + printed + ' fails its own tolerance check');
      }
    }
    distinct.add(String(U.round(item.answer, 6)) + '|' + String(item.q) + '|' + String(item.stem || ''));
    if (gen.verify && !gen.verify(item)) genBad.push(gen.id + ': verify() rejected sample ' + s);
  }
  if (notFinite) genBad.push(gen.id + ': ' + notFinite + '/' + SAMPLES + ' answers not finite');
  if (outOfRange) genBad.push(gen.id + ': ' + outOfRange + '/' + SAMPLES + ' answers outside declared range [' + c.range + ']');
  if (wrongShape) genBad.push(gen.id + ': ' + wrongShape + '/' + SAMPLES + ' answers do not match shape "' + c.answer + '"');
  if (noWhy) genBad.push(gen.id + ': ' + noWhy + ' samples missing a question or worked explanation');
  if (unrendered) genBad.push(gen.id + ': ' + unrendered + ' samples leave unrendered notation');
  if (wrongUnits) genBad.push(gen.id + ': ' + wrongUnits + ' samples have malformed units');
  /* A generator that produces fewer than 20 distinct problems in 500 draws is
     not really procedural. */
  if (distinct.size < 20) genBad.push(gen.id + ': only ' + distinct.size + ' distinct problems in ' + SAMPLES + ' draws');
});
ok(genBad.length === 0, genBad.length + ' generator problems', genBad.slice(0, 25).join('\n        '));

/* Seeded generation must be reproducible — the daily challenge depends on it. */
const g0 = Calc.GENS[0];
const s1 = Calc.make(g0, 'same'), s2 = Calc.make(g0, 'same');
ok(s1.q === s2.q && s1.answer === s2.answer, 'the same seed produces the same problem');

/* ============================================ 10. shop and economy sanity */
head('10. Shop and economy');
const SHOP = MS.SHOP;
const shopBad = [];
ok(SHOP.themes.length === 10, '10 themes — have ' + SHOP.themes.length);
ok(SHOP.avatars.length === 22, '22 avatars — have ' + SHOP.avatars.length);
ok(SHOP.crates.length === 3, '3 crate tiers — have ' + SHOP.crates.length);
/* Power-ups are sold by the general shop now; NumberCrunch's ids must all map to the shared set. */
const SHARED_PU = ['fifty', 'skip', 'freeze', 'shield', 'double', 'insight', 'revive', 'reread', 'hint'];
Object.keys(State.POWERUPS).forEach(k => { if (SHARED_PU.indexOf(k) < 0) shopBad.push('State.POWERUPS has non-shared id ' + k); });
const manSrc = fs.readFileSync(path.join(ROOT, SUB + 'manifest.js'), 'utf8');
SHOP.powerups.forEach(p => {
  if (!new RegExp('\\b' + p.k + ':\\s*\'(' + SHARED_PU.join('|') + ')\'').test(manSrc)) shopBad.push('legacy power-up ' + p.k + ' has no mapping in importLegacy');
});
/* Every theme in the shop must have a block in themes.css (as mstd-<id>), and vice versa. */
const themesCss = fs.readFileSync(path.join(ROOT, SUB + 'css/themes.css'), 'utf8');
SHOP.themes.forEach(t => {
  if (themesCss.indexOf('[data-theme="mstd-' + t.id + '"]') < 0) shopBad.push('theme mstd-' + t.id + ' has no block in themes.css');
});
(themesCss.match(/\[data-theme="([a-z0-9-]+)"\]/g) || []).forEach(m => {
  const id = m.match(/"([a-z0-9-]+)"/)[1];
  if (!/^mstd-/.test(id)) shopBad.push('themes.css defines un-prefixed theme ' + id);
  else if (!SHOP.themes.some(t => 'mstd-' + t.id === id)) shopBad.push('themes.css defines ' + id + ' which the shop does not sell');
});
const CORE_TOKENS = ['--bg-0', '--bg-1', '--bg-2', '--glow-a', '--glow-b', '--ink', '--ink-dim', '--ink-faint', '--card', '--card-2', '--line', '--accent', '--accent-ink', '--good', '--bad', '--warn', '--info'];
(themesCss.match(/\[data-theme="[^"]+"\]\{[^}]*\}/g) || []).forEach(b => {
  CORE_TOKENS.forEach(t => { if (b.indexOf(t + ':') < 0) shopBad.push(b.slice(0, 30) + ' is missing core token ' + t); });
});
ok(SHOP.themes[0].cost === 0 && SHOP.themes[0].id === 'ledger', 'the default theme is free');
ok(SHOP.avatars[0].cost === 0 && SHOP.avatars[0].g === '🎓', 'the default avatar is free');
ok(shopBad.length === 0, shopBad.length + ' shop problems', shopBad.join('\n        '));

/* Effort per purchase: one honest Topic Drill (15 questions at 80%) is the unit. */
{
  const PER_RUN_CREDITS = Math.round(15 * 0.8) * 6;      // 72
  const RUN_MINUTES = 5;
  const PER_HOUR = PER_RUN_CREDITS * (60 / RUN_MINUTES); // 864
  console.log('  model: one 15-question drill at 80% = ' + PER_RUN_CREDITS +
              ' Credits per ' + RUN_MINUTES + ' min (' + PER_HOUR + '/hour, the slowest mode)');
  const items = []
    .concat(SHOP.themes.filter(t => t.cost > 0).map(t => ({ what: 'theme ' + t.id, cost: t.cost, lv: t.lv, kind: 'theme' })))
    .concat(SHOP.crates.map(c => ({ what: 'crate ' + c.id, cost: c.cost, lv: c.lv, kind: 'crate' })))
    .concat([{ what: 'avatar (cheapest)', cost: Math.min(...SHOP.avatars.filter(a => a.cost > 0).map(a => a.cost)), lv: 1, kind: 'avatar' }])
    .concat([{ what: 'avatar (dearest)', cost: Math.max(...SHOP.avatars.map(a => a.cost)), lv: 1, kind: 'avatar' }]);

  items.forEach(it => { it.runs = it.cost / PER_RUN_CREDITS; it.hours = it.cost / PER_HOUR; });
  items.sort((a, b) => a.hours - b.hours);
  items.forEach(it => {
    console.log('    ' + it.what.padEnd(20) + String(it.cost).padStart(5) + ' cr  ' +
                it.runs.toFixed(1).padStart(5) + ' drills  ' + it.hours.toFixed(2).padStart(5) + ' h');
  });

  const dearest = items[items.length - 1];
  const cheapest = items[0];
  ok(cheapest.hours <= 0.25,
     'something is buyable inside a quarter hour, so the shop is not a distant promise (' +
     cheapest.what + ' at ' + cheapest.hours.toFixed(2) + ' h)');
  ok(dearest.hours <= 4,
     'nothing costs more than four hours of the SLOWEST mode (' + dearest.what + ' at ' +
     dearest.hours.toFixed(2) + ' h)');

  /* The level gate and the price must not be two separate walls. Reaching a
     level earns Credits on the way, so by the time an item unlocks it should
     already be affordable from what that climb paid — otherwise the student
     hits the unlock, is told "not enough Credits", and grinds a second time
     for something they already qualified for.

     The gate being the BINDING constraint is fine and intended: a level-30
     theme is a reward for reaching level 30, and its price is a formality by
     then. What must never happen is the reverse. */
  const doubleWall = [];
  const xpPerRun = 12 * 10 + 60;                       // same run, XP side
  items.forEach(it => {
    if (it.lv <= 1 || !State.cumulativeXp) return;
    const runsToLevel = State.cumulativeXp(it.lv) / xpPerRun;
    const creditsByThen = runsToLevel * PER_RUN_CREDITS;
    it.share = it.cost / creditsByThen;
    /* Measured in TIME, not as a ratio. At level 2 a student has earned about
       50 Credits in total, so any price at all is several times that and a
       ratio test just fails the whole early game. What actually matters is
       how long the wait is: a shortfall of 250 Credits is twenty minutes, and
       twenty minutes of wanting something is a reward loop, not a wall. */
    it.shortfallRuns = Math.max(0, (it.cost - creditsByThen) / PER_RUN_CREDITS);
    if (it.shortfallRuns > 6) {
      doubleWall.push(it.what + ': unlocks at level ' + it.lv + ' having earned ~' +
                      Math.round(creditsByThen) + ' cr, but costs ' + it.cost +
                      ' — ' + it.shortfallRuns.toFixed(1) + ' more drills after unlocking');
    }
  });
  const worstWait = Math.max(0, ...items.map(i => i.shortfallRuns || 0));
  console.log('  longest wait between an item unlocking and affording it: ' +
              worstWait.toFixed(1) + ' drills (~' + Math.round(worstWait * RUN_MINUTES) + ' min)');
  ok(doubleWall.length === 0,
     'unlocking an item is never followed by more than half an hour of saving for it',
     doubleWall.join('\n        '));

  /* And the shop must stay worth visiting: if everything is loose change by
     mid-game there is nothing to save for. */
  const gated = items.filter(i => i.lv > 1 && i.share != null);
  ok(gated.some(i => i.share >= 0.02),
     'at least one item still costs something real at the level it unlocks (dearest is ' +
     Math.round(Math.max(...gated.map(i => i.share)) * 100) + '% of Credits earned by then)');
}


/* Content must be discovered and APPENDED, and every data file must be wired
   into manifest.js — a file nobody loads is invisible. */
{
  const dataDir = path.join(ROOT, SUB + 'data');
  const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.js'));
  const unloaded = [], clobbers = [];
  files.forEach(f => {
    if (manSrc.indexOf("'" + f.replace(/\.js$/, '') + "'") < 0) unloaded.push('data/' + f + ' is not loaded by manifest.js');
    const src = fs.readFileSync(path.join(dataDir, f), 'utf8');
    const m = src.match(/^window\.MS\.([A-Z_]+)\s*=\s*\[/m);
    if (m) clobbers.push(f + ' assigns MS.' + m[1] + ' outright instead of appending to it');
  });
  ok(unloaded.length === 0, 'every data file is loaded by manifest.js', unloaded.join('\n        '));
  ok(clobbers.length === 0, 'no data file overwrites a shared bank (§D4)', clobbers.join('\n        '));
  const onDisk = [];
  ['core', 'games', 'screens'].forEach(dir => fs.readdirSync(path.join(ROOT, SUB + dir)).forEach(f => { if (f.endsWith('.js')) onDisk.push(dir + '/' + f.replace(/\.js$/, '')); }));
  const orphans = onDisk.filter(f => manSrc.indexOf("'" + f + "'") < 0);
  ok(orphans.length === 0, 'every subject script is listed in manifest.js', orphans.join(', '));
  console.log('  ' + files.length + ' data files, all loaded and appending');
}

/* ======================================= 11. anti-farm gates are in place */
head('11. Anti-farm gates (§9.5)');
const uiSrc = fs.readFileSync(path.join(ROOT, SUB + 'core/ui.js'), 'utf8');
const sqUi = fs.readFileSync(path.join(ROOT, 'js/sq/ui.js'), 'utf8');
ok(/MIN_BONUS_ACCURACY\s*=\s*0\.5/.test(sqUi) && /MIN_BONUS_ACCURACY = SQ\.UI\.MIN_BONUS_ACCURACY/.test(uiSrc), 'the completion-bonus accuracy gate is the core 50%');
ok(/MIN_READ_MS\s*=\s*1200/.test(sqUi) && /readMs = function \(text\) \{ return SQ\.UI\.readFloor/.test(uiSrc), 'the read floor is the core readFloor (1,200 ms + 12 ms/word)');
ok(/Math\.max\(0,\s*p\.xp\s*-/.test(uiSrc), 'wrong answers subtract from the run pool, floored at zero');
ok(/weight\(diff\) \{ return diff \? diff : 0\.6; \}/.test(uiSrc), 'diff-0 questions pay ×0.6');
ok(/coinRate: 0\.6/.test(uiSrc) && /coins \* 0\.35/.test(uiSrc), 'coins pay at 0.6, and 35% of that under 50% accuracy');
ok(/SQ\.UI\.award\(ID,/.test(uiSrc), 'the subject award() goes through SQ.UI.award');
const gameFiles = []
  .concat(fs.readdirSync(path.join(ROOT, SUB + 'games')).map(f => SUB + 'games/' + f))
  .concat(fs.readdirSync(path.join(ROOT, SUB + 'screens')).map(f => SUB + 'screens/' + f));
const bypass = [];
const stripComments = s => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');
gameFiles.forEach(rel => {
  const src = stripComments(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
  if (/State\.addXP\s*\(/.test(src)) bypass.push(rel + ' calls State.addXP directly');
  if (/State\.addCoins\s*\(/.test(src)) bypass.push(rel + ' calls State.addCoins directly');
  if (/SQ\.UI\.award\s*\(|payExtra\s*\(/.test(src)) bypass.push(rel + ' pays outside MS.UI.award');
});
ok(bypass.length === 0, bypass.length + ' modes bypass the reward pipeline', bypass.join('\n        '));
/* No stray MQ anywhere in the subject: the Maths Advanced port is MA, and a leftover MQ would collide. */
const strayMQ = [];
(function walk(dir) {
  fs.readdirSync(path.join(ROOT, dir)).forEach(f => {
    const rel = dir + f, st = fs.statSync(path.join(ROOT, rel));
    if (st.isDirectory()) walk(rel + '/');
    else if (/\.(js|css)$/.test(f) && /\bMQ\b/.test(stripComments(fs.readFileSync(path.join(ROOT, rel), 'utf8')))) strayMQ.push(rel);
  });
})(SUB);
ok(strayMQ.length === 0, 'no MQ reference survives in subjects/mstd', strayMQ.join(', '));

/* ================================================ 12. the reference sheet */
head('12. Reference sheet (SQ.Tools)');
const sheet = MS.SHEET();
const sheetItems = [].concat(...sheet.sections.map(s => s.items));
const sheetIds = new Set();
const sheetBad = [];
sheetItems.forEach(it => {
  if (!it.id || sheetIds.has(it.id)) sheetBad.push((it.id || '?') + ': duplicate or missing id');
  sheetIds.add(it.id);
  if (typeof it.free !== 'boolean') sheetBad.push(it.id + ': free must be true or false');
  if (!it.body || !it.name) sheetBad.push(it.id + ': missing name or body');
});
ok(sheetBad.length === 0, sheetBad.length + ' sheet item problems', sheetBad.join('\n        '));
['sine-rule', 'cos-side', 'area-rule', 'compound', 'declining', 'straight-line', 'z', 'outlier', 'v-sphere', 'sector'].forEach(id => {
  const it = sheetItems.find(x => x.id === id);
  ok(it && it.free === true, 'NESA sheet item "' + id + '" is free');
});
['simple', 'fv-annuity', 'gst', 'iqr', 'gradient'].forEach(id => {
  const it = sheetItems.find(x => x.id === id);
  ok(it && it.free === false, 'off-sheet item "' + id + '" costs (free:false)');
});
console.log('  ' + sheetItems.length + ' sheet items, ' + sheetItems.filter(i => i.free).length + ' free');

/* ============================================ 13. CSS scoping and guards */
head('13. Stylesheet scoping and guards');
const css = fs.readFileSync(path.join(ROOT, SUB + 'css/mstd.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
const unscoped = [];
(function scan(src) {
  let i = 0;
  while (i < src.length) {
    const j = src.indexOf('{', i);
    if (j < 0) break;
    const head = src.slice(i, j).trim();
    let d = 1, k = j + 1;
    while (d && k < src.length) { if (src[k] === '{') d++; else if (src[k] === '}') d--; k++; }
    const body = src.slice(j + 1, k - 1);
    if (/^@media|^@supports/.test(head)) scan(body);
    else if (/^@keyframes/.test(head)) { if (!/^@keyframes mstd-/.test(head)) unscoped.push(head); }
    else head.split(',').forEach(sel => { if (!/^html\[data-subject="mstd"\]/.test(sel.trim())) unscoped.push(sel.trim()); });
    i = k;
  }
})(css);
ok(unscoped.length === 0, 'every rule in mstd.css is scoped under html[data-subject="mstd"]', unscoped.slice(0, 8).join('\n        '));
ok(/\.gshell\s*>\s*\*\s*\{[^}]*min-width:\s*0/.test(css), '.gshell children get min-width:0 (§9.2)');
ok(/\.tblwrap\s*\{[^}]*overflow-x:\s*auto/.test(css), 'wide tables scroll inside their own wrapper (§9.2)');
ok(/prefers-reduced-motion/.test(css), 'the stylesheet respects prefers-reduced-motion');
ok(/-webkit-perspective: 1000px/.test(css) && /-webkit-backface-visibility: hidden/.test(css), 'flashcard flip keeps its -webkit- 3D prefixes (§G3)');
['--bg', '--panel', '--panel2', '--dim', '--accent2'].forEach(t => {
  ok(new RegExp('html\\[data-subject="mstd"\\] \\{[^}]*' + t + ':').test(css), 'NumberCrunch token ' + t + ' is aliased onto the core tokens');
});

/* ==================================================== 14. legacy import */
head('14. Legacy import (numbercrunch.save.v1)');
{
  vm.runInContext(fs.readFileSync(path.join(ROOT, SUB + 'manifest.js'), 'utf8'), ctx, { filename: 'manifest.js' });
  const m = ctx.SQ.Subjects.getManifest('mstd');
  ok(m && typeof m.importLegacy === 'function' && typeof m.boot === 'function', 'manifest registers boot() and importLegacy()');
  const old = { xp: 5000, coins: 321, ascensions: 1, name: 'Fin', avatar: '🧮', theme: 'blueprint', difficulty: 'hard', qtier: 'exam',
    stats: { answered: 40, correct: 30, perfect: 2, xpEarned: 9000 }, topics: { 'MS-F1': { seen: 10, right: 7 } },
    q: { 'f1-001': { s: 3, r: 0, w: 3 } }, cards: { 'c-f1-1': { box: 3, due: '2026-09-01', paid: '2026-08-30' } },
    modes: { rapid: { plays: 4, best: 17 } }, pow: { fifty: 2, buffer: 1, boost: 3, adrenaline: 1 },
    themes: ['ledger', 'blueprint'], avatars: ['🎓', '🧮'], ach: { 'a-first': '2026-08-01' }, bosses: { taxman: '2026-08-02' } };
  const r = m.importLegacy(old);
  const sl = r.slot;
  let lv = 1, left = 5000; while (left >= Math.round(130 * Math.pow(lv, 1.5))) { left -= Math.round(130 * Math.pow(lv, 1.5)); lv++; }
  ok(sl.level === lv && sl.xpIntoLevel === left && sl.prestige === 1 && sl.coins === 321, 'level, XP, Ascensions and Credits carry over (level ' + sl.level + ')');
  ok(sl.modules['MS-F1'].seen === 10 && sl.modules['MS-F1'].correct === 7, 'topics{seen,right} → modules{seen,correct}');
  ok(sl.srs['c-f1-1'].box === 3 && sl.srs['c-f1-1'].xpDay === '2026-08-30', 'cards → srs with the paid-day latch');
  ok(sl.scores.rapid === 17 && sl.modesPlayed.rapid === 4, 'modes → scores + modesPlayed');
  ok(r.inventory.shield === 1 && r.inventory.double === 4 && r.inventory.fifty === 2, 'buffer→shield, boost/adrenaline→double');
  ok(r.themes.join() === 'mstd-ledger,mstd-blueprint' && sl.settings.theme === 'mstd-blueprint', 'themes are prefixed mstd-');
  ok(sl.settings.difficulty === 'hard' && sl.qtier === 'exam', 'difficulty and question tier carry over');
  ok(sl.bossesBeaten.taxman && sl.achievements['a-first'], 'bosses and achievements carry over');
}

/* ------------------------------------------------------------------ done */
console.log('\n' + '─'.repeat(60));
console.log(fails === 0 ? 'PASS — ' + checks + ' checks' + (warns ? ', ' + warns + ' warnings' : '')
                        : 'FAIL — ' + fails + ' of ' + checks + ' checks failed');
process.exit(fails === 0 ? 0 : 1);
