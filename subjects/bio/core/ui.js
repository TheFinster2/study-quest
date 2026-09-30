/* Biosphere — subjects/bio/core/ui.js
   Biology's UI, bound to the shared shell (SQ.UI.bind).

   Biosphere's modes were written against its own UI: UI.route("/play/drill",
   fn(view, r)) with r = {path, parts, query}, UI.gameShell(view, cfg) with meters
   and a progress strip, UI.modal({title, body, actions}), UI.toast(msg, kind),
   UI.results(view, cfg) as a full screen (never an overlay — defect H1), and
   UI.award({xp, bonus, accuracy, readRatio}). Rather than rewrite fourteen modes,
   this file gives them those same calls on top of the shared shell:

     · routes are dispatched from the app router (#/s/bio/<name>/<args…>) back to
       Biosphere's path table, with its ?query strings
     · gameShell is the shared one (it mounts the shared tool tray), with
       Biosphere's meters and progress strip added
     · award() translates Biosphere's options and goes through SQ.UI.award — the
       one reward path. Nothing else in the subject pays XP.

   Exposes: window.BIO.UI */
(function (root) {
  "use strict";

  var BIO = root.BIO = root.BIO || {};
  var U = BIO.U, S = BIO.State;

  var UI = SQ.UI.bind("bio", {
    nav: [
      { key: "home",     icon: "🧬", label: "Home" },
      { key: "play",     icon: "🎮", label: "Play" },
      { key: "study",    icon: "🃏", label: "Study" },
      { key: "atlas",    icon: "🔬", label: "Atlas" },
      { key: "progress", icon: "📈", label: "Progress" }
    ],
    navMap: { game: "play", boss: "play", reference: "study", options: "progress", shop: "progress" },
    coinRate: S.COIN_RATE,
    tools: { calc: true, sheet: true, pad: true }
  });

  /* The shared implementations, kept before Biosphere's names shadow them. */
  var core = {
    route: UI.route, gameShell: UI.gameShell, modal: UI.modal, toast: UI.toast,
    results: UI.results, award: UI.award, go: UI.go, closeModal: UI.closeModal,
    confirm: UI.confirmDialog
  };
  UI.core = core;

  /* ── routing ─────────────────────────────────────────────────────── */
  var table = {};
  UI.routes = table;

  /** Register a Biosphere path, e.g. "/play/drill". The app route for its first
      segment is registered in boot() (see UI.mountRoutes). */
  UI.route = function (path, fn) { table[path] = fn; };

  function parse(raw) {
    raw = String(raw || "").replace(/^#?\/?(s\/bio\/)?/, "");
    var qi = raw.indexOf("?");
    var path = qi >= 0 ? raw.slice(0, qi) : raw;
    var query = {};
    if (qi >= 0) raw.slice(qi + 1).split("&").forEach(function (kv) {
      if (!kv) return;
      var p = kv.split("=");
      query[decodeURIComponent(p[0])] = decodeURIComponent((p[1] || "").replace(/\+/g, " "));
    });
    var parts = path.split("/").filter(Boolean);
    if (parts[0] === "game") parts[0] = "play";          // #/s/bio/game/<mode> is an alias
    return { path: "/" + parts.join("/"), parts: parts, query: query };
  }
  UI.parseHash = function () { return parse(root.location.hash); };

  function dispatch(view, name, args) {
    var r = parse([name].concat(args || []).join("/"));
    UI._current = r;
    var key = "/" + (r.parts[0] || "home");
    var fn = table[r.path] || table[key] || table["/home"];
    try {
      return fn(view, r);
    } catch (e) {
      console.error("route error", r.path, e);
      view.appendChild(U.el("div", { class: "card" }, [
        U.el("h2", { text: "Something went wrong" }),
        U.el("p", { class: "muted small", text: String(e && e.message || e) }),
        U.el("button", { class: "btn btn-primary", onclick: function () { UI.go("/play"); } }, "Back to Play")
      ]));
    }
  }

  /** Called once from manifest boot(): one app route per first path segment. */
  UI.mountRoutes = function () {
    var names = {};
    Object.keys(table).forEach(function (p) { names[p.split("/")[1] || "home"] = true; });
    names.game = true;
    Object.keys(names).forEach(function (n) {
      core.route(n, function (view, args) { return dispatch(view, n, args); });
    });
  };

  /* The app router takes the first path segment as the route name, so a query on
     it ("/atlas?d=cell") must become "/atlas/?d=cell" to reach Biology's table. */
  function fixPath(p) { return String(p || "").replace(/^(#?\/?[^/?#]+)\?/, "$1/?"); }
  UI.go = function (p) { return core.go(fixPath(p)); };
  var coreHref = UI.href;
  UI.href = function (p) { return coreHref(fixPath(p)); };

  UI.render = function () { SQ.UI.handleRoute(); };
  UI.back = function () { UI.go("/play"); };
  UI.hideTabs = function () { /* the shared navbar stays; kept so modes need no edit */ };
  UI.syncChrome = function () { SQ.UI.syncHeader(); };

  /* ── toasts / modals, Biosphere-shaped ───────────────────────────── */
  var TOAST_ICON = { good: "✅", bad: "✋", info: "🔍" };
  UI.toast = function (msg, kind, ms) {
    if (msg && typeof msg === "object") return core.toast(msg);
    return core.toast({ text: U.esc(msg), kind: kind === "info" ? "" : (kind || ""), ms: ms, icon: TOAST_ICON[kind] || "🧬" });
  };

  /** UI.modal({title, body, actions:[{label, kind, onclick, keepOpen}], noClose, onClose})
      — or the shared form, UI.modal(node|html, opts). Returns the dialog box. */
  UI.modal = function (opts, extra) {
    if (typeof opts === "string" || (opts && opts.nodeType)) return core.modal(opts, extra).box;
    opts = opts || {};
    var box = U.el("div", { class: "bio-modal" });
    if (opts.title) box.appendChild(U.el("h2", { text: opts.title }));
    if (opts.body) box.appendChild(typeof opts.body === "string" ? U.el("p", { text: opts.body }) : opts.body);
    if (opts.actions && opts.actions.length) {
      var row = U.el("div", { class: "row", style: "margin-top:14px" });
      opts.actions.forEach(function (a) {
        row.appendChild(U.el("button", {
          class: "btn " + (a.kind ? "btn-" + a.kind : "") + (opts.actions.length <= 2 ? " grow" : ""),
          onclick: function () { if (!a.keepOpen) core.closeModal(); if (a.onclick) a.onclick(); }
        }, a.label));
      });
      box.appendChild(row);
    }
    var m = core.modal(box, { sticky: !!opts.noClose, onClose: opts.onClose || null });
    return m.box;
  };
  UI.closeModal = function (all) { core.closeModal(all === true); };
  UI.confirm = function (title, body, onYes, yesLabel) {
    core.confirm(title, U.esc(body), onYes, yesLabel);
  };

  /* ═══════════════════════════════════════════════════════════════════
     award() — Biosphere's options, the shared pipeline.

     opts: { xp, bonus, accuracy, readRatio, answered, boost, coins, mode, score, silent }
       xp         per-item XP the mode already netted (rushed items unpaid)
       bonus      completion bonus: withheld below 50% accuracy, when the run was
                  answered faster than it can be read (readRatio < 0.5), or when
                  fewer than 5 items were answered; otherwise scaled by accuracy
       boost      the Catalyst (×2). Multiplies — never adds — and is capped ×4
                  together with difficulty and prestige.
     Everything is passed to SQ.UI.award as plain XP; the shared pipeline applies
     the multipliers, the tool-tray crutch, the coin rate, Stars and the overall
     level. The returned record keeps Biosphere's shape for the results rows.
     ═══════════════════════════════════════════════════════════════════ */
  UI._awardLog = [];

  UI.award = function (opts) {
    opts = opts || {};
    var acc = (typeof opts.accuracy === "number") ? U.clamp(opts.accuracy, 0, 1) : null;
    var base = Math.max(0, Math.round(opts.xp || 0));
    var bonus = Math.max(0, Math.round(opts.bonus || 0));
    var readRatio = (typeof opts.readRatio === "number") ? opts.readRatio : null;

    var bonusApplied = bonus;
    if (acc !== null && acc < S.MIN_ACC_BONUS) bonusApplied = 0;
    if (readRatio !== null && readRatio < 0.5) bonusApplied = 0;
    if (typeof opts.answered === "number" && opts.answered < 5) bonusApplied = 0;
    if (acc !== null) bonusApplied = Math.round(bonusApplied * acc);

    var gross = base + bonusApplied;
    var boost = opts.boost && opts.boost > 1 ? opts.boost : 1;
    var mult = Math.min(S.MAX_MULTIPLIER, S.xpMultiplier() * boost);
    var crutch = UI.formulaPenalty();
    var expected = Math.max(0, Math.round(gross * mult * crutch));
    var coins = typeof opts.coins === "number" ? Math.max(0, Math.round(opts.coins)) : expected;

    var got = core.award({ xp: gross, boost: boost, coins: coins, silent: opts.silent, at: opts.at });

    if (opts.mode) {
      S.data.runs = (S.data.runs || 0) + 1;
      if (typeof opts.score === "number") {
        var b = S.data.bests[opts.mode] || 0;
        if (opts.score > b) S.data.bests[opts.mode] = opts.score;
        S.recordScore(opts.mode, opts.score);
      }
      S.markMode(opts.mode);
      /* The subject daily moves only on a run that genuinely paid. */
      if (got.xp > 0 && typeof opts.score === "number" && opts.score > 0) S.progressDaily(opts.mode, opts.score);
    }
    S.save();

    var preCrutch = Math.round(gross * mult);
    var rec = {
      t: Date.now(), mode: opts.mode || null, base: base, bonus: bonusApplied,
      bonusWithheld: bonus - bonusApplied, refPenalty: crutch < 1 ? Math.max(0, preCrutch - got.xp) : 0,
      xp: got.xp, coins: got.coins, stars: got.stars, multiplier: mult,
      multBonus: Math.max(0, preCrutch - gross), accuracy: acc, readRatio: readRatio
    };
    UI._awardLog.push(rec);
    if (UI._awardLog.length > 400) UI._awardLog.shift();
    UI._lastAward = rec;
    return rec;
  };

  UI.previewPenalty = function () { return 1 - UI.formulaPenalty(); };

  /* ═══════════════════════════════════════════════════════════════════
     gameShell(view, cfg) — the shared shell, with Biosphere's meters.
     cfg: { title, sub, onQuit, progress, tools, backTo, help }
     The shared tool tray is mounted here. In Term Match, Label It and the
     bosses the reference sheet is withheld (tools: {sheet:false}).
     ═══════════════════════════════════════════════════════════════════ */
  UI.gameShell = function (view, cfg) {
    cfg = cfg || {};
    var mode = BIO.Tools ? BIO.Tools.currentMode() : null;
    var tools = cfg.tools !== undefined ? cfg.tools
      : (BIO.Tools && !BIO.Tools.referenceAllowed(mode) ? { calc: true, sheet: false, pad: true } : { calc: true, sheet: true, pad: true });
    var sh = core.gameShell(cfg.title, { backTo: cfg.backTo || "/play", tools: tools, help: cfg.help });

    // The shared back button, with Biosphere's quit guard.
    var back = sh.head.firstChild;
    var nb = U.el("button", { class: "btn btn-sm btn-ghost", type: "button", text: "← Quit" });
    nb.addEventListener("click", function () { UI.quitGuard(cfg); });
    sh.head.replaceChild(nb, back);

    var sub = cfg.sub ? U.el("div", { class: "gs-sub muted2", text: cfg.sub }) : null;
    var meters = U.el("div", { class: "gs-meters" });
    var prog = U.el("div", { class: "gs-prog" }, [U.el("i")]);
    var top = U.el("div", { class: "gs-head" }, [sub, meters, cfg.progress !== false ? prog : null]);
    var body = U.el("div", { class: "gs-body" });
    sh.root.insertBefore(top, sh.body);
    sh.root.replaceChild(body, sh.body);
    sh.root.classList.add("bio-shell");
    view.appendChild(sh.root);

    return {
      head: sh.head, body: body, meters: meters, meta: sh.meta,
      setMeters: function (items) {
        U.clear(meters);
        items.forEach(function (m) {
          if (!m) return;
          meters.appendChild(U.el("span", { class: "gs-meter" + (m.hot ? " hot" : ""), text: m.text }));
        });
        if (BIO.Tools && BIO.Tools.refLatched()) {
          meters.appendChild(U.el("span", { class: "gs-meter warn",
            text: "Reference ×" + UI.formulaPenalty().toFixed(2) }));
        }
      },
      setProgress: function (f) { prog.firstChild.style.width = U.clamp(f, 0, 1) * 100 + "%"; },
      clear: function () { U.clear(body); return body; }
    };
  };

  UI.quitGuard = function (cfg) {
    if (cfg && cfg.onQuit) {
      UI.confirm("Quit this run?", "Progress in this run is not saved and it pays nothing.", function () {
        cfg.onQuit();
      }, "Quit");
    } else UI.go(cfg && cfg.backTo || "/play");
  };

  /* ── results: a full screen reached by a button (defect H1) ──────── */
  UI.results = function (view, cfg) {
    U.clear(view);
    if (SQ.Tools && SQ.Tools.unmount) SQ.Tools.unmount();
    root.scrollTo(0, 0);

    var acc = cfg.total ? cfg.correct / cfg.total : 0;
    var perfect = cfg.total > 0 && cfg.correct === cfg.total;
    SQ.Overall.noteRun({ perfect: perfect, subject: "bio" });
    if (SQ.Sound) {
      if (perfect) { (SQ.Sound.perfect || SQ.Sound.win)(); SQ.FX.confetti(120); }
      else if (acc >= 0.6) { SQ.Sound.win(); SQ.FX.confetti(60); }
      else SQ.Sound.lose();
    }

    var last = UI._lastAward && Date.now() - UI._lastAward.t < 4000 ? UI._lastAward : null;
    var card = U.el("div", { class: "card center bio-results" }, [
      U.el("div", { style: "font-size:34px", text: acc >= 0.9 ? "🏅" : acc >= 0.6 ? "🌿" : "🔬" }),
      U.el("h1", { text: cfg.title || "Run complete", style: "margin:6px 0 2px" }),
      U.el("div", { class: "muted", text: cfg.subtitle || (cfg.correct + " / " + cfg.total + " correct · " + Math.round(acc * 100) + "%") }),
      last && last.stars ? U.el("div", { class: "chip on", style: "margin-top:8px", text: "+" + last.stars + " ⭐ Stars" }) : null
    ]);

    var stats = U.el("div", { class: "list", style: "margin-top:12px" });
    (cfg.rows || []).forEach(function (r) {
      if (!r) return;
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
    if (cfg.again) row.appendChild(U.el("button", { class: "btn btn-primary grow js-again", onclick: cfg.again }, "Play again"));
    row.appendChild(U.el("button", { class: "btn grow", onclick: function () { UI.go(cfg.backTo || "/play"); } }, "All modes"));
    view.appendChild(row);
  };

  /* ── shared question renderer (MCQ) ─────────────────────────────── */
  UI.renderMCQ = function (host, q, onAnswer, opts) {
    opts = opts || {};
    U.clear(host);
    var answered = false;

    var meta = U.el("div", { class: "qmeta" }, opts.hideTags ? [U.el("span", { class: "badge", text: "?" })] : [
      U.el("span", { class: "badge badge-accent", text: q.mod }),
      q.topic ? U.el("span", { class: "badge", text: U.trunc(q.topic, 28) }) : null,
      q.diff ? U.el("span", { class: "badge", text: "×" + q.diff }) : null
    ]);
    host.appendChild(meta);
    if (q.stem) host.appendChild(U.el("div", { class: "card card-tight small muted", html: q.stem }));
    host.appendChild(U.el("div", { class: "qtext", text: q.q }));
    if (q.figure && BIO.Diagram) host.appendChild(BIO.Diagram.staticFigure(q.figure));

    var order = opts.order || U.shuffle(q.options.map(function (_, i) { return i; }));
    var box = U.el("div", { class: "opts" });
    var btns = [];

    order.forEach(function (oi, n) {
      var b = U.el("button", { class: "opt", type: "button" }, [
        U.el("span", { class: "k", text: "ABCD".charAt(n) }),
        U.el("span", { class: "grow", text: q.options[oi] })
      ]);
      b.addEventListener("click", function () {
        if (answered) return;
        answered = true;
        var ok = oi === q.answer;
        btns.forEach(function (bb, j) {
          bb.disabled = true;
          if (order[j] === q.answer) bb.classList.add("right");
          else if (bb === b) bb.classList.add("wrong");
          else bb.classList.add("dim");
        });
        if (SQ.Sound) (ok ? SQ.Sound.correct : SQ.Sound.wrong)();
        host.appendChild(explain(q, ok, oi));
        if (onAnswer) onAnswer(ok, oi, q);
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

  /* ── keyboard play: 1–4 / A–D pick an option, Enter continues ────── */
  document.addEventListener("keydown", function (e) {
    if (document.documentElement.dataset.subject !== "bio") return;
    if (SQ.UI.modalOpen()) return;
    var t = e.target;
    if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    var view = document.getElementById("view");
    if (!view) return;
    var k = e.key.toLowerCase();
    var idx = "1234".indexOf(k) >= 0 ? "1234".indexOf(k) : "abcd".indexOf(k);
    if (idx >= 0 && k.length === 1) {
      var opts = view.querySelectorAll(".gs-body .opts .opt");
      if (opts[idx] && !opts[idx].disabled) { e.preventDefault(); opts[idx].click(); }
      return;
    }
    if (e.key === "Enter") {
      var btns = [].slice.call(view.querySelectorAll(".gs-body .btn-primary"));
      var go = btns.filter(function (b) { return !b.disabled && b.offsetParent !== null; }).pop();
      if (go) { e.preventDefault(); go.click(); }
    }
  });

  BIO.UI = UI;
})(typeof window !== "undefined" ? window : globalThis);
