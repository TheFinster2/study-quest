/* ============================================================================
   bank.js — question aggregation, filtering, adaptive draw.
   Data files push into window.MS.QUESTIONS; this file is the only thing that
   reads it. Namespace: window.MS.Bank
   ========================================================================== */
window.MS = window.MS || {};
(function () {
  'use strict';
  var U = window.MS.U, State = window.MS.State;
  var Bank = {};
  var index = null;

  Bank.TOPICS = window.MS.TOPICS || [];
  Bank.TOPIC_CODES = Bank.TOPICS.map(function (t) { return t.code; });
  Bank.topic = function (code) {
    for (var i = 0; i < Bank.TOPICS.length; i++) if (Bank.TOPICS[i].code === code) return Bank.TOPICS[i];
    return null;
  };
  Bank.topicName = function (code) { var t = Bank.topic(code); return t ? t.nm : code; };
  Bank.topicIcon = function (code) { var t = Bank.topic(code); return t ? t.ic : '📘'; };

  Bank.all = function () { return window.MS.QUESTIONS || []; };
  Bank.byId = function (id) {
    if (!index) {
      index = {};
      Bank.all().forEach(function (q) { index[q.id] = q; });
    }
    return index[id];
  };
  Bank.count = function () { return Bank.all().length; };

  /* filter({mod, diff, diffMax, sub, ids, exclude, allTiers})

     The player's question tier is applied HERE, so every mode, boss and daily
     challenge inherits it without knowing it exists. Pass allTiers:true for the
     places that must see the whole bank regardless: counting how much content a
     topic has, and the validator. */
  Bank.filter = function (o) {
    o = o || {};
    var out = Bank.all();
    if (!o.allTiers) {
      var t = State.tierRange();
      if (t.diffMin > 0) out = out.filter(function (q) { return q.diff >= t.diffMin; });
      if (t.diffMax < 3) out = out.filter(function (q) { return q.diff <= t.diffMax; });
    }
    if (o.mod) {
      var mods = Array.isArray(o.mod) ? o.mod : [o.mod];
      out = out.filter(function (q) { return mods.indexOf(q.mod) >= 0; });
    }
    if (o.yr) out = out.filter(function (q) { var t = Bank.topic(q.mod); return t && t.yr === o.yr; });
    if (o.diff) out = out.filter(function (q) { return q.diff === o.diff; });
    if (o.diffMin) out = out.filter(function (q) { return q.diff >= o.diffMin; });
    if (o.diffMax) out = out.filter(function (q) { return q.diff <= o.diffMax; });
    if (o.sub) out = out.filter(function (q) { return q.topic === o.sub; });
    if (o.ids) { var set = {}; o.ids.forEach(function (i) { set[i] = 1; }); out = out.filter(function (q) { return set[q.id]; }); }
    if (o.exclude) { var ex = {}; o.exclude.forEach(function (i) { ex[i] = 1; }); out = out.filter(function (q) { return !ex[q.id]; }); }
    if (o.hasFigure) out = out.filter(function (q) { return !!q.figure; });
    if (o.hasTable) out = out.filter(function (q) { return !!q.table; });
    return out;
  };

  /* Adaptive weight (§7): ×3.5 if previously missed, plus a bonus scaled to
     how weak the topic is. Never zero, so nothing becomes unreachable. */
  Bank.weight = function (q) {
    var d = State.data;
    var w = 1;
    var rec = d.q[q.id];
    if (rec && rec.w > 0) w *= 3.5;
    if (rec && rec.s > 0 && rec.w === 0) w *= 0.55;         // seen and always right — de-emphasise
    var m = State.mastery(q.mod);
    w *= 1 + (1 - m) * 1.4;
    return w;
  };

  /* Weighted draw without replacement.
     If the tier leaves nothing to draw — a narrow topic in Warm-up, say — fall
     back to the untiered pool rather than dealing an empty run. A thin tier
     should soften, never break. */
  Bank.draw = function (n, opts) {
    var pool = Bank.filter(opts);
    if (!pool.length && opts && !opts.allTiers) {
      var wider = {};
      for (var k in opts) wider[k] = opts[k];
      wider.allTiers = true;
      pool = Bank.filter(wider);
    }
    if (!pool.length) return [];
    var picked = [], weights = pool.map(Bank.weight);
    n = Math.min(n, pool.length);
    for (var k = 0; k < n; k++) {
      var total = 0, i;
      for (i = 0; i < pool.length; i++) total += weights[i];
      if (total <= 0) break;
      var r = Math.random() * total, acc = 0, hit = pool.length - 1;
      for (i = 0; i < pool.length; i++) { acc += weights[i]; if (r <= acc) { hit = i; break; } }
      picked.push(pool[hit]);
      weights[hit] = 0;
    }
    return picked;
  };

  /* Deterministic draw for the daily challenge and any seeded content. */
  Bank.seededDraw = function (n, seed, opts) {
    var pool = Bank.filter(opts);
    return U.seededShuffle(pool, seed).slice(0, n);
  };

  /* An endless supplier for timed modes — reshuffles when the pool runs dry. */
  Bank.stream = function (opts) {
    var queue = [];
    return function next() {
      if (!queue.length) {
        queue = Bank.draw(40, opts);
        if (!queue.length) queue = U.shuffle(Bank.filter(opts));
        if (!queue.length) queue = U.shuffle(Bank.filter({ allTiers: true }));
      }
      return queue.shift();
    };
  };

  /* How many questions the current tier can actually reach, per topic. Used by
     the Play and Drill screens so a thin tier is visible rather than a surprise. */
  Bank.tierCount = function (code) {
    return Bank.filter(code ? { mod: code } : {}).length;
  };
  Bank.totalCount = function (code) {
    return Bank.filter(code ? { mod: code, allTiers: true } : { allTiers: true }).length;
  };

  /* Every bank question stores the key at index 0 (see validate.js). This is
     the only place that randomises option order, so the stored shape stays
     trivially checkable and the runtime is never predictable. */
  Bank.shuffleChoices = function (q) {
    var idx = q.choices.map(function (_, i) { return i; });
    var order = U.shuffle(idx);
    return {
      id: q.id, mod: q.mod, topic: q.topic, diff: q.diff,
      stem: q.stem, table: q.table, figure: q.figure, units: q.units, hint: q.hint,
      q: q.q, why: q.why,
      choices: order.map(function (i) { return q.choices[i]; }),
      a: order.indexOf(0),
      src: q
    };
  };

  /* Mistake Rehab pool: anything answered wrong at least once that has not yet
     earned its way out. A question graduates once it has been answered right
     two more times than it has been answered wrong — one lucky guess is not
     evidence of having learned it. */
  Bank.mistakeQuestions = function () {
    var d = State.data;
    var ids = Object.keys(d.q).filter(function (id) {
      var rec = d.q[id];
      return rec.w > 0 && rec.r < rec.w + 2;
    });
    return ids.map(Bank.byId).filter(Boolean).sort(function (a, b) {
      return (d.q[b.id].w - d.q[b.id].r) - (d.q[a.id].w - d.q[a.id].r);
    });
  };

  Bank.statsByTopic = function () {
    var d = State.data;
    return Bank.TOPICS.map(function (t) {
      var pool = Bank.filter({ mod: t.code });
      var rec = d.topics[t.code] || { seen: 0, right: 0 };
      return {
        code: t.code, nm: t.nm, ic: t.ic, yr: t.yr, strand: t.strand,
        total: pool.length, seen: rec.seen, right: rec.right,
        accuracy: rec.seen ? rec.right / rec.seen : 0,
        mastery: State.mastery(t.code),
        tier: State.masteryTier(State.mastery(t.code))
      };
    });
  };

  /* Sub-topic breakdown within one topic — drives the progress detail screen. */
  Bank.subStats = function (code) {
    var d = State.data, map = {};
    Bank.filter({ mod: code }).forEach(function (q) {
      var m = map[q.topic] || (map[q.topic] = { nm: q.topic, total: 0, seen: 0, right: 0 });
      m.total++;
      var rec = d.q[q.id];
      if (rec) { m.seen += rec.s; m.right += rec.r; }
    });
    return Object.keys(map).map(function (k) {
      var m = map[k];
      m.accuracy = m.seen ? m.right / m.seen : 0;
      return m;
    }).sort(function (a, b) { return a.nm.localeCompare(b.nm); });
  };

  window.MS.Bank = Bank;
})();
