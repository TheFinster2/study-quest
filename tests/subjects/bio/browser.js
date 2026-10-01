/* Biology's browser-test plumbing, over the shared tests/lib/browser.js.
   Keeps Biosphere's helpers (goto with Biology paths, overlaps, squeezed,
   overflow, reporter) so its suites port with minimal change. */
"use strict";
const L = require("../../lib/browser.js");
const ROOT = L.ROOT;

async function launch(opts) {
  const o = opts || {};
  const browser = await L.launch();
  const save = o.save || { settings: { onboarded: true, sound: false, motion: "off" }, enrolled: ["bio"], migrateOffered: true };
  const page = await L.boot(browser, { subject: "bio", save, viewport: { width: o.width || 360, height: o.height || 740 } });
  await page.waitForTimeout(300);
  return { page, browser, errors: page.errors, async close() { await browser.close(); } };
}

/** Navigate to a Biology path ("/play/drill?mod=M1") and wait for content. */
async function goto(page, p) {
  await page.evaluate((h) => { SQ.UI.closeModal(true); window.BIO.UI.go(h); }, p);
  await page.waitForFunction(() => {
    const v = document.querySelector("#view");
    return v && v.children.length > 0 && !v.querySelector(".loading-subject");
  }, null, { timeout: 4000 }).catch(() => {});
  await page.waitForTimeout(180);
}

async function dismissModal(page) { await page.evaluate(() => SQ.UI.closeModal(true)); }

/* Overlap check.

   Horizontal overflow catches content that spills past the viewport. It does
   NOT catch content that collides with a sibling inside the viewport, which
   is how the top bar shipped with the stat chips painted over the brand name:
   nothing overflowed the document, the grid tracks simply overlapped.

   So: for every row-like container, compare the bounding boxes of its
   visible direct children and report any pair that intersects by more than a
   couple of pixels. Deliberately narrow — it only looks at containers that
   are supposed to lay children out side by side, because a badge absolutely
   positioned over a card is legitimate and common. */
async function overlaps(page) {
  return page.evaluate(() => {
    const ROWS = ["#topbar", ".gs-meters", ".spread", ".row", ".seg", ".li", ".powerbar", ".navbar", ".ghead"];
    const out = [];
    const seen = new Set();
    const name = (e) => e.tagName.toLowerCase() +
      (e.id ? "#" + e.id : "") +
      (typeof e.className === "string" && e.className ? "." + e.className.trim().split(/\s+/)[0] : "");

    document.querySelectorAll(ROWS.join(",")).forEach((row) => {
      const kids = [...row.children].filter((k) => {
        const cs = getComputedStyle(k);
        if (cs.display === "none" || cs.visibility === "hidden" || cs.position === "absolute") return false;
        const r = k.getBoundingClientRect();
        return r.width > 0 && r.height > 0;
      });
      for (let i = 0; i < kids.length; i++) {
        for (let j = i + 1; j < kids.length; j++) {
          const a = kids[i].getBoundingClientRect();
          const b = kids[j].getBoundingClientRect();
          const ox = Math.min(a.right, b.right) - Math.max(a.left, b.left);
          const oy = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
          if (ox > 2 && oy > 2) {
            const key = name(row) + ">" + name(kids[i]) + "|" + name(kids[j]);
            if (seen.has(key)) continue;
            seen.add(key);
            out.push(name(kids[i]) + " overlaps " + name(kids[j]) +
                     " by " + Math.round(ox) + "x" + Math.round(oy) + "px inside " + name(row));
          }
        }
      }
    });
    return out;
  });
}

/* Squeezed-text check.

   The sibling of the overlap check, and the one that actually caught the top
   bar. An element with overflow:hidden that has been compressed to a small
   fraction of the text it contains is not "truncated gracefully" — it is
   gone. A chip losing its last few characters to an ellipsis is fine; a
   nine-character brand name rendered in 28px is a layout failure.

   The thresholds are deliberately generous so that legitimate ellipsis
   truncation does not register: an element must be BOTH under 45% of its
   content width AND narrower than 60px before it counts. */
async function squeezed(page) {
  return page.evaluate(() => {
    const out = [];
    const name = (e) => e.tagName.toLowerCase() +
      (e.id ? "#" + e.id : "") +
      (typeof e.className === "string" && e.className ? "." + e.className.trim().split(/\s+/)[0] : "");

    document.querySelectorAll("#view *, #topbar *, #navbar *").forEach((e) => {
      const cs = getComputedStyle(e);
      if (cs.display === "none" || cs.visibility === "hidden") return;
      if (cs.overflowX !== "hidden" && cs.overflowX !== "clip") return;
      if (!e.textContent || !e.textContent.trim()) return;
      if (e.children.length) return;                  // leaf text nodes only
      const w = e.getBoundingClientRect().width;
      const need = e.scrollWidth;
      if (need < 20) return;
      if (w < need * 0.45 && w < 60) {
        out.push(name(e) + ' shows ' + Math.round(w) + 'px of ' + need + 'px ("' +
                 e.textContent.trim().slice(0, 24) + '")');
      }
    });
    return out;
  });
}

/* Horizontal overflow check — H6 in the addendum. */
async function overflow(page) {
  return page.evaluate(() => {
    const de = document.documentElement;
    const over = [];
    if (de.scrollWidth > de.clientWidth + 1) over.push("document scrollWidth " + de.scrollWidth + " > " + de.clientWidth);
    // An element inside a deliberately scrollable container (a wide table, the
    // module filter strip) is not page overflow — the page itself must not
    // scroll sideways, which is what the scrollWidth check above tests.
    const inScroller = (el) => {
      for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
        const ox = getComputedStyle(p).overflowX;
        if (ox === "auto" || ox === "scroll") return true;
      }
      return false;
    };
    document.querySelectorAll("body *").forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) return;
      if (inScroller(el)) return;
      if (r.right > de.clientWidth + 1.5 || r.left < -1.5) {
        over.push((el.tagName + (el.className ? "." + String(el.className).split(" ")[0] : "")) +
          " spans " + Math.round(r.left) + "→" + Math.round(r.right));
      }
    });
    return over.slice(0, 6);
  });
}

/* Horizontal overflow: the page must not scroll sideways, and nothing outside
   a deliberate scroller may poke past the viewport. Fixed chrome is excluded. */
async function overflow(page) {
  return page.evaluate(() => {
    const de = document.documentElement;
    const over = [];
    if (de.scrollWidth > de.clientWidth + 1) over.push("document scrollWidth " + de.scrollWidth + " > " + de.clientWidth);
    const inScroller = (el) => {
      for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
        const ox = getComputedStyle(p).overflowX;
        if (ox === "auto" || ox === "scroll") return true;
      }
      return false;
    };
    document.querySelectorAll("#view *").forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) return;
      if (inScroller(el)) return;
      if (getComputedStyle(el).position === "fixed") return;
      if (r.right > de.clientWidth + 1.5 || r.left < -1.5) {
        over.push((el.tagName + (el.className ? "." + String(el.className).split(" ")[0] : "")) +
          " spans " + Math.round(r.left) + "→" + Math.round(r.right));
      }
    });
    return over.slice(0, 6);
  });
}

function reporter(name) {
  const fails = [];
  let checks = 0;
  return {
    check(cond, msg) { checks++; if (!cond) fails.push(msg); return !!cond; },
    fail(msg) { checks++; fails.push(msg); },
    async done(rig) {
      if (rig) await rig.close();
      if (fails.length) {
        console.log("\n  " + fails.length + " FAILURE(S):");
        fails.slice(0, 40).forEach((f) => console.log("    ✗ " + f));
        console.log("\n" + name + ": FAIL  (" + checks + " checks)\n");
        process.exit(1);
      }
      console.log("\n" + name + ": PASS  (" + checks + " checks)\n");
    }
  };
}

/** Console errors that are not Biology's: the shell's icon files are not in the repo yet. */
const realErrors = (errs) => errs.filter((e) => !/favicon|manifest\.webmanifest|Failed to load resource/i.test(e));

module.exports = { ROOT, launch, goto, dismissModal, overlaps, squeezed, overflow, reporter, realErrors };
