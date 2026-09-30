/* Biology shop — the shared renderer with Biosphere's catalogue.
   Themes (renamed bio-<name>), the 22 avatars (level-gated as before) and
   crates that turn biocredits into the shared power-ups. Power-ups themselves
   are sold in the general shop (Stars). Nothing here calls award(). */
(function (root) {
  "use strict";
  var BIO = root.BIO, UI = BIO.UI;

  BIO.shopCatalog = function () {
    var shop = BIO.DATA.shop;
    return {
      themes: shop.themes.map(function (t) {
        return { id: t.id, name: t.name, price: t.cost, level: t.level, swatch: t.swatch, desc: t.blurb };
      }),
      avatars: shop.avatars.map(function (a) { return { emoji: a.emoji, name: a.name, price: a.cost, level: a.minLevel || 1 }; }),
      crates: [
        { id: "bio-crate1", icon: "🧫", name: "Specimen jar",  price: 450,  level: 1,  rolls: 3,
          desc: "Three random power-ups for any subject." },
        { id: "bio-crate2", icon: "🧪", name: "Field kit",     price: 1100, level: 8,  rolls: 8, better: true,
          desc: "Eight power-ups, weighted towards the good ones." },
        { id: "bio-crate3", icon: "🌳", name: "Seed vault",    price: 2900, level: 20, rolls: 14, better: true, cosmetic: true,
          desc: "Fourteen power-ups and a chance at a rare avatar." }
      ]
    };
  };

  UI.route("/shop", function (view) {
    SQ.Shop.subject(view, "bio", BIO.shopCatalog());
  });
})(typeof window !== "undefined" ? window : globalThis);
