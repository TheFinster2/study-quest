/* Settings, achievements, the profile sheet, and the first-run modal.
   ============================================================================
   Three things here are load-bearing rather than decorative:

     • the Layer C download flow (§6.5.5). The 23 MB model is NOT fetched on first load.
       It sits behind an explicit button with the size stated, resumes if interrupted,
       and lives in its own cache bucket so shipping a new app version never re-downloads
       it. Layer C degrades to "unavailable" — a first-class verdict — and never blocks.
     • Force refresh (addendum E6). When a service worker serves a stale shell the
       student has no way out, because the thing that would tell them to reload IS the
       stale thing. So: unregister every worker, delete every app cache — keeping the
       model bucket — and reload with a cache-busting query string.
     • the first-run modal, which states the marking boundary honestly (§0.4) before the
       student has invested anything in the app.
   ============================================================================ */
window.EN = window.EN || {};
EN.Screens = EN.Screens || {};

EN.Screens.misc = (function () {
  const U = EN.U, S = EN.State, UI = EN.UI, M = EN.Mark;

  /* ── options (the subject's own settings) ──────────────────
     Route `options`, because /settings is the app's. Sound, motion, text size, export,
     import, reset-everything and Force refresh all live in the app's Settings now;
     difficulty is in the English shop. What is left is what only English has. */
  function settings(view) {
    view.appendChild(U.el("h1", { text: "⚙️ English options" }));
    view.appendChild(U.el("p", { class: "tiny muted",
      html: "Sound, motion, text size and your save file are in the app's <a href=\"#/settings\">Settings</a>. " +
            "Difficulty is in the <a href=\"" + UI.href("/shop") + "\">English shop</a>." }));

    /* ── the manifest ── */
    view.appendChild(U.el("h2", { text: "Your texts" }));
    view.appendChild(U.el("div", { class: "card" }, [
      U.el("div", { class: "row" }, [
        U.el("span", { style: "font-size:20px", text: "📚" }),
        U.el("div", { style: "flex:1; min-width:0" }, [
          U.el("b", { text: activeSummary() }),
          U.el("div", { class: "tiny muted",
            text: "Everything the app drills follows this. A text with a poem selection — Donne is fifty-four poems — can be narrowed to the ones your class set." })
        ]),
        U.el("button", { class: "btn btn-primary btn-sm", text: "Change",
                         on: { click: () => UI.go("/texts") } })
      ])
    ]));

    /* ── Layer C ── */
    view.appendChild(U.el("h2", { text: "Sentence marking" }));
    view.appendChild(layerCPanel());

    /* ── this subject's share of the save ── */
    view.appendChild(U.el("h2", { text: "Your English save" }));
    view.appendChild(U.el("div", { class: "card" }, [
      U.el("p", { class: "tiny muted",
        text: "Everything lives in this browser's storage — no account, no server, nothing leaves the device. The app's Settings exports the whole save, drafts included." }),
      storageRow(),
      S.data.dev && S.data.dev.touched
        ? U.el("div", { class: "notice notice-bad", style: "margin-top:10px" }, [
            U.el("b", { text: "Modified with the dev tools. " }),
            U.el("span", { text: S.data.dev.actions + " action" +
              (S.data.dev.actions === 1 ? "" : "s") + ", last " +
              new Date(S.data.dev.touched).toLocaleDateString() +
              ". Levels, Marks, high scores and achievements in this save are not evidence " +
              "of anything." })
          ])
        : null,
      U.el("div", { class: "row", style: "margin-top:10px; flex-wrap:wrap" }, [
        U.el("button", { class: "btn btn-ghost btn-sm", text: "📄 Draft Desk", on: { click: () => UI.go("/draft") } }),
        U.el("div", { class: "spacer" }),
        U.el("button", { class: "btn btn-danger btn-sm", text: "Reset English", on: { click: resetAll } })
      ])
    ]));

    view.appendChild(U.el("h2", { text: "About" }));
    view.appendChild(U.el("div", { class: "card" }, [
      U.el("div", { class: "kv" }, [
        U.el("span", { text: "Questions" }), U.el("b", { text: String(EN.Bank.all().length) })
      ]),
      U.el("div", { class: "kv" }, [
        U.el("span", { text: "Quotes" }), U.el("b", { text: String(EN.Bank.allQuotes().length) })
      ]),
      U.el("div", { class: "row", style: "margin-top:8px" }, [
        U.el("button", { class: "btn btn-ghost btn-sm", text: "🏅 Achievements", on: { click: () => UI.go("/achievements") } }),
        U.el("div", { class: "spacer" }),
        U.el("button", { class: "btn btn-ghost btn-sm", text: "What this app can't do",
                         on: { click: () => boundaryModal(false) } })
      ])
    ]));

    view.appendChild(U.el("p", { class: "tiny muted", style: "text-align:center; margin:18px 0 30px" },
      [U.el("span", { text: "Close Reading — extracts are quoted for study and attributed to their composers. This app trains the moves and marks your sentences. Your teacher marks the essay." })]));
  }

  function activeSummary() {
    const t = EN.Bank.activeTexts();
    if (!t.length) return "No texts chosen yet";
    return t.length + " text" + (t.length === 1 ? "" : "s") + " · " +
           EN.Bank.quotes().length + " quotes in play";
  }

  /**
   * How much room the save is taking, and whether writes are currently failing.
   *
   * A full localStorage means every write silently fails and the student keeps earning
   * progress that is never stored. State.write() now says so in a toast the first time it
   * happens; this is the place they can check afterwards, and the place that says what to
   * do — drafts are the only part of the save large enough to be worth deleting.
   */

  function storageRow() {
    const bytes = S.saveSize();
    const kb = Math.round(bytes / 1024);
    const drafts = (S.data.drafts || []).length;
    const draftKb = Math.round(JSON.stringify(S.data.drafts || []).length / 1024);
    const failing = S.storageFailing();

    const row = U.el("div", { class: failing ? "notice notice-bad" : "kv",
                              style: "margin-top:10px" });
    if (failing) {
      row.appendChild(U.el("b", { text: "Your progress is not being saved. " }));
      row.appendChild(U.el("span", {
        text: "This browser refused the last write, which usually means its storage for " +
              "the app is full. Export from the app's Settings while you still can, then delete some drafts — " +
              "they are " + draftKb + " KB of the " + kb + " KB total." }));
      return row;
    }
    row.appendChild(U.el("span", { text: "Save size" }));
    row.appendChild(U.el("b", { text: kb + " KB" + (drafts ? "  ·  " + drafts + " drafts, " + draftKb + " KB" : "") }));
    return row;
  }

  /* ── Layer C download panel ───────────────────────────────── */
  function layerCPanel() {
    const box = U.el("div", { class: "card lc-panel" });
    const mb = (M.MODEL_BYTES / 1e6).toFixed(0);

    box.appendChild(U.el("p", { class: "tiny muted",
      text: "Typed sentences are marked in three layers. Structural checks and single-word matching work everywhere and always have. Meaning-level marking needs a " + mb + " MB language model, which runs entirely on this device — it is never sent anywhere, and there is no account and no API key." }));

    const status = U.el("div", { class: "lc-status" });
    box.appendChild(status);
    /* Announced, unlike the decorative mastery bars: this is a 23 MB download and its
       progress is the whole reason the bar exists. `lc-prog` beside it carries the MB
       figure as text, and aria-valuetext repeats it for a reader. */
    const bar = U.el("div", { class: "bar", hidden: true, role: "progressbar",
                              "aria-label": "Model download",
                              "aria-valuemin": "0", "aria-valuemax": "100", "aria-valuenow": "0" },
                     [U.el("i", { style: "width:0%" })]);
    box.appendChild(bar);
    const actions = U.el("div", { class: "row", style: "margin-top:10px; flex-wrap:wrap" });
    box.appendChild(actions);

    function paint(state) {
      status.innerHTML = "";
      actions.innerHTML = "";

      if (state === "blocked") {
        const why = M.blockedReason();
        const msg = why === "file"
          ? "Opened as a local file, so the browser will not let the model load. Structural and word-level marking still work; everything else in the app is unaffected."
          : why === "wasm"
          ? "This browser has no WebAssembly, so meaning-level marking cannot run here."
          : "This browser is missing the Cache API, so the model cannot be stored offline.";
        status.appendChild(U.el("div", { class: "chip" , text: "Unavailable" }));
        status.appendChild(U.el("div", { class: "tiny muted", text: msg }));
        status.appendChild(U.el("div", { class: "tiny muted",
          text: "Prompts still show model answers and near-misses. They just pay nothing." }));
        return;
      }

      if (state === "ready") {
        status.appendChild(U.el("div", { class: "chip on", text: "✓ Downloaded and ready" }));
        status.appendChild(U.el("div", { class: "tiny muted",
          text: "Cached offline. Sentence marking pays a small capped reward, once per prompt per day, and always shows the model answers — a similarity score is not a mark." }));
        actions.appendChild(U.el("button", { class: "btn btn-ghost btn-sm", text: "Test it",
                                             on: { click: testModel } }));
        actions.appendChild(U.el("button", { class: "btn btn-ghost btn-sm", text: "Delete the model",
                                             on: { click: deleteModel } }));
        return;
      }

      if (state === "downloading") {
        status.appendChild(U.el("div", { class: "chip", text: "Downloading…" }));
        status.appendChild(U.el("div", { class: "tiny muted lc-prog", text: "Starting…" }));
        bar.hidden = false;
        return;
      }

      status.appendChild(U.el("div", { class: "chip", text: "Not downloaded" }));
      status.appendChild(U.el("div", { class: "tiny muted",
        text: "One-off " + mb + " MB download over Wi-Fi. After that it works offline forever. Skip it and the three sentence modes still run — they show model answers instead of a verdict." }));
      actions.appendChild(U.el("button", { class: "btn btn-primary btn-sm",
        text: "⬇ Download the model (" + mb + " MB)", on: { click: start } }));
    }

    function start() {
      paint("downloading");
      const fill = bar.querySelector("i");
      const label = box.querySelector(".lc-prog");
      M.downloadModel(p => {
        const pctDone = U.clamp((p.received / p.total) * 100, 0, 100);
        fill.style.width = pctDone.toFixed(1) + "%";
        bar.setAttribute("aria-valuenow", pctDone.toFixed(0));
        bar.setAttribute("aria-valuetext",
          (p.received / 1e6).toFixed(0) + " of " + (p.total / 1e6).toFixed(0) + " MB");
        if (label) {
          label.textContent = (p.received / 1e6).toFixed(1) + " / " + (p.total / 1e6).toFixed(0) +
                              " MB" + (p.file ? " · " + p.file.split("/").pop() : "");
        }
      }).then(ok => {
        bar.hidden = true;
        if (ok) {
          S.data.settings.layerC = true;
          S.save();
          EN.Sound.rankUp();
          UI.toast({ icon: "🧠", kind: "good", text: "<b>Model ready.</b> Sentence marking is on." });
          /* Warm the runtime now rather than making the student wait mid-answer. */
          M.load();
          paint("ready");
        } else {
          const p = M.downloadProgress();
          UI.toast({ icon: "⚠", kind: "bad",
            text: "Download failed — " + (p.error || "unknown error") + ". Nothing else is affected." });
          paint("idle");
        }
      });
    }

    function testModel() {
      UI.toast({ icon: "🧠", text: "Loading the model…" });
      M.load().then(ok => {
        if (!ok) return UI.toast({ icon: "⚠", kind: "bad", text: "The model would not load." });
        return M.check("The play makes rebellion look attractive and then shows its cost.", {
          answers: ["Rebellion is presented as appealing before the text exposes its price."],
          nearMiss: ["The play is about a rebellion in England."],
          domain: "test"
        }).then(r => {
          UI.modal(U.el("div", {}, [
            U.el("h2", { text: "Layer C is working" }),
            U.el("p", { class: "tiny muted",
              text: "A test sentence was marked against a model answer entirely on this device." }),
            U.el("div", { class: "kv" }, [U.el("span", { text: "Verdict" }), U.el("b", { text: r.verdict })]),
            U.el("div", { class: "kv" }, [U.el("span", { text: "Layer" }), U.el("b", { text: r.layer })]),
            U.el("p", { class: "tiny muted", style: "margin-top:10px",
              text: "You will never see the underlying number while you play. A verdict is three words and then the model answers." }),
            U.el("button", { class: "btn btn-primary btn-block", style: "margin-top:12px", text: "Good",
                             on: { click: UI.closeModal } })
          ]));
        });
      });
    }

    function deleteModel() {
      UI.confirmDialog("Delete the marking model?",
        "Frees about " + mb + " MB. The three sentence modes keep working — they will show model answers instead of marking yours, and they will pay nothing. You can download it again any time.",
        () => {
          caches.delete(M.MODEL_CACHE).then(() => {
            S.data.settings.layerC = false;
            S.save();
            UI.toast({ icon: "🗑", text: "Model deleted." });
            UI.handleRoute();
          });
        }, "Delete");
    }

    if (!M.available()) paint("blocked");
    else {
      const p = M.downloadProgress();
      if (p.state === "downloading") paint("downloading");
      else {
        paint("idle");
        M.isDownloaded().then(has => { if (has) paint("ready"); });
      }
    }
    return box;
  }

  /* Resets ENGLISH only — the app's Settings resets everything. Drafts go too, which
     is why it asks twice. */
  function resetAll() {
    UI.confirmDialog("Reset English?",
      "Deletes your English level, Marks, Vault progress, achievements <b>and every draft</b>. Other subjects, Stars and power-ups are untouched. Export from Settings first if there is anything you want.",
      () => {
        UI.confirmDialog("Really reset?", "Last chance. Every English draft goes too.",
          () => { S.reset(); UI.go("/home"); }, "Delete it all", { danger: true });
      }, "Reset", { danger: true });
  }

  /* ── achievements ─────────────────────────────────────────── */
  function achievements(view) {
    const owned = S.data.achievements;
    const all = EN.DATA.achievements;
    const got = all.filter(a => owned[a.id]);

    view.appendChild(U.el("h1", { text: "🏅 Achievements" }));
    view.appendChild(U.el("div", { class: "grid g3" }, [
      tile(got.length + " / " + all.length, "Unlocked"),
      tile(U.pct(got.length, all.length) + "%", "Complete"),
      tile(got.reduce((n, a) => n + a.reward, 0), "✒️ earned")
    ]));
    view.appendChild(U.el("div", { class: "bar", "aria-hidden": "true", style: "margin-top:12px" },
      [U.el("i", { style: "width:" + U.pct(got.length, all.length) + "%" })]));

    let shown = "all";
    const filters = U.el("div", { class: "row", style: "margin-top:14px; flex-wrap:wrap" });
    const list = U.el("div", { class: "grid g2", style: "margin-top:10px" });
    [["all", "All"], ["done", "Unlocked"], ["todo", "Locked"]].forEach(([id, label]) => {
      const b = U.el("button", { class: "btn btn-ghost btn-sm" + (id === shown ? " on" : ""), text: label });
      b.addEventListener("click", () => {
        shown = id;
        U.$$(".btn", filters).forEach(x => x.classList.remove("on"));
        b.classList.add("on");
        paint();
      });
      filters.appendChild(b);
    });
    view.appendChild(filters);
    view.appendChild(list);

    function paint() {
      list.innerHTML = "";
      all.filter(a => shown === "all" || (shown === "done") === !!owned[a.id]).forEach(a => {
        const have = !!owned[a.id];
        list.appendChild(U.el("div", { class: "ach " + (have ? "done" : "locked") }, [
          U.el("div", { class: "ach-ico", text: have ? a.icon : "🔒" }),
          U.el("div", { class: "ach-body" }, [
            U.el("div", { class: "ach-name", text: a.name }),
            U.el("div", { class: "ach-desc", text: a.desc })
          ]),
          U.el("span", { class: "ach-rew", text: a.reward + " ✒️" })
        ]));
      });
      if (!list.childNodes.length) {
        list.appendChild(U.el("div", { class: "empty" }, [U.el("p", { text: "Nothing here." })]));
      }
    }
    paint();

    function tile(n, label) {
      return U.el("div", { class: "card stat-tile" }, [
        U.el("div", { class: "stat-num", text: String(n) }),
        U.el("div", { class: "stat-lbl", text: label })
      ]);
    }
  }

  /* ── first run: say what this is, and what it is not (§0.4) ── */
  function boundaryModal(firstRun) {
    const body = U.el("div", {}, [
      U.el("div", { class: "modal-big", text: "📖" }),
      U.el("h2", { text: firstRun ? "Close Reading" : "What this app can and can't do" }),
      U.el("p", { text: "This app trains the moves and marks your sentences. Your teacher marks the essay." }),
      U.el("div", { class: "card", style: "text-align:left" }, [
        U.el("b", { text: "What it does" }),
        U.el("ul", { class: "tight" }, [
          U.el("li", { text: "Names techniques, holds quotes in your head, and drills the concepts each module actually rewards." }),
          U.el("li", { text: "Marks a typed sentence against model answers — right or nearly, then the model answers either way." }),
          U.el("li", { text: "Marks paragraphs you are given, so you learn what a band looks like from the inside." })
        ]),
        U.el("b", { text: "What it doesn't" }),
        U.el("ul", { class: "tight" }, [
          U.el("li", { text: "It cannot mark your essay. Nothing here reads 1,000 words and gives you a band, because nothing here could do that honestly." }),
          U.el("li", { text: "It never sends your writing anywhere. There is no account, no server and no network request once it has loaded." }),
          U.el("li", { text: "The Draft Desk is for writing, and it pays nothing at all." })
        ])
      ]),
      U.el("p", { class: "tiny muted",
        text: "Extracts are quoted for study and attributed. Buy the texts." }),
      U.el("button", { class: "btn btn-primary btn-block", style: "margin-top:6px",
        text: firstRun ? "Start reading" : "Understood",
        on: { click: () => {
          if (firstRun) { S.data.settings.onboarded = true; S.save(); S.flush(); }
          UI.closeModal();
          if (firstRun) EN.Sound.gameStart();
        } } })
    ]);
    UI.modal(body, { sticky: !!firstRun, center: true });
  }

  /** Called once at boot. Shows the boundary modal to a student who has never seen it. */
  function maybeOnboard() {
    if (S.data.settings.onboarded) return;
    setTimeout(() => boundaryModal(true), 400);
  }

  return { settings, achievements, boundaryModal, maybeOnboard, layerCPanel };
})();

EN.Screens.options = (v, a) => EN.Screens.misc.settings(v, a);
EN.Screens.achievements = (v, a) => EN.Screens.misc.achievements(v, a);
