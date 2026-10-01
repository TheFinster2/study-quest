#!/usr/bin/env node
/* tests/subjects/econ/prove.js — every check must FAIL when its fault is injected.
   (Ported from Equilibrium's tests/prove.js.) Runs each suite clean (must pass)
   and once per BREAK mode (must fail). Slow — the exploit bot runs seven times —
   so under tests/run.js it only runs when PROVE=1. */
"use strict";
const { execFileSync } = require("child_process");
const path = require("path");

if (process.env.SQ_RUNNER && !process.env.PROVE) {
  console.log("econ prove: skipped under the runner (set PROVE=1, or run it directly)");
  process.exit(0);
}

const SUITES = [
  { file: "validate.js", modes: ["why", "distractors", "partid", "hotspot", "dupopt", "emptybin", "manifest", "lengthbias"] },
  { file: "calc.js", modes: ["routeb", "collide", "shiftrule"] },
  { file: "exploit.js", modes: ["floor", "shortspam", "cardspam", "boostadd", "freepower", "bossrush"] }
];
let failures = 0;
function run(file, env) {
  try { execFileSync(process.execPath, [path.join(__dirname, file)], { env: Object.assign({}, process.env, env), stdio: "pipe" }); return true; }
  catch (e) { return false; }
}
SUITES.forEach((s) => {
  process.stdout.write("\n" + s.file + "\n");
  const clean = run(s.file, { BREAK: "" });
  process.stdout.write("  clean run" + " ".repeat(22) + (clean ? "PASS ✓" : "FAIL ✗  <- the suite itself is broken") + "\n");
  if (!clean) failures++;
  s.modes.forEach((m) => {
    const ok = !run(s.file, { BREAK: m });
    process.stdout.write("  BREAK=" + m.padEnd(24) + (ok ? "caught ✓" : "NOT CAUGHT ✗  <- this check is inert") + "\n");
    if (!ok) failures++;
  });
});
if (failures) { console.log("\necon prove: FAIL — " + failures + " check(s) are not doing anything\n"); process.exit(1); }
console.log("\necon prove: PASS — every check fails when its fault is injected\n");
