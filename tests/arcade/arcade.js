/* ARCADE — the shared arcade is a pure sink, its clock is honest, its skins apply,
   and the runner's patterns are solvable.

   Run standalone:  node tests/arcade/arcade.js

   1. static   no file under js/arcade/ calls into the reward pipeline
   2. ledger   every game is played for 10 s by a bot; XP, Stars, subject coins, the
               overall level, achievements and power-ups do not move
   3. clock    burns only while a game is on screen and visible; stops on route leave;
               the all-day pass burns nothing; the expiry modal; refusal at 0 time
   4. gates    arcade unlock level, per-game levels
   5. skins    skinsFor() shape/prices, owned-only picker, equip applies, fallback
   6. runner   tap/hold apex vs the stack, the duck window, solvability at both speeds
   7. layout   no horizontal overflow at 360 / 390, no console errors */
"use strict";
const fs = require("fs");
const path = require("path");
const B = require("../lib/browser");

const T = B.checker("arcade");
const ROOT = B.ROOT;
const GAMES = ["crush", "runner", "merge", "pairs", "phagocyte", "catch"];

function baseSave(extra) {
  return Object.assign({
    settings: { onboarded: true, sound: false, motion: "off" },
    enrolled: ["chem", "phys", "bio", "econ", "eng", "madv"],
    migrateOffered: true,
    overall: { xp: 50000, level: 20, xpIntoLevel: 1234, lifetimeXp: 50000 },
    stars: 5000,
    subjects: { chem: { xp: 4321, level: 7, coins: 999, xpIntoLevel: 10 }, bio: { xp: 100, level: 2, coins: 55 } },
    arcade: { seconds: 3600, allDayUntil: 0, scores: {}, played: {}, skin: {} },
    owned: { themes: ["midnight"], avatars: ["🎓", "📚"], skins: [] }
  }, extra || {});
}

async function open(browser, save, hash, viewport) {
  const page = await B.boot(browser, { save, hash: hash || "#/arcade", viewport });
  await page.waitForTimeout(300);
  return page;
}
const go = (page, hash) => page.evaluate(h => { location.hash = h; }, hash).then(() => page.waitForTimeout(350));
const ledger = page => page.evaluate(() => {
  const d = SQ.Store.data;
  return JSON.stringify({ overall: d.overall, stars: d.stars, subjects: d.subjects, achievements: d.achievements,
    inventory: d.inventory, history: d.history, daily: d.daily.progress, owned: d.owned });
});
/* Arcade code's own missing-resource errors count; the shell's missing icons do not. */
function realErrors(page) {
  return page.errors.filter(e => !/Failed to load resource/.test(e));
}

/* A bot per game: drives real inputs for `ms`. */
const BOT = `(async (game, ms) => {
  const sleep = t => new Promise(r => setTimeout(r, t));
  const t0 = performance.now();
  const ptr = (n, type, x, y, id) => n.dispatchEvent(new PointerEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: y, pointerId: id || 1, pointerType: "touch" }));
  const key = (k, type) => document.dispatchEvent(new KeyboardEvent(type || "keydown", { key: k, code: k === " " ? "Space" : k.length === 1 ? "Key" + k.toUpperCase() : k, bubbles: true }));
  let acts = 0;
  while (performance.now() - t0 < ms) {
    const cur = SQ.Arcade.current();
    if (!cur || cur.over) break;
    const st = cur.state ? cur.state() : null;
    if (game === "crush" && st && !st.busy && st.hint) {
      const cells = [...document.querySelectorAll(".crush-cell")];
      const find = ([r, c]) => cells.find(n => n.style.getPropertyValue("--r") == r && n.style.getPropertyValue("--c") == c && !n.classList.contains("popping"));
      const a = find(st.hint[0]), b = find(st.hint[1]);
      if (a && b) { a.click(); await sleep(60); b.click(); acts++; }
      await sleep(250);
    } else if (game === "merge") {
      const dirs = ["ArrowLeft", "ArrowDown", "ArrowRight", "ArrowDown", "ArrowUp"];
      key(dirs[acts % dirs.length]); acts++;
      if (acts % 17 === 0) key("z");
      await sleep(90);
    } else if (game === "pairs" && st) {
      const cards = [...document.querySelectorAll(".pairs-card")];
      const idx = st.done.map((d, i) => (d || st.open[i] ? -1 : i)).filter(i => i >= 0);
      if (!st.lock && !st.peeking && idx.length >= 2) {
        const i = idx[0];
        const j = idx.find(k => k !== i && st.symbols[k] === st.symbols[i]);
        const pick = Math.random() < 0.75 && j !== undefined ? j : idx[1];
        cards[i].click(); await sleep(40); cards[pick].click(); acts++;
      }
      await sleep(260);
    } else if (game === "runner" && st) {
      const G = SQ.Arcade.games.runner.geometry;
      const jump = document.querySelector('[data-act="jump"]'), duck = document.querySelector('[data-act="duck"]');
      const ahead = st.obstacles.filter(o => o.x + o.w > G.RUN_X - 4).sort((a, b) => a.x - b.x)[0];
      if (ahead && ahead.x - (G.RUN_X + G.RUN_W) < st.speed * 12 && st.grounded) {
        if (ahead.kind === "hang") { ptr(duck, "pointerdown", 0, 0, 2); await sleep(300); ptr(document, "pointerup", 0, 0, 2); }
        else { ptr(jump, "pointerdown", 0, 0, 1); await sleep(ahead.h > 50 || ahead.pattern === "staples" ? 260 : 40); ptr(document, "pointerup", 0, 0, 1); }
        acts++;
      }
      await sleep(16);
    } else if (game === "phagocyte" || game === "catch") {
      const c = document.querySelector(".arc-canvas");
      const r = c.getBoundingClientRect();
      const x = r.left + r.width * (0.5 + 0.4 * Math.sin(acts / 7)), y = r.top + r.height * (game === "catch" ? 0.9 : 0.5 + 0.3 * Math.cos(acts / 5));
      if (acts === 0) ptr(c, "pointerdown", x, y, 3); else ptr(c, "pointermove", x, y, 3);
      if (game === "catch" && acts % 40 === 20) { key("ArrowLeft"); await sleep(120); key("ArrowLeft", "keyup"); }
      acts++;
      await sleep(50);
    } else await sleep(50);
  }
  const cur = SQ.Arcade.current();
  return { acts, score: cur ? cur.score : -1, over: cur ? cur.over : null };
})`;

(async () => {
  /* ── 1. static: no reward calls under js/arcade ─────────── */
  const dir = path.join(ROOT, "js/arcade");
  const BANNED = /\b(award|addXP|addStars|addCoins|payExtra|spendStars|spendCoins|checkAchievements|noteRun|recordAnswer)\s*\(/;
  const files = fs.readdirSync(dir).filter(f => f.endsWith(".js"));
  T.ok(files.length === 8, "js/arcade holds the eight arcade files (" + files.length + ")");
  for (const f of files) {
    const src = fs.readFileSync(path.join(dir, f), "utf8");
    const lines = src.split("\n").map((l, i) => [i + 1, l]).filter(([, l]) => BANNED.test(l));
    T.ok(!lines.length, f + " calls no reward function" + (lines.length ? " — line " + lines.map(x => x[0]).join(",") : ""));
    T.ok(!/SQ\.Overall|\.State\b/.test(src), f + " never touches SQ.Overall or a subject State");
  }

  const browser = await B.launch();
  const allErrors = [];
  const track = p => { allErrors.push(p); return p; };

  try {
    /* ── 2. ledger: every game, 10 s, in parallel ─────────── */
    const results = await Promise.all(GAMES.map(async g => {
      const page = track(await open(browser, baseSave(), "#/arcade/" + g));
      const before = await ledger(page);
      const secBefore = await page.evaluate(() => SQ.Arcade.secondsLeft());
      const run = await page.evaluate(BOT + "(" + JSON.stringify(g) + ", 10000)");
      const after = await ledger(page);
      const extra = await page.evaluate(() => ({ sec: SQ.Arcade.secondsLeft(), best: SQ.Store.data.arcade.scores,
        stage: !!document.querySelector(".arcade-stage[data-game]") }));
      const ov = await B.overflow(page);
      await page.close();
      return { g, before, after, run, secBefore, extra, ov };
    }));
    for (const r of results) {
      T.ok(r.extra.stage, r.g + ": the play stage rendered");
      T.ok(r.run.acts > 0, r.g + ": the bot made moves (" + r.run.acts + ")");
      T.ok(r.before === r.after, r.g + ": 10 s of play left XP, Stars, coins, overall level, achievements and power-ups unchanged");
      const burnt = r.secBefore - r.extra.sec;
      T.ok(burnt >= 6 && burnt <= 13, r.g + ": the meter burnt about the time played (" + burnt + " s)");
      T.ok(r.ov.px <= 0, r.g + ": no horizontal overflow at 390 during play" + (r.ov.px > 0 ? " " + JSON.stringify(r.ov) : ""));
      console.log("  · " + r.g + ": " + r.run.acts + " moves, score " + r.run.score + (r.run.over ? " (game over)" : ""));
    }
    T.ok(results.some(r => r.run.score > 0), "at least one bot scored");

    /* ── 3. clock ─────────────────────────────────────────── */
    {
      const save = baseSave();
      save.arcade.seconds = 100;
      const page = track(await open(browser, save, "#/arcade/merge"));
      const s0 = await page.evaluate(() => SQ.Arcade.secondsLeft());
      await page.waitForTimeout(3200);
      const s1 = await page.evaluate(() => SQ.Arcade.secondsLeft());
      T.ok(s0 - s1 >= 2 && s0 - s1 <= 4, "clock burns while the game is on screen (" + (s0 - s1) + " s in 3.2 s)");

      await page.evaluate(() => {
        Object.defineProperty(document, "visibilityState", { configurable: true, get: () => "hidden" });
        document.dispatchEvent(new Event("visibilitychange"));
      });
      await page.waitForTimeout(3000);
      const s2 = await page.evaluate(() => SQ.Arcade.secondsLeft());
      T.ok(s2 === s1, "clock stops while the page is hidden (" + s1 + " → " + s2 + ")");
      await page.evaluate(() => {
        Object.defineProperty(document, "visibilityState", { configurable: true, get: () => "visible" });
        document.dispatchEvent(new Event("visibilitychange"));
      });
      await page.waitForTimeout(2300);
      const s3 = await page.evaluate(() => SQ.Arcade.secondsLeft());
      T.ok(s2 - s3 >= 1 && s2 - s3 <= 3, "and resumes when visible again (" + (s2 - s3) + " s)");

      await page.evaluate(() => SQ.UI.modal("<p>help</p>"));
      await page.waitForTimeout(2200);
      const s4 = await page.evaluate(() => SQ.Arcade.secondsLeft());
      T.ok(s4 === s3, "clock stops while a modal covers the game");
      await page.evaluate(() => SQ.UI.closeModal());

      await go(page, "#/arcade");
      await page.waitForTimeout(2500);
      const s5 = await page.evaluate(() => SQ.Arcade.secondsLeft());
      const cur = await page.evaluate(() => SQ.Arcade.current());
      T.ok(Math.abs(s5 - s4) <= 1, "leaving the game stops the clock (" + s4 + " → " + s5 + ")");
      T.ok(cur === null, "and tears the session down (SQ.UI.onLeave)");

      /* all-day pass */
      await page.evaluate(() => { SQ.Arcade.grantTicket(SQ.Economy.TICKETS.find(t => t.allDay)); });
      const pass = await page.evaluate(() => ({ until: SQ.Store.data.arcade.allDayUntil, mid: (() => { const d = new Date(); d.setHours(24, 0, 0, 0); return d.getTime(); })() }));
      T.ok(pass.until === pass.mid, "the all-day pass runs to local midnight");
      await go(page, "#/arcade/pairs");
      const p0 = await page.evaluate(() => SQ.Arcade.secondsLeft());
      await page.waitForTimeout(2600);
      const p1 = await page.evaluate(() => ({ s: SQ.Arcade.secondsLeft(), label: document.querySelector(".arc-clock").textContent }));
      T.ok(p1.s === p0, "the all-day pass burns no seconds (" + p0 + " → " + p1.s + ")");
      T.ok(/all day/i.test(p1.label), "and the clock chip says so");

      /* ticket via grantTicket adds minutes */
      await page.evaluate(() => { SQ.Store.data.arcade.allDayUntil = 0; });
      const g0 = await page.evaluate(() => SQ.Arcade.secondsLeft());
      await page.evaluate(() => SQ.Arcade.grantTicket(SQ.Economy.TICKETS[0]));
      const g1 = await page.evaluate(() => SQ.Arcade.secondsLeft());
      T.ok(g1 - g0 === 300, "a 5-minute ticket adds 300 s");
      T.ok(realErrors(page).length === 0, "clock page: no console errors " + JSON.stringify(realErrors(page)));
      await page.close();
    }

    /* the shop buys through grantTicket and charges Stars once */
    {
      const save = baseSave();
      save.arcade.seconds = 0;
      const page = track(await open(browser, save, "#/shop/arcade"));
      const before = await page.evaluate(() => ({ stars: SQ.Store.data.stars, s: SQ.Arcade.secondsLeft() }));
      await page.evaluate(() => { const b = [...document.querySelectorAll(".shop-item")].find(n => /5 minutes/.test(n.textContent)).querySelector("button"); b.click(); });
      await page.waitForTimeout(200);
      const after = await page.evaluate(() => ({ stars: SQ.Store.data.stars, s: SQ.Arcade.secondsLeft() }));
      T.ok(after.s === 300 && before.stars - after.stars === 60, "general shop: buying 5 minutes costs 60 ⭐ and adds 300 s");
      await page.close();
    }

    /* expiry */
    {
      const save = baseSave();
      save.arcade.seconds = 2;
      const page = track(await open(browser, save, "#/arcade/crush"));
      await page.waitForTimeout(3600);
      const st = await page.evaluate(() => ({ modal: (document.querySelector("#modal-root .modal") || {}).textContent || "",
        s: SQ.Arcade.secondsLeft(), cur: SQ.Arcade.current() }));
      T.ok(/Ticket expired/.test(st.modal), "an empty meter shows the Ticket expired modal");
      T.ok(st.s === 0 && st.cur && st.cur.over, "and the game stops at 0 s");
      T.ok(/Buy more time/.test(st.modal), "and offers the shop");
      await page.evaluate(() => document.querySelector("#modal-root .js-to-shop").click());
      await page.waitForTimeout(300);
      T.ok(await page.evaluate(() => location.hash === "#/shop/arcade"), "which goes to #/shop/arcade");

      /* refusal at 0 */
      await go(page, "#/arcade/runner");
      const ref = await page.evaluate(() => ({ refuse: (document.querySelector(".arc-refuse") || {}).dataset,
        canvas: !!document.querySelector(".runner-canvas"), shop: !!document.querySelector("#modal-root .js-to-shop"), cur: SQ.Arcade.current() }));
      T.ok(ref.refuse && ref.refuse.refuse === "time" && !ref.canvas && !ref.cur, "a game refuses to start with 0 time");
      T.ok(ref.shop, "and offers the shop");
      T.ok(realErrors(page).length === 0, "expiry page: no console errors " + JSON.stringify(realErrors(page)));
      await page.close();
    }

    /* ── 4. gates ─────────────────────────────────────────── */
    {
      const lock = baseSave({ overall: { xp: 10, level: 1, xpIntoLevel: 10, lifetimeXp: 10 } });
      const page = track(await open(browser, lock, "#/arcade"));
      const lob = await page.evaluate(() => ({ locked: !!document.querySelector(".arc-locked"), plays: document.querySelectorAll(".arc-play").length }));
      T.ok(lob.locked && lob.plays === 0, "below ARCADE_UNLOCK_LEVEL the arcade is locked");
      await go(page, "#/arcade/crush");
      T.ok(await page.evaluate(() => (document.querySelector(".arc-refuse") || {}).dataset.refuse === "locked" && !SQ.Arcade.current()), "and games refuse to start");
      await page.evaluate(() => { SQ.Store.data.overall.level = 4; });
      await go(page, "#/arcade");
      const g4 = await page.evaluate(() => [...document.querySelectorAll(".arc-card")].map(c => [c.dataset.game, !!c.querySelector(".arc-play")]));
      const m = Object.fromEntries(g4);
      T.ok(m.crush && m.merge && m.pairs && !m.runner && !m.phagocyte && !m.catch, "per-game overall-level gates apply at level 4 " + JSON.stringify(m));
      await page.close();
    }

    /* ── 5. skins ─────────────────────────────────────────── */
    {
      const page = track(await open(browser, baseSave(), "#/arcade"));
      const shape = await page.evaluate(() => {
        const out = {};
        SQ.Subjects.ids().forEach(id => { out[id] = SQ.Arcade.skinsFor(id); });
        return out;
      });
      for (const id of Object.keys(shape)) {
        const list = shape[id];
        T.ok(list.length >= 3, id + ": skinsFor returns its skins (" + list.length + ")");
        T.ok(list.every(s => s.id && s.game && s.name && s.icon && s.desc && s.level >= 1 && s.price >= 300 && s.price <= 1500),
          id + ": every skin has {id, game, name, icon, desc, price 300–1500, level}");
      }
      const games = await page.evaluate(() => {
        const out = {};
        SQ.Arcade.list().forEach(g => { out[g.id] = { def: !!SQ.Arcade.defaultSkin(g.id), subj: SQ.Arcade.allSkins(g.id).filter(s => s.subject).length }; });
        return out;
      });
      GAMES.forEach(g => T.ok(games[g] && games[g].def && games[g].subj >= 2, g + ": a free default skin and ≥2 subject skins"));
      const need = { crush: 7, runner: 7, merge: 5 };
      Object.keys(need).forEach(g => T.ok(games[g].subj >= need[g], g + ": " + games[g].subj + " subject skins"));

      /* picker shows owned only */
      const pick0 = await page.evaluate(() => [...document.querySelectorAll('.arc-skin[data-game="crush"]')].map(n => n.dataset.skin));
      T.ok(pick0.length === 1 && pick0[0] === "crush-default", "the picker shows only owned skins (default)");
      await page.evaluate(() => { SQ.Store.data.owned.skins.push("crush-chem", "crush-eng", "merge-eng"); SQ.Store.data.arcade.skin.pairs = "pairs-bio"; });
      await go(page, "#/home"); await go(page, "#/arcade");
      const pick1 = await page.evaluate(() => [...document.querySelectorAll('.arc-skin[data-game="crush"]')].map(n => n.dataset.skin));
      T.ok(pick1.length === 3, "after buying, the picker lists them (" + pick1.join(", ") + ")");
      await page.evaluate(() => document.querySelector('.arc-skin[data-skin="crush-chem"]').click());
      await page.waitForTimeout(150);
      T.ok(await page.evaluate(() => SQ.Store.data.arcade.skin.crush === "crush-chem"), "clicking a skin equips it (data.arcade.skin.crush)");
      await go(page, "#/arcade/crush");
      const chem = await page.evaluate(() => ({ skin: document.querySelector(".arcade-stage").dataset.skin,
        faces: [...document.querySelectorAll(".crush-cell")].map(n => n.dataset.face), title: document.querySelector(".gtitle").textContent }));
      T.ok(chem.skin === "crush-chem" && chem.faces.includes("Na⁺") && /Ion Crush/.test(chem.title), "the equipped skin applies in play (Ion Crush tiles)");
      await page.evaluate(() => { SQ.Store.data.arcade.skin.crush = "crush-eng"; });
      await go(page, "#/arcade"); await go(page, "#/arcade/crush");
      const eng = await page.evaluate(() => ({ order: !!document.querySelector(".crush-order .crush-slot"), faces: [...new Set([...document.querySelectorAll(".crush-cell")].map(n => n.dataset.face))].sort().join("") }));
      T.ok(eng.order && eng.faces === "AEIRST", "Letter Crush shows a word order and A E I R S T tiles");
      await go(page, "#/arcade/pairs");
      T.ok(await page.evaluate(() => document.querySelector(".arcade-stage").dataset.skin === "pairs-default"), "an equipped but unowned skin falls back to the default");
      await go(page, "#/arcade/merge");
      await page.evaluate(() => { SQ.Store.data.arcade.skin.merge = "merge-eng"; });
      await go(page, "#/arcade"); await go(page, "#/arcade/merge");
      T.ok(await page.evaluate(() => [...document.querySelectorAll(".merge-sym")].some(n => /LETTER|WORD/.test(n.textContent))), "Word Tower tiles are words");

      /* every skin launches cleanly */
      const all = await page.evaluate(() => SQ.Arcade.allSkins().map(s => [s.game, s.id]));
      await page.evaluate(ids => { SQ.Store.data.owned.skins = ids; }, all.map(x => x[1]));
      let okAll = 0;
      for (const [g, id] of all) {
        await page.evaluate(([g2, id2]) => { SQ.Store.data.arcade.skin[g2] = id2; }, [g, id]);
        await go(page, "#/arcade");
        await go(page, "#/arcade/" + g);
        await page.waitForTimeout(250);
        const s = await page.evaluate(() => { const n = document.querySelector(".arcade-stage"); return n && n.dataset.skin; });
        if (s === id) okAll++; else console.log("  skin failed to apply: " + id + " got " + s);
      }
      T.ok(okAll === all.length, "all " + all.length + " skins launch and apply");
      T.ok(realErrors(page).length === 0, "skins page: no console errors " + JSON.stringify(realErrors(page)));
      await page.close();
    }

    /* ── 6. runner: the rules it says it has ─────────────── */
    {
      const page = track(await open(browser, baseSave(), "#/arcade"));
      const g = await page.evaluate(() => SQ.Arcade.games.runner.geometry);
      const APEX = `(async (holdMs, duckFirst) => {
        const S = () => SQ.Arcade.games.runner.state();
        const J = document.querySelector('[data-act="jump"]'), K = document.querySelector('[data-act="duck"]');
        const down = (n, id) => n.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, cancelable: true, pointerId: id }));
        const up = id => document.dispatchEvent(new PointerEvent("pointerup", { bubbles: true, pointerId: id }));
        const sleep = ms => new Promise(r => setTimeout(r, ms));
        const ground = S().y;
        if (duckFirst) { down(K, 2); await sleep(40); }
        down(J, 1);
        if (duckFirst) { await sleep(40); up(2); }
        if (holdMs > 0) await sleep(holdMs);
        up(1);
        let top = ground;
        for (let i = 0; i < 60; i++) { top = Math.min(top, S().y); await sleep(16); }
        return Math.round(ground - top);
      })`;
      const apex = async (hold, duck) => { await go(page, "#/arcade"); await go(page, "#/arcade/runner"); await page.waitForTimeout(200);
        return page.evaluate(APEX + "(" + hold + "," + (duck ? "true" : "false") + ")"); };
      const tap = await apex(0), held = await apex(320), duckHeld = await apex(320, true);
      console.log("  · tap apex " + tap + " px, held apex " + held + " px");
      T.ok(held > tap + 25, "holding Jump goes meaningfully higher (" + tap + " → " + held + ")");
      T.ok(tap > 40 && tap < 78, "a tap clears a footnote-height block but not the 78 px stack");
      T.ok(held > 78, "a held jump clears the stack");
      T.ok(duckHeld > 78, "releasing Duck does not cancel a held jump (" + duckHeld + ")");
      T.ok(g.GROUND - g.RUN_H < g.DUCK_BAR_BOTTOM && g.GROUND - g.DUCK_H >= g.DUCK_BAR_BOTTOM, "a hanging bar catches a standing runner and misses a ducking one");
      T.ok(g.NEAR_PX < (g.GROUND - g.DUCK_H) - g.DUCK_BAR_BOTTOM, "the near-miss threshold is under the duck clearance");

      const solve = await page.evaluate(() => {
        const R = SQ.Arcade.games.runner, G = R.geometry;
        const rise = (t, hold) => {
          let v = G.JUMP_V, y = 0, left = hold ? G.HOLD_MAX : 0;
          for (let i = 0; i < t; i++) { let gg = G.GRAV; if (left > 0 && v < 0) { gg = G.HOLD_G; left--; } v = Math.min(G.MAX_FALL, v + gg); y = Math.min(0, y + v); }
          return -y;
        };
        const out = [];
        G.patterns.forEach(p => {
          if (p.solve !== "tap" && p.solve !== "hold") return;
          const hold = p.solve === "hold", air = hold ? G.AIR_HOLD : G.AIR_TAP;
          [G.SPEED_MIN, G.SPEED_MAX].forEach(sp => {
            let built = null, hardest = -1;
            for (let k = 0; k < 40; k++) {
              const cand = R.buildAt(p.id, sp);
              const gr = cand.obs.filter(o => o.y + o.h >= G.GROUND - 4);
              const span = Math.max(...gr.map(o => o.x + o.w)) - Math.min(...gr.map(o => o.x));
              const tall = G.GROUND - Math.min(...gr.map(o => o.y));
              if (span + tall * 4 > hardest) { hardest = span + tall * 4; built = cand; }
            }
            const ground = built.obs.filter(o => o.y + o.h >= G.GROUND - 4).sort((a, b) => a.x - b.x);
            const clusters = [[ground[0]]];
            for (let i = 1; i < ground.length; i++) {
              const prev = clusters[clusters.length - 1], last = prev[prev.length - 1];
              if ((ground[i].x - (last.x + last.w)) / sp < air) prev.push(ground[i]); else clusters.push([ground[i]]);
            }
            clusters.forEach((cl, ci) => {
              const need = G.GROUND - Math.min(...cl.map(o => o.y));
              const x1 = Math.min(...cl.map(o => o.x)), x2 = Math.max(...cl.map(o => o.x + o.w));
              let from = -1, to = -1;
              for (let t = 0; t <= 80; t++) if (rise(t, hold) > need) { if (from < 0) from = t; to = t; }
              const win = from < 0 ? 0 : to - from, crossing = (x2 - x1 + G.RUN_W) / sp;
              out.push({ id: p.id + (clusters.length > 1 ? "#" + (ci + 1) : ""), sp, slack: Math.round((win - crossing) * 10) / 10 });
              if (ci > 0) {
                const prev = clusters[ci - 1], last = prev[prev.length - 1];
                out.push({ id: p.id + "#" + ci + "→" + (ci + 1), sp, slack: Math.round(((x1 - (last.x + last.w)) / sp - air) * 10) / 10 });
              }
            });
          });
        });
        return out;
      });
      solve.forEach(r => T.ok(r.slack >= 3, "runner pattern " + r.id + " @ " + r.sp + " px/frame is solvable (+" + r.slack + " frames)"));
      console.log("  · solvability: " + solve.map(r => r.id + "@" + r.sp + " +" + r.slack).join(" · "));

      /* the fixed timestep: ~60 simulation frames a second whatever the display rate */
      await go(page, "#/arcade"); await go(page, "#/arcade/runner");
      const f0 = await page.evaluate(() => SQ.Arcade.games.runner.state().frame);
      await page.waitForTimeout(2000);
      const f1 = await page.evaluate(() => SQ.Arcade.games.runner.state().frame);
      T.ok(f1 - f0 >= 100 && f1 - f0 <= 135, "the runner steps at 60 Hz (" + (f1 - f0) + " frames in 2 s)");
      await go(page, "#/arcade");
      T.ok(await page.evaluate(() => SQ.Arcade.games.runner.state() === null), "leaving the runner stops its loop");
      T.ok(realErrors(page).length === 0, "runner page: no console errors " + JSON.stringify(realErrors(page)));
      await page.close();
    }

    /* ── 7. layout at 360 and 390 ─────────────────────────── */
    for (const w of [360, 390]) {
      const save = baseSave();
      save.owned.skins = ["crush-econ", "merge-eng", "runner-chem", "pairs-madv", "catch-econ", "phagocyte-bio"];
      save.arcade.skin = { crush: "crush-econ", merge: "merge-eng", runner: "runner-chem", pairs: "pairs-madv", catch: "catch-econ", phagocyte: "phagocyte-bio" };
      const page = track(await open(browser, save, "#/arcade", { width: w, height: 800 }));
      let ov = await B.overflow(page);
      T.ok(ov.px <= 0, w + " px: lobby has no horizontal overflow " + (ov.px > 0 ? JSON.stringify(ov) : ""));
      for (const g of GAMES) {
        await go(page, "#/arcade/" + g);
        await page.waitForTimeout(250);
        ov = await B.overflow(page);
        T.ok(ov.px <= 0, w + " px: " + g + " has no horizontal overflow " + (ov.px > 0 ? JSON.stringify(ov) : ""));
        const pads = await page.evaluate(() => [...document.querySelectorAll(".run-btn")].map(b => Math.round(b.getBoundingClientRect().height)));
        if (g === "runner" || g === "catch") T.ok(pads.length === 2 && pads.every(h => h >= 60), w + " px: " + g + " has two big hold-to-act pads (" + pads.join(",") + ")");
      }
      T.ok(realErrors(page).length === 0, w + " px: no console errors " + JSON.stringify(realErrors(page)));
      await page.close();
    }

    const arcadeResourceErrors = allErrors.flatMap(p => p.errors).filter(e => /arcade/.test(e));
    T.ok(arcadeResourceErrors.length === 0, "no arcade file failed to load " + JSON.stringify(arcadeResourceErrors));
    const errs = allErrors.flatMap(p => realErrors(p));
    T.ok(errs.length === 0, "no console errors across the suite " + JSON.stringify(errs.slice(0, 5)));
  } catch (e) {
    T.ok(false, "suite crashed: " + (e && e.stack || e));
  } finally {
    await browser.close();
  }
  T.done();
})();
