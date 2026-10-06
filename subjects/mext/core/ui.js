/* Maths Extension 1's view of the shared UI shell.

   The router, header, toasts, modals, gameShell(), results() and THE REWARD
   PIPELINE — award() — are the app's now (js/sq/ui.js). They are the
   stand-alone app's own, promoted: the accuracy gate on the completion bonus,
   the multiplier ceiling and the latched formula crutch all still happen in
   exactly one function that no mode can skip.

   What is MathQuest's own and stays here: the EXT tier chip, and handleRoute()
   (its modes re-run the current route for "Play again"). */
window.MX = window.MX || {};

MX.UI = SQ.UI.bind("mext", {
  nav: [
    { key: "home",     icon: "∫",  label: "Home" },
    { key: "play",     icon: "🎮", label: "Play" },
    { key: "study",    icon: "🗂️", label: "Study" },
    { key: "progress", icon: "📈", label: "Progress" },
    { key: "shop",     icon: "🛒", label: "Shop" }
  ],
  navMap: {
    game: "play", boss: "play",
    reference: "study", formulas: "study",
    achievements: "progress", options: "progress"
  },
  /* Primes are deliberately scarcer than XP: payouts scale to 60%. */
  coinRate: 0.6,
  tools: { calc: true, sheet: true, pad: true },
  extend: {
    /** A tier badge — small EXT marker, present but not smug. */
    tierChip(topic) {
      if (MX.DATA.tierOf(topic) !== "ME") return null;
      return MX.U.el("span", { class: "chip chip-ext", text: "EXT", title: "Mathematics Extension 1" });
    },
    /** Re-run the current route (MathQuest's "Play again"). */
    handleRoute: () => SQ.UI.handleRoute()
  }
});
