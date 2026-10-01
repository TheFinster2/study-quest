/* Economics bosses — timed HP duels (StudyQuest upgrade).

   The stand-alone app had a 20-question, 75%-to-clear test per module. Here,
   in the style of the Chemistry and Maths Advanced bosses: a per-question
   timer, your HP against the boss's, and one gimmick each. One boss per topic
   group, then the Final Paper once all five have fallen.

   Anti-farm: an answer faster than UI.readFloor(stem) deals NO damage (it
   cannot have been read), so a bot that taps at machine speed cannot win; a
   loss pays only for read, correct answers; everything goes through award().
   Exposes: window.ECON.Boss */
(function (root) {
  "use strict";
  var ECON = root.ECON, U = ECON.U, UI = ECON.UI, S = ECON.State, R = ECON.Run;

  var ALL = U.MODULES.map(function (m) { return m.id; });
  var BOSSES = [
    { id:"hand", icon:"🫳", name:"The Invisible Hand", mods:["P1", "P2"], hp:180, time:26, ability:"obscure",
      group:"Year 11 — Introduction · Consumers and Business",
      taunt:"You will never see me move the market.",
      abilityText:"Hides the topic label on every question — work out which part of the course you are in." },
    { id:"shock", icon:"⚡", name:"Market Shock", mods:["P3", "P4"], hp:200, time:26, ability:"rotate",
      group:"Year 11 — Markets · Labour Markets",
      taunt:"Prices were stable. Were.",
      abilityText:"The answer options rotate position every 3 seconds. Read the answer, not the letter." },
    { id:"deficit", icon:"🧾", name:"Budget Deficit", mods:["P5", "P6"], hp:210, time:25, ability:"heal",
      group:"Year 11 — Financial Markets · Government",
      taunt:"I can always borrow a little more.",
      abilityText:"Every third question it borrows against the future and heals 12 HP." },
    { id:"current", icon:"🚢", name:"The Current Account", mods:["H1", "H2"], hp:230, time:24, ability:"double",
      group:"Year 12 — The Global Economy · Australia's Place",
      taunt:"Net primary income flows one way. Out.",
      abilityText:"Deficits compound: wrong answers hit you for double damage." },
    { id:"rba", icon:"🏦", name:"The Reserve Bank", mods:["H3", "H4"], hp:250, time:23, ability:"hike",
      group:"Year 12 — Economic Issues · Policies and Management",
      taunt:"The Board has decided to lift the cash rate.",
      abilityText:"Lifts the cash rate every 3 questions: each hike adds 25% to the damage you take." },
    { id:"final", icon:"📜", name:"The Final Paper", mods: ALL, hp:360, time:20, ability:"all",
      group:"The whole course",
      taunt:"Three hours. Reading time is over.",
      abilityText:"Every gimmick at once. Defeat the five topic bosses first." }
  ];
  var UNLOCK_SEEN = 12;
  var byId = function (id) { for (var i = 0; i < BOSSES.length; i++) if (BOSSES[i].id === id) return BOSSES[i]; return null; };

  function seenIn(b) {
    return ECON.Bank.all("mcq").filter(function (q) { return b.mods.indexOf(q.mod) >= 0 && S.data.seen[q.id]; }).length;
  }
  function unlocked(b) {
    if (b.id === "final") return BOSSES.every(function (x) { return x.id === "final" || S.data.bossesBeaten[x.id]; });
    return seenIn(b) >= UNLOCK_SEEN || !!S.data.bossesBeaten[b.id];
  }

  R.register({
    id:"boss", name:"Topic Bosses", icon:"⚔️", route:"/play/boss",
    blurb:"HP duels against the clock — one per topic group, each with a gimmick, then the Final Paper.",
    group:"Challenge"
  });

  UI.route("/play/boss", function (view, r) {
    var b = r.query.b ? byId(r.query.b) : null;
    if (!b) return chooser(view);
    if (!unlocked(b)) {
      UI.modal({
        title: "Boss locked",
        body: b.id === "final" ? "Defeat the five topic bosses first."
          : "Answer " + UNLOCK_SEEN + " questions from " + b.mods.join(" and ") + " first. You have seen " + seenIn(b) + ".",
        actions: [{ label: "Back", kind: "primary", onclick: function () { UI.go("/play/boss"); } }]
      });
      return chooser(view);
    }
    return fight(view, b);
  });

  function chooser(view) {
    view.appendChild(U.el("h1", { text: "Topic Bosses" }));
    view.appendChild(U.el("p", { class: "muted", text: "Your HP against the boss's, a clock on every question, and one gimmick each. " +
      "Fast, correct answers hit hardest — but an answer faster than it can be read does no damage at all." }));
    var list = U.el("div", { class: "list" });
    BOSSES.forEach(function (b) {
      var open = unlocked(b), beat = !!S.data.bossesBeaten[b.id];
      var hidden = ECON.Bank.active("mcq", function (q) { return b.mods.indexOf(q.mod) >= 0; }).length < 8;
      var sub = b.group + " · " + (beat ? "defeated ✓" : open ? b.hp + " HP" :
        (b.id === "final" ? "defeat the other five" : seenIn(b) + "/" + UNLOCK_SEEN + " questions seen"));
      if (hidden) sub += " · hidden by coverage";
      var row = U.el("button", { class: "li li-btn js-boss", dataset: { boss: b.id } }, [
        U.el("span", { style: "font-size:24px", text: open ? b.icon : "🔒" }),
        U.el("div", { class: "grow" }, [
          U.el("b", { text: b.name }),
          U.el("small", { text: sub }),
          U.el("small", { class: "boss-ability", text: "⚡ " + b.abilityText })
        ]),
        U.el("span", { class: "muted2", text: "›" })
      ]);
      if (!open || hidden) row.classList.add("dimmed");
      row.addEventListener("click", function () {
        if (hidden) { UI.toast("Course coverage is hiding this boss's topics — Options → Course coverage.", "bad", 3200); return; }
        UI.go("/play/boss?b=" + b.id);
      });
      list.appendChild(row);
    });
    view.appendChild(list);
  }

  function fight(view, boss) {
    var inMods = function (q) { return boss.mods.indexOf(q.mod) >= 0; };
    var questions = ECON.Bank.draw("mcq", 40, { filter: inMods });
    if (questions.length < 8) { ECON.Coverage.warnIfEmpty("mcq", inMods); return; }

    var diff = S.difficulty();
    var ab = boss.ability, all = ab === "all";
    var obscure = ab === "obscure" || all, rotate = ab === "rotate" || all, heals = ab === "heal" || all,
        doubles = ab === "double" || all, hikes = ab === "hike" || all;

    var PLAYER = 100;
    var bossHp = boss.hp, playerHp = PLAYER, asked = 0, correct = 0, counted = 0, streak = 0;
    var qIndex = 0, timeLeft = 0, finished = false, tookDamage = false, hike = 0;
    var timerId = null, rotId = null, shownAt = 0, floor = 0;

    var shell = UI.shell(view, { title: "Boss: " + boss.name, sub: boss.group, progress: false,
      help: "<b>" + U.esc(boss.abilityText) + "</b><br><br>Right answers damage the boss — faster hits harder. " +
            "Wrong answers and time-outs damage you. Answers faster than the question can be read do no damage.",
      onQuit: function () {} });
    var timerChip = U.el("span", { class: "timer-ring", text: "–" });
    shell.core.meta.appendChild(timerChip);

    var bossBar = U.el("i"), playerBar = U.el("i");
    var bossFace = U.el("div", { class: "boss-face", text: boss.icon });
    var bossTxt = U.el("span", { class: "tiny muted" }), playerTxt = U.el("span", { class: "tiny muted" });
    var hikeTxt = U.el("span", { class: "tiny", style: "color:var(--warn)" });
    shell.head.appendChild(U.el("div", { class: "card card-tight boss-hud" }, [
      U.el("div", { class: "row", style: "flex-wrap:nowrap;align-items:center" }, [
        bossFace,
        U.el("div", { class: "grow" }, [
          U.el("div", { class: "spread" }, [U.el("b", { text: boss.name }), bossTxt]),
          U.el("div", { class: "hpbar enemy", style: "margin-top:6px" }, [bossBar])
        ])
      ]),
      U.el("p", { class: "tiny muted", style: "margin:8px 0 0", text: "“" + boss.taunt + "”" }),
      U.el("div", { class: "row", style: "flex-wrap:nowrap;align-items:center;margin-top:8px" }, [
        U.el("span", { text: "🧑‍🎓" }),
        U.el("div", { class: "grow" }, [U.el("div", { class: "hpbar" }, [playerBar])]),
        playerTxt
      ]),
      U.el("p", { class: "tiny", style: "margin:8px 0 0;color:var(--warn)", text: "⚡ " + boss.abilityText }),
      hikeTxt
    ]));

    function paint() {
      bossBar.style.width = U.clamp(bossHp / boss.hp * 100, 0, 100) + "%";
      playerBar.style.width = U.clamp(playerHp / PLAYER * 100, 0, 100) + "%";
      bossTxt.textContent = Math.max(0, Math.round(bossHp)) + " / " + boss.hp;
      playerTxt.textContent = Math.max(0, Math.round(playerHp)) + " / " + PLAYER;
      hikeTxt.textContent = hikes && hike ? "Cash rate hikes: " + hike + " · damage ×" + (1 + hike * 0.25).toFixed(2) : "";
      shell.setMeters([{ text: "Q " + (asked || 1) }, { text: correct + " correct" }, streak >= 3 ? { text: "🔥 " + streak, hot: true } : null]);
    }
    paint();

    function qTime() { return Math.max(8, Math.round(boss.time * (diff.time || 1))); }

    function stopTimers() { clearInterval(timerId); clearInterval(rotId); timerId = rotId = null; }

    function ask() {
      if (finished) return;
      if (qIndex >= questions.length) questions = questions.concat(ECON.Bank.draw("mcq", 20, { filter: inMods }));
      var q = questions[qIndex];
      asked++;
      paint();
      var stage = shell.clear();
      var res = UI.renderMCQ(stage, q, function (ok, chosen) { resolve(q, stage, ok, false); }, { hideMeta: obscure });
      shownAt = Date.now();
      floor = UI.readFloor(q.q);
      timeLeft = qTime();
      timerChip.textContent = String(timeLeft);
      timerChip.classList.remove("low");
      stopTimers();
      timerId = setInterval(function () {
        timeLeft--;
        timerChip.textContent = String(Math.max(0, timeLeft));
        timerChip.classList.toggle("low", timeLeft <= 5);
        if (timeLeft <= 0) {
          stopTimers();
          res.buttons.forEach(function (bb) {
            bb.disabled = true;
            if (+bb.dataset.oi === q.answer) bb.classList.add("right"); else bb.classList.add("dim");
          });
          stage.appendChild(UI.explain(q, false, -1));
          resolve(q, stage, false, true);
        }
      }, 1000);
      if (rotate) {
        rotId = setInterval(function () {
          if (res.buttons[0].disabled) { clearInterval(rotId); return; }
          res.box.appendChild(res.box.firstChild);
          U.$$(".opt .k", res.box).forEach(function (k, n) { k.textContent = "ABCD".charAt(n); });
        }, 3000);
      }
    }

    function resolve(q, stage, ok, timedOut) {
      if (finished) return;
      stopTimers();
      S.markSeen(q.id, ok, q.mod, q.topic);
      var note;
      var read = (Date.now() - shownAt) >= floor;
      if (ok) {
        correct++; streak++;
        S.noteStreak(streak);
        if (read) {
          counted++;
          var speed = U.clamp(timeLeft / qTime(), 0, 1);
          var dmg = Math.round((9 + (q.diff || 1) * 5) * (1 + speed * 0.6) * (1 + Math.min(streak, 6) * 0.06));
          bossHp -= dmg;
          if (SQ.Sound && SQ.Sound.thud) SQ.Sound.thud();
          var r = bossFace.getBoundingClientRect();
          if (SQ.FX.sparks) SQ.FX.sparks(r.left + r.width / 2, r.top + r.height / 2, Math.PI * 1.5);
          if (SQ.FX.floatText) SQ.FX.floatText(r.right + 4, r.top, "−" + dmg, "var(--bad)");
          note = U.el("div", { class: "tiny", style: "margin-top:8px;color:var(--good)", text: "You deal " + dmg + " damage." });
        } else {
          note = U.el("div", { class: "tiny", style: "margin-top:8px;color:var(--warn)",
            text: "Too fast to have read it — the boss shrugs that one off. No damage." });
        }
      } else {
        streak = 0;
        var hit = Math.round((10 + (q.diff || 1) * 4) * (diff.boss || 1));
        if (doubles) hit *= 2;
        if (hikes) hit = Math.round(hit * (1 + hike * 0.25));
        if (timedOut) hit = Math.round(hit * 1.2);
        playerHp -= hit;
        tookDamage = true;
        if (SQ.FX.shake) SQ.FX.shake();
        note = U.el("div", { class: "tiny", style: "margin-top:8px;color:var(--bad)",
          text: (timedOut ? "Out of time — " : "") + "you take " + hit + " damage." });
      }
      stage.appendChild(note);

      if (heals && asked % 3 === 0 && bossHp > 0) {
        bossHp = Math.min(boss.hp, bossHp + 12);
        UI.toast({ icon: "🧾", kind: "bad", text: "<b>Deficit spending</b> — the boss borrows and recovers 12 HP." });
      }
      if (hikes && asked % 3 === 0) {
        hike++;
        UI.toast({ icon: "🏦", kind: "bad", text: "<b>Rate hike</b> — the cash rate rises. Wrong answers now hit " + Math.round(hike * 25) + "% harder." });
      }
      paint();

      if (bossHp <= 0) { setTimeout(function () { end(true); }, 800); return; }
      if (playerHp <= 0) {
        if (S.usePowerup("revive")) {
          playerHp = Math.round(PLAYER * 0.4);
          paint();
          UI.toast({ icon: "💉", kind: "good", text: "<b>Second wind!</b> Back on your feet at 40% HP." });
        } else { setTimeout(function () { end(false); }, 700); return; }
      }
      stage.appendChild(U.el("div", { class: "row", style: "margin-top:12px" }, [
        U.el("button", { class: "btn btn-primary btn-block", onclick: function () { qIndex++; ask(); } }, "Continue ⚔️")
      ]));
    }

    function end(won) {
      if (finished) return;
      finished = true;
      stopTimers();
      var clutch = won && playerHp <= PLAYER * 0.1;
      var flawless = won && !tookDamage;
      var firstWin = won && !S.data.bossesBeaten[boss.id];
      if (won) {
        S.markBoss(boss.id, { flawless: flawless });
        if (diff.id === "hard") S.bump("hardWins");
        if (diff.id === "nightmare") S.bump("nightmareWins");
        if (clutch) S.bump("clutchWins");
      }
      /* A boss pays a lump sum on a win, but only the FIRST defeat pays the full
         trophy; a re-match pays its answers plus a smaller purse, so replaying the
         easiest boss is not the best XP in the subject. */
      var purse = Math.round(150 + boss.hp * 0.8 + (flawless ? 150 : 0));
      if (won && !firstWin) purse = Math.round(purse * 0.35);
      var xp = won ? purse + counted * 8 : Math.round(counted * 10);
      var newBest = S.recordScore("boss_" + boss.id, won ? Math.round(playerHp) : 0);
      var rec = UI.award({ xp: xp, questions: asked, accuracy: asked ? correct / asked : 0, mode: "boss", score: correct });
      UI.report(view, {
        rec: rec, backTo: "/play/boss", newBest: newBest,
        title: won ? boss.name + " defeated!" : "Defeated…",
        subtitle: correct + " / " + asked + " correct",
        correct: correct, total: asked,
        extraStats: [["Your HP", Math.max(0, Math.round(playerHp))], ["Boss HP", Math.max(0, Math.round(bossHp))]],
        rows: [
          ["Result", won ? (flawless ? "WIN — flawless" : clutch ? "WIN — clutch" : "WIN") : "LOSS"],
          ["Your HP", String(Math.max(0, Math.round(playerHp)))],
          ["Boss HP", String(Math.max(0, Math.round(bossHp)))],
          ["Read, correct answers", String(counted)],
          ["Total earned", U.fmtInt(rec.xp) + " XP  ·  " + U.fmtInt(rec.coins) + " 💲"]
        ],
        again: function () { UI.render(); }
      });
    }

    ask();
    return function () { finished = true; stopTimers(); };
  }

  ECON.Boss = { BOSSES: BOSSES, byId: byId, unlocked: unlocked, UNLOCK_SEEN: UNLOCK_SEEN };
})(typeof window !== "undefined" ? window : globalThis);
