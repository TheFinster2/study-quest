/* Shop — the Economics shop, rendered by the shared SQ.Shop.subject with
   Economics' themes, avatars and crates. Power-ups themselves are sold in the
   general shop for Stars; the crates are how Dollars turn into power-ups.
   Difficulty (four tiers) is chosen here, as it was in the stand-alone app.

   Nothing here calls award(). Dollars remain a pure sink. */
(function (root) {
  "use strict";
  var ECON = root.ECON, UI = ECON.UI;

  var SWATCH = {
    "econ-ledger":   ["#07100c", "#4ade80", "#fbbf24"],
    "econ-indigo":   ["#04101a", "#38bdf8", "#2dd4bf"],
    "econ-ochre":    ["#150f04", "#fbbf24", "#a3e635"],
    "econ-slate":    ["#0a0d12", "#a5b4fc", "#7dd3fc"],
    "econ-daylight": ["#f3f8f4", "#15803d", "#a16207"]
  };

  ECON.catalog = function () {
    var shop = ECON.DATA.shop;
    return {
      themes: shop.themes.map(function (t) {
        return { id: t.id, name: t.name, price: t.cost, level: t.level || 1, desc: t.blurb, swatch: SWATCH[t.id] };
      }),
      avatars: shop.avatars.map(function (a) {
        return { emoji: a.emoji, name: a.name, price: a.cost, level: a.minLevel || 1 };
      }),
      crates: [
        { id: "econ-briefcase", icon: "💼", name: "Briefcase", price: 420, rolls: 3, level: 1,
          desc: "Three random power-ups, usable in any subject." },
        { id: "econ-strongroom", icon: "🏦", name: "Strongroom", price: 1100, rolls: 8, level: 8, better: true,
          desc: "Eight power-ups, weighted towards the good ones." },
        { id: "econ-treasury", icon: "🏛️", name: "The Treasury", price: 2600, rolls: 14, level: 20, better: true, cosmetic: true,
          desc: "Fourteen power-ups and a chance at a rare avatar." }
      ]
    };
  };

  UI.coreRoute("shop", function (view) {
    SQ.Shop.subject(view, "econ", ECON.catalog());
  });
})(typeof window !== "undefined" ? window : globalThis);
