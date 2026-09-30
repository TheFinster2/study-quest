/* Progress — level, Ascension, daily + weekly, mastery, coverage, bosses, achievements. */
(function (root) {
  "use strict";
  var BIO = root.BIO, U = BIO.U, UI = BIO.UI, S = BIO.State;

  UI.route("/progress", function (view) {
    UI.hideTabs(false);
    var d = S.data;
    var lv = { level: d.level, into: d.xpIntoLevel, need: d.level >= S.MAX_LEVEL ? 0 : S.xpNeeded(d.level) };
    var streak = SQ.Store.data.streak;

    view.appendChild(U.el("h1", { text:"Biology progress" }));

    // A dev-unlocked save must always say so. Numbers that were not earned
    // should never be able to pass as numbers that were.
    if (d.devUnlocked) {
      view.appendChild(U.el("div", { class:"why no" }, [
        U.el("div", { class:"why-h", text:"Dev-unlocked save" }),
        U.el("div", { class:"small", text:"XP, biocredits or progress on this save were set from the dev panel rather than earned. Reset from #/dev for a real run-through." })
      ]));
    }

    view.appendChild(U.el("div", { class:"card" }, [
      U.el("div", { class:"spread" }, [
        U.el("div", { class:"row", style:"align-items:center;gap:10px" }, [
          U.el("span", { style:"font-size:34px;line-height:1", text: SQ.Store.data.profile.avatar || "🧬" }),
          U.el("div", {}, [
            U.el("div", { style:"font-size:26px;font-weight:800;color:var(--accent)", text:"Level " + lv.level + (d.prestige ? "  ✦" + d.prestige : "") }),
            U.el("div", { style:"font-weight:700", text: S.levelTitle(lv.level) }),
            U.el("div", { class:"muted2", text: U.fmtInt(d.lifetimeXp || d.xp) + " XP earned in Biology" })
          ])
        ]),
        U.el("div", { style:"text-align:right" }, [
          U.el("div", { style:"font-size:20px;font-weight:800;color:var(--warn)", text:"◉ " + U.fmtInt(d.coins) }),
          U.el("div", { class:"muted2", text: U.plural(streak.count || 0, "day") + " streak" })
        ])
      ]),
      U.el("div", { class:"bar", style:"margin-top:10px" }, [
        U.el("i", { style:"width:" + (lv.need ? Math.min(100, lv.into / lv.need * 100) : 100) + "%" })
      ]),
      U.el("div", { class:"muted2 small", style:"margin-top:6px",
        text: lv.need ? U.fmtInt(lv.into) + " / " + U.fmtInt(lv.need) + " XP to level " + (lv.level + 1) : "Maximum level reached." })
    ]));

    view.appendChild(BIO.Screens.ascension());
    view.appendChild(BIO.Screens.dailyCard());
    view.appendChild(BIO.Screens.weeklyCard());

    /* ── mastery ──────────────────────────────────────────────────────
       Coverage times accuracy, per module. Answering three questions
       perfectly is not mastery of a module with sixty, so both factors
       matter — and neither can be bought in the Shop. */
    view.appendChild(U.el("h2", { text:"Mastery by module" }));
    var mlist = U.el("div", { class:"list" });
    U.MODULES.forEach(function (m) {
      var pct = S.mastery(m.id);
      var tier = S.masteryTier(pct) || { icon:"▪️", name:"Unranked" };
      mlist.appendChild(U.el("div", { class:"li" }, [
        U.el("span", { style:"font-size:18px;width:26px;text-align:center", text: tier.icon }),
        U.el("div", { class:"grow" }, [
          U.el("b", { text: m.id + " — " + m.name }),
          U.el("div", { class:"mst", style:"margin-top:5px" }, [
            U.el("div", { class:"mst-bar" }, [U.el("i", { style:"width:" + pct + "%" })]),
            U.el("small", { style:"width:60px;text-align:right", text: tier.name })
          ])
        ])
      ]));
    });
    view.appendChild(mlist);

    /* ── module coverage ── */
    view.appendChild(U.el("h2", { text:"Coverage by module" }));
    var stats = BIO.Bank.moduleStats();
    var list = U.el("div", { class:"list" });
    U.MODULES.forEach(function (m) {
      var st = stats[m.id];
      var pct = st.total ? Math.round(st.seen / st.total * 100) : 0;
      var boss = { cleared: !!(d.bossesBeaten && d.bossesBeaten["b-" + m.id]) };
      list.appendChild(U.el("div", { class:"li", style:"flex-direction:column;align-items:stretch;gap:6px" }, [
        U.el("div", { class:"spread" }, [
          U.el("div", {}, [
            U.el("b", { text: m.id + " — " + m.name }),
            U.el("small", { text: st.seen + "/" + st.total + " seen · " + st.missed + " in rehab" })
          ]),
          boss.cleared ? U.el("span", { class:"badge badge-good", text:"boss beaten" }) : null
        ]),
        U.el("div", { class:"bar" }, [U.el("i", { style:"width:" + pct + "%" })])
      ]));
    });
    view.appendChild(list);

    /* ── stats ── */
    view.appendChild(U.el("h2", { text:"Totals" }));
    var counts = BIO.Bank.counts();
    var seenMcq = BIO.Bank.all("mcq").filter(function (q) { return d.seen[q.id]; }).length;
    var totals = [
      ["Runs completed", U.fmtInt(d.runs || 0)],
      ["Questions seen", seenMcq + " / " + counts.mcq],
      ["Flashcards started", Object.keys(d.srs).length + " / " + counts.card],
      ["Flashcards in the final box", U.fmtInt(S.cardsMastered())],
      ["Bosses beaten", Object.keys(d.bossesBeaten || {}).length + " / " + (BIO.DATA.bosses || []).length],
      ["Written responses marked", String(Object.keys(d.shortLog).length)],
      ["Diagrams explored", Object.keys(d.diagramSeen).length + " / " + counts.diagram],
      ["Punnett crosses solved", U.fmtInt(d.stats.punnettSolved || 0)],
      ["Pedigrees solved", U.fmtInt(d.stats.pedigreeSolved || 0)],
      ["Best Survival run", U.fmtInt(d.stats.survivalBest || d.bests.survival || 0)],
      ["Longest daily streak (any subject)", U.plural(streak.longest || 0, "day")]
    ];
    var tl = U.el("div", { class:"list" });
    totals.forEach(function (t) {
      tl.appendChild(U.el("div", { class:"li" }, [
        U.el("div", { class:"grow", text: t[0] }),
        U.el("b", { text: t[1] })
      ]));
    });
    view.appendChild(tl);

    /* ── achievements ── */
    var ap = BIO.Achievements.progress();
    view.appendChild(U.el("h2", { text:"Achievements  " + ap.have + "/" + ap.total }));
    var ag = U.el("div", { class:"list" });
    BIO.Achievements.all().forEach(function (a) {
      var have = S.has(a.id);
      ag.appendChild(U.el("div", { class:"li", style: have ? "" : "opacity:.5" }, [
        U.el("span", { style:"font-size:20px", text: a.icon }),
        U.el("div", { class:"grow" }, [U.el("b", { text: a.name }), U.el("small", { text: a.desc + (a.reward ? "  · +" + a.reward + " ◉" : "") })]),
        have ? U.el("span", { class:"badge badge-good", text:"✓" }) : null
      ]));
    });
    view.appendChild(ag);

    view.appendChild(U.el("div", { class:"row", style:"margin-top:16px" }, [
      U.el("button", { class:"btn grow", onclick: function () { UI.go("/options"); } }, "⚙️ Biology options"),
      U.el("button", { class:"btn grow", onclick: function () { UI.go("/shop"); } }, "◉ Biology shop")
    ]));
  });
})(typeof window !== "undefined" ? window : globalThis);
