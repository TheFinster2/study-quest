/* Maths Extension 1's FX: the app's one particle canvas (SQ.FX), plus the single
   effect MathQuest had that the shared canvas does not — a shower of maths
   symbols when a proof or an integral "resolves". The shared canvas cannot draw
   glyphs, so the symbols are a few short-lived DOM spans (scoped CSS in
   subjects/mext/css/mext.css), falling back to SQ.FX's burst when motion is
   reduced or the DOM is unavailable. */
window.MX = window.MX || {};

MX.FX = (function () {
  const GLYPHS = ["∫", "π", "Σ", "√", "∞", "θ", "∂", "dx", "e", "λ", "≈", "Δ"];
  const fx = Object.create(SQ.FX);

  fx.symbols = function (x, y, n) {
    if (SQ.FX.isReduced && SQ.FX.isReduced()) return;
    const count = Math.min(n || 14, 18);
    try {
      for (let i = 0; i < count; i++) {
        const s = document.createElement("span");
        s.className = "ma-glyph";
        s.textContent = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        const ang = Math.random() * Math.PI * 2, dist = 40 + Math.random() * 90;
        s.style.left = x + "px";
        s.style.top = y + "px";
        s.style.setProperty("--dx", Math.round(Math.cos(ang) * dist) + "px");
        s.style.setProperty("--dy", Math.round(Math.sin(ang) * dist - 40) + "px");
        document.body.appendChild(s);
        setTimeout(() => s.remove(), 1100);
      }
    } catch (e) {
      SQ.FX.pop(x, y);
    }
  };

  /* MathQuest's confetti fired its own tuned counts; the shared one takes the
     same argument, so it is inherited as-is. */
  return fx;
})();
