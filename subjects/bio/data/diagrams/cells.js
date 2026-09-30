/* Diagrams — cells and organelles (M1).
   Hand-authored inline SVG. Rules (brief §3.3):
     • viewBox only — no width/height. CSS sizes it.
     • every labellable part carries an id, and hx/hy give the hotspot centre
       so an awkward shape (the Golgi) still gets a 44px touch target.
     • colours come from CSS custom properties so diagrams follow the theme. */
window.BIO = window.BIO || {}; BIO.DATA = BIO.DATA || {};
BIO.DATA.diagrams = BIO.DATA.diagrams || {};

BIO.DATA.diagrams.animalCell = {
  id:"animalCell", title:"Animal cell", mod:"M1", topic:"Cell structure",
  svg:
  "<svg viewBox='0 0 420 320'>" +
  "<ellipse id='cytoplasm' cx='210' cy='160' rx='195' ry='145' fill='var(--card-2)' stroke='var(--line)' stroke-width='2'/>" +
  "<ellipse id='membrane' cx='210' cy='160' rx='195' ry='145' fill='none' stroke='var(--accent)' stroke-width='4'/>" +
  "<circle id='nucleus' cx='150' cy='140' r='52' fill='var(--card-3)' stroke='var(--line)' stroke-width='2'/>" +
  "<circle id='nucleolus' cx='150' cy='140' r='18' fill='var(--accent-2)' stroke='var(--line)' stroke-width='1.5'/>" +
  "<ellipse id='mitochondrion' cx='305' cy='105' rx='42' ry='22' fill='var(--card-3)' stroke='var(--warn)' stroke-width='2.5'/>" +
  "<path d='M272 105 q10 -12 20 0 q10 12 20 0 q10 -12 20 0' fill='none' stroke='var(--warn)' stroke-width='2'/>" +
  "<path id='golgi' d='M262 218 q34 -12 62 -4 M258 228 q34 -12 62 -4 M254 238 q34 -12 62 -4 M250 248 q34 -12 62 -4' fill='none' stroke='var(--violet)' stroke-width='4' stroke-linecap='round'/>" +
  "<path id='rer' d='M92 216 q30 -14 58 0 q28 14 56 0 M90 232 q30 -14 58 0 q28 14 56 0' fill='none' stroke='var(--info)' stroke-width='3.5'/>" +
  "<circle cx='100' cy='212' r='3.5' fill='var(--info)'/><circle cx='128' cy='210' r='3.5' fill='var(--info)'/>" +
  "<circle cx='158' cy='218' r='3.5' fill='var(--info)'/><circle cx='190' cy='210' r='3.5' fill='var(--info)'/>" +
  "<circle cx='98' cy='228' r='3.5' fill='var(--info)'/><circle cx='150' cy='234' r='3.5' fill='var(--info)'/>" +
  "<circle id='ribosome' cx='236' cy='168' r='7' fill='var(--good)' stroke='var(--line)' stroke-width='1'/>" +
  "<circle cx='252' cy='150' r='5' fill='var(--good)'/><circle cx='222' cy='188' r='5' fill='var(--good)'/>" +
  "<circle id='lysosome' cx='108' cy='96' r='19' fill='var(--bad)' opacity='0.75' stroke='var(--line)' stroke-width='1.5'/>" +
  "<ellipse id='ser' cx='320' cy='185' rx='36' ry='16' fill='none' stroke='var(--info)' stroke-width='3'/>" +
  "<circle id='vesicle' cx='215' cy='262' r='13' fill='var(--card-3)' stroke='var(--violet)' stroke-width='2'/>" +
  "</svg>",
  parts:[
    { id:"membrane", label:"Cell membrane", hx:210, hy:18,
      role:"Selectively permeable boundary controlling what enters and leaves the cell", accept:["cell membrane","plasma membrane","membrane"] },
    { id:"nucleus", label:"Nucleus", hx:150, hy:140,
      role:"Contains the DNA and controls the cell's activities; site of transcription", accept:["nucleus"] },
    { id:"nucleolus", label:"Nucleolus", hx:150, hy:113,
      role:"Assembles ribosome subunits", accept:["nucleolus"] },
    { id:"mitochondrion", label:"Mitochondrion", hx:305, hy:105,
      role:"Site of aerobic respiration; releases ATP", accept:["mitochondrion","mitochondria"] },
    { id:"golgi", label:"Golgi apparatus", hx:288, hy:232,
      role:"Modifies, sorts and packages proteins into vesicles for secretion", accept:["golgi","golgi apparatus","golgi body"] },
    { id:"rer", label:"Rough endoplasmic reticulum", hx:148, hy:224,
      role:"Ribosome-studded membrane network that folds and transports proteins for export", accept:["rough er","rough endoplasmic reticulum","rer"] },
    { id:"ser", label:"Smooth endoplasmic reticulum", hx:320, hy:185,
      role:"Synthesises lipids and steroids; detoxifies drugs", accept:["smooth er","smooth endoplasmic reticulum","ser"] },
    { id:"ribosome", label:"Ribosome", hx:236, hy:168,
      role:"Site of translation — assembles polypeptides from mRNA", accept:["ribosome","ribosomes"] },
    { id:"lysosome", label:"Lysosome", hx:108, hy:96,
      role:"Vesicle of hydrolytic enzymes that digests engulfed material and worn-out organelles", accept:["lysosome"] },
    { id:"cytoplasm", label:"Cytoplasm", hx:64, hy:172,
      role:"Aqueous gel in which organelles are suspended and many metabolic reactions occur", accept:["cytoplasm","cytosol"] },
    { id:"vesicle", label:"Vesicle", hx:215, hy:262,
      role:"Membrane sac transporting material within the cell or to the membrane for exocytosis", accept:["vesicle"] }
  ]
};

BIO.DATA.diagrams.plantCell = {
  id:"plantCell", title:"Plant cell", mod:"M1", topic:"Cell structure",
  svg:
  "<svg viewBox='0 0 420 320'>" +
  "<rect id='cellWall' x='14' y='14' width='392' height='292' rx='16' fill='var(--card-2)' stroke='var(--good)' stroke-width='9'/>" +
  "<rect id='plantMembrane' x='24' y='24' width='372' height='272' rx='12' fill='none' stroke='var(--accent)' stroke-width='3.5'/>" +
  "<rect id='vacuole' x='96' y='84' width='230' height='152' rx='30' fill='var(--card-3)' stroke='var(--info)' stroke-width='3'/>" +
  "<rect id='tonoplast' x='96' y='84' width='230' height='152' rx='30' fill='none' stroke='var(--violet)' stroke-width='1.8' stroke-dasharray='6 4'/>" +
  "<circle id='plantNucleus' cx='68' cy='150' r='34' fill='var(--card-3)' stroke='var(--line)' stroke-width='2'/>" +
  "<circle cx='68' cy='150' r='11' fill='var(--accent-2)'/>" +
  "<ellipse id='chloroplast' cx='352' cy='96' rx='30' ry='17' fill='var(--good)' opacity='0.8' stroke='var(--line)' stroke-width='1.5'/>" +
  "<ellipse cx='356' cy='230' rx='28' ry='16' fill='var(--good)' opacity='0.6' stroke='var(--line)' stroke-width='1.2'/>" +
  "<ellipse cx='210' cy='56' rx='28' ry='15' fill='var(--good)' opacity='0.6' stroke='var(--line)' stroke-width='1.2'/>" +
  "<ellipse id='plantMito' cx='150' cy='272' rx='30' ry='15' fill='var(--card-3)' stroke='var(--warn)' stroke-width='2'/>" +
  "<path d='M126 272 q8 -9 15 0 q8 9 15 0 q8 -9 15 0' fill='none' stroke='var(--warn)' stroke-width='1.8'/>" +
  "<line id='plasmodesma' x1='14' y1='250' x2='34' y2='250' stroke='var(--accent)' stroke-width='6'/>" +
  "<line x1='14' y1='72' x2='34' y2='72' stroke='var(--accent)' stroke-width='6'/>" +
  "</svg>",
  parts:[
    { id:"cellWall", label:"Cell wall", hx:210, hy:18,
      role:"Rigid cellulose layer that prevents bursting and gives the cell shape", accept:["cell wall","cellulose cell wall","wall"] },
    { id:"plantMembrane", label:"Cell membrane", hx:210, hy:296,
      role:"Selectively permeable boundary just inside the wall", accept:["cell membrane","plasma membrane"] },
    { id:"vacuole", label:"Vacuole", hx:211, hy:160,
      role:"Large sac of cell sap; its water content generates turgor pressure", accept:["vacuole","central vacuole"] },
    { id:"tonoplast", label:"Tonoplast", hx:110, hy:110,
      role:"Membrane surrounding the vacuole, controlling what enters the cell sap", accept:["tonoplast"] },
    { id:"plantNucleus", label:"Nucleus", hx:68, hy:150,
      role:"Contains the DNA and controls the cell's activities", accept:["nucleus"] },
    { id:"chloroplast", label:"Chloroplast", hx:352, hy:96,
      role:"Site of photosynthesis; contains chlorophyll in stacked thylakoids", accept:["chloroplast","chloroplasts"] },
    { id:"plantMito", label:"Mitochondrion", hx:150, hy:272,
      role:"Site of aerobic respiration — plant cells respire day and night", accept:["mitochondrion","mitochondria"] },
    { id:"plasmodesma", label:"Plasmodesma", hx:24, hy:250,
      role:"Cytoplasmic channel through the wall connecting adjacent plant cells", accept:["plasmodesma","plasmodesmata"] }
  ]
};

BIO.DATA.diagrams.membrane = {
  id:"membrane", title:"Fluid mosaic membrane", mod:"M1", topic:"Membrane structure",
  svg:
  "<svg viewBox='0 0 440 260'>" +
  "<rect x='0' y='0' width='440' height='260' fill='none'/>" +
  "<text x='220' y='22' text-anchor='middle' fill='var(--ink-3)' font-size='13'>outside the cell</text>" +
  "<text x='220' y='250' text-anchor='middle' fill='var(--ink-3)' font-size='13'>cytoplasm</text>" +
  "<g id='bilayer'>" +
  "<g stroke='var(--warn)' stroke-width='2.5'>" +
  "<circle cx='30' cy='95' r='9' fill='var(--warn)'/><line x1='27' y1='104' x2='24' y2='128'/><line x1='33' y1='104' x2='36' y2='128'/>" +
  "<circle cx='62' cy='95' r='9' fill='var(--warn)'/><line x1='59' y1='104' x2='56' y2='128'/><line x1='65' y1='104' x2='68' y2='128'/>" +
  "<circle cx='94' cy='95' r='9' fill='var(--warn)'/><line x1='91' y1='104' x2='88' y2='128'/><line x1='97' y1='104' x2='100' y2='128'/>" +
  "<circle cx='190' cy='95' r='9' fill='var(--warn)'/><line x1='187' y1='104' x2='184' y2='128'/><line x1='193' y1='104' x2='196' y2='128'/>" +
  "<circle cx='222' cy='95' r='9' fill='var(--warn)'/><line x1='219' y1='104' x2='216' y2='128'/><line x1='225' y1='104' x2='228' y2='128'/>" +
  "<circle cx='318' cy='95' r='9' fill='var(--warn)'/><line x1='315' y1='104' x2='312' y2='128'/><line x1='321' y1='104' x2='324' y2='128'/>" +
  "<circle cx='350' cy='95' r='9' fill='var(--warn)'/><line x1='347' y1='104' x2='344' y2='128'/><line x1='353' y1='104' x2='356' y2='128'/>" +
  "<circle cx='414' cy='95' r='9' fill='var(--warn)'/><line x1='411' y1='104' x2='408' y2='128'/><line x1='417' y1='104' x2='420' y2='128'/>" +
  "<circle cx='30' cy='165' r='9' fill='var(--warn)'/><line x1='27' y1='156' x2='24' y2='132'/><line x1='33' y1='156' x2='36' y2='132'/>" +
  "<circle cx='62' cy='165' r='9' fill='var(--warn)'/><line x1='59' y1='156' x2='56' y2='132'/><line x1='65' y1='156' x2='68' y2='132'/>" +
  "<circle cx='94' cy='165' r='9' fill='var(--warn)'/><line x1='91' y1='156' x2='88' y2='132'/><line x1='97' y1='156' x2='100' y2='132'/>" +
  "<circle cx='190' cy='165' r='9' fill='var(--warn)'/><line x1='187' y1='156' x2='184' y2='132'/><line x1='193' y1='156' x2='196' y2='132'/>" +
  "<circle cx='222' cy='165' r='9' fill='var(--warn)'/><line x1='219' y1='156' x2='216' y2='132'/><line x1='225' y1='156' x2='228' y2='132'/>" +
  "<circle cx='318' cy='165' r='9' fill='var(--warn)'/><line x1='315' y1='156' x2='312' y2='132'/><line x1='321' y1='156' x2='324' y2='132'/>" +
  "<circle cx='350' cy='165' r='9' fill='var(--warn)'/><line x1='347' y1='156' x2='344' y2='132'/><line x1='353' y1='156' x2='356' y2='132'/>" +
  "<circle cx='414' cy='165' r='9' fill='var(--warn)'/><line x1='411' y1='156' x2='408' y2='132'/><line x1='417' y1='156' x2='420' y2='132'/>" +
  "</g></g>" +
  "<rect id='channelProtein' x='120' y='78' width='52' height='104' rx='14' fill='var(--info)' stroke='var(--line)' stroke-width='2'/>" +
  "<rect x='138' y='78' width='16' height='104' fill='var(--bg-2)'/>" +
  "<rect id='carrierProtein' x='252' y='78' width='52' height='104' rx='22' fill='var(--violet)' stroke='var(--line)' stroke-width='2'/>" +
  "<ellipse id='cholesterol' cx='378' cy='130' rx='13' ry='26' fill='var(--good)' stroke='var(--line)' stroke-width='1.5'/>" +
  "<path id='glycoprotein' d='M278 78 l0 -22 M278 56 l-12 -12 M278 56 l12 -12 M266 44 l-8 -10' stroke='var(--accent)' stroke-width='3' fill='none' stroke-linecap='round'/>" +
  "<circle cx='278' cy='52' r='4' fill='var(--accent)'/><circle cx='266' cy='44' r='4' fill='var(--accent)'/><circle cx='290' cy='44' r='4' fill='var(--accent)'/>" +
  "</svg>",
  parts:[
    { id:"bilayer", label:"Phospholipid bilayer", hx:62, hy:130,
      role:"Two layers of phospholipid: hydrophilic heads face the water, hydrophobic tails face inwards", accept:["phospholipid bilayer","bilayer","phospholipids"] },
    { id:"channelProtein", label:"Channel protein", hx:146, hy:130,
      role:"Water-filled pore allowing ions and polar molecules to cross by facilitated diffusion", accept:["channel protein","channel"] },
    { id:"carrierProtein", label:"Carrier protein", hx:278, hy:150,
      role:"Changes shape to move a specific particle across; used in facilitated diffusion and active transport", accept:["carrier protein","carrier","pump"] },
    { id:"cholesterol", label:"Cholesterol", hx:378, hy:130,
      role:"Buffers membrane fluidity — restricts movement when warm, prevents tight packing when cold", accept:["cholesterol"] },
    { id:"glycoprotein", label:"Glycoprotein", hx:278, hy:50,
      role:"Protein with a carbohydrate chain used in cell recognition and receptor binding", accept:["glycoprotein","glycoproteins"] }
  ]
};

BIO.DATA.diagrams.mitochondrion = {
  id:"mitochondrion", title:"Mitochondrion", mod:"M1", topic:"Respiration",
  svg:
  "<svg viewBox='0 0 400 240'>" +
  "<ellipse id='mOuter' cx='200' cy='120' rx='180' ry='100' fill='var(--card-2)' stroke='var(--accent)' stroke-width='4'/>" +
  "<ellipse id='mInner' cx='200' cy='120' rx='164' ry='84' fill='var(--card)' stroke='var(--warn)' stroke-width='3.5'/>" +
  "<path id='cristae' d='M60 100 q30 -34 58 -2 q26 30 4 44 M140 78 q28 -20 54 6 q22 24 -2 40 M226 76 q30 -18 56 8 q22 24 -4 42 M300 100 q26 -26 48 0 q20 24 -4 40' fill='none' stroke='var(--warn)' stroke-width='4' stroke-linecap='round'/>" +
  "<ellipse id='matrix' cx='200' cy='176' rx='120' ry='24' fill='var(--card-3)' opacity='0.55'/>" +
  "<circle id='mDNA' cx='118' cy='176' r='11' fill='none' stroke='var(--info)' stroke-width='2.5'/>" +
  "<circle id='mRibosome' cx='268' cy='178' r='6' fill='var(--good)'/>" +
  "<circle cx='288' cy='170' r='5' fill='var(--good)'/><circle cx='250' cy='186' r='5' fill='var(--good)'/>" +
  "</svg>",
  parts:[
    { id:"mOuter", label:"Outer membrane", hx:200, hy:22,
      role:"Smooth boundary separating the mitochondrion from the cytosol", accept:["outer membrane"] },
    { id:"mInner", label:"Inner membrane", hx:200, hy:40,
      role:"Holds the electron transport chain and ATP synthase; folded into cristae", accept:["inner membrane"] },
    { id:"cristae", label:"Cristae", hx:88, hy:112,
      role:"Folds of the inner membrane that greatly increase surface area for ATP production", accept:["cristae","crista"] },
    { id:"matrix", label:"Matrix", hx:200, hy:176,
      role:"Fluid interior containing the enzymes of the Krebs cycle", accept:["matrix"] },
    { id:"mDNA", label:"Circular DNA", hx:118, hy:176,
      role:"The mitochondrion's own circular genome — evidence for endosymbiotic origin", accept:["circular dna","mitochondrial dna","dna"] },
    { id:"mRibosome", label:"70S ribosome", hx:268, hy:178,
      role:"Prokaryote-sized ribosome — further evidence for endosymbiotic origin", accept:["70s ribosome","ribosome","ribosomes"] }
  ]
};

BIO.DATA.diagrams.chloroplast = {
  id:"chloroplast", title:"Chloroplast", mod:"M1", topic:"Photosynthesis",
  svg:
  "<svg viewBox='0 0 400 240'>" +
  "<ellipse id='cOuter' cx='200' cy='120' rx='185' ry='96' fill='var(--card-2)' stroke='var(--accent)' stroke-width='4'/>" +
  "<ellipse id='cInner' cx='200' cy='120' rx='172' ry='84' fill='var(--card)' stroke='var(--good)' stroke-width='3'/>" +
  "<ellipse id='stroma' cx='200' cy='120' rx='160' ry='72' fill='var(--card-3)' opacity='0.4'/>" +
  "<g id='granum' stroke='var(--good)' stroke-width='5' stroke-linecap='round'>" +
  "<line x1='84' y1='86' x2='140' y2='86'/><line x1='84' y1='100' x2='140' y2='100'/><line x1='84' y1='114' x2='140' y2='114'/><line x1='84' y1='128' x2='140' y2='128'/>" +
  "</g>" +
  "<g stroke='var(--good)' stroke-width='5' stroke-linecap='round'>" +
  "<line x1='230' y1='140' x2='286' y2='140'/><line x1='230' y1='154' x2='286' y2='154'/><line x1='230' y1='168' x2='286' y2='168'/>" +
  "</g>" +
  "<line id='lamella' x1='140' y1='107' x2='230' y2='154' stroke='var(--good)' stroke-width='3.5'/>" +
  "<circle id='starch' cx='300' cy='90' r='19' fill='var(--violet)' opacity='0.65' stroke='var(--line)' stroke-width='1.5'/>" +
  "<circle id='cDNA' cx='168' cy='176' r='10' fill='none' stroke='var(--info)' stroke-width='2.5'/>" +
  "</svg>",
  parts:[
    { id:"cOuter", label:"Outer membrane", hx:200, hy:26, role:"Smooth outer boundary of the double envelope", accept:["outer membrane"] },
    { id:"cInner", label:"Inner membrane", hx:200, hy:42, role:"Inner layer of the envelope, controlling entry to the stroma", accept:["inner membrane"] },
    { id:"granum", label:"Granum", hx:112, hy:107, role:"A stack of thylakoids; site of the light-dependent reactions", accept:["granum","grana","thylakoid stack"] },
    { id:"lamella", label:"Intergranal lamella", hx:185, hy:130, role:"Membrane connecting one granum to another", accept:["lamella","intergranal lamella","stroma lamella"] },
    { id:"stroma", label:"Stroma", hx:200, hy:196, role:"Fluid containing the Calvin cycle enzymes; site of the light-independent reactions", accept:["stroma"] },
    { id:"starch", label:"Starch grain", hx:300, hy:90, role:"Stored carbohydrate produced by photosynthesis", accept:["starch grain","starch"] },
    { id:"cDNA", label:"Circular DNA", hx:168, hy:176, role:"The chloroplast's own genome — evidence for endosymbiotic origin", accept:["circular dna","chloroplast dna","dna"] }
  ]
};

BIO.DATA.diagrams.enzyme = {
  id:"enzyme", title:"Enzyme action (induced fit)", mod:"M1", topic:"Enzymes",
  svg:
  "<svg viewBox='0 0 440 220'>" +
  "<path id='enzymeBody' d='M30 150 q0 -70 60 -70 q18 0 26 12 q10 -14 26 -14 q60 0 60 72 q0 40 -44 40 l-84 0 q-44 0 -44 -40 z' fill='var(--card-3)' stroke='var(--accent)' stroke-width='3'/>" +
  "<path id='activeSite' d='M116 80 q10 22 30 22 q20 0 30 -24' fill='none' stroke='var(--warn)' stroke-width='4' stroke-linecap='round'/>" +
  "<path id='substrate' d='M118 64 q14 26 34 26 q20 0 30 -28 q-32 -14 -64 2 z' fill='var(--good)' stroke='var(--line)' stroke-width='2'/>" +
  "<path d='M232 110 l40 0 M262 100 l12 10 l-12 10' stroke='var(--ink-2)' stroke-width='3' fill='none' stroke-linecap='round'/>" +
  "<path d='M290 150 q0 -70 60 -70 q18 0 26 12 q10 -14 26 -14 q60 0 60 72 q0 40 -44 40 l-84 0 q-44 0 -44 -40 z' fill='var(--card-3)' stroke='var(--accent)' stroke-width='3' opacity='0.55'/>" +
  "<path id='product' d='M368 58 l24 0 l0 18 l-24 0 z' fill='var(--violet)' stroke='var(--line)' stroke-width='1.8'/>" +
  "<path d='M336 58 l22 0 l0 18 l-22 0 z' fill='var(--violet)' stroke='var(--line)' stroke-width='1.8'/>" +
  "</svg>",
  parts:[
    { id:"enzymeBody", label:"Enzyme", hx:100, hy:150, role:"A protein catalyst that lowers activation energy and is unchanged by the reaction", accept:["enzyme"] },
    { id:"activeSite", label:"Active site", hx:146, hy:92, role:"Region with a shape complementary to the substrate, where catalysis occurs", accept:["active site"] },
    { id:"substrate", label:"Substrate", hx:150, hy:66, role:"The molecule the enzyme acts on; binds the active site to form an enzyme-substrate complex", accept:["substrate"] },
    { id:"product", label:"Products", hx:370, hy:66, role:"The molecules released after the reaction; the enzyme is then free to bind more substrate", accept:["product","products"] }
  ]
};
