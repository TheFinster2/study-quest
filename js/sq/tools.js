/* PLACEHOLDER — replaced by the shared tool tray (calculator, reference sheet,
   working pad). Keeps the API so the shell and subjects can call it today. */
window.SQ = window.SQ || {};
SQ.Tools = (function () {
  const sheets = {};
  return {
    registerSheet(id, sheet) { sheets[id] = sheet; },
    getSheet: id => sheets[id] || null,
    mount() {}, unmount() {},
    penalty: () => 1, lookups: () => []
  };
})();
