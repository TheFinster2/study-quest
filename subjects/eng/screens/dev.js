/* THE DEV PRESETS — for testing English, not for playing it.
   ============================================================================
   The stand-alone app had its own #/dev screen. StudyQuest has one app-wide dev menu
   (#/dev) that lists every subject's `X.devActions = [{ label, run }]`, so English's
   presets are exposed here in that shape. The same list also renders on the subject
   route #/s/eng/dev (unlinked, as before) together with the snapshot controls.

   Two promises kept from the original:
     · every action STAMPS the save (slot `dev.touched/actions`; the app's menu also sets
       `devUnlocked`), because a level or an achievement from here has to stay
       distinguishable from one that was earned;
     · the snapshot lives under its own, namespaced key ("studyquest.dev.eng"), so wiping
       the English slot does not take it with it.
   ============================================================================ */
window.EN = window.EN || {};
EN.Screens = EN.Screens || {};

(function () {
  const U = EN.U;
  const S = () => EN.State;
  const SNAP_KEY = "studyquest.dev.eng";
  const BOSS_IDS = ["party", "double", "critic", "blankpage", "examiner"];

  function stamp() {
    const d = S().data.dev || (S().data.dev = { touched: 0, actions: 0 });
    d.touched = Date.now();
    d.actions++;
    S().checkAchievements();
    S().save();
    SQ.Store.flush();
  }
  const setLevel = n => { S().data.level = n; S().data.xpIntoLevel = 0; S().emit(); };

  /* ── the snapshot ── */
  function readSnap() { try { return localStorage.getItem(SNAP_KEY); } catch (e) { return null; } }
  function takeSnap() {
    SQ.Store.flush();
    try { localStorage.setItem(SNAP_KEY, JSON.stringify(SQ.Store.data.subjects.eng)); return "Snapshot taken"; }
    catch (e) { throw new Error("Could not store a snapshot — storage is full."); }
  }
  function restoreSnap() {
    const raw = readSnap();
    if (!raw) throw new Error("No snapshot stored.");
    const parsed = JSON.parse(raw);
    /* The slot is cached for the session, so restore = write the stored slot and reload. */
    SQ.Store.data.subjects.eng = parsed;
    SQ.Store.flush();
    setTimeout(() => location.reload(), 300);
    return "Snapshot restored — reloading";
  }

  const A = (label, run) => ({ label, run: () => { const r = run(); stamp(); return r || label; } });

  EN.devActions = [
    { label: "📸 Snapshot English", run: takeSnap },
    { label: "↩ Restore English snapshot", run: restoreSnap },
    A("Level 1", () => setLevel(1)),
    A("Level 15", () => setLevel(15)),
    A("Level 30", () => setLevel(30)),
    A("Level 60", () => setLevel(S().MAX_LEVEL)),
    A("+10k XP", () => { S().addXP(10000); }),
    A("Ascend now", () => { S().data.level = S().MAX_LEVEL; S().doPrestige(); }),
    A("+5,000 Marks", () => { S().addCoins(5000); }),
    A("Marks → 0", () => { S().data.coins = 0; S().emit(); }),
    A("Own every English theme + avatar", () => {
      const o = SQ.Store.data.owned;
      EN.DATA.themes.forEach(t => { const id = "eng-" + t.id; if (!o.themes.includes(id)) o.themes.push(id); });
      EN.DATA.avatars.forEach(a => { if (!o.avatars.includes(a.em)) o.avatars.push(a.em); });
    }),
    /* Set to nine, not add nine: grantPowerup accumulates. */
    A("9 of every power-up", () => { Object.keys(SQ.Store.data.inventory).forEach(k => (SQ.Store.data.inventory[k] = 9)); }),
    A("All bosses beaten", () => { BOSS_IDS.forEach(id => (S().data.bossesBeaten[id] = Date.now())); }),
    A("Every achievement", () => { EN.DATA.achievements.forEach(a => (S().data.achievements[a.id] = Date.now())); }),
    A("Lock English unlocks back", () => {
      S().data.bossesBeaten = {}; S().data.achievements = {};
      const o = SQ.Store.data.owned;
      o.themes = o.themes.filter(t => !/^eng-/.test(t));
    }),
    A("Vault: everything due", () => { EN.Bank.quotes().forEach(q => { S().cardState(q.id).due = "2000-01-01"; }); }),
    A("Vault: master everything", () => {
      EN.Bank.quotes().forEach(q => {
        const c = S().cardState(q.id);
        c.box = 5; c.reps = 9;
        const d = new Date(); d.setDate(d.getDate() + 16); c.due = U.dayKey(d);
      });
    }),
    /* Through reviewCard, so the box reset that MAKES a leech happens for real. */
    A("Vault: make 5 leeches", () => {
      EN.Bank.quotes().slice(0, 5).forEach(q => { for (let i = 0; i < S().LEECH_LAPSES; i++) S().reviewCard(q.id, false); });
    }),
    A("Vault: forget it all", () => { S().data.srs = {}; }),
    A("Seed a lopsided skill profile", () => {
      const d = S().data, all = EN.Bank.allTopics();
      all.forEach((name, i) => {
        const seen = 12 + i * 4, rate = 0.3 + (i / Math.max(1, all.length - 1)) * 0.6;
        d.topics[name] = { seen, correct: Math.round(seen * rate) };
      });
      EN.DATA.modules.forEach((m, i) => (d.modules[m.id] = { seen: 30, correct: 30 - i * 5 }));
      EN.Bank.activeTextIds().forEach((id, i) => (d.texts[id] = { seen: 25, correct: 22 - i * 4 }));
      d.stats.answered = 200; d.stats.correct = 130;
    }),
    A("Seed 12 mistakes", () => {
      S().data.mistakes = EN.Bank.all().slice(0, 12).map(q => ({ id: q.id, mod: q.mod, misses: 1 + (q.id.length % 3), ts: Date.now() }));
    }),
    A("Clear answer history", () => {
      const d = S().data;
      d.stats.answered = 0; d.stats.correct = 0; d.modules = {}; d.texts = {}; d.topics = {}; d.mistakes = [];
    }),
    A("Finish today's English challenge", () => { const d = S().daily(); d.progress = d.spec.target; d.claimed = false; }),
    A("Finish every weekly quest", () => {
      const w = S().weekly();
      if (w && w.baseline) Object.keys(w.baseline).forEach(k => { if (typeof w.baseline[k] === "number") w.baseline[k] = 0; });
    }),
    A("Roll the English day over", () => {
      S().data.daily.day = "2000-01-01";
      S().data.freeText = { day: null, scored: {}, hashes: {} };
    }),
    A("Roll the English week over", () => { S().data.weekly.week = "2000-W01"; }),
    A("Forget today's scored prompts", () => { S().data.freeText = { day: U.dayKey(), scored: {}, hashes: {} }; })
  ];

  /* #/s/eng/dev — the same actions, plus the snapshot state, on one screen. */
  EN.Screens.dev = function (view) {
    const UI = EN.UI;
    view.appendChild(U.el("h1", { text: "🛠 English dev presets" }));
    view.appendChild(U.el("p", { class: "muted",
      text: "Everything here stamps the save. The app-wide menu at #/dev lists these too. " +
            (readSnap() ? "A snapshot is stored." : "No snapshot stored yet.") }));
    const d = S().data.dev;
    if (d && d.touched) {
      view.appendChild(U.el("div", { class: "notice notice-bad", style: "margin-bottom:12px" }, [
        U.el("b", { text: "This save has been modified. " }),
        U.el("span", { text: d.actions + " dev action" + (d.actions === 1 ? "" : "s") + ", last " +
          new Date(d.touched).toLocaleString() + "." })
      ]));
    }
    const wrap = U.el("div", { class: "row", style: "flex-wrap:wrap; gap:6px" });
    EN.devActions.forEach(a => wrap.appendChild(U.el("button", { class: "chip chip-btn", type: "button", text: a.label,
      on: { click: () => {
        SQ.Store.data.devUnlocked = true;
        try { const r = a.run(); UI.toast({ icon: "🛠", kind: "good", text: U.escapeHtml(r || a.label) }); }
        catch (e) { UI.toast({ icon: "⚠", kind: "bad", text: U.escapeHtml(e.message) }); }
        UI.syncHeader();
      } } })));
    view.appendChild(U.el("div", { class: "card" }, [wrap]));
  };
})();
