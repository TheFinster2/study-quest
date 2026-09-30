/* Graph Story — match a motion graph to its description, and the reverse.

   Replaces chemistry's Name That Compound. Both directions are asked, because
   reading a graph and sketching one are different skills and students are
   reliably better at the first.

   Graphs are generated from a description rather than drawn by hand, so the
   picture and the words can never disagree.                                     */
window.PHYS = window.PHYS || {};
PHYS.Games = PHYS.Games || {};

PHYS.Games.graph = (function () {
  const U = PHYS.U, S = PHYS.State, UI = PHYS.UI, D = PHYS.Draw;

  const ROUNDS = 8;

  /* Each story generates its own points, so the graph IS the description. */
  const STORIES = [
    { id: "gs-rest", kind: "vt", desc: "at rest the whole time",
      points: t => 0 },
    { id: "gs-const-v", kind: "vt", desc: "moving at a constant velocity",
      points: t => 8 },
    { id: "gs-accel", kind: "vt", desc: "speeding up uniformly from rest",
      points: t => 2.2 * t },
    { id: "gs-decel", kind: "vt", desc: "slowing down uniformly to rest",
      points: t => Math.max(0, 14 - 1.6 * t) },
    { id: "gs-accel-from-v", kind: "vt", desc: "already moving, then speeding up uniformly",
      points: t => 5 + 1.5 * t },
    { id: "gs-reverse", kind: "vt", desc: "slowing to a stop, then moving back the other way",
      points: t => 10 - 2.4 * t },
    { id: "gs-accel-then-const", kind: "vt",
      desc: "speeding up, then holding a steady velocity",
      points: t => (t < 4 ? 3 * t : 12) },
    { id: "gs-accel-increasing", kind: "vt",
      desc: "speeding up, with the acceleration itself increasing",
      points: t => 0.28 * t * t },

    { id: "gs-xt-rest", kind: "xt", desc: "stationary at a fixed position",
      points: t => 20 },
    { id: "gs-xt-const", kind: "xt", desc: "moving away at a constant velocity",
      points: t => 3 * t },
    { id: "gs-xt-accel", kind: "xt", desc: "speeding up (the graph curves upwards)",
      points: t => 0.5 * t * t },
    { id: "gs-xt-back", kind: "xt", desc: "moving back towards the origin at a constant velocity",
      points: t => 30 - 3 * t },
    { id: "gs-xt-decel", kind: "xt", desc: "moving away but slowing down (the graph flattens off)",
      points: t => 30 * (1 - Math.exp(-0.35 * t)) },
    { id: "gs-xt-out-back", kind: "xt", desc: "moving away, stopping, then returning",
      points: t => 24 - 1.4 * Math.pow(t - 5, 2) }
  ];

  function pointsOf(story) {
    const out = [];
    for (let i = 0; i <= 24; i++) {
      const t = (i / 24) * 9;
      out.push([t, story.points(t)]);
    }
    return out;
  }

  function svgFor(story) {
    const isVt = story.kind === "vt";
    return D.graph({
      points: pointsOf(story),
      xLabel: "t (s)",
      yLabel: isVt ? "v (m s⁻¹)" : "x (m)",
      shade: isVt,
      label: (isVt ? "velocity" : "displacement") + "–time graph: " + story.desc
    });
  }

  function screen(view) {
    const shell = UI.gameShell("Graph Story", { confirmExit: true });
    view.appendChild(shell.root);

    const rounds = [];
    const picked = U.sample(STORIES, Math.min(ROUNDS, STORIES.length));
    picked.forEach((s, i) => rounds.push({ story: s, reverse: i % 2 === 1 }));

    const run = { i: 0, correct: 0, over: false, xp: 0, pace: UI.pacer() };
    const scoreChip = UI.chip("0/" + rounds.length, "on");
    const progChip = UI.chip("1/" + rounds.length);
    shell.meta.appendChild(scoreChip);
    shell.meta.appendChild(progChip);

    const card = U.el("div", { class: "qcard" });
    const tail = U.el("div", { class: "grid" });
    shell.body.appendChild(card);
    shell.body.appendChild(tail);

    function render() {
      const r = rounds[run.i];
      const story = r.story;
      card.innerHTML = "";
      tail.innerHTML = "";
      progChip.textContent = (run.i + 1) + "/" + rounds.length;

      // Distractors come from the SAME graph kind, so the axes never give it away.
      const others = U.shuffle(STORIES.filter(s => s.kind === story.kind && s !== story)).slice(0, 3);
      const options = U.shuffle([story].concat(others));

      card.appendChild(U.el("div", { class: "qtag" }, [
        UI.chip(story.kind === "vt" ? "velocity–time" : "displacement–time"),
        UI.chip(r.reverse ? "pick the graph" : "pick the description")
      ]));

      if (!r.reverse) {
        card.appendChild(U.el("div", { class: "qtext", text: "What motion does this graph describe?" }));
        card.insertAdjacentHTML("beforeend", D.wrap(svgFor(story)));
        const choices = U.el("div", { class: "choices" });
        options.forEach((o, idx) => {
          choices.appendChild(U.el("button", { class: "choice", on: { click: () => answer(o, story, choices, idx, options) } }, [
            U.el("span", { class: "choice-key", text: "ABCD"[idx] }),
            U.el("span", { class: "choice-txt", text: "An object " + o.desc + "." })
          ]));
        });
        card.appendChild(choices);
      } else {
        card.appendChild(U.el("div", { class: "qtext", text:
          "Which graph shows an object " + story.desc + "?" }));
        const pair = U.el("div", { class: "gs-pair", style: "margin-top:14px" });
        options.forEach((o, idx) => {
          const btn = U.el("button", { class: "gs-opt", on: { click: () => answer(o, story, pair, idx, options) } });
          btn.innerHTML = svgFor(o) + "<div class='gs-cap'>" + "ABCD"[idx] + "</div>";
          pair.appendChild(btn);
        });
        card.appendChild(pair);
      }
      run.pace.show();
    }

    function answer(chosen, story, container, idx, options) {
      const ok = chosen === story;
      /* classList.add("") throws — an empty token is not a valid class name. Only
         touch the button that was actually clicked, and separately mark the right
         one so a wrong guess still shows where the answer was. */
      const buttons = U.$$("button", container);
      buttons.forEach(b => { b.disabled = true; });
      if (buttons[idx]) buttons[idx].classList.add(ok ? "correct" : "wrong");
      const rightIdx = options.indexOf(story);
      if (!ok && buttons[rightIdx]) buttons[rightIdx].classList.add("correct");
      /* Tapping an option in under 1.2 s cannot involve looking at a graph, so it
         pays nothing — and a whole run of that pays nothing at all, bonus included.
         Without this a scripted clicker earned over 160 000 XP an hour here. */
      const tooFast = run.pace.mark();
      if (ok) {
        run.correct++;
        /* 30, not 18. Reading a velocity–time graph against a story is at least as
           much work as a recall question, and tests/honest.js measured this mode at a
           twelfth of Rapid Fire's rate and an eighth of Module Drill's — under-paying
           the mode that trains the skill the exam leans on hardest. */
        run.xp += tooFast ? 0 : 30;
        PHYS.Sound.correct();
      } else {
        run.xp = Math.max(0, run.xp - 5);
        PHYS.Sound.wrong();
        PHYS.FX.shake(card);
      }
      S.bump("graphsRead");
      S.recordAnswer(story.kind === "vt" ? "M1" : "M1", ok, story.id, "Graphs of motion");
      scoreChip.textContent = run.correct + "/" + rounds.length;

      const fb = U.el("div", { class: "feedback " + (ok ? "ok" : "no") });
      fb.appendChild(U.el("div", { html: (ok ? "<b>Correct.</b> " : "<b>Not that one.</b> ") +
        "This graph shows an object <b>" + U.escapeHtml(story.desc) + "</b>." }));
      fb.appendChild(U.el("span", { class: "wstep-note", text: story.kind === "vt"
        ? "On a velocity–time graph the GRADIENT is the acceleration and the AREA is the " +
          "displacement. A horizontal line means constant velocity, not being at rest — that " +
          "is a line at v = 0."
        : "On a displacement–time graph the GRADIENT is the velocity. A curve means the " +
          "velocity is changing, and a horizontal section means the object is stationary." }));
      tail.appendChild(fb);

      if (!ok) {
        tail.insertAdjacentHTML("beforeend", D.wrap(svgFor(story)));
      }
      tail.appendChild(U.el("button", {
        class: "btn btn-primary btn-block",
        text: run.i + 1 >= rounds.length ? "Show my results" : "Next graph →",
        on: { click: () => {
          if (run.i + 1 >= rounds.length) return finish();
          run.i++;
          render();
          window.scrollTo({ top: 0, behavior: "smooth" });
        } }
      }));
    }

    function finish() {
      if (run.over) return;
      run.over = true;
      const accuracy = rounds.length ? run.correct / rounds.length : 0;
      const bonus = Math.round(50 * accuracy);
      const res = UI.award({ xp: run.xp, bonus, accuracy, pace: run.pace,
                             coins: Math.round(run.xp * 0.45) });
      S.markMode("graph");
      if (run.correct === rounds.length) S.bump("perfectRuns");
      const newBest = S.recordScore("graph", run.correct);
      if (S.progressDaily("graph", run.correct)) {
        UI.toast({ icon: "📅", kind: "good", text: "<b>Daily challenge complete!</b>" });
      }
      UI.results({
        title: "Graph Story complete",
        correct: run.correct, total: rounds.length, xp: res.xp, coins: res.coins, newBest,
        onAgain: () => UI.go("/game/graph")
      });
    }

    render();
  }

  return { screen, STORIES, svgFor };
})();
