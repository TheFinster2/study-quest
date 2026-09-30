/* Module 1 — Kinematics.  Generator templates; see js/core/gen.js for the contract.

   Every template picks its givens so the ANSWER is clean, not so the givens are
   (brief §5.1), and every one computes its answer a second time by different
   physics. Where no second physical route exists the template inverts: recompute
   a given from the answer and assert the original comes back. */
(function () {
  const G = PHYS.Gen;
  const reg = G.register;

  /* ── straight-line motion ─────────────────────────────────────────────── */

  reg({
    id: "m1-suvat-v", mod: "M1", topic: "Motion in a straight line", diff: 1,
    ask: "final velocity", dim: { m: 1, s: -1 },
    build(r, K) {
      const u = r.nice(2, 20, 1), a = r.nice(1, 6, 0.5), t = r.nice(2, 9, 1);
      const v = u + a * t;
      const s = u * t + 0.5 * a * t * t;
      const vehicle = r.pick(["A cyclist", "A skateboarder", "A train", "A trolley", "A go-kart"]);
      return {
        givens: { u, a, t },
        q: `${vehicle} moving at ${u} \\u{m s^-1} accelerates uniformly at ` +
           `${a} \\u{m s^-2} for ${t} \\u{s}. What is its final velocity?`,
        value: v, units: { m: 1, s: -1 }, sf: 3,
        // Route B: get the displacement independently, then use v² = u² + 2as.
        verify: () => Math.sqrt(u * u + 2 * a * s),
        routes: ["v = u + at", "v^2 = u^2 + 2as, with s from s = ut + ½at^2"],
        working: [
          { eq: `v = u + at`, note: "The one equation with no displacement in it." },
          { eq: `v = ${u} + ${a} \\times ${t}`, note: "" },
          { eq: `v = ${PHYS.U.fmtSig(v, 3)} \\u{m s^-1}`, note: "" }
        ],
        distractors: [
          { value: a * t, why: "left out the initial velocity — this is the CHANGE in velocity, not the final velocity" },
          { value: u + a * t * t, why: "used t² instead of t; that belongs in the displacement equation, not this one" },
          { value: u * t + 0.5 * a * t * t, why: "computed the displacement s = ut + ½at², which is a distance, not a velocity" },
          { value: u - a * t, why: "treated the acceleration as a deceleration" }
        ]
      };
    }
  });

  reg({
    id: "m1-suvat-s", mod: "M1", topic: "Motion in a straight line", diff: 2,
    ask: "displacement", dim: { m: 1 },
    build(r) {
      const u = r.nice(4, 24, 2), a = r.nice(1, 5, 0.5), t = r.nice(3, 10, 1);
      const s = u * t + 0.5 * a * t * t;
      const v = u + a * t;
      return {
        givens: { u, a, t },
        q: `A car travelling at ${u} \\u{m s^-1} accelerates uniformly at ${a} \\u{m s^-2}. ` +
           `How far does it travel in the next ${t} \\u{s}?`,
        value: s, units: { m: 1 }, sf: 3,
        // Route B: the average-velocity form, which needs v rather than a.
        verify: () => ((u + v) / 2) * t,
        routes: ["s = ut + ½at^2", "s = ½(u+v)t, with v from v = u + at"],
        working: [
          { eq: `s = ut + \\f{1}{2}at^2`, note: "" },
          { eq: `s = ${u} \\times ${t} + \\f{1}{2} \\times ${a} \\times ${t}^2`, note: "" },
          { eq: `s = ${PHYS.U.fmtSig(s, 3)} \\u{m}`,
            note: `Check it against s = ½(u+v)t with v = ${PHYS.U.fmtSig(v, 3)} m s⁻¹ — same answer.` }
        ],
        distractors: [
          { value: u * t + a * t * t, why: "dropped the factor of ½ in ½at²" },
          { value: u * t, why: "ignored the acceleration entirely and used distance = speed × time" },
          { value: 0.5 * a * t * t, why: "ignored the initial velocity — that term only vanishes if the object starts from rest" },
          { value: v * t, why: "used the FINAL velocity for the whole trip; the car was slower than that at the start" }
        ]
      };
    }
  });

  reg({
    id: "m1-suvat-a", mod: "M1", topic: "Motion in a straight line", diff: 2,
    ask: "acceleration", dim: { m: 1, s: -2 },
    build(r) {
      /* Answer first: choose a and u, derive the stopping distance, then ask for a. */
      const u = r.nice(15, 32, 1), a = -r.nice(2, 8, 0.5);
      const s = -(u * u) / (2 * a);
      const t = -u / a;
      return {
        givens: { u, s },
        q: `A car braking from ${u} \\u{m s^-1} comes to rest in ${PHYS.U.fmtSig(s, 3)} \\u{m}. ` +
           `What is its acceleration?`,
        value: a, units: { m: 1, s: -2 }, sf: 3,
        // Route B: find the time from the average velocity, then a = (v−u)/t.
        verify: () => (0 - u) / (s / ((u + 0) / 2)),
        routes: ["v^2 = u^2 + 2as", "a = (v−u)/t, with t from s = ½(u+v)t"],
        working: [
          { eq: `v^2 = u^2 + 2as`, note: "No time is given, so this is the equation to reach for." },
          { eq: `0 = ${u}^2 + 2a \\times ${PHYS.U.fmtSig(s, 3)}`, note: "" },
          { eq: `a = ${PHYS.U.fmtSig(a, 3)} \\u{m s^-2}`,
            note: `Negative because it opposes the motion. The stop takes ${PHYS.U.fmtSig(t, 2)} s.` }
        ],
        distractors: [
          { value: -a, why: "gave the magnitude but dropped the sign — the acceleration is opposite to the velocity" },
          { value: -(u * u) / s, why: "forgot the factor of 2 in v² = u² + 2as" },
          { value: -u / s, why: "used u rather than u², treating v² = u² + 2as as if it were v = u + as" },
          { value: -(u / 2) / s, why: "divided the average velocity by the distance, which is not an acceleration at all" }
        ]
      };
    }
  });

  reg({
    id: "m1-freefall-time", mod: "M1", topic: "Motion in a straight line", diff: 1,
    ask: "time of fall", dim: { s: 1 },
    build(r, K) {
      const g = K("g");
      /* Answer first: pick the fall time, then state the height it implies. */
      const t = r.nice(1.2, 4.4, 0.2);
      const h = 0.5 * g * t * t;
      const from = r.pick(["a bridge", "a cliff", "a balcony", "a diving platform", "a crane"]);
      return {
        givens: { h },
        q: `A stone is dropped from rest from ${from} ${PHYS.U.fmtSig(h, 3)} \\u{m} above the ` +
           `ground. Ignoring air resistance, how long does it take to land?`,
        value: t, units: { s: 1 }, sf: 3,
        // Route B: landing speed from energy, then t = v/g. Different physics.
        verify: () => Math.sqrt(2 * g * h) / g,
        routes: ["s = ½gt^2", "v = sqrt(2gh) from energy, then t = v/g"],
        working: [
          { eq: `s = ut + \\f{1}{2}gt^2, u = 0`, note: "Dropped from rest, so the ut term is zero." },
          { eq: `${PHYS.U.fmtSig(h, 3)} = \\f{1}{2} \\times ${g} \\times t^2`, note: "" },
          { eq: `t = \\sqrt{\\f{2 \\times ${PHYS.U.fmtSig(h, 3)}}{${g}}} = ${PHYS.U.fmtSig(t, 3)} \\u{s}`,
            note: `Use g = ${g} m s⁻², the data sheet's value.` }
        ],
        distractors: [
          { value: Math.sqrt(h / g), why: "forgot the factor of 2 — dropping the ½ from ½gt² doubles what is under the root" },
          { value: h / g, why: "did not take the square root; h/g has units of s², not s" },
          { value: Math.sqrt(2 * h / 10), why: "used g = 10 rather than the data sheet's 9.8" },
          { value: Math.sqrt(2 * g * h), why: "computed the landing SPEED, not the time" }
        ]
      };
    }
  });

  reg({
    id: "m1-freefall-speed", mod: "M1", topic: "Motion in a straight line", diff: 1,
    ask: "landing speed", dim: { m: 1, s: -1 },
    build(r, K) {
      const g = K("g");
      const h = r.nice(8, 90, 1);
      const v = Math.sqrt(2 * g * h);
      return {
        givens: { h },
        q: `An object is released from rest ${h} \\u{m} above the ground. Neglecting air ` +
           `resistance, at what speed does it hit the ground?`,
        value: v, units: { m: 1, s: -1 }, sf: 3,
        /* Route B: conservation of energy, computed through explicit energy
           quantities rather than the rearranged formula. The two routes reduce to
           the same algebra — as the brief's own table acknowledges for this family
           — but they are separate code paths, so a dropped ½ or a stray mass in
           either one shows up as a disagreement. */
        verify: () => {
          const m = 3.7;                       // any mass; it must cancel
          const Ep = m * g * h;                // gravitational PE lost
          return Math.sqrt(2 * Ep / m);        // all of it becomes KE
        },
        verifyTol: 1e-9,
        routes: ["v^2 = u^2 + 2as", "½mv^2 = mgh (energy), with the mass cancelling"],
        working: [
          { eq: `v^2 = u^2 + 2gh = 0 + 2 \\times ${g} \\times ${h}`, note: "" },
          { eq: `v = ${PHYS.U.fmtSig(v, 3)} \\u{m s^-1}`,
            note: "Energy gives the same thing: ½mv² = mgh, so v = √(2gh) — the mass cancels, " +
                  "which is why a heavy and a light object land together." }
        ],
        distractors: [
          { value: Math.sqrt(g * h), why: "forgot the factor of 2 in v² = 2gh" },
          { value: 2 * g * h, why: "did not take the square root — this is v², not v" },
          { value: g * Math.sqrt(2 * h / g), why: "correct method but used the time as if it were the speed at one point; check your units" },
          { value: Math.sqrt(2 * 10 * h), why: "used g = 10 rather than the data sheet's 9.8" }
        ]
      };
    }
  });

  reg({
    id: "m1-avg-velocity-legs", mod: "M1", topic: "Motion in a straight line", diff: 2,
    ask: "average speed", dim: { m: 1, s: -1 },
    build(r) {
      /* The classic: the average of two speeds is not the average speed. Answer
         first — choose the two leg times so the harmonic mean is not ugly. */
      const d = r.nice(60, 300, 20);
      const v1 = r.nice(10, 25, 1);
      const v2 = r.nice(30, 60, 2);
      const t1 = d / v1, t2 = d / v2;
      const vavg = (2 * d) / (t1 + t2);
      return {
        givens: { d, v1, v2 },
        q: `A courier rides ${d} \\u{m} at ${v1} \\u{m s^-1}, then immediately rides the same ` +
           `${d} \\u{m} back along the same road at ${v2} \\u{m s^-1}. What is the average ` +
           `SPEED for the whole trip?`,
        value: vavg, units: { m: 1, s: -1 }, sf: 3,
        // Route B: the harmonic mean directly. Same answer, different algebra.
        verify: () => 2 / (1 / v1 + 1 / v2),
        routes: ["total distance ÷ total time", "harmonic mean 2/(1/v₁ + 1/v₂)"],
        working: [
          { eq: `t_1 = \\f{${d}}{${v1}} = ${PHYS.U.fmtSig(t1, 3)} \\u{s}, ` +
                `t_2 = \\f{${d}}{${v2}} = ${PHYS.U.fmtSig(t2, 3)} \\u{s}`, note: "" },
          { eq: `v_{avg} = \\f{${2 * d}}{${PHYS.U.fmtSig(t1 + t2, 3)}} = ${PHYS.U.fmtSig(vavg, 3)} \\u{m s^-1}`,
            note: "Average speed is total distance over total time — always. It is not the " +
                  "average of the two speeds, because the slow leg takes longer and so counts for more." }
        ],
        distractors: [
          { value: (v1 + v2) / 2, why: "averaged the two speeds; that only works when the two legs take equal TIME, not equal distance" },
          { value: 0, why: "computed the average VELOCITY (the displacement is zero) — the question asks for average speed" },
          { value: Math.sqrt(v1 * v2), why: "used the geometric mean; the right average here is the harmonic mean" },
          { value: v2 - v1, why: "subtracted the speeds, which gives a change in speed, not an average" }
        ]
      };
    }
  });

  reg({
    id: "m1-vt-area", mod: "M1", topic: "Graphs of motion", diff: 2,
    ask: "displacement from a v–t graph", dim: { m: 1 },
    build(r) {
      /* Three phases: accelerate, cruise, decelerate. The area is the displacement. */
      const vmax = r.nice(12, 30, 2);
      const t1 = r.nice(3, 8, 1), t2 = r.nice(4, 12, 1), t3 = r.nice(2, 6, 1);
      const s = 0.5 * vmax * t1 + vmax * t2 + 0.5 * vmax * t3;
      const total = t1 + t2 + t3;
      return {
        givens: { vmax, t1, t2, t3 },
        q: `A tram starts from rest, speeds up uniformly to ${vmax} \\u{m s^-1} over ${t1} \\u{s}, ` +
           `holds that speed for ${t2} \\u{s}, then brakes uniformly to rest in a further ` +
           `${t3} \\u{s}. What total distance does it cover?`,
        value: s, units: { m: 1 }, sf: 3,
        /* Route B: forget the geometry and use suvat on each phase, going through
           the accelerations. Nothing here reads the areas computed above. */
        verify: () => {
          const a1 = vmax / t1;
          const s1 = 0.5 * a1 * t1 * t1;                    // from rest
          const s2 = vmax * t2;                             // a = 0
          const a3 = -vmax / t3;
          const s3 = vmax * t3 + 0.5 * a3 * t3 * t3;        // decelerating to rest
          return s1 + s2 + s3;
        },
        verifyTol: 1e-9,
        graph: { kind: "vt-trapezium", vmax, t1, t2, t3 },
        routes: ["area under the v–t graph, phase by phase", "suvat on each phase via its acceleration"],
        working: [
          { eq: `s_1 = \\f{1}{2} \\times ${t1} \\times ${vmax} = ${PHYS.U.fmtSig(0.5 * vmax * t1, 3)} \\u{m}`,
            note: "Triangle: speeding up from rest." },
          { eq: `s_2 = ${vmax} \\times ${t2} = ${PHYS.U.fmtSig(vmax * t2, 3)} \\u{m}`,
            note: "Rectangle: constant speed." },
          { eq: `s_3 = \\f{1}{2} \\times ${t3} \\times ${vmax} = ${PHYS.U.fmtSig(0.5 * vmax * t3, 3)} \\u{m}`,
            note: "Triangle: braking to rest." },
          { eq: `s = ${PHYS.U.fmtSig(s, 3)} \\u{m}`,
            note: "On a velocity–time graph the AREA is the displacement and the GRADIENT is " +
                  "the acceleration. Mixing those two up is the most common error in this topic." }
        ],
        distractors: [
          { value: vmax * total, why: "used the full rectangle — the tram was slower than v_max while speeding up and braking" },
          { value: 0.5 * vmax * t1 + vmax * t2, why: "left out the braking phase; the tram still travels while it slows down" },
          { value: vmax / t1, why: "read the GRADIENT of the first phase, which is an acceleration, not a distance" },
          { value: vmax * t2, why: "counted only the constant-speed section" }
        ]
      };
    }
  });

  reg({
    id: "m1-vt-gradient", mod: "M1", topic: "Graphs of motion", diff: 1,
    ask: "acceleration from a v–t graph", dim: { m: 1, s: -2 },
    build(r) {
      const v1 = r.nice(2, 14, 1);
      const dt = r.nice(2, 8, 1);
      /* Choose the acceleration so v₂ is never negative, rather than re-rolling —
         a retry loop here would recurse unboundedly on an unlucky seed. */
      const down = r.f() < 0.4;
      const a = down ? -r.nice(0.5, v1 / dt, 0.5) : r.nice(1, 5, 0.5);
      const v2 = v1 + a * dt;
      if (a === 0) return { skip: true };
      return {
        givens: { v1, v2, dt },
        q: `On a velocity–time graph, a straight line runs from (0 \\u{s}, ${v1} \\u{m s^-1}) to ` +
           `(${dt} \\u{s}, ${PHYS.U.fmtSig(v2, 3)} \\u{m s^-1}). What is the acceleration?`,
        value: a, units: { m: 1, s: -2 }, sf: 3,
        /* Route B: go via the displacement instead of the gradient — the area under
           the line, then a = (v² − u²)/2s. Nothing in it reads Δv/Δt. */
        verify: () => {
          const s = 0.5 * (v1 + v2) * dt;
          return (v2 * v2 - v1 * v1) / (2 * s);
        },
        verifyTol: 1e-9,
        graph: { kind: "vt-line", v1, v2, dt },
        routes: ["gradient of the v–t line", "area under the line, then a = (v²−u²)/2s"],
        working: [
          { eq: `a = \\f{Δv}{Δt} = \\f{${PHYS.U.fmtSig(v2, 3)} - ${v1}}{${dt} - 0}`, note: "" },
          { eq: `a = ${PHYS.U.fmtSig(a, 3)} \\u{m s^-2}`,
            note: "The gradient of a velocity–time graph is the acceleration." }
        ],
        distractors: [
          { value: (v1 + v2) / 2, why: "found the average velocity instead of the gradient" },
          { value: 0.5 * (v1 + v2) * dt, why: "found the AREA, which is the displacement, not the acceleration" },
          { value: dt / (v2 - v1), why: "inverted the gradient — rise over run, not run over rise" },
          { value: -a, why: "got the sign the wrong way round; subtract the earlier value FROM the later one" }
        ]
      };
    }
  });

  reg({
    id: "m1-relative-1d", mod: "M1", topic: "Relative motion", diff: 2,
    ask: "relative velocity", dim: { m: 1, s: -1 },
    build(r) {
      const vA = r.nice(12, 30, 1);
      const opposite = r.f() < 0.5;
      // Keep B's speed different from A's, so "same direction" is never 0 m s⁻¹.
      let vB = r.nice(12, 30, 1);
      if (!opposite && vB === vA) vB = vA + r.pick([-4, -3, 3, 4]);
      const rel = opposite ? vA + vB : Math.abs(vA - vB);
      return {
        givens: { vA, vB, opposite },
        q: opposite
          ? `Train A travels east at ${vA} \\u{m s^-1}. Train B travels west at ${vB} \\u{m s^-1} ` +
            `on a parallel track. What is the speed of B as measured by a passenger on A?`
          : `Train A travels east at ${vA} \\u{m s^-1}. Train B travels east at ${vB} \\u{m s^-1} ` +
            `on a parallel track. What is the speed of B as measured by a passenger on A?`,
        value: rel, units: { m: 1, s: -1 }, sf: 3,
        /* Route B: track positions. Advance both trains for a fixed interval in the
           ground frame, then measure how far apart they got and divide by the time.
           No velocity subtraction anywhere. */
        verify: () => {
          const dt = 7;                              // any interval
          const xA = vA * dt;                        // east positive
          const xB = (opposite ? -vB : vB) * dt;
          return Math.abs(xB - xA) / dt;
        },
        verifyTol: 1e-12,
        routes: ["combine the speeds directly", "advance both positions and measure the gap that opens"],
        working: [
          { eq: `\\v{v}_{BA} = \\v{v}_B - \\v{v}_A`, note: "Relative velocity is always a vector subtraction." },
          { eq: opposite
              ? `v_{BA} = (-${vB}) - (+${vA}) = ${PHYS.U.fmtSig(-(vB + vA), 3)} \\u{m s^-1}`
              : `v_{BA} = (+${vB}) - (+${vA}) = ${PHYS.U.fmtSig((vB - vA), 3)} \\u{m s^-1}`,
            note: "Taking east as positive." },
          { eq: `|v_{BA}| = ${PHYS.U.fmtSig(rel, 3)} \\u{m s^-1}`,
            note: opposite
              ? "Approaching each other, so the speeds add."
              : "Travelling the same way, so only the difference in speeds is seen." }
        ],
        distractors: [
          { value: opposite ? Math.abs(vA - vB) : vA + vB,
            why: opposite ? "subtracted when the trains move in OPPOSITE directions — they should add"
                          : "added when the trains move in the SAME direction — only the difference is seen" },
          { value: vB, why: "gave B's speed relative to the ground, not relative to A" },
          { value: (vA + vB) / 2, why: "averaged the two speeds, which is not a relative velocity" },
          { value: vA, why: "gave A's own speed" }
        ]
      };
    }
  });

  reg({
    id: "m1-river-crossing", mod: "M1", topic: "Vectors", diff: 3,
    ask: "resultant speed", dim: { m: 1, s: -1 },
    build(r) {
      /* Answer first: use a Pythagorean pair so the resultant is exact. */
      const [a, b, c] = r.pick([[3, 4, 5], [6, 8, 10], [5, 12, 13], [9, 12, 15], [8, 15, 17]]);
      const scale = r.pick([0.2, 0.4, 0.5, 1]);
      const vBoat = a * scale, vRiver = b * scale, res = c * scale;
      return {
        givens: { vBoat, vRiver },
        q: `A boat is steered straight across a river, pointing perpendicular to the bank, ` +
           `at ${PHYS.U.fmtSig(vBoat, 3)} \\u{m s^-1} relative to the water. The river flows at ` +
           `${PHYS.U.fmtSig(vRiver, 3)} \\u{m s^-1}. What is the boat's speed relative to the bank?`,
        value: res, units: { m: 1, s: -1 }, sf: 3,
        /* Route B: resolve into components and recombine through the angle rather
           than straight Pythagoras. */
        verify: () => {
          const theta = Math.atan2(vRiver, vBoat);
          return vBoat / Math.cos(theta);
        },
        verifyTol: 1e-9,
        routes: ["Pythagoras on the perpendicular components", "components plus the drift angle"],
        working: [
          { eq: `v = \\sqrt{v_{boat}^2 + v_{river}^2}`,
            note: "The two velocities are perpendicular, so they combine by Pythagoras." },
          { eq: `v = \\sqrt{${PHYS.U.fmtSig(vBoat, 3)}^2 + ${PHYS.U.fmtSig(vRiver, 3)}^2} = ` +
                `${PHYS.U.fmtSig(res, 3)} \\u{m s^-1}`, note: "" },
          { eq: `theta = \\tan^-1\\f{${PHYS.U.fmtSig(vRiver, 3)}}{${PHYS.U.fmtSig(vBoat, 3)}} = ` +
                `${PHYS.U.fmtSig(PHYS.U.rad(Math.atan2(vRiver, vBoat)), 3)}\\deg`,
            note: "Measured from the straight-across direction, downstream." }
        ],
        distractors: [
          { value: vBoat + vRiver, why: "added the magnitudes; perpendicular vectors do not add like that" },
          { value: Math.abs(vRiver - vBoat), why: "subtracted the magnitudes, which would only apply to anti-parallel vectors" },
          { value: vBoat, why: "gave only the across-river component — the current still carries the boat downstream" },
          { value: Math.sqrt(Math.abs(vRiver * vRiver - vBoat * vBoat)),
            why: "subtracted the squares; the resultant is the HYPOTENUSE, so the squares add" }
        ]
      };
    }
  });

  reg({
    id: "m1-vector-two-legs", mod: "M1", topic: "Vectors", diff: 3,
    ask: "resultant displacement", dim: { m: 1 },
    build(r) {
      const d1 = r.nice(40, 160, 10), d2 = r.nice(40, 160, 10);
      const turn = r.pick([30, 45, 60, 90, 120, 135]);          // degrees turned
      const th = PHYS.U.deg(turn);
      // Second leg measured `turn` degrees from the first.
      const x = d1 + d2 * Math.cos(th), y = d2 * Math.sin(th);
      const res = Math.sqrt(x * x + y * y);
      return {
        givens: { d1, d2, turn },
        q: `A hiker walks ${d1} \\u{m} due east, then turns ${turn}\\deg to the north of that ` +
           `direction and walks a further ${d2} \\u{m}. What is the magnitude of the hiker's ` +
           `total displacement?`,
        value: res, units: { m: 1 }, sf: 3,
        /* Route B: the cosine rule on the triangle, with the interior angle
           180° − turn. No components anywhere. */
        verify: () => Math.sqrt(d1 * d1 + d2 * d2 -
                                2 * d1 * d2 * Math.cos(PHYS.U.deg(180 - turn))),
        verifyTol: 1e-9,
        routes: ["resolve into components, then Pythagoras", "cosine rule on the displacement triangle"],
        working: [
          { eq: `x = ${d1} + ${d2}\\cos${turn}\\deg = ${PHYS.U.fmtSig(x, 3)} \\u{m}`, note: "" },
          { eq: `y = ${d2}\\sin${turn}\\deg = ${PHYS.U.fmtSig(y, 3)} \\u{m}`, note: "" },
          { eq: `|\\v{s}| = \\sqrt{x^2 + y^2} = ${PHYS.U.fmtSig(res, 3)} \\u{m}`,
            note: `Bearing ${PHYS.U.fmtSig(PHYS.U.rad(Math.atan2(y, x)), 3)}° north of east. ` +
                  `The cosine rule gives the same magnitude without components.` }
        ],
        distractors: [
          { value: d1 + d2, why: "added the distances — that is the distance TRAVELLED, not the displacement" },
          { value: Math.sqrt(d1 * d1 + d2 * d2),
            why: "used Pythagoras as though the turn were 90°; it only applies to perpendicular legs" },
          { value: Math.sqrt(Math.pow(d1 + d2 * Math.sin(th), 2) + Math.pow(d2 * Math.cos(th), 2)),
            why: "swapped sin and cos when resolving the second leg" },
          { value: Math.abs(d1 - d2), why: "subtracted the distances, which would only apply to an exact reversal" }
        ]
      };
    }
  });

  reg({
    id: "m1-catch-up", mod: "M1", topic: "Motion in a straight line", diff: 3,
    ask: "catch-up distance", dim: { m: 1 },
    build(r) {
      /* Car from rest at a, truck passes at constant v. They meet at t = 2v/a. */
      const v = r.nice(10, 24, 1), a = r.nice(1, 4, 0.5);
      const t = 2 * v / a;
      const d = v * t;
      return {
        givens: { v, a },
        q: `A car waiting at a red light starts from rest with a constant acceleration of ` +
           `${a} \\u{m s^-2} at the instant a truck moving at a constant ${v} \\u{m s^-1} ` +
           `passes it. How far from the lights does the car draw level with the truck?`,
        value: d, units: { m: 1 }, sf: 3,
        /* Route B: they are level when the car's average speed equals the truck's
           speed, i.e. when the car's final speed is 2v. Then use v² = u² + 2as. */
        verify: () => (Math.pow(2 * v, 2) - 0) / (2 * a),
        verifyTol: 1e-9,
        routes: ["set ½at² = vt and solve for t", "the car is level when its average speed equals v, so v_final = 2v"],
        working: [
          { eq: `\\f{1}{2}at^2 = vt`, note: "Level means equal displacements from the lights." },
          { eq: `t = \\f{2v}{a} = \\f{2 \\times ${v}}{${a}} = ${PHYS.U.fmtSig(t, 3)} \\u{s}`, note: "" },
          { eq: `d = vt = ${v} \\times ${PHYS.U.fmtSig(t, 3)} = ${PHYS.U.fmtSig(d, 3)} \\u{m}`,
            note: "At that instant the car is doing 2v — twice the truck's speed — because its " +
                  "AVERAGE speed had to equal v to cover the same ground." }
        ],
        /* Ratios 1/4, 1/2 and 2 of the answer, so these three can never round
           into each other or into the key however the numbers fall. An earlier
           draft had v·(v/a) and v²/a as separate entries — the same expression
           written two ways, which left only two usable distractors and made the
           template quietly fail one seed in nine. */
        distractors: [
          { value: v * v / (2 * a),
            why: "found how far the car travels in v/a seconds — that is the moment it MATCHES the truck's speed, when it is still behind" },
          { value: v * v / a,
            why: "used t = v/a instead of t = 2v/a; the car needs twice that long, because its average speed over the chase is only half its final speed" },
          { value: 4 * v * v / a,
            why: "multiplied the correct catch-up time by the car's FINAL speed 2v instead of the truck's steady speed v" }
        ]
      };
    }
  });
})();
