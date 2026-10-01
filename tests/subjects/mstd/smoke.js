/* ============================================================================
   smoke.js — Maths Standard in the real app shell, in Chromium.

   Every route and every mode at 390 px and 360 px: it renders, nothing reads
   "[object Object]", there is no horizontal overflow and no console error.
   Then the NumberCrunch behaviours that live in subject code: answering a
   question, the tier filter, the results modal (§H1 review-the-working, §H4
   reconcile line), the boss intro, graded flashcards, bookmarks, the coverage
   toggle, the shop, keyboard play and the tool-tray sheet registration.

   Run: node tests/subjects/mstd/smoke.js
   ========================================================================== */
'use strict';
const B = require('../../lib/browser');
const T = B.checker('mstd smoke');

const ROUTES = [
  'home', 'play', 'study', 'study/deck/MS-F1', 'study/leeches', 'study/bookmarks',
  'progress', 'progress/MS-F5', 'shop', 'reference', 'reference/formulae', 'reference/annuity',
  'reference/networks', 'options', 'achievements', 'quests', 'daily', 'ascend', 'bosses', 'about',
  'game/rapid', 'game/drill', 'game/drill/MS-A1', 'game/survival', 'game/rehab', 'game/pairs',
  'game/display', 'game/crunch', 'game/crunch/MS-F4', 'game/chain', 'game/panic', 'game/trek',
  'game/loanlab', 'game/bearings', 'game/critpath',
  'game/boss/taxman', 'game/boss/compound', 'game/boss/surveyor', 'game/boss/sigma',
  'game/boss/critical', 'game/boss/final'
];

async function go(page, route) {
  await page.evaluate(r => { while (SQ.UI.modalOpen()) SQ.UI.closeModal(); location.hash = '#/s/mstd/' + r; }, route);
  await page.waitForTimeout(450);
}

/* A save where everything is unlocked, so every mode and boss renders its real screen. */
const UNLOCKED = {
  settings: { onboarded: true, sound: false, motion: 'off' },
  enrolled: ['mstd'], migrateOffered: true,
  subjects: { mstd: { level: 45, xp: 0, xpIntoLevel: 0, coins: 5000,
    bossesBeaten: { taxman: 1, compound: 1, surveyor: 1, sigma: 1, critical: 1 },
    seen: { welcome: 1, 'critpath-intro': 1 },
    q: { 'f1-001': { s: 3, r: 0, w: 3 }, 'f1-002': { s: 2, r: 0, w: 2 }, 'f1-003': { s: 2, r: 0, w: 2 }, 'f1-004': { s: 2, r: 0, w: 2 } } } }
};

(async () => {
  const browser = await B.launch();
  const page = await B.boot(browser, { subject: 'mstd', save: UNLOCKED });

  /* ---------------------------------------------------------- every route */
  for (const width of [390, 360]) {
    await page.setViewportSize({ width, height: 800 });
    const bad = [], wide = [];
    for (const r of ROUTES) {
      await go(page, r);
      const info = await page.evaluate(() => {
        const v = document.querySelector('#view');
        const txt = v.innerText + ' ' + (document.querySelector('#modal-root').innerText || '');
        return { len: v.innerText.trim().length, obj: /\[object Object\]|undefined|NaN/.test(txt),
                 shell: !!document.querySelector('#view .ms-root') };
      });
      if (!info.shell || info.len < 20) bad.push(r + ' rendered nothing');
      if (info.obj) bad.push(r + ' shows [object Object]/undefined/NaN');
      const of = await B.overflow(page);
      if (of.px > 0) wide.push(r + ' +' + of.px + 'px ' + of.wide.join(' '));
    }
    T.ok(bad.length === 0, width + 'px: every route renders cleanly — ' + bad.join('; '));
    T.ok(wide.length === 0, width + 'px: no horizontal overflow — ' + wide.join('; '));
  }
  await page.setViewportSize({ width: 390, height: 844 });

  /* ------------------------------------------------------ nav + context */
  await go(page, 'home');
  const chrome = await page.evaluate(() => ({
    subject: document.documentElement.dataset.subject,
    nav: Array.from(document.querySelectorAll('#navbar .nav-item')).map(a => a.textContent),
    coin: document.querySelector('#coin-icon').textContent
  }));
  T.ok(chrome.subject === 'mstd', 'html[data-subject] is mstd on the subject screens');
  T.ok(chrome.nav.length === 6 && chrome.coin === '💳', 'subject nav (5 + hub) and the Credits pill are shown');
  T.ok(await page.evaluate(() => !!(SQ.Tools.getSheet && SQ.Tools.getSheet('mstd'))), 'the Standard 2 reference sheet is registered with SQ.Tools');
  T.ok(await page.evaluate(() => typeof window.U === 'undefined' && typeof window.MQ === 'undefined'), 'no global U or MQ leaks from the subject');

  /* ------------------------------------------------------- Rapid Fire */
  await go(page, 'game/rapid');
  await page.waitForSelector('#view .choice');
  await page.waitForTimeout(1300);
  const before = await page.evaluate(() => MS.State.data.stats.answered);
  await page.keyboard.press('2');
  await page.waitForTimeout(200);
  const after = await page.evaluate(() => ({ n: MS.State.data.stats.answered, why: !!document.querySelector('#view .gshell .why') }));
  T.ok(after.n === before + 1 && after.why, 'keyboard 2 answers a question and shows the working');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(200);
  T.ok(await page.evaluate(() => !!document.querySelector('#view .choice:not([disabled])')), 'Enter advances to the next question');

  /* Bookmark from inside a run. */
  const marked = await page.evaluate(() => {
    const b = document.querySelector('#view .ms-bookmark');
    if (!b) return false;
    b.click();
    return MS.State.data.bookmarks.length;
  });
  T.ok(marked === 1, 'a question can be bookmarked mid-run');
  await go(page, 'study/bookmarks');
  T.ok(await page.evaluate(() => /Practise 1/.test(document.querySelector('#view').innerText)), 'the bookmarks page lists it and offers a run');
  await go(page, 'game/bookmarks');
  T.ok(await page.evaluate(() => !!document.querySelector('#view .choice')), 'the bookmark run deals the saved question');

  /* ------------------------------------------------------- tier filter */
  const tiers = await page.evaluate(() => {
    const S = MS.State, Bank = MS.Bank, out = {};
    ['warmup', 'mixed', 'exam'].forEach(k => {
      S.setTier(k);
      const pool = Bank.filter({});
      out[k] = { n: pool.length, min: Math.min.apply(null, pool.map(q => q.diff)), max: Math.max.apply(null, pool.map(q => q.diff)) };
    });
    S.setTier('mixed');
    return out;
  });
  T.ok(tiers.warmup.max <= 1, 'Warm-up serves only diff 0-1 (' + tiers.warmup.n + ')');
  T.ok(tiers.exam.min >= 2, 'Exam serves only diff 2-3 (' + tiers.exam.n + ')');
  T.ok(tiers.mixed.n > tiers.warmup.n && tiers.mixed.n > tiers.exam.n, 'Mixed is the widest pool');

  /* --------------------------------------------------------- coverage */
  const cov = await page.evaluate(() => {
    const S = MS.State, Bank = MS.Bank;
    S.setTagHidden('MS-N1', true);
    const mixed = Bank.filter({}).some(q => q.mod === 'MS-N1');
    const named = Bank.filter({ mod: 'MS-N1' }).length;
    S.setTagHidden('MS-N1', false);
    return { mixed, named };
  });
  T.ok(!cov.mixed && cov.named > 0, 'a hidden topic leaves mixed draws but can still be drilled by name');

  /* ---------------------------------------------------- results modal */
  await go(page, 'game/rapid');
  await page.waitForSelector('#view .choice');
  await page.evaluate(() => document.querySelector('#view .choice').click());
  await page.waitForTimeout(200);
  await page.evaluate(() => MS.UI.results({ title: 'Run complete', accuracy: 0.6, rows: [['Correct', '3 / 5']], backTo: '/play', delay: 0 }));
  await page.waitForTimeout(250);
  const review = await page.evaluate(() => {
    const b = Array.from(document.querySelectorAll('#modal-root button')).find(x => /Review the working/.test(x.textContent));
    if (!b) return { offered: false };
    b.click();
    return { offered: true };
  });
  await page.waitForTimeout(250);
  const afterReview = await page.evaluate(() => ({
    closed: document.querySelector('#modal-root').hidden,
    visible: !!document.querySelector('#view .gshell .why'),
    reopen: !!document.querySelector('.ms-reopen')
  }));
  T.ok(review.offered, 'the results modal offers "Review the working" (§H1)');
  T.ok(afterReview.closed && afterReview.visible && afterReview.reopen, 'it closes, leaves the working readable and a way back');
  const recon = await page.evaluate(async () => {
    function grab(spec) {
      MS.UI.results(Object.assign({ rows: [], backTo: '/play', delay: 0 }, spec));
      return new Promise(r => setTimeout(() => { const t = document.querySelector('#modal-root').innerText; SQ.UI.closeModal(); setTimeout(() => r(t), 50); }, 100));
    }
    return { lowWin: await grab({ outcome: 'win', accuracy: 0.55 }), goodWin: await grab({ outcome: 'win', accuracy: 0.95 }),
             goodLoss: await grab({ outcome: 'loss', accuracy: 0.9 }) };
  });
  T.ok(/won on health, not on accuracy/i.test(recon.lowWin), 'a low-accuracy win is reconciled with its rank (§H4)');
  T.ok(!/won on health/i.test(recon.goodWin), 'a genuine win is not lectured');
  T.ok(/exam-standard accuracy/i.test(recon.goodLoss), 'a strong run that ran out of lives is credited');

  /* --------------------------------------------------------------- boss */
  await go(page, 'game/boss/taxman');
  const intro = await page.evaluate(() => /Fight/.test(document.querySelector('#modal-root').innerText));
  T.ok(intro, 'a boss shows its gimmick intro before the fight');
  await page.evaluate(() => { const b = Array.from(document.querySelectorAll('#modal-root button')).find(x => x.textContent === 'Fight'); if (b) b.click(); });
  await page.waitForTimeout(250);
  T.ok(await page.evaluate(() => !!document.querySelector('#view .bosshp') && !!document.querySelector('#view .choice')), 'Fight starts the duel');

  /* ------------------------------------------------ graded flashcards */
  await go(page, 'study');
  await page.evaluate(() => { const b = Array.from(document.querySelectorAll('#view .btn')).find(x => /Review/.test(x.textContent)); b.click(); });
  await page.waitForTimeout(250);
  await page.evaluate(() => { const b = Array.from(document.querySelectorAll('#view .btn')).find(x => /Flip/.test(x.textContent)); b.click(); });
  const grades = await page.evaluate(() => Array.from(document.querySelectorAll('#view .ms-grades .btn')).map(b => b.textContent.replace(/\W/g, '')));
  T.ok(grades.join() === 'Again,Hard,Good,Easy', 'flashcards are graded Again / Hard / Good / Easy (' + grades.join() + ')');
  const leech = await page.evaluate(() => {
    const id = MS.CARDS[0].id;
    for (let i = 0; i < 4; i++) MS.State.reviewCard(id, 'again');
    return MS.State.isLeech(id);
  });
  T.ok(leech, 'four Agains make a card a leech');
  await go(page, 'study/leeches');
  T.ok(await page.evaluate(() => /1 card/.test(document.querySelector('#view').innerText)), 'the leech list names it');

  /* --------------------------------------------------------------- shop */
  await go(page, 'shop');
  const shop = await page.evaluate(() => {
    const t = document.querySelector('#view').innerText;
    return { themes: /Maths Standard themes/.test(t), crates: /Crates/.test(t), diff: /Gentle/.test(t) };
  });
  T.ok(shop.themes && shop.crates && shop.diff, 'the subject shop renders themes, crates and the four difficulties');
  const bought = await page.evaluate(() => {
    const card = Array.from(document.querySelectorAll('#view .shop-item')).find(c => /Blueprint/.test(c.textContent));
    const b = card && card.querySelector('.btn-primary');
    if (!b) return 'no buy button';
    b.click();
    return SQ.Store.data.owned.themes.includes('mstd-blueprint') && document.documentElement.dataset.theme;
  });
  T.ok(bought === 'mstd-blueprint', 'buying Blueprint owns and applies mstd-blueprint (' + bought + ')');
  const tok = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--panel').trim());
  T.ok(tok === '#0d2740', 'NumberCrunch tokens resolve through the core aliases (--panel = ' + tok + ')');

  /* --------------------------------------------------------- persistence */
  await page.evaluate(() => { SQ.Store.flush(); });
  const saved = await page.evaluate(() => {
    const s = JSON.parse(localStorage.getItem('studyquest.save.v1')).subjects.mstd;
    return { answered: s.stats.answered, q: Object.keys(s.q).length, hasPow: 'pow' in s, hasInv: 'inventory' in s };
  });
  T.ok(saved.answered > 0 && saved.q > 0 && !saved.hasPow && !saved.hasInv, 'the slot is saved in the one save file without shared fields duplicated');

  T.ok(page.errors.length === 0, 'no console errors — ' + page.errors.slice(0, 5).join(' | '));
  await browser.close();
  T.done();
})().catch(e => { console.error('smoke crashed:', e); process.exit(1); });
