/* Arcade skins — every subject's dressing for the six shared engines.

   One engine per genre; a skin changes only what the engine DRAWS and what it is
   CALLED (tiles, ladders, obstacles, pickups, chapter names, a crush skin's word
   orders). It never changes the rules, the timing or the scoring curve, so a high
   score is comparable whatever the student is wearing, and no skin is
   pay-to-win.

   Each game has one free, neutral default skin (subject: null). Subject skins are
   bought in that subject's shop for its coins — SQ.Arcade.skinsFor(subjectId) —
   gated by SUBJECT level, stored in data.owned.skins and equipped in
   data.arcade.skin[game]. The lobby's picker shows owned skins only.

   Where a skin came from:
     crush   Ion Crush (Chem) · Particle Lab (Phys) · Prime Crush (Maths Adv, Maths Std)
             · Letter Crush with word orders (English) · organelles (Bio) · tickers (Econ)
     runner  Mole Runner · Photon Runner · Vector Runner · Budget Runner · Margin Runner
             · Cell Run · Market Run
     merge   Isotope 2048 H→Ar (Chem) · nuclides ¹H→²⁰⁸Pb (Phys) · Power Tower (both maths)
             · Word Tower LETTER→CANON (English)
     pairs   Chromosome Match (Bio) · Ticker Match (Econ) · and one per other subject
     phagocyte  Phagocyte (Bio) · Black Hole (Phys)
     catch   Bargain Hunt (Econ) · Budget Basket (Maths Std) */
window.SQ = window.SQ || {};

(function () {
  const A = SQ.Arcade;

  /* Prices in the subject's own coins, levels are SUBJECT levels. Roughly: a pairs
     skin costs one decent run, a runner skin about three. */
  const P = { pairs: [300, 1], crush: [450, 2], merge: [600, 3], runner: [900, 5], phagocyte: [1200, 8], catch: [1200, 8] };
  const sub = (game, subject, id, o) => Object.assign({
    id: game + "-" + id, game, subject, price: P[game][0], level: P[game][1]
  }, o);

  /* ═════════════════════════ CRUSH (match-3) ═════════════════════════ */
  A.defineSkins([
    { id: "crush-default", game: "crush", subject: null, price: 0, level: 0,
      name: "Gems", title: "Gem Crush", icon: "💎", desc: "The free default: six coloured gems.",
      data: { tiles: [
        { face: "◆", colour: "#39d6c8" }, { face: "●", colour: "#ff6b81" }, { face: "▲", colour: "#ffcc55" },
        { face: "■", colour: "#6fa8ff" }, { face: "★", colour: "#c8a2ff" }, { face: "⬟", colour: "#3fe08a" }] } },

    sub("crush", "chem", "chem", { name: "Ion Crush", title: "Ion Crush", icon: "⚗️",
      desc: "Match ions. Four in a row forge a ⚡ Charged ion, an L or T an ☢ Unstable one, five a ✳ Catalyst.",
      data: { small: true, tiles: [
        { face: "Na⁺", colour: "#ffd24a" }, { face: "Cl⁻", colour: "#7dffa6" }, { face: "OH⁻", colour: "#6fa8ff" },
        { face: "SO₄²⁻", colour: "#c8a2ff" }, { face: "NH₄⁺", colour: "#ff8fb1" }, { face: "CO₃²⁻", colour: "#5ee7e7" }] } }),

    sub("crush", "phys", "phys", { name: "Particle Lab", title: "Particle Lab", icon: "🔭",
      desc: "Fundamental particles. Chains score more; setting off two power tiles at once scores most.",
      data: { tiles: [
        { face: "e⁻", colour: "#7fd4ff" }, { face: "p⁺", colour: "#ff8a9c" }, { face: "n", colour: "#c8b6ff" },
        { face: "γ", colour: "#ffd76b" }, { face: "ν", colour: "#7dffa6" }, { face: "μ", colour: "#ffa06b" }] } }),

    sub("crush", "madv", "madv", { name: "Prime Crush", title: "Prime Crush", icon: "∫",
      desc: "Number tiles — prime tiles score double.",
      data: { tiles: [
        { face: "2", colour: "#39d6c8", bonus: 2 }, { face: "3", colour: "#7c5cff", bonus: 2 },
        { face: "5", colour: "#ffcc55", bonus: 2 }, { face: "4", colour: "#ff6b81" },
        { face: "6", colour: "#6fa8ff" }, { face: "9", colour: "#3fe08a" }] } }),

    sub("crush", "mstd", "mstd", { name: "Prime Crush Std", title: "Prime Crush", icon: "📐",
      desc: "Six primes from 2 to 13. The bigger the prime, the more it scores.",
      data: { tiles: [
        { face: "2", colour: "#ff9a6b" }, { face: "3", colour: "#ffcc55" }, { face: "5", colour: "#3fe08a" },
        { face: "7", colour: "#39d6c8", bonus: 1.2 }, { face: "11", colour: "#6fa8ff", bonus: 1.4 },
        { face: "13", colour: "#c8a2ff", bonus: 1.6 }] } }),

    sub("crush", "eng", "eng", { name: "Letter Crush", title: "Letter Crush", icon: "🖋️",
      desc: "A E I R S T tiles and a word order to fill: clear the letters it needs to spell it.",
      data: {
        tiles: [
          { face: "A", colour: "#e0b04a" }, { face: "E", colour: "#7fc98a" }, { face: "I", colour: "#8ab4d8" },
          { face: "R", colour: "#e0574a" }, { face: "S", colour: "#a08ab8" }, { face: "T", colour: "#c8b48a" }],
        /* Every word is spellable from those six letters. */
        words: ["STAR", "ARTS", "TIER", "RISE", "SEAT", "EAST", "TEAR", "RATE", "STIR", "SITE",
                "STARE", "TEARS", "ARISE", "RAISE", "STAIR", "IRATE", "SITAR", "TIARA",
                "SATIRE", "ARTIST", "TRAITS", "STRAIT", "SIESTA", "ARTISTE"] } }),

    sub("crush", "bio", "bio", { name: "Organelle Crush", title: "Organelle Crush", icon: "🧬",
      desc: "Nuclei, mitochondria, ribosomes and friends — match three to clear.",
      data: { small: true, tiles: [
        { face: "Nuc", colour: "#c8a2ff" }, { face: "Mito", colour: "#ff8a6b" }, { face: "Ribo", colour: "#7fd4ff" },
        { face: "Chl", colour: "#3fe08a" }, { face: "Golgi", colour: "#ffd24a" }, { face: "Vac", colour: "#ff8fb1" }] } }),

    sub("crush", "econ", "econ", { name: "Ticker Crush", title: "Ticker Crush", icon: "📊",
      desc: "Line up the tickers. Five of a kind is a market-wide rally.",
      data: { small: true, tiles: [
        { face: "BHP", colour: "#ffcc55" }, { face: "CBA", colour: "#6fa8ff" }, { face: "CSL", colour: "#ff6b81" },
        { face: "WES", colour: "#3fe08a" }, { face: "RIO", colour: "#c8a2ff" }, { face: "NAB", colour: "#39d6c8" }] } })
  ]);

  /* ═════════════════════════ RUNNER ═════════════════════════
     glyphs: what is drawn on each obstacle kind; labels: what the how-to line calls
     them. ground = jump it, hang = duck it, strike = the bobbing hazard, pickup = the
     chain collectible, shield = absorbs one hit. */
  A.defineSkins([
    { id: "runner-default", game: "runner", subject: null, price: 0, level: 0,
      name: "Night Run", title: "Night Run", icon: "🏃", desc: "The free default: a runner, some crates and a lot of stars.",
      data: { runner: "block", glyphs: { ground: "▦", hang: "〰", strike: "✕", pickup: "★", shield: "◆" },
        labels: { ground: "crates", hang: "wires", pickup: "stars", shield: "a shield" },
        chapters: ["Dusk", "Evening", "Late", "Midnight", "Small Hours", "Dawn"], death: "Wiped out" } },

    sub("runner", "chem", "chem", { name: "Mole Runner", title: "Mole Runner", icon: "⚗️",
      desc: "Jump the beakers, duck the fume clouds, collect electrons.",
      data: { runner: "flask", glyphs: { ground: "🧪", hang: "☁", strike: "🔥", pickup: "⚛", shield: "🛡" },
        labels: { ground: "beakers", hang: "fume clouds", pickup: "electrons", shield: "a buffer" },
        chapters: ["Bench", "Titration", "Reflux", "Distillation", "Fume Hood", "Final Yield"], death: "Spilled" } }),

    sub("runner", "phys", "phys", { name: "Photon Runner", title: "Photon Runner", icon: "🔭",
      desc: "Ride a wavefront: jump the barriers, duck the fields, gather photons.",
      data: { runner: "photon", glyphs: { ground: "▮", hang: "≋", strike: "⚡", pickup: "✦", shield: "⊕" },
        labels: { ground: "barriers", hang: "fields", pickup: "photons", shield: "a shield" },
        chapters: ["Radio", "Microwave", "Infrared", "Visible", "Ultraviolet", "Gamma"], death: "Absorbed" } }),

    sub("runner", "madv", "madv", { name: "Vector Runner", title: "Vector Runner", icon: "∫",
      desc: "Jump the asymptotes, duck the ceilings, collect π.",
      data: { runner: "arrow", glyphs: { ground: "∑", hang: "∞", strike: "÷", pickup: "π", shield: "√" },
        labels: { ground: "sums", hang: "ceilings", pickup: "π", shield: "a root" },
        chapters: ["Functions", "Trig", "Calculus", "Series", "Vectors", "Extension 1"], death: "Undefined" } }),

    sub("runner", "mstd", "mstd", { name: "Budget Runner", title: "Budget Runner", icon: "📐",
      desc: "Jump the expenses, duck the overheads, collect the payslips.",
      data: { runner: "block", glyphs: { ground: "💸", hang: "📉", strike: "🧾", pickup: "$", shield: "🏦" },
        labels: { ground: "expenses", hang: "overheads", pickup: "payslips", shield: "savings" },
        chapters: ["Pocket Money", "Casual Job", "Rent", "Loan", "Super", "Retirement"], death: "Overdrawn" } }),

    sub("runner", "eng", "eng", { name: "Margin Runner", title: "Margin Runner", icon: "🖋️",
      desc: "A nib down the margin: jump the footnotes, duck the marginalia, collect the ink.",
      data: { runner: "nib", glyphs: { ground: "¶", hang: "〰", strike: "✗", pickup: "💧", shield: "✒" },
        labels: { ground: "footnotes", hang: "marginalia", pickup: "ink", shield: "a spare nib" },
        chapters: ["Foolscap", "Second Draft", "Red Pen", "Marginalia", "Palimpsest", "Final Copy"], death: "Struck out" } }),

    sub("runner", "bio", "bio", { name: "Cell Run", title: "Cell Run", icon: "🧬",
      desc: "Dodge the lysosomes, duck the membranes, collect ATP.",
      data: { runner: "cell", glyphs: { ground: "🦠", hang: "〰", strike: "✺", pickup: "ATP", shield: "🛡" },
        labels: { ground: "lysosomes", hang: "membranes", pickup: "ATP", shield: "an antibody" },
        chapters: ["Cytoplasm", "Membrane", "Bloodstream", "Lymph", "Spleen", "Marrow"], death: "Lysed" } }),

    sub("runner", "econ", "econ", { name: "Market Run", title: "Market Run", icon: "📊",
      desc: "Dodge the downturns, duck the tariffs, collect the dividends.",
      data: { runner: "block", glyphs: { ground: "📉", hang: "🧱", strike: "⚠", pickup: "💲", shield: "🏦" },
        labels: { ground: "downturns", hang: "tariffs", pickup: "dividends", shield: "a buffer" },
        chapters: ["Expansion", "Boom", "Peak", "Contraction", "Trough", "Recovery"], death: "Recession" } })
  ]);

  /* ═════════════════════════ MERGE (2048) ═════════════════════════
     ladder[i] is the tile worth 2^(i+1). The top rung does not merge further. */
  const pow2 = n => { const out = []; for (let i = 1; i <= n; i++) out.push(i); return out; };
  const SUP = { 0: "⁰", 1: "¹", 2: "²", 3: "³", 4: "⁴", 5: "⁵", 6: "⁶", 7: "⁷", 8: "⁸", 9: "⁹" };
  const sup = n => String(n).split("").map(d => SUP[d]).join("");
  const RAMP = ["#3a4256", "#44506b", "#4f6390", "#4a77a8", "#3f8bb4", "#2f9fae", "#2fae8b", "#4bb85e",
                "#8cc63f", "#d4c13c", "#e0a132", "#e07b32", "#e0553a", "#d63a63", "#b83ac4", "#7c3aed",
                "#4f46e5", "#0ea5e9"];

  A.defineSkins([
    { id: "merge-default", game: "merge", subject: null, price: 0, level: 0,
      name: "Numbers", title: "2048", icon: "🔢", desc: "The free default: plain numbers, all the way up.",
      data: { goal: "2048", ladder: pow2(17).map((p, i) => ({ sym: String(Math.pow(2, p)), colour: RAMP[i] })) } },

    sub("merge", "chem", "chem", { name: "Isotope 2048", title: "Isotope 2048", icon: "⚗️",
      desc: "Two identical nuclei fuse into the next element: hydrogen to argon.",
      data: { goal: "Ar", ladder: [
        ["H", "Hydrogen"], ["He", "Helium"], ["Li", "Lithium"], ["Be", "Beryllium"], ["B", "Boron"], ["C", "Carbon"],
        ["N", "Nitrogen"], ["O", "Oxygen"], ["F", "Fluorine"], ["Ne", "Neon"], ["Na", "Sodium"], ["Mg", "Magnesium"],
        ["Al", "Aluminium"], ["Si", "Silicon"], ["P", "Phosphorus"], ["S", "Sulfur"], ["Cl", "Chlorine"], ["Ar", "Argon"]
      ].map(([sym, name], i) => ({ sym, name, colour: RAMP[i] })) } }),

    sub("merge", "phys", "phys", { name: "Nuclide 2048", title: "Nuclide 2048", icon: "🔭",
      desc: "Fuse nuclides up the binding-energy curve, from ¹H to ²⁰⁸Pb.",
      data: { goal: "⁵⁶Fe", ladder: [
        ["¹H", "#243044"], ["²H", "#2b4a6b"], ["³He", "#2f6f8f"], ["⁴He", "#2f8f86"], ["⁷Li", "#3d9a5f"],
        ["¹²C", "#6fa83d"], ["¹⁶O", "#b3a52c"], ["²⁰Ne", "#d18c25"], ["²⁴Mg", "#d9631f"], ["²⁸Si", "#c93b2a"],
        ["⁵⁶Fe", "#a52b4a"], ["⁵⁹Ni", "#7d2a6b"], ["²⁰⁸Pb", "#4a2a7d"]
      ].map(([sym, colour]) => ({ sym, colour })) } }),

    sub("merge", "madv", "madv", { name: "Power Tower", title: "Power Tower", icon: "∫",
      desc: "Tiles labelled as the powers of two they are: 2¹ up to 2¹¹ and beyond.",
      data: { goal: "2¹¹", ladder: pow2(16).map((p, i) => ({ sym: "2" + sup(p), colour:
        ["#2a3350", "#39d6c8", "#37c2e0", "#6fa8ff", "#7c5cff", "#a86bff", "#ff6bd6", "#ff6b81",
         "#ff9a4d", "#ffcc55", "#ffe98a", "#b6ff2e", "#3fe08a", "#39d6c8", "#6fa8ff", "#7c5cff"][i] })) } }),

    sub("merge", "mstd", "mstd", { name: "Savings Tower", title: "Power Tower", icon: "📐",
      desc: "Double your money: $2 to $2048 and beyond.",
      data: { goal: "$2k", ladder: pow2(16).map((p, i) => {
        const v = Math.pow(2, p);
        return { sym: v >= 10000 ? "$" + Math.round(v / 1000) + "k" : "$" + v.toLocaleString("en-AU"), colour: RAMP[i] };
      }) } }),

    sub("merge", "eng", "eng", { name: "Word Tower", title: "Word Tower", icon: "🖋️",
      desc: "Merge up the literary hierarchy: LETTER to CANON.",
      data: { goal: "CANON", small: true, ladder: [
        ["LETTER", "#8d8478"], ["WORD", "#a08ab8"], ["PHRASE", "#8ab4d8"], ["CLAUSE", "#7fc98a"], ["LINE", "#c8b48a"],
        ["STANZA", "#e0b04a"], ["PARAGRAPH", "#e08a4a"], ["CHAPTER", "#e0574a"], ["BOOK", "#c9418a"],
        ["OEUVRE", "#8a41c9"], ["CANON", "#e8c96a"]
      ].map(([sym, colour]) => ({ sym, colour })) } })
  ]);

  /* ═════════════════════════ PAIRS (memory) ═════════════════════════ */
  A.defineSkins([
    { id: "pairs-default", game: "pairs", subject: null, price: 0, level: 0,
      name: "Shapes", title: "Pairs", icon: "🧩", desc: "The free default: coloured shapes.",
      data: { symbols: ["🔴", "🟠", "🟡", "🟢", "🔵", "🟣", "🟤", "⚫", "⭐", "❤️"] } },
    sub("pairs", "bio", "bio", { name: "Chromosome Match", title: "Chromosome Match", icon: "🧬",
      desc: "Pair the specimens before the clock runs out.",
      data: { symbols: ["🧬", "🔬", "🌿", "🦠", "🩸", "🫀", "🧫", "🌱", "🐛", "🍄"] } }),
    sub("pairs", "econ", "econ", { name: "Ticker Match", title: "Ticker Match", icon: "📊",
      desc: "Pair the tickers before the closing bell.",
      data: { symbols: ["📈", "📉", "💹", "🏦", "🪙", "💵", "📊", "🧾", "⚖️", "🏗️"] } }),
    sub("pairs", "chem", "chem", { name: "Element Match", title: "Element Match", icon: "⚗️",
      desc: "Pair the lab kit.",
      data: { symbols: ["⚗️", "🧪", "🔥", "💧", "🧊", "⚛️", "🧲", "🌡️", "⚖️", "🔬"] } }),
    sub("pairs", "phys", "phys", { name: "Quantum Pairs", title: "Quantum Pairs", icon: "🔭",
      desc: "Entangle the pairs.",
      data: { symbols: ["⚡", "🔭", "🧲", "💡", "🌈", "🛰️", "⚛️", "🌀", "🔋", "📡"] } }),
    sub("pairs", "eng", "eng", { name: "Folio Pairs", title: "Folio Pairs", icon: "🖋️",
      desc: "Pair the props of the study.",
      data: { symbols: ["📖", "🖋️", "📜", "🎭", "✒️", "📚", "🗝️", "🕯️", "🪶", "📝"] } }),
    sub("pairs", "madv", "madv", { name: "Symbol Pairs", title: "Symbol Pairs", icon: "∫",
      desc: "Pair the notation.",
      data: { text: true, symbols: ["∑", "π", "∞", "√", "∫", "Δ", "θ", "≈", "∂", "±"] } }),
    sub("pairs", "mstd", "mstd", { name: "Budget Pairs", title: "Budget Pairs", icon: "📐",
      desc: "Pair the household ledger.",
      data: { symbols: ["💳", "🏠", "🚗", "🛒", "💡", "📱", "🍎", "⛽", "🎓", "🧮"] } })
  ]);

  /* ═════════════════════════ PHAGOCYTE (drag to engulf) ═════════════════════════ */
  A.defineSkins([
    { id: "phagocyte-default", game: "phagocyte", subject: null, price: 0, level: 0,
      name: "Blob", title: "Blob", icon: "🫧", desc: "The free default: eat the green, dodge the red.",
      data: { good: { label: "food", glyph: "", colour: "--good" }, bad: { label: "spikes", glyph: "✕", colour: "--bad" },
        player: { colour: "--accent" }, blurb: "Eat the green. Touch the red and you lose a life." } },
    sub("phagocyte", "bio", "bio", { name: "Phagocyte", title: "Phagocyte", icon: "🦠",
      desc: "Engulf the pathogens. Do not eat the host cells.",
      data: { good: { label: "pathogens", glyph: "🦠", colour: "--bad" }, bad: { label: "host cells", glyph: "", colour: "--info" },
        player: { colour: "--good" },
        blurb: "Engulf red pathogens; avoid blue host cells — autoimmunity costs a life." } }),
    sub("phagocyte", "phys", "phys", { name: "Black Hole", title: "Black Hole", icon: "🔭",
      desc: "Swallow the asteroids, steer clear of the satellites.",
      data: { good: { label: "asteroids", glyph: "☄", colour: "--warn" }, bad: { label: "satellites", glyph: "🛰", colour: "--info" },
        player: { colour: "--glow-b" }, dark: true,
        blurb: "Swallow asteroids to grow; a satellite costs a life." } })
  ]);

  /* ═════════════════════════ CATCH (Bargain Hunt) ═════════════════════════ */
  A.defineSkins([
    { id: "catch-default", game: "catch", subject: null, price: 0, level: 0,
      name: "Star Catch", title: "Star Catch", icon: "🧺", desc: "The free default: catch stars, dodge bombs.",
      data: { basket: "🧺", good: ["⭐", "🌟", "✨"], bad: ["💣"], gold: "💎",
        labels: { good: "stars", bad: "bombs", gold: "gems" } } },
    sub("catch", "econ", "econ", { name: "Bargain Hunt", title: "Bargain Hunt", icon: "📊",
      desc: "Grab the bargains, leave the overpriced ones alone.",
      data: { basket: "🛒", good: ["🏷️", "🍎", "👟", "📦"], bad: ["💰"], gold: "🎟️",
        labels: { good: "bargains", bad: "overpriced goods", gold: "clearance deals" } } }),
    sub("catch", "mstd", "mstd", { name: "Budget Basket", title: "Budget Basket", icon: "📐",
      desc: "Catch the discounts, dodge the fees.",
      data: { basket: "🧺", good: ["💵", "🪙", "🏷️"], bad: ["💸", "🧾"], gold: "💳",
        labels: { good: "discounts", bad: "fees", gold: "cashback" } } })
  ]);
})();
