/* ════════════════════════════════════════════════════════════════════════════
   Diagrams.  PHYSICS-BRIEF.md §7.
   ════════════════════════════════════════════════════════════════════════════

   One API, reused by questions, games and the reference screens. Everything is
   SVG built as a string and handed back — no canvas, so it scales, prints, and
   costs nothing when off-screen.

   Two rules that are easy to get wrong and expensive to notice later:

   1. Colours are read from the CSS custom properties at draw time, so every
      diagram follows the active theme instead of being drawn in whatever the
      default palette was. A hard-coded #39d6c8 looks fine until someone switches
      to the light theme and the diagram vanishes.

   2. Every diagram must be legible at 360 px. They are drawn in a fixed viewBox
      with a preserved aspect ratio and sized by CSS to 100% width, so the font
      sizes below are in viewBox units and scale down with everything else — which
      means the ONE thing to check is that the smallest label is still readable at
      360 px. Test it, don't assume it.                                          */

window.PHYS = window.PHYS || {};

PHYS.Draw = (function () {
  const U = PHYS.U;

  /** Theme colours, read fresh each call so a theme switch is picked up. */
  function palette() {
    const cs = getComputedStyle(document.documentElement);
    const v = n => (cs.getPropertyValue(n) || "").trim();
    return {
      ink: v("--ink") || "#eaf1ff",
      dim: v("--ink-dim") || "#9db0d2",
      faint: v("--ink-faint") || "#68799b",
      line: v("--line") || "rgba(255,255,255,.14)",
      accent: v("--accent") || "#4cc9f0",
      good: v("--good") || "#3fe08a",
      bad: v("--bad") || "#ff6b81",
      warn: v("--warn") || "#ffcc55",
      info: v("--info") || "#6fa8ff",
      glowB: v("--glow-b") || "#8a5cff"
    };
  }

  const esc = s => U.escapeHtml(String(s));
  const n = x => (Math.round(x * 100) / 100);

  /** Wrap a body in an <svg> with a viewBox, so CSS can size it freely. */
  function svg(w, h, body, opts) {
    const o = opts || {};
    return `<svg class="diagram ${o.class || ""}" viewBox="0 0 ${w} ${h}" ` +
           `preserveAspectRatio="xMidYMid meet" role="img" ` +
           `aria-label="${esc(o.label || "physics diagram")}">${body}</svg>`;
  }

  /* ── primitives ─────────────────────────────────────────────────────────── */

  const ARROW_DEFS = c =>
    `<defs>
       <marker id="ah-${c.replace(/[^a-z0-9]/gi, "")}" viewBox="0 0 10 10" refX="9" refY="5"
               markerWidth="6" markerHeight="6" orient="auto-start-reverse">
         <path d="M0,0 L10,5 L0,10 z" fill="${c}"/>
       </marker>
     </defs>`;

  function arrow(x1, y1, x2, y2, colour, width) {
    const id = "ah-" + colour.replace(/[^a-z0-9]/gi, "");
    return `<line x1="${n(x1)}" y1="${n(y1)}" x2="${n(x2)}" y2="${n(y2)}" ` +
           `stroke="${colour}" stroke-width="${width || 2.2}" stroke-linecap="round" ` +
           `marker-end="url(#${id})"/>`;
  }

  function text(x, y, s, opts) {
    const o = opts || {};
    return `<text x="${n(x)}" y="${n(y)}" fill="${o.colour || "currentColor"}" ` +
           `font-size="${o.size || 11}" font-weight="${o.weight || 600}" ` +
           `text-anchor="${o.anchor || "middle"}" ` +
           `font-family="system-ui,Segoe UI,sans-serif">${esc(s)}</text>`;
  }

  function dashed(x1, y1, x2, y2, colour) {
    return `<line x1="${n(x1)}" y1="${n(y1)}" x2="${n(x2)}" y2="${n(y2)}" ` +
           `stroke="${colour}" stroke-width="1" stroke-dasharray="4 4" opacity=".65"/>`;
  }

  /* ── 1. motion graphs (x–t, v–t, a–t) with shaded areas ─────────────────── */
  /**
   * graph({ points:[[t,y],…], xLabel, yLabel, shade:true, kind })
   * `points` are in data units; the axes are scaled to fit.
   */
  function graph(opts) {
    const o = opts || {};
    const p = palette();
    const W = 300, H = 190, L = 38, B = 30, R = 10, T = 14;
    const pts = o.points || [];
    if (!pts.length) return svg(W, H, "", { label: "empty graph" });

    const xs = pts.map(q => q[0]), ys = pts.map(q => q[1]);
    const xMax = Math.max.apply(null, xs) || 1;
    let yMin = Math.min(0, Math.min.apply(null, ys));
    let yMax = Math.max(0, Math.max.apply(null, ys));
    if (yMax === yMin) yMax = yMin + 1;
    const pad = (yMax - yMin) * 0.12;
    yMax += pad; yMin -= (yMin < 0 ? pad : 0);

    const px = t => L + (t / xMax) * (W - L - R);
    const py = y => (H - B) - ((y - yMin) / (yMax - yMin)) * (H - B - T);
    const zeroY = py(0);

    let body = ARROW_DEFS(p.dim);
    // axes
    body += arrow(L, H - B, W - 4, H - B, p.dim, 1.6);
    body += arrow(L, H - B, L, 6, p.dim, 1.6);
    if (yMin < 0) body += `<line x1="${L}" y1="${n(zeroY)}" x2="${W - R}" y2="${n(zeroY)}" stroke="${p.line}" stroke-width="1"/>`;

    // shaded area under the curve — the displacement on a v–t graph
    if (o.shade) {
      const d = [`M ${n(px(pts[0][0]))} ${n(zeroY)}`]
        .concat(pts.map(q => `L ${n(px(q[0]))} ${n(py(q[1]))}`))
        .concat([`L ${n(px(pts[pts.length - 1][0]))} ${n(zeroY)} Z`]).join(" ");
      body += `<path d="${d}" fill="${p.accent}" opacity=".18"/>`;
    }

    // the curve itself
    body += `<polyline points="${pts.map(q => n(px(q[0])) + "," + n(py(q[1]))).join(" ")}" ` +
            `fill="none" stroke="${p.accent}" stroke-width="2.6" stroke-linejoin="round" ` +
            `stroke-linecap="round"/>`;

    if (o.markPoints) {
      for (const q of pts) body += `<circle cx="${n(px(q[0]))}" cy="${n(py(q[1]))}" r="2.8" fill="${p.accent}"/>`;
    }

    body += text(W / 2 + 8, H - 8, o.xLabel || "t (s)", { colour: p.faint, size: 10.5 });
    body += `<g transform="translate(11,${n((H - B + T) / 2)}) rotate(-90)">` +
            text(0, 0, o.yLabel || "v (m s⁻¹)", { colour: p.faint, size: 10.5 }) + "</g>";
    if (o.note) body += text(W - R, T + 2, o.note, { colour: p.dim, size: 10, anchor: "end" });
    return svg(W, H, body, { label: o.label || ((o.yLabel || "value") + " against " + (o.xLabel || "time")) });
  }

  /** A v–t trapezium: accelerate, cruise, decelerate. */
  function vtTrapezium(vmax, t1, t2, t3) {
    return graph({
      points: [[0, 0], [t1, vmax], [t1 + t2, vmax], [t1 + t2 + t3, 0]],
      xLabel: "t (s)", yLabel: "v (m s⁻¹)", shade: true, markPoints: true,
      note: "shaded area = displacement",
      label: "velocity–time graph: a linear rise, a plateau, then a fall to zero"
    });
  }

  /** A single straight v–t line between two readings. */
  function vtLine(v1, v2, dt) {
    return graph({
      points: [[0, v1], [dt, v2]], xLabel: "t (s)", yLabel: "v (m s⁻¹)",
      markPoints: true, note: "gradient = acceleration",
      label: "velocity–time graph: one straight line"
    });
  }

  /** A triangular force pulse: impulse is the area. */
  function ftTriangle(Fpeak, dur) {
    return graph({
      points: [[0, 0], [dur / 2, Fpeak], [dur, 0]],
      xLabel: "t (s)", yLabel: "F (N)", shade: true, markPoints: true,
      note: "shaded area = impulse",
      label: "force–time graph: a triangular pulse"
    });
  }

  /* ── 2. free-body diagram ──────────────────────────────────────────────── */
  /**
   * freeBody({ forces:[{label, angle (deg, 0 = right, 90 = up), mag (relative)}],
   *            body:"block"|"ball"|"box", caption })
   */
  function freeBody(opts) {
    const o = opts || {};
    const p = palette();
    const W = 280, H = 240, cx = W / 2, cy = H / 2;
    let body = ARROW_DEFS(p.accent) + ARROW_DEFS(p.warn) + ARROW_DEFS(p.good) + ARROW_DEFS(p.bad);

    // the body itself
    if (o.body === "ball") body += `<circle cx="${cx}" cy="${cy}" r="20" fill="${p.accent}" opacity=".35" stroke="${p.accent}" stroke-width="2"/>`;
    else body += `<rect x="${cx - 22}" y="${cy - 18}" width="44" height="36" rx="5" fill="${p.accent}" opacity=".3" stroke="${p.accent}" stroke-width="2"/>`;

    const maxMag = Math.max.apply(null, (o.forces || []).map(f => f.mag || 1).concat([1]));
    const colours = [p.warn, p.good, p.info, p.bad, p.glowB];
    (o.forces || []).forEach((f, i) => {
      const c = f.colour || colours[i % colours.length];
      const len = 26 + 62 * ((f.mag || 1) / maxMag);
      const a = U.deg(f.angle || 0);
      const ex = cx + Math.cos(a) * len, ey = cy - Math.sin(a) * len;
      body += arrow(cx, cy, ex, ey, c, 2.6);
      // Push the label out past the arrowhead so it never sits on the arrow.
      const lx = cx + Math.cos(a) * (len + 18), ly = cy - Math.sin(a) * (len + 18) + 4;
      body += text(U.clamp(lx, 20, W - 20), U.clamp(ly, 14, H - 6), f.label,
                   { colour: c, size: 12, weight: 800 });
    });

    if (o.ground) body += `<line x1="12" y1="${H - 18}" x2="${W - 12}" y2="${H - 18}" stroke="${p.line}" stroke-width="2"/>`;
    if (o.caption) body += text(W / 2, H - 4, o.caption, { colour: p.faint, size: 10 });
    return svg(W, H, body, { label: o.label || "free-body diagram" });
  }

  /* ── 3. inclined plane ─────────────────────────────────────────────────── */
  function incline(opts) {
    const o = opts || {};
    const p = palette();
    const W = 300, H = 190;
    const th = U.deg(o.angle || 30);
    const baseY = H - 26, x0 = 26, x1 = W - 20;
    const topY = baseY - (x1 - x0) * Math.tan(th);
    const ty = Math.max(18, topY);
    let body = ARROW_DEFS(p.warn) + ARROW_DEFS(p.good) + ARROW_DEFS(p.info);

    body += `<path d="M ${x0} ${baseY} L ${x1} ${baseY} L ${x1} ${n(ty)} Z" ` +
            `fill="${p.accent}" opacity=".13" stroke="${p.line}" stroke-width="1.5"/>`;
    // the block, sitting on the slope
    const fx = x0 + (x1 - x0) * 0.45, fy = baseY - (fx - x0) * Math.tan(th);
    body += `<g transform="translate(${n(fx)},${n(fy)}) rotate(${n(-o.angle || -30)})">` +
            `<rect x="-15" y="-22" width="30" height="22" rx="4" fill="${p.accent}" opacity=".4" ` +
            `stroke="${p.accent}" stroke-width="2"/></g>`;
    // the weight, and its components
    body += arrow(fx, fy - 11, fx, fy + 40, p.warn, 2.4);
    body += text(fx + 16, fy + 44, "mg", { colour: p.warn, size: 11.5, weight: 800, anchor: "start" });
    if (o.components) {
      const along = 34;
      body += arrow(fx, fy - 11, fx + Math.cos(th) * along, fy - 11 + Math.sin(th) * along, p.good, 2.2);
      body += text(fx + Math.cos(th) * along + 4, fy + Math.sin(th) * along - 2,
                   "mg sinθ", { colour: p.good, size: 10.5, anchor: "start" });
    }
    // the angle mark
    body += `<path d="M ${x1 - 34} ${baseY} A 34 34 0 0 0 ${n(x1 - 34 * Math.cos(th))} ${n(baseY - 34 * Math.sin(th))}" ` +
            `fill="none" stroke="${p.dim}" stroke-width="1.2"/>`;
    body += text(x1 - 44, baseY - 8, (o.angle || 30) + "°", { colour: p.dim, size: 11, anchor: "end" });
    if (o.friction) body += text(W / 2, 14, "with friction", { colour: p.faint, size: 10 });
    return svg(W, H, body, { label: `a block on a slope inclined at ${o.angle || 30} degrees` });
  }

  /* ── 4. projectile trajectory with velocity components ─────────────────── */
  function projectile(opts) {
    const o = opts || {};
    const p = palette();
    const W = 320, H = 200;
    const u = o.u || 20, ang = o.angle === undefined ? 40 : o.angle;
    const g = 9.8;
    const rad = U.deg(ang);
    const ux = u * Math.cos(rad), uy = u * Math.sin(rad);
    const h0 = o.height || 0;
    // Flight time until it returns to y = 0 (allowing for a launch height).
    const tEnd = (uy + Math.sqrt(Math.max(0, uy * uy + 2 * g * h0))) / g || 1;
    const pts = [];
    for (let i = 0; i <= 60; i++) {
      const t = (i / 60) * tEnd;
      pts.push([ux * t, h0 + uy * t - 0.5 * g * t * t]);
    }
    const xMax = Math.max.apply(null, pts.map(q => q[0])) || 1;
    const yMax = Math.max.apply(null, pts.map(q => q[1])) || 1;
    const L = 30, B = 26;
    const px = x => L + (x / xMax) * (W - L - 16);
    const py = y => (H - B) - (y / (yMax * 1.18)) * (H - B - 18);

    let body = ARROW_DEFS(p.dim) + ARROW_DEFS(p.accent) + ARROW_DEFS(p.good) + ARROW_DEFS(p.warn);
    body += `<line x1="${L - 8}" y1="${H - B}" x2="${W - 6}" y2="${H - B}" stroke="${p.dim}" stroke-width="1.6"/>`;
    if (h0) body += `<rect x="${L - 14}" y="${n(py(h0))}" width="14" height="${n(H - B - py(h0))}" fill="${p.line}"/>`;
    body += `<path d="${pts.map((q, i) => (i ? "L" : "M") + " " + n(px(q[0])) + " " + n(py(q[1]))).join(" ")}" ` +
            `fill="none" stroke="${p.accent}" stroke-width="2.4" stroke-dasharray="${o.dashed ? "5 4" : "none"}"/>`;

    // launch velocity, resolved
    if (ang > 0) {
      const sx = px(0), sy = py(h0);
      const scale = 42 / u;
      body += arrow(sx, sy, sx + ux * scale, sy - uy * scale, p.good, 2.4);
      body += dashed(sx, sy, sx + ux * scale, sy, p.good);
      body += dashed(sx + ux * scale, sy, sx + ux * scale, sy - uy * scale, p.good);
      body += text(sx + ux * scale / 2, sy + 12, "u cosθ", { colour: p.good, size: 9.5 });
      body += text(sx + ux * scale + 22, sy - uy * scale / 2, "u sinθ", { colour: p.good, size: 9.5 });
    }
    if (o.markApex) {
      const apex = pts.reduce((a, q) => (q[1] > a[1] ? q : a), pts[0]);
      body += `<circle cx="${n(px(apex[0]))}" cy="${n(py(apex[1]))}" r="3.4" fill="${p.warn}"/>`;
      body += dashed(px(apex[0]), py(apex[1]), px(apex[0]), H - B, p.warn);
      body += text(px(apex[0]), py(apex[1]) - 7, "v_y = 0", { colour: p.warn, size: 9.5 });
    }
    body += text(W - 8, H - 6, "range", { colour: p.faint, size: 9.5, anchor: "end" });
    return svg(W, H, body, { label: `projectile launched at ${ang} degrees` });
  }

  /* ── 5. ray diagrams: refraction, critical angle, thin lens ────────────── */
  function refraction(opts) {
    const o = opts || {};
    const p = palette();
    const W = 280, H = 200, cx = W / 2, cy = H / 2;
    const th1 = o.th1 || 40, th2 = o.th2 === undefined ? 25 : o.th2;
    let body = ARROW_DEFS(p.accent) + ARROW_DEFS(p.warn);

    body += `<rect x="0" y="${cy}" width="${W}" height="${H - cy}" fill="${p.info}" opacity=".12"/>`;
    body += `<line x1="8" y1="${cy}" x2="${W - 8}" y2="${cy}" stroke="${p.line}" stroke-width="2"/>`;
    body += dashed(cx, 12, cx, H - 12, p.dim);
    body += text(cx + 6, 20, "normal", { colour: p.faint, size: 9, anchor: "start" });

    const len = 78;
    const a1 = U.deg(th1);
    body += arrow(cx - Math.sin(a1) * len, cy - Math.cos(a1) * len, cx, cy, p.accent, 2.4);
    const a2 = U.deg(th2);
    body += arrow(cx, cy, cx + Math.sin(a2) * len, cy + Math.cos(a2) * len, p.warn, 2.4);

    body += text(cx - 20, cy - 22, th1 + "°", { colour: p.accent, size: 11, weight: 800 });
    body += text(cx + 18, cy + 30, PHYS.U.fmtSig(th2, 3) + "°", { colour: p.warn, size: 11, weight: 800 });
    if (o.n1 !== undefined) body += text(14, cy - 10, "n₁ = " + o.n1.toFixed(2), { colour: p.dim, size: 10, anchor: "start" });
    if (o.n2 !== undefined) body += text(14, cy + 18, "n₂ = " + o.n2.toFixed(2), { colour: p.dim, size: 10, anchor: "start" });
    return svg(W, H, body, { label: "a ray refracting at a boundary between two media" });
  }

  function critical(opts) {
    const o = opts || {};
    const p = palette();
    const W = 280, H = 190, cx = W / 2, cy = 70;
    const C = o.C || 42;
    let body = ARROW_DEFS(p.accent) + ARROW_DEFS(p.warn) + ARROW_DEFS(p.good);
    body += `<rect x="0" y="${cy}" width="${W}" height="${H - cy}" fill="${p.info}" opacity=".14"/>`;
    body += `<line x1="6" y1="${cy}" x2="${W - 6}" y2="${cy}" stroke="${p.line}" stroke-width="2"/>`;
    body += dashed(cx, 14, cx, H - 8, p.dim);
    const a = U.deg(C), len = 76;
    body += arrow(cx - Math.sin(a) * len, cy + Math.cos(a) * len, cx, cy, p.accent, 2.4);
    body += arrow(cx, cy, cx + 82, cy, p.warn, 2.4);       // grazes along the boundary
    body += arrow(cx, cy, cx + Math.sin(a) * len, cy + Math.cos(a) * len, p.good, 1.8);
    body += text(cx - 26, cy + 34, "C = " + PHYS.U.fmtSig(C, 3) + "°", { colour: p.accent, size: 11, weight: 800 });
    body += text(cx + 52, cy - 8, "refracts at 90°", { colour: p.warn, size: 9.5 });
    body += text(W - 10, H - 8, "total internal reflection beyond C", { colour: p.faint, size: 9, anchor: "end" });
    return svg(W, H, body, { label: "a ray at the critical angle grazing along the boundary" });
  }

  function lens(opts) {
    const o = opts || {};
    const p = palette();
    const W = 320, H = 190, cy = H / 2, cx = W / 2;
    const f = o.f || 0.1, u = o.u || 0.3, v = o.v || 0.15;
    // Scale so the whole thing fits, object on the left.
    const scale = Math.min((cx - 30) / u, (W - cx - 26) / Math.max(v, f * 1.2));
    let body = ARROW_DEFS(p.accent) + ARROW_DEFS(p.good) + ARROW_DEFS(p.warn);

    body += `<line x1="8" y1="${cy}" x2="${W - 8}" y2="${cy}" stroke="${p.line}" stroke-width="1.2"/>`;
    // the lens
    body += `<ellipse cx="${cx}" cy="${cy}" rx="8" ry="52" fill="${p.info}" opacity=".22" stroke="${p.info}" stroke-width="1.8"/>`;
    for (const s of [-1, 1]) {
      const fx = cx + s * f * scale;
      body += `<circle cx="${n(fx)}" cy="${cy}" r="2.6" fill="${p.faint}"/>`;
      body += text(fx, cy + 15, s < 0 ? "F" : "F′", { colour: p.faint, size: 9.5 });
    }
    // object and image, as arrows
    const ox = cx - u * scale, oh = 30;
    body += arrow(ox, cy, ox, cy - oh, p.good, 2.4);
    body += text(ox, cy + 14, "object", { colour: p.good, size: 9.5 });
    const ix = cx + v * scale, ih = oh * (v / u);
    body += arrow(ix, cy, ix, cy + ih, p.warn, 2.4);
    body += text(ix, cy + ih + 12, "image", { colour: p.warn, size: 9.5 });
    // two construction rays
    body += `<line x1="${n(ox)}" y1="${n(cy - oh)}" x2="${cx}" y2="${n(cy - oh)}" stroke="${p.accent}" stroke-width="1.6"/>`;
    body += `<line x1="${cx}" y1="${n(cy - oh)}" x2="${n(ix)}" y2="${n(cy + ih)}" stroke="${p.accent}" stroke-width="1.6"/>`;
    body += `<line x1="${n(ox)}" y1="${n(cy - oh)}" x2="${n(ix)}" y2="${n(cy + ih)}" stroke="${p.accent}" stroke-width="1.6" opacity=".7"/>`;
    return svg(W, H, body, { label: "a thin converging lens forming a real inverted image" });
  }

  /* ── 6. circuits ───────────────────────────────────────────────────────── */
  /**
   * circuit({ resistors:[Ω…], series:bool, supply })
   * Schematics only — enough to read, not a full symbol library.
   */
  function circuit(opts) {
    const o = opts || {};
    const p = palette();
    const Rs = o.resistors || [10, 20];
    const W = 300, H = o.series ? 150 : 60 + Rs.length * 42;
    const L = 34, Rt = W - 34, top = 30, bot = H - 26;
    let body = "";
    const wire = (x1, y1, x2, y2) =>
      `<line x1="${n(x1)}" y1="${n(y1)}" x2="${n(x2)}" y2="${n(y2)}" stroke="${p.dim}" stroke-width="2"/>`;
    const resistor = (x, y, label, horizontal) => {
      const w = 40, h = 15;
      const rx = horizontal ? x - w / 2 : x - h / 2;
      const ry = horizontal ? y - h / 2 : y - w / 2;
      return `<rect x="${n(rx)}" y="${n(ry)}" width="${horizontal ? w : h}" ` +
             `height="${horizontal ? h : w}" rx="2.5" fill="${p.accent}" opacity=".3" ` +
             `stroke="${p.accent}" stroke-width="1.8"/>` +
             text(x, horizontal ? y - 12 : y - w / 2 - 5, label, { colour: p.ink, size: 10.5, weight: 800 });
    };
    // cell
    body += wire(L, top, L, bot);
    body += `<line x1="${L - 9}" y1="${n((top + bot) / 2 - 9)}" x2="${L + 9}" y2="${n((top + bot) / 2 - 9)}" stroke="${p.warn}" stroke-width="3"/>`;
    body += `<line x1="${L - 5}" y1="${n((top + bot) / 2 + 1)}" x2="${L + 5}" y2="${n((top + bot) / 2 + 1)}" stroke="${p.warn}" stroke-width="3"/>`;
    if (o.supply !== undefined)
      body += text(L - 14, (top + bot) / 2 + 20, o.supply + " V", { colour: p.warn, size: 10.5, anchor: "end", weight: 800 });

    if (o.series) {
      body += wire(L, top, Rt, top);
      body += wire(L, bot, Rt, bot);
      body += wire(Rt, top, Rt, bot);
      const span = Rt - L - 40;
      Rs.forEach((R, i) => {
        const x = L + 30 + (span / Math.max(1, Rs.length - 1 || 1)) * i + (Rs.length === 1 ? span / 2 : 0);
        body += resistor(Math.min(x, Rt - 26), top, R + " Ω", true);
      });
      body += text(W / 2, H - 8, "series", { colour: p.faint, size: 10 });
    } else {
      body += wire(L, top, Rt, top);
      body += wire(L, bot, Rt, bot);
      Rs.forEach((R, i) => {
        const y = top + 30 + i * 42;
        if (y > bot - 10) return;
        body += wire(L + 40, y, Rt - 40, y);
        body += wire(L + 40, top, L + 40, y);
        body += wire(Rt - 40, top, Rt - 40, y);
        body += resistor(W / 2, y, R + " Ω", true);
      });
      body += text(W / 2, H - 8, "parallel", { colour: p.faint, size: 10 });
    }
    return svg(W, H, body, { label: `a ${o.series ? "series" : "parallel"} circuit with ${Rs.length} resistors` });
  }

  /* ── 7. fields: radial, uniform, and around a wire ─────────────────────── */
  function field(opts) {
    const o = opts || {};
    const p = palette();
    const W = 260, H = 200;
    const kind = o.kind || "radial";
    let body = ARROW_DEFS(p.accent) + ARROW_DEFS(p.warn);

    if (kind === "radial") {
      const cx = W / 2, cy = H / 2;
      const positive = o.positive !== false;
      body += `<circle cx="${cx}" cy="${cy}" r="16" fill="${positive ? p.bad : p.info}" opacity=".4" ` +
              `stroke="${positive ? p.bad : p.info}" stroke-width="2"/>`;
      body += text(cx, cy + 5, positive ? "+" : "−", { colour: p.ink, size: 18, weight: 800 });
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        const r0 = 20, r1 = 78;
        const x0 = cx + Math.cos(a) * r0, y0 = cy + Math.sin(a) * r0;
        const x1 = cx + Math.cos(a) * r1, y1 = cy + Math.sin(a) * r1;
        body += positive ? arrow(x0, y0, x1, y1, p.accent, 1.6) : arrow(x1, y1, x0, y0, p.accent, 1.6);
      }
      body += text(W / 2, H - 5, "radial field, strength ∝ 1/r²", { colour: p.faint, size: 9.5 });
    } else if (kind === "uniform") {
      body += `<rect x="24" y="26" width="${W - 48}" height="7" fill="${p.bad}" opacity=".6"/>`;
      body += `<rect x="24" y="${H - 48}" width="${W - 48}" height="7" fill="${p.info}" opacity=".6"/>`;
      for (let i = 0; i < 7; i++) {
        const x = 36 + i * ((W - 72) / 6);
        body += arrow(x, 36, x, H - 44, p.accent, 1.8);
      }
      body += text(20, 22, "+", { colour: p.bad, size: 15, weight: 800 });
      body += text(20, H - 34, "−", { colour: p.info, size: 15, weight: 800 });
      body += text(W / 2, H - 8, "uniform field, E = V/d", { colour: p.faint, size: 9.5 });
    } else {
      // around a straight current-carrying wire, current out of the page
      const cx = W / 2, cy = H / 2;
      body += `<circle cx="${cx}" cy="${cy}" r="11" fill="none" stroke="${p.warn}" stroke-width="2.4"/>`;
      body += `<circle cx="${cx}" cy="${cy}" r="3.4" fill="${p.warn}"/>`;
      for (const r of [30, 50, 70]) {
        body += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${p.accent}" ` +
                `stroke-width="1.6" opacity=".8"/>`;
        body += arrow(cx + r, cy - 5, cx + r, cy + 6, p.accent, 1.6);
      }
      body += text(cx, cy - 22, "I out of page", { colour: p.warn, size: 9.5 });
      body += text(W / 2, H - 6, "B ∝ 1/r, circles round the wire", { colour: p.faint, size: 9.5 });
    }
    return svg(W, H, body, { label: kind + " field diagram" });
  }

  /* ── 8. wave snapshot with wavelength and amplitude marked ─────────────── */
  function wave(opts) {
    const o = opts || {};
    const p = palette();
    const W = 300, H = 170, cy = H / 2;
    const cycles = o.cycles || 2, amp = o.amp || 42;
    const L = 26, Rr = W - 18;
    let body = ARROW_DEFS(p.warn) + ARROW_DEFS(p.good) + ARROW_DEFS(p.dim);
    body += `<line x1="${L - 8}" y1="${cy}" x2="${Rr}" y2="${cy}" stroke="${p.line}" stroke-width="1.2"/>`;
    const pts = [];
    for (let i = 0; i <= 160; i++) {
      const x = L + (i / 160) * (Rr - L);
      const y = cy - amp * Math.sin((i / 160) * cycles * 2 * Math.PI);
      pts.push(n(x) + "," + n(y));
    }
    body += `<polyline points="${pts.join(" ")}" fill="none" stroke="${p.accent}" stroke-width="2.6" stroke-linecap="round"/>`;

    // one wavelength, marked between two successive zero crossings going up
    const lam = (Rr - L) / cycles;
    body += arrow(L, cy + amp + 16, L + lam, cy + amp + 16, p.warn, 1.8);
    body += arrow(L + lam, cy + amp + 16, L, cy + amp + 16, p.warn, 1.8);
    body += text(L + lam / 2, cy + amp + 30, "λ", { colour: p.warn, size: 12, weight: 800 });
    // amplitude
    const px = L + lam / 4;
    body += arrow(px, cy, px, cy - amp, p.good, 1.8);
    body += text(px + 14, cy - amp / 2, "A", { colour: p.good, size: 12, weight: 800, anchor: "start" });
    if (o.nodes) {
      for (let k = 0; k <= cycles * 2; k++) {
        const x = L + (k * lam) / 2;
        body += `<circle cx="${n(x)}" cy="${cy}" r="3" fill="${p.bad}"/>`;
      }
      body += text(W / 2, 16, "nodes marked", { colour: p.faint, size: 9.5 });
    }
    return svg(W, H, body, { label: "a wave snapshot with wavelength and amplitude marked" });
  }

  /** Standing wave on a string fixed at both ends, harmonic n. */
  function standingWave(L, harmonic) {
    const p = palette();
    const W = 300, H = 150, cy = H / 2;
    const x0 = 26, x1 = W - 26, amp = 40;
    let body = "";
    body += `<line x1="${x0}" y1="${cy - 52}" x2="${x0}" y2="${cy + 52}" stroke="${p.line}" stroke-width="3"/>`;
    body += `<line x1="${x1}" y1="${cy - 52}" x2="${x1}" y2="${cy + 52}" stroke="${p.line}" stroke-width="3"/>`;
    for (const s of [1, -1]) {
      const pts = [];
      for (let i = 0; i <= 160; i++) {
        const f = i / 160;
        pts.push(n(x0 + f * (x1 - x0)) + "," + n(cy - s * amp * Math.sin(harmonic * Math.PI * f)));
      }
      body += `<polyline points="${pts.join(" ")}" fill="none" stroke="${p.accent}" ` +
              `stroke-width="2.4" opacity="${s === 1 ? 1 : 0.42}"/>`;
    }
    for (let k = 0; k <= harmonic; k++) {
      const x = x0 + (k / harmonic) * (x1 - x0);
      body += `<circle cx="${n(x)}" cy="${cy}" r="3.4" fill="${p.bad}"/>`;
    }
    body += text(W / 2, H - 8,
                 `harmonic n = ${harmonic}, λ = 2L/${harmonic} = ${PHYS.U.fmtSig((2 * L) / harmonic, 3)} m`,
                 { colour: p.faint, size: 9.5 });
    body += text(W / 2, 16, "nodes at both fixed ends", { colour: p.faint, size: 9 });
    return svg(W, H, body, { label: `standing wave, harmonic ${harmonic}` });
  }

  /* ── 9. Bohr energy-level diagram ──────────────────────────────────────── */
  function energyLevels(opts) {
    const o = opts || {};
    const p = palette();
    const W = 280, H = 220;
    const levels = o.levels || [1, 2, 3, 4, 5];
    let body = ARROW_DEFS(p.warn);
    const E = nn => -13.6 / (nn * nn);
    const yOf = e => 30 + ((0 - e) / 13.6) * (H - 60);

    for (const nn of levels) {
      const y = yOf(E(nn));
      body += `<line x1="60" y1="${n(y)}" x2="${W - 30}" y2="${n(y)}" stroke="${p.dim}" stroke-width="1.8"/>`;
      body += text(52, y + 4, "n=" + nn, { colour: p.dim, size: 10, anchor: "end" });
      body += text(W - 26, y + 4, PHYS.U.fmtSig(E(nn), 3) + " eV",
                   { colour: p.faint, size: 9, anchor: "start" });
    }
    body += `<line x1="60" y1="26" x2="${W - 30}" y2="26" stroke="${p.faint}" stroke-width="1.2" stroke-dasharray="4 3"/>`;
    body += text(52, 30, "n=∞", { colour: p.faint, size: 10, anchor: "end" });

    if (o.transition) {
      const [ni, nf] = o.transition;
      const x = 60 + (W - 90) * 0.42;
      body += arrow(x, yOf(E(ni)), x, yOf(E(nf)), p.warn, 2.6);
      body += text(x + 30, (yOf(E(ni)) + yOf(E(nf))) / 2,
                   `${ni} → ${nf}`, { colour: p.warn, size: 10.5, weight: 800, anchor: "start" });
    }
    body += text(W / 2, H - 6, "hydrogen energy levels (Bohr model)", { colour: p.faint, size: 9.5 });
    return svg(W, H, body, { label: "hydrogen energy level diagram" });
  }

  /* ── 10. misc: pulley, plates, transformer, orbit, banked curve ────────── */
  function pulley(m1, m2) {
    const p = palette();
    const W = 240, H = 210;
    let body = ARROW_DEFS(p.warn);
    body += `<circle cx="${W / 2}" cy="34" r="20" fill="none" stroke="${p.dim}" stroke-width="2.4"/>`;
    body += `<circle cx="${W / 2}" cy="34" r="3" fill="${p.dim}"/>`;
    for (const [s, m, y] of [[-1, m1, 150], [1, m2, 110]]) {
      const x = W / 2 + s * 20;
      body += `<line x1="${n(x)}" y1="34" x2="${n(x)}" y2="${y}" stroke="${p.dim}" stroke-width="1.8"/>`;
      body += `<rect x="${n(x - 19)}" y="${y}" width="38" height="30" rx="4" fill="${p.accent}" ` +
              `opacity=".32" stroke="${p.accent}" stroke-width="2"/>`;
      body += text(x, y + 20, m + " kg", { colour: p.ink, size: 10.5, weight: 800 });
      body += arrow(x, y + 32, x, y + 58, p.warn, 2);
    }
    body += text(W / 2, H - 5, "frictionless pulley, light string", { colour: p.faint, size: 9.5 });
    return svg(W, H, body, { label: "two masses over a pulley" });
  }

  function plates(V, d) {
    const p = palette();
    const W = 260, H = 170;
    let body = ARROW_DEFS(p.accent) + ARROW_DEFS(p.dim);
    body += `<rect x="30" y="34" width="${W - 60}" height="7" fill="${p.bad}" opacity=".65"/>`;
    body += `<rect x="30" y="${H - 58}" width="${W - 60}" height="7" fill="${p.info}" opacity=".65"/>`;
    for (let i = 0; i < 6; i++) {
      const x = 44 + i * ((W - 88) / 5);
      body += arrow(x, 44, x, H - 54, p.accent, 1.7);
    }
    body += arrow(W - 22, 41, W - 22, H - 51, p.dim, 1.4);
    body += text(W - 14, H / 2, PHYS.U.fmtSig(d, 3) + " m", { colour: p.dim, size: 9.5, anchor: "start" });
    body += text(W / 2, 26, V + " V", { colour: p.warn, size: 11.5, weight: 800 });
    body += text(W / 2, H - 8, "uniform field between the plates: E = V/d", { colour: p.faint, size: 9.5 });
    return svg(W, H, body, { label: "parallel plates with a uniform field between them" });
  }

  function transformer(Np, Ns) {
    const p = palette();
    const W = 280, H = 170, cy = H / 2;
    let body = "";
    body += `<rect x="${W / 2 - 22}" y="34" width="44" height="${H - 78}" fill="${p.dim}" opacity=".22" ` +
            `stroke="${p.dim}" stroke-width="1.6"/>`;
    const coil = (x, turns, colour, label) => {
      let s = "";
      const count = 7;
      for (let i = 0; i < count; i++) {
        const y = 46 + i * ((H - 100) / (count - 1));
        s += `<circle cx="${n(x)}" cy="${n(y)}" r="6.5" fill="none" stroke="${colour}" stroke-width="2"/>`;
      }
      s += text(x, 30, label, { colour, size: 10.5, weight: 800 });
      s += text(x, H - 30, turns + " turns", { colour: p.faint, size: 9.5 });
      return s;
    };
    body += coil(W / 2 - 34, Np, p.accent, "primary");
    body += coil(W / 2 + 34, Ns, p.warn, "secondary");
    body += text(W / 2, H - 8, "soft iron core — same flux through both coils", { colour: p.faint, size: 9 });
    return svg(W, H, body, { label: "a transformer with primary and secondary coils" });
  }

  function orbit(rEarth, rOrbit) {
    const p = palette();
    const W = 260, H = 220, cx = W / 2, cy = H / 2;
    const scale = 88 / rOrbit;
    const re = Math.max(14, rEarth * scale);
    const ro = rOrbit * scale;
    let body = ARROW_DEFS(p.warn) + ARROW_DEFS(p.accent);
    body += `<circle cx="${cx}" cy="${cy}" r="${n(re)}" fill="${p.info}" opacity=".35" stroke="${p.info}" stroke-width="1.6"/>`;
    body += `<circle cx="${cx}" cy="${cy}" r="${n(ro)}" fill="none" stroke="${p.accent}" stroke-width="1.6" stroke-dasharray="5 4"/>`;
    const sx = cx + ro, sy = cy;
    body += `<rect x="${n(sx - 6)}" y="${n(sy - 4)}" width="12" height="8" rx="2" fill="${p.warn}"/>`;
    body += arrow(sx, sy, sx, sy - 26, p.warn, 2);
    body += text(sx + 12, sy - 30, "v", { colour: p.warn, size: 11, weight: 800, anchor: "start" });
    body += arrow(sx, sy, cx + re * 0.6, cy, p.accent, 2);
    body += text((sx + cx) / 2, cy - 8, "F_g", { colour: p.accent, size: 10.5, weight: 800 });
    body += dashed(cx, cy, sx, sy, p.dim);
    body += text((cx + sx) / 2, cy + 14, "r", { colour: p.dim, size: 10 });
    body += text(W / 2, H - 6, "measured from the centre, not the surface", { colour: p.faint, size: 9 });
    return svg(W, H, body, { label: "a satellite in circular orbit" });
  }

  function banked(angle) {
    const p = palette();
    const W = 280, H = 170;
    const th = U.deg(angle);
    const x0 = 24, x1 = W - 24, baseY = H - 34;
    const topY = baseY - (x1 - x0) * Math.tan(th) * 0.5;
    let body = ARROW_DEFS(p.warn) + ARROW_DEFS(p.good) + ARROW_DEFS(p.info);
    body += `<path d="M ${x0} ${baseY} L ${x1} ${n(Math.max(20, topY))} L ${x1} ${baseY} Z" ` +
            `fill="${p.accent}" opacity=".14" stroke="${p.line}" stroke-width="1.5"/>`;
    const fx = x0 + (x1 - x0) * 0.55;
    const fy = baseY - (fx - x0) * Math.tan(th) * 0.5;
    body += `<rect x="${n(fx - 15)}" y="${n(fy - 12)}" width="30" height="14" rx="3" fill="${p.accent}" ` +
            `opacity=".4" stroke="${p.accent}" stroke-width="1.8"/>`;
    body += arrow(fx, fy - 5, fx, fy + 40, p.warn, 2.2);
    body += text(fx + 14, fy + 44, "mg", { colour: p.warn, size: 10.5, anchor: "start" });
    const nl = 48;
    body += arrow(fx, fy - 5, fx - Math.sin(th) * nl, fy - 5 - Math.cos(th) * nl, p.good, 2.2);
    body += text(fx - Math.sin(th) * nl - 8, fy - 12 - Math.cos(th) * nl, "N", { colour: p.good, size: 11, weight: 800, anchor: "end" });
    body += text(W / 2, H - 8, "θ = " + PHYS.U.fmtSig(angle, 3) + "°, tan θ = v²/rg", { colour: p.faint, size: 9.5 });
    return svg(W, H, body, { label: "a car on a banked curve" });
  }

  function motorForce(opts) {
    const o = opts || {};
    const p = palette();
    const W = 260, H = 180, cy = H / 2;
    let body = ARROW_DEFS(p.accent) + ARROW_DEFS(p.good) + ARROW_DEFS(p.warn);
    // field into the page
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 3; j++) {
        const x = 44 + i * 56, y = 40 + j * 46;
        body += `<circle cx="${x}" cy="${y}" r="6.5" fill="none" stroke="${p.info}" stroke-width="1.4"/>`;
        body += `<line x1="${x - 4.2}" y1="${y - 4.2}" x2="${x + 4.2}" y2="${y + 4.2}" stroke="${p.info}" stroke-width="1.4"/>`;
        body += `<line x1="${x + 4.2}" y1="${y - 4.2}" x2="${x - 4.2}" y2="${y + 4.2}" stroke="${p.info}" stroke-width="1.4"/>`;
      }
    }
    body += `<line x1="16" y1="${cy}" x2="${W - 16}" y2="${cy}" stroke="${p.warn}" stroke-width="3.4"/>`;
    body += arrow(W / 2 - 14, cy, W / 2 + 26, cy, p.warn, 2.6);
    body += text(W / 2 + 34, cy - 8, "I", { colour: p.warn, size: 12, weight: 800, anchor: "start" });
    body += arrow(W / 2, cy, W / 2, cy - 52, p.good, 2.8);
    body += text(W / 2 + 12, cy - 56, "F", { colour: p.good, size: 12, weight: 800, anchor: "start" });
    body += text(W / 2, H - 6, "B into the page — F = BIL sin θ, F ⊥ both", { colour: p.faint, size: 9 });
    return svg(W, H, body, { label: "force on a current-carrying conductor in a field" });
  }

  function fluxLoop(opts) {
    const o = opts || {};
    const p = palette();
    const W = 250, H = 175;
    const ang = o.angle || 0;
    let body = ARROW_DEFS(p.accent) + ARROW_DEFS(p.dim);
    const cx = W / 2, cy = H / 2 - 4;
    const sq = 46, squash = Math.cos(U.deg(ang));
    body += `<ellipse cx="${cx}" cy="${cy}" rx="${n(sq)}" ry="${n(sq * 0.42)}" fill="${p.accent}" ` +
            `opacity=".2" stroke="${p.accent}" stroke-width="2.2" ` +
            `transform="rotate(${n(-ang)} ${cx} ${cy})"/>`;
    for (let i = -2; i <= 2; i++) {
      const x = cx + i * 28;
      body += arrow(x, 22, x, H - 40, p.info, 1.7);
    }
    body += arrow(cx, cy, cx + Math.sin(U.deg(ang)) * 40, cy - Math.cos(U.deg(ang)) * 40, p.warn, 2);
    body += text(cx + 8, cy - 46, "normal", { colour: p.warn, size: 9, anchor: "start" });
    body += text(W / 2, H - 6, `Φ = BA cos θ, θ = ${ang}° from the normal`, { colour: p.faint, size: 9.5 });
    return svg(W, H, body, { label: "magnetic flux through a loop" });
  }

  function selector(opts) {
    const o = opts || {};
    const p = palette();
    const W = 270, H = 160, cy = H / 2;
    let body = ARROW_DEFS(p.accent) + ARROW_DEFS(p.warn) + ARROW_DEFS(p.good);
    body += `<rect x="40" y="34" width="${W - 80}" height="6" fill="${p.bad}" opacity=".6"/>`;
    body += `<rect x="40" y="${H - 52}" width="${W - 80}" height="6" fill="${p.info}" opacity=".6"/>`;
    for (let i = 0; i < 4; i++) {
      const x = 56 + i * ((W - 112) / 3);
      body += `<circle cx="${x}" cy="${cy - 16}" r="5" fill="none" stroke="${p.info}" stroke-width="1.3"/>`;
      body += `<circle cx="${x}" cy="${cy - 16}" r="1.6" fill="${p.info}"/>`;
    }
    body += arrow(14, cy, W - 14, cy, p.good, 2.6);
    body += text(W / 2, cy - 32, "B out of page", { colour: p.info, size: 9 });
    body += text(W / 2, cy + 22, "qE balances qvB → v = E/B", { colour: p.accent, size: 10, weight: 700 });
    body += text(W / 2, H - 6, "only one speed passes undeflected", { colour: p.faint, size: 9 });
    return svg(W, H, body, { label: "a velocity selector" });
  }

  function circular(opts) {
    const o = opts || {};
    const p = palette();
    const W = 230, H = 210, cx = W / 2, cy = H / 2;
    const rr = 68;
    let body = ARROW_DEFS(p.accent) + ARROW_DEFS(p.warn);
    body += `<circle cx="${cx}" cy="${cy}" r="${rr}" fill="none" stroke="${p.line}" stroke-width="1.6" stroke-dasharray="5 4"/>`;
    body += `<circle cx="${cx}" cy="${cy}" r="3" fill="${p.dim}"/>`;
    const bx = cx + rr, by = cy;
    body += `<circle cx="${bx}" cy="${by}" r="9" fill="${p.accent}" opacity=".45" stroke="${p.accent}" stroke-width="2"/>`;
    body += arrow(bx, by, bx, by - 44, p.warn, 2.4);
    body += text(bx + 10, by - 48, "v", { colour: p.warn, size: 12, weight: 800, anchor: "start" });
    body += arrow(bx, by, cx + 14, cy, p.accent, 2.4);
    body += text((bx + cx) / 2, cy - 8, "F_c", { colour: p.accent, size: 11, weight: 800 });
    body += dashed(cx, cy, bx, by, p.dim);
    body += text((cx + bx) / 2, cy + 15, "r", { colour: p.dim, size: 10.5 });
    body += text(W / 2, H - 6, "v tangential, F_c towards the centre", { colour: p.faint, size: 9 });
    return svg(W, H, body, { label: "circular motion with velocity and centripetal force marked" });
  }

  /* ── dispatcher ─────────────────────────────────────────────────────────
     Generators attach a plain `diagram` or `graph` object describing what they
     want; nothing in a data file ever writes SVG. */
  function forSpec(spec) {
    if (!spec) return "";
    try {
      switch (spec.kind) {
        case "vt-trapezium":  return vtTrapezium(spec.vmax, spec.t1, spec.t2, spec.t3);
        case "vt-line":       return vtLine(spec.v1, spec.v2, spec.dt);
        case "ft-triangle":   return ftTriangle(spec.Fpeak, spec.dur);
        case "incline":       return incline({ angle: spec.angle, friction: spec.friction, components: true });
        case "projectile":    return projectile(spec);
        case "refraction":    return refraction(spec);
        case "critical":      return critical(spec);
        case "lens":          return lens(spec);
        case "circuit":       return circuit(spec);
        case "plates":        return plates(spec.V, spec.d);
        case "transformer":   return transformer(spec.Np, spec.Ns);
        case "orbit":         return orbit(spec.rEarth, spec.rOrbit);
        case "banked":        return banked(spec.angle);
        case "pulley":        return pulley(spec.m1, spec.m2);
        case "standing-wave": return standingWave(spec.L, spec.n);
        case "motor-force":   return motorForce(spec);
        case "flux":          return fluxLoop(spec);
        case "selector":      return selector(spec);
        case "circular":      return circular(spec);
        case "field":         return field(spec);
        case "wave":          return wave(spec);
        case "levels":        return energyLevels(spec);
        default: return "";
      }
    } catch (e) {
      console.warn("Diagram failed:", spec.kind, e);
      return "";
    }
  }

  /** Wrap in a scroll container: a wide diagram must scroll inside itself, never
      push the page sideways at 360 px. */
  function wrap(html) {
    return html ? `<div class="diagram-wrap">${html}</div>` : "";
  }

  return { palette, svg, graph, vtTrapezium, vtLine, ftTriangle,
           freeBody, incline, projectile, refraction, critical, lens,
           circuit, field, wave, standingWave, energyLevels,
           pulley, plates, transformer, orbit, banked, motorForce,
           fluxLoop, selector, circular, forSpec, wrap };
})();
