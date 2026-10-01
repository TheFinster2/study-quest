/* Exam Bosses — one per Year 12 module plus a final. A boss is a health bar and a
   timer: right answers damage it, wrong answers and the clock damage you.

   Bosses are the only mode with a lock: each needs a mastery level in its module,
   so they are a reason to grind a topic rather than a wall in front of one. */
window.PHYS = window.PHYS || {};
PHYS.Games = PHYS.Games || {};

PHYS.Games.boss = (function () {
  const U = PHYS.U, S = PHYS.State, UI = PHYS.UI, B = PHYS.Bank;

  const BOSSES = [
    { id: "boss-m5", mod: "M5", name: "The Orbital Examiner", icon: "🛰️",
      hp: 120, needMastery: 35, blurb: "Projectiles, circles and orbits. It does not accept g = 10." },
    { id: "boss-m6", mod: "M6", name: "Lenz's Revenge", icon: "⚡",
      hp: 130, needMastery: 35, blurb: "Every answer it takes, it opposes the change in." },
    { id: "boss-m7", mod: "M7", name: "The Photon Warden", icon: "💡",
      hp: 140, needMastery: 35, blurb: "Quanta, relativity, and no partial credit for wave models." },
    { id: "boss-m8", mod: "M8", name: "Chandrasekhar's Limit", icon: "⚛️",
      hp: 150, needMastery: 35, blurb: "Stars, nuclei and the Standard Model. Collapses under pressure." },
    { id: "boss-final", mod: null, name: "The Trial Paper", icon: "📄",
      hp: 200, needMastery: 55, needAll: true,
      blurb: "All eight modules, no warnings. Beat this and the HSC is a formality." }
  ];

  function isUnlocked(boss) {
    if (boss.needAll) {
      return B.MODULES.filter(m => m.year === 12)
                      .every(m => S.mastery(m.id) >= boss.needMastery);
    }
    return S.mastery(boss.mod) >= boss.needMastery;
  }

  function lockReason(boss) {
    if (isUnlocked(boss)) return null;
    if (boss.needAll) return `Needs ${boss.needMastery}% mastery in every Year 12 module`;
    return `Needs ${boss.needMastery}% mastery in ${B.moduleName(boss.mod)} ` +
           `(you have ${S.mastery(boss.mod)}%)`;
  }

  function screen(view, args) {
    const boss = BOSSES.find(b => b.id === (args && args.id)) || BOSSES[0];
    if (!isUnlocked(boss)) {
      view.appendChild(U.el("div", { class: "empty" }, [
        U.el("div", { class: "empty-ico", text: "🔒" }),
        U.el("h3", { text: boss.name + " is locked" }),
        U.el("p", { text: lockReason(boss) }),
        U.el("button", { class: "btn btn-primary", text: "Back to games",
                         on: { click: () => UI.go("/play") } })
      ]));
      return;
    }

    const diff = S.difficulty();
    const opts = { maxDiff: 3, minDiff: 2 };
    if (boss.mod) opts.mods = [boss.mod];
    else opts.year = 12;
    let pool = B.draw(30, opts);
    const gen = PHYS.Gen.draw(10, { mods: opts.mods, year: opts.year }).map(PHYS.Gen.toMcq);
    pool = U.shuffle(pool.concat(gen));
    if (!pool.length) { UI.go("/play"); return; }

    const shell = UI.gameShell(boss.name, { confirmExit: true });
    view.appendChild(shell.root);

    const run = {
      i: 0, correct: 0, answered: 0, over: false, xp: 0,
      bossHp: boss.hp, myHp: 100, streak: 0, flawless: true,
      left: Math.round(22 * diff.timer), deadline: 0, pace: UI.pacer(),
      answeredThis: false, shieldArmed: false, doubled: false, revived: false,
      usedFreeze: false, usedInsight: false, puUsed: {}
    };

    const timerChip = U.el("span", { class: "timer-ring", text: U.fmtTime(run.left) });
    shell.meta.appendChild(timerChip);

    const bars = U.el("div", { class: "grid" }, [
      U.el("div", {}, [
        U.el("div", { class: "row" }, [
          U.el("span", { style: "font-size:26px", text: boss.icon }),
          U.el("strong", { text: boss.name }),
          U.el("span", { class: "spacer" }),
          U.el("span", { class: "tiny muted", id: "boss-hp-text", text: boss.hp + " / " + boss.hp })
        ]),
        U.el("div", { class: "hpbar enemy" }, [U.el("i", { id: "boss-hp", style: "width:100%" })])
      ]),
      U.el("div", {}, [
        U.el("div", { class: "row" }, [
          U.el("span", { style: "font-size:22px", text: S.data.profile.avatar }),
          U.el("strong", { text: "You" }),
          U.el("span", { class: "spacer" }),
          U.el("span", { class: "tiny muted", id: "my-hp-text", text: "100 / 100" })
        ]),
        U.el("div", { class: "hpbar" }, [U.el("i", { id: "my-hp", style: "width:100%" })])
      ])
    ]);
    shell.body.appendChild(U.el("div", { class: "card" }, [
      U.el("p", { class: "muted tiny", text: boss.blurb }), bars
    ]));

    const card = U.el("div", { class: "qcard" });
    shell.body.appendChild(card);
    const powerRow = U.el("div", { class: "powerups" });
    shell.body.appendChild(powerRow);
    const doubleChip = UI.chip("✖️ ×2 XP", "on");
    doubleChip.hidden = true;
    shell.meta.appendChild(doubleChip);

    /* Power-ups (core/powerups.js): freeze +15 s, shield blocks the next hit,
       insight names the topic and a trap, double arms ×2 XP before the first
       answer; revive fires by itself on a knockout. Fifty/skip are quiz-only. */
    function refreshPowerups() {
      powerRow.innerHTML = "";
      const q = pool[run.i], P = PHYS.Powerups;
      const live = !!q && !run.answeredThis && !run.over;
      powerRow.appendChild(P.button("freeze", run.usedFreeze || !live, () => {
        run.usedFreeze = true; run.puUsed.freeze = 1;
        run.deadline += 15000;
        UI.toast({ icon: "🧊", text: "<b>Freeze</b> — +15 s on the clock." });
        refreshPowerups();
      }, "+15 s on the clock"));
      powerRow.appendChild(P.button("shield", run.shieldArmed, () => {
        run.shieldArmed = true; run.puUsed.shield = 1;
        UI.toast({ icon: "🛡️", text: "<b>Shield up</b> — it blocks the boss's next hit." });
        refreshPowerups();
      }, "Blocks the boss's next hit"));
      powerRow.appendChild(P.button("insight", run.usedInsight || !live, () => {
        run.usedInsight = true; run.puUsed.insight = 1;
        const ch = card.querySelector(".choices");
        card.insertBefore(P.insight(q), ch);
        refreshPowerups();
      }, "Show the topic and a common trap"));
      powerRow.appendChild(P.button("double", run.doubled || run.answered > 0, () => {
        run.doubled = true; run.puUsed.double = 1; doubleChip.hidden = false;
        UI.toast({ icon: "✖️", kind: "xp", text: "<b>Double XP</b> — this fight pays ×2." });
        refreshPowerups();
      }, run.answered > 0 ? "Arm it before your first answer" : "×2 XP for this fight"));
    }
    UI.mcqKeys(card);

    function syncBars() {
      U.$("#boss-hp").style.width = U.clamp((run.bossHp / boss.hp) * 100, 0, 100) + "%";
      U.$("#boss-hp-text").textContent = Math.max(0, Math.round(run.bossHp)) + " / " + boss.hp;
      U.$("#my-hp").style.width = U.clamp(run.myHp, 0, 100) + "%";
      U.$("#my-hp-text").textContent = Math.max(0, Math.round(run.myHp)) + " / 100";
    }

    function render() {
      if (run.over) return;
      if (run.i >= pool.length) pool = pool.concat(U.shuffle(B.draw(20, opts)));
      const q = pool[run.i];
      card.innerHTML = "";
      card.appendChild(U.el("div", { class: "qtag" }, [
        UI.chip(B.moduleName(q.mod)), UI.chip(q.topic), UI.chip("★".repeat(q.diff)),
        run.streak >= 2 ? UI.chip("🔥 combo ×" + (1 + run.streak * 0.25).toFixed(2), "warnchip") : null
      ]));
      card.appendChild(U.el("div", { class: "qtext", html: U.math(q.q) }));
      if (q.diagram || q.graph) {
        card.insertAdjacentHTML("beforeend", PHYS.Draw.wrap(PHYS.Draw.forSpec(q.diagram || q.graph)));
      }
      const choices = U.el("div", { class: "choices" });
      q.choices.forEach((t, idx) => {
        choices.appendChild(U.el("button", { class: "choice", on: { click: () => answer(idx) } }, [
          U.el("span", { class: "choice-key", text: "ABCD"[idx] }),
          U.el("span", { class: "choice-txt", html: U.math(t) })
        ]));
      });
      card.appendChild(choices);
      run.pace.show(q.q);
      run.deadline = Date.now() + Math.round(22 * diff.timer) * 1000;
      run.answeredThis = false; run.usedFreeze = false; run.usedInsight = false;
      refreshPowerups();
    }

    function answer(idx, timedOut) {
      if (run.over || run.answeredThis) return;
      /* One answer per question: the clock used to keep running while the
         feedback was read, landing a second "too slow" hit on the same question. */
      run.answeredThis = true;
      const q = pool[run.i];
      const isCorrect = idx === q.a;
      const tooFast = run.pace.mark();
      U.$$(".choice", card).forEach((el, i) => {
        el.disabled = true;
        if (i === q.a) el.classList.add("correct");
        else if (i === idx) el.classList.add("wrong");
      });
      run.answered++;

      if (isCorrect) {
        run.correct++;
        run.streak++;
        const combo = 1 + run.streak * 0.25;
        run.bossHp -= 14 * q.diff * combo / 2;
        run.xp += tooFast ? 0 : Math.round(12 * q.diff);
        PHYS.Sound.zap();
        const r = card.getBoundingClientRect();
        PHYS.FX.burst(r.left + r.width / 2, r.top + 30, 18);
      } else {
        run.streak = 0;
        run.flawless = false;
        if (run.shieldArmed) {
          run.shieldArmed = false;
          UI.toast({ icon: "🛡️", kind: "good", text: "<b>Shield</b> — the hit was blocked." });
        } else {
          /* Difficulty scales how hard the boss hits back (shared `.boss`). */
          run.myHp -= Math.round((timedOut ? 18 : 14) * (diff.boss || 1));
        }
        run.xp = Math.max(0, run.xp - 5);
        PHYS.Sound.wrong();
        PHYS.FX.shake(card);
      }
      S.recordAnswer(q.mod, isCorrect, q.generated ? null : q.id, q.topic);
      if (q.generated && !isCorrect) S.recordGenMistake(q.template, q.mod, q.topic, (q.why || [])[idx]);
      syncBars();

      const fb = U.el("div", { class: "feedback " + (isCorrect ? "ok" : "no") });
      fb.appendChild(U.el("div", { html: (isCorrect ? "<b>Hit.</b> " : timedOut ? "<b>Too slow.</b> " : "<b>Blocked.</b> ") +
        (isCorrect ? "" : "The answer is <b>" + U.math(q.choices[q.a]) + "</b>.") }));
      const why = (q.why || [])[idx];
      if (!isCorrect && why) fb.appendChild(U.el("span", { class: "misc", html: "You " + U.math(why) + "." }));
      if (q.explain && typeof q.explain === "string") {
        fb.appendChild(U.el("div", { style: "margin-top:6px", html: U.math(q.explain) }));
      }
      card.appendChild(fb);

      if (run.myHp <= 0 && run.bossHp > 0 && !run.revived && PHYS.Powerups.tryRevive()) {
        run.revived = true; run.puUsed.revive = 1; run.myHp = 50; syncBars();
      }
      refreshPowerups();
      if (run.bossHp <= 0) return setTimeout(() => finish(true), 700);
      if (run.myHp <= 0) return setTimeout(() => finish(false), 700);
      card.appendChild(U.el("button", {
        class: "btn btn-primary btn-block", style: "margin-top:12px", text: "Strike again →",
        on: { click: () => { run.i++; render(); } }
      }));
    }

    const tick = setInterval(() => {
      if (run.over) return;
      const left = Math.ceil((run.deadline - Date.now()) / 1000);
      timerChip.textContent = U.fmtTime(Math.max(0, left));
      timerChip.classList.toggle("low", left <= 6);
      if (left <= 0) answer(-1, true);
    }, 500);
    UI.onLeave(() => clearInterval(tick));

    function finish(won) {
      if (run.over) return;
      run.over = true;
      clearInterval(tick);
      const accuracy = run.answered ? run.correct / run.answered : 0;
      /* Losing still pays for the questions actually answered correctly, but the
         completion bonus is only for a win — and it is scaled by accuracy, so
         grinding a boss down by brute force pays little. */
      const bonus = won ? Math.round(160 * accuracy) : 0;
      const res = UI.award({
        xp: run.xp, bonus, accuracy, pace: run.pace,
        coins: won ? Math.round(140 * accuracy) : Math.round(run.xp * 0.2),
        boost: run.doubled ? 2 : undefined
      });
      S.markMode("boss");
      if (won) {
        /* markBoss counts the win, the flawless win and the overall boss tally. */
        S.markBoss(boss.id, { flawless: run.flawless });
        if (run.myHp <= 20) S.bump("clutchWins");
        if (S.data.settings.difficulty === "hard") S.bump("hardWins");
        if (S.data.settings.difficulty === "nightmare") S.bump("nightmareWins");
        S.save();
      }
      UI.results({
        title: won ? boss.name + " defeated" : "Defeated by " + boss.name,
        correct: run.correct, total: run.answered, xp: res.xp, coins: res.coins,
        extraStats: [
          ["Boss HP left", Math.max(0, Math.round(run.bossHp))],
          ["Your HP left", Math.max(0, Math.round(run.myHp))],
          ["Flawless", run.flawless && won ? "yes" : "no"]
        ].concat(run.revived ? [["Revived", "yes"]] : []),
        onAgain: () => UI.go("/game/boss/" + boss.id)
      });
    }

    syncBars();
    render();
    return () => clearInterval(tick);
  }

  return { screen, BOSSES, isUnlocked, lockReason };
})();
