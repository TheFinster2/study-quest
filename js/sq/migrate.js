/* Bringing progress across from the seven stand-alone apps.

   GitHub Pages serves every one of them from the same origin
   (thefinster2.github.io/<Repo>/), and localStorage is per ORIGIN, not per path —
   so when StudyQuest is served from there too, the old saves are simply sitting in
   localStorage under their old keys. Each subject knows how to read its own old
   save (manifest.importLegacy); this file finds them, asks, and applies the result.

   An exported JSON from an old app (Settings → Export in any of them) can be
   imported the same way from Settings, for a save that lives on another device or
   origin.

   Nothing is deleted: the old keys stay where they are, so the old apps keep
   working and a mistake can be re-imported. */
window.SQ = window.SQ || {};

SQ.Migrate = (function () {
  const U = SQ.U, UI = SQ.UI;
  const D = () => SQ.Store.data;

  function readLegacy(meta) {
    if (!meta.legacyKey) return null;
    try {
      const raw = localStorage.getItem(meta.legacyKey);
      if (!raw) return null;
      const obj = JSON.parse(raw);
      return obj && typeof obj === "object" ? obj : null;
    } catch (e) { return null; }
  }

  /** A rough "how much is in here" for the prompt, readable without the subject code. */
  function glance(old) {
    const xp = old.lifetimeXp || old.xp || 0;
    const level = old.level || null;
    const answered = (old.stats && old.stats.answered) || old.answered || 0;
    return { xp, level, answered };
  }

  /** Old saves found on this origin that have not been brought across yet. */
  function found() {
    return SQ.Subjects.LIST.map(meta => {
      if (D().migrated[meta.id]) return null;
      const old = readLegacy(meta);
      if (!old) return null;
      const g = glance(old);
      if (!g.xp && !g.answered) return null;
      return { meta, old, glance: g };
    }).filter(Boolean);
  }

  /** Apply one subject's legacy save. Returns a short description of what came across. */
  function apply(meta, old, opts) {
    const o = opts || {};
    return SQ.Loader.load(meta.id).then(() => {
      const man = SQ.Subjects.getManifest(meta.id);
      if (!man || typeof man.importLegacy !== "function") throw new Error(meta.name + " can't import old saves yet");
      const res = man.importLegacy(old) || {};
      if (!res.slot) throw new Error(meta.name + " import produced nothing");
      const d = D();
      const existing = d.subjects[meta.id];
      const hadProgress = existing && (existing.lifetimeXp || existing.xp || 0) > 0;
      if (hadProgress && !o.replace) {
        return { skipped: true, why: "already has progress in StudyQuest" };
      }
      SQ.Store.setSlot(meta.id, res.slot);
      /* Power-ups add; cosmetics union; the profile only fills defaults. */
      Object.keys(res.inventory || {}).forEach(k => {
        const n = Math.max(0, Math.floor(res.inventory[k] || 0));
        if (n) d.inventory[k] = (d.inventory[k] || 0) + n;
      });
      (res.themes || []).forEach(t => { if (!d.owned.themes.includes(t)) d.owned.themes.push(t); });
      (res.avatars || []).forEach(a => { if (!d.owned.avatars.includes(a)) d.owned.avatars.push(a); });
      if (res.profile) {
        if (res.profile.name && d.profile.name === "Student") d.profile.name = String(res.profile.name).slice(0, 24);
        if (res.profile.avatar && d.profile.avatar === "🎓" && d.owned.avatars.includes(res.profile.avatar)) d.profile.avatar = res.profile.avatar;
        /* Theme ids are taken as given: a subject returns app ids (Maths Advanced's
           themes became the app's) or its own prefixed ids, never both. */
        if (res.profile.theme && d.profile.theme === "midnight" && d.owned.themes.includes(res.profile.theme)) d.profile.theme = res.profile.theme;
      }
      if (res.streak && res.streak.longest > (d.streak.longest || 0)) d.streak.longest = res.streak.longest;
      /* Past study counts toward the overall level (and its level-up Stars) — but
         not the 15 % Stars-per-XP, which is for XP earned here. */
      const xp = Math.max(0, Math.round(res.slot.lifetimeXp || res.slot.xp || 0));
      if (xp) SQ.Overall.addXP(xp, null);
      if (!d.enrolled.includes(meta.id)) {
        d.enrolled = d.enrolled.filter(x => (meta.excludes || []).indexOf(x) < 0).concat([meta.id]);
      }
      d.migrated[meta.id] = Date.now();
      SQ.Store.flush();
      return { skipped: false, xp, level: res.slot.level };
    });
  }

  /** The first-run prompt. Shown once; Settings can reopen it. */
  function offer(force) {
    const d = D();
    const list = found();
    if (!list.length) {
      if (!force) { d.migrateOffered = true; SQ.Store.save(); }
      else UI.toast({ icon: "🔍", text: "No saves from the old apps were found on this device." });
      return;
    }
    const picks = new Set(list.map(x => x.meta.id));
    const rows = list.map(x => {
      const cb = U.el("input", { type: "checkbox", checked: true, "aria-label": "Import " + x.meta.app });
      cb.addEventListener("change", () => cb.checked ? picks.add(x.meta.id) : picks.delete(x.meta.id));
      return U.el("label", { class: "migrate-row" }, [
        cb,
        U.el("span", { class: "subject-ico sm", text: x.meta.icon }),
        U.el("div", { style: "flex:1" }, [
          U.el("b", { text: x.meta.app + " → " + x.meta.name }),
          U.el("div", { class: "tiny muted", text: (x.glance.level ? "Level " + x.glance.level + " · " : "") +
            U.fmtInt(x.glance.xp) + " XP · " + U.fmtInt(x.glance.answered) + " answered" })
        ])
      ]);
    });
    const status = U.el("p", { class: "tiny muted" });
    const go = U.el("button", { class: "btn btn-primary btn-block", text: "Bring it across" });
    go.addEventListener("click", () => {
      go.disabled = true;
      const todo = list.filter(x => picks.has(x.meta.id));
      let chain = Promise.resolve();
      const done = [];
      todo.forEach(x => {
        chain = chain.then(() => {
          status.textContent = "Importing " + x.meta.name + "…";
          return apply(x.meta, x.old).then(r => done.push({ x, r })).catch(e => done.push({ x, r: { error: e.message } }));
        });
      });
      chain.then(() => {
        d.migrateOffered = true;
        SQ.Store.flush();
        UI.closeModal();
        const ok = done.filter(z => z.r && !z.r.skipped && !z.r.error);
        UI.modal(U.el("div", {}, [
          U.el("h2", { text: ok.length ? "Welcome back" : "Nothing imported" }),
          U.el("div", {}, done.map(z => U.el("p", { html: `${z.x.meta.icon} <b>${U.escapeHtml(z.x.meta.name)}</b>: ` +
            (z.r.error ? "couldn't import — " + U.escapeHtml(z.r.error)
              : z.r.skipped ? "skipped — " + z.r.why
              : `level ${z.r.level}, ${U.fmtInt(z.r.xp)} XP brought across`) }))),
          U.el("p", { class: "tiny muted", text: "Your old apps still have their saves — nothing was deleted." }),
          U.el("button", { class: "btn btn-primary btn-block", text: "Continue", on: { click: () => location.reload() } })
        ]), { sticky: true });
      });
    });
    UI.modal(U.el("div", {}, [
      U.el("div", { class: "modal-big", text: "📦" }),
      U.el("h2", { text: "Found your old progress" }),
      U.el("p", { text: "These study apps have saves on this device. Bring them into StudyQuest? Levels, cards, mistakes, achievements, coins and cosmetics come across; the old apps keep their copies." }),
      U.el("div", {}, rows), status, go,
      U.el("button", { class: "btn btn-ghost btn-block", text: "Not now", on: { click: () => { d.migrateOffered = true; SQ.Store.save(); UI.closeModal(); } } })
    ]), { sticky: true });
  }

  /** Settings → import an exported JSON file from one of the old apps. */
  function importFile(meta, text) {
    let old;
    try { old = JSON.parse(text); } catch (e) { return Promise.reject(new Error("That file isn't valid JSON.")); }
    if (!old || typeof old !== "object" || Array.isArray(old)) return Promise.reject(new Error("That file isn't a save."));
    return apply(meta, old, { replace: true });
  }

  return { found, offer, apply, importFile, readLegacy };
})();
