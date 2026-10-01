#!/usr/bin/env node
/* One-off authoring tool, not shipped.

   validate.js caught the answer-length bias the brief warns about in §6.3:
   across every module the correct answer was the longest option far more often
   than chance, so a student could score well by picking the longest option
   without knowing any biology. That is precisely the thing the app promises
   not to allow.

   The fix is editorial, not mechanical: each entry below rewrites ONE
   distractor into a fuller, still-wrong statement so that option length stops
   carrying any signal. Nothing about the correct answer changes.

   Usage:  node tests/subjects/bio/fix-length-bias.js [--dry] */
"use strict";
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "../../../subjects/bio");
const DRY = process.argv.indexOf("--dry") >= 0;

/* [questionId, oldOptionText, newOptionText] */
const PATCHES = require("./length-bias-patches.js");

const files = fs.readdirSync(path.join(ROOT, "data")).filter((f) => /^mcq-m\d\.js$/.test(f));
const contents = {};
files.forEach((f) => { contents[f] = fs.readFileSync(path.join(ROOT, "data", f), "utf8"); });

let applied = 0, missed = [];

PATCHES.forEach(([id, oldText, newText]) => {
  let done = false;
  for (const f of files) {
    const src = contents[f];
    const start = src.indexOf('id:"' + id + '"');
    if (start < 0) continue;
    // bound the edit to this question's object literal
    const end = src.indexOf('\n\n', start);
    const block = src.slice(start, end < 0 ? src.length : end);
    const needle = '"' + oldText + '"';
    if (block.indexOf(needle) < 0) { missed.push(id + ": old text not found"); done = true; break; }
    const patched = block.replace(needle, '"' + newText + '"');
    contents[f] = src.slice(0, start) + patched + src.slice(end < 0 ? src.length : end);
    applied++;
    done = true;
    break;
  }
  if (!done) missed.push(id + ": question not found");
});

if (!DRY) files.forEach((f) => fs.writeFileSync(path.join(ROOT, "data", f), contents[f]));

console.log((DRY ? "[dry run] " : "") + "applied " + applied + " of " + PATCHES.length + " patches");
if (missed.length) {
  console.log("missed:");
  missed.forEach((m) => console.log("  " + m));
  process.exit(1);
}
