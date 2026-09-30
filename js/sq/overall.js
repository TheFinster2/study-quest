/* The OVERALL layer: the whole-app level (fed by every XP earned in every subject),
   Stars ⭐, the global day streak, the global daily challenge, weekly quests and the
   app-wide achievements.

   Subjects never call this directly. They call their own State/UI, and the shared
   award() in ui.js forwards what it paid here — so every subject's XP reaches the
   overall level through the same gates it already passed. */
window.SQ = window.SQ || {};

SQ.Overall = (function () {
  const U = SQ.U, E = SQ.Economy;
  const D = () => SQ.Store.data;
  const save = () => SQ.Store.save();
  const emit = () => SQ.Store.emit();

  const MAX_LEVEL = E.OVERALL_MAX_LEVEL;
  const xpNeeded = E.overallXpNeeded;
  const ROMAN = ["I", "II", "III", "IV", "V"];

  function title(level) {
    const i = Math.min(E.OVERALL_TITLES.length - 1, Math.floor((level - 1) / 5));
    if (level >= MAX_LEVEL) return E.OVERALL_TITLES[E.OVERALL_TITLES.length - 1] + " ★";
    return E.OVERALL_TITLES[i] + " " + ROMAN[(level - 1) % 5];
  }

  function bumpStat(k, by) {
    const s = D().stats;
    s[k] = (s[k] || 0) + (by === undefined ? 1 : by);
  }

  /** Called by award() with XP already through every gate and multiplier. */
  function addXP(amount, subjectId) {
    const d = D(), o = d.overall;
    if (!amount || amount <= 0) return { levelsGained: 0, newLevel: o.level, stars: 0 };
    o.xp += amount;
    o.lifetimeXp = (o.lifetimeXp || 0) + amount;
    o.xpIntoLevel += amount;
    const day = U.dayKey();
    d.history[day] = (d.history[day] || 0) + amount;
    bumpStat("xp", amount);
    if (subjectId) {
      const dd = daily();
      dd.progress.xp = (dd.progress.xp || 0) + amount;
      dd.progress.subjects = dd.progress.subjects || {};
      dd.progress.subjects[subjectId] = true;
    }

    let gained = 0, stars = 0;
    while (o.level < MAX_LEVEL && o.xpIntoLevel >= xpNeeded(o.level)) {
      o.xpIntoLevel -= xpNeeded(o.level);
      o.level++;
      gained++;
      stars += E.STARS_PER_LEVEL * o.level;
    }
    if (o.level >= MAX_LEVEL) o.xpIntoLevel = Math.min(o.xpIntoLevel, xpNeeded(MAX_LEVEL));
    if (stars) addStars(stars, true);
    save();
    return { levelsGained: gained, newLevel: o.level, stars };
  }

  function addStars(n, quiet) {
    const d = D();
    d.stars = Math.max(0, Math.round(d.stars + n));
    if (d.stars > (d.stats.peakStars || 0)) d.stats.peakStars = d.stars;
    if (!quiet) emit(); else save();
    return d.stars;
  }

  function spendStars(n) {
    const d = D();
    if (d.stars < n) return false;
    d.stars -= n;
    d.stats.starsSpent = (d.stats.starsSpent || 0) + n;
    emit();
    return true;
  }

  /* ── day streak (one streak for the whole app) ───────────────── */
  function touchStreak() {
    const d = D(), st = d.streak;
    const today = U.dayKey();
    if (st.lastDay === today) return { changed: false, count: st.count };
    if (!st.lastDay) st.count = 1;
    else st.count = U.daysBetween(st.lastDay, today) === 1 ? st.count + 1 : 1;
    st.lastDay = today;
    st.longest = Math.max(st.longest || 0, st.count);
    const hour = new Date().getHours();
    if (hour >= 0 && hour < 4) d.stats.nightOwl = true;
    if (hour >= 5 && hour < 7) d.stats.earlyBird = true;
    emit();
    return { changed: true, count: st.count };
  }
  /** The per-run day-streak bonus every source app paid: min(5 + 3·days, 60). */
  const streakBonus = () => Math.min(5 + (D().streak.count || 0) * 3, 60);

  /* ── counters the weekly quests and daily read ─────────────────── */
  function recordAnswer(ok) {
    bumpStat("answered");
    if (ok) bumpStat("correct");
    const dd = daily();
    dd.progress.answered = (dd.progress.answered || 0) + 1;
    if (ok) dd.progress.correct = (dd.progress.correct || 0) + 1;
    save();
  }
  function noteRun(o) {
    bumpStat("runs");
    if (o && o.perfect) bumpStat("perfectRuns");
    const dd = daily();
    dd.progress.runs = (dd.progress.runs || 0) + 1;
    save();
  }
  const note = (k, by) => { bumpStat(k, by); save(); };

  /* ── the global daily challenge ───────────────────────────────
     Seeded from the date, so it is the same all day and for everyone. It asks for
     breadth where the subject dailies ask for depth. */
  const DAILY_KINDS = [
    { kind: "xp",       target: 900, desc: "Earn 900 XP in any subjects" },
    { kind: "runs",     target: 5,   desc: "Finish 5 runs" },
    { kind: "subjects", target: 2,   desc: "Study 2 different subjects" },
    { kind: "correct",  target: 60,  desc: "Get 60 answers right" },
    { kind: "answered", target: 90,  desc: "Answer 90 questions" }
  ];
  function dailySpec() {
    const day = U.dayKey();
    const rng = U.seededRandom(U.hash("studyquest-" + day));
    const k = DAILY_KINDS[Math.floor(rng() * DAILY_KINDS.length)];
    /* "Study 2 subjects" is impossible for a student enrolled in one. */
    const enrolled = (D().enrolled || []).length;
    const pick = (k.kind === "subjects" && enrolled < 2) ? DAILY_KINDS[0] : k;
    return Object.assign({ day }, pick, E.DAILY_REWARD);
  }
  function daily() {
    const d = D();
    const spec = dailySpec();
    if (!d.daily || d.daily.day !== spec.day) {
      d.daily = { day: spec.day, progress: {}, claimed: false, spec };
    } else d.daily.spec = spec;
    return d.daily;
  }
  function dailyProgress() {
    const dd = daily(), p = dd.progress, k = dd.spec.kind;
    const v = k === "subjects" ? Object.keys(p.subjects || {}).length : (p[k] || 0);
    return { done: Math.min(v, dd.spec.target), target: dd.spec.target,
             complete: v >= dd.spec.target, claimed: dd.claimed, spec: dd.spec };
  }
  function claimDaily() {
    const dp = dailyProgress();
    if (!dp.complete || dp.claimed) return false;
    D().daily.claimed = true;
    bumpStat("dailyClaims");
    addStars(dp.spec.stars, true);
    const r = addXP(dp.spec.xp);
    emit();
    return r;
  }

  /* ── weekly quests: a stat minus a snapshot taken at the rollover ── */
  const statFor = k => D().stats[k] || 0;
  function weekly() {
    const d = D();
    const wk = U.weekKey();
    if (!d.weekly || d.weekly.week !== wk) {
      const rng = U.seededRandom(U.hash("studyquest-week-" + wk));
      const picked = U.seededShuffle(E.WEEKLY_QUESTS, rng).slice(0, 3).map(q => q.id);
      const baseline = {};
      E.WEEKLY_QUESTS.forEach(q => (baseline[q.stat] = statFor(q.stat)));
      d.weekly = { week: wk, baseline, quests: picked, claimed: [] };
      save();
    }
    return d.weekly;
  }
  function weeklyQuests() {
    const w = weekly();
    return w.quests.map(id => {
      const q = E.WEEKLY_QUESTS.find(x => x.id === id);
      if (!q) return null;
      const base = (w.baseline && w.baseline[q.stat]) || 0;
      const done = Math.max(0, Math.min(q.target, statFor(q.stat) - base));
      return { quest: q, done, target: q.target, complete: done >= q.target, claimed: w.claimed.includes(id) };
    }).filter(Boolean);
  }
  function claimQuest(id) {
    const w = weekly();
    const e = weeklyQuests().find(x => x.quest.id === id);
    if (!e || !e.complete || e.claimed) return false;
    w.claimed.push(id);
    bumpStat("questsDone");
    addStars(e.quest.stars, true);
    const r = addXP(e.quest.xp);
    emit();
    return r;
  }

  /* ── app-wide achievements (pay Stars) ──────────────────────── */
  function achievementStats() {
    const d = D();
    const slots = d.subjects || {};
    const subjectLevels = {}, prestiges = {};
    Object.keys(slots).forEach(id => {
      subjectLevels[id] = slots[id].level || 1;
      prestiges[id] = slots[id].prestige || 0;
    });
    const studied = Object.keys(slots).filter(id => (slots[id].lifetimeXp || slots[id].xp || 0) > 0);
    return Object.assign({}, d.stats, {
      level: d.overall.level,
      lifetimeXp: d.overall.lifetimeXp,
      stars: d.stars,
      longestDayStreak: d.streak.longest || 0,
      enrolled: (d.enrolled || []).length,
      subjectsStudied: studied.length,
      subjectLevels, prestiges,
      totalPrestige: Object.values(prestiges).reduce((a, b) => a + b, 0),
      minEnrolledLevel: (d.enrolled || []).length
        ? Math.min.apply(null, d.enrolled.map(id => subjectLevels[id] || 1)) : 0,
      themesOwned: d.owned.themes.length,
      avatarsOwned: d.owned.avatars.length,
      skinsOwned: (d.owned.skins || []).length,
      migrated: Object.keys(d.migrated || {}).length,
      arcadeGames: Object.keys(d.arcade.played || {}).length
    });
  }
  function checkAchievements() {
    const list = (SQ.DATA && SQ.DATA.achievements) || [];
    const d = D(), s = achievementStats(), out = [];
    for (const a of list) {
      if (d.achievements[a.id]) continue;
      let ok = false;
      try { ok = !!a.check(s); } catch (e) { ok = false; }
      if (ok) {
        d.achievements[a.id] = Date.now();
        if (a.reward) addStars(a.reward, true);
        out.push(a);
      }
    }
    if (out.length) emit();
    return out;
  }

  return { MAX_LEVEL, xpNeeded, title, addXP, addStars, spendStars, touchStreak, streakBonus,
           recordAnswer, noteRun, note, daily, dailySpec, dailyProgress, claimDaily,
           weekly, weeklyQuests, claimQuest, achievementStats, checkAchievements };
})();
