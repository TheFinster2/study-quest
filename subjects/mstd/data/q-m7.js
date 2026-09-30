/* ============================================================================
   q-m7.js — MS-M7 Rates and Ratios (Year 12). 28 questions.
   ========================================================================== */
window.MS = window.MS || {};
window.MS.QUESTIONS = (window.MS.QUESTIONS || []).concat([

  { id: 'm7-001', mod: 'MS-M7', topic: 'Fuel consumption', diff: 2,
    q: 'A car uses 58 L of fuel over 720 km. Find its fuel consumption in L/100 km, to 2 decimal places.',
    choices: ['8.06 L/100 km', '12.41 L/100 km', '0.08 L/100 km', '41.76 L/100 km'], a: 0,
    why: 'Rate = \\frac{58}{720} × 100 = 8.06 L/100 km. Inverting the fraction gives km per litre instead.' },

  { id: 'm7-002', mod: 'MS-M7', topic: 'Fuel consumption', diff: 2,
    q: 'A car uses fuel at 8.4 L/100 km. How much fuel is needed for 450 km?',
    choices: ['37.8 L', '53.6 L', '3,780 L', '18.7 L'], a: 0,
    why: 'Fuel = \\frac{8.4}{100} × 450 = 37.8 L.' },

  { id: 'm7-003', mod: 'MS-M7', topic: 'Fuel consumption', diff: 3,
    q: 'A car uses 8.4 L/100 km and petrol costs $1.92 per litre. What does a 450 km trip cost?',
    choices: ['$72.58', '$103.06', '$38.02', '$864.00'], a: 0,
    why: 'Fuel = \\frac{8.4}{100} × 450 = 37.8 L. Cost = 37.8 × 1.92 = $72.58. Multiplying the rate by the price without scaling for distance gives nonsense.' },

  { id: 'm7-004', mod: 'MS-M7', topic: 'Fuel consumption', diff: 2,
    q: 'Which car is more fuel-efficient?',
    choices: ['One using 6.2 L/100 km', 'One using 9.8 L/100 km', 'They are equally efficient', 'It cannot be determined'], a: 0,
    why: 'For L/100 km, LOWER is better — it uses fewer litres to cover the same distance. The direction of the comparison flips if the rate is quoted as km per litre.' },

  { id: 'm7-005', mod: 'MS-M7', topic: 'Unit rates', diff: 1,
    q: 'Convert 90 km/h to metres per second.',
    choices: ['25 m/s', '324 m/s', '1.5 m/s', '54 m/s'], a: 0,
    why: 'Divide by 3.6: \\frac{90}{3.6} = 25 m/s. Multiplying by 3.6 converts the wrong way.' },

  { id: 'm7-006', mod: 'MS-M7', topic: 'Unit rates', diff: 2,
    q: 'Convert 14 m/s to km/h.',
    choices: ['50.4 km/h', '3.9 km/h', '840 km/h', '504 km/h'], a: 0,
    why: 'Multiply by 3.6: 14 × 3.6 = 50.4 km/h.' },

  { id: 'm7-007', mod: 'MS-M7', topic: 'Unit rates', diff: 2,
    q: 'A tap fills a 240 L tank in 8 minutes. What is the flow rate in L/min?',
    choices: ['30 L/min', '1,920 L/min', '0.03 L/min', '1.8 L/min'], a: 0,
    why: 'Rate = \\frac{240}{8} = 30 L/min. That is also 1,800 L/h.' },

  { id: 'm7-008', mod: 'MS-M7', topic: 'Unit rates', diff: 3,
    q: 'A pump moves 45 L/min. How many kilolitres does it move in a day?',
    choices: ['64.8 kL', '64,800 kL', '2.7 kL', '1,080 kL'], a: 0,
    why: '45 L/min × 60 = 2,700 L/h, × 24 = 64,800 L per day. Since 1 kL = 1000 L, that is 64.8 kL.' },

  { id: 'm7-009', mod: 'MS-M7', topic: 'Heart rate', diff: 2,
    q: 'Maximum heart rate is estimated as 220 − age. What is the estimate for a 17-year-old?',
    choices: ['203 bpm', '237 bpm', '220 bpm', '187 bpm'], a: 0,
    why: 'Maximum heart rate = 220 − 17 = 203 beats per minute.' },

  { id: 'm7-010', mod: 'MS-M7', topic: 'Heart rate', diff: 3,
    q: 'A 17-year-old trains at 75% of maximum heart rate. What is the target rate, to the nearest bpm?',
    choices: ['152 bpm', '165 bpm', '178 bpm', '140 bpm'], a: 0,
    why: 'Maximum = 220 − 17 = 203. Target = 0.75 × 203 = 152.25, so 152 bpm.' },

  { id: 'm7-011', mod: 'MS-M7', topic: 'Heart rate', diff: 2,
    q: 'A pulse of 18 beats is counted in 15 seconds. What is the heart rate in bpm?',
    choices: ['72 bpm', '18 bpm', '270 bpm', '36 bpm'], a: 0,
    why: '15 seconds is a quarter of a minute, so multiply by 4: 18 × 4 = 72 bpm.' },

  { id: 'm7-012', mod: 'MS-M7', topic: 'Energy and power', diff: 2,
    q: 'A 2.4 kW heater runs for 5 hours a day for 30 days. How much energy does it use?',
    choices: ['360 kWh', '12 kWh', '3,600 kWh', '72 kWh'], a: 0,
    why: 'Energy = power × time = 2.4 × 5 × 30 = 360 kWh.' },

  { id: 'm7-013', mod: 'MS-M7', topic: 'Energy and power', diff: 3,
    q: 'A 2.4 kW heater runs 5 hours a day for 30 days. At 31c per kWh, what does it cost?',
    choices: ['$111.60', '$1,116.00', '$3.72', '$22.32'], a: 0,
    why: 'Energy = 2.4 × 5 × 30 = 360 kWh. Cost = 360 × $0.31 = $111.60. Reading 31c as $31 inflates it tenfold.' },

  { id: 'm7-014', mod: 'MS-M7', topic: 'Energy and power', diff: 2,
    q: 'How do you convert watts to kilowatts?',
    choices: ['Divide by 1000', 'Multiply by 1000', 'Divide by 100', 'Multiply by 60'], a: 0,
    why: '1 kW = 1000 W, so watts ÷ 1000 gives kilowatts. A 2400 W appliance is 2.4 kW.' },

  { id: 'm7-015', mod: 'MS-M7', topic: 'Scale drawings', diff: 2,
    q: 'A plan has a scale of 1:200. A wall measures 6.5 cm on the plan. What is its real length?',
    choices: ['13 m', '130 m', '1.3 m', '0.325 m'], a: 0,
    why: 'Real length = 6.5 × 200 = 1,300 cm = 13 m. The final conversion from centimetres to metres is where the factor-of-100 errors happen.' },

  { id: 'm7-016', mod: 'MS-M7', topic: 'Scale drawings', diff: 3,
    q: 'A room is 8.4 m long. How long is it on a 1:150 plan, to 1 decimal place?',
    choices: ['5.6 cm', '56.0 cm', '1,260 cm', '0.6 cm'], a: 0,
    why: '8.4 m = 840 cm. Plan length = \\frac{840}{150} = 5.6 cm.' },

  { id: 'm7-017', mod: 'MS-M7', topic: 'Scale drawings', diff: 3,
    q: 'A plan is drawn at 1:50. How does the real AREA compare with the plan area?',
    choices: ['2,500 times larger', '50 times larger', '100 times larger', '150 times larger'], a: 0,
    why: 'Areas scale by the square of the length factor: 50^2 = 2,500. Length is 50 times, area 2,500 times, volume 125,000 times.' },

  { id: 'm7-018', mod: 'MS-M7', topic: 'Ratio and proportion', diff: 1,
    q: 'Simplify the ratio 18:24.',
    choices: ['3:4', '9:12', '2:3', '6:8'], a: 0,
    why: 'Divide both parts by the highest common factor, 6: 18:24 = 3:4. The other options are either unsimplified or wrong.' },

  { id: 'm7-019', mod: 'MS-M7', topic: 'Dividing quantities', diff: 2,
    q: '$4,500 is divided in the ratio 3:5:7. What is the largest share?',
    choices: ['$2,100.00', '$1,500.00', '$900.00', '$3,150.00'], a: 0,
    why: 'Total parts = 3 + 5 + 7 = 15, so one part = \\frac{4500}{15} = $300. The largest share is 7 × 300 = $2,100.00.' },

  { id: 'm7-020', mod: 'MS-M7', topic: 'Dividing quantities', diff: 2,
    q: '$4,500 is divided in the ratio 3:5:7. What is the smallest share?',
    choices: ['$900.00', '$1,500.00', '$2,100.00', '$300.00'], a: 0,
    why: 'One part = $300, so the smallest share is 3 × 300 = $900.00.' },

  { id: 'm7-021', mod: 'MS-M7', topic: 'Ratio and proportion', diff: 3,
    q: 'Concrete is mixed cement:sand:gravel in the ratio 1:2:4. How much cement is in 3.5 m^3 of concrete?',
    choices: ['0.5 m^3', '1 m^3', '1.75 m^3', '0.875 m^3'], a: 0,
    why: 'Total parts = 1 + 2 + 4 = 7, so one part = \\frac{3.5}{7} = 0.5 m^3. Cement is 1 part, so 0.5 m^3.' },

  { id: 'm7-022', mod: 'MS-M7', topic: 'Ratio and proportion', diff: 2,
    q: 'A recipe for 6 people needs 450 g of rice. How much is needed for 15 people?',
    choices: ['1,125 g', '750 g', '180 g', '900 g'], a: 0,
    why: 'Per person = \\frac{450}{6} = 75 g. For 15 people: 75 × 15 = 1,125 g.' },

  { id: 'm7-023', mod: 'MS-M7', topic: 'Best buy', diff: 2,
    stem: 'Pack A: 750 g for $5.85. Pack B: 400 g for $3.40.',
    q: 'Which is the better buy, and at what unit price?',
    choices: ['Pack A at $0.78 per 100 g', 'Pack B at $0.85 per 100 g', 'Pack B at $0.78 per 100 g', 'Pack A at $0.85 per 100 g'], a: 0,
    why: 'A: \\frac{5.85}{7.5} = $0.78 per 100 g. B: \\frac{3.40}{4} = $0.85 per 100 g. A is cheaper per 100 g, even though its total price is higher.' },

  { id: 'm7-024', mod: 'MS-M7', topic: 'Best buy', diff: 2,
    q: 'Why is the cheapest total price not always the best buy?',
    choices: ['Because the packs may contain different amounts', 'Because prices change over time', 'Because larger packs always cost more', 'Because unit prices ignore tax'], a: 0,
    why: 'Comparing prices only makes sense per unit of quantity — per 100 g, per litre, per item. A small pack can have a low total price and a high unit price.' },

  { id: 'm7-025', mod: 'MS-M7', topic: 'Unit rates', diff: 2,
    q: 'A worker is paid $1,246 for 38 hours. What is the hourly rate?',
    choices: ['$32.79', '$47.35', '$3.05', '$30.50'], a: 0,
    why: 'Rate = \\frac{1246}{38} = $32.79 per hour, to the nearest cent.' },

  { id: 'm7-026', mod: 'MS-M7', topic: 'Unit rates', diff: 3,
    q: 'A printer produces 22 pages per minute. How long does a 385-page job take, to the nearest minute?',
    choices: ['18 minutes', '17 minutes', '8,470 minutes', '22 minutes'], a: 0,
    why: 'Time = \\frac{385}{22} = 17.5 minutes, which rounds to 18 minutes. Multiplying gives an absurd figure.' },

  { id: 'm7-027', mod: 'MS-M7', topic: 'Ratio and proportion', diff: 3,
    stem: 'A map has a scale of 1:25,000.',
    q: 'Two towns are 8.4 cm apart on the map. What is the real distance in kilometres?',
    choices: ['2.1 km', '21 km', '0.21 km', '210 km'], a: 0,
    why: 'Real distance = 8.4 × 25,000 = 210,000 cm. Convert: ÷ 100 gives 2,100 m, and ÷ 1000 gives 2.1 km. Both conversions are needed.' },

  { id: 'm7-028', mod: 'MS-M7', topic: 'Unit rates', diff: 3,
    q: 'Water flows at 2.5 L/min. How long to fill a 1.8 kL tank, to the nearest hour?',
    choices: ['12 hours', '720 hours', '45 hours', '1 hour'], a: 0,
    why: '1.8 kL = 1,800 L. Time = \\frac{1800}{2.5} = 720 minutes = 12 hours. Leaving the answer in minutes is the trap.' }
]);
