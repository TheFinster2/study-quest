/* ============================================================================
   chain.js — 📏 Unit Chain (§5). The Balance Blitz translation: instead of a
   live per-element atom tally, a live dimensional-analysis check.

   The student multiplies by conversion factors one at a time and the panel
   shows, after every step, the running value AND the running unit symbols with
   the cancelled ones struck through. Same "the game tells you the truth as you
   work" feel, and it drills MS-M1 and MS-M7 hard.

   Symbols, not dimensions: mL/min and L/h have the SAME dimension, so a
   dimension check would say "correct" before any work happened. See
   js/core/units.js for why the engine tracks unit names.
   ========================================================================== */
window.MS = window.MS || {};
window.MS.Games = window.MS.Games || {};
(function () {
  'use strict';
  var MS = window.MS, U = MS.U, UI = MS.UI, State = MS.State, Un = MS.Units, Audio = MS.Audio, FX = MS.FX;

  var TASKS = [
    { nm: 'Infusion pump', from: { value: 2500, unit: 'mL/min' }, to: 'L/h',
      ds: 'An infusion pump delivers 2500 mL per minute. Express the flow rate in litres per hour.' },
    { nm: 'Water main', from: { value: 45, unit: 'L/min' }, to: 'kL/day',
      ds: 'A pump moves 45 litres a minute. How many kilolitres a day?' },
    { nm: 'Rainwater tank', from: { value: 3.2, unit: 'm^3' }, to: 'L',
      ds: 'A tank holds 3.2 cubic metres of water. What is its capacity in litres?' },
    { nm: 'Paddock', from: { value: 4.5, unit: 'ha' }, to: 'm^2',
      ds: 'A paddock covers 4.5 hectares. Give the area in square metres.' },
    { nm: 'Highway speed', from: { value: 90, unit: 'km/h' }, to: 'm/s',
      ds: 'A car travels at 90 km/h. Convert the speed to metres per second.' },
    { nm: 'Rainfall', from: { value: 120000, unit: 'L' }, to: 'kL',
      ds: 'A dam captured 120 000 litres overnight. Express that in kilolitres.' },
    { nm: 'Floor tiles', from: { value: 68000, unit: 'cm^2' }, to: 'm^2',
      ds: 'A floor measures 68 000 square centimetres. Convert to square metres.' },
    { nm: 'Sprinkler', from: { value: 8, unit: 'L/min' }, to: 'L/h',
      ds: 'A sprinkler runs at 8 litres a minute. How many litres an hour?' },
    { nm: 'Conveyor', from: { value: 0.85, unit: 'km' }, to: 'cm',
      ds: 'A conveyor belt is 0.85 km long. Give the length in centimetres.' },
    { nm: 'Fuel tanker', from: { value: 32, unit: 'kL' }, to: 'L',
      ds: 'A tanker carries 32 kilolitres of diesel. Convert to litres.' },
    { nm: 'Sprinter', from: { value: 4.5, unit: 'm/s' }, to: 'km/h',
      ds: 'A sprinter runs at 4.5 metres per second. Convert to kilometres per hour.' },
    { nm: 'Aggregate', from: { value: 2.4, unit: 't' }, to: 'kg',
      ds: 'A load of aggregate weighs 2.4 tonnes. Convert to kilograms.' },
    { nm: 'Dosage', from: { value: 750, unit: 'mg' }, to: 'g',
      ds: 'A tablet contains 750 mg of active ingredient. Convert to grams.' },
    { nm: 'Syringe', from: { value: 15, unit: 'cm^3' }, to: 'mL',
      ds: 'A syringe holds 15 cubic centimetres. What is that in millilitres?' },
    { nm: 'Irrigation', from: { value: 6, unit: 'ML/day' }, to: 'kL/h',
      ds: 'An irrigation scheme delivers 6 megalitres a day. Convert to kilolitres per hour.' }
  ];

  /* The factor palette. Every one of these is a genuine "multiply by 1" — the
     numerator and denominator are the same physical quantity, which
     Un.validFactor checks. Two deliberately unhelpful-but-valid factors are in
     here too, because knowing which factor to reach for is half the skill. */
  var FACTORS = [
    { numValue: 1, numUnit: 'L', denValue: 1000, denUnit: 'mL' },
    { numValue: 1000, numUnit: 'mL', denValue: 1, denUnit: 'L' },
    { numValue: 1, numUnit: 'kL', denValue: 1000, denUnit: 'L' },
    { numValue: 1000, numUnit: 'L', denValue: 1, denUnit: 'kL' },
    { numValue: 1, numUnit: 'ML', denValue: 1000, denUnit: 'kL' },
    { numValue: 1000, numUnit: 'kL', denValue: 1, denUnit: 'ML' },
    { numValue: 1, numUnit: 'h', denValue: 60, denUnit: 'min' },
    { numValue: 60, numUnit: 'min', denValue: 1, denUnit: 'h' },
    { numValue: 1, numUnit: 'day', denValue: 24, denUnit: 'h' },
    { numValue: 24, numUnit: 'h', denValue: 1, denUnit: 'day' },
    { numValue: 1, numUnit: 'min', denValue: 60, denUnit: 's' },
    { numValue: 60, numUnit: 's', denValue: 1, denUnit: 'min' },
    { numValue: 1, numUnit: 'km', denValue: 1000, denUnit: 'm' },
    { numValue: 1000, numUnit: 'm', denValue: 1, denUnit: 'km' },
    { numValue: 1, numUnit: 'm', denValue: 100, denUnit: 'cm' },
    { numValue: 100, numUnit: 'cm', denValue: 1, denUnit: 'm' },
    { numValue: 1, numUnit: 'm^2', denValue: 10000, denUnit: 'cm^2' },
    { numValue: 10000, numUnit: 'm^2', denValue: 1, denUnit: 'ha' },
    { numValue: 1, numUnit: 'm^3', denValue: 1000, denUnit: 'L' },
    { numValue: 1000, numUnit: 'L', denValue: 1, denUnit: 'm^3' },
    { numValue: 1, numUnit: 'mL', denValue: 1, denUnit: 'cm^3' },
    { numValue: 1, numUnit: 'kg', denValue: 1000, denUnit: 'g' },
    { numValue: 1000, numUnit: 'g', denValue: 1, denUnit: 'kg' },
    { numValue: 1, numUnit: 'g', denValue: 1000, denUnit: 'mg' },
    { numValue: 1000, numUnit: 'kg', denValue: 1, denUnit: 't' }
  ];

  function factorLabel(f) {
    return '\\frac{' + (f.numValue === 1 ? '' : f.numValue + ' ') + f.numUnit + '}{' +
           (f.denValue === 1 ? '' : f.denValue + ' ') + f.denUnit + '}';
  }

  var ROUNDS = 5;

  MS.Games.chain = function () {
    var pool = UI.pool();
    var round = 0, ended = false, startedAt = Date.now(), solved = 0;

    var scoreChip = UI.chip('0/' + ROUNDS);
    var shell = UI.gameShell('📏 Unit Chain', {
      sub: 'Cancel it down',
      meta: [scoreChip],
      backTo: '/play',
      help: 'Multiply by conversion factors until the units left over match the target. Every factor in the palette equals 1, so multiplying by it never changes the quantity — only how it is written. Watch the unit line: cancelled symbols are struck out. Once the units read right, the number is right too.'
    });
    UI.onLeave(function () { ended = true; });
    var host = U.el('.card');
    U.add(shell.body, host);
    var tasks = U.sample(TASKS, ROUNDS);

    function next() {
      if (ended) return;
      if (round >= ROUNDS) { finish(); return; }
      var task = tasks[round];
      round++;
      var targetNames = Un.parseNames(task.to);
      var want = Un.convert(task.from.value, task.from.unit, task.to);
      var applied = [];
      var shownAt = Date.now();
      var locked = false;

      U.clear(host);
      U.add(host, [
        U.el('.spread', [
          U.el('.tiny.dim', 'Chain ' + round + ' of ' + ROUNDS),
          U.el('.tiny.dim', '📏 ' + task.nm)
        ]),
        U.el('.qstem', { html: U.mathHtml(task.ds) }),
        U.el('.qtext', { html: U.mathHtml(U.commas(task.from.value) + ' ' + task.from.unit + '  \\to  ? ' + task.to) })
      ]);

      var panel = U.el('.why');
      var chainRow = U.el('.row');
      var palette = U.el('.row');
      var answerHost = U.el('.stack');
      U.add(host, [panel, chainRow, U.el('.tiny.dim', 'Tap a factor to add it; tap it in the chain to remove it.'), palette, answerHost]);

      function refresh() {
        var res = Un.symChain(task.from, applied);
        var match = res.ok && Un.sameNames(res.syms, targetNames);
        var gone = res.ok ? Un.cancelled(task.from.unit, res.syms) : [];

        U.clear(panel);
        U.add(panel, [
          U.el('.spread', [
            U.el('span.tiny.dim', 'Running value'),
            U.el('strong.mono', res.ok ? U.commas(U.round(res.value, 8)) : '—')
          ]),
          U.el('.spread', [
            U.el('span.tiny.dim', 'Units so far'),
            U.el('strong' + (match ? '.good' : '.warn'), { html: U.mathHtml(res.ok ? res.key : 'error') })
          ]),
          U.el('.spread', [
            U.el('span.tiny.dim', 'Target'),
            U.el('strong.dim', { html: U.mathHtml(Un.formatNames(targetNames)) })
          ]),
          gone.length ? U.el('.tiny.dim', 'Cancelled: ' + gone.map(function (g) { return '̶' + g.split('').join('̶') + '̶'; }).join(', ')) : null,
          U.el('.tiny' + (match ? '.good' : '.dim'), match
            ? '✓ The units now read ' + task.to + '. Lock in the value.'
            : 'Keep going — the units do not read ' + task.to + ' yet.')
        ]);

        U.clear(chainRow);
        U.add(chainRow, U.el('.chip', { html: U.mathHtml(U.commas(task.from.value) + ' ' + task.from.unit) }));
        applied.forEach(function (f, i) {
          U.add(chainRow, U.el('button.chip.acc', {
            html: '× ' + U.mathHtml(factorLabel(f)) + ' ✕',
            onclick: function () { if (locked) return; applied.splice(i, 1); Audio.play('tapSoft'); refresh(); },
            title: 'Remove this factor'
          }));
        });

        U.clear(answerHost);
        var fld = UI.numberField({
          label: 'Answer in ' + task.to,
          hint: match ? 'The running value above is your answer.' : 'Within 0.5% is accepted.'
        });
        var go = U.el('button.btn.pri.wide', { onclick: function () { grade(fld); } }, 'Lock in');
        U.add(answerHost, U.el('.stack', [fld.node, go]));
        UI.keys({ Enter: function () { go.click(); } });

        function grade(f) {
          if (ended || locked) return;
          var raw = f.input.value;
          if (!String(raw).trim()) { Audio.play('refused'); UI.toast('Type the converted value', 'warn'); return; }
          locked = true;
          var ms = Date.now() - shownAt;
          var right = U.numClose(raw, want, { tolRel: 0.005 });
          f.input.disabled = true;
          f.input.classList.add(right ? 'ok' : 'no');
          if (right) {
            var gained = pool.right(2, ms, UI.readMs(task.ds));
            solved++;
            State.bump('chainsDone');
            Audio.play('chainDone');
            var c = FX.centreOf(f.input);
            FX.burst(c.x, c.y, null, 16);
            if (gained > 0) FX.floatText('+' + gained, c.x, c.y);
            else UI.toast('Too fast to have read that — no XP', 'warn', 1600);
          } else {
            pool.wrongAnswer(2);
            Audio.play('dimBad');
            FX.shake(5);
          }
          State.answer(null, right, 'MS-M7', ms);
          State.noteStreak(pool.bestStreak);
          scoreChip.textContent = solved + '/' + ROUNDS;
          U.clear(answerHost);
          U.add(answerHost, U.el('.stack', [
            U.el('.spread', [
              U.el('strong' + (right ? '.good' : '.bad'), right ? '✓ Correct' : '✗ Not quite'),
              U.el('.chip' + (right ? '.good' : '.bad'), U.commas(U.round(want, 6)) + ' ' + task.to)
            ]),
            U.el('.why', { html: U.mathHtml(explain(task, want)) }),
            U.el('button.btn.pri.wide', { onclick: next }, round >= ROUNDS ? 'See results →' : 'Next chain →')
          ]));
        }
      }

      U.clear(palette);
      /* Offer only factors that touch a unit already in play or in the target,
         so the palette stays a decision rather than a wall of 25 buttons. */
      var relevant = FACTORS.filter(function (f) {
        var names = Object.keys(Un.parseNames(task.from.unit)).concat(Object.keys(targetNames));
        var involved = Object.keys(Un.parseNames(f.numUnit)).concat(Object.keys(Un.parseNames(f.denUnit)));
        return involved.some(function (u) { return names.indexOf(u) >= 0; });
      });
      var offered = relevant.length >= 4 ? relevant : FACTORS;
      offered.forEach(function (f) {
        U.add(palette, U.el('button.btn.sm', {
          html: '× ' + U.mathHtml(factorLabel(f)),
          onclick: function () {
            if (locked) return;
            applied.push(f);
            Audio.play('chainStep');
            var res = Un.symChain(task.from, applied);
            if (res.ok && Un.sameNames(res.syms, targetNames)) Audio.play('cancel');
            refresh();
          }
        }));
      });
      refresh();
    }

    function explain(task, want) {
      var f = Un.parseUnit(task.from.unit), t = Un.parseUnit(task.to);
      var ratio = f.factor / t.factor;
      var extra = '';
      if (t.dim.L === 2) extra = ' Area factors are the LENGTH factor squared — 1 m² = 100² = 10 000 cm².';
      else if (t.dim.L === 3) extra = ' Volume and capacity share a dimension, which is why 1 mL = 1 cm³ and 1 kL = 1 m³.';
      return U.commas(task.from.value) + ' ' + task.from.unit + ' × ' + U.round(ratio, 8) + ' = ' +
        U.commas(U.round(want, 6)) + ' ' + task.to + '.' + extra +
        ' Every factor you multiplied by was equal to 1, so the quantity never changed — only the units it was written in.';
    }

    function finish() {
      if (ended) return;
      ended = true;
      var acc = pool.accuracy();
      State.bump('playSecs', Math.round((Date.now() - startedAt) / 1000));
      if (pool.wrong === 0 && solved === ROUNDS) State.bump('perfect');
      var res = UI.award({ xp: pool.xp, bonus: 100, coins: solved * 9, accuracy: acc,
        answered: pool.answered(), mode: 'chain', node: scoreChip });
      State.recordScore('chain', solved);
      State.progressDaily('chain', solved);
      UI.results({
        title: 'Chains complete',
        accuracy: acc,
        rows: [
          ['Converted', solved + ' / ' + ROUNDS],
          ['Best streak', pool.bestStreak],
          ['XP earned', U.commas(res.xp)],
          ['Credits', '+' + res.coins]
        ],
        note: 'The unit line is the point. If the symbols do not cancel to the target, no amount of multiplying by 1000 will make the number right.',
        backTo: '/play',
        again: function () { UI.go(UI.path()); }
      });
    }

    next();
  };
})();
