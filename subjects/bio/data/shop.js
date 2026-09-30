/* Shop — what biocredits are for.

   The original brief said the shop must sell nothing that helps in a scored
   mode. That has been relaxed deliberately: a currency you can only spend on
   wallpaper stops being a reason to play. The honesty property the brief was
   protecting is preserved a different and stronger way:

     • Nothing here calls UI.award. Biocredits are still a sink.
     • Power-ups change how a run FEELS, not what an empty run is worth.
       Multipliers multiply; they never add. A run that earned nothing is
       still worth nothing after a 2x multiplier, and tests/exploit.js
       replays the whole bad-bot sweep with a full inventory and the
       multiplier active to prove it.
     • Biocredits come from XP, and XP comes from answering things correctly
       and slowly enough to have read them. So power-ups are bought with work
       already done. */
window.BIO = window.BIO || {}; BIO.DATA = BIO.DATA || {};

BIO.DATA.shop = {
  /* Consumable power-ups. `desc` is what the shop shows; the behaviour lives
     in js/modes/common.js. */
  powerups: [
    { id:"fifty",   icon:"✂️",  name:"Halve the field", cost:140,
      desc:"Removes two wrong options from the current multiple-choice question." },
    { id:"skip",    icon:"⏭️",  name:"Pass",            cost:110,
      desc:"Skip a question without breaking your streak. It is not counted as wrong." },
    { id:"freeze",  icon:"🧊",  name:"Cold storage",    cost:190,
      desc:"Adds 20 seconds to the clock in any timed mode." },
    { id:"shield",  icon:"🛡️",  name:"Homeostasis",     cost:260,
      desc:"Absorbs one wrong answer so your streak survives. Used automatically." },
    { id:"insight", icon:"🔍",  name:"Field note",      cost:320,
      desc:"Names the topic and the misconception being tested, without costing you the reference penalty." },
    { id:"double",  icon:"✨",  name:"Catalyst",        cost:400,
      desc:"Doubles the XP you earn for one run. It multiplies what you earn — a run worth nothing stays worth nothing." },
    { id:"revive",  icon:"💉",  name:"Adrenaline",      cost:750,
      desc:"Restores one life when you fall in Survival or a module boss. Used automatically." }
  ],

  /* Avatars are pure cosmetics with a level gate, so there is something to
     work towards at every stage rather than only at the start. */
  avatars: [
    { emoji:"🧬", name:"Helix",           cost:0 },
    { emoji:"🌱", name:"Seedling",        cost:0 },
    { emoji:"🔬", name:"Microscope",      cost:300 },
    { emoji:"🧫", name:"Petri Dish",      cost:300 },
    { emoji:"🦠", name:"Microbe",         cost:450 },
    { emoji:"🍃", name:"Leaf",            cost:450 },
    { emoji:"🩸", name:"Haemoglobin",     cost:600 },
    { emoji:"🫀", name:"Cardiac",         cost:600 },
    { emoji:"🐛", name:"Larva",           cost:750 },
    { emoji:"🍄", name:"Decomposer",      cost:750 },
    { emoji:"🦎", name:"Ectotherm",       cost:900,   minLevel:8 },
    { emoji:"🦘", name:"Marsupial",       cost:1100,  minLevel:10 },
    { emoji:"🕸️", name:"Food Web",        cost:1400,  minLevel:12 },
    { emoji:"🧪", name:"Assay",           cost:1400,  minLevel:14 },
    { emoji:"🌏", name:"Biosphere",       cost:1800,  minLevel:16 },
    { emoji:"🐐", name:"GOAT",            cost:2400,  minLevel:18, note:"For the truly unhinged." },
    { emoji:"🦅", name:"Apex Predator",   cost:3200,  minLevel:24 },
    { emoji:"🧠", name:"Cerebrum",        cost:4000,  minLevel:30 },
    { emoji:"🌳", name:"Old Growth",      cost:5200,  minLevel:36 },
    { emoji:"👑", name:"Keystone",        cost:6800,  minLevel:42 },
    { emoji:"🌌", name:"Deep Time",       cost:9000,  minLevel:50 },
    { emoji:"🔱", name:"Last Universal Ancestor", cost:12000, minLevel:60, note:"Level 60. The end of the road." }
  ],

  tickets: [
    { id:"tkt-5",  name:"Arcade ticket — 5 minutes",  minutes:5,  cost:315 },
    { id:"tkt-15", name:"Arcade ticket — 15 minutes", minutes:15, cost:840 },
    { id:"tkt-40", name:"Arcade ticket — 40 minutes", minutes:40, cost:1980 }
  ],
  themes: [
    { id:"verdant",  name:"Verdant",  cost:0,    blurb:"The default. Eucalypt greens." },
    { id:"reef",     name:"Reef",     cost:1200, blurb:"Cool blues, for the marine ecology weeks." },
    { id:"savanna",  name:"Savanna",  cost:1800, blurb:"Warm ochres and grass gold." },
    { id:"tundra",   name:"Tundra",   cost:2400, blurb:"Cold slate and pale indigo." },
    { id:"light",    name:"Daylight", cost:3000, blurb:"A light theme, for reading in the sun." }
  ]
};

/* Level titles — index by level, capped at the last entry. Sixty levels. */
BIO.DATA.levelTitles = [
  "Spore",                      //  1
  "Slide Preparer",             //  2
  "Stain Technician",           //  3
  "Field Notebook",             //  4
  "Organelle Spotter",          //  5
  "Membrane Reader",            //  6
  "Enzyme Handler",             //  7
  "Diffusion Tracer",           //  8
  "Osmosis Adept",              //  9
  "Junior Biologist",           // 10
  "Chloroplast Cartographer",   // 11
  "Mitochondrion Mechanic",     // 12
  "Cell Cycle Marshal",         // 13
  "Tissue Technician",          // 14
  "Transport Engineer",         // 15
  "Gas Exchange Analyst",       // 16
  "Xylem Navigator",            // 17
  "Digestive Chemist",          // 18
  "Adaptation Hunter",          // 19
  "Band 5 Candidate",           // 20
  "Selection Pressure Reader",  // 21
  "Speciation Watcher",         // 22
  "Fossil Interpreter",         // 23
  "Molecular Clock Setter",     // 24
  "Quadrat Surveyor",           // 25
  "Transect Walker",            // 26
  "Trophic Accountant",         // 27
  "Succession Forecaster",      // 28
  "Restoration Ecologist",      // 29
  "Band 6 Candidate",           // 30
  "Punnett Practitioner",       // 31
  "Pedigree Detective",         // 32
  "Linkage Mapper",             // 33
  "Meiosis Marshal",            // 34
  "Transcription Factor",       // 35
  "Ribosome Wrangler",          // 36
  "Mutation Analyst",           // 37
  "Restriction Enzyme",         // 38
  "Gel Reader",                 // 39
  "Master of Inheritance",      // 40
  "PCR Operator",               // 41
  "CRISPR Architect",           // 42
  "Transgenic Designer",        // 43
  "Bioethics Council",          // 44
  "Koch's Successor",           // 45
  "Epidemic Curve Reader",      // 46
  "Contact Tracer",             // 47
  "Immunologist",               // 48
  "Vaccine Strategist",         // 49
  "Distinguished Biologist",    // 50
  "Homeostasis Custodian",      // 51
  "Nephron Navigator",          // 52
  "Neural Cartographer",        // 53
  "Epidemiologist Royale",      // 54
  "Genome Sovereign",           // 55
  "Nobel Hopeful",              // 56
  "Nobel Laureate",             // 57
  "Endosymbiont",               // 58
  "Tree of Life",               // 59
  "Biosphere Legend"            // 60+
];

/* Difficulty modes. `xp` MULTIPLIES what a run earns — it never adds, so a
   run worth nothing is still worth nothing on Nightmare. `timeScale` shortens
   every clock and `lock` names power-ups that difficulty refuses to allow. */
BIO.DATA.difficulties = [
  { id:"standard",  name:"Standard",  icon:"🌿", xp:1.0,  timeScale:1.0,  lock:[],
    desc:"The default balance. Full timers, every power-up available." },
  { id:"hard",      name:"Hard",      icon:"🔥", xp:1.45, timeScale:0.75, lock:["fifty"],
    desc:"A quarter less time on every clock and no Halve the field — but 45% more XP." },
  { id:"nightmare", name:"Nightmare", icon:"☠️", xp:2.0,  timeScale:0.55, lock:["fifty","skip"],
    desc:"Barely any time, no Halve the field and no Pass. Double XP for the reckless." }
];

/* Per-module mastery tiers, measured against State.mastery(). */
BIO.DATA.masteryTiers = [
  { at:0,  name:"Unranked", icon:"▪️" },
  { at:25, name:"Bronze",   icon:"🥉" },
  { at:45, name:"Silver",   icon:"🥈" },
  { at:65, name:"Gold",     icon:"🥇" },
  { at:80, name:"Platinum", icon:"💠" },
  { at:92, name:"Diamond",  icon:"💎" }
];
