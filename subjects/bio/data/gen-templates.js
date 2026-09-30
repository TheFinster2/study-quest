/* Genetics templates — each an unbounded family of questions.
   The engine in js/core/genetics.js computes every answer twice (grid
   enumeration and independent-probability multiplication) and tests/genetics.js
   asserts the two agree over 200+ seeds per template. */
window.BIO = window.BIO || {}; BIO.DATA = BIO.DATA || {};

/* Locus specs reused across templates. */
var L = {
  peaShape:   { sym:"R", type:"complete", dom:"round", rec:"wrinkled" },
  peaColour:  { sym:"Y", type:"complete", dom:"yellow", rec:"green" },
  peaHeight:  { sym:"T", type:"complete", dom:"tall", rec:"dwarf" },
  fur:        { sym:"B", type:"complete", dom:"black fur", rec:"white fur" },
  wing:       { sym:"W", type:"complete", dom:"long wings", rec:"vestigial wings" },
  snapdragon: { sym:"C", type:"incomplete", homDom:"red", het:"pink", homRec:"white" },
  fourOClock: { sym:"F", type:"incomplete", homDom:"red", het:"pink", homRec:"white" },
  cattle:     { sym:"C", type:"codominant", homDom:"red coat", het:"roan coat", homRec:"white coat" },
  sickle:     { sym:"H", type:"codominant", homDom:"normal haemoglobin", het:"sickle cell trait", homRec:"sickle cell anaemia" },
  abo:        { type:"abo" },
  haemophilia:{ type:"sex", allele:"H", dom:"normal clotting", rec:"haemophilia", xdom:false },
  colourBlind:{ type:"sex", allele:"C", dom:"normal vision", rec:"red-green colour blindness", xdom:false },
  rickets:    { type:"sex", allele:"R", dom:"vitamin D resistant rickets", rec:"unaffected", xdom:true }
};

BIO.DATA.gen_templates = [
{ id:"gt-001", mod:"M5", topic:"Inheritance", title:"Monohybrid cross — complete dominance", diff:1,
  kind:"auto", loci:[L.peaShape],
  parentSets:[["Rr","Rr"],["Rr","rr"],["RR","rr"],["Rr","RR"],["rr","rr"]],
  context:"In garden peas, round seed shape (R) is completely dominant to wrinkled (r).",
  asks:["ratio","pPheno","grid"] },

{ id:"gt-002", mod:"M5", topic:"Inheritance", title:"Monohybrid cross — fur colour", diff:1,
  kind:"auto", loci:[L.fur],
  parentSets:[["Bb","Bb"],["Bb","bb"],["BB","Bb"],["Bb","BB"]],
  context:"In a population of mice, black fur (B) is completely dominant to white fur (b).",
  asks:["ratio","pPheno","pGeno"] },

{ id:"gt-003", mod:"M5", topic:"Inheritance", title:"Test cross", diff:2,
  kind:"auto", loci:[L.wing],
  parentSets:[["Ww","ww"],["WW","ww"]],
  context:"A fruit fly with long wings is crossed with a vestigial-winged fly to determine its genotype. Long wings (W) are dominant.",
  asks:["ratio","pPheno","interpret"] },

{ id:"gt-004", mod:"M5", topic:"Inheritance", title:"Dihybrid cross", diff:3,
  kind:"auto", loci:[L.peaShape, L.peaColour],
  parentSets:[["RrYy","RrYy"],["RrYy","rryy"],["RrYy","Rryy"],["RRYy","RrYy"]],
  context:"In peas, round (R) is dominant to wrinkled (r) and yellow (Y) is dominant to green (y). The two genes assort independently.",
  asks:["ratio","pPheno","grid"] },

{ id:"gt-005", mod:"M5", topic:"Inheritance", title:"Dihybrid cross — height and colour", diff:3,
  kind:"auto", loci:[L.peaHeight, L.peaColour],
  parentSets:[["TtYy","TtYy"],["TtYy","ttyy"],["TTYy","TtYy"]],
  context:"In peas, tall (T) is dominant to dwarf (t) and yellow (Y) is dominant to green (y).",
  asks:["ratio","pPheno"] },

{ id:"gt-006", mod:"M5", topic:"Inheritance", title:"Incomplete dominance — snapdragons", diff:2,
  kind:"auto", loci:[L.snapdragon],
  parentSets:[["Cc","Cc"],["CC","cc"],["Cc","cc"],["Cc","CC"]],
  context:"In snapdragons, flower colour shows incomplete dominance: CC is red, Cc is pink and cc is white.",
  asks:["ratio","pPheno","interpret"] },

{ id:"gt-007", mod:"M5", topic:"Inheritance", title:"Incomplete dominance — four o'clock plants", diff:2,
  kind:"auto", loci:[L.fourOClock],
  parentSets:[["Ff","Ff"],["Ff","ff"],["FF","ff"]],
  context:"In four o'clock plants, FF is red, Ff is pink and ff is white.",
  asks:["ratio","pPheno"] },

{ id:"gt-008", mod:"M5", topic:"Inheritance", title:"Codominance — roan cattle", diff:2,
  kind:"auto", loci:[L.cattle],
  parentSets:[["Cc","Cc"],["Cc","cc"],["CC","cc"],["Cc","CC"]],
  context:"In shorthorn cattle, coat colour is codominant: CC is red, Cc is roan (both red and white hairs visible) and cc is white.",
  asks:["ratio","pPheno","interpret"] },

{ id:"gt-009", mod:"M5", topic:"Inheritance", title:"Codominance — sickle cell", diff:3,
  kind:"auto", loci:[L.sickle],
  parentSets:[["Hh","Hh"],["Hh","hh"],["Hh","HH"]],
  context:"Sickle cell alleles are codominant: HH has normal haemoglobin, Hh has sickle cell trait and also some malaria resistance, and hh has sickle cell anaemia.",
  asks:["ratio","pPheno"] },

{ id:"gt-010", mod:"M5", topic:"Inheritance", title:"Multiple alleles — ABO blood groups", diff:3,
  kind:"abo", loci:[L.abo],
  parentSets:[["Ai","Bi"],["AB","ii"],["AB","Ai"],["Ai","Ai"],["Bi","ii"],["AB","AB"],["Ai","ii"]],
  context:"ABO blood group is controlled by three alleles: A and B are codominant with each other and both are dominant to i.",
  asks:["ratio","pPheno","interpret"] },

{ id:"gt-011", mod:"M5", topic:"Sex linkage", title:"X-linked recessive — haemophilia", diff:3,
  kind:"sex", loci:[L.haemophilia],
  parentSets:[["XHXh","XHY"],["XHXh","XhY"],["XHXH","XhY"],["XhXh","XHY"]],
  context:"Haemophilia is caused by an X-linked recessive allele (X^h). X^H gives normal clotting.",
  asks:["ratio","pPheno","sexSplit"] },

{ id:"gt-012", mod:"M5", topic:"Sex linkage", title:"X-linked recessive — colour blindness", diff:3,
  kind:"sex", loci:[L.colourBlind],
  parentSets:[["XCXc","XCY"],["XCXc","XcY"],["XCXC","XcY"],["XcXc","XCY"]],
  context:"Red-green colour blindness is caused by an X-linked recessive allele (X^c).",
  asks:["ratio","pPheno","sexSplit"] },

{ id:"gt-013", mod:"M5", topic:"Sex linkage", title:"X-linked dominant", diff:3,
  kind:"sex", loci:[L.rickets],
  parentSets:[["XRXr","XrY"],["XrXr","XRY"],["XRXr","XRY"]],
  context:"Vitamin-D-resistant rickets is caused by an X-linked DOMINANT allele (X^R). Note what happens to the daughters of an affected father.",
  asks:["ratio","pPheno","sexSplit"] }
];

/* Pedigree templates. `nameable` marks the patterns for which a pedigree can
   have exactly one consistent answer among the candidate set — see the note in
   genetics.js about why AR and AD are the only two nameable against all five
   patterns, and why an X-linked question must state that the gene is on the X. */
BIO.DATA.gen_pedigrees = [
{ id:"gp-001", mod:"M5", topic:"Pedigrees", title:"Name the pattern (autosomal)", diff:2,
  pattern:"AR", candidates:["AR","AD","XR","XD","YL"], mode:"name",
  context:"A pedigree for a human trait. Determine the inheritance pattern." },
{ id:"gp-002", mod:"M5", topic:"Pedigrees", title:"Name the pattern (autosomal)", diff:2,
  pattern:"AD", candidates:["AR","AD","XR","XD","YL"], mode:"name",
  context:"A pedigree for a human trait. Determine the inheritance pattern." },
{ id:"gp-003", mod:"M5", topic:"Pedigrees", title:"X-linked: recessive or dominant?", diff:3,
  pattern:"XR", candidates:["XR","XD"], mode:"name",
  context:"The gene for this trait is known to lie on the X chromosome. Determine whether the allele is dominant or recessive." },
{ id:"gp-004", mod:"M5", topic:"Pedigrees", title:"X-linked: recessive or dominant?", diff:3,
  pattern:"XD", candidates:["XR","XD"], mode:"name",
  context:"The gene for this trait is known to lie on the X chromosome. Determine whether the allele is dominant or recessive." },
{ id:"gp-005", mod:"M5", topic:"Pedigrees", title:"Rule it out", diff:3,
  pattern:"AR", mode:"eliminate",
  context:"Select every inheritance pattern that this pedigree makes IMPOSSIBLE." },
{ id:"gp-006", mod:"M5", topic:"Pedigrees", title:"Rule it out", diff:3,
  pattern:"AD", mode:"eliminate",
  context:"Select every inheritance pattern that this pedigree makes IMPOSSIBLE." },
{ id:"gp-007", mod:"M5", topic:"Pedigrees", title:"Rule it out", diff:3,
  pattern:"XR", mode:"eliminate",
  context:"Select every inheritance pattern that this pedigree makes IMPOSSIBLE." },
{ id:"gp-008", mod:"M5", topic:"Pedigrees", title:"Predict the next child", diff:3,
  pattern:"AR", candidates:["AR","AD","XR","XD","YL"], mode:"predict",
  context:"Work out the inheritance pattern, then predict the probability for the highlighted couple's next child." },
{ id:"gp-009", mod:"M5", topic:"Pedigrees", title:"Predict the next child", diff:3,
  pattern:"AD", candidates:["AR","AD","XR","XD","YL"], mode:"predict",
  context:"Work out the inheritance pattern, then predict the probability for the highlighted couple's next child." },
{ id:"gp-010", mod:"M5", topic:"Pedigrees", title:"Predict the next child (X-linked)", diff:3,
  pattern:"XR", candidates:["XR","XD"], mode:"predict",
  context:"The gene lies on the X chromosome. Work out whether it is dominant or recessive, then predict for the highlighted couple." }
];
