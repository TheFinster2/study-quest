/* English Advanced (Close Reading) — subject manifest.
   Script order IS the dependency graph (the stand-alone index.html's four tiers):
     core primitives → data (pure literals on EN.DATA) → state/ui/bank → games → screens.
   state.js loads after the data because the factory reads the level titles at create().

   NOT listed, deliberately: subjects/eng/vendor/transformers/transformers.min.js. It is
   an ES module imported lazily by core/mark.js only when a student has opted in to
   sentence marking — exactly as the stand-alone app did. The model and runtime (33 MB)
   must never be precached; see CORE-REQUESTS.md. */
(function () {
  const B = "subjects/eng/";
  const js = [
    "core/util.js", "core/mark.js", "core/audio.js", "core/fx.js",
    "data/meta.js", "data/techniques.js", "data/rubric.js", "data/concepts.js", "data/texts.js",
    "data/texts/nineteen-eighty-four.js", "data/texts/donne.js", "data/texts/wit.js",
    "data/texts/henry-iv.js", "data/texts/craft.js", "data/texts/the-crucible.js",
    "data/texts/hamlet.js", "data/texts/the-tempest.js", "data/texts/hag-seed.js",
    "data/questions-common.js", "data/questions-modulea.js", "data/questions-moduleb.js",
    "data/questions-modulec.js", "data/questions-core.js", "data/questions-starters.js",
    "data/paragraphs.js", "data/freetext.js", "data/essays.js", "data/shop.js", "data/achievements.js",
    "core/state.js", "core/ui.js", "core/bank.js",
    "games/quiz.js", "games/technique.js", "games/cloze.js", "games/markingdesk.js",
    "games/essayarch.js", "games/layerc.js", "games/paper.js", "games/quotematch.js",
    "games/bandgrid.js", "games/deconstruct.js", "games/boss.js",
    "screens/home.js", "screens/play.js", "screens/vault.js", "screens/reference.js",
    "screens/progress.js", "screens/shop.js", "screens/draft.js", "screens/texts.js",
    "screens/misc.js", "screens/dev.js", "boot.js"
  ];

  SQ.Subjects.manifest("eng", {
    css: [B + "css/eng.css", B + "css/themes.css"],
    scripts: js.map(p => B + p),
    boot: () => EN.boot(),
    importLegacy: old => EN.importLegacy(old)
  });
})();
