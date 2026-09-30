/* ============================================================================
   bosses.js — five HP duels plus The Final Paper (§5).
   Each boss is a topic filter, an HP budget, a per-question timer and ONE
   gimmick. The gimmick is a flag the boss engine implements; nothing here is
   logic. Beat one to unlock the next.
   ========================================================================== */
window.MS = window.MS || {};
window.MS.BOSSES = (window.MS.BOSSES || []).concat([
  { id: 'taxman', nm: 'The Taxman', face: '🧾', lv: 8,
    mods: ['MS-F1'],
    ds: 'Payslips, brackets and the levy. Claims a deduction every third question.',
    hp: 90, dmg: 15, yourHp: 5, perQuestion: 22,
    gimmick: 'heal',
    gimmickDs: 'Heals 10% of its maximum HP every third question — "claiming a deduction". You cannot win by grinding.',
    blurb: 'It has read the legislation. Have you?',
    reward: { xp: 1400, coins: 320 } },

  { id: 'compound', nm: 'Compound', face: '📈', lv: 14,
    mods: ['MS-F4', 'MS-F5'],
    ds: 'Interest, depreciation and annuities. Its HP grows between turns.',
    hp: 110, dmg: 16, yourHp: 5, perQuestion: 26,
    gimmick: 'grow',
    gimmickDs: 'Its HP grows 6% between your turns. Slow play is punished — this is the only boss where hesitating costs you the fight.',
    blurb: 'Interest on the interest. It never stops.',
    reward: { xp: 1800, coins: 400 } },

  { id: 'surveyor', nm: 'The Surveyor', face: '🧭', lv: 20,
    mods: ['MS-M6'],
    ds: 'Sine rule, cosine rule, bearings. The answer options will not sit still.',
    hp: 120, dmg: 18, yourHp: 5, perQuestion: 30,
    gimmick: 'rotate',
    gimmickDs: 'Rotates the answer options every 3 seconds. Read the answer, not the position.',
    blurb: 'It has taken a bearing on you. 247°.',
    reward: { xp: 2200, coins: 480 } },

  { id: 'sigma', nm: 'Sigma', face: '🔔', lv: 27,
    mods: ['MS-S4', 'MS-S5', 'MS-S1'],
    ds: 'Correlation, regression and z-scores. Your power-ups become a lottery.',
    hp: 135, dmg: 19, yourHp: 5, perQuestion: 28,
    gimmick: 'randomPowerups',
    gimmickDs: 'Randomises which of your power-ups are available each turn. Plan for the ones you might not get.',
    blurb: 'Two standard deviations above your comfort zone.',
    reward: { xp: 2600, coins: 560 } },

  { id: 'critical', nm: 'The Critical Path', face: '🕸️', lv: 34,
    mods: ['MS-N1', 'MS-N2'],
    ds: 'Networks, scans and float. You have a fixed number of turns and not much slack.',
    hp: 150, dmg: 20, yourHp: 5, perQuestion: 34,
    gimmick: 'turnLimit', turns: 12,
    gimmickDs: 'You have 12 turns. There is float time in that budget, but not much — a wrong answer costs a turn as well as HP.',
    blurb: 'Every delay propagates. Including yours.',
    reward: { xp: 3200, coins: 700 } },

  { id: 'final', nm: 'The Final Paper', face: '📄', lv: 40, final: true,
    mods: null,                                   // every topic
    ds: '25 questions, whole course, no help. Unlocked by beating all five bosses.',
    hp: 250, dmg: 10, yourHp: 3, perQuestion: 40,
    gimmick: 'exam',
    gimmickDs: 'A 25-question gauntlet across the whole course, with three lives and no boss gimmick. Just the paper.',
    blurb: 'Three hours condensed into twenty-five questions.',
    reward: { xp: 6000, coins: 1500 } }
]);
