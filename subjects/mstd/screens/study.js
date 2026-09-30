/* ============================================================================
   study.js — 🃏 the flashcard deck. 5-box Leitner, intervals 1/2/4/8/16 days,
   a miss drops straight to box 1.

   §9.8 is the whole reason this screen is careful about XP: "Did you get it?"
   → "Yes" → XP is an infinite loop. A card pays only ONCE PER DAY, only if it
   was genuinely DUE, and only if it stayed on screen for MIN_READ_MS. The
   accuracy reported to award() is paid cards ÷ deck size, never the
   self-reported figure.
   ========================================================================== */
window.MS = window.MS || {};
window.MS.Screens = window.MS.Screens || {};
(function () {
  'use strict';
  var MS = window.MS, U = MS.U, UI = MS.UI, State = MS.State, Bank = MS.Bank, Audio = MS.Audio, FX = MS.FX;

  MS.Screens.study = function (root) {
    var all = MS.CARDS || [];
    var ids = all.map(function (c) { return c.id; });
    var due = State.dueIds(ids);
    var spread = State.deckSpread(ids);

    U.add(root, U.el('.card', [
      U.el('.spread', [
        U.el('strong', '🃏 Flashcards'),
        UI.chip(due.length + ' due today', due.length ? 'good' : 'dim')
      ]),
      U.el('.sub', 'A 5-box Leitner deck with graded review. Good moves a card up a box, Easy moves it up two, Hard keeps it and brings it back tomorrow, Again drops it to box 1 and counts a lapse. Four lapses makes a card a leech.'),
      U.el('.hr'),
      U.el('.row', spread.map(function (n, i) {
        return UI.chip('Box ' + (i + 1) + ': ' + n, i === 4 ? 'good' : i === 0 ? 'warn' : null);
      })),
      U.el('.tiny.dim', { style: { marginTop: '6px' } }, 'Intervals: 1, 2, 4, 8 then 16 days.'),
      due.length
        ? U.el('button.btn.pri.wide', { style: { marginTop: '10px' }, onclick: function () { runDeck(due.slice(0, 20)); } },
               '▶️ Review ' + Math.min(20, due.length) + ' due card' + (Math.min(20, due.length) === 1 ? '' : 's'))
        : U.el('.why', { style: { marginTop: '10px' } }, 'Nothing is due. Cards return on their own schedule — you can still browse a topic below, but only genuinely due cards pay XP.')
    ]));

    var leeches = State.leeches();
    var marks = (State.data.bookmarks || []).filter(function (id) { return !!Bank.byId(id); });
    U.add(root, U.el('.card.tight', U.el('.row', [
      U.el('button.btn.sm' + (leeches.length ? '.pri' : '.ghost'), { onclick: function () { UI.go('/study/leeches'); } }, '🩸 Leeches (' + leeches.length + ')'),
      U.el('button.btn.sm.ghost', { onclick: function () { UI.go('/study/bookmarks'); } }, '🔖 Bookmarks (' + marks.length + ')'),
      U.el('button.btn.sm.ghost', { onclick: function () { UI.go('/reference'); } }, '📖 Reference')
    ])));

    /* ---------------------------------------------------------- by topic */
    var byTopic = {};
    all.forEach(function (c) { (byTopic[c.mod] = byTopic[c.mod] || []).push(c); });
    U.add(root, U.el('.card.tight', U.el('.spread', [
      U.el('strong', 'Browse by topic'),
      U.el('.tiny.dim', all.length + ' cards')
    ])));
    var grid = U.el('.tiles.one');
    Bank.TOPICS.forEach(function (t) {
      var list = byTopic[t.code];
      if (!list || !list.length) return;
      var dueHere = State.dueIds(list.map(function (c) { return c.id; })).length;
      U.add(grid, U.el('button.tile', {
        onclick: function () { Audio.play('tap'); UI.go('/study/deck/' + t.code); }
      }, [
        U.el('.spread', [
          U.el('div', [
            U.el('.nm', t.ic + ' ' + t.nm),
            U.el('.ds', list.length + ' cards' + (dueHere ? ' · ' + dueHere + ' due' : ''))
          ]),
          dueHere ? U.el('.chip.good', String(dueHere)) : U.el('.chip.dim', '✓')
        ])
      ]));
    });
    U.add(root, grid);
  };

  MS.Screens.deck = function (root, params) {
    var t = Bank.topic(params.topic);
    var list = (MS.CARDS || []).filter(function (c) { return c.mod === params.topic; });
    if (!t || !list.length) { UI.go('/study'); return; }
    var dueHere = State.dueIds(list.map(function (c) { return c.id; }));
    U.add(root, U.el('.card', [
      U.el('strong', t.ic + ' ' + t.nm),
      U.el('.sub', list.length + ' cards, ' + dueHere.length + ' due today.'),
      U.el('.row', [
        U.el('button.btn.pri.grow', {
          onclick: function () { runDeck(dueHere.length ? dueHere : list.map(function (c) { return c.id; }), params.topic); }
        }, dueHere.length ? '▶️ Review ' + dueHere.length + ' due' : '👀 Browse all ' + list.length),
        U.el('button.btn.sm.ghost', { onclick: function () { UI.go('/study'); } }, 'Back')
      ]),
      dueHere.length ? null : U.el('.tiny.dim', { style: { marginTop: '8px' } }, 'Nothing due here, so browsing pays no XP — that is deliberate.')
    ]));
    var boxes = U.el('.stack');
    list.forEach(function (c) {
      var st = State.cardState(c.id);
      var d = U.daysBetween(U.dayKey(), st.due);
      U.add(boxes, U.el('.ach', [
        U.el('.ic', 'Box ' + st.box),
        U.el('div', [
          U.el('.nm', { html: U.mathHtml(c.front) }),
          U.el('.ds', d <= 0 ? 'due now' : 'due in ' + d + ' day' + (d === 1 ? '' : 's'))
        ]),
        U.el('.chip' + (st.box === 5 ? '.good' : st.box === 1 ? '.warn' : ''), '★'.repeat(st.box))
      ]));
    });
    U.add(root, U.el('.card', boxes));
  };

  /* ============================================================ leeches */
  MS.Screens.leeches = function (root) {
    var list = State.leeches();
    U.add(root, U.el('.card', [
      U.el('.spread', [U.el('strong', '🩸 Leeches'), UI.chip(list.length + ' card' + (list.length === 1 ? '' : 's'), list.length ? 'bad' : 'dim')]),
      U.el('.sub', 'Cards you have graded "Again" four or more times. Re-reading them the same way is not working — read the worked back, then drill the topic.'),
      list.length ? U.el('button.btn.pri.wide', { style: { marginTop: '10px' }, onclick: function () { runDeck(list.map(function (x) { return x.q.id; })); } }, '▶️ Review all leeches') : null
    ]));
    if (!list.length) { U.add(root, U.el('.why', 'No leeches. Nice.')); }
    var box = U.el('.stack');
    list.forEach(function (x) {
      U.add(box, U.el('.ach', [
        U.el('.ic', '🩸'),
        U.el('div', [U.el('.nm', { html: U.mathHtml(x.q.front) }), U.el('.ds', x.q.mod + ' · ' + x.c.lapses + ' lapses · box ' + x.c.box)]),
        U.el('button.btn.sm.ghost', { onclick: function () { UI.go('/game/drill/' + x.q.mod); } }, 'Drill')
      ]));
    });
    if (list.length) U.add(root, U.el('.card', box));
    U.add(root, U.el('.card.tight', U.el('button.btn.sm.ghost', { onclick: function () { UI.go('/study'); } }, '‹ Flashcards')));
  };

  /* ========================================================== bookmarks */
  MS.Screens.bookmarks = function (root) {
    var ids = (State.data.bookmarks || []).filter(function (id) { return !!Bank.byId(id); });
    U.add(root, U.el('.card', [
      U.el('.spread', [U.el('strong', '🔖 Bookmarked questions'), UI.chip(String(ids.length))]),
      U.el('.sub', 'Tap 🏷️ Save under any question to keep it here. Practise them as a run — it pays like Topic Drill.'),
      ids.length ? U.el('button.btn.pri.wide', { style: { marginTop: '10px' }, onclick: function () { UI.go('/game/bookmarks'); } }, '▶️ Practise ' + Math.min(15, ids.length)) : null
    ]));
    var box = U.el('.stack');
    ids.forEach(function (id) {
      var q = Bank.byId(id);
      U.add(box, U.el('.ach', [
        U.el('.ic', Bank.topicIcon(q.mod)),
        U.el('div', [U.el('.nm', { html: U.mathHtml(q.q) }), U.el('.ds', q.mod + ' · ' + q.topic)]),
        U.el('button.btn.sm.ghost', { 'aria-label': 'Remove bookmark', onclick: function () { State.toggleBookmark(id); UI.handleRoute(); } }, '✕')
      ]));
    });
    if (ids.length) U.add(root, U.el('.card', box));
    U.add(root, U.el('.card.tight', U.el('button.btn.sm.ghost', { onclick: function () { UI.go('/study'); } }, '‹ Flashcards')));
  };

  /* ======================================================== the review run */
  function runDeck(cardIds, topicCode) {
    var deck = U.shuffle(cardIds).map(function (id) {
      for (var i = 0; i < MS.CARDS.length; i++) if (MS.CARDS[i].id === id) return MS.CARDS[i];
      return null;
    }).filter(Boolean);
    if (!deck.length) { UI.go('/study'); return; }

    var i = 0, ended = false, startedAt = Date.now();
    var paid = 0, gotRight = 0, gotWrong = 0, tooFast = 0;
    var xp = 0;

    var progChip = UI.chip('1/' + deck.length);
    var paidChip = UI.chip('0 paid');
    var shell = UI.gameShell('🃏 Review', {
      sub: topicCode || 'Mixed',
      meta: [progChip, paidChip],
      backTo: topicCode ? '/study/deck/' + topicCode : '/study',
      help: 'Read the prompt, decide, then flip. A card pays XP only once per day, only if it was genuinely due, and only if it stayed on screen long enough to read — self-grading is otherwise free money, and the reference app learned that the hard way.'
    });
    UI.onLeave(function () { ended = true; });
    var host = U.el('.stack');
    U.add(shell.body, host);

    function show() {
      if (ended) return;
      if (i >= deck.length) { finish(); return; }
      var card = deck[i];
      var st = State.cardState(card.id);
      var eligible = State.cardXpEligible(card.id);
      var shownAt = Date.now();
      var minMs = UI.readMs(card.front + ' ' + card.back);
      var flipped = false;

      progChip.textContent = (i + 1) + '/' + deck.length;
      U.clear(host);

      var flip = U.el('.flip', U.el('.inner', [
        U.el('.face', U.el('div', [
          U.el('.tiny.dim', Bank.topicIcon(card.mod) + ' ' + card.mod + ' · box ' + st.box),
          U.el('.qtext', { style: { marginTop: '10px' }, html: U.mathHtml(card.front) })
        ])),
        U.el('.face.back', U.el('div', { html: U.mathHtml(card.back) }))
      ]));
      var flipBtn = U.el('button.btn.pri.wide', { onclick: doFlip }, 'Flip the card');
      function g(label, grade, cls) {
        return U.el('button.btn.grow' + (cls || ''), { onclick: function () { answer(grade, shownAt, minMs, eligible, card); } }, label);
      }
      var grade = U.el('.row.ms-grades', { hidden: true }, [
        g('✗ Again', 'again'), g('😬 Hard', 'hard'), g('✓ Good', 'good', '.pri'), g('⚡ Easy', 'easy')
      ]);

      U.add(host, [
        U.el('.card.tight', U.el('.spread', [
          U.el('.tiny.dim', eligible ? '💵 This card can pay XP today' : '○ Already paid today, or not due — no XP'),
          U.el('.tiny.dim', 'Box ' + st.box + '/5')
        ])),
        flip, flipBtn, grade
      ]);
      UI.keys({ ' ': doFlip,
        Enter: function () { if (flipped) grade.children[2].click(); else doFlip(); },
        '1': function () { if (flipped) grade.children[0].click(); }, '2': function () { if (flipped) grade.children[1].click(); },
        '3': function () { if (flipped) grade.children[2].click(); }, '4': function () { if (flipped) grade.children[3].click(); } });

      function doFlip() {
        if (flipped) return;
        flipped = true;
        flip.classList.add('on');
        Audio.play('flip');
        flipBtn.hidden = true;
        grade.hidden = false;
      }
    }

    function answer(grade, shownAt, minMs, eligible, card) {
      if (ended) return;
      var ms = Date.now() - shownAt;
      var right = grade !== 'again';
      var from = State.cardState(card.id).box;
      var wasLeech = State.isLeech(card.id);
      var after = State.reviewCard(card.id, grade);
      var moved = { from: from, to: after.box, days: Math.max(0, U.daysBetween(U.dayKey(), after.due)) };
      if (!wasLeech && State.isLeech(card.id)) UI.toast('🩸 That card is now a leech — it is on the Leeches list', 'bad', 2600);
      if (right) gotRight++; else gotWrong++;
      Audio.play(right ? 'cardEasy' : 'cardHard');
      Audio.play(moved.to > moved.from ? 'boxUp' : moved.to < moved.from ? 'boxDown' : 'tapSoft');

      /* §9.8, all three gates. */
      if (right && eligible && ms >= minMs) {
        State.markCardXp(card.id);
        State.bump('cardsPaid');
        paid++;
        xp += 10 * Math.min(3, moved.from);       // deeper boxes are worth more
      } else if (right && eligible && ms < minMs) {
        tooFast++;
      }
      paidChip.textContent = paid + ' paid';
      UI.toast(right
        ? '★ Box ' + moved.from + ' → ' + moved.to + ', back in ' + moved.days + ' day' + (moved.days === 1 ? '' : 's')
        : 'Back to box 1 — you will see it again soon', right ? 'good' : 'warn', 1500);
      i++;
      show();
    }

    function finish() {
      if (ended) return;
      ended = true;
      State.bump('playSecs', Math.round((Date.now() - startedAt) / 1000));
      Audio.play('deckDone');
      /* §9.8 — accuracy is paid ÷ deck size, NOT the self-reported figure.
         A student who taps "Got it" on everything reports 100% and gets the
         accuracy of however many cards were genuinely due and read. */
      var acc = deck.length ? paid / deck.length : 0;
      var res = UI.award({
        xp: xp, bonus: 50, coins: paid * 5, accuracy: acc,
        answered: deck.length, mode: 'study', node: paidChip
      });
      UI.results({
        title: 'Deck reviewed',
        accuracy: acc,
        rows: [
          ['Cards reviewed', deck.length],
          ['Graded hard/good/easy', gotRight],
          ['Graded again', gotWrong],
          ['Cards that paid XP', paid + ' / ' + deck.length],
          ['XP earned', U.commas(res.xp)],
          ['Credits', '+' + res.coins]
        ],
        note: tooFast
          ? tooFast + ' card' + (tooFast === 1 ? '' : 's') + ' were graded faster than they could be read, so they paid nothing.'
          : 'Only cards that were genuinely due and had not already paid today count. Self-grading is otherwise an infinite XP loop.',
        backTo: '/study',
        again: null
      });
    }

    show();
  }
})();
