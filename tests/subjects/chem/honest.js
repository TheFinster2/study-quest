#!/usr/bin/env node
/* The counterpart to exploit.js: a bot that knows every answer (it reads
   CHEM.__current, which each mode sets) and waits just past the shared read floor.
   It must earn XP in EVERY mode — proof the anti-farm gates don't also starve a
   real student.   node tests/subjects/chem/honest.js */
"use strict";
const B = require("../../lib/browser.js");
const { MODES, xp, seedMistakes } = require("./bots.js");

(async () => {
  const t = B.checker("chem honest");
  const browser = await B.launch();
  const page = await B.boot(browser, { subject: "chem", save: {
    settings: { onboarded: true, sound: false, motion: "off" }, enrolled: ["chem"], migrateOffered: true,
    subjects: { chem: { level: 10 } } } });
  await seedMistakes(page);
  for (const [name, play] of Object.entries(MODES)) {
    const before = await xp(page);
    const t0 = Date.now();
    await play(page, true);
    const got = (await xp(page)) - before;
    console.log("  " + name.padEnd(22) + String(got).padStart(6) + " XP in " + ((Date.now() - t0) / 1000).toFixed(0) + " s");
    t.ok(got > 0, `${name}: honest bot earns XP (got ${got})`);
  }
  t.ok(page.errors.filter(e => !/Failed to load resource/.test(e)).length === 0, "no console errors: " + page.errors.join(" | "));
  await browser.close();
  t.done();
})().catch(e => { console.error(e); process.exit(1); });
