/* Shop — the shared subject shop (SQ.Shop.subject) with MathQuest's catalogue.

   Paid in Primes 🔢. Power-ups themselves are sold in the app's general shop
   (for Stars) and work in every subject; MathQuest's three supply crates are
   how Primes turn into power-ups. The shared renderer adds difficulty, the
   subject's arcade skins, the Exchange and a link to the general shop. */
window.MX = window.MX || {};
MX.Screens = MX.Screens || {};

MX.Screens.shop = function (view) {
  const shop = MX.DATA.shop;
  SQ.Shop.subject(view, "mext", {
    themes: shop.themes.map(t => ({
      id: t.id, name: t.name, desc: t.desc, price: t.cost, level: t.minLevel || 1, swatch: t.dots
    })),
    avatars: shop.avatars.map(a => ({
      emoji: a.emoji, name: a.name, price: a.cost, level: a.minLevel || 1
    })),
    /* rolls ≈ the middle of the stand-alone ranges (1–2, 3–5, 6–9); the two
       larger crates keep their chance at a rare avatar. */
    crates: [
      { id: "crate_s", icon: "📦", name: "Scrap Paper",     price: 600,  level: 1,  rolls: 2,
        desc: "Two random power-ups." },
      { id: "crate_l", icon: "🎁", name: "Supply Crate",    price: 1500, level: 1,  rolls: 4, cosmetic: true,
        desc: "Four power-ups, and a chance of a rare avatar." },
      { id: "crate_x", icon: "🗄️", name: "Reference Sheet", price: 4000, level: 20, rolls: 7, better: true, cosmetic: true,
        desc: "Seven power-ups from the better table, and a chance of a rare avatar." }
    ]
  });
};
