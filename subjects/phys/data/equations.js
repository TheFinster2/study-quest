/* The HSC Physics formulae sheet, as data.
   Content only — no logic, no HTML. `formula` is notation source (§6.3).

   Three things use this file:
     · Derivation Chain — an equation "applies" when all but one of its `vars` are
       already known, which is exactly the exam skill of choosing an equation.
     · Formula Match — the quantity ↔ formula ↔ unit triple.
     · The Reference screen — grouped by the sheet's own headings.

   `vars` is the set of symbols the equation relates. It must be complete and it
   must not include a constant (g, G, c, h): constants are always available, so
   listing them would make every equation permanently one unknown short. */
window.PHYS = window.PHYS || {};
PHYS.DATA = PHYS.DATA || {};

/* Symbols the chain modes reason about. `name` is what a student sees. */
PHYS.DATA.symbols = {
  s:      { name: "displacement",            unit: "m" },
  u:      { name: "initial velocity",        unit: "m s^-1" },
  v:      { name: "final velocity",          unit: "m s^-1" },
  a:      { name: "acceleration",            unit: "m s^-2" },
  t:      { name: "time",                    unit: "s" },
  m:      { name: "mass",                    unit: "kg" },
  F:      { name: "force",                   unit: "N" },
  p:      { name: "momentum",                unit: "kg m s^-1" },
  W:      { name: "work",                    unit: "J" },
  E_k:    { name: "kinetic energy",          unit: "J" },
  U:      { name: "potential energy",        unit: "J" },
  P:      { name: "power",                   unit: "W" },
  h:      { name: "height",                  unit: "m" },
  theta:  { name: "angle",                   unit: "deg" },
  mu:     { name: "coefficient of friction", unit: "no units" },
  r:      { name: "radius",                  unit: "m" },
  T:      { name: "period",                  unit: "s" },
  omega:  { name: "angular velocity",        unit: "rad s^-1" },
  tau:    { name: "torque",                  unit: "N m" },
  M:      { name: "central mass",            unit: "kg" },
  f:      { name: "frequency",               unit: "Hz" },
  lambda: { name: "wavelength",              unit: "m" },
  n:      { name: "refractive index",        unit: "no units" },
  Q:      { name: "heat energy",             unit: "J" },
  c_s:    { name: "specific heat capacity",  unit: "J kg^-1 K^-1" },
  /* `disp` is the notation to RENDER when the key itself is not renderable:
     "DeltaT" has no letter boundary between the Greek name and the T, so it comes
     out as the literal text "DeltaT". */
  DeltaT: { name: "temperature change",      unit: "K", disp: "\\DeltaT" },
  I:      { name: "current",                 unit: "A" },
  V:      { name: "potential difference",    unit: "V" },
  R:      { name: "resistance",              unit: "Ω" },
  q:      { name: "charge",                  unit: "C" },
  E:      { name: "electric field strength", unit: "V m^-1" },
  d:      { name: "separation",              unit: "m" },
  B:      { name: "magnetic flux density",   unit: "T" },
  L:      { name: "length",                  unit: "m" },
  Phi:    { name: "magnetic flux",           unit: "Wb" },
  A:      { name: "area",                    unit: "m^2" },
  N:      { name: "number of turns",         unit: "no units" },
  emf:    { name: "EMF",                     unit: "V" },
  phi:    { name: "work function",           unit: "J" },
  E_ph:   { name: "photon energy",           unit: "J" },
  T_abs:  { name: "absolute temperature",    unit: "K" },
  L_star: { name: "luminosity",              unit: "W" },
  t_0:    { name: "proper time",             unit: "s" },
  l_0:    { name: "proper length",           unit: "m" },
  l_v:    { name: "measured length",         unit: "m" },
  Delta_m:{ name: "mass defect",             unit: "kg", disp: "\\Deltam" }
};

/* ── `sheet: true` means it is PRINTED ON the NESA formulae sheet ─────────────
   This flag decides what a student may look up mid-question for free and what
   costs them XP, so it is load-bearing rather than decorative.

   It is ALSO this app's judgement rather than a reading of the PDF: every host
   serving the NESA sheet is blocked by this environment's egress policy (the same
   problem js/data/constants.js documents). 54 of the 64 are marked on-sheet. Where
   the call was a judgement rather than a certainty, the entry carries a `sheetNote`
   saying why, and tests/validate.js lists every one of them on each run with a
   reminder to diff against the real PDF before an exam year.

   The ten marked off-sheet are the ones the syllabus expects you to DERIVE or
   remember: the average-velocity suvat form, F = mg, friction, P = Fv on its own,
   escape velocity, projectile range, the harmonics formula, f = c/λ, motional emf,
   and E = Δmc². If any of those turns out to be printed on the sheet, change the
   flag here and nothing else — the panel and the penalty both read it. */
PHYS.DATA.equations = [
  /* ── Motion, forces and gravity ───────────────────────────────────────── */
  { id: "suvat1", sheet: true, group: "Motion, forces and gravity", mod: "M1", topic: "Motion in a straight line",
    name: "Velocity after uniform acceleration", formula: "v = u + at",
    vars: ["v", "u", "a", "t"] },
  { id: "suvat2", sheet: true, group: "Motion, forces and gravity", mod: "M1", topic: "Motion in a straight line",
    name: "Displacement under uniform acceleration", formula: "s = ut + \\f{1}{2}at^2",
    vars: ["s", "u", "a", "t"] },
  { id: "suvat3", sheet: true, group: "Motion, forces and gravity", mod: "M1", topic: "Motion in a straight line",
    name: "Velocity–displacement relation", formula: "v^2 = u^2 + 2as",
    vars: ["v", "u", "a", "s"] },
  { id: "suvat4", sheet: false, sheetNote: "The sheet gives three suvat equations; this fourth one is the average-velocity form, which you rearrange yourself.", group: "Motion, forces and gravity", mod: "M1", topic: "Motion in a straight line",
    name: "Displacement from average velocity", formula: "s = \\f{1}{2}(u + v)t",
    vars: ["s", "u", "v", "t"] },
  { id: "newton2", sheet: true, group: "Motion, forces and gravity", mod: "M2", topic: "Newton's laws",
    name: "Newton's second law", formula: "\\v{F}_{net} = m\\v{a}",
    vars: ["F", "m", "a"] },
  { id: "weight", sheet: false, sheetNote: "Not listed separately — it is ΣF = ma with a = g.", group: "Motion, forces and gravity", mod: "M2", topic: "Forces",
    name: "Weight", formula: "F = mg", vars: ["F", "m"], usesConstant: "g" },
  { id: "friction", sheet: false, group: "Motion, forces and gravity", mod: "M2", topic: "Forces",
    name: "Friction force", formula: "F = mu F_N", vars: ["F", "mu"] },
  { id: "momentum", sheet: true, group: "Motion, forces and gravity", mod: "M2", topic: "Momentum",
    name: "Momentum", formula: "\\v{p} = m\\v{v}", vars: ["p", "m", "v"] },
  { id: "impulse", sheet: true, group: "Motion, forces and gravity", mod: "M2", topic: "Momentum",
    name: "Impulse", formula: "\\Delta\\v{p} = \\v{F}_{net}\\Deltat", vars: ["p", "F", "t"] },
  { id: "work", sheet: true, group: "Motion, forces and gravity", mod: "M2", topic: "Work and energy",
    name: "Work done", formula: "W = Fs\\cos theta", vars: ["W", "F", "s", "theta"] },
  { id: "ke", sheet: true, group: "Motion, forces and gravity", mod: "M2", topic: "Work and energy",
    name: "Kinetic energy", formula: "E_k = \\f{1}{2}mv^2", vars: ["E_k", "m", "v"] },
  { id: "gpe", sheet: true, group: "Motion, forces and gravity", mod: "M2", topic: "Work and energy",
    name: "Gravitational PE (uniform field)", formula: "\\DeltaU = mg\\Deltah",
    vars: ["U", "m", "h"], usesConstant: "g" },
  { id: "power", sheet: true, group: "Motion, forces and gravity", mod: "M2", topic: "Work and energy",
    name: "Power", formula: "P = \\f{\\DeltaE}{\\Deltat} = Fv", vars: ["P", "W", "t"] },
  { id: "powerFv", sheet: false, sheetNote: "The sheet gives this inside P = ΔE/Δt = Fv.", group: "Motion, forces and gravity", mod: "M2", topic: "Work and energy",
    name: "Power from force and speed", formula: "P = Fv", vars: ["P", "F", "v"] },
  { id: "circ-v", sheet: true, group: "Motion, forces and gravity", mod: "M5", topic: "Circular motion",
    name: "Speed in a circle", formula: "v = \\f{2pi r}{T}", vars: ["v", "r", "T"] },
  { id: "circ-a", sheet: true, group: "Motion, forces and gravity", mod: "M5", topic: "Circular motion",
    name: "Centripetal acceleration", formula: "a_c = \\f{v^2}{r}", vars: ["a", "v", "r"] },
  { id: "circ-F", sheet: true, group: "Motion, forces and gravity", mod: "M5", topic: "Circular motion",
    name: "Centripetal force", formula: "F_c = \\f{mv^2}{r}", vars: ["F", "m", "v", "r"] },
  { id: "omega", sheet: true, group: "Motion, forces and gravity", mod: "M5", topic: "Circular motion",
    name: "Angular velocity", formula: "omega = \\f{2pi}{T}", vars: ["omega", "T"] },
  { id: "torque", sheet: true, group: "Motion, forces and gravity", mod: "M5", topic: "Torque",
    name: "Torque", formula: "tau = rF\\sin theta", vars: ["tau", "r", "F", "theta"] },
  { id: "grav-F", sheet: true, group: "Motion, forces and gravity", mod: "M5", topic: "Gravitation",
    name: "Newton's law of gravitation", formula: "F = \\f{GMm}{r^2}",
    vars: ["F", "M", "m", "r"], usesConstant: "G" },
  { id: "grav-g", sheet: true, group: "Motion, forces and gravity", mod: "M5", topic: "Gravitation",
    name: "Gravitational field strength", formula: "g = \\f{GM}{r^2}",
    vars: ["a", "M", "r"], usesConstant: "G" },
  { id: "grav-U", sheet: true, group: "Motion, forces and gravity", mod: "M5", topic: "Gravitation",
    name: "Gravitational potential energy", formula: "U = -\\f{GMm}{r}",
    vars: ["U", "M", "m", "r"], usesConstant: "G" },
  { id: "kepler3", sheet: true, group: "Motion, forces and gravity", mod: "M5", topic: "Orbits",
    name: "Kepler's third law", formula: "\\f{r^3}{T^2} = \\f{GM}{4pi^2}",
    vars: ["r", "T", "M"], usesConstant: "G" },
  { id: "escape", sheet: false, sheetNote: "Derived from energy conservation — the syllabus expects you to.", group: "Motion, forces and gravity", mod: "M5", topic: "Gravitation",
    name: "Escape velocity", formula: "v_{esc} = \\sqrt{\\f{2GM}{r}}",
    vars: ["v", "M", "r"], usesConstant: "G" },
  { id: "proj-range", sheet: false, sheetNote: "Derived from the suvat equations applied to each direction.", group: "Motion, forces and gravity", mod: "M5", topic: "Projectile motion",
    name: "Range of a projectile", formula: "R = \\f{u^2\\sin 2theta}{g}",
    vars: ["s", "u", "theta"], usesConstant: "g" },

  /* ── Waves and thermodynamics ─────────────────────────────────────────── */
  { id: "wave", sheet: true, group: "Waves and thermodynamics", mod: "M3", topic: "Wave properties",
    name: "Wave equation", formula: "v = f lambda", vars: ["v", "f", "lambda"] },
  { id: "period", sheet: true, group: "Waves and thermodynamics", mod: "M3", topic: "Wave properties",
    name: "Period and frequency", formula: "T = \\f{1}{f}", vars: ["T", "f"] },
  { id: "string", sheet: false, group: "Waves and thermodynamics", mod: "M3", topic: "Standing waves",
    name: "Harmonics on a fixed string", formula: "f_n = \\f{nv}{2L}", vars: ["f", "v", "L"] },
  { id: "doppler", sheet: true, group: "Waves and thermodynamics", mod: "M3", topic: "Doppler effect",
    name: "Doppler effect (sound)", formula: "f' = f\\f{v_w + v_o}{v_w - v_s}", vars: ["f", "v"] },
  { id: "snell", sheet: true, group: "Waves and thermodynamics", mod: "M3", topic: "Refraction",
    name: "Snell's law", formula: "n_1\\sin theta_1 = n_2\\sin theta_2", vars: ["n", "theta"] },
  { id: "index", sheet: true, group: "Waves and thermodynamics", mod: "M3", topic: "Refraction",
    name: "Refractive index and speed", formula: "n = \\f{c}{v}", vars: ["n", "v"], usesConstant: "c" },
  /* Light specifically. The general v = fλ leaves the SPEED unknown, so on its own
     it cannot get a chain from a wavelength to a frequency — for light the speed is
     the constant c, and that is what makes the photon chains reachable. */
  { id: "light-freq", sheet: false, sheetNote: "It is the wave equation with v = c.", group: "Waves and thermodynamics", mod: "M3", topic: "Wave properties",
    name: "Frequency of light from its wavelength", formula: "f = \\f{c}{lambda}",
    vars: ["f", "lambda"], usesConstant: "c" },
  { id: "critical", sheet: true, group: "Waves and thermodynamics", mod: "M3", topic: "Refraction",
    name: "Critical angle", formula: "\\sin theta_c = \\f{n_2}{n_1}", vars: ["theta", "n"] },
  { id: "intensity", sheet: true, group: "Waves and thermodynamics", mod: "M3", topic: "Wave properties",
    name: "Inverse square law", formula: "I \\propto \\f{1}{r^2}", vars: ["r"] },
  { id: "heat", sheet: true, group: "Waves and thermodynamics", mod: "M3", topic: "Thermodynamics",
    name: "Heat capacity", formula: "Q = mc_s\\DeltaT", vars: ["Q", "m", "c_s", "DeltaT"] },
  { id: "conduct", sheet: true, group: "Waves and thermodynamics", mod: "M3", topic: "Thermodynamics",
    name: "Thermal conduction", formula: "\\f{Q}{t} = \\f{kA\\DeltaT}{d}", vars: ["Q", "t", "A", "d", "DeltaT"] },

  /* ── Electricity and magnetism ────────────────────────────────────────── */
  { id: "ohm", sheet: true, group: "Electricity and magnetism", mod: "M4", topic: "Circuits",
    name: "Ohm's law", formula: "V = IR", vars: ["V", "I", "R"] },
  { id: "charge", sheet: true, group: "Electricity and magnetism", mod: "M4", topic: "Circuits",
    name: "Charge and current", formula: "q = It", vars: ["q", "I", "t"] },
  { id: "elec-power", sheet: true, group: "Electricity and magnetism", mod: "M4", topic: "Circuits",
    name: "Electrical power", formula: "P = VI = I^2R = \\f{V^2}{R}", vars: ["P", "V", "I", "R"] },
  { id: "series", sheet: true, group: "Electricity and magnetism", mod: "M4", topic: "Circuits",
    name: "Resistors in series", formula: "R_T = R_1 + R_2 + \\cdots", vars: ["R"] },
  { id: "parallel", sheet: true, group: "Electricity and magnetism", mod: "M4", topic: "Circuits",
    name: "Resistors in parallel", formula: "\\f{1}{R_T} = \\f{1}{R_1} + \\f{1}{R_2} + \\cdots", vars: ["R"] },
  { id: "coulomb", sheet: true, group: "Electricity and magnetism", mod: "M4", topic: "Electrostatics",
    name: "Coulomb's law", formula: "F = \\f{1}{4pi epsilon_0}\\f{q_1q_2}{r^2}",
    vars: ["F", "q", "r"], usesConstant: "eps0" },
  { id: "efield-plates", sheet: true, group: "Electricity and magnetism", mod: "M4", topic: "Electrostatics",
    name: "Uniform electric field", formula: "E = \\f{V}{d}", vars: ["E", "V", "d"] },
  { id: "efield-force", sheet: true, group: "Electricity and magnetism", mod: "M4", topic: "Electrostatics",
    name: "Force on a charge", formula: "F = qE", vars: ["F", "q", "E"] },
  { id: "work-charge", sheet: true, group: "Electricity and magnetism", mod: "M4", topic: "Electrostatics",
    name: "Work on a charge", formula: "W = qV", vars: ["W", "q", "V"] },
  { id: "motor", sheet: true, group: "Electricity and magnetism", mod: "M6", topic: "Motor effect",
    name: "Force on a conductor", formula: "F = BIL\\sin theta", vars: ["F", "B", "I", "L", "theta"] },
  { id: "charge-field", sheet: true, group: "Electricity and magnetism", mod: "M6", topic: "Charged particles",
    name: "Force on a moving charge", formula: "F = qvB\\sin theta", vars: ["F", "q", "v", "B", "theta"] },
  { id: "flux", sheet: true, group: "Electricity and magnetism", mod: "M6", topic: "Induction",
    name: "Magnetic flux", formula: "Phi = BA\\cos theta", vars: ["Phi", "B", "A", "theta"] },
  { id: "faraday", sheet: true, group: "Electricity and magnetism", mod: "M6", topic: "Induction",
    name: "Faraday's law", formula: "emf = -N\\f{\\Delta\\Phi}{\\Deltat}", vars: ["emf", "N", "Phi", "t"] },
  { id: "rod-emf", sheet: false, group: "Electricity and magnetism", mod: "M6", topic: "Induction",
    name: "Motional EMF", formula: "emf = BLv", vars: ["emf", "B", "L", "v"] },
  { id: "coil-torque", sheet: true, group: "Electricity and magnetism", mod: "M6", topic: "Motors",
    name: "Torque on a coil", formula: "tau = NBIA\\cos theta", vars: ["tau", "N", "B", "I", "A", "theta"] },
  { id: "transformer", sheet: true, group: "Electricity and magnetism", mod: "M6", topic: "Transformers",
    name: "Transformer turns ratio", formula: "\\f{V_p}{V_s} = \\f{N_p}{N_s}", vars: ["V", "N"] },

  /* ── Quantum, special relativity and nuclear physics ──────────────────── */
  { id: "photon", sheet: true, group: "Quantum, special relativity and nuclear physics", mod: "M7",
    topic: "Quantum nature of light", name: "Photon energy",
    formula: "E = hf = \\f{hc}{lambda}", vars: ["E_ph", "f", "lambda"], usesConstant: "h" },
  { id: "photoelectric", sheet: true, group: "Quantum, special relativity and nuclear physics", mod: "M7",
    topic: "Photoelectric effect", name: "Photoelectric equation",
    formula: "E_{k,max} = hf - phi", vars: ["E_k", "f", "phi"], usesConstant: "h" },
  { id: "debroglie", sheet: true, group: "Quantum, special relativity and nuclear physics", mod: "M8",
    topic: "Quantum model", name: "de Broglie wavelength",
    formula: "lambda = \\f{h}{mv}", vars: ["lambda", "m", "v"], usesConstant: "h" },
  { id: "wien", sheet: true, group: "Quantum, special relativity and nuclear physics", mod: "M7",
    topic: "Blackbody radiation", name: "Wien's displacement law",
    formula: "lambda_{max} = \\f{b}{T}", vars: ["lambda", "T_abs"], usesConstant: "wien" },
  { id: "stefan", sheet: true, group: "Quantum, special relativity and nuclear physics", mod: "M7",
    topic: "Blackbody radiation", name: "Stefan–Boltzmann law",
    formula: "L = sigma AT^4", vars: ["L_star", "A", "T_abs"], usesConstant: "stefan" },
  { id: "dilation", sheet: true, group: "Quantum, special relativity and nuclear physics", mod: "M7",
    topic: "Special relativity", name: "Time dilation",
    formula: "t = \\f{t_0}{\\sqrt{1 - \\f{v^2}{c^2}}}", vars: ["t", "t_0", "v"], usesConstant: "c" },
  { id: "contraction", sheet: true, group: "Quantum, special relativity and nuclear physics", mod: "M7",
    topic: "Special relativity", name: "Length contraction",
    formula: "l_v = l_0\\sqrt{1 - \\f{v^2}{c^2}}", vars: ["l_v", "l_0", "v"], usesConstant: "c" },
  { id: "rel-momentum", sheet: true, group: "Quantum, special relativity and nuclear physics", mod: "M7",
    topic: "Special relativity", name: "Relativistic momentum",
    formula: "p_v = \\f{mv}{\\sqrt{1 - \\f{v^2}{c^2}}}", vars: ["p", "m", "v"], usesConstant: "c" },
  { id: "massenergy", sheet: true, group: "Quantum, special relativity and nuclear physics", mod: "M7",
    topic: "Mass–energy equivalence", name: "Mass–energy equivalence",
    formula: "E = mc^2", vars: ["E_k", "m"], usesConstant: "c" },
  { id: "massdefect", sheet: false, sheetNote: "The sheet gives E = mc^2; the mass-defect form is that, applied.", group: "Quantum, special relativity and nuclear physics", mod: "M8",
    topic: "Nuclear physics", name: "Binding energy from a mass defect",
    formula: "E = \\Deltamc^2", vars: ["E_k", "Delta_m"], usesConstant: "c" },
  { id: "rydberg", sheet: true, group: "Quantum, special relativity and nuclear physics", mod: "M8",
    topic: "Atomic spectra", name: "Hydrogen spectral series",
    formula: "\\f{1}{lambda} = R\\left(\\f{1}{n_f^2} - \\f{1}{n_i^2}\\right)",
    vars: ["lambda"], usesConstant: "rydberg" },
  { id: "decay", sheet: true, group: "Quantum, special relativity and nuclear physics", mod: "M8",
    topic: "Radioactivity", name: "Radioactive decay",
    formula: "N_t = N_0e^{-lambda t}", vars: ["t"] }
];

/* ── Derivation Chain problems ────────────────────────────────────────────
   Each is a set of known symbols, a target, and the shortest route. The number
   of steps is NOT stored: the chain mode recomputes it from the equation graph,
   so a stale "this takes 3 steps" can never disagree with the actual puzzle. */
PHYS.DATA.chains = [
  { id: "ch-s-from-uat", mod: "M1", known: ["u", "a", "t"], target: "s",
    story: "A trolley starts at a known speed and accelerates uniformly. How far does it go?" },
  { id: "ch-v-from-uas", mod: "M1", known: ["u", "a", "s"], target: "v",
    story: "A car accelerates over a measured distance. How fast is it going at the end?" },
  { id: "ch-a-from-uvs", mod: "M1", known: ["u", "v", "s"], target: "a",
    story: "A plane's take-off run is measured, along with its start and lift-off speeds." },
  { id: "ch-t-from-uvs", mod: "M1", known: ["u", "v", "s"], target: "t",
    story: "How long did that take-off run take?" },
  { id: "ch-F-from-uvtm", mod: "M2", known: ["u", "v", "t", "m"], target: "F",
    story: "A known mass changes speed in a known time. What force acted?" },
  { id: "ch-Ek-from-uatm", mod: "M2", known: ["u", "a", "t", "m"], target: "E_k",
    story: "A mass accelerates for a while. How much kinetic energy does it end up with?" },
  { id: "ch-P-from-Fst", mod: "M2", known: ["F", "s", "t"], target: "P",
    story: "A constant force drags a crate a measured distance in a measured time." },
  { id: "ch-p-from-Fam", mod: "M2", known: ["F", "t", "m"], target: "p",
    story: "A force acts on a stationary mass for a fixed time." },
  { id: "ch-Fc-from-rTm", mod: "M5", known: ["r", "T", "m"], target: "F",
    story: "An object circles at a known radius and period. What force holds it in?" },
  { id: "ch-T-from-rM", mod: "M5", known: ["r", "M"], target: "T",
    story: "A satellite orbits at a known radius around a known mass." },
  { id: "ch-v-from-rM", mod: "M5", known: ["r", "M"], target: "v",
    story: "How fast must that satellite travel?" },
  { id: "ch-lambda-from-vf", mod: "M3", known: ["v", "f"], target: "lambda",
    story: "A wave's speed and frequency are measured." },
  { id: "ch-v-from-n", mod: "M3", known: ["n"], target: "v",
    story: "A medium's refractive index is known. How fast does light travel in it?" },
  { id: "ch-lambda-from-n", mod: "M3", known: ["n", "f"], target: "lambda",
    story: "Light of known frequency enters a medium of known refractive index." },
  { id: "ch-P-from-VIR", mod: "M4", known: ["V", "R"], target: "P",
    story: "A resistor of known value sits across a known voltage." },
  { id: "ch-q-from-VRt", mod: "M4", known: ["V", "R", "t"], target: "q",
    story: "How much charge flows through that resistor in a known time?" },
  { id: "ch-W-from-VRt", mod: "M4", known: ["V", "R", "t"], target: "W",
    story: "How much energy does it dissipate?" },
  { id: "ch-emf-from-BAt", mod: "M6", known: ["B", "A", "t", "N", "theta"], target: "emf",
    story: "A coil of known area and orientation has its field collapse to zero in a known time." },
  { id: "ch-Ek-from-lambda", mod: "M7", known: ["lambda", "phi"], target: "E_k",
    story: "Light of known wavelength strikes a metal of known work function." },
  { id: "ch-Eph-from-lambda", mod: "M7", known: ["lambda"], target: "E_ph",
    story: "What is the energy of one photon of that light?" },
  { id: "ch-lambda-from-mv", mod: "M8", known: ["m", "v"], target: "lambda",
    story: "A particle of known mass and speed — what is its matter wavelength?" },
  { id: "ch-E-from-dm", mod: "M8", known: ["Delta_m"], target: "E_k",
    story: "A nuclear reaction loses a measured amount of mass." }
];

/* Sheet flags that are this app's judgement rather than a reading of the PDF. */
PHYS.DATA.sheetUnverified = PHYS.DATA.equations
  .filter(e => e.sheetNote)
  .map(e => e.id);
