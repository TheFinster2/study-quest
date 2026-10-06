# Maths Extension 1 — arcade skins

The shared arcade (`js/arcade/skins.js`) **already has mext skins** for crush ("Prime Crush"),
runner ("Vector Runner"), merge ("Power Tower") and pairs ("Symbol Pairs"). This file records the
stand-alone MathQuest look so those skins can be checked against it. The three old games were not ported.

- **Prime Crush (match-3, 8×8):** number tiles 2, 3, 5 (primes: teal `#39d6c8`, violet `#7c5cff`,
  amber `#ffcc55`) and 4, 6, 9 (composites: pink `#ff6b81`, blue `#6fa8ff`, green `#3fe08a`).
  Rule flavour: "line up three primes, or three of anything". Icon 🧮.
- **Vector Runner (endless runner, canvas):** a flat block runner on the graph-paper background.
  Ground blocks (jump) alternate with overhead bars (duck). No pickups. Accent `#ffcc55`. Icon 🏃.
- **Power Tower 2048 (merge, 4×4):** powers of two, tile ladder colours
  `#2a3350 #39d6c8 #37c2e0 #6fa8ff #7c5cff #a86bff #ff6bd6 #ff6b81 #ff9a4d #ffcc55 #ffe98a #b6ff2e`
  (2 → 4096), labels shown as `2ⁿ` alongside the number. Accent `#7c5cff`. Icon 🗼.
- All three paid **nothing**: no XP, Primes or achievements. That stays true in the shared arcade.
