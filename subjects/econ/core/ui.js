/* Economics — js/core/ui.js (StudyQuest port)

   ECON.UI is the app's bound UI (SQ.UI.bind("econ")) plus the handful of
   Economics helpers its modes were written against:

     route(path, fn(view, r))   Economics' path router ("/play/drill?mod=P3"),
                                dispatched from the core router's first segment
     award(opts)                Economics' reward options mapped onto SQ.UI.award
     shell(view, cfg)           the old gameShell(view, cfg) over the core one
     report(view, cfg)          the old full-screen results + the core results modal
     modal / toast / confirm    accept the old signatures as well as the core ones
     renderMCQ, explain, streakBadge

   There is still exactly one reward path: award() here computes nothing that
   pays — it forwards to SQ.UI.award, which applies difficulty, prestige, the
   ×4 cap, the tool-tray crutch, coin rate, Stars and achievements.
   Exposes: window.ECON.UI */
(function (root) {
  "use strict";

  var ECON = root.ECON = root.ECON || {};
  var U = ECON.U, S = ECON.State;

  var B = SQ.UI.bind("econ", {
    nav: [
      { key: "home", icon: "📊", label: "Home" },
      { key: "play", icon: "🎮", label: "Play" },
      { key: "study", icon: "🗂️", label: "Study" },
      { key: "progress", icon: "📈", label: "Progress" },
      { key: "shop", icon: "🛒", label: "Shop" }
    ],
    navMap: { game: "play", boss: "play", cards: "study", atlas: "study", reference: "study", options: "progress" },
    coinRate: 0.75,
    tools: { calc: true, sheet: true, pad: true }
  });
  var coreRoute = B.route, coreModal = B.modal, coreToast = B.toast, coreConfirm = B.confirmDialog;

  var UI = B;

  /* ── routing ─────────────────────────────────────────────────────────
     Economics routes are paths with an optional query. The core router hands
     over (name, args); rebuild the path and look it up. Each screen renders
     into a `.econ-app` wrapper so Economics' component CSS stays inside it. */
  var table = {};
  var registered = {};

  function parse(name, args) {
    var raw = "/" + [name].concat(args || []).join("/");
    var qi = raw.indexOf("?");
    var path = qi >= 0 ? raw.slice(0, qi) : raw;
    var query = {};
    if (qi >= 0) raw.slice(qi + 1).split("&").forEach(function (kv) {
      if (!kv) return;
      var p = kv.split("=");
      query[decodeURIComponent(p[0])] = decodeURIComponent((p[1] || "").replace(/\+/g, " "));
    });
    var parts = path.split("/").filter(Boolean);
    return { path: "/" + parts.join("/"), parts: parts, query: query };
  }

  function dispatch(name) {
    return function (view, args) {
      var r = parse(name, args);
      var fn = table[r.path] || table["/" + (r.parts[0] || "home")] || table["/home"];
      var host = U.el("div", { class: "econ-app" });
      view.appendChild(host);
      UI._current = r;
      try {
        return fn(host, r);
      } catch (e) {
        console.error("econ route error", r.path, e);
        host.appendChild(U.el("div", { class: "card" }, [
          U.el("h2", { text: "Something went wrong" }),
          U.el("p", { class: "muted small", text: String(e && e.message || e) }),
          U.el("button", { class: "btn btn-primary", onclick: function () { UI.go("/home"); } }, "Back to Economics")
        ]));
      }
    };
  }

  UI.route = function (path, fn) {
    var p = "/" + String(path).replace(/^\/+/, "");
    table[p] = fn;
    var first = p.split("/")[1] || "home";
    if (!registered[first]) { registered[first] = true; coreRoute(first, dispatch(first)); }
  };
  /** Register a core route that renders OUTSIDE the .econ-app wrapper (the shop). */
  UI.coreRoute = coreRoute;
  UI.render = function () { SQ.UI.handleRoute(); };
  UI.hideTabs = function () {};
  UI.syncChrome = function () { B.syncHeader(); };

  /* ── toasts / modals, old and new signatures ─────────────────────── */
  UI.toast = function (msg, kind, ms) {
    if (msg && typeof msg === "object") return coreToast(msg);
    var k = kind === "good" ? "good" : kind === "bad" ? "bad" : "";
    return coreToast({ text: U.esc(msg), kind: k, ms: ms || 2200, icon: k === "bad" ? "⚠" : k === "good" ? "✓" : "ℹ️" });
  };

  UI.modal = function (opts, o2) {
    if (!opts || typeof opts === "string" || opts.nodeType) return coreModal(opts, o2);
    var box = U.el("div", { class: "econ-app econ-modal" });
    if (opts.title) box.appendChild(U.el("h2", { text: opts.title }));
    if (opts.body) box.appendChild(typeof opts.body === "string" ? U.el("p", { text: opts.body }) : opts.body);
    if (opts.actions && opts.actions.length) {
      var row = U.el("div", { class: "row", style: "margin-top:14px" });
      opts.actions.forEach(function (a) {
        row.appendChild(U.el("button", {
          class: "btn " + (a.kind ? "btn-" + a.kind : "") + (opts.actions.length <= 2 ? " grow" : ""),
          onclick: function () { if (!a.keepOpen) B.closeModal(); if (a.onclick) a.onclick(); }
        }, a.label));
      });
      box.appendChild(row);
    } else if (!opts.noClose) {
      box.appendChild(U.el("button", { class: "btn btn-block", style: "margin-top:12px", onclick: function () { B.closeModal(); } }, "Close"));
    }
    coreModal(box, { sticky: !!opts.noClose, onClose: opts.onClose, stack: B.modalOpen() });
    return box;
  };

  UI.confirm = function (title, body, onYes, yesLabel) {
    coreConfirm(title, U.esc(body), onYes, yesLabel);
  };

  /* ═══════════════════════════════════════════════════════════════════
     award() — Economics' options onto the one reward path.

     opts: xp (netted per-answer XP), bonus, accuracy, readRatio, questions,
           boost (2 while the Double XP power-up is armed), mode, score, silent
     The Economics gate that the core does not have stays here: a run answered
     faster than it can be read (readRatio < 0.5) forfeits its completion
     bonus. Everything else is the core's. Coins follow Economics' rule —
     75% of the XP the run actually pays — so they are predicted with the
     core's own multiplier and passed at face value for the 0.75 coin rate.
     ═══════════════════════════════════════════════════════════════════ */
  UI._awardLog = [];

  UI.award = function (opts) {
    var o = opts || {};
    var acc = (typeof o.accuracy === "number") ? U.clamp(o.accuracy, 0, 1) : null;
    var base = Math.max(0, Math.round(o.xp || 0));
    var bonus = Math.max(0, Math.round(o.bonus || 0));
    var readRatio = (typeof o.readRatio === "number") ? o.readRatio : null;
    if (readRatio !== null && readRatio < 0.5) bonus = 0;
    var answered = (typeof o.questions === "number") ? o.questions : undefined;

    /* mirror of the core's bonus gate, for the results rows only */
    var bonusShown = bonus;
    if (acc !== null) bonusShown = acc < SQ.UI.MIN_BONUS_ACCURACY ? 0 : Math.round(bonus * acc);
    if (answered !== undefined && answered < 5) bonusShown = 0;

    var boost = o.boost || 1;
    var mult = Math.min(SQ.Economy.MAX_MULTIPLIER, S.xpMultiplier() * boost);
    var crutch = B.formulaPenalty();
    var predicted = Math.max(0, Math.round((base + bonusShown) * mult * crutch));

    /* bookkeeping first, so the achievement check inside award() sees it */
    if (o.mode) {
      S.bump("runs");
      S.markMode(o.mode);
      if (typeof o.score === "number") S.recordScore(o.mode, o.score);
      if (answered !== undefined && answered >= 5 && acc === 1) S.bump("perfectRuns");
      if (answered !== undefined && answered >= 10 && acc !== null && acc >= 0.9) S.bump("acc90Runs");
      if (o.mode === "drill" && acc === 1 && crutch === 1 && answered >= 15) S.bump("honestRuns");
      /* the daily only moves on a run that earned something by answering */
      if (base > 0 && typeof o.score === "number" && o.score > 0) S.progressDaily(o.mode, o.score);
      S.touchStreak();
    }

    var got = SQ.UI.award("econ", {
      xp: base, bonus: bonus, accuracy: acc === null ? undefined : acc, answered: answered,
      boost: boost, coins: predicted, silent: o.silent, at: o.at
    });
    if (got.xp > (S.data.stats.bestRunXp || 0)) { S.data.stats.bestRunXp = got.xp; S.save(); }

    var pre = Math.round((base + bonusShown) * mult);
    var rec = {
      t: Date.now(), mode: o.mode || null, base: base, bonus: bonusShown,
      bonusWithheld: Math.max(0, Math.round(o.bonus || 0) - bonusShown),
      refPenalty: crutch < 1 ? Math.max(0, pre - got.xp) : 0,
      xp: got.xp, coins: got.coins, stars: got.stars,
      multiplier: got.multiplier, multBonus: Math.max(0, pre - (base + bonusShown)),
      accuracy: acc, readRatio: readRatio, questions: answered,
      levelsGained: got.levelsGained
    };
    UI._awardLog.push(rec);
    if (UI._awardLog.length > 400) UI._awardLog.shift();
    return rec;
  };

  /* ═══════════════════════════════════════════════════════════════════
     shell(view, cfg) — the old gameShell over the core one.
     cfg: title, sub, onQuit (→ confirm on exit), progress:false, tools, help, backTo
     ═══════════════════════════════════════════════════════════════════ */
  UI.shell = function (view, cfg) {
    var gs = B.gameShell(cfg.title, {
      backTo: cfg.backTo || "/play", confirmExit: !!cfg.onQuit, help: cfg.help,
      tools: cfg.tools, scored: cfg.scored
    });
    view.appendChild(gs.root);
    var head = U.el("div", { class: "gs-head" });
    if (cfg.sub) head.appendChild(U.el("div", { class: "muted2 gs-sub", text: cfg.sub }));
    var meters = U.el("div", { class: "gs-meters" });
    var prog = U.el("div", { class: "gs-prog" }, [U.el("i")]);
    head.appendChild(meters);
    if (cfg.progress !== false) head.appendChild(prog);
    var body = U.el("div", { class: "gs-body" });
    gs.body.appendChild(head);
    gs.body.appendChild(body);
    return {
      head: head, body: body, meters: meters, core: gs,
      setMeters: function (items) {
        U.clear(meters);
        items.forEach(function (m) {
          if (!m) return;
          meters.appendChild(U.el("span", { class: "gs-meter" + (m.hot ? " hot" : ""), text: m.text }));
        });
        var pen = B.formulaPenalty();
        if (pen < 1) meters.appendChild(U.el("span", { class: "gs-meter warn", text: "Reference ×" + pen.toFixed(2) }));
      },
      setProgress: function (f) { prog.firstChild.style.width = U.clamp(f, 0, 1) * 100 + "%"; },
      clear: function () { U.clear(body); return body; }
    };
  };

  /* ── report(view, cfg) — the results ─────────────────────────────────
     H1 from the stand-alone app: never open results over an explanation the
     student is still reading. So the run screen is replaced by the full
     Economics results (rows + review) first, and the core results modal opens
     over THAT; "Review the working" closes it onto the review list. */
  UI.report = function (view, cfg) {
    U.clear(view);
    var rec = cfg.rec || {};
    var acc = cfg.total ? cfg.correct / cfg.total : 0;
    var card = U.el("div", { class: "card center" }, [
      U.el("div", { style: "font-size:34px", text: acc >= 0.9 ? "🏅" : acc >= 0.6 ? "📈" : "📉" }),
      U.el("h1", { text: cfg.title || "Run complete", style: "margin:6px 0 2px" }),
      U.el("div", { class: "muted", text: cfg.subtitle || (cfg.correct + " / " + cfg.total + " correct · " + Math.round(acc * 100) + "%") })
    ]);
    var stats = U.el("div", { class: "list", style: "margin-top:12px" });
    (cfg.rows || []).forEach(function (r) {
      stats.appendChild(U.el("div", { class: "li" }, [
        U.el("div", { class: "grow", text: r[0] }),
        U.el("b", { text: r[1], style: "text-align:right" })
      ]));
    });
    card.appendChild(stats);
    view.appendChild(card);

    if (cfg.review && cfg.review.length) {
      view.appendChild(U.el("h2", { text: "Review" }));
      cfg.review.forEach(function (r) {
        view.appendChild(U.el("div", { class: "card card-tight" }, [
          U.el("div", { class: "spread" }, [
            U.el("span", { class: "badge " + (r.ok ? "badge-good" : "badge-bad"), text: r.ok ? "Right" : "Missed" }),
            U.el("span", { class: "badge", text: r.mod || "" })
          ]),
          U.el("div", { style: "margin-top:6px;font-weight:600;font-size:14.5px", text: r.q }),
          r.a ? U.el("div", { class: "small muted", style: "margin-top:4px", text: "Answer: " + r.a }) : null,
          r.why ? U.el("div", { class: "small muted2", style: "margin-top:4px", text: r.why }) : null
        ]));
      });
    }
    var row = U.el("div", { class: "row", style: "margin-top:14px" });
    if (cfg.again) row.appendChild(U.el("button", { class: "btn btn-primary grow js-again-inline", onclick: cfg.again }, "Play again"));
    row.appendChild(U.el("button", { class: "btn grow", onclick: function () { UI.go(cfg.backTo || "/play"); } }, "Back to modes"));
    view.appendChild(row);

    B.results({
      title: cfg.title || "Run complete",
      correct: cfg.correct, total: cfg.total,
      xp: rec.xp || 0, coins: rec.coins || 0, stars: rec.stars,
      extraStats: cfg.extraStats || [],
      newBest: cfg.newBest, blurb: cfg.blurb,
      onAgain: cfg.again, onReview: true, backTo: cfg.backTo || "/play"
    });
  };

  /* ── shared question renderer (MCQ) ─────────────────────────────── */
  UI.renderMCQ = function (host, q, onAnswer, opts) {
    opts = opts || {};
    U.clear(host);
    var answered = false;

    if (!opts.hideMeta) {
      host.appendChild(U.el("div", { class: "qmeta" }, [
        U.el("span", { class: "badge badge-accent", text: q.mod }),
        q.topic ? U.el("span", { class: "badge", text: U.trunc(q.topic, 28) }) : null,
        q.diff ? U.el("span", { class: "badge", text: "×" + q.diff }) : null
      ]));
    }
    if (q.stem) host.appendChild(U.el("div", { class: "card card-tight small muted", html: q.stem }));
    host.appendChild(U.el("div", { class: "qtext", text: q.q }));
    if (q.figure && ECON.Diagram) host.appendChild(ECON.Diagram.staticFigure(q.figure));

    var order = opts.order || U.shuffle(q.options.map(function (_, i) { return i; }));
    var box = U.el("div", { class: "opts" });
    var btns = [];

    order.forEach(function (oi, n) {
      var b = U.el("button", { class: "opt", type: "button", dataset: { oi: String(oi) } }, [
        U.el("span", { class: "k", text: "ABCD".charAt(n) }),
        U.el("span", { class: "grow", text: q.options[oi] })
      ]);
      b.addEventListener("click", function () {
        if (answered) return;
        answered = true;
        var chosen = +b.dataset.oi;
        var ok = chosen === q.answer;
        btns.forEach(function (bb) {
          bb.disabled = true;
          if (+bb.dataset.oi === q.answer) bb.classList.add("right");
          else if (bb === b) bb.classList.add("wrong");
          else bb.classList.add("dim");
        });
        if (SQ.Sound) { if (ok) SQ.Sound.correct(); else SQ.Sound.wrong(); }
        host.appendChild(explain(q, ok, chosen));
        if (onAnswer) onAnswer(ok, chosen, q);
      });
      btns.push(b);
      box.appendChild(b);
    });
    host.appendChild(box);
    return { buttons: btns, order: order, box: box };
  };

  function explain(q, ok, chosen) {
    var w = U.el("div", { class: "why " + (ok ? "ok" : "no") });
    w.appendChild(U.el("div", { class: "why-h", text: ok ? "Correct" : "Not quite" }));
    w.appendChild(U.el("div", { text: q.why || q.options[q.answer] }));
    if (!ok && q.distractors && q.distractors[chosen]) {
      w.appendChild(U.el("div", { class: "misc", text: "Why your option is wrong: " + q.distractors[chosen] }));
    }
    if (!ok && q.misconception) {
      w.appendChild(U.el("div", { class: "misc", text: "Common trap: " + q.misconception }));
    }
    return w;
  }
  UI.explain = explain;

  UI.streakBadge = function (streak) {
    var m = S.streakMult(streak);
    return "×" + (m % 1 ? m.toFixed(1) : m);
  };

  /* ── keyboard play: 1–4 / A–D pick an option, Enter continues ───── */
  document.addEventListener("keydown", function (e) {
    if (document.documentElement.dataset.subject !== "econ") return;
    if (B.modalOpen()) return;
    var t = e.target;
    if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    var view = document.querySelector("#view");
    if (!view) return;
    var k = e.key.toLowerCase();
    var idx = "1234".indexOf(k) >= 0 ? "1234".indexOf(k) : "abcd".indexOf(k);
    if (idx >= 0 && k.length === 1) {
      var boxes = view.querySelectorAll(".opts");
      var box = boxes[boxes.length - 1];
      var opts = box ? box.querySelectorAll(".opt") : [];
      if (opts[idx] && !opts[idx].disabled) { e.preventDefault(); opts[idx].click(); }
      return;
    }
    if (e.key === "Enter") {
      var live = view.querySelector(".opt:not([disabled])");
      if (live) return;
      var btns = view.querySelectorAll(".gs-body .btn-primary:not([disabled])");
      var nb = btns[btns.length - 1];
      if (nb) { e.preventDefault(); nb.click(); }
    }
  });

  ECON.UI = UI;
  ECON.Sound = SQ.Sound;
  ECON.FX = SQ.FX;
})(typeof window !== "undefined" ? window : globalThis);
