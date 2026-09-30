/* Module 2 — Dynamics: forces, Newton's laws, momentum, impulse, work, energy,
   collisions.  Contract: js/core/gen.js. */
(function () {
  const reg = PHYS.Gen.register;
  const F = (v, n) => PHYS.U.fmtSig(v, n || 3);

  reg({
    id: "m2-newton2-a", mod: "M2", topic: "Newton's laws", diff: 1,
    ask: "acceleration", dim: { m: 1, s: -2 },
    build(r) {
      const m = r.nice(2, 40, 2), Fnet = r.nice(6, 120, 2);
      const a = Fnet / m;
      return {
        givens: { m, Fnet },
        q: `A net force of ${Fnet} \\u{N} acts on a ${m} \\u{kg} crate on a frictionless ` +
           `surface. What is the crate's acceleration?`,
        value: a, units: { m: 1, s: -2 }, sf: 3,
        /* Route B: impulse–momentum. Push for a fixed interval, find the velocity
           gained, and divide by the time. Never touches F = ma. */
        verify: () => {
          const dt = 4;
          const dv = (Fnet * dt) / m;          // impulse = change in momentum
          return dv / dt;
        },
        routes: ["a = F_net/m", "impulse FΔt = mΔv, then a = Δv/Δt"],
        working: [
          { eq: `\\v{F}_{net} = m\\v{a}`, note: "" },
          { eq: `a = \\f{F_{net}}{m} = \\f{${Fnet}}{${m}} = ${F(a)} \\u{m s^-2}`, note: "" }
        ],
        distractors: [
          { value: m / Fnet, why: "divided the wrong way round — mass over force, which has units of s² m⁻¹" },
          { value: Fnet * m, why: "multiplied instead of dividing" },
          { value: Fnet / (m * PHYS.DATA.constants.K("g")),
            why: "divided by the crate's WEIGHT mg instead of its mass; weight is a force, not a mass" },
          { value: Fnet, why: "quoted the force back — a force is not an acceleration" }
        ]
      };
    }
  });

  reg({
    id: "m2-incline-accel", mod: "M2", topic: "Newton's laws", diff: 2,
    ask: "acceleration down a frictionless incline", dim: { m: 1, s: -2 },
    build(r, K) {
      const g = K("g");
      const th = r.pick([10, 15, 20, 25, 30, 35, 40, 45]);
      const a = g * Math.sin(PHYS.U.deg(th));
      const m = r.nice(2, 12, 1);
      return {
        givens: { th, m },
        q: `A ${m} \\u{kg} block slides down a frictionless ramp inclined at ${th}\\deg to the ` +
           `horizontal. What is the magnitude of its acceleration?`,
        value: a, units: { m: 1, s: -2 }, sf: 3,
        /* Route B: energy. Slide a fixed distance, equate mgh to ½mv², then get the
           acceleration from v² = 2as. No force resolution anywhere. */
        verify: () => {
          const d = 5;                                   // any slope distance
          const h = d * Math.sin(PHYS.U.deg(th));
          const v2 = 2 * g * h;                          // from mgh = ½mv²
          return v2 / (2 * d);
        },
        verifyTol: 1e-9,
        diagram: { kind: "incline", angle: th, mass: m },
        routes: ["resolve the weight along the slope: a = g sin θ", "energy: mgh = ½mv², then v² = 2as"],
        working: [
          { eq: `F_{along} = mg\\sin theta`,
            note: "Resolve the weight. The component ALONG the slope drives the motion; " +
                  "the component mg cos θ presses into the surface and is balanced by the normal force." },
          { eq: `ma = mg\\sin theta \\implies a = g\\sin theta`,
            note: "The mass cancels — every frictionless block on this ramp accelerates the same." },
          { eq: `a = ${g}\\sin${th}\\deg = ${F(a)} \\u{m s^-2}`, note: "" }
        ],
        distractors: [
          { value: g * Math.cos(PHYS.U.deg(th)),
            why: "used cos θ — that is the component pressing INTO the ramp, which does not accelerate the block" },
          { value: g, why: "used the full g, which would only apply to a vertical drop (θ = 90°)" },
          { value: g * Math.tan(PHYS.U.deg(th)), why: "used tan θ; that appears in banked-curve and friction problems, not here" },
          { value: m * g * Math.sin(PHYS.U.deg(th)),
            why: "computed the FORCE along the slope in newtons, not the acceleration — divide by the mass" }
        ]
      };
    }
  });

  reg({
    id: "m2-friction-stop", mod: "M2", topic: "Forces and friction", diff: 2,
    ask: "stopping distance with friction", dim: { m: 1 },
    build(r, K) {
      const g = K("g");
      const mu = r.pick([0.2, 0.25, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8]);
      const u = r.nice(8, 28, 1);
      const m = r.nice(400, 1600, 100);
      const d = (u * u) / (2 * mu * g);
      return {
        givens: { mu, u, m },
        q: `A ${m} \\u{kg} car skids to a halt from ${u} \\u{m s^-1}. The coefficient of ` +
           `friction between the tyres and the road is ${mu}. How far does it skid?`,
        value: d, units: { m: 1 }, sf: 3,
        /* Route B: work–energy theorem. The friction force does work equal to the
           whole kinetic energy. Goes through joules rather than accelerations. */
        verify: () => {
          const Ek = 0.5 * m * u * u;
          const Ffric = mu * m * g;
          return Ek / Ffric;
        },
        verifyTol: 1e-9,
        routes: ["a = −μg, then v² = u² + 2as", "work–energy: ½mv² = μmg·d"],
        working: [
          { eq: `F_{fric} = mu mg = ${mu} \\times ${m} \\times ${g} = ${F(mu * m * g)} \\u{N}`, note: "" },
          { eq: `a = \\f{F}{m} = -mu g = ${F(-mu * g)} \\u{m s^-2}`,
            note: "The mass cancels, so the skid distance does not depend on how heavy the car is." },
          { eq: `d = \\f{u^2}{2mu g} = ${F(d)} \\u{m}`,
            note: `Energy gives the same: ½mv² = ${F(0.5 * m * u * u)} J of kinetic energy divided by ` +
                  `${F(mu * m * g)} N of friction.` }
        ],
        distractors: [
          { value: (u * u) / (mu * g), why: "forgot the factor of 2 in v² = u² + 2as" },
          { value: u / (mu * g), why: "used u rather than u²; u/(μg) is the stopping TIME in seconds, not a distance" },
          { value: (u * u) / (2 * mu * g * m), why: "divided by the mass as well — the mass has already cancelled" },
          { value: (u * u) / (2 * g), why: "left out μ, which is the frictionless case: the car would never stop" }
        ]
      };
    }
  });

  reg({
    id: "m2-inelastic-collision", mod: "M2", topic: "Momentum and collisions", diff: 2,
    ask: "velocity after a perfectly inelastic collision", dim: { m: 1, s: -1 },
    build(r) {
      const m1 = r.nice(1, 12, 1), m2 = r.nice(1, 12, 1);
      const u1 = r.nice(2, 14, 1);
      const u2 = r.f() < 0.5 ? 0 : -r.nice(1, 10, 1);
      const v = (m1 * u1 + m2 * u2) / (m1 + m2);
      if (Math.abs(v) < 0.05) return { skip: true };
      return {
        givens: { m1, u1, m2, u2 },
        q: `A ${m1} \\u{kg} trolley moving right at ${u1} \\u{m s^-1} collides with a ` +
           `${m2} \\u{kg} trolley ` +
           (u2 === 0 ? "at rest" : `moving left at ${Math.abs(u2)} \\u{m s^-1}`) +
           `. They stick together. What is their common velocity immediately afterwards? ` +
           `Take right as positive.`,
        value: v, units: { m: 1, s: -1 }, sf: 3,
        /* Route B: work in the centre-of-mass frame. In that frame the total
           momentum is zero, so a perfectly inelastic collision leaves both objects
           at rest — the answer is just the CoM velocity, computed from positions
           rather than from a momentum equation. */
        verify: () => {
          const dt = 3;
          const x1 = u1 * dt, x2 = u2 * dt;
          const comBefore = 0;
          const comAfter = (m1 * x1 + m2 * x2) / (m1 + m2);
          return (comAfter - comBefore) / dt;
        },
        verifyTol: 1e-9,
        routes: ["conservation of momentum", "the centre of mass keeps moving at the same velocity"],
        working: [
          { eq: `p_{before} = m_1u_1 + m_2u_2 = ${m1}(${u1}) + ${m2}(${u2}) = ${F(m1 * u1 + m2 * u2)} \\u{kg m s^-1}`, note: "" },
          { eq: `p_{after} = (m_1 + m_2)v`, note: "They stick, so they share one velocity." },
          { eq: `v = \\f{${F(m1 * u1 + m2 * u2)}}{${m1 + m2}} = ${F(v)} \\u{m s^-1}`,
            note: `Kinetic energy is NOT conserved here: ${F(0.5 * m1 * u1 * u1 + 0.5 * m2 * u2 * u2)} J ` +
                  `before, ${F(0.5 * (m1 + m2) * v * v)} J after. The difference went into ` +
                  `deforming the trolleys and heating them.` }
        ],
        distractors: [
          { value: (u1 + u2) / 2, why: "averaged the velocities, ignoring the masses — that only works if the masses are equal" },
          { value: (m1 * u1 - m2 * u2) / (m1 + m2),
            why: "got a sign wrong: momentum is a vector, so a leftward velocity enters the sum as a negative number" },
          { value: (m1 * u1 + m2 * u2) / m1, why: "divided by the first mass only; after they stick, the moving mass is m₁ + m₂" },
          { value: Math.sqrt(Math.abs((m1 * u1 * u1 + m2 * u2 * u2) / (m1 + m2))),
            why: "tried to conserve kinetic energy; in a collision where the objects stick, energy is lost" }
        ]
      };
    }
  });

  reg({
    id: "m2-elastic-collision", mod: "M2", topic: "Momentum and collisions", diff: 3,
    ask: "velocity of the target after an elastic collision", dim: { m: 1, s: -1 },
    build(r) {
      const m1 = r.nice(1, 8, 1);
      const m2 = r.nice(1, 8, 1);
      const u1 = r.nice(2, 12, 1);
      // Standard 1-D elastic result with a stationary target.
      const v2 = (2 * m1 * u1) / (m1 + m2);
      const v1 = ((m1 - m2) * u1) / (m1 + m2);
      return {
        givens: { m1, m2, u1 },
        q: `A ${m1} \\u{kg} ball moving at ${u1} \\u{m s^-1} strikes a stationary ${m2} \\u{kg} ` +
           `ball head-on. The collision is perfectly elastic. What is the velocity of the ` +
           `${m2} \\u{kg} ball afterwards?`,
        value: v2, units: { m: 1, s: -1 }, sf: 3,
        /* Route B: solve the pair of conservation equations numerically instead of
           quoting the standard result — conserve momentum AND kinetic energy and
           check the resulting v₂ satisfies both. */
        verify: () => {
          const p = m1 * u1;
          const E = 0.5 * m1 * u1 * u1;
          /* Eliminating v₁ from p = m₁v₁ + m₂v₂ and E = ½m₁v₁² + ½m₂v₂² gives a
             quadratic in v₂ whose roots are 0 (no collision) and the answer. */
          const A = 0.5 * m2 * (1 + m2 / m1);
          const B = -(m2 * p) / m1;
          return -B / A;                        // the non-zero root
        },
        verifyTol: 1e-9,
        routes: ["the standard elastic result v₂ = 2m₁u₁/(m₁+m₂)",
                 "solving conservation of momentum and kinetic energy simultaneously"],
        working: [
          { eq: `m_1u_1 = m_1v_1 + m_2v_2`, note: "Momentum is conserved in every collision." },
          { eq: `\\f{1}{2}m_1u_1^2 = \\f{1}{2}m_1v_1^2 + \\f{1}{2}m_2v_2^2`,
            note: "Elastic means kinetic energy is conserved too — that is the extra equation." },
          { eq: `v_2 = \\f{2m_1u_1}{m_1 + m_2} = \\f{2 \\times ${m1} \\times ${u1}}{${m1 + m2}} = ${F(v2)} \\u{m s^-1}`, note: "" },
          { eq: `v_1 = \\f{(m_1 - m_2)u_1}{m_1 + m_2} = ${F(v1)} \\u{m s^-1}`,
            note: m1 < m2 ? "The incoming ball bounces back, because it is the lighter one."
                          : (m1 > m2 ? "The incoming ball keeps going forward, more slowly."
                                     : "Equal masses: the first ball stops dead and the second leaves with all the speed.") }
        ],
        distractors: [
          { value: (m1 * u1) / (m1 + m2), why: "used the perfectly INELASTIC result — that is the common velocity if they stick together" },
          { value: u1, why: "assumed the target simply takes the incoming speed; that only happens when the masses are equal" },
          { value: (m1 * u1) / m2, why: "conserved momentum but forgot the incoming ball is still moving after the collision" },
          { value: ((m1 - m2) * u1) / (m1 + m2), why: "this is v₁, the velocity of the INCOMING ball afterwards" }
        ]
      };
    }
  });

  reg({
    id: "m2-impulse-graph", mod: "M2", topic: "Momentum and collisions", diff: 2,
    ask: "final speed after an impulse", dim: { m: 1, s: -1 },
    build(r) {
      const m = r.nice(0.2, 3, 0.2);
      const Fpeak = r.nice(20, 300, 10);
      const dur = r.nice(0.02, 0.4, 0.02);
      const J = 0.5 * Fpeak * dur;                 // triangular force pulse
      const v = J / m;
      return {
        givens: { m, Fpeak, dur },
        q: `A ${F(m, 2)} \\u{kg} ball is at rest when it is struck. The force on it rises ` +
           `linearly from zero to ${Fpeak} \\u{N} and back to zero over ${F(dur, 2)} \\u{s}. ` +
           `What speed does the ball leave with?`,
        value: v, units: { m: 1, s: -1 }, sf: 3,
        /* Route B: integrate the force pulse numerically and step the velocity
           forward. Nothing here uses the triangle-area shortcut. */
        verify: () => {
          const n = 20000;
          const dt = dur / n;
          let vel = 0;
          for (let i = 0; i < n; i++) {
            const tm = (i + 0.5) * dt;
            const f = tm < dur / 2 ? (2 * Fpeak / dur) * tm
                                   : (2 * Fpeak / dur) * (dur - tm);
            vel += (f / m) * dt;
          }
          return vel;
        },
        verifyTol: 1e-6,
        graph: { kind: "ft-triangle", Fpeak, dur },
        routes: ["impulse = area under the F–t graph", "numerical integration of F/m over the pulse"],
        working: [
          { eq: `J = \\text{area} = \\f{1}{2} \\times ${F(dur, 2)} \\times ${Fpeak} = ${F(J)} \\u{N s}`,
            note: "The area under a force–time graph is the impulse. The PEAK force is not the average force." },
          { eq: `J = Delta p = mv - mu, u = 0`, note: "" },
          { eq: `v = \\f{${F(J)}}{${F(m, 2)}} = ${F(v)} \\u{m s^-1}`, note: "" }
        ],
        distractors: [
          { value: (Fpeak * dur) / m, why: "used the full rectangle instead of the triangle — dropped the factor of ½" },
          { value: Fpeak / m, why: "used the peak force as an acceleration and forgot to multiply by the time" },
          { value: J, why: "gave the impulse in N s rather than dividing by the mass to get a speed" },
          { value: (0.5 * Fpeak * dur * dur) / m, why: "multiplied by the time twice" }
        ]
      };
    }
  });

  reg({
    id: "m2-work-angle", mod: "M2", topic: "Work and energy", diff: 2,
    ask: "work done by a force at an angle", dim: { kg: 1, m: 2, s: -2 },
    build(r) {
      const Fp = r.nice(20, 200, 5);
      const d = r.nice(2, 30, 1);
      /* 0° leaves no cos to get wrong, and at 45° sin = cos and tan = 1, so three of
         the four distractors collapse onto the key or onto each other. Excluding
         both is cheaper and more honest than letting the engine retry a quarter of
         all seeds. */
      const th = r.pick([15, 20, 25, 30, 37, 40, 53, 60, 65]);
      const W = Fp * d * Math.cos(PHYS.U.deg(th));
      return {
        givens: { Fp, d, th },
        q: `A crate is dragged ${d} \\u{m} across level ground by a rope pulled with a force of ` +
           `${Fp} \\u{N} at ${th}\\deg above the horizontal. How much work does the rope do on ` +
           `the crate?`,
        value: W, units: { kg: 1, m: 2, s: -2 }, sf: 3,
        /* Route B: resolve first, then use W = F·d with the horizontal component
           only — and confirm the vertical component does no work because the
           displacement has no vertical part. */
        verify: () => {
          const Fx = Fp * Math.cos(PHYS.U.deg(th));
          const Fy = Fp * Math.sin(PHYS.U.deg(th));
          return Fx * d + Fy * 0;
        },
        verifyTol: 1e-9,
        routes: ["W = Fd cos θ", "resolve into components; only the component along the displacement does work"],
        working: [
          { eq: `W = Fd\\cos theta`,
            note: "Only the component of the force ALONG the displacement does work." },
          { eq: `W = ${Fp} \\times ${d} \\times \\cos${th}\\deg = ${F(W)} \\u{J}`, note: "" },
          { eq: `F_y = ${Fp}\\sin${th}\\deg = ${F(Fp * Math.sin(PHYS.U.deg(th)))} \\u{N}`,
            note: "The vertical component does no work at all here: the crate does not move vertically, " +
                  "so that force is perpendicular to the displacement." }
        ],
        distractors: [
          { value: Fp * d * Math.sin(PHYS.U.deg(th)),
            why: "used sin θ instead of cos θ — the component along the displacement is F cos θ" },
          { value: Fp * d, why: "ignored the angle; that would be right only if the rope were horizontal" },
          { value: Fp * d * Math.tan(PHYS.U.deg(th)), why: "used tan θ, which does not appear in the work formula" },
          { value: Fp * Math.cos(PHYS.U.deg(th)), why: "left out the distance — this is a force in newtons, not work in joules" }
        ]
      };
    }
  });

  reg({
    id: "m2-power-lift", mod: "M2", topic: "Work and energy", diff: 2,
    ask: "power", dim: { kg: 1, m: 2, s: -3 },
    build(r, K) {
      const g = K("g");
      const m = r.nice(20, 600, 10);
      const h = r.nice(2, 30, 1);
      const t = r.nice(2, 25, 1);
      const P = (m * g * h) / t;
      return {
        givens: { m, h, t },
        q: `A hoist raises a ${m} \\u{kg} load ${h} \\u{m} at a steady speed in ${t} \\u{s}. ` +
           `What is the hoist's minimum power output?`,
        value: P, units: { kg: 1, m: 2, s: -3 }, sf: 3,
        // Route B: P = Fv, using the steady lifting speed. No energy total involved.
        verify: () => {
          const v = h / t;
          return (m * g) * v;
        },
        verifyTol: 1e-9,
        routes: ["P = W/t with W = mgh", "P = Fv with F = mg and v = h/t"],
        working: [
          { eq: `W = mgh = ${m} \\times ${g} \\times ${h} = ${F(m * g * h)} \\u{J}`,
            note: "At a steady speed the kinetic energy does not change, so all the work goes into height." },
          { eq: `P = \\f{W}{t} = \\f{${F(m * g * h)}}{${t}} = ${F(P)} \\u{W}`, note: "" },
          { eq: `P = Fv = ${F(m * g)} \\times ${F(h / t)} = ${F(P)} \\u{W}`,
            note: "The same answer through force × speed, which is often quicker." }
        ],
        distractors: [
          { value: (m * h) / t, why: "left out g — mass is not a force, so mh/t is not a power" },
          { value: m * g * h, why: "gave the work done in joules rather than dividing by the time" },
          { value: (m * g * h) / (t * t), why: "divided by the time twice" },
          { value: (m * g * h * t), why: "multiplied by the time instead of dividing" }
        ]
      };
    }
  });

  reg({
    id: "m2-ke-from-momentum", mod: "M2", topic: "Work and energy", diff: 3,
    ask: "kinetic energy from momentum", dim: { kg: 1, m: 2, s: -2 },
    build(r) {
      const m = r.nice(0.5, 20, 0.5);
      const p = r.nice(4, 120, 2);
      const Ek = (p * p) / (2 * m);
      return {
        givens: { m, p },
        q: `An object of mass ${F(m, 3)} \\u{kg} has momentum of magnitude ${p} \\u{kg m s^-1}. ` +
           `What is its kinetic energy?`,
        value: Ek, units: { kg: 1, m: 2, s: -2 }, sf: 3,
        // Route B: recover the speed first, then ½mv². Different order of operations.
        verify: () => {
          const v = p / m;
          return 0.5 * m * v * v;
        },
        verifyTol: 1e-9,
        routes: ["E_k = p²/2m", "v = p/m, then E_k = ½mv²"],
        working: [
          { eq: `p = mv \\implies v = \\f{p}{m} = \\f{${p}}{${F(m, 3)}} = ${F(p / m)} \\u{m s^-1}`, note: "" },
          { eq: `E_k = \\f{1}{2}mv^2 = ${F(Ek)} \\u{J}`, note: "" },
          { eq: `E_k = \\f{p^2}{2m}`,
            note: "Worth memorising. Note that doubling the momentum QUADRUPLES the kinetic " +
                  "energy — momentum is linear in v, kinetic energy is quadratic." }
        ],
        distractors: [
          { value: (p * p) / m, why: "forgot the factor of ½" },
          { value: p / (2 * m), why: "used p rather than p²" },
          { value: 0.5 * m * p, why: "substituted the momentum where the SPEED belongs in ½mv²" },
          { value: (p * m) / 2, why: "multiplied by the mass instead of dividing by it" }
        ]
      };
    }
  });

  reg({
    id: "m2-atwood", mod: "M2", topic: "Newton's laws", diff: 3,
    ask: "acceleration of a two-mass pulley system", dim: { m: 1, s: -2 },
    build(r, K) {
      const g = K("g");
      let m1 = r.nice(1, 9, 1), m2 = r.nice(1, 9, 1);
      if (m1 === m2) m2 = m1 + r.pick([1, 2, 3]);
      const heavy = Math.max(m1, m2), light = Math.min(m1, m2);
      const a = ((heavy - light) * g) / (heavy + light);
      return {
        givens: { heavy, light },
        q: `Two masses, ${heavy} \\u{kg} and ${light} \\u{kg}, hang from either end of a light ` +
           `string over a frictionless pulley. What is the magnitude of their acceleration?`,
        value: a, units: { m: 1, s: -2 }, sf: 3,
        /* Route B: find the tension from one mass's equation, then use it in the
           other's. If the tension is wrong the two accelerations disagree. */
        verify: () => {
          const T = (2 * heavy * light * g) / (heavy + light);
          const aHeavy = (heavy * g - T) / heavy;        // heavy side, downwards
          const aLight = (T - light * g) / light;        // light side, upwards
          if (Math.abs(aHeavy - aLight) > 1e-9) throw new Error("tension route inconsistent");
          return aHeavy;
        },
        verifyTol: 1e-9,
        diagram: { kind: "pulley", m1: heavy, m2: light },
        routes: ["treat the system as one mass: a = (m₁−m₂)g/(m₁+m₂)",
                 "find the tension, then apply F = ma to each mass separately"],
        working: [
          { eq: `F_{net} = (m_1 - m_2)g = (${heavy} - ${light}) \\times ${g} = ${F((heavy - light) * g)} \\u{N}`,
            note: "Only the DIFFERENCE in the weights is unbalanced — the string transmits the rest." },
          { eq: `m_{total} = ${heavy + light} \\u{kg}`,
            note: "Both masses accelerate, so both are being moved by that net force." },
          { eq: `a = \\f{${F((heavy - light) * g)}}{${heavy + light}} = ${F(a)} \\u{m s^-2}`,
            note: `The tension is ${F((2 * heavy * light * g) / (heavy + light))} N — between the two ` +
                  `weights, as it must be.` }
        ],
        distractors: [
          { value: ((heavy - light) * g) / heavy, why: "divided by the heavy mass alone; the light mass is accelerating too" },
          { value: ((heavy + light) * g) / (heavy + light), why: "added the weights instead of subtracting — then nothing would ever be unbalanced" },
          { value: g, why: "used free fall; the string holds both masses back" },
          { value: ((heavy - light) * g) / light, why: "divided by the light mass alone" }
        ]
      };
    }
  });

  reg({
    id: "m2-lift-tension", mod: "M2", topic: "Newton's laws", diff: 2,
    ask: "apparent weight in an accelerating lift", dim: { kg: 1, m: 1, s: -2 },
    build(r, K) {
      const g = K("g");
      const m = r.nice(40, 95, 5);
      const up = r.f() < 0.5;
      const a = r.nice(0.5, 3.5, 0.5) * (up ? 1 : -1);
      const N = m * (g + a);
      return {
        givens: { m, a },
        q: `A ${m} \\u{kg} student stands on bathroom scales in a lift. The lift accelerates ` +
           `${up ? "upwards" : "downwards"} at ${Math.abs(a)} \\u{m s^-2}. What reading, as a ` +
           `force, do the scales show?`,
        value: N, units: { kg: 1, m: 1, s: -2 }, sf: 3,
        /* Route B: work in the lift's (non-inertial) frame, where the student is
           static under weight, normal force and an inertial force −ma. */
        verify: () => {
          // Static in the lift frame: N − mg − m·a_frame = 0, with a_frame = a.
          return m * g + m * a;
        },
        verifyTol: 1e-12,
        routes: ["N − mg = ma in the ground frame", "statics in the lift frame with an inertial force −ma"],
        working: [
          { eq: `N - mg = ma`, note: "Up is positive. The scales read the NORMAL force N, not the weight." },
          { eq: `N = m(g + a) = ${m}(${g} ${a >= 0 ? "+" : "-"} ${Math.abs(a)})`, note: "" },
          { eq: `N = ${F(N)} \\u{N}`,
            note: `True weight is mg = ${F(m * g)} N. Accelerating ${up ? "upwards makes the reading larger" :
                   "downwards makes the reading smaller"} — the student feels ${up ? "heavier" : "lighter"}, ` +
                  `but their mass has not changed.` }
        ],
        distractors: [
          { value: m * g, why: "gave the true weight; the scales read the normal force, which differs whenever the lift accelerates" },
          { value: m * (g - a), why: "got the sign of the acceleration the wrong way round" },
          { value: m * Math.abs(a), why: "used ma alone, leaving out gravity" },
          { value: m, why: "gave the mass in kilograms; the question asks for a force in newtons" }
        ]
      };
    }
  });

  reg({
    id: "m2-recoil", mod: "M2", topic: "Momentum and collisions", diff: 2,
    ask: "recoil speed", dim: { m: 1, s: -1 },
    build(r) {
      const M = r.nice(2, 80, 2);
      const m = r.nice(0.005, 0.5, 0.005);
      const v = r.nice(80, 500, 10);
      const V = (m * v) / M;
      return {
        givens: { M, m, v },
        q: `A ${M} \\u{kg} object at rest ejects a ${F(m, 3)} \\u{kg} projectile at ` +
           `${v} \\u{m s^-1}. What is the recoil speed of the object?`,
        value: V, units: { m: 1, s: -1 }, sf: 3,
        /* Route B: equal and opposite impulses. Pick an ejection time, get the force
           on the projectile, and apply the same force back on the object. */
        verify: () => {
          const dt = 0.004;
          const Fon = (m * v) / dt;              // force on the projectile
          return (Fon * dt) / M;                 // Newton's third law, back on the object
        },
        verifyTol: 1e-9,
        routes: ["total momentum stays zero", "Newton's third law: equal and opposite impulses"],
        working: [
          { eq: `p_{before} = 0`, note: "Nothing is moving, so the total momentum is zero — and stays zero." },
          { eq: `0 = MV + mv \\implies V = -\\f{mv}{M}`, note: "" },
          { eq: `|V| = \\f{${F(m, 3)} \\times ${v}}{${M}} = ${F(V)} \\u{m s^-1}`,
            note: `Opposite in direction to the projectile. Note the kinetic energies are NOT equal: ` +
                  `${F(0.5 * m * v * v)} J in the projectile against ${F(0.5 * M * V * V)} J in the recoil. ` +
                  `Equal momenta, very unequal energies — E_k = p²/2m, so the lighter body gets far more.` }
        ],
        distractors: [
          { value: v, why: "assumed the recoil speed equals the projectile's speed; the MOMENTA match, not the speeds" },
          { value: (M * v) / m, why: "inverted the mass ratio — the heavy object recoils slowly, not quickly" },
          { value: (m * v) / (M + m), why: "used the combined mass, as if the two were still joined" },
          { value: v * Math.sqrt(m / M), why: "equated kinetic energies rather than momenta" }
        ]
      };
    }
  });

  reg({
    id: "m2-ramp-with-friction", mod: "M2", topic: "Work and energy", diff: 3,
    ask: "speed at the bottom of a ramp with friction", dim: { m: 1, s: -1 },
    build(r, K) {
      const g = K("g");
      const m = r.nice(1, 20, 1);
      const th = r.pick([20, 25, 30, 35, 40]);
      const d = r.nice(3, 20, 1);
      const mu = r.pick([0.1, 0.15, 0.2, 0.25, 0.3]);
      const rad = PHYS.U.deg(th);
      const anet = g * (Math.sin(rad) - mu * Math.cos(rad));
      if (anet <= 0.2) return { skip: true };
      const v = Math.sqrt(2 * anet * d);
      return {
        givens: { m, th, d, mu },
        q: `A ${m} \\u{kg} box is released from rest and slides ${d} \\u{m} down a ramp inclined ` +
           `at ${th}\\deg. The coefficient of friction is ${mu}. How fast is it moving at the ` +
           `bottom of that ${d} \\u{m}?`,
        value: v, units: { m: 1, s: -1 }, sf: 3,
        /* Route B: energy accounting in joules — gravitational PE released minus the
           work done against friction equals the kinetic energy gained. */
        verify: () => {
          const h = d * Math.sin(rad);
          const Ep = m * g * h;
          const Wfric = mu * m * g * Math.cos(rad) * d;
          return Math.sqrt((2 * (Ep - Wfric)) / m);
        },
        verifyTol: 1e-9,
        diagram: { kind: "incline", angle: th, mass: m, friction: true },
        routes: ["net acceleration g(sin θ − μ cos θ), then v² = 2as",
                 "energy: mgh − μmg cos θ·d = ½mv²"],
        working: [
          { eq: `a = g(\\sin theta - mu\\cos theta) = ${g}(\\sin${th}\\deg - ${mu}\\cos${th}\\deg)`,
            note: "Gravity drives it down the slope; friction acts up the slope and depends on the " +
                  "NORMAL force, which is mg cos θ." },
          { eq: `a = ${F(anet)} \\u{m s^-2}`, note: "The mass cancels again." },
          { eq: `v = \\sqrt{2 \\times ${F(anet)} \\times ${d}} = ${F(v)} \\u{m s^-1}`,
            note: `By energy: ${F(m * g * d * Math.sin(rad))} J released by the drop, ` +
                  `${F(mu * m * g * Math.cos(rad) * d)} J lost to friction, ` +
                  `${F(0.5 * m * v * v)} J left as kinetic energy.` }
        ],
        distractors: [
          { value: Math.sqrt(2 * g * Math.sin(rad) * d), why: "ignored friction entirely" },
          { value: Math.sqrt(Math.abs(2 * g * (Math.sin(rad) - mu) * d)),
            why: "used μ rather than μ cos θ — the friction force depends on the normal force mg cos θ, not on mg" },
          { value: Math.sqrt(2 * g * (Math.cos(rad) - mu * Math.sin(rad)) * d),
            why: "swapped sin and cos when resolving the weight" },
          { value: 2 * anet * d, why: "did not take the square root — this is v², not v" }
        ]
      };
    }
  });
})();
