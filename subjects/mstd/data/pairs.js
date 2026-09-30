/* ============================================================================
   pairs.js — Match Pairs boards (§5). Each set is 8 pairs; the game deals 6 of
   them into a 4×3 grid so no two rounds are identical.
   ========================================================================== */
window.MS = window.MS || {};
window.MS.PAIR_SETS = (window.MS.PAIR_SETS || []).concat([
  { id: 'ps-area', nm: 'Shape → area formula', mod: 'MS-M1',
    pairs: [
      ['Circle', 'A = \\pi r^2'],
      ['Triangle', 'A = \\frac{1}{2}bh'],
      ['Trapezium', 'A = \\frac{h}{2}(a+b)'],
      ['Rectangle', 'A = lw'],
      ['Sector', 'A = \\frac{\\theta}{360}\\pi r^2'],
      ['Parallelogram', 'A = bh'],
      ['Rhombus', 'A = \\frac{1}{2}xy'],
      ['Annulus', 'A = \\pi(R^2 - r^2)']
    ] },

  { id: 'ps-vol', nm: 'Solid → volume formula', mod: 'MS-M1',
    pairs: [
      ['Cylinder', 'V = \\pi r^2 h'],
      ['Cone', 'V = \\frac{1}{3}\\pi r^2 h'],
      ['Sphere', 'V = \\frac{4}{3}\\pi r^3'],
      ['Prism', 'V = Ah'],
      ['Pyramid', 'V = \\frac{1}{3}Ah'],
      ['Cube', 'V = s^3'],
      ['Hemisphere', 'V = \\frac{2}{3}\\pi r^3'],
      ['Closed cylinder SA', 'SA = 2\\pi r^2 + 2\\pi rh']
    ] },

  { id: 'ps-units', nm: 'Unit → equivalent', mod: 'MS-M1',
    pairs: [
      ['1 m^3', '1 kL'],
      ['1 cm^3', '1 mL'],
      ['1 L', '1000 mL'],
      ['1 ha', '10 000 m^2'],
      ['1 m^2', '10 000 cm^2'],
      ['1 t', '1000 kg'],
      ['1 km/h', '\\frac{1}{3.6} m/s'],
      ['1 kWh', '3600 kJ']
    ] },

  { id: 'ps-stats', nm: 'Statistic → definition', mod: 'MS-S1',
    pairs: [
      ['Median', 'Middle score when ordered'],
      ['Mode', 'Most frequent score'],
      ['Range', 'Maximum − minimum'],
      ['IQR', 'Q_3 - Q_1'],
      ['Mean', '\\frac{\\Sigma fx}{\\Sigma f}'],
      ['Outlier', 'Beyond 1.5 \\times IQR from a quartile'],
      ['Five-number summary', 'Min, Q_1, median, Q_3, max'],
      ['Positive skew', 'Tail stretches to the right']
    ] },

  { id: 'ps-network', nm: 'Network term → meaning', mod: 'MS-N1',
    pairs: [
      ['Degree', 'Number of edges at a vertex'],
      ['Tree', 'Connected, no cycles'],
      ['Spanning tree', 'Reaches every vertex'],
      ['Bridge', 'Edge whose removal disconnects'],
      ['Eulerian trail', 'Uses every edge once'],
      ['Hamiltonian path', 'Visits every vertex once'],
      ['Float time', 'Latest start − earliest start'],
      ['Critical path', 'Longest path, zero float']
    ] },

  { id: 'ps-finance', nm: 'Finance term → formula', mod: 'MS-F4',
    pairs: [
      ['Simple interest', 'I = Prn'],
      ['Compound future value', 'FV = PV(1+r)^n'],
      ['Straight-line depreciation', 'S = V_0 - Dn'],
      ['Declining balance', 'S = V_0(1-r)^n'],
      ['Dividend yield', '\\frac{dividend}{share price}'],
      ['GST inside a total', 'total \\div 11'],
      ['Add GST', 'price \\times 1.1'],
      ['P/E ratio', '\\frac{share price}{earnings per share}']
    ] },

  { id: 'ps-trig', nm: 'Trig rule → when to use it', mod: 'MS-M6',
    pairs: [
      ['Pythagoras', 'Two sides of a right triangle'],
      ['Sine rule', 'A side with its opposite angle'],
      ['Cosine rule (side)', 'Two sides and the angle between them'],
      ['Cosine rule (angle)', 'All three sides known'],
      ['Area rule', 'Area from two sides and an angle'],
      ['tan\\theta', '\\frac{opposite}{adjacent}'],
      ['Ambiguous case', 'Sine rule may give two angles'],
      ['True bearing', 'Clockwise from north, 3 digits']
    ] },

  { id: 'ps-normal', nm: 'z-score → percentage', mod: 'MS-S5',
    pairs: [
      ['Within z = \\pm 1', '68%'],
      ['Within z = \\pm 2', '95%'],
      ['Within z = \\pm 3', '99.7%'],
      ['Above z = 1', '16%'],
      ['Above z = 2', '2.5%'],
      ['Below z = -1', 'Also 16%, by symmetry'],
      ['Between z = 1 and 2', '13.5%'],
      ['Below z = 0', '50%']
    ] },

  { id: 'ps-data', nm: 'Data type → example', mod: 'MS-S1',
    pairs: [
      ['Nominal categorical', 'Eye colour'],
      ['Ordinal categorical', 'Survey rating 1–5'],
      ['Discrete numerical', 'Number of siblings'],
      ['Continuous numerical', 'Height in cm'],
      ['Census', 'Every member of the population'],
      ['Sample', 'A subset of the population'],
      ['Bias', 'A sample that misrepresents'],
      ['Stratified sample', 'Proportional from each group']
    ] },

  { id: 'ps-rates', nm: 'Rate → its unit', mod: 'MS-M7',
    pairs: [
      ['Fuel consumption', 'L/100 km'],
      ['Heart rate', 'beats/min'],
      ['Power', 'kW'],
      ['Energy use', 'kWh'],
      ['Speed', 'km/h'],
      ['Flow rate', 'L/min'],
      ['Density', 'kg/m^3'],
      ['Pay rate', '$/h']
    ] }
]);
