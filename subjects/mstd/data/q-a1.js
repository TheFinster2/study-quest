/* ============================================================================
   q-a1.js — MS-A1 Formulae and Equations (Year 11). 22 questions.
   Key is always choices[0], `a` is always 0. Distractors are specific
   misconceptions of comparable length (§9.7).
   ========================================================================== */
window.MS = window.MS || {};
window.MS.QUESTIONS = (window.MS.QUESTIONS || []).concat([

  { id: 'a1-001', mod: 'MS-A1', topic: 'Substitution', diff: 1,
    q: 'Find the value of A when A = \\frac{1}{2}bh, b = 14 and h = 9.',
    choices: ['63', '126', '31.5', '23'], a: 0,
    why: 'A = \\frac{1}{2} \\times 14 \\times 9 = \\frac{126}{2} = 63. Forgetting to halve gives 126.' },

  { id: 'a1-002', mod: 'MS-A1', topic: 'Substitution', diff: 1,
    q: 'Find C when C = 2\\pi r and r = 7, to 2 decimal places.',
    choices: ['43.98', '153.94', '21.99', '87.96'], a: 0,
    why: 'C = 2 \\times \\pi \\times 7 = 43.98. The answer 153.94 is \\pi r^2, which is the area, not the circumference.' },

  { id: 'a1-003', mod: 'MS-A1', topic: 'Substitution', diff: 2,
    q: 'Find S when S = ut + \\frac{1}{2}at^2, u = 5, t = 4 and a = 2.',
    choices: ['36', '20', '52', '28'], a: 0,
    why: 'S = 5(4) + \\frac{1}{2}(2)(4^2) = 20 + 16 = 36. Squaring after multiplying by a is the usual slip.' },

  { id: 'a1-004', mod: 'MS-A1', topic: 'Substitution', diff: 2,
    q: 'Find V when V = \\frac{1}{3}\\pi r^2 h, r = 6 and h = 10, to 1 decimal place.',
    choices: ['376.99 rounds to 377.0', '1130.97 rounds to 1131.0', '125.66 rounds to 125.7', '188.50 rounds to 188.5'], a: 0,
    why: 'V = \\frac{1}{3}\\pi(6^2)(10) = \\frac{1}{3}\\pi(360) = 377.0. Omitting the \\frac{1}{3} gives 1131.0.' },

  { id: 'a1-005', mod: 'MS-A1', topic: 'Rearranging formulae', diff: 2,
    q: 'Rearrange A = \\frac{1}{2}bh to make h the subject.',
    choices: ['h = \\frac{2A}{b}', 'h = \\frac{A}{2b}', 'h = 2Ab', 'h = \\frac{b}{2A}'], a: 0,
    why: 'Multiply both sides by 2 to get 2A = bh, then divide by b: h = \\frac{2A}{b}.' },

  { id: 'a1-006', mod: 'MS-A1', topic: 'Rearranging formulae', diff: 2,
    q: 'Rearrange C = 2\\pi r to make r the subject.',
    choices: ['r = \\frac{C}{2\\pi}', 'r = \\frac{2\\pi}{C}', 'r = 2\\pi C', 'r = \\frac{C}{\\pi}'], a: 0,
    why: 'Divide both sides by 2\\pi: r = \\frac{C}{2\\pi}.' },

  { id: 'a1-007', mod: 'MS-A1', topic: 'Rearranging formulae', diff: 3,
    q: 'Rearrange v^2 = u^2 + 2as to make s the subject.',
    choices: ['s = \\frac{v^2 - u^2}{2a}', 's = \\frac{v^2 + u^2}{2a}', 's = \\frac{v - u}{2a}', 's = 2a(v^2 - u^2)'], a: 0,
    why: 'Subtract u^2 from both sides: v^2 - u^2 = 2as. Then divide by 2a: s = \\frac{v^2 - u^2}{2a}.' },

  { id: 'a1-008', mod: 'MS-A1', topic: 'Rearranging formulae', diff: 3,
    q: 'Rearrange S = \\frac{a}{1 - r} to make r the subject.',
    choices: ['r = 1 - \\frac{a}{S}', 'r = \\frac{a}{S} - 1', 'r = \\frac{S - a}{S + a}', 'r = 1 + \\frac{a}{S}'], a: 0,
    why: 'S(1 - r) = a, so 1 - r = \\frac{a}{S}, giving r = 1 - \\frac{a}{S}.' },

  { id: 'a1-009', mod: 'MS-A1', topic: 'Blood alcohol content', diff: 2,
    stem: 'For males, BAC = \\frac{10N - 7.5H}{6.8M}, where N is standard drinks, H hours of drinking and M mass in kg.',
    q: 'Find the BAC of an 80 kg male who has 5 standard drinks over 2 hours, to 3 decimal places.',
    choices: ['0.064', '0.092', '0.045', '0.128'], a: 0,
    why: 'BAC = \\frac{10(5) - 7.5(2)}{6.8(80)} = \\frac{50 - 15}{544} = \\frac{35}{544} = 0.064.' },

  { id: 'a1-010', mod: 'MS-A1', topic: 'Blood alcohol content', diff: 2,
    stem: 'For females, BAC = \\frac{10N - 7.5H}{5.5M}.',
    q: 'Find the BAC of a 62 kg female who has 4 standard drinks over 3 hours, to 3 decimal places.',
    choices: ['0.051', '0.117', '0.041', '0.073'], a: 0,
    why: 'BAC = \\frac{10(4) - 7.5(3)}{5.5(62)} = \\frac{40 - 22.5}{341} = \\frac{17.5}{341} = 0.051.' },

  { id: 'a1-011', mod: 'MS-A1', topic: 'Blood alcohol content', diff: 2,
    q: 'The time for BAC to reach zero is \\frac{BAC}{0.015} hours. How long from a BAC of 0.072?',
    choices: ['4.8 hours', '1.08 hours', '0.48 hours', '10.8 hours'], a: 0,
    why: 'time = \\frac{0.072}{0.015} = 4.8 hours. Multiplying instead of dividing gives 0.00108.' },

  { id: 'a1-012', mod: 'MS-A1', topic: 'Medication dosage', diff: 2,
    stem: "Fried's rule for infants: dosage = \\frac{age in months \\times adult dosage}{150}.",
    q: 'Find the dose for an 18-month-old infant when the adult dose is 500 mg.',
    choices: ['60 mg', '150 mg', '30 mg', '278 mg'], a: 0,
    why: 'dosage = \\frac{18 \\times 500}{150} = \\frac{9000}{150} = 60 mg.' },

  { id: 'a1-013', mod: 'MS-A1', topic: 'Medication dosage', diff: 2,
    stem: "Young's rule for children 1–12: dosage = \\frac{age \\times adult dosage}{age + 12}.",
    q: 'Find the dose for an 8-year-old when the adult dose is 250 mg.',
    choices: ['100 mg', '125 mg', '150 mg', '80 mg'], a: 0,
    why: 'dosage = \\frac{8 \\times 250}{8 + 12} = \\frac{2000}{20} = 100 mg.' },

  { id: 'a1-014', mod: 'MS-A1', topic: 'Medication dosage', diff: 3,
    stem: "Clark's rule: dosage = \\frac{weight in kg \\times adult dosage}{70}.",
    q: 'A 42 kg patient needs a drug whose adult dose is 350 mg. What is the correct dose?',
    choices: ['210 mg', '583 mg', '147 mg', '105 mg'], a: 0,
    why: 'dosage = \\frac{42 \\times 350}{70} = \\frac{14700}{70} = 210 mg.' },

  { id: 'a1-015', mod: 'MS-A1', topic: 'Linear equations', diff: 1,
    q: 'Solve 5x - 7 = 28.',
    choices: ['x = 7', 'x = 4.2', 'x = 175', 'x = 5.6'], a: 0,
    why: 'Add 7 to both sides: 5x = 35. Divide by 5: x = 7.' },

  { id: 'a1-016', mod: 'MS-A1', topic: 'Linear equations', diff: 2,
    q: 'Solve 3(2x + 5) = 4x + 27.',
    choices: ['x = 6', 'x = 4', 'x = 11', 'x = 2.4'], a: 0,
    why: 'Expand: 6x + 15 = 4x + 27. Then 2x = 12 and x = 6. Forgetting to multiply the 5 by 3 is the usual error.' },

  { id: 'a1-017', mod: 'MS-A1', topic: 'Linear equations', diff: 2,
    q: 'Solve \\frac{x}{4} + 3 = 11.',
    choices: ['x = 32', 'x = 56', 'x = 2', 'x = 44'], a: 0,
    why: 'Subtract 3: \\frac{x}{4} = 8. Multiply by 4: x = 32. Multiplying by 4 first gives x = 44 − wrong order.' },

  { id: 'a1-018', mod: 'MS-A1', topic: 'Linear equations', diff: 3,
    q: 'Solve \\frac{2x - 1}{3} = \\frac{x + 4}{2}.',
    choices: ['x = 14', 'x = 7', 'x = 2', 'x = 3.5'], a: 0,
    why: 'Cross-multiply: 2(2x − 1) = 3(x + 4), so 4x − 2 = 3x + 12 and x = 14.' },

  { id: 'a1-019', mod: 'MS-A1', topic: 'Substitution', diff: 2,
    stem: 'The stopping distance of a car in metres is d = 0.7v + \\frac{v^2}{170}, where v is in km/h.',
    q: 'Find the stopping distance at 60 km/h, to the nearest metre.',
    choices: ['63 m', '42 m', '21 m', '84 m'], a: 0,
    why: 'd = 0.7(60) + \\frac{3600}{170} = 42 + 21.18 = 63.18, so 63 m. The reaction-distance term alone gives 42 m.' },

  { id: 'a1-020', mod: 'MS-A1', topic: 'Substitution', diff: 3,
    stem: 'Body mass index is BMI = \\frac{M}{h^2}, with M in kg and h in metres.',
    q: 'Find the BMI of a person 1.75 m tall weighing 68 kg, to 1 decimal place.',
    choices: ['22.2', '38.9', '19.4', '119.0'], a: 0,
    why: 'BMI = \\frac{68}{1.75^2} = \\frac{68}{3.0625} = 22.2. Dividing by 1.75 instead of its square gives 38.9.' },

  { id: 'a1-021', mod: 'MS-A1', topic: 'Rearranging formulae', diff: 3,
    stem: 'BMI = \\frac{M}{h^2}.',
    q: 'Rearrange to make h the subject.',
    choices: ['h = sqrt(\\frac{M}{BMI})', 'h = \\frac{M}{BMI}', 'h = sqrt(M \\times BMI)', 'h = \\frac{sqrt(M)}{BMI}'], a: 0,
    why: 'Multiply by h^2: BMI \\times h^2 = M. Divide by BMI: h^2 = \\frac{M}{BMI}. Take the square root: h = sqrt(\\frac{M}{BMI}).' },

  { id: 'a1-022', mod: 'MS-A1', topic: 'Substitution', diff: 1,
    q: 'Find F when F = \\frac{9C}{5} + 32 and C = 35.',
    choices: ['95', '63', '120.6', '75'], a: 0,
    why: 'F = \\frac{9(35)}{5} + 32 = 63 + 32 = 95. Stopping at 63 forgets the +32.' }
]);
