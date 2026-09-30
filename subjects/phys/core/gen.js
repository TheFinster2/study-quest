/* ════════════════════════════════════════════════════════════════════════════
   The generator engine.  PHYSICS-BRIEF.md §5.
   ════════════════════════════════════════════════════════════════════════════

   A template is a deterministic function of a seed that returns a fully-formed,
   self-describing question. This file is the contract every template obeys and
   the machinery that checks it. The checks are the point: a generator that is
   subtly wrong produces hundreds of confidently wrong questions, which is worse
   than having none.

   Three things are enforced for every template on every seed:

   1. DUAL-ROUTE VERIFICATION (§5.2). Every template computes its answer twice by
      genuinely different physics and the engine asserts the two agree. Where a
      second physical route does not exist the template inverts instead: take the
      answer, recompute one of the givens from it, assert the original comes back.
      One computation can be wrong in a way no amount of re-reading reveals.

   2. DIMENSIONAL ANALYSIS (§5.3). The answer's dimension map must equal what the
      template declares it is asking for. A dropped square or a divide that should
      have been a multiply changes the dimensions, so this catches a whole class of
      bug automatically, forever.

   3. DISTRACTOR INTEGRITY (§5.4, §5.6). Every distractor is the answer you get by
      making one specific named mistake, never `answer × 2`. None may equal the key
      after rounding, no two may collide after rounding, and all four options are
      formatted by the same code path — because a key with more decimal places than
      its distractors re-creates answer-length bias numerically.

   Templates never write HTML and never inline a constant: they take `K` (the data
   sheet lookup) and `S` (values a question must state in its own stem).          */

window.PHYS = window.PHYS || {};

PHYS.Gen = (function () {
  const U = PHYS.U;
  const Un = PHYS.Units;

  const TEMPLATES = [];
  const BY_ID = new Map();

  /** Templates register themselves; nothing keeps a list. */
  function register(t) {
    if (BY_ID.has(t.id)) throw new Error("Duplicate generator template id: " + t.id);
    for (const req of ["id", "mod", "topic", "diff", "dim", "build"]) {
      if (t[req] === undefined) throw new Error("Template " + t.id + " is missing " + req);
    }
    TEMPLATES.push(t);
    BY_ID.set(t.id, t);
    return t;
  }

  const all = () => TEMPLATES.slice();
  const byId = id => BY_ID.get(id);
  const forModule = mod => TEMPLATES.filter(t => t.mod === mod);

  /* ── the constants a template is allowed to use ────────────────────────── */
  const K = id => PHYS.DATA.constants.K(id);
  const S = id => PHYS.DATA.constants.S(id);
  /** The sentence a question must include when it uses a non-data-sheet value. */
  const stemOf = id => PHYS.DATA.constants.supplied[id].stem;

  /* ── helpers a template body can lean on ───────────────────────────────── */
  /** Seeded helpers, so a template body never reaches for Math.random. */
  function rngKit(seed) {
    const r = U.seededRandom(seed);
    return {
      f: r,
      /** Uniform in [lo, hi]. */
      range: (lo, hi) => lo + r() * (hi - lo),
      /** Integer in [lo, hi]. */
      int: (lo, hi) => lo + Math.floor(r() * (hi - lo + 1)),
      /** A "nice" number: `step`-grained, in [lo, hi]. */
      nice: (lo, hi, step) => {
        const s = step || 1;
        const n = Math.round(lo / s) + Math.floor(r() * (Math.floor(hi / s) - Math.round(lo / s) + 1));
        return Math.round(n * s * 1e6) / 1e6;
      },
      pick: arr => arr[Math.floor(r() * arr.length)],
      sample: (arr, n) => U.seededShuffle(arr, r).slice(0, n),
      sign: () => (r() < 0.5 ? -1 : 1)
    };
  }

  /**
   * Build one question.
   *   make("projectile-range")         random seed
   *   make("projectile-range", 12345)  reproducible
   * Throws if the template's own verification fails, so a broken generator cannot
   * reach a student — it fails loudly in the validator and at draw time.
   */
  function make(templateId, seed, opts) {
    const t = BY_ID.get(templateId);
    if (!t) throw new Error("Unknown generator template: " + templateId);
    let s = (seed === undefined || seed === null)
      ? 1 + Math.floor(Math.random() * 2147483000) : Math.abs(Math.floor(seed));

    /* A template may return { skip: true } when a seed produces a scenario it does
       not want to pose — a zero relative velocity, a degenerate triangle. Retrying
       with a derived seed rather than recursing inside build() keeps it bounded and
       keeps the question reproducible from the seed that is finally used. */
    let raw = null, lastSoft = null;
    for (let attempt = 0; attempt < 24; attempt++) {
      raw = t.build(rngKit(s), K, S, stemOf);
      if (raw && !raw.skip) {
        try { return finish(t, raw, s, opts); }
        catch (e) {
          /* A distractor collision after rounding is a property of the numbers,
             not a bug — at 2 or 3 significant figures two different misconceptions
             land on the same value more often than you would guess. Retry the seed.
             Anything else (a route disagreement, wrong dimensions) is a real defect
             and is rethrown immediately, because it must never reach a student.
             tests/validate.js reports the retry rate per template, so a template
             that leans on this too heavily is visible rather than merely slow. */
          if (!e.soft) throw e;
          lastSoft = e;
        }
      }
      s = (s * 48271 + 11) % 2147483647 || 7;
    }
    throw new Error(t.id + ": no usable question in 24 seeds" +
                    (lastSoft ? " — last reason: " + lastSoft.message : ""));
  }

  /** Mark an error as "this seed is unusable" rather than "this template is broken". */
  function soft(message) {
    const e = new Error(message);
    e.soft = true;
    return e;
  }

  /** A fresh instance of a template, or null if that template no longer exists. */
  function fromTemplate(id, seed) {
    if (!BY_ID.has(id)) return null;
    try { return make(id, seed); } catch (e) { console.warn("Generator failed:", id, e); return null; }
  }

  /* Verification tolerance. The two routes are different algebra over the same
     floating-point numbers, so they should agree to well within rounding — this
     is not a physics tolerance, it is a "did I make an algebra mistake" tolerance.
     A template may loosen it when its second route genuinely carries different
     rounding (a route through the data sheet's 2-sf mass of the Earth, say). */
  const VERIFY_TOL = 1e-9;

  function finish(t, raw, seed, opts) {
    const o = opts || {};
    const sf = raw.sf || t.sf || 3;
    const units = raw.units || t.dim;

    /* 1. dimensions */
    if (!Un.same(units, t.dim)) {
      throw new Error(`${t.id}: answer has units ${Un.baseStr(units)} but the template ` +
                      `asks for ${Un.baseStr(t.dim)}`);
    }
    if (!isFinite(raw.value)) throw new Error(`${t.id}: answer is not finite (${raw.value})`);

    /* 2. the second route */
    if (typeof raw.verify !== "function") {
      throw new Error(`${t.id}: no second-route verify() — see brief §5.2, every ` +
                      `template needs one (invert if no second physical route exists)`);
    }
    const check = raw.verify();
    const tol = raw.verifyTol || t.verifyTol || VERIFY_TOL;
    const rel = Math.abs(check - raw.value) / Math.max(1e-30, Math.abs(raw.value));
    if (!(rel <= tol)) {
      throw new Error(`${t.id} seed ${seed}: the two routes disagree — ` +
                      `${raw.value} vs ${check} (relative ${rel.toExponential(2)}, ` +
                      `tolerance ${tol})`);
    }

    /* 3. distractors, and identical formatting for all four options */
    const keyStr = U.fmtSig(raw.value, sf);
    const seen = new Map([[keyStr, "the correct answer"]]);
    const distractors = [];
    for (const d of raw.distractors || []) {
      if (!isFinite(d.value)) continue;
      const str = U.fmtSig(d.value, sf);
      // Never a distractor equal to the key, and never two equal to each other,
      // after rounding to the significant figures the student actually sees.
      if (seen.has(str)) continue;
      seen.set(str, d.why);
      distractors.push({ value: d.value, str, why: d.why });
    }
    if (distractors.length < 3) {
      throw soft(`${t.id} seed ${seed}: only ${distractors.length} usable ` +
                 `distractors after rounding to ${sf} s.f. — needs 3`);
    }

    const unitSrc = raw.unitText || Un.str(units);
    return {
      id: `gen-${t.id}-${seed}`,
      template: t.id,
      seed,
      generated: true,
      mod: t.mod, topic: t.topic, diff: raw.diff || t.diff,
      ask: t.ask || t.topic,
      q: raw.q,
      givens: raw.givens || {},
      answer: { value: raw.value, units, sf, str: keyStr, unitText: unitSrc },
      tolerance: raw.tol || t.tol || 0.02,
      working: raw.working || [],
      distractors: distractors.slice(0, 3),
      /* Kept so the feedback screen can say what the answer was verified against;
         it is genuinely reassuring to a student to see two routes agree. */
      routes: raw.routes || null,
      hint: raw.hint || t.hint || null
    };
  }

  /* ── presentation ─────────────────────────────────────────────────────────── */

  /** The answer as notation source, e.g. "59.9 \u{m}". */
  function answerText(q) {
    return q.answer.str + (q.answer.unitText ? " \\u{" + q.answer.unitText + "}" : "");
  }

  /**
   * Turn a generated question into a four-option MCQ.
   * Every option goes through the SAME formatter with the SAME significant
   * figures and the SAME unit suffix. Formatting the key differently from its
   * distractors — more decimals, a unit spelled out — is answer-length bias in
   * numeric form, and it is the tell a student learns to read instead of physics.
   */
  function toMcq(q) {
    const unit = q.answer.unitText ? " \\u{" + q.answer.unitText + "}" : "";
    const opts = [{ text: q.answer.str + unit, correct: true, why: null }]
      .concat(q.distractors.map(d => ({ text: d.str + unit, correct: false, why: d.why })));
    const mixed = U.shuffle(opts);
    return {
      id: q.id, template: q.template, generated: true,
      mod: q.mod, topic: q.topic, diff: q.diff,
      q: q.q,
      choices: mixed.map(m => m.text),
      why: mixed.map(m => m.why),
      a: mixed.findIndex(m => m.correct),
      explain: q.working,
      answerValue: q.answer.value,
      answerUnits: q.answer.units,
      answerText: answerText(q),
      tolerance: q.tolerance,
      hint: q.hint
    };
  }

  /**
   * Normalised form for near-duplicate detection (§5.5).
   *
   * Bigram duplicate detection over rendered text happily passes 200 questions
   * that are all "a m kg mass on a θ° incline" with different numbers, because
   * the numbers differ — you end up with a huge bank that feels like ten
   * questions. Replacing every numeral with # and every unit with its dimension
   * makes two questions that differ only in their numbers compare EQUAL, which
   * is the truth.
   */
  function normalise(text) {
    /* Work on the notation SOURCE, not the rendered text. Content marks every unit
       explicitly with \u{…}, which is far more reliable than trying to spot units
       in prose — "a 5 m ladder" and "the m in F = ma" look alike to a regex.

       Units are lifted out to placeholders BEFORE numerals are blanked. Doing it
       the other way round blanks the exponents inside the dimension tags too, so
       "m s^-2" and "m s^-1" both collapse to "m s^#" and every kinematics question
       in the bank starts comparing equal — a duplicate checker that reports
       everything as a duplicate is as useless as one that reports nothing. */
    const holds = [];
    /* The placeholder must contain NO DIGITS, or the numeral pass below blanks the
       index inside it too and every unit comes back as "#". Spell it in letters. */
    const tag = i => String(i).split("").map(d => "abcdefghij"[+d]).join("");
    let s = String(text).replace(/\\u\{([^{}]*)\}/g, (m, unit) => {
      const p = Un.parse(unit);
      holds.push("[" + (p ? Un.baseStr(p.units) : unit) + "]");
      return "" + tag(holds.length - 1) + "";
    });
    s = U.mathPlain(s);
    // Scientific notation collapses to a single # rather than "# × 10^#".
    s = s.replace(/[-+−]?\d[\d.,]*\s*×\s*10\s*[-+−]?\d+/g, "#");
    s = s.replace(/[-+−]?\d[\d.,]*(?:[eE][-+−]?\d+)?/g, "#");
    s = s.replace(/([a-j]+)/g, (m, w) =>
      holds[+w.split("").map(c => "abcdefghij".indexOf(c)).join("")]);
    return s.toLowerCase().replace(/#\s*#/g, "#").replace(/\s+/g, " ").trim();
  }

  /* ── drawing for a run ────────────────────────────────────────────────────── */

  /**
   * Draw n generated questions.
   * Enforces template diversity: no single template may supply more than ~25% of
   * a draw while other templates are available. Weighted towards templates whose
   * misconception the player has actually fallen for.
   */
  function draw(n, opts) {
    const o = opts || {};
    let pool = TEMPLATES.slice();
    if (o.mods && o.mods.length) pool = pool.filter(t => o.mods.includes(t.mod));
    else if (PHYS.Bank && PHYS.Bank.covered && o.coverage !== false) {
      /* StudyQuest coverage toggles: draw only from modules the student studies. */
      const inCourse = pool.filter(t => PHYS.Bank.covered(t.mod));
      if (inCourse.length) pool = inCourse;
    }
    if (o.year && PHYS.Bank) {
      pool = pool.filter(t => (PHYS.Bank.MODULES.find(m => m.id === t.mod) || {}).year === o.year);
    }
    if (o.maxDiff) pool = pool.filter(t => t.diff <= o.maxDiff);
    if (o.topics && o.topics.length) pool = pool.filter(t => o.topics.includes(t.topic));
    if (o.templates && o.templates.length) pool = pool.filter(t => o.templates.includes(t.id));
    if (!pool.length) pool = TEMPLATES.slice();

    /* State is absent when the content validator runs this in Node — it loads the
       generators and the units engine but no DOM-bound modules. Weighting towards
       previously-missed templates is a nicety, so degrade rather than throw. */
    const st = (PHYS.State && PHYS.State.data) || { mistakes: [] };
    const missed = new Set((st.mistakes || []).filter(m => m.gen).map(m => m.template));
    const weighted = pool.map(t => ({
      t, w: (missed.has(t.id) ? 4 : 1) * (0.5 + Math.random())
    })).sort((a, b) => b.w - a.w).map(x => x.t);

    const limit = Math.max(1, Math.ceil(n * 0.25));
    const out = [], used = {};
    // Round-robin over the weighted order, so a small pool still fills the draw.
    for (let pass = 0; out.length < n && pass < limit + 2; pass++) {
      for (const t of weighted) {
        if (out.length >= n) break;
        if ((used[t.id] || 0) > pass) continue;
        let q = null;
        try { q = make(t.id); } catch (e) { console.warn("Generator failed:", t.id, e.message); }
        if (!q) continue;
        used[t.id] = (used[t.id] || 0) + 1;
        out.push(q);
      }
      if (!Object.keys(used).length) break;      // every template threw
    }
    return U.shuffle(out);
  }

  return { register, all, byId, forModule, make, fromTemplate, draw,
           toMcq, answerText, normalise, rngKit, VERIFY_TOL,
           get count() { return TEMPLATES.length; } };
})();
