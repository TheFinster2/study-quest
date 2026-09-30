/* Formula Match — quantity ↔ formula ↔ SI unit, a THREE-way match.

   Chemistry's Ion Memory was a pair game. Three-way is genuinely harder, because
   knowing two of the three does not hand you the pairing: you have to recognise
   the formula AND know what it comes out in, which is exactly the pair of skills
   a units-and-substitution question tests.

   Scoring is net: a wrong triple costs, so tapping around the board until things
   stick does not pay. There is no per-item floor.                                */
window.PHYS = window.PHYS || {};
PHYS.Games = PHYS.Games || {};

PHYS.Games.formula = (function () {
  const U = PHYS.U, S = PHYS.State, UI = PHYS.UI;

  const TRIPLES_PER_ROUND = 6;

  /* Each triple is a quantity, the formula that gives it, and the unit it comes
     out in. Drawn from the formula sheet so nothing here can drift from it. */
  function buildTriples(mods) {
    const eqs = PHYS.DATA.equations.filter(e => e.matchUnit !== false);
    const CANDIDATES = [
      { eq: "suvat3", quantity: "Final velocity", unit: "m s^-1" },
      { eq: "newton2", quantity: "Net force", unit: "N" },
      { eq: "ke", quantity: "Kinetic energy", unit: "J" },
      { eq: "momentum", quantity: "Momentum", unit: "kg m s^-1" },
      { eq: "power", quantity: "Power", unit: "W" },
      { eq: "torque", quantity: "Torque", unit: "N m" },
      { eq: "circ-F", quantity: "Centripetal force", unit: "N" },
      { eq: "grav-F", quantity: "Gravitational force", unit: "N" },
      { eq: "grav-U", quantity: "Gravitational potential energy", unit: "J" },
      { eq: "escape", quantity: "Escape velocity", unit: "m s^-1" },
      { eq: "wave", quantity: "Wave speed", unit: "m s^-1" },
      { eq: "heat", quantity: "Heat energy", unit: "J" },
      { eq: "ohm", quantity: "Potential difference", unit: "V" },
      { eq: "charge", quantity: "Charge", unit: "C" },
      { eq: "coulomb", quantity: "Electrostatic force", unit: "N" },
      { eq: "efield-plates", quantity: "Electric field strength", unit: "V m^-1" },
      { eq: "motor", quantity: "Force on a conductor", unit: "N" },
      { eq: "flux", quantity: "Magnetic flux", unit: "Wb" },
      { eq: "faraday", quantity: "Induced EMF", unit: "V" },
      { eq: "rod-emf", quantity: "Motional EMF", unit: "V" },
      { eq: "coil-torque", quantity: "Torque on a coil", unit: "N m" },
      { eq: "photon", quantity: "Photon energy", unit: "J" },
      { eq: "debroglie", quantity: "de Broglie wavelength", unit: "m" },
      { eq: "wien", quantity: "Peak wavelength", unit: "m" },
      { eq: "stefan", quantity: "Luminosity", unit: "W" },
      { eq: "massenergy", quantity: "Rest energy", unit: "J" },
      { eq: "dilation", quantity: "Dilated time", unit: "s" },
      { eq: "contraction", quantity: "Contracted length", unit: "m" },
      { eq: "circ-v", quantity: "Orbital speed", unit: "m s^-1" },
      { eq: "kepler3", quantity: "Orbital radius cubed over period squared", unit: "m^3 s^-2" }
    ];
    let pool = CANDIDATES.map(c => {
      const eq = PHYS.DATA.equations.find(e => e.id === c.eq);
      return eq ? { quantity: c.quantity, formula: eq.formula, unit: c.unit, mod: eq.mod, id: c.eq } : null;
    }).filter(Boolean);
    if (mods && mods.length) {
      const scoped = pool.filter(p => mods.includes(p.mod));
      if (scoped.length >= TRIPLES_PER_ROUND) pool = scoped;
    }
    return U.sample(pool, TRIPLES_PER_ROUND);
  }

  function screen(view, args) {
    const triples = buildTriples(args && args.mod ? [args.mod] : null);
    if (triples.length < 3) { UI.go("/play"); return; }

    const shell = UI.gameShell("Formula Match", { confirmExit: true });
    view.appendChild(shell.root);

    const diff = S.difficulty();
    const seconds = Math.round(120 * diff.timer);
    const run = { matched: 0, wrong: 0, over: false, left: seconds, pace: UI.pacer() };
    const scoreChip = UI.chip("0/" + triples.length, "on");
    const timerChip = U.el("span", { class: "timer-ring", text: U.fmtTime(seconds) });
    shell.meta.appendChild(scoreChip);
    shell.meta.appendChild(timerChip);

    shell.body.appendChild(U.el("p", { class: "muted", text:
      "Tap one quantity, one formula and one unit that belong together. A wrong triple costs " +
      "you, so read before you tap." }));

    const cols = { quantity: [], formula: [], unit: [] };
    const sel = { quantity: null, formula: null, unit: null };

    const grid = U.el("div", { class: "tri" });
    const HEADS = [["quantity", "Quantity"], ["formula", "Formula"], ["unit", "Unit"]];
    for (const [key, label] of HEADS) {
      const col = U.el("div", { class: "tri-col" }, [U.el("div", { class: "tri-head", text: label })]);
      const shuffled = U.shuffle(triples);
      shuffled.forEach(t => {
        const raw = key === "quantity" ? t.quantity : key === "formula" ? t.formula : t.unit;
        const cell = U.el("button", {
          class: "tri-cell",
          html: key === "quantity" ? U.escapeHtml(raw) : U.math(raw),
          on: { click: () => tap(key, t, cell) }
        });
        cols[key].push({ triple: t, node: cell });
        col.appendChild(cell);
      });
      grid.appendChild(col);
    }
    shell.body.appendChild(grid);
    const feedback = U.el("div", { class: "grid" });
    shell.body.appendChild(feedback);

    function tap(key, triple, cell) {
      if (run.over || cell.classList.contains("done")) return;
      PHYS.Sound.click();
      // Tapping the same cell again deselects it.
      if (sel[key] && sel[key].node === cell) {
        cell.classList.remove("sel");
        sel[key] = null;
        return;
      }
      if (sel[key]) sel[key].node.classList.remove("sel");
      sel[key] = { triple, node: cell };
      cell.classList.add("sel");

      if (sel.quantity && sel.formula && sel.unit) resolve();
    }

    function resolve() {
      const a = sel.quantity.triple, b = sel.formula.triple, c = sel.unit.triple;
      const nodes = [sel.quantity.node, sel.formula.node, sel.unit.node];
      /* Matched on what the CELLS SAY, not on which triple object they came from.
         Several triples legitimately share a unit — force is N whether it is
         centripetal, electrostatic or net — so the unit column can show "N" twice,
         and identity matching marked one of the two wrong. From the student's side
         the two cells are indistinguishable: they read the same, they mean the same,
         and there is no way to tell which one the game wanted. Being marked wrong
         for picking "the other N" is the game's fault, not theirs.

         The formula column is the anchor, because a formula appears once. */
      const unitOk = c === b || U.mathPlain(c.unit).trim() === U.mathPlain(b.unit).trim();
      const quantityOk = a === b || a.quantity === b.quantity;
      const ok = quantityOk && unitOk;
      const tooFast = run.pace.mark();
      if (ok) {
        run.matched++;
        nodes.forEach(n => { n.classList.remove("sel"); n.classList.add("done"); });
        PHYS.Sound.correct();
        S.bump("formulaMatched");
        const r = nodes[1].getBoundingClientRect();
        PHYS.FX.burst(r.left + r.width / 2, r.top + r.height / 2, 12);
        scoreChip.textContent = run.matched + "/" + triples.length;
        feedback.innerHTML = "";
        feedback.appendChild(U.el("div", { class: "feedback ok", html:
          "<b>" + U.escapeHtml(b.quantity) + "</b> = " + U.math(b.formula) +
          ", measured in " + U.math(b.unit) + "." }));
        if (run.matched >= triples.length) setTimeout(finish, 600);
      } else {
        run.wrong++;
        PHYS.Sound.wrong();
        nodes.forEach(n => {
          n.classList.remove("sel");
          n.classList.add("miss");
          setTimeout(() => n.classList.remove("miss"), 400);
        });
        feedback.innerHTML = "";
        feedback.appendChild(U.el("div", { class: "feedback no", html:
          "<b>Those three do not go together.</b> " + U.escapeHtml(b.quantity) +
          " comes out in " + U.math(b.unit) + " — check the units of the formula you picked." }));
        S.recordAnswer(b.mod, false, "formula:" + b.id, "Formulas and units");
      }
      sel.quantity = sel.formula = sel.unit = null;
    }

    const tick = setInterval(() => {
      if (run.over) return;
      run.left--;
      timerChip.textContent = U.fmtTime(Math.max(0, run.left));
      timerChip.classList.toggle("low", run.left <= 15);
      if (run.left <= 0) finish();
    }, 1000);
    UI.onLeave(() => clearInterval(tick));

    function finish() {
      if (run.over) return;
      run.over = true;
      clearInterval(tick);
      const attempts = run.matched + run.wrong;
      const accuracy = attempts ? run.matched / attempts : 0;
      // Net: each wrong triple removes most of a right one's value.
      const xp = Math.max(0, run.matched * 22 - run.wrong * 14);
      const perfect = run.matched === triples.length && run.wrong === 0;
      const bonus = perfect ? 80 : Math.round(50 * accuracy);
      const res = UI.award({ xp, bonus, accuracy, pace: run.pace,
                             coins: Math.round(xp * 0.5) });
      S.markMode("formula");
      if (perfect) S.bump("perfectRuns");
      const newBest = S.recordScore("formula", run.matched * 10 - run.wrong);
      if (S.progressDaily("formula", 1)) {
        UI.toast({ icon: "📅", kind: "good", text: "<b>Daily challenge complete!</b>" });
      }
      UI.results({
        title: "Formula Match complete",
        correct: run.matched, total: triples.length, xp: res.xp, coins: res.coins, newBest,
        extraStats: [["Wrong triples", run.wrong], ["Time left", U.fmtTime(Math.max(0, run.left))]],
        review: false,
        onAgain: () => UI.go("/game/formula")
      });
    }

    return () => clearInterval(tick);
  }

  return { screen, buildTriples };
})();
