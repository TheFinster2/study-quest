/* ============================================================================
   q-f5.js — MS-F5 Annuities (Year 12). 24 questions.

   §4.3: NESA examines annuities with FUTURE VALUE and PRESENT VALUE INTEREST
   FACTOR TABLES. Every factor quoted below is taken from js/data/annuity.js,
   and validate.js checks each quoted figure against the shipped table.
   ========================================================================== */
window.MS = window.MS || {};
window.MS.QUESTIONS = (window.MS.QUESTIONS || []).concat([

  { id: 'f5-001', mod: 'MS-F5', topic: 'Future value of an annuity', diff: 1,
    q: 'What is an annuity?',
    choices: ['A series of equal payments made at equal intervals', 'A single lump-sum investment that is left alone to grow', 'A loan that charges no interest at all over its term', 'A tax charged on the income from an investment'], a: 0,
    why: 'Superannuation contributions and loan repayments are both annuities. The equal payments at equal intervals are what make the interest factor tables work.' },

  { id: 'f5-002', mod: 'MS-F5', topic: 'Using annuity tables', diff: 2,
    stem: 'In a future value interest factor table, the factor for 20 periods at 5% per period is 33.0660.',
    q: '$3,000 is contributed at the end of each year for 20 years at 5% p.a. What is the future value?',
    choices: ['$99,198.00', '$60,000.00', '$90.72', '$63,000.00'], a: 0,
    why: 'FV = contribution × factor = 3000 × 33.0660 = $99,198.00. The $60,000 of contributions has earned $39,198 in interest.' },

  { id: 'f5-003', mod: 'MS-F5', topic: 'Using annuity tables', diff: 2,
    stem: 'A future value factor table gives 12.3356 for 12 periods at 0.5% per period.',
    q: '$250 is paid in at the end of each month for 12 months at 6% p.a. compounded monthly. What is the future value?',
    choices: ['$3,083.90', '$3,000.00', '$20.27', '$3,180.00'], a: 0,
    why: '6% p.a. monthly is 0.5% per period, so use the 0.5% column and n = 12. FV = 250 × 12.3356 = $3,083.90.' },

  { id: 'f5-004', mod: 'MS-F5', topic: 'Using annuity tables', diff: 3,
    stem: 'A present value factor table gives 22.0232 for 25 periods at 1% per period.',
    q: 'A loan is repaid with $500 at the end of each month for 25 months at 1% per month. How much was borrowed?',
    choices: ['$11,011.60', '$12,500.00', '$22.70', '$13,278.90'], a: 0,
    why: 'PV = payment × factor = 500 × 22.0232 = $11,011.60. That is what those 25 repayments are worth today; the extra $1,488.40 paid is interest.' },

  { id: 'f5-005', mod: 'MS-F5', topic: 'Using annuity tables', diff: 2,
    q: 'In an annuity table, what do the rows and columns represent?',
    choices: ['Rows are the number of periods, columns the rate per period', 'Rows are the rate per period, columns the number of whole years', 'Rows are the size of the payment, columns the term in years', 'Rows are the principal borrowed, columns the interest rate'], a: 0,
    why: 'You locate the row for n periods and the column for the rate PER PERIOD, then read the factor at their intersection.' },

  { id: 'f5-006', mod: 'MS-F5', topic: 'Using annuity tables', diff: 3,
    q: 'A loan is at 6% p.a. compounded monthly over 10 years. Which row and column do you use?',
    choices: ['Row 120, column 0.5%', 'Row 10, column 6%', 'Row 120, column 6%', 'Row 10, column 0.5%'], a: 0,
    why: 'Convert both to the compounding period: rate per month = \\frac{6\\%}{12} = 0.5%, and n = 10 × 12 = 120 months. Using annual figures with monthly compounding is the most common table error.' },

  { id: 'f5-007', mod: 'MS-F5', topic: 'Using annuity tables', diff: 2,
    q: 'To find the REPAYMENT on a loan from its present value factor, what do you do?',
    choices: ['Divide the principal by the factor', 'Multiply the principal by the factor', 'Add the factor to the principal', 'Divide the factor by the principal'], a: 0,
    why: 'Principal = repayment × factor, so repayment = \\frac{principal}{factor}. Multiplying answers the reverse question — what a known repayment can borrow.' },

  { id: 'f5-008', mod: 'MS-F5', topic: 'Future value of an annuity', diff: 2,
    q: 'Which formula gives the future value of an annuity?',
    choices: ['FV = a \\times \\frac{(1+r)^n - 1}{r}', 'FV = a(1+r)^n', 'FV = \\frac{a}{r}', 'FV = a \\times \\frac{(1+r)^n - 1}{r(1+r)^n}'], a: 0,
    why: 'That is the future value form. The last option, with the extra (1+r)^n in the denominator, is the PRESENT value formula.' },

  { id: 'f5-009', mod: 'MS-F5', topic: 'Present value of an annuity', diff: 2,
    q: 'What does the present value of an annuity tell you?',
    choices: ['What the future stream of payments is worth today', 'What the payments will total at the end of the term', 'The interest earned over the whole term of the annuity', 'The size of the payment needed in each period'], a: 0,
    why: 'PV discounts every future payment back to today. For a loan, it is the amount that can be borrowed given a repayment.' },

  { id: 'f5-010', mod: 'MS-F5', topic: 'Superannuation', diff: 2,
    q: '$4,000 is paid into a super fund at the end of each year for 10 years at 7% p.a. The FV factor for 10 periods at 7% is 13.8164. What is the balance?',
    choices: ['$55,265.60', '$40,000.00', '$68,000.00', '$28,000.00'], a: 0,
    why: 'FV = 4000 × 13.8164 = $55,265.60. Contributions total $40,000, so $15,265.60 is earnings.' },

  { id: 'f5-011', mod: 'MS-F5', topic: 'Superannuation', diff: 3,
    q: 'Why does a contribution made 20 years before retirement grow so much more than one made 2 years before?',
    choices: ['It compounds for 18 more periods', 'It attracts a higher interest rate', 'It is taxed at a lower rate', 'Early contributions are matched by the employer'], a: 0,
    why: 'Each contribution grows by (1 + r) for every remaining period, so time in the fund is what does the work. That is why the FV factor rises steeply with n.' },

  { id: 'f5-012', mod: 'MS-F5', topic: 'Loan repayment schedules', diff: 2,
    stem: 'A loan schedule row reads: opening $12,400.00, interest $62.00, repayment $400.00.',
    q: 'What is the closing balance?',
    choices: ['$12,062.00', '$12,000.00', '$12,738.00', '$11,938.00'], a: 0,
    why: 'Closing = opening + interest − repayment = 12400 + 62 − 400 = $12,062.00. The interest is ADDED before the repayment comes off.' },

  { id: 'f5-013', mod: 'MS-F5', topic: 'Loan repayment schedules', diff: 2,
    stem: 'A loan of $12,400 is charged interest of $62.00 in one month.',
    q: 'What is the monthly interest rate?',
    choices: ['0.5%', '5%', '0.05%', '1.99%'], a: 0,
    why: 'r = \\frac{62}{12400} = 0.005 = 0.5% per month, which is 6% p.a. compounded monthly.' },

  { id: 'f5-014', mod: 'MS-F5', topic: 'Loan repayment schedules', diff: 3,
    q: 'In a reducing-balance schedule, why does the final repayment often differ from the others?',
    choices: ['It only needs to clear the remaining balance plus its interest', 'The interest rate changes for the very last period of the loan', 'The bank adds a closing fee to the final repayment', 'Rounding is applied only at the end of the schedule'], a: 0,
    why: 'By the last period the outstanding balance is usually less than a full repayment, so the final payment is trimmed to exactly clear the debt.' },

  { id: 'f5-015', mod: 'MS-F5', topic: 'Loan repayment schedules', diff: 3,
    q: 'Why must interest be rounded to the cent EVERY period rather than once at the end?',
    choices: ['Because the bank does, and the balances diverge otherwise', 'Because the interest rate is itself a rounded number', 'Because it makes the arithmetic easier to do by hand', 'Because the tables are only given to four decimal places'], a: 0,
    why: 'Each period\'s rounded interest becomes part of the next period\'s balance. Over 25 years, rounding once at the end gives a visibly different final balance from the bank\'s.' },

  { id: 'f5-016', mod: 'MS-F5', topic: 'Using annuity tables', diff: 3,
    q: 'A table has rows for 1–12, 15, 20, 25 and 30 periods. You need 13 periods. What now?',
    choices: ['Use the formula instead', 'Round to the 12-period row', 'Average the 12 and 15 rows', 'Use the 15-period row'], a: 0,
    why: 'Interest factors are not linear, so interpolating or rounding introduces real error. Use FV factor = \\frac{(1+r)^n - 1}{r} directly.' },

  { id: 'f5-017', mod: 'MS-F5', topic: 'Future value of an annuity', diff: 3,
    q: 'The FV factor for 30 periods at 6% is 79.0582. What annual contribution reaches $500,000 after 30 years at 6% p.a.?',
    choices: ['$6,324.45', '$16,666.67', '$39,529,100.00', '$4,166.67'], a: 0,
    why: 'FV = a × factor, so a = \\frac{500000}{79.0582} = $6,324.45. Multiplying instead of dividing gives an absurd figure — a useful sanity check.' },

  { id: 'f5-018', mod: 'MS-F5', topic: 'Present value of an annuity', diff: 3,
    q: 'The PV factor for 20 periods at 4% is 13.5903. What can be borrowed with repayments of $900 per period?',
    choices: ['$12,231.27', '$18,000.00', '$66.22', '$15,102.55'], a: 0,
    why: 'PV = 900 × 13.5903 = $12,231.27. The 20 repayments total $18,000, so $5,768.73 of that is interest.' },

  { id: 'f5-019', mod: 'MS-F5', topic: 'Superannuation', diff: 2,
    q: 'A fund pays 8% p.a. compounded half-yearly. What rate per period do you use in the table?',
    choices: ['4%', '8%', '0.67%', '16%'], a: 0,
    why: 'Half-yearly means 2 periods per year: r = \\frac{8\\%}{2} = 4% per half-year, and n is counted in half-years.' },

  { id: 'f5-020', mod: 'MS-F5', topic: 'Using annuity tables', diff: 2,
    q: 'Why is the FV factor for 1 period always exactly 1.0000?',
    choices: ['The single payment is made at the end, so it earns no interest', 'The interest rate simply does not apply during period 1', 'The table starts counting its periods from zero, not one', 'Rounding to four decimal places makes the factor 1.0000'], a: 0,
    why: 'In an ordinary annuity payments are made at the END of each period, so the one payment in a single-period annuity is deposited and immediately measured — no time to earn interest.' },

  { id: 'f5-021', mod: 'MS-F5', topic: 'Present value of an annuity', diff: 3,
    q: 'As the number of periods increases, what happens to the PRESENT value factor?',
    choices: ['It rises but by smaller and smaller amounts', 'It rises at a steadily increasing rate throughout', 'It falls towards zero as the term goes on', 'It stays constant for the whole of the term'], a: 0,
    why: 'Each extra payment is discounted more heavily than the last, so it adds less to the total. The factor approaches \\frac{1}{r} as n grows — 20 at 5%, for instance.' },

  { id: 'f5-022', mod: 'MS-F5', topic: 'Loan repayment schedules', diff: 3,
    stem: 'A $9,000 loan at 0.75% per month is repaid at $500 per month.',
    q: 'What is the closing balance after the first repayment?',
    choices: ['$8,567.50', '$8,500.00', '$8,432.50', '$9,067.50'], a: 0,
    why: 'Interest = 9000 × 0.0075 = $67.50. Closing = 9000 + 67.50 − 500 = $8,567.50. Only $432.50 of the $500 reduced the debt.' },

  { id: 'f5-023', mod: 'MS-F5', topic: 'Superannuation', diff: 3,
    q: 'What happens to the future value of a super fund if the contribution is doubled, all else equal?',
    choices: ['It doubles, since FV is proportional to the contribution', 'It more than doubles, because of the extra compounding', 'It rises by less than double over the same term', 'It depends on the interest rate that is being used'], a: 0,
    why: 'FV = a × factor, and the factor depends only on r and n. Doubling a doubles FV exactly. Doubling the TERM is what produces a more-than-proportional increase.' },

  { id: 'f5-024', mod: 'MS-F5', topic: 'Present value of an annuity', diff: 2,
    q: 'Two loans have the same repayment and rate, but one runs 10 years and the other 20. Which lets you borrow more?',
    choices: ['The 20-year loan, because its PV factor is larger', 'The 10-year loan, because less interest accrues on it', 'They both allow exactly the same amount to be borrowed', 'It depends entirely on the principal being borrowed'], a: 0,
    why: 'A longer term has a larger PV factor, so the same repayment supports a bigger principal — but the total interest paid is much higher.' }
]);
