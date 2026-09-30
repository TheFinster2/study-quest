/* Home — the Economics dashboard (daily, weekly, due cards, rehab, weak topics)
   and Play — the mode list, which is what the stand-alone app's home was.
   Modes come from the Run registry, never a hand list. */
(function (root) {
  "use strict";
  var ECON = root.ECON, U = ECON.U, UI = ECON.UI, S = ECON.State, R = ECON.Run;

  function modeName(id) { var m = R.byId(id); return m ? m.name : id; }
  function modeRoute(id) { var m = R.byId(id); return m ? (m.route === "/cards" ? "/play/flashcards" : m.route) : "/play"; }

  function levelCard() {
    var lv = S.levelInfo();
    return U.el("div", { class: "card" }, [
      U.el("div", { class: "spread" }, [
        U.el("div", {}, [
          U.el("div", { style: "font-size:20px;font-weight:800", text: greeting() }),
          U.el("div", { class: "muted2", text: SQ.Store.data.streak.count
            ? U.plural(SQ.Store.data.streak.count, "day") + " streak · best " + (SQ.Store.data.streak.longest || 0)
            : "Start a streak today." })
        ]),
        U.el("div", { style: "text-align:right" }, [
          U.el("div", { style: "font-weight:800;font-size:18px;color:var(--accent)", text: "Lv " + lv.level + (S.data.prestige ? " ✦" + S.data.prestige : "") }),
          U.el("div", { class: "muted2", style: "font-weight:700", text: S.levelTitle(lv.level) }),
          U.el("div", { class: "muted2", text: lv.need ? U.fmtInt(lv.need - lv.into) + " XP to go" : "max level — Ascend on Progress" })
        ])
      ]),
      U.el("div", { class: "bar", style: "margin-top:10px" }, [
        U.el("i", { style: "width:" + (lv.need ? Math.min(100, lv.into / lv.need * 100) : 100) + "%" })
      ])
    ]);
  }

  UI.route("/home", function (view) {
    view.appendChild(levelCard());

    /* ── daily challenge ── */
    var d = S.daily();
    var dailyBox = U.el("div", { class: "card econ-daily" }, [
      U.el("div", { class: "spread" }, [
        U.el("div", {}, [
          U.el("b", { text: "📅 Daily challenge" }),
          U.el("div", { class: "muted2", text: modeName(d.spec.mode) + " — " + d.spec.target + " correct in runs that pay" })
        ]),
        d.claimed ? U.el("span", { class: "badge badge-good", text: "claimed" })
          : d.progress >= d.spec.target
            ? U.el("button", { class: "btn btn-primary btn-sm js-claim-daily", onclick: function () { S.claimDaily(); UI.render(); } }, "Claim +" + d.spec.reward + " 💲")
            : U.el("button", { class: "btn btn-sm", onclick: function () { UI.go(modeRoute(d.spec.mode)); } }, "Play")
      ]),
      U.el("div", { class: "bar", style: "margin-top:8px" }, [U.el("i", { style: "width:" + Math.round(d.progress / d.spec.target * 100) + "%" })]),
      U.el("div", { class: "muted2 small", style: "margin-top:4px", text: d.progress + " / " + d.spec.target + " · +" + d.spec.xp + " XP" })
    ]);
    view.appendChild(dailyBox);

    /* ── resume nudges ── */
    var missed = S.missedIds().filter(function (id) { return ECON.Bank.byId("mcq", id); }).length;
    var due = S.dueIds(ECON.Bank.active("card").map(function (c) { return c.id; })).length;
    var nudges = U.el("div", { class: "row", style: "margin:4px 0 10px" });
    nudges.appendChild(U.el("button", { class: "btn btn-primary grow", onclick: function () { UI.go("/play"); } }, "▶ Play"));
    if (due) nudges.appendChild(U.el("button", { class: "btn grow", onclick: function () { UI.go("/play/flashcards"); } }, due + " cards due"));
    if (missed) nudges.appendChild(U.el("button", { class: "btn grow", onclick: function () { UI.go("/play/rehab"); } }, missed + " to rehab"));
    view.appendChild(nudges);

    /* ── weekly quests ── */
    view.appendChild(U.el("h2", { text: "This week" }));
    var ql = U.el("div", { class: "list" });
    S.weeklyQuests().forEach(function (e) {
      var q = e.quest;
      ql.appendChild(U.el("div", { class: "li" }, [
        U.el("span", { style: "font-size:20px", text: q.icon }),
        U.el("div", { class: "grow" }, [
          U.el("b", { text: q.name }),
          U.el("small", { text: q.desc + " · " + e.done + "/" + e.target }),
          U.el("div", { class: "bar", style: "margin-top:5px" }, [U.el("i", { style: "width:" + Math.round(e.done / e.target * 100) + "%" })])
        ]),
        e.claimed ? U.el("span", { class: "badge badge-good", text: "✓" })
          : e.complete ? U.el("button", { class: "btn btn-sm btn-primary", onclick: function () { S.claimQuest(q.id); UI.render(); } }, "Claim")
          : U.el("span", { class: "muted2", text: q.coins + " 💲" })
      ]));
    });
    view.appendChild(ql);

    /* ── weak topics ── */
    var weak = S.weakTopics(3, 4);
    if (weak.length) {
      view.appendChild(U.el("h2", { text: "Weak spots" }));
      var wl = U.el("div", { class: "list" });
      weak.forEach(function (w) {
        var anyQ = ECON.Bank.all("mcq").filter(function (q) { return q.topic === w.topic; })[0];
        wl.appendChild(U.el("div", { class: "li" }, [
          U.el("div", { class: "grow" }, [U.el("b", { text: w.topic }), U.el("small", { text: w.pct + "% over " + w.seen + " answers" })]),
          anyQ ? U.el("button", { class: "btn btn-sm", onclick: function () { UI.go("/play/drill?mod=" + anyQ.mod); } }, "Drill " + anyQ.mod) : null
        ]));
      });
      view.appendChild(wl);
    }

    var diff = S.difficulty();
    if (diff.id !== "standard") {
      view.appendChild(U.el("div", { class: "card card-tight small" }, [
        U.el("b", { text: diff.icon + "  " + diff.name + " difficulty" }),
        U.el("div", { class: "muted2", text: diff.desc + "  Change it in the Economics shop." })
      ]));
    }
    view.appendChild(U.el("div", { class: "row", style: "margin-top:14px" }, [
      U.el("button", { class: "btn grow", onclick: function () { UI.go("/progress"); } }, "Progress"),
      U.el("button", { class: "btn grow", onclick: function () { UI.go("/options"); } }, "Options")
    ]));
  });

  UI.route("/play", function (view) {
    var counts = ECON.Bank.counts();
    view.appendChild(U.el("h1", { text: "Play" }));
    var groups = U.groupBy(R.MODES, function (m) { return m.group || "Other"; });
    ["Core", "Numbers", "Challenge", "Other"].forEach(function (g) {
      if (!groups[g]) return;
      view.appendChild(U.el("h2", { text: g }));
      var grid = U.el("div", { class: "tile-grid" });
      groups[g].forEach(function (m) {
        var tile = U.el("button", { class: "tile js-mode", dataset: { mode: m.id } }, [
          U.el("span", { class: "ico", text: m.icon }),
          U.el("span", { class: "t" }, [
            document.createTextNode(m.name),
            m.flag ? U.el("span", { class: "badge badge-warn", style: "margin-left:6px", text: m.flag }) : null
          ]),
          U.el("span", { class: "d", text: m.blurb })
        ]);
        tile.addEventListener("click", function () { UI.go(m.route === "/cards" ? "/play/flashcards" : m.route); });
        grid.appendChild(tile);
      });
      view.appendChild(grid);
    });

    view.appendChild(U.el("h2", { text: "Break" }));
    var arcadeTile = U.el("button", { class: "tile", style: "min-height:auto" }, [
      U.el("span", { class: "ico", text: "🕹️" }),
      U.el("span", { class: "t", text: "Arcade" }),
      U.el("span", { class: "d", text: "The shared arcade, in Economics skins. It pays nothing — that is deliberate." })
    ]);
    arcadeTile.addEventListener("click", function () { UI.go("/arcade"); });
    var grid2 = U.el("div", { class: "tile-grid" });
    grid2.appendChild(arcadeTile);
    view.appendChild(grid2);

    view.appendChild(U.el("div", { class: "muted2 small", style: "margin-top:18px;text-align:center",
      text: U.fmtInt(counts.mcq) + " questions · " + U.fmtInt(counts.card) + " flashcards · " +
            counts.short + " written responses · " + counts.diagram + " diagrams · " +
            counts.calc + " calculation templates" }));
  });

  function greeting() {
    var h = new Date().getHours();
    if (h < 5) return "Late one";
    if (h < 12) return "Morning";
    if (h < 17) return "Afternoon";
    if (h < 21) return "Evening";
    return "Late one";
  }
})(typeof window !== "undefined" ? window : globalThis);
