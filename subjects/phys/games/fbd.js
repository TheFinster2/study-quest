/* Free-Body Builder — replaces chemistry's Balance Blitz.

   Two stages per scenario: choose exactly the forces that ACT on the body (the
   pool contains plausible non-forces, which is where the marks are lost in the
   exam), then give the magnitude of the net force.

   The "show the resultant" helper is a genuine crutch, so per addendum §C3 it
   costs 30% of the run and LATCHES: the flag is set the moment it is first used
   and is never cleared. Both sibling apps originally set the penalty on the
   current state, so switching the helper off before submitting refunded it. The
   results screen names it, so the cost is visible rather than merely suffered. */
window.PHYS = window.PHYS || {};
PHYS.Games = PHYS.Games || {};

PHYS.Games.fbd = (function () {
  const U = PHYS.U, S = PHYS.State, UI = PHYS.UI;

  const ITEMS = 5;
  const HELPER_PENALTY = 0.30;

  /* Each scenario lists the forces that really act, plus distractors that sound
     like forces and are not. `angle` is degrees, 0 = right, 90 = up. */
  const SCENARIOS = [
    {
      id: "fbd-rest", mod: "M2", body: "block", ground: true,
      text: "A 12 kg crate rests on a level floor. Nothing is pushing it.",
      forces: [
        { label: "weight (mg)", angle: 270, mag: 1 },
        { label: "normal force (N)", angle: 90, mag: 1 }
      ],
      wrong: ["applied force", "friction", "force of motion", "air resistance"],
      net: 0, netNote: "At rest and staying at rest, so the forces balance exactly.",
      m: 12
    },
    {
      id: "fbd-fall", mod: "M2", body: "ball",
      text: "A 2.0 kg ball is in free fall. Air resistance is negligible.",
      forces: [{ label: "weight (mg)", angle: 270, mag: 1 }],
      wrong: ["normal force", "air resistance", "upthrust", "force of motion", "tension"],
      net: 19.6, netNote: "Only gravity acts, so the net force is just the weight, mg.",
      m: 2
    },
    {
      id: "fbd-terminal", mod: "M2", body: "ball",
      text: "A 0.80 kg raindrop is falling at its terminal velocity.",
      forces: [
        { label: "weight (mg)", angle: 270, mag: 1 },
        { label: "air resistance", angle: 90, mag: 1 }
      ],
      wrong: ["normal force", "applied force", "upthrust from the ground", "force of motion"],
      net: 0,
      netNote: "Terminal velocity means constant velocity, which means zero net force — " +
               "the drag has grown until it exactly balances the weight.",
      m: 0.8
    },
    {
      id: "fbd-push", mod: "M2", body: "block", ground: true,
      text: "A 20 kg box is pushed along a rough floor with a horizontal 90 N force. " +
            "Friction on it is 50 N.",
      forces: [
        { label: "weight (mg)", angle: 270, mag: 1.4 },
        { label: "normal force (N)", angle: 90, mag: 1.4 },
        { label: "applied force 90 N", angle: 0, mag: 1.3 },
        { label: "friction 50 N", angle: 180, mag: 0.8 }
      ],
      wrong: ["force of motion", "centrifugal force", "reaction to the push on the box"],
      net: 40, netNote: "Vertically balanced; horizontally 90 − 50 = 40 N forwards.",
      m: 20
    },
    {
      id: "fbd-lift-up", mod: "M2", body: "block",
      text: "A 60 kg person stands in a lift accelerating upwards at 2.0 m s⁻².",
      forces: [
        { label: "weight (mg)", angle: 270, mag: 1.4 },
        { label: "normal force from the floor", angle: 90, mag: 1.7 }
      ],
      wrong: ["applied force", "tension in the cable", "force of acceleration", "friction"],
      net: 120,
      netNote: "The net force is ma = 60 × 2.0 = 120 N upwards. The cable's tension acts " +
               "on the LIFT, not on the person — only the floor touches them.",
      m: 60
    },
    {
      id: "fbd-incline", mod: "M2", body: "block",
      text: "A 5.0 kg block slides down a frictionless 30° ramp.",
      forces: [
        { label: "weight (mg)", angle: 270, mag: 1.4 },
        { label: "normal force ⊥ to the ramp", angle: 60, mag: 1.2 }
      ],
      wrong: ["friction", "applied force", "force down the slope", "centrifugal force"],
      net: 24.5,
      netNote: "Net force = mg sin30° = 5.0 × 9.8 × 0.5 = 24.5 N down the slope. There is no " +
               "separate 'force down the slope' — that IS a component of the weight.",
      m: 5
    },
    {
      id: "fbd-circular", mod: "M5", body: "ball",
      text: "A 0.50 kg ball on a string swings in a horizontal circle of radius 0.80 m at " +
            "3.0 m s⁻¹, on a frictionless table.",
      forces: [{ label: "tension in the string", angle: 180, mag: 1 }],
      wrong: ["centrifugal force", "centripetal force as a separate force",
              "force of motion", "air resistance"],
      net: 5.63,
      netNote: "The tension IS the centripetal force: F = mv²/r = 0.5 × 9 / 0.8 = 5.6 N " +
               "towards the centre. 'Centripetal force' names the ROLE a force plays, not an " +
               "extra force, and there is no outward centrifugal force acting on the ball at all.",
      m: 0.5
    },
    {
      id: "fbd-orbit", mod: "M5", body: "ball",
      text: "A 900 kg satellite is in a stable circular orbit.",
      forces: [{ label: "gravitational attraction", angle: 180, mag: 1 }],
      wrong: ["centrifugal force", "thrust from the engines", "air resistance",
              "normal force", "force of motion"],
      net: 0, netNote: null, skipNet: true,
      m: 900
    },
    {
      id: "fbd-tension-two", mod: "M2", body: "block",
      text: "A 15 kg sign hangs at rest from two vertical wires that share the load equally.",
      forces: [
        { label: "weight (mg)", angle: 270, mag: 1.4 },
        { label: "tension in wire 1", angle: 90, mag: 0.75 },
        { label: "tension in wire 2", angle: 90, mag: 0.75 }
      ],
      wrong: ["normal force", "applied force", "friction", "air resistance"],
      net: 0, netNote: "At rest, so the two tensions together balance the weight — 73.5 N each.",
      m: 15
    },
    {
      id: "fbd-braking", mod: "M2", body: "block", ground: true,
      text: "A 1200 kg car brakes on a level road, decelerating at 4.0 m s⁻².",
      forces: [
        { label: "weight (mg)", angle: 270, mag: 1.5 },
        { label: "normal force (N)", angle: 90, mag: 1.5 },
        { label: "friction from the road", angle: 180, mag: 1.1 }
      ],
      wrong: ["applied force forwards", "force of motion", "engine thrust", "air resistance"],
      net: 4800,
      netNote: "Net force = ma = 1200 × 4.0 = 4800 N backwards, supplied entirely by friction " +
               "between the tyres and the road. Nothing pushes the car forwards while it brakes.",
      m: 1200
    }
  ];

  function screen(view, args) {
    const chosen = U.sample(SCENARIOS, Math.min(ITEMS, SCENARIOS.length));
    const shell = UI.gameShell("Free-Body Builder", { confirmExit: true });
    view.appendChild(shell.root);

    const run = { i: 0, correct: 0, over: false, xp: 0, helperLatched: false, mistakes: 0,
                  pace: UI.pacer() };
    const scoreChip = UI.chip("0/" + chosen.length, "on");
    const penaltyChip = UI.chip("", "warnchip");
    penaltyChip.hidden = true;
    shell.meta.appendChild(scoreChip);
    shell.meta.appendChild(penaltyChip);

    const card = U.el("div", { class: "qcard" });
    const stageWrap = U.el("div", { class: "card" });
    const tail = U.el("div", { class: "grid" });
    shell.body.appendChild(card);
    shell.body.appendChild(stageWrap);
    shell.body.appendChild(tail);

    function render() {
      const sc = chosen[run.i];
      const picked = new Set();
      let locked = false;
      card.innerHTML = "";
      stageWrap.innerHTML = "";
      tail.innerHTML = "";

      card.appendChild(U.el("div", { class: "qtag" }, [
        UI.chip(PHYS.Bank.moduleName(sc.mod)),
        UI.chip((run.i + 1) + "/" + chosen.length)
      ]));
      card.appendChild(U.el("div", { class: "qtext", text: sc.text }));
      card.appendChild(U.el("p", { class: "muted tiny", text:
        "Select every force that acts ON the body — and nothing that does not." }));

      const options = U.shuffle(
        sc.forces.map(f => ({ label: f.label, right: true, force: f }))
          .concat(sc.wrong.map(w => ({ label: w, right: false })))
      );
      const slots = U.el("div", { class: "fbd-slots" });
      options.forEach(o => {
        const b = U.el("button", { class: "fbd-force", on: { click: () => {
          if (locked) return;
          if (picked.has(o)) { picked.delete(o); b.classList.remove("on"); }
          else { picked.add(o); b.classList.add("on"); }
          PHYS.Sound.click();
        } } }, [U.el("span", { text: o.label })]);
        o.node = b;
        slots.appendChild(b);
      });
      stageWrap.appendChild(U.el("h3", { text: "Which forces act?" }));
      stageWrap.appendChild(slots);

      const submit = U.el("button", {
        class: "btn btn-primary btn-block", style: "margin-top:12px",
        text: "Check the diagram", on: { click: checkForces }
      });
      stageWrap.appendChild(submit);

      /* The crutch: it draws the answer. Latches on first use, for the whole run. */
      const helper = U.el("button", {
        class: "btn btn-ghost btn-sm btn-block", style: "margin-top:8px",
        text: run.helperLatched ? "🧭 Show the resultant (already charged)"
                                : "🧭 Show the resultant (costs 30% of this run)",
        on: { click: () => {
          run.helperLatched = true;                       // one-way door
          penaltyChip.hidden = false;
          penaltyChip.textContent = "🧭 resultant shown · −30%";
          helper.disabled = true;
          tail.insertAdjacentHTML("afterbegin", PHYS.Draw.wrap(PHYS.Draw.freeBody({
            forces: sc.forces, body: sc.body, ground: sc.ground,
            caption: "the forces that act"
          })));
        } }
      });
      stageWrap.appendChild(helper);
      run.pace.show();

      function checkForces() {
        if (locked) return;
        locked = true;
        const tooFast = run.pace.mark();
        submit.disabled = true;
        helper.disabled = true;
        let wrongPicks = 0, missed = 0;
        options.forEach(o => {
          const chose = picked.has(o);
          o.node.classList.remove("on");
          if (o.right && chose) o.node.classList.add("right");
          else if (o.right && !chose) { o.node.classList.add("wrongc"); missed++; }
          else if (!o.right && chose) { o.node.classList.add("wrongc"); wrongPicks++; }
        });
        const perfect = wrongPicks === 0 && missed === 0;
        if (perfect) { PHYS.Sound.correct(); run.xp += tooFast ? 0 : 25; }
        else { PHYS.Sound.wrong(); run.mistakes += wrongPicks + missed; }

        tail.innerHTML = "";
        tail.insertAdjacentHTML("beforeend", PHYS.Draw.wrap(PHYS.Draw.freeBody({
          forces: sc.forces, body: sc.body, ground: sc.ground,
          caption: perfect ? "exactly right" : "the forces that actually act"
        })));
        const fb = U.el("div", { class: "feedback " + (perfect ? "ok" : "no") });
        fb.appendChild(U.el("div", { html: perfect
          ? "<b>Exactly right.</b> Every force accounted for and nothing invented."
          : `<b>Not quite.</b> ${wrongPicks ? wrongPicks + " force(s) that do not act, " : ""}` +
            `${missed ? missed + " missing" : ""}.` }));
        const invented = options.filter(o => !o.right && picked.has(o)).map(o => o.label);
        if (invented.length) {
          fb.appendChild(U.el("span", { class: "misc", text:
            "None of these acts on the body: " + invented.join(", ") + ". " +
            "A 'force of motion' does not exist — Newton's first law says motion needs no force " +
            "to keep it going. 'Centrifugal force' is not a force on the body either; the only " +
            "real force is the inward one." }));
        }
        tail.appendChild(fb);

        if (sc.skipNet) { finishItem(perfect); return; }
        askNet(perfect);
      }

      function askNet(forcesPerfect) {
        const input = U.el("input", { class: "numin js-answer", type: "text", inputmode: "decimal",
                                      placeholder: "net force in N", autocomplete: "off" });
        const box = U.el("div", { class: "card" }, [
          U.el("h3", { text: "What is the magnitude of the net force?" }),
          U.el("div", { class: "ansrow" }, [input,
            U.el("span", { class: "unitsel", style: "display:grid;place-items:center", html: U.math("\\u{N}") })]),
          U.el("div", { class: "unit-hint", text: "Accepted within 3%. Enter 0 if the forces balance." })
        ]);
        const go = U.el("button", { class: "btn btn-primary btn-block", style: "margin-top:10px",
                                    text: "Submit", on: { click: submitNet } });
        box.appendChild(go);
        tail.appendChild(box);
        setTimeout(() => input.focus({ preventScroll: true }), 60);
        input.addEventListener("keydown", e => { if (e.key === "Enter") submitNet(); });

        function submitNet() {
          go.disabled = true;
          input.disabled = true;
          const v = U.parseNum(input.value);
          const ok = sc.net === 0
            ? (isFinite(v) && Math.abs(v) < 0.5)
            : U.numClose(v, sc.net, 0.03);
          if (ok) { PHYS.Sound.correct(); run.xp += run.pace.mark() ? 0 : 25; }
          else { PHYS.Sound.wrong(); run.mistakes++; }
          const fb = U.el("div", { class: "feedback " + (ok ? "ok" : "no") });
          fb.appendChild(U.el("div", { html: (ok ? "<b>Correct.</b> " : "<b>Not that.</b> ") +
            "The net force is <b>" + U.fmtSig(sc.net, 3) + " N</b>." }));
          if (sc.netNote) fb.appendChild(U.el("span", { class: "wstep-note", text: sc.netNote }));
          tail.appendChild(fb);
          finishItem(forcesPerfect && ok);
        }
      }

      function finishItem(allRight) {
        if (allRight) { run.correct++; S.bump("fbdSolved"); }
        S.recordAnswer(sc.mod, allRight, sc.id, "Free-body diagrams");
        scoreChip.textContent = run.correct + "/" + chosen.length;
        tail.appendChild(U.el("button", {
          class: "btn btn-primary btn-block",
          text: run.i + 1 >= chosen.length ? "I've read it — show my results" : "Next scenario →",
          on: { click: () => {
            if (run.i + 1 >= chosen.length) return finish();
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
      const accuracy = chosen.length ? run.correct / chosen.length : 0;
      let bonus = Math.round(60 * accuracy);
      let xp = run.xp;
      if (run.helperLatched) {
        xp = Math.round(xp * (1 - HELPER_PENALTY));
        bonus = Math.round(bonus * (1 - HELPER_PENALTY));
      }
      const res = UI.award({ xp, bonus, accuracy, pace: run.pace,
                             coins: Math.round(xp * 0.45) });
      S.markMode("fbd");
      if (run.correct === chosen.length) S.bump("perfectRuns");
      const newBest = S.recordScore("fbd", run.correct);
      if (S.progressDaily("fbd", run.correct)) {
        UI.toast({ icon: "📅", kind: "good", text: "<b>Daily challenge complete!</b>" });
      }
      UI.results({
        title: "Free-Body Builder complete",
        correct: run.correct, total: chosen.length, xp: res.xp, coins: res.coins, newBest,
        extraStats: [["Slips", run.mistakes], ["Bonus", accuracy < 0.5 ? "withheld" : "+" + bonus]],
        penalties: [run.helperLatched ? "Resultant shown (−30%)" : null],
        onAgain: () => UI.go("/game/fbd")
      });
    }

    render();
  }

  return { screen, SCENARIOS, HELPER_PENALTY };
})();
