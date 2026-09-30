/* Progress: mastery, the XP heat map, per-mode bests, mistakes, and Ascend. */
window.PHYS = window.PHYS || {};
PHYS.Screens = PHYS.Screens || {};

PHYS.Screens.progress = function (view) {
  const U = PHYS.U, S = PHYS.State, UI = PHYS.UI, B = PHYS.Bank;
  const d = S.data;
  const wrap = U.el("div", { class: "grid" });
  view.appendChild(wrap);

  wrap.appendChild(U.el("h1", { text: "Progress" }));

  const stats = U.el("div", { class: "grid g4" });
  [
    ["Lifetime XP", (d.lifetimeXp || 0).toLocaleString()],
    ["Answered", d.stats.answered],
    ["Accuracy", S.overallAccuracy() + "%"],
    ["Best streak", d.stats.bestStreak],
    ["Perfect runs", d.stats.perfectRuns],
    ["Bosses", Object.keys(d.bossesBeaten).length + "/5"],
    ["Cards mastered", d.stats.cardsMastered],
    ["Longest daily", d.streak.longest + "🔥"]
  ].forEach(([lbl, val]) => {
    stats.appendChild(U.el("div", { class: "card stat-tile" }, [
      U.el("div", { class: "stat-num", text: String(val) }),
      U.el("div", { class: "stat-lbl", text: lbl })
    ]));
  });
  wrap.appendChild(stats);

  /* ── level ── */
  const need = S.xpNeeded(d.level);
  wrap.appendChild(U.el("h2", { text: "Level " + d.level + " · " + S.levelTitle(d.level) }));
  wrap.appendChild(U.el("div", { class: "card" }, [
    U.el("div", { class: "bar" }, [
      U.el("i", { style: "width:" + U.clamp((d.xpIntoLevel / need) * 100, 0, 100) + "%" })
    ]),
    U.el("p", { class: "tiny muted", style: "margin-top:8px", text:
      `${d.xpIntoLevel} / ${need} XP into this level. ` +
      (d.level >= S.MAX_LEVEL ? "You are at the ceiling — Ascend below."
        : `Next: ${S.levelTitle(d.level + 1)}.`) }),
    d.prestige ? U.el("p", { class: "tiny", style: "color:var(--warn)", text:
      `Ascended ${d.prestige}× · +${d.prestige * 12}% XP permanently` }) : null,
    S.canPrestige() ? U.el("button", {
      class: "btn btn-primary btn-block", style: "margin-top:10px", text: "🔱 Ascend",
      on: { click: () => UI.confirmDialog("Ascend?",
        "Your level resets to 1 and your XP to zero. You keep everything else — Joules, themes, " +
        "cards, achievements, stats — and gain a permanent <b>+12% XP</b>, 2500 ⚡ and three " +
        "Double XP power-ups.",
        () => { if (S.doPrestige()) { PHYS.FX.confetti(200); PHYS.Sound.levelUp(); UI.handleRoute(); } },
        "Ascend") }
    }) : null
  ]));

  /* ── mastery ── */
  wrap.appendChild(U.el("h2", { text: "Mastery by module" }));
  const mCard = U.el("div", { class: "card" });
  B.statsByModule().forEach(m => {
    const tier = S.masteryTier(m.mastery);
    mCard.appendChild(U.el("div", { class: "mastery-item" }, [
      U.el("div", { class: "mastery-badge", text: m.icon }),
      U.el("div", { class: "mastery-body" }, [
        U.el("div", { class: "mastery-name", text:
          `${m.id} · ${m.name}` + (m.year === 12 ? "  (Y12)" : "") }),
        U.el("div", { class: "bar" }, [U.el("i", { style: "width:" + m.mastery + "%" })]),
        U.el("div", { class: "tiny muted", style: "margin-top:4px", text:
          `${m.correct}/${m.seen} correct · ${m.accuracy}% · ${tier.name}` })
      ]),
      U.el("div", { class: "mastery-pct " + tier.cls, text: m.mastery + "%" })
    ]));
  });
  mCard.appendChild(U.el("p", { class: "tiny muted", style: "margin-top:10px", text:
    "Mastery is confidence-weighted: 100% over three questions does not read as mastered, " +
    "because it should not." }));
  wrap.appendChild(mCard);

  /* ── heat map ── */
  wrap.appendChild(U.el("h2", {}, [
    U.el("span", { text: "The last 12 weeks" }),
    U.el("span", { class: "h2-sub", text: "XP per day" })
  ]));
  const heat = U.el("div", { class: "heat" });
  const today = new Date();
  const values = [];
  for (let i = 83; i >= 0; i--) {
    const dt = new Date(today);
    dt.setDate(dt.getDate() - i);
    values.push({ key: U.dayKey(dt), xp: d.history[U.dayKey(dt)] || 0 });
  }
  const peak = Math.max.apply(null, values.map(v => v.xp).concat([1]));
  values.forEach(v => {
    const lv = v.xp === 0 ? 0 : Math.min(4, 1 + Math.floor((v.xp / peak) * 3.99));
    heat.appendChild(U.el("div", { class: "heat-day", data: { lv: String(lv) },
                                   title: v.key + ": " + v.xp + " XP" }));
  });
  wrap.appendChild(U.el("div", { class: "card" }, [heat]));

  /* ── personal bests ── */
  const scores = Object.entries(d.scores);
  if (scores.length) {
    wrap.appendChild(U.el("h2", { text: "Personal bests" }));
    const grid = U.el("div", { class: "grid g3" });
    const NAMES = {
      rapid: "Rapid Fire", drill: "Module Drill", survival: "Survival", rehab: "Mistake Rehab",
      calc: "Calculation Crunch", fbd: "Free-Body Builder", formula: "Formula Match",
      graph: "Graph Story", unitgrid: "Unit Grid", bench: "Circuit Bench", chain: "Derivation Chain"
    };
    scores.sort((a, b) => b[1] - a[1]).forEach(([k, v]) => {
      const base = k.split(":")[0];
      const mod = k.split(":")[1];
      grid.appendChild(U.el("div", { class: "card stat-tile" }, [
        U.el("div", { class: "stat-num", text: String(v) }),
        U.el("div", { class: "stat-lbl", text: (NAMES[base] || base) + (mod ? " · " + mod : "") })
      ]));
    });
    wrap.appendChild(grid);
  }

  /* ── mistakes ── */
  wrap.appendChild(U.el("h2", {}, [
    U.el("span", { text: "Still getting these wrong" }),
    U.el("span", { class: "h2-sub", text: d.mistakes.length + " tracked" })
  ]));
  if (!d.mistakes.length) {
    wrap.appendChild(U.el("div", { class: "card" }, [
      U.el("p", { class: "muted", text: "Nothing outstanding. Either you are very good or you " +
                                        "have not played enough yet." })
    ]));
  } else {
    const list = U.el("div", {});
    d.mistakes.slice(0, 14).forEach(m => {
      if (m.gen) {
        const t = PHYS.Gen.byId(m.template);
        list.appendChild(U.el("div", { class: "wrongq" }, [
          U.el("div", { class: "q", text: (t ? t.ask : m.template) +
            "  ·  " + B.moduleName(m.mod) + " · missed " + m.misses + "×" }),
          m.why ? U.el("div", { class: "a", html: "Last time you " + U.math(m.why) + "." }) : null
        ]));
      } else {
        const q = B.byId(m.id);
        if (!q) return;
        list.appendChild(U.el("div", { class: "wrongq" }, [
          U.el("div", { class: "q", html: U.math(q.q) }),
          U.el("div", { class: "a", html: "Answer: " + U.math(q.choices[q.a]) +
            "  ·  missed " + m.misses + "×" })
        ]));
      }
    });
    wrap.appendChild(list);
    wrap.appendChild(U.el("button", { class: "btn btn-primary btn-block", text: "🩹 Rehabilitate these",
                                      on: { click: () => UI.go("/game/rehab") } }));
  }

  wrap.appendChild(U.el("button", { class: "btn btn-ghost btn-block", style: "margin-top:14px",
    text: "⚙️ Physics options — significant figures, what you study",
    on: { click: () => UI.go("/options") } }));
  wrap.appendChild(U.el("button", { class: "btn btn-ghost btn-block", style: "margin-top:8px",
    text: "🏆 Achievements (" + Object.keys(d.achievements).length + "/" +
          PHYS.DATA.achievements.length + ")",
    on: { click: () => UI.go("/achievements") } }));
};
