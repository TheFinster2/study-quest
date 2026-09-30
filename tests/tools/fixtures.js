/* A demo reference sheet for the tool-tray tests — NOT registered by the app.
   Physics' data-sheet constants at the sheet's precision (from Physics-Study-App
   js/data/constants.js), its derived and "supplied" values as locked entries, and a
   handful of formula items. Works in node (module.exports) and in the browser
   (page.addScriptTag registers it on SQ.Tools as the "phys" sheet). */
(function (root) {
  const eps0 = 8.854e-12, G = 6.67e-11, mE = 6.0e24;
  const C = (id, name, symbol, value, unit, free, extra) =>
    Object.assign({ id, name, symbol, value, unit, free }, extra || {});
  const constants = [
    C("g", "Earth's gravitational acceleration", "g", 9.8, "m s⁻²", true),
    C("G", "Universal gravitational constant", "G", G, "N m² kg⁻²", true),
    C("mE", "Mass of the Earth", "m<sub>E</sub>", mE, "kg", true),
    C("rE", "Radius of the Earth", "r<sub>E</sub>", 6.371e6, "m", true),
    C("c", "Speed of light in a vacuum", "c", 3.00e8, "m s⁻¹", true),
    C("vSound", "Speed of sound in air", "v", 340, "m s⁻¹", true),
    C("rhoWater", "Density of water", "ρ", 1.00e3, "kg m⁻³", true),
    C("cWater", "Specific heat capacity of water", "c<sub>w</sub>", 4.18e3, "J kg⁻¹ K⁻¹", true),
    C("wien", "Wien's displacement constant", "b", 2.898e-3, "m K", true),
    C("stefan", "Stefan–Boltzmann constant", "σ", 5.67e-8, "W m⁻² K⁻⁴", true),
    C("e", "Magnitude of the charge on an electron", "q<sub>e</sub>", 1.602e-19, "C", true, { aliases: ["qe"] }),
    C("eps0", "Electric permittivity of free space", "ε<sub>0</sub>", eps0, "A² kg⁻¹ m⁻³ s⁴", true, { aliases: ["eps"] }),
    C("mu0", "Magnetic permeability of free space", "μ<sub>0</sub>", 4 * Math.PI * 1e-7, "N A⁻²", true),
    C("h", "Planck constant", "h", 6.626e-34, "J s", true),
    C("me", "Mass of an electron", "m<sub>e</sub>", 9.109e-31, "kg", true),
    C("mp", "Mass of a proton", "m<sub>p</sub>", 1.673e-27, "kg", true),
    C("mn", "Mass of a neutron", "m<sub>n</sub>", 1.675e-27, "kg", true),
    C("rydberg", "Rydberg constant (hydrogen)", "R", 1.097e7, "m⁻¹", true),
    C("u", "Atomic mass unit", "u", 1.661e-27, "kg", true),
    C("uMeV", "Atomic mass unit in energy terms", "u", 931.5, "MeV/c²", true),
    C("eV", "Electronvolt", "eV", 1.602e-19, "J", true),
    C("kCoulomb", "Coulomb constant", "k", 1 / (4 * Math.PI * eps0), "N m² C⁻²", false,
      { aliases: ["k"], note: "Derived from ε₀ — not printed on the sheet." }),
    C("GME", "Earth's standard gravitational parameter", "GM<sub>E</sub>", G * mE, "m³ s⁻²", false, { aliases: ["GMe"] }),
    C("mSun", "Mass of the Sun", "M<sub>☉</sub>", 1.99e30, "kg", false, { note: "A question has to state this itself." }),
    C("AU", "Astronomical unit", "AU", 1.496e11, "m", false),
    C("ly", "Light year", "ly", 9.46e15, "m", false)
  ];
  const sheet = {
    title: "Demo physics data sheet (tests only)",
    constants,
    sections: [
      { id: "motion", title: "Motion", items: [
        { id: "suvat1", name: "v = u + at", body: "v = u + at", free: true },
        { id: "suvat2", name: "v² = u² + 2as", body: "v<sup>2</sup> = u<sup>2</sup> + 2as", free: true },
        { id: "range", name: "Projectile range", body: "SECRET-RANGE R = u²sin2θ/g", free: false, note: "Derive it from the SUVATs." },
        { id: "maxh", name: "Maximum height", body: "SECRET-HEIGHT h = u²sin²θ/2g", free: false }
      ] },
      { id: "fields", title: "Fields", items: [
        { id: "coulomb", name: "Coulomb's law", body: "F = q₁q₂ / 4πε₀r²", free: true },
        { id: "escape", name: "Escape velocity", body: "SECRET-ESCAPE v = √(2GM/r)", free: false },
        { id: "orbit", name: "Orbital period", body: "SECRET-ORBIT T² = 4π²r³/GM", free: false }
      ] }
    ]
  };
  if (typeof module !== "undefined" && module.exports) module.exports = { sheet, constants };
  if (root && root.SQ && root.SQ.Tools) root.SQ.Tools.registerSheet("phys", sheet);
})(typeof window !== "undefined" ? window : this);
