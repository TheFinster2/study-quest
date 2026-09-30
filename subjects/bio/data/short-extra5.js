/* Short answer with marking criteria — sixth pass.

   Scenario-led: each stem gives a situation, a result or a set of numbers
   and asks the student to explain or interpret it, rather than to reproduce
   a topic. Criteria are written against the specific scenario so a generic
   essay on the topic does not tick them. */

window.BIO = window.BIO || {}; BIO.DATA = BIO.DATA || {};

BIO.DATA.short_x5_y11 = [

{ id:"su-001", mod:"M1", topic:"Membrane transport", marks:5,
  q:"Potato discs of equal mass are left in sucrose solutions of increasing concentration and reweighed. Explain the results you would expect and how they can be used to estimate the water potential of the potato tissue.",
  criteria:[
    "Predicts a mass gain in dilute solutions, because water enters the cells by osmosis",
    "Predicts a mass loss in concentrated solutions, because water leaves the cells by osmosis",
    "Explains that mass change should be expressed as a percentage of the starting mass to allow comparison between discs",
    "States that the concentration at which there is no change in mass is the point at which the solution and the tissue have equal water potential",
    "Explains that this concentration is read from the graph where the line crosses zero, and converted to a water potential using a standard table"
  ],
  keys:[["gain","dilute","water enters","osmosis","increase"],["loss","concentrated","water leaves","decrease"],["percentage","proportion","starting mass","comparable"],["no change","zero","equal water potential","same"],["intercept","crosses zero","read off","convert","table"]],
  sample:"In dilute sucrose solutions the external water potential is higher, that is less negative, than that inside the potato cells, so water moves into the cells by osmosis and the discs gain mass. In concentrated solutions the external water potential is lower than that of the tissue, water leaves the cells, and the discs lose mass. Because the discs will not all start at exactly the same mass, the change must be expressed as a percentage of the initial mass rather than in grams, or the comparison between concentrations is distorted by the size of the disc. Plotting percentage change against sucrose concentration gives a line falling from positive to negative values. The point at which it crosses zero is the concentration at which there was no net movement of water in either direction, which means the solution and the tissue had equal water potential at that point. Reading that concentration off the x-axis and looking it up in a table of water potentials for sucrose solutions gives an estimate for the potato tissue. The estimate is only as good as the control of the other variables: temperature affects water potential, the discs must be blotted identically before weighing since surface water is otherwise counted as mass gained, and they must all be left for the same time.",
  common:["Records absolute mass change rather than percentage, so discs of different sizes cannot be compared",
          "Says the potato 'absorbs sucrose', when it is water that moves"] },

{ id:"su-002", mod:"M1", topic:"Photosynthesis", marks:5,
  q:"Variegated leaves are destarched, exposed to light, and tested with iodine. Only the green regions turn blue-black. Explain what this experiment shows and identify the control it contains.",
  criteria:[
    "States that iodine turning blue-black indicates the presence of starch",
    "Explains that starch is the storage product of photosynthesis, so its presence indicates photosynthesis occurred",
    "Explains that the white regions lack chlorophyll and so cannot absorb light energy",
    "Concludes that chlorophyll is necessary for photosynthesis",
    "Identifies the green region of the same leaf as the control, since it experienced identical light, carbon dioxide, water and temperature"
  ],
  keys:[["iodine","blue-black","starch","test"],["storage","product of photosynthesis","indicates","evidence"],["white","no chlorophyll","cannot absorb","lacks pigment"],["chlorophyll is necessary","required","conclusion"],["control","same leaf","identical conditions","only variable"]],
  sample:"Iodine solution turns blue-black in the presence of starch and stays orange-brown where there is none. Starch is the storage form of the glucose made in photosynthesis, so a region that tests positive has been photosynthesising and a region that does not has not. The leaves are destarched first, by leaving the plant in darkness for a day or two, so that any starch found afterwards must have been made during the experiment rather than before it. In a variegated leaf the white regions contain no chlorophyll, so they cannot absorb light energy and cannot drive the light-dependent reactions. They therefore make no glucose and store no starch, and stay orange-brown. The green regions do both and turn blue-black. The conclusion is that chlorophyll is necessary for photosynthesis. The elegance of the design lies in its control. The green part of the same leaf experienced exactly the same light intensity, carbon dioxide concentration, water supply, temperature and duration as the white part, since they are millimetres apart on one leaf. The only variable that differs is the presence of chlorophyll, so the difference in the iodine result can be attributed to that and nothing else — which a comparison between two separate plants could not claim.",
  common:["Forgets that the plant must be destarched first, so the result proves nothing",
          "Names a separate plant as the control, which introduces other differences"] },

{ id:"su-003", mod:"M2", topic:"Gas exchange", marks:5,
  q:"A person moves to an altitude of 3500 m. Explain the immediate and the long-term physiological responses, and explain why the long-term responses are more effective.",
  criteria:[
    "States that atmospheric pressure and therefore the partial pressure of oxygen are lower at altitude",
    "Describes the immediate responses as increased breathing rate and increased heart rate",
    "Explains that these move more air and blood but cannot increase the oxygen content of each breath",
    "Describes long-term acclimatisation as increased red blood cell production stimulated by erythropoietin, and greater capillary density",
    "Explains that these raise the oxygen-carrying capacity of the blood itself, so adequate delivery is achieved without a sustained rise in heart and breathing rate"
  ],
  keys:[["lower pressure","partial pressure","less oxygen","thin air"],["breathing rate","heart rate","immediate","faster"],["cannot increase","same oxygen per breath","limited","only moves more"],["erythropoietin","red blood cells","haemoglobin","capillary","weeks"],["carrying capacity","sustainable","without","more effective","delivery"]],
  sample:"At 3500 m the atmosphere still contains about 21 per cent oxygen, but the total pressure is roughly two thirds of that at sea level, so the partial pressure of oxygen is correspondingly lower. Less oxygen diffuses into the blood at the alveoli and haemoglobin saturation falls. The immediate responses are driven by chemoreceptors: breathing becomes faster and deeper, and heart rate rises. Between them these move more air past the exchange surface and circulate the available oxygen more quickly, which keeps delivery adequate at rest. They are limited, however, because neither changes the amount of oxygen that a given volume of blood can carry; they simply move a poor supply around faster, at a considerable metabolic cost, and the raised rates cannot be sustained indefinitely without fatigue. Over days to weeks, acclimatisation changes the blood rather than the pumping. The kidneys detect low oxygen and secrete erythropoietin, which stimulates the bone marrow to produce more red blood cells, so haemoglobin concentration and therefore oxygen-carrying capacity rise. Capillary density in the muscles increases and mitochondrial density rises, shortening the diffusion distance and improving extraction at the tissues. These changes are more effective because they raise the amount of oxygen carried per unit volume of blood, so adequate delivery is achieved at a normal heart and breathing rate, which is sustainable. This is also why the changes reverse over a few weeks at sea level, since the stimulus is gone.",
  common:["Says the air contains a lower percentage of oxygen at altitude",
          "Describes acclimatisation without explaining why it is better than simply breathing faster"] },

{ id:"su-004", mod:"M3", topic:"Natural selection", marks:6,
  q:"Antibiotic resistance in a hospital rises for a year after prescribing is reduced, and then falls. Explain this pattern in terms of natural selection.",
  criteria:[
    "States that resistance alleles arise by random mutation and are present before the antibiotic is used",
    "Explains that antibiotic use is a selection pressure favouring resistant bacteria",
    "Explains that resistant strains already established persist after prescribing falls, because they are not immediately disadvantaged",
    "Explains that resistance often carries a metabolic cost, so susceptible strains outcompete resistant ones once the antibiotic is absent",
    "Explains that the change in frequency takes time because it depends on differential reproduction over many bacterial generations",
    "Notes that horizontal gene transfer by plasmids can spread resistance between bacteria, which slows the decline"
  ],
  keys:[["mutation","random","already present","before"],["selection pressure","favour","survive","antibiotic use"],["persist","established","lag","do not disappear"],["cost","fitness cost","outcompete","susceptible recover","absent"],["generations","time","differential reproduction","gradual"],["plasmid","horizontal","conjugation","spread between"]],
  sample:"Resistance alleles arise by random mutation and are present in a bacterial population regardless of whether an antibiotic is used. Prescribing an antibiotic imposes a strong selection pressure: susceptible bacteria are killed and the rare resistant ones survive and reproduce, so their frequency rises. Reducing prescribing removes that pressure, but it does not remove the bacteria. Resistant strains already established in the hospital environment and in patients continue to circulate, and for a time they are neither favoured nor eliminated, which is why the resistance figure does not drop the moment prescribing does. It may even continue rising briefly, because the resistant strains introduced during the high-prescribing period are still spreading between patients. The eventual decline occurs because resistance is usually not free. The altered protein or the efflux pump the bacterium maintains costs energy, so in the absence of the antibiotic a resistant cell divides slightly more slowly than a susceptible one. That small difference in reproductive rate, compounded over the very many generations a bacterial population passes through in a year, gradually shifts the balance back towards susceptible strains. The process is slower than the selection that produced it because the fitness difference without the drug is small, whereas the difference in its presence is the difference between life and death. Plasmid-borne resistance slows the decline further, since a plasmid can be passed horizontally to bacteria that never inherited it.",
  common:["Says the bacteria 'become resistant' in response to the antibiotic",
          "Cannot explain the lag, treating resistance as something that should disappear immediately"] },

{ id:"su-005", mod:"M4", topic:"Energy flow", marks:5,
  q:"A grassland fixes 20 000 kJ m⁻² yr⁻¹ and the herbivores that eat it assimilate 2000 kJ m⁻² yr⁻¹. Calculate the transfer efficiency and explain why it is not higher.",
  criteria:[
    "Calculates the efficiency as 2000 ÷ 20 000 = 10%",
    "Explains that not all of the plant material is eaten, since roots, stems and dead material are left",
    "Explains that not everything eaten is digested, so energy is lost in faeces to decomposers",
    "Explains that much of the energy assimilated is released as heat during respiration",
    "Explains that only the energy remaining in new tissue is available to the next trophic level, which is why chains are short"
  ],
  keys:[["10","0.1","per cent","2000 ÷ 20000"],["not all eaten","roots","inaccessible","uneaten"],["faeces","egested","not digested","decomposer"],["respiration","heat","lost","movement"],["new tissue","growth","available","short chains","limits"]],
  sample:"Transfer efficiency is the energy assimilated by the herbivores divided by the energy fixed by the producers, so 2000 ÷ 20 000 = 0.10, or 10 per cent. That is close to the typical figure, and the reasons for the other 90 per cent fall into three groups. First, not all of the plant material is eaten. Roots are underground, lignified stems are indigestible, and much of the plant simply dies and falls to the ground, so that energy passes to decomposers rather than to herbivores. Second, of the material that is eaten, a substantial proportion is not absorbed. Cellulose in particular is difficult to digest, and the energy in it leaves in the faeces, again going to decomposers. Third, of the energy that is actually assimilated, most is released as heat when it is respired to power movement, digestion, and in an endotherm the maintenance of body temperature. Only what remains after all of that is incorporated into new tissue as growth or offspring, and only that is available to a carnivore at the next level. The consequence is that each step costs roughly an order of magnitude, so a chain of five levels has about one ten-thousandth of the original energy at the top. That is why food chains rarely exceed four or five levels and why top predators are always rare.",
  common:["Says the missing energy is 'destroyed' or 'lost' without saying where it goes",
          "Forgets that uneaten and undigested material still carries energy, into the decomposer chain"] }

];

BIO.DATA.short_x5_y12 = [

{ id:"su-101", mod:"M5", topic:"Genetic technologies", marks:5,
  q:"DNA profiles are produced for a mother, a child and two possible fathers. Explain how the profiles are compared and what conclusion can safely be drawn.",
  criteria:[
    "Explains that a profile is a set of short tandem repeat bands separated by gel electrophoresis according to length",
    "Explains that each of the child's bands must be present in either the mother or the biological father",
    "Explains that the maternal bands are identified first and set aside, leaving the paternal bands",
    "Explains that a man lacking one or more of the remaining bands is excluded",
    "States that a man carrying all of them is not excluded, and that the strength of that conclusion is a probability rather than a certainty"
  ],
  keys:[["short tandem repeat","str","electrophoresis","band","length"],["each band","from one parent","inherited","must match"],["maternal","subtract","remaining bands","paternal"],["missing","excluded","cannot be","ruled out"],["not excluded","probability","not certainty","chance match","likelihood"]],
  sample:"A profile is a pattern of bands, each produced by amplifying a short tandem repeat region whose length varies between people, then separating the fragments by size using gel electrophoresis. Every band a child has was inherited, so it must appear in the mother's profile or the biological father's. The comparison is therefore done by subtraction. The child's profile is set against the mother's and any band she shares is accounted for as maternal. What remains must have come from the father. Each candidate is then checked against those remaining bands. If a man lacks even one of them, he cannot be the biological father, and that exclusion is definitive: there is no way for a child to carry a fragment neither parent possessed, other than a mutation, which is rare enough to be investigated rather than assumed. If a man carries all of the paternal bands, he is not excluded. That is a weaker conclusion than exclusion, because two unrelated people can share bands by chance and close relatives share many. With enough loci tested the probability of a coincidental match becomes very small, and a laboratory reports it as a likelihood ratio rather than as certainty. The honest statement is that one man is excluded and the other is not, with the probability of a chance match quoted.",
  common:["Says a matching profile 'proves' paternity",
          "Compares the child directly with the candidates without first removing the mother's contribution"] },

{ id:"su-102", mod:"M6", topic:"Mutation", marks:5,
  q:"Explain why a mutation in a tumour suppressor gene and a mutation in a proto-oncogene both increase cancer risk, and explain why one usually requires two mutated copies and the other only one.",
  criteria:[
    "States that a proto-oncogene normally promotes cell division in a controlled way",
    "Explains that a mutation can make it permanently active, driving division regardless of signals, which is a gain of function",
    "States that a tumour suppressor gene normally inhibits division or triggers repair and apoptosis",
    "Explains that its mutation is a loss of function, so the brake is removed",
    "Explains that one working copy of a tumour suppressor is usually sufficient, so both must be mutated, whereas a single overactive oncogene allele is enough to drive division"
  ],
  keys:[["proto-oncogene","promotes","stimulates division","accelerator"],["permanently active","gain of function","constitutive","always on"],["tumour suppressor","inhibits","repair","apoptosis","brake"],["loss of function","inactivated","brake removed","no longer"],["one copy sufficient","both alleles","recessive","dominant","single allele enough"]],
  sample:"The two gene classes control cell division from opposite directions. A proto-oncogene codes for a protein that promotes division when the appropriate signal arrives — a growth factor, its receptor, or a component of the pathway between them. A mutation that leaves such a protein permanently switched on causes the cell to behave as though the signal were always present, so it divides continuously. This is a gain of function, and the mutated form is called an oncogene. A tumour suppressor gene codes for a protein that restrains division: it halts the cycle at a checkpoint, directs repair of damaged DNA, or triggers apoptosis if the damage is beyond repair. Mutating it destroys that function, so the restraint is removed. The difference in how many copies must be affected follows directly from this. A single overactive oncogene allele produces an overactive protein, and the presence of a normal allele alongside it does nothing to counteract that — the accelerator is jammed regardless of the second copy. One mutation is therefore enough, and the effect is dominant at the cellular level. A tumour suppressor works by producing a functional protein, and one working copy usually produces enough of it to keep the brake applied, so a cell with one mutated and one normal copy still controls its division. Both copies must be lost before the function disappears, which is why these mutations behave recessively and why inheriting one faulty copy, as in familial retinoblastoma, raises risk so sharply: every cell already carries the first of the two required hits.",
  common:["Says both types of mutation 'cause cancer' without distinguishing gain from loss of function",
          "Reverses the copy-number requirement, expecting oncogenes to need two hits"] },

{ id:"su-103", mod:"M7", topic:"Immunity", marks:6,
  q:"Explain why a vaccine against influenza must be reformulated each year while the measles vaccine does not, and explain what this means for eradication.",
  criteria:[
    "States that immunity depends on memory cells recognising a specific antigen",
    "Explains that influenza surface proteins change by antigenic drift, an accumulation of mutations",
    "Explains that antigenic shift can occur when two strains reassort their genetic material in a shared host",
    "Explains that measles antigens are stable, so memory cells raised once continue to match",
    "Explains that the antigenic stability of measles, plus the absence of an animal reservoir, makes eradication feasible",
    "Explains that influenza cannot be eradicated because it circulates in animal reservoirs and changes continually"
  ],
  keys:[["memory cells","specific","antigen","recognise"],["antigenic drift","mutation","surface protein","haemagglutinin","gradual"],["antigenic shift","reassort","two strains","pig","abrupt"],["measles","stable","unchanged","one antigen","lifelong"],["eradicat","stable antigen","no animal reservoir","feasible"],["influenza","birds","pigs","reservoir","cannot eradicate"]],
  sample:"Immunity is specific. Memory cells recognise a particular shape on the pathogen's surface, and protection lasts only as long as that shape stays recognisable. Influenza's surface proteins, haemagglutinin and neuraminidase, accumulate mutations continually because its RNA polymerase has no proofreading. This antigenic drift changes the shape gradually, and after a season or two the antibodies raised against last year's strain bind poorly, so the vaccine composition is reformulated annually to match the strains predicted to circulate. Influenza can also change abruptly. Its genome is segmented, so if two different strains infect the same host — a pig or a bird can be infected by both human and avian strains — the segments can be reassorted into a new combination carrying a surface protein no human population has met. That antigenic shift is what produces pandemics. Measles has a stable antigenic surface and no comparable mechanism, so memory cells generated by a childhood vaccination continue to recognise the virus decades later, and two doses confer essentially lifelong protection. This difference determines what public health can aim for. Measles is a realistic eradication target because a stable antigen means a permanent vaccine, it infects only humans so there is no animal reservoir to reinfect a cleared population, and infection is clinically obvious. Influenza is not, because it is maintained in wild birds and pigs regardless of what happens in humans, and because any human immunity is continually outrun by the virus's own variation. Control, not elimination, is the achievable goal.",
  common:["Says the influenza virus 'becomes resistant to the vaccine', treating a vaccine like a drug",
          "Confuses antigenic drift with antigenic shift"] },

{ id:"su-104", mod:"M8", topic:"Homeostasis", marks:6,
  q:"A marathon runner finishes dehydrated and with a raised core temperature. Explain the conflict between the two homeostatic systems involved and how the body resolves it.",
  criteria:[
    "Explains that thermoregulation requires sweating, which loses water and salt",
    "Explains that osmoregulation requires water to be conserved, which limits sweating",
    "Explains that vasodilation of skin arterioles diverts blood to the surface for heat loss",
    "Explains that this competes with the blood flow required by working muscle and reduces venous return",
    "Explains that ADH secretion rises to conserve water at the kidney, producing a small volume of concentrated urine",
    "Explains that if dehydration becomes severe, blood volume is prioritised, sweating falls and core temperature rises further, which is how heat stroke develops"
  ],
  keys:[["sweat","evaporat","cooling","water loss"],["osmoregulation","conserve water","limits","conflict","cannot do both"],["vasodilation","skin","surface","heat loss"],["muscle","competing","blood flow","venous return","cardiac"],["adh","concentrated urine","conserve","kidney","small volume"],["blood volume prioritised","sweating falls","temperature rises","heat stroke","collapse"]],
  sample:"Two regulated variables come into direct conflict. Maintaining core temperature during sustained exercise depends on evaporative cooling, and sweating at a litre or more per hour is the only mechanism capable of removing heat at the rate the muscles produce it. Maintaining water and solute balance requires that water be conserved, and every litre of sweat takes the body further from that. The systems cannot both be satisfied, because the effector of one is the disturbance of the other. There is a second conflict in the circulation. Losing heat requires vasodilation of the skin arterioles so that warm blood is brought to the surface, but the working muscles simultaneously require a large share of cardiac output. With blood volume falling as plasma water is lost to sweat, venous return decreases, so the heart must beat faster to maintain output while supplying two competing demands. The kidney responds to the rising plasma osmolarity: osmoreceptors in the hypothalamus trigger ADH release, the collecting ducts become highly permeable, and a small volume of very concentrated urine is produced, while thirst is stimulated. This conserves what water remains but cannot replace what has gone. If dehydration continues, the body effectively chooses. Blood volume and pressure are prioritised over cooling, so skin blood flow and sweat rate are reduced to protect circulation. The consequence is that the main route of heat loss is throttled at exactly the point when heat production is still high, so core temperature climbs. That is the physiological basis of heat stroke, and it explains why fluid replacement during the event, not after it, is what prevents it.",
  common:["Describes thermoregulation and osmoregulation separately without identifying the conflict",
          "Says the body 'sweats more' when dehydrated, when sweating is in fact reduced"] },

{ id:"su-105", mod:"M8", topic:"Epidemiology", marks:5,
  q:"A newspaper reports that a screening program 'improves five-year survival from 40% to 70%'. Explain two reasons why this figure may overstate the benefit.",
  criteria:[
    "Explains lead-time bias: earlier diagnosis increases measured survival time from diagnosis even if the date of death is unchanged",
    "Explains length-time bias: screening preferentially detects slow-growing cases, which have a better prognosis anyway",
    "Explains overdiagnosis: screening detects cases that would never have caused symptoms, inflating the number of apparent survivors",
    "States that mortality per head of population, not survival from diagnosis, is the measure that avoids these biases",
    "Concludes that a randomised comparison of mortality between screened and unscreened groups is required to establish benefit"
  ],
  keys:[["lead-time","earlier diagnosis","clock starts","same date of death"],["length-time","slow-growing","indolent","better prognosis","preferentially"],["overdiagnosis","never caused symptoms","would not have","inflate"],["mortality","per population","death rate","not survival"],["randomised","compare mortality","screened and unscreened","required"]],
  sample:"Five-year survival is measured from the date of diagnosis, which is exactly the date that screening changes, and that creates two systematic biases. Lead-time bias arises because screening finds a cancer earlier in its course. If a person would have been diagnosed with symptoms in 2026 and died in 2029, they have a three-year survival; if screening finds the same cancer in 2023 and they still die in 2029, they now have a six-year survival and are counted as a five-year survivor. Nothing about their disease or their death has changed — only the moment the clock started. Length-time bias arises because screening is more likely to catch slow-growing tumours, simply because they spend longer in a detectable but asymptomatic state, whereas aggressive tumours appear between screening rounds and present with symptoms. The screened group therefore contains a higher proportion of inherently less dangerous disease, which raises its survival figure independently of any treatment effect. Overdiagnosis is the extreme case of this: screening detects lesions that would never have progressed to cause symptoms in that person's lifetime, and every one of them is counted as a cancer cured. The measure that avoids all three is mortality per head of the whole population, screened and unscreened alike, because it does not depend on when a diagnosis was made or on how many diagnoses there were. Establishing that a screening program works therefore requires a randomised comparison of death rates between a screened and an unscreened population, which is why some widely used programs remain contested despite impressive survival statistics.",
  common:["Treats improved five-year survival as automatic proof that screening saves lives",
          "Explains only one bias when the question asks for two"] }

];
