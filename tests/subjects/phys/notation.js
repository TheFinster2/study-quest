/* tests/notation.js — PHYSICS-BRIEF.md §6.4.
   Is the fraction bar actually on the maths axis? Do superscripts leave the line box
   alone? Measured, not eyeballed: the failure mode here is silent and every number
   below is a defect that shipped in a sibling app.

   Fixture: docs/notation-reference.html, which loads the SHIPPED stylesheet and the
   SHIPPED renderer, so this measures the app rather than a copy of it.

   Also writes docs/notation.png. Look at it after any change to the stylesheet — the
   150px runaway radical passed every numeric assertion at the time it was introduced;
   the picture is what showed it.

   Run:  node tests/notation.js
         BREAK=1 node tests/notation.js   (patch out the fix, expect a failure) */
const path = require("path");
const fs = require("fs");
const { chromium, EXE } = require("../../lib/browser");

const ROOT = path.join(__dirname, "..", "..", "..");
const HERE = __dirname;
const BREAK = !!process.env.BREAK;

(async () => {
  let cssPath = path.join(ROOT, "subjects/phys/css/phys.css");
  let fixture = path.join(HERE, "notation-reference.html");
  const cleanup = [];

  if (BREAK) {
    /* Reproduce the sibling apps' defect exactly: build the fraction as an
       inline-flex column and give sub/sup the vertical-align keywords. If the
       assertions below still pass after that, they are testing nothing. */
    const src = fs.readFileSync(cssPath, "utf8");
    const broken = src
      .replace(/\.frac\{\s*\n\s*display:inline-grid;[^}]*\}/,
               ".frac{ display:inline-flex; flex-direction:column; text-align:center; }")
      .replace(/\.sup, html\[data-subject="phys"\] \.sub\{[^}]*\}/,
               '.sup, html[data-subject="phys"] .sub{ font-size:.72em; }')
      .replace(/\.sup\{ top:-\.46em; \}/, ".sup{ vertical-align:super; }")
      .replace(/\.sub\{ top: \.26em; \}/, ".sub{ vertical-align:sub; }");
    if (broken === src) {
      console.log("❌ BREAK=1 patched nothing — the regexes no longer match the stylesheet.");
      process.exit(2);
    }
    const tmpCss = path.join(HERE, "_broken.css");
    const tmpHtml = path.join(HERE, "_broken.html");
    fs.writeFileSync(tmpCss, broken);
    fs.writeFileSync(tmpHtml,
      fs.readFileSync(fixture, "utf8").replace("../../../subjects/phys/css/phys.css", "_broken.css"));
    cleanup.push(tmpCss, tmpHtml);
    fixture = tmpHtml;
    console.log("BREAK=1: fraction rebuilt as inline-flex column, sub/sup on vertical-align.\n");
  }

  const b = await chromium.launch({ executablePath: EXE });
  const p = await b.newPage({ viewport: { width: 820, height: 1000 }, deviceScaleFactor: 2 });
  const errs = [];
  p.on("pageerror", e => errs.push(String(e)));
  p.on("console", m => { if (m.type() === "error") errs.push(m.text()); });
  await p.goto("file://" + fixture);
  await p.waitForFunction(() => !!document.querySelector("#good .frac, #good .bad-frac"))
        .catch(() => {});
  await p.waitForTimeout(250);

  const m = await p.evaluate(() => {
    /* The maths axis of a line of text is baseline − xHeight/2. Append a zero-width
       probe of height 1ex aligned to the baseline and read its rect: `bottom` is the
       baseline, `height` is the x-height. */
    function axisOf(row) {
      const probe = document.createElement("span");
      probe.className = "probe";
      row.appendChild(probe);
      const r = probe.getBoundingClientRect();
      probe.remove();
      return { baseline: r.bottom, xHeight: r.height, axis: r.bottom - r.height / 2 };
    }
    const out = {};

    const goodRow = document.querySelector("#good");
    const badRow = document.querySelector("#bad");
    const ga = axisOf(goodRow), ba = axisOf(badRow);
    // The border-top on .den IS the bar, so its top edge is what must land on the axis.
    const den = document.querySelector("#good .frac > .den")
             || document.querySelector("#good .frac > span:last-child");
    out.good = { axis: ga.axis, bar: den.getBoundingClientRect().top, x: ga.xHeight };
    const badDen = document.querySelector("#bad .bad-frac > span:last-child");
    out.bad = { axis: ba.axis, bar: badDen.getBoundingClientRect().top, x: ba.xHeight };

    // Line-box disturbance: two otherwise identical lines, one full of exponents.
    out.plain = document.querySelector("#plain").getBoundingClientRect().height;
    out.withsup = document.querySelector("#withsup").getBoundingClientRect().height;

    // Radicals: the overline must clear tall content, and the DRAWN svg (not its
    // stretched flex box, which is full height regardless) must match the body.
    const sq = [...document.querySelectorAll(".sqrt")];
    out.sqrtCount = sq.length;
    out.sqrtOverlap = 0;
    sq.forEach(s => {
      const body = s.querySelector(".body");
      const bar = body.getBoundingClientRect().top;
      body.querySelectorAll("*").forEach(ch => {
        const r = ch.getBoundingClientRect();
        if (r.height && r.top < bar - 0.5) out.sqrtOverlap = Math.max(out.sqrtOverlap, bar - r.top);
      });
    });
    const tall = sq.map(s => {
      const g = s.querySelector(".rad svg").getBoundingClientRect();
      const body = s.querySelector(".body").getBoundingClientRect();
      return { gap: Math.abs(g.top - body.top), ratio: g.height / body.height };
    });
    out.radGap = tall.length ? Math.max(...tall.map(t => t.gap)) : 0;
    out.radRatio = tall.map(t => t.ratio);

    /* A superscript INSIDE a radical must still be raised. It stopped being, silently:
       the flex body made each run its own flex item and align-items:center dropped the
       exponent back onto the middle of the line. Numbers above all still passed — only
       the screenshot showed it. Compare the exponent against the baseline text sitting
       beside it in the same radicand. */
    out.radSupRaise = null;
    for (const s of sq) {
      const sup = s.querySelector(".sup");
      if (!sup) continue;
      const host = sup.parentNode;
      // Measure the plain text of the radicand with a Range — element rects would
      // include the exponent we are comparing against.
      let plain = null;
      for (const n of host.childNodes) {
        if (n.nodeType === 3 && n.textContent.trim()) {
          const r = document.createRange();
          r.selectNodeContents(n);
          const rect = r.getBoundingClientRect();
          if (rect.height) { plain = rect; break; }
        }
      }
      if (!plain) continue;
      out.radSupRaise = plain.bottom - sup.getBoundingClientRect().bottom;
      break;
    }

    // Nuclear stack: the two rows' right edges must line up against the symbol.
    const ud = [...document.querySelectorAll(".updown")].map(u => {
      const k = [...u.children].map(c => c.getBoundingClientRect());
      return Math.abs(k[0].right - k[1].right);
    });
    out.nucRightDelta = ud.length ? Math.max(...ud) : 99;
    out.nucCount = ud.length;

    // Escaping: the fixture feeds the renderer a <script> tag and a bare &.
    out.injected = document.querySelectorAll("#xss script").length;
    out.xssText = document.querySelector("#xss").textContent;

    // Horizontal overflow of the page itself.
    out.overflow = document.documentElement.scrollWidth - document.documentElement.clientWidth;
    return out;
  });

  const off = o => o.bar - o.axis;
  const tol = m.good.x * 0.12;                       // 12% of x-height

  console.log(`  bad  (inline-flex column):   bar is ${off(m.bad).toFixed(2)}px from the maths axis (x-height ${m.bad.x.toFixed(1)}px)`);
  console.log(`  good (inline-grid + middle): bar is ${off(m.good).toFixed(2)}px from the maths axis (tolerance ${tol.toFixed(2)}px)`);
  console.log(`  line height without superscripts: ${m.plain.toFixed(2)}px, with: ${m.withsup.toFixed(2)}px`);
  console.log(`  nuclear sub/sup right edges differ by ${m.nucRightDelta.toFixed(2)}px (${m.nucCount} stacks)`);
  console.log(`  radical height / content height: ${m.radRatio.map(r => r.toFixed(2)).join(", ")}`);
  console.log(`  superscript inside a radical is raised ${(m.radSupRaise||0).toFixed(2)}px`);
  console.log(`  radical overline cuts into its content by ${m.sqrtOverlap.toFixed(2)}px; drawn radical meets the bar within ${m.radGap.toFixed(2)}px`);
  console.log(`  escaped markup: ${m.injected} injected <script> elements`);

  const fails = [];
  if (Math.abs(off(m.good)) > tol)
    fails.push(`fraction bar off the maths axis by ${off(m.good).toFixed(2)}px (tolerance ${tol.toFixed(2)})`);
  if (Math.abs(m.plain - m.withsup) > 0.5)
    fails.push(`superscripts changed the line height by ${(m.withsup - m.plain).toFixed(2)}px`);
  if (m.nucCount < 3) fails.push(`expected 3 nuclear stacks in the fixture, found ${m.nucCount}`);
  if (m.nucRightDelta > 0.5)
    fails.push(`nuclear sub/sup not aligned (${m.nucRightDelta.toFixed(2)}px)`);
  if (m.sqrtCount < 2) fails.push(`expected 2 radicals in the fixture, found ${m.sqrtCount}`);
  if (m.sqrtOverlap > 0.5)
    fails.push(`the radical overline strikes through its own content by ${m.sqrtOverlap.toFixed(2)}px`);
  if (m.radGap > 1.5)
    fails.push(`the drawn radical starts ${m.radGap.toFixed(2)}px away from the overline instead of meeting it`);
  if (m.radSupRaise === null)
    fails.push("no radical in the fixture contains a superscript — that regression is untested");
  else if (m.radSupRaise < 1.5)
    fails.push(`a superscript inside a radical is only raised ${m.radSupRaise.toFixed(2)}px above the radicand's baseline text`);
  // Both directions: too short leaves the hook floating, too tall means the svg fell
  // back to its intrinsic 150px and towers over the line.
  const badRatio = m.radRatio.filter(r => r < 0.95 || r > 1.05);
  if (badRatio.length)
    fails.push(`radical height does not match its content (ratios ${m.radRatio.map(r => r.toFixed(2)).join(", ")})`);
  if (m.injected) fails.push(`${m.injected} <script> element(s) got through the renderer — XSS`);
  if (!/alert\(1\)/.test(m.xssText)) fails.push("the escaped markup is not present as text either — check the fixture");
  if (m.overflow > 1) fails.push(`the fixture overflows horizontally by ${m.overflow}px`);
  if (errs.length) fails.push("console/page errors: " + errs.join(" | "));
  // Without this the whole comparison could pass on a page where nothing renders.
  if (Math.abs(off(m.bad)) < tol)
    fails.push("the 'bad' control is not actually misaligned — the comparison proves nothing");

  await p.screenshot({ path: path.join(HERE, "notation.png"), fullPage: true });
  await b.close();
  cleanup.forEach(f => { try { fs.unlinkSync(f); } catch (e) { /* ignore */ } });

  if (BREAK) {
    if (fails.length) {
      console.log("\n✅ BREAK=1 failed as it must:\n   " + fails.join("\n   "));
      process.exit(0);
    }
    console.log("\n❌ BREAK=1 PASSED — this test does not actually test the fix.");
    process.exit(1);
  }
  if (fails.length) { console.log("\n❌ " + fails.join("\n   ")); process.exit(1); }
  console.log("\n✅ Notation aligns. Screenshot: tests/subjects/phys/notation.png");
})();
