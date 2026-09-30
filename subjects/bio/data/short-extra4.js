/* Short answer with marking criteria — fifth pass.

   This pass leans on the command words the HSC actually uses: assess,
   evaluate, justify, analyse and compare, rather than another round of
   "describe". The criteria are written so a student can tell whether they
   answered the command word or merely wrote about the topic. */

window.BIO = window.BIO || {}; BIO.DATA = BIO.DATA || {};

BIO.DATA.short_x4_y11 = [

{ id:"sv-001", mod:"M1", topic:"Microscopy", marks:5,
  q:"A student views a specimen at ×100 total magnification and measures a cell as 12 mm across on the screen. Calculate its actual size, and evaluate the use of a light microscope for examining this specimen's organelles.",
  criteria:[
    "Converts correctly: actual size = image size ÷ magnification, giving 0.12 mm",
    "Expresses the answer in an appropriate unit, 120 µm",
    "States that a light microscope has a resolution limit of about 200 nm, set by the wavelength of light",
    "Explains that organelles smaller than that limit, such as ribosomes, cannot be resolved however much magnification is applied",
    "Reaches a judgement: adequate for the cell outline, nucleus and chloroplasts, but not for fine ultrastructure, which requires an electron microscope"
  ],
  keys:[["divide","÷ 100","0.12","actual = image"],["120","micrometre","µm","um"],["resolution","200 nm","wavelength","limit"],["ribosome","cannot resolve","empty magnification","too small"],["judgement","adequate for","not suitable","electron microscope"]],
  sample:"Actual size equals image size divided by magnification, so 12 mm ÷ 100 = 0.12 mm, which is more usefully written as 120 µm. That is a large cell but within the normal range for a plant cell. Whether a light microscope is suitable depends on what is being looked for. Magnification and resolution are different things: magnification is how much larger the image is, resolution is the smallest separation at which two points are still seen as two. Resolution in a light microscope is limited to roughly 200 nm by the wavelength of visible light, and no amount of extra magnification improves it — beyond that point the image simply becomes larger and blurrier, which is called empty magnification. For this specimen the instrument is entirely adequate for measuring the cell, locating the nucleus, and seeing chloroplasts, all of which are several micrometres across. It is not adequate for ribosomes at about 20 nm, for the detail of membranes, or for the internal structure of mitochondria, all of which are an order of magnitude below the resolution limit. A transmission electron microscope, with a resolution near 0.1 nm, is required for those. The reasonable evaluation is therefore that the light microscope is fit for the purpose of examining whole cells and the largest organelles, and unfit for ultrastructure.",
  common:["Multiplies instead of dividing, giving an actual size larger than the image",
          "Treats magnification and resolution as the same property"] },

{ id:"sv-002", mod:"M1", topic:"Enzymes", marks:5,
  q:"Analyse the effect of increasing substrate concentration on the rate of an enzyme-controlled reaction, and explain the shape of the resulting curve.",
  criteria:[
    "States that at low substrate concentration the rate rises approximately in proportion to concentration",
    "Explains this rise as a greater frequency of successful collisions between substrate and free active sites",
    "States that the curve then levels off at a maximum rate",
    "Explains the plateau as every active site being occupied, so enzyme concentration is now the limiting factor",
    "Concludes that adding more enzyme, not more substrate, is what raises the rate beyond this point"
  ],
  keys:[["low concentration","proportional","directly","rises"],["collision","active site","free","frequency"],["plateau","levels off","maximum","vmax"],["saturated","all occupied","enzyme concentration limiting","every active site"],["add more enzyme","only way","enzyme is limiting"]],
  sample:"At low substrate concentration most active sites are unoccupied at any moment, so the rate is limited by how often a substrate molecule encounters a free site. Doubling the substrate concentration roughly doubles the frequency of successful collisions, and the rate rises in near-proportion, producing the steep, almost straight initial section of the curve. As concentration rises further, the proportion of sites that are free at any instant falls, so each additional increment of substrate produces a smaller gain. The curve bends. Eventually essentially every active site is occupied as soon as it becomes free, and the enzyme is working as fast as it can turn substrate over. The rate reaches a maximum and stays there: the enzyme is said to be saturated, and adding more substrate produces no further increase because there is nothing available to bind. What limits the rate has changed. Below saturation the limiting factor is substrate; above it, the limiting factor is the number of enzyme molecules and how quickly each completes a catalytic cycle. Doubling the enzyme concentration therefore doubles the maximum rate and shifts the whole plateau upward, while doubling the substrate concentration again does nothing at all.",
  common:["Says the enzyme is 'used up' at the plateau",
          "Describes the shape of the graph without identifying what is limiting in each region"] },

{ id:"sv-003", mod:"M1", topic:"Cell structure", marks:6,
  q:"Assess the evidence for the endosymbiotic theory of the origin of mitochondria and chloroplasts.",
  criteria:[
    "States that the theory proposes these organelles descend from free-living prokaryotes engulfed by an ancestral cell",
    "Gives the double membrane as evidence, with the inner membrane resembling a prokaryotic plasma membrane",
    "Gives their own circular DNA, without histones, as evidence",
    "Gives 70S ribosomes, the same size as bacterial ribosomes, as evidence",
    "Gives division by binary fission independently of the cell as evidence",
    "Reaches a judgement, noting the strength of the combined evidence and that most organelle genes have since moved to the nucleus"
  ],
  keys:[["engulf","free-living","prokaryote","symbio"],["double membrane","inner membrane","two membranes"],["circular dna","own dna","no histones"],["70s","ribosome","bacterial size"],["binary fission","divide independently","own division"],["judgement","strong","convincing","genes moved","nucleus"]],
  sample:"The endosymbiotic theory proposes that mitochondria and chloroplasts are the descendants of free-living aerobic and photosynthetic prokaryotes that were engulfed by a larger anaerobic host cell and retained rather than digested, with both partners benefiting. Several independent lines of evidence support it. Both organelles are bounded by two membranes, which is what engulfing a cell would produce: the inner membrane derives from the prokaryote's own plasma membrane and resembles it in lipid composition, while the outer is host-derived. Both contain their own DNA, and it is circular and not associated with histones, exactly as bacterial DNA is, rather than the linear, histone-wrapped chromosomes of the eukaryotic nucleus. Both contain ribosomes, and these are 70S — the prokaryotic size — not the 80S ribosomes of the surrounding cytoplasm, which is why some antibiotics that target bacterial ribosomes also affect mitochondria. Both divide by binary fission, independently of the cell cycle, and cannot be built from scratch by a cell that has lost them. The strength of the case lies in the convergence of these lines: any one could be explained away, but together they point to a bacterial origin. The main complication is that mitochondria cannot live independently, because most of the genes they once had have migrated to the nuclear genome over evolutionary time. This is expected under the theory rather than contrary to it, since a permanently housed symbiont is under no selection to keep duplicate genes.",
  common:["Lists the evidence without ever making the assessment the command word demands",
          "Argues that mitochondria cannot be descended from bacteria because they cannot survive alone"] },

{ id:"sv-004", mod:"M2", topic:"Transport in animals", marks:5,
  q:"Explain how the structure of an artery, a capillary and a vein each relates to its function.",
  criteria:[
    "Describes the artery's thick elastic and muscular wall and narrow lumen, and links it to withstanding and smoothing high pressure",
    "Explains that elastic recoil between beats maintains flow during diastole",
    "Describes the capillary as a single layer of endothelium with a lumen the width of a red blood cell",
    "Explains that this gives a short diffusion distance and slow flow, allowing exchange with tissue fluid",
    "Describes the vein's thin wall, wide lumen and valves, and links them to low pressure and preventing backflow"
  ],
  keys:[["thick wall","elastic","muscular","narrow lumen","high pressure"],["recoil","diastole","smooths","maintains flow","pulse"],["one cell thick","endothelium","narrow","single layer"],["short diffusion","slow flow","exchange","tissue fluid"],["thin wall","wide lumen","valve","backflow","low pressure"]],
  sample:"An artery carries blood away from the heart at high and pulsatile pressure. Its wall is thick, with a large amount of elastic tissue and smooth muscle, and its lumen is relatively narrow. The elastic tissue stretches as the ventricle ejects blood and recoils between beats, which both prevents the vessel bursting and keeps blood moving during diastole, smoothing the flow. The muscle allows the diameter to be adjusted, redirecting blood between organs. A capillary's function is exchange, not transport, and its structure is stripped back accordingly: a single layer of endothelial cells, often with gaps between them, and a lumen barely wider than a red blood cell. The diffusion distance is therefore minimal, the cells are forced into contact with the wall, and because the total cross-sectional area of the capillary bed is enormous the flow is slow, giving time for substances to move in and out. A vein returns blood at low pressure. It needs no thick wall, so its wall is thin and its lumen wide, which reduces resistance to a flow that has little pressure behind it. Because that pressure is insufficient to guarantee movement against gravity, veins contain semilunar valves that close if blood begins to move backwards, and the contraction of surrounding skeletal muscle squeezes the vessel and pushes blood on towards the heart.",
  common:["Says veins have valves 'because they are thin', rather than because pressure is low",
          "Attributes the slow flow in capillaries to their narrowness rather than to the total cross-sectional area"] },

{ id:"sv-005", mod:"M3", topic:"Speciation", marks:6,
  q:"Compare allopatric and sympatric speciation, and justify why allopatric speciation is thought to be more common.",
  criteria:[
    "States that both involve a reduction in gene flow leading to divergence of gene pools",
    "States that both end with reproductive isolation, so the populations cannot interbreed",
    "Explains that allopatric speciation begins with a physical barrier separating populations geographically",
    "Explains that sympatric speciation occurs without physical separation, through mechanisms such as polyploidy, temporal isolation or habitat preference",
    "Justifies the greater frequency of allopatric speciation by noting that a geographical barrier stops gene flow completely and immediately",
    "Notes that in sympatry gene flow continues unless something unusual blocks it, so divergence is more easily reversed"
  ],
  keys:[["both","gene flow","diverge","gene pool"],["reproductive isolation","cannot interbreed","both end"],["allopatric","geographical","physical barrier","separate"],["sympatric","same area","polyploid","temporal","habitat"],["complete","immediate","stops gene flow entirely","barrier"],["continues","swamped","reversed","harder","rare"]],
  sample:"The two modes share their essential logic. In both, gene flow between two parts of a population is reduced, mutation, drift and different selection pressures cause the two gene pools to diverge, and the endpoint is reproductive isolation, at which the populations can no longer produce fertile offspring together and are separate species. What differs is how gene flow is interrupted. Allopatric speciation begins with geography: a river changes course, sea level rises, a mountain range is uplifted, or a small group is carried to an island. The populations are physically separated, so interbreeding is impossible regardless of biology. Sympatric speciation occurs while the populations occupy the same area, so the barrier must be biological — instantaneous polyploidy in plants, a shift in flowering or breeding time, a switch to a different host plant, or assortative mating by preference. Allopatric speciation is thought to be far more common, and the justification is about the completeness of the interruption. A geographical barrier reduces gene flow to zero immediately and maintains that for as long as it lasts, so divergence accumulates without being undone. In sympatry, any incipient divergence is exposed to continued interbreeding with the rest of the population, and the resulting gene flow tends to swamp the differences before reproductive isolation is complete. Sympatric speciation therefore requires an unusually abrupt mechanism, which is why polyploidy in plants — where a single event creates an instantly incompatible chromosome number — is its clearest documented case.",
  common:["Defines the two terms without ever comparing them on shared criteria",
          "Says sympatric speciation is impossible rather than less common"] },

{ id:"sv-006", mod:"M4", topic:"Sampling", marks:5,
  q:"A student wants to estimate the abundance of a plant species across a hillside that grades from wet gully to dry ridge. Justify a sampling strategy and explain how the data would be analysed.",
  criteria:[
    "Identifies that the environment is not uniform, so simple random sampling across the whole site may miss or over-represent zones",
    "Proposes a transect running from gully to ridge so the gradient is deliberately sampled",
    "Describes quadrats placed at regular intervals along the transect, with the quadrat size and interval stated",
    "Explains that percentage cover or a count is recorded in each quadrat and repeated on several parallel transects",
    "Explains that plotting abundance against position along the gradient reveals the species' distribution and its tolerance range"
  ],
  keys:[["not uniform","gradient","zonation","varies"],["transect","gully to ridge","along the gradient","line"],["quadrat","regular interval","every","size","0.5 m"],["percentage cover","count","repeat","parallel","replicate"],["plot","against distance","distribution","tolerance","abiotic"]],
  sample:"The hillside is not uniform: moisture, soil depth and exposure change systematically from gully to ridge, and the plant's abundance is likely to change with them. Scattering random quadrats across the whole site would mix these zones together and produce a single average that describes nowhere in particular, and with a small sample it might miss a zone entirely. A belt transect running directly from the gully to the ridge is the appropriate design, because it deliberately samples the gradient rather than averaging over it. Quadrats of a fixed size, say 0.5 m by 0.5 m, are placed at regular intervals — every five metres, for instance — along the line, and percentage cover of the species is estimated in each, along with the abiotic variables of interest such as soil moisture and light. Because a single line might happen to cross an unrepresentative patch, at least three parallel transects are run and the values at equivalent positions averaged. The data are analysed by plotting mean abundance against distance along the transect, ideally with the abiotic measurements on the same axis. That graph shows where the species is most abundant, the range of conditions it tolerates, and where it drops out altogether. If the interest is in the relationship rather than the map, abundance can be plotted directly against soil moisture and a correlation examined, remembering that a correlation along a transect does not by itself establish which factor is responsible.",
  common:["Proposes random sampling without noticing the site has a gradient",
          "Describes the method but never says what would be plotted or concluded"] },

{ id:"sv-007", mod:"M4", topic:"Human impact", marks:6,
  q:"Evaluate the use of Indigenous fire management practices in maintaining Australian ecosystems.",
  criteria:[
    "Describes the practice as frequent, low-intensity, patchy burning carried out in cooler months",
    "Explains that this reduces fuel load and so lowers the likelihood of an intense, canopy-destroying fire",
    "Explains that patchiness creates a mosaic of habitats at different stages of regrowth, supporting more species",
    "Refers to evidence such as the decline of small mammals in regions where the practice ceased",
    "Identifies a limitation, such as difficulty applying it near settlement, altered species composition since colonisation, or changed climate",
    "Reaches a judgement supported by the points made rather than simply asserted"
  ],
  keys:[["cool","low intensity","patchy","mosaic","early dry season"],["fuel load","reduces","intense fire","canopy","wildfire"],["mosaic","habitat","different ages","diversity","refuge"],["evidence","small mammal","decline","since ceased","kimberley","arnhem"],["limitation","near towns","weeds","climate","altered","difficult"],["judgement","overall","effective","conclude","on balance"]],
  sample:"Indigenous fire management involves burning frequently, at low intensity, in patches, and early in the dry season when fires go out overnight. Its effect on fuel load is direct: burning small amounts often means the litter and understorey never accumulate to the levels that carry a fire into the canopy, so the intense summer fires that kill mature trees and sterilise soil become far less likely. The patchiness matters as much as the frequency. Burning a mosaic leaves unburnt refuges immediately adjacent to burnt ground, so animals can survive and recolonise, and it produces vegetation at many different stages of regrowth across a landscape, which supports more species than a uniform sweep of one age class. The evidence is reasonably strong. In parts of northern Australia where the practice lapsed after people were moved off country, fire regimes shifted to large, late-season, high-intensity burns, and small mammal populations declined sharply over the same period; reinstating traditional burning in Arnhem Land and the Kimberley has been followed by reductions in the area burnt at high intensity. There are limits. The practice is difficult to apply close to settlement, where any escape is unacceptable and smoke affects residents. Two centuries of grazing, weeds and altered species composition mean the vegetation being burnt is not the vegetation the practice evolved with, and a hotter, drier climate narrows the window in which cool burns are safe. On balance the evidence supports it as an effective and well-tested management tool that reduces catastrophic fire and supports biodiversity, provided it is applied with knowledge of the specific country rather than as a general prescription.",
  common:["Describes the practice without evaluating it, so no judgement is made",
          "Presents only the benefits, which is a description rather than an evaluation"] }

];

BIO.DATA.short_x4_y12 = [

{ id:"sv-101", mod:"M5", topic:"Inheritance", marks:6,
  q:"In tomatoes, tall (T) is dominant to dwarf (t) and round fruit (R) is dominant to pear-shaped (r). A dihybrid plant is crossed with a dwarf, pear-shaped plant. Predict the offspring, and explain how the result would differ if the two genes were linked.",
  criteria:[
    "Identifies the cross as TtRr × ttrr, a test cross for both genes",
    "States the four gamete types from the dihybrid parent as TR, Tr, tR and tr in equal proportions",
    "Predicts a 1:1:1:1 phenotypic ratio of tall round, tall pear, dwarf round, dwarf pear",
    "Explains that this ratio depends on independent assortment of the two gene pairs in meiosis",
    "Explains that if the genes were linked, the parental combinations would be far more frequent than the recombinants",
    "Explains that recombinants would still appear because of crossing over, and that their frequency indicates how far apart the loci are"
  ],
  keys:[["ttrr","ttrr","test cross","dihybrid"],["tr","tr","tr","tr","four gametes","equal"],["1:1:1:1","tall round","dwarf pear","four phenotypes"],["independent assortment","metaphase i","separate chromosomes"],["linked","parental","more frequent","excess"],["crossing over","recombinant","frequency","distance","map"]],
  sample:"The cross is TtRr × ttrr. The dwarf pear-shaped parent is homozygous recessive for both genes and can only make tr gametes, so the offspring phenotypes read the dihybrid parent's gametes directly — this is a dihybrid test cross. If the genes are on different chromosome pairs they assort independently in metaphase I, so the dihybrid produces TR, Tr, tR and tr gametes in equal numbers. Each combines with tr, giving TtRr, Ttrr, ttRr and ttrr, which are tall round, tall pear-shaped, dwarf round and dwarf pear-shaped in a 1:1:1:1 ratio. Twenty-five per cent of the offspring fall into each class. If the two genes were linked on the same chromosome, that prediction fails. The alleles the dihybrid inherited together stay together unless a chiasma forms between them, so the two parental gamete types would be produced far more often than the two recombinant types. Instead of four equal classes, the results might be forty-five per cent of each parental phenotype and five per cent of each recombinant. Recombinants still appear, because crossing over does occur, and their frequency is informative: the further apart two loci are on the chromosome, the more likely a crossover falls between them, so the recombination frequency is used as a measure of map distance. A frequency approaching fifty per cent is indistinguishable from independent assortment, which is why genes far apart on the same chromosome behave as if unlinked.",
  common:["Writes a 9:3:3:1 ratio, which belongs to a dihybrid self-cross rather than a test cross",
          "Says linked genes never separate, forgetting crossing over"] },

{ id:"sv-102", mod:"M5", topic:"Pedigrees", marks:5,
  q:"Explain how a pedigree can be used to determine whether a condition is autosomal recessive, and explain a limitation of this method.",
  criteria:[
    "States that two unaffected parents having an affected child indicates a recessive condition",
    "Explains that both parents must therefore be heterozygous carriers",
    "States that roughly equal numbers of affected males and females suggest the gene is autosomal rather than X-linked",
    "Explains that an affected daughter with an unaffected father rules out X-linked recessive inheritance",
    "Identifies a limitation, such as small family sizes making ratios unreliable, or that several patterns may fit a small pedigree"
  ],
  keys:[["unaffected parents","affected child","skips","recessive"],["carrier","heterozygous","both parents","aa"],["equal","males and females","both sexes","autosomal"],["affected daughter","unaffected father","rules out","x-linked"],["small","few individuals","ratio unreliable","more than one pattern","limitation"]],
  sample:"The strongest single clue is two unaffected parents producing an affected child. Since the allele must have been present in the parents without being expressed, the condition is recessive and both parents are heterozygous carriers. This also predicts that about one quarter of their children will be affected, though family sizes are far too small for that ratio to be relied on in any one pedigree. To distinguish autosomal from X-linked recessive inheritance, count the sexes. An autosomal recessive condition affects males and females in roughly equal numbers, whereas an X-linked recessive condition affects far more males, because a male needs only one copy. The decisive observation is an affected daughter whose father is unaffected: under X-linked recessive inheritance she would have had to inherit an affected X from her father, so an unaffected father rules that pattern out and the gene must be autosomal. The limitation is that a pedigree is a small, non-random sample. Most families contain only a handful of children, so observed ratios carry little weight, and a pedigree with few affected individuals is often consistent with more than one mode of inheritance — autosomal recessive can explain everything X-linked recessive explains, since it simply does not predict the sex bias. A pedigree can therefore exclude patterns confidently but often cannot identify one uniquely, and molecular testing is used to settle the question.",
  common:["Concludes X-linked recessive from a male bias in a family with only three or four children",
          "States a 1 in 4 ratio as a prediction about a particular family rather than a probability per child"] },

{ id:"sv-103", mod:"M6", topic:"Genetic technologies", marks:6,
  q:"Assess the use of CRISPR-Cas9 for treating an inherited disease in humans.",
  criteria:[
    "Describes the mechanism: a guide RNA directs Cas9 to a complementary sequence, which is then cut",
    "Explains that the cell's repair of the cut is used to disable a faulty gene or insert a corrected sequence",
    "Identifies an advantage such as precision, low cost or speed compared with earlier techniques",
    "Identifies a technical risk such as off-target cutting or mosaicism if not all cells are edited",
    "Distinguishes somatic editing, which affects only the patient, from germline editing, which is heritable",
    "Reaches a judgement that weighs the therapeutic potential against the risks and the consent problem"
  ],
  keys:[["guide rna","cas9","complementary","cut","double-strand break"],["repair","disable","insert","template","correct"],["precise","cheap","fast","advantage","targeted"],["off-target","mosaic","unintended","risk","not all cells"],["somatic","germline","heritable","future generations"],["judgement","on balance","promising","caution","weigh"]],
  sample:"CRISPR-Cas9 pairs a short guide RNA with the Cas9 nuclease. The guide is designed to be complementary to a chosen sequence, so the complex binds only where that sequence occurs and Cas9 makes a double-strand cut. The cell then repairs the break, and the therapy exploits that repair: left to itself, the cell joins the ends imprecisely and disables the gene, which is useful when the faulty allele is the problem; supplied with a correct template, the cell can copy it in and restore the normal sequence. Its advantages over earlier methods are substantial. Retargeting requires only a new guide RNA rather than engineering a new protein, so it is fast, inexpensive and far more precise than viral insertion at a random site. Trials in sickle cell disease and beta thalassaemia, where the patient's own blood stem cells are edited outside the body and returned, have produced sustained remission. The risks are real. Guides can bind similar sequences elsewhere and cut where they should not, and an off-target cut in a tumour suppressor gene would be serious. Editing rarely reaches every target cell, so mosaicism is common and the correction may be partial. The critical distinction is somatic versus germline. Somatic editing affects only the consenting patient and its risks are borne by that person. Germline editing changes every cell of the resulting individual and of all their descendants, who cannot consent, and any off-target error is inherited with it. On balance the technique is a genuine advance and its somatic use is justified for serious diseases where the alternative is severe illness, subject to careful assessment of off-target effects. Germline use is a different question, and the current international position — a moratorium pending far better evidence and broad public agreement — is the defensible one.",
  common:["Describes how CRISPR works without assessing anything",
          "Treats somatic and germline editing as raising the same ethical questions"] },

{ id:"sv-104", mod:"M6", topic:"Population genetics", marks:5,
  q:"Explain how a population bottleneck reduces genetic diversity, and explain why this matters for the long-term survival of the species.",
  criteria:[
    "States that a bottleneck is a sharp reduction in population size from which the population later recovers",
    "Explains that the survivors carry only a sample of the original alleles, so many are lost entirely",
    "Explains that recovery restores numbers but not the lost alleles, since mutation replaces them only very slowly",
    "Explains that low diversity means less variation for natural selection to act on if the environment changes",
    "Explains that increased homozygosity raises the frequency of recessive genetic disorders and susceptibility to a single pathogen"
  ],
  keys:[["sharp reduction","crash","small number","survivors","recovers"],["sample","alleles lost","chance","not representative","drift"],["numbers recover","diversity does not","mutation slow","permanent"],["less variation","selection","environment changes","cannot adapt"],["homozygous","inbreeding","recessive disorder","disease","susceptible"]],
  sample:"A bottleneck occurs when a population crashes to a very small size — through hunting, disease, habitat loss or a natural catastrophe — and later recovers. The survivors are a small and essentially random sample of the original population, so many alleles that were present, particularly rare ones, are simply not represented among them and are lost. The smaller the bottleneck, the more severe the loss, because chance rather than fitness determines which alleles get through. When numbers recover, the population is rebuilt from that reduced set. Numbers return; diversity does not. New alleles arise only by mutation, which operates over thousands of generations, so on any timescale relevant to conservation the loss is permanent. This matters for two reasons. Natural selection can only act on variation that already exists, so a species with a narrow gene pool has fewer options if the climate shifts or a new pathogen arrives; the alleles that would have conferred tolerance may no longer exist in the population at all. Second, the recovered population is descended from few individuals, so relatives inevitably breed together and homozygosity rises. Recessive alleles that were harmless while rare and heterozygous begin to appear in the homozygous state, so inherited disorders become more frequent and fertility often falls. Uniform immune genes also mean that a pathogen able to infect one individual can infect nearly all of them, which is why the northern elephant seal and the Tasmanian devil are both cited as populations at risk despite having recovered in numbers.",
  common:["Says the population regains its diversity as numbers recover",
          "Confuses a bottleneck with the founder effect, which involves a few individuals colonising a new area"] },

{ id:"sv-105", mod:"M7", topic:"Epidemiology", marks:6,
  q:"Analyse the measures used to control an outbreak of an infectious respiratory disease, and explain how each interrupts transmission.",
  criteria:[
    "Identifies case isolation and explains that it removes infectious individuals from contact with susceptible ones",
    "Identifies quarantine of contacts and explains that it prevents transmission during the incubation period before symptoms appear",
    "Identifies contact tracing and explains that it finds exposed people before they infect others",
    "Identifies a barrier or hygiene measure and explains the transmission route it blocks",
    "Identifies vaccination and explains that it reduces the pool of susceptible individuals and so lowers the effective reproduction number",
    "Explains that the measures are combined because each is partial, and relates their effect to reducing R below 1"
  ],
  keys:[["isolation","cases","removes","infectious","separate"],["quarantine","contacts","incubation","before symptoms","pre-symptomatic"],["contact tracing","find","exposed","before they spread"],["mask","hand washing","ventilation","droplet","route"],["vaccination","susceptible","herd","reduces pool"],["below 1","effective reproduction","combined","layers","each partial"]],
  sample:"Every control measure works by removing one link from the transmission chain, and their effect is measured by what they do to the effective reproduction number, the average number of new cases each case produces. Isolation separates people already known to be infected, so their remaining infectious period is spent away from susceptible people; it is highly effective for diseases where symptoms precede infectiousness, and much weaker where they do not. Quarantine addresses that weakness by separating people who have been exposed but are not yet symptomatic, since for many respiratory viruses transmission begins a day or two before symptoms appear and isolation alone would act too late. Contact tracing supplies quarantine with names: it works backwards from a confirmed case to everyone exposed, so they can be found and separated before they in turn infect others, and its value falls sharply once case numbers exceed the tracing capacity. Barrier and hygiene measures act on the route rather than the person — masks intercept respiratory droplets and aerosols at both source and recipient, ventilation dilutes airborne particles, and hand hygiene interrupts transmission via contaminated surfaces. Vaccination acts on the third element, the susceptible pool: an immune person is a dead end for the chain, so as coverage rises each case finds fewer people to infect. No single measure reduces R below 1 on its own, because each is partial — masks are imperfectly worn, tracing misses contacts, vaccines are not fully protective. They are used in combination because their effects multiply, and the aim of the combination is simply to hold R under 1, at which point each generation of cases is smaller than the last and the outbreak dies out.",
  common:["Lists measures without explaining which link in the chain each one breaks",
          "Treats quarantine and isolation as the same measure"] },

{ id:"sv-106", mod:"M8", topic:"Homeostasis", marks:5,
  q:"Compare nervous and endocrine coordination, and justify why the body uses both.",
  criteria:[
    "States that both are communication systems that coordinate the response of effectors to a change",
    "Explains that nervous transmission is electrical along neurones and is very fast, acting in milliseconds",
    "Explains that endocrine signalling uses hormones carried in the blood and is slower, acting over seconds to hours",
    "Explains that nervous responses are localised and short-lived while hormonal responses are widespread and longer-lasting",
    "Justifies having both by giving a situation suited to each, such as a reflex withdrawal versus the control of growth or the menstrual cycle"
  ],
  keys:[["both","communicate","coordinate","effector","control"],["electrical","neurone","impulse","millisecond","fast"],["hormone","blood","slower","seconds","minutes"],["localised","short-lived","widespread","long-lasting","target"],["reflex","withdraw","growth","menstrual","justify","each suited"]],
  sample:"Both systems detect a change and coordinate the response of effectors, and they overlap at the adrenal medulla and the hypothalamus, where one drives the other. They differ in medium, speed, reach and duration. Nervous coordination sends an electrical impulse along a dedicated neurone to a specific effector, and the impulse travels at up to a hundred metres per second, so a response can begin within milliseconds. Because the signal is delivered along a fixed anatomical route, the response is localised to the muscles or glands that neurone supplies, and it stops almost as soon as the impulses stop. Endocrine coordination releases a hormone into the blood, which carries it everywhere; only cells with the matching receptor respond. Transport takes seconds to minutes, so the system is far slower, but the hormone persists until it is broken down or excreted, so the effect is prolonged, and because the blood reaches every tissue the response can be simultaneous and body-wide. Neither would suffice alone. Withdrawing a hand from a hot surface must happen before tissue is destroyed and must involve only the relevant muscles, which requires a fast, targeted, temporary signal — a hormonal reflex would arrive far too late. Conversely, growth over years, the menstrual cycle over weeks, or the maintenance of blood glucose over hours all require a sustained signal acting on many tissues at once, which no neurone could deliver. The two systems are therefore complementary: speed and precision from one, persistence and reach from the other.",
  common:["Says hormones are 'slower because blood is slow', without noting that the duration of the effect is the real advantage",
          "Compares the two systems in isolation without ever justifying why both exist"] },

{ id:"sv-107", mod:"M8", topic:"Treatment", marks:6,
  q:"Evaluate the use of a randomised controlled trial to test a new drug for a chronic disease.",
  criteria:[
    "Describes random allocation of participants to treatment and control groups",
    "Explains that randomisation distributes both known and unknown confounding variables evenly between the groups",
    "Explains that a placebo control and blinding prevent expectation from affecting the outcome or its assessment",
    "Identifies a practical limitation such as cost, duration, or the difficulty of recruiting enough participants",
    "Identifies an ethical limitation such as withholding an effective treatment from the control group",
    "Reaches a judgement, recognising the trial as the strongest available design while noting where its results may not generalise"
  ],
  keys:[["random","allocate","treatment","control","chance"],["confounding","known and unknown","evenly","balanced","only difference"],["placebo","blind","double blind","expectation","bias"],["cost","years","recruit","chronic","practical"],["ethical","withhold","placebo when treatment exists","consent"],["strongest","gold standard","judgement","generalise","narrow criteria"]],
  sample:"In a randomised controlled trial, participants are allocated by chance to receive either the new drug or a control, which may be a placebo or the current standard treatment. Randomisation is what gives the design its power. Because allocation is independent of any characteristic of the participant, both known confounders such as age and smoking and unknown ones the researchers have not thought of are distributed evenly between the groups, so any difference in outcome can reasonably be attributed to the treatment itself. That is precisely what an observational study cannot establish. A placebo control removes the effect of receiving treatment as such, and blinding — ideally of participants, clinicians and assessors — prevents expectation from influencing either how patients report their symptoms or how outcomes are judged. The limitations are practical and ethical rather than logical. A chronic disease develops over years, so the trial must run for years and recruit thousands of participants to detect a modest effect, which is expensive and slow, and drop-outs accumulate over that time. Ethically, a placebo control cannot be justified where an effective treatment already exists, so the comparison must be against standard care, which makes detecting an improvement harder. Trials also apply strict entry criteria and tend to enrol younger patients with fewer other conditions, so the population studied may not resemble the patients who will eventually take the drug. The judgement is that the randomised controlled trial remains the strongest available design for establishing that a treatment works, and nothing else controls confounding as effectively; but its results should be read alongside longer-term observational follow-up, because what a trial establishes reliably is the effect in the population it recruited.",
  common:["Describes the method thoroughly and never reaches the judgement 'evaluate' requires",
          "Says randomisation removes confounding variables, rather than distributing them evenly"] }

];
