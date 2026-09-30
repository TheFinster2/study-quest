/* Chemistry's view of the shared UI. The router, header, toasts, modals, the reward
   pipeline, gameShell and results are the app's (js/sq/ui.js); this binds them to
   "chem" and adds the two helpers MoleQuest's modes call that the core lacks:

     answerPad(input)  the ×10ⁿ and − keys a phone's decimal keypad doesn't have, and
                       the "reading this as 1.5 × 10⁻⁴" echo
     handleRoute()     re-run the current route ("Play again")                       */
window.CHEM = window.CHEM || {};

CHEM.UI = (function () {
  const U = CHEM.U;

  function answerPad(input) {
    const echo = U.el("div", { class: "pad-echo tiny muted" });

    function insert(text) {
      const start = input.selectionStart === null ? input.value.length : input.selectionStart;
      const end = input.selectionEnd === null ? start : input.selectionEnd;
      input.value = input.value.slice(0, start) + text + input.value.slice(end);
      const at = start + text.length;
      input.focus();
      try { input.setSelectionRange(at, at); } catch (e) { /* not all inputs support it */ }
      update();
      CHEM.Sound.type();
    }

    function update() {
      const raw = input.value.trim();
      if (!raw) { echo.textContent = ""; return; }
      const v = U.parseNum(raw);
      echo.textContent = isFinite(v) ? "reading this as " + U.sci(v) : "can't read that as a number yet";
      echo.classList.toggle("bad", !isFinite(v));
    }

    const key = (label, text, title) => U.el("button", {
      class: "btn btn-sm pad-key", type: "button", text: label, title: title,
      on: { click: () => insert(text) }
    });

    const row = U.el("div", { class: "pad" }, [
      key("×10ⁿ", "e", "Times ten to the power of — type the exponent after it"),
      key("−", "-", "Minus"),
      U.el("div", { class: "spacer" }),
      echo
    ]);
    input.addEventListener("input", update);
    return row;
  }

  return SQ.UI.bind("chem", {
    nav: [
      { key: "home",     icon: "🏠", label: "Lab" },
      { key: "play",     icon: "🎮", label: "Play" },
      { key: "study",    icon: "🃏", label: "Study" },
      { key: "progress", icon: "📈", label: "Progress" },
      { key: "shop",     icon: "🛒", label: "Shop" }
    ],
    navMap: { game: "play", boss: "play", achievements: "progress", options: "progress" },
    coinRate: 0.75,
    /* Calculator and working pad are free (you sit the HSC with both). The sheet is
       registered in manifest.js; only its off-sheet items cost. */
    tools: { calc: true, sheet: true, pad: true },
    extend: {
      answerPad,
      handleRoute: () => SQ.UI.handleRoute()
    }
  });
})();
