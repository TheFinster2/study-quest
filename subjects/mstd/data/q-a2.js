/* ============================================================================
   q-a2.js — MS-A2 Linear Relationships (Year 11). 22 questions.
   ========================================================================== */
window.MS = window.MS || {};
window.MS.QUESTIONS = (window.MS.QUESTIONS || []).concat([

  { id: 'a2-001', mod: 'MS-A2', topic: 'Gradient and intercept', diff: 1,
    q: 'What is the gradient of the line y = 4x - 7?',
    choices: ['4', '−7', '7', '−4'], a: 0,
    why: 'In y = mx + c the gradient is m, so m = 4. The −7 is the y-intercept.' },

  { id: 'a2-002', mod: 'MS-A2', topic: 'Gradient and intercept', diff: 1,
    q: 'What is the y-intercept of the line y = -3x + 11?',
    choices: ['11', '−3', '3', '−11'], a: 0,
    why: 'In y = mx + c the y-intercept is c, so c = 11. The −3 is the gradient.' },

  { id: 'a2-003', mod: 'MS-A2', topic: 'Gradient and intercept', diff: 2,
    q: 'Find the gradient of the line through (2, 5) and (8, 23).',
    choices: ['3', '\\frac{1}{3}', '−3', '4.5'], a: 0,
    why: 'm = \\frac{23 - 5}{8 - 2} = \\frac{18}{6} = 3. Inverting the fraction gives \\frac{1}{3}.' },

  { id: 'a2-004', mod: 'MS-A2', topic: 'Gradient and intercept', diff: 2,
    q: 'Find the gradient of the line through (-3, 8) and (5, -4).',
    choices: ['−1.5', '1.5', '−0.67', '−12'], a: 0,
    why: 'm = \\frac{-4 - 8}{5 - (-3)} = \\frac{-12}{8} = -1.5. Getting the sign of the run wrong flips it positive.' },

  { id: 'a2-005', mod: 'MS-A2', topic: 'Graphing lines', diff: 2,
    q: 'A line has gradient 2 and passes through (0, -5). What is its equation?',
    choices: ['y = 2x - 5', 'y = -5x + 2', 'y = 2x + 5', 'y = 2(x - 5)'], a: 0,
    why: 'Gradient 2 and y-intercept −5 give y = 2x − 5 directly, since (0, −5) is on the y-axis.' },

  { id: 'a2-006', mod: 'MS-A2', topic: 'Graphing lines', diff: 2,
    q: 'Where does the line y = 3x - 12 cross the x-axis?',
    choices: ['(4, 0)', '(0, −12)', '(−4, 0)', '(12, 0)'], a: 0,
    why: 'Set y = 0: 3x − 12 = 0, so x = 4. The point is (4, 0). Setting x = 0 gives the y-intercept instead.' },

  { id: 'a2-007', mod: 'MS-A2', topic: 'Graphing lines', diff: 2,
    q: 'Rewrite 2x + 3y = 12 in gradient–intercept form.',
    choices: ['y = -\\frac{2}{3}x + 4', 'y = \\frac{2}{3}x + 4', 'y = -2x + 12', 'y = -\\frac{3}{2}x + 4'], a: 0,
    why: '3y = −2x + 12, so y = -\\frac{2}{3}x + 4. Forgetting to divide the 12 by 3 leaves +12.' },

  { id: 'a2-008', mod: 'MS-A2', topic: 'Graphing lines', diff: 2,
    q: 'Does the point (3, 7) lie on the line y = 2x + 1?',
    choices: ['Yes, since 2(3) + 1 = 7', 'No, since 2(3) + 1 = 6', 'No, since 2(7) + 1 = 15', 'Yes, since 3 + 7 = 10'], a: 0,
    why: 'Substitute x = 3: y = 2(3) + 1 = 7, which matches the given y-value, so the point is on the line.' },

  { id: 'a2-009', mod: 'MS-A2', topic: 'Direct variation', diff: 1,
    q: 'y varies directly with x, and y = 18 when x = 6. Find the constant of variation.',
    choices: ['3', '108', '\\frac{1}{3}', '12'], a: 0,
    why: 'y = kx, so k = \\frac{y}{x} = \\frac{18}{6} = 3. Multiplying gives 108, which is not a rate.' },

  { id: 'a2-010', mod: 'MS-A2', topic: 'Direct variation', diff: 2,
    q: 'y varies directly with x. When x = 4, y = 22. Find y when x = 14.',
    choices: ['77', '55', '32', '88'], a: 0,
    why: 'k = \\frac{22}{4} = 5.5, so y = 5.5 \\times 14 = 77.' },

  { id: 'a2-011', mod: 'MS-A2', topic: 'Direct variation', diff: 2,
    q: 'Which graph feature identifies direct variation?',
    choices: ['A straight line through the origin', 'A straight line with a positive y-intercept', 'A curve through the origin', 'Any straight line with positive gradient'], a: 0,
    why: 'Direct variation is y = kx with no constant term, so the line must pass through (0, 0). A non-zero y-intercept breaks the proportionality.' },

  { id: 'a2-012', mod: 'MS-A2', topic: 'Conversion graphs', diff: 2,
    stem: 'A conversion graph converts Australian dollars to euros. The line passes through (0, 0) and (50, 30).',
    q: 'How many euros would $180 convert to?',
    choices: ['€108', '€300', '€150', '€90'], a: 0,
    why: 'The rate is \\frac{30}{50} = 0.6 euros per dollar, so 180 \\times 0.6 = €108. Dividing by 0.6 instead gives €300.' },

  { id: 'a2-013', mod: 'MS-A2', topic: 'Conversion graphs', diff: 2,
    stem: 'A graph converts miles to kilometres and passes through (0, 0) and (10, 16).',
    q: 'How many miles is 72 km?',
    choices: ['45 miles', '115.2 miles', '56 miles', '88 miles'], a: 0,
    why: '1 mile is 1.6 km, so miles = \\frac{72}{1.6} = 45. Multiplying by 1.6 converts the wrong way.' },

  { id: 'a2-014', mod: 'MS-A2', topic: 'Graphing lines', diff: 2,
    stem: 'A phone plan charges a $25 monthly fee plus 12c per minute of calls.',
    q: 'Which equation models the monthly cost C in dollars for m minutes?',
    choices: ['C = 0.12m + 25', 'C = 12m + 25', 'C = 25m + 0.12', 'C = 0.12(m + 25)'], a: 0,
    why: '12 cents is $0.12, so the variable cost is 0.12m and the fixed fee is the constant 25.' },

  { id: 'a2-015', mod: 'MS-A2', topic: 'Graphing lines', diff: 2,
    stem: 'A plan costs C = 0.12m + 25 dollars for m minutes.',
    q: 'How many minutes of calls give a monthly bill of $46?',
    choices: ['175 minutes', '383 minutes', '105 minutes', '592 minutes'], a: 0,
    why: '46 = 0.12m + 25, so 0.12m = 21 and m = 175 minutes.' },

  { id: 'a2-016', mod: 'MS-A2', topic: 'Step graphs', diff: 2,
    stem: 'A car park charges $6 for up to 1 hour, $11 for up to 2 hours, $15 for up to 3 hours, then $18 all day.',
    q: 'What does a stay of 2 hours 10 minutes cost?',
    choices: ['$15', '$11', '$18', '$13'], a: 0,
    why: '2 h 10 min falls in the "up to 3 hours" band, so the charge is $15. Step graphs charge for the whole band you enter, not a pro rata amount.' },

  { id: 'a2-017', mod: 'MS-A2', topic: 'Step graphs', diff: 3,
    stem: 'A courier charges $9 for parcels up to 500 g, $14 up to 1 kg, and $19 up to 2 kg.',
    q: 'What is the cost of sending three parcels weighing 480 g, 900 g and 1.4 kg?',
    choices: ['$42', '$37', '$47', '$28'], a: 0,
    why: '480 g → $9, 900 g → $14, 1.4 kg → $19. Total = 9 + 14 + 19 = $42.' },

  { id: 'a2-018', mod: 'MS-A2', topic: 'Gradient and intercept', diff: 3,
    stem: 'A line passes through (2, 9) and (6, 21).',
    q: 'What is the equation of the line?',
    choices: ['y = 3x + 3', 'y = 3x - 3', 'y = 4x + 1', 'y = 3x + 9'], a: 0,
    why: 'm = \\frac{21 - 9}{6 - 2} = 3. Substituting (2, 9): 9 = 3(2) + c, so c = 3 and y = 3x + 3.' },

  { id: 'a2-019', mod: 'MS-A2', topic: 'Graphing lines', diff: 2,
    q: 'What does a gradient of zero mean for a line?',
    choices: ['It is horizontal', 'It is vertical', 'It passes through the origin', 'It has no y-intercept'], a: 0,
    why: 'Gradient zero means no rise for any run, so the line is horizontal: y = c. A vertical line has an undefined gradient, not a zero one.' },

  { id: 'a2-020', mod: 'MS-A2', topic: 'Direct variation', diff: 3,
    stem: 'The cost of carpet varies directly with the area laid. 24 m^2 costs $1,080.',
    q: 'What would 37 m^2 cost?',
    choices: ['$1,665.00', '$1,110.00', '$1,620.00', '$2,205.00'], a: 0,
    why: 'k = \\frac{1080}{24} = $45 per m^2. Cost = 45 \\times 37 = $1,665.00.' },

  { id: 'a2-021', mod: 'MS-A2', topic: 'Gradient and intercept', diff: 2,
    stem: 'A tank is being drained. Its volume in litres is V = 900 - 45t, where t is in minutes.',
    q: 'What does the gradient of −45 represent?',
    choices: ['The tank loses 45 L each minute', 'The tank holds 45 L when full', 'The tank empties after 45 minutes', 'The tank loses 45% of its volume each minute'], a: 0,
    why: 'The gradient is the rate of change of V with respect to t, so the volume falls by 45 litres every minute. The 900 is the starting volume.' },

  { id: 'a2-022', mod: 'MS-A2', topic: 'Graphing lines', diff: 3,
    stem: 'A tank drains according to V = 900 - 45t litres.',
    q: 'How long until the tank is empty?',
    choices: ['20 minutes', '45 minutes', '855 minutes', '18 minutes'], a: 0,
    why: 'Set V = 0: 900 − 45t = 0, so t = \\frac{900}{45} = 20 minutes.' }
]);
