/* RUNNER — the one endless-runner engine, skinned for every subject.
   ============================================================================
   English's Margin Runner is the engine, because it had the best physics and the
   only fairness guarantees of the seven runners: variable jump height (hold for
   higher), coyote time, a jump buffer, a dive (duck in the air), squash and stretch,
   near-miss and chain bonuses, a shield pickup, and obstacle PATTERNS whose spacing
   is specified in frames of travel so that every one is solvable at both ends of
   the speed range. tests/arcade/arcade.js re-derives that solvability from the
   exposed geometry, exactly as English's suite did.

   New here: a fixed 60 Hz timestep. The source stepped once per animation frame,
   so on a 120 Hz screen the whole game ran at double speed and every frame-counted
   guarantee (coyote, buffer, the patterns) quietly halved. The shell hands us real
   elapsed time; we step the simulation in 1/60 s slices.

   Skins change the drawing and the names only (runner shape, obstacle glyphs,
   pickups, chapter names) — never a number below. Scores only; it pays nothing.
   ============================================================================ */
window.SQ = window.SQ || {};

(function () {
  const U = SQ.U;
  let live = null;

  const W = 560, H = 360, GROUND = 300;
  const GRAV = 0.72, JUMP_V = -9.6, HOLD_G = 0.30, HOLD_MAX = 11,
        COYOTE = 6, BUFFER = 8, DIVE_G = 1.7, MAX_FALL = 17;
  const RUN_X = 86, RUN_W = 32, RUN_H = 48, DUCK_H = 24;
  const DUCK_BAR_BOTTOM = GROUND - 44;
  const NEAR_PX = 14, NEAR_POINTS = 25;
  const DROP_BASE = 10, COMBO_WINDOW = 100, COMBO_CAP = 10;
  const CHAPTER_EVERY = 1150, CHAPTERS = 6;
  const SHIELD_INVULN = 70;
  const SPEED_MIN = 5.0, SPEED_MAX = 8.4;
  const AIR_TAP = 27, AIR_HOLD = 40;
  const STEP = 1 / 60;

  /* Patterns: offsets in FRAMES of travel (× speed at build time), never fixed pixels.
     `recover` = frames the player is committed after answering it. */
  const PATTERNS = [
    { id: "footnote", from: 1, recover: AIR_TAP, solve: "tap", build: () => {
        const w = 22 + Math.random() * 10, h = 26 + Math.random() * 6;
        return { obs: [{ kind: "ground", x: 0, y: GROUND - h, w, h }], width: w };
      } },
    { id: "hang", from: 1, recover: 14, solve: "duck", build: () => {
        const w = 56 + Math.random() * 30, h = 28;
        return { obs: [{ kind: "hang", x: 0, y: DUCK_BAR_BOTTOM - h, w, h }], width: w };
      } },
    /* 78 tall: above the ~59 px tap apex, under the ~110 px held apex. */
    { id: "stack", from: 2, recover: AIR_HOLD, solve: "hold", build: () => ({
        obs: [{ kind: "ground", x: 0, y: GROUND - 78, w: 28, h: 78 }], width: 28 }) },
    { id: "staples", from: 2, recover: AIR_HOLD, solve: "hold", build: sp => {
        const d = sp * 8;
        return { obs: [{ kind: "ground", x: 0, y: GROUND - 34, w: 20, h: 34 },
                       { kind: "ground", x: d + 20, y: GROUND - 34, w: 20, h: 34 }], width: d + 40 };
      } },
    { id: "jumpduck", from: 3, recover: AIR_TAP + 6, solve: "tap", build: sp => {
        const d = sp * 16;
        return { obs: [{ kind: "ground", x: 0, y: GROUND - 36, w: 24, h: 36 },
                       { kind: "hang", x: d + 24, y: DUCK_BAR_BOTTOM - 28, w: 62, h: 28 }], width: d + 86 };
      } },
    /* Bob confined to a low band, so a tap is right at every phase. */
    { id: "strike", from: 3, recover: AIR_TAP, solve: "time", build: () => ({
        obs: [{ kind: "strike", x: 0, y: GROUND - 30, w: 30, h: 14,
                bobFrom: GROUND - 38, bobTo: GROUND - 22, phase: Math.random() * 6.28, bobSpeed: 0.035 }], width: 30 }) },
    { id: "gauntlet", from: 4, recover: AIR_TAP, solve: "tap", build: sp => {
        const a = sp * 13, b = sp * 46;
        return { obs: [{ kind: "ground", x: 0, y: GROUND - 32, w: 20, h: 32 },
                       { kind: "hang", x: a + 20, y: DUCK_BAR_BOTTOM - 26, w: 54, h: 26 },
                       { kind: "ground", x: b + 20, y: GROUND - 34, w: 22, h: 34 }], width: b + 42 };
      } }
  ];

  function start(stage, session) {
    const skin = session.data;
    const G = skin.glyphs, L = skin.labels;
    const reduced = session.reduced;

    const canvas = U.el("canvas", { class: "runner-canvas", "aria-label":
      (session.skin.title || "Runner") + " — a canvas game played with the Jump and Duck buttons, or Space / ↑ and ↓." });
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = W * dpr; canvas.height = H * dpr;
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    stage.appendChild(U.el("div", { class: "runner-wrap" }, [canvas]));

    const duckBtn = U.el("button", { class: "btn run-btn", type: "button", "aria-label": "Duck", dataset: { act: "duck" } },
      [U.el("span", { class: "run-btn-ico", text: "⬇" }), U.el("span", { text: "Duck" })]);
    const jumpBtn = U.el("button", { class: "btn btn-primary run-btn", type: "button", "aria-label": "Jump", dataset: { act: "jump" } },
      [U.el("span", { class: "run-btn-ico", text: "⬆" }), U.el("span", { text: "Jump · hold" })]);
    stage.appendChild(U.el("div", { class: "run-pad" }, [duckBtn, jumpBtn]));
    stage.appendChild(U.el("p", { class: "tiny muted", style: "text-align:center;margin:0", text:
      "Jump the " + L.ground + ", duck the " + L.hang + ", collect " + L.pickup + ". Hold Jump to go higher; Duck in the air dives. " +
      "Grab " + L.shield + " to survive one hit." }));

    const cs = getComputedStyle(document.documentElement);
    const col = (n, f) => ((cs.getPropertyValue(n) || "").trim() || f);
    const C = { line: col("--line", "#333"), ink: col("--ink", "#eee"), faint: col("--ink-faint", "#777"),
      accent: col("--accent", "#39d6c8"), good: col("--good", "#3fe08a"), warn: col("--warn", "#ffcc55"),
      bad: col("--bad", "#ff6b81"), info: col("--info", "#6fa8ff"), bg: col("--bg-1", "#111a30"), glow: col("--glow-b", "#7c5cff") };

    let y = GROUND, vy = 0, grounded = true, ducking = false, diving = false;
    let holding = false, holdFrames = 0, coyote = 0, buffered = 0;
    let sx = 1, sy = 1;
    let obstacles = [], drops = [], parts = [], floats = [], trail = [];
    let dist = 0, score = 0, chapter = 1, speed = SPEED_MIN;
    let combo = 0, comboTimer = 0, bestCombo = 0, collected = 0, nearMisses = 0;
    let shield = false, invuln = 0, shake = 0, banner = 0, bannerText = "";
    let gapLeft = 300, dropCooldown = 90, lastHit = null;
    let ended = false, dying = 0, frame = 0, acc = 0;
    const bgMarks = [];
    for (let i = 0; i < 22; i++) bgMarks.push({ x: Math.random() * W, y: 44 + Math.random() * (GROUND - 80), w: 18 + Math.random() * 54, d: 0.28 + Math.random() * 0.22 });

    /* ── input ── */
    function pressJump() {
      if (ended || dying || session.isOver()) return;
      holding = true; buffered = BUFFER; tryJump();
    }
    function tryJump() {
      if (buffered <= 0) return;
      if (grounded || coyote > 0) {
        vy = JUMP_V; grounded = false; coyote = 0; buffered = 0; holdFrames = HOLD_MAX;
        sy = 1.32; sx = 0.78;
        session.sound("jump");
        puff(RUN_X + RUN_W / 2, GROUND, 6);
      }
    }
    function releaseJump() { holding = false; holdFrames = 0; }
    function setDuck(on) {
      if (ended || dying) return;
      if (on && !ducking) session.sound("duck");
      ducking = !!on;
      if (on && !grounded) { diving = true; releaseJump(); }
      if (!on) diving = false;
    }
    /* Each pointer releases only the control it pressed (two-thumb play). */
    const held = new Map();
    function bindPress(node, which) {
      session.listen(node, "pointerdown", e => {
        e.preventDefault();
        held.set(e.pointerId, which);
        if (which === "jump") pressJump(); else setDuck(true);
      });
      session.listen(node, "contextmenu", e => e.preventDefault());
    }
    bindPress(jumpBtn, "jump"); bindPress(duckBtn, "duck"); bindPress(canvas, "jump");
    function onUp(e) {
      const which = held.get(e.pointerId);
      held.delete(e.pointerId);
      if (which === "jump") releaseJump();
      else if (which === "duck") setDuck(false);
      else { releaseJump(); setDuck(false); }
    }
    session.listen(document, "pointerup", onUp);
    session.listen(document, "pointercancel", onUp);
    const isJump = e => e.code === "Space" || e.key === "ArrowUp" || e.key === "w" || e.key === "W";
    const isDuck = e => e.key === "ArrowDown" || e.key === "s" || e.key === "S";
    session.listen(document, "keydown", e => {
      if (SQ.UI.modalOpen && SQ.UI.modalOpen()) return;
      if (isJump(e)) { e.preventDefault(); if (!e.repeat) pressJump(); }
      if (isDuck(e)) { e.preventDefault(); setDuck(true); }
    });
    session.listen(document, "keyup", e => {
      if (isJump(e)) releaseJump();
      if (isDuck(e)) setDuck(false);
    });

    /* ── decoration (all off with reduced motion) ── */
    function part(x, y2, o) {
      if (reduced) return;
      parts.push({ x, y: y2, vx: o.vx, vy: o.vy, life: o.life, max: o.life, size: o.size, colour: o.colour, g: o.g === undefined ? 0.22 : o.g });
    }
    function puff(x, y2, n) {
      for (let i = 0; i < n; i++) part(x + (Math.random() - 0.5) * 14, y2, { vx: -speed * 0.35 - Math.random() * 1.4,
        vy: -Math.random() * 1.9, life: 22 + Math.random() * 12, size: 1.6 + Math.random() * 2.1, colour: C.faint, g: 0.06 });
    }
    function burst(x, y2, n, colour, spread) {
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2, s = 1 + Math.random() * (spread || 3.4);
        part(x, y2, { vx: Math.cos(a) * s, vy: Math.sin(a) * s - 1, life: 26 + Math.random() * 18, size: 1.6 + Math.random() * 2.6, colour });
      }
    }
    function float(x, y2, text, colour) { if (!reduced) floats.push({ x, y: y2, text, colour, life: 46 }); }

    /* ── spawning ── */
    const REACT_MIN = 42, REACT_VAR = 38;
    function spawnPattern() {
      const usable = PATTERNS.filter(p => p.from <= chapter);
      const p = usable[Math.floor(Math.random() * usable.length)];
      const built = p.build(speed);
      built.obs.forEach(o => obstacles.push(Object.assign({ minGap: Infinity, done: false, born: frame, pattern: p.id }, o, { x: W + 30 + o.x })));
      if (Math.random() < 0.78) inkFor(p, built, W + 30);
      gapLeft = built.width + speed * (p.recover + REACT_MIN + Math.random() * REACT_VAR);
    }
    function centreAt(t, hold) {
      let v = JUMP_V, py = GROUND, left = hold ? HOLD_MAX : 0;
      for (let i = 0; i < t; i++) {
        let g = GRAV;
        if (left > 0 && v < 0) { g = HOLD_G; left--; }
        v = Math.min(MAX_FALL, v + g);
        py = Math.min(GROUND, py + v);
      }
      return py - RUN_H / 2;
    }
    /* Pickups are laid ON the trajectory that solves the pattern. */
    function inkFor(p, built, x0) {
      if (p.solve === "duck") {
        for (let i = 0; i < 3; i++) drops.push({ x: x0 + (built.width / 2) * i, y: GROUND - DUCK_H / 2, r: 8, taken: false });
        return;
      }
      if (p.solve === "time") return;
      const hold = p.solve === "hold", air = hold ? AIR_HOLD : AIR_TAP;
      for (let i = 0; i < 4; i++) {
        const t = ((i + 0.5) / 4) * air;
        drops.push({ x: x0 + built.width / 2 + (t - air / 2) * speed, y: centreAt(t, hold), r: 8, taken: false });
      }
    }
    function spawnLine() {
      const n = 3 + Math.floor(Math.random() * 4);
      const span = (n - 1) * speed * 8;
      if (gapLeft < span + speed * 24) { dropCooldown = 30; return; }
      const y2 = GROUND - 46 - Math.random() * 60;
      for (let i = 0; i < n; i++) drops.push({ x: W + 40 + i * speed * 8, y: y2, r: 8, taken: false });
      dropCooldown = 150 + Math.random() * 160;
    }

    /* ── scoring ── */
    function addScore(n) { score += n; session.setScore(score); }
    function takeDrop(d) {
      d.taken = true;
      if (d.nib) {
        shield = true;
        session.sound("puShield");
        float(RUN_X + 30, GROUND - 120, L.shield.replace(/^an? /, "") + "!", C.good);
        return;
      }
      collected++; combo++; comboTimer = COMBO_WINDOW;
      if (combo > bestCombo) bestCombo = combo;
      const mult = Math.min(combo, COMBO_CAP);
      addScore(DROP_BASE * mult);
      burst(d.x, d.y, 9, C.accent, 2.6);
      float(d.x, d.y - 10, "+" + DROP_BASE * mult, C.accent);
      if (combo > 1 && combo % 5 === 0) { session.sound("combo", combo); float(RUN_X + 40, GROUND - 128, "×" + mult + " chain!", C.good); }
      else session.sound("pop");
    }
    function breakCombo() { if (combo >= 5) session.sound("comboBreak"); combo = 0; }
    function nextChapter() {
      chapter = Math.min(CHAPTERS, chapter + 1);
      bannerText = "Stage " + chapter + " — " + skin.chapters[chapter - 1];
      banner = reduced ? 90 : 96;
      if (!reduced) shake = Math.max(shake, 6);
      session.sound("phaseUp");
    }
    function hit(o) {
      if (invuln > 0 || dying) return;
      lastHit = { kind: o.kind, pattern: o.pattern, top: Math.round(o.y), h: Math.round(o.h), chapter,
                  speed: Math.round(speed * 10) / 10, airborne: !grounded, shielded: shield };
      if (shield) {
        shield = false; invuln = SHIELD_INVULN; o.dead = true; breakCombo();
        if (!reduced) shake = 10;
        burst(o.x + o.w / 2, o.y + o.h / 2, 16, C.bad, 4.2);
        float(RUN_X + 30, GROUND - 120, "Shield spent", C.bad);
        session.sound("shieldBlock");
        return;
      }
      die();
    }
    function die() {
      if (ended || dying) return;
      breakCombo();
      session.sound("crash");
      if (reduced) return finish();
      dying = 34; shake = 14;
      burst(RUN_X + RUN_W / 2, y - RUN_H / 2, 26, C.bad, 5);
      burst(RUN_X + RUN_W / 2, y - RUN_H / 2, 14, C.ink, 3);
    }
    function finish() {
      if (ended) return;
      ended = true;
      session.gameOver(skin.death + " in " + skin.chapters[chapter - 1] + ".", [
        ["Distance", Math.floor(dist / 10) + "m"], [L.pickup.charAt(0).toUpperCase() + L.pickup.slice(1), collected],
        ["Best chain", "×" + Math.min(bestCombo, COMBO_CAP)], ["Near misses", nearMisses]]);
    }

    /* ── the fixed-step loop ── */
    session.loop(dt => {
      if (ended) return;
      acc = Math.min(acc + dt, STEP * 4);
      let stepped = false;
      while (acc >= STEP) {
        acc -= STEP;
        stepped = true;
        frame++;
        if (dying > 0) { if (--dying === 0) { finish(); return; } step(false); }
        else step(true);
        if (ended) return;
      }
      if (stepped) draw();
    });

    function step(active) {
      if (active) {
        if (coyote > 0) coyote--;
        if (buffered > 0) { buffered--; tryJump(); }
        let g = GRAV;
        if (holding && holdFrames > 0 && vy < 0) { g = HOLD_G; holdFrames--; }
        if (diving && !grounded) g = DIVE_G;
        vy = Math.min(MAX_FALL, vy + g);
        const wasAir = !grounded;
        y += vy;
        if (y >= GROUND) {
          y = GROUND;
          if (wasAir && vy > 3) {
            sy = 0.7; sx = 1.28;
            puff(RUN_X + RUN_W / 2, GROUND, Math.min(10, 3 + Math.floor(vy)));
            if (vy > 11 && !reduced) shake = Math.max(shake, 3);
          }
          vy = 0; grounded = true; diving = false;
        } else if (grounded) { grounded = false; coyote = COYOTE; }

        const want = SPEED_MIN + (chapter - 1) * 0.62 + Math.min(1.0, dist / 12000);
        speed += (Math.min(SPEED_MAX, want) - speed) * 0.02;
        dist += speed;
        if (frame % 6 === 0) addScore(1);
        if (Math.floor(dist / CHAPTER_EVERY) + 1 > chapter && chapter < CHAPTERS) nextChapter();

        gapLeft -= speed;
        if (gapLeft <= 0) spawnPattern();
        dropCooldown -= speed * 0.35;
        if (dropCooldown <= 0) spawnLine();

        const rh = ducking && grounded ? DUCK_H : RUN_H;
        const rTop = y - rh, rBot = y, rL = RUN_X, rR = RUN_X + RUN_W;
        for (const o of obstacles) {
          o.x -= speed;
          if (o.bobFrom !== undefined) { o.phase += o.bobSpeed; o.y = o.bobFrom + (Math.sin(o.phase) * 0.5 + 0.5) * (o.bobTo - o.bobFrom); }
          if (o.dead) continue;
          if (rR > o.x && rL < o.x + o.w) {
            if (rBot > o.y && rTop < o.y + o.h) { hit(o); if (dying || ended) break; continue; }
            const gap = rBot <= o.y ? o.y - rBot : rTop - (o.y + o.h);
            if (gap >= 0 && gap < o.minGap) o.minGap = gap;
          }
          if (!o.done && o.x + o.w < rL) {
            o.done = true;
            if (o.minGap < NEAR_PX) {
              nearMisses++; addScore(NEAR_POINTS);
              float(rL + 8, o.y - 12, "+" + NEAR_POINTS, C.info);
              burst(rL, o.y + o.h / 2, 5, C.info, 1.8);
              session.sound("tap");
            }
          }
        }
        obstacles = obstacles.filter(o => !o.dead && o.x + o.w > -30);

        const cx = RUN_X + RUN_W / 2, cy = y - rh / 2;
        for (const d of drops) {
          d.x -= speed;
          if (d.taken) continue;
          const dx = d.x - cx, dy = d.y - cy;
          if (dx * dx + dy * dy < (d.r + 17) * (d.r + 17)) takeDrop(d);
        }
        drops = drops.filter(d => !d.taken && d.x > -20);
        if (comboTimer > 0 && --comboTimer === 0) breakCombo();
        if (!shield && frame % 240 === 0 && Math.random() < 0.5)
          drops.push({ x: W + 40, y: GROUND - 60 - Math.random() * 40, r: 10, nib: true, taken: false });
        if (invuln > 0) invuln--;
        if (!reduced) { trail.push({ y, h: rh }); if (trail.length > 8) trail.shift(); }
      }
      sx += (1 - sx) * 0.18; sy += (1 - sy) * 0.18;
      if (shake > 0) shake *= 0.86;
      if (banner > 0) banner--;
      bgMarks.forEach(m => { m.x -= speed * m.d; if (m.x + m.w < 0) { m.x = W + Math.random() * 60; m.y = 44 + Math.random() * (GROUND - 80); } });
      parts.forEach(p => { p.x += p.vx; p.y += p.vy; p.vy += p.g; p.life--; });
      parts = parts.filter(p => p.life > 0);
      floats.forEach(f => { f.y -= 0.9; f.life--; });
      floats = floats.filter(f => f.life > 0);
    }

    /* ── drawing ── */
    function glyph(text, x, y2, size, colour) {
      if (!text) return;
      ctx.font = "800 " + Math.round(size) + "px ui-sans-serif, system-ui, 'Segoe UI Emoji', 'Apple Color Emoji', sans-serif";
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillStyle = colour || C.ink;
      ctx.fillText(text, x, y2);
      ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
    }
    function draw() {
      ctx.save();
      if (shake > 0.4) ctx.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake);
      ctx.clearRect(-20, -20, W + 40, H + 40);
      if (skin.dark) { ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H); }

      const rules = 7 + chapter;
      ctx.strokeStyle = C.line; ctx.lineWidth = 1; ctx.globalAlpha = 0.55 + chapter * 0.05;
      for (let i = 1; i < rules; i++) { const ly = (GROUND / rules) * i + 8; ctx.beginPath(); ctx.moveTo(0, ly); ctx.lineTo(W, ly); ctx.stroke(); }
      ctx.globalAlpha = 0.16; ctx.fillStyle = C.faint;
      bgMarks.forEach(m => ctx.fillRect(m.x, m.y, m.w, 2));
      ctx.globalAlpha = 1;
      if (!reduced && speed > 6.4) {
        ctx.strokeStyle = C.faint; ctx.globalAlpha = Math.min(0.4, (speed - 6.4) * 0.3);
        for (let i = 0; i < 5; i++) { const ly = 30 + ((frame * (5 + i) * 2.2) % (GROUND - 20)); ctx.beginPath(); ctx.moveTo(W - 40 - i * 22, ly); ctx.lineTo(W - 96 - i * 22, ly); ctx.stroke(); }
        ctx.globalAlpha = 1;
      }
      ctx.fillStyle = C.ink; ctx.fillRect(0, GROUND, W, 3);

      obstacles.forEach(drawObstacle);
      drops.forEach(drawDrop);
      if (!reduced) {
        trail.forEach((t, i) => { ctx.globalAlpha = (i / trail.length) * 0.16; drawRunner(t.y, t.h, 1, 1, true); });
        ctx.globalAlpha = 1;
      }
      const rh = ducking && grounded ? DUCK_H : RUN_H;
      if (!(invuln > 0 && Math.floor(frame / 4) % 2)) drawRunner(y, rh, sx, sy, false);
      parts.forEach(p => { ctx.globalAlpha = Math.max(0, p.life / p.max); ctx.fillStyle = p.colour; ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, 6.283); ctx.fill(); });
      ctx.globalAlpha = 1;
      drawHud();
      ctx.restore();
    }

    function drawRunner(ny, h, scaleX, scaleY, ghost) {
      const w = RUN_W * scaleX, hh = h * scaleY;
      const fill = ghost ? C.accent : (shield ? C.good : C.accent);
      ctx.save();
      ctx.translate(RUN_X + RUN_W / 2, ny);
      ctx.fillStyle = fill;
      const shape = skin.runner;
      ctx.beginPath();
      if (shape === "nib") {
        ctx.moveTo(-w / 2, -hh + hh * 0.12); ctx.lineTo(w / 2, -hh + hh * 0.46); ctx.lineTo(w / 2, -hh + hh * 0.62); ctx.lineTo(-w / 2, -hh * 0.06);
        ctx.closePath(); ctx.fill();
      } else if (shape === "flask") {
        ctx.moveTo(-w * 0.18, -hh); ctx.lineTo(w * 0.18, -hh); ctx.lineTo(w * 0.18, -hh * 0.6); ctx.lineTo(w / 2, -2);
        ctx.lineTo(-w / 2, -2); ctx.lineTo(-w * 0.18, -hh * 0.6); ctx.closePath(); ctx.fill();
      } else if (shape === "photon") {
        ctx.arc(0, -hh / 2, Math.min(w, hh) / 2, 0, 6.283); ctx.fill();
        if (!ghost) { ctx.globalAlpha = 0.3; ctx.beginPath(); ctx.arc(0, -hh / 2, Math.min(w, hh) * 0.85, 0, 6.283); ctx.fill(); ctx.globalAlpha = 1; }
      } else if (shape === "arrow") {
        ctx.moveTo(-w / 2, -hh); ctx.lineTo(w / 2, -hh / 2); ctx.lineTo(-w / 2, -2); ctx.lineTo(-w * 0.2, -hh / 2); ctx.closePath(); ctx.fill();
      } else if (shape === "cell") {
        ctx.ellipse(0, -hh / 2, w / 2, hh / 2, 0, 0, 6.283); ctx.fill();
        if (!ghost) { ctx.fillStyle = C.bg; ctx.beginPath(); ctx.arc(w * 0.08, -hh * 0.55, Math.min(w, hh) * 0.16, 0, 6.283); ctx.fill(); }
      } else {
        const r = 7;
        ctx.moveTo(-w / 2 + r, -hh); ctx.lineTo(w / 2 - r, -hh); ctx.quadraticCurveTo(w / 2, -hh, w / 2, -hh + r);
        ctx.lineTo(w / 2, -2); ctx.lineTo(-w / 2, -2); ctx.lineTo(-w / 2, -hh + r); ctx.quadraticCurveTo(-w / 2, -hh, -w / 2 + r, -hh);
        ctx.fill();
        if (!ghost) { ctx.fillStyle = C.bg; ctx.fillRect(w * 0.08, -hh * 0.78, 4, 5); ctx.fillRect(w * 0.28, -hh * 0.78, 4, 5); }
      }
      if (!ghost) {
        ctx.strokeStyle = fill; ctx.lineWidth = 3;
        const swing = grounded ? Math.sin(frame * 0.42) * 6 : -3;
        ctx.beginPath();
        ctx.moveTo(-w * 0.18, -2); ctx.lineTo(-w * 0.18 + swing, 8);
        ctx.moveTo(w * 0.1, -2); ctx.lineTo(w * 0.1 - swing, 8);
        ctx.stroke();
        if (shield) {
          ctx.strokeStyle = C.good; ctx.globalAlpha = 0.75; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.arc(0, -hh / 2, Math.max(w, hh) * 0.78, 0, 6.283); ctx.stroke(); ctx.globalAlpha = 1;
        }
      }
      ctx.restore();
    }

    function drawObstacle(o) {
      if (o.kind === "hang") {
        ctx.strokeStyle = C.info; ctx.lineWidth = 3; ctx.beginPath();
        for (let i = 0; i <= o.w; i += 4) {
          const yy = o.y + o.h * 0.5 + Math.sin((i / o.w) * 7 + o.born * 0.1) * o.h * 0.34;
          if (i === 0) ctx.moveTo(o.x + i, yy); else ctx.lineTo(o.x + i, yy);
        }
        ctx.stroke();
        ctx.globalAlpha = 0.25; ctx.fillStyle = C.info; ctx.fillRect(o.x, o.y, o.w, o.h); ctx.globalAlpha = 1;
        /* A tether up to the top, so a hanging bar reads as hanging. */
        ctx.strokeStyle = C.info; ctx.lineWidth = 1; ctx.globalAlpha = 0.4;
        ctx.beginPath(); ctx.moveTo(o.x + o.w / 2, 0); ctx.lineTo(o.x + o.w / 2, o.y); ctx.stroke(); ctx.globalAlpha = 1;
        glyph(G.hang, o.x + o.w / 2, o.y + o.h / 2, 18, C.ink);
        return;
      }
      if (o.kind === "strike") {
        ctx.strokeStyle = C.bad; ctx.lineWidth = 4; ctx.beginPath();
        ctx.moveTo(o.x, o.y + o.h); ctx.lineTo(o.x + o.w, o.y); ctx.moveTo(o.x, o.y); ctx.lineTo(o.x + o.w, o.y + o.h); ctx.stroke();
        glyph(G.strike, o.x + o.w / 2, o.y - 10, 14, C.bad);
        return;
      }
      ctx.fillStyle = C.warn; ctx.globalAlpha = 0.28; ctx.fillRect(o.x, o.y, o.w, o.h); ctx.globalAlpha = 1;
      ctx.strokeStyle = C.warn; ctx.lineWidth = 2; ctx.strokeRect(o.x + 1, o.y + 1, o.w - 2, o.h - 2);
      const gs = Math.min(o.w * 0.95, 22);
      for (let gy = o.y + gs / 2 + 3; gy < o.y + o.h - gs / 3; gy += gs + 4) glyph(G.ground, o.x + o.w / 2, gy, gs, C.ink);
    }

    function drawDrop(d) {
      if (d.nib) {
        ctx.save(); ctx.translate(d.x, d.y); ctx.rotate(reduced ? 0 : frame * 0.05);
        ctx.fillStyle = C.good; ctx.beginPath();
        ctx.moveTo(0, -d.r - 3); ctx.lineTo(d.r, 0); ctx.lineTo(0, d.r + 3); ctx.lineTo(-d.r, 0); ctx.closePath(); ctx.fill();
        ctx.restore();
        glyph(G.shield, d.x, d.y, 12, C.bg);
        return;
      }
      const bob = reduced ? 0 : Math.sin(frame * 0.1 + d.x * 0.05) * 2;
      ctx.fillStyle = C.accent; ctx.beginPath(); ctx.arc(d.x, d.y + bob, d.r, 0, 6.283); ctx.fill();
      glyph(G.pickup, d.x, d.y + bob + 1, G.pickup.length > 2 ? 7 : 11, C.bg);
    }

    function drawHud() {
      ctx.font = "700 15px ui-sans-serif, system-ui, sans-serif"; ctx.textBaseline = "top";
      ctx.fillStyle = C.faint; ctx.fillText(skin.chapters[chapter - 1], 14, 10);
      if (combo > 1) {
        const mult = Math.min(combo, COMBO_CAP);
        ctx.textAlign = "right"; ctx.fillStyle = mult >= COMBO_CAP ? C.good : C.accent;
        ctx.font = "800 20px ui-sans-serif, system-ui, sans-serif"; ctx.fillText("×" + mult, W - 14, 10);
        ctx.fillStyle = C.line; ctx.fillRect(W - 74, 34, 60, 4);
        ctx.fillStyle = C.accent; ctx.fillRect(W - 74, 34, 60 * (comboTimer / COMBO_WINDOW), 4);
        ctx.textAlign = "left";
      }
      if (shield) { ctx.fillStyle = C.good; ctx.font = "700 13px ui-sans-serif, system-ui, sans-serif"; ctx.fillText("◆ " + L.shield, 14, 32); }
      floats.forEach(f => {
        ctx.globalAlpha = Math.min(1, f.life / 18); ctx.fillStyle = f.colour;
        ctx.font = "800 15px ui-sans-serif, system-ui, sans-serif"; ctx.fillText(f.text, f.x, f.y);
      });
      ctx.globalAlpha = 1;
      if (banner > 0) {
        ctx.globalAlpha = reduced ? 1 : Math.min(1, (banner / 96) * 2.4);
        ctx.textAlign = "center"; ctx.fillStyle = C.ink; ctx.font = "800 24px ui-sans-serif, system-ui, sans-serif";
        ctx.fillText(bannerText, W / 2, GROUND / 2 - 22); ctx.globalAlpha = 1; ctx.textAlign = "left";
      }
      if (dying > 0) {
        ctx.globalAlpha = 0.85; ctx.textAlign = "center"; ctx.fillStyle = C.bad; ctx.font = "800 26px ui-sans-serif, system-ui, sans-serif";
        ctx.fillText(skin.death, W / 2, GROUND / 2 - 10); ctx.globalAlpha = 1; ctx.textAlign = "left";
      }
    }

    live = () => ({
      y, vy, grounded, ducking, diving, chapter, speed, score, dist, frame,
      combo, bestCombo, collected, nearMisses, shield, invuln, ended, dying, lastHit,
      obstacles: obstacles.map(o => ({ kind: o.kind, pattern: o.pattern, x: o.x, y: o.y, w: o.w, h: o.h })),
      drops: drops.length, runnerTop: y - (ducking && grounded ? DUCK_H : RUN_H)
    });
    draw();

    return {
      destroy() { ended = true; live = null; },
      pause() { holding = false; ducking = false; diving = false; held.clear(); },
      resume() {},
      state: () => (live ? live() : null)
    };
  }

  const def = SQ.Arcade.register({
    id: "runner", name: "Runner", icon: "🏃", colour: "#ffcc55", level: 5,
    blurb: "Endless runner: variable jumps, dives, chains and near misses.",
    how: "Jump (Space / ↑ / the Jump pad — hold for higher), duck (↓ / Duck — in the air it dives).",
    start
  });
  /* Test seams: read-only, nothing in the game reads them. */
  def.state = () => (live ? live() : null);
  def.geometry = { W, H, GROUND, RUN_X, RUN_W, RUN_H, DUCK_H, DUCK_BAR_BOTTOM, GRAV, JUMP_V, HOLD_G, HOLD_MAX,
    MAX_FALL, AIR_TAP, AIR_HOLD, NEAR_PX, COMBO_CAP, CHAPTERS, SPEED_MIN, SPEED_MAX,
    patterns: PATTERNS.map(p => ({ id: p.id, from: p.from, solve: p.solve, recover: p.recover })) };
  def.buildAt = (id, sp) => { const p = PATTERNS.find(x => x.id === id); return p ? p.build(sp) : null; };
})();
