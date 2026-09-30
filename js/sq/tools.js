/* SQ.Tools — the shared tool tray: calculator, reference sheet, working pad.

   Mounted by SQ.UI.gameShell(); removed by the router (SQ.Tools.unmount()) on every
   route change. The tray lives OUTSIDE #view, because #view is emptied on every route.

   Where it came from
     Physics (calculator.js, sheet.js)   the question mirror (MutationObserver, ▲/▼ for
         more/less question), DEG/RAD, the working tape, "→ box", data-sheet constants
         in the calculator, the free-vs-"Show (−10%)" sheet with a per-run, one-way,
         capped ledger whose locked values are NOT in the DOM until paid.
     Maths Advanced (calc.js, toolbelt.js)   no <input> in the calculator and
         preventDefault on pointerdown, so the soft keyboard never rises; 2nd layer,
         nCr/nPr, x!, Ans, memory; the bottom-sheet tray with FABs; the canvas pad
         (4 colours, 3 widths, undo, normalised strokes so rotation redraws).
     Chemistry / Biology (tools.js)   docked tray tabs, the ⌨ key to opt back in to
         the device keyboard, inputmode="none".

   The honesty rules
     · The calculator and the pad pay nothing and cost nothing: the exam gives you a
       calculator and scrap paper. They never call award().
     · Sheet items marked free:true are free. free:false items are hidden (their
       content is not in the DOM) behind "Show (−10%)". Each distinct reveal costs
       10% of the run, capped at 30%; the latch is one-way — closing the tray, switching
       tabs or re-reading refunds nothing and charges nothing twice.
     · UI.award() multiplies XP by penalty(); UI.results() lists lookups().
     · An unscored mount (gameShell {scored:false}) shows everything and never charges.
     · The ledger resets on mount(). It survives ONE route change after the run (so a
       mode that shows its results on a separate route still pays the charge), then
       clears, so it can never tax an unrelated later screen.

   Persistence: SQ.Store.data.tools = { calc:{ deg, qsize, tape:{<subject>:[{src,value}]} },
   pad:{ <subject>:{ notes } } }, created lazily and kept under ~8 kB. */
window.SQ = window.SQ || {};

SQ.Tools = (function () {
  const U = SQ.U;

  const COST_EACH = 0.10;
  const COST_CAP = 0.30;
  const TAPE_MAX = 12;
  const SRC_MAX = 80;
  const NOTES_MAX = 4000;
  const BUDGET = 8000;
  const QSIZES = ["1.9em", "3.8em", "7.6em"];
  const TABS = {
    calc:  { icon: "🧮", long: "Calculator", short: "Calc", key: "c" },
    sheet: { icon: "📋", long: "Sheet", short: "Sheet", key: "f" },
    pad:   { icon: "✏️", long: "Working", short: "Work", key: "w" }
  };

  const sheets = {};
  let mounted = null;             // { subject, scored, tabs:[…] }
  let ledger = { subject: null, scored: false, revealed: [] };
  let unmountsSinceMount = 0;

  let fabEl = null, dockEl = null, sheetEl = null, bodyEl = null, mirrorEl = null, tabsEl = null;
  let sizeBtns = null, costChip = null;
  let tab = null, observer = null, resizeObs = null, lastInput = null, panelCleanup = null;

  /* calculator session (per mount) */
  let tokens = [], ans = 0, mem = 0, second = false, calcError = "", justEvaluated = false,
      prevShown = "", typing = false, constPicker = false, calcRedraw = null;
  /* pad session (per mount) */
  let strokes = [], penColor = "accent", penWidth = 2.6;

  const sound = name => { try { if (SQ.Sound && SQ.Sound[name]) SQ.Sound[name](); } catch (e) { /* optional */ } };
  const motionOff = () => document.documentElement.dataset.motion === "off";
  const modalOpen = () => !!(SQ.UI && SQ.UI.modalOpen && SQ.UI.modalOpen());
  const toast = o => { if (SQ.UI && SQ.UI.toast) SQ.UI.toast(o); };

  /* ── persistence ─────────────────────────────────────────────── */
  function store() {
    const d = SQ.Store.data;
    if (!d.tools || typeof d.tools !== "object") d.tools = {};
    const t = d.tools;
    if (!t.calc || typeof t.calc !== "object") t.calc = {};
    if (typeof t.calc.deg !== "boolean") t.calc.deg = true;
    if (typeof t.calc.qsize !== "number") t.calc.qsize = 1;
    if (!t.calc.tape || typeof t.calc.tape !== "object" || Array.isArray(t.calc.tape)) t.calc.tape = {};
    if (!t.pad || typeof t.pad !== "object") t.pad = {};
    return t;
  }
  const subj = () => (mounted && mounted.subject) || "_";
  function tape() { const t = store(); return t.calc.tape[subj()] || (t.calc.tape[subj()] = []); }
  function padSlot() { const t = store(); return t.pad[subj()] || (t.pad[subj()] = { notes: "" }); }
  const size = o => { try { return JSON.stringify(o).length; } catch (e) { return 0; } };

  /** Keep data.tools under budget: oldest calculator lines go first (from whichever
      subject has most), then the note being typed is cut to fit. */
  function persist() {
    const t = store();
    let n = size(t);
    while (n > BUDGET) {
      let big = null;
      Object.keys(t.calc.tape).forEach(s => {
        if (t.calc.tape[s].length && (!big || t.calc.tape[s].length > t.calc.tape[big].length)) big = s;
      });
      if (!big) break;
      t.calc.tape[big].shift();
      n = size(t);
    }
    if (n > BUDGET && mounted) {
      const slot = padSlot();
      slot.notes = slot.notes.slice(0, Math.max(0, slot.notes.length - (n - BUDGET)));
    }
    SQ.Store.save();
  }

  /* ── sheets ──────────────────────────────────────────────────── */
  function registerSheet(id, sheet) {
    const s = sheet || {};
    const all = (s.sections || []).map(sec => ({ id: sec.id, title: sec.title || "",
      items: (sec.items || []).filter(it => it && it.id) }));
    /* `filter(item) → bool` is evaluated on every read, so a live setting (Maths
       Advanced's Extension 1 toggle) is respected without re-registering. */
    const filter = typeof s.filter === "function" ? s.filter : null;
    sheets[id] = {
      title: s.title || "Reference sheet",
      render: typeof s.render === "function" ? s.render : null,
      constants: (s.constants || []).filter(c => c && c.id),
      get sections() {
        if (!filter) return all;
        return all.map(sec => ({ id: sec.id, title: sec.title, items: sec.items.filter(it => { try { return filter(it) !== false; } catch (e) { return true; } }) }))
          .filter(sec => sec.items.length);
      }
    };
    return sheets[id];
  }
  const getSheet = id => sheets[id] || null;
  const activeSheet = () => (mounted ? sheets[mounted.subject] || null : null);
  const html = (sheet, s) => (s === undefined || s === null ? "" : sheet && sheet.render ? sheet.render(String(s)) : String(s));

  /* ── the ledger ──────────────────────────────────────────────── */
  const key = (kind, id) => kind + ":" + id;
  const isRevealed = (kind, id) => ledger.revealed.some(r => r.key === key(kind, id));
  const charging = () => !!(mounted && mounted.scored);
  /** Is this entry's content allowed on screen (and in the calculator)? */
  const open = (kind, entry) => entry.free === true || !charging() || isRevealed(kind, entry.id);

  function penalty() {
    const n = ledger.scored ? ledger.revealed.length : 0;
    return Math.round((1 - Math.min(COST_CAP, COST_EACH * n)) * 100) / 100;
  }
  const lookups = () => ledger.revealed.map(r => ({ id: r.id, name: r.name }));
  const lookupLabel = () => {
    if (!ledger.revealed.length) return null;
    return "Off-sheet: " + ledger.revealed.map(r => r.name).join(", ") +
           " (−" + Math.round((1 - penalty()) * 100) + "%)";
  };

  function findEntry(id) {
    const sh = activeSheet();
    if (!sh) return null;
    const c = sh.constants.find(x => x.id === id);
    if (c) return { kind: "const", entry: c };
    for (const sec of sh.sections) {
      const it = sec.items.find(x => x.id === id);
      if (it) return { kind: "item", entry: it };
    }
    return null;
  }

  /** Charge for one locked entry. One-way; distinct entries only; no-op unscored. */
  function charge(kind, entry) {
    if (!charging() || entry.free === true || isRevealed(kind, entry.id)) return false;
    ledger.revealed.push({ key: key(kind, entry.id), id: entry.id, name: entry.name || entry.id });
    sound("snap");
    const pct = Math.round((1 - penalty()) * 100);
    toast({ icon: "🔓", kind: "bad", ms: 3200, text: "<b>Not on the exam sheet.</b> This run now pays " +
      pct + "% less XP" + (pct >= COST_CAP * 100 ? " (that is the cap)." : ".") });
    syncCost();
    return true;
  }
  /** Programmatic reveal for a subject's own UI: reveal("kCoulomb"). */
  function reveal(id) { const f = findEntry(id); return f ? (charge(f.kind, f.entry), true) : false; }
  function resetRun() { ledger = { subject: mounted ? mounted.subject : null, scored: charging(), revealed: [] }; syncCost(); }

  /* ── constants for the calculator ────────────────────────────── */
  function consts() {
    const map = {};
    const sh = activeSheet();
    if (!sh) return map;
    sh.constants.forEach(c => {
      if (!open("const", c) || typeof c.value !== "number") return;
      map[c.id] = c.value;
      (c.aliases || []).forEach(a => { if (!(a in map)) map[a] = c.value; });
    });
    return map;
  }
  function lockedName(word) {
    const sh = activeSheet();
    if (!sh) return null;
    const c = sh.constants.find(x => (x.id === word || (x.aliases || []).indexOf(word) >= 0) && !open("const", x));
    return c || null;
  }

  /* ── mount / unmount ─────────────────────────────────────────── */
  function mount(opts) {
    const o = Object.assign({ calc: true, sheet: true, pad: true }, opts || {});
    teardown();
    const subject = o.subject || (SQ.UI && SQ.UI.context ? SQ.UI.context() : null);
    const scored = o.scored !== false;
    const tabs = [];
    if (o.calc) tabs.push("calc");
    if (o.sheet && subject && sheets[subject]) tabs.push("sheet");
    if (o.pad) tabs.push("pad");
    mounted = { subject, scored, tabs };
    ledger = { subject, scored, revealed: [] };
    unmountsSinceMount = 0;
    tokens = []; mem = 0; second = false; calcError = ""; justEvaluated = false; prevShown = "";
    typing = false; constPicker = false; strokes = [];
    const t = tape();
    ans = t.length ? t[t.length - 1].value : 0;
    if (!tabs.length) return;

    fabEl = U.el("div", { class: "tb-fab sqt-fab", role: "toolbar", "aria-label": "Tools" },
      tabs.map(id => {
        const d = TABS[id];
        const b = U.el("button", { type: "button", class: "tb-fab-btn sqt-fab-btn", dataset: { tab: id },
          title: d.long + " (" + d.key.toUpperCase() + ")", "aria-label": "Open the " + d.long.toLowerCase(),
          on: { click: () => toggle(id) } }, [U.el("span", { text: d.icon })]);
        b.addEventListener("pointerdown", e => e.preventDefault());
        return b;
      }));
    document.body.appendChild(fabEl);
    document.documentElement.dataset.tools = "on";
    window.addEventListener("keydown", onKeyCapture, true);
    window.addEventListener("keydown", onKeyShortcut);
    document.addEventListener("focusin", onFocusIn);
  }

  function teardown() {
    close();
    if (fabEl) { fabEl.remove(); fabEl = null; }
    window.removeEventListener("keydown", onKeyCapture, true);
    window.removeEventListener("keydown", onKeyShortcut);
    document.removeEventListener("focusin", onFocusIn);
    delete document.documentElement.dataset.tools;
    lastInput = null;
  }

  function unmount() {
    const was = !!mounted;
    teardown();
    mounted = null;
    strokes = [];
    unmountsSinceMount++;
    if (!was && unmountsSinceMount >= 2) ledger = { subject: null, scored: false, revealed: [] };
  }

  function onFocusIn(e) {
    const n = e.target;
    const view = document.getElementById("view");
    if (view && view.contains(n) && /^(INPUT|TEXTAREA)$/.test(n.tagName) &&
        !/^(button|checkbox|radio|range|submit|reset|file|color)$/i.test(n.type || "")) lastInput = n;
  }

  /* ── the dock ────────────────────────────────────────────────── */
  const isOpen = () => !!dockEl;

  function toggle(id) {
    if (dockEl && tab === id) { close(); return; }
    openTab(id);
  }

  function openTab(id) {
    if (!mounted || !mounted.tabs.length) return false;
    const want = mounted.tabs.indexOf(id) >= 0 ? id : mounted.tabs[0];
    if (!dockEl) build();
    sound("click");
    setTab(want);
    return true;
  }

  function build() {
    tabsEl = U.el("div", { class: "tb-tabs sqt-tabs", role: "tablist" }, mounted.tabs.map(id => {
      const d = TABS[id];
      const b = U.el("button", { type: "button", class: "tb-tab sqt-tab", role: "tab", dataset: { tab: id },
        "aria-label": d.long, on: { click: () => setTab(id) } }, [
        U.el("span", { text: d.icon + " " }),
        U.el("span", { class: "sqt-long", text: d.long }),
        U.el("span", { class: "sqt-short", text: d.short })
      ]);
      b.addEventListener("pointerdown", e => e.preventDefault());
      return b;
    }));
    const iconBtn = (text, label, fn, cls) => {
      const b = U.el("button", { type: "button", class: "tb-close sqt-icon " + (cls || ""), text, "aria-label": label, title: label,
        on: { click: fn } });
      b.addEventListener("pointerdown", e => e.preventDefault());
      return b;
    };
    sizeBtns = U.el("div", { class: "sqt-sizes" }, [
      iconBtn("▼", "Show less of the question", () => resizeMirror(-1), "sqt-less"),
      iconBtn("▲", "Show more of the question", () => resizeMirror(1), "sqt-more")
    ]);
    mirrorEl = U.el("div", { class: "tb-qmirror sqt-q", "aria-label": "The question you are answering", hidden: true });
    bodyEl = U.el("div", { class: "tb-body sqt-body" });
    sheetEl = U.el("div", { class: "tb-sheet sqt-sheet", role: "dialog", "aria-label": "Tools" }, [
      U.el("div", { class: "tb-grab" }),
      U.el("div", { class: "tb-head sqt-head" }, [tabsEl, sizeBtns, iconBtn("✕", "Close the tools (Esc)", close)]),
      mirrorEl, bodyEl
    ]);
    dockEl = U.el("div", { class: "sqt-dock" }, [sheetEl]);
    document.body.appendChild(dockEl);
    applyMirrorSize();

    /* If an answer field was focused, the soft keyboard is up over the tray. Drop it. */
    const a = document.activeElement;
    if (a && /^(INPUT|TEXTAREA)$/.test(a.tagName)) a.blur();

    if (window.MutationObserver) {
      const view = document.getElementById("view");
      let queued = false;
      observer = new MutationObserver(() => {
        if (queued) return;
        queued = true;
        requestAnimationFrame(() => { queued = false; syncMirror(); });
      });
      if (view) observer.observe(view, { childList: true, subtree: true, characterData: true });
    }
    if (window.ResizeObserver) { resizeObs = new ResizeObserver(() => reserve(false)); resizeObs.observe(sheetEl); }
  }

  function close() {
    if (panelCleanup) { panelCleanup(); panelCleanup = null; }
    if (observer) { observer.disconnect(); observer = null; }
    if (resizeObs) { resizeObs.disconnect(); resizeObs = null; }
    if (dockEl) { dockEl.remove(); dockEl = null; }
    sheetEl = bodyEl = mirrorEl = tabsEl = sizeBtns = costChip = null;
    tab = null; typing = false; constPicker = false; calcRedraw = null;
    document.documentElement.style.removeProperty("--sheet-h");
    delete document.documentElement.dataset.sheet;
    if (fabEl) U.$$(".sqt-fab-btn", fabEl).forEach(b => b.classList.remove("on"));
  }

  function setTab(id) {
    if (!dockEl) return;
    if (panelCleanup) { panelCleanup(); panelCleanup = null; }
    tab = id;
    typing = false; constPicker = false; calcRedraw = null; costChip = null;
    U.$$(".sqt-tab", tabsEl).forEach(b => {
      const on = b.dataset.tab === id;
      b.classList.toggle("on", on);
      b.setAttribute("aria-selected", on ? "true" : "false");
    });
    if (fabEl) U.$$(".sqt-fab-btn", fabEl).forEach(b => b.classList.toggle("on", b.dataset.tab === id));
    sheetEl.dataset.tab = id;
    bodyEl.innerHTML = "";
    bodyEl.scrollTop = 0;
    if (id === "calc") bodyEl.appendChild(calcPanel());
    else if (id === "sheet") bodyEl.appendChild(sheetPanel(bodyEl, { scored: charging() }));
    else bodyEl.appendChild(padPanel());
    syncMirror();
    reserve(true);
  }

  /* ── keeping the question visible ────────────────────────────── */
  function questionEl() {
    const view = document.getElementById("view");
    if (!view) return null;
    return U.$$(".qtext", view).find(n => n.offsetParent !== null || n.getClientRects().length) || null;
  }

  function syncMirror() {
    if (!mirrorEl) return;
    const q = tab === "pad" ? null : questionEl();
    if (!q) {
      mirrorEl.hidden = true; mirrorEl.innerHTML = ""; sizeBtns.hidden = true;
      return;
    }
    const clone = q.cloneNode(true);
    U.$$("button, input, textarea, select, canvas, [contenteditable]", clone).forEach(n => n.remove());
    [clone].concat(U.$$("[id]", clone)).forEach(n => n.removeAttribute("id"));
    const markup = clone.innerHTML;
    if (mirrorEl.dataset.src !== markup) {
      mirrorEl.dataset.src = markup;
      mirrorEl.innerHTML = "";
      mirrorEl.appendChild(U.el("div", { class: "tb-qmirror-body sqt-q-body", html: markup }));
    }
    mirrorEl.hidden = false;
    sizeBtns.hidden = false;
  }

  function resizeMirror(step) {
    const t = store();
    t.calc.qsize = U.clamp((t.calc.qsize | 0) + step, 0, QSIZES.length - 1);
    persist();
    applyMirrorSize();
    reserve(false);
  }
  function applyMirrorSize() {
    const i = store().calc.qsize | 0;
    document.documentElement.style.setProperty("--sqt-q-h", QSIZES[U.clamp(i, 0, QSIZES.length - 1)]);
    if (sizeBtns) {
      sizeBtns.querySelector(".sqt-less").disabled = i <= 0;
      sizeBtns.querySelector(".sqt-more").disabled = i >= QSIZES.length - 1;
    }
  }

  /** Pad the page by the tray's measured height so the question can scroll clear of
      it, and (on open / tab change) scroll the stem to just under the top bar. */
  function reserve(scroll) {
    if (!sheetEl) return;
    const h = Math.round(sheetEl.getBoundingClientRect().height);
    document.documentElement.style.setProperty("--sheet-h", h + "px");
    document.documentElement.dataset.sheet = "on";
    if (!scroll) return;
    const q = questionEl() || U.$("#view .qcard");
    if (!q) return;
    const bar = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--topbar-h")) || 66;
    const y = window.scrollY + q.getBoundingClientRect().top - bar - 10;
    try { window.scrollTo({ top: Math.max(0, y), behavior: motionOff() ? "auto" : "smooth" }); }
    catch (e) { window.scrollTo(0, Math.max(0, y)); }
  }

  /* ── keyboard ────────────────────────────────────────────────── */
  const editable = n => !!n && (/^(INPUT|TEXTAREA|SELECT)$/.test(n.tagName) || n.isContentEditable);

  /* Capture phase: while the tray is open, Esc closes it, and physical typing goes to
     the calculator — and is stopped there, so a mode's own 1–4 / Enter handlers do not
     also answer the question. */
  function onKeyCapture(e) {
    if (!dockEl || modalOpen() || e.ctrlKey || e.metaKey) return;
    const target = e.target;
    if (e.key === "Escape") {
      if (editable(target) && !target.classList.contains("sqt-type")) target.blur();
      e.preventDefault(); e.stopImmediatePropagation(); close(); return;
    }
    if (e.altKey) return;                       // Alt+C/F/W: the shortcut handler
    if (tab !== "calc" || !calcRedraw) return;
    if (target && target.classList && target.classList.contains("sqt-type")) {
      if (e.key === "Enter") { e.preventDefault(); e.stopImmediatePropagation(); act("equals"); }
      else e.stopImmediatePropagation();
      return;
    }
    if (editable(target)) return;
    const k = e.key;
    let handled = true;
    if (k === "Enter" || k === "=") act("equals");
    else if (k === "Backspace") act("del");
    else if (k === "Delete") act("clear");
    else if (k.length === 1 && /[0-9A-Za-z.+\-*/^()!%,|]/.test(k)) typeText(k);
    else handled = false;
    if (handled) { e.preventDefault(); e.stopImmediatePropagation(); }
  }

  /* Bubble phase: C / F / W open the tools. Plain letters only when the screen has no
     lettered answer choices (a mode's "C" is answer C); Alt+letter always works. */
  function onKeyShortcut(e) {
    if (!mounted || e.ctrlKey || e.metaKey || e.defaultPrevented || modalOpen()) return;
    if (editable(e.target)) return;
    const k = (e.key || "").toLowerCase();
    const id = Object.keys(TABS).find(t => TABS[t].key === k);
    if (!id || mounted.tabs.indexOf(id) < 0) return;
    if (!e.altKey && document.querySelector("#view .choice")) return;
    e.preventDefault();
    toggle(id);
  }

  /* ── the calculator ──────────────────────────────────────────── */
  const srcOf = () => tokens.map(t => t.ins).join("");
  const shownOf = () => tokens.map(t => t.show).join("");
  const deg = () => store().calc.deg;

  function result() {
    const s = srcOf();
    if (!s.trim()) return { ok: false, error: "" };
    const opens = (s.match(/\(/g) || []).length - (s.match(/\)/g) || []).length;
    const r = SQ.Expr.evaluate(s + ")".repeat(Math.max(0, opens)), { deg: deg(), ans, mem, consts: consts() });
    if (!r.ok) {
      const m = /unknown name "([A-Za-z0-9]+)"/.exec(r.error || "");
      const c = m && lockedName(m[1]);
      if (c) r.error = (c.name || c.id) + " is not on the exam sheet — reveal it in the Sheet tab (−10%)";
    }
    return r;
  }

  const PRETTY = { "*": "×", "/": "÷", "-": "−" };
  const STARTS_FRESH = /^[0-9.(a-zA-Z|√∛π]/;
  function push(ins, show) {
    calcError = "";
    if (justEvaluated) {
      justEvaluated = false; prevShown = "";
      if (STARTS_FRESH.test(ins) && ins !== "E" && !/^(nCr|nPr)/.test(ins.trim())) tokens = [];
    }
    tokens.push({ ins, show: show === undefined ? ins : show });
    if (second) second = false;
    if (calcRedraw) calcRedraw();
  }
  function typeText(ch) { push(ch, PRETTY[ch] || ch); }

  function act(what) {
    calcError = "";
    switch (what) {
      case "second": second = !second; break;
      case "angle": store().calc.deg = !deg(); persist(); break;
      case "del": tokens.pop(); justEvaluated = false; prevShown = ""; break;
      case "clear": tokens = []; justEvaluated = false; prevShown = ""; break;
      case "negate":
        if (tokens.length) tokens = [{ ins: "-(", show: "−(" }].concat(tokens, [{ ins: ")", show: ")" }]);
        justEvaluated = false;
        break;
      case "equals": {
        const r = result();
        if (!r.ok) { calcError = r.error || "not a complete expression"; sound("wrong"); break; }
        const shown = shownOf();
        const t = tape();
        t.push({ src: shown.slice(0, SRC_MAX), value: r.value });
        if (t.length > TAPE_MAX) t.splice(0, t.length - TAPE_MAX);
        persist();
        ans = r.value;
        prevShown = shown + " =";
        tokens = [{ ins: String(r.value), show: SQ.Expr.format(r.value) }];
        justEvaluated = true;
        break;
      }
      case "memplus": { const r = result(); if (r.ok) mem += r.value; else calcError = r.error || "nothing to add"; break; }
      case "memclear": mem = 0; break;
      case "consts": constPicker = !constPicker; second = false; break;
      case "keyboard": typing = !typing; break;
      case "toAnswer": sendToAnswer(); break;
    }
    if (calcRedraw) calcRedraw();
  }

  function answerTarget() {
    const view = document.getElementById("view");
    if (!view) return null;
    const vis = n => n.offsetParent !== null || n.getClientRects().length > 0;
    const a = U.$$(".js-answer", view).find(n => !n.disabled && !n.readOnly && vis(n));
    if (a) return a;
    if (lastInput && view.contains(lastInput) && !lastInput.disabled && !lastInput.readOnly) return lastInput;
    return null;
  }

  /** Type the current value into the answer — WITHOUT focusing it, which would raise
      the soft keyboard over the keypad. */
  function sendToAnswer() {
    const box = answerTarget();
    if (!box) { calcError = "no answer box on this screen"; return; }
    let r = result();
    if (!r.ok && !srcOf().trim()) r = { ok: true, value: ans };
    if (!r.ok) { calcError = r.error || "work out an answer first"; return; }
    const v = SQ.Expr.plain(r.value);
    if ("value" in box) box.value = v; else box.textContent = v;
    box.dispatchEvent(new Event("input", { bubbles: true }));
    toast({ icon: "🧮", ms: 1600, text: "Sent <b>" + U.escapeHtml(v) + "</b> to the answer — check it before you submit" });
  }

  const K = (label, ins, show, cls, aria) => ({ label, ins, show: show === undefined ? ins : show, cls, aria });
  const A = (label, a, cls, aria) => ({ label, act: a, cls, aria });

  function layout() {
    const s = second;
    return [
      [A("2nd", "second", s ? "accent" : "fn", "second function"), A(deg() ? "DEG" : "RAD", "angle", "fn", "switch degrees or radians"),
       K("(", "("), K(")", ")"), A("DEL", "del", "warn", "delete"), A("AC", "clear", "warn", "clear all")],
      s ? [K("sin⁻¹", "asin(", "sin⁻¹(", "fn"), K("cos⁻¹", "acos(", "cos⁻¹(", "fn"), K("tan⁻¹", "atan(", "tan⁻¹(", "fn"),
           K("x³", "^3", "³", "fn", "cubed"), K("∛", "cbrt(", "∛(", "fn", "cube root"), K("÷", "/", "÷", "op", "divide")]
        : [K("sin", "sin(", "sin(", "fn"), K("cos", "cos(", "cos(", "fn"), K("tan", "tan(", "tan(", "fn"),
           K("x²", "^2", "²", "fn", "squared"), K("√", "sqrt(", "√(", "fn", "square root"), K("÷", "/", "÷", "op", "divide")],
      s ? [K("eˣ", "exp(", "e^(", "fn"), K("10ˣ", "10^(", "10^(", "fn"), K("π", "pi", "π", "fn", "pi"), K("e", "e", "e", "fn"),
           K(",", ",", ",", "fn", "comma"), K("×", "*", "×", "op", "multiply")]
        : [K("ln", "ln(", "ln(", "fn"), K("log", "log(", "log(", "fn"), K("π", "pi", "π", "fn", "pi"), K("e", "e", "e", "fn"),
           K("xʸ", "^", "^", "fn", "to the power"), K("×", "*", "×", "op", "multiply")],
      [K("7", "7"), K("8", "8"), K("9", "9"),
       s ? K("|x|", "abs(", "abs(", "fn", "absolute value") : K("x!", "!", "!", "fn", "factorial"),
       K("1/x", "^(-1)", "⁻¹", "fn", "reciprocal"), K("−", "-", "−", "op", "minus")],
      [K("4", "4"), K("5", "5"), K("6", "6"),
       s ? K("nPr", " nPr ", " P ", "fn", "permutations") : K("nCr", " nCr ", " C ", "fn", "combinations"),
       K("%", "%", "%", "fn", "percent"), K("+", "+", "+", "op", "plus")],
      [K("1", "1"), K("2", "2"), K("3", "3"), A("±", "negate", "fn", "change sign"),
       K("Ans", "ans", "Ans", "fn", "previous answer"), A("=", "equals", "eq", "equals")],
      [K("0", "0"), K(".", ".", ".", "", "point"),
       s ? A("const", "consts", "fn", "sheet constants") : K("×10ˣ", "E", "×10^", "fn", "times ten to the power"),
       s ? A("MC", "memclear", "fn", "memory clear") : A("M+", "memplus", "fn", "memory add"),
       K("MR", "mem", "M", "fn", "memory recall"), A("→ Answer", "toAnswer", "send", "put the result in the answer box")]
    ];
  }

  function calcPanel() {
    const wrap = U.el("div", { class: "calc sqt-calc" });
    const exprLine = U.el("div", { class: "calc-expr", "aria-label": "calculation" });
    const modeChip = U.el("span", { class: "calc-mode" });
    const memChip = U.el("span", { class: "calc-mode sqt-mem", text: "M", hidden: true });
    const resultLine = U.el("div", { class: "calc-result", "aria-live": "polite" });
    const kbd = U.el("button", { type: "button", class: "sqt-kbd", text: "⌨", title: "Type with the device keyboard",
      "aria-label": "Type with the device keyboard", on: { click: () => act("keyboard") } });
    kbd.addEventListener("pointerdown", e => e.preventDefault());
    let typeIn = null;
    const top = U.el("div", { class: "calc-display-top" }, [kbd, exprLine, memChip, modeChip]);
    const display = U.el("div", { class: "calc-display" }, [top, resultLine]);
    const pad = U.el("div", { class: "calc-pad" });
    const picker = U.el("div", { class: "sqt-consts", hidden: true });

    function syncTyping() {
      kbd.classList.toggle("on", typing);
      if (typing && !typeIn) {
        /* Opt-in only: the device keyboard appears because the student asked for it. */
        typeIn = U.el("input", { class: "sqt-type", type: "text", inputmode: "text", autocomplete: "off",
          spellcheck: "false", "aria-label": "Type a calculation" });
        typeIn.value = srcOf();
        typeIn.addEventListener("input", () => {
          tokens = typeIn.value.split("").map(ch => ({ ins: ch, show: ch }));
          justEvaluated = false; calcError = ""; paint(false);
        });
        top.replaceChild(typeIn, exprLine);
        typeIn.focus();
      } else if (!typing && typeIn) {
        typeIn.blur();
        top.replaceChild(exprLine, typeIn);
        typeIn = null;
      }
    }

    function paint(redrawPad) {
      syncTyping();
      if (typeIn) { if (typeIn.value !== srcOf()) typeIn.value = srcOf(); }
      else {
        exprLine.textContent = (prevShown && justEvaluated ? prevShown : shownOf()) || "0";
        requestAnimationFrame(() => { exprLine.scrollLeft = exprLine.scrollWidth; });
      }
      modeChip.textContent = deg() ? "DEG" : "RAD";
      modeChip.className = "calc-mode" + (deg() ? "" : " rad");
      memChip.hidden = !mem;
      const r = result();
      if (calcError) { resultLine.textContent = calcError; resultLine.className = "calc-result bad"; }
      else if (r.ok) { resultLine.textContent = "= " + SQ.Expr.format(r.value); resultLine.className = "calc-result"; }
      else if (/exam sheet/.test(r.error || "")) { resultLine.textContent = r.error; resultLine.className = "calc-result bad"; }
      else { resultLine.textContent = tokens.length ? "…" : ""; resultLine.className = "calc-result dim"; }
      if (redrawPad !== false) drawPad();
    }

    function drawPad() {
      pad.innerHTML = "";
      pad.hidden = constPicker;
      picker.hidden = !constPicker;
      if (constPicker) { drawPicker(); return; }
      layout().forEach(row => row.forEach(k => {
        const b = U.el("button", { type: "button", class: "calc-key " + (k.cls || ""), text: k.label,
          "aria-label": k.aria || k.label });
        /* THE line that keeps the soft keyboard down: a press never moves focus. */
        b.addEventListener("pointerdown", e => e.preventDefault());
        b.addEventListener("mousedown", e => e.preventDefault());
        b.addEventListener("click", () => {
          sound("tap");
          if (k.act) act(k.act); else push(k.ins, k.show);
        });
        pad.appendChild(b);
      }));
    }

    function drawPicker() {
      picker.innerHTML = "";
      const sh = activeSheet();
      const list = sh ? sh.constants.filter(c => typeof c.value === "number") : [];
      picker.appendChild(U.el("div", { class: "sqt-consts-head" }, [
        U.el("span", { class: "tiny muted", text: list.length ? "Tap a constant to use it" : "This subject's sheet has no constants" }),
        U.el("div", { class: "spacer" }),
        U.el("button", { type: "button", class: "btn btn-sm btn-ghost", text: "Keypad", on: { click: () => act("consts") } })
      ]));
      const grid = U.el("div", { class: "sqt-consts-grid" });
      list.forEach(c => {
        const ok = open("const", c);
        const b = U.el("button", { type: "button", class: "sqt-const" + (ok ? "" : " locked"),
          "aria-label": (c.name || c.id) + (ok ? "" : ", locked") });
        b.innerHTML = "<code>" + U.escapeHtml(c.id) + "</code>" +
          (c.symbol ? " <span class='sqt-const-sym'>" + html(sh, c.symbol) + "</span>" : "") +
          "<span class='sqt-const-name'>" + U.escapeHtml(c.name || "") + (ok ? "" : " · 🔒 in the Sheet tab") + "</span>";
        b.addEventListener("pointerdown", e => e.preventDefault());
        b.addEventListener("click", () => {
          if (!ok) { calcError = (c.name || c.id) + " is not on the exam sheet — reveal it in the Sheet tab (−10%)"; constPicker = false; paint(); return; }
          constPicker = false; push(c.id, c.id);
        });
        grid.appendChild(b);
      });
      picker.appendChild(grid);
    }

    wrap.appendChild(display);
    wrap.appendChild(pad);
    wrap.appendChild(picker);
    calcRedraw = () => paint();
    paint();
    return wrap;
  }

  /** Insert text into the calculator from elsewhere (tape, sheet) and show it. */
  function toCalc(ins) {
    if (!mounted || mounted.tabs.indexOf("calc") < 0) return;
    openTab("calc");
    push(ins, ins);
  }

  /* ── the sheet ───────────────────────────────────────────────── */
  function syncCost() {
    if (!costChip) return;
    const n = ledger.revealed.length;
    costChip.hidden = !n || !charging();
    costChip.textContent = "🔓 " + n + " lookup" + (n === 1 ? "" : "s") + " · −" + Math.round((1 - penalty()) * 100) + "%";
  }

  /**
   * The reference sheet panel. Used in the tray; a subject's own reference screen can
   * call SQ.Tools.sheetPanel(host, { subject, scored:false }) to show the whole sheet.
   */
  function sheetPanel(host, opts) {
    const o = opts || {};
    const sh = o.subject ? sheets[o.subject] : activeSheet();
    const scored = o.scored === undefined ? charging() : !!o.scored;
    const wrap = U.el("div", { class: "tb-panel sqt-sheetp" });
    if (!sh) { wrap.appendChild(U.el("p", { class: "muted", text: "No reference sheet for this subject." })); return wrap; }
    const lockedHere = (kind, e) => scored && e.free !== true && !isRevealed(kind, e.id);

    costChip = U.el("span", { class: "chip sqt-cost", hidden: true });
    const search = U.el("input", { class: "sqt-search", type: "search", autocomplete: "off", spellcheck: "false",
      placeholder: "Search the sheet", "aria-label": "Search the sheet" });
    let filter = "all";
    const filters = U.el("div", { class: "tb-filters" });
    [["all", "Everything"], ["free", "✅ On the sheet"], ["locked", "🔒 Not given"]].forEach(([id, label]) => {
      const b = U.el("button", { type: "button", class: "chip chip-btn" + (id === "all" ? " on" : ""), text: label,
        on: { click: () => { filter = id; U.$$(".chip-btn", filters).forEach(c => c.classList.toggle("on", c === b)); draw(); } } });
      filters.appendChild(b);
    });
    const list = U.el("div", { class: "tb-list" });

    wrap.appendChild(U.el("div", { class: "sqt-sheet-top" }, [U.el("b", { text: sh.title }), U.el("div", { class: "spacer" }), costChip]));
    wrap.appendChild(search);
    wrap.appendChild(filters);
    wrap.appendChild(U.el("p", { class: "tiny muted tb-disclaimer", html: scored
      ? "✅ entries are on the exam's own sheet — free. 🔒 entries are not given in the exam: showing one costs " +
        "<b>10% of this run's XP</b> (capped at 30%), and closing the sheet does not refund it."
      : "Practice screen — every entry is open and nothing is charged." }));
    wrap.appendChild(list);

    function matches(kind, e, q) {
      if (!q) return true;
      const hay = [e.name, e.id, e.symbol].concat(lockedHere(kind, e) ? [] : [e.note, e.body, e.unit])
        .filter(Boolean).join(" ").replace(/<[^>]*>/g, " ").toLowerCase();
      return hay.indexOf(q) >= 0;
    }
    function wanted(kind, e) {
      if (filter === "free") return e.free === true;
      if (filter === "locked") return e.free !== true;
      return true;
    }

    function badge(e) {
      return e.free === true
        ? U.el("span", { class: "nesa-badge yes", text: "✅ On the sheet" })
        : U.el("span", { class: "nesa-badge no", text: "🔒 Not given" });
    }

    function payButton(kind, e, onPaid) {
      const atCap = penalty() <= 1 - COST_CAP + 1e-9;
      const b = U.el("button", { type: "button", class: "btn btn-sm tb-reveal sqt-pay",
        "aria-label": "Show " + (e.name || e.id) + (atCap ? "" : ", costing 10 percent of this run") }, [
        U.el("span", { text: atCap ? "Show (at the −30% cap)" : "Show (−10%)" }),
        U.el("span", { class: "tiny muted", text: atCap ? "No further cost this run" : "Not given in the exam — this run pays 10% less" })
      ]);
      b.addEventListener("click", () => { charge(kind, e); onPaid(); });
      return b;
    }

    function constRow(c) {
      const node = U.el("div", { class: "tb-row sqt-row " + (c.free === true ? "is-sheet" : "is-learn"), dataset: { id: c.id } });
      function fill() {
        node.innerHTML = "";
        const locked = lockedHere("const", c);
        node.classList.toggle("locked", locked);
        node.classList.toggle("paid", !locked && c.free !== true && scored);
        node.appendChild(U.el("div", { class: "tb-row-head" }, [U.el("span", { class: "tb-row-name", text: c.name || c.id }), badge(c)]));
        if (locked) { node.appendChild(payButton("const", c, () => { fill(); redrawPays(); })); return; }
        const val = c.display !== undefined ? html(sh, c.display) : U.escapeHtml(SQ.Expr.format(c.value));
        const line = U.el("div", { class: "tb-row-body sqt-const-line" });
        line.innerHTML = (c.symbol ? "<span class='sqt-sym'>" + html(sh, c.symbol) + "</span> = " : "") +
          "<span class='sqt-val'>" + val + "</span>" + (c.unit ? " <span class='sqt-unit'>" + html(sh, c.unit) + "</span>" : "");
        const bits = [line];
        if (mounted && mounted.tabs.indexOf("calc") >= 0 && typeof c.value === "number" && host) {
          bits.push(U.el("button", { type: "button", class: "btn btn-sm btn-ghost sqt-use", text: "→ calc " + c.id,
            "aria-label": "Use " + (c.name || c.id) + " in the calculator", on: { click: () => toCalc(c.id) } }));
        }
        node.appendChild(U.el("div", { class: "sqt-const-wrap" }, bits));
        if (c.note) node.appendChild(U.el("div", { class: "tb-hint", html: html(sh, c.note) }));
      }
      fill();
      node._fill = fill;
      return node;
    }

    function itemRow(it) {
      const node = U.el("div", { class: "tb-row sqt-row " + (it.free === true ? "is-sheet" : "is-learn"), dataset: { id: it.id } });
      function fill() {
        node.innerHTML = "";
        const locked = lockedHere("item", it);
        node.classList.toggle("locked", locked);
        node.classList.toggle("paid", !locked && it.free !== true && scored);
        node.appendChild(U.el("div", { class: "tb-row-head" }, [U.el("span", { class: "tb-row-name", text: it.name || it.id }), badge(it)]));
        /* Locked: the body and note are NOT in the DOM. A blur would be a lie. */
        if (locked) { node.appendChild(payButton("item", it, () => { fill(); redrawPays(); })); return; }
        node.appendChild(U.el("div", { class: "tb-row-body tb-tex", html: html(sh, it.body) }));
        if (it.note) node.appendChild(U.el("div", { class: "tb-hint", html: html(sh, it.note) }));
      }
      fill();
      node._fill = fill;
      return node;
    }

    /* The other locked rows' wording changes once the cap is reached. */
    function redrawPays() { U.$$(".sqt-row.locked", list).forEach(n => n._fill && n._fill()); }

    function group(title, rows) {
      if (!rows.length) return;
      list.appendChild(U.el("div", { class: "tb-group" }, [U.el("span", { text: title }),
        U.el("span", { class: "tb-group-n", text: String(rows.length) })]));
      rows.forEach(r => list.appendChild(r));
    }

    function draw() {
      list.innerHTML = "";
      const q = search.value.trim().toLowerCase();
      group("Constants", sh.constants.filter(c => wanted("const", c) && matches("const", c, q)).map(constRow));
      sh.sections.forEach(sec => group(sec.title, sec.items.filter(it => wanted("item", it) && matches("item", it, q)).map(itemRow)));
      if (!list.childNodes.length) list.appendChild(U.el("p", { class: "tiny muted", text: q ? "Nothing matches “" + q + "”." : "Nothing in this section." }));
    }
    search.addEventListener("input", draw);
    draw();
    syncCost();
    return wrap;
  }

  /* ── the working pad ─────────────────────────────────────────── */
  function padPanel() {
    const wrap = U.el("div", { class: "tb-panel sqt-pad" });
    const canvas = U.el("canvas", { class: "tb-canvas sqt-canvas", "aria-label": "Working-out pad — draw with a finger or stylus" });
    const ctx = canvas.getContext ? canvas.getContext("2d") : null;
    const COLORS = [["accent", "--accent"], ["ink", "--ink"], ["warn", "--warn"], ["bad", "--bad"]];
    const colorOf = name => {
      const f = COLORS.find(c => c[0] === name) || COLORS[0];
      return getComputedStyle(document.documentElement).getPropertyValue(f[1]).trim() || "#39d6c8";
    };
    function fit() {
      if (!ctx) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
      const r = canvas.getBoundingClientRect();
      if (!r.width || !r.height) return;
      canvas.width = Math.round(r.width * dpr);
      canvas.height = Math.round(r.height * dpr);
      redraw();
    }
    /* Points are stored normalised to 0..1, so rotation or a resize redraws the
       working rather than smearing it. */
    function redraw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.lineCap = "round"; ctx.lineJoin = "round";
      const W = canvas.width, H = canvas.height;
      strokes.forEach(st => {
        if (!st.pts.length) return;
        if (st.pts.length < 2) {
          ctx.beginPath(); ctx.fillStyle = colorOf(st.color);
          ctx.arc(st.pts[0][0] * W, st.pts[0][1] * H, (st.width * W) / 400, 0, Math.PI * 2); ctx.fill();
          return;
        }
        ctx.beginPath(); ctx.strokeStyle = colorOf(st.color); ctx.lineWidth = (st.width * W) / 200;
        ctx.moveTo(st.pts[0][0] * W, st.pts[0][1] * H);
        for (let i = 1; i < st.pts.length - 1; i++) {
          const mx = (st.pts[i][0] + st.pts[i + 1][0]) / 2, my = (st.pts[i][1] + st.pts[i + 1][1]) / 2;
          ctx.quadraticCurveTo(st.pts[i][0] * W, st.pts[i][1] * H, mx * W, my * H);
        }
        const last = st.pts[st.pts.length - 1];
        ctx.lineTo(last[0] * W, last[1] * H);
        ctx.stroke();
      });
    }
    let drawing = null;
    const pointAt = e => {
      const r = canvas.getBoundingClientRect();
      return [U.clamp((e.clientX - r.left) / r.width, 0, 1), U.clamp((e.clientY - r.top) / r.height, 0, 1)];
    };
    canvas.addEventListener("pointerdown", e => {
      e.preventDefault();
      try { canvas.setPointerCapture(e.pointerId); } catch (err) { /* synthetic events */ }
      drawing = { color: penColor, width: penWidth, pts: [pointAt(e)] };
      strokes.push(drawing);
      if (strokes.length > 400) strokes.shift();
      redraw();
    });
    canvas.addEventListener("pointermove", e => {
      if (!drawing) return;
      e.preventDefault();
      if (drawing.pts.length < 2000) drawing.pts.push(pointAt(e));
      redraw();
    });
    const stop = () => { drawing = null; };
    ["pointerup", "pointercancel", "pointerleave"].forEach(ev => canvas.addEventListener(ev, stop));

    const tools = U.el("div", { class: "tb-tools sqt-pad-tools" });
    const noFocus = b => { b.addEventListener("pointerdown", e => e.preventDefault()); return b; };
    COLORS.forEach(([name, v]) => {
      const dot = noFocus(U.el("button", { type: "button", class: "tb-pen sqt-pen" + (name === penColor ? " on" : ""),
        "aria-label": "Pen colour " + name, dataset: { color: name } }));
      dot.style.setProperty("--pen", "var(" + v + ")");
      dot.addEventListener("click", () => { penColor = name; U.$$(".sqt-pen", tools).forEach(d => d.classList.toggle("on", d === dot)); });
      tools.appendChild(dot);
    });
    [["S", 1.6, "thin"], ["M", 2.6, "medium"], ["L", 4.4, "thick"]].forEach(([label, w, aria]) => {
      const b = noFocus(U.el("button", { type: "button", class: "chip chip-btn sqt-width" + (w === penWidth ? " on" : ""), text: label,
        "aria-label": "Pen width " + aria }));
      b.addEventListener("click", () => { penWidth = w; U.$$(".sqt-width", tools).forEach(c => c.classList.toggle("on", c === b)); });
      tools.appendChild(b);
    });
    tools.appendChild(U.el("div", { class: "spacer" }));
    tools.appendChild(noFocus(U.el("button", { type: "button", class: "btn btn-sm btn-ghost sqt-undo", text: "↩ Undo",
      on: { click: () => { strokes.pop(); redraw(); } } })));
    tools.appendChild(noFocus(U.el("button", { type: "button", class: "btn btn-sm btn-ghost sqt-clear", text: "Clear",
      on: { click: () => { strokes = []; redraw(); } } })));

    /* the calculator's working tape */
    const tapeBox = U.el("div", { class: "sqt-tape" });
    function drawTape() {
      tapeBox.innerHTML = "";
      const t = tape();
      const hasCalc = mounted && mounted.tabs.indexOf("calc") >= 0;
      tapeBox.appendChild(U.el("div", { class: "tb-group" }, [U.el("span", { text: "Calculator lines" }),
        U.el("span", { class: "tb-group-n", text: String(t.length) }),
        t.length ? U.el("button", { type: "button", class: "btn btn-sm btn-ghost sqt-tape-clear", text: "Clear lines",
          on: { click: () => { tape().length = 0; persist(); drawTape(); } } }) : null]));
      if (!t.length) tapeBox.appendChild(U.el("p", { class: "tiny muted", text: "Every = you press lands here. Tap a result to use it again." }));
      t.slice().reverse().forEach(line => tapeBox.appendChild(U.el("div", { class: "sqt-tape-line" }, [
        U.el("span", { class: "sqt-tape-src", text: line.src }),
        U.el("button", { type: "button", class: "btn btn-sm btn-ghost sqt-tape-val", text: "= " + SQ.Expr.format(line.value),
          disabled: !hasCalc, "aria-label": "Use " + SQ.Expr.format(line.value) + " in the calculator",
          on: { click: () => toCalc(SQ.Expr.plain(line.value, 15)) } })
      ])));
    }
    drawTape();

    /* typed notes — persisted per subject, ≤ 4 kB */
    const notes = U.el("textarea", { class: "tb-notes sqt-notes", rows: "4", spellcheck: "false", maxlength: String(NOTES_MAX),
      "aria-label": "Working notes", placeholder: "…or type your working here. Saved automatically." });
    notes.value = padSlot().notes || "";
    const full = U.el("div", { class: "tiny muted sqt-notes-full", hidden: true, text: "Notes are full — the rest was not kept." });
    notes.addEventListener("input", () => {
      const slot = padSlot();
      slot.notes = notes.value.slice(0, NOTES_MAX);
      persist();
      const kept = padSlot().notes;
      full.hidden = kept.length >= notes.value.length;
      if (kept.length < notes.value.length) notes.value = kept;
    });

    wrap.appendChild(U.el("p", { class: "tiny muted", style: "margin:0", text: "Free, always. Working out is not a crutch — it is the subject." }));
    wrap.appendChild(U.el("div", { class: "tb-canvas-wrap" }, [canvas]));
    wrap.appendChild(tools);
    wrap.appendChild(notes);
    wrap.appendChild(full);
    wrap.appendChild(tapeBox);

    setTimeout(fit, 0);
    const onResize = () => fit();
    window.addEventListener("resize", onResize);
    panelCleanup = () => window.removeEventListener("resize", onResize);
    return wrap;
  }

  return {
    registerSheet, getSheet, mount, unmount, penalty, lookups,
    /* extensions */
    open: openTab, close, toggle, isOpen, mounted: () => (mounted ? Object.assign({}, mounted) : null),
    tab: () => tab, reveal, isRevealed: id => { const f = findEntry(id); return !!f && isRevealed(f.kind, f.entry.id); },
    lookupLabel, resetRun, constants: consts, sheetPanel: (host, o) => sheetPanel(host || null, o),
    COST_EACH, COST_CAP,
    /* for tests */
    get state() { return { tokens: tokens.slice(), ans, mem, second, deg: mounted ? deg() : true, error: calcError,
                            strokes: strokes.map(s => s.pts.length) }; }
  };
})();
