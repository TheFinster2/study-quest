/* #/dev — the developer menu, for reaching states that would take weeks to earn
   (English's idea, generalised). Reached by tapping the version in Settings five
   times. Every action stamps the save (`devUnlocked`), so progress made here can
   always be told apart from progress earned.

   Subjects add their own presets by exposing X.devActions = [{ label, run }]. */
window.SQ = window.SQ || {};
SQ.Hub = SQ.Hub || {};

(function (Hub) {
  const U = SQ.U, UI = SQ.UI;
  const D = () => SQ.Store.data;

  function stamp() { D().devUnlocked = true; D().devUsedAt = Date.now(); }
  function btn(label, run) {
    return U.el("button", { class: "btn btn-sm btn-ghost", text: label, on: { click: () => {
      stamp();
      try { const r = run(); SQ.Store.emit(); UI.toast({ icon: "🛠️", text: U.escapeHtml(typeof r === "string" ? r : label) }); }
      catch (e) { UI.toast({ icon: "⚠", kind: "bad", text: U.escapeHtml(e.message) }); }
      UI.syncHeader();
    } } });
  }

  Hub.dev = function (view) {
    const d = D();
    view.appendChild(U.el("div", { class: "hero" }, [U.el("h1", { text: "Developer menu" }),
      U.el("p", { class: "muted", text: "Changes here are flagged on the save." })]));

    view.appendChild(U.el("h2", { class: "sec-h", text: "App" }));
    view.appendChild(U.el("div", { class: "dev-grid" }, [
      btn("+1,000 ⭐", () => { d.stars += 1000; }),
      btn("+5 of every power-up", () => { Object.keys(d.inventory).forEach(k => (d.inventory[k] += 5)); }),
      btn("+30 min arcade", () => { d.arcade.seconds = (d.arcade.seconds || 0) + 1800; }),
      btn("Overall level +5", () => { for (let i = 0; i < 5; i++) SQ.Overall.addXP(SQ.Overall.xpNeeded(d.overall.level) - d.overall.xpIntoLevel); }),
      btn("Overall level 50", () => { while (d.overall.level < 50) SQ.Overall.addXP(SQ.Overall.xpNeeded(d.overall.level) - d.overall.xpIntoLevel); }),
      btn("Own every app theme + avatar", () => {
        SQ.DATA.themes.forEach(t => { if (!d.owned.themes.includes(t.id)) d.owned.themes.push(t.id); });
        SQ.DATA.avatars.forEach(a => { if (!d.owned.avatars.includes(a.emoji)) d.owned.avatars.push(a.emoji); });
      }),
      btn("Streak = 29 days", () => { const t = new Date(); t.setDate(t.getDate() - 1); d.streak.count = 29; d.streak.lastDay = U.dayKey(t); d.streak.longest = Math.max(29, d.streak.longest); }),
      btn("New day (daily resets)", () => { d.daily = { day: null, progress: {}, claimed: false, spec: null }; SQ.Overall.daily(); }),
      btn("New week (quests reset)", () => { d.weekly = { week: null }; SQ.Overall.weekly(); }),
      btn("Complete today's daily", () => { const dd = SQ.Overall.daily(); const k = dd.spec.kind;
        if (k === "subjects") dd.progress.subjects = { a: true, b: true, c: true }; else dd.progress[k] = dd.spec.target; }),
      btn("Show onboarding", () => { Hub.onboarding(); }),
      btn("Offer old-save import", () => { d.migrated = {}; SQ.Migrate.offer(true); })
    ]));

    SQ.Subjects.LIST.forEach(m => {
      view.appendChild(U.el("h2", { class: "sec-h", text: m.icon + " " + m.name }));
      const ns = SQ.Subjects.ns(m.id);
      if (!ns || !ns.State) {
        view.appendChild(U.el("button", { class: "btn btn-sm btn-ghost", text: "Load " + m.name + " to see its presets",
          on: { click: () => SQ.Loader.load(m.id).then(() => UI.go("/dev")) } }));
        return;
      }
      const S = ns.State;
      const common = [
        btn("+5,000 " + m.currency.icon, () => { S.addCoins(5000); }),
        btn("Level +5", () => { for (let i = 0; i < 5; i++) S.addXP(S.xpNeeded(S.data.level) - S.data.xpIntoLevel); }),
        btn("Level 60", () => { while (S.data.level < S.MAX_LEVEL) S.addXP(S.xpNeeded(S.data.level) - S.data.xpIntoLevel); }),
        btn("All cards due", () => { const today = U.dayKey(); Object.values(S.data.srs).forEach(c => (c.due = today)); }),
        btn("Complete subject daily", () => { const dd = S.daily(); dd.progress = dd.spec.target; })
      ];
      const own = (ns.devActions || []).map(a => btn(a.label, a.run));
      view.appendChild(U.el("div", { class: "dev-grid" }, common.concat(own)));
    });
  };
})(SQ.Hub);
