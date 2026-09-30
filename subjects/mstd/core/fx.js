/* ============================================================================
   fx.js — one full-screen canvas for particles, confetti and floating XP.
   Everything here is a no-op under prefers-reduced-motion (§12).
   Namespace: window.MS.FX
   ========================================================================== */
window.MS = window.MS || {};
(function () {
  'use strict';
  var U = window.MS.U;
  var FX = { enabled: true };
  var canvas = null, ctx = null, parts = [], raf = 0, dpr = 1;

  function ensure() {
    if (canvas) return true;
    canvas = document.getElementById('fxLayer');
    if (!canvas) return false;
    ctx = canvas.getContext('2d');
    resize();
    window.addEventListener('resize', resize);
    return true;
  }
  function resize() {
    if (!canvas) return;
    dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(window.innerWidth * dpr);
    canvas.height = Math.round(window.innerHeight * dpr);
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
  }
  function live() { return FX.enabled && !U.reducedMotion(); }

  function loop() {
    raf = 0;
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    var alive = [];
    for (var i = 0; i < parts.length; i++) {
      var p = parts[i];
      p.life -= 1;
      p.vy += p.g;
      p.vx *= p.drag; p.vy *= p.drag;
      p.x += p.vx; p.y += p.vy;
      p.rot += p.spin;
      if (p.life <= 0 || p.y > window.innerHeight + 60) continue;
      var a = Math.min(1, p.life / p.fade);
      ctx.globalAlpha = a;
      ctx.fillStyle = p.c;
      if (p.shape === 'rect') {
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
        ctx.fillRect(-p.r, -p.r * 0.5, p.r * 2, p.r);
        ctx.restore();
      } else if (p.shape === 'text') {
        ctx.save(); ctx.translate(p.x, p.y);
        ctx.font = '800 ' + p.r * 3 + 'px ui-sans-serif, system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(p.txt, 0, 0);
        ctx.restore();
      } else {
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      }
      alive.push(p);
    }
    ctx.globalAlpha = 1;
    parts = alive;
    if (parts.length) raf = requestAnimationFrame(loop);
  }
  function kick() { if (!raf) raf = requestAnimationFrame(loop); }

  function cols() {
    var P = window.MS.Draw ? window.MS.Draw.palette() : { accent: '#4cc9f0', accent2: '#a78bfa', good: '#38d996', warn: '#ffc247' };
    return [P.accent, P.accent2, P.good, P.warn];
  }

  /* Confetti burst from a point (defaults to the top third of the screen). */
  FX.confetti = function (n, x, y) {
    if (!live() || !ensure()) return;
    n = n || 40;
    x = x == null ? window.innerWidth / 2 : x;
    y = y == null ? window.innerHeight * 0.3 : y;
    var C = cols();
    for (var i = 0; i < n; i++) {
      var ang = Math.random() * Math.PI * 2, sp = 2 + Math.random() * 7;
      parts.push({
        x: x, y: y, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp - 3,
        g: 0.16, drag: 0.985, r: 3 + Math.random() * 4, c: C[i % C.length],
        life: 70 + Math.random() * 50, fade: 40, shape: Math.random() < 0.55 ? 'rect' : 'dot',
        rot: Math.random() * 6, spin: (Math.random() - 0.5) * 0.3
      });
    }
    kick();
  };

  /* A small burst — used on every correct answer. */
  FX.burst = function (x, y, colour, n) {
    if (!live() || !ensure()) return;
    var C = colour || cols()[0];
    for (var i = 0; i < (n || 14); i++) {
      var ang = Math.random() * Math.PI * 2, sp = 1 + Math.random() * 4;
      parts.push({
        x: x, y: y, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp,
        g: 0.06, drag: 0.94, r: 1.5 + Math.random() * 2.5, c: C,
        life: 26 + Math.random() * 18, fade: 20, shape: 'dot', rot: 0, spin: 0
      });
    }
    kick();
  };

  /* Floating "+120 XP" that drifts up and fades. */
  FX.floatText = function (txt, x, y, colour) {
    if (!ensure()) return;
    if (!live()) return;
    parts.push({
      x: x, y: y, vx: (Math.random() - 0.5) * 0.6, vy: -1.7,
      g: 0.014, drag: 0.995, r: 6, c: colour || cols()[0],
      life: 62, fade: 40, shape: 'text', txt: txt, rot: 0, spin: 0
    });
    kick();
  };

  /* A rain of coins/credits from the top — shop payouts, crates. */
  FX.rain = function (n, glyphColour) {
    if (!live() || !ensure()) return;
    var C = glyphColour || cols()[3];
    for (var i = 0; i < (n || 22); i++) {
      parts.push({
        x: Math.random() * window.innerWidth, y: -20 - Math.random() * 120,
        vx: (Math.random() - 0.5) * 1.2, vy: 1 + Math.random() * 2,
        g: 0.08, drag: 0.995, r: 3 + Math.random() * 3, c: C,
        life: 130, fade: 40, shape: 'dot', rot: 0, spin: 0
      });
    }
    kick();
  };

  /* Screen shake — CSS transform on the app root, restores itself. */
  FX.shake = function (px) {
    if (!live()) return;
    var app = document.querySelector('.app');
    if (!app) return;
    var mag = px || 6, t0 = Date.now(), dur = 260;
    (function step() {
      var k = (Date.now() - t0) / dur;
      if (k >= 1) { app.style.transform = ''; return; }
      var m = mag * (1 - k);
      app.style.transform = 'translate(' + ((Math.random() - 0.5) * m).toFixed(2) + 'px,' + ((Math.random() - 0.5) * m).toFixed(2) + 'px)';
      requestAnimationFrame(step);
    })();
  };

  FX.clear = function () { parts = []; if (ctx) ctx.clearRect(0, 0, window.innerWidth, window.innerHeight); };

  /* Position helper: centre of an element, in viewport coords. */
  FX.centreOf = function (node) {
    if (!node || !node.getBoundingClientRect) return { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    var r = node.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  };

  window.MS.FX = FX;
})();
