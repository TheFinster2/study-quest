/* PHAGOCYTE — drag to engulf (from Biology's Phagocyte).
   Steer a cell around the field: engulf the targets, avoid the others. Three lives.
   New here: targets drift in from every edge and wander instead of falling in
   straight lines, each engulf grows the cell a little (bigger reach, harder to
   dodge with), a streak multiplies, a hit shrinks you and grants a moment of
   invulnerability, and the waves speed up. Drag (touch or mouse) or arrows / WASD.
   The simulation runs on the shell's real-time frame, so it pauses whenever the game
   is not on screen. Scores only. */
window.SQ = window.SQ || {};

(function () {
  const U = SQ.U;
  const W = 360, H = 440, R0 = 22, RMAX = 38, LIVES = 3;

  function start(stage, session) {
    const d = session.data, reduced = session.reduced;
    const canvas = U.el("canvas", { class: "arc-canvas phago-canvas", "aria-label":
      (session.skin.title || "Phagocyte") + ": drag to steer, or use the arrow keys. " + d.blurb });
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = W * dpr; canvas.height = H * dpr;
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    stage.appendChild(U.el("div", { class: "arc-canvas-wrap" }, [canvas]));
    stage.appendChild(U.el("p", { class: "tiny muted", style: "text-align:center;margin:0", text: d.blurb + " Drag anywhere to steer." }));

    const cs = getComputedStyle(document.documentElement);
    const col = n => (n && n.startsWith("--") ? (cs.getPropertyValue(n) || "").trim() : n) || "#888";
    const C = { good: col(d.good.colour), bad: col(d.bad.colour), me: col(d.player.colour), bg: col("--bg-2"), ink: col("--ink"), faint: col("--ink-faint"), line: col("--line") };

    const me = { x: W / 2, y: H - 80, r: R0, tx: W / 2, ty: H - 80 };
    let blobs = [], parts = [], t = 0, score = 0, lives = LIVES, streak = 0, bestStreak = 0, eaten = 0;
    let spawnIn = 0.8, invuln = 0, wave = 1, ended = false, flash = 0;
    const keys = new Set();

    function toLocal(e) {
      const rect = canvas.getBoundingClientRect();
      return { x: (e.clientX - rect.left) / rect.width * W, y: (e.clientY - rect.top) / rect.height * H };
    }
    let dragging = false;
    session.listen(canvas, "pointerdown", e => { e.preventDefault(); dragging = true; const p = toLocal(e); me.tx = p.x; me.ty = p.y; try { canvas.setPointerCapture(e.pointerId); } catch (er) { /* ok */ } });
    session.listen(canvas, "pointermove", e => { if (dragging || e.pointerType === "mouse") { const p = toLocal(e); me.tx = p.x; me.ty = p.y; } });
    session.listen(canvas, "pointerup", () => { dragging = false; });
    session.listen(canvas, "pointercancel", () => { dragging = false; });
    const KEYMAP = { ArrowLeft: "l", ArrowRight: "r", ArrowUp: "u", ArrowDown: "d", a: "l", d: "r", w: "u", s: "d", A: "l", D: "r", W: "u", S: "d" };
    session.listen(document, "keydown", e => { if (KEYMAP[e.key] && !(SQ.UI.modalOpen && SQ.UI.modalOpen())) { e.preventDefault(); keys.add(KEYMAP[e.key]); } });
    session.listen(document, "keyup", e => { if (KEYMAP[e.key]) keys.delete(KEYMAP[e.key]); });

    function spawn() {
      const host = Math.random() < 0.3 + Math.min(0.12, wave * 0.015);
      const speed = (38 + Math.random() * 34) * (1 + (wave - 1) * 0.12);
      const edge = Math.random();
      let x, y, a;
      if (edge < 0.5) { x = 20 + Math.random() * (W - 40); y = -20; a = Math.PI / 2 + (Math.random() - 0.5) * 0.9; }
      else if (edge < 0.75) { x = -20; y = 30 + Math.random() * (H * 0.6); a = (Math.random() - 0.5) * 0.9; }
      else { x = W + 20; y = 30 + Math.random() * (H * 0.6); a = Math.PI + (Math.random() - 0.5) * 0.9; }
      blobs.push({ x, y, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed, r: host ? 14 : 10 + Math.random() * 3,
                   host, wob: Math.random() * 6.28, life: 0 });
    }
    function burst(x, y, colour, n) {
      if (reduced) return;
      for (let i = 0; i < n; i++) { const a = Math.random() * 6.28, s = 30 + Math.random() * 90; parts.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 0.5, colour }); }
    }

    session.loop(dt => {
      if (ended) return;
      t += dt;
      wave = 1 + Math.floor(t / 25);
      if (keys.size) {
        const s = 260 * dt;
        if (keys.has("l")) me.tx = me.x - s * 4; if (keys.has("r")) me.tx = me.x + s * 4;
        if (keys.has("u")) me.ty = me.y - s * 4; if (keys.has("d")) me.ty = me.y + s * 4;
        if (!keys.has("l") && !keys.has("r")) me.tx = me.x;
        if (!keys.has("u") && !keys.has("d")) me.ty = me.y;
      }
      me.tx = U.clamp(me.tx, me.r, W - me.r); me.ty = U.clamp(me.ty, me.r, H - me.r);
      const dx = me.tx - me.x, dy = me.ty - me.y, dist = Math.hypot(dx, dy), maxStep = 420 * dt;
      if (dist > maxStep) { me.x += dx / dist * maxStep; me.y += dy / dist * maxStep; } else { me.x = me.tx; me.y = me.ty; }

      spawnIn -= dt;
      if (spawnIn <= 0) { spawn(); spawnIn = Math.max(0.28, 0.9 - wave * 0.07) * (0.7 + Math.random() * 0.6); }
      if (invuln > 0) invuln -= dt;
      if (flash > 0) flash -= dt;

      blobs.forEach(b => {
        b.life += dt; b.wob += dt * 2;
        b.x += (b.vx + Math.sin(b.wob) * 18) * dt;
        b.y += (b.vy + Math.cos(b.wob * 0.8) * 10) * dt;
      });
      blobs = blobs.filter(b => {
        if (Math.hypot(b.x - me.x, b.y - me.y) < me.r + b.r * 0.8) {
          if (b.host) {
            if (invuln > 0) return true;
            lives--; streak = 0; invuln = 1.2; flash = 0.25;
            me.r = Math.max(R0, me.r - 5);
            session.sound("playerHurt");
            burst(b.x, b.y, C.bad, 14);
            if (lives <= 0) {
              ended = true;
              session.gameOver("Out of lives in wave " + wave + ".", [["Engulfed", eaten], ["Best streak", "×" + bestStreak], ["Wave", wave]]);
            }
            return false;
          }
          eaten++; streak++; bestStreak = Math.max(bestStreak, streak);
          score += 10 * Math.min(1 + Math.floor(streak / 4), 5);
          session.setScore(score);
          me.r = Math.min(RMAX, me.r + 0.6);
          session.sound(streak % 8 === 0 ? "combo" : "pop", streak);
          burst(b.x, b.y, C.good, 8);
          return false;
        }
        return b.x > -40 && b.x < W + 40 && b.y > -40 && b.y < H + 40;
      });
      parts.forEach(p => { p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt; });
      parts = parts.filter(p => p.life > 0);
      draw();
    });

    function glyph(text, x, y, size) {
      if (!text) return;
      ctx.font = Math.round(size) + "px ui-sans-serif, system-ui, 'Segoe UI Emoji', sans-serif";
      ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillStyle = C.ink;
      ctx.fillText(text, x, y + 1);
    }
    function draw() {
      ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);
      if (flash > 0) { ctx.fillStyle = C.bad; ctx.globalAlpha = flash; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
      blobs.forEach(b => {
        ctx.fillStyle = b.host ? C.bad : C.good;
        ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, 6.283); ctx.fill();
        if (!b.host) { ctx.strokeStyle = C.bg; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(b.x, b.y, b.r * 0.45, 0, 6.283); ctx.stroke(); }
        glyph(b.host ? d.bad.glyph : d.good.glyph, b.x, b.y, b.r * 1.2);
      });
      parts.forEach(p => { ctx.globalAlpha = p.life * 2; ctx.fillStyle = p.colour; ctx.fillRect(p.x - 2, p.y - 2, 4, 4); });
      ctx.globalAlpha = invuln > 0 && Math.floor(t * 10) % 2 ? 0.4 : 0.88;
      ctx.fillStyle = C.me;
      ctx.beginPath();
      const wob = reduced ? 0 : 2;
      for (let i = 0; i <= 24; i++) {
        const a = i / 24 * 6.283, rr = me.r + Math.sin(a * 5 + t * 4) * wob;
        const px = me.x + Math.cos(a) * rr, py = me.y + Math.sin(a) * rr;
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.fillStyle = C.bg; ctx.beginPath(); ctx.arc(me.x + 4, me.y - 3, me.r * 0.3, 0, 6.283); ctx.fill();
      ctx.textAlign = "left"; ctx.textBaseline = "top"; ctx.font = "700 14px ui-sans-serif, system-ui, sans-serif";
      ctx.fillStyle = C.bad; ctx.fillText("♥".repeat(Math.max(0, lives)) + "♡".repeat(LIVES - Math.max(0, lives)), 10, 10);
      ctx.fillStyle = C.faint; ctx.textAlign = "right";
      ctx.fillText("Wave " + wave + (streak >= 4 ? "  ×" + Math.min(1 + Math.floor(streak / 4), 5) : ""), W - 10, 10);
      ctx.textAlign = "left";
    }
    draw();

    return {
      destroy() { ended = true; },
      pause() { keys.clear(); dragging = false; },
      state: () => ({ lives, score, eaten, wave, blobs: blobs.length, x: me.x, y: me.y, r: me.r, t })
    };
  }

  SQ.Arcade.register({
    id: "phagocyte", name: "Phagocyte", icon: "🦠", colour: "#ff6b81", level: 7,
    blurb: "Drag to engulf the targets and dodge the rest. Three lives.",
    how: "Drag to steer (or arrows / WASD). Engulf to grow; a wrong one costs a life.",
    start
  });
})();
