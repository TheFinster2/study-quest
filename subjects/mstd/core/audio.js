/* ============================================================================
   audio.js — every sound in the app, synthesised in WebAudio. No files, so
   nothing to precache and nothing to license (§12).
   Namespace: window.MS.Audio  —  Audio.play('correct')
   ========================================================================== */
window.MS = window.MS || {};
(function () {
  'use strict';
  var A = { on: true, vol: 0.5, ctx: null };
  var master = null, unlocked = false;

  function ac() {
    if (!A.ctx) {
      var C = window.AudioContext || window.webkitAudioContext;
      if (!C) return null;
      A.ctx = new C();
      master = A.ctx.createGain();
      master.gain.value = A.vol;
      master.connect(A.ctx.destination);
    }
    if (A.ctx.state === 'suspended') A.ctx.resume();
    return A.ctx;
  }
  A.unlock = function () {
    if (unlocked) return;
    unlocked = true;
    ac();
  };
  A.setVolume = function (v) { A.vol = Math.max(0, Math.min(1, v)); if (master) master.gain.value = A.vol; };

  /* -------------------------------------------------------------- builders */
  function tone(o) {
    var c = ac(); if (!c || !A.on) return;
    var t0 = c.currentTime + (o.at || 0);
    var osc = c.createOscillator();
    var g = c.createGain();
    osc.type = o.wave || 'sine';
    osc.frequency.setValueAtTime(o.f, t0);
    if (o.f2 != null) {
      if (o.glide === 'exp') osc.frequency.exponentialRampToValueAtTime(Math.max(1, o.f2), t0 + o.d);
      else osc.frequency.linearRampToValueAtTime(o.f2, t0 + o.d);
    }
    var peak = (o.g == null ? 0.22 : o.g);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(peak, t0 + Math.min(0.02, o.d * 0.3));
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + o.d);
    var node = osc;
    if (o.filter) {
      var bq = c.createBiquadFilter();
      bq.type = o.filter; bq.frequency.value = o.fc || 900; bq.Q.value = o.q || 1;
      osc.connect(bq); node = bq;
    }
    node.connect(g); g.connect(master);
    osc.start(t0); osc.stop(t0 + o.d + 0.02);
  }

  function noise(o) {
    var c = ac(); if (!c || !A.on) return;
    var t0 = c.currentTime + (o.at || 0);
    var len = Math.max(0.02, o.d);
    var buf = c.createBuffer(1, Math.ceil(c.sampleRate * len), c.sampleRate);
    var d = buf.getChannelData(0);
    for (var i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
    var src = c.createBufferSource(); src.buffer = buf;
    var bq = c.createBiquadFilter();
    bq.type = o.filter || 'bandpass';
    bq.frequency.setValueAtTime(o.f || 1200, t0);
    if (o.f2) bq.frequency.exponentialRampToValueAtTime(Math.max(40, o.f2), t0 + len);
    bq.Q.value = o.q || 1;
    var g = c.createGain();
    g.gain.setValueAtTime(o.g == null ? 0.2 : o.g, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + len);
    src.connect(bq); bq.connect(g); g.connect(master);
    src.start(t0); src.stop(t0 + len + 0.02);
  }

  function seq(notes, opts) {
    opts = opts || {};
    notes.forEach(function (n, i) {
      tone({ f: n, d: opts.d || 0.1, at: (opts.gap || 0.075) * i, wave: opts.wave || 'triangle', g: opts.g || 0.2, f2: opts.f2 });
    });
  }
  function chord(fs, opts) {
    opts = opts || {};
    fs.forEach(function (f) { tone({ f: f, d: opts.d || 0.3, wave: opts.wave || 'sine', g: opts.g || 0.13, at: opts.at || 0 }); });
  }

  var N = {                                       // a handful of note names
    C4: 261.6, D4: 293.7, E4: 329.6, F4: 349.2, G4: 392, A4: 440, B4: 493.9,
    C5: 523.3, D5: 587.3, E5: 659.3, F5: 698.5, G5: 784, A5: 880, B5: 987.8,
    C6: 1046.5, E6: 1318.5, G6: 1568, C3: 130.8, G3: 196, E3: 164.8, A3: 220
  };

  /* ================================================== the SFX vocabulary ==
     Named by intent, not by sound, so game code reads well.                */
  var SFX = {
    /* -- answers ---------------------------------------------------------- */
    correct:      function () { seq([N.E5, N.G5, N.C6], { d: 0.11, gap: 0.06 }); },
    correctSmall: function () { tone({ f: N.E5, d: 0.09, wave: 'triangle', g: 0.18 }); },
    correctBig:   function () { seq([N.C5, N.E5, N.G5, N.C6, N.E6], { d: 0.12, gap: 0.055 }); },
    wrong:        function () { tone({ f: 200, f2: 110, d: 0.3, wave: 'sawtooth', g: 0.16, glide: 'exp', filter: 'lowpass', fc: 700 }); },
    wrongHard:    function () { tone({ f: 160, f2: 70, d: 0.5, wave: 'square', g: 0.17, glide: 'exp', filter: 'lowpass', fc: 500 }); noise({ f: 300, d: 0.3, g: 0.1 }); },
    near:         function () { seq([N.D5, N.F5], { d: 0.1, gap: 0.07, wave: 'sine' }); },
    reveal:       function () { tone({ f: 520, f2: 880, d: 0.22, wave: 'sine', g: 0.13 }); },

    /* -- streaks & multipliers ------------------------------------------- */
    streak2:  function () { seq([N.G5, N.B5], { d: 0.09, gap: 0.05 }); },
    streak3:  function () { seq([N.G5, N.B5, N.D5 * 2], { d: 0.09, gap: 0.05 }); },
    streakMax: function () { seq([N.C5, N.E5, N.G5, N.C6, N.G6], { d: 0.1, gap: 0.05, wave: 'square', g: 0.13 }); },
    combo:    function () { tone({ f: 880, f2: 1320, d: 0.14, wave: 'triangle', g: 0.15 }); },
    multUp:   function () { tone({ f: 660, f2: 1200, d: 0.2, wave: 'sine', g: 0.16 }); },
    multDrop: function () { tone({ f: 660, f2: 300, d: 0.24, wave: 'sine', g: 0.14, glide: 'exp' }); },

    /* -- rewards ---------------------------------------------------------- */
    xp:      function () { tone({ f: 1200, f2: 1700, d: 0.09, wave: 'sine', g: 0.1 }); },
    xpBig:   function () { seq([1100, 1400, 1750, 2100], { d: 0.07, gap: 0.04, wave: 'sine', g: 0.1 }); },
    coin:    function () { seq([N.B5, N.E6], { d: 0.08, gap: 0.045, wave: 'square', g: 0.11 }); },
    coins:   function () { for (var i = 0; i < 5; i++) tone({ f: 900 + i * 160, d: 0.07, at: i * 0.045, wave: 'square', g: 0.09 }); },
    levelUp: function () { seq([N.C5, N.E5, N.G5, N.C6], { d: 0.16, gap: 0.1 }); chord([N.C5, N.E5, N.G5], { d: 0.9, at: 0.4, g: 0.09 }); },
    prestige: function () { seq([N.C4, N.G4, N.C5, N.E5, N.G5, N.C6], { d: 0.2, gap: 0.13, wave: 'sine' }); chord([N.C5, N.E5, N.G5, N.C6], { d: 1.6, at: 0.85, g: 0.08 }); },
    achieve: function () { seq([N.A5, N.C6, N.E6], { d: 0.13, gap: 0.07, wave: 'triangle' }); },
    questDone: function () { seq([N.F5, N.A5, N.C6], { d: 0.13, gap: 0.075 }); },
    dailyClaim: function () { seq([N.G5, N.C6, N.E6, N.G6], { d: 0.11, gap: 0.06 }); },
    crate:   function () { noise({ f: 500, f2: 3000, d: 0.4, g: 0.14 }); seq([N.C5, N.G5, N.C6], { d: 0.15, gap: 0.11, at: 0.2 }); },
    rare:    function () { chord([N.E5, N.A5, N.C6, N.E6], { d: 1.1, g: 0.1 }); },
    purchase: function () { seq([N.E5, N.A5], { d: 0.11, gap: 0.07, wave: 'square', g: 0.13 }); },
    refused: function () { tone({ f: 220, d: 0.12, wave: 'square', g: 0.12 }); tone({ f: 180, d: 0.16, at: 0.11, wave: 'square', g: 0.12 }); },

    /* -- clocks ----------------------------------------------------------- */
    tick:     function () { tone({ f: 1500, d: 0.03, wave: 'square', g: 0.05 }); },
    tickLow:  function () { tone({ f: 700, d: 0.05, wave: 'square', g: 0.09 }); },
    timeUp:   function () { seq([N.G4, N.E4, N.C4], { d: 0.22, gap: 0.16, wave: 'sawtooth', g: 0.14 }); },
    countdown: function () { tone({ f: 900, d: 0.09, wave: 'triangle', g: 0.13 }); },
    go:       function () { seq([N.C5, N.G5], { d: 0.16, gap: 0.1, wave: 'square', g: 0.15 }); },
    freeze:   function () { tone({ f: 2000, f2: 600, d: 0.5, wave: 'sine', g: 0.12, glide: 'exp' }); noise({ f: 4000, f2: 800, d: 0.5, g: 0.06 }); },

    /* -- UI --------------------------------------------------------------- */
    tap:      function () { tone({ f: 620, d: 0.035, wave: 'triangle', g: 0.09 }); },
    tapSoft:  function () { tone({ f: 420, d: 0.04, wave: 'sine', g: 0.07 }); },
    nav:      function () { tone({ f: 520, f2: 700, d: 0.07, wave: 'sine', g: 0.08 }); },
    open:     function () { tone({ f: 400, f2: 720, d: 0.14, wave: 'sine', g: 0.1 }); },
    close:    function () { tone({ f: 720, f2: 380, d: 0.13, wave: 'sine', g: 0.09 }); },
    toggle:   function () { tone({ f: 800, d: 0.05, wave: 'square', g: 0.08 }); },
    theme:    function () { seq([N.D5, N.F5, N.A5], { d: 0.1, gap: 0.05, wave: 'sine', g: 0.11 }); },
    error:    function () { tone({ f: 150, d: 0.2, wave: 'sawtooth', g: 0.14 }); },
    typing:   function () { tone({ f: 1000 + Math.random() * 300, d: 0.02, wave: 'square', g: 0.04 }); },

    /* -- flashcards & study ---------------------------------------------- */
    flip:     function () { noise({ f: 2200, f2: 700, d: 0.13, g: 0.09 }); },
    cardEasy: function () { seq([N.G5, N.C6], { d: 0.1, gap: 0.06 }); },
    cardHard: function () { tone({ f: 300, f2: 220, d: 0.2, wave: 'triangle', g: 0.13 }); },
    boxUp:    function () { tone({ f: 700, f2: 1050, d: 0.15, wave: 'sine', g: 0.12 }); },
    boxDown:  function () { tone({ f: 700, f2: 400, d: 0.18, wave: 'sine', g: 0.11 }); },
    deckDone: function () { seq([N.C5, N.E5, N.G5, N.B5, N.C6], { d: 0.12, gap: 0.06 }); },

    /* -- match pairs ------------------------------------------------------ */
    cardPick: function () { tone({ f: 560, d: 0.05, wave: 'triangle', g: 0.1 }); },
    matchYes: function () { seq([N.E5, N.A5], { d: 0.1, gap: 0.05 }); },
    matchNo:  function () { tone({ f: 260, d: 0.13, wave: 'triangle', g: 0.11 }); },
    clearAll: function () { seq([N.C5, N.E5, N.G5, N.C6, N.E6, N.G6], { d: 0.09, gap: 0.045 }); },

    /* -- unit chain / crunch --------------------------------------------- */
    cancel:   function () { noise({ f: 3000, f2: 1200, d: 0.12, g: 0.08 }); tone({ f: 1300, d: 0.06, wave: 'sine', g: 0.08 }); },
    chainStep: function () { tone({ f: 500, f2: 640, d: 0.08, wave: 'triangle', g: 0.1 }); },
    chainDone: function () { seq([N.G5, N.B5, N.D5 * 2, N.G6], { d: 0.1, gap: 0.055 }); },
    dimBad:   function () { tone({ f: 190, f2: 150, d: 0.24, wave: 'sawtooth', g: 0.12 }); },
    submit:   function () { tone({ f: 640, f2: 900, d: 0.1, wave: 'triangle', g: 0.12 }); },

    /* -- labs -------------------------------------------------------------- */
    slide:    function () { tone({ f: 300 + Math.random() * 80, d: 0.02, wave: 'sine', g: 0.04 }); },
    lock:     function () { tone({ f: 500, d: 0.07, wave: 'square', g: 0.11 }); tone({ f: 750, d: 0.08, at: 0.06, wave: 'square', g: 0.1 }); },
    inTol:    function () { seq([N.A5, N.C6, N.E6], { d: 0.1, gap: 0.05 }); },
    outTol:   function () { tone({ f: 240, d: 0.18, wave: 'triangle', g: 0.12 }); },
    plot:     function () { tone({ f: 1100, d: 0.03, wave: 'sine', g: 0.06 }); },
    scanFwd:  function () { for (var i = 0; i < 4; i++) tone({ f: 500 + i * 130, d: 0.06, at: i * 0.05, wave: 'triangle', g: 0.09 }); },
    scanBack: function () { for (var j = 0; j < 4; j++) tone({ f: 1000 - j * 130, d: 0.06, at: j * 0.05, wave: 'triangle', g: 0.09 }); },
    pathFound: function () { seq([N.C5, N.G5, N.C6, N.G6], { d: 0.13, gap: 0.07 }); },

    /* -- boss -------------------------------------------------------------- */
    bossIntro: function () { tone({ f: 90, f2: 60, d: 1.1, wave: 'sawtooth', g: 0.15, filter: 'lowpass', fc: 320 }); chord([N.C3, N.E3, N.G3], { d: 1.3, g: 0.09 }); },
    hitBoss:  function () { noise({ f: 900, f2: 200, d: 0.16, g: 0.16 }); tone({ f: 320, f2: 180, d: 0.16, wave: 'square', g: 0.13 }); },
    hitYou:   function () { noise({ f: 400, f2: 90, d: 0.3, g: 0.18, filter: 'lowpass' }); tone({ f: 130, d: 0.3, wave: 'sawtooth', g: 0.14 }); },
    bossHeal: function () { tone({ f: 400, f2: 900, d: 0.4, wave: 'sine', g: 0.12 }); },
    bossGrow: function () { tone({ f: 200, f2: 340, d: 0.45, wave: 'sawtooth', g: 0.13, filter: 'lowpass', fc: 800 }); },
    bossWin:  function () { seq([N.C5, N.E5, N.G5, N.C6, N.E6, N.G6, 2093], { d: 0.15, gap: 0.09 }); },
    bossLose: function () { seq([N.G4, N.F4, N.E4, N.C4], { d: 0.3, gap: 0.22, wave: 'sawtooth', g: 0.13 }); },
    shuffleOpts: function () { noise({ f: 1800, f2: 900, d: 0.1, g: 0.07 }); },
    danger:   function () { tone({ f: 320, d: 0.12, wave: 'square', g: 0.11 }); tone({ f: 320, d: 0.12, at: 0.18, wave: 'square', g: 0.11 }); },

    /* -- power-ups --------------------------------------------------------- */
    fifty:    function () { noise({ f: 2600, f2: 700, d: 0.22, g: 0.1 }); },
    skip:     function () { tone({ f: 900, f2: 1500, d: 0.12, wave: 'triangle', g: 0.12 }); },
    boost:    function () { tone({ f: 300, f2: 1500, d: 0.4, wave: 'sawtooth', g: 0.11, filter: 'lowpass', fc: 2000 }); },
    insight:  function () { chord([N.E5, N.B5, N.E6], { d: 0.6, g: 0.09 }); },
    adrenaline: function () { tone({ f: 500, f2: 1100, d: 0.3, wave: 'square', g: 0.11 }); },
    shield:   function () { tone({ f: 700, d: 0.25, wave: 'sine', g: 0.13, filter: 'bandpass', fc: 1200, q: 6 }); },

    /* -- survival / results ----------------------------------------------- */
    lifeLost: function () { seq([N.E5, N.C5, N.A4], { d: 0.16, gap: 0.11, wave: 'triangle', g: 0.14 }); },
    survive:  function () { tone({ f: 440, f2: 660, d: 0.2, wave: 'sine', g: 0.12 }); },
    gameOver: function () { seq([N.C5, N.A4, N.F4, N.C4], { d: 0.28, gap: 0.2, wave: 'sawtooth', g: 0.13 }); },
    resultsIn: function () { tone({ f: 520, f2: 780, d: 0.3, wave: 'sine', g: 0.12 }); },
    rankS:    function () { seq([N.C5, N.E5, N.G5, N.C6, N.E6], { d: 0.14, gap: 0.08 }); chord([N.C6, N.E6, N.G6], { d: 1.2, at: 0.5, g: 0.08 }); },
    newBest:  function () { seq([N.G5, N.C6, N.E6, N.G6, N.C6 * 2], { d: 0.1, gap: 0.055, wave: 'square', g: 0.11 }); },

    /* -- arcade ------------------------------------------------------------ */
    arcadeIn:  function () { seq([N.C5, N.E5, N.G5], { d: 0.09, gap: 0.05, wave: 'square', g: 0.12 }); },
    arcadeOut: function () { seq([N.G5, N.E5, N.C5], { d: 0.09, gap: 0.05, wave: 'square', g: 0.12 }); },
    crush:     function () { noise({ f: 1600, f2: 500, d: 0.14, g: 0.11 }); },
    cascade:   function () { for (var k = 0; k < 4; k++) tone({ f: 700 + k * 200, d: 0.06, at: k * 0.05, wave: 'square', g: 0.09 }); },
    jump:      function () { tone({ f: 420, f2: 780, d: 0.11, wave: 'square', g: 0.11 }); },
    duck:      function () { tone({ f: 500, f2: 260, d: 0.1, wave: 'square', g: 0.1 }); },
    crashed:   function () { noise({ f: 700, f2: 90, d: 0.4, g: 0.18, filter: 'lowpass' }); },
    merge:     function () { tone({ f: 520, f2: 900, d: 0.1, wave: 'triangle', g: 0.12 }); },
    slideTile: function () { noise({ f: 900, f2: 1600, d: 0.06, g: 0.05 }); },
    ticketBuy: function () { seq([N.E5, N.G5, N.B5], { d: 0.1, gap: 0.06, wave: 'square', g: 0.11 }); },
    ticketOut: function () { seq([N.B4, N.G4, N.E4], { d: 0.14, gap: 0.1, wave: 'square', g: 0.12 }); }
  };

  A.SFX = SFX;
  A.names = Object.keys(SFX);
  A.play = function (name) {
    if (!A.on) return;
    var f = SFX[name];
    if (!f) return;
    try { f(); } catch (e) { /* audio is never allowed to break gameplay */ }
  };
  /* Rate-limited variant for things fired in tight loops (typing, sliders). */
  var lastAt = {};
  A.throttled = function (name, ms) {
    var now = Date.now();
    if (lastAt[name] && now - lastAt[name] < (ms || 60)) return;
    lastAt[name] = now;
    A.play(name);
  };

  window.MS.Audio = A;
})();
