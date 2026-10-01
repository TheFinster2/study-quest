#!/usr/bin/env node
/* tests/prove.js — the habit that matters more than any single test.

   Addendum §A: prove each test fails without its fix. This runs every test
   script once clean (it must PASS) and once per fault-injection mode (it must
   FAIL). A mode that passes is a check that is testing nothing — which is
   exactly how three tests in the chemistry app were found to be inert,
   including one whose assertion only checked that a value was not too SMALL,
   so a bug making it ten times too large sailed straight through.

   Run:  node tests/subjects/bio/prove.js      (QUICK=1 skips the browser suites) */
"use strict";
const { execFileSync } = require("child_process");
const path = require("path");

const SUITES = [
  { file: "validate.js", modes: ["why", "distractors", "partid", "hotspot", "dupopt", "emptybin", "manifest", "lengthbias", "nearDup", "boss"] },
  { file: "genetics.js", modes: ["routeb", "ambiguous", "ratio", "parsenum"] },
  { file: "tools.js",    modes: ["sheetleak", "freesheet", "nolatch"], browser: true },
  { file: "exploit.js",  modes: ["floor", "shortspam", "cardspam", "boostadd", "freepower", "bypass"], browser: true }
].filter((s) => !(process.env.QUICK && s.browser));

let failures = 0;

function run(file, env) {
  try {
    execFileSync(process.execPath, [path.join(__dirname, file)], {
      env: Object.assign({}, process.env, env),
      stdio: "pipe"
    });
    return true;
  } catch (e) {
    return false;
  }
}

SUITES.forEach((s) => {
  process.stdout.write("\n" + s.file + "\n");

  const clean = run(s.file, { BREAK: "" });
  process.stdout.write("  clean run" + " ".repeat(22) + (clean ? "PASS ✓" : "FAIL ✗  <- the suite itself is broken") + "\n");
  if (!clean) failures++;

  s.modes.forEach((m) => {
    const passed = run(s.file, { BREAK: m });
    const ok = !passed;   // with a fault injected, the suite MUST fail
    process.stdout.write("  BREAK=" + m.padEnd(28) + (ok ? "caught ✓" : "NOT CAUGHT ✗  <- this check is inert") + "\n");
    if (!ok) failures++;
  });
});

if (failures) {
  console.log("\nprove: FAIL — " + failures + " check(s) are not doing anything\n");
  process.exit(1);
}
console.log("\nprove: PASS — every check fails when its fault is injected\n");
