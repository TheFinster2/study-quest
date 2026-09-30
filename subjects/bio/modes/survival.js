/* Survival — one life, tightening clock. */
(function (root) {
  "use strict";
  var BIO = root.BIO, U = BIO.U, UI = BIO.UI, S = BIO.State, R = BIO.Run;

  R.register({
    id:"survival", name:"Survival", icon:"💀", route:"/play/survival",
    blurb:"One life. The clock gets shorter every question. How far can you go?",
    group:"Challenge"
  });

  UI.route("/play/survival", function (view) {
    if (BIO.Coverage.warnIfEmpty("mcq")) return;
    BIO.Tools.startRun("survival");

    var stream = BIO.Bank.stream("mcq");
    var shell = UI.gameShell(view, { title:"Survival", sub:"One life · the clock tightens", onQuit: function () { UI.go("/play"); }, progress:false });
    UI._gsRefresh = paint;
    BIO.Tools.attach("survival");

    var st = { n:0, correct:0, xp:0, done:false, review:[], shownAt:0, limitMs:0, deadline:0 };
    var tick = setInterval(function () {
      if (st.done) return;
      if (st.deadline && Date.now() >= st.deadline) timeOut();
      else paint();
    }, 200);

    next();

    function limitFor(n) { return Math.round(Math.max(6000, 22000 - n * 900) * (S.difficulty().time || 1)); }

    function paint() {
      var left = st.deadline ? Math.max(0, st.deadline - Date.now()) : 0;
      shell.setMeters([
        { text:"Q " + (st.n + 1) },
        { text:"⏱ " + (left / 1000).toFixed(1) + "s", hot: left < 4000 },
        { text: st.correct + " survived" },
        { text:"♥ 1", hot: true }
      ]);
    }

    function next() {
      if (st.done) return;
      var q = stream.next();
      if (!q) return finish("Out of questions");
      st.limitMs = limitFor(st.n);
      st.shownAt = Date.now();
      st.deadline = st.shownAt + st.limitMs;
      var host = shell.clear();
      paint();

      host.appendChild(U.el("div", { class:"muted2 small", text:"You have " + (st.limitMs / 1000).toFixed(1) + " seconds." }));
      UI.renderMCQ(host, q, function (ok) {
        st.deadline = 0;
        st.n++;
        if (ok) {
          st.correct++;
          if (Date.now() - st.shownAt >= UI.readFloor(q.q)) S.bump("readCorrect");
          if (Date.now() - st.shownAt >= UI.readFloor(q.q)) st.xp += S.XP_PER_CORRECT * (q.diff || 1) * (1 + st.correct * 0.06);
          S.markSeen(q.id, true, q);
          host.appendChild(U.el("div", { class:"row", style:"margin-top:14px" }, [
            U.el("button", { class:"btn btn-primary btn-block", onclick: next }, "Next — " + (limitFor(st.n) / 1000).toFixed(1) + "s")
          ]));
          paint();
        } else {
          S.markSeen(q.id, false, q);
          st.review.push({ ok:false, q: U.trunc(q.q, 120), mod: q.mod, a: q.options[q.answer], why: q.why });
          host.appendChild(U.el("div", { class:"row", style:"margin-top:14px" }, [
            U.el("button", { class:"btn btn-primary btn-block", onclick: function () { finish("Eliminated"); } }, "See results")
          ]));
        }
      });
    }

    function timeOut() {
      if (st.done) return;
      st.deadline = 0;
      finish("Out of time");
    }

    function finish(reason) {
      if (st.done) return;
      st.done = true;
      clearInterval(tick);
      UI._gsRefresh = null;
      var acc = st.n ? st.correct / st.n : 0;
      var rec = UI.award({ xp: Math.round(st.xp), accuracy: acc, mode:"survival", score: st.correct });
      rec.questions = st.n;
      if (st.correct > (S.data.stats.survivalBest || 0)) { S.data.stats.survivalBest = st.correct; S.save(); }
      if (BIO.Achievements) BIO.Achievements.check(rec);

      UI.results(view, {
        title: reason, subtitle:"You survived " + U.plural(st.correct, "question"),
        correct: st.correct, total: Math.max(1, st.n),
        rows:[
          ["Survived", String(st.correct)],
          ["Personal best", U.fmtInt(S.data.bests.survival || 0)],
          ["XP earned", U.fmtInt(rec.xp) + " XP  ·  " + U.fmtInt(rec.coins) + " ◉"]
        ],
        review: st.review,
        again: function () { UI.render(); }
      });
    }

    return function () { st.done = true; clearInterval(tick); UI._gsRefresh = null; BIO.Tools.detach(); UI.hideTabs(false); };
  });
})(typeof window !== "undefined" ? window : globalThis);
