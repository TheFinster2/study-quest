/* English's State, on the shared subject-state factory.
   ============================================================================
   The factory (js/sq/subject-state.js) was modelled partly on this app, so almost all
   of Close Reading's State maps straight across: levels + prestige, difficulty, Leitner
   with leeches (BOX_DAYS and the four-lapse line match exactly), mistakes, achievements,
   the daily and the weekly. What stays here is what only English has:

     · texts{}          mastery per TEXT as well as per module (recordAnswer is overridden,
                        because English's signature is (mod, ok, qid, text, topic))
     · topics           the SKILL axis — "Form and structure 38%" is actionable
     · puzzlesSolved    Essay Architect's unique-puzzle ledger
     · freeText         Layer C's farm guards (once per prompt per day, no re-used answer)
     · drafts           the Draft Desk. Earns nothing, structurally: nothing here pays
     · manifest/poems   the student's chosen texts and Donne poems

   Shared, and so NOT here any more: profile, power-up inventory, the day streak,
   sound/motion (SQ.Store, linked onto the slot), and owned themes/avatars (the global
   wardrobe — read through ownsTheme/ownsAvatar or SQ.Store.data.owned).
   ============================================================================ */
window.EN = window.EN || {};

(function () {
  const U = EN.U;

  /* English kept Standard/Hard/Nightmare with `timeScale` and `ban`; the app has four
     difficulties with `time` and `bans`. Alias the old names so every call site in the
     modes keeps reading what it always read. */
  const DIFFS = SQ.SubjectState.DIFFICULTIES.map(d =>
    Object.assign({}, d, { timeScale: d.time, ban: d.bans }));

  /* Weekly quests, unchanged from the stand-alone app. */
  const QUEST_POOL = [
    { id:"q_answer",  stat:"answered",         target:180, xp:1400, coins:700, icon:"📝",
      name:"Grind it out", desc:"Answer 180 questions" },
    { id:"q_correct", stat:"correct",          target:120, xp:1600, coins:800, icon:"🎯",
      name:"On target", desc:"Get 120 questions right" },
    { id:"q_tech",    stat:"techniquesNamed",  target:60,  xp:1300, coins:650, icon:"🔍",
      name:"Named and shamed", desc:"Identify 60 techniques" },
    { id:"q_cloze",   stat:"clozeSolved",      target:40,  xp:1500, coins:750, icon:"🕳️",
      name:"Word perfect", desc:"Complete 40 cloze quotes" },
    { id:"q_mark",    stat:"paragraphsMarked", target:25,  xp:1600, coins:800, icon:"📝",
      name:"Relief marker", desc:"Mark 25 paragraphs" },
    { id:"q_essay",   stat:"essaysAssembled",  target:12,  xp:1400, coins:700, icon:"🧱",
      name:"Structural work", desc:"Assemble 12 paragraphs or essays" },
    { id:"q_thesis",  stat:"thesesForged",     target:15,  xp:1400, coins:700, icon:"✍️",
      name:"Position taken", desc:"Forge 15 theses" },
    { id:"q_says",    stat:"sentencesNailed",  target:20,  xp:1500, coins:750, icon:"💬",
      name:"Say it in one", desc:"Nail 20 effect statements" },
    { id:"q_vault",   stat:"quotesMastered",   target:25,  xp:1500, coins:750, icon:"🗝️",
      name:"Vault keeper", desc:"Have 25 quotes mastered" },
    { id:"q_boss",    stat:"bossWins",         target:3,   xp:2200, coins:1100, icon:"⚔️",
      name:"Boss hunter", desc:"Defeat 3 Module Bosses" },
    { id:"q_perfect", stat:"perfectRuns",      target:5,   xp:2000, coins:1000, icon:"✨",
      name:"Flawless five", desc:"Finish 5 perfect runs" },
    { id:"q_survive", stat:"survivalBest",     target:25,  xp:1800, coins:900, icon:"💀",
      name:"Last stand", desc:"Reach a 25-question Survival run" }
  ];

  const S = SQ.SubjectState.create("eng", {
    defaults: () => ({
      coins: 120,
      stats: {
        techniquesNamed: 0, quotesMatched: 0, clozeSolved: 0, clozePerfect: 0,
        paragraphsMarked: 0, bandsExact: 0, perfectMarkings: 0,
        essaysAssembled: 0, thesesForged: 0, sentencesMarked: 0, sentencesNailed: 0,
        rewritesNailed: 0, deconstructions: 0, gridsCleared: 0, perfectGrids: 0,
        quotesMastered: 0, draftWords: 0, textsStudied: 0, peakCoins: 120
      },
      texts: {},
      topics: {},
      puzzlesSolved: {},
      settings: { layerC: false, onboarded: false },
      freeText: { day: null, scored: {}, hashes: {} },
      drafts: [],
      manifest: null,
      poems: {}
    }),
    startCoins: 120,
    levelTitles: EN.DATA.levelTitles,
    /* A whole-HSC-year progression on purpose: level 20 ≈ 87,000 XP, level 60 ≈ 1.42 M.
       KEEP — the student asked for it to be harder than the first tuning. */
    xpCurve: level => Math.round(130 * Math.pow(level, 1.5)),
    difficulties: DIFFS,
    prestigePowerup: "insight",
    dailyModes: { rapid: 14, technique: 12, cloze: 8, quotematch: 1,
                  marking: 5, essay: 3, bandgrid: 1, deconstruct: 8 },
    dailyReward: { coins: 120, xp: 150 },
    questPool: QUEST_POOL,
    achievements: () => EN.DATA.achievements,
    achievementStats: (data, base) => {
      const owned = SQ.Store.data.owned;
      /* Counted against English's OWN catalogue, and free items count as owned (as they
         did in the stand-alone app, where the defaults were in `owned` from day one). */
      const themesOwned = EN.DATA.themes.filter(t => !t.price || owned.themes.includes("eng-" + t.id)).length;
      const avatarsOwned = EN.DATA.avatars.filter(a => !a.price || owned.avatars.includes(a.em)).length;
      const gs = SQ.Store.data.stats || {};
      return Object.assign(base, {
        texts: data.texts,
        themesOwned, avatarsOwned,
        nightOwl: !!(gs.nightOwl || data.stats.nightOwl),
        earlyBird: !!(gs.earlyBird || data.stats.earlyBird),
        puzzlesSolvedUnique: Object.keys(data.puzzlesSolved || {}).length,
        quotesMastered: Object.values(data.srs).filter(x => x.box >= 5).length,
        quotesSeen: Object.keys(data.srs).length,
        draftsKept: (data.drafts || []).length,
        textMasteryOf: textMastery
      });
    },
    cards: () => EN.Bank.quotes(),
    statFor: (key, data) => key === "quotesMastered"
      ? Object.values(data.srs).filter(c => c.box >= 5).length : undefined,
    migrate: data => {
      if (!data.texts) data.texts = {};
      if (!data.topics) data.topics = {};
      if (!data.freeText) data.freeText = { day: null, scored: {}, hashes: {} };
      if (!Array.isArray(data.drafts)) data.drafts = [];
    }
  });

  const data = () => S.data;
  function weighted(rec) {
    if (!rec || !rec.seen) return 0;
    return Math.round((rec.correct / rec.seen) * Math.min(1, rec.seen / 25) * 100);
  }
  function textMastery(text) { return weighted(data().texts[text]); }

  /* ── recordAnswer(mod, ok, qid, text, topic) ────────────────
     English's signature. The factory's is (mod, ok, qid, topic, meta), so the text is
     tracked here and passed through as mistake metadata. */
  const baseRecord = S.recordAnswer;
  function recordAnswer(mod, ok, questionId, text, topic) {
    if (text) {
      const t = data().texts[text] || (data().texts[text] = { seen: 0, correct: 0 });
      t.seen++;
      if (ok) t.correct++;
    }
    baseRecord(mod, ok, questionId, topic || undefined, text ? { text } : undefined);
  }

  /* reviewCard also refreshes the mastered-quote counter the Home screen shows. */
  const baseReview = S.reviewCard;
  function reviewCard(id, grade) {
    const c = baseReview(id, grade);
    data().stats.quotesMastered = Object.values(data().srs).filter(x => x.box >= 5).length;
    S.save();
    return c;
  }

  /* ── Layer C farm guards (§9.8) ──────────────────────────────
     1. One good sentence, everywhere: the same normalised response pays once per day
        across the whole bank.  2. Resubmit until it passes: one SCORED attempt per
        prompt per day.  3. Paste the prompt back: handled in mark.js (nearMiss). */
  function freeTextDay() {
    const today = U.dayKey();
    if (data().freeText.day !== today) {
      data().freeText = { day: today, scored: {}, hashes: {} };
      S.save();
    }
    return data().freeText;
  }
  function freeTextEligible(promptId, response) {
    const ft = freeTextDay();
    if (ft.scored[promptId]) return { ok: false, why: "attempted" };
    const h = String(U.hash(U.normalise(response)));
    if (ft.hashes[h] && ft.hashes[h] !== promptId) return { ok: false, why: "repeat" };
    return { ok: true };
  }
  function markFreeText(promptId, response) {
    const ft = freeTextDay();
    ft.scored[promptId] = Date.now();
    ft.hashes[String(U.hash(U.normalise(response)))] = promptId;
    S.save();
  }

  /* ── Draft Desk (§0.5): stored, exported with the save, earns nothing ── */
  function saveDraft(draft) {
    const list = data().drafts || (data().drafts = []);
    const i = list.findIndex(d => d.id === draft.id);
    if (i >= 0) list[i] = draft; else list.unshift(draft);
    if (list.length > 60) list.length = 60;
    data().stats.draftWords = list.reduce((n, d) => n + U.words(d.body || ""), 0);
    S.save();
    return draft;
  }
  function deleteDraft(id) {
    data().drafts = (data().drafts || []).filter(d => d.id !== id);
    S.save();
  }

  /* ── the text manifest ───────────────────────────────────────
     Read through here, never straight off EN.DATA.activeTexts. Bank.invalidate() after
     any write — the quote pool is memoised. */
  function activeTexts() {
    const m = data().manifest;
    if (!m) return EN.DATA.activeTexts;
    return {
      common:  m.common  || null,
      moduleA: (m.moduleA || []).slice(0, 2),
      moduleB: m.moduleB || null,
      moduleC: m.moduleC || null
    };
  }
  function setSlot(mod, value) {
    const cur = activeTexts();
    const next = {
      common: cur.common, moduleA: [].concat(cur.moduleA || []).filter(Boolean),
      moduleB: cur.moduleB, moduleC: cur.moduleC
    };
    if (mod === "moduleA") next.moduleA = [].concat(value || []).filter(Boolean).slice(0, 2);
    else next[mod] = value || null;
    data().manifest = next;
    if (EN.Bank) EN.Bank.invalidate();
    S.emit();
    return next;
  }

  function enabledPoems(textId) {
    const t = EN.DATA.texts[textId];
    if (!t || !t.poems || !t.poems.length) return null;
    const saved = (data().poems || {})[textId];
    if (Array.isArray(saved)) {
      const known = new Set(t.poems.map(p => p.id));
      return saved.filter(id => known.has(id));
    }
    return t.poems.filter(p => p.core).map(p => p.id);
  }
  function poemEnabled(textId, poemId) {
    if (!poemId) return true;
    const on = enabledPoems(textId);
    return on === null ? true : on.includes(poemId);
  }
  function setPoems(textId, ids) {
    (data().poems || (data().poems = {}))[textId] = [].concat(ids || []);
    if (EN.Bank) EN.Bank.invalidate();
    S.emit();
  }
  function resetPoems(textId) {
    if (data().poems) delete data().poems[textId];
    if (EN.Bank) EN.Bank.invalidate();
    S.emit();
  }

  /* The app owns the save file now; these keep the Draft Desk and Options honest. */
  const storageFailing = () => SQ.Store.storageFailing();
  const saveSize = () => SQ.Store.saveSize();
  /* A student's own texts survive a subject reset only if they want them to — the
     reset is from Options, which says so. */
  const baseReset = S.reset;
  function reset() { baseReset(); if (EN.Bank) EN.Bank.invalidate(); }

  Object.assign(S, {
    recordAnswer, reviewCard, textMastery,
    freeTextDay, freeTextEligible, markFreeText,
    saveDraft, deleteDraft,
    activeTexts, setSlot, enabledPoems, poemEnabled, setPoems, resetPoems,
    storageFailing, saveSize, reset
  });

  EN.State = S;
})();
