/* App-wide achievements (pay Stars ⭐). Checked by SQ.Overall.checkAchievements()
   against SQ.Overall.achievementStats(). Each subject keeps its own set, paid in its
   coins, on its own Progress screen; these reward the WHOLE — breadth, the overall
   level, habits — so they never duplicate a subject's. */
window.SQ = window.SQ || {};
SQ.DATA = SQ.DATA || {};

(function () {
  const lvl = (n, r) => ({ id: "ov_lv" + n, group: "Overall level", icon: n >= 50 ? "👑" : n >= 20 ? "🏅" : "★",
    name: "Overall level " + n, desc: "Reach overall level " + n + ".", reward: r, check: s => s.level >= n });
  const streak = (n, r, icon) => ({ id: "ov_streak" + n, group: "Habits", icon, name: n + "-day streak",
    desc: "Study on " + n + " days in a row (any subject counts).", reward: r, check: s => s.longestDayStreak >= n });
  const every = (n, r, icon) => ({ id: "ov_all" + n, group: "Breadth", icon, name: "All-rounder " + n,
    desc: "Get every subject you study to level " + n + ".", reward: r, check: s => s.enrolled >= 2 && s.minEnrolledLevel >= n });

  SQ.DATA.achievements = [
    lvl(2, 20), lvl(5, 40), lvl(10, 80), lvl(20, 150), lvl(30, 250), lvl(40, 400), lvl(50, 600),
    lvl(75, 1000), lvl(100, 2500),

    { id: "ov_first", group: "Getting started", icon: "👣", name: "First steps", desc: "Answer your first question.", reward: 10, check: s => s.answered >= 1 },
    { id: "ov_enrol", group: "Getting started", icon: "📚", name: "Timetable", desc: "Choose the subjects you study.", reward: 15, check: s => s.enrolled >= 1 },
    { id: "ov_runs10", group: "Getting started", icon: "🏃", name: "Warming up", desc: "Finish 10 runs.", reward: 30, check: s => s.runs >= 10 },
    { id: "ov_migrate", group: "Getting started", icon: "📦", name: "Moving in", desc: "Bring progress across from one of the old apps.", reward: 50, check: s => s.migrated >= 1 },

    { id: "ov_two", group: "Breadth", icon: "✌️", name: "Double major", desc: "Earn XP in two different subjects.", reward: 30, check: s => s.subjectsStudied >= 2 },
    { id: "ov_four", group: "Breadth", icon: "🍀", name: "Four corners", desc: "Earn XP in four different subjects.", reward: 80, check: s => s.subjectsStudied >= 4 },
    { id: "ov_seven", group: "Breadth", icon: "🌈", name: "Tourist", desc: "Try all seven subjects.", reward: 120, check: s => s.subjectsStudied >= 7 },
    every(5, 60, "⚖️"), every(15, 180, "🎯"), every(30, 400, "🏛️"), every(60, 1500, "🌟"),
    { id: "ov_asc", group: "Breadth", icon: "🔱", name: "Ascended", desc: "Ascend (prestige) in any subject.", reward: 300, check: s => s.totalPrestige >= 1 },
    { id: "ov_asc3", group: "Breadth", icon: "♾️", name: "Thrice ascended", desc: "Ascend three times in total, across any subjects.", reward: 900, check: s => s.totalPrestige >= 3 },

    { id: "ov_ans500", group: "Volume", icon: "📝", name: "Five hundred", desc: "Answer 500 questions across all subjects.", reward: 60, check: s => s.answered >= 500 },
    { id: "ov_ans2500", group: "Volume", icon: "📜", name: "Scroll", desc: "Answer 2,500 questions.", reward: 200, check: s => s.answered >= 2500 },
    { id: "ov_ans10k", group: "Volume", icon: "🗻", name: "Ten thousand", desc: "Answer 10,000 questions.", reward: 800, check: s => s.answered >= 10000 },
    { id: "ov_xp100k", group: "Volume", icon: "💯", name: "Six figures", desc: "Earn 100,000 XP in total.", reward: 250, check: s => s.lifetimeXp >= 100000 },
    { id: "ov_xp1m", group: "Volume", icon: "🎆", name: "Millionaire", desc: "Earn 1,000,000 XP in total.", reward: 1500, check: s => s.lifetimeXp >= 1000000 },
    { id: "ov_perfect10", group: "Volume", icon: "✨", name: "Clean sheets", desc: "Finish 10 perfect runs.", reward: 120, check: s => (s.perfectRuns || 0) >= 10 },
    { id: "ov_boss5", group: "Volume", icon: "⚔️", name: "Boss hunter", desc: "Defeat 5 bosses across your subjects.", reward: 150, check: s => (s.bossWins || 0) >= 5 },
    { id: "ov_boss25", group: "Volume", icon: "🐉", name: "Slayer", desc: "Defeat 25 bosses.", reward: 500, check: s => (s.bossWins || 0) >= 25 },
    { id: "ov_cards500", group: "Volume", icon: "🗂️", name: "Card shark", desc: "Review 500 flashcards across subjects.", reward: 150, check: s => (s.cardsReviewed || 0) >= 500 },

    streak(3, 20, "🔥"), streak(7, 60, "🔥"), streak(14, 140, "🌋"), streak(30, 350, "☄️"), streak(100, 1500, "🌞"),
    { id: "ov_daily10", group: "Habits", icon: "📅", name: "Dailies", desc: "Claim 10 of the app's daily challenges.", reward: 100, check: s => (s.dailyClaims || 0) >= 10 },
    { id: "ov_sdaily20", group: "Habits", icon: "🗓️", name: "Every subject, every day", desc: "Claim 20 subject daily challenges.", reward: 150, check: s => (s.subjectDailies || 0) >= 20 },
    { id: "ov_quest10", group: "Habits", icon: "🧭", name: "Questing", desc: "Complete 10 weekly quests.", reward: 200, check: s => (s.questsDone || 0) >= 10 },
    { id: "ov_owl", group: "Habits", icon: "🦉", name: "Night owl", desc: "Study between midnight and 4 am. (Then sleep.)", reward: 15, check: s => !!s.nightOwl },
    { id: "ov_lark", group: "Habits", icon: "🐦", name: "Early bird", desc: "Study between 5 and 7 am.", reward: 15, check: s => !!s.earlyBird },

    { id: "ov_stars1k", group: "Collector", icon: "⭐", name: "Starry", desc: "Hold 1,000 Stars at once.", reward: 50, check: s => (s.peakStars || 0) >= 1000 },
    { id: "ov_buy10", group: "Collector", icon: "🛍️", name: "Regular", desc: "Make 10 purchases in any shop.", reward: 40, check: s => (s.purchases || 0) >= 10 },
    { id: "ov_themes5", group: "Collector", icon: "🎨", name: "Wardrobe", desc: "Own 5 themes.", reward: 60, check: s => s.themesOwned >= 5 },
    { id: "ov_themes15", group: "Collector", icon: "🖼️", name: "Gallery", desc: "Own 15 themes.", reward: 200, check: s => s.themesOwned >= 15 },
    { id: "ov_avatars10", group: "Collector", icon: "🎭", name: "Masquerade", desc: "Own 10 avatars.", reward: 80, check: s => s.avatarsOwned >= 10 },
    { id: "ov_crates5", group: "Collector", icon: "📦", name: "Unboxing", desc: "Open 5 crates.", reward: 50, check: s => (s.cratesOpened || 0) >= 5 },
    { id: "ov_skin", group: "Collector", icon: "🕹️", name: "New look", desc: "Buy an arcade skin in a subject shop.", reward: 40, check: s => s.skinsOwned >= 1 },
    { id: "ov_exchange", group: "Collector", icon: "💱", name: "Bureau de change", desc: "Use the Exchange in a subject shop.", reward: 20, check: s => (s.exchanged || 0) > 0 }
  ];
})();
