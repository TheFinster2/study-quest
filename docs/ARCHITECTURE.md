# StudyQuest — architecture and the porting contract

StudyQuest merges seven stand-alone HSC study games into one offline PWA:

| id | Subject | Source repo | Namespace | Currency |
|---|---|---|---|---|
| `chem` | Chemistry | Study-App (MoleQuest) | `CHEM` | Moles 🪙 |
| `phys` | Physics | Physics-Study-App (Newton's Notebook) | `PHYS` | Joules ⚡ |
| `bio`  | Biology | Biology-App (Biosphere) | `BIO` | Biocredits ◉ |
| `econ` | Economics | Economics-App (Equilibrium) | `ECON` | Dollars 💲 |
| `eng`  | English Advanced | English-Study-app (Close Reading) | `EN` | Marks ✒️ |
| `mstd` | Maths Standard | Maths-Study-App (NumberCrunch) | `MS` (was `MQ`) | Credits 💳 |
| `madv` | Maths Advanced + Ext 1 | Maths-advanced-app (MathQuest) | `MA` (was `MQ`) | Primes 🔢 |

No build step, no dependencies, classic `<script>` tags (it must run from `file://`),
one localStorage key, a cache-first service worker.

## The shape

```
index.html            the shell: topbar, #view, navbar, modal root, toasts
css/core.css          shared design system (tokens + components)
css/themes.css        every theme, keyed [data-theme="<id>"], all on core tokens
css/hub.css           hub + shop + settings screens
css/tools.css         the shared tool tray
css/arcade.css        the shared arcade
js/sq/                the shared core — namespace SQ
  util.js             SQ.U    pure helpers (el, $, dayKey, hash, seededRandom, deepMerge…)
  audio.js            SQ.Sound  shared synth + THE AudioContext (SQ.Sound.shared())
  fx.js               SQ.FX   the one particle canvas (confetti, pop, burst, sparks, rise, floatText, shake)
  economy.js          SQ.Economy  every general-economy number
  subjects.js         SQ.Subjects registry (metadata only; no subject code)
  store.js            SQ.Store  the one save file + subject slots
  overall.js          SQ.Overall  overall level, Stars, global streak/daily/weekly/achievements
  subject-state.js    SQ.SubjectState.create(id, cfg) → a subject's State
  ui.js               SQ.UI   router, header, nav, modals, toasts, award(), gameShell(), results(); SQ.UI.bind(id)
  loader.js           SQ.Loader  loads subjects/<id>/manifest.js then its files
  expr.js             SQ.Expr  safe expression evaluator for the calculator (no eval)
  tools.js            SQ.Tools  calculator + reference sheet + working pad, mounted by gameShell
  migrate.js          SQ.Migrate  imports the old stand-alone apps' saves
js/hub/               app-level screens (home, subjects, progress, general shop, settings, profile, dev)
js/arcade/            the shared arcade (engines + subject skins)
subjects/<id>/        EVERYTHING subject-specific
  manifest.js         SQ.Subjects.manifest(id, { css, scripts, boot, importLegacy })
  core/ data/ games/ screens/ css/   (the ported subject app)
tests/                node + Playwright suites (tests/run.js)
```

## Rules for a subject port

**Write only inside `subjects/<id>/` and `tests/subjects/<id>/`.** The shared core is
owned centrally; seven ports editing it in parallel would collide. If the core is
missing something or is wrong, work around it inside your subject if you can, and
write the request (what, why, the exact API you want) in
`subjects/<id>/CORE-REQUESTS.md`.

### 1. Namespace and file layout
- Keep your subject's own namespace (`CHEM`, `PHYS`, …; the maths apps become `MS` and
  `MA` — rename every `MQ.` / `window.MQ` / `MQ =` in the ported files).
- Keep your subject's **own** util (`X.U`), bank, generators, expression parser, units,
  drawing, figure and notation code, sound vocabulary. These are content-bearing and
  tests were written against them.
- Delete (do not port) your subject's router, header code, toast/modal code, service
  worker, save/persistence code, arcade, and top-level `app.js` boot — the core does
  those. Your `manifest.js` `boot()` registers your routes instead.

### 2. State → `SQ.SubjectState.create(id, cfg)`
```js
X.State = SQ.SubjectState.create("chem", {
  defaults: () => ({ stats: {...subject counters}, modules: {}, ...subject-only fields }),
  startCoins: 100,
  levelTitles: [...60], xpCurve: n => Math.round(115 * Math.pow(n, 1.5)),  // KEEP your app's curve
  dailyModes: { rapid: 14, drill: 12, ... },   // mode id → target, for the subject daily
  dailyReward: { coins: 120, xp: 150 },
  questPool: [{ id, stat, target, xp, coins, icon, name, desc }, ...],
  achievements: () => X.DATA.achievements,     // [{id, name, icon, desc, reward, check(stats)}]
  achievementStats: (data, base) => Object.assign(base, {...extra}),
  cards: () => X.DATA.flashcards,              // [{id,...}] for dueCards()/leeches()
  statFor: (key, data) => undefined | number,  // custom weekly-quest stats
  migrate: data => {}                          // one-way fixes on the slot at load
});
Object.assign(X.State, { ...your subject-specific methods });
```
The returned object implements the Chemistry-lineage State API: `data`, `save`,
`flush`, `emit`, `onChange`, `xpNeeded`, `levelTitle`, `addXP`, `addCoins`, `spendCoins`,
`MAX_LEVEL`, `difficulty`, `setDifficulty`, `DIFFICULTIES`, `xpMultiplier`, `canPrestige`,
`doPrestige`, `masteryTier`, `touchStreak`, `streakBonus`, `recordAnswer(mod, ok, qid, topic?, meta?)`,
`recordSkill`, `noteStreak`, `bump`, `markMode`, `recordScore`, `markBoss`, `toggleBookmark`,
`isBookmarked`, `mastery`, `topicMastery`, `overallAccuracy`, `weakTopics`, `usePowerup`,
`grantPowerup`, `powerupBanned`, `ownsTheme`, `ownsAvatar`, `cardState`, `cardXpEligible`,
`markCardXp`, `reviewCard(id, true|false|"again"|"hard"|"good"|"easy")`, `dueCards(filter?)`,
`isLeech`, `leeches`, `cardsMastered`, `tagHidden`, `setTagHidden`, `tagOn`, `hiddenTags`,
`achievementStats`, `checkAchievements`, `daily`, `dailySpec`, `progressDaily`, `claimDaily`,
`weekly`, `weeklyQuests`, `claimQuest`, `reset`.

The slot (`X.State.data`) is stored at `save.subjects[id]`. These are **shared** and are
linked onto it as non-enumerable accessors, so old code keeps working but they are
never saved twice: `data.profile`, `data.inventory` (power-ups), `data.streak` (day
streak), and `data.settings.sound|volume|motion|textScale|haptics`.
**Owned themes/avatars are global**: use `S.ownsTheme/ownsAvatar` and
`SQ.Store.data.owned`, never `data.owned`.

Biology/Economics and Maths Standard had a different State API: map their fields onto
this one (e.g. Bio `cards` → `srs`, `missed` → `mistakes`, level derived from xp →
`level`/`xpIntoLevel`) and rewrite their call sites. Keep any extra ledgers you need
(`shortLog`, `genSeeds`, `freeText`, `drafts`…) in `defaults()`.

### 3. UI → `SQ.UI.bind(id, cfg)`
```js
X.UI = SQ.UI.bind("chem", {
  nav: [{ key: "home", label: "Home" }, { key: "play", icon: "🎮", label: "Play" }, ...],  // ≤ 5
  navMap: { game: "play", boss: "play", deck: "study" },   // route name → nav key
  coinRate: 0.75,               // your app's coin payout rate (Chem/Phys/Bio/Econ 0.75, Maths/Eng 0.6)
  tools: { calc: true, sheet: true, pad: true },            // tool-tray defaults for gameShell
  extend: { ...extra UI helpers your modes call, e.g. English's timeBudget/rushFloor }
});
```
Bound API: `route(name, fn(view, args))`, `go(path)` (subject-relative: `"/play"` →
`#/s/chem/play`; `"/arcade"`, `"/settings"`, `"/subjects"` go to the app), `href(path)`,
`award(opts)`, `payExtra(xp, label)`, `gameShell(title, opts)`, `results(opts)`, `toast`,
`modal(content, {sticky, center, wide, stack, onClose})`, `closeModal`, `confirmDialog`,
`chip`, `rank`, `onLeave`, `pulse`, `syncHeader`, `readFloor(text)`, `formulaPenalty`,
`MIN_READ_MS`, `MIN_BONUS_ACCURACY`.

**award(opts)**: `{ xp, bonus, accuracy, answered, coins, at, silent, raw, boost }`.
Pass per-answer XP already netted by the mode (wrong answers subtracted, rushed answers
unpaid — those gates stay in your modes). The core applies: bonus withheld below 50 %
accuracy or under 5 answers, difficulty × prestige × `boost` capped at ×4, the tool-tray
crutch, your coin rate, Stars (15 % of XP), the overall level, level-up and achievement
toasts. Returns `{ xp, coins, stars, levelsGained, newLevel, overall }` — report `got.xp`
on your results screen, not what you computed.

**results(opts)**: `{ title, correct, total, xp, coins, stars, extraStats, newBest, onAgain,
onReview, bonus, backTo, blurb }`. Prefer it over a hand-built results modal.

Routes you should provide: `home` (subject dashboard: daily, weekly, due cards, weak
topics, continue), `play` (mode list), `game/<mode>/…`, `study` (flashcards, review
decks, reference), `progress` (mastery, achievements, prestige/Ascension), `shop`
(see below). Anything else your app had (atlas, vault, draft desk, formulas…) too.

### 4. Tools → `SQ.Tools`
Delete your app's own calculator/tool tray/toolbelt/sheet UI. Register your reference
sheet once in `boot()`:
```js
SQ.Tools.registerSheet("phys", {
  title: "HSC Physics data sheet",
  render: html => X.U.math(html),          // optional: your notation renderer
  constants: [{ id, name, symbol, value, unit, free: true }],   // calc knows these by `id`
  sections: [{ id, title, items: [{ id, name, body /* html or tex */, free: true|false, note }] }]
});
```
`free: true` = printed on the NESA sheet / exam reference (free mid-run). `free: false` =
not given in the exam: revealing it costs −10 % XP for the run, latched, capped at −30 %.
`gameShell` mounts the tray; pass `tools:false` for unscored/reference screens. The
calculator's "→ Answer" key fills the element with class `js-answer` (or the last focused
input in `#view`); its question mirror copies `.qtext`. Mark your answer inputs
`class="… js-answer"` and use `inputmode="none"` where your own keypad drives them.

### 5. Shop → `SQ.Shop.subject(view, id, catalog)`
Your `shop` route calls the shared renderer with your catalog:
```js
SQ.Shop.subject(view, "chem", {
  themes:  [{ id: "chem-lab", name, price, level, swatch: ["#..", "#.."] }],
  avatars: [{ emoji: "⚗️", price, level }],
  crates:  [{ id, icon, name, price, level, rolls, desc }],   // paid in subject coins → power-ups
  extras:  [{ id, icon, name, desc, price, level, owned(), buy() }] // anything subject-specific
});
```
It adds difficulty selection, the arcade skins for your subject, the Exchange (coins →
Stars) and a link to the general shop. Power-ups are sold in the **general** shop (Stars);
your crates are the way your subject coins turn into power-ups.

### 6. CSS
- Your stylesheet(s) under `subjects/<id>/css/`. **Every rule** must be scoped under
  `html[data-subject="<id>"]` — stylesheets stay loaded after the student leaves a
  subject, so an unscoped rule leaks into the other six. Exceptions: `@keyframes`
  (prefix their names with your id) and theme definitions.
- Drop rules that duplicate `css/core.css` (topbar, navbar, modal, toast, btn, chip,
  card, gshell, choice, qcard, feedback, results, toolbelt, arcade…) unless your version
  differs in a way your modes need.
- **Themes**: define your app's themes as `[data-theme="<id>-<name>"]{ …core tokens… }`
  in `subjects/<id>/css/themes.css` (unscoped — owned themes can dress any subject). index.html loads every subject's themes.css at boot, so that file must contain ONLY theme blocks — nothing else, and it must exist.
  Apps whose tokens differ (Bio/Econ `--bg`, `--ink-2`…; Maths Std `--panel`, `--dim`…)
  convert their themes to core tokens and alias their own names under the subject scope:
  `html[data-subject="bio"]{ --bg: var(--bg-0); --ink-2: var(--ink-dim); … }`.

### 7. Upgrades every subject gets (use the most advanced version)
- Four difficulties (Gentle/Standard/Hard/Nightmare) — `S.DIFFICULTIES`; timers scale
  by `S.difficulty().time`; boss damage by `.boss`; banned power-ups `.bans`.
- Prestige (Ascension) at level 60 — `S.canPrestige/doPrestige`, shown on Progress.
- A subject daily challenge and three weekly quests — `S.daily…`, `S.weeklyQuests…`.
- Graded flashcard review (again/hard/good/easy) and named leeches (≥ 4 lapses).
- HP-duel **bosses** with a gimmick each and a Final Paper (Chem/Maths/English style);
  Biology and Economics replace their 20-question module bosses with these.
- Coverage/hide toggles for content not studied (`S.setTagHidden`); never change payouts.
- The shared read floor for MCQ answers: `UI.readFloor(stemText)` ms.
- Answer-length bias check and near-duplicate check in your validate test.
- Keyboard play (1–4 / A–D, Enter, Esc), 44 px tap targets, no overflow at 360 px.

### 8. Legacy import
`manifest.importLegacy(oldSave)` receives the parsed stand-alone save (`legacyKey` in
`js/sq/subjects.js`) and returns
`{ slot, inventory?, themes?, avatars?, profile? }` — `slot` in your new slot shape
(xp, level, xpIntoLevel, coins, prestige, stats, srs, mistakes, achievements…).
Rename power-up ids to the shared set: `fifty skip freeze shield double insight revive
reread hint` (English `adrenaline` → `double`; everyone else's boss-revive
`adrenaline` → `revive`; Chem `catalyst`/Maths `boost`/Bio `catalyst`/Econ `multiplier` → `double`;
Bio `homeostasis`/Econ `buffer` → `shield`; Bio `fieldnote`/Econ `research` → `insight`;
Bio `coldstorage`/Econ `extension` → `freeze`; Bio `halve`/Econ `narrow` → `fifty`; `pass` → `skip`).
Prefix theme ids with `<id>-`.

### 9. Tests
Port your app's content validation to `tests/subjects/<id>/validate.js` (plain node,
loading your data files in a `vm` sandbox — see `tests/lib/vm.js`). Add a browser smoke
test `tests/subjects/<id>/smoke.js` using `tests/lib/browser.js` that opens every one of
your routes and modes at 390 and 360 px and fails on a console error or horizontal
overflow. Port your exploit/honest bot checks where your app had them. Every test runs
standalone with `node tests/…`.
