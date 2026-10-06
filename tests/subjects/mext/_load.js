/* Load Maths Advanced into a Node vm: the shared core it builds on (store,
   subject-state, ui binding) plus the subject's engine and content, in the
   manifest's order. No browser. `patch(rel, src)` lets validate.js apply its
   BREAK= regexes to a file as it loads. */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.join(__dirname, "..", "..", "..");
const SUB = "subjects/mext/";

const SQ_CORE = ["util", "audio", "fx", "economy", "subjects", "store", "overall",
                 "subject-state", "ui", "tools"].map(f => "js/sq/" + f + ".js");

/** The manifest's script list, read by running manifest.js against a stub. */
function manifestScripts() {
  let m = null;
  const ctx = vm.createContext({ SQ: { Subjects: { manifest: (id, x) => (m = x) } }, console });
  vm.runInContext("var window = this;", ctx);
  vm.runInContext(fs.readFileSync(path.join(ROOT, SUB + "manifest.js"), "utf8"), ctx);
  return { scripts: m.scripts.slice(), css: m.css.slice(), manifest: m };
}

function stubNode() {
  return {
    style: { setProperty() {} }, dataset: {}, classList: { add() {}, remove() {}, toggle() {}, contains: () => false },
    children: [], childNodes: [],
    set innerHTML(v) { this._h = v; }, get innerHTML() { return this._h || ""; },
    get textContent() { return String(this._h || "").replace(/<[^>]*>/g, ""); }, set textContent(v) { this._h = v; },
    appendChild(c) { return c; }, removeChild() {}, remove() {}, insertBefore() {},
    setAttribute() {}, getAttribute: () => null, addEventListener() {}, removeEventListener() {},
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 0, height: 0, right: 0, bottom: 0 }),
    querySelector: () => null, querySelectorAll: () => [], focus() {}, getContext: () => null
  };
}

/**
 * load({ tiers, patch, only }) → ctx   (ctx.MX, ctx.SQ)
 *   tiers — pin MX.DATA.TIERS (["MA"] or ["MA","ME"]) for this context
 *   only  — "content" (default: engine + data, no games/screens) or "all"
 */
function load(opts) {
  const o = opts || {};
  const ctx = {
    console, performance: { now: () => Date.now() },
    setTimeout, clearTimeout, setInterval, clearInterval,
    requestAnimationFrame: () => 0, cancelAnimationFrame: () => {},
    matchMedia: () => ({ matches: false, addEventListener() {} }),
    getComputedStyle: () => ({ getPropertyValue: () => "" }),
    localStorage: { _d: {}, getItem(k) { return this._d[k] === undefined ? null : this._d[k]; },
                    setItem(k, v) { this._d[k] = String(v); }, removeItem(k) { delete this._d[k]; } },
    navigator: { serviceWorker: undefined, userAgent: "node" },
    location: { hash: "", protocol: "file:" },
    innerWidth: 390, innerHeight: 844,
    addEventListener() {}, removeEventListener() {}
  };
  ctx.document = {
    documentElement: stubNode(), body: stubNode(), head: stubNode(), activeElement: null,
    createElement: () => stubNode(), createTextNode: () => stubNode(),
    getElementById: () => null, querySelector: () => null, querySelectorAll: () => [],
    addEventListener() {}, removeEventListener() {}, contains: () => false
  };
  ctx.window = ctx; ctx.self = ctx; ctx.globalThis = ctx;
  vm.createContext(ctx);
  const run = rel => {
    let src = fs.readFileSync(path.join(ROOT, rel), "utf8");
    if (o.patch) src = o.patch(rel, src);
    vm.runInContext(src, ctx, { filename: rel });
  };
  SQ_CORE.forEach(run);
  vm.runInContext("SQ.Store.load();", ctx);
  const { scripts } = manifestScripts();
  const wanted = scripts.filter(s => o.only === "all" || !/\/(games|screens)\//.test(s));
  for (const rel of wanted) {
    run(rel);
    if (rel.endsWith("data/tiers.js") && o.tiers) ctx.MX.DATA.__forceTiers = o.tiers.slice();
  }
  ctx.__run = run;
  return ctx;
}

module.exports = { load, ROOT, SUB, manifestScripts };
