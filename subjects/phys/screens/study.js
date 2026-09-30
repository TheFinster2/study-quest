/* Study — spaced-repetition flashcards, and the reference sheet.

   Cards are self-graded, so nothing stops someone tapping "Got it" forever. XP is
   payable once per card per day (State.cardXpEligible), which caps the honest
   maximum at roughly the number of cards actually due — see the note in state.js.

   The 3D flip needs the -webkit- prefixes on iOS or both faces render during the
   turn, and the animated element must be the CHILD of the one owning the
   perspective or the flip judders (addendum §G3). Both are in the stylesheet. */
window.PHYS = window.PHYS || {};
PHYS.Screens = PHYS.Screens || {};

PHYS.Screens.study = (function () {
  const U = PHYS.U, S = PHYS.State, UI = PHYS.UI, B = PHYS.Bank;

  function screen(view, args) {
    if (args && args[0] === "deck") return deck(view, args[1]);

    const wrap = U.el("div", { class: "grid" });
    view.appendChild(wrap);

    const all = B.cards().filter(c => B.covered(c.mod));
    const due = S.dueCards();
    wrap.appendChild(U.el("h1", { text: "Study" }));
    wrap.appendChild(U.el("p", { class: "muted", html:
      `<b>${due.length}</b> of ${all.length} cards are due. Cards you get right come back later ` +
      `and later; cards you miss come back tomorrow.` }));

    wrap.appendChild(U.el("div", { class: "row" }, [
      U.el("button", {
        class: "btn btn-primary", disabled: !due.length || undefined,
        text: due.length ? "🃏 Review " + Math.min(due.length, 20) + " due" : "Nothing due — well kept",
        on: { click: () => UI.go("/study/deck/due") }
      }),
      U.el("button", { class: "btn", text: "🎲 Free review",
                       on: { click: () => UI.go("/study/deck/all") } }),
      U.el("button", { class: "btn btn-ghost", text: "📖 Reference sheet",
                       on: { click: () => UI.go("/reference") } })
    ]));
    if (all.length < B.cards().length) {
      wrap.appendChild(U.el("p", { class: "tiny muted", html:
        (B.cards().length - all.length) + " cards are hidden by your coverage settings — " +
        "<a href='" + UI.href("/options") + "'>change what you study</a>." }));
    }

    /* Leeches: cards missed four or more times. Named, because a card you keep
       missing is one you are not learning the way you are trying to learn it. */
    const leeches = S.leeches().filter(x => B.covered(x.q.mod));
    if (leeches.length) {
      wrap.appendChild(U.el("h2", {}, [
        U.el("span", { text: "Leeches" }),
        U.el("span", { class: "h2-sub", text: leeches.length + " cards" })
      ]));
      const lc = U.el("div", { class: "card" });
      lc.appendChild(U.el("p", { class: "tiny muted", text:
        "Missed four times or more. Rereading will not fix these — try writing the answer " +
        "out, or find the worked example on the reference sheet." }));
      leeches.slice(0, 8).forEach(x => lc.appendChild(U.el("div", { class: "wrongq" }, [
        U.el("div", { class: "q", html: U.math(x.q.front) }),
        U.el("div", { class: "a", html: U.math(x.q.back) + "  ·  missed " + x.c.lapses + "×" })
      ])));
      lc.appendChild(U.el("button", { class: "btn btn-primary btn-block", text: "🩸 Drill the leeches",
        on: { click: () => UI.go("/study/deck/leech") } }));
      wrap.appendChild(lc);
    }

    /* Leitner box distribution — how well the deck is actually held. */
    const boxes = [0, 0, 0, 0, 0, 0];
    all.forEach(c => {
      const st = S.data.srs[c.id];
      boxes[st ? st.box : 1]++;
    });
    wrap.appendChild(U.el("h2", { text: "How well it is held" }));
    const boxCard = U.el("div", { class: "card" });
    for (let b = 1; b <= 5; b++) {
      boxCard.appendChild(U.el("div", { class: "mastery-item" }, [
        U.el("div", { class: "mastery-badge", text: "B" + b }),
        U.el("div", { class: "mastery-body" }, [
          U.el("div", { class: "mastery-name", text: ["", "seen once", "2 days", "4 days", "8 days", "16 days"][b] }),
          U.el("div", { class: "bar" }, [
            U.el("i", { style: "width:" + (all.length ? (boxes[b] / all.length) * 100 : 0) + "%" })
          ])
        ]),
        U.el("div", { class: "mastery-pct", text: String(boxes[b]) })
      ]));
    }
    wrap.appendChild(boxCard);

    /* Per-module decks. */
    wrap.appendChild(U.el("h2", { text: "By module" }));
    const grid = U.el("div", { class: "grid g2" });
    B.MODULES.forEach(m => {
      const pool = all.filter(c => c.mod === m.id);
      const dueHere = due.filter(c => c.mod === m.id).length;
      grid.appendChild(U.el("button", {
        class: "game-card", style: "--gc:#4cc9f0",
        disabled: !pool.length || undefined,
        on: { click: () => UI.go("/study/deck/" + m.id) }
      }, [
        U.el("div", { class: "game-ico", text: m.icon }),
        U.el("div", { class: "game-name", text: m.id + " · " + m.short }),
        U.el("div", { class: "game-desc", text: pool.length + " cards" }),
        U.el("div", { class: "game-foot" }, [
          U.el("span", { text: dueHere ? dueHere + " due" : "none due" })
        ])
      ]));
    });
    wrap.appendChild(grid);
  }

  function deck(view, which) {
    const all = B.cards();
    let cards;
    if (which === "due") cards = U.sample(S.dueCards(), 20);
    else if (which === "leech") cards = S.leeches().map(x => x.q).slice(0, 20);
    else if (which === "all") cards = U.sample(all.filter(c => B.covered(c.mod)), 20);
    else cards = U.sample(all.filter(c => c.mod === which), 20);

    if (!cards.length) { UI.go("/study"); return; }

    const shell = UI.gameShell("Flashcards" + (which && which.length === 2 ? " — " + B.moduleName(which) : ""),
                               { backTo: "/study", tools: false });
    view.appendChild(shell.root);

    const run = { i: 0, got: 0, missed: 0, xp: 0, over: false };
    const progChip = UI.chip("1/" + cards.length, "on");
    shell.meta.appendChild(progChip);

    const card = U.el("div", { class: "fcard" });
    const inner = U.el("div", { class: "fcard-inner" });
    card.appendChild(inner);
    shell.body.appendChild(card);
    const controls = U.el("div", { class: "grid" });
    shell.body.appendChild(controls);

    let keyHandler = null;
    const onKey = e => { if (keyHandler) keyHandler(e); };
    document.addEventListener("keydown", onKey);
    UI.onLeave(() => document.removeEventListener("keydown", onKey));

    function render() {
      const c = cards[run.i];
      const st = S.cardState(c.id);
      card.classList.remove("flip");
      inner.innerHTML = "";
      progChip.textContent = (run.i + 1) + "/" + cards.length;

      const front = U.el("div", { class: "fface" }, [
        U.el("div", { class: "fhint", text: B.moduleName(c.mod) + " · " + (c.topic || "") }),
        U.el("div", { class: "fq", html: U.math(c.front) }),
        U.el("div", { class: "fhint", text: "tap to reveal" }),
        leitner(st.box)
      ]);
      const back = U.el("div", { class: "fface fface-b" }, [
        U.el("div", { class: "fhint", text: "answer" }),
        U.el("div", { class: "fa", html: U.math(c.back) }),
        c.note ? U.el("div", { class: "fhint", html: U.math(c.note) }) : null
      ]);
      inner.appendChild(front);
      inner.appendChild(back);

      let flipped = false;
      const flip = () => {
        flipped = !flipped;
        card.classList.toggle("flip", flipped);
        PHYS.Sound.click();
        grade.hidden = !flipped;
      };
      card.onclick = flip;
      card.setAttribute("role", "button");
      card.setAttribute("tabindex", "0");
      card.setAttribute("aria-label", "Flip the card");

      controls.innerHTML = "";
      /* Graded review: again resets the card (and counts a lapse), hard keeps its
         box and brings it back tomorrow, good moves it up one box, easy two. */
      const grade = U.el("div", { class: "grade-row", hidden: true }, [
        U.el("button", { class: "btn", text: "1 · Again", on: { click: () => mark("again") } }),
        U.el("button", { class: "btn", text: "2 · Hard", on: { click: () => mark("hard") } }),
        U.el("button", { class: "btn btn-primary", text: "3 · Good", on: { click: () => mark("good") } }),
        U.el("button", { class: "btn", text: "4 · Easy", on: { click: () => mark("easy") } })
      ]);
      keyHandler = e => {
        if (SQ.UI.modalOpen() || run.over) return;
        if (e.key === " " || (e.key === "Enter" && !flipped)) { e.preventDefault(); flip(); return; }
        const g = ({ "1": "again", "2": "hard", "3": "good", "4": "easy" })[e.key];
        if (g && flipped) { e.preventDefault(); mark(g); }
      };
      controls.appendChild(grade);
      controls.appendChild(U.el("p", { class: "tiny muted", style: "text-align:center", text:
        "Be honest — a card you half-knew is a card you will forget. XP is payable once per " +
        "card per day, and only when it was due, so there is nothing to gain from tapping through. " +
        "Keys: space flips, 1–4 grades." }));

      function mark(g) {
        const gotIt = g !== "again";
        const eligible = S.cardXpEligible(c.id);
        S.reviewCard(c.id, g);
        if (gotIt) {
          run.got++;
          if (eligible) { run.xp += 6; S.markCardXp(c.id); }
          PHYS.Sound.correct();
        } else {
          run.missed++;
          PHYS.Sound.wrong();
        }
        if (run.i + 1 >= cards.length) return finish();
        run.i++;
        render();
      }
    }

    function leitner(box) {
      const row = U.el("div", { class: "leitner" });
      for (let b = 1; b <= 5; b++) {
        row.appendChild(U.el("div", { class: "lbox" + (b <= box ? " on" : ""), text: String(b) }));
      }
      return row;
    }

    function finish() {
      if (run.over) return;
      run.over = true;
      const total = run.got + run.missed;
      const accuracy = total ? run.got / total : 0;
      const res = UI.award({ xp: run.xp, bonus: Math.round(20 * accuracy), accuracy,
                             coins: Math.round(run.xp * 0.4) });
      S.markMode("cards");
      UI.results({
        title: "Deck reviewed",
        correct: run.got, total, xp: res.xp, coins: res.coins,
        extraStats: [["Mastered", S.data.stats.cardsMastered],
                     ["Again", run.missed]],
        review: false, backTo: "/study",
        onAgain: () => UI.go("/study/deck/" + which)
      });
    }

    render();
  }

  return { screen };
})();
