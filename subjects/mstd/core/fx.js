/* ============================================================================
   fx.js — NumberCrunch's FX vocabulary, played on the app's ONE particle
   canvas (SQ.FX). The stand-alone app drew on its own #fxLayer; here every
   call forwards to SQ.FX, which already honours the motion setting.
   Namespace: window.MS.FX
   ========================================================================== */
window.MS = window.MS || {};
(function () {
  'use strict';
  var F = function () { return window.SQ && SQ.FX; };
  var FX = { enabled: true };

  FX.confetti = function (n) { var f = F(); if (f && f.confetti) f.confetti(n || 40); };
  /* A small burst on a correct answer. */
  FX.burst = function (x, y) { var f = F(); if (f && f.pop) f.pop(x, y); };
  /* Floating "+120 XP". NumberCrunch's argument order is (text, x, y, colour). */
  FX.floatText = function (txt, x, y, colour) { var f = F(); if (f && f.floatText) f.floatText(x, y, txt, colour); };
  /* Coins/credits rain — the shared canvas's confetti is the nearest cue. */
  FX.rain = function (n) { var f = F(); if (f && f.confetti) f.confetti(Math.round((n || 22) * 0.8)); };
  FX.shake = function () { var f = F(); if (f && f.shake) f.shake(); };
  FX.clear = function () {};
  FX.centreOf = function (node) {
    if (!node || !node.getBoundingClientRect) return { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    var r = node.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  };

  window.MS.FX = FX;
})();
