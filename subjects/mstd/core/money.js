/* ============================================================================
   money.js — the financial engine, in integer cents (§6.4).

   Why cents: floating-point dollars produce almost-right answers that mark as
   wrong. Why per-period rounding: a bank rounds interest to the cent every
   period, and rounding once at the end instead gives a different balance after
   25 years. Both of those are content-accuracy bugs, not style preferences.

   Every function that could be examined either way exposes BOTH methods —
   §4.3: straight-line and declining-balance depreciation, closed-form and
   table-based annuities, Prim's and Kruskal's. Students pick the wrong one all
   the time, so the app has to teach both.
   Namespace: window.MS.Money
   ========================================================================== */
window.MS = window.MS || {};
(function () {
  'use strict';
  var U = window.MS.U;
  var M = {};

  M.c = U.toCents;                 // dollars -> cents
  M.d = U.fromCents;               // cents -> dollars
  M.fmt = U.money;                 // cents -> "$1,234.50"
  M.fmt$ = U.money$;               // dollars -> "$1,234.50"

  /* -------------------------------------------------------- simple interest */
  /* I = Prn. Returns cents. */
  M.simpleInterest = function (principalC, ratePa, years) {
    return Math.round(principalC * ratePa * years);
  };
  M.simpleTotal = function (principalC, ratePa, years) {
    return principalC + M.simpleInterest(principalC, ratePa, years);
  };

  /* ------------------------------------------------------ compound interest */
  /* FV = PV(1+r)^n, rounded to the cent at each compounding period so the
     result matches a bank statement (and matches NESA's worked solutions). */
  M.compound = function (principalC, ratePerPeriod, periods) {
    var bal = principalC;
    for (var i = 0; i < periods; i++) bal = Math.round(bal * (1 + ratePerPeriod));
    return bal;
  };
  /* The closed form, for cross-checking and for the "one calculation" answer. */
  M.compoundClosed = function (principalC, ratePerPeriod, periods) {
    return Math.round(principalC * Math.pow(1 + ratePerPeriod, periods));
  };
  M.compoundInterest = function (principalC, ratePerPeriod, periods) {
    return M.compound(principalC, ratePerPeriod, periods) - principalC;
  };
  /* Nominal annual rate compounded k times a year -> rate per period. */
  M.perPeriod = function (annualRate, perYear) { return annualRate / perYear; };
  M.effectiveRate = function (annualRate, perYear) { return Math.pow(1 + annualRate / perYear, perYear) - 1; };

  /* Appreciation is compound growth; the syllabus treats it identically. */
  M.appreciate = M.compound;

  /* ----------------------------------------------------------- depreciation */
  /* Straight-line: S = V0 − Dn, a fixed dollar amount per year. */
  M.depStraight = function (initialC, perYearC, years) {
    return Math.max(0, initialC - perYearC * years);
  };
  M.depStraightRate = function (initialC, salvageC, years) {
    return (initialC - salvageC) / years / initialC;    // as a fraction of the ORIGINAL value
  };
  /* Declining balance: S = V0(1 − r)^n, a fixed percentage of what's left. */
  M.depDeclining = function (initialC, rate, years) {
    var v = initialC;
    for (var i = 0; i < years; i++) v = Math.round(v * (1 - rate));
    return v;
  };
  /* §9.9: pick the salvage value and the term, then DERIVE the rate. */
  M.depDecliningRate = function (initialC, salvageC, years) {
    return 1 - Math.pow(salvageC / initialC, 1 / years);
  };

  /* ---------------------------------------------------------- shares, inflation */
  M.dividend = function (shares, dividendPerShareC) { return shares * dividendPerShareC; };
  M.dividendYield = function (dividendPerShareC, priceC) { return dividendPerShareC / priceC; };
  M.peRatio = function (priceC, epsC) { return priceC / epsC; };
  M.inflate = function (amountC, ratePa, years) { return M.compound(amountC, ratePa, years); };
  M.realValue = function (amountC, ratePa, years) { return Math.round(amountC / Math.pow(1 + ratePa, years)); };

  /* ================================================================ annuities
     A is the contribution/repayment per period, r the rate per period, n the
     number of periods. Interest factor tables live in js/data/annuity.js and
     are the primary method the exam uses (§4.3); these closed forms are the
     cross-check the app teaches alongside them. */
  M.fvFactor = function (r, n) { return r === 0 ? n : (Math.pow(1 + r, n) - 1) / r; };
  M.pvFactor = function (r, n) { return r === 0 ? n : (Math.pow(1 + r, n) - 1) / (r * Math.pow(1 + r, n)); };
  M.futureValue = function (contribC, r, n) { return Math.round(contribC * M.fvFactor(r, n)); };
  M.presentValue = function (paymentC, r, n) { return Math.round(paymentC * M.pvFactor(r, n)); };
  /* The repayment that clears `principal` in n periods at rate r. */
  M.repayment = function (principalC, r, n) {
    if (r === 0) return Math.round(principalC / n);
    return Math.round(principalC / M.pvFactor(r, n));
  };
  /* Future value of a lump sum plus a regular contribution. */
  M.fvWithPrincipal = function (principalC, contribC, r, n) {
    return M.compound(principalC, r, n) + M.futureValue(contribC, r, n);
  };

  /* ================================================== reducing-balance loans
     Builds the schedule a Standard 2 question actually shows: opening balance,
     interest for the period, repayment, closing balance — with interest
     rounded to the cent each period (§6.4). */
  M.schedule = function (principalC, ratePerPeriod, repaymentC, maxPeriods) {
    var rows = [], bal = principalC, totalInterest = 0;
    var n = maxPeriods == null ? 600 : maxPeriods;
    for (var i = 1; i <= n && bal > 0; i++) {
      var interest = Math.round(bal * ratePerPeriod);
      var pay = Math.min(repaymentC, bal + interest);      // final payment is smaller
      var closing = bal + interest - pay;
      rows.push({ n: i, opening: bal, interest: interest, payment: pay, closing: closing });
      totalInterest += interest;
      bal = closing;
      if (interest >= repaymentC && rows.length > 2) break; // repayment never clears it
    }
    return {
      rows: rows, cleared: bal <= 0, periods: rows.length,
      totalInterest: totalInterest,
      totalPaid: rows.reduce(function (a, r) { return a + r.payment; }, 0),
      finalBalance: bal
    };
  };
  /* Balance after k periods without building the whole table. */
  M.balanceAfter = function (principalC, r, repaymentC, k) {
    var bal = principalC;
    for (var i = 0; i < k; i++) bal = bal + Math.round(bal * r) - repaymentC;
    return bal;
  };
  /* How many periods to clear the loan (∞ if the repayment is too small). */
  M.periodsToClear = function (principalC, r, repaymentC) {
    if (repaymentC <= Math.round(principalC * r)) return Infinity;
    return M.schedule(principalC, r, repaymentC, 1200).periods;
  };
  /* Balance curve for the Loan Lab chart, in dollars. */
  M.balanceCurve = function (principalC, r, repaymentC, periods) {
    var out = [], bal = principalC;
    for (var i = 0; i <= periods; i++) {
      out.push(Math.max(0, M.d(bal)));
      bal = Math.max(0, bal + Math.round(bal * r) - repaymentC);
    }
    return out;
  };

  /* =============================================================== PAYG tax
     Resident rates. Kept in one place so questions, generators and the
     reference screen cannot drift apart. */
  M.TAX_BRACKETS = [
    { from: 0,      to: 18200,    base: 0,     rate: 0 },
    { from: 18200,  to: 45000,    base: 0,     rate: 0.16 },
    { from: 45000,  to: 135000,   base: 4288,  rate: 0.30 },
    { from: 135000, to: 190000,   base: 31288, rate: 0.37 },
    { from: 190000, to: Infinity, base: 51638, rate: 0.45 }
  ];
  M.MEDICARE_LEVY = 0.02;
  /* Tax payable in cents, from taxable income in DOLLARS (how tables are written). */
  M.taxOn = function (incomeDollars) {
    var b = M.TAX_BRACKETS;
    for (var i = b.length - 1; i >= 0; i--) {
      if (incomeDollars > b[i].from) {
        return Math.round((b[i].base + b[i].rate * (incomeDollars - b[i].from)) * 100);
      }
    }
    return 0;
  };
  M.medicareOn = function (incomeDollars) { return Math.round(incomeDollars * M.MEDICARE_LEVY * 100); };
  M.netIncome = function (incomeDollars) {
    return Math.round(incomeDollars * 100) - M.taxOn(incomeDollars) - M.medicareOn(incomeDollars);
  };
  M.bracketOf = function (incomeDollars) {
    var b = M.TAX_BRACKETS;
    for (var i = b.length - 1; i >= 0; i--) if (incomeDollars > b[i].from) return b[i];
    return b[0];
  };
  /* §9.9: pick the tax payable, then work back to a gross income inside one
     bracket. Returns dollars (may be fractional — round before using). */
  M.incomeForTax = function (taxC, bracket) {
    var taxD = taxC / 100;
    return bracket.from + (taxD - bracket.base) / bracket.rate;
  };

  /* ------------------------------------------------------------------- GST */
  M.addGst = function (exC) { return Math.round(exC * 1.1); };
  M.gstIn = function (incC) { return Math.round(incC / 11); };
  M.exGst = function (incC) { return incC - M.gstIn(incC); };

  /* --------------------------------------------------------------- payroll */
  M.PERIODS = { weekly: 52, fortnightly: 26, monthly: 12, quarterly: 4, annually: 1 };
  M.perPeriodPay = function (annualC, period) { return Math.round(annualC / M.PERIODS[period]); };
  M.overtime = function (rateC, hours, multiplier) { return Math.round(rateC * multiplier * hours); };
  M.leaveLoading = function (weeklyC, weeks, rate) { return Math.round(weeklyC * weeks * (rate == null ? 0.175 : rate)); };

  window.MS.Money = M;
})();
