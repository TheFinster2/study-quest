/* Achievements and the subject Options screen (the app owns Settings and the profile). */
window.MX = window.MX || {};
MX.Screens = MX.Screens || {};

/* ── achievements ─────────────────────────────────────────── */
MX.Screens.achievements = function (view) {
  const U = MX.U, S = MX.State, UI = MX.UI;
  const all = MX.DATA.enabledAchievements();
  const done = all.filter(a => S.data.achievements[a.id]);

  view.appendChild(U.el("h1", { text: "Achievements" }));
  view.appendChild(U.el("p", { html:
    `<b>${done.length}</b> of <b>${all.length}</b> unlocked. ` +
    "" }));
  view.appendChild(U.el("div", { class: "bar", style: "margin-bottom:16px" },
    [U.el("i", { style: `width:${U.pct(done.length, all.length)}%` })]));

  const grid = U.el("div", { class: "grid g2" });
  // Unlocked first, then locked — the wall of grey is less discouraging that way.
  all.slice().sort((a, b) => (S.data.achievements[b.id] ? 1 : 0) - (S.data.achievements[a.id] ? 1 : 0))
    .forEach(a => {
      const unlocked = !!S.data.achievements[a.id];
      grid.appendChild(U.el("div", { class: "ach " + (unlocked ? "done" : "locked") }, [
        U.el("div", { class: "ach-ico", text: unlocked ? a.icon : "🔒" }),
        U.el("div", { class: "ach-body" }, [
          U.el("div", { class: "ach-name", text: a.name }),
          U.el("div", { class: "ach-desc", text: a.desc })
        ]),
        a.reward ? U.el("div", { class: "ach-rew", text: "+" + a.reward + " 🔢" }) : null
      ]));
    });
  view.appendChild(grid);
};

/* ── options: the subject-only settings ────────────────────────
   Lives on #/s/mext/options because #/settings is the app's. The one setting
   MathQuest had that is genuinely subject-specific — which syllabus tiers you
   study — was a build-time constant in the stand-alone app. It is a live toggle
   here: switching it filters questions, cards, formulas, proofs, generators,
   reference sheets, modes, bosses and achievements immediately, and (the
   shared coverage rule) never changes what anything pays. */
MX.Screens.options = function (view) {
  const U = MX.U, S = MX.State, UI = MX.UI;

  view.appendChild(U.el("h1", { text: "Maths Extension 1 options" }));
  view.appendChild(U.el("p", { class: "muted", html:
    "Sound, motion, text size and your save file are in the app's " +
    `<a href="${UI.href("/settings")}">Settings</a>. Difficulty is in the ` +
    `<a href="${UI.href("/shop")}">Maths Extension 1 shop</a>.` }));

  view.appendChild(U.el("h2", {}, [
    document.createTextNode("Syllabus"),
    U.el("span", { class: "h2-sub", text: "what you study, not how hard it scores" })
  ]));
  /* Advanced and Extension 1 are separate subjects now, each with its own levels,
     coins and shop; this subject holds one tier only. */
  view.appendChild(U.el("div", { class: "card" }, [
    U.el("p", { class: "muted", html: "This subject is <b>Mathematics Extension 1</b>. The Advanced course every Extension 1 student also sits is its own subject." }),
    U.el("a", { class: "btn btn-sm btn-ghost", href: "#/s/madv/home", text: "Open Maths Extension 1 →" })
  ]));

  view.appendChild(U.el("h2", { text: "What you are studying" }));
  const row = (label, value) => U.el("div", { class: "srow" }, [
    U.el("div", { class: "srow-body" }, [U.el("div", { style: "font-weight:700; font-size:13.5px", text: label })]),
    U.el("div", { class: "tiny muted", style: "text-align:right", text: value })
  ]);
  view.appendChild(U.el("div", { class: "card" }, [
    row("Syllabus tiers", MX.DATA.TIERS.map(t => MX.DATA.TIER_META[t].name).join(" + ")),
    row("Questions", MX.Bank.all().length.toLocaleString()),
    row("Flashcards", String(MX.Cards.all().length)),
    row("Generators", String(MX.Gen.enabled().length)),
    row("Proof puzzles", String(MX.Proofs.all().length)),
    row("Formulas", String(MX.Formulas.all().length)),
    row("Reference sheets", String(MX.Reference.all().length)),
    row("Achievements", String(MX.DATA.enabledAchievements().length))
  ]));

  view.appendChild(U.el("button", { class: "btn btn-ghost btn-block", style: "margin-top:14px",
    text: "← Progress", on: { click: () => UI.go("/progress") } }));
};
