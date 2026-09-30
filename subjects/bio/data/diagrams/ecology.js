/* Diagrams — ecology, immunity and epidemiology (M4, M7, M8). */
window.BIO = window.BIO || {}; BIO.DATA = BIO.DATA || {};
BIO.DATA.diagrams = BIO.DATA.diagrams || {};

BIO.DATA.diagrams.foodWeb = {
  id:"foodWeb", title:"Australian woodland food web", mod:"M4", topic:"Energy flow",
  svg:
  "<svg viewBox='0 0 440 320'>" +
  "<g stroke='var(--line)' stroke-width='2' fill='none'>" +
  "<path d='M96 250 l0 -46'/><path d='M240 250 l-110 -46'/><path d='M240 250 l0 -46'/><path d='M384 250 l0 -46'/>" +
  "<path d='M108 178 l50 -46'/><path d='M240 178 l-60 -46'/><path d='M240 178 l88 -46'/><path d='M384 178 l-40 -46'/>" +
  "<path d='M172 106 l86 -40'/><path d='M340 106 l-70 -40'/>" +
  "</g>" +
  "<g id='producers'>" +
  "<rect x='52' y='250' width='90' height='40' rx='10' fill='var(--good)' opacity='0.7' stroke='var(--line)' stroke-width='2'/>" +
  "<text x='97' y='275' text-anchor='middle' fill='var(--accent-ink)' font-size='12' font-weight='700'>Eucalypt</text>" +
  "<rect x='196' y='250' width='90' height='40' rx='10' fill='var(--good)' opacity='0.7' stroke='var(--line)' stroke-width='2'/>" +
  "<text x='241' y='275' text-anchor='middle' fill='var(--accent-ink)' font-size='12' font-weight='700'>Grasses</text>" +
  "<rect x='340' y='250' width='90' height='40' rx='10' fill='var(--good)' opacity='0.7' stroke='var(--line)' stroke-width='2'/>" +
  "<text x='385' y='275' text-anchor='middle' fill='var(--accent-ink)' font-size='12' font-weight='700'>Wattle</text>" +
  "</g>" +
  "<g id='primary'>" +
  "<rect x='60' y='166' width='96' height='38' rx='10' fill='var(--info)' opacity='0.6' stroke='var(--line)' stroke-width='2'/>" +
  "<text x='108' y='190' text-anchor='middle' fill='var(--ink)' font-size='12' font-weight='700'>Koala</text>" +
  "<rect x='192' y='166' width='96' height='38' rx='10' fill='var(--info)' opacity='0.6' stroke='var(--line)' stroke-width='2'/>" +
  "<text x='240' y='190' text-anchor='middle' fill='var(--ink)' font-size='12' font-weight='700'>Wallaby</text>" +
  "<rect x='336' y='166' width='96' height='38' rx='10' fill='var(--info)' opacity='0.6' stroke='var(--line)' stroke-width='2'/>" +
  "<text x='384' y='190' text-anchor='middle' fill='var(--ink)' font-size='12' font-weight='700'>Insects</text>" +
  "</g>" +
  "<g id='secondary'>" +
  "<rect x='120' y='94' width='104' height='38' rx='10' fill='var(--warn)' opacity='0.6' stroke='var(--line)' stroke-width='2'/>" +
  "<text x='172' y='118' text-anchor='middle' fill='var(--ink)' font-size='12' font-weight='700'>Goanna</text>" +
  "<rect x='288' y='94' width='104' height='38' rx='10' fill='var(--warn)' opacity='0.6' stroke='var(--line)' stroke-width='2'/>" +
  "<text x='340' y='118' text-anchor='middle' fill='var(--ink)' font-size='12' font-weight='700'>Kookaburra</text>" +
  "</g>" +
  "<g id='tertiary'>" +
  "<rect x='206' y='26' width='112' height='40' rx='10' fill='var(--bad)' opacity='0.6' stroke='var(--line)' stroke-width='2'/>" +
  "<text x='262' y='51' text-anchor='middle' fill='var(--ink)' font-size='12' font-weight='700'>Wedge-tailed eagle</text>" +
  "</g>" +
  "</svg>",
  parts:[
    { id:"producers", label:"Producers", hx:97, hy:270, role:"Autotrophs that fix light energy into organic compounds — trophic level 1", accept:["producers","producer","autotroph"] },
    { id:"primary", label:"Primary consumers", hx:108, hy:185, role:"Herbivores that eat producers — trophic level 2", accept:["primary consumers","primary consumer","herbivore"] },
    { id:"secondary", label:"Secondary consumers", hx:172, hy:113, role:"Carnivores that eat primary consumers — trophic level 3", accept:["secondary consumers","secondary consumer"] },
    { id:"tertiary", label:"Tertiary consumer", hx:262, hy:46, role:"Top predator eating secondary consumers — trophic level 4", accept:["tertiary consumer","top predator","apex predator"] }
  ]
};

BIO.DATA.diagrams.energyPyramid = {
  id:"energyPyramid", title:"Pyramid of energy", mod:"M4", topic:"Energy flow",
  svg:
  "<svg viewBox='0 0 420 280'>" +
  "<path id='pyrProducers' d='M20 244 l380 0 l-38 -50 l-304 0 z' fill='var(--good)' opacity='0.75' stroke='var(--line)' stroke-width='2'/>" +
  "<text x='210' y='226' text-anchor='middle' fill='var(--accent-ink)' font-size='13' font-weight='700'>Producers  1 000 000 kJ</text>" +
  "<path id='pyrPrimary' d='M58 194 l304 0 l-38 -50 l-228 0 z' fill='var(--info)' opacity='0.7' stroke='var(--line)' stroke-width='2'/>" +
  "<text x='210' y='176' text-anchor='middle' fill='var(--ink)' font-size='13' font-weight='700'>Primary  100 000 kJ</text>" +
  "<path id='pyrSecondary' d='M96 144 l228 0 l-38 -50 l-152 0 z' fill='var(--warn)' opacity='0.7' stroke='var(--line)' stroke-width='2'/>" +
  "<text x='210' y='126' text-anchor='middle' fill='var(--ink)' font-size='12' font-weight='700'>Secondary  10 000 kJ</text>" +
  "<path id='pyrTertiary' d='M134 94 l152 0 l-38 -50 l-76 0 z' fill='var(--bad)' opacity='0.7' stroke='var(--line)' stroke-width='2'/>" +
  "<text x='210' y='76' text-anchor='middle' fill='var(--ink)' font-size='11' font-weight='700'>Tertiary  1000 kJ</text>" +
  "<path id='heatLoss' d='M392 216 q18 -10 0 -20 M392 166 q18 -10 0 -20 M392 116 q18 -10 0 -20' fill='none' stroke='var(--bad)' stroke-width='3' stroke-linecap='round'/>" +
  "<text x='412' y='268' text-anchor='end' fill='var(--bad)' font-size='11' font-weight='700'>heat lost (~90%)</text>" +
  "</svg>",
  parts:[
    { id:"pyrProducers", label:"Producer level", hx:210, hy:220, role:"Fixes about 1–2% of incident light energy into biomass", accept:["producers","producer level","trophic level 1"] },
    { id:"pyrPrimary", label:"Primary consumer level", hx:210, hy:170, role:"Receives roughly 10% of the energy in the level below", accept:["primary consumers","primary consumer level"] },
    { id:"pyrSecondary", label:"Secondary consumer level", hx:210, hy:120, role:"Roughly 10% again — energy falls by an order of magnitude at each step", accept:["secondary consumers","secondary consumer level"] },
    { id:"pyrTertiary", label:"Tertiary consumer level", hx:210, hy:70, role:"So little energy remains that few food chains extend beyond this level", accept:["tertiary consumers","tertiary consumer level"] },
    { id:"heatLoss", label:"Heat loss", hx:396, hy:180, role:"Most energy is lost as heat from respiration, plus losses in faeces and excretion", accept:["heat loss","heat","energy lost"] }
  ]
};

BIO.DATA.diagrams.quadrat = {
  id:"quadrat", title:"Quadrat sampling", mod:"M4", topic:"Sampling",
  svg:
  "<svg viewBox='0 0 400 320'>" +
  "<rect x='16' y='16' width='368' height='288' rx='10' fill='var(--card-2)' stroke='var(--line-soft)' stroke-width='2'/>" +
  "<line id='axisX' x1='16' y1='304' x2='384' y2='304' stroke='var(--accent)' stroke-width='4'/>" +
  "<line id='axisY' x1='16' y1='16' x2='16' y2='304' stroke='var(--accent)' stroke-width='4'/>" +
  "<g fill='var(--good)'>" +
  "<circle cx='60' cy='60' r='6'/><circle cx='96' cy='92' r='6'/><circle cx='150' cy='54' r='6'/><circle cx='210' cy='96' r='6'/>" +
  "<circle cx='264' cy='60' r='6'/><circle cx='320' cy='104' r='6'/><circle cx='70' cy='160' r='6'/><circle cx='130' cy='190' r='6'/>" +
  "<circle cx='190' cy='150' r='6'/><circle cx='250' cy='196' r='6'/><circle cx='310' cy='164' r='6'/><circle cx='90' cy='250' r='6'/>" +
  "<circle cx='160' cy='268' r='6'/><circle cx='230' cy='244' r='6'/><circle cx='300' cy='272' r='6'/><circle cx='352' cy='210' r='6'/>" +
  "<circle cx='44' cy='214' r='6'/><circle cx='196' cy='214' r='6'/><circle cx='268' cy='140' r='6'/><circle cx='120' cy='120' r='6'/>" +
  "</g>" +
  "<rect id='quadratA' x='78' y='72' width='72' height='72' fill='none' stroke='var(--warn)' stroke-width='4'/>" +
  "<rect id='quadratB' x='214' y='168' width='72' height='72' fill='none' stroke='var(--warn)' stroke-width='4'/>" +
  "<rect id='quadratC' x='286' y='40' width='72' height='72' fill='none' stroke='var(--warn)' stroke-width='4'/>" +
  "<text x='200' y='318' text-anchor='middle' fill='var(--ink-3)' font-size='11'>coordinates chosen with a random number generator</text>" +
  "</svg>",
  parts:[
    { id:"quadratA", label:"Quadrat", hx:114, hy:108, role:"A frame of known area within which organisms are counted or cover is estimated", accept:["quadrat"] },
    { id:"axisX", label:"Horizontal axis", hx:200, hy:304, role:"Tape measure providing the x coordinate for random placement", accept:["horizontal axis","x axis","tape measure"] },
    { id:"axisY", label:"Vertical axis", hx:16, hy:160, role:"Tape measure providing the y coordinate for random placement", accept:["vertical axis","y axis"] },
    { id:"quadratC", label:"Replicate quadrat", hx:322, hy:76, role:"Repeats improve reliability by reducing the effect of random variation", accept:["replicate quadrat","replicate","repeat"] }
  ]
};

BIO.DATA.diagrams.transect = {
  id:"transect", title:"Belt transect up a rocky shore", mod:"M4", topic:"Sampling",
  svg:
  "<svg viewBox='0 0 440 260'>" +
  "<path d='M10 220 l120 -10 l100 -50 l100 -60 l100 -40 l0 190 l-420 0 z' fill='var(--card-3)' stroke='var(--line)' stroke-width='2'/>" +
  "<path id='water' d='M10 220 l120 -10 l0 50 l-120 0 z' fill='var(--info)' opacity='0.4'/>" +
  "<line id='transectLine' x1='24' y1='214' x2='420' y2='60' stroke='var(--accent)' stroke-width='4' stroke-dasharray='10 6'/>" +
  "<g id='transectQuadrats' fill='none' stroke='var(--warn)' stroke-width='3'>" +
  "<rect x='44' y='186' width='36' height='30'/><rect x='138' y='166' width='36' height='30'/>" +
  "<rect x='230' y='128' width='36' height='30'/><rect x='320' y='92' width='36' height='30'/>" +
  "<rect x='386' y='54' width='36' height='30'/>" +
  "</g>" +
  "<g fill='var(--good)'>" +
  "<circle cx='56' cy='202' r='4'/><circle cx='68' cy='196' r='4'/><circle cx='62' cy='208' r='4'/>" +
  "<circle cx='150' cy='180' r='4'/><circle cx='162' cy='174' r='4'/>" +
  "<circle cx='244' cy='142' r='4'/>" +
  "</g>" +
  "<g fill='var(--violet)'>" +
  "<circle cx='332' cy='106' r='4'/><circle cx='344' cy='100' r='4'/><circle cx='398' cy='68' r='4'/><circle cx='410' cy='62' r='4'/><circle cx='404' cy='74' r='4'/>" +
  "</g>" +
  "<text x='30' y='250' fill='var(--ink-3)' font-size='11'>low shore</text>" +
  "<text x='368' y='40' fill='var(--ink-3)' font-size='11'>high shore</text>" +
  "</svg>",
  parts:[
    { id:"transectLine", label:"Transect line", hx:220, hy:138, role:"Line laid along an environmental gradient; samples are taken at intervals along it", accept:["transect line","transect"] },
    { id:"transectQuadrats", label:"Quadrats along the transect", hx:150, hy:180, role:"Placed at fixed intervals so change in the community with distance can be recorded", accept:["quadrats","quadrat"] },
    { id:"water", label:"Water line", hx:66, hy:236, role:"The gradient of emersion time is the abiotic factor driving zonation on the shore", accept:["water line","water","sea","tide"] }
  ]
};

BIO.DATA.diagrams.defence = {
  id:"defence", title:"Three lines of defence", mod:"M7", topic:"Defence",
  svg:
  "<svg viewBox='0 0 440 280'>" +
  "<rect id='firstLine' x='16' y='20' width='408' height='68' rx='14' fill='var(--good)' opacity='0.28' stroke='var(--good)' stroke-width='3'/>" +
  "<text x='34' y='46' fill='var(--good)' font-size='13' font-weight='800'>FIRST LINE — non-specific barriers</text>" +
  "<text x='34' y='70' fill='var(--ink-2)' font-size='12'>skin · mucous membranes · cilia · stomach acid · lysozyme</text>" +
  "<rect id='secondLine' x='16' y='104' width='408' height='68' rx='14' fill='var(--warn)' opacity='0.28' stroke='var(--warn)' stroke-width='3'/>" +
  "<text x='34' y='130' fill='var(--warn)' font-size='13' font-weight='800'>SECOND LINE — non-specific internal</text>" +
  "<text x='34' y='154' fill='var(--ink-2)' font-size='12'>phagocytosis · inflammation · fever · complement</text>" +
  "<rect id='thirdLine' x='16' y='188' width='408' height='72' rx='14' fill='var(--info)' opacity='0.28' stroke='var(--info)' stroke-width='3'/>" +
  "<text x='34' y='214' fill='var(--info)' font-size='13' font-weight='800'>THIRD LINE — specific adaptive</text>" +
  "<text x='34' y='238' fill='var(--ink-2)' font-size='12'>B cells &amp; antibodies · T cells · MEMORY CELLS</text>" +
  "<path id='breach' d='M400 88 l0 12 M394 96 l6 8 l6 -8' fill='none' stroke='var(--bad)' stroke-width='3' stroke-linecap='round'/>" +
  "<path d='M400 172 l0 12 M394 180 l6 8 l6 -8' fill='none' stroke='var(--bad)' stroke-width='3' stroke-linecap='round'/>" +
  "</svg>",
  parts:[
    { id:"firstLine", label:"First line of defence", hx:220, hy:54, role:"Non-specific barriers preventing pathogens entering the body at all", accept:["first line","first line of defence","barriers"] },
    { id:"secondLine", label:"Second line of defence", hx:220, hy:138, role:"Non-specific internal response once a pathogen has entered", accept:["second line","second line of defence"] },
    { id:"thirdLine", label:"Third line of defence", hx:220, hy:224, role:"Specific adaptive immunity — the only line producing memory cells", accept:["third line","third line of defence","adaptive immunity"] },
    { id:"breach", label:"Breach point", hx:400, hy:96, role:"Where a pathogen gets past one line, the next responds", accept:["breach","breach point","entry"] }
  ],
  sequence:["firstLine","secondLine","thirdLine"]
};

BIO.DATA.diagrams.antibody = {
  id:"antibody", title:"Antibody structure", mod:"M7", topic:"Immunity",
  svg:
  "<svg viewBox='0 0 400 300'>" +
  "<path id='heavyChain' d='M200 280 l0 -110 l-72 -80 M200 170 l72 -80' fill='none' stroke='var(--info)' stroke-width='22' stroke-linecap='round' stroke-linejoin='round'/>" +
  "<path id='lightChain' d='M160 132 l-58 -66 M240 132 l58 -66' fill='none' stroke='var(--violet)' stroke-width='16' stroke-linecap='round'/>" +
  "<path id='variableRegion' d='M128 90 l-26 -24 M272 90 l26 -24' fill='none' stroke='var(--warn)' stroke-width='24' stroke-linecap='round'/>" +
  "<path id='constantRegion' d='M200 280 l0 -60' fill='none' stroke='var(--good)' stroke-width='24' stroke-linecap='round'/>" +
  "<path id='antigenBindingSite' d='M92 60 l-14 -14 M108 46 l-16 -14' fill='none' stroke='var(--bad)' stroke-width='6' stroke-linecap='round'/>" +
  "<path d='M292 46 l16 -14 M308 60 l14 -14' fill='none' stroke='var(--bad)' stroke-width='6' stroke-linecap='round'/>" +
  "<path id='hinge' d='M182 168 l36 0' stroke='var(--ink-3)' stroke-width='6' stroke-linecap='round'/>" +
  "<polygon id='antigen' points='78,30 58,10 92,4 100,26' fill='var(--bad)' opacity='0.8' stroke='var(--line)' stroke-width='1.5'/>" +
  "</svg>",
  parts:[
    { id:"heavyChain", label:"Heavy chain", hx:200, hy:240, role:"The two longer polypeptide chains forming the Y's stem and part of each arm", accept:["heavy chain","heavy chains"] },
    { id:"lightChain", label:"Light chain", hx:132, hy:104, role:"The two shorter polypeptide chains, one on each arm", accept:["light chain","light chains"] },
    { id:"variableRegion", label:"Variable region", hx:112, hy:76, role:"Differs between antibodies; its shape determines which antigen is bound", accept:["variable region","variable regions"] },
    { id:"antigenBindingSite", label:"Antigen binding site", hx:92, hy:48, role:"The pocket complementary to one specific antigen — the source of antibody specificity", accept:["antigen binding site","binding site","antigen-binding site"] },
    { id:"constantRegion", label:"Constant region", hx:200, hy:252, role:"Identical within an antibody class; binds phagocytes and complement proteins", accept:["constant region"] },
    { id:"hinge", label:"Hinge region", hx:200, hy:168, role:"Flexible joint allowing the arms to move so both can bind antigen", accept:["hinge","hinge region"] },
    { id:"antigen", label:"Antigen", hx:80, hy:18, role:"The molecule recognised as non-self, usually on a pathogen's surface", accept:["antigen"] }
  ]
};

BIO.DATA.diagrams.epiCurve = {
  id:"epiCurve", title:"Epidemic curve", mod:"M8", topic:"Epidemiology", tags:["epidemiology"],
  svg:
  "<svg viewBox='0 0 440 280'>" +
  "<line id='epiY' x1='50' y1='24' x2='50' y2='236' stroke='var(--ink-2)' stroke-width='2.5'/>" +
  "<line id='epiX' x1='50' y1='236' x2='420' y2='236' stroke='var(--ink-2)' stroke-width='2.5'/>" +
  "<text x='24' y='130' fill='var(--ink-3)' font-size='11' transform='rotate(-90 24 130)'>new cases</text>" +
  "<text x='235' y='266' text-anchor='middle' fill='var(--ink-3)' font-size='11'>days since first case</text>" +
  "<g id='bars' fill='var(--accent)' opacity='0.85'>" +
  "<rect x='62' y='224' width='18' height='12'/><rect x='84' y='210' width='18' height='26'/>" +
  "<rect x='106' y='178' width='18' height='58'/><rect x='128' y='128' width='18' height='108'/>" +
  "<rect x='150' y='72' width='18' height='164'/><rect x='172' y='106' width='18' height='130'/>" +
  "<rect x='194' y='158' width='18' height='78'/><rect x='216' y='196' width='18' height='40'/>" +
  "<rect x='238' y='216' width='18' height='20'/><rect x='260' y='228' width='18' height='8'/>" +
  "</g>" +
  "<line id='exposure' x1='104' y1='24' x2='104' y2='236' stroke='var(--bad)' stroke-width='2.5' stroke-dasharray='7 5'/>" +
  "<text x='110' y='40' fill='var(--bad)' font-size='11' font-weight='700'>common exposure</text>" +
  "<path id='peak' d='M159 62 l0 -14 M153 54 l6 -8 l6 8' fill='none' stroke='var(--warn)' stroke-width='2.5' stroke-linecap='round'/>" +
  "<text x='196' y='44' fill='var(--warn)' font-size='11' font-weight='700'>single peak</text>" +
  "<path id='tail' d='M290 232 q40 -4 66 -2' fill='none' stroke='var(--ink-3)' stroke-width='2' stroke-dasharray='4 4'/>" +
  "</svg>",
  parts:[
    { id:"epiX", label:"Time axis", hx:235, hy:236, role:"Days since the first case; the spacing of peaks reveals the incubation period", accept:["time axis","x axis","days"] },
    { id:"epiY", label:"Case axis", hx:50, hy:130, role:"Number of NEW cases per day — incidence, not prevalence", accept:["case axis","y axis","cases","incidence"] },
    { id:"bars", label:"Case bars", hx:150, hy:150, role:"Each bar is the count of new cases reported that day", accept:["bars","case bars","cases"] },
    { id:"exposure", label:"Exposure point", hx:104, hy:130, role:"When the common source exposure occurred, one incubation period before the peak", accept:["exposure","exposure point","source"] },
    { id:"peak", label:"Single peak", hx:159, hy:56, role:"A single sharp peak indicates a point-source outbreak rather than person-to-person spread", accept:["peak","single peak"] },
    { id:"tail", label:"Tail", hx:320, hy:230, role:"A long tail may indicate secondary person-to-person transmission from the original cases", accept:["tail"] }
  ]
};

BIO.DATA.diagrams.doseResponse = {
  id:"doseResponse", title:"Dose-response relationship", mod:"M8", topic:"Epidemiology", tags:["epidemiology"],
  svg:
  "<svg viewBox='0 0 440 280'>" +
  "<line id='drY' x1='54' y1='24' x2='54' y2='232' stroke='var(--ink-2)' stroke-width='2.5'/>" +
  "<line id='drX' x1='54' y1='232' x2='420' y2='232' stroke='var(--ink-2)' stroke-width='2.5'/>" +
  "<text x='26' y='140' fill='var(--ink-3)' font-size='11' transform='rotate(-90 26 140)'>relative risk</text>" +
  "<text x='237' y='262' text-anchor='middle' fill='var(--ink-3)' font-size='11'>exposure (cigarettes per day)</text>" +
  "<path id='curve' d='M54 218 q80 -18 130 -54 q54 -38 100 -74 q40 -30 132 -46' fill='none' stroke='var(--bad)' stroke-width='4' stroke-linecap='round'/>" +
  "<g id='dataPoints' fill='var(--bad)'>" +
  "<circle cx='54' cy='218' r='6'/><circle cx='120' cy='196' r='6'/><circle cx='186' cy='160' r='6'/>" +
  "<circle cx='252' cy='112' r='6'/><circle cx='318' cy='76' r='6'/><circle cx='384' cy='48' r='6'/>" +
  "</g>" +
  "<line id='baseline' x1='54' y1='218' x2='420' y2='218' stroke='var(--ink-3)' stroke-width='1.8' stroke-dasharray='6 5'/>" +
  "<text x='330' y='212' fill='var(--ink-3)' font-size='11'>unexposed baseline</text>" +
  "<path id='gradient' d='M170 130 l70 -50' stroke='var(--warn)' stroke-width='2.5' stroke-dasharray='5 4' fill='none'/>" +
  "<text x='140' y='120' fill='var(--warn)' font-size='11' font-weight='700'>graded rise</text>" +
  "</svg>",
  parts:[
    { id:"drX", label:"Exposure axis", hx:237, hy:232, role:"The dose — how much of the exposure each group received", accept:["exposure axis","x axis","dose"] },
    { id:"drY", label:"Risk axis", hx:54, hy:140, role:"Relative risk compared with the unexposed group", accept:["risk axis","y axis","relative risk"] },
    { id:"curve", label:"Dose-response curve", hx:200, hy:140, role:"Risk rising steadily with dose — hard to explain by confounding alone, so it strengthens a causal claim", accept:["dose response curve","curve","dose-response curve"] },
    { id:"baseline", label:"Unexposed baseline", hx:340, hy:218, role:"Relative risk of 1 in the group with no exposure — the comparison group", accept:["baseline","unexposed baseline","control"] },
    { id:"dataPoints", label:"Data points", hx:252, hy:112, role:"Each point is one exposure category with its measured risk", accept:["data points","points","data"] }
  ]
};
