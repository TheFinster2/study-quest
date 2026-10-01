/* Physics (Newton's Notebook) — the subject manifest.

   Scripts in dependency order: content first (it is plain data), then the
   subject's own core (notation, units, expression parser, drawing, generators,
   state, bank, UI binding), then the generator templates, the modes and the
   screens. boot() registers the routes, the reference sheet and nothing else. */
window.SQ = window.SQ || {};

(function () {
  const B = "subjects/phys/";
  const DATA = ["constants", "equations", "questions-y11a", "questions-y11b", "questions-y12a",
                "questions-y12b", "questions-skills", "flashcards-y11", "flashcards-y12",
                "flashcards-skills", "worked-examples", "achievements", "shop"].map(f => B + "data/" + f + ".js");
  const CORE = ["util", "units", "expr", "audio", "fx", "draw", "gen", "state", "bank", "ui", "powerups"]
    .map(f => B + "core/" + f + ".js");
  const GENS = [1, 2, 3, 4, 5, 6, 7, 8].map(n => B + "data/generators/gen-m" + n + ".js");
  const GAMES = ["quiz", "calc", "fbd", "formula", "graph", "unitgrid", "bench", "chain", "boss"]
    .map(f => B + "games/" + f + ".js");
  const SCREENS = ["home", "play", "study", "reference", "progress", "shop", "misc"]
    .map(f => B + "screens/" + f + ".js");

  /* ── the reference sheet, for the shared tool tray ─────────────────────────
     Free = what the NESA data/formulae sheet prints (the source's `sheet` flags,
     derived from the data, never a hand-written list). Everything else — the two
     derived constants, the values a question must state, the ten derived formulas
     and the units table — costs −10% of the run, latched, capped at −30%. */
  function sheet() {
    const U = PHYS.U, C = PHYS.DATA.constants;
    const constants = C.list().map(c => ({
      id: c.id, name: c.name, symbol: c.sym, value: c.value, unit: c.disp || "", sf: c.sf,
      free: !!c.sheet,
      note: c.sheet ? (c.note || "") : "Not on the data sheet" + (c.derived ? " — derived from " + U.mathPlain(c.derived) : "")
    })).concat(Object.keys(C.supplied).map(id => {
      const s = C.supplied[id];
      return { id, name: s.name, symbol: id, value: s.value, unit: s.disp, sf: s.sf, free: false,
               note: "Not on the data sheet — a question has to state this itself" };
    }));
    const groups = [];
    PHYS.DATA.equations.forEach(eq => { if (groups.indexOf(eq.group) < 0) groups.push(eq.group); });
    const sections = groups.map((g, i) => ({
      id: "f" + (i + 1), title: g,
      items: PHYS.DATA.equations.filter(eq => eq.group === g).map(eq => ({
        id: eq.id, name: eq.name, body: eq.formula, free: !!eq.sheet, mod: eq.mod, topic: eq.topic,
        note: eq.sheet ? "" : (eq.sheetNote || "Not on the formulae sheet")
      }))
    }));
    sections.push({
      id: "units", title: "Quantities and their units",
      items: PHYS.Units.QUANTITIES.map(q => ({
        id: "unit:" + q.sym, name: q.name, body: q.sym + " \\quad \\u{" + q.unit + "}", free: false,
        note: "The sheet has no units table"
      }))
    });
    return {
      title: "HSC Physics data sheet",
      render: html => PHYS.U.math(html),
      constants, sections,
      aliases: { k: "kCoulomb", qe: "e", eps: "eps0", GMe: "GME" },
      source: C.SHEET_SOURCE, url: C.SHEET_URL
    };
  }

  function boot() {
    const UI = PHYS.UI, Sc = PHYS.Screens;
    UI.route("home",         view => Sc.home(view));
    UI.route("play",         view => Sc.play.screen(view));
    UI.route("game",   (view, args) => Sc.play.dispatch(view, args));
    UI.route("study",  (view, args) => Sc.study.screen(view, args));
    UI.route("progress",     view => Sc.progress(view));
    UI.route("shop",         view => Sc.shop(view));
    UI.route("reference",    view => Sc.reference(view));
    UI.route("achievements", view => Sc.achievements(view));
    UI.route("options",      view => Sc.options(view));
    if (SQ.Tools && SQ.Tools.registerSheet) SQ.Tools.registerSheet("phys", sheet());
  }

  /* ── legacy import: newtonsnotebook.save.v1 → the phys slot ──────────────── */
  const SLOT_KEYS = ["xp", "level", "xpIntoLevel", "coins", "prestige", "lifetimeXp", "stats", "modules",
                     "modesPlayed", "chainsSolvedIds", "bossesBeaten", "srs", "mistakes", "achievements",
                     "history", "scores", "daily", "weekly", "createdAt"];
  const PU = { fifty: "fifty", skip: "skip", freeze: "freeze", shield: "shield", double: "double",
               adrenaline: "revive", pass: "skip" };
  function importLegacy(old) {
    if (!old || typeof old !== "object") return null;
    const slot = {};
    SLOT_KEYS.forEach(k => { if (old[k] !== undefined) slot[k] = JSON.parse(JSON.stringify(old[k])); });
    const st = old.settings || {};
    const prof = old.profile || {};
    slot.settings = {
      difficulty: ["gentle", "standard", "hard", "nightmare"].indexOf(st.difficulty) >= 0 ? st.difficulty : "standard",
      sigfig: !!st.sigfig, hidden: {},
      theme: prof.theme ? "phys-" + prof.theme : null
    };
    const inventory = {};
    Object.keys(old.inventory || {}).forEach(k => {
      const id = PU[k] || k;
      inventory[id] = (inventory[id] || 0) + (old.inventory[k] || 0);
    });
    const owned = old.owned || {};
    return {
      slot, inventory,
      themes: (owned.themes || []).map(t => /^phys-/.test(t) ? t : "phys-" + t),
      avatars: (owned.avatars || []).slice(),
      profile: { name: prof.name, avatar: prof.avatar },
      streak: old.streak
    };
  }

  /* ── dev presets, listed by the app's dev menu ─────────────────────────────── */
  const devActions = [
    { label: "Physics: +5000 Joules", run() { PHYS.State.addCoins(5000); } },
    { label: "Physics: unlock every boss (seed 60% mastery)", run() {
        const d = PHYS.State.data;
        PHYS.Bank.MODULES.forEach(m => { d.modules[m.id] = { seen: 40, correct: 24, topics: (d.modules[m.id] || {}).topics || {} }; });
        PHYS.State.emit();
      } },
    { label: "Physics: seed mistakes, due cards and a leech", run() {
        const S = PHYS.State, d = S.data;
        PHYS.Bank.all().slice(0, 6).forEach(q => S.recordAnswer(q.mod, false, q.id, q.topic));
        const t = PHYS.Gen.all()[0];
        if (t) S.recordGenMistake(t.id, t.mod, t.topic, "used the wrong sign");
        const c = PHYS.Bank.cards()[0];
        if (c) d.srs[c.id] = { box: 1, due: PHYS.U.dayKey(), reps: 6, lapses: 5 };
        S.emit();
      } },
    { label: "Physics: reach level 60 (Ascension ready)", run() {
        const S = PHYS.State; S.data.level = 60; S.data.xpIntoLevel = 0; S.emit();
      } }
  ];

  SQ.Subjects.manifest("phys", {
    css: [B + "css/phys.css"],
    scripts: DATA.concat(CORE, GENS, GAMES, SCREENS),
    boot: function () { boot(); PHYS.devActions = devActions; },
    importLegacy,
    sheet: () => sheet()
  });
})();
