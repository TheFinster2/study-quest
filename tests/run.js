#!/usr/bin/env node
/* Run every suite:  node tests/run.js [filter]   (filter matches the path, e.g. "chem", "app/")
   Suites are standalone node scripts; a suite fails by exiting non-zero. Files whose
   name starts with "_" and anything under a lib/ or suites/ folder are helpers. */
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const ROOT = __dirname;
const filter = process.argv[2] || "";
const order = ["app", "tools", "arcade", "subjects"];
const files = [];
function scan(dir) {
  for (const n of fs.readdirSync(dir).sort()) {
    const p = path.join(dir, n);
    const st = fs.statSync(p);
    if (st.isDirectory()) { if (!["lib", "suites", "data", "fixtures"].includes(n)) scan(p); }
    else if (n.endsWith(".js") && !n.startsWith("_")) files.push(p);
  }
}
order.forEach(d => fs.existsSync(path.join(ROOT, d)) && scan(path.join(ROOT, d)));

const picked = files.filter(f => path.relative(ROOT, f).includes(filter));
const results = [];
for (const f of picked) {
  const rel = path.relative(ROOT, f);
  const t0 = Date.now();
  process.stdout.write(`\n━━ ${rel}\n`);
  const r = spawnSync(process.execPath, [f], { stdio: "inherit", env: Object.assign({}, process.env, { SQ_RUNNER: "1" }) });
  results.push({ rel, ok: r.status === 0, ms: Date.now() - t0, code: r.status });
}
console.log("\n══ summary");
results.forEach(r => console.log(`${r.ok ? "✓" : "✗"} ${r.rel}  (${(r.ms / 1000).toFixed(1)}s)${r.ok ? "" : "  exit " + r.code}`));
const bad = results.filter(r => !r.ok).length;
console.log(`${results.length - bad}/${results.length} suites passed`);
process.exit(bad ? 1 : 0);
