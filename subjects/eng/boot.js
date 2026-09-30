/* English's boot — what the stand-alone js/app.js did, minus everything the app owns
   now (the router, header, save/flush pact, service worker, theme application).

   boot() registers every route on the bound UI, registers the reference sheet with the
   tool tray, binds English's keyboard play, and warms Layer C if the student opted in.
   importLegacy() maps a Close Reading save (closereading.save.v1) onto the new slot. */
window.EN = window.EN || {};

(function () {
  const U = EN.U;
  let booted = false;

  function registerRoutes() {
    const UI = EN.UI, Sc = EN.Screens;
    UI.route("home", Sc.home);
    UI.route("play", Sc.play.screen);
    UI.route("game", Sc.play.dispatch);
    UI.route("boss", EN.Games.boss.start);
    UI.route("vault", Sc.vault.screen);
    UI.route("study", Sc.vault.screen);          // the app's name for the review screen
    UI.route("reference", Sc.reference);
    UI.route("progress", Sc.progress);
    UI.route("shop", Sc.shop);
    UI.route("draft", Sc.draft.screen);
    UI.route("texts", Sc.texts.screen);
    UI.route("options", Sc.misc.settings);       // /settings is the app's
    UI.route("achievements", Sc.misc.achievements);
    /* Not in the nav, as before. The app-wide #/dev lists EN.devActions too. */
    UI.route("dev", Sc.dev);
  }

  /* The reference sheet: techniques by category and the rubric verbs. All free — there
     is no NESA sheet for English, and the stand-alone Reference screen was always free.
     Modes whose crutch IS a definition (Name That Technique, The Critic) hide the sheet. */
  function registerSheet() {
    const esc = U.escapeHtml;
    const cats = EN.DATA.techniqueCategories || [];
    const sections = cats.map(c => ({
      id: "tech-" + c.id, title: c.icon + " " + c.name,
      items: EN.DATA.techniques.filter(t => t.cat === c.id).map(t => ({
        id: t.id, name: t.name, free: true,
        body: "<p>" + esc(t.def) + "</p><p class=\"tiny muted\">" + esc(t.effect || "") + "</p>"
      }))
    })).filter(s => s.items.length);
    sections.push({
      id: "verbs", title: "🎯 Rubric verbs",
      items: (EN.DATA.rubricVerbs || []).map(v => ({
        id: "verb-" + v.id, name: v.verb, free: true,
        body: "<p>" + esc(v.demands) + "</p><p class=\"tiny muted\">Off-task: " + esc(v.offTask || "") + "</p>"
      }))
    });
    SQ.Tools.registerSheet("eng", { title: "Techniques and rubric verbs", constants: [], sections });
  }

  /* Keyboard play (from the stand-alone app.js): 1–4 / A–D pick a .choice, Enter presses
     the visible .js-next / .js-submit. Only while English is on screen; Esc and the
     dialog focus trap are the app's. */
  function bindKeys() {
    document.addEventListener("keydown", e => {
      if (SQ.UI.context() !== "eng") return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const tag = (e.target.tagName || "").toLowerCase();
      if (tag === "input" || tag === "textarea" || tag === "select") return;
      const scope = SQ.UI.modalOpen() ? U.$("#modal-root") : document;
      if (e.key === "Enter") {
        const next = U.$$(".js-next, .js-submit", scope).find(n => !n.disabled && n.offsetParent !== null);
        if (next) { e.preventDefault(); next.click(); }
        return;
      }
      const idx = "1234".indexOf(e.key) >= 0 ? "1234".indexOf(e.key) : "abcd".indexOf(e.key.toLowerCase());
      if (idx < 0 || SQ.UI.modalOpen()) return;
      const choices = U.$$(".choice:not([disabled])", U.$("#view"));
      if (choices[idx]) { e.preventDefault(); choices[idx].click(); }
    });
  }

  EN.boot = function () {
    if (booted) return;
    booted = true;
    registerRoutes();
    registerSheet();
    bindKeys();
    const S = EN.State;
    /* Marginalia was the stand-alone default and is free: own it, and dress English in it
       the first time the subject is opened (the student can switch to "Follow app theme"). */
    const owned = SQ.Store.data.owned.themes;
    if (!owned.includes("eng-marginalia")) owned.push("eng-marginalia");
    if (!S.data.settings.themeInit) {
      S.data.settings.themeInit = true;
      if (!S.data.settings.theme) S.data.settings.theme = "eng-marginalia";
      S.save();
      SQ.UI.applyTheme();
    }
    S.weeklyQuests();          // rolls the week over and snapshots the baseline if due
    S.daily();
    S.checkAchievements();     // catches anything an older build could not award
    /* Layer C: never on first load, never automatically. Only warm the runtime when the
       model is already in its cache bucket, so this costs no network in any case. */
    if (S.data.settings.layerC && EN.Mark.available()) {
      EN.Mark.isDownloaded().then(has => { if (has) EN.Mark.load(); });
    }
  };

  /* ── the old Close Reading save → the new slot ───────────── */
  const PU = { adrenaline: "double" };
  EN.importLegacy = function (old) {
    const o = old || {};
    const SLOT_KEYS = ["xp", "level", "xpIntoLevel", "coins", "prestige", "lifetimeXp", "stats",
      "modules", "texts", "topics", "modesPlayed", "puzzlesSolved", "bossesBeaten", "srs",
      "mistakes", "achievements", "history", "scores", "daily", "weekly", "freeText",
      "drafts", "manifest", "poems", "dev", "createdAt"];
    const slot = {};
    SLOT_KEYS.forEach(k => { if (o[k] !== undefined) slot[k] = JSON.parse(JSON.stringify(o[k])); });
    const set = o.settings || {};
    const theme = o.profile && o.profile.theme ? "eng-" + o.profile.theme : null;
    slot.settings = {
      difficulty: ["standard", "hard", "nightmare", "gentle"].includes(set.difficulty) ? set.difficulty : "standard",
      layerC: !!set.layerC, onboarded: !!set.onboarded, hidden: {},
      theme
    };
    const inventory = {};
    Object.keys(o.inventory || {}).forEach(k => {
      const id = PU[k] || k;
      inventory[id] = (inventory[id] || 0) + (o.inventory[k] || 0);
    });
    /* A fresh Close Reading save started with one 50/50 and one Skip, as does StudyQuest;
       don't double-count the starter pack. */
    if (inventory.fifty) inventory.fifty = Math.max(0, inventory.fifty - 1);
    if (inventory.skip) inventory.skip = Math.max(0, inventory.skip - 1);
    const owned = o.owned || {};
    return {
      slot,
      inventory,
      themes: (owned.themes || []).map(t => "eng-" + t),
      avatars: (owned.avatars || []).slice(),
      profile: o.profile ? { name: o.profile.name === "Reader" ? null : o.profile.name, avatar: o.profile.avatar } : null,
      streak: o.streak || null
    };
  };
})();
