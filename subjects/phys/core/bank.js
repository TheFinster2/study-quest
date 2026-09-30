/* Question bank: discovery, filtering and the adaptive draw. */
window.PHYS = window.PHYS || {};

PHYS.Bank = (function () {
  const U = PHYS.U;
  let ALL = null, INDEX = null, CARDS = null;

  /* Every PHYS.DATA key named like a question bank (qM1a, qM5b, qExtra…) is picked
     up automatically.  DISCOVERED, NOT LISTED: the bank is spread over dozens of
     files and a hand-written list is one forgotten line away from silently dropping
     a few hundred questions. In the chemistry app the flashcard deck WAS hand-
     concatenated, and appending to the array from a file that sorted before the
     file declaring it lost 87 cards with nothing failing — the deck was just
     smaller. tests/validate.js uses the same rule and asserts the totals. */
  function all() {
    if (!ALL) {
      const D = PHYS.DATA;
      ALL = Object.keys(D)
        .filter(k => /^q[A-Z0-9]/.test(k) && Array.isArray(D[k]) && D[k].length && D[k][0].choices)
        .sort()
        .reduce((acc, k) => acc.concat(D[k]), []);
      INDEX = new Map(ALL.map(q => [q.id, q]));
    }
    return ALL;
  }
  const byId = id => { all(); return INDEX.get(id); };

  /** The flashcard deck, gathered the same way and for the same reason. */
  function cards() {
    if (!CARDS) {
      const D = PHYS.DATA;
      CARDS = Object.keys(D)
        .filter(k => /^flashcards/.test(k) && Array.isArray(D[k]) && D[k].length && D[k][0].front)
        .sort()
        .reduce((acc, k) => acc.concat(D[k]), []);
    }
    return CARDS;
  }

  const MODULES = [
    { id: "M1", name: "Kinematics",                  year: 11, short: "Kinematics",     icon: "🏃" },
    { id: "M2", name: "Dynamics",                    year: 11, short: "Dynamics",       icon: "🧲" },
    { id: "M3", name: "Waves and Thermodynamics",    year: 11, short: "Waves & Thermo",  icon: "🌊" },
    { id: "M4", name: "Electricity and Magnetism",   year: 11, short: "Electricity",    icon: "🔌" },
    { id: "M5", name: "Advanced Mechanics",          year: 12, short: "Adv. Mechanics", icon: "🛰️" },
    { id: "M6", name: "Electromagnetism",            year: 12, short: "Electromagnetism", icon: "⚡" },
    { id: "M7", name: "The Nature of Light",         year: 12, short: "Nature of Light", icon: "💡" },
    { id: "M8", name: "From the Universe to the Atom", year: 12, short: "Universe→Atom", icon: "⚛️" }
  ];
  const moduleName = id => (MODULES.find(m => m.id === id) || {}).short || id;
  const moduleFull = id => (MODULES.find(m => m.id === id) || {}).name || id;
  const isY12 = id => (MODULES.find(m => m.id === id) || {}).year === 12;

  /** Coverage (Options → what you study): is this module in the student's course?
      Hiding a module only filters what is DRAWN; it never changes a payout, and an
      explicitly chosen module (a Module Drill, a boss) is always honoured. */
  function covered(mod) {
    const S = PHYS.State;
    if (!S || !S.tagHidden) return true;
    const m = MODULES.find(x => x.id === mod);
    if (m && m.year === 11 && S.tagHidden("y11")) return false;
    return !S.tagHidden(mod);
  }
  const coveredModules = () => MODULES.filter(m => covered(m.id));

  function filter(opts) {
    const o = opts || {};
    let pool = all();
    if (o.mods && o.mods.length) pool = pool.filter(q => o.mods.includes(q.mod));
    else if (o.coverage !== false) {
      const inCourse = pool.filter(q => covered(q.mod));
      if (inCourse.length) pool = inCourse;
    }
    if (o.year) pool = pool.filter(q => (MODULES.find(m => m.id === q.mod) || {}).year === o.year);
    if (o.maxDiff) pool = pool.filter(q => q.diff <= o.maxDiff);
    if (o.minDiff) pool = pool.filter(q => q.diff >= o.minDiff);
    if (o.topic) pool = pool.filter(q => q.topic === o.topic);
    if (o.topics && o.topics.length) pool = pool.filter(q => o.topics.includes(q.topic));
    return pool;
  }

  const topicsOf = mod => {
    const seen = [];
    for (const q of all()) if (q.mod === mod && seen.indexOf(q.topic) < 0) seen.push(q.topic);
    return seen.sort();
  };

  /** Weight a question for the adaptive draw: mistakes first, weak modules next. */
  function weightFor(q, mistakeIds, moduleAcc, topicAcc) {
    let w = 1;
    if (mistakeIds.has(q.id)) w += 3.5;
    const acc = moduleAcc[q.mod];
    if (acc !== undefined && acc < 0.7) w += (0.7 - acc) * 4;
    const tacc = topicAcc[q.mod + "|" + q.topic];
    if (tacc !== undefined && tacc < 0.6) w += (0.6 - tacc) * 3;
    // Year 12 is what gets examined, so it is drawn more often on an equal footing.
    if (isY12(q.mod)) w *= 1.25;
    return w;
  }

  /**
   * Draw n questions.
   * opts: { mods, year, maxDiff, minDiff, topic, adaptive (default true),
   *         shuffleChoices (default true), maxPerTopicFrac }
   * Returns question objects with `choices` already shuffled and `a` remapped.
   */
  function draw(n, opts) {
    const o = opts || {};
    let pool = filter(o);
    if (!pool.length) pool = all();

    let chosen;
    if (o.adaptive === false) {
      chosen = U.sample(pool, n);
    } else {
      const st = PHYS.State.data;
      const mistakeIds = new Set((st.mistakes || []).map(m => m.id));
      const moduleAcc = {}, topicAcc = {};
      for (const [k, v] of Object.entries(st.modules || {})) {
        if (v.seen >= 4) moduleAcc[k] = v.correct / v.seen;
        for (const [t, tv] of Object.entries(v.topics || {})) {
          if (tv.seen >= 3) topicAcc[k + "|" + t] = tv.correct / tv.seen;
        }
      }
      // Weighted sampling without replacement.
      const bag = pool.map(q => ({ q, w: weightFor(q, mistakeIds, moduleAcc, topicAcc) * (0.5 + Math.random()) }));
      bag.sort((a, b) => b.w - a.w);
      chosen = capPerTopic(bag.map(x => x.q), n, o.maxPerTopicFrac);
      chosen = U.shuffle(chosen);
    }
    return chosen.map(q => (o.shuffleChoices === false ? clone(q) : shuffleChoices(q)));
  }

  /* A big bank that feels like ten questions is the trap specific to a generated
     or topic-clustered draw. No single topic may supply more than ~25% of a draw
     while there is anything else available. */
  function capPerTopic(ordered, n, frac) {
    const limit = Math.max(1, Math.ceil(n * (frac || 0.25)));
    const out = [], count = {}, spill = [];
    for (const q of ordered) {
      if (out.length >= n) break;
      const key = q.mod + "|" + q.topic;
      if ((count[key] || 0) >= limit) { spill.push(q); continue; }
      count[key] = (count[key] || 0) + 1;
      out.push(q);
    }
    // Only if the pool genuinely cannot fill the draw any other way.
    for (const q of spill) { if (out.length >= n) break; out.push(q); }
    return out;
  }

  function clone(q) { return Object.assign({}, q, { choices: q.choices.slice() }); }

  /** Shuffle options so the answer isn't always in the same slot. */
  function shuffleChoices(q) {
    const pairs = q.choices.map((text, i) => ({ text, correct: i === q.a, why: (q.why || [])[i] }));
    const mixed = U.shuffle(pairs);
    return Object.assign({}, q, {
      choices: mixed.map(p => p.text),
      why: mixed.map(p => p.why),
      a: mixed.findIndex(p => p.correct)
    });
  }

  /** Questions previously got wrong, most recent first. Generated-question
      mistakes come back as fresh instances of the template that was missed. */
  function mistakeQuestions() {
    const st = PHYS.State.data;
    const out = [];
    for (const m of st.mistakes || []) {
      if (m.gen) {
        const q = PHYS.Gen.fromTemplate(m.template);
        if (q) out.push(PHYS.Gen.toMcq(q));
      } else {
        const q = byId(m.id);
        if (q) out.push(shuffleChoices(q));
      }
    }
    return out;
  }

  function statsByModule() {
    const st = PHYS.State.data;
    return MODULES.map(m => {
      const rec = st.modules[m.id] || { seen: 0, correct: 0 };
      return {
        id: m.id, name: m.name, short: m.short, year: m.year, icon: m.icon,
        seen: rec.seen, correct: rec.correct,
        total: all().filter(q => q.mod === m.id).length,
        mastery: PHYS.State.mastery(m.id),
        accuracy: U.pct(rec.correct, rec.seen)
      };
    });
  }

  return { all, byId, cards, MODULES, covered, coveredModules, moduleName, moduleFull, isY12, topicsOf,
           filter, draw, shuffleChoices, mistakeQuestions, statsByModule, capPerTopic };
})();
