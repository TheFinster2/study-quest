/* Biosphere — js/core/mark.js
   Short-answer support. It does NOT mark prose and it never claims to.

   The only thing here that touches the student's writing is `hints()`, which
   reports which criteria *look* like they might be addressed. That output is
   labelled as a guess in the UI, is never pre-ticked, is never coloured red,
   and never reaches the score. (brief §4.1, §4.3)

   Exposes: window.BIO.Mark */
(function (root) {
  "use strict";

  var BIO = root.BIO = root.BIO || {};
  var U = BIO.U || (typeof require !== "undefined" ? require("./util.js") : null);
  var M = {};

  M.DISCLAIMER = "These look like they might be covered — you decide. This is a keyword guess, not a mark.";

  /* Stop words are ignored when deriving keywords from a criterion. */
  var STOP = ("a an the and or of to in for with that this these those is are was were be been being " +
    "it its as at by on from into their they them he she his her which who whom what when how why " +
    "identifies describes explains states outlines relates justifies assesses discusses names gives " +
    "one two three both each any some more most less least than then so such may can will would " +
    "point points mark marks answer response student must should").split(" ");
  var STOPSET = Object.create(null);
  STOP.forEach(function (w) { STOPSET[w] = 1; });

  /* Domain synonym groups. A criterion keyword matches if the student used any
     word in the same group. Deliberately small and hand-checked — a sprawling
     synonym list produces confident nonsense. */
  M.SYNONYMS = [
    ["antigen", "antigens", "epitope"],
    ["antibody", "antibodies", "immunoglobulin"],
    ["pathogen", "pathogens", "microbe", "microorganism", "germ"],
    ["lymphocyte", "lymphocytes", "b-cell", "bcell", "b", "t-cell", "tcell"],
    ["memory", "memorycell", "memorycells"],
    ["vaccine", "vaccination", "immunisation", "immunization", "vaccinated"],
    ["phagocyte", "phagocytes", "macrophage", "macrophages", "neutrophil", "neutrophils", "phagocytosis"],
    ["enzyme", "enzymes", "catalyst", "biological catalyst"],
    ["substrate", "substrates", "reactant"],
    ["denature", "denatured", "denaturation", "denatures"],
    ["active site", "activesite", "binding site"],
    ["diffusion", "diffuse", "diffuses", "diffusing"],
    ["osmosis", "osmotic"],
    ["concentration gradient", "gradient", "concentration"],
    ["hypertonic", "hypotonic", "isotonic", "tonicity"],
    ["semi-permeable", "semipermeable", "partially permeable", "selectively permeable"],
    ["mitochondria", "mitochondrion", "mitochondrial"],
    ["chloroplast", "chloroplasts"],
    ["photosynthesis", "photosynthetic", "photosynthesise", "photosynthesize"],
    ["respiration", "respire", "aerobic respiration", "cellular respiration"],
    ["atp", "adenosine triphosphate", "energy currency"],
    ["dna", "deoxyribonucleic acid"],
    ["mrna", "messenger rna", "messengerrna"],
    ["trna", "transfer rna"],
    ["transcription", "transcribed", "transcribe"],
    ["translation", "translated", "translate"],
    ["codon", "codons", "triplet"],
    ["anticodon", "anticodons"],
    ["ribosome", "ribosomes"],
    ["polypeptide", "protein", "proteins", "amino acid chain"],
    ["mutation", "mutations", "mutagen", "mutated"],
    ["allele", "alleles"],
    ["genotype", "genotypes"],
    ["phenotype", "phenotypes"],
    ["dominant", "dominance"],
    ["recessive"],
    ["heterozygous", "heterozygote", "carrier", "carriers"],
    ["homozygous", "homozygote"],
    ["meiosis", "meiotic"],
    ["mitosis", "mitotic"],
    ["gamete", "gametes", "sperm", "egg", "ovum"],
    ["variation", "variability", "diverse", "diversity"],
    ["natural selection", "selection", "selected", "selective pressure"],
    ["adaptation", "adaptations", "adapted", "adaptive"],
    ["speciation", "species formation"],
    ["homeostasis", "homeostatic"],
    ["negative feedback", "feedback"],
    ["receptor", "receptors", "detects", "detected"],
    ["effector", "effectors"],
    ["stimulus", "stimuli"],
    ["hormone", "hormones", "endocrine"],
    ["insulin"],
    ["glucagon"],
    ["glycogen"],
    ["vasodilation", "vasodilate", "vasodilates", "dilate", "dilation"],
    ["vasoconstriction", "vasoconstrict", "constrict", "constriction"],
    ["nephron", "nephrons"],
    ["filtration", "filtered", "filtrate"],
    ["reabsorption", "reabsorbed", "reabsorb"],
    ["transpiration", "transpire", "transpires"],
    ["stomata", "stoma", "stomatal"],
    ["xylem"],
    ["phloem", "translocation"],
    ["surface area to volume", "sa:v", "sa/v", "surface area", "surface-area-to-volume"],
    ["epidemiology", "epidemiological", "epidemiologist"],
    ["incidence"],
    ["prevalence"],
    ["correlation", "correlated", "association"],
    ["causation", "causal", "causes"],
    ["control group", "control", "controlled"],
    ["placebo"],
    ["antibiotic", "antibiotics"],
    ["antiviral", "antivirals"],
    ["resistance", "resistant"],
    ["herd immunity"],
    ["quarantine", "isolation", "isolated"],
    ["vector", "vectors"],
    ["transect", "transects"],
    ["quadrat", "quadrats"],
    ["abundance", "population size", "population density"],
    ["biotic"],
    ["abiotic"],
    ["biodiversity"],
    ["restoration", "rehabilitation", "revegetation"],
    ["polymerase chain reaction", "pcr"],
    ["gel electrophoresis", "electrophoresis"],
    ["crispr", "cas9", "gene editing"],
    ["transgenic", "genetically modified", "gmo", "gm"],
    ["clone", "cloning", "cloned"],
    ["gene therapy"],
    ["biobank", "gene bank", "seed bank"],
    ["pedigree", "pedigrees"],
    ["punnett", "punnett square"],
    ["carcinogen", "carcinogens", "carcinogenic"],
    ["nutrition", "nutritional", "diet", "dietary"],
    ["prevalence rate", "mortality", "morbidity"]
  ];

  var SYN_INDEX = null;
  function synIndex() {
    if (SYN_INDEX) return SYN_INDEX;
    SYN_INDEX = Object.create(null);
    M.SYNONYMS.forEach(function (group, gi) {
      group.forEach(function (term) { SYN_INDEX[U.norm(term)] = gi; });
    });
    return SYN_INDEX;
  }

  /* Keywords a criterion is "about": its content words, plus any explicit
     `keys` the author supplied on the question. */
  M.criterionKeys = function (criterionText, extra) {
    var ws = U.words(criterionText).filter(function (w) {
      return w.length > 3 && !STOPSET[w];
    });
    var terms = U.uniq(ws.concat(extra || []));
    return terms;
  };

  function matches(term, answerNorm, answerWords) {
    var idx = synIndex();
    var t = U.norm(term);
    if (!t) return false;
    if (t.indexOf(" ") >= 0) return answerNorm.indexOf(t) >= 0;

    if (answerWords[t]) return true;
    // simple stem tolerance: plural / -ed / -ing / -s
    var stems = [t, t + "s", t + "es", t + "ed", t + "ing", t.replace(/e$/, "ing"), t.replace(/y$/, "ies")];
    for (var i = 0; i < stems.length; i++) if (answerWords[stems[i]]) return true;
    if (t.length > 5) {
      var pre = t.slice(0, Math.max(5, t.length - 3));
      for (var w in answerWords) if (w.indexOf(pre) === 0) return true;
    }
    // synonym group
    var g = idx[t];
    if (g === undefined) return false;
    var group = M.SYNONYMS[g];
    for (var k = 0; k < group.length; k++) {
      var s = U.norm(group[k]);
      if (!s || s === t) continue;
      if (s.indexOf(" ") >= 0) { if (answerNorm.indexOf(s) >= 0) return true; }
      else if (answerWords[s]) return true;
    }
    return false;
  }

  /* hints(question, text) → [{index, looksCovered, hit:[terms]}]
     A guess. Never a mark. */
  M.hints = function (q, text) {
    var answerNorm = U.norm(text);
    var wordsMap = Object.create(null);
    U.words(text).forEach(function (w) { wordsMap[w] = 1; });

    return (q.criteria || []).map(function (crit, i) {
      var extra = (q.keys && q.keys[i]) || [];
      var terms = M.criterionKeys(crit, extra);
      var hit = terms.filter(function (t) { return matches(t, answerNorm, wordsMap); });
      // require a real share of the criterion's content words, or an explicit key
      var explicitHit = extra.some(function (t) { return matches(t, answerNorm, wordsMap); });
      var share = terms.length ? hit.length / terms.length : 0;
      return {
        index: i,
        looksCovered: explicitHit || (terms.length >= 2 && share >= 0.5) || (terms.length === 1 && hit.length === 1),
        hit: hit
      };
    });
  };

  /* Word count / effort gate used by §4.4. Not a quality judgement — just
     "did anything get written". */
  M.effort = function (text) {
    var t = String(text || "").trim();
    return { chars: t.length, words: t ? t.split(/\s+/).length : 0 };
  };

  M.longEnough = function (text) {
    return M.effort(text).chars >= (BIO.State ? BIO.State.SHORT_MIN_CHARS : 20);
  };

  BIO.Mark = M;
  if (typeof module !== "undefined" && module.exports) module.exports = M;
})(typeof window !== "undefined" ? window : globalThis);
