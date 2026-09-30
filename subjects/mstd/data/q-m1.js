/* ============================================================================
   q-m1.js — MS-M1 Applications of Measurement (Year 11). 26 questions.
   ========================================================================== */
window.MS = window.MS || {};
window.MS.QUESTIONS = (window.MS.QUESTIONS || []).concat([

  { id: 'm1-001', mod: 'MS-M1', topic: 'Units and prefixes', diff: 1,
    q: 'Convert 3.6 km to metres.',
    choices: ['3,600 m', '360 m', '36,000 m', '0.0036 m'], a: 0,
    why: '1 km = 1000 m, so 3.6 × 1000 = 3,600 m.' },

  { id: 'm1-002', mod: 'MS-M1', topic: 'Units and prefixes', diff: 2,
    q: 'Convert 4.8 m^2 to cm^2.',
    choices: ['48,000 cm^2', '480 cm^2', '4,800 cm^2', '480,000 cm^2'], a: 0,
    why: '1 m^2 = 100^2 = 10,000 cm^2, so 4.8 × 10,000 = 48,000 cm^2. Using 100 instead of 100^2 gives 480 — the single most common measurement error in the course.' },

  { id: 'm1-003', mod: 'MS-M1', topic: 'Units and prefixes', diff: 2,
    q: 'Convert 2.5 m^3 to cm^3.',
    choices: ['2,500,000 cm^3', '250,000 cm^3', '2,500 cm^3', '25,000 cm^3'], a: 0,
    why: '1 m^3 = 100^3 = 1,000,000 cm^3, so 2.5 × 1,000,000 = 2,500,000 cm^3. Volume factors are the length factor CUBED.' },

  { id: 'm1-004', mod: 'MS-M1', topic: 'Volume and capacity', diff: 1,
    q: 'A container holds 3.4 m^3 of water. What is its capacity in litres?',
    choices: ['3,400 L', '340 L', '34 L', '34,000 L'], a: 0,
    why: '1 m^3 = 1000 L, so 3.4 m^3 = 3,400 L. That is also 3.4 kL.' },

  { id: 'm1-005', mod: 'MS-M1', topic: 'Volume and capacity', diff: 1,
    q: 'A syringe holds 12 cm^3. What is that in millilitres?',
    choices: ['12 mL', '1.2 mL', '120 mL', '1,200 mL'], a: 0,
    why: '1 cm^3 = 1 mL exactly, so 12 cm^3 = 12 mL. This equivalence is the bridge between volume and capacity.' },

  { id: 'm1-006', mod: 'MS-M1', topic: 'Units and prefixes', diff: 2,
    q: 'Convert 6.5 hectares to square metres.',
    choices: ['65,000 m^2', '6,500 m^2', '650 m^2', '650,000 m^2'], a: 0,
    why: '1 ha = 10,000 m^2, so 6.5 × 10,000 = 65,000 m^2.' },

  { id: 'm1-007', mod: 'MS-M1', topic: 'Absolute and percentage error', diff: 2,
    q: 'A length is measured as 24 cm, to the nearest centimetre. What is the absolute error?',
    choices: ['\\pm 0.5 cm', '\\pm 1 cm', '\\pm 0.05 cm', '\\pm 2 cm'], a: 0,
    why: 'Absolute error is half the precision of the instrument: \\frac{1}{2} \\times 1 = 0.5 cm. The true value lies between 23.5 and 24.5 cm.' },

  { id: 'm1-008', mod: 'MS-M1', topic: 'Absolute and percentage error', diff: 2,
    q: 'A mass is measured as 250 g, to the nearest 10 g. Find the percentage error, to 1 decimal place.',
    choices: ['2.0%', '4.0%', '0.2%', '1.0%'], a: 0,
    why: 'Absolute error = \\frac{1}{2} \\times 10 = 5 g. Percentage error = \\frac{5}{250} \\times 100 = 2.0%.' },

  { id: 'm1-009', mod: 'MS-M1', topic: 'Absolute and percentage error', diff: 3,
    q: 'A rod is measured as 48 mm, to the nearest millimetre. What is the largest possible true length?',
    choices: ['48.5 mm', '49 mm', '48.05 mm', '48.1 mm'], a: 0,
    why: 'The absolute error is 0.5 mm, so the true length lies in [47.5, 48.5] mm. The upper bound is 48.5 mm.' },

  { id: 'm1-010', mod: 'MS-M1', topic: 'Perimeter', diff: 1,
    q: 'Find the perimeter of a rectangle 14 cm by 9 cm.',
    choices: ['46 cm', '126 cm', '23 cm', '252 cm'], a: 0,
    why: 'P = 2(l + w) = 2(14 + 9) = 46 cm. The answer 126 is the area, not the perimeter.' },

  { id: 'm1-011', mod: 'MS-M1', topic: 'Perimeter', diff: 2,
    q: 'Find the circumference of a circle of diameter 18 cm, to 2 decimal places.',
    choices: ['56.55 cm', '113.10 cm', '254.47 cm', '28.27 cm'], a: 0,
    why: 'C = \\pi d = \\pi \\times 18 = 56.55 cm. Using 2\\pi d double-counts and gives 113.10.' },

  { id: 'm1-012', mod: 'MS-M1', topic: 'Perimeter', diff: 3,
    q: 'A semicircle has radius 10 cm. Find its perimeter, to 2 decimal places.',
    choices: ['51.42 cm', '31.42 cm', '62.83 cm', '41.42 cm'], a: 0,
    why: 'Half the circumference is \\frac{1}{2} \\times 2\\pi(10) = 31.42 cm, plus the straight diameter of 20 cm, giving 51.42 cm. Forgetting the diameter is the classic error.' },

  { id: 'm1-013', mod: 'MS-M1', topic: 'Area', diff: 1,
    q: 'Find the area of a triangle with base 16 m and perpendicular height 11 m.',
    choices: ['88 m^2', '176 m^2', '54 m^2', '44 m^2'], a: 0,
    why: 'A = \\frac{1}{2}bh = \\frac{1}{2}(16)(11) = 88 m^2.' },

  { id: 'm1-014', mod: 'MS-M1', topic: 'Area', diff: 2,
    q: 'Find the area of a circle of radius 9 cm, to 2 decimal places.',
    choices: ['254.47 cm^2', '56.55 cm^2', '28.27 cm^2', '81.00 cm^2'], a: 0,
    why: 'A = \\pi r^2 = \\pi(81) = 254.47 cm^2. The answer 56.55 is the circumference.' },

  { id: 'm1-015', mod: 'MS-M1', topic: 'Area', diff: 2,
    q: 'Find the area of a trapezium with parallel sides 12 m and 18 m, and perpendicular height 7 m.',
    choices: ['105 m^2', '210 m^2', '52.5 m^2', '126 m^2'], a: 0,
    why: 'A = \\frac{h}{2}(a + b) = \\frac{7}{2}(12 + 18) = 3.5 \\times 30 = 105 m^2.' },

  { id: 'm1-016', mod: 'MS-M1', topic: 'Area', diff: 3,
    q: 'An annulus has outer radius 10 cm and inner radius 6 cm. Find its area, to 2 decimal places.',
    choices: ['201.06 cm^2', '314.16 cm^2', '113.10 cm^2', '50.27 cm^2'], a: 0,
    why: 'A = \\pi(R^2 - r^2) = \\pi(100 - 36) = 64\\pi = 201.06 cm^2. Subtracting the radii first, \\pi(10-6)^2, gives 50.27 and is wrong.' },

  { id: 'm1-017', mod: 'MS-M1', topic: 'Area', diff: 3,
    stem: 'A field is measured by offsets from a straight baseline. The offsets at equal 8 m intervals are 0, 5.2, 7.8, 6.4 and 0 metres.',
    q: 'Use the trapezoidal rule with these five offsets to estimate the area.',
    choices: ['155.2 m^2', '310.4 m^2', '77.6 m^2', '196.8 m^2'], a: 0,
    why: 'A ~= \\frac{h}{2}(first + last + 2 \\times the middle ones) = \\frac{8}{2}(0 + 0 + 2(5.2 + 7.8 + 6.4)) = 4 \\times 38.8 = 155.2 m^2.' },

  { id: 'm1-018', mod: 'MS-M1', topic: 'Surface area', diff: 2,
    q: 'Find the surface area of a cube of side 7 cm.',
    choices: ['294 cm^2', '343 cm^2', '49 cm^2', '196 cm^2'], a: 0,
    why: 'A cube has 6 identical square faces: SA = 6 \\times 7^2 = 6 \\times 49 = 294 cm^2. The answer 343 is the volume.' },

  { id: 'm1-019', mod: 'MS-M1', topic: 'Surface area', diff: 3,
    q: 'Find the total surface area of a closed cylinder with radius 5 cm and height 12 cm, to 2 decimal places.',
    choices: ['534.07 cm^2', '376.99 cm^2', '408.41 cm^2', '942.48 cm^2'], a: 0,
    why: 'SA = 2\\pi r^2 + 2\\pi rh = 2\\pi(25) + 2\\pi(5)(12) = 157.08 + 376.99 = 534.07 cm^2. Using only the curved surface gives 376.99.' },

  { id: 'm1-020', mod: 'MS-M1', topic: 'Surface area', diff: 2,
    q: 'Find the surface area of a sphere of radius 6 cm, to 2 decimal places.',
    choices: ['452.39 cm^2', '904.78 cm^2', '113.10 cm^2', '150.80 cm^2'], a: 0,
    why: 'SA = 4\\pi r^2 = 4\\pi(36) = 452.39 cm^2.' },

  { id: 'm1-021', mod: 'MS-M1', topic: 'Volume and capacity', diff: 2,
    q: 'Find the volume of a cylinder with radius 4 cm and height 15 cm, to 2 decimal places.',
    choices: ['753.98 cm^3', '188.50 cm^3', '251.33 cm^3', '376.99 cm^3'], a: 0,
    why: 'V = \\pi r^2 h = \\pi(16)(15) = 753.98 cm^3, which is also 753.98 mL.' },

  { id: 'm1-022', mod: 'MS-M1', topic: 'Volume and capacity', diff: 2,
    q: 'Find the volume of a cone with radius 6 cm and height 14 cm, to 2 decimal places.',
    choices: ['527.79 cm^3', '1583.36 cm^3', '175.93 cm^3', '263.89 cm^3'], a: 0,
    why: 'V = \\frac{1}{3}\\pi r^2 h = \\frac{1}{3}\\pi(36)(14) = 527.79 cm^3. Omitting the \\frac{1}{3} gives 1583.36.' },

  { id: 'm1-023', mod: 'MS-M1', topic: 'Volume and capacity', diff: 2,
    q: 'Find the volume of a sphere of radius 5 cm, to 2 decimal places.',
    choices: ['523.60 cm^3', '314.16 cm^3', '392.70 cm^3', '104.72 cm^3'], a: 0,
    why: 'V = \\frac{4}{3}\\pi r^3 = \\frac{4}{3}\\pi(125) = 523.60 cm^3.' },

  { id: 'm1-024', mod: 'MS-M1', topic: 'Mass and density', diff: 2,
    q: 'A block of aluminium has volume 250 cm^3 and density 2.7 g/cm^3. Find its mass.',
    choices: ['675 g', '92.6 g', '2,700 g', '247.3 g'], a: 0,
    why: 'mass = density × volume = 2.7 × 250 = 675 g. Dividing instead of multiplying gives 92.6 g.' },

  { id: 'm1-025', mod: 'MS-M1', topic: 'Mass and density', diff: 3,
    q: 'A 1.8 kg object occupies 600 cm^3. Find its density in g/cm^3.',
    choices: ['3 g/cm^3', '0.33 g/cm^3', '1,080 g/cm^3', '333 g/cm^3'], a: 0,
    why: 'Convert first: 1.8 kg = 1800 g. Density = \\frac{1800}{600} = 3 g/cm^3. Forgetting the kg→g conversion gives 0.003.' },

  { id: 'm1-026', mod: 'MS-M1', topic: 'Volume and capacity', diff: 3,
    stem: 'A rectangular swimming pool is 12 m long, 5 m wide and a uniform 1.6 m deep.',
    q: 'What is its capacity in kilolitres?',
    choices: ['96 kL', '96,000 kL', '9.6 kL', '960 kL'], a: 0,
    why: 'V = 12 × 5 × 1.6 = 96 m^3. Since 1 m^3 = 1 kL, the capacity is 96 kL (or 96,000 L).' }
]);
