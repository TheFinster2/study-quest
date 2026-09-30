/* Diagrams — organ systems and exchange surfaces (M2, M8). */
window.BIO = window.BIO || {}; BIO.DATA = BIO.DATA || {};
BIO.DATA.diagrams = BIO.DATA.diagrams || {};

BIO.DATA.diagrams.heart = {
  id:"heart", title:"The human heart", mod:"M2", topic:"Transport in animals",
  svg:
  "<svg viewBox='0 0 400 340'>" +
  "<path d='M108 76 q92 -34 184 0 q40 16 34 92 q-8 92 -60 148 q-14 18 -66 18 q-52 0 -66 -18 q-52 -56 -60 -148 q-6 -76 34 -92 z' fill='var(--card-2)' stroke='var(--line)' stroke-width='2'/>" +
  "<path id='rightAtrium' d='M118 92 q52 -20 78 -6 l0 66 l-84 0 q-14 -38 6 -60 z' fill='var(--info)' opacity='0.55' stroke='var(--line)' stroke-width='2'/>" +
  "<path id='leftAtrium' d='M204 86 q52 -14 78 6 q20 22 6 60 l-84 0 z' fill='var(--bad)' opacity='0.55' stroke='var(--line)' stroke-width='2'/>" +
  "<path id='rightVentricle' d='M112 158 l84 0 l0 140 q-40 4 -60 -24 q-28 -46 -24 -116 z' fill='var(--info)' opacity='0.35' stroke='var(--line)' stroke-width='2'/>" +
  "<path id='leftVentricle' d='M204 158 l84 0 q4 70 -24 116 q-20 28 -60 24 z' fill='var(--bad)' opacity='0.35' stroke='var(--line)' stroke-width='4'/>" +
  "<rect id='septum' x='196' y='150' width='8' height='150' fill='var(--ink-3)'/>" +
  "<path id='venaCava' d='M84 18 q0 44 30 62' fill='none' stroke='var(--info)' stroke-width='16' stroke-linecap='round'/>" +
  "<path id='aorta' d='M214 12 q46 6 56 62' fill='none' stroke='var(--bad)' stroke-width='16' stroke-linecap='round'/>" +
  "<path id='pulmonaryArtery' d='M170 14 q-4 40 -30 60' fill='none' stroke='var(--info)' stroke-width='13' stroke-linecap='round'/>" +
  "<path id='pulmonaryVein' d='M320 66 q-24 8 -40 22' fill='none' stroke='var(--bad)' stroke-width='13' stroke-linecap='round'/>" +
  "<path id='tricuspid' d='M124 156 l32 18 M188 156 l-30 18' stroke='var(--warn)' stroke-width='4' fill='none' stroke-linecap='round'/>" +
  "<path id='bicuspid' d='M212 156 l32 18 M276 156 l-30 18' stroke='var(--warn)' stroke-width='4' fill='none' stroke-linecap='round'/>" +
  "</svg>",
  parts:[
    { id:"rightAtrium", label:"Right atrium", hx:156, hy:118, role:"Receives deoxygenated blood from the body via the venae cavae", accept:["right atrium"] },
    { id:"leftAtrium", label:"Left atrium", hx:244, hy:118, role:"Receives oxygenated blood from the lungs via the pulmonary veins", accept:["left atrium"] },
    { id:"rightVentricle", label:"Right ventricle", hx:152, hy:224, role:"Pumps deoxygenated blood to the lungs; thinner wall as the distance is short", accept:["right ventricle"] },
    { id:"leftVentricle", label:"Left ventricle", hx:248, hy:224, role:"Pumps oxygenated blood to the whole body; thickest wall for the highest pressure", accept:["left ventricle"] },
    { id:"septum", label:"Septum", hx:200, hy:270, role:"Muscular wall keeping oxygenated and deoxygenated blood completely separate", accept:["septum"] },
    { id:"venaCava", label:"Vena cava", hx:88, hy:30, role:"Returns deoxygenated blood from the body to the right atrium", accept:["vena cava","venae cavae","superior vena cava"] },
    { id:"aorta", label:"Aorta", hx:238, hy:24, role:"Carries oxygenated blood from the left ventricle to the body at high pressure", accept:["aorta"] },
    { id:"pulmonaryArtery", label:"Pulmonary artery", hx:162, hy:34, role:"Carries deoxygenated blood from the right ventricle to the lungs", accept:["pulmonary artery"] },
    { id:"pulmonaryVein", label:"Pulmonary vein", hx:312, hy:70, role:"Carries oxygenated blood from the lungs to the left atrium", accept:["pulmonary vein","pulmonary veins"] },
    { id:"tricuspid", label:"Tricuspid valve", hx:156, hy:166, role:"Atrioventricular valve preventing backflow from the right ventricle into the right atrium", accept:["tricuspid valve","tricuspid","right av valve"] },
    { id:"bicuspid", label:"Bicuspid valve", hx:244, hy:166, role:"Atrioventricular valve preventing backflow from the left ventricle into the left atrium", accept:["bicuspid valve","mitral valve","bicuspid"] }
  ]
};

BIO.DATA.diagrams.alveolus = {
  id:"alveolus", title:"Alveolus and capillary", mod:"M2", topic:"Gas exchange",
  svg:
  "<svg viewBox='0 0 420 280'>" +
  "<path id='bronchiole' d='M12 60 q60 0 84 34' fill='none' stroke='var(--card-3)' stroke-width='24' stroke-linecap='round'/>" +
  "<circle id='alveolusSac' cx='170' cy='128' r='72' fill='var(--card-2)' stroke='var(--accent)' stroke-width='4'/>" +
  "<circle cx='250' cy='68' r='40' fill='var(--card-2)' stroke='var(--accent)' stroke-width='3'/>" +
  "<circle cx='252' cy='198' r='44' fill='var(--card-2)' stroke='var(--accent)' stroke-width='3'/>" +
  "<circle id='alveolarWall' cx='170' cy='128' r='72' fill='none' stroke='var(--warn)' stroke-width='2' stroke-dasharray='5 4'/>" +
  "<path id='capillary' d='M312 24 q-46 40 -20 96 q26 56 -12 138' fill='none' stroke='var(--bad)' stroke-width='16' stroke-linecap='round'/>" +
  "<path id='capillaryWall' d='M312 24 q-46 40 -20 96 q26 56 -12 138' fill='none' stroke='var(--ink-3)' stroke-width='19' stroke-linecap='round' opacity='0.25'/>" +
  "<circle id='redCell' cx='296' cy='118' r='11' fill='var(--bad)' stroke='var(--bg)' stroke-width='2'/>" +
  "<circle cx='288' cy='72' r='10' fill='var(--bad)' stroke='var(--bg)' stroke-width='2'/>" +
  "<path id='o2Arrow' d='M226 116 l50 0 M266 108 l10 8 l-10 8' fill='none' stroke='var(--good)' stroke-width='3.5' stroke-linecap='round'/>" +
  "<path id='co2Arrow' d='M276 156 l-50 0 M236 148 l-10 8 l10 8' fill='none' stroke='var(--violet)' stroke-width='3.5' stroke-linecap='round'/>" +
  "<text x='250' y='106' fill='var(--good)' font-size='13' font-weight='700'>O₂</text>" +
  "<text x='240' y='182' fill='var(--violet)' font-size='13' font-weight='700'>CO₂</text>" +
  "</svg>",
  parts:[
    { id:"bronchiole", label:"Bronchiole", hx:54, hy:66, role:"Small airway carrying air to and from the alveoli", accept:["bronchiole"] },
    { id:"alveolusSac", label:"Alveolus", hx:150, hy:128, role:"Air sac providing an enormous total surface area for gas exchange", accept:["alveolus","alveoli","air sac"] },
    { id:"alveolarWall", label:"Alveolar wall", hx:170, hy:58, role:"A single layer of flattened epithelium, giving a very short diffusion distance", accept:["alveolar wall","alveolar epithelium","wall"] },
    { id:"capillary", label:"Capillary", hx:302, hy:44, role:"Carries blood past the alveolus, maintaining the concentration gradient", accept:["capillary","blood capillary"] },
    { id:"redCell", label:"Red blood cell", hx:296, hy:118, role:"Carries haemoglobin, which binds the oxygen that diffuses across", accept:["red blood cell","erythrocyte","red cell"] },
    { id:"o2Arrow", label:"Oxygen diffusion", hx:250, hy:116, role:"Oxygen diffuses from alveolar air into the blood, down its concentration gradient", accept:["oxygen diffusion","oxygen","o2"] },
    { id:"co2Arrow", label:"Carbon dioxide diffusion", hx:250, hy:156, role:"Carbon dioxide diffuses from blood into the alveolar air and is exhaled", accept:["carbon dioxide diffusion","carbon dioxide","co2"] }
  ]
};

BIO.DATA.diagrams.nephron = {
  id:"nephron", title:"The nephron", mod:"M8", topic:"Kidney", tags:["homeostasis"],
  svg:
  "<svg viewBox='0 0 420 340'>" +
  "<path id='bowmans' d='M92 62 a44 44 0 1 0 44 44 l0 -14 a30 30 0 1 1 -30 -30 z' fill='var(--card-2)' stroke='var(--accent)' stroke-width='3'/>" +
  "<circle id='glomerulus' cx='92' cy='62' r='26' fill='none' stroke='var(--bad)' stroke-width='4'/>" +
  "<path d='M70 50 q22 -14 44 4 q-20 16 -44 -4 M70 74 q22 14 44 -4 q-20 -16 -44 4' fill='none' stroke='var(--bad)' stroke-width='2.5'/>" +
  "<path id='afferent' d='M18 40 q34 4 50 14' fill='none' stroke='var(--bad)' stroke-width='11' stroke-linecap='round'/>" +
  "<path id='efferent' d='M118 74 q30 10 34 34' fill='none' stroke='var(--bad)' stroke-width='7' stroke-linecap='round'/>" +
  "<path id='pct' d='M136 106 q56 -14 72 22 q12 34 -22 40' fill='none' stroke='var(--info)' stroke-width='12' stroke-linecap='round'/>" +
  "<path id='loop' d='M186 168 q-42 6 -46 66 q-4 56 42 60 q46 -4 44 -60 q-2 -60 -40 -66' fill='none' stroke='var(--violet)' stroke-width='12' stroke-linecap='round'/>" +
  "<path id='dct' d='M226 174 q48 -20 62 12 q10 30 -12 42' fill='none' stroke='var(--good)' stroke-width='12' stroke-linecap='round'/>" +
  "<path id='collectingDuct' d='M276 228 q34 6 34 46 l0 54' fill='none' stroke='var(--warn)' stroke-width='16' stroke-linecap='round'/>" +
  "<text x='352' y='300' fill='var(--ink-3)' font-size='12'>to ureter</text>" +
  "</svg>",
  parts:[
    { id:"glomerulus", label:"Glomerulus", hx:92, hy:62, role:"Knot of capillaries where high pressure forces filtrate out of the blood", accept:["glomerulus"] },
    { id:"bowmans", label:"Bowman's capsule", hx:64, hy:110, role:"Cup that collects the filtrate produced by ultrafiltration", accept:["bowmans capsule","bowman's capsule","renal capsule"] },
    { id:"afferent", label:"Afferent arteriole", hx:34, hy:44, role:"Wide vessel bringing blood to the glomerulus, creating high hydrostatic pressure", accept:["afferent arteriole"] },
    { id:"efferent", label:"Efferent arteriole", hx:140, hy:92, role:"Narrower vessel leaving the glomerulus, maintaining filtration pressure", accept:["efferent arteriole"] },
    { id:"pct", label:"Proximal convoluted tubule", hx:180, hy:120, role:"Reabsorbs all glucose and amino acids plus most water and ions, largely by active transport", accept:["proximal convoluted tubule","pct","proximal tubule"] },
    { id:"loop", label:"Loop of Henle", hx:186, hy:266, role:"Countercurrent multiplier creating the medullary salt gradient", accept:["loop of henle","henle","loop"] },
    { id:"dct", label:"Distal convoluted tubule", hx:270, hy:184, role:"Fine adjustment of ion balance and pH under hormonal control", accept:["distal convoluted tubule","dct","distal tubule"] },
    { id:"collectingDuct", label:"Collecting duct", hx:310, hy:296, role:"Water is reabsorbed here under ADH control, concentrating the urine", accept:["collecting duct"] }
  ]
};

BIO.DATA.diagrams.leaf = {
  id:"leaf", title:"Leaf cross-section", mod:"M2", topic:"Transport in plants",
  svg:
  "<svg viewBox='0 0 420 260'>" +
  "<rect id='cuticle' x='10' y='18' width='400' height='12' rx='6' fill='var(--warn)' opacity='0.7'/>" +
  "<rect id='upperEpidermis' x='10' y='30' width='400' height='26' fill='var(--card-3)' stroke='var(--line)' stroke-width='1.5'/>" +
  "<g id='palisade'>" +
  "<rect x='16' y='58' width='30' height='60' rx='8' fill='var(--good)' opacity='0.7' stroke='var(--line)'/>" +
  "<rect x='50' y='58' width='30' height='60' rx='8' fill='var(--good)' opacity='0.7' stroke='var(--line)'/>" +
  "<rect x='84' y='58' width='30' height='60' rx='8' fill='var(--good)' opacity='0.7' stroke='var(--line)'/>" +
  "<rect x='118' y='58' width='30' height='60' rx='8' fill='var(--good)' opacity='0.7' stroke='var(--line)'/>" +
  "<rect x='268' y='58' width='30' height='60' rx='8' fill='var(--good)' opacity='0.7' stroke='var(--line)'/>" +
  "<rect x='302' y='58' width='30' height='60' rx='8' fill='var(--good)' opacity='0.7' stroke='var(--line)'/>" +
  "<rect x='336' y='58' width='30' height='60' rx='8' fill='var(--good)' opacity='0.7' stroke='var(--line)'/>" +
  "<rect x='370' y='58' width='30' height='60' rx='8' fill='var(--good)' opacity='0.7' stroke='var(--line)'/>" +
  "</g>" +
  "<g id='spongy'>" +
  "<circle cx='36' cy='146' r='16' fill='var(--good)' opacity='0.45' stroke='var(--line)'/>" +
  "<circle cx='80' cy='166' r='15' fill='var(--good)' opacity='0.45' stroke='var(--line)'/>" +
  "<circle cx='124' cy='142' r='16' fill='var(--good)' opacity='0.45' stroke='var(--line)'/>" +
  "<circle cx='288' cy='150' r='16' fill='var(--good)' opacity='0.45' stroke='var(--line)'/>" +
  "<circle cx='334' cy='170' r='15' fill='var(--good)' opacity='0.45' stroke='var(--line)'/>" +
  "<circle cx='380' cy='144' r='16' fill='var(--good)' opacity='0.45' stroke='var(--line)'/>" +
  "</g>" +
  "<ellipse id='airSpace' cx='170' cy='170' rx='26' ry='16' fill='var(--bg)' stroke='var(--line-soft)' stroke-width='1.5'/>" +
  "<ellipse id='xylemLeaf' cx='196' cy='108' rx='24' ry='16' fill='var(--info)' opacity='0.7' stroke='var(--line)' stroke-width='1.5'/>" +
  "<ellipse id='phloemLeaf' cx='196' cy='144' rx='24' ry='16' fill='var(--violet)' opacity='0.7' stroke='var(--line)' stroke-width='1.5'/>" +
  "<rect id='lowerEpidermis' x='10' y='196' width='400' height='26' fill='var(--card-3)' stroke='var(--line)' stroke-width='1.5'/>" +
  "<path id='guardCells' d='M228 196 q-14 13 0 26 M262 196 q14 13 0 26' fill='var(--accent)' stroke='var(--accent)' stroke-width='7' stroke-linecap='round'/>" +
  "<rect id='stomaPore' x='240' y='198' width='12' height='22' fill='var(--bg)'/>" +
  "</svg>",
  parts:[
    { id:"cuticle", label:"Waxy cuticle", hx:120, hy:24, role:"Waterproof layer reducing water loss from the leaf surface", accept:["cuticle","waxy cuticle"] },
    { id:"upperEpidermis", label:"Upper epidermis", hx:80, hy:44, role:"Transparent protective layer allowing light through to the palisade cells", accept:["upper epidermis","epidermis"] },
    { id:"palisade", label:"Palisade mesophyll", hx:100, hy:88, role:"Column cells packed with chloroplasts; the main site of photosynthesis", accept:["palisade mesophyll","palisade","palisade layer"] },
    { id:"spongy", label:"Spongy mesophyll", hx:80, hy:158, role:"Loosely packed cells with air spaces allowing CO₂ to diffuse to the cells", accept:["spongy mesophyll","spongy layer","spongy"] },
    { id:"airSpace", label:"Air space", hx:170, hy:170, role:"Interconnected space allowing gases to diffuse through the leaf", accept:["air space","air spaces","intercellular space"] },
    { id:"xylemLeaf", label:"Xylem", hx:196, hy:108, role:"Delivers water and mineral ions to the leaf", accept:["xylem"] },
    { id:"phloemLeaf", label:"Phloem", hx:196, hy:144, role:"Carries sucrose away from the leaf to the rest of the plant", accept:["phloem"] },
    { id:"lowerEpidermis", label:"Lower epidermis", hx:100, hy:208, role:"Protective layer containing most of the leaf's stomata", accept:["lower epidermis"] },
    { id:"guardCells", label:"Guard cells", hx:246, hy:230, role:"Pair of cells whose turgor opens and closes the stomatal pore", accept:["guard cells","guard cell"] },
    { id:"stomaPore", label:"Stoma", hx:246, hy:186, role:"Pore allowing CO₂ in and water vapour out", accept:["stoma","stomata","stomatal pore"] }
  ]
};

BIO.DATA.diagrams.xylemPhloem = {
  id:"xylemPhloem", title:"Xylem and phloem", mod:"M2", topic:"Transport in plants",
  svg:
  "<svg viewBox='0 0 400 280'>" +
  "<rect id='xylemVessel' x='40' y='30' width='96' height='220' rx='8' fill='var(--card-2)' stroke='var(--info)' stroke-width='4'/>" +
  "<line x1='40' y1='104' x2='136' y2='104' stroke='var(--info)' stroke-width='1.5' stroke-dasharray='4 5'/>" +
  "<line x1='40' y1='178' x2='136' y2='178' stroke='var(--info)' stroke-width='1.5' stroke-dasharray='4 5'/>" +
  "<path id='lignin' d='M44 46 q46 12 88 0 M44 140 q46 12 88 0 M44 216 q46 12 88 0' fill='none' stroke='var(--info)' stroke-width='5' opacity='0.6'/>" +
  "<path d='M88 240 l0 -190 M80 62 l8 -12 l8 12' fill='none' stroke='var(--accent)' stroke-width='2.5' stroke-linecap='round'/>" +
  "<rect id='sieveTube' x='236' y='30' width='72' height='220' rx='8' fill='var(--card-2)' stroke='var(--violet)' stroke-width='4'/>" +
  "<g id='sievePlate'>" +
  "<line x1='236' y1='104' x2='308' y2='104' stroke='var(--violet)' stroke-width='5'/>" +
  "<line x1='248' y1='104' x2='254' y2='104' stroke='var(--card-2)' stroke-width='6'/>" +
  "<line x1='266' y1='104' x2='272' y2='104' stroke='var(--card-2)' stroke-width='6'/>" +
  "<line x1='284' y1='104' x2='290' y2='104' stroke='var(--card-2)' stroke-width='6'/>" +
  "<line x1='236' y1='178' x2='308' y2='178' stroke='var(--violet)' stroke-width='5'/>" +
  "<line x1='248' y1='178' x2='254' y2='178' stroke='var(--card-2)' stroke-width='6'/>" +
  "<line x1='266' y1='178' x2='272' y2='178' stroke='var(--card-2)' stroke-width='6'/>" +
  "<line x1='284' y1='178' x2='290' y2='178' stroke='var(--card-2)' stroke-width='6'/>" +
  "</g>" +
  "<rect id='companionCell' x='312' y='40' width='44' height='200' rx='8' fill='var(--card-3)' stroke='var(--good)' stroke-width='3'/>" +
  "<circle cx='334' cy='90' r='11' fill='var(--good)' opacity='0.6'/>" +
  "<circle cx='334' cy='160' r='7' fill='var(--warn)' opacity='0.8'/>" +
  "<circle cx='334' cy='200' r='7' fill='var(--warn)' opacity='0.8'/>" +
  "</svg>",
  parts:[
    { id:"xylemVessel", label:"Xylem vessel", hx:88, hy:70, role:"Dead, hollow, lignified tube carrying water and minerals upward only", accept:["xylem vessel","xylem"] },
    { id:"lignin", label:"Lignin thickening", hx:88, hy:216, role:"Strengthens the vessel wall so it does not collapse under tension", accept:["lignin","lignin thickening","lignified wall"] },
    { id:"sieveTube", label:"Sieve tube element", hx:272, hy:60, role:"Living cell with few organelles that carries sucrose in the phloem", accept:["sieve tube","sieve tube element","sieve element"] },
    { id:"sievePlate", label:"Sieve plate", hx:272, hy:104, role:"Perforated end wall allowing sap to flow from one sieve element to the next", accept:["sieve plate"] },
    { id:"companionCell", label:"Companion cell", hx:334, hy:130, role:"Metabolically active cell with many mitochondria that actively loads sucrose into the sieve tube", accept:["companion cell"] }
  ]
};

BIO.DATA.diagrams.homeostasis = {
  id:"homeostasis", title:"Negative feedback loop", mod:"M8", topic:"Homeostasis", tags:["homeostasis"],
  svg:
  "<svg viewBox='0 0 440 260'>" +
  "<rect id='stimulus' x='16' y='18' width='120' height='54' rx='12' fill='var(--card-3)' stroke='var(--warn)' stroke-width='3'/>" +
  "<text x='76' y='42' text-anchor='middle' fill='var(--ink)' font-size='13' font-weight='700'>Stimulus</text>" +
  "<text x='76' y='60' text-anchor='middle' fill='var(--ink-2)' font-size='11'>variable changes</text>" +
  "<rect id='receptor' x='166' y='18' width='108' height='54' rx='12' fill='var(--card-3)' stroke='var(--info)' stroke-width='3'/>" +
  "<text x='220' y='50' text-anchor='middle' fill='var(--ink)' font-size='13' font-weight='700'>Receptor</text>" +
  "<rect id='controlCentre' x='304' y='18' width='120' height='54' rx='12' fill='var(--card-3)' stroke='var(--violet)' stroke-width='3'/>" +
  "<text x='364' y='42' text-anchor='middle' fill='var(--ink)' font-size='13' font-weight='700'>Control</text>" +
  "<text x='364' y='60' text-anchor='middle' fill='var(--ink)' font-size='13' font-weight='700'>centre</text>" +
  "<rect id='effector' x='304' y='150' width='120' height='54' rx='12' fill='var(--card-3)' stroke='var(--accent)' stroke-width='3'/>" +
  "<text x='364' y='182' text-anchor='middle' fill='var(--ink)' font-size='13' font-weight='700'>Effector</text>" +
  "<rect id='response' x='150' y='150' width='124' height='54' rx='12' fill='var(--card-3)' stroke='var(--good)' stroke-width='3'/>" +
  "<text x='212' y='174' text-anchor='middle' fill='var(--ink)' font-size='13' font-weight='700'>Response</text>" +
  "<text x='212' y='192' text-anchor='middle' fill='var(--ink-2)' font-size='11'>opposes change</text>" +
  "<path d='M136 45 l24 0 M154 39 l8 6 l-8 6' fill='none' stroke='var(--ink-2)' stroke-width='2.5' stroke-linecap='round'/>" +
  "<path d='M274 45 l24 0 M292 39 l8 6 l-8 6' fill='none' stroke='var(--ink-2)' stroke-width='2.5' stroke-linecap='round'/>" +
  "<path d='M364 72 l0 72 M358 138 l6 8 l6 -8' fill='none' stroke='var(--ink-2)' stroke-width='2.5' stroke-linecap='round'/>" +
  "<path d='M304 177 l-24 0 M288 171 l-8 6 l8 6' fill='none' stroke='var(--ink-2)' stroke-width='2.5' stroke-linecap='round'/>" +
  "<path id='feedbackArrow' d='M150 177 l-74 0 l0 -100 M70 84 l6 -8 l6 8' fill='none' stroke='var(--bad)' stroke-width='3' stroke-linecap='round' stroke-dasharray='7 5'/>" +
  "<text x='60' y='134' fill='var(--bad)' font-size='11' font-weight='700' transform='rotate(-90 60 134)'>negative feedback</text>" +
  "</svg>",
  parts:[
    { id:"stimulus", label:"Stimulus", hx:76, hy:45, role:"A change that moves the variable away from its set point", accept:["stimulus"] },
    { id:"receptor", label:"Receptor", hx:220, hy:45, role:"Detects the change in the variable", accept:["receptor","receptors","sensor"] },
    { id:"controlCentre", label:"Control centre", hx:364, hy:45, role:"Compares the value against the set point and coordinates the response", accept:["control centre","control center","modulator"] },
    { id:"effector", label:"Effector", hx:364, hy:177, role:"The muscle, gland or organ that carries out the response", accept:["effector","effectors"] },
    { id:"response", label:"Response", hx:212, hy:177, role:"The action produced, which opposes the original change", accept:["response"] },
    { id:"feedbackArrow", label:"Negative feedback", hx:76, hy:130, role:"The response reduces the original stimulus, returning the variable to the set point", accept:["negative feedback","feedback"] }
  ]
};
