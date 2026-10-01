/* Node-side helpers for the Economics suites (ported from Equilibrium's
   tests/harness.js). Loads the subject's content in a vm sandbox — util,
   calc engine, marker and every data file the manifest lists. */
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const { load, ROOT } = require("../../lib/vm.js");

const SUB = "subjects/econ/";

/** The manifest's script and css lists, read by evaluating it with a stub SQ. */
function manifest() {
  let got = null;
  const sb = { SQ: { Subjects: { manifest(id, m) { got = m; } } } };
  sb.window = sb;
  vm.createContext(sb);
  vm.runInContext(fs.readFileSync(path.join(ROOT, SUB, "manifest.js"), "utf8"), sb);
  return got;
}

function loadData() {
  const m = manifest();
  const data = m.scripts.filter((s) => s.startsWith(SUB + "data/"));
  const files = [SUB + "core/util.js"].concat(data, [SUB + "core/econcalc.js", SUB + "core/mark.js"]);
  const ctx = load(files, { SQ: {} });
  return { ECON: ctx.ECON, scripts: m.scripts, manifest: m, sandbox: ctx };
}

function discover(ECON, re) {
  const out = [];
  Object.keys(ECON.DATA).sort().forEach((key) => {
    if (!re.test(key)) return;
    const v = ECON.DATA[key];
    if (!Array.isArray(v)) return;
    v.forEach((item, i) => { item._src = key; if (!item.id) item.id = key + "-" + i; out.push(item); });
  });
  return out;
}

const PATTERNS = { mcq: /^mcq_/, card: /^cards_/, short: /^short_/, sequence: /^seq_/, sort: /^sort_/,
                   dataset: /^data_/, calc: /^calc_/, shift: /^shift_/ };

function reporter(name) {
  const fails = [], warns = [];
  let checks = 0;
  return {
    check(cond, msg) { checks++; if (!cond) fails.push(msg); return !!cond; },
    warn(cond, msg) { if (!cond) warns.push(msg); },
    fail(msg) { checks++; fails.push(msg); },
    done() {
      if (warns.length) {
        console.log("\n  " + warns.length + " warning(s):");
        warns.slice(0, 25).forEach((w) => console.log("    ~ " + w));
      }
      if (fails.length) {
        console.log("\n  " + fails.length + " FAILURE(S):");
        fails.slice(0, 60).forEach((f) => console.log("    ✗ " + f));
        console.log("\n" + name + ": FAIL  (" + checks + " checks)\n");
        process.exit(1);
      }
      console.log("\n" + name + ": PASS  (" + checks + " checks)\n");
    }
  };
}

module.exports = { ROOT, SUB, manifest, loadData, discover, PATTERNS, reporter };
