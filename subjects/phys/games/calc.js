/* Calculation Crunch — the generator engine of §5, and the highest-value mode.

   Ten computed questions, typed numeric answers, full worked solutions.

   Three things this mode gets specifically right:

   · MARKING (§5.7). Accepted within a fractional tolerance, not exact-match, and
     accepted in ANY dimensionally-equivalent unit — a student who typed km h⁻¹
     where the app computed m s⁻¹ is not wrong. The tolerance is stated on screen
     so being marked right is never mysterious, and significant figures are never
     a hidden reason for a red cross.

   · THE HELPER LATCHES (addendum §C3). "Show me the equation" is a genuine crutch,
     so it costs 25% of the run and the flag is set the moment it is first used and
     never cleared. Switching it off before submitting used to refund the penalty.

   · THE RESULTS ARE GATED (addendum §H1). Submitting the last answer does NOT
     throw a modal over the worked solution the student is reading. Physics working
     is long; they press a button when they are ready.                            */
window.PHYS = window.PHYS || {};
PHYS.Games = PHYS.Games || {};

PHYS.Games.calc = (function () {
  const U = PHYS.U, S = PHYS.State, UI = PHYS.UI, Un = PHYS.Units, G = PHYS.Gen;

  const COUNT = 10;
  /** The crutch costs a quarter of the run. Latched, never refunded. */
  const HINT_PENALTY = 0.25;

  function screen(view, args) {
    const diff = S.difficulty();
    const mod = args && args.mod;
    const questions = [];
    for (let i = 0; i < COUNT; i++) questions.push(null);

    let pool = G.draw(COUNT, { mods: mod ? [mod] : null, maxDiff: diff.maxDiff });
    if (pool.length < COUNT) pool = pool.concat(G.draw(COUNT - pool.length, {}));
    if (!pool.length) { UI.go("/play"); return; }

    const shell = UI.gameShell("Calculation Crunch" + (mod ? " — " + PHYS.Bank.moduleName(mod) : ""),
                               { confirmExit: true });
    view.appendChild(shell.root);

    const state = {
      i: 0, correct: 0, answered: 0, xp: 0, over: false,
      attempts: 0, totalAttempts: 0, pace: UI.pacer(),
      hintLatched: false,            // one-way door, never cleared
      results: null
    };

    const scoreChip = UI.chip("0", "on");
    const progChip = UI.chip("1/" + COUNT);
    const penaltyChip = UI.chip("", "warnchip");
    penaltyChip.hidden = true;
    shell.meta.appendChild(scoreChip);
    shell.meta.appendChild(progChip);
    shell.meta.appendChild(penaltyChip);

    const card = U.el("div", { class: "qcard" });
    shell.body.appendChild(card);
    const tail = U.el("div", { class: "grid" });
    shell.body.appendChild(tail);

    function render() {
      const q = pool[state.i];
      state.attempts = 0;
      card.innerHTML = "";
      tail.innerHTML = "";
      progChip.textContent = (state.i + 1) + "/" + COUNT;

      card.appendChild(U.el("div", { class: "qtag" }, [
        UI.chip(PHYS.Bank.moduleName(q.mod)),
        UI.chip(q.topic),
        UI.chip("★".repeat(q.diff))
      ]));
      card.appendChild(U.el("div", { class: "qtext", html: U.math(q.q) }));
      if (q.diagram || q.graph) {
        card.insertAdjacentHTML("beforeend", PHYS.Draw.wrap(PHYS.Draw.forSpec(q.diagram || q.graph)));
      }

      /* The unit selector is how "any dimensionally equivalent unit" is offered
         without asking a student to type units on a phone keyboard. The default
         is the unit the answer was computed in; the alternatives are all
         dimensionally identical, so choosing one only changes the number. */
      const expected = Un.str(q.answer.units);
      const alternatives = equivalentUnits(q.answer.units, expected);
      const input = U.el("input", {
        class: "numin js-answer", type: "text", inputmode: "decimal",
        placeholder: "your answer", autocomplete: "off",
        "aria-label": "your answer"
      });
      const unitSel = alternatives.length > 1
        ? U.el("select", { class: "unitsel", "aria-label": "units" },
            alternatives.map(u => U.el("option", { value: u, text: U.mathPlain(u) })))
        : U.el("span", { class: "unitsel", style: "display:grid;place-items:center",
                         html: U.math(expected || "—") });

      const row = U.el("div", { class: "ansrow", style: "margin-top:16px" }, [input, unitSel]);
      card.appendChild(row);
      card.appendChild(U.el("div", { class: "unit-hint", html:
        "Accepted within <b>" + Math.round(q.tolerance * 100) + "%</b>" +
        (alternatives.length > 1 ? " — any of the units offered is fine." :
                                   (expected ? " — answer in " + U.math("\\u{" + expected + "}") + "." : ".")) }));

      const submit = U.el("button", {
        class: "btn btn-primary btn-block", style: "margin-top:12px", text: "Submit",
        on: { click: () => check() }
      });
      card.appendChild(submit);
      input.addEventListener("keydown", e => { if (e.key === "Enter") check(); });

      /* The crutch. Costs the run 25%, latches on first use, and says so before
         it is used rather than after. */
      const hintBtn = U.el("button", {
        class: "btn btn-ghost btn-sm btn-block", style: "margin-top:8px",
        text: state.hintLatched ? "💡 Show the equation (already charged)"
                                : "💡 Show the equation (costs 25% of this run)",
        on: { click: () => {
          state.hintLatched = true;                 // one-way: never cleared
          updatePenaltyChip();
          hintBtn.disabled = true;
          const eq = (q.working[0] && q.working[0].eq) || q.routes && q.routes[0] || "";
          tail.appendChild(U.el("div", { class: "feedback", html:
            "<b>Start from</b><br>" + U.math(eq) +
            (q.hint ? "<br><span class='wstep-note'>" + U.math(q.hint) + "</span>" : "") }));
        } }
      });
      card.appendChild(hintBtn);

      state.pace.show(q.q);
      setTimeout(() => input.focus({ preventScroll: true }), 60);

      function check() {
        if (state.over) return;
        const raw = input.value.trim();
        if (!raw) { input.focus(); return; }
        const chosenUnit = unitSel.value || expected;
        state.attempts++;
        state.totalAttempts++;

        const typed = U.parseNum(raw);
        let value = typed;
        // Convert whatever unit they chose into the units the answer is stored in.
        if (isFinite(typed) && chosenUnit && chosenUnit !== expected) {
          const si = Un.toSI(typed, chosenUnit);
          const target = Un.toSI(1, expected);
          if (si && target) value = si.value / target.value;
        }
        const ok = isFinite(value) && U.numClose(value, q.answer.value, q.tolerance);

        if (!ok && state.attempts === 1) {
          /* One retry, and it is charged. A "try again" that costs nothing is a
             free undo, and the cheapest strategy becomes guess-then-correct. */
          PHYS.Sound.wrong();
          PHYS.FX.shake(card);
          input.select();
          tail.innerHTML = "";
          tail.appendChild(U.el("div", { class: "feedback no", html:
            "<b>Not that.</b> One more attempt — it is worth half marks. " +
            nearMissHint(q, value) }));
          return;
        }

        submit.disabled = true;
        hintBtn.disabled = true;
        input.disabled = true;
        if (unitSel.tagName === "SELECT") unitSel.disabled = true;

        state.answered++;
        const tooFast = state.pace.mark();
        if (ok) {
          state.correct++;
          // Half marks on the second attempt: right is right, but not as right.
          const share = state.attempts === 1 ? 1 : 0.5;
          const gained = tooFast ? 0 : Math.round(10 * q.diff * share);
          state.xp += gained;
          PHYS.Sound.correct();
          S.bump("calcsCorrect");
          S.clearGenMistake(q.template);
        } else {
          state.xp = Math.max(0, state.xp - 4);
          PHYS.Sound.wrong();
          S.recordGenMistake(q.template, q.mod, q.topic, nearestMisconception(q, value));
        }
        S.recordAnswer(q.mod, ok, null, q.topic);
        scoreChip.textContent = String(state.correct);

        tail.innerHTML = "";
        tail.appendChild(verdict(q, value, ok, tooFast));
        if (ok && S.sigFigOn()) tail.appendChild(sigFigNote(q, raw));
        tail.appendChild(workingBlock(q));

        tail.appendChild(U.el("button", {
          class: "btn btn-primary btn-block",
          text: state.i + 1 >= COUNT ? "I've read the working — show my results" : "Next question →",
          on: { click: () => {
            if (state.i + 1 >= COUNT) return finish();
            state.i++;
            render();
            window.scrollTo({ top: 0, behavior: "smooth" });
          } }
        }));
      }
    }

    function updatePenaltyChip() {
      penaltyChip.hidden = !state.hintLatched;
      penaltyChip.textContent = "💡 equation shown · −25%";
    }

    /** Say what was expected, to the data sheet's precision, and why it was right. */
    function verdict(q, value, ok, tooFast) {
      const box = U.el("div", { class: "feedback " + (ok ? "ok" : "no") });
      const exp = G.answerText(q);
      box.appendChild(U.el("div", { html:
        (ok ? "<b>Correct.</b> " : "<b>Not this time.</b> ") +
        "Expected <b>" + U.math(exp) + "</b>, accepted within " +
        Math.round(q.tolerance * 100) + "%." }));
      if (isFinite(value)) {
        const relErr = Math.abs(value - q.answer.value) / Math.abs(q.answer.value || 1);
        if (!ok) {
          box.appendChild(U.el("span", { class: "misc", html:
            "You gave " + U.math(U.fmtSig(value, q.answer.sf)) + " — out by " +
            (relErr > 9 ? "a factor of " + U.fmtSig(Math.max(value / q.answer.value, q.answer.value / value), 2)
                        : U.fmtSig(relErr * 100, 2) + "%") + ". " +
            (nearestMisconception(q, value) || "") }));
        }
      }
      if (q.routes && q.routes.length > 1) {
        box.appendChild(U.el("span", { class: "wstep-note", style: "margin-top:6px", html:
          "Checked two ways: " + U.escapeHtml(q.routes[0]) + ", and " + U.escapeHtml(q.routes[1]) + "." }));
      }
      if (tooFast && ok) {
        box.appendChild(U.el("span", { class: "misc",
          text: "Faster than the question can be read — too fast to have worked it out, so that one paid nothing." }));
      }
      return box;
    }

    function workingBlock(q) {
      const wrap = U.el("div", { class: "card" }, [U.el("h3", { text: "Worked solution" })]);
      const w = U.el("div", { class: "working" });
      q.working.forEach((step, i) => {
        if (!step.eq && !step.note) return;
        w.appendChild(U.el("div", { class: "wstep" }, [
          U.el("span", { class: "wstep-n", text: String(i + 1) }),
          U.el("span", { class: "wstep-b" }, [
            step.eq ? U.el("span", { html: U.math(step.eq) }) : null,
            step.note ? U.el("span", { class: "wstep-note", html: U.math(step.note) }) : null
          ])
        ]));
      });
      wrap.appendChild(w);
      return wrap;
    }

    /* The optional significant-figure check (Options → Significant figures).
       Informational only: the value is still marked on the 2% tolerance, never
       silently on significant figures. HSC marking accepts one figure either side
       of what the data supports, so that is the window used here. */
    function sigFigNote(q, raw) {
      const n = sigFigsOf(raw), want = q.answer.sf || 3;
      const good = n > 0 && Math.abs(n - want) <= 1;
      if (good) { S.bump("sigFigChecked"); S.bump("sigFigStreak"); }
      else { S.data.stats.sigFigStreak = 0; S.save(); }
      return U.el("div", { class: "feedback " + (good ? "ok" : "no") , html:
        "<b>Significant figures:</b> you gave " + n + "; the data supports " + want +
        (good ? " — that is within one either way. " : ". Aim for " + want + " (±1) in the exam. ") +
        "Expected to " + want + " s.f.: " + U.math(q.answer.str || U.fmtSig(q.answer.value, want)) + "." });
    }

    /** If the typed value matches a known misconception, name it. */
    function nearestMisconception(q, value) {
      if (!isFinite(value)) return "";
      for (const d of q.distractors) {
        if (U.numClose(value, d.value, 0.02)) return "That is what you get if you " + d.why + ".";
      }
      return "";
    }
    function nearMissHint(q, value) {
      if (!isFinite(value)) return "Check the number you typed.";
      const ratio = value / q.answer.value;
      for (const [f, msg] of [[2, "a factor of 2 out — check for a missing or extra ½"],
                              [0.5, "a factor of 2 out — check for a missing or extra ½"],
                              [10, "a power of ten out — check your unit prefixes"],
                              [0.1, "a power of ten out — check your unit prefixes"],
                              [100, "two powers of ten out — check your unit prefixes"],
                              [0.01, "two powers of ten out — check your unit prefixes"]]) {
        if (Math.abs(ratio / f - 1) < 0.05) return "You are " + msg + ".";
      }
      return "";
    }

    function finish() {
      if (state.over) return;
      state.over = true;
      const accuracy = state.answered ? state.correct / state.answered : 0;
      /* Efficiency, not "got there in the end": the completion bonus is scaled by
         how many attempts were spent, so a run of guess-then-correct pays much
         less than a clean one even though both end with everything right. */
      const ideal = state.answered;
      const efficiency = state.totalAttempts ? Math.min(1, ideal / state.totalAttempts) : 0;
      let bonus = Math.round(state.correct * 8 * efficiency);
      if (state.hintLatched) bonus = Math.round(bonus * (1 - HINT_PENALTY));
      const xp = state.hintLatched ? Math.round(state.xp * (1 - HINT_PENALTY)) : state.xp;

      const res = UI.award({
        xp, bonus, accuracy, pace: state.pace,
        coins: Math.round(xp * 0.45 + state.correct * 3)
      });
      S.markMode("calc");
      if (state.correct === COUNT) S.bump("perfectRuns");
      const newBest = S.recordScore("calc", state.correct);
      if (S.progressDaily("calc", state.correct)) {
        UI.toast({ icon: "📅", kind: "good", text: "<b>Daily challenge complete!</b>" });
      }

      UI.results({
        title: "Calculation Crunch complete",
        correct: state.correct, total: COUNT, xp: res.xp, coins: res.coins, newBest,
        extraStats: [
          ["Attempts", state.totalAttempts],
          ["Efficiency", Math.round(efficiency * 100) + "%"],
          ["Bonus", accuracy < 0.5 ? "withheld" : "+" + bonus]
        ],
        penalties: [state.hintLatched ? "Equation shown (−25%)" : null],
        reviewLabel: "👁 Review the worked solutions",
        onAgain: () => UI.go("/game/calc" + (mod ? "/" + mod : ""))
      });
    }

    render();
  }

  /** Dimensionally identical units a student might reasonably use instead. */
  function equivalentUnits(dims, primary) {
    const options = [primary];
    const CANDIDATES = ["km h^-1", "km", "cm", "mm", "g", "t", "min", "h", "day", "yr",
                        "kJ", "MJ", "eV", "MeV", "kW", "MW", "mA", "kV", "mV", "kΩ",
                        "MΩ", "µC", "nC", "mT", "µT", "GHz", "MHz", "kHz", "nm", "µm",
                        "km s^-1", "cm^2", "mm^2", "L"];
    for (const c of CANDIDATES) {
      const p = PHYS.Units.parse(c);
      if (p && PHYS.Units.same(p.units, dims) && options.indexOf(c) < 0) options.push(c);
      if (options.length >= 4) break;
    }
    return options.filter(Boolean);
  }

  /** Significant figures in a typed number: "0.0340" → 3, "3.40e5" → 3, "3400" → 2. */
  function sigFigsOf(raw) {
    let m = String(raw || "").trim().replace(/^[+\-−]/, "").split(/\s*(?:[eE]|[×x*]\s*10)/)[0].replace(/[\s,]/g, "");
    if (!/\d/.test(m)) return 0;
    const hasDot = m.indexOf(".") >= 0;
    let digits = m.replace(".", "").replace(/[^0-9]/g, "").replace(/^0+/, "");
    if (!hasDot) digits = digits.replace(/0+$/, "");
    return digits.length || 1;
  }

  return { screen, equivalentUnits, HINT_PENALTY, sigFigsOf };
})();
