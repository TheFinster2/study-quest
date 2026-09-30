/* Achievements and Chemistry's own options (course coverage). App-wide settings —
   sound, motion, save import/export, updates — are the app's (#/settings). */
window.CHEM = window.CHEM || {};
CHEM.Screens = CHEM.Screens || {};

/* ── achievements ──────────────────────────────────────────── */
CHEM.Screens.achievements = function (view) {
  const U = CHEM.U, S = CHEM.State;
  const d = S.data;
  const stats = S.achievementStats();
  const list = CHEM.DATA.achievements;
  const done = list.filter(a => d.achievements[a.id]).length;

  view.appendChild(U.el("h1", { text: "Achievements" }));
  view.appendChild(U.el("p", { html: `<b>${done}</b> of ${list.length} unlocked.` }));
  view.appendChild(U.el("div", { class: "bar", style: "margin-bottom:18px" }, [
    U.el("i", { style: `width:${U.pct(done, list.length)}%` })
  ]));

  const sorted = list.slice().sort((a, b) => {
    const au = !!d.achievements[a.id], bu = !!d.achievements[b.id];
    return au === bu ? 0 : au ? -1 : 1;
  });

  const grid = U.el("div", { class: "grid g2" });
  sorted.forEach(a => {
    const unlocked = !!d.achievements[a.id];
    let progress = null;
    if (!unlocked && a.goal) {
      try {
        const [cur, max] = a.goal(stats);
        if (max) progress = U.el("div", { class: "bar", style: "margin-top:6px" }, [
          U.el("i", { style: `width:${U.pct(cur, max)}%` })
        ]);
      } catch (e) { /* a goal that can't be computed just shows no bar */ }
    }
    grid.appendChild(U.el("div", { class: "ach " + (unlocked ? "done" : "locked") }, [
      U.el("div", { class: "ach-ico", text: unlocked ? a.icon : "🔒" }),
      U.el("div", { class: "ach-body" }, [
        U.el("div", { class: "ach-name", text: a.name }),
        U.el("div", { class: "ach-desc", text: a.desc }),
        progress
      ]),
      a.reward ? U.el("div", { class: "ach-rew", text: "+" + a.reward + "🪙" }) : null
    ]));
  });
  view.appendChild(grid);
};

/* ── options: subject-only settings ─────────────────────────── */
CHEM.Screens.options = function (view) {
  const U = CHEM.U, S = CHEM.State, UI = CHEM.UI;

  view.appendChild(U.el("h1", { text: "Chemistry options" }));
  view.appendChild(U.el("p", { class: "muted", html:
    `Difficulty is in the <a href="${UI.href("/shop")}">Chemistry shop</a>; sound, motion and your save are in ` +
    `<a href="${UI.href("/settings")}">app settings</a>.` }));

  function toggleRow(title, desc, value, onChange) {
    const sw = U.el("div", { class: "switch" + (value ? " on" : ""), role: "switch", tabindex: "0",
      "aria-checked": value ? "true" : "false", "aria-label": title });
    const flip = () => {
      value = !value;
      sw.classList.toggle("on", value);
      sw.setAttribute("aria-checked", value ? "true" : "false");
      onChange(value);
    };
    sw.addEventListener("click", flip);
    sw.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); flip(); } });
    return U.el("div", { class: "srow" }, [
      U.el("div", { class: "srow-body" }, [U.el("div", { text: title }), U.el("div", { class: "tiny muted", text: desc })]),
      sw
    ]);
  }

  view.appendChild(U.el("h2", { text: "Course coverage" }));
  view.appendChild(U.el("p", { class: "tiny muted", text:
    "Schools finish modules at different times, so a trial exam may not include everything the " +
    "syllabus does. Switch off anything your class hasn't covered and it stops being asked — its " +
    "questions, flashcards, naming entries and (in Pathway Puzzle) its compounds and reagents. " +
    "Turning a topic off never changes what the rest is worth, and achievement targets still " +
    "count the whole bank." }));
  const cov = U.el("div", { class: "card" });
  CHEM.DATA.coverage.forEach(pack => {
    cov.appendChild(toggleRow(`${pack.name}  ·  ${pack.mod}`, pack.desc, !S.tagHidden(pack.id),
      on => S.setTagHidden(pack.id, !on)));
  });
  view.appendChild(cov);

  view.appendChild(U.el("h2", { text: "Reset Chemistry" }));
  view.appendChild(U.el("div", { class: "card" }, [
    U.el("p", { class: "tiny muted", text:
      "Clears Chemistry's level, Moles, stats, flashcards and mistakes. Your other subjects, Stars, " +
      "power-ups and owned themes are untouched." }),
    U.el("button", { class: "btn btn-sm btn-danger", text: "Reset Chemistry progress",
      on: { click: () => UI.confirmDialog("Reset Chemistry?", "This cannot be undone.",
        () => { S.reset(); UI.toast({ icon: "🧹", text: "Chemistry progress cleared." }); UI.go("/home"); },
        "Reset", { danger: true }) } })
  ]));
};
