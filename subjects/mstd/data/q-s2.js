/* ============================================================================
   q-s2.js — MS-S2 Relative Frequency and Probability (Year 11). 24 questions.
   ========================================================================== */
window.MS = window.MS || {};
window.MS.QUESTIONS = (window.MS.QUESTIONS || []).concat([

  { id: 's2-001', mod: 'MS-S2', topic: 'Sample space', diff: 1,
    q: 'How many outcomes are in the sample space when two coins are tossed?',
    choices: ['4', '2', '3', '8'], a: 0,
    why: 'The outcomes are HH, HT, TH, TT, so there are 4. Treating HT and TH as the same outcome gives 3 and is wrong for probability.' },

  { id: 's2-002', mod: 'MS-S2', topic: 'Sample space', diff: 2,
    q: 'How many outcomes are in the sample space when a die is rolled and a coin is tossed?',
    choices: ['12', '8', '6', '36'], a: 0,
    why: 'Multiply the number of outcomes at each stage: 6 × 2 = 12. Adding gives 8, which is the wrong operation.' },

  { id: 's2-003', mod: 'MS-S2', topic: 'Sample space', diff: 1,
    q: 'A fair die is rolled. What is P(rolling an even number)?',
    choices: ['\\frac{1}{2}', '\\frac{1}{3}', '\\frac{1}{6}', '\\frac{2}{3}'], a: 0,
    why: 'Three of the six faces are even (2, 4, 6), so P = \\frac{3}{6} = \\frac{1}{2}.' },

  { id: 's2-004', mod: 'MS-S2', topic: 'Complementary events', diff: 1,
    q: 'If P(rain) = 0.35, what is P(no rain)?',
    choices: ['0.65', '0.35', '1.35', '0.55'], a: 0,
    why: 'Complementary probabilities sum to 1: P(no rain) = 1 − 0.35 = 0.65.' },

  { id: 's2-005', mod: 'MS-S2', topic: 'Complementary events', diff: 2,
    q: 'A bag has 4 red and 11 blue marbles. What is the probability of NOT drawing red?',
    choices: ['\\frac{11}{15}', '\\frac{4}{15}', '\\frac{4}{11}', '\\frac{11}{4}'], a: 0,
    why: 'There are 15 marbles and 11 are not red, so P = \\frac{11}{15}. This is also 1 − \\frac{4}{15}.' },

  { id: 's2-006', mod: 'MS-S2', topic: 'Multi-stage events', diff: 2,
    q: 'A fair coin is tossed three times. What is the probability of three heads?',
    choices: ['\\frac{1}{8}', '\\frac{1}{6}', '\\frac{3}{8}', '\\frac{1}{2}'], a: 0,
    why: 'Multiply along the branches: \\frac{1}{2} \\times \\frac{1}{2} \\times \\frac{1}{2} = \\frac{1}{8}.' },

  { id: 's2-007', mod: 'MS-S2', topic: 'Multi-stage events', diff: 2,
    q: 'A fair coin is tossed three times. What is the probability of at least one head?',
    choices: ['\\frac{7}{8}', '\\frac{1}{8}', '\\frac{3}{8}', '\\frac{1}{2}'], a: 0,
    why: 'Use the complement: P(no heads) = \\frac{1}{8}, so P(at least one head) = 1 − \\frac{1}{8} = \\frac{7}{8}. "At least one" almost always means take the complement.' },

  { id: 's2-008', mod: 'MS-S2', topic: 'Multi-stage events', diff: 2,
    stem: 'A bag has 5 green and 3 yellow counters. Two are drawn WITH replacement.',
    q: 'What is the probability both are green?',
    choices: ['\\frac{25}{64}', '\\frac{5}{14}', '\\frac{10}{16}', '\\frac{25}{56}'], a: 0,
    why: 'With replacement the probabilities do not change: \\frac{5}{8} \\times \\frac{5}{8} = \\frac{25}{64}.' },

  { id: 's2-009', mod: 'MS-S2', topic: 'Multi-stage events', diff: 3,
    stem: 'A bag has 5 green and 3 yellow counters. Two are drawn WITHOUT replacement.',
    q: 'What is the probability both are green?',
    choices: ['\\frac{5}{14}', '\\frac{25}{64}', '\\frac{20}{64}', '\\frac{5}{8}'], a: 0,
    why: '\\frac{5}{8} \\times \\frac{4}{7} = \\frac{20}{56} = \\frac{5}{14}. Both the numerator and the denominator drop by one on the second draw.' },

  { id: 's2-010', mod: 'MS-S2', topic: 'Tree diagrams', diff: 2,
    q: 'On a tree diagram, what operation do you use ALONG a set of branches?',
    choices: ['Multiply', 'Add', 'Subtract from 1', 'Divide'], a: 0,
    why: 'Multiply along branches for a sequence of events ("and"), and add across the completed branches for alternatives ("or").' },

  { id: 's2-011', mod: 'MS-S2', topic: 'Tree diagrams', diff: 3,
    stem: 'A test is 90% accurate on people who have a condition and 95% accurate on people who do not. 4% of the population has it.',
    q: 'What is the probability a randomly chosen person tests positive AND has the condition?',
    choices: ['0.036', '0.9', '0.048', '0.04'], a: 0,
    why: 'Multiply along that branch: 0.04 × 0.90 = 0.036. That is only one of the two branches producing a positive test.' },

  { id: 's2-012', mod: 'MS-S2', topic: 'Venn diagrams', diff: 2,
    stem: 'In a class of 30, 18 play soccer, 14 play netball and 7 play both.',
    q: 'How many play neither?',
    choices: ['5', '2', '12', '9'], a: 0,
    why: 'Soccer or netball = 18 + 14 − 7 = 25 (subtract the overlap once). Neither = 30 − 25 = 5.' },

  { id: 's2-013', mod: 'MS-S2', topic: 'Venn diagrams', diff: 2,
    stem: 'In a class of 30, 18 play soccer, 14 play netball and 7 play both.',
    q: 'How many play soccer only?',
    choices: ['11', '18', '7', '25'], a: 0,
    why: 'Soccer only = 18 − 7 = 11. The 7 who play both belong in the intersection, not in "soccer only".' },

  { id: 's2-014', mod: 'MS-S2', topic: 'Venn diagrams', diff: 3,
    stem: 'In a class of 30, 18 play soccer, 14 play netball and 7 play both.',
    q: 'A student is chosen at random. What is P(netball only)?',
    choices: ['\\frac{7}{30}', '\\frac{14}{30}', '\\frac{11}{30}', '\\frac{21}{30}'], a: 0,
    why: 'Netball only = 14 − 7 = 7 students, so P = \\frac{7}{30}.' },

  { id: 's2-015', mod: 'MS-S2', topic: 'Independence', diff: 2,
    q: 'Two events are independent. P(A) = 0.4 and P(B) = 0.25. What is P(A and B)?',
    choices: ['0.1', '0.65', '0.15', '0.625'], a: 0,
    why: 'For independent events, P(A and B) = P(A) × P(B) = 0.4 × 0.25 = 0.1. Adding them would give P(A or B) for mutually exclusive events.' },

  { id: 's2-016', mod: 'MS-S2', topic: 'Independence', diff: 2,
    q: 'Which pair of events is independent?',
    choices: ['Two rolls of a fair die', 'Drawing two cards without replacement', 'Being over 180 cm and playing basketball', 'Rain today and rain tomorrow'], a: 0,
    why: 'A die has no memory, so the second roll is unaffected by the first. Drawing without replacement changes the second probability, and the others are plausibly linked.' },

  { id: 's2-017', mod: 'MS-S2', topic: 'Expected frequency', diff: 1,
    q: 'A fair die is rolled 300 times. How many sixes are expected?',
    choices: ['50', '60', '6', '150'], a: 0,
    why: 'Expected frequency = P(E) × trials = \\frac{1}{6} × 300 = 50.' },

  { id: 's2-018', mod: 'MS-S2', topic: 'Expected frequency', diff: 2,
    q: 'A spinner lands on blue with probability 0.35. In 240 spins, how many blues are expected?',
    choices: ['84', '69', '35', '120'], a: 0,
    why: 'Expected frequency = 0.35 × 240 = 84.' },

  { id: 's2-019', mod: 'MS-S2', topic: 'Relative frequency', diff: 2,
    q: 'A drawing pin lands point up 34 times in 80 drops. What is the relative frequency of landing point up?',
    choices: ['0.425', '0.575', '2.353', '0.34'], a: 0,
    why: 'Relative frequency = \\frac{34}{80} = 0.425. This is an experimental estimate of the probability, not a theoretical one.' },

  { id: 's2-020', mod: 'MS-S2', topic: 'Relative frequency', diff: 2,
    q: 'What happens to relative frequency as the number of trials increases?',
    choices: ['It tends towards the theoretical probability', 'It always equals the theoretical probability', 'It becomes more variable', 'It tends towards 0.5'], a: 0,
    why: 'With more trials the relative frequency settles closer to the theoretical probability. It rarely equals it exactly for any finite number of trials.' },

  { id: 's2-021', mod: 'MS-S2', topic: 'Expected frequency', diff: 3,
    stem: 'A game costs $3 to play. You win $10 with probability \\frac{1}{5} and nothing otherwise.',
    q: 'What is the expected value per game to the player?',
    choices: ['−$1.00', '$2.00', '$7.00', '−$0.40'], a: 0,
    why: 'Expected return = \\frac{1}{5}(10) = $2.00, and the cost is $3.00, so the expected value is 2 − 3 = −$1.00. A negative expected value means the game favours the operator.' },

  { id: 's2-022', mod: 'MS-S2', topic: 'Multi-stage events', diff: 3,
    q: 'A machine works on any given day with probability 0.96. What is the probability it fails at least once in 5 independent days, to 4 decimal places?',
    choices: ['0.1846', '0.8154', '0.0400', '0.2000'], a: 0,
    why: 'P(never fails) = 0.96^5 = 0.8154. So P(at least one failure) = 1 − 0.8154 = 0.1846.' },

  { id: 's2-023', mod: 'MS-S2', topic: 'Sample space', diff: 2,
    q: 'Two dice are rolled and the totals recorded. Which total is most likely?',
    choices: ['7', '6', '12', '2'], a: 0,
    why: 'A total of 7 has six combinations (1+6, 2+5, 3+4 and their reverses) out of 36, more than any other total. A total of 12 has only one.' },

  { id: 's2-024', mod: 'MS-S2', topic: 'Sample space', diff: 3,
    q: 'Two dice are rolled. What is the probability the total is at least 10?',
    choices: ['\\frac{1}{6}', '\\frac{1}{12}', '\\frac{1}{4}', '\\frac{3}{36}'], a: 0,
    why: 'Totals of 10, 11 and 12 come from 3 + 2 + 1 = 6 of the 36 equally likely outcomes, so P = \\frac{6}{36} = \\frac{1}{6}.' }
]);
