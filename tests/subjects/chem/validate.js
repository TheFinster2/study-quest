#!/usr/bin/env node
/* Chemistry content validator — written fresh for the port (MoleQuest's README
   described one that was never committed). Plain node, data loaded in a vm sandbox.

     ids unique; every answer index inside its options; options distinct
     answer-length bias: the key strictly longest in ≤ 32 % overall, ≤ 36 % per module
     near-duplicate stems within a topic (identical, or bigram Jaccard > 0.75)
     every stored equation balances in lowest terms
     every pathway puzzle's route resolves in its declared step count; no two edges
       leave one compound by the same reagent; every edge names real nodes/reagents
     every flashcard has an id, front and back
     coverage packs name real topics/cards/families; no achievement unlocks on a fresh save
     counts match the ported totals (1,091 MCQs, 263 cards, 44 puzzles, 66 achievements)

   node tests/subjects/chem/validate.js */
"use strict";
const fs = require("fs");
const path = require("path");
const { load, ROOT } = require("../../lib/vm");

const DATA_DIR = "subjects/chem/data";
const files = fs.readdirSync(path.join(ROOT, DATA_DIR)).filter(f => f.endsWith(".js")).map(f => DATA_DIR + "/" + f);
const ctx = load(["subjects/chem/core/util.js"].concat(files, ["subjects/chem/games/balance.js"]));
const D = ctx.CHEM.DATA;

let pass = 0, fail = 0;
function ok(c, msg) { if (c) pass++; else { fail++; console.log("  ✗ " + msg); } }

/* ── questions ─────────────────────────────────────────────── */
const Q = Object.keys(D).filter(k => /^q[A-Z0-9]/.test(k) && Array.isArray(D[k]) && D[k].length && D[k][0].choices)
  .sort().reduce((a, k) => a.concat(D[k]), []);
ok(Q.length === 1091, `1,091 MCQs (found ${Q.length})`);
const ids = new Set();
const MODS = ["M1", "M2", "M3", "M4", "M5", "M6", "M7", "M8"];
Q.forEach(q => {
  ok(!ids.has(q.id), "duplicate question id " + q.id); ids.add(q.id);
  ok(MODS.includes(q.mod), q.id + ": module " + q.mod);
  ok(typeof q.topic === "string" && q.topic, q.id + ": topic");
  ok(Array.isArray(q.choices) && q.choices.length >= 3, q.id + ": at least 3 options");
  ok(Number.isInteger(q.a) && q.a >= 0 && q.a < q.choices.length, q.id + ": answer index inside options");
  ok(new Set(q.choices.map(c => String(c).trim().toLowerCase())).size === q.choices.length, q.id + ": options distinct");
  ok(q.why && q.q, q.id + ": stem and explanation");
  ok([1, 2, 3].includes(q.diff), q.id + ": diff 1–3");
});

/* answer-length bias */
const longest = q => { const L = q.choices.map(c => String(c).length); const k = L[q.a]; return L.every((l, i) => i === q.a || l < k); };
const overall = Q.filter(longest).length / Q.length;
ok(overall <= 0.32, `length bias overall ${(overall * 100).toFixed(1)}% ≤ 32%`);
const perMod = {};
MODS.forEach(m => {
  const qs = Q.filter(q => q.mod === m);
  const r = qs.filter(longest).length / Math.max(1, qs.length);
  perMod[m] = (r * 100).toFixed(1) + "%";
  ok(r <= 0.36, `length bias ${m} ${(r * 100).toFixed(1)}% ≤ 36%`);
});

/* near-duplicates: bigrams, because "ΔH < 0 and ΔS > 0" vs "ΔH > 0 and ΔS < 0" share
   every word and are opposite questions */
function bigrams(s) {
  const w = String(s).toLowerCase().replace(/[^\p{L}\p{N}<>=+−-]+/gu, " ").trim().split(/\s+/);
  const out = new Set();
  for (let i = 0; i < w.length - 1; i++) out.add(w[i] + " " + w[i + 1]);
  return out;
}
const byTopic = {};
Q.forEach(q => (byTopic[q.mod + "|" + q.topic] = byTopic[q.mod + "|" + q.topic] || []).push(q));
let dups = 0;
Object.values(byTopic).forEach(list => {
  const bg = list.map(q => bigrams(q.q));
  for (let i = 0; i < list.length; i++) for (let j = i + 1; j < list.length; j++) {
    const a = bg[i], b = bg[j];
    const inter = [...a].filter(x => b.has(x)).length;
    const jac = inter / Math.max(1, a.size + b.size - inter);
    const same = list[i].q.trim().toLowerCase() === list[j].q.trim().toLowerCase();
    if (same || jac > 0.75) { dups++; ok(false, `near-duplicate stems ${list[i].id} / ${list[j].id} (J=${jac.toFixed(2)})`); }
  }
});
ok(dups === 0, "no near-duplicate stems");

/* ── equations ─────────────────────────────────────────────── */
const Bal = ctx.CHEM.Games.balance;
const gcd = (a, b) => (b ? gcd(b, a % b) : a);
ok(D.equations.length >= 36, "36+ equations");
D.equations.forEach((e, i) => {
  const n = e.lhs.length;
  ok(e.ans.length === n + e.rhs.length, `equation ${i}: one coefficient per term`);
  const L = Bal.tally(e.lhs, e.ans.slice(0, n)), R = Bal.tally(e.rhs, e.ans.slice(n));
  const els = new Set(Object.keys(L).concat(Object.keys(R)));
  ok([...els].every(k => L[k] === R[k]), `equation ${i} (${e.lhs.join("+")}→${e.rhs.join("+")}) balances`);
  ok(e.ans.reduce(gcd) === 1, `equation ${i}: lowest terms`);
});

/* ── pathway graph ─────────────────────────────────────────── */
const N = D.pathwayNodes, E = D.pathwayEdges, R = D.reagents, P = D.pathwayPuzzles;
ok(P.length === 44, `44 pathway puzzles (found ${P.length})`);
const rids = new Set(R.map(r => r.id));
const seenFV = new Set();
E.forEach(e => {
  ok(N[e.from] && N[e.to], `edge ${e.from}→${e.to}: nodes exist`);
  ok(rids.has(e.via), `edge ${e.from}→${e.to}: reagent ${e.via} exists`);
  const k = e.from + "|" + e.via;
  ok(!seenFV.has(k), `two edges leave ${e.from} via ${e.via}`); seenFV.add(k);
});
function bfs(from, to) {
  const seen = new Set([from]); let f = [from], d = 0;
  while (f.length) { if (f.includes(to)) return d; const nx = [];
    f.forEach(n => E.forEach(e => { if (e.from === n && !seen.has(e.to)) { seen.add(e.to); nx.push(e.to); } }));
    f = nx; d++; }
  return Infinity;
}
P.forEach(p => {
  ok(N[p.start] && N[p.target], `puzzle ${p.start}→${p.target}: nodes exist`);
  const d = bfs(p.start, p.target);
  ok(d === p.steps, `puzzle ${p.start}→${p.target}: resolves in ${p.steps} (BFS ${d})`);
});
const starts = new Set(P.map(p => p.start)), produced = new Set(E.map(e => e.to));
Object.keys(N).forEach(n => ok(starts.has(n) || produced.has(n) || E.some(e => e.from === n),
  `node ${n} is reachable or a start`));

/* ── flashcards ────────────────────────────────────────────── */
const C = Object.keys(D).filter(k => /^flashcards/.test(k) && Array.isArray(D[k]) && D[k].length && D[k][0].front)
  .sort().reduce((a, k) => a.concat(D[k]), []);
ok(C.length === 263, `263 flashcards (found ${C.length})`);
const cids = new Set();
C.forEach(c => {
  ok(c.id && !cids.has(c.id), "flashcard id unique " + c.id); cids.add(c.id);
  ok(typeof c.front === "string" && c.front.trim(), c.id + ": front");
  ok(typeof c.back === "string" && c.back.trim(), c.id + ": back");
  ok(MODS.includes(c.mod), c.id + ": module");
});

/* ── naming ─────────────────────────────────────────────────── */
D.naming.forEach(n => {
  ok(n.distractors.length >= 3 && !n.distractors.includes(n.name), `naming ${n.name}: 3 distractors, none the answer`);
});

/* ── coverage ──────────────────────────────────────────────── */
ok(D.coverage.length === 11, `11 coverage switches (found ${D.coverage.length})`);
const topics = new Set(Q.map(q => q.topic)), families = new Set(D.naming.map(n => n.family));
const tags = new Set(D.coverage.map(p => p.id));
D.coverage.forEach(p => {
  (p.topics || []).forEach(t => ok(topics.has(t), `coverage ${p.id}: topic "${t}" exists`));
  (p.cards || []).forEach(c => ok(cids.has(c), `coverage ${p.id}: card ${c} exists`));
  (p.naming || []).forEach(f => ok(families.has(f), `coverage ${p.id}: family ${f} exists`));
});
Object.values(N).concat(R).forEach(x => { if (x.tag) ok(tags.has(x.tag), `pathway tag ${x.tag} is a coverage pack`); });

/* ── achievements ──────────────────────────────────────────── */
ok(D.achievements.length === 66, `66 achievements (65 ported + Concordant) (found ${D.achievements.length})`);
const fresh = { answered: 0, correct: 0, bestStreak: 0, level: 1, longestDayStreak: 0, modules: {}, modesPlayed: {},
  themesOwned: 1, avatarsOwned: 2, pathwaysSolvedUnique: 0, bossesBeaten: 0, cardsMastered: 0, prestige: 0,
  questsDone: 0, masteryOf: () => 0, peakCoins: 100 };
const aids = new Set();
D.achievements.forEach(a => {
  ok(!aids.has(a.id), "achievement id unique " + a.id); aids.add(a.id);
  let v = false; try { v = !!a.check(fresh); } catch (e) { v = false; }
  ok(!v, `achievement ${a.id} does not unlock on a fresh save`);
});

/* ── theme + shop data ─────────────────────────────────────── */
ok(D.shop.themes.length === 10 && D.shop.avatars.length === 22, "10 themes, 22 avatars");
const themesCss = fs.readFileSync(path.join(ROOT, "subjects/chem/css/themes.css"), "utf8");
D.shop.themes.forEach(t => ok(themesCss.includes(`[data-theme="chem-${t.id}"]`), `theme chem-${t.id} defined`));

/* ── legacy import ─────────────────────────────────────────── */
const mctx = load(["subjects/chem/manifest.js"], { SQ: { Subjects: { manifest(id, m) { this.m = m; } } } });
const M = mctx.SQ.Subjects.m;
ok(M && typeof M.boot === "function" && typeof M.importLegacy === "function", "manifest registers boot + importLegacy");
const imp = M.importLegacy({ xp: 5000, level: 7, xpIntoLevel: 40, coins: 900, prestige: 0,
  profile: { name: "Ada", avatar: "🧪", theme: "noble" }, stats: { answered: 50, equationsBalanced: 4 },
  srs: { "f5-01": { box: 3, due: "2026-01-01", reps: 2, lapses: 0 } }, mistakes: [{ id: "m5-01", mod: "M5", misses: 1 }],
  inventory: { fifty: 2, catalyst: 1, adrenaline: 1, double: 1 }, owned: { themes: ["lab", "noble"], avatars: ["🧪"] },
  settings: { difficulty: "hard", hidden: { buffers: true } } });
ok(imp.slot.level === 7 && imp.slot.coins === 900 && imp.slot.stats.equationsBalanced === 4, "legacy: level, coins, stats kept");
ok(imp.slot.srs["f5-01"].box === 3 && imp.slot.mistakes.length === 1, "legacy: srs and mistakes kept");
ok(imp.slot.settings.difficulty === "hard" && imp.slot.settings.hidden.buffers && imp.slot.settings.theme === "chem-noble", "legacy: settings mapped");
ok(imp.inventory.double === 2 && imp.inventory.revive === 1 && !("catalyst" in imp.inventory), "legacy: power-ups renamed to the shared set");
ok(imp.themes.join() === "chem-lab,chem-noble", "legacy: theme ids prefixed");

console.log(`  length bias: overall ${(overall * 100).toFixed(1)}%, ` + Object.entries(perMod).map(([k, v]) => k + " " + v).join(", "));
console.log(`chem validate: ${pass} passed, ${fail} failed`);
if (fail) process.exitCode = 1;
