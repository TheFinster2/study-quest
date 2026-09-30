/* PAIRS — the memory engine (Biology's Chromosome Match, Economics' Ticker Match).
   Levels of 5→8 pairs against a per-level clock (22 s + 4 s a pair). Clearing a
   board adds a level and a bonus; the clock running out ends the run. New here: a
   streak multiplier for consecutive matches, a peek at the start of each board,
   and the level clock driven by the play shell's frame — so, like the ticket
   meter, it stops whenever the game is not on screen. Scores only. */
window.SQ = window.SQ || {};

(function () {
  const U = SQ.U;

  function start(stage, session) {
    const SYM = session.data.symbols;
    const reduced = session.reduced;
    let level = 1, score = 0, first = null, lock = false, matched = 0, cards = [];
    let timeLeft = 0, streak = 0, bestStreak = 0, flips = 0, ended = false, cursor = -1, peeking = false;

    const bar = U.el("div", { class: "pairs-bar" }, [U.el("i")]);
    const info = U.el("div", { class: "row pairs-info" }, [
      U.el("span", { class: "chip js-level", text: "Level 1" }),
      U.el("span", { class: "chip js-streak", text: "Streak ×1" }),
      U.el("div", { class: "spacer" }),
      U.el("b", { class: "js-clock pairs-clock", text: "0s" })
    ]);
    const board = U.el("div", { class: "pairs-board" + (session.data.text ? " pairs-text" : ""), role: "grid", "aria-label": "Memory cards" });
    stage.appendChild(info);
    stage.appendChild(bar);
    stage.appendChild(board);

    function deal() {
      board.innerHTML = "";
      const pairs = Math.min(8, 4 + level);
      const syms = U.sample(SYM, pairs);
      const deck = U.shuffle(syms.concat(syms));
      matched = 0; first = null; lock = false; cards = []; cursor = -1;
      board.style.setProperty("--cols", 4);
      deck.forEach((sym, i) => {
        const face = U.el("span", { class: "pairs-face", text: sym });
        const b = U.el("button", { class: "pairs-card", type: "button", "aria-label": "Card " + (i + 1) }, [
          U.el("span", { class: "pairs-back", text: "?" }), face]);
        const card = { sym, el: b, open: false, done: false, i };
        b.addEventListener("click", () => flip(card));
        cards.push(card);
        board.appendChild(b);
      });
      timeLeft = 22 + pairs * 4;
      U.$(".js-level", info).textContent = "Level " + level;
      /* A short peek at a fresh board: a memory game you cannot see is a guessing game. */
      peeking = true;
      cards.forEach(c => c.el.classList.add("open"));
      session.later(() => { peeking = false; cards.forEach(c => { if (!c.done && !c.open) c.el.classList.remove("open"); }); }, level === 1 ? 1400 : 900);
      sync();
    }

    function flip(card) {
      if (ended || lock || peeking || card.open || card.done || session.isOver()) return;
      card.open = true; flips++;
      card.el.classList.add("open");
      session.sound("flip");
      if (!first) { first = card; return; }
      const a = first, b = card;
      first = null;
      if (a.sym === b.sym) {
        a.done = b.done = true;
        a.el.classList.add("done"); b.el.classList.add("done");
        matched++; streak++; bestStreak = Math.max(bestStreak, streak);
        const gained = (10 + level * 2) * Math.min(streak, 5);
        score += gained;
        session.setScore(score);
        session.sound(streak >= 2 ? "combo" : "match", streak);
        pop(b.el, "+" + gained);
        if (matched === cards.length / 2) {
          const bonus = 25 * level + Math.round(timeLeft) * 2;
          score += bonus;
          session.setScore(score);
          session.sound("rankUp");
          level++;
          lock = true;
          session.later(deal, reduced ? 200 : 600);
        }
      } else {
        lock = true; streak = 0;
        session.sound("mismatch");
        session.later(() => {
          [a, b].forEach(c => { c.open = false; c.el.classList.remove("open"); });
          lock = false;
        }, reduced ? 380 : 650);
      }
      sync();
    }
    function pop(el, text) {
      if (reduced) return;
      const n = U.el("span", { class: "pairs-pop", text });
      el.appendChild(n);
      session.later(() => n.remove(), 900);
    }
    function sync() {
      U.$(".js-streak", info).textContent = "Streak ×" + Math.max(1, Math.min(streak, 5));
      const total = 22 + Math.min(8, 4 + level) * 4;
      U.$(".js-clock", info).textContent = Math.ceil(timeLeft) + "s";
      bar.firstChild.style.width = U.clamp(timeLeft / total * 100, 0, 100) + "%";
      bar.classList.toggle("low", timeLeft <= 8);
    }

    let tick = 0;
    session.loop(dt => {
      if (ended || peeking || lock && matched === cards.length / 2) return;
      timeLeft -= dt;
      tick += dt;
      if (tick > 0.2) { tick = 0; sync(); }
      if (timeLeft <= 0) {
        ended = true;
        timeLeft = 0; sync();
        session.gameOver("The clock ran out on level " + level + ".", [["Level", level], ["Best streak", "×" + bestStreak], ["Flips", flips]]);
      }
    });

    session.listen(document, "keydown", e => {
      if (SQ.UI.modalOpen && SQ.UI.modalOpen()) return;
      const d = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -4, ArrowDown: 4 }[e.key];
      if (d) {
        e.preventDefault();
        cursor = cursor < 0 ? 0 : U.clamp(cursor + d, 0, cards.length - 1);
        cards[cursor].el.focus();
      } else if (/^[1-9]$/.test(e.key) && cards[+e.key - 1]) { flip(cards[+e.key - 1]); }
    });

    deal();
    return {
      destroy() { ended = true; },
      state: () => ({ level, timeLeft, matched, pairs: cards.length / 2, streak, symbols: cards.map(c => c.sym),
                      open: cards.map(c => c.open), done: cards.map(c => c.done), peeking, lock })
    };
  }

  SQ.Arcade.register({
    id: "pairs", name: "Pairs", icon: "🧩", colour: "#3fe08a", level: 3,
    blurb: "Memory pairs against the clock. Streaks multiply.",
    how: "Flip two cards; a pair stays. Clear the board before the level clock runs out. Keys 1–9 or arrows + Enter.",
    start
  });
})();
