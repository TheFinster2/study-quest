# Biology arcade skins (for the shared arcade)

Biosphere shipped three arcade games (not ported — the arcade is shared). All
three drew with the theme tokens, so a Biology skin is mostly palette + glyphs.
Palette (bio-verdant): background `#0b1a13`, lines `#24503a`, accent `#4ade80`,
danger `#f87171`, friendly `#60a5fa`, text `#a9c9b8`.

| Biosphere game | Shared engine | Skin |
|---|---|---|
| **Cell Run** — one-tap runner, "dodge the lysosomes" | runner | player: a round green cell (accent, `#4ade80`) with a darker nucleus dot; obstacles: red lysosome blobs (`#f87171`) of two heights; ground: a thin membrane line (`--line`); pickups (new): ATP ⚡ / glucose ⬡; score label "µm travelled" |
| **Chromosome Match** — memory grid, 4–8 pairs | pairs | tile faces: 🧬 🔬 🌿 🦠 🩸 🫀 🧫 🌱 🐛 🍄; card back: a green helix on `#10251b` |
| **Phagocyte** — drag a macrophage, engulf pathogens, avoid host cells, 3 lives | phagocyte | player: a large accent-green blob; pathogens: red (`--bad`) spiked circles; host cells: blue (`--info`) smooth discs — eating one costs a life |

Match-3 (crush) tiles, if a Biology crush skin is wanted: 🧬 DNA, 🦠 microbe,
🌿 leaf, 🩸 blood, 🧫 culture, 🍄 fungus. 2048 (merge) ladder — biological
organisation: molecule → organelle → cell → tissue → organ → system →
organism → population → community → ecosystem → biome → biosphere
(labels "Mol · Org · Cell · Tis · Organ · Sys · Orgm · Pop · Com · Eco · Biome · 🌏").

Rule carried over: arcade games pay nothing (no award()); Biosphere's
exploit test asserted it structurally.
