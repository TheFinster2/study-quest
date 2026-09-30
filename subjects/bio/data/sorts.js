/* Sort It — classify against the clock. */
window.BIO = window.BIO || {}; BIO.DATA = BIO.DATA || {};

BIO.DATA.sort_core = [
{ id:"so-001", mod:"M4", topic:"Ecosystem interactions", title:"Biotic or abiotic?", diff:1,
  bins:["Biotic","Abiotic"],
  items:[
    ["Number of kangaroos","Biotic"], ["Soil pH","Abiotic"], ["Rainfall","Abiotic"],
    ["Fallen leaf litter","Biotic"], ["Water temperature","Abiotic"], ["Algae on a rock","Biotic"],
    ["Wind speed","Abiotic"], ["Dissolved oxygen","Abiotic"], ["A fungal pathogen","Biotic"],
    ["Light intensity","Abiotic"], ["Predation pressure","Biotic"], ["Salinity","Abiotic"],
    ["Decomposing wood","Biotic"], ["Slope aspect","Abiotic"], ["Competition for nesting hollows","Biotic"]
  ],
  why:"Biotic means living or once-living — dead leaves and rotting wood are still biotic. Abiotic is the physical and chemical environment." },

{ id:"so-002", mod:"M5", topic:"Cell replication", title:"Mitosis or meiosis?", diff:2,
  bins:["Mitosis","Meiosis"],
  items:[
    ["Produces two daughter cells","Mitosis"], ["Produces four daughter cells","Meiosis"],
    ["Daughter cells are genetically identical","Mitosis"], ["Daughter cells are genetically different","Meiosis"],
    ["Daughter cells are diploid","Mitosis"], ["Daughter cells are haploid","Meiosis"],
    ["Crossing over occurs","Meiosis"], ["One nuclear division","Mitosis"],
    ["Two nuclear divisions","Meiosis"], ["Used for growth and repair","Mitosis"],
    ["Produces gametes","Meiosis"], ["Homologous pairs line up at the equator","Meiosis"],
    ["Individual chromosomes line up at the equator","Mitosis"], ["Basis of asexual reproduction","Mitosis"]
  ],
  why:"Product counts are the most confused facts here: mitosis 2 diploid identical, meiosis 4 haploid different." },

{ id:"so-003", mod:"M7", topic:"Pathogens", title:"Which pathogen type?", diff:2,
  bins:["Bacterium","Virus","Fungus","Protozoan"],
  items:[
    ["Tuberculosis","Bacterium"], ["Influenza","Virus"], ["Tinea (ringworm)","Fungus"],
    ["Malaria","Protozoan"], ["Cholera","Bacterium"], ["HIV","Virus"],
    ["Thrush (candidiasis)","Fungus"], ["Amoebic dysentery","Protozoan"],
    ["Tetanus","Bacterium"], ["Measles","Virus"], ["Golden staph","Bacterium"],
    ["COVID-19","Virus"], ["Toxoplasmosis","Protozoan"], ["Athlete's foot","Fungus"]
  ],
  why:"Antibiotics work only on the bacterial column. That is the practical reason this classification matters." },

{ id:"so-004", mod:"M7", topic:"Defence", title:"Which line of defence?", diff:2,
  bins:["First line","Second line","Third line"],
  items:[
    ["Intact skin","First line"], ["Stomach acid","First line"], ["Cilia in the airways","First line"],
    ["Phagocytosis by macrophages","Second line"], ["Inflammation","Second line"], ["Fever","Second line"],
    ["Antibody production by plasma cells","Third line"], ["Memory B cells","Third line"],
    ["Cytotoxic T cells","Third line"], ["Lysozyme in tears","First line"],
    ["Mucous membranes","First line"], ["Complement proteins","Second line"],
    ["Helper T cell activation","Third line"], ["Natural killer cells","Second line"]
  ],
  why:"First = keeping them out. Second = general internal response. Third = specific, and the only one with memory." },

{ id:"so-005", mod:"M8", topic:"Non-infectious causes", title:"Cause of disease", diff:2,
  bins:["Genetic","Nutritional","Environmental"],
  items:[
    ["Cystic fibrosis","Genetic"], ["Scurvy","Nutritional"], ["Mesothelioma from asbestos","Environmental"],
    ["Huntington's disease","Genetic"], ["Iodine deficiency goitre","Nutritional"],
    ["Skin cancer from UV exposure","Environmental"], ["Down syndrome","Genetic"],
    ["Rickets","Nutritional"], ["Lead poisoning","Environmental"],
    ["Haemophilia","Genetic"], ["Iron-deficiency anaemia","Nutritional"], ["Noise-induced hearing loss","Environmental"]
  ],
  why:"Many real diseases are multifactorial — this sort trains the categories, but type 2 diabetes would sit across all three." },

{ id:"so-006", mod:"M1", topic:"Membrane transport", title:"Does it need ATP?", diff:2,
  bins:["Requires ATP","No ATP required"],
  items:[
    ["Simple diffusion","No ATP required"], ["Osmosis","No ATP required"],
    ["Facilitated diffusion","No ATP required"], ["Active transport","Requires ATP"],
    ["Sodium-potassium pump","Requires ATP"], ["Phagocytosis","Requires ATP"],
    ["Exocytosis","Requires ATP"], ["Oxygen entering a red blood cell","No ATP required"],
    ["Mineral ion uptake by root hair cells","Requires ATP"],
    ["Glucose reabsorption in the proximal tubule","Requires ATP"],
    ["Water entering through aquaporins","No ATP required"]
  ],
  why:"Anything moving against a gradient, and anything bulk, costs ATP. Down a gradient is free even when a protein helps." },

{ id:"so-007", mod:"M3", topic:"Adaptation", title:"Type of adaptation", diff:2,
  bins:["Structural","Physiological","Behavioural"],
  items:[
    ["Thick waxy cuticle on a leaf","Structural"], ["Producing concentrated urine","Physiological"],
    ["Burrowing during the heat of the day","Behavioural"], ["Large ears with surface blood vessels","Structural"],
    ["Kangaroo licking its forearms","Behavioural"], ["Venom production","Physiological"],
    ["Sunken stomata","Structural"], ["Nocturnal feeding","Behavioural"],
    ["Antifreeze proteins in blood","Physiological"], ["Camouflage colouring","Structural"],
    ["Migrating before winter","Behavioural"], ["Tolerating high blood urea","Physiological"]
  ],
  why:"Sort by what kind of thing it is: a body feature, an internal process, or an action." },

{ id:"so-008", mod:"M7", topic:"Immunity", title:"Type of immunity", diff:3,
  bins:["Natural active","Natural passive","Artificial active","Artificial passive"],
  items:[
    ["Recovering from chickenpox","Natural active"], ["Antibodies in breast milk","Natural passive"],
    ["Receiving a measles vaccine","Artificial active"], ["Antivenom after a snake bite","Artificial passive"],
    ["Antibodies crossing the placenta","Natural passive"], ["Tetanus immunoglobulin injection","Artificial passive"],
    ["Flu vaccination","Artificial active"], ["Immunity after a COVID-19 infection","Natural active"]
  ],
  why:"Active = you made the antibodies, lasts, has memory. Passive = someone else made them, immediate, temporary." },

{ id:"so-009", mod:"M2", topic:"Transport in plants", title:"Xylem or phloem?", diff:1,
  bins:["Xylem","Phloem"],
  items:[
    ["Carries water and mineral ions","Xylem"], ["Carries sucrose","Phloem"],
    ["Cells are dead at maturity","Xylem"], ["Cells are living","Phloem"],
    ["Has perforated sieve plates","Phloem"], ["Walls thickened with lignin","Xylem"],
    ["Transport is one-way, upwards","Xylem"], ["Transport can go either direction","Phloem"],
    ["Driven by transpiration tension","Xylem"], ["Driven by a pressure gradient from active loading","Phloem"],
    ["Associated with companion cells","Phloem"]
  ],
  why:"Xylem is a dead pipe pulled from above. Phloem is a living pipe pushed by pressure the plant creates with ATP." },

{ id:"so-010", mod:"M8", topic:"Homeostasis", title:"Too hot or too cold?", diff:1, tags:["homeostasis"],
  bins:["Response to heat","Response to cold"],
  items:[
    ["Vasodilation of skin arterioles","Response to heat"], ["Shivering","Response to cold"],
    ["Increased sweating","Response to heat"], ["Vasoconstriction of skin arterioles","Response to cold"],
    ["Piloerection (hairs standing up)","Response to cold"], ["Reduced metabolic rate","Response to heat"],
    ["Increased thyroxine secretion","Response to cold"], ["Seeking shade","Response to heat"],
    ["Curling up to reduce exposed surface area","Response to cold"], ["Panting","Response to heat"]
  ],
  why:"Ask whether the response gains or loses heat, then match it to the direction of the change." },

{ id:"so-011", mod:"M6", topic:"Mutation", title:"Gene or chromosomal mutation?", diff:2, tags:["mutation"],
  bins:["Gene mutation","Chromosomal mutation"],
  items:[
    ["Silent substitution","Gene mutation"], ["Trisomy 21","Chromosomal mutation"],
    ["Frameshift from a single-base deletion","Gene mutation"], ["Inversion of a chromosome segment","Chromosomal mutation"],
    ["Nonsense mutation creating a stop codon","Gene mutation"], ["Translocation between chromosomes","Chromosomal mutation"],
    ["Missense mutation in beta-globin","Gene mutation"], ["Duplication of a chromosome region","Chromosomal mutation"],
    ["Polyploidy","Chromosomal mutation"], ["Insertion of three bases","Gene mutation"]
  ],
  why:"Gene mutations change bases. Chromosomal mutations change whole segments or whole chromosomes." },

{ id:"so-012", mod:"M4", topic:"Ecosystem interactions", title:"Type of relationship", diff:2,
  bins:["Mutualism","Commensalism","Parasitism","Competition"],
  items:[
    ["Mycorrhizal fungi and plant roots","Mutualism"], ["Tapeworm in a human intestine","Parasitism"],
    ["Barnacle attached to a whale","Commensalism"], ["Two eucalypt seedlings reaching for light","Competition"],
    ["Lichen (fungus and alga)","Mutualism"], ["Epiphytic orchid on a rainforest tree","Commensalism"],
    ["Tick on a wombat","Parasitism"], ["Foxes and quolls hunting the same prey","Competition"],
    ["Gut bacteria and their human host","Mutualism"], ["Mistletoe on a eucalypt","Parasitism"]
  ],
  why:"Write the signs: +/+ mutualism, +/0 commensalism, +/− parasitism, −/− competition." },

{ id:"so-013", mod:"M1", topic:"Cell structure", title:"Prokaryote, eukaryote, or both?", diff:2,
  bins:["Prokaryote only","Eukaryote only","Both"],
  items:[
    ["Membrane-bound nucleus","Eukaryote only"], ["Ribosomes","Both"],
    ["Circular chromosome","Prokaryote only"], ["Mitochondria","Eukaryote only"],
    ["Cell membrane","Both"], ["Peptidoglycan cell wall","Prokaryote only"],
    ["DNA as genetic material","Both"], ["Golgi apparatus","Eukaryote only"],
    ["70S ribosomes in the cytosol","Prokaryote only"], ["Linear chromosomes","Eukaryote only"],
    ["Cytoplasm","Both"], ["Plasmids","Prokaryote only"]
  ],
  why:"Prokaryotes have plenty of DNA and plenty of ribosomes — what they lack is membrane-bound compartments." },

{ id:"so-014", mod:"M8", topic:"Epidemiology", title:"Incidence or prevalence?", diff:2, tags:["epidemiology"],
  bins:["Incidence","Prevalence"],
  items:[
    ["1200 new diagnoses of melanoma in NSW last year","Incidence"],
    ["18 000 people currently living with type 1 diabetes","Prevalence"],
    ["Number of new COVID-19 cases reported today","Incidence"],
    ["Proportion of adults who currently have asthma","Prevalence"],
    ["Rate at which people develop a condition","Incidence"],
    ["Total existing cases at a point in time","Prevalence"],
    ["Best measure of the risk of developing a disease","Incidence"],
    ["Best measure of the burden on the health system","Prevalence"]
  ],
  why:"A long-lasting disease with low incidence can still have very high prevalence. Prevalence ≈ incidence × duration." }
];
