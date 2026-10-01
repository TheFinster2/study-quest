/* StudyQuest service worker — precaches the whole app so it runs with no signal.

   PRECACHE and FINGERPRINT are GENERATED: run `node tools/precache.js` after changing
   any shipped file. The fingerprint is a hash of every precached file's contents, so
   the cache name changes whenever anything does, and an installed app always picks
   the change up. tests/app/validate.js fails if the list or the hash is stale.

   English's semantic-marking model (subjects/eng/models, subjects/eng/vendor — 34 MB)
   is deliberately NOT precached: it is an opt-in download that English stores in its
   own cache ("closereading-model-v1"), which the sweep below must never delete. */

const VERSION = "1.0.0";
const FINGERPRINT = "__FINGERPRINT__";
const CACHE = "studyquest-" + VERSION + "-" + FINGERPRINT;
const KEEP = ["closereading-model-v1", "transformers-cache"];

const PRECACHE = [/*__PRECACHE__*/];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(PRECACHE.map(u => new Request(u, { cache: "reload" }))))
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys
        .filter(k => k !== CACHE && KEEP.indexOf(k) < 0)
        .map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* Applied only when the page says so: the page decides when an update is safe. */
self.addEventListener("message", event => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch", event => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  /* The model files are English's business: served from its own cache when the student
     has downloaded them, otherwise the network — never copied into the app cache (that
     would store 33 MB twice). */
  if (/\/subjects\/eng\/(models|vendor)\//.test(url.pathname)) {
    event.respondWith(caches.match(req, { cacheName: "closereading-model-v1" }).then(hit => hit || fetch(req)));
    return;
  }

  /* Navigations get the app shell, so a deep link like #/s/chem/play works offline. */
  if (req.mode === "navigate") {
    event.respondWith(caches.match("index.html", { cacheName: CACHE }).then(r => r || fetch(req)));
    return;
  }
  event.respondWith(
    caches.match(req, { ignoreSearch: true }).then(hit => hit || fetch(req).then(res => {
      if (res && res.ok && res.type === "basic") {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy));
      }
      return res;
    }))
  );
});
