/* ============================================================================
   q-s5.js — MS-S5 The Normal Distribution (Year 12). 24 questions.
   ========================================================================== */
window.MS = window.MS || {};
window.MS.QUESTIONS = (window.MS.QUESTIONS || []).concat([

  { id: 's5-001', mod: 'MS-S5', topic: 'z-scores', diff: 1,
    q: 'What does a z-score measure?',
    choices: ['How many standard deviations a score is from the mean', 'The percentage of scores below a value', 'The difference between the mean and median', 'The raw mark out of 100'], a: 0,
    why: 'z = \\frac{x - x_bar}{s}. A z of 2 means the score sits two standard deviations above the mean, whatever the units.' },

  { id: 's5-002', mod: 'MS-S5', topic: 'z-scores', diff: 1,
    q: 'A test has mean 65 and standard deviation 8. Find the z-score of a mark of 78, to 3 decimal places.',
    choices: ['1.625', '−1.625', '0.615', '13.000'], a: 0,
    why: 'z = \\frac{78 - 65}{8} = \\frac{13}{8} = 1.625. The mark is above the mean, so z is positive.' },

  { id: 's5-003', mod: 'MS-S5', topic: 'z-scores', diff: 2,
    q: 'A distribution has mean 60 and standard deviation 4.5. Find the z-score of 54, to 3 decimal places.',
    choices: ['−1.333', '1.333', '−0.750', '−6.000'], a: 0,
    why: 'z = \\frac{54 - 60}{4.5} = \\frac{-6}{4.5} = -1.333. A score below the mean always has a negative z.' },

  { id: 's5-004', mod: 'MS-S5', topic: 'z-scores', diff: 2,
    q: 'A distribution has mean 72 and standard deviation 6. What raw score has a z-score of 1.5?',
    choices: ['81', '63', '108', '78'], a: 0,
    why: 'Rearranging: x = x_bar + zs = 72 + 1.5(6) = 72 + 9 = 81.' },

  { id: 's5-005', mod: 'MS-S5', topic: 'z-scores', diff: 2,
    q: 'A distribution has mean 150 and standard deviation 12. What raw score has a z-score of −2?',
    choices: ['126', '174', '148', '138'], a: 0,
    why: 'x = 150 + (−2)(12) = 150 − 24 = 126.' },

  { id: 's5-006', mod: 'MS-S5', topic: 'z-scores', diff: 1,
    q: 'What is the z-score of a value exactly equal to the mean?',
    choices: ['0', '1', '0.5', 'It depends on the standard deviation'], a: 0,
    why: 'z = \\frac{x_bar - x_bar}{s} = \\frac{0}{s} = 0, whatever the standard deviation is.' },

  { id: 's5-007', mod: 'MS-S5', topic: 'The empirical rule', diff: 1,
    q: 'What percentage of a normal distribution lies within 1 standard deviation of the mean?',
    choices: ['68%', '95%', '99.7%', '50%'], a: 0,
    why: 'The empirical rule: 68% within 1 standard deviation, 95% within 2, 99.7% within 3.' },

  { id: 's5-008', mod: 'MS-S5', topic: 'The empirical rule', diff: 1,
    q: 'What percentage lies within 2 standard deviations of the mean?',
    choices: ['95%', '68%', '99.7%', '90%'], a: 0,
    why: '95% falls within \\pm 2 standard deviations, leaving 5% split between the two tails.' },

  { id: 's5-009', mod: 'MS-S5', topic: 'The empirical rule', diff: 2,
    q: 'What percentage of a normal distribution lies ABOVE 2 standard deviations from the mean?',
    choices: ['2.5%', '5%', '95%', '16%'], a: 0,
    why: '95% is within \\pm 2s, so 5% is outside. By symmetry that splits evenly, giving 2.5% in the upper tail.' },

  { id: 's5-010', mod: 'MS-S5', topic: 'The empirical rule', diff: 2,
    q: 'What percentage lies BELOW one standard deviation below the mean?',
    choices: ['16%', '32%', '68%', '2.5%'], a: 0,
    why: '68% is within \\pm 1s, so 32% is outside, and half of that is in each tail: 16%.' },

  { id: 's5-011', mod: 'MS-S5', topic: 'The empirical rule', diff: 2,
    q: 'What percentage lies between the mean and 1 standard deviation above it?',
    choices: ['34%', '68%', '50%', '16%'], a: 0,
    why: '68% spans \\pm 1s, and the curve is symmetric, so each side of the mean holds half of that: 34%.' },

  { id: 's5-012', mod: 'MS-S5', topic: 'The empirical rule', diff: 3,
    q: 'What percentage lies between 1 and 2 standard deviations above the mean?',
    choices: ['13.5%', '27%', '34%', '47.5%'], a: 0,
    why: 'Within 2s is 95% and within 1s is 68%, so the two outer bands together hold 27%. One side holds half of that: 13.5%.' },

  { id: 's5-013', mod: 'MS-S5', topic: 'The empirical rule', diff: 3,
    stem: 'Heights are normally distributed with mean 170 cm and standard deviation 8 cm.',
    q: 'What percentage of people are between 162 cm and 186 cm tall?',
    choices: ['81.5%', '95%', '68%', '84%'], a: 0,
    why: '162 cm is z = −1 and 186 cm is z = +2. From −1 to the mean is 34%, and the mean to +2 is 47.5%. Total = 81.5%.' },

  { id: 's5-014', mod: 'MS-S5', topic: 'The empirical rule', diff: 3,
    stem: 'Heights are normally distributed with mean 170 cm and standard deviation 8 cm.',
    q: 'In a group of 2,000 people, how many would you expect to be taller than 178 cm?',
    choices: ['320', '1,360', '680', '50'], a: 0,
    why: '178 cm is z = +1, and 16% lie above that. Expected number = 0.16 × 2,000 = 320.' },

  { id: 's5-015', mod: 'MS-S5', topic: 'Comparing scores', diff: 2,
    stem: 'Maths: mean 62, standard deviation 10, mark 74. English: mean 70, standard deviation 6, mark 79.',
    q: 'Which is the better result relative to the cohort?',
    choices: ['English, with z = 1.5 against 1.2', 'Maths, with z = 1.2 against 1.5', 'English, because the raw mark is higher', 'They are equivalent'], a: 0,
    why: 'Maths z = \\frac{74-62}{10} = 1.2 and English z = \\frac{79-70}{6} = 1.5. The higher z is the stronger relative performance, so English wins despite the smaller gap in raw marks.' },

  { id: 's5-016', mod: 'MS-S5', topic: 'Comparing scores', diff: 2,
    q: 'Why are z-scores used to compare results from different tests?',
    choices: ['They put both results on the same scale, in standard deviations', 'They convert both to percentages', 'They remove the effect of the mean only', 'They always range from 0 to 100'], a: 0,
    why: 'Standardising by the mean AND the standard deviation makes the two distributions directly comparable, whatever the raw marks or the spread.' },

  { id: 's5-017', mod: 'MS-S5', topic: 'Comparing scores', diff: 3,
    stem: 'Test A: mean 55, standard deviation 15. Test B: mean 80, standard deviation 5.',
    q: 'A student scores 70 in A and 85 in B. Which was the better performance?',
    choices: ['Test A, with z = 1.0 against 1.0 — they are equal', 'Test A, with z = 1.0 against 0.5', 'Test B, with z = 1.0 against 0.5', 'Test B, because the raw mark is higher'], a: 0,
    why: 'A: z = \\frac{70-55}{15} = 1.0. B: z = \\frac{85-80}{5} = 1.0. Both are exactly one standard deviation above the mean, so the performances are equivalent.' },

  { id: 's5-018', mod: 'MS-S5', topic: 'Quality control', diff: 2,
    stem: 'A machine fills bottles with mean 500 mL and standard deviation 4 mL.',
    q: 'What is the upper control limit at 3 standard deviations?',
    choices: ['512 mL', '508 mL', '504 mL', '488 mL'], a: 0,
    why: 'Limit = 500 + 3(4) = 512 mL. Only about 0.15% of output should exceed that by chance.' },

  { id: 's5-019', mod: 'MS-S5', topic: 'Quality control', diff: 3,
    stem: 'A machine fills bottles with mean 500 mL and standard deviation 4 mL.',
    q: 'A sample measures 486 mL. What should the operator conclude?',
    choices: ['The process is out of control, since z = −3.5', 'The process is fine, since it is close to 500', 'The process is fine, since z is within 2', 'Nothing can be concluded from one bottle'], a: 0,
    why: 'z = \\frac{486 - 500}{4} = -3.5, beyond the \\pm 3 limits. Only about 0.3% of output should fall outside those limits, so a reading there signals a real problem.' },

  { id: 's5-020', mod: 'MS-S5', topic: 'Quality control', diff: 2,
    q: 'Why are quality control limits usually set at 3 standard deviations?',
    choices: ['Because only about 0.3% of output should fall outside by chance', 'Because 3 is easy to calculate', 'Because 68% of output falls inside', 'Because it guarantees no defects'], a: 0,
    why: '99.7% of a normal distribution lies within \\pm 3s. Anything outside is rare enough that it is worth investigating rather than dismissing.' },

  { id: 's5-021', mod: 'MS-S5', topic: 'Percentiles', diff: 2,
    q: 'A score at the 84th percentile of a normal distribution has approximately what z-score?',
    choices: ['1', '2', '0.84', '−1'], a: 0,
    why: '50% lie below the mean and 34% between the mean and z = 1, so 84% lie below z = 1.' },

  { id: 's5-022', mod: 'MS-S5', topic: 'Percentiles', diff: 3,
    q: 'What percentile corresponds to z = −2?',
    choices: ['2.5th', '5th', '16th', '97.5th'], a: 0,
    why: '2.5% of the distribution lies below z = −2, so it is the 2.5th percentile. z = +2 would be the 97.5th.' },

  { id: 's5-023', mod: 'MS-S5', topic: 'The empirical rule', diff: 2,
    q: 'What are the two defining features of a normal distribution\'s shape?',
    choices: ['Symmetric and bell-shaped, with mean = median = mode', 'Positively skewed with a long right tail', 'Uniform across its range', 'Bimodal with two equal peaks'], a: 0,
    why: 'Perfect symmetry about the mean puts the mean, median and mode at the same point, and the bell shape is what makes the 68/95/99.7 percentages universal.' },

  { id: 's5-024', mod: 'MS-S5', topic: 'z-scores', diff: 3,
    stem: 'Two students have z-scores of 1.8 and −0.4 on the same test, which has mean 64 and standard deviation 5.',
    q: 'What is the difference between their raw marks?',
    choices: ['11', '2.2', '1.4', '22'], a: 0,
    why: 'Marks are 64 + 1.8(5) = 73 and 64 − 0.4(5) = 62. The difference is 11. Equivalently, a z-difference of 2.2 × 5 = 11 marks.' }
]);
