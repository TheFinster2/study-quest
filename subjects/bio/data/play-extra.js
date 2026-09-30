/* Second pass at the three "play" content types: Process Order sequences,
   Sort It boards and Data Detective datasets.

   All three are discovered by key pattern (seq_, sort_, data_), so this one
   file adds to all three modes without touching any engine code. Keeping
   them together is deliberate: they are the modes with the fewest items, and
   topping all three up in one place makes the imbalance easy to see. */

window.BIO = window.BIO || {}; BIO.DATA = BIO.DATA || {};

/* ── Process Order ──────────────────────────────────────────────────── */
BIO.DATA.seq_extra = [

{ id:"sq-101", mod:"M7", topic:"Immunity", title:"The specific immune response", diff:3,
  steps:[
    "A pathogen breaches the barriers and enters the tissues",
    "A macrophage engulfs it and displays its antigens on MHC proteins",
    "A helper T cell with a matching receptor binds the presented antigen",
    "The activated helper T cell divides and releases cytokines",
    "A B cell displaying the same antigen is activated by those cytokines",
    "The B cell divides to form a clone of identical cells",
    "Most become plasma cells secreting antibody against that antigen",
    "The remainder become memory cells that persist after the infection clears"
  ],
  why:"Presentation comes before selection, and selection before division. The memory cells are made in the same clonal expansion as the plasma cells, not afterwards." },

{ id:"sq-102", mod:"M8", topic:"Kidney", title:"Urine formation in a nephron", diff:3,
  steps:[
    "Blood enters the glomerulus through the wide afferent arteriole",
    "High pressure forces water and small solutes into the Bowman's capsule",
    "Glucose and most ions are reabsorbed in the proximal convoluted tubule",
    "The descending limb of the loop of Henle loses water to the salty medulla",
    "The ascending limb pumps sodium and chloride out into the medulla",
    "The distal convoluted tubule fine-tunes ion balance under hormonal control",
    "The collecting duct reabsorbs water according to ADH concentration",
    "The remaining filtrate passes to the renal pelvis as urine"
  ],
  why:"The ascending limb is what makes the medulla salty, and the descending limb and collecting duct exploit that salt. Reversing those two steps breaks the whole countercurrent mechanism." },

{ id:"sq-103", mod:"M6", topic:"Biotechnology", title:"Producing a transgenic bacterium", diff:2,
  steps:[
    "Isolate mRNA for the desired protein from a cell that makes it",
    "Use reverse transcriptase to build a cDNA copy with no introns",
    "Cut a plasmid open with a restriction enzyme, leaving sticky ends",
    "Cut the gene with the same enzyme so the ends are complementary",
    "Mix gene and plasmid so the sticky ends base pair",
    "Seal the sugar-phosphate backbone with DNA ligase",
    "Mix the recombinant plasmids with host bacteria to allow uptake",
    "Use the marker gene to identify and culture the transformed cells"
  ],
  why:"The same restriction enzyme must cut both the gene and the vector, or the ends will not match. Ligase seals what base pairing has already brought together." },

{ id:"sq-104", mod:"M3", topic:"Speciation", title:"Allopatric speciation", diff:2,
  steps:[
    "A single interbreeding population occupies a continuous range",
    "A geographical barrier divides the range into two separate areas",
    "Gene flow between the two populations stops completely",
    "Different selection pressures act on each population",
    "Mutation and genetic drift add further differences over time",
    "The gene pools diverge until the populations differ substantially",
    "Reproductive isolating mechanisms accumulate as a by-product",
    "The two populations can no longer interbreed even if reunited"
  ],
  why:"Reproductive isolation is a consequence of divergence, not its cause. The test of speciation is what happens if the barrier is removed." },

{ id:"sq-105", mod:"M2", topic:"Digestion", title:"Digestion of a protein-rich meal", diff:2,
  steps:[
    "Chewing breaks the food into smaller pieces and mixes it with saliva",
    "Peristalsis moves the bolus down the oesophagus to the stomach",
    "Hydrochloric acid denatures the proteins and activates pepsinogen",
    "Pepsin breaks the long polypeptides into shorter chains",
    "Chyme passes into the duodenum and is neutralised by bile and pancreatic juice",
    "Trypsin and other pancreatic proteases cut the chains into peptides",
    "Membrane-bound peptidases on the villi release individual amino acids",
    "Amino acids are absorbed and carried in the hepatic portal vein to the liver"
  ],
  why:"Protein digestion needs an acidic stage and then an alkaline one, so the order of the stomach and duodenum is not interchangeable. The final cuts happen at the membrane, not in the lumen." },

{ id:"sq-106", mod:"M1", topic:"Cell replication", title:"The cell cycle", diff:2,
  steps:[
    "G1: the cell grows and synthesises the proteins it will need",
    "G1 checkpoint: size, nutrients and DNA integrity are verified",
    "S phase: each chromosome is replicated into two sister chromatids",
    "G2: the cell continues to grow and checks the copy for errors",
    "Prophase: chromosomes condense and the nuclear envelope breaks down",
    "Metaphase: chromosomes line up on the equator and attachment is checked",
    "Anaphase: sister chromatids are pulled to opposite poles",
    "Telophase and cytokinesis: nuclei re-form and the cytoplasm divides"
  ],
  why:"Replication happens in S phase, well before any of the visible stages. By prophase the chromosomes are already doubled, which is why each appears as two chromatids." },

{ id:"sq-107", mod:"M4", topic:"Succession", title:"Primary succession on bare rock", diff:2,
  steps:[
    "Bare rock is exposed, with no soil and no organic matter",
    "Lichens colonise and begin to weather the rock surface",
    "Dead lichen and rock particles accumulate as a thin soil",
    "Mosses establish in the shallow soil and trap more material",
    "Grasses and small herbs root in the deepening soil layer",
    "Shrubs establish and shade out many of the smaller plants",
    "Trees establish once the soil is deep enough to anchor them",
    "A stable climax community persists until the next disturbance"
  ],
  why:"Each stage changes the conditions enough for the next one to establish, and is usually outcompeted as a result. Soil depth is the thread running through the whole sequence." },

{ id:"sq-108", mod:"M8", topic:"Homeostasis", title:"Response to a fall in body temperature", diff:2,
  steps:[
    "Thermoreceptors in the skin and hypothalamus detect the temperature drop",
    "The hypothalamus compares the input with the set point",
    "Nerve impulses travel to the effectors in skin and muscle",
    "Skin arterioles constrict, reducing blood flow to the surface",
    "Erector muscles raise the hairs, trapping a layer of still air",
    "Skeletal muscles contract rapidly and involuntarily in shivering",
    "Heat production rises and heat loss falls, so core temperature rises",
    "The receptors detect the return to the set point and the response stops"
  ],
  why:"Detection, control centre, effector, response, and then the feedback that switches it off. The last step is what makes it a loop rather than a one-way chain." }

];

/* ── Sort It ────────────────────────────────────────────────────────── */
BIO.DATA.sort_extra = [

{ id:"so-101", mod:"M1", topic:"Cell structure", title:"Prokaryote, eukaryote, or both?", diff:2,
  bins:["Prokaryote only","Eukaryote only","Both"],
  items:[
    ["Peptidoglycan cell wall","Prokaryote only"], ["Membrane-bound nucleus","Eukaryote only"],
    ["Ribosomes","Both"], ["Mitochondria","Eukaryote only"],
    ["Circular chromosome in a nucleoid","Prokaryote only"], ["Plasma membrane","Both"],
    ["Golgi apparatus","Eukaryote only"], ["Plasmids","Prokaryote only"],
    ["Cytoplasm","Both"], ["Linear chromosomes with histones","Eukaryote only"],
    ["DNA as the genetic material","Both"], ["Binary fission as the means of division","Prokaryote only"]
  ],
  why:"The dividing line is compartmentalisation, not complexity. Everything alive has DNA, ribosomes, cytoplasm and a plasma membrane — only eukaryotes wrap things in internal membranes." },

{ id:"so-102", mod:"M7", topic:"Immunity", title:"Which line of defence?", diff:2,
  bins:["First line","Second line","Third line"],
  items:[
    ["Intact skin","First line"], ["Phagocytosis by a macrophage","Second line"],
    ["Antibody produced by a plasma cell","Third line"], ["Stomach acid","First line"],
    ["Inflammation","Second line"], ["Memory B cells","Third line"],
    ["Cilia and mucus in the trachea","First line"], ["Fever","Second line"],
    ["Cytotoxic T cells killing infected cells","Third line"], ["Lysozyme in tears","First line"],
    ["Natural killer cells","Second line"], ["Helper T cell activation of a B cell","Third line"]
  ],
  why:"First line keeps pathogens out. Second line attacks anything that got in, without asking what it is. Third line is specific to one antigen and remembers it." },

{ id:"so-103", mod:"M4", topic:"Nutrient cycles", title:"Adds carbon to the air, or removes it?", diff:2,
  bins:["Adds CO₂ to the atmosphere","Removes CO₂ from the atmosphere"],
  items:[
    ["Respiration by animals","Adds CO₂ to the atmosphere"], ["Photosynthesis by phytoplankton","Removes CO₂ from the atmosphere"],
    ["Burning coal","Adds CO₂ to the atmosphere"], ["Growth of a forest","Removes CO₂ from the atmosphere"],
    ["Decomposition of leaf litter","Adds CO₂ to the atmosphere"], ["Formation of limestone from shells","Removes CO₂ from the atmosphere"],
    ["Bushfire","Adds CO₂ to the atmosphere"], ["Dissolving of CO₂ in cold ocean water","Removes CO₂ from the atmosphere"],
    ["Respiration by soil bacteria","Adds CO₂ to the atmosphere"], ["Peat accumulation in a bog","Removes CO₂ from the atmosphere"]
  ],
  why:"Anything that oxidises organic carbon releases it; anything that fixes or buries it removes it. Decomposition counts as release even though nothing is burning." },

{ id:"so-104", mod:"M5", topic:"Inheritance", title:"Genotype or phenotype?", diff:1,
  bins:["Genotype","Phenotype"],
  items:[
    ["Heterozygous, Aa","Genotype"], ["Purple flowers","Phenotype"],
    ["Homozygous recessive, bb","Genotype"], ["Blood group AB","Phenotype"],
    ["I^A I^B","Genotype"], ["Tall stem","Phenotype"],
    ["Carrier of cystic fibrosis","Genotype"], ["Round seeds","Phenotype"],
    ["X^C X^c","Genotype"], ["Colour blind","Phenotype"]
  ],
  why:"Genotype is the alleles present, written as letters. Phenotype is the observable characteristic. Being a carrier is a genotype, because nothing is visible." },

{ id:"so-105", mod:"M6", topic:"Mutation", title:"Point mutation or chromosomal mutation?", diff:2,
  bins:["Point mutation","Chromosomal mutation"],
  items:[
    ["Substitution of one base for another","Point mutation"], ["Non-disjunction producing trisomy 21","Chromosomal mutation"],
    ["Insertion of a single base","Point mutation"], ["Inversion of a chromosome segment","Chromosomal mutation"],
    ["Deletion of one base causing a frameshift","Point mutation"], ["Translocation between two chromosomes","Chromosomal mutation"],
    ["Silent mutation in the third codon position","Point mutation"], ["Duplication of a whole chromosome arm","Chromosomal mutation"],
    ["Nonsense mutation creating a stop codon","Point mutation"], ["Polyploidy in a wheat cultivar","Chromosomal mutation"]
  ],
  why:"The distinction is scale. A point mutation changes bases within a gene; a chromosomal mutation rearranges or recounts whole chromosomes or large segments." },

{ id:"so-106", mod:"M8", topic:"Disorders", title:"Infectious or non-infectious?", diff:1,
  bins:["Infectious","Non-infectious"],
  items:[
    ["Tuberculosis","Infectious"], ["Type 2 diabetes","Non-infectious"],
    ["Influenza","Infectious"], ["Melanoma","Non-infectious"],
    ["Malaria","Infectious"], ["Cystic fibrosis","Non-infectious"],
    ["Cholera","Infectious"], ["Scurvy","Non-infectious"],
    ["HIV/AIDS","Infectious"], ["Coronary heart disease","Non-infectious"],
    ["Chytrid fungus disease in frogs","Infectious"], ["Down syndrome","Non-infectious"]
  ],
  why:"Infectious means a pathogen is transmitted from one host to another. Genetic, nutritional, environmental and degenerative diseases are all non-infectious even when they run in families." },

{ id:"so-107", mod:"M2", topic:"Transport in plants", title:"Xylem or phloem?", diff:2,
  bins:["Xylem","Phloem"],
  items:[
    ["Transports water and dissolved minerals","Xylem"], ["Transports sucrose and amino acids","Phloem"],
    ["Composed of dead, hollow cells","Xylem"], ["Composed of living cells","Phloem"],
    ["Walls thickened with lignin","Xylem"], ["Sieve plates with pores between cells","Phloem"],
    ["Flow is always upward from the roots","Xylem"], ["Flow can be in either direction","Phloem"],
    ["Driven by transpiration pull","Xylem"], ["Requires ATP at the loading site","Phloem"]
  ],
  why:"Xylem is dead plumbing driven by evaporation at the top; phloem is living tissue that spends ATP to load sugar and can move it either way." },

{ id:"so-108", mod:"M3", topic:"Evidence for evolution", title:"Homologous or analogous?", diff:3,
  bins:["Homologous","Analogous"],
  items:[
    ["Human arm and whale flipper","Homologous"], ["Bird wing and insect wing","Analogous"],
    ["Bat wing and human hand","Homologous"], ["Shark fin and dolphin fin","Analogous"],
    ["Cat forelimb and horse forelimb","Homologous"], ["Eye of an octopus and eye of a mammal","Analogous"],
    ["Petal and leaf of a flowering plant","Homologous"], ["Wing of a bat and wing of a bee","Analogous"],
    ["Human coccyx and monkey tail","Homologous"], ["Streamlined body of a tuna and of a penguin","Analogous"]
  ],
  why:"Homologous structures share ancestry and underlying structure, whatever they are used for. Analogous structures share a job but arose separately, which is convergent evolution." }

];

/* ── Data Detective ─────────────────────────────────────────────────── */
BIO.DATA.data_extra = [

{ id:"dd-101", mod:"M2", topic:"Transport in animals", title:"Oxygen dissociation curves", diff:3,
  kind:"line", xLabel:"Partial pressure of oxygen (kPa)", yLabel:"Haemoglobin saturation (%)",
  series:[
    { name:"Adult haemoglobin", points:[[1,7],[2,20],[3,38],[4,58],[6,82],[8,93],[10,97],[12,98]] },
    { name:"Fetal haemoglobin", points:[[1,15],[2,38],[3,60],[4,76],[6,92],[8,97],[10,99],[12,99]] }
  ],
  questions:[
    { q:"At a partial pressure of 4 kPa, roughly how much more saturated is fetal haemoglobin than adult haemoglobin?",
      options:["18 percentage points","10 percentage points","34 percentage points","76 percentage points"], answer:0,
      why:"Read both curves at 4 kPa: 76% for fetal and 58% for adult, a difference of 18 percentage points.",
      distractors:{1:"That understates the gap at this partial pressure.",2:"That is the gap at a much lower partial pressure.",3:"That is the fetal value itself, not the difference."} },
    { q:"What does the position of the fetal curve relative to the adult curve indicate?",
      options:["Fetal haemoglobin has a higher affinity for oxygen at every partial pressure shown","Fetal haemoglobin carries more oxygen molecules per protein than adult haemoglobin","Fetal blood contains a greater concentration of haemoglobin than adult blood","Fetal haemoglobin releases oxygen more readily in the tissues than adult does"], answer:0,
      why:"A curve lying to the left means a higher saturation at the same partial pressure, which is what higher affinity means. This lets fetal blood take oxygen from maternal blood in the placenta.",
      distractors:{1:"Both bind four oxygen molecules per molecule of haemoglobin.",2:"The graph shows saturation as a percentage, not concentration.",3:"Higher affinity means it holds oxygen more tightly, not more readily released."} },
    { q:"Over which range is the adult curve steepest?",
      options:["2 to 4 kPa","8 to 10 kPa","10 to 12 kPa","0 to 1 kPa"], answer:0,
      why:"Saturation rises from 20% to 58% across those 2 kPa, the largest change per unit shown, which is why a small pressure drop in respiring tissue unloads a great deal of oxygen.",
      distractors:{1:"The curve is already flattening here, rising only 4 percentage points.",2:"The curve is essentially flat over this range.",3:"The curve is shallow at the very bottom because binding is not yet cooperative."} }
  ] },

{ id:"dd-102", mod:"M7", topic:"Epidemiology", title:"Measles notifications before and after vaccination", diff:2,
  kind:"table", columns:["Period","Vaccine coverage (%)","Cases per 100 000", "Deaths per 100 000"],
  rows:[
    ["1955–1959","0","480","1.2"],
    ["1965–1969","28","310","0.8"],
    ["1975–1979","62","94","0.2"],
    ["1985–1989","81","21","0.05"],
    ["1995–1999","93","2","0.01"]
  ],
  questions:[
    { q:"By what factor did the case rate fall between 1955–1959 and 1995–1999?",
      options:["240","24","480","96"], answer:0,
      why:"480 ÷ 2 = 240. The case rate fell to one two-hundred-and-fortieth of its starting value.",
      distractors:{1:"That is out by a factor of ten.",2:"That is the starting rate, not the ratio.",3:"That is the fall between the first and third periods only."} },
    { q:"The death rate fell proportionally further than the case rate. What does this suggest?",
      options:["Treatment of cases improved as well as vaccination reducing case numbers","Vaccination prevents deaths but has no effect on the number of cases","The disease became less transmissible over the period covered","Deaths were recorded less completely in the most recent period"], answer:0,
      why:"Cases fell 240-fold while deaths fell 120-fold per 100 000 — but per case, the death rate also improved, which points to better supportive care alongside prevention.",
      distractors:{1:"The case rate clearly fell, so vaccination affected both.",2:"Transmissibility is a property of the virus and did not change.",3:"Under-recording would be an assumption with nothing in the data to support it."} },
    { q:"Which conclusion is NOT supported by this table alone?",
      options:["Vaccination caused the fall in measles cases","Case rates fell as coverage rose","Deaths per 100 000 fell over the period","The lowest case rate coincided with the highest coverage"], answer:0,
      why:"The table shows a strong association over time, but other things also changed across forty years. Causation needs trial evidence and a mechanism, not a correlated time series.",
      distractors:{1:"This is a direct reading of the two columns.",2:"The final column falls in every period shown.",3:"Both extremes occur in the 1995–1999 row."} }
  ] },

{ id:"dd-103", mod:"M4", topic:"Population dynamics", title:"A predator and its prey", diff:3,
  kind:"line", xLabel:"Year", yLabel:"Population (thousands)",
  series:[
    { name:"Hares", points:[[0,20],[2,55],[4,80],[6,30],[8,15],[10,45],[12,75],[14,35]] },
    { name:"Lynx", points:[[0,8],[2,12],[4,26],[6,30],[8,12],[10,9],[12,22],[14,28]] }
  ],
  questions:[
    { q:"What is the relationship between the two peaks?",
      options:["The lynx peak follows the hare peak by about two years","The two populations peak in exactly the same year","The lynx peak comes about two years before the hare peak","There is no consistent timing relationship between them"], answer:0,
      why:"Hares peak at year 4 and lynx at year 6, and the pattern repeats. The predator population can only grow after the food supply has grown.",
      distractors:{1:"Reading the two curves shows the peaks are offset, not aligned.",2:"That reverses cause and effect: predators cannot increase before their food does.",3:"The same lag appears in both cycles shown."} },
    { q:"What best explains the fall in hares between years 4 and 8?",
      options:["Heavy predation combined with competition for food at high density","A density-independent event such as an unusually severe winter","Emigration of hares to another region entirely","A fall in the lynx population removing a stabilising influence"], answer:0,
      why:"Hare numbers collapse while lynx numbers are at their highest, and a population near its peak is also short of food, so both density-dependent factors act together.",
      distractors:{1:"A one-off weather event would not repeat on a regular cycle.",2:"Nothing in the data indicates movement out of the area.",3:"Lynx numbers are high, not low, during the hare decline."} },
    { q:"Estimate the hare population at year 5.",
      options:["About 55 thousand","About 80 thousand","About 30 thousand","About 15 thousand"], answer:0,
      why:"Year 5 lies between the year 4 value of 80 and the year 6 value of 30, so interpolating gives roughly 55 thousand.",
      distractors:{1:"That is the year 4 value, before the decline began.",2:"That is the year 6 value, after the decline.",3:"That is the trough two years later still."} }
  ] },

{ id:"dd-104", mod:"M6", topic:"Genetic technologies", title:"Antibiotic resistance in a hospital", diff:3,
  kind:"table", columns:["Year","Antibiotic prescriptions per 1000 patients","Resistant isolates (%)"],
  rows:[
    ["2014","880","6"],
    ["2015","910","9"],
    ["2016","845","13"],
    ["2017","610","15"],
    ["2018","470","12"],
    ["2019","430","8"]
  ],
  questions:[
    { q:"In which year did the percentage of resistant isolates peak?",
      options:["2017","2015","2016","2018"], answer:0,
      why:"The resistance column rises to 15% in 2017 and falls thereafter, one year after prescribing began to drop.",
      distractors:{1:"Resistance was still rising in 2015.",2:"2016 is high but is exceeded the following year.",3:"Resistance had already begun falling by 2018."} },
    { q:"Resistance kept rising for a year after prescribing fell. The best explanation is that",
      options:["resistant strains persist and spread until the selection pressure has been reduced for some time","the reduction in prescribing had no effect on resistance at any point","resistant bacteria reproduce faster than susceptible ones in every environment","the laboratory changed its method of testing during that year"], answer:0,
      why:"Removing the selection pressure stops resistance being favoured, but existing resistant strains do not disappear immediately — they must be diluted out by competition with susceptible strains.",
      distractors:{1:"Resistance falls in the last two years, so the reduction clearly had an effect.",2:"Resistance usually carries a metabolic cost when the antibiotic is absent.",3:"This is speculation with no support in the data given."} },
    { q:"What does the 2019 row suggest about resistance?",
      options:["It can decline when the selection pressure is reduced","It is permanent once it has appeared in a population","It is unrelated to the volume of antibiotic used","It falls immediately whenever prescribing is reduced"], answer:0,
      why:"Resistance at 8% is below the 2016 peak, showing that susceptible strains recover their advantage once the antibiotic is used less.",
      distractors:{1:"The falling values in 2018 and 2019 contradict permanence.",2:"The two columns clearly move together with a lag.",3:"The one-year lag shows the fall is not immediate."} }
  ] },

{ id:"dd-105", mod:"M1", topic:"Photosynthesis", title:"Limiting factors in photosynthesis", diff:3,
  kind:"line", xLabel:"Light intensity (arbitrary units)", yLabel:"Rate of photosynthesis (arbitrary units)",
  series:[
    { name:"0.04% CO₂, 20 °C", points:[[0,0],[2,18],[4,30],[6,35],[8,36],[10,36]] },
    { name:"0.14% CO₂, 20 °C", points:[[0,0],[2,20],[4,38],[6,52],[8,58],[10,59]] },
    { name:"0.14% CO₂, 30 °C", points:[[0,0],[2,21],[4,41],[6,62],[8,78],[10,84]] }
  ],
  questions:[
    { q:"What is the limiting factor for the lowest curve at a light intensity of 8?",
      options:["Carbon dioxide concentration","Light intensity","Temperature","Chlorophyll concentration"], answer:0,
      why:"The curve has plateaued, so light is no longer limiting. Raising CO₂ at the same temperature lifts the plateau, which identifies CO₂ as the factor that was holding it back.",
      distractors:{1:"The curve is flat, so more light produces no increase.",2:"The middle curve is at the same temperature and reaches a higher plateau, so temperature is not the constraint here.",3:"Chlorophyll concentration is not a variable in this experiment."} },
    { q:"What is the limiting factor for all three curves at a light intensity of 2?",
      options:["Light intensity, because all three curves nearly coincide there","Carbon dioxide, because the curves already differ at that point","Temperature, since the warmest curve is highest throughout","Nothing is limiting at such a low light intensity"], answer:0,
      why:"When all three conditions give almost the same rate, the factor they have in common must be the constraint. Only light is shared across the three curves at that point.",
      distractors:{1:"The curves are nearly identical at intensity 2, which is the point.",2:"The temperature difference has almost no effect at that intensity.",3:"The rate is far below the maximum, so something is clearly limiting."} },
    { q:"Comparing the two 0.14% CO₂ curves, what does the effect of temperature suggest?",
      options:["The reactions involved are enzyme-controlled, so raising temperature speeds them up","Temperature increases the amount of light the leaf can absorb","Temperature has no effect until carbon dioxide is also increased","The plant respires less at higher temperature, so net uptake rises"], answer:0,
      why:"The two curves differ only in temperature, and the warmer one is higher wherever another factor is not limiting — the signature of an enzyme-catalysed process.",
      distractors:{1:"Absorption of light is a physical process and is barely temperature-sensitive.",2:"Both curves are at the same CO₂ concentration and still differ.",3:"Respiration rises with temperature, which would reduce net rate rather than raise it."} }
  ] }

];
