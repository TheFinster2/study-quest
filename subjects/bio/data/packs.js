/* Course coverage packs (brief §8).
   Hiding content NEVER raises what the remaining questions pay and NEVER
   lowers an achievement target. validate.js checks that every module, topic
   and tag a pack claims actually exists — a typo hides nothing and is
   invisible from inside the app. */
window.BIO = window.BIO || {}; BIO.DATA = BIO.DATA || {};

BIO.DATA.packs = [
{ id:"y11", name:"Year 11 (Modules 1–4)", group:"Year",
  blurb:"Hide all Year 11 content while you focus on the HSC course.",
  modules:["M1","M2","M3","M4"] },

{ id:"m1", name:"Module 1 — Cells as the Basis of Life", group:"Year 11", modules:["M1"] },
{ id:"m2", name:"Module 2 — Organisation of Living Things", group:"Year 11", modules:["M2"] },
{ id:"m3", name:"Module 3 — Biological Diversity", group:"Year 11", modules:["M3"] },
{ id:"m4", name:"Module 4 — Ecosystem Dynamics", group:"Year 11", modules:["M4"] },

{ id:"m5-popgen", name:"Population genetics (M5)", group:"Year 12",
  blurb:"Hardy-Weinberg and gene flow. Often taught late.",
  modules:["M5"], topics:["Population genetics"] },

{ id:"m5-pedigrees", name:"Pedigrees (M5)", group:"Year 12",
  blurb:"Pedigree analysis and inference.",
  modules:["M5"], topics:["Pedigrees"] },

{ id:"m6-biotech", name:"Biotechnology and genetic technologies (M6)", group:"Year 12",
  blurb:"PCR, gel electrophoresis, CRISPR, transgenics and the ethics.",
  tags:["biotech"] },

{ id:"m6-mutation", name:"Mutation (M6)", group:"Year 12",
  blurb:"Point and chromosomal mutations, mutagens.",
  tags:["mutation"] },

{ id:"m7-plant", name:"Plant responses to pathogens (M7)", group:"Year 12",
  blurb:"Plant physical and chemical defences and systemic acquired resistance.",
  tags:["plant-defence"] },

{ id:"m8-epi", name:"Epidemiology (M8)", group:"Year 12",
  blurb:"Incidence, prevalence, causation, study design and epidemic curves.",
  tags:["epidemiology"] },

{ id:"m8-homeo", name:"Homeostasis (M8)", group:"Year 12",
  blurb:"Thermoregulation, glucose regulation, the kidney and negative feedback.",
  tags:["homeostasis"] },

{ id:"m8-disorders", name:"Technologies and disorders (M8)", group:"Year 12",
  blurb:"Hearing and vision disorders, imaging, and the technologies that manage them.",
  tags:["disorders"] },

{ id:"m3-evidence", name:"Evidence for evolution (M3)", group:"Revision",
  blurb:"Turn off if your school treats Module 3 as pure Year 11 revision.",
  modules:["M3"], topics:["Evidence for evolution","Evidence"] }
];
