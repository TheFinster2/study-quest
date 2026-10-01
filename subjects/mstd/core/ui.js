/* ============================================================================
   ui.js — Maths Standard's view of the shared UI.

   MS.UI is SQ.UI.bind('mstd', …): routing, header, nav, modals, toasts and THE
   REWARD PIPELINE belong to the app now. What stays here is NumberCrunch's
   own vocabulary on top of it, so its modes keep calling what they always did:

     UI.route('/game/drill/:topic', fn)  pattern routes, dispatched per first
                                         segment through the core router
     UI.award(o)      NumberCrunch's gates in front of SQ.UI.award:
                        · a caller that omits `answered` gets no bonus
                        · coins at 35% when accuracy is under 50%
                        · the day-streak bonus (+4/day, max +60) on a paying run
                        · `mode` marks the mode and counts a finished game
                      then the core applies the accuracy/sample gate, the
                      difficulty × prestige multiplier (cap ×4), the tool-tray
                      crutch, the 0.6 coin rate, Stars and the overall level
     UI.pool()        the run-scoped XP pool: wrong answers subtract, answers
                      under the read floor pay 0, diff-0 questions pay ×0.6
     UI.readMs(text)  = SQ.UI.readFloor (1200 ms + 12 ms/word, cap 4 s)
     UI.modal(spec)   the {title, sub, body, buttons, dismissable} form
     UI.results(spec) NumberCrunch's results (rank, reconcile line, "Review the
                      working"), rendered in a core modal
     UI.gameShell     core chrome (+ tool tray), with NumberCrunch's sub/meta/onQuit
   Namespace: window.MS.UI
   ========================================================================== */
window.MS = window.MS || {};
(function () {
  'use strict';
  var MS = window.MS, U = MS.U;
  var State = function () { return MS.State; };
  var Audio = { play: function (n) { if (MS.Audio) MS.Audio.play(n); }, throttled: function (n, ms) { if (MS.Audio) MS.Audio.throttled(n, ms); } };
  var ID = 'mstd';

  var UI = {};
  var currentRoot = null, bound = null, coreRoute = null;
  var keyMap = null;

  UI.MIN_READ_MS = SQ.UI.MIN_READ_MS;
  UI.MIN_BONUS_ACCURACY = SQ.UI.MIN_BONUS_ACCURACY;
  UI.MIN_BONUS_ANSWERS = 5;
  UI.readMs = function (text) { return SQ.UI.readFloor(text || ''); };

  /* ================================================================ routing */
  var table = {};
  UI.route = function (pattern, handler) {
    var p = pattern === '/' ? '/home' : pattern;
    var segs = p.replace(/^\//, '').split('/');
    var first = segs[0];
    var fresh = !table[first];
    (table[first] = table[first] || []).push({ rest: segs.slice(1), handler: handler, pattern: pattern });
    if (fresh) coreRoute(first, function (view, args) { return dispatch(first, view, args || []); });
  };

  function match(entry, args) {
    if (entry.rest.length !== args.length) return null;
    var params = {};
    for (var i = 0; i < args.length; i++) {
      var s = entry.rest[i];
      if (s.charAt(0) === ':') params[s.slice(1)] = args[i];
      else if (s !== args[i]) return null;
    }
    return params;
  }

  function dispatch(first, view, args) {
    var list = table[first] || [];
    var hit = null, params = null;
    for (var i = 0; i < list.length && !hit; i++) { params = match(list[i], args); if (params) hit = list[i]; }
    if (!hit) { setTimeout(function () { bound.go('/'); }, 0); return; }
    var root = U.el('.ms-root');
    view.appendChild(root);
    currentRoot = root;
    keyMap = null;
    if (MS.Draw && MS.Draw.invalidatePalette) MS.Draw.invalidatePalette();
    SQ.UI.onLeave(function () { keyMap = null; if (currentRoot === root) currentRoot = null; });
    hit.handler(root, params);
  }

  UI.root = function () { return currentRoot; };
  /** The subject-relative path on screen, e.g. "/game/drill/MS-A1". */
  UI.path = function () {
    var r = SQ.UI.parseHash();
    return '/' + [r.name].concat(r.args).join('/');
  };
  UI.handleRoute = function () { SQ.UI.handleRoute(); };
  UI.back = function () { if (history.length > 1) history.back(); else bound.go('/'); };

  /* ================================================================ toasts */
  var EMOJI_LEAD = /^((?:\p{Extended_Pictographic}|[☀-➿])(?:[️‍]|\p{Extended_Pictographic})*)\s*/u;
  UI.toast = function (msg, kind, ms) {
    if (msg && typeof msg === 'object') return SQ.UI.toast(msg);
    var text = String(msg == null ? '' : msg), icon = null;
    var m = EMOJI_LEAD.exec(text);
    if (m) { icon = m[1]; text = text.slice(m[0].length); }
    if (!icon) icon = kind === 'good' ? '✓' : kind === 'bad' ? '✗' : kind === 'warn' ? '⚠️' : 'ℹ️';
    return SQ.UI.toast({ text: U.mathHtml(text), icon: icon, kind: kind === 'acc' ? 'xp' : kind || '', ms: ms || 1900 });
  };

  /* ================================================================ modals */
  UI.modal = function (spec, opts) {
    if (!spec || typeof spec === 'string' || (typeof Node !== 'undefined' && spec instanceof Node)) return SQ.UI.modal(spec, opts);
    var box = U.el('.ms-root.ms-modal');
    if (spec.title) U.add(box, U.el('h2.modal-title', { html: U.mathHtml(spec.title) }));
    if (spec.sub) U.add(box, U.el('.sub', { html: U.mathHtml(spec.sub) }));
    if (spec.body) U.add(box, spec.body);
    if (spec.buttons) {
      var row = U.el('.stack', { style: { marginTop: '14px' } });
      spec.buttons.filter(Boolean).forEach(function (b) {
        U.add(row, U.el('button.btn' + (b.pri ? '.pri' : '') + (b.danger ? '.danger' : '') + '.wide', {
          onclick: function () {
            Audio.play('tap');
            if (b.keep !== true) SQ.UI.closeModal();
            if (b.onclick) b.onclick();
          }
        }, b.label));
      });
      U.add(box, row);
    }
    SQ.UI.modal(box, { sticky: spec.dismissable === false, stack: !!spec.stack });
    Audio.play(spec.silent ? 'tapSoft' : 'open');
    return box;
  };
  UI.closeModal = function () { SQ.UI.closeModal(); };
  UI.confirmDialog = function (title, sub, onYes, yesLabel) {
    UI.modal({ title: title, sub: sub, stack: SQ.UI.modalOpen(),
      buttons: [{ label: yesLabel || 'Yes, do it', pri: true, onclick: onYes }, { label: 'Cancel' }] });
  };
  UI.confirm = UI.confirmDialog;

  /* ========================================================= REWARD PIPELINE */
  UI.award = function (o) {
    o = o || {};
    var S = State();
    var acc = o.accuracy == null ? 1 : U.clamp(o.accuracy, 0, 1);
    var base = Math.max(0, Math.round(o.xp || 0));
    var bonus = Math.max(0, Math.round(o.bonus || 0));
    /* A caller that forgets `answered` is treated as a short run, not trusted. */
    var answered = o.answered == null ? 0 : o.answered;
    var gated = (!bonus || acc < UI.MIN_BONUS_ACCURACY || answered < UI.MIN_BONUS_ANSWERS) ? 0 : Math.round(bonus * acc);

    var streakBonus = 0;
    if (o.streakBonus !== false && base + gated > 0) {
      S.touchStreak();
      streakBonus = Math.min(60, Math.round((SQ.Store.data.streak.count || 0) * 4));
    }
    S.noteActiveDay();

    /* §7: payouts at 60% (the core's coin rate), and only 35% of that below 50%. */
    var coins = Math.max(0, o.coins || 0);
    if (coins && acc < UI.MIN_BONUS_ACCURACY) coins = coins * 0.35;

    if (o.mode) { S.markMode(o.mode); S.bump('gamesFinished'); }

    var res = SQ.UI.award(ID, {
      xp: base + streakBonus, bonus: bonus, accuracy: acc, answered: answered,
      coins: coins, at: o.node || null, silent: !!o.quiet, boost: o.boost, pace: o.pace
    });
    if (res.coins) S.bump('coinsEarned', res.coins);
    S.bump('xpEarned', res.xp);
    var ups = [];
    for (var i = 1; i <= (res.levelsGained || 0); i++) ups.push(res.newLevel - res.levelsGained + i);
    if (!o.quiet && res.xp > 0) Audio.play(res.xp >= 400 ? 'xpBig' : 'xp');
    return { xp: res.xp, coins: res.coins, stars: res.stars, bonus: res.xp > 0 ? gated : 0, streakBonus: streakBonus,
             mult: res.multiplier, levelUps: ups, achievements: [], raw: res };
  };

  /* A run-scoped XP pool implementing the §9.5 rules for the caller. */
  UI.pool = function () {
    /* `correct` is the COUNTER and `right()` is the METHOD — never the same name. */
    var p = { xp: 0, correct: 0, wrong: 0, skipped: 0, fast: 0, streak: 0, bestStreak: 0, boost: 1, mult: 1 };
    p.stepMult = function () { return Math.min(3, 1 + Math.floor(p.streak / 5) * 0.5); };
    /* diff 0 is the foundation band: it pays 0.6 of a diff-1 question. */
    function weight(diff) { return diff ? diff : 0.6; }
    p.right = function (diff, ms, minMs) {
      p.correct++;
      p.streak++;
      p.bestStreak = Math.max(p.bestStreak, p.streak);
      var floor = minMs == null ? UI.MIN_READ_MS : minMs;
      if (ms != null && ms < floor) { p.fast++; return 0; }
      var gain = Math.round(10 * weight(diff) * p.stepMult() * p.boost);
      p.xp += gain;
      return gain;
    };
    p.wrongAnswer = function (diff) {
      p.wrong++;
      p.streak = 0;
      p.xp = Math.max(0, p.xp - Math.round(6 * weight(diff)));
      return p.xp;
    };
    p.skip = function () { p.skipped++; p.streak = 0; };
    p.accuracy = function () { var n = p.correct + p.wrong; return n ? p.correct / n : 0; };
    p.answered = function () { return p.correct + p.wrong; };
    return p;
  };

  /* ================================================== reference pages modal
     Used by the (unscored) reference screens only. In a run the formula sheet
     is the shared tool tray's (registered in manifest.js). */
  UI.formulaSheet = function (opts) {
    opts = opts || {};
    var pages = MS.REFERENCE || [];
    var sheet = pages.filter(function (p) { return p.id === (opts.page || 'formulae'); })[0];
    if (!sheet) return null;
    var body = U.el('.stack');
    (sheet.sections || []).forEach(function (s) { U.add(body, UI.referenceSection(s)); });
    return UI.modal({ title: sheet.ic + ' ' + sheet.nm, body: body, silent: true, buttons: [{ label: 'Close', pri: true }] });
  };
  UI.referenceSection = function (s) {
    var block = U.el('.stack');
    if (s.h) U.add(block, U.el('strong', { html: U.mathHtml(s.h) }));
    if (s.kind === 'table') U.add(block, UI.table({ head: s.head, rows: s.rows }));
    else if (s.kind === 'list') {
      U.add(block, U.el('ul', (s.items || []).map(function (it) {
        return U.el('li', { style: { marginBottom: '5px', fontSize: '13.5px', lineHeight: '1.5' }, html: U.mathHtml(it) });
      })));
    } else if (s.kind === 'note') U.add(block, U.el('.why', { html: U.mathHtml(s.text) }));
    else if (s.kind === 'annuity') U.add(block, UI.annuityTable(s.which));
    else if (s.text) U.add(block, U.el('.sub', { html: U.mathHtml(s.text) }));
    return block;
  };
  UI.annuityTable = function (which) {
    var A = MS.ANNUITY;
    if (!A) return U.el('.sub', 'tables unavailable');
    var tbl = U.el('table');
    var hr = U.el('tr');
    U.add(hr, U.el('th', 'n'));
    A.rateLabels.forEach(function (l) { U.add(hr, U.el('th', l)); });
    U.add(tbl, U.el('thead', hr));
    var tb = U.el('tbody');
    A[which].forEach(function (row) {
      var tr = U.el('tr');
      U.add(tr, U.el('td', String(row[0])));
      for (var i = 1; i < row.length; i++) U.add(tr, U.el('td', row[i].toFixed(4)));
      U.add(tb, tr);
    });
    U.add(tbl, tb);
    return U.el('.tblwrap.tall', tbl);
  };

  /* ============================================================ game shell
     gameShell(title, {sub, meta:[nodes], onQuit, help, backTo, sheet:false, tools})
     -> {shell, body, meta, root}. Mounts the shared tool tray (calculator,
     the Standard 2 reference sheet, working pad). */
  UI.gameShell = function (title, opts) {
    opts = opts || {};
    var root = currentRoot || U.$('#view');
    var tools = opts.tools !== undefined ? opts.tools : opts.sheet === false ? false : undefined;
    var g = SQ.UI.gameShell(ID, title, { backTo: opts.backTo || '/play', help: opts.help, tools: tools, scored: opts.scored });
    if (opts.onQuit) {
      var back = g.head.querySelector('button');
      if (back) {
        var nb = back.cloneNode(true);
        nb.addEventListener('click', function () { Audio.play('close'); opts.onQuit(); });
        back.replaceWith(nb);
      }
    }
    g.body.classList.add('stack');
    U.clear(root);
    U.add(root, g.root);
    if (opts.sub) U.add(g.meta, U.el('.chip', { html: U.mathHtml(opts.sub) }));
    (opts.meta || []).forEach(function (m) { if (m) U.add(g.meta, m); });
    return { shell: g.root, body: g.body, meta: g.meta, root: root, head: g.head };
  };

  UI.chip = function (text, cls) { return U.el('.chip' + (cls ? '.' + cls : ''), { html: U.mathHtml(String(text)) }); };
  UI.pulse = function (node, cls) {
    if (!node) return;
    node.classList.add(cls || 'hit');
    setTimeout(function () { node.classList.remove(cls || 'hit'); }, 220);
  };

  var RANKS = [
    { at: 1.0,  g: 'S',  blurb: 'Perfect. Nothing to fix.' },
    { at: 0.9,  g: 'A+', blurb: 'Band 6 shape.' },
    { at: 0.8,  g: 'A',  blurb: 'Solid. The method is there.' },
    { at: 0.7,  g: 'B',  blurb: 'Working. Tighten the careless ones.' },
    { at: 0.55, g: 'C',  blurb: 'Half of it landed. Worth a second pass.' },
    { at: 0.35, g: 'D',  blurb: 'Rough run. Try Topic Drill on the weak spot.' },
    { at: 0,    g: 'E',  blurb: 'That one goes in Mistake Rehab.' }
  ];
  UI.rank = function (accuracy) {
    for (var i = 0; i < RANKS.length; i++) if (accuracy >= RANKS[i].at - 1e-9) return RANKS[i];
    return RANKS[RANKS.length - 1];
  };

  /* --------------------------------------------------------------- results */
  UI.results = function (spec) {
    var acc = spec.accuracy == null ? 0 : spec.accuracy;
    var r = UI.rank(acc);
    SQ.Overall.noteRun({ perfect: acc >= 1, subject: ID });
    spec.rows = (spec.rows || []).slice();
    /* §C3 — report the free sheet, never charge for it; the tray charges only
       for what the exam does NOT print. */
    var usedSheet = SQ.Tools && SQ.Tools.used ? SQ.Tools.used('sheet') : false;   // see CORE-REQUESTS #1
    if (usedSheet) { spec.rows.push(['Formula sheet', 'used — no XP cost']); State().bump('sheetRuns'); }
    var looks = SQ.Tools && SQ.Tools.lookups ? SQ.Tools.lookups() : [];
    if (looks && looks.length) spec.rows.push(['Off-sheet lookups', looks.length + ' · ×' + SQ.UI.formulaPenalty().toFixed(2)]);

    var rows = U.el('.stack');
    spec.rows.forEach(function (row) {
      U.add(rows, U.el('.spread', [
        U.el('span.sub', { html: U.mathHtml(row[0]) }),
        U.el('strong', { html: U.mathHtml(String(row[1])) })
      ]));
    });
    var working = currentRoot ? U.$('.gshell .why', currentRoot) : null;
    var reopenBtn = null;
    var reconcile = null;
    if (spec.outcome === 'win' && acc < 0.7) {
      reconcile = 'You won on health, not on accuracy — ' + Math.round(acc * 100) +
                  '% would not carry an exam paper. The grade above is the honest number.';
    } else if (spec.outcome === 'loss' && acc >= 0.8) {
      reconcile = 'The run ended early, but ' + Math.round(acc * 100) +
                  '% is exam-standard accuracy. It was the clock or the lives, not the maths.';
    }

    function open() {
      var body = U.el('.stack', [
        U.el('.center', [
          U.el('.huge' + (acc >= 0.8 ? '.good' : acc >= 0.55 ? '.warn' : '.bad'), r.g),
          U.el('.sub', r.blurb)
        ]),
        reconcile ? U.el('.why.warn', reconcile) : null,
        U.el('.hr'),
        rows,
        spec.note ? U.el('.why', { html: U.mathHtml(spec.note) }) : null
      ]);
      var buttons = [];
      if (spec.again) buttons.push({ label: '↻ Again', pri: true, onclick: spec.again });
      if (working) buttons.push({ label: '📖 Review the working', onclick: review });
      (spec.extraButtons || []).forEach(function (b) { if (b) buttons.push(b); });
      buttons.push({ label: 'Done', onclick: function () { if (reopenBtn) reopenBtn.remove(); bound.go(spec.backTo || '/play'); } });
      UI.modal({ title: spec.title || 'Run complete', body: body, buttons: buttons, dismissable: false, silent: true });
    }
    function review() {
      if (!reopenBtn) {
        reopenBtn = U.el('button.btn.btn-primary.reopen-results.ms-reopen', { onclick: function () { Audio.play('open'); open(); } }, 'Results →');
        document.body.appendChild(reopenBtn);
        SQ.UI.onLeave(function () { if (reopenBtn) { reopenBtn.remove(); reopenBtn = null; } });
      }
      working.scrollIntoView({ block: 'center', behavior: 'smooth' });
      working.classList.add('flash');
      setTimeout(function () { working.classList.remove('flash'); }, 1400);
    }
    setTimeout(function () {
      Audio.play(acc >= 1 ? 'rankS' : acc >= 0.7 ? 'resultsIn' : 'gameOver');
      if (acc >= 0.9 && MS.FX) MS.FX.confetti(70);
      open();
    }, spec.delay == null ? 700 : spec.delay);
  };

  /* ------------------------------------------------------- keyboard support */
  UI.keys = function (map) { keyMap = map; };
  document.addEventListener('keydown', function (e) {
    if (SQ.UI.context() !== ID) return;
    if (e.target && /input|textarea|select/i.test(e.target.tagName)) {
      if (e.key === 'Escape') e.target.blur();
      if (!(e.key === 'Enter' && keyMap && keyMap.Enter)) return;
    }
    if (SQ.UI.modalOpen()) return;                  // the core owns Esc/Tab in dialogs
    var S = State();
    if (S && S.data && S.data.kbd === false) return;
    /* F opens the shared formula sheet inside a game. */
    if ((e.key === 'f' || e.key === 'F') && U.$('.gshell') && SQ.Tools && SQ.Tools.open) {
      e.preventDefault();
      SQ.Tools.open('sheet');
      return;
    }
    if (!keyMap) return;
    var fn = keyMap[e.key] || (/^[a-d]$/i.test(e.key) ? keyMap[String('abcd'.indexOf(e.key.toLowerCase()) + 1)] : null);
    if (fn) { e.preventDefault(); fn(e); }
  });

  /* --------------------------------------------------------- shared widgets */
  UI.questionBlock = function (q) {
    var wrap = U.el('.stack');
    if (q.stem) U.add(wrap, U.el('.qstem', { html: U.mathHtml(q.stem) }));
    if (q.table) U.add(wrap, UI.table(q.table));
    if (q.figure && MS.Figures) {
      var fig = MS.Figures.build(q.figure);
      if (fig) U.add(wrap, U.el('.center', fig));
    }
    U.add(wrap, U.el('.qtext', { html: U.mathHtml(q.q) }));
    if (q.id && MS.Bank && MS.Bank.byId(q.id) && State().toggleBookmark) {
      var S = State();
      var bm = U.el('button.btn.sm.ghost.ms-bookmark', {
        'aria-label': 'Bookmark this question', title: 'Bookmark',
        onclick: function () { var on = S.toggleBookmark(q.id); bm.textContent = on ? '🔖 Saved' : '🏷️ Save'; Audio.play('tapSoft'); }
      }, S.isBookmarked(q.id) ? '🔖 Saved' : '🏷️ Save');
      U.add(wrap, U.el('.row', { style: { justifyContent: 'flex-end' } }, bm));
    }
    return wrap;
  };

  UI.table = function (spec) {
    var tbl = U.el('table');
    if (spec.head) {
      var tr = U.el('tr');
      spec.head.forEach(function (h) { U.add(tr, U.el('th', { html: U.mathHtml(h) })); });
      U.add(tbl, U.el('thead', tr));
    }
    var tb = U.el('tbody');
    (spec.rows || []).forEach(function (row, ri) {
      var tr2 = U.el('tr');
      row.forEach(function (c, ci) {
        var hit = spec.hit && spec.hit[0] === ri && spec.hit[1] === ci;
        U.add(tr2, U.el('td' + (hit ? '.hit' : ''), { html: U.mathHtml(String(c)) }));
      });
      U.add(tb, tr2);
    });
    U.add(tbl, tb);
    return U.el('.tblwrap' + (spec.tall ? '.tall' : ''), tbl);
  };

  /* Multiple choice, shared by every quiz mode and the bosses. Owns the read floor. */
  UI.choiceBlock = function (opts) {
    var q = opts.q;
    var shown = Date.now();
    var minMs = UI.readMs((q.stem || '') + ' ' + q.q);
    var wrap = U.el('.choices');
    var buttons = [];
    var done = false;
    (q.choices || []).forEach(function (c, i) {
      var b = U.el('button.choice', {
        onclick: function () {
          if (done) return;
          done = true;
          opts.onPick(i, b, Date.now() - shown, minMs);
        }
      }, [U.el('.k', 'ABCD'[i] || String(i + 1)), U.el('.v', { html: U.mathHtml(String(c)) })]);
      buttons.push(b);
      U.add(wrap, b);
    });
    var map = {};
    ['1', '2', '3', '4'].forEach(function (k, i) { map[k] = function () { if (buttons[i] && !done) buttons[i].click(); }; });
    UI.keys(map);
    return {
      node: wrap, buttons: buttons, minMs: minMs, shownAt: shown,
      lock: function () { done = true; buttons.forEach(function (b) { b.disabled = true; }); },
      mark: function (picked, correct) {
        buttons.forEach(function (b, i) {
          if (i === correct) b.classList.add('right');
          else if (i === picked) b.classList.add('wrong');
          b.disabled = true;
        });
      },
      fifty: function (correct) {
        var wrongIdx = buttons.map(function (_, i) { return i; }).filter(function (i) { return i !== correct; });
        U.shuffle(wrongIdx).slice(0, 2).forEach(function (i) { buttons[i].classList.add('dead'); buttons[i].disabled = true; });
      }
    };
  };

  UI.whyBlock = function (q) { return U.el('.why', { html: U.mathHtml(q.why || '') }); };

  /* Numeric answer field with parse feedback — never eval. `js-answer` lets the
     shared calculator's "→ Answer" key fill it. */
  UI.numberField = function (opts) {
    var input = U.el('input.fld.js-answer', {
      type: 'text', inputmode: 'decimal', autocomplete: 'off',
      placeholder: opts.placeholder || 'your answer', 'aria-label': opts.label || 'Answer'
    });
    var hint = U.el('.tiny.dim', opts.hint || '');
    input.addEventListener('input', function () {
      Audio.throttled('typing', 45);
      var raw = input.value.trim();
      input.classList.remove('ok', 'no');
      if (!raw) { hint.textContent = opts.hint || ''; return; }
      var n = U.parseNumber(raw, opts);
      if (isFinite(n)) { hint.textContent = '= ' + U.round(n, 6); hint.className = 'tiny dim'; }
      else {
        var e = MS.Expr.evalSafe(raw.replace(/[$,%\s]/g, ''));
        hint.textContent = e.ok ? '' : e.error;
        hint.className = 'tiny bad';
      }
    });
    return { node: U.el('.stack', [opts.label ? U.el('label.lbl', opts.label) : null, input, hint]), input: input, hint: hint };
  };

  /* The app owns theme/motion/chrome now; these stay as no-ops for old call sites. */
  UI.applyTheme = function () { if (MS.Draw && MS.Draw.invalidatePalette) MS.Draw.invalidatePalette(); };
  UI.applyMotion = function () {};
  UI.measureChrome = function () {};
  UI.syncNav = function () {};

  bound = SQ.UI.bind(ID, {
    nav: [
      { key: 'home', icon: '🏠', label: 'Home' },
      { key: 'play', icon: '🎮', label: 'Play' },
      { key: 'study', icon: '🃏', label: 'Study' },
      { key: 'progress', icon: '📈', label: 'Progress' },
      { key: 'shop', icon: '🛒', label: 'Shop' }
    ],
    navMap: { game: 'play', bosses: 'play', boss: 'play', deck: 'study', reference: 'study', bookmarks: 'study',
              achievements: 'progress', ascend: 'progress', options: 'progress', about: 'progress',
              quests: 'home', daily: 'home' },
    coinRate: 0.6,
    tools: { calc: true, sheet: true, pad: true }
  });
  /* Capture the core's route() before NumberCrunch's pattern router replaces it. */
  coreRoute = bound.route;
  Object.assign(bound, UI);
  MS.UI = bound;
})();
