# Maths Standard — arcade skins

The shared arcade (js/arcade/skins.js) already carries Maths Standard skins for
crush, runner, merge, pairs and catch, and they match NumberCrunch's three games.
Nothing further is needed; the differences from the stand-alone games, for the
arcade author's judgement:

| NumberCrunch game | What it looked like | Existing skin | Notes |
|---|---|---|---|
| 💠 Prime Crush (8×8 match-3) | Number tiles 2, 3, 5, 7, 11, 13 on `--panel2`, accent-tinted; a **×** wild tile that clears its whole row | `crush/mstd` "Prime Crush Std" — same six primes | The × row-clearing wild tile is not in the skin (engine feature, if the shared engine has a wild/special tile, use the glyph `×`). |
| 🏃 Budget Runner (endless runner) | Canvas runner; low obstacle 💸 (expenses, jump), high obstacle 📉 (overheads, duck), pickups = payslips; "Overdrawn" on death | `runner/mstd` "Budget Runner" — same glyphs and labels | Matches. |
| 🔢 Power Tower 2048 | 4×4, plain powers of two, tiles tinted by `color-mix(accent, panel2)` with alpha rising 0.12 → 1.0 from 2 to 2048 | `merge/mstd` "Savings Tower" — $2 … $2048 ladder | Original labels were bare numbers (2, 4, … 2048); the $ ladder is a reasonable re-theme. |

The stand-alone arcade was rented with Credits (5/15/30-minute tickets at
150/380/650). In StudyQuest arcade time is the app's, paid in Stars; the
subject shop's Exchange converts Credits → Stars.
