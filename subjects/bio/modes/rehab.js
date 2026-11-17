/* Mistake Rehab — only what you have previously missed. */
(function (root) {
  "use strict";
  var BIO = root.BIO, U = BIO.U, UI = BIO.UI, S = BIO.State, R = BIO.Run;

  R.register({
    id:"rehab", name:"Mistake Rehab", icon:"🩹", route:"/play/rehab",
    blurb:"Only the questions you have got wrong before. Two clean answers retires one.",
    group:"Core"
  });

  UI.route("/play/rehab", function (view) {
    var missed = S.missedIds();
    var qs = missed.map(function (id) { return BIO.Bank.byId("mcq", id); })
                   .filter(function (q) { return q && !BIO.Coverage.isHiddenItem(q); });

    if (!qs.length) {
      UI.hideTabs(false);
      view.appendChild(U.el("div", { class:"card empty" }, [
        U.el("div", { class:"empty-ico", text:"🩹" }),
        U.el("h2", { text:"Nothing to rehabilitate" }),
        U.el("p", { class:"muted", text: missed.length
          ? "Everything in your rehab pool is currently hidden by a coverage pack."
          : "Every question you miss in any mode lands here, so you can win it back for XP. Your pool is clear right now." }),
        U.el("div", { class:"row", style:"margin-top:12px;justify-content:center" }, [
          U.el("button", { class:"btn btn-primary", onclick: function () { UI.go("/play/rapidfire"); } }, "Rapid Fire"),
          U.el("button", { class:"btn", onclick: function () { UI.go("/play"); } }, "All modes")
        ])
      ]));
      return;
    }

    var picked = U.sample(qs, Math.min(12, qs.length));
    return R.start(view, {
      id:"rehab",
      title:"Mistake Rehab",
      sub: U.plural(qs.length, "question") + " in your pool",
      questions: picked,
      limit: picked.length,
      streakBonus: false,
      bonus: 100,
      extraRows: function () {
        return [["Remaining in pool", String(S.missedIds().length)]];
      }
    });
  });
})(typeof window !== "undefined" ? window : globalThis);
