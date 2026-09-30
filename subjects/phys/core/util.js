/* Small DOM + general helpers, and the notation renderer.
   Everything hangs off window.PHYS. Loaded before every other module. */
window.PHYS = window.PHYS || {};

PHYS.U = (function () {
  const $  = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  /** Create an element. `attrs.html` sets innerHTML, `attrs.on` binds listeners. */
  function el(tag, attrs, children) {
    const node = document.createElement(tag);
    if (attrs) {
      for (const [k, v] of Object.entries(attrs)) {
        if (v === null || v === undefined || v === false) continue;
        if (k === "class") node.className = v;
        else if (k === "html") node.innerHTML = v;
        else if (k === "text") node.textContent = v;
        else if (k === "on") for (const [ev, fn] of Object.entries(v)) node.addEventListener(ev, fn);
        else if (k === "data") for (const [dk, dv] of Object.entries(v)) node.dataset[dk] = dv;
        else if (v === true) node.setAttribute(k, "");
        else node.setAttribute(k, v);
      }
    }
    for (const c of [].concat(children || [])) {
      if (c === null || c === undefined || c === false) continue;
      node.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    }
    return node;
  }

  /** el() with `html` produced by the notation renderer — the common case in content. */
  function mel(tag, attrs, src) {
    const a = Object.assign({}, attrs || {});
    a.html = math(src);
    return el(tag, a);
  }

  const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
  const randInt = (lo, hi) => lo + Math.floor(Math.random() * (hi - lo + 1));
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  /** Take up to n random items without repeats. */
  const sample = (arr, n) => shuffle(arr).slice(0, n);

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  /* ════════════════════════════════════════════════════════════════════════
     NOTATION  —  see PHYSICS-BRIEF.md §6
     ════════════════════════════════════════════════════════════════════════
     Content files contain no HTML. They contain a compact source syntax which
     this renderer turns into the markup the stylesheet is built around:

       v^2  s^-1  10^{1/2}   superscript   (position:relative, never vertical-align)
       E_k  m_1   v_{avg}    subscript
       \f{Δx}{Δt}            built-up fraction (inline-grid, bar on the maths axis)
       \sqrt{u^2 + 2as}      stretchable SVG radical
       \nuc{235}{92}U        simultaneous sub+superscript
       \v{F} = m\v{a}        vector arrows
       \u{m s^-2}            non-breaking unit
       Delta lambda omega    Greek by name
       \times \pm \to \deg   symbols
       \sin \cos \tan \ln    function names, upright, thin space before the argument
       \text{North: }        words inside working, upright
       \left( … \right)      swallowed; the delimiter itself is emitted as-is

     HTML is escaped FIRST and the syntax substituted afterwards, so a question
     containing `<` cannot become markup. Escaping leaves `\`, `{`, `}`, `^` and
     `_` alone, so the parser still sees the structure it needs.

     The parser is recursive because fractions nest inside radicals and radicals
     inside fractions — a flat chain of regex replaces cannot do that. */

  /* Greek by bare word. alpha/beta/gamma are deliberately absent: nuclear
     physics prose is full of "alpha particle" and "gamma radiation", and
     silently rewriting those to symbols reads badly. They are available as
     \alpha, \beta, \gamma when the symbol is actually wanted. */
  const GREEK = {
    Delta: "Δ", Sigma: "Σ", Omega: "Ω", Phi: "Φ", Psi: "Ψ", Gamma: "Γ",
    Lambda: "Λ", Pi: "Π", Theta: "Θ",
    delta: "δ", epsilon: "ε", zeta: "ζ", eta: "η", theta: "θ", kappa: "κ",
    lambda: "λ", mu: "μ", nu: "ν", xi: "ξ", pi: "π", rho: "ρ", sigma: "σ",
    tau: "τ", phi: "φ", chi: "χ", psi: "ψ", omega: "ω"
  };
  /* Delimited by LETTERS, not by \b. An underscore is a word character, so \b never
     fired between "lambda" and "_{max}" — mathPlain("lambda_{max}") came back as the
     literal "lambdamax" while math() rendered "λmax", and every comparison between
     rendered text and plain text silently disagreed for exactly those symbols. */
  const GREEK_RE = new RegExp("(?<![A-Za-z])(" + Object.keys(GREEK).join("|") + ")(?![A-Za-z])", "g");

  /* Symbols that must be written with a backslash so ordinary prose is safe. */
  const SYMBOL = {
    alpha: "α", beta: "β", gamma: "γ",
    times: "×", pm: "±", mp: "∓", to: "→", from: "←", eq: "⇌", implies: "⇒",
    le: "≤", ge: "≥", ne: "≠", approx: "≈", prop: "∝", infty: "∞",
    deg: "°", degC: "°C", degF: "°F", ohm: "Ω", hbar: "ℏ", cdot: "·",
    dot: "·", perp: "⊥", parallel: "∥", angle: "∠", sqrtsym: "√",
    into: "⊗", outof: "⊙", sum: "Σ", partial: "∂", nbsp: " ",
    /* Aliases for the spellings the banks actually used. `\propto` and `\cdots`
       were being written in content and printed as literal text. */
    propto: "∝", cdots: "⋯", ldots: "…"
  };

  /* Function names, set upright with a thin space before the argument — which is
     what distinguishes sin θ from the product s·i·n·θ.

     These were missing until tests/validate.js began checking for commands the
     renderer does not implement, and the effect was not subtle: `tau = rF\sin theta`
     put a literal backslash on screen — "τ = rF\sin θ" — in the formula sheet, in
     Formula Match and in every question using a trig function. Nothing threw and
     nothing failed; the app had rendered it that way from the beginning. */
  const FUNCS = ["arcsin", "arccos", "arctan", "sinh", "cosh", "tanh",
                 "sin", "cos", "tan", "sec", "csc", "cot",
                 "ln", "log", "exp", "lim", "max", "min"];
  const FUNC_SET = new Set(FUNCS);
  /* Commands that take braced arguments, kept out of the prefix-trimming above. */
  const STRUCTURAL = new Set(["f", "frac", "sqrt", "root", "nuc", "v", "vec",
                              "u", "unit", "ovl", "bar", "text", "tx", "left", "right"]);
  const THIN_SPACE = "\u2009";

  const RADICAL_SVG =
    '<svg viewBox="0 0 12 100" preserveAspectRatio="none" aria-hidden="true">' +
    '<path d="M0.5,62 L4,56 L7,95 L11.5,3" fill="none" stroke="currentColor" ' +
    'stroke-width="4" vector-effect="non-scaling-stroke" ' +
    'stroke-linecap="round" stroke-linejoin="round"/></svg>';

  /** Read a {...}-delimited group starting at src[i] (which must be "{").
      Returns { body, next } with the index just past the closing brace. */
  function group(src, i) {
    if (src[i] !== "{") return null;
    let depth = 0;
    for (let j = i; j < src.length; j++) {
      if (src[j] === "{") depth++;
      else if (src[j] === "}") {
        depth--;
        if (depth === 0) return { body: src.slice(i + 1, j), next: j + 1 };
      }
    }
    return null;                      // unbalanced — treat the brace as literal
  }

  /* A bare (unbraced) script is a signed run of digits, or a single letter.
     Anything longer needs braces. This is what makes `m_1m_2` two subscripted
     symbols rather than a subscript reading "1m", and still lets `10^-19` and
     `s^-1` work without ceremony. */
  function bareScript(src, i) {
    let j = i;
    if (src[j] === "-" || src[j] === "+" || src[j] === "−") j++;
    let k = j;
    while (k < src.length && src[k] >= "0" && src[k] <= "9") k++;
    if (k > j) return { body: src.slice(i, k), next: k };
    if (j === i && /[A-Za-z]/.test(src[i] || "")) return { body: src[i], next: i + 1 };
    return null;
  }

  function textRun(s) {
    return s.replace(GREEK_RE, m => GREEK[m]);
  }

  /* The escaped-entity guard: escapeHtml has already turned & into &amp;, so a
     run of text may contain `&amp;` / `&lt;` etc. Greek substitution is a
     word-boundary match on Latin letters, which would happily rewrite the
     `lt` inside `&lt;`. Split entities out and pass them through untouched. */
  const ENTITY_RE = /&(?:amp|lt|gt|quot|#39);/g;
  function safeText(s) {
    let out = "", last = 0, m;
    ENTITY_RE.lastIndex = 0;
    while ((m = ENTITY_RE.exec(s))) {
      out += textRun(s.slice(last, m.index)) + m[0];
      last = m.index + m[0].length;
    }
    return out + textRun(s.slice(last));
  }

  /** Parse already-escaped source into markup. */
  function parse(src) {
    let out = "", buf = "";
    const flush = () => { if (buf) { out += safeText(buf); buf = ""; } };

    for (let i = 0; i < src.length; ) {
      const c = src[i];

      if (c === "\\") {
        const name = /^[A-Za-z]+/.exec(src.slice(i + 1));
        /* Longest KNOWN prefix, not the longest run of letters. `\\DeltaT` means ΔT and
           `\\sigmaT^4` means σT⁴ — greedy matching read those as the commands "DeltaT"
           and "sigmaT", found neither, and printed the backslash. Structural commands
           (\\f, \\sqrt, …) are matched below on the full name first, so this only ever
           trims a trailing run that is not part of any command. */
        let cmd = name ? name[0] : "";
        if (cmd && SYMBOL[cmd] === undefined && GREEK[cmd] === undefined &&
            !FUNC_SET.has(cmd) && !STRUCTURAL.has(cmd)) {
          for (let n = cmd.length - 1; n >= 1; n--) {
            const head = cmd.slice(0, n);
            if (SYMBOL[head] !== undefined || GREEK[head] !== undefined || FUNC_SET.has(head)) {
              cmd = head; break;
            }
          }
        }

        if (cmd === "f" || cmd === "frac") {
          const a = group(src, i + 1 + cmd.length);
          const b = a && group(src, a.next);
          if (b) {
            flush();
            out += '<span class="frac"><span class="num">' + parse(a.body) +
                   '</span><span class="den">' + parse(b.body) + "</span></span>";
            i = b.next; continue;
          }
        } else if (cmd === "sqrt" || cmd === "root") {
          const a = group(src, i + 1 + cmd.length);
          if (a) {
            flush();
            /* `.body` must be a flex box so the overline is drawn at the top of the
               content rather than at the line-box top (otherwise it strikes through a
               fraction underneath). But that makes every child of it a flex ITEM —
               which silently broke `\sqrt{u^2 + 2as}`: the superscript became its own
               item, got vertically centred, and lost its raise, and the spaces
               between the runs collapsed. Wrapping the content in one inline-block
               gives the flex box a single child, so everything inside lays out as
               ordinary inline text again. */
            out += '<span class="sqrt"><span class="rad">' + RADICAL_SVG +
                   '</span><span class="body"><span class="rbody">' + parse(a.body) +
                   "</span></span></span>";
            i = a.next; continue;
          }
        } else if (cmd === "nuc") {
          const a = group(src, i + 4);
          const b = a && group(src, a.next);
          if (b) {
            flush();
            out += '<span class="updown"><span>' + parse(a.body) +
                   "</span><span>" + parse(b.body) + "</span></span>";
            i = b.next; continue;
          }
        } else if (cmd === "v" || cmd === "vec") {
          const a = group(src, i + 1 + cmd.length);
          if (a) {
            flush();
            out += '<span class="vec">' + parse(a.body) + "</span>";
            i = a.next; continue;
          }
        } else if (cmd === "u" || cmd === "unit") {
          const a = group(src, i + 1 + cmd.length);
          if (a) {
            flush();
            out += '<span class="unit">' + parse(a.body) + "</span>";
            i = a.next; continue;
          }
        } else if (cmd === "text" || cmd === "tx") {
          /* Words inside working — "North:", "at the top:". Without this the source
             `\text{North: }` reached the screen verbatim, backslash and braces and
             all, in every worked example that used it. Nothing failed, because
             nothing checked for a command the renderer does not know; the validator
             now does. */
          const a = group(src, i + 1 + cmd.length);
          if (a) {
            flush();
            out += '<span class="mtext">' + parse(a.body) + "</span>";
            i = a.next; continue;
          }
        } else if (cmd === "ovl" || cmd === "bar") {
          const a = group(src, i + 1 + cmd.length);
          if (a) {
            flush();
            out += '<span class="ovl">' + parse(a.body) + "</span>";
            i = a.next; continue;
          }
        } else if (cmd === "left" || cmd === "right") {
          /* Size-matched delimiters are not worth a layout pass here: the
             delimiter that follows is emitted as an ordinary character, which is
             what these expressions were meant to look like. Swallowing the command
             is the whole fix — unswallowed, it printed "\\left(" on the screen. */
          i += 1 + cmd.length; continue;
        } else if (cmd && FUNC_SET.has(cmd)) {
          /* Thin space before the name when something runs into it (rF sin θ), and
             none after it when an exponent follows, so `\\tan^-1` sets as tan⁻¹ rather
             than tan ⁻¹. */
          const lead = /[0-9A-Za-z)\]]$/.test(buf) ? THIN_SPACE : "";
          const after = src[i + 1 + cmd.length];
          const trail = (after === "^" || after === "_" || after === undefined ||
                         /\s/.test(after)) ? "" : THIN_SPACE;
          buf += lead;
          flush();
          out += '<span class="mfunc">' + cmd + "</span>" + trail;
          i += 1 + cmd.length; continue;
        } else if (cmd && SYMBOL[cmd] !== undefined) {
          buf += SYMBOL[cmd];
          i += 1 + cmd.length; continue;
        } else if (cmd && GREEK[cmd] !== undefined) {
          buf += GREEK[cmd];
          i += 1 + cmd.length; continue;
        }
        // Unknown escape: emit the backslash literally rather than eating input.
        buf += "\\"; i++; continue;
      }

      if (c === "^" || c === "_") {
        const cls = c === "^" ? "sup" : "sub";
        const g = group(src, i + 1) || bareScript(src, i + 1);
        if (g) {
          flush();
          out += '<span class="' + cls + '">' + parse(g.body) + "</span>";
          i = g.next; continue;
        }
      }

      buf += c; i++;
    }
    flush();
    return out;
  }

  /** Render notation source to HTML. Escapes first — never pass HTML in. */
  function math(src) {
    if (src === null || src === undefined) return "";
    return parse(escapeHtml(String(src)));
  }

  /** Strip notation to readable plain text: for aria-labels, the duplicate
      checker, and anywhere a string comparison is wanted rather than markup. */
  function mathPlain(src) {
    if (src === null || src === undefined) return "";
    let s = String(src);
    // Fractions read as "a/b"; wrap the parts so 1/(u+v) does not become 1/u+v.
    for (let pass = 0; pass < 8; pass++) {
      const before = s;
      s = s.replace(/\\(?:f|frac)\{([^{}]*)\}\{([^{}]*)\}/g, (_, a, b) =>
        (/[+\-\s]/.test(a.trim()) ? "(" + a + ")" : a) + "/" +
        (/[+\-\s]/.test(b.trim()) ? "(" + b + ")" : b));
      s = s.replace(/\\(?:sqrt|root)\{([^{}]*)\}/g, "sqrt($1)");
      s = s.replace(/\\nuc\{([^{}]*)\}\{([^{}]*)\}/g, "$1-$2 ");
      s = s.replace(/\\(?:v|vec|u|unit|ovl|bar|text|tx)\{([^{}]*)\}/g, "$1");
      if (s === before) break;
    }
    /* The same longest-known-prefix rule as the renderer, so `\\DeltaT` reads as "ΔT"
       here too. math() and mathPlain() disagreeing is how a comparison between
       rendered text and plain text fails silently. */
    s = s.replace(/\\([A-Za-z]+)/g, (m, cmd) => {
      for (let n = cmd.length; n >= 1; n--) {
        const head = cmd.slice(0, n), rest = cmd.slice(n);
        if (SYMBOL[head] !== undefined) return SYMBOL[head] + rest;
        if (GREEK[head] !== undefined) return GREEK[head] + rest;
        if (FUNC_SET.has(head)) return " " + head + " " + rest;
        if (head === "left" || head === "right") return rest;
      }
      return m;
    });
    s = s.replace(GREEK_RE, m => GREEK[m]);
    s = s.replace(/[\^_]\{([^{}]*)\}/g, "$1").replace(/[\^_]/g, "");
    return s.replace(/\s+/g, " ").trim();
  }

  /* ── numbers ─────────────────────────────────────────────── */

  /** Round to n significant figures. */
  function sigFig(x, n) {
    if (!isFinite(x) || x === 0) return 0;
    const mag = Math.ceil(Math.log10(Math.abs(x)));
    const factor = Math.pow(10, n - mag);
    return Math.round(x * factor) / factor;
  }

  /** Format to n significant figures as notation source, using scientific
      notation outside 1e-3 … 1e6 so `\u{}` and `^` render it properly. */
  function fmtSig(x, n) {
    const sf = n || 3;
    if (!isFinite(x)) return String(x);
    if (x === 0) return "0";
    const exp = Math.floor(Math.log10(Math.abs(x)));
    if (exp >= -3 && exp < 6) {
      const v = sigFig(x, sf);
      // Decimals needed to show `sf` significant figures at this magnitude.
      const dp = Math.max(0, sf - 1 - Math.floor(Math.log10(Math.abs(v)) + 1e-9));
      return v.toFixed(Math.min(dp, 12));
    }
    const mant = sigFig(x / Math.pow(10, exp), sf);
    return mant.toFixed(sf - 1) + " \\times 10^{" + exp + "}";
  }

  /** Parse a student-typed number: accepts 1.2e5, 1.2 × 10^5, 1.2x10^5, commas. */
  function parseNum(input) {
    if (typeof input === "number") return input;
    let s = String(input).trim().toLowerCase();
    if (!s) return NaN;
    s = s.replace(/,/g, "").replace(/\s+/g, "")
         .replace(/−/g, "-")                       // unicode minus
         .replace(/[×x*]10\^?/g, "e")
         .replace(/·10\^?/g, "e")
         .replace(/10\^/g, "1e");
    // Bare superscript digits, e.g. pasted "3.0×10⁸".
    const SUPER = { "⁰":"0","¹":"1","²":"2","³":"3","⁴":"4",
                    "⁵":"5","⁶":"6","⁷":"7","⁸":"8","⁹":"9",
                    "⁻":"-","⁺":"+" };
    s = s.replace(/[⁰¹²³⁴-⁹⁺⁻]+/g,
                  m => m.split("").map(c => SUPER[c]).join(""));
    const v = parseFloat(s);
    return isFinite(v) ? v : NaN;
  }

  /** Compare a typed answer to the expected value within a fractional tolerance. */
  function numClose(input, expected, tolRel) {
    const v = parseNum(input);
    if (!isFinite(v)) return false;
    const tol = Math.abs(expected * (tolRel === undefined ? 0.02 : tolRel));
    return Math.abs(v - expected) <= Math.max(tol, Math.abs(expected) * 1e-9, 1e-12);
  }

  /* ── dates, hashing, seeded RNG ───────────────────────────── */

  /** Local date key (YYYY-MM-DD) — deliberately local, so streaks match the user's day. */
  function dayKey(d) {
    const t = d || new Date();
    const p = n => String(n).padStart(2, "0");
    return `${t.getFullYear()}-${p(t.getMonth() + 1)}-${p(t.getDate())}`;
  }

  function daysBetween(aKey, bKey) {
    return Math.round((new Date(bKey + "T00:00:00") - new Date(aKey + "T00:00:00")) / 86400000);
  }

  function hash(str) {
    let h = 2166136261;
    for (let i = 0; i < String(str).length; i++) {
      h ^= String(str).charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return Math.abs(h);
  }

  /** Seeded PRNG. Generators use one of these so a question id reproduces exactly. */
  function seededRandom(seed) {
    let s = Math.abs(Math.floor(seed)) % 2147483647;
    if (s <= 0) s += 2147483646;
    return () => (s = (s * 16807) % 2147483647) / 2147483647;
  }

  function seededShuffle(arr, rng) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  const fmtTime = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
  const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0);
  const deg = d => (d * Math.PI) / 180;
  const rad = r => (r * 180) / Math.PI;

  return { $, $$, el, mel, clamp, randInt, pick, shuffle, sample, escapeHtml,
           math, mathPlain, GREEK, SYMBOL,
           sigFig, fmtSig, parseNum, numClose,
           dayKey, daysBetween, hash, seededRandom, seededShuffle,
           fmtTime, pct, deg, rad };
})();
