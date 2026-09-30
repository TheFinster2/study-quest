/* Diagrams — reproduction, digestion, viruses and immunity. */
window.BIO = window.BIO || {}; BIO.DATA = BIO.DATA || {};
BIO.DATA.diagrams = BIO.DATA.diagrams || {};

BIO.DATA.diagrams.flower = {
  id:"flower", title:"Flower structure", mod:"M5", topic:"Reproduction",
  svg:
  "<svg viewBox='0 0 420 320'>" +
  "<path id='petal' d='M210 120 q-90 -70 -128 6 q64 62 128 -6 M210 120 q90 -70 128 6 q-64 62 -128 -6 M210 120 q-46 -96 40 -104 q26 78 -40 104' fill='var(--violet)' opacity='0.45' stroke='var(--violet)' stroke-width='2.5'/>" +
  "<path id='sepal' d='M210 196 q-58 22 -80 -12 q52 -20 80 12 M210 196 q58 22 80 -12 q-52 -20 -80 12' fill='var(--good)' opacity='0.6' stroke='var(--good)' stroke-width='2'/>" +
  "<line id='filament' x1='160' y1='190' x2='142' y2='96' stroke='var(--warn)' stroke-width='4'/>" +
  "<ellipse id='anther' cx='140' cy='86' rx='16' ry='11' fill='var(--warn)' stroke='var(--line)' stroke-width='1.5'/>" +
  "<line x1='262' y1='190' x2='282' y2='100' stroke='var(--warn)' stroke-width='4'/>" +
  "<ellipse cx='284' cy='90' rx='16' ry='11' fill='var(--warn)' stroke='var(--line)' stroke-width='1.5'/>" +
  "<line id='style' x1='210' y1='200' x2='210' y2='84' stroke='var(--accent)' stroke-width='5'/>" +
  "<ellipse id='stigma' cx='210' cy='76' rx='20' ry='12' fill='var(--accent)' stroke='var(--line)' stroke-width='1.5'/>" +
  "<path id='ovary' d='M210 200 q-38 6 -34 44 q4 40 34 42 q30 -2 34 -42 q4 -38 -34 -44 z' fill='var(--card-3)' stroke='var(--accent)' stroke-width='3'/>" +
  "<circle id='ovule' cx='196' cy='248' r='11' fill='var(--info)' stroke='var(--line)' stroke-width='1.5'/>" +
  "<circle cx='224' cy='262' r='10' fill='var(--info)' stroke='var(--line)' stroke-width='1.5'/>" +
  "<line id='receptacle' x1='210' y1='286' x2='210' y2='316' stroke='var(--good)' stroke-width='8'/>" +
  "</svg>",
  parts:[
    { id:"anther", label:"Anther", hx:140, hy:86, role:"Produces pollen grains, which contain the male gametes", accept:["anther"] },
    { id:"filament", label:"Filament", hx:151, hy:143, role:"Stalk holding the anther in position for pollen release", accept:["filament"] },
    { id:"stigma", label:"Stigma", hx:210, hy:76, role:"Sticky surface that receives pollen grains", accept:["stigma"] },
    { id:"style", label:"Style", hx:210, hy:142, role:"Column the pollen tube grows down to reach the ovule", accept:["style"] },
    { id:"ovary", label:"Ovary", hx:210, hy:244, role:"Encloses the ovules; develops into the fruit after fertilisation", accept:["ovary"] },
    { id:"ovule", label:"Ovule", hx:196, hy:248, role:"Contains the female gamete; becomes the seed after fertilisation", accept:["ovule","ovules"] },
    { id:"petal", label:"Petal", hx:120, hy:118, role:"Often coloured and scented to attract pollinators", accept:["petal","petals"] },
    { id:"sepal", label:"Sepal", hx:150, hy:190, role:"Protects the flower while it is still a bud", accept:["sepal","sepals"] },
    { id:"receptacle", label:"Receptacle", hx:210, hy:300, role:"Thickened end of the stalk to which the flower parts attach", accept:["receptacle"] }
  ]
};

BIO.DATA.diagrams.rootSection = {
  id:"rootSection", title:"Root cross-section", mod:"M2", topic:"Transport in plants",
  svg:
  "<svg viewBox='0 0 360 360'>" +
  "<circle id='rootEpidermis' cx='180' cy='180' r='166' fill='var(--card-2)' stroke='var(--accent)' stroke-width='4'/>" +
  "<circle id='cortex' cx='180' cy='180' r='140' fill='var(--card)' stroke='var(--line)' stroke-width='2'/>" +
  "<g fill='none' stroke='var(--line-soft)' stroke-width='1.5'>" +
  "<circle cx='180' cy='180' r='118'/><circle cx='180' cy='180' r='96'/></g>" +
  "<circle id='endodermis' cx='180' cy='180' r='76' fill='none' stroke='var(--warn)' stroke-width='6'/>" +
  "<circle id='pericycle' cx='180' cy='180' r='64' fill='var(--card-3)' stroke='var(--good)' stroke-width='3'/>" +
  "<path id='xylemRoot' d='M180 130 l16 26 l-16 26 l-16 -26 z M180 230 l16 -26 l-16 -26 l-16 26 z M130 180 l26 16 l26 -16 l-26 -16 z M230 180 l-26 16 l-26 -16 l26 -16 z' fill='var(--info)' opacity='0.85' stroke='var(--line)' stroke-width='1.5'/>" +
  "<circle id='phloemRoot' cx='214' cy='146' r='13' fill='var(--violet)' opacity='0.8' stroke='var(--line)' stroke-width='1.5'/>" +
  "<circle cx='146' cy='146' r='13' fill='var(--violet)' opacity='0.8' stroke='var(--line)' stroke-width='1.5'/>" +
  "<circle cx='214' cy='214' r='13' fill='var(--violet)' opacity='0.8' stroke='var(--line)' stroke-width='1.5'/>" +
  "<circle cx='146' cy='214' r='13' fill='var(--violet)' opacity='0.8' stroke='var(--line)' stroke-width='1.5'/>" +
  "<path id='rootHair' d='M180 14 l0 -12 M296 64 l10 -8 M64 64 l-10 -8 M180 346 l0 12 M296 296 l10 8 M64 296 l-10 8 M14 180 l-12 0 M346 180 l12 0' stroke='var(--accent)' stroke-width='4' stroke-linecap='round'/>" +
  "</svg>",
  parts:[
    { id:"rootEpidermis", label:"Epidermis", hx:180, hy:24, role:"Outer layer; its cells extend into root hairs for absorption", accept:["epidermis","root epidermis"] },
    { id:"rootHair", label:"Root hair", hx:180, hy:8, role:"Single-cell extension giving a very large surface area for water and mineral uptake", accept:["root hair","root hairs"] },
    { id:"cortex", label:"Cortex", hx:180, hy:66, role:"Packing tissue storing starch and providing the apoplast and symplast routes across the root", accept:["cortex"] },
    { id:"endodermis", label:"Endodermis", hx:180, hy:104, role:"Ring carrying the Casparian strip, which forces water through the cytoplasm so the plant controls what enters the xylem", accept:["endodermis"] },
    { id:"pericycle", label:"Pericycle", hx:180, hy:124, role:"Layer just inside the endodermis from which lateral roots originate", accept:["pericycle"] },
    { id:"xylemRoot", label:"Xylem", hx:180, hy:180, role:"Central star of vessels carrying water and mineral ions up to the shoot", accept:["xylem"] },
    { id:"phloemRoot", label:"Phloem", hx:214, hy:146, role:"Sieve tubes between the xylem arms, bringing sucrose down to the root", accept:["phloem"] }
  ]
};

BIO.DATA.diagrams.digestive = {
  id:"digestive", title:"The digestive system", mod:"M2", topic:"Digestion",
  svg:
  "<svg viewBox='0 0 360 400'>" +
  "<ellipse id='mouth' cx='180' cy='30' rx='42' ry='22' fill='var(--card-3)' stroke='var(--accent)' stroke-width='3'/>" +
  "<ellipse id='salivary' cx='108' cy='48' rx='24' ry='16' fill='var(--warn)' opacity='0.7' stroke='var(--line)' stroke-width='1.5'/>" +
  "<rect id='oesophagus' x='168' y='52' width='24' height='78' rx='12' fill='var(--card-3)' stroke='var(--accent)' stroke-width='3'/>" +
  "<path id='stomach' d='M180 130 q66 4 74 56 q8 54 -48 62 q-52 4 -56 -44 q-2 -50 30 -74 z' fill='var(--bad)' opacity='0.5' stroke='var(--bad)' stroke-width='3'/>" +
  "<ellipse id='liver' cx='96' cy='150' rx='58' ry='36' fill='var(--violet)' opacity='0.55' stroke='var(--violet)' stroke-width='2.5'/>" +
  "<ellipse id='gallBladder' cx='118' cy='186' rx='17" +
  "' ry='12' fill='var(--good)' opacity='0.85' stroke='var(--line)' stroke-width='1.5'/>" +
  "<ellipse id='pancreas' cx='112' cy='232' rx='52' ry='19' fill='var(--info)' opacity='0.7' stroke='var(--info)' stroke-width='2.5'/>" +
  "<path id='smallIntestine' d='M186 248 q-52 10 -44 44 q10 32 62 22 q52 -10 60 22 q6 32 -52 34 q-56 2 -62 -18' fill='none' stroke='var(--accent)' stroke-width='16' stroke-linecap='round'/>" +
  "<path id='largeIntestine' d='M56 250 l0 -30 q0 -18 20 -18 M56 250 l0 84 q0 20 22 20 l180 0' fill='none' stroke='var(--warn)' stroke-width='20' stroke-linecap='round' opacity='0.75'/>" +
  "<rect id='rectum' x='250' y='340" +
  "' width='22' height='46' rx='10' fill='var(--card-3)' stroke='var(--accent)' stroke-width='3'/>" +
  "</svg>",
  parts:[
    { id:"mouth", label:"Mouth", hx:180, hy:30, role:"Mechanical breakdown by teeth; salivary amylase begins starch digestion", accept:["mouth","buccal cavity"] },
    { id:"salivary", label:"Salivary gland", hx:108, hy:48, role:"Secretes saliva containing amylase and mucus", accept:["salivary gland","salivary glands"] },
    { id:"oesophagus", label:"Oesophagus", hx:180, hy:92, role:"Carries the bolus to the stomach by peristalsis — no digestion occurs here", accept:["oesophagus","esophagus"] },
    { id:"stomach", label:"Stomach", hx:200, hy:190, role:"Churns food and secretes HCl and pepsin, digesting protein at about pH 2", accept:["stomach"] },
    { id:"liver", label:"Liver", hx:96, hy:150, role:"Produces bile, deaminates excess amino acids and regulates blood glucose", accept:["liver"] },
    { id:"gallBladder", label:"Gall bladder", hx:118, hy:186, role:"Stores bile and releases it into the duodenum to emulsify fats", accept:["gall bladder","gallbladder"] },
    { id:"pancreas", label:"Pancreas", hx:112, hy:232, role:"Secretes amylase, lipase and protease into the duodenum, and insulin and glucagon into the blood", accept:["pancreas"] },
    { id:"smallIntestine", label:"Small intestine", hx:186, hy:300, role:"Completes digestion and absorbs nutrients across villi and microvilli", accept:["small intestine","ileum","duodenum"] },
    { id:"largeIntestine", label:"Large intestine", hx:56, hy:300, role:"Reabsorbs water and mineral ions; houses the gut microbiome", accept:["large intestine","colon"] },
    { id:"rectum", label:"Rectum", hx:261, hy:362, role:"Stores faeces before egestion", accept:["rectum"] }
  ]
};

BIO.DATA.diagrams.virus = {
  id:"virus", title:"Virus structure", mod:"M7", topic:"Pathogens",
  svg:
  "<svg viewBox='0 0 400 300'>" +
  "<circle id='envelope' cx='180' cy='150' r='118' fill='var(--card-2)' stroke='var(--warn)' stroke-width='5'/>" +
  "<circle id='capsid' cx='180' cy='150' r='84' fill='none' stroke='var(--info)' stroke-width='6'/>" +
  "<path d='M180 66 l73 42 l0 84 l-73 42 l-73 -42 l0 -84 z' fill='none' stroke='var(--info)' stroke-width='3' opacity='0.6'/>" +
  "<path id='genome' d='M146 128 q22 -20 40 4 q18 24 42 2 M146 168 q22 20 40 -4 q18 -24 42 -2' fill='none' stroke='var(--accent)' stroke-width='5' stroke-linecap='round'/>" +
  "<g id='spike' stroke='var(--bad)' stroke-width='5' stroke-linecap='round'>" +
  "<line x1='180' y1='32' x2='180' y2='8'/><line x1='262' y1='68' x2='279' y2='51'/>" +
  "<line x1='298' y1='150' x2='322' y2='150'/><line x1='262' y1='232' x2='279' y2='249'/>" +
  "<line x1='180' y1='268' x2='180' y2='292'/><line x1='98' y1='232' x2='81' y2='249'/>" +
  "<line x1='62' y1='150' x2='38' y2='150'/><line x1='98' y1='68' x2='81' y2='51'/>" +
  "</g>" +
  "<g fill='var(--bad)'>" +
  "<circle cx='180' cy='8' r='7'/><circle cx='281' cy='49' r='7'/><circle cx='324' cy='150' r='7'/><circle cx='281' cy='251' r='7'/>" +
  "<circle cx='180' cy='292' r='7'/><circle cx='79' cy='251' r='7'/><circle cx='36' cy='150' r='7'/><circle cx='79' cy='49' r='7'/>" +
  "</g>" +
  "<text x='368' y='288' text-anchor='end' fill='var(--ink-3)' font-size='11'>no cytoplasm · no ribosomes</text>" +
  "</svg>",
  parts:[
    { id:"capsid", label:"Capsid", hx:180, hy:78, role:"Protein coat protecting the nucleic acid and helping it enter a host cell", accept:["capsid","protein coat"] },
    { id:"genome", label:"Nucleic acid", hx:180, hy:148, role:"DNA or RNA carrying the instructions to make new virus particles", accept:["nucleic acid","genome","dna","rna","genetic material"] },
    { id:"envelope", label:"Lipid envelope", hx:180, hy:36, role:"Membrane stolen from the host cell; present in some viruses and why soap destroys them", accept:["lipid envelope","envelope","membrane"] },
    { id:"spike", label:"Surface protein", hx:324, hy:150, role:"Binds a specific receptor on the host cell — this is the antigen the immune system recognises", accept:["surface protein","spike protein","spike","antigen","glycoprotein"] }
  ]
};

BIO.DATA.diagrams.antigenPresentation = {
  id:"antigenPresentation", title:"Antigen presentation and the specific response", mod:"M7", topic:"Immunity",
  svg:
  "<svg viewBox='0 0 440 340'>" +
  "<circle id='apPathogen' cx='48' cy='48' r='20' fill='var(--bad)' stroke='var(--line)' stroke-width='2'/>" +
  "<path id='apMacrophage' d='M118 30 q60 -16 92 26 q28 42 -14 74 q-52 34 -92 -6 q-32 -44 14 -94 z' fill='var(--info)' opacity='0.5' stroke='var(--info)' stroke-width='3'/>" +
  "<circle cx='166' cy='78' r='16' fill='var(--bad)' opacity='0.55'/>" +
  "<path id='apMhc' d='M198 42 l10 -14 M214 54 l12 -12 M224 72 l16 -6' stroke='var(--warn)' stroke-width='5' stroke-linecap='round'/>" +
  "<circle id='apHelperT' cx='300" +
  "' cy='60' r='34' fill='var(--violet)' opacity='0.5' stroke='var(--violet)' stroke-width='3'/>" +
  "<text x='300' y='65' text-anchor='middle' fill='var(--ink)' font-size='12' font-weight='700'>Th</text>" +
  "<circle id='apBCell' cx='300' cy='176' r='34' fill='var(--good)' opacity='0.5' stroke='var(--good)' stroke-width='3'/>" +
  "<text x='300' y='181' text-anchor='middle' fill='var(--ink)' font-size='12' font-weight='700'>B</text>" +
  "<circle id='apPlasma' cx='198' cy='276' r='34' fill='var(--accent)' opacity='0.5' stroke='var(--accent)' stroke-width='3'/>" +
  "<text x='198' y='281' text-anchor='middle' fill='var(--ink)' font-size='11' font-weight='700'>plasma</text>" +
  "<circle id='apMemory' cx='386' cy='276' r='34' fill='var(--warn)' opacity='0.55' stroke='var(--warn)' stroke-width='3'/>" +
  "<text x='386' y='281' text-anchor='middle' fill='var(--ink)' font-size='11' font-weight='700'>memory</text>" +
  "<path id='apAntibody' d='M150 264 l-20 -14 M150 288 l-20 14 M138 276 l-30 0' stroke='var(--accent)' stroke-width='4' stroke-linecap='round'/>" +
  "<g stroke='var(--ink-3)' stroke-width='2.5' fill='none' stroke-linecap='round'>" +
  "<path d='M70 50 l34 -6 M96 38 l10 6 l-10 6'/>" +
  "<path d='M248 60 l16 0 M258 54 l8 6 l-8 6'/>" +
  "<path d='M300 96 l0 44 M294 134 l6 8 l6 -8'/>" +
  "<path d='M270 196 l-42 56 M234 240 l-6 12 l12 -2'/>" +
  "<path d='M332 196 l40 48 M366 232 l8 12 l-14 0'/>" +
  "</g>" +
  "<text x='84' y='118' fill='var(--ink-3)' font-size='11'>engulf + digest</text>" +
  "<text x='222' y='30' fill='var(--ink-3)' font-size='11'>present</text>" +
  "<text x='312' y='124' fill='var(--ink-3)' font-size='11'>activate</text>" +
  "</svg>",
  parts:[
    { id:"apPathogen", label:"Pathogen", hx:48, hy:48, role:"Carries the antigen that the whole specific response is directed against", accept:["pathogen"] },
    { id:"apMacrophage", label:"Macrophage", hx:160, hy:78, role:"Engulfs and digests the pathogen, then displays its antigen on the cell surface", accept:["macrophage","phagocyte","antigen presenting cell"] },
    { id:"apMhc", label:"Presented antigen", hx:220, hy:56, role:"Pathogen fragment displayed on MHC — the bridge from the non-specific to the specific response", accept:["presented antigen","antigen","mhc"] },
    { id:"apHelperT", label:"Helper T cell", hx:300, hy:60, role:"Recognises the presented antigen and coordinates the response by activating B and cytotoxic T cells", accept:["helper t cell","helper t","t helper cell"] },
    { id:"apBCell", label:"B lymphocyte", hx:300, hy:176, role:"The one cell whose receptor matches the antigen; it is selected and divides into a clone", accept:["b lymphocyte","b cell"] },
    { id:"apPlasma", label:"Plasma cell", hx:198, hy:276, role:"Short-lived antibody factory secreting thousands of antibodies per second", accept:["plasma cell","plasma cells"] },
    { id:"apMemory", label:"Memory cell", hx:386, hy:276, role:"Persists for years and produces the fast, large secondary response — the basis of immunity", accept:["memory cell","memory b cell","memory cells"] },
    { id:"apAntibody", label:"Antibody", hx:126, hy:276, role:"Binds the specific antigen, marking the pathogen for destruction", accept:["antibody","antibodies"] }
  ],
  sequence:["apPathogen","apMacrophage","apMhc","apHelperT","apBCell","apPlasma","apMemory"]
};

BIO.DATA.diagrams.replication = {
  id:"replication", title:"DNA replication fork", mod:"M5", topic:"Cell replication",
  svg:
  "<svg viewBox='0 0 440 300'>" +
  "<path id='parentDna' d='M20 132 l120 0 M20 168 l120 0' stroke='var(--info)' stroke-width='9' stroke-linecap='round'/>" +
  "<g stroke='var(--ink-3)' stroke-width='2.5'>" +
  "<line x1='40' y1='137' x2='40' y2='163'/><line x1='64' y1='137' x2='64' y2='163'/>" +
  "<line x1='88' y1='137' x2='88' y2='163'/><line x1='112' y1='137' x2='112' y2='163'/>" +
  "</g>" +
  "<path id='helicase' d='M140 150 m-20 0 a20 20 0 1 0 40 0 a20 20 0 1 0 -40 0' fill='var(--bad)' opacity='0.75' stroke='var(--line)' stroke-width='2'/>" +
  "<path id='leading' d='M160 122 q80 -22 160 -30 l80 0' fill='none' stroke='var(--info)' stroke-width='9' stroke-linecap='round'/>" +
  "<path d='M160 122 q80 -22 160 -30 l60 0' fill='none' stroke='var(--good)' stroke-width='6' stroke-linecap='round' stroke-dasharray='0'/>" +
  "<path id='lagging' d='M160 178 q80 22 160 30 l80 0' fill='none' stroke='var(--info)' stroke-width='9' stroke-linecap='round'/>" +
  "<g id='okazaki' stroke='var(--warn)' stroke-width='6' stroke-linecap='round'>" +
  "<path d='M186 190 q40 12 66 16'/><path d='M266 210 q34 4 62 6'/><path d='M340 218 l52 0'/>" +
  "</g>" +
  "<circle id='polymerase' cx='300' cy='96' r='19' fill='var(--violet)' opacity='0.8' stroke='var(--line)' stroke-width='2'/>" +
  "<circle cx='300' cy='210' r='19' fill='var(--violet)' opacity='0.8' stroke='var(--line)' stroke-width='2'/>" +
  "<circle id='ligase' cx='334" +
  "' cy='215' r='14' fill='var(--accent)' opacity='0.85' stroke='var(--line)' stroke-width='2'/>" +
  "<text x='400" +
  "' y='84' text-anchor='end' fill='var(--ink-3)' font-size='11'>leading strand — continuous</text>" +
  "<text x='400' y='248' text-anchor='end' fill='var(--ink-3)' font-size='11'>lagging strand — fragments</text>" +
  "<path d='M150 262 l70 0 M212 256 l8 6 l-8 6' stroke='var(--ink-3)' stroke-width='2.5' fill='none' stroke-linecap='round'/>" +
  "<text x='150' y='284' fill='var(--ink-3)' font-size='11'>fork moves this way</text>" +
  "</svg>",
  parts:[
    { id:"parentDna", label:"Parent DNA", hx:70, hy:150, role:"The original double helix, with its two strands held by hydrogen bonds", accept:["parent dna","original dna","template dna","double helix"] },
    { id:"helicase", label:"Helicase", hx:140, hy:150, role:"Unwinds the helix by breaking the hydrogen bonds between the base pairs", accept:["helicase"] },
    { id:"leading", label:"Leading strand", hx:300, hy:100, role:"Synthesised continuously toward the fork, because polymerase can only add to a 3' end", accept:["leading strand"] },
    { id:"lagging", label:"Lagging strand", hx:300, hy:204, role:"Synthesised away from the fork in short pieces, because of the antiparallel strands", accept:["lagging strand"] },
    { id:"okazaki", label:"Okazaki fragments", hx:230, hy:200, role:"The short pieces of new DNA made on the lagging strand", accept:["okazaki fragments","okazaki fragment","fragments"] },
    { id:"polymerase", label:"DNA polymerase", hx:300, hy:96, role:"Adds complementary nucleotides to the 3' end, and proofreads what it has just added", accept:["dna polymerase","polymerase"] },
    { id:"ligase", label:"DNA ligase", hx:334, hy:215, role:"Joins the Okazaki fragments into one continuous strand", accept:["dna ligase","ligase"] }
  ]
};
