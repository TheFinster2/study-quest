/* #/progress — the overall picture across subjects; #/achievements — the app-wide ones. */
window.SQ = window.SQ || {};
SQ.Hub = SQ.Hub || {};

(function (Hub) {
  const U = SQ.U;
  const D = () => SQ.Store.data;

  function tile(num, lbl) {
    return U.el("div", { class: "card stat-tile" }, [U.el("div", { class: "stat-num", text: num }), U.el("div", { class: "stat-lbl", text: lbl })]);
  }

  /** 15 weeks of study, one square a day, darker = more XP. */
  function heatmap() {
    const h = D().history || {};
    const days = [];
    const today = new Date();
    for (let i = 104; i >= 0; i--) { const t = new Date(today); t.setDate(today.getDate() - i); days.push(U.dayKey(t)); }
    const max = Math.max(1, ...days.map(k => h[k] || 0));
    return U.el("div", { class: "heat", "aria-label": "Study over the last 15 weeks" }, days.map(k => {
      const v = h[k] || 0;
      const l = !v ? "" : v / max > 0.75 ? "l4" : v / max > 0.45 ? "l3" : v / max > 0.2 ? "l2" : "l1";
      return U.el("i", { class: l, title: k + ": " + U.fmtInt(v) + " XP" });
    }));
  }

  Hub.progress = function (view) {
    const d = D(), o = d.overall, st = d.stats;
    const need = SQ.Overall.xpNeeded(o.level);
    view.appendChild(U.el("div", { class: "hero" }, [
      U.el("h1", { text: "Overall progress" }),
      U.el("p", { class: "muted", text: `${SQ.Overall.title(o.level)} · level ${o.level} of ${SQ.Overall.MAX_LEVEL}` }),
      U.el("div", { class: "bar" }, [U.el("i", { style: { width: U.clamp(o.xpIntoLevel / need * 100, 0, 100) + "%" } })]),
      U.el("div", { class: "tiny muted", text: `${U.fmtInt(o.xpIntoLevel)} / ${U.fmtInt(need)} XP · every subject's XP counts` })
    ]));

    view.appendChild(U.el("div", { class: "stat-row", style: "margin-top:14px" }, [
      tile(U.fmtInt(o.lifetimeXp), "XP, all subjects"),
      tile(U.pct(st.correct || 0, st.answered || 0) + "%", "accuracy"),
      tile(U.fmtInt(st.answered || 0), "answered"),
      tile(String(d.streak.count), "day streak"),
      tile(String(d.streak.longest || 0), "best streak"),
      tile(U.fmtInt(st.runs || 0), "runs")
    ]));

    view.appendChild(U.el("h2", { class: "sec-h", text: "Last 15 weeks" }));
    view.appendChild(U.el("div", { class: "card" }, [heatmap()]));

    view.appendChild(U.el("h2", { class: "sec-h", text: "Subjects" }));
    const ids = SQ.Subjects.ids().filter(id => d.enrolled.includes(id) || SQ.Store.rawSlot(id));
    view.appendChild(U.el("div", { class: "card" }, ids.length ? ids.map(id => {
      const sm = Hub.summary(id);
      return U.el("a", { class: "sub-level", href: "#/s/" + id + "/progress", style: "text-decoration:none; color:var(--ink)" }, [
        U.el("span", { class: "subject-ico sm", style: { "--sc": sm.meta.color }, text: sm.meta.icon }),
        U.el("div", { style: "flex:1; min-width:0" }, [
          U.el("div", { class: "row" }, [U.el("b", { text: sm.meta.name }), U.el("span", { class: "spacer" }),
            U.el("span", { class: "tiny muted", text: `Lv ${sm.level}${sm.prestige ? " ✦" + sm.prestige : ""} · ${U.fmtInt(sm.xp)} XP` })]),
          U.el("div", { class: "bar thin" }, [U.el("i", { style: { width: Math.round(sm.pct * 100) + "%", background: sm.meta.color } })])
        ])
      ]);
    }) : [U.el("p", { class: "muted", text: "No subjects yet." })]));

    const list = SQ.DATA.achievements || [];
    view.appendChild(U.el("a", { class: "btn btn-ghost btn-block", style: "margin-top:14px", href: "#/achievements",
      text: `🏆 App achievements · ${Object.keys(d.achievements).length}/${list.length}` }));
  };

  Hub.achievements = function (view) {
    const d = D();
    const list = SQ.DATA.achievements || [];
    view.appendChild(U.el("div", { class: "hero" }, [U.el("h1", { text: "App achievements" }),
      U.el("p", { class: "muted", text: `${Object.keys(d.achievements).length} of ${list.length} · they pay Stars. Each subject has its own set on its Progress screen.` })]));
    const groups = {};
    list.forEach(a => (groups[a.group || "General"] = groups[a.group || "General"] || []).push(a));
    Object.keys(groups).forEach(g => {
      view.appendChild(U.el("h2", { class: "sec-h", text: g }));
      view.appendChild(U.el("div", { class: "grid" }, groups[g].map(a => {
        const got = !!d.achievements[a.id];
        return U.el("div", { class: "card ach" + (got ? " got" : "") }, [
          U.el("span", { class: "shop-ico", text: got ? a.icon : "🔒" }),
          U.el("div", { style: "flex:1" }, [U.el("b", { text: a.name }), U.el("div", { class: "tiny muted", text: a.desc })]),
          a.reward ? U.el("span", { class: "chip" + (got ? " on" : ""), text: "+" + a.reward + " ⭐" }) : null
        ]);
      })));
    });
  };
})(SQ.Hub);
