/* Data Detective — read a graph or table and answer.
   Each dataset renders as a table or a plotted series, with questions whose
   answers are computable from the data shown. */
window.BIO = window.BIO || {}; BIO.DATA = BIO.DATA || {};

BIO.DATA.data_core = [
{ id:"dd-001", mod:"M1", topic:"Enzymes", title:"Catalase activity against temperature", diff:2,
  kind:"line", xLabel:"Temperature (°C)", yLabel:"Oxygen produced (cm³/min)",
  series:[{ name:"Catalase", points:[[10,4],[20,9],[30,17],[37,24],[45,15],[55,3],[65,0]] }],
  questions:[
    { q:"At approximately what temperature is catalase activity greatest?", options:["37 °C","20 °C","45 °C","55 °C"], answer:0,
      why:"The peak of the curve is at 37 °C — the optimum, matching human body temperature.",
      distractors:{1:"Activity is still rising at 20 °C.",2:"Activity has already begun to fall by 45 °C.",3:"Activity is almost zero at 55 °C."} },
    { q:"What best explains the sharp fall between 45 °C and 65 °C?", options:["The enzyme is denaturing, so its active site no longer fits the substrate","The substrate has been used up","Collisions become less frequent at high temperature","The enzyme is being consumed by the reaction"], answer:0,
      why:"Above the optimum, heat breaks the hydrogen and ionic bonds holding the tertiary structure and the active site loses its shape.",
      distractors:{1:"Substrate depletion would affect all temperatures equally.",2:"Higher temperature means more frequent collisions, not fewer.",3:"Enzymes are not consumed by the reactions they catalyse."} },
    { q:"By how much does activity increase from 20 °C to 37 °C?", options:["15 cm³/min","9 cm³/min","24 cm³/min","33 cm³/min"], answer:0,
      why:"Read both points off the curve and subtract: 24 − 9 = 15 cm³ per minute.",
      distractors:{1:"That is the value at 20 °C, not the increase.",2:"That is the value at 37 °C.",3:"That adds the two values instead of subtracting."} }
  ] },

{ id:"dd-002", mod:"M4", topic:"Energy flow", title:"Energy in a grassland food chain", diff:2,
  kind:"table", columns:["Trophic level","Energy (kJ m⁻² yr⁻¹)"],
  rows:[["Sunlight reaching the grass","2 000 000"],["Producers","20 000"],["Primary consumers","2 200"],["Secondary consumers","210"],["Tertiary consumers","19"]],
  questions:[
    { q:"What percentage of incident light energy is fixed by the producers?", options:["1%","10%","0.1%","11%"], answer:0,
      why:"20 000 ÷ 2 000 000 = 0.01 = 1%. Most light is reflected, transmitted or of an unusable wavelength.",
      distractors:{1:"10% is the typical transfer between consumer levels, not the capture efficiency.",2:"That is a factor of ten too small.",3:"That misreads the division."} },
    { q:"Approximately what percentage of producer energy reaches the primary consumers?", options:["11%","1%","22%","90%"], answer:0,
      why:"2200 ÷ 20 000 = 0.11 = 11%, close to the usual ~10% figure.",
      distractors:{1:"1% is the producer capture efficiency from sunlight.",2:"That doubles the correct value.",3:"About 90% is LOST, not transferred."} },
    { q:"Which best explains why there is no fourth consumer level in this ecosystem?", options:["Too little energy remains to support a viable population","Predators of the tertiary consumer do not exist anywhere","Energy has been destroyed at each transfer","Decomposers consume all remaining energy"], answer:0,
      why:"After four transfers only 19 kJ m⁻² yr⁻¹ remains — far too little to support another population.",
      distractors:{1:"Such predators exist in other ecosystems; the constraint here is energy.",2:"Energy is not destroyed; it is transferred as heat.",3:"Decomposers process dead material at every level, which is not why the chain ends."} }
  ] },

{ id:"dd-003", mod:"M8", topic:"Epidemiology", title:"Smoking and lung cancer incidence", diff:3, tags:["epidemiology"],
  kind:"table", columns:["Cigarettes per day","Lung cancer cases per 100 000 per year"],
  rows:[["0 (never smoked)","10"],["1–9","51"],["10–19","144"],["20–39","217"],["40+","320"]],
  questions:[
    { q:"How many times higher is the rate in the 20–39 group compared with never-smokers?", options:["About 22 times","About 2 times","About 217 times","About 10 times"], answer:0,
      why:"217 ÷ 10 = 21.7, so roughly 22 times higher.",
      distractors:{1:"That would be a rate of 20 per 100 000.",2:"That is the absolute rate, not the ratio.",3:"That confuses the baseline value with the ratio."} },
    { q:"What feature of this data most strengthens a causal interpretation?", options:["Risk rises steadily with the amount smoked — a dose-response relationship","The never-smoker group has a rate above zero","The data is presented in a table","The highest group smokes 40+ cigarettes"], answer:0,
      why:"A graded relationship between exposure and outcome is difficult to explain by confounding alone, because a confounder would have to be graded in exactly the same way.",
      distractors:{1:"Cases in never-smokers show smoking is not the only cause, which is not evidence for causation.",2:"Presentation format is irrelevant to causal inference.",3:"That is simply a category label."} },
    { q:"What further evidence would most strengthen the causal claim?", options:["Risk falling in people who quit, plus an identified biological mechanism","A larger sample from the same population","Repeating the study in the same year","Showing that lung cancer is common"], answer:0,
      why:"Reversibility on removing the exposure, together with a plausible mechanism such as identified carcinogens in tobacco smoke, are among the strongest items in a causal argument.",
      distractors:{1:"A larger sample improves precision but does not address confounding.",2:"Repetition in the same population and year adds little.",3:"Frequency alone says nothing about cause."} }
  ] },

{ id:"dd-004", mod:"M1", topic:"Photosynthesis", title:"Light intensity and photosynthesis at two CO₂ levels", diff:3,
  kind:"line", xLabel:"Light intensity (arbitrary units)", yLabel:"O₂ produced (bubbles/min)",
  series:[
    { name:"0.04% CO₂", points:[[0,0],[2,14],[4,25],[6,31],[8,32],[10,32]] },
    { name:"0.40% CO₂", points:[[0,0],[2,18],[4,35],[6,50],[8,62],[10,66]] }
  ],
  questions:[
    { q:"At 0.04% CO₂ the curve plateaus above 6 units of light. What is limiting the rate there?", options:["Carbon dioxide concentration","Light intensity","Chlorophyll concentration","Oxygen concentration"], answer:0,
      why:"The plateau shows light is no longer limiting. Raising CO₂ raises the rate at the same light intensity, which identifies CO₂ as the limiting factor.",
      distractors:{1:"If light were limiting, the line would still be rising.",2:"Chlorophyll was unchanged between the two runs.",3:"Oxygen is a product, not a requirement."} },
    { q:"At 4 units of light, how much greater is the rate at 0.40% CO₂ than at 0.04%?", options:["10 bubbles/min","35 bubbles/min","25 bubbles/min","60 bubbles/min"], answer:0,
      why:"35 − 25 = 10 bubbles per minute.",
      distractors:{1:"That is the higher value, not the difference.",2:"That is the lower value.",3:"That adds the two values."} },
    { q:"What does the fact that both curves pass through the origin indicate?", options:["No net oxygen is produced in complete darkness","CO₂ concentration has no effect","The plants were dead at the start","Respiration does not occur"], answer:0,
      why:"With no light there are no light-dependent reactions, so no ATP or NADPH is made and no net oxygen is released.",
      distractors:{1:"CO₂ clearly matters — the two curves diverge sharply.",2:"Dead plants would produce nothing at any light intensity.",3:"Respiration continues in the dark, which is why the measure is NET oxygen."} }
  ] },

{ id:"dd-005", mod:"M2", topic:"Transport in animals", title:"Oxygen dissociation curves", diff:3,
  kind:"line", xLabel:"Partial pressure of oxygen (kPa)", yLabel:"% saturation of haemoglobin",
  series:[
    { name:"Normal pH 7.4", points:[[1,10],[2,26],[3,48],[4,68],[6,88],[8,95],[12,98]] },
    { name:"Lower pH 7.2 (high CO₂)", points:[[1,5],[2,15],[3,32],[4,52],[6,78],[8,90],[12,97]] }
  ],
  questions:[
    { q:"At 4 kPa, how much lower is saturation at pH 7.2 than at pH 7.4?", options:["16 percentage points","52 percentage points","68 percentage points","120 percentage points"], answer:0,
      why:"68 − 52 = 16 percentage points.",
      distractors:{1:"That is the value at pH 7.2.",2:"That is the value at pH 7.4.",3:"That adds the two values."} },
    { q:"What is the biological advantage of the shift shown by the lower curve?", options:["Oxygen is unloaded more readily in tissues producing a lot of CO₂","More oxygen is loaded in the lungs","Carbon dioxide is prevented from entering red blood cells","Haemoglobin is protected from denaturation"], answer:0,
      why:"The Bohr effect means the most metabolically active tissues, which produce the most CO₂, receive the most oxygen — supply tracks demand automatically.",
      distractors:{1:"A right shift lowers affinity, so it does not aid loading.",2:"CO₂ readily enters red blood cells and is converted to hydrogencarbonate.",3:"Haemoglobin is not at risk of denaturation at these pH values."} },
    { q:"Why is the normal curve S-shaped rather than a straight line?", options:["Binding of the first oxygen makes it easier for further oxygen to bind (cooperative binding)","Haemoglobin can only carry two oxygen molecules","Oxygen is actively pumped into the red blood cell","The measurement is inaccurate at low pressures"], answer:0,
      why:"Each oxygen bound changes haemoglobin's conformation, increasing affinity for the next — hence the steep middle section of the sigmoid curve.",
      distractors:{1:"Each haemoglobin carries four oxygen molecules.",2:"Oxygen binding is passive.",3:"The sigmoid shape is a real property, reproducible across studies."} }
  ] },

{ id:"dd-006", mod:"M4", topic:"Sampling", title:"Quadrat data from two grassland sites", diff:2,
  kind:"table", columns:["Quadrat","Site A (plants/m²)","Site B (plants/m²)"],
  rows:[["1","12","4"],["2","9","6"],["3","15","3"],["4","11","5"],["5","13","7"],["6","10","5"]],
  questions:[
    { q:"What is the mean number of plants per m² at Site A?", options:["11.7","70","10","13"], answer:0,
      why:"(12+9+15+11+13+10) ÷ 6 = 70 ÷ 6 = 11.67.",
      distractors:{1:"That is the total, not the mean.",2:"That is one of the readings.",3:"That is the second-highest reading."} },
    { q:"If Site B covers 800 m², what is the best estimate of its total population?", options:["4000","30","800","24 000"], answer:0,
      why:"Mean at Site B = 30 ÷ 6 = 5 plants/m². 5 × 800 = 4000.",
      distractors:{1:"That is the total counted across the quadrats.",2:"That is the site area.",3:"That multiplies the total count by the area instead of the mean."} },
    { q:"Which change would most improve the reliability of these estimates?", options:["Taking more quadrats at each site","Using a larger quadrat at Site A only","Sampling Site A in summer and Site B in winter","Placing quadrats where the plants look densest"], answer:0,
      why:"More samples reduce the effect of random variation, so repeated surveys give more consistent results.",
      distractors:{1:"Different quadrat sizes would make the two sites incomparable.",2:"Different seasons introduce an uncontrolled variable.",3:"Choosing dense patches introduces bias, the opposite of what random sampling achieves."} }
  ] },

{ id:"dd-007", mod:"M7", topic:"Immunity", title:"Antibody concentration after two exposures", diff:2,
  kind:"line", xLabel:"Days", yLabel:"Antibody concentration (arbitrary units)",
  series:[{ name:"Antibody titre", points:[[0,0],[5,2],[10,14],[15,22],[20,16],[30,7],[40,4],[42,6],[45,58],[50,86],[60,64],[70,42]] }],
  questions:[
    { q:"At approximately what day did the second exposure occur?", options:["Day 42","Day 10","Day 20","Day 60"], answer:0,
      why:"The sharp rise beginning around day 42 marks the secondary response, so the second exposure was at about that point.",
      distractors:{1:"Day 10 is during the rise of the primary response.",2:"Day 20 is the peak of the primary response.",3:"By day 60 the secondary response is already declining."} },
    { q:"Which two features distinguish the secondary response from the primary?", options:["It is faster and reaches a much higher concentration","It is slower and reaches a lower concentration","It is faster but reaches a lower concentration","It is identical in speed and magnitude"], answer:0,
      why:"Memory cells already exist and are specific, so the lag phase largely disappears and clonal expansion produces far more plasma cells.",
      distractors:{1:"The graph shows the opposite on both counts.",2:"The peak is roughly four times higher, not lower.",3:"The two responses differ clearly in both speed and height."} },
    { q:"Why does antibody concentration fall between day 20 and day 40?", options:["Plasma cells are short-lived and antibodies are broken down over time","Memory cells are destroyed","The pathogen has mutated","Antibodies are converted into antigens"], answer:0,
      why:"Plasma cells die within days to weeks and circulating antibodies are degraded. Long-term immunity rests on memory cells, not on persisting antibody.",
      distractors:{1:"Memory cells persist for years — that is why the second response is so strong.",2:"Mutation would reduce recognition, not antibody concentration after clearance.",3:"Antibodies are not converted into antigens."} }
  ] },

{ id:"dd-008", mod:"M8", topic:"Homeostasis", title:"Blood glucose after a glucose tolerance test", diff:3, tags:["homeostasis"],
  kind:"line", xLabel:"Minutes after drinking glucose", yLabel:"Blood glucose (mmol/L)",
  series:[
    { name:"Person A", points:[[0,4.8],[30,7.4],[60,7.9],[90,6.1],[120,5.2],[180,4.9]] },
    { name:"Person B", points:[[0,7.2],[30,11.4],[60,13.8],[90,13.1],[120,11.9],[180,10.4]] }
  ],
  questions:[
    { q:"Which person's results are consistent with diabetes, and why?", options:["Person B — glucose starts high, peaks much higher and does not return to baseline","Person A — glucose rises after drinking glucose","Person B — glucose falls after 60 minutes","Neither — both curves rise and fall"], answer:0,
      why:"A raised fasting level, an exaggerated peak and failure to return to baseline within two hours are the diagnostic pattern for impaired glucose regulation.",
      distractors:{1:"A rise after glucose is normal; Person A returns to baseline.",2:"A fall after the peak occurs in both and is not diagnostic on its own.",3:"The two curves differ substantially in baseline, peak and recovery."} },
    { q:"What is Person A's peak rise above their starting concentration?", options:["3.1 mmol/L","7.9 mmol/L","4.8 mmol/L","12.7 mmol/L"], answer:0,
      why:"7.9 − 4.8 = 3.1 mmol/L.",
      distractors:{1:"That is the peak value, not the rise.",2:"That is the starting value.",3:"That adds the two values."} },
    { q:"In Person A, which hormone is chiefly responsible for the fall after 60 minutes?", options:["Insulin","Glucagon","ADH","Adrenaline"], answer:0,
      why:"Rising glucose is detected by pancreatic beta cells, which secrete insulin; insulin increases cellular uptake and liver glycogen storage.",
      distractors:{1:"Glucagon raises blood glucose and is released when it falls.",2:"ADH regulates water balance.",3:"Adrenaline raises blood glucose."} }
  ] },

{ id:"dd-009", mod:"M3", topic:"Natural selection", title:"Beak depth in a finch population before and after a drought", diff:2,
  kind:"table", columns:["Beak depth (mm)","% of population 1976","% of population 1978"],
  rows:[["7.5–8.5","18","4"],["8.5–9.5","34","16"],["9.5–10.5","31","38"],["10.5–11.5","13","31"],["11.5–12.5","4","11"]],
  questions:[
    { q:"Which type of selection does this pattern show?", options:["Directional selection","Stabilising selection","Disruptive selection","No selection"], answer:0,
      why:"The whole distribution has shifted towards larger beaks, which is the signature of directional selection favouring one extreme.",
      distractors:{1:"Stabilising selection would narrow the distribution around the original mean.",2:"Disruptive selection would favour both extremes and hollow out the middle.",3:"A substantial shift in two years is not consistent with no selection."} },
    { q:"What is the most likely selection pressure?", options:["Drought left only large, hard seeds, which larger beaks can crack","Birds with larger beaks migrated into the population","Small-beaked birds chose not to reproduce","Larger beaks mutated in response to the drought"], answer:0,
      why:"The 1977 drought removed small soft seeds, so only birds able to crack large hard seeds fed successfully and survived to breed.",
      distractors:{1:"Migration would change the population but is not what Grant and Grant observed.",2:"Birds do not choose not to reproduce.",3:"Drought selects among existing variation; it does not direct mutation."} },
    { q:"By how many percentage points did the 8.5–9.5 mm category fall?", options:["18","34","16","50"], answer:0,
      why:"34 − 16 = 18 percentage points.",
      distractors:{1:"That is the 1976 value.",2:"That is the 1978 value.",3:"That adds the two values."} }
  ] },

{ id:"dd-010", mod:"M2", topic:"Surface area to volume", title:"Agar cube diffusion", diff:2,
  kind:"table", columns:["Cube side (cm)","Surface area (cm²)","Volume (cm³)","SA:V","Time to fully colour (min)"],
  rows:[["1","6","1","6.0","3"],["2","24","8","3.0","11"],["3","54","27","2.0","26"],["4","96","64","1.5","44"]],
  questions:[
    { q:"What happens to SA:V as the cube side length doubles from 1 cm to 2 cm?", options:["It halves, from 6.0 to 3.0","It doubles, from 3.0 to 6.0","It stays the same","It quadruples"], answer:0,
      why:"Surface area rises with the square of length and volume with the cube, so SA:V is proportional to 1/length and halves when length doubles.",
      distractors:{1:"The ratio falls as size increases, not rises.",2:"The table shows it changing at every step.",3:"Surface area quadruples, but volume increases eightfold."} },
    { q:"What does this model demonstrate about real cells?", options:["Smaller cells exchange materials with their surroundings more efficiently","Larger cells have faster metabolic rates","Diffusion requires ATP","Cell membranes are selectively permeable"], answer:0,
      why:"A higher SA:V and a shorter distance to the centre mean small cells are supplied by diffusion alone — the reason cells stay small or develop exchange surfaces.",
      distractors:{1:"Larger organisms have LOWER mass-specific metabolic rates, and this model says nothing about metabolism.",2:"Agar diffusion is entirely passive.",3:"Agar is not selectively permeable; this model is about size and distance."} },
    { q:"How many times longer does the 4 cm cube take to colour fully than the 1 cm cube?", options:["About 15 times","About 4 times","About 44 times","About 3 times"], answer:0,
      why:"44 ÷ 3 ≈ 14.7, so roughly 15 times longer — a far greater increase than the fourfold increase in side length.",
      distractors:{1:"That is the ratio of side lengths, not of times.",2:"That is the time itself, not a ratio.",3:"That is the time for the 1 cm cube."} }
  ] }
];
