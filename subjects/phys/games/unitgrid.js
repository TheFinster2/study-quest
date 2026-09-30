/* Unit Grid — fill a grid of quantity × unit against the clock.

   Replaces chemistry's Precipitation Panic, and inherits its farming hole
   (addendum §C4): a randomly generated board can come up accidentally trivial. In
   the chemistry version a solubility grid could be almost all one state, making
   "tap the same answer sixteen times" a legitimately perfect score worth 363 XP.

   The same shape of defect applies to a grid with one correct column per row, so
   the board is CONSTRAINED rather than trusted to the RNG:

     · no single column may hold more than 45% of the correct answers, so tapping
       one column down the grid can never come close to a perfect score;
     · every column must be the answer at least once, so no column is dead;
     · scoring is NET (right − wrong) with credit only above a 55% baseline, so
       guessing across the whole grid earns nothing.

   The board is re-drawn until it satisfies those, and the constraint is asserted
   rather than hoped for.                                                        */
window.PHYS = window.PHYS || {};
PHYS.Games = PHYS.Games || {};

PHYS.Games.unitgrid = (function () {
  const U = PHYS.U, S = PHYS.State, UI = PHYS.UI, Un = PHYS.Units;

  const ROWS = 8, COLS = 4;
  const BASELINE = 0.55;           // net score below this earns nothing
  const MAX_COLUMN_SHARE = 0.45;

  /** Build a board: ROWS quantities, each with COLS unit options, one correct. */
  function buildBoard(mods) {
    let pool = Un.QUANTITIES.filter(q => q.unit !== "no units");
    if (mods && mods.length) {
      const scoped = pool.filter(q => mods.includes(q.mod));
      if (scoped.length >= ROWS) pool = scoped;
    }
    const allUnits = Array.from(new Set(Un.QUANTITIES.map(q => q.unit)))
                          .filter(u => u !== "no units");

    for (let attempt = 0; attempt < 60; attempt++) {
      const rows = U.sample(pool, ROWS).map(q => {
        const wrong = U.shuffle(allUnits.filter(u => u !== q.unit)).slice(0, COLS - 1);
        const options = U.shuffle([q.unit].concat(wrong));
        return { q, options, correct: options.indexOf(q.unit), answered: null };
      });
      // §C4: constrain the mix instead of trusting the RNG.
      const counts = new Array(COLS).fill(0);
      rows.forEach(r => counts[r.correct]++);
      const maxShare = Math.max.apply(null, counts) / ROWS;
      const everyColumnUsed = counts.every(c => c > 0);
      if (maxShare <= MAX_COLUMN_SHARE && everyColumnUsed) return rows;
    }
    // Fall back to a deliberately balanced board rather than shipping a trivial one.
    const rows = U.sample(pool, ROWS).map((q, i) => {
      const wrong = U.shuffle(allUnits.filter(u => u !== q.unit)).slice(0, COLS - 1);
      const options = wrong.slice();
      options.splice(i % COLS, 0, q.unit);
      return { q, options, correct: i % COLS, answered: null };
    });
    return rows;
  }

  function screen(view, args) {
    const diff = S.difficulty();
    const rows = buildBoard(args && args.mod ? [args.mod] : null);
    const shell = UI.gameShell("Unit Grid", { confirmExit: true });
    view.appendChild(shell.root);

    const seconds = Math.round(75 * diff.timer);
    const run = { right: 0, wrong: 0, over: false, left: seconds, pace: UI.pacer() };

    const scoreChip = UI.chip("0 net", "on");
    const timerChip = U.el("span", { class: "timer-ring", text: U.fmtTime(seconds) });
    shell.meta.appendChild(scoreChip);
    shell.meta.appendChild(timerChip);

    shell.body.appendChild(U.el("p", { class: "muted", text:
      "Tap the correct SI unit for each quantity. A wrong tap costs you, and the board is " +
      "built so that no single column is right more than a few times." }));

    const wrap = U.el("div", { class: "ugrid-wrap" });
    const table = U.el("table", { class: "ugrid" });
    const thead = U.el("tr", {}, [U.el("th", { class: "rowh", text: "quantity" })]);
    for (let c = 0; c < COLS; c++) thead.appendChild(U.el("th", { text: String.fromCharCode(65 + c) }));
    table.appendChild(thead);

    rows.forEach((row, ri) => {
      const tr = U.el("tr");
      tr.appendChild(U.el("th", { class: "rowh", html:
        U.math(row.q.sym) + " <span class='wstep-note' style='display:inline'>" +
        U.escapeHtml(row.q.name) + "</span>" }));
      row.options.forEach((unit, ci) => {
        const td = U.el("td");
        const btn = U.el("button", { class: "ucell", html: U.math(unit),
          on: { click: () => tap(ri, ci, btn) } });
        row.nodes = row.nodes || [];
        row.nodes[ci] = btn;
        td.appendChild(btn);
        tr.appendChild(td);
      });
      table.appendChild(tr);
    });
    wrap.appendChild(table);
    shell.body.appendChild(wrap);

    const done = U.el("button", { class: "btn btn-primary btn-block", text: "Finish",
                                  on: { click: finish } });
    shell.body.appendChild(done);

    function tap(ri, ci, btn) {
      if (run.over) return;
      const row = rows[ri];
      if (row.answered !== null) return;                 // one shot per row
      row.answered = ci;
      const ok = ci === row.correct;
      const tooFast = run.pace.mark();
      row.nodes.forEach((b, i) => {
        b.disabled = true;
        if (i === row.correct) b.classList.add("right");
        else if (i === ci) b.classList.add("wrongc");
      });
      if (ok) {
        run.right += tooFast ? 0 : 1;
        if (!tooFast) S.bump("unitCells");
        PHYS.Sound.snap();
        const r = btn.getBoundingClientRect();
        PHYS.FX.burst(r.left + r.width / 2, r.top + r.height / 2, 8);
      } else {
        run.wrong++;
        PHYS.Sound.wrong();
        UI.toast({ icon: "📐", ms: 2800, text:
          U.math(row.q.sym) + " (" + U.escapeHtml(row.q.name) + ") is measured in " +
          U.math(row.q.unit) + " — that is " + U.math(Un.baseStr(row.q.dim)) + " in base units." });
      }
      S.recordAnswer(row.q.mod, ok, "unit:" + row.q.id, "Units and dimensions");
      const net = run.right - run.wrong;
      scoreChip.textContent = net + " net";
      if (rows.every(r => r.answered !== null)) setTimeout(finish, 500);
    }

    const tick = setInterval(() => {
      if (run.over) return;
      run.left--;
      timerChip.textContent = U.fmtTime(Math.max(0, run.left));
      timerChip.classList.toggle("low", run.left <= 12);
      if (run.left <= 0) finish();
    }, 1000);
    UI.onLeave(() => clearInterval(tick));

    function finish() {
      if (run.over) return;
      run.over = true;
      clearInterval(tick);
      done.disabled = true;

      const attempted = run.right + run.wrong;
      const net = run.right - run.wrong;
      /* Net score, and credit only above the 55% baseline: a full board of guesses
         at four options averages 25% right and 75% wrong, giving a strongly
         negative net, so it pays nothing. */
      const fraction = attempted ? run.right / attempted : 0;
      const credited = fraction > BASELINE ? Math.max(0, net) : 0;
      const xp = credited * 12;
      const accuracy = fraction;
      const perfect = run.right === ROWS && run.wrong === 0;
      const bonus = perfect ? 70 : Math.round(40 * Math.max(0, (fraction - BASELINE) / (1 - BASELINE)));

      const res = UI.award({ xp, bonus, accuracy, pace: run.pace,
                             coins: Math.round(xp * 0.5) });
      S.markMode("unitgrid");
      if (perfect) { S.bump("perfectUnitGrid"); S.bump("perfectRuns"); }
      const newBest = S.recordScore("unitgrid", net);
      if (S.progressDaily("unitgrid", 1)) {
        UI.toast({ icon: "📅", kind: "good", text: "<b>Daily challenge complete!</b>" });
      }
      UI.results({
        title: "Unit Grid complete",
        correct: run.right, total: ROWS, xp: res.xp, coins: res.coins, newBest,
        extraStats: [
          ["Net", net],
          ["Wrong", run.wrong],
          ["Credited", fraction > BASELINE ? credited : "below 55%"]
        ],
        review: false,
        onAgain: () => UI.go("/game/unitgrid")
      });
    }

    return () => clearInterval(tick);
  }

  return { screen, buildBoard, ROWS, COLS, BASELINE, MAX_COLUMN_SHARE };
})();
