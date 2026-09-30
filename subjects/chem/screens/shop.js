/* The Chemistry shop — MoleQuest's ten lab skins, twenty-two avatars and three
   supply crates, rendered by the shared subject shop (which adds difficulty, the
   arcade skins, the Exchange and a link to the general shop).

   Power-ups themselves are sold in the general shop for Stars; the crates are how
   Moles turn into power-ups. Crate prices are MoleQuest's; a crate now rolls only
   power-ups (the app's crate engine), so the old "handful of Moles" inside is gone
   and the roll counts sit at the top of the old ranges to compensate. */
window.CHEM = window.CHEM || {};
CHEM.Screens = CHEM.Screens || {};

CHEM.Screens.shop = function (view) {
  const shop = CHEM.DATA.shop;
  SQ.Shop.subject(view, "chem", {
    themes: shop.themes.map(t => ({
      id: "chem-" + t.id, name: t.name, desc: t.desc, price: t.cost, level: t.minLevel || 0,
      swatch: t.dots
    })),
    avatars: shop.avatars.map(a => ({ emoji: a.emoji, name: a.name, price: a.cost, level: a.minLevel || 0 })),
    crates: [
      { id: "chem-crate_s", icon: "📦", name: "Reagent Pouch", price: 600, rolls: 2, level: 1,
        desc: "Two random power-ups." },
      { id: "chem-crate_l", icon: "🎁", name: "Supply Crate", price: 1500, rolls: 5, level: 1, better: true,
        desc: "Five power-ups, weighted towards the good ones." },
      { id: "chem-crate_x", icon: "🗄️", name: "Fume Cupboard", price: 4000, rolls: 9, level: 20, better: true, cosmetic: true,
        desc: "Nine power-ups and a chance at a rare avatar." }
    ]
  });
};
