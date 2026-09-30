/* Shared browser-test plumbing (from Physics).  Kept tiny on purpose: every test script must still be
   runnable on its own with `node tests/<name>.js`.

   Finds a Chromium for Playwright without needing `playwright install`, which is
   both slow and unnecessary when the environment already ships one. */
const fs = require("fs");
const path = require("path");

function findChromium() {
  if (process.env.CHROMIUM_PATH && fs.existsSync(process.env.CHROMIUM_PATH))
    return process.env.CHROMIUM_PATH;

  const roots = [process.env.PLAYWRIGHT_BROWSERS_PATH, "/opt/pw-browsers",
                 path.join(process.env.HOME || "/root", ".cache/ms-playwright")]
                .filter(Boolean);
  for (const root of roots) {
    if (!fs.existsSync(root)) continue;
    // chromium-1194/chrome-linux/chrome, and the headless shell as a fallback.
    const dirs = fs.readdirSync(root).filter(d => /^chromium/.test(d)).sort().reverse();
    for (const d of dirs) {
      for (const rel of ["chrome-linux/chrome", "chrome-linux/headless_shell",
                         "chrome-mac/Chromium.app/Contents/MacOS/Chromium"]) {
        const p = path.join(root, d, rel);
        if (fs.existsSync(p)) return p;
      }
    }
  }
  for (const p of ["/usr/bin/chromium", "/usr/bin/chromium-browser", "/usr/bin/google-chrome"])
    if (fs.existsSync(p)) return p;
  return undefined;                   // let Playwright try its own default
}

/* Playwright may be installed locally, or only globally. Node does not consult the
   global tree by default, so try it explicitly rather than making every user of
   these tests set NODE_PATH by hand. */
function requirePlaywright() {
  const { execSync } = require("child_process");
  const tries = ["playwright", "playwright-core"];
  const extra = [];
  for (const v of [process.env.NODE_PATH, "/opt/node22/lib/node_modules",
                   "/usr/lib/node_modules", "/usr/local/lib/node_modules"]) {
    if (v && fs.existsSync(v.split(path.delimiter)[0])) extra.push(v);
  }
  try {
    const root = execSync("npm root -g", { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
    if (root && fs.existsSync(root)) extra.push(root);
  } catch (e) { /* npm not on PATH — the fixed paths above may still work */ }

  for (const name of tries) {
    try { return require(name); } catch (e) { /* try the global tree */ }
    for (const dir of extra) {
      for (const seg of dir.split(path.delimiter)) {
        try { return require(path.join(seg, name)); } catch (e) { /* next */ }
      }
    }
  }
  console.log("These tests need Playwright:  npm i -D playwright   (or install it globally)");
  process.exit(2);
}
const { chromium } = requirePlaywright();

const ROOT = path.join(__dirname, "..", "..");

/** file:// URL for an app path, e.g. appUrl("index.html") + "#/home". */
const appUrl = rel => "file://" + path.join(ROOT, rel || "index.html");

/** Poll for a condition instead of sleeping. `o.arg` is handed to the page — the
    condition runs in the BROWSER, so a Node variable referenced inside it would be
    undefined there and the poll would silently time out. */
async function until(page, fn, opts) {
  const o = opts || {};
  const deadline = Date.now() + (o.timeout || 15000);
  for (;;) {
    let v;
    try { v = await page.evaluate(fn, o.arg); } catch (e) { v = false; }
    if (v) return v;
    if (Date.now() > deadline) throw new Error(o.message || "timed out waiting for condition");
    await page.waitForTimeout(o.poll || 100);
  }
}

async function launch() {
  return chromium.launch({ executablePath: findChromium(), args: ["--allow-file-access-from-files"] });
}

/**
 * Boot the app. opts: { viewport, hash, subject, save, enroll }
 *   save   — an object written to localStorage before boot (a prepared save)
 *   enroll — subject ids to mark enrolled + onboarded, so no welcome flow appears
 *   subject— wait until that subject's code is loaded (navigates to #/s/<id>/home)
 */
async function boot(browser, opts) {
  const o = opts || {};
  const page = await browser.newPage({
    viewport: o.viewport || { width: 390, height: 844 },
    deviceScaleFactor: 1, isMobile: true, hasTouch: true
  });
  const errors = [];
  page.on("pageerror", e => errors.push("pageerror: " + e.message));
  page.on("console", m => {
    if (m.type() !== "error") return;
    if (/service ?worker/i.test(m.text())) return;
    errors.push("console: " + m.text());
  });
  const save = o.save || {
    settings: { onboarded: true, sound: false, motion: "off" },
    enrolled: o.enroll || ["chem", "phys", "bio", "econ", "eng", "madv"],
    migrateOffered: true
  };
  await page.addInitScript(s => {
    if (!localStorage.getItem("studyquest.save.v1")) localStorage.setItem("studyquest.save.v1", JSON.stringify(s));
  }, save);
  const hash = o.hash || (o.subject ? "#/s/" + o.subject + "/home" : "#/home");
  await page.goto(appUrl("index.html") + hash);
  await until(page, () => !!(window.SQ && SQ.UI && document.querySelector("#topbar") && !document.querySelector("#topbar").hidden),
    { message: "shell never finished booting" });
  if (o.subject) {
    await until(page, id => !!(window.SQ && SQ.Loader.isLoaded(id)), { arg: o.subject, timeout: 20000,
      message: "subject " + o.subject + " never loaded" });
  }
  page.errors = errors;
  return page;
}

/** Assert no horizontal overflow — the three-line check for a whole class of bugs. */
async function overflow(page) {
  return page.evaluate(() => {
    const d = document.documentElement;
    const wide = [...document.querySelectorAll("body *")]
      .filter(n => { const r = n.getBoundingClientRect(); return r.width && r.right > d.clientWidth + 1 && getComputedStyle(n).position !== "fixed"; })
      .slice(0, 4)
      .map(n => (n.tagName + "." + (n.className || "")).slice(0, 60));
    return { px: d.scrollWidth - d.clientWidth, wide };
  });
}

/** Tiny assertion counter so every suite prints the same way. */
function checker(name) {
  let pass = 0, fail = 0;
  const failures = [];
  return {
    ok(cond, msg) { if (cond) pass++; else { fail++; failures.push(msg); console.log("  ✗ " + msg); } },
    done() {
      console.log(`${name}: ${pass} passed, ${fail} failed`);
      if (fail) process.exitCode = 1;
      return fail === 0;
    }
  };
}

module.exports = { chromium, EXE: findChromium(), ROOT, appUrl, until, launch, boot, overflow, checker };
