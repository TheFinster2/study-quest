/* Derivation Chain — the best physics mode in the brief's list.

   You are given some quantities and a target. You pick equations off the formula
   sheet one at a time; each pick either APPLIES (because all but one of its
   variables are now known, so it yields that one) or it does not. It teaches
   equation selection, which is the actual exam skill.

   The chemistry app's Pathway Puzzle shipped two farming holes and both apply
   here unchanged, so both are closed here from the start:

   · NO PER-ITEM SCORE FLOOR (addendum §C1). Paying Math.max(15, score) per solved
     item, and scoring accuracy as solved/total, meant a bot that flailed until it
     stumbled through collected the floor on everything plus a full completion
     bonus. Here a wasted pick costs, the per-item award can reach zero, and the
     completion bonus is gated on EFFICIENCY — ideal picks ÷ picks actually spent,
     wasted ones included — not on "got there in the end".

   · RESTART IS NOT A FREE UNDO (addendum §C2). "Restart this chain" is needed,
     because a wrong pick can leave you staring at a sheet you have already
     mis-read. But it used to reset the wasted-move counter, so the cheapest
     strategy became "try everything, note what worked, restart, do it cleanly".
     The wasted picks AND the picks already made are charged to the item BEFORE
     the board clears.

   The shortest route is recomputed from the equation graph every time (addendum
   §D5) rather than stored, so a stale "this takes 3 steps" can never disagree
   with the puzzle actually on screen.                                           */
window.PHYS = window.PHYS || {};
PHYS.Games = PHYS.Games || {};

PHYS.Games.chain = (function () {
  const U = PHYS.U, S = PHYS.State, UI = PHYS.UI;

  const ITEMS = 4;

  /** Constants are always available, so they never count as unknowns. */
  function unknownsOf(eq, known) {
    return eq.vars.filter(v => !known.has(v));
  }
  /** An equation applies when exactly one of its variables is still unknown. */
  const applies = (eq, known) => unknownsOf(eq, known).length === 1;

  /** Shortest number of equation applications from `known` to `target`, or null. */
  function shortestRoute(knownList, target) {
    const start = knownList.slice().sort().join(",");
    const seen = new Set([start]);
    let frontier = [{ known: new Set(knownList), steps: 0 }];
    for (let depth = 0; depth < 8; depth++) {
      const next = [];
      for (const node of frontier) {
        if (node.known.has(target)) return node.steps;
        for (const eq of PHYS.DATA.equations) {
          if (!applies(eq, node.known)) continue;
          const gained = unknownsOf(eq, node.known)[0];
          const k = new Set(node.known);
          k.add(gained);
          const key = Array.from(k).sort().join(",");
          if (seen.has(key)) continue;
          seen.add(key);
          next.push({ known: k, steps: node.steps + 1 });
        }
      }
      if (!next.length) break;
      frontier = next;
    }
    for (const node of frontier) if (node.known.has(target)) return node.steps;
    return null;
  }

  /** Chains that are actually solvable with the equations shipped. */
  function solvableChains(mods) {
    return PHYS.DATA.chains.filter(c => {
      if (mods && mods.length && !mods.includes(c.mod)) return false;
      const r = shortestRoute(c.known, c.target);
      return r !== null && r >= 1 && r <= 4;
    });
  }

  function screen(view, args) {
    const mods = args && args.mod ? [args.mod] : null;
    let available = solvableChains(mods);
    if (available.length < ITEMS) available = solvableChains(null);
    if (!available.length) { UI.go("/play"); return; }

    const chosen = U.sample(available, Math.min(ITEMS, available.length));
    const shell = UI.gameShell("Derivation Chain", { confirmExit: true });
    view.appendChild(shell.root);

    const run = {
      i: 0, solved: 0, over: false, xp: 0,
      idealTotal: 0, spentTotal: 0, wastedTotal: 0,
      pace: UI.pacer()
    };

    const scoreChip = UI.chip("0/" + chosen.length, "on");
    const wasteChip = UI.chip("0 wasted");
    shell.meta.appendChild(scoreChip);
    shell.meta.appendChild(wasteChip);

    const storyCard = U.el("div", { class: "card" });
    const track = U.el("div", { class: "chain-track" });
    const poolWrap = U.el("div", { class: "card" });
    shell.body.appendChild(storyCard);
    shell.body.appendChild(track);
    shell.body.appendChild(poolWrap);

    let item = null;

    function startItem() {
      const c = chosen[run.i];
      const ideal = shortestRoute(c.known, c.target);
      item = {
        chain: c, ideal,
        known: new Set(c.known),
        used: [], spent: 0, wasted: 0,
        // Charged across a restart: see the §C2 note at the top of this file.
        carriedSpent: 0, carriedWasted: 0,
        done: false
      };
      draw();
    }

    function draw() {
      const c = item.chain;
      storyCard.innerHTML = "";
      storyCard.appendChild(U.el("div", { class: "qtag" }, [
        UI.chip(PHYS.Bank.moduleName(c.mod)),
        UI.chip("chain " + (run.i + 1) + "/" + chosen.length),
        UI.chip("shortest route: " + item.ideal + (item.ideal === 1 ? " step" : " steps"))
      ]));
      storyCard.appendChild(U.el("p", { text: c.story }));
      storyCard.appendChild(U.el("div", { class: "row" }, [
        U.el("span", { class: "muted", text: "Target:" }),
        U.el("span", { class: "known target", html: symbolLabel(c.target) })
      ]));

      track.innerHTML = "";
      track.appendChild(U.el("span", { class: "muted tiny", text: "Known:" }));
      Array.from(item.known).forEach(v => {
        const isNew = item.used.length && item.used[item.used.length - 1].gained === v;
        track.appendChild(U.el("span", {
          class: "known" + (isNew ? " fresh" : "") + (v === c.target ? " target" : ""),
          html: symbolLabel(v)
        }));
      });

      poolWrap.innerHTML = "";
      poolWrap.appendChild(U.el("h3", { text: "Pick an equation" }));
      poolWrap.appendChild(U.el("p", { class: "tiny muted", text:
        "An equation only applies when everything in it except one quantity is already " +
        "known. A pick that does not apply is a wasted move and it costs you." }));

      const pool = U.el("div", { class: "eqpool" });
      /* The pool is the whole relevant sheet, not just the useful equations — the
         skill being trained is choosing, and a pool of only-correct options trains
         nothing. */
      const relevant = PHYS.DATA.equations.filter(eq =>
        eq.vars.some(v => item.known.has(v)) || eq.vars.includes(c.target));
      const shown = U.shuffle(relevant).slice(0, 14);
      // Guarantee at least one applicable equation is on screen.
      if (!shown.some(eq => applies(eq, item.known))) {
        const helper = relevant.find(eq => applies(eq, item.known));
        if (helper) shown[shown.length - 1] = helper;
      }

      for (const eq of shown) {
        const usedAlready = item.used.some(u => u.id === eq.id);
        const btn = U.el("button", {
          class: "eqcard" + (usedAlready ? " used" : ""),
          disabled: item.done || undefined,
          on: { click: () => pick(eq, btn) }
        }, [
          U.el("span", { html: U.math(eq.formula) }),
          U.el("small", { text: eq.name })
        ]);
        pool.appendChild(btn);
      }
      poolWrap.appendChild(pool);

      const controls = U.el("div", { class: "row", style: "margin-top:12px" }, [
        U.el("button", {
          class: "btn btn-ghost btn-sm",
          text: "↺ Restart this chain (keeps the cost)",
          disabled: item.done || undefined,
          on: { click: restart }
        }),
        U.el("div", { class: "spacer" }),
        U.el("span", { class: "tiny muted",
          text: `${item.spent} pick${item.spent === 1 ? "" : "s"}, ${item.wasted} wasted` })
      ]);
      poolWrap.appendChild(controls);
      run.pace.show();
    }

    function pick(eq, btn) {
      if (item.done) return;
      /* Choosing an equation off a sheet of fourteen takes longer than 1.2 s.
         Marked per PICK, so exhausting the pool by clicking pays nothing. */
      if (run.pace.mark()) item.rushed = (item.rushed || 0) + 1;
      item.spent++;
      if (!applies(eq, item.known)) {
        item.wasted++;
        run.wastedTotal++;
        wasteChip.textContent = run.wastedTotal + " wasted";
        PHYS.Sound.wrong();
        btn.classList.add("miss");
        setTimeout(() => btn.classList.remove("miss"), 400);
        const missing = unknownsOf(eq, item.known);
        UI.toast({ icon: "🚫", kind: "bad", ms: 3200, text:
          missing.length === 0
            ? "Everything in that equation is already known — it tells you nothing new."
            : "That leaves " + missing.length + " unknowns (" +
              missing.map(v => U.mathPlain(symbolLabel(v))).join(", ") +
              "). You can only use an equation with exactly one unknown left." });
        draw();
        return;
      }
      const gained = unknownsOf(eq, item.known)[0];
      item.known.add(gained);
      item.used.push({ id: eq.id, gained, name: eq.name });
      PHYS.Sound.snap();
      S.bump("derivationSteps");

      if (item.known.has(item.chain.target)) return solved();
      draw();
    }

    function restart() {
      /* Carry the cost across. Without this, "try everything, restart, do it
         cleanly" is strictly the cheapest strategy and the mode teaches nothing. */
      item.carriedSpent += item.spent;
      item.carriedWasted += item.wasted;
      item.known = new Set(item.chain.known);
      item.used = [];
      item.spent = 0;
      item.wasted = 0;
      UI.toast({ icon: "↺", ms: 2600, text:
        `Board reset. The ${item.carriedSpent} pick${item.carriedSpent === 1 ? "" : "s"} you have ` +
        `already spent still count towards this chain's score.` });
      draw();
    }

    function solved() {
      item.done = true;
      const spent = item.spent + item.carriedSpent;
      const wasted = item.wasted + item.carriedWasted;
      run.solved++;
      run.idealTotal += item.ideal;
      run.spentTotal += spent;

      /* NO FLOOR. A chain solved in twice the necessary picks pays about half; one
         solved by exhausting the sheet pays nothing at all. */
      const efficiency = spent > 0 ? Math.min(1, item.ideal / spent) : 0;
      // An item solved entirely by rushed picks pays nothing for itself either.
      const readAnything = (item.rushed || 0) < spent;
      const gained = readAnything ? Math.round(30 * item.ideal * efficiency) : 0;
      run.xp += gained;
      scoreChip.textContent = run.solved + "/" + chosen.length;
      PHYS.Sound.win();
      PHYS.FX.confetti(50);

      S.bump("chainsSolved");
      S.data.chainsSolvedIds[item.chain.id] = Date.now();
      S.save();

      poolWrap.innerHTML = "";
      poolWrap.appendChild(U.el("h3", { text: "Chain complete" }));
      const w = U.el("div", { class: "working" });
      item.used.forEach((u, i) => {
        const eq = PHYS.DATA.equations.find(e => e.id === u.id);
        w.appendChild(U.el("div", { class: "wstep" }, [
          U.el("span", { class: "wstep-n", text: String(i + 1) }),
          U.el("span", { class: "wstep-b" }, [
            U.el("span", { html: U.math(eq.formula) }),
            U.el("span", { class: "wstep-note", html:
              eq.name + " → gives " + U.math(symbolLabel(u.gained)) })
          ])
        ]));
      });
      poolWrap.appendChild(w);
      poolWrap.appendChild(U.el("p", { class: "tiny muted", html:
        `<b>${spent}</b> pick${spent === 1 ? "" : "s"} against a shortest route of ` +
        `<b>${item.ideal}</b>${wasted ? `, including <b>${wasted}</b> that did not apply` : ""} — ` +
        `efficiency ${Math.round(efficiency * 100)}%, worth <b>${gained}</b> XP.` }));
      poolWrap.appendChild(U.el("button", {
        class: "btn btn-primary btn-block",
        text: run.i + 1 >= chosen.length ? "I've read the route — show my results" : "Next chain →",
        on: { click: () => {
          if (run.i + 1 >= chosen.length) return finish();
          run.i++;
          startItem();
          window.scrollTo({ top: 0, behavior: "smooth" });
        } }
      }));
      draw.updated = true;
    }

    function finish() {
      if (run.over) return;
      run.over = true;
      const accuracy = chosen.length ? run.solved / chosen.length : 0;
      const efficiency = run.spentTotal ? Math.min(1, run.idealTotal / run.spentTotal) : 0;
      /* The completion bonus is gated on efficiency, not on completion. Flailing
         through every chain earns close to nothing. */
      const bonus = Math.round(90 * efficiency * accuracy);

      const res = UI.award({
        xp: run.xp, bonus, accuracy, pace: run.pace,
        coins: Math.round(run.xp * 0.5)
      });
      S.markMode("chain");
      if (run.solved === chosen.length && run.wastedTotal === 0) S.bump("perfectRuns");
      const newBest = S.recordScore("chain", Math.round(efficiency * 100));
      if (S.progressDaily("chain", run.solved)) {
        UI.toast({ icon: "📅", kind: "good", text: "<b>Daily challenge complete!</b>" });
      }

      UI.results({
        title: "Derivation Chain complete",
        correct: run.solved, total: chosen.length, xp: res.xp, coins: res.coins, newBest,
        extraStats: [
          ["Picks", run.spentTotal],
          ["Ideal", run.idealTotal],
          ["Efficiency", Math.round(efficiency * 100) + "%"]
        ],
        reviewLabel: "👁 Review the routes",
        onAgain: () => UI.go("/game/chain" + (args && args.mod ? "/" + args.mod : ""))
      });
    }

    function symbolLabel(v) {
      const sym = PHYS.DATA.symbols[v];
      /* Through the renderer, and via `disp` where the key is not renderable as it
         stands: the chips used to read "DeltaT" instead of "ΔT". */
      const label = U.math((sym && sym.disp) || v);
      return sym ? label + " <span class='wstep-note' style='display:inline'>" +
                   U.escapeHtml(sym.name) + "</span>" : label;
    }

    startItem();
  }

  return { screen, shortestRoute, applies, solvableChains };
})();
