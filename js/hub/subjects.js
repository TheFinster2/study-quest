/* #/subjects — choose which subjects you study, and open any of them. */
window.SQ = window.SQ || {};
SQ.Hub = SQ.Hub || {};

(function (Hub) {
  const U = SQ.U, UI = SQ.UI;
  const D = () => SQ.Store.data;

  Hub.subjects = function (view) {
    const d = D();
    view.appendChild(U.el("div", { class: "hero" }, [
      U.el("h1", { text: "Subjects" }),
      U.el("p", { class: "muted", text: "Tick the subjects you study; they appear on your hub, in the switcher and in the shops. " +
        "Progress in a subject you untick is kept." })
    ]));
    const groups = {};
    SQ.Subjects.LIST.forEach(m => (groups[m.group] = groups[m.group] || []).push(m));
    Object.keys(groups).forEach(g => {
      view.appendChild(U.el("h2", { class: "sec-h", text: g }));
      view.appendChild(U.el("div", { class: "grid" }, groups[g].map(m => {
        const on = d.enrolled.includes(m.id);
        const sm = Hub.summary(m.id);
        return U.el("div", { class: "card subject-row", style: { "--sc": m.color } }, [
          U.el("div", { class: "subject-ico", text: m.icon }),
          U.el("div", { class: "subject-body" }, [
            U.el("div", { class: "subject-name", text: m.name }),
            U.el("div", { class: "tiny muted", text: m.blurb }),
            U.el("div", { class: "tiny muted", text: sm.started ? `Level ${sm.level} · ${U.fmtInt(sm.xp)} XP` : "Not started" })
          ]),
          U.el("div", { class: "col", style: "gap:6px" }, [
            U.el("button", { class: "btn btn-sm " + (on ? "btn-ghost" : "btn-primary"), text: on ? "✓ Studying" : "Add",
              "aria-pressed": on ? "true" : "false",
              on: { click: () => {
                if (on) d.enrolled = d.enrolled.filter(x => x !== m.id);
                else {
                  (m.excludes || []).forEach(x => {
                    if (d.enrolled.includes(x)) UI.toast({ icon: "ℹ️", text: `Removed ${SQ.Subjects.get(x).name} — you can only take one of the two.` });
                  });
                  d.enrolled = d.enrolled.filter(x => (m.excludes || []).indexOf(x) < 0).concat([m.id]);
                }
                SQ.Store.emit(); SQ.Sound.tap(); UI.go("/subjects");
              } } }),
            U.el("a", { class: "btn btn-sm btn-ghost", href: "#/s/" + m.id + "/home", text: "Open" })
          ])
        ]);
      })));
    });
  };
})(SQ.Hub);
