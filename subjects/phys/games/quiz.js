/* The multiple-choice engine. Four modes share it:

     Rapid Fire     2 minutes, endless, streak multiplier to ×3
     Module Drill   15 adaptive questions from one module
     Survival       one life, tightening clock
     Mistake Rehab  only what has previously been missed

   Authored and generated questions both flow through here — a generated one
   arrives already converted to four identically-formatted options, so the player
   cannot tell which is which, which is the point.

   Anti-farming, all of it in one place so it cannot drift between modes:
     · an answer faster than UI.MIN_READ_MS pays nothing (it cannot have been read)
     · a wrong answer costs XP, so guessing has a negative expectation
     · the completion bonus is withheld entirely below 50% accuracy
     · the streak multiplier resets on any wrong answer                          */
window.PHYS = window.PHYS || {};
PHYS.Games = PHYS.Games || {};

PHYS.Games.quiz = (function () {
  const U = PHYS.U, S = PHYS.State, UI = PHYS.UI, B = PHYS.Bank;

  const MODES = {
    rapid: {
      name: "Rapid Fire", icon: "⚡", timed: 120, endless: true,
      blurb: "Two minutes. Keep a streak alive for up to ×3 XP."
    },
    drill: {
      name: "Module Drill", icon: "🎯", count: 15,
      blurb: "Fifteen adaptive questions from one module."
    },
    survival: {
      name: "Survival", icon: "💀", endless: true, lives: 1, perQuestion: 20,
      blurb: "One life. The clock tightens every five questions."
    },
    rehab: {
      name: "Mistake Rehab", icon: "🩹", count: 12,
      blurb: "Only the questions you have got wrong before."
    }
  };

  /* Answers past this many, in a mode that ends on a clock rather than a count,
     pay half. See the note where it is applied. Set at the length of a full Module
     Drill plus a bit, so a human run is never affected. */
  const FULL_RATE_ANSWERS = 20;

  /** Streak multiplier: ×1 → ×3 in half steps every 5 correct. */
  const multiplierFor = streak => Math.min(3, 1 + Math.floor(streak / 5) * 0.5);

  /**
   * Build the question list for a mode.
   * Rapid Fire and Survival mix authored and generated questions; the generated
   * ones keep the calculation muscles working inside a mostly-conceptual run.
   */
  function buildPool(mode, args) {
    const diff = S.difficulty();
    const opts = { maxDiff: diff.maxDiff };
    if (args && args.mod) opts.mods = [args.mod];

    if (mode === "rehab") {
      const missed = B.mistakeQuestions();
      return missed.slice(0, MODES.rehab.count);
    }
    if (mode === "drill") {
      const authored = B.draw(11, opts);
      const generated = PHYS.Gen.draw(4, { mods: opts.mods, maxDiff: diff.maxDiff })
                                .map(PHYS.Gen.toMcq);
      return U.shuffle(authored.concat(generated));
    }
    // Endless modes draw a long list up front and top it up if it runs out.
    const authored = B.draw(40, opts);
    const generated = PHYS.Gen.draw(14, { mods: opts.mods, maxDiff: diff.maxDiff })
                              .map(PHYS.Gen.toMcq);
    return U.shuffle(authored.concat(generated));
  }

  function screen(view, mode, args) {
    const cfg = MODES[mode];
    if (!cfg) { UI.go("/play"); return; }
    const diff = S.difficulty();

    let pool = buildPool(mode, args);
    if (!pool.length) {
      view.appendChild(U.el("div", { class: "empty" }, [
        U.el("div", { class: "empty-ico", text: cfg.icon }),
        U.el("h3", { text: mode === "rehab" ? "Nothing to rehabilitate" : "No questions available" }),
        U.el("p", { text: mode === "rehab"
          ? "You have not got anything wrong yet. Play a run first — every question you miss lands here."
          : "Try a different module." }),
        U.el("button", { class: "btn btn-primary", text: "Back to games",
                         on: { click: () => UI.go("/play") } })
      ]));
      return;
    }

    const title = cfg.name + (args && args.mod ? " — " + B.moduleName(args.mod) : "");
    const shell = UI.gameShell(title, { confirmExit: true });
    view.appendChild(shell.root);

    const state = {
      i: 0, correct: 0, answered: 0, streak: 0, bestStreak: 0,
      xp: 0, lives: cfg.lives || Infinity, over: false,
      timeLeft: cfg.timed || 0, perQuestion: cfg.perQuestion || 0,
      questionDeadline: 0, usedFifty: false, usedSkip: false, usedFreeze: false, usedInsight: false,
      answeredThis: false, shieldArmed: false, doubled: false, revived: false, puUsed: {},
      pace: UI.pacer()
    };

    /* ── chrome ── */
    const scoreChip = UI.chip("0", "on");
    const streakChip = UI.chip("🔥 0");
    const timerChip = U.el("span", { class: "timer-ring", text: cfg.timed ? U.fmtTime(cfg.timed) : "—" });
    const progChip = UI.chip("");
    shell.meta.appendChild(scoreChip);
    shell.meta.appendChild(streakChip);
    if (cfg.timed || cfg.perQuestion) shell.meta.appendChild(timerChip);
    if (cfg.count) shell.meta.appendChild(progChip);
    const livesChip = UI.chip("❤️ 1", "warnchip");
    if (cfg.lives) shell.meta.appendChild(livesChip);
    const doubleChip = UI.chip("✖️ ×2 XP", "on");
    doubleChip.hidden = true;
    shell.meta.appendChild(doubleChip);

    const card = U.el("div", { class: "qcard" });
    shell.body.appendChild(card);
    UI.mcqKeys(card);

    const powerRow = U.el("div", { class: "powerups" });
    shell.body.appendChild(powerRow);

    /* ── timers ──
       One interval for everything, so there is exactly one place a run can end. */
    let tick = null;
    function startClock() {
      if (tick) clearInterval(tick);
      tick = setInterval(() => {
        if (state.over) return;
        if (cfg.timed) {
          state.timeLeft -= 1;
          timerChip.textContent = U.fmtTime(Math.max(0, state.timeLeft));
          timerChip.classList.toggle("low", state.timeLeft <= 15);
          if (state.timeLeft <= 5 && state.timeLeft > 0) PHYS.Sound.tick();
          if (state.timeLeft <= 0) return finish();
        }
        if (state.perQuestion && state.questionDeadline) {
          const left = Math.ceil((state.questionDeadline - Date.now()) / 1000);
          timerChip.textContent = U.fmtTime(Math.max(0, left));
          timerChip.classList.toggle("low", left <= 5);
          if (left <= 0) {
            // Running out of time counts as a wrong answer, not as a free pass.
            answer(-1, true);
          }
        }
      }, 1000);
      UI.onLeave(() => clearInterval(tick));
    }

    /* Power-ups (see core/powerups.js). Fifty, skip, freeze and insight are
       per question; shield and double are armed for the run; revive fires on its
       own when Survival's one life runs out. */
    function refreshPowerups() {
      powerRow.innerHTML = "";
      const q = pool[state.i];
      const P = PHYS.Powerups;
      const live = !!q && !state.answeredThis;
      powerRow.appendChild(P.button("fifty", state.usedFifty || !live, () => {
        state.usedFifty = true; state.puUsed.fifty = (state.puUsed.fifty || 0) + 1;
        const wrongs = U.$$(".choice", card).filter((el, i) => i !== q.a && !el.disabled);
        U.sample(wrongs, 2).forEach(el => { el.classList.add("dimmed"); el.disabled = true; });
        refreshPowerups();
      }));
      powerRow.appendChild(P.button("skip", state.usedSkip || !live, () => {
        state.usedSkip = true; state.puUsed.skip = (state.puUsed.skip || 0) + 1;
        next();
      }));
      if (cfg.timed || cfg.perQuestion) {
        powerRow.appendChild(P.button("freeze", state.usedFreeze || !live, () => {
          state.usedFreeze = true; state.puUsed.freeze = (state.puUsed.freeze || 0) + 1;
          if (cfg.timed) { state.timeLeft += 15; timerChip.textContent = U.fmtTime(state.timeLeft); }
          if (state.perQuestion && state.questionDeadline) state.questionDeadline += 15000;
          UI.toast({ icon: "🧊", text: "<b>Freeze</b> — +15 s on the clock." });
          refreshPowerups();
        }, "+15 s on the clock"));
      }
      powerRow.appendChild(P.button("shield", state.shieldArmed, () => {
        state.shieldArmed = true; state.puUsed.shield = (state.puUsed.shield || 0) + 1;
        UI.toast({ icon: "🛡️", text: "<b>Shield up</b> — your next wrong answer keeps your streak." });
        refreshPowerups();
      }, "Your next wrong answer keeps your streak"));
      powerRow.appendChild(P.button("insight", state.usedInsight || !live, () => {
        state.usedInsight = true; state.puUsed.insight = (state.puUsed.insight || 0) + 1;
        const box = P.insight(q);
        const ch = card.querySelector(".choices");
        if (ch) card.insertBefore(box, ch); else card.appendChild(box);
        refreshPowerups();
      }, "Show the topic and a common trap"));
      powerRow.appendChild(P.button("double", state.doubled || state.answered > 0, () => {
        state.doubled = true; state.puUsed.double = 1;
        doubleChip.hidden = false;
        UI.toast({ icon: "✖️", kind: "xp", text: "<b>Double XP</b> — this run pays ×2." });
        refreshPowerups();
      }, state.answered > 0 ? "Arm it before your first answer" : "×2 XP for this run"));
    }

    /* ── rendering ── */
    function render() {
      if (state.over) return;
      if (state.i >= pool.length) {
        if (!cfg.endless) return finish();
        // Endless modes top up rather than ending; the bank is big enough that
        // repeats are rare, and a repeat is better than a run that stops early.
        pool = pool.concat(buildPool(mode, args));
        if (state.i >= pool.length) return finish();
      }
      const q = pool[state.i];
      state.usedFifty = false;
      state.usedSkip = false;
      state.usedFreeze = false;
      state.usedInsight = false;
      state.answeredThis = false;
      card.innerHTML = "";

      const tags = U.el("div", { class: "qtag" }, [
        UI.chip(B.moduleName(q.mod)),
        UI.chip(q.topic),
        UI.chip("★".repeat(q.diff)),
        q.generated ? UI.chip("computed", "warnchip") : null
      ]);
      card.appendChild(tags);
      card.appendChild(U.el("div", { class: "qtext", html: U.math(q.q) }));

      const spec = q.diagram || q.graph;
      if (spec) card.insertAdjacentHTML("beforeend", PHYS.Draw.wrap(PHYS.Draw.forSpec(spec)));

      const choices = U.el("div", { class: "choices" });
      q.choices.forEach((text, idx) => {
        choices.appendChild(U.el("button", {
          class: "choice", on: { click: () => answer(idx) }
        }, [
          U.el("span", { class: "choice-key", text: "ABCD"[idx] }),
          U.el("span", { class: "choice-txt", html: U.math(text) })
        ]));
      });
      card.appendChild(choices);

      state.pace.show(q.q);
      if (state.perQuestion) {
        const shrink = Math.max(6, state.perQuestion - Math.floor(state.answered / 5) * 2);
        state.questionDeadline = Date.now() + shrink * 1000 * diff.timer;
      }
      progChip.textContent = cfg.count ? `${state.i + 1}/${Math.min(cfg.count, pool.length)}` : "";
      refreshPowerups();
    }

    /* ── answering ── */
    function answer(idx, timedOut) {
      if (state.over) return;
      /* One answer per question. Survival's per-question clock kept running after an
         answer in the stand-alone app, so reading the feedback past the deadline
         recorded a second, timed-out wrong answer for the same question. */
      if (state.answeredThis) return;
      const q = pool[state.i];
      const isCorrect = idx === q.a;
      state.answeredThis = true;
      state.questionDeadline = 0;

      U.$$(".choice", card).forEach((el, i) => {
        el.disabled = true;
        if (i === q.a) el.classList.add("correct");
        else if (i === idx) el.classList.add("wrong");
      });

      /* An answer faster than a person can read the question cannot have been
         read. It scores as answered — so it still costs the run its accuracy —
         but it pays no XP, and if EVERY answer in the run was like that, award()
         withholds the completion bonus too. */
      const tooFast = state.pace.mark();

      state.answered++;
      if (isCorrect) {
        state.correct++;
        state.streak++;
        state.bestStreak = Math.max(state.bestStreak, state.streak);
        const mult = multiplierFor(state.streak);
        /* Diminishing returns past a full run's worth of questions, in the modes
           where the clock — not a question count — decides when you stop.

           tests/honest.js measured Rapid Fire at 127 000 XP/hour against Graph
           Stories' 12 000: ten times the pay for the same minute. Nothing was
           broken, and no gate was leaking. Two minutes with no question cap and a
           ×3 streak multiplier simply lets a fast, correct player bank forty
           multiplied answers, and a student who knows that will grind Rapid Fire
           instead of studying the modes they are weak at. Which is the whole thing
           §8 is trying to prevent.

           The first FULL_RATE_ANSWERS still pay in full, so the mode plays exactly
           as before for anyone who is not a machine; beyond that each answer is
           worth half. Accuracy, streaks and the completion bonus are untouched. */
        const beyond = cfg.endless && state.correct > FULL_RATE_ANSWERS;
        const taper = beyond ? 0.5 : 1;
        const gained = tooFast ? 0 : Math.round(10 * q.diff * mult * taper);
        state.xp += gained;
        PHYS.Sound.correct();
        if (!tooFast) {
          const r = card.getBoundingClientRect();
          PHYS.FX.burst(r.left + r.width / 2, r.top + 40, 14);
        }
        S.bump("calcsCorrect", q.generated ? 1 : 0);
      } else {
        /* Shield: the streak survives one wrong answer. The XP cost still applies. */
        if (state.shieldArmed) {
          state.shieldArmed = false;
          UI.toast({ icon: "🛡️", kind: "good", text: "<b>Shield held</b> — streak kept at " + state.streak + "." });
        } else state.streak = 0;
        // A wrong answer costs, so guessing has a negative expectation.
        state.xp = Math.max(0, state.xp - 4);
        PHYS.Sound.wrong();
        PHYS.FX.shake(card);
        if (state.lives !== Infinity) state.lives--;
      }

      S.recordAnswer(q.mod, isCorrect, q.generated ? null : q.id, q.topic);
      if (q.generated) {
        if (isCorrect) S.clearGenMistake(q.template);
        else S.recordGenMistake(q.template, q.mod, q.topic,
                                idx >= 0 ? (q.why || [])[idx] : "ran out of time");
      }
      S.noteStreak(state.bestStreak);
      scoreChip.textContent = String(state.correct);
      streakChip.textContent = "🔥 " + state.streak +
        (multiplierFor(state.streak) > 1 ? "  ×" + multiplierFor(state.streak) : "");
      UI.pulse(streakChip);

      card.appendChild(feedback(q, idx, isCorrect, tooFast, timedOut));
      if (state.lives <= 0 && !state.revived && PHYS.Powerups.tryRevive()) {
        state.revived = true; state.puUsed.revive = 1; state.lives = 1;
      }
      livesChip.textContent = "❤️ " + Math.max(0, state.lives);
      refreshPowerups();
      if (state.lives <= 0) { setTimeout(finish, 900); return; }
      card.appendChild(U.el("button", {
        class: "btn btn-primary btn-block", style: "margin-top:12px",
        text: state.i + 1 >= (cfg.count || Infinity) ? "See results" : "Next question →",
        on: { click: next }
      }));
    }

    function feedback(q, idx, isCorrect, tooFast, timedOut) {
      const box = U.el("div", { class: "feedback " + (isCorrect ? "ok" : "no") });
      box.appendChild(U.el("div", { html:
        (isCorrect ? "<b>Correct.</b> " : timedOut ? "<b>Out of time.</b> " : "<b>Not quite.</b> ") +
        (isCorrect ? "" : "The answer is <b>" + U.math(q.choices[q.a]) + "</b>.") }));

      /* Naming the misconception is the whole value of a wrong answer. Generated
         questions carry one per distractor by construction; authored ones carry
         them where the option is a specific, common mistake. */
      const why = (q.why || [])[idx];
      if (!isCorrect && why) {
        box.appendChild(U.el("span", { class: "misc", html: "You " + U.math(why) + "." }));
      }
      if (q.explain && typeof q.explain === "string") {
        box.appendChild(U.el("div", { style: "margin-top:7px", html: U.math(q.explain) }));
      } else if (Array.isArray(q.explain) && q.explain.length) {
        const w = U.el("div", { class: "working" });
        q.explain.forEach((step, i) => {
          if (!step.eq && !step.note) return;
          w.appendChild(U.el("div", { class: "wstep" }, [
            U.el("span", { class: "wstep-n", text: String(i + 1) }),
            U.el("span", { class: "wstep-b" }, [
              step.eq ? U.el("span", { html: U.math(step.eq) }) : null,
              step.note ? U.el("span", { class: "wstep-note", html: U.math(step.note) }) : null
            ])
          ]));
        });
        box.appendChild(w);
      }
      if (tooFast && isCorrect) {
        box.appendChild(U.el("span", { class: "misc",
          text: "Answered faster than the question can be read, so that one paid no XP." }));
      }
      return box;
    }

    function next() {
      state.i++;
      if (!cfg.endless && state.i >= (cfg.count || pool.length)) return finish();
      render();
    }

    /* ── results ── */
    function finish() {
      if (state.over) return;
      state.over = true;
      clearInterval(tick);

      const accuracy = state.answered ? state.correct / state.answered : 0;
      /* The completion bonus scales with accuracy and is withheld entirely below
         50%, so finishing a run by tapping through it pays nothing on top. */
      const bonus = Math.round(state.correct * 6 + state.bestStreak * 4);
      const streakBonus = S.touchStreak().changed ? S.streakBonus() : 0;

      const res = UI.award({
        xp: state.xp, bonus: bonus + streakBonus, accuracy, pace: state.pace,
        coins: Math.round(state.xp * 0.4 + state.correct * 2),
        boost: state.doubled ? 2 : undefined
      });

      S.markMode(mode);
      if (state.answered && state.correct === state.answered && state.answered >= 5) S.bump("perfectRuns");
      if (mode === "survival") {
        if (state.correct > (S.data.stats.survivalBest || 0)) {
          S.data.stats.survivalBest = state.correct;
          S.save();
        }
      }
      if (mode === "rehab") S.bump("mistakesFixed", 0);
      const newBest = S.recordScore(mode + (args && args.mod ? ":" + args.mod : ""), state.correct);
      if (S.progressDaily(mode, state.correct)) {
        UI.toast({ icon: "📅", kind: "good", text: "<b>Daily challenge complete!</b> Claim it on the Lab screen." });
      }

      UI.results({
        title: cfg.name + " complete",
        correct: state.correct, total: state.answered,
        xp: res.xp, coins: res.coins, newBest,
        extraStats: [
          ["Best streak", state.bestStreak],
          ["Multiplier", "×" + multiplierFor(state.bestStreak)],
          ["Bonus", streakBonus ? "+" + streakBonus + " streak" : (accuracy < 0.5 ? "withheld" : "+" + bonus)]
        ].concat(Object.keys(state.puUsed).length
          ? [["Power-ups", Object.keys(state.puUsed).map(k => PHYS.Powerups.META[k] ? PHYS.Powerups.META[k].icon : "💖").join(" ")]] : []),
        onAgain: () => UI.go("/game/" + mode + (args && args.mod ? "/" + args.mod : ""))
      });
    }

    render();
    startClock();
    return () => clearInterval(tick);
  }

  return { screen, MODES, multiplierFor, buildPool };
})();
