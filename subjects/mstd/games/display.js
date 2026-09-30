/* ============================================================================
   display.js — 📊 Read the Display (§5). The Name That Compound translation,
   and a much better fit: MS-S1/S4 is largely "look at this display and say what
   it tells you". Chemistry needed 28 hand-authored compounds; this needs none —
   every display is drawn on a canvas from generated data.

   §9.9 throughout: the statistic is computed from the data FIRST, then the
   distractors are built as specific misreadings of the same display.
   ========================================================================== */
window.MS = window.MS || {};
window.MS.Games = window.MS.Games || {};
(function () {
  'use strict';
  var MS = window.MS, U = MS.U, UI = MS.UI, State = MS.State, D = MS.Draw;

  var ROUNDS = 10;

  /* -------------------------------------------------------------- helpers */
  function five(rnd) {
    var min = U.seededInt(rnd, 2, 22);
    var q1 = min + U.seededInt(rnd, 4, 12);
    var med = q1 + U.seededInt(rnd, 3, 11);
    var q3 = med + U.seededInt(rnd, 3, 12);
    var max = q3 + U.seededInt(rnd, 4, 14);
    return { min: min, q1: q1, med: med, q3: q3, max: max };
  }
  function pickN(rnd, arr, n) { return U.seededShuffle(arr, rnd).slice(0, n); }
  /* Build four options: the key first, then three specific misreadings.
     Duplicates are replaced by a nearby value so the set always has 4. */
  /* §C4 — deduplicate on what the student SEES, not on the raw number.
     The old version separated the values and then formatted them, so two
     options a hundredth apart rendered as the same string and the question
     arrived with a visible duplicate — which eliminates a distractor for
     free and occasionally shows the key twice. Format first, compare the
     strings, and push the value further until the label is distinct. */
  function options(key, wrongs, fmt) {
    var f = fmt || function (v) { return String(U.round(v, 2)); };
    var out = [key], seen = { };
    seen[f(key)] = 1;
    var step = Math.max(1, Math.abs(key) * 0.05);
    wrongs.forEach(function (w) {
      var v = w, guard = 0;
      while (seen[f(v)] && guard++ < 40) v += (v >= key ? step : -step);
      seen[f(v)] = 1;
      out.push(v);
    });
    var pad = 1;
    while (out.length < 4) {
      var v2 = key + pad * step * 3;
      while (seen[f(v2)] && pad++ < 40) v2 = key + pad * step * 3;
      seen[f(v2)] = 1;
      out.push(v2);
      pad++;
    }
    return out.slice(0, 4).map(f);
  }

  /* ============================================================ generators */
  var KINDS = [
    /* -------------------------------------------------- box plot: IQR etc. */
    function boxplot(rnd) {
      var f = five(rnd);
      var iqr = f.q3 - f.q1, range = f.max - f.min;
      var ask = U.seededPick(rnd, ['iqr', 'median', 'range', 'q3', 'shape']);
      var fig = { kind: 'boxplot', min: f.min, q1: f.q1, med: f.med, q3: f.q3, max: f.max, outliers: [], alt: 'a box plot' };
      if (ask === 'shape') {
        var lower = f.med - f.q1, upper = f.q3 - f.med;
        var shape = upper > lower * 1.4 ? 'Positively skewed' : lower > upper * 1.4 ? 'Negatively skewed' : 'Roughly symmetric';
        var others = ['Positively skewed', 'Negatively skewed', 'Roughly symmetric', 'Bimodal'].filter(function (s) { return s !== shape; });
        return {
          mod: 'MS-S1', topic: 'Shape and skew', diff: 2, figure: fig,
          stem: 'The box plot summarises a set of marks.',
          q: 'What is the shape of this distribution?',
          choices: [shape].concat(others.slice(0, 3)),
          why: 'Median − Q₁ = ' + lower + ' and Q₃ − median = ' + upper + '. ' +
               (shape === 'Positively skewed' ? 'The upper half of the box is wider and the right whisker is longer, so the tail stretches right.'
                : shape === 'Negatively skewed' ? 'The lower half of the box is wider, so the tail stretches left.'
                : 'The two halves of the box are close in width, so it reads as roughly symmetric.')
        };
      }
      var key = ask === 'iqr' ? iqr : ask === 'median' ? f.med : ask === 'range' ? range : f.q3;
      var wrongs = ask === 'iqr' ? [range, f.q3, f.med]
        : ask === 'median' ? [f.q1, f.q3, (f.min + f.max) / 2]
        : ask === 'range' ? [iqr, f.max, f.q3 - f.min]
        : [f.q1, f.med, f.max];
      return {
        mod: 'MS-S1', topic: 'Box plots', diff: ask === 'iqr' ? 2 : 1, figure: fig,
        stem: 'The box plot summarises a set of marks.',
        q: 'From the box plot, what is the ' + (ask === 'iqr' ? 'interquartile range' : ask === 'q3' ? 'third quartile' : ask) + '?',
        choices: options(key, wrongs),
        why: 'The five-number summary is ' + [f.min, f.q1, f.med, f.q3, f.max].join(', ') + '. ' +
             (ask === 'iqr' ? 'IQR = Q₃ − Q₁ = ' + f.q3 + ' − ' + f.q1 + ' = ' + iqr + ', which measures the middle 50% and ignores the whiskers.'
              : ask === 'range' ? 'Range = max − min = ' + f.max + ' − ' + f.min + ' = ' + range + '.'
              : ask === 'median' ? 'The median is the line inside the box: ' + f.med + '.'
              : 'Q₃ is the right-hand edge of the box: ' + f.q3 + '.')
      };
    },

    /* ------------------------------------------------- box plot with outlier */
    function outlier(rnd) {
      var f = five(rnd);
      var iqr = f.q3 - f.q1;
      var out = Math.round(f.q3 + 1.5 * iqr + U.seededInt(rnd, 2, 10));
      var upper = f.q3 + 1.5 * iqr;
      return {
        mod: 'MS-S1', topic: 'Outliers', diff: 3,
        figure: { kind: 'boxplot', min: f.min, q1: f.q1, med: f.med, q3: f.q3, max: f.max, outliers: [out], alt: 'a box plot with one outlier' },
        stem: 'The box plot shows one score marked separately as an outlier.',
        q: 'What is the upper boundary beyond which a score counts as an outlier?',
        choices: options(upper, [f.q3 + iqr, f.max, f.q3 + 0.5 * iqr]),
        why: 'IQR = ' + f.q3 + ' − ' + f.q1 + ' = ' + iqr + '. The upper boundary is Q₃ + 1.5 × IQR = ' + f.q3 + ' + ' + U.round(1.5 * iqr, 2) + ' = ' + U.round(upper, 2) + '. The marked score of ' + out + ' sits beyond it, which is why it is drawn as a separate point rather than a whisker end.'
      };
    },

    /* ---------------------------------------------------------- histogram */
    function histogram(rnd) {
      var n = U.seededInt(rnd, 5, 6);
      var bins = [], total = 0, sumFx = 0;
      var start = U.seededInt(rnd, 0, 3);
      for (var i = 0; i < n; i++) {
        var f = U.seededInt(rnd, 1, 11);
        bins.push({ label: String(start + i), count: f, x: start + i });
        total += f; sumFx += (start + i) * f;
      }
      var mean = sumFx / total;
      var modeBin = bins.reduce(function (a, b) { return b.count > a.count ? b : a; }, bins[0]);
      /* Median by cumulative frequency. */
      var run = 0, medPos = (total + 1) / 2, med = bins[0].x;
      for (var j = 0; j < bins.length; j++) { run += bins[j].count; if (run >= medPos) { med = bins[j].x; break; } }
      var ask = U.seededPick(rnd, ['total', 'mode', 'mean', 'median']);
      var key = ask === 'total' ? total : ask === 'mode' ? modeBin.x : ask === 'mean' ? U.round(mean, 2) : med;
      var wrongs = ask === 'total' ? [n, sumFx, modeBin.count]
        : ask === 'mode' ? [modeBin.count, med, U.round(mean, 0)]
        : ask === 'mean' ? [U.round(sumFx / n, 2), med, modeBin.x]
        : [U.round(mean, 2), modeBin.x, bins.length];
      return {
        mod: 'MS-S1', topic: 'Frequency tables', diff: ask === 'mean' ? 3 : 2,
        figure: { kind: 'histogram', bins: bins, title: 'Number of pets owned', alt: 'a histogram' },
        stem: 'The histogram shows how many students own each number of pets.',
        q: ask === 'total' ? 'How many students were surveyed?'
          : ask === 'mode' ? 'What is the modal number of pets?'
          : ask === 'mean' ? 'What is the mean number of pets, to 2 decimal places?'
          : 'What is the median number of pets?',
        choices: options(key, wrongs),
        why: 'Frequencies: ' + bins.map(function (b) { return b.x + '→' + b.count; }).join(', ') + '. ' +
             'Σf = ' + total + ' and Σfx = ' + sumFx + '. ' +
             (ask === 'total' ? 'The number surveyed is Σf = ' + total + ' — add the frequencies, not the scores.'
              : ask === 'mode' ? 'The mode is the SCORE with the highest frequency, which is ' + modeBin.x + ' (frequency ' + modeBin.count + '), not the frequency itself.'
              : ask === 'mean' ? 'x̄ = Σfx ÷ Σf = ' + sumFx + ' ÷ ' + total + ' = ' + U.round(mean, 2) + '. Dividing by the number of bars instead of Σf is the usual error.'
              : 'The median is the ' + U.round(medPos, 1) + 'th score. Running the cumulative frequency along lands in the ' + med + ' bar.')
      };
    },

    /* ----------------------------------------------------- scatter and r */
    function scatter(rnd) {
      var m = U.seededPick(rnd, [-2.4, -1.6, -0.9, 0.9, 1.6, 2.4]);
      var noise = U.seededPick(rnd, [0.5, 2, 5, 9]);
      var pts = [];
      for (var i = 0; i < 9; i++) {
        var x = 2 + i * 3;
        pts.push([x, U.round(m * x + 30 + (rnd() - 0.5) * noise * 4, 1)]);
      }
      var reg = D.regression(pts);
      var ask = U.seededPick(rnd, ['direction', 'strength', 'gradient']);
      var fig = { kind: 'scatter', pts: pts, line: reg, showLine: ask === 'gradient', alt: 'a scatterplot' };
      if (ask === 'gradient') {
        return {
          mod: 'MS-S4', topic: 'Least-squares regression', diff: 3, figure: fig,
          stem: 'The least-squares regression line has been drawn on the scatterplot.',
          q: 'Which value is closest to the gradient of the regression line?',
          choices: options(U.round(reg.m, 1), [U.round(-reg.m, 1), U.round(reg.m * 2, 1), U.round(reg.b / 10, 1)]),
          why: 'The line falls about ' + U.round(Math.abs(reg.m), 2) + ' units of y for every 1 unit of x' +
               (reg.m > 0 ? ' — except it rises, so the gradient is positive: ' : ', so the gradient is negative: ') +
               U.round(reg.m, 2) + '. The gradient is the predicted CHANGE in y per one-unit increase in x.'
        };
      }
      if (ask === 'direction') {
        var key = reg.r > 0 ? 'Positive' : 'Negative';
        return {
          mod: 'MS-S4', topic: 'Correlation', diff: 1, figure: fig,
          stem: 'A scatterplot of nine paired observations.',
          q: 'What is the direction of the association?',
          choices: [key, reg.r > 0 ? 'Negative' : 'Positive', 'No association', 'Non-linear only'],
          why: 'As x increases, y ' + (reg.r > 0 ? 'increases' : 'decreases') + ', so the association is ' + key.toLowerCase() + '. Here r = ' + U.round(reg.r, 2) + '.'
        };
      }
      var ar = Math.abs(reg.r);
      var key2 = ar >= 0.9 ? 'Very strong' : ar >= 0.7 ? 'Strong' : ar >= 0.5 ? 'Moderate' : 'Weak';
      var all = ['Very strong', 'Strong', 'Moderate', 'Weak'];
      return {
        mod: 'MS-S4', topic: 'Correlation', diff: 2, figure: fig,
        stem: 'A scatterplot of nine paired observations. Pearson\'s r = ' + U.round(reg.r, 2) + '.',
        q: 'How would you describe the strength of the linear association?',
        choices: [key2].concat(all.filter(function (s) { return s !== key2; }).slice(0, 3)),
        why: '|r| = ' + U.round(ar, 2) + '. The usual bands are 0.9–1 very strong, 0.7–0.9 strong, 0.5–0.7 moderate, below 0.5 weak. Strength comes from |r|; the sign only tells you the direction.'
      };
    },

    /* --------------------------------------------------------- normal curve */
    function normal(rnd) {
      var mean = U.seededInt(rnd, 40, 90), sd = U.seededInt(rnd, 3, 14);
      var cases = [
        { shade: [-1, 1], pct: 68, q: 'between ' + (mean - sd) + ' and ' + (mean + sd) },
        { shade: [-2, 2], pct: 95, q: 'between ' + (mean - 2 * sd) + ' and ' + (mean + 2 * sd) },
        { shade: [-3, 3], pct: 99.7, q: 'between ' + (mean - 3 * sd) + ' and ' + (mean + 3 * sd) },
        { shade: [1, 3.6], pct: 16, q: 'above ' + (mean + sd) },
        { shade: [2, 3.6], pct: 2.5, q: 'above ' + (mean + 2 * sd) },
        { shade: [-3.6, -1], pct: 16, q: 'below ' + (mean - sd) },
        { shade: [1, 2], pct: 13.5, q: 'between ' + (mean + sd) + ' and ' + (mean + 2 * sd) },
        { shade: [0, 2], pct: 47.5, q: 'between ' + mean + ' and ' + (mean + 2 * sd) }
      ];
      var c = U.seededPick(rnd, cases);
      var pool = [68, 95, 99.7, 16, 2.5, 13.5, 47.5, 34, 50, 84].filter(function (p) { return p !== c.pct; });
      return {
        mod: 'MS-S5', topic: 'The empirical rule', diff: 2,
        figure: { kind: 'normal', shade: c.shade, axis: function (t) { return String(mean + t * sd); }, alt: 'a normal curve with a shaded region' },
        stem: 'A normally distributed variable has mean ' + mean + ' and standard deviation ' + sd + '. The shaded region is marked on the curve.',
        q: 'What percentage of values lie ' + c.q + '?',
        choices: [c.pct + '%'].concat(pickN(rnd, pool, 3).map(function (p) { return p + '%'; })),
        why: 'The empirical rule gives 68% within 1 standard deviation, 95% within 2 and 99.7% within 3. The shaded region corresponds to ' + c.pct + '%. Tails split what is left over evenly, because the curve is symmetric.'
      };
    },

    /* ------------------------------------------------------------- dot plot */
    function dotplot(rnd) {
      var vals = [];
      var base = U.seededInt(rnd, 1, 6);
      for (var i = 0; i < 13; i++) vals.push(base + U.seededInt(rnd, 0, 7));
      var sorted = vals.slice().sort(function (a, b) { return a - b; });
      var med = sorted[6];
      var counts = {};
      sorted.forEach(function (v) { counts[v] = (counts[v] || 0) + 1; });
      var mode = Object.keys(counts).reduce(function (a, b) { return counts[b] > counts[a] ? b : a; }, Object.keys(counts)[0]);
      var range = sorted[12] - sorted[0];
      var ask = U.seededPick(rnd, ['median', 'mode', 'range']);
      var key = ask === 'median' ? med : ask === 'mode' ? Number(mode) : range;
      var wrongs = ask === 'median' ? [Number(mode), range, sorted[5]]
        : ask === 'mode' ? [med, counts[mode], range]
        : [med, sorted[12], sorted[12] - med];
      return {
        mod: 'MS-S1', topic: 'Mean median mode', diff: 1,
        figure: { kind: 'dotplot', values: sorted, alt: 'a dot plot of thirteen scores' },
        stem: 'The dot plot shows thirteen scores.',
        q: 'From the dot plot, what is the ' + ask + '?',
        choices: options(key, wrongs),
        why: 'Ordered, the scores are ' + sorted.join(', ') + '. ' +
             (ask === 'median' ? 'With 13 scores the median is the 7th: ' + med + '.'
              : ask === 'mode' ? 'The tallest stack is at ' + mode + ' (it appears ' + counts[mode] + ' times), so the mode is the SCORE ' + mode + '.'
              : 'Range = ' + sorted[12] + ' − ' + sorted[0] + ' = ' + range + '.')
      };
    },

    /* ------------------------------------------------------- break-even read */
    function breakeven(rnd) {
      var units = U.seededInt(rnd, 20, 160);
      var price = U.seededInt(rnd, 10, 40);
      var varCost = U.seededInt(rnd, 3, price - 4);
      var fixed = units * (price - varCost);
      var xMax = Math.round(units * 1.8);
      var ask = U.seededPick(rnd, ['units', 'fixed', 'revenue']);
      var key = ask === 'units' ? units : ask === 'fixed' ? fixed : units * price;
      var wrongs = ask === 'units' ? [Math.round(fixed / price), Math.round(fixed / varCost), units * 2]
        : ask === 'fixed' ? [units * price, units * varCost, fixed / 2]
        : [fixed, units * varCost, units * (price + varCost)];
      var fmt = ask === 'units' ? function (v) { return U.commas(Math.round(v)) + ' units'; } : function (v) { return U.money$(v); };
      return {
        mod: 'MS-A4', topic: 'Break-even analysis', diff: 2,
        figure: {
          kind: 'lines', x0: 0, x1: xMax, y0: 0, y1: xMax * price,
          lines: [
            { pts: [[0, 0], [xMax, xMax * price]], colour: 'good', label: 'Revenue' },
            { pts: [[0, fixed], [xMax, fixed + xMax * varCost]], colour: 'bad', label: 'Cost' }
          ],
          marks: [[units, units * price, 'break even']], xlab: 'units sold', alt: 'cost and revenue lines'
        },
        stem: 'The graph shows total cost and total revenue against units sold.',
        q: ask === 'units' ? 'How many units must be sold to break even?'
          : ask === 'fixed' ? 'What are the fixed costs?'
          : 'What is the revenue at the break-even point?',
        choices: options(key, wrongs, fmt),
        why: 'The lines cross at ' + units + ' units, where revenue = cost. The cost line starts at ' + U.money$(fixed) + ' — that vertical intercept IS the fixed cost, paid before a single unit is sold. Revenue at break-even = ' + units + ' × ' + U.money$(price) + ' = ' + U.money$(units * price) + '.'
      };
    }
  ];

  /* --------------------------------------------------------------- the mode */
  /* Exposed so smoke.js can sample hundreds of draws and check what the
     student would actually SEE (§C4) — a duplicated option label eliminates a
     distractor for free, and that only shows up in bulk. */
  MS.Games.displayProblem = function (seed) {
    var rnd = U.seededRandom(seed == null ? 'probe|' + Math.random() : String(seed));
    return U.pick(KINDS)(rnd);
  };

  MS.Games.display = function () {
    var n = 0;
    MS.Games.quiz({
      title: '📊 Read the Display',
      sub: 'Generated displays',
      mode: 'display',
      limit: ROUNDS,
      backTo: '/play',
      bonus: 110,
      help: 'Every display is drawn fresh from generated data, so this mode never repeats. Read the graph before the options — most of the wrong answers are things the display genuinely says, just not the thing you were asked for.',
      supply: function () {
        n++;
        var rnd = U.seededRandom(Date.now() + '|' + n + '|' + Math.random());
        var item = U.pick(KINDS)(rnd);
        item.id = null;
        item.a = 0;
        /* Reuse Bank.shuffleChoices so option order is randomised the same way
           as the static banks, and the key index is computed not assumed. */
        /* id stays null: these are generated, so there is no bank entry to
           record against and nothing for Mistake Rehab to draw later. */
        return MS.Bank.shuffleChoices({
          id: null, mod: item.mod, topic: item.topic, diff: item.diff,
          stem: item.stem, figure: item.figure, q: item.q, why: item.why,
          choices: item.choices, a: 0
        });
      },
      note: 'Box plots, histograms, scatterplots, normal curves, dot plots and break-even graphs — all generated, all different every round.'
    });
  };
})();
