/* ============================================================================
   topics.js — the Mathematics Standard 2 topic tree (§4.1). Pure data.

   Codes follow the NESA Mathematics Standard syllabus. Year 11 content is the
   Standard common course; Year 12 is Standard 2. Every question's `mod` field
   must be one of these codes — validate.js fails the build otherwise.
   ========================================================================== */
window.MS = window.MS || {};
window.MS.TOPICS = (window.MS.TOPICS || []).concat([
  /* ------------------------------------- Year 11 (common to Standard 1 & 2) */
  { code: 'MS-A1', nm: 'Formulae and Equations', yr: 11, ic: '🧮', strand: 'Algebra',
    subs: ['Substitution', 'Rearranging formulae', 'Blood alcohol content', 'Medication dosage', 'Linear equations'] },
  { code: 'MS-A2', nm: 'Linear Relationships', yr: 11, ic: '📉', strand: 'Algebra',
    subs: ['Graphing lines', 'Gradient and intercept', 'Direct variation', 'Conversion graphs', 'Step graphs'] },
  { code: 'MS-M1', nm: 'Applications of Measurement', yr: 11, ic: '📐', strand: 'Measurement',
    subs: ['Units and prefixes', 'Absolute and percentage error', 'Perimeter', 'Area', 'Surface area', 'Volume and capacity', 'Mass and density'] },
  { code: 'MS-M2', nm: 'Working with Time', yr: 11, ic: '🕓', strand: 'Measurement',
    subs: ['12 and 24-hour time', 'Elapsed time', 'Time zones', 'Timetables'] },
  { code: 'MS-F1', nm: 'Money Matters', yr: 11, ic: '💵', strand: 'Financial Mathematics',
    subs: ['Wages and salary', 'Overtime', 'Commission and piecework', 'Allowances and leave loading', 'PAYG tax', 'GST', 'Budgeting'] },
  { code: 'MS-S1', nm: 'Data Analysis', yr: 11, ic: '📊', strand: 'Statistical Analysis',
    subs: ['Classifying data', 'Frequency tables', 'Data displays', 'Mean median mode', 'Range and IQR', 'Outliers', 'Box plots', 'Shape and skew'] },
  { code: 'MS-S2', nm: 'Relative Frequency and Probability', yr: 11, ic: '🎲', strand: 'Statistical Analysis',
    subs: ['Sample space', 'Complementary events', 'Multi-stage events', 'Tree diagrams', 'Venn diagrams', 'Independence', 'Expected frequency', 'Relative frequency'] },

  /* -------------------------------------------------- Year 12 (Standard 2) */
  { code: 'MS-A4', nm: 'Types of Relationships', yr: 12, ic: '📈', strand: 'Algebra',
    subs: ['Simultaneous equations', 'Break-even analysis', 'Quadratic models', 'Exponential models', 'Reciprocal models', 'Direct and inverse variation'] },
  { code: 'MS-M6', nm: 'Non-right-angled Trigonometry', yr: 12, ic: '🧭', strand: 'Measurement',
    subs: ['Pythagoras', 'Right-angled trigonometry', 'Sine rule', 'Cosine rule', 'Area rule', 'Bearings', 'Radial surveys', 'The ambiguous case', 'Angles of elevation'] },
  { code: 'MS-M7', nm: 'Rates and Ratios', yr: 12, ic: '⚖️', strand: 'Measurement',
    subs: ['Unit rates', 'Fuel consumption', 'Heart rate', 'Energy and power', 'Scale drawings', 'Ratio and proportion', 'Dividing quantities', 'Best buy'] },
  { code: 'MS-F4', nm: 'Investments and Loans', yr: 12, ic: '🏦', strand: 'Financial Mathematics',
    subs: ['Simple interest', 'Compound interest', 'Appreciation', 'Straight-line depreciation', 'Declining-balance depreciation', 'Shares and dividends', 'Inflation', 'Reducing-balance loans', 'Credit cards'] },
  { code: 'MS-F5', nm: 'Annuities', yr: 12, ic: '📋', strand: 'Financial Mathematics',
    subs: ['Future value of an annuity', 'Present value of an annuity', 'Using annuity tables', 'Superannuation', 'Loan repayment schedules'] },
  { code: 'MS-S4', nm: 'Bivariate Data Analysis', yr: 12, ic: '🔗', strand: 'Statistical Analysis',
    subs: ['Scatterplots', 'Correlation', "Pearson's r", 'Least-squares regression', 'Interpolation and extrapolation', 'Causation'] },
  { code: 'MS-S5', nm: 'The Normal Distribution', yr: 12, ic: '🔔', strand: 'Statistical Analysis',
    subs: ['z-scores', 'The empirical rule', 'Comparing scores', 'Quality control', 'Percentiles'] },
  { code: 'MS-N1', nm: 'Networks and Paths', yr: 12, ic: '🕸️', strand: 'Networks',
    subs: ['Network terminology', 'Degree and connectedness', 'Weighted graphs', 'Minimum spanning trees', "Prim's algorithm", "Kruskal's algorithm", 'Shortest path', 'Eulerian and Hamiltonian'] },
  { code: 'MS-N2', nm: 'Critical Path Analysis', yr: 12, ic: '⏳', strand: 'Networks',
    subs: ['Activity charts', 'Network diagrams', 'Forward scanning', 'Backward scanning', 'Float time', 'The critical path', 'Minimum completion time'] }
]);
