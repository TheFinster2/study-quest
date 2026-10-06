/* The subject registry: light metadata the hub needs WITHOUT loading a subject.

   A subject's code (its content, modes, screens, sounds) lives under
   subjects/<id>/ and is only loaded when the student first opens it — seven
   subjects' worth of scripts is ~130k lines, and nobody studies all seven.
   subjects/<id>/manifest.js lists that subject's scripts and stylesheets in
   dependency order; the loader (loader.js) reads it.

   `ns` is the global the subject's code hangs off. Both maths apps were `MQ` in
   their own repos; here Standard is `MS`, Advanced `MA` and Extension 1 `MX`.
   `legacyKey` is the localStorage key the stand-alone app used, so migrate.js can
   find a student's existing progress on the same origin. */
window.SQ = window.SQ || {};

SQ.Subjects = (function () {
  const LIST = [
    { id: "chem", ns: "CHEM", defaultTheme: "chem-lab", name: "Chemistry", short: "Chem", icon: "⚗️", app: "MoleQuest",
      color: "#39d6c8", currency: { name: "Moles", one: "Mole", icon: "🪙" },
      legacyKey: "molequest.save.v1", group: "Science",
      blurb: "Equilibrium, acids and bases, quantitative analysis, organic chemistry." },
    { id: "phys", ns: "PHYS", defaultTheme: "phys-graphite", name: "Physics", short: "Phys", icon: "🔭", app: "Newton's Notebook",
      color: "#6fa8ff", currency: { name: "Joules", one: "Joule", icon: "⚡" },
      legacyKey: "newtonsnotebook.save.v1", group: "Science",
      blurb: "Motion, fields, electromagnetism, light, the nature of matter." },
    { id: "bio", ns: "BIO", defaultTheme: "bio-verdant", name: "Biology", short: "Bio", icon: "🧬", app: "Biosphere",
      color: "#3fe08a", currency: { name: "Biocredits", one: "Biocredit", icon: "◉" },
      legacyKey: "biosphere.save.v1", group: "Science",
      blurb: "Heredity, genetic change, infectious and non-infectious disease." },
    { id: "econ", ns: "ECON", defaultTheme: "econ-ledger", name: "Economics", short: "Econ", icon: "📊", app: "Equilibrium",
      color: "#ffcc55", currency: { name: "Dollars", one: "Dollar", icon: "💲" },
      legacyKey: "equilibrium.save.v1", group: "HSIE",
      blurb: "The global economy, Australia's place in it, issues and policy." },
    { id: "eng", ns: "EN", defaultTheme: "eng-marginalia", name: "English Advanced", short: "English", icon: "🖋️", app: "Close Reading",
      color: "#e8b86b", currency: { name: "Marks", one: "Mark", icon: "✒️" },
      legacyKey: "closereading.save.v1", group: "English",
      blurb: "Quotes, techniques, marking, thesis and essay craft for your prescribed texts." },
    { id: "mstd", ns: "MS", defaultTheme: "mstd-ledger", name: "Maths Standard", short: "Maths Std", icon: "📐", app: "NumberCrunch",
      color: "#ff9a6b", currency: { name: "Credits", one: "Credit", icon: "💳" },
      legacyKey: "numbercrunch.save.v1", group: "Mathematics", excludes: ["madv", "mext"],
      blurb: "Financial maths, networks, measurement, statistics — Standard 2." },
    { id: "madv", ns: "MA", defaultTheme: "madv-graphpaper", name: "Maths Advanced", short: "Maths Adv", icon: "∫", app: "MathQuest",
      color: "#7c5cff", currency: { name: "Primes", one: "Prime", icon: "🔢" },
      legacyKey: "mathquest.save.v1", group: "Mathematics", excludes: ["mstd"],
      blurb: "Calculus, functions, trigonometry, financial maths, statistics." },
    /* Extension 1 was a tier inside MathQuest; here it is its own subject with its own
       levels, coins and shop. Every Extension 1 student also sits Advanced, so choosing
       it enrols Advanced too (`requires`). MathQuest's old save imports into Advanced
       only (one save, one import) — so no legacyKey here. */
    { id: "mext", ns: "MX", defaultTheme: "mext-contour", name: "Maths Extension 1", short: "Maths Ext 1", icon: "∑", app: "MathQuest (Ext 1)",
      color: "#ff5fa2", currency: { name: "Lemmas", one: "Lemma", icon: "📜" },
      legacyKey: null, group: "Mathematics", excludes: ["mstd"], requires: ["madv"],
      blurb: "Proof by induction, vectors, projectiles, further calculus, combinatorics." }
  ];

  const byId = {};
  LIST.forEach(s => (byId[s.id] = s));

  /* Filled in by subjects/<id>/manifest.js when it loads. */
  const manifests = {};

  /** Tests only: add a synthetic subject (the app itself never calls this). */
  function register(meta) { if (!byId[meta.id]) { LIST.push(meta); byId[meta.id] = meta; } }

  return {
    LIST, register,
    get: id => byId[id] || null,
    ids: () => LIST.map(s => s.id),
    /** subjects/<id>/manifest.js calls this with { scripts:[], css:[] } (paths relative
        to the app root) and an optional boot() run after every script has loaded. */
    manifest(id, m) { manifests[id] = m; },
    getManifest: id => manifests[id] || null,
    ns(id) { const s = byId[id]; return s ? window[s.ns] : null; }
  };
})();
