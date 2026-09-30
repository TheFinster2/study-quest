#!/usr/bin/env node
/* Regenerate sw.js's PRECACHE list and FINGERPRINT from the files on disk.

     node tools/precache.js          write sw.js
     node tools/precache.js --check  exit 1 if sw.js is stale (used by the tests)

   Everything the app can load is precached — the shell AND every subject, so a
   subject opened for the first time on a train still loads. Excluded: tests, docs,
   tools, git, and English's opt-in model files. */
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const ROOT = path.join(__dirname, "..");
const EXCLUDE_DIRS = new Set([".git", "tests", "docs", "tools", "node_modules", ".github"]);
const EXCLUDE_PATHS = [/^subjects\/eng\/(models|vendor)\//, /(^|\/)README\.md$/i, /\.md$/i, /(^|\/)\./];
const EXT = /\.(html|js|css|json|webmanifest|svg|png|jpg|jpeg|webp|ico|woff2?|txt)$/i;

function walk(dir, out) {
  for (const name of fs.readdirSync(path.join(ROOT, dir))) {
    const rel = dir ? dir + "/" + name : name;
    const st = fs.statSync(path.join(ROOT, rel));
    if (st.isDirectory()) { if (!EXCLUDE_DIRS.has(name) || dir) { if (!(dir === "" && EXCLUDE_DIRS.has(name))) walk(rel, out); } }
    else if (EXT.test(name) && rel !== "sw.js" && !EXCLUDE_PATHS.some(re => re.test(rel))) out.push(rel);
  }
  return out;
}

function build() {
  const files = walk("", []).sort((a, b) => {
    // index.html and the shell first, for readability; order does not matter to the SW.
    const rank = f => f === "index.html" ? 0 : f.startsWith("js/sq/") ? 1 : f.startsWith("css/") ? 2 : f.startsWith("js/") ? 3 : 4;
    return rank(a) - rank(b) || a.localeCompare(b);
  });
  const h = crypto.createHash("sha256");
  for (const f of files) { h.update(f); h.update(fs.readFileSync(path.join(ROOT, f))); }
  const fp = h.digest("hex").slice(0, 10);
  const list = ["./"].concat(files);
  const tpl = fs.readFileSync(path.join(__dirname, "sw.template.js"), "utf8");
  const out = tpl.replace("__FINGERPRINT__", fp)
    .replace("[/*__PRECACHE__*/]", "[\n" + list.map(f => "  " + JSON.stringify(f)).join(",\n") + "\n]");
  return { out, fp, files: list };
}

if (require.main === module) {
  const { out, fp, files } = build();
  const target = path.join(ROOT, "sw.js");
  const cur = fs.existsSync(target) ? fs.readFileSync(target, "utf8") : "";
  if (process.argv.includes("--check")) {
    if (cur !== out) { console.log("sw.js is stale — run: node tools/precache.js"); process.exit(1); }
    console.log("sw.js up to date (" + files.length + " files, " + fp + ")");
  } else {
    fs.writeFileSync(target, out);
    console.log("sw.js: " + files.length + " files, fingerprint " + fp);
  }
}
module.exports = { build };
