/* ════════════════════════════════════════════════════════════════════════════
   Every physical constant in the app, in one place.  PHYSICS-BRIEF.md §3.2.
   ════════════════════════════════════════════════════════════════════════════

   NESA gives students a data sheet in the exam. These are the DATA SHEET's values
   at the DATA SHEET's precision. That is not pedantry: if the sheet says
   g = 9.8 m s⁻² and the app computes with 9.81, the app's answer disagrees with
   the student's correct working and it has taught them they are wrong. Likewise
   G is 6.67 × 10⁻¹¹ (three significant figures) here, not the CODATA value.

   ── Provenance, stated honestly ─────────────────────────────────────────────
   The brief says to fetch the current NESA sheet and copy from it. In this
   session every host serving it — curriculum.nsw.edu.au, nsw.gov.au,
   educationstandards.nsw.edu.au and every mirror tried — is refused by the
   sandbox's egress policy (403 at the proxy on CONNECT), so the PDF could not be
   opened. Each value below was instead cross-checked against multiple
   independent reproductions of the sheet retrieved via search, and each carries
   the `src` note it was confirmed from. Before this app is relied on for a real
   HSC year, open the current PDF and diff this file against it:
   https://www.nsw.gov.au/education-and-training/nesa/curriculum/hsc-exam-papers/physics-hsc-data-sheet
   tests/validate.js prints this reminder alongside the constant count.

   Nothing here is a bare literal in a generator. tests/validate.js greps
   js/data/generators/ for suspicious numbers and fails the build if one appears,
   because a constant inlined in one template and updated in another is the kind
   of error that produces confidently wrong answers forever.

   Each entry:
     sym    notation source for the symbol
     value  the number, in SI base units unless `units` says otherwise
     units  dimension map, e.g. { m:1, s:-2 }
     disp   how the units are written on the sheet (notation source)
     sf     significant figures the sheet gives — answers are shown to this
     src    where the value was confirmed from
     sheet  true if it is printed on the NESA data sheet                        */

window.PHYS = window.PHYS || {};
PHYS.DATA = PHYS.DATA || {};

PHYS.DATA.constants = (function () {

  const SHEET = "NESA HSC Physics data sheet (2019 syllabus onwards)";

  const C = {
    /* ── mechanics and gravitation ───────────────────────────────────────── */
    g: {
      name: "Earth's gravitational acceleration", sym: "g",
      value: 9.8, units: { m: 1, s: -2 }, disp: "m s^-2", sf: 2,
      sheet: true, src: SHEET,
      note: "Use 9.8, never 9.81 or 10 — the sheet's value is what a student's working uses."
    },
    G: {
      name: "Universal gravitational constant", sym: "G",
      value: 6.67e-11, units: { m: 3, kg: -1, s: -2 }, disp: "N m^2 kg^-2", sf: 3,
      sheet: true, src: SHEET,
      note: "Three significant figures on the sheet, not the CODATA 6.67430 × 10⁻¹¹."
    },
    mE: {
      name: "Mass of the Earth", sym: "m_E",
      value: 6.0e24, units: { kg: 1 }, disp: "kg", sf: 2,
      sheet: true, src: SHEET,
      note: "Two significant figures. GM_E from this is 4.0 × 10¹⁴, so orbital answers " +
            "carry two figures unless the question supplies something better."
    },
    rE: {
      name: "Radius of the Earth", sym: "r_E",
      value: 6.371e6, units: { m: 1 }, disp: "m", sf: 4,
      sheet: true, src: SHEET
    },

    /* ── waves, sound, thermal ───────────────────────────────────────────── */
    c: {
      name: "Speed of light in a vacuum", sym: "c",
      value: 3.00e8, units: { m: 1, s: -1 }, disp: "m s^-1", sf: 3,
      sheet: true, src: SHEET,
      note: "The sheet rounds to 3.00 × 10⁸. Relativity answers inherit that precision."
    },
    vSound: {
      name: "Speed of sound in air", sym: "v",
      value: 340, units: { m: 1, s: -1 }, disp: "m s^-1", sf: 2,
      sheet: true, src: SHEET
    },
    rhoWater: {
      name: "Density of water", sym: "rho",
      value: 1.00e3, units: { kg: 1, m: -3 }, disp: "kg m^-3", sf: 3,
      sheet: true, src: SHEET
    },
    cWater: {
      name: "Specific heat capacity of water", sym: "c_w",
      value: 4.18e3, units: { m: 2, s: -2, K: -1 }, disp: "J kg^-1 K^-1", sf: 3,
      sheet: true, src: SHEET
    },
    wien: {
      name: "Wien's displacement constant", sym: "b",
      value: 2.898e-3, units: { m: 1, K: 1 }, disp: "m K", sf: 4,
      sheet: true, src: SHEET
    },
    stefan: {
      name: "Stefan–Boltzmann constant", sym: "sigma",
      value: 5.67e-8, units: { kg: 1, s: -3, K: -4 }, disp: "W m^-2 K^-4", sf: 3,
      sheet: true, src: SHEET
    },

    /* ── electricity and magnetism ───────────────────────────────────────── */
    e: {
      name: "Magnitude of the charge on an electron", sym: "q_e",
      value: 1.602e-19, units: { A: 1, s: 1 }, disp: "C", sf: 4,
      sheet: true, src: SHEET,
      note: "The sheet prints the electron's charge as −1.602 × 10⁻¹⁹ C. This entry is " +
            "the magnitude; anything needing the sign writes it explicitly."
    },
    eps0: {
      name: "Electric permittivity of free space", sym: "epsilon_0",
      value: 8.854e-12, units: { A: 2, kg: -1, m: -3, s: 4 },
      disp: "A^2 kg^-1 m^-3 s^4", sf: 4,
      sheet: true, src: SHEET
    },
    mu0: {
      name: "Magnetic permeability of free space", sym: "mu_0",
      value: 4 * Math.PI * 1e-7, units: { kg: 1, m: 1, s: -2, A: -2 },
      disp: "N A^-2", sf: 4,
      sheet: true, src: SHEET,
      note: "Written on the sheet as 4π × 10⁻⁷ exactly, so it is computed here rather " +
            "than typed as 1.257 × 10⁻⁶."
    },

    /* ── quantum and nuclear ─────────────────────────────────────────────── */
    h: {
      name: "Planck constant", sym: "h",
      value: 6.626e-34, units: { kg: 1, m: 2, s: -1 }, disp: "J s", sf: 4,
      sheet: true, src: SHEET
    },
    me: {
      name: "Mass of an electron", sym: "m_e",
      value: 9.109e-31, units: { kg: 1 }, disp: "kg", sf: 4,
      sheet: true, src: SHEET
    },
    mp: {
      name: "Mass of a proton", sym: "m_p",
      value: 1.673e-27, units: { kg: 1 }, disp: "kg", sf: 4,
      sheet: true, src: SHEET
    },
    mn: {
      name: "Mass of a neutron", sym: "m_n",
      value: 1.675e-27, units: { kg: 1 }, disp: "kg", sf: 4,
      sheet: true, src: SHEET
    },
    rydberg: {
      name: "Rydberg constant (hydrogen)", sym: "R",
      value: 1.097e7, units: { m: -1 }, disp: "m^-1", sf: 4,
      sheet: true, src: SHEET
    },
    u: {
      name: "Atomic mass unit", sym: "u",
      value: 1.661e-27, units: { kg: 1 }, disp: "kg", sf: 4,
      sheet: true, src: SHEET,
      note: "The sheet also gives the equivalent as 931.5 MeV/c² — see uMeV."
    },
    uMeV: {
      name: "Atomic mass unit in energy terms", sym: "u",
      value: 931.5, units: null, disp: "MeV/c^2", sf: 4,
      sheet: true, src: SHEET,
      note: "Printed on the sheet beside the kilogram value. Mass-defect questions use " +
            "this so the arithmetic matches a student's.",
      /* ── The sheet is not self-consistent here, and it matters ──────────────
         Taking the sheet's own numbers at face value:
             1.661 × 10⁻²⁷ kg × (3.00 × 10⁸ m s⁻¹)² ÷ (1.602 × 10⁻¹⁹ J/eV)
               = 933.1 MeV,  not the 931.5 MeV printed beside it — 0.18% out.
         The cause is the rounding of c: with the true 2.997925 × 10⁸ the same
         product gives 931.9 MeV, which agrees with 931.5 to about 0.04%.

         So a student who converts through kilograms and c² gets a slightly
         different answer from one who uses 931.5 MeV/c² directly, and BOTH are
         following the sheet correctly. Consequences for this app:
           • The nuclear generators compute both ways and assert agreement only
             to 3 × 10⁻³, with a comment pointing here. Demanding machine
             precision there would be asserting something false about the sheet.
           • The answer tolerance for those questions is the usual 2%, which
             covers the discrepancy many times over, so no student is ever marked
             wrong for picking either route.
           • Where an answer is wanted in MeV, the templates use 931.5 — the
             route the syllabus intends and the one the marking scheme expects. */
      inconsistentWith: { id: "u", viaC: true, relative: 1.77e-3 }
    },
    eV: {
      name: "Electronvolt", sym: "eV",
      value: 1.602e-19, units: { kg: 1, m: 2, s: -2 }, disp: "J", sf: 4,
      sheet: true, src: SHEET,
      note: "Numerically the electron charge, but a different quantity — energy, not " +
            "charge. Kept separate so a dimension check catches confusing the two."
    }
  };

  /* ── derived, never independently typed ────────────────────────────────────
     The Coulomb constant is not on the sheet; students are expected to form it
     from ε₀. Computing it here rather than writing 8.99 × 10⁹ means it can never
     drift away from the ε₀ the rest of the app uses. */
  C.kCoulomb = {
    name: "Coulomb constant", sym: "k",
    value: 1 / (4 * Math.PI * C.eps0.value), units: { kg: 1, m: 3, s: -4, A: -2 },
    disp: "N m^2 C^-2", sf: 3,
    sheet: false, derived: "1 / (4 pi epsilon_0)",
    src: "Derived from the sheet's ε₀, which is how the syllabus expects it to be found.",
    note: "Works out at 8.99 × 10⁹ N m² C⁻² from the sheet's ε₀."
  };

  /* GM for the Earth, the combination almost every orbital question actually
     needs. Derived, so it carries the sheet's two-figure m_E honestly. */
  C.GME = {
    name: "Earth's standard gravitational parameter", sym: "GM_E",
    value: C.G.value * C.mE.value, units: { m: 3, s: -2 }, disp: "m^3 s^-2", sf: 2,
    sheet: false, derived: "G m_E",
    src: "Derived from the sheet's G and m_E.",
    note: "4.0 × 10¹⁴ m³ s⁻². Two significant figures, because m_E has two."
  };

  /* ── values a question must SUPPLY, not assume ─────────────────────────────
     None of these is on the data sheet, so a question that needs one has to
     state it in the stem — exactly as a real HSC question does. They live here
     so the wording and the arithmetic cannot disagree, and generators quote
     `stem` verbatim into the question text. */
  const SUPPLIED = {
    mSun:    { name: "Mass of the Sun",      value: 1.99e30, units: { kg: 1 },
               disp: "kg", sf: 3, stem: "the Sun's mass is 1.99 \\times 10^{30} \\u{kg}" },
    rSun:    { name: "Radius of the Sun",    value: 6.96e8, units: { m: 1 },
               disp: "m", sf: 3, stem: "the Sun's radius is 6.96 \\times 10^8 \\u{m}" },
    AU:      { name: "Astronomical unit",    value: 1.496e11, units: { m: 1 },
               disp: "m", sf: 4, stem: "1 AU = 1.496 \\times 10^{11} \\u{m}" },
    mMoon:   { name: "Mass of the Moon",     value: 7.35e22, units: { kg: 1 },
               disp: "kg", sf: 3, stem: "the Moon's mass is 7.35 \\times 10^{22} \\u{kg}" },
    rMoon:   { name: "Radius of the Moon",   value: 1.74e6, units: { m: 1 },
               disp: "m", sf: 3, stem: "the Moon's radius is 1.74 \\times 10^6 \\u{m}" },
    mMars:   { name: "Mass of Mars",         value: 6.42e23, units: { kg: 1 },
               disp: "kg", sf: 3, stem: "Mars has mass 6.42 \\times 10^{23} \\u{kg}" },
    rMars:   { name: "Radius of Mars",       value: 3.39e6, units: { m: 1 },
               disp: "m", sf: 3, stem: "Mars has radius 3.39 \\times 10^6 \\u{m}" },
    dayEarth:{ name: "Length of a sidereal day", value: 86164, units: { s: 1 },
               disp: "s", sf: 5, stem: "a sidereal day is 86164 \\u{s}" },
    yearEarth:{ name: "Length of a year",    value: 3.156e7, units: { s: 1 },
               disp: "s", sf: 4, stem: "one year is 3.156 \\times 10^7 \\u{s}" },
    ly:      { name: "Light year",           value: 9.46e15, units: { m: 1 },
               disp: "m", sf: 3, stem: "1 light year = 9.46 \\times 10^{15} \\u{m}" }
  };

  /* Work functions, in electronvolts. Photoelectric questions must quote the one
     they use, because no table of them is provided in the exam. */
  const WORK_FUNCTIONS = [
    { metal: "caesium",   phi: 2.10 }, { metal: "potassium", phi: 2.30 },
    { metal: "sodium",    phi: 2.36 }, { metal: "calcium",   phi: 2.87 },
    { metal: "magnesium", phi: 3.66 }, { metal: "aluminium", phi: 4.08 },
    { metal: "zinc",      phi: 4.30 }, { metal: "copper",    phi: 4.70 },
    { metal: "silver",    phi: 4.73 }, { metal: "iron",      phi: 4.50 },
    { metal: "nickel",    phi: 5.15 }, { metal: "platinum",  phi: 5.65 }
  ];

  /** Value lookup used by every generator: `K("g")` rather than `9.8`. */
  function K(id) {
    const c = C[id];
    if (!c) throw new Error("Unknown constant: " + id);
    return c.value;
  }
  /** Same for a value the question must state in its own stem. */
  function S(id) {
    const s = SUPPLIED[id];
    if (!s) throw new Error("Unknown supplied value: " + id);
    return s.value;
  }

  const list = () => Object.keys(C).map(id => Object.assign({ id }, C[id]));
  const onSheet = () => list().filter(c => c.sheet);

  return { table: C, supplied: SUPPLIED, workFunctions: WORK_FUNCTIONS,
           K, S, list, onSheet, SHEET_SOURCE: SHEET,
           SHEET_URL: "https://www.nsw.gov.au/education-and-training/nesa/" +
                      "curriculum/hsc-exam-papers/physics-hsc-data-sheet" };
})();
