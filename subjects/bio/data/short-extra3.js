/* Short answer with marking criteria — fourth pass.

   Deliberately weighted towards topics the first three passes left thin:
   the cell cycle, transpiration, fossil and biogeographical evidence,
   meiosis as a source of variation, protein synthesis, mutagens,
   Koch's postulates, and the technologies used for sensory disorders.

   Reminder for anyone adding to this file: `criteria` are what the student
   ticks for themselves. `keys` are hint words only — mark.js never grades
   with them and never pre-ticks a criterion. See brief §4. */

window.BIO = window.BIO || {}; BIO.DATA = BIO.DATA || {};

BIO.DATA.short_x3_y11 = [

{ id:"sz-001", mod:"M1", topic:"Cell replication", marks:5,
  q:"Explain why the cell cycle has checkpoints, and describe what happens when a checkpoint fails.",
  criteria:[
    "States that checkpoints are control points at which the cycle halts until specific conditions are satisfied",
    "Identifies at least one checkpoint and what it verifies, such as G1 checking cell size and DNA damage, or G2 checking that replication is complete",
    "Explains the metaphase checkpoint verifies every chromosome is attached to spindle fibres from both poles",
    "Explains that a cell failing a checkpoint is normally arrested and repaired, or destroyed by apoptosis",
    "Explains that a cell dividing despite damage passes that damage to both daughter cells, and repeated failures can produce uncontrolled division"
  ],
  keys:[["checkpoint","halt","control","until"],["g1","g2","dna damage","size","replication complete"],["metaphase","spindle","attached","both poles"],["arrest","repair","apoptosis","destroyed"],["daughter cells","inherit","uncontrolled","tumour","cancer"]],
  sample:"The cell cycle does not run straight through. At several points it pauses while the cell checks that the previous stage actually finished correctly, and it only proceeds if the check passes. At the G1 checkpoint the cell verifies that it has grown large enough, has enough nutrients, and that its DNA is undamaged before it commits to replication. At the G2 checkpoint it verifies that replication produced a complete and accurate copy. At the metaphase checkpoint it verifies that every chromosome is attached to spindle fibres from both poles, because a chromosome attached to only one pole would be pulled into the wrong daughter cell. If a check fails, the cycle is arrested. The cell then either repairs the fault and continues, or, if the damage is too great, undergoes apoptosis, a controlled self-destruction that removes it without spilling its contents. This matters because mitosis copies whatever is there. A cell that divides with damaged DNA passes that damage to both daughter cells and to every cell descended from them. Mutations in the genes that operate the checkpoints therefore have an effect out of proportion to their size: they do not damage the cell directly, they remove the mechanism that would have caught the damage, so faults accumulate and division continues when it should have stopped.",
  common:["Describes the stages of mitosis instead of the control of the cycle",
          "Says a failed checkpoint always means cancer, rather than that it removes a safeguard"] },

{ id:"sz-002", mod:"M1", topic:"Photosynthesis", marks:6,
  q:"A grower measures the rate of photosynthesis in a glasshouse as light intensity increases. The rate rises and then levels off. Explain this result and how the grower could raise the plateau.",
  criteria:[
    "States that at low light intensity, light is the limiting factor because it supplies the energy for the light-dependent stage",
    "Explains that as intensity rises, more photons are absorbed, so more ATP and NADPH are produced and the rate increases proportionally",
    "Explains that the plateau shows some other factor has become limiting",
    "Identifies carbon dioxide concentration or temperature as the likely limiting factor at the plateau",
    "Explains that raising carbon dioxide supplies more substrate for the Calvin cycle, and raising temperature increases enzyme activity, so the plateau shifts upward",
    "Notes that temperature cannot be raised indefinitely because the enzymes involved will denature"
  ],
  keys:[["limiting factor","low light","energy","light-dependent"],["photon","atp","nadph","proportional","increase"],["plateau","another factor","no longer","levels off"],["carbon dioxide","temperature","co2"],["calvin","substrate","rubisco","enzyme activity","higher plateau"],["denature","optimum","too hot","falls"]],
  sample:"At low light intensity, light is the limiting factor. The rate of photosynthesis depends on how much energy the light-dependent stage can capture, so every extra unit of light produces more ATP and NADPH and the rate rises roughly in proportion. The curve levelling off does not mean the plant has stopped responding to light; it means light is no longer what is holding the rate back. Some other requirement has become the limiting factor, and adding more light cannot help until that requirement is met. In a closed glasshouse the usual candidate is carbon dioxide, which the crop depletes faster than it diffuses in, and the other is temperature. Enriching the air with carbon dioxide supplies more substrate for RuBisCO in the Calvin cycle, so more of the ATP and NADPH the light reactions are already making can actually be used, and the plateau moves up. Raising the temperature increases the kinetic energy of the enzymes and substrates and has the same effect, but only up to the optimum. Beyond that the enzymes begin to denature and the rate falls sharply, so the grower is looking for the point where light, carbon dioxide and temperature are balanced rather than for the maximum of any one of them.",
  common:["Says the plateau means the plant is 'full' or 'saturated with glucose'",
          "Names a second factor without explaining why it caps the rate"] },

{ id:"sz-003", mod:"M1", topic:"Enzymes", marks:5,
  q:"Design an investigation to find the optimum pH of the enzyme catalase, and explain how you would make the result reliable.",
  criteria:[
    "States a measurable dependent variable, such as volume of oxygen collected in a fixed time or time to reach a fixed volume",
    "Names buffers at a range of pH values as the independent variable",
    "Identifies at least three variables held constant, such as temperature, substrate concentration, enzyme concentration and volume",
    "Describes repeating each pH at least three times and using the mean",
    "Explains that reliability comes from consistent repeats, and that plotting the means allows the optimum to be read as the peak of the curve"
  ],
  keys:[["oxygen","volume","gas","time taken","rate"],["buffer","ph range","independent"],["temperature","concentration","volume","constant","controlled"],["repeat","three","mean","average"],["reliab","peak","curve","optimum","consistent"]],
  sample:"The independent variable is pH, set with buffer solutions at, say, pH 3, 5, 7, 9 and 11, because a buffer holds the pH steady while the reaction proceeds rather than letting it drift. The dependent variable is the rate of reaction, measured as the volume of oxygen collected in a gas syringe over sixty seconds after adding the enzyme, or equivalently the time taken to collect a fixed volume. Everything else must be held constant or the comparison is meaningless: the temperature, controlled with a water bath; the concentration and volume of hydrogen peroxide; the concentration and volume of catalase, taken from a single batch so the enzyme is identical throughout; and the timing method. Each pH is run at least three times and the mean is taken, with any obvious outlier examined rather than silently discarded. Reliability comes from that repetition. If the three runs at a given pH agree closely, the measurement can be trusted; if they scatter widely, something uncontrolled is varying and the design needs fixing before the result means anything. Plotting mean rate against pH gives a curve whose peak is the optimum. Because the optimum may sit between two of the values tested, a second run with narrower intervals around the peak gives a better estimate than simply naming the best of the original five.",
  common:["Confuses reliability, which is about repeats agreeing, with accuracy, which is about being close to the true value",
          "Uses water instead of buffers, so the pH drifts as the reaction proceeds"] },

{ id:"sz-004", mod:"M2", topic:"Transport in plants", marks:6,
  q:"Explain how water moves from the soil to the leaves of a tall tree, and account for the fact that no energy is expended by the plant to lift it.",
  criteria:[
    "States that water enters root hair cells by osmosis, down a water potential gradient",
    "Describes movement across the root by the apoplast and symplast pathways to the xylem",
    "Explains that transpiration from the leaves creates the tension that pulls the column upward",
    "Explains cohesion between water molecules due to hydrogen bonding, so the column is pulled as a continuous thread",
    "Explains adhesion to the lignified xylem walls, which supports the column in narrow vessels",
    "Concludes that the energy source is the sun evaporating water at the leaf, not ATP from the plant"
  ],
  keys:[["root hair","osmosis","water potential"],["apoplast","symplast","cortex","xylem"],["transpiration","tension","evaporat","pull","stomata"],["cohesion","hydrogen bond","continuous","column"],["adhesion","lignin","xylem wall","narrow","capillar"],["sun","solar","not atp","passive","no energy"]],
  sample:"Water enters the root hair cells by osmosis because the soil solution has a higher water potential than the cell cytoplasm, and root hairs provide an enormous surface area for this. It then crosses the cortex either through the cell walls, the apoplast pathway, or through the cytoplasm and plasmodesmata, the symplast pathway, until the Casparian strip forces everything into the symplast at the endodermis. From there it enters the xylem vessels, which are dead, hollow tubes with lignified walls and no end walls, offering very little resistance to flow. The lifting is done at the top. Water evaporates from the mesophyll cell walls and diffuses out through the stomata, and this transpiration lowers the water potential at the top of the column, placing it under tension. Because water molecules are polar they hydrogen bond to one another, so the column has cohesion and does not break: pulling at the top pulls the entire thread up from the roots. Adhesion to the lignified walls helps support it in narrow vessels. The crucial point is that the energy for all of this comes from the sun evaporating water at the leaf surface, not from the plant. The plant supplies the plumbing and controls the rate by opening and closing stomata, but it hydrolyses no ATP to lift water, which is how a tree can raise water a hundred metres.",
  common:["Says the plant 'pumps' water up, or that root pressure alone lifts it to the canopy",
          "Confuses cohesion, between water molecules, with adhesion, between water and the vessel wall"] },

{ id:"sz-005", mod:"M2", topic:"Gas exchange", marks:5,
  q:"Compare gas exchange in a fish gill with gas exchange in a mammalian lung, and explain why each is suited to its medium.",
  criteria:[
    "States that both have a very large surface area, a thin exchange surface and a rich blood supply",
    "Describes the fish gill as lamellae over filaments with a one-way flow of water",
    "Explains countercurrent flow maintains a diffusion gradient along the whole length of the lamella",
    "Describes the mammalian lung as alveoli ventilated tidally, with air entering and leaving by the same route",
    "Explains that water holds far less dissolved oxygen and is denser and more viscous than air, so extraction must be more efficient, whereas air is oxygen-rich enough for tidal ventilation to suffice"
  ],
  keys:[["surface area","thin","blood supply","both"],["lamellae","filament","one-way","water over"],["countercurrent","gradient","whole length","along"],["alveoli","tidal","in and out","same route","residual"],["less oxygen","dissolved","dense","viscous","air is rich"]],
  sample:"Both surfaces obey the same requirements: a very large surface area, a barrier one or two cells thick, and a dense capillary bed that carries oxygen away and so maintains the concentration gradient. The differences follow from the medium. A fish gill consists of filaments carrying stacked lamellae, and water is driven over them in one direction only, entering at the mouth and leaving at the operculum. Blood flows through the lamellae in the opposite direction to the water. This countercurrent arrangement means that blood which is already fairly well oxygenated meets water that is still more oxygenated, so a gradient favouring diffusion into the blood exists along the entire length of the lamella, and roughly eighty per cent of the dissolved oxygen is extracted. A mammalian lung ventilates tidally: air enters and leaves the alveoli by the same route, so incoming air mixes with residual air and equilibrium, not a countercurrent, is the best that can be achieved. That is sufficient because air contains around thirty times more oxygen per unit volume than water and is far less dense and less viscous, so a mammal can afford a less efficient extraction and the cost of moving the medium is low. A fish cannot: water is heavy, hard to move and oxygen-poor, so it must extract as much as possible from each pass.",
  common:["Says the countercurrent 'increases surface area' rather than maintaining the gradient",
          "Claims parallel flow would work equally well, missing that it equilibrates halfway along"] },

{ id:"sz-006", mod:"M2", topic:"Digestion", marks:5,
  q:"Explain how the structure of the small intestine is adapted for the absorption of the products of digestion.",
  criteria:[
    "States that the small intestine is long, which increases the time available for absorption",
    "Describes folds, villi and microvilli forming a brush border that greatly increases surface area",
    "States that the epithelium is one cell thick, giving a short diffusion distance",
    "Explains that a dense capillary network in each villus carries absorbed glucose and amino acids away, maintaining the gradient",
    "Explains that a lacteal absorbs fatty acids and glycerol as chylomicrons into the lymph rather than the blood"
  ],
  keys:[["long","several metres","time","transit"],["villi","microvilli","fold","surface area","brush border"],["one cell","thin","short diffusion","epithelium"],["capillar","blood","glucose","amino acid","gradient"],["lacteal","lymph","fatty acid","glycerol","lipid"]],
  sample:"The small intestine is several metres long, so material is in contact with the absorptive surface for a long time. Its lining is folded, each fold carries finger-like villi, and each epithelial cell of a villus carries thousands of microvilli forming a brush border. The three levels of folding together multiply the surface area by a factor of several hundred, so a tube that would otherwise present less than half a square metre presents an area closer to a tennis court. The epithelium is a single cell thick, so the diffusion distance between the gut contents and the blood is minimal. Inside each villus is a dense network of capillaries. Glucose and amino acids are absorbed into the epithelial cells, partly by co-transport with sodium, and pass into these capillaries, which continually carry them away towards the hepatic portal vein. That removal is what keeps the concentration inside the villus low and therefore keeps the gradient favouring absorption. Each villus also contains a lacteal, a blind-ended lymph vessel. Fatty acids and glycerol are reassembled into triglycerides inside the epithelial cell, packaged as chylomicrons, and released into the lacteal, because these particles are too large to enter the capillary directly. They rejoin the blood later at the thoracic duct.",
  common:["Lists villi without explaining that removal by the blood is what maintains the gradient",
          "Says lipids are absorbed into the capillaries alongside glucose"] },

{ id:"sz-007", mod:"M3", topic:"Adaptation", marks:5,
  q:"Using a named Australian organism, explain how structural, physiological and behavioural adaptations together allow survival in an arid environment.",
  criteria:[
    "Names a specific Australian organism found in an arid habitat",
    "Describes a structural adaptation and explains how it reduces water loss or heat gain",
    "Describes a physiological adaptation and explains the mechanism, such as concentrated urine or tolerance of a raised body temperature",
    "Describes a behavioural adaptation and explains its timing or location, such as nocturnal activity or burrowing",
    "Explains that the three categories act together, so that no one adaptation is sufficient on its own"
  ],
  keys:[["thorny devil","spinifex hopping mouse","bilby","red kangaroo","named"],["structural","surface","fur","skin","spine","reduce"],["physiological","concentrated urine","kidney","body temperature","metabolic water"],["behavioural","nocturnal","burrow","shade","night"],["together","combination","not sufficient alone","complement"]],
  sample:"The spinifex hopping mouse lives in the sand dunes of central Australia and never drinks. Structurally, it has extremely long loops of Henle in its kidneys relative to its body size, and a compact body with fur that limits evaporative loss from the skin. Physiologically, those long loops allow it to establish a very steep solute gradient in the medulla and produce urine several times more concentrated than seawater, so nitrogenous waste is excreted with a minimal volume of water. It also relies on metabolic water released by the respiration of the dry seeds it eats, and it does not sweat. Behaviourally, it spends the day in a deep, humid burrow that it plugs with sand, and forages only at night. The burrow is critical: at a metre down the temperature is stable and the air is close to saturated, so the animal loses very little water in exhaled breath while it sleeps. None of these alone is enough. Concentrated urine would not save an animal foraging at forty-five degrees in the open sun, and a burrow would not save an animal excreting dilute urine. It is the combination — reduce the loss, reduce the exposure, and recover water from metabolism — that closes the water budget in a habitat where free water may not appear for years.",
  common:["Describes adaptations without saying which category each belongs to",
          "Treats a behaviour such as burrowing as a structural adaptation"] },

{ id:"sz-008", mod:"M3", topic:"Evidence for evolution", marks:5,
  q:"Explain how biogeography provides evidence for evolution, using the distribution of marsupials as an example.",
  criteria:[
    "States that biogeography is the study of the geographical distribution of species",
    "Describes that marsupials are concentrated in Australia and South America, with placental mammals dominant elsewhere",
    "Explains that Australia separated from Gondwana before placental mammals became widespread",
    "Explains that isolated marsupial populations then radiated into the available niches without placental competition",
    "Explains that this distribution is predicted by common ancestry plus geographical separation, but is not explained by independent creation of each species where it lives"
  ],
  keys:[["biogeograph","distribution","where species"],["marsupial","australia","south america","placental elsewhere"],["gondwana","separated","continental drift","isolated","before"],["radiat","niche","no competition","diversif"],["common ancestor","predicted","explains the pattern","otherwise arbitrary"]],
  sample:"Biogeography is the study of where organisms are found, and the pattern it reveals is not random. Marsupials make up almost the entire native mammal fauna of Australia and a substantial part of that of South America, while placental mammals dominate Africa, Asia, Europe and North America. Evolution explains this directly. Marsupials and placentals share a common ancestor. Australia and South America were both part of Gondwana, and Australia separated and drifted north before placental mammals had radiated widely. The marsupials carried on that landmass were therefore isolated, and in the absence of placental competitors they diversified into the full range of available niches, producing grazers such as kangaroos, burrowers such as wombats, gliders, and a marsupial carnivore in the thylacine. Many of these strongly resemble unrelated placental mammals filling the same niche elsewhere, which is convergent evolution operating on separated stock. The strength of the evidence lies in what it rules out. If species were each created where they now live, there is no reason marsupials should cluster on precisely those landmasses that were once joined, and no reason the resemblance between a thylacine and a wolf should be superficial rather than anatomical. Descent with modification plus continental drift predicts both.",
  common:["States where marsupials live without saying why that distribution is evidence",
          "Confuses convergent evolution with common ancestry when explaining the thylacine and wolf"] },

{ id:"sz-009", mod:"M3", topic:"Natural selection", marks:5,
  q:"A population of insects is sprayed repeatedly with the same insecticide and becomes resistant. Explain this using the theory of evolution by natural selection.",
  criteria:[
    "States that variation in resistance already existed in the population before spraying, arising from mutation",
    "Explains that the insecticide acts as a selection pressure, killing susceptible individuals",
    "Explains that resistant individuals survive and reproduce, passing the alleles on",
    "Explains that the frequency of the resistance allele therefore increases over generations",
    "States explicitly that the insecticide selects for resistance rather than causing it, and that individuals do not become resistant during their lifetime"
  ],
  keys:[["variation","already","mutation","before","pre-existing"],["selection pressure","kill","susceptible","survive"],["reproduce","pass on","offspring","allele"],["frequency","generation","increase","population"],["does not cause","selects","not during lifetime","not adapt"]],
  sample:"Before any spraying, the insect population already varied. Random mutations had produced a small number of individuals carrying an allele that conferred some resistance, perhaps an altered target protein or an enzyme that breaks the compound down. This variation was not created by the insecticide; it was already present and, in the absence of spraying, may have carried a slight cost. Spraying imposes a strong selection pressure. Susceptible individuals die before reproducing, while the few resistant individuals survive. Those survivors are the only ones contributing to the next generation, and they pass their resistance alleles to their offspring. The frequency of the resistance allele in the population therefore rises sharply. Repeating the spray repeats the selection, and after a number of generations the allele that was rare is close to universal, so the same dose no longer controls the population. The distinction that matters is causal. The insecticide does not make insects resistant; no individual becomes resistant during its life in response to exposure. It changes which of the existing variants survive to breed. This is also why using the same chemical repeatedly is self-defeating, and why rotating chemicals with different modes of action slows the process, since an insect must then carry two rare alleles rather than one.",
  common:["Says the insects 'adapted to' or 'built up a tolerance to' the spray during their lifetime",
          "Omits that the variation existed before the selection pressure was applied"] },

{ id:"sz-010", mod:"M4", topic:"Past ecosystems", marks:5,
  q:"Explain how scientists use evidence from ice cores and pollen records to reconstruct past ecosystems, and identify a limitation of each.",
  criteria:[
    "Explains that ice cores trap air bubbles which give a direct sample of past atmospheric composition",
    "Explains that the ratio of oxygen isotopes in the ice indicates the temperature at the time of deposition",
    "Explains that pollen preserved in sediment or peat identifies the plant species present, since pollen grains are species-specific and resistant to decay",
    "Explains that layers are dated by counting annual layers or by radiometric methods, giving a chronological sequence",
    "Identifies a limitation of each, such as ice cores being restricted to polar and high-alpine regions, and pollen over-representing wind-pollinated species"
  ],
  keys:[["air bubble","trapped","atmosphere","carbon dioxide","direct"],["isotope","oxygen-18","temperature","proxy"],["pollen","species-specific","resistant","sediment","peat","plant"],["annual layer","varve","radiometric","dating","sequence"],["limitation","only polar","wind-pollinated","over-represent","bias"]],
  sample:"Ice cores work because falling snow traps air as it compacts, so each layer of ice contains bubbles of the atmosphere from the year it fell. Extracting and analysing that gas gives a direct measurement, not an inference, of past carbon dioxide and methane concentrations. The ice itself carries a second signal: the ratio of oxygen-18 to oxygen-16 in the water molecules depends on the temperature at which evaporation and precipitation occurred, so it serves as a temperature proxy. Layers can be counted like tree rings near the surface and modelled deeper down, giving a timeline hundreds of thousands of years long. Pollen records work on a different principle. Pollen grains have tough, sculpted outer walls that are distinctive to species and resist decay, so grains that settle into lake sediment or peat persist. Identifying and counting the grains in a dated layer reveals which plants grew nearby, and a shift from, say, conifer to broadleaf pollen indicates a warming climate. Both have limits. Ice cores exist only where ice has persisted, so they tell us about polar and high-alpine conditions and about the global atmosphere, but not about local conditions in Australia. Pollen counts are biased towards wind-pollinated species, which release vast quantities of pollen, and under-represent insect-pollinated plants that may have been abundant.",
  common:["Says ice cores 'show' temperature directly rather than through an isotope proxy",
          "Treats a pollen count as a direct census of the vegetation"] },

{ id:"sz-011", mod:"M4", topic:"Population dynamics", marks:5,
  q:"Explain the difference between density-dependent and density-independent factors, and predict what happens to a population that exceeds its carrying capacity.",
  criteria:[
    "Defines a density-dependent factor as one whose effect per individual increases as population density rises",
    "Gives examples of density-dependent factors such as competition for food, disease transmission and predation",
    "Defines a density-independent factor as one whose effect does not depend on density, giving an example such as fire, drought or flood",
    "States that carrying capacity is the maximum population the environment can sustain indefinitely",
    "Predicts that exceeding it intensifies density-dependent factors, so the death rate rises above the birth rate and the population falls back, often overshooting downward before stabilising"
  ],
  keys:[["density-dependent","per individual","as density rises","proportion"],["competition","disease","predation","food","example"],["density-independent","fire","drought","flood","regardless"],["carrying capacity","sustain","maximum","indefinitely"],["overshoot","death rate exceeds","crash","oscillat","fall back"]],
  sample:"A density-dependent factor is one whose effect on each individual grows stronger as the population becomes more crowded. Competition for food, water, nesting sites and light is the clearest case: in a sparse population there is enough for everyone, while in a dense one each individual gets less. Disease is another, because transmission depends on contact rate, which rises with density, and so is predation, since predators concentrate where prey is abundant and may switch to a prey species once it becomes common. A density-independent factor acts with the same severity regardless of how crowded the population is. A bushfire, a flood, a frost or a cyclone kills a similar proportion whether there are ten individuals or ten thousand. Carrying capacity is the population size the environment can support indefinitely given its resources. A population can exceed it temporarily, typically when reproduction responds to conditions with a lag, but it cannot stay there. Above carrying capacity, resources per individual fall below what is needed, so the density-dependent factors intensify: starvation and disease raise the death rate, and poor condition lowers the birth rate. The population therefore falls. Because the resource base has usually been degraded by the overshoot, the decline often carries the population below the original carrying capacity before it recovers, producing the oscillation seen in many real populations.",
  common:["Classifies predation as density-independent",
          "Says the population simply stops at carrying capacity rather than overshooting and falling"] },

{ id:"sz-012", mod:"M4", topic:"Human impact", marks:6,
  q:"Assess the effectiveness of one strategy used to mitigate the impact of an introduced species in Australia.",
  criteria:[
    "Names a specific introduced species and the strategy used against it",
    "Explains the biological mechanism by which the strategy is intended to reduce the population",
    "Presents evidence of the strategy's success, referring to population or damage data",
    "Identifies a limitation, unintended consequence or reason the effect diminished over time",
    "Explains why an alternative or complementary strategy is or is not preferable",
    "Reaches a judgement about effectiveness that is supported by the evidence given rather than asserted"
  ],
  keys:[["rabbit","cane toad","carp","fox","named","strategy"],["mechanism","virus","myxoma","calicivirus","bait","how it works"],["evidence","reduced by","population fell","per cent","data"],["resistance","limitation","non-target","recovered","unintended"],["alternative","complement","warren ripping","integrated","instead"],["judgement","effective in part","overall","conclude"]],
  sample:"Myxomatosis was released against the European rabbit in 1950. The myxoma virus, spread by mosquitoes and fleas, causes a fatal systemic disease in Oryctolagus cuniculus, and its initial effect was dramatic: the rabbit population fell by an estimated ninety per cent or more, pasture recovered, and the agricultural gain over the following decades has been valued in the tens of billions of dollars. That is real effectiveness, and it remains one of the most successful biological control programs attempted anywhere. It also demonstrates the limitation of the approach. The virus imposed an extreme selection pressure on both host and pathogen. Rabbits carrying alleles conferring resistance survived and bred, while highly virulent strains of the virus killed their hosts before transmission and were themselves selected against, favouring intermediate virulence. Within two decades mortality had fallen substantially and rabbit numbers were recovering, which is why rabbit haemorrhagic disease virus was later released as a second agent, with a similar pattern of strong initial effect followed by rising resistance. The reasonable judgement is that biological control was highly effective as a shock but cannot be relied on alone, because it selects for its own obsolescence. Sustained control has required combining it with conventional methods such as warren ripping and baiting, which do not select for heritable resistance in the same way.",
  common:["Describes the strategy without any evidence of its outcome",
          "Reaches a verdict of 'effective' or 'ineffective' without acknowledging evidence on the other side"] }

];

BIO.DATA.short_x3_y12 = [

{ id:"sz-101", mod:"M5", topic:"Meiosis", marks:6,
  q:"Explain how meiosis produces genetic variation, and explain why this variation is important for a species.",
  criteria:[
    "States that crossing over in prophase I exchanges alleles between homologous chromosomes, producing new combinations on a single chromosome",
    "States that independent assortment in metaphase I means each homologous pair orients randomly relative to the others",
    "Quantifies independent assortment as 2 to the power of 23 combinations in humans, before crossing over is considered",
    "Explains that random fertilisation combines any one of these gametes with any one from the other parent",
    "Explains that this variation means a population contains many different genotypes",
    "Explains that if the environment changes, some of these variants may survive and reproduce, so the species can undergo natural selection"
  ],
  keys:[["crossing over","chiasma","prophase i","exchange","recombin"],["independent assortment","metaphase i","random orientation","homologous pair"],["2^23","8 million","8388608","combinations"],["random fertilisation","any sperm","any egg","zygote"],["genotypes","variation in population","different"],["environment changes","selection","survive","adapt","species"]],
  sample:"Three separate mechanisms contribute. During prophase I, homologous chromosomes pair and non-sister chromatids exchange segments at chiasmata. Crossing over means a single chromatid leaving meiosis carries a mixture of maternal and paternal alleles, a combination that existed in neither parent. During metaphase I, each bivalent lines up on the equator independently of every other bivalent, so which member of a pair goes to which pole is random and independent across pairs. With twenty-three pairs in humans, independent assortment alone produces two to the power of twenty-three, or about 8.4 million, different chromosome combinations per gamete, and crossing over multiplies this further so that no two gametes are realistically identical. Random fertilisation then combines any one gamete with any one of the equally varied gametes of the other parent. The consequence for the species is that a population is not a set of copies. It contains a wide range of genotypes, and therefore a range of phenotypes with different tolerances to heat, drought, pathogens and toxins. When the environment changes, natural selection can only act on variation that is already present; it cannot generate a useful trait on demand. A sexually reproducing population carries a standing reserve of variation, so some individuals are likely to survive a change that kills most of the others, which is why asexual populations are far more vulnerable to a novel pathogen.",
  common:["Confuses crossing over with independent assortment",
          "Says meiosis produces variation 'so the species can adapt', implying the variation is generated in response to need"] },

{ id:"sz-102", mod:"M5", topic:"Polypeptide synthesis", marks:6,
  q:"Describe the process by which the base sequence of a gene determines the primary structure of a polypeptide.",
  criteria:[
    "States that RNA polymerase binds the promoter and unwinds the DNA, transcribing the template strand into mRNA",
    "States that transcription follows complementary base pairing, with uracil replacing thymine",
    "States that in eukaryotes introns are spliced out and exons joined before the mRNA leaves the nucleus",
    "States that the mRNA binds a ribosome and is read in triplets called codons",
    "Explains that each tRNA carries a specific amino acid and has an anticodon complementary to the codon",
    "Explains that peptide bonds form between adjacent amino acids until a stop codon is reached, so the base sequence dictates the amino acid sequence"
  ],
  keys:[["rna polymerase","promoter","template strand","transcription","unwind"],["complementary","uracil","base pairing","a-u","c-g"],["intron","exon","splic","pre-mrna","nucleus"],["ribosome","codon","triplet","read"],["trna","anticodon","specific amino acid","complementary"],["peptide bond","stop codon","sequence of amino acids","primary structure"]],
  sample:"Transcription begins when RNA polymerase binds to the promoter region upstream of the gene and unwinds the double helix. Using one strand as a template, it assembles a complementary RNA strand by base pairing, with uracil placed opposite adenine in place of thymine. In a eukaryote the resulting pre-mRNA contains introns, which are spliced out, and the remaining exons are joined; a cap and a poly-A tail are added, and the mature mRNA leaves through a nuclear pore. Translation occurs at a ribosome, which binds the mRNA and reads it three bases at a time. Each triplet is a codon specifying one amino acid, and the code is degenerate, so several codons may specify the same amino acid. Transfer RNA molecules provide the link: each has an anticodon of three bases at one end and, at the other, an attachment site for one specific amino acid, loaded by an enzyme that recognises both. A tRNA whose anticodon is complementary to the codon in the ribosome's A site binds there, and a peptide bond forms between its amino acid and the growing chain. The ribosome then moves one codon along, the empty tRNA is released, and the process repeats until a stop codon is reached, at which point the completed polypeptide is released. Because the order of codons is fixed by the order of bases in the gene, the base sequence determines the amino acid sequence, which is the primary structure.",
  common:["Says tRNA 'reads' the DNA directly, skipping transcription",
          "Describes codons as being on tRNA and anticodons on mRNA"] },

{ id:"sz-103", mod:"M5", topic:"Inheritance", marks:5,
  q:"Explain why human height varies continuously while blood group does not, and explain what this shows about the relationship between genotype and phenotype.",
  criteria:[
    "States that blood group is controlled by a single gene with a small number of alleles, producing discrete categories",
    "States that height is polygenic, controlled by many genes each contributing a small additive effect",
    "Explains that many genes with small effects produce a large number of closely spaced phenotypic values, approximating a continuous distribution",
    "Explains that height is also strongly affected by environmental factors such as nutrition during growth",
    "Concludes that phenotype results from genotype and environment together, and that the number of loci involved determines whether variation appears discrete or continuous"
  ],
  keys:[["single gene","abo","three alleles","discrete","categories"],["polygenic","many genes","additive","small effect"],["closely spaced","normal distribution","continuous","bell","range"],["environment","nutrition","childhood","disease"],["genotype and environment","together","number of loci","interaction"]],
  sample:"ABO blood group is determined by one gene with three alleles, and each of the possible genotypes produces one of four phenotypes. There is nothing between group A and group B, so the variation is discontinuous and every individual falls into a category. Height is polygenic. Hundreds of loci each contribute a small amount, and the alleles at those loci are broadly additive, so an individual's genetic contribution to height is a sum of many small terms. With many loci the possible totals are numerous and closely spaced, and no single substitution moves a person from one visible class to another. Measured across a population the result is a normal distribution rather than a set of categories. Height is also strongly influenced by the environment, particularly nutrition and illness during the growing years, which smooths the distribution further and explains why average heights have risen substantially within a few generations, far too fast for allele frequencies to have changed. What this comparison shows is that phenotype is not simply read off the genotype. Where one locus with a strong effect controls a character and the environment barely touches it, the phenotype is discrete and genotype is a good predictor. Where many loci each contribute a little and the environment contributes as well, the phenotype is continuous and genotype sets a range rather than a value.",
  common:["Says continuous variation is 'caused by the environment' and discontinuous by genes",
          "Confuses codominance in ABO with the additive effect of polygenes"] },

{ id:"sz-104", mod:"M6", topic:"Mutation", marks:6,
  q:"Distinguish between point mutations and chromosomal mutations, and explain why a mutation in a gamete has different consequences from one in a somatic cell.",
  criteria:[
    "Defines a point mutation as a change to one or a few bases, giving substitution, insertion or deletion as types",
    "Explains that a substitution may be silent, missense or nonsense, whereas an insertion or deletion of one base causes a frameshift",
    "Defines a chromosomal mutation as a change to the structure or number of whole chromosomes",
    "Gives an example of a chromosomal mutation such as deletion, duplication, inversion, translocation or non-disjunction",
    "Explains that a somatic mutation affects only that cell and its descendants and is not inherited",
    "Explains that a mutation in a gamete is present in every cell of any resulting offspring and can be passed to later generations"
  ],
  keys:[["point mutation","one base","substitution","insertion","deletion"],["silent","missense","nonsense","frameshift","reading frame"],["chromosomal","whole chromosome","structure or number"],["inversion","translocation","duplication","non-disjunction","trisomy"],["somatic","that cell only","not inherited","descendant cells"],["gamete","every cell","offspring","heritable","germ line"]],
  sample:"A point mutation is a change affecting one or a very small number of bases. A substitution replaces one base with another and may be silent, if the new codon still specifies the same amino acid because the code is degenerate; missense, if it specifies a different amino acid; or nonsense, if it creates a premature stop codon and truncates the protein. Inserting or deleting a single base is usually more damaging, because it shifts the reading frame from that point on and every codon downstream is misread, so the rest of the polypeptide bears no relation to the original. A chromosomal mutation changes chromosome structure or number. Structural changes include deletion of a segment, duplication, inversion of a segment's orientation, and translocation of a segment to a non-homologous chromosome. Numerical changes arise from non-disjunction, where chromosomes fail to separate in meiosis and a gamete receives an extra copy or none, as in trisomy 21. The location of the mutation determines who it affects. A mutation in a somatic cell is copied by mitosis into that cell's descendants only. It can cause disease in that individual, and repeated somatic mutations in genes controlling division are how cancers arise, but it is not passed to children. A mutation in a cell of the germ line may end up in a gamete, and if that gamete forms a zygote the mutation is copied into every cell of the new individual and can be transmitted to later generations.",
  common:["Says a substitution always changes the protein, forgetting silent mutations",
          "Says a somatic mutation can be inherited if it occurs early enough in life"] },

{ id:"sz-105", mod:"M6", topic:"Biotechnology", marks:6,
  q:"Describe how a bacterium can be engineered to produce human insulin, and explain one social and one ethical implication of this technology.",
  criteria:[
    "States that the human insulin gene is obtained, for example as cDNA made from mRNA using reverse transcriptase",
    "States that a plasmid vector is cut with the same restriction enzyme, producing complementary sticky ends",
    "States that DNA ligase joins the gene into the plasmid to form recombinant DNA",
    "States that the plasmid is taken up by bacteria and that transformed cells are identified using a marker",
    "Explains that transformed bacteria are cultured in a fermenter and the insulin is harvested and purified",
    "Identifies a social implication and an ethical implication and explains each, rather than merely naming them"
  ],
  keys:[["insulin gene","cdna","reverse transcriptase","mrna","isolate"],["plasmid","restriction enzyme","sticky ends","same enzyme","cut"],["ligase","recombinant","join","anneal"],["transform","uptake","marker","antibiotic resistance","identify"],["fermenter","culture","harvest","purif","scale"],["social","ethical","cost","access","implication","because"]],
  sample:"The human insulin gene is first obtained. Because the gene contains introns that a bacterium cannot splice out, the usual route is to isolate mRNA from pancreatic beta cells and use reverse transcriptase to make complementary DNA, which contains only the coding sequence. A bacterial plasmid is cut open with a restriction enzyme, and the same enzyme is used on the gene, so both carry complementary single-stranded sticky ends. Base pairing brings them together and DNA ligase seals the sugar-phosphate backbone, producing a recombinant plasmid. The plasmids are mixed with bacteria under conditions that encourage uptake, and because only a fraction take one up, a marker gene carried on the plasmid, such as antibiotic resistance or a fluorescent protein, is used to identify the transformed cells. Those cells are then grown in a fermenter under controlled conditions and divide rapidly, each carrying and expressing the gene, and the insulin is extracted and purified. Socially, the effect has been to make insulin available in effectively unlimited quantity and at consistent purity, replacing insulin extracted from pig and cattle pancreases, which was in limited supply, caused allergic reactions in some patients, and was unacceptable to people whose religion prohibited those animal products. Ethically, the same techniques that produce insulin also make it possible to patent sequences and organisms, which concentrates control of a life-sustaining medicine in a small number of companies and raises the question of whether a naturally occurring human gene sequence should be ownable at all.",
  common:["Uses different restriction enzymes on the gene and the plasmid, so the ends do not match",
          "Names an implication as a single word without explaining the consequence"] },

{ id:"sz-106", mod:"M6", topic:"Genetic technologies", marks:5,
  q:"Compare artificial selection with genetic modification as methods of changing the characteristics of a crop species.",
  criteria:[
    "States that artificial selection breeds from individuals with desirable phenotypes over many generations",
    "States that genetic modification inserts a specific known gene directly into the genome",
    "Explains that artificial selection can only work with variation already present in the species or in close relatives that can interbreed",
    "Explains that genetic modification can transfer a gene from an unrelated species, which artificial selection cannot achieve",
    "Compares the timescale and precision of the two, noting that artificial selection takes many generations and drags linked genes along, while modification is faster and more targeted"
  ],
  keys:[["artificial selection","breed","desirable","phenotype","generations"],["genetic modification","insert","specific gene","directly","transgenic"],["existing variation","within species","interbreed","gene pool"],["unrelated species","bt","bacterium","across species","barrier"],["timescale","faster","precise","linked genes","many generations"]],
  sample:"Artificial selection works by choosing which individuals reproduce. A grower keeps seed from the plants with the highest yield or the best disease resistance, breeds from them, and repeats this over many generations, so favourable alleles become more frequent. It is the technique that turned teosinte into maize and produced every commercial wheat variety. Genetic modification instead identifies a specific gene, isolates it, and inserts it into the target genome using a vector such as Agrobacterium tumefaciens or a gene gun, so a single defined change is made in one generation. The decisive difference is the source of the variation. Artificial selection can only amplify variation that already exists in the species or in relatives close enough to cross with it. If no wheat plant anywhere carries an allele for a particular trait, no amount of selective breeding will produce it. Genetic modification crosses that barrier: the Bt gene inserted into cotton comes from the bacterium Bacillus thuringiensis, and no breeding program could have moved it. The two also differ in precision and speed. Selection acts on whole organisms, so genes physically linked to the desired one are dragged along, and undesirable traits often come with the improvement; the process takes years. Modification changes one locus, is far faster, and is more predictable, though it requires the gene to have been identified first and is far more heavily regulated.",
  common:["Says artificial selection 'changes the genes' of an individual",
          "Treats selective breeding and genetic modification as differing only in speed"] },

{ id:"sz-107", mod:"M7", topic:"Pathogens", marks:6,
  q:"Explain how Koch's postulates are used to establish that a particular microbe causes a particular disease, and identify a situation in which they cannot be satisfied.",
  criteria:[
    "States that the microbe must be found in all organisms suffering from the disease and not in healthy ones",
    "States that the microbe must be isolated and grown in pure culture",
    "States that the cultured microbe must cause the same disease when introduced into a healthy host",
    "States that the microbe must be re-isolated from that experimental host and identified as the same organism",
    "Explains that the postulates establish causation rather than mere correlation, which observation alone cannot do",
    "Identifies a limitation, such as pathogens that cannot be cultured on artificial media, asymptomatic carriers, or diseases with no suitable animal host"
  ],
  keys:[["found in all","every case","absent in healthy","present"],["isolated","pure culture","grown"],["introduced","healthy host","same disease","inoculat"],["re-isolat","recovered","identified as the same"],["causation","not correlation","proves","establish"],["cannot be cultured","virus","prion","asymptomatic carrier","no animal model","limitation"]],
  sample:"Koch's postulates are four conditions that together establish a causal link. First, the suspected microbe must be present in every organism with the disease and absent from healthy organisms. Second, it must be isolated from a diseased host and grown in pure culture, so that it is separated from every other organism that was present. Third, that pure culture must produce the same disease when introduced into a healthy susceptible host. Fourth, the microbe must then be re-isolated from the experimental host and shown to be identical to the original. The logic is what makes them powerful. Finding a microbe in sick people only establishes correlation; it might be a passenger that thrives in already-damaged tissue. Deliberately introducing a pure culture and reproducing the disease makes the microbe the only thing that changed, and re-isolating it closes the loop. They cannot always be satisfied. Many pathogens will not grow on artificial media, including all viruses, which require living host cells, and organisms such as Mycobacterium leprae and Treponema pallidum. The first postulate fails for any pathogen with asymptomatic carriers, since the organism is then present in apparently healthy people, as with Vibrio cholerae and poliovirus. The third fails where no non-human host develops the disease, and deliberately infecting a human is not ethically acceptable, which is why HIV was established as the cause of AIDS by molecular and epidemiological evidence rather than by Koch's third postulate.",
  common:["Lists the postulates without explaining why they establish causation",
          "Claims the postulates are simply wrong, rather than that some pathogens fall outside their scope"] },

{ id:"sz-108", mod:"M7", topic:"Immunity", marks:6,
  q:"Explain why a vaccinated person who later encounters the pathogen usually does not become ill, referring to the primary and secondary responses.",
  criteria:[
    "States that a vaccine introduces antigens from the pathogen without causing the disease",
    "Describes the primary response as slow, with a lag of days while specific B lymphocytes are selected and clonally expanded",
    "States that clonal expansion produces plasma cells secreting antibody and memory cells that persist",
    "Explains that on re-exposure memory cells recognise the antigen immediately, so the secondary response is faster",
    "Explains that the secondary response produces a much higher concentration of antibody, and of higher affinity",
    "Concludes that the pathogen is cleared before it can multiply enough to produce symptoms"
  ],
  keys:[["vaccine","antigen","attenuated","without disease","fragment"],["primary","slow","lag","days","clonal selection","expansion"],["plasma cell","antibody","memory cell","persist","remain"],["re-exposure","recognise immediately","faster","secondary"],["higher concentration","greater affinity","larger","more antibody"],["cleared","before symptoms","no illness","destroyed early"]],
  sample:"A vaccine delivers antigens from the pathogen, as an attenuated or inactivated organism, a surface protein, or mRNA encoding one, in a form that cannot cause the disease. The immune system nevertheless treats those antigens as foreign and mounts a primary response. That response is slow. Only a very small number of B lymphocytes happen to carry a receptor matching the antigen, and they must be selected, activated with the help of T helper cells, and divide repeatedly before enough of them exist to matter, which takes roughly one to two weeks. The clones differentiate into plasma cells, which secrete antibody, and into memory B and T cells, which do not act immediately but persist for years. When the vaccinated person later meets the real pathogen, the starting position is completely different. A large population of memory cells specific to that antigen already exists, so recognition and activation happen within hours rather than days. The secondary response therefore begins almost immediately, rises far more steeply, and reaches an antibody concentration many times higher than the primary response did, with antibodies of higher affinity as a result of earlier affinity maturation. The pathogen is neutralised and cleared while its numbers are still small, so it never reaches the density needed to damage tissue or trigger symptoms. The person is infected briefly but does not become ill, which is also why vaccination can reduce transmission as well as disease.",
  common:["Says a vaccine 'gives you the disease in a small dose'",
          "Says memory cells produce antibody continuously, rather than responding rapidly on re-exposure"] },

{ id:"sz-109", mod:"M8", topic:"Disorders", marks:6,
  q:"Compare a hearing aid with a cochlear implant, and explain why the choice between them depends on the cause of the hearing loss.",
  criteria:[
    "States that a hearing aid amplifies sound and delivers it into the ear canal, so the normal pathway is still used",
    "States that a cochlear implant converts sound to electrical signals delivered by electrodes inserted into the cochlea",
    "Explains that the implant bypasses the hair cells and stimulates the auditory nerve directly",
    "Explains that conductive hearing loss involves the outer or middle ear, so amplification can overcome it",
    "Explains that sensorineural loss involves damaged hair cells, so amplifying the sound does not help because the transduction step has failed",
    "States that an implant requires a functioning auditory nerve, so it cannot help where the nerve itself is damaged"
  ],
  keys:[["amplif","louder","ear canal","normal pathway","microphone and speaker"],["implant","electrode","electrical","cochlea","processor"],["bypass","hair cells","auditory nerve directly","stimulate"],["conductive","outer","middle ear","ossicle","amplification works"],["sensorineural","hair cell","damaged","louder does not help","transduction"],["auditory nerve intact","required","cannot help","nerve damage"]],
  sample:"A hearing aid is a microphone, an amplifier and a small speaker. It makes incoming sound louder and delivers it into the ear canal, so the sound still travels the normal path: eardrum, ossicles, oval window, fluid movement in the cochlea, and finally the hair cells that convert that movement into nerve impulses. A cochlear implant does something quite different. An external processor converts sound into a pattern of electrical signals, which are transmitted through the skin to an implanted receiver and delivered by an array of electrodes threaded into the cochlea. Those electrodes stimulate the auditory nerve fibres directly, so the hair cells play no part at all. Which device is appropriate depends on where the pathway has failed. In conductive hearing loss the problem lies in the outer or middle ear, perhaps fluid, a perforated eardrum or fused ossicles, so sound reaches the cochlea attenuated but the cochlea itself works. Amplification compensates for the loss and a hearing aid is effective. In sensorineural loss the hair cells are damaged or absent, most often through age, noise exposure or disease. Making the sound louder does not help, because the step that has failed is transduction: a louder vibration still reaches nothing capable of converting it. An implant works precisely because it replaces that step. It does, however, require a functioning auditory nerve, so where the nerve or the auditory pathway in the brain is the damaged element, neither device restores hearing.",
  common:["Says a cochlear implant 'makes sound louder'",
          "Assumes an implant is simply the better device, rather than being indicated for a different cause"] },

{ id:"sz-110", mod:"M8", topic:"Homeostasis", marks:6,
  q:"Explain how negative feedback maintains blood glucose concentration, and explain how this control differs in type 1 and type 2 diabetes.",
  criteria:[
    "States that receptors in the pancreatic islets detect a rise in blood glucose after a meal",
    "Explains that beta cells secrete insulin, which causes liver and muscle cells to take up glucose and store it as glycogen, lowering the concentration",
    "Explains that a fall in blood glucose causes alpha cells to secrete glucagon, which promotes glycogenolysis and gluconeogenesis in the liver",
    "Explains that this is negative feedback because the response opposes and cancels the original change",
    "Explains that in type 1 diabetes the beta cells are destroyed, usually autoimmune, so little or no insulin is produced and it must be injected",
    "Explains that in type 2 diabetes insulin is produced but target cells respond poorly, so management focuses on diet, exercise and drugs that improve sensitivity"
  ],
  keys:[["islet","pancreas","receptor","detect","rise"],["beta cell","insulin","uptake","glycogen","liver","muscle"],["alpha cell","glucagon","glycogenolysis","gluconeogenesis","release"],["negative feedback","opposes","reverses","returns to set point"],["type 1","beta cells destroyed","autoimmune","no insulin","inject"],["type 2","resistance","respond poorly","receptor","diet","exercise"]],
  sample:"Blood glucose is monitored by the cells of the islets of Langerhans in the pancreas, which act as both receptor and effector. After a meal, absorbed glucose raises the concentration above the set point of roughly 4 to 6 millimoles per litre. Beta cells respond by secreting insulin into the blood. Insulin binds receptors on liver, muscle and fat cells and increases the number of glucose transporters in their membranes, so those cells take glucose up; the liver and muscle then convert it to glycogen. Blood glucose consequently falls. If it falls too far, perhaps during exercise or fasting, alpha cells secrete glucagon, which causes the liver to break glycogen down and to synthesise glucose from amino acids and glycerol, releasing it into the blood and raising the concentration again. This is negative feedback because in each case the response acts in the opposite direction to the change that triggered it, so the concentration oscillates within a narrow band rather than drifting. Type 1 diabetes arises when the immune system destroys the beta cells, usually in childhood or adolescence. Insulin production essentially ceases, the removal arm of the loop is missing, and glucose accumulates. It is managed by injecting insulin matched to carbohydrate intake, since no lifestyle change can restore a hormone that is not being made. Type 2 diabetes is different in mechanism: insulin is still secreted, often in raised amounts, but target cells respond poorly to it, so the same insulin signal produces less uptake. Management therefore targets sensitivity, through weight loss, dietary change and exercise, with drugs such as metformin, and insulin only if the beta cells eventually fail.",
  common:["Says type 2 diabetes means the pancreas produces no insulin",
          "Describes the response without stating that opposing the change is what makes it negative feedback"] },

{ id:"sz-111", mod:"M8", topic:"Epidemiology", marks:5,
  q:"A study reports that people who drink more coffee have a lower rate of a certain disease. Explain why this does not establish that coffee prevents the disease, and describe what further evidence would strengthen the case.",
  criteria:[
    "States that the study is observational, so it shows a correlation rather than a causal relationship",
    "Explains the possibility of a confounding variable that is associated with both coffee consumption and the disease",
    "Explains the possibility of reverse causation, where early disease reduces coffee consumption rather than the reverse",
    "Describes evidence that would strengthen the case, such as a dose-response relationship, consistency across different populations, or a plausible biological mechanism",
    "States that a randomised controlled trial would provide the strongest evidence because randomisation distributes confounders evenly between groups"
  ],
  keys:[["correlation","observational","not causation","association"],["confounding","third variable","smoking","income","associated with both"],["reverse causation","the other way","disease reduces","already ill"],["dose-response","consistent","different populations","mechanism","plausible"],["randomised controlled trial","randomis","distributes confounders","strongest"]],
  sample:"The study is observational: it recorded what people chose to drink and what happened to them, and did not intervene. It can therefore establish only that coffee consumption and disease rate are associated. A confounding variable could produce the same result without coffee doing anything. If heavy coffee drinkers are, on average, wealthier, younger, more physically active or less likely to smoke, any of those could lower disease rates while merely travelling alongside coffee. Reverse causation is also possible: if the disease produces subtle symptoms years before diagnosis and those symptoms make coffee unappealing, then the people destined to develop it would already be drinking less, and the disease would be reducing coffee consumption rather than coffee reducing disease. Several kinds of further evidence would strengthen the causal claim. A dose-response relationship, in which each additional cup is associated with a further reduction, is harder to explain by confounding. Consistency across populations with different diets, incomes and smoking rates rules out any single confounder common to one group. A plausible biological mechanism, demonstrated in cells or animals, supplies a reason why coffee should have the effect. The strongest evidence would be a randomised controlled trial, in which participants are allocated to a coffee intake by chance. Randomisation distributes both known and unknown confounders evenly between the groups, so a difference in outcome can be attributed to the intervention, though such a trial may be impractical over the decades the disease takes to develop.",
  common:["Says 'correlation does not equal causation' without identifying any specific alternative explanation",
          "Treats a large sample size as sufficient to establish causation"] },

{ id:"sz-112", mod:"M8", topic:"Kidney", marks:5,
  q:"Explain how dialysis substitutes for a failed kidney, and explain two ways in which it is inferior to a functioning kidney.",
  criteria:[
    "States that blood is passed on one side of a partially permeable membrane with dialysis fluid on the other",
    "Explains that urea and excess ions diffuse down their concentration gradients into the dialysis fluid",
    "Explains that the fluid contains normal plasma concentrations of glucose and essential ions, so these do not diffuse out",
    "Identifies one inferiority, such as being intermittent while the kidney works continuously, allowing wastes and fluid to accumulate between sessions",
    "Identifies a second inferiority, such as the absence of hormonal functions like erythropoietin production and vitamin D activation, or the loss of fine control by ADH and aldosterone"
  ],
  keys:[["partially permeable","membrane","dialysis fluid","counter","blood on one side"],["urea","diffuse","concentration gradient","excess ions","removed"],["glucose","normal concentration","no net","essential ions","not lost"],["intermittent","three times a week","accumulate between","continuous","fluctuat"],["erythropoietin","vitamin d","hormone","adh","aldosterone","fine control"]],
  sample:"In haemodialysis, blood is drawn from the patient and passed through a dialyser, where it flows on one side of a partially permeable membrane while dialysis fluid flows on the other, usually in the opposite direction to maintain the gradient along the whole length. The membrane allows small molecules through but retains blood cells and plasma proteins. Urea is present in the blood and absent from the dialysis fluid, so it diffuses out, and the same applies to excess potassium and other ions. The fluid is deliberately made up with normal plasma concentrations of glucose and essential ions such as calcium, so there is no gradient for these and the patient does not lose them. Excess water is removed by applying a pressure difference across the membrane. It is a substitute for one function, not a replacement for the organ. First, it is intermittent. A kidney works continuously and adjusts minute by minute, whereas dialysis typically runs for four hours three times a week, so urea, potassium and fluid accumulate between sessions and are then removed abruptly. The patient's internal environment swings rather than being held steady, which is why fluid and potassium intake must be tightly restricted. Second, dialysis performs no endocrine function. A healthy kidney secretes erythropoietin to stimulate red blood cell production and activates vitamin D for calcium absorption, and it responds to ADH and aldosterone to fine-tune water and sodium retention. A dialyser does none of this, so patients commonly develop anaemia and bone disease and require these hormones to be supplied separately.",
  common:["Says dialysis fluid contains no glucose or ions, so useful substances would be lost",
          "Treats dialysis as equivalent to a transplant rather than as a partial substitute"] }

];
