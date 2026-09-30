/* The English shop — the shared renderer (SQ.Shop.subject) with Close Reading's catalogue.
   Power-ups are sold app-wide for Stars now; Marks buy crates (→ shared power-ups),
   the ten themes (renamed eng-<name>) and the twenty-two avatars. Difficulty is set here
   too, by the shared renderer. */
window.EN = window.EN || {};
EN.Screens = EN.Screens || {};

EN.Screens.shop = function (view) {
  /* The stand-alone crate tables are approximated by the shared roller: the Pencil Case
     is the common table, the Folio Box and the Archive roll the better one. */
  const crates = EN.DATA.shop.crates.map(c => ({
    id: "eng-" + c.id, icon: c.icon, name: c.name, price: c.price, level: c.level,
    rolls: c.rolls, desc: c.desc, better: c.id !== "satchel"
  }));
  SQ.Shop.subject(view, "eng", {
    themes: EN.DATA.themes.map(t => ({
      id: "eng-" + t.id, name: t.name, price: t.price, level: t.level, desc: t.desc, swatch: t.dots
    })),
    avatars: EN.DATA.avatars.map(a => ({ emoji: a.em, price: a.price, level: a.level })),
    crates
  });
  view.appendChild(EN.U.el("p", { class: "tiny muted", style: "margin:14px 0 24px",
    text: "Marks pay out at 60% of the run's face value, so they stay scarce on purpose." }));
};
