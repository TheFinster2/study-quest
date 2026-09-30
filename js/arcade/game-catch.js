/* CATCH — catch the good, dodge the bad (from Economics' Bargain Hunt).
   The source shared Phagocyte's free-roaming code; here it is a game of its own:
   the basket runs along the bottom, items FALL (and accelerate), catching a good
   one builds a streak, a gold one is worth five, a bad one costs one of three
   lives, and letting a good one hit the floor breaks the streak. Big hold-to-move
   ◀ ▶ pads on a phone, drag anywhere, or ← → / A D on a keyboard. Scores only. */
window.SQ = window.SQ || {};

(function () {
  const U = SQ.U;
  const W = 360, H = 440, FLOOR = H - 34, BW = 64, LIVES = 3;

  function start(stage, session) {
    const d = session.data, reduced = session.reduced;
    const canvas = U.el("canvas", { class: "arc-canvas catch-canvas", "aria-label":
      (session.skin.title || "Catch") + ": move the basket with the arrow keys, the pads or by dragging." });
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = W * dpr; canvas.height = H * dpr;
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    stage.appendChild(U.el("div", { class: "arc-canvas-wrap" }, [canvas]));
    const lb = U.el("button", { class: "btn run-btn", type: "button", "aria-label": "Move left", dataset: { act: "left" } },
      [U.el("span", { class: "run-btn-ico", text: "◀" }), U.el("span", { text: "Left" })]);
    const rb = U.el("button", { class: "btn run-btn", type: "button", "aria-label": "Move right", dataset: { act: "right" } },
      [U.el("span", { class: "run-btn-ico", text: "▶" }), U.el("span", { text: "Right" })]);
    stage.appendChild(U.el("div", { class: "run-pad" }, [lb, rb]));
    stage.appendChild(U.el("p", { class: "tiny muted", style: "text-align:center;margin:0", text:
      "Catch the " + d.labels.good + " (" + d.labels.gold + " are worth five), avoid the " + d.labels.bad + "." }));

    const cs = getComputedStyle(document.documentElement);
    const col = n => (cs.getPropertyValue(n) || "").trim() || "#888";
    const C = { good: col("--good"), bad: col("--bad"), gold: col("--warn"), bg: col("--bg-2"), ink: col("--ink"), faint: col("--ink-faint"), accent: col("--accent"), line: col("--line") };

    let x = W / 2, tx = null, dir = 0, items = [], floats = [], t = 0, score = 0, lives = LIVES;
    let streak = 0, bestStreak = 0, caught = 0, missed = 0, spawnIn = 0.6, ended = false, flash = 0;

    const held = new Map();
    const bind = (node, v) => session.listen(node, "pointerdown", e => { e.preventDefault(); held.set(e.pointerId, v); tx = null; dir = v; });
    bind(lb, -1); bind(rb, 1);
    const up = e => { if (held.has(e.pointerId)) { held.delete(e.pointerId); dir = held.size ? [...held.values()].pop() : 0; } };
    session.listen(document, "pointerup", up);
    session.listen(document, "pointercancel", up);
    const loc = e => { const r = canvas.getBoundingClientRect(); return (e.clientX - r.left) / r.width * W; };
    let drag = false;
    session.listen(canvas, "pointerdown", e => { e.preventDefault(); drag = true; tx = loc(e); });
    session.listen(canvas, "pointermove", e => { if (drag) tx = loc(e); });
    session.listen(canvas, "pointerup", () => { drag = false; });
    const keys = new Set();
    session.listen(document, "keydown", e => {
      if (SQ.UI.modalOpen && SQ.UI.modalOpen()) return;
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") { e.preventDefault(); keys.add(-1); tx = null; }
      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") { e.preventDefault(); keys.add(1); tx = null; }
    });
    session.listen(document, "keyup", e => {
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") keys.delete(-1);
      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") keys.delete(1);
    });

    function spawn() {
      const level = 1 + t / 30;
      const r = Math.random();
      const kind = r < 0.06 ? "gold" : r < 0.33 + Math.min(0.12, t / 600) ? "bad" : "good";
      const pool = kind === "gold" ? [d.gold] : kind === "bad" ? d.bad : d.good;
      items.push({ x: 20 + Math.random() * (W - 40), y: -16, vy: 70 + Math.random() * 40 * level, ay: 60 + 20 * level, kind, glyph: U.pick(pool), rot: 0 });
    }
    function float(px, py, text, colour) { floats.push({ x: px, y: py, text, colour, life: reduced ? 0.5 : 0.9 }); }

    session.loop(dt => {
      if (ended) return;
      t += dt;
      const kdir = keys.has(-1) && !keys.has(1) ? -1 : keys.has(1) && !keys.has(-1) ? 1 : 0;
      const mv = kdir || dir;
      if (mv) x += mv * 340 * dt;
      else if (tx !== null) { const dd = tx - x; x += U.clamp(dd, -420 * dt, 420 * dt); }
      x = U.clamp(x, BW / 2, W - BW / 2);
      if (flash > 0) flash -= dt;

      spawnIn -= dt;
      if (spawnIn <= 0) { spawn(); spawnIn = Math.max(0.32, 0.85 - t / 120) * (0.7 + Math.random() * 0.6); }
      items.forEach(it => { it.vy += it.ay * dt; it.y += it.vy * dt; it.rot += dt * 2; });
      items = items.filter(it => {
        if (it.y > FLOOR - 16 && it.y < FLOOR + 8 && Math.abs(it.x - x) < BW / 2 + 8) {
          if (it.kind === "bad") {
            lives--; streak = 0; flash = 0.25;
            session.sound("playerHurt");
            float(it.x, FLOOR - 30, "−♥", C.bad);
            if (lives <= 0) {
              ended = true;
              session.gameOver("Out of lives after " + Math.round(t) + " s.", [["Caught", caught], ["Best streak", "×" + bestStreak], ["Missed", missed]]);
            }
          } else {
            caught++; streak++; bestStreak = Math.max(bestStreak, streak);
            const mult = Math.min(1 + Math.floor(streak / 5), 5);
            const gained = (it.kind === "gold" ? 50 : 10) * mult;
            score += gained;
            session.setScore(score);
            session.sound(it.kind === "gold" ? "rareDrop" : "coin");
            float(it.x, FLOOR - 30, "+" + gained, it.kind === "gold" ? C.gold : C.good);
          }
          return false;
        }
        if (it.y > H + 10) {
          if (it.kind !== "bad") { missed++; if (streak >= 5) session.sound("comboBreak"); streak = 0; }
          return false;
        }
        return true;
      });
      floats.forEach(f => { f.y -= 40 * dt; f.life -= dt; });
      floats = floats.filter(f => f.life > 0);
      draw();
    });

    function draw() {
      ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);
      if (flash > 0) { ctx.fillStyle = C.bad; ctx.globalAlpha = flash; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
      ctx.fillStyle = C.line; ctx.fillRect(0, FLOOR + 14, W, 2);
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      items.forEach(it => {
        ctx.fillStyle = it.kind === "bad" ? C.bad : it.kind === "gold" ? C.gold : C.good;
        ctx.globalAlpha = 0.3; ctx.beginPath(); ctx.arc(it.x, it.y, 16, 0, 6.283); ctx.fill(); ctx.globalAlpha = 1;
        ctx.save(); ctx.translate(it.x, it.y); if (!reduced) ctx.rotate(Math.sin(it.rot) * 0.3);
        ctx.font = "22px ui-sans-serif, system-ui, 'Segoe UI Emoji', sans-serif"; ctx.fillStyle = C.ink; ctx.fillText(it.glyph, 0, 1);
        ctx.restore();
      });
      ctx.fillStyle = C.accent;
      ctx.beginPath();
      ctx.moveTo(x - BW / 2, FLOOR - 10); ctx.lineTo(x + BW / 2, FLOOR - 10); ctx.lineTo(x + BW / 2 - 8, FLOOR + 12); ctx.lineTo(x - BW / 2 + 8, FLOOR + 12);
      ctx.closePath(); ctx.fill();
      ctx.font = "20px ui-sans-serif, system-ui, 'Segoe UI Emoji', sans-serif"; ctx.fillText(d.basket, x, FLOOR + 1);
      floats.forEach(f => { ctx.globalAlpha = Math.min(1, f.life * 2); ctx.fillStyle = f.colour; ctx.font = "800 15px ui-sans-serif, system-ui, sans-serif"; ctx.fillText(f.text, f.x, f.y); });
      ctx.globalAlpha = 1;
      ctx.textAlign = "left"; ctx.textBaseline = "top"; ctx.font = "700 14px ui-sans-serif, system-ui, sans-serif";
      ctx.fillStyle = C.bad; ctx.fillText("♥".repeat(Math.max(0, lives)) + "♡".repeat(LIVES - Math.max(0, lives)), 10, 10);
      if (streak >= 5) { ctx.textAlign = "right"; ctx.fillStyle = C.gold; ctx.fillText("×" + Math.min(1 + Math.floor(streak / 5), 5) + " streak", W - 10, 10); ctx.textAlign = "left"; }
    }
    draw();

    return {
      destroy() { ended = true; },
      pause() { keys.clear(); held.clear(); dir = 0; drag = false; },
      state: () => ({ lives, score, caught, missed, x, items: items.length, t })
    };
  }

  SQ.Arcade.register({
    id: "catch", name: "Catch", icon: "🧺", colour: "#ff9a6b", level: 5,
    blurb: "Catch what falls — the good ones. Three lives.",
    how: "Hold ◀ ▶ (or ← → / A D, or drag) to move the basket.",
    start
  });
})();
