/* The UI shell: hash router, header and nav, toasts, modals, shared game chrome, the
   results screen — and THE REWARD PIPELINE.

   Conventions carried over from every source app, because they are what made those
   apps fair and leak-free:

   1. Every reward goes through award(). Difficulty and prestige multipliers, the
      accuracy gate on the completion bonus, the multiplier ceiling, the tool tray's
      latched crutch charge, level-ups, achievements and — new here — the overall
      level and Stars all happen in exactly one function. The arcade's "earns
      nothing" rule is structural: arcade code never calls it.

   2. Every game gets its chrome from gameShell() and registers teardown with
      onLeave(). Teardowns ACCUMULATE (a list, not a slot) and the router runs them
      all before swapping screens; that is the only thing stopping timers and rAF
      loops leaking between modes.

   Routing
     #/<name>/<args…>             app-level screens (hub, arcade, general shop, settings)
     #/s/<subject>/<name>/<args…> a subject's own screens, registered through the
                                  subject's bound UI (SQ.UI.bind). The subject's code
                                  is loaded on first visit. */
window.SQ = window.SQ || {};

SQ.UI = (function () {
  const U = SQ.U, E = SQ.Economy;
  const Store = () => SQ.Store;
  const D = () => SQ.Store.data;

  const MIN_BONUS_ACCURACY = 0.5;
  const MIN_READ_MS = 1200;

  const routes = {};                // app-level
  const subjectRoutes = {};         // { chem: { home: fn, play: fn, … } }
  const subjectCfg = {};            // bind() options per subject
  let cleanups = [];
  let current = null;               // the subject id on screen, or null for the hub
  let routeToken = 0;

  /* ── routing ─────────────────────────────────────────────── */
  function route(name, fn) { routes[name.replace(/^\//, "")] = fn; }

  function go(path) {
    const p = path.charAt(0) === "/" ? path : "/" + path;
    if (location.hash === "#" + p) handleRoute();
    else location.hash = p;
  }

  function parseHash() {
    const raw = (location.hash || "#/home").replace(/^#/, "");
    const parts = raw.split("/").filter(Boolean).map(decodeURIComponent);
    if (parts[0] === "s" && parts[1]) {
      return { subject: parts[1], name: parts[2] || "home", args: parts.slice(3) };
    }
    return { subject: null, name: parts[0] || "home", args: parts.slice(1) };
  }

  function runCleanups() {
    cleanups.forEach(fn => { try { fn(); } catch (e) { console.warn("teardown failed", e); } });
    cleanups = [];
    if (SQ.Tools && SQ.Tools.unmount) SQ.Tools.unmount();
  }

  function handleRoute() {
    const r = parseHash();
    const token = ++routeToken;
    runCleanups();
    closeModal(true);

    const view = U.$("#view");
    if (view.childNodes.length && SQ.Sound) SQ.Sound.nav();
    view.innerHTML = "";

    if (r.subject) {
      const meta = SQ.Subjects.get(r.subject);
      if (!meta) { go("/home"); return; }
      if (!SQ.Loader.isLoaded(r.subject)) {
        setContext(r.subject);
        view.appendChild(U.el("div", { class: "loading-subject" }, [
          U.el("div", { class: "boot-glyph", text: meta.icon }),
          U.el("div", { class: "muted", text: "Opening " + meta.name + "…" })
        ]));
        SQ.Loader.load(r.subject).then(() => {
          if (token === routeToken) handleRoute();
        }).catch(err => {
          console.error(err);
          if (token !== routeToken) return;
          view.innerHTML = "";
          view.appendChild(U.el("div", { class: "card" }, [
            U.el("h2", { text: "Couldn't open " + meta.name }),
            U.el("p", { class: "muted", text: String(err && err.message || err) }),
            U.el("button", { class: "btn btn-primary", text: "Back to the hub", on: { click: () => go("/home") } })
          ]));
        });
        return;
      }
      setContext(r.subject);
      const table = subjectRoutes[r.subject] || {};
      const fn = table[r.name] || table.home;
      if (!fn) { go("/home"); return; }
      const res = fn(view, r.args);
      if (typeof res === "function") cleanups.push(res);
      highlightNav(r.subject, r.name);
    } else {
      setContext(null);
      const fn = routes[r.name] || routes.home;
      const res = fn(view, r.args);
      if (typeof res === "function") cleanups.push(res);
      highlightNav(null, r.name);
    }

    window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
    view.focus({ preventScroll: true });
  }

  function onLeave(fn) { if (typeof fn === "function") cleanups.push(fn); }

  /* ── context: which subject is on screen ─────────────────── */
  function setContext(id) {
    const changed = current !== id;
    current = id;
    const html = document.documentElement;
    html.dataset.subject = id || "hub";
    applyTheme();
    if (changed) buildNav();
    syncHeader();
    if (id) { D().settings.lastSubject = id; Store().save(); }
  }
  const context = () => current;

  /* ── theme ───────────────────────────────────────────────── */
  function themeFor(id) {
    const d = D();
    const owned = d.owned.themes;
    if (id) {
      const slot = d.subjects[id];
      const t = slot && slot.settings && slot.settings.theme;
      if (t && owned.includes(t)) return t;
    }
    return owned.includes(d.profile.theme) ? d.profile.theme : "midnight";
  }
  function applyTheme(themeId) {
    if (themeId) { D().profile.theme = themeId; Store().save(); }
    document.documentElement.dataset.theme = themeFor(current);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      const bg = getComputedStyle(document.documentElement).getPropertyValue("--bg-0").trim();
      if (bg) meta.setAttribute("content", bg);
    }
  }

  /* ── header + nav ────────────────────────────────────────── */
  function subjectState(id) { const ns = SQ.Subjects.ns(id); return ns && ns.State; }

  function syncHeader() {
    const d = D();
    const bar = U.$("#topbar");
    if (!bar) return;
    const S = current ? subjectState(current) : null;
    const meta = current ? SQ.Subjects.get(current) : null;
    let level, title, into, need, icon;
    if (S && S.data) {
      level = S.data.level; into = S.data.xpIntoLevel; need = S.xpNeeded(level);
      title = S.levelTitle(level); icon = meta.icon;
    } else {
      level = d.overall.level; into = d.overall.xpIntoLevel; need = SQ.Overall.xpNeeded(level);
      title = SQ.Overall.title(level); icon = "★";
    }
    U.$("#avatar-emoji").textContent = d.profile.avatar;
    U.$("#ctx-icon").textContent = icon;
    U.$("#lvl-badge").textContent = "Lv " + level + (S && S.data.prestige ? " ✦" + S.data.prestige : "");
    U.$("#lvl-title").textContent = title;
    U.$("#lvl-xp").textContent = `${U.fmtInt(into)} / ${U.fmtInt(need)} XP`;
    U.$("#xpbar-fill").style.width = U.clamp((into / need) * 100, 0, 100) + "%";
    U.$("#overall-mini").hidden = !S;
    if (S) U.$("#overall-mini").textContent = "★" + d.overall.level;

    const coinPill = U.$("#coin-pill");
    coinPill.hidden = !S;
    if (S) {
      U.$("#coin-icon").textContent = meta.currency.icon;
      coinPill.title = meta.currency.name + " — spend them in the " + meta.name + " shop";
      setCount("#coin-count", S.data.coins, coinPill);
    }
    setCount("#star-count", d.stars, U.$("#star-pill"));
    U.$("#streak-count").textContent = d.streak.count;
    U.$("#streak-pill").classList.toggle("hot", d.streak.count >= 3);
  }
  function setCount(sel, n, pill) {
    const node = U.$(sel);
    const s = U.fmtInt(n);
    if (node.textContent !== s) { node.textContent = s; pulse(pill); }
  }

  const HUB_NAV = [
    { key: "home",     icon: "🏠", label: "Home",     path: "/home" },
    { key: "subjects", icon: "📚", label: "Subjects", path: "/subjects" },
    { key: "arcade",   icon: "🕹️", label: "Arcade",   path: "/arcade" },
    { key: "shop",     icon: "🛒", label: "Shop",     path: "/shop" },
    { key: "progress", icon: "📈", label: "Progress", path: "/progress" }
  ];
  const DEFAULT_SUBJECT_NAV = [
    { key: "home",     icon: "🏠", label: "Home" },
    { key: "play",     icon: "🎮", label: "Play" },
    { key: "study",    icon: "🗂️", label: "Study" },
    { key: "progress", icon: "📈", label: "Progress" },
    { key: "shop",     icon: "🛒", label: "Shop" }
  ];

  function buildNav() {
    const nav = U.$("#navbar");
    if (!nav) return;
    nav.innerHTML = "";
    if (!current) {
      HUB_NAV.forEach(it => nav.appendChild(navItem(it.key, it.icon, it.label, "#" + it.path)));
      return;
    }
    const meta = SQ.Subjects.get(current);
    nav.appendChild(navItem("__hub", "⌂", "All", "#/home", "nav-hub"));
    const items = (subjectCfg[current] && subjectCfg[current].nav) || DEFAULT_SUBJECT_NAV;
    items.forEach(it => nav.appendChild(navItem(it.key, it.key === "home" ? meta.icon : it.icon, it.label,
      "#/s/" + current + "/" + (it.path || it.key).replace(/^\//, ""))));
  }
  function navItem(key, icon, label, href, cls) {
    return U.el("a", { class: "nav-item " + (cls || ""), href, dataset: { nav: key } }, [
      U.el("span", { class: "nav-ico", text: icon }), U.el("span", { text: label })
    ]);
  }
  function highlightNav(subject, name) {
    let key = name;
    if (subject) {
      const map = (subjectCfg[subject] && subjectCfg[subject].navMap) || {};
      key = map[name] || ({ game: "play", boss: "play" })[name] || name;
    } else {
      key = ({ subjects: "subjects", arcade: "arcade", shop: "shop", progress: "progress" })[name] || (name === "home" ? "home" : name);
    }
    U.$$(".nav-item").forEach(a => a.classList.toggle("on", a.dataset.nav === key));
  }

  function pulse(node) {
    if (!node) return;
    node.classList.remove("bump");
    void node.offsetWidth;
    node.classList.add("bump");
  }

  /* ── toasts ──────────────────────────────────────────────── */
  function toast(opts) {
    const o = typeof opts === "string" ? { text: opts } : opts;
    const node = U.el("div", { class: "toast " + (o.kind || ""), role: "status" }, [
      U.el("span", { class: "toast-ico", text: o.icon || "✨" }),
      U.el("span", { html: o.text })
    ]);
    const host = U.$("#toasts");
    host.appendChild(node);
    while (host.children.length > 4) host.firstChild.remove();
    setTimeout(() => { node.classList.add("out"); setTimeout(() => node.remove(), 320); }, o.ms || 2600);
    return node;
  }

  /* ── modals ──────────────────────────────────────────────────
     modal() REPLACES whatever is open — the source apps' semantics, which their
     modes rely on. Pass {stack:true} to open over the current one (a confirm over a
     results screen); closeModal() then pops back to it. Real dialogs: focus moves
     in, Tab is trapped, Esc closes (unless sticky), focus returns on close. */
  const stack = [];

  function modal(content, opts) {
    const o = opts || {};
    const root = U.$("#modal-root");
    if (!o.stack) closeModal(true);
    root.hidden = false;
    const box = U.el("div", {
      class: "modal" + (o.center ? " modal-center" : "") + (o.wide ? " modal-wide" : ""),
      role: "dialog", "aria-modal": "true", tabindex: "-1"
    });
    if (typeof content === "string") box.innerHTML = content;
    else box.appendChild(content);
    stack.forEach(m => (m.box.hidden = true));
    root.appendChild(box);
    const entry = { box, opts: o, returnTo: document.activeElement };
    stack.push(entry);
    root.onclick = e => { const top = stack[stack.length - 1]; if (e.target === root && top && !top.opts.sticky) closeModal(); };
    setTimeout(() => {
      const f = box.querySelector("[autofocus], .btn-primary, button, input, textarea, select");
      (f || box).focus({ preventScroll: true });
    }, 30);
    return { box, close: closeModal };
  }

  function closeModal(all) {
    const root = U.$("#modal-root");
    if (!root) return;
    const n = all === true ? stack.length : 1;
    for (let i = 0; i < n && stack.length; i++) {
      const top = stack.pop();
      top.box.remove();
      if (top.opts.onClose) { try { top.opts.onClose(); } catch (e) { console.warn(e); } }
      if (stack.length === 0 && top.returnTo && top.returnTo.focus && document.contains(top.returnTo)) {
        try { top.returnTo.focus({ preventScroll: true }); } catch (e) { /* ignore */ }
      }
    }
    if (stack.length) stack[stack.length - 1].box.hidden = false;
    else { root.hidden = true; root.innerHTML = ""; root.onclick = null; }
  }
  const modalOpen = () => stack.length > 0;

  document.addEventListener("keydown", e => {
    if (!stack.length) return;
    const top = stack[stack.length - 1];
    if (e.key === "Escape" && !top.opts.sticky) { e.preventDefault(); closeModal(); return; }
    if (e.key === "Tab") {
      const f = U.$$('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])', top.box)
        .filter(n => !n.disabled && n.offsetParent !== null);
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  function confirmDialog(title, body, onYes, yesLabel, opts) {
    const o = opts || {};
    modal(U.el("div", {}, [
      U.el("h2", { text: title }),
      U.el("p", { html: body }),
      U.el("div", { class: "row", style: "margin-top:16px" }, [
        U.el("button", { class: "btn btn-ghost", text: o.noLabel || "Cancel", on: { click: () => closeModal() } }),
        U.el("div", { class: "spacer" }),
        U.el("button", {
          class: "btn " + (o.danger ? "btn-danger" : "btn-primary"), text: yesLabel || "Confirm",
          on: { click: () => { closeModal(); onYes(); } }
        })
      ])
    ]), { stack: modalOpen() });
  }

  /* ── the reward pipeline ─────────────────────────────────────
   * award(subjectId, opts)  — subjects call their bound UI.award(opts).
   *
   * opts: { xp, bonus, accuracy, answered, coins, pace, at, silent, raw, boost, label }
   *   xp        per-answer XP the mode already netted (wrong answers subtracted,
   *             rushed answers unpaid — those gates live in the modes, at the answer)
   *   bonus     completion bonus: withheld ENTIRELY below 50% accuracy or when fewer
   *             than 5 answers were given, otherwise scaled by accuracy
   *   coins     the subject's coins at face value; scaled by the subject's coin rate
   *   boost     an extra multiplier (Double XP). Capped with everything else at ×4
   *   raw       skip multipliers and rates (daily/quest payouts already computed)
   */
  function award(subjectId, opts) {
    const o = opts || {};
    const S = subjectState(subjectId);
    const cfg = subjectCfg[subjectId] || {};

    let bonus = Math.max(0, o.bonus || 0);
    let rawXp = Math.max(0, o.xp || 0);
    let rawCoins = Math.max(0, o.coins || 0);
    /* The all-too-fast gate (Physics): a run where EVERY response came faster than the
       read floor pays nothing at all — XP, bonus and coins. pace: { items, tooFast }. */
    if (o.pace && o.pace.items > 0 && o.pace.tooFast >= o.pace.items) { rawXp = 0; bonus = 0; rawCoins = 0; }
    if (o.accuracy !== undefined) {
      const acc = U.clamp(o.accuracy, 0, 1);
      bonus = acc < MIN_BONUS_ACCURACY ? 0 : Math.round(bonus * acc);
    }
    if (o.answered !== undefined && o.answered < 5) bonus = 0;

    const mult = o.raw ? 1 : Math.min(E.MAX_MULTIPLIER, S.xpMultiplier() * (o.boost || 1));
    const crutch = o.raw ? 1 : formulaPenalty();
    const xp = Math.max(0, Math.round((rawXp + bonus) * mult * crutch));
    const coinRate = o.raw ? 1 : (cfg.coinRate === undefined ? 0.6 : cfg.coinRate);
    /* Coins follow the XP: a run that paid nothing pays no coins, and the tool tray's
       off-sheet charge applies to coins as well (as it did in Physics). */
    const coins = xp <= 0 && o.pace ? 0 : Math.max(0, Math.round(rawCoins * coinRate * crutch));
    const stars = o.raw && !o.starsFromRaw ? 0 : Math.round(xp * E.STAR_RATE);

    if (coins) S.addCoins(coins, true);
    const res = xp ? S.addXP(xp) : { levelsGained: 0, newLevel: S.data.level };
    const ov = xp ? SQ.Overall.addXP(xp, subjectId) : { levelsGained: 0, newLevel: D().overall.level, stars: 0 };
    if (stars) SQ.Overall.addStars(stars, true);
    if (!xp && coins) S.emit();
    Object.assign(res, { xp, coins, stars, multiplier: mult, formulaCrutch: crutch, overall: ov });

    if (o.at && xp && !o.silent && o.at.getBoundingClientRect) {
      const r = o.at.getBoundingClientRect();
      SQ.FX.floatText(r.left + r.width / 2 - 20, r.top - 6, "+" + xp + " XP");
    }
    if ((coins || stars) && !o.silent && SQ.Sound) SQ.Sound.coin();
    celebrate(subjectId, res, ov);
    syncHeader();
    return res;
  }

  /** Extra XP paid outside a run (a subject's daily or weekly) — still through the
      one pipeline, so it reaches the overall level and Stars. */
  function payExtra(subjectId, xp, label, opts) {
    return award(subjectId, Object.assign({ xp, raw: true, starsFromRaw: true, label }, opts || {}));
  }

  function celebrate(subjectId, res, ov) {
    const S = subjectState(subjectId);
    const meta = SQ.Subjects.get(subjectId);
    if (res.levelsGained > 0) {
      if (SQ.Sound) SQ.Sound.levelUp();
      SQ.FX.confetti(110);
      toast({ icon: "🎉", kind: "xp", ms: 3600,
        text: `<b>${U.escapeHtml(meta.short)} level ${res.newLevel}!</b> ${U.escapeHtml(S.levelTitle(res.newLevel))}` +
              (res.levelCoins ? ` &middot; +${res.levelCoins} ${meta.currency.icon}` : "") });
      if (res.newLevel >= S.MAX_LEVEL) setTimeout(() => toast({ icon: "🔱", kind: "good", ms: 5000,
        text: `<b>Level ${S.MAX_LEVEL} in ${U.escapeHtml(meta.name)}.</b> You can now Ascend from its Progress screen.` }), 1200);
    }
    if (ov && ov.levelsGained > 0) {
      setTimeout(() => {
        if (SQ.Sound) SQ.Sound.rankUp ? SQ.Sound.rankUp() : SQ.Sound.levelUp();
        toast({ icon: "★", kind: "xp", ms: 3800,
          text: `<b>Overall level ${ov.newLevel}!</b> ${U.escapeHtml(SQ.Overall.title(ov.newLevel))} &middot; +${ov.stars} ⭐` });
      }, res.levelsGained ? 900 : 0);
    }
    const unlocked = (S.checkAchievements() || []).map(a => ({ a, cur: meta.currency.icon }))
      .concat(SQ.Overall.checkAchievements().map(a => ({ a, cur: "⭐" })));
    unlocked.forEach((u, i) => setTimeout(() => {
      if (SQ.Sound) SQ.Sound.achievement();
      SQ.FX.confetti(60);
      toast({ icon: u.a.icon || "🏆", kind: "good", ms: 3800,
        text: `<b>${U.escapeHtml(u.a.name)}</b> unlocked${u.a.reward ? ` &middot; +${u.a.reward} ${u.cur}` : ""}` });
    }, 500 + i * 900));
  }

  /** The tool tray's latched off-sheet charge for this run (1 when unused). */
  function formulaPenalty() {
    return SQ.Tools && SQ.Tools.penalty ? SQ.Tools.penalty() : 1;
  }

  /** Maths Standard's read floor: an answer faster than this cannot have involved
      reading the question, and pays nothing. 1200 ms + 12 ms/word, capped at 4 s. */
  function readFloor(text) {
    return U.clamp(MIN_READ_MS + 12 * U.words(text), MIN_READ_MS, 4000);
  }

  /* ── shared game chrome ──────────────────────────────────── */
  /**
   * gameShell(subjectId, title, opts) → { root, body, meta, head }
   * opts: { backTo, confirmExit, help, tools:false | {calc,sheet,pad}, scored, sheet }
   * Mounts the shared tool tray (calculator, the subject's reference sheet, working
   * pad) and resets its run-scoped crutch latch.
   */
  function gameShell(subjectId, title, opts) {
    const o = opts || {};
    const backTo = o.backTo || "/play";
    const meta = U.el("div", { class: "gmeta" });
    const body = U.el("div", { class: "grid" });
    const leave = () => bound(subjectId).go(backTo);
    const back = U.el("button", {
      class: "btn btn-sm btn-ghost", text: "← Back",
      on: { click: () => {
        if (o.confirmExit) confirmDialog("Quit this run?", "Your progress in this run will be lost.", leave, "Quit");
        else leave();
      } }
    });
    const head = U.el("div", { class: "ghead" }, [back, U.el("div", { class: "gtitle", text: title }), meta]);
    if (o.help) {
      head.insertBefore(U.el("button", {
        class: "btn btn-sm btn-ghost", text: "?", title: "How this mode works", "aria-label": "How this mode works",
        on: { click: () => modal(U.el("div", {}, [
          U.el("h2", { text: title }),
          U.el("p", { html: o.help }),
          U.el("button", { class: "btn btn-primary btn-block", text: "Got it", on: { click: () => closeModal() } })
        ]), { stack: modalOpen() }) }
      }), meta);
    }
    const tools = o.tools === undefined ? (subjectCfg[subjectId] || {}).tools : o.tools;
    if (SQ.Tools && tools !== false) {
      SQ.Tools.mount(Object.assign({ subject: subjectId, scored: o.scored !== false }, typeof tools === "object" ? tools : {}, o.toolOpts || {}));
    }
    return { root: U.el("div", { class: "gshell" }, [head, body]), body, meta, head };
  }

  function rank(accuracy, bonus) {
    const score = accuracy + (bonus || 0);
    if (score >= 97) return { rank: "S", cls: "rank-s", blurb: "Flawless. Band 6 energy." };
    if (score >= 88) return { rank: "A", cls: "rank-a", blurb: "Excellent — you know this cold." };
    if (score >= 75) return { rank: "B", cls: "rank-b", blurb: "Solid. Tighten up the tricky ones." };
    if (score >= 60) return { rank: "C", cls: "rank-c", blurb: "Getting there. Review your mistakes." };
    return { rank: "D", cls: "rank-d", blurb: "Rough run — the flashcards for this topic will help." };
  }

  /**
   * results(subjectId, opts)
   * opts: { title, correct, total, xp, coins, stars, extraStats:[[label,value]], newBest,
   *         onAgain, onReview, bonus, backTo, blurb, perfect }
   * `onReview` adds "Review the working", which closes the modal WITHOUT leaving the
   * run, with a floating button to reopen the results (Chemistry / Maths Standard).
   */
  function results(subjectId, opts) {
    const o = opts;
    const meta = SQ.Subjects.get(subjectId);
    const acc = U.pct(o.correct, o.total);
    const r = rank(acc, o.bonus);
    const perfect = o.perfect !== undefined ? o.perfect : (o.total > 0 && o.correct === o.total);
    if (perfect) SQ.Overall.noteRun({ perfect: true, subject: subjectId });
    else SQ.Overall.noteRun({ perfect: false, subject: subjectId });

    if (SQ.Sound) {
      if (perfect) { SQ.Sound.perfect ? SQ.Sound.perfect() : SQ.Sound.win(); SQ.FX.confetti(140); }
      else if (acc >= 60) { SQ.Sound.win(); SQ.FX.confetti(70); }
      else SQ.Sound.lose();
    }

    const cells = [["Correct", `${o.correct}/${o.total}`], ["Accuracy", acc + "%"], ["XP", "+" + (o.xp || 0)]]
      .concat(o.extraStats || []);
    const looks = SQ.Tools && SQ.Tools.lookups ? SQ.Tools.lookups() : [];
    if (looks && looks.length) cells.push(["Off-sheet lookups", looks.length + " · ×" + formulaPenalty().toFixed(2)]);
    /* Named, not just counted: a charge the student can't attribute to anything
       reads as a bug, and naming it is what teaches which formulas to memorise. */
    const lookNote = looks && looks.length
      ? U.el("p", { class: "tiny muted", text: "Paid for: " + looks.map(l => l.name || l.id).join(", ") }) : null;

    const earned = [];
    if (o.coins) earned.push(`<b>${o.coins}</b> ${meta.currency.icon} ${U.escapeHtml(meta.currency.name)}`);
    const stars = o.stars !== undefined ? o.stars : Math.round((o.xp || 0) * E.STAR_RATE);
    if (stars) earned.push(`<b>${stars}</b> ⭐ Stars`);

    const S = bound(subjectId);
    const show = () => modal(U.el("div", { class: "modal-center" }, [
      U.el("div", { class: "modal-big " + r.cls, text: r.rank }),
      U.el("h2", { class: "modal-center", text: o.title || "Run complete", style: "justify-content:center" }),
      U.el("p", { text: o.blurb || r.blurb }),
      o.newBest ? U.el("div", { class: "chip on", text: "🏅 New personal best!" }) : null,
      U.el("div", { class: "result-grid" }, cells.map(([lbl, val]) =>
        U.el("div", { class: "result-cell" }, [
          U.el("div", { class: "result-num", text: String(val) }),
          U.el("div", { class: "result-lbl", text: lbl })
        ]))),
      earned.length ? U.el("p", { class: "muted", html: "Earned " + earned.join(" &middot; ") }) : null,
      lookNote,
      U.el("div", { class: "row wrap", style: "margin-top:8px; gap:8px" }, [
        U.el("button", { class: "btn btn-ghost btn-sm", text: "Back",
          on: { click: () => { closeModal(); S.go(o.backTo || "/play"); } } }),
        o.onReview ? U.el("button", { class: "btn btn-ghost btn-sm js-review", text: "Review the working",
          on: { click: () => { closeModal(); reopenChip(show); if (typeof o.onReview === "function") o.onReview(); } } }) : null,
        U.el("div", { class: "spacer" }),
        o.onAgain ? U.el("button", { class: "btn btn-primary js-again", text: "Play again",
          on: { click: () => { closeModal(); o.onAgain(); } } }) : null
      ])
    ]), { sticky: true });
    /* Opened on a short delay so the last answer's feedback is seen first, and so a
       double-tap on the final choice cannot land on "Play again". */
    setTimeout(show, o.delay === undefined ? 350 : o.delay);
  }
  function reopenChip(show) {
    const b = U.el("button", { class: "btn btn-primary reopen-results", text: "Show results",
      on: { click: () => { b.remove(); show(); } } });
    document.body.appendChild(b);
    onLeave(() => b.remove());
  }

  function chip(text, cls) { return U.el("span", { class: "chip " + (cls || ""), text }); }

  /* ── binding: a subject's view of the UI ─────────────────────
     A ported subject does `CHEM.UI = SQ.UI.bind("chem", {...})` and keeps calling
     UI.route / UI.go / UI.award / UI.gameShell / UI.results as before. Paths are
     resolved inside the subject ("/play" → "#/s/chem/play") unless their first
     segment is one of `globalRoutes` (the arcade and settings are the app's). */
  const bindings = {};
  const GLOBAL = ["arcade", "settings", "hub", "subjects", "general-shop"];

  function bound(id) { return bindings[id] || bind(id); }

  function bind(id, cfg) {
    subjectCfg[id] = Object.assign(subjectCfg[id] || {}, cfg || {});
    if (bindings[id]) return Object.assign(bindings[id], cfg && cfg.extend || {});
    const table = subjectRoutes[id] || (subjectRoutes[id] = {});
    const globals = (subjectCfg[id].globalRoutes || GLOBAL);
    function resolve(path) {
      const p = String(path || "").replace(/^#?\/?/, "");
      const first = p.split("/")[0];
      if (first === "s" || first === "hub") return "/" + (first === "hub" ? "home" : p);
      if (globals.indexOf(first) >= 0) return "/" + (first === "general-shop" ? "shop" : p);
      return "/s/" + id + "/" + p;
    }
    const b = {
      subject: id,
      route: (name, fn) => { table[String(name).replace(/^\//, "")] = fn; },
      go: path => go(resolve(path)),
      href: path => "#" + resolve(path),
      resolve,
      award: o => award(id, o),
      payExtra: (xp, label, o) => payExtra(id, xp, label, o),
      gameShell: (title, o) => gameShell(id, title, o),
      results: o => results(id, o),
      toast, modal, closeModal, confirmDialog, confirm: confirmDialog, chip, rank, onLeave, pulse,
      syncHeader, applyTheme: t => setSubjectTheme(id, t), formulaPenalty, readFloor,
      modalOpen, MIN_BONUS_ACCURACY, MIN_READ_MS,
      /** Re-run the current route — every lineage mode's "Play again". */
      handleRoute: () => handleRoute(), reload: () => handleRoute(),
      get current() { return current; },
      init: () => {}          // the app boots the router, not the subject
    };
    bindings[id] = Object.assign(b, (cfg && cfg.extend) || {});
    return bindings[id];
  }

  function setSubjectTheme(id, themeId) {
    const slot = D().subjects[id];
    if (slot) { slot.settings.theme = themeId || null; Store().save(); }
    applyTheme();
  }

  /* ── boot ────────────────────────────────────────────────── */
  function init() {
    window.addEventListener("hashchange", handleRoute);
    Store().onChange(syncHeader);
    buildNav();
    handleRoute();
  }

  return {
    route, go, init, handleRoute, onLeave, context, syncHeader, applyTheme, themeFor, buildNav,
    toast, modal, closeModal, modalOpen, confirmDialog, award, payExtra, gameShell, results,
    rank, chip, pulse, formulaPenalty, readFloor, bind, bound, setSubjectTheme,
    MIN_BONUS_ACCURACY, MIN_READ_MS, parseHash
  };
})();
