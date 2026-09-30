/* English's FX are the app's. Close Reading's fx.js is the one SQ.FX was taken from
   (pop, marked, confetti, rise, sparks, floatText, shake, burstAt, three-valued motion),
   so this is an alias with a fallback for anything a later core might drop. */
window.EN = window.EN || {};
EN.FX = (function () {
  const F = SQ.FX;
  const noop = () => {};
  const out = Object.create(F);
  ["pop", "marked", "confetti", "rise", "sparks", "floatText", "shake", "burstAt"].forEach(k => {
    if (typeof F[k] !== "function") out[k] = noop;
  });
  if (typeof F.marked !== "function" && typeof F.pop === "function") out.marked = (x, y) => F.pop(x, y);
  return out;
})();
