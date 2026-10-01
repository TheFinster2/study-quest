/* Module Bosses — HP duels (StudyQuest upgrade of Biosphere's 20-question bosses).

   One boss per module and a Final Paper. Each question is on its own clock;
   a right answer damages the boss (faster and on a streak = harder), a wrong
   one or a timeout damages you. Every boss has a gimmick (data/bosses.js).

   Biosphere's rules kept: a module boss unlocks after 30 questions from that
   module have been seen, and there is no reference in a boss fight.
   Anti-farm: an answer faster than the read floor deals half damage and pays
   nothing; a loss pays only for read, correct answers; the win bonus goes
   through award()'s accuracy and read-ratio gates. */
(function (root) {
  "use strict";
  var BIO = root.BIO, U = BIO.U, UI = BIO.UI, S = BIO.State, R = BIO.Run;

  R.register({
    id:"boss", name:"Module Bosses", icon:"⚔️", route:"/play/boss",
    blurb:"HP duels, one per module, each with a gimmick — then the Final Paper. No reference.",
    group:"Challenge"
  });

  var UNLOCK_SEEN = 30;
  var ROTATE_MS = 4000;

  function bosses() { return BIO.DATA.bosses || []; }
  function byId(id) { return bosses().filter(function (b) { return b.id === id; })[0] || null; }
  function beaten(id) { return !!(S.data.bossesBeaten && S.data.bossesBeaten[id]); }

  /** { ok, why } — Biosphere's questions-seen rule; the Final Paper needs all eight. */
  function unlockState(b) {
    if (b.id === "b-final") {
      var left = bosses().filter(function (x) { return x.id !== "b-final" && !beaten(x.id); });
      return { ok: !left.length, why: left.length ? "Beat all eight module bosses first (" + left.length + " to go)." : "" };
    }
    var seen = S.seenInModule(b.mod);
    return { ok: seen >= UNLOCK_SEEN, seen: seen, why: "Answer " + UNLOCK_SEEN + " questions from " + b.mod + " first. You have seen " + seen + "." };
  }
  BIO.Bosses = { list: bosses, byId: byId, unlockState: unlockState, UNLOCK_SEEN: UNLOCK_SEEN };

  UI.route("/play/boss", function (view, r) {
    var id = r.query.b || (r.query.mod ? "b-" + r.query.mod : null);
    if (!id) return chooser(view);
    var b = byId(id);
    if (!b) return chooser(view);
    var u = unlockState(b);
    if (!u.ok) {
      chooser(view);
      UI.modal({
        title: "Boss locked", body: u.why,
        actions: b.mod
          ? [{ label: "Drill " + b.mod, kind: "primary", onclick: function () { UI.go("/play/drill?mod=" + b.mod); } },
             { label: "Back", kind: "ghost" }]
          : [{ label: "OK", kind: "primary" }]
      });
      return;
    }
    return fight(view, b);
  });

  function chooser(view) {
    view.appendChild(U.el("h1", { text: "Module Bosses" }));
    view.appendChild(U.el("p", { class: "muted",
      text: "HP duels. Each question is on its own clock; right answers hit the boss, wrong answers and timeouts hit you. Every boss has a trick. No reference in a boss fight." }));
    var diff = S.difficulty();
    if (diff.id !== "standard") view.appendChild(U.el("div", { class: "honesty",
      text: diff.icon + " " + diff.name + ": clocks ×" + diff.time + ", boss hits ×" + diff.boss + "." }));

    var list = U.el("div", { class: "list" });
    bosses().forEach(function (b) {
      var u = unlockState(b), won = beaten(b.id);
      var best = (S.data.bossBest || {})[b.id];
      var row = U.el("button", { class: "li boss-row", type: "button" }, [
        U.el("span", { class: "boss-ico", text: won ? "🏆" : u.ok ? b.icon : "🔒" }),
        U.el("div", { class: "grow" }, [
          U.el("b", { text: (b.mod ? b.mod + " — " : "") + b.name }),
          U.el("small", { text: u.ok ? b.gimmickText : (b.mod ? (u.seen + "/" + UNLOCK_SEEN + " questions seen") : u.why) }),
          won ? U.el("small", { text: " · Beaten" + (best !== undefined ? " · best finish " + best + " HP" : "") }) : null
        ]),
        U.el("span", { class: "muted2", text: "›" })
      ]);
      if (!u.ok) row.classList.add("locked");
      row.addEventListener("click", function () { UI.go("/play/boss?b=" + b.id); });
      list.appendChild(row);
    });
    view.appendChild(list);
  }

  function fight(view, boss) {
    BIO.Tools.startRun("boss");
    var diff = S.difficulty();
    var g = boss.gimmick, all = g === "all";
    var has = function (k) { return g === k || (all && ["heal", "double", "obscure", "drain"].indexOf(k) >= 0); };
    if (SQ.Sound) SQ.Sound.bossIntro();

    var shell = UI.gameShell(view, { title: "Boss — " + boss.name, sub: boss.gimmickText, progress: false,
      onQuit: function () { UI.go("/play/boss"); }, backTo: "/play/boss" });
    var timerChip = U.el("span", { class: "timer-ring", text: "–" });
    shell.meta.appendChild(timerChip);

    var st = { bossHp: boss.hp, hp: boss.playerHp, asked: 0, correct: 0, counted: 0, streak: 0, hits: 0,
               xp: 0, took: false, done: false, review: [], timer: null, rot: null, revived: false };

    var bossBar = U.el("i"), playerBar = U.el("i");
    var bossHpTxt = U.el("span", { class: "tiny muted" }), playerHpTxt = U.el("span", { class: "tiny muted" });
    var face = U.el("div", { class: "boss-face", text: boss.icon });
    shell.body.appendChild(U.el("div", { class: "card boss-hud" }, [
      U.el("div", { class: "row", style: "flex-wrap:nowrap" }, [
        face,
        U.el("div", { class: "grow" }, [
          U.el("div", { class: "spread" }, [U.el("b", { text: boss.name }), bossHpTxt]),
          U.el("div", { class: "hpbar enemy", style: "margin-top:6px" }, [bossBar])
        ])
      ]),
      U.el("div", { class: "muted2 small", style: "margin-top:8px", text: "“" + boss.taunt + "”" }),
      U.el("div", { class: "row", style: "margin-top:10px;flex-wrap:nowrap" }, [
        U.el("span", { text: SQ.Store.data.profile.avatar || "🧑‍🔬" }),
        U.el("div", { class: "grow" }, [U.el("div", { class: "hpbar" }, [playerBar])]),
        playerHpTxt
      ])
    ]));
    var stage = U.el("div", { class: "boss-stage" });
    shell.body.appendChild(stage);

    var mods = boss.mod ? [boss.mod] : null;
    var stream = BIO.Bank.stream("mcq", mods ? { filter: function (q) { return q.mod === boss.mod; } } : {});

    function paint() {
      bossBar.style.width = U.clamp(st.bossHp / boss.hp * 100, 0, 100) + "%";
      playerBar.style.width = U.clamp(st.hp / boss.playerHp * 100, 0, 100) + "%";
      bossHpTxt.textContent = Math.max(0, Math.round(st.bossHp)) + " / " + boss.hp;
      playerHpTxt.textContent = Math.max(0, Math.round(st.hp)) + " / " + boss.playerHp;
      shell.setMeters([{ text: "Q " + (st.asked || 1) }, { text: st.correct + " right" },
        { text: "🔥 " + st.streak }, { text: "Reference off" }]);
    }

    function qTime() {
      var t = boss.seconds * (diff.time || 1);
      if (has("drain")) t *= 0.7 + 0.3 * U.clamp(st.bossHp / boss.hp, 0, 1);
      return Math.max(8, Math.round(t));
    }

    function stopClocks() { clearInterval(st.timer); clearInterval(st.rot); st.timer = st.rot = null; }

    function next() {
      if (st.done) return;
      var q = stream.next();
      if (!q) return end(false, "Out of questions");
      st.asked++;
      paint();
      var shownAt = Date.now();
      var rendered = UI.renderMCQ(stage, q, function (ok) { resolve(q, ok, false, shownAt, rendered); },
                                  { hideTags: has("obscure") });

      var left = qTime();
      timerChip.textContent = String(left);
      timerChip.classList.remove("low");
      stopClocks();
      st.timer = setInterval(function () {
        left--;
        timerChip.textContent = String(Math.max(0, left));
        timerChip.classList.toggle("low", left <= 5);
        if (left <= 5 && left > 0 && SQ.Sound) SQ.Sound.tickUrgent();
        if (left <= 0) timeout(q, shownAt, rendered);
      }, 1000);

      if (has("rotate")) {
        st.rot = setInterval(function () {
          var box = rendered.box;
          if (!box || !box.firstChild || box.querySelector(".opt:disabled")) return;
          box.appendChild(box.firstChild);
          [].slice.call(box.children).forEach(function (b, i) { var k = b.querySelector(".k"); if (k) k.textContent = "ABCD".charAt(i); });
          if (SQ.Sound && SQ.Sound.bossRotate) SQ.Sound.bossRotate();
        }, ROTATE_MS);
      }
    }

    function timeout(q, shownAt, rendered) {
      stopClocks();
      rendered.buttons.forEach(function (b, j) {
        b.disabled = true;
        b.classList.add(rendered.order[j] === q.answer ? "right" : "dim");
      });
      if (SQ.Sound) SQ.Sound.timeout();
      stage.appendChild(UI.explain(q, false, -1));
      resolve(q, false, true, shownAt, rendered);
    }

    function resolve(q, ok, timedOut, shownAt, rendered) {
      stopClocks();
      if (st.done) return;
      var rushed = Date.now() - shownAt < UI.readFloor(q.q);
      S.markSeen(q.id, ok, q);
      var note;
      if (ok) {
        st.correct++; st.streak++;
        S.noteStreak(st.streak);
        if (!rushed) { st.counted++; st.xp += 8 * (q.diff || 1); S.bump("readCorrect"); }
        st.hits++;
        var speed = U.clamp((qTime() - (Date.now() - shownAt) / 1000) / qTime(), 0, 1);
        var dmg = Math.round((9 + (q.diff || 1) * 5) * (1 + speed * 0.6) * (1 + Math.min(st.streak, 6) * 0.06));
        if (rushed) dmg = Math.round(dmg * 0.5);
        if (has("shield") && st.hits % 4 === 0) {
          dmg = 0;
          note = "🛡 The membrane absorbs that hit — 0 damage.";
        } else note = "You deal " + dmg + " damage" + (rushed ? " (a rushed answer hits half as hard and pays nothing)." : ".");
        st.bossHp -= dmg;
        if (dmg && SQ.Sound) (speed > 0.75 && st.streak >= 3 ? SQ.Sound.crit : SQ.Sound.hit)();
        var rc = face.getBoundingClientRect();
        if (dmg) { SQ.FX.sparks(rc.left + rc.width / 2, rc.top + rc.height / 2, Math.PI * 1.5); SQ.FX.floatText(rc.right + 4, rc.top, "−" + dmg, "var(--bad)"); }
      } else {
        st.streak = 0;
        var hit = Math.round((10 + (q.diff || 1) * 4) * (diff.boss || 1));
        if (has("double")) hit *= 2;
        if (timedOut) hit = Math.round(hit * 1.2);
        st.hp -= hit; st.took = true;
        if (has("lifesteal")) st.bossHp = Math.min(boss.hp, st.bossHp + hit);
        note = (timedOut ? "Out of time — " : "") + "you take " + hit + " damage" + (has("lifesteal") ? " and the ghost heals " + hit + "." : ".");
        if (SQ.Sound) SQ.Sound.playerHurt();
        SQ.FX.shake();
        st.review.push({ ok: false, q: U.trunc(q.q, 120), mod: q.mod, a: q.options[q.answer], why: q.why });
      }
      if (has("chronic") && st.hp > 0) { st.hp -= 3; st.took = true; note += " The tumour costs you 3 HP."; }
      if (has("heal") && st.asked % 3 === 0 && st.bossHp > 0) {
        st.bossHp = Math.min(boss.hp, st.bossHp + 12);
        note += " The boss regenerates 12 HP.";
        if (SQ.Sound) SQ.Sound.bossHeal();
      }
      paint();
      stage.appendChild(U.el("div", { class: "why " + (ok ? "ok" : "no"), style: "margin-top:8px" }, [U.el("div", { text: note })]));

      if (st.bossHp <= 0) { if (SQ.Sound) SQ.Sound.bossDefeat(); return setTimeout(function () { end(true); }, 700); }
      if (st.hp <= 0) {
        if (!st.revived && S.usePowerup("revive")) {
          st.revived = true;
          st.hp = Math.round(boss.playerHp * 0.4);
          paint();
          UI.toast("💉 Adrenaline — back on your feet at 40% HP", "good", 3000);
        } else return setTimeout(function () { end(false); }, 600);
      }
      if (st.hp > 0 && st.hp <= boss.playerHp * 0.2 && SQ.Sound) SQ.Sound.lowHealth();
      stage.appendChild(U.el("div", { class: "row", style: "margin-top:12px" }, [
        U.el("button", { class: "btn btn-primary btn-block", onclick: next }, "Continue ⚔️")
      ]));
    }

    function end(won, reason) {
      if (st.done) return;
      st.done = true;
      stopClocks();
      var flawless = won && !st.took;
      var clutch = won && st.hp <= boss.playerHp * 0.1;
      var first = false;
      if (won) {
        first = S.markBoss(boss.id, { flawless: flawless });
        if (diff.id === "hard") S.bump("hardWins");
        if (diff.id === "nightmare") S.bump("nightmareWins");
        if (clutch) S.bump("clutchWins");
        S.data.bossBest = S.data.bossBest || {};
        S.data.bossBest[boss.id] = Math.max(S.data.bossBest[boss.id] || 0, Math.round(st.hp));
      }
      /* A first clear pays the full bonus; a re-clear 40% of it, so a beaten
         boss is not the obvious grind (tests/subjects/bio/honest.js). */
      var winBonus = won ? Math.round((200 + boss.hp * 1.2 + (flawless ? 150 : 0)) * (first ? 1 : 0.4)) : 0;
      var rec = UI.award({ xp: Math.round(st.xp), bonus: winBonus, accuracy: st.asked ? st.correct / st.asked : 0,
        readRatio: st.asked ? st.counted / st.asked : 0, answered: st.asked, mode: "boss", score: won ? st.correct : 0 });
      rec.questions = st.asked;
      if (BIO.Achievements) BIO.Achievements.check(rec);

      UI.results(view, {
        title: won ? boss.name + " defeated!" : (reason || "Defeated…"),
        subtitle: st.correct + " / " + st.asked + " right" + (flawless ? " · flawless" : clutch ? " · clutch" : ""),
        correct: st.correct, total: st.asked,
        rows: [
          ["Result", won ? (first ? "WIN — first clear" : "WIN") : "LOSS"],
          ["Your HP", String(Math.max(0, Math.round(st.hp)))],
          ["Boss HP", String(Math.max(0, Math.round(st.bossHp)))],
          ["Win bonus" + (won && !first ? " (re-clear, 40%)" : ""), won ? (rec.bonus ? "+" + U.fmtInt(rec.bonus) : "0  (answered too fast to have read)") : "—"],
          ["Total earned", U.fmtInt(rec.xp) + " XP  ·  " + U.fmtInt(rec.coins) + " ◉"]
        ],
        review: st.review.slice(0, 10),
        backTo: "/play/boss",
        again: function () { UI.render(); }
      });
    }

    next();
    return function () { st.done = true; stopClocks(); };
  }
})(typeof window !== "undefined" ? window : globalThis);
