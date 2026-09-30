/* Short answer with marking criteria — third pass. */
window.BIO = window.BIO || {}; BIO.DATA = BIO.DATA || {};

BIO.DATA.short_x2_y11 = [
{ id:"sy-001", mod:"M1", topic:"Membrane transport", marks:6,
  q:"Explain how the structure of the cell membrane allows it to control which substances enter and leave the cell.",
  criteria:[
    "Describes the phospholipid bilayer with hydrophilic heads outward and hydrophobic tails inward",
    "Explains that the hydrophobic core allows small non-polar molecules such as oxygen and carbon dioxide to pass freely",
    "Explains that the same core blocks large, polar and charged particles such as ions and glucose",
    "States that channel and carrier proteins provide specific routes for those particles",
    "Distinguishes facilitated diffusion, which is passive and down a gradient, from active transport, which uses ATP and moves against the gradient",
    "Concludes that selectivity comes from the combination of the lipid barrier and the specific proteins present in that membrane"
  ],
  keys:[["bilayer","hydrophilic","hydrophobic"],["non-polar","oxygen","carbon dioxide","small","freely"],["polar","charged","ion","glucose","blocked","cannot"],["channel","carrier","protein","specific"],["facilitated","passive","active transport","atp","gradient"],["selective","combination","which proteins","permeab"]],
  sample:"The membrane is a bilayer of phospholipids, each with a hydrophilic phosphate head facing the aqueous solution and two hydrophobic fatty-acid tails facing inwards. That hydrophobic core is what makes the membrane selective. Small, non-polar molecules such as oxygen, carbon dioxide and steroid hormones dissolve in the tails and diffuse straight through, which is why gas exchange needs no protein at all. Large molecules, and anything polar or charged — ions, glucose, amino acids — cannot cross the hydrophobic region, so they are effectively excluded unless a protein provides a route. Channel proteins form hydrophilic pores that specific ions can pass through, and carrier proteins bind a particular particle and change shape to move it across. Where that movement is down a concentration gradient it is facilitated diffusion, and it requires no ATP. Where the particle is moved from a lower to a higher concentration, the carrier acts as a pump and hydrolyses ATP to do it, which is active transport. Selectivity therefore comes from two things together: the lipid core excludes most things by default, and the particular set of proteins a cell inserts into its membrane determines what it lets through and in which direction. This is why a root hair cell and a nerve cell, with the same bilayer, have completely different permeabilities.",
  common:["Says the membrane has 'holes' of a particular size rather than describing chemical selectivity",
          "Describes the structure without ever linking it to what can and cannot cross"] },

{ id:"sy-002", mod:"M1", topic:"Respiration", marks:5,
  q:"Explain why a muscle cell can continue to release ATP for a short time when oxygen supply is inadequate, and why this cannot be sustained.",
  criteria:[
    "States that glycolysis occurs in the cytosol and does not require oxygen",
    "States that glycolysis yields a net 2 ATP per glucose",
    "Explains that pyruvate is reduced to lactic acid to regenerate NAD⁺ so glycolysis can continue",
    "Explains that the yield is far lower than the 30–32 ATP of aerobic respiration, so glucose is consumed very rapidly",
    "Explains that accumulating lactic acid lowers pH, which inhibits enzymes and causes fatigue, so an oxygen debt must be repaid"
  ],
  keys:[["glycolysis","cytosol","without oxygen"],["2 atp","net","two"],["pyruvate","lactic acid","nad","regenerate"],["30","32","far less","efficient","rapidly"],["ph","fatigue","oxygen debt","accumulate","inhibit"]],
  sample:"Glycolysis takes place in the cytosol and requires no oxygen, so it continues when the oxygen supply cannot keep up with demand. It converts glucose to two molecules of pyruvate and yields a net two ATP. For it to continue, the NADH produced must be reoxidised, and without oxygen the electron transport chain cannot do this. Instead, pyruvate is reduced to lactic acid, regenerating NAD⁺ and allowing glycolysis to keep running. This is why a sprinter can maintain maximum effort for a short time. It cannot be sustained for two reasons. First, the yield is only two ATP per glucose compared with about thirty aerobically, so glucose and glycogen stores are consumed roughly fifteen times faster for the same output. Second, lactic acid accumulates faster than the blood can carry it away, lowering the pH of the muscle. Falling pH begins to affect the enzymes of glycolysis itself and contributes to the sensation of fatigue, forcing the intensity down. Once effort stops, breathing rate remains elevated to repay the oxygen debt: the accumulated lactate is oxidised or converted back to glucose in the liver.",
  common:["Says lactic acid causes muscle soreness days later — that is delayed onset muscle soreness, a different mechanism",
          "Forgets that regenerating NAD⁺ is the whole point of producing lactic acid"] },

{ id:"sy-003", mod:"M2", topic:"Transport in animals", marks:5,
  q:"Explain how tissue fluid is formed and returned, and describe what happens if the return is blocked.",
  criteria:[
    "States that at the arterial end, blood hydrostatic pressure forces water and small solutes out of the capillary",
    "States that plasma proteins are too large to leave and remain in the capillary",
    "Explains that at the venous end hydrostatic pressure has fallen, so the osmotic effect of those proteins draws most fluid back",
    "States that the excess not reabsorbed enters lymph capillaries and is returned to the blood via the thoracic duct",
    "Explains that blockage of lymph drainage causes fluid to accumulate in the tissue, producing oedema"
  ],
  keys:[["hydrostatic","arterial end","forced out"],["plasma protein","too large","remain"],["venous end","osmotic","drawn back","reabsorb"],["lymph","thoracic duct","returned"],["oedema","accumulate","swelling","blocked"]],
  sample:"At the arterial end of a capillary bed, blood hydrostatic pressure is high enough to force water and small dissolved solutes such as glucose, oxygen and ions out through the capillary wall into the spaces between cells, forming tissue fluid. Plasma proteins are too large to pass through and remain in the capillary, so the blood inside becomes relatively more concentrated. By the venous end, hydrostatic pressure has fallen substantially because of resistance along the bed, while the osmotic pull created by the retained plasma proteins is unchanged. The balance therefore reverses and most of the fluid is drawn back into the capillary. Roughly ten percent is not reabsorbed. This excess drains into blind-ending lymph capillaries, passes through lymph nodes where it is filtered, and is returned to the bloodstream at the subclavian vein via the thoracic duct. If lymph drainage is blocked — by a parasitic infection such as filariasis, or by removal of lymph nodes during cancer surgery — the excess fluid cannot be returned. It accumulates in the tissue and causes the swelling known as oedema, which can become severe and persistent.",
  common:["Says the fluid returns entirely to the capillary, forgetting the lymphatic system",
          "Confuses hydrostatic pressure with osmotic effect, or reverses which dominates at each end"] },

{ id:"sy-004", mod:"M3", topic:"Speciation", marks:6,
  q:"Explain the difference between allopatric and sympatric speciation, and evaluate which is more common.",
  criteria:[
    "Defines allopatric speciation as divergence following geographic isolation that prevents gene flow",
    "Defines sympatric speciation as divergence without geographic separation",
    "Gives a mechanism for sympatric speciation, such as polyploidy, temporal isolation or habitat isolation",
    "Explains that in both cases reproductive isolation is what completes speciation",
    "Explains why allopatric speciation is generally considered more common: geographic barriers halt gene flow completely, whereas gene flow within one area continually opposes divergence",
    "Notes a qualification, such as polyploidy making sympatric speciation common specifically in plants"
  ],
  keys:[["allopatric","geographic","barrier","isolat"],["sympatric","same area","without separation"],["polyploidy","temporal","habitat","mechanism"],["reproductive isolation","fertile offspring","completes"],["more common","gene flow","opposes","halts completely"],["plants","polyploid","qualification","exception"]],
  sample:"Allopatric speciation begins with a geographic barrier — a river, a mountain range, a rising sea level — that physically separates a population into two. Gene flow between them stops completely, so mutation, genetic drift and different selection pressures act independently on each gene pool and the two diverge. Sympatric speciation occurs without any geographic separation, within a single interbreeding area. Its mechanisms must therefore create reproductive isolation directly: polyploidy produces individuals that cannot cross successfully with their diploid parents; temporal isolation arises when two groups begin breeding at different times of year; habitat isolation arises when groups specialise on different host plants or depths and rarely meet. In both cases speciation is only complete when the populations can no longer interbreed to produce fertile offspring. Allopatric speciation is generally regarded as more common, and the reason is mechanistic rather than merely observational: a geographic barrier stops gene flow absolutely, whereas within a single area even a small amount of interbreeding continually mixes the gene pools and opposes divergence. Sympatric divergence therefore requires an unusually strong disruptive selection pressure or an instantaneous barrier. The important qualification is that polyploidy provides exactly such an instantaneous barrier and is common in plants — a substantial proportion of flowering plant species, including wheat and many crops, are polyploid — so sympatric speciation is far from rare in that group even if it is uncommon in animals.",
  common:["Defines both terms but never explains why one is more common than the other",
          "Treats polyploidy as rare when it is a major route to plant speciation"] },

{ id:"sy-005", mod:"M4", topic:"Human impact", marks:5,
  q:"Explain how an ecosystem can be affected by the removal of a keystone species, and evaluate the difficulty of predicting such effects.",
  criteria:[
    "Defines a keystone species as one whose influence is disproportionate to its abundance",
    "Describes a specific example with the mechanism, such as sea otters controlling urchins that would otherwise destroy kelp forests",
    "Explains the concept of a trophic cascade, in which effects propagate through several levels",
    "Explains a source of difficulty in prediction, such as indirect effects, time lags, or interactions with other species",
    "Makes an explicit judgement about how reliably such effects can be predicted in advance"
  ],
  keys:[["keystone","disproportionate","abundance"],["otter","urchin","kelp","wolf","example"],["trophic cascade","propagate","several levels","indirect"],["lag","indirect effect","interaction","complex","difficult"],["judgement","reliably","prediction","hard","only after"]],
  sample:"A keystone species is one whose removal changes community structure out of all proportion to its abundance. Sea otters are the standard example. They are not numerous, but they prey on sea urchins, which graze on kelp holdfasts. Where otters were hunted out along the north Pacific coast, urchin populations grew unchecked and destroyed the kelp forests, converting a complex three-dimensional habitat into bare urchin barrens. Many species that depended on the kelp for shelter and food declined with it. This is a trophic cascade: the effect of removing a predator propagates down through several trophic levels, and the largest measured change occurs two levels below the species removed. Predicting such effects in advance is genuinely difficult. The important consequences are indirect, so they do not follow from knowing what the species eats — the otter never touches kelp. Effects often involve substantial time lags, so an ecosystem can appear stable for years before shifting. Species interact in networks rather than chains, so removing one predator may release several prey species with different effects. And systems can show hysteresis, where the new state is stable and restoring the predator does not restore the original community. On balance, keystone effects are usually identified after the fact rather than predicted before it. The reliable inference is precautionary rather than quantitative: because any species may prove to be keystone and the consequences may be irreversible, the strength of the argument is for avoiding removals rather than for confidently forecasting their outcome.",
  common:["Describes the example without naming the trophic cascade mechanism",
          "Claims such effects are straightforward to predict, when they are typically recognised only afterwards"] }
];

BIO.DATA.short_x2_y12 = [
{ id:"sy-101", mod:"M5", topic:"Cell replication", marks:6,
  q:"Compare mitosis and meiosis, referring to the number and genetic composition of the cells produced, the stages involved, and the role of each in an organism.",
  criteria:[
    "States that mitosis involves one division producing two cells, while meiosis involves two divisions producing four",
    "States that mitosis produces diploid cells and meiosis produces haploid cells",
    "States that mitotic products are genetically identical to the parent while meiotic products differ from one another",
    "Identifies the sources of that difference: crossing over in prophase I and independent assortment in metaphase I",
    "Explains the key stage difference: homologous PAIRS align at the equator in metaphase I, whereas individual chromosomes align in mitotic metaphase",
    "Relates each to its role: mitosis for growth, repair and asexual reproduction; meiosis for gamete formation and the variation sexual reproduction depends on"
  ],
  keys:[["one division","two cells","two divisions","four"],["diploid","haploid"],["identical","genetically different","vary"],["crossing over","independent assortment","prophase i","metaphase i"],["homologous pairs","equator","individual chromosomes","align"],["growth","repair","gamete","variation","asexual"]],
  sample:"Mitosis is a single nuclear division producing two daughter cells; meiosis is two consecutive divisions producing four. Mitotic products are diploid, retaining the parent's full chromosome number, while meiotic products are haploid, with one member of each homologous pair. The genetic outcomes differ correspondingly: mitosis produces cells genetically identical to the parent and to each other, barring mutation, whereas the four products of meiosis differ from one another and from the parent. That difference arises from two events unique to meiosis. In prophase I, homologous chromosomes pair and exchange segments at chiasmata during crossing over, producing recombinant chromatids with allele combinations neither parent chromosome carried. In metaphase I, each homologous pair aligns at the equator independently of every other pair, so with 23 pairs there are over eight million possible chromosome combinations. The decisive stage difference is what lines up at the equator: in mitotic metaphase individual chromosomes align in a single row and sister chromatids are separated at anaphase, while in metaphase I homologous PAIRS align and whole chromosomes are separated, which is what halves the number. Their roles follow. Mitosis produces the identical cells needed for growth, tissue repair, replacement of worn cells and asexual reproduction, where preserving a successful genotype is the point. Meiosis produces gametes, and the variation it generates is the raw material that natural selection acts on.",
  common:["Reverses the product counts — mitosis 2 diploid, meiosis 4 haploid",
          "Says crossing over occurs in mitosis; homologues do not pair in mitosis, so it cannot",
          "Never states what actually lines up at the equator, which is the stage difference that produces everything else"] },

{ id:"sy-102", mod:"M6", topic:"Mutation", marks:5, tags:["mutation"],
  q:"Explain how a mutation in a single gene can lead to a change in an organism's phenotype.",
  criteria:[
    "States that a gene's base sequence determines the mRNA codon sequence",
    "States that the codon sequence determines the order of amino acids in the polypeptide",
    "Explains that the amino acid sequence determines how the polypeptide folds into its three-dimensional shape",
    "Explains that a protein's shape determines its function — an enzyme's active site, a receptor's binding site, a structural protein's properties",
    "Gives a worked example linking the change all the way to the phenotype, such as sickle cell anaemia"
  ],
  keys:[["base sequence","codon","mrna"],["amino acid","order","sequence"],["fold","three-dimensional","shape","tertiary"],["function","active site","binding","shape determines"],["sickle","example","phenotype","haemoglobin"]],
  sample:"A gene's base sequence is transcribed into a complementary mRNA sequence, which is read in triplets called codons. Each codon specifies one amino acid, so the base sequence dictates the order in which amino acids are joined during translation. That order is the protein's primary structure, and it determines everything that follows: the interactions between side chains — hydrogen bonds, ionic bonds, disulfide bridges and hydrophobic interactions — cause the chain to fold into a specific three-dimensional shape. Because a protein's function depends on its shape, changing the sequence can change the function. An enzyme whose active site no longer complements its substrate cannot catalyse its reaction; a receptor whose binding site is altered no longer responds to its signal; a structural protein with altered properties behaves differently in the tissue. Sickle cell anaemia shows the whole chain of consequence from a single base. An A to T substitution in the sixth codon of the beta-globin gene changes glutamic acid, which is charged and hydrophilic, to valine, which is hydrophobic. That single hydrophobic patch causes deoxygenated haemoglobin molecules to polymerise into rigid fibres. The fibres distort red blood cells into a sickle shape, and those cells block capillaries and are destroyed prematurely, producing the pain crises and anaemia that define the phenotype. Not every mutation does this: because the code is degenerate many substitutions are silent, and a change in a non-critical region may alter the sequence without altering the function.",
  common:["Jumps straight from 'mutation' to 'disease' without the sequence → shape → function chain",
          "Claims every mutation changes the phenotype, when most are silent or neutral"] },

{ id:"sy-103", mod:"M7", topic:"Immunity", marks:6,
  q:"Compare the primary and secondary immune responses, and explain how vaccination makes use of the difference.",
  criteria:[
    "Describes the primary response as slow, taking one to two weeks, with a low antibody concentration",
    "Explains the delay: the rare lymphocyte matching the antigen must first be selected and clonally expanded",
    "States that memory B and T cells are produced during the primary response and persist for years",
    "Describes the secondary response as much faster and reaching a far higher antibody concentration",
    "Explains why: a large population of specific memory cells already exists, so the selection and expansion phase is largely skipped",
    "Explains that vaccination deliberately induces a primary response using a harmless antigen, so that the first encounter with the real pathogen produces a secondary response"
  ],
  keys:[["primary","slow","one to two weeks","low"],["clonal","selected","rare","expand","lag"],["memory","persist","years","remain"],["secondary","faster","higher","larger"],["already exist","skip","no lag","immediately"],["vaccine","harmless","antigen","first real encounter"]],
  sample:"The primary response follows the first encounter with an antigen. It is slow, taking one to two weeks before antibody appears in useful quantity, and the concentration reached is comparatively low. The delay has a specific cause: only a very small number of lymphocytes carry a receptor matching that particular antigen, so that cell must first be selected by the antigen and then divide repeatedly to build a clone large enough to matter. During this expansion, some of the activated cells differentiate not into antibody-secreting plasma cells but into memory B and T cells, which persist in circulation for years or decades after the antibodies themselves have been degraded. The secondary response follows a later encounter with the same antigen. It is dramatically faster, with antibody rising within two to three days, and reaches a concentration often ten to a hundred times higher. The reason is that the slow part has already happened: a large population of memory cells specific to that antigen already exists, so they can proliferate and differentiate into plasma cells immediately without the initial selection and expansion phase. The pathogen is usually cleared before it reproduces enough to cause symptoms, which is what being immune means in practice. Vaccination exploits exactly this difference. It introduces an antigen from the pathogen in a form that cannot cause the disease — inactivated, attenuated, a purified surface protein, or mRNA instructing the body to make one — and this triggers a full primary response including memory cell formation. The person pays the cost of a slow primary response to something harmless, so that when they meet the actual pathogen, that encounter is already their second and produces a secondary response.",
  common:["Attributes long-term immunity to circulating antibodies rather than memory cells",
          "Never explains WHY the primary response is slow, which is what makes the comparison meaningful"] },

{ id:"sy-104", mod:"M8", topic:"Homeostasis", marks:5, tags:["homeostasis"],
  q:"Explain how negative feedback maintains body temperature, and explain why a fever is not simply a failure of that system.",
  criteria:[
    "Identifies thermoreceptors in the skin and hypothalamus as the receptors",
    "Identifies the hypothalamus as the control centre comparing the value against a set point",
    "Describes effector responses in both directions, such as vasodilation and sweating when hot, vasoconstriction and shivering when cold",
    "Explains that each response opposes the change that triggered it, returning temperature towards the set point",
    "Explains that in fever the set point itself is raised by pyrogens, so the same negative feedback then defends a higher temperature — the mechanism is working, not failing"
  ],
  keys:[["thermoreceptor","skin","hypothalamus","detect"],["control centre","set point","compare"],["vasodilation","sweating","vasoconstriction","shivering"],["opposes","returns","negative feedback"],["fever","set point raised","pyrogen","still working","defends"]],
  sample:"Thermoreceptors in the skin monitor external temperature and central thermoreceptors in the hypothalamus monitor the temperature of the blood. The hypothalamus acts as the control centre, comparing these against a set point of about 37 °C and coordinating effectors through the autonomic nervous system. If temperature rises, skin arterioles dilate so more warm blood flows near the surface and heat is lost by radiation, and sweat glands secrete sweat whose evaporation removes latent heat. If temperature falls, those arterioles constrict to conserve heat, skeletal muscles shiver so that respiration in them releases heat, and over longer periods thyroxine raises the basal metabolic rate. In each case the response opposes the change that produced it, which is what makes the system negative feedback and what keeps temperature within a narrow range. A fever is not a breakdown of this mechanism. Pyrogens released during infection — including molecules from the pathogen and cytokines from the immune system — act on the hypothalamus and raise the set point itself, to 39 °C for instance. The same negative feedback then operates around the new value. This is why a person developing a fever feels cold and shivers even though their temperature is already above normal: they are below their current set point, so the body responds as it would to cold and generates heat until the new value is reached. When the infection resolves the set point returns to normal, the person is now above it, and they sweat profusely as the excess heat is shed. The system is functioning correctly throughout; it is the target that has moved.",
  common:["Describes fever as the thermostat 'breaking' rather than the set point being deliberately raised",
          "Cannot explain why someone with a rising fever shivers"] },

{ id:"sy-105", mod:"M8", topic:"Epidemiology", marks:6, tags:["epidemiology"],
  q:"A new treatment is claimed to be effective. Design an investigation that would test this claim, and justify each feature of your design.",
  criteria:[
    "Describes a randomised controlled trial with a treatment group and a control group",
    "Justifies randomisation: it balances known and unknown confounding variables between the groups",
    "Describes giving the control group a placebo, and justifies it as controlling for the expectation effect",
    "Describes blinding, ideally double-blinding, and justifies it as controlling for bias in reporting and assessment",
    "Identifies a clearly defined, measurable outcome decided before the trial begins",
    "Identifies a sample size consideration or a further control such as pre-registration, and explains why it matters"
  ],
  keys:[["randomised","controlled trial","two groups","random allocation"],["balance","confound","known and unknown"],["placebo","expectation","psychological"],["blind","double-blind","bias","assessor"],["outcome","defined in advance","measurable","primary"],["sample size","power","pre-register","statistical"]],
  sample:"I would run a randomised controlled trial. Participants meeting defined entry criteria would be allocated by a random process to either a treatment group receiving the new treatment or a control group receiving a placebo identical in appearance, taste and administration. Randomisation is the central feature and it is justified because it distributes confounding variables — age, sex, disease severity, diet, other medications, and factors nobody has thought to measure — evenly between the groups on average. No other design controls for unknown confounders, which is why an observational comparison of people who chose the treatment cannot substitute for it. The placebo is necessary because the expectation of treatment alone produces measurable improvement in many conditions; without it, any improvement in the treatment group could be attributed to expectation rather than to the treatment. The trial should be double-blind: neither participants nor the researchers assessing outcomes know who received which. Participant blinding controls the expectation effect, and assessor blinding controls the unconscious bias that affects how a researcher who knows the allocation records a borderline result. A single, clearly defined primary outcome must be specified before the trial begins — for example the proportion of patients whose symptoms resolve within fourteen days, measured by a stated method. Deciding this in advance, and pre-registering it, prevents choosing after the fact whichever of many measured outcomes happens to look favourable. The sample must be large enough to detect a difference of the size that would matter clinically; too small a trial can miss a real effect, and results from it are also more likely to be extreme by chance. Finally, participants should be analysed in the group they were allocated to, whether or not they completed the treatment, so that people dropping out because the treatment was unpleasant do not quietly improve the result.",
  common:["Omits the placebo, so the expectation effect is uncontrolled",
          "Says 'blind' without saying who is blinded to what, or why it matters",
          "Never mentions defining the outcome in advance"] },

{ id:"sy-106", mod:"M6", topic:"Genetic technologies", marks:5, tags:["biotech"],
  q:"Explain how PCR and gel electrophoresis are used together in DNA profiling.",
  criteria:[
    "States that PCR amplifies specific regions of DNA, which allows a very small or degraded sample to be analysed",
    "Describes the PCR cycle: denature at about 95 °C, anneal primers at 50–65 °C, extend with Taq polymerase at about 72 °C, repeated so copies double each cycle",
    "Explains that primers are chosen to flank short tandem repeat regions that vary in repeat number between individuals",
    "States that gel electrophoresis separates the amplified fragments by size, since DNA is negatively charged and smaller fragments travel further",
    "Explains that the resulting pattern of band positions is compared between samples, and that a match is expressed as a probability rather than a certainty"
  ],
  keys:[["pcr","amplif","small sample","copies"],["95","denature","anneal","72","taq","double"],["primer","str","short tandem repeat","flank","vary"],["electrophoresis","negative","size","smaller travel further"],["compare","pattern","probability","match"]],
  sample:"DNA profiling begins with PCR because a crime-scene or forensic sample is often tiny and partly degraded, and there is not enough material to analyse directly. PCR amplifies chosen regions selectively. Each cycle heats the sample to about 95 °C to break the hydrogen bonds and separate the strands, cools to between 50 and 65 °C so that short primer sequences anneal to their complementary sites, then warms to about 72 °C, the optimum for Taq polymerase, which extends each primer into a new complementary strand. Because both new strands then serve as templates, the number of copies doubles each cycle, so thirty cycles yield roughly a billion copies from a single molecule. The primers are chosen to flank short tandem repeat loci — non-coding regions where a short sequence is repeated a variable number of times. Because the repeat number differs between individuals, the amplified fragment from each locus has a length characteristic of that person. The amplified fragments are then separated by gel electrophoresis. Every nucleotide carries a negatively charged phosphate, so under a voltage the fragments migrate towards the positive electrode, and the agarose gel impedes larger fragments more than smaller ones, so in a given time the fragments separate into bands ordered by size. Running a ladder of known sizes alongside allows each band to be sized. Comparing the band pattern between a suspect sample and a crime-scene sample shows whether they are consistent. Because unrelated people can share a repeat number at any single locus, many independent loci are used, and the result is properly reported as a match probability — the chance that a randomly chosen unrelated person would produce the same pattern — rather than as a certain identification.",
  common:["Says electrophoresis identifies whose DNA it is, when it only separates fragments by size",
          "Reports a match as certain rather than as a probability"] }
];
