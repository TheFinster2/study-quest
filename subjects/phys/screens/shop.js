/* The Physics shop, rendered by the shared shop (SQ.Shop.subject).

   Paid in Joules. The ten Newton's Notebook themes (now `phys-<name>`), its
   sixteen avatars and its two crates. Power-ups themselves are sold for Stars in
   the general shop; the crates are how Joules turn into power-ups. Difficulty, the
   arcade skins and the Exchange are added by the shared renderer. */
window.PHYS = window.PHYS || {};
PHYS.Screens = PHYS.Screens || {};

PHYS.Screens.shop = function (view) {
  const D = PHYS.DATA;
  SQ.Shop.subject(view, "phys", {
    themes: D.themes.map(t => ({ id: t.id, name: t.name, price: t.price, desc: t.desc, swatch: t.dots })),
    avatars: D.avatars.map(a => ({ emoji: a.emoji, price: a.price })),
    crates: D.crates.map(c => ({ id: "phys-" + c.id, icon: c.icon, name: c.name, price: c.price,
                                 rolls: c.rolls, desc: c.desc, better: !!c.better }))
  });
};
