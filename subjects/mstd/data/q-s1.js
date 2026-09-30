/* ============================================================================
   q-s1.js — MS-S1 Data Analysis (Year 11). 26 questions.
   ========================================================================== */
window.MS = window.MS || {};
window.MS.QUESTIONS = (window.MS.QUESTIONS || []).concat([

  { id: 's1-001', mod: 'MS-S1', topic: 'Classifying data', diff: 1,
    q: 'What type of data is a person\'s eye colour?',
    choices: ['Nominal categorical', 'Ordinal categorical', 'Discrete numerical', 'Continuous numerical'], a: 0,
    why: 'Eye colour is a label with no natural order, so it is nominal categorical. Ordinal data has a meaningful order, like a rating scale.' },

  { id: 's1-002', mod: 'MS-S1', topic: 'Classifying data', diff: 1,
    q: 'What type of data is the number of cars in a household?',
    choices: ['Discrete numerical', 'Continuous numerical', 'Ordinal categorical', 'Nominal categorical'], a: 0,
    why: 'It is counted in whole steps, so it is discrete numerical. Continuous data is measured and can take any value in a range.' },

  { id: 's1-003', mod: 'MS-S1', topic: 'Classifying data', diff: 2,
    q: 'What type of data is a survey response of "strongly agree, agree, neutral, disagree"?',
    choices: ['Ordinal categorical', 'Nominal categorical', 'Discrete numerical', 'Continuous numerical'], a: 0,
    why: 'These are labels WITH a natural order, which makes them ordinal categorical. Coding them 1–4 does not make them numerical.' },

  { id: 's1-004', mod: 'MS-S1', topic: 'Classifying data', diff: 2,
    q: 'What type of data is the time taken to run 100 m?',
    choices: ['Continuous numerical', 'Discrete numerical', 'Ordinal categorical', 'Nominal categorical'], a: 0,
    why: 'Time is measured and can take any value in a range, so it is continuous numerical — even when it is recorded to two decimal places.' },

  { id: 's1-005', mod: 'MS-S1', topic: 'Mean median mode', diff: 1,
    q: 'Find the mean of 4, 7, 9, 12, 18.',
    choices: ['10', '9', '50', '14'], a: 0,
    why: 'Mean = \\frac{4 + 7 + 9 + 12 + 18}{5} = \\frac{50}{5} = 10. The median is 9.' },

  { id: 's1-006', mod: 'MS-S1', topic: 'Mean median mode', diff: 1,
    q: 'Find the median of 12, 5, 9, 21, 7, 14.',
    choices: ['10.5', '9', '11.3', '14'], a: 0,
    why: 'Ordered: 5, 7, 9, 12, 14, 21. With 6 scores the median is the average of the 3rd and 4th: \\frac{9 + 12}{2} = 10.5.' },

  { id: 's1-007', mod: 'MS-S1', topic: 'Mean median mode', diff: 2,
    q: 'A data set is 3, 5, 5, 8, 9, 42. Which measure best describes the centre?',
    choices: ['The median, because 42 is an outlier', 'The mean, because it uses every score', 'The mode, because 5 appears twice', 'The range, because it shows the spread'], a: 0,
    why: 'The mean is 12, which is larger than all but one score — 42 has dragged it. The median of 6.5 sits among the bulk of the data. The range is a measure of spread, not centre.' },

  { id: 's1-008', mod: 'MS-S1', topic: 'Frequency tables', diff: 2,
    stem: 'Scores and frequencies:',
    table: { head: ['Score (x)', 'Frequency (f)'], rows: [['1', '3'], ['2', '5'], ['3', '8'], ['4', '4']] },
    q: 'How many scores are in the data set?',
    choices: ['20', '10', '4', '54'], a: 0,
    why: '\\Sigma f = 3 + 5 + 8 + 4 = 20. Adding the scores instead of the frequencies gives 10.' },

  { id: 's1-009', mod: 'MS-S1', topic: 'Frequency tables', diff: 2,
    stem: 'Scores and frequencies:',
    table: { head: ['Score (x)', 'Frequency (f)'], rows: [['1', '3'], ['2', '5'], ['3', '8'], ['4', '4']] },
    q: 'Find the mean, to 2 decimal places.',
    choices: ['2.65', '2.50', '5.30', '13.25'], a: 0,
    why: '\\Sigma fx = 1(3) + 2(5) + 3(8) + 4(4) = 3 + 10 + 24 + 16 = 53. Mean = \\frac{53}{20} = 2.65. Dividing 53 by 4 gives 13.25.' },

  { id: 's1-010', mod: 'MS-S1', topic: 'Frequency tables', diff: 2,
    stem: 'Scores and frequencies:',
    table: { head: ['Score (x)', 'Frequency (f)'], rows: [['1', '3'], ['2', '5'], ['3', '8'], ['4', '4']] },
    q: 'What is the mode?',
    choices: ['3', '8', '2.65', '4'], a: 0,
    why: 'The mode is the SCORE with the highest frequency. The highest frequency is 8, which belongs to the score 3.' },

  { id: 's1-011', mod: 'MS-S1', topic: 'Frequency tables', diff: 3,
    stem: 'Scores and frequencies:',
    table: { head: ['Score (x)', 'Frequency (f)'], rows: [['1', '3'], ['2', '5'], ['3', '8'], ['4', '4']] },
    q: 'What is the median?',
    choices: ['3', '2.5', '2', '2.65'], a: 0,
    why: 'With 20 scores the median is the average of the 10th and 11th. Cumulative frequencies are 3, 8, 16, 20 — both the 10th and 11th scores fall in the "3" group, so the median is 3.' },

  { id: 's1-012', mod: 'MS-S1', topic: 'Range and IQR', diff: 1,
    q: 'Find the range of 14, 9, 22, 6, 31.',
    choices: ['25', '16.4', '22', '14'], a: 0,
    why: 'Range = maximum − minimum = 31 − 6 = 25. It uses only the extremes, which makes it very sensitive to outliers.' },

  { id: 's1-013', mod: 'MS-S1', topic: 'Range and IQR', diff: 2,
    q: 'For 3, 5, 8, 11, 14, 18, 21, 26, 30, find the interquartile range.',
    choices: ['17', '27', '14', '12.5'], a: 0,
    why: 'With 9 scores the median is the 5th, which is 14. The lower half is 3, 5, 8, 11, so Q₁ = \\frac{5+8}{2} = 6.5. The upper half is 18, 21, 26, 30, so Q₃ = \\frac{21+26}{2} = 23.5. IQR = 23.5 − 6.5 = 17. The range, 30 − 3 = 27, is a different measure entirely.' },

  { id: 's1-014', mod: 'MS-S1', topic: 'Range and IQR', diff: 2,
    q: 'Why is the interquartile range often preferred to the range?',
    choices: ['It ignores the extreme values', 'It is always larger', 'It uses every score in the set', 'It is easier to calculate'], a: 0,
    why: 'IQR = Q₃ − Q₁ describes the middle 50%, so a single extreme score does not change it. The range depends entirely on the two extremes.' },

  { id: 's1-015', mod: 'MS-S1', topic: 'Outliers', diff: 2,
    q: 'A data set has Q₁ = 22 and Q₃ = 34. What is the upper outlier boundary?',
    choices: ['52', '46', '40', '58'], a: 0,
    why: 'IQR = 34 − 22 = 12, so 1.5 × IQR = 18. Upper boundary = Q₃ + 18 = 34 + 18 = 52.' },

  { id: 's1-016', mod: 'MS-S1', topic: 'Outliers', diff: 2,
    q: 'A data set has Q₁ = 22 and Q₃ = 34. What is the lower outlier boundary?',
    choices: ['4', '10', '16', '−4'], a: 0,
    why: 'IQR = 12 and 1.5 × IQR = 18. Lower boundary = Q₁ − 18 = 22 − 18 = 4.' },

  { id: 's1-017', mod: 'MS-S1', topic: 'Outliers', diff: 3,
    q: 'For the set 8, 11, 13, 14, 16, 17, 41, which value is an outlier?',
    choices: ['41', '8', 'None of them', 'Both 8 and 41'], a: 0,
    why: 'The median is 14. Q₁ = 11 and Q₃ = 17, so IQR = 6 and 1.5 × IQR = 9. The boundaries are 11 − 9 = 2 and 17 + 9 = 26. Only 41 lies outside.' },

  { id: 's1-018', mod: 'MS-S1', topic: 'Box plots', diff: 2,
    stem: 'A box plot has minimum 12, Q₁ = 19, median 26, Q₃ = 33, maximum 45.',
    q: 'What is the interquartile range?',
    choices: ['14', '33', '7', '26'], a: 0,
    why: 'IQR = Q₃ − Q₁ = 33 − 19 = 14. The range would be 45 − 12 = 33.' },

  { id: 's1-019', mod: 'MS-S1', topic: 'Box plots', diff: 2,
    stem: 'A box plot has minimum 12, Q₁ = 19, median 26, Q₃ = 33, maximum 45.',
    q: 'What percentage of the data lies between 19 and 33?',
    choices: ['50%', '25%', '75%', '68%'], a: 0,
    why: 'Q₁ to Q₃ always contains the middle 50% of the data, by definition of the quartiles.' },

  { id: 's1-020', mod: 'MS-S1', topic: 'Box plots', diff: 3,
    stem: 'A box plot has minimum 12, Q₁ = 19, median 26, Q₃ = 33, maximum 45.',
    q: 'What percentage of the data lies above 33?',
    choices: ['25%', '50%', '33%', '75%'], a: 0,
    why: 'Q₃ = 33 cuts off the top quarter, so 25% of scores lie above it.' },

  { id: 's1-021', mod: 'MS-S1', topic: 'Shape and skew', diff: 2,
    q: 'In a positively skewed distribution, how do the mean and median usually compare?',
    choices: ['Mean is greater than median', 'Median is greater than mean', 'They are equal', 'Mean equals the mode'], a: 0,
    why: 'A positive skew has a tail stretching to the right, and those large values pull the mean up more than the median. So mean > median.' },

  { id: 's1-022', mod: 'MS-S1', topic: 'Shape and skew', diff: 2,
    q: 'A distribution has a long tail towards the low values. What is its shape?',
    choices: ['Negatively skewed', 'Positively skewed', 'Symmetric', 'Bimodal'], a: 0,
    why: 'The skew is named for the direction of the TAIL, so a tail towards low values is negative skew. Mean < median in that case.' },

  { id: 's1-023', mod: 'MS-S1', topic: 'Data displays', diff: 2,
    q: 'Which display is most appropriate for comparing two data sets side by side?',
    choices: ['Parallel box plots', 'A single histogram', 'A sector graph', 'A dot plot of the combined data'], a: 0,
    why: 'Parallel box plots put both five-number summaries on the same scale, so centre and spread are directly comparable. Combining the data hides the comparison.' },

  { id: 's1-024', mod: 'MS-S1', topic: 'Data displays', diff: 2,
    q: 'Which display is best for showing the proportion of a total made up by each category?',
    choices: ['A sector graph', 'A histogram', 'A stem-and-leaf plot', 'A scatterplot'], a: 0,
    why: 'A sector (pie) graph divides a circle in proportion to each category, which is exactly a parts-of-a-whole display. Histograms show numerical distributions.' },

  { id: 's1-025', mod: 'MS-S1', topic: 'Data displays', diff: 3,
    stem: 'A stem-and-leaf plot: 2 | 3 7 ; 3 | 1 4 4 8 ; 4 | 0 2 5 ; 5 | 6. Key: 2 | 3 means 23.',
    q: 'What is the median?',
    choices: ['36', '34', '38', '37'], a: 0,
    why: 'Reading the leaves off gives 23, 27, 31, 34, 34, 38, 40, 42, 45, 56 — ten values, already in order. The median is the average of the 5th and 6th: \\frac{34 + 38}{2} = 36. Taking only the 5th score gives 34.' },

  { id: 's1-026', mod: 'MS-S1', topic: 'Data displays', diff: 2,
    q: 'What does the height of a bar in a histogram of grouped data represent?',
    choices: ['The frequency of that class', 'The class width', 'The cumulative frequency', 'The mean of that class'], a: 0,
    why: 'Each bar\'s height is the frequency of scores falling in that class interval. Cumulative frequency needs a separate ogive.' }
]);
