/* Achievements. `check(s)` is given the flattened stats from
   State.achievementStats(); it must never throw (State catches, but a throwing
   check silently never unlocks). Rewards are granted RAW, bypassing the payout
   multiplier — see addendum §B1: they will drown an economy measurement if you
   forget, which is why tests/economy.js pre-marks them all as earned. */
window.PHYS = window.PHYS || {};
PHYS.DATA = PHYS.DATA || {};

PHYS.DATA.achievements = [
  /* ── first steps ─────────────────────────────────────────── */
  { id: "first-blood", icon: "🚀", name: "Ignition", reward: 40,
    desc: "Answer your first question", check: s => s.answered >= 1 },
  { id: "ten-right", icon: "✅", name: "Ten out of ten", reward: 60,
    desc: "Get 10 questions right", check: s => s.correct >= 10 },
  { id: "hundred", icon: "💯", name: "Century", reward: 150,
    desc: "Answer 100 questions", check: s => s.answered >= 100 },
  { id: "five-hundred", icon: "🧮", name: "Five hundred", reward: 400,
    desc: "Answer 500 questions", check: s => s.answered >= 500 },
  { id: "two-thousand", icon: "🏛️", name: "Two thousand", reward: 1200,
    desc: "Answer 2000 questions", check: s => s.answered >= 2000 },

  /* ── accuracy and streaks ────────────────────────────────── */
  { id: "streak-10", icon: "🔥", name: "On a roll", reward: 90,
    desc: "Reach a 10-question streak", check: s => s.bestStreak >= 10 },
  { id: "streak-25", icon: "☄️", name: "Unstoppable", reward: 260,
    desc: "Reach a 25-question streak", check: s => s.bestStreak >= 25 },
  { id: "streak-50", icon: "🌟", name: "Fifty in a row", reward: 700,
    desc: "Reach a 50-question streak", check: s => s.bestStreak >= 50 },
  { id: "perfect-1", icon: "✨", name: "Flawless", reward: 80,
    desc: "Finish a perfect run", check: s => s.perfectRuns >= 1 },
  { id: "perfect-10", icon: "💎", name: "Ten flawless runs", reward: 420,
    desc: "Finish 10 perfect runs", check: s => s.perfectRuns >= 10 },

  /* ── habit ───────────────────────────────────────────────── */
  { id: "streak-day-3", icon: "📅", name: "Three days running", reward: 70,
    desc: "Study three days in a row", check: s => s.longestDayStreak >= 3 },
  { id: "streak-day-7", icon: "🗓️", name: "A full week", reward: 200,
    desc: "Study seven days in a row", check: s => s.longestDayStreak >= 7 },
  { id: "streak-day-30", icon: "📆", name: "A month of physics", reward: 900,
    desc: "Study thirty days in a row", check: s => s.longestDayStreak >= 30 },
  { id: "night-owl", icon: "🦉", name: "Night owl", reward: 60,
    desc: "Study between midnight and 4 am", check: s => !!s.nightOwl },
  { id: "early-bird", icon: "🐦", name: "Early bird", reward: 60,
    desc: "Study between 5 and 7 am", check: s => !!s.earlyBird },

  /* ── per-mode ────────────────────────────────────────────── */
  { id: "calc-50", icon: "🔢", name: "Number cruncher", reward: 180,
    desc: "Solve 50 calculations", check: s => s.calcsCorrect >= 50 },
  { id: "calc-250", icon: "🧠", name: "Substitution machine", reward: 620,
    desc: "Solve 250 calculations", check: s => s.calcsCorrect >= 250 },
  { id: "fbd-25", icon: "🧲", name: "Forces in balance", reward: 170,
    desc: "Build 25 correct free-body diagrams", check: s => s.fbdSolved >= 25 },
  { id: "chain-20", icon: "🔗", name: "Chain reaction", reward: 220,
    desc: "Complete 20 derivation chains", check: s => s.chainsSolved >= 20 },
  { id: "chain-unique", icon: "🧭", name: "Every route", reward: 500,
    desc: "Solve 15 different derivation chains", check: s => s.chainsSolvedUnique >= 15 },
  { id: "graph-60", icon: "📈", name: "Gradient reader", reward: 200,
    desc: "Read 60 motion graphs", check: s => s.graphsRead >= 60 },
  { id: "units-200", icon: "📐", name: "Dimensionally sound", reward: 240,
    desc: "Fill 200 unit-grid cells correctly", check: s => s.unitCells >= 200 },
  { id: "unitgrid-perfect", icon: "🎯", name: "Clean grid", reward: 200,
    desc: "Fill a whole unit grid with no mistakes", check: s => s.perfectUnitGrid >= 1 },
  { id: "bench-15", icon: "🔌", name: "Bench technician", reward: 230,
    desc: "Finish 15 circuit benches", check: s => s.benchesSolved >= 15 },
  { id: "formula-100", icon: "🧩", name: "Formula fluent", reward: 260,
    desc: "Match 100 formula triples", check: s => s.formulaMatched >= 100 },
  { id: "survival-25", icon: "💀", name: "Last stand", reward: 300,
    desc: "Reach 25 questions in Survival", check: s => s.survivalBest >= 25 },
  { id: "all-modes", icon: "🎮", name: "Full tour", reward: 320,
    desc: "Play every study mode at least once", check: s => s.modesPlayedCount >= 9 },

  /* ── bosses ──────────────────────────────────────────────── */
  { id: "boss-1", icon: "⚔️", name: "First blood", reward: 250,
    desc: "Defeat an Exam Boss", check: s => s.bossWins >= 1 },
  { id: "boss-all", icon: "👑", name: "Boss sweep", reward: 900,
    desc: "Defeat all five Exam Bosses", check: s => s.bossesBeaten >= 5 },
  { id: "boss-flawless", icon: "🛡️", name: "Untouched", reward: 500,
    desc: "Defeat a boss without a single wrong answer", check: s => s.flawlessBoss >= 1 },
  { id: "boss-clutch", icon: "❤️‍🔥", name: "On the last breath", reward: 350,
    desc: "Win a boss fight with 20 HP or less", check: s => s.clutchWins >= 1 },
  { id: "boss-hard", icon: "🥷", name: "The hard way", reward: 450,
    desc: "Win a boss fight on Hard", check: s => s.hardWins >= 1 },
  { id: "boss-nightmare", icon: "😈", name: "Nightmare fuel", reward: 800,
    desc: "Win a boss fight on Nightmare", check: s => s.nightmareWins >= 1 },

  /* ── mastery ─────────────────────────────────────────────── */
  { id: "master-1", icon: "🎓", name: "One down", reward: 260,
    desc: "Reach 80% mastery in any module",
    check: s => ["M1","M2","M3","M4","M5","M6","M7","M8"].some(m => s.masteryOf(m) >= 80) },
  { id: "master-y12", icon: "🏅", name: "Year 12 secured", reward: 800,
    desc: "Reach 70% mastery in all four Year 12 modules",
    check: s => ["M5","M6","M7","M8"].every(m => s.masteryOf(m) >= 70) },
  { id: "master-all", icon: "🧿", name: "The whole course", reward: 2000,
    desc: "Reach 70% mastery in all eight modules",
    check: s => ["M1","M2","M3","M4","M5","M6","M7","M8"].every(m => s.masteryOf(m) >= 70) },

  /* ── flashcards ──────────────────────────────────────────── */
  { id: "cards-25", icon: "🃏", name: "Deck started", reward: 130,
    desc: "Master 25 flashcards", check: s => s.cardsMastered >= 25 },
  { id: "cards-100", icon: "🎴", name: "Deck builder", reward: 480,
    desc: "Master 100 flashcards", check: s => s.cardsMastered >= 100 },
  { id: "cards-250", icon: "📚", name: "Total recall", reward: 1100,
    desc: "Master 250 flashcards", check: s => s.cardsMastered >= 250 },

  /* ── rehabilitation ─────────────────────────────────────── */
  { id: "rehab-25", icon: "🩹", name: "Learning from it", reward: 200,
    desc: "Fix 25 questions you previously got wrong", check: s => s.mistakesFixed >= 25 },
  { id: "rehab-100", icon: "🧗", name: "No weak spots", reward: 620,
    desc: "Fix 100 questions you previously got wrong", check: s => s.mistakesFixed >= 100 },

  /* ── levels and economy ─────────────────────────────────── */
  { id: "level-10", icon: "🔟", name: "Level ten", reward: 140,
    desc: "Reach level 10", check: s => s.level >= 10 },
  { id: "level-25", icon: "🎖️", name: "Level twenty-five", reward: 500,
    desc: "Reach level 25", check: s => s.level >= 25 },
  { id: "level-60", icon: "🔱", name: "Newton's equal", reward: 2500,
    desc: "Reach level 60", check: s => s.level >= 60 },
  { id: "prestige-1", icon: "♾️", name: "Ascended", reward: 1500,
    desc: "Ascend once", check: s => s.prestige >= 1 },
  { id: "rich", icon: "🪙", name: "Well funded", reward: 200,
    desc: "Hold 5000 Joules at once", check: s => s.peakCoins >= 5000 },
  { id: "collector", icon: "🎨", name: "Collector", reward: 300,
    desc: "Own five themes", check: s => s.themesOwned >= 5 },
  { id: "quests-10", icon: "📜", name: "Quest runner", reward: 380,
    desc: "Complete 10 weekly quests", check: s => s.questsDone >= 10 }
];
