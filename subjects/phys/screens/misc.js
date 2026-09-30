/* Options (the Physics-only settings), and achievements.

   The stand-alone Settings screen is gone: sound, motion, export/import, force
   refresh and the running build are the app's now (#/settings). What is left is
   what only Physics has — the significant-figure check and course coverage — so
   it lives on a subject route named `options`, because `/settings` is the app's.

   Coverage never changes a payout or an achievement target; it only decides what
   the adaptive draws, the flashcard queue and "Worth a look" pull from. An
   explicitly chosen module (a Module Drill, a boss) is always honoured. */
window.PHYS = window.PHYS || {};
PHYS.Screens = PHYS.Screens || {};

PHYS.Screens.options = function (view) {
  const U = PHYS.U, S = PHYS.State, UI = PHYS.UI, B = PHYS.Bank;
  const d = S.data;
  const wrap = U.el("div", { class: "grid" });
  view.appendChild(wrap);

  wrap.appendChild(U.el("h1", { text: "Physics options" }));
  wrap.appendChild(U.el("p", { class: "muted", html:
    "Settings that only apply to Physics. Sound, motion and your save are in the " +
    "<a href='" + UI.href("/settings") + "'>app settings</a>; difficulty is in the " +
    "<a href='" + UI.href("/shop") + "'>Physics shop</a>." }));

  /* ── marking ── */
  wrap.appendChild(U.el("h2", { text: "Marking" }));
  const mark = U.el("div", { class: "card" });
  mark.appendChild(toggleRow("Significant figures",
    "In Calculation Crunch, also tell me whether my answer carries the right number of " +
    "significant figures (±1, as HSC marking allows). Answers are still marked on the 2% " +
    "tolerance — never silently on significant figures — and payouts do not change.",
    S.sigFigOn(), v => S.setSigFig(v), "sigfig"));
  wrap.appendChild(mark);

  /* ── coverage ── */
  wrap.appendChild(U.el("h2", {}, [
    U.el("span", { text: "What you study" }),
    U.el("span", { class: "h2-sub", text: B.coveredModules().length + " / " + B.MODULES.length + " modules" })
  ]));
  const cov = U.el("div", { class: "card" });
  cov.appendChild(U.el("p", { class: "tiny muted", text:
    "Hide what is not in your course (or not examined yet). Hidden modules drop out of the " +
    "mixed draws, the due-card queue and the suggestions. Nothing about payouts changes, and " +
    "picking a module directly still works." }));
  cov.appendChild(toggleRow("Hide Year 11 (Modules 1–4)",
    "For Year 12: keep the mixed modes on what the HSC examines directly.",
    S.tagHidden("y11"), v => { S.setTagHidden("y11", v); UI.handleRoute(); }, "y11"));
  B.MODULES.forEach(m => {
    const y11off = m.year === 11 && S.tagHidden("y11");
    cov.appendChild(toggleRow(m.icon + "  " + m.id + " · " + m.name,
      y11off ? "Hidden with Year 11." : "Year " + m.year,
      !S.tagHidden(m.id), v => { S.setTagHidden(m.id, !v); UI.handleRoute(); }, m.id, y11off));
  });
  wrap.appendChild(cov);

  /* ── content counts, so the subject can be sanity-checked from inside ── */
  wrap.appendChild(U.el("div", { class: "card" }, [
    U.el("h3", { text: "What is loaded" }),
    U.el("p", { class: "tiny muted", html:
      `<b>${B.all().length}</b> authored questions · ` +
      `<b>${PHYS.Gen.count}</b> generator templates (each an unbounded family) · ` +
      `<b>${B.cards().length}</b> flashcards · ` +
      `<b>${PHYS.DATA.equations.length}</b> formulas · ` +
      `<b>${PHYS.DATA.constants.list().length}</b> constants · ` +
      `<b>${(PHYS.DATA.workedExamples || []).length}</b> worked examples` }),
    U.el("p", { class: "tiny muted", html:
      "Constants come from the NESA data sheet at the sheet's own precision. " +
      "<a href='" + PHYS.DATA.constants.SHEET_URL + "' target='_blank' rel='noopener'>The sheet.</a>" })
  ]));

  wrap.appendChild(U.el("div", { class: "row" }, [
    U.el("button", { class: "btn btn-ghost", text: "🏆 Achievements", on: { click: () => UI.go("/achievements") } }),
    U.el("span", { class: "spacer" }),
    U.el("button", { class: "btn btn-danger btn-sm", text: "Reset Physics progress",
      on: { click: () => UI.confirmDialog("Reset Physics?",
        "Your Physics level, Joules, cards, mastery and achievements go. Other subjects, Stars, " +
        "power-ups and cosmetics are kept. This cannot be undone.",
        () => { S.reset(); UI.go("/home"); }, "Reset", { danger: true }) } })
  ]));

  function toggleRow(title, desc, value, onChange, key, disabled) {
    const sw = U.el("div", { class: "switch" + (value ? " on" : ""), role: "switch",
                             tabindex: disabled ? "-1" : "0", "aria-checked": value ? "true" : "false",
                             "aria-label": title, "data-key": key });
    if (disabled) sw.style.opacity = ".4";
    const flip = () => {
      if (disabled) return;
      const next = !sw.classList.contains("on");
      sw.classList.toggle("on", next);
      sw.setAttribute("aria-checked", next ? "true" : "false");
      PHYS.Sound.click();
      onChange(next);
    };
    sw.addEventListener("click", flip);
    sw.addEventListener("keydown", e => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); flip(); } });
    return U.el("div", { class: "srow" }, [
      U.el("div", { class: "srow-body" }, [
        U.el("h3", { text: title }),
        U.el("p", { class: "tiny muted", text: desc })
      ]),
      sw
    ]);
  }
};

/* ── achievements ─────────────────────────────────────────────────────────── */
PHYS.Screens.achievements = function (view) {
  const U = PHYS.U, S = PHYS.State;
  const d = S.data;
  const wrap = U.el("div", { class: "grid" });
  view.appendChild(wrap);

  const total = PHYS.DATA.achievements.length;
  const done = Object.keys(d.achievements).length;
  wrap.appendChild(U.el("h1", { text: "Achievements" }));
  wrap.appendChild(U.el("div", { class: "card" }, [
    U.el("div", { class: "bar" }, [U.el("i", { style: "width:" + (total ? (done / total) * 100 : 0) + "%" })]),
    U.el("p", { class: "tiny muted", style: "margin-top:8px", text: done + " of " + total + " unlocked" })
  ]));

  const list = U.el("div", { class: "grid" });
  const sorted = PHYS.DATA.achievements.slice().sort((a, b) => {
    const ad = d.achievements[a.id] ? 0 : 1, bd = d.achievements[b.id] ? 0 : 1;
    return ad - bd;
  });
  sorted.forEach(a => {
    const unlocked = !!d.achievements[a.id];
    list.appendChild(U.el("div", { class: "ach " + (unlocked ? "done" : "locked") }, [
      U.el("div", { class: "ach-ico", text: unlocked ? a.icon : "🔒" }),
      U.el("div", { class: "ach-body" }, [
        U.el("div", { class: "ach-name", text: a.name }),
        U.el("div", { class: "ach-desc", text: a.desc })
      ]),
      a.reward ? U.el("div", { class: "ach-rew", text: "+" + a.reward + " ⚡" }) : null
    ]));
  });
  wrap.appendChild(list);
};

