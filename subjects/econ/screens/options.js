/* Options — Economics-only settings: course coverage packs and Response
   Builder hints. (Save export/import, sound, motion and the service worker
   are app-wide now: they live in the app's Settings.) */
(function (root) {
  "use strict";
  var ECON = root.ECON, U = ECON.U, UI = ECON.UI, S = ECON.State, C = ECON.Coverage;

  UI.route("/options", function (view) {
    view.appendChild(U.el("h1", { text: "Economics options" }));

    /* ── course coverage ────────────────────────────────────────── */
    view.appendChild(U.el("h2", { text: "Course coverage" }));
    view.appendChild(U.el("p", { class: "muted small",
      text: "Schools finish topics at different times. Switch a pack off to remove it from every draw. Hiding content never raises what the remaining questions pay and never lowers an achievement target — you cannot shorten a collection by hiding it." }));

    var packs = C.packs();
    var byGroup = U.groupBy(packs, function (p) { return p.group || "Other"; });
    Object.keys(byGroup).forEach(function (g) {
      view.appendChild(U.el("h3", { text: g }));
      var box = U.el("div", { class: "card", style: "padding:4px 12px" });
      byGroup[g].forEach(function (p) {
        var impact = C.impact(p.id);
        var lab = U.el("label", { class: "switch" });
        var cb = U.el("input", { type: "checkbox", dataset: { pack: p.id } });
        cb.checked = !S.tagHidden(p.id);         // checked = INCLUDED
        cb.addEventListener("change", function () {
          S.setTagHidden(p.id, !cb.checked);
          UI.toast(cb.checked ? p.name + " included" : p.name + " hidden", null, 1300);
          UI.render();
        });
        lab.appendChild(cb);
        lab.appendChild(U.el("span", { class: "sw" }));
        lab.appendChild(U.el("span", { class: "grow" }, [
          U.el("b", { style: "font-size:14.5px", text: p.name }),
          U.el("div", { class: "muted2", style: "font-size:11.5px",
            text: (p.blurb ? p.blurb + " · " : "") + impact.total + " items" })
        ]));
        box.appendChild(lab);
      });
      view.appendChild(box);
    });

    var hidden = C.hiddenPackIds();
    if (hidden.length) {
      view.appendChild(U.el("div", { class: "why no" }, [
        U.el("div", { class: "why-h", text: "Hidden right now" }),
        U.el("div", { class: "small", text: hidden.map(function (id) { return C.pack(id).name; }).join(" · ") }),
        U.el("div", { class: "small muted2", style: "margin-top:6px",
          text: "Totals and achievement targets still count every hidden item." })
      ]));
    }

    /* ── behaviour ──────────────────────────────────────────────── */
    view.appendChild(U.el("h2", { text: "Response Builder" }));
    var hintBox = U.el("div", { class: "card", style: "padding:4px 12px" });
    var hl = U.el("label", { class: "switch" });
    var hc = U.el("input", { type: "checkbox" });
    hc.checked = !!S.data.settings.hintsInResponse;
    hc.addEventListener("change", function () {
      S.data.settings.hintsInResponse = hc.checked;
      S.save();
    });
    hl.appendChild(hc);
    hl.appendChild(U.el("span", { class: "sw" }));
    hl.appendChild(U.el("span", { class: "grow" }, [
      U.el("b", { style: "font-size:14.5px", text: "Show keyword hints on criteria" }),
      U.el("div", { class: "muted2", style: "font-size:11.5px",
        text: "Flags criteria that look like they might be covered. A guess, never a mark, and never fed into the score." })
    ]));
    hintBox.appendChild(hl);
    view.appendChild(hintBox);

    view.appendChild(U.el("h2", { text: "Progress" }));
    view.appendChild(U.el("div", { class: "row" }, [
      U.el("button", { class: "btn grow", onclick: function () { UI.go("/settings"); } }, "App settings (save, sound, motion)"),
      U.el("button", { class: "btn grow", style: "border-color:var(--bad);color:var(--bad)", onclick: function () {
        UI.confirm("Reset Economics?",
          "Economics XP, level, Dollars, flashcard schedules, mastery and achievements will be deleted. Other subjects are not touched. This cannot be undone.",
          function () { S.reset(); UI.toast("Economics reset"); UI.go("/home"); }, "Reset Economics");
      } }, "Reset Economics")
    ]));
  });
})(typeof window !== "undefined" ? window : globalThis);
