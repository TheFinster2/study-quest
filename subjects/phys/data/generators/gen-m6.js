/* Module 6 — Electromagnetism: motors, electromagnetic induction, Faraday's and
   Lenz's laws, generators, transformers.  Contract: js/core/gen.js. */
(function () {
  const reg = PHYS.Gen.register;
  const F = (v, n) => PHYS.U.fmtSig(v, n || 3);
  const D = PHYS.U.deg;

  reg({
    id: "m6-force-conductor", mod: "M6", topic: "Motor effect", diff: 2,
    ask: "force on a current-carrying conductor", dim: { kg: 1, m: 1, s: -2 },
    build(r) {
      const B = r.nice(0.02, 2, 0.02);
      const I = r.nice(0.5, 20, 0.5);
      const L = r.nice(0.05, 1.5, 0.05);
      const th = r.pick([30, 40, 45, 55, 60, 90, 90]);
      const Fm = B * I * L * Math.sin(D(th));
      return {
        givens: { B, I, L, th },
        q: `A straight wire of length ${F(L, 3)} \\u{m} carries ${F(I, 3)} \\u{A} through a ` +
           `uniform magnetic field of ${F(B, 3)} \\u{T}. The wire makes ${th}\\deg with the field. ` +
           `What force acts on it?`,
        value: Fm, units: { kg: 1, m: 1, s: -2 }, sf: 3,
        /* Route B: sum the forces on the individual moving charges. F = qvB sinθ per
           carrier, and n carriers per second is the current — a completely different
           physical picture from F = BIL. */
        verify: () => {
          const e = PHYS.DATA.constants.K("e");
          const drift = 1e-4;                    // any drift speed
          const nPerMetre = I / (e * drift);     // carriers per metre giving this current
          const perCarrier = e * drift * B * Math.sin(D(th));
          return perCarrier * nPerMetre * L;
        },
        verifyTol: 1e-9,
        diagram: { kind: "motor-force", B, I, angle: th },
        routes: ["F = BIL sin θ", "summing F = qvB sin θ over the charge carriers in the wire"],
        working: [
          { eq: `F = BIL\\sin theta`, note: "" },
          { eq: `F = ${F(B, 3)} \\times ${F(I, 3)} \\times ${F(L, 3)} \\times \\sin${th}\\deg = ${F(Fm)} \\u{N}`, note: "" },
          { eq: ``, note: th === 90
              ? "At 90° the force is at its maximum. Its DIRECTION is perpendicular to both the current and the field — use the right-hand palm rule."
              : `Only the component of the wire perpendicular to the field feels a force. A wire parallel to the field (θ = 0) feels none at all.` }
        ],
        distractors: [
          { value: B * I * L * Math.cos(D(th)), why: "used cos θ; the force is maximum when the wire is PERPENDICULAR to the field, which sin gives" },
          { value: B * I * L, why: "ignored the angle" },
          { value: (B * I * Math.sin(D(th))) / L, why: "divided by the length instead of multiplying" },
          { value: B * L * Math.sin(D(th)), why: "left out the current" }
        ]
      };
    }
  });

  reg({
    id: "m6-force-charge", mod: "M6", topic: "Charged particles in fields", diff: 2,
    ask: "force on a moving charge", dim: { kg: 1, m: 1, s: -2 },
    build(r, K) {
      const e = K("e");
      const B = r.nice(0.05, 3, 0.05);
      const v = r.nice(1, 9, 1) * Math.pow(10, r.int(4, 7));
      const nq = r.pick([1, 1, 2]);
      const th = r.pick([30, 45, 60, 90, 90]);
      const Fm = nq * e * v * B * Math.sin(D(th));
      return {
        givens: { B, v, nq, th },
        q: `${nq === 1 ? "An electron" : "An alpha particle (charge +2e)"} moves at ` +
           `${F(v, 2)} \\u{m s^-1} through a ${F(B, 3)} \\u{T} magnetic field, at ${th}\\deg to ` +
           `the field. What is the magnitude of the magnetic force on it?`,
        value: Fm, units: { kg: 1, m: 1, s: -2 }, sf: 3,
        /* Route B: treat the moving charge as a tiny current element and use BIL —
           the same physics from the other end. */
        verify: () => {
          const dt = 1e-9;
          const len = v * dt;                    // distance covered
          const cur = (nq * e) / dt;             // one charge passing in that time
          return B * cur * len * Math.sin(D(th));
        },
        verifyTol: 1e-9,
        routes: ["F = qvB sin θ", "treat the charge as a current element and use F = BIL sin θ"],
        working: [
          { eq: `F = qvB\\sin theta`, note: "" },
          { eq: `F = ${nq === 1 ? "" : "2 \\times "}1.602 \\times 10^{-19} \\times ${F(v, 2)} \\times ${F(B, 3)} \\times \\sin${th}\\deg`, note: "" },
          { eq: `F = ${F(Fm)} \\u{N}`,
            note: "The magnetic force is always perpendicular to the velocity, so it changes the " +
                  "DIRECTION of motion but never the speed — and therefore does no work." }
        ],
        distractors: [
          { value: nq * e * v * B * Math.cos(D(th)), why: "used cos θ instead of sin θ" },
          { value: nq * e * B * Math.sin(D(th)), why: "left out the speed — a stationary charge feels no magnetic force at all" },
          { value: nq * e * v * Math.sin(D(th)), why: "left out the field strength" },
          { value: (nq * e * v) / B, why: "divided by B instead of multiplying" }
        ]
      };
    }
  });

  reg({
    id: "m6-motor-torque", mod: "M6", topic: "DC motors", diff: 3,
    ask: "torque on a coil", dim: { kg: 1, m: 2, s: -2 },
    build(r) {
      const n = r.int(20, 400);
      const B = r.nice(0.05, 1.2, 0.05);
      const I = r.nice(0.2, 6, 0.2);
      const wcm = r.nice(2, 12, 1), hcm = r.nice(2, 12, 1);
      const A = (wcm * 1e-2) * (hcm * 1e-2);
      const th = r.pick([0, 0, 30, 45, 60]);     // angle between the coil PLANE and the field
      const tau = n * B * I * A * Math.cos(D(th));
      if (tau < 1e-6) return { skip: true };
      return {
        givens: { n, B, I, wcm, hcm, th },
        q: `A rectangular coil of ${n} turns measures ${wcm} \\u{cm} by ${hcm} \\u{cm} and carries ` +
           `${F(I, 2)} \\u{A} in a uniform ${F(B, 3)} \\u{T} field. The plane of the coil is at ` +
           `${th}\\deg to the field. What torque acts on it?`,
        value: tau, units: { kg: 1, m: 2, s: -2 }, sf: 3,
        /* Route B: force on each side, then moment about the axis. Never uses nBIA. */
        verify: () => {
          const w = wcm * 1e-2, h = hcm * 1e-2;
          /* The two sides of length h carry current perpendicular to the field, each
             feeling F = nBIh, acting at a moment arm of (w/2)cos θ on each side. */
          const force = n * B * I * h;
          return 2 * force * (w / 2) * Math.cos(D(th));
        },
        verifyTol: 1e-9,
        routes: ["τ = nBIA cos θ", "force on each side, then moments about the axis"],
        working: [
          { eq: `A = ${wcm} \\times ${hcm} \\u{cm^2} = ${F(A, 3)} \\u{m^2}`,
            note: "Convert to m² — a cm² is 10⁻⁴ m², not 10⁻². This is the most common slip here." },
          { eq: `tau = nBIA\\cos theta = ${n} \\times ${F(B, 3)} \\times ${F(I, 2)} \\times ${F(A, 3)}${th ? " \\times \\cos" + th + "\\deg" : ""}`, note: "" },
          { eq: `tau = ${F(tau)} \\u{N m}`,
            note: th === 0
              ? "The coil plane is parallel to the field, which is where the torque is MAXIMUM. Note the cos here is measured from the coil's plane, not its normal — check which convention a question uses."
              : "The torque falls to zero when the coil plane is perpendicular to the field; that is the position a commutator has to carry the coil through." }
        ],
        distractors: [
          { value: n * B * I * A * Math.sin(D(th)) || n * B * I * A * 0.5,
            why: "used sin of the angle to the coil PLANE; with that convention the torque is maximum at 0°, which sin gets backwards" },
          { value: B * I * A * Math.cos(D(th)), why: "left out the number of turns" },
          { value: n * B * I * (wcm * hcm) * Math.cos(D(th)), why: "left the area in cm² instead of converting to m²" },
          { value: n * B * I * Math.sqrt(A) * Math.cos(D(th)), why: "used a side length instead of the area" }
        ]
      };
    }
  });

  reg({
    id: "m6-flux", mod: "M6", topic: "Electromagnetic induction", diff: 1,
    ask: "magnetic flux", dim: { kg: 1, m: 2, s: -2, A: -1 },
    build(r) {
      const B = r.nice(0.01, 1.5, 0.01);
      const side = r.nice(2, 40, 1);             // cm
      const A = Math.pow(side * 1e-2, 2);
      const th = r.pick([0, 0, 30, 45, 60]);     // angle between B and the NORMAL
      const flux = B * A * Math.cos(D(th));
      return {
        givens: { B, side, th },
        q: `A square loop of side ${side} \\u{cm} sits in a uniform ${F(B, 3)} \\u{T} field. The ` +
           `field makes ${th}\\deg with the normal to the loop. What is the magnetic flux through ` +
           `the loop?`,
        value: flux, units: { kg: 1, m: 2, s: -2, A: -1 }, sf: 3,
        /* Route B: resolve the field into a component along the normal first, then
           multiply by the plain area. Same numbers, different order. */
        verify: () => {
          const Bnormal = B * Math.cos(D(th));
          return Bnormal * A;
        },
        verifyTol: 1e-12,
        diagram: { kind: "flux", B, side, angle: th },
        routes: ["Φ = BA cos θ", "resolve B along the normal, then × A"],
        working: [
          { eq: `A = (${side} \\times 10^{-2})^2 = ${F(A, 3)} \\u{m^2}`, note: "" },
          { eq: `Phi = BA\\cos theta = ${F(B, 3)} \\times ${F(A, 3)}${th ? " \\times \\cos" + th + "\\deg" : ""} = ${F(flux)} \\u{Wb}`, note: "" },
          { eq: ``, note: "θ is measured from the NORMAL to the loop, not from its plane. Flux is maximum " +
                          "when the field is perpendicular to the loop (θ = 0) and zero when the field lies " +
                          "in the plane of the loop." }
        ],
        distractors: [
          { value: B * A * Math.sin(D(th)) || B * A * 0.5,
            why: "used sin θ; with θ measured from the normal the flux is maximum at 0°, which cos gives" },
          { value: B * Math.pow(side, 2) * Math.cos(D(th)), why: "left the side length in centimetres" },
          { value: (B * A) / Math.cos(D(th)), why: "divided by cos θ instead of multiplying" },
          { value: B * side * 1e-2 * Math.cos(D(th)), why: "used the side length rather than the area" }
        ]
      };
    }
  });

  reg({
    id: "m6-faraday-emf", mod: "M6", topic: "Electromagnetic induction", diff: 2,
    ask: "induced EMF", dim: { kg: 1, m: 2, s: -3, A: -1 },
    build(r) {
      const n = r.int(1, 250);
      const B1 = r.nice(0.05, 1.5, 0.05);
      const B2 = r.f() < 0.35 ? 0 : r.nice(0.05, 1.5, 0.05);
      const side = r.nice(2, 30, 1);
      const A = Math.pow(side * 1e-2, 2);
      const dt = r.nice(0.01, 2, 0.01);
      const emf = Math.abs((n * (B2 - B1) * A) / dt);
      if (emf < 1e-6) return { skip: true };
      return {
        givens: { n, B1, B2, side, dt },
        q: `A ${n}-turn square coil of side ${side} \\u{cm} lies perpendicular to a magnetic ` +
           `field. The field changes from ${F(B1, 3)} \\u{T} to ${F(B2, 3)} \\u{T} in ` +
           `${F(dt, 3)} \\u{s}. What is the magnitude of the average induced EMF?`,
        value: emf, units: { kg: 1, m: 2, s: -3, A: -1 }, sf: 3,
        /* Route B: compute the two fluxes separately, take the difference, and
           divide — rather than working with ΔB. */
        verify: () => {
          const flux1 = n * B1 * A;
          const flux2 = n * B2 * A;
          return Math.abs(flux2 - flux1) / dt;
        },
        verifyTol: 1e-9,
        routes: ["ε = −nΔΦ/Δt with ΔΦ = ΔB·A", "compute both flux linkages and difference them"],
        working: [
          { eq: `A = ${F(A, 3)} \\u{m^2}, Delta B = ${F(B2 - B1, 3)} \\u{T}`, note: "" },
          { eq: `epsilon = -n\\f{\\Delta\\Phi}{\\Deltat} = -${n} \\times \\f{${F((B2 - B1) * A, 3)}}{${F(dt, 3)}}`, note: "" },
          { eq: `|epsilon| = ${F(emf)} \\u{V}`,
            note: "The minus sign is Lenz's law: the induced EMF drives a current whose own field " +
                  "opposes the CHANGE that produced it. It sets the direction, not the size." }
        ],
        distractors: [
          { value: Math.abs(((B2 - B1) * A) / dt), why: "left out the number of turns; each turn contributes its own EMF and they add in series" },
          { value: Math.abs((n * (B2 - B1) * A) * dt), why: "multiplied by the time instead of dividing — a slower change induces LESS EMF" },
          { value: Math.abs((n * (B2 - B1) * Math.pow(side, 2)) / dt), why: "left the side length in centimetres" },
          { value: Math.abs((n * B2 * A) / dt), why: "used the final field instead of the CHANGE in field" }
        ]
      };
    }
  });

  reg({
    id: "m6-rod-emf", mod: "M6", topic: "Electromagnetic induction", diff: 2,
    ask: "motional EMF", dim: { kg: 1, m: 2, s: -3, A: -1 },
    build(r) {
      const B = r.nice(0.05, 1.5, 0.05);
      const L = r.nice(0.1, 2, 0.1);
      const v = r.nice(1, 40, 1);
      const emf = B * L * v;
      return {
        givens: { B, L, v },
        q: `A conducting rod ${F(L, 2)} \\u{m} long slides at ${v} \\u{m s^-1} along rails, ` +
           `perpendicular to a uniform ${F(B, 3)} \\u{T} field. What EMF is induced across the rod?`,
        value: emf, units: { kg: 1, m: 2, s: -3, A: -1 }, sf: 3,
        /* Route B: Faraday's law on the swept area — the rod sweeps out area Lv per
           second, so the flux changes at BLv per second. */
        verify: () => {
          const dt = 0.25;
          const sweptArea = L * v * dt;
          const dFlux = B * sweptArea;
          return dFlux / dt;
        },
        verifyTol: 1e-12,
        routes: ["ε = BLv", "Faraday's law on the area the rod sweeps out"],
        working: [
          { eq: `epsilon = BLv = ${F(B, 3)} \\times ${F(L, 2)} \\times ${v} = ${F(emf)} \\u{V}`, note: "" },
          { eq: `\\text{swept area per second} = Lv = ${F(L * v, 3)} \\u{m^2 s^-1}`,
            note: "BLv is not a separate law — it is Faraday's law applied to the area the rod sweeps out. " +
                  "The flux through the circuit grows at BLv per second." }
        ],
        distractors: [
          { value: B * L, why: "left out the speed; a stationary rod induces nothing" },
          { value: (B * v) / L, why: "divided by the length instead of multiplying" },
          { value: B * L * v * v, why: "squared the speed; motional EMF is linear in v" },
          { value: 0.5 * B * L * v, why: "included a factor of ½ that belongs to a rotating rod about one end, not a translating one" }
        ]
      };
    }
  });

  reg({
    id: "m6-transformer-voltage", mod: "M6", topic: "Transformers", diff: 2,
    ask: "secondary voltage", dim: { kg: 1, m: 2, s: -3, A: -1 },
    build(r) {
      const Vp = r.nice(12, 240, 12);
      const Np = r.nice(100, 2000, 100);
      const ratio = r.pick([0.05, 0.1, 0.25, 0.5, 2, 4, 10, 20]);
      const Ns = Math.round(Np * ratio);
      if (Ns < 5) return { skip: true };
      const Vs = (Vp * Ns) / Np;
      const Ip = r.nice(0.2, 5, 0.2);
      return {
        givens: { Vp, Np, Ns },
        q: `An ideal transformer has ${Np} turns on its primary and ${Ns} turns on its secondary. ` +
           `The primary is connected to ${Vp} \\u{V} AC. What is the secondary voltage?`,
        value: Vs, units: { kg: 1, m: 2, s: -3, A: -1 }, sf: 3,
        /* Route B: power conservation. An ideal transformer passes all the power, so
           work out the secondary current from the turns ratio and recover the
           voltage from P_p = P_s. */
        verify: () => {
          const Is = (Ip * Np) / Ns;             // current ratio is the inverse
          const Pp = Vp * Ip;
          return Pp / Is;
        },
        verifyTol: 1e-9,
        diagram: { kind: "transformer", Np, Ns },
        routes: ["V_s/V_p = N_s/N_p", "power conservation V_pI_p = V_sI_s"],
        working: [
          { eq: `\\f{V_s}{V_p} = \\f{N_s}{N_p}`,
            note: "The same changing flux threads both coils, so each turn gets the same EMF." },
          { eq: `V_s = ${Vp} \\times \\f{${Ns}}{${Np}} = ${F(Vs)} \\u{V}`, note: "" },
          { eq: ``, note: `A ${Ns > Np ? "step-UP" : "step-DOWN"} transformer. An ideal transformer ` +
                          `conserves power, so the current goes the OTHER way: ` +
                          `${Ns > Np ? "more volts means fewer amps" : "fewer volts means more amps"}. ` +
                          `A transformer never creates energy.` }
        ],
        distractors: [
          { value: (Vp * Np) / Ns, why: "inverted the turns ratio — that is how the CURRENT transforms, not the voltage" },
          { value: Vp, why: "assumed the voltage is unchanged" },
          { value: Vp * (Ns / Np) * (Ns / Np), why: "applied the ratio twice" },
          { value: Vp + (Ns - Np), why: "treated the turns as adding to the voltage rather than scaling it" }
        ]
      };
    }
  });

  reg({
    id: "m6-transformer-efficiency", mod: "M6", topic: "Transformers", diff: 3,
    ask: "secondary current in a real transformer", dim: { A: 1 },
    build(r) {
      const Vp = r.nice(120, 400, 20);
      const Ip = r.nice(1, 15, 0.5);
      const eff = r.pick([0.80, 0.85, 0.90, 0.92, 0.95, 0.98]);
      const Vs = r.nice(6, 48, 6);
      const Is = (eff * Vp * Ip) / Vs;
      return {
        givens: { Vp, Ip, eff, Vs },
        q: `A transformer draws ${F(Ip, 3)} \\u{A} at ${Vp} \\u{V} and is ${Math.round(eff * 100)}% ` +
           `efficient. Its secondary delivers ${Vs} \\u{V}. What current does the secondary supply?`,
        value: Is, units: { A: 1 }, sf: 3,
        /* Route B: track the power explicitly — input power, losses, output power,
           then divide by the secondary voltage. */
        verify: () => {
          const Pin = Vp * Ip;
          const lost = Pin * (1 - eff);
          const Pout = Pin - lost;
          return Pout / Vs;
        },
        verifyTol: 1e-9,
        routes: ["ηV_pI_p = V_sI_s", "input power − losses = output power, then I = P/V"],
        working: [
          { eq: `P_{in} = V_pI_p = ${Vp} \\times ${F(Ip, 3)} = ${F(Vp * Ip)} \\u{W}`, note: "" },
          { eq: `P_{out} = ${Math.round(eff * 100)}\\% \\times ${F(Vp * Ip)} = ${F(eff * Vp * Ip)} \\u{W}`,
            note: `${F(Vp * Ip * (1 - eff))} W is lost — mostly as heat in the windings (I²R) and in ` +
                  `the core through eddy currents and hysteresis.` },
          { eq: `I_s = \\f{P_{out}}{V_s} = ${F(Is)} \\u{A}`, note: "" }
        ],
        distractors: [
          { value: (Vp * Ip) / Vs, why: "ignored the efficiency, which would make the transformer ideal" },
          { value: (Vp * Ip) / (eff * Vs), why: "divided by the efficiency instead of multiplying — the output power is LESS than the input" },
          { value: (eff * Ip * Vs) / Vp, why: "swapped the two voltages" },
          { value: eff * Ip, why: "scaled the primary current by the efficiency without accounting for the change in voltage" }
        ]
      };
    }
  });

  reg({
    id: "m6-transmission-loss", mod: "M6", topic: "Power transmission", diff: 3,
    ask: "power lost in transmission lines", dim: { kg: 1, m: 2, s: -3 },
    build(r) {
      const P = r.nice(10, 500, 10) * 1e3;
      const V = r.pick([11e3, 22e3, 33e3, 66e3, 132e3, 330e3]);
      const R = r.nice(0.5, 40, 0.5);
      const I = P / V;
      const loss = I * I * R;
      return {
        givens: { P, V, R },
        q: `${F(P / 1e3, 3)} \\u{kW} is transmitted at ${F(V / 1e3, 3)} \\u{kV} along a line of ` +
           `total resistance ${F(R, 3)} \\u{Ω}. How much power is lost in the line?`,
        value: loss, units: { kg: 1, m: 2, s: -3 }, sf: 3,
        /* Route B: work out the voltage dropped along the line and use P = V_drop·I,
           which needs the same current but a different formula. */
        verify: () => {
          const cur = P / V;
          const Vdrop = cur * R;
          return Vdrop * cur;
        },
        verifyTol: 1e-9,
        routes: ["I = P/V, then P_loss = I²R", "voltage drop along the line, then P = V_drop·I"],
        working: [
          { eq: `I = \\f{P}{V} = \\f{${F(P, 3)}}{${F(V, 3)}} = ${F(I, 3)} \\u{A}`, note: "" },
          { eq: `P_{loss} = I^2R = ${F(I, 3)}^2 \\times ${F(R, 3)} = ${F(loss)} \\u{W}`, note: "" },
          { eq: ``, note: `That is ${F((loss / P) * 100, 3)}% of the transmitted power. Because the loss ` +
                          `goes as I², doubling the transmission voltage quarters the loss — which is the ` +
                          `entire reason the grid uses hundreds of kilovolts. Use I²R with the LINE's ` +
                          `resistance, never V²/R with the transmission voltage.` }
        ],
        distractors: [
          { value: (V * V) / R, why: "used V²/R with the TRANSMISSION voltage; that is the power the line would dissipate if it were connected straight across the supply" },
          { value: P * P * R / (V * V) * 0 + (P / V) * R, why: "gave the voltage DROP along the line in volts, not the power lost in watts" },
          { value: (P / V) * R * (P / V) * 2, why: "doubled the loss for no reason" },
          { value: P * R / V, why: "used PR/V, which is neither I²R nor V²/R" }
        ]
      };
    }
  });

  reg({
    id: "m6-velocity-selector", mod: "M6", topic: "Charged particles in fields", diff: 3,
    ask: "selected speed", dim: { m: 1, s: -1 },
    build(r) {
      const V = r.nice(100, 4000, 100);
      const d = r.nice(0.005, 0.06, 0.005);
      const B = r.nice(0.02, 0.8, 0.02);
      const Ef = V / d;
      const v = Ef / B;
      return {
        givens: { V, d, B },
        q: `In a velocity selector, parallel plates ${F(d, 3)} \\u{m} apart have ${V} \\u{V} ` +
           `across them, and a magnetic field of ${F(B, 3)} \\u{T} acts perpendicular to both ` +
           `the electric field and the beam. What speed passes through undeflected?`,
        value: v, units: { m: 1, s: -1 }, sf: 3,
        /* Route B: balance the two forces on an explicit charge and solve, so a
           dropped q on either side shows up. */
        verify: () => {
          const q = PHYS.DATA.constants.K("e") * 3;   // any charge; it must cancel
          const Felec = q * (V / d);
          // Undeflected means qE = qvB, so v = Felec/(qB)
          return Felec / (q * B);
        },
        verifyTol: 1e-12,
        diagram: { kind: "selector", V, d, B },
        routes: ["v = E/B", "balancing qE against qvB for an explicit charge"],
        working: [
          { eq: `E = \\f{V}{d} = \\f{${V}}{${F(d, 3)}} = ${F(Ef, 3)} \\u{V m^-1}`, note: "" },
          { eq: `qE = qvB \\implies v = \\f{E}{B}`,
            note: "The charge cancels, and so does its SIGN — a velocity selector passes positives and " +
                  "negatives at the same speed, which is what makes it useful in front of a mass " +
                  "spectrometer." },
          { eq: `v = \\f{${F(Ef, 3)}}{${F(B, 3)}} = ${F(v)} \\u{m s^-1}`, note: "" }
        ],
        distractors: [
          { value: Ef * B, why: "multiplied instead of dividing" },
          { value: B / Ef, why: "inverted the ratio" },
          { value: V / (d * B * B), why: "divided by B², which appears in the radius of a circular path, not here" },
          { value: V / B, why: "used the plate voltage instead of the field — the plate separation is needed to get E" }
        ]
      };
    }
  });

  reg({
    id: "m6-radius-in-field", mod: "M6", topic: "Charged particles in fields", diff: 3,
    ask: "radius of a charged particle's path", dim: { m: 1 },
    build(r, K) {
      const e = K("e");
      const kind = r.pick(["electron", "proton"]);
      const m = kind === "electron" ? K("me") : K("mp");
      const v = r.nice(1, 9, 1) * Math.pow(10, r.int(5, 7));
      const B = r.nice(0.02, 1.5, 0.02);
      const rad = (m * v) / (e * B);
      return {
        givens: { kind, v, B },
        q: `${kind === "electron" ? "An electron" : "A proton"} enters a ${F(B, 3)} \\u{T} field ` +
           `at ${F(v, 2)} \\u{m s^-1}, perpendicular to the field. What is the radius of its ` +
           `circular path?`,
        value: rad, units: { m: 1 }, sf: 3,
        /* Route B: go through the period of the circular motion, which depends only
           on m, q and B — the cyclotron period — then r = vT/2π. */
        verify: () => {
          const T = (2 * Math.PI * m) / (e * B);       // independent of speed
          return (v * T) / (2 * Math.PI);
        },
        verifyTol: 1e-9,
        routes: ["qvB = mv²/r gives r = mv/qB", "cyclotron period T = 2πm/qB, then r = vT/2π"],
        working: [
          { eq: `qvB = \\f{mv^2}{r}`, note: "The magnetic force provides the centripetal force." },
          { eq: `r = \\f{mv}{qB} = \\f{${F(m, 4)} \\times ${F(v, 2)}}{1.602 \\times 10^{-19} \\times ${F(B, 3)}}`, note: "" },
          { eq: `r = ${F(rad)} \\u{m}`,
            note: `The period is ${F((2 * Math.PI * m) / (e * B), 3)} s and does NOT depend on the ` +
                  `speed — faster particles travel bigger circles in the same time. That is what makes ` +
                  `a cyclotron work.` }
        ],
        distractors: [
          { value: (m * v * v) / (e * B), why: "used v² — that comes from the force expression before one v cancels" },
          { value: (e * B) / (m * v), why: "inverted the whole expression" },
          { value: (m * v) / (e * B * B), why: "used B²" },
          { value: (m * v) / B, why: "left out the charge" }
        ]
      };
    }
  });

  reg({
    id: "m6-generator-peak-emf", mod: "M6", topic: "Generators", diff: 3,
    ask: "peak EMF of an AC generator", dim: { kg: 1, m: 2, s: -3, A: -1 },
    build(r) {
      const n = r.int(20, 500);
      const B = r.nice(0.05, 1.2, 0.05);
      const side = r.nice(3, 20, 1);
      const A = Math.pow(side * 1e-2, 2);
      const rpm = r.nice(300, 3000, 60);
      const f = rpm / 60;
      const omega = 2 * Math.PI * f;
      const emf = n * B * A * omega;
      return {
        givens: { n, B, side, rpm },
        q: `A ${n}-turn square coil of side ${side} \\u{cm} rotates at ${rpm} \\u{rpm} in a ` +
           `uniform ${F(B, 3)} \\u{T} field. What is the peak EMF it generates?`,
        value: emf, units: { kg: 1, m: 2, s: -3, A: -1 }, sf: 3,
        /* Route B: differentiate the flux numerically. Φ(t) = nBA cos ωt, so the EMF
           is −dΦ/dt; find its largest magnitude over one revolution. */
        verify: () => {
          const steps = 20000;
          const T = 1 / f;
          let peak = 0;
          for (let i = 0; i < steps; i++) {
            const t1 = (i / steps) * T, t2 = ((i + 1) / steps) * T;
            const f1 = n * B * A * Math.cos(omega * t1);
            const f2 = n * B * A * Math.cos(omega * t2);
            peak = Math.max(peak, Math.abs((f2 - f1) / (t2 - t1)));
          }
          return peak;
        },
        verifyTol: 1e-5,
        routes: ["ε_peak = nBAω", "numerically differentiating Φ = nBA cos ωt"],
        working: [
          { eq: `f = \\f{${rpm}}{60} = ${F(f, 3)} \\u{Hz}, omega = 2pi f = ${F(omega, 3)} \\u{rad s^-1}`,
            note: "Revolutions per minute must become radians per second." },
          { eq: `A = ${F(A, 3)} \\u{m^2}`, note: "" },
          { eq: `epsilon_{peak} = nBA\\omega = ${F(emf)} \\u{V}`,
            note: "The EMF is largest when the coil is in the plane of the field — where the flux is " +
                  "momentarily zero but changing fastest. Flux maximum and EMF maximum are a quarter " +
                  "cycle apart, which is the point students most often get backwards." }
        ],
        distractors: [
          { value: n * B * A * f, why: "used the frequency in Hz rather than the angular frequency ω = 2πf" },
          { value: n * B * A * rpm, why: "used rpm directly without converting to radians per second" },
          { value: (n * B * A * omega) / Math.sqrt(2), why: "gave the RMS value; the question asks for the PEAK" },
          { value: B * A * omega, why: "left out the number of turns" }
        ]
      };
    }
  });
})();
