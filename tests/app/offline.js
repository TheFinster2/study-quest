/* Offline: served over http, the service worker precaches the whole app; with the
   network cut, a second launch still boots, and a subject that was never opened online
   still loads (every subject is precached). English's 33 MB model is not in the cache.
   node tests/app/offline.js */
const http = require("http");
const fs = require("fs");
const path = require("path");
const B = require("../lib/browser");

const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json",
  ".webmanifest": "application/manifest+json", ".svg": "image/svg+xml", ".png": "image/png", ".wasm": "application/wasm",
  ".onnx": "application/octet-stream", ".txt": "text/plain" };

function serve() {
  const server = http.createServer((req, res) => {
    let p = decodeURIComponent(req.url.split("?")[0]);
    if (p.endsWith("/")) p += "index.html";
    const f = path.join(B.ROOT, p);
    if (!f.startsWith(B.ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { "Content-Type": TYPES[path.extname(f)] || "application/octet-stream", "Cache-Control": "no-cache" });
    fs.createReadStream(f).pipe(res);
  });
  return new Promise(r => server.listen(0, "127.0.0.1", () => r(server)));
}

(async () => {
  const t = B.checker("app/offline");
  const server = await serve();
  const base = `http://127.0.0.1:${server.address().port}/`;
  const br = await B.launch();
  const ctx = await br.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", e => errors.push(e.message));
  await page.addInitScript(() => {
    if (!localStorage.getItem("studyquest.save.v1")) localStorage.setItem("studyquest.save.v1",
      JSON.stringify({ settings: { onboarded: true, sound: false, motion: "off" }, enrolled: ["madv", "phys"], migrateOffered: true }));
  });

  await page.goto(base + "#/home");
  await B.until(page, () => navigator.serviceWorker && navigator.serviceWorker.controller
    ? true : navigator.serviceWorker.ready.then(() => false), { timeout: 60000, message: "service worker never activated" }).catch(() => {});
  /* First load: the worker installs and claims. Wait until it controls the page. */
  await page.reload();
  await B.until(page, () => !!navigator.serviceWorker.controller, { timeout: 60000, message: "service worker never took control" });

  const cache = await page.evaluate(async () => {
    const keys = await caches.keys();
    const app = keys.find(k => /^studyquest-/.test(k));
    const reqs = app ? await (await caches.open(app)).keys() : [];
    const urls = reqs.map(r => new URL(r.url).pathname);
    return { keys, count: urls.length, model: urls.filter(u => /subjects\/eng\/(models|vendor)\//.test(u)).length,
             madv: urls.some(u => /subjects\/madv\/manifest\.js$/.test(u)), index: urls.some(u => /index\.html$/.test(u)) };
  });
  t.ok(cache.keys.some(k => /^studyquest-1\./.test(k)), "app cache named studyquest-<version>-<fingerprint>: " + cache.keys.join(", "));
  t.ok(cache.count > 100, `the whole app is precached (${cache.count} files)`);
  t.ok(cache.index && cache.madv, "the shell and every subject are in the cache");
  t.ok(cache.model === 0, "English's model files are not precached");

  /* Cut the network. */
  await ctx.setOffline(true);
  await page.reload();
  await B.until(page, () => window.SQ && SQ.UI && !document.querySelector("#topbar").hidden, { timeout: 20000, message: "no boot offline" });
  t.ok(true, "boots with no network");

  /* A subject never opened online loads from the precache. */
  for (const id of ["madv", "phys"]) {
    if (!fs.existsSync(path.join(B.ROOT, "subjects", id, "manifest.js"))) continue;
    await page.evaluate(id => { location.hash = "#/s/" + id + "/play"; }, id);
    const ok = await B.until(page, id => SQ.Loader.isLoaded(id), { arg: id, timeout: 20000 }).catch(() => false);
    t.ok(!!ok, id + " opens offline");
  }
  /* A deep link reload offline gets the shell (navigation fallback). */
  await page.goto(base + "index.html#/shop");
  t.ok(await page.evaluate(() => !!(window.SQ && SQ.Shop)), "a deep link reloads offline");

  /* Force refresh keeps English's model cache. */
  const kept = await page.evaluate(async () => {
    const c = await caches.open("closereading-model-v1");
    await c.put("/fake-model", new Response("x"));
    const ks = await caches.keys();
    await Promise.all(ks.filter(k => !/^closereading-model|^transformers-cache/.test(k)).map(k => caches.delete(k)));
    return (await caches.keys()).includes("closereading-model-v1");
  });
  t.ok(kept, "the force-refresh filter keeps English's model cache");
  t.ok(/closereading-model\|\^transformers-cache/.test(fs.readFileSync(path.join(B.ROOT, "js/app.js"), "utf8")),
    "SQ.forceRefresh uses that filter");

  t.ok(!errors.length, "no page errors: " + errors.slice(0, 3).join(" | "));
  await br.close();
  server.close();
  t.done();
})().catch(e => { console.error(e); process.exit(1); });
