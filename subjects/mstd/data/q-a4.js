/* ============================================================================
   q-a4.js — MS-A4 Types of Relationships (Year 12). 24 questions.
   ========================================================================== */
window.MS = window.MS || {};
window.MS.QUESTIONS = (window.MS.QUESTIONS || []).concat([

  { id: 'a4-001', mod: 'MS-A4', topic: 'Simultaneous equations', diff: 2,
    q: 'Solve simultaneously: x + y = 12 and x - y = 4.',
    choices: ['x = 8, y = 4', 'x = 4, y = 8', 'x = 6, y = 6', 'x = 16, y = 8'], a: 0,
    why: 'Adding the equations eliminates y: 2x = 16, so x = 8. Then y = 12 − 8 = 4.' },

  { id: 'a4-002', mod: 'MS-A4', topic: 'Simultaneous equations', diff: 2,
    q: 'Solve simultaneously: 2x + 3y = 19 and x = y + 2.',
    choices: ['x = 5, y = 3', 'x = 3, y = 5', 'x = 7, y = 5', 'x = 4, y = 2'], a: 0,
    why: 'Substituting x = y + 2 gives 2(y + 2) + 3y = 19, so 5y = 15 and y = 3. Then x = 5.' },

  { id: 'a4-003', mod: 'MS-A4', topic: 'Simultaneous equations', diff: 3,
    q: 'Solve simultaneously: 3x + 2y = 16 and 5x - 2y = 8.',
    choices: ['x = 3, y = 3.5', 'x = 3.5, y = 3', 'x = 2, y = 5', 'x = 4, y = 2'], a: 0,
    why: 'Adding eliminates y: 8x = 24, so x = 3. Then 9 + 2y = 16, giving y = 3.5.' },

  { id: 'a4-004', mod: 'MS-A4', topic: 'Simultaneous equations', diff: 2,
    q: 'What does the point of intersection of two lines represent?',
    choices: ['The simultaneous solution of both equations', 'The gradient of both lines', 'The midpoint of the two lines', 'The y-intercept of both lines'], a: 0,
    why: 'The intersection is the only (x, y) pair that satisfies both equations at once, which is exactly what "solve simultaneously" means.' },

  { id: 'a4-005', mod: 'MS-A4', topic: 'Simultaneous equations', diff: 3,
    stem: 'Adult tickets cost $18 and child tickets $11. 140 tickets were sold for a total of $2,065.',
    q: 'How many adult tickets were sold?',
    choices: ['75', '65', '80', '60'], a: 0,
    why: 'With a + c = 140 and 18a + 11c = 2065: substituting c = 140 − a gives 18a + 1540 − 11a = 2065, so 7a = 525 and a = 75.' },

  { id: 'a4-006', mod: 'MS-A4', topic: 'Break-even analysis', diff: 2,
    stem: 'A stall has fixed costs of $240 and each item costs $3 to make. Items sell for $8.',
    q: 'How many items must be sold to break even?',
    choices: ['48', '30', '80', '22'], a: 0,
    why: 'Break even where 8n = 240 + 3n, so 5n = 240 and n = 48. The $5 is the contribution margin per item.' },

  { id: 'a4-007', mod: 'MS-A4', topic: 'Break-even analysis', diff: 2,
    stem: 'A stall has fixed costs of $240, variable cost $3 per item, and sells items for $8.',
    q: 'What is the revenue at the break-even point?',
    choices: ['$384.00', '$240.00', '$144.00', '$624.00'], a: 0,
    why: 'Break-even quantity is 48 items, so revenue = 48 × $8 = $384.00. At break-even, revenue equals total cost, and the total cost is 240 + 3(48) = $384.00 too.' },

  { id: 'a4-008', mod: 'MS-A4', topic: 'Break-even analysis', diff: 3,
    stem: 'Cost is C = 5n + 900 and revenue is R = 14n.',
    q: 'What is the profit on 200 units?',
    choices: ['$900.00', '$1,800.00', '$2,800.00', '$1,000.00'], a: 0,
    why: 'R = 14(200) = $2,800 and C = 5(200) + 900 = $1,900. Profit = 2800 − 1900 = $900.00. Revenue alone is not profit.' },

  { id: 'a4-009', mod: 'MS-A4', topic: 'Break-even analysis', diff: 2,
    q: 'On a break-even graph, what does the vertical intercept of the cost line represent?',
    choices: ['The fixed costs', 'The break-even quantity', 'The variable cost per unit', 'The selling price'], a: 0,
    why: 'At zero units the only cost incurred is the fixed cost, so that is where the cost line meets the vertical axis. The gradient is the variable cost per unit.' },

  { id: 'a4-010', mod: 'MS-A4', topic: 'Quadratic models', diff: 2,
    q: 'For y = x^2 - 6x + 5, what are the x-intercepts?',
    choices: ['x = 1 and x = 5', 'x = -1 and x = -5', 'x = 2 and x = 3', 'x = 6 and x = 5'], a: 0,
    why: 'Factorise: (x − 1)(x − 5) = 0, so x = 1 or x = 5. Check: 1 × 5 = 5 and −1 − 5 = −6. ✓' },

  { id: 'a4-011', mod: 'MS-A4', topic: 'Quadratic models', diff: 3,
    q: 'For y = x^2 - 6x + 5, what is the x-coordinate of the vertex?',
    choices: ['3', '6', '−3', '1'], a: 0,
    why: 'The vertex sits midway between the roots: \\frac{1 + 5}{2} = 3. Equivalently x = -\\frac{b}{2a} = \\frac{6}{2} = 3.' },

  { id: 'a4-012', mod: 'MS-A4', topic: 'Quadratic models', diff: 3,
    stem: 'A ball is thrown and its height in metres is h = 20t - 5t^2, where t is in seconds.',
    q: 'What is the maximum height reached?',
    choices: ['20 m', '15 m', '40 m', '25 m'], a: 0,
    why: 'The roots are t = 0 and t = 4, so the maximum is at t = 2. h = 20(2) − 5(4) = 40 − 20 = 20 m.' },

  { id: 'a4-013', mod: 'MS-A4', topic: 'Quadratic models', diff: 2,
    stem: 'A ball\'s height is h = 20t - 5t^2 metres.',
    q: 'When does the ball return to the ground?',
    choices: ['t = 4 s', 't = 2 s', 't = 5 s', 't = 20 s'], a: 0,
    why: 'Set h = 0: 5t(4 − t) = 0, giving t = 0 (launch) or t = 4 s (landing).' },

  { id: 'a4-014', mod: 'MS-A4', topic: 'Exponential models', diff: 2,
    q: 'A population is P = 500(1.08)^t. What does the 1.08 mean?',
    choices: ['8% growth each period', '8% decay each period', 'A starting population of 8', '108 individuals added each period'], a: 0,
    why: 'A base above 1 means growth, and 1.08 = 1 + 0.08, so the population grows 8% per period. The 500 is the starting value.' },

  { id: 'a4-015', mod: 'MS-A4', topic: 'Exponential models', diff: 2,
    q: 'A population is P = 500(1.08)^t. Find P when t = 10, to the nearest whole number.',
    choices: ['1,079', '900', '5,400', '1,000'], a: 0,
    why: 'P = 500 × 1.08^{10} = 500 × 2.1589 = 1,079. Multiplying 500 by 0.08 × 10 gives the wrong linear answer of 900.' },

  { id: 'a4-016', mod: 'MS-A4', topic: 'Exponential models', diff: 2,
    q: 'A quantity is Q = 800(0.85)^t. What does the model describe?',
    choices: ['Decay of 15% per period', 'Growth of 85% per period', 'Decay of 85% per period', 'Growth of 15% per period'], a: 0,
    why: 'A base below 1 means decay, and 0.85 = 1 − 0.15, so 15% is lost each period and 85% remains.' },

  { id: 'a4-017', mod: 'MS-A4', topic: 'Exponential models', diff: 3,
    q: 'A radioactive sample halves every 6 years. What fraction remains after 24 years?',
    choices: ['\\frac{1}{16}', '\\frac{1}{4}', '\\frac{1}{8}', '\\frac{1}{24}'], a: 0,
    why: '24 ÷ 6 = 4 half-lives, so the fraction remaining is \\left(\\frac{1}{2}\\right)^4 = \\frac{1}{16}.' },

  { id: 'a4-018', mod: 'MS-A4', topic: 'Reciprocal models', diff: 2,
    q: 'For y = \\frac{24}{x}, find y when x = 6.',
    choices: ['4', '144', '18', '30'], a: 0,
    why: 'y = \\frac{24}{6} = 4. This is inverse variation: doubling x halves y.' },

  { id: 'a4-019', mod: 'MS-A4', topic: 'Reciprocal models', diff: 2,
    q: 'What shape is the graph of y = \\frac{k}{x} for k > 0 and x > 0?',
    choices: ['A curve falling towards but never reaching the axes', 'A straight line through the origin', 'A parabola opening upwards', 'A horizontal line'], a: 0,
    why: 'It is one branch of a hyperbola. As x grows, y approaches zero without reaching it, and as x approaches zero, y grows without bound — both axes are asymptotes.' },

  { id: 'a4-020', mod: 'MS-A4', topic: 'Direct and inverse variation', diff: 3,
    stem: 'The time to complete a job varies inversely with the number of workers. 6 workers take 14 days.',
    q: 'How long would 21 workers take?',
    choices: ['4 days', '49 days', '9 days', '1.75 days'], a: 0,
    why: 'k = 6 × 14 = 84 worker-days. With 21 workers, t = \\frac{84}{21} = 4 days. More workers means less time, so the answer must be smaller than 14.' },

  { id: 'a4-021', mod: 'MS-A4', topic: 'Direct and inverse variation', diff: 2,
    q: 'y varies inversely with x. Which equation matches?',
    choices: ['y = \\frac{k}{x}', 'y = kx', 'y = kx^2', 'y = k + x'], a: 0,
    why: 'Inverse variation means the product xy is constant, so y = \\frac{k}{x}. Direct variation is y = kx.' },

  { id: 'a4-022', mod: 'MS-A4', topic: 'Quadratic models', diff: 3,
    stem: 'A rectangular pen has a fixed perimeter of 40 m. Its area is A = x(20 - x), where x is one side length.',
    q: 'What value of x gives the maximum area?',
    choices: ['10 m', '20 m', '5 m', '40 m'], a: 0,
    why: 'The roots of A = x(20 − x) are x = 0 and x = 20, so the maximum is midway at x = 10 m. That makes it a 10 × 10 square with area 100 m^2 — a square always maximises area for a fixed perimeter.' },

  { id: 'a4-023', mod: 'MS-A4', topic: 'Simultaneous equations', diff: 2,
    q: 'Two lines have the same gradient but different y-intercepts. How many simultaneous solutions are there?',
    choices: ['None — the lines are parallel', 'Exactly one', 'Infinitely many', 'Two'], a: 0,
    why: 'Parallel lines never meet, so there is no point satisfying both equations. Identical lines would give infinitely many.' },

  { id: 'a4-024', mod: 'MS-A4', topic: 'Exponential models', diff: 3,
    stem: 'A social media post has 40 shares and the count grows 25% per hour.',
    q: 'How many shares after 5 hours, to the nearest whole number?',
    choices: ['122', '90', '50', '156'], a: 0,
    why: 'Shares = 40 × 1.25^5 = 40 × 3.0518 = 122. Adding 25% of 40 five times gives the linear answer of 90 and understates compound growth.' }
]);
