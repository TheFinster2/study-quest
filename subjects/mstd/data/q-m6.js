/* ============================================================================
   q-m6.js — MS-M6 Non-right-angled Trigonometry (Year 12). 30 questions.
   All triangles here are consistent — a randomised "two sides and an angle"
   can be impossible, and the ambiguous case can silently have two answers
   (§9.9), so every question was built from a triangle that actually closes.
   ========================================================================== */
window.MS = window.MS || {};
window.MS.QUESTIONS = (window.MS.QUESTIONS || []).concat([

  { id: 'm6-001', mod: 'MS-M6', topic: 'Pythagoras', diff: 1,
    q: 'A right-angled triangle has shorter sides 9 cm and 12 cm. Find the hypotenuse.',
    choices: ['15 cm', '21 cm', '10.5 cm', '225 cm'], a: 0,
    why: 'c^2 = 9^2 + 12^2 = 81 + 144 = 225, so c = 15 cm. This is the 3-4-5 triple scaled by 3.' },

  { id: 'm6-002', mod: 'MS-M6', topic: 'Pythagoras', diff: 2,
    q: 'A right-angled triangle has hypotenuse 26 m and one shorter side 10 m. Find the other shorter side.',
    choices: ['24 m', '16 m', '27.9 m', '28 m'], a: 0,
    why: 'b^2 = 26^2 − 10^2 = 676 − 100 = 576, so b = 24 m. Subtracting the sides instead of their squares gives 16.' },

  { id: 'm6-003', mod: 'MS-M6', topic: 'Pythagoras', diff: 2,
    q: 'Is a triangle with sides 8, 15 and 17 right-angled?',
    choices: ['Yes, since 8^2 + 15^2 = 17^2', 'No, since 8 + 15 > 17', 'Yes, since 8 + 15 - 17 = 6', 'No, since 17 is not even'], a: 0,
    why: '64 + 225 = 289 = 17^2, so Pythagoras holds exactly and the triangle is right-angled. The triangle inequality only tells you a triangle exists.' },

  { id: 'm6-004', mod: 'MS-M6', topic: 'Right-angled trigonometry', diff: 1,
    q: 'In a right-angled triangle the hypotenuse is 20 cm and one angle is 35\\deg. Find the side opposite that angle, to 2 decimal places.',
    choices: ['11.47 cm', '16.38 cm', '14.00 cm', '28.64 cm'], a: 0,
    why: '\\sin 35\\deg = \\frac{opp}{20}, so opp = 20 \\sin 35\\deg = 11.47 cm. Using cosine gives the adjacent side, 16.38 cm.' },

  { id: 'm6-005', mod: 'MS-M6', topic: 'Right-angled trigonometry', diff: 2,
    q: 'In a right-angled triangle the adjacent side is 14 m and the opposite side is 9 m. Find the angle, to 1 decimal place.',
    choices: ['32.7\\deg', '57.3\\deg', '40.0\\deg', '50.0\\deg'], a: 0,
    why: '\\tan\\theta = \\frac{9}{14} = 0.6429, so \\theta = 32.7\\deg. The answer 57.3\\deg is the other acute angle.' },

  { id: 'm6-006', mod: 'MS-M6', topic: 'Right-angled trigonometry', diff: 2,
    q: 'A ladder 5 m long leans against a wall at 70\\deg to the ground. How high up the wall does it reach, to 2 decimal places?',
    choices: ['4.70 m', '1.71 m', '13.74 m', '5.32 m'], a: 0,
    why: 'The height is opposite the 70\\deg angle: h = 5 \\sin 70\\deg = 4.70 m. Using cosine gives the distance from the wall, 1.71 m.' },

  { id: 'm6-007', mod: 'MS-M6', topic: 'Angles of elevation', diff: 2,
    q: 'From 40 m away, the angle of elevation to the top of a tower is 52\\deg. How tall is the tower, to 1 decimal place?',
    choices: ['51.2 m', '31.5 m', '65.0 m', '24.6 m'], a: 0,
    why: '\\tan 52\\deg = \\frac{h}{40}, so h = 40 \\tan 52\\deg = 51.2 m.' },

  { id: 'm6-008', mod: 'MS-M6', topic: 'Angles of elevation', diff: 3,
    q: 'From the top of a 60 m cliff, the angle of depression to a boat is 28\\deg. How far is the boat from the base of the cliff, to the nearest metre?',
    choices: ['113 m', '32 m', '128 m', '28 m'], a: 0,
    why: 'The angle of depression equals the angle of elevation from the boat, so \\tan 28\\deg = \\frac{60}{d} and d = \\frac{60}{\\tan 28\\deg} = 113 m. Multiplying instead of dividing gives 32 m.' },

  { id: 'm6-009', mod: 'MS-M6', topic: 'Angles of elevation', diff: 2,
    q: 'What is the relationship between the angle of elevation from A to B and the angle of depression from B to A?',
    choices: ['They are equal', 'They sum to 90\\deg', 'They sum to 180\\deg', 'The depression is always larger'], a: 0,
    why: 'They are alternate angles between two parallel horizontals, so they are equal. This is what lets you swap between them freely.' },

  { id: 'm6-010', mod: 'MS-M6', topic: 'Sine rule', diff: 2,
    stem: 'In triangle ABC, angle A = 40\\deg, angle B = 65\\deg and side a = 12 cm.',
    q: 'Find side b, to 2 decimal places.',
    choices: ['16.92 cm', '8.51 cm', '11.28 cm', '18.67 cm'], a: 0,
    why: '\\frac{a}{\\sin A} = \\frac{b}{\\sin B}, so b = \\frac{12 \\sin 65\\deg}{\\sin 40\\deg} = \\frac{10.876}{0.6428} = 16.92 cm. B is the larger angle, so b must exceed a.' },

  { id: 'm6-011', mod: 'MS-M6', topic: 'Sine rule', diff: 2,
    stem: 'In triangle ABC, angle A = 40\\deg, angle B = 65\\deg.',
    q: 'Find angle C.',
    choices: ['75\\deg', '105\\deg', '65\\deg', '85\\deg'], a: 0,
    why: 'Angles in a triangle sum to 180\\deg: C = 180 − 40 − 65 = 75\\deg.' },

  { id: 'm6-012', mod: 'MS-M6', topic: 'Sine rule', diff: 3,
    stem: 'In triangle PQR, p = 15 cm, q = 11 cm and angle P = 78\\deg.',
    q: 'Find angle Q, to 1 decimal place.',
    choices: ['45.8\\deg', '56.3\\deg', '34.2\\deg', '62.1\\deg'], a: 0,
    why: '\\frac{\\sin Q}{11} = \\frac{\\sin 78\\deg}{15}, so \\sin Q = \\frac{11 \\times 0.9781}{15} = 0.7173 and Q = 45.8\\deg. Since q < p, Q must be the acute solution — the obtuse 134.2\\deg would leave no room for angle P.' },

  { id: 'm6-013', mod: 'MS-M6', topic: 'Sine rule', diff: 2,
    q: 'When can you use the sine rule?',
    choices: ['When you know a side and the angle opposite it', 'When you know all three sides', 'Only in right-angled triangles', 'When you know two sides and the angle between them'], a: 0,
    why: 'The sine rule pairs a side with its opposite angle. Three sides, or two sides and the included angle, both call for the cosine rule.' },

  { id: 'm6-014', mod: 'MS-M6', topic: 'Cosine rule', diff: 2,
    stem: 'In triangle ABC, b = 9 m, c = 14 m and the included angle A = 62\\deg.',
    q: 'Find side a, to 2 decimal places.',
    choices: ['12.60 m', '16.64 m', '10.20 m', '23.00 m'], a: 0,
    why: 'a^2 = 9^2 + 14^2 − 2(9)(14)\\cos 62\\deg = 81 + 196 − 118.31 = 158.69, so a = 12.60 m. Two sides with the angle BETWEEN them always means the cosine rule, never the sine rule.' },

  { id: 'm6-015', mod: 'MS-M6', topic: 'Cosine rule', diff: 3,
    stem: 'Triangle ABC has a = 7 cm, b = 9 cm and c = 12 cm.',
    q: 'Find angle C, to 1 decimal place.',
    choices: ['96.4\\deg', '83.6\\deg', '35.4\\deg', '50.7\\deg'], a: 0,
    why: '\\cos C = \\frac{7^2 + 9^2 - 12^2}{2(7)(9)} = \\frac{49 + 81 - 144}{126} = \\frac{-14}{126} = -0.1111, so C = 96.4\\deg. A NEGATIVE cosine means the angle is obtuse, which you could predict from c^2 > a^2 + b^2 before calculating anything.' },

  { id: 'm6-016', mod: 'MS-M6', topic: 'Cosine rule', diff: 2,
    q: 'In the cosine rule c^2 = a^2 + b^2 - 2ab\\cos C, what happens when C = 90\\deg?',
    choices: ['It reduces to Pythagoras', 'It becomes the sine rule', 'It gives a negative value for c^2', 'It cannot be used'], a: 0,
    why: '\\cos 90\\deg = 0, so the last term vanishes and c^2 = a^2 + b^2 — Pythagoras is the special case of the cosine rule for a right angle.' },

  { id: 'm6-017', mod: 'MS-M6', topic: 'Cosine rule', diff: 3,
    q: 'A triangle has sides 5, 6 and 13. What does the cosine rule tell you?',
    choices: ['No such triangle exists', 'The largest angle is obtuse', 'It is right-angled', 'The largest angle is 90\\deg exactly'], a: 0,
    why: '5 + 6 = 11 < 13, so the triangle inequality fails and no triangle can be formed. Attempting the cosine rule gives \\cos C = \\frac{25+36-169}{60} = -1.8, outside the valid range of cosine — which is the algebraic signal that the triangle is impossible.' },

  { id: 'm6-018', mod: 'MS-M6', topic: 'Area rule', diff: 2,
    q: 'Find the area of a triangle with sides 11 m and 14 m and an included angle of 48\\deg, to 2 decimal places.',
    choices: ['57.22 m^2', '114.44 m^2', '77.00 m^2', '51.51 m^2'], a: 0,
    why: 'A = \\frac{1}{2}ab\\sin C = \\frac{1}{2}(11)(14)\\sin 48\\deg = 77 \\times 0.7431 = 57.22 m^2. Omitting the \\frac{1}{2} gives 114.44.' },

  { id: 'm6-019', mod: 'MS-M6', topic: 'Area rule', diff: 2,
    q: 'Which angle must you use in A = \\frac{1}{2}ab\\sin C?',
    choices: ['The angle between the two given sides', 'The largest angle', 'The angle opposite the longest side', 'Any angle in the triangle'], a: 0,
    why: 'The formula needs the INCLUDED angle — the one between sides a and b. Using any other angle gives a wrong area.' },

  { id: 'm6-020', mod: 'MS-M6', topic: 'Area rule', diff: 3,
    q: 'A triangular block has sides 20 m, 24 m and an included angle of 115\\deg. Find its area to the nearest square metre.',
    choices: ['218 m^2', '240 m^2', '101 m^2', '435 m^2'], a: 0,
    why: 'A = \\frac{1}{2}(20)(24)\\sin 115\\deg = 240 \\times 0.9063 = 218 m^2. An obtuse included angle is fine — \\sin 115\\deg is positive.' },

  { id: 'm6-021', mod: 'MS-M6', topic: 'Bearings', diff: 1,
    q: 'What is the true bearing of due west?',
    choices: ['270\\deg', '090\\deg', '180\\deg', '000\\deg'], a: 0,
    why: 'True bearings run clockwise from north: north 000\\deg, east 090\\deg, south 180\\deg, west 270\\deg.' },

  { id: 'm6-022', mod: 'MS-M6', topic: 'Bearings', diff: 2,
    q: 'A ship sails on a bearing of 145\\deg. What is the bearing of its return journey?',
    choices: ['325\\deg', '215\\deg', '035\\deg', '055\\deg'], a: 0,
    why: 'The back bearing is 145 + 180 = 325\\deg. Since the result is under 360\\deg you add; if it exceeded 360 you would subtract 180 instead.' },

  { id: 'm6-023', mod: 'MS-M6', topic: 'Bearings', diff: 2,
    q: 'A plane flies on a bearing of 290\\deg. What is the bearing of the return flight?',
    choices: ['110\\deg', '470\\deg', '070\\deg', '250\\deg'], a: 0,
    why: '290 + 180 = 470, which exceeds 360, so subtract 360: 470 − 360 = 110\\deg. Equivalently 290 − 180 = 110\\deg.' },

  { id: 'm6-024', mod: 'MS-M6', topic: 'Bearings', diff: 3,
    stem: 'A hiker walks 8 km on a bearing of 040\\deg, then 6 km on a bearing of 130\\deg.',
    q: 'How far is the hiker from the start, to 1 decimal place?',
    choices: ['10.0 km', '14.0 km', '2.0 km', '12.2 km'], a: 0,
    why: 'The bearings differ by 90\\deg, so the two legs are perpendicular and Pythagoras applies: d = sqrt(8^2 + 6^2) = sqrt(100) = 10.0 km. Adding the legs gives 14 km and ignores the turn.' },

  { id: 'm6-025', mod: 'MS-M6', topic: 'Bearings', diff: 3,
    stem: 'A boat sails 15 km on a bearing of 060\\deg, then 12 km on a bearing of 150\\deg.',
    q: 'Find the distance from the starting point, to 1 decimal place.',
    choices: ['19.2 km', '27.0 km', '3.0 km', '23.4 km'], a: 0,
    why: 'The turn is 90\\deg, so the legs are perpendicular: d = sqrt(15^2 + 12^2) = sqrt(369) = 19.2 km.' },

  { id: 'm6-026', mod: 'MS-M6', topic: 'The ambiguous case', diff: 3,
    q: 'Using the sine rule you find \\sin\\theta = 0.7. What is the obtuse possibility for \\theta, to 1 decimal place?',
    choices: ['135.6\\deg', '44.4\\deg', '110.0\\deg', '145.6\\deg'], a: 0,
    why: '\\sin^{-1}(0.7) = 44.4\\deg, and the second solution is 180 − 44.4 = 135.6\\deg. Both have the same sine, which is exactly why the sine rule can be ambiguous.' },

  { id: 'm6-027', mod: 'MS-M6', topic: 'The ambiguous case', diff: 3,
    q: 'When does the ambiguous case genuinely produce two valid triangles?',
    choices: ['When the side opposite the known angle is shorter than the other known side', 'When all three sides are known', 'When the known angle is obtuse', 'When the triangle is right-angled'], a: 0,
    why: 'If the side opposite the known angle is shorter than the other given side, the second (obtuse) solution can still leave a positive third angle, so two triangles fit. If the known angle is obtuse, only one triangle is possible.' },

  { id: 'm6-028', mod: 'MS-M6', topic: 'Radial surveys', diff: 3,
    stem: 'In a radial survey from O: OA = 30 m on a bearing of 040\\deg, OB = 25 m on a bearing of 110\\deg.',
    q: 'Find the area of triangle OAB, to the nearest square metre.',
    choices: ['352 m^2', '375 m^2', '705 m^2', '241 m^2'], a: 0,
    why: 'The included angle at O is 110 − 40 = 70\\deg. Area = \\frac{1}{2}(30)(25)\\sin 70\\deg = 375 \\times 0.9397 = 352 m^2.' },

  { id: 'm6-029', mod: 'MS-M6', topic: 'Radial surveys', diff: 2,
    q: 'How do you find the total area of a region from a radial survey?',
    choices: ['Split it into triangles from the central point and add their areas', 'Multiply the longest two arms together', 'Take the average arm length and square it', 'Use the trapezoidal rule on the bearings'], a: 0,
    why: 'Every arm goes to the same central point, so consecutive pairs of arms form triangles. Apply A = \\frac{1}{2}ab\\sin C to each and total them.' },

  { id: 'm6-030', mod: 'MS-M6', topic: 'Radial surveys', diff: 3,
    stem: 'A radial survey from O has three arms: 20 m at 000\\deg, 26 m at 120\\deg and 18 m at 240\\deg.',
    q: 'Find the total area, to the nearest square metre.',
    choices: ['584 m^2', '702 m^2', '292 m^2', '450 m^2'], a: 0,
    why: 'Consecutive arms are 120\\deg apart and \\sin 120\\deg = 0.8660. The three triangles are \\frac{1}{2}(20)(26)(0.866) = 225.2, \\frac{1}{2}(26)(18)(0.866) = 202.6 and \\frac{1}{2}(18)(20)(0.866) = 155.9 m^2, totalling 583.7, so 584 m^2. Forgetting the \\frac{1}{2} throughout doubles it.' }
]);
