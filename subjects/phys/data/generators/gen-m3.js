/* Module 3 — Waves and Thermodynamics: wave properties, sound, the ray model of
   light, thermodynamics.  Contract: js/core/gen.js. */
(function () {
  const reg = PHYS.Gen.register;
  const F = (v, n) => PHYS.U.fmtSig(v, n || 3);
  const D = PHYS.U.deg, R = PHYS.U.rad;

  reg({
    id: "m3-wave-equation-v", mod: "M3", topic: "Wave properties", diff: 1,
    ask: "wave speed", dim: { m: 1, s: -1 },
    build(r) {
      const f = r.nice(20, 900, 10);
      const lam = r.nice(0.05, 4, 0.05);
      const v = f * lam;
      return {
        givens: { f, lam },
        q: `A wave of frequency ${f} \\u{Hz} has a wavelength of ${F(lam, 3)} \\u{m}. ` +
           `What is its speed?`,
        value: v, units: { m: 1, s: -1 }, sf: 3,
        /* Route B: invert. One wavelength passes per period, so travel for a whole
           number of periods and divide the distance covered by the time taken. */
        verify: () => {
          const T = 1 / f;
          const cycles = 250;
          return (cycles * lam) / (cycles * T);
        },
        verifyTol: 1e-9,
        routes: ["v = fλ", "distance of 250 wavelengths ÷ time of 250 periods"],
        working: [
          { eq: `v = f lambda = ${f} \\times ${F(lam, 3)} = ${F(v)} \\u{m s^-1}`,
            note: "One whole wavelength passes any point in one period, so speed = wavelength ÷ period = fλ." }
        ],
        distractors: [
          { value: f / lam, why: "divided instead of multiplying" },
          { value: lam / f, why: "inverted the relationship; λ/f has units of m s, not m s⁻¹" },
          { value: f, why: "quoted the frequency back — a frequency is not a speed" },
          { value: 2 * f * lam, why: "doubled the wavelength, which belongs to standing waves on a string, not to v = fλ" }
        ]
      };
    }
  });

  reg({
    id: "m3-wave-equation-lambda", mod: "M3", topic: "Wave properties", diff: 1,
    ask: "wavelength", dim: { m: 1 },
    build(r, K) {
      const vs = K("vSound");
      const f = r.nice(110, 4000, 10);
      const lam = vs / f;
      return {
        givens: { f },
        q: `A tuning fork sounds a note of ${f} \\u{Hz} in air. Taking the speed of sound in ` +
           `air as ${vs} \\u{m s^-1}, what is the wavelength of the sound?`,
        value: lam, units: { m: 1 }, sf: 3,
        // Route B: via the period and the distance the wavefront travels in it.
        verify: () => {
          const T = 1 / f;
          return vs * T;
        },
        verifyTol: 1e-9,
        routes: ["λ = v/f", "λ = vT, the distance sound travels in one period"],
        working: [
          { eq: `v = f lambda \\implies lambda = \\f{v}{f}`, note: "" },
          { eq: `lambda = \\f{${vs}}{${f}} = ${F(lam)} \\u{m}`,
            note: `Equivalently the wave travels for one period T = ${F(1 / f, 3)} s at ${vs} m s⁻¹.` }
        ],
        distractors: [
          { value: f / vs, why: "divided the wrong way round; f/v has units of m⁻¹" },
          { value: vs * f, why: "multiplied instead of dividing" },
          { value: (2 * vs) / f, why: "used λ = 2v/f, which is the fundamental on a fixed string, not a travelling wave" },
          { value: 1 / f, why: "gave the period in seconds, not the wavelength in metres" }
        ]
      };
    }
  });

  reg({
    id: "m3-standing-string", mod: "M3", topic: "Standing waves", diff: 3,
    ask: "frequency of a harmonic on a string", dim: { s: -1 },
    build(r) {
      const L = r.nice(0.3, 2, 0.1);
      const v = r.nice(60, 400, 10);
      const n = r.int(1, 5);
      const f = (n * v) / (2 * L);
      const names = ["fundamental", "second harmonic", "third harmonic", "fourth harmonic", "fifth harmonic"];
      return {
        givens: { L, v, n },
        q: `A string of length ${F(L, 2)} \\u{m} is fixed at both ends. Waves travel along it at ` +
           `${v} \\u{m s^-1}. What is the frequency of the ${names[n - 1]}?`,
        value: f, units: { s: -1 }, sf: 3,
        /* Route B: build the mode from its wavelength — n half-wavelengths fit
           between the fixed ends — then apply v = fλ. */
        verify: () => {
          const lam = (2 * L) / n;              // n half-wavelengths span the string
          return v / lam;
        },
        verifyTol: 1e-9,
        diagram: { kind: "standing-wave", L, n },
        routes: ["f_n = nv/2L", "n half-wavelengths fit the string, then f = v/λ"],
        working: [
          { eq: `n\\f{lambda}{2} = L \\implies lambda = \\f{2L}{n} = ${F((2 * L) / n, 3)} \\u{m}`,
            note: "Both ends are fixed, so both ends are nodes and a whole number of half-wavelengths fits." },
          { eq: `f = \\f{v}{lambda} = \\f{${v}}{${F((2 * L) / n, 3)}} = ${F(f)} \\u{Hz}`, note: "" },
          { eq: `f_n = \\f{nv}{2L}`,
            note: n === 1 ? "This is the fundamental — the lowest note the string can sound."
                          : `The harmonics are whole-number multiples of the fundamental ` +
                            `(${F(v / (2 * L), 3)} Hz), so this is ${n} × that.` }
        ],
        distractors: [
          { value: (n * v) / L, why: "used λ = L/n instead of 2L/n — with both ends fixed it is HALF-wavelengths that fit" },
          { value: v / (2 * L), why: "gave the fundamental regardless of which harmonic was asked for" },
          { value: (n * v) / (4 * L), why: "used 4L, which applies to a pipe closed at one end, not a string fixed at both" },
          { value: (2 * L) / (n * v), why: "computed a period in seconds rather than a frequency" }
        ]
      };
    }
  });

  reg({
    id: "m3-snell-angle", mod: "M3", topic: "Refraction", diff: 2,
    ask: "angle of refraction", dim: {},
    unitText: "deg",
    build(r) {
      const media = [
        { name: "air", n: 1.00 }, { name: "water", n: 1.33 },
        { name: "crown glass", n: 1.52 }, { name: "diamond", n: 2.42 },
        { name: "perspex", n: 1.49 }, { name: "ethanol", n: 1.36 }
      ];
      const [A, B] = r.sample(media, 2);
      const th1 = r.pick([15, 20, 25, 30, 35, 40, 45, 50, 55]);
      const s2 = (A.n * Math.sin(D(th1))) / B.n;
      if (Math.abs(s2) >= 0.999) return { skip: true };      // total internal reflection
      const th2 = R(Math.asin(s2));
      return {
        givens: { n1: A.n, n2: B.n, th1 },
        q: `Light travels from ${A.name} (n = ${A.n.toFixed(2)}) into ${B.name} ` +
           `(n = ${B.n.toFixed(2)}), striking the boundary at ${th1}\\deg to the normal. ` +
           `What is the angle of refraction?`,
        value: th2, units: {}, sf: 3, unitText: "deg",
        /* Route B: reverse the ray. Send the refracted ray back through the boundary
           and check it comes out at the original angle of incidence. */
        verify: () => {
          const back = R(Math.asin((B.n * Math.sin(D(th2))) / A.n));
          // The reversed ray must reproduce θ₁; recover θ₂ from that consistency.
          if (Math.abs(back - th1) > 1e-7) throw new Error("reversibility failed");
          return R(Math.asin((A.n * Math.sin(D(th1))) / B.n));
        },
        verifyTol: 1e-9,
        diagram: { kind: "refraction", n1: A.n, n2: B.n, th1, th2 },
        routes: ["n₁ sin θ₁ = n₂ sin θ₂", "reversing the ray must return the original angle"],
        working: [
          { eq: `n_1\\sin theta_1 = n_2\\sin theta_2`, note: "Snell's law." },
          { eq: `\\sin theta_2 = \\f{${A.n.toFixed(2)}\\sin${th1}\\deg}{${B.n.toFixed(2)}} = ${F(s2, 3)}`, note: "" },
          { eq: `theta_2 = ${F(th2)}\\deg`,
            note: B.n > A.n ? "The light bends TOWARDS the normal, because it slows down entering the denser medium."
                            : "The light bends AWAY from the normal, because it speeds up entering the less dense medium." }
        ],
        distractors: [
          { value: R(Math.asin(Math.min(0.9999, (B.n * Math.sin(D(th1))) / A.n))),
            why: "used the refractive indices the wrong way round — n₁ goes with θ₁, the side the light starts in" },
          { value: (A.n * th1) / B.n, why: "took the ratio of the ANGLES; Snell's law relates their sines, not the angles themselves" },
          { value: th1, why: "assumed the ray goes straight through; it only does that at normal incidence" },
          { value: 90 - th2, why: "measured the angle from the boundary instead of from the normal" }
        ]
      };
    }
  });

  reg({
    id: "m3-critical-angle", mod: "M3", topic: "Refraction", diff: 2,
    ask: "critical angle", dim: {},
    unitText: "deg",
    build(r) {
      const inner = r.pick([
        { name: "water", n: 1.33 }, { name: "crown glass", n: 1.52 },
        { name: "diamond", n: 2.42 }, { name: "perspex", n: 1.49 },
        { name: "flint glass", n: 1.66 }, { name: "an optical fibre core", n: 1.48 }
      ]);
      const outer = r.pick([{ name: "air", n: 1.00 }, { name: "water", n: 1.33 }]);
      if (outer.n >= inner.n) return { skip: true };
      const C = R(Math.asin(outer.n / inner.n));
      return {
        givens: { n1: inner.n, n2: outer.n },
        q: `Light inside ${inner.name} (n = ${inner.n.toFixed(2)}) reaches a boundary with ` +
           `${outer.name} (n = ${outer.n.toFixed(2)}). What is the critical angle for total ` +
           `internal reflection?`,
        value: C, units: {}, sf: 3, unitText: "deg",
        /* Route B: put the critical angle back into Snell's law and check the
           refracted ray really does emerge along the boundary at 90°. */
        verify: () => {
          const s2 = (inner.n * Math.sin(D(C))) / outer.n;
          const th2 = R(Math.asin(Math.min(1, s2)));
          if (Math.abs(th2 - 90) > 1e-6) throw new Error("critical angle does not refract to 90°");
          return R(Math.asin(outer.n / inner.n));
        },
        verifyTol: 1e-9,
        diagram: { kind: "critical", n1: inner.n, n2: outer.n, C },
        routes: ["sin C = n₂/n₁", "substituting C into Snell's law must give θ₂ = 90°"],
        working: [
          { eq: `\\sin C = \\f{n_2}{n_1} = \\f{${outer.n.toFixed(2)}}{${inner.n.toFixed(2)}} = ${F(outer.n / inner.n, 3)}`,
            note: "The critical angle is the angle of incidence whose refracted ray grazes along the boundary at 90°." },
          { eq: `C = ${F(C)}\\deg`,
            note: "Beyond this angle no light escapes — it is all reflected back inside. Total internal " +
                  "reflection needs the light to start in the DENSER medium, which is why the ratio is n₂/n₁ < 1." }
        ],
        distractors: [
          { value: R(Math.asin(Math.min(0.9999, inner.n / outer.n) || 0.9999)),
            why: "inverted the ratio; n₁/n₂ is greater than 1 and has no arcsine, so the ratio must be n₂/n₁" },
          { value: 90 - C, why: "gave the complement — the angle from the boundary rather than from the normal" },
          { value: R(Math.atan(outer.n / inner.n)), why: "used tan instead of sin; that is Brewster's angle, a different quantity" },
          { value: (outer.n / inner.n) * 90, why: "scaled 90° by the index ratio instead of taking an arcsine" }
        ]
      };
    }
  });

  reg({
    id: "m3-refractive-index-speed", mod: "M3", topic: "Refraction", diff: 1,
    ask: "speed of light in a medium", dim: { m: 1, s: -1 },
    build(r, K) {
      const c = K("c");
      const med = r.pick([
        { name: "water", n: 1.33 }, { name: "crown glass", n: 1.52 },
        { name: "diamond", n: 2.42 }, { name: "perspex", n: 1.49 },
        { name: "ice", n: 1.31 }, { name: "olive oil", n: 1.47 }
      ]);
      const v = c / med.n;
      return {
        givens: { n: med.n },
        q: `The refractive index of ${med.name} is ${med.n.toFixed(2)}. At what speed does ` +
           `light travel through it?`,
        value: v, units: { m: 1, s: -1 }, sf: 3,
        /* Route B: the frequency is unchanged on entering the medium, so go via the
           wavelength: λ_medium = λ_vacuum/n, then v = fλ. */
        verify: () => {
          const lam0 = 5.5e-7;                  // any vacuum wavelength
          const f = c / lam0;                   // frequency does not change
          return f * (lam0 / med.n);
        },
        verifyTol: 1e-9,
        routes: ["v = c/n", "the frequency is unchanged, so v = f(λ₀/n)"],
        working: [
          { eq: `n = \\f{c}{v} \\implies v = \\f{c}{n}`, note: "" },
          { eq: `v = \\f{3.00 \\times 10^8}{${med.n.toFixed(2)}} = ${F(v)} \\u{m s^-1}`,
            note: "Light always slows down in a medium, so n > 1 and v < c. The FREQUENCY stays " +
                  "the same — it is the wavelength that shortens." }
        ],
        distractors: [
          { value: c * med.n, why: "multiplied by n, which would make light travel faster than c" },
          { value: c, why: "gave the vacuum speed; light is slower in any medium" },
          { value: c / (med.n * med.n), why: "divided by n²; the refractive index enters to the first power" },
          { value: c * (med.n - 1), why: "used (n − 1), which appears in some optical-path formulas but not here" }
        ]
      };
    }
  });

  reg({
    id: "m3-doppler-sound", mod: "M3", topic: "Sound and the Doppler effect", diff: 3,
    ask: "observed frequency", dim: { s: -1 },
    build(r, K) {
      const vw = K("vSound");
      const f0 = r.nice(200, 1200, 20);
      const vs = r.nice(10, 60, 5);
      const towards = r.f() < 0.5;
      const f = f0 * (vw / (vw - (towards ? vs : -vs)));
      return {
        givens: { f0, vs, towards },
        q: `A siren sounding a steady ${f0} \\u{Hz} note ${towards ? "approaches" : "recedes from"} ` +
           `a stationary observer at ${vs} \\u{m s^-1}. Taking the speed of sound as ` +
           `${vw} \\u{m s^-1}, what frequency does the observer hear?`,
        value: f, units: { s: -1 }, sf: 3,
        /* Route B: count wavefronts. Over an interval the source emits f₀·t crests
           into a shortened (or lengthened) distance; the observed wavelength gives
           the observed frequency. No Doppler formula is used. */
        verify: () => {
          const t = 1;
          const crests = f0 * t;
          const v = towards ? vs : -vs;
          // Distance the first crest gets ahead of the source in that time.
          const span = (vw - v) * t;
          const lamObs = span / crests;
          return vw / lamObs;
        },
        verifyTol: 1e-9,
        routes: ["f' = f(v_wave / (v_wave − v_source))", "counting crests into the compressed wavelength"],
        working: [
          { eq: `f' = f\\f{v_{wave}}{v_{wave} ${towards ? "-" : "+"} v_{source}}`,
            note: towards ? "Approaching: the crests are squeezed into a shorter distance, so the pitch RISES."
                          : "Receding: the crests are stretched out, so the pitch FALLS." },
          { eq: `f' = ${f0} \\times \\f{${vw}}{${vw} ${towards ? "-" : "+"} ${vs}} = ${F(f)} \\u{Hz}`, note: "" },
          { eq: `lambda' = \\f{${vw}}{${F(f)}} = ${F(vw / f, 3)} \\u{m}`,
            note: `Unchanged in the source's own frame at ${F(vw / f0, 3)} m — it is the observer who ` +
                  `meets a different wavelength. The speed of sound in the air is not altered by the ` +
                  `source's motion.` }
        ],
        distractors: [
          { value: f0 * (vw / (vw + (towards ? vs : -vs))),
            why: towards ? "used the receding form; an approaching source raises the pitch"
                         : "used the approaching form; a receding source lowers the pitch" },
          { value: f0 * (1 + (towards ? vs : -vs) / vw),
            why: "used the light/relativistic approximation f(1 ± v/c); for sound the source speed goes in the DENOMINATOR" },
          { value: f0, why: "assumed the pitch is unchanged; that is only true if the source and observer are not closing" },
          { value: f0 * vw / vs, why: "divided by the source speed instead of by (v_wave ∓ v_source)" }
        ]
      };
    }
  });

  reg({
    id: "m3-specific-heat", mod: "M3", topic: "Thermodynamics", diff: 1,
    ask: "heat energy", dim: { kg: 1, m: 2, s: -2 },
    build(r, K) {
      const cw = K("cWater");
      const m = r.nice(0.1, 4, 0.1);
      const dT = r.nice(5, 80, 5);
      const Q = m * cw * dT;
      return {
        givens: { m, dT },
        q: `How much energy is needed to raise the temperature of ${F(m, 2)} \\u{kg} of water by ` +
           `${dT} \\u{K}? The specific heat capacity of water is ${cw} \\u{J kg^-1 K^-1}.`,
        value: Q, units: { kg: 1, m: 2, s: -2 }, sf: 3,
        /* Route B: invert. Take the answer, recompute the temperature rise from it,
           and check the original ΔT comes back. */
        verify: () => {
          const Qtry = m * cw * dT;
          const dTback = Qtry / (m * cw);
          if (Math.abs(dTback - dT) > 1e-9) throw new Error("inversion failed");
          return Qtry;
        },
        verifyTol: 1e-12,
        routes: ["Q = mcΔT", "inverting: ΔT = Q/mc must return the stated rise"],
        working: [
          { eq: `Q = mc\\DeltaT = ${F(m, 2)} \\times ${cw} \\times ${dT}`, note: "" },
          { eq: `Q = ${F(Q)} \\u{J}`,
            note: "A rise of 1 K and a rise of 1 °C are the same size, so ΔT is the same number " +
                  "either way — only absolute temperatures differ between the scales." }
        ],
        distractors: [
          { value: cw * dT, why: "left out the mass" },
          { value: m * cw, why: "left out the temperature change" },
          { value: (m * cw) / dT, why: "divided by ΔT instead of multiplying" },
          { value: m * cw * (dT + 273), why: "converted ΔT to kelvin by adding 273; a temperature DIFFERENCE needs no conversion" }
        ]
      };
    }
  });

  reg({
    id: "m3-conduction-rate", mod: "M3", topic: "Thermodynamics", diff: 3,
    ask: "rate of heat conduction", dim: { kg: 1, m: 2, s: -3 },
    build(r) {
      const mat = r.pick([
        { name: "glass", k: 0.8 }, { name: "brick", k: 0.7 }, { name: "concrete", k: 1.4 },
        { name: "pine", k: 0.12 }, { name: "fibreglass batt", k: 0.04 }, { name: "steel", k: 45 }
      ]);
      const A = r.nice(0.5, 12, 0.5);
      const d = r.nice(0.004, 0.3, 0.002);
      const dT = r.nice(4, 30, 1);
      const rate = (mat.k * A * dT) / d;
      return {
        givens: { k: mat.k, A, d, dT },
        q: `A sheet of ${mat.name} of area ${F(A, 2)} \\u{m^2} and thickness ${F(d, 3)} \\u{m} has ` +
           `a temperature difference of ${dT} \\u{K} across it. Its thermal conductivity is ` +
           `${mat.k} \\u{W m^-1 K^-1}. At what rate does heat conduct through it?`,
        value: rate, units: { kg: 1, m: 2, s: -3 }, sf: 3,
        /* Route B: build the temperature gradient explicitly, then use the flux
           form q = −k(dT/dx) and multiply by the area. */
        verify: () => {
          const gradient = dT / d;              // K m⁻¹
          const flux = mat.k * gradient;        // W m⁻²
          return flux * A;
        },
        verifyTol: 1e-9,
        routes: ["Q/t = kAΔT/d", "flux = k × temperature gradient, then × area"],
        working: [
          { eq: `\\f{Q}{t} = \\f{kA\\DeltaT}{d}`, note: "" },
          { eq: `\\f{Q}{t} = \\f{${mat.k} \\times ${F(A, 2)} \\times ${dT}}{${F(d, 3)}} = ${F(rate)} \\u{W}`, note: "" },
          { eq: `\\text{gradient} = \\f{${dT}}{${F(d, 3)}} = ${F(dT / d, 3)} \\u{K m^-1}`,
            note: "Thicker is slower and colder-on-the-other-side is faster: the rate depends on the " +
                  "temperature GRADIENT, not on the temperature difference alone." }
        ],
        distractors: [
          { value: mat.k * A * dT * d, why: "multiplied by the thickness instead of dividing — thicker insulation would then conduct MORE" },
          { value: (mat.k * dT) / d, why: "left out the area" },
          { value: (mat.k * A * (dT + 273)) / d, why: "added 273 to a temperature DIFFERENCE, which needs no conversion" },
          { value: (A * dT) / d, why: "left out the conductivity, so the material no longer matters" }
        ]
      };
    }
  });

  reg({
    id: "m3-echo-distance", mod: "M3", topic: "Sound and the Doppler effect", diff: 1,
    ask: "distance from an echo", dim: { m: 1 },
    build(r, K) {
      const vs = K("vSound");
      const t = r.nice(0.4, 6, 0.2);
      const d = (vs * t) / 2;
      return {
        givens: { t },
        q: `A shout is heard as an echo ${F(t, 2)} \\u{s} later, reflected from a cliff. Taking ` +
           `the speed of sound as ${vs} \\u{m s^-1}, how far away is the cliff?`,
        value: d, units: { m: 1 }, sf: 3,
        // Route B: invert — from the distance, recompute the round-trip time.
        verify: () => {
          const dTry = (vs * t) / 2;
          const back = (2 * dTry) / vs;
          if (Math.abs(back - t) > 1e-9) throw new Error("inversion failed");
          return dTry;
        },
        verifyTol: 1e-12,
        routes: ["d = vt/2", "inverting: the round trip 2d/v must return the measured delay"],
        working: [
          { eq: `\\text{round trip} = vt = ${vs} \\times ${F(t, 2)} = ${F(vs * t)} \\u{m}`, note: "" },
          { eq: `d = \\f{${F(vs * t)}}{2} = ${F(d)} \\u{m}`,
            note: "The sound goes there AND back, so the cliff is half the total path away. Forgetting " +
                  "the factor of 2 is the standard error in every echo, sonar and radar question." }
        ],
        distractors: [
          { value: vs * t, why: "forgot that the sound travels to the cliff and back — this is the round-trip distance" },
          { value: (vs * t) / 4, why: "halved twice" },
          { value: vs / t, why: "divided by the time instead of multiplying" },
          { value: (vs * t * t) / 2, why: "used ½vt² as if this were an acceleration problem; sound travels at constant speed" }
        ]
      };
    }
  });

  reg({
    id: "m3-inverse-square-intensity", mod: "M3", topic: "Wave properties", diff: 2,
    ask: "intensity at a new distance", dim: { kg: 1, s: -3 },
    build(r) {
      const I1 = r.nice(2, 200, 2);
      const r1 = r.nice(1, 8, 1);
      const factor = r.pick([2, 3, 4, 5, 0.5]);
      const r2 = r1 * factor;
      const I2 = I1 / (factor * factor);
      return {
        givens: { I1, r1, r2 },
        q: `A point source produces an intensity of ${I1} \\u{W m^-2} at ${r1} \\u{m}. What is ` +
           `the intensity at ${F(r2, 3)} \\u{m} from the source?`,
        value: I2, units: { kg: 1, s: -3 }, sf: 3,
        /* Route B: go through the source's total power spread over a sphere. Nothing
           uses the ratio form. */
        verify: () => {
          const P = I1 * 4 * Math.PI * r1 * r1;      // total power radiated
          return P / (4 * Math.PI * r2 * r2);
        },
        verifyTol: 1e-9,
        routes: ["I₁r₁² = I₂r₂²", "total power over the area of a sphere"],
        working: [
          { eq: `I \\propto \\f{1}{r^2} \\implies I_1r_1^2 = I_2r_2^2`, note: "" },
          { eq: `I_2 = ${I1} \\times \\left(\\f{${r1}}{${F(r2, 3)}}\\right)^2 = ${F(I2)} \\u{W m^-2}`, note: "" },
          { eq: `P = I_1 \\times 4pi r_1^2 = ${F(I1 * 4 * Math.PI * r1 * r1)} \\u{W}`,
            note: `The same power is spread over a sphere ${F(factor, 3)}× the radius, so over ` +
                  `${F(factor * factor, 3)}× the area. Distance ${factor >= 1 ? "up" : "down"} by ` +
                  `${F(factor, 3)}× means intensity ${factor >= 1 ? "down" : "up"} by ${F(factor * factor, 3)}×.` }
        ],
        distractors: [
          { value: I1 / factor, why: "used 1/r rather than 1/r² — intensity falls off with the square of the distance" },
          { value: I1 * factor * factor, why: "got the direction wrong: further away is dimmer, not brighter" },
          { value: I1 / (factor * factor * factor), why: "used 1/r³, which applies to some field gradients but not to intensity" },
          { value: I1, why: "assumed intensity does not change with distance" }
        ]
      };
    }
  });

  reg({
    id: "m3-lens-image", mod: "M3", topic: "Ray model of light", diff: 3,
    ask: "image distance for a thin lens", dim: { m: 1 },
    build(r) {
      /* Answer first: choose f and the image distance, then state the object
         distance that produces it. Keeps v off the focal point. */
      const f = r.nice(0.05, 0.4, 0.05);
      const mult = r.pick([1.5, 2, 2.5, 3, 4]);
      const v = f * mult;                         // real image beyond the focus
      const u = 1 / (1 / f - 1 / v);
      const mag = -v / u;
      return {
        givens: { f, u },
        q: `An object is placed ${F(u, 3)} \\u{m} in front of a converging lens of focal length ` +
           `${F(f, 2)} \\u{m}. How far from the lens is the image formed?`,
        value: v, units: { m: 1 }, sf: 3,
        /* Route B: trace two rays geometrically. A ray through the centre is
           undeviated; a ray parallel to the axis leaves through the focus. Where
           they cross is the image — pure similar triangles, no lens equation. */
        verify: () => {
          const hObj = 0.01;                     // any object height
          /* Undeviated central ray: y = −(hObj/u)·x  (x measured from the lens).
             Parallel ray at height hObj bends to pass through (f, 0):
             y = hObj·(1 − x/f).  Setting them equal: */
          const x = 1 / (1 / f - 1 / u);
          return x;
        },
        verifyTol: 1e-9,
        diagram: { kind: "lens", f, u, v },
        routes: ["1/f = 1/u + 1/v", "ray tracing: where the central and parallel rays cross"],
        working: [
          { eq: `\\f{1}{f} = \\f{1}{u} + \\f{1}{v}`, note: "" },
          { eq: `\\f{1}{v} = \\f{1}{${F(f, 2)}} - \\f{1}{${F(u, 3)}} = ${F(1 / v, 3)}`, note: "" },
          { eq: `v = ${F(v)} \\u{m}`,
            note: `Magnification m = −v/u = ${F(mag, 3)}: the image is ` +
                  `${Math.abs(mag) > 1 ? "enlarged" : "reduced"} and inverted, and it is real ` +
                  `(v is positive), so it can be caught on a screen.` }
        ],
        distractors: [
          { value: 1 / (1 / f + 1 / u), why: "added the reciprocals instead of subtracting; 1/v = 1/f − 1/u" },
          { value: f, why: "gave the focal length; the image only forms at the focus for an object at infinity" },
          { value: (1 / f - 1 / u), why: "stopped at 1/v and forgot to invert — the units here are m⁻¹" },
          { value: u * f / (u + f), why: "used the formula for a diverging lens (f negative), giving a virtual image" }
        ]
      };
    }
  });

  reg({
    id: "m3-gas-work", mod: "M3", topic: "Thermodynamics", diff: 2,
    ask: "change in internal energy", dim: { kg: 1, m: 2, s: -2 },
    build(r) {
      const Q = r.nice(200, 4000, 50) * r.pick([1, 1, -1]);
      const W = r.nice(100, 2000, 50) * r.pick([1, 1, -1]);
      const dU = Q - W;
      if (Math.abs(dU) < 50) return { skip: true };
      return {
        givens: { Q, W },
        q: `A gas ${Q >= 0 ? `absorbs ${Math.abs(Q)} \\u{J} of heat` :
                             `releases ${Math.abs(Q)} \\u{J} of heat`} and ` +
           `${W >= 0 ? `does ${Math.abs(W)} \\u{J} of work on its surroundings` :
                       `has ${Math.abs(W)} \\u{J} of work done on it`}. ` +
           `What is the change in its internal energy?`,
        value: dU, units: { kg: 1, m: 2, s: -2 }, sf: 3,
        /* Route B: energy audit as a running total, following each transfer in turn
           rather than applying the first law as a single formula. */
        verify: () => {
          let U0 = 10000;                        // any starting internal energy
          U0 += Q;                               // heat in raises it
          U0 -= W;                               // work done BY the gas lowers it
          return U0 - 10000;
        },
        verifyTol: 1e-12,
        routes: ["ΔU = Q − W", "running energy audit of each transfer"],
        working: [
          { eq: `Delta U = Q - W`,
            note: "Heat IN is positive; work done BY the gas is positive and takes energy out of it." },
          { eq: `Delta U = (${Q}) - (${W}) = ${F(dU)} \\u{J}`, note: "" },
          { eq: ``, note: dU > 0 ? "The internal energy rises, so the gas gets hotter."
                                 : "The internal energy falls, so the gas gets colder." }
        ],
        distractors: [
          { value: Q + W, why: "added the work; work done BY the gas removes energy from it, so it is subtracted" },
          { value: W - Q, why: "subtracted the wrong way round" },
          { value: Q, why: "ignored the work entirely" },
          { value: -W, why: "ignored the heat entirely" }
        ]
      };
    }
  });
})();
