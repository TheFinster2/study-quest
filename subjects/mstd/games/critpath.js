/* ============================================================================
   critpath.js — 🕸️ Critical Path (MS-N1/N2). The strongest chemistry→Standard
   translation in the brief: Standard 2 has actual graph theory in the syllabus.

   Four stages per puzzle, each worth marks:
     1. Build   — drag activities into dependency columns
     2. Forward — enter each earliest start time
     3. Backward— enter each latest start time
     4. Path    — select the critical activities

   §9.9: the answer is never stored. js/core/net.js computes it, and
   tests/validate.js checks that with a second implementation.
   ========================================================================== */
window.MS = window.MS || {};
window.MS.Games = window.MS.Games || {};
(function () {
  'use strict';
  var MS = window.MS, U = MS.U, UI = MS.UI, State = MS.State, Audio = MS.Audio, FX = MS.FX, Net = MS.Net, D = MS.Draw;

  MS.Games.critpath = function () {
    var project = U.pick(MS.PROJECTS);
    var sol = Net.analyse(project.activities);
    var lay = Net.layout(project.activities, sol);
    var pool = UI.pool();
    var stage = 0, done = false;
    var startedAt = Date.now();
    var scored = { fwd: 0, fwdWrong: 0, back: 0, backWrong: 0, path: 0, pathWrong: 0 };

    var stageChip = UI.chip('Stage 1 of 3');
    var shell = UI.gameShell('🕸️ Critical Path', {
      sub: project.nm,
      meta: [stageChip],
      backTo: '/play',
      help: 'Three stages. Forward-scan every earliest start time, backward-scan every latest start time, then pick out the activities with zero float — that is the critical path. Float = latest start − earliest start.'
    });
    UI.onLeave(function () { done = true; });

    var figHost = U.el('.card.tight');
    var body = U.el('.stack');
    U.add(shell.body, [figHost, body]);

    /* ------------------------------------------------------------- diagram */
    function drawNet(opts) {
      opts = opts || {};
      U.clear(figHost);
      var w = Math.min(316, Math.max(280, window.innerWidth - 44));
      var h = 40 + lay.cols * 8 + 190;
      var made = D.make(w, h, 'fig');
      D.network(made.ctx, w, h, {
        nodes: lay.nodes, edges: lay.edges, directed: true,
        path: opts.showPath ? sol.critical : null,
        labels: opts.labels || null,
        P: made.P
      });
      made.canvas.setAttribute('role', 'img');
      made.canvas.setAttribute('aria-label', 'the project network for ' + project.nm);
      U.add(figHost, U.el('.center', made.canvas));
      U.add(figHost, U.el('.tiny.dim.center', project.ds + ' Durations in ' + project.unit + ', shown under each activity.'));
    }

    /* --------------------------------------------------------- activity table */
    function activityTable() {
      return UI.table({
        head: ['Activity', 'Description', 'Duration', 'Predecessors'],
        rows: project.activities.map(function (a) {
          return [a.id, a.nm, String(a.dur), a.pre.length ? a.pre.join(', ') : '—'];
        })
      });
    }

    /* ============================================== stage 1 — forward scan */
    function stageForward() {
      stage = 1;
      stageChip.textContent = 'Stage 1 of 3 — forward scan';
      Audio.play('scanFwd');
      drawNet();
      U.clear(body);
      U.add(body, [
        U.el('.card', [
          U.el('strong', '→ Forward scan'),
          U.el('.sub', 'Enter the earliest start time (EST) for every activity. An activity cannot start until ALL its predecessors have finished, so take the largest predecessor finish time.'),
          activityTable()
        ])
      ]);
      var grid = U.el('.stack');
      var fields = {};
      sol.order.forEach(function (id) {
        var n = sol.nodes[id];
        var f = U.el('input.fld', { type: 'text', inputmode: 'numeric', placeholder: 'EST', style: { maxWidth: '110px' } });
        fields[id] = f;
        U.add(grid, U.el('.spread', [
          U.el('div', [
            U.el('strong', id),
            U.el('.tiny.dim', 'takes ' + n.dur + ' ' + project.unit + (n.pre.length ? ', after ' + n.pre.join(' & ') : ', can start immediately'))
          ]),
          f
        ]));
      });
      U.add(body, U.el('.card', [grid, U.el('button.btn.pri.wide', { style: { marginTop: '10px' }, onclick: checkForward }, 'Check the forward scan →')]));

      function checkForward() {
        var right = 0, wrong = 0;
        sol.order.forEach(function (id) {
          var f = fields[id];
          var got = U.parseNumber(f.value);
          var want = sol.nodes[id].est;
          f.disabled = true;
          if (isFinite(got) && Math.abs(got - want) < 0.001) { f.classList.add('ok'); right++; }
          else { f.classList.add('no'); f.value = String(want); wrong++; }
        });
        scored.fwd = right; scored.fwdWrong = wrong;
        /* §9.6 — net scoring, so filling the grid with guesses pays nothing. */
        var net = Math.max(0, right - wrong);
        for (var i = 0; i < net; i++) pool.right(2, 9999, 0);
        for (var j = 0; j < wrong; j++) pool.wrongAnswer(1);
        Audio.play(wrong === 0 ? 'correct' : 'near');
        if (wrong === 0) FX.confetti(28);
        UI.toast(right + ' of ' + sol.order.length + ' earliest start times correct', wrong ? 'warn' : 'good');
        U.clear(body);
        U.add(body, U.el('.card', [
          U.el('strong', wrong === 0 ? '✅ Forward scan complete' : '📝 Corrected forward scan'),
          U.el('.why', 'Minimum completion time = the largest earliest finish time = ' + sol.duration + ' ' + project.unit + '.'),
          U.el('button.btn.pri.wide', { onclick: stageBackward }, 'Backward scan →')
        ]));
      }
    }

    /* ============================================= stage 2 — backward scan */
    function stageBackward() {
      stage = 2;
      stageChip.textContent = 'Stage 2 of 3 — backward scan';
      Audio.play('scanBack');
      drawNet({ labels: null });
      U.clear(body);
      U.add(body, U.el('.card', [
        U.el('strong', '← Backward scan'),
        U.el('.sub', 'The project must finish in ' + sol.duration + ' ' + project.unit + '. Working backwards, enter the latest start time (LST) for every activity: LST = latest finish − duration, where the latest finish is the smallest LST of the activities that follow it.'),
        activityTable()
      ]));
      var grid = U.el('.stack');
      var fields = {};
      sol.order.slice().reverse().forEach(function (id) {
        var n = sol.nodes[id];
        var f = U.el('input.fld', { type: 'text', inputmode: 'numeric', placeholder: 'LST', style: { maxWidth: '110px' } });
        fields[id] = f;
        U.add(grid, U.el('.spread', [
          U.el('div', [
            U.el('strong', id),
            U.el('.tiny.dim', 'EST ' + n.est + ', takes ' + n.dur + (n.succ.length ? ', before ' + n.succ.join(' & ') : ', finishes the project'))
          ]),
          f
        ]));
      });
      U.add(body, U.el('.card', [grid, U.el('button.btn.pri.wide', { style: { marginTop: '10px' }, onclick: checkBackward }, 'Check the backward scan →')]));

      function checkBackward() {
        var right = 0, wrong = 0;
        sol.order.forEach(function (id) {
          var f = fields[id], want = sol.nodes[id].lst;
          var got = U.parseNumber(f.value);
          f.disabled = true;
          if (isFinite(got) && Math.abs(got - want) < 0.001) { f.classList.add('ok'); right++; }
          else { f.classList.add('no'); f.value = String(want); wrong++; }
        });
        scored.back = right; scored.backWrong = wrong;
        var net = Math.max(0, right - wrong);
        for (var i = 0; i < net; i++) pool.right(2, 9999, 0);
        for (var j = 0; j < wrong; j++) pool.wrongAnswer(1);
        Audio.play(wrong === 0 ? 'correct' : 'near');
        UI.toast(right + ' of ' + sol.order.length + ' latest start times correct', wrong ? 'warn' : 'good');
        stagePath();
      }
    }

    /* ============================================ stage 3 — critical path */
    function stagePath() {
      stage = 3;
      stageChip.textContent = 'Stage 3 of 3 — the critical path';
      U.clear(body);
      drawNet();
      var picked = {};
      var cells = {};
      var floatTable = UI.table({
        head: ['Activity', 'EST', 'LST', 'Float'],
        rows: sol.order.map(function (id) {
          var n = sol.nodes[id];
          return [id, String(n.est), String(n.lst), String(n.float)];
        })
      });
      var grid = U.el('.gridgame', { style: { gridTemplateColumns: 'repeat(4, 1fr)' } });
      sol.order.forEach(function (id) {
        var c = U.el('button.cell', {
          onclick: function () {
            if (done) return;
            picked[id] = !picked[id];
            c.classList.toggle('on', picked[id]);
            Audio.play(picked[id] ? 'cardPick' : 'tapSoft');
          }
        }, id);
        cells[id] = c;
        U.add(grid, c);
      });
      U.add(body, U.el('.card', [
        U.el('strong', '🎯 Which activities are critical?'),
        U.el('.sub', 'An activity is on the critical path when its float is zero — it has no slack at all. Select every critical activity.'),
        floatTable,
        grid,
        U.el('button.btn.pri.wide', { style: { marginTop: '10px' }, onclick: checkPath }, 'Lock in the critical path')
      ]));

      function checkPath() {
        if (done) return;
        var right = 0, wrong = 0;
        var criticalSet = {};
        sol.zeroFloat.forEach(function (id) { criticalSet[id] = 1; });
        sol.order.forEach(function (id) {
          var should = !!criticalSet[id], did = !!picked[id];
          cells[id].disabled = true;
          if (should && did) { cells[id].classList.add('right'); right++; }
          else if (should && !did) { cells[id].classList.add('wrong'); wrong++; }
          else if (!should && did) { cells[id].classList.add('wrong'); wrong++; }
        });
        scored.path = right; scored.pathWrong = wrong;
        var net = Math.max(0, right - wrong);
        for (var i = 0; i < net; i++) pool.right(3, 9999, 0);
        for (var j = 0; j < wrong; j++) pool.wrongAnswer(2);
        Audio.play(wrong === 0 ? 'pathFound' : 'wrong');
        if (wrong === 0) FX.confetti(60);
        drawNet({ showPath: true });
        finish();
      }
    }

    /* ------------------------------------------------------------- finish */
    function finish() {
      if (done) return;
      done = true;
      var totalRight = scored.fwd + scored.back + scored.path;
      var totalWrong = scored.fwdWrong + scored.backWrong + scored.pathWrong;
      var acc = totalRight + totalWrong ? totalRight / (totalRight + totalWrong) : 0;
      State.bump('playSecs', Math.round((Date.now() - startedAt) / 1000));
      if (acc >= 0.999) State.bump('perfect');
      State.bump('pathsSolved');
      State.recordAnswer(null, acc >= 0.7, 'MS-N2', 9999);

      var res = UI.award({
        xp: pool.xp, bonus: 140, coins: Math.round(totalRight * 5),
        accuracy: acc, answered: totalRight + totalWrong, mode: 'critpath', node: stageChip
      });
      State.recordScore('critpath', totalRight);
      State.progressDaily('critpath', 1);

      UI.results({
        title: acc >= 0.999 ? 'Project delivered' : 'Project complete',
        accuracy: acc,
        rows: [
          ['Project', project.nm],
          ['Minimum completion', sol.duration + ' ' + project.unit],
          ['Critical path', sol.critical.join(' → ')],
          ['Forward scan', scored.fwd + '/' + sol.order.length],
          ['Backward scan', scored.back + '/' + sol.order.length],
          ['Critical activities found', scored.path + '/' + sol.zeroFloat.length],
          ['XP earned', U.commas(res.xp)],
          ['Credits', '+' + res.coins]
        ],
        note: 'Every activity on ' + sol.critical.join(' → ') + ' has zero float, so delaying any of them delays the whole project. The others have slack you can spend.',
        backTo: '/play',
        again: function () { UI.closeModal(); MS.Games.critpath(); }
      });
    }

    /* Intro modal so the mode is not a wall of inputs on first sight. */
    if (!State.seenOnce('critpath-intro')) {
      UI.modal({
        title: '🕸️ Critical Path',
        sub: project.nm,
        body: U.el('.stack', [
          U.el('.why', 'Forward scan for earliest start times, backward scan for latest start times, then find the activities with zero float. That chain is the critical path — the longest route through the project, and the only one where a delay pushes the finish date out.'),
          U.el('.tiny.dim', 'Wrong entries subtract, so filling boxes with guesses pays nothing.')
        ]),
        buttons: [{ label: 'Start the scan', pri: true, onclick: stageForward }]
      });
    } else stageForward();
  };
})();
