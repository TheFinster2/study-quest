/* The general wardrobe: app themes and avatars sold for Stars in the general shop.
   Subject shops sell their own themes (<id>-<name>) and avatars for subject coins;
   everything owned lands in the same global wardrobe and can be worn anywhere. */
window.SQ = window.SQ || {};
SQ.DATA = SQ.DATA || {};

SQ.DATA.themes = [
  { id: "midnight", name: "Midnight",  price: 0,    level: 1,  swatch: ["#0a0f1c", "#39d6c8", "#7c5cff"] },
  { id: "paper",    name: "Paper",     price: 150,  level: 1,  swatch: ["#f4f7fb", "#1d5fc4", "#6d5cff"] },
  { id: "ocean",    name: "Ocean",     price: 250,  level: 3,  swatch: ["#04141a", "#28e0ff", "#0f7aa8"] },
  { id: "chalk",    name: "Chalkboard",price: 300,  level: 5,  swatch: ["#08160f", "#a8f0c8", "#e8f5b8"] },
  { id: "golden",   name: "Golden Hour",price: 450, level: 8,  swatch: ["#150e05", "#ffc861", "#ff7a3d"] },
  { id: "ember",    name: "Ember",     price: 600,  level: 12, swatch: ["#170406", "#ff6a4d", "#ffb03a"] },
  { id: "lime",     name: "Lime",      price: 800,  level: 16, swatch: ["#060a02", "#b6ff2e", "#6fdc00"] },
  { id: "mono",     name: "Mono",      price: 1000, level: 20, swatch: ["#050506", "#d8dee9", "#4a5162"] },
  { id: "aurora",   name: "Aurora",    price: 1400, level: 28, swatch: ["#050818", "#7dffb0", "#a86bff"] },
  { id: "neon",     name: "Neon",      price: 2000, level: 36, swatch: ["#12021c", "#ff3df0", "#28e0ff"] }
];

SQ.DATA.avatars = [
  { emoji: "🎓", price: 0, level: 1 }, { emoji: "📚", price: 0, level: 1 },
  { emoji: "✏️", price: 60, level: 1 }, { emoji: "🦉", price: 90, level: 2 },
  { emoji: "🐢", price: 120, level: 3 }, { emoji: "🦊", price: 160, level: 4 },
  { emoji: "🐙", price: 220, level: 6 }, { emoji: "🚀", price: 300, level: 8 },
  { emoji: "🧠", price: 380, level: 10 }, { emoji: "🦄", price: 480, level: 13 },
  { emoji: "🐉", price: 620, level: 17 }, { emoji: "🌌", price: 800, level: 22 },
  { emoji: "🏆", price: 1100, level: 30 }, { emoji: "👑", price: 1600, level: 40 },
  { emoji: "🌟", price: 2400, level: 55 }, { emoji: "🪐", price: 3600, level: 75 }
];

/* Rare avatars — only from The Vault crate. */
SQ.DATA.rareAvatars = ["🦚", "🐲", "🧿", "🪩", "🦩", "🫧"];
