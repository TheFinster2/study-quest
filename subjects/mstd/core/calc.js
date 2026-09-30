/* ============================================================================
   calc.js — procedural problem generators (§4.4, §9.9, §9.10).

   TWO RULES, BOTH LEARNED THE HARD WAY:

   §9.9 ANSWER FIRST. Pick the answer in a known-good range, then derive the
   inputs from it. Never randomise inputs and hope. The reference app's
   titration sim randomised concentrations and volumes independently and
   generated questions that were literally unanswerable — the user hit one in
   normal play. Here that means: pick the integer break-even point then build
   the cost lines through it; pick the triangle then hide a side; pick the tax
   payable then work back to a gross income inside one bracket; pick the
   salvage value then derive the depreciation rate.

   §9.10 DIFFICULTY CONTRACT. Every generator declares `contract`: how many
   steps it takes, the magnitude of the numbers, what shape the answer is, and
   whether a calculator is assumed. tests/validate.js runs 500 samples per
   generator and asserts all of it, plus that the answer is finite and in range.

   Generator return shape:
     { stem?, q, answer, units?, tol?, why, table?, figure?, hint? }
   `answer` is a NUMBER. `tol` overrides the default comparison:
     {money:true} exact to the cent | {tolRel:x} | {tolAbs:x}
   Namespace: window.MS.Calc
   ========================================================================== */
window.MS = window.MS || {};
(function () {
  'use strict';
  var U = window.MS.U, M = window.MS.Money;
  var Calc = { GENS: [] };

  /* ------------------------------------------------------------- helpers */
  function ri(rnd, lo, hi) { return lo + Math.floor(rnd() * (hi - lo + 1)); }
  function pk(rnd, arr) { return arr[Math.floor(rnd() * arr.length)]; }
  function money(dollars) { return U.money$(dollars); }
  function d2(n) { return U.round(n, 2); }
  function nm(rnd) { return pk(rnd, ['Ava', 'Noah', 'Mia', 'Dev', 'Priya', 'Jordan', 'Sam', 'Kai', 'Zara', 'Tomas', 'Lin', 'Rae', 'Omar', 'Ivy', 'Hugo', 'Nina']); }

  /* Register a generator. */
  function G(id, name, mod, topic, diff, contract, gen, verify) {
    Calc.GENS.push({ id: id, nm: name, mod: mod, topic: topic, diff: diff, contract: contract, gen: gen, verify: verify });
  }
  Calc.byId = function (id) {
    for (var i = 0; i < Calc.GENS.length; i++) if (Calc.GENS[i].id === id) return Calc.GENS[i];
    return null;
  };
  /* Build one problem. seed makes it reproducible (daily challenge, tests). */
  Calc.make = function (gen, seed) {
    var rnd = U.seededRandom(seed == null ? Math.floor(Math.random() * 2147483647) : seed);
    var item = gen.gen(rnd);
    item.genId = gen.id; item.mod = gen.mod; item.topic = gen.topic; item.diff = gen.diff;
    item.contract = gen.contract;
    if (!item.tol) item.tol = gen.contract.answer === 'money' ? { money: true } : { tolRel: 0.005 };
    return item;
  };
  Calc.filter = function (o) {
    o = o || {};
    /* The player's question tier applies here as well as in Bank.filter, so
       Calculation Crunch tracks the setting like every other mode. Generators
       bottom out at diff 1 — a generated problem always has real numbers in it
       — so Warm-up maps to the diff-1 generators. */
    var tier = (!o.allTiers && window.MS.State) ? window.MS.State.tierRange() : null;
    return Calc.GENS.filter(function (g) {
      if (o.mod && (Array.isArray(o.mod) ? o.mod.indexOf(g.mod) < 0 : g.mod !== o.mod)) return false;
      if (o.diffMax && g.diff > o.diffMax) return false;
      if (o.diff && g.diff !== o.diff) return false;
      if (tier && g.diff > tier.diffMax) return false;
      if (tier && tier.diffMin > 1 && g.diff < tier.diffMin) return false;
      /* Coverage: a topic the student has hidden drops out of mixed runs. */
      if (tier && !o.mod && window.MS.State.tagHidden && window.MS.State.tagHidden(g.mod)) return false;
      return true;
    });
  };
  Calc.random = function (o) {
    var pool = Calc.filter(o);
    if (!pool.length) pool = Calc.GENS;
    return Calc.make(pool[Math.floor(Math.random() * pool.length)]);
  };

  /* ==================================================== MS-A1 formulae (3) */
  G('a1-sub', 'Substitute into a formula', 'MS-A1', 'Substitution', 1,
    { steps: 1, mag: 'single and double digits', answer: 'decimal2', calculator: false, range: [1, 400] },
    function (rnd) {
      var b = ri(rnd, 4, 20), h = ri(rnd, 3, 18);
      var ans = 0.5 * b * h;
      return {
        q: 'The area of a triangle is A = \\frac{1}{2}bh. Find A when b = ' + b + ' and h = ' + h + '.',
        answer: ans, units: 'square units',
        why: 'A = \\frac{1}{2} \\times ' + b + ' \\times ' + h + ' = ' + ans + ' square units.'
      };
    });

  G('a1-rearr', 'Rearrange and solve', 'MS-A1', 'Rearranging formulae', 2,
    { steps: 2, mag: 'answers under 100', answer: 'decimal2', calculator: false, range: [0.5, 100] },
    function (rnd) {
      /* §9.9: pick h first, then build A from it, so h is always clean. */
      var h = ri(rnd, 3, 24), b = ri(rnd, 4, 20);
      var A = 0.5 * b * h;
      return {
        q: 'A = \\frac{1}{2}bh. Given A = ' + A + ' and b = ' + b + ', find h.',
        answer: h,
        why: 'Rearranging, h = \\frac{2A}{b} = \\frac{2 \\times ' + A + '}{' + b + '} = ' + h + '.'
      };
    });

  G('a1-bac', 'Blood alcohol content', 'MS-A1', 'Blood alcohol content', 2,
    { steps: 2, mag: 'BAC 0 to 0.28', answer: 'decimal3', calculator: true, range: [0, 0.3] },
    function (rnd) {
      var male = rnd() < 0.5;
      var N = ri(rnd, 3, 9), H = ri(rnd, 1, 5), Mkg = ri(rnd, 55, 95);
      var div = male ? 6.8 : 5.5;
      var ans = Math.max(0, (10 * N - 7.5 * H) / (div * Mkg));
      return {
        stem: 'BAC_{' + (male ? 'male' : 'female') + '} = \\frac{10N - 7.5H}{' + div + 'M}, where N is standard drinks, H hours of drinking and M mass in kg.',
        q: nm(rnd) + ' is ' + (male ? 'male' : 'female') + ', has a mass of ' + Mkg + ' kg, and drinks ' + N + ' standard drinks over ' + H + ' hour' + (H === 1 ? '' : 's') + '. Find the estimated BAC, to 3 decimal places.',
        answer: U.round(ans, 3), tol: { tolAbs: 0.0006 },
        why: 'BAC = \\frac{10 \\times ' + N + ' - 7.5 \\times ' + H + '}{' + div + ' \\times ' + Mkg + '} = \\frac{' + d2(10 * N - 7.5 * H) + '}{' + d2(div * Mkg) + '} = ' + U.round(ans, 3) + '.'
      };
    });

  /* =============================================== MS-A2 linear relations (3) */
  G('a2-grad', 'Gradient from two points', 'MS-A2', 'Gradient and intercept', 1,
    { steps: 1, mag: 'gradients −6 to 6', answer: 'decimal2', calculator: false, range: [-6, 6] },
    function (rnd) {
      /* Pick the gradient first so it is never an ugly fraction. */
      var m = pk(rnd, [-6, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6]);
      var x1 = ri(rnd, -6, 4), run = ri(rnd, 1, 5);
      var x2 = x1 + run, y1 = ri(rnd, -8, 8), y2 = y1 + m * run;
      return {
        q: 'Find the gradient of the line through (' + x1 + ', ' + y1 + ') and (' + x2 + ', ' + y2 + ').',
        answer: m,
        why: 'm = \\frac{y_2 - y_1}{x_2 - x_1} = \\frac{' + y2 + ' - (' + y1 + ')}{' + x2 + ' - (' + x1 + ')} = \\frac{' + (y2 - y1) + '}{' + run + '} = ' + m + '.'
      };
    });

  G('a2-line', 'Evaluate a linear model', 'MS-A2', 'Graphing lines', 1,
    { steps: 2, mag: 'outputs under 500', answer: 'money', calculator: false, range: [0, 600] },
    function (rnd) {
      var c = ri(rnd, 20, 90), m = ri(rnd, 3, 15), x = ri(rnd, 4, 30);
      var ans = m * x + c;
      return {
        stem: 'A plumber charges a $' + c + ' call-out fee plus $' + m + ' per 15 minutes on site.',
        q: 'Using C = ' + m + 't + ' + c + ', find the charge for t = ' + x + ' quarter-hour blocks.',
        answer: ans, tol: { money: true },
        why: 'C = ' + m + ' \\times ' + x + ' + ' + c + ' = ' + money(ans) + '. The call-out fee is the y-intercept — it is charged once.'
      };
    });

  G('a2-var', 'Direct variation', 'MS-A2', 'Direct variation', 2,
    { steps: 2, mag: 'k a small decimal or integer', answer: 'decimal2', calculator: true, range: [0.1, 2000] },
    function (rnd) {
      var k = pk(rnd, [1.5, 2, 2.5, 3, 4, 4.5, 6, 8, 12]);
      var x1 = ri(rnd, 3, 12), x2 = ri(rnd, 13, 40);
      var y1 = k * x1, ans = k * x2;
      return {
        stem: 'y varies directly with x.',
        q: 'When x = ' + x1 + ', y = ' + d2(y1) + '. Find y when x = ' + x2 + '.',
        answer: ans,
        why: 'y = kx so k = \\frac{' + d2(y1) + '}{' + x1 + '} = ' + k + '. Then y = ' + k + ' \\times ' + x2 + ' = ' + d2(ans) + '.'
      };
    });

  /* ================================================= MS-M1 measurement (7) */
  G('m1-circle', 'Area of a circle', 'MS-M1', 'Area', 1,
    { steps: 1, mag: 'radius 2–25', answer: 'decimal2', calculator: true, range: [12, 2000] },
    function (rnd) {
      var r = ri(rnd, 2, 25), unit = pk(rnd, ['cm', 'm']);
      var ans = Math.PI * r * r;
      return {
        q: 'Find the area of a circle of radius ' + r + ' ' + unit + ', to 2 decimal places.',
        answer: ans, units: unit + '^2',
        why: 'A = \\pi r^2 = \\pi \\times ' + r + '^2 = ' + d2(ans) + ' ' + unit + '^2.',
        figure: null
      };
    });

  G('m1-cylvol', 'Volume of a cylinder', 'MS-M1', 'Volume and capacity', 2,
    { steps: 2, mag: 'radius 3–30 cm, height 5–60 cm', answer: 'decimal2', calculator: true, range: [100, 200000] },
    function (rnd) {
      var r = ri(rnd, 3, 30), h = ri(rnd, 5, 60);
      var ans = Math.PI * r * r * h;
      return {
        q: 'A cylinder has radius ' + r + ' cm and height ' + h + ' cm. Find its volume in cm^3, to 2 decimal places.',
        answer: ans, units: 'cm^3',
        figure: { kind: 'solid', kind2: 'cylinder', r: r + ' cm', h: h + ' cm', alt: 'a cylinder' },
        why: 'V = \\pi r^2 h = \\pi \\times ' + r + '^2 \\times ' + h + ' = ' + d2(ans) + ' cm^3. Since 1 cm^3 = 1 mL, that is also ' + d2(ans / 1000) + ' L.'
      };
    });

  G('m1-cylsa', 'Surface area of a cylinder', 'MS-M1', 'Surface area', 3,
    { steps: 3, mag: 'radius 3–20 cm', answer: 'decimal2', calculator: true, range: [100, 40000] },
    function (rnd) {
      var r = ri(rnd, 3, 20), h = ri(rnd, 6, 45);
      var ans = 2 * Math.PI * r * r + 2 * Math.PI * r * h;
      return {
        q: 'Find the total surface area of a closed cylinder with radius ' + r + ' cm and height ' + h + ' cm, to 2 decimal places.',
        answer: ans, units: 'cm^2',
        why: 'SA = 2\\pi r^2 + 2\\pi rh = 2\\pi(' + r + ')^2 + 2\\pi(' + r + ')(' + h + ') = ' + d2(2 * Math.PI * r * r) + ' + ' + d2(2 * Math.PI * r * h) + ' = ' + d2(ans) + ' cm^2.'
      };
    });

  G('m1-trap', 'Area of a trapezium', 'MS-M1', 'Area', 2,
    { steps: 2, mag: 'sides 4–30', answer: 'decimal2', calculator: false, range: [10, 900] },
    function (rnd) {
      var a = ri(rnd, 4, 20), b = a + ri(rnd, 2, 14), h = ri(rnd, 3, 20);
      var ans = h / 2 * (a + b);
      return {
        q: 'A trapezium has parallel sides ' + a + ' m and ' + b + ' m, and a perpendicular height of ' + h + ' m. Find its area.',
        answer: ans, units: 'm^2',
        figure: { kind: 'solid', a: a + ' m', b: b + ' m', h: h + ' m', alt: 'a trapezium' },
        why: 'A = \\frac{h}{2}(a+b) = \\frac{' + h + '}{2}(' + a + ' + ' + b + ') = ' + d2(ans) + ' m^2.'
      };
    });

  G('m1-error', 'Percentage error', 'MS-M1', 'Absolute and percentage error', 2,
    { steps: 2, mag: 'errors 0.01% to 25%', answer: 'decimal2', calculator: true, range: [0.001, 30] },
    function (rnd) {
      var prec = pk(rnd, [0.1, 0.5, 1, 5, 10]);
      var measured = ri(rnd, 20, 400) * (prec >= 1 ? 1 : 1);
      var abs = prec / 2;
      var ans = abs / measured * 100;
      return {
        q: 'A length is measured as ' + measured + ' cm, to the nearest ' + (prec === 1 ? 'centimetre' : prec + ' cm') + '. Find the percentage error, to 2 decimal places.',
        answer: ans, units: '%',
        why: 'Absolute error = \\frac{1}{2} \\times ' + prec + ' = ' + abs + ' cm. Percentage error = \\frac{' + abs + '}{' + measured + '} \\times 100 = ' + d2(ans) + '%.'
      };
    });

  G('m1-cap', 'Volume to capacity', 'MS-M1', 'Volume and capacity', 2,
    { steps: 2, mag: 'tanks of 1 kL to 120 kL', answer: 'decimal2', calculator: true, range: [0.5, 130000] },
    function (rnd) {
      var l = ri(rnd, 1, 6), w = ri(rnd, 1, 5), h = ri(rnd, 1, 4);   // metres
      var to = pk(rnd, ['L', 'kL']);
      var m3 = l * w * h;
      var ans = to === 'L' ? m3 * 1000 : m3;
      return {
        q: 'A rectangular tank measures ' + l + ' m by ' + w + ' m by ' + h + ' m. What is its capacity in ' + to + '?',
        answer: ans, units: to,
        why: 'V = ' + l + ' \\times ' + w + ' \\times ' + h + ' = ' + m3 + ' m^3. Since 1 m^3 = 1000 L = 1 kL, that is ' + U.commas(ans) + ' ' + to + '.'
      };
    });

  G('m1-sphere', 'Volume of a sphere', 'MS-M1', 'Volume and capacity', 3,
    { steps: 2, mag: 'radius 2–40 cm', answer: 'decimal2', calculator: true, range: [30, 280000] },
    function (rnd) {
      var r = ri(rnd, 2, 40);
      var ans = 4 / 3 * Math.PI * r * r * r;
      return {
        q: 'Find the volume of a sphere of radius ' + r + ' cm, to 2 decimal places.',
        answer: ans, units: 'cm^3',
        figure: { kind: 'solid', kind2: 'sphere', r: r + ' cm', alt: 'a sphere' },
        why: 'V = \\frac{4}{3}\\pi r^3 = \\frac{4}{3}\\pi(' + r + ')^3 = ' + d2(ans) + ' cm^3.'
      };
    });

  /* ======================================================= MS-M2 time (3) */
  G('m2-elapsed', 'Elapsed time', 'MS-M2', 'Elapsed time', 1,
    { steps: 2, mag: 'under 24 hours', answer: 'integer', calculator: false, range: [15, 1400] },
    function (rnd) {
      var start = ri(rnd, 0, 22) * 60 + pk(rnd, [0, 15, 20, 30, 40, 45]);
      var mins = ri(rnd, 40, 600);
      var end = (start + mins) % 1440;
      return {
        q: 'A train departs at ' + U.fmt24(start) + ' and arrives at ' + U.fmt24(end) + ' the same day' + (start + mins >= 1440 ? ' (after midnight)' : '') + '. How many minutes is the journey?',
        answer: mins, units: 'minutes',
        why: 'From ' + U.fmt24(start) + ' (' + U.fmtClock(start) + ') to ' + U.fmt24(end) + ' is ' + Math.floor(mins / 60) + ' h ' + (mins % 60) + ' min = ' + mins + ' minutes. Across midnight, count up to 2400 first, then add the rest.'
      };
    });

  G('m2-zone', 'Time zones', 'MS-M2', 'Time zones', 2,
    { steps: 2, mag: 'offsets −8 to +12', answer: 'integer', calculator: false, range: [0, 1439] },
    function (rnd) {
      var places = [['Perth', 8], ['Adelaide', 9.5], ['Sydney', 10], ['Auckland', 12], ['London', 0], ['New York', -5], ['Los Angeles', -8], ['Tokyo', 9], ['Singapore', 8]];
      var a = pk(rnd, places), b = pk(rnd, places);
      while (b[1] === a[1]) b = pk(rnd, places);
      var t = ri(rnd, 0, 23) * 60 + pk(rnd, [0, 30]);
      var diff = Math.round((b[1] - a[1]) * 60);
      var ans = ((t + diff) % 1440 + 1440) % 1440;
      return {
        q: 'It is ' + U.fmt24(t) + ' in ' + a[0] + ' (UTC' + (a[1] >= 0 ? '+' : '') + a[1] + '). What is the time in ' + b[0] + ' (UTC' + (b[1] >= 0 ? '+' : '') + b[1] + ')? Answer in minutes after midnight.',
        answer: ans, units: 'minutes after midnight',
        hint: 'Subtract the offsets to get the difference, then apply it.',
        why: 'Difference = ' + b[1] + ' − (' + a[1] + ') = ' + (b[1] - a[1]) + ' hours. ' + U.fmt24(t) + ' ' + (diff >= 0 ? '+' : '−') + ' ' + Math.abs(diff / 60) + ' h = ' + U.fmt24(ans) + ' (' + U.fmtClock(ans) + '), i.e. ' + ans + ' minutes after midnight.'
      };
    });

  G('m2-dec', 'Time as a decimal', 'MS-M2', '12 and 24-hour time', 1,
    { steps: 1, mag: 'under 12 hours', answer: 'decimal2', calculator: false, range: [0.25, 12] },
    function (rnd) {
      var h = ri(rnd, 1, 11), m = pk(rnd, [6, 12, 15, 18, 24, 30, 36, 42, 45, 48, 54]);
      var ans = h + m / 60;
      return {
        q: 'Write ' + h + ' hours ' + m + ' minutes as a decimal number of hours.',
        answer: ans,
        why: m + ' min = \\frac{' + m + '}{60} = ' + d2(m / 60) + ' h, so the total is ' + d2(ans) + ' hours. Writing it as ' + h + '.' + m + ' is the classic error.'
      };
    });

  /* ====================================================== MS-F1 money (7) */
  G('f1-gross', 'Gross pay with overtime', 'MS-F1', 'Overtime', 2,
    { steps: 3, mag: '$700–$2,000 per week', answer: 'money', calculator: true, range: [500, 2500] },
    function (rnd) {
      var rate = ri(rnd, 1000, 2100) * 2 / 100, base = pk(rnd, [35, 36, 38, 40]);
      var ot15 = ri(rnd, 0, 6), ot2 = ri(rnd, 0, 4);
      var ans = rate * base + rate * 1.5 * ot15 + rate * 2 * ot2;
      return {
        stem: nm(rnd) + ' earns ' + money(rate) + ' per hour for a ' + base + '-hour week.',
        q: 'This week ' + (ot15 ? ot15 + ' hours were at time-and-a-half' : 'no hours were at time-and-a-half') + ' and ' + (ot2 ? ot2 + ' hours at double time' : 'none at double time') + '. Find the gross pay.',
        answer: ans, tol: { money: true },
        why: 'Normal: ' + base + ' × ' + money(rate) + ' = ' + money(rate * base) + '. Time-and-a-half: ' + ot15 + ' × ' + money(rate * 1.5) + ' = ' + money(rate * 1.5 * ot15) + '. Double: ' + ot2 + ' × ' + money(rate * 2) + ' = ' + money(rate * 2 * ot2) + '. Total = ' + money(ans) + '.'
      };
    },
    function (item) { return true; });

  G('f1-tax', 'Tax payable', 'MS-F1', 'PAYG tax', 2,
    { steps: 2, mag: 'incomes $20k–$220k', answer: 'money', calculator: true, range: [0, 100000] },
    function (rnd) {
      /* §9.9: pick the bracket, then a whole-dollar income inside it. */
      var b = pk(rnd, M.TAX_BRACKETS.slice(1));
      var top = b.to === Infinity ? 260000 : b.to;
      var income = ri(rnd, Math.ceil(b.from / 1000) + 1, Math.floor(top / 1000)) * 1000;
      var ans = M.d(M.taxOn(income));
      return {
        stem: 'Resident rates: nil to $18,200; 16c/$1 over $18,200; $4,288 + 30c/$1 over $45,000; $31,288 + 37c/$1 over $135,000; $51,638 + 45c/$1 over $190,000.',
        q: 'Find the tax payable on a taxable income of ' + money(income) + '.',
        answer: ans, tol: { money: true },
        why: 'The income sits in the ' + money(b.from) + '+ bracket. Tax = ' + money(b.base) + ' + ' + (b.rate * 100) + 'c × (' + U.commas(income) + ' − ' + U.commas(b.from) + ') = ' + money(ans) + '. The marginal rate applies only above the bracket floor.'
      };
    },
    function (item) { return true; });

  G('f1-net', 'Net income after tax and levy', 'MS-F1', 'PAYG tax', 3,
    { steps: 3, mag: 'incomes $30k–$180k', answer: 'money', calculator: true, range: [20000, 160000] },
    function (rnd) {
      var income = ri(rnd, 30, 180) * 1000;
      var tax = M.taxOn(income), lev = M.medicareOn(income);
      var ans = M.d(income * 100 - tax - lev);
      return {
        q: 'A taxable income of ' + money(income) + ' attracts ' + money(M.d(tax)) + ' income tax and a 2% Medicare levy. Find the net annual income.',
        answer: ans, tol: { money: true },
        why: 'Levy = 0.02 × ' + U.commas(income) + ' = ' + money(M.d(lev)) + '. Net = ' + money(income) + ' − ' + money(M.d(tax)) + ' − ' + money(M.d(lev)) + ' = ' + money(ans) + '.'
      };
    });

  G('f1-gstin', 'GST inside a total', 'MS-F1', 'GST', 2,
    { steps: 1, mag: 'totals $22–$5,500', answer: 'money', calculator: true, range: [2, 500] },
    function (rnd) {
      var ex = ri(rnd, 20, 5000);
      var total = ex * 1.1;
      var ans = total / 11;
      return {
        q: 'A receipt totals ' + money(total) + ', GST inclusive. How much GST is in that total?',
        answer: ans, tol: { money: true },
        why: 'The total is 110% of the pre-GST price, so GST = total ÷ 11 = ' + money(total) + ' ÷ 11 = ' + money(ans) + '. Taking 10% of the inclusive total gives ' + money(total * 0.1) + ', which is too much.'
      };
    },
    function (item) { return true; });

  G('f1-comm', 'Retainer plus commission', 'MS-F1', 'Commission and piecework', 2,
    { steps: 2, mag: 'pay $400–$3,000', answer: 'money', calculator: true, range: [300, 4000] },
    function (rnd) {
      var ret = ri(rnd, 30, 90) * 10, pctv = pk(rnd, [2, 2.5, 3, 3.5, 4, 4.5, 5]);
      var sales = ri(rnd, 40, 400) * 100;
      var ans = ret + sales * pctv / 100;
      return {
        q: nm(rnd) + ' is paid a ' + money(ret) + ' weekly retainer plus ' + pctv + '% commission on sales. Find the gross pay in a week with ' + money(sales) + ' of sales.',
        answer: ans, tol: { money: true },
        why: 'Commission = ' + pctv + '% × ' + money(sales) + ' = ' + money(sales * pctv / 100) + '. Gross = ' + money(ret) + ' + ' + money(sales * pctv / 100) + ' = ' + money(ans) + '.'
      };
    });

  G('f1-loading', 'Annual leave loading', 'MS-F1', 'Allowances and leave loading', 2,
    { steps: 2, mag: 'loading $200–$1,200', answer: 'money', calculator: true, range: [100, 2000] },
    function (rnd) {
      var weekly = ri(rnd, 80, 220) * 10, weeks = pk(rnd, [2, 3, 4]);
      var ans = weekly * weeks * 0.175;
      return {
        q: nm(rnd) + ' earns ' + money(weekly) + ' per week and takes ' + weeks + ' weeks annual leave with 17.5% leave loading. How much is the loading?',
        answer: ans, tol: { money: true },
        why: 'Normal pay for the leave = ' + weeks + ' × ' + money(weekly) + ' = ' + money(weekly * weeks) + '. Loading = 17.5% × ' + money(weekly * weeks) + ' = ' + money(ans) + '. The loading applies to the whole leave period.'
      };
    });

  G('f1-period', 'Convert a pay period', 'MS-F1', 'Wages and salary', 1,
    { steps: 1, mag: 'salaries $40k–$180k', answer: 'decimal2', calculator: true, range: [700, 16000] },
    function (rnd) {
      var annual = ri(rnd, 40, 180) * 1000;
      var to = pk(rnd, ['weekly', 'fortnightly', 'monthly']);
      var n = M.PERIODS[to];
      var ans = annual / n;
      return {
        q: 'An annual salary of ' + money(annual) + ' is paid ' + to + '. Find the gross ' + (to === 'monthly' ? 'monthly' : to.replace('ly', '')) + ' pay.',
        answer: ans, tol: { tolAbs: 0.02 },
        why: 'There are ' + n + ' ' + (to === 'monthly' ? 'months' : to.replace('ly', 's')) + ' in a year: ' + U.commas(annual) + ' ÷ ' + n + ' = ' + money(ans) + '. Note it is 26 fortnights, not 24.'
      };
    });

  /* ==================================================== MS-S1 stats (5) */
  G('s1-mean', 'Mean from a frequency table', 'MS-S1', 'Mean median mode', 2,
    { steps: 3, mag: 'scores 0–10', answer: 'decimal2', calculator: true, range: [0, 12] },
    function (rnd) {
      var rows = [], sf = 0, sfx = 0;
      var lo = ri(rnd, 0, 3);
      for (var s = lo; s < lo + 5; s++) {
        var f = ri(rnd, 1, 9);
        rows.push([s, f]); sf += f; sfx += s * f;
      }
      var ans = sfx / sf;
      return {
        stem: 'The table shows the number of pets owned by students in a class.',
        table: { head: ['Score (x)', 'Frequency (f)', 'fx'], rows: rows.map(function (r) { return [String(r[0]), String(r[1]), String(r[0] * r[1])]; }).concat([['Total', String(sf), String(sfx)]]) },
        q: 'Find the mean, to 2 decimal places.',
        answer: ans,
        why: 'x̄ = \\frac{\\Sigma fx}{\\Sigma f} = \\frac{' + sfx + '}{' + sf + '} = ' + d2(ans) + '.'
      };
    });

  G('s1-iqr', 'Interquartile range', 'MS-S1', 'Range and IQR', 2,
    { steps: 3, mag: 'data 1–60, 11 scores', answer: 'decimal2', calculator: false, range: [1, 50] },
    function (rnd) {
      /* 11 values so the quartiles land on actual data points. */
      var vals = [], v = ri(rnd, 2, 12);
      for (var i = 0; i < 11; i++) { vals.push(v); v += ri(rnd, 1, 6); }
      var q1 = vals[2], q3 = vals[8];
      var ans = q3 - q1;
      return {
        stem: 'Eleven scores, already in order: ' + vals.join(', ') + '.',
        q: 'Find the interquartile range.',
        answer: ans,
        figure: { kind: 'dotplot', values: vals, alt: 'a dot plot of the scores' },
        why: 'With 11 scores the median is the 6th (' + vals[5] + '). Q₁ is the median of the lower five = ' + q1 + ' and Q₃ the median of the upper five = ' + q3 + '. IQR = ' + q3 + ' − ' + q1 + ' = ' + ans + '.'
      };
    });

  G('s1-outlier', 'Outlier boundary', 'MS-S1', 'Outliers', 3,
    { steps: 3, mag: 'boundaries −50 to 200', answer: 'decimal2', calculator: true, range: [-100, 300] },
    function (rnd) {
      var q1 = ri(rnd, 10, 40), iqr = ri(rnd, 4, 25), q3 = q1 + iqr;
      var upper = rnd() < 0.5;
      var ans = upper ? q3 + 1.5 * iqr : q1 - 1.5 * iqr;
      return {
        q: 'A data set has Q₁ = ' + q1 + ' and Q₃ = ' + q3 + '. Find the ' + (upper ? 'upper' : 'lower') + ' boundary beyond which a score is an outlier.',
        answer: ans,
        why: 'IQR = ' + q3 + ' − ' + q1 + ' = ' + iqr + '. 1.5 × IQR = ' + d2(1.5 * iqr) + '. The ' + (upper ? 'upper boundary is Q₃ + 1.5 × IQR = ' + q3 + ' + ' + d2(1.5 * iqr) : 'lower boundary is Q₁ − 1.5 × IQR = ' + q1 + ' − ' + d2(1.5 * iqr)) + ' = ' + d2(ans) + '.'
      };
    });

  G('s1-median', 'Median of a list', 'MS-S1', 'Mean median mode', 1,
    { steps: 2, mag: 'data 1–99', answer: 'decimal2', calculator: false, range: [1, 99] },
    function (rnd) {
      var n = pk(rnd, [8, 10, 12]);
      var vals = [], v = ri(rnd, 3, 15);
      for (var i = 0; i < n; i++) { vals.push(v); v += ri(rnd, 1, 8); }
      var mid = n / 2;
      var ans = (vals[mid - 1] + vals[mid]) / 2;
      var shown = U.shuffle(vals);
      return {
        q: 'Find the median of: ' + shown.join(', ') + '.',
        answer: ans,
        why: 'Ordered: ' + vals.join(', ') + '. With ' + n + ' scores the median is the average of the ' + mid + 'th and ' + (mid + 1) + 'th: \\frac{' + vals[mid - 1] + ' + ' + vals[mid] + '}{2} = ' + d2(ans) + '.'
      };
    });

  G('s1-boxread', 'Read a box plot', 'MS-S1', 'Box plots', 2,
    { steps: 1, mag: 'data 0–100', answer: 'decimal2', calculator: false, range: [0, 100] },
    function (rnd) {
      var min = ri(rnd, 2, 20), q1 = min + ri(rnd, 4, 14), med = q1 + ri(rnd, 3, 12),
          q3 = med + ri(rnd, 3, 14), max = q3 + ri(rnd, 4, 16);
      var want = pk(rnd, ['IQR', 'range', 'median']);
      var ans = want === 'IQR' ? q3 - q1 : want === 'range' ? max - min : med;
      return {
        stem: 'The box plot summarises a set of test marks.',
        figure: { kind: 'boxplot', min: min, q1: q1, med: med, q3: q3, max: max, outliers: [], alt: 'a box plot' },
        q: 'From the box plot, find the ' + want + '.',
        answer: ans,
        why: 'The five-number summary is ' + [min, q1, med, q3, max].join(', ') + '. ' +
             (want === 'IQR' ? 'IQR = Q₃ − Q₁ = ' + q3 + ' − ' + q1 + ' = ' + ans
              : want === 'range' ? 'Range = max − min = ' + max + ' − ' + min + ' = ' + ans
              : 'The median is the line inside the box: ' + ans) + '.'
      };
    });

  /* ================================================ MS-S2 probability (4) */
  G('s2-two', 'Two-stage probability', 'MS-S2', 'Multi-stage events', 2,
    { steps: 2, mag: 'probabilities as decimals', answer: 'decimal4', calculator: true, range: [0.001, 1] },
    function (rnd) {
      var r = ri(rnd, 2, 8), b = ri(rnd, 2, 8), total = r + b;
      var withRep = rnd() < 0.5;
      var ans = withRep ? (r / total) * (r / total) : (r / total) * ((r - 1) / (total - 1));
      return {
        stem: 'A bag holds ' + r + ' red and ' + b + ' blue counters.',
        q: 'Two counters are drawn ' + (withRep ? 'with' : 'without') + ' replacement. Find the probability that both are red, to 4 decimal places.',
        answer: ans, tol: { tolAbs: 0.00006 },
        why: withRep
          ? 'With replacement the probabilities do not change: \\frac{' + r + '}{' + total + '} × \\frac{' + r + '}{' + total + '} = ' + U.round(ans, 4) + '.'
          : 'Without replacement both numbers drop: \\frac{' + r + '}{' + total + '} × \\frac{' + (r - 1) + '}{' + (total - 1) + '} = ' + U.round(ans, 4) + '.'
      };
    });

  G('s2-expected', 'Expected frequency', 'MS-S2', 'Expected frequency', 1,
    { steps: 2, mag: 'trials 40–2,000', answer: 'decimal2', calculator: true, range: [1, 2000] },
    function (rnd) {
      var num = ri(rnd, 1, 5), den = num + ri(rnd, 1, 7), trials = ri(rnd, 4, 200) * 10;
      var ans = trials * num / den;
      return {
        q: 'An event has probability \\frac{' + num + '}{' + den + '}. In ' + U.commas(trials) + ' trials, what is the expected frequency?',
        answer: ans,
        why: 'Expected frequency = P(E) × trials = \\frac{' + num + '}{' + den + '} × ' + U.commas(trials) + ' = ' + d2(ans) + '.'
      };
    });

  G('s2-comp', 'Complementary events', 'MS-S2', 'Complementary events', 1,
    { steps: 2, mag: 'probabilities as decimals', answer: 'decimal4', calculator: true, range: [0, 1] },
    function (rnd) {
      var n = ri(rnd, 2, 4);
      var p = ri(rnd, 60, 95) / 100;
      var ans = 1 - Math.pow(p, n);
      return {
        q: 'A machine works correctly on any given day with probability ' + p + '. Find the probability it fails at least once in ' + n + ' independent days, to 4 decimal places.',
        answer: ans, tol: { tolAbs: 0.00006 },
        why: 'P(never fails) = ' + p + '^' + n + ' = ' + U.round(Math.pow(p, n), 4) + '. "At least once" is the complement: 1 − ' + U.round(Math.pow(p, n), 4) + ' = ' + U.round(ans, 4) + '.'
      };
    });

  G('s2-exp-value', 'Financial expectation', 'MS-S2', 'Expected frequency', 3,
    { steps: 3, mag: 'values −$15 to $60', answer: 'decimal2', calculator: true, range: [-30, 60] },
    function (rnd) {
      var win = ri(rnd, 5, 60), lose = ri(rnd, 1, 15);
      var num = ri(rnd, 1, 4), den = num + ri(rnd, 2, 8);
      var p = num / den;
      var ans = p * win - (1 - p) * lose;
      return {
        q: 'A game pays ' + money(win) + ' with probability \\frac{' + num + '}{' + den + '} and costs you ' + money(lose) + ' otherwise. Find the expected value per game.',
        answer: ans, tol: { tolAbs: 0.005 },
        why: 'E = \\frac{' + num + '}{' + den + '} × ' + win + ' − \\frac{' + (den - num) + '}{' + den + '} × ' + lose + ' = ' + d2(p * win) + ' − ' + d2((1 - p) * lose) + ' = ' + money(ans) + '. ' + (ans > 0 ? 'Favourable to the player.' : 'Unfavourable — over many games you lose.')
      };
    });

  /* ================================================ MS-A4 relationships (4) */
  G('a4-sim', 'Simultaneous equations', 'MS-A4', 'Simultaneous equations', 2,
    { steps: 3, mag: 'solutions −9 to 9 integers', answer: 'integer', calculator: false, range: [-9, 9] },
    function (rnd) {
      /* §9.9: pick the solution, then build two equations through it. */
      var x = ri(rnd, -8, 8), y = ri(rnd, -8, 8);
      var a1 = ri(rnd, 1, 6), b1 = ri(rnd, 1, 6), a2 = ri(rnd, 1, 6), b2 = ri(rnd, -6, -1);
      if (a1 * b2 - a2 * b1 === 0) b2 -= 1;
      var c1 = a1 * x + b1 * y, c2 = a2 * x + b2 * y;
      var want = rnd() < 0.5 ? 'x' : 'y';
      return {
        stem: a1 + 'x + ' + b1 + 'y = ' + c1 + '  and  ' + a2 + 'x ' + (b2 < 0 ? '− ' + Math.abs(b2) : '+ ' + b2) + 'y = ' + c2,
        q: 'Solve simultaneously and give the value of ' + want + '.',
        answer: want === 'x' ? x : y,
        why: 'The solution is x = ' + x + ', y = ' + y + '. Check in the first equation: ' + a1 + '(' + x + ') + ' + b1 + '(' + y + ') = ' + c1 + '. ✓'
      };
    });

  G('a4-break', 'Break-even point', 'MS-A4', 'Break-even analysis', 2,
    { steps: 3, mag: 'break-even 10–400 units, revenue to $24,000', answer: 'integer', calculator: true, range: [5, 30000] },
    function (rnd) {
      /* Pick the integer break-even point FIRST, then build both lines
         through it — randomising costs and prices produces fractional
         break-evens that read like errors (§9.9). */
      var units = ri(rnd, 10, 400);
      var price = ri(rnd, 8, 60);
      var varCost = ri(rnd, 2, price - 3);
      var fixed = units * (price - varCost);
      var wantRevenue = rnd() < 0.4;
      return {
        stem: 'A business has fixed costs of ' + money(fixed) + ' and variable costs of ' + money(varCost) + ' per unit. It sells each unit for ' + money(price) + '.',
        q: wantRevenue ? 'Find the revenue at the break-even point.' : 'How many units must it sell to break even?',
        answer: wantRevenue ? units * price : units,
        tol: wantRevenue ? { money: true } : { tolAbs: 0.5 },
        units: wantRevenue ? null : 'units',
        figure: {
          kind: 'lines', x0: 0, x1: Math.round(units * 1.8), y0: 0, y1: Math.round(units * price * 1.8),
          lines: [
            { pts: [[0, 0], [Math.round(units * 1.8), Math.round(units * 1.8) * price]], colour: 'good', label: 'Revenue' },
            { pts: [[0, fixed], [Math.round(units * 1.8), fixed + Math.round(units * 1.8) * varCost]], colour: 'bad', label: 'Cost' }
          ],
          marks: [[units, units * price, 'break even']], xlab: 'units', alt: 'cost and revenue lines crossing'
        },
        why: 'Break even where revenue = cost: ' + price + 'n = ' + fixed + ' + ' + varCost + 'n, so ' + (price - varCost) + 'n = ' + fixed + ' and n = ' + units + ' units. Revenue there = ' + units + ' × ' + money(price) + ' = ' + money(units * price) + '.'
      };
    });

  G('a4-quad', 'Quadratic model', 'MS-A4', 'Quadratic models', 3,
    { steps: 2, mag: 'heights under 200 m', answer: 'decimal2', calculator: true, range: [0, 400] },
    function (rnd) {
      /* Pick the roots so the model factorises and the vertex is clean. */
      var t2 = ri(rnd, 4, 12), k = pk(rnd, [4, 5, 6, 8, 10]);
      // h = k*t*(t2 - t): zero at t=0 and t=t2, max at t2/2
      var wantMax = rnd() < 0.5;
      var tq = wantMax ? t2 / 2 : ri(rnd, 1, t2 - 1);
      var ans = k * tq * (t2 - tq);
      return {
        stem: 'A ball\'s height in metres is modelled by h = ' + k + 't(' + t2 + ' − t), where t is in seconds.',
        q: wantMax ? 'Find the maximum height reached.' : 'Find the height at t = ' + tq + ' seconds.',
        answer: ans, units: 'm',
        why: wantMax
          ? 'The roots are t = 0 and t = ' + t2 + ', so by symmetry the maximum is at t = ' + (t2 / 2) + '. h = ' + k + ' × ' + (t2 / 2) + ' × ' + (t2 - t2 / 2) + ' = ' + d2(ans) + ' m.'
          : 'h = ' + k + ' × ' + tq + ' × (' + t2 + ' − ' + tq + ') = ' + k + ' × ' + tq + ' × ' + (t2 - tq) + ' = ' + d2(ans) + ' m.'
      };
    });

  G('a4-exp', 'Exponential model', 'MS-A4', 'Exponential models', 3,
    { steps: 2, mag: 'growth over 2–12 periods', answer: 'decimal2', calculator: true, range: [1, 500000] },
    function (rnd) {
      var A0 = ri(rnd, 2, 40) * 50, r = pk(rnd, [0.05, 0.08, 0.1, 0.12, 0.15, -0.1, -0.15, -0.2]);
      var n = ri(rnd, 2, 12);
      var ans = A0 * Math.pow(1 + r, n);
      return {
        q: 'A population is modelled by P = ' + U.commas(A0) + '(' + d2(1 + r) + ')^t. Find P when t = ' + n + ', to 2 decimal places.',
        answer: ans,
        why: 'P = ' + U.commas(A0) + ' × ' + d2(1 + r) + '^' + n + ' = ' + d2(ans) + '. ' + (r > 0 ? 'A base above 1 means growth.' : 'A base below 1 means decay.')
      };
    });

  /* ================================================== MS-M6 trigonometry (7) */
  var TRIPLES = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [20, 21, 29], [9, 40, 41], [6, 8, 10], [9, 12, 15], [10, 24, 26], [12, 16, 20]];

  G('m6-pyth', 'Pythagoras', 'MS-M6', 'Pythagoras', 1,
    { steps: 2, mag: 'sides 3–82', answer: 'decimal2', calculator: true, range: [1, 90] },
    function (rnd) {
      /* §9.9: use a real triple so the answer is exact, not a surd. */
      var t = pk(rnd, TRIPLES), k = pk(rnd, [1, 1, 1, 2]);
      var a = t[0] * k, b = t[1] * k, c = t[2] * k;
      var findHyp = rnd() < 0.55;
      return {
        q: findHyp
          ? 'A right-angled triangle has shorter sides ' + a + ' cm and ' + b + ' cm. Find the hypotenuse.'
          : 'A right-angled triangle has hypotenuse ' + c + ' cm and one shorter side ' + a + ' cm. Find the other shorter side.',
        answer: findHyp ? c : b, units: 'cm',
        figure: { kind: 'triangle', sides: { a: a, b: c, c: b }, right: true, show: findHyp ? { a: a + ' cm', c: b + ' cm', b: '?' } : { b: c + ' cm', a: a + ' cm', c: '?' }, alt: 'a right-angled triangle' },
        why: findHyp
          ? 'c² = a² + b² = ' + a + '² + ' + b + '² = ' + (a * a) + ' + ' + (b * b) + ' = ' + (c * c) + ', so c = ' + c + ' cm.'
          : 'b² = c² − a² = ' + (c * c) + ' − ' + (a * a) + ' = ' + (b * b) + ', so b = ' + b + ' cm.'
      };
    });

  G('m6-soh', 'Right-angled trigonometry', 'MS-M6', 'Right-angled trigonometry', 2,
    { steps: 2, mag: 'sides 2–80, angles 15°–75°', answer: 'decimal2', calculator: true, range: [0.5, 200] },
    function (rnd) {
      var ang = ri(rnd, 15, 75), hyp = ri(rnd, 5, 60);
      var which = pk(rnd, ['opp', 'adj']);
      var ans = which === 'opp' ? hyp * Math.sin(ang * Math.PI / 180) : hyp * Math.cos(ang * Math.PI / 180);
      return {
        q: 'In a right-angled triangle the hypotenuse is ' + hyp + ' m and one angle is ' + ang + '\\deg. Find the side ' + (which === 'opp' ? 'opposite' : 'adjacent to') + ' that angle, to 2 decimal places.',
        answer: ans, units: 'm',
        why: which === 'opp'
          ? '\\sin ' + ang + '\\deg = \\frac{opp}{' + hyp + '}, so opp = ' + hyp + ' \\sin ' + ang + '\\deg = ' + d2(ans) + ' m.'
          : '\\cos ' + ang + '\\deg = \\frac{adj}{' + hyp + '}, so adj = ' + hyp + ' \\cos ' + ang + '\\deg = ' + d2(ans) + ' m.'
      };
    });

  G('m6-sine', 'Sine rule (side)', 'MS-M6', 'Sine rule', 2,
    { steps: 2, mag: 'sides 5–120', answer: 'decimal2', calculator: true, range: [1, 300] },
    function (rnd) {
      /* Pick TWO angles that leave room for a third, then a side. The
         triangle is guaranteed to close, so nothing is impossible (§9.9). */
      var A = ri(rnd, 25, 85), B = ri(rnd, 25, 150 - A);
      var a = ri(rnd, 5, 60);
      var ans = a * Math.sin(B * Math.PI / 180) / Math.sin(A * Math.PI / 180);
      return {
        stem: 'In triangle ABC, angle A = ' + A + '\\deg, angle B = ' + B + '\\deg and side a = ' + a + ' cm.',
        q: 'Find side b, to 2 decimal places.',
        answer: ans, units: 'cm',
        figure: { kind: 'triangle', sides: { a: a }, angles: { A: A, B: B, C: 180 - A - B }, show: { a: a + ' cm', b: '?', A: A + '°', B: B + '°' }, alt: 'triangle ABC' },
        why: '\\frac{a}{\\sin A} = \\frac{b}{\\sin B}, so b = \\frac{' + a + ' \\sin ' + B + '\\deg}{\\sin ' + A + '\\deg} = ' + d2(ans) + ' cm. Use the sine rule whenever you have a side paired with its opposite angle.'
      };
    });

  G('m6-cos-side', 'Cosine rule (side)', 'MS-M6', 'Cosine rule', 2,
    { steps: 2, mag: 'sides 4–90', answer: 'decimal2', calculator: true, range: [1, 200] },
    function (rnd) {
      var b = ri(rnd, 5, 50), c = ri(rnd, 5, 50), A = ri(rnd, 20, 150);
      var ans = Math.sqrt(b * b + c * c - 2 * b * c * Math.cos(A * Math.PI / 180));
      return {
        stem: 'In triangle ABC, b = ' + b + ' m, c = ' + c + ' m and the included angle A = ' + A + '\\deg.',
        q: 'Find side a, to 2 decimal places.',
        answer: ans, units: 'm',
        figure: { kind: 'triangle', sides: { b: b, c: c }, angles: { A: A }, show: { b: b + ' m', c: c + ' m', a: '?', A: A + '°' }, alt: 'triangle ABC' },
        why: 'a² = b² + c² − 2bc\\cos A = ' + (b * b) + ' + ' + (c * c) + ' − 2(' + b + ')(' + c + ')\\cos ' + A + '\\deg = ' + d2(b * b + c * c - 2 * b * c * Math.cos(A * Math.PI / 180)) + ', so a = ' + d2(ans) + ' m.'
      };
    });

  G('m6-cos-ang', 'Cosine rule (angle)', 'MS-M6', 'Cosine rule', 3,
    { steps: 2, mag: 'angles 20°–160°', answer: 'decimal2', calculator: true, range: [5, 175] },
    function (rnd) {
      /* Build a triangle that actually closes, then hide the angle. */
      var a, b, c, tries = 0;
      do {
        a = ri(rnd, 5, 30); b = ri(rnd, 5, 30); c = ri(rnd, 5, 30); tries++;
      } while (tries < 60 && !(a + b > c + 1 && a + c > b + 1 && b + c > a + 1));
      if (!(a + b > c + 1 && a + c > b + 1 && b + c > a + 1)) { a = 7; b = 9; c = 12; }
      var cosC = (a * a + b * b - c * c) / (2 * a * b);
      var ans = Math.acos(U.clamp(cosC, -1, 1)) * 180 / Math.PI;
      return {
        stem: 'Triangle ABC has a = ' + a + ' cm, b = ' + b + ' cm and c = ' + c + ' cm.',
        q: 'Find angle C, to 2 decimal places (in degrees).',
        answer: ans, units: 'degrees',
        figure: { kind: 'triangle', sides: { a: a, b: b, c: c }, show: { a: a + ' cm', b: b + ' cm', c: c + ' cm', C: '?' }, alt: 'triangle ABC with all sides labelled' },
        why: '\\cos C = \\frac{a² + b² − c²}{2ab} = \\frac{' + (a * a) + ' + ' + (b * b) + ' − ' + (c * c) + '}{2(' + a + ')(' + b + ')} = ' + U.round(cosC, 4) + ', so C = ' + d2(ans) + '\\deg. Three sides known means cosine rule, always.'
      };
    });

  G('m6-area', 'Area rule', 'MS-M6', 'Area rule', 2,
    { steps: 2, mag: 'areas 5–1,200', answer: 'decimal2', calculator: true, range: [1, 2000] },
    function (rnd) {
      var a = ri(rnd, 4, 45), b = ri(rnd, 4, 45), C = ri(rnd, 20, 155);
      var ans = 0.5 * a * b * Math.sin(C * Math.PI / 180);
      return {
        q: 'A triangular block has two sides of ' + a + ' m and ' + b + ' m with an included angle of ' + C + '\\deg. Find its area, to 2 decimal places.',
        answer: ans, units: 'm^2',
        figure: { kind: 'triangle', sides: { a: a, b: b }, angles: { C: C }, show: { a: a + ' m', b: b + ' m', C: C + '°' }, alt: 'a triangular block' },
        why: 'A = \\frac{1}{2}ab\\sin C = \\frac{1}{2}(' + a + ')(' + b + ')\\sin ' + C + '\\deg = ' + d2(ans) + ' m². The angle must be BETWEEN the two sides.'
      };
    });

  G('m6-bearing', 'Bearings distance', 'MS-M6', 'Bearings', 3,
    { steps: 3, mag: 'distances 5–120 km', answer: 'decimal2', calculator: true, range: [1, 300] },
    function (rnd) {
      var b1 = ri(rnd, 0, 35) * 10, turn = ri(rnd, 40, 140);
      var b2 = (b1 + turn) % 360;
      var d1 = ri(rnd, 5, 60), d2v = ri(rnd, 5, 60);
      var included = 180 - turn;
      var ans = Math.sqrt(d1 * d1 + d2v * d2v - 2 * d1 * d2v * Math.cos(included * Math.PI / 180));
      return {
        stem: 'A yacht sails ' + d1 + ' km from O on a bearing of ' + String(b1).padStart(3, '0') + '\\deg to A, then ' + d2v + ' km on a bearing of ' + String(b2).padStart(3, '0') + '\\deg to B.',
        q: 'Find the distance OB, to 2 decimal places.',
        answer: ans, units: 'km',
        figure: { kind: 'bearings', legs: [{ bearing: b1, dist: d1, to: 'A' }, { bearing: b2, dist: d2v, to: 'B' }], close: true, unit: 'km', alt: 'a two-leg bearings diagram' },
        why: 'The interior angle at A is 180\\deg − ' + turn + '\\deg = ' + included + '\\deg. By the cosine rule, OB² = ' + d1 + '² + ' + d2v + '² − 2(' + d1 + ')(' + d2v + ')\\cos ' + included + '\\deg, giving OB = ' + d2(ans) + ' km.'
      };
    });

  /* ==================================================== MS-M7 rates (6) */
  G('m7-fuel', 'Fuel consumption', 'MS-M7', 'Fuel consumption', 2,
    { steps: 2, mag: '4.5–16.5 L/100 km, or up to 150 L used', answer: 'decimal2', calculator: true, range: [2, 200] },
    function (rnd) {
      /* Pick the rate first, then derive litres from a clean distance. */
      var rate = ri(rnd, 45, 165) / 10, km = ri(rnd, 12, 90) * 10;
      var litres = rate * km / 100;
      var wantLitres = rnd() < 0.5;
      return {
        q: wantLitres
          ? 'A car uses fuel at ' + rate + ' L/100 km. How many litres does it use over ' + U.commas(km) + ' km?'
          : 'A car uses ' + d2(litres) + ' L over ' + U.commas(km) + ' km. Find its fuel consumption in L/100 km.',
        answer: wantLitres ? litres : rate,
        units: wantLitres ? 'L' : 'L/100 km',
        why: wantLitres
          ? 'Litres = \\frac{' + rate + '}{100} × ' + km + ' = ' + d2(litres) + ' L.'
          : 'Rate = \\frac{' + d2(litres) + '}{' + km + '} × 100 = ' + d2(rate) + ' L/100 km.'
      };
    });

  G('m7-scale', 'Scale drawing', 'MS-M7', 'Scale drawings', 2,
    { steps: 2, mag: 'real lengths 0.5–200 m', answer: 'decimal2', calculator: true, range: [0.1, 400] },
    function (rnd) {
      var scale = pk(rnd, [50, 100, 150, 200, 250, 500, 1000]);
      var drawCm = ri(rnd, 15, 180) / 10;
      var ans = drawCm * scale / 100;
      return {
        q: 'A plan is drawn to a scale of 1:' + scale + '. A wall measures ' + drawCm + ' cm on the plan. Find its real length in metres.',
        answer: ans, units: 'm',
        why: 'Real length = ' + drawCm + ' × ' + scale + ' = ' + U.commas(d2(drawCm * scale)) + ' cm = ' + d2(ans) + ' m. Divide by 100 to convert centimetres to metres at the end.'
      };
    });

  G('m7-ratio', 'Divide in a ratio', 'MS-M7', 'Dividing quantities', 1,
    { steps: 2, mag: 'totals $60–$6,000', answer: 'money', calculator: true, range: [10, 6000] },
    function (rnd) {
      var p = ri(rnd, 1, 7), q = ri(rnd, 1, 7);
      var parts = p + q;
      var each = ri(rnd, 10, 300);
      var total = parts * each;                     // §9.9: keeps shares whole
      var which = rnd() < 0.5;
      var ans = (which ? p : q) * each;
      return {
        q: money(total) + ' is divided in the ratio ' + p + ':' + q + '. Find the ' + (which ? 'larger-numbered first' : 'second') + ' share' + (p === q ? '' : '') + '.',
        answer: ans, tol: { money: true },
        why: 'Total parts = ' + p + ' + ' + q + ' = ' + parts + '. One part = ' + money(total) + ' ÷ ' + parts + ' = ' + money(each) + '. The ' + (which ? p : q) + '-part share = ' + (which ? p : q) + ' × ' + money(each) + ' = ' + money(ans) + '.'
      };
    });

  G('m7-energy', 'Energy cost', 'MS-M7', 'Energy and power', 2,
    { steps: 3, mag: 'costs $0.50–$1,200', answer: 'decimal2', calculator: true, range: [0.05, 1500] },
    function (rnd) {
      var watts = pk(rnd, [60, 150, 400, 800, 1200, 2000, 2400, 3600]);
      /* cost lands on fractions of a cent, so the contract is decimal2 */
      var hours = ri(rnd, 1, 8), days = pk(rnd, [7, 14, 30, 90]);
      var cents = ri(rnd, 22, 45);
      var kwh = watts / 1000 * hours * days;
      var ans = kwh * cents / 100;
      return {
        q: 'A ' + watts + ' W appliance runs ' + hours + ' hour' + (hours === 1 ? '' : 's') + ' a day for ' + days + ' days. At ' + cents + 'c per kWh, what does it cost to run?',
        answer: ans, tol: { money: true },
        why: 'Power = ' + (watts / 1000) + ' kW. Energy = ' + (watts / 1000) + ' × ' + hours + ' × ' + days + ' = ' + d2(kwh) + ' kWh. Cost = ' + d2(kwh) + ' × ' + money(cents / 100) + ' = ' + money(ans) + '.'
      };
    });

  G('m7-best', 'Best buy', 'MS-M7', 'Best buy', 2,
    { steps: 3, mag: 'unit prices under $5', answer: 'decimal2', calculator: true, range: [0.01, 20] },
    function (rnd) {
      var g1 = pk(rnd, [250, 375, 400, 500]), p1 = ri(rnd, 250, 800) / 100;
      var g2 = pk(rnd, [750, 800, 1000, 1200]), p2 = ri(rnd, 500, 1800) / 100;
      var u1 = p1 / g1 * 100, u2 = p2 / g2 * 100;
      var ans = Math.min(u1, u2);
      return {
        stem: 'Pack A: ' + g1 + ' g for ' + money(p1) + '. Pack B: ' + g2 + ' g for ' + money(p2) + '.',
        q: 'Find the unit price of the better buy, in dollars per 100 g, to 2 decimal places.',
        answer: ans,
        why: 'A: ' + money(p1) + ' ÷ ' + (g1 / 100) + ' = ' + money(u1) + ' per 100 g. B: ' + money(p2) + ' ÷ ' + (g2 / 100) + ' = ' + money(u2) + ' per 100 g. Pack ' + (u1 < u2 ? 'A' : 'B') + ' is the better buy at ' + money(ans) + ' per 100 g.'
      };
    });

  G('m7-speed', 'Convert a speed', 'MS-M7', 'Unit rates', 1,
    { steps: 1, mag: '5–130 km/h either way', answer: 'decimal2', calculator: true, range: [1, 500] },
    function (rnd) {
      var toMs = rnd() < 0.5;
      var kmh = ri(rnd, 5, 130);
      var ans = toMs ? kmh / 3.6 : kmh * 3.6;
      return {
        q: toMs ? 'Convert ' + kmh + ' km/h to m/s, to 2 decimal places.' : 'Convert ' + kmh + ' m/s to km/h, to 2 decimal places.',
        answer: ans, units: toMs ? 'm/s' : 'km/h',
        why: toMs ? 'Divide by 3.6: ' + kmh + ' ÷ 3.6 = ' + d2(ans) + ' m/s.' : 'Multiply by 3.6: ' + kmh + ' × 3.6 = ' + d2(ans) + ' km/h.'
      };
    });

  /* =============================================== MS-F4 investments (8) */
  G('f4-simple', 'Simple interest', 'MS-F4', 'Simple interest', 1,
    { steps: 2, mag: 'principal $500–$40,000', answer: 'money', calculator: true, range: [10, 30000] },
    function (rnd) {
      var P = ri(rnd, 5, 400) * 100, r = ri(rnd, 20, 90) / 1000, n = ri(rnd, 2, 10);
      var ans = P * r * n;
      return {
        q: money(P) + ' is invested at ' + d2(r * 100) + '% p.a. simple interest for ' + n + ' years. How much interest is earned?',
        answer: ans, tol: { money: true },
        why: 'I = Prn = ' + U.commas(P) + ' × ' + r + ' × ' + n + ' = ' + money(ans) + '. Simple interest is the same every year — it does not compound.'
      };
    },
    function (item) { return true; });

  G('f4-comp', 'Compound interest final value', 'MS-F4', 'Compound interest', 2,
    { steps: 3, mag: 'principal $1,000–$60,000', answer: 'money', calculator: true, range: [1000, 200000] },
    function (rnd) {
      var P = ri(rnd, 10, 600) * 100;
      var annual = pk(rnd, [0.03, 0.04, 0.045, 0.05, 0.06, 0.07, 0.08]);
      var per = pk(rnd, [['annually', 1], ['half-yearly', 2], ['quarterly', 4], ['monthly', 12]]);
      var years = ri(rnd, 2, 8);
      var r = annual / per[1], n = years * per[1];
      var ans = M.d(M.compoundClosed(M.c(P), r, n));
      return {
        q: money(P) + ' is invested at ' + d2(annual * 100) + '% p.a. compounded ' + per[0] + ' for ' + years + ' years. Find the final value.',
        answer: ans, tol: { tolRel: 0.0005 },
        why: 'Rate per period r = ' + d2(annual * 100) + '% ÷ ' + per[1] + ' = ' + U.round(r, 6) + ', and n = ' + years + ' × ' + per[1] + ' = ' + n + ' periods. FV = ' + U.commas(P) + '(1 + ' + U.round(r, 6) + ')^' + n + ' = ' + money(ans) + '.'
      };
    },
    function (item) { return true; });

  G('f4-compi', 'Compound interest earned', 'MS-F4', 'Compound interest', 2,
    { steps: 3, mag: 'interest $100–$40,000', answer: 'money', calculator: true, range: [50, 80000] },
    function (rnd) {
      var P = ri(rnd, 10, 500) * 100;
      var annual = pk(rnd, [0.04, 0.05, 0.06, 0.07, 0.08]);
      var years = ri(rnd, 3, 12);
      var fv = M.compoundClosed(M.c(P), annual, years);
      var ans = M.d(fv - M.c(P));
      return {
        q: money(P) + ' is invested at ' + d2(annual * 100) + '% p.a. compounded annually for ' + years + ' years. How much INTEREST is earned?',
        answer: ans, tol: { tolRel: 0.0005 },
        why: 'FV = ' + U.commas(P) + '(1.' + String(Math.round(annual * 100)).padStart(2, '0') + ')^' + years + ' = ' + money(M.d(fv)) + '. Interest = FV − PV = ' + money(M.d(fv)) + ' − ' + money(P) + ' = ' + money(ans) + '. The formula gives the total, not the interest.'
      };
    });

  G('f4-depstr', 'Straight-line depreciation', 'MS-F4', 'Straight-line depreciation', 2,
    { steps: 2, mag: 'values $2,000–$90,000', answer: 'money', calculator: true, range: [0, 90000] },
    function (rnd) {
      var V0 = ri(rnd, 20, 900) * 100, years = ri(rnd, 3, 10);
      var perYear = Math.round(V0 / ri(rnd, 6, 14) / 10) * 10;
      var ans = Math.max(0, V0 - perYear * years);
      return {
        q: 'Equipment worth ' + money(V0) + ' depreciates by ' + money(perYear) + ' each year using the straight-line method. Find its value after ' + years + ' years.',
        answer: ans, tol: { money: true },
        why: 'S = V₀ − Dn = ' + U.commas(V0) + ' − ' + perYear + ' × ' + years + ' = ' + money(ans) + '. Straight-line takes the same dollar amount off every year and does eventually reach zero.'
      };
    });

  G('f4-depdec', 'Declining-balance depreciation', 'MS-F4', 'Declining-balance depreciation', 3,
    { steps: 3, mag: 'values $1,500–$80,000', answer: 'money', calculator: true, range: [100, 80000] },
    function (rnd) {
      var V0 = ri(rnd, 15, 800) * 100, rate = pk(rnd, [0.1, 0.125, 0.15, 0.2, 0.25, 0.3]);
      var years = ri(rnd, 2, 8);
      var ans = M.d(M.compoundClosed(M.c(V0), -rate, years));
      return {
        q: 'A vehicle worth ' + money(V0) + ' depreciates at ' + d2(rate * 100) + '% p.a. by the declining-balance method. Find its value after ' + years + ' years.',
        answer: ans, tol: { tolRel: 0.0005 },
        why: 'S = V₀(1 − r)^n = ' + U.commas(V0) + '(1 − ' + rate + ')^' + years + ' = ' + U.commas(V0) + ' × ' + U.round(Math.pow(1 - rate, years), 6) + ' = ' + money(ans) + '. Declining balance takes a percentage of what is LEFT, so it never quite reaches zero.'
      };
    });

  G('f4-deprate', 'Depreciation rate from salvage value', 'MS-F4', 'Declining-balance depreciation', 3,
    { steps: 3, mag: 'rates 3%–50%', answer: 'decimal2', calculator: true, range: [1, 60] },
    function (rnd) {
      /* §9.9 exactly as written in the brief: pick the salvage value and the
         term, then DERIVE the rate. */
      var V0 = ri(rnd, 20, 600) * 100;
      var years = ri(rnd, 3, 10);
      var salvage = Math.round(V0 * (ri(rnd, 15, 70) / 100) / 100) * 100;
      var ans = M.depDecliningRate(M.c(V0), M.c(salvage), years) * 100;
      return {
        q: 'An asset worth ' + money(V0) + ' is expected to be worth ' + money(salvage) + ' after ' + years + ' years. Find the annual declining-balance depreciation rate, as a percentage to 2 decimal places.',
        answer: ans, units: '%',
        why: 'S = V₀(1 − r)^n, so (1 − r) = \\left(\\frac{' + U.commas(salvage) + '}{' + U.commas(V0) + '}\\right)^{1/' + years + '} = ' + U.round(Math.pow(salvage / V0, 1 / years), 5) + '. Then r = ' + d2(ans) + '%.'
      };
    });

  G('f4-yield', 'Dividend yield', 'MS-F4', 'Shares and dividends', 2,
    { steps: 2, mag: 'yields 1%–9%, dividends 1c–$5.40', answer: 'decimal2', calculator: true, range: [0.005, 20] },
    function (rnd) {
      var price = ri(rnd, 150, 6000) / 100;
      var yieldPct = ri(rnd, 10, 90) / 10;
      var div = price * yieldPct / 100;
      var wantYield = rnd() < 0.6;
      return {
        q: wantYield
          ? 'A share trading at ' + money(price) + ' pays an annual dividend of ' + U.round(div * 100, 2) + 'c per share. Find the dividend yield, as a percentage to 2 decimal places.'
          : 'A share trading at ' + money(price) + ' has a dividend yield of ' + yieldPct + '%. Find the annual dividend per share, in dollars.',
        answer: wantYield ? yieldPct : div,
        tol: wantYield ? { tolAbs: 0.02 } : { tolAbs: 0.005 },
        units: wantYield ? '%' : null,
        why: wantYield
          ? 'Yield = \\frac{dividend}{price} × 100 = \\frac{' + d2(div) + '}{' + d2(price) + '} × 100 = ' + d2(yieldPct) + '%.'
          : 'Dividend = yield × price = ' + yieldPct + '% × ' + money(price) + ' = ' + money(div) + ' per share.'
      };
    });

  G('f4-infl', 'Inflation', 'MS-F4', 'Inflation', 2,
    { steps: 2, mag: 'prices $5–$500 inflated', answer: 'decimal2', calculator: true, range: [1, 20000] },
    function (rnd) {
      var price = ri(rnd, 50, 5000) / 10, rate = pk(rnd, [0.02, 0.025, 0.03, 0.035, 0.04, 0.05, 0.06]);
      var years = ri(rnd, 3, 15);
      var ans = price * Math.pow(1 + rate, years);
      return {
        q: 'An item costs ' + money(price) + ' today. If inflation runs at ' + d2(rate * 100) + '% p.a., what will it cost in ' + years + ' years?',
        answer: ans, tol: { tolRel: 0.0005 },
        why: 'Inflation compounds: cost = ' + d2(price) + '(1 + ' + rate + ')^' + years + ' = ' + money(ans) + '.'
      };
    });

  /* ===================================================== MS-F5 annuities (5) */
  G('f5-fvtable', 'Future value from the table', 'MS-F5', 'Using annuity tables', 2,
    { steps: 2, mag: 'balances $500–$3.3M at 30 periods', answer: 'decimal2', calculator: true, range: [400, 4000000] },
    function (rnd) {
      var A = window.MS.ANNUITY;
      var ri2 = ri(rnd, 0, A.rates.length - 1);
      var pi = ri(rnd, 2, A.periods.length - 1);
      var rate = A.rates[ri2], n = A.periods[pi];
      var factor = window.MS.annuityFactor('fv', n, rate);
      var contrib = ri(rnd, 10, 400) * 50;
      var ans = contrib * factor;
      return {
        stem: 'Use the future value interest factor table. The factor for ' + n + ' periods at ' + A.rateLabels[ri2] + ' per period is ' + factor.toFixed(4) + '.',
        q: money(contrib) + ' is contributed at the end of each period for ' + n + ' periods at ' + A.rateLabels[ri2] + ' per period. Find the future value.',
        answer: ans, tol: { tolRel: 0.0005 },
        why: 'FV = contribution × factor = ' + U.commas(contrib) + ' × ' + factor.toFixed(4) + ' = ' + money(ans) + '. Read the ROW for periods and the COLUMN for the rate per period.'
      };
    },
    function (item) { return true; });

  G('f5-pvtable', 'Present value from the table', 'MS-F5', 'Using annuity tables', 2,
    { steps: 2, mag: 'loans $500–$700,000', answer: 'decimal2', calculator: true, range: [400, 800000] },
    function (rnd) {
      var A = window.MS.ANNUITY;
      var ri2 = ri(rnd, 0, A.rates.length - 1);
      var pi = ri(rnd, 2, A.periods.length - 1);
      var rate = A.rates[ri2], n = A.periods[pi];
      var factor = window.MS.annuityFactor('pv', n, rate);
      var pay = ri(rnd, 10, 500) * 50;
      var ans = pay * factor;
      return {
        stem: 'Use the present value interest factor table. The factor for ' + n + ' periods at ' + A.rateLabels[ri2] + ' per period is ' + factor.toFixed(4) + '.',
        q: 'A loan is repaid with ' + money(pay) + ' at the end of each period for ' + n + ' periods at ' + A.rateLabels[ri2] + ' per period. How much was borrowed?',
        answer: ans, tol: { tolRel: 0.0005 },
        why: 'PV = payment × factor = ' + U.commas(pay) + ' × ' + factor.toFixed(4) + ' = ' + money(ans) + '. This is the amount the repayments are worth today.'
      };
    });

  G('f5-repay', 'Repayment from the PV factor', 'MS-F5', 'Loan repayment schedules', 3,
    { steps: 3, mag: 'repayments $20–$300,000 depending on term', answer: 'decimal2', calculator: true, range: [20, 400000] },
    function (rnd) {
      var A = window.MS.ANNUITY;
      var ri2 = ri(rnd, 0, 6);
      var pi = ri(rnd, 4, A.periods.length - 1);
      var rate = A.rates[ri2], n = A.periods[pi];
      var factor = window.MS.annuityFactor('pv', n, rate);
      var principal = ri(rnd, 20, 600) * 500;
      var ans = principal / factor;
      return {
        stem: 'The present value factor for ' + n + ' periods at ' + A.rateLabels[ri2] + ' per period is ' + factor.toFixed(4) + '.',
        q: money(principal) + ' is borrowed and repaid over ' + n + ' equal end-of-period repayments. Find the repayment.',
        answer: ans, tol: { tolRel: 0.001 },
        why: 'Principal = repayment × factor, so repayment = \\frac{' + U.commas(principal) + '}{' + factor.toFixed(4) + '} = ' + money(ans) + '. Divide by the factor to go from loan to repayment; multiply to go the other way.'
      };
    });

  G('f5-super', 'Superannuation balance', 'MS-F5', 'Superannuation', 3,
    { steps: 3, mag: 'balances $10,000–$900,000', answer: 'money', calculator: true, range: [5000, 1500000] },
    function (rnd) {
      var contrib = ri(rnd, 10, 100) * 100;
      var rate = pk(rnd, [0.04, 0.05, 0.06, 0.07, 0.08]);
      var years = pk(rnd, [10, 15, 20, 25, 30]);
      var ans = M.d(M.futureValue(M.c(contrib), rate, years));
      return {
        q: money(contrib) + ' is paid into a super fund at the end of each year for ' + years + ' years, earning ' + d2(rate * 100) + '% p.a. compounded annually. Find the final balance.',
        answer: ans, tol: { tolRel: 0.001 },
        why: 'FV = a × \\frac{(1+r)^n − 1}{r} = ' + U.commas(contrib) + ' × \\frac{' + d2(1 + rate) + '^' + years + ' − 1}{' + rate + '} = ' + U.commas(contrib) + ' × ' + U.round(M.fvFactor(rate, years), 4) + ' = ' + money(ans) + '.'
      };
    });

  G('f5-balance', 'Loan balance after k months', 'MS-F5', 'Loan repayment schedules', 3,
    { steps: 3, mag: 'balances $1,000–$500,000', answer: 'money', calculator: true, range: [0, 600000] },
    function (rnd) {
      var P = ri(rnd, 20, 500) * 1000;
      var annual = pk(rnd, [0.048, 0.054, 0.06, 0.066, 0.072]);
      var r = annual / 12;
      var years = pk(rnd, [10, 15, 20, 25]);
      var repay = M.repayment(M.c(P), r, years * 12);
      var k = ri(rnd, 2, 6);
      var ans = M.d(M.balanceAfter(M.c(P), r, repay, k));
      var rows = [], bal = M.c(P);
      for (var i = 1; i <= Math.min(k, 4); i++) {
        var interest = Math.round(bal * r);
        var closing = bal + interest - repay;
        rows.push([String(i), M.fmt(bal), M.fmt(interest), M.fmt(repay), M.fmt(closing)]);
        bal = closing;
      }
      return {
        stem: money(P) + ' is borrowed at ' + d2(annual * 100) + '% p.a. compounded monthly, repaid at ' + M.fmt(repay) + ' per month.',
        table: { head: ['Month', 'Opening', 'Interest', 'Repayment', 'Closing'], rows: rows },
        q: 'Find the closing balance at the end of month ' + k + '.',
        answer: ans, tol: { tolAbs: 0.05 },
        why: 'Each month: interest = balance × \\frac{' + d2(annual * 100) + '%}{12}, rounded to the cent, then subtract the ' + M.fmt(repay) + ' repayment. After ' + k + ' months the balance is ' + money(ans) + '. Rounding once at the end instead of every month gives a different answer.'
      };
    });

  /* =============================================== MS-S4 bivariate (4) */
  G('s4-predict', 'Predict from a regression line', 'MS-S4', 'Least-squares regression', 2,
    { steps: 2, mag: 'predictions −250 to 450', answer: 'decimal2', calculator: true, range: [-250, 500] },
    function (rnd) {
      var m = ri(rnd, -40, 40) / 10, b = ri(rnd, 10, 200);
      if (m === 0) m = 1.5;
      var x = ri(rnd, 5, 60);
      var ans = m * x + b;
      return {
        q: 'A least-squares line is y = ' + m + 'x + ' + b + '. Predict y when x = ' + x + '.',
        answer: ans,
        why: 'y = ' + m + '(' + x + ') + ' + b + ' = ' + d2(m * x) + ' + ' + b + ' = ' + d2(ans) + '.'
      };
    });

  G('s4-grad', 'Gradient of the least-squares line', 'MS-S4', 'Least-squares regression', 3,
    { steps: 3, mag: 'gradients −5 to 5', answer: 'decimal2', calculator: true, range: [-8, 8] },
    function (rnd) {
      /* Build points ON a line, then perturb slightly, so the fitted gradient
         is close to a known value and the question is genuinely answerable. */
      var m = pk(rnd, [-3, -2, -1.5, 1.5, 2, 2.5, 3]), b = ri(rnd, 5, 40);
      var pts = [];
      for (var i = 0; i < 6; i++) {
        var x = 2 + i * ri(rnd, 2, 4);
        pts.push([x, U.round(m * x + b, 1)]);
      }
      var reg = window.MS.Draw.regression(pts);
      return {
        stem: 'The points are (' + pts.map(function (p) { return p[0] + ', ' + p[1]; }).join('), (') + ').',
        q: 'Find the gradient of the least-squares regression line, to 2 decimal places.',
        answer: reg.m,
        figure: { kind: 'scatter', pts: pts, line: reg, showLine: true, alt: 'a scatterplot with its regression line' },
        why: 'These points lie on y = ' + m + 'x + ' + b + ', so the least-squares gradient is ' + d2(reg.m) + '. The gradient is the predicted change in y for a one-unit increase in x.'
      };
    });

  G('s4-r', "Pearson's r", 'MS-S4', "Pearson's r", 3,
    { steps: 3, mag: 'r between −1 and 1', answer: 'decimal2', calculator: true, range: [-1, 1] },
    function (rnd) {
      var m = pk(rnd, [-2, -1, 1, 2]), noise = ri(rnd, 0, 60) / 10;
      var pts = [];
      for (var i = 0; i < 8; i++) {
        var x = 1 + i * 3;
        pts.push([x, U.round(m * x + 20 + (rnd() - 0.5) * noise * 4, 1)]);
      }
      var reg = window.MS.Draw.regression(pts);
      return {
        stem: 'The scatterplot shows eight paired observations.',
        figure: { kind: 'scatter', pts: pts, line: reg, showLine: true, alt: 'a scatterplot' },
        q: "Calculate Pearson's correlation coefficient r, to 2 decimal places.",
        answer: reg.r, tol: { tolAbs: 0.015 },
        why: 'r = ' + U.round(reg.r, 2) + ' — a ' + (Math.abs(reg.r) > 0.9 ? 'very strong' : Math.abs(reg.r) > 0.7 ? 'strong' : Math.abs(reg.r) > 0.5 ? 'moderate' : 'weak') + ' ' + (reg.r < 0 ? 'negative' : 'positive') + ' linear association. r measures only LINEAR association, and never proves causation.'
      };
    });

  G('s4-interp', 'Interpolate a value', 'MS-S4', 'Interpolation and extrapolation', 2,
    { steps: 2, mag: 'values 0–400', answer: 'decimal2', calculator: true, range: [0, 500] },
    function (rnd) {
      var m = ri(rnd, 5, 40) / 10, b = ri(rnd, 5, 80);
      var lo = ri(rnd, 2, 10), hi = lo + ri(rnd, 20, 50);
      var x = ri(rnd, lo + 2, hi - 2);
      var ans = m * x + b;
      return {
        stem: 'Data was collected for x between ' + lo + ' and ' + hi + '. The least-squares line is y = ' + m + 'x + ' + b + '.',
        q: 'Predict y when x = ' + x + ', to 2 decimal places.',
        answer: ans,
        hint: 'Check whether x sits inside the data range — that decides how much to trust it.',
        why: 'y = ' + m + '(' + x + ') + ' + b + ' = ' + d2(ans) + '. x = ' + x + ' lies INSIDE the data range, so this is interpolation and reasonably reliable. Outside the range it would be extrapolation and much less trustworthy.'
      };
    });

  /* ================================================== MS-S5 normal (5) */
  G('s5-z', 'Calculate a z-score', 'MS-S5', 'z-scores', 1,
    { steps: 2, mag: 'z between −3.5 and 3.5', answer: 'decimal2', calculator: true, range: [-4, 4] },
    function (rnd) {
      var mean = ri(rnd, 40, 80), sd = ri(rnd, 3, 15);
      var z = pk(rnd, [-3, -2.5, -2, -1.5, -1, -0.5, 0.5, 1, 1.5, 2, 2.5, 3]);
      var x = mean + z * sd;                        // §9.9: pick z, derive x
      return {
        q: 'A test has mean ' + mean + ' and standard deviation ' + sd + '. Find the z-score of a mark of ' + d2(x) + '.',
        answer: z,
        why: 'z = \\frac{x − x̄}{s} = \\frac{' + d2(x) + ' − ' + mean + '}{' + sd + '} = ' + z + '. ' + (z < 0 ? 'Negative means below the mean.' : 'Positive means above the mean.')
      };
    });

  G('s5-raw', 'Raw score from a z-score', 'MS-S5', 'z-scores', 2,
    { steps: 2, mag: 'scores 0–200', answer: 'decimal2', calculator: true, range: [-50, 250] },
    function (rnd) {
      var mean = ri(rnd, 40, 150), sd = ri(rnd, 4, 20);
      var z = pk(rnd, [-2.5, -2, -1.5, -1, -0.75, 0.75, 1, 1.5, 2, 2.5]);
      var ans = mean + z * sd;
      return {
        q: 'A distribution has mean ' + mean + ' and standard deviation ' + sd + '. Find the score with a z-score of ' + z + '.',
        answer: ans,
        why: 'Rearranging z = \\frac{x − x̄}{s} gives x = x̄ + zs = ' + mean + ' + (' + z + ')(' + sd + ') = ' + d2(ans) + '.'
      };
    });

  G('s5-emp', 'Empirical rule percentage', 'MS-S5', 'The empirical rule', 2,
    { steps: 2, mag: 'percentages 0.15–99.7', answer: 'decimal2', calculator: false, range: [0, 100] },
    function (rnd) {
      /* §9.9: pick a z that lands exactly on an empirical-rule boundary. */
      var cases = [
        { q: 'between 1 standard deviation either side of the mean', a: 68 },
        { q: 'between 2 standard deviations either side of the mean', a: 95 },
        { q: 'between 3 standard deviations either side of the mean', a: 99.7 },
        { q: 'more than 1 standard deviation above the mean', a: 16 },
        { q: 'more than 2 standard deviations above the mean', a: 2.5 },
        { q: 'more than 3 standard deviations above the mean', a: 0.15 },
        { q: 'below the mean', a: 50 },
        { q: 'between 1 and 2 standard deviations above the mean', a: 13.5 },
        { q: 'less than 2 standard deviations below the mean', a: 2.5 },
        { q: 'within 2 standard deviations above the mean', a: 47.5 }
      ];
      var c = pk(rnd, cases);
      var mean = ri(rnd, 40, 90), sd = ri(rnd, 4, 12), n = ri(rnd, 10, 90) * 20;
      return {
        stem: 'A normally distributed variable has mean ' + mean + ' and standard deviation ' + sd + '.',
        q: 'What percentage of values lie ' + c.q + '?',
        answer: c.a, units: '%',
        figure: { kind: 'normal', shade: c.a === 68 ? [-1, 1] : c.a === 95 ? [-2, 2] : c.a === 99.7 ? [-3, 3] : c.a === 16 ? [1, 3.6] : c.a === 2.5 ? [2, 3.6] : c.a === 50 ? [-3.6, 0] : c.a === 13.5 ? [1, 2] : c.a === 47.5 ? [0, 2] : [3, 3.6], alt: 'a normal curve with a shaded region' },
        why: 'By the empirical rule: 68% within 1 s, 95% within 2 s, 99.7% within 3 s. So ' + c.q + ' accounts for ' + c.a + '%. (In a sample of ' + U.commas(n) + ' that is about ' + Math.round(n * c.a / 100) + ' values.)'
      };
    });

  G('s5-compare', 'Compare two results', 'MS-S5', 'Comparing scores', 3,
    { steps: 3, mag: 'z between −3 and 3', answer: 'decimal2', calculator: true, range: [-4, 4] },
    function (rnd) {
      var m1 = ri(rnd, 50, 70), s1 = ri(rnd, 5, 14);
      var m2 = ri(rnd, 50, 70), s2 = ri(rnd, 5, 14);
      var z1 = pk(rnd, [-1.5, -1, -0.5, 0.5, 1, 1.5, 2]);
      var z2 = pk(rnd, [-1.5, -1, -0.5, 0.5, 1, 1.5, 2]);
      var x1 = m1 + z1 * s1, x2 = m2 + z2 * s2;
      var better = Math.max(z1, z2);
      return {
        stem: 'Maths: mean ' + m1 + ', standard deviation ' + s1 + ', mark ' + d2(x1) + '. English: mean ' + m2 + ', standard deviation ' + s2 + ', mark ' + d2(x2) + '.',
        q: 'Find the higher of the two z-scores.',
        answer: better,
        why: 'Maths z = \\frac{' + d2(x1) + ' − ' + m1 + '}{' + s1 + '} = ' + z1 + '. English z = \\frac{' + d2(x2) + ' − ' + m2 + '}{' + s2 + '} = ' + z2 + '. The higher is ' + better + ', so the ' + (z1 > z2 ? 'Maths' : 'English') + ' result is the stronger performance relative to the cohort — regardless of the raw marks.'
      };
    });

  G('s5-qc', 'Quality control limit', 'MS-S5', 'Quality control', 2,
    { steps: 2, mag: 'limits within ±3 s', answer: 'decimal2', calculator: true, range: [0, 2000] },
    function (rnd) {
      var target = ri(rnd, 100, 1000), sd = ri(rnd, 2, 20);
      var k = pk(rnd, [2, 3]);
      var upper = rnd() < 0.5;
      var ans = target + (upper ? k : -k) * sd;
      return {
        q: 'A filling machine targets ' + target + ' mL with a standard deviation of ' + sd + ' mL. Find the ' + (upper ? 'upper' : 'lower') + ' control limit at ' + k + ' standard deviations.',
        answer: ans, units: 'mL',
        why: 'Limit = target ' + (upper ? '+' : '−') + ' ' + k + 's = ' + target + ' ' + (upper ? '+' : '−') + ' ' + k + '(' + sd + ') = ' + d2(ans) + ' mL. Only ' + (k === 3 ? '0.3%' : '5%') + ' of output should fall outside ±' + k + 's, so beyond that the process is treated as out of control.'
      };
    });

  /* ================================================== MS-N1/N2 networks (4) */
  G('n1-degree', 'Degree sum', 'MS-N1', 'Degree and connectedness', 1,
    { steps: 2, mag: 'graphs with 4–9 vertices', answer: 'integer', calculator: false, range: [2, 40] },
    function (rnd) {
      var v = ri(rnd, 4, 9), e = ri(rnd, v - 1, Math.min(14, v * (v - 1) / 2));
      var wantEdges = rnd() < 0.5;
      var ans = wantEdges ? e : 2 * e;
      return {
        q: wantEdges
          ? 'The degrees of the vertices of a graph sum to ' + (2 * e) + '. How many edges does it have?'
          : 'A graph has ' + e + ' edges. What is the sum of the degrees of all its vertices?',
        answer: ans,
        why: 'Every edge contributes 1 to the degree of each of its two endpoints, so the degree sum is always twice the number of edges. Here ' + (wantEdges ? (2 * e) + ' ÷ 2 = ' + e + ' edges' : '2 × ' + e + ' = ' + (2 * e)) + '.'
      };
    });

  G('n1-tree', 'Edges in a spanning tree', 'MS-N1', 'Minimum spanning trees', 1,
    { steps: 1, mag: '4–30 vertices', answer: 'integer', calculator: false, range: [3, 30] },
    function (rnd) {
      var v = ri(rnd, 4, 31);
      return {
        q: 'A connected network has ' + v + ' vertices. How many edges are in a spanning tree of it?',
        answer: v - 1,
        why: 'A spanning tree on n vertices always has exactly n − 1 edges: ' + v + ' − 1 = ' + (v - 1) + '. One more edge would create a cycle; one fewer would disconnect it.'
      };
    });

  G('n2-complete', 'Minimum completion time', 'MS-N2', 'Minimum completion time', 2,
    { steps: 3, mag: 'projects of 8–40 time units; counts 3–8; float totals 0–40', answer: 'integer', calculator: false, range: [0, 80] },
    function (rnd) {
      /* §9.9: generate the project, then run our OWN forward scan for the
         answer. Never hand-author a critical path. */
      var P = window.MS.PROJECTS[Math.floor(rnd() * window.MS.PROJECTS.length)];
      var sol = window.MS.Net.analyse(P.activities);
      var rows = P.activities.map(function (a) {
        return [a.id, a.nm, String(a.dur), a.pre.length ? a.pre.join(', ') : '—'];
      });
      var ask = pk(rnd, ['time', 'count', 'slack']);
      var totalFloat = 0;
      Object.keys(sol.nodes).forEach(function (k) { totalFloat += sol.nodes[k].float; });
      var answer = ask === 'time' ? sol.duration : ask === 'count' ? sol.critical.length : totalFloat;
      return {
        stem: P.nm + ' — durations in ' + P.unit + '.',
        table: { head: ['Activity', 'Description', 'Duration', 'Predecessors'], rows: rows },
        q: ask === 'time' ? 'Find the minimum completion time for the project.'
          : ask === 'count' ? 'How many activities lie on the critical path?'
          : 'Find the total float across all activities in the project.',
        answer: answer, units: ask === 'count' ? 'activities' : P.unit,
        why: 'Forward scanning gives each activity the largest finish time of its predecessors. The longest path is ' + sol.critical.join(' → ') + ', totalling ' + sol.duration + ' ' + P.unit + ' — that is the minimum completion time, and every activity on it has zero float. '
          + (ask === 'count' ? 'The critical path contains ' + sol.critical.length + ' activities.'
             : ask === 'slack' ? 'Adding LST − EST for every activity gives ' + totalFloat + ' ' + P.unit + ' of float in total.'
             : 'Nothing can shorten the project without shortening an activity on that path.')
      };
    },
    function (item) { return true; });

  G('n2-float', 'Float time', 'MS-N2', 'Float time', 3,
    { steps: 3, mag: 'floats 0–20 time units', answer: 'integer', calculator: false, range: [0, 30] },
    function (rnd) {
      var P = window.MS.PROJECTS[Math.floor(rnd() * window.MS.PROJECTS.length)];
      var sol = window.MS.Net.analyse(P.activities);
      var ids = P.activities.map(function (a) { return a.id; });
      var pick = ids[Math.floor(rnd() * ids.length)];
      var node = sol.nodes[pick];
      var rows = P.activities.map(function (a) {
        return [a.id, String(a.dur), a.pre.length ? a.pre.join(', ') : '—'];
      });
      return {
        stem: P.nm + ' — durations in ' + P.unit + '. Minimum completion time is ' + sol.duration + ' ' + P.unit + '.',
        table: { head: ['Activity', 'Duration', 'Predecessors'], rows: rows },
        q: 'Find the float time of activity ' + pick + '.',
        answer: node.float, units: P.unit,
        why: 'Forward scan gives EST(' + pick + ') = ' + node.est + '. Backward scan gives LST(' + pick + ') = ' + node.lst + '. Float = LST − EST = ' + node.lst + ' − ' + node.est + ' = ' + node.float + '. ' + (node.float === 0 ? 'Zero float means ' + pick + ' is on the critical path.' : pick + ' can slip ' + node.float + ' ' + P.unit + ' without delaying the project.')
      };
    },
    function (item) { return true; });

  window.MS.Calc = Calc;
})();
