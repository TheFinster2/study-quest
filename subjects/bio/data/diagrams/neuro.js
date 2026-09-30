/* Diagrams — neurons, the reflex arc and the eye (M8). */
window.BIO = window.BIO || {}; BIO.DATA = BIO.DATA || {};
BIO.DATA.diagrams = BIO.DATA.diagrams || {};

BIO.DATA.diagrams.neuron = {
  id:"neuron", title:"Motor neuron", mod:"M8", topic:"Nervous system", tags:["disorders"],
  svg:
  "<svg viewBox='0 0 440 220'>" +
  "<circle id='cellBody' cx='84' cy='110' r='38' fill='var(--card-3)' stroke='var(--accent)' stroke-width='3'/>" +
  "<circle id='neuronNucleus' cx='84' cy='110' r='15' fill='var(--violet)' opacity='0.8' stroke='var(--line)' stroke-width='1.5'/>" +
  "<path id='dendrites' d='M56 88 l-30 -24 M50 104 l-36 -6 M52 128 l-34 20 M62 142 l-18 32 M110 80 l16 -28' fill='none' stroke='var(--accent)' stroke-width='5' stroke-linecap='round'/>" +
  "<path d='M26 64 l-12 -10 M26 64 l-2 -16 M14 98 l-12 -6 M18 148 l-14 10' fill='none' stroke='var(--accent)' stroke-width='3.5' stroke-linecap='round'/>" +
  "<path id='axon' d='M122 110 l236 0' fill='none' stroke='var(--info)' stroke-width='10' stroke-linecap='round'/>" +
  "<g id='myelin' fill='var(--warn)' opacity='0.75' stroke='var(--line)' stroke-width='1.5'>" +
  "<rect x='140' y='96' width='46' height='28' rx='12'/>" +
  "<rect x='200' y='96' width='46' height='28' rx='12'/>" +
  "<rect x='260' y='96' width='46' height='28' rx='12'/>" +
  "</g>" +
  "<rect id='nodeOfRanvier' x='188' y='104' width='10' height='12' fill='var(--info)'/>" +
  "<rect x='248' y='104' width='10' height='12' fill='var(--info)'/>" +
  "<path id='axonTerminals' d='M358 110 l32 -24 M358 110 l34 0 M358 110 l32 24' fill='none' stroke='var(--good)' stroke-width='5' stroke-linecap='round'/>" +
  "<circle cx='396' cy='84' r='7' fill='var(--good)'/><circle cx='398' cy='110' r='7' fill='var(--good)'/><circle cx='396' cy='136' r='7' fill='var(--good)'/>" +
  "<path d='M170 168 l60 0 M222 162 l8 6 l-8 6' fill='none' stroke='var(--ink-3)' stroke-width='2.5' stroke-linecap='round'/>" +
  "<text x='200' y='190' text-anchor='middle' fill='var(--ink-3)' font-size='11'>direction of impulse</text>" +
  "</svg>",
  parts:[
    { id:"dendrites", label:"Dendrites", hx:34, hy:96, role:"Receive signals from other neurons and carry them towards the cell body", accept:["dendrites","dendrite"] },
    { id:"cellBody", label:"Cell body", hx:84, hy:110, role:"Contains the nucleus and most organelles; integrates incoming signals", accept:["cell body","soma","cyton"] },
    { id:"neuronNucleus", label:"Nucleus", hx:84, hy:110, role:"Controls the neuron's activities and directs protein synthesis", accept:["nucleus"] },
    { id:"axon", label:"Axon", hx:330, hy:110, role:"Carries the impulse away from the cell body towards the terminals", accept:["axon"] },
    { id:"myelin", label:"Myelin sheath", hx:163, hy:110, role:"Insulating layer that speeds conduction by forcing saltatory transmission", accept:["myelin sheath","myelin","schwann cell"] },
    { id:"nodeOfRanvier", label:"Node of Ranvier", hx:193, hy:110, role:"Gap in the myelin where the impulse is regenerated, so it jumps node to node", accept:["node of ranvier","node","nodes of ranvier"] },
    { id:"axonTerminals", label:"Axon terminals", hx:392, hy:110, role:"Release neurotransmitter into the synapse to signal the next cell", accept:["axon terminals","axon terminal","synaptic knob","terminal"] }
  ]
};

BIO.DATA.diagrams.synapse = {
  id:"synapse", title:"Synapse", mod:"M8", topic:"Nervous system", tags:["disorders"],
  svg:
  "<svg viewBox='0 0 420 280'>" +
  "<path id='presynaptic' d='M40 20 l180 0 q40 0 40 46 l0 60 q0 46 -40 46 l-180 0 z' fill='var(--card-3)' stroke='var(--info)' stroke-width='3'/>" +
  "<path id='postsynaptic' d='M300 20 l80 0 l0 232 l-80 0 q-40 0 -40 -46 l0 -140 q0 -46 40 -46 z' fill='var(--card-3)' stroke='var(--good)' stroke-width='3'/>" +
  "<rect id='synapticCleft' x='262' y='34' width='34' height='168' fill='var(--bg)' opacity='0.6'/>" +
  "<g id='vesicles' fill='none' stroke='var(--violet)' stroke-width='2.5'>" +
  "<circle cx='120' cy='72' r='17'/><circle cx='172' cy='118' r='17'/><circle cx='128' cy='150' r='17'/><circle cx='206' cy='68' r='15'/>" +
  "</g>" +
  "<g fill='var(--violet)'>" +
  "<circle cx='116' cy='68' r='3.5'/><circle cx='124' cy='76' r='3.5'/><circle cx='168' cy='114' r='3.5'/><circle cx='176' cy='122' r='3.5'/>" +
  "<circle cx='124' cy='146' r='3.5'/><circle cx='132' cy='154' r='3.5'/>" +
  "</g>" +
  "<g id='neurotransmitter' fill='var(--violet)'>" +
  "<circle cx='272' cy='72' r='5'/><circle cx='284' cy='96' r='5'/><circle cx='270' cy='126' r='5'/><circle cx='286' cy='156' r='5'/><circle cx='274' cy='184' r='5'/>" +
  "</g>" +
  "<g id='receptors' fill='var(--good)'>" +
  "<rect x='296' y='62' width='14' height='20' rx='4'/><rect x='296' y='112' width='14' height='20' rx='4'/><rect x='296' y='166' width='14' height='20' rx='4'/>" +
  "</g>" +
  "<g id='calciumChannel' fill='var(--warn)'>" +
  "<rect x='250' y='42' width='14' height='18' rx='4'/><rect x='250' y='192' width='14' height='18' rx='4'/>" +
  "</g>" +
  "<text x='120' y='250' fill='var(--ink-3)' font-size='11'>presynaptic neuron</text>" +
  "<text x='320' y='270' fill='var(--ink-3)' font-size='11'>postsynaptic</text>" +
  "</svg>",
  parts:[
    { id:"presynaptic", label:"Presynaptic neuron", hx:120, hy:210, role:"Sends the signal; its terminal releases neurotransmitter when an impulse arrives", accept:["presynaptic neuron","presynaptic","pre-synaptic neuron"] },
    { id:"vesicles", label:"Synaptic vesicles", hx:146, hy:110, role:"Membrane sacs storing neurotransmitter until calcium triggers their fusion", accept:["synaptic vesicles","vesicles","vesicle"] },
    { id:"synapticCleft", label:"Synaptic cleft", hx:279, hy:118, role:"Narrow gap across which neurotransmitter diffuses — the reason transmission is one-way", accept:["synaptic cleft","cleft","synapse gap"] },
    { id:"neurotransmitter", label:"Neurotransmitter", hx:277, hy:126, role:"Chemical messenger diffusing across the cleft to bind receptors", accept:["neurotransmitter","transmitter","acetylcholine"] },
    { id:"receptors", label:"Receptor proteins", hx:303, hy:122, role:"Bind neurotransmitter specifically, opening ion channels in the postsynaptic membrane", accept:["receptors","receptor proteins","receptor"] },
    { id:"calciumChannel", label:"Calcium channel", hx:257, hy:51, role:"Opens when the impulse arrives; calcium influx triggers vesicle fusion", accept:["calcium channel","ca channel","voltage-gated calcium channel"] },
    { id:"postsynaptic", label:"Postsynaptic neuron", hx:344, hy:230, role:"Receives the signal; binding of neurotransmitter may start a new impulse", accept:["postsynaptic neuron","postsynaptic","post-synaptic neuron"] }
  ]
};

BIO.DATA.diagrams.reflexArc = {
  id:"reflexArc", title:"Reflex arc", mod:"M8", topic:"Nervous system", tags:["disorders"],
  svg:
  "<svg viewBox='0 0 440 300'>" +
  "<ellipse id='spinalCord' cx='300' cy='150' rx='58' ry='96' fill='var(--card-2)' stroke='var(--line)' stroke-width='2.5'/>" +
  "<path id='greyMatter' d='M300 82 q-32 12 -26 44 q-8 24 8 40 q18 20 18 52 q0 -32 18 -52 q16 -16 8 -40 q6 -32 -26 -44 z' fill='var(--violet)' opacity='0.4' stroke='var(--violet)' stroke-width='2'/>" +
  "<circle id='receptorCell' cx='40' cy='70' r='22' fill='var(--warn)' opacity='0.75' stroke='var(--line)' stroke-width='2'/>" +
  "<path id='sensoryNeuron' d='M62 74 q90 6 180 26' fill='none' stroke='var(--info)' stroke-width='6' stroke-linecap='round'/>" +
  "<circle cx='190' cy='90' r='11' fill='var(--info)'/>" +
  "<circle id='interneuron' cx='300' cy='150' r='13' fill='var(--violet)' stroke='var(--line)' stroke-width='2'/>" +
  "<path id='motorNeuron' d='M244 200 q90 -12 -180 26' fill='none' stroke='var(--good)' stroke-width='6' stroke-linecap='round'/>" +
  "<rect id='effectorMuscle' x='14' y='206' width='72' height='40' rx='12' fill='var(--good)' opacity='0.7' stroke='var(--line)' stroke-width='2'/>" +
  "<text x='50' y='231' text-anchor='middle' fill='var(--accent-ink)' font-size='11' font-weight='700'>muscle</text>" +
  "<text x='40' y='40' text-anchor='middle' fill='var(--ink-3)' font-size='11'>stimulus</text>" +
  "<path d='M40 24 l0 -14 M34 18 l6 -8 l6 8' fill='none' stroke='var(--bad)' stroke-width='2.5' stroke-linecap='round'/>" +
  "<text x='340' y='290' fill='var(--ink-3)' font-size='11'>spinal cord</text>" +
  "</svg>",
  parts:[
    { id:"receptorCell", label:"Receptor", hx:40, hy:70, role:"Detects the stimulus — for example a pain receptor in the skin", accept:["receptor","sensory receptor","pain receptor"] },
    { id:"sensoryNeuron", label:"Sensory neuron", hx:150, hy:82, role:"Carries the impulse from the receptor to the spinal cord", accept:["sensory neuron","afferent neuron"] },
    { id:"interneuron", label:"Interneuron", hx:300, hy:150, role:"Relays the impulse within the spinal cord, so the response occurs before the brain is involved", accept:["interneuron","relay neuron","connector neuron"] },
    { id:"spinalCord", label:"Spinal cord", hx:300, hy:60, role:"The control centre for the reflex — it does not require the brain", accept:["spinal cord"] },
    { id:"greyMatter", label:"Grey matter", hx:300, hy:110, role:"Contains the cell bodies and synapses of the reflex pathway", accept:["grey matter","gray matter"] },
    { id:"motorNeuron", label:"Motor neuron", hx:150, hy:206, role:"Carries the impulse from the spinal cord to the effector", accept:["motor neuron","efferent neuron"] },
    { id:"effectorMuscle", label:"Effector", hx:50, hy:226, role:"The muscle or gland that carries out the response — here, withdrawing the limb", accept:["effector","muscle","effector muscle"] }
  ],
  sequence:["receptorCell","sensoryNeuron","interneuron","motorNeuron","effectorMuscle"]
};

BIO.DATA.diagrams.eye = {
  id:"eye", title:"The human eye", mod:"M8", topic:"Disorders", tags:["disorders"],
  svg:
  "<svg viewBox='0 0 420 300'>" +
  "<circle id='sclera' cx='210' cy='150' r='124' fill='var(--card-2)' stroke='var(--ink-2)' stroke-width='6'/>" +
  "<circle id='choroid' cx='210' cy='150' r='114' fill='none' stroke='var(--bad)' stroke-width='5'/>" +
  "<circle id='retina' cx='210' cy='150' r='104' fill='none' stroke='var(--violet)' stroke-width='5'/>" +
  "<path id='cornea' d='M92 108 q-42 42 0 84' fill='none' stroke='var(--info)' stroke-width='8' stroke-linecap='round'/>" +
  "<ellipse id='lens' cx='134' cy='150' rx='20' ry='44' fill='var(--info)' opacity='0.5' stroke='var(--line)' stroke-width='2.5'/>" +
  "<path id='iris' d='M96 110 l24 12 M96 190 l24 -12' stroke='var(--warn)' stroke-width='9' fill='none' stroke-linecap='round'/>" +
  "<rect id='pupil' x='84' y='138' width='8' height='24' fill='var(--bg)'/>" +
  "<path id='ciliaryMuscle' d='M126 100 l-14 -12 M126 200 l-14 12' stroke='var(--good)' stroke-width='7' fill='none' stroke-linecap='round'/>" +
  "<circle id='fovea' cx='314' cy='150' r='10' fill='var(--warn)' stroke='var(--line)' stroke-width='1.5'/>" +
  "<circle id='blindSpot' cx='300' cy='202' r='9' fill='var(--ink-3)'/>" +
  "<path id='opticNerve' d='M308 208 q46 22 74 26' fill='none' stroke='var(--good)' stroke-width='14' stroke-linecap='round'/>" +
  "<path id='vitreous' d='M170 150 m0 0' fill='none'/>" +
  "<ellipse cx='215' cy='150' rx='84' ry='92' fill='var(--card-3)' opacity='0.35' id='vitreousHumour'/>" +
  "<path d='M20 150 l58 0 M68 144 l10 6 l-10 6' fill='none' stroke='var(--accent)' stroke-width='3' stroke-linecap='round'/>" +
  "<text x='36' y='138' fill='var(--accent)' font-size='11'>light</text>" +
  "</svg>",
  parts:[
    { id:"cornea", label:"Cornea", hx:78, hy:150, role:"Transparent front layer that does most of the light refraction", accept:["cornea"] },
    { id:"pupil", label:"Pupil", hx:88, hy:150, role:"The opening that lets light into the eye; its size is set by the iris", accept:["pupil"] },
    { id:"iris", label:"Iris", hx:108, hy:116, role:"Muscular ring controlling pupil diameter and therefore how much light enters", accept:["iris"] },
    { id:"lens", label:"Lens", hx:134, hy:150, role:"Changes shape to fine-focus light onto the retina — accommodation", accept:["lens"] },
    { id:"ciliaryMuscle", label:"Ciliary muscle", hx:118, hy:94, role:"Contracts and relaxes to change the lens's thickness for near and far vision", accept:["ciliary muscle","ciliary body"] },
    { id:"retina", label:"Retina", hx:210, hy:50, role:"Layer of rods and cones that convert light into nerve impulses", accept:["retina"] },
    { id:"fovea", label:"Fovea", hx:314, hy:150, role:"Region of densely packed cones giving the sharpest colour vision", accept:["fovea","fovea centralis","yellow spot"] },
    { id:"blindSpot", label:"Blind spot", hx:300, hy:202, role:"Where the optic nerve leaves the eye — no photoreceptors, so no image is formed", accept:["blind spot","optic disc"] },
    { id:"opticNerve", label:"Optic nerve", hx:352, hy:222, role:"Carries impulses from the retina to the visual cortex of the brain", accept:["optic nerve"] },
    { id:"sclera", label:"Sclera", hx:210, hy:26, role:"Tough white outer layer protecting the eye and maintaining its shape", accept:["sclera"] },
    { id:"choroid", label:"Choroid", hx:210, hy:38, role:"Pigmented, blood-rich layer that absorbs stray light and supplies the retina", accept:["choroid"] }
  ]
};
