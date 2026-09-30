/* The hub: the app's home screen, the subject switcher and first-run onboarding. */
window.SQ = window.SQ || {};
SQ.Hub = SQ.Hub || {};

(function (Hub) {
  const U = SQ.U, UI = SQ.UI, E = SQ.Economy;
  const D = () => SQ.Store.data;

  /** A subject's headline numbers from its raw slot — works without loading it. */
  function summary(id) {
    const s = SQ.Store.rawSlot(id);
    const meta = SQ.Subjects.get(id);
    if (!s) return { meta, level: 1, prestige: 0, coins: null, xp: 0, started: false, acc: 0, pct: 0 };
    const st = s.stats || {};
    const ns = SQ.Subjects.ns(id);
    let pct = 0;
    if (ns && ns.State && ns.State.xpNeeded) pct = U.clamp((s.xpIntoLevel || 0) / ns.State.xpNeeded(s.level || 1), 0, 1);
    return { meta, level: s.level || 1, prestige: s.prestige || 0, coins: s.coins, xp: s.lifetimeXp || s.xp || 0,
             started: (s.lifetimeXp || s.xp || 0) > 0, acc: U.pct(st.correct || 0, st.answered || 0), pct,
             lastPlayed: s.lastPlayed || 0 };
  }
  Hub.summary = summary;

  function subjectCard(id) {
    const sm = summary(id);
    const m = sm.meta;
    return U.el("a", { class: "subject-card card", href: "#/s/" + id + "/home", style: { "--sc": m.color } }, [
      U.el("div", { class: "subject-ico", text: m.icon }),
      U.el("div", { class: "subject-body" }, [
        U.el("div", { class: "subject-name", text: m.name }),
        U.el("div", { class: "tiny muted", text: sm.started
          ? `Level ${sm.level}${sm.prestige ? " · ✦" + sm.prestige : ""} · ${sm.acc}% accuracy`
          : "Not started yet" }),
        U.el("div", { class: "bar thin" }, [U.el("i", { style: { width: Math.round(sm.pct * 100) + "%", background: m.color } })])
      ]),
      sm.coins !== null && sm.coins !== undefined ? U.el("div", { class: "subject-coins tiny", text: `${U.fmtInt(sm.coins)} ${m.currency.icon}` }) : null
    ]);
  }
  Hub.subjectCard = subjectCard;

  Hub.home = function (view) {
    const d = D();
    const o = d.overall;
    const need = SQ.Overall.xpNeeded(o.level);
    const enrolled = d.enrolled.length ? d.enrolled : [];

    view.appendChild(U.el("div", { class: "hero hub-hero" }, [
      U.el("div", { class: "row", style: "gap:14px; align-items:center" }, [
        U.el("div", { class: "hub-level" }, [U.el("span", { text: "★" }), U.el("b", { text: String(o.level) })]),
        U.el("div", { style: "flex:1; min-width:0" }, [
          U.el("h1", { text: "Hi, " + d.profile.name }),
          U.el("div", { class: "muted", text: SQ.Overall.title(o.level) + " · overall level " + o.level }),
          U.el("div", { class: "bar" }, [U.el("i", { style: { width: U.clamp(o.xpIntoLevel / need * 100, 0, 100) + "%" } })]),
          U.el("div", { class: "tiny muted", text: `${U.fmtInt(o.xpIntoLevel)} / ${U.fmtInt(need)} XP to level ${o.level + 1}` })
        ])
      ])
    ]));

    /* continue where you left off */
    const last = d.settings.lastSubject && SQ.Subjects.get(d.settings.lastSubject);
    if (last) {
      view.appendChild(U.el("a", { class: "btn btn-primary btn-block continue-btn", href: "#/s/" + last.id + "/home",
        text: `Continue ${last.name} ${last.icon}` }));
    }

    /* the global daily + weekly */
    const dp = SQ.Overall.dailyProgress();
    const dailyCard = U.el("div", { class: "card daily" }, [
      U.el("div", { class: "daily-ico", text: "📅" }),
      U.el("div", { class: "daily-body" }, [
        U.el("div", { class: "shop-name", text: "Today's challenge" }),
        U.el("div", { class: "tiny muted", text: dp.spec.desc + ` · +${dp.spec.stars} ⭐ +${dp.spec.xp} XP` }),
        U.el("div", { class: "bar thin" }, [U.el("i", { style: { width: U.pct(dp.done, dp.target) + "%" } })])
      ]),
      dp.claimed ? U.el("span", { class: "chip on", text: "Done ✓" })
        : dp.complete ? U.el("button", { class: "btn btn-sm btn-primary", text: "Claim", on: { click: () => {
            const r = SQ.Overall.claimDaily();
            if (r) { SQ.Sound.coin(); SQ.FX.confetti(80); UI.toast({ icon: "📅", kind: "good", text: `Daily done · +${dp.spec.stars} ⭐` }); UI.go("/home"); }
          } } })
        : U.el("span", { class: "chip", text: `${dp.done}/${dp.target}` })
    ]);
    view.appendChild(dailyCard);

    view.appendChild(U.el("h2", { class: "sec-h", text: "Your subjects" }));
    if (!enrolled.length) {
      view.appendChild(U.el("div", { class: "card" }, [
        U.el("p", { text: "Pick the subjects you study and they'll live here." }),
        U.el("a", { class: "btn btn-primary", href: "#/subjects", text: "Choose subjects" })
      ]));
    } else {
      view.appendChild(U.el("div", { class: "subject-grid" }, enrolled.map(subjectCard)));
      view.appendChild(U.el("a", { class: "tiny muted", href: "#/subjects", text: "Add or remove subjects →" }));
    }

    const qs = SQ.Overall.weeklyQuests();
    view.appendChild(U.el("h2", { class: "sec-h", text: "This week" }));
    view.appendChild(U.el("div", { class: "grid" }, qs.map(e => U.el("div", { class: "card quest" }, [
      U.el("div", { class: "daily-ico", text: e.quest.icon }),
      U.el("div", { class: "daily-body" }, [
        U.el("div", { class: "shop-name", text: e.quest.name }),
        U.el("div", { class: "tiny muted", text: `${e.quest.desc} · +${e.quest.stars} ⭐` }),
        U.el("div", { class: "bar thin" }, [U.el("i", { style: { width: U.pct(e.done, e.target) + "%" } })])
      ]),
      e.claimed ? U.el("span", { class: "chip on", text: "✓" })
        : e.complete ? U.el("button", { class: "btn btn-sm btn-primary", text: "Claim", on: { click: () => {
            if (SQ.Overall.claimQuest(e.quest.id)) { SQ.Sound.coin(); SQ.FX.confetti(70); UI.go("/home"); }
          } } })
        : U.el("span", { class: "chip", text: `${U.fmtInt(e.done)}/${U.fmtInt(e.target)}` })
    ]))));

    view.appendChild(U.el("div", { class: "grid g2", style: "margin-top:14px" }, [
      U.el("a", { class: "card tile-link", href: "#/arcade" }, [U.el("div", { class: "shop-ico", text: "🕹️" }), U.el("b", { text: "Arcade" }),
        U.el("div", { class: "tiny muted", text: d.overall.level < E.ARCADE_UNLOCK_LEVEL ? `Opens at level ${E.ARCADE_UNLOCK_LEVEL}` : "Shared by every subject" })]),
      U.el("a", { class: "card tile-link", href: "#/shop" }, [U.el("div", { class: "shop-ico", text: "🛒" }), U.el("b", { text: "General shop" }),
        U.el("div", { class: "tiny muted", text: `${U.fmtInt(d.stars)} ⭐ to spend` })])
    ]));
  };

  /** The subject switcher: tap the icon beside your avatar. */
  Hub.switcher = function () {
    const d = D();
    const ids = d.enrolled.length ? d.enrolled : SQ.Subjects.ids();
    UI.modal(U.el("div", {}, [
      U.el("h2", { text: "Switch subject" }),
      U.el("a", { class: "switch-row", href: "#/home", on: { click: () => UI.closeModal() } }, [
        U.el("span", { class: "subject-ico sm", text: "★" }), U.el("b", { text: "All subjects (hub)" })]),
      ...ids.map(id => {
        const sm = summary(id);
        return U.el("a", { class: "switch-row" + (UI.context() === id ? " on" : ""), href: "#/s/" + id + "/home", on: { click: () => UI.closeModal() } }, [
          U.el("span", { class: "subject-ico sm", text: sm.meta.icon }),
          U.el("b", { text: sm.meta.name }),
          U.el("span", { class: "spacer" }),
          U.el("span", { class: "tiny muted", text: sm.started ? "Lv " + sm.level : "new" })
        ]);
      }),
      U.el("a", { class: "tiny muted", href: "#/subjects", on: { click: () => UI.closeModal() }, text: "Manage subjects →" })
    ]));
  };

  /** First run: name + subjects. */
  Hub.onboarding = function () {
    const d = D();
    const chosen = new Set(d.enrolled);
    const name = U.el("input", { class: "text-in", type: "text", maxlength: 24, value: d.profile.name === "Student" ? "" : d.profile.name,
      placeholder: "Your name (optional)", "aria-label": "Your name" });
    const list = U.el("div", { class: "pick-grid" });
    const go = U.el("button", { class: "btn btn-primary btn-block", text: "Start studying" });
    function draw() {
      list.innerHTML = "";
      SQ.Subjects.LIST.forEach(m => {
        const on = chosen.has(m.id);
        list.appendChild(U.el("button", { class: "pick card" + (on ? " on" : ""), "aria-pressed": on ? "true" : "false", style: { "--sc": m.color },
          on: { click: () => {
            if (on) chosen.delete(m.id);
            else { chosen.add(m.id); (m.excludes || []).forEach(x => chosen.delete(x)); }
            SQ.Sound.tap(); draw();
          } } }, [
          U.el("span", { class: "subject-ico sm", text: m.icon }),
          U.el("span", {}, [U.el("b", { text: m.name }), U.el("div", { class: "tiny muted", text: m.blurb })])
        ]));
      });
      go.disabled = chosen.size === 0;
    }
    draw();
    go.addEventListener("click", () => {
      d.enrolled = SQ.Subjects.ids().filter(id => chosen.has(id));
      if (name.value.trim()) d.profile.name = name.value.trim().slice(0, 24);
      d.settings.onboarded = true;
      SQ.Store.emit();
      UI.closeModal();
      SQ.Sound.win(); SQ.FX.confetti(90);
      UI.go("/home");
      setTimeout(() => SQ.Migrate.offer(), 500);
    });
    UI.modal(U.el("div", {}, [
      U.el("div", { class: "modal-big", text: "★" }),
      U.el("h2", { text: "Welcome to StudyQuest" }),
      U.el("p", { html: "Seven HSC study games in one app. Each subject has its own levels, modes, coins and shop. " +
        "Everything you earn also builds your <b>overall level</b> and <b>Stars ⭐</b> for the arcade and the general shop." }),
      name,
      U.el("h3", { class: "shop-h", text: "Which subjects do you study?" }),
      U.el("p", { class: "tiny muted", text: "Maths Standard and Maths Advanced are either/or. You can change this any time." }),
      list, go
    ]), { sticky: true, wide: true });
  };
})(SQ.Hub);
