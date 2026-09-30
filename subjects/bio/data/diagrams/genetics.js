/* Diagrams — DNA, cell division and molecular biology (M5, M6). */
window.BIO = window.BIO || {}; BIO.DATA = BIO.DATA || {};
BIO.DATA.diagrams = BIO.DATA.diagrams || {};

BIO.DATA.diagrams.dna = {
  id:"dna", title:"DNA structure", mod:"M5", topic:"DNA",
  svg:
  "<svg viewBox='0 0 420 300'>" +
  "<path id='backbone' d='M70 20 q46 34 0 68 q-46 34 0 68 q46 34 0 68 q-46 34 0 56' fill='none' stroke='var(--info)' stroke-width='9' stroke-linecap='round'/>" +
  "<path d='M330 20 q-46 34 0 68 q46 34 0 68 q-46 34 0 68 q46 34 0 56' fill='none' stroke='var(--info)' stroke-width='9' stroke-linecap='round'/>" +
  "<g stroke-width='7' stroke-linecap='round'>" +
  "<line id='pairAT' x1='84' y1='58' x2='196' y2='58' stroke='var(--good)'/><line x1='204' y1='58' x2='316' y2='58' stroke='var(--warn)'/>" +
  "<line x1='84' y1='112' x2='190' y2='112' stroke='var(--violet)'/><line x1='198' y1='112' x2='316' y2='112' stroke='var(--bad)'/>" +
  "<line x1='84' y1='166' x2='196' y2='166' stroke='var(--warn)'/><line x1='204' y1='166' x2='316' y2='166' stroke='var(--good)'/>" +
  "<line x1='84' y1='220' x2='190' y2='220' stroke='var(--bad)'/><line x1='198' y1='220' x2='316' y2='220' stroke='var(--violet)'/>" +
  "</g>" +
  "<circle id='sugar' cx='72' cy='58' r='11' fill='var(--info)' stroke='var(--bg)' stroke-width='2'/>" +
  "<circle id='phosphate' cx='80' cy='85' r='9' fill='var(--accent)' stroke='var(--bg)' stroke-width='2'/>" +
  "<rect id='hbond' x='188' y='108' width='14' height='9' rx='4' fill='var(--ink-3)'/>" +
  "<text x='140' y='50' text-anchor='middle' fill='var(--good)' font-size='13' font-weight='700'>A</text>" +
  "<text x='260' y='50' text-anchor='middle' fill='var(--warn)' font-size='13' font-weight='700'>T</text>" +
  "<text x='138' y='104' text-anchor='middle' fill='var(--violet)' font-size='13' font-weight='700'>C</text>" +
  "<text x='258' y='104' text-anchor='middle' fill='var(--bad)' font-size='13' font-weight='700'>G</text>" +
  "<text x='140' y='158' text-anchor='middle' fill='var(--warn)' font-size='13' font-weight='700'>T</text>" +
  "<text x='260' y='158' text-anchor='middle' fill='var(--good)' font-size='13' font-weight='700'>A</text>" +
  "<text x='380' y='30' fill='var(--ink-3)' font-size='11'>5'</text>" +
  "<text x='380' y='286' fill='var(--ink-3)' font-size='11'>3'</text>" +
  "<text x='24' y='30' fill='var(--ink-3)' font-size='11'>3'</text>" +
  "<text x='24' y='286' fill='var(--ink-3)' font-size='11'>5'</text>" +
  "</svg>",
  parts:[
    { id:"backbone", label:"Sugar-phosphate backbone", hx:70, hy:250, role:"Alternating deoxyribose and phosphate groups forming the two strands", accept:["sugar phosphate backbone","backbone","sugar-phosphate backbone"] },
    { id:"sugar", label:"Deoxyribose", hx:72, hy:58, role:"Five-carbon sugar in each nucleotide; the D in DNA", accept:["deoxyribose","sugar","pentose"] },
    { id:"phosphate", label:"Phosphate group", hx:80, hy:85, role:"Links adjacent sugars and gives DNA its negative charge", accept:["phosphate","phosphate group"] },
    { id:"pairAT", label:"A–T base pair", hx:140, hy:58, role:"Adenine pairs with thymine by two hydrogen bonds", accept:["a-t base pair","adenine thymine","at pair","base pair"] },
    { id:"hbond", label:"Hydrogen bonds", hx:195, hy:112, role:"Weak bonds holding the two strands together; easily broken for replication and transcription", accept:["hydrogen bond","hydrogen bonds"] }
  ]
};

BIO.DATA.diagrams.translation = {
  id:"translation", title:"Translation at the ribosome", mod:"M5", topic:"Polypeptide synthesis",
  svg:
  "<svg viewBox='0 0 440 260'>" +
  "<rect id='mrna' x='20' y='170' width='400' height='26' rx='6' fill='var(--card-3)' stroke='var(--info)' stroke-width='2.5'/>" +
  "<g fill='var(--ink-2)' font-size='12' font-weight='700' text-anchor='middle'>" +
  "<text x='50' y='189'>A</text><text x='72' y='189'>U</text><text x='94' y='189'>G</text>" +
  "<text x='128' y='189'>C</text><text x='150' y='189'>C</text><text x='172' y='189'>U</text>" +
  "<text x='206' y='189'>A</text><text x='228' y='189'>A</text><text x='250' y='189'>G</text>" +
  "<text x='284' y='189'>U</text><text x='306' y='189'>U</text><text x='328' y='189'>C</text>" +
  "</g>" +
  "<line x1='110' y1='170' x2='110' y2='196' stroke='var(--info)' stroke-width='1.5'/>" +
  "<line x1='188' y1='170' x2='188' y2='196' stroke='var(--info)' stroke-width='1.5'/>" +
  "<line x1='266' y1='170' x2='266' y2='196' stroke='var(--info)' stroke-width='1.5'/>" +
  "<path id='ribosomeLarge' d='M116 66 q84 -30 168 0 q26 34 0 68 l-168 0 q-26 -34 0 -68 z' fill='var(--good)' opacity='0.45' stroke='var(--line)' stroke-width='2'/>" +
  "<path id='ribosomeSmall' d='M116 140 q84 30 168 0 q10 18 -10 28 l-148 0 q-20 -10 -10 -28 z' fill='var(--good)' opacity='0.7' stroke='var(--line)' stroke-width='2'/>" +
  "<path id='trna' d='M150 90 l0 46 l-12 20 l36 0 l-12 -20 l0 -46 q-6 -14 -18 -8 M150 90 q6 -14 18 -8' fill='none' stroke='var(--violet)' stroke-width='4' stroke-linecap='round'/>" +
  "<text id='anticodon' x='150' y='166' text-anchor='middle' fill='var(--violet)' font-size='11' font-weight='700'>GGA</text>" +
  "<circle id='aminoAcid' cx='150' cy='72' r='13' fill='var(--warn)' stroke='var(--line)' stroke-width='2'/>" +
  "<circle cx='104' cy='48' r='13' fill='var(--warn)' opacity='0.8' stroke='var(--line)' stroke-width='2'/>" +
  "<circle cx='70' cy='34' r='13' fill='var(--warn)' opacity='0.6' stroke='var(--line)' stroke-width='2'/>" +
  "<path id='polypeptide' d='M138 66 q-14 -14 -30 -18 q-16 -4 -32 -14' fill='none' stroke='var(--warn)' stroke-width='4' stroke-linecap='round'/>" +
  "<path d='M360 130 l40 0 M390 122 l10 8 l-10 8' fill='none' stroke='var(--ink-3)' stroke-width='3' stroke-linecap='round'/>" +
  "</svg>",
  parts:[
    { id:"mrna", label:"mRNA", hx:360, hy:183, role:"Carries the copied gene sequence from the nucleus, read in triplets called codons", accept:["mrna","messenger rna"] },
    { id:"ribosomeLarge", label:"Ribosome", hx:230, hy:96, role:"Holds mRNA and tRNA in position and catalyses peptide bond formation", accept:["ribosome","large subunit","ribosome subunit"] },
    { id:"trna", label:"tRNA", hx:154, hy:120, role:"Carries a specific amino acid; its anticodon pairs with the mRNA codon", accept:["trna","transfer rna"] },
    { id:"anticodon", label:"Anticodon", hx:150, hy:160, role:"Triplet complementary to the mRNA codon; this is what enforces the genetic code", accept:["anticodon"] },
    { id:"aminoAcid", label:"Amino acid", hx:150, hy:72, role:"The building block delivered by tRNA and added to the growing chain", accept:["amino acid"] },
    { id:"polypeptide", label:"Growing polypeptide", hx:88, hy:42, role:"Chain of amino acids joined by peptide bonds; folds into the functional protein", accept:["polypeptide","growing polypeptide","protein chain"] }
  ]
};

BIO.DATA.diagrams.mitosis = {
  id:"mitosis", title:"Mitosis", mod:"M5", topic:"Cell replication",
  svg:
  "<svg viewBox='0 0 440 240'>" +
  "<circle id='prophase' cx='66' cy='90' r='52' fill='var(--card-2)' stroke='var(--accent)' stroke-width='3'/>" +
  "<path d='M44 70 l14 30 M52 66 l14 30 M76 68 l-12 32 M86 74 l-12 32' stroke='var(--violet)' stroke-width='5' stroke-linecap='round' fill='none'/>" +
  "<text x='66' y='166' text-anchor='middle' fill='var(--ink-2)' font-size='12' font-weight='700'>1</text>" +
  "<circle id='metaphase' cx='176' cy='90' r='52' fill='var(--card-2)' stroke='var(--accent)' stroke-width='3'/>" +
  "<line x1='176' y1='48' x2='176' y2='132' stroke='var(--line)' stroke-width='1.5' stroke-dasharray='4 4'/>" +
  "<path d='M162 66 l0 24 M162 96 l0 24 M190 66 l0 24 M190 96 l0 24' stroke='var(--violet)' stroke-width='5' stroke-linecap='round'/>" +
  "<path d='M132 90 l24 -22 M132 90 l24 22 M220 90 l-24 -22 M220 90 l-24 22' stroke='var(--warn)' stroke-width='1.8' fill='none'/>" +
  "<text x='176' y='166' text-anchor='middle' fill='var(--ink-2)' font-size='12' font-weight='700'>2</text>" +
  "<circle id='anaphase' cx='286' cy='90' r='52' fill='var(--card-2)' stroke='var(--accent)' stroke-width='3'/>" +
  "<path d='M256 62 l0 22 M256 92 l0 22 M316 62 l0 22 M316 92 l0 22' stroke='var(--violet)' stroke-width='5' stroke-linecap='round'/>" +
  "<path d='M270 88 l-14 0 M302 88 l14 0' stroke='var(--warn)' stroke-width='2' fill='none'/>" +
  "<text x='286' y='166' text-anchor='middle' fill='var(--ink-2)' font-size='12' font-weight='700'>3</text>" +
  "<path id='telophase' d='M348 90 a44 44 0 0 1 44 -44 a44 44 0 0 1 0 88 a44 44 0 0 1 -44 -44 z' fill='var(--card-2)' stroke='var(--accent)' stroke-width='3'/>" +
  "<circle cx='378' cy='68' r='16' fill='var(--card-3)' stroke='var(--violet)' stroke-width='2.5'/>" +
  "<circle cx='404' cy='112' r='16' fill='var(--card-3)' stroke='var(--violet)' stroke-width='2.5'/>" +
  "<text x='392' y='166' text-anchor='middle' fill='var(--ink-2)' font-size='12' font-weight='700'>4</text>" +
  "</svg>",
  parts:[
    { id:"prophase", label:"Prophase", hx:66, hy:90, role:"Chromosomes condense and become visible; the nuclear envelope breaks down and the spindle forms", accept:["prophase"] },
    { id:"metaphase", label:"Metaphase", hx:176, hy:90, role:"Chromosomes line up individually along the equator, attached to spindle fibres at their centromeres", accept:["metaphase"] },
    { id:"anaphase", label:"Anaphase", hx:286, hy:90, role:"Sister chromatids are pulled apart to opposite poles by the shortening spindle fibres", accept:["anaphase"] },
    { id:"telophase", label:"Telophase", hx:392, hy:90, role:"Chromosomes decondense at the poles and two new nuclear envelopes form, followed by cytokinesis", accept:["telophase"] }
  ],
  sequence:["prophase","metaphase","anaphase","telophase"]
};

BIO.DATA.diagrams.meiosis = {
  id:"meiosis", title:"Meiosis and crossing over", mod:"M5", topic:"Cell replication",
  svg:
  "<svg viewBox='0 0 440 300'>" +
  "<circle id='mProphaseI' cx='72' cy='72' r='54' fill='var(--card-2)' stroke='var(--accent)' stroke-width='3'/>" +
  "<path d='M56 44 l0 56 M64 44 l0 56' stroke='var(--violet)' stroke-width='5' stroke-linecap='round'/>" +
  "<path d='M82 44 l0 56 M90 44 l0 56' stroke='var(--good)' stroke-width='5' stroke-linecap='round'/>" +
  "<path id='chiasma' d='M64 66 q9 8 18 0' stroke='var(--warn)' stroke-width='3.5' fill='none'/>" +
  "<circle id='mMetaphaseI' cx='216' cy='72' r='54' fill='var(--card-2)' stroke='var(--accent)' stroke-width='3'/>" +
  "<line x1='216' y1='30' x2='216' y2='114' stroke='var(--line)' stroke-width='1.5' stroke-dasharray='4 4'/>" +
  "<path d='M196 46 l0 22 M204 46 l0 22' stroke='var(--violet)' stroke-width='5' stroke-linecap='round'/>" +
  "<path d='M196 80 l0 22 M204 80 l0 22' stroke='var(--good)' stroke-width='5' stroke-linecap='round'/>" +
  "<path d='M230 46 l0 22 M238 46 l0 22' stroke='var(--good)' stroke-width='5' stroke-linecap='round'/>" +
  "<path d='M230 80 l0 22 M238 80 l0 22' stroke='var(--violet)' stroke-width='5' stroke-linecap='round'/>" +
  "<circle id='mTelophaseI' cx='360' cy='72' r='30' fill='var(--card-2)' stroke='var(--accent)' stroke-width='3'/>" +
  "<circle cx='412' cy='72' r='30' fill='var(--card-2)' stroke='var(--accent)' stroke-width='3'/>" +
  "<path d='M354 58 l0 28 M366 58 l0 28' stroke='var(--violet)' stroke-width='4.5' stroke-linecap='round'/>" +
  "<path d='M406 58 l0 28 M418 58 l0 28' stroke='var(--good)' stroke-width='4.5' stroke-linecap='round'/>" +
  "<g id='gametes'>" +
  "<circle cx='96' cy='232' r='30' fill='var(--card-2)' stroke='var(--good)' stroke-width='3'/><path d='M96 218 l0 28' stroke='var(--violet)' stroke-width='4.5' stroke-linecap='round'/>" +
  "<circle cx='176' cy='232' r='30' fill='var(--card-2)' stroke='var(--good)' stroke-width='3'/><path d='M176 218 l0 28' stroke='var(--violet)' stroke-width='4.5' stroke-linecap='round'/>" +
  "<circle cx='256' cy='232' r='30' fill='var(--card-2)' stroke='var(--good)' stroke-width='3'/><path d='M256 218 l0 28' stroke='var(--good)' stroke-width='4.5' stroke-linecap='round'/>" +
  "<circle cx='336' cy='232' r='30' fill='var(--card-2)' stroke='var(--good)' stroke-width='3'/><path d='M336 218 l0 28' stroke='var(--good)' stroke-width='4.5' stroke-linecap='round'/>" +
  "</g>" +
  "<path d='M216 130 l0 62 M210 186 l6 8 l6 -8' fill='none' stroke='var(--ink-3)' stroke-width='2.5' stroke-linecap='round'/>" +
  "<text x='216' y='288' text-anchor='middle' fill='var(--ink-3)' font-size='12'>four genetically different haploid cells</text>" +
  "</svg>",
  parts:[
    { id:"mProphaseI", label:"Prophase I", hx:72, hy:72, role:"Homologous chromosomes pair as bivalents and crossing over occurs at chiasmata", accept:["prophase i","prophase 1"] },
    { id:"chiasma", label:"Chiasma", hx:73, hy:66, role:"Point where non-sister chromatids exchange segments, producing recombinant chromatids", accept:["chiasma","chiasmata","crossing over"] },
    { id:"mMetaphaseI", label:"Metaphase I", hx:216, hy:72, role:"Homologous PAIRS line up at the equator, each pair orienting independently", accept:["metaphase i","metaphase 1"] },
    { id:"mTelophaseI", label:"Telophase I", hx:360, hy:72, role:"Homologues have separated into two haploid cells; sister chromatids remain joined", accept:["telophase i","telophase 1"] },
    { id:"gametes", label:"Four haploid gametes", hx:176, hy:232, role:"Products of meiosis II — four genetically different cells with half the chromosome number", accept:["gametes","four gametes","haploid gametes"] }
  ]
};

BIO.DATA.diagrams.pcr = {
  id:"pcr", title:"Polymerase chain reaction", mod:"M6", topic:"Biotechnology", tags:["biotech"],
  svg:
  "<svg viewBox='0 0 440 280'>" +
  "<g id='denature'>" +
  "<rect x='20' y='34' width='110' height='12' rx='6' fill='var(--info)'/>" +
  "<rect x='20' y='74' width='110' height='12' rx='6' fill='var(--info)'/>" +
  "<text x='75' y='24' text-anchor='middle' fill='var(--ink-2)' font-size='12' font-weight='700'>95 °C</text>" +
  "</g>" +
  "<g id='anneal'>" +
  "<rect x='165' y='34' width='110' height='12' rx='6' fill='var(--info)'/>" +
  "<rect x='165' y='34' width='30' height='12' rx='6' fill='var(--warn)'/>" +
  "<rect x='165' y='74' width='110' height='12' rx='6' fill='var(--info)'/>" +
  "<rect x='245' y='74' width='30' height='12' rx='6' fill='var(--warn)'/>" +
  "<text x='220' y='24' text-anchor='middle' fill='var(--ink-2)' font-size='12' font-weight='700'>55 °C</text>" +
  "</g>" +
  "<g id='extend'>" +
  "<rect x='310' y='34' width='110' height='12' rx='6' fill='var(--info)'/>" +
  "<rect x='310' y='34' width='84' height='12' rx='6' fill='var(--good)'/>" +
  "<rect x='310' y='74' width='110' height='12' rx='6' fill='var(--info)'/>" +
  "<rect x='336' y='74' width='84' height='12' rx='6' fill='var(--good)'/>" +
  "<text x='365' y='24' text-anchor='middle' fill='var(--ink-2)' font-size='12' font-weight='700'>72 °C</text>" +
  "</g>" +
  "<circle id='taq' cx='396' cy='58' r='13' fill='var(--violet)' stroke='var(--line)' stroke-width='2'/>" +
  "<text x='75' y='112' text-anchor='middle' fill='var(--ink-3)' font-size='11'>denature</text>" +
  "<text x='220' y='112' text-anchor='middle' fill='var(--ink-3)' font-size='11'>anneal</text>" +
  "<text x='365' y='112' text-anchor='middle' fill='var(--ink-3)' font-size='11'>extend</text>" +
  "<g id='amplification'>" +
  "<rect x='40' y='160' width='40' height='14' rx='6' fill='var(--good)' opacity='0.9'/>" +
  "<rect x='140' y='150' width='40' height='14' rx='6' fill='var(--good)' opacity='0.85'/>" +
  "<rect x='140' y='170' width='40' height='14' rx='6' fill='var(--good)' opacity='0.85'/>" +
  "<rect x='250' y='138' width='36' height='12' rx='6' fill='var(--good)' opacity='0.8'/>" +
  "<rect x='250' y='156' width='36' height='12' rx='6' fill='var(--good)' opacity='0.8'/>" +
  "<rect x='250' y='174' width='36' height='12' rx='6' fill='var(--good)' opacity='0.8'/>" +
  "<rect x='250' y='192' width='36' height='12' rx='6' fill='var(--good)' opacity='0.8'/>" +
  "<rect x='350' y='132' width='32' height='9' rx='4' fill='var(--good)' opacity='0.75'/>" +
  "<rect x='350' y='146' width='32' height='9' rx='4' fill='var(--good)' opacity='0.75'/>" +
  "<rect x='350' y='160' width='32' height='9' rx='4' fill='var(--good)' opacity='0.75'/>" +
  "<rect x='350' y='174' width='32' height='9' rx='4' fill='var(--good)' opacity='0.75'/>" +
  "<rect x='350' y='188' width='32' height='9' rx='4' fill='var(--good)' opacity='0.75'/>" +
  "<rect x='350' y='202' width='32' height='9' rx='4' fill='var(--good)' opacity='0.75'/>" +
  "<rect x='390' y='132' width='32' height='9' rx='4' fill='var(--good)' opacity='0.75'/>" +
  "<rect x='390' y='146' width='32' height='9' rx='4' fill='var(--good)' opacity='0.75'/>" +
  "</g>" +
  "<text x='220' y='240' text-anchor='middle' fill='var(--ink-3)' font-size='12'>copies double each cycle: 1 → 2 → 4 → 8 …</text>" +
  "</svg>",
  parts:[
    { id:"denature", label:"Denaturation", hx:75, hy:60, role:"95 °C breaks the hydrogen bonds, separating the two DNA strands", accept:["denaturation","denature","denaturing"] },
    { id:"anneal", label:"Annealing", hx:220, hy:60, role:"50–65 °C lets primers base-pair with the sequences flanking the target", accept:["annealing","anneal"] },
    { id:"extend", label:"Extension", hx:365, hy:96, role:"72 °C is Taq polymerase's optimum; new complementary strands are built", accept:["extension","extend","elongation"] },
    { id:"taq", label:"Taq polymerase", hx:396, hy:58, role:"Heat-stable DNA polymerase from a hot-spring bacterium; survives the 95 °C step", accept:["taq polymerase","taq","dna polymerase"] },
    { id:"amplification", label:"Exponential amplification", hx:180, hy:170, role:"Each cycle doubles the number of copies, so 30 cycles give roughly a billion", accept:["amplification","exponential amplification","doubling"] }
  ],
  sequence:["denature","anneal","extend"]
};
