/* THE SHARED ARCADE — SQ.Arcade
   ============================================================================
   Six engines (crush, runner, merge, pairs, phagocyte, catch), each dressed by
   subject SKINS (js/arcade/skins.js). One clock, one lobby, one play shell.

   THE ARCADE PAYS NOTHING. No XP, no Stars, no subject coins, no achievements —
   only a high score in data.arcade.scores[game]. That rule is structural: nothing
   under js/arcade/ calls into the reward pipeline, the overall level or any
   subject State, and tests/arcade/arcade.js greps this directory to prove it,
   then plays every game and checks the ledgers did not move. Every source app
   carried the same rule for the same reason — a game that paid even a trickle
   would out-earn studying per minute.

   Time
     data.arcade.seconds      shared by every game; tickets add to it
     data.arcade.allDayUntil  local midnight; while now < it nothing is burnt
   The clock only burns while a game is on screen, the page is visible and no
   modal is open. It is driven from the play shell's animation frame, measured in
   real elapsed time and clamped per frame, so a throttled or backgrounded tab can
   never be charged for time it did not show. Leaving the route stops everything
   (SQ.UI.onLeave). A game refuses to start on an empty meter and offers the shop.

   Gates
     the arcade opens at overall level SQ.Economy.ARCADE_UNLOCK_LEVEL; each game
     may also carry its own overall-level gate (`level`).

   Game contract (games register themselves):
     SQ.Arcade.register({ id, name, icon, colour, blurb, how, level,
                          start(stage, session) → { destroy, pause?, resume?, state? } })
   session: { game, skin, data (skin.data), reduced, sound, setScore, addScore,
              score, best, isOver, running, gameOver(detail, extra),
              loop(fn(dtSeconds)), later(fn, ms), listen(target, ev, fn, opts) }
   ============================================================================ */
window.SQ = window.SQ || {};

SQ.Arcade = (function () {
  const U = SQ.U, E = SQ.Economy;
  const D = () => SQ.Store.data;
  const UI = () => SQ.UI;

  const games = [];
  const byId = {};
  const skins = [];
  const skinById = {};

  /* ── registry ─────────────────────────────────────────────── */
  function register(def) {
    if (byId[def.id]) Object.assign(byId[def.id], def);
    else { games.push(def); byId[def.id] = def; }
    api.games[def.id] = def;
    return def;
  }
  const game = id => byId[id] || null;
  const list = () => games.slice();

  function defineSkins(arr) {
    arr.forEach(s => {
      if (skinById[s.id]) Object.assign(skinById[s.id], s);
      else { skins.push(s); skinById[s.id] = s; }
    });
  }
  const skin = id => skinById[id] || null;
  const defaultSkin = gameId => skins.find(s => s.game === gameId && !s.subject) || null;
  const allSkins = gameId => skins.filter(s => !gameId || s.game === gameId);

  /* ── save shape ───────────────────────────────────────────── */
  function store() {
    const d = D();
    const a = d.arcade || (d.arcade = {});
    if (typeof a.seconds !== "number" || !isFinite(a.seconds)) a.seconds = 0;
    if (typeof a.allDayUntil !== "number") a.allDayUntil = 0;
    a.scores = a.scores || {};
    a.played = a.played || {};
    a.skin = a.skin || {};
    d.owned = d.owned || {};
    if (!Array.isArray(d.owned.skins)) d.owned.skins = [];
    return a;
  }

  /* ── skins: owned in data.owned.skins, equipped in data.arcade.skin[game] ── */
  const ownsSkin = id => { const s = skin(id); return !!s && (!s.subject || store() && D().owned.skins.includes(id)); };

  /** The skin a game will wear: the equipped one if it is owned, else the free default. */
  function skinFor(gameId) {
    const eq = store().skin[gameId];
    if (eq && ownsSkin(eq) && skin(eq).game === gameId) return skin(eq);
    return defaultSkin(gameId);
  }
  function ownedSkins(gameId) { return allSkins(gameId).filter(s => ownsSkin(s.id)); }

  function equip(gameId, skinId) {
    const s = skin(skinId);
    if (!s || s.game !== gameId || !ownsSkin(skinId)) return false;
    store().skin[gameId] = skinId;
    SQ.Store.emit();
    return true;
  }

  /** For the subject shops: that subject's skins, cheapest first.
      [{ id, game, name, icon, desc, price, level }] — `level` is a SUBJECT level. */
  function skinsFor(subjectId) {
    return skins.filter(s => s.subject === subjectId)
      .map(s => {
        const g = game(s.game);
        return { id: s.id, game: s.game, name: s.name, icon: s.icon,
                 desc: s.desc + (g ? " <span class=\"tiny muted\">(" + U.escapeHtml(g.name) + ")</span>" : ""),
                 price: s.price, level: s.level };
      })
      .sort((a, b) => a.price - b.price);
  }

  /* ── time ─────────────────────────────────────────────────── */
  function endOfToday(now) {
    const e = new Date(now || Date.now());
    e.setHours(24, 0, 0, 0);            // local midnight tonight
    return e.getTime();
  }
  const allDay = () => Date.now() < (store().allDayUntil || 0);
  const secondsLeft = () => Math.max(0, Math.floor(store().seconds || 0));
  const hasTime = () => allDay() || secondsLeft() > 0;

  /** Called by the general shop AFTER it has charged for the ticket. */
  function grantTicket(t) {
    if (!t) return false;
    const a = store();
    if (t.allDay) a.allDayUntil = Math.max(a.allDayUntil || 0, endOfToday());
    else a.seconds = secondsLeft() + Math.round((t.mins || t.minutes || 0) * 60);
    SQ.Store.emit();
    if (SQ.Sound && SQ.Sound.ticket) SQ.Sound.ticket();
    if (UI() && UI().toast) UI().toast({ icon: "🎟️", kind: "good",
      text: t.allDay ? "<b>All-day pass</b> — unlimited arcade until midnight."
                     : "<b>" + U.escapeHtml(t.name || (t.mins + " minutes")) + "</b> added to the arcade meter." });
    return true;
  }

  function timeLabel() {
    if (allDay()) return "All day";
    return U.fmtTime(secondsLeft());
  }

  /* ── gates ────────────────────────────────────────────────── */
  const overallLevel = () => (D().overall && D().overall.level) || 1;
  const unlocked = () => overallLevel() >= E.ARCADE_UNLOCK_LEVEL;
  const gameLevel = g => Math.max(E.ARCADE_UNLOCK_LEVEL, g.level || 0);
  const gameUnlocked = g => overallLevel() >= gameLevel(g);

  /* ── scores: the only thing the arcade keeps ──────────────── */
  const best = id => store().scores[id] || 0;
  function recordScore(id, score) {
    const a = store();
    const n = Math.max(0, Math.round(score || 0));
    a.played[id] = (a.played[id] || 0) + 1;
    const isBest = n > (a.scores[id] || 0);
    if (isBest) a.scores[id] = n;
    SQ.Store.save();
    return isBest;
  }

  const reducedMotion = () => !!(SQ.FX && SQ.FX.isReduced && SQ.FX.isReduced());
  const sfx = (name, arg) => { try { if (SQ.Sound && SQ.Sound[name]) SQ.Sound[name](arg); } catch (e) { /* audio is optional */ } };

  /* ── the lobby: #/arcade ──────────────────────────────────── */
  function lobby(view) {
    const d = D();
    const a = store();
    const rerender = () => { const y = window.scrollY; view.innerHTML = ""; lobby(view); window.scrollTo(0, y); };

    const timeText = allDay()
      ? "All-day pass · until midnight"
      : secondsLeft() > 0 ? U.fmtTime(secondsLeft()) + " left" : "No time on the meter";
    view.appendChild(U.el("div", { class: "hero arc-hero" }, [
      U.el("h1", { text: "🕹️ Arcade" }),
      U.el("p", { class: "muted", html: "Shared by every subject. It pays <b>nothing</b> — no XP, no Stars, no coins, " +
        "no achievements — only high scores. The meter only runs while a game is on screen." }),
      U.el("div", { class: "row arc-meter" }, [
        U.el("div", { class: "arc-time" + (hasTime() ? " on" : ""), dataset: { role: "time" } }, [
          U.el("span", { class: "arc-time-ico", text: allDay() ? "🎟️" : "⏱️" }),
          U.el("b", { class: "js-arc-time", text: timeText })
        ]),
        U.el("div", { class: "spacer" }),
        U.el("a", { class: "btn btn-primary btn-sm", href: "#/shop/arcade", text: "Buy tickets ⭐" })
      ])
    ]));

    if (!unlocked()) {
      view.appendChild(U.el("div", { class: "card arc-locked" }, [
        U.el("h3", { text: "🔒 Opens at overall level " + E.ARCADE_UNLOCK_LEVEL }),
        U.el("p", { class: "muted", style: "margin:0", html: "You are overall level <b>" + overallLevel() +
          "</b>. Study in any subject to level up — every subject's XP counts." })
      ]));
    }

    const grid = U.el("div", { class: "arc-grid" });
    games.forEach(g => {
      const locked = !gameUnlocked(g);
      const sk = skinFor(g.id);
      const owned = ownedSkins(g.id);
      const more = allSkins(g.id).filter(s => s.subject && !ownsSkin(s.id));
      const picker = U.el("div", { class: "arc-skins", role: "group", "aria-label": g.name + " skin" },
        owned.map(s => U.el("button", {
          class: "chip chip-btn arc-skin" + (s.id === sk.id ? " on" : ""), type: "button",
          dataset: { skin: s.id, game: g.id }, "aria-pressed": s.id === sk.id ? "true" : "false",
          title: s.desc ? s.desc.replace(/<[^>]*>/g, "") : s.name,
          text: s.icon + " " + s.name,
          on: { click: () => { if (equip(g.id, s.id)) { sfx("equip"); rerender(); } } }
        })));
      const card = U.el("div", { class: "card arc-card" + (locked ? " locked" : ""), dataset: { game: g.id },
        style: "--gc:" + (g.colour || "var(--accent)") }, [
        U.el("div", { class: "arc-card-head" }, [
          U.el("div", { class: "arc-card-ico", text: sk.icon || g.icon }),
          U.el("div", { class: "arc-card-t" }, [
            U.el("div", { class: "game-name", text: sk.title || g.name }),
            U.el("div", { class: "tiny muted", text: g.blurb })
          ])
        ]),
        U.el("div", { class: "row arc-card-foot" }, [
          U.el("span", { class: "chip", text: "🏆 " + U.fmtInt(best(g.id)) }),
          locked ? U.el("span", { class: "chip", text: "🔒 Overall Lv " + gameLevel(g) }) : null,
          U.el("div", { class: "spacer" }),
          locked
            ? U.el("button", { class: "btn btn-sm", disabled: true, text: "Locked" })
            : U.el("a", { class: "btn btn-sm btn-primary arc-play", href: "#/arcade/" + g.id, text: "▶ Play" })
        ]),
        U.el("div", { class: "tiny muted arc-skin-lbl", text: "Skin" }),
        picker,
        more.length ? U.el("div", { class: "tiny muted arc-more", html: "More skins in subject shops: " +
          more.map(s => { const m = SQ.Subjects.get(s.subject); return U.escapeHtml((m ? m.icon + " " : "") + s.name); }).join(" · ") }) : null
      ]);
      grid.appendChild(card);
    });
    view.appendChild(grid);

    view.appendChild(U.el("div", { class: "card", style: "margin-top:16px" }, [
      U.el("h3", { text: "Why it pays nothing" }),
      U.el("p", { class: "tiny muted", style: "margin:0", text:
        "Stars come from studying; the arcade is what they are for. If a game paid even a little, " +
        "playing it would beat studying per minute — so your levels only ever reflect real study." })
    ]));

    /* Keep the meter honest if a pass expires at midnight while the lobby is open. */
    const iv = setInterval(() => {
      const n = U.$(".js-arc-time", view);
      if (!n) return;
      n.textContent = allDay() ? "All-day pass · until midnight"
        : secondsLeft() > 0 ? U.fmtTime(secondsLeft()) + " left" : "No time on the meter";
    }, 1000);
    UI().onLeave(() => clearInterval(iv));
  }

  /* ── the refusal: no time, or locked ──────────────────────── */
  function refuse(view, g, why) {
    view.appendChild(U.el("div", { class: "row", style: "margin-bottom:12px" }, [
      U.el("a", { class: "btn btn-sm btn-ghost", href: "#/arcade", text: "← Arcade" })
    ]));
    const noTime = why === "time";
    const box = () => U.el("div", { class: "modal-center" }, [
      U.el("div", { class: "modal-big", text: noTime ? "🎟️" : "🔒" }),
      U.el("h2", { style: "justify-content:center", text: noTime ? "No arcade time" : "Locked" }),
      U.el("p", { html: noTime
        ? "The arcade meter is empty. Tickets are bought with Stars in the general shop."
        : "Reach overall level <b>" + gameLevel(g) + "</b> to play " + U.escapeHtml(g.name) + "." }),
      U.el("div", { class: "row", style: "margin-top:8px" }, [
        U.el("button", { class: "btn btn-ghost btn-sm", text: "Back to arcade",
          on: { click: () => { UI().closeModal(); UI().go("/arcade"); } } }),
        U.el("div", { class: "spacer" }),
        noTime ? U.el("button", { class: "btn btn-primary js-to-shop", text: "Buy time ⭐",
          on: { click: () => { UI().closeModal(); UI().go("/shop/arcade"); } } }) : null
      ])
    ]);
    view.appendChild(U.el("div", { class: "card arc-refuse", dataset: { refuse: why } }, [
      U.el("h2", { text: (g.icon || "🕹️") + " " + g.name }),
      U.el("p", { html: noTime ? "<b>Out of arcade time.</b> Buy a ticket to play." :
        "<b>Locked</b> until overall level " + gameLevel(g) + "." }),
      noTime ? U.el("a", { class: "btn btn-primary", href: "#/shop/arcade", text: "Buy time in the shop ⭐" }) : null
    ]));
    UI().modal(box(), { center: true });
  }

  /* ── the play shell: #/arcade/<game> ──────────────────────── */
  let live = null;           // the running session, for tests and for teardown

  function play(view, id) {
    const g = game(id);
    if (!g) { UI().go("/arcade"); return; }
    if (!unlocked() || !gameUnlocked(g)) return refuse(view, g, "locked");
    if (!hasTime()) return refuse(view, g, "time");
    launch(view, g);
  }

  function launch(view, g) {
    view.innerHTML = "";
    const sk = skinFor(g.id);
    const title = sk.title || g.name;

    const scoreChip = U.el("span", { class: "chip arc-score", text: "0" });
    const bestChip = U.el("span", { class: "chip", text: "🏆 " + U.fmtInt(best(g.id)) });
    const timeChip = U.el("span", { class: "timer-ring arc-clock", role: "timer", "aria-live": "off", text: timeLabel() });
    const head = U.el("div", { class: "ghead arc-head" }, [
      U.el("a", { class: "btn btn-sm btn-ghost", href: "#/arcade", text: "← Arcade" }),
      U.el("div", { class: "gtitle", text: (sk.icon || g.icon) + " " + title }),
      U.el("div", { class: "gmeta" }, [scoreChip, bestChip, timeChip])
    ]);
    const stage = U.el("div", { class: "arcade-stage", dataset: { game: g.id, skin: sk.id } });
    const how = U.el("p", { class: "tiny muted arc-how", html: (sk.how || g.how || "") +
      " <span class=\"arc-pays\">Pays nothing — high score only.</span>" });
    view.appendChild(U.el("div", { class: "gshell arc-shell" }, [head, how, stage]));

    let score = 0, over = false, dead = false, raf = null, lastFrame = 0, lastClock = 0;
    let burnAcc = 0, sinceSave = 0, hidden = document.visibilityState === "hidden", wasRunning = true;
    const loops = [], timers = new Set(), listeners = [];
    let gameApi = null;

    const running = () => !over && !dead && !hidden && !(UI().modalOpen && UI().modalOpen());

    const session = {
      game: g.id, skin: sk, data: sk.data || {}, reduced: reducedMotion(), sound: sfx,
      get score() { return score; },
      get best() { return best(g.id); },
      setScore(n) {
        score = Math.max(0, Math.round(n || 0));
        scoreChip.textContent = U.fmtInt(score);
      },
      addScore(n) { session.setScore(score + (n || 0)); },
      isOver: () => over || dead,
      running,
      loop(fn) { loops.push(fn); },
      later(fn, ms) {
        const t = setTimeout(() => { timers.delete(t); if (!dead) fn(); }, ms);
        timers.add(t);
        return t;
      },
      listen(target, ev, fn, opts) { target.addEventListener(ev, fn, opts); listeners.push([target, ev, fn, opts]); },
      gameOver(detail, extra) { finish(detail, extra); }
    };

    /* One frame driver: game loops and the clock, both only while running. */
    function frame(now) {
      if (dead) return;
      raf = requestAnimationFrame(frame);
      const isRunning = running();
      if (isRunning !== wasRunning) {
        wasRunning = isRunning;
        if (gameApi && gameApi[isRunning ? "resume" : "pause"]) { try { gameApi[isRunning ? "resume" : "pause"](); } catch (e) { console.warn(e); } }
      }
      const dt = Math.min(0.05, Math.max(0, (now - lastFrame) / 1000));
      const real = Math.min(1, Math.max(0, (now - lastClock) / 1000));
      lastFrame = now; lastClock = now;
      if (!isRunning) return;
      for (let i = 0; i < loops.length; i++) {
        try { loops[i](dt); } catch (e) { console.error(e); dead = true; return; }
        if (dead || over) break;
      }
      burn(real);
    }

    function burn(sec) {
      if (over || dead) return;
      burnAcc += sec;
      if (burnAcc < 1) return;
      const whole = Math.floor(burnAcc);
      burnAcc -= whole;
      const a = store();
      const st = D().stats || (D().stats = {});
      st.arcadeSeconds = (st.arcadeSeconds || 0) + whole;
      if (!allDay()) a.seconds = Math.max(0, secondsLeft() - whole);
      sinceSave += whole;
      if (sinceSave >= 5) { sinceSave = 0; SQ.Store.save(); }
      timeChip.textContent = timeLabel();
      const left = secondsLeft();
      timeChip.classList.toggle("low", !allDay() && left <= 20);
      if (!allDay() && left <= 5 && left > 0) sfx("tickUrgent");
      if (!allDay() && left <= 0) expire();
    }

    function onVis() {
      hidden = document.visibilityState === "hidden";
      lastClock = lastFrame = performance.now();
      if (hidden) SQ.Store.flush();
    }
    document.addEventListener("visibilitychange", onVis);

    function teardown() {
      if (dead) return;
      dead = true;
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVis);
      timers.forEach(t => clearTimeout(t));
      timers.clear();
      listeners.forEach(([t, ev, fn, o]) => t.removeEventListener(ev, fn, o));
      listeners.length = 0;
      if (gameApi && gameApi.destroy) { try { gameApi.destroy(); } catch (e) { console.warn(e); } }
      if (live && live.session === session) live = null;
      SQ.Store.flush();
    }
    UI().onLeave(teardown);

    function cell(n, l) {
      return U.el("div", { class: "result-cell" }, [
        U.el("div", { class: "result-num", text: String(n) }),
        U.el("div", { class: "result-lbl", text: l })
      ]);
    }

    function finish(detail, extra) {
      if (over || dead) return;
      over = true;
      if (gameApi && gameApi.pause) { try { gameApi.pause(); } catch (e) { /* ignore */ } }
      const isBest = recordScore(g.id, score);
      bestChip.textContent = "🏆 " + U.fmtInt(best(g.id));
      if (isBest && score > 0) { sfx("rankUp"); if (!session.reduced && SQ.FX) SQ.FX.confetti(50); } else sfx("lose");
      const again = hasTime();
      UI().modal(U.el("div", { class: "modal-center arc-over" }, [
        U.el("div", { class: "modal-big", text: sk.icon || g.icon }),
        U.el("h2", { style: "justify-content:center", text: isBest && score > 0 ? "New high score!" : "Game over" }),
        detail ? U.el("p", { text: detail }) : null,
        U.el("div", { class: "result-grid" }, [
          cell(U.fmtInt(score), "Score"), cell(U.fmtInt(best(g.id)), "Best"), cell(timeLabel(), "Time left")
        ].concat((extra || []).map(([l, v]) => cell(v, l)))),
        U.el("p", { class: "tiny muted", text: "No XP, no Stars, no coins — the arcade never pays." }),
        U.el("div", { class: "row", style: "margin-top:8px" }, [
          U.el("button", { class: "btn btn-ghost btn-sm", text: "Back to arcade",
            on: { click: () => { UI().closeModal(); UI().go("/arcade"); } } }),
          U.el("div", { class: "spacer" }),
          again
            ? U.el("button", { class: "btn btn-primary js-again", text: "Play again",
                on: { click: () => { UI().closeModal(); teardown(); launch(view, g); } } })
            : U.el("button", { class: "btn btn-primary js-to-shop", text: "Buy time ⭐",
                on: { click: () => { UI().closeModal(); UI().go("/shop/arcade"); } } })
        ])
      ]), { sticky: true });
    }

    function expire() {
      if (over || dead) return;
      over = true;
      if (gameApi && gameApi.pause) { try { gameApi.pause(); } catch (e) { /* ignore */ } }
      recordScore(g.id, score);
      bestChip.textContent = "🏆 " + U.fmtInt(best(g.id));
      SQ.Store.flush();
      sfx("timeout");
      UI().modal(U.el("div", { class: "modal-center arc-expired" }, [
        U.el("div", { class: "modal-big", text: "🎟️" }),
        U.el("h2", { style: "justify-content:center", text: "Ticket expired" }),
        U.el("p", { text: "Your arcade time has run out. Your score was kept; nothing else was earned or lost." }),
        U.el("div", { class: "result-grid" }, [cell(U.fmtInt(score), "Score"), cell(U.fmtInt(best(g.id)), "Best")]),
        U.el("div", { class: "row", style: "margin-top:8px" }, [
          U.el("button", { class: "btn btn-ghost btn-sm", text: "Back to arcade",
            on: { click: () => { UI().closeModal(); UI().go("/arcade"); } } }),
          U.el("div", { class: "spacer" }),
          U.el("button", { class: "btn btn-primary js-to-shop", text: "Buy more time ⭐",
            on: { click: () => { UI().closeModal(); UI().go("/shop/arcade"); } } })
        ])
      ]), { sticky: true });
    }

    try {
      gameApi = g.start(stage, session) || {};
    } catch (e) {
      console.error("Arcade game failed to start:", e);
      stage.appendChild(U.el("div", { class: "card", text: "This game failed to load." }));
      gameApi = {};
    }
    live = { game: g.id, skin: sk.id, session, api: gameApi, teardown };
    session.setScore(0);
    sfx("gameStart");
    lastFrame = lastClock = performance.now();
    raf = requestAnimationFrame(frame);
  }

  /* ── router entry ─────────────────────────────────────────── */
  function screen(view, args) {
    const id = args && args[0];
    if (id) return play(view, id);
    return lobby(view);
  }

  const api = {
    register, game, list, games: {}, defineSkins, skin, allSkins, defaultSkin, skinFor, ownedSkins,
    ownsSkin, equip, skinsFor, grantTicket, secondsLeft, allDay, hasTime, timeLabel, endOfToday,
    unlocked, gameUnlocked, gameLevel, best, recordScore, screen, lobby,
    /** The running game, for tests: { game, skin, state() }. Null between games. */
    current: () => live ? { game: live.game, skin: live.skin, running: live.session.running(),
                            over: live.session.isOver(), score: live.session.score,
                            state: live.api && live.api.state ? live.api.state : null } : null
  };
  return api;
})();
