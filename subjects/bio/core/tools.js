/* Biosphere — subjects/bio/core/tools.js
   A thin shim over the shared tool tray (SQ.Tools).

   Biosphere had its own docked tray (calculator, working pad, glossary). The
   calculator and pad are now the shared ones, mounted by the shared gameShell.
   What stays here is Biology's policy:

     · Biology's exam supplies no data sheet, so NOTHING in the glossary is free.
       It is registered with SQ.Tools as `free:false` items grouped by module:
       revealing a term mid-run costs XP for that run and the charge latches
       (the shared tray's rule — see CORE-REQUESTS.md for the flat 25% Biosphere
       used to charge).
     · The sheet is withheld entirely in Term Match and Label It, where the
       glossary and the labels ARE the answer key, and in the bosses.

   Exposes: window.BIO.Tools */
(function (root) {
  "use strict";

  var BIO = root.BIO = root.BIO || {};
  var U = BIO.U;
  var T = {};

  T.NO_REFERENCE_MODES = ["termmatch", "labelit", "boss"];
  var mode = null;

  /** Called by every mode before its gameShell. */
  T.startRun = function (modeId) { mode = modeId || null; };
  T.currentMode = function () { return mode; };
  T.referenceAllowed = function (modeId) { return T.NO_REFERENCE_MODES.indexOf(modeId || mode) < 0; };

  /** True once an off-sheet item has been revealed this run (the latch). */
  T.refLatched = function () {
    if (!SQ.Tools) return false;
    var looks = SQ.Tools.lookups ? SQ.Tools.lookups() : [];
    return (looks && looks.length > 0) || (SQ.Tools.penalty ? SQ.Tools.penalty() < 1 : false);
  };

  /* The shared shell mounts and the router unmounts the tray. Kept so mode
     files keep their Biosphere shape. */
  T.attach = function () {};
  T.detach = function () {};

  function slug(s) { return U.norm(s).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }

  /** The glossary as a shared reference sheet, grouped by module. */
  T.sheet = function () {
    var terms = (BIO.DATA.glossary || []).slice().sort(function (a, b) { return a.term < b.term ? -1 : 1; });
    return {
      title: "Biology glossary",
      note: "The HSC Biology exam gives you no data sheet, so every term here is off-sheet: revealing one costs XP for this run.",
      constants: [],
      sections: U.MODULES.map(function (m) {
        return {
          id: "bio-" + m.id.toLowerCase(), title: m.id + " — " + m.name,
          items: terms.filter(function (t) { return t.mod === m.id; }).map(function (t) {
            return { id: "g-" + slug(t.term), name: t.term, body: U.esc(t.def), free: false };
          })
        };
      }).filter(function (s) { return s.items.length; })
    };
  };

  T.register = function () { if (SQ.Tools && SQ.Tools.registerSheet) SQ.Tools.registerSheet("bio", T.sheet()); };

  BIO.Tools = T;
})(typeof window !== "undefined" ? window : globalThis);
