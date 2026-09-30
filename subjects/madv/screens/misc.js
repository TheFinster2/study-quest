/* Achievements and the subject Options screen (the app owns Settings and the profile). */
window.MA = window.MA || {};
MA.Screens = MA.Screens || {};

/* ── achievements ─────────────────────────────────────────── */
MA.Screens.achievements = function (view) {
  const U = MA.U, S = MA.State, UI = MA.UI;
  const all = MA.DATA.enabledAchievements();
  const done = all.filter(a => S.data.achievements[a.id]);

  view.appendChild(U.el("h1", { text: "Achievements" }));
  view.appendChild(U.el("p", { html:
    `<b>${done.length}</b> of <b>${all.length}</b> unlocked. ` +
    (MA.DATA.hasExt() ? "" : "Extension 1 achievements are hidden while Extension 1 is switched off in Options.") }));
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
   Lives on #/s/madv/options because #/settings is the app's. The one setting
   MathQuest had that is genuinely subject-specific — which syllabus tiers you
   study — was a build-time constant in the stand-alone app. It is a live toggle
   here: switching it filters questions, cards, formulas, proofs, generators,
   reference sheets, modes, bosses and achievements immediately, and (the
   shared coverage rule) never changes what anything pays. */
MA.Screens.options = function (view) {
  const U = MA.U, S = MA.State, UI = MA.UI;

  view.appendChild(U.el("h1", { text: "Maths Advanced options" }));
  view.appendChild(U.el("p", { class: "muted", html:
    "Sound, motion, text size and your save file are in the app's " +
    `<a href="${UI.href("/settings")}">Settings</a>. Difficulty is in the ` +
    `<a href="${UI.href("/shop")}">Maths Advanced shop</a>.` }));

  view.appendChild(U.el("h2", {}, [
    document.createTextNode("Syllabus"),
    U.el("span", { class: "h2-sub", text: "what you study, not how hard it scores" })
  ]));
  const on = S.studiesExt();
  const sw = U.el("button", { class: "switch" + (on ? " on" : ""), type: "button", role: "switch",
    "aria-checked": on ? "true" : "false", "aria-label": "I study Extension 1" });
  sw.addEventListener("click", () => {
    const next = !S.studiesExt();
    S.setStudiesExt(next);
    MA.Sound.equip();
    UI.toast({ icon: next ? "🧩" : "📘", text: next
      ? "<b>Extension 1 on.</b> Vector Lab, the Induction Builder and The Inductor are back."
      : "<b>Advanced only.</b> Extension 1 content is hidden — your progress in it is kept." });
    UI.handleRoute();
  });
  view.appendChild(U.el("div", { class: "card" }, [
    U.el("div", { class: "srow" }, [
      U.el("div", { class: "srow-body" }, [
        U.el("div", { style: "font-weight:700; font-size:13.5px", text: "I study Extension 1" }),
        U.el("div", { class: "tiny muted", text:
          "On: Advanced + Extension 1. Off: the ME- questions, flashcards, formulas, proofs, generators and " +
          "reference sheets drop out, along with Vector Lab, the Induction Builder, The Inductor and the " +
          "Extension achievements. Nothing you have earned is lost, and nothing pays differently." })
      ]),
      sw
    ])
  ]));

  view.appendChild(U.el("h2", { text: "What you are studying" }));
  const row = (label, value) => U.el("div", { class: "srow" }, [
    U.el("div", { class: "srow-body" }, [U.el("div", { style: "font-weight:700; font-size:13.5px", text: label })]),
    U.el("div", { class: "tiny muted", style: "text-align:right", text: value })
  ]);
  view.appendChild(U.el("div", { class: "card" }, [
    row("Syllabus tiers", MA.DATA.TIERS.map(t => MA.DATA.TIER_META[t].name).join(" + ")),
    row("Questions", MA.Bank.all().length.toLocaleString()),
    row("Flashcards", String(MA.Cards.all().length)),
    row("Generators", String(MA.Gen.enabled().length)),
    row("Proof puzzles", String(MA.Proofs.all().length)),
    row("Formulas", String(MA.Formulas.all().length)),
    row("Reference sheets", String(MA.Reference.all().length)),
    row("Achievements", String(MA.DATA.enabledAchievements().length))
  ]));

  view.appendChild(U.el("button", { class: "btn btn-ghost btn-block", style: "margin-top:14px",
    text: "← Progress", on: { click: () => UI.go("/progress") } }));
};
