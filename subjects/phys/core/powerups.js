/* Power-ups in Physics' modes. They are the app's (bought once with Stars, kept in
   SQ.Store.data.inventory, consumed through S.usePowerup, which refuses one the
   difficulty bans). This file holds the pieces the quiz engine and the bosses share:
   the button row and the Insight hint.

     fifty   remove two wrong options                       (quiz)
     skip    move past a question unanswered                 (quiz)
     freeze  +15 s on the clock                              (quiz timed modes, boss)
     shield  the next wrong answer keeps your streak /       (quiz)
             blocks the boss's next hit                      (boss)
     double  armed before the first answer: ×2 XP for the    (quiz, boss)
             run via award({ boost: 2 }), capped by the core's ×4
     insight the question's topic and a named trap           (quiz, boss)
     revive  survive one knockout — automatic                (Survival, boss)  */
window.PHYS = window.PHYS || {};

PHYS.Powerups = (function () {
  const U = PHYS.U;
  const META = {
    fifty:   { icon: "✂️", label: "50:50" },
    skip:    { icon: "⏭️", label: "Skip" },
    freeze:  { icon: "🧊", label: "Freeze" },
    shield:  { icon: "🛡️", label: "Shield" },
    double:  { icon: "✖️", label: "Double XP" },
    insight: { icon: "🔍", label: "Insight" }
  };

  /** One power-up button. `off` disables it for a mode-specific reason. */
  function button(id, off, onUse, why) {
    const S = PHYS.State;
    const inv = SQ.Store.data.inventory;
    const banned = S.powerupBanned(id);
    const m = META[id];
    return U.el("button", {
      class: "pu", "data-pu": id, disabled: (off || banned || (inv[id] || 0) <= 0) || undefined,
      title: banned ? "Banned on " + S.difficulty().name : (why || m.label),
      "aria-label": m.label + " (" + (inv[id] || 0) + " left)",
      on: { click: () => { if (S.usePowerup(id)) { PHYS.Sound.snap(); onUse(); } } }
    }, [U.el("span", { text: m.icon }), U.el("span", { text: m.label }),
        U.el("span", { class: "pu-n", text: banned ? "⛔" : "×" + (inv[id] || 0) })]);
  }

  /** The Insight hint: the topic, a named trap (the misconception behind a wrong
      option), and the formulas filed under that topic. Never the answer. */
  function insight(q) {
    const traps = (q.why || []).map((w, i) => (i !== q.a && w ? w : null)).filter(Boolean);
    const eqs = (PHYS.DATA.equations || []).filter(e => e.topic === q.topic).slice(0, 3);
    const box = U.el("div", { class: "feedback insight", "data-insight": "1" });
    box.appendChild(U.el("div", { html: "<b>🔍 Insight</b> — " + U.escapeHtml(PHYS.Bank.moduleName(q.mod)) +
      " · " + U.escapeHtml(q.topic || "") }));
    if (traps.length) box.appendChild(U.el("span", { class: "misc", html: "A common trap: some students " + U.math(U.pick(traps)) + "." }));
    if (eqs.length) box.appendChild(U.el("div", { class: "tiny", style: "margin-top:6px", html:
      "Formulas for this topic: " + eqs.map(e => U.math(e.formula)).join(" &nbsp;·&nbsp; ") }));
    else if (!traps.length) box.appendChild(U.el("div", { class: "tiny", text: "Name the quantity being asked for before choosing." }));
    return box;
  }

  /** Revive, consumed automatically on a knockout. → true if it fired. */
  function tryRevive() {
    const S = PHYS.State;
    if (S.powerupBanned("revive") || (SQ.Store.data.inventory.revive || 0) <= 0) return false;
    if (!S.usePowerup("revive")) return false;
    PHYS.UI.toast({ icon: "💖", kind: "good", text: "<b>Revive!</b> You get back up — once." });
    return true;
  }

  return { META, button, insight, tryRevive };
})();
