/* Load Physics' content modules into a Node vm — the stand-alone app's loader,
   pointed at subjects/phys/. No DOM modules are loaded: none of the content or
   generator logic depends on them. */
const vm = require("vm");
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..", "..", "..");
const SUB = "subjects/phys/";

const CORE = ["core/util.js", "core/units.js", "data/constants.js", "core/expr.js", "core/gen.js"]
  .map(f => SUB + f);

function generatorFiles() {
  const dir = path.join(ROOT, SUB + "data/generators");
  return fs.readdirSync(dir).filter(f => f.endsWith(".js")).sort().map(f => SUB + "data/generators/" + f);
}
function dataFiles() {
  const dir = path.join(ROOT, SUB + "data");
  return fs.readdirSync(dir).filter(f => f.endsWith(".js") && f !== "constants.js").sort()
           .map(f => SUB + "data/" + f);
}

function load(extra) {
  const ctx = vm.createContext({
    console, Math, JSON, Date, Object, Array, String, Number, Boolean,
    parseFloat, parseInt, isFinite, isNaN, Map, Set, Error, RegExp
  });
  vm.runInContext("var window = this; var self = this;", ctx);
  const files = CORE.concat(dataFiles(), generatorFiles(), extra || []);
  const loaded = [];
  for (const rel of files) {
    const abs = path.join(ROOT, rel);
    if (!fs.existsSync(abs)) continue;
    try {
      vm.runInContext(fs.readFileSync(abs, "utf8"), ctx, { filename: rel });
      loaded.push(rel);
    } catch (e) {
      const err = new Error(`${rel}: ${e.message}`);
      err.file = rel;
      throw err;
    }
  }
  const PHYS = vm.runInContext("PHYS", ctx);
  return { PHYS, ctx, loaded, ROOT,
           U: PHYS.U, Units: PHYS.Units, Gen: PHYS.Gen, Expr: PHYS.Expr, DATA: PHYS.DATA };
}

module.exports = { load, ROOT, SUB, CORE, generatorFiles, dataFiles };
