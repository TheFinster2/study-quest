# Physics arcade skins (for the shared arcade)

Newton's Notebook had three arcade games (not ported — the shared arcade replaces
them). Their look, for turning into `phys` skins. Source files:
`/home/user/Physics-Study-App/js/games/arcade-{lab,isotope,photon}.js`.

## Match-3 → "Particle Lab"
Six fundamental-particle tiles, glyph on a coloured rounded square, bold 800 weight:

| glyph | colour |
|---|---|
| e⁻ | #7fd4ff |
| p⁺ | #ff8a9c |
| n | #c8b6ff |
| γ | #ffd76b |
| ν | #7dffa6 |
| μ | #ffa06b |

Runs of four or more leave a **charged** tile (white 2 px inner outline, pulsing
brightness/saturation glow). Pops scale up then shrink with a 25° twist; combo
counter in the accent colour. Board 8×8.

## 2048 ladder → "Isotope 2048"
Nuclides fuse up the ladder (value → glyph → tile colour), white text, value small underneath:

¹H 2 #243044 · ²H 4 #2b4a6b · ³He 8 #2f6f8f · ⁴He 16 #2f8f86 · ⁷Li 32 #3d9a5f ·
¹²C 64 #6fa83d · ¹⁶O 128 #b3a52c · ²⁰Ne 256 #d18c25 · ²⁴Mg 512 #d9631f ·
²⁸Si 1024 #c93b2a · ⁵⁶Fe 2048 #a52b4a · ⁵⁹Ni 4096 #7d2a6b · ²⁰⁸Pb 8192 #4a2a7d

Game-over line: "Highest nuclide reached: ⁵⁶Fe." Empty cells rgba(255,255,255,.04).

## Runner → "Photon Runner"
The player is a **photon** (a small glowing dot in `--glow-a` with a fading
sinusoidal trail — a wavefront). Obstacles are **barriers** (vertical slabs with a
gap; the gap narrows and speed builds). Score reads "N barriers". Hold to climb,
release to fall (a flappy-style control rather than a lane runner). Pickups: none
in the original; natural fits would be ν (neutrino, passes through one barrier)
and γ (a speed-boost photon).

Palette: the Graphite theme — bg #080b14, glow #4cc9f0 / #8a5cff, faint graph-paper grid.
