# The shared arcade

One engine per genre, each dressed by subject **skins**. The arcade lives at `#/arcade` (the lobby) and `#/arcade/<game>` (play), and is built from these files:

| File | What it is |
|---|---|
| `js/arcade/arcade.js` | `SQ.Arcade`: the registry, skins/ownership, the clock and tickets, gates, scores, the lobby and the play shell |
| `js/arcade/skins.js` | every skin: one free default per game plus the subject skins |
| `js/arcade/game-crush.js` | match-3 (Chemistry's power tiles + chaining, English's persistent-tile board and word orders) |
| `js/arcade/game-runner.js` | endless runner (English's Margin Runner, now on a fixed 60 Hz timestep) |
| `js/arcade/game-merge.js` | 2048 with three undos (Chemistry) |
| `js/arcade/game-pairs.js` | memory pairs against a level clock (Biology / Economics) |
| `js/arcade/game-phagocyte.js` | drag to engulf, 3 lives (Biology) |
| `js/arcade/game-catch.js` | catch the falling good ones, 3 lives (Economics' Bargain Hunt) |
| `css/arcade.css` | lobby, shell and engine styles |
| `tests/arcade/arcade.js` | the suite (`node tests/arcade/arcade.js`) |

## Rules (every source app had them)

- **The arcade pays nothing.** It gives no XP, Stars, coins or achievements. The only thing it keeps is `data.arcade.scores[game]`, plus `played[game]` and `stats.arcadeSeconds` for display. Nothing under `js/arcade/` calls `award`, `payExtra`, `addXP`, `addStars`, `addCoins`, `spend*`, `checkAchievements`, `SQ.Overall` or a subject `State`. The suite greps the directory for these calls and also plays every game to prove the ledgers do not move.
- **Time.** `data.arcade.seconds` is shared by every game. `data.arcade.allDayUntil` is local midnight, and while `now < allDayUntil` no seconds are burnt. The general shop charges Stars and then calls `SQ.Arcade.grantTicket(ticket)` with a ticket from `SQ.Economy.TICKETS`.
- **The clock only burns while a game is on screen.** The page must also be visible, with no modal open and the game not over. It runs from the play shell's animation frame on real elapsed time, clamped per frame. Leaving the route tears everything down through `SQ.UI.onLeave`. When the meter reaches 0, a sticky **"Ticket expired"** modal offers `#/shop/arcade`. A game refuses to start on an empty meter and offers the shop.
- **Gates.** The arcade opens at overall level `SQ.Economy.ARCADE_UNLOCK_LEVEL` (3). The per-game overall-level gates are: crush, merge and pairs at 3; runner and catch at 5; phagocyte at 7.
- Phones get big hold-to-act pads (runner Jump/Duck, catch ◀ ▶), swipe and drag. Desktops get keyboard controls in every game. Reduced motion (`SQ.FX.isReduced()`) turns off decoration but keeps every game fully playable. Sound effects go through `SQ.Sound`.

## API

```js
SQ.Arcade.register({ id, name, icon, colour, blurb, how, level, start(stage, session) })
  // start returns { destroy, pause?, resume?, state? }
session: { game, skin, data /* skin.data */, reduced, sound(name, arg),
           setScore, addScore, score, best, isOver(), running(),
           loop(fn(dtSeconds))   // runs only while running
           later(fn, ms), listen(target, ev, fn, opts)   // auto-cleaned on teardown
           gameOver(detail, [[label, value]…]) }

SQ.Arcade.defineSkins([{ id, game, subject|null, name, title, icon, desc, price, level, data }])
SQ.Arcade.skinsFor(subjectId) → [{ id, game, name, icon, desc, price, level }]   // for subject shops
SQ.Arcade.skinFor(game)   // equipped-and-owned, else the default
SQ.Arcade.equip(game, skinId), ownsSkin(id), ownedSkins(game), allSkins(game), defaultSkin(game)
SQ.Arcade.grantTicket(ticket), secondsLeft(), allDay(), hasTime(), timeLabel()
SQ.Arcade.unlocked(), gameUnlocked(def), best(game), recordScore(game, n)
SQ.Arcade.current()       // the running game for tests: { game, skin, running, over, score, state }
SQ.Arcade.games.runner.{ state(), geometry, buildAt(patternId, speed) }   // test seams
```

Skins are bought in the subject shops (`SQ.Shop.subject`) for that subject's coins, gated by **subject** level, stored in `data.owned.skins` and equipped in `data.arcade.skin[game]`. The lobby's skin picker lists owned skins only. A skin changes what the engine draws and what things are called, never the rules or the scoring, so high scores stay comparable across skins.

## Skins

| Game (default) | chem | phys | bio | econ | eng | madv | mstd |
|---|---|---|---|---|---|---|---|
| Crush (Gems) | Ion Crush | Particle Lab | Organelle Crush | Ticker Crush | Letter Crush (word orders) | Prime Crush (primes ×2) | Prime Crush Std |
| Runner (Night Run) | Mole Runner | Photon Runner | Cell Run | Market Run | Margin Runner | Vector Runner | Budget Runner |
| Merge (Numbers) | Isotope 2048 H→Ar | Nuclide 2048 ¹H→²⁰⁸Pb | — | — | Word Tower LETTER→CANON | Power Tower 2ⁿ | Savings Tower |
| Pairs (Shapes) | Element Match | Quantum Pairs | Chromosome Match | Ticker Match | Folio Pairs | Symbol Pairs | Budget Pairs |
| Phagocyte (Blob) | — | Black Hole | Phagocyte | — | — | — | — |
| Catch (Star Catch) | — | — | — | Bargain Hunt | — | — | Budget Basket |

Prices, in subject coins at a subject-level gate:

| Game | Price | Subject level |
|---|---|---|
| Pairs | 300 | 1 |
| Crush | 450 | 2 |
| Merge | 600 | 3 |
| Runner | 900 | 5 |
| Phagocyte / Catch | 1200 | 8 |

## Adding a skin

Add an entry to `js/arcade/skins.js` whose `data` matches that engine's shape:

| Engine | `data` shape |
|---|---|
| crush | `tiles[6]{face, colour, bonus?}`, `small?`, `words?` |
| runner | `runner` shape, `glyphs`, `labels`, `chapters[6]`, `death` |
| merge | `ladder[{sym, name?, colour}]`, `goal`, `small?` |
| pairs | `symbols[≥8]`, `text?` |
| phagocyte | `good`, `bad`, `player`, `blurb` |
| catch | `basket`, `good[]`, `bad[]`, `gold`, `labels` |

The suite launches every skin.
