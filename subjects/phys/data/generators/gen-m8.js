/* Module 8 — From the Universe to the Atom: stars, the Bohr and quantum models,
   nuclear physics, the Standard Model.  Contract: js/core/gen.js. */
(function () {
  const reg = PHYS.Gen.register;
  const F = (v, n) => PHYS.U.fmtSig(v, n || 3);

  reg({
    id: "m8-hydrogen-line", mod: "M8", topic: "Atomic spectra", diff: 3,
    ask: "wavelength of a hydrogen spectral line", dim: { m: 1 },
    build(r, K) {
      const R = K("rydberg");
      const series = r.pick([
        { name: "Lyman", nf: 1 }, { name: "Balmer", nf: 2 },
        { name: "Paschen", nf: 3 }, { name: "Brackett", nf: 4 }
      ]);
      const ni = series.nf + r.int(1, 4);
      const invLam = R * (1 / (series.nf * series.nf) - 1 / (ni * ni));
      const lam = 1 / invLam;
      return {
        givens: { nf: series.nf, ni },
        q: `An electron in a hydrogen atom drops from n = ${ni} to n = ${series.nf}. What is the ` +
           `wavelength of the emitted photon? The Rydberg constant is ` +
           `1.097 \\times 10^7 \\u{m^-1}.`,
        value: lam, units: { m: 1 }, sf: 3,
        /* Route B: go through the ENERGY of the two levels (Bohr's −13.6/n² eV),
           find the photon energy, then use λ = hc/E. Completely different chain,
           and it agrees only if the Rydberg constant and the level energies are
           consistent — which is itself worth knowing. */
        verify: () => {
          const h = K("h"), c = K("c");
          const E0 = R * h * c;                             // = 13.6 eV in joules
          const Ei = -E0 / (ni * ni);
          const Ef = -E0 / (series.nf * series.nf);
          const Ephoton = Ei - Ef;                          // negative: emitted
          return (h * c) / Math.abs(Ephoton);
        },
        verifyTol: 1e-9,
        routes: ["1/λ = R(1/n_f² − 1/n_i²)", "Bohr level energies −Rhc/n², then λ = hc/ΔE"],
        working: [
          { eq: `\\f{1}{lambda} = R\\left(\\f{1}{n_f^2} - \\f{1}{n_i^2}\\right) = ` +
                `1.097 \\times 10^7\\left(\\f{1}{${series.nf}^2} - \\f{1}{${ni}^2}\\right)`, note: "" },
          { eq: `\\f{1}{lambda} = ${F(invLam, 4)} \\u{m^-1}`, note: "" },
          { eq: `lambda = ${F(lam)} \\u{m} = ${F(lam * 1e9, 3)} \\u{nm}`,
            note: `The ${series.name} series ends on n = ${series.nf}. ` +
                  (series.nf === 1 ? "Lyman lines are all in the ultraviolet."
                   : series.nf === 2 ? "Balmer lines are the visible hydrogen lines — the ones you see in a discharge tube."
                   : "That is in the infrared.") }
        ],
        distractors: [
          { value: 1 / (R * (1 / (ni * ni) - 1 / (series.nf * series.nf))),
            why: "subtracted the terms the wrong way round, giving a negative wavelength — the smaller n goes first" },
          { value: R * (1 / (series.nf * series.nf) - 1 / (ni * ni)),
            why: "stopped at 1/λ and forgot to invert; the units here are m⁻¹" },
          { value: 1 / (R * (1 / series.nf - 1 / ni)), why: "forgot to square the quantum numbers" },
          { value: 1 / (R * (1 / (series.nf * series.nf) + 1 / (ni * ni))), why: "added the terms instead of subtracting" }
        ]
      };
    }
  });

  reg({
    id: "m8-bohr-energy", mod: "M8", topic: "Atomic spectra", diff: 2,
    ask: "energy of a hydrogen level", dim: { kg: 1, m: 2, s: -2 },
    build(r, K) {
      const R = K("rydberg"), h = K("h"), c = K("c"), eV = K("eV");
      const E0 = R * h * c;                                 // the 13.6 eV ionisation energy
      const n = r.int(1, 6);
      const E = -E0 / (n * n);
      return {
        givens: { n },
        q: `Using the Bohr model, what is the energy of the n = ${n} level of hydrogen, in joules? ` +
           `Take the ground-state energy as -13.6 \\u{eV}.`,
        value: E, units: { kg: 1, m: 2, s: -2 }, sf: 3,
        /* Route B: build the same level energy from the Rydberg constant, which is
           an independent measurement of the same quantity. */
        verify: () => {
          return -(R * h * c) / (n * n);
        },
        verifyTol: 3e-3,       // 13.6 eV and Rhc agree only to about three figures
        routes: ["E_n = −13.6/n² eV, converted to joules", "E_n = −Rhc/n² from the Rydberg constant"],
        working: [
          { eq: `E_n = \\f{-13.6}{n^2} \\u{eV} = \\f{-13.6}{${n * n}} = ${F(-13.6 / (n * n), 3)} \\u{eV}`, note: "" },
          { eq: `E_n = ${F(-13.6 / (n * n), 3)} \\times 1.602 \\times 10^{-19} = ${F(E)} \\u{J}`, note: "" },
          { eq: ``, note: "Negative because the electron is BOUND — you must put energy in to remove it. " +
                          "The levels crowd together as n rises and reach zero at n = ∞, where the " +
                          "electron is just free. The gap from n = 1 to n = ∞ is the 13.6 eV " +
                          "ionisation energy." }
        ],
        distractors: [
          { value: (13.6 / (n * n)) * eV, why: "dropped the minus sign; bound states have negative energy" },
          { value: (-13.6 / n) * eV, why: "forgot to square n" },
          { value: -13.6 / (n * n), why: "left the answer in eV when the question asked for joules" },
          { value: (-13.6 * n * n) * eV, why: "multiplied by n² instead of dividing" }
        ]
      };
    }
  });

  reg({
    id: "m8-de-broglie", mod: "M8", topic: "Quantum model", diff: 2,
    ask: "de Broglie wavelength", dim: { m: 1 },
    build(r, K) {
      const h = K("h");
      const item = r.pick([
        { name: "an electron", m: K("me"), v: r.nice(1, 9, 1) * 1e6 },
        { name: "a proton", m: K("mp"), v: r.nice(1, 9, 1) * 1e5 },
        { name: "a neutron", m: K("mn"), v: r.nice(1, 9, 1) * 1e3 },
        { name: "a 0.15 kg cricket ball", m: 0.15, v: r.nice(10, 40, 1) }
      ]);
      const lam = h / (item.m * item.v);
      return {
        givens: { m: item.m, v: item.v },
        q: `What is the de Broglie wavelength of ${item.name} (mass ${F(item.m, 4)} \\u{kg}) ` +
           `moving at ${F(item.v, 2)} \\u{m s^-1}?`,
        value: lam, units: { m: 1 }, sf: 3,
        /* Route B: go via the kinetic energy, λ = h/√(2mE_k). Different algebra and
           it exercises the mass twice, so a misplaced m shows up. */
        verify: () => {
          const Ek = 0.5 * item.m * item.v * item.v;
          return h / Math.sqrt(2 * item.m * Ek);
        },
        verifyTol: 1e-9,
        routes: ["λ = h/mv", "λ = h/√(2mE_k) via the kinetic energy"],
        working: [
          { eq: `p = mv = ${F(item.m, 4)} \\times ${F(item.v, 2)} = ${F(item.m * item.v, 3)} \\u{kg m s^-1}`, note: "" },
          { eq: `lambda = \\f{h}{p} = \\f{6.626 \\times 10^{-34}}{${F(item.m * item.v, 3)}} = ${F(lam)} \\u{m}`, note: "" },
          { eq: ``, note: item.m > 1e-3
              ? "Utterly unobservable — far smaller than a nucleus, which is why everyday objects never show wave behaviour."
              : "Comparable to atomic spacings, which is exactly why electron diffraction through a crystal works and is the direct evidence for matter waves." }
        ],
        distractors: [
          { value: h * item.m * item.v, why: "multiplied by the momentum instead of dividing" },
          { value: h / item.v, why: "left out the mass" },
          { value: h / (item.m * item.v * item.v), why: "used v²; de Broglie's relation uses the momentum mv" },
          { value: (item.m * item.v) / h, why: "inverted the expression — this has units of m⁻¹" }
        ]
      };
    }
  });

  reg({
    id: "m8-mass-defect", mod: "M8", topic: "Nuclear physics", diff: 3,
    ask: "binding energy from a mass defect", dim: null,
    dim: { kg: 1, m: 2, s: -2 },
    build(r, K) {
      const u = K("u"), c = K("c"), eV = K("eV");
      const nuclide = r.pick([
        { sym: "He", A: 4,  Z: 2,  mass: 4.002602 },
        { sym: "Li", A: 7,  Z: 3,  mass: 7.016004 },
        { sym: "C",  A: 12, Z: 6,  mass: 12.000000 },
        { sym: "N",  A: 14, Z: 7,  mass: 14.003074 },
        { sym: "O",  A: 16, Z: 8,  mass: 15.994915 },
        { sym: "Fe", A: 56, Z: 26, mass: 55.934938 },
        { sym: "U",  A: 235, Z: 92, mass: 235.043930 }
      ]);
      const N = nuclide.A - nuclide.Z;
      const mp = K("mp") / u, mn = K("mn") / u;    // in atomic mass units
      const defect = (nuclide.Z * mp + N * mn) - nuclide.mass;
      const BE = defect * u * c * c;
      if (defect <= 0) return { skip: true };
      return {
        givens: { A: nuclide.A, Z: nuclide.Z, mass: nuclide.mass },
        q: `The nuclide \\nuc{${nuclide.A}}{${nuclide.Z}}${nuclide.sym} has a nuclear mass of ` +
           `${nuclide.mass.toFixed(6)} \\u{u}. Taking the proton mass as ` +
           `${F(mp, 6)} \\u{u} and the neutron mass as ${F(mn, 6)} \\u{u}, what is its total ` +
           `binding energy in joules? (1 \\u{u} = 1.661 \\times 10^{-27} \\u{kg}.)`,
        value: BE, units: { kg: 1, m: 2, s: -2 }, sf: 3,
        /* Route B: use the data sheet's OTHER form of the same conversion —
           1 u = 931.5 MeV/c² — and work in MeV throughout. That the two agree is a
           genuine check that the u-to-kg and u-to-MeV values are consistent. */
        verify: () => {
          const MeVperU = K("uMeV");
          const BEmev = defect * MeVperU;
          return BEmev * 1e6 * eV;
        },
        /* The sheet's own two mass-energy values disagree by 0.18%: 1.661 × 10⁻²⁷ kg
           times the sheet's rounded c² comes to 933.1 MeV, not the 931.5 MeV printed
           beside it (see the long note on `uMeV` in constants.js). Both routes follow
           the sheet correctly, so this tolerance asserts they agree to the sheet's own
           consistency and no further. Tightening it would be asserting something false.
           The 2% answer tolerance covers the gap ten times over, so a student is never
           marked wrong for choosing either route. */
        verifyTol: 3e-3,
        routes: ["Δm in kg, then E = Δmc²", "Δm in u × 931.5 MeV/c², converted to joules"],
        working: [
          { eq: `Delta m = (${nuclide.Z} \\times ${F(mp, 6)} + ${N} \\times ${F(mn, 6)}) - ${nuclide.mass.toFixed(6)}`,
            note: `${nuclide.Z} protons and ${N} neutrons, weighed separately, then minus the actual nuclear mass.` },
          { eq: `Delta m = ${F(defect, 4)} \\u{u} = ${F(defect * u, 3)} \\u{kg}`, note: "" },
          { eq: `E = Delta mc^2 = ${F(BE)} \\u{J} = ${F(defect * K("uMeV"), 3)} \\u{MeV}`,
            note: `Per nucleon that is ${F(defect * K("uMeV") / nuclide.A, 3)} MeV. The assembled ` +
                  `nucleus is LIGHTER than its parts — the missing mass is the energy that was released ` +
                  `when it formed, and it is what you would have to put back in to pull it apart.` }
        ],
        distractors: [
          { value: defect * c * c, why: "used the mass defect in atomic mass units without converting to kilograms" },
          { value: defect * u * c, why: "used c rather than c²" },
          { value: nuclide.mass * u * c * c, why: "used the whole nuclear mass instead of the mass DEFECT — that is the rest energy, not the binding energy" },
          { value: (defect * u * c * c) / nuclide.A, why: "gave the binding energy PER NUCLEON; the question asks for the total" }
        ]
      };
    }
  });

  reg({
    id: "m8-binding-per-nucleon", mod: "M8", topic: "Nuclear physics", diff: 3,
    ask: "binding energy per nucleon", dim: {}, unitText: "MeV",
    build(r, K) {
      const u = K("u"), MeVperU = K("uMeV");
      const mp = K("mp") / u, mn = K("mn") / u;
      const nuclide = r.pick([
        { sym: "He", A: 4,  Z: 2,  mass: 4.002602 },
        { sym: "C",  A: 12, Z: 6,  mass: 12.000000 },
        { sym: "O",  A: 16, Z: 8,  mass: 15.994915 },
        { sym: "Fe", A: 56, Z: 26, mass: 55.934938 },
        { sym: "Kr", A: 84, Z: 36, mass: 83.911507 },
        { sym: "Sn", A: 120, Z: 50, mass: 119.902202 },
        { sym: "U",  A: 238, Z: 92, mass: 238.050788 }
      ]);
      const N = nuclide.A - nuclide.Z;
      const defect = (nuclide.Z * mp + N * mn) - nuclide.mass;
      if (defect <= 0) return { skip: true };
      const perNucleon = (defect * MeVperU) / nuclide.A;
      return {
        givens: { A: nuclide.A, Z: nuclide.Z, mass: nuclide.mass },
        q: `\\nuc{${nuclide.A}}{${nuclide.Z}}${nuclide.sym} has a nuclear mass of ` +
           `${nuclide.mass.toFixed(6)} \\u{u}. With the proton at ${F(mp, 6)} \\u{u} and the ` +
           `neutron at ${F(mn, 6)} \\u{u}, and 1 \\u{u} = 931.5 \\u{MeV/c^2}, what is the binding ` +
           `energy PER NUCLEON, in MeV?`,
        value: perNucleon, units: {}, sf: 3, unitText: "MeV",
        /* Route B: the same quantity through kilograms and E = Δmc², converted to
           MeV at the very end. If the sheet's two mass-energy forms were
           inconsistent this is where it would show. */
        verify: () => {
          const c = K("c"), eV = K("eV");
          const E = defect * u * c * c;                   // joules
          return (E / eV / 1e6) / nuclide.A;
        },
        // Same 0.18% data-sheet inconsistency; see the `uMeV` note in constants.js.
        verifyTol: 3e-3,
        routes: ["Δm × 931.5 MeV/c², divided by A", "Δmc² in joules, converted to MeV, divided by A"],
        working: [
          { eq: `Delta m = (${nuclide.Z}(${F(mp, 6)}) + ${N}(${F(mn, 6)})) - ${nuclide.mass.toFixed(6)} = ${F(defect, 4)} \\u{u}`, note: "" },
          { eq: `E_B = ${F(defect, 4)} \\times 931.5 = ${F(defect * MeVperU, 4)} \\u{MeV}`, note: "" },
          { eq: `\\f{E_B}{A} = \\f{${F(defect * MeVperU, 4)}}{${nuclide.A}} = ${F(perNucleon)} \\u{MeV}`,
            note: "Binding energy per nucleon peaks near iron-56 at about 8.8 MeV. That peak is why " +
                  "LIGHT nuclei release energy by fusing and HEAVY ones by splitting — both move towards it." }
        ],
        distractors: [
          { value: defect * MeVperU, why: "gave the TOTAL binding energy; divide by the nucleon number A" },
          { value: (defect * MeVperU) / nuclide.Z, why: "divided by the number of protons instead of the total number of nucleons" },
          { value: (nuclide.mass * MeVperU) / nuclide.A, why: "used the whole nuclear mass instead of the mass DEFECT" },
          { value: defect / nuclide.A, why: "left the answer in atomic mass units rather than converting to MeV" }
        ]
      };
    }
  });

  reg({
    id: "m8-halflife-remaining", mod: "M8", topic: "Radioactivity", diff: 2,
    ask: "mass remaining after a number of half-lives", dim: { kg: 1 },
    build(r) {
      const iso = r.pick([
        { name: "iodine-131",   hl: 8.02,  unit: "days" },
        { name: "cobalt-60",    hl: 5.27,  unit: "years" },
        { name: "carbon-14",    hl: 5730,  unit: "years" },
        { name: "technetium-99m", hl: 6.01, unit: "hours" },
        { name: "strontium-90", hl: 28.8,  unit: "years" },
        { name: "radon-222",    hl: 3.82,  unit: "days" }
      ]);
      const halves = r.pick([1, 2, 3, 4, 5, 6, 2.5, 3.5]);
      const m0 = r.nice(2, 200, 2);
      const elapsed = halves * iso.hl;
      const m = m0 * Math.pow(0.5, halves);
      return {
        givens: { m0, elapsed, hl: iso.hl },
        q: `A sample of ${iso.name} (half-life ${F(iso.hl, 4)} ${iso.unit}) initially has a mass ` +
           `of ${m0} \\u{g}. How much remains after ${F(elapsed, 4)} ${iso.unit}?`,
        value: m / 1000, units: { kg: 1 }, sf: 3, unitText: "kg",
        /* Route B: the exponential form with the decay constant λ = ln2/t½, rather
           than counting half-lives. */
        verify: () => {
          const lambda = Math.LN2 / iso.hl;
          return (m0 * Math.exp(-lambda * elapsed)) / 1000;
        },
        verifyTol: 1e-9,
        routes: ["halve once per half-life", "N = N₀e^(−λt) with λ = ln2/t½"],
        working: [
          { eq: `n = \\f{${F(elapsed, 4)}}{${F(iso.hl, 4)}} = ${F(halves, 3)} \\text{ half-lives}`, note: "" },
          { eq: `m = m_0\\left(\\f{1}{2}\\right)^n = ${m0} \\times 0.5^{${F(halves, 3)}} = ${F(m, 3)} \\u{g}`, note: "" },
          { eq: `lambda = \\f{\\ln 2}{t_{1/2}} = ${F(Math.LN2 / iso.hl, 3)} \\text{ per } ${iso.unit}`,
            note: "The exponential form N = N₀e^(−λt) gives the same answer and handles non-whole " +
                  "numbers of half-lives naturally. Decay never reaches exactly zero." }
        ],
        distractors: [
          { value: (m0 / halves) / 1000, why: "divided by the number of half-lives; decay is exponential, not linear" },
          { value: (m0 * (1 - halves * 0.5)) / 1000, why: "subtracted half the original mass per half-life — that would reach zero after two" },
          { value: (m0 * Math.pow(0.5, Math.floor(halves))) / 1000, why: "rounded the number of half-lives down to a whole number" },
          { value: (m0 - m) / 1000, why: "gave the mass that has DECAYED, not the mass remaining" }
        ]
      };
    }
  });

  reg({
    id: "m8-halflife-from-activity", mod: "M8", topic: "Radioactivity", diff: 3,
    ask: "half-life from two activity readings", dim: { s: 1 },
    build(r) {
      const hl = r.nice(20, 600, 10);            // seconds
      const A0 = r.nice(200, 9000, 100);
      const t = r.nice(10, 1200, 10);
      const A = A0 * Math.pow(0.5, t / hl);
      if (A < 1 || A / A0 > 0.98) return { skip: true };
      return {
        givens: { A0, A, t },
        q: `The activity of a source falls from ${A0} \\u{Bq} to ${F(A, 4)} \\u{Bq} over ` +
           `${t} \\u{s}. What is its half-life?`,
        value: hl, units: { s: 1 }, sf: 3,
        /* Route B: find the decay constant from the ratio, then convert to a
           half-life — a different rearrangement of the same exponential. */
        verify: () => {
          const lambda = Math.log(A0 / A) / t;
          return Math.LN2 / lambda;
        },
        verifyTol: 1e-9,
        routes: ["solve (½)^(t/t½) = A/A₀ for t½", "λ = ln(A₀/A)/t, then t½ = ln2/λ"],
        working: [
          { eq: `\\f{A}{A_0} = \\left(\\f{1}{2}\\right)^{t/t_{1/2}} = ${F(A / A0, 4)}`, note: "" },
          { eq: `lambda = \\f{\\ln(A_0/A)}{t} = \\f{${F(Math.log(A0 / A), 4)}}{${t}} = ${F(Math.log(A0 / A) / t, 3)} \\u{s^-1}`, note: "" },
          { eq: `t_{1/2} = \\f{\\ln 2}{lambda} = ${F(hl)} \\u{s}`,
            note: "Activity is proportional to the number of undecayed nuclei, so it decays with exactly " +
                  "the same half-life — which is what lets you measure a half-life without ever counting atoms." }
        ],
        distractors: [
          { value: t / (A0 / A), why: "divided the time by the activity ratio instead of using logarithms" },
          { value: Math.log(A0 / A) / t, why: "gave the decay constant λ in s⁻¹, not the half-life in s" },
          { value: t * Math.log(A0 / A), why: "multiplied by the logarithm instead of dividing" },
          { value: (t * Math.LN2) / Math.log(A / A0), why: "took the logarithm of A/A₀ rather than A₀/A, giving a negative half-life" }
        ]
      };
    }
  });

  reg({
    id: "m8-decay-products", mod: "M8", topic: "Radioactivity", diff: 2,
    ask: "mass number of the daughter nuclide", dim: {},
    unitText: "",
    build(r) {
      const parents = [
        { sym: "U",  A: 238, Z: 92 }, { sym: "U",  A: 235, Z: 92 },
        { sym: "Ra", A: 226, Z: 88 }, { sym: "Th", A: 232, Z: 90 },
        { sym: "Po", A: 210, Z: 84 }, { sym: "Rn", A: 222, Z: 86 },
        { sym: "C",  A: 14,  Z: 6  }, { sym: "Sr", A: 90,  Z: 38 },
        { sym: "K",  A: 40,  Z: 19 }
      ];
      const p = r.pick(parents);
      const mode = p.A < 100 ? "beta" : r.pick(["alpha", "beta"]);
      const dA = mode === "alpha" ? p.A - 4 : p.A;
      const dZ = mode === "alpha" ? p.Z - 2 : p.Z + 1;
      return {
        givens: { A: p.A, Z: p.Z, mode },
        q: `\\nuc{${p.A}}{${p.Z}}${p.sym} undergoes ${mode === "alpha" ? "\\alpha" : "\\beta^-"} ` +
           `decay. What is the MASS NUMBER of the daughter nuclide?`,
        value: dA, units: {}, sf: 4, unitText: "",
        /* Route B: balance the decay equation nucleon by nucleon and check the
           charge balances too — if either side fails, the daughter is wrong. */
        verify: () => {
          const emittedA = mode === "alpha" ? 4 : 0;
          const emittedZ = mode === "alpha" ? 2 : -1;      // β⁻ emits charge −1
          const daughterA = p.A - emittedA;
          const daughterZ = p.Z - emittedZ;
          if (daughterA + emittedA !== p.A) throw new Error("nucleon number does not balance");
          if (daughterZ + emittedZ !== p.Z) throw new Error("charge does not balance");
          return daughterA;
        },
        verifyTol: 1e-12,
        routes: ["apply the decay rule directly", "balance nucleon number and charge across the equation"],
        working: [
          { eq: mode === "alpha"
              ? `\\nuc{${p.A}}{${p.Z}}${p.sym} \\to \\nuc{${dA}}{${dZ}}X + \\nuc{4}{2}He`
              : `\\nuc{${p.A}}{${p.Z}}${p.sym} \\to \\nuc{${dA}}{${dZ}}X + \\nuc{0}{-1}e + \\bar{nu}`,
            note: "" },
          { eq: `A: ${p.A} = ${dA} + ${mode === "alpha" ? 4 : 0}`,
            note: mode === "alpha"
              ? "An alpha particle carries away 4 nucleons and 2 protons, so A drops by 4 and Z by 2."
              : "A beta-minus decay turns a NEUTRON into a proton, so the nucleon number is unchanged while Z rises by 1." },
          { eq: `Z: ${p.Z} = ${dZ} ${mode === "alpha" ? "+ 2" : "- 1"}`,
            note: "Both nucleon number and charge must balance on every line — that is how you check a " +
                  "nuclear equation without looking anything up." }
        ],
        distractors: mode === "alpha" ? [
          { value: p.A - 2, why: "subtracted 2 (the alpha's charge) from the mass number instead of 4 (its nucleon count)" },
          { value: p.A, why: "left the mass number unchanged; that is what happens in BETA decay, not alpha" },
          { value: p.A + 4, why: "added the alpha's nucleons instead of subtracting them" },
          { value: p.Z - 2, why: "gave the daughter's ATOMIC number rather than its mass number" }
        ] : [
          { value: p.A - 1, why: "reduced the mass number by 1; in beta decay a neutron becomes a proton, so A is unchanged" },
          { value: p.A + 1, why: "increased the mass number by 1 — it is Z that rises, not A" },
          { value: p.A - 4, why: "used the ALPHA decay rule" },
          { value: p.Z + 1, why: "gave the daughter's atomic number rather than its mass number" }
        ]
      };
    }
  });

  reg({
    id: "m8-fission-energy", mod: "M8", topic: "Nuclear physics", diff: 3,
    ask: "energy released per fission", dim: { kg: 1, m: 2, s: -2 },
    build(r, K) {
      const u = K("u"), c = K("c"), eV = K("eV");
      const defect = r.nice(0.15, 0.25, 0.005);            // u of mass converted
      const E = defect * u * c * c;
      return {
        givens: { defect },
        q: `A fission event converts ${F(defect, 3)} \\u{u} of mass into energy. How much energy ` +
           `is released? (1 \\u{u} = 1.661 \\times 10^{-27} \\u{kg}.)`,
        value: E, units: { kg: 1, m: 2, s: -2 }, sf: 3,
        /* Route B: via the sheet's 931.5 MeV/c² equivalence, which is an independent
           statement of the same conversion. */
        verify: () => {
          return defect * K("uMeV") * 1e6 * eV;
        },
        // Same 0.18% data-sheet inconsistency as m8-mass-defect; see constants.js `uMeV`.
        verifyTol: 3e-3,
        routes: ["Δm in kg, then E = Δmc²", "Δm × 931.5 MeV/c²"],
        working: [
          { eq: `Delta m = ${F(defect, 3)} \\times 1.661 \\times 10^{-27} = ${F(defect * u, 3)} \\u{kg}`, note: "" },
          { eq: `E = Delta mc^2 = ${F(E)} \\u{J}`, note: "" },
          { eq: `= ${F(defect * K("uMeV"), 3)} \\u{MeV}`,
            note: `Using the data sheet's other form, 1 u ≡ 931.5 MeV/c². For scale, burning one carbon ` +
                  `atom releases a few eV — a fission event releases about a hundred million times more, ` +
                  `which is the whole reason nuclear power exists.` }
        ],
        distractors: [
          { value: defect * c * c, why: "did not convert atomic mass units to kilograms" },
          { value: defect * u * c, why: "used c instead of c²" },
          { value: defect * K("uMeV"), why: "left the answer in MeV when joules were asked for" },
          { value: (defect * u * c * c) / eV, why: "converted to electronvolts, but the question asks for joules" }
        ]
      };
    }
  });

  reg({
    id: "m8-star-luminosity", mod: "M8", topic: "Stars", diff: 3,
    ask: "luminosity of a star", dim: { kg: 1, m: 2, s: -3 },
    build(r, K) {
      const sig = K("stefan");
      const T = r.nice(3000, 30000, 500);
      const radii = r.pick([0.1, 0.5, 1, 2, 5, 10, 50, 100]);
      const rad = radii * PHYS.DATA.constants.S("rSun");
      const L = sig * 4 * Math.PI * rad * rad * Math.pow(T, 4);
      return {
        givens: { T, radii },
        q: `A star has a surface temperature of ${T} \\u{K} and a radius ${F(radii, 3)} times ` +
           `the Sun's. Treating it as a blackbody, what is its luminosity? ` +
           `${PHYS.DATA.constants.supplied.rSun.stem}, and ` +
           `sigma = 5.67 \\times 10^{-8} \\u{W m^-2 K^-4}.`,
        value: L, units: { kg: 1, m: 2, s: -3 }, sf: 3,
        /* Route B: build the surface area and the per-square-metre intensity
           separately, then multiply. */
        verify: () => {
          const area = 4 * Math.PI * rad * rad;
          const intensity = sig * Math.pow(T, 4);
          return area * intensity;
        },
        verifyTol: 1e-12,
        routes: ["L = 4πr²σT⁴", "surface area × intensity per square metre"],
        working: [
          { eq: `r = ${F(radii, 3)} \\times 6.96 \\times 10^8 = ${F(rad, 3)} \\u{m}`, note: "" },
          { eq: `A = 4pi r^2 = ${F(4 * Math.PI * rad * rad, 3)} \\u{m^2}`,
            note: "A star radiates from its whole spherical surface, so the 4πr² is essential." },
          { eq: `L = A\\sigmaT^4 = ${F(L)} \\u{W}`,
            note: `About ${F(L / 3.85e26, 3)} times the Sun's luminosity. Both factors matter: a big ` +
                  `cool star and a small hot one can have the same luminosity, which is exactly what the ` +
                  `branches of the Hertzsprung–Russell diagram show.` }
        ],
        distractors: [
          { value: sig * Math.PI * rad * rad * Math.pow(T, 4), why: "used πr², the star's cross-sectional area, instead of its 4πr² surface" },
          { value: sig * 4 * Math.PI * rad * rad * T, why: "used T rather than T⁴" },
          { value: sig * 4 * Math.PI * rad * Math.pow(T, 4), why: "used r instead of r²" },
          { value: sig * Math.pow(T, 4), why: "gave the intensity in W m⁻², not the total luminosity" }
        ]
      };
    }
  });

  reg({
    id: "m8-star-temperature", mod: "M8", topic: "Stars", diff: 2,
    ask: "surface temperature from a spectral peak", dim: { K: 1 },
    build(r, K) {
      const b = K("wien");
      const lam = r.nice(90, 1200, 10) * 1e-9;
      const T = b / lam;
      return {
        givens: { lam },
        q: `A star's spectrum peaks at ${F(lam * 1e9, 3)} \\u{nm}. What is its surface temperature? ` +
           `Wien's displacement constant is 2.898 \\times 10^{-3} \\u{m K}.`,
        value: T, units: { K: 1 }, sf: 3,
        /* Route B: invert — from the temperature, recompute the peak wavelength and
           check the original comes back. */
        verify: () => {
          const Ttry = b / lam;
          const lamBack = b / Ttry;
          if (Math.abs(lamBack - lam) / lam > 1e-12) throw new Error("inversion failed");
          return b / lamBack;
        },
        verifyTol: 1e-12,
        routes: ["T = b/λ_max", "inverting: λ_max = b/T must return the stated peak"],
        working: [
          { eq: `T = \\f{b}{lambda_{max}} = \\f{2.898 \\times 10^{-3}}{${F(lam, 3)}} = ${F(T)} \\u{K}`, note: "" },
          { eq: ``, note: T > 10000 ? "A hot blue star — spectral class B or O."
                        : T > 6000 ? "Hotter than the Sun (5778 K), so it looks white."
                        : T > 4500 ? "Around the Sun's temperature, so yellow-white."
                        : "A cool red star — spectral class K or M. Colour is a direct thermometer for a star." }
        ],
        distractors: [
          { value: b * lam, why: "multiplied instead of dividing" },
          { value: lam / b, why: "inverted the expression" },
          { value: b / (lam * 1e9), why: "left the wavelength in nanometres instead of converting to metres" },
          { value: b / lam - 273, why: "subtracted 273 as if converting to Celsius; Wien's law gives kelvin directly" }
        ]
      };
    }
  });

  reg({
    id: "m8-doppler-redshift", mod: "M8", topic: "Stars", diff: 3,
    ask: "recession speed from a redshift", dim: { m: 1, s: -1 },
    build(r, K) {
      const c = K("c");
      const rest = r.pick([486.1, 434.0, 656.3, 589.0, 393.4]);     // nm
      const frac = r.nice(0.002, 0.06, 0.002);
      const obs = rest * (1 + frac);
      const v = c * frac;
      return {
        givens: { rest, obs },
        q: `A spectral line with a rest wavelength of ${F(rest, 4)} \\u{nm} is observed at ` +
           `${F(obs, 5)} \\u{nm} in a distant galaxy. Using the non-relativistic approximation, ` +
           `what is the galaxy's recession speed?`,
        value: v, units: { m: 1, s: -1 }, sf: 3,
        /* Route B: work in frequency rather than wavelength. Δf/f = −Δλ/λ to first
           order, so the two must agree at this precision. */
        verify: () => {
          const fRest = c / (rest * 1e-9);
          const fObs = c / (obs * 1e-9);
          return c * ((fRest - fObs) / fObs);
        },
        verifyTol: 1e-12,
        routes: ["Δλ/λ = v/c", "the same shift expressed in frequency"],
        working: [
          { eq: `Delta lambda = ${F(obs, 5)} - ${F(rest, 4)} = ${F(obs - rest, 3)} \\u{nm}`, note: "" },
          { eq: `\\f{Delta lambda}{lambda} = \\f{${F(obs - rest, 3)}}{${F(rest, 4)}} = ${F(frac, 3)}`, note: "" },
          { eq: `v = c\\f{Delta lambda}{lambda} = ${F(v)} \\u{m s^-1}`,
            note: `${F(frac * 100, 3)}% of the speed of light, or ${F(v / 1000, 3)} km s⁻¹. Observed LONGER ` +
                  `than rest means redshift, which means receding. The approximation is fine while ` +
                  `v ≪ c; beyond about 0.1c the relativistic formula is needed.` }
        ],
        distractors: [
          { value: c * ((obs - rest) / obs), why: "divided by the OBSERVED wavelength; the fraction is measured against the REST wavelength" },
          { value: c * (obs / rest), why: "used the ratio rather than the fractional CHANGE — this comes out faster than light" },
          { value: (obs - rest) * 1e-9, why: "gave the wavelength shift in metres, not a speed" },
          { value: c / frac, why: "divided c by the fraction instead of multiplying" }
        ]
      };
    }
  });

  reg({
    id: "m8-hubble-distance", mod: "M8", topic: "Cosmology", diff: 2,
    ask: "distance from Hubble's law", dim: { m: 1 },
    build(r) {
      const H0 = 70;                             // km s⁻¹ Mpc⁻¹, stated in the stem
      const v = r.nice(500, 60000, 500);         // km s⁻¹
      const Mpc = 3.086e22;                      // metres per megaparsec
      const d = (v / H0) * Mpc;
      return {
        givens: { v, H0 },
        q: `A galaxy recedes at ${v} \\u{km s^-1}. Taking Hubble's constant as ${H0} ` +
           `\\u{km s^-1} per megaparsec, and 1 megaparsec as 3.086 \\times 10^{22} \\u{m}, ` +
           `how far away is it?`,
        value: d, units: { m: 1 }, sf: 3,
        /* Route B: invert — recover the recession speed from the distance and check
           the original comes back. */
        verify: () => {
          const dTry = (v / H0) * Mpc;
          const vBack = (dTry / Mpc) * H0;
          if (Math.abs(vBack - v) / v > 1e-12) throw new Error("inversion failed");
          return (vBack / H0) * Mpc;
        },
        verifyTol: 1e-12,
        routes: ["d = v/H₀", "inverting: v = H₀d must return the stated speed"],
        working: [
          { eq: `d = \\f{v}{H_0} = \\f{${v}}{${H0}} = ${F(v / H0, 3)} \\u{Mpc}`, note: "" },
          { eq: `d = ${F(v / H0, 3)} \\times 3.086 \\times 10^{22} = ${F(d)} \\u{m}`, note: "" },
          { eq: ``, note: `About ${F(d / 9.46e15 / 1e6, 3)} million light years. Hubble's law is evidence ` +
                          `for an expanding universe: everything distant recedes, and the further away it is, ` +
                          `the faster — which is what you get if space itself is stretching rather than ` +
                          `galaxies flying through it.` }
        ],
        distractors: [
          { value: v * H0 * 3.086e22, why: "multiplied by H₀ instead of dividing" },
          { value: (v / H0) * 3.086e22 * 1e3, why: "converted the speed from km s⁻¹ to m s⁻¹ as well; H₀ is already quoted in km s⁻¹, so the units cancel" },
          { value: (H0 / v) * 3.086e22, why: "inverted the ratio" },
          { value: v / H0, why: "left the answer in megaparsecs when metres were asked for" }
        ]
      };
    }
  });
})();
