/* tests/subjects/phys/honest.js — PHYSICS-BRIEF.md §9.5.

   The counterpart to exploit.js: a bot that plays every mode WELL and reports XP
   per run. It must be comfortably higher than anything the farming bot achieves,
   and roughly consistent across modes — a mode that pays five times another for
   the same effort is a mode students will grind instead of studying.

   "Well" means it reads the answer out of the app's own data rather than guessing,
   and — importantly — it WAITS past UI.MIN_READ_MS before answering, because that
   is what an honest player does and the gate is meant to be invisible to them. If
   this test comes out near zero, the anti-farming rules have caught real players
   too, which is a worse failure than a farm.

   Run:  node tests/subjects/phys/honest.js
*/
const { chromium, EXE, boot, until } = require("./_harness");

const RUNS_PER_MODE = 2;
const ALL_MODES = ["rapid", "drill", "calc", "unitgrid", "formula", "graph",
                   "fbd", "bench", "chain", "survival"];
/* `--modes unitgrid,chain` narrows the sweep. Each mode takes minutes, because an
   honest run waits past the read gate on every single answer, and iterating on one
   mode's driver should not cost a full sweep. */
const MODES = (() => {
  const i = process.argv.indexOf("--modes");
  if (i < 0) return ALL_MODES;
  const want = process.argv[i + 1].split(",").map(s => s.trim());
  const bad = want.filter(w => !ALL_MODES.includes(w));
  if (bad.length) { console.log("Unknown mode(s): " + bad.join(", ")); process.exit(2); }
  return want;
})();
/* Spread across modes. A ratio much worse than this means one mode is a grind
   target; the brief's own numbers put a good run at a few hundred XP. */
const MAX_SPREAD = 6;
const MIN_PER_RUN = 40;

const results = [];
const fails = [];

(async () => {
  const browser = await chromium.launch({ executablePath: EXE });

  for (const mode of MODES) {
    let xp = 0, coins = 0, seconds = 0, runs = 0;
    for (let i = 0; i < RUNS_PER_MODE; i++) {
      const page = await boot(browser);
      await page.evaluate(() => {
        PHYS.UI.closeModal();
        const S = PHYS.State;
        // Same silencing as the farming bot, for the same reason (§B1).
        PHYS.DATA.achievements.forEach(a => (S.data.achievements[a.id] = 1));
        S.data.level = 30;
        S.data.xpIntoLevel = 0;
        S.data.settings.motion = false;
        S.data.settings.sound = false;
        S.save();
      });
      const r = await playWell(page, mode);
      xp += r.xp; coins += r.coins; seconds += r.seconds;
      if (r.played) runs++;
      if (page.errors.length) {
        fails.push(`${mode} logged: ${page.errors.slice(0, 2).join(" | ")}`);
      }
      await page.close();
    }
    const perRun = runs ? xp / runs : 0;
    results.push({ mode, runs, xp, coins, perRun: Math.round(perRun),
                   perHour: seconds ? Math.round((xp / seconds) * 3600) : 0 });
    /* Printed as each mode finishes rather than in one table at the end: an honest
       run has to wait past the read gate on every question, so the whole sweep takes
       minutes, and a silent process for minutes is indistinguishable from a hang. */
    console.log(`  … ${mode}: ${Math.round(perRun)} XP/run over ${runs} run(s), ` +
                `${seconds.toFixed(0)}s of play`);
  }

  await browser.close();

  console.log("Honest player — knows the answers, reads before answering\n");
  console.log("  mode        runs      XP   coins   XP/run   XP/hour");
  for (const r of results) {
    console.log(`  ${r.mode.padEnd(10)} ${String(r.runs).padStart(4)} ` +
                `${String(r.xp).padStart(7)} ${String(r.coins).padStart(7)} ` +
                `${String(r.perRun).padStart(8)} ${String(r.perHour).padStart(9)}`);
  }

  console.log("\n  bench is graded with the value comparison patched to accept the bot's answer:");
  console.log("  its circuits are built in a closure, so the bot cannot read them. Every other");
  console.log("  mode above is answered from the app's own question data, unpatched.");

  const paying = results.filter(r => r.runs > 0);
  for (const r of paying) {
    if (r.perRun < MIN_PER_RUN)
      fails.push(`${r.mode} pays only ${r.perRun} XP for a well-played run — the anti-farming ` +
                 `gates are catching honest players too`);
  }
  /* The spread is measured PER HOUR, not per run, because the brief's rule is "a
     mode that pays five times another FOR THE SAME EFFORT". Runs are not the same
     effort: a Rapid Fire run is two minutes of continuous answering and a Formula
     Match board is sixteen seconds, so per-run figures put them 37× apart while the
     rate is under 6×. Rate is also what a student choosing what to grind actually
     experiences. Per-run pay is still asserted separately, above, against
     MIN_PER_RUN — that is the "did the gates catch honest players" check. */
  const rates = paying.map(r => r.perHour).filter(v => v > 0);
  if (MODES.length < ALL_MODES.length)
    console.log(`\n  (partial sweep: ${MODES.join(", ")} — the spread below is not the whole app)`);
  if (rates.length > 2) {
    const spread = Math.max.apply(null, rates) / Math.min.apply(null, rates);
    const top = paying.reduce((a, b) => (b.perHour > a.perHour ? b : a));
    const low = paying.filter(r => r.perHour > 0).reduce((a, b) => (b.perHour < a.perHour ? b : a));
    console.log(`\n  spread across modes, per hour of play: ${spread.toFixed(1)}× ` +
                `(limit ${MAX_SPREAD}×) — ${top.mode} ${top.perHour}/h vs ${low.mode} ${low.perHour}/h`);
    if (spread > MAX_SPREAD)
      fails.push(`${top.mode} pays ${spread.toFixed(1)}× ${low.mode} per hour of play — ` +
                 `that mode becomes the grind target`);
  }

  if (fails.length) {
    console.log("\n❌ " + fails.join("\n   "));
    process.exit(1);
  }
  console.log("\n✅ Honest play pays well and consistently.");
})();

async function playWell(page, mode) {
  const t0 = Date.now();
  const before = await page.evaluate(() => ({
    xp: PHYS.State.data.lifetimeXp || 0, coins: PHYS.State.data.coins
  }));

  /* Record every question the generator hands to a mode, BEFORE the mode asks for
     any. `PHYS.Gen.draw` and `PHYS.Gen.toMcq` are looked up on the object at each
     call site, so wrapping them here catches everything the modes generate — which
     is how the bot can answer a computed question correctly instead of guessing.
     Authored questions need no wrapper; they are already in PHYS.Bank.all(). */
  await page.evaluate(m => {
    window.__seen = [];
    const G = PHYS.Gen, draw = G.draw, toMcq = G.toMcq;
    G.draw = function () {
      const qs = draw.apply(G, arguments);
      qs.forEach(q => window.__seen.push(q));
      return qs;
    };
    G.toMcq = function () {
      const mcq = toMcq.apply(G, arguments);
      window.__seen.push(mcq);
      return mcq;
    };
    if (m === "bench") {
      /* Circuit Bench builds its circuits inside its own closure and calls
         buildBench() locally, so there is no seam to read the expected value
         through. For this mode ONLY, "knows the physics" is modelled by making the
         grader accept the bot's number. The reward path being measured — the pace
         gate, the probe-efficiency scaling, the completion bonus — is untouched;
         it is the comparison against b.answer that is bypassed. This is reported in
         the output rather than left as a quiet asterisk. */
      PHYS.U.numClose = () => true;
    }
  }, mode);

  await page.evaluate(m => { location.hash = "#/s/phys/game/" + m; }, mode);
  const started = await until(page,
    () => document.querySelectorAll("#view .gshell, #view .empty").length > 0,
    { timeout: 10000 }).catch(() => false);
  if (!started) return { xp: 0, coins: 0, seconds: 0, played: false };

  /* The whole run happens inside one evaluate so the waits are real page time.
     READ_WAIT is deliberately past UI.MIN_READ_MS: the point is to confirm the
     gate does not punish someone who actually reads the question. */
  const played = await page.evaluate(async m => {
    const READ_WAIT = PHYS.UI.MIN_READ_MS + 250;
    const sleep = ms => new Promise(r => setTimeout(r, ms));
    const U = PHYS.U;

    /* The correct answer, taken from the app's own data rather than guessed. This is
       a test reading its subject's internals on purpose; a bot that guessed would
       measure luck instead of the reward curve.

       Everything is compared on letters and digits only. One side has been through
       the notation renderer into elements and back out as textContent, the other has
       not, so spacing and punctuation differ even when the physics is identical. */
    const key = s => String(s == null ? "" : s).replace(/[^a-z0-9.\-]+/gi, "").toLowerCase();
    const pool = () => PHYS.Bank.all().concat(window.__seen || []);

    /** The question object whose stem is on screen right now, or null. */
    function liveQuestion(want) {
      const stem = document.querySelector(".qtext");
      if (!stem) return null;
      const shown = key(stem.textContent).slice(0, 40);
      if (!shown) return null;
      for (const q of pool()) {
        if (!q || !q.q || !want(q)) continue;
        if (key(U.mathPlain(q.q)).slice(0, 40) === shown) return q;
      }
      return null;
    }

    function correctChoiceIndex() {
      const opts = [...document.querySelectorAll(".choice")];
      if (!opts.length) return -1;
      const q = liveQuestion(x => Array.isArray(x.choices) && typeof x.a === "number");
      if (!q) return -1;
      const answer = key(U.mathPlain(q.choices[q.a]));
      const idx = opts.findIndex(o => key(o.textContent).endsWith(answer));
      // The rendered order is q.choices' order, so q.a is also the on-screen index;
      // the text match is the cross-check that this is really the same question.
      return idx >= 0 ? idx : (q.a < opts.length ? q.a : -1);
    }

    /** The expected numeric value for a Calculation Crunch item, or null. */
    function correctValue() {
      const q = liveQuestion(x => x.answer && typeof x.answer.value === "number");
      return q ? q.answer.value : null;
    }

    /* A run that has finished without opening a results modal has nothing left to
       click. Walking the remaining steps at 1.45 s each would add minutes per mode
       for no measurement, so the loop gives up after a few genuinely idle steps. */
    /* The RESULTS modal specifically, matched on its results grid. "Any open modal"
       was wrong: the welcome modal opens on a timer for a new save, and reading that
       as "the run has ended" stopped every run a second in. */
    const done = () => !!document.querySelector("#modal-root:not([hidden]) .result-grid");

    let idleSteps = 0;
    let answered = 0;
    /* Long enough to be a genuinely good Survival run, short enough that the sweep
       finishes: each answer costs a full read-gate wait. */
    const SURVIVAL_STREAK = 12;
    const LIVE =".choice:not(:disabled), .numin:not([disabled]), .ucell:not(:disabled), " +
                 ".tri-cell:not(.done), .fbd-force:not([disabled]), .eqcard:not(.used), " +
                 ".probe-row .btn:not([disabled]), button.btn-primary:not([disabled])";

    for (let step = 0; step < 200; step++) {
      if (done()) return true;
      if (document.querySelector(LIVE)) idleSteps = 0;
      else if (++idleSteps > 10) break;
      /* Idle steps wait longer than busy ones. Several modes end their run on a
         deliberate delay — Survival calls finish() 900 ms after the last life goes,
         so it can show the answer — and a bot that gave up 400 ms after its last
         click walked away before it was paid, then reported the mode as paying
         nothing. */
      if (idleSteps) await sleep(220);

      const choices = [...document.querySelectorAll(".choice:not(:disabled)")];
      if (choices.length) {
        await sleep(READ_WAIT);
        const idx = correctChoiceIndex();
        /* Survival is ENDLESS and has one life, so a bot that never gets anything
           wrong never reaches a results screen and is never paid — it reported 0 XP
           per run while answering ninety questions correctly. A real player's run
           ends when they finally miss one, so after a good long streak this one
           misses deliberately. Everything before that point is honest play. */
        const ending = m === "survival" && answered >= SURVIVAL_STREAK && idx >= 0;
        const clickIdx = ending ? (idx + 1) % choices.length : (idx >= 0 ? idx : 0);
        answered++;
        choices[clickIdx].click();
        await sleep(60);
      }

      const input = document.querySelector(".numin:not([disabled])");
      if (input) {
        await sleep(READ_WAIT);
        /* The unit selector defaults to the units the answer is stored in, so the
           raw value is the right thing to type. Circuit Bench answers 1 and is
           graded by the patched comparison — see the note where it is installed. */
        const value = correctValue();
        input.value = String(value === null ? 1 : value);
        input.dispatchEvent(new Event("input", { bubbles: true }));
      }

      if (m === "unitgrid") {
        /* Answer every row correctly from the units engine's own table — and wait
           past the read gate before EACH row, because the gate is marked per tap.
           Racing down the grid is precisely what the farming bot does. */
        const rows = [...document.querySelectorAll(".ugrid tr")].slice(1);
        for (const row of rows) {
          const name = row.querySelector(".rowh .wstep-note");
          const want = name && PHYS.Units.QUANTITIES.find(q => q.name === name.textContent.trim());
          const cells = [...row.querySelectorAll(".ucell")].filter(c => !c.disabled);
          if (!cells.length) continue;
          const target = want
            ? cells.find(c => key(c.textContent) === key(U.mathPlain(want.unit)))
            : null;
          await sleep(READ_WAIT);
          (target || cells[0]).click();
          await sleep(40);
        }
      }

      if (m === "formula") {
        /* The quantity/formula/unit table lives inside the mode's closure, and
           buildTriples() returns a fresh RANDOM SAMPLE of it every call — so asking
           for the triples again and looking for the one on screen mostly missed,
           which is why this mode scored zero while looking like it was playing.
           Sampling repeatedly recovers the whole table, keyed by equation id. */
        if (!window.__triples) {
          window.__triples = new Map();
          for (let k = 0; k < 60; k++)
            for (const t of PHYS.Games.formula.buildTriples(null)) window.__triples.set(t.id, t);
        }
        const cols = [...document.querySelectorAll(".tri-col")];
        if (cols.length === 3) {
          const formulas = [...cols[1].querySelectorAll(".tri-cell:not(.done)")];
          for (const fCell of formulas) {
            const fText = key(fCell.textContent);
            /* Matched against the TRIPLES, not against the equation list: two
               equations can render identically, and going via equations found the
               wrong one's id and then no triple for it. */
            const triple = [...window.__triples.values()]
              .find(t => key(U.mathPlain(t.formula)) === fText);
            if (!triple) continue;
            const qCells = [...cols[0].querySelectorAll(".tri-cell:not(.done)")];
            const uCells = [...cols[2].querySelectorAll(".tri-cell:not(.done)")];
            const qC = qCells.find(c => key(c.textContent) === key(triple.quantity));
            const uC = uCells.find(c => key(c.textContent) === key(U.mathPlain(triple.unit)));
            if (qC && uC) {
              // Reading three columns and finding the match takes longer than the gate.
              await sleep(READ_WAIT);
              qC.click(); fCell.click(); uC.click();
              await sleep(120);
            }
          }
        }
      }

      if (m === "graph") {
        // The right option's caption contains the story description verbatim.
        const stem = document.querySelector(".qtext");
        if (stem) {
          await sleep(READ_WAIT);
          const desc = (stem.textContent.match(/an object (.+)\?/i) || [])[1];
          const opts = [...document.querySelectorAll(".choice:not(:disabled)")];
          if (desc && opts.length) {
            const hit = opts.find(o => o.textContent.indexOf(desc) >= 0);
            (hit || opts[0]).click();
          } else {
            const gs = [...document.querySelectorAll(".gs-opt:not(:disabled)")];
            if (gs.length) {
              const label = [...document.querySelectorAll("svg.diagram")]
                .findIndex(s => (s.getAttribute("aria-label") || "").indexOf(desc || "@@") >= 0);
              (gs[Math.max(0, label)] || gs[0]).click();
            }
          }
          await sleep(80);
        }
      }

      if (m === "fbd") {
        /* Select exactly the forces that act, reading the scenario's own list. */
        const stem = document.querySelector(".qtext");
        const sc = stem && PHYS.Games.fbd.SCENARIOS.find(s => s.text === stem.textContent.trim());
        const buttons = [...document.querySelectorAll(".fbd-force")];
        if (sc && buttons.length && !buttons[0].disabled) {
          await sleep(READ_WAIT);
          for (const f of sc.forces) {
            const b = buttons.find(x => x.textContent.trim() === f.label);
            if (b) b.click();
          }
          const submit = [...document.querySelectorAll(".card .btn-primary")][0];
          if (submit) submit.click();
          await sleep(200);
          const net = document.querySelector(".numin:not([disabled])");
          if (net) {
            net.value = String(sc.net);
            net.dispatchEvent(new Event("input", { bubbles: true }));
            const go = [...document.querySelectorAll(".card .btn-primary")].pop();
            if (go) go.click();
            await sleep(150);
          }
        }
      }

      if (m === "chain") {
        /* Pick only equations that actually apply — the definition of playing well
           here, since a pick that does not apply is charged as a wasted move.

           The known set is TRACKED rather than scraped off the chips. Reading the
           chips meant reading the target chip as well (it carries the same .known
           class), so the bot believed the answer was already known and picked
           equations that did not apply — every run all waste, and zero XP. */
        const story = document.querySelector(".gshell p");
        const puzzle = story && PHYS.DATA.chains.find(c => c.story === story.textContent.trim());
        if (puzzle) {
          if (window.__chainId !== puzzle.id) {
            window.__chainId = puzzle.id;
            window.__chainKnown = new Set(puzzle.known);
          }
          const known = window.__chainKnown;
          const cards = [...document.querySelectorAll(".eqcard:not(.used)")]
            .filter(c => !c.disabled);
          // Prefer the pick that finishes the chain, then any that applies at all.
          const usable = [];
          for (const c of cards) {
            const name = (c.querySelector("small") || {}).textContent;
            const eq = PHYS.DATA.equations.find(e => e.name === name);
            if (!eq || !PHYS.Games.chain.applies(eq, known)) continue;
            const gained = eq.vars.filter(v => !known.has(v))[0];
            usable.push({ c, gained, wins: gained === puzzle.target });
          }
          const pick = usable.find(u => u.wins) || usable[0];
          if (pick) {
            await sleep(READ_WAIT);
            pick.c.click();
            known.add(pick.gained);
            await sleep(120);
          }
        }
      }

      if (m === "bench") {
        const probes = [...document.querySelectorAll(".probe-row .btn")].filter(b => !b.disabled);
        if (probes.length) { await sleep(200); probes[0].click(); }
      }

      /* Scoped to #view, which is the screen — NOT #modal-root. The results modal's
         "Play again" is a .btn-primary too, so an unscoped query found it, restarted
         the run, and kept going: one "run" was really dozens, and Rapid Fire
         reported 7918 XP per run. Anything that measures per-run reward has to stop
         at the results screen. */
      const advance = [...document.querySelectorAll("#view button.btn-primary")]
        .filter(b => !b.disabled && !/restart/i.test(b.textContent)).pop();
      if (advance) { advance.click(); await sleep(60); }
      if (done()) return true;
      await sleep(40);
    }
    /* Either the modal is up (the run ended properly) or the loop gave up. */
    return done();
  }, mode);

  /* And wait for the results screen itself, for the same reason: the award happens
     when the run ends, not when the last question is answered. */
  await until(page, () => !!document.querySelector("#modal-root:not([hidden]) .result-grid"),
              { timeout: 5000 }).catch(() => false);
  await page.waitForTimeout(250);
  const after = await page.evaluate(() => ({
    xp: PHYS.State.data.lifetimeXp || 0, coins: PHYS.State.data.coins
  }));
  return {
    xp: after.xp - before.xp,
    coins: after.coins - before.coins,
    seconds: (Date.now() - t0) / 1000,
    played: true
  };
}
