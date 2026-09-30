/* Rapid Fire — 2 minutes, endless MCQ, streak multiplier to ×3. */
(function (root) {
  "use strict";
  var BIO = root.BIO, U = BIO.U, UI = BIO.UI, R = BIO.Run;

  R.register({
    id:"rapidfire", name:"Rapid Fire", icon:"⚡", route:"/play/rapidfire",
    blurb:"2 minutes. Endless questions. Streak multiplier up to ×3.",
    group:"Core"
  });

  UI.route("/play/rapidfire", function (view) {
    if (BIO.Coverage.warnIfEmpty("mcq")) return;
    var stream = BIO.Bank.stream("mcq");
    return R.start(view, {
      id:"rapidfire",
      title:"Rapid Fire",
      sub:"2 minutes · streak multiplier up to ×3",
      timeMs: 120000,
      streakBonus: true,
      bonus: 0,          // no completion bonus — the timer is the whole game
      next: function () { return stream.next(); }
    });
  });
})(typeof window !== "undefined" ? window : globalThis);
