/* Process Order sequences.
   Read the addendum's C1/C2 before playing with the scoring: this is a mode
   where you can keep trying until it works, so there is no per-item score
   floor and restarting does not reset the cost counter. */
window.BIO = window.BIO || {}; BIO.DATA = BIO.DATA || {};

BIO.DATA.seq_core = [
{ id:"sq-001", mod:"M5", topic:"Polypeptide synthesis", title:"Protein synthesis", diff:2,
  steps:[
    "RNA polymerase binds the promoter and unwinds the DNA",
    "A complementary mRNA strand is built from the template strand",
    "Introns are spliced out and a cap and tail are added",
    "mRNA leaves the nucleus through a nuclear pore",
    "mRNA binds to a ribosome and the start codon AUG is located",
    "tRNA anticodons pair with mRNA codons, delivering amino acids",
    "Peptide bonds join adjacent amino acids as the ribosome moves along",
    "A stop codon is reached and the polypeptide is released"
  ],
  why:"Transcription and processing happen in the nucleus; translation happens at a ribosome in the cytoplasm. The nuclear pore is the boundary between the two halves." },

{ id:"sq-002", mod:"M7", topic:"Immunity", title:"The immune response to a new pathogen", diff:2,
  steps:[
    "A pathogen breaches the first line of defence and enters the tissue",
    "Inflammation increases blood flow, bringing phagocytes to the site",
    "A macrophage engulfs the pathogen and digests it",
    "The macrophage displays the pathogen's antigen on its surface",
    "A helper T cell with a matching receptor is activated",
    "The helper T cell activates the matching B lymphocyte",
    "The B cell divides into plasma cells and memory cells",
    "Plasma cells secrete antibodies specific to that antigen",
    "Memory cells persist, ready for a faster secondary response"
  ],
  why:"Antigen presentation is the hinge between the non-specific second line and the specific third line. Memory cells are the last step and the reason immunity lasts." },

{ id:"sq-003", mod:"M8", topic:"Nervous system", title:"A reflex arc", diff:1, tags:["disorders"],
  steps:[
    "A receptor in the skin detects the stimulus",
    "A sensory neuron carries the impulse to the spinal cord",
    "An interneuron relays the impulse within the spinal cord",
    "A motor neuron carries the impulse away from the spinal cord",
    "The effector muscle contracts and the limb is withdrawn"
  ],
  why:"The response happens before the brain is involved, which is why a reflex is so fast. The brain is informed afterwards — that is why you feel the pain after you have moved." },

{ id:"sq-004", mod:"M8", topic:"Homeostasis", title:"Blood glucose rising after a meal", diff:2, tags:["homeostasis"],
  steps:[
    "Carbohydrate is digested and glucose is absorbed into the blood",
    "Blood glucose concentration rises above the set point",
    "Beta cells in the pancreatic islets detect the rise",
    "Beta cells secrete insulin into the blood",
    "Muscle and fat cells increase glucose uptake via GLUT4 transporters",
    "The liver converts glucose to glycogen for storage",
    "Blood glucose falls back towards the set point and insulin secretion decreases"
  ],
  why:"The last step is what makes it negative feedback: the response removes the stimulus that caused it." },

{ id:"sq-005", mod:"M6", topic:"Biotechnology", title:"Producing a transgenic bacterium", diff:2, tags:["biotech"],
  steps:[
    "The gene of interest is isolated, often as cDNA made with reverse transcriptase",
    "The gene and a plasmid are cut with the SAME restriction enzyme",
    "Complementary sticky ends on the gene and plasmid base-pair together",
    "DNA ligase seals the backbones, forming a recombinant plasmid",
    "Bacteria are treated so they take up the plasmid — transformation",
    "Bacteria are grown on medium containing the marker antibiotic",
    "Only transformed bacteria survive and are cultured at scale"
  ],
  why:"Selection comes after transformation and never before — you cannot select for something the cells have not yet taken up." },

{ id:"sq-006", mod:"M1", topic:"Photosynthesis", title:"Photosynthesis", diff:2,
  steps:[
    "Light is absorbed by chlorophyll in the thylakoid membranes",
    "Water is split by photolysis, releasing electrons, protons and oxygen",
    "Electrons pass along the electron transport chain, generating ATP",
    "NADP is reduced to NADPH",
    "ATP and NADPH pass into the stroma",
    "CO₂ is fixed by RuBisCO in the Calvin cycle",
    "ATP and NADPH are used to reduce the fixed carbon to carbohydrate"
  ],
  why:"ATP and NADPH are the link between the two stages. The Calvin cycle stops in darkness because that supply stops, not because it needs light directly." },

{ id:"sq-007", mod:"M8", topic:"Kidney", title:"Producing concentrated urine when dehydrated", diff:3, tags:["homeostasis"],
  steps:[
    "Water loss raises the solute concentration of the blood",
    "Osmoreceptors in the hypothalamus detect the increase",
    "The posterior pituitary releases ADH into the blood",
    "ADH binds receptors on collecting duct cells",
    "Aquaporins are inserted into the collecting duct membrane",
    "Water moves out of the collecting duct by osmosis into the concentrated medulla",
    "A small volume of concentrated urine is produced and blood concentration falls"
  ],
  why:"ADH changes permeability; osmosis does the moving. The medullary gradient set up by the loop of Henle is what makes the osmosis possible." },

{ id:"sq-008", mod:"M5", topic:"Cell replication", title:"Mitosis", diff:1,
  steps:[
    "Interphase: DNA is replicated and the cell grows",
    "Prophase: chromosomes condense and the nuclear envelope breaks down",
    "Metaphase: chromosomes line up individually along the equator",
    "Anaphase: sister chromatids are pulled to opposite poles",
    "Telophase: nuclear envelopes reform around the two sets",
    "Cytokinesis: the cytoplasm divides, producing two identical cells"
  ],
  why:"In mitosis, individual chromosomes line up at the equator. In meiosis I it is homologous PAIRS — that single difference produces the whole difference in outcome." },

{ id:"sq-009", mod:"M2", topic:"Transport in plants", title:"Water from soil to leaf", diff:2,
  steps:[
    "Water enters root hair cells by osmosis down a water potential gradient",
    "Water crosses the root cortex by the apoplast and symplast pathways",
    "Water enters the xylem vessels",
    "Water evaporates from mesophyll cell walls into the leaf air spaces",
    "Water vapour diffuses out through open stomata",
    "The resulting tension pulls the cohesive water column up the xylem"
  ],
  why:"The column is pulled from the top, not pushed from the bottom. That is why xylem sap is under negative pressure." },

{ id:"sq-010", mod:"M7", topic:"Prevention", title:"Responding to a disease outbreak", diff:2,
  steps:[
    "Unusual cases are detected through surveillance and reported",
    "The pathogen is identified in the laboratory",
    "The mode of transmission is established",
    "Cases are isolated and contacts are traced and quarantined",
    "Control measures targeting the transmission route are implemented",
    "Vaccination or treatment is deployed if available",
    "Case numbers are monitored to evaluate whether the measures worked"
  ],
  why:"Establishing the transmission route comes before choosing controls — the control has to match the route." },

{ id:"sq-011", mod:"M4", topic:"Human impact", title:"Eutrophication of a waterway", diff:2,
  steps:[
    "Fertiliser runs off farmland into the waterway",
    "Nitrate and phosphate concentrations rise sharply",
    "Algae multiply rapidly, forming a surface bloom",
    "The bloom blocks light from reaching submerged plants, which die",
    "Bacteria decompose the dead algae and plants",
    "Aerobic decomposition depletes dissolved oxygen",
    "Fish and invertebrates suffocate and die"
  ],
  why:"The algae are not what kills the fish. The decomposers that follow them are, by consuming the oxygen." },

{ id:"sq-012", mod:"M5", topic:"Cell replication", title:"Meiosis", diff:3,
  steps:[
    "Interphase: DNA is replicated",
    "Prophase I: homologous chromosomes pair and crossing over occurs at chiasmata",
    "Metaphase I: homologous PAIRS align at the equator, each pair independently",
    "Anaphase I: homologues are separated to opposite poles",
    "Telophase I: two haploid cells form, each with chromosomes of two chromatids",
    "Metaphase II: chromosomes align individually in each cell",
    "Anaphase II: sister chromatids are separated",
    "Four genetically different haploid cells are produced"
  ],
  why:"Crossing over in prophase I and independent assortment in metaphase I are the two variation-generating steps. Meiosis II is essentially mitosis on haploid cells." }
];
