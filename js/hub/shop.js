/* The shops.

   General shop  (#/shop)          — paid in Stars ⭐: power-ups (usable in any subject),
                                     crates, arcade time, app themes, avatars.
   Subject shops (#/s/<id>/shop)   — paid in that subject's coins: its themes, avatars,
                                     arcade skins, crates (coins → power-ups), anything
                                     subject-specific, the difficulty switch, and the
                                     Exchange (coins → Stars, lossy on purpose).

   Both render through the same pieces so they look and behave the same. */
window.SQ = window.SQ || {};

SQ.Shop = (function () {
  const U = SQ.U, E = SQ.Economy, UI = SQ.UI;
  const D = () => SQ.Store.data;

  /* ── wallets: one interface over Stars and subject coins ──── */
  function wallet(subjectId) {
    if (!subjectId) {
      return { icon: "⭐", name: "Stars", balance: () => D().stars, spend: n => SQ.Overall.spendStars(n),
               level: () => D().overall.level, levelWord: "overall level" };
    }
    const S = SQ.Subjects.ns(subjectId).State, meta = SQ.Subjects.get(subjectId);
    return { icon: meta.currency.icon, name: meta.currency.name, balance: () => S.data.coins,
             spend: n => S.spendCoins(n), level: () => S.data.level, levelWord: meta.short + " level" };
  }

  function priceTag(w, price) { return U.el("span", { class: "price", text: price ? `${U.fmtInt(price)} ${w.icon}` : "Free" }); }

  function section(title, sub, items) {
    return U.el("section", { class: "shop-sec" }, [
      U.el("h3", { class: "shop-h", text: title }),
      sub ? U.el("p", { class: "muted tiny", html: sub }) : null,
      U.el("div", { class: "shop-grid" }, items)
    ]);
  }

  /** A buyable card. opts: { icon|swatch, name, desc, price, level, owned, equipped, onBuy, onUse, useLabel, count } */
  function item(w, o, rerender) {
    const locked = o.level && w.level() < o.level;
    const afford = w.balance() >= (o.price || 0);
    let action;
    if (o.owned) {
      action = o.onUse
        ? U.el("button", { class: "btn btn-sm " + (o.equipped ? "btn-ghost" : "btn-primary"), text: o.equipped ? "Equipped" : (o.useLabel || "Use"),
            disabled: o.equipped, on: { click: () => { o.onUse(); SQ.Sound.equip(); rerender(); } } })
        : U.el("span", { class: "chip on", text: "Owned" });
    } else if (locked) {
      action = U.el("span", { class: "chip", text: `🔒 ${w.levelWord} ${o.level}` });
    } else {
      action = U.el("button", { class: "btn btn-sm btn-primary", disabled: !afford, text: "Buy",
        title: afford ? "" : "Not enough " + w.name,
        on: { click: () => {
          if (!w.spend(o.price || 0)) { SQ.Sound.denied(); UI.toast({ icon: "✋", kind: "bad", text: "Not enough " + w.name + "." }); return; }
          D().stats.purchases = (D().stats.purchases || 0) + 1;
          SQ.Sound.purchase();
          o.onBuy();
          SQ.Store.emit();
          rerender();
        } } });
    }
    const face = o.swatch
      ? U.el("div", { class: "swatch" }, o.swatch.map(c => U.el("i", { style: { background: c } })))
      : U.el("div", { class: "shop-ico", text: o.icon || "✨" });
    return U.el("div", { class: "shop-item card" + (locked ? " locked" : "") + (o.owned ? " owned" : "") }, [
      face,
      U.el("div", { class: "shop-body" }, [
        U.el("div", { class: "shop-name", text: o.name }),
        o.desc ? U.el("div", { class: "shop-desc", html: o.desc }) : null,
        o.count !== undefined ? U.el("div", { class: "tiny muted", text: "You have " + o.count }) : null
      ]),
      U.el("div", { class: "shop-foot" }, [o.owned || locked ? null : priceTag(w, o.price), action])
    ]);
  }

  /* ── crates ───────────────────────────────────────────────── */
  const WEIGHTS = { fifty: 22, skip: 22, freeze: 16, shield: 12, hint: 8, reread: 8, insight: 7, double: 4, revive: 1 };
  const BETTER  = { fifty: 12, skip: 12, freeze: 14, shield: 14, hint: 9, reread: 9, insight: 12, double: 10, revive: 4 };
  function roll(better) {
    const w = better ? BETTER : WEIGHTS;
    const total = Object.values(w).reduce((a, b) => a + b, 0);
    let r = Math.random() * total;
    for (const k of Object.keys(w)) { r -= w[k]; if (r <= 0) return k; }
    return "fifty";
  }
  function openCrate(crate) {
    const got = {};
    for (let i = 0; i < (crate.rolls || 3); i++) { const k = roll(crate.better); got[k] = (got[k] || 0) + 1; }
    Object.keys(got).forEach(k => (D().inventory[k] = (D().inventory[k] || 0) + got[k]));
    let rare = null;
    if (crate.cosmetic && Math.random() < 0.18) {
      const pool = SQ.DATA.rareAvatars.filter(a => !D().owned.avatars.includes(a));
      if (pool.length) { rare = U.pick(pool); D().owned.avatars.push(rare); }
    }
    D().stats.cratesOpened = (D().stats.cratesOpened || 0) + 1;
    SQ.Store.emit();
    SQ.Sound.open();
    if (rare) setTimeout(() => SQ.Sound.rareDrop(), 400);
    const pu = k => E.POWERUPS.find(p => p.id === k) || { icon: "✨", name: k };
    UI.modal(U.el("div", { class: "modal-center" }, [
      U.el("div", { class: "modal-big", text: crate.icon || "📦" }),
      U.el("h2", { style: "justify-content:center", text: crate.name + " opened" }),
      U.el("div", { class: "crate-loot" }, Object.keys(got).map(k =>
        U.el("div", { class: "chip on", text: `${pu(k).icon} ${pu(k).name} ×${got[k]}` }))),
      rare ? U.el("p", { html: `<b>Rare avatar!</b> <span style="font-size:28px">${rare}</span>` }) : null,
      U.el("button", { class: "btn btn-primary btn-block", text: "Nice", on: { click: () => UI.closeModal() } })
    ]), { sticky: true });
    SQ.FX.confetti(rare ? 120 : 60);
  }

  /* ── pieces shared by both shops ──────────────────────────── */
  function themeItems(w, list, rerender, subjectId) {
    const d = D();
    return list.map(t => item(w, {
      swatch: t.swatch, name: t.name, price: t.price, level: t.level, desc: t.desc,
      owned: d.owned.themes.includes(t.id),
      equipped: subjectId ? (d.subjects[subjectId] && d.subjects[subjectId].settings.theme) === t.id : d.profile.theme === t.id,
      useLabel: subjectId ? "Use here" : "Wear",
      onUse: () => subjectId ? UI.setSubjectTheme(subjectId, t.id) : UI.applyTheme(t.id),
      onBuy: () => { d.owned.themes.push(t.id); subjectId ? UI.setSubjectTheme(subjectId, t.id) : UI.applyTheme(t.id); }
    }, rerender));
  }
  function avatarItems(w, list, rerender) {
    const d = D();
    return list.map(a => item(w, {
      icon: a.emoji, name: a.name || "Avatar", price: a.price, level: a.level,
      owned: d.owned.avatars.includes(a.emoji), equipped: d.profile.avatar === a.emoji, useLabel: "Wear",
      onUse: () => { d.profile.avatar = a.emoji; SQ.Store.emit(); },
      onBuy: () => { d.owned.avatars.push(a.emoji); d.profile.avatar = a.emoji; }
    }, rerender));
  }
  function crateItems(w, list, rerender) {
    return list.map(c => item(w, { icon: c.icon, name: c.name, desc: c.desc, price: c.price, level: c.level,
      onBuy: () => openCrate(c) }, rerender));
  }
  function balances(subjectId) {
    const d = D();
    const chips = [U.el("span", { class: "pill pill-star static" }, [U.el("span", { class: "pill-icon", text: "⭐" }), U.el("span", { text: U.fmtInt(d.stars) })])];
    if (subjectId) {
      const w = wallet(subjectId);
      chips.unshift(U.el("span", { class: "pill pill-coin static" }, [U.el("span", { class: "pill-icon", text: w.icon }), U.el("span", { text: U.fmtInt(w.balance()) })]));
    }
    return U.el("div", { class: "row", style: "gap:8px" }, chips);
  }

  /* ── the general shop ─────────────────────────────────────── */
  function general(view, args) {
    const w = wallet(null);
    const d = D();
    const tab = (args && args[0]) || "powerups";
    const render = () => { const y = window.scrollY; view.innerHTML = ""; general(view, [tab]); window.scrollTo(0, y); };
    const tabs = [["powerups", "Power-ups"], ["cosmetics", "Themes & avatars"], ["arcade", "Arcade"]];
    view.appendChild(U.el("div", { class: "hero" }, [
      U.el("h1", { text: "General shop" }),
      U.el("p", { class: "muted", html: "Paid in <b>Stars ⭐</b>, earned by studying any subject. Power-ups work in every subject. " +
        "Each subject also has its own shop, paid in that subject's coins." }),
      balances(null),
      U.el("div", { class: "row wrap", style: "gap:6px; margin-top:12px" }, tabs.map(([k, l]) =>
        U.el("a", { class: "chip chip-btn" + (k === tab ? " on" : ""), href: "#/shop/" + k, text: l })))
    ]));

    if (tab === "powerups") {
      view.appendChild(section("Power-ups", "Bought once, usable in any subject. Nightmare difficulty bans 50/50 and Skip.",
        E.POWERUPS.map(p => item(w, { icon: p.icon, name: p.name, desc: p.desc, price: p.price, level: p.level,
          count: d.inventory[p.id] || 0, onBuy: () => { d.inventory[p.id] = (d.inventory[p.id] || 0) + 1; } }, render))));
      view.appendChild(section("Crates", "Random power-ups. The Vault can drop a rare avatar.", crateItems(w, E.CRATES, render)));
    } else if (tab === "cosmetics") {
      view.appendChild(section("App themes", "Worn everywhere unless a subject has its own theme set.", themeItems(w, SQ.DATA.themes, render)));
      view.appendChild(section("Avatars", null, avatarItems(w, SQ.DATA.avatars, render)));
      /* Subject themes that are already owned can be worn app-wide from here too. */
      const extra = d.owned.themes.filter(t => !SQ.DATA.themes.find(x => x.id === t));
      if (extra.length) {
        view.appendChild(section("Your subject themes", "Bought in subject shops — wear one across the whole app.",
          extra.map(t => item(w, { icon: "🎨", name: t.replace(/^[a-z]+-/, "").replace(/-/g, " "), owned: true,
            equipped: d.profile.theme === t, useLabel: "Wear", onUse: () => UI.applyTheme(t) }, render))));
      }
    } else {
      const lvl = d.overall.level;
      view.appendChild(section("Arcade time",
        `Time is shared by every arcade game. It only runs while a game is on screen. The arcade pays no XP or coins — just high scores.` +
        (lvl < E.ARCADE_UNLOCK_LEVEL ? ` <b>Unlocks at overall level ${E.ARCADE_UNLOCK_LEVEL}.</b>` : ""),
        E.TICKETS.map(t => item(w, { icon: t.allDay ? "🎟️" : "⏱️", name: t.name, desc: t.desc, price: t.price,
          level: Math.max(E.ARCADE_UNLOCK_LEVEL, t.level || 0),
          onBuy: () => SQ.Arcade.grantTicket ? SQ.Arcade.grantTicket(t) : null }, render))));
      view.appendChild(U.el("a", { class: "btn btn-primary btn-block", href: "#/arcade", text: "🕹️ Go to the arcade" }));
    }

    view.appendChild(U.el("section", { class: "shop-sec" }, [
      U.el("h3", { class: "shop-h", text: "Subject shops" }),
      U.el("div", { class: "row wrap", style: "gap:8px" }, (d.enrolled.length ? d.enrolled : SQ.Subjects.ids()).map(id => {
        const m = SQ.Subjects.get(id);
        return U.el("a", { class: "chip chip-btn", href: "#/s/" + id + "/shop", text: `${m.icon} ${m.short} ${m.currency.icon}` });
      }))
    ]));
  }

  /* ── a subject's shop ─────────────────────────────────────── */
  function subject(view, subjectId, catalog) {
    const cat = catalog || {};
    const w = wallet(subjectId);
    const meta = SQ.Subjects.get(subjectId);
    const S = SQ.Subjects.ns(subjectId).State;
    const d = D();
    const render = () => { const y = window.scrollY; view.innerHTML = ""; subject(view, subjectId, catalog); window.scrollTo(0, y); };

    view.appendChild(U.el("div", { class: "hero" }, [
      U.el("h1", { text: meta.name + " shop" }),
      U.el("p", { class: "muted", html: `Paid in <b>${U.escapeHtml(meta.currency.name)} ${meta.currency.icon}</b>, earned in ${U.escapeHtml(meta.name)}. ` +
        `Power-ups are in the <a href="#/shop">general shop</a> — or crack a crate here.` }),
      balances(subjectId)
    ]));

    /* Difficulty lives in the shop, as it did in Biology: it is the one "purchase"
       that changes how the subject pays. Free to switch. */
    view.appendChild(U.el("section", { class: "shop-sec" }, [
      U.el("h3", { class: "shop-h", text: "Difficulty" }),
      U.el("p", { class: "muted tiny", text: "Applies to " + meta.name + " only. Higher difficulty pays more XP and has less time." }),
      U.el("div", { class: "diff-grid" }, S.DIFFICULTIES.map(df => U.el("button", {
        class: "diff-card card" + (S.difficulty().id === df.id ? " on" : ""), "aria-pressed": S.difficulty().id === df.id ? "true" : "false",
        on: { click: () => { S.setDifficulty(df.id); SQ.Sound.equip(); render(); } }
      }, [
        U.el("div", { class: "diff-ico", text: df.icon }),
        U.el("div", { class: "shop-name", text: df.name + " · ×" + df.xp + " XP" }),
        U.el("div", { class: "shop-desc", text: df.desc })
      ])))
    ]));

    if (cat.crates && cat.crates.length) view.appendChild(section("Crates", "Turn " + meta.currency.name + " into power-ups for any subject.", crateItems(w, cat.crates, render)));
    if (cat.extras && cat.extras.length) {
      view.appendChild(section(cat.extrasTitle || "Extras", null, cat.extras.map(x => item(w, {
        icon: x.icon, name: x.name, desc: x.desc, price: x.price, level: x.level,
        owned: x.owned ? x.owned() : false, onBuy: () => x.buy() }, render))));
    }
    if (cat.themes && cat.themes.length) {
      const follow = item(w, { icon: "↩️", name: "Follow app theme", desc: "Use your app-wide theme here.", owned: true,
        equipped: !(d.subjects[subjectId] && d.subjects[subjectId].settings.theme), useLabel: "Use",
        onUse: () => UI.setSubjectTheme(subjectId, null) }, render);
      view.appendChild(section(meta.name + " themes", "Used here by default; wear one app-wide from the general shop.",
        [follow].concat(themeItems(w, cat.themes, render, subjectId))));
    }
    if (cat.avatars && cat.avatars.length) view.appendChild(section(meta.name + " avatars", null, avatarItems(w, cat.avatars, render)));

    const skins = SQ.Arcade && SQ.Arcade.skinsFor ? SQ.Arcade.skinsFor(subjectId) : [];
    if (skins.length) {
      view.appendChild(section("Arcade skins", "Dress the shared arcade games in " + meta.name + ".",
        skins.map(sk => item(w, { icon: sk.icon, name: sk.name, desc: sk.desc, price: sk.price, level: sk.level,
          owned: (d.owned.skins || []).includes(sk.id), equipped: d.arcade.skin[sk.game] === sk.id, useLabel: "Equip",
          onUse: () => { d.arcade.skin[sk.game] = sk.id; SQ.Store.emit(); },
          onBuy: () => { d.owned.skins.push(sk.id); d.arcade.skin[sk.game] = sk.id; } }, render))));
    }

    view.appendChild(exchange(subjectId, render));
  }

  /* ── the Exchange ─────────────────────────────────────────── */
  function exchange(subjectId, rerender) {
    const S = SQ.Subjects.ns(subjectId).State, meta = SQ.Subjects.get(subjectId);
    const max = Math.floor(S.data.coins / E.EXCHANGE_RATE) * E.EXCHANGE_RATE;
    const input = U.el("input", { type: "range", min: E.EXCHANGE_MIN, max: Math.max(E.EXCHANGE_MIN, max), step: E.EXCHANGE_RATE,
      value: Math.min(max, 500), disabled: max < E.EXCHANGE_MIN, "aria-label": "Coins to exchange" });
    const out = U.el("div", { class: "muted" });
    const upd = () => { const n = +input.value; out.innerHTML = `${U.fmtInt(n)} ${meta.currency.icon} → <b>${U.fmtInt(Math.floor(n / E.EXCHANGE_RATE))} ⭐</b>`; };
    input.addEventListener("input", upd); upd();
    return U.el("section", { class: "shop-sec" }, [
      U.el("h3", { class: "shop-h", text: "The Exchange" }),
      U.el("p", { class: "muted tiny", text: `${E.EXCHANGE_RATE} ${meta.currency.name} buy 1 Star. It is a way to use coins from a subject you have finished with — studying pays Stars far better.` }),
      U.el("div", { class: "card" }, [input, out,
        U.el("button", { class: "btn btn-primary btn-sm", text: "Exchange", disabled: max < E.EXCHANGE_MIN,
          on: { click: () => {
            const n = +input.value;
            if (n < E.EXCHANGE_MIN || !S.spendCoins(n)) { SQ.Sound.denied(); return; }
            SQ.Overall.addStars(Math.floor(n / E.EXCHANGE_RATE));
            D().stats.exchanged = (D().stats.exchanged || 0) + n;
            SQ.Sound.purchase();
            rerender();
          } } })])
    ]);
  }

  return { general, subject, openCrate, wallet, item, section };
})();
