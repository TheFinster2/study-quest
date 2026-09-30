/* App-level static checks — no browser.
   node tests/app/validate.js */
const fs = require("fs");
const path = require("path");
const { load, ROOT } = require("../lib/vm");
const { build } = require("../../tools/precache");

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log("  ✗ " + m); } };
const read = f => fs.readFileSync(path.join(ROOT, f), "utf8");
const exists = f => fs.existsSync(path.join(ROOT, f));

/* ── the service worker is generated from the tree ──────────── */
const sw = read("sw.js");
ok(sw === build().out, "sw.js is stale — run: node tools/precache.js");
const appVer = (read("js/app.js").match(/SQ\.VERSION = "([^"]+)"/) || [])[1];
const swVer = (sw.match(/const VERSION = "([^"]+)"/) || [])[1];
ok(appVer && appVer === swVer, `SQ.VERSION (${appVer}) matches sw.js VERSION (${swVer})`);
ok(!/subjects\/eng\/(models|vendor)\//.test((sw.match(/const PRECACHE = \[[\s\S]*?\];/) || [""])[0]), "English's model files are not precached");
ok(/closereading-model-v1/.test(sw), "the sweep keeps English's model cache");

/* ── everything index.html loads exists ────────────────────── */
const html = read("index.html");
const refs = [...html.matchAll(/(?:src|href)="([^"#:]+)"/g)].map(m => m[1]).filter(r => !/^https?:/.test(r));
refs.forEach(r => ok(exists(r), "index.html references a missing file: " + r));

/* ── subjects: registry ↔ folders ↔ manifests ─────────────── */
const ctx = load(["js/sq/util.js", "js/sq/economy.js", "js/sq/subjects.js"]);
const ids = ctx.SQ.Subjects.ids();
ok(ids.length === 7, "seven subjects registered");
for (const id of ids) {
  const dir = "subjects/" + id;
  if (!exists(dir + "/manifest.js")) { console.log("  · " + id + ": not ported yet (no manifest.js)"); continue; }
  const mctx = load(["js/sq/util.js", "js/sq/economy.js", "js/sq/subjects.js", dir + "/manifest.js"]);
  const m = mctx.SQ.Subjects.getManifest(id);
  ok(!!m, id + ": manifest.js registers a manifest");
  if (!m) continue;
  (m.scripts || []).forEach(s => ok(exists(s), `${id}: manifest script missing: ${s}`));
  (m.css || []).forEach(s => ok(exists(s), `${id}: manifest css missing: ${s}`));
  ok(typeof m.boot === "function", id + ": manifest has boot()");
  ok(typeof m.importLegacy === "function", id + ": manifest has importLegacy()");
  const dupes = (m.scripts || []).filter((s, i, a) => a.indexOf(s) !== i);
  ok(!dupes.length, `${id}: manifest lists a script twice: ${dupes.join(", ")}`);

  /* themes.css loads at boot for every subject, so it may contain ONLY theme blocks. */
  const tf = dir + "/css/themes.css";
  ok(exists(tf), id + ": css/themes.css exists (index.html loads it)");
  if (exists(tf)) {
    const sel = stripCss(read(tf)).match(/[^{}]+(?=\{)/g) || [];
    const bad = sel.map(s => s.trim()).filter(s => s && !s.split(",").every(x => /^(html|:root)?\[data-theme="[a-z]+-[a-z0-9-]+"\]/.test(x.trim())));
    ok(!bad.length, `${id}: themes.css has non-theme rules: ${bad.slice(0, 3).join(" | ")}`);
    const tids = [...read(tf).matchAll(/\[data-theme="([^"]+)"\]/g)].map(x => x[1]);
    ok(tids.every(t => t.startsWith(id + "-")), `${id}: theme ids are prefixed ${id}-`);
  }

  /* Every other subject stylesheet rule is scoped, or it leaks into six other subjects. */
  (m.css || []).filter(f => !/themes\.css$/.test(f)).forEach(f => {
    const leaks = unscoped(read(f), id);
    ok(!leaks.length, `${id}: ${f} has unscoped rules: ${leaks.slice(0, 3).join(" | ")}`);
  });

  /* The two maths apps were both MQ — a stray one collides. */
  if (id === "mstd" || id === "madv") {
    const hits = walkJs(dir).filter(f => /\bMQ\s*[.=]|window\.MQ\b/.test(read(f)));
    ok(!hits.length, `${id}: still references MQ in ${hits.slice(0, 3).join(", ")}`);
  }
}

/* ── the shell never leaks a bare global U (Maths Standard used to) ── */
ok(!/window\.U\s*=/.test(walkJs("js").map(read).join("\n")), "the shell does not define window.U");

/* ── economy sanity ─────────────────────────────────────────── */
const E = ctx.SQ.Economy;
let tot = 0, prev = 0, mono = true;
for (let n = 1; n < E.OVERALL_MAX_LEVEL; n++) { const x = E.overallXpNeeded(n); if (x <= prev) mono = false; prev = x; tot += x; }
ok(mono, "overall level curve is increasing");
ok(tot > 3e6 && tot < 6e6, `overall level 100 costs ${Math.round(tot)} XP (3–6M expected)`);
ok(E.TICKETS.every((t, i, a) => i === 0 || t.price > a[i - 1].price), "ticket prices increase");
ok(E.POWERUPS.every(p => p.price > 0 && p.id), "every power-up has an id and a price");

/* ── app achievements: none unlock on a fresh save ──────────── */
const actx = load(["js/sq/util.js", "js/sq/economy.js", "js/sq/subjects.js", "js/sq/store.js", "js/sq/overall.js", "js/hub/data-achievements.js"]);
actx.SQ.Store.load();
const got = actx.SQ.Overall.checkAchievements();
ok(got.length === 0, "no app achievement unlocks on a fresh save: " + got.map(a => a.id).join(", "));
const aids = actx.SQ.DATA.achievements.map(a => a.id);
ok(new Set(aids).size === aids.length, "app achievement ids are unique");

/* ── nothing in the shared arcade can pay ───────────────────── */
walkJs("js/arcade").forEach(f => {
  const src = read(f).replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
  ok(!/\b(award|payExtra|addXP|addStars|addCoins|claimDaily|claimQuest)\s*\(/.test(src), `${f} must not call a reward function`);
});

console.log(`app/validate: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

/* ── helpers ────────────────────────────────────────────────── */
function walkJs(dir) {
  const out = [];
  (function w(d) {
    if (!exists(d)) return;
    for (const n of fs.readdirSync(path.join(ROOT, d))) {
      const p = d + "/" + n;
      if (fs.statSync(path.join(ROOT, p)).isDirectory()) { if (!/^(vendor|models)$/.test(n)) w(p); }
      else if (n.endsWith(".js")) out.push(p);
    }
  })(dir);
  return out;
}
function stripCss(css) { return css.replace(/\/\*[\s\S]*?\*\//g, ""); }
/** Selectors of style rules that are not under html[data-subject="id"]. Descends into
    @media/@supports; skips @keyframes/@font-face bodies. */
function unscoped(css, id) {
  const src = stripCss(css);
  const out = [];
  let i = 0;
  const scope = new RegExp('^(:where\\()?(html|:root)\\[data-subject="' + id + '"\\]');
  function block(end) {
    while (i < src.length) {
      const open = src.indexOf("{", i), close = src.indexOf("}", i);
      if (close !== -1 && (open === -1 || close < open)) { i = close + 1; return; }
      if (open === -1) { i = src.length; return; }
      const head = src.slice(i, open).trim();
      i = open + 1;
      if (/^@(media|supports|container|layer)/.test(head)) { block(); continue; }
      if (/^@(-webkit-)?keyframes|^@font-face|^@page|^@property/.test(head)) { skip(); continue; }
      head.split(",").map(s => s.trim()).filter(Boolean).forEach(s => { if (!scope.test(s)) out.push(s); });
      skip();
    }
  }
  function skip() { let depth = 1; while (i < src.length && depth) { const c = src[i++]; if (c === "{") depth++; else if (c === "}") depth--; } }
  block();
  return out;
}
