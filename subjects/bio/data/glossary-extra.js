/* Glossary, second pass.

   Same rules as the first file: one sentence, no hedging, and the definition
   must be usable on its own without the surrounding topic. Discovery merges
   this array into BIO.DATA.glossary at load, so the reference screen and
   Term Match pick it up with no other change.

   Priced at −25% XP with a latch, and withheld entirely from Term Match and
   Label It, where the glossary IS the answer key (§7.3). */

window.BIO = window.BIO || {}; BIO.DATA = BIO.DATA || {};

BIO.DATA.glossary = (BIO.DATA.glossary || []).concat([

// ── M1 ──────────────────────────────────────────────────────────────────
{ term:"Apoptosis", mod:"M1", def:"Programmed cell death in which a cell is dismantled and packaged for removal without triggering inflammation." },
{ term:"Chemosynthesis", mod:"M1", def:"Synthesis of organic molecules using energy released by oxidising inorganic compounds rather than energy from light." },
{ term:"Compensation point", mod:"M1", def:"The light intensity at which photosynthesis and respiration proceed at equal rates, so there is no net gas exchange." },
{ term:"Competitive inhibitor", mod:"M1", def:"A molecule resembling the substrate that binds the active site reversibly; its effect is overcome by raising substrate concentration." },
{ term:"Non-competitive inhibitor", mod:"M1", def:"A molecule that binds away from the active site and alters its shape, lowering the maximum rate at any substrate concentration." },
{ term:"Glycolysis", mod:"M1", def:"The anaerobic splitting of glucose into two pyruvate molecules in the cytosol, with a net yield of two ATP." },
{ term:"Krebs cycle", mod:"M1", def:"The cyclic series of reactions in the mitochondrial matrix that oxidises acetyl groups, releasing carbon dioxide and reduced carriers." },
{ term:"Electron transport chain", mod:"M1", def:"A series of membrane carriers that pass electrons from reduced coenzymes to oxygen, using the released energy to make ATP." },
{ term:"Respiratory quotient", mod:"M1", def:"The ratio of carbon dioxide produced to oxygen consumed, which indicates which substrate is being respired." },
{ term:"Resolution", mod:"M1", def:"The smallest distance between two points at which they can still be distinguished as separate, set by the wavelength used." },
{ term:"Peptidoglycan", mod:"M1", def:"The mesh of sugars and peptides forming a bacterial cell wall, and the target of penicillin-type antibiotics." },
{ term:"Aseptic technique", mod:"M1", def:"A set of procedures that prevents unwanted microorganisms entering a culture or escaping from it." },

// ── M2 ──────────────────────────────────────────────────────────────────
{ term:"Tissue fluid", mod:"M2", def:"The fluid forced out of capillaries at the arterial end that bathes cells and exchanges substances with them." },
{ term:"Lacteal", mod:"M2", def:"The blind-ended lymph vessel in the centre of a villus that absorbs the products of lipid digestion." },
{ term:"Emulsification", mod:"M2", def:"The physical breaking of large fat globules into small droplets by bile salts, increasing the surface area for lipase." },
{ term:"Peristalsis", mod:"M2", def:"Waves of circular and longitudinal muscle contraction that move material along the gut." },
{ term:"Apoplast pathway", mod:"M2", def:"The route by which water crosses a root through cell walls and intercellular spaces without entering the cytoplasm." },
{ term:"Symplast pathway", mod:"M2", def:"The route by which water crosses a root through the cytoplasm of connected cells via plasmodesmata." },
{ term:"Casparian strip", mod:"M2", def:"The waterproof band in the endodermis that forces water out of the apoplast and into the cytoplasm before it reaches the xylem." },
{ term:"Source and sink", mod:"M2", def:"In phloem transport, the region where assimilate is loaded and the region where it is unloaded and used or stored." },
{ term:"Alveolus", mod:"M2", def:"A thin-walled air sac in the lung, surrounded by capillaries, which provides the surface for gas exchange." },
{ term:"Surfactant", mod:"M2", def:"A lipid-protein mixture lining the alveoli that lowers surface tension and stops them collapsing on exhalation." },
{ term:"Cardiac output", mod:"M2", def:"The volume of blood pumped by one ventricle per minute, equal to heart rate multiplied by stroke volume." },

// ── M3 ──────────────────────────────────────────────────────────────────
{ term:"Analogous structures", mod:"M3", def:"Structures with a similar function but different underlying anatomy, arising from convergent evolution rather than shared ancestry." },
{ term:"Disruptive selection", mod:"M3", def:"Selection that favours both extremes of a trait over intermediate values, which can split one population into two." },
{ term:"Binomial nomenclature", mod:"M3", def:"The naming system that gives each species a unique two-part Latin name of genus and species." },
{ term:"Cladogram", mod:"M3", def:"A branching diagram in which each node represents the most recent common ancestor of the lineages that branch from it." },
{ term:"Dichotomous key", mod:"M3", def:"An identification tool of paired alternative statements, each leading either to another pair or to a name." },
{ term:"Competitive exclusion", mod:"M3", def:"The principle that two species cannot coexist indefinitely on exactly the same limiting resource." },
{ term:"Founder effect", mod:"M3", def:"The loss of genetic diversity that results when a new population is started by a small number of individuals." },
{ term:"Bottleneck effect", mod:"M3", def:"The loss of alleles that occurs when a population crashes to a small size, and which persists after numbers recover." },
{ term:"Transitional fossil", mod:"M3", def:"A fossil showing a combination of features characteristic of two different major groups, documenting evolutionary change." },
{ term:"Pre-zygotic barrier", mod:"M3", def:"A reproductive isolating mechanism that prevents a zygote forming, such as different breeding seasons or incompatible gametes." },
{ term:"Post-zygotic barrier", mod:"M3", def:"A reproductive isolating mechanism acting after fertilisation, such as hybrid inviability or hybrid sterility." },

// ── M4 ──────────────────────────────────────────────────────────────────
{ term:"Carrying capacity", mod:"M4", def:"The maximum population size an environment can support indefinitely with the resources available." },
{ term:"Density-dependent factor", mod:"M4", def:"A factor whose effect on each individual becomes stronger as population density increases, such as competition or disease." },
{ term:"Density-independent factor", mod:"M4", def:"A factor whose severity does not depend on population density, such as fire, flood or frost." },
{ term:"Primary succession", mod:"M4", def:"The colonisation of a surface that has never supported a community, beginning with pioneer species on bare rock or sand." },
{ term:"Secondary succession", mod:"M4", def:"Recolonisation of an area where a community has been removed but soil and seed remain, so it proceeds far faster." },
{ term:"Index fossil", mod:"M4", def:"A widespread, abundant and short-lived fossil species used to assign a rock layer to a narrow interval of time." },
{ term:"Law of superposition", mod:"M4", def:"The principle that in undisturbed sedimentary rock, each layer is younger than the layer beneath it." },
{ term:"Half-life", mod:"M4", def:"The time taken for half the atoms in a sample of a radioactive isotope to decay, which is constant for that isotope." },
{ term:"Biomagnification", mod:"M4", def:"The increase in concentration of a persistent toxin at each successive trophic level of a food chain." },
{ term:"Gross primary productivity", mod:"M4", def:"The total chemical energy fixed by producers in an area over a given time, before their own respiration is subtracted." },
{ term:"Edge effect", mod:"M4", def:"The altered conditions at the boundary of a habitat fragment, which reduce the area of true interior habitat." },
{ term:"Bioremediation", mod:"M4", def:"The use of living organisms to break down or accumulate a pollutant in the place where it occurs." },

// ── M5 ──────────────────────────────────────────────────────────────────
{ term:"Crossing over", mod:"M5", def:"The exchange of segments between non-sister chromatids of homologous chromosomes during prophase I of meiosis." },
{ term:"Linked genes", mod:"M5", def:"Genes located close together on the same chromosome, which are inherited together more often than independent assortment predicts." },
{ term:"Recombination frequency", mod:"M5", def:"The proportion of offspring showing a new combination of linked alleles, used as a measure of distance between two loci." },
{ term:"Polygenic inheritance", mod:"M5", def:"Control of one characteristic by many genes of small additive effect, producing continuous variation." },
{ term:"Multiple alleles", mod:"M5", def:"The existence of more than two alternative forms of a gene in a population, though any diploid individual carries only two." },
{ term:"Barr body", mod:"M5", def:"The condensed, inactivated X chromosome present in each cell of a female mammal." },
{ term:"Promoter", mod:"M5", def:"The DNA sequence upstream of a gene to which RNA polymerase binds to begin transcription." },
{ term:"Intron", mod:"M5", def:"A non-coding section of a eukaryotic gene that is transcribed and then removed from the pre-mRNA before translation." },
{ term:"Exon", mod:"M5", def:"A section of a gene that is retained in the mature mRNA and is translated into part of the polypeptide." },
{ term:"Transcription factor", mod:"M5", def:"A protein that binds a regulatory DNA sequence and increases or decreases the transcription of a particular gene." },
{ term:"Okazaki fragments", mod:"M5", def:"The short stretches of DNA synthesised discontinuously along the lagging strand, later joined by ligase." },

// ── M6 ──────────────────────────────────────────────────────────────────
{ term:"Mutagen", mod:"M6", def:"An agent that increases the rate of mutation above the spontaneous background, such as UV light or a chemical carcinogen." },
{ term:"Thymine dimer", mod:"M6", def:"A covalent link formed between adjacent thymine bases by ultraviolet light, which distorts the helix and stalls replication." },
{ term:"Somatic mutation", mod:"M6", def:"A mutation in a body cell, which is passed to that cell's descendants but not to the individual's offspring." },
{ term:"Germline mutation", mod:"M6", def:"A mutation in a cell that gives rise to gametes, which can therefore be inherited by offspring." },
{ term:"DNA methylation", mod:"M6", def:"The addition of methyl groups to DNA that silences a gene without altering its base sequence." },
{ term:"Gel electrophoresis", mod:"M6", def:"A technique that separates DNA fragments by size, using an electric field to pull the negatively charged fragments through a gel." },
{ term:"Marker gene", mod:"M6", def:"A gene carried on a vector whose product identifies which cells have taken up the recombinant DNA." },
{ term:"Transgenic organism", mod:"M6", def:"An organism containing a functioning gene transferred from a different species." },
{ term:"Guide RNA", mod:"M6", def:"A short RNA sequence that directs the Cas9 nuclease to a complementary target sequence in the genome." },
{ term:"Somatic cell nuclear transfer", mod:"M6", def:"Replacing the nucleus of an egg cell with the nucleus of a body cell to produce an organism genetically identical to the donor." },

// ── M7 ──────────────────────────────────────────────────────────────────
{ term:"Koch's postulates", mod:"M7", def:"Four criteria that together establish a particular microorganism as the cause of a particular disease." },
{ term:"Opsonisation", mod:"M7", def:"The coating of a pathogen by antibody or complement, which makes it easier for phagocytes to bind and engulf." },
{ term:"Interferon", mod:"M7", def:"A protein released by virus-infected cells that induces antiviral defences in neighbouring cells." },
{ term:"Clonal selection", mod:"M7", def:"The activation and repeated division of the few lymphocytes whose receptors happen to match an encountered antigen." },
{ term:"Passive immunity", mod:"M7", def:"Protection conferred by receiving ready-made antibodies, which acts immediately but produces no memory cells." },
{ term:"Active immunity", mod:"M7", def:"Protection produced by the body's own response to an antigen, which develops slowly but leaves lasting memory." },
{ term:"Antigenic drift", mod:"M7", def:"The gradual accumulation of mutations in a pathogen's surface proteins, so existing antibodies bind less effectively." },
{ term:"Antigenic shift", mod:"M7", def:"An abrupt change in a virus's surface proteins caused by reassortment of genetic material between strains." },
{ term:"Reservoir host", mod:"M7", def:"A population in which a pathogen is maintained long-term and from which it can spread to other species." },
{ term:"Zoonosis", mod:"M7", def:"An infectious disease that can be transmitted from other animals to humans." },
{ term:"Latent infection", mod:"M7", def:"An infection in which the pathogen persists without causing symptoms and can reactivate later." },
{ term:"Quarantine", mod:"M7", def:"The separation of people who may have been exposed to a disease but are not yet showing symptoms." },

// ── M8 ──────────────────────────────────────────────────────────────────
{ term:"ADH", mod:"M8", def:"Antidiuretic hormone, which increases the permeability of the collecting duct to water and so concentrates the urine." },
{ term:"Aldosterone", mod:"M8", def:"An adrenal hormone that increases sodium reabsorption in the kidney, so water follows and blood volume rises." },
{ term:"Selective reabsorption", mod:"M8", def:"The return of useful substances such as glucose and ions from the filtrate to the blood along the nephron." },
{ term:"Transport maximum", mod:"M8", def:"The highest rate at which a substance can be reabsorbed, set by the number of carrier proteins available." },
{ term:"Vasodilation", mod:"M8", def:"Widening of skin arterioles, which increases blood flow near the surface and so increases heat loss." },
{ term:"Vasoconstriction", mod:"M8", def:"Narrowing of skin arterioles, which reduces blood flow near the surface and so conserves heat." },
{ term:"Set point", mod:"M8", def:"The value of a variable that a homeostatic system acts to restore whenever a deviation is detected." },
{ term:"Metastasis", mod:"M8", def:"The spread of cancer cells from a primary tumour to establish secondary tumours elsewhere in the body." },
{ term:"Benign tumour", mod:"M8", def:"A tumour that remains localised and does not invade surrounding tissue or spread to other sites." },
{ term:"Cohort study", mod:"M8", def:"An observational study that follows exposed and unexposed groups forward in time to compare disease incidence." },
{ term:"Case-control study", mod:"M8", def:"An observational study that compares the past exposures of people with a disease and people without it." },
{ term:"Randomised controlled trial", mod:"M8", def:"An experiment in which participants are allocated to treatment or control by chance, so confounders are distributed evenly." },
{ term:"Sensitivity (of a test)", mod:"M8", def:"The proportion of people who have the disease that a diagnostic test correctly identifies as positive." },
{ term:"Specificity (of a test)", mod:"M8", def:"The proportion of people without the disease that a diagnostic test correctly identifies as negative." },
{ term:"Conductive hearing loss", mod:"M8", def:"Hearing loss caused by a problem in the outer or middle ear that reduces sound reaching the cochlea." },
{ term:"Sensorineural hearing loss", mod:"M8", def:"Hearing loss caused by damage to the cochlear hair cells or auditory nerve, which amplification cannot correct." },
{ term:"Myopia", mod:"M8", def:"Short-sightedness, in which light focuses in front of the retina and distant objects appear blurred." },
{ term:"Hyperopia", mod:"M8", def:"Long-sightedness, in which light focuses behind the retina and near objects appear blurred." }

]);
