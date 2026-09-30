/* ============================================================================
   panic.js — ⏱️ Conversion Panic (§5). Fill a grid against the clock.

   §9.6 IS THE WHOLE DESIGN HERE. A fill-the-grid mode is guessable, so the
   score is net: max(0, right − wrong). The time bonus scales with accuracy and
   pays nothing below 75%. The reference app shipped this scoring `right` alone
   and random clicking paid well.
   ========================================================================== */
window.MS = window.MS || {};
window.MS.Games = window.MS.Games || {};
(function () {
  'use strict';
  var MS = window.MS, U = MS.U, UI = MS.UI, State = MS.State, Audio = MS.Audio, FX = MS.FX;

  /* Each board is a set of prompts with one right answer each, plus a shared
     pool of options. Small option pools make it a recall task, not a lottery —
     and the net scoring makes guessing worthless either way. */
  var BOARDS = [
    /* Answers are spread deliberately across the option pool. An earlier draft
       had "1000" as the answer to seven of twelve prompts, which made random
       tapping hit far more often than the six-option pool suggested — a content
       flaw, not a scoring one, and exploit.js caught it. */
    { id: 'metric', nm: 'Metric conversions', mod: 'MS-M1', ds: 'Tap the correct equivalent.',
      items: [
        ['1 m^3 = ? L', '1000'], ['1 cm^3 = ? mL', '1'], ['1 m^2 = ? cm^2', '10 000'],
        ['1 km^2 = ? ha', '100'], ['1 m^3 = ? cm^3', '1 000 000'], ['1 cm = ? mm', '10'],
        ['1 ha = ? m^2', '10 000'], ['1 L = ? cm^3', '1000'], ['1 m = ? cm', '100'],
        ['1 mm^3 = ? \\mu L', '1'], ['1 km = ? cm', '100 000'], ['1 t = ? g', '1 000 000']
      ],
      options: ['1', '10', '100', '1000', '10 000', '100 000', '1 000 000'] },

    { id: 'empirical', nm: 'The 68/95/99.7 rule', mod: 'MS-S5', ds: 'Tap the percentage.',
      items: [
        ['Within z = \\pm 1', '68%'], ['Within z = \\pm 2', '95%'], ['Within z = \\pm 3', '99.7%'],
        ['Above z = 1', '16%'], ['Above z = 2', '2.5%'], ['Below z = -1', '16%'],
        ['Between z = 0 and 1', '34%'], ['Between z = 1 and 2', '13.5%'],
        ['Below the mean', '50%'], ['Above z = 3', '0.15%'], ['Below z = 2', '97.5%'],
        ['Between z = -1 and 2', '81.5%']
      ],
      options: ['0.15%', '2.5%', '13.5%', '16%', '34%', '50%', '68%', '81.5%', '95%', '97.5%', '99.7%'] },

    { id: 'area', nm: 'Area and volume formulae', mod: 'MS-M1', ds: 'Tap the matching formula.',
      items: [
        ['Circle area', 'A = \\pi r^2'], ['Triangle area', 'A = \\frac{1}{2}bh'],
        ['Trapezium area', 'A = \\frac{h}{2}(a+b)'], ['Cylinder volume', 'V = \\pi r^2 h'],
        ['Cone volume', 'V = \\frac{1}{3}\\pi r^2 h'], ['Sphere volume', 'V = \\frac{4}{3}\\pi r^3'],
        ['Sphere surface area', 'SA = 4\\pi r^2'], ['Prism volume', 'V = Ah'],
        ['Pyramid volume', 'V = \\frac{1}{3}Ah'], ['Circumference', 'C = 2\\pi r'],
        ['Parallelogram area', 'A = bh'], ['Rhombus area', 'A = \\frac{1}{2}xy']
      ],
      options: ['A = \\pi r^2', 'A = \\frac{1}{2}bh', 'A = \\frac{h}{2}(a+b)', 'V = \\pi r^2 h',
                'V = \\frac{1}{3}\\pi r^2 h', 'V = \\frac{4}{3}\\pi r^3', 'SA = 4\\pi r^2',
                'V = Ah', 'V = \\frac{1}{3}Ah', 'C = 2\\pi r', 'A = bh', 'A = \\frac{1}{2}xy'] },

    { id: 'time', nm: 'Time and timetables', mod: 'MS-M2', ds: 'Tap the 24-hour time.',
      items: [
        ['7:45 pm', '1945'], ['12:30 am', '0030'], ['12:30 pm', '1230'],
        ['6:05 am', '0605'], ['11:59 pm', '2359'], ['1:15 pm', '1315'],
        ['9:40 am', '0940'], ['4:20 pm', '1620'], ['10:10 pm', '2210'],
        ['3:00 am', '0300'], ['8:55 pm', '2055'], ['5:35 am', '0535']
      ],
      options: ['0030', '0300', '0535', '0605', '0940', '1230', '1315', '1620', '1945', '2055', '2210', '2359'] },

    { id: 'finance', nm: 'Financial formulae', mod: 'MS-F4', ds: 'Tap the matching formula.',
      items: [
        ['Simple interest', 'I = Prn'], ['Compound future value', 'FV = PV(1+r)^n'],
        ['Straight-line depreciation', 'S = V_0 - Dn'], ['Declining balance', 'S = V_0(1-r)^n'],
        ['GST inside a total', 'total \\div 11'], ['Add GST', 'price \\times 1.1'],
        ['Dividend yield', '\\frac{dividend}{price}'], ['Pre-GST price', 'total \\div 1.1'],
        ['Monthly rate from annual', 'r \\div 12'], ['Compound interest earned', 'FV - PV'],
        ['Fortnights in a year', '26'], ['Leave loading', '17.5\\% of normal pay']
      ],
      options: ['I = Prn', 'FV = PV(1+r)^n', 'S = V_0 - Dn', 'S = V_0(1-r)^n', 'total \\div 11',
                'price \\times 1.1', '\\frac{dividend}{price}', 'total \\div 1.1', 'r \\div 12',
                'FV - PV', '26', '17.5\\% of normal pay'] },

    { id: 'network', nm: 'Network terminology', mod: 'MS-N1', ds: 'Tap the matching meaning.',
      items: [
        ['Degree of a vertex', 'Edges meeting there'], ['Tree', 'Connected, no cycles'],
        ['Spanning tree edges', 'n - 1'], ['Critical path float', 'Zero'],
        ['Float time', 'LST - EST'], ['Eulerian circuit needs', 'All degrees even'],
        ['Eulerian trail needs', 'Exactly 2 odd vertices'], ['Hamiltonian path visits', 'Every vertex once'],
        ["Prim's grows from", 'One vertex outward'], ["Kruskal's sorts", 'Edges by weight'],
        ['Forward scan finds', 'Earliest start times'], ['Backward scan finds', 'Latest start times']
      ],
      options: ['Edges meeting there', 'Connected, no cycles', 'n - 1', 'Zero', 'LST - EST',
                'All degrees even', 'Exactly 2 odd vertices', 'Every vertex once',
                'One vertex outward', 'Edges by weight', 'Earliest start times', 'Latest start times'] }
  ];

  var CELLS = 9;         // 9 prompts per board
  var SECONDS = 100;

  /* Exposed so the tests can reason about the boards rather than guess at them
     (§C4): validate.js checks no answer is over-represented in a pool, and
     exploit.js needs an oracle to drive the deterministic adversarial bot that
     proves net scoring is load-bearing. Read-only by convention — nothing in
     the app reads it back. */
  MS.Games.panicBoards = BOARDS;
  MS.Games.panicCells = CELLS;

  /* §C4 — a board is authored with its answers spread across the option pool,
     but the 9 items DEALT are a random sample, and a sample can undo that. If
     six of nine prompts happen to share an answer, one option covers most of
     the grid and a guesser cleans up. Resample until the deal is spread, and
     fall back to the plain sample rather than looping forever. */
  MS.Games.panicSample = function (board, cells) {
    var n = Math.min(cells, board.items.length);
    var want = Math.min(n, board.options.length, Math.max(4, Math.ceil(n * 0.6)));
    var best = null, bestSpread = -1;
    for (var attempt = 0; attempt < 24; attempt++) {
      var pick = U.sample(board.items, n);
      var seen = {}, spread = 0, most = 0, counts = {};
      pick.forEach(function (it) {
        if (!seen[it[1]]) { seen[it[1]] = 1; spread++; }
        counts[it[1]] = (counts[it[1]] || 0) + 1;
        if (counts[it[1]] > most) most = counts[it[1]];
      });
      if (spread > bestSpread) { bestSpread = spread; best = pick; }
      /* Enough distinct answers, and no single answer covering a third. */
      if (spread >= want && most <= Math.max(2, Math.ceil(n / 3))) return pick;
    }
    return best;
  };

  MS.Games.panic = function () {
    var board = U.pick(BOARDS);
    var items = MS.Games.panicSample(board, CELLS);
    var pool = UI.pool();
    var right = 0, wrong = 0, filled = 0, ended = false;
    var seconds = Math.round(SECONDS * State.timeScale());
    var timeLeft = seconds;
    var startedAt = Date.now();
    var selected = null;

    var timerChip = UI.chip(U.fmtTime(timeLeft));
    timerChip.classList.add('timer');
    var netChip = UI.chip('net 0');
    var shell = UI.gameShell('⏱️ Conversion Panic', {
      sub: board.nm,
      meta: [timerChip, netChip],
      backTo: '/play',
      help: 'Tap a prompt, then tap its answer. Wrong answers SUBTRACT from your score, so random tapping is worse than leaving a cell blank. The time bonus scales with accuracy and pays nothing below 75%.'
    });

    var tick = setInterval(function () {
      if (ended) return;
      timeLeft--;
      timerChip.textContent = U.fmtTime(timeLeft);
      timerChip.classList.toggle('low', timeLeft <= 12);
      if (timeLeft <= 5 && timeLeft > 0) Audio.play('tickLow');
      if (timeLeft <= 0) { Audio.play('timeUp'); finish('time'); }
    }, 1000);
    UI.onLeave(function () { ended = true; clearInterval(tick); });

    /* ------------------------------------------------------------- layout */
    var promptGrid = U.el('.gridgame', { style: { gridTemplateColumns: 'repeat(3, 1fr)' } });
    var optionGrid = U.el('.gridgame', { style: { gridTemplateColumns: 'repeat(3, 1fr)' } });
    var promptNodes = [];

    items.forEach(function (it, i) {
      /* html belongs in the ATTRS object. U.el(spec, attrs, kids) treats a
         third argument as children, and an object child stringifies to
         "[object Object]" — which is exactly what this grid used to show. */
      var cell = U.el('button.cell', {
        html: U.mathHtml(it[0]),
        style: { minHeight: '58px' },
        onclick: function () {
          if (ended || cell.classList.contains('right') || cell.classList.contains('wrong')) return;
          promptNodes.forEach(function (p) { p.classList.remove('on'); });
          selected = i;
          cell.classList.add('on');
          Audio.play('tapSoft');
        }
      });
      promptNodes.push(cell);
      U.add(promptGrid, cell);
    });

    U.shuffle(board.options).forEach(function (opt) {
      U.add(optionGrid, U.el('button.cell', {
        html: U.mathHtml(opt),
        style: { minHeight: '48px' },
        onclick: function () { answer(opt); }
      }));
    });

    U.add(shell.body, [
      U.el('.card.tight', U.el('.tiny.dim', board.ds + ' Wrong answers subtract — leave a cell blank rather than guess.')),
      U.el('.card', promptGrid),
      U.el('.card', [U.el('.tiny.dim', { style: { marginBottom: '6px' } }, 'Answers'), optionGrid])
    ]);

    function answer(opt) {
      if (ended) return;
      if (selected == null) { Audio.play('refused'); UI.toast('Pick a prompt first', 'warn', 1200); return; }
      var i = selected, cell = promptNodes[i];
      var correct = items[i][1] === opt;
      selected = null;
      cell.classList.remove('on');
      filled++;
      if (correct) {
        right++;
        cell.classList.add('right');
        cell.innerHTML = U.mathHtml(items[i][0] + ' = ' + opt);
        Audio.play('correctSmall');
        var c = FX.centreOf(cell);
        FX.burst(c.x, c.y, null, 8);
      } else {
        wrong++;
        cell.classList.add('wrong');
        cell.innerHTML = U.mathHtml(items[i][0] + ' ≠ ' + opt);
        Audio.play('wrong');
      }
      /* §9.6 — XP is NOT banked per cell. A grid with a small option pool has a
         real chance of a lucky hit, and banking each win lets a random clicker
         keep them while the misses cost less than the hits paid. The whole
         board is scored net, once, in finish(). */
      /* §9.6 — the visible score is NET, so the incentive is honest. */
      var net = Math.max(0, right - wrong);
      netChip.textContent = 'net ' + net;
      netChip.className = 'chip ' + (wrong > right ? 'bad' : net > 0 ? 'good' : '');
      if (filled >= items.length) { Audio.play('clearAll'); finish('done'); }
    }

    function finish(reason) {
      if (ended) return;
      ended = true;
      clearInterval(tick);
      var net = Math.max(0, right - wrong);
      var acc = filled ? right / filled : 0;
      /* §9.6, the whole rule in three lines: the board pays on NET cells only,
         so a wrong answer cancels a right one exactly. Random clicking nets
         zero or negative and therefore pays nothing. */
      for (var i = 0; i < net; i++) pool.right(1, 9999, 0);
      /* Time bonus scales with accuracy and has a 75% floor (§9.6). */
      var timeBonus = 0;
      if (reason === 'done' && acc >= 0.75) timeBonus = Math.round(timeLeft * 2 * acc);
      State.bump('playSecs', Math.round((Date.now() - startedAt) / 1000));
      if (wrong === 0 && right === items.length) State.bump('perfect');
      State.answer(null, acc >= 0.7, board.mod, 9999);

      var res = UI.award({
        xp: pool.xp + timeBonus,
        bonus: 70,
        coins: net * 6,
        accuracy: acc,
        answered: filled,
        mode: 'panic',
        node: netChip
      });
      State.recordScore('panic', net);
      State.progressDaily('panic', net);

      UI.results({
        title: reason === 'time' ? 'Time!' : 'Grid complete',
        accuracy: acc,
        rows: [
          ['Board', board.nm],
          ['Correct', right],
          ['Wrong', wrong],
          ['Net score', net],
          ['Time bonus', timeBonus ? '+' + timeBonus + ' XP' : (acc < 0.75 ? 'none — under 75% accuracy' : 'none')],
          ['XP earned', U.commas(res.xp)],
          ['Credits', '+' + res.coins]
        ],
        note: 'Scored net of mistakes: ' + right + ' − ' + wrong + ' = ' + net + '. Filling every cell with a guess would score zero.',
        backTo: '/play',
        again: function () { UI.go(UI.path()); }
      });
    }
  };
})();
