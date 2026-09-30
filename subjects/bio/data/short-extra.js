/* Short answer with marking criteria — second pass.
   Weighted to Year 12 and to the command words that carry the most marks:
   explain, compare, assess, evaluate, justify. */
window.BIO = window.BIO || {}; BIO.DATA = BIO.DATA || {};

BIO.DATA.short_extra_y11 = [
{ id:"sx-001", mod:"M1", topic:"Cell structure", marks:5,
  q:"Assess the evidence for the endosymbiotic theory of the origin of mitochondria and chloroplasts.",
  criteria:[
    "States the theory: mitochondria and chloroplasts descend from free-living prokaryotes engulfed by an ancestral eukaryotic cell",
    "Gives molecular evidence: both contain their own circular DNA, like a bacterial chromosome",
    "Gives further evidence: both contain 70S ribosomes, the prokaryotic size, rather than the 80S ribosomes of the host cytoplasm",
    "Gives structural or behavioural evidence: a double membrane, and division by a process resembling binary fission independent of the host cell cycle",
    "Makes a judgement: the evidence is strong because several independent lines converge, and because these features are difficult to explain under any alternative account"
  ],
  keys:[["endosymbiotic","engulfed","prokaryote"],["circular dna","own dna"],["70s","ribosome"],["double membrane","binary fission","divide independently"],["judgement","strong","converge","independent lines"]],
  sample:"The endosymbiotic theory proposes that mitochondria and chloroplasts are descended from free-living prokaryotes that were engulfed by a larger ancestral cell and retained rather than digested, becoming permanent residents. Several independent lines of evidence support this. Both organelles contain their own DNA, and that DNA is circular, as a bacterial chromosome is, rather than linear like the host's nuclear DNA. Both contain 70S ribosomes, the size found in prokaryotes, rather than the 80S ribosomes of the surrounding cytoplasm, and antibiotics that target bacterial ribosomes also affect them. Both are bounded by a double membrane, consistent with the outer membrane having been the host vesicle that engulfed them, and both divide by a process resembling binary fission on their own schedule rather than being assembled by the cell. The evidence is strong, principally because these lines are independent of one another and converge on the same explanation, and because features such as circular DNA and prokaryote-sized ribosomes are difficult to account for under any alternative. The main limitation is that the events themselves are unobservable and roughly two billion years old, so the case is inferential rather than direct.",
  common:["Lists what mitochondria do rather than where they came from — ATP production is not evidence of ancestry",
          "Gives the evidence but never makes the judgement an 'assess' question requires"] },

{ id:"sx-002", mod:"M1", topic:"Enzymes", marks:5,
  q:"Design an investigation to determine the optimum pH of the enzyme catalase. Identify the variables and explain how you would ensure the results are valid.",
  criteria:[
    "Identifies the independent variable as pH, set using buffer solutions across a stated range",
    "Identifies the dependent variable as the rate of reaction, measured as volume of oxygen produced per unit time",
    "Identifies at least three controlled variables, such as temperature, substrate concentration, enzyme concentration and volume",
    "Describes repeating each pH at least three times and taking a mean",
    "Explains that validity comes from changing only pH while holding everything else constant, so any change in rate can be attributed to pH"
  ],
  keys:[["ph","buffer","independent"],["oxygen","rate","dependent","per minute"],["temperature","concentration","controlled","same volume"],["repeat","three times","mean","replicate"],["valid","only pH","attribute","control"]],
  sample:"The independent variable is pH, set using buffer solutions at pH 3, 5, 7, 9 and 11 so that each value is held steady during the reaction. The dependent variable is the rate of reaction, measured as the volume of oxygen collected in a gas syringe in the first 30 seconds, since an initial rate avoids the fall-off as substrate is consumed. Controlled variables include temperature, held at 25 °C in a water bath; hydrogen peroxide concentration and volume; the mass and source of the catalase preparation; and the surface area of any tissue used. Each pH would be repeated at least three times and a mean taken, with anomalies identified and repeated rather than discarded silently. Validity depends on changing only pH: if temperature or substrate concentration also varied, a change in rate could not be attributed to pH. Reliability comes from the repeats and from the consistency between them. The optimum is read as the pH giving the highest mean rate, and the range should extend far enough either side of it that a peak is actually visible rather than assumed.",
  common:["Confuses the independent and dependent variables",
          "Says 'keep everything else the same' without naming which variables",
          "Uses total oxygen after several minutes rather than an initial rate"] },

{ id:"sx-003", mod:"M2", topic:"Gas exchange", marks:5,
  q:"Compare gas exchange in a fish gill with gas exchange in a mammalian lung.",
  criteria:[
    "Identifies a shared feature: both have a very large surface area and a very short diffusion distance",
    "Identifies a shared feature: both maintain a concentration gradient using a blood supply that removes oxygenated blood",
    "Describes the gill: water flows over lamellae in the opposite direction to blood, a countercurrent arrangement",
    "Explains that countercurrent flow maintains a gradient along the whole exchange surface, whereas the lung's tidal flow does not",
    "Notes a further difference: gills are supported by water and would collapse in air, while alveoli require a moist internal surface and surfactant"
  ],
  keys:[["surface area","diffusion distance","both"],["gradient","blood supply","capillary"],["countercurrent","opposite direction","lamellae"],["whole length","tidal","along the entire"],["collapse","moist","surfactant","water supports"]],
  sample:"Both surfaces share the features that Fick's principle demands: an extremely large surface area, a barrier only one or two cells thick, and a dense capillary network that carries oxygenated blood away and so maintains the concentration gradient. The important difference is in how that gradient is sustained. In a fish gill, water flows across the lamellae in the opposite direction to the blood beneath them. This countercurrent arrangement means blood at every point along the lamella meets water slightly richer in oxygen than itself, so a gradient exists across the whole exchange surface and up to about 80% of the dissolved oxygen can be extracted. A mammalian lung is instead ventilated tidally: air moves in and out along the same route, residual air is never fully replaced, and equilibrium between alveolar air and blood is approached rather than avoided. Air compensates by containing far more oxygen per unit volume than water does. There are also structural differences: gill filaments are supported by the water around them and collapse into a clumped mass in air, which is why a fish suffocates out of water despite the oxygen available, while alveoli must be kept moist for gases to dissolve and require surfactant to stop them collapsing on exhalation.",
  common:["Describes each system separately without ever comparing them",
          "Gives only differences when the question says compare, which requires similarities too"] },

{ id:"sx-004", mod:"M3", topic:"Evidence for evolution", marks:5,
  q:"Explain how the theory of evolution by natural selection accounts for the diversity of marsupials in Australia.",
  criteria:[
    "States that Australia separated from Gondwana, isolating an ancestral marsupial population",
    "Explains that placental mammals were largely absent, leaving many niches unoccupied",
    "Explains that populations spreading into different habitats experienced different selection pressures",
    "States that variation already present was acted on, so allele frequencies diverged between populations",
    "Names the outcome as adaptive radiation, and identifies convergence with placental mammals elsewhere as supporting evidence"
  ],
  keys:[["gondwana","isolat","separated"],["niche","placental","vacant","absent"],["selection pressure","different habitat","arid","forest"],["variation","allele frequenc","diverge"],["adaptive radiation","convergen","thylacine","marsupial mole"]],
  sample:"Australia separated from Gondwana around 45 million years ago, isolating a population of ancestral marsupials on a drifting continent. Placental mammals, which came to dominate elsewhere, were largely absent, so a very wide range of ecological niches — grazing, burrowing, gliding, predation — was unoccupied. As marsupial populations spread into arid interior, wet forest and coastal habitats, each population encountered different selection pressures relating to diet, climate, predators and water availability. Natural selection acted on the heritable variation already present in each population: individuals whose variations suited their local conditions survived and reproduced more, so allele frequencies in the separate populations diverged over many generations. Where populations also became reproductively isolated, they became separate species. The result is adaptive radiation: a single ancestral lineage giving rise to many species occupying different niches, from the marsupial mole to the kangaroo. Strong supporting evidence comes from convergence — the extinct thylacine closely resembled a placental wolf, and the marsupial mole resembles placental moles, because similar selection pressures produced similar solutions in lineages that had been separate for tens of millions of years.",
  common:["Says the marsupials 'adapted to fill the niches' as though the change were purposeful",
          "Never mentions that the variation had to exist before selection could act on it"] }
];

BIO.DATA.short_extra_y12 = [
{ id:"sx-101", mod:"M5", topic:"DNA", marks:5,
  q:"Explain how the structure of DNA allows it to be replicated accurately.",
  criteria:[
    "States that DNA is a double helix of two antiparallel strands held by hydrogen bonds",
    "Explains that the weak hydrogen bonds can be broken by helicase without breaking the sugar-phosphate backbone",
    "States that complementary base pairing (A–T, C–G) means each strand carries the information to rebuild the other",
    "Explains that each new molecule keeps one original strand and one new strand — semi-conservative replication",
    "Identifies a source of accuracy: DNA polymerase proofreads as it goes and mismatch repair corrects remaining errors"
  ],
  keys:[["double helix","antiparallel","two strands"],["helicase","hydrogen bonds","unwind","backbone"],["complementary","base pairing","template"],["semi-conservative","one original","one new"],["proofread","polymerase","mismatch repair","error rate"]],
  sample:"DNA is a double helix of two antiparallel polynucleotide strands, joined along their length by hydrogen bonds between complementary bases. The bonds holding the two strands together are weak hydrogen bonds, while the sugar-phosphate backbone of each strand is held by strong covalent bonds. This difference is what makes replication possible: helicase can unzip the two strands without damaging either one. Because adenine pairs only with thymine and cytosine only with guanine, each separated strand carries all the information needed to rebuild its partner exactly, so each acts as a template. DNA polymerase assembles a new complementary strand against each template from free nucleotides, and the result is two molecules each containing one original and one newly synthesised strand — semi-conservative replication, confirmed by Meselson and Stahl's density experiment with ¹⁵N. Accuracy comes from three things: the geometry of base pairing, which only permits a purine opposite a pyrimidine; the proofreading activity of DNA polymerase, which excises a mismatched nucleotide immediately after adding it; and mismatch repair enzymes that scan the new strand afterwards. Together these give an error rate of roughly one base in a billion.",
  common:["Says the covalent bonds are broken during replication — it is the hydrogen bonds",
          "Describes the process but never links accuracy back to the structure the question asks about"] },

{ id:"sx-102", mod:"M5", topic:"Inheritance", marks:6,
  q:"Two plants heterozygous for both height and flower colour are crossed. Height (T tall, t dwarf) and colour (P purple, p white) show complete dominance and assort independently. Determine the expected phenotypic ratio, and explain what result would suggest the two genes are linked.",
  criteria:[
    "States both parental genotypes as TtPp",
    "Identifies the four gamete types from each parent: TP, Tp, tP, tp",
    "Determines the phenotypic ratio as 9 tall purple : 3 tall white : 3 dwarf purple : 1 dwarf white",
    "Explains that the ratio arises because each locus independently gives 3:1 and the two are multiplied",
    "States that a significant excess of parental phenotype combinations, with far fewer recombinants than expected, would suggest linkage",
    "Explains that linked genes are on the same chromosome and are separated only when crossing over occurs between them"
  ],
  keys:[["ttpp","heterozygous both"],["tp","gamete","four types"],["9:3:3:1","nine","ratio"],["multiply","independent","3:1 each"],["excess","parental","fewer recombinant","departure"],["same chromosome","linked","crossing over"]],
  sample:"Both parents are TtPp. Each produces four gamete types in equal proportion — TP, Tp, tP and tp — because the two loci assort independently at metaphase I. A 4 × 4 Punnett square gives sixteen combinations with a phenotypic ratio of 9 tall purple : 3 tall white : 3 dwarf purple : 1 dwarf white. The same answer follows more quickly by multiplying the single-locus probabilities: each locus alone gives 3 dominant : 1 recessive, so 3/4 × 3/4 = 9/16 show both dominant traits, 3/4 × 1/4 = 3/16 show each single-dominant combination, and 1/4 × 1/4 = 1/16 show both recessives. If the two genes were in fact linked — located close together on the same chromosome — the observed offspring would depart from this ratio in a characteristic way: the two parental combinations would appear in large excess and the two recombinant combinations would be much rarer than 3/16 each. This happens because linked alleles travel together into the same gamete unless a crossover occurs between their loci during prophase I. The closer together the loci are, the less often a crossover falls between them and the rarer the recombinants, which is how genetic maps are built.",
  common:["Reports the 9:3:3:1 ratio but assigns the phenotypes to the wrong categories",
          "Says linked genes can never be separated — crossing over separates them, just less often"] },

{ id:"sx-103", mod:"M6", topic:"Genetic technologies", marks:6, tags:["biotech"],
  q:"Evaluate the use of CRISPR-Cas9 gene editing in humans.",
  criteria:[
    "Explains how CRISPR-Cas9 works: a guide RNA directs the Cas9 nuclease to a chosen complementary sequence, which it cuts",
    "Identifies a specific benefit, such as treating single-gene disorders like sickle cell anaemia or beta-thalassaemia",
    "Identifies a technical limitation, such as off-target cuts elsewhere in the genome or mosaicism",
    "Distinguishes somatic editing, which affects only the patient, from germline editing, which is inherited by all descendants",
    "Raises a societal or ethical consideration, such as consent for future generations, equity of access, or the boundary between treatment and enhancement",
    "Makes an explicit judgement supported by the points raised"
  ],
  keys:[["guide rna","cas9","cut","targeted"],["sickle","thalassaemia","single gene","treat"],["off-target","mosaic","limitation","unintended"],["somatic","germline","inherited","descendant"],["consent","equity","enhancement","ethic"],["judgement","on balance","conclude","justified"]],
  sample:"CRISPR-Cas9 uses a short guide RNA complementary to a chosen DNA sequence to direct the Cas9 nuclease to that exact site, where it cuts both strands. The cell's repair machinery then either disrupts the gene or, if a template is supplied, incorporates a corrected sequence. Its principal advantage over earlier methods is precision: genes are edited where intended rather than inserted at random, which removes a major source of unpredictable harm. The clearest benefits are in single-gene disorders. Therapies for sickle cell anaemia and beta-thalassaemia edit a patient's own blood stem cells outside the body and return them, and have produced sustained results in trials. Because the editing is done ex vivo on cells that can be checked before reinfusion, the risk is far more controllable than editing inside the body. There are real technical limitations. Off-target cuts at sequences similar to the guide can disrupt genes elsewhere in the genome, including tumour suppressors, and are difficult to rule out completely. Editing an embryo can produce mosaicism, where only some cells carry the change. Long-term follow-up data is still limited relative to the permanence of the intervention. The decisive distinction is between somatic and germline editing. Somatic editing affects only the consenting patient and is ethically comparable to other novel therapies. Germline editing is inherited by every descendant, who cannot consent, and any off-target error is inherited with it; it is currently prohibited in most jurisdictions and its unauthorised use in 2018 was widely condemned. Broader concerns include cost and equity of access, and where treatment ends and enhancement begins. On balance, somatic CRISPR therapy for serious single-gene disorders is justified where no adequate alternative exists, because the benefit is large, the risk is bounded and the patient consents. Germline editing is not currently justified, because the risks are inherited by people who cannot consent and the therapeutic need can almost always be met by embryo screening instead.",
  common:["Treats somatic and germline editing as the same ethical question",
          "Describes the technique thoroughly and then never evaluates it"] },

{ id:"sx-104", mod:"M7", topic:"Pathogens", marks:5,
  q:"Explain why an infection caused by a virus is treated differently from an infection caused by a bacterium.",
  criteria:[
    "States that bacteria are cells with their own metabolism, cell walls and 70S ribosomes",
    "States that viruses are not cells and replicate using the host cell's machinery",
    "Explains that antibiotics work by targeting structures or processes unique to bacteria, such as peptidoglycan wall synthesis or the 70S ribosome",
    "Explains that viruses have none of these targets, so antibiotics are ineffective against them",
    "States what is used instead: antivirals blocking a step in the viral cycle, and vaccination for prevention — and notes the difficulty of harming the virus without harming the host cell"
  ],
  keys:[["bacteria","cell","metabolism","wall","70s"],["virus","not a cell","host machinery","no metabolism"],["antibiotic","peptidoglycan","ribosome","target"],["no target","ineffective","none of these"],["antiviral","vaccin","host cell","difficult"]],
  sample:"A bacterium is a complete cell with its own metabolism, a peptidoglycan cell wall, 70S ribosomes and its own enzymes for folate synthesis and DNA replication. These structures either differ from the human equivalents or have no human equivalent at all, which gives antibiotics something to attack selectively: penicillin blocks cross-linking in the peptidoglycan wall, tetracycline binds the 70S ribosome, and neither has a target in a human cell. A virus is not a cell. It consists of nucleic acid in a protein capsid, sometimes with a lipid envelope, and it has no cell wall, no ribosomes and no metabolism of its own. It replicates by entering a host cell and using that cell's ribosomes, enzymes and nucleotides. Antibiotics therefore have nothing to bind to, and prescribing them for a viral illness produces no benefit while still selecting for resistance among the patient's bacteria. Viral infections are instead managed with antivirals, which block a specific step in the viral cycle such as entry, genome replication or release, and prevented by vaccination. Antivirals are harder to design than antibiotics precisely because the virus uses host machinery, so a drug that stops viral replication risks stopping the host cell's own processes as well.",
  common:["Says antibiotics 'are not strong enough' for viruses rather than explaining the absence of a target",
          "Never explains why prescribing antibiotics for a virus is actively harmful"] },

{ id:"sx-105", mod:"M7", topic:"Prevention", marks:6,
  q:"Assess the effectiveness of the strategies used to control the spread of a named infectious disease.",
  criteria:[
    "Names a specific disease and identifies its mode of transmission",
    "Describes at least two control strategies and links each to the transmission route it interrupts",
    "Provides evidence of effectiveness, such as a fall in case numbers, incidence or mortality",
    "Identifies at least one limitation, such as cost, compliance, an animal reservoir, resistance or antigenic change",
    "Distinguishes strategies that prevent infection from those that treat it or limit its consequences",
    "Makes an explicit overall judgement about effectiveness, supported by the evidence given"
  ],
  keys:[["malaria","tuberculosis","covid","influenza","cholera","measles"],["transmission","vector","droplet","water","interrupt"],["evidence","fell","reduced","cases","mortality","incidence"],["limitation","resistance","cost","compliance","reservoir"],["prevent","treat","distinguish"],["judgement","overall","on balance","effective"]],
  sample:"Malaria is caused by the protozoan Plasmodium and transmitted between humans by female Anopheles mosquitoes, so every control strategy targets either the vector, the parasite, or contact between them. Insecticide-treated bed nets interrupt transmission at the point of biting, which is concentrated at night when Anopheles feeds; indoor residual spraying kills mosquitoes that rest on walls after feeding; larval source management removes standing water where mosquitoes breed. These are preventive. Rapid diagnostic testing followed by artemisinin-based combination therapy is a treatment strategy: it does not stop transmission directly, but by clearing parasites quickly it reduces both mortality and the reservoir of infection available to biting mosquitoes. The evidence for effectiveness is substantial. Global malaria mortality fell by roughly half between 2000 and 2015, and modelling attributes the largest single share of that decline to insecticide-treated nets. Deaths in children under five fell particularly sharply. There are clear limitations. Anopheles populations have evolved resistance to pyrethroid insecticides across much of sub-Saharan Africa, and artemisinin resistance has emerged in South-East Asia — both by the same natural selection logic that produces antibiotic resistance, and both eroding tools that previously worked. Bed nets only protect people who use them consistently and correctly, so compliance matters as much as distribution. Funding is external and vulnerable to interruption, and progress stalled after 2015. The RTS,S vaccine adds protection but its efficacy is modest compared with vaccines for other diseases. Overall, the strategies have been highly effective in reducing mortality — the fall in child deaths is large, measurable and attributable — but they have not been effective at elimination, and their effectiveness is not stable: it depends on continued funding and is being actively degraded by the evolution of resistance. Sustained control therefore requires rotating insecticides, combination therapies to slow resistance, and continued investment rather than a single intervention.",
  common:["Lists control measures without linking each one to the transmission route it interrupts",
          "Gives no evidence, so the 'assessment' rests on assertion",
          "Never distinguishes preventing infection from treating it"] },

{ id:"sx-106", mod:"M8", topic:"Homeostasis", marks:5, tags:["homeostasis"],
  q:"Compare the nervous and endocrine systems as means of coordinating a response.",
  criteria:[
    "States that the nervous system transmits electrical impulses along neurons while the endocrine system releases hormones into the blood",
    "Compares speed: nervous responses occur in milliseconds, endocrine responses in seconds to hours",
    "Compares duration: nervous effects are brief, endocrine effects are longer-lasting",
    "Compares targeting: nerve impulses travel to a specific effector, whereas hormones reach all tissues but affect only cells with the matching receptor",
    "Identifies a similarity, such as both using chemical messengers at some point and both operating through negative feedback, and gives an example of the two working together"
  ],
  keys:[["impulse","neuron","hormone","blood"],["fast","milliseconds","slow","seconds"],["short","brief","long-lasting","duration"],["specific effector","target","receptor","widespread"],["both","negative feedback","neurotransmitter","together","hypothalamus","adrenaline"]],
  sample:"The nervous system coordinates responses by transmitting electrical impulses along neurons to a specific effector, while the endocrine system releases hormones from glands into the bloodstream. The differences follow from those two mechanisms. Nervous transmission is extremely fast, acting within milliseconds, whereas a hormone must be carried in the blood and so acts within seconds to hours. Nervous effects are brief and stop when the impulses stop, whereas hormonal effects persist while the hormone remains in circulation and can last hours or, in the case of growth hormones, years. Nervous signalling is precisely targeted: the impulse reaches only the muscle or gland at the end of that pathway. Hormones reach every tissue the blood supplies, but affect only cells carrying the specific receptor, so their targeting is chemical rather than anatomical and is typically more widespread. There are important similarities. Both are chemical at the point of delivery — neurons signal across a synapse using neurotransmitter, and some molecules such as adrenaline act as both neurotransmitter and hormone. Both operate through negative feedback, and both are coordinated by the hypothalamus, which is where they meet: it receives neural input and controls the pituitary, and so converts a nervous signal into an endocrine one. Thermoregulation shows them working together — nervous signals produce immediate vasoconstriction and shivering while thyroxine raises metabolic rate over a longer period.",
  common:["Describes each system in turn without ever comparing them on the same criteria",
          "Says hormones only reach their target organ — they reach everywhere, but only receptor-bearing cells respond"] },

{ id:"sx-107", mod:"M8", topic:"Disorders", marks:5, tags:["disorders"],
  q:"Explain how the structure of the eye allows an image to be focused on the retina, and describe one disorder in which this fails.",
  criteria:[
    "States that light is refracted first and most strongly by the cornea",
    "States that the lens makes the fine adjustment, changing shape to focus at different distances",
    "Describes accommodation: the ciliary muscle contracts and the suspensory ligaments slacken so the lens becomes more convex for near objects",
    "States that a sharp image forms on the retina, where rods and cones convert light into nerve impulses",
    "Describes a named disorder correctly, such as myopia (light focused in front of the retina, usually from an over-long eyeball, corrected with a concave lens)"
  ],
  keys:[["cornea","refract","most"],["lens","fine","adjust","focus"],["ciliary muscle","suspensory","convex","accommodation"],["retina","rod","cone","impulse"],["myopia","hyperopia","in front","behind","concave","convex","corrected"]],
  sample:"Light entering the eye is refracted first at the air-cornea boundary, which is where the largest single change of direction occurs because the difference in refractive index there is greatest. The cornea's curvature is fixed, so it provides most of the focusing power but none of the adjustment. Fine adjustment is made by the lens through accommodation. To focus on a near object the ciliary muscle contracts, which reduces the tension in the suspensory ligaments and allows the elastic lens to become shorter and fatter, increasing its refractive power. To focus on a distant object the ciliary muscle relaxes, tension in the ligaments rises and the lens is pulled thinner. If the combined refraction brings the light to a point exactly at the retina, a sharp inverted image forms there, and the rods and cones convert it into nerve impulses carried to the visual cortex by the optic nerve. In myopia, or short-sightedness, this fails for distant objects: the eyeball is too long from front to back, or the cornea too steeply curved, so parallel light from a distant object is brought to a focus in front of the retina and has begun to diverge again by the time it arrives, giving a blurred image. Near objects still focus correctly because light from them enters diverging. It is corrected with a concave, diverging lens that spreads the light slightly before it reaches the cornea, moving the focal point back onto the retina.",
  common:["Credits the lens with most of the refraction — the cornea does most of it",
          "Reverses the ciliary muscle action: it CONTRACTS for near vision, which slackens the ligaments"] },

{ id:"sx-108", mod:"M8", topic:"Epidemiology", marks:6, tags:["epidemiology"],
  q:"Explain how epidemiological studies are used to identify the causes of a non-infectious disease, and outline the limitations of this evidence.",
  criteria:[
    "States that epidemiology studies the patterns, causes and distribution of disease in populations rather than individuals",
    "Describes identifying a pattern: comparing incidence between groups differing in some exposure",
    "Describes a study design and what it contributes, such as a cohort study establishing that exposure preceded disease",
    "Explains that an association is strengthened by a dose-response relationship, a plausible mechanism and consistency across studies",
    "Identifies confounding as a limitation, with an example",
    "Identifies a further limitation, such as the impossibility of randomising harmful exposures, recall bias, or that population-level findings do not predict individual outcomes"
  ],
  keys:[["population","pattern","distribution","incidence"],["compare","group","exposure","incidence"],["cohort","case-control","temporality","preceded"],["dose-response","mechanism","consistency","plausib"],["confound","third variable","example"],["cannot randomise","unethical","recall bias","individual"]],
  sample:"Epidemiology studies the distribution and determinants of disease in populations rather than in individuals, which is what makes it useful for non-infectious disease where no single pathogen can be isolated. It begins by identifying a pattern: incidence is compared between groups that differ in some exposure — smokers and non-smokers, or populations with different diets — and a difference in rates generates a hypothesis. Study design then determines how much that difference is worth. A cohort study follows exposed and unexposed groups forward in time and can establish temporality, showing that the exposure preceded the disease, which a retrospective study cannot. A case-control study compares people who have the disease with matched people who do not, which is faster and works for rare diseases but relies on recalled exposure. An association is strengthened when risk rises steadily with the level of exposure, because a confounder would have to be graded in the same way; when a plausible biological mechanism exists, such as identified carcinogens in tobacco smoke; when the finding is consistent across different populations and researchers; and when risk falls after the exposure is removed. The limitations are real. The most important is confounding: a factor associated with both exposure and outcome can create an apparent link where none exists, as when coffee drinking appeared to cause lung cancer because coffee drinkers were more likely to smoke. Statistical adjustment reduces this but cannot remove confounders that were not measured. Randomised controlled trials would settle the question, but deliberately assigning people to a suspected harmful exposure is unethical, so causal conclusions about harms rest on observational evidence assessed against these criteria. Recall bias affects retrospective designs. Finally, epidemiology describes populations: a doubling of relative risk may be a very small absolute change for any individual, and it cannot say whether a particular person's disease was caused by the exposure.",
  common:["Concludes 'correlation is not causation' without saying what would strengthen the causal case",
          "Never names a specific confounder",
          "Ignores that a randomised trial of a harmful exposure would be unethical"] }
];
