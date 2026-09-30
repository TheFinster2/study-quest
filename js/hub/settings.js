/* #/settings — app-wide settings. Subject-only options (coverage, tiers, texts,
   sig figs…) live on each subject's own #/s/<id>/options screen, linked from here. */
window.SQ = window.SQ || {};
SQ.Hub = SQ.Hub || {};

(function (Hub) {
  const U = SQ.U, UI = SQ.UI;
  const D = () => SQ.Store.data;

  function toggle(checked, onChange, label) {
    const input = U.el("input", { type: "checkbox", checked, role: "switch", "aria-label": label });
    input.addEventListener("change", () => onChange(input.checked));
    return U.el("label", { class: "switch" }, [input, U.el("i")]);
  }
  function seg(options, value, onPick, label) {
    return U.el("div", { class: "seg", role: "group", "aria-label": label }, options.map(([v, l]) =>
      U.el("button", { class: v === value ? "on" : "", "aria-pressed": v === value ? "true" : "false", text: l,
        on: { click: () => onPick(v) } })));
  }
  function row(title, desc, control) {
    return U.el("div", { class: "set-row" }, [
      U.el("div", {}, [U.el("div", { class: "shop-name", text: title }), desc ? U.el("div", { class: "tiny muted", html: desc }) : null]),
      control
    ]);
  }
  function card(title, rows) {
    return U.el("section", { class: "shop-sec" }, [U.el("h3", { class: "shop-h", text: title }), U.el("div", { class: "card" }, rows)]);
  }
  function download(name, text) {
    const blob = new Blob([text], { type: "application/json" });
    const a = U.el("a", { href: URL.createObjectURL(blob), download: name });
    document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }
  function pickFile(onText) {
    const inp = U.el("input", { type: "file", accept: "application/json,.json", style: "display:none" });
    inp.addEventListener("change", () => {
      const f = inp.files && inp.files[0];
      if (!f) return;
      const r = new FileReader();
      r.onload = () => onText(String(r.result || ""));
      r.readAsText(f);
    });
    document.body.appendChild(inp); inp.click();
    setTimeout(() => inp.remove(), 60000);
  }

  Hub.settings = function (view) {
    const d = D(), s = d.settings;
    const rerender = () => UI.go("/settings");

    view.appendChild(U.el("div", { class: "hero" }, [U.el("h1", { text: "Settings" }),
      U.el("p", { class: "muted", text: "App-wide. Each subject has its own options too." })]));

    /* ── profile ── */
    const name = U.el("input", { class: "text-in", value: d.profile.name, maxlength: 24, "aria-label": "Your name" });
    name.addEventListener("change", () => { d.profile.name = name.value.trim().slice(0, 24) || "Student"; SQ.Store.emit(); });
    view.appendChild(card("Profile", [
      row("Name", null, name),
      row("Avatar and theme", "Change from your profile, or buy more in the shops.",
        U.el("button", { class: "btn btn-sm btn-ghost", text: d.profile.avatar + " Profile", on: { click: () => Hub.profileSheet() } }))
    ]));

    /* ── subjects ── */
    const ids = d.enrolled.length ? d.enrolled : [];
    view.appendChild(card("Subjects", [
      row("Your subjects", ids.map(i => SQ.Subjects.get(i).icon + " " + SQ.Subjects.get(i).short).join(" · ") || "None chosen",
        U.el("a", { class: "btn btn-sm btn-primary", href: "#/subjects", text: "Change" }))
    ].concat(SQ.Subjects.LIST.filter(m => ids.includes(m.id) || SQ.Store.rawSlot(m.id)).map(m =>
      row(m.icon + " " + m.name, "Difficulty, coverage and other options for this subject.",
        U.el("div", { class: "row", style: "gap:6px" }, [
          U.el("a", { class: "btn btn-sm btn-ghost", href: "#/s/" + m.id + "/options", text: "Options" }),
          U.el("button", { class: "btn btn-sm btn-ghost", text: "Reset", title: "Reset " + m.name + " progress",
            on: { click: () => UI.confirmDialog("Reset " + m.name + "?",
              "This wipes your " + U.escapeHtml(m.name) + " level, coins, cards and stats. Your overall level, Stars and other subjects are untouched. <b>This can't be undone.</b>",
              () => { SQ.Store.resetSubject(m.id); location.reload(); }, "Reset", { danger: true }) } })
        ]))))));

    /* ── sound, motion, reading ── */
    view.appendChild(card("Sound & display", [
      row("Sound", null, toggle(s.sound, v => { s.sound = v; SQ.Loader.applySoundSettings(); SQ.Store.emit(); if (v) SQ.Sound.click(); }, "Sound")),
      row("Volume", null, (() => {
        const r = U.el("input", { type: "range", min: 0, max: 1, step: 0.05, value: s.volume, "aria-label": "Volume", style: "max-width:160px" });
        r.addEventListener("change", () => { s.volume = +r.value; SQ.Loader.applySoundSettings(); SQ.Store.emit(); SQ.Sound.click(); });
        return r;
      })()),
      row("Motion", (() => {
        const res = SQ.FX.applyMotion(s.motion);
        return "Auto follows your device" + (SQ.FX.prefersStill() ? " (which asks for reduced motion)" : "") +
          (res.overriding ? ". <b>You're overriding it.</b>" : ".");
      })(), seg([["auto", "Auto"], ["on", "On"], ["off", "Off"]], s.motion, v => { s.motion = v; SQ.FX.applyMotion(v); SQ.Store.emit(); rerender(); }, "Motion")),
      row("Text size", "Scales question text, answers, explanations and reference tables.",
        seg([["md", "A"], ["lg", "A+"], ["xl", "A++"]], s.textScale || "md", v => { s.textScale = v; document.documentElement.dataset.text = v; SQ.Store.emit(); rerender(); }, "Text size"))
    ]));

    /* ── save ── */
    const failing = SQ.Store.storageFailing();
    view.appendChild(card("Your save", [
      failing ? U.el("p", { class: "feedback no", html: "<b>Saving is failing</b> — this device's storage is full. Export now." }) : null,
      row("Export", `Everything in one file (${Math.round(SQ.Store.saveSize() / 1024)} kB). Keep a copy, or move it to another device.`,
        U.el("button", { class: "btn btn-sm btn-primary", text: "Export", on: { click: () => download("studyquest-save-" + U.dayKey() + ".json", SQ.Store.exportJSON()) } })),
      row("Import a StudyQuest save", "Replaces everything on this device.",
        U.el("button", { class: "btn btn-sm btn-ghost", text: "Import", on: { click: () => pickFile(text => {
          let obj; try { obj = JSON.parse(text); } catch (e) { UI.toast({ icon: "⚠", kind: "bad", text: "That file isn't valid JSON." }); return; }
          UI.confirmDialog("Replace your save?", "Everything on this device is replaced by the file.", () => {
            if (SQ.Store.replaceSave(obj)) location.reload();
            else UI.toast({ icon: "⚠", kind: "bad", text: "That doesn't look like a StudyQuest save." });
          }, "Replace", { danger: true });
        }) } })),
      row("Bring across the old apps", "Look again for saves from MoleQuest, Newton's Notebook, Biosphere, Equilibrium, Close Reading, NumberCrunch or MathQuest on this device.",
        U.el("button", { class: "btn btn-sm btn-ghost", text: "Look", on: { click: () => SQ.Migrate.offer(true) } })),
      row("Import an old app's export", "A JSON file exported from one of the old apps' Settings.",
        (() => {
          const sel = U.el("select", { class: "text-in", style: "max-width:170px; margin:0", "aria-label": "Which app" },
            SQ.Subjects.LIST.map(m => U.el("option", { value: m.id, text: m.app })));
          return U.el("div", { class: "row", style: "gap:6px" }, [sel, U.el("button", { class: "btn btn-sm btn-ghost", text: "File…",
            on: { click: () => pickFile(text => {
              const meta = SQ.Subjects.get(sel.value);
              SQ.Migrate.importFile(meta, text).then(r => {
                UI.toast({ icon: "📦", kind: "good", ms: 4000, text: `${meta.name}: level ${r.level}, ${U.fmtInt(r.xp)} XP imported.` });
                setTimeout(() => location.reload(), 1500);
              }).catch(e => UI.toast({ icon: "⚠", kind: "bad", text: U.escapeHtml(e.message) }));
            }) } })]);
        })()),
      row("Reset everything", "Every subject, your overall level, Stars and cosmetics.",
        U.el("button", { class: "btn btn-sm btn-danger", text: "Reset", on: { click: () => UI.confirmDialog("Reset everything?",
          "All progress in every subject is deleted. Export first if you might want it back. <b>This can't be undone.</b>",
          () => { SQ.Store.reset(); location.reload(); }, "Delete everything", { danger: true }) } }))
    ]));

    /* ── app ── */
    let taps = 0;
    const ver = U.el("button", { class: "btn btn-sm btn-ghost", text: "v" + SQ.VERSION, title: "App version",
      on: { click: () => { if (++taps >= 5) { d.devUnlocked = true; SQ.Store.save(); UI.go("/dev"); } } } });
    view.appendChild(card("App", [
      row("Version", "What you are running. Tap five times for the developer menu.", ver),
      row("Check for updates", "Updates also apply by themselves the next time you open the app.",
        U.el("button", { class: "btn btn-sm btn-ghost", text: "Check", on: { click: () => {
          if (!navigator.serviceWorker || !navigator.serviceWorker.getRegistration) { UI.toast("Updates need the app served over https."); return; }
          navigator.serviceWorker.getRegistration().then(r => r ? r.update().then(() => UI.toast("Checked — you'll be told if there's a new version.")) : UI.toast("Offline support isn't active here."))
            .catch(() => UI.toast("Couldn't check — are you offline?"));
        } } })),
      row("Force refresh", "Clears the offline cache and reloads. Your save is kept.",
        U.el("button", { class: "btn btn-sm btn-ghost", text: "Refresh", on: { click: () => SQ.forceRefresh() } })),
      d.devUnlocked ? row("Developer menu", "Presets and state tools. Progress made with them is flagged.", U.el("a", { class: "btn btn-sm btn-ghost", href: "#/dev", text: "Open" })) : null
    ]));
  };
})(SQ.Hub);
