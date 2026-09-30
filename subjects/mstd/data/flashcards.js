/* ============================================================================
   flashcards.js — 88 cards for the 5-box Leitner deck (§4.4).
   Shape: { id, mod, front, back }. `front` is the prompt, `back` the answer.
   Notation uses the §6.1 mini-language (\frac, ^, \deg, \pi, sqrt()).
   ========================================================================== */
window.MS = window.MS || {};
/* §D4 — append, never assign. A second card file that happened to sort
   BEFORE this one would have its cards silently overwritten by a plain
   assignment, and nothing would fail: the deck would just be smaller. The
   question banks already use this idiom; validate.js now requires it of
   every shared bank. */
window.MS.CARDS = (window.MS.CARDS || []).concat([
  /* ------------------------------------------------- MS-M1 measurement (14) */
  { id: 'k-m1-01', mod: 'MS-M1', front: 'Area of a circle', back: 'A = \\pi r^2' },
  { id: 'k-m1-02', mod: 'MS-M1', front: 'Circumference of a circle', back: 'C = 2\\pi r = \\pi d' },
  { id: 'k-m1-03', mod: 'MS-M1', front: 'Area of a trapezium', back: 'A = \\frac{h}{2}(a + b) — h is the perpendicular height, a and b the parallel sides' },
  { id: 'k-m1-04', mod: 'MS-M1', front: 'Area of a triangle (base and height)', back: 'A = \\frac{1}{2}bh' },
  { id: 'k-m1-05', mod: 'MS-M1', front: 'Surface area of a closed cylinder', back: 'SA = 2\\pi r^2 + 2\\pi rh — two circles plus the curved wrap' },
  { id: 'k-m1-06', mod: 'MS-M1', front: 'Surface area of a sphere', back: 'SA = 4\\pi r^2' },
  { id: 'k-m1-07', mod: 'MS-M1', front: 'Volume of a prism or cylinder', back: 'V = Ah — cross-sectional area × height. For a cylinder A = \\pi r^2.' },
  { id: 'k-m1-08', mod: 'MS-M1', front: 'Volume of a pyramid or cone', back: 'V = \\frac{1}{3}Ah — one third of the prism with the same base and height' },
  { id: 'k-m1-09', mod: 'MS-M1', front: 'Volume of a sphere', back: 'V = \\frac{4}{3}\\pi r^3' },
  { id: 'k-m1-10', mod: 'MS-M1', front: '1 m^3 in litres', back: '1 m^3 = 1000 L = 1 kL. Also 1 cm^3 = 1 mL.' },
  { id: 'k-m1-11', mod: 'MS-M1', front: 'Convert cm^2 to m^2', back: 'Divide by 10 000. Area factors are the length factor squared (100^2).' },
  { id: 'k-m1-12', mod: 'MS-M1', front: 'Convert m^3 to cm^3', back: 'Multiply by 1 000 000. Volume factors are the length factor cubed (100^3).' },
  { id: 'k-m1-13', mod: 'MS-M1', front: 'Absolute error from a measurement', back: 'Absolute error = \\frac{1}{2} \\times the precision of the instrument. Measured to the nearest cm gives \\pm 0.5 cm.' },
  { id: 'k-m1-14', mod: 'MS-M1', front: 'Percentage error', back: '% error = \\frac{absolute error}{measured value} \\times 100' },

  /* ------------------------------------------------------- MS-M2 time (5) */
  { id: 'k-m2-01', mod: 'MS-M2', front: 'Write 7:45 pm in 24-hour time', back: '1945. Add 12 hours to any pm time except 12-something pm.' },
  { id: 'k-m2-02', mod: 'MS-M2', front: 'Coordinated Universal Time', back: 'UTC — the reference for all time zones. Sydney is UTC+10, or UTC+11 in daylight saving.' },
  { id: 'k-m2-03', mod: 'MS-M2', front: 'Crossing the International Date Line travelling east', back: 'You subtract a day. Travelling west you add a day.' },
  { id: 'k-m2-04', mod: 'MS-M2', front: 'Time difference between UTC+10 and UTC−5', back: '15 hours. Subtract the offsets: 10 − (−5) = 15. The UTC+10 clock is ahead.' },
  { id: 'k-m2-05', mod: 'MS-M2', front: 'Convert 2 h 45 min to hours as a decimal', back: '2.75 h. 45 min = \\frac{45}{60} = 0.75 h — never write it as 2.45.' },

  /* ----------------------------------------------------- MS-F1 money (10) */
  { id: 'k-f1-01', mod: 'MS-F1', front: 'Gross pay vs net pay', back: 'Gross is before deductions; net is what reaches the bank. Net = gross − tax − other deductions.' },
  { id: 'k-f1-02', mod: 'MS-F1', front: 'Time-and-a-half and double time', back: 'Multiply the normal hourly rate by 1.5 or by 2, then by the overtime hours.' },
  { id: 'k-f1-03', mod: 'MS-F1', front: 'Annual leave loading', back: 'Usually 17.5% of the normal pay for the leave period, paid on top of it.' },
  { id: 'k-f1-04', mod: 'MS-F1', front: 'Pay periods in a year', back: '52 weekly, 26 fortnightly, 12 monthly. Not 24 fortnights — that is the classic error.' },
  { id: 'k-f1-05', mod: 'MS-F1', front: 'Add 10% GST to a pre-GST price', back: 'Multiply by 1.1.' },
  { id: 'k-f1-06', mod: 'MS-F1', front: 'Find the GST inside a GST-inclusive price', back: 'Divide the total by 11. Taking 10% of the inclusive total is wrong.' },
  { id: 'k-f1-07', mod: 'MS-F1', front: 'Find the pre-GST price from a GST-inclusive price', back: 'Divide by 1.1.' },
  { id: 'k-f1-08', mod: 'MS-F1', front: 'The tax-free threshold', back: 'The first $18,200 of taxable income is taxed at nil.' },
  { id: 'k-f1-09', mod: 'MS-F1', front: 'How a marginal tax bracket works', back: 'The rate applies only to the income above that bracket\'s lower limit — add it to the fixed base amount for the bracket.' },
  { id: 'k-f1-10', mod: 'MS-F1', front: 'The Medicare levy', back: '2% of taxable income, charged on the whole amount, on top of income tax.' },

  /* ------------------------------------------------------- MS-A1/A2 (7) */
  { id: 'k-a1-01', mod: 'MS-A1', front: 'Rearrange A = \\frac{1}{2}bh to make h the subject', back: 'h = \\frac{2A}{b}. Multiply both sides by 2, then divide by b.' },
  { id: 'k-a1-02', mod: 'MS-A1', front: 'Blood alcohol content formula (male)', back: 'BAC = \\frac{10N - 7.5H}{6.8M} — N standard drinks, H hours, M mass in kg.' },
  { id: 'k-a1-03', mod: 'MS-A1', front: 'Blood alcohol content formula (female)', back: 'BAC = \\frac{10N - 7.5H}{5.5M}' },
  { id: 'k-a1-04', mod: 'MS-A1', front: 'Time for BAC to reach zero', back: 'time = \\frac{BAC}{0.015} hours' },
  { id: 'k-a2-01', mod: 'MS-A2', front: 'Gradient from two points', back: 'm = \\frac{y_2 - y_1}{x_2 - x_1} — rise over run' },
  { id: 'k-a2-02', mod: 'MS-A2', front: 'Gradient–intercept form of a line', back: 'y = mx + c — m is the gradient, c the y-intercept' },
  { id: 'k-a2-03', mod: 'MS-A2', front: 'Direct variation', back: 'y = kx — the graph is a straight line through the origin, and k is the constant of variation.' },

  /* --------------------------------------------------- MS-S1 statistics (11) */
  { id: 'k-s1-01', mod: 'MS-S1', front: 'Categorical vs numerical data', back: 'Categorical is labels (nominal or ordinal); numerical is counts or measures (discrete or continuous).' },
  { id: 'k-s1-02', mod: 'MS-S1', front: 'Discrete vs continuous data', back: 'Discrete is counted in whole steps; continuous is measured and can take any value in a range.' },
  { id: 'k-s1-03', mod: 'MS-S1', front: 'Mean from a frequency table', back: 'x_bar = \\frac{\\Sigma fx}{\\Sigma f}' },
  { id: 'k-s1-04', mod: 'MS-S1', front: 'Median of an even number of scores', back: 'The average of the two middle scores once ordered.' },
  { id: 'k-s1-05', mod: 'MS-S1', front: 'Interquartile range', back: 'IQR = Q_3 - Q_1 — the spread of the middle 50%, and unaffected by outliers.' },
  { id: 'k-s1-06', mod: 'MS-S1', front: 'The outlier test', back: 'An outlier is below Q_1 - 1.5 \\times IQR or above Q_3 + 1.5 \\times IQR.' },
  { id: 'k-s1-07', mod: 'MS-S1', front: 'The five-number summary', back: 'Minimum, Q_1, median, Q_3, maximum — exactly what a box plot draws.' },
  { id: 'k-s1-08', mod: 'MS-S1', front: 'Positively skewed data', back: 'The tail stretches to the right. Usually mean > median.' },
  { id: 'k-s1-09', mod: 'MS-S1', front: 'Negatively skewed data', back: 'The tail stretches to the left. Usually mean < median.' },
  { id: 'k-s1-10', mod: 'MS-S1', front: 'Which average is resistant to outliers?', back: 'The median. One extreme score drags the mean but barely moves the median.' },
  { id: 'k-s1-11', mod: 'MS-S1', front: 'Range', back: 'Range = maximum − minimum. It uses only the two extreme scores, so it is very sensitive to outliers.' },

  /* -------------------------------------------------- MS-S2 probability (8) */
  { id: 'k-s2-01', mod: 'MS-S2', front: 'Theoretical probability of an event', back: 'P(E) = \\frac{number of favourable outcomes}{total number of outcomes}' },
  { id: 'k-s2-02', mod: 'MS-S2', front: 'Complementary events', back: 'P(not E) = 1 - P(E). The two probabilities always sum to 1.' },
  { id: 'k-s2-03', mod: 'MS-S2', front: 'Multiplying along a tree diagram', back: 'Multiply along the branches for "and"; add the branch results for "or".' },
  { id: 'k-s2-04', mod: 'MS-S2', front: 'Independent events', back: 'One outcome does not change the other\'s probability, so P(A and B) = P(A) \\times P(B).' },
  { id: 'k-s2-05', mod: 'MS-S2', front: 'Expected frequency', back: 'Expected frequency = P(E) \\times number of trials' },
  { id: 'k-s2-06', mod: 'MS-S2', front: 'Relative frequency', back: '\\frac{number of times the event occurred}{total number of trials} — an experimental estimate of probability.' },
  { id: 'k-s2-07', mod: 'MS-S2', front: 'Financial expectation', back: 'Expected value = \\Sigma (each outcome \\times its probability). A fair game has expected value zero.' },
  { id: 'k-s2-08', mod: 'MS-S2', front: 'With replacement vs without', back: 'With replacement the probabilities stay the same each draw; without, both the numerator and denominator change.' },

  /* ---------------------------------------------------- MS-M6 trig (10) */
  { id: 'k-m6-01', mod: 'MS-M6', front: "Pythagoras' theorem", back: 'c^2 = a^2 + b^2 — right-angled triangles only, c is the hypotenuse.' },
  { id: 'k-m6-02', mod: 'MS-M6', front: 'SOH CAH TOA', back: '\\sin\\theta = \\frac{opp}{hyp}, \\cos\\theta = \\frac{adj}{hyp}, \\tan\\theta = \\frac{opp}{adj}' },
  { id: 'k-m6-03', mod: 'MS-M6', front: 'The sine rule', back: '\\frac{a}{\\sin A} = \\frac{b}{\\sin B} = \\frac{c}{\\sin C} — use it when you have a side and its opposite angle.' },
  { id: 'k-m6-04', mod: 'MS-M6', front: 'The cosine rule (finding a side)', back: 'c^2 = a^2 + b^2 - 2ab\\cos C — use it for two sides and the included angle.' },
  { id: 'k-m6-05', mod: 'MS-M6', front: 'The cosine rule (finding an angle)', back: '\\cos C = \\frac{a^2 + b^2 - c^2}{2ab} — use it when you know all three sides.' },
  { id: 'k-m6-06', mod: 'MS-M6', front: 'Area of a triangle from two sides and the included angle', back: 'A = \\frac{1}{2}ab\\sin C' },
  { id: 'k-m6-07', mod: 'MS-M6', front: 'A true bearing', back: 'Measured clockwise from north, written with three digits: 075\\deg, 210\\deg.' },
  { id: 'k-m6-08', mod: 'MS-M6', front: 'The ambiguous case', back: 'Using the sine rule to find an obtuse-possible angle: the second solution is 180\\deg - \\theta. Check whether it still makes a valid triangle.' },
  { id: 'k-m6-09', mod: 'MS-M6', front: 'Angle of elevation vs depression', back: 'Elevation is measured up from the horizontal, depression down from it. They are equal between the same two points.' },
  { id: 'k-m6-10', mod: 'MS-M6', front: 'A radial survey', back: 'Distances and bearings taken from one central point. Split the region into triangles and use A = \\frac{1}{2}ab\\sin C on each.' },

  /* ------------------------------------------------- MS-M7 rates (7) */
  { id: 'k-m7-01', mod: 'MS-M7', front: 'Fuel consumption rate', back: 'L/100 km = \\frac{litres used}{distance in km} \\times 100' },
  { id: 'k-m7-02', mod: 'MS-M7', front: 'Convert a scale of 1:250 to real length', back: 'Multiply the drawing length by 250. 4 cm on the plan is 1000 cm = 10 m in reality.' },
  { id: 'k-m7-03', mod: 'MS-M7', front: 'Dividing a quantity in the ratio a:b', back: 'Total parts = a + b. Each share = \\frac{its part}{total parts} \\times the quantity.' },
  { id: 'k-m7-04', mod: 'MS-M7', front: 'Energy used by an appliance', back: 'kWh = power in kW \\times hours of use' },
  { id: 'k-m7-05', mod: 'MS-M7', front: 'Best buy', back: 'Compare unit prices — cost per 100 g, per litre, per item. The cheapest total is not always the best buy.' },
  { id: 'k-m7-06', mod: 'MS-M7', front: 'Heart rate reserve maximum', back: 'Maximum heart rate is estimated as 220 − age beats per minute.' },
  { id: 'k-m7-07', mod: 'MS-M7', front: 'Convert km/h to m/s', back: 'Divide by 3.6. Going the other way, multiply by 3.6.' },

  /* ---------------------------------------------- MS-F4/F5 finance (12) */
  { id: 'k-f4-01', mod: 'MS-F4', front: 'Simple interest', back: 'I = Prn — P principal, r the rate per period as a decimal, n the number of periods. The interest is the same every period.' },
  { id: 'k-f4-02', mod: 'MS-F4', front: 'Compound interest final amount', back: 'FV = PV(1 + r)^n. The interest itself earns interest.' },
  { id: 'k-f4-03', mod: 'MS-F4', front: 'Compound interest EARNED', back: 'I = FV - PV. Subtract the principal — the formula gives the total, not the interest.' },
  { id: 'k-f4-04', mod: 'MS-F4', front: 'Rate per period for monthly compounding', back: 'Divide the annual rate by 12 and count n in months. 6% p.a. monthly is r = 0.005, and 5 years is n = 60.' },
  { id: 'k-f4-05', mod: 'MS-F4', front: 'Straight-line depreciation', back: 'S = V_0 - Dn — the same dollar amount comes off every year.' },
  { id: 'k-f4-06', mod: 'MS-F4', front: 'Declining-balance depreciation', back: 'S = V_0(1 - r)^n — a fixed percentage of what is left, so the dollar drop shrinks each year.' },
  { id: 'k-f4-07', mod: 'MS-F4', front: 'Which depreciation reaches zero?', back: 'Straight-line eventually hits zero. Declining balance never quite does — it approaches zero.' },
  { id: 'k-f4-08', mod: 'MS-F4', front: 'Dividend yield', back: 'Dividend yield = \\frac{dividend per share}{market price per share} \\times 100%' },
  { id: 'k-f4-09', mod: 'MS-F4', front: 'Price-to-earnings ratio', back: 'P/E = \\frac{market price per share}{earnings per share}' },
  { id: 'k-f5-01', mod: 'MS-F5', front: 'What an annuity is', back: 'A series of equal payments made at equal intervals — superannuation contributions, loan repayments.' },
  { id: 'k-f5-02', mod: 'MS-F5', front: 'Using a future value annuity table', back: 'Find the row for n periods and the column for the rate per period, then multiply the factor by the contribution per period.' },
  { id: 'k-f5-03', mod: 'MS-F5', front: 'Using a present value annuity table', back: 'PV factor × payment gives the amount borrowed. Divide the loan principal by the factor to get the repayment.' },

  /* -------------------------------------------- MS-S4/S5 statistics (9) */
  { id: 'k-s4-01', mod: 'MS-S4', front: "What Pearson's r measures", back: 'The strength and direction of a LINEAR association, from −1 to +1. 0 means no linear relationship.' },
  { id: 'k-s4-02', mod: 'MS-S4', front: 'Interpreting r = −0.87', back: 'A strong negative linear association — as one variable rises the other falls, and the points sit close to a line.' },
  { id: 'k-s4-03', mod: 'MS-S4', front: 'Least-squares regression line', back: 'y = mx + b, fitted to minimise the sum of the squared vertical distances from the points.' },
  { id: 'k-s4-04', mod: 'MS-S4', front: 'Interpolation vs extrapolation', back: 'Interpolation predicts inside the data range and is reasonably reliable; extrapolation goes outside it and is not.' },
  { id: 'k-s4-05', mod: 'MS-S4', front: 'Correlation and causation', back: 'Correlation never proves causation. A third variable, coincidence or reverse causation can all produce it.' },
  { id: 'k-s5-01', mod: 'MS-S5', front: 'z-score formula', back: 'z = \\frac{x - x_bar}{s} — how many standard deviations a score sits from the mean.' },
  { id: 'k-s5-02', mod: 'MS-S5', front: 'The empirical rule', back: '68% within 1 standard deviation, 95% within 2, 99.7% within 3.' },
  { id: 'k-s5-03', mod: 'MS-S5', front: 'Percentage above z = 2', back: '2.5%. 95% sits within \\pm 2, leaving 5% split between the two tails.' },
  { id: 'k-s5-04', mod: 'MS-S5', front: 'Comparing results from different tests', back: 'Convert both to z-scores. The higher z is the better relative performance, whatever the raw marks.' },

  /* ------------------------------------------------- MS-N1/N2 networks (12) */
  { id: 'k-n1-01', mod: 'MS-N1', front: 'Degree of a vertex', back: 'The number of edges meeting at it. A loop counts twice.' },
  { id: 'k-n1-02', mod: 'MS-N1', front: 'A connected graph', back: 'Every vertex can be reached from every other vertex by some path.' },
  { id: 'k-n1-03', mod: 'MS-N1', front: 'A tree', back: 'A connected graph with no cycles. A tree on n vertices has exactly n − 1 edges.' },
  { id: 'k-n1-04', mod: 'MS-N1', front: 'A minimum spanning tree', back: 'The set of edges connecting every vertex with the smallest possible total weight, and no cycles.' },
  { id: 'k-n1-05', mod: 'MS-N1', front: "Prim's algorithm", back: 'Start at any vertex and repeatedly add the cheapest edge that connects a NEW vertex to the tree you have grown.' },
  { id: 'k-n1-06', mod: 'MS-N1', front: "Kruskal's algorithm", back: 'Sort all edges by weight and add them cheapest-first, skipping any edge that would form a cycle.' },
  { id: 'k-n1-07', mod: 'MS-N1', front: 'Eulerian trail vs circuit', back: 'A trail uses every edge once and exists when exactly 0 or 2 vertices have odd degree. A circuit also returns to the start and needs all degrees even.' },
  { id: 'k-n1-08', mod: 'MS-N1', front: 'Hamiltonian path', back: 'Visits every VERTEX exactly once. Eulerian is about edges, Hamiltonian is about vertices.' },
  { id: 'k-n2-01', mod: 'MS-N2', front: 'Forward scanning finds', back: 'The earliest start time for each activity, and so the minimum completion time for the whole project.' },
  { id: 'k-n2-02', mod: 'MS-N2', front: 'Backward scanning finds', back: 'The latest start time for each activity without delaying the project.' },
  { id: 'k-n2-03', mod: 'MS-N2', front: 'Float time', back: 'Float = latest start time − earliest start time. It is how long an activity can slip without pushing the finish out.' },
  { id: 'k-n2-04', mod: 'MS-N2', front: 'The critical path', back: 'The longest path through the network. Every activity on it has zero float, so any delay there delays the whole project.' }
]);
