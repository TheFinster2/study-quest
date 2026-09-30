/* ============================================================================
   q-f4.js — MS-F4 Investments and Loans (Year 12). 32 questions.
   Every money figure was computed with the cents engine before being written
   here, and validate.js re-checks that each one round-trips through cents.
   ========================================================================== */
window.MS = window.MS || {};
window.MS.QUESTIONS = (window.MS.QUESTIONS || []).concat([

  { id: 'f4-001', mod: 'MS-F4', topic: 'Simple interest', diff: 1,
    q: '$8,000 is invested at 5.5% p.a. simple interest for 6 years. How much interest is earned?',
    choices: ['$2,640.00', '$3,067.90', '$440.00', '$10,640.00'], a: 0,
    why: 'I = Prn = 8000 × 0.055 × 6 = $2,640.00. The final balance would be $10,640.00, but the question asks only for the interest.' },

  { id: 'f4-002', mod: 'MS-F4', topic: 'Simple interest', diff: 2,
    q: 'How long does $5,000 take to earn $1,200 interest at 4% p.a. simple interest?',
    choices: ['6 years', '4 years', '24 years', '3 years'], a: 0,
    why: 'From I = Prn: 1200 = 5000 × 0.04 × n, so 1200 = 200n and n = 6 years.' },

  { id: 'f4-003', mod: 'MS-F4', topic: 'Simple interest', diff: 2,
    q: 'What rate of simple interest turns $12,000 into $15,600 in 5 years?',
    choices: ['6% p.a.', '3% p.a.', '30% p.a.', '5.2% p.a.'], a: 0,
    why: 'Interest = 15600 − 12000 = $3,600. From I = Prn: 3600 = 12000 × r × 5, so r = \\frac{3600}{60000} = 0.06 = 6% p.a.' },

  { id: 'f4-004', mod: 'MS-F4', topic: 'Simple interest', diff: 2,
    q: 'How does simple interest differ from compound interest?',
    choices: ['Simple interest is always calculated on the original principal', 'Simple interest is always the larger amount', 'Simple interest compounds annually only', 'Simple interest requires monthly payments'], a: 0,
    why: 'Simple interest is Prn — the same dollar amount every period, always based on the original principal. Compound interest earns interest on the interest already added.' },

  { id: 'f4-005', mod: 'MS-F4', topic: 'Compound interest', diff: 2,
    q: '$12,000 is invested at 6% p.a. compounded annually for 5 years. What is the final value?',
    choices: ['$16,058.70', '$15,600.00', '$4,058.70', '$16,200.00'], a: 0,
    why: 'FV = 12000(1.06)^5 = 12000 × 1.338226 = $16,058.70. Simple interest at the same rate would give only $15,600.00.' },

  { id: 'f4-006', mod: 'MS-F4', topic: 'Compound interest', diff: 2,
    q: '$12,000 is invested at 6% p.a. compounded annually for 5 years. How much INTEREST is earned?',
    choices: ['$4,058.70', '$16,058.70', '$3,600.00', '$3,821.40'], a: 0,
    why: 'Interest = FV − PV = 16,058.70 − 12,000 = $4,058.70. The formula gives the total, so you must subtract the principal.' },

  { id: 'f4-007', mod: 'MS-F4', topic: 'Compound interest', diff: 3,
    q: '$5,000 is invested at 4.8% p.a. compounded MONTHLY for 3 years. What is the final value?',
    choices: ['$5,772.76', '$5,754.30', '$5,720.00', '$6,215.20'], a: 0,
    why: 'Rate per period r = \\frac{0.048}{12} = 0.004 and n = 3 × 12 = 36 periods. FV = 5000(1.004)^{36} = $5,772.76. Using r = 0.048 with n = 3 gives $5,754.30 and is the classic error.' },

  { id: 'f4-008', mod: 'MS-F4', topic: 'Compound interest', diff: 3,
    q: '$20,000 is invested at 7% p.a. compounded QUARTERLY for 4 years. What is the final value?',
    choices: ['$26,398.61', '$26,215.60', '$25,600.00', '$28,142.00'], a: 0,
    why: 'r = \\frac{0.07}{4} = 0.0175 and n = 4 × 4 = 16 quarters. FV = 20000(1.0175)^{16} = $26,398.61.' },

  { id: 'f4-009', mod: 'MS-F4', topic: 'Compound interest', diff: 2,
    q: 'For 9% p.a. compounded monthly over 6 years, what are r and n?',
    choices: ['r = 0.0075, n = 72', 'r = 0.09, n = 6', 'r = 0.0075, n = 6', 'r = 0.09, n = 72'], a: 0,
    why: 'Divide the annual rate by the number of periods per year and count n in those same periods: r = \\frac{0.09}{12} = 0.0075 and n = 6 × 12 = 72.' },

  { id: 'f4-010', mod: 'MS-F4', topic: 'Compound interest', diff: 3,
    q: 'Which gives the largest final value on the same principal, rate and term?',
    choices: ['Monthly compounding', 'Quarterly compounding', 'Half-yearly compounding', 'Annual compounding'], a: 0,
    why: 'The more often interest is added, the sooner it starts earning interest itself. So monthly beats quarterly beats half-yearly beats annual.' },

  { id: 'f4-011', mod: 'MS-F4', topic: 'Appreciation', diff: 2,
    q: 'A house worth $350,000 appreciates at 4% p.a. What is it worth after 8 years?',
    choices: ['$478,999.18', '$462,000.00', '$128,999.18', '$504,000.00'], a: 0,
    why: 'Appreciation is compound growth: V = 350000(1.04)^8 = $478,999.18. Simple growth of 4% × 8 = 32% would give only $462,000.00.' },

  { id: 'f4-012', mod: 'MS-F4', topic: 'Appreciation', diff: 2,
    q: 'Which formula models appreciation?',
    choices: ['V = V_0(1 + r)^n', 'V = V_0(1 - r)^n', 'V = V_0 - Dn', 'V = V_0 + rn'], a: 0,
    why: 'Appreciation uses the same structure as compound interest, with a base above 1. The (1 − r) form is declining-balance depreciation.' },

  { id: 'f4-013', mod: 'MS-F4', topic: 'Straight-line depreciation', diff: 2,
    q: 'Equipment worth $24,000 depreciates by $3,200 per year using the straight-line method. What is it worth after 5 years?',
    choices: ['$8,000.00', '$16,000.00', '$9,830.40', '$4,800.00'], a: 0,
    why: 'S = V₀ − Dn = 24000 − 3200 × 5 = $8,000.00. Straight-line removes the same dollar amount each year.' },

  { id: 'f4-014', mod: 'MS-F4', topic: 'Straight-line depreciation', diff: 3,
    q: 'A machine costing $24,000 depreciates by $3,200 per year. After how many years is it worthless?',
    choices: ['7.5 years', '5 years', '10 years', '13.3 years'], a: 0,
    why: 'Set S = 0: 24000 − 3200n = 0, so n = \\frac{24000}{3200} = 7.5 years. Straight-line depreciation does eventually reach zero, unlike declining balance.' },

  { id: 'f4-015', mod: 'MS-F4', topic: 'Declining-balance depreciation', diff: 3,
    q: 'A vehicle worth $32,000 depreciates at 18% p.a. by the declining-balance method. What is it worth after 4 years?',
    choices: ['$14,467.90', '$8,960.00', '$9,939.20', '$17,532.10'], a: 0,
    why: 'S = 32000(1 − 0.18)^4 = 32000 × 0.452122 = $14,467.90. Taking 18% × 4 = 72% off the original gives $8,960.00 and is the straight-line answer, not this one.' },

  { id: 'f4-016', mod: 'MS-F4', topic: 'Declining-balance depreciation', diff: 3,
    q: 'A machine worth $45,000 depreciates at 25% p.a. declining balance. What is it worth after 3 years?',
    choices: ['$18,984.38', '$11,250.00', '$22,500.00', '$26,015.62'], a: 0,
    why: 'S = 45000(0.75)^3 = 45000 × 0.421875 = $18,984.38.' },

  { id: 'f4-017', mod: 'MS-F4', topic: 'Declining-balance depreciation', diff: 2,
    q: 'Which depreciation method never quite reaches zero?',
    choices: ['Declining balance, since it removes a percentage of what remains', 'Straight-line, since the amount is fixed', 'Both reach zero at the same time', 'Neither ever reaches zero'], a: 0,
    why: 'Declining balance removes a percentage of the CURRENT value, so the dollar reduction shrinks each year and the value only approaches zero. Straight-line hits zero exactly.' },

  { id: 'f4-018', mod: 'MS-F4', topic: 'Declining-balance depreciation', diff: 3,
    q: 'An asset worth $30,000 will be worth $12,000 after 5 years. What is the declining-balance rate, to 2 decimal places?',
    choices: ['16.74%', '12.00%', '20.00%', '60.00%'], a: 0,
    why: 'From S = V₀(1 − r)^n: (1 − r) = \\left(\\frac{12000}{30000}\\right)^{1/5} = 0.4^{0.2} = 0.8326, so r = 16.74%. Straight-line would give \\frac{18000}{5 \\times 30000} = 12% of the original per year.' },

  { id: 'f4-019', mod: 'MS-F4', topic: 'Shares and dividends', diff: 2,
    q: 'A share trades at $24.00 and pays an annual dividend of $1.44. What is the dividend yield?',
    choices: ['6.0%', '16.7%', '0.06%', '60.0%'], a: 0,
    why: 'Yield = \\frac{dividend}{price} × 100 = \\frac{1.44}{24.00} × 100 = 6.0%. Inverting the fraction gives 16.7%, which is the P/E-style ratio.' },

  { id: 'f4-020', mod: 'MS-F4', topic: 'Shares and dividends', diff: 2,
    q: 'How much dividend income comes from 850 shares paying 62c per share?',
    choices: ['$527.00', '$1,370.97', '$52.70', '$5,270.00'], a: 0,
    why: 'Income = 850 × $0.62 = $527.00. Dividing gives a nonsense figure — dividends per share are multiplied by the number held.' },

  { id: 'f4-021', mod: 'MS-F4', topic: 'Shares and dividends', diff: 3,
    q: 'A share trades at $36.40 with earnings per share of $2.60. What is the price-to-earnings ratio?',
    choices: ['14.0', '7.1', '94.6', '0.07'], a: 0,
    why: 'P/E = \\frac{price}{earnings per share} = \\frac{36.40}{2.60} = 14.0. It expresses the price as a multiple of annual earnings.' },

  { id: 'f4-022', mod: 'MS-F4', topic: 'Shares and dividends', diff: 3,
    stem: 'An investor buys 400 shares at $18.50 and pays $29.90 brokerage.',
    q: 'What is the total cost of the purchase?',
    choices: ['$7,429.90', '$7,400.00', '$7,370.10', '$7,459.80'], a: 0,
    why: 'Shares cost 400 × 18.50 = $7,400.00, and brokerage is added: 7400 + 29.90 = $7,429.90. Brokerage is a cost on purchase and a deduction on sale.' },

  { id: 'f4-023', mod: 'MS-F4', topic: 'Inflation', diff: 2,
    q: 'A coffee costs $4.20 today. At 3% p.a. inflation, what will it cost in 12 years?',
    choices: ['$5.99', '$5.71', '$4.33', '$6.34'], a: 0,
    why: 'Inflation compounds: cost = 4.20(1.03)^{12} = 4.20 × 1.425761 = $5.99. Simple growth of 36% gives $5.71.' },

  { id: 'f4-024', mod: 'MS-F4', topic: 'Inflation', diff: 3,
    q: 'What will $50,000 in 10 years be worth in today\'s dollars, if inflation runs at 2.5% p.a.?',
    choices: ['$39,059.92', '$64,004.22', '$37,500.00', '$48,780.49'], a: 0,
    why: 'Divide rather than multiply: real value = \\frac{50000}{1.280085} = $39,059.92. Multiplying gives what $50,000 GROWS to, which answers a different question.' },

  { id: 'f4-025', mod: 'MS-F4', topic: 'Reducing-balance loans', diff: 2,
    stem: 'Priya borrows $18,000 at 6% p.a. compounded monthly, repaying $350 per month.',
    table: { head: ['Month', 'Opening', 'Interest', 'Repayment', 'Closing'],
             rows: [['1', '18,000.00', '90.00', '350.00', '17,740.00'],
                    ['2', '17,740.00', '88.70', '350.00', '17,478.70']] },
    q: 'What is the closing balance at the end of month 3?',
    choices: ['$17,216.09', '$17,128.70', '$17,304.85', '$16,978.70'], a: 0,
    why: 'Interest = 17,478.70 × \\frac{0.06}{12} = $87.39. Closing = 17,478.70 + 87.39 − 350 = $17,216.09. The interest is recalculated on the NEW balance every month, which is why it keeps falling.' },

  { id: 'f4-026', mod: 'MS-F4', topic: 'Reducing-balance loans', diff: 2,
    q: 'On a reducing-balance loan, what happens to the interest portion of each repayment over time?',
    choices: ['It falls, because the balance falls', 'It rises, because interest compounds', 'It stays the same every month', 'It falls only after half the term'], a: 0,
    why: 'Interest is charged on the outstanding balance. As repayments reduce that balance, the interest each month falls and more of the fixed repayment goes to principal.' },

  { id: 'f4-027', mod: 'MS-F4', topic: 'Reducing-balance loans', diff: 3,
    q: 'A loan of $250,000 at 6% p.a. monthly is repaid over 25 years. What are r and n?',
    choices: ['r = 0.005, n = 300', 'r = 0.06, n = 25', 'r = 0.005, n = 25', 'r = 0.5, n = 300'], a: 0,
    why: 'r = \\frac{0.06}{12} = 0.005 per month and n = 25 × 12 = 300 months. Using the annual rate with monthly periods is the single most common loan error.' },

  { id: 'f4-028', mod: 'MS-F4', topic: 'Reducing-balance loans', diff: 3,
    stem: 'A $250,000 loan at 6% p.a. monthly over 25 years has a present value factor of 155.2069.',
    q: 'What is the monthly repayment?',
    choices: ['$1,610.75', '$833.33', '$1,552.07', '$3,880.17'], a: 0,
    why: 'Repayment = \\frac{250000}{155.2069} = $1,610.75. MULTIPLYING by the factor gives the amount the repayments are worth, not the repayment.' },

  { id: 'f4-029', mod: 'MS-F4', topic: 'Reducing-balance loans', diff: 3,
    stem: 'A $250,000 loan is repaid at $1,610.75 per month for 300 months.',
    q: 'How much interest is paid over the life of the loan?',
    choices: ['$233,225.00', '$150,000.00', '$483,225.00', '$37,500.00'], a: 0,
    why: 'Total paid = 1610.75 × 300 = $483,225.00. Interest = 483,225 − 250,000 = $233,225.00 — nearly as much again as the amount borrowed.' },

  { id: 'f4-030', mod: 'MS-F4', topic: 'Credit cards', diff: 2,
    stem: 'A credit card charges 19.99% p.a. on unpaid balances, calculated daily.',
    q: 'What is the daily interest rate, to 5 decimal places?',
    choices: ['0.00055', '0.01999', '0.00167', '0.05477'], a: 0,
    why: 'Daily rate = \\frac{0.1999}{365} = 0.000548, which is 0.00055 to 5 decimal places. Dividing by 12 instead of 365 gives the monthly rate.' },

  { id: 'f4-031', mod: 'MS-F4', topic: 'Credit cards', diff: 3,
    stem: 'A card charges 0.05477% per day. A balance of $1,400 is left unpaid for 21 days.',
    q: 'How much interest is charged?',
    choices: ['$16.10', '$76.67', '$1.61', '$23.31'], a: 0,
    why: 'Interest = 1400 × 0.0005477 × 21 = $16.10. Daily-interest cards charge for the exact number of days the balance is outstanding.' },

  { id: 'f4-032', mod: 'MS-F4', topic: 'Credit cards', diff: 2,
    q: 'What is the practical effect of an interest-free period on a credit card?',
    choices: ['No interest is charged if the closing balance is paid in full by the due date', 'No interest is ever charged on purchases', 'Interest is charged but refunded later', 'Only cash advances attract interest'], a: 0,
    why: 'The interest-free period applies only when the full closing balance is paid by the due date. Carry any balance and interest is typically charged from the transaction date, and cash advances usually get no interest-free period at all.' }
]);
