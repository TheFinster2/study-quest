/* StudyQuest shared utilities. Pure helpers used by the shell, the hub, the shared
   tools and the arcade.

   Each subject keeps its OWN util module (CHEM.U, PHYS.U, BIO.U …) as well. That
   is deliberate: their maths/notation renderers and numeric parsers differ in
   ways that are load-bearing for the questions they render, and the tests in each
   original app were written against them. Merging seven renderers into one would
   change how thousands of questions display. What IS shared is everything that
   touches the student rather than the content: the save, levels, rewards, the
   router, modals, the tool tray, the arcade and the shops. */
window.SQ = window.SQ || {};

SQ.U = (function () {
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  /** el("div", {class, text, html, on:{click}, style, ...attrs}, [children]) */
  function el(tag, attrs, children) {
    const node = document.createElement(tag);
    const a = attrs || {};
    for (const k of Object.keys(a)) {
      const v = a[k];
      if (v === undefined || v === null || v === false) continue;
      if (k === "class") node.className = v;
      else if (k === "text") node.textContent = v;
      else if (k === "html") node.innerHTML = v;
      else if (k === "on") for (const ev of Object.keys(v)) node.addEventListener(ev, v[ev]);
      else if (k === "style" && typeof v === "object") Object.assign(node.style, v);
      else if (k === "dataset") Object.assign(node.dataset, v);
      else if (v === true) node.setAttribute(k, "");
      else node.setAttribute(k, v);
    }
    [].concat(children || []).forEach(c => {
      if (c === null || c === undefined || c === false) return;
      node.appendChild(typeof c === "string" || typeof c === "number"
        ? document.createTextNode(String(c)) : c);
    });
    return node;
  }

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const randInt = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  const sample = (arr, n) => shuffle(arr).slice(0, n);

  function escapeHtml(s) {
    return String(s === undefined || s === null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  /** Local-calendar day key, "2026-09-30". Local, not UTC: a streak is about the
      student's day, and a UTC key rolls over mid-afternoon in Sydney. */
  function dayKey(d) {
    const t = d || new Date();
    const p = n => String(n).padStart(2, "0");
    return `${t.getFullYear()}-${p(t.getMonth() + 1)}-${p(t.getDate())}`;
  }
  function daysBetween(aKey, bKey) {
    return Math.round((new Date(bKey + "T00:00:00") - new Date(aKey + "T00:00:00")) / 86400000);
  }

  /** ISO-ish week key, e.g. "2026-W40". */
  function weekKey(d) {
    const t = d || new Date();
    const target = new Date(t.getFullYear(), t.getMonth(), t.getDate());
    target.setDate(target.getDate() + 3 - ((target.getDay() + 6) % 7));
    const firstThursday = new Date(target.getFullYear(), 0, 4);
    firstThursday.setDate(firstThursday.getDate() + 3 - ((firstThursday.getDay() + 6) % 7));
    const week = 1 + Math.round((target - firstThursday) / (7 * 86400000));
    return `${target.getFullYear()}-W${String(week).padStart(2, "0")}`;
  }

  function hash(str) {
    let h = 2166136261;
    const s = String(str);
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return Math.abs(h);
  }
  function seededRandom(seed) {
    let s = Math.abs(Math.floor(seed)) % 2147483647;
    if (s <= 0) s += 2147483646;
    return () => (s = (s * 16807) % 2147483647) / 2147483647;
  }
  function seededShuffle(arr, rng) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  const fmtTime = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
  const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0);
  const fmtInt = n => Math.round(n || 0).toLocaleString("en-AU");

  /** Words in a string with markup stripped — feeds the length-scaled read floor. */
  function words(s) {
    const t = String(s || "").replace(/<[^>]*>/g, " ").replace(/\\[a-z]+/gi, " ").trim();
    return t ? t.split(/\s+/).length : 0;
  }

  function debounce(fn, ms) {
    let t;
    return function () { const a = arguments, self = this; clearTimeout(t); t = setTimeout(() => fn.apply(self, a), ms); };
  }

  /** Deep-merge a stored object onto a default shape so old saves gain new fields.
      Arrays are taken wholesale from the override. */
  function deepMerge(base, override) {
    if (Array.isArray(base)) return Array.isArray(override) ? override : base;
    if (base && typeof base === "object" && override && typeof override === "object" && !Array.isArray(override)) {
      const out = Object.assign({}, base);
      for (const k of Object.keys(override)) {
        out[k] = k in base ? deepMerge(base[k], override[k]) : override[k];
      }
      return out;
    }
    return override === undefined ? base : override;
  }

  const clone = o => JSON.parse(JSON.stringify(o));

  /** Load a classic script. Classic, not a module: modules are CORS-blocked on
      file://, and double-clicking index.html has to keep working. */
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = src;
      s.async = false;
      s.onload = () => resolve(src);
      s.onerror = () => reject(new Error("Failed to load " + src));
      document.head.appendChild(s);
    });
  }
  function loadStyle(href) {
    return new Promise(resolve => {
      if (document.querySelector(`link[data-href="${href}"]`)) return resolve(href);
      const l = document.createElement("link");
      l.rel = "stylesheet";
      l.href = href;
      l.dataset.href = href;
      l.onload = () => resolve(href);
      l.onerror = () => resolve(href);   // a missing stylesheet must not block the subject
      document.head.appendChild(l);
    });
  }

  return { $, $$, el, clamp, randInt, pick, shuffle, sample, escapeHtml, dayKey, daysBetween,
           weekKey, hash, seededRandom, seededShuffle, fmtTime, pct, fmtInt, words, debounce,
           deepMerge, clone, loadScript, loadStyle };
})();
