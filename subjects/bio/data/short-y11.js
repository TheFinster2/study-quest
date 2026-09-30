/* Short answer with marking criteria — Year 11.
   The student writes, then reveals the criteria and ticks what they actually
   made. The app never grades the prose. (brief §4) */
window.BIO = window.BIO || {}; BIO.DATA = BIO.DATA || {};

BIO.DATA.short_m1 = [
{ id:"sa-m1-001", mod:"M1", topic:"Membrane transport", marks:4,
  q:"Compare diffusion and active transport across a cell membrane.",
  criteria:[
    "States that diffusion moves particles down a concentration gradient (high to low)",
    "States that active transport moves particles against the concentration gradient",
    "Identifies that diffusion requires no energy while active transport requires ATP",
    "Notes that active transport requires a carrier protein, while simple diffusion does not"
  ],
  keys:[["gradient","high","low"],["against","against gradient"],["atp","energy"],["carrier","protein","pump"]],
  sample:"Diffusion is the net movement of particles from a region of higher concentration to a region of lower concentration, down the concentration gradient, and it is passive — no ATP is used. Active transport moves particles from lower to higher concentration, against the gradient, and this requires ATP. Active transport must use a specific carrier protein that changes shape as it moves the particle, whereas simple diffusion occurs directly through the phospholipid bilayer.",
  common:["Says active transport is 'faster' rather than identifying the direction relative to the gradient",
          "Describes facilitated diffusion as active because a protein is involved"] },

{ id:"sa-m1-002", mod:"M1", topic:"Enzymes", marks:5,
  q:"Explain the effect of increasing temperature on the rate of an enzyme-catalysed reaction.",
  criteria:[
    "States that rate increases up to the optimum temperature",
    "Explains this rise in terms of increased kinetic energy and more frequent successful enzyme-substrate collisions",
    "Identifies an optimum temperature at which rate is maximum",
    "States that above the optimum the rate falls sharply",
    "Explains the fall by denaturation: hydrogen and ionic bonds break, the tertiary structure changes and the active site is no longer complementary to the substrate"
  ],
  keys:[["increases","rises"],["kinetic","collisions","collide"],["optimum"],["falls","decreases","drops"],["denature","denatured","active site","tertiary"]],
  sample:"As temperature increases from low values, enzyme and substrate molecules gain kinetic energy and move faster, so successful collisions between substrate and active site become more frequent and the rate of reaction rises. The rate is maximum at the optimum temperature, around 37 °C for most human enzymes. Above the optimum, the increased vibration breaks the hydrogen and ionic bonds holding the enzyme's tertiary structure. The active site changes shape, is no longer complementary to the substrate, and the enzyme is denatured, so the rate falls sharply and does not recover on cooling.",
  common:["Says the enzyme is 'killed' — enzymes are not alive",
          "Says the substrate is denatured rather than the enzyme",
          "Omits the mechanism for the rise and only describes the shape of the graph"] },

{ id:"sa-m1-003", mod:"M1", topic:"Cell structure", marks:4,
  q:"Explain how the structure of the mitochondrion suits its function.",
  criteria:[
    "States that the mitochondrion is the site of aerobic respiration, releasing ATP",
    "Identifies the double membrane, with the inner membrane folded into cristae",
    "Explains that cristae increase the surface area for the electron transport chain and ATP synthase",
    "Identifies the matrix as the site of the Krebs cycle, containing the required enzymes"
  ],
  keys:[["aerobic","atp","respiration"],["cristae","double membrane","inner membrane"],["surface area"],["matrix","enzymes"]],
  sample:"The mitochondrion is the site of aerobic respiration, in which glucose is oxidised and the energy released is captured as ATP. It has two membranes; the inner one is highly folded into cristae. These folds greatly increase the surface area available for the electron transport chain proteins and ATP synthase, so more ATP can be produced per mitochondrion. The fluid matrix inside contains the enzymes of the Krebs cycle, along with the mitochondrion's own DNA and 70S ribosomes.",
  common:["Says mitochondria 'make energy' — energy is transferred, not made",
          "Describes cristae without saying what the extra surface area is for"] },

{ id:"sa-m1-004", mod:"M1", topic:"Membrane structure", marks:4,
  q:"Describe the fluid mosaic model of the cell membrane and explain why it is described as 'fluid' and as a 'mosaic'.",
  criteria:[
    "Describes a phospholipid bilayer with hydrophilic heads outward and hydrophobic tails inward",
    "States that proteins are embedded in and span the bilayer",
    "Explains 'fluid': phospholipids and many proteins move laterally within the layer",
    "Explains 'mosaic': the scattered, varied pattern of proteins, glycoproteins and glycolipids"
  ],
  keys:[["bilayer","hydrophilic","hydrophobic"],["protein","embedded","span"],["fluid","move","lateral"],["mosaic","scattered","pattern"]],
  sample:"The membrane consists of a phospholipid bilayer in which the hydrophilic phosphate heads face the aqueous solutions on each side and the hydrophobic fatty-acid tails face inwards. Proteins are embedded in this bilayer, some spanning it completely as channels or carriers and others partially embedded. It is 'fluid' because the phospholipids and many of the proteins are not fixed and can move laterally within the plane of the layer. It is a 'mosaic' because the proteins, glycoproteins and glycolipids are scattered through the bilayer in a varied, irregular pattern rather than a regular arrangement.",
  common:["Describes the structure but never explains either word in the model's name"] },

{ id:"sa-m1-005", mod:"M1", topic:"Photosynthesis", marks:5,
  q:"Explain how the light-dependent and light-independent stages of photosynthesis are linked.",
  criteria:[
    "States that light-dependent reactions occur in the thylakoid membranes",
    "States that light energy is used to split water (photolysis), releasing oxygen",
    "Identifies ATP and NADPH as the products passed to the next stage",
    "States that the light-independent (Calvin cycle) reactions occur in the stroma",
    "Explains that ATP and NADPH are used to reduce carbon dioxide to carbohydrate"
  ],
  keys:[["thylakoid","grana"],["photolysis","split water","oxygen"],["atp","nadph"],["stroma","calvin"],["carbon dioxide","fix","reduce","carbohydrate","glucose"]],
  sample:"The light-dependent reactions take place in the thylakoid membranes of the chloroplast. Light energy absorbed by chlorophyll is used to split water by photolysis, releasing oxygen as a by-product, and to generate ATP and reduced NADP. These two products are the link between the stages: they pass into the stroma, where the light-independent Calvin cycle uses the ATP as an energy source and the NADPH as a source of hydrogen to reduce carbon dioxide, fixed by RuBisCO, into carbohydrate. Without the products of the first stage the second stage stops, which is why photosynthesis ceases in darkness even though the Calvin cycle does not itself require light.",
  common:["Calls the second stage the 'dark reactions' and says it happens at night",
          "Names the products but never says what the Calvin cycle does with them"] },

{ id:"sa-m1-006", mod:"M1", topic:"Membrane transport", marks:4,
  q:"A red blood cell and a plant cell are each placed in distilled water. Predict and explain what happens to each.",
  criteria:[
    "States that water enters both cells by osmosis, since distilled water has a higher water potential than the cytoplasm",
    "Predicts that the red blood cell swells and bursts (lyses)",
    "Predicts that the plant cell swells and becomes turgid but does not burst",
    "Explains the difference in terms of the plant cell's rigid cellulose cell wall exerting an opposing pressure"
  ],
  keys:[["osmosis","water potential"],["burst","lyse","lysis"],["turgid","turgor"],["cell wall","cellulose","wall"]],
  sample:"Distilled water has a higher water potential than the cytoplasm of both cells, so water moves into both by osmosis across their partially permeable membranes. The red blood cell has only a plasma membrane, which cannot resist the increasing pressure, so the cell swells and eventually bursts — lysis. The plant cell also takes in water and its vacuole swells, but the rigid cellulose cell wall resists the expansion and exerts an inward pressure. The cell becomes turgid and firm but does not burst.",
  common:["Says the plant cell 'has a stronger membrane' rather than identifying the wall",
          "Describes the direction of water movement as 'towards the salt' rather than down the water potential gradient"] },

{ id:"sa-m1-007", mod:"M1", topic:"Microscopy", marks:3,
  q:"Distinguish between magnification and resolution, and explain why an electron microscope is more useful for viewing organelles.",
  criteria:[
    "Defines magnification as how many times larger the image is than the actual object",
    "Defines resolution as the smallest distance between two points that can still be distinguished",
    "Explains that electrons have a much shorter wavelength than light, giving far higher resolution, so organelle detail can be distinguished"
  ],
  keys:[["magnification","times larger"],["resolution","distinguish","separate"],["wavelength","electron"]],
  sample:"Magnification is how many times larger the image appears than the actual specimen, calculated as image size divided by actual size. Resolution is the smallest distance between two points at which they can still be seen as separate. Increasing magnification beyond the resolution limit simply produces a larger blur. Electrons have a far shorter wavelength than visible light, so an electron microscope resolves structures around 0.1 nm apart compared with about 200 nm for a light microscope, which is why organelles such as ribosomes and cristae can be seen.",
  common:["Treats magnification and resolution as the same idea",
          "Says electron microscopes are better without explaining why"] },

{ id:"sa-m1-008", mod:"M1", topic:"Respiration", marks:4,
  q:"Compare aerobic and anaerobic respiration in humans.",
  criteria:[
    "States that aerobic respiration requires oxygen and anaerobic does not",
    "Identifies the products: aerobic gives carbon dioxide and water; anaerobic in humans gives lactic acid",
    "Compares ATP yield: about 30–32 ATP per glucose aerobically versus 2 anaerobically",
    "Identifies the sites: aerobic mainly in the mitochondrion, anaerobic in the cytosol"
  ],
  keys:[["oxygen"],["lactic","carbon dioxide","water"],["atp","yield","2","30"],["mitochondri","cytosol","cytoplasm"]],
  sample:"Both pathways begin with glycolysis in the cytosol and both release energy from glucose as ATP. Aerobic respiration requires oxygen and continues in the mitochondrion, fully oxidising glucose to carbon dioxide and water and yielding about 30–32 ATP per glucose. Anaerobic respiration in humans occurs when oxygen is limited; pyruvate is reduced to lactic acid in the cytosol to regenerate NAD⁺, and only the 2 ATP from glycolysis are produced. Anaerobic respiration is therefore much less efficient but can supply ATP rapidly for short periods.",
  common:["Says anaerobic respiration produces ethanol in humans — that is yeast and plants",
          "Says anaerobic respiration produces no ATP"] }
];

BIO.DATA.short_m2 = [
{ id:"sa-m2-001", mod:"M2", topic:"Surface area to volume", marks:5,
  q:"Explain why multicellular organisms require specialised exchange surfaces, using the surface-area-to-volume ratio in your answer.",
  criteria:[
    "States that surface area increases with the square of length while volume increases with the cube",
    "Concludes that SA:V therefore decreases as an organism gets larger",
    "Explains that the demand for oxygen and nutrients is proportional to volume, while supply by diffusion depends on surface area",
    "States that diffusion distance to the centre also becomes too great for diffusion alone to be fast enough",
    "Identifies a specialised exchange surface as the solution, giving an example such as alveoli, gills or villi"
  ],
  keys:[["square","cube","length"],["decreases","falls","smaller"],["volume","demand","supply"],["diffusion distance","distance","too far","slow"],["alveoli","gill","villi","exchange surface"]],
  sample:"As an organism increases in size, its surface area increases with the square of its linear dimensions but its volume increases with the cube, so the surface-area-to-volume ratio falls. Metabolic demand for oxygen and nutrients, and production of waste, are proportional to volume, while the rate of supply by diffusion across the body surface depends on surface area. In a large organism the available surface is therefore too small to meet demand. In addition, the diffusion distance from the surface to the innermost cells becomes so great that diffusion alone would take far too long. Multicellular organisms solve this with specialised exchange surfaces such as alveoli, gills or intestinal villi, which are highly folded to provide a very large surface area with a very short diffusion distance, usually served by a transport system that maintains the concentration gradient.",
  common:["States that SA:V falls but never links it to demand versus supply",
          "Forgets the diffusion-distance half of the argument"] },

{ id:"sa-m2-002", mod:"M2", topic:"Gas exchange", marks:4,
  q:"Explain how the structure of an alveolus maximises the rate of gas exchange.",
  criteria:[
    "Identifies the very large total surface area provided by millions of alveoli",
    "Identifies the wall being one cell thick, giving a very short diffusion distance",
    "States that the surface is moist so gases dissolve before diffusing",
    "Explains that a dense capillary network and continuous ventilation maintain the concentration gradient"
  ],
  keys:[["surface area"],["one cell","thin","diffusion distance"],["moist","dissolve"],["capillary","gradient","ventilation","blood flow"]],
  sample:"Millions of alveoli provide an enormous total surface area, around 70 m² in an adult, so a large amount of gas can diffuse at once. Each alveolar wall is a single layer of flattened epithelium and lies against a capillary endothelium that is also one cell thick, giving a diffusion distance of well under a micrometre. The alveolar surface is moist, so oxygen dissolves before diffusing across. Finally, the dense capillary network continually removes oxygenated blood and delivers deoxygenated blood, while ventilation replaces the alveolar air, so a steep concentration gradient for both oxygen and carbon dioxide is maintained.",
  common:["Lists features without linking each to Fick's principle",
          "Says alveoli are 'thin' without stating the consequence for diffusion distance"] },

{ id:"sa-m2-003", mod:"M2", topic:"Transport in plants", marks:5,
  q:"Explain how water moves from the soil to the leaves of a tall tree.",
  criteria:[
    "States that water enters root hair cells by osmosis, down a water potential gradient",
    "Describes movement across the root to the xylem via apoplast and symplast pathways",
    "States that transpiration from the leaf lowers water potential and creates tension in the xylem",
    "Explains cohesion between water molecules by hydrogen bonding, maintaining an unbroken column",
    "Identifies adhesion of water to the xylem walls as further support for the column"
  ],
  keys:[["root hair","osmosis"],["apoplast","symplast","across the root","cortex"],["transpiration","tension","evaporation"],["cohesion","hydrogen bond"],["adhesion"]],
  sample:"Soil water has a higher water potential than the cytoplasm of a root hair cell, so water enters by osmosis across a very large surface area. It then crosses the root cortex through the cell walls (apoplast pathway) and through the cytoplasm and plasmodesmata (symplast pathway) to reach the xylem. In the leaf, water evaporates from the mesophyll cell walls into the air spaces and diffuses out through the stomata as transpiration. This lowers the water potential in the leaf and creates tension in the xylem column. Because water molecules are hydrogen bonded to one another they show cohesion, so the tension pulls the whole column upward without it breaking, and adhesion of water to the lignified xylem walls provides further support. This is the cohesion-tension theory.",
  common:["Says water is 'pushed up' by root pressure — the column is pulled from the top",
          "Confuses cohesion (water to water) with adhesion (water to the vessel wall)"] },

{ id:"sa-m2-004", mod:"M2", topic:"Transport in animals", marks:4,
  q:"Explain how the structure of arteries, veins and capillaries relates to their functions.",
  criteria:[
    "Relates the artery's thick elastic and muscular wall to withstanding and smoothing high pressure",
    "Relates the capillary's one-cell-thick wall and large total surface area to exchange",
    "Relates the vein's wide lumen and thin wall to low-pressure return flow",
    "Identifies valves in veins as preventing backflow"
  ],
  keys:[["artery","elastic","muscular","pressure"],["capillary","one cell","exchange"],["vein","lumen","thin"],["valve","backflow"]],
  sample:"Arteries carry blood away from the heart at high pressure, so they have thick walls containing elastic tissue that stretches during systole and recoils during diastole to smooth the flow, and smooth muscle that allows vasoconstriction and vasodilation. Capillaries are the exchange vessels: their walls are a single layer of endothelium, giving the shortest possible diffusion distance, and the branching capillary bed provides an enormous total surface area with very slow flow, allowing time for exchange. Veins return blood at low pressure, so they have thin walls and a wide lumen to reduce resistance, and semilunar valves at intervals that prevent backflow as surrounding skeletal muscle squeezes the blood along.",
  common:["Says arteries carry oxygenated blood as their defining feature — the pulmonary artery does not",
          "Describes structure without stating the functional consequence"] },

{ id:"sa-m2-005", mod:"M2", topic:"Digestion", marks:4,
  q:"Explain the role of bile and lipase in the digestion of fats.",
  criteria:[
    "States that bile is produced by the liver and stored in the gall bladder, and is released into the duodenum",
    "Explains that bile salts emulsify large lipid droplets into many small droplets",
    "Explains that emulsification increases the surface area available to lipase",
    "States that lipase chemically hydrolyses triglycerides to fatty acids and glycerol"
  ],
  keys:[["liver","gall bladder","duodenum"],["emulsif","droplets"],["surface area"],["lipase","hydrolys","fatty acid","glycerol"]],
  sample:"Bile is produced in the liver, stored in the gall bladder and released into the duodenum. Bile salts are amphipathic and break large fat globules into a fine emulsion of many small droplets. This is a physical change, not a chemical one, but it greatly increases the total surface area of lipid exposed to the aqueous contents of the gut. Pancreatic lipase then acts on that surface, catalysing the hydrolysis of triglycerides into fatty acids and glycerol, which can be absorbed. Because lipase can only work at the lipid-water interface, the rate of fat digestion depends strongly on how well the fat has been emulsified.",
  common:["Says bile digests or breaks down fat chemically — it emulsifies",
          "Names both substances but never states why emulsification helps"] },

{ id:"sa-m2-006", mod:"M2", topic:"Transport in plants", marks:4,
  q:"Describe how guard cells control the opening and closing of stomata, and explain why this matters to the plant.",
  criteria:[
    "States that potassium ions are actively pumped into guard cells, lowering water potential",
    "Explains that water then enters by osmosis and the guard cells become turgid",
    "Explains that unevenly thickened inner walls make the turgid cells bow apart, opening the pore",
    "Identifies the trade-off: open stomata allow CO₂ in for photosynthesis but also allow water loss"
  ],
  keys:[["potassium","ions","active"],["osmosis","turgid","water enters"],["thick","bow","curve","inner wall"],["trade-off","carbon dioxide","water loss","compromise"]],
  sample:"When stomata open, potassium ions are actively transported into the guard cells. This lowers the water potential inside them, so water follows by osmosis and the guard cells become turgid. Because the inner wall of each guard cell is thicker and less elastic than the outer wall, the turgid cells bow away from one another and the pore between them opens. When potassium leaves and water follows, the guard cells become flaccid and the pore closes. This control matters because the plant faces a trade-off: open stomata allow carbon dioxide to diffuse in for photosynthesis, but they simultaneously allow water vapour to escape by transpiration. Plants therefore close stomata in drought conditions even though it limits photosynthesis.",
  common:["Says guard cells 'decide' to open — describe the mechanism, not intent",
          "Omits the uneven wall thickening, which is the actual reason the pore opens"] }
];

BIO.DATA.short_m3 = [
{ id:"sa-m3-001", mod:"M3", topic:"Natural selection", marks:5,
  q:"Explain how antibiotic resistance arises and spreads in a population of bacteria.",
  criteria:[
    "States that random mutation produces variation in a bacterial population before the antibiotic is applied",
    "States that a few individuals happen to carry an allele conferring resistance",
    "Explains that the antibiotic acts as a selection pressure, killing susceptible individuals",
    "Explains that resistant individuals survive and reproduce, so the allele frequency increases in the population",
    "Notes that resistance genes can also spread horizontally between bacteria on plasmids by conjugation"
  ],
  keys:[["mutation","random","variation"],["few","some individuals","pre-existing"],["selection pressure","kill","selects"],["survive","reproduce","allele frequency"],["plasmid","horizontal","conjugation","transfer"]],
  sample:"Random mutation during DNA replication generates variation in a bacterial population, and by chance a small number of individuals carry an allele that confers resistance — for example an enzyme that breaks down the antibiotic or an altered target protein. This variation exists before the antibiotic is used; the antibiotic does not create it. When the antibiotic is applied it acts as a selection pressure, killing the susceptible bacteria. The resistant individuals survive and reproduce rapidly by binary fission, so the frequency of the resistance allele in the population increases over successive generations. Resistance can also spread horizontally: resistance genes are often carried on plasmids that pass between bacteria, and even between species, by conjugation, which is why resistance can spread far faster than inheritance alone would predict.",
  common:["Says the bacteria 'became resistant' or 'adapted' in response to the antibiotic — the mutation came first",
          "Says the antibiotic caused the mutation"] },

{ id:"sa-m3-002", mod:"M3", topic:"Evidence for evolution", marks:5,
  q:"Assess the strength of evidence for evolution provided by comparative anatomy and by biochemistry.",
  criteria:[
    "Describes homologous structures such as the pentadactyl limb as evidence of divergent evolution from a common ancestor",
    "Notes a limitation: convergent evolution can produce similar structures in unrelated organisms, so anatomy alone can mislead",
    "Describes biochemical evidence such as DNA or protein sequence comparison, and the molecular clock",
    "Explains that biochemistry gives a quantitative measure of divergence time that anatomy cannot",
    "Makes a judgement: the two lines are strongest when they agree, and their independent agreement is what makes the case compelling"
  ],
  keys:[["homologous","pentadactyl","divergent"],["convergent","analogous","limitation","mislead"],["dna","protein","sequence","molecular clock","cytochrome"],["quantitative","how recently","measure"],["agree","corroborat","judgement","strongest"]],
  sample:"Comparative anatomy provides evidence through homologous structures such as the pentadactyl limb, which has the same underlying bone arrangement in humans, whales and bats despite very different functions. This pattern is expected if the species diverged from a common ancestor and is difficult to explain otherwise. Its limitation is that convergent evolution can produce anatomically similar solutions in unrelated organisms, as with cacti and euphorbias, so surface similarity can mislead. Biochemical evidence compares DNA or protein sequences directly. Cytochrome c differs from the human sequence by one amino acid in a rhesus monkey, thirteen in a chicken and forty-four in yeast. Because differences accumulate roughly with time, this provides a quantitative estimate of how recently two lineages diverged, which anatomy cannot supply, and it is far less easily confounded by convergence. Overall, biochemical evidence is the stronger single line, but the most compelling argument is that two independent methods produce the same branching pattern — agreement between independent data sets is far harder to explain by coincidence than either result alone.",
  common:["Lists evidence without making the judgement an 'assess' question requires",
          "Gives no limitation of either method"] },

{ id:"sa-m3-003", mod:"M3", topic:"Speciation", marks:5,
  q:"Explain how a new species can arise through allopatric speciation.",
  criteria:[
    "States that a geographic barrier divides a population into two",
    "Explains that gene flow between the two populations stops",
    "Explains that different selection pressures and/or genetic drift and mutation cause the gene pools to diverge",
    "States that over many generations the accumulated genetic differences become large",
    "States that the populations are separate species when they can no longer interbreed to produce fertile offspring, even if reunited"
  ],
  keys:[["geographic","barrier","isolat"],["gene flow"],["selection pressure","drift","mutation","diverge"],["generations","accumulate"],["interbreed","fertile offspring","reproductive isolation"]],
  sample:"Allopatric speciation begins when a geographic barrier such as a river, mountain range or rising sea level divides a population into two isolated groups. Gene flow between them stops, so any genetic change in one population cannot spread to the other. The two environments will differ, so different selection pressures act on each population, and mutation and genetic drift add further independent change — drift being particularly strong if one population is small. Over many generations these differences accumulate in the two gene pools, affecting anatomy, physiology and behaviour. Eventually the populations become so genetically different that, even if the barrier is removed and they meet again, they can no longer interbreed to produce fertile offspring. At that point reproductive isolation is complete and they are separate species.",
  common:["Stops at 'they became different' without defining speciation by reproductive isolation",
          "Says individuals evolve — populations evolve"] },

{ id:"sa-m3-004", mod:"M3", topic:"Adaptation", marks:4,
  q:"Using a named Australian organism, describe one structural, one physiological and one behavioural adaptation, and explain how each aids survival.",
  criteria:[
    "Names a specific Australian organism",
    "Identifies a structural adaptation and explains its survival advantage",
    "Identifies a physiological adaptation and explains its survival advantage",
    "Identifies a behavioural adaptation and explains its survival advantage"
  ],
  keys:[["kangaroo","koala","spinifex","thorny devil","echidna","emu","eucalypt","bilby"],["structural"],["physiological"],["behavioural","behavior"]],
  sample:"The red kangaroo is adapted to hot, arid inland Australia. A structural adaptation is its large, thin-skinned forearms carrying a dense network of superficial blood vessels; this provides a large surface area from which heat can be lost. A physiological adaptation is its ability to produce highly concentrated urine using long loops of Henle in the kidney, conserving water in an environment where drinking water is scarce and unreliable. A behavioural adaptation is resting in shade during the hottest part of the day and feeding at dawn and dusk, which reduces heat gain from the sun and reduces water lost through evaporation.",
  common:["Classifies an adaptation into the wrong category — sort by whether it is a body feature, an internal process, or an action",
          "Names the adaptation without explaining the survival advantage"] }
];

BIO.DATA.short_m4 = [
{ id:"sa-m4-001", mod:"M4", topic:"Sampling", marks:5,
  q:"Design an investigation to compare the abundance of a plant species in two areas of grassland. Include how you would ensure reliability and validity.",
  criteria:[
    "Identifies quadrats of a stated size as the sampling method, appropriate for non-motile organisms",
    "Describes random placement using randomly generated coordinates to avoid bias",
    "States a sufficient number of quadrats in each area and that the same number and size are used in both",
    "Identifies variables to control, such as time of day, season and the person counting",
    "Explains how the data would be treated: mean per quadrat, scaled to area, and compared between sites"
  ],
  keys:[["quadrat"],["random","coordinates","bias"],["number of quadrats","repeat","same size"],["control","variable","same time","same observer"],["mean","average","scale","area","compare"]],
  sample:"I would use 1 m² quadrats, which suit non-motile plants. In each grassland I would lay out two perpendicular tape measures as axes and use a random number generator to produce coordinate pairs, placing a quadrat at each one; random placement avoids the bias that comes from choosing where a quadrat looks interesting. I would take at least twenty quadrats in each area, using the same quadrat size and the same number in both so the comparison is fair. Controlled variables would include sampling both sites on the same day and at a similar time, using the same observer and the same counting rule for plants on the quadrat boundary. For each site I would calculate the mean number of plants per quadrat, multiply by the site area to estimate total abundance, and compare the two means, including a measure of spread so that a difference can be judged against the variation within each site. Reliability comes from the large number of quadrats and from repeating the survey; validity comes from measuring abundance directly with a method suited to the organism and controlling the other variables.",
  common:["Describes the method but never addresses reliability or validity, which the question asks for explicitly",
          "Uses different numbers of quadrats in the two areas"] },

{ id:"sa-m4-002", mod:"M4", topic:"Energy flow", marks:4,
  q:"Explain why food chains rarely contain more than four or five trophic levels.",
  criteria:[
    "States that only about 10% of energy is transferred between trophic levels",
    "Explains the losses: heat from respiration, undigested material in faeces, and excretion",
    "Explains that the energy available becomes too small to support a further level",
    "Concludes that this limits chain length and explains why top predators are rare and require large ranges"
  ],
  keys:[["10","ten percent","transfer"],["heat","respiration","faeces","excretion","egestion"],["too little","insufficient","not enough energy"],["limits","rare","top predator","chain length"]],
  sample:"Only about ten percent of the energy in one trophic level is incorporated into the biomass of the next. The remainder is lost: most is released as heat during respiration, some passes out undigested in faeces, and some is lost in nitrogenous excretion. Because the loss is repeated at every transfer, the energy available falls by roughly an order of magnitude at each step. After four or five levels the energy remaining is too small to support a viable population at a further level. This is also why top predators are comparatively rare, why they need large territories, and why a pyramid of energy is always upright.",
  common:["States the 10% rule without saying where the other 90% goes",
          "Says energy is 'lost' without naming heat, faeces and excretion"] },

{ id:"sa-m4-003", mod:"M4", topic:"Human impact", marks:5,
  q:"Explain how the introduction of an exotic species can affect the biodiversity of an Australian ecosystem, using a named example.",
  criteria:[
    "Names a specific introduced species in Australia",
    "Describes the mechanism of impact — predation, competition, habitat alteration or disease",
    "Explains why native species are particularly vulnerable: no shared evolutionary history and therefore no defences or resistance",
    "Describes the consequence for biodiversity, such as population decline, local extinction or altered community structure",
    "Identifies a management response and a limitation of it"
  ],
  keys:[["cane toad","fox","rabbit","cat","carp","lantana","buffel"],["predation","competition","habitat","disease"],["no evolutionary history","no defence","naive","not adapted"],["decline","extinct","biodiversity","community"],["control","management","baiting","fencing","limitation"]],
  sample:"The cane toad was introduced to Queensland in 1935 to control cane beetles and has since spread across northern Australia. Its impact is chiefly through poisoning predators: cane toads carry bufotoxin in parotoid glands, and native predators such as the northern quoll, goannas and freshwater crocodiles attempt to eat them. Australian predators have no evolutionary history with this toxin and therefore no resistance and no learned avoidance, so a single attempted meal is often fatal. Northern quoll populations have collapsed across large parts of their former range, which reduces species diversity and removes a predator from the community, with flow-on effects on the species it controlled. Management responses include trapping, targeted exclusion fencing at waterholes, and conditioned taste aversion training in which quolls are fed a small toad laced with a nausea-inducing chemical so they learn to avoid them. The limitation is scale: the invasion front spans thousands of kilometres, so none of these methods can be applied broadly enough to stop the spread, and they buy time for particular populations rather than solving the problem.",
  common:["Names the species but never explains why native species are especially vulnerable",
          "Omits the management response, which 'explain the effect and how it is managed' questions usually want"] }
];
