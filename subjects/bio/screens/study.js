/* Study — the flashcard deck overview, leeches, and links to the Atlas and the glossary. */
(function (root) {
  "use strict";
  var BIO = root.BIO, U = BIO.U, UI = BIO.UI, S = BIO.State;

  UI.route("/study", function (view) {
    UI.hideTabs(false);
    view.appendChild(U.el("h1", { text:"Flashcards" }));

    var all = BIO.Bank.all("card");
    var active = BIO.Bank.active("card");
    var activeIds = {}; active.forEach(function (c) { activeIds[c.id] = true; });
    var due = S.dueCards(function (c) { return activeIds[c.id]; });

    var boxes = [0, 0, 0, 0, 0];
    var started = 0;
    all.forEach(function (c) {
      var cs = S.data.srs[c.id];
      if (cs) { boxes[Math.max(0, Math.min(4, cs.box - 1))]++; started++; }
    });

    view.appendChild(U.el("div", { class:"card" }, [
      U.el("div", { class:"spread" }, [
        U.el("div", {}, [
          U.el("b", { style:"font-size:18px", text: due.length ? U.plural(due.length, "card") + " due now" : "Nothing due" }),
          U.el("div", { class:"muted2", text: started + " of " + all.length + " cards started" })
        ]),
        U.el("button", { class:"btn btn-primary", onclick: function () { UI.go("/play/flashcards"); } },
          due.length ? "Review" : "Free review")
      ]),
      U.el("div", { style:"display:grid;grid-template-columns:repeat(5,1fr);gap:4px;margin-top:12px" },
        boxes.map(function (n, i) {
          return U.el("div", { style:"text-align:center" }, [
            U.el("div", { style:"font-weight:800;color:var(--accent)", text: String(n) }),
            U.el("div", { class:"muted2", style:"font-size:10px", text:"box " + (i + 1) })
          ]);
        }))
    ]));

    if (!due.length && started) {
      view.appendChild(U.el("div", { class:"honesty",
        text:"Nothing is due, so a review session right now pays nothing. That is not a bug — spaced repetition only works if you come back when the interval is up." }));
    }

    /* Leeches: cards graded "again" four or more times. Named, so a student can
       change how they learn them instead of grinding them. */
    var lee = S.leeches();
    if (lee.length) {
      view.appendChild(U.el("h2", { text:"Leeches  " + lee.length }));
      view.appendChild(U.el("p", { class:"muted small", text:"Cards you have missed four or more times. Rewrite them in your own words, draw them, or ask about them — reviewing them the same way again is not working." }));
      var ll = U.el("div", { class:"list" });
      lee.slice(0, 12).forEach(function (x) {
        ll.appendChild(U.el("div", { class:"li" }, [
          U.el("div", { class:"grow" }, [U.el("b", { text: x.q.front }), U.el("small", { text: x.q.back })]),
          U.el("span", { class:"badge badge-bad", text: x.c.lapses + "×" })
        ]));
      });
      view.appendChild(ll);
    }

    view.appendChild(U.el("div", { class:"row", style:"margin-top:12px" }, [
      U.el("button", { class:"btn grow", onclick: function () { UI.go("/reference"); } }, "📖 Glossary — free to read"),
      U.el("button", { class:"btn grow", onclick: function () { UI.go("/atlas"); } }, "🔬 Atlas of diagrams")
    ]));

    view.appendChild(U.el("h2", { text:"By module" }));
    var list = U.el("div", { class:"list" });
    U.MODULES.forEach(function (m) {
      var mine = BIO.Bank.active("card", function (c) { return c.mod === m.id; });
      var mineIds = {}; mine.forEach(function (c) { mineIds[c.id] = true; });
      var mineDue = S.dueCards(function (c) { return mineIds[c.id]; }).length;
      var row = U.el("button", { class:"li", style:"width:100%;text-align:left;font:inherit;color:inherit;cursor:pointer" }, [
        U.el("span", { class:"badge badge-accent", text: m.id }),
        U.el("div", { class:"grow" }, [
          U.el("b", { text: m.name }),
          U.el("small", { text: mine.length + " cards · " + mineDue + " due" })
        ]),
        U.el("span", { class:"muted2", text:"›" })
      ]);
      if (!mine.length) { row.disabled = true; row.style.opacity = ".45"; }
      row.addEventListener("click", function () { UI.go("/play/flashcards?mod=" + m.id); });
      list.appendChild(row);
    });
    view.appendChild(list);

    view.appendChild(U.el("h2", { text:"Browse" }));
    var search = U.el("input", { class:"calc-disp", type:"search", placeholder:"Search cards…", style:"text-align:left;font-size:15px;font-weight:500" });
    view.appendChild(search);
    var results = U.el("div", { class:"list", style:"margin-top:8px" });
    view.appendChild(results);

    function draw(q) {
      U.clear(results);
      var qq = U.norm(q || "");
      if (!qq) { results.appendChild(U.el("div", { class:"muted2 small", text:"Type to search the whole deck." })); return; }
      var hits = active.filter(function (c) {
        return U.norm(c.front).indexOf(qq) >= 0 || U.norm(c.back).indexOf(qq) >= 0;
      }).slice(0, 30);
      if (!hits.length) { results.appendChild(U.el("div", { class:"muted2 small", text:"No match." })); return; }
      hits.forEach(function (c) {
        results.appendChild(U.el("div", { class:"li" }, [
          U.el("div", { class:"grow" }, [U.el("b", { text: c.front }), U.el("small", { text: c.back })]),
          U.el("span", { class:"badge", text: c.mod })
        ]));
      });
    }
    search.addEventListener("input", U.debounce(function () { draw(search.value); }, 150));
    draw("");
  });
})(typeof window !== "undefined" ? window : globalThis);
