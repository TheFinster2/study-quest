/* Chromium plumbing for English's browser suites (ported from Close Reading).
   A static server over the StudyQuest root — Layer C needs http, never file:// — a
   launched browser, and a page already inside the English subject with the app's
   onboarding and English's first-run modal dismissed.

   Routes are written as the stand-alone app wrote them ("/vault", "/game/cloze") and
   mapped here onto the subject ("#/s/eng/vault"), so the suites read as they did. */
"use strict";
const http = require("http");
const fs = require("fs");
const path = require("path");

const TYPES = {
  ".html": "text/html", ".js": "text/javascript", ".css": "text/css",
  ".json": "application/json", ".webmanifest": "application/manifest+json",
  ".png": "image/png", ".svg": "image/svg+xml", ".onnx": "application/octet-stream",
  ".wasm": "application/wasm", ".txt": "text/plain"
};

/* Playwright may be installed only globally (StudyQuest's tests/lib/browser.js finds it
   and a Chromium the same way). */
function playwright() {
  const tries = [];
  try { return require("playwright"); } catch (e) { tries.push(e); }
  const roots = [process.env.NODE_PATH, "/opt/node22/lib/node_modules", "/usr/lib/node_modules", "/usr/local/lib/node_modules"];
  try { roots.push(require("child_process").execSync("npm root -g", { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim()); } catch (e) { /* no npm */ }
  for (const r of roots.filter(Boolean)) {
    try { return require(path.join(r, "playwright")); } catch (e) { /* next */ }
  }
  throw new Error("playwright not found");
}
function chromePath() {
  if (process.env.CHROME_PATH && fs.existsSync(process.env.CHROME_PATH)) return process.env.CHROME_PATH;
  for (const root of ["/opt/pw-browsers", path.join(process.env.HOME || "/root", ".cache/ms-playwright")]) {
    if (!fs.existsSync(root)) continue;
    for (const d of fs.readdirSync(root).filter(d => /^chromium-/.test(d)).sort().reverse()) {
      const p = path.join(root, d, "chrome-linux/chrome");
      if (fs.existsSync(p)) return p;
    }
  }
  return undefined;
}
const CHROME = chromePath();

function serve(root) {
  return new Promise(resolve => {
    const server = http.createServer((req, res) => {
      const rel = decodeURIComponent(req.url.split("?")[0]).replace(/^\/+/, "") || "index.html";
      const file = path.join(root, rel);
      if (!file.startsWith(root)) { res.writeHead(403).end(); return; }
      fs.readFile(file, (err, buf) => {
        if (err) { res.writeHead(404).end("not found"); return; }
        res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream" });
        res.end(buf);
      });
    });
    server.listen(0, "127.0.0.1", () => resolve({ server, port: server.address().port }));
  });
}

const APP_ROUTES = ["/arcade", "/settings", "/subjects", "/blank"];
/** "/vault" → "/s/eng/vault"; app routes and already-qualified ones pass through. */
function sub(route) {
  const r = route || "/home";
  if (r.startsWith("/s/") || APP_ROUTES.some(a => r === a || r.startsWith(a + "/"))) return r;
  return "/s/eng" + (r.startsWith("/") ? r : "/" + r);
}

const SEED = {
  settings: { onboarded: true, sound: false, motion: "auto" },
  enrolled: ["eng"], migrateOffered: true, stars: 150
};

async function harness(root) {
  const { chromium } = playwright();
  const { server, port } = await serve(root);
  const browser = await chromium.launch({ executablePath: CHROME, args: ["--no-sandbox"] });
  const base = "http://127.0.0.1:" + port;

  async function open(route, opts) {
    const o = Object.assign({ width: 390, height: 844 }, opts);
    const page = await browser.newPage({ viewport: { width: o.width, height: o.height } });
    const errors = [];
    page.on("pageerror", e => errors.push("threw: " + e.message));
    page.on("console", m => {
      if (m.type() !== "error") return;
      const t = m.text();
      /* The app shell's icons and manifest are not the subject's to supply. */
      if (/Failed to load resource/.test(t)) return;
      errors.push("console: " + t.slice(0, 160));
    });
    page.on("requestfailed", r => { if (/subjects\/eng\//.test(r.url())) errors.push("request failed: " + r.url()); });
    page.on("response", r => { if (r.status() >= 400 && /subjects\/eng\//.test(r.url())) errors.push("HTTP " + r.status() + " " + r.url()); });
    page.errors = errors;
    const seed = Object.assign({}, SEED, o.save || {});
    await page.addInitScript(s => {
      if (!localStorage.getItem("studyquest.save.v1")) localStorage.setItem("studyquest.save.v1", JSON.stringify(s));
    }, seed);
    await page.goto(base + "/index.html#" + sub(route), { waitUntil: "load" });
    await page.waitForFunction(() => window.SQ && SQ.Loader && SQ.Loader.isLoaded("eng") && window.EN && EN.State && EN.Bank,
      null, { timeout: 15000 });
    /* English's first-run modal is sticky and appears on a delay; wait for it, dismiss it. */
    if (!o.keepOnboarding) {
      try {
        await page.waitForSelector("#modal-root:not([hidden]) .btn-primary", { timeout: 2500 });
        await page.click("#modal-root .btn-primary");
      } catch (e) { /* already onboarded */ }
      await page.waitForFunction(() => document.getElementById("modal-root").hidden, null, { timeout: 3000 }).catch(() => {});
    }
    await page.waitForTimeout(120);
    return page;
  }

  /** Navigate within the subject, forcing a re-render even if the hash matches. */
  async function goto(page, route, settle) {
    await page.evaluate(r => { SQ.UI.closeModal(true); location.hash = r; SQ.UI.handleRoute(); }, "#" + sub(route));
    await page.waitForTimeout(settle || 420);
  }

  async function close() {
    await browser.close();
    await new Promise(r => server.close(r));
  }

  return { base, browser, open, goto, close, sub };
}

/** Every route English registers, plus the arguments worth exercising. */
const ROUTES = [
  "/home", "/play", "/vault", "/vault/card", "/study", "/reference", "/reference/rubric",
  "/reference/bands", "/reference/concepts", "/reference/essay", "/progress", "/shop",
  "/draft", "/draft/new", "/texts", "/texts/common", "/texts/moduleA",
  "/texts/poems/donne", "/options", "/achievements", "/dev", "/boss",
  "/boss/party",
  "/game/rapid", "/game/technique", "/game/cloze", "/game/marking", "/game/essay",
  "/game/quotematch", "/game/bandgrid", "/game/deconstruct", "/game/sayit",
  "/game/thesis", "/game/rewrite", "/game/paper", "/game/drill", "/game/drill/all", "/game/survival",
  "/game/rehab"
];

module.exports = { harness, serve, ROUTES, CHROME, playwright, sub };
