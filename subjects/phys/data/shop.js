/* The shop: themes, avatars, power-ups and crates.
   Prices are in Joules, the currency award() pays out at 0.75× run value. */
window.PHYS = window.PHYS || {};
PHYS.DATA = PHYS.DATA || {};

PHYS.DATA.themes = [
  { id: "phys-graphite",   name: "Graphite",   price: 0,    dots: ["#080b14", "#4cc9f0", "#8a5cff"],
    desc: "The default notebook — dark, cool, out of the way." },
  { id: "phys-blueprint",  name: "Blueprint",  price: 450,  dots: ["#04101f", "#7fd4ff", "#2f7fd0"],
    desc: "Drafting paper and cyanotype blue." },
  { id: "phys-chalkboard", name: "Chalkboard", price: 450,  dots: ["#0b1410", "#8de8b0", "#d8e86a"],
    desc: "Green board, chalk dust, a diagram you half-rubbed out." },
  { id: "phys-daylight",   name: "Daylight",   price: 600,  dots: ["#f5f8fc", "#1f66b5", "#8a5cff"],
    desc: "A light theme, for reading in the sun." },
  { id: "phys-redshift",   name: "Redshift",   price: 700,  dots: ["#150409", "#ff7d8f", "#ffab4d"],
    desc: "Everything receding, everything warmer." },
  { id: "phys-starfield",  name: "Starfield",  price: 850,  dots: ["#04050f", "#c8b6ff", "#5ce1e6"],
    desc: "Deep sky, faint violet, distant light." },
  { id: "phys-cherenkov",  name: "Cherenkov",  price: 950,  dots: ["#02121a", "#2ee6ff", "#3f7bff"],
    desc: "The blue glow of something moving faster than light in water." },
  { id: "phys-magnetite",  name: "Magnetite",  price: 1000, dots: ["#050506", "#d5dce8", "#4d5566"],
    desc: "Monochrome, high contrast, no distractions at all." },
  { id: "phys-fusion",     name: "Fusion",     price: 1400, dots: ["#170a02", "#ffb03a", "#ff4d3d"],
    desc: "Core temperature. Earned, not bought cheaply." },
  { id: "phys-quantum",    name: "Quantum",    price: 2000, dots: ["#0d0220", "#e05cff", "#2ee6ff"],
    desc: "Superposed magenta and cyan. The expensive one." }
];

PHYS.DATA.avatars = [
  { emoji: "🧑‍🔬", price: 0 },   { emoji: "🍎", price: 0 },
  { emoji: "🧲", price: 220 },   { emoji: "⚛️", price: 220 },
  { emoji: "🛰️", price: 300 },   { emoji: "🔭", price: 300 },
  { emoji: "💡", price: 300 },   { emoji: "⚡", price: 380 },
  { emoji: "🌌", price: 450 },   { emoji: "🪐", price: 450 },
  { emoji: "☄️", price: 550 },   { emoji: "🌞", price: 550 },
  { emoji: "🎢", price: 650 },   { emoji: "🧊", price: 650 },
  { emoji: "🕳️", price: 900 },   { emoji: "🔱", price: 1600 }
];

PHYS.DATA.powerups = [
  { id: "fifty",  icon: "✂️", name: "50:50",     price: 120,
    desc: "Removes two wrong options from one question." },
  { id: "skip",   icon: "⏭️", name: "Skip",      price: 90,
    desc: "Move past one question without answering it." },
  { id: "freeze", icon: "🧊", name: "Freeze",    price: 200,
    desc: "Stops the clock for 15 seconds in a timed mode." },
  { id: "shield", icon: "🛡️", name: "Shield",    price: 260,
    desc: "Absorbs one wrong answer in a boss fight." },
  { id: "double", icon: "✖️", name: "Double XP", price: 400,
    desc: "Doubles the XP from your next completed run." }
];

PHYS.DATA.crates = [
  { id: "crate-small", icon: "📦", name: "Supply crate", price: 300,
    desc: "Three random power-ups.", rolls: 3 },
  { id: "crate-big", icon: "🎁", name: "Lab shipment", price: 900,
    desc: "Eight random power-ups, weighted towards the good ones.", rolls: 8, good: true, better: true }
];
