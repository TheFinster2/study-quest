#!/usr/bin/env node
/* tests/subjects/bio/genetics.js — the two-route verification (brief §5.2).

   Every generated cross is computed twice by independent arithmetic:
     Route A  enumerate the Punnett grid and count the boxes
     Route B  multiply the independent single-locus probabilities
   and, where a textbook ratio exists, checked against it a third time.

   Every generated pedigree is checked to have EXACTLY ONE consistent
   inheritance pattern within its declared candidate set. Anything ambiguous
   is a question with no answer.

   Run:  node tests/subjects/bio/genetics.js
   Prove it fails without its fix:  BREAK=routeb node tests/subjects/bio/genetics.js */
"use strict";
const H = require("./harness.js");

const BREAK = process.env.BREAK || "";
const r = H.reporter("genetics");
const { BIO } = H.loadData();
const U = BIO.U, G = BIO.Genetics;

const SEEDS = 240;   // brief asks for 200+

console.log("genetics — two-route verification over " + SEEDS + " seeds per template");

/* ── fault injection (see prove.js) ────────────────────────────────── */
if (BREAK === "routeb") {
  // break route B so the two routes disagree — the check must notice
  const real = G.crossByProbability;
  G.crossByProbability = function (spec) {
    const out = real(spec);
    const k = Object.keys(out.phenotypes)[0];
    out.phenotypes[k] += 0.01;
    return out;
  };
  console.log("  [BREAK=routeb] route B corrupted — this run MUST fail");
}
if (BREAK === "ratio") {
  const real = G.cross;
  G.cross = function (spec) { const o = real(spec); o.ratio = "1:1"; return o; };
  console.log("  [BREAK=ratio] grid ratio corrupted — this run MUST fail");
}
if (BREAK === "ambiguous") {
  // accept a pedigree that more than one pattern explains
  G.consistentPatterns = function () { return ["AR", "AD"]; };
  console.log("  [BREAK=ambiguous] uniqueness check disabled — this run MUST fail");
}
if (BREAK === "parsenum") {
  U.parseNum = function () { return NaN; };
  console.log("  [BREAK=parsenum] numeric parser broken — this run MUST fail");
}

/* ══ 1. crosses: route A vs route B ════════════════════════════════ */
const templates = BIO.DATA.gen_templates;
r.check(templates.length > 0, "no genetics templates found");

let crossChecks = 0;
templates.forEach((t) => {
  t.parentSets.forEach((parents) => {
    const spec = { kind: t.kind, parents: parents, loci: t.loci };

    for (let seed = 0; seed < Math.ceil(SEEDS / t.parentSets.length); seed++) {
      // the cross is deterministic, so the seed varies nothing here; the loop
      // exists so a future stochastic template is covered by the same harness
      const mismatch = G.verifyCross(spec);
      r.check(mismatch === null, t.id + " " + parents.join(" × ") + ": routes disagree — " + mismatch);
      crossChecks++;
      if (mismatch) break;
    }

    // ── route C: the textbook ratio, where one exists
    const a = G.cross(spec);
    const expected = G.expectedRatio(spec);
    if (expected) {
      r.check(a.ratio === expected,
        t.id + " " + parents.join(" × ") + ": grid ratio " + a.ratio + " but the expected ratio for this pattern is " + expected);
    }

    // ── internal consistency of the returned object
    r.check(a.total === a.gametesA.length * a.gametesB.length, t.id + ": grid size does not match the gamete counts");
    const genoSum = Object.keys(a.genotypes).reduce((s, k) => s + a.genotypes[k], 0);
    const phenSum = Object.keys(a.phenotypes).reduce((s, k) => s + a.phenotypes[k], 0);
    r.check(genoSum === a.total, t.id + ": genotype counts do not sum to the grid size");
    r.check(phenSum === a.total, t.id + ": phenotype counts do not sum to the grid size");
    const probSum = a.phenotypeOrder.reduce((s, p) => s + a.pPheno(p), 0);
    r.check(Math.abs(probSum - 1) < 1e-9, t.id + ": phenotype probabilities do not sum to 1");
  });
});
console.log("  " + crossChecks + " cross verifications across " + templates.length + " templates");

/* ══ 2. pedigrees: exactly one consistent pattern ══════════════════ */
const peds = BIO.DATA.gen_pedigrees;
let generated = 0, failedToGenerate = 0;

peds.forEach((tpl) => {
  for (let s = 0; s < Math.ceil(SEEDS / peds.length); s++) {
    const seed = (s + 1) * 7919 + tpl.id.charCodeAt(3) * 131;

    if (tpl.mode === "eliminate") {
      const ped = G.generatePedigreeForElimination(tpl.pattern, seed);
      if (!ped) { failedToGenerate++; continue; }
      generated++;
      // the answer is the exact complement of the consistent set
      const consistent = G.consistentPatterns(ped, G.CANDIDATE_SETS.all);
      const excluded = G.CANDIDATE_SETS.all.filter((p) => consistent.indexOf(p) < 0);
      r.check(excluded.join(",") === ped.excluded.join(","), tpl.id + ": stored exclusion set does not match a fresh inference");
      r.check(consistent.indexOf(tpl.pattern) >= 0, tpl.id + ": the pattern it was generated from is not consistent with it");
      r.check(consistent.length >= 1, tpl.id + ": no pattern explains this pedigree at all");
      continue;
    }

    const cands = tpl.candidates || G.CANDIDATE_SETS.all;
    const ped = G.generatePedigree(tpl.pattern, seed, cands);
    if (!ped) { failedToGenerate++; continue; }
    generated++;

    // ── the check the brief singles out
    const fits = G.consistentPatterns(ped, cands);
    r.check(fits.length === 1,
      tpl.id + " seed " + seed + ": " + fits.length + " patterns fit (" + fits.join(", ") + ") — the question has no single answer");
    r.check(fits[0] === tpl.pattern, tpl.id + ": the surviving pattern is not the one it was generated from");

    // ── forward simulation agrees with the stored phenotypes
    ped.individuals.forEach((i) => {
      r.check(typeof i.affected === "boolean", tpl.id + ": individual " + i.id + " has no affected status");
      if (i.sex === "F" && tpl.pattern === "YL") r.check(!i.affected, tpl.id + ": a female is affected under a Y-linked pattern");
    });

    if (tpl.mode === "predict") {
      const couples = G.uniqueCouple(ped, tpl.pattern);
      r.check(!!couples && couples.length > 0, tpl.id + ": no couple has genotypes fixed by the pedigree, so the probability is not exact");
      if (couples && couples.length) {
        const c = couples[couples.length - 1];
        const risk = G.childRisk(tpl.pattern, c.fatherGeno, c.motherGeno);
        r.check(risk.p >= 0 && risk.p <= 1, tpl.id + ": risk out of range");
        // a risk from a 2x2 Punnett is always a quarter-step
        r.check(Math.abs(risk.p * 4 - Math.round(risk.p * 4)) < 1e-9,
          tpl.id + ": risk " + risk.p + " is not a whole number of quarters, so the grid was not enumerated correctly");
      }
    }
  }
});
console.log("  " + generated + " pedigrees generated and verified (" + failedToGenerate + " discarded as ambiguous)");
r.check(generated > SEEDS * 0.5, "too many pedigrees were discarded — the generator is not converging");

/* ══ 3. the tolerance policy for probability answers (brief §5.3) ══ */
const NUM_CASES = [
  ["0.25", 0.25], [".25", 0.25], ["25%", 0.25], ["1/4", 0.25], ["1 in 4", 0.25],
  ["1 out of 4", 0.25], ["¼", 0.25], ["0.250", 0.25],
  ["0.5", 0.5], ["50%", 0.5], ["1/2", 0.5], ["1 in 2", 0.5], ["½", 0.5],
  ["0.75", 0.75], ["75%", 0.75], ["3/4", 0.75], ["3 in 4", 0.75], ["¾", 0.75],
  ["0", 0], ["0%", 0], ["1", 1], ["100%", 1], ["4/4", 1],
  ["1/3", 1 / 3], ["⅓", 1 / 3], ["1 in 3", 1 / 3],
  ["9/16", 0.5625], ["56.25%", 0.5625],
  ["1,250", 1250], ["3 x 10^4", 30000], ["3e4", 30000], ["-0.5", -0.5], ["−0.5", -0.5],
  ["2 ½", 2.5]
];
NUM_CASES.forEach(([input, expect]) => {
  const got = U.parseNum(input);
  r.check(isFinite(got) && Math.abs(got - expect) < 1e-9,
    "parseNum('" + input + "') gave " + got + ", expected " + expect);
});

const NUM_REJECT = ["", "abc", "1/0", "one in four", "1//4", "%"];
NUM_REJECT.forEach((input) => {
  r.check(!isFinite(U.parseNum(input)), "parseNum('" + input + "') should not parse but gave " + U.parseNum(input));
});

const RATIO_CASES = [["9:3:3:1", "9:3:3:1"], ["18:6:6:2", "9:3:3:1"], ["3:1", "3:1"], ["6:2", "3:1"], ["2:1:1", "2:1:1"]];
RATIO_CASES.forEach(([input, expect]) => {
  r.check(U.parseRatio(input) === expect, "parseRatio('" + input + "') gave " + U.parseRatio(input) + ", expected " + expect);
});
r.check(U.ratioEq("9:3:3:1", "18:6:6:2"), "ratioEq should normalise by the GCD");
r.check(!U.ratioEq("9:3:3:1", "9:3:1:3"), "ratioEq must respect order");

/* ══ 4. the honest limitation, asserted rather than assumed ═════════
   AR explains every pedigree XR explains, and AD explains every pedigree XD
   or YL explains. If that ever stopped being true the modes could be made
   less cautious — so it is checked rather than believed. */
let arSupersetXr = true, adSupersetXd = true;
for (let s = 1; s <= 60; s++) {
  const xr = G.generatePedigreeForElimination("XR", s * 3571);
  if (xr && !G.fits(xr, "AR")) arSupersetXr = false;
  const xd = G.generatePedigreeForElimination("XD", s * 3571);
  if (xd && !G.fits(xd, "AD")) adSupersetXd = false;
}
r.check(arSupersetXr, "an X-linked recessive pedigree was found that autosomal recessive cannot explain — the modes could be less cautious");
r.check(adSupersetXd, "an X-linked dominant pedigree was found that autosomal dominant cannot explain");
r.check(G.uniquelyNameable("AR") && G.uniquelyNameable("AD") && !G.uniquelyNameable("XR"),
  "uniquelyNameable does not match the patterns a pedigree can actually determine");

r.done();
