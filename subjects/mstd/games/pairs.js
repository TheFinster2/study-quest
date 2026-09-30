/* ============================================================================
   pairs.js — 🃏 Match Pairs. Concentration on 6 pairs from one set: shape ↔
   area formula, unit ↔ equivalent, statistic ↔ definition, network term ↔
   meaning.

   §9.6 applies in spirit: a 12-cell board is guessable, so the score is
   net (matches − mismatched attempts) and the completion bonus rides on it.
   ========================================================================== */
window.MS = window.MS || {};
window.MS.Games = window.MS.Games || {};
(function () {
  'use strict';
  var MS = window.MS, U = MS.U, UI = MS.UI, State = MS.State, Audio = MS.Audio, FX = MS.FX;

  var PAIRS_PER_BOARD = 6;

  MS.Games.pairs = function () {
    var set = U.pick(MS.PAIR_SETS);
    var chosen = U.sample(set.pairs, PAIRS_PER_BOARD);
    var pool = UI.pool();
    var ended = false, startedAt = Date.now();
    var matched = 0, attempts = 0, misses = 0;
    var first = null, busy = false;

    var scoreChip = UI.chip('0/' + PAIRS_PER_BOARD);
    var missChip = UI.chip('0 misses');
    var shell = UI.gameShell('🃏 Match Pairs', {
      sub: set.nm,
      meta: [scoreChip, missChip],
      backTo: '/play',
      help: 'Tap two cards to find a matching pair. Mismatches count against you, so remember what you have seen rather than tapping around — random clicking pays nothing.'
    });
    UI.onLeave(function () { ended = true; });

    var cards = [];
    chosen.forEach(function (p, i) {
      cards.push({ pair: i, text: p[0], side: 'L' });
      cards.push({ pair: i, text: p[1], side: 'R' });
    });
    cards = U.shuffle(cards);

    var grid = U.el('.gridgame', { style: { gridTemplateColumns: 'repeat(3, 1fr)' } });
    var nodes = [];
    cards.forEach(function (c, idx) {
      var cell = U.el('button.cell.face', {
        style: { minHeight: '74px' },
        'aria-label': 'card ' + (idx + 1),
        onclick: function () { flip(idx); }
      }, '?');
      nodes.push(cell);
      U.add(grid, cell);
    });
    U.add(shell.body, [
      U.el('.card.tight', U.el('.tiny.dim', set.nm + ' — find the ' + PAIRS_PER_BOARD + ' matching pairs.')),
      U.el('.card', grid)
    ]);

    function show(idx) {
      var c = cards[idx];
      nodes[idx].classList.remove('face');
      nodes[idx].innerHTML = U.mathHtml(c.text);
      nodes[idx].classList.add('on');
    }
    function hide(idx) {
      nodes[idx].classList.add('face');
      nodes[idx].classList.remove('on');
      nodes[idx].textContent = '?';
    }

    function flip(idx) {
      if (ended || busy) return;
      if (nodes[idx].classList.contains('gone')) return;
      if (first === idx) return;
      Audio.play('cardPick');
      show(idx);
      if (first == null) { first = idx; return; }

      attempts++;
      busy = true;
      var a = cards[first], b = cards[idx];
      if (a.pair === b.pair && a.side !== b.side) {
        matched++;
        Audio.play('matchYes');
        nodes[first].classList.add('right');
        nodes[idx].classList.add('right');
        var c = FX.centreOf(nodes[idx]);
        FX.burst(c.x, c.y, null, 12);
        var gained = pool.right(2, 9999, 0);
        FX.floatText('+' + gained, c.x, c.y);
        var f = first; first = null;
        setTimeout(function () {
          if (ended) return;
          nodes[f].classList.add('gone');
          nodes[idx].classList.add('gone');
          busy = false;
          scoreChip.textContent = matched + '/' + PAIRS_PER_BOARD;
          if (matched === PAIRS_PER_BOARD) { Audio.play('clearAll'); FX.confetti(60); finish(); }
        }, 380);
      } else {
        misses++;
        pool.wrongAnswer(1);
        Audio.play('matchNo');
        nodes[first].classList.add('wrong');
        nodes[idx].classList.add('wrong');
        var f2 = first; first = null;
        missChip.textContent = misses + (misses === 1 ? ' miss' : ' misses');
        setTimeout(function () {
          if (ended) return;
          nodes[f2].classList.remove('wrong');
          nodes[idx].classList.remove('wrong');
          hide(f2); hide(idx);
          busy = false;
        }, 700);
      }
    }

    function finish() {
      if (ended) return;
      ended = true;
      /* Net accuracy: a perfect board is 6 attempts for 6 pairs. */
      var acc = attempts ? matched / attempts : 0;
      State.bump('playSecs', Math.round((Date.now() - startedAt) / 1000));
      State.bump('pairsCleared');
      if (misses === 0) State.bump('perfect');
      State.recordAnswer(null, acc >= 0.6, set.mod, 9999);
      var res = UI.award({
        xp: pool.xp, bonus: 80, coins: Math.max(0, matched * 8 - misses * 3),
        accuracy: acc, answered: attempts, mode: 'pairs', node: scoreChip
      });
      State.recordScore('pairs', Math.max(0, matched - misses));
      State.progressDaily('pairs', 1);
      UI.results({
        title: 'Board cleared',
        accuracy: acc,
        rows: [
          ['Set', set.nm],
          ['Pairs', matched + '/' + PAIRS_PER_BOARD],
          ['Attempts', attempts],
          ['Misses', misses],
          ['XP earned', U.commas(res.xp)],
          ['Credits', '+' + res.coins]
        ],
        note: misses === 0 ? 'Perfect recall — six attempts, six pairs.' : 'Mismatches subtract, so this board rewards memory over speed.',
        backTo: '/play',
        again: function () { UI.closeModal(); MS.Games.pairs(); }
      });
    }
  };
})();
