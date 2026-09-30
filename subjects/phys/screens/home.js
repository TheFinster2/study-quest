/* The Lab — the landing screen. Streak, daily challenge, weekly quests, mastery,
   and a nudge towards whichever topic is currently weakest. */
window.PHYS = window.PHYS || {};
PHYS.Screens = PHYS.Screens || {};

PHYS.Screens.home = function (view) {
  const U = PHYS.U, S = PHYS.State, UI = PHYS.UI, B = PHYS.Bank;
  const d = S.data;
  const wrap = U.el("div", { class: "grid" });
  view.appendChild(wrap);

  /* ── hero ── */
  const acc = S.overallAccuracy();
  wrap.appendChild(U.el("div", { class: "hero" }, [
    U.el("h1", { text: greeting() + ", " + U.escapeHtml(d.profile.name) }),
    U.el("p", { html: d.stats.answered
      ? `<b>${d.stats.answered}</b> questions answered at <b>${acc}%</b>. ` +
        (acc >= 80 ? "That is Band 6 territory — keep it there."
         : acc >= 65 ? "Solid. The mistakes are where the marks are."
         : "Every wrong answer here is a mark saved in the exam.")
      : "A game-based trainer for <b>NSW HSC Physics</b>. Eleven modes, computed " +
        "questions with worked solutions, and an arcade you spend the winnings on." }),
    U.el("div", { class: "row" }, [
      U.el("button", { class: "btn btn-primary", text: "⚡ Rapid Fire",
                       on: { click: () => UI.go("/game/rapid") } }),
      U.el("button", { class: "btn", text: "🔢 Calculation Crunch",
                       on: { click: () => UI.go("/game/calc") } }),
      d.mistakes.length ? U.el("button", { class: "btn btn-ghost",
        text: "🩹 " + d.mistakes.length + " to fix",
        on: { click: () => UI.go("/game/rehab") } }) : null
    ])
  ]));

  /* ── quick stats ── */
  const stats = U.el("div", { class: "grid g4" });
  [
    ["Level", d.level], ["Streak", d.streak.count + "🔥"],
    ["Accuracy", acc + "%"], ["Joules", d.coins]
  ].forEach(([lbl, val]) => {
    stats.appendChild(U.el("div", { class: "card stat-tile" }, [
      U.el("div", { class: "stat-num", text: String(val) }),
      U.el("div", { class: "stat-lbl", text: lbl })
    ]));
  });
  wrap.appendChild(stats);

  /* ── due flashcards and leeches ── */
  const dueNow = S.dueCards().length, leechList = S.leeches().filter(x => B.covered(x.q.mod));
  wrap.appendChild(U.el("div", { class: "card daily" }, [
    U.el("div", { class: "daily-ico", text: "🃏" }),
    U.el("div", { class: "daily-body" }, [
      U.el("h3", { text: dueNow ? dueNow + " flashcards due" : "No flashcards due" }),
      U.el("p", { class: "tiny muted", text: leechList.length
        ? leechList.length + " leech" + (leechList.length === 1 ? "" : "es") + " — cards missed four times or more. Worth a different approach."
        : "Graded review: again, hard, good or easy." })
    ]),
    U.el("button", { class: "btn btn-sm" + (dueNow ? " btn-primary" : ""), text: dueNow ? "Review" : "Study",
      on: { click: () => UI.go(dueNow ? "/study/deck/due" : "/study") } })
  ]));

  /* ── daily challenge ── */
  const daily = S.daily();
  const spec = daily.spec;
  const modeNames = {
    rapid: "Rapid Fire", drill: "Module Drill", fbd: "Free-Body Builder",
    formula: "Formula Match", graph: "Graph Story", calc: "Calculation Crunch",
    unitgrid: "Unit Grid", bench: "Circuit Bench", chain: "Derivation Chain"
  };
  const complete = daily.progress >= spec.target;
  wrap.appendChild(U.el("h2", {}, [
    U.el("span", { text: "Daily challenge" }),
    U.el("span", { class: "h2-sub", text: "resets at midnight" })
  ]));
  wrap.appendChild(U.el("div", { class: "card daily" }, [
    U.el("div", { class: "daily-ico", text: daily.claimed ? "✅" : complete ? "🎁" : "📅" }),
    U.el("div", { class: "daily-body" }, [
      U.el("h3", { text: modeNames[spec.mode] || spec.mode }),
      U.el("p", { class: "tiny muted", text: daily.claimed
        ? "Claimed. Come back tomorrow."
        : `Reach ${spec.target} in ${modeNames[spec.mode]} · ${spec.xp} XP and ${spec.reward} ⚡` }),
      U.el("div", { class: "bar" }, [
        U.el("i", { style: "width:" + U.clamp((daily.progress / spec.target) * 100, 0, 100) + "%" })
      ]),
      U.el("div", { class: "tiny muted", style: "margin-top:5px",
                    text: daily.progress + " / " + spec.target })
    ]),
    daily.claimed
      ? null
      : complete
        ? U.el("button", { class: "btn btn-primary btn-sm", text: "Claim",
            on: { click: () => { if (S.claimDaily()) { PHYS.FX.confetti(110); UI.handleRoute(); } } } })
        : U.el("button", { class: "btn btn-sm", text: "Play",
            on: { click: () => UI.go("/game/" + spec.mode) } })
  ]));

  /* ── weekly quests ── */
  const quests = S.weeklyQuests();
  wrap.appendChild(U.el("h2", {}, [
    U.el("span", { text: "This week" }),
    U.el("span", { class: "h2-sub", text: S.weekKey() })
  ]));
  const qGrid = U.el("div", { class: "grid g2" });
  quests.forEach(e => {
    qGrid.appendChild(U.el("div", { class: "card daily" }, [
      U.el("div", { class: "daily-ico", text: e.claimed ? "✅" : e.quest.icon }),
      U.el("div", { class: "daily-body" }, [
        U.el("h3", { text: e.quest.name }),
        U.el("p", { class: "tiny muted", text: e.quest.desc }),
        U.el("div", { class: "bar" }, [
          U.el("i", { style: "width:" + U.clamp((e.done / e.target) * 100, 0, 100) + "%" })
        ]),
        U.el("div", { class: "tiny muted", style: "margin-top:5px",
                      text: e.done + " / " + e.target })
      ]),
      e.complete && !e.claimed
        ? U.el("button", { class: "btn btn-primary btn-sm", text: "Claim",
            on: { click: () => { if (S.claimQuest(e.quest.id)) { PHYS.FX.confetti(90); UI.handleRoute(); } } } })
        : null
    ]));
  });
  wrap.appendChild(qGrid);

  /* ── the weakest topics ── */
  const weak = S.weakTopics(3);
  if (weak.length) {
    wrap.appendChild(U.el("h2", { text: "Worth a look" }));
    const card = U.el("div", { class: "card" });
    card.appendChild(U.el("p", { class: "tiny muted", text:
      "Your lowest-accuracy topics, from at least four attempts each. The adaptive draw " +
      "already favours these, but a targeted drill is faster." }));
    weak.forEach(w => {
      card.appendChild(U.el("div", { class: "mastery-item" }, [
        U.el("div", { class: "mastery-badge", text: w.mod }),
        U.el("div", { class: "mastery-body" }, [
          U.el("div", { class: "mastery-name", text: w.topic }),
          U.el("div", { class: "bar" }, [
            U.el("i", { style: "width:" + Math.round(w.acc * 100) + "%" })
          ])
        ]),
        U.el("div", { class: "mastery-pct", text: Math.round(w.acc * 100) + "%" }),
        U.el("button", { class: "btn btn-sm btn-ghost", text: "Drill",
                         on: { click: () => UI.go("/game/drill/" + w.mod) } })
      ]));
    });
    wrap.appendChild(card);
  }

  /* ── mastery by module ── */
  wrap.appendChild(U.el("h2", {}, [
    U.el("span", { text: "Mastery" }),
    U.el("span", { class: "h2-sub", text: B.all().length + " authored + " +
                                          PHYS.Gen.count + " generators" })
  ]));
  const mCard = U.el("div", { class: "card" });
  B.statsByModule().forEach(m => {
    const tier = S.masteryTier(m.mastery);
    mCard.appendChild(U.el("div", { class: "mastery-item" }, [
      U.el("div", { class: "mastery-badge", text: m.icon }),
      U.el("div", { class: "mastery-body" }, [
        U.el("div", { class: "mastery-name", text: `${m.id} · ${m.short}` }),
        U.el("div", { class: "bar" }, [U.el("i", { style: "width:" + m.mastery + "%" })])
      ]),
      U.el("div", { class: "mastery-pct " + tier.cls, text: m.mastery + "%" }),
      U.el("button", { class: "btn btn-sm btn-ghost", text: "▸",
                       title: "Drill " + m.short,
                       on: { click: () => UI.go("/game/drill/" + m.id) } })
    ]));
  });
  wrap.appendChild(mCard);

  wrap.appendChild(U.el("div", { class: "row" }, [
    U.el("button", { class: "btn btn-ghost btn-sm", text: "⚙️ Physics options", on: { click: () => UI.go("/options") } }),
    U.el("button", { class: "btn btn-ghost btn-sm", text: "📖 Reference sheet", on: { click: () => UI.go("/reference") } })
  ]));

  function greeting() {
    const h = new Date().getHours();
    if (h < 5) return "Still up";
    if (h < 12) return "Morning";
    if (h < 17) return "Afternoon";
    if (h < 22) return "Evening";
    return "Late one";
  }
};
