/* Chemistry (MoleQuest) — manifest. Scripts load in dependency order (the order IS
   the dependency graph): content, then the subject's own core, then modes, then
   screens. boot() registers routes, the reference sheet and dev presets. */
(function () {
  const B = "subjects/chem/";
  const DATA = ["ions", "questions-y11", "questions-m5", "questions-m6", "questions-m7", "questions-m8",
    "questions-extra", "questions-extra2", "questions-m1a", "questions-m2a", "questions-m3a", "questions-m4a",
    "questions-m5a", "questions-m5b", "questions-m6a", "questions-m6b", "questions-m7a", "questions-m7b",
    "questions-m8a", "questions-m8b", "equations", "organic", "coverage", "flashcards", "flashcards-y11",
    "flashcards-y12", "shop", "achievements"];
  const CORE = ["util", "audio", "fx", "state", "bank", "ui"];
  const GAMES = ["quiz", "balance", "ionmatch", "naming", "calc", "titration", "pathway", "precipitate", "boss", "survival"];
  const SCREENS = ["home", "play", "study", "progress", "shop", "achievements"];

  /* ── the reference sheet ──────────────────────────────────────
     free:true  = on the NESA HSC Chemistry data sheet (or its formulae page), so
                  looking it up mid-run costs nothing — you get it in the exam.
     free:false = MoleQuest showed it but the exam does NOT hand it to you; it's
                  memorise-yourself content, so revealing it costs (−10 %, latched,
                  capped at −30 % — the core's rule). Replaces MoleQuest's flat −20 %
                  for opening the sheet at all. */
  function buildSheet() {
    const U = CHEM.U, D = CHEM.DATA;
    const f = s => U.formula(s);
    const table = (heads, rows) =>
      `<table class="ref-table"><tr>${heads.map(h => `<th>${h}</th>`).join("")}</tr>` +
      rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join("")}</tr>`).join("") + "</table>";
    const line = (id, name, body, free, note) => ({ id, name, body, free, note });

    const SOL = D.solubility;
    const solGrid = table([""].concat(SOL.anions.map(a => f(a.sym))),
      SOL.cations.map(ct => [f(ct.sym)].concat(SOL.anions.map(an => SOL.grid[ct.sym][an.sym] ? "sol" : "ppt"))));

    return {
      title: "HSC Chemistry data sheet",
      render: html => html,
      constants: [
        { id: "NA", name: "Avogadro constant", symbol: "Nₐ", value: 6.022e23, unit: "mol⁻¹", free: true },
        { id: "Vm0", name: "Molar volume of an ideal gas, 100 kPa, 0 °C", symbol: "Vₘ", value: 22.71, unit: "L mol⁻¹", free: true },
        { id: "Vm25", name: "Molar volume of an ideal gas, 100 kPa, 25 °C", symbol: "Vₘ", value: 24.79, unit: "L mol⁻¹", free: true },
        { id: "R", name: "Gas constant", symbol: "R", value: 8.314, unit: "J mol⁻¹ K⁻¹", free: true },
        { id: "Kw", name: "Ionisation constant for water, 25 °C", symbol: "K_w", value: 1.0e-14, unit: "", free: true },
        { id: "cwater", name: "Specific heat capacity of water", symbol: "c", value: 4.18e3, unit: "J kg⁻¹ K⁻¹", free: true }
      ],
      sections: [
        { id: "formulae", title: "Formulae", items: [
          line("f-nmM", "Moles from mass", "n = m / MM", true),
          line("f-cnV", "Concentration", "c = n / V", true),
          line("f-pv", "Ideal gas law", "PV = nRT", true),
          line("f-q", "Heat", "q = mcΔT", true),
          line("f-dh", "Enthalpy of reaction", "ΔH = −q / n", true,
            "Uncertain call: printed on the formulae page in recent papers."),
          line("f-dg", "Gibbs free energy", "ΔG° = ΔH° − TΔS°", true),
          line("f-ph", "pH", "pH = −log₁₀[H⁺]", true),
          line("f-pka", "pKa", "pKa = −log₁₀[Ka]", true),
          line("f-beer", "Beer–Lambert", "A = εlc = log₁₀(I₀/I)", true),
          line("f-dil", "Dilution", "c₁V₁ = c₂V₂", true, "Uncertain call: on the formulae page in recent papers; well worth knowing anyway."),
          line("f-nvm", "Moles of gas", "n = V / Vₘ", true, "Follows from the molar volumes printed on the sheet."),
          line("f-poh", "pOH", "pOH = −log₁₀[OH⁻]", false, "Not printed — derive it or learn it."),
          line("f-phpoh", "pH + pOH", "pH + pOH = 14 (25 °C)", false, "Not printed; follows from Kw, which is."),
          line("f-weak", "Weak acid approximation", "[H₃O⁺] ≈ √(Ka × c)", false),
          line("f-kexp", "Equilibrium expression", "K = [products]ᶜ / [reactants]ᵃ;  Q < K → shifts right", false),
          line("f-ksp", "Solubility product", "Ksp = [Aⁿ⁺]ˣ[Bᵐ⁻]ʸ", false, "The expression is not printed; Ksp VALUES are (see below)."),
          line("f-comb", "Combined gas law", "P₁V₁/T₁ = P₂V₂/T₂;  T(K) = °C + 273.15", false),
          line("f-ppm", "ppm and % yield", "ppm = mg L⁻¹;  % yield = actual / theoretical × 100", false)
        ].map(x => Object.assign(x, { body: f(x.body) })) },
        { id: "equilibrium", title: "Acids, indicators and solubility", items: [
          line("t-ka", "Acid strengths (Ka / pKa)", table(["Acid", "Ka", "pKa"],
            D.acidStrengths.map(a => [a.acid, typeof a.ka === "number" ? a.ka.toExponential(1) : a.ka,
              a.pka === null ? "—" : a.pka.toFixed(2)])), true,
            "The sheet's 'aqueous equilibrium constants' table gives Ka for common weak acids. Judgement call: the strong-acid rows and a few ions here may not all be printed."),
          line("t-ind", "Indicators (colour change and pH range)", table(["Indicator", "pH range", "Acid", "Base"],
            D.indicators.map(i => [i.name, i.range, i.acid, i.base])), true,
            "On the sheet. Which indicator suits which titration is NOT — that is your job."),
          line("t-indUse", "Choosing an indicator", table(["Indicator", "Best for"], D.indicators.map(i => [i.name, i.use])), false),
          line("t-sol", "Solubility rules (qualitative)", solGrid, false,
            "Judgement call: the sheet gives Ksp values for some salts, not a soluble/insoluble grid. The rules are memorise-yourself.")
        ] },
        { id: "identification", title: "Identifying ions (memorise these)", items: [
          line("t-flame", "Flame test colours", table(["Cation", "Flame"], D.flameTests.map(x => [f(x.cation), x.colour])), false,
            "Not on the data sheet."),
          line("t-naoh", "Reaction with NaOH", table(["Cation", "Observation"], D.hydroxideTests.map(x => [f(x.cation), x.obs])), false,
            "Not on the data sheet."),
          line("t-ions", "Polyatomic ions", table(["Name", "Formula", "Charge"],
            D.ions.filter(i => i.tier === 1).map(i => [i.name, f(i.formula), i.charge > 0 ? "+" + i.charge : String(i.charge)])), false,
            "Not on the data sheet — you are expected to know these.")
        ] }
      ]
    };
  }

  /* ── MoleQuest's old save → the Chemistry slot ────────────── */
  const PU = { catalyst: "double", adrenaline: "revive", buffer: "shield", pass: "skip" };
  function importLegacy(old) {
    if (!old || typeof old !== "object") return null;
    const keep = ["xp", "level", "xpIntoLevel", "coins", "prestige", "lifetimeXp", "stats", "modules",
      "modesPlayed", "pathwaysSolved", "bossesBeaten", "srs", "mistakes", "achievements", "history", "scores"];
    const slot = {};
    keep.forEach(k => { if (old[k] !== undefined) slot[k] = JSON.parse(JSON.stringify(old[k])); });
    const st = old.settings || {};
    const theme = old.profile && old.profile.theme ? "chem-" + old.profile.theme : null;
    slot.settings = { difficulty: st.difficulty || "standard", hidden: st.hidden || {}, theme };
    const inventory = {};
    Object.keys(old.inventory || {}).forEach(k => {
      const id = PU[k] || k;
      inventory[id] = (inventory[id] || 0) + (old.inventory[k] || 0);
    });
    const owned = old.owned || {};
    return {
      slot,
      inventory,
      themes: (owned.themes || []).map(t => "chem-" + t),
      avatars: (owned.avatars || []).slice(),
      profile: old.profile ? { name: old.profile.name, avatar: old.profile.avatar } : undefined
    };
  }

  function boot() {
    const UI = CHEM.UI, Sc = CHEM.Screens;
    UI.route("home",         view => Sc.home(view));
    UI.route("play",         view => Sc.play.screen(view));
    UI.route("game",   (view, args) => Sc.play.dispatch(view, args));
    UI.route("study",  (view, args) => Sc.study.screen(view, args));
    UI.route("progress",     view => Sc.progress(view));
    UI.route("shop",         view => Sc.shop(view));
    UI.route("achievements", view => Sc.achievements(view));
    UI.route("options",      view => Sc.options(view));

    SQ.Tools.registerSheet("chem", buildSheet());

    const S = CHEM.State;
    CHEM.devActions = [
      { label: "Chem: +5,000 Moles", run() { S.addCoins(5000); } },
      { label: "Chem: jump to level 60", run() { S.data.level = 60; S.data.xpIntoLevel = 0; S.emit(); } },
      { label: "Chem: seed 8 mistakes", run() {
        CHEM.Bank.all().slice(0, 8).forEach(q => S.recordAnswer(q.mod, false, q.id)); S.emit(); } },
      { label: "Chem: make 3 leeches", run() {
        CHEM.Bank.cards().slice(0, 3).forEach(c => { for (let i = 0; i < 4; i++) S.reviewCard(c.id, "again"); }); S.emit(); } },
      { label: "Chem: beat every boss", run() {
        CHEM.Games.boss.BOSSES.forEach(b => (S.data.bossesBeaten[b.id] = Date.now())); S.emit(); } }
    ];
  }

  SQ.Subjects.manifest("chem", {
    css: [B + "css/chem.css"],   // css/themes.css is linked by index.html
    scripts: [].concat(
      DATA.map(n => B + "data/" + n + ".js"),
      CORE.map(n => B + "core/" + n + ".js"),
      GAMES.map(n => B + "games/" + n + ".js"),
      SCREENS.map(n => B + "screens/" + n + ".js")),
    boot,
    importLegacy
  });
})();
