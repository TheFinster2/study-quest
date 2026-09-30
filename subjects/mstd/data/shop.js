/* ============================================================================
   shop.js — the Credits economy: 7 power-ups, 10 themes, 22 avatars, 3 crate
   tiers, arcade tickets (§7). Good items are level-gated as well as priced, so
   money alone can't skip the progression.
   ========================================================================== */
window.MS = window.MS || {};

window.MS.SHOP = {
  powerups: [
    { k: 'fifty',      cost: 120,  lv: 1,  bulk: 5, bulkCost: 520 },
    { k: 'skip',       cost: 100,  lv: 1,  bulk: 5, bulkCost: 440 },
    { k: 'freeze',     cost: 190,  lv: 4,  bulk: 5, bulkCost: 850 },
    { k: 'buffer',     cost: 240,  lv: 6,  bulk: 3, bulkCost: 660 },
    { k: 'boost',      cost: 400,  lv: 9,  bulk: 3, bulkCost: 1100 },
    { k: 'insight',    cost: 160,  lv: 3,  bulk: 5, bulkCost: 700 },
    { k: 'adrenaline', cost: 330,  lv: 12, bulk: 3, bulkCost: 900 }
  ],

  /* Theme names lean into the applied, money-and-measurement character of the
     course rather than generic gamification voice (§12). */
  themes: [
    { id: 'ledger',   nm: 'Ledger',            ds: 'Ruled paper at midnight. The default.',        cost: 0,    lv: 1 },
    { id: 'blueprint', nm: 'Blueprint',        ds: 'Grid lines and drafting blue.',                cost: 600,  lv: 3 },
    { id: 'payslip',  nm: 'Payslip',           ds: 'Clean, light, faintly bureaucratic.',          cost: 700,  lv: 5 },
    { id: 'compound', nm: 'Compound Interest', ds: 'Green, and growing on itself.',                cost: 900,  lv: 8 },
    { id: 'offpeak',  nm: 'Off-Peak',          ds: 'The 9:40 train. Nobody about.',                cost: 1100, lv: 11 },
    { id: 'bearing',  nm: 'Bearing',           ds: 'Compass teal, true north.',                    cost: 1300, lv: 15 },
    { id: 'normal',   nm: 'Normal Curve',      ds: 'Warm paper, bell-shaped.',                     cost: 1500, lv: 19 },
    { id: 'critical', nm: 'Critical Path',     ds: 'Amber, and there is no float time.',           cost: 1800, lv: 24 },
    { id: 'graphite', nm: 'Graphite',          ds: 'Pure grey. For serious people.',               cost: 2100, lv: 30 },
    { id: 'overtime', nm: 'Overtime',          ds: 'Neon, and past midnight. Paid at double.',     cost: 2600, lv: 38 }
  ],

  avatars: [
    { g: '🎓', cost: 0,    lv: 1 },
    { g: '📐', cost: 150,  lv: 2 },
    { g: '💵', cost: 150,  lv: 2 },
    { g: '🧮', cost: 200,  lv: 4 },
    { g: '📊', cost: 200,  lv: 4 },
    { g: '🧭', cost: 260,  lv: 6 },
    { g: '⏱️', cost: 260,  lv: 6 },
    { g: '🏦', cost: 340,  lv: 9 },
    { g: '🔔', cost: 340,  lv: 9 },
    { g: '🕸️', cost: 420,  lv: 12 },
    { g: '📋', cost: 420,  lv: 12 },
    { g: '🦉', cost: 520,  lv: 16 },
    { g: '🦊', cost: 520,  lv: 16 },
    { g: '🐢', cost: 640,  lv: 20 },
    { g: '🦈', cost: 640,  lv: 20 },
    { g: '🤖', cost: 800,  lv: 25 },
    { g: '👷', cost: 800,  lv: 25 },
    { g: '🕵️', cost: 1000, lv: 31 },
    { g: '🧙', cost: 1000, lv: 31 },
    { g: '🐉', cost: 1400, lv: 40 },
    { g: '👑', cost: 1900, lv: 50 },
    { g: '✦',  cost: 2600, lv: 60 }
  ],

  /* Crates roll power-ups by weight. The top tier can also roll Credits back,
     so it is never a pure loss. */
  crates: [
    { id: 'crate1', nm: 'Supply Box', ic: '📦', cost: 300,  lv: 2,
      ds: '2 power-ups, mostly the cheap ones.', rolls: 2,
      table: [['fifty', 30], ['skip', 30], ['insight', 20], ['freeze', 12], ['buffer', 6], ['boost', 2]] },
    { id: 'crate2', nm: 'Depot Crate', ic: '🗃️', cost: 700,  lv: 7,
      ds: '3 power-ups with a real shot at the good ones.', rolls: 3,
      table: [['fifty', 20], ['skip', 20], ['insight', 20], ['freeze', 18], ['buffer', 12], ['boost', 7], ['adrenaline', 3]] },
    { id: 'crate3', nm: 'Vault Pallet', ic: '🎁', cost: 1600, lv: 14,
      ds: '4 rolls, weighted to the expensive ones, plus a Credits chance.', rolls: 4,
      table: [['boost', 22], ['adrenaline', 18], ['buffer', 20], ['freeze', 15], ['insight', 10], ['fifty', 5], ['skip', 5], ['coins', 5]] }
  ],

  /* Arcade playtime. Priced so an hour of arcade costs roughly an hour of
     honest study — the arcade is a sink, never a source (§9.11). */
  tickets: [
    { mins: 5,  cost: 150 },
    { mins: 15, cost: 380 },
    { mins: 30, cost: 650 }
  ]
};
