/* Shop catalogue: themes, avatars, power-ups and crates.
   Plus the 60 level titles, the difficulty modes and the mastery tiers. */
window.MA = window.MA || {};
MA.DATA = MA.DATA || {};

MA.DATA.LEGACY_THEMES = { graph:"midnight", golden:"golden", paper:"paper", complex:"ocean",
  euler:"ember", chalk:"chalk", imaginary:"neon", montecarlo:"aurora", manifold:"mono", radian:"lime" };

MA.DATA.shop = {
  /* MathQuest's ten themes were promoted to the app's general themes (graph →
     midnight, golden, paper, complex → ocean, euler → ember, chalk,
     imaginary → neon, montecarlo → aurora, manifold → mono, radian → lime), so
     the subject shop sells a new set of maths-flavoured themes, defined on the
     core tokens in subjects/madv/css/themes.css. `LEGACY_THEMES` maps an old
     save's theme ids onto the app themes for importLegacy(). */
  themes: [
    { id:"madv-graphpaper", name:"Graph Paper",  cost:500,  desc:"Green ruled grid on deep ink. The default notebook, grown up.",
      dots:["#0b1a12","#5fe39a","#c8f5a0"] },
    { id:"madv-blackboard", name:"Blackboard",   cost:900,  desc:"Chalk white and yellow on slate. Somebody left a proof up.",
      dots:["#14191c","#f2f0e6","#ffd866"] },
    { id:"madv-blueprint",  name:"Blueprint",    cost:1400, desc:"Violet-blue drafting sheet with cyan construction lines.",
      dots:["#0d1030","#8f7bff","#5ad1ff"], minLevel:10 },
    { id:"madv-parchment",  name:"Parchment",    cost:2200, desc:"A light, warm page for long proofs. Ink brown and red pen.",
      dots:["#f6efe0","#6b3f1f","#c2412d"], minLevel:18 },
    { id:"madv-contour",    name:"Contour Map",  cost:3600, desc:"Level curves in teal and amber over midnight — f(x, y) = c.",
      dots:["#061418","#2fd1b8","#ffb347"], minLevel:30 }
  ],

  avatars: [
    { emoji:"🧮", name:"Abacus",          cost:0 },
    { emoji:"📐", name:"Set Square",      cost:0 },
    { emoji:"📏", name:"Straight Edge",   cost:300 },
    { emoji:"✏️", name:"Working Shown",   cost:300 },
    { emoji:"📊", name:"Bar Chart",       cost:450 },
    { emoji:"📈", name:"Upward Trend",    cost:450 },
    { emoji:"🎲", name:"Fair Die",        cost:600 },
    { emoji:"🧊", name:"Unit Cube",       cost:600 },
    { emoji:"🔺", name:"Special Triangle",cost:750 },
    { emoji:"⭕", name:"Unit Circle",     cost:750 },
    { emoji:"🌀", name:"Spiral",          cost:900,  minLevel:8 },
    { emoji:"♾️", name:"Limiting Sum",    cost:1100, minLevel:10 },
    { emoji:"🧿", name:"Locus",           cost:1400, minLevel:12 },
    { emoji:"🎯", name:"Stationary Point",cost:1400, minLevel:14 },
    { emoji:"🌈", name:"Continuous",      cost:1800, minLevel:16 },
    { emoji:"🐐", name:"GOAT",            cost:2400, minLevel:18, note:"Greatest of all theorems." },
    { emoji:"👑", name:"Fields Medallist",cost:3200, minLevel:24 },
    { emoji:"🧠", name:"Second Derivative",cost:4000, minLevel:30 },
    { emoji:"🦾", name:"Autodifferentiator",cost:5200, minLevel:36 },
    { emoji:"🛸", name:"Non-Euclidean",   cost:6800, minLevel:42 },
    { emoji:"🌌", name:"Aleph Null",      cost:9000, minLevel:50 },
    { emoji:"🔱", name:"Ascendant",       cost:12000,minLevel:60, note:"Level 60. The end of the road." }
  ],

  powerups: [
    { id:"fifty",  icon:"✂️", name:"50/50",       cost:140,
      desc:"Removes two wrong options in a multiple-choice round." },
    { id:"skip",   icon:"⏭️", name:"Skip",        cost:110,
      desc:"Skip a question with no penalty to your streak." },
    { id:"freeze", icon:"🧊", name:"Time Freeze", cost:190,
      desc:"Adds 20 seconds to the clock in any timed mode." },
    { id:"shield", icon:"🛡️", name:"Buffer",      cost:260,
      desc:"Absorbs one wrong answer — your streak survives." },
    { id:"double", icon:"✨", name:"Boost",       cost:400,
      desc:"Doubles all XP earned for one complete run." },
    { id:"insight",icon:"🔍", name:"Insight",     cost:320,
      desc:"Reveals a hint for the current question without breaking your streak." },
    { id:"revive", icon:"💉", name:"Adrenaline",  cost:750,
      desc:"Restores 40% health when you fall in a boss fight. Consumed automatically." }
  ],

  crates: [
    { id:"crate_s", name:"Scrap Paper",   cost:600, icon:"📦",
      desc:"1-2 power-ups and a handful of Primes." },
    { id:"crate_l", name:"Supply Crate",  cost:1500, icon:"🎁",
      desc:"3-5 power-ups, a bigger payout, and a chance of a bonus avatar." },
    { id:"crate_x", name:"Reference Sheet",cost:4000, icon:"🗄️",
      desc:"6-9 power-ups, a large payout, and a good chance at a locked avatar.",
      minLevel:20 }
  ]
};

/* Level titles — indexed by level, capped at the last entry. 60 levels.
   The tone is dry and mathematical rather than generic gamification: the
   user asked for "enjoyable" first and "study app" second. */
MA.DATA.levelTitles = [
  "Number Line Walker",        //  1
  "Bracket Expander",          //  2
  "Sign Error Survivor",       //  3
  "Index Law Apprentice",      //  4
  "Factoriser",                //  5
  "Root Finder",               //  6
  "Graph Sketcher",            //  7
  "Domain Defender",           //  8
  "Transformation Wrangler",   //  9
  "Junior Analyst",            // 10
  "Radian Convert",            // 11
  "Unit Circle Regular",       // 12
  "Identity Prover",           // 13
  "Limit Approacher",          // 14
  "First Principles Purist",   // 15
  "Chain Rule Operator",       // 16
  "Quotient Rule Survivor",    // 17
  "Tangent Liner",             // 18
  "Stationary Point Spotter",  // 19
  "Band 5 Candidate",          // 20
  "Concavity Consultant",      // 21
  "Inflexion Inspector",       // 22
  "Optimiser",                 // 23
  "Antiderivative Adept",      // 24
  "Definite Integrator",       // 25
  "Area Accountant",           // 26
  "Trapezoidal Approximator",  // 27
  "Logarithm Linguist",        // 28
  "Exponential Modeller",      // 29
  "Band 6 Candidate",          // 30
  "Series Summoner",           // 31
  "Annuity Architect",         // 32
  "Amortisation Analyst",      // 33
  "Probability Broker",        // 34
  "Expected Value Realist",    // 35
  "Variance Auditor",          // 36
  "Regression Reader",         // 37
  "z-Score Standardiser",      // 38
  "Distribution Whisperer",    // 39
  "Master of the Mean",        // 40
  "Auxiliary Angler",          // 41
  "Substitution Specialist",   // 42
  "Volume of Revolution",      // 43
  "Direction Field Navigator", // 44
  "Combinatorial Counter",     // 45
  "Binomial Expander",         // 46
  "Pascal's Correspondent",    // 47
  "Inductive Reasoner",        // 48
  "Vector Cartographer",       // 49
  "Distinguished Mathematician",// 50
  "Projectile Plotter",        // 51
  "Asymptote Chaser",          // 52
  "Locus Sovereign",           // 53
  "Grandmaster of Proof",      // 54
  "Analytic Continuation",     // 55
  "Fields Hopeful",            // 56
  "Fields Medallist",          // 57
  "Elemental Theorem",         // 58
  "Euler's Equal",             // 59
  "MathQuest Legend"           // 60+
];

/* Difficulty modes. `xp` multiplies all XP earned; the rest are per game.
   This is SEPARATE from the MA/ME tier toggle — harder scoring, not more
   syllabus. Do not conflate the two. */
MA.DATA.difficulties = [
  { id:"standard", name:"Standard", icon:"📘", xp:1.0, timeScale:1.0, damage:1.0,
    desc:"The default balance. Full timers, normal boss damage." },
  { id:"hard", name:"Hard", icon:"🔥", xp:1.45, timeScale:0.75, damage:1.4,
    desc:"25% less time on every clock, bosses hit 40% harder — but 45% more XP." },
  { id:"nightmare", name:"Nightmare", icon:"☠️", xp:2.1, timeScale:0.55, damage:1.9,
    desc:"Barely any time, brutal bosses, no 50/50 or Skip. Double XP for the reckless." }
];

/* Topic mastery tiers, checked against State.mastery(). */
MA.DATA.masteryTiers = [
  { at:0,  name:"Unranked", icon:"▪️", colour:"var(--ink-faint)" },
  { at:25, name:"Bronze",   icon:"🥉", colour:"#cd7f32" },
  { at:45, name:"Silver",   icon:"🥈", colour:"#c0c0c0" },
  { at:65, name:"Gold",     icon:"🥇", colour:"#ffd24a" },
  { at:80, name:"Platinum", icon:"💠", colour:"#7fe3ff" },
  { at:92, name:"Diamond",  icon:"💎", colour:"#b388ff" }
];
