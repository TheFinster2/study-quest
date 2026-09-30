/* Load app files into a Node vm sandbox — for content tests that need no browser.

     const { load } = require("../../lib/vm");
     const ctx = load(["js/sq/util.js", "subjects/chem/core/util.js", "subjects/chem/data/q-m5.js"]);
     ctx.CHEM.DATA.questions …

   A minimal window/document stub is provided; files that touch the DOM at load
   time should not be loaded here. */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.join(__dirname, "..", "..");

function stubDocument() {
  const node = () => ({ style: {}, dataset: {}, classList: { add() {}, remove() {}, toggle() {}, contains: () => false },
    appendChild() {}, removeChild() {}, setAttribute() {}, getAttribute: () => null, addEventListener() {},
    querySelector: () => null, querySelectorAll: () => [], getContext: () => null, children: [], childNodes: [] });
  return { createElement: node, createTextNode: node, getElementById: () => null, querySelector: () => null,
    querySelectorAll: () => [], addEventListener() {}, documentElement: node(), body: node(), head: node() };
}

function load(files, extra) {
  const sandbox = Object.assign({
    console, Math, Date, JSON, setTimeout, clearTimeout, setInterval, clearInterval,
    localStorage: { _m: {}, getItem(k) { return this._m[k] || null; }, setItem(k, v) { this._m[k] = String(v); }, removeItem(k) { delete this._m[k]; } },
    navigator: { userAgent: "node" }, location: { hash: "", protocol: "file:" },
    matchMedia: () => ({ matches: false, addEventListener() {} }),
    requestAnimationFrame: f => setTimeout(f, 16), getComputedStyle: () => ({ getPropertyValue: () => "" })
  }, extra || {});
  sandbox.window = sandbox;
  sandbox.globalThis = sandbox;
  sandbox.self = sandbox;
  sandbox.document = stubDocument();
  vm.createContext(sandbox);
  for (const f of files) {
    const code = fs.readFileSync(path.join(ROOT, f), "utf8");
    vm.runInContext(code, sandbox, { filename: f });
  }
  return sandbox;
}

module.exports = { load, ROOT };
