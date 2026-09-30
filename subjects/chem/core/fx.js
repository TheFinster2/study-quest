/* Chemistry's effects, on the app's one particle canvas (SQ.FX). MoleQuest's own
   canvas code is gone; the only effect it had that the core names differently is
   `bubbles` (a titration success), which is the core's `rise`. */
window.CHEM = window.CHEM || {};

CHEM.FX = (function () {
  const F = () => SQ.FX;
  return {
    pop: (x, y) => F().pop(x, y),
    confetti: n => F().confetti(n),
    bubbles: (x, y) => (F().rise ? F().rise(x, y) : F().pop(x, y)),
    sparks: (x, y, dir) => F().sparks(x, y, dir),
    floatText: (x, y, text, colour) => F().floatText(x, y, text, colour),
    shake: () => F().shake(),
    burstAt: (node, opts) => (F().burstAt ? F().burstAt(node, opts) : null),
    setReduced: v => F().setReduced(v)
  };
})();
