/* Loads a subject's code the first time the student opens it.

   subjects/<id>/manifest.js is a tiny script that calls
     SQ.Subjects.manifest(id, { css: [...], scripts: [...], boot: fn })
   The loader injects the stylesheets, then the scripts in order (async=false keeps
   the order even though they download in parallel), then runs boot(), which is
   where the subject registers its routes on its bound UI.

   Classic scripts, not modules, so the app still runs from file:// — and the
   service worker precaches every file, so this is instant offline too. */
window.SQ = window.SQ || {};

SQ.Loader = (function () {
  const U = SQ.U;
  const loaded = {};
  const pending = {};

  const isLoaded = id => !!loaded[id];

  function load(id) {
    if (loaded[id]) return Promise.resolve();
    if (pending[id]) return pending[id];
    const base = "subjects/" + id + "/";
    pending[id] = U.loadScript(base + "manifest.js")
      .then(() => {
        const m = SQ.Subjects.getManifest(id);
        if (!m) throw new Error("subjects/" + id + "/manifest.js did not register a manifest");
        const css = (m.css || []).map(p => U.loadStyle(p));
        /* All script tags are appended at once with async=false: the browser fetches
           them in parallel and executes in document order. */
        const scripts = (m.scripts || []).map(p => U.loadScript(p));
        return Promise.all(css.concat(scripts)).then(() => m);
      })
      .then(m => {
        if (typeof m.boot === "function") m.boot();
        loaded[id] = true;
        delete pending[id];
        applySoundSettings();
      })
      .catch(err => { delete pending[id]; throw err; });
    return pending[id];
  }

  /** Global sound settings reach every loaded subject's own sound module. */
  function applySoundSettings() {
    const s = SQ.Store.data.settings;
    SQ.Subjects.LIST.forEach(meta => {
      const ns = window[meta.ns];
      const snd = ns && (ns.Sound || ns.Audio);
      if (!snd) return;
      try {
        if (snd.setEnabled) snd.setEnabled(s.sound);
        if (snd.setVolume) snd.setVolume(s.volume);
      } catch (e) { /* a subject's sound module is optional */ }
    });
    if (SQ.Sound) { SQ.Sound.setEnabled(s.sound); SQ.Sound.setVolume(s.volume); }
  }

  return { load, isLoaded, applySoundSettings, loaded: () => Object.keys(loaded) };
})();
