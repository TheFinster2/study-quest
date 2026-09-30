/* Answer marking — the part of MathQuest's calculator suite (tests/calc.js)
   that is about MARKING rather than the calculator UI, which is the shared
   tool tray's now (SQ.Tools, tested by its own suite).

   What stays this subject's business:
   · every typed answer field is a `.js-answer`, so the tray's "→ Answer" key
     finds it, and it is the field MathQuest's own parser marks;
   · a calculator-shaped answer (a decimal to calculator precision) is marked the
     same as the exact form a student types — MA.Expr / MA.U.parseNum, no eval;
   · filling the field the way the tray does (value + input event, no focus)
     and pressing Submit marks it — right answers pay, wrong ones do not.

     node tests/subjects/madv/marking.js */
const { launch, boot, checker } = require("../../lib/browser");

(async () => {
  const t = checker("madv marking");
  const browser = await launch();
  const page = await boot(browser, { subject: "madv" });
  const go = async h => { await page.evaluate(x => MA.UI.go(x), h); await page.waitForTimeout(350); };

  /* ── the parser marks calculator output and exact forms alike ── */
  const parse = await page.evaluate(() => {
    const U = MA.U, E = MA.Expr;
    const close = (a, b) => Math.abs(a - b) < 1e-9;
    return {
      // MathQuest's calculator arithmetic cases, through the marking parser
      sums: [["2+3*4", 14], ["(2+3)*4", 20], ["2^10", 1024], ["sqrt(2)^2", 2], ["ln(e^3)", 3],
             ["sin(pi/6)", 0.5], ["5!/3!", 20], ["10/4", 2.5]]
        .map(([s, v]) => close(U.parseNum(s), v)),
      exactVsDecimal: U.numClose(String(Math.SQRT1_2.toFixed(10)), Math.SQRT1_2) &&
                      U.numClose("sqrt(2)/2", Math.SQRT1_2),
      wrongRejected: !U.numClose("0.70", Math.SQRT1_2),
      noEval: !/\beval\s*\(|new Function/.test(String(E.evaluate) + String(E.tryParse))
    };
  });
  t.ok(parse.sums.every(Boolean), "calculator arithmetic is evaluated the same way by the marker", parse.sums.join(","));
  t.ok(parse.exactVsDecimal, "a 10-digit calculator decimal and the exact form are both accepted");
  t.ok(parse.wrongRejected, "a 2-d.p. approximation is not accepted for an exact answer");
  t.ok(parse.noEval, "marking never calls eval() or new Function()");

  /* ── every typed mode exposes its answer field to the tool tray ── */
  for (const mode of ["crunch", "equiv", "lab", "vector"]) {
    await go("/game/" + mode);
    if (mode === "lab" || mode === "vector") {
      /* These ask for the number after the simulation step; reach it via the
         mode's own flow when it is rendered, otherwise just check the markup. */
      await page.waitForTimeout(300);
    }
    const r = await page.evaluate(() => {
      const inputs = [...document.querySelectorAll("#view input.numin")];
      return { n: inputs.length, all: inputs.every(i => i.classList.contains("js-answer")) };
    });
    t.ok(r.all, `${mode}: every answer field is a .js-answer (${r.n} on screen)`);
    await page.evaluate(() => SQ.UI.closeModal(true));
  }

  /* ── filled like the tray fills it, then submitted ── */
  async function fillAndSubmit(value) {
    return page.evaluate(v => {
      const input = document.querySelector("#view .js-answer");
      if (!input) return null;
      input.value = String(v);                                   // no focus, like "→ Answer"
      input.dispatchEvent(new Event("input", { bubbles: true }));
      const submit = [...document.querySelectorAll("#view button")].find(b => /Submit/.test(b.textContent) && !b.disabled);
      submit.click();
      const fb = document.querySelector("#view .feedback");
      return { cls: fb ? fb.className : "", focused: document.activeElement === input };
    }, value);
  }
  await go("/game/crunch");
  await page.waitForTimeout(1300);                               // clear the read floor
  const ans = await page.evaluate(() => MA.__current.answer);
  const right = await fillAndSubmit(Number(ans).toPrecision(12));
  t.ok(right && /\bok\b/.test(right.cls), "a calculator-precision decimal of the answer is marked correct", JSON.stringify(right));

  await go("/game/crunch");
  await page.waitForTimeout(1300);
  const ans2 = await page.evaluate(() => MA.__current.answer);
  const wrong = await fillAndSubmit(Number(ans2) + 7.5);
  t.ok(wrong && !/\bok\b/.test(wrong.cls), "a wrong value is not", JSON.stringify(wrong));

  const errs = page.errors.filter(e => !/Failed to load resource/.test(e));
  t.ok(errs.length === 0, "no console errors", errs.slice(0, 3).join(" | "));
  await browser.close();
  t.done();
})().catch(e => { console.error(e); process.exit(1); });
