/* ============================================================================
   achievements.js — 70 achievements, First Steps to 5,000 questions (§4.4).

   Two forms:
     { stat:'answered', at:100 }  — tested against State.achievementStats()
     { fn:function(st,d){...} }   — for anything compound

   validate.js asserts NOTHING unlocks on a fresh save. A fresh save already
   has daysActive:1, themes:1 and avatars:1, so thresholds on those must start
   at 2 or higher — that check exists because the reference app shipped an
   achievement that fired before the player had done anything.
   ========================================================================== */
window.MS = window.MS || {};
window.MS.ACHIEVEMENTS = (window.MS.ACHIEVEMENTS || []).concat([
  /* ------------------------------------------------------- volume: answered */
  { id: 'a-first',    ic: '👣', nm: 'First Steps',        ds: 'Answer your first question',      stat: 'answered', at: 1, coins: 10 },
  { id: 'a-ten',      ic: '🔟', nm: 'Warming Up',         ds: 'Answer 10 questions',             stat: 'answered', at: 10, coins: 15 },
  { id: 'a-fifty',    ic: '📗', nm: 'Getting Going',      ds: 'Answer 50 questions',             stat: 'answered', at: 50, coins: 25 },
  { id: 'a-hundred',  ic: '💯', nm: 'Century',            ds: 'Answer 100 questions',            stat: 'answered', at: 100, coins: 40 },
  { id: 'a-250',      ic: '📘', nm: 'Committed',          ds: 'Answer 250 questions',            stat: 'answered', at: 250, coins: 70 },
  { id: 'a-500',      ic: '📙', nm: 'Serious Now',        ds: 'Answer 500 questions',            stat: 'answered', at: 500, coins: 120 },
  { id: 'a-1000',     ic: '📚', nm: 'Four Figures',       ds: 'Answer 1,000 questions',          stat: 'answered', at: 1000, coins: 220 },
  { id: 'a-2500',     ic: '🏛️', nm: 'Institution',        ds: 'Answer 2,500 questions',          stat: 'answered', at: 2500, coins: 450 },
  { id: 'a-5000',     ic: '🗿', nm: 'Five Thousand',      ds: 'Answer 5,000 questions',          stat: 'answered', at: 5000, coins: 900 },

  /* ---------------------------------------------------------------- correct */
  { id: 'c-50',       ic: '✅', nm: 'Half a Hundred',     ds: 'Get 50 questions right',          stat: 'correct', at: 50, coins: 25 },
  { id: 'c-200',      ic: '✔️', nm: 'Two Hundred Right',  ds: 'Get 200 questions right',         stat: 'correct', at: 200, coins: 60 },
  { id: 'c-750',      ic: '🎖️', nm: 'Reliable',           ds: 'Get 750 questions right',         stat: 'correct', at: 750, coins: 160 },
  { id: 'c-2000',     ic: '🥇', nm: 'Two Thousand Right', ds: 'Get 2,000 questions right',       stat: 'correct', at: 2000, coins: 400 },

  /* ---------------------------------------------------------------- streaks */
  { id: 's-5',        ic: '🔥', nm: 'On a Roll',          ds: 'Get 5 in a row',                  stat: 'bestStreak', at: 5, coins: 20 },
  { id: 's-10',       ic: '🔥', nm: 'Double Digits',      ds: 'Get 10 in a row',                 stat: 'bestStreak', at: 10, coins: 35 },
  { id: 's-20',       ic: '🌋', nm: 'Twenty Straight',    ds: 'Get 20 in a row',                 stat: 'bestStreak', at: 20, coins: 80 },
  { id: 's-35',       ic: '☄️', nm: 'Unstoppable',        ds: 'Get 35 in a row',                 stat: 'bestStreak', at: 35, coins: 160 },
  { id: 's-50',       ic: '🌟', nm: 'Fifty Straight',     ds: 'Get 50 in a row',                 stat: 'bestStreak', at: 50, coins: 300 },

  /* ------------------------------------------------------------ day streaks */
  { id: 'd-3',        ic: '📆', nm: 'Three Days',         ds: 'Study 3 days in a row',           stat: 'bestDayStreak', at: 3, coins: 30 },
  { id: 'd-7',        ic: '🗓️', nm: 'Full Week',          ds: 'Study 7 days in a row',           stat: 'bestDayStreak', at: 7, coins: 70 },
  { id: 'd-14',       ic: '📅', nm: 'Fortnight',          ds: 'Study 14 days in a row',          stat: 'bestDayStreak', at: 14, coins: 150 },
  { id: 'd-30',       ic: '🎇', nm: 'A Whole Month',      ds: 'Study 30 days in a row',          stat: 'bestDayStreak', at: 30, coins: 350 },
  { id: 'd-100',      ic: '💠', nm: 'Hundred Days',       ds: 'Study 100 days in a row',         stat: 'bestDayStreak', at: 100, coins: 1000 },
  { id: 'd-active20', ic: '🧗', nm: 'Regular',            ds: 'Study on 20 separate days',       stat: 'daysActive', at: 20, coins: 90 },

  /* ----------------------------------------------------------------- levels */
  { id: 'l-5',        ic: '⬆️', nm: 'Level 5',            ds: 'Reach level 5',                   stat: 'level', at: 5, coins: 30 },
  { id: 'l-10',       ic: '⏫', nm: 'Level 10',           ds: 'Reach level 10',                  stat: 'level', at: 10, coins: 60 },
  { id: 'l-20',       ic: '🚀', nm: 'Level 20',           ds: 'Reach level 20',                  stat: 'level', at: 20, coins: 150 },
  { id: 'l-30',       ic: '🛰️', nm: 'Level 30',           ds: 'Reach level 30',                  stat: 'level', at: 30, coins: 300 },
  { id: 'l-45',       ic: '🌌', nm: 'Level 45',           ds: 'Reach level 45',                  stat: 'level', at: 45, coins: 600 },
  { id: 'l-60',       ic: '👑', nm: 'Band Six',           ds: 'Reach level 60',                  stat: 'level', at: 60, coins: 1500 },
  { id: 'l-asc1',     ic: '✦',  nm: 'Ascended',           ds: 'Ascend once',                     stat: 'ascensions', at: 1, coins: 800 },
  { id: 'l-asc3',     ic: '✧',  nm: 'Thrice Ascended',    ds: 'Ascend three times',              stat: 'ascensions', at: 3, coins: 2500 },

  /* ------------------------------------------------------------------- runs */
  { id: 'r-10',       ic: '🎮', nm: 'Ten Games',          ds: 'Finish 10 games',                 stat: 'runs', at: 10, coins: 30 },
  { id: 'r-50',       ic: '🕹️', nm: 'Fifty Games',        ds: 'Finish 50 games',                 stat: 'runs', at: 50, coins: 90 },
  { id: 'r-200',      ic: '🎯', nm: 'Two Hundred Games',  ds: 'Finish 200 games',                stat: 'runs', at: 200, coins: 260 },
  { id: 'p-1',        ic: '✨', nm: 'Flawless',           ds: 'Finish a run with no mistakes',   stat: 'perfect', at: 1, coins: 40 },
  { id: 'p-10',       ic: '💎', nm: 'Ten Flawless',       ds: 'Finish 10 perfect runs',          stat: 'perfect', at: 10, coins: 180 },
  { id: 'p-40',       ic: '🔷', nm: 'Forty Flawless',     ds: 'Finish 40 perfect runs',          stat: 'perfect', at: 40, coins: 500 },

  /* ------------------------------------------------------------- flashcards */
  { id: 'f-25',       ic: '🃏', nm: 'Deck Opened',        ds: 'Review 25 flashcards',            stat: 'cardsReviewed', at: 25, coins: 25 },
  { id: 'f-150',      ic: '🎴', nm: 'Card Sharp',         ds: 'Review 150 flashcards',           stat: 'cardsReviewed', at: 150, coins: 80 },
  { id: 'f-600',      ic: '📇', nm: 'Deck Master',        ds: 'Review 600 flashcards',           stat: 'cardsReviewed', at: 600, coins: 240 },
  { id: 'f-box5',     ic: '🗃️', nm: 'Filed Away',         ds: 'Get 20 cards into box 5',         stat: 'box5', at: 20, coins: 120 },
  { id: 'f-box5all',  ic: '🏆', nm: 'Whole Deck Learned', ds: 'Get 60 cards into box 5',         stat: 'box5', at: 60, coins: 400 },

  /* --------------------------------------------------------------- per mode */
  { id: 'm-crunch50', ic: '🔢', nm: 'Show Your Working',  ds: 'Solve 50 Crunch problems',        stat: 'crunchSolved', at: 50, coins: 70 },
  { id: 'm-crunch300', ic: '🧮', nm: 'Calculator Worn Out', ds: 'Solve 300 Crunch problems',     stat: 'crunchSolved', at: 300, coins: 260 },
  { id: 'm-chain20',  ic: '📏', nm: 'Dimensionally Sound', ds: 'Complete 20 unit chains',        stat: 'chainsDone', at: 20, coins: 70 },
  { id: 'm-chain100', ic: '🔗', nm: 'Everything Cancels', ds: 'Complete 100 unit chains',        stat: 'chainsDone', at: 100, coins: 220 },
  { id: 'm-path10',   ic: '🕸️', nm: 'Network Engineer',   ds: 'Solve 10 network puzzles',        stat: 'pathsSolved', at: 10, coins: 90 },
  { id: 'm-path50',   ic: '⏳', nm: 'Project Manager',    ds: 'Solve 50 network puzzles',        stat: 'pathsSolved', at: 50, coins: 280 },
  { id: 'm-lab10',    ic: '🔬', nm: 'Lab Coat',           ds: 'Pass 10 lab challenges',          stat: 'labsPassed', at: 10, coins: 90 },
  { id: 'm-lab40',    ic: '⚗️', nm: 'Head of Lab',        ds: 'Pass 40 lab challenges',          stat: 'labsPassed', at: 40, coins: 280 },
  { id: 'm-table50',  ic: '📋', nm: 'Table Literate',     ds: 'Make 50 annuity table lookups',   stat: 'tablesRead', at: 50, coins: 80 },
  { id: 'm-table250', ic: '🗂️', nm: 'Factor Finder',      ds: 'Make 250 annuity table lookups',  stat: 'tablesRead', at: 250, coins: 260 },
  { id: 'm-pairs10',  ic: '🎴', nm: 'Good Memory',        ds: 'Clear 10 Match Pairs boards',     stat: 'pairsCleared', at: 10, coins: 70 },

  /* ------------------------------------------------------------------ boss */
  { id: 'b-1',        ic: '💀', nm: 'First Blood',        ds: 'Beat your first boss',            stat: 'bossWins', at: 1, coins: 100 },
  { id: 'b-3',        ic: '☠️', nm: 'Three Down',         ds: 'Beat 3 bosses',                   stat: 'bossWins', at: 3, coins: 220 },
  { id: 'b-all',      ic: '🏅', nm: 'Ladder Cleared',     ds: 'Beat all 5 bosses',               stat: 'bossesBeaten', at: 5, coins: 600 },
  { id: 'b-final',    ic: '📄', nm: 'The Final Paper',    ds: 'Beat The Final Paper',
    fn: function (st, d) { return !!d.bosses.final; }, coins: 1200 },

  /* --------------------------------------------------------------- economy */
  { id: 'e-earn500',  ic: '💵', nm: 'Earning',            ds: 'Earn 500 Credits',                stat: 'coinsEarned', at: 500, coins: 30 },
  { id: 'e-earn5k',   ic: '💰', nm: 'Comfortable',        ds: 'Earn 5,000 Credits',              stat: 'coinsEarned', at: 5000, coins: 150 },
  { id: 'e-earn25k',  ic: '🏦', nm: 'Liquid',             ds: 'Earn 25,000 Credits',             stat: 'coinsEarned', at: 25000, coins: 500 },
  { id: 'e-themes3',  ic: '🎨', nm: 'Redecorating',       ds: 'Own 3 themes',                    stat: 'themes', at: 3, coins: 50 },
  { id: 'e-themesAll', ic: '🖼️', nm: 'Interior Designer', ds: 'Own all 10 themes',               stat: 'themes', at: 10, coins: 400 },
  { id: 'e-avatars5', ic: '🙂', nm: 'New Look',           ds: 'Own 5 avatars',                   stat: 'avatars', at: 5, coins: 60 },
  { id: 'e-avatarsAll', ic: '🎭', nm: 'Whole Cast',       ds: 'Own all 22 avatars',              stat: 'avatars', at: 22, coins: 500 },
  { id: 'e-crate5',   ic: '📦', nm: 'Unboxed',            ds: 'Open 5 supply crates',            stat: 'cratesOpened', at: 5, coins: 60 },
  { id: 'e-crate30',  ic: '🎁', nm: 'Crate Addict',       ds: 'Open 30 supply crates',           stat: 'cratesOpened', at: 30, coins: 240 },

  /* -------------------------------------------------------------- mastery */
  { id: 'mx-touch8',  ic: '🧭', nm: 'Broad Coverage',     ds: 'Answer a question in 8 topics',   stat: 'topicsTouched', at: 8, coins: 60 },
  { id: 'mx-touchAll', ic: '🗺️', nm: 'Whole Course',      ds: 'Answer a question in all 16 topics', stat: 'topicsTouched', at: 16, coins: 200 },
  { id: 'mx-strong4', ic: '📈', nm: 'Building Strength',  ds: 'Reach Strong in 4 topics',        stat: 'strong', at: 4, coins: 120 },
  { id: 'mx-master1', ic: '⭐', nm: 'Mastered One',       ds: 'Master a topic',                  stat: 'mastered', at: 1, coins: 100 },
  { id: 'mx-master5', ic: '🌠', nm: 'Mastered Five',      ds: 'Master 5 topics',                 stat: 'mastered', at: 5, coins: 350 },
  { id: 'mx-masterAll', ic: '🎓', nm: 'Course Mastered',  ds: 'Master all 16 topics',            stat: 'mastered', at: 16, coins: 2000 },
  { id: 'mx-acc80',   ic: '🎯', nm: 'Eighty Percent',     ds: 'Hold 80% accuracy over 200 questions',
    fn: function (st) { return st.answered >= 200 && st.accuracy >= 80; }, coins: 250 },
  { id: 'mx-acc90',   ic: '🏹', nm: 'Ninety Percent',     ds: 'Hold 90% accuracy over 500 questions',
    fn: function (st) { return st.answered >= 500 && st.accuracy >= 90; }, coins: 600 },

  /* ------------------------------------------------------------------ meta */
  { id: 'z-daily1',   ic: '📅', nm: 'Daily Done',         ds: 'Claim a daily challenge',         stat: 'dailiesDone', at: 1, coins: 30 },
  { id: 'z-daily15',  ic: '🗓️', nm: 'Fifteen Dailies',    ds: 'Claim 15 daily challenges',       stat: 'dailiesDone', at: 15, coins: 220 },
  { id: 'z-quest3',   ic: '📜', nm: 'Quest Runner',       ds: 'Complete 3 weekly quests',        stat: 'questsDone', at: 3, coins: 90 },
  { id: 'z-quest15',  ic: '🧾', nm: 'Fifteen Quests',     ds: 'Complete 15 weekly quests',       stat: 'questsDone', at: 15, coins: 300 },
  { id: 'z-arcade',   ic: '🕹️', nm: 'Time Wasted',        ds: 'Set a high score in all 3 arcade games', stat: 'hiscores', at: 3, coins: 80 },
  { id: 'z-nightmare', ic: '😈', nm: 'Nightmare Fuel',    ds: 'Finish a run on Nightmare difficulty',
    fn: function (st, d) { return d.difficulty === 'nightmare' && (d.stats.gamesFinished || 0) >= 1; }, coins: 200 }
]);
