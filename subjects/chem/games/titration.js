/* Titration Lab — a simulated volumetric analysis.
   pH is modelled properly (strong/strong and weak/strong), the indicator changes
   colour over its real range, and the player must stop on the end point and then
   calculate the unknown concentration. */
window.CHEM = window.CHEM || {};
CHEM.Games = CHEM.Games || {};

CHEM.Games.titration = (function () {
  const U = CHEM.U, S = CHEM.State, UI = CHEM.UI;
  const KW = 1e-14;

  const SCENARIOS = [
    { id: "sasb", name: "Strong acid ↔ strong base",
      analyte: "HCl", titrant: "NaOH", weak: false, ka: null,
      indicator: "Bromothymol blue", lo: 6.0, hi: 7.6,
      loColour: "#f5e04a", hiColour: "#3d7dd8",
      note: "Equivalence at pH 7 — bromothymol blue straddles it neatly." },
    { id: "wasb", name: "Weak acid ↔ strong base",
      analyte: "CH₃COOH", titrant: "NaOH", weak: true, ka: 1.8e-5,
      indicator: "Phenolphthalein", lo: 8.3, hi: 10.0,
      loColour: "rgba(255,255,255,0.10)", hiColour: "#ff5aa0",
      note: "The salt hydrolyses, so equivalence sits above pH 7." },
    { id: "wasb2", name: "Weak acid ↔ strong base",
      analyte: "HCOOH", titrant: "KOH", weak: true, ka: 1.8e-4,
      indicator: "Phenolphthalein", lo: 8.3, hi: 10.0,
      loColour: "rgba(255,255,255,0.10)", hiColour: "#ff5aa0",
      note: "Methanoic acid is stronger than ethanoic — a shorter buffer region." }
  ];

  /** pH of the flask after adding vb mL of titrant. */
  function pHat(sc, ca, va, cb, vb) {
    const nA = ca * (va / 1000);
    const nB = cb * (vb / 1000);
    const vTot = (va + vb) / 1000;

    if (!sc.weak) {
      if (Math.abs(nA - nB) < 1e-12) return 7;
      if (nA > nB) return -Math.log10((nA - nB) / vTot);
      return 14 + Math.log10((nB - nA) / vTot);
    }

    const pKa = -Math.log10(sc.ka);
    if (nB <= 0) return -Math.log10(Math.sqrt(sc.ka * ca));
    if (nB < nA) {
      // Henderson–Hasselbalch through the buffer region.
      return pKa + Math.log10(nB / (nA - nB));
    }
    if (Math.abs(nA - nB) < 1e-12) {
      const cs = nA / vTot;
      const kb = KW / sc.ka;
      return 14 + Math.log10(Math.sqrt(kb * cs));
    }
    return 14 + Math.log10((nB - nA) / vTot);
  }

  /** Blend the indicator colour across its transition range. */
  function indicatorColour(sc, pH) {
    if (pH <= sc.lo) return sc.loColour;
    if (pH >= sc.hi) return sc.hiColour;
    const t = (pH - sc.lo) / (sc.hi - sc.lo);
    return `color-mix(in srgb, ${sc.hiColour} ${Math.round(t * 100)}%, ${sc.loColour})`;
  }

  /* ── the prac ──────────────────────────────────────────────────
     One unknown, several titrations — the HSC method, not a single shot:
       1. a ROUGH titration: fast, expected to overshoot, never graded — it tells
          you where to slow down;
       2. ACCURATE titrations on the same unknown, each starting from whatever the
          burette reads after a refill (so the titre is final − initial), with a
          "fast-fill" to about 1 mL short of the rough titre, then dropwise;
       3. keep going until three titres are CONCORDANT (within 0.10 mL);
       4. average only the concordant titres, then calculate.
     Marking follows that: how close the concordant mean is to the true equivalence
     volume, whether the titres were concordant, and the two calculations. Nothing
     pays unless the mean is within 0.50 mL of equivalence, so recording every run at
     0 mL (three "concordant" zeros) earns nothing. */
  const CAPACITY = 50.00;           // the drawn burette
  const CONCORDANT = 0.10;          // mL — three titres within this range
  const MAX_ACCURATE = 6;

  /** The best concordant set: the largest group of accurate titres whose range is
      ≤ CONCORDANT, ties broken by the tightest range. */
  function concordantSet(titres) {
    const idx = titres.map((t, i) => ({ t, i })).sort((x, y) => x.t - y.t);
    let best = [];
    for (let lo = 0; lo < idx.length; lo++) {
      let hi = lo;
      while (hi + 1 < idx.length && idx[hi + 1].t - idx[lo].t <= CONCORDANT + 1e-9) hi++;
      const set = idx.slice(lo, hi + 1);
      const range = set[set.length - 1].t - set[0].t;
      const bestRange = best.length ? best[best.length - 1].t - best[0].t : Infinity;
      if (set.length > best.length || (set.length === best.length && range < bestRange)) best = set;
    }
    return best.map(x => x.i).sort((a, b) => a - b);
  }
  /** Without three concordant titres, the closest three are averaged (and marked down). */
  function closestThree(titres) {
    const idx = titres.map((t, i) => ({ t, i })).sort((x, y) => x.t - y.t);
    let best = null;
    for (let lo = 0; lo + 2 < idx.length; lo++) {
      const range = idx[lo + 2].t - idx[lo].t;
      if (!best || range < best.range) best = { range, set: idx.slice(lo, lo + 3).map(x => x.i) };
    }
    return best ? best.set.sort((a, b) => a - b) : titres.map((_, i) => i);
  }

  function start(root) {
    S.markMode("titration");
    S.touchStreak();

    const sc = U.pick(SCENARIOS);
    const va = 25.00;
    const cb = U.pick([0.1000, 0.1050, 0.0500, 0.2000]);   // standardised titrant
    /* Pick the TITRE first, then derive the unknown from it, so equivalence always
       sits in the middle of the burette (16–34 mL), as a real prac aims for. */
    const targetTitre = 16 + Math.random() * 18;
    const ca = parseFloat(((cb * targetTitre) / va).toFixed(4));
    const vEq = (ca * va) / cb;

    const runs = [];                  // { kind, initial, final, titre }
    let run = null;                   // the run in progress
    let meterOn = false, usedMeter = false, finished = false;

    const shell = UI.gameShell("Titration Lab", { tools: { calc: true, pad: true, sheet: true }, confirmExit: true,
      help: "A rough titration first (fast — it only tells you where to slow down), then accurate titrations " +
            "on the same unknown until three titres agree within 0.10 mL. Average the concordant titres and " +
            "calculate the concentration. The burette rarely starts at exactly 0.00 mL: titre = final − initial." });
    root.appendChild(shell.root);
    const phaseChip = UI.chip("Rough run");
    shell.meta.appendChild(phaseChip);

    shell.body.appendChild(U.el("div", { class: "qcard" }, [
      U.el("div", { class: "qtag" }, [UI.chip("Module 6 · Volumetric analysis"), UI.chip(sc.name), UI.chip(sc.indicator)]),
      U.el("p", { html:
        `Each run: a <b>${va.toFixed(2)} mL</b> aliquot of ${sc.analyte} of <b>unknown</b> concentration in a clean conical ` +
        `flask with ${sc.indicator}. The burette holds standardised <b>${cb.toFixed(4)} mol L⁻¹ ${sc.titrant}</b>. ` +
        `Do a rough titration, then accurate ones until three titres are concordant (within ${CONCORDANT.toFixed(2)} mL).` }),
      U.el("p", { class: "tiny muted", text: sc.note })
    ]));

    /* apparatus */
    const buretFill = U.el("i");
    const buret = U.el("div", { class: "buret" }, [buretFill]);
    const flaskLiq = U.el("div", { class: "flask-liq" });
    const flask = U.el("div", { class: "flask" }, [U.el("div", { class: "flask-neck" }), U.el("div", { class: "flask-body" }, [flaskLiq])]);
    const readout = U.el("div", { class: "ph-readout", text: "—" });
    const readoutLbl = U.el("div", { class: "muted tiny", style: "text-align:center", text: "Burette reading" });
    shell.body.appendChild(U.el("div", { class: "qcard" }, [U.el("div", { class: "buret-wrap" }, [buret, flask]), readout, readoutLbl]));

    const fastBtn = U.el("button", { class: "btn", text: "⏩ Fast to ~1 mL before rough", on: { click: fastFill } });
    const addBtns = [
      U.el("button", { class: "btn", text: "+5.00 mL", on: { click: () => add(5) } }),
      U.el("button", { class: "btn", text: "+1.00 mL", on: { click: () => add(1) } }),
      U.el("button", { class: "btn", text: "+0.10 mL", on: { click: () => add(0.1) } }),
      U.el("button", { class: "btn", text: "+1 drop (0.05 mL)", on: { click: () => add(0.05) } })
    ];
    const controls = U.el("div", { class: "row wrap", style: "gap:8px" }, [fastBtn].concat(addBtns));
    shell.body.appendChild(controls);

    const meterBtn = U.el("button", { class: "btn btn-sm btn-ghost", text: "🔌 Connect pH meter (−30% XP)",
      on: { click: () => {
        meterOn = !meterOn; usedMeter = true;
        meterBtn.textContent = meterOn ? "🔌 pH meter on (−30% XP)" : "🔌 Connect pH meter (−30% XP)";
        paint();
      } } });
    const endBtn = U.el("button", { class: "btn btn-primary", text: "Record end point", on: { click: record } });
    shell.body.appendChild(U.el("div", { class: "row" }, [meterBtn, U.el("div", { class: "spacer" }), endBtn]));

    const tableSlot = U.el("div");
    const nextSlot = U.el("div");
    const resultSlot = U.el("div");
    shell.body.appendChild(tableSlot);
    shell.body.appendChild(nextSlot);
    shell.body.appendChild(resultSlot);

    const accurate = () => runs.filter(r => r.kind === "accurate");
    const roughTitre = () => { const r = runs.find(x => x.kind === "rough"); return r ? r.titre : null; };

    function startRun(kind) {
      /* A refilled burette is read wherever the meniscus settles — rarely exactly
         0.00 mL. The rough run starts at zero so the first titre is easy to see. */
      const initial = kind === "rough" ? 0 : Math.round((Math.random() * 2.4) / 0.05) * 0.05;
      run = { kind, initial: +initial.toFixed(2), delivered: 0 };
      wasInRange = false;
      const n = accurate().length + (kind === "accurate" ? 1 : 0);
      phaseChip.textContent = kind === "rough" ? "Rough run" : "Accurate run " + n;
      fastBtn.hidden = kind === "rough";
      fastBtn.disabled = false;
      addBtns.concat([endBtn]).forEach(b => (b.disabled = false));
      nextSlot.innerHTML = "";
      paint();
      CHEM.__current = { mode: "titration", kind: "titration", phase: kind, vEq, ca, cb, va, initial: run.initial,
                         rough: roughTitre() };
    }

    function add(ml) {
      if (!run) return;
      if (run.initial + run.delivered >= CAPACITY) {
        UI.toast({ icon: "🚱", kind: "bad", text: "Burette empty — you've overshot badly." });
        CHEM.Sound.error();
        return;
      }
      run.delivered = Math.min(CAPACITY - run.initial, +(run.delivered + ml).toFixed(2));
      CHEM.Sound[ml <= 0.05 ? "drip" : "pour"]();
      paint();
    }

    /** The real accurate-run technique: run in quickly to about 1 mL short of the
        rough titre, then go dropwise. Only once per run, and only forwards. */
    function fastFill() {
      const rt = roughTitre();
      if (!run || run.kind !== "accurate" || rt === null) return;
      const target = Math.max(0, +(rt - 1).toFixed(2));
      if (run.delivered < target) { run.delivered = Math.min(CAPACITY - run.initial, target); CHEM.Sound.pour(); }
      fastBtn.disabled = true;
      paint();
    }

    let wasInRange = false;
    function paint() {
      if (!run) return;
      const vb = run.delivered;
      const pH = pHat(sc, ca, va, cb, vb);
      const inRange = pH > sc.lo && pH < sc.hi;
      if (inRange && !wasInRange) CHEM.Sound.colourChange();
      wasInRange = inRange;
      const reading = run.initial + vb;
      buretFill.style.height = U.clamp((1 - reading / CAPACITY) * 100, 0, 100) + "%";
      flaskLiq.style.background = indicatorColour(sc, pH);
      readout.textContent = meterOn ? "pH " + pH.toFixed(2) : reading.toFixed(2) + " mL";
      readoutLbl.textContent = meterOn ? "pH meter" : "Burette reading (started at " + run.initial.toFixed(2) + " mL)";
    }

    function record() {
      if (!run) return;
      const r = { kind: run.kind, initial: run.initial, final: +(run.initial + run.delivered).toFixed(2), titre: run.delivered };
      runs.push(r);
      run = null;
      addBtns.concat([endBtn, fastBtn]).forEach(b => (b.disabled = true));
      CHEM.Sound.endpoint();
      drawTable();
      drawNext();
    }

    function drawTable() {
      const acc = accurate().map(r => r.titre);
      const conc = acc.length >= 3 ? concordantSet(acc) : [];
      const good = conc.length >= 3 ? new Set(conc) : new Set();
      let ai = -1;
      const rows = runs.map((r, i) => {
        if (r.kind === "accurate") ai++;
        const isConc = r.kind === "accurate" && good.has(ai);
        return U.el("tr", { class: isConc ? "row-conc" : "" }, [
          U.el("td", { text: r.kind === "rough" ? "Rough" : String(ai + 1) }),
          U.el("td", { text: r.initial.toFixed(2) }),
          U.el("td", { text: r.final.toFixed(2) }),
          U.el("td", { html: `<b>${r.titre.toFixed(2)}</b>` + (isConc ? " ✓" : r.kind === "rough" ? " <span class='muted'>(not averaged)</span>" : "") })
        ]);
      });
      tableSlot.innerHTML = "";
      tableSlot.appendChild(U.el("div", { class: "qcard" }, [
        U.el("div", { class: "qtag" }, [UI.chip("Results table"), good.size ? UI.chip("✓ concordant: " + good.size, "on") : null]),
        U.el("div", { class: "ref-scroll" }, [U.el("table", { class: "ref-table titr-table" }, [
          U.el("thead", {}, [U.el("tr", {}, ["Run", "Initial (mL)", "Final (mL)", "Titre (mL)"].map(h => U.el("th", { text: h })))]),
          U.el("tbody", {}, rows)
        ])])
      ]));
    }

    function drawNext() {
      nextSlot.innerHTML = "";
      const acc = accurate().map(r => r.titre);
      const conc = acc.length >= 3 ? concordantSet(acc) : [];
      const done = conc.length >= 3;
      const capped = acc.length >= MAX_ACCURATE;
      let msg;
      if (runs.length === 1) msg = `Rough titre ${acc.length ? "" : roughTitre().toFixed(2) + " mL"}. Now the accurate runs: fast-fill to about 1 mL short of it, then go dropwise.`;
      else if (done) msg = "Three concordant titres. Average them and calculate — or do another run to tighten them.";
      else if (capped) msg = "No three concordant titres after " + MAX_ACCURATE + " runs. The closest three will be averaged (marked down).";
      else msg = acc.length < 3 ? `${3 - acc.length} more accurate run${3 - acc.length === 1 ? "" : "s"} for a concordant set.` :
        "Not concordant yet — the titres must agree within 0.10 mL. Do another run.";
      const btns = [];
      if (!capped) btns.push(U.el("button", { class: "btn" + (done ? "" : " btn-primary js-next"), text: "Next accurate titration",
        on: { click: () => startRun("accurate") } }));
      if (done || capped) btns.push(U.el("button", { class: "btn btn-primary js-next", text: "Calculate →",
        on: { click: () => askCalculation(done ? conc : closestThree(acc), done) } }));
      nextSlot.appendChild(U.el("div", { class: "feedback " + (done ? "ok" : ""), html: msg }));
      nextSlot.appendChild(U.el("div", { class: "row", style: "gap:8px; margin-top:10px" }, btns));
    }

    function askCalculation(setIdx, concordant) {
      nextSlot.innerHTML = "";
      const acc = accurate().map(r => r.titre);
      const used = setIdx.map(i => acc[i]);
      const mean = used.reduce((a, b) => a + b, 0) / used.length;
      const conc = (cb * mean) / va;

      const meanIn = U.el("input", { class: "numin", type: "text", inputmode: "decimal", placeholder: "mL", "aria-label": "Mean titre" });
      const concIn = U.el("input", { class: "numin js-answer", type: "text", inputmode: "decimal", placeholder: "mol L⁻¹", "aria-label": "Concentration" });
      const submit = U.el("button", { class: "btn btn-primary btn-block", text: "Submit calculation" });
      const card = U.el("div", { class: "qcard" }, [
        U.el("div", { class: "qtext", html:
          `Using runs <b>${setIdx.map(i => i + 1).join(", ")}</b>` + (concordant ? " (concordant)" : " (the closest three)") +
          `: (a) the mean titre, then (b) the concentration of the ${va.toFixed(2)} mL ${sc.analyte} aliquot, ` +
          `titrated with ${cb.toFixed(4)} mol L⁻¹ ${sc.titrant} (1 : 1).` }),
        U.el("div", { class: "tiny muted", style: "margin-top:12px", text: "(a) Mean titre, mL (2 decimal places)" }), meanIn,
        U.el("div", { class: "tiny muted", style: "margin-top:12px", text: "(b) Concentration, mol L⁻¹ (4 significant figures)" }), concIn,
        UI.answerPad(concIn),
        U.el("div", { style: "margin-top:14px" }, [submit])
      ]);
      resultSlot.innerHTML = "";
      resultSlot.appendChild(card);
      meanIn.focus();
      CHEM.__current = { mode: "titration", kind: "numeric", mean, answer: conc, vEq };

      let done = false;
      function submitAnswer() {
        if (done || !meanIn.value.trim() || !concIn.value.trim()) return;
        done = true;
        [meanIn, concIn, submit].forEach(x => (x.disabled = true));
        const meanOk = Math.abs((U.parseNum(meanIn.value) || NaN) - mean) <= 0.006;
        const concOk = U.numClose(concIn.value, conc, 0.02);
        S.recordAnswer("M6", meanOk && concOk, null);
        if (meanOk && concOk) CHEM.Sound.correct(); else CHEM.Sound.wrong();
        card.appendChild(U.el("div", { class: "feedback " + (meanOk && concOk ? "ok" : "no"), html:
          `<b>(a) ${meanOk ? "✓" : "✗"} Mean titre</b> = (${used.map(t => t.toFixed(2)).join(" + ")}) ÷ ${used.length} = ${mean.toFixed(2)} mL. ` +
          `The rough titre is never averaged.<br>` +
          `<b>(b) ${concOk ? "✓" : "✗"} Concentration:</b> n(${sc.titrant}) = ${cb} × ${(mean / 1000).toFixed(5)} L = ${(cb * mean / 1000).toExponential(3)} mol = n(${sc.analyte}); ` +
          `c = n ÷ ${(va / 1000).toFixed(5)} L = <b>${U.sigFig(conc, 4)} mol L⁻¹</b>. (True value: ${ca.toFixed(4)} mol L⁻¹.)` }));
        const seeResults = U.el("button", { class: "btn btn-primary btn-block js-next", text: "See results →",
          on: { click: () => { seeResults.remove(); finish(mean, concordant, meanOk, concOk); } } });
        card.appendChild(U.el("div", { style: "margin-top:14px" }, [seeResults]));
        seeResults.focus();
      }
      submit.addEventListener("click", submitAnswer);
      concIn.addEventListener("keydown", e => { if (e.key === "Enter") submitAnswer(); });
    }

    function finish(mean, concordant, meanOk, concOk) {
      if (finished) return;
      finished = true;
      const error = Math.abs(mean - vEq);
      const perfect = error <= 0.05, good = error <= 0.15, ok = error <= 0.50;
      /* Everything hangs off an accurate mean: concordant zeros, or a "correct"
         calculation on a wrong titre, are not evidence of technique. */
      let xp = perfect ? 220 : good ? 160 : ok ? 100 : 0;
      if (ok && concordant) xp += 40;
      if (ok && meanOk) xp += 40;
      if (ok && concOk) xp += 60;
      if (usedMeter) xp = Math.round(xp * 0.7);
      let coins = (perfect ? 90 : good ? 60 : ok ? 35 : 0) + (ok && concordant ? 15 : 0) + (ok && concOk ? 25 : 0);

      const parts = [ok, ok && concordant, ok && meanOk, ok && concOk];
      const correct = parts.filter(Boolean).length;
      if (ok) S.bump("titrations");
      if (perfect) S.bump("perfectTitrations");
      if (ok && concordant) S.bump("concordantSets");
      S.progressDaily("titration", 1);
      const newBest = S.recordScore("titration", Math.round(100 - Math.min(100, error * 100)));
      const n = accurate().length;
      const got = UI.award({ xp, coins, bonus: S.streakBonus(), accuracy: correct / parts.length, answered: n + 2,
                             pace: { items: n, tooFast: 0 } });
      UI.results({
        title: !ok ? "Titres off the end point" : perfect && concordant && meanOk && concOk ? "Textbook titration"
             : concordant ? "Titration complete" : "Complete — but not concordant",
        correct, total: parts.length, xp: got.xp, coins: got.coins, newBest,
        extraStats: [
          ["Mean titre", mean.toFixed(2) + " mL"],
          ["True equivalence", vEq.toFixed(2) + " mL"],
          ["Accurate runs", String(n)],
          ["Concordant", concordant ? "yes" : "no"],
          ["pH meter", usedMeter ? "used" : "no"]
        ],
        onReview: true, onAgain: () => UI.handleRoute()
      });
    }

    startRun("rough");
  }

  return { start, pHat, concordantSet, closestThree };
})();
