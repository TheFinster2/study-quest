/* Biosphere — js/core/genetics.js
   Crosses, Punnett squares, pedigree generation and inference.

   Everything in here is exactly computable, so everything in here is checked
   twice (brief §5.2): the grid is enumerated AND the same answer is derived by
   multiplying independent single-locus probabilities. A generated pedigree is
   only shipped once inference against *every* pattern leaves exactly one
   survivor.

   Exposes: window.BIO.Genetics  (module.exports under Node) */
(function (root) {
  "use strict";

  var BIO = root.BIO = root.BIO || {};
  var U = BIO.U || (typeof require !== "undefined" ? require("./util.js") : null);
  var G = {};

  /* ═══════════════════════════════════════════════════════════════════
     1. Genotypes and gametes
     ═══════════════════════════════════════════════════════════════════ */

  /* An allele pair is stored as a 2-element array, canonically ordered.
     Autosomal: uppercase before lowercase, then alphabetical.
     ABO:       A, B before i.
     Sex-linked: the X-bearing allele first, Y last. */

  var ABO_ORDER = { A: 0, B: 1, i: 2 };

  G.orderPair = function (a, b, kind) {
    if (kind === "abo") return (ABO_ORDER[a] <= ABO_ORDER[b]) ? [a, b] : [b, a];
    if (kind === "sex") {
      if (a === "Y") return [b, a];
      if (b === "Y") return [a, b];
      return cmpAllele(a, b) <= 0 ? [a, b] : [b, a];
    }
    return cmpAllele(a, b) <= 0 ? [a, b] : [b, a];
  };

  function cmpAllele(a, b) {
    var ua = a === a.toUpperCase(), ub = b === b.toUpperCase();
    if (ua !== ub) return ua ? -1 : 1;
    return a < b ? -1 : a > b ? 1 : 0;
  }

  /* Parse a genotype written the way a student writes it.
       "RrYy"        → autosomal, two loci
       "Rr"          → autosomal, one locus
       "X^H X^h"     → sex-linked (also accepts "XHXh")
       "X^h Y"       → sex-linked male   (also "XhY")
       "Ai" / "AB"   → ABO
     Returns [[a,b], …] one pair per locus. */
  G.parseGenotype = function (str, kind) {
    var s = String(str).replace(/[\s^]/g, "");
    if (kind === "sex") {
      var toks = [], i = 0;
      while (i < s.length) {
        if (s[i] === "X") {
          if (i + 1 < s.length && /[A-Za-z]/.test(s[i + 1]) && s[i + 1] !== "X" && s[i + 1] !== "Y") {
            toks.push(s[i + 1]); i += 2;
          } else { toks.push("+"); i += 1; }
        } else if (s[i] === "Y") { toks.push("Y"); i += 1; }
        else i += 1;
      }
      if (toks.length !== 2) throw new Error("Bad sex-linked genotype: " + str);
      return [G.orderPair(toks[0], toks[1], "sex")];
    }
    if (kind === "abo") {
      var cs = s.split("").filter(function (c) { return /[ABi]/.test(c); });
      if (cs.length !== 2) throw new Error("Bad ABO genotype: " + str);
      return [G.orderPair(cs[0], cs[1], "abo")];
    }
    if (s.length % 2 !== 0) throw new Error("Bad genotype: " + str);
    var out = [];
    for (var k = 0; k < s.length; k += 2) out.push(G.orderPair(s[k], s[k + 1]));
    return out;
  };

  G.pairStr = function (p, kind) {
    if (kind === "sex") return p.map(function (a) { return a === "Y" ? "Y" : "X" + (a === "+" ? "" : a); }).join("");
    return p.join("");
  };

  G.genoStr = function (loci, kind) {
    return loci.map(function (p) { return G.pairStr(p, kind); }).join("");
  };

  /* Gametes: one allele per locus, cartesian product. Duplicates are kept —
     a homozygote makes two identical gametes and the grid needs both rows. */
  G.gametes = function (loci, kind) {
    var out = [[]];
    loci.forEach(function (pair) {
      var next = [];
      out.forEach(function (g) {
        pair.forEach(function (al) { next.push(g.concat([al])); });
      });
      out = next;
    });
    return out.map(function (g) {
      return { alleles: g, label: kind === "sex" ? G.pairStr([g[0], g[0]], "sex").slice(0, g[0] === "Y" ? 1 : 2) : g.join("") };
    }).map(function (g) {
      if (kind === "sex") g.label = g.alleles[0] === "Y" ? "Y" : "X" + (g.alleles[0] === "+" ? "" : g.alleles[0]);
      return g;
    });
  };

  /* ═══════════════════════════════════════════════════════════════════
     2. Phenotypes
     ═══════════════════════════════════════════════════════════════════ */

  /* A locus spec:
       { sym:"R", type:"complete", dom:"round", rec:"wrinkled" }
       { sym:"C", type:"incomplete", homDom:"red", het:"pink", homRec:"white" }
       { sym:"C", type:"codominant", homDom:"red", het:"roan", homRec:"white" }
       { type:"abo" }
       { type:"sex", allele:"H", dom:"normal clotting", rec:"haemophilia" , xdom:false } */

  G.phenotypeOfLocus = function (pair, spec) {
    var t = spec.type;
    if (t === "abo") {
      var s = pair.slice().sort(function (a, b) { return ABO_ORDER[a] - ABO_ORDER[b]; }).join("");
      if (s === "AA" || s === "Ai") return "blood group A";
      if (s === "BB" || s === "Bi") return "blood group B";
      if (s === "AB") return "blood group AB";
      return "blood group O";
    }
    if (t === "sex") {
      var isMale = pair[1] === "Y";
      var xs = pair.filter(function (a) { return a !== "Y"; });
      var hasDom = xs.some(function (a) { return a === a.toUpperCase() && a !== "+"; }) || xs.some(function (a) { return a === "+"; });
      // "+" is the wild-type dominant marker when no letter was supplied
      var dominant = xs.some(function (a) { return a === "+" || (a === a.toUpperCase()); });
      var pheno = spec.xdom
        ? (dominant ? spec.dom : spec.rec)
        : (xs.every(function (a) { return a === a.toLowerCase() && a !== "+"; }) ? spec.rec : spec.dom);
      return (isMale ? "male " : "female ") + pheno;
    }
    var upper = pair.filter(function (a) { return a === a.toUpperCase(); }).length;
    if (t === "incomplete" || t === "codominant") {
      return upper === 2 ? spec.homDom : upper === 1 ? spec.het : spec.homRec;
    }
    return upper >= 1 ? spec.dom : spec.rec;
  };

  G.phenotype = function (loci, specs) {
    return loci.map(function (p, i) { return G.phenotypeOfLocus(p, specs[i]); }).join(" ");
  };

  /* The conventional order phenotypes are written in, which is NOT the order
     they happen to appear in the grid. A monohybrid incomplete-dominance cross
     is written 1:2:1 (red : pink : white), never 2:1:1 — ordering by frequency
     would print a ratio no marking guide would accept. */
  function locusPhenotypeOrder(spec) {
    if (spec.type === "abo") return ["blood group A", "blood group B", "blood group AB", "blood group O"];
    if (spec.type === "sex") {
      var d = spec.dom, rc = spec.rec;
      return ["female " + d, "female " + rc, "male " + d, "male " + rc];
    }
    if (spec.type === "incomplete" || spec.type === "codominant") return [spec.homDom, spec.het, spec.homRec];
    return [spec.dom, spec.rec];
  }

  G.phenotypeCatalogue = function (specs) {
    var out = [""];
    specs.forEach(function (spec, i) {
      var next = [];
      out.forEach(function (prefix) {
        locusPhenotypeOrder(spec).forEach(function (p) {
          next.push(i === 0 ? p : prefix + " " + p);
        });
      });
      out = next;
    });
    return out;
  };

  /* ═══════════════════════════════════════════════════════════════════
     3. cross() — the contract from brief §5.2
     ═══════════════════════════════════════════════════════════════════ */

  G.cross = function (spec) {
    var kind = spec.kind || "auto";              // "auto" | "sex" | "abo"
    var specs = spec.loci;
    var A = G.parseGenotype(spec.parents[0], kind);
    var B = G.parseGenotype(spec.parents[1], kind);
    if (A.length !== specs.length || B.length !== specs.length) throw new Error("locus count mismatch");

    var gA = G.gametes(A, kind), gB = G.gametes(B, kind);

    var grid = [], genotypes = {}, phenotypes = {}, total = 0;
    for (var r = 0; r < gA.length; r++) {
      var row = [];
      for (var c = 0; c < gB.length; c++) {
        var child = [];
        for (var L = 0; L < specs.length; L++) {
          child.push(G.orderPair(gA[r].alleles[L], gB[c].alleles[L], kind === "sex" ? "sex" : kind === "abo" ? "abo" : "auto"));
        }
        var gs = G.genoStr(child, kind);
        var ph = G.phenotype(child, specs);
        row.push({ geno: gs, pheno: ph, loci: child });
        genotypes[gs] = (genotypes[gs] || 0) + 1;
        phenotypes[ph] = (phenotypes[ph] || 0) + 1;
        total++;
      }
      grid.push(row);
    }

    var catalogue = G.phenotypeCatalogue(specs);
    var phenOrder = catalogue.filter(function (p) { return phenotypes[p] > 0; });
    // anything the catalogue did not predict still has to be reported
    Object.keys(phenotypes).forEach(function (p) { if (phenOrder.indexOf(p) < 0) phenOrder.push(p); });
    var genoOrder = Object.keys(genotypes).sort();

    return {
      kind: kind,
      parents: [G.genoStr(A, kind), G.genoStr(B, kind)],
      gametesA: gA.map(function (g) { return g.label; }),
      gametesB: gB.map(function (g) { return g.label; }),
      grid: grid,
      total: total,
      genotypes: genotypes,
      phenotypes: phenotypes,
      phenotypeOrder: phenOrder,
      genotypeOrder: genoOrder,
      ratio: U.normaliseRatio(phenOrder.map(function (k) { return phenotypes[k]; })),
      ratioGeno: U.normaliseRatio(genoOrder.map(function (k) { return genotypes[k]; })),
      /* p(pheno) as an exact fraction of the grid */
      pPheno: function (name) { return (phenotypes[name] || 0) / total; },
      pGeno: function (name) { return (genotypes[name] || 0) / total; }
    };
  };

  /* ─── Route B: independent single-locus probabilities ───────────────
     Same answer, different arithmetic. genetics test asserts A === B. */
  G.crossByProbability = function (spec) {
    var kind = spec.kind || "auto";
    var specs = spec.loci;
    var A = G.parseGenotype(spec.parents[0], kind);
    var B = G.parseGenotype(spec.parents[1], kind);

    // per-locus genotype distribution
    var perLocus = specs.map(function (ls, i) {
      var pa = A[i], pb = B[i], dist = {};
      pa.forEach(function (x) {
        pb.forEach(function (y) {
          var pair = G.orderPair(x, y, kind === "sex" ? "sex" : kind === "abo" ? "abo" : "auto");
          var key = G.pairStr(pair, kind);
          dist[key] = (dist[key] || 0) + 0.25;
        });
      });
      return { dist: dist, spec: ls, index: i };
    });

    // convolve loci into whole-genotype and phenotype distributions
    var geno = { "": 1 };
    perLocus.forEach(function (L) {
      var next = {};
      Object.keys(geno).forEach(function (g) {
        Object.keys(L.dist).forEach(function (k) {
          next[g + k] = (next[g + k] || 0) + geno[g] * L.dist[k];
        });
      });
      geno = next;
    });

    var pheno = {};
    Object.keys(geno).forEach(function (g) {
      var loci = G.parseGenotype(g, kind);
      var p = G.phenotype(loci, specs);
      pheno[p] = (pheno[p] || 0) + geno[g];
    });

    return { genotypes: geno, phenotypes: pheno };
  };

  /* Compare the two routes. Returns null when they agree, else a description. */
  G.verifyCross = function (spec) {
    var a = G.cross(spec), b = G.crossByProbability(spec);
    var keysA = Object.keys(a.phenotypes).sort(), keysB = Object.keys(b.phenotypes).sort();
    if (keysA.join("|") !== keysB.join("|")) return "phenotype sets differ: " + keysA + " vs " + keysB;
    for (var i = 0; i < keysA.length; i++) {
      var pa = a.phenotypes[keysA[i]] / a.total, pb = b.phenotypes[keysA[i]];
      if (Math.abs(pa - pb) > 1e-9) return "phenotype p mismatch for " + keysA[i] + ": " + pa + " vs " + pb;
    }
    var gA = Object.keys(a.genotypes).sort(), gB = Object.keys(b.genotypes).sort();
    if (gA.join("|") !== gB.join("|")) return "genotype sets differ: " + gA + " vs " + gB;
    for (var j = 0; j < gA.length; j++) {
      var qa = a.genotypes[gA[j]] / a.total, qb = b.genotypes[gA[j]];
      if (Math.abs(qa - qb) > 1e-9) return "genotype p mismatch for " + gA[j];
    }
    return null;
  };

  /* Expected ratio for a textbook pattern — the third check. */
  G.expectedRatio = function (spec) {
    var kind = spec.kind || "auto";
    if (kind !== "auto") return null;
    var A = G.parseGenotype(spec.parents[0]), B = G.parseGenotype(spec.parents[1]);
    if (spec.loci.length === 2 &&
        spec.loci.every(function (l) { return l.type === "complete"; }) &&
        isHet(A[0]) && isHet(A[1]) && isHet(B[0]) && isHet(B[1])) return "9:3:3:1";
    if (spec.loci.length === 1 && spec.loci[0].type === "complete" && isHet(A[0]) && isHet(B[0])) return "3:1";
    if (spec.loci.length === 1 && (spec.loci[0].type === "incomplete" || spec.loci[0].type === "codominant") &&
        isHet(A[0]) && isHet(B[0])) return "1:2:1";
    if (spec.loci.length === 1 && spec.loci[0].type === "complete" && isHet(A[0]) && isHomRec(B[0])) return "1:1";
    return null;
    function isHet(p) { return p[0] !== p[1]; }
    function isHomRec(p) { return p[0] === p[1] && p[0] === p[0].toLowerCase(); }
  };

  /* ═══════════════════════════════════════════════════════════════════
     4. Pedigrees
     ═══════════════════════════════════════════════════════════════════ */

  G.PATTERNS = [
    { id: "AR", name: "Autosomal recessive" },
    { id: "AD", name: "Autosomal dominant" },
    { id: "XR", name: "X-linked recessive" },
    { id: "XD", name: "X-linked dominant" },
    { id: "YL", name: "Y-linked" }
  ];

  /* Genotypes allowed for an individual under a pattern, given sex+phenotype. */
  function allowedGenos(ind, pattern) {
    var aff = ind.affected, male = ind.sex === "M";
    switch (pattern) {
      case "AD": return aff ? ["AA", "Aa"] : ["aa"];
      case "AR": return aff ? ["aa"] : ["AA", "Aa"];
      case "XR":
        if (male) return aff ? ["XaY"] : ["XAY"];
        return aff ? ["XaXa"] : ["XAXA", "XAXa"];
      case "XD":
        if (male) return aff ? ["XAY"] : ["XaY"];
        return aff ? ["XAXA", "XAXa"] : ["XaXa"];
      case "YL":
        if (!male) return aff ? [] : ["--"];         // females are never affected
        return aff ? ["YA"] : ["Ya"];
      default: return [];
    }
  }

  function transmissionOK(child, cg, fg, mg, pattern) {
    if (pattern === "AD" || pattern === "AR") {
      var f = fg.split(""), m = mg.split(""), c = cg.split("");
      return (f.indexOf(c[0]) >= 0 && m.indexOf(c[1]) >= 0) ||
             (f.indexOf(c[1]) >= 0 && m.indexOf(c[0]) >= 0);
    }
    if (pattern === "XR" || pattern === "XD") {
      var mAll = xAlleles(mg);
      if (child.sex === "M") {
        // son: X from mother, Y from father
        return mAll.indexOf(xAlleles(cg)[0]) >= 0;
      }
      // daughter: one X from father (he has exactly one), one from mother
      var fA = xAlleles(fg)[0];
      var cA = xAlleles(cg);
      var idx = cA.indexOf(fA);
      if (idx < 0) return false;
      var other = cA[1 - idx];
      return mAll.indexOf(other) >= 0;
    }
    if (pattern === "YL") {
      if (child.sex === "F") return cg === "--";
      return cg === fg;                             // son's Y is his father's Y
    }
    return false;
  }

  function xAlleles(g) {
    // "XAXa" → ["A","a"] ; "XaY" → ["a"]
    var out = [], i = 0;
    while (i < g.length) {
      if (g[i] === "X") { out.push(g[i + 1]); i += 2; }
      else i += 1;
    }
    return out;
  }

  /* Does `pattern` explain this pedigree? Backtracking over genotypes,
     parents assigned before children so constraints prune early.
     `collect` (optional) receives every consistent assignment. */
  G.fits = function (ped, pattern, collect) {
    var inds = topo(ped.individuals);
    var byId = {};
    inds.forEach(function (i) { byId[i.id] = i; });

    var domains = inds.map(function (i) { return allowedGenos(i, pattern); });
    if (domains.some(function (d) { return d.length === 0; })) return false;

    var assign = {}, found = false;

    (function rec(k) {
      if (found && !collect) return;
      if (k === inds.length) {
        found = true;
        if (collect) collect(Object.assign({}, assign));
        return;
      }
      var ind = inds[k];
      for (var d = 0; d < domains[k].length; d++) {
        assign[ind.id] = domains[k][d];
        if (checkLocal(ind)) rec(k + 1);
        if (found && !collect) return;
      }
      delete assign[ind.id];
    })(0);

    return found;

    function checkLocal(ind) {
      // this individual as a child
      if (ind.father && ind.mother && assign[ind.father] && assign[ind.mother]) {
        if (!transmissionOK(ind, assign[ind.id], assign[ind.father], assign[ind.mother], pattern)) return false;
      }
      // this individual as a parent of any already-assigned child
      for (var i = 0; i < inds.length; i++) {
        var c = inds[i];
        if (c.father !== ind.id && c.mother !== ind.id) continue;
        if (!assign[c.id] || !assign[c.father] || !assign[c.mother]) continue;
        if (!transmissionOK(c, assign[c.id], assign[c.father], assign[c.mother], pattern)) return false;
      }
      return true;
    }
  };

  function topo(list) {
    var byId = {}; list.forEach(function (i) { byId[i.id] = i; });
    var out = [], mark = {};
    function visit(i) {
      if (mark[i.id]) return;
      mark[i.id] = 1;
      if (i.father && byId[i.father]) visit(byId[i.father]);
      if (i.mother && byId[i.mother]) visit(byId[i.mother]);
      out.push(i);
    }
    list.forEach(visit);
    return out;
  }

  /* Which patterns are consistent? The question only has an answer when this
     returns exactly one. (brief §5.2) */
  G.consistentPatterns = function (ped, candidates) {
    var list = candidates || G.PATTERNS.map(function (p) { return p.id; });
    return list.filter(function (p) { return G.fits(ped, p); });
  };

  /* ─── an inconvenient truth, stated once so the modes can be honest ──
     Autosomal recessive explains every pedigree that X-linked recessive
     explains, and autosomal dominant explains every pedigree that X-linked
     dominant or Y-linked explains. (XR forbids affected×affected→unaffected,
     which is the only thing that can ever exclude AR; likewise XD/YL are
     strictly more constrained than AD.) So a pedigree alone can never *prove*
     sex linkage — only make it the best explanation.

     Consequence for the app: "name the pattern" is generated only where a
     genuinely unique answer exists. Where the intended pattern is X- or
     Y-linked, the question must supply the extra fact ("the gene is on the X
     chromosome") that narrows the candidate set, or ask the exactly-checkable
     question instead — which patterns the pedigree *rules out*. Never dress a
     best-guess up as the only answer. */
  G.CANDIDATE_SETS = {
    all:  ["AR", "AD", "XR", "XD", "YL"],
    auto: ["AR", "AD"],
    xlinked: ["XR", "XD"]
  };

  G.uniquelyNameable = function (patternId) { return patternId === "AR" || patternId === "AD"; };

  /* ─── generation ────────────────────────────────────────────────────
     Build a family from a known pattern, then prove uniqueness by inference.
     Anything ambiguous is discarded and regenerated. */

  function founderGeno(pattern, sex, rnd) {
    var r = function () { return U.rand(rnd); };
    switch (pattern) {
      case "AD": return r() < 0.5 ? "Aa" : "aa";
      case "AR": return r() < 0.55 ? "Aa" : (r() < 0.5 ? "aa" : "AA");
      case "XR": return sex === "M" ? (r() < 0.35 ? "XaY" : "XAY") : (r() < 0.55 ? "XAXa" : (r() < 0.3 ? "XaXa" : "XAXA"));
      case "XD": return sex === "M" ? (r() < 0.4 ? "XAY" : "XaY") : (r() < 0.5 ? "XAXa" : "XaXa");
      case "YL": return sex === "M" ? (r() < 0.5 ? "YA" : "Ya") : "--";
    }
  }

  function meiosis(pattern, childSex, fg, mg, rnd) {
    var r = function () { return U.rand(rnd); };
    if (pattern === "AD" || pattern === "AR") {
      return [fg[r() < 0.5 ? 0 : 1], mg[r() < 0.5 ? 0 : 1]].sort(cmpAllele).join("");
    }
    if (pattern === "XR" || pattern === "XD") {
      var mA = xAlleles(mg), fA = xAlleles(fg);
      var fromMum = mA[r() < 0.5 ? 0 : 1];
      if (childSex === "M") return "X" + fromMum + "Y";
      var pair = [fA[0], fromMum].sort(cmpAllele);
      return "X" + pair[0] + "X" + pair[1];
    }
    return childSex === "M" ? fg : "--";
  }

  function affectedFromGeno(pattern, sex, g) {
    switch (pattern) {
      case "AD": return g !== "aa";
      case "AR": return g === "aa";
      case "XR": return sex === "M" ? g === "XaY" : g === "XaXa";
      case "XD": return sex === "M" ? g === "XAY" : g !== "XaXa";
      case "YL": return sex === "M" && g === "YA";
    }
  }

  /* A pedigree: 3 generations, 2 founder couples, 2–4 children each, one
     grandchild sibship. Shapes vary so the drawing does not become familiar. */
  G.generatePedigree = function (pattern, seed, candidates) {
    var cands = candidates || G.CANDIDATE_SETS.all;
    if (cands.indexOf(pattern) < 0) throw new Error("intended pattern is not in the candidate set");
    var rnd = U.rng(seed);
    var attempts = 0;

    while (attempts < 600) {
      attempts++;
      var ped = buildOnce(pattern, rnd);
      if (!ped) continue;
      var affected = ped.individuals.filter(function (i) { return i.affected; }).length;
      if (affected < 2 || affected > ped.individuals.length - 3) continue;
      var fits = G.consistentPatterns(ped, cands);
      if (fits.length === 1 && fits[0] === pattern) {
        ped.pattern = pattern;
        ped.candidates = cands.slice();
        ped.seed = seed;
        ped.attempts = attempts;
        ped.allConsistent = G.consistentPatterns(ped, G.CANDIDATE_SETS.all);
        return ped;
      }
    }
    return null;
  };

  /* For "which patterns does this pedigree rule out?" — any pedigree will do,
     because the answer is the exact complement of the consistent set. */
  G.generatePedigreeForElimination = function (pattern, seed) {
    var rnd = U.rng(seed);
    for (var a = 0; a < 400; a++) {
      var ped = buildOnce(pattern, rnd);
      if (!ped) continue;
      var affected = ped.individuals.filter(function (i) { return i.affected; }).length;
      if (affected < 2 || affected > ped.individuals.length - 3) continue;
      var fits = G.consistentPatterns(ped, G.CANDIDATE_SETS.all);
      // useful only if it excludes something and leaves something
      if (fits.length >= 1 && fits.length <= 4 && fits.indexOf(pattern) >= 0) {
        ped.pattern = pattern;
        ped.seed = seed;
        ped.allConsistent = fits;
        ped.excluded = G.CANDIDATE_SETS.all.filter(function (p) { return fits.indexOf(p) < 0; });
        return ped;
      }
    }
    return null;
  };

  function buildOnce(pattern, rnd) {
    var inds = [], n = 0;
    function add(o) { o.id = "I" + (++n); inds.push(o); return o; }

    // generation I — two founder couples
    var g1 = [];
    for (var c = 0; c < 2; c++) {
      var dad = add({ sex: "M", gen: 1, geno: founderGeno(pattern, "M", rnd) });
      var mum = add({ sex: "F", gen: 1, geno: founderGeno(pattern, "F", rnd) });
      g1.push([dad, mum]);
    }

    // generation II — children of each couple
    var g2 = [];
    g1.forEach(function (couple) {
      var k = U.randInt(2, 3, rnd);
      var kids = [];
      for (var i = 0; i < k; i++) {
        var sex = U.rand(rnd) < 0.5 ? "M" : "F";
        var g = meiosis(pattern, sex, couple[0].geno, couple[1].geno, rnd);
        kids.push(add({ sex: sex, gen: 2, father: couple[0].id, mother: couple[1].id, geno: g }));
      }
      g2.push({ couple: couple, kids: kids });
    });

    // one child from family A marries one child from family B (opposite sexes)
    var a = U.pick(g2[0].kids, rnd);
    var mate = g2[1].kids.filter(function (k) { return k.sex !== a.sex; });
    if (!mate.length) return null;
    var b = U.pick(mate, rnd);

    // generation III
    var father = a.sex === "M" ? a : b, mother = a.sex === "M" ? b : a;
    var kk = U.randInt(2, 4, rnd);
    for (var j = 0; j < kk; j++) {
      var s3 = U.rand(rnd) < 0.5 ? "M" : "F";
      var g3 = meiosis(pattern, s3, father.geno, mother.geno, rnd);
      add({ sex: s3, gen: 3, father: father.id, mother: mother.id, geno: g3 });
    }

    inds.forEach(function (i) { i.affected = affectedFromGeno(pattern, i.sex, i.geno); });

    return {
      individuals: inds.map(function (i) {
        return { id: i.id, sex: i.sex, gen: i.gen, father: i.father || null, mother: i.mother || null, affected: i.affected, _geno: i.geno };
      }),
      couples: [[father.id, mother.id]]
    };
  }

  /* Given a pedigree whose pattern is now known, find a couple whose genotypes
     are the SAME in every consistent assignment. Only then does "probability
     the next child is affected" have one exact answer. */
  G.ASSIGN_CAP = 20000;

  G.uniqueCouple = function (ped, pattern) {
    var assigns = [], truncated = false;
    G.fits(ped, pattern, function (a) {
      if (assigns.length < G.ASSIGN_CAP) assigns.push(a); else truncated = true;
    });
    // A truncated enumeration cannot prove that a genotype is the same in
    // *every* consistent assignment, so refuse rather than guess.
    if (truncated || !assigns.length) return null;

    var byId = {}; ped.individuals.forEach(function (i) { byId[i.id] = i; });
    var pairs = {};
    ped.individuals.forEach(function (i) {
      if (i.father && i.mother) pairs[i.father + "|" + i.mother] = [i.father, i.mother];
    });

    var out = [];
    Object.keys(pairs).forEach(function (k) {
      var f = pairs[k][0], m = pairs[k][1];
      var fg = assigns[0][f], mg = assigns[0][m];
      var stable = assigns.every(function (a) { return a[f] === fg && a[m] === mg; });
      if (stable) out.push({ father: f, mother: m, fatherGeno: fg, motherGeno: mg });
    });
    return out.length ? out : null;
  };

  /* Exact probability the next child of this couple is affected, and the
     sex-split version, computed straight from a 4-cell Punnett. */
  G.childRisk = function (pattern, fg, mg) {
    var kids = [];
    if (pattern === "AD" || pattern === "AR") {
      fg.split("").forEach(function (x) {
        mg.split("").forEach(function (y) {
          var g = [x, y].sort(cmpAllele).join("");
          kids.push({ sex: "?", geno: g, affected: affectedFromGeno(pattern, "?", g) });
        });
      });
      var aff = kids.filter(function (k) { return k.affected; }).length;
      return { p: aff / kids.length, pMale: aff / kids.length, pFemale: aff / kids.length, cells: kids };
    }
    if (pattern === "XR" || pattern === "XD") {
      var fA = xAlleles(fg)[0], mA = xAlleles(mg);
      mA.forEach(function (mx) {
        var d = "X" + [fA, mx].sort(cmpAllele).join("X");
        kids.push({ sex: "F", geno: d, affected: affectedFromGeno(pattern, "F", d) });
        var s = "X" + mx + "Y";
        kids.push({ sex: "M", geno: s, affected: affectedFromGeno(pattern, "M", s) });
      });
      var affAll = kids.filter(function (k) { return k.affected; }).length;
      var males = kids.filter(function (k) { return k.sex === "M"; });
      var fem = kids.filter(function (k) { return k.sex === "F"; });
      return {
        p: affAll / kids.length,
        pMale: males.filter(function (k) { return k.affected; }).length / males.length,
        pFemale: fem.filter(function (k) { return k.affected; }).length / fem.length,
        cells: kids
      };
    }
    // Y-linked
    var affY = fg === "YA";
    return { p: affY ? 0.5 : 0, pMale: affY ? 1 : 0, pFemale: 0, cells: [] };
  };

  /* Human-readable clue lines — used by Pedigree Detective's feedback. */
  G.patternEvidence = function (ped, pattern) {
    var byId = {}; ped.individuals.forEach(function (i) { byId[i.id] = i; });
    var notes = [];
    var kids = ped.individuals.filter(function (i) { return i.father && i.mother; });

    kids.forEach(function (k) {
      var f = byId[k.father], m = byId[k.mother];
      if (k.affected && !f.affected && !m.affected)
        notes.push(k.id + " is affected but neither parent is — the trait skips a generation, so it is recessive.");
      if (!k.affected && f.affected && m.affected)
        notes.push(k.id + " is unaffected with two affected parents — that rules out a recessive trait.");
      if (k.sex === "F" && k.affected && !f.affected)
        notes.push(k.id + " is an affected female with an unaffected father — impossible for an X-linked recessive trait.");
      if (k.sex === "F" && !k.affected && f.affected && pattern === "AD")
        notes.push(k.id + " is an unaffected daughter of an affected father — an X-linked dominant father passes his X to every daughter, so that pattern is out.");
    });

    var affF = ped.individuals.filter(function (i) { return i.sex === "F" && i.affected; }).length;
    if (affF) notes.push("Affected females appear, so the trait is not Y-linked.");
    else notes.push("No affected females — worth checking Y-linkage, but check the male-to-male transmission too.");

    return U.uniq(notes).slice(0, 4);
  };

  BIO.Genetics = G;
  if (typeof module !== "undefined" && module.exports) module.exports = G;
})(typeof window !== "undefined" ? window : globalThis);
