/* Browser helpers for the Economics suites, over tests/lib/browser.js. */
"use strict";
const B = require("../../lib/browser.js");

const SAVE = (extra) => Object.assign({
  settings: { onboarded: true, sound: false, motion: "off" },
  enrolled: ["econ"], migrateOffered: true
}, extra || {});

async function open(opts) {
  const o = opts || {};
  const browser = await B.launch();
  const page = await B.boot(browser, { subject: "econ", viewport: { width: o.width || 390, height: o.height || 844 }, save: o.save || SAVE(o.extra) });
  return { browser, page, errors: page.errors };
}

/** Navigate inside Economics and wait for the view to have content. */
async function go(page, route) {
  await page.evaluate((h) => { SQ.UI.closeModal(true); location.hash = h; }, "#/s/econ/" + route.replace(/^\//, ""));
  await page.waitForFunction(() => { const v = document.querySelector("#view"); return v && v.children.length > 0; }, null, { timeout: 5000 }).catch(() => {});
  await page.waitForTimeout(250);
}

/** One generic "play" step. Returns what it did. */
async function step(page, how) {
  return page.evaluate((mode) => {
    const $$ = (s) => [...document.querySelectorAll(s)];
    const modal = document.querySelector("#modal-root:not([hidden]) .modal");
    if (modal) {
      if (modal.querySelector(".js-again")) return "results";
      const b = modal.querySelector(".btn-primary") || modal.querySelector("button");
      if (b) { b.click(); return "modal"; }
    }
    const opts = $$("#view .opt:not([disabled])");
    if (opts.length) {
      let pick = opts[0];
      if (mode === "right") pick = opts.find((o) => o.dataset.right === "1") || opts[0];
      if (mode === "wrong") pick = opts.find((o) => o.dataset.right !== "1") || opts[0];
      pick.click(); return "answered";
    }
    const byText = (re) => $$("#view button").find((b) => !b.disabled && re.test(b.textContent));
    const flip = byText(/show the answer/i); if (flip) { flip.click(); return "flip"; }
    const grade = $$("#view .btn-sm").find((b) => b.textContent.trim() === (mode === "right" ? "Good" : "Easy"));
    if (grade) { grade.click(); return "grade"; }
    const ta = document.querySelector("#view .rb-answer:not([readonly])");
    if (ta && mode === "right" && !ta.value) { ta.value = "A full answer that names the concept, explains the mechanism step by step and links it to the outcome with an example."; ta.dispatchEvent(new Event("input")); return "wrote"; }
    const reveal = byText(/reveal the marking/i); if (reveal) { reveal.click(); return "reveal"; }
    const crit = $$("#view .crit-item input").filter((c) => !c.checked);
    if (crit.length) { crit.forEach((c) => c.click()); return "ticked"; }
    const rec = byText(/record and continue/i); if (rec) { rec.click(); return "record"; }
    const chip = document.querySelector("#view .dg-bank .dg-chip:not(.done)");
    if (chip && document.querySelector("#view .dg-hit")) {
      chip.click();
      const hit = (document.querySelector('#view .dg-hit[data-part="' + chip.dataset.part + '"]')) || document.querySelector("#view .dg-hit");
      hit.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      return "label";
    }
    if (chip) {
      // Process Order: the driver knows the order (it is testing screens, not the student)
      const chips = [...document.querySelectorAll("#view .dg-bank .dg-chip")];
      const seq = ECON.Bank.all("sequence").find((q) => chips.every((c) => q.steps.indexOf(c.textContent) >= 0));
      if (seq && mode !== "wrong") {
        const n = document.querySelectorAll("#view .list .li .badge").length;
        const want = chips.find((c) => c.textContent === seq.steps[n]);
        if (want) { want.click(); return "chip"; }
      }
      chip.click(); return "chip";
    }
    const restart = byText(/restart/i);
    if (restart && document.querySelector("#view .why.no")) { restart.click(); return "restart"; }
    const check = byText(/check order/i); if (check) { check.click(); return "check"; }
    const nxt = $$("#view .gs-body .btn-primary:not([disabled])").pop(); if (nxt) { nxt.click(); return "next"; }
    return "stuck";
  }, how || "first");
}

/** Horizontal overflow of the page and of anything Economics renders (the view
    and modals). The core's fixed chrome is the core's to test. */
async function overflow(page) {
  return page.evaluate(() => {
    const d = document.documentElement;
    const wide = [...document.querySelectorAll("#view *, #modal-root *")]
      .filter((n) => { const r = n.getBoundingClientRect(); return r.width && (r.right > d.clientWidth + 1 || r.left < -1); })
      .slice(0, 4).map((n) => (n.tagName + "." + (typeof n.className === "string" ? n.className : "")).slice(0, 60));
    return { px: d.scrollWidth - d.clientWidth, wide };
  });
}

module.exports = Object.assign({}, B, { SAVE, open, go, step, overflow });
