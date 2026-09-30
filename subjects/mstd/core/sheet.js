/* ============================================================================
   sheet.js — the HSC Mathematics Standard 2 reference sheet for the shared
   tool tray (SQ.Tools).

   free:true   printed on the NESA Mathematics Standard 2 Reference Sheet (or,
               for tables, printed in the exam question itself). Costs nothing.
   free:false  NOT given in the exam. Revealing it costs 10% of the run's XP,
               latched, capped at 30% — the core's crutch rule.

   NumberCrunch's own sheet was entirely free (a report-only latch), on the
   argument that NESA hands every candidate the sheet. That argument holds for
   what is ON the sheet, which is why those items stay free. The rest of its
   "formula sheet" page (simple interest, annuity formulas, GST, mean, IQR,
   gradient…) is content a Standard 2 candidate has to carry in their head.
   Calls marked UNCERTAIN are ones I could not pin to the current sheet with
   confidence; they err towards free:false only where the formula is plainly
   taught as recall.
   ========================================================================== */
window.MS = window.MS || {};
(function () {
  'use strict';
  function it(id, name, body, free, note) { return { id: id, name: name, body: body, free: free, note: note || null }; }

  function annuityHtml(which) {
    var A = window.MS.ANNUITY;
    if (!A) return '';
    var h = '<div class="tblwrap tall"><table><thead><tr><th>n</th>' +
      A.rateLabels.map(function (l) { return '<th>' + l + '</th>'; }).join('') + '</tr></thead><tbody>';
    A[which].forEach(function (row) {
      h += '<tr><td>' + row[0] + '</td>' + row.slice(1).map(function (v) { return '<td>' + v.toFixed(4) + '</td>'; }).join('') + '</tr>';
    });
    return h + '</tbody></table></div>';
  }

  window.MS.SHEET = function () {
    var M = window.MS.U.mathHtml;
    return {
      title: 'HSC Mathematics Standard 2 reference sheet',
      /* Bodies are NumberCrunch notation (\frac, x_bar, ^2 …) unless they start with '<'. */
      render: function (src) { return /^\s*</.test(src) ? src : M(src); },
      constants: [],
      sections: [
        { id: 'measurement', title: 'Measurement', items: [
          it('abs-error', 'Absolute error', 'Absolute error = \\frac{1}{2} \\times precision', true),
          it('bounds', 'Limits of accuracy', 'Upper bound = measurement + absolute error; Lower bound = measurement - absolute error', true),
          it('arc', 'Arc length', 'l = \\frac{\\theta}{360} \\times 2\\pi r', true),
          it('sector', 'Area of a sector', 'A = \\frac{\\theta}{360}\\pi r^2', true),
          it('trapezium', 'Area of a trapezium', 'A = \\frac{h}{2}(a+b)', true),
          it('trap-rule', 'Trapezoidal rule', 'A ~= \\frac{h}{2}(d_f + d_l)', true, 'The sheet gives the one-application form; apply it strip by strip.'),
          it('sa-cyl', 'Surface area of a closed cylinder', 'SA = 2\\pi r^2 + 2\\pi rh', true),
          it('sa-sphere', 'Surface area of a sphere', 'SA = 4\\pi r^2', true),
          it('v-prism', 'Volume of a prism / cylinder', 'V = Ah', true),
          it('v-pyramid', 'Volume of a pyramid / cone', 'V = \\frac{1}{3}Ah', true),
          it('v-sphere', 'Volume of a sphere', 'V = \\frac{4}{3}\\pi r^3', true),
          it('a-rect', 'Area of a rectangle, triangle, circle', 'A = lw;  A = \\frac{1}{2}bh;  A = \\pi r^2', false, 'Assumed knowledge — not printed.'),
          it('a-annulus', 'Area of an annulus / rhombus / parallelogram', 'A = \\pi(R^2 - r^2);  A = \\frac{1}{2}xy;  A = bh', false),
          /* UNCERTAIN: percentage error is taught alongside absolute error but is not on the sheet as far as I know. */
          it('pct-error', 'Percentage error', '\\frac{absolute error}{measured value} \\times 100%', false)
        ] },
        { id: 'trig', title: 'Trigonometry', items: [
          it('sine-rule', 'Sine rule', '\\frac{a}{\\sin A} = \\frac{b}{\\sin B} = \\frac{c}{\\sin C}', true),
          it('cos-side', 'Cosine rule (side)', 'c^2 = a^2 + b^2 - 2ab\\cos C', true),
          it('cos-angle', 'Cosine rule (angle)', '\\cos C = \\frac{a^2+b^2-c^2}{2ab}', true),
          it('area-rule', 'Area of a triangle', 'A = \\frac{1}{2}ab\\sin C', true),
          it('pythag', 'Pythagoras', 'c^2 = a^2 + b^2', false, 'Assumed knowledge — not printed.')
        ] },
        { id: 'finance', title: 'Financial mathematics', items: [
          it('compound', 'Compound interest', 'FV = PV(1+r)^n', true),
          it('straight-line', 'Straight-line depreciation', 'S = V_0 - Dn', true),
          it('declining', 'Declining-balance depreciation', 'S = V_0(1-r)^n', true),
          /* UNCERTAIN: I = Prn appears on the Standard 1 sheet in some years; treated as recall for Standard 2. */
          it('simple', 'Simple interest', 'I = Prn', false),
          it('fv-annuity', 'Future value of an annuity (formula)', 'FV = a \\times \\frac{(1+r)^n - 1}{r}', false, 'Standard 2 examines annuities through the tables, which the exam prints in the question.'),
          it('pv-annuity', 'Present value of an annuity (formula)', 'PV = a \\times \\frac{(1+r)^n - 1}{r(1+r)^n}', false),
          it('gst', 'GST inside a total', 'GST = \\frac{total}{11}', false),
          it('fv-table', 'Future value interest factors', annuityHtml('fv'), true, 'Printed in the exam question whenever it is needed.'),
          it('pv-table', 'Present value interest factors', annuityHtml('pv'), true, 'Printed in the exam question whenever it is needed.'),
          /* Tax brackets are always supplied in the question — nobody memorises the rates. */
          it('tax', 'Resident income tax rates', '<div class="tblwrap"><table><thead><tr><th>Taxable income</th><th>Tax</th></tr></thead><tbody>' +
            '<tr><td>$0 – $18,200</td><td>Nil</td></tr><tr><td>$18,201 – $45,000</td><td>16c per $1 over $18,200</td></tr>' +
            '<tr><td>$45,001 – $135,000</td><td>$4,288 + 30c per $1 over $45,000</td></tr>' +
            '<tr><td>$135,001 – $190,000</td><td>$31,288 + 37c per $1 over $135,000</td></tr>' +
            '<tr><td>$190,001 and over</td><td>$51,638 + 45c per $1 over $190,000</td></tr></tbody></table></div>', true,
            'Printed in the question in the exam. Medicare levy is 2% of taxable income.')
        ] },
        { id: 'stats', title: 'Statistical analysis', items: [
          it('z', 'z-score', 'z = \\frac{x - \\mu}{\\sigma}', true),
          it('outlier', 'Outliers', 'An outlier is a score below Q_1 - 1.5 \\times IQR or above Q_3 + 1.5 \\times IQR', true),
          it('empirical', 'The normal distribution', '68% within 1 standard deviation, 95% within 2, 99.7% within 3 (the diagram on the sheet)', true),
          it('iqr', 'Interquartile range', 'IQR = Q_3 - Q_1', false),
          it('mean', 'Mean from a frequency table', 'x_bar = \\frac{\\Sigma fx}{\\Sigma f}', false),
          it('expected', 'Expected frequency', 'P(E) \\times number of trials', false),
          it('relfreq', 'Relative frequency', '\\frac{times it occurred}{total trials}', false),
          it('lsq', 'Least-squares line', 'y = mx + c  (from the calculator, or through (x_bar, y_bar))', false)
        ] },
        { id: 'algebra', title: 'Algebra, rates and networks (not on the sheet)', items: [
          it('gradient', 'Gradient', 'm = \\frac{y_2 - y_1}{x_2 - x_1}', false),
          it('variation', 'Direct / inverse variation', 'y = kx;  y = \\frac{k}{x}', false),
          it('fuel', 'Fuel consumption', '\\frac{litres}{km} \\times 100 L/100 km', false),
          it('energy', 'Energy', 'kWh = kW \\times hours', false),
          /* UNCERTAIN: HSC questions usually state 220 − age in the stem. */
          it('heart', 'Maximum heart rate', '220 - age', false),
          it('tree-edges', 'Edges in a tree', 'n - 1 for n vertices', false),
          it('float', 'Float time', 'latest start - earliest start', false)
        ] }
      ]
    };
  };
})();
