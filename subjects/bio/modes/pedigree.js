/* Pedigree Detective — infer the inheritance pattern, then predict a cross.

   Every pedigree here is generated from a known pattern and then checked by
   inference against every candidate pattern. A pedigree where two patterns
   both fit is discarded and regenerated (brief §5.2).

   Where a unique answer is mathematically impossible — autosomal recessive
   always explains everything X-linked recessive explains — the question either
   states that the gene is X-linked (narrowing the candidates honestly) or asks
   the exactly-checkable question instead: which patterns does this pedigree
   RULE OUT. See the note in genetics.js. */
(function (root) {
  "use strict";
  var BIO = root.BIO, U = BIO.U, UI = BIO.UI, S = BIO.State, G = BIO.Genetics, R = BIO.Run;

  R.register({
    id:"pedigree", name:"Pedigree Detective", icon:"🌳", route:"/play/pedigree",
    blurb:"Read the family tree. Name the pattern, rule patterns out, or predict the next child.",
    group:"Genetics"
  });

  var ROUND = 5;
  var NAMES = {}; G.PATTERNS.forEach(function (p) { NAMES[p.id] = p.name; });

  UI.route("/play/pedigree", function (view) {
    var templates = (BIO.DATA.gen_pedigrees || []).filter(function (t) { return !BIO.Coverage.isHiddenItem(t); });
    if (!templates.length) { BIO.Coverage.warnIfEmpty("gentpl"); return; }

    BIO.Tools.startRun("pedigree");
    var shell = UI.gameShell(view, { title:"Pedigree Detective", sub:"Read the family tree", onQuit: function () { UI.go("/play"); } });
    UI._gsRefresh = paint;
    BIO.Tools.attach("pedigree");

    var st = { i:0, counted:0, correct:0, answered:0, xp:0, review:[], done:false, shownAt:0, seed: (Date.now() % 100000) | 0 };
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
      var built = build(tpl, st.seed++);
      if (!built) return next();      // regenerate rather than ship an ambiguous pedigree

      st.shownAt = Date.now();
      var host = shell.clear();
      host.appendChild(U.el("div", { class:"qmeta" }, [
        U.el("span", { class:"badge badge-accent", text:"M5" }),
        U.el("span", { class:"badge", text: tpl.title }),
        U.el("span", { class:"badge", text:"×" + tpl.diff })
      ]));
      host.appendChild(U.el("div", { class:"card card-tight small muted", text: tpl.context }));
      host.appendChild(drawPedigree(built.ped));
      host.appendChild(legend());

      if (built.mode === "eliminate") askEliminate(host, tpl, built);
      else askSingle(host, tpl, built);
    }

    /* ── build a question from a template ────────────────────────── */
    function build(tpl, seed) {
      if (tpl.mode === "eliminate") {
        var ped = G.generatePedigreeForElimination(tpl.pattern, seed);
        if (!ped) return null;
        return { mode:"eliminate", ped: ped, excluded: ped.excluded, consistent: ped.allConsistent };
      }

      var cands = tpl.candidates || G.CANDIDATE_SETS.all;
      var p = G.generatePedigree(tpl.pattern, seed, cands);
      if (!p) return null;

      if (tpl.mode === "predict") {
        var couples = G.uniqueCouple(p, tpl.pattern);
        if (!couples || !couples.length) return null;
        var couple = couples[couples.length - 1];   // deepest generation reads best
        var risk = G.childRisk(tpl.pattern, couple.fatherGeno, couple.motherGeno);
        return { mode:"predict", ped: p, pattern: tpl.pattern, candidates: cands, couple: couple, risk: risk };
      }
      return { mode:"name", ped: p, pattern: tpl.pattern, candidates: cands };
    }

    /* ── single-answer questions ─────────────────────────────────── */
    function askSingle(host, tpl, built) {
      var qa;
      if (built.mode === "predict") {
        var pv = built.risk.p;
        qa = {
          q:"The pattern is " + NAMES[built.pattern].toLowerCase() + ". " + built.couple.father + " and " +
             built.couple.mother + " have genotypes " + fmtGeno(built.couple.fatherGeno) + " and " +
             fmtGeno(built.couple.motherGeno) + ". What is the probability their next child is affected?",
          options: numOptions(pv),
          why:"Their genotypes are fixed by the rest of the pedigree, so a 2×2 Punnett square gives exactly " +
              BIO.PunnettFrac(pv) + " affected." +
              (built.risk.pMale !== built.risk.pFemale
                ? " Split by sex: " + BIO.PunnettFrac(built.risk.pMale) + " of sons and " +
                  BIO.PunnettFrac(built.risk.pFemale) + " of daughters."
                : "")
        };
        qa.answer = qa.options.indexOf(BIO.PunnettFrac(pv));
      } else {
        var right = NAMES[built.pattern];
        var opts = built.candidates.map(function (c) { return NAMES[c]; });
        if (opts.length < 4) {
          G.PATTERNS.forEach(function (p) { if (opts.indexOf(p.name) < 0 && opts.length < 4) opts.push(p.name); });
        }
        opts = U.shuffle(opts.slice(0, 4));
        var ev = G.patternEvidence(built.ped, built.pattern);
        qa = {
          q:"Which inheritance pattern does this pedigree show?",
          options: opts, answer: opts.indexOf(right),
          why: right + ". " + ev.join(" "),
          evidence: ev
        };
      }

      var box = U.el("div", { class:"opts" });
      var btns = [], answered = false;
      qa.options.forEach(function (txt, n) {
        var b = U.el("button", { class:"opt", type:"button" }, [
          U.el("span", { class:"k", text:"ABCD".charAt(n) }),
          U.el("span", { class:"grow", text: txt })
        ]);
        b.addEventListener("click", function () {
          if (answered) return;
          answered = true;
          var ok = n === qa.answer;
          btns.forEach(function (bb, j) {
            bb.disabled = true;
            if (j === qa.answer) bb.classList.add("right"); else if (bb === b) bb.classList.add("wrong"); else bb.classList.add("dim");
          });
          resolve(ok, qa, tpl, host, built);
        });
        btns.push(b); box.appendChild(b);
      });
      host.appendChild(U.el("div", { class:"qtext", style:"font-size:16px", text: qa.q }));
      host.appendChild(box);
    }

    /* ── multi-select elimination ────────────────────────────────── */
    function askEliminate(host, tpl, built) {
      host.appendChild(U.el("div", { class:"qtext", style:"font-size:16px",
        text:"Select every inheritance pattern this pedigree makes IMPOSSIBLE." }));
      host.appendChild(U.el("div", { class:"honesty",
        text:"This one has an exact answer. A pattern is impossible only if no assignment of genotypes can explain every individual shown." }));

      var chosen = {};
      var items = G.CANDIDATE_SETS.all.map(function (p) {
        var lab = U.el("label", { class:"crit-item" });
        var cb = U.el("input", { type:"checkbox" });
        cb.addEventListener("change", function () {
          chosen[p] = cb.checked;
          lab.classList.toggle("ticked", cb.checked);
        });
        lab.appendChild(cb);
        lab.appendChild(U.el("span", { class:"grow", text: NAMES[p] }));
        return { p: p, el: lab, cb: cb };
      });
      var list = U.el("div", { class:"crit" });
      items.forEach(function (it) { list.appendChild(it.el); });
      host.appendChild(list);

      var submitted = false;
      var btn = U.el("button", { class:"btn btn-primary btn-block", style:"margin-top:12px" }, "Submit");
      btn.addEventListener("click", function () {
        if (submitted) return;
        submitted = true;
        btn.disabled = true;
        var picked = Object.keys(chosen).filter(function (k) { return chosen[k]; }).sort();
        var right = built.excluded.slice().sort();
        var ok = picked.join(",") === right.join(",");
        items.forEach(function (it) {
          it.cb.disabled = true;
          var shouldBe = right.indexOf(it.p) >= 0;
          it.el.style.borderColor = shouldBe ? "var(--good)" : "var(--line)";
          if (shouldBe) it.el.appendChild(U.el("span", { class:"badge badge-good", text:"impossible" }));
          else it.el.appendChild(U.el("span", { class:"badge", text:"could fit" }));
        });
        var qa = {
          q:"Which patterns are impossible?",
          options:[right.map(function (p) { return NAMES[p]; }).join("; ") || "None"],
          answer:0,
          why:(right.length ? "Ruled out: " + right.map(function (p) { return NAMES[p]; }).join(", ") + ". " : "Nothing is ruled out by this pedigree. ") +
              "Still possible: " + built.consistent.map(function (p) { return NAMES[p]; }).join(", ") + ". " +
              G.patternEvidence(built.ped, built.consistent[0]).join(" ")
        };
        resolve(ok, qa, tpl, host, built);
      });
      host.appendChild(btn);
    }

    function resolve(ok, qa, tpl, host, built) {
      st.answered++;
      var counts = (Date.now() - st.shownAt) >= UI.readFloor(qa.q);
      if (counts) st.counted++;
      if (ok) {
        st.correct++;
        if (counts) { st.xp += S.XP_PER_CORRECT * (tpl.diff || 3); S.bump("pedigreeSolved"); S.bump("readCorrect"); }
      }
      S.noteAnswer("M5", ok, "Pedigrees");
      st.review.push({ ok: ok, q: U.trunc(qa.q, 120), mod:"M5", a: qa.options[qa.answer], why: qa.why });
      S.saveSoon();

      var w = U.el("div", { class:"why " + (ok ? "ok" : "no") });
      w.appendChild(U.el("div", { class:"why-h", text: ok ? "Correct" : "Not quite" }));
      w.appendChild(U.el("div", { text: qa.why }));
      if (built.mode === "name" && built.candidates.length < G.CANDIDATE_SETS.all.length) {
        w.appendChild(U.el("div", { class:"misc",
          text:"Worth knowing: a pedigree alone can never prove sex linkage — autosomal recessive fits every X-linked recessive pedigree. That is why this question told you the gene was on the X." }));
      }
      host.appendChild(w);
      host.appendChild(U.el("div", { class:"row", style:"margin-top:14px" }, [
        U.el("button", { class:"btn btn-primary btn-block", onclick: function () { st.i++; next(); } },
          st.i + 1 >= ROUND ? "See results" : "Next pedigree")
      ]));
    }

    function finish() {
      if (st.done) return;
      st.done = true;
      UI._gsRefresh = null;
      var acc = st.answered ? st.correct / st.answered : 0;
      var rec = UI.award({ xp: Math.round(st.xp), bonus: 160, readRatio: st.answered ? st.counted / st.answered : 0, accuracy: acc, mode:"pedigree", score: st.correct });
      rec.questions = st.answered;
      if (BIO.Achievements) BIO.Achievements.check(rec);

      var rows = [
        ["Pedigrees solved", st.correct + " / " + st.answered],
        ["Accuracy", Math.round(acc * 100) + "%"],
        ["XP from answers", U.fmtInt(Math.round(st.xp))],
        ["Completion bonus", !rec.bonus ? "0  (withheld below 50%)" : "+" + U.fmtInt(rec.bonus)]
      ];
      if (rec.refPenalty) rows.push(["Reference penalty", "−" + U.fmtInt(rec.refPenalty) + " XP"]);
      rows.push(["Total earned", U.fmtInt(rec.xp) + " XP  ·  " + U.fmtInt(rec.coins) + " ◉"]);

      UI.results(view, {
        title:"Pedigree Detective complete", correct: st.correct, total: st.answered,
        rows: rows, review: st.review.filter(function (r) { return !r.ok; }),
        again: function () { UI.render(); }
      });
    }

    return function () { st.done = true; UI._gsRefresh = null; BIO.Tools.detach(); UI.hideTabs(false); };
  });

  function numOptions(v) {
    var right = BIO.PunnettFrac(v);
    var cands = [0, 1 / 8, 1 / 4, 1 / 3, 3 / 8, 1 / 2, 2 / 3, 3 / 4, 1];
    var wrong = U.shuffle(cands.filter(function (x) { return Math.abs(x - v) > 1e-9; })).slice(0, 3).map(BIO.PunnettFrac);
    return U.shuffle(U.uniq([right].concat(wrong)).slice(0, 4));
  }

  function fmtGeno(g) { return g === "--" ? "—" : g; }

  /* ── drawing ─────────────────────────────────────────────────────── */
  function drawPedigree(ped) {
    var byGen = U.groupBy(ped.individuals, function (i) { return i.gen; });
    var gens = Object.keys(byGen).map(Number).sort(function (a, b) { return a - b; });
    var W = 440, rowH = 92, size = 26;
    var H = gens.length * rowH + 24;

    var pos = {};
    gens.forEach(function (g, gi) {
      var list = byGen[g];
      var gap = W / (list.length + 1);
      list.forEach(function (ind, k) {
        pos[ind.id] = { x: Math.round(gap * (k + 1)), y: 34 + gi * rowH };
      });
    });

    var s = "<svg class='ped-svg' viewBox='0 0 " + W + " " + H + "'>";

    // couple lines and sibship drops
    var couples = {};
    ped.individuals.forEach(function (i) {
      if (!i.father || !i.mother) return;
      var key = i.father + "|" + i.mother;
      (couples[key] = couples[key] || { kids: [], f: i.father, m: i.mother }).kids.push(i.id);
    });
    Object.keys(couples).forEach(function (k) {
      var c = couples[k], pf = pos[c.f], pm = pos[c.m];
      if (!pf || !pm) return;
      var midY = pf.y;
      s += "<line class='ped-line' x1='" + pf.x + "' y1='" + midY + "' x2='" + pm.x + "' y2='" + midY + "'/>";
      var midX = (pf.x + pm.x) / 2;
      var dropY = midY + rowH / 2 - 8;
      s += "<line class='ped-line' x1='" + midX + "' y1='" + midY + "' x2='" + midX + "' y2='" + dropY + "'/>";
      var xs = c.kids.map(function (id) { return pos[id].x; });
      s += "<line class='ped-line' x1='" + Math.min.apply(null, xs) + "' y1='" + dropY + "' x2='" + Math.max.apply(null, xs) + "' y2='" + dropY + "'/>";
      c.kids.forEach(function (id) {
        s += "<line class='ped-line' x1='" + pos[id].x + "' y1='" + dropY + "' x2='" + pos[id].x + "' y2='" + (pos[id].y - size / 2) + "'/>";
      });
    });

    ped.individuals.forEach(function (i) {
      var p = pos[i.id];
      var cls = "ped-shape" + (i.affected ? " aff" : "");
      if (i.sex === "M") {
        s += "<rect class='" + cls + "' x='" + (p.x - size / 2) + "' y='" + (p.y - size / 2) + "' width='" + size + "' height='" + size + "' rx='3'/>";
      } else {
        s += "<circle class='" + cls + "' cx='" + p.x + "' cy='" + p.y + "' r='" + (size / 2) + "'/>";
      }
      s += "<text class='ped-id' x='" + p.x + "' y='" + (p.y + size / 2 + 13) + "'>" + i.id + "</text>";
    });

    s += "</svg>";
    var box = U.el("div", { class:"dg-wrap" });
    box.innerHTML = s;
    return box;
  }

  function legend() {
    return U.el("div", { class:"row-tight", style:"margin-top:8px" }, [
      U.el("span", { class:"badge", text:"■ male" }),
      U.el("span", { class:"badge", text:"● female" }),
      U.el("span", { class:"badge badge-accent", text:"filled = affected" })
    ]);
  }
})(typeof window !== "undefined" ? window : globalThis);
