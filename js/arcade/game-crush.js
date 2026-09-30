/* CRUSH — the one match-3 engine, skinned for every subject.
   ============================================================================
   Built from the two best source versions:

   · English's Letter Crush supplied the BOARD: every tile is one persistent DOM node
     placed by --r/--c custom properties with a CSS transition, so swaps, falls and
     shuffles animate for free (the older engines rebuilt the board with innerHTML and
     tiles teleported). Tap-tap and swipe both work; a hint appears after five idle
     seconds; a dead board reshuffles; each phase waits LONGER than its animation.
     Its word orders are kept as an optional skin feature (skin.data.words).

   · Chemistry's Ion Crush supplied the POWER TILES and their chaining:
       ⚡ Charged   run of 4        — detonates its whole row AND column
       ☢ Unstable  an L or T join  — detonates the 3×3 around it
       ✳ Catalyst  run of 5+       — dissolves every tile of one kind
     Moving a Charged or Unstable tile sets it off, match or no match; swapping a
     Catalyst cashes it in against the kind it was swapped with. Every power tile
     caught in a blast detonates too, so one good swap can chain across the board.
     Two power tiles swapped together combine (English's combos) for the big scores.

   Scores only. Nothing here pays anything.
   ============================================================================ */
window.SQ = window.SQ || {};

(function () {
  const U = SQ.U;
  const N = 8;

  const POWER = {
    beam: { glyph: "⚡", label: "Charged" },
    bomb: { glyph: "☢", label: "Unstable" },
    cat:  { glyph: "✳", label: "Catalyst" }
  };
  const CALLOUTS = ["", "", "Nice", "Sharp", "Chain!", "Reaction!", "Meltdown!", "Unstoppable"];

  /* Every phase is longer than the CSS animation it waits for (css/arcade.css, "Crush"). */
  const T = { swap: 260, revert: 360, pop: 330, fall: 380, beat: 90, special: 520, cat: 700, shuffle: 480 };

  function start(stage, session) {
    const skin = session.data;
    const TILES = skin.tiles;
    const reduced = session.reduced;
    const wait = k => (reduced ? 20 : T[k]);

    let grid = [];
    let sel = null, busy = false, ended = false, cascade = 0, bestCascade = 0, moves = 0;
    let lastSwap = null, hintCells = null, idleTimer = null, cursor = null;
    let order = null, wordsDone = 0, powersMade = 0, blastsTotal = 0;

    const orderRow = skin.words ? U.el("div", { class: "crush-order", "aria-live": "polite" }) : null;
    const board = U.el("div", { class: "crush-board" + (skin.small ? " crush-small" : ""), role: "grid",
      "aria-label": "Match-three board, 8 by 8. Arrow keys move, Enter selects." });
    const callout = U.el("div", { class: "crush-callout", hidden: true });
    const status = U.el("div", { class: "tiny muted crush-status", "aria-live": "polite",
      text: "Swap two neighbours to make a line of three." });
    board.appendChild(callout);
    if (orderRow) stage.appendChild(orderRow);
    stage.appendChild(board);
    stage.appendChild(status);

    /* ── model ─────────────────────────────────────────────── */
    const rnd = () => Math.floor(Math.random() * TILES.length);
    const key = (r, c) => r + ":" + c;
    const inB = (r, c) => r >= 0 && c >= 0 && r < N && c < N;

    function makeCell(t, kind) {
      const face = U.el("span", { class: "crush-face" });
      const node = U.el("button", { class: "crush-cell", type: "button", tabindex: "-1" }, [face]);
      const cell = { t, kind: kind || null, node, face, r: 0, c: 0 };
      board.appendChild(node);
      paintCell(cell);
      return cell;
    }
    function paintCell(cell) {
      const tile = TILES[cell.t];
      cell.node.style.setProperty("--tc", tile.colour);
      cell.node.className = "crush-cell" + (cell.kind ? " sp sp-" + cell.kind : "") +
        (cursor && cursor[0] === cell.r && cursor[1] === cell.c ? " cursor" : "");
      cell.face.textContent = cell.kind ? POWER[cell.kind].glyph : tile.face;
      cell.node.dataset.face = tile.face;
      cell.node.setAttribute("aria-label", tile.face + (cell.kind ? " " + POWER[cell.kind].label : "") + " tile");
    }
    function place(cell, r, c, instant) {
      if (!cell) return;
      cell.r = r; cell.c = c;
      cell.node.style.setProperty("--r", r);
      cell.node.style.setProperty("--c", c);
      if (instant) {
        cell.node.classList.add("noanim");
        requestAnimationFrame(() => requestAnimationFrame(() => cell.node && cell.node.classList.remove("noanim")));
      }
      cell.node.onclick = () => tap(cell.r, cell.c);
    }
    function repaint(instant) {
      for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) place(grid[r][c], r, c, instant);
    }
    function setBusy(v) {
      busy = v;
      if (v) board.dataset.busy = "1"; else delete board.dataset.busy;
    }

    function fill() {
      board.querySelectorAll(".crush-cell").forEach(n => n.remove());
      grid = [];
      for (let r = 0; r < N; r++) { grid.push([]); for (let c = 0; c < N; c++) grid[r].push(makeCell(rnd())); }
      let guard = 0;
      while ((findRuns().length || !anyMove()) && guard++ < 300) {
        const runs = findRuns();
        const targets = runs.length ? runs.flatMap(x => x.cells) : [[U.randInt(0, 7), U.randInt(0, 7)]];
        targets.forEach(([r, c]) => { grid[r][c].t = rnd(); paintCell(grid[r][c]); });
      }
      repaint(true);
    }

    /** Every maximal run of 3+: { cells:[[r,c]…], axis } */
    function findRuns() {
      const runs = [];
      const scan = (axis) => {
        for (let a = 0; a < N; a++) {
          let run = [];
          for (let b = 0; b <= N; b++) {
            const r = axis === "row" ? a : b, c = axis === "row" ? b : a;
            const cur = b < N ? grid[r][c] : null;
            const prev = run.length ? grid[run[run.length - 1][0]][run[run.length - 1][1]] : null;
            if (cur && prev && cur.t === prev.t) run.push([r, c]);
            else {
              if (run.length >= 3) runs.push({ cells: run.slice(), axis });
              run = cur ? [[r, c]] : [];
            }
          }
        }
      };
      scan("row"); scan("col");
      return runs;
    }

    function anyMove() {
      const trySwap = (r1, c1, r2, c2) => {
        const a = grid[r1][c1], b = grid[r2][c2];
        if (!a || !b) return false;
        grid[r1][c1] = b; grid[r2][c2] = a;
        const ok = findRuns().length > 0;
        grid[r1][c1] = a; grid[r2][c2] = b;
        return ok;
      };
      let special = null;
      for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
        if (c + 1 < N && trySwap(r, c, r, c + 1)) { hintCells = [[r, c], [r, c + 1]]; return true; }
        if (r + 1 < N && trySwap(r, c, r + 1, c)) { hintCells = [[r, c], [r + 1, c]]; return true; }
        if (!special && grid[r][c] && grid[r][c].kind) special = [[r, c], [r, c + 1 < N ? c + 1 : c - 1]];
      }
      /* A power tile can always be set off, so it is always a move. */
      hintCells = special;
      return !!special;
    }

    /* ── input ─────────────────────────────────────────────── */
    function tap(r, c) {
      if (busy || ended || session.isOver()) return;
      clearHint();
      if (!sel) { sel = [r, c]; mark(); session.sound("tap"); return; }
      const [sr, sc] = sel;
      if (sr === r && sc === c) { sel = null; mark(); return; }
      if (Math.abs(sr - r) + Math.abs(sc - c) !== 1) { sel = [r, c]; mark(); session.sound("tap"); return; }
      sel = null; mark();
      attempt(sr, sc, r, c);
    }
    function mark() {
      for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
        const cell = grid[r][c];
        if (!cell) continue;
        cell.node.classList.toggle("sel", !!sel && sel[0] === r && sel[1] === c);
        cell.node.classList.toggle("cursor", !!cursor && cursor[0] === r && cursor[1] === c);
      }
    }

    let down = null;
    session.listen(board, "pointerdown", e => {
      if (busy || ended) return;
      const n = e.target.closest(".crush-cell");
      if (!n) return;
      const cell = byNode(n);
      if (cell) down = { r: cell.r, c: cell.c, x: e.clientX, y: e.clientY };
    });
    session.listen(board, "pointerup", e => {
      if (!down || busy || ended) { down = null; return; }
      const dx = e.clientX - down.x, dy = e.clientY - down.y;
      const step = board.getBoundingClientRect().width / N * 0.35;
      const { r, c } = down;
      down = null;
      if (Math.max(Math.abs(dx), Math.abs(dy)) < step) return;      // a tap; click has it
      const [dr, dc] = Math.abs(dx) > Math.abs(dy) ? [0, dx > 0 ? 1 : -1] : [dy > 0 ? 1 : -1, 0];
      if (!inB(r + dr, c + dc)) return;
      sel = null; mark(); clearHint();
      suppressClick = true;
      setTimeout(() => (suppressClick = false), 0);
      attempt(r, c, r + dr, c + dc);
    });
    session.listen(board, "pointercancel", () => { down = null; });
    let suppressClick = false;
    session.listen(board, "click", e => { if (suppressClick) { e.stopPropagation(); e.preventDefault(); } }, true);

    function byNode(node) {
      for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (grid[r][c] && grid[r][c].node === node) return grid[r][c];
      return null;
    }

    /* Keyboard: arrows move a cursor, Enter/Space selects — the same two-step as a tap. */
    session.listen(document, "keydown", e => {
      if (ended || (SQ.UI.modalOpen && SQ.UI.modalOpen())) return;
      const d = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] }[e.key];
      if (d) {
        e.preventDefault();
        cursor = cursor || [3, 3];
        cursor = [U.clamp(cursor[0] + d[0], 0, N - 1), U.clamp(cursor[1] + d[1], 0, N - 1)];
        board.classList.add("kbd");
        mark();
      } else if ((e.key === "Enter" || e.key === " ") && cursor && document.activeElement && !/INPUT|TEXTAREA|A/.test(document.activeElement.tagName)) {
        e.preventDefault();
        tap(cursor[0], cursor[1]);
      }
    });

    /* ── a move ────────────────────────────────────────────── */
    function swapModel(r1, c1, r2, c2) { const t = grid[r1][c1]; grid[r1][c1] = grid[r2][c2]; grid[r2][c2] = t; }

    function attempt(r1, c1, r2, c2) {
      const a = grid[r1][c1], b = grid[r2][c2];
      if (!a || !b) return;

      /* A Catalyst cashes in against the kind it is swapped with — no run needed. */
      if (a.kind === "cat" || b.kind === "cat") {
        moves++;
        setBusy(true);
        cascade = 0;
        const both = a.kind === "cat" && b.kind === "cat";
        const cat = a.kind === "cat" ? a : b, other = cat === a ? b : a;
        const out = [];
        if (both) { for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) out.push([r, c]); say("Total reaction"); }
        else {
          const want = other.t;
          for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (grid[r][c] && grid[r][c].t === want) out.push([r, c]);
          out.push([cat.r, cat.c]);
          /* A catalyst with another power tile turns every one of that kind into it. */
          if (other.kind) out.forEach(([r, c]) => { const x = grid[r][c]; if (x && x !== cat && !x.kind) { x.kind = other.kind; paintCell(x); } });
        }
        cat.fired = true;
        fx("ripple", cat.r, cat.c);
        session.sound("rareDrop");
        flash(true);
        session.later(() => resolve(out, 1), wait("cat"));
        return;
      }

      swapModel(r1, c1, r2, c2);
      place(a, r2, c2); place(b, r1, c1);
      const runs = findRuns();

      if (!runs.length && !a.kind && !b.kind) {
        setBusy(true);
        session.sound("mismatch");
        a.node.classList.add("nudge"); b.node.classList.add("nudge");
        status.textContent = "That swap doesn't make a match.";
        session.later(() => {
          swapModel(r1, c1, r2, c2);
          place(a, r1, c1); place(b, r2, c2);
          a.node.classList.remove("nudge"); b.node.classList.remove("nudge");
          setBusy(false);
          armHint();
        }, wait("revert"));
        return;
      }

      moves++;
      lastSwap = key(r2, c2);
      setBusy(true);
      cascade = 0;
      session.sound("slide");
      const pre = [];
      /* Moving a charged or unstable tile sets it off, match or no match. */
      if (a.kind && b.kind) pre.push(...combo(a, b, r2, c2));
      else {
        if (a.kind) { a.fired = true; pre.push(...blast(a, r2, c2)); }
        if (b.kind) { b.fired = true; pre.push(...blast(b, r1, c1)); }
      }
      session.later(() => resolve(pre, pre.length ? 1 : 0), wait(pre.length ? "special" : "swap"));
    }

    /** The cells a detonating power tile takes, and its effect. */
    function blast(cell, r, c) {
      const out = [];
      if (cell.kind === "beam") {
        for (let i = 0; i < N; i++) { out.push([r, i]); out.push([i, c]); }
        fx("beam", r, c, "row"); fx("beam", r, c, "col");
      } else if (cell.kind === "bomb") {
        for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) if (inB(r + dr, c + dc)) out.push([r + dr, c + dc]);
        fx("wave", r, c);
      } else if (cell.kind === "cat") {
        for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) if (grid[i][j] && grid[i][j].t === cell.t) out.push([i, j]);
        fx("ripple", r, c);
      }
      session.sound("explode");
      flash();
      return out;
    }

    /** Two power tiles swapped together. */
    function combo(a, b, r, c) {
      a.fired = b.fired = true;
      const kinds = [a.kind, b.kind].sort().join("+");
      const out = [];
      if (kinds === "beam+beam") {
        for (let i = 0; i < N; i++) for (let d = -1; d <= 1; d += 2) {
          out.push([r, i], [i, c]);
          if (inB(r + d, i)) out.push([r + d, i]);
        }
        fx("beam", r, c, "row"); fx("beam", r, c, "col");
      } else if (kinds === "bomb+bomb") {
        for (let dr = -2; dr <= 2; dr++) for (let dc = -2; dc <= 2; dc++) if (inB(r + dr, c + dc)) out.push([r + dr, c + dc]);
        fx("wave", r, c);
      } else {
        for (let i = 0; i < N; i++) for (let d = -1; d <= 1; d++) {
          if (inB(r + d, i)) out.push([r + d, i]);
          if (inB(i, c + d)) out.push([i, c + d]);
        }
        fx("beam", r, c, "row"); fx("beam", r, c, "col"); fx("wave", r, c);
      }
      session.sound("rareDrop");
      flash(true);
      shake(2);
      say("Combination");
      return out;
    }

    /* ── the resolve loop ──────────────────────────────────── */
    function resolve(forced, preBlasts) {
      if (ended) return;
      const runs = findRuns();
      const extra = forced || [];
      if (!runs.length && !extra.length) {
        setBusy(false);
        if (cascade <= 1) { status.textContent = moves ? status.textContent : "Swap two neighbours to make a line of three."; }
        if (!anyMove()) return shuffle();
        armHint();
        return;
      }
      cascade++;
      bestCascade = Math.max(bestCascade, cascade);

      const doomed = new Map();
      const add = (r, c) => { if (inB(r, c) && grid[r][c]) doomed.set(key(r, c), [r, c]); };
      extra.forEach(([r, c]) => add(r, c));

      /* Which power tiles these runs forge, and where. */
      const inRow = new Set(), inCol = new Set();
      runs.forEach(run => run.cells.forEach(([r, c]) => { add(r, c); (run.axis === "row" ? inRow : inCol).add(key(r, c)); }));
      const spawnAt = new Map();
      runs.forEach(run => {
        const ks = run.cells.map(([r, c]) => key(r, c));
        const join = ks.find(k => inRow.has(k) && inCol.has(k));
        const t = grid[run.cells[0][0]][run.cells[0][1]].t;
        let kind = null, at = null;
        if (join) { kind = "bomb"; at = join; }
        else if (run.cells.length >= 5) kind = "cat";
        else if (run.cells.length === 4) kind = "beam";
        if (!kind) return;
        if (!at) at = lastSwap && ks.includes(lastSwap) ? lastSwap : ks[Math.floor(ks.length / 2)];
        if (!spawnAt.has(at)) spawnAt.set(at, { t, kind });
      });
      spawnAt.forEach((s, k) => doomed.delete(k));

      /* Chain: every power tile caught in the clear detonates, and so on. */
      let blasts = preBlasts || 0, guard = 0;
      for (;;) {
        const chain = [];
        doomed.forEach(([r, c], k) => {
          const cell = grid[r][c];
          if (cell && cell.kind && !cell.fired && !spawnAt.has(k)) { cell.fired = true; chain.push(cell); }
        });
        if (!chain.length || guard++ > 20) break;
        chain.forEach(cell => { blasts++; blast(cell, cell.r, cell.c).forEach(([r, c]) => add(r, c)); });
        spawnAt.forEach((s, k) => doomed.delete(k));
      }
      blastsTotal += blasts;

      const listed = Array.from(doomed.values());
      let base = 0;
      listed.forEach(([r, c]) => { base += 10 * (TILES[grid[r][c].t].bonus || 1); });
      const gained = Math.round(base * Math.min(cascade, 8) * (blasts ? 1.5 : 1) * (1 + spawnAt.size * 0.25));
      session.addScore(gained);
      creditOrder(listed);

      if (spawnAt.size) {
        powersMade += spawnAt.size;
        const k = [...spawnAt.values()][0].kind;
        status.textContent = POWER[k].label + " tile forged!  +" + gained;
        session.sound("unlock");
      } else if (blasts) status.textContent = "Chain reaction — " + blasts + " detonation" + (blasts === 1 ? "" : "s") + "!  +" + gained;
      else status.textContent = cascade > 1 ? "Cascade ×" + cascade + "!  +" + gained : "Cleared " + listed.length + "  +" + gained;

      if (cascade >= 2) { session.sound("cascade", cascade); say(CALLOUTS[Math.min(cascade, CALLOUTS.length - 1)]); }
      else session.sound("crush");
      if (cascade >= 3 || blasts >= 2) shake(cascade >= 5 || blasts >= 3 ? 2 : 1);

      if (listed.length) { const m = listed[Math.floor(listed.length / 2)]; floatScore(m[0], m[1], "+" + gained); }

      listed.forEach(([r, c]) => {
        const cell = grid[r][c];
        if (!cell) return;
        cell.node.classList.add("popping");
        const n = cell.node;
        session.later(() => n.remove(), wait("pop"));
        grid[r][c] = null;
      });
      spawnAt.forEach((s, k) => {
        const [r, c] = k.split(":").map(Number);
        if (grid[r][c]) grid[r][c].node.remove();
        grid[r][c] = makeCell(s.t, s.kind);
        place(grid[r][c], r, c, true);
        grid[r][c].node.classList.add("born");
      });
      lastSwap = null;

      session.later(() => {
        if (ended) return;
        gravity();
        session.later(() => resolve(null, 0), wait("fall") + (reduced ? 0 : T.beat));
      }, wait("pop"));
    }

    function gravity() {
      for (let c = 0; c < N; c++) {
        const stack = [];
        for (let r = N - 1; r >= 0; r--) if (grid[r][c]) stack.push(grid[r][c]);
        let above = 0;
        for (let r = N - 1; r >= 0; r--) {
          const i = N - 1 - r;
          if (i < stack.length) grid[r][c] = stack[i];
          else {
            const cell = makeCell(rnd());
            place(cell, -1 - above++, c, true);
            grid[r][c] = cell;
          }
          const landed = grid[r][c];
          if (!reduced && landed) { landed.node.classList.remove("land"); void landed.node.offsetWidth; landed.node.classList.add("land"); }
        }
      }
      /* Two frames so the off-board start position is committed before the fall. */
      requestAnimationFrame(() => requestAnimationFrame(() => { if (!ended) repaint(false); }));
      if (reduced) repaint(false);
    }

    function shuffle() {
      setBusy(true);
      status.textContent = "No moves left — reshuffling.";
      session.sound("nav");
      let guard = 0;
      do {
        const flat = [];
        for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) flat.push(grid[r][c]);
        const s = U.shuffle(flat);
        for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) grid[r][c] = s[r * N + c];
        if (guard > 40) for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) { grid[r][c].t = rnd(); paintCell(grid[r][c]); }
      } while ((findRuns().length || !anyMove()) && guard++ < 80);
      repaint(false);
      session.later(() => { setBusy(false); armHint(); }, wait("shuffle"));
    }

    /* ── word orders (skin feature) ────────────────────────── */
    function newOrder() {
      if (!skin.words) return;
      const w = U.pick(skin.words);
      order = { word: w, need: w.split(""), got: w.split("").map(() => false) };
      drawOrder();
    }
    function drawOrder() {
      if (!orderRow || !order) return;
      orderRow.innerHTML = "";
      orderRow.appendChild(U.el("span", { class: "tiny muted", text: "Spell" }));
      orderRow.appendChild(U.el("div", { class: "crush-word" }, order.need.map((ch, i) => {
        const t = TILES.find(x => x.face === ch);
        return U.el("span", { class: "crush-slot" + (order.got[i] ? " got" : ""),
          style: order.got[i] && t ? "background:" + t.colour : "", text: ch });
      })));
      orderRow.appendChild(U.el("span", { class: "chip", text: "📖 " + wordsDone }));
    }
    function creditOrder(listed) {
      if (!order) return;
      let moved = 0;
      listed.forEach(([r, c]) => {
        const cell = grid[r][c];
        if (!cell) return;
        const ch = TILES[cell.t].face;
        const at = order.need.findIndex((want, i) => want === ch && !order.got[i]);
        if (at >= 0) { order.got[at] = true; moved++; }
      });
      if (!moved) return;
      if (order.got.every(Boolean)) {
        wordsDone++;
        const bonus = 400 + order.word.length * 120;
        session.addScore(bonus);
        session.sound("rankUp");
        say(order.word);
        floatScore(3, 4, "+" + bonus + " " + order.word);
        /* The reward is a free power tile, never anything the rest of the app trades in. */
        const r = U.randInt(0, N - 1), c = U.randInt(0, N - 1);
        session.later(() => {
          if (ended || busy || !grid[r][c] || grid[r][c].kind) return;
          grid[r][c].kind = wordsDone % 3 === 0 ? "cat" : "bomb";
          paintCell(grid[r][c]);
          grid[r][c].node.classList.add("born");
        }, 900);
        newOrder();
      } else drawOrder();
    }

    /* ── juice ─────────────────────────────────────────────── */
    function floatScore(r, c, text) {
      const pop = U.el("div", { class: "crush-pop", text });
      pop.style.left = ((c + 0.5) / N * 100) + "%";
      pop.style.top = ((r + 0.5) / N * 100) + "%";
      board.appendChild(pop);
      session.later(() => pop.remove(), reduced ? 600 : 1100);
    }
    function say(text) {
      if (!text || reduced) return;
      callout.textContent = text;
      callout.hidden = false;
      callout.classList.remove("show");
      void callout.offsetWidth;
      callout.classList.add("show");
    }
    function fx(kind, r, c, axis) {
      if (reduced) return;
      const n = U.el("div", { class: "crush-fx fx-" + kind + (axis ? " fx-" + axis : "") });
      const pc = v => (v / N * 100) + "%";
      if (kind === "beam") {
        if (axis === "row") { n.style.top = pc(r); n.style.left = "0"; } else { n.style.left = pc(c); n.style.top = "0"; }
      } else { n.style.left = pc(c + 0.5); n.style.top = pc(r + 0.5); }
      board.appendChild(n);
      session.later(() => n.remove(), 1000);
    }
    function shake(level) {
      if (reduced) return;
      board.classList.remove("shake", "shake-2");
      void board.offsetWidth;
      board.classList.add(level >= 2 ? "shake-2" : "shake");
    }
    function flash(big) {
      if (reduced) return;
      board.classList.remove("flash", "flash-big");
      void board.offsetWidth;
      board.classList.add(big ? "flash-big" : "flash");
    }
    function armHint() {
      clearHint();
      idleTimer = session.later(() => {
        if (busy || ended || !hintCells) return;
        hintCells.forEach(([r, c]) => grid[r] && grid[r][c] && grid[r][c].node.classList.add("hint"));
      }, 5000);
    }
    function clearHint() {
      if (idleTimer) { clearTimeout(idleTimer); idleTimer = null; }
      board.querySelectorAll(".crush-cell.hint").forEach(n => n.classList.remove("hint"));
    }

    fill();
    newOrder();
    armHint();

    return {
      destroy() { ended = true; clearHint(); },
      pause() {}, resume() {},
      state: () => ({
        busy, moves, bestCascade, powersMade, blasts: blastsTotal, wordsDone,
        word: order ? order.word : null, hint: hintCells,
        faces: grid.map(row => row.map(c => (c ? TILES[c.t].face : null))),
        kinds: grid.map(row => row.map(c => (c ? c.kind : null)))
      })
    };
  }

  SQ.Arcade.register({
    id: "crush", name: "Crush", icon: "💎", colour: "#39d6c8", level: 3,
    blurb: "Match-three with power tiles that chain across the board.",
    how: "Swap two neighbours (tap-tap or swipe; arrows + Enter on a keyboard) to line up three. " +
         "Four forge a ⚡ Charged tile (row + column), an L or T an ☢ Unstable one (3×3), five a ✳ Catalyst (a whole kind).",
    start
  });
})();
