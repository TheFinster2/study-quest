# English (Close Reading) — arcade skin notes

The stand-alone app had three arcade games; they are not ported (the app's arcade owns
games now). Their look, for turning into English skins:

**Palette / feel**: ink on paper. Dark paper `#141210`, parchment accent `#c8b48a`, red
pen `#e0574a`, highlighter amber `#e0b04a`, ruled lines every 30 px. Serif labels
(Iowan Old Style / Palatino / Georgia). Particles are pen strokes (`FX.marked`) and
falling paper, never sparks.

**Match-3 — "Letter Crush"** (8×8, gravity, cascades, three specials that combine).
- Tiles are **letters** from a target word — SATIRE, ARTIST, STRAIT, … (six letters per
  board, always an anagram word available). Six tile colours, one per letter, drawn as
  rounded paper squares with the capital letter centred in serif.
- A "word order" strip above the board shows the word being spelled; clearing a wanted
  letter fills a slot.
- Specials: **Row/column Rule** (a ruled line beam across the row/col), **Blot** (ink
  splash — 3×3 blast, shockwave ring), **Inkblot** (spins through every tile colour;
  clears a whole letter across the board). Callouts: "Cascade!", "Well read!".

**Runner — "Margin Runner"** (a nib running down the margin of a ruled page).
- Player: a fountain-pen **nib**. Ground: the ruled margin line.
- Obstacles: **footnote** (small raised block, 40 px), **stack** of footnotes (78 px,
  needs a held jump), **staples** pair, a hanging **strike-through bar** (duck under),
  `gauntlet` combos. Chapter labels ("Foolscap", "Quarto") as the background changes.
- Pickups: **ink drops** laid along the ideal jump arc (the scoring line ≠ the safe line);
  near-miss bonus under the duck clearance.

**2048 — "Word Tower"** (4×4 merge up a literary ladder):
LETTER → WORD → PHRASE → CLAUSE → LINE → STANZA → PARAGRAPH → CHAPTER → BOOK →
OEUVRE → CANON. Tiles are paper cards with the word in small caps; colours by rung:
`#8d8478 #a08ab8 #8ab4d8 #7fc98a #c8b48a #e0b04a …` (grey → violet → blue → green →
parchment → amber → red pen), see the source `js/games/arcade-wordtower.js`.
