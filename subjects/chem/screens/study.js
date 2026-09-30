/* Study — Leitner flashcards and a quick-reference data sheet. */
window.CHEM = window.CHEM || {};
CHEM.Screens = CHEM.Screens || {};

CHEM.Screens.study = (function () {
  const U = CHEM.U, S = CHEM.State, UI = CHEM.UI;

  function screen(view, args) {
    const tab = args[0] === "reference" || args[0] === "ref" ? "ref" : args[0] === "leeches" ? "leeches" : "cards";

    view.appendChild(U.el("h1", { text: "Study" }));
    const tabs = U.el("div", { class: "row", style: "margin-bottom:14px" }, [
      tabBtn("Flashcards", "cards", tab),
      tabBtn("Leeches", "leeches", tab),
      tabBtn("Reference", "reference", tab)
    ]);
    view.appendChild(tabs);

    if (tab === "ref") reference(view);
    else if (tab === "leeches") leechList(view);
    else cards(view);
  }

  function tabBtn(label, id, active) {
    return U.el("button", {
      class: "chip chip-btn" + (active === id || (id === "reference" && active === "ref") ? " on" : ""),
      text: label,
      on: { click: () => UI.go("/study/" + id) }
    });
  }

  /* ── flashcards ─────────────────────────────────────────── */
  function cards(view) {
    const due = S.dueCards();
    const total = CHEM.Bank.activeCards().length;
    const mastered = Object.values(S.data.srs).filter(c => c.box >= 5).length;

    view.appendChild(U.el("div", { class: "grid g3" }, [
      stat(due.length, "Due now"), stat(mastered, "Mastered"), stat(total, "Total cards")
    ]));

    if (!due.length) {
      view.appendChild(U.el("div", { class: "empty" }, [
        U.el("div", { class: "empty-ico", text: "☕" }),
        U.el("h3", { text: "All caught up" }),
        U.el("p", { text: "No cards are due. Spaced repetition brings them back automatically — come back tomorrow, or drill the full deck anyway." }),
        U.el("button", {
          class: "btn btn-primary", text: "Review the whole deck",
          on: { click: () => session(view, U.shuffle(CHEM.Bank.activeCards()).slice(0, 20), true) }
        })
      ]));
      return;
    }

    view.appendChild(U.el("div", { class: "card", style: "margin-top:14px" }, [
      U.el("h3", { text: `${due.length} card${due.length === 1 ? "" : "s"} ready` }),
      U.el("p", { class: "tiny muted", text:
        "Cards move up a box each time you recall them and reset to box 1 when you miss. " +
        "Box 5 cards return every 16 days." }),
      U.el("button", {
        class: "btn btn-primary btn-block", text: "Start review",
        on: { click: () => session(view, U.shuffle(due).slice(0, 20), false) }
      })
    ]));

    const leeches = S.leeches();
    if (leeches.length) {
      view.appendChild(U.el("div", { class: "card daily", style: "margin-top:12px" }, [
        U.el("div", { class: "daily-ico", text: "🩸" }),
        U.el("div", { class: "daily-body" }, [
          U.el("h3", { text: `${leeches.length} leech${leeches.length === 1 ? "" : "es"}` }),
          U.el("p", { class: "tiny muted", style: "margin:0", text:
            `Cards you have missed ${S.LEECH_LAPSES}+ times. Re-read the answer properly — rote retries aren't working.` })
        ]),
        U.el("button", { class: "btn btn-sm", text: "See them", on: { click: () => UI.go("/study/leeches") } })
      ]));
    }

    /* deck breakdown by module */
    const byMod = {};
    CHEM.Bank.activeCards().forEach(c => {
      const b = (S.data.srs[c.id] || {}).box || 0;
      const m = byMod[c.mod] || (byMod[c.mod] = { total: 0, done: 0 });
      m.total++;
      if (b >= 5) m.done++;
    });

    view.appendChild(U.el("h2", { text: "Deck progress" }));
    const list = U.el("div", { class: "card" });
    Object.entries(byMod).sort().forEach(([mod, m]) => {
      list.appendChild(U.el("div", { class: "mastery-item" }, [
        U.el("div", { class: "mastery-badge", text: mod }),
        U.el("div", { class: "mastery-body" }, [
          U.el("div", { class: "mastery-name", text: CHEM.Bank.moduleName(mod) }),
          U.el("div", { class: "bar" }, [U.el("i", { style: `width:${U.pct(m.done, m.total)}%` })])
        ]),
        U.el("div", { class: "mastery-pct", text: `${m.done}/${m.total}` })
      ]));
    });
    view.appendChild(list);
  }

  /* ── leeches: cards missed four or more times, by name ─────── */
  function leechList(view) {
    const list = S.leeches();
    if (!list.length) {
      view.appendChild(U.el("div", { class: "empty" }, [
        U.el("div", { class: "empty-ico", text: "🌱" }),
        U.el("h3", { text: "No leeches" }),
        U.el("p", { text: `A card becomes a leech after ${S.LEECH_LAPSES} misses. None yet.` })
      ]));
      return;
    }
    view.appendChild(U.el("p", { class: "muted", text:
      "These keep slipping. Read each answer slowly, then drill them as a set." }));
    view.appendChild(U.el("button", { class: "btn btn-primary btn-block", text: "Drill these " + list.length,
      on: { click: () => session(view, list.map(x => x.q), false) } }));
    const wrap = U.el("div", { style: "margin-top:12px" });
    list.forEach(({ q, c }) => wrap.appendChild(U.el("div", { class: "wrongq" }, [
      U.el("div", { class: "row", style: "gap:6px; margin-bottom:6px" }, [
        U.el("span", { class: "chip", text: CHEM.Bank.moduleName(q.mod) }),
        U.el("span", { class: "chip", text: `missed ×${c.lapses}` })
      ]),
      U.el("div", { class: "q", html: U.formula(q.front) }),
      U.el("div", { class: "a", html: U.formula(q.back) })
    ])));
    view.appendChild(wrap);
  }

  function stat(n, l) {
    return U.el("div", { class: "card stat-tile" }, [
      U.el("div", { class: "stat-num", text: String(n) }),
      U.el("div", { class: "stat-lbl", text: l })
    ]);
  }

  function session(view, deck, freeReview) {
    S.markMode("flashcards");
    S.touchStreak();

    let i = 0, got = 0, missed = 0, xp = 0, paid = 0;
    let keyHandler = null;
    const onKey = e => { if (keyHandler && !SQ.UI.modalOpen()) keyHandler(e); };
    document.addEventListener("keydown", onKey);
    UI.onLeave(() => document.removeEventListener("keydown", onKey));
    view.innerHTML = "";

    const shell = UI.gameShell("Flashcards", { backTo: "/study", tools: { calc: true, pad: true, sheet: false } });
    view.appendChild(shell.root);
    const progChip = UI.chip(`1 / ${deck.length}`);
    shell.meta.appendChild(progChip);

    const stage = U.el("div", { class: "grid" });
    shell.body.appendChild(stage);

    function render() {
      const card = deck[i];
      const st = S.cardState(card.id);
      progChip.textContent = `${i + 1} / ${deck.length}`;
      stage.innerHTML = "";

      const inner = U.el("div", { class: "fcard-inner" }, [
        U.el("div", { class: "fface" }, [
          U.el("div", { class: "chip", text: CHEM.Bank.moduleName(card.mod) }),
          U.el("div", { class: "fq", html: U.formula(card.front) }),
          U.el("div", { class: "fhint", text: "Tap to reveal" })
        ]),
        U.el("div", { class: "fface fface-b" }, [
          U.el("div", { class: "fa", html: U.formula(card.back) })
        ])
      ]);
      const flipper = U.el("div", { class: "fcard" }, [inner]);
      stage.appendChild(flipper);

      const boxes = U.el("div", { class: "leitner" },
        [1, 2, 3, 4, 5].map(b => U.el("div", { class: "lbox" + (b === st.box ? " on" : ""), text: String(b) })));
      stage.appendChild(boxes);

      /* Graded review (again / hard / good / easy), as in the rest of StudyQuest.
         Again resets the card to box 1 and counts a lapse; four lapses make a leech. */
      const G = [["again", "😖 Again", "btn"], ["hard", "😬 Hard", "btn"],
                 ["good", "✅ Good", "btn btn-primary"], ["easy", "😎 Easy", "btn"]];
      const rate = U.el("div", { class: "row wrap", style: "justify-content:center; gap:8px; visibility:hidden" },
        G.map(([g, label, cls]) => U.el("button", { class: cls + " js-grade", "data-grade": g, text: label,
          on: { click: () => grade(g) } })));
      stage.appendChild(rate);
      if (S.isLeech(card.id)) stage.appendChild(U.el("p", { class: "tiny", style: "text-align:center; color:var(--warn)",
        text: "🩸 Leech — you've missed this one " + st.lapses + " times. Read the answer slowly." }));

      let revealed = false;
      const shownAt = performance.now();
      CHEM.__current = { mode: "flashcards", kind: "card", id: card.id, text: card.front + " " + card.back, shownAt };
      const flip = () => {
        revealed = !revealed;
        flipper.classList.toggle("flip", revealed);
        CHEM.Sound.flip();
        rate.style.visibility = revealed ? "visible" : "hidden";
      };
      flipper.addEventListener("click", flip);
      keyHandler = e => {
        if (e.target && /^(INPUT|TEXTAREA)$/.test(e.target.tagName)) return;
        if (e.key === " " || e.key === "Enter") { if (!revealed) { e.preventDefault(); flip(); } return; }
        const n = "1234".indexOf(e.key);
        if (revealed && n >= 0) grade(G[n][0]);
      };

      function grade(g) {
        /* Only pay for a card that was genuinely due, hasn't already paid today,
           and was on screen long enough to read front AND back. Self-grading can't
           be verified, so these limits are what stop "Easy" spam. */
        const readLongEnough = performance.now() - shownAt >= UI.readFloor(card.front + " " + card.back);
        const payable = !freeReview && readLongEnough && S.cardXpEligible(card.id);
        if (!freeReview) { S.reviewCard(card.id, g); if (payable) S.markCardXp(card.id); }
        if (g !== "again") {
          got++;
          if (payable) { xp += g === "hard" ? 8 : 12; paid++; }
          CHEM.Sound.correct();
          CHEM.FX.burstAt(flipper, { count: 18, speed: 4, size: 3, shape: "circle" });
        } else {
          // Nothing for a miss — a self-reported failure shouldn't pay out.
          missed++;
          CHEM.Sound.wrong();
        }

        i++;
        if (i >= deck.length) return finish();
        render();
      }
    }

    function finish() {
      const earned = UI.award({
        xp, coins: paid * 2, bonus: S.streakBonus(),
        // Self-reported "Got it" is always 100%, so gate the bonus on cards that
        // actually qualified for payment instead.
        accuracy: deck.length ? paid / deck.length : 0, answered: deck.length
      });
      UI.results({
        title: "Review complete",
        correct: got, total: deck.length, xp: earned.xp, coins: earned.coins,
        extraStats: [["Missed", missed], ["Cards paid", paid]],
        backTo: "/study", onAgain: () => UI.go("/study")
      });
    }

    render();
  }

  /* ── reference sheet ────────────────────────────────────── */
  function reference(view, opts) {
    const D = CHEM.DATA;

    // Also rendered inside the in-game tool tray, where the intro line is just noise.
    if (!(opts && opts.compact)) view.appendChild(U.el("p", { text:
      "The tables you're expected to know or be handed. Skim these before a boss fight." }));

    view.appendChild(section("🔥 Flame test colours", table(
      ["Cation", "Flame colour"],
      D.flameTests.map(f => [U.formula(f.cation), f.colour])
    )));

    view.appendChild(section("🧫 Reaction with NaOH", table(
      ["Cation", "Observation"],
      D.hydroxideTests.map(f => [U.formula(f.cation), f.obs])
    )));

    view.appendChild(section("🌧️ Solubility rules", solubilityTable()));

    view.appendChild(section("🧪 Acid strengths (Ka / pKa)", table(
      ["Acid", "Ka", "pKa", "Note"],
      D.acidStrengths.map(a => [
        a.acid,
        typeof a.ka === "number" ? a.ka.toExponential(1) : a.ka,
        a.pka === null ? "—" : a.pka.toFixed(2),
        a.note
      ])
    )));

    view.appendChild(section("🎨 Indicators", table(
      ["Indicator", "pH range", "Acid", "Base", "Best for"],
      D.indicators.map(i => [i.name, i.range, i.acid, i.base, i.use])
    )));

    view.appendChild(section("🧭 Polyatomic ions", table(
      ["Name", "Formula", "Charge"],
      D.ions.filter(i => i.tier === 1).map(i => [i.name, U.formula(i.formula), i.charge > 0 ? "+" + i.charge : String(i.charge)])
    )));

    view.appendChild(section("📐 Formula sheet", U.el("div", { class: "grid g2" }, [
      refCard("Quantities", ["n = m / M", "n = c × V", "n = V / Vₘ  (Vₘ = 24.79 L mol⁻¹ at 25 °C, 100 kPa)", "N = n × 6.022 × 10²³"]),
      refCard("Solutions", ["c₁V₁ = c₂V₂", "ppm = mg L⁻¹", "% yield = actual / theoretical × 100"]),
      refCard("Acids & bases", ["pH = −log[H₃O⁺]", "pOH = −log[OH⁻]", "Kw = [H₃O⁺][OH⁻] = 1.0 × 10⁻¹⁴", "pH + pOH = 14", "[H₃O⁺] ≈ √(Ka × c)"]),
      refCard("Energy", ["q = mcΔT", "ΔH = −q / n", "ΔG = ΔH − TΔS", "c(water) = 4.18 J g⁻¹ K⁻¹"]),
      refCard("Gases", ["PV = nRT, R = 8.314 J K⁻¹ mol⁻¹", "P₁V₁/T₁ = P₂V₂/T₂", "T(K) = °C + 273.15"]),
      refCard("Equilibrium", ["K = [products]ᶜ / [reactants]ᵃ", "Q < K → shifts right", "Ksp = [Aⁿ⁺]ˣ[Bᵐ⁻]ʸ", "K depends only on temperature"])
    ])));
  }

  function refCard(title, lines) {
    return U.el("div", { class: "card" }, [
      U.el("h3", { text: title }),
      U.el("div", {}, lines.map(l => U.el("div", { class: "mono tiny", style: "padding:4px 0; color:var(--ink-dim)", html: U.formula(l) })))
    ]);
  }

  function section(title, body) {
    const wrap = U.el("div");
    wrap.appendChild(U.el("h2", { text: title }));
    wrap.appendChild(U.el("div", { class: "card", style: "overflow-x:auto" }, [body]));
    return wrap;
  }

  function table(headers, rows) {
    const t = U.el("table", { class: "ptable", style: "min-width:100%" });
    t.appendChild(U.el("tr", {}, headers.map(h => U.el("th", { text: h, style: "text-align:left" }))));
    rows.forEach(r => {
      t.appendChild(U.el("tr", {}, r.map(cell =>
        U.el("td", { style: "padding:7px 6px; border-top:1px solid var(--line); font-size:12.5px", html: String(cell) })
      )));
    });
    return t;
  }

  function solubilityTable() {
    const SOL = CHEM.DATA.solubility;
    const t = U.el("table", { class: "ptable", style: "min-width:100%" });
    t.appendChild(U.el("tr", {}, [U.el("th", { text: "" })].concat(
      SOL.anions.map(a => U.el("th", { html: U.formula(a.sym) }))
    )));
    SOL.cations.forEach(ct => {
      t.appendChild(U.el("tr", {}, [U.el("th", { html: U.formula(ct.sym), style: "text-align:left" })].concat(
        SOL.anions.map(an => {
          const sol = SOL.grid[ct.sym][an.sym];
          return U.el("td", {}, [U.el("div", {
            class: "pcell " + (sol ? "sol" : "ppt"),
            style: "cursor:default",
            text: sol ? "sol" : "ppt"
          })]);
        })
      )));
    });
    return t;
  }

  return { screen, reference };
})();
