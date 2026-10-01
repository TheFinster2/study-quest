#!/usr/bin/env node
/* tests/subjects/econ/legacy.js — manifest.importLegacy maps an Equilibrium save. */
"use strict";
const H = require("./_harness.js");
const r = H.reporter("econ legacy");
const m = H.manifest();
const old = {
  v: 1, xp: 5000, coins: 1234, theme: "ochre", difficulty: "hard", runs: 40, answered: 300, correct: 210,
  seen: { "p1-001": { n: 2, wrong: 1, last: 1 } }, missed: { "p3-004": { n: 2, last: 1 } },
  cards: { "c-1": { box: 4, due: Date.now(), n: 6, lapses: 1, last: Date.now() } },
  shortLog: { "s1": "2026-01-01" }, bests: { calcSolved: 30, shiftsSolved: 12, survival: 9 },
  achievements: { "first-run": 1 }, coverage: { prelim: true },
  owned: { themes: ["ledger", "ochre"], avatars: ["📊", "🏦"] }, avatar: "🏦",
  inventory: { fifty: 2, multiplier: 1, buffer: 3, revive: 1 },
  bosses: { P1: { cleared: true }, P2: { cleared: true }, H1: { cleared: true } }
};
const res = m.importLegacy({ app: "equilibrium", save: old });
const s = res.slot;
r.check(s.level === 7, "5000 XP should be level 7 on 115·n^1.5, got " + s.level);
r.check(s.lifetimeXp === 5000 && s.coins === 1234, "xp/coins not carried");
r.check(s.srs["c-1"].box === 5 && /^\d{4}-\d\d-\d\d$/.test(s.srs["c-1"].due), "card box/due not mapped");
r.check(s.mistakes.length === 1 && s.mistakes[0].mod === "P3" && s.mistakes[0].n === 2, "missed → mistakes not mapped");
r.check(s.stats.calcSolved === 30 && s.scores.survival === 9 && s.stats.runs === 40, "bests/runs not mapped");
r.check(s.settings.theme === "econ-ochre" && s.settings.difficulty === "hard" && s.settings.hidden.prelim, "settings not mapped");
r.check(res.themes.join() === "econ-ledger,econ-ochre", "themes not prefixed: " + res.themes.join());
r.check(res.inventory.double === 1 && res.inventory.shield === 3 && res.inventory.fifty === 2, "power-ups not renamed: " + JSON.stringify(res.inventory));
r.check(s.bossesBeaten.hand && !s.bossesBeaten.current, "boss clears not mapped to topic groups");
r.check(res.profile.avatar === "🏦", "avatar not carried");
r.check(m.importLegacy(null) === null, "a non-save should import nothing");
r.done();
