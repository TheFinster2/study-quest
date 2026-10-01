/* Loads Biology's content into Node for the no-browser tests (validate, genetics).
   Ported from Biosphere's tests/harness.js: same discovery rule, same reporter.
   Files are read from subjects/bio/manifest.js, so the manifest IS the list. */
"use strict";
const fs = require("fs");
const path = require("path");
const { load, ROOT } = require("../../lib/vm.js");

const BIO_ROOT = path.join(ROOT, "subjects", "bio");

function manifestScripts() {
  const src = fs.readFileSync(path.join(BIO_ROOT, "manifest.js"), "utf8");
  const out = [];
  const re = /"(subjects\/bio\/[^"]+\.js)"/g;
  let m;
  while ((m = re.exec(src))) out.push(m[1]);
  return out;
}

/* util, genetics, mark and every data file. UI/State modules need the shell. */
function loadData(opts) {
  const o = opts || {};
  let data = manifestScripts().filter((s) => s.indexOf("subjects/bio/data/") === 0);
  if (o.drop) data = data.filter((s) => s !== o.drop);
  const files = ["subjects/bio/core/util.js"].concat(data, ["subjects/bio/core/genetics.js", "subjects/bio/core/mark.js"]);
  const sb = load(files);
  return { BIO: sb.BIO, scripts: files, sandbox: sb };
}

function discover(BIO, re) {
  const out = [];
  Object.keys(BIO.DATA).sort().forEach((key) => {
    if (!re.test(key)) return;
    const v = BIO.DATA[key];
    if (!Array.isArray(v)) return;
    v.forEach((item, i) => {
      item._src = key;
      if (!item.id) item.id = key + "-" + i;
      out.push(item);
    });
  });
  return out;
}

const PATTERNS = {
  mcq: /^mcq_/, card: /^cards_/, short: /^short_/, sequence: /^seq_/,
  sort: /^sort_/, dataset: /^data_/, gentpl: /^gen_/
};

function reporter(name) {
  const fails = [], warns = [];
  let checks = 0;
  return {
    check(cond, msg) { checks++; if (!cond) fails.push(msg); return !!cond; },
    warn(cond, msg) { if (!cond) warns.push(msg); },
    fail(msg) { checks++; fails.push(msg); },
    done() {
      if (warns.length) {
        console.log("\n  " + warns.length + " warning" + (warns.length === 1 ? "" : "s") + ":");
        warns.slice(0, 25).forEach((w) => console.log("    ~ " + w));
        if (warns.length > 25) console.log("    … " + (warns.length - 25) + " more");
      }
      if (fails.length) {
        console.log("\n  " + fails.length + " FAILURE" + (fails.length === 1 ? "" : "S") + ":");
        fails.slice(0, 60).forEach((f) => console.log("    ✗ " + f));
        if (fails.length > 60) console.log("    … " + (fails.length - 60) + " more");
        console.log("\n" + name + ": FAIL  (" + checks + " checks)\n");
        process.exit(1);
      }
      console.log("\n" + name + ": PASS  (" + checks + " checks)\n");
    },
    get failures() { return fails; }
  };
}

module.exports = { ROOT, BIO_ROOT, loadData, discover, PATTERNS, manifestScripts, reporter };
