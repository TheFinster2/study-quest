/* Home — the Biology dashboard (new in StudyQuest): continue, the subject daily,
   the three weekly quests, due cards, the rehab pool, weak modules, bosses.
   Also BIO.Screens: the daily / weekly / Ascension cards shared with Progress. */
(function (root) {
  "use strict";
  var BIO = root.BIO, U = BIO.U, UI = BIO.UI, S = BIO.State, R = BIO.Run;
  var Screens = BIO.Screens = BIO.Screens || {};

  function modeName(id) { var m = R.byId(id); return m ? m.icon + " " + m.name : id; }
  function modeRoute(id) { var m = R.byId(id); return !m ? "/play" : /^\/study/.test(m.route) ? "/play/flashcards" : m.route; }

  Screens.dailyCard = function () {
    var d = S.daily(), sp = d.spec;
    var done = d.progress >= sp.target;
    var btn = d.claimed ? U.el("span", { class: "chip on", text: "Claimed ✓" })
      : done ? U.el("button", { class: "btn btn-primary btn-sm", onclick: function () {
          if (S.claimDaily()) { UI.toast("Daily claimed · +" + sp.reward + " ◉", "good"); UI.render(); }
        } }, "Claim")
      : U.el("button", { class: "btn btn-sm", onclick: function () { UI.go(modeRoute(sp.mode)); } }, "Go");
    return U.el("div", { class: "card daily bio-daily" }, [
      U.el("div", { class: "daily-ico", text: "☀️" }),
      U.el("div", { class: "daily-body" }, [
        U.el("b", { text: "Daily challenge" }),
        U.el("div", { class: "small muted", text: "Score " + sp.target + " in " + modeName(sp.mode) + " (runs that paid XP count) · +" + sp.reward + " ◉ +" + sp.xp + " XP" }),
        U.el("div", { class: "bar", style: "margin-top:6px" }, [U.el("i", { style: "width:" + U.pct(Math.min(d.progress, sp.target), sp.target) + "%" })]),
        U.el("div", { class: "muted2", text: Math.min(d.progress, sp.target) + " / " + sp.target })
      ]),
      btn
    ]);
  };

  Screens.weeklyCard = function () {
    var box = U.el("div", { class: "card" }, [U.el("b", { text: "This week's quests" })]);
    S.weeklyQuests().forEach(function (e) {
      var q = e.quest;
      box.appendChild(U.el("div", { class: "li", style: "margin-top:8px" }, [
        U.el("span", { style: "font-size:20px", text: q.icon }),
        U.el("div", { class: "grow" }, [
          U.el("b", { text: q.name }),
          U.el("small", { text: q.desc + " · " + e.done + "/" + e.target + " · +" + q.coins + " ◉ +" + q.xp + " XP" }),
          U.el("div", { class: "bar", style: "margin-top:4px" }, [U.el("i", { style: "width:" + U.pct(e.done, e.target) + "%" })])
        ]),
        e.claimed ? U.el("span", { class: "badge badge-good", text: "✓" })
          : e.complete ? U.el("button", { class: "btn btn-primary btn-sm", onclick: function () {
              if (S.claimQuest(q.id)) { UI.toast(q.name + " claimed", "good"); UI.render(); }
            } }, "Claim") : null
      ]));
    });
    return box;
  };

  Screens.ascension = function () {
    var d = S.data;
    var card = U.el("div", { class: "card" }, [
      U.el("b", { text: "🔱 Ascension" + (d.prestige ? "  ✦" + d.prestige : "") }),
      U.el("div", { class: "small muted", text: "At level " + S.MAX_LEVEL + " you can Ascend: back to level 1 with a permanent +12% XP per Ascension, 2,500 ◉ and three Double XP power-ups. Achievements, cards, mastery and bosses are kept." })
    ]);
    if (S.canPrestige()) {
      card.appendChild(U.el("button", { class: "btn btn-primary btn-block", style: "margin-top:8px", onclick: function () {
        UI.confirm("Ascend in Biology?", "You return to level 1 with a permanent XP bonus. Everything else is kept.", function () {
          if (S.doPrestige()) { SQ.FX.confetti(140); if (SQ.Sound) SQ.Sound.prestige(); S.checkAchievements(); UI.render(); }
        }, "Ascend");
      } }, "Ascend now"));
    } else {
      card.appendChild(U.el("div", { class: "muted2", style: "margin-top:6px", text: "Level " + d.level + " of " + S.MAX_LEVEL + " · current bonus ×" + (1 + (d.prestige || 0) * 0.12).toFixed(2) }));
    }
    return card;
  };

  UI.route("/home", function (view) {
    var d = S.data;
    var need = S.xpNeeded(d.level);

    view.appendChild(U.el("div", { class: "hero bio-hero" }, [
      U.el("h1", { text: "Biology" }),
      U.el("div", { class: "muted", text: "Level " + d.level + " · " + S.levelTitle(d.level) + (d.prestige ? " · ✦" + d.prestige : "") }),
      U.el("div", { class: "bar", style: "margin-top:8px" }, [U.el("i", { style: "width:" + (d.level >= S.MAX_LEVEL ? 100 : U.pct(d.xpIntoLevel, need)) + "%" })]),
      U.el("div", { class: "row", style: "margin-top:12px" }, [
        U.el("button", { class: "btn btn-primary grow", onclick: function () { UI.go("/play"); } }, "▶ Play"),
        U.el("button", { class: "btn grow", onclick: function () { UI.go("/play/response"); } }, "✍️ Response Builder")
      ])
    ]));

    if (!d.seenIntro) {
      view.appendChild(U.el("div", { class: "honesty" }, [
        U.el("b", { text: "Two promises. " }),
        document.createTextNode("If a run says it is worth 200 XP, that is what a student who knows the biology earns — someone who knows nothing earns zero. And this subject will never tell you your written answer is wrong: it shows you the criteria and a good answer, and you decide."),
        U.el("button", { class: "btn btn-sm", style: "margin-left:8px", onclick: function () { d.seenIntro = true; S.save(); UI.render(); } }, "Got it")
      ]));
    }

    // continue: due cards, rehab, weakest module
    var activeIds = {}; BIO.Bank.active("card").forEach(function (c) { activeIds[c.id] = true; });
    var due = S.dueCards(function (c) { return activeIds[c.id]; }).length;
    var missed = S.missedIds().length;
    var nudges = U.el("div", { class: "row", style: "margin:12px 0" });
    nudges.appendChild(U.el("button", { class: "btn grow" + (due ? " btn-primary" : ""), onclick: function () { UI.go("/play/flashcards"); } },
      due ? "🃏 " + due + " cards due" : "🃏 No cards due"));
    if (missed) nudges.appendChild(U.el("button", { class: "btn grow", onclick: function () { UI.go("/play/rehab"); } }, "🩹 " + missed + " to rehab"));
    view.appendChild(nudges);

    view.appendChild(Screens.dailyCard());
    view.appendChild(Screens.weeklyCard());

    // weak modules: lowest mastery among those started
    var mods = U.MODULES.map(function (m) { return { m: m, pct: S.mastery(m.id), seen: S.seenInModule(m.id) }; })
      .filter(function (x) { return x.seen >= 5; }).sort(function (a, b) { return a.pct - b.pct; }).slice(0, 3);
    if (mods.length) {
      view.appendChild(U.el("h2", { text: "Shore these up" }));
      var wl = U.el("div", { class: "list" });
      mods.forEach(function (x) {
        var row = U.el("button", { class: "li li-btn", type: "button" }, [
          U.el("span", { class: "badge badge-accent", text: x.m.id }),
          U.el("div", { class: "grow" }, [U.el("b", { text: x.m.name }), U.el("small", { text: "Mastery " + x.pct + "% · " + x.seen + " seen" })]),
          U.el("span", { class: "muted2", text: "Drill ›" })
        ]);
        row.addEventListener("click", function () { UI.go("/play/drill?mod=" + x.m.id); });
        wl.appendChild(row);
      });
      view.appendChild(wl);
    }

    // next boss
    var nextBoss = (BIO.DATA.bosses || []).filter(function (b) { return !(d.bossesBeaten || {})[b.id]; })[0];
    if (nextBoss && BIO.Bosses) {
      var u = BIO.Bosses.unlockState(nextBoss);
      view.appendChild(U.el("h2", { text: "Next boss" }));
      var br = U.el("button", { class: "li li-btn", type: "button" }, [
        U.el("span", { style: "font-size:22px", text: u.ok ? nextBoss.icon : "🔒" }),
        U.el("div", { class: "grow" }, [U.el("b", { text: nextBoss.name }), U.el("small", { text: u.ok ? nextBoss.gimmickText : u.why })]),
        U.el("span", { class: "muted2", text: "›" })
      ]);
      br.addEventListener("click", function () { UI.go("/play/boss"); });
      view.appendChild(br);
    }

    view.appendChild(U.el("div", { class: "row", style: "margin-top:16px" }, [
      U.el("button", { class: "btn grow", onclick: function () { UI.go("/shop"); } }, "◉ Shop"),
      U.el("button", { class: "btn grow", onclick: function () { UI.go("/options"); } }, "⚙️ Options")
    ]));
  });
})(typeof window !== "undefined" ? window : globalThis);
