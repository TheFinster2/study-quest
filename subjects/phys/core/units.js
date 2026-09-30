/* ════════════════════════════════════════════════════════════════════════════
   The units engine.  PHYSICS-BRIEF.md §5.3.
   ════════════════════════════════════════════════════════════════════════════

   A quantity is { value, units: { kg:1, m:2, s:-2 } } — a number and a map of
   SI base dimensions to their powers. From that:

     • Every generated answer's dimensions are checked against what the stem asks
       for. "Find the kinetic energy" must produce { kg:1, m:2, s:-2 }. A dropped
       square or a divide that should have been a multiply changes the dimensions,
       so this catches an entire class of generator bug automatically, on every
       seed, forever — which is a much stronger guarantee than reading the code.

     • It powers the Unit Grid mode and the live dimensional feedback.

     • It lets the app accept an answer in any dimensionally equivalent unit:
       a student who typed km h⁻¹ where the app computed m s⁻¹ is not wrong.

   Base dimensions are the seven SI ones. Everything else — N, J, W, V, T, Wb,
   Pa, Hz, eV, km h⁻¹ — is a name for a combination plus a conversion factor. */

window.PHYS = window.PHYS || {};

PHYS.Units = (function () {
  const BASE = ["kg", "m", "s", "A", "K", "mol", "cd"];

  /* ── construction and algebra ──────────────────────────────────────────── */

  /** q(9.8, {m:1, s:-2}) */
  function q(value, units) {
    return { value: value, units: clean(units || {}) };
  }

  /** Drop zero powers so two equal dimension maps compare equal. */
  function clean(u) {
    const out = {};
    for (const k of Object.keys(u)) {
      const p = u[k];
      if (p) out[k] = p;
    }
    return out;
  }

  function mulU(a, b) {
    const out = Object.assign({}, a);
    for (const k of Object.keys(b)) out[k] = (out[k] || 0) + b[k];
    return clean(out);
  }
  function powU(a, n) {
    const out = {};
    for (const k of Object.keys(a)) out[k] = a[k] * n;
    return clean(out);
  }
  const invU = a => powU(a, -1);
  const divU = (a, b) => mulU(a, invU(b));

  const mul = (a, b) => q(a.value * b.value, mulU(a.units, b.units));
  const div = (a, b) => q(a.value / b.value, divU(a.units, b.units));
  const pow = (a, n) => q(Math.pow(a.value, n), powU(a.units, n));
  const scale = (a, k) => q(a.value * k, a.units);
  const sqrt = a => {
    // A half-power dimension means the physics was wrong, not that the answer is odd.
    const half = powU(a.units, 0.5);
    for (const k of Object.keys(half)) {
      if (!Number.isInteger(half[k]))
        throw new Error("sqrt of " + str(a.units) + " has a fractional dimension in " + k);
    }
    return q(Math.sqrt(a.value), half);
  };

  /** Adding quantities asserts the dimensions match. This is the whole point. */
  function add(a, b) {
    if (!same(a.units, b.units))
      throw new Error("Cannot add " + str(a.units) + " to " + str(b.units));
    return q(a.value + b.value, a.units);
  }
  function sub(a, b) {
    if (!same(a.units, b.units))
      throw new Error("Cannot subtract " + str(b.units) + " from " + str(a.units));
    return q(a.value - b.value, a.units);
  }

  function same(a, b) {
    const x = clean(a || {}), y = clean(b || {});
    const kx = Object.keys(x), ky = Object.keys(y);
    if (kx.length !== ky.length) return false;
    return kx.every(k => y[k] === x[k]);
  }

  const dimensionless = u => Object.keys(clean(u || {})).length === 0;

  /* ── named units ───────────────────────────────────────────────────────────
     factor converts the named unit INTO SI base units. */
  const PREFIX = {
    P: 1e15, T: 1e12, G: 1e9, M: 1e6, k: 1e3, h: 1e2, da: 1e1,
    d: 1e-1, c: 1e-2, m: 1e-3, u: 1e-6, "µ": 1e-6, "μ": 1e-6,
    n: 1e-9, p: 1e-12, f: 1e-15
  };

  const NAMED = {
    /* base */
    kg: { f: 1,     u: { kg: 1 } },
    g:  { f: 1e-3,  u: { kg: 1 } },
    m:  { f: 1,     u: { m: 1 } },
    s:  { f: 1,     u: { s: 1 } },
    A:  { f: 1,     u: { A: 1 } },
    K:  { f: 1,     u: { K: 1 } },
    mol:{ f: 1,     u: { mol: 1 } },
    cd: { f: 1,     u: { cd: 1 } },
    /* derived */
    N:  { f: 1, u: { kg: 1, m: 1, s: -2 } },
    J:  { f: 1, u: { kg: 1, m: 2, s: -2 } },
    W:  { f: 1, u: { kg: 1, m: 2, s: -3 } },
    Pa: { f: 1, u: { kg: 1, m: -1, s: -2 } },
    Hz: { f: 1, u: { s: -1 } },
    C:  { f: 1, u: { A: 1, s: 1 } },
    V:  { f: 1, u: { kg: 1, m: 2, s: -3, A: -1 } },
    F:  { f: 1, u: { kg: -1, m: -2, s: 4, A: 2 } },
    T:  { f: 1, u: { kg: 1, s: -2, A: -1 } },
    Wb: { f: 1, u: { kg: 1, m: 2, s: -2, A: -1 } },
    H:  { f: 1, u: { kg: 1, m: 2, s: -2, A: -2 } },
    S:  { f: 1, u: { kg: -1, m: -2, s: 3, A: 2 } },
    Bq: { f: 1, u: { s: -1 } },                   // decays per second
    Gy: { f: 1, u: { m: 2, s: -2 } },
    Sv: { f: 1, u: { m: 2, s: -2 } },
    /* Ω is spelled out too, because a phone keyboard has no easy Ω. */
    "Ω": { f: 1, u: { kg: 1, m: 2, s: -3, A: -2 } },
    ohm:      { f: 1, u: { kg: 1, m: 2, s: -3, A: -2 } },
    /* practical */
    L:    { f: 1e-3, u: { m: 3 } },
    t:    { f: 1e3,  u: { kg: 1 } },              // tonne
    min:  { f: 60,   u: { s: 1 } },
    h:    { f: 3600, u: { s: 1 } },               // hour — see the note in parse()
    hr:   { f: 3600, u: { s: 1 } },
    day:  { f: 86400, u: { s: 1 } },
    yr:   { f: 3.156e7, u: { s: 1 } },
    eV:   { f: 1.602e-19, u: { kg: 1, m: 2, s: -2 } },
    u:    { f: 1.661e-27, u: { kg: 1 } },         // atomic mass unit
    /* angles are dimensionless; kept so "rad s^-1" parses */
    rad:  { f: 1, u: {} },
    sr:   { f: 1, u: {} },
    "°": { f: Math.PI / 180, u: {} }
  };

  /* Units whose single-letter name collides with a prefix + something, or whose
     bare name must never be prefix-split. `h` is the worst: "h" is an hour, but
     also the prefix hecto, and "kg h^-1" must read as per hour. Exact matches in
     NAMED always win, and prefix splitting is only tried when there is no exact
     match, which resolves all of these. */
  const NO_PREFIX = new Set(["min", "day", "yr", "rad", "sr", "u", "h", "hr", "t"]);

  /** Look one unit token up, allowing an SI prefix. → { f, u } or null. */
  function lookup(tok) {
    if (NAMED[tok]) return NAMED[tok];
    if (NO_PREFIX.has(tok)) return null;
    // Two-character prefixes first ("da"), then one.
    for (const len of [2, 1]) {
      if (tok.length <= len) continue;
      const p = tok.slice(0, len), rest = tok.slice(len);
      if (PREFIX[p] === undefined || !NAMED[rest] || NO_PREFIX.has(rest)) continue;
      // kg is already prefixed; "kkg" is not a unit.
      if (rest === "kg") continue;
      return { f: PREFIX[p] * NAMED[rest].f, u: NAMED[rest].u };
    }
    return null;
  }

  /**
   * Parse a unit string into { factor, units }.  Accepts the forms a student or
   * a content file would actually write:
   *     "m s^-2"   "m/s^2"   "km h^-1"   "N m^2 kg^-2"   "J kg^-1 K^-1"
   *     "m s-2"    "kg.m/s2"  "MeV"      "1"  ""  (dimensionless)
   * Returns null if any token is unrecognised — callers treat that as "don't
   * know", never as "dimensionless".
   */
  function parse(text) {
    if (text === null || text === undefined) return null;
    let s = String(text).trim();
    if (!s || s === "1" || s === "-") return { factor: 1, units: {} };

    // Split on a solidus: everything after it is inverted. "kg.m/s2" → kg.m , s2
    const parts = s.split("/");
    if (parts.length > 2) return null;

    let factor = 1, units = {};
    for (let side = 0; side < parts.length; side++) {
      const sign = side === 0 ? 1 : -1;
      const toks = parts[side].replace(/[·⋅*]/g, " ").replace(/\./g, " ")
                              .replace(/\s+/g, " ").trim();
      if (!toks) continue;
      for (const tok of toks.split(" ")) {
        // name, then an exponent: ^-2, ^2, -2, 2, or unicode superscripts.
        const m = /^([A-Za-zΩ°µμ]+)(?:\^?\(?([+-]?\d+)\)?|([⁰¹²³⁴⁵⁶⁷⁸⁹⁻⁺]+))?$/.exec(tok);
        if (!m) return null;
        const hit = lookup(m[1]);
        if (!hit) return null;
        let n = 1;
        if (m[2] !== undefined) n = parseInt(m[2], 10);
        else if (m[3] !== undefined) {
          const SUP = { "⁰":"0","¹":"1","²":"2","³":"3","⁴":"4","⁵":"5",
                        "⁶":"6","⁷":"7","⁸":"8","⁹":"9","⁻":"-","⁺":"+" };
          n = parseInt(m[3].split("").map(ch => SUP[ch]).join(""), 10);
        }
        if (!isFinite(n)) return null;
        n *= sign;
        factor *= Math.pow(hit.f, n);
        units = mulU(units, powU(hit.u, n));
      }
    }
    return { factor, units };
  }

  /** Convert a value expressed in `unitText` into SI base units, or null. */
  function toSI(value, unitText) {
    const p = parse(unitText);
    if (!p) return null;
    return q(value * p.factor, p.units);
  }

  /* ── formatting ────────────────────────────────────────────────────────────
     Base-unit maps are honest but unreadable — "kg m² s⁻³ A⁻¹" for a volt — so
     the combinations the syllabus actually writes get named.

     This is a table of EXACT matches, deliberately not a search. A search that
     factored a derived name out of any map and appended the remainder produced
     equivalent-but-absurd results: an acceleration came out as "N kg⁻¹" and a
     length as "N kg⁻¹ s²". Both are dimensionally true and neither is something
     anyone would write on a page. Anything not listed here falls through to
     plain base units, which is always readable and always right. */
  const NAMES = [
    /* single-symbol SI derived units */
    ["N",  { kg: 1, m: 1, s: -2 }],
    ["J",  { kg: 1, m: 2, s: -2 }],
    ["W",  { kg: 1, m: 2, s: -3 }],
    ["Pa", { kg: 1, m: -1, s: -2 }],
    ["Hz", { s: -1 }],
    ["C",  { A: 1, s: 1 }],
    ["V",  { kg: 1, m: 2, s: -3, A: -1 }],
    ["Ω", { kg: 1, m: 2, s: -3, A: -2 }],
    ["F",  { kg: -1, m: -2, s: 4, A: 2 }],
    ["T",  { kg: 1, s: -2, A: -1 }],
    ["Wb", { kg: 1, m: 2, s: -2, A: -1 }],
    ["H",  { kg: 1, m: 2, s: -2, A: -2 }],
    /* compounds the HSC writes as compounds */
    ["J s",           { kg: 1, m: 2, s: -1 }],
    ["W m^-2",        { kg: 1, s: -3 }],
    ["W m^-2 K^-4",   { kg: 1, s: -3, K: -4 }],
    ["V m^-1",        { kg: 1, m: 1, s: -3, A: -1 }],
    ["J kg^-1 K^-1",  { m: 2, s: -2, K: -1 }],
    ["N m^2 kg^-2",   { kg: -1, m: 3, s: -2 }],
    ["N m^2 C^-2",    { kg: 1, m: 3, s: -4, A: -2 }],
    ["Ω m",          { kg: 1, m: 3, s: -3, A: -2 }],
    ["N A^-2",        { kg: 1, m: 1, s: -2, A: -2 }],
    ["F m^-1",        { kg: -1, m: -3, s: 4, A: 2 }],
    ["J mol^-1",      { kg: 1, m: 2, s: -2, mol: -1 }]
  ];

  /** Dimension map → unit as notation source, e.g. { kg:1, m:2, s:-2 } → "J". */
  function str(u, opts) {
    const units = clean(u || {});
    if (!Object.keys(units).length) return "";
    if (!(opts || {}).base) {
      for (const [name, dims] of NAMES) if (same(units, dims)) return name;
    }
    return baseStr(units);
  }

  /** Strictly base units, in the conventional kg m s A K order. */
  function baseStr(u) {
    const units = clean(u || {});
    const order = BASE.filter(b => units[b] !== undefined)
                      .concat(Object.keys(units).filter(k => BASE.indexOf(k) < 0).sort());
    return order.map(k => (units[k] === 1 ? k : k + "^" + units[k])).join(" ");
  }

  /** Notation source for a whole quantity, e.g. "59.9 \u{m}". */
  function fmt(quantity, sf) {
    const U = PHYS.U;
    const s = str(quantity.units);
    return U.fmtSig(quantity.value, sf || 3) + (s ? " \\u{" + s + "}" : "");
  }

  /* ── quantities the syllabus names ─────────────────────────────────────────
     `dim` is what an answer to "find the …" must come out as — the generator
     validator checks against it. `unit` is how the unit is conventionally
     WRITTEN, which is not always what str(dim) produces: angular velocity and
     frequency share the dimension s⁻¹ but are written rad s⁻¹ and Hz, and no
     dimension map can tell them apart. The Unit Grid uses `unit`. */
  const QUANTITIES = [
    { id: "displacement", name: "Displacement",      sym: "s",       unit: "m",              dim: { m: 1 }, mod: "M1" },
    { id: "velocity",     name: "Velocity",          sym: "v",       unit: "m s^-1",         dim: { m: 1, s: -1 }, mod: "M1" },
    { id: "acceleration", name: "Acceleration",      sym: "a",       unit: "m s^-2",         dim: { m: 1, s: -2 }, mod: "M1" },
    { id: "mass",         name: "Mass",              sym: "m",       unit: "kg",             dim: { kg: 1 }, mod: "M2" },
    { id: "force",        name: "Force",             sym: "F",       unit: "N",              dim: { kg: 1, m: 1, s: -2 }, mod: "M2" },
    { id: "momentum",     name: "Momentum",          sym: "p",       unit: "kg m s^-1",      dim: { kg: 1, m: 1, s: -1 }, mod: "M2" },
    { id: "impulse",      name: "Impulse",           sym: "Delta p", unit: "N s",            dim: { kg: 1, m: 1, s: -1 }, mod: "M2" },
    { id: "energy",       name: "Energy",            sym: "E",       unit: "J",              dim: { kg: 1, m: 2, s: -2 }, mod: "M2" },
    { id: "work",         name: "Work",              sym: "W",       unit: "J",              dim: { kg: 1, m: 2, s: -2 }, mod: "M2" },
    { id: "power",        name: "Power",             sym: "P",       unit: "W",              dim: { kg: 1, m: 2, s: -3 }, mod: "M2" },
    { id: "torque",       name: "Torque",            sym: "tau",     unit: "N m",            dim: { kg: 1, m: 2, s: -2 }, mod: "M5" },
    { id: "pressure",     name: "Pressure",          sym: "P",       unit: "Pa",             dim: { kg: 1, m: -1, s: -2 }, mod: "M3" },
    { id: "density",      name: "Density",           sym: "rho",     unit: "kg m^-3",        dim: { kg: 1, m: -3 }, mod: "M3" },
    { id: "frequency",    name: "Frequency",         sym: "f",       unit: "Hz",             dim: { s: -1 }, mod: "M3" },
    { id: "period",       name: "Period",            sym: "T",       unit: "s",              dim: { s: 1 }, mod: "M3" },
    { id: "wavelength",   name: "Wavelength",        sym: "lambda",  unit: "m",              dim: { m: 1 }, mod: "M3" },
    { id: "angvel",       name: "Angular velocity",  sym: "omega",   unit: "rad s^-1",       dim: { s: -1 }, mod: "M5" },
    { id: "intensity",    name: "Intensity",         sym: "I",       unit: "W m^-2",         dim: { kg: 1, s: -3 }, mod: "M3" },
    { id: "heatcap",      name: "Specific heat capacity", sym: "c",  unit: "J kg^-1 K^-1",   dim: { m: 2, s: -2, K: -1 }, mod: "M3" },
    { id: "temperature",  name: "Temperature",       sym: "T",       unit: "K",              dim: { K: 1 }, mod: "M3" },
    { id: "charge",       name: "Charge",            sym: "q",       unit: "C",              dim: { A: 1, s: 1 }, mod: "M4" },
    { id: "current",      name: "Current",           sym: "I",       unit: "A",              dim: { A: 1 }, mod: "M4" },
    { id: "voltage",      name: "Potential difference", sym: "V",    unit: "V",              dim: { kg: 1, m: 2, s: -3, A: -1 }, mod: "M4" },
    { id: "resistance",   name: "Resistance",        sym: "R",       unit: "Ω",             dim: { kg: 1, m: 2, s: -3, A: -2 }, mod: "M4" },
    { id: "resistivity",  name: "Resistivity",       sym: "rho",     unit: "Ω m",           dim: { kg: 1, m: 3, s: -3, A: -2 }, mod: "M4" },
    { id: "capacitance",  name: "Capacitance",       sym: "C",       unit: "F",              dim: { kg: -1, m: -2, s: 4, A: 2 }, mod: "M4" },
    { id: "efield",       name: "Electric field strength", sym: "E",  unit: "V m^-1",        dim: { kg: 1, m: 1, s: -3, A: -1 }, mod: "M4" },
    { id: "bfield",       name: "Magnetic flux density", sym: "B",   unit: "T",              dim: { kg: 1, s: -2, A: -1 }, mod: "M6" },
    { id: "flux",         name: "Magnetic flux",     sym: "Phi",     unit: "Wb",             dim: { kg: 1, m: 2, s: -2, A: -1 }, mod: "M6" },
    { id: "emf",          name: "EMF",               sym: "epsilon", unit: "V",              dim: { kg: 1, m: 2, s: -3, A: -1 }, mod: "M6" },
    { id: "planck",       name: "Planck constant",   sym: "h",       unit: "J s",            dim: { kg: 1, m: 2, s: -1 }, mod: "M7" },
    { id: "workfn",       name: "Work function",     sym: "phi",     unit: "J",              dim: { kg: 1, m: 2, s: -2 }, mod: "M7" },
    { id: "grav",         name: "Gravitational field strength", sym: "g", unit: "N kg^-1",   dim: { m: 1, s: -2 }, mod: "M5" },
    { id: "gravpot",      name: "Gravitational potential energy", sym: "U", unit: "J",       dim: { kg: 1, m: 2, s: -2 }, mod: "M5" },
    { id: "gconst",       name: "Gravitational constant", sym: "G",  unit: "N m^2 kg^-2",    dim: { kg: -1, m: 3, s: -2 }, mod: "M5" },
    { id: "activity",     name: "Activity",          sym: "A",       unit: "Bq",             dim: { s: -1 }, mod: "M8" },
    { id: "halflife",     name: "Half-life",         sym: "t_{1/2}", unit: "s",              dim: { s: 1 }, mod: "M8" },
    { id: "refindex",     name: "Refractive index",  sym: "n",       unit: "no units",       dim: {}, mod: "M3" }
  ];

  const quantity = id => QUANTITIES.find(x => x.id === id);

  return { BASE, q, clean, mul, div, pow, scale, sqrt, add, sub, same,
           mulU, divU, powU, invU, dimensionless,
           parse, toSI, str, baseStr, fmt, NAMED, PREFIX,
           QUANTITIES, quantity };
})();
