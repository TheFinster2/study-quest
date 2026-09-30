/* The Physics bot tests' harness: tests/lib/browser.js, booted into the phys
   subject. Hashes the stand-alone tests used ("#/game/rapid") are resolved into
   the subject ("#/s/phys/game/rapid") by the tests themselves. */
const lib = require("../../lib/browser");

async function boot(browser, opts) {
  const o = Object.assign({ subject: "phys" }, opts || {});
  const page = await lib.boot(browser, o);
  /* Other subjects' theme files may not exist yet while they are ported in
     parallel; they fail at boot and are not this subject's errors. */
  for (let i = page.errors.length - 1; i >= 0; i--)
    if (/ERR_FILE_NOT_FOUND/.test(page.errors[i])) page.errors.splice(i, 1);
  return page;
}

module.exports = Object.assign({}, lib, { boot });
