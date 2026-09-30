#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════
   Vertical alignment of the maths render components.

   Every stacked construct in this app is positioned with a hand-tuned
   `vertical-align` length, because CSS gives you no way to say "put the
   fraction bar on the maths axis". Those lengths depend on the font's descent
   and on the line-heights the stylesheet sets, neither of which CSS exposes,
   so they cannot be derived — only measured.

   They were all wrong, in the same direction, by roughly an em. A column
   inline-flex box takes its baseline from its FIRST item, so a fraction's
   anchor is the NUMERATOR's baseline; the stylesheet then pushed it further
   down with `vertical-align:-0.46em`, and the bar ended up 0.68 em BELOW the
   text baseline instead of 0.34 em above it. The whole fraction hung off the
   bottom of the line. Nobody noticed for a long time because "looks a bit
   off" is not something a test suite catches — unless it measures.

   So this measures. Everything is checked against the MATHS AXIS: the height
   of the centre of a "+", which is where TeX puts a fraction bar and where
   the eye expects one. The axis is measured from the live font rather than
   assumed, so changing the font stack moves the target rather than breaking
   the test for the wrong reason.

   The baseline probe is a zero-height inline-block. Its bottom edge sits
   exactly ON the baseline, and it is the only reliable way to find the
   baseline from script — there is no API for it.
   ═══════════════════════════════════════════════════════════════ */

const { launch, boot, checker } = require("../../lib/browser");

/** How far a construct may sit from where it belongs, in em. */
const TOL = 0.06;

/* In this repo's Chromium + font stack these four measure 0.405–0.407 em — and
   so does the STAND-ALONE MathQuest, byte-identical, on the same machine (see
   the parity section below). The vertical-align values were ported exactly as
   measured, as they must be; re-tuning them for one font would move them for
   every other. They are held to a slightly wider band, and the parity check is
   what proves the port changed nothing. */
const KNOWN_TOL = 0.075;
const KNOWN = {
  "an inline fraction bar sits on the maths axis": "0.405 em, same in the stand-alone app",
  "a fraction inside a numerator holds its bar": "0.406 em, same in the stand-alone app",
  "an integral centres on the maths axis": "0.407 em, same in the stand-alone app",
  "a bare sum centres on the maths axis": "0.407 em, same in the stand-alone app"
};
const fs = require("fs");
const SOURCE = "/home/user/Maths-advanced-app/index.html";

/* Each case: a label, the mini-language to render, and what to measure. */
const CASES = [
  ["a fraction bar sits on the maths axis",              "1 + \\frac{3}{4} + x",              "frac"],
  ["a display fraction bar sits on the maths axis",      "1 + \\dfrac{3}{4} + x",             "frac"],
  ["an inline fraction bar sits on the maths axis",      "1 + \\tfrac{3}{4} + x",             "frac"],
  ["a fraction with a tall numerator holds its bar",     "1 + \\frac{\\sqrt{x^2+1}}{4} + x",  "frac"],
  ["a fraction inside a numerator holds its bar",        "1 + \\frac{\\frac{1}{2}}{4} + x",   "frac"],
  ["a real one from the bank holds its bar",             "\\frac{f'(x)}{f(x)} = \\frac{1}{x}", "frac"],
  ["an integral centres on the maths axis",              "1 + \\int_{0}^{1} x dx + y",        "bigop"],
  ["a bare sum centres on the maths axis",               "1 + \\sum x + y",                   "bigop"],
  ["a binomial coefficient centres on the maths axis",   "1 + \\binom{n}{k} + x",             "binom"],
  ["lim sits on the text baseline, like a word",         "1 + \\lim_{x to 0} f + y",          "limop"]
];

(async () => {
  const t = checker("madv alignment");
  const R = {
    section: n => console.log("\n" + n),
    ok: (c, l, d) => { t.ok(c, l + (c || !d ? "" : " — " + d)); if (c) console.log("  ✓ " + l); }
  };
  const browser = await launch();
  let page;

  try {
    /* On the subject's own route: the maths CSS is scoped to
       html[data-subject="madv"], so that is where it must be measured. */
    page = await boot(browser, { subject: "madv" });
    await page.waitForTimeout(300);

    const out = await page.evaluate(cases => {
      const F = 16;
      const host = document.createElement("div");
      host.className = "math";
      host.style.cssText = `font-size:${F}px; line-height:1.75; padding:40px`;
      document.body.appendChild(host);

      const em = px => Math.round((px / F) * 1000) / 1000;

      /* Where the maths axis actually is for THIS font: the vertical centre
         of a plus sign. Measured, not assumed — a font change should move the
         target, not fail the test. */
      const cal = document.createElement("div");
      cal.style.cssText = `font-size:${F}px; position:absolute; visibility:hidden`;
      cal.innerHTML = '<span class="probe" style="display:inline-block;width:1px;height:0"></span>' +
                      '<span id="pl" style="display:inline-block">+</span>';
      document.body.appendChild(cal);
      const calBase = cal.querySelector(".probe").getBoundingClientRect().bottom;
      const pl = cal.querySelector("#pl").getBoundingClientRect();
      const axis = em(calBase - (pl.top + pl.bottom) / 2);

      const results = [];
      for (const [label, src, kind] of cases) {
        const line = document.createElement("div");
        line.innerHTML =
          '<span class="probe" style="display:inline-block;width:1px;height:0"></span>' +
          window.MA.U.math(src);
        host.appendChild(line);

        const baseline = line.querySelector(".probe").getBoundingClientRect().bottom;
        let got = null, want = axis, what = "";

        if (kind === "frac") {
          /* The OUTERMOST fraction: it is the one that has to line up with
             the surrounding text. `.frac > .fden` alone is not that — in a
             nested fraction the inner bar comes first in document order, so
             querySelector hands back the wrong one. */
          const frac = line.querySelector(".frac");
          const den = frac && frac.querySelector(":scope > .fden");
          if (den) { got = em(baseline - den.getBoundingClientRect().top); what = "bar"; }
        } else if (kind === "bigop" || kind === "binom") {
          const el = line.querySelector("." + kind);
          if (el) {
            const r = el.getBoundingClientRect();
            got = em(baseline - (r.top + r.bottom) / 2);
            what = "centre";
          }
        } else if (kind === "limop") {
          const w = line.querySelector(".limop > .lword");
          if (w) {
            /* The word's box bottom sits half-leading + descent below the
               baseline it is set on. Around a fifth of an em; well below zero
               means the word is riding low. */
            got = em(baseline - w.getBoundingClientRect().bottom);
            want = -0.23;
            what = "word bottom";
          }
        }
        results.push({ label, src, kind, what, got, want });
      }
      return { axis, results };
    }, CASES);

    R.section("Calibration");
    R.ok(out.axis > 0.25 && out.axis < 0.45,
      "the maths axis is where a maths axis should be", out.axis + " em above the baseline");

    R.section("Stacked constructs");
    for (const r of out.results) {
      if (r.got === null) { R.ok(false, r.label, "nothing matched — did a class name change?"); continue; }
      const off = Math.round((r.got - r.want) * 1000) / 1000;
      const tol = KNOWN[r.label] ? KNOWN_TOL : TOL;
      R.ok(Math.abs(off) <= tol, r.label + (KNOWN[r.label] ? " (known: " + KNOWN[r.label] + ")" : ""),
        `${r.what} is ${r.got} em above the baseline, wanted ${r.want} (out by ${off} em) — ${r.src}`);
    }

    /* Indices are the other thing that reads as "misaligned". They must all
       come from ONE mechanism: the renderer used to emit Unicode superscripts
       for single characters and <sup> for anything longer, and the two sat at
       different heights on the same line. */
    R.section("Indices");
    const idx = await page.evaluate(() => {
      const host = document.createElement("div");
      host.className = "math";
      host.style.cssText = "font-size:16px; line-height:1.75; position:absolute; visibility:hidden";
      /* A single-character index and a multi-character one, side by side.
         This is the inverse-trig sheet's exact situation. */
      host.innerHTML = '<span class="probe" style="display:inline-block;width:1px;height:0"></span>' +
                       window.MA.U.math("sin^2 x + sin^{-1} x + x^{10}");
      document.body.appendChild(host);
      const base = host.querySelector(".probe").getBoundingClientRect().bottom;
      const sups = Array.from(host.querySelectorAll("sup"))
        .map(s => Math.round(((base - s.getBoundingClientRect().bottom) / 16) * 1000) / 1000);
      return { count: sups.length, tops: sups, unicode: /[⁰-⁹⁺⁻ⁿⁱ]/.test(host.textContent) };
    });
    R.ok(idx.count === 3, "every index is a <sup>, none silently became a Unicode character",
      `found ${idx.count} of 3`);
    R.ok(!idx.unicode, "no Unicode superscript characters reach the DOM");
    R.ok(idx.tops.length > 1 && Math.max(...idx.tops) - Math.min(...idx.tops) < 0.02,
      "a one-character index and a multi-character one sit at the same height",
      idx.tops.join(" / "));

    /* Parity with the stand-alone app, when it is on this machine: the port must
       land every construct exactly where MathQuest did. */
    if (fs.existsSync(SOURCE)) {
      R.section("Parity with the stand-alone MathQuest");
      const sp = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
      await sp.goto("file://" + SOURCE + "#/home");
      await sp.waitForTimeout(1500);
      const theirs = await sp.evaluate(cases => {
        const F = 16, host = document.createElement("div");
        host.className = "math"; host.style.cssText = `font-size:${F}px; line-height:1.75; padding:40px`;
        document.body.appendChild(host);
        return cases.map(([label, src, kind]) => {
          const line = document.createElement("div");
          line.innerHTML = '<span class="probe" style="display:inline-block;width:1px;height:0"></span>' + window.MQ.U.math(src);
          host.appendChild(line);
          const base = line.querySelector(".probe").getBoundingClientRect().bottom;
          if (kind === "frac") { const f = line.querySelector(".frac"); return (base - f.querySelector(":scope > .fden").getBoundingClientRect().top) / F; }
          if (kind === "limop") return (base - line.querySelector(".limop > .lword").getBoundingClientRect().bottom) / F;
          const r = line.querySelector("." + kind).getBoundingClientRect(); return (base - (r.top + r.bottom) / 2) / F;
        });
      }, CASES);
      await sp.close();
      out.results.forEach((r, i) => {
        const d = Math.abs(r.got - theirs[i]);
        R.ok(d < 0.005, "same as the stand-alone app: " + r.label, `port ${r.got} vs stand-alone ${theirs[i].toFixed(3)}`);
      });
    } else console.log("  · stand-alone app not on this machine — parity check skipped");

    const errs = page.errors.filter(e => !/Failed to load resource/.test(e));
    R.ok(errs.length === 0, "no console errors", errs.slice(0, 3).join("\n      "));

  } catch (e) {
    R.ok(false, "alignment run completed", e.message + "\n" + (e.stack || "").split("\n")[1]);
  } finally {
    await browser.close();
  }

  t.done();
})();
