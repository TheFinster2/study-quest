/* Physics' effects, aliased onto the app's one particle canvas (SQ.FX).
   The stand-alone signatures are kept: burst(x, y, n) and shake(el). */
window.PHYS = window.PHYS || {};

PHYS.FX = (function () {
  const F = () => SQ.FX;
  function burst(x, y, n) {
    if (F().isReduced()) return;
    if ((n || 0) >= 18 && F().sparks) F().sparks(x, y);
    else F().pop(x, y);
  }
  /** Shake one element (the question card), or the view. */
  function shake(el) {
    if (F().isReduced()) return;
    const node = el || document.getElementById("view");
    if (!node) return;
    node.classList.remove("screen-shake");
    void node.offsetWidth;
    node.classList.add("screen-shake");
    setTimeout(() => node.classList.remove("screen-shake"), 420);
  }
  return {
    burst, shake,
    confetti: n => F().confetti(n),
    floatText: (x, y, t) => F().floatText(x, y, t),
    setReduced: v => F().setReduced(v),
    get reduced() { return F().isReduced(); }
  };
})();
