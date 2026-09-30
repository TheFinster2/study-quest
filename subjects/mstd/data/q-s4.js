/* ============================================================================
   q-s4.js — MS-S4 Bivariate Data Analysis (Year 12). 26 questions.
   ========================================================================== */
window.MS = window.MS || {};
window.MS.QUESTIONS = (window.MS.QUESTIONS || []).concat([

  { id: 's4-001', mod: 'MS-S4', topic: 'Scatterplots', diff: 1,
    q: 'What does a scatterplot display?',
    choices: ['The relationship between two numerical variables', 'The frequency of a single numerical variable in classes', 'The proportion of the data falling in each category', 'The five-number summary of a single numerical data set'], a: 0,
    why: 'Each point plots one observation\'s value on two numerical variables, so the pattern of points shows how they relate.' },

  { id: 's4-002', mod: 'MS-S4', topic: 'Scatterplots', diff: 2,
    q: 'On a scatterplot of hours studied against exam mark, which is the explanatory variable?',
    choices: ['Hours studied, plotted on the horizontal axis', 'Exam mark, plotted on the horizontal axis instead', 'Hours studied, plotted on the vertical axis instead', 'Neither — the two variables are interchangeable here'], a: 0,
    why: 'The explanatory (independent) variable goes on the horizontal axis and the response variable on the vertical. Here study hours are thought to explain the mark, not the reverse.' },

  { id: 's4-003', mod: 'MS-S4', topic: 'Correlation', diff: 1,
    q: 'What range can Pearson\'s correlation coefficient r take?',
    choices: ['−1 to 1', '0 to 1', '0 to 100', '−100 to 100'], a: 0,
    why: 'r runs from −1 (perfect negative linear association) through 0 (none) to +1 (perfect positive).' },

  { id: 's4-004', mod: 'MS-S4', topic: 'Correlation', diff: 2,
    q: 'How would you describe r = −0.89?',
    choices: ['Strong negative linear association', 'Weak negative linear association', 'Strong positive linear association', 'No association'], a: 0,
    why: 'The sign gives the direction (negative) and |r| = 0.89 gives the strength (strong). Strength and direction are separate pieces of information.' },

  { id: 's4-005', mod: 'MS-S4', topic: 'Correlation', diff: 2,
    q: 'How would you describe r = 0.21?',
    choices: ['Weak positive linear association', 'Strong positive linear association', 'Weak negative linear association', 'Moderate positive linear association'], a: 0,
    why: '|r| = 0.21 is below 0.3, which is conventionally weak. The positive sign means the trend rises.' },

  { id: 's4-006', mod: 'MS-S4', topic: 'Correlation', diff: 3,
    q: 'A scatterplot shows a clear strong CURVED pattern. What would r be?',
    choices: ['Possibly near zero, because r only measures LINEAR association', 'Close to 1, because the pattern in the scatterplot is very strong', 'Exactly zero, because the relationship is not a straight line', 'Undefined, because r cannot be calculated for curved data'], a: 0,
    why: 'r measures how close the points are to a straight line. A strong non-linear relationship — a U-shape, for instance — can produce an r near zero even though the variables are clearly related.' },

  { id: 's4-007', mod: 'MS-S4', topic: "Pearson's r", diff: 2,
    q: 'What does r = 0 tell you?',
    choices: ['There is no LINEAR association', 'The variables are unrelated in every way', 'The data has no variability', 'The regression line is horizontal at zero'], a: 0,
    why: 'It rules out a linear trend only. A curved relationship can still be present, which is why you always look at the scatterplot as well as r.' },

  { id: 's4-008', mod: 'MS-S4', topic: "Pearson's r", diff: 3,
    q: 'Does a value of r closer to −1 indicate a weaker association than one closer to +1?',
    choices: ['No — strength depends on |r|, so −0.95 is stronger than +0.6', 'Yes — a negative value of r is always the weaker of the two values', 'Yes — only a positive r indicates that any association exists', 'It depends entirely on the size of the sample that was collected'], a: 0,
    why: 'Strength comes from the absolute value. r = −0.95 describes a very strong (negative) association, stronger than r = +0.6.' },

  { id: 's4-009', mod: 'MS-S4', topic: 'Least-squares regression', diff: 2,
    q: 'What does the least-squares regression line minimise?',
    choices: ['The sum of the squared vertical distances from the points', 'The number of data points sitting above the fitted line drawn', 'The horizontal distances from the points across to the line', 'The gradient of the line drawn through the data points'], a: 0,
    why: 'It minimises \\Sigma(vertical residuals)^2. Squaring means large misses count much more than small ones, which is why outliers move the line.' },

  { id: 's4-010', mod: 'MS-S4', topic: 'Least-squares regression', diff: 2,
    stem: 'The least-squares line is y = 3.31x + 8.73.',
    q: 'Predict y when x = 8, to 2 decimal places.',
    choices: ['35.21', '26.48', '11.04', '96.99'], a: 0,
    why: 'y = 3.31(8) + 8.73 = 26.48 + 8.73 = 35.21. Forgetting the intercept gives 26.48.' },

  { id: 's4-011', mod: 'MS-S4', topic: 'Least-squares regression', diff: 2,
    stem: 'The least-squares line for exam mark against hours studied is y = 4.2x + 31.',
    q: 'What does the gradient of 4.2 mean?',
    choices: ['Each extra hour of study predicts 4.2 more marks', 'A student who studies for 4.2 hours will score zero', 'The average mark across the whole group surveyed is 4.2', 'About 4.2% of the students improved their exam marks'], a: 0,
    why: 'The gradient is the predicted change in y for a ONE-unit increase in x. The 31 is the predicted mark for zero hours.' },

  { id: 's4-012', mod: 'MS-S4', topic: 'Least-squares regression', diff: 2,
    stem: 'The least-squares line for exam mark against hours studied is y = 4.2x + 31.',
    q: 'What does the intercept of 31 represent?',
    choices: ['The predicted mark for zero hours of study', 'The number of students who took part in the survey', 'The average number of hours the whole group studied', 'The highest mark it was possible to score on the exam'], a: 0,
    why: 'The vertical intercept is the predicted y when x = 0. Whether that prediction is meaningful depends on whether x = 0 sits inside the data range.' },

  { id: 's4-013', mod: 'MS-S4', topic: 'Interpolation and extrapolation', diff: 2,
    q: 'What is interpolation?',
    choices: ['Predicting inside the range of the data', 'Predicting outside the range of the data', 'Calculating the correlation coefficient', 'Removing outliers before fitting'], a: 0,
    why: 'Interpolation predicts within the observed range and is reasonably reliable. Extrapolation goes beyond it and is not.' },

  { id: 's4-014', mod: 'MS-S4', topic: 'Interpolation and extrapolation', diff: 2,
    stem: 'Data was collected for x between 5 and 40. The line is y = 2.1x + 14.',
    q: 'Predicting y at x = 90 is an example of what, and how reliable is it?',
    choices: ['Extrapolation, and unreliable', 'Interpolation, and reliable', 'Extrapolation, and reliable', 'Interpolation, and unreliable'], a: 0,
    why: 'x = 90 is far outside the observed 5–40 range, so it is extrapolation. There is no evidence the linear trend continues that far.' },

  { id: 's4-015', mod: 'MS-S4', topic: 'Interpolation and extrapolation', diff: 3,
    q: 'Why is extrapolation risky even when r is very close to 1?',
    choices: ['The relationship may not stay linear beyond the observed range', 'A high value of r means that the underlying data must really be curved', 'r cannot be trusted at all when the sample size is small', 'Extrapolation always inverts the sign of the gradient found'], a: 0,
    why: 'A high r says the trend fits well WHERE THE DATA IS. Outside that range the relationship may bend, plateau or reverse, and the data cannot tell you which.' },

  { id: 's4-016', mod: 'MS-S4', topic: 'Causation', diff: 2,
    q: 'Ice cream sales and drowning deaths are strongly positively correlated. What is the most likely explanation?',
    choices: ['A third variable — hot weather — affects both', 'Eating more ice cream directly causes the drownings', 'Drowning incidents somehow cause the ice cream sales', 'The correlation must simply be a calculation error'], a: 0,
    why: 'Hot weather independently raises both ice cream sales and swimming. That third variable is a confounding variable, and it is the classic illustration that correlation is not causation.' },

  { id: 's4-017', mod: 'MS-S4', topic: 'Causation', diff: 2,
    q: 'What is needed to establish that one variable CAUSES another?',
    choices: ['A controlled experiment', 'A correlation coefficient above 0.9', 'A large sample size', 'A least-squares line with a small residual'], a: 0,
    why: 'Only an experiment that controls other variables can establish causation. Observational correlation, however strong, cannot rule out confounding.' },

  { id: 's4-018', mod: 'MS-S4', topic: 'Causation', diff: 3,
    q: 'Which of these could explain a strong correlation WITHOUT causation?',
    choices: ['A confounding variable affecting both', 'A large value of r', 'A least-squares line through the origin', 'Interpolation within the data range'], a: 0,
    why: 'Confounding, coincidence in a small sample, and reverse causation can all produce a strong correlation with no causal link from x to y.' },

  { id: 's4-019', mod: 'MS-S4', topic: 'Scatterplots', diff: 2,
    q: 'A single point sits far from the trend on a scatterplot. What effect does it have on the least-squares line?',
    choices: ['It can pull the line noticeably towards itself', 'It has no effect, since the line uses averages', 'It shifts the line but not its gradient', 'It only affects r, not the line'], a: 0,
    why: 'Least squares minimises SQUARED residuals, so a far-off point contributes disproportionately and drags the line. It also weakens r.' },

  { id: 's4-020', mod: 'MS-S4', topic: 'Least-squares regression', diff: 3,
    stem: 'A least-squares line is y = -1.8x + 96.',
    q: 'What happens to y as x increases by 5?',
    choices: ['It decreases by 9', 'It increases by 9', 'It decreases by 1.8', 'It increases by 96'], a: 0,
    why: 'The gradient is −1.8 per unit of x, so over 5 units the change is 5 × (−1.8) = −9, a decrease of 9.' },

  { id: 's4-021', mod: 'MS-S4', topic: 'Correlation', diff: 3,
    q: 'Two variables have r = 0.95 in a sample of 4 observations. What is the concern?',
    choices: ['With so few points, a high r can arise by chance', 'r can never exceed 0.9 when there are only 4 points', 'The sample is far too large for this to be reliable', 'r should have been recalculated as a percentage value'], a: 0,
    why: 'Very small samples produce high correlations easily — four points can look almost collinear by luck. Sample size matters as much as the value of r.' },

  { id: 's4-022', mod: 'MS-S4', topic: 'Scatterplots', diff: 2,
    q: 'A scatterplot shows points scattered with no pattern. What does that suggest about r?',
    choices: ['r is close to zero', 'r is close to 1', 'r is close to −1', 'r cannot be calculated'], a: 0,
    why: 'No visible trend means no linear association, so r sits near zero. It can still be computed — it will just be small.' },

  { id: 's4-023', mod: 'MS-S4', topic: "Pearson's r", diff: 2,
    q: 'Does swapping which variable goes on which axis change r?',
    choices: ['No — r is the same either way', 'Yes — r changes sign completely', 'Yes — the value of r is inverted', 'Yes — r becomes undefined here'], a: 0,
    why: 'r is symmetric in the two variables. The LEAST-SQUARES LINE does change, because it minimises vertical distances, but r does not.' },

  { id: 's4-024', mod: 'MS-S4', topic: 'Least-squares regression', diff: 3,
    stem: 'For the points (1,12), (2,15), (3,19), (4,22), (5,26), (6,28) the least-squares line is y = 3.31x + 8.73.',
    q: 'What is the residual for the point (3, 19), to 2 decimal places?',
    choices: ['0.33', '−0.33', '18.67', '3.31'], a: 0,
    why: 'Predicted y = 3.31(3) + 8.73 = 18.67. Residual = actual − predicted = 19 − 18.67 = 0.33. A positive residual means the point sits above the line.' },

  { id: 's4-025', mod: 'MS-S4', topic: 'Correlation', diff: 3,
    stem: 'For the points (1,12), (2,15), (3,19), (4,22), (5,26), (6,28), r = 0.9971.',
    q: 'What does this tell you?',
    choices: ['A very strong positive linear association', 'Only a moderate positive linear association', 'A very strong negative linear association', 'That x is definitely the cause of y here'], a: 0,
    why: 'r = 0.9971 is almost 1, so the points sit very close to a rising straight line. It says nothing at all about causation.' },

  { id: 's4-026', mod: 'MS-S4', topic: 'Scatterplots', diff: 2,
    q: 'Which of these would you NOT use a scatterplot for?',
    choices: ['Comparing the frequency of favourite colours', 'Height against arm span, measured for each student', 'Rainfall against crop yield, measured across farms', 'Age against resting heart rate for each person'], a: 0,
    why: 'Favourite colour is categorical, so there is nothing numerical to plot on an axis — a bar chart or sector graph suits that. The other three pair two numerical variables.' }
]);
