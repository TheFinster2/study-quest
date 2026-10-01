# Chemistry (MoleQuest) arcade skins

MoleQuest had three arcade games. The shared engines replace them, and these are the
visuals to turn into `chem` skins (data copied from the old js/data/arcade.js).

## Match-3 (was "Ion Crush", 8×8)
Six ion tiles, each with a fill and glow colour:

| glyph | fill | glow |
|---|---|---|
| Na⁺   | #ffd24a | #ffb300 |
| Cl⁻   | #7dffa6 | #22c55e |
| OH⁻   | #6fa8ff | #2563eb |
| SO₄²⁻ | #c8a2ff | #7c3aed |
| NH₄⁺  | #ff8fb1 | #e11d48 |
| CO₃²⁻ | #5ee7e7 | #0891b2 |

Power tiles: ⚡ **Charged** (run of 4: clears its row and column), ☢ **Unstable**
(L/T shape: clears the 3×3), ✳ **Catalyst** (run of 5+: clears every ion of one type).
Card colour #ff5c8a. Blurb: "Match three or more ions to clear them. Cascades score big."

## Runner (was "Mole Runner")
Lab dash. Ground obstacles drawn as a **flask** (tall, 26×46) and a **Bunsen burner**
(short, 34×30); an overhead **fume cloud** (58×26) you duck under, appearing after
~400 m. Pickups: 🛡 Buffer (shield, `--info`), ⚡ Catalyst (4.2 s boost, `--warn`),
⚛ orb (points, `--good`). Near-misses score a bonus. Card colour #ffcc55.

## 2048 ladder (was "Isotope 2048")
Two identical nuclei merge into the next element, H → Ar (18 rungs):
H #3a4256, He #44506b, Li #4f6390, Be #4a77a8, B #3f8bb4, C #2f9fae, N #2fae8b,
O #4bb85e, F #8cc63f, Ne #d4c13c, Na #e0a132, Mg #e07b32, Al #e0553a, Si #d63a63,
P #b83ac4, S #7c3aed, Cl #4f46e5, Ar #0ea5e9. Tiles show the symbol large and the
name small. Three undos per run. Card colour #39d6c8.
