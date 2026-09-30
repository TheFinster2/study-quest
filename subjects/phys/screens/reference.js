/* The reference sheet: the data sheet's constants, the formulae sheet grouped by
   its own headings, the units table, and worked examples.

   Every constant carries its source note and the significant figures the sheet
   gives it to, because "which value am I supposed to use?" is a real question a
   student asks and getting it wrong makes their correct working look wrong.

   ── Why this file builds strings instead of elements ─────────────────────────
   This is the heaviest single render in the app: roughly 180 rows across the
   constants, the four formula groups, the units table and the worked examples,
   every one of them running the notation renderer. Built element-by-element with
   U.el it measured 128–155 ms of BLOCKING main-thread work at 6× CPU throttling
   (tests/perf.js), which is a visible pause when you tap "Sheet" on a mid-range
   phone and is invisible on a desktop.

   Three changes, all measured at 6× throttling:

     1. each section is assembled as one HTML string and assigned in a single
        innerHTML write;
     2. the finished tree is CACHED, so revisiting the screen costs nothing;
     3. only the FIRST card is filled during the tap that opens the screen. The
        rest are filled one card per idle callback, so no single task is long
        enough to swallow a tap.

   (1) and (2) alone did not help: the cost was the style and layout pass over
   those rows, not building them. `content-visibility:auto` on `.ref-card` fixed
   that (median 128 → 22 ms) but left the FIRST render at 132 ms, because that one
   still builds all eight cards. (3) is what brought the first render down to
   ~24 ms: the work is the same, but it is spread across idle callbacks instead of
   landing inside the interaction.

   If a student types into the search box before the idle fills have finished, the
   remaining cards are built synchronously right then — filtering rows that are not
   in the document yet would silently hide matches, which is worse than a pause.

   Anything interpolated is either U.math() output (which escapes first) or passed
   through escapeHtml here. */
window.PHYS = window.PHYS || {};
PHYS.Screens = PHYS.Screens || {};

PHYS.Screens.reference = (function () {
  /* Built once per session. The content is static — only the search filter and the
     theme change, and the theme is CSS. */
  let cached = null;

  /* Cards whose rows have been composed but not yet inserted, oldest first. */
  let queued = [];
  let scheduled = false;

  const idle = window.requestIdleCallback
    ? (fn) => window.requestIdleCallback(fn, { timeout: 400 })
    : (fn) => setTimeout(fn, 16);

  function fillOne() {
    const next = queued.shift();
    if (next) next.node.insertAdjacentHTML("beforeend", next.compose());
  }

  function schedule() {
    if (scheduled || !queued.length) return;
    scheduled = true;
    idle(() => { scheduled = false; fillOne(); schedule(); });
  }

  /** Build everything still queued, now. */
  function flush() { while (queued.length) fillOne(); }

  function build() {
    const U = PHYS.U, Un = PHYS.Units, C = PHYS.DATA.constants;
    const e = s => U.escapeHtml(String(s === undefined || s === null ? "" : s));
    const m = s => U.math(s);

    const wrap = U.el("div", { class: "grid" });
    wrap.appendChild(U.el("h1", { text: "Reference" }));
    wrap.appendChild(U.el("p", { class: "muted", html:
      "The values and formulas you get in the exam. This app computes with <b>exactly</b> these " +
      "numbers at exactly this precision, so its answers agree with your working." }));

    const search = U.el("input", { class: "ref-search", type: "search",
      placeholder: "Search constants, formulas, units…", "aria-label": "search the reference sheet" });
    /* The calculator belongs here as much as in a game: this is the screen you are
       on when you want to check a value and then use it. */
    /* The calculator is the app's tool tray now (SQ.Tools), opened from any game. */
    wrap.appendChild(U.el("div", { class: "row" }, [search]));

    const sections = U.el("div", { class: "grid" });
    wrap.appendChild(sections);

    /* One card, assembled as a single string and written once. The heading goes in
       straight away so the screen reads as a list of sections from the first frame;
       the rows are queued for the next idle callback. */
    let first = true;
    const card = (title, rowsFn, footer) => {
      const node = U.el("div", { class: "card ref-card" });
      node.innerHTML = "<h3>" + e(title) + "</h3>";
      sections.appendChild(node);
      /* A thunk, not a string: composing the rows runs the notation renderer over
         every one of them, which is most of the cost being deferred. */
      const compose = () => rowsFn() + (footer || "");
      if (first) { node.insertAdjacentHTML("beforeend", compose()); first = false; }
      else queued.push({ node, compose });
      return node;
    };
    const row = (search, left, body) =>
      `<div class="ref-row" data-search="${e(search.toLowerCase())}">` +
      `<div class="ref-sym">${left}</div><div class="ref-body">${body}</div></div>`;

    /* ── constants ── */
    card("Data sheet — constants",
      () => C.list().map(c => row(
        c.name + " " + c.sym + " " + c.disp,
        m(c.sym),
        `<span class="ref-val">${m(U.fmtSig(c.value, c.sf) + (c.disp ? " \\u{" + c.disp + "}" : ""))}</span>` +
        `<span class="ref-note">${e(c.name)} · ${c.sf} s.f.` +
        (c.sheet ? "" : " · NOT on the data sheet" +
          (c.derived ? ", derived from " + e(U.mathPlain(c.derived)) : "")) + "</span>" +
        (c.note ? `<span class="ref-note">${m(c.note)}</span>` : "")
      )).join(""),
      `<p class="tiny muted" style="margin-top:12px">Values that are <b>not</b> on the sheet are ` +
      `marked. A question that needs one must state it in its own wording — which is exactly ` +
      `what the exam does.</p>`);

    /* ── values a question must supply ── */
    card("Not on the sheet — a question must give you these",
      () => Object.entries(C.supplied).map(([id, s]) => row(
        s.name + " " + id, e(id),
        `<span class="ref-val">${m(U.fmtSig(s.value, s.sf) + " \\u{" + s.disp + "}")}</span>` +
        `<span class="ref-note">${e(s.name)}</span>`
      )).join(""));

    /* ── formulae, grouped by the sheet's own headings ── */
    const groups = [];
    PHYS.DATA.equations.forEach(eq => {
      if (groups.indexOf(eq.group) < 0) groups.push(eq.group);
    });
    for (const g of groups) {
      card(g, () => PHYS.DATA.equations.filter(eq => eq.group === g).map(eq =>
        `<div class="ref-row" data-search="${e((eq.name + " " + U.mathPlain(eq.formula) + " " + eq.topic).toLowerCase())}">` +
        `<div class="ref-body" style="flex:1.3"><span class="eqn">${m(eq.formula)}</span></div>` +
        `<div class="ref-body"><span>${e(eq.name)}</span>` +
        `<span class="ref-note">${e(eq.mod)} · ${e(eq.topic)}` +
        (eq.sheet ? "" : " · <b>not on the formulae sheet</b>" +
          (eq.sheetNote ? " — " + e(eq.sheetNote) : "")) + `</span></div></div>`
      ).join(""));
    }

    /* ── units ── */
    card("Quantities and their units",
      () => Un.QUANTITIES.map(q => row(
        q.name + " " + q.unit + " " + q.sym,
        m(q.sym),
        `<span>${e(q.name)}</span><span class="ref-note">${m(q.unit)}` +
        (Object.keys(q.dim).length ? " &nbsp;=&nbsp; " + m(Un.baseStr(q.dim)) : "") + "</span>"
      )).join(""),
      `<p class="tiny muted" style="margin-top:12px">Base units are given too, because a ` +
      `dimension check is the fastest way to catch a rearrangement error. If the dimensions of ` +
      `your answer are wrong, the algebra is wrong.</p>`);

    /* ── worked examples ── */
    const wex = () => (PHYS.DATA.workedExamples || []).map(w => {
      const steps = (w.steps || []).map((st, i) =>
        `<div class="wstep"><span class="wstep-n">${i + 1}</span><span class="wstep-b">` +
        (st.eq ? `<span>${m(st.eq)}</span>` : "") +
        (st.note ? `<span class="wstep-note">${m(st.note)}</span>` : "") +
        `</span></div>`).join("");
      return `<details class="wex" data-search="${e((w.title + " " + w.topic + " " + U.mathPlain(w.question)).toLowerCase())}">` +
        `<summary>${e(w.title)}  ·  ${e(w.mod)}</summary>` +
        `<div class="wex-body"><p>${m(w.question)}</p><div class="working">${steps}</div>` +
        (w.trap ? `<div class="feedback no" style="margin-top:10px"><b>The usual mistake:</b> ${m(w.trap)}</div>` : "") +
        `</div></details>`;
    }).join("");
    card("Worked examples",
      () => `<p class="tiny muted">Fully worked, with the misconception each one is guarding ` +
      `against named at the end.</p>` + wex());

    /* ── search ── */
    search.addEventListener("input", () => {
      /* Filtering rows that have not been inserted yet would hide matches without
         saying so, so a search always waits for the whole sheet. */
      flush();
      const q = search.value.trim().toLowerCase();
      for (const node of U.$$("[data-search]", sections)) {
        node.hidden = !!q && node.dataset.search.indexOf(q) < 0;
      }
      // Hide a whole card whose every row is filtered out.
      for (const c of U.$$(".ref-card", sections)) {
        const rows = U.$$("[data-search]", c);
        if (!rows.length) continue;
        c.hidden = rows.every(r => r.hidden);
      }
    });

    return wrap;
  }

  function reference(view) {
    if (!cached) cached = build();
    view.appendChild(cached);
    schedule();
    /* handleRoute clears #view with innerHTML = "", which detaches but does not
       destroy the cached tree, so its listeners and any open <details> survive. */
  }

  /* For tests: tests/perf.js drives the idle fills itself, one card at a time, so
     that the deferred work is measured rather than merely moved out of sight. */
  reference.ready = () => queued.length === 0;
  reference.fillNext = fillOne;
  reference.flush = flush;
  return reference;
})();
