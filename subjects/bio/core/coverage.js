/* Biosphere — js/core/coverage.js
   Course coverage packs (brief §8).

   Two rules make this safe rather than exploitable:
     • Hiding content NEVER raises what the remaining questions pay and NEVER
       lowers an achievement target. Achievement targets read Bank.all();
       draws read Bank.active(). Nothing in here touches award().
     • Every topic name, card id and module a pack claims must actually exist,
       or the toggle appears, flips, and silently does nothing. validate.js
       fails the build on a typo.

   Exposes: window.BIO.Coverage */
(function (root) {
  "use strict";

  var BIO = root.BIO = root.BIO || {};
  var U = BIO.U, S = BIO.State;
  var C = {};

  C.packs = function () { return (BIO.DATA.packs || []).slice(); };

  C.pack = function (id) {
    var ps = C.packs();
    for (var i = 0; i < ps.length; i++) if (ps[i].id === id) return ps[i];
    return null;
  };

  /* Does this pack claim this item? */
  function packClaims(pack, item) {
    if (pack.modules && item.mod && pack.modules.indexOf(item.mod) >= 0) {
      // a module pack claims everything in the module unless topics narrow it
      if (!pack.topics) return true;
    }
    if (pack.topics && item.topic && pack.topics.indexOf(item.topic) >= 0) {
      if (!pack.modules) return true;
      return pack.modules.indexOf(item.mod) >= 0;
    }
    if (pack.ids && item.id && pack.ids.indexOf(item.id) >= 0) return true;
    if (pack.tags && item.tags) {
      for (var i = 0; i < pack.tags.length; i++) if (item.tags.indexOf(pack.tags[i]) >= 0) return true;
    }
    return false;
  }

  C.isHiddenItem = function (item) {
    if (!item) return false;
    var packs = C.packs();
    for (var i = 0; i < packs.length; i++) {
      if (!S.isHidden(packs[i].id)) continue;
      if (packClaims(packs[i], item)) return true;
    }
    return false;
  };

  C.hiddenPackIds = function () {
    return C.packs().filter(function (p) { return S.isHidden(p.id); }).map(function (p) { return p.id; });
  };

  /* How much a pack actually removes — shown next to the toggle so the student
     can see the switch is doing something. */
  C.impact = function (packId) {
    var pack = C.pack(packId);
    if (!pack) return null;
    // Derived from Bank.kinds rather than hand-listed, so a new content kind
    // is counted here automatically. A hand-written list is how the chemistry
    // app lost 87 flashcards (defect D4) — the same mistake, one layer up.
    var out = {};
    BIO.Bank.kinds.forEach(function (kind) {
      out[kind] = BIO.Bank.all(kind).filter(function (it) { return packClaims(pack, it); }).length;
    });
    out.diagram = BIO.Bank.diagrams().filter(function (d) { return packClaims(pack, d); }).length;
    out.total = Object.keys(out).reduce(function (a, k) { return k === "total" ? a : a + out[k]; }, 0);
    return out;
  };

  /* Guard: never let coverage empty a mode's pool without saying so. */
  C.warnIfEmpty = function (kind, filter) {
    var act = BIO.Bank.active(kind, filter).length;
    var all = BIO.Bank.all(kind).filter(filter || function () { return true; }).length;
    if (act === 0 && all > 0) {
      BIO.UI.modal({
        title: "Nothing left to ask",
        body: "Course coverage is hiding every question this mode would use. Turn a pack back on in Settings → Course coverage.",
        actions: [
          { label: "Settings", kind: "primary", onclick: function () { BIO.UI.go("/options"); } },
          { label: "Back", kind: "ghost", onclick: function () { BIO.UI.go("/play"); } }
        ]
      });
      return true;
    }
    return false;
  };

  C.packClaims = packClaims;

  BIO.Coverage = C;
})(typeof window !== "undefined" ? window : globalThis);
