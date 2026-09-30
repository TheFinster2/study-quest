/* Punnett Lab — the flagship. Build the cross, fill the grid, predict the ratio.
   Every answer is computed by js/core/genetics.js and confirmed by a second,
   independent route before it is shown (brief §5.2). */
(function (root) {
  "use strict";
  var BIO = root.BIO, U = BIO.U, UI = BIO.UI, S = BIO.State, G = BIO.Genetics, R = BIO.Run;

  R.register({
    id:"punnett", name:"Punnett Lab", icon:"🧬", route:"/play/punnett",
    blurb:"Build the cross, fill the grid, predict the ratio. Unlimited questions.",
    group:"Genetics"
  });

  var ROUND = 6;

  UI.route("/play/punnett", function (view) {
    var templates = BIO.DATA.gen_templates.filter(function (t) { return !BIO.Coverage.isHiddenItem(t); });
    if (!templates.length) { BIO.Coverage.warnIfEmpty("gentpl"); return; }

    BIO.Tools.startRun("punnett");
    var shell = UI.gameShell(view, { title:"Punnett Lab", sub:"Build the cross and predict the outcome", onQuit: function () { UI.go("/play"); } });
    UI._gsRefresh = paint;
    BIO.Tools.attach("punnett");

    var st = { i:0, counted:0, correct:0, answered:0, xp:0, review:[], done:false, shownAt:0 };
    next();

    function paint() {
      shell.setMeters([{ text:"Q " + Math.min(st.i + 1, ROUND) + "/" + ROUND }, { text: st.correct + " correct" }]);
      shell.setProgress(st.i / ROUND);
    }

    function next() {
      if (st.done) return;
      if (st.i >= ROUND) return finish();
      paint();

      var tpl = U.pick(templates);
      var parents = U.pick(tpl.parentSets);
      var spec = { kind: tpl.kind, parents: parents, loci: tpl.loci };

      // ── two-route verification, live. A cross that fails is never shown.
      var mismatch = G.verifyCross(spec);
      if (mismatch) { console.error("genetics verification failed", tpl.id, parents, mismatch); return next(); }

      var res = G.cross(spec);
      st.shownAt = Date.now();
      var host = shell.clear();

      host.appendChild(U.el("div", { class:"qmeta" }, [
        U.el("span", { class:"badge badge-accent", text: tpl.mod }),
        U.el("span", { class:"badge", text: U.trunc(tpl.title, 30) }),
        U.el("span", { class:"badge", text:"×" + tpl.diff })
      ]));
      host.appendChild(U.el("div", { class:"card card-tight small muted", text: tpl.context }));
      host.appendChild(U.el("div", { class:"qtext", text: "Cross:  " + res.parents[0] + "  ×  " + res.parents[1] }));

      var gridHost = U.el("div");
      host.appendChild(gridHost);
      renderGrid(gridHost, res, false);

      // pick the ask
      var ask = U.pick(tpl.asks.filter(function (a) { return a !== "grid" || res.total <= 16; }));
      var qa = buildQuestion(ask, res, tpl);
      host.appendChild(U.el("div", { class:"qtext", style:"font-size:16px", text: qa.q }));

      var box = U.el("div", { class:"opts" });
      var order = U.shuffle(qa.options.map(function (_, k) { return k; }));
      var btns = [], answered = false;

      order.forEach(function (oi, n) {
        var b = U.el("button", { class:"opt", type:"button" }, [
          U.el("span", { class:"k", text:"ABCD".charAt(n) }),
          U.el("span", { class:"grow", text: qa.options[oi] })
        ]);
        b.addEventListener("click", function () {
          if (answered) return;
          answered = true;
          var ok = oi === qa.answer;
          btns.forEach(function (bb, j) {
            bb.disabled = true;
            if (order[j] === qa.answer) bb.classList.add("right");
            else if (bb === b) bb.classList.add("wrong");
            else bb.classList.add("dim");
          });
          score(ok, qa, tpl);
          var w = U.el("div", { class:"why " + (ok ? "ok" : "no") });
          w.appendChild(U.el("div", { class:"why-h", text: ok ? "Correct" : "Not quite" }));
          w.appendChild(U.el("div", { text: qa.why }));
          host.appendChild(w);
          U.clear(gridHost);
          renderGrid(gridHost, res, true);
          host.appendChild(U.el("div", { class:"row", style:"margin-top:14px" }, [
            U.el("button", { class:"btn btn-primary btn-block", onclick: function () { st.i++; next(); } },
              st.i + 1 >= ROUND ? "See results" : "Next cross")
          ]));
        });
        btns.push(b); box.appendChild(b);
      });
      host.appendChild(box);
    }

    function score(ok, qa, tpl) {
      st.answered++;
      var counts = (Date.now() - st.shownAt) >= UI.readFloor(qa.q);
      if (counts) st.counted++;
      if (ok) {
        st.correct++;
        if (counts) { st.xp += S.XP_PER_CORRECT * (tpl.diff || 2); S.bump("punnettSolved"); S.bump("readCorrect"); }
      }
      S.noteAnswer(tpl.mod, ok, "Punnett crosses");
      st.review.push({ ok: ok, q: qa.q, mod: tpl.mod, a: qa.options[qa.answer], why: qa.why });
      S.saveSoon();
    }

    function finish() {
      if (st.done) return;
      st.done = true;
      UI._gsRefresh = null;
      var acc = st.answered ? st.correct / st.answered : 0;
      var rec = UI.award({ xp: Math.round(st.xp), bonus: 150, readRatio: st.answered ? st.counted / st.answered : 0, accuracy: acc, mode:"punnett", score: st.correct });
      rec.questions = st.answered;
      if (BIO.Achievements) BIO.Achievements.check(rec);

      var rows = [
        ["Crosses solved", st.correct + " / " + st.answered],
        ["Accuracy", Math.round(acc * 100) + "%"],
        ["XP from answers", U.fmtInt(Math.round(st.xp))],
        ["Completion bonus", !rec.bonus ? "0  (withheld below 50%)" : "+" + U.fmtInt(rec.bonus)]
      ];
      if (rec.refPenalty) rows.push(["Reference penalty", "−" + U.fmtInt(rec.refPenalty) + " XP"]);
      rows.push(["Total earned", U.fmtInt(rec.xp) + " XP  ·  " + U.fmtInt(rec.coins) + " ◉"]);
      rows.push(["Lifetime crosses", U.fmtInt(S.data.stats.punnettSolved || 0)]);

      UI.results(view, {
        title:"Punnett Lab complete", correct: st.correct, total: st.answered,
        rows: rows, review: st.review.filter(function (r) { return !r.ok; }),
        again: function () { UI.render(); }
      });
    }

    return function () { st.done = true; UI._gsRefresh = null; BIO.Tools.detach(); UI.hideTabs(false); };
  });

  /* ── the grid ────────────────────────────────────────────────────── */
  function renderGrid(host, res, reveal) {
    var cols = res.gametesB.length, rowsN = res.gametesA.length;
    var g = U.el("div", { class:"pn", style:"grid-template-columns:repeat(" + (cols + 1) + ",minmax(0,1fr))" });
    g.appendChild(U.el("div", { class:"pn-cell corner" }));
    res.gametesB.forEach(function (lbl) { g.appendChild(U.el("div", { class:"pn-cell hdr", text: lbl })); });
    for (var r = 0; r < rowsN; r++) {
      g.appendChild(U.el("div", { class:"pn-cell hdr", text: res.gametesA[r] }));
      for (var c = 0; c < cols; c++) {
        var cell = res.grid[r][c];
        g.appendChild(U.el("div", { class:"pn-cell" + (reveal ? "" : " blank"), text: reveal ? cell.geno : "?" }));
      }
    }
    host.appendChild(g);
    if (reveal) {
      var leg = U.el("div", { class:"dg-legend", style:"margin-top:8px" });
      res.phenotypeOrder.forEach(function (p) {
        leg.appendChild(U.el("div", {}, [
          U.el("b", { text: res.phenotypes[p] + "/" + res.total + "  " }),
          U.el("span", { text: p })
        ]));
      });
      host.appendChild(leg);
    }
  }

  /* ── question builders. Every answer comes from the engine. ───────── */
  function buildQuestion(ask, res, tpl) {
    if (ask === "ratio") {
      var right = res.ratio;
      var pool = ["9:3:3:1","3:1","1:1","1:2:1","1:1:1:1","2:1:1","1:1:1:1:1:1","4:3:1","9:7","1:3"];
      var opts = U.uniq([right].concat(U.shuffle(pool).filter(function (x) { return x !== right; }))).slice(0, 4);
      opts = U.shuffle(opts);
      return {
        q:"What is the expected PHENOTYPIC ratio of the offspring?",
        options: opts, answer: opts.indexOf(right),
        why:"Counting the grid gives " + res.phenotypeOrder.map(function (p) { return res.phenotypes[p] + " " + p; }).join(", ") +
             " — a ratio of " + right + ". Multiplying the independent single-locus probabilities gives the same answer."
      };
    }

    if (ask === "pGeno") {
      var gk = U.pick(res.genotypeOrder);
      var pv = res.genotypes[gk] / res.total;
      return numericQuestion("What proportion of the offspring are expected to have the genotype " + gk + "?", pv,
        res.genotypes[gk] + " of the " + res.total + " boxes give " + gk + ", which is " + frac(pv) + ".");
    }

    if (ask === "sexSplit") {
      var males = res.phenotypeOrder.filter(function (p) { return /^male/.test(p); });
      var target = males.length ? U.pick(males) : U.pick(res.phenotypeOrder);
      var totalMale = res.phenotypeOrder.reduce(function (a, p) { return a + (/^male/.test(p) ? res.phenotypes[p] : 0); }, 0);
      if (/^male/.test(target) && totalMale) {
        var pm = res.phenotypes[target] / totalMale;
        return numericQuestion("What proportion of the SONS are expected to show " + target.replace(/^male /, "") + "?", pm,
          res.phenotypes[target] + " of the " + totalMale + " male boxes show this, which is " + frac(pm) +
          ". Note that as a proportion of ALL children it would be " + frac(res.phenotypes[target] / res.total) + " — read which the question asks for.");
      }
    }

    if (ask === "interpret") {
      return interpretQuestion(res, tpl);
    }

    // default: pPheno
    var ph = U.pick(res.phenotypeOrder);
    var p = res.phenotypes[ph] / res.total;
    return numericQuestion("What is the probability that an offspring shows the phenotype “" + ph + "”?", p,
      res.phenotypes[ph] + " of the " + res.total + " boxes give " + ph + ", which is " + frac(p) + ".");
  }

  function numericQuestion(q, value, why) {
    var right = frac(value);
    var candidates = [0, 1 / 8, 1 / 6, 1 / 4, 1 / 3, 3 / 8, 1 / 2, 9 / 16, 5 / 8, 2 / 3, 3 / 4, 7 / 8, 1];
    var wrong = U.shuffle(candidates.filter(function (v) { return Math.abs(v - value) > 1e-9; })).slice(0, 3).map(frac);
    var opts = U.shuffle(U.uniq([right].concat(wrong)).slice(0, 4));
    return { q: q, options: opts, answer: opts.indexOf(right), why: why };
  }

  function interpretQuestion(res, tpl) {
    var type = tpl.loci[0].type;
    var right, pool;
    if (type === "incomplete") {
      right = "Incomplete dominance — the heterozygote is an intermediate blend";
      pool = ["Codominance — both phenotypes appear separately in the heterozygote",
              "Complete dominance — the heterozygote looks like the homozygous dominant",
              "Sex linkage — the gene is on the X chromosome"];
    } else if (type === "codominant") {
      right = "Codominance — both alleles are fully expressed and both phenotypes are visible";
      pool = ["Incomplete dominance — the heterozygote is an intermediate blend",
              "Complete dominance — the heterozygote looks like the homozygous dominant",
              "Multiple alleles with one recessive"];
    } else if (type === "abo") {
      right = "Multiple alleles, with A and B codominant and both dominant to i";
      pool = ["Two alleles showing complete dominance",
              "Incomplete dominance producing a blended phenotype",
              "X-linked inheritance"];
    } else {
      right = "Complete dominance — the heterozygote shows the dominant phenotype";
      pool = ["Incomplete dominance — the heterozygote is an intermediate blend",
              "Codominance — both phenotypes appear separately",
              "Sex linkage — the gene is on the X chromosome"];
    }
    var opts = U.shuffle([right].concat(pool.slice(0, 3)));
    return {
      q:"Which pattern of inheritance does this cross demonstrate?",
      options: opts, answer: opts.indexOf(right),
      why: right + ". The phenotypes produced were: " + res.phenotypeOrder.join(", ") + "."
    };
  }

  /* Exact fraction rendering, so the option text and the engine agree. */
  function frac(v) {
    if (Math.abs(v) < 1e-12) return "0";
    if (Math.abs(v - 1) < 1e-12) return "1 (all)";
    for (var d = 2; d <= 64; d++) {
      var n = v * d;
      if (Math.abs(n - Math.round(n)) < 1e-9) {
        n = Math.round(n);
        var g = U.gcd(n, d);
        return (n / g) + "/" + (d / g) + "  (" + Math.round(v * 100) + "%)";
      }
    }
    return U.fmtNum(v, 3);
  }

  BIO.PunnettFrac = frac;
})(typeof window !== "undefined" ? window : globalThis);
