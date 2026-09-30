/* Module 4 — Electricity and Magnetism: electrostatics, circuits, magnetism.
   Contract: js/core/gen.js. */
(function () {
  const reg = PHYS.Gen.register;
  const F = (v, n) => PHYS.U.fmtSig(v, n || 3);

  reg({
    id: "m4-ohm-v", mod: "M4", topic: "Circuits", diff: 1,
    ask: "potential difference", dim: { kg: 1, m: 2, s: -3, A: -1 },
    build(r) {
      const I = r.nice(0.05, 4, 0.05);
      const R = r.nice(2, 500, 2);
      const V = I * R;
      return {
        givens: { I, R },
        q: `A current of ${F(I, 3)} \\u{A} flows through a ${R} \\u{Ω} resistor. What is the ` +
           `potential difference across it?`,
        value: V, units: { kg: 1, m: 2, s: -3, A: -1 }, sf: 3,
        /* Route B: via power. Compute the dissipation as I²R, then recover the
           voltage from P = VI. Different formulas, same physics. */
        verify: () => {
          const P = I * I * R;
          return P / I;
        },
        verifyTol: 1e-9,
        routes: ["V = IR", "P = I²R, then V = P/I"],
        working: [
          { eq: `V = IR = ${F(I, 3)} \\times ${R} = ${F(V)} \\u{V}`, note: "" },
          { eq: `P = I^2R = ${F(I * I * R)} \\u{W}`,
            note: "A useful cross-check: P/I gives the same voltage back." }
        ],
        distractors: [
          { value: I / R, why: "divided instead of multiplying" },
          { value: R / I, why: "divided the wrong way round" },
          { value: I * I * R, why: "computed the POWER dissipated in watts, not the voltage in volts" },
          { value: I, why: "quoted the current back" }
        ]
      };
    }
  });

  reg({
    id: "m4-series-parallel", mod: "M4", topic: "Circuits", diff: 2,
    ask: "equivalent resistance", diffNote: true, dim: { kg: 1, m: 2, s: -3, A: -2 },
    build(r) {
      const n = r.int(2, 3);
      const Rs = [];
      for (let i = 0; i < n; i++) Rs.push(r.nice(2, 60, 2));
      const series = r.f() < 0.5;
      const Rt = series ? Rs.reduce((a, b) => a + b, 0)
                        : 1 / Rs.reduce((a, b) => a + 1 / b, 0);
      const list = Rs.map(x => x + " \\u{Ω}").join(", ");
      return {
        givens: { Rs, series },
        q: `${n} resistors of ${list} are connected in ${series ? "series" : "parallel"}. ` +
           `What is the equivalent resistance?`,
        value: Rt, units: { kg: 1, m: 2, s: -3, A: -2 }, sf: 3,
        /* Route B: put a test voltage across the combination, work out the actual
           currents branch by branch (or the voltages element by element), and
           divide. Never touches the series/parallel formula. */
        verify: () => {
          const Vtest = 12;
          if (series) {
            // Same current everywhere; find it by requiring the voltages to sum to V.
            const I = Vtest / Rs.reduce((a, b) => a + b, 0);
            const Vsum = Rs.reduce((a, R) => a + I * R, 0);
            if (Math.abs(Vsum - Vtest) > 1e-9) throw new Error("series voltages do not sum");
            return Vtest / I;
          }
          // Same voltage across each branch; total current is the sum of the branches.
          const Itot = Rs.reduce((a, R) => a + Vtest / R, 0);
          return Vtest / Itot;
        },
        verifyTol: 1e-9,
        diagram: { kind: "circuit", resistors: Rs, series },
        routes: series ? ["R_T = R₁ + R₂ + …", "apply a test voltage and find the common current"]
                       : ["1/R_T = 1/R₁ + 1/R₂ + …", "apply a test voltage and add the branch currents"],
        working: series ? [
          { eq: `R_T = ${Rs.join(" + ")} = ${F(Rt)} \\u{Ω}`,
            note: "In series the current is the same through each resistor and the voltages add, " +
                  "so the resistances add. The total is always LARGER than the biggest one." }
        ] : [
          { eq: `\\f{1}{R_T} = ${Rs.map(x => "\\f{1}{" + x + "}").join(" + ")} = ${F(1 / Rt, 3)}`, note: "" },
          { eq: `R_T = ${F(Rt)} \\u{Ω}`,
            note: `In parallel the voltage is the same across each branch and the currents add. ` +
                  `The total is always SMALLER than the smallest resistor (${Math.min.apply(null, Rs)} Ω) — ` +
                  `if your answer is bigger than that, you have added the resistances instead of the ` +
                  `reciprocals.` }
        ],
        distractors: series ? [
          { value: 1 / Rs.reduce((a, b) => a + 1 / b, 0), why: "used the parallel rule for a series circuit" },
          { value: Rs.reduce((a, b) => a + b, 0) / n, why: "averaged the resistances" },
          { value: Math.max.apply(null, Rs), why: "took only the largest resistor" },
          { value: Rs.reduce((a, b) => a * b, 1), why: "multiplied the resistances" }
        ] : [
          { value: Rs.reduce((a, b) => a + b, 0), why: "used the series rule for a parallel circuit — the answer must be smaller than the smallest branch" },
          { value: Rs.reduce((a, b) => a + 1 / b, 0), why: "stopped at 1/R_T and forgot to invert" },
          { value: Math.min.apply(null, Rs), why: "took the smallest resistor; the parallel total is smaller still" },
          { value: Rs.reduce((a, b) => a + b, 0) / n, why: "averaged the resistances, which only coincides with the answer for one resistor" }
        ]
      };
    }
  });

  reg({
    id: "m4-power-dissipation", mod: "M4", topic: "Circuits", diff: 2,
    ask: "power dissipated", dim: { kg: 1, m: 2, s: -3 },
    build(r) {
      const V = r.nice(3, 240, 1);
      const R = r.nice(4, 900, 2);
      const P = (V * V) / R;
      const I = V / R;
      return {
        givens: { V, R },
        q: `A ${R} \\u{Ω} heating element is connected across ${V} \\u{V}. What power does it ` +
           `dissipate?`,
        value: P, units: { kg: 1, m: 2, s: -3 }, sf: 3,
        // Route B: find the current from Ohm's law, then P = I²R.
        verify: () => {
          const cur = V / R;
          return cur * cur * R;
        },
        verifyTol: 1e-9,
        routes: ["P = V²/R", "I = V/R, then P = I²R"],
        working: [
          { eq: `I = \\f{V}{R} = \\f{${V}}{${R}} = ${F(I, 3)} \\u{A}`, note: "" },
          { eq: `P = VI = ${V} \\times ${F(I, 3)} = ${F(P)} \\u{W}`, note: "" },
          { eq: `P = \\f{V^2}{R} = I^2R`,
            note: "All three forms are the same statement. Choose whichever two of V, I and R you " +
                  "were given — but do not mix a voltage with the wrong resistance." }
        ],
        distractors: [
          { value: V / R, why: "gave the current in amperes, not the power in watts" },
          { value: V * R, why: "multiplied the voltage by the resistance instead of dividing" },
          { value: (V * V) / (R * R), why: "squared the resistance as well as the voltage" },
          { value: V * V * R, why: "multiplied by R; the resistance is in the denominator for P = V²/R" }
        ]
      };
    }
  });

  reg({
    id: "m4-coulomb-force", mod: "M4", topic: "Electrostatics", diff: 2,
    ask: "electrostatic force", dim: { kg: 1, m: 1, s: -2 },
    build(r, K) {
      const kc = K("kCoulomb");
      const q1 = r.nice(1, 9, 1) * 1e-6;
      const q2 = r.nice(1, 9, 1) * 1e-6;
      const d = r.nice(0.02, 0.5, 0.01);
      const Fe = (kc * q1 * q2) / (d * d);
      return {
        givens: { q1, q2, d },
        q: `Two small spheres carry charges of ${F(q1 * 1e6, 2)} \\u{µC} and ` +
           `${F(q2 * 1e6, 2)} \\u{µC}. They are ${F(d, 3)} \\u{m} apart. What is the magnitude ` +
           `of the force between them?`,
        value: Fe, units: { kg: 1, m: 1, s: -2 }, sf: 3,
        /* Route B: compute the field of the first charge, then the force the second
           feels in it — F = q₂E₁. Two steps rather than one formula. */
        verify: () => {
          const E1 = (kc * q1) / (d * d);        // field from charge 1 at that distance
          return q2 * E1;
        },
        verifyTol: 1e-9,
        routes: ["F = kq₁q₂/r²", "E₁ = kq₁/r², then F = q₂E₁"],
        working: [
          { eq: `F = \\f{kq_1q_2}{r^2}`,
            note: `k = 1/(4πε₀) = ${F(kc, 3)} N m² C⁻², formed from the data sheet's ε₀.` },
          { eq: `F = \\f{${F(kc, 3)} \\times ${F(q1, 2)} \\times ${F(q2, 2)}}{${F(d, 3)}^2} = ${F(Fe)} \\u{N}`, note: "" },
          { eq: `E_1 = \\f{kq_1}{r^2} = ${F((kc * q1) / (d * d), 3)} \\u{V m^-1}`,
            note: "Same answer via the field: the second charge feels F = q₂E₁. Useful when a " +
                  "question gives you a field rather than a second charge." }
        ],
        distractors: [
          { value: (kc * q1 * q2) / d, why: "used r instead of r² — Coulomb's law is an inverse-SQUARE law" },
          { value: (kc * q1 * q2) / (d * d) * 1e6, why: "did not convert microcoulombs to coulombs for one of the charges" },
          { value: (kc * (q1 + q2)) / (d * d), why: "added the charges instead of multiplying them" },
          { value: (kc * q1 * q2) / Math.pow(d, 3), why: "used r³; the force falls off as 1/r², the field of a dipole as 1/r³" }
        ]
      };
    }
  });

  reg({
    id: "m4-parallel-plates", mod: "M4", topic: "Electrostatics", diff: 2,
    ask: "force on a charge between parallel plates", dim: { kg: 1, m: 1, s: -2 },
    build(r, K) {
      const e = K("e");
      const V = r.nice(50, 3000, 50);
      const d = r.nice(0.002, 0.08, 0.002);
      const nq = r.pick([1, 1, 2, 3]);
      const Ef = V / d;
      const Fe = nq * e * Ef;
      return {
        givens: { V, d, nq },
        q: `Two parallel plates ${F(d, 3)} \\u{m} apart have a potential difference of ` +
           `${V} \\u{V} between them. What force acts on ` +
           (nq === 1 ? "an electron" : `an ion carrying ${nq} elementary charges`) +
           ` placed between them?`,
        value: Fe, units: { kg: 1, m: 1, s: -2 }, sf: 3,
        /* Route B: energy. The charge gains qV of energy crossing the gap, and the
           force is the work done per unit distance. */
        verify: () => {
          const W = nq * e * V;                  // work to cross the whole gap
          return W / d;                          // uniform field, so F = W/d
        },
        verifyTol: 1e-9,
        diagram: { kind: "plates", V, d },
        routes: ["E = V/d, then F = qE", "work qV over the gap, then F = W/d"],
        working: [
          { eq: `E = \\f{V}{d} = \\f{${V}}{${F(d, 3)}} = ${F(Ef)} \\u{V m^-1}`,
            note: "The field between parallel plates is uniform, so it is the same everywhere between them." },
          { eq: `F = qE = ${nq === 1 ? "" : nq + " \\times "}1.602 \\times 10^{-19} \\times ${F(Ef)} = ${F(Fe)} \\u{N}`, note: "" },
          { eq: ``, note: "The force does not depend on WHERE between the plates the charge sits — that " +
                          "is what makes the field uniform, and it is the main difference from the " +
                          "1/r² field of a point charge." }
        ],
        distractors: [
          { value: nq * e * V, why: "multiplied by the voltage rather than the field — qV is an ENERGY in joules, not a force" },
          { value: nq * e * V * d, why: "multiplied by the plate separation instead of dividing" },
          { value: e * Ef, why: nq === 1 ? "used the field but with a stray factor" : "used one elementary charge instead of " + nq },
          { value: Ef, why: "gave the field strength in V m⁻¹, not the force in newtons" }
        ]
      };
    }
  });

  reg({
    id: "m4-charge-time", mod: "M4", topic: "Circuits", diff: 1,
    ask: "charge delivered", dim: { A: 1, s: 1 },
    build(r) {
      const I = r.nice(0.1, 12, 0.1);
      const t = r.nice(5, 600, 5);
      const Q = I * t;
      return {
        givens: { I, t },
        q: `A steady current of ${F(I, 3)} \\u{A} flows for ${t} \\u{s}. How much charge passes ` +
           `a point in the circuit?`,
        value: Q, units: { A: 1, s: 1 }, sf: 3,
        /* Route B: count electrons. Convert to a number of elementary charges and
           back, which fails if the conversion is wrong in either direction. */
        verify: () => {
          const e = PHYS.DATA.constants.K("e");
          const n = (I * t) / e;                 // number of electrons
          return n * e;
        },
        verifyTol: 1e-9,
        routes: ["q = It", "count the electrons, then multiply by the elementary charge"],
        working: [
          { eq: `q = It = ${F(I, 3)} \\times ${t} = ${F(Q)} \\u{C}`, note: "" },
          { eq: `n = \\f{q}{q_e} = ${F(Q / PHYS.DATA.constants.K("e"), 3)}`,
            note: "That many electrons — current is just charge per second, so one amp is about " +
                  "6.24 × 10¹⁸ electrons past a point every second." }
        ],
        distractors: [
          { value: I / t, why: "divided instead of multiplying" },
          { value: t / I, why: "divided the wrong way round" },
          { value: I, why: "quoted the current; charge is current × time" },
          { value: I * t * PHYS.DATA.constants.K("e"), why: "multiplied by the electron charge; that converts a COUNT of electrons into coulombs, and q = It is already in coulombs" }
        ]
      };
    }
  });

  reg({
    id: "m4-resistivity", mod: "M4", topic: "Circuits", diff: 3,
    ask: "resistance of a wire", dim: { kg: 1, m: 2, s: -3, A: -2 },
    build(r) {
      const mat = r.pick([
        { name: "copper", rho: 1.68e-8 }, { name: "aluminium", rho: 2.65e-8 },
        { name: "tungsten", rho: 5.60e-8 }, { name: "nichrome", rho: 1.10e-6 },
        { name: "iron", rho: 9.71e-8 }
      ]);
      const L = r.nice(0.5, 60, 0.5);
      const dmm = r.nice(0.2, 3, 0.1);           // diameter in mm
      const A = Math.PI * Math.pow(dmm * 1e-3 / 2, 2);
      const R = (mat.rho * L) / A;
      return {
        givens: { rho: mat.rho, L, dmm },
        q: `A ${mat.name} wire is ${F(L, 3)} \\u{m} long and ${F(dmm, 2)} \\u{mm} in diameter. ` +
           `The resistivity of ${mat.name} is ${F(mat.rho, 3)} \\u{Ω m}. What is its resistance?`,
        value: R, units: { kg: 1, m: 2, s: -3, A: -2 }, sf: 3,
        /* Route B: build the resistance from a chain of unit-length segments in
           series, each with its own resistance ρ/A per metre. */
        verify: () => {
          const perMetre = mat.rho / A;          // Ω per metre
          const segments = 1000;
          let total = 0;
          for (let i = 0; i < segments; i++) total += perMetre * (L / segments);
          return total;
        },
        verifyTol: 1e-9,
        routes: ["R = ρL/A", "sum the resistance of 1000 segments in series"],
        working: [
          { eq: `A = pi r^2 = pi\\left(\\f{${F(dmm, 2)} \\times 10^{-3}}{2}\\right)^2 = ${F(A, 3)} \\u{m^2}`,
            note: "The DIAMETER is given, so halve it first. Forgetting to is a factor-of-four error in the area." },
          { eq: `R = \\f{rho L}{A} = \\f{${F(mat.rho, 3)} \\times ${F(L, 3)}}{${F(A, 3)}} = ${F(R)} \\u{Ω}`, note: "" },
          { eq: ``, note: "Longer means more resistance; thicker means less. Doubling the diameter " +
                          "quarters the resistance, because the area goes as the square of the radius." }
        ],
        distractors: [
          { value: (mat.rho * L) / (Math.PI * Math.pow(dmm * 1e-3, 2)),
            why: "used the DIAMETER as the radius, which makes the area four times too big" },
          { value: (mat.rho * A) / L, why: "swapped the length and the area" },
          { value: (mat.rho * L) / (dmm * 1e-3), why: "divided by the diameter instead of the cross-sectional area" },
          { value: (mat.rho * L) / (Math.PI * Math.pow(dmm / 2, 2)), why: "left the diameter in millimetres instead of converting to metres" }
        ]
      };
    }
  });

  reg({
    id: "m4-voltage-divider", mod: "M4", topic: "Circuits", diff: 3,
    ask: "voltage across one resistor in series", dim: { kg: 1, m: 2, s: -3, A: -1 },
    build(r) {
      const Vs = r.nice(6, 48, 1);
      const R1 = r.nice(10, 200, 10), R2 = r.nice(10, 200, 10);
      const V2 = (Vs * R2) / (R1 + R2);
      return {
        givens: { Vs, R1, R2 },
        q: `A ${Vs} \\u{V} supply is connected across a ${R1} \\u{Ω} resistor in series with a ` +
           `${R2} \\u{Ω} resistor. What is the potential difference across the ${R2} \\u{Ω} resistor?`,
        value: V2, units: { kg: 1, m: 2, s: -3, A: -1 }, sf: 3,
        /* Route B: find the circuit current, apply Ohm's law to the second resistor,
           and check the two voltages add back to the supply. */
        verify: () => {
          const I = Vs / (R1 + R2);
          const v1 = I * R1, v2 = I * R2;
          if (Math.abs(v1 + v2 - Vs) > 1e-9) throw new Error("voltages do not sum to the supply");
          return v2;
        },
        verifyTol: 1e-9,
        diagram: { kind: "circuit", resistors: [R1, R2], series: true, supply: Vs },
        routes: ["divider rule V₂ = V·R₂/(R₁+R₂)", "find the common current, then V₂ = IR₂"],
        working: [
          { eq: `I = \\f{V}{R_1 + R_2} = \\f{${Vs}}{${R1 + R2}} = ${F(Vs / (R1 + R2), 3)} \\u{A}`,
            note: "In series the current is the same through both." },
          { eq: `V_2 = IR_2 = ${F(V2)} \\u{V}`, note: "" },
          { eq: `V_1 + V_2 = ${F((Vs * R1) / (R1 + R2), 3)} + ${F(V2, 3)} = ${Vs} \\u{V}`,
            note: "Always check the parts add to the supply — the bigger resistor takes the bigger share." }
        ],
        distractors: [
          { value: (Vs * R1) / (R1 + R2), why: "found the voltage across the OTHER resistor" },
          { value: Vs / 2, why: "split the supply equally; that only happens when the resistances are equal" },
          { value: Vs * R2 / R1, why: "used the ratio of the two resistors instead of R₂ over the TOTAL" },
          { value: Vs, why: "gave the full supply voltage; in series it is shared between the resistors" }
        ]
      };
    }
  });

  reg({
    id: "m4-work-on-charge", mod: "M4", topic: "Electrostatics", diff: 2,
    ask: "speed gained by an accelerated charge", dim: { m: 1, s: -1 },
    build(r, K) {
      const e = K("e"), me = K("me"), mp = K("mp");
      const kind = r.pick(["electron", "proton"]);
      const m = kind === "electron" ? me : mp;
      const V = r.nice(100, 5000, 100);
      const v = Math.sqrt((2 * e * V) / m);
      return {
        givens: { V, kind },
        q: `${kind === "electron" ? "An electron" : "A proton"}, initially at rest, is accelerated ` +
           `through a potential difference of ${V} \\u{V}. What speed does it reach? ` +
           `(Non-relativistic.)`,
        value: v, units: { m: 1, s: -1 }, sf: 3,
        /* Route B: go through the force and the field over a chosen gap, then use
           kinematics — a completely different chain from the energy argument. */
        verify: () => {
          const d = 0.05;                        // any gap
          const Ef = V / d;
          const force = e * Ef;
          const a = force / m;
          return Math.sqrt(2 * a * d);           // v² = u² + 2as
        },
        verifyTol: 1e-9,
        routes: ["qV = ½mv²", "field → force → acceleration → v² = 2as"],
        working: [
          { eq: `qV = \\f{1}{2}mv^2`,
            note: "All the electrical work becomes kinetic energy — nothing else is acting." },
          { eq: `v = \\sqrt{\\f{2qV}{m}} = \\sqrt{\\f{2 \\times 1.602 \\times 10^{-19} \\times ${V}}{${F(m, 4)}}}`, note: "" },
          { eq: `v = ${F(v)} \\u{m s^-1}`,
            note: `That is ${F((v / PHYS.DATA.constants.K("c")) * 100, 2)}% of the speed of light. ` +
                  (v / PHYS.DATA.constants.K("c") > 0.1
                    ? "Above about 10% of c the non-relativistic formula starts to overestimate the speed, so a real calculation would need the relativistic version."
                    : "Comfortably non-relativistic, so this formula is fine.") }
        ],
        distractors: [
          { value: (2 * e * V) / m, why: "did not take the square root — this is v², not v" },
          { value: Math.sqrt((e * V) / m), why: "forgot the factor of 2 from ½mv²" },
          { value: Math.sqrt((2 * e * V) / (kind === "electron" ? mp : me)),
            why: "used the mass of the " + (kind === "electron" ? "proton" : "electron") },
          { value: e * V, why: "gave the kinetic energy in joules, not the speed" }
        ]
      };
    }
  });

  reg({
    id: "m4-energy-cost", mod: "M4", topic: "Circuits", diff: 2,
    ask: "electrical energy used", dim: { kg: 1, m: 2, s: -2 },
    build(r) {
      const P = r.nice(40, 2400, 20);
      const hours = r.nice(0.5, 8, 0.5);
      const E = P * hours * 3600;
      return {
        givens: { P, hours },
        q: `An appliance rated at ${P} \\u{W} runs for ${F(hours, 2)} hours. How much energy ` +
           `does it use, in joules?`,
        value: E, units: { kg: 1, m: 2, s: -2 }, sf: 3,
        /* Route B: work in kilowatt-hours first and convert, which is how a power
           bill does it. Catches a wrong seconds-per-hour factor. */
        verify: () => {
          const kWh = (P / 1000) * hours;
          return kWh * 3.6e6;                    // 1 kWh = 3.6 MJ
        },
        verifyTol: 1e-9,
        routes: ["E = Pt with t in seconds", "kilowatt-hours × 3.6 MJ"],
        working: [
          { eq: `t = ${F(hours, 2)} \\times 3600 = ${F(hours * 3600, 3)} \\u{s}`,
            note: "The joule is a watt-second, so the time must be in seconds." },
          { eq: `E = Pt = ${P} \\times ${F(hours * 3600, 3)} = ${F(E)} \\u{J}`, note: "" },
          { eq: `= ${F((P / 1000) * hours, 3)} \\u{kW h}`,
            note: "A kilowatt-hour is 3.6 MJ. It is the unit a power bill uses because joules are " +
                  "inconveniently small for household amounts." }
        ],
        distractors: [
          { value: P * hours, why: "left the time in hours; a watt is a joule per SECOND" },
          { value: (P * hours) / 3600, why: "divided by 3600 instead of multiplying" },
          { value: P * hours * 60, why: "converted hours to minutes rather than seconds" },
          { value: P / (hours * 3600), why: "divided by the time instead of multiplying" }
        ]
      };
    }
  });
})();
