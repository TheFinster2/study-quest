/* ============================================================================
   q-f1.js — MS-F1 Money Matters (Year 11). Pure data.

   AUTHORING RULES (enforced by tests/validate.js — read before adding any):
     · The key is ALWAYS choices[0] and `a` is ALWAYS 0. Bank.shuffleChoices()
       randomises order at runtime, so the stored shape stays checkable.
     · Keep the key terse. The reasoning belongs in `why`. §9.7 measured 63.9%
       scoring by always picking the longest option in the reference app.
     · Every distractor is a specific misconception of comparable length, and
       every money distractor is formatted to the cent — §9.7's second tell is
       that the only "$x,xxx.xx" option is the answer.
   ========================================================================== */
window.MS = window.MS || {};
window.MS.QUESTIONS = (window.MS.QUESTIONS || []).concat([

  { id: 'f1-001', mod: 'MS-F1', topic: 'Wages and salary', diff: 1,
    q: 'Mia is paid $27.40 per hour for a 38-hour week. What is her gross weekly wage?',
    choices: ['$1,041.20', '$1,141.20', '$1,038.60', '$1,096.00'], a: 0,
    why: 'Gross wage = rate × hours = 27.40 × 38 = $1,041.20. "Gross" means before any deductions.' },

  { id: 'f1-002', mod: 'MS-F1', topic: 'Overtime', diff: 1,
    q: 'Dev earns $24.60 per hour. He works 4 hours of overtime at time-and-a-half. How much overtime pay does he earn?',
    choices: ['$147.60', '$98.40', '$196.80', '$135.30'], a: 0,
    why: 'Time-and-a-half rate = 24.60 × 1.5 = $36.90 per hour. Overtime pay = 36.90 × 4 = $147.60.' },

  { id: 'f1-003', mod: 'MS-F1', topic: 'Overtime', diff: 1,
    q: 'Sam\'s normal rate is $31.20 per hour. She works 3 hours on a public holiday at double time. How much does she earn for those 3 hours?',
    choices: ['$187.20', '$93.60', '$140.40', '$124.80'], a: 0,
    why: 'Double time = 31.20 × 2 = $62.40 per hour. For 3 hours: 62.40 × 3 = $187.20.' },

  { id: 'f1-004', mod: 'MS-F1', topic: 'Wages and salary', diff: 2,
    stem: 'Ava\'s annual salary is $88,400. She is paid fortnightly.',
    q: 'What is her gross fortnightly pay?',
    choices: ['$3,400.00', '$3,683.33', '$1,700.00', '$7,366.67'], a: 0,
    why: 'There are 26 fortnights in a year, so 88 400 ÷ 26 = $3,400.00. Dividing by 24 (as if fortnights were half-months) gives $3,683.33 — a common slip.' },

  { id: 'f1-005', mod: 'MS-F1', topic: 'Wages and salary', diff: 1,
    q: 'Noah earns $79,800 per year, paid monthly. What is his gross monthly pay?',
    choices: ['$6,650.00', '$3,069.23', '$6,150.00', '$1,534.62'], a: 0,
    why: '12 months in a year: 79 800 ÷ 12 = $6,650.00.' },

  { id: 'f1-006', mod: 'MS-F1', topic: 'Commission and piecework', diff: 1,
    q: 'A real estate agent earns 4.5% commission on sales. How much commission is earned on a $86,000 sale?',
    choices: ['$3,870.00', '$4,300.00', '$3,440.00', '$19,111.11'], a: 0,
    why: 'Commission = 4.5% × 86 000 = 0.045 × 86 000 = $3,870.00.' },

  { id: 'f1-007', mod: 'MS-F1', topic: 'Commission and piecework', diff: 2,
    q: 'Priya is paid a retainer of $520 per week plus 3% commission on sales. In a week she sells $12,400 worth of goods. What is her gross pay?',
    choices: ['$892.00', '$372.00', '$520.00', '$1,412.00'], a: 0,
    why: 'Commission = 0.03 × 12 400 = $372. Gross pay = 520 + 372 = $892.00. The retainer is paid regardless of sales.' },

  { id: 'f1-008', mod: 'MS-F1', topic: 'Commission and piecework', diff: 1,
    q: 'A fruit picker is paid $1.85 per crate. In one day she fills 145 crates. What is her pay for the day?',
    choices: ['$268.25', '$278.35', '$261.00', '$183.15'], a: 0,
    why: 'Piecework pay = rate per item × number of items = 1.85 × 145 = $268.25. Piecework pays for output, not hours.' },

  { id: 'f1-009', mod: 'MS-F1', topic: 'Allowances and leave loading', diff: 2,
    stem: 'Jordan earns $1,180 per week and takes 4 weeks annual leave with 17.5% leave loading.',
    q: 'How much leave loading does Jordan receive?',
    choices: ['$826.00', '$206.50', '$4,720.00', '$674.29'], a: 0,
    why: 'Normal pay for 4 weeks = 4 × 1180 = $4,720. Loading = 17.5% × 4720 = 0.175 × 4720 = $826.00. Loading is calculated on the whole leave period, not one week.' },

  { id: 'f1-010', mod: 'MS-F1', topic: 'Allowances and leave loading', diff: 2,
    stem: 'Jordan earns $1,180 per week and takes 4 weeks annual leave with 17.5% leave loading.',
    q: 'What is Jordan\'s total pay for the 4 weeks of leave?',
    choices: ['$5,546.00', '$4,720.00', '$5,340.00', '$1,386.50'], a: 0,
    why: 'Total = normal pay + loading = 4720 + 826 = $5,546.00.' },

  { id: 'f1-011', mod: 'MS-F1', topic: 'GST', diff: 1,
    q: 'A tradesperson quotes $340 for a job, before GST. What is the price including 10% GST?',
    choices: ['$374.00', '$350.00', '$306.00', '$3,740.00'], a: 0,
    why: 'GST = 10% × 340 = $34. Price including GST = 340 + 34 = $374.00, or 340 × 1.1 directly.' },

  { id: 'f1-012', mod: 'MS-F1', topic: 'GST', diff: 2,
    q: 'A receipt shows a total of $528, GST inclusive. How much GST is included in that total?',
    choices: ['$48.00', '$52.80', '$58.08', '$480.00'], a: 0,
    why: 'The total is 110% of the pre-GST price, so GST = total ÷ 11 = 528 ÷ 11 = $48.00. Taking 10% of the *inclusive* total gives $52.80, which is the classic error.' },

  { id: 'f1-013', mod: 'MS-F1', topic: 'GST', diff: 2,
    q: 'A laptop costs $891 including GST. What was its price before GST?',
    choices: ['$810.00', '$801.90', '$980.10', '$889.00'], a: 0,
    why: 'Pre-GST price = 891 ÷ 1.1 = $810.00. Check: 810 × 1.1 = 891. Subtracting 10% of 891 gives $801.90, which is wrong because the 10% was calculated on the larger figure.' },

  { id: 'f1-014', mod: 'MS-F1', topic: 'PAYG tax', diff: 2,
    stem: 'Australian resident tax rates:',
    table: { head: ['Taxable income', 'Tax on this income'],
             rows: [['$0 – $18,200', 'Nil'],
                    ['$18,201 – $45,000', '16c per $1 over $18,200'],
                    ['$45,001 – $135,000', '$4,288 + 30c per $1 over $45,000'],
                    ['$135,001 – $190,000', '$31,288 + 37c per $1 over $135,000'],
                    ['$190,001 and over', '$51,638 + 45c per $1 over $190,000']] },
    q: 'Calculate the tax payable on a taxable income of $62,000.',
    choices: ['$9,388.00', '$5,100.00', '$18,600.00', '$13,676.00'], a: 0,
    why: 'The income falls in the $45,001–$135,000 bracket. Tax = 4288 + 0.30 × (62 000 − 45 000) = 4288 + 5100 = $9,388.00. The 30c rate applies only to the amount *over* $45,000, not the whole income.' },

  { id: 'f1-015', mod: 'MS-F1', topic: 'PAYG tax', diff: 2,
    stem: 'Australian resident tax rates:',
    table: { head: ['Taxable income', 'Tax on this income'],
             rows: [['$0 – $18,200', 'Nil'],
                    ['$18,201 – $45,000', '16c per $1 over $18,200'],
                    ['$45,001 – $135,000', '$4,288 + 30c per $1 over $45,000']] },
    q: 'Calculate the tax payable on a taxable income of $38,000.',
    choices: ['$3,168.00', '$6,080.00', '$4,288.00', '$2,912.00'], a: 0,
    why: 'Tax = 0.16 × (38 000 − 18 200) = 0.16 × 19 800 = $3,168.00. The first $18,200 is tax free.' },

  { id: 'f1-016', mod: 'MS-F1', topic: 'PAYG tax', diff: 3,
    stem: 'Australian resident tax rates:',
    table: { head: ['Taxable income', 'Tax on this income'],
             rows: [['$45,001 – $135,000', '$4,288 + 30c per $1 over $45,000'],
                    ['$135,001 – $190,000', '$31,288 + 37c per $1 over $135,000'],
                    ['$190,001 and over', '$51,638 + 45c per $1 over $190,000']] },
    q: 'Calculate the tax payable on a taxable income of $145,000.',
    choices: ['$34,988.00', '$53,650.00', '$31,288.00', '$34,288.00'], a: 0,
    why: 'Tax = 31 288 + 0.37 × (145 000 − 135 000) = 31 288 + 3700 = $34,988.00.' },

  { id: 'f1-017', mod: 'MS-F1', topic: 'PAYG tax', diff: 1,
    q: 'The Medicare levy is 2% of taxable income. How much is the levy on a taxable income of $62,000?',
    choices: ['$1,240.00', '$620.00', '$12,400.00', '$1,860.00'], a: 0,
    why: 'Levy = 2% × 62 000 = 0.02 × 62 000 = $1,240.00. The levy is charged on the whole taxable income, not just the part above a threshold.' },

  { id: 'f1-018', mod: 'MS-F1', topic: 'PAYG tax', diff: 3,
    stem: 'Rae has a gross annual income of $62,000 with no deductions. Tax payable is $9,388 and the Medicare levy is 2% of taxable income.',
    q: 'What is Rae\'s net annual income?',
    choices: ['$51,372.00', '$52,612.00', '$50,132.00', '$61,380.00'], a: 0,
    why: 'Levy = 0.02 × 62 000 = $1,240. Net income = 62 000 − 9388 − 1240 = $51,372.00. Net income is what actually reaches the bank account.' },

  { id: 'f1-019', mod: 'MS-F1', topic: 'PAYG tax', diff: 3,
    stem: 'Over the year, Tomas had $11,200 withheld under PAYG. His tax payable is $9,388 and his Medicare levy is $1,240.',
    q: 'What is his tax refund or amount owing?',
    choices: ['$572.00 refund', '$572.00 owing', '$1,812.00 refund', '$2,384.00 refund'], a: 0,
    why: 'Total liability = 9388 + 1240 = $10,628. Withheld = $11,200, which is $572 more than owed, so the ATO refunds $572.00. Withheld > liability always means a refund.' },

  { id: 'f1-020', mod: 'MS-F1', topic: 'Budgeting', diff: 2,
    stem: 'Weekly budget: income $1,150. Expenses — rent $430, groceries $185, transport $95, phone and internet $40, utilities $65, entertainment $110.',
    q: 'How much is left each week for saving?',
    choices: ['$225.00', '$185.00', '$925.00', '$265.00'], a: 0,
    why: 'Total expenses = 430 + 185 + 95 + 40 + 65 + 110 = $925. Savings = 1150 − 925 = $225.00.' },

  { id: 'f1-021', mod: 'MS-F1', topic: 'Overtime', diff: 3,
    stem: 'Lin\'s normal rate is $26.80 per hour for a 36-hour week. She also worked 5 hours at time-and-a-half and 2 hours at double time.',
    q: 'What was her gross pay for the week?',
    choices: ['$1,272.00', '$1,164.00', '$1,232.40', '$1,340.00'], a: 0,
    why: 'Normal 36 × 26.80 = $964.80. Time-and-a-half: 5 × 26.80 × 1.5 = $201.00. Double time: 2 × 26.80 × 2 = $107.20. Total = 964.80 + 201 + 107.20 = $1,272.00.' },

  { id: 'f1-022', mod: 'MS-F1', topic: 'Wages and salary', diff: 2,
    q: 'A casual worker\'s base rate is $23.60 per hour plus a 25% casual loading. What is the loaded hourly rate?',
    choices: ['$29.50', '$28.32', '$24.85', '$5.90'], a: 0,
    why: 'Loaded rate = 23.60 × 1.25 = $29.50. The loading compensates casuals for not receiving paid leave.' },

  { id: 'f1-023', mod: 'MS-F1', topic: 'Wages and salary', diff: 1,
    q: 'Kai is paid $1,340 per week. What is his gross annual income?',
    choices: ['$69,680.00', '$34,840.00', '$16,080.00', '$71,020.00'], a: 0,
    why: 'There are 52 weeks in a year: 1340 × 52 = $69,680.00. Multiplying by 12 treats a week as a month.' },

  { id: 'f1-024', mod: 'MS-F1', topic: 'Wages and salary', diff: 2,
    q: 'Zara is paid $2,760 per fortnight. What is her gross annual salary?',
    choices: ['$71,760.00', '$33,120.00', '$143,520.00', '$66,240.00'], a: 0,
    why: '26 fortnights per year: 2760 × 26 = $71,760.00. Using 24 gives $66,240 and using 52 double-counts.' },

  { id: 'f1-025', mod: 'MS-F1', topic: 'Allowances and leave loading', diff: 2,
    stem: 'A nurse\'s fortnightly payslip shows: base pay $2,480, night shift allowance $186, uniform allowance $34, union fees deducted $28, tax deducted $492.',
    q: 'What is the net pay for the fortnight?',
    choices: ['$2,180.00', '$2,700.00', '$2,208.00', '$2,152.00'], a: 0,
    why: 'Gross = 2480 + 186 + 34 = $2,700. Deductions = 28 + 492 = $520. Net = 2700 − 520 = $2,180.00. Allowances add to gross; fees and tax come off.' },

  { id: 'f1-026', mod: 'MS-F1', topic: 'Budgeting', diff: 2,
    stem: 'Weekly income is $1,150 and rent is $430.',
    q: 'What percentage of income goes to rent, to the nearest whole percent?',
    choices: ['37%', '43%', '27%', '31%'], a: 0,
    why: '430 ÷ 1150 = 0.3739… = 37% to the nearest per cent. Housing above about 30% of income is generally described as housing stress.' },

  { id: 'f1-027', mod: 'MS-F1', topic: 'Commission and piecework', diff: 3,
    stem: 'A sales rep earns no commission on the first $5,000 of monthly sales, 2% on the next $10,000, and 5% on anything above $15,000.',
    q: 'What commission is earned on monthly sales of $23,000?',
    choices: ['$600.00', '$1,150.00', '$400.00', '$900.00'], a: 0,
    why: 'First $5000: nil. Next $10 000 at 2% = $200. Remaining 23 000 − 15 000 = $8000 at 5% = $400. Total = 200 + 400 = $600.00. Each rate applies only to its own slice.' },

  { id: 'f1-028', mod: 'MS-F1', topic: 'Wages and salary', diff: 2,
    q: 'Employer superannuation contributions are 11.5% of ordinary earnings. How much super is paid on ordinary earnings of $76,000?',
    choices: ['$8,740.00', '$6,600.00', '$8,474.00', '$87,400.00'], a: 0,
    why: 'Super = 0.115 × 76 000 = $8,740.00. This is paid into the fund on top of the salary, not deducted from it.' }
]);
