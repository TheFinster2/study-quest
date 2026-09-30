/* tests/tools/tray.js — the shared tool tray in a browser, mounted by a scored
   gameShell on a test route registered from here (the app registers no demo sheet).

   Checks: FAB placement, the keyboard never rising, keys → tape, → Answer, the
   question mirror, 44 px keys at 360 px, constants from the sheet, the paid-reveal
   latch and cap, the penalty reaching SQ.UI.award and SQ.UI.results, the pad, the
   shortcuts, unscored mounts, unmount on route change, no overflow, no console errors.

   Run:  node tests/tools/tray.js */
const path = require("path");
const { launch, boot, until, overflow, checker } = require("../lib/browser");

const T = checker("tools/tray");
const FIXTURE = path.join(__dirname, "fixtures.js");

/* In the page: is a soft keyboard plausibly up? Focus on a text field that does not
   say inputmode="none" is what summons one; Playwright cannot see the keyboard itself. */
const KB = () => {
  const a = document.activeElement;
  if (!a || a === document.body) return false;
  const text = /^(TEXTAREA)$/.test(a.tagName) || a.isContentEditable ||
    (a.tagName === "INPUT" && !/^(button|checkbox|radio|range|submit|reset)$/i.test(a.type));
  return text && a.getAttribute("inputmode") !== "none";
};

async function setup(page) {
  await page.addScriptTag({ path: FIXTURE });
  await page.evaluate(() => {
    const was = SQ.Loader.isLoaded;
    SQ.Loader.isLoaded = id => id === "phys" || was(id);
    window.PHYS = { State: SQ.SubjectState.create("phys", { defaults: () => ({ stats: {} }), startCoins: 100 }) };
    const UI = SQ.UI.bind("phys", { coinRate: 0.75, tools: { calc: true, sheet: true, pad: true } });
    window.__modeKeys = 0;
    window.__inputs = 0;
    const question = (g, stem) => {
      g.body.innerHTML =
        '<div class="qcard"><div class="qtext">' + stem + '</div>' +
        '<input class="numin js-answer" type="text" aria-label="answer">' +
        '<div class="grid" style="margin-top:10px">' +
        ["A", "B", "C", "D"].map(l => '<button class="choice btn">' + l + ' option</button>').join("") +
        '</div><button class="btn btn-primary js-submit" style="margin-top:10px">Submit</button></div>';
      g.body.querySelector(".js-answer").addEventListener("input", () => window.__inputs++);
    };
    const onKey = () => window.__modeKeys++;
    UI.route("tooltest", view => {
      const g = UI.gameShell("Tool test", { scored: true });
      view.appendChild(g.root);
      question(g, "A ball is thrown at 20 m s⁻¹ at 30° above the horizontal. Find its range.");
      document.addEventListener("keydown", onKey);
      return () => document.removeEventListener("keydown", onKey);
    });
    UI.route("practice", view => {
      const g = UI.gameShell("Practice", { scored: false });
      view.appendChild(g.root);
      question(g, "Practice question");
    });
    UI.route("plain", view => { view.appendChild(document.createTextNode("No tools here.")); });
  });
}
const go = async (page, name) => {
  await page.evaluate(n => { location.hash = "#/s/phys/" + n; }, name);
  await page.waitForTimeout(150);
};
const press = (page, labels) => page.evaluate(ls => {
  for (const l of ls) {
    const k = [...document.querySelectorAll(".sqt-calc .calc-key")].find(b => b.textContent.trim() === l);
    if (!k) return "no key " + l;
    k.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, cancelable: true }));
    k.click();
  }
  return null;
}, labels);
const resultText = page => page.evaluate(() => document.querySelector(".sqt-calc .calc-result").textContent.replace(/^=\s*/, "").trim());

(async () => {
  const browser = await launch();
  let page;
  const failed = [];
  try {
    page = await boot(browser, { viewport: { width: 360, height: 740 } });
    page.on("requestfailed", r => { if (!/\/subjects\//.test(r.url())) failed.push("requestfailed: " + r.url()); });
    await setup(page);
    await go(page, "tooltest");
    await until(page, () => !!document.querySelector(".sqt-fab"), { message: "the tray never mounted" });

    /* ── mounting ── */
    const fab = await page.evaluate(() => ({
      n: document.querySelectorAll(".sqt-fab-btn").length,
      penalty: SQ.Tools.penalty(), looks: SQ.Tools.lookups().length,
      tabs: SQ.Tools.mounted().tabs.join(",")
    }));
    T.ok(fab.n === 3 && fab.tabs === "calc,sheet,pad", "a scored gameShell mounts Calculator | Sheet | Working (" + fab.tabs + ")");
    T.ok(fab.penalty === 1 && fab.looks === 0, "a fresh run owes nothing");

    const clear = await page.evaluate(async () => {
      window.scrollTo(0, document.documentElement.scrollHeight);
      await new Promise(r => setTimeout(r, 100));
      const f = document.querySelector(".sqt-fab").getBoundingClientRect();
      const hits = [...document.querySelectorAll("#view button, #view input")].filter(b => {
        const r = b.getBoundingClientRect();
        return r.width && !(r.right <= f.left || r.left >= f.right || r.bottom <= f.top || r.top >= f.bottom);
      }).map(b => b.textContent.trim() || b.className);
      window.scrollTo(0, 0);
      return { hits, h: Math.round(f.height), bottom: Math.round(innerHeight - f.bottom) };
    });
    T.ok(clear.hits.length === 0, "the FAB row covers no answer control when scrolled to the bottom (" + clear.hits.join(", ") + ")");
    T.ok(clear.h <= 56, "the FAB is a single row (" + clear.h + " px tall)");

    /* ── the keyboard never rises ── */
    await page.focus("#view .js-answer");
    T.ok(await page.evaluate(KB), "precondition: the answer field is focused (keyboard up)");
    await page.click(".sqt-fab-btn[data-tab=calc]");
    await until(page, () => !!document.querySelector(".sqt-calc"), { message: "the calculator did not open" });
    T.ok(!(await page.evaluate(KB)), "opening the calculator drops the keyboard (answer field blurred)");
    const focusables = await page.evaluate(() => document.querySelectorAll(".sqt-calc input, .sqt-calc textarea, .sqt-calc [contenteditable]").length);
    T.ok(focusables === 0, "no input, textarea or contenteditable in the calculator (" + focusables + ")");
    const prevented = await page.evaluate(() => {
      const k = document.querySelector(".sqt-calc .calc-key");
      const ev = new PointerEvent("pointerdown", { bubbles: true, cancelable: true });
      k.dispatchEvent(ev);
      return ev.defaultPrevented;
    });
    T.ok(prevented, "keys preventDefault() on pointerdown");
    await page.tap(".sqt-calc .calc-key:text-is('7')").catch(() => {});
    await page.click(".sqt-calc .calc-key:text-is('AC')");
    T.ok(!(await page.evaluate(KB)), "tapping and clicking keys focuses nothing that raises a keyboard");

    /* ── arithmetic through the keys, and the tape ── */
    T.ok((await press(page, ["4", ".", "2", "×", "1", "0", "="])) === null, "the keypad has 4 . 2 × 1 0 =");
    T.ok((await resultText(page)) === "42", "4.2 × 10 = 42 (" + (await resultText(page)) + ")");
    const tape = await page.evaluate(() => { SQ.Store.flush(); return JSON.parse(localStorage.getItem(SQ.Store.KEY)).tools.calc.tape.phys; });
    T.ok(tape && tape.length === 1 && tape[0].value === 42, "the line lands on the working tape and in the save");
    const sums = [
      [["AC", "2", "+", "3", "×", "4", "="], "14"], [["AC", "1", "0", "x!", "="], "3628800"],
      [["AC", "5", "0", "%", "×", "8", "0", "="], "40"], [["AC", "1", "÷", "3", "="], "0.3333333333"],
      [["AC", "5", "nCr", "2", "="], "10"], [["AC", "2nd", "nPr"], null],
      [["AC", "sin", "3", "0", ")", "="], "0.5"], [["AC", "−", "2", "xʸ", "2", "="], "-4"],
      [["AC", "Ans", "+", "8", "="], "4"], [["AC", "6", "×", "7", "M+", "AC", "MR", "+", "1", "="], "43"]
    ];
    for (const [keys, want] of sums) {
      const e = await press(page, keys);
      if (want === null) { T.ok(!e, "2nd reveals nPr"); await press(page, ["AC"]); continue; }
      const got = await resultText(page);
      T.ok(!e && got === want, keys.join(" ") + " → " + got + " (want " + want + ")" + (e ? " " + e : ""));
    }
    const second = await page.evaluate(() => [...document.querySelectorAll(".sqt-calc .calc-key")].some(k => k.textContent.trim() === "sin"));
    T.ok(second, "2nd is one-shot");
    await press(page, ["AC", "DEG", "sin", "π", "÷", "2", ")", "="]);
    T.ok((await resultText(page)) === "1", "RAD mode: sin(π/2) = 1");
    T.ok(await page.evaluate(() => { SQ.Store.flush(); return JSON.parse(localStorage.getItem(SQ.Store.KEY)).tools.calc.deg === false; }), "DEG/RAD is saved");
    await press(page, ["RAD", "AC"]);

    /* ── physical typing goes to the calculator, and only there ── */
    const keysBefore = await page.evaluate(() => window.__modeKeys);
    await page.keyboard.type("2*g");
    await page.keyboard.press("Enter");
    T.ok((await resultText(page)) === "19.6", "typing 2*g Enter uses the sheet's g = 9.8 (" + (await resultText(page)) + ")");
    T.ok((await page.evaluate(() => window.__modeKeys)) === keysBefore, "typed keys do not reach the mode's own key handler");
    await page.keyboard.press("Backspace");
    await press(page, ["AC"]);
    await page.keyboard.type("k");
    const lockedMsg = await resultText(page);
    T.ok(/not on the exam sheet/i.test(lockedMsg), "a locked constant (k) is refused until paid for: " + lockedMsg);
    await press(page, ["AC"]);

    /* ── → Answer ── */
    await press(page, ["1", "2", "×", "3", "="]);
    const inputsBefore = await page.evaluate(() => window.__inputs);
    await press(page, ["→ Answer"]);
    const sent = await page.evaluate(() => ({ v: document.querySelector("#view .js-answer").value, n: window.__inputs }));
    T.ok(sent.v === "36", "→ Answer fills .js-answer (" + sent.v + ")");
    T.ok(sent.n === inputsBefore + 1, "…and dispatches an input event");
    T.ok(!(await page.evaluate(KB)), "…without focusing it");

    /* ── the question mirror ── */
    const mirror = await page.evaluate(() => {
      const m = document.querySelector(".sqt-q");
      const q = document.querySelector("#view .qtext");
      const r = m.getBoundingClientRect();
      return { hidden: m.hidden, same: m.textContent.trim() === q.textContent.trim(), onScreen: r.top >= 0 && r.bottom <= innerHeight };
    });
    T.ok(!mirror.hidden && mirror.same && mirror.onScreen, "the question stem is mirrored at the top of the tray");
    await page.evaluate(() => { document.querySelector("#view .qtext").textContent = "Second question: find the maximum height."; });
    await until(page, () => /Second question/.test(document.querySelector(".sqt-q").textContent), { message: "the mirror did not follow the question" }).then(() => T.ok(true, "the mirror follows the next question"), e => T.ok(false, e.message));
    const qh0 = await page.evaluate(() => document.querySelector(".sqt-q-body").getBoundingClientRect().height);
    await page.evaluate(() => document.querySelector(".sqt-less").click());
    const qh1 = await page.evaluate(() => document.querySelector(".sqt-q-body").getBoundingClientRect().height);
    await page.evaluate(() => { document.querySelector(".sqt-more").click(); });
    T.ok(qh1 <= qh0, "▼ shows less of the question (" + Math.round(qh0) + " → " + Math.round(qh1) + " px)");

    /* ── 44 px keys at 360 px, all on screen, page still visible ── */
    const size = await page.evaluate(() => {
      const s = document.querySelector(".sqt-sheet").getBoundingClientRect();
      const keys = [...document.querySelectorAll(".sqt-calc .calc-key")].map(k => k.getBoundingClientRect());
      return { n: keys.length, minW: Math.min(...keys.map(k => k.width)), minH: Math.min(...keys.map(k => k.height)),
        off: keys.filter(k => k.bottom > innerHeight + 0.5 || k.top < 0).length, left: Math.round(s.top), vh: innerHeight };
    });
    T.ok(size.n >= 40, size.n + " keys");
    T.ok(size.minW >= 43.5 && size.minH >= 43.5, "smallest key " + size.minW.toFixed(0) + "×" + size.minH.toFixed(0) + " px (≥ 44)");
    T.ok(size.off === 0, "every key is on screen at 360×740");
    T.ok(size.left >= 80, size.left + " px of the page stays visible above the calculator");
    let ov = await overflow(page);
    T.ok(ov.px <= 1, "no horizontal overflow with the calculator open (" + ov.px + " px)");
    T.ok(await page.evaluate(() => document.documentElement.dataset.sheet === "on" &&
      parseFloat(getComputedStyle(document.querySelector("#view")).paddingBottom) > 300), "the page reserves the tray's height below");

    /* ── the calculator pays nothing ── */
    const econ = await page.evaluate(async () => {
      const S = PHYS.State.data, b = [S.xp, S.coins, SQ.Store.data.stars];
      const keys = [...document.querySelectorAll(".sqt-calc .calc-key")].filter(k => !/Answer/.test(k.textContent));
      for (let i = 0; i < 120; i++) keys[i % keys.length].click();
      await new Promise(r => setTimeout(r, 50));
      return JSON.stringify(b) === JSON.stringify([S.xp, S.coins, SQ.Store.data.stars]);
    });
    T.ok(econ, "120 key presses pay nothing");
    await press(page, ["AC"]);

    /* ── shortcuts ── */
    await page.keyboard.press("Escape");
    T.ok(await page.evaluate(() => !SQ.Tools.isOpen() && !document.documentElement.dataset.sheet), "Esc closes the tray and releases the space");
    await page.keyboard.press("f");
    T.ok(await page.evaluate(() => !SQ.Tools.isOpen()), "plain F is left to the mode when the screen has lettered choices");
    await page.keyboard.press("Alt+f");
    T.ok(await page.evaluate(() => SQ.Tools.tab() === "sheet"), "Alt+F opens the sheet");

    /* ── the sheet: free open, locked absent from the DOM ── */
    const sheet = await page.evaluate(() => ({
      free: !!document.querySelector('.sqt-row[data-id="suvat1"] .tb-row-body'),
      gFree: /9\.8/.test((document.querySelector('.sqt-row[data-id="g"]') || {}).textContent || ""),
      secret: /SECRET-/.test(document.querySelector(".sqt-dock").innerHTML + document.getElementById("view").innerHTML),
      kVal: !!document.querySelector('.sqt-row[data-id="kCoulomb"] .sqt-val'),
      pays: document.querySelectorAll(".sqt-pay").length,
      inputs: [...document.querySelectorAll(".sqt-sheet input")].filter(i => i === document.activeElement).length
    }));
    T.ok(sheet.free && sheet.gFree, "free items and constants are shown");
    T.ok(!sheet.secret && !sheet.kVal, "locked item bodies and constant values are NOT in the DOM");
    T.ok(sheet.pays === 9, "9 locked entries offer Show (−10%) (" + sheet.pays + ")");
    T.ok(sheet.inputs === 0 && !(await page.evaluate(KB)), "the sheet's search box is not auto-focused");
    T.ok((await page.evaluate(() => SQ.Tools.penalty())) === 1, "reading the free half costs nothing");

    await page.click('.sqt-row[data-id="range"] .sqt-pay');
    const one = await page.evaluate(() => ({ p: SQ.Tools.penalty(), l: SQ.Tools.lookups(),
      shown: /SECRET-RANGE/.test(document.querySelector('.sqt-row[data-id="range"]').textContent),
      other: /SECRET-HEIGHT/.test(document.querySelector(".sqt-dock").innerHTML),
      chip: (document.querySelector(".sqt-cost") || {}).textContent }));
    T.ok(one.p === 0.9 && one.l.length === 1 && one.l[0].id === "range" && one.l[0].name === "Projectile range",
      "one reveal: ×0.9, lookups() = [{id:'range', name:'Projectile range'}]");
    T.ok(one.shown && !one.other, "the paid item appears; the others stay out of the DOM");
    T.ok(/−10%/.test(one.chip || ""), "the sheet shows the charge (" + one.chip + ")");

    await page.keyboard.press("Escape");
    await page.keyboard.press("Alt+f");
    const latched = await page.evaluate(() => ({ p: SQ.Tools.penalty(),
      open: /SECRET-RANGE/.test(document.querySelector(".sqt-dock").innerHTML), pay: !!document.querySelector('.sqt-row[data-id="range"] .sqt-pay') }));
    T.ok(latched.p === 0.9 && latched.open && !latched.pay, "closing and reopening refunds nothing and re-charges nothing");

    await page.click('.sqt-row[data-id="kCoulomb"] .sqt-pay');
    await page.click('.sqt-row[data-id="escape"] .sqt-pay');
    const capNote = await page.evaluate(() => document.querySelector('.sqt-row[data-id="orbit"] .sqt-pay').textContent);
    await page.click('.sqt-row[data-id="orbit"] .sqt-pay');
    await page.click('.sqt-row[data-id="maxh"] .sqt-pay');
    const cap = await page.evaluate(() => ({ p: SQ.Tools.penalty(), n: SQ.Tools.lookups().length }));
    T.ok(cap.p === 0.7 && cap.n === 5, "five reveals cap at ×0.7 (" + cap.p + ", " + cap.n + " named)");
    T.ok(/cap/.test(capNote), "at the cap the button says it costs nothing more (" + capNote.trim() + ")");
    ov = await overflow(page);
    T.ok(ov.px <= 1, "no horizontal overflow with the sheet open (" + ov.px + " px)");

    /* a paid constant is now usable in the calculator */
    await page.keyboard.press("Alt+c");
    await page.keyboard.type("k");
    const kv = await resultText(page);
    T.ok(/^898774/.test(kv), "after paying, k works in the calculator (" + kv + ")");
    await press(page, ["AC"]);

    /* ── the charge reaches award() and results() ── */
    const paid = await page.evaluate(() => {
      const mult = PHYS.State.xpMultiplier();
      const got = SQ.UI.award("phys", { xp: 100, silent: true });
      return { got: got.xp, want: Math.round(100 * Math.min(4, mult) * 0.7), crutch: got.formulaCrutch };
    });
    T.ok(paid.got === paid.want && paid.crutch === 0.7, "SQ.UI.award pays ×0.7 (" + paid.got + " of 100)");
    await page.evaluate(() => SQ.UI.results("phys", { correct: 4, total: 5, xp: 70, delay: 0 }));
    const res = await until(page, () => { const m = document.querySelector("#modal-root .modal"); return m && m.textContent; }, { message: "no results modal" });
    T.ok(/Off-sheet lookups/.test(res) && /5/.test(res), "the results screen lists the lookups");
    await page.evaluate(() => SQ.UI.closeModal(true));

    /* ── the working pad ── */
    await page.keyboard.press("Alt+w");
    await until(page, () => !!document.querySelector(".sqt-canvas"), { message: "the pad did not open" });
    await page.waitForTimeout(350);          // let the sheet settle before measuring the canvas
    const box = await page.evaluate(() => { const r = document.querySelector(".sqt-canvas").getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; });
    await page.mouse.move(box.x + 20, box.y + 20);
    await page.mouse.down();
    await page.mouse.move(box.x + 120, box.y + 60, { steps: 6 });
    await page.mouse.up();
    await page.mouse.click(box.x + 200, box.y + 100);
    const drawn = await page.evaluate(() => {
      const c = document.querySelector(".sqt-canvas"), x = c.getContext("2d");
      const d = x.getImageData(0, 0, c.width, c.height).data;
      let ink = 0; for (let i = 3; i < d.length; i += 4) if (d[i]) ink++;
      return { ink, st: SQ.Tools.state.strokes, pens: document.querySelectorAll(".sqt-pen").length, widths: document.querySelectorAll(".sqt-width").length };
    });
    T.ok(drawn.ink > 50, "drawing on the pad leaves ink (" + drawn.ink + " px, strokes " + JSON.stringify(drawn.st) + ")");
    T.ok(drawn.pens === 4 && drawn.widths === 3, "4 colours and 3 widths");
    await page.click(".sqt-undo");
    await page.click(".sqt-undo");
    const undone = await page.evaluate(() => {
      const c = document.querySelector(".sqt-canvas"), d = c.getContext("2d").getImageData(0, 0, c.width, c.height).data;
      let ink = 0; for (let i = 3; i < d.length; i += 4) if (d[i]) ink++; return ink;
    });
    T.ok(undone === 0, "undo removes strokes");
    T.ok(await page.evaluate(() => document.querySelectorAll(".sqt-tape-line").length >= 1), "the calculator tape shows in Working");
    await page.fill(".sqt-notes", "v² = u² + 2as → solve for v. " + "x".repeat(5000));
    const saved = await page.evaluate(() => { SQ.Store.flush(); const t = JSON.parse(localStorage.getItem(SQ.Store.KEY)).tools;
      return { notes: t.pad.phys.notes, size: JSON.stringify(t).length }; });
    T.ok(/solve for v/.test(saved.notes) && saved.notes.length <= 4000, "pad notes persist, capped at 4 kB (" + saved.notes.length + ")");
    T.ok(saved.size <= 8192, "data.tools stays under 8 kB (" + saved.size + " B)");
    await page.evaluate(() => document.activeElement && document.activeElement.blur());
    ov = await overflow(page);
    T.ok(ov.px <= 1, "no horizontal overflow with the pad open (" + ov.px + " px)");

    /* ── unmount on route change, with a one-screen grace for the charge ── */
    await go(page, "plain");
    const gone = await page.evaluate(() => ({ fab: !!document.querySelector(".sqt-fab"), dock: !!document.querySelector(".sqt-dock"),
      attr: document.documentElement.dataset.tools || "", sheet: document.documentElement.dataset.sheet || "", p: SQ.Tools.penalty() }));
    T.ok(!gone.fab && !gone.dock && !gone.attr && !gone.sheet, "a route change removes the FAB, the tray and the reserved space");
    T.ok(gone.p === 0.7, "the charge still applies on the next screen (a separate results route cannot dodge it)");
    await go(page, "tooltest");
    await page.evaluate(() => { location.hash = "#/home"; });
    await page.waitForTimeout(150);
    await page.evaluate(() => { location.hash = "#/s/phys/plain"; });
    await page.waitForTimeout(150);
    T.ok((await page.evaluate(() => SQ.Tools.penalty())) === 1, "…and is gone once the run is two screens behind");

    /* ── an unscored mount never charges ── */
    await go(page, "practice");
    await page.keyboard.press("Alt+f");
    const practice = await page.evaluate(() => ({ secret: /SECRET-RANGE/.test(document.querySelector(".sqt-dock").innerHTML),
      pays: document.querySelectorAll(".sqt-pay").length, p: SQ.Tools.penalty(), l: SQ.Tools.lookups().length,
      rev: SQ.Tools.reveal("escape"), p2: SQ.Tools.penalty() }));
    T.ok(practice.secret && practice.pays === 0, "unscored: every entry is open, no Show buttons");
    T.ok(practice.p === 1 && practice.l === 0 && practice.p2 === 1, "unscored: nothing is ever charged");
    await page.keyboard.press("Alt+c");
    await page.keyboard.type("k");
    T.ok(/^898774/.test(await resultText(page)), "unscored: every constant works in the calculator");

    /* ── wider screen too ── */
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(100);
    ov = await overflow(page);
    T.ok(ov.px <= 1, "no horizontal overflow at 390 px");

    /* Other subject ports are built in parallel; their not-yet-written stylesheets
       404 from css/themes.css. Only a failure in the tray's own files counts. */
    const errs = page.errors.filter(e => !/Failed to load resource: net::ERR_FILE_NOT_FOUND/.test(e)).concat(failed);
    T.ok(errs.length === 0, "no console errors" + (errs.length ? ": " + errs.slice(0, 3).join(" | ") : ""));
  } catch (e) {
    T.ok(false, "tray test crashed: " + (e && e.stack || e));
  } finally {
    await browser.close();
  }
  T.done();
})();
