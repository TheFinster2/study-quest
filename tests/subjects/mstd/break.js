/* ============================================================================
   break.js — prove every Maths Standard guard fails its test without it
   (ported from NumberCrunch tests/break.js).

   Copies the app to a temp directory, deletes ONE guard with a regex, runs the
   test that should catch it, and asserts the test FAILS. Two safety rails:
     · the regex must match (else "it failed" may mean the patch did nothing)
     · the patched file must still parse (else a syntax error looks like coverage)

   Dropped from the stand-alone harness because the guard is no longer subject
   code: [hidden]{display:none} (core.css), the controllerchange guard/latch and
   the stale-precache fingerprint (app.js/sw.js), the arcade-pays check (the
   arcade is shared), the palette-cache perf check (perf.js not ported), the
   motion CSS (core.css), and the core-owned accuracy/sample-size gates (they
   live in SQ.UI.award now; the subject-side "no count → no bonus" default is
   still covered below).

   Run: node tests/subjects/mstd/break.js   (slow: one browser suite per mutation)
   ========================================================================== */
'use strict';
const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawnSync } = require('child_process');

const ROOT = path.join(__dirname, '..', '..', '..');
const SUB = 'subjects/mstd/';
const TESTS = 'tests/subjects/mstd/';
let fails = 0, checks = 0;
function ok(cond, msg, detail) {
  checks++;
  if (cond) console.log('  ok    ' + msg);
  else { fails++; console.log('  FAIL  ' + msg + (detail ? '\n        ' + detail : '')); }
}

function copyTree(src, dst) {
  fs.mkdirSync(dst, { recursive: true });
  for (const name of fs.readdirSync(src)) {
    if (name === '.git' || name === 'node_modules') continue;
    const s = path.join(src, name), d = path.join(dst, name);
    if (fs.statSync(s).isDirectory()) copyTree(s, d); else fs.copyFileSync(s, d);
  }
}

const MUTATIONS = [
  { id: 'no-count-default', what: 'a caller that omits `answered` is treated as a short run',
    file: SUB + 'core/ui.js', find: /var answered = o\.answered == null \? 0 : o\.answered;/,
    replace: 'var answered = o.answered;', test: 'exploit.js' },
  { id: 'low-accuracy-coins', what: 'coins at 35% below 50% accuracy',
    file: SUB + 'core/ui.js', find: /if \(coins && acc < UI\.MIN_BONUS_ACCURACY\) coins = coins \* 0\.35;/,
    replace: '', test: 'exploit.js' },
  { id: 'read-time-gate', what: 'the read floor, so instant answers pay (§9.5.3)',
    file: SUB + 'core/ui.js', find: /if \(ms != null && ms < floor\) \{ p\.fast\+\+; return 0; \}/,
    replace: 'if (false) { p.fast++; return 0; }', test: 'exploit.js' },
  { id: 'wrong-answer-penalty', what: 'the XP penalty for wrong answers (§9.5.2)',
    file: SUB + 'core/ui.js', find: /p\.xp = Math\.max\(0, p\.xp - Math\.round\(6 \* weight\(diff\)\)\);/,
    replace: 'p.xp = p.xp;', test: 'exploit.js' },
  { id: 'diff0-weight', what: 'diff-0 questions paying ×0.6',
    file: SUB + 'core/ui.js', find: /function weight\(diff\) \{ return diff \? diff : 0\.6; \}/,
    replace: 'function weight(diff) { return diff ? diff : 1; }', test: 'exploit.js' },
  { id: 'panic-net-scoring', what: 'net scoring on the Conversion Panic grid (§9.6)',
    file: SUB + 'games/panic.js', find: /for \(var i = 0; i < net; i\+\+\) pool\.right\(1, 9999, 0\);/,
    replace: 'for (var i = 0; i < right; i++) pool.right(1, 9999, 0);', test: 'exploit.js' },
  { id: 'card-read-floor', what: 'flashcards pay only if they stayed on screen long enough to read (§9.8)',
    file: SUB + 'screens/study.js', find: /if \(right && eligible && ms >= minMs\) \{/,
    replace: 'if (right && eligible) {', test: 'exploit.js' },
  { id: 'tier-filter', what: 'the Warm-up tier cap in Bank.filter',
    file: SUB + 'core/bank.js', find: /if \(t\.diffMax < 3\) out = out\.filter\(function \(q\) \{ return q\.diff <= t\.diffMax; \}\);/,
    replace: '', test: 'smoke.js' },
  { id: 'coverage-filter', what: 'hidden topics dropping out of mixed draws',
    file: SUB + 'core/bank.js', find: /if \(keep\.length\) out = keep;/,
    replace: '', test: 'smoke.js' },
  { id: 'object-object', what: 'the attrs-vs-children order in a Panic option (a "[object Object]" label)',
    file: SUB + 'games/panic.js',
    find: /html: U\.mathHtml\(opt\),\n        style: \{ minHeight: '48px' \},\n        onclick: function \(\) \{ answer\(opt\); \}\n      \}\)\);/,
    replace: "style: { minHeight: '48px' },\n        onclick: function () { answer(opt); }\n      }, { html: U.mathHtml(opt) }));",
    test: 'smoke.js' },
  { id: 'results-review', what: 'the "Review the working" button (§H1)',
    file: SUB + 'core/ui.js', find: /if \(working\) buttons\.push\(\{ label: '📖 Review the working', onclick: review \}\);/,
    replace: '', test: 'smoke.js' },
  { id: 'rank-reconcile', what: 'the win-vs-rank reconcile line (§H4)',
    file: SUB + 'core/ui.js', find: /if \(spec\.outcome === 'win' && acc < 0\.7\) \{/,
    replace: 'if (false) {', test: 'smoke.js' },
  { id: 'webkit-flip', what: 'the -webkit- 3D prefixes on the card flip (§G3)',
    file: SUB + 'css/mstd.css', find: /-webkit-perspective: 1000px; /,
    replace: '', test: 'validate.js' },
  { id: 'answer-index', what: 'a question whose stored key is not choices[0]',
    file: SUB + 'data/q-f1.js',
    find: /choices: \['\$1,041\.20', '\$1,141\.20', '\$1,038\.60', '\$1,096\.00'\], a: 0,/,
    replace: "choices: ['$1,141.20', '$1,041.20', '$1,038.60', '$1,096.00'], a: 0,", test: 'validate.js' },
  { id: 'global-leak', what: 'the removed window.U alias (a global U would collide across subjects)',
    file: SUB + 'core/util.js', find: /  window\.MS\.U = U;/,
    replace: '  window.MS.U = U;\n  window.U = U;', test: 'validate.js' }
];

const only = process.argv[2];
for (const m of MUTATIONS) {
  if (only && m.id !== only) continue;
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'mstd-break-'));
  copyTree(ROOT, tmp);
  const file = path.join(tmp, m.file);
  const src = fs.readFileSync(file, 'utf8');
  const matched = m.find.test(src);
  ok(matched, m.id + ': the mutation regex matches ' + m.file);
  if (!matched) { fs.rmSync(tmp, { recursive: true, force: true }); continue; }
  const patched = src.replace(m.find, m.replace);
  fs.writeFileSync(file, patched);
  if (/\.js$/.test(m.file)) {
    let parses = true;
    try { new Function(patched); } catch (e) { parses = false; }
    ok(parses, m.id + ': the patched file still parses');
  }
  const r = spawnSync(process.execPath, [path.join(tmp, TESTS, m.test)], { cwd: tmp, encoding: 'utf8', timeout: 600000 });
  ok(r.status !== 0, m.id + ': removing ' + m.what + ' makes ' + m.test + ' fail',
     r.status === 0 ? 'the test still PASSED with the guard removed' : '');
  fs.rmSync(tmp, { recursive: true, force: true });
}

console.log('\n' + '─'.repeat(60));
console.log(fails === 0 ? 'PASS — ' + checks + ' checks' : 'FAIL — ' + fails + ' of ' + checks + ' checks failed');
process.exit(fails === 0 ? 0 : 1);
