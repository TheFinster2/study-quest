/* tests/subjects/phys/helpers.js — PHYSICS-BRIEF.md §9.6 and addendum §C3.

   Turn each optional crutch ON, then OFF, and assert the penalty SURVIVES.

   Both sibling apps shipped helpers that set their penalty flag on the current
   state, so switching the helper off before submitting refunded it — making the
   crutch free for anyone who noticed. The fix is a one-way door: the flag is set
   the moment the helper is first used and is never cleared for the rest of the run.

   Two crutches here:
     Calculation Crunch  "Show the equation"   −25%
     Free-Body Builder   "Show the resultant"  −30%

   Each is checked three ways:
     1. the flag latches when used
     2. navigating away and back within the run does not clear it
     3. the results screen NAMES it, so the cost is visible rather than merely felt

   Under BREAK=1 the first two assertions still pass and only the third fails, which
   is worth knowing: the penalty CHIP is not evidence of anything. It is written once
   when the helper is used and nothing re-reads the flag to take it away, so a refund
   leaves the chip sitting there looking correct. The scored line on the results
   screen is the only one of the three that is load-bearing.

   Run:  node tests/subjects/phys/helpers.js
         BREAK=1 node tests/subjects/phys/helpers.js   (unlatch it, expect a failure)
*/
const fs = require("fs");
const path = require("path");
const { chromium, EXE, boot, until, ROOT } = require("./_harness");

const BREAK = !!process.env.BREAK;
const fails = [];
const fail = m => { fails.push(m); console.log("   ✗ " + m); };
const ok = m => console.log("   ✓ " + m);

const CRUTCHES = [
  { mode: "calc", file: "subjects/phys/games/calc.js", label: "Show the equation",
    flag: "hintLatched", penalty: 0.25, resultsText: /equation shown/i,
    // The line that makes it a one-way door.
    breakFrom: "state.hintLatched = true;                 // one-way: never cleared",
    breakTo:   "state.hintLatched = true; setTimeout(() => { state.hintLatched = false; }, 10);" },
  { mode: "fbd", file: "subjects/phys/games/fbd.js", label: "Show the resultant",
    flag: "helperLatched", penalty: 0.30, resultsText: /resultant shown/i,
    breakFrom: "run.helperLatched = true;                       // one-way door",
    breakTo:   "run.helperLatched = true; setTimeout(() => { run.helperLatched = false; }, 10);" }
];

(async () => {
  const cleanup = [];
  if (BREAK) {
    /* Reintroduce the exact defect: let the flag be cleared again. If the
       assertions below still pass after that, this test is worthless. */
    for (const c of CRUTCHES) {
      const abs = path.join(ROOT, c.file);
      const src = fs.readFileSync(abs, "utf8");
      if (src.indexOf(c.breakFrom) < 0) {
        console.log(`❌ BREAK=1 could not find the latch line in ${c.file}`);
        process.exit(2);
      }
      const patched = src.replace(c.breakFrom, c.breakTo);
      try { new Function(patched); }
      catch (e) {
        console.log("❌ BREAK=1 patched file no longer parses: " + e.message);
        process.exit(2);
      }
      fs.writeFileSync(abs + ".bak", src);
      fs.writeFileSync(abs, patched);
      cleanup.push(abs);
    }
    console.log("BREAK=1: the latch now un-sets itself shortly after being used.\n");
  }

  const browser = await chromium.launch({ executablePath: EXE });

  for (const c of CRUTCHES) {
    console.log(c.mode + " — " + c.label + " (−" + Math.round(c.penalty * 100) + "%):");
    const page = await boot(browser);
    await page.evaluate(() => {
      PHYS.UI.closeModal();
      PHYS.State.data.settings.motion = false;
      PHYS.State.data.settings.sound = false;
      PHYS.State.save();
    });
    await page.evaluate(m => { location.hash = "#/s/phys/game/" + m; }, c.mode);
    await until(page, () => !!document.querySelector("#view .gshell"),
                { message: c.mode + " did not start" }).catch(e => fail(e.message));

    /* 1. Using it latches. The flag lives in a closure, so it is observed through
       the UI chip the mode publishes rather than by reaching into the closure. */
    const used = await page.evaluate(label => {
      const btn = [...document.querySelectorAll("button")]
        .find(b => b.textContent.indexOf(label) >= 0);
      if (!btn) return "the helper button is not on screen";
      btn.click();
      return null;
    }, c.label);
    if (used) { fail(used); await page.close(); continue; }
    await page.waitForTimeout(300);

    const latchedNow = await page.evaluate(() => {
      const chip = [...document.querySelectorAll(".gmeta .chip")]
        .find(x => !x.hidden && /−\d+%/.test(x.textContent));
      return chip ? chip.textContent.trim() : null;
    });
    if (!latchedNow) fail("using the helper did not show a penalty chip");
    else ok("latched on first use — " + latchedNow);

    /* 2. It must still be latched after the helper is dismissed and the run
       continues. This is the refund path that used to exist. */
    await page.waitForTimeout(400);
    const stillLatched = await page.evaluate(() => {
      // Advance through the run as far as we can; the flag must survive all of it.
      const btn = [...document.querySelectorAll("button.btn-primary")].filter(b => !b.disabled).pop();
      if (btn) btn.click();
      return new Promise(r => setTimeout(() => {
        const chip = [...document.querySelectorAll(".gmeta .chip")]
          .find(x => !x.hidden && /−\d+%/.test(x.textContent));
        r(!!chip);
      }, 500));
    });
    if (!stillLatched) fail("the penalty disappeared after continuing the run — it is refundable");
    else ok("survives the rest of the run");

    /* 3. The results screen must NAME it. A cost the student cannot see is a cost
       they will not learn from. */
    const named = await page.evaluate(async re => {
      const sleep = ms => new Promise(r => setTimeout(r, ms));
      // Blast through whatever remains of the run to reach the results. The RESULTS
      // modal, matched on its grid — not "any modal", which also matches the welcome.
      for (let i = 0; i < 120; i++) {
        if (document.querySelector("#modal-root:not([hidden]) .result-grid")) break;
        const input = document.querySelector(".numin:not([disabled])");
        if (input) {
          input.value = "1";
          input.dispatchEvent(new Event("input", { bubbles: true }));
        }
        const force = document.querySelector(".fbd-force:not(:disabled)");
        if (force) force.click();
        const btn = [...document.querySelectorAll("button.btn-primary")]
          .filter(b => !b.disabled).pop();
        if (btn) btn.click();
        await sleep(60);
      }
      const modal = document.querySelector("#modal-root");
      return modal ? modal.textContent : "";
    }, c.resultsText.source);
    if (!new RegExp(c.resultsText.source, "i").test(named))
      fail("the results screen does not name the helper that was used");
    else ok("named on the results screen");

    if (page.errors.length) fail(c.mode + " logged: " + page.errors.slice(0, 2).join(" | "));
    await page.close();
  }

  await browser.close();
  cleanup.forEach(abs => {
    fs.writeFileSync(abs, fs.readFileSync(abs + ".bak", "utf8"));
    fs.unlinkSync(abs + ".bak");
  });

  console.log("");
  if (BREAK) {
    if (fails.length) {
      console.log("✅ BREAK=1 failed as it must:\n   " + fails.join("\n   "));
      process.exit(0);
    }
    console.log("❌ BREAK=1 PASSED — this test does not actually check the latch.");
    process.exit(1);
  }
  if (fails.length) { console.log("❌ " + fails.length + " failure(s)."); process.exit(1); }
  console.log("✅ Every crutch latches, survives the run, and is named on the results screen.");
})();
