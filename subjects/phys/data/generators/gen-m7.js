/* Module 7 — The Nature of Light: the electromagnetic spectrum, spectroscopy, the
   photoelectric effect, special relativity.  Contract: js/core/gen.js. */
(function () {
  const reg = PHYS.Gen.register;
  const F = (v, n) => PHYS.U.fmtSig(v, n || 3);

  reg({
    id: "m7-photon-energy", mod: "M7", topic: "Quantum nature of light", diff: 1,
    ask: "photon energy", dim: { kg: 1, m: 2, s: -2 },
    build(r, K) {
      const h = K("h"), c = K("c");
      const band = r.pick([
        { name: "a radio wave", lam: r.nice(1, 300, 1) },
        { name: "a microwave", lam: r.nice(1, 90, 1) * 1e-3 },
        { name: "infrared light", lam: r.nice(1, 90, 1) * 1e-6 },
        { name: "red light", lam: r.nice(620, 740, 10) * 1e-9 },
        { name: "green light", lam: r.nice(500, 560, 10) * 1e-9 },
        { name: "blue light", lam: r.nice(440, 490, 10) * 1e-9 },
        { name: "ultraviolet light", lam: r.nice(10, 380, 10) * 1e-9 },
        { name: "an X-ray", lam: r.nice(1, 100, 1) * 1e-11 }
      ]);
      const E = (h * c) / band.lam;
      return {
        givens: { lam: band.lam },
        q: `What is the energy of one photon of ${band.name} with a wavelength of ` +
           `${F(band.lam, 3)} \\u{m}?`,
        value: E, units: { kg: 1, m: 2, s: -2 }, sf: 3,
        /* Route B: two steps — frequency from the wave equation, then E = hf. */
        verify: () => {
          const f = c / band.lam;
          return h * f;
        },
        verifyTol: 1e-12,
        routes: ["E = hc/λ", "f = c/λ, then E = hf"],
        working: [
          { eq: `f = \\f{c}{lambda} = \\f{3.00 \\times 10^8}{${F(band.lam, 3)}} = ${F(c / band.lam, 3)} \\u{Hz}`, note: "" },
          { eq: `E = hf = 6.626 \\times 10^{-34} \\times ${F(c / band.lam, 3)} = ${F(E)} \\u{J}`, note: "" },
          { eq: `= ${F(E / K("eV"), 3)} \\u{eV}`,
            note: "Photon energies are usually quoted in electronvolts because the joule values are " +
                  "so small. Shorter wavelength means higher energy — always." }
        ],
        distractors: [
          { value: h * band.lam, why: "multiplied by the wavelength; E = hf, and f is c/λ, so the wavelength divides" },
          { value: (h * band.lam) / c, why: "put c in the denominator instead of the numerator" },
          { value: (K("c") * band.lam) / h, why: "rearranged E = hc/λ incorrectly" },
          { value: h / band.lam, why: "left out c — h/λ is a momentum in kg m s⁻¹, not an energy" }
        ]
      };
    }
  });

  reg({
    id: "m7-photoelectric-kmax", mod: "M7", topic: "Photoelectric effect", diff: 2,
    ask: "maximum kinetic energy of a photoelectron", dim: { kg: 1, m: 2, s: -2 },
    build(r, K) {
      const h = K("h"), c = K("c"), eV = K("eV");
      const metal = r.pick(PHYS.DATA.constants.workFunctions);
      /* Answer first: choose the photon energy comfortably above the work function
         so there IS an emission to ask about. */
      const excess = r.nice(0.3, 3, 0.1);                 // eV of surplus
      const Ephoton = (metal.phi + excess) * eV;
      const lam = (h * c) / Ephoton;
      const Ek = Ephoton - metal.phi * eV;
      return {
        givens: { metal: metal.metal, phi: metal.phi, lam },
        q: `Light of wavelength ${F(lam * 1e9, 3)} \\u{nm} falls on a ${metal.metal} surface whose ` +
           `work function is ${F(metal.phi, 3)} \\u{eV}. What is the maximum kinetic energy of the ` +
           `emitted photoelectrons, in joules?`,
        value: Ek, units: { kg: 1, m: 2, s: -2 }, sf: 3,
        /* Route B: work entirely in electronvolts, then convert once at the end. A
           different arithmetic path that catches a misplaced eV conversion. */
        verify: () => {
          const EphotonEv = ((h * c) / lam) / eV;
          const EkEv = EphotonEv - metal.phi;
          return EkEv * eV;
        },
        verifyTol: 1e-9,
        routes: ["E_k = hf − φ in joules", "the same in electronvolts, converted at the end"],
        working: [
          { eq: `E_{photon} = \\f{hc}{lambda} = ${F(Ephoton)} \\u{J} = ${F(Ephoton / eV, 3)} \\u{eV}`, note: "" },
          { eq: `phi = ${F(metal.phi, 3)} \\u{eV} = ${F(metal.phi * eV)} \\u{J}`,
            note: "Convert the work function too — you cannot subtract eV from J." },
          { eq: `E_{k,max} = hf - phi = ${F(Ek)} \\u{J} = ${F(Ek / eV, 3)} \\u{eV}`,
            note: "MAXIMUM, because electrons deeper in the metal need more than φ to escape and come " +
                  "out with less. Brighter light gives MORE electrons, not faster ones — that is the " +
                  "observation the wave model could not explain." }
        ],
        distractors: [
          { value: Ephoton, why: "gave the photon's energy without subtracting the work function" },
          { value: Ephoton + metal.phi * eV, why: "added the work function instead of subtracting it" },
          { value: metal.phi * eV, why: "gave the work function itself" },
          { value: (h * c) / lam - metal.phi, why: "subtracted the work function in eV from an energy in J without converting" }
        ]
      };
    }
  });

  reg({
    id: "m7-photoelectric-threshold", mod: "M7", topic: "Photoelectric effect", diff: 2,
    ask: "threshold frequency", dim: { s: -1 },
    build(r, K) {
      const h = K("h"), eV = K("eV");
      const metal = r.pick(PHYS.DATA.constants.workFunctions);
      const f0 = (metal.phi * eV) / h;
      return {
        givens: { metal: metal.metal, phi: metal.phi },
        q: `The work function of ${metal.metal} is ${F(metal.phi, 3)} \\u{eV}. What is its ` +
           `threshold frequency for photoelectric emission?`,
        value: f0, units: { s: -1 }, sf: 3,
        /* Route B: go through the threshold WAVELENGTH and back. Different arithmetic
           and it exercises the wave equation as well. */
        verify: () => {
          const c = K("c");
          const lam0 = (h * c) / (metal.phi * eV);
          return c / lam0;
        },
        verifyTol: 1e-9,
        routes: ["f₀ = φ/h", "threshold wavelength λ₀ = hc/φ, then f₀ = c/λ₀"],
        working: [
          { eq: `phi = ${F(metal.phi, 3)} \\times 1.602 \\times 10^{-19} = ${F(metal.phi * eV)} \\u{J}`, note: "" },
          { eq: `f_0 = \\f{phi}{h} = \\f{${F(metal.phi * eV)}}{6.626 \\times 10^{-34}} = ${F(f0)} \\u{Hz}`, note: "" },
          { eq: `lambda_0 = \\f{c}{f_0} = ${F((K("c") / f0) * 1e9, 3)} \\u{nm}`,
            note: "Below this frequency NOTHING is emitted, no matter how intense the light or how long " +
                  "you wait. That is the sharp cut-off classical wave theory could not account for." }
        ],
        distractors: [
          { value: (metal.phi * eV) * h, why: "multiplied by h instead of dividing" },
          { value: metal.phi / h, why: "left the work function in eV instead of converting to joules" },
          { value: h / (metal.phi * eV), why: "inverted the expression — this has units of seconds" },
          { value: (K("c") * h) / (metal.phi * eV), why: "computed the threshold WAVELENGTH in metres, not the frequency" }
        ]
      };
    }
  });

  reg({
    id: "m7-stopping-voltage", mod: "M7", topic: "Photoelectric effect", diff: 3,
    ask: "stopping voltage", dim: { kg: 1, m: 2, s: -3, A: -1 },
    build(r, K) {
      const h = K("h"), c = K("c"), eV = K("eV"), e = K("e");
      const metal = r.pick(PHYS.DATA.constants.workFunctions);
      const excess = r.nice(0.4, 3, 0.1);
      const Ephoton = (metal.phi + excess) * eV;
      const lam = (h * c) / Ephoton;
      const Vs = (Ephoton - metal.phi * eV) / e;
      return {
        givens: { metal: metal.metal, phi: metal.phi, lam },
        q: `Light of wavelength ${F(lam * 1e9, 3)} \\u{nm} illuminates a ${metal.metal} cathode ` +
           `(work function ${F(metal.phi, 3)} \\u{eV}). What stopping voltage just prevents any ` +
           `photoelectron reaching the anode?`,
        value: Vs, units: { kg: 1, m: 2, s: -3, A: -1 }, sf: 3,
        /* Route B: energy balance from the threshold frequency — eV_s = h(f − f₀).
           Uses f₀ rather than φ, so a wrong conversion shows up. */
        verify: () => {
          const f = c / lam;
          const f0 = (metal.phi * eV) / h;
          return (h * (f - f0)) / e;
        },
        verifyTol: 1e-9,
        routes: ["eV_s = hf − φ", "eV_s = h(f − f₀) using the threshold frequency"],
        working: [
          { eq: `E_{photon} = \\f{hc}{lambda} = ${F(Ephoton / eV, 3)} \\u{eV}`, note: "" },
          { eq: `E_{k,max} = ${F(Ephoton / eV, 3)} - ${F(metal.phi, 3)} = ${F(excess, 3)} \\u{eV}`, note: "" },
          { eq: `eV_s = E_{k,max} \\implies V_s = ${F(Vs)} \\u{V}`,
            note: "The neat part: in electronvolts the stopping voltage in volts and the maximum kinetic " +
                  "energy in eV are the SAME NUMBER, because 1 eV is by definition the energy an electron " +
                  "gains through 1 V. That is worth using as a check." }
        ],
        distractors: [
          { value: Ephoton / e, why: "used the whole photon energy without subtracting the work function" },
          { value: (metal.phi * eV) / e, why: "converted the work function to a voltage, ignoring the photon" },
          { value: (Ephoton + metal.phi * eV) / e, why: "added the work function instead of subtracting it" },
          { value: (Ephoton - metal.phi * eV) / eV * e, why: "multiplied by the electron charge instead of dividing" }
        ]
      };
    }
  });

  reg({
    id: "m7-wien", mod: "M7", topic: "Blackbody radiation", diff: 2,
    ask: "peak wavelength", dim: { m: 1 },
    build(r, K) {
      const b = K("wien");
      const T = r.nice(300, 30000, 100);
      const lam = b / T;
      return {
        givens: { T },
        q: `A blackbody is at a temperature of ${T} \\u{K}. At what wavelength does it radiate ` +
           `most strongly? Wien's displacement constant is 2.898 \\times 10^{-3} \\u{m K}.`,
        value: lam, units: { m: 1 }, sf: 3,
        /* Route B: invert — recover the temperature from the answer and check the
           original comes back. Wien's law has no genuinely separate second route. */
        verify: () => {
          const Tback = b / lam;
          if (Math.abs(Tback - T) / T > 1e-9) throw new Error("inversion failed");
          return b / Tback;
        },
        verifyTol: 1e-12,
        routes: ["λ_max = b/T", "inverting: T = b/λ_max must return the stated temperature"],
        working: [
          { eq: `lambda_{max} = \\f{b}{T} = \\f{2.898 \\times 10^{-3}}{${T}} = ${F(lam)} \\u{m}`, note: "" },
          { eq: `= ${F(lam * 1e9, 3)} \\u{nm}`,
            note: lam > 7e-7 ? "In the infrared, so the object glows invisibly — you feel it rather than see it."
                 : lam < 4e-7 ? "In the ultraviolet, so the object looks blue-white: we see the tail of its spectrum."
                 : "In the visible range. Hotter bodies peak at SHORTER wavelengths, which is why a star's colour tells you its temperature." }
        ],
        distractors: [
          { value: b * T, why: "multiplied instead of dividing — hotter would then mean longer wavelength, which is backwards" },
          { value: T / b, why: "inverted the whole expression" },
          { value: b / (T + 273), why: "added 273 to a temperature already given in kelvin" },
          { value: b / (T * T), why: "used T²; the T⁴ appears in Stefan–Boltzmann, not in Wien's law" }
        ]
      };
    }
  });

  reg({
    id: "m7-stefan-boltzmann", mod: "M7", topic: "Blackbody radiation", diff: 3,
    ask: "power radiated", dim: { kg: 1, m: 2, s: -3 },
    build(r, K) {
      const sig = K("stefan");
      const T = r.nice(300, 6000, 100);
      const A = r.nice(0.01, 20, 0.01);
      const P = sig * A * Math.pow(T, 4);
      return {
        givens: { T, A },
        q: `A blackbody of surface area ${F(A, 3)} \\u{m^2} is at ${T} \\u{K}. What total power ` +
           `does it radiate? The Stefan–Boltzmann constant is 5.67 \\times 10^{-8} ` +
           `\\u{W m^-2 K^-4}.`,
        value: P, units: { kg: 1, m: 2, s: -3 }, sf: 3,
        /* Route B: compute the intensity per square metre first, then scale by the
           area — separating the two factors catches a misplaced area. */
        verify: () => {
          const intensity = sig * Math.pow(T, 4);      // W m⁻²
          return intensity * A;
        },
        verifyTol: 1e-12,
        routes: ["P = σAT⁴", "intensity σT⁴ per square metre, then × area"],
        working: [
          { eq: `I = sigma T^4 = 5.67 \\times 10^{-8} \\times ${T}^4 = ${F(sig * Math.pow(T, 4), 3)} \\u{W m^-2}`, note: "" },
          { eq: `P = IA = ${F(P)} \\u{W}`, note: "" },
          { eq: ``, note: "The FOURTH power is the thing to remember: doubling the temperature radiates " +
                          "sixteen times the power. That is why a small hot star can outshine a large cool one." }
        ],
        distractors: [
          { value: sig * A * T, why: "used T rather than T⁴" },
          { value: sig * A * Math.pow(T, 2), why: "used T²" },
          { value: sig * Math.pow(T, 4), why: "left out the area — this is the intensity in W m⁻², not the total power" },
          { value: sig * A * Math.pow(T + 273, 4), why: "added 273 to a temperature already in kelvin" }
        ]
      };
    }
  });

  reg({
    id: "m7-time-dilation", mod: "M7", topic: "Special relativity", diff: 3,
    ask: "dilated time", dim: { s: 1 },
    build(r, K) {
      const c = K("c");
      const beta = r.pick([0.5, 0.6, 0.7, 0.8, 0.866, 0.9, 0.95, 0.99]);
      const v = beta * c;
      const t0 = r.nice(1, 100, 1);
      const gamma = 1 / Math.sqrt(1 - beta * beta);
      const t = gamma * t0;
      return {
        givens: { beta, t0 },
        q: `A clock aboard a spacecraft measures a ${t0} \\u{s} interval. The spacecraft moves at ` +
           `${F(beta, 3)}c relative to an observer on Earth. How long is that interval as ` +
           `measured on Earth?`,
        value: t, units: { s: 1 }, sf: 3,
        /* Route B: use the light-clock geometry directly. A light pulse bouncing
           across the ship travels a longer diagonal path in the Earth frame; requiring
           it to move at c in both frames gives the dilation with no γ formula. */
        verify: () => {
          /* In the ship's frame the pulse crosses a width d in t₀, so d = c·t₀.
             In the Earth frame it travels the hypotenuse in time t while the ship
             moves v·t sideways: (ct)² = d² + (vt)². */
          const d = c * t0;
          return Math.sqrt((d * d) / (c * c - v * v));
        },
        verifyTol: 1e-9,
        routes: ["t = γt₀ with γ = 1/√(1 − v²/c²)", "light-clock geometry: (ct)² = (ct₀)² + (vt)²"],
        working: [
          { eq: `gamma = \\f{1}{\\sqrt{1 - \\f{v^2}{c^2}}} = \\f{1}{\\sqrt{1 - ${F(beta * beta, 4)}}} = ${F(gamma, 4)}`, note: "" },
          { eq: `t = gamma t_0 = ${F(gamma, 4)} \\times ${t0} = ${F(t)} \\u{s}`, note: "" },
          { eq: ``, note: "t₀ is the PROPER time — measured by a single clock present at both events, here " +
                          "the one on the ship. The dilated time is always the LONGER one, so if your answer " +
                          "is smaller than t₀ you have divided by γ instead of multiplying." }
        ],
        distractors: [
          { value: t0 / gamma, why: "divided by γ instead of multiplying; the moving clock is the one that runs slow, so the Earth measures a longer interval" },
          { value: t0 * Math.sqrt(1 - beta * beta), why: "used √(1 − v²/c²) instead of its reciprocal — that is the LENGTH-contraction factor" },
          { value: t0 * (1 + beta), why: "used a linear approximation in v/c, which is not what relativity gives" },
          { value: t0, why: "assumed time is the same in both frames" }
        ]
      };
    }
  });

  reg({
    id: "m7-length-contraction", mod: "M7", topic: "Special relativity", diff: 3,
    ask: "contracted length", dim: { m: 1 },
    build(r) {
      const beta = r.pick([0.5, 0.6, 0.7, 0.8, 0.866, 0.9, 0.95, 0.99]);
      const L0 = r.nice(5, 400, 5);
      const gamma = 1 / Math.sqrt(1 - beta * beta);
      const L = L0 / gamma;
      return {
        givens: { beta, L0 },
        q: `A rod is ${L0} \\u{m} long when at rest. It moves lengthwise past an observer at ` +
           `${F(beta, 3)}c. How long does the observer measure it to be?`,
        value: L, units: { m: 1 }, sf: 3,
        /* Route B: reason from time dilation instead. The observer times how long the
           rod takes to pass a fixed point; in the rod's frame that same measurement
           is a dilated interval. */
        verify: () => {
          const c = PHYS.DATA.constants.K("c");
          const v = beta * c;
          /* In the rod's frame, the observer travels the rod's rest length at v,
             taking t₀ = L₀/v of the ROD's proper time. The observer's own clock reads
             the shorter t = t₀/γ, and measures L = v·t. */
          const t0 = L0 / v;
          return v * (t0 / gamma);
        },
        verifyTol: 1e-9,
        routes: ["L = L₀/γ", "time the rod takes to pass, using time dilation"],
        working: [
          { eq: `gamma = ${F(gamma, 4)}`, note: "" },
          { eq: `L = \\f{L_0}{gamma} = \\f{${L0}}{${F(gamma, 4)}} = ${F(L)} \\u{m}`, note: "" },
          { eq: ``, note: "Contraction happens ONLY along the direction of motion — the rod's width is " +
                          "unchanged. And it is not an illusion of light travel time: the observer really " +
                          "measures this length. In the rod's own frame nothing has happened to it at all." }
        ],
        distractors: [
          { value: L0 * gamma, why: "multiplied by γ; a moving object is measured SHORTER, not longer" },
          { value: L0, why: "assumed length is frame-independent" },
          { value: L0 * (1 - beta), why: "used a linear factor (1 − v/c) instead of √(1 − v²/c²)" },
          { value: L0 / (gamma * gamma), why: "divided by γ² — length contraction has a single factor of γ" }
        ]
      };
    }
  });

  reg({
    id: "m7-mass-energy", mod: "M7", topic: "Mass–energy equivalence", diff: 2,
    ask: "rest energy", dim: { kg: 1, m: 2, s: -2 },
    build(r, K) {
      const c = K("c");
      const item = r.pick([
        { name: "an electron", m: K("me") },
        { name: "a proton", m: K("mp") },
        { name: "a neutron", m: K("mn") },
        { name: "a 1.00 g mass", m: 1.00e-3 },
        { name: "a paperclip of mass 0.50 g", m: 0.50e-3 }
      ]);
      const E = item.m * c * c;
      return {
        givens: { m: item.m },
        q: `What is the rest energy of ${item.name} (mass ${F(item.m, 4)} \\u{kg})?`,
        value: E, units: { kg: 1, m: 2, s: -2 }, sf: 3,
        /* No second physical route exists for E = mc², so INVERT: recover the mass
           from the energy and check the original comes back (brief §5.2). */
        verify: () => {
          const Etry = item.m * c * c;
          const mBack = Etry / (c * c);
          if (Math.abs(mBack - item.m) / item.m > 1e-12) throw new Error("inversion failed");
          return mBack * c * c;
        },
        verifyTol: 1e-12,
        routes: ["E = mc²", "inverting: m = E/c² must return the stated mass"],
        working: [
          { eq: `E = mc^2 = ${F(item.m, 4)} \\times (3.00 \\times 10^8)^2`, note: "" },
          { eq: `E = ${F(E)} \\u{J} = ${F(E / K("eV") / 1e6, 3)} \\u{MeV}`,
            note: "c² is about 9 × 10¹⁶, which is why even a tiny mass corresponds to an enormous energy. " +
                  "This is rest energy — the energy equivalent of simply existing, before any motion." }
        ],
        distractors: [
          { value: item.m * c, why: "used c rather than c² — mc has units of kg m s⁻¹, a momentum" },
          { value: item.m * c * c * c, why: "used c³" },
          { value: item.m / (c * c), why: "divided by c² instead of multiplying" },
          { value: 0.5 * item.m * c * c, why: "used ½mc², borrowing the ½ from the kinetic-energy formula; E = mc² has no ½" }
        ]
      };
    }
  });

  reg({
    id: "m7-relativistic-momentum", mod: "M7", topic: "Special relativity", diff: 3,
    ask: "relativistic momentum", dim: { kg: 1, m: 1, s: -1 },
    build(r, K) {
      const c = K("c");
      const beta = r.pick([0.5, 0.6, 0.7, 0.8, 0.9, 0.95, 0.99]);
      const kind = r.pick(["electron", "proton"]);
      const m = kind === "electron" ? K("me") : K("mp");
      const v = beta * c;
      const gamma = 1 / Math.sqrt(1 - beta * beta);
      const p = gamma * m * v;
      return {
        givens: { kind, beta },
        q: `${kind === "electron" ? "An electron" : "A proton"} (rest mass ${F(m, 4)} \\u{kg}) moves ` +
           `at ${F(beta, 3)}c. What is its momentum?`,
        value: p, units: { kg: 1, m: 1, s: -1 }, sf: 3,
        /* Route B: use the energy–momentum relation E² = (pc)² + (mc²)², getting p
           from the total energy γmc². Genuinely different algebra. */
        verify: () => {
          const E = gamma * m * c * c;
          const rest = m * c * c;
          return Math.sqrt(E * E - rest * rest) / c;
        },
        verifyTol: 1e-9,
        routes: ["p = γmv", "from E² = (pc)² + (mc²)² with E = γmc²"],
        working: [
          { eq: `gamma = \\f{1}{\\sqrt{1 - ${F(beta * beta, 4)}}} = ${F(gamma, 4)}`, note: "" },
          { eq: `p = gamma mv = ${F(gamma, 4)} \\times ${F(m, 4)} \\times ${F(v, 3)} = ${F(p)} \\u{kg m s^-1}`, note: "" },
          { eq: ``, note: `Classically it would be ${F(m * v, 3)} kg m s⁻¹ — the relativistic value is ` +
                          `${F(gamma, 3)}× larger. As v → c the momentum grows without limit, which is ` +
                          `why no amount of force gets a massive particle to c.` }
        ],
        distractors: [
          { value: m * v, why: "used the classical p = mv, which underestimates badly at this speed" },
          { value: m * v / gamma, why: "divided by γ instead of multiplying" },
          { value: gamma * m * c, why: "used c instead of the actual speed v" },
          { value: gamma * m * v * v, why: "used v²; momentum is linear in v" }
        ]
      };
    }
  });

  reg({
    id: "m7-relativistic-ke", mod: "M7", topic: "Special relativity", diff: 3,
    ask: "relativistic kinetic energy", dim: { kg: 1, m: 2, s: -2 },
    build(r, K) {
      const c = K("c"), eV = K("eV");
      const beta = r.pick([0.6, 0.7, 0.8, 0.9, 0.95, 0.99]);
      const kind = r.pick(["electron", "proton"]);
      const m = kind === "electron" ? K("me") : K("mp");
      const gamma = 1 / Math.sqrt(1 - beta * beta);
      const Ek = (gamma - 1) * m * c * c;
      return {
        givens: { kind, beta },
        q: `${kind === "electron" ? "An electron" : "A proton"} (rest mass ${F(m, 4)} \\u{kg}) is ` +
           `accelerated to ${F(beta, 3)}c. What is its kinetic energy?`,
        value: Ek, units: { kg: 1, m: 2, s: -2 }, sf: 3,
        /* Route B: total energy minus rest energy, computed as two separate
           quantities rather than through the (γ−1) factor. */
        verify: () => {
          const total = gamma * m * c * c;
          const rest = m * c * c;
          return total - rest;
        },
        verifyTol: 1e-9,
        routes: ["E_k = (γ−1)mc²", "total energy γmc² minus rest energy mc²"],
        working: [
          { eq: `gamma = ${F(gamma, 4)}`, note: "" },
          { eq: `E_{total} = gamma mc^2 = ${F(gamma * m * c * c)} \\u{J}`, note: "" },
          { eq: `E_k = E_{total} - mc^2 = ${F(Ek)} \\u{J} = ${F(Ek / eV / 1e6, 3)} \\u{MeV}`,
            note: `Classically ½mv² would give ${F(0.5 * m * beta * beta * c * c, 3)} J — ` +
                  `${F((0.5 * m * beta * beta * c * c) / Ek * 100, 3)}% of the true value. Kinetic energy ` +
                  `is the total energy MINUS the rest energy, not γ×½mv².` }
        ],
        distractors: [
          { value: 0.5 * m * beta * beta * c * c, why: "used the classical ½mv², which is badly wrong at this speed" },
          { value: gamma * m * c * c, why: "gave the TOTAL energy; kinetic energy excludes the rest energy mc²" },
          { value: gamma * 0.5 * m * beta * beta * c * c, why: "multiplied the classical formula by γ; the correct form is (γ−1)mc²" },
          { value: m * c * c, why: "gave the rest energy" }
        ]
      };
    }
  });

  reg({
    id: "m7-spectral-line-shift", mod: "M7", topic: "Spectroscopy", diff: 2,
    ask: "photon momentum", dim: { kg: 1, m: 1, s: -1 },
    build(r, K) {
      const h = K("h"), c = K("c");
      const lam = r.nice(200, 900, 10) * 1e-9;
      const p = h / lam;
      return {
        givens: { lam },
        q: `What is the momentum of a photon of wavelength ${F(lam * 1e9, 3)} \\u{nm}?`,
        value: p, units: { kg: 1, m: 1, s: -1 }, sf: 3,
        /* Route B: via the photon's energy and p = E/c, which holds for anything
           massless. Different chain, same answer. */
        verify: () => {
          const E = (h * c) / lam;
          return E / c;
        },
        verifyTol: 1e-12,
        routes: ["p = h/λ", "E = hc/λ, then p = E/c for a massless particle"],
        working: [
          { eq: `p = \\f{h}{lambda} = \\f{6.626 \\times 10^{-34}}{${F(lam, 3)}} = ${F(p)} \\u{kg m s^-1}`, note: "" },
          { eq: `E = \\f{hc}{lambda} = ${F((h * c) / lam, 3)} \\u{J}, \\f{E}{c} = ${F(p, 3)}`,
            note: "A photon has momentum but no mass. p = E/c is the massless case of " +
                  "E² = (pc)² + (mc²)², and it is what makes solar sails and radiation pressure real." }
        ],
        distractors: [
          { value: h * lam, why: "multiplied by the wavelength instead of dividing" },
          { value: (h * c) / lam, why: "gave the photon's ENERGY in joules, not its momentum" },
          { value: h / (lam * c), why: "divided by c as well; p = h/λ has no c in it" },
          { value: (h * c) / (lam * lam), why: "divided by λ twice" }
        ]
      };
    }
  });
})();
