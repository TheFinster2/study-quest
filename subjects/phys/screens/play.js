/* The Play screen — the mode picker — and the dispatcher for /game/<mode>/<arg>. */
window.PHYS = window.PHYS || {};
PHYS.Screens = PHYS.Screens || {};

PHYS.Screens.play = (function () {
  const U = PHYS.U, S = PHYS.State, UI = PHYS.UI, B = PHYS.Bank;

  const MODES = [
    { id: "rapid",    name: "Rapid Fire",         icon: "⚡", colour: "#4cc9f0",
      desc: "Two minutes, endless questions, a streak multiplier up to ×3.", tag: "2 min" },
    { id: "drill",    name: "Module Drill",       icon: "🎯", colour: "#8a5cff",
      desc: "Fifteen adaptive questions from one module. Picks your weak topics.",
      tag: "15 questions", needsModule: true },
    { id: "calc",     name: "Calculation Crunch", icon: "🔢", colour: "#3fe08a",
      desc: "Ten computed problems, typed answers, full worked solutions. Any equivalent unit accepted.",
      tag: "10 problems" },
    { id: "fbd",      name: "Free-Body Builder",  icon: "🧲", colour: "#ffcc55",
      desc: "Choose exactly the forces that act, then give the net force.", tag: "5 scenarios" },
    { id: "formula",  name: "Formula Match",      icon: "🧩", colour: "#ff6b81",
      desc: "Match quantity ↔ formula ↔ unit. Three-way, so knowing two does not help.",
      tag: "6 triples" },
    { id: "graph",    name: "Graph Story",        icon: "📈", colour: "#6fa8ff",
      desc: "Match a motion graph to its description — and the other way round.",
      tag: "8 graphs" },
    { id: "unitgrid", name: "Unit Grid",          icon: "📐", colour: "#c8b6ff",
      desc: "Fill a quantity × unit grid against the clock. Wrong taps cost you.",
      tag: "against the clock" },
    { id: "bench",    name: "Circuit Bench",      icon: "🔌", colour: "#2ee6ff",
      desc: "Take meter readings from a circuit, then compute the unknown.", tag: "3 circuits" },
    { id: "chain",    name: "Derivation Chain",   icon: "🔗", colour: "#ffb03a",
      desc: "Reach a target quantity from what you are given by choosing equations.",
      tag: "4 chains" },
    { id: "survival", name: "Survival",           icon: "💀", colour: "#e05cff",
      desc: "One life. The clock tightens every five questions.", tag: "one life" },
    { id: "rehab",    name: "Mistake Rehab",      icon: "🩹", colour: "#7dffa6",
      desc: "Only the questions you have got wrong before.", tag: "your misses" }
  ];

  function screen(view) {
    const wrap = U.el("div", { class: "grid" });
    view.appendChild(wrap);

    wrap.appendChild(U.el("h1", { text: "Play" }));
    wrap.appendChild(U.el("p", { class: "muted", text:
      "Eleven study modes. Every one of them pays XP and Joules for physics you actually know — " +
      "and nothing for tapping." }));

    const grid = U.el("div", { class: "grid g2" });
    MODES.forEach(m => {
      const rehabEmpty = m.id === "rehab" && !S.data.mistakes.length;
      const card = U.el("button", {
        class: "game-card" + (rehabEmpty ? " locked" : ""),
        style: "--gc:" + m.colour,
        disabled: rehabEmpty || undefined,
        on: { click: () => {
          if (rehabEmpty) return;
          if (m.needsModule) return pickModule(m);
          UI.go("/game/" + m.id);
        } }
      }, [
        U.el("div", { class: "game-ico", text: m.icon }),
        U.el("div", { class: "game-name", text: m.name }),
        U.el("div", { class: "game-desc", text: rehabEmpty
          ? "Nothing to rehabilitate yet — play a run and every miss lands here."
          : m.desc }),
        U.el("div", { class: "game-foot" }, [
          U.el("span", { text: m.tag }),
          U.el("span", { class: "spacer" }),
          S.data.scores[m.id] !== undefined
            ? U.el("span", { text: "🏆 " + S.data.scores[m.id] }) : null
        ])
      ]);
      grid.appendChild(card);
    });
    wrap.appendChild(grid);

    /* ── bosses ── */
    wrap.appendChild(U.el("h2", {}, [
      U.el("span", { text: "Exam Bosses" }),
      U.el("span", { class: "h2-sub", text: Object.keys(S.data.bossesBeaten).length + " / 5 beaten" })
    ]));
    const bossGrid = U.el("div", { class: "grid g2" });
    PHYS.Games.boss.BOSSES.forEach(b => {
      const locked = !PHYS.Games.boss.isUnlocked(b);
      const beaten = !!S.data.bossesBeaten[b.id];
      bossGrid.appendChild(U.el("button", {
        class: "game-card" + (locked ? " locked" : ""), style: "--gc:#ff6b81",
        disabled: locked || undefined,
        on: { click: () => { if (!locked) UI.go("/game/boss/" + b.id); } }
      }, [
        U.el("div", { class: "game-ico", text: locked ? "🔒" : b.icon }),
        U.el("div", { class: "game-name", text: b.name }),
        U.el("div", { class: "game-desc", text: locked ? PHYS.Games.boss.lockReason(b) : b.blurb }),
        U.el("div", { class: "game-foot" }, [
          U.el("span", { text: (b.mod ? B.moduleName(b.mod) : "all modules") }),
          U.el("span", { class: "spacer" }),
          beaten ? U.el("span", { text: "✅ beaten" }) : U.el("span", { text: b.hp + " HP" })
        ])
      ]));
    });
    wrap.appendChild(bossGrid);

    /* ── arcade pointer ── */
    wrap.appendChild(U.el("h2", { text: "The Arcade" }));
    wrap.appendChild(U.el("div", { class: "card daily" }, [
      U.el("div", { class: "daily-ico", text: "🕹️" }),
      U.el("div", { class: "daily-body" }, [
        U.el("h3", { text: "The shared arcade" }),
        U.el("p", { class: "tiny muted", text:
          "Pays nothing at all — no XP, no Joules, no achievements. Time is bought with Stars " +
          "in the general shop, and Physics skins are in the Physics shop." })
      ]),
      U.el("button", { class: "btn btn-primary btn-sm", text: "Open",
        on: { click: () => UI.go("/arcade") } })
    ]));
  }

  function pickModule(mode) {
    const box = U.el("div", {}, [
      U.el("h2", { text: mode.name }),
      U.el("p", { text: "Which module?" })
    ]);
    const grid = U.el("div", { class: "grid g2" });
    B.MODULES.forEach(m => {
      grid.appendChild(U.el("button", {
        class: "btn", style: "text-align:left",
        on: { click: () => { UI.closeModal(); UI.go("/game/" + mode.id + "/" + m.id); } }
      }, [U.el("span", { text: m.icon + "  " + m.id + " · " + m.short +
                               "  (" + S.mastery(m.id) + "%)" })]));
    });
    box.appendChild(grid);
    box.appendChild(U.el("button", {
      class: "btn btn-ghost btn-block", style: "margin-top:12px", text: "Any module",
      on: { click: () => { UI.closeModal(); UI.go("/game/" + mode.id); } }
    }));
    UI.modal(box);
  }

  /** /game/<mode>/<arg> */
  function dispatch(view, args) {
    const mode = args[0];
    const arg = args[1];
    const G = PHYS.Games;
    switch (mode) {
      case "rapid": case "drill": case "survival": case "rehab":
        return G.quiz.screen(view, mode, { mod: arg });
      case "calc":     return G.calc.screen(view, { mod: arg });
      case "fbd":      return G.fbd.screen(view, { mod: arg });
      case "formula":  return G.formula.screen(view, { mod: arg });
      case "graph":    return G.graph.screen(view);
      case "unitgrid": return G.unitgrid.screen(view, { mod: arg });
      case "bench":    return G.bench.screen(view);
      case "chain":    return G.chain.screen(view, { mod: arg });
      case "boss":     return G.boss.screen(view, { id: arg });
      default:         UI.go("/play");
    }
  }

  return { screen, dispatch, MODES };
})();
