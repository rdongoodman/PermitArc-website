/**
 * PermitArc sales tax disclosure — shared by sales-tax.html and pricing-tax-gate.js
 * Update TAX_ACTIVE when a state registration goes live in Stripe Tax → Locations.
 */
(function () {
  var FUTURE_TAX = [
    { code: 'AZ', name: 'Arizona', note: 'SaaS taxable. Registration planned when required.' },
    { code: 'CT', name: 'Connecticut', note: 'SaaS taxable; reduced rate may apply to business use.' },
    { code: 'DC', name: 'District of Columbia', note: 'SaaS taxable. Registration planned when required.' },
    { code: 'HI', name: 'Hawaii', note: 'General excise tax on services including SaaS.' },
    { code: 'KY', name: 'Kentucky', note: 'SaaS taxable. Registration planned when required.' },
    { code: 'LA', name: 'Louisiana', note: 'SaaS taxable. Registration planned when required.' },
    { code: 'ME', name: 'Maine', note: 'SaaS taxable. Registration planned when required.' },
    { code: 'MD', name: 'Maryland', note: 'SaaS taxable; business vs personal rates may differ.' },
    { code: 'MA', name: 'Massachusetts', note: 'Prewritten software access is taxable.' },
    { code: 'MS', name: 'Mississippi', note: 'SaaS taxable. Registration planned when required.' },
    { code: 'NM', name: 'New Mexico', note: 'Gross receipts tax may apply to SaaS.' },
    { code: 'NY', name: 'New York', note: 'SaaS taxable. Remote registration when thresholds are met.' },
    { code: 'OH', name: 'Ohio', note: 'Business-use SaaS may be taxable.' },
    { code: 'PA', name: 'Pennsylvania', note: 'SaaS taxable. Registration planned when required.' },
    { code: 'RI', name: 'Rhode Island', note: 'SaaS taxable. Registration planned when required.' },
    { code: 'SC', name: 'South Carolina', note: 'SaaS taxable. Registration planned when required.' },
    { code: 'SD', name: 'South Dakota', note: 'SaaS taxable. Registration planned when required.' },
    { code: 'TN', name: 'Tennessee', note: 'SaaS taxable. Registration planned when required.' },
    { code: 'UT', name: 'Utah', note: 'SaaS taxable. Registration planned when required.' },
    { code: 'VT', name: 'Vermont', note: 'SaaS taxable. Registration planned when required.' },
    { code: 'WA', name: 'Washington', note: 'Digital automated services are taxable.' },
    { code: 'WV', name: 'West Virginia', note: 'SaaS taxable. Registration planned when required.' },
    { code: 'IL', name: 'Illinois', note: 'Some local taxes may apply to SaaS; state rules vary.' },
    { code: 'IA', name: 'Iowa', note: 'Business customers may be exempt; consumer SaaS taxable.' },
    { code: 'AK', name: 'Alaska', note: 'No state sales tax; some local taxes may apply.' }
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
      return { name: s.name, code: s.code, note: s.note, status: status };
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
    return { name: s.name, code: s.code, note: s.note, status: 'future' };
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
