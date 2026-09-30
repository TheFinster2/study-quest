/* Every tuned number of the GENERAL economy in one place. The subject economies
   (their coin rates, subject-shop prices, level curves) stay where the source apps
   tuned them; this file only governs Stars ⭐, the overall level and the arcade.

   The anchor: an honest 1000-XP run in any subject pays about 150 ⭐ on top of its
   subject coins. The arcade and power-up prices below were converted from the source
   apps' prices at that rate, so a five-minute ticket still costs roughly what it cost
   before — about a third of a good run. */
window.SQ = window.SQ || {};

SQ.Economy = {
  /** Stars per XP earned in any subject. Applied inside award(), after every gate. */
  STAR_RATE: 0.15,
  /** Paid on each overall level-up: STARS_PER_LEVEL × the new level. */
  STARS_PER_LEVEL: 20,
  START_STARS: 150,

  /** The Exchange: subject coins → Stars. Deliberately lossy (it is a way to stop
      coins being stranded in a subject you have finished with, not a better earning
      path), and it can never run the other way. */
  EXCHANGE_RATE: 5,        // coins per star
  EXCHANGE_MIN: 50,        // coins

  OVERALL_MAX_LEVEL: 100,
  /** Level n → n+1 costs round(70·n^1.6). Level 20 ≈ 57k XP, level 100 ≈ 4.2M:
      three subjects taken most of the way over an HSC year. */
  overallXpNeeded: n => Math.round(70 * Math.pow(n, 1.6)),

  /** The whole-multiplier ceiling (difficulty × prestige × boosts), from the
      Biology/Economics reward path. Multipliers only ever multiply. */
  MAX_MULTIPLIER: 4,

  /* ── the arcade ────────────────────────────────────────────── */
  ARCADE_UNLOCK_LEVEL: 3,          // overall level
  TICKETS: [
    { id: "t5",  mins: 5,  price: 60,   name: "5 minutes" },
    { id: "t15", mins: 15, price: 160,  name: "15 minutes" },
    { id: "t40", mins: 40, price: 380,  name: "40 minutes" },
    { id: "day", allDay: true, price: 1200, name: "All-day pass", level: 15,
      desc: "Unlimited arcade until midnight tonight." }
  ],

  /* ── power-ups (general, usable in any subject) ───────────── */
  POWERUPS: [
    { id: "fifty",   icon: "✂️", name: "50 / 50",      price: 28,  desc: "Remove two wrong options.", level: 1 },
    { id: "skip",    icon: "⏭️", name: "Skip",         price: 22,  desc: "Pass a question with no penalty.", level: 1 },
    { id: "freeze",  icon: "🧊", name: "Time Freeze",  price: 38,  desc: "Stop the clock for 15 seconds.", level: 2 },
    { id: "shield",  icon: "🛡️", name: "Shield",       price: 52,  desc: "The next wrong answer keeps your streak / blocks a boss hit.", level: 3 },
    { id: "insight", icon: "💡", name: "Insight",      price: 64,  desc: "A topic-and-misconception hint for one question.", level: 5 },
    { id: "hint",    icon: "🔎", name: "Hint",         price: 48,  desc: "English: a nudge towards the technique or effect.", level: 4 },
    { id: "reread",  icon: "📖", name: "Second Read",  price: 42,  desc: "English: extra reading time on one passage.", level: 4 },
    { id: "double",  icon: "✨", name: "Double XP",    price: 80,  desc: "Double the XP of your next run.", level: 6 },
    { id: "revive",  icon: "❤️‍🔥", name: "Revive",    price: 150, desc: "Survive one knockout in a boss fight or Survival.", level: 10 }
  ],

  CRATES: [
    { id: "crate1", icon: "📦", name: "Satchel",   price: 120, rolls: 3, level: 1,
      desc: "Three random power-ups." },
    { id: "crate2", icon: "🎁", name: "Locker",    price: 300, rolls: 8, level: 8, better: true,
      desc: "Eight power-ups, weighted towards the good ones." },
    { id: "crate3", icon: "🧰", name: "The Vault", price: 800, rolls: 14, level: 20, better: true, cosmetic: true,
      desc: "Fourteen power-ups and a chance at a rare avatar." }
  ],

  /* ── the global daily + weekly ─────────────────────────────── */
  DAILY_REWARD: { stars: 40, xp: 200 },
  WEEKLY_QUESTS: [
    { id: "w_xp",       stat: "xp",        target: 8000, stars: 220, xp: 1500, icon: "📈", name: "Big week",        desc: "Earn 8,000 XP in any subjects" },
    { id: "w_answer",   stat: "answered",  target: 400,  stars: 180, xp: 1200, icon: "📝", name: "Question machine", desc: "Answer 400 questions" },
    { id: "w_correct",  stat: "correct",   target: 260,  stars: 200, xp: 1400, icon: "🎯", name: "Right, right, right", desc: "Get 260 answers right" },
    { id: "w_runs",     stat: "runs",      target: 25,   stars: 180, xp: 1200, icon: "🏃", name: "Keep moving",     desc: "Finish 25 runs" },
    { id: "w_dailies",  stat: "subjectDailies", target: 5, stars: 240, xp: 1600, icon: "📅", name: "Every day counts", desc: "Claim 5 subject daily challenges" },
    { id: "w_bosses",   stat: "bossWins",  target: 2,    stars: 260, xp: 1800, icon: "⚔️", name: "Boss rush",       desc: "Defeat 2 bosses in any subjects" },
    { id: "w_levels",   stat: "subjectLevels", target: 4, stars: 200, xp: 1400, icon: "⬆️", name: "Level up",       desc: "Gain 4 subject levels" },
    { id: "w_cards",    stat: "cardsReviewed", target: 120, stars: 200, xp: 1300, icon: "🗂️", name: "Card shark",    desc: "Review 120 flashcards" },
    { id: "w_perfect",  stat: "perfectRuns", target: 4,  stars: 240, xp: 1600, icon: "✨", name: "Flawless",        desc: "Finish 4 perfect runs" }
  ],

  /** Overall level titles — 20 names, each spanning five levels (I–V). */
  OVERALL_TITLES: [
    "Newcomer", "Note-taker", "Highlighter", "Crammer", "Question Hunter",
    "Study Buddy", "Revision Machine", "Syllabus Scout", "Past-Paper Pro", "Trial Survivor",
    "Band 5 Contender", "Band 5", "Band 6 Contender", "Band 6", "Top Achiever",
    "Distinguished", "All-Rounder", "Honour Roll", "Dux Contender", "Dux"
  ]
};
