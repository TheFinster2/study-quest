/* The profile sheet: tap your avatar. Wear any owned avatar or theme. */
window.SQ = window.SQ || {};
SQ.Hub = SQ.Hub || {};

(function (Hub) {
  const U = SQ.U, UI = SQ.UI;

  Hub.profileSheet = function () {
    const d = SQ.Store.data;
    const allThemes = SQ.DATA.themes.map(t => t.id);
    const themeName = id => { const t = SQ.DATA.themes.find(x => x.id === id); return t ? t.name : id.replace(/^[a-z]+-/, "").replace(/-/g, " "); };
    const ownedThemes = d.owned.themes.slice().sort((a, b) => (allThemes.indexOf(a) + 1 || 99) - (allThemes.indexOf(b) + 1 || 99));

    const avatars = U.el("div", { class: "row wrap", style: "gap:6px" }, d.owned.avatars.map(a =>
      U.el("button", { class: "chip chip-btn" + (d.profile.avatar === a ? " on" : ""), style: "font-size:20px; min-width:44px; min-height:44px",
        "aria-label": "Wear " + a, text: a, on: { click: () => { d.profile.avatar = a; SQ.Store.emit(); SQ.Sound.equip(); UI.closeModal(); Hub.profileSheet(); } } })));
    const themes = U.el("div", { class: "row wrap", style: "gap:6px" }, ownedThemes.map(t =>
      U.el("button", { class: "chip chip-btn" + (d.profile.theme === t ? " on" : ""), text: themeName(t),
        on: { click: () => { UI.applyTheme(t); SQ.Sound.equip(); UI.closeModal(); Hub.profileSheet(); } } })));

    const o = d.overall;
    UI.modal(U.el("div", {}, [
      U.el("div", { class: "row", style: "gap:12px" }, [
        U.el("div", { class: "hub-level" }, [U.el("span", { text: d.profile.avatar }), U.el("b", { text: String(o.level) })]),
        U.el("div", {}, [U.el("h2", { text: d.profile.name, style: "margin:0" }),
          U.el("div", { class: "muted", text: SQ.Overall.title(o.level) }),
          U.el("div", { class: "tiny muted", text: `${U.fmtInt(o.lifetimeXp)} XP · ${d.streak.count}-day streak (best ${d.streak.longest || 0}) · ${U.fmtInt(d.stars)} ⭐` })])
      ]),
      U.el("h3", { class: "shop-h", style: "margin-top:16px", text: "Avatar" }), avatars,
      U.el("h3", { class: "shop-h", style: "margin-top:16px", text: "App theme" }), themes,
      U.el("p", { class: "tiny muted", text: "Subjects can use their own theme — set it in that subject's shop." }),
      U.el("div", { class: "row", style: "margin-top:12px; gap:8px" }, [
        U.el("a", { class: "btn btn-ghost btn-sm", href: "#/shop/cosmetics", on: { click: () => UI.closeModal() }, text: "More in the shop" }),
        U.el("div", { class: "spacer" }),
        U.el("button", { class: "btn btn-primary btn-sm", text: "Done", on: { click: () => UI.closeModal() } })
      ])
    ]));
  };
})(SQ.Hub);
