/* The one save file.

   Everything lives under one localStorage key. The top level holds what belongs to
   the STUDENT — profile, settings, the overall level, Stars (the general currency),
   power-ups, cosmetics, the arcade, the global streak — and `subjects` holds one
   slot per subject, shaped the way that subject's original app shaped its own save.
   Keeping the slot shape close to the original is what lets the old saves be
   imported nearly verbatim (see migrate.js) and what lets each subject's modes keep
   reading `S.data.stats.x` exactly as they always did.

   Writes are debounced (200 ms) with an explicit flush on backgrounding, because
   mobile browsers reclaim a hidden tab without warning. */
window.SQ = window.SQ || {};

SQ.Store = (function () {
  const KEY = "studyquest.save.v1";
  const U = SQ.U;

  const DEFAULT = () => ({
    v: 1,
    createdAt: Date.now(),
    profile: { name: "Student", avatar: "🎓", theme: "midnight" },
    /* motion is three-valued on purpose (see English's history): "auto" follows the
       device, "on"/"off" are the student overriding it. */
    settings: { sound: true, volume: 0.7, motion: "auto", textScale: "md",
                haptics: true, onboarded: false, lastSubject: null },
    enrolled: [],                  // subject ids the student studies, in their order
    overall: { xp: 0, level: 1, xpIntoLevel: 0, lifetimeXp: 0 },
    stars: 150,                    // the general currency ⭐
    streak: { count: 0, lastDay: null, longest: 0 },
    /* Power-ups are GENERAL: bought once, usable in any subject. Ids are the union of
       what the seven apps sold. English's "adrenaline" (double XP) is `double` here,
       and every other app's "adrenaline" (boss revive) is `revive`. */
    inventory: { fifty: 1, skip: 1, freeze: 0, shield: 0, double: 0, insight: 0,
                 revive: 0, reread: 0, hint: 0 },
    owned: { themes: ["midnight"], avatars: ["🎓", "📚"], skins: [] },
    arcade: { seconds: 0, allDayUntil: 0, scores: {}, played: {}, skin: {} },
    stats: { runs: 0, answered: 0, correct: 0, purchases: 0, starsSpent: 0,
             exchanged: 0, arcadeSeconds: 0, peakStars: 150, subjectsTried: 0,
             dailyClaims: 0, questsDone: 0, cratesOpened: 0, nightOwl: false, earlyBird: false },
    achievements: {},
    daily: { day: null, progress: {}, claimed: false, spec: null },
    weekly: { week: null, baseline: null, quests: [], claimed: [] },
    history: {},                   // { dayKey: xp } across every subject
    migrated: {},                  // { subjectId: timestamp } — old-app saves brought across
    migrateOffered: false,
    devUnlocked: false,
    subjects: {}
  });

  let data = DEFAULT();
  const listeners = new Set();
  let saveTimer = null;
  let frozen = false;
  let saveFailed = null;
  let toldAboutFailure = false;

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) data = U.deepMerge(DEFAULT(), JSON.parse(raw));
    } catch (e) {
      console.warn("Save file unreadable, starting fresh.", e);
      data = DEFAULT();
    }
    migrateShape();
    return data;
  }

  function migrateShape() {
    const s = data.settings;
    if (s.motion === true) s.motion = "auto";
    else if (s.motion === false) s.motion = "off";
    else if (["auto", "on", "off"].indexOf(s.motion) < 0) s.motion = "auto";
    if (!Array.isArray(data.enrolled)) data.enrolled = [];
  }

  function write() {
    if (frozen) return true;
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
      if (saveFailed) { saveFailed = null; toldAboutFailure = false; }
      return true;
    } catch (e) {
      /* A full disk used to be a console.warn in most of the source apps, which is the
         worst possible handling: every later write fails silently and the student keeps
         playing and keeps losing it. Say so, once, in words that say what to do. */
      saveFailed = e && e.name ? e.name : "unknown";
      console.warn("Could not save progress — storage is probably full.", e);
      if (!toldAboutFailure && SQ.UI && SQ.UI.toast) {
        toldAboutFailure = true;
        SQ.UI.toast({ icon: "⚠", kind: "bad", ms: 12000,
          text: "<b>Your progress is not being saved.</b> This device's storage is full. " +
                "Export your save from Settings, then delete some English drafts." });
      }
      return false;
    }
  }

  function save() { clearTimeout(saveTimer); saveTimer = setTimeout(write, 200); }
  function flush() { clearTimeout(saveTimer); saveTimer = null; return write(); }
  function emit() { listeners.forEach(fn => { try { fn(data); } catch (e) { console.warn(e); } }); save(); }
  function onChange(fn) { listeners.add(fn); return () => listeners.delete(fn); }

  /** Replace the whole save with an imported one; the caller reloads immediately.
      Every later write is suppressed until then, or the reload's pagehide flush would
      land the old in-memory save on top of the file just imported. */
  function replaceSave(parsed) {
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return false;
    const known = ["profile", "overall", "subjects", "stars", "settings"];
    if (!known.some(k => k in parsed)) return false;
    const merged = U.deepMerge(DEFAULT(), parsed);
    try { localStorage.setItem(KEY, JSON.stringify(merged)); }
    catch (e) { console.warn("Could not write imported save.", e); return false; }
    data = merged;
    clearTimeout(saveTimer);
    saveTimer = null;
    frozen = true;
    return true;
  }

  function reset() {
    data = DEFAULT();
    try { localStorage.removeItem(KEY); } catch (e) { /* ignore */ }
    frozen = true;           // the caller reloads
  }

  /** Remove one subject's slot (Settings → reset a subject). */
  function resetSubject(id) {
    delete data.subjects[id];
    delete slotCache[id];
    flush();
  }

  const storageFailing = () => saveFailed;
  function saveSize() { try { return JSON.stringify(data).length; } catch (e) { return 0; } }
  function exportJSON() { return JSON.stringify(data, null, 1); }

  /* ── subject slots ───────────────────────────────────────────
     A slot is merged over its subject's default shape once per session. The shared
     bits a subject's original code reads through its own save — the profile, the
     power-up inventory, the day streak, the global sound/motion settings — are
     attached as NON-ENUMERABLE accessors, so `S.data.inventory.fifty--` keeps
     working in a ported mode while JSON.stringify never writes a second copy. */
  const slotCache = {};

  const SHARED_SETTINGS = ["sound", "volume", "motion", "textScale", "haptics"];

  function link(obj, key, get, set) {
    Object.defineProperty(obj, key, { get, set: set || (() => {}), enumerable: false, configurable: true });
  }

  function slot(id, defaults) {
    if (slotCache[id]) return slotCache[id];
    const base = defaults ? defaults() : {};
    const stored = data.subjects[id];
    const s = stored ? U.deepMerge(base, stored) : base;
    s.settings = s.settings || {};
    data.subjects[id] = s;
    link(s, "profile", () => data.profile);
    link(s, "inventory", () => data.inventory);
    link(s, "streak", () => data.streak);
    SHARED_SETTINGS.forEach(k => link(s.settings, k, () => data.settings[k], v => { data.settings[k] = v; }));
    slotCache[id] = s;
    return s;
  }

  /** The raw stored slot, without merging — for the hub's summaries of subjects that
      have not been opened (and so whose defaults are not loaded) this session. */
  const rawSlot = id => data.subjects[id] || null;

  return {
    KEY, DEFAULT, load, save, flush, emit, onChange, replaceSave, reset, resetSubject,
    storageFailing, saveSize, exportJSON, slot, rawSlot,
    get data() { return data; },
    get frozen() { return frozen; }
  };
})();
