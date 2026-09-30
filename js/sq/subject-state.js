/* The subject-state factory.

   Five of the seven source apps (Chemistry, Physics, both Maths, English) grew from
   one reference app and share an almost identical State API; Biology and Economics
   share a second one. This factory implements the first API — the richer one: levels
   with prestige, four difficulties, daily + weekly, Leitner cards with graded review
   and leech detection, mistakes, bookmarks, achievements — over a slot in the one
   save file, so a ported subject keeps calling `S.addXP`, `S.recordAnswer`,
   `S.reviewCard` exactly as it did.

   What moved OUT of the subject and into the app:
     · profile, power-up inventory, the day streak, sound/motion   → SQ.Store (linked)
     · owned themes / avatars                                     → the global wardrobe
   What stays PER SUBJECT: xp, level, prestige, the subject's coins, stats, mastery,
   cards, mistakes, achievements, daily, weekly, difficulty, coverage, subject theme.

   Usage (subjects/<id>/core/state.js):
     CHEM.State = SQ.SubjectState.create("chem", {
       defaults: () => ({ stats: {...}, modules: {}, ... }),   // subject-only fields
       levelTitles: [...60 names], xpCurve: n => Math.round(115 * n ** 1.5),
       dailyModes: { rapid: 14, drill: 12, ... }, questPool: [...],
       achievements: () => CHEM.DATA.achievements,
       achievementStats: (d, base) => Object.assign(base, {...}),
       cards: () => CHEM.DATA.flashcards,       // for dueCards / leeches
     });
     Object.assign(CHEM.State, { ...anything subject-specific });
*/
window.SQ = window.SQ || {};

SQ.SubjectState = (function () {
  const U = SQ.U;

  /* Four difficulties everywhere, from Physics — the only app that had a gentler
     tier than Standard, which matters to a student returning to a subject they are
     weak in. The multipliers above Standard are the reference app's (Hard ×1.45,
     Nightmare ×2.1). `time` scales thinking time only; English's lesson was that the
     clock must never cut the time it takes to READ (see UI.timeBudget). */
  const DIFFICULTIES = [
    { id: "gentle",    name: "Gentle",    icon: "🌱", xp: 0.85, time: 1.35, boss: 0.75, bans: [],
      desc: "More time, easier draws, lighter boss hits. For rebuilding a weak topic." },
    { id: "standard",  name: "Standard",  icon: "⚖️", xp: 1.0,  time: 1.0,  boss: 1.0,  bans: [],
      desc: "The balance the app was tuned around." },
    { id: "hard",      name: "Hard",      icon: "🔥", xp: 1.45, time: 0.75, boss: 1.4,  bans: [],
      desc: "25% less time, bosses hit 40% harder. ×1.45 XP." },
    { id: "nightmare", name: "Nightmare", icon: "💀", xp: 2.1,  time: 0.55, boss: 1.9,  bans: ["fifty", "skip"],
      desc: "45% less time, brutal bosses, no 50/50 or Skip. ×2.1 XP." }
  ];

  const MASTERY_TIERS = [
    { at: 0,  name: "Unranked", icon: "▫️", cls: "m0" },
    { at: 25, name: "Bronze",   icon: "🥉", cls: "m1" },
    { at: 45, name: "Silver",   icon: "🥈", cls: "m2" },
    { at: 65, name: "Gold",     icon: "🥇", cls: "m3" },
    { at: 80, name: "Platinum", icon: "💠", cls: "m4" },
    { at: 92, name: "Diamond",  icon: "💎", cls: "m5" }
  ];

  /* Leitner. Box n is due BOX_DAYS[n] days after review. */
  const BOX_DAYS = [0, 1, 2, 4, 8, 16];
  /* Four lapses is Anki's leech line, and English's: a card you keep missing is one
     you are not learning the way you are currently trying to learn it. */
  const LEECH_LAPSES = 4;

  function baseDefaults(startCoins) {
    return {
      v: 1,
      createdAt: Date.now(),
      xp: 0, level: 1, xpIntoLevel: 0, coins: startCoins, prestige: 0, lifetimeXp: 0,
      stats: { answered: 0, correct: 0, bestStreak: 0, perfectRuns: 0, bossWins: 0,
               flawlessBoss: 0, clutchWins: 0, mistakesFixed: 0, survivalBest: 0,
               hardWins: 0, nightmareWins: 0, questsDone: 0, dailiesDone: 0,
               cardsReviewed: 0, peakCoins: startCoins, timePlayed: 0 },
      modules: {}, topics: {}, modesPlayed: {}, bossesBeaten: {},
      srs: {}, mistakes: [], bookmarks: [], achievements: {}, history: {}, scores: {},
      settings: { difficulty: "standard", theme: null, hidden: {} },
      daily: { day: null, progress: 0, claimed: false, spec: null },
      weekly: { week: null, baseline: null, quests: [], claimed: [] },
      lastPlayed: null
    };
  }

  function create(id, cfg) {
    const c = cfg || {};
    const meta = SQ.Subjects.get(id) || { name: id, currency: { name: "coins", icon: "🪙" } };
    const START = c.startCoins === undefined ? 100 : c.startCoins;
    const MAX_LEVEL = c.maxLevel || 60;
    const xpNeeded = c.xpCurve || (level => Math.round(115 * Math.pow(level, 1.5)));
    const titles = c.levelTitles || [];
    const DIFFS = c.difficulties || DIFFICULTIES;
    const TIERS = c.masteryTiers || MASTERY_TIERS;
    const QUEST_POOL = c.questPool || [];
    const listeners = new Set();

    const defaults = () => U.deepMerge(baseDefaults(START), c.defaults ? c.defaults() : {});
    let data = null;
    function load() { data = SQ.Store.slot(id, defaults); if (c.migrate) c.migrate(data); return data; }
    load();

    const save = () => SQ.Store.save();
    const flush = () => SQ.Store.flush();
    function emit() { listeners.forEach(fn => { try { fn(data); } catch (e) { console.warn(e); } }); SQ.Store.emit(); }
    function onChange(fn) { listeners.add(fn); return () => listeners.delete(fn); }

    /* ── levelling ─────────────────────────────────────────── */
    function levelTitle(level) {
      if (!titles.length) return "Level " + level;
      return titles[Math.min(level - 1, titles.length - 1)];
    }
    function difficulty() {
      const k = data.settings.difficulty || "standard";
      return DIFFS.find(d => d.id === k) || DIFFS.find(d => d.id === "standard") || DIFFS[0];
    }
    function setDifficulty(k) {
      if (!DIFFS.find(d => d.id === k)) return false;
      data.settings.difficulty = k; emit(); return true;
    }
    /** Difficulty × the permanent prestige bonus (+12% per Ascension). */
    const xpMultiplier = () => difficulty().xp * (1 + (data.prestige || 0) * 0.12);
    const canPrestige = () => data.level >= MAX_LEVEL;

    function doPrestige() {
      if (!canPrestige()) return false;
      data.prestige = (data.prestige || 0) + 1;
      data.level = 1; data.xpIntoLevel = 0; data.xp = 0;
      addCoins(2500, true);
      grantPowerup(c.prestigePowerup || "double", 3);
      if (SQ.Overall) SQ.Overall.note("prestiges");
      emit();
      return true;
    }

    function masteryTier(pct) {
      let out = TIERS[0];
      for (const t of TIERS) if (pct >= t.at) out = t;
      return out;
    }

    /** XP already multiplied by the caller (award()). */
    function addXP(amount) {
      if (!amount || amount <= 0) return { levelsGained: 0, newLevel: data.level };
      data.xp += amount;
      data.lifetimeXp = (data.lifetimeXp || 0) + amount;
      data.xpIntoLevel += amount;
      const day = U.dayKey();
      data.history[day] = (data.history[day] || 0) + amount;
      data.lastPlayed = Date.now();
      let gained = 0, coins = 0;
      while (data.level < MAX_LEVEL && data.xpIntoLevel >= xpNeeded(data.level)) {
        data.xpIntoLevel -= xpNeeded(data.level);
        data.level++;
        gained++;
        coins += 30 * data.level;
      }
      if (coins) addCoins(coins, true);
      if (gained && SQ.Overall) SQ.Overall.note("subjectLevels", gained);
      if (data.level >= MAX_LEVEL) data.xpIntoLevel = Math.min(data.xpIntoLevel, xpNeeded(MAX_LEVEL));
      emit();
      return { levelsGained: gained, newLevel: data.level, levelCoins: coins };
    }

    function addCoins(n, quiet) {
      data.coins = Math.max(0, Math.round(data.coins + n));
      if (data.coins > (data.stats.peakCoins || 0)) data.stats.peakCoins = data.coins;
      if (!quiet) emit(); else save();
      return data.coins;
    }
    function spendCoins(n) {
      if (data.coins < n) return false;
      data.coins -= n;
      emit();
      return true;
    }

    /* ── the day streak is the app's ─────────────────────────── */
    const touchStreak = () => SQ.Overall.touchStreak();
    const streakBonus = () => SQ.Overall.streakBonus();

    /* ── answers ─────────────────────────────────────────────── */
    /**
     * recordAnswer(mod, ok, questionId, topic?, meta?)
     * `mod` is whatever unit the subject tracks mastery on (module, topic code, text);
     * `topic` is an optional second axis (skill, sub-topic). `meta` is merged into the
     * mistake entry so a subject can remember e.g. a generator template.
     */
    function recordAnswer(mod, ok, questionId, topic, meta) {
      data.stats.answered++;
      if (ok) data.stats.correct++;
      if (mod) {
        const m = data.modules[mod] || (data.modules[mod] = { seen: 0, correct: 0 });
        m.seen++; if (ok) m.correct++;
      }
      if (topic && typeof topic === "string") {
        const t = data.topics[topic] || (data.topics[topic] = { seen: 0, correct: 0 });
        t.seen++; if (ok) t.correct++;
      }
      if (questionId) {
        const idx = data.mistakes.findIndex(x => x.id === questionId);
        if (ok) {
          if (idx >= 0) { data.mistakes.splice(idx, 1); data.stats.mistakesFixed++; }
        } else if (idx >= 0) {
          data.mistakes[idx].misses++;
          data.mistakes[idx].ts = Date.now();
        } else {
          data.mistakes.unshift(Object.assign({ id: questionId, mod, topic: topic || null, misses: 1, ts: Date.now() }, meta || {}));
          if (data.mistakes.length > 150) data.mistakes.pop();
        }
      }
      if (SQ.Overall) SQ.Overall.recordAnswer(ok);
      save();
    }
    /** A second-axis-only record, for typed/marked answers that are not a right/wrong. */
    function recordSkill(topic, ok) {
      if (!topic) return;
      const t = data.topics[topic] || (data.topics[topic] = { seen: 0, correct: 0 });
      t.seen++; if (ok) t.correct++;
      save();
    }
    function noteStreak(n) { if (n > (data.stats.bestStreak || 0)) { data.stats.bestStreak = n; save(); } }
    function bump(k, by) { data.stats[k] = (data.stats[k] || 0) + (by === undefined ? 1 : by); save(); }
    function markMode(modeId) { data.modesPlayed[modeId] = (data.modesPlayed[modeId] || 0) + 1; save(); }
    function recordScore(modeId, score) {
      const prev = data.scores[modeId];
      const best = prev === undefined || score > prev;
      if (best) { data.scores[modeId] = score; save(); }
      return best;
    }
    function markBoss(bossId, info) {
      const first = !data.bossesBeaten[bossId];
      data.bossesBeaten[bossId] = data.bossesBeaten[bossId] || Date.now();
      data.stats.bossWins = (data.stats.bossWins || 0) + 1;
      if (info && info.flawless) data.stats.flawlessBoss = (data.stats.flawlessBoss || 0) + 1;
      if (SQ.Overall) SQ.Overall.note("bossWins");
      save();
      return first;
    }

    function toggleBookmark(qid) {
      const i = data.bookmarks.indexOf(qid);
      if (i >= 0) data.bookmarks.splice(i, 1); else { data.bookmarks.unshift(qid); if (data.bookmarks.length > 200) data.bookmarks.pop(); }
      save();
      return i < 0;
    }
    const isBookmarked = qid => data.bookmarks.indexOf(qid) >= 0;

    /* ── mastery: confidence-weighted, so three right is not "mastered" ── */
    function weighted(rec) {
      if (!rec || !rec.seen) return 0;
      return Math.round((rec.correct / rec.seen) * Math.min(1, rec.seen / 25) * 100);
    }
    const mastery = mod => weighted(data.modules[mod]);
    const topicMastery = t => weighted(data.topics[t]);
    const overallAccuracy = () => U.pct(data.stats.correct, data.stats.answered);
    function weakTopics(n, minSeen) {
      return Object.keys(data.topics)
        .map(k => ({ topic: k, seen: data.topics[k].seen, pct: U.pct(data.topics[k].correct, data.topics[k].seen) }))
        .filter(x => x.seen >= (minSeen || 4))
        .sort((a, b) => a.pct - b.pct)
        .slice(0, n || 3);
    }

    /* ── power-ups are the app's (shared inventory) ───────────── */
    function usePowerup(pid) {
      const inv = SQ.Store.data.inventory;
      if (difficulty().bans.indexOf(pid) >= 0) return false;
      if ((inv[pid] || 0) <= 0) return false;
      inv[pid]--;
      emit();
      return true;
    }
    function grantPowerup(pid, n) {
      const inv = SQ.Store.data.inventory;
      inv[pid] = (inv[pid] || 0) + (n || 1);
      emit();
    }
    const powerupBanned = pid => difficulty().bans.indexOf(pid) >= 0;

    /* ── cosmetics live in the global wardrobe ────────────────── */
    const ownsTheme = t => SQ.Store.data.owned.themes.includes(t);
    const ownsAvatar = a => SQ.Store.data.owned.avatars.includes(a);

    /* ── flashcards: Leitner with graded review (Biology's again/hard/good/easy) ── */
    function cardState(cid) {
      return data.srs[cid] || (data.srs[cid] = { box: 1, due: U.dayKey(), reps: 0, lapses: 0 });
    }
    /** Pays at most once per card per day, only when it was genuinely due. */
    function cardXpEligible(cid) {
      const s = data.srs[cid];
      const today = U.dayKey();
      if (s && s.xpDay === today) return false;
      return !s || U.daysBetween(s.due, today) >= 0;
    }
    function markCardXp(cid) { cardState(cid).xpDay = U.dayKey(); save(); }
    /**
     * reviewCard(id, grade) — grade is `true`/`false` (the lineage apps' got-it / missed)
     * or "again" | "hard" | "good" | "easy". Again resets to box 1 and counts a lapse;
     * hard keeps the box (and comes back tomorrow); good moves up one; easy moves up two.
     */
    function reviewCard(cid, grade) {
      const s = cardState(cid);
      const g = grade === true ? "good" : grade === false ? "again" : (grade || "good");
      s.reps++;
      if (g === "again") { s.box = 1; s.lapses++; }
      else if (g === "hard") s.box = Math.max(1, s.box);
      else if (g === "easy") s.box = Math.min(5, s.box + 2);
      else s.box = Math.min(5, s.box + 1);
      const due = new Date();
      due.setDate(due.getDate() + (g === "hard" ? 1 : BOX_DAYS[s.box]));
      s.due = U.dayKey(due);
      s.last = U.dayKey();
      data.stats.cardsReviewed = (data.stats.cardsReviewed || 0) + 1;
      if (SQ.Overall) SQ.Overall.note("cardsReviewed");
      save();
      return s;
    }
    const allCards = () => (c.cards ? c.cards() : []) || [];
    function dueCards(filter) {
      const today = U.dayKey();
      return allCards().filter(q => (!filter || filter(q)) && (() => {
        const s = data.srs[q.id];
        return !s || U.daysBetween(s.due, today) >= 0;
      })());
    }
    const isLeech = cid => { const s = data.srs[cid]; return !!(s && s.lapses >= LEECH_LAPSES); };
    function leeches() {
      return allCards().map(q => ({ q, c: data.srs[q.id] }))
        .filter(x => x.c && x.c.lapses >= LEECH_LAPSES)
        .sort((a, b) => b.c.lapses - a.c.lapses);
    }
    const cardsMastered = () => Object.values(data.srs).filter(s => s.box >= 5).length;

    /* ── coverage: hide content the student is not studying ──────
       Never changes payouts or achievement targets (Biology's rule). */
    const tagHidden = tag => !!(data.settings.hidden && data.settings.hidden[tag]);
    function setTagHidden(tag, hidden) {
      data.settings.hidden = data.settings.hidden || {};
      if (hidden) data.settings.hidden[tag] = true; else delete data.settings.hidden[tag];
      emit();
    }
    const tagOn = tag => !tag || !tagHidden(tag);
    const hiddenTags = () => Object.keys(data.settings.hidden || {});

    /* ── achievements (pay the subject's coins) ──────────────── */
    function achievementStats() {
      const base = Object.assign({}, data.stats, {
        level: data.level, prestige: data.prestige || 0,
        longestDayStreak: SQ.Store.data.streak.longest || 0,
        dayStreak: SQ.Store.data.streak.count || 0,
        modules: data.modules, topics: data.topics, modesPlayed: data.modesPlayed,
        modesPlayedCount: Object.keys(data.modesPlayed).length,
        themesOwned: SQ.Store.data.owned.themes.length,
        avatarsOwned: SQ.Store.data.owned.avatars.length,
        bossesBeaten: Object.keys(data.bossesBeaten).length,
        cardsMastered: cardsMastered(), cardsSeen: Object.keys(data.srs).length,
        masteryOf: mastery, topicMasteryOf: topicMastery
      });
      return c.achievementStats ? (c.achievementStats(data, base) || base) : base;
    }
    function checkAchievements() {
      const list = (c.achievements ? c.achievements() : []) || [];
      const s = achievementStats(), out = [];
      for (const a of list) {
        if (data.achievements[a.id]) continue;
        let ok = false;
        try { ok = !!a.check(s); } catch (e) { ok = false; }
        if (ok) {
          data.achievements[a.id] = Date.now();
          if (a.reward) addCoins(a.reward, true);
          out.push(a);
        }
      }
      if (out.length) emit();
      return out;
    }

    /* ── the subject's daily challenge ───────────────────────── */
    function dailySpec() {
      const day = U.dayKey();
      const rng = U.seededRandom(U.hash(id + "-" + day));
      const modes = Object.keys(c.dailyModes || { rapid: 12 });
      const mode = modes[Math.floor(rng() * modes.length)];
      const target = (c.dailyModes || { rapid: 12 })[mode] || 10;
      const r = c.dailyReward || { coins: 120, xp: 150 };
      return { day, mode, target, reward: r.coins, xp: r.xp };
    }
    function daily() {
      const spec = dailySpec();
      if (!data.daily || data.daily.day !== spec.day) {
        data.daily = { day: spec.day, progress: 0, claimed: false, spec };
        save();
      } else data.daily.spec = spec;
      return data.daily;
    }
    function progressDaily(mode, by) {
      const d = daily();
      if (d.claimed || d.spec.mode !== mode) return false;
      d.progress = Math.min(d.spec.target, d.progress + (by === undefined ? 1 : by));
      save();
      return d.progress >= d.spec.target;
    }
    function claimDaily() {
      const d = daily();
      if (d.claimed || d.progress < d.spec.target) return false;
      d.claimed = true;
      data.stats.dailiesDone = (data.stats.dailiesDone || 0) + 1;
      if (SQ.Overall) SQ.Overall.note("subjectDailies");
      addCoins(d.spec.reward, true);
      /* Paid through award() so it reaches the overall level and Stars too. */
      if (SQ.UI && SQ.UI.payExtra) SQ.UI.payExtra(id, d.spec.xp, "Daily challenge");
      else addXP(d.spec.xp);
      return true;
    }

    /* ── the subject's weekly quests ─────────────────────────── */
    function statFor(k) {
      if (c.statFor) { const v = c.statFor(k, data); if (v !== undefined) return v; }
      if (k === "cardsMastered") return cardsMastered();
      return data.stats[k] || 0;
    }
    function weekly() {
      const wk = U.weekKey();
      if (!data.weekly || data.weekly.week !== wk) {
        const rng = U.seededRandom(U.hash(id + "-week-" + wk));
        const picked = U.seededShuffle(QUEST_POOL, rng).slice(0, 3).map(q => q.id);
        const baseline = {};
        QUEST_POOL.forEach(q => (baseline[q.stat] = statFor(q.stat)));
        data.weekly = { week: wk, baseline, quests: picked, claimed: [] };
        save();
      }
      return data.weekly;
    }
    function weeklyQuests() {
      const w = weekly();
      return w.quests.map(qid => {
        const q = QUEST_POOL.find(x => x.id === qid);
        if (!q) return null;
        const base = (w.baseline && w.baseline[q.stat]) || 0;
        const done = Math.max(0, Math.min(q.target, statFor(q.stat) - base));
        return { quest: q, done, target: q.target, complete: done >= q.target, claimed: w.claimed.includes(qid) };
      }).filter(Boolean);
    }
    function claimQuest(qid) {
      const w = weekly();
      const e = weeklyQuests().find(x => x.quest.id === qid);
      if (!e || !e.complete || e.claimed) return false;
      w.claimed.push(qid);
      data.stats.questsDone = (data.stats.questsDone || 0) + 1;
      addCoins(e.quest.coins, true);
      const xp = Math.round(e.quest.xp * xpMultiplier());
      if (SQ.UI && SQ.UI.payExtra) SQ.UI.payExtra(id, xp, "Weekly quest", { raw: true });
      else addXP(xp);
      return true;
    }

    function reset() { SQ.Store.resetSubject(id); load(); emit(); }

    return {
      id, meta, load, save, flush, emit, onChange, reset,
      get data() { return data; },
      /** Import/export are app-wide now; kept so ported Settings screens still link. */
      replaceSave: parsed => SQ.Store.replaceSave(parsed),
      xpNeeded, levelTitle, LEVEL_TITLES: titles, addXP, addCoins, spendCoins, MAX_LEVEL,
      DIFFICULTIES: DIFFS, difficulty, setDifficulty, xpMultiplier, canPrestige, doPrestige,
      MASTERY_TIERS: TIERS, masteryTier,
      touchStreak, streakBonus,
      recordAnswer, recordSkill, noteStreak, bump, markMode, recordScore, markBoss,
      toggleBookmark, isBookmarked,
      mastery, topicMastery, overallAccuracy, weakTopics,
      usePowerup, grantPowerup, powerupBanned, ownsTheme, ownsAvatar,
      BOX_DAYS, LEECH_LAPSES, cardState, cardXpEligible, markCardXp, reviewCard, dueCards,
      isLeech, leeches, cardsMastered,
      tagHidden, setTagHidden, tagOn, hiddenTags,
      achievementStats, checkAchievements,
      dailySpec, daily, progressDaily, claimDaily,
      QUEST_POOL, weekKey: U.weekKey, weekly, weeklyQuests, claimQuest, statFor
    };
  }

  return { create, DIFFICULTIES, MASTERY_TIERS, BOX_DAYS, LEECH_LAPSES };
})();
