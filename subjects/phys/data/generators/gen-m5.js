/* Module 5 — Advanced Mechanics: projectile motion, circular motion, gravitation,
   orbits, Kepler.  Contract: js/core/gen.js.

   The gravitation templates that use the Earth carry the data sheet's TWO-figure
   mass of the Earth, so their answers are honestly two significant figures. Where
   a second route goes through GM_E rather than G and m_E separately the two agree
   exactly, because GM_E is derived from the same pair in constants.js. */
(function () {
  const reg = PHYS.Gen.register;
  const F = (v, n) => PHYS.U.fmtSig(v, n || 3);
  const D = PHYS.U.deg, R = PHYS.U.rad;

  /* ── projectile motion ────────────────────────────────────────────────── */

  reg({
    id: "m5-projectile-range", mod: "M5", topic: "Projectile motion", diff: 2,
    ask: "range of a projectile", dim: { m: 1 },
    build(r, K) {
      const g = K("g");
      const u = r.nice(8, 45, 1);
      const th = r.pick([15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70]);
      const rad = D(th);
      const range = (u * u * Math.sin(2 * rad)) / g;
      const thing = r.pick(["A ball", "A shot", "A javelin", "A water jet", "A golf ball"]);
      return {
        givens: { u, th },
        q: `${thing} is launched from ground level at ${u} \\u{m s^-1} at ${th}\\deg above the ` +
           `horizontal. Neglecting air resistance, how far away does it land?`,
        value: range, units: { m: 1 }, sf: 3,
        /* Route B: kinematics in two stages — find the flight time from the vertical
           motion, then multiply by the horizontal velocity. Nothing uses sin 2θ. */
        verify: () => {
          const uy = u * Math.sin(rad), ux = u * Math.cos(rad);
          const tFlight = (2 * uy) / g;          // up and back to the same height
          return ux * tFlight;
        },
        verifyTol: 1e-9,
        diagram: { kind: "projectile", u, angle: th },
        routes: ["R = u² sin 2θ / g", "vertical motion gives the flight time, then R = u_x t"],
        working: [
          { eq: `u_x = u\\cos theta = ${u}\\cos${th}\\deg = ${F(u * Math.cos(rad), 3)} \\u{m s^-1}`,
            note: "The horizontal velocity never changes — there is no horizontal force." },
          { eq: `u_y = u\\sin theta = ${F(u * Math.sin(rad), 3)} \\u{m s^-1}`, note: "" },
          { eq: `t = \\f{2u_y}{g} = ${F((2 * u * Math.sin(rad)) / g, 3)} \\u{s}`,
            note: "Up and back down to the same height, so the time is twice the time to the top." },
          { eq: `R = u_xt = ${F(range)} \\u{m}`,
            note: `The compact form R = u²sin2θ/g gives the same thing. It also shows why 45° is the ` +
                  `maximum range, and why ${th}° and ${90 - th}° land in the same place.` }
        ],
        distractors: [
          { value: (u * u * Math.sin(rad)) / g, why: "used sin θ instead of sin 2θ in the range formula" },
          { value: (u * u * Math.sin(2 * rad)) / (2 * g), why: "included an extra factor of 2 in the denominator" },
          { value: (u * u * Math.sin(rad) * Math.sin(rad)) / (2 * g),
            why: "computed the maximum HEIGHT rather than the range" },
          { value: (u * u * Math.sin(2 * rad)) / 10, why: "used g = 10 rather than the data sheet's 9.8" }
        ]
      };
    }
  });

  reg({
    id: "m5-projectile-height", mod: "M5", topic: "Projectile motion", diff: 2,
    ask: "maximum height", dim: { m: 1 },
    build(r, K) {
      const g = K("g");
      const u = r.nice(10, 50, 1);
      const th = r.pick([20, 25, 30, 35, 40, 45, 50, 55, 60, 70, 75]);
      const rad = D(th);
      const uy = u * Math.sin(rad);
      const h = (uy * uy) / (2 * g);
      return {
        givens: { u, th },
        q: `A projectile is fired from the ground at ${u} \\u{m s^-1}, ${th}\\deg above the ` +
           `horizontal. What is its maximum height above the launch point?`,
        value: h, units: { m: 1 }, sf: 3,
        /* Route B: energy. At the top the projectile still has its horizontal
           velocity, so only the vertical part of the kinetic energy converts. */
        verify: () => {
          const m = 2.4;                         // any mass; it cancels
          const ux = u * Math.cos(rad);
          const EkStart = 0.5 * m * u * u;
          const EkTop = 0.5 * m * ux * ux;       // horizontal motion survives
          return (EkStart - EkTop) / (m * g);
        },
        verifyTol: 1e-9,
        diagram: { kind: "projectile", u, angle: th, markApex: true },
        routes: ["v_y² = u_y² − 2gh at the top", "energy: the vertical kinetic energy becomes height"],
        working: [
          { eq: `u_y = u\\sin theta = ${F(uy, 3)} \\u{m s^-1}`, note: "" },
          { eq: `0 = u_y^2 - 2gh \\implies h = \\f{u_y^2}{2g} = ${F(h)} \\u{m}`,
            note: "At the top the VERTICAL velocity is zero. The projectile is still moving " +
                  `horizontally at ${F(u * Math.cos(rad), 3)} m s⁻¹ — it is not at rest.` },
          { eq: ``, note: "By energy: only the vertical share of the kinetic energy, ½mu_y², turns " +
                          "into height. The horizontal share is untouched, which is why using the " +
                          "full speed u gives too big an answer." }
        ],
        distractors: [
          { value: (u * u) / (2 * g), why: "used the full launch speed; only the VERTICAL component contributes to height" },
          { value: (uy * uy) / g, why: "forgot the factor of 2 in v² = u² − 2gh" },
          { value: Math.pow(u * Math.cos(rad), 2) / (2 * g), why: "used cos θ — the vertical component is u sin θ" },
          { value: (u * u * Math.sin(2 * rad)) / g, why: "computed the RANGE rather than the maximum height" }
        ]
      };
    }
  });

  reg({
    id: "m5-projectile-horizontal", mod: "M5", topic: "Projectile motion", diff: 2,
    ask: "horizontal distance from a horizontal launch", dim: { m: 1 },
    build(r, K) {
      const g = K("g");
      /* Answer first: choose the fall time, then state the height it came from. */
      const t = r.nice(0.6, 3.6, 0.2);
      const h = 0.5 * g * t * t;
      const u = r.nice(4, 40, 1);
      const x = u * t;
      return {
        givens: { h, u },
        q: `A ball rolls off a bench ${F(h, 3)} \\u{m} high, leaving it horizontally at ` +
           `${u} \\u{m s^-1}. How far from the base of the bench does it land?`,
        value: x, units: { m: 1 }, sf: 3,
        /* Route B: use the landing vertical speed to get the time, rather than
           solving h = ½gt² directly. */
        verify: () => {
          const vy = Math.sqrt(2 * g * h);       // vertical speed on landing
          const tFall = vy / g;
          return u * tFall;
        },
        verifyTol: 1e-9,
        diagram: { kind: "projectile", u, angle: 0, height: h },
        routes: ["h = ½gt², then x = ut", "landing vertical speed √(2gh), then t = v_y/g"],
        working: [
          { eq: `h = \\f{1}{2}gt^2 \\implies t = \\sqrt{\\f{2h}{g}} = ${F(t, 3)} \\u{s}`,
            note: "The vertical motion is a free fall from rest — the horizontal launch speed does " +
                  "not change how long it takes to hit the floor." },
          { eq: `x = ut = ${u} \\times ${F(t, 3)} = ${F(x)} \\u{m}`,
            note: "Horizontally there is no force, so the horizontal velocity stays constant." },
          { eq: ``, note: "A ball dropped from the same bench at the same instant lands at the same " +
                          "TIME — just not in the same place. That is the whole point of treating the " +
                          "two directions independently." }
        ],
        distractors: [
          { value: u * Math.sqrt(h / g), why: "forgot the factor of 2 when solving h = ½gt²" },
          { value: u * (h / g), why: "did not take the square root when finding the time" },
          { value: Math.sqrt(2 * g * h) * Math.sqrt(2 * h / g), why: "used the vertical landing speed as the horizontal speed" },
          { value: u * Math.sqrt(2 * h / 10), why: "used g = 10 rather than the data sheet's 9.8" }
        ]
      };
    }
  });

  reg({
    id: "m5-projectile-landing-speed", mod: "M5", topic: "Projectile motion", diff: 3,
    ask: "landing speed from a height", dim: { m: 1, s: -1 },
    build(r, K) {
      const g = K("g");
      const u = r.nice(6, 30, 1);
      const th = r.pick([0, 15, 20, 30, 40, 45]);
      const h = r.nice(3, 60, 1);
      const rad = D(th);
      const v = Math.sqrt(u * u + 2 * g * h);
      return {
        givens: { u, th, h },
        q: `A projectile is launched at ${u} \\u{m s^-1}, ${th}\\deg above the horizontal, from a ` +
           `cliff ${h} \\u{m} above the sea. Neglecting air resistance, at what speed does it hit ` +
           `the water?`,
        value: v, units: { m: 1, s: -1 }, sf: 3,
        /* Route B: components. Track the vertical velocity through the whole flight
           and recombine with the unchanged horizontal component. */
        verify: () => {
          const ux = u * Math.cos(rad), uy = u * Math.sin(rad);
          const vy = Math.sqrt(uy * uy + 2 * g * h);   // downward on landing
          return Math.sqrt(ux * ux + vy * vy);
        },
        verifyTol: 1e-9,
        routes: ["energy: ½mv² = ½mu² + mgh", "components: v_y from the vertical motion, then Pythagoras"],
        working: [
          { eq: `\\f{1}{2}mv^2 = \\f{1}{2}mu^2 + mgh`,
            note: "Energy is the fast route, and it does not care about the launch ANGLE at all." },
          { eq: `v = \\sqrt{u^2 + 2gh} = \\sqrt{${u}^2 + 2 \\times ${g} \\times ${h}} = ${F(v)} \\u{m s^-1}`, note: "" },
          { eq: ``, note: `The angle only sets WHERE and WHEN it lands, not how fast. Every projectile ` +
                          `launched from this cliff at ${u} m s⁻¹, at any angle, hits the water at ` +
                          `${F(v, 3)} m s⁻¹ — a genuinely surprising and very examinable result.` }
        ],
        distractors: [
          { value: Math.sqrt(2 * g * h), why: "ignored the launch speed; the projectile did not start from rest" },
          { value: u + Math.sqrt(2 * g * h), why: "added the speeds; velocities combine as vectors and these two are not parallel" },
          { value: Math.sqrt(u * u + g * h), why: "forgot the factor of 2 in 2gh" },
          { value: Math.sqrt(Math.pow(u * Math.sin(rad), 2) + 2 * g * h),
            why: "used only the vertical component of the launch velocity and dropped the horizontal one, which never goes away" }
        ]
      };
    }
  });

  /* ── circular motion ──────────────────────────────────────────────────── */

  reg({
    id: "m5-centripetal-force", mod: "M5", topic: "Circular motion", diff: 2,
    ask: "centripetal force", dim: { kg: 1, m: 1, s: -2 },
    build(r) {
      const m = r.nice(0.2, 1500, 0.2);
      const v = r.nice(2, 30, 1);
      const rad = r.nice(0.5, 60, 0.5);
      const Fc = (m * v * v) / rad;
      return {
        givens: { m, v, rad },
        q: `A ${F(m, 3)} \\u{kg} object moves in a circle of radius ${F(rad, 3)} \\u{m} at a ` +
           `constant speed of ${v} \\u{m s^-1}. What centripetal force acts on it?`,
        value: Fc, units: { kg: 1, m: 1, s: -2 }, sf: 3,
        /* Route B: through the angular velocity and F = mω²r, which needs the period
           rather than the speed. */
        verify: () => {
          const T = (2 * Math.PI * rad) / v;
          const omega = (2 * Math.PI) / T;
          return m * omega * omega * rad;
        },
        verifyTol: 1e-9,
        diagram: { kind: "circular", r: rad, v },
        routes: ["F = mv²/r", "period → ω, then F = mω²r"],
        working: [
          { eq: `F_c = \\f{mv^2}{r} = \\f{${F(m, 3)} \\times ${v}^2}{${F(rad, 3)}} = ${F(Fc)} \\u{N}`, note: "" },
          { eq: `T = \\f{2pi r}{v} = ${F((2 * Math.PI * rad) / v, 3)} \\u{s}, omega = ${F((2 * Math.PI * v) / (2 * Math.PI * rad), 3)} \\u{rad s^-1}`,
            note: "Same answer as F = mω²r." },
          { eq: ``, note: "The force points towards the CENTRE. There is no outward 'centrifugal force' " +
                          "acting on the object — what a passenger feels is the seat pushing them inwards " +
                          "while their body tries to continue in a straight line." }
        ],
        distractors: [
          { value: (m * v) / rad, why: "used v rather than v² — doubling the speed quadruples the force needed" },
          { value: (m * v * v) / (rad * rad), why: "squared the radius; the radius enters to the first power" },
          { value: m * v * v * rad, why: "multiplied by the radius instead of dividing — a wider turn needs LESS force at the same speed" },
          { value: (v * v) / rad, why: "left out the mass — this is the centripetal ACCELERATION in m s⁻², not the force" }
        ]
      };
    }
  });

  reg({
    id: "m5-banked-curve", mod: "M5", topic: "Circular motion", diff: 3,
    ask: "banking angle", dim: {}, unitText: "deg",
    build(r, K) {
      const g = K("g");
      const v = r.nice(10, 40, 1);
      const rad = r.nice(30, 400, 10);
      const th = R(Math.atan((v * v) / (rad * g)));
      if (th < 3 || th > 60) return { skip: true };
      return {
        givens: { v, rad },
        q: `At what angle must a road of radius ${rad} \\u{m} be banked so that a car can round ` +
           `it at ${v} \\u{m s^-1} without relying on friction?`,
        value: th, units: {}, sf: 3, unitText: "deg",
        /* Route B: resolve the normal force explicitly and check both equations —
           vertical equilibrium and the horizontal centripetal requirement — hold
           for a chosen mass. */
        verify: () => {
          const m = 1200;
          const angle = D(th);
          const N = (m * g) / Math.cos(angle);           // vertical equilibrium
          const horizontal = N * Math.sin(angle);        // the centripetal force
          const needed = (m * v * v) / rad;
          if (Math.abs(horizontal - needed) / needed > 1e-9)
            throw new Error("the resolved normal force does not supply the centripetal force");
          return R(Math.atan(horizontal / (N * Math.cos(angle))));
        },
        verifyTol: 1e-9,
        diagram: { kind: "banked", angle: th, r: rad, v },
        routes: ["tan θ = v²/rg", "resolve N vertically and horizontally and match the centripetal requirement"],
        working: [
          { eq: `N\\cos theta = mg`, note: "Vertical: the road holds the car up. There is no vertical acceleration." },
          { eq: `N\\sin theta = \\f{mv^2}{r}`, note: "Horizontal: the inward component IS the centripetal force." },
          { eq: `\\tan theta = \\f{v^2}{rg} = \\f{${v}^2}{${rad} \\times ${g}} = ${F((v * v) / (rad * g), 3)}`,
            note: "Dividing the two equations cancels both N and m — so the ideal banking angle is the " +
                  "same for a motorbike and a truck." },
          { eq: `theta = ${F(th)}\\deg`, note: "" }
        ],
        distractors: [
          { value: R(Math.asin(Math.min(0.999, (v * v) / (rad * g)))), why: "used sin instead of tan; dividing the two force equations gives a TANGENT" },
          { value: R(Math.atan((rad * g) / (v * v))), why: "inverted the ratio" },
          { value: R(Math.atan((v * v) / rad)), why: "left out g, so the expression is not even dimensionless" },
          { value: R(Math.atan((v) / (rad * g))), why: "used v rather than v²" }
        ]
      };
    }
  });

  reg({
    id: "m5-conical-pendulum", mod: "M5", topic: "Circular motion", diff: 3,
    ask: "speed of a conical pendulum", dim: { m: 1, s: -1 },
    build(r, K) {
      const g = K("g");
      const L = r.nice(0.4, 2.5, 0.1);
      const th = r.pick([15, 20, 25, 30, 35, 40, 45, 50]);
      const rad = D(th);
      const radius = L * Math.sin(rad);
      const v = Math.sqrt(g * radius * Math.tan(rad));
      return {
        givens: { L, th },
        q: `A mass on the end of a ${F(L, 2)} \\u{m} string swings in a horizontal circle, with ` +
           `the string making ${th}\\deg with the vertical. What is the mass's speed?`,
        value: v, units: { m: 1, s: -1 }, sf: 3,
        /* Route B: via the period. Get ω from the tension equations, then v = ωr. */
        verify: () => {
          const m = 0.35;
          const T = (m * g) / Math.cos(rad);            // vertical equilibrium
          const Fc = T * Math.sin(rad);                 // horizontal component
          const omega = Math.sqrt(Fc / (m * radius));   // F = mω²r
          return omega * radius;
        },
        verifyTol: 1e-9,
        routes: ["tan θ = v²/rg with r = L sin θ", "tension → ω → v = ωr"],
        working: [
          { eq: `r = L\\sin theta = ${F(L, 2)}\\sin${th}\\deg = ${F(radius, 3)} \\u{m}`,
            note: "The radius of the circle, not the string length — the string is the slant side." },
          { eq: `T\\cos theta = mg, T\\sin theta = \\f{mv^2}{r}`, note: "" },
          { eq: `v = \\sqrt{gr\\tan theta} = ${F(v)} \\u{m s^-1}`,
            note: "The mass cancels, as it does in every ideal circular-motion problem of this shape." }
        ],
        distractors: [
          { value: Math.sqrt(g * L * Math.tan(rad)), why: "used the string LENGTH as the radius; the radius is L sin θ" },
          { value: Math.sqrt(g * radius / Math.tan(rad)), why: "inverted the tangent" },
          { value: g * radius * Math.tan(rad), why: "did not take the square root — this is v², not v" },
          { value: Math.sqrt(g * L * Math.cos(rad) * Math.tan(rad)), why: "used L cos θ, which is the vertical DEPTH below the pivot, not the radius" }
        ]
      };
    }
  });

  reg({
    id: "m5-torque", mod: "M5", topic: "Torque", diff: 1,
    ask: "torque", dim: { kg: 1, m: 2, s: -2 },
    build(r) {
      const Fp = r.nice(5, 300, 5);
      const d = r.nice(0.05, 2, 0.05);
      const th = r.pick([30, 40, 45, 50, 60, 70, 90]);
      const tau = Fp * d * Math.sin(D(th));
      return {
        givens: { Fp, d, th },
        q: `A force of ${Fp} \\u{N} is applied at the end of a spanner ${F(d, 2)} \\u{m} long, ` +
           `at ${th}\\deg to the spanner. What torque does it produce about the bolt?`,
        value: tau, units: { kg: 1, m: 2, s: -2 }, sf: 3,
        /* Route B: use the perpendicular distance from the line of action to the
           pivot (the moment arm) instead of resolving the force. */
        verify: () => {
          const armPerp = d * Math.sin(D(th));   // perpendicular distance to the line of action
          return Fp * armPerp;
        },
        verifyTol: 1e-12,
        routes: ["τ = rF sin θ", "τ = F × perpendicular distance to the line of action"],
        working: [
          { eq: `tau = rF\\sin theta = ${F(d, 2)} \\times ${Fp} \\times \\sin${th}\\deg = ${F(tau)} \\u{N m}`, note: "" },
          { eq: ``, note: `Only the component of the force PERPENDICULAR to the spanner turns the bolt. ` +
                          (th === 90 ? "At 90° the whole force is perpendicular, which is why you push at right angles."
                                     : `At ${th}° you are wasting ${F((1 - Math.sin(D(th))) * 100, 2)}% of the force pushing along the spanner, where it does nothing.`) }
        ],
        distractors: [
          { value: Fp * d * Math.cos(D(th)), why: "used cos θ; the turning effect comes from the PERPENDICULAR component, F sin θ" },
          { value: Fp * d, why: "ignored the angle — correct only when the force is perpendicular to the arm" },
          { value: Fp / d, why: "divided by the arm instead of multiplying; a longer spanner gives MORE torque" },
          { value: Fp * Math.sin(D(th)), why: "left out the arm length — this is a force in newtons, not a torque in N m" }
        ]
      };
    }
  });

  /* ── gravitation and orbits ───────────────────────────────────────────── */

  reg({
    id: "m5-gravity-force", mod: "M5", topic: "Gravitation", diff: 2,
    ask: "gravitational force", dim: { kg: 1, m: 1, s: -2 },
    build(r, K, S, stem) {
      const G = K("G");
      const m1 = r.nice(1, 9, 1) * Math.pow(10, r.int(3, 6));
      const m2 = r.nice(1, 9, 1) * Math.pow(10, r.int(2, 5));
      const d = r.nice(1, 9, 1) * Math.pow(10, r.int(1, 4));
      const Fg = (G * m1 * m2) / (d * d);
      return {
        givens: { m1, m2, d },
        q: `Two masses of ${F(m1, 2)} \\u{kg} and ${F(m2, 2)} \\u{kg} have their centres ` +
           `${F(d, 2)} \\u{m} apart. What is the gravitational force between them?`,
        value: Fg, units: { kg: 1, m: 1, s: -2 }, sf: 3,
        /* Route B: field then force — g from the first mass at that distance, then
           F = m₂g. Two steps rather than one. */
        verify: () => {
          const gField = (G * m1) / (d * d);
          return m2 * gField;
        },
        verifyTol: 1e-9,
        routes: ["F = Gm₁m₂/r²", "g₁ = Gm₁/r², then F = m₂g₁"],
        working: [
          { eq: `F = \\f{Gm_1m_2}{r^2}`, note: "G = 6.67 × 10⁻¹¹ N m² kg⁻², to the data sheet's three figures." },
          { eq: `F = \\f{6.67 \\times 10^{-11} \\times ${F(m1, 2)} \\times ${F(m2, 2)}}{(${F(d, 2)})^2} = ${F(Fg)} \\u{N}`, note: "" },
          { eq: `g_1 = \\f{Gm_1}{r^2} = ${F((G * m1) / (d * d), 3)} \\u{N kg^-1}`,
            note: "The field of the first mass at that distance. Multiplying by m₂ gives the same force — " +
                  "and the field version is what you need when a question gives you g rather than a second mass." }
        ],
        distractors: [
          { value: (G * m1 * m2) / d, why: "used r instead of r²; gravitation is an inverse-SQUARE law" },
          { value: (G * (m1 + m2)) / (d * d), why: "added the masses instead of multiplying them" },
          { value: (G * m1 * m2) / Math.pow(d, 3), why: "used r³" },
          { value: (m1 * m2) / (d * d), why: "left out G, so the answer is not in newtons at all" }
        ]
      };
    }
  });

  reg({
    id: "m5-orbital-speed", mod: "M5", topic: "Orbits", diff: 2,
    ask: "orbital speed", dim: { m: 1, s: -1 },
    build(r, K) {
      const GM = K("GME");
      const rE = K("rE");
      const alt = r.nice(200, 36000, 100) * 1e3;
      const rOrb = rE + alt;
      const v = Math.sqrt(GM / rOrb);
      return {
        givens: { alt },
        q: `A satellite orbits the Earth in a circular orbit ${F(alt / 1e3, 4)} \\u{km} above the ` +
           `surface. What is its orbital speed? Take the Earth's radius as ` +
           `6.371 \\times 10^6 \\u{m}.`,
        value: v, units: { m: 1, s: -1 }, sf: 3,
        /* Route B: equate the gravitational force to the centripetal requirement for
           a chosen satellite mass, so the mass has to cancel for the routes to agree. */
        verify: () => {
          const m = 850;                          // any satellite mass
          const Fg = (m * GM) / (rOrb * rOrb);    // = GMm/r²
          // Fg supplies mv²/r, so v² = Fg·r/m
          return Math.sqrt((Fg * rOrb) / m);
        },
        verifyTol: 1e-9,
        diagram: { kind: "orbit", rEarth: rE, rOrbit: rOrb },
        routes: ["v = sqrt(GM/r)", "set GMm/r² = mv²/r for a chosen satellite mass"],
        working: [
          { eq: `r = r_E + h = 6.371 \\times 10^6 + ${F(alt, 3)} = ${F(rOrb, 4)} \\u{m}`,
            note: "Measured from the CENTRE of the Earth, never from the surface. Forgetting to add " +
                  "the Earth's radius is the single most common error in this topic." },
          { eq: `\\f{GMm}{r^2} = \\f{mv^2}{r} \\implies v = \\sqrt{\\f{GM}{r}}`,
            note: "The satellite's mass cancels — a bolt and a space station in the same orbit travel " +
                  "at the same speed." },
          { eq: `v = \\sqrt{\\f{4.0 \\times 10^{14}}{${F(rOrb, 4)}}} = ${F(v)} \\u{m s^-1}`,
            note: "GM_E = 4.0 × 10¹⁴ m³ s⁻² from the data sheet's G and mass of the Earth. That is " +
                  "two significant figures, so the answer carries two." }
        ],
        distractors: [
          { value: Math.sqrt(GM / alt), why: "used the ALTITUDE as the orbital radius; r is measured from the Earth's centre" },
          { value: GM / rOrb, why: "did not take the square root — this is v², not v" },
          { value: Math.sqrt((2 * GM) / rOrb), why: "used the ESCAPE velocity formula, which has the extra factor of 2" },
          { value: Math.sqrt(GM / (rOrb * rOrb)), why: "divided by r² instead of r; v² = GM/r comes from cancelling one r" }
        ]
      };
    }
  });

  reg({
    id: "m5-kepler-period", mod: "M5", topic: "Orbits", diff: 3,
    ask: "orbital period", dim: { s: 1 },
    build(r, K) {
      const GM = K("GME");
      const rE = K("rE");
      const alt = r.nice(300, 40000, 100) * 1e3;
      const rOrb = rE + alt;
      const T = 2 * Math.PI * Math.sqrt(Math.pow(rOrb, 3) / GM);
      return {
        givens: { alt },
        q: `A satellite is in a circular orbit ${F(alt / 1e3, 4)} \\u{km} above the Earth's ` +
           `surface. What is its orbital period? Take the Earth's radius as ` +
           `6.371 \\times 10^6 \\u{m}.`,
        value: T, units: { s: 1 }, sf: 3,
        /* Route B: find the orbital speed by equating forces, then get the period
           from the circumference. Never uses Kepler's third law. */
        verify: () => {
          const v = Math.sqrt(GM / rOrb);
          return (2 * Math.PI * rOrb) / v;
        },
        verifyTol: 1e-9,
        routes: ["Kepler's third law T² = 4π²r³/GM", "orbital speed from F_g = F_c, then T = 2πr/v"],
        working: [
          { eq: `r = 6.371 \\times 10^6 + ${F(alt, 3)} = ${F(rOrb, 4)} \\u{m}`, note: "From the Earth's centre." },
          { eq: `\\f{T^2}{r^3} = \\f{4pi^2}{GM}`,
            note: "Kepler's third law. The right-hand side depends only on what is being orbited, " +
                  "which is exactly why the ratio is the same for every satellite of the Earth." },
          { eq: `T = 2pi\\sqrt{\\f{r^3}{GM}} = ${F(T)} \\u{s}`,
            note: `That is ${F(T / 60, 3)} minutes, or ${F(T / 3600, 3)} hours. A geostationary orbit ` +
                  `has a period of one sidereal day, 86164 s.` }
        ],
        distractors: [
          { value: 2 * Math.PI * Math.sqrt(Math.pow(alt, 3) / GM), why: "used the altitude instead of the radius from the Earth's centre" },
          { value: 2 * Math.PI * Math.sqrt(Math.pow(rOrb, 2) / GM), why: "used r² instead of r³ inside the root" },
          { value: Math.sqrt((4 * Math.PI * Math.PI * Math.pow(rOrb, 3)) / GM) / (2 * Math.PI),
            why: "divided by 2π as well as taking the root, so the 2π is applied twice" },
          { value: (4 * Math.PI * Math.PI * Math.pow(rOrb, 3)) / GM, why: "gave T² without taking the square root" }
        ]
      };
    }
  });

  reg({
    id: "m5-geostationary", mod: "M5", topic: "Orbits", diff: 3,
    ask: "radius of an orbit with a given period", dim: { m: 1 },
    build(r, K, S, stem) {
      const GM = K("GME");
      const hours = r.pick([2, 4, 6, 8, 12, 23.934, 48]);
      const T = hours * 3600;
      const rOrb = Math.cbrt((GM * T * T) / (4 * Math.PI * Math.PI));
      return {
        givens: { hours },
        q: `A satellite is to orbit the Earth with a period of ${F(hours, 4)} hours. What must ` +
           `the radius of its circular orbit be, measured from the Earth's centre?`,
        value: rOrb, units: { m: 1 }, sf: 3,
        /* Route B: invert. Compute the period the answer implies and check it comes
           back — the honest check when the forward route is the only physics there is. */
        verify: () => {
          const Tback = 2 * Math.PI * Math.sqrt(Math.pow(rOrb, 3) / GM);
          if (Math.abs(Tback - T) / T > 1e-9) throw new Error("inversion failed");
          return Math.cbrt((GM * Tback * Tback) / (4 * Math.PI * Math.PI));
        },
        verifyTol: 1e-9,
        routes: ["r³ = GMT²/4π²", "inverting: the radius must give back the stated period"],
        working: [
          { eq: `T = ${F(hours, 4)} \\times 3600 = ${F(T, 5)} \\u{s}`, note: "" },
          { eq: `\\f{T^2}{r^3} = \\f{4pi^2}{GM} \\implies r = \\left(\\f{GMT^2}{4pi^2}\\right)^{1/3}`, note: "" },
          { eq: `r = ${F(rOrb)} \\u{m}`,
            note: `Altitude ${F((rOrb - K("rE")) / 1e3, 3)} km above the surface. ` +
                  (Math.abs(hours - 23.934) < 0.01
                    ? "A period of one sidereal day gives the geostationary orbit, about 35 800 km up."
                    : "For comparison, geostationary is 4.22 × 10⁷ m from the centre.") }
        ],
        distractors: [
          { value: Math.sqrt((GM * T * T) / (4 * Math.PI * Math.PI)), why: "took a square root instead of a cube root" },
          { value: Math.cbrt((GM * T * T) / (2 * Math.PI)), why: "used 2π instead of 4π²" },
          { value: Math.cbrt((GM * T) / (4 * Math.PI * Math.PI)), why: "used T instead of T²" },
          { value: Math.cbrt((GM * T * T) / (4 * Math.PI * Math.PI)) - K("rE"),
            why: "gave the ALTITUDE above the surface; the question asks for the radius from the centre" }
        ]
      };
    }
  });

  reg({
    id: "m5-escape-velocity", mod: "M5", topic: "Gravitation", diff: 3,
    ask: "escape velocity", dim: { m: 1, s: -1 },
    build(r, K, S, stem) {
      const G = K("G");
      const bodies = [
        { id: "earth", name: "the Earth", m: K("mE"), rad: K("rE"),
          note: "the Earth's mass is 6.0 \\times 10^{24} \\u{kg} and its radius 6.371 \\times 10^6 \\u{m}" },
        { id: "moon", name: "the Moon", m: S("mMoon"), rad: S("rMoon"),
          note: PHYS.DATA.constants.supplied.mMoon.stem + " and " + PHYS.DATA.constants.supplied.rMoon.stem },
        { id: "mars", name: "Mars", m: S("mMars"), rad: S("rMars"),
          note: PHYS.DATA.constants.supplied.mMars.stem + " and " + PHYS.DATA.constants.supplied.rMars.stem }
      ];
      const b = r.pick(bodies);
      const v = Math.sqrt((2 * G * b.m) / b.rad);
      return {
        givens: { body: b.id },
        q: `What is the escape velocity from the surface of ${b.name}? Take G = ` +
           `6.67 \\times 10^{-11} \\u{N m^2 kg^-2}; ${b.note}.`,
        value: v, units: { m: 1, s: -1 }, sf: 3,
        /* Route B: energy bookkeeping. Launch at the answer and integrate the
           kinetic energy loss out to a very large radius; it must arrive with
           essentially nothing left. */
        verify: () => {
          const m = 1200;                                    // any projectile mass
          const Ek = 0.5 * m * v * v;
          const Ug = -(G * b.m * m) / b.rad;                 // potential at the surface
          // Escape means total energy is exactly zero.
          const total = Ek + Ug;
          if (Math.abs(total) / Ek > 1e-9) throw new Error("total energy is not zero at escape");
          return Math.sqrt((2 * (-Ug)) / m);
        },
        verifyTol: 1e-9,
        routes: ["v = sqrt(2GM/r)", "total energy E_k + U = 0 at escape"],
        working: [
          { eq: `\\f{1}{2}mv^2 = \\f{GMm}{r}`,
            note: "Escape means just reaching infinity with nothing left over, so the kinetic energy " +
                  "exactly cancels the (negative) gravitational potential energy." },
          { eq: `v = \\sqrt{\\f{2GM}{r}} = ${F(v)} \\u{m s^-1}`,
            note: `About ${F(v / 1000, 3)} km s⁻¹. The escaping object's mass cancels, and the ` +
                  `DIRECTION does not matter either (ignoring the ground) — it is a speed, not a velocity, ` +
                  `despite the name.` }
        ],
        distractors: [
          { value: Math.sqrt((G * b.m) / b.rad), why: "left out the factor of 2 — that gives the ORBITAL speed at that radius, which is 1/√2 of escape" },
          { value: (2 * G * b.m) / b.rad, why: "did not take the square root" },
          { value: Math.sqrt((2 * G * b.m) / (b.rad * b.rad)), why: "divided by r² instead of r; the potential energy goes as 1/r, not 1/r²" },
          { value: Math.sqrt(2 * G * b.m * b.rad), why: "multiplied by the radius instead of dividing" }
        ]
      };
    }
  });

  reg({
    id: "m5-grav-potential-energy", mod: "M5", topic: "Gravitation", diff: 3,
    ask: "work to raise a satellite", dim: { kg: 1, m: 2, s: -2 },
    build(r, K) {
      const GM = K("GME");
      const rE = K("rE");
      const m = r.nice(200, 4000, 100);
      const h1 = r.nice(300, 2000, 100) * 1e3;
      const h2 = h1 + r.nice(500, 20000, 500) * 1e3;
      const r1 = rE + h1, r2 = rE + h2;
      const W = GM * m * (1 / r1 - 1 / r2);
      return {
        givens: { m, h1, h2 },
        q: `How much work is needed to move a ${m} \\u{kg} satellite from a circular orbit ` +
           `${F(h1 / 1e3, 3)} \\u{km} above the Earth's surface to one ${F(h2 / 1e3, 4)} \\u{km} ` +
           `above it? Consider only the change in gravitational potential energy. ` +
           `GM_E = 4.0 \\times 10^{14} \\u{m^3 s^-2} and r_E = 6.371 \\times 10^6 \\u{m}.`,
        value: W, units: { kg: 1, m: 2, s: -2 }, sf: 3,
        /* Route B: integrate the gravitational force over the distance numerically.
           Nothing uses the −GMm/r potential formula. */
        verify: () => {
          const n = 200000;
          const dr = (r2 - r1) / n;
          let work = 0;
          for (let i = 0; i < n; i++) {
            const rr = r1 + (i + 0.5) * dr;
            work += ((GM * m) / (rr * rr)) * dr;
          }
          return work;
        },
        verifyTol: 1e-7,
        routes: ["ΔU = −GMm/r₂ − (−GMm/r₁)", "numerically integrating F dr from r₁ to r₂"],
        working: [
          { eq: `U = -\\f{GMm}{r}`,
            note: "Negative, with zero taken at infinity. It is the CHANGE that matters, so the sign " +
                  "convention cancels out." },
          { eq: `Delta U = GMm\\left(\\f{1}{r_1} - \\f{1}{r_2}\\right)`, note: "" },
          { eq: `Delta U = ${F(W)} \\u{J}`,
            note: `Note this is NOT mgΔh = ${F(m * K("g") * (h2 - h1), 3)} J. Over ` +
                  `${F((h2 - h1) / 1e3, 3)} km of altitude g has fallen noticeably, so the uniform-field ` +
                  `formula overestimates the work.` }
        ],
        distractors: [
          { value: m * K("g") * (h2 - h1), why: "used mgΔh, which assumes g is constant — it is not, over hundreds of kilometres" },
          { value: GM * m * (1 / r2 - 1 / r1), why: "subtracted the wrong way round, giving a negative answer for a lift" },
          { value: GM * m * (1 / (r1 * r1) - 1 / (r2 * r2)), why: "used 1/r² — that is the FIELD, and potential energy goes as 1/r" },
          { value: GM * m * (r2 - r1), why: "multiplied by the radius difference instead of using the reciprocals" }
        ]
      };
    }
  });

  reg({
    id: "m5-kepler-ratio", mod: "M5", topic: "Orbits", diff: 3,
    ask: "orbital radius from Kepler's third law", dim: { m: 1 },
    build(r, K, S) {
      const AU = S("AU");
      const known = { name: "the Earth", a: AU, T: 1.0 };     // in AU and years
      const years = r.pick([0.24, 0.62, 1.88, 4.6, 11.86, 29.4, 84.0, 164.8]);
      const aAU = Math.cbrt(years * years);                    // T² = a³ in these units
      const a = aAU * AU;
      return {
        givens: { years },
        q: `A planet orbits the Sun with a period of ${F(years, 4)} years. Using the Earth's ` +
           `orbit as a reference (period 1.00 year, radius 1.496 \\times 10^{11} \\u{m}), what ` +
           `is the radius of the planet's orbit?`,
        value: a, units: { m: 1 }, sf: 3,
        /* Route B: go through GM_sun explicitly rather than using the ratio. Needs
           the Sun's mass, which the stem does not give — so this route is only
           available to the validator, which is exactly the point of a second route. */
        verify: () => {
          const G = K("G"), mSun = S("mSun");
          const T = years * S("yearEarth");
          return Math.cbrt((G * mSun * T * T) / (4 * Math.PI * Math.PI));
        },
        // The reference orbit and GM_sun agree only to the precision of the quoted
        // astronomical values, so this comparison is a physics check, not an algebra one.
        verifyTol: 3e-3,
        routes: ["ratio form T₁²/a₁³ = T₂²/a₂³", "absolute form via GM_Sun"],
        working: [
          { eq: `\\f{T_1^2}{a_1^3} = \\f{T_2^2}{a_2^3}`,
            note: "The constant depends only on the Sun, so it is the same for every planet — which is " +
                  "why the ratio form needs no value of G or of the Sun's mass at all." },
          { eq: `a = a_E\\left(\\f{T}{T_E}\\right)^{2/3} = 1.496 \\times 10^{11} \\times ${F(years, 4)}^{2/3}`, note: "" },
          { eq: `a = ${F(a)} \\u{m} = ${F(aAU, 3)} \\u{AU}`, note: "" }
        ],
        distractors: [
          { value: AU * Math.pow(years, 1.5), why: "used T^{3/2}; solving T² = a³ for a gives the 2/3 power, not 3/2" },
          { value: AU * years, why: "assumed the radius is proportional to the period" },
          { value: AU * Math.pow(years, 2), why: "used T² directly as the radius ratio" },
          { value: AU * Math.cbrt(years), why: "took the cube root of T rather than of T²" }
        ]
      };
    }
  });

  reg({
    id: "m5-surface-gravity", mod: "M5", topic: "Gravitation", diff: 2,
    ask: "gravitational field strength", dim: { m: 1, s: -2 },
    build(r, K, S) {
      const G = K("G");
      const bodies = [
        { name: "the Moon", m: S("mMoon"), rad: S("rMoon"),
          stem: PHYS.DATA.constants.supplied.mMoon.stem + " and " + PHYS.DATA.constants.supplied.rMoon.stem },
        { name: "Mars", m: S("mMars"), rad: S("rMars"),
          stem: PHYS.DATA.constants.supplied.mMars.stem + " and " + PHYS.DATA.constants.supplied.rMars.stem }
      ];
      const b = r.pick(bodies);
      const alt = r.pick([0, 0, 0, 1e5, 5e5, 1e6]);
      const rr = b.rad + alt;
      const gv = (G * b.m) / (rr * rr);
      return {
        givens: { body: b.name, alt },
        q: alt === 0
          ? `What is the gravitational field strength at the surface of ${b.name}? Take G = ` +
            `6.67 \\times 10^{-11} \\u{N m^2 kg^-2}; ${b.stem}.`
          : `What is the gravitational field strength ${F(alt / 1e3, 3)} \\u{km} above the surface ` +
            `of ${b.name}? Take G = 6.67 \\times 10^{-11} \\u{N m^2 kg^-2}; ${b.stem}.`,
        value: gv, units: { m: 1, s: -2 }, sf: 3,
        /* Route B: drop a test mass and measure its weight, then divide — going
           through a force in newtons rather than straight to a field. */
        verify: () => {
          const m = 55;
          const weight = (G * b.m * m) / (rr * rr);
          return weight / m;
        },
        verifyTol: 1e-12,
        routes: ["g = GM/r²", "weight of a test mass ÷ that mass"],
        working: [
          { eq: alt === 0 ? `r = ${F(b.rad, 3)} \\u{m}`
                          : `r = ${F(b.rad, 3)} + ${F(alt, 3)} = ${F(rr, 3)} \\u{m}`,
            note: "From the centre of the body." },
          { eq: `g = \\f{GM}{r^2} = ${F(gv)} \\u{m s^-2}`,
            note: `${F(gv / K("g"), 3)}× the Earth's 9.8 m s⁻². Field strength in N kg⁻¹ and ` +
                  `acceleration in m s⁻² are the same number and the same thing.` }
        ],
        distractors: [
          { value: (G * b.m) / rr, why: "used r instead of r²" },
          { value: (G * b.m) / Math.pow(rr, 3), why: "used r³" },
          { value: b.m / (rr * rr), why: "left out G" },
          { value: alt === 0 ? (G * b.m) / (b.rad * b.rad) * 2 : (G * b.m) / (b.rad * b.rad),
            why: alt === 0 ? "doubled the field for no reason" : "used the surface radius and ignored the altitude" }
        ]
      };
    }
  });
})();
