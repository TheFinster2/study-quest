/* ═══════════════════════════════════════════════════════════════
   The ONE place the Advanced / Extension 1 decision lives.

   In the stand-alone app this was a build-time constant. In StudyQuest it is a
   subject setting on the Options screen — "I study Extension 1", ON by default
   — stored as the coverage tag "ME" (S.setTagHidden("ME", true) hides it), so
   it follows the shared coverage rule: hiding content never changes payouts.

   MX.DATA.TIERS is a live getter, so every reader of it — Bank.all(), the mode
   list, the bosses, the achievements, formulas, cards, proofs, generators and
   reference sheets — sees the current choice. Anything that caches a filtered
   list keys its cache on MX.DATA.tierKey() and rebuilds when it changes.

   What follows from the toggle:
   · the ME- question banks, flashcards, proofs, generators, formulas and
     reference sheets drop out of every pool;
   · Vector Lab, the Induction Builder and the sixth boss disappear;
   · Extension achievements are filtered out rather than shown as permanently
     unobtainable.

   Tests (tests/subjects/mext/validate.js) set MX.DATA.__forceTiers to check
   BOTH configurations in one process. Nothing in the app sets it.
   ═══════════════════════════════════════════════════════════════ */
window.MX = window.MX || {};
MX.DATA = MX.DATA || {};

MX.DATA.__forceTiers = null;

Object.defineProperty(MX.DATA, "TIERS", {
  configurable: true, enumerable: true,
  get() {
    if (MX.DATA.__forceTiers) return MX.DATA.__forceTiers.slice();
    /* Advanced and Extension 1 are separate StudyQuest subjects: this one is pinned. */
    return ["ME"];
  },
  /* Kept assignable so a test (or a console) can pin a configuration. */
  set(v) { MX.DATA.__forceTiers = Array.isArray(v) ? v.slice() : null; }
});

/** A short key for the current configuration — caches rebuild when it changes. */
MX.DATA.tierKey = () => MX.DATA.TIERS.join("+");

/** True when the Extension 1 tier is switched on. */
MX.DATA.hasExt = () => MX.DATA.TIERS.indexOf("ME") >= 0;

/** The tier a topic code belongs to: "MA-C2" → "MA". */
MX.DATA.tierOf = code => String(code || "").split("-")[0];

/** Is this topic code part of the current configuration? */
MX.DATA.tierEnabled = code => MX.DATA.TIERS.indexOf(MX.DATA.tierOf(code)) >= 0;

/** A tiny cache helper: rebuilds `fn()` whenever the tier configuration changes. */
MX.DATA.tierCached = function (fn) {
  let key = null, val = null;
  const get = () => {
    const k = MX.DATA.tierKey();
    if (k !== key) { key = k; val = fn(); }
    return val;
  };
  get.reset = () => { key = null; };
  return get;
};

MX.DATA.TIER_META = {
  MA: { id: "MA", name: "Mathematics Advanced", short: "Advanced", chip: "ADV" },
  ME: { id: "ME", name: "Mathematics Extension 1", short: "Extension 1", chip: "EXT" }
};
