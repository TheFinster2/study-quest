/* Physics' view of the shared UI shell.

   The router, header, toasts, modals, game chrome and the reward pipeline are the
   app's (SQ.UI). This binds them for "phys" and adds back the few helpers the
   Newton's Notebook modes call — most importantly the READ-PACE GATE, which in the
   stand-alone app lived inside award() and is kept here, in front of the shared
   award(), for the same reason it was put there in the first place:

     tests/exploit.js found four modes (Graph Story, Circuit Bench, Derivation
     Chain, Survival) where a scripted clicker earned between 3,000 and 167,000 XP
     per hour, because only two modes implemented the check themselves. Gating in
     the one function every reward already flows through is the only version of
     this that cannot drift.

   The per-answer floor is now the shared, length-scaled one (SQ.UI.readFloor):
   1.2 s plus 12 ms a word, capped at 4 s. A mode passes the stem to pace.show(). */
window.PHYS = window.PHYS || {};

PHYS.UI = (function () {
  const U = PHYS.U;
  const MIN_READ_MS = SQ.UI.MIN_READ_MS;

  /**
   * A pace tracker. Every mode makes one, calls show(stem) when it puts something
   * in front of the player, mark() when they respond, and passes it to award() as
   * `pace`. mark() returns true when that single response was too fast to have
   * involved reading, so the mode can also zero that item's own XP.
   */
  function pacer() {
    let shownAt = Date.now(), floor = MIN_READ_MS;
    let items = 0, tooFast = 0;
    return {
      show(text) {
        shownAt = Date.now();
        floor = text ? SQ.UI.readFloor(String(text)) : MIN_READ_MS;
      },
      mark() {
        items++;
        const fast = Date.now() - shownAt < floor;
        if (fast) tooFast++;
        shownAt = Date.now();
        return fast;
      },
      get floor() { return floor; },
      get items() { return items; },
      get tooFast() { return tooFast; },
      get allTooFast() { return items > 0 && tooFast >= items; }
    };
  }

  /**
   * award(opts) — { xp, bonus, accuracy, coins, pace, at, silent, raw, boost }.
   * Applies the pace gate, then hands everything to the shared pipeline.
   */
  function award(opts) {
    const o = Object.assign({}, opts || {});
    let xp = Math.max(0, o.xp || 0), bonus = Math.max(0, o.bonus || 0);
    let coins = Math.max(0, o.coins || 0);
    const pace = o.pace;
    delete o.pace;
    /* If EVERY interaction in the run happened faster than a person can read, the
       run pays nothing at all — the completion bonus and the coins included. */
    if (pace && pace.items > 0 && pace.tooFast >= pace.items) { xp = 0; bonus = 0; coins = 0; }
    /* Coins follow the XP: a run that pays no XP pays no Joules either. */
    const bonusPays = bonus > 0 && !(o.accuracy !== undefined && o.accuracy < SQ.UI.MIN_BONUS_ACCURACY);
    if (pace && xp <= 0 && !bonusPays) coins = 0;
    /* The off-sheet lookup charge applied to Joules as well as XP, as it did. */
    if (!o.raw) coins = Math.round(coins * SQ.UI.formulaPenalty());
    o.xp = xp; o.bonus = bonus; o.coins = coins;
    return SQ.UI.award("phys", o);
  }

  /**
   * results(opts) — the stand-alone signature, mapped onto SQ.UI.results.
   * { title, correct, total, xp, coins, bonus, extraStats, newBest, onAgain,
   *   review (false hides "Review the working"), penalties, backTo }
   */
  function results(opts) {
    const o = Object.assign({}, opts);
    const pens = (o.penalties || []).filter(Boolean);
    if (pens.length) o.extraStats = (o.extraStats || []).concat([["Helpers used", pens.join(" · ")]]);
    if (o.review !== false && !o.onReview) o.onReview = true;
    delete o.review; delete o.penalties; delete o.reviewLabel;
    return SQ.UI.results("phys", o);
  }

  /** A notation-rendered chip (units, symbols). */
  function mchip(src, cls) {
    return U.el("span", { class: "chip " + (cls || ""), html: U.math(src) });
  }

  /**
   * Keyboard play for a multiple-choice card: 1–4 or A–D picks an option, Enter
   * presses the card's "Next" button once it has appeared. Removed on leaving.
   */
  function mcqKeys(root) {
    const onKey = e => {
      if (SQ.UI.modalOpen() || e.ctrlKey || e.metaKey || e.altKey) return;
      const t = e.target;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT")) return;
      if (!document.contains(root)) return;
      const k = e.key.toLowerCase();
      const idx = "1234".indexOf(k) >= 0 ? "1234".indexOf(k) : "abcd".indexOf(k);
      if (idx >= 0 && k.length === 1) {
        const btn = U.$$(".choice", root)[idx];
        if (btn && !btn.disabled) { e.preventDefault(); btn.click(); }
        return;
      }
      if (e.key === "Enter") {
        const next = U.$$(".btn-primary", root).filter(b => !b.disabled && b.offsetParent !== null).pop();
        if (next && document.activeElement !== next) { e.preventDefault(); next.click(); }
      }
    };
    document.addEventListener("keydown", onKey);
    SQ.UI.onLeave(() => document.removeEventListener("keydown", onKey));
  }

  const UI = SQ.UI.bind("phys", {
    nav: [
      { key: "home",     icon: "🍎", label: "Lab" },
      { key: "play",     icon: "🎮", label: "Play" },
      { key: "study",    icon: "🃏", label: "Study" },
      { key: "progress", icon: "📈", label: "Progress" },
      { key: "shop",     icon: "🛒", label: "Shop" }
    ],
    navMap: { game: "play", boss: "play", reference: "study", achievements: "progress", options: "progress" },
    coinRate: 0.75,
    tools: { calc: true, sheet: true, pad: true },
    extend: {
      award, results, pacer, mchip, mcqKeys,
      handleRoute: () => SQ.UI.handleRoute(),
      applyTheme: t => SQ.UI.setSubjectTheme("phys", t)
    }
  });
  return UI;
})();
