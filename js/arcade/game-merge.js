/* MERGE — the one 2048 engine, skinned for every subject.
   Slide the 4×4 board; two identical tiles merge into the next rung of the skin's
   ladder (H→Ar, ¹H→²⁰⁸Pb, 2¹→2¹⁶, LETTER→CANON…). The top rung does not merge.
   From Chemistry's Isotope 2048: THREE undos per run, because a 2048 board is
   usually lost to one mis-swipe rather than to bad play. Arrows / WASD / swipe /
   the on-screen pad; Z or Backspace undoes. Scores only; it pays nothing. */
window.SQ = window.SQ || {};

(function () {
  const U = SQ.U;
  const N = 4, UNDOS = 3;

  function start(stage, session) {
    const LADDER = session.data.ladder;
    const small = !!session.data.small;
    let cells = [], score = 0, top = 0, undosLeft = UNDOS, history = null, ended = false, moves = 0;

    const note = U.el("div", { class: "tiny muted merge-note", "aria-live": "polite",
      text: "Slide to merge two of the same. Reach " + session.data.goal + "." });
    const board = U.el("div", { class: "merge-board" + (small ? " merge-small" : ""), role: "grid", "aria-label": "Merge board, 4 by 4" });
    const undoBtn = U.el("button", { class: "btn btn-sm merge-undo", type: "button", on: { click: () => undo() } });
    const pb = (t, dir, lbl) => U.el("button", { class: "btn merge-key", type: "button", "aria-label": lbl, text: t,
      dataset: { dir }, on: { click: () => move(dir) } });
    const pad = U.el("div", { class: "merge-pad" }, [
      U.el("span"), pb("↑", "up", "Slide up"), U.el("span"),
      pb("←", "left", "Slide left"), pb("↓", "down", "Slide down"), pb("→", "right", "Slide right")
    ]);
    stage.appendChild(note);
    stage.appendChild(board);
    stage.appendChild(U.el("div", { class: "row merge-controls" }, [undoBtn]));
    stage.appendChild(pad);

    const idx = (r, c) => r * N + c;
    const empty = () => cells.map((v, i) => (v < 0 ? i : -1)).filter(i => i >= 0);
    function spawn() {
      const free = empty();
      if (!free.length) return -1;
      const at = U.pick(free);
      cells[at] = Math.random() < 0.9 ? 0 : 1;
      return at;
    }
    function reset() {
      cells = new Array(N * N).fill(-1);
      spawn(); spawn();
      paint(null, -1);
      syncUndo();
    }

    function slideLine(line) {
      const kept = line.filter(v => v >= 0), out = [], merges = [];
      let gained = 0;
      for (let i = 0; i < kept.length; i++) {
        if (i + 1 < kept.length && kept[i] === kept[i + 1] && kept[i] < LADDER.length - 1) {
          const m = kept[i] + 1;
          merges.push(out.length);
          out.push(m);
          gained += Math.pow(2, m + 1);
          i++;
        } else out.push(kept[i]);
      }
      while (out.length < N) out.push(-1);
      return { line: out, gained, moved: out.some((v, i) => v !== line[i]), merges };
    }
    const at = (dir, i, j) => dir === "left" ? idx(i, j) : dir === "right" ? idx(i, N - 1 - j) : dir === "up" ? idx(j, i) : idx(N - 1 - j, i);

    function move(dir) {
      if (ended || session.isOver() || (SQ.UI.modalOpen && SQ.UI.modalOpen())) return;
      const before = { cells: cells.slice(), score, top };
      let moved = false, gained = 0;
      const mergedAt = new Set();
      for (let i = 0; i < N; i++) {
        const line = [];
        for (let j = 0; j < N; j++) line.push(cells[at(dir, i, j)]);
        const res = slideLine(line);
        gained += res.gained;
        if (res.moved) moved = true;
        res.merges.forEach(j => mergedAt.add(at(dir, i, j)));
        for (let j = 0; j < N; j++) cells[at(dir, i, j)] = res.line[j];
      }
      if (!moved) { session.sound("mismatch"); return; }
      history = before;
      moves++;
      score += gained;
      session.setScore(score);
      if (gained) {
        const hi = Math.max(...cells);
        session.sound("merge", Math.pow(2, hi + 1));
        if (hi > top) {
          top = hi;
          const t = LADDER[hi];
          note.textContent = "New tile: " + (t.name ? t.name + " (" + t.sym + ")" : t.sym) + (hi === LADDER.length - 1 ? " — the top of the ladder!" : "");
          if (hi >= 4) session.sound("unlock");
          if (!session.reduced && hi >= 6 && SQ.FX) SQ.FX.confetti(Math.min(20 + hi * 5, 90));
        }
      } else session.sound("slide");
      const s = spawn();
      paint(mergedAt, s);
      syncUndo();
      if (!canMove()) {
        note.textContent = "No moves left" + (undosLeft && history ? " — undo, or it's over." : ".");
        if (!(undosLeft && history)) session.later(() => over(), 450);
        else armDeadline();
      }
    }
    /* With an undo in hand a full board is not yet over: give the player a moment. */
    let deadline = null;
    function armDeadline() {
      if (deadline) clearTimeout(deadline);
      deadline = session.later(() => { if (!canMove()) over(); }, 6000);
    }
    function over() {
      if (ended || canMove()) return;
      ended = true;
      const t = LADDER[Math.max(...cells)];
      session.gameOver("Board full. Highest tile: " + (t.name || t.sym) + ".", [["Moves", moves], ["Undos left", undosLeft]]);
    }
    function undo() {
      if (!history || undosLeft <= 0 || ended || session.isOver()) { session.sound("denied"); return; }
      cells = history.cells.slice(); score = history.score; top = history.top;
      history = null; undosLeft--;
      if (deadline) { clearTimeout(deadline); deadline = null; }
      session.setScore(score);
      paint(null, -1);
      syncUndo();
      session.sound("nav");
      note.textContent = "Rewound. " + undosLeft + " undo" + (undosLeft === 1 ? "" : "s") + " left.";
    }
    function canMove() {
      if (empty().length) return true;
      for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
        const v = cells[idx(r, c)];
        if (v >= LADDER.length - 1) continue;
        if (c + 1 < N && cells[idx(r, c + 1)] === v) return true;
        if (r + 1 < N && cells[idx(r + 1, c)] === v) return true;
      }
      return false;
    }
    function syncUndo() {
      undoBtn.textContent = "↶ Undo (" + undosLeft + ")";
      undoBtn.disabled = !history || undosLeft <= 0;
    }
    function paint(mergedAt, spawnedAt) {
      board.innerHTML = "";
      cells.forEach((v, i) => {
        const t = LADDER[v];
        let cls = "merge-tile" + (v < 0 ? " empty" : "");
        if (mergedAt && mergedAt.has(i)) cls += " merged";
        else if (spawnedAt === i) cls += " fresh";
        const tile = U.el("div", { class: cls, role: "gridcell", "aria-label": t ? t.sym : "empty" });
        if (t) {
          tile.style.background = t.colour;
          tile.appendChild(U.el("div", { class: "merge-sym" + (t.sym.length > 5 ? " long" : ""), text: t.sym }));
          tile.appendChild(U.el("div", { class: "merge-num", text: String(Math.pow(2, v + 1)) }));
        }
        board.appendChild(tile);
      });
    }

    const KEYS = { ArrowLeft: "left", ArrowRight: "right", ArrowUp: "up", ArrowDown: "down", KeyA: "left", KeyD: "right", KeyW: "up", KeyS: "down" };
    session.listen(document, "keydown", e => {
      if (SQ.UI.modalOpen && SQ.UI.modalOpen()) return;
      if (e.code === "KeyZ" || e.code === "Backspace") { e.preventDefault(); undo(); return; }
      const dir = KEYS[e.code];
      if (dir) { e.preventDefault(); move(dir); }
    });
    let sx = 0, sy = 0, tracking = false;
    session.listen(board, "pointerdown", e => { tracking = true; sx = e.clientX; sy = e.clientY; });
    session.listen(board, "pointerup", e => {
      if (!tracking) return;
      tracking = false;
      const dx = e.clientX - sx, dy = e.clientY - sy;
      if (Math.abs(dx) < 24 && Math.abs(dy) < 24) return;
      move(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : (dy > 0 ? "down" : "up"));
    });
    session.listen(board, "pointercancel", () => { tracking = false; });

    reset();
    return {
      destroy() { ended = true; },
      state: () => ({ cells: cells.slice(), syms: cells.map(v => (v >= 0 ? LADDER[v].sym : null)), score, undosLeft, moves, canMove: canMove() })
    };
  }

  SQ.Arcade.register({
    id: "merge", name: "Merge", icon: "🔢", colour: "#7c5cff", level: 3,
    blurb: "2048 up a subject ladder, with three undos per run.",
    how: "Arrows / WASD / swipe to slide. Two of the same merge. Z undoes (three per run).",
    start
  });
})();
