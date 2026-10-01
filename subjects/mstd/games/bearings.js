/* ============================================================================
   bearings.js — 🧭 Bearings Lab (§5). The second lab: drag a compass to plot a
   radial survey, then compute the area with the area rule.

   §9.9: the survey is generated first (bearings and distances that produce a
   sensible, non-degenerate polygon), then its area is computed by the app.
   Nothing about the answer is stored, so an impossible survey cannot ship.
   ========================================================================== */
window.MS = window.MS || {};
window.MS.Games = window.MS.Games || {};
(function () {
  'use strict';
  var MS = window.MS, U = MS.U, UI = MS.UI, State = MS.State, D = MS.Draw, Audio = MS.Audio, FX = MS.FX;

  var ROUNDS = 3;

  /* A radial survey: distances and bearings from one central point O. The area
     is the sum of ½·a·b·sin(C) over adjacent pairs. */
  function makeSurvey() {
    var n = U.randInt(3, 4);
    var legs = [];
    /* Spread the bearings so no two arms are within 35° — that keeps every
       triangle well-conditioned and the drawing readable. */
    var start = U.randInt(0, 359);
    var gaps = [];
    var remaining = 360;
    for (var i = 0; i < n; i++) {
      var minGap = 45, maxGap = Math.max(minGap, Math.floor(remaining - (n - 1 - i) * minGap));
      var g = i === n - 1 ? remaining : U.randInt(minGap, Math.min(maxGap, 150));
      gaps.push(g);
      remaining -= g;
    }
    var b = start;
    for (var j = 0; j < n; j++) {
      legs.push({ bearing: ((b % 360) + 360) % 360, dist: U.randInt(4, 30), to: 'ABCDE'[j] });
      b += gaps[j];
    }
    return legs;
  }

  /* Included angle between two arms, taking the smaller way round. */
  function included(b1, b2) {
    var d = Math.abs(b2 - b1) % 360;
    return d > 180 ? 360 - d : d;
  }
  function surveyArea(legs) {
    var total = 0, parts = [];
    for (var i = 0; i < legs.length; i++) {
      var a = legs[i], c = legs[(i + 1) % legs.length];
      var ang = included(a.bearing, c.bearing);
      var area = 0.5 * a.dist * c.dist * Math.sin(ang * Math.PI / 180);
      parts.push({ from: a.to, to: c.to, a: a.dist, b: c.dist, angle: ang, area: area });
      total += area;
    }
    return { total: total, parts: parts };
  }

  MS.Games.bearings = function () {
    var pool = UI.pool();
    var round = 0, ended = false, startedAt = Date.now(), passed = 0;

    var scoreChip = UI.chip('0/' + ROUNDS);
    var shell = UI.gameShell('🧭 Bearings Lab', {
      sub: 'Radial survey',
      meta: [scoreChip],
      backTo: '/play',
      help: 'Set each arm to its true bearing and distance from O. True bearings are measured CLOCKWISE FROM NORTH in three digits. Once the survey matches, split the region into triangles from O and total the areas with A = ½ab·sin C.'
    });
    UI.onLeave(function () { ended = true; });
    var host = U.el('.stack');
    U.add(shell.body, host);

    function next() {
      if (ended) return;
      if (round >= ROUNDS) { finish(); return; }
      round++;
      var legs = makeSurvey();
      var sol = surveyArea(legs);
      /* The student drags to match; start every arm somewhere wrong. */
      var guess = legs.map(function (l) { return { bearing: (l.bearing + U.randInt(40, 300)) % 360, dist: U.randInt(4, 30), to: l.to }; });
      var plotted = false;

      U.clear(host);
      var brief = U.el('.card', [
        U.el('.spread', [
          U.el('.tiny.dim', 'Survey ' + round + ' of ' + ROUNDS),
          U.el('.tiny.dim', '🧭 ' + legs.length + ' arms')
        ]),
        U.el('.qtext', 'Plot the radial survey from O.'),
        UI.table({
          head: ['To', 'True bearing', 'Distance (km)'],
          rows: legs.map(function (l) { return [l.to, String(l.bearing).padStart(3, '0') + '°', String(l.dist)]; })
        })
      ]);
      var figHost = U.el('.card.tight');
      var ctrl = U.el('.card');
      U.add(host, [brief, figHost, ctrl]);

      function draw(showTarget) {
        U.clear(figHost);
        var w = Math.min(300, Math.max(272, window.innerWidth - 52));
        var made = D.make(w, w, 'fig');
        /* A radial survey draws every arm from O, not end-to-end, so pass each
           arm as its own single-leg diagram overlaid on one compass. */
        drawRadial(made.ctx, w, w, showTarget ? legs : guess, made.P, showTarget);
        made.canvas.setAttribute('role', 'img');
        made.canvas.setAttribute('aria-label', 'a radial survey from O with ' + legs.length + ' arms');
        U.add(figHost, U.el('.center', made.canvas));
        U.add(figHost, U.el('.tiny.dim.center', showTarget ? 'The correct survey.' : 'Your survey — match it to the table.'));
      }

      function drawRadial(ctx, w, h, arms, P, correct) {
        var cx = w / 2, cy = h / 2;
        var maxD = Math.max.apply(null, arms.map(function (a) { return a.dist; }).concat([1]));
        var scale = Math.min(w, h) * 0.36 / maxD;
        ctx.strokeStyle = P.line; ctx.lineWidth = 1; ctx.setLineDash([3, 4]);
        ctx.beginPath(); ctx.arc(cx, cy, Math.min(w, h) * 0.42, 0, Math.PI * 2); ctx.stroke();
        ctx.setLineDash([]);
        D.line(ctx, cx, cy - Math.min(w, h) * 0.46, cx, cy + Math.min(w, h) * 0.46, P.line, 1);
        D.line(ctx, cx - Math.min(w, h) * 0.46, cy, cx + Math.min(w, h) * 0.46, cy, P.line, 1);
        D.label(ctx, 'N', cx, cy - Math.min(w, h) * 0.46 - 8, P.dim, 10);
        D.label(ctx, 'S', cx, cy + Math.min(w, h) * 0.46 + 8, P.dim, 10);
        D.label(ctx, 'E', cx + Math.min(w, h) * 0.46 + 8, cy, P.dim, 10);
        D.label(ctx, 'W', cx - Math.min(w, h) * 0.46 - 9, cy, P.dim, 10);

        var pts = arms.map(function (a) {
          var rad = (a.bearing - 90) * Math.PI / 180;
          return { x: cx + Math.cos(rad) * a.dist * scale, y: cy + Math.sin(rad) * a.dist * scale, nm: a.to, arm: a };
        });
        /* Shade the polygon so the area being asked about is visible. */
        if (pts.length >= 3) {
          ctx.fillStyle = correct ? P.good : P.accent;
          ctx.globalAlpha = 0.16;
          ctx.beginPath();
          pts.forEach(function (p, i) { if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y); });
          ctx.closePath(); ctx.fill();
          ctx.globalAlpha = 1;
          ctx.strokeStyle = correct ? P.good : P.accent2; ctx.lineWidth = 1.6;
          ctx.beginPath();
          pts.forEach(function (p, i) { if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y); });
          ctx.closePath(); ctx.stroke();
        }
        pts.forEach(function (p) {
          D.line(ctx, cx, cy, p.x, p.y, correct ? P.good : P.accent, 2.2);
          ctx.fillStyle = P.ink;
          ctx.beginPath(); ctx.arc(p.x, p.y, 4, 0, Math.PI * 2); ctx.fill();
          D.label(ctx, p.nm + ' (' + String(p.arm.bearing).padStart(3, '0') + '°, ' + p.arm.dist + ')', p.x, p.y - 13, P.ink, 9.5);
        });
        ctx.fillStyle = P.warn;
        ctx.beginPath(); ctx.arc(cx, cy, 5, 0, Math.PI * 2); ctx.fill();
        D.label(ctx, 'O', cx - 12, cy + 12, P.warn, 11);
      }

      function matches() {
        return guess.every(function (g, i) { return g.bearing === legs[i].bearing && g.dist === legs[i].dist; });
      }

      function renderControls() {
        U.clear(ctrl);
        guess.forEach(function (g, i) {
          var bOk = g.bearing === legs[i].bearing, dOk = g.dist === legs[i].dist;
          var bIn = U.el('input', { type: 'range', min: '0', max: '359', step: '1', value: String(g.bearing), 'aria-label': 'bearing to ' + g.to });
          var dIn = U.el('input', { type: 'range', min: '1', max: '32', step: '1', value: String(g.dist), 'aria-label': 'distance to ' + g.to });
          bIn.addEventListener('input', function () {
            g.bearing = Number(bIn.value); Audio.throttled('slide', 40); draw(false); refreshLabels();
          });
          dIn.addEventListener('input', function () {
            g.dist = Number(dIn.value); Audio.throttled('slide', 40); draw(false); refreshLabels();
          });
          var lbl = U.el('.spread', [
            U.el('strong', 'O → ' + g.to),
            U.el('.tiny' + (bOk && dOk ? '.good' : '.dim'), '')
          ]);
          U.add(ctrl, U.el('.stack', { style: { marginBottom: '8px' }, dataset: { arm: String(i) } }, [
            lbl,
            U.el('.tiny.dim', 'Bearing'), bIn,
            U.el('.tiny.dim', 'Distance'), dIn
          ]));
        });
        var plotBtn = U.el('button.btn.pri.wide', { onclick: checkPlot }, '📍 Confirm the survey');
        U.add(ctrl, plotBtn);
        refreshLabels();
      }

      function refreshLabels() {
        U.$$('[data-arm]', ctrl).forEach(function (node) {
          var i = Number(node.dataset.arm);
          var g = guess[i];
          var bOk = g.bearing === legs[i].bearing, dOk = g.dist === legs[i].dist;
          var tag = U.$('.tiny', node);
          if (!tag) return;
          tag.textContent = String(g.bearing).padStart(3, '0') + '° · ' + g.dist + ' km ' +
            (bOk && dOk ? '✓' : (bOk ? 'bearing ✓' : dOk ? 'distance ✓' : ''));
          tag.className = 'tiny ' + (bOk && dOk ? 'good' : 'dim');
        });
      }

      function checkPlot() {
        if (ended || plotted) return;
        if (!matches()) {
          Audio.play('outTol');
          FX.shake(4);
          UI.toast('Not matching the survey table yet', 'warn', 1800);
          return;
        }
        plotted = true;
        Audio.play('inTol');
        FX.confetti(30);
        pool.right(2, 9999, 0);
        State.bump('labsPassed');
        draw(true);
        U.clear(ctrl);
        U.add(ctrl, [
          U.el('strong.good', '✓ Survey plotted'),
          U.el('.why', { html: U.mathHtml('True bearings run clockwise from north, so 090\\deg is due east and 270\\deg is due west. The shaded region is the area to find.') }),
          U.el('button.btn.pri.wide', { onclick: stageArea }, 'Now find the area →')
        ]);
      }

      /* ---------------------------- stage 2: area by the area rule ------- */
      function stageArea() {
        var card = U.el('.card', [
          U.el('strong', '📐 Area of the survey'),
          U.el('.sub', 'Split the region into triangles from O and total them with A = \\frac{1}{2}ab\\sin C.'),
          UI.table({
            head: ['Triangle', 'a (km)', 'b (km)', 'Included angle'],
            rows: sol.parts.map(function (p) {
              return ['O' + p.from + p.to, String(p.a), String(p.b), U.round(p.angle, 1) + '°'];
            })
          })
        ]);
        var fld = UI.numberField({ label: 'Total area (km²)', hint: 'Within 0.5% is accepted.' });
        var go = U.el('button.btn.pri.wide', { onclick: function () { grade(fld); } }, 'Submit');
        U.add(card, [fld.node, go]);
        U.add(host, card);
        fld.input.focus();
        UI.keys({ Enter: function () { go.click(); } });
        card.scrollIntoView({ block: 'nearest' });

        function grade(f) {
          if (ended) return;
          if (!String(f.input.value).trim()) { Audio.play('refused'); UI.toast('Type the area', 'warn'); return; }
          var right = U.numClose(f.input.value, sol.total, { tolRel: 0.005 });
          f.input.disabled = true;
          f.input.classList.add(right ? 'ok' : 'no');
          if (right) {
            passed++;
            var gained = pool.right(3, 9999, 0);
            Audio.play('correct');
            var c = FX.centreOf(f.input);
            FX.burst(c.x, c.y, null, 16);
            FX.floatText('+' + gained, c.x, c.y);
          } else {
            pool.wrongAnswer(3);
            Audio.play('wrong');
          }
          State.answer(null, right, 'MS-M6', 9999);
          scoreChip.textContent = passed + '/' + ROUNDS;
          var work = sol.parts.map(function (p) {
            return '\\frac{1}{2} × ' + p.a + ' × ' + p.b + ' × \\sin ' + U.round(p.angle, 1) + '\\deg = ' + U.round(p.area, 2);
          }).join('; ');
          U.add(card, U.el('.stack', { style: { marginTop: '10px' } }, [
            U.el('.spread', [
              U.el('strong' + (right ? '.good' : '.bad'), right ? '✓ Correct' : '✗ Not quite'),
              U.el('.chip' + (right ? '.good' : '.bad'), U.round(sol.total, 2) + ' km²')
            ]),
            U.el('.why', { html: U.mathHtml(work + '. Total = ' + U.round(sol.total, 2) + ' km². The included angle is the difference between the two bearings — take the smaller way round, and never the bearing itself.') }),
            U.el('button.btn.pri.wide', { onclick: next }, round >= ROUNDS ? 'See results →' : 'Next survey →')
          ]));
          card.scrollIntoView({ block: 'nearest' });
        }
      }

      draw(false);
      renderControls();
    }

    function finish() {
      if (ended) return;
      ended = true;
      var acc = pool.accuracy();
      State.bump('playSecs', Math.round((Date.now() - startedAt) / 1000));
      if (pool.wrong === 0 && passed === ROUNDS) State.bump('perfect');
      var res = UI.award({ xp: pool.xp, bonus: 150, coins: passed * 22, accuracy: acc,
        answered: pool.answered(), pace: { items: pool.answered(), tooFast: pool.fast }, mode: 'bearings', node: scoreChip });
      State.recordScore('bearings', passed);
      State.progressDaily('bearings', passed);
      UI.results({
        title: 'Survey complete',
        accuracy: acc,
        rows: [
          ['Areas found', passed + ' / ' + ROUNDS],
          ['XP earned', U.commas(res.xp)],
          ['Credits', '+' + res.coins]
        ],
        note: 'A radial survey always splits into triangles from the central point. The area rule needs the angle BETWEEN two arms, which is the difference of their bearings.',
        backTo: '/play',
        again: function () { UI.go(UI.path()); }
      });
    }

    next();
  };
})();
