/* Bootstrap: load the save, apply preferences, register the app-level routes, wire the
   chrome, start the router, and handle service-worker updates. */
window.SQ = window.SQ || {};

/* Shown in Settings; must match CACHE in sw.js (tests/validate.js asserts it). */
SQ.VERSION = "1.0.0";

(function () {
  const U = SQ.U, Store = SQ.Store, UI = SQ.UI;

  Store.load();
  const d = Store.data;

  /* ── preferences before first paint ───────────────────────── */
  UI.applyTheme();
  SQ.FX.applyMotion(d.settings.motion);
  document.documentElement.dataset.text = d.settings.textScale || "md";
  SQ.Sound.setEnabled(d.settings.sound);
  SQ.Sound.setVolume(d.settings.volume);
  SQ.Overall.daily();
  SQ.Overall.weekly();

  /* ── app-level routes ─────────────────────────────────────── */
  UI.route("home",         view => SQ.Hub.home(view));
  UI.route("subjects",     view => SQ.Hub.subjects(view));
  UI.route("progress",     view => SQ.Hub.progress(view));
  UI.route("achievements", view => SQ.Hub.achievements(view));
  UI.route("shop",   (view, args) => SQ.Shop.general(view, args));
  UI.route("arcade", (view, args) => SQ.Arcade.screen(view, args));
  UI.route("settings",     view => SQ.Hub.settings(view));
  UI.route("dev",          view => SQ.Hub.dev(view));

  /* ── chrome ───────────────────────────────────────────────── */
  U.$("#avatar-btn").addEventListener("click", () => SQ.Hub.profileSheet());
  U.$("#ctx-btn").addEventListener("click", () => SQ.Hub.switcher());
  U.$("#settings-btn").addEventListener("click", () => UI.go("/settings"));
  U.$("#star-pill").addEventListener("click", () => UI.go("/shop"));
  U.$("#coin-pill").addEventListener("click", () => {
    const id = UI.context(); if (id) UI.go("/s/" + id + "/shop");
  });
  U.$("#streak-pill").addEventListener("click", () => UI.go("/progress"));

  /* The top bar's height changes with safe-area insets and rotation, so sticky
     panels read it from a custom property that is re-measured, not hard-coded. */
  function measureTopbar() {
    const bar = U.$("#topbar");
    if (!bar || bar.hidden) return;
    document.documentElement.style.setProperty("--topbar-h", bar.offsetHeight + "px");
  }
  if (window.ResizeObserver) new ResizeObserver(measureTopbar).observe(U.$("#topbar"));
  window.addEventListener("resize", measureTopbar);

  /* Persist immediately on backgrounding: mobile browsers reclaim hidden tabs
     without warning, and the 200 ms debounce would lose whatever was in flight. */
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") Store.flush();
  });
  window.addEventListener("pagehide", () => Store.flush());

  const unlockAudio = () => { SQ.Sound.click(); document.removeEventListener("pointerdown", unlockAudio); };
  document.addEventListener("pointerdown", unlockAudio);

  /* A subject in the URL that the student isn't enrolled in is still allowed (a
     shared link, the dev menu) — enrolment only decides what the hub shows. */
  if (!location.hash) {
    const last = d.settings.lastSubject;
    location.hash = last && d.enrolled.includes(last) ? "/s/" + last + "/home" : "/home";
  }
  UI.init();
  SQ.Overall.touchStreak();

  /* ── first run: pick subjects, then offer to bring old progress across ── */
  setTimeout(() => {
    if (!d.settings.onboarded) SQ.Hub.onboarding();
    else if (!d.migrateOffered) SQ.Migrate.offer();
  }, 700);

  /* ══════════════════════════════════════════════════════════
     OFFLINE SUPPORT AND UPDATES (from Maths Advanced / Physics — the order is
     load-bearing):
     · a worker that finished installing in a PREVIOUS session sits in
       registration.waiting and no event will ever fire for it: look for it at boot
     · and look BEFORE calling update(), or Chromium reinstalls it and turns a
       silent apply into a dismissable prompt
     · a first install's clients.claim() fires controllerchange too; that is not an
       update and must not reload
     ══════════════════════════════════════════════════════════ */
  if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
    window.addEventListener("load", () => {
      const hadController = !!navigator.serviceWorker.controller;
      let reloading = false;
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (!hadController || reloading) return;
        reloading = true;
        Store.flush();
        location.reload();
      });
      navigator.serviceWorker.register("sw.js", { updateViaCache: "none" }).then(reg => {
        if (reg.waiting && navigator.serviceWorker.controller) reg.waiting.postMessage("SKIP_WAITING");
        reg.addEventListener("updatefound", () => {
          const incoming = reg.installing;
          if (!incoming) return;
          incoming.addEventListener("statechange", () => {
            if (incoming.state === "installed" && navigator.serviceWorker.controller) offerUpdate(incoming);
          });
        });
        let lastCheck = 0;
        document.addEventListener("visibilitychange", () => {
          if (document.visibilityState !== "visible") return;
          const now = Date.now();
          if (now - lastCheck < 60000) return;
          lastCheck = now;
          if (reg.waiting && navigator.serviceWorker.controller) { reg.waiting.postMessage("SKIP_WAITING"); return; }
          reg.update().catch(() => {});
        });
      }).catch(err => console.warn("Offline support unavailable:", err));
    });
  }

  function offerUpdate(worker) {
    const bar = U.el("div", { class: "toast xp", style: "pointer-events:auto" }, [
      U.el("span", { class: "toast-ico", text: "⬆️" }),
      U.el("span", { text: "New version ready" }),
      U.el("button", { class: "btn btn-sm btn-primary", style: "margin-left:8px", text: "Reload",
        on: { click: () => { Store.flush(); worker.postMessage("SKIP_WAITING"); } } })
    ]);
    U.$("#toasts").appendChild(bar);
  }

  /** Settings → Force refresh: drop every worker and cache, keep the save. */
  SQ.forceRefresh = function () {
    Store.flush();
    const jobs = [];
    if (navigator.serviceWorker) jobs.push(navigator.serviceWorker.getRegistrations().then(rs => Promise.all(rs.map(r => r.unregister()))));
    if (window.caches) jobs.push(caches.keys().then(ks => Promise.all(ks.map(k => caches.delete(k)))));
    Promise.all(jobs).catch(() => {}).then(() => location.reload());
  };

  /* ── reveal ───────────────────────────────────────────────── */
  let revealed = false;
  function reveal() {
    if (revealed) return;
    revealed = true;
    U.$("#boot").classList.add("gone");
    U.$("#topbar").hidden = false;
    U.$("#navbar").hidden = false;
    measureTopbar();
    setTimeout(() => { const b = U.$("#boot"); if (b) b.remove(); }, 600);
  }
  window.addEventListener("load", reveal);
  setTimeout(reveal, 900);
})();
