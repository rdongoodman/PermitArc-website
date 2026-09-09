/**
 * PermitArc sales tax disclosure — shared by sales-tax.html and pricing-tax-gate.js
 * Update TAX_ACTIVE when a state registration goes live in Stripe Tax → Locations.
 */
(function () {
  var FUTURE_TAX = [
    { code: 'AZ', name: 'Arizona', rateHint: '5–11%', note: 'SaaS taxable. Registration planned when required.' },
    { code: 'CT', name: 'Connecticut', rateHint: '1% (typical B2B)', note: 'SaaS taxable; reduced rate may apply to business use.' },
    { code: 'DC', name: 'District of Columbia', rateHint: '6%', note: 'SaaS taxable. Registration planned when required.' },
    { code: 'HI', name: 'Hawaii', rateHint: '4–5%', note: 'General excise tax on services including SaaS.' },
    { code: 'KY', name: 'Kentucky', rateHint: '6%', note: 'SaaS taxable. Registration planned when required.' },
    { code: 'LA', name: 'Louisiana', rateHint: '9–11%', note: 'SaaS taxable. Registration planned when required.' },
    { code: 'ME', name: 'Maine', rateHint: '5.5%', note: 'SaaS taxable. Registration planned when required.' },
    { code: 'MD', name: 'Maryland', rateHint: '3% (typical B2B)', note: 'SaaS taxable; business vs personal rates may differ.' },
    { code: 'MA', name: 'Massachusetts', rateHint: '6.25%', note: 'Prewritten software access is taxable.' },
    { code: 'MS', name: 'Mississippi', rateHint: '7%', note: 'SaaS taxable. Registration planned when required.' },
    { code: 'NM', name: 'New Mexico', rateHint: '5–8%', note: 'Gross receipts tax may apply to SaaS.' },
    { code: 'NY', name: 'New York', rateHint: '4–9%', note: 'SaaS taxable. Remote registration when thresholds are met.' },
    { code: 'OH', name: 'Ohio', rateHint: '5–8%', note: 'Business-use SaaS may be taxable.' },
    { code: 'PA', name: 'Pennsylvania', rateHint: '6–8%', note: 'SaaS taxable. Registration planned when required.' },
    { code: 'RI', name: 'Rhode Island', rateHint: '7%', note: 'SaaS taxable. Registration planned when required.' },
    { code: 'SC', name: 'South Carolina', rateHint: '6–9%', note: 'SaaS taxable. Registration planned when required.' },
    { code: 'SD', name: 'South Dakota', rateHint: '4.5–7%', note: 'SaaS taxable. Registration planned when required.' },
    { code: 'TN', name: 'Tennessee', rateHint: '7–10%', note: 'SaaS taxable. Registration planned when required.' },
    { code: 'UT', name: 'Utah', rateHint: '7–8%', note: 'SaaS taxable. Registration planned when required.' },
    { code: 'VT', name: 'Vermont', rateHint: '6–7%', note: 'SaaS taxable. Registration planned when required.' },
    { code: 'WA', name: 'Washington', rateHint: '6.5–10%', note: 'Digital automated services are taxable.' },
    { code: 'WV', name: 'West Virginia', rateHint: '6–7%', note: 'SaaS taxable. Registration planned when required.' },
    { code: 'IL', name: 'Illinois', rateHint: '6–11%', note: 'Some local taxes may apply to SaaS; state rules vary.' },
    { code: 'IA', name: 'Iowa', rateHint: '0–7% (B2B often exempt)', note: 'Business customers may be exempt; consumer SaaS taxable.' },
    { code: 'AK', name: 'Alaska', rateHint: '0–7% (local only)', note: 'No state sales tax; some local taxes may apply.' }
  ];

  var NO_SAAS = [
    { code: 'AL', name: 'Alabama', note: 'SaaS generally not subject to state sales tax.' },
    { code: 'AR', name: 'Arkansas', note: 'Electronically delivered software generally exempt.' },
    { code: 'CA', name: 'California', note: 'SaaS not taxed in 2026; state rules change Jan 2027.' },
    { code: 'CO', name: 'Colorado', note: 'State SaaS rules changing; some local taxes may apply.' },
    { code: 'FL', name: 'Florida', note: 'SaaS generally not subject to state sales tax.' },
    { code: 'GA', name: 'Georgia', note: 'SaaS generally not subject to state sales tax.' },
    { code: 'ID', name: 'Idaho', note: 'SaaS generally not subject to state sales tax.' },
    { code: 'IN', name: 'Indiana', note: 'SaaS generally not subject to state sales tax.' },
    { code: 'KS', name: 'Kansas', note: 'SaaS generally not subject to state sales tax.' },
    { code: 'MI', name: 'Michigan', note: 'SaaS generally not subject to state sales tax.' },
    { code: 'MN', name: 'Minnesota', note: 'SaaS generally not subject to state sales tax.' },
    { code: 'MO', name: 'Missouri', note: 'SaaS generally not subject to state sales tax.' },
    { code: 'NE', name: 'Nebraska', note: 'SaaS generally not subject to state sales tax.' },
    { code: 'NV', name: 'Nevada', note: 'SaaS generally not subject to state sales tax.' },
    { code: 'NJ', name: 'New Jersey', note: 'SaaS generally not subject to state sales tax.' },
    { code: 'NC', name: 'North Carolina', note: 'SaaS generally not subject to state sales tax.' },
    { code: 'ND', name: 'North Dakota', note: 'SaaS generally not subject to state sales tax.' },
    { code: 'OK', name: 'Oklahoma', note: 'SaaS generally not subject to state sales tax.' },
    { code: 'VA', name: 'Virginia', note: 'SaaS generally not subject to state sales tax.' },
    { code: 'WI', name: 'Wisconsin', note: 'SaaS generally not subject to state sales tax.' },
    { code: 'WY', name: 'Wyoming', note: 'SaaS generally not subject to state sales tax.' }
  ];

  var NO_STATE = [
    { code: 'DE', name: 'Delaware', note: 'No state sales tax.' },
    { code: 'MT', name: 'Montana', note: 'No state sales tax.' },
    { code: 'NH', name: 'New Hampshire', note: 'No state sales tax.' },
    { code: 'OR', name: 'Oregon', note: 'No state sales tax.' }
  ];

  /** Add codes here when Stripe Tax registration is live. */
  var TAX_ACTIVE = ['TX'];

  function withStatus(list, status) {
    return list.map(function (s) {
      return {
        name: s.name,
        code: s.code,
        note: s.note,
        rateHint: s.rateHint || '',
        status: status,
      };
    });
  }

  var active = withStatus(
    [{
      code: 'TX',
      name: 'Texas',
      note: 'About 6–8% sales tax at Stripe checkout today (exact rate depends on your address).',
    }],
    'active'
  );

  var future = FUTURE_TAX.filter(function (s) {
    return TAX_ACTIVE.indexOf(s.code) === -1;
  }).map(function (s) {
    return {
      name: s.name,
      code: s.code,
      note: s.note,
      rateHint: s.rateHint || '',
      status: 'future',
    };
  });

  var states = active
    .concat(future)
    .concat(withStatus(NO_SAAS, 'no_saas'))
    .concat(withStatus(NO_STATE, 'no_state_tax'))
    .sort(function (a, b) {
      return a.name.localeCompare(b.name);
    });

  function lookup(code) {
    var upper = (code || '').toUpperCase();
    for (var i = 0; i < states.length; i++) {
      if (states[i].code === upper) return states[i];
    }
    return null;
  }

  window.PermitArcSalesTax = {
    TAX_ACTIVE: TAX_ACTIVE,
    states: states,
    lookup: lookup,
    requiresFutureAck: function (code) {
      var row = lookup(code);
      return row && row.status === 'future';
    },
    isActive: function (code) {
      return TAX_ACTIVE.indexOf((code || '').toUpperCase()) !== -1;
    }
  };
})();
