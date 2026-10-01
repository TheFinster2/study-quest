/* The English shop — the shared renderer (SQ.Shop.subject) with Close Reading's catalogue.
   Power-ups are sold app-wide for Stars now; Marks buy crates (→ shared power-ups),
   the ten themes (renamed eng-<name>) and the twenty-two avatars. Difficulty is set here
   too, by the shared renderer. */
window.EN = window.EN || {};
EN.Screens = EN.Screens || {};

EN.Screens.shop = function (view) {
  /* Each crate keeps its stand-alone weight table (SQ.Shop honours `table`). */
  const crates = EN.DATA.shop.crates.map(c => ({
    id: "eng-" + c.id, icon: c.icon, name: c.name, price: c.price, level: c.level,
    rolls: c.rolls, desc: c.desc, table: c.table.map(([id, w]) => [id, w])
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
