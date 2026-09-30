/* Short answer with marking criteria — Year 12. Weighted heavier (brief §6.1). */
window.BIO = window.BIO || {}; BIO.DATA = BIO.DATA || {};

BIO.DATA.short_m5 = [
{ id:"sa-m5-001", mod:"M5", topic:"Polypeptide synthesis", marks:6,
  q:"Explain the process by which the information in a gene is used to produce a polypeptide.",
  criteria:[
    "States that RNA polymerase binds the promoter and unwinds the DNA at the gene",
    "Describes transcription: a complementary mRNA strand is built from the template strand, with uracil replacing thymine",
    "States that pre-mRNA is processed — introns spliced out — and the mRNA leaves the nucleus through a nuclear pore",
    "States that the mRNA binds a ribosome and is read in triplets called codons, starting at AUG",
    "Describes translation: tRNA anticodons pair with codons, delivering specific amino acids",
    "States that adjacent amino acids are joined by peptide bonds until a stop codon is reached, releasing the polypeptide"
  ],
  keys:[["rna polymerase","promoter","unwind"],["transcription","complementary","template","uracil"],["intron","splic","nuclear pore","processing"],["ribosome","codon","aug","start"],["trna","anticodon","amino acid"],["peptide bond","stop codon","released"]],
  sample:"Transcription begins when RNA polymerase binds to the promoter region of the gene and unwinds the double helix. Using one strand as a template, it assembles a complementary mRNA strand from free RNA nucleotides, with uracil pairing to adenine in place of thymine. The resulting pre-mRNA is processed: introns are spliced out, the exons joined, and a cap and poly-A tail added. The mature mRNA then leaves the nucleus through a nuclear pore. In the cytoplasm the mRNA binds to a ribosome, which reads it in triplets called codons beginning at the start codon AUG. Each tRNA molecule carries a specific amino acid and an anticodon complementary to a codon, so tRNAs bring the amino acids in the order the mRNA specifies. The ribosome catalyses the formation of peptide bonds between adjacent amino acids, moving along the mRNA one codon at a time, until a stop codon is reached and the completed polypeptide is released.",
  common:["Confuses codon and anticodon",
          "Writes thymine into the mRNA sequence",
          "Describes transcription and translation but omits the processing and export step"] },

{ id:"sa-m5-002", mod:"M5", topic:"Cell replication", marks:5,
  q:"Explain how meiosis produces genetic variation among gametes.",
  criteria:[
    "States that crossing over occurs in prophase I between homologous chromosomes at chiasmata",
    "Explains that crossing over produces recombinant chromatids with new combinations of alleles",
    "States that independent assortment occurs at metaphase I, with each homologous pair aligning independently",
    "Explains that independent assortment produces 2ⁿ possible combinations (2²³ in humans)",
    "Notes that random fertilisation between any two gametes multiplies the variation further"
  ],
  keys:[["crossing over","chiasmata","prophase i"],["recombinant","new combination","exchange"],["independent assortment","metaphase i","align"],["2","combinations","8 million","random orientation"],["random fertilisation","fusion","any two gametes"]],
  sample:"Two events during meiosis generate variation. In prophase I, homologous chromosomes pair and exchange segments at chiasmata — crossing over. This produces recombinant chromatids carrying combinations of alleles that were not present in either parental chromosome. Then at metaphase I, each homologous pair lines up on the equator independently of every other pair, so which member of each pair goes to which pole is random. With 23 pairs in humans this independent assortment alone gives 2²³, about 8.4 million, possible chromosome combinations per gamete. Finally, although it occurs after meiosis, random fertilisation means any one of these gametes may fuse with any of the equally varied gametes from the other parent, multiplying the variation enormously.",
  common:["Describes crossing over as occurring in mitosis as well — homologues do not pair in mitosis",
          "Says meiosis 'causes mutations' — mutation is a separate source of variation"] },

{ id:"sa-m5-003", mod:"M5", topic:"Inheritance", marks:5,
  q:"A man with blood group AB and a woman with blood group O are expecting a child. Using a Punnett square, determine the possible blood groups of their children and explain the pattern of inheritance involved.",
  criteria:[
    "States the parental genotypes: I^A I^B and ii",
    "Draws or describes a correct Punnett square with the four resulting genotypes",
    "States the possible offspring genotypes: I^A i and I^B i, in a 1:1 ratio",
    "States the possible phenotypes: blood group A and blood group B only",
    "Explains that ABO involves multiple alleles, with I^A and I^B codominant and both dominant to i"
  ],
  keys:[["iai b","genotype","ab","ii"],["punnett","grid","square"],["1:1","half","ratio"],["group a","group b","a or b"],["multiple alleles","codominant","three alleles"]],
  sample:"The father's genotype is I^A I^B and the mother's is ii, since group O is the only group requiring two recessive alleles. The father can produce gametes carrying I^A or I^B; the mother can only produce gametes carrying i. A Punnett square therefore gives two genotypes: I^A i and I^B i, in a 1:1 ratio. The phenotypes are blood group A and blood group B, each with a probability of one half. No child can be group AB, because that would require I^B from the mother, and none can be group O, because that would require a recessive i from the father, who has none. This is a case of multiple alleles: three alleles exist in the population, I^A and I^B are codominant with each other so that both antigens appear on the red cell surface in a heterozygote, and both are completely dominant to i.",
  common:["Gives AB or O as possible outcomes",
          "Describes I^A and I^B as 'both dominant' without using the term codominant"] },

{ id:"sa-m5-004", mod:"M5", topic:"Sex linkage", marks:5,
  q:"Explain why haemophilia is far more common in males than in females.",
  criteria:[
    "States that the gene for the clotting factor is located on the X chromosome",
    "States that the haemophilia allele is recessive",
    "Explains that males are XY and therefore hemizygous — one X only",
    "Explains that a male with the recessive allele on his single X expresses the condition, with no second allele to mask it",
    "Explains that a female must inherit the recessive allele on both X chromosomes, which is far less likely, and that a heterozygous female is an unaffected carrier"
  ],
  keys:[["x chromosome","x-linked"],["recessive"],["hemizygous","one x","xy","single x"],["express","no second allele","cannot be masked"],["two copies","both x","carrier","heterozygous","less likely"]],
  sample:"The gene for clotting factor VIII is carried on the X chromosome and the haemophilia allele is recessive. A male is XY, so he has only one X chromosome and is hemizygous for every X-linked gene. If his single X carries the recessive haemophilia allele he has no second copy of the gene to provide a functional clotting factor, so he expresses the condition. A female is XX, so she must inherit the recessive allele on both of her X chromosomes to be affected — one from a carrier or affected mother and one from an affected father. Because the allele is rare, the probability of receiving two copies is far lower than the probability of receiving one, which is why affected females are very uncommon. A heterozygous female carries the allele but produces enough clotting factor from her other X to be unaffected, so she is a carrier and can pass the allele to half her sons.",
  common:["Says males 'have a weaker immune system' or similar — the answer is hemizygosity",
          "Says females cannot be affected at all, which is untrue, only much rarer"] },

{ id:"sa-m5-005", mod:"M5", topic:"Pedigrees", marks:5,
  q:"A pedigree shows two unaffected parents with an affected daughter. Explain what this reveals about the inheritance pattern and what it rules out.",
  criteria:[
    "States that the trait must be recessive, because affected offspring appear from unaffected parents",
    "Explains that both parents must therefore be heterozygous carriers",
    "States that a dominant pattern is ruled out, since at least one parent would have to be affected",
    "States that X-linked recessive is ruled out, because an affected daughter would need an affected father",
    "Concludes that the pattern is autosomal recessive"
  ],
  keys:[["recessive","skips"],["carrier","heterozygous","both parents"],["dominant","ruled out","excluded"],["x-linked","affected father","daughter"],["autosomal recessive"]],
  sample:"Because the daughter is affected and neither parent is, the allele responsible cannot be dominant — a dominant allele would have to be present and expressed in at least one parent. The trait must therefore be recessive, and both parents must be heterozygous carriers who each passed a recessive allele to this child. This immediately rules out autosomal dominant and X-linked dominant inheritance. It also rules out X-linked recessive: an affected daughter would have to be homozygous recessive on both X chromosomes, and since she receives one X from her father, he would himself have to be affected — and he is not. Y-linked inheritance is impossible because the affected individual is female. The remaining explanation is autosomal recessive inheritance, and each future child of this couple has a one in four probability of being affected.",
  common:["Concludes 'recessive' but never rules out X-linked recessive, which the affected daughter specifically excludes",
          "Says the parents 'have the disease but do not show it' — carriers do not have the condition"] },

{ id:"sa-m5-006", mod:"M5", topic:"Population genetics", marks:4,
  q:"In a population of 400 individuals, 64 show a recessive phenotype. Assuming Hardy-Weinberg equilibrium, calculate the frequency of the recessive allele and the number of heterozygotes, showing your working.",
  criteria:[
    "Calculates q² = 64/400 = 0.16",
    "Calculates q = √0.16 = 0.4, and therefore p = 0.6",
    "Calculates 2pq = 2 × 0.6 × 0.4 = 0.48",
    "Converts to a number of individuals: 0.48 × 400 = 192 heterozygotes"
  ],
  keys:[["0.16","64/400","q squared"],["0.4","square root","0.6"],["0.48","2pq"],["192","number","individuals"]],
  sample:"The recessive phenotype corresponds to the homozygous recessive genotype, so q² = 64 ÷ 400 = 0.16. Taking the square root, q = 0.4, so the frequency of the recessive allele is 0.4. Since p + q = 1, p = 0.6. The heterozygote frequency is 2pq = 2 × 0.6 × 0.4 = 0.48. In a population of 400 individuals this gives 0.48 × 400 = 192 heterozygotes.",
  common:["Reports q² as the allele frequency without taking the square root",
          "Forgets the factor of 2 in 2pq",
          "Gives a frequency when the question asked for a number of individuals"] }
];

BIO.DATA.short_m6 = [
{ id:"sa-m6-001", mod:"M6", topic:"Mutation", marks:5, tags:["mutation"],
  q:"Explain how a single base substitution can have anything from no effect to a severe effect on the resulting protein.",
  criteria:[
    "States that a substitution changes one base and therefore potentially one codon",
    "Explains that a silent mutation occurs when the new codon specifies the same amino acid, because the code is degenerate",
    "Explains that a missense mutation changes one amino acid, and the effect depends on whether that amino acid is critical to the protein's shape or active site",
    "Explains that a nonsense mutation creates a premature stop codon, truncating the protein and usually destroying its function",
    "Gives a named example, such as sickle cell anaemia as a missense mutation"
  ],
  keys:[["substitution","one base","single base"],["silent","degenerate","same amino acid"],["missense","one amino acid","active site","shape"],["nonsense","stop codon","truncat","premature"],["sickle","example","haemoglobin"]],
  sample:"A substitution replaces one base with another, altering at most one codon. Because the genetic code is degenerate, several codons often specify the same amino acid, so a change in the third base frequently produces a synonymous codon and no change at all in the polypeptide — a silent mutation. If the new codon specifies a different amino acid the mutation is missense, and the effect depends entirely on where and what: a conservative change in a structurally unimportant region may have no measurable effect, whereas a change in the active site or in a region critical to folding can abolish function. Sickle cell anaemia is a missense mutation in which a single A→T substitution changes glutamic acid to valine at position six of the beta-globin chain, altering the protein's solubility so that it polymerises when deoxygenated. The most severe outcome is a nonsense mutation, in which the new codon is a stop codon; translation ends early and the truncated polypeptide is almost always non-functional.",
  common:["Assumes every mutation is harmful — most are neutral",
          "Omits degeneracy, which is the reason silent mutations exist"] },

{ id:"sa-m6-002", mod:"M6", topic:"Biotechnology", marks:6, tags:["biotech"],
  q:"Describe how bacteria can be genetically modified to produce human insulin, and explain why this is possible.",
  criteria:[
    "States that the human insulin gene is obtained, for example as cDNA made from mRNA using reverse transcriptase",
    "States that a plasmid vector and the gene are cut with the same restriction enzyme, producing complementary sticky ends",
    "States that DNA ligase joins the gene into the plasmid, forming recombinant DNA",
    "States that the recombinant plasmid is taken up by bacteria during transformation",
    "Describes selection of transformed bacteria, for example using an antibiotic resistance marker on the plasmid",
    "Explains that this works because the genetic code is essentially universal, so bacterial ribosomes translate the human gene into the same polypeptide"
  ],
  keys:[["cdna","reverse transcriptase","isolate the gene","mrna"],["restriction enzyme","sticky ends","same enzyme"],["ligase","recombinant"],["transformation","taken up","insert into bacteri"],["marker","antibiotic resistance","selection","select"],["universal","genetic code","same code"]],
  sample:"The human insulin gene is first obtained. A convenient route is to extract mRNA from pancreatic beta cells and use reverse transcriptase to make complementary DNA, which has the advantage of containing no introns. A bacterial plasmid is chosen as the vector, and both the plasmid and the insulin gene are cut with the same restriction enzyme so that both carry complementary single-stranded sticky ends. The two are mixed and DNA ligase seals the sugar-phosphate backbones, producing a recombinant plasmid. Bacteria are then treated so they take up the plasmid — transformation — and are grown on a medium containing the antibiotic whose resistance gene the plasmid also carries, so that only transformed cells survive and can be selected. Those bacteria are cultured in large fermenters and the insulin they express is harvested and purified. This is possible because the genetic code is essentially universal: the same codons specify the same amino acids in bacteria and humans, so a bacterial ribosome reading the human gene produces the human polypeptide. Using cDNA matters because bacteria have no splicing machinery and could not remove introns.",
  common:["Omits the selection step, which is how you know which bacteria worked",
          "Never states why a bacterium can read a human gene at all"] },

{ id:"sa-m6-003", mod:"M6", topic:"Genetic technologies", marks:6, tags:["biotech"],
  q:"Assess the use of genetically modified crops in agriculture.",
  criteria:[
    "Identifies at least two specific benefits, such as pest resistance reducing insecticide use, or improved nutritional content",
    "Identifies at least two specific risks or costs, such as gene flow to wild relatives or evolution of resistance in pest populations",
    "Refers to a named example, such as Bt cotton or golden rice",
    "Recognises that some concerns are ecological and others are social or economic, and distinguishes between them",
    "Notes the strength of the evidence on at least one claim rather than asserting it",
    "Makes an explicit overall judgement supported by the points raised"
  ],
  keys:[["benefit","yield","pest resistance","insecticide","nutrition","drought"],["risk","gene flow","resistance","monoculture","biodiversity"],["bt cotton","golden rice","roundup","example"],["ecological","social","economic","distinguish"],["evidence","studies","no evidence","documented"],["judgement","overall","on balance","conclude"]],
  sample:"Genetically modified crops offer clear benefits. Bt cotton carries a Bacillus thuringiensis gene for a protein toxic to specific caterpillars, and its adoption in Australia reduced insecticide applications substantially, lowering costs and reducing broad-spectrum spraying that also kills beneficial insects. Golden rice was engineered to produce beta-carotene, addressing vitamin A deficiency in populations dependent on rice. Traits can also be introduced in a single generation rather than through many rounds of selective breeding, and from species that could never be crossed conventionally. There are real costs. Ecologically, transgenes can spread by pollen to wild or weedy relatives, and once established in a wild population cannot be recalled; this risk is greatest where the crop has close relatives in the region. Pest populations also evolve resistance to Bt toxin by natural selection, which is why refuge planting is mandated, and resistance has now been documented in several species. Large-scale planting of a single variety reduces crop genetic diversity, so one new pathogen can affect an entire growing region. Socially and economically, patented seed and licensing arrangements can disadvantage smallholder farmers, which is a distinct concern from the ecological ones and should not be argued as though it were evidence of biological harm. The evidence differs in strength across these claims: resistance evolution and gene flow are directly documented, whereas the claim that consuming transgenic DNA is harmful to humans has no supporting mechanism, since dietary DNA is digested to nucleotides. On balance, genetically modified crops are justified where a specific, well-evidenced benefit exists and the ecological risks can be managed through refuge requirements, buffer zones and monitoring, but they are not a general solution and each application deserves assessment on its own evidence.",
  common:["Lists benefits and risks without ever making the judgement 'assess' requires",
          "Treats economic objections as if they were evidence of biological harm",
          "Repeats the claim that eating GM food changes your DNA"] },

{ id:"sa-m6-004", mod:"M6", topic:"Biotechnology", marks:4, tags:["biotech"],
  q:"Explain how gel electrophoresis separates DNA fragments and why the results are useful.",
  criteria:[
    "States that DNA is negatively charged because of its phosphate groups, so it migrates towards the positive electrode",
    "States that the agarose gel acts as a molecular sieve",
    "Explains that smaller fragments move further in a given time, so fragments separate by size",
    "Explains a use, such as comparing DNA profiles or checking the size of a PCR product, with reference to a size standard"
  ],
  keys:[["negative","phosphate","positive electrode","anode"],["gel","agarose","sieve","matrix","pores"],["smaller","further","size"],["profile","comparison","ladder","standard","pcr"]],
  sample:"Every nucleotide carries a negatively charged phosphate group, so DNA fragments carry a net negative charge proportional to their length and migrate towards the positive electrode when a voltage is applied. The agarose gel acts as a molecular sieve: its pores impede large fragments more than small ones, so in a given time smaller fragments travel further and the mixture separates into bands by size. Running a ladder of fragments of known size alongside the samples allows the size of each band to be estimated. This is useful for comparing DNA profiles between individuals — the pattern of STR band positions differs between people — and for confirming that a PCR has amplified a product of the expected length.",
  common:["Says DNA moves because it is 'attracted to the gel'",
          "Reverses the size relationship and says larger fragments travel further"] }
];

BIO.DATA.short_m7 = [
{ id:"sa-m7-001", mod:"M7", topic:"Immunity", marks:5,
  q:"Explain how a vaccine produces long-term immunity to a specific pathogen.",
  criteria:[
    "Identifies that a vaccine contains an antigen from the pathogen — weakened, inactivated, a fragment, or instructions to make one",
    "Describes the primary response: the antigen is recognised, specific B lymphocytes are activated and clonally expand",
    "States that plasma cells produce antibodies specific to that antigen",
    "States that memory B and T cells are produced and persist for years",
    "Explains that on later exposure the memory cells produce a faster, larger secondary response that destroys the pathogen before symptoms develop"
  ],
  keys:[["antigen","weakened","inactivated","fragment","mrna"],["primary response","b lymphocyte","activated","clonal"],["plasma cell","antibody","antibodies"],["memory","persist","remain"],["secondary","faster","larger","before symptoms"]],
  sample:"A vaccine introduces an antigen from the pathogen — a weakened or inactivated form, a surface protein fragment, or mRNA instructing the body to make that protein — without causing the disease. The antigen is taken up and presented, and the B lymphocyte whose receptor matches it is selected and clonally expands. This is the primary response: it is slow, taking one to two weeks, and produces a comparatively low antibody titre. Some of the activated cells differentiate into plasma cells that secrete antibodies specific to that antigen, and crucially others become memory B cells and memory T cells, which persist in circulation for years after the antibodies themselves have declined. If the person later encounters the real pathogen, these memory cells recognise the antigen immediately and proliferate rapidly into plasma cells. The resulting secondary response produces antibodies far sooner and at a much higher concentration, destroying the pathogen before it can reproduce enough to cause symptoms.",
  common:["Says the vaccine 'gives you the disease' rather than an antigen from it",
          "Describes antibodies persisting rather than memory cells — antibody levels fall within months",
          "Never distinguishes the primary from the secondary response"] },

{ id:"sa-m7-002", mod:"M7", topic:"Lines of defence", marks:6,
  q:"Describe the three lines of defence in humans and explain how they work together to prevent disease.",
  criteria:[
    "Describes the first line as non-specific barriers preventing entry, with examples such as skin, mucous membranes, cilia and stomach acid",
    "Describes the second line as a non-specific internal response, with examples such as phagocytosis, inflammation and fever",
    "Describes the third line as the specific adaptive response involving B and T lymphocytes",
    "Distinguishes non-specific from specific: the first two respond identically to any pathogen, the third targets a particular antigen",
    "States that only the third line produces memory cells and therefore immunity",
    "Explains how they act in sequence and overlap — the earlier lines buy time for the slow third line to develop"
  ],
  keys:[["skin","mucous","cilia","stomach acid","barrier"],["phagocyt","inflammation","fever"],["lymphocyte","b cell","t cell","antibody","specific"],["non-specific","specific","any pathogen","particular"],["memory","immunity"],["sequence","buy time","overlap","together"]],
  sample:"The first line of defence is a set of non-specific barriers that prevent pathogens entering: intact skin, mucous membranes trapping particles, cilia sweeping mucus out of the airways, stomach acid at pH 2, lysozyme in tears and saliva, and the competing normal flora. If a pathogen breaches these, the second line responds — also non-specifically. Phagocytes engulf and digest the pathogen, inflammation triggered by histamine increases blood flow and capillary permeability so that more phagocytes and plasma proteins reach the site, and fever raises body temperature to slow pathogen reproduction while speeding immune cell activity. The third line is the specific adaptive response: the particular B lymphocyte whose receptor matches the antigen is selected, proliferates, and produces plasma cells secreting antibodies, while cytotoxic T cells destroy infected host cells and helper T cells coordinate both arms. The essential distinction is that the first two lines respond in the same way to any pathogen, whereas the third targets one particular antigen. Only the third line produces memory cells, so only it confers lasting immunity. They work together in sequence and in overlap: the third line is slow to develop on first exposure, taking one to two weeks, and the first two lines contain the infection during that period. On re-exposure the memory cells act so quickly that the earlier lines often have very little to do.",
  common:["Lists examples without ever distinguishing specific from non-specific",
          "Places fever or phagocytosis in the first line",
          "Says the three lines act one after another only, missing that they overlap"] },

{ id:"sa-m7-003", mod:"M7", topic:"Prevention", marks:5,
  q:"Explain how herd immunity protects individuals who cannot be vaccinated, and why a high vaccination rate is needed.",
  criteria:[
    "States that vaccinated individuals are immune and cannot sustain transmission",
    "Explains that an infected person is therefore likely to contact immune rather than susceptible people",
    "States that transmission chains are broken so an outbreak cannot sustain itself",
    "Identifies who benefits: newborns, the immunocompromised, and those with medical contraindications",
    "Explains that the threshold depends on how contagious the disease is (1 − 1/R₀), so highly contagious diseases such as measles need very high coverage"
  ],
  keys:[["immune","cannot spread","vaccinated"],["contact","susceptible","likely to meet"],["chain","transmission","dies out","outbreak"],["newborn","immunocompromised","cannot be vaccinated","allergy","chemotherapy"],["threshold","r0","measles","95","contagious"]],
  sample:"When a person is vaccinated they develop immunity, so if they encounter the pathogen they neither become seriously ill nor, for most diseases, pass it on. When a high proportion of a population is immune, an infected person's contacts are mostly immune rather than susceptible, so on average each case produces fewer than one new case and chains of transmission are broken. The outbreak therefore dies out rather than spreading, and people who are not themselves immune are protected indirectly because the pathogen never reaches them. This matters for newborns too young to be vaccinated, people undergoing chemotherapy or otherwise immunocompromised, and people with a genuine medical contraindication such as a severe allergy to a vaccine component. The proportion needed is not fixed: it is approximately 1 − 1/R₀, where R₀ is the average number of people one case infects in a fully susceptible population. Measles has an R₀ of around 15, so roughly 95% coverage is needed, which is why measles is the first disease to return when vaccination rates fall, while a disease with an R₀ of 3 requires only about 67%.",
  common:["Says vaccinated people's antibodies protect others directly — antibodies are not transmitted",
          "Gives a single number for the threshold without linking it to how contagious the disease is"] },

{ id:"sa-m7-004", mod:"M7", topic:"Treatment", marks:5,
  q:"Explain why the overuse of antibiotics is a public health problem, and describe two measures that reduce the risk.",
  criteria:[
    "Explains that antibiotic use is a selection pressure favouring pre-existing resistant bacteria",
    "Explains that resistant bacteria survive, reproduce and increase in frequency",
    "Notes that resistance genes can also transfer horizontally on plasmids, spreading between species",
    "Describes one measure, such as prescribing antibiotics only for bacterial infections, and explains how it helps",
    "Describes a second measure, such as completing the prescribed course or restricting agricultural use, and explains how it helps"
  ],
  keys:[["selection pressure","selects","kills susceptible"],["survive","reproduce","frequency","increase"],["plasmid","horizontal","conjugation","between species"],["prescrib","not for viral","only bacterial","stewardship"],["complete the course","agriculture","livestock","hygiene","rotation"]],
  sample:"Every use of an antibiotic applies a selection pressure to the bacteria exposed to it. Susceptible bacteria are killed while any that already carry a resistance allele survive, so the proportion of resistant bacteria in the surviving population rises. Because bacteria reproduce very rapidly, resistance can become common within days, and resistance genes are frequently carried on plasmids that transfer horizontally by conjugation — including between different species — so resistance spreads far faster than vertical inheritance alone would allow. The consequence is that infections that were once routinely treatable become difficult or impossible to treat, and procedures that depend on reliable antibiotic cover, such as surgery and chemotherapy, become much riskier. Two measures reduce the risk. First, antibiotics should be prescribed only where a bacterial infection is confirmed or strongly suspected; prescribing them for viral illnesses such as colds and influenza produces no benefit while applying selection pressure to all the patient's bacteria. Second, patients should complete the full prescribed course, because stopping when symptoms resolve leaves behind precisely those bacteria that were least susceptible, which then reproduce. Restricting the routine use of antibiotics as growth promoters in livestock addresses the same problem at a much larger scale.",
  common:["Says bacteria 'become immune' or 'learn to resist' — describe selection, not learning",
          "Describes the problem but gives measures without explaining how each one helps"] },

{ id:"sa-m7-005", mod:"M7", topic:"Plant defences", marks:4, tags:["plant-defence"],
  q:"Compare the defences of plants against pathogens with those of animals.",
  criteria:[
    "Identifies plant physical barriers such as the waxy cuticle, bark and thickened cell walls",
    "Identifies plant chemical defences such as phenolics, alkaloids and callose deposition",
    "States that plants have no circulating immune cells and produce no antibodies",
    "Identifies a similarity, such as both having physical barriers as a first line, and a key difference such as systemic acquired resistance being non-specific and having no memory cells equivalent to an animal's"
  ],
  keys:[["cuticle","bark","cell wall","physical"],["phenolic","alkaloid","callose","chemical"],["no antibodies","no immune cells","no circulating"],["systemic acquired resistance","similarity","difference","memory"]],
  sample:"Both plants and animals rely first on physical barriers. In plants these are the waxy cuticle, bark, and thickened cell walls, which must be breached before infection can establish; in animals the equivalent is skin and mucous membranes. Both also deploy chemical defences: plants produce phenolics, alkaloids and terpenoids that are toxic or inhibitory to pathogens, and they deposit callose to seal off infected tissue and wall it away from the rest of the plant. The major difference is that plants have no circulating immune cells, no phagocytes and no antibodies, so they have nothing corresponding to an animal's third line of defence. Plants do have a systemic response: local infection triggers signalling molecules such as salicylic acid that prime defence gene expression throughout the plant, giving systemic acquired resistance for weeks. However this response is broad rather than targeted at one antigen, and it does not involve memory cells specific to a particular pathogen, so it is not equivalent to acquired immunity in an animal.",
  common:["Describes plant defences as an 'immune system' with memory in the animal sense",
          "Gives only differences when the question says compare, which requires similarities too"] }
];

BIO.DATA.short_m8 = [
{ id:"sa-m8-001", mod:"M8", topic:"Homeostasis", marks:6, tags:["homeostasis"],
  q:"Explain how blood glucose concentration is maintained within a narrow range after a meal and during prolonged exercise.",
  criteria:[
    "Identifies the pancreas as containing the receptors and control centre, with alpha and beta cells in the islets",
    "States that after a meal, rising glucose is detected by beta cells which secrete insulin",
    "Describes insulin's effects: increased glucose uptake by muscle and fat cells and conversion to glycogen in the liver",
    "States that during exercise, falling glucose is detected by alpha cells which secrete glucagon",
    "Describes glucagon's effects: glycogen is broken down in the liver and glucose released into the blood",
    "Identifies this as negative feedback, in which each response opposes the change and returns glucose towards the set point"
  ],
  keys:[["pancreas","islet","beta cell","alpha cell"],["insulin","beta","rises","high"],["uptake","glycogen","glycogenesis","stored","liver"],["glucagon","alpha","falls","low"],["glycogenolysis","broken down","released"],["negative feedback","opposes","set point"]],
  sample:"Blood glucose is regulated by the pancreas, which acts as both receptor and control centre through the alpha and beta cells of the islets of Langerhans. After a carbohydrate-rich meal, glucose absorbed from the small intestine raises blood glucose above the set point of about 90 mg per 100 mL. The beta cells detect this and secrete insulin into the blood. Insulin increases the number of GLUT4 transporters in the membranes of muscle and adipose cells, so those cells take up glucose more rapidly, and it stimulates the liver to convert glucose to glycogen for storage. Blood glucose therefore falls back towards the set point. During prolonged exercise, muscle cells consume glucose rapidly and blood glucose begins to fall below the set point. The alpha cells detect this and secrete glucagon, which stimulates the liver to break glycogen down into glucose and release it into the blood, and also promotes the formation of glucose from non-carbohydrate sources. Blood glucose therefore rises back towards the set point. Both mechanisms are negative feedback: in each case the response produced opposes the change that triggered it, which is what keeps the variable within a narrow range rather than allowing it to drift.",
  common:["Reverses insulin and glucagon",
          "Names the hormones but never states which cells detect the change",
          "Never uses the term negative feedback, which the marking guide usually requires"] },

{ id:"sa-m8-002", mod:"M8", topic:"Kidney", marks:6, tags:["homeostasis"],
  q:"Explain how the kidney produces concentrated urine when the body is dehydrated.",
  criteria:[
    "States that osmoreceptors in the hypothalamus detect the increased solute concentration of the blood",
    "States that the posterior pituitary releases ADH into the blood",
    "Explains that ADH increases the permeability of the collecting duct by inserting aquaporins into the membrane",
    "Explains that the loop of Henle has established a salt concentration gradient in the medulla by active transport from the ascending limb",
    "Explains that water therefore moves out of the collecting duct by osmosis into the medulla and is reabsorbed into the blood",
    "States that a smaller volume of more concentrated urine is produced, and identifies this as negative feedback restoring blood concentration"
  ],
  keys:[["osmoreceptor","hypothalamus","detect"],["adh","posterior pituitary","antidiuretic"],["aquaporin","permeab","collecting duct"],["loop of henle","gradient","medulla","active transport","countercurrent"],["osmosis","water reabsorb","out of the collecting duct"],["concentrated","small volume","negative feedback"]],
  sample:"When the body is dehydrated the solute concentration of the blood rises. Osmoreceptors in the hypothalamus detect this increase and signal the posterior pituitary to release antidiuretic hormone into the blood. ADH travels to the kidney and binds receptors on the cells of the collecting duct, causing vesicles containing aquaporin channels to fuse with the membrane. This makes the collecting duct far more permeable to water. Meanwhile the loop of Henle has established a steep salt concentration gradient in the medulla: sodium and chloride ions are actively transported out of the ascending limb, which is impermeable to water, while the descending limb is permeable to water, and this countercurrent multiplier makes the deep medulla very concentrated. As filtrate passes down the collecting duct through this increasingly concentrated medulla, water moves out by osmosis through the aquaporins and is carried away in the blood. The result is a small volume of concentrated urine. This is negative feedback: reabsorbing water lowers the blood's solute concentration back towards the set point, osmoreceptor stimulation falls, and ADH secretion decreases.",
  common:["Says ADH 'pumps water out' — the movement is osmosis; ADH only changes permeability",
          "Omits the medullary gradient, without which the aquaporins would achieve nothing"] },

{ id:"sa-m8-003", mod:"M8", topic:"Epidemiology", marks:6, tags:["epidemiology"],
  q:"A study reports that people who eat more processed meat have higher rates of bowel cancer. Assess whether this shows that processed meat causes bowel cancer.",
  criteria:[
    "States that the study shows a correlation, which alone does not establish causation",
    "Identifies confounding as a specific alternative explanation and gives a plausible confounder",
    "Identifies reverse causation or chance as further alternative explanations, or notes the limitations of the study design",
    "Identifies what evidence would strengthen a causal claim: dose-response, temporality, a plausible biological mechanism",
    "Notes that a randomised controlled trial would be the strongest design but is often impractical or unethical for a dietary exposure",
    "Reaches a judgement proportionate to the evidence rather than accepting or dismissing the claim outright"
  ],
  keys:[["correlation","association","not causation"],["confound","confounding","third variable"],["reverse causation","chance","sample","observational"],["dose-response","temporality","mechanism","plausib"],["randomised","rct","unethical","impractical"],["judgement","on balance","proportionate","conclude"]],
  sample:"The study establishes an association between processed meat consumption and bowel cancer, but an association alone does not establish causation. The most important alternative explanation is confounding: people who eat more processed meat may differ systematically in other ways that also affect bowel cancer risk — lower dietary fibre, higher alcohol consumption, higher body mass, less physical activity, or lower socioeconomic status with reduced access to screening. Any of these could produce the observed association without processed meat itself contributing. Reverse causation is less plausible here, since early bowel cancer is unlikely to increase meat consumption, and chance is unlikely if the sample is large, but both should be considered. Several kinds of evidence would strengthen a causal interpretation. A dose-response relationship, in which risk rises steadily with the amount consumed, is difficult to explain by confounding unless the confounder is graded in the same way. Temporality — establishing that the exposure preceded the disease, which a prospective cohort study can do but a retrospective one cannot — is essential. A plausible biological mechanism matters greatly, and one exists: nitrites used in curing form N-nitroso compounds in the gut, and these are demonstrably genotoxic. Consistency across independent studies in different populations further strengthens the case. A randomised controlled trial would provide the strongest evidence because randomisation balances confounders, but randomly assigning people to eat processed meat for decades is neither practical nor ethical, so causal conclusions here necessarily rest on observational evidence assessed against these criteria. On balance, the single study described does not show causation, but the wider evidence — a consistent dose-response relationship across many cohorts together with an identified mechanism — supports a modest causal contribution, which is why processed meat is classified as a carcinogen while the absolute increase in individual risk remains small.",
  common:["Concludes 'correlation is not causation' and stops, without saying what would settle it",
          "Never names a specific plausible confounder"] },

{ id:"sa-m8-004", mod:"M8", topic:"Disorders", marks:5, tags:["disorders"],
  q:"Compare the causes of conductive and sensorineural hearing loss, and evaluate the effectiveness of one technology used to manage each.",
  criteria:[
    "States that conductive loss involves impaired transmission of sound through the outer or middle ear",
    "States that sensorineural loss involves damage to the cochlear hair cells or the auditory nerve",
    "Identifies hearing aids as appropriate for conductive loss and explains that amplification works because the cochlea still functions",
    "Identifies cochlear implants as appropriate for sensorineural loss and explains that they stimulate the auditory nerve directly, bypassing damaged hair cells",
    "Evaluates: notes at least one limitation, such as hearing aids being ineffective where hair cells are destroyed, or implants requiring surgery and providing a different quality of sound that needs learning"
  ],
  keys:[["conductive","outer","middle ear","transmission","ossicle"],["sensorineural","hair cell","cochlea","auditory nerve"],["hearing aid","amplif"],["cochlear implant","electrode","bypass","stimulate"],["limitation","not effective","surgery","learn","quality","cost"]],
  sample:"Conductive hearing loss arises when sound is not transmitted efficiently through the outer or middle ear — from impacted wax, fluid behind the eardrum, a perforated tympanic membrane, or fused ossicles. The cochlea and auditory nerve are undamaged, so the problem is mechanical. Sensorineural hearing loss arises from damage to the cochlear hair cells or to the auditory nerve, caused by ageing, prolonged loud noise exposure, some medications or genetic conditions. Here the transduction of sound into nerve impulses fails, and human hair cells do not regenerate. A hearing aid manages conductive loss: it amplifies incoming sound so that enough energy reaches a functioning cochlea. It is effective, non-invasive and relatively cheap, but it is largely useless in severe sensorineural loss, because making the sound louder does not help if there are no hair cells to transduce it, and it can amplify background noise as well as speech. A cochlear implant manages severe sensorineural loss: an external microphone and processor convert sound into electrical signals, and an electrode array inserted into the cochlea stimulates the auditory nerve directly, bypassing the hair cells altogether. It can restore useful hearing, including speech comprehension, where a hearing aid cannot. Its limitations are that it requires surgery with the associated risks, it is expensive, the sound quality differs from natural hearing and the user must learn to interpret it over months, and outcomes are best when it is fitted early. Each technology is effective for the type of loss it addresses and largely ineffective for the other, which is why accurate diagnosis of the type of loss comes first.",
  common:["Recommends a hearing aid for sensorineural loss",
          "Describes both technologies but never evaluates, which the question asks for"] },

{ id:"sa-m8-005", mod:"M8", topic:"Homeostasis", marks:5, tags:["homeostasis"],
  q:"Explain how the body responds when core temperature falls below the set point.",
  criteria:[
    "States that thermoreceptors in the skin and hypothalamus detect the fall",
    "Identifies the hypothalamus as the control centre coordinating the response",
    "Describes vasoconstriction of skin arterioles, reducing blood flow to the surface and so reducing heat loss",
    "Describes shivering: rapid involuntary contraction of skeletal muscle generating heat from respiration",
    "Identifies at least one further response, such as piloerection, reduced sweating, increased metabolic rate via thyroxine, or behavioural responses"
  ],
  keys:[["thermoreceptor","detect","skin","hypothalamus"],["hypothalamus","control centre","coordinates"],["vasoconstriction","constrict","reduce blood flow","less heat loss"],["shiver","muscle","contract","respiration","heat"],["piloerection","hair","sweating","thyroxine","metabolic","behaviour"]],
  sample:"Thermoreceptors in the skin detect a fall in external temperature and central thermoreceptors in the hypothalamus detect the fall in the temperature of the blood. The hypothalamus acts as the control centre, comparing this against the set point of about 37 °C and coordinating effector responses through the autonomic nervous system. Arterioles supplying the skin capillaries undergo vasoconstriction, so less warm blood flows near the surface and less heat is lost by radiation and convection. Skeletal muscles begin rapid involuntary contraction — shivering — and the increased rate of respiration in those muscles releases heat. Sweat production is reduced or stopped so that heat is not lost by evaporation, and the erector pili muscles contract to raise body hairs, trapping a layer of insulating air, though this is of limited value in humans. Over longer periods the hypothalamus stimulates the release of thyroxine, raising basal metabolic rate and so heat production. Behavioural responses such as putting on clothing, curling up to reduce exposed surface area or seeking shelter also contribute. All of these oppose the original fall, so core temperature returns towards the set point — negative feedback.",
  common:["Describes vasoconstriction as blood vessels 'moving deeper' — they constrict, they do not move",
          "Omits the receptor and control centre and describes only the effectors"] }
];
