/* Circuit Bench — replaces chemistry's Titration Lab.

   Take readings from a circuit with a voltmeter and an ammeter, then compute an
   unknown from them. Two stages, and the second is only possible if the first was
   done properly, which is what makes it a lab rather than a quiz.

   Every probe reading is COMPUTED from the circuit model, so the meters and the
   answer can never disagree (addendum §D5 — recompute derived values, never store
   them). Probing is free but limited: you get a fixed number of readings, so the
   mode rewards knowing which measurement you need rather than measuring
   everything. Running out of probes does not end the run; it just means the
   unknown has to be reasoned about with less.

   Results are gated behind a button (addendum §H1) so the working stays readable. */
window.PHYS = window.PHYS || {};
PHYS.Games = PHYS.Games || {};

PHYS.Games.bench = (function () {
  const U = PHYS.U, S = PHYS.State, UI = PHYS.UI;

  const ITEMS = 3;
  const PROBES = 3;

  /** Build a circuit and the question about it. Everything derived, nothing stored. */
  function buildBench(rng) {
    const pick = arr => arr[Math.floor(rng() * arr.length)];
    const nice = (lo, hi, step) => {
      const s = step || 1;
      const n = Math.round(lo / s) + Math.floor(rng() * (Math.floor(hi / s) - Math.round(lo / s) + 1));
      return Math.round(n * s * 1e6) / 1e6;
    };

    const kind = pick(["series-unknown-R", "parallel-total", "power-of-one", "divider-unknown"]);
    const Vs = nice(6, 24, 1);

    if (kind === "series-unknown-R") {
      const R1 = nice(20, 200, 10), R2 = nice(20, 200, 10);
      const I = Vs / (R1 + R2);
      return {
        kind, series: true, resistors: [R1, R2], supply: Vs,
        model: { I, V1: I * R1, V2: I * R2, Rt: R1 + R2 },
        hidden: "R2",
        question: `The ${R2} Ω resistor's label has rubbed off. Using your readings, what is its ` +
                  `resistance?`,
        ask: "resistance", unit: "Ω", answer: R2,
        working: [
          { eq: "V = IR \\implies R = \\f{V}{I}", note: "Ohm's law, rearranged." },
          { eq: `R_2 = \\f{${U.fmtSig(I * R2, 3)}}{${U.fmtSig(I, 3)}} = ${U.fmtSig(R2, 3)} \\u{Ω}`,
            note: "Use the voltage across THAT resistor and the current THROUGH it. In series the " +
                  "current is the same everywhere, so an ammeter reading anywhere in the loop will do." },
          { eq: "", note: `Check: R_1 + R_2 = ${R1 + R2} Ω, and ${Vs} V ÷ ${R1 + R2} Ω = ` +
                          `${U.fmtSig(I, 3)} A, which is what the ammeter reads.` }
        ],
        probes: probeSet(true, [R1, R2], Vs, I)
      };
    }

    if (kind === "parallel-total") {
      const R1 = nice(20, 120, 10), R2 = nice(20, 120, 10);
      const Rt = 1 / (1 / R1 + 1 / R2);
      const Itot = Vs / Rt;
      return {
        kind, series: false, resistors: [R1, R2], supply: Vs,
        model: { I: Itot, V1: Vs, V2: Vs, Rt },
        question: "What is the total resistance of the parallel combination?",
        ask: "resistance", unit: "Ω", answer: Rt,
        working: [
          { eq: "\\f{1}{R_T} = \\f{1}{R_1} + \\f{1}{R_2}",
            note: `= 1/${R1} + 1/${R2} = ${U.fmtSig(1 / Rt, 3)} Ω⁻¹` },
          { eq: `R_T = ${U.fmtSig(Rt, 3)} \\u{Ω}`,
            note: `Smaller than the smaller branch (${Math.min(R1, R2)} Ω), as a parallel total always is.` },
          { eq: `R_T = \\f{V}{I_{total}} = \\f{${Vs}}{${U.fmtSig(Itot, 3)}}`,
            note: "The meters give the same answer directly: supply voltage divided by total current." }
        ],
        probes: probeSet(false, [R1, R2], Vs, Itot)
      };
    }

    if (kind === "power-of-one") {
      const R1 = nice(30, 220, 10), R2 = nice(30, 220, 10);
      const I = Vs / (R1 + R2);
      const P2 = I * I * R2;
      return {
        kind, series: true, resistors: [R1, R2], supply: Vs,
        model: { I, V1: I * R1, V2: I * R2, Rt: R1 + R2 },
        question: `What power is dissipated in the ${R2} Ω resistor?`,
        ask: "power", unit: "W", answer: P2,
        working: [
          { eq: `I = \\f{V}{R_1 + R_2} = ${U.fmtSig(I, 3)} \\u{A}`, note: "" },
          { eq: `P_2 = I^2R_2 = ${U.fmtSig(I, 3)}^2 \\times ${R2} = ${U.fmtSig(P2, 3)} \\u{W}`, note: "" },
          { eq: `= V_2I = ${U.fmtSig(I * R2, 3)} \\times ${U.fmtSig(I, 3)}`,
            note: "Same answer from the meter readings. Do NOT use V²/R with the SUPPLY voltage — " +
                  "only part of it falls across this resistor." }
        ],
        probes: probeSet(true, [R1, R2], Vs, I)
      };
    }

    // divider-unknown
    const R1 = nice(50, 300, 10);
    const frac = pick([0.25, 0.333, 0.5, 0.6, 0.75]);
    const R2 = Math.round((R1 * frac) / (1 - frac));
    const I = Vs / (R1 + R2);
    return {
      kind, series: true, resistors: [R1, R2], supply: Vs,
      model: { I, V1: I * R1, V2: I * R2, Rt: R1 + R2 },
      question: `What is the potential difference across the ${R2} Ω resistor?`,
      ask: "voltage", unit: "V", answer: I * R2,
      working: [
        { eq: `V_2 = V\\f{R_2}{R_1 + R_2} = ${Vs} \\times \\f{${R2}}{${R1 + R2}}`, note: "The divider rule." },
        { eq: `V_2 = ${U.fmtSig(I * R2, 3)} \\u{V}`, note: "" },
        { eq: `V_1 + V_2 = ${U.fmtSig(I * R1, 3)} + ${U.fmtSig(I * R2, 3)} = ${Vs} \\u{V}`,
          note: "Always check the parts add up to the supply — the bigger resistor takes the bigger share." }
      ],
      probes: probeSet(true, [R1, R2], Vs, I)
    };
  }

  /** The readings a meter can take. Values computed from the model, never stored. */
  function probeSet(series, Rs, Vs, I) {
    const out = [
      { id: "A-loop", label: series ? "Ammeter in the loop" : "Ammeter at the supply",
        unit: "A", value: I, sf: 3 },
      { id: "V-supply", label: "Voltmeter across the supply", unit: "V", value: Vs, sf: 3 }
    ];
    if (series) {
      out.push({ id: "V-R1", label: "Voltmeter across R₁", unit: "V", value: I * Rs[0], sf: 3 });
      out.push({ id: "V-R2", label: "Voltmeter across R₂", unit: "V", value: I * Rs[1], sf: 3 });
    } else {
      out.push({ id: "A-R1", label: "Ammeter in the R₁ branch", unit: "A", value: Vs / Rs[0], sf: 3 });
      out.push({ id: "A-R2", label: "Ammeter in the R₂ branch", unit: "A", value: Vs / Rs[1], sf: 3 });
    }
    return out;
  }

  function screen(view) {
    const shell = UI.gameShell("Circuit Bench", { confirmExit: true });
    view.appendChild(shell.root);

    const rng = U.seededRandom(U.hash("bench-" + Date.now()));
    const benches = [];
    for (let i = 0; i < ITEMS; i++) benches.push(buildBench(rng));

    const run = { i: 0, correct: 0, over: false, xp: 0, probesUsed: 0, pace: UI.pacer() };
    const scoreChip = UI.chip("0/" + ITEMS, "on");
    const probeChip = UI.chip("🔎 " + PROBES);
    shell.meta.appendChild(scoreChip);
    shell.meta.appendChild(probeChip);

    const card = U.el("div", { class: "qcard" });
    const tail = U.el("div", { class: "grid" });
    shell.body.appendChild(card);
    shell.body.appendChild(tail);

    function render() {
      const b = benches[run.i];
      let probesLeft = PROBES;
      let locked = false;
      card.innerHTML = "";
      tail.innerHTML = "";
      probeChip.textContent = "🔎 " + probesLeft;

      card.appendChild(U.el("div", { class: "qtag" }, [
        UI.chip("Electricity"), UI.chip((run.i + 1) + "/" + ITEMS)
      ]));
      card.insertAdjacentHTML("beforeend", PHYS.Draw.wrap(PHYS.Draw.circuit({
        resistors: b.resistors, series: b.series, supply: b.supply
      })));
      card.appendChild(U.el("div", { class: "qtext", text: b.question }));
      card.appendChild(U.el("p", { class: "muted tiny", text:
        `You have ${PROBES} meter readings. Choose the ones you actually need — you do not get ` +
        `to measure everything.` }));

      const meters = U.el("div", { class: "bench-meters" });
      const readings = {};
      const probeRow = U.el("div", { class: "probe-row" });
      b.probes.forEach(p => {
        const btn = U.el("button", { class: "btn btn-sm btn-ghost", text: p.label,
          on: { click: () => {
            if (locked || probesLeft <= 0 || readings[p.id]) return;
            probesLeft--;
            run.probesUsed++;
            readings[p.id] = true;
            probeChip.textContent = "🔎 " + probesLeft;
            btn.disabled = true;
            PHYS.Sound.snap();
            meters.appendChild(U.el("div", { class: "meter" }, [
              U.el("div", { class: "meter-val", html:
                U.math(U.fmtSig(p.value, p.sf) + " \\u{" + p.unit + "}") }),
              U.el("div", { class: "meter-lbl", text: p.label })
            ]));
            if (probesLeft === 0) U.$$("button", probeRow).forEach(x => (x.disabled = true));
          } }
        });
        probeRow.appendChild(btn);
      });
      card.appendChild(probeRow);
      card.appendChild(meters);

      const input = U.el("input", { class: "numin js-answer", type: "text", inputmode: "decimal",
                                    placeholder: b.ask, autocomplete: "off" });
      card.appendChild(U.el("div", { class: "ansrow", style: "margin-top:14px" }, [
        input,
        U.el("span", { class: "unitsel", style: "display:grid;place-items:center", html: U.math("\\u{" + b.unit + "}") })
      ]));
      card.appendChild(U.el("div", { class: "unit-hint", text: "Accepted within 3%." }));
      const go = U.el("button", { class: "btn btn-primary btn-block", style: "margin-top:12px",
                                  text: "Submit", on: { click: submit } });
      card.appendChild(go);
      input.addEventListener("keydown", e => { if (e.key === "Enter") submit(); });
      setTimeout(() => input.focus({ preventScroll: true }), 60);
      run.pace.show();

      function submit() {
        if (locked) return;
        locked = true;
        go.disabled = true;
        input.disabled = true;
        U.$$("button", probeRow).forEach(x => (x.disabled = true));
        const v = U.parseNum(input.value);
        const ok = U.numClose(v, b.answer, 0.03);
        // Reading four meters and computing an unknown takes longer than 1.2 s.
        const tooFast = run.pace.mark();
        if (ok) {
          run.correct++;
          /* No floor, and fewer probes pays more: knowing which measurement you
             need is the skill, so taking all three for a one-reading question is
             not free. */
          const efficiency = 1 - 0.12 * Math.max(0, PROBES - probesLeft - 1);
          run.xp += tooFast ? 0 : Math.round(35 * Math.max(0.4, efficiency));
          PHYS.Sound.correct();
          S.bump("benchesSolved");
        } else {
          run.xp = Math.max(0, run.xp - 6);
          PHYS.Sound.wrong();
        }
        S.recordAnswer("M4", ok, "bench:" + b.kind, "Circuits");
        scoreChip.textContent = run.correct + "/" + ITEMS;

        const fb = U.el("div", { class: "feedback " + (ok ? "ok" : "no") });
        fb.appendChild(U.el("div", { html: (ok ? "<b>Correct.</b> " : "<b>Not that.</b> ") +
          "The answer is <b>" + U.math(U.fmtSig(b.answer, 3) + " \\u{" + b.unit + "}") + "</b>." }));
        tail.appendChild(fb);

        const wbox = U.el("div", { class: "card" }, [U.el("h3", { text: "Working" })]);
        const w = U.el("div", { class: "working" });
        b.working.forEach((step, i) => {
          if (!step.eq && !step.note) return;
          w.appendChild(U.el("div", { class: "wstep" }, [
            U.el("span", { class: "wstep-n", text: String(i + 1) }),
            U.el("span", { class: "wstep-b" }, [
              step.eq ? U.el("span", { html: U.math(step.eq) }) : null,
              step.note ? U.el("span", { class: "wstep-note", text: step.note }) : null
            ])
          ]));
        });
        wbox.appendChild(w);
        tail.appendChild(wbox);

        tail.appendChild(U.el("button", {
          class: "btn btn-primary btn-block",
          text: run.i + 1 >= ITEMS ? "I've read the working — show my results" : "Next circuit →",
          on: { click: () => {
            if (run.i + 1 >= ITEMS) return finish();
            run.i++;
            render();
            window.scrollTo({ top: 0, behavior: "smooth" });
          } }
        }));
      }
    }

    function finish() {
      if (run.over) return;
      run.over = true;
      const accuracy = run.correct / ITEMS;
      const bonus = Math.round(60 * accuracy);
      const res = UI.award({ xp: run.xp, bonus, accuracy, pace: run.pace,
                             coins: Math.round(run.xp * 0.5) });
      S.markMode("bench");
      if (run.correct === ITEMS) S.bump("perfectRuns");
      const newBest = S.recordScore("bench", run.correct);
      if (S.progressDaily("bench", run.correct)) {
        UI.toast({ icon: "📅", kind: "good", text: "<b>Daily challenge complete!</b>" });
      }
      UI.results({
        title: "Circuit Bench complete",
        correct: run.correct, total: ITEMS, xp: res.xp, coins: res.coins, newBest,
        extraStats: [["Readings taken", run.probesUsed], ["Bonus", accuracy < 0.5 ? "withheld" : "+" + bonus]],
        reviewLabel: "👁 Review the working",
        onAgain: () => UI.go("/game/bench")
      });
    }

    render();
  }

  return { screen, buildBench };
})();
