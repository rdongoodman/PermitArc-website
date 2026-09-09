/**
 * PermitArc sales tax disclosure — shared by sales-tax.html and pricing-tax-gate.js
 *
 * Combined rate ranges: Tax Foundation state rate + max local rate (July 2026).
 * CT / MD: B2B SaaS statutory rates (not general sales tax).
 * IA: B2B SaaS often exempt — no percentage range shown.
 *
 * Update TAX_ACTIVE when a state registration goes live in Stripe Tax → Locations.
 */
(function () {
  function formatPct(n) {
    var rounded = Math.round(n * 100) / 100;
    var s = rounded.toFixed(2);
    if (s.indexOf('.') !== -1) {
      s = s.replace(/0+$/, '').replace(/\.$/, '');
    }
    return s + '%';
  }

  function formatRateRange(row) {
    if (!row || row.rateBasis === 'b2b_exempt') return null;
    if (row.rateMin == null || row.rateMax == null) return null;

    if (row.rateBasis === 'b2b_saas') {
      return formatPct(row.rateMin) + ' B2B SaaS';
    }

    if (row.rateMin === row.rateMax) {
      return formatPct(row.rateMin);
    }

    if (row.rateMin === 0) {
      return '0–' + formatPct(row.rateMax);
    }

    return formatPct(row.rateMin) + '–' + formatPct(row.rateMax);
  }

  /** Tax Foundation July 2026: state + max local. B2B SaaS overrides where noted. */
  var FUTURE_TAX = [
    { code: 'AZ', name: 'Arizona', rateMin: 5.6, rateMax: 10.9, note: 'SaaS taxable. Registration planned when required.' },
    { code: 'CT', name: 'Connecticut', rateMin: 1, rateMax: 1, rateBasis: 'b2b_saas', note: 'SaaS taxable; 1% rate for typical B2B business use.' },
    { code: 'DC', name: 'District of Columbia', rateMin: 6, rateMax: 6, note: 'SaaS taxable. Registration planned when required.' },
    { code: 'HI', name: 'Hawaii', rateMin: 4, rateMax: 4.5, note: 'General excise tax on services including SaaS.' },
    { code: 'KY', name: 'Kentucky', rateMin: 6, rateMax: 6, note: 'SaaS taxable. Registration planned when required.' },
    { code: 'LA', name: 'Louisiana', rateMin: 5, rateMax: 12, note: 'SaaS taxable. Registration planned when required.' },
    { code: 'ME', name: 'Maine', rateMin: 5.5, rateMax: 5.5, note: 'SaaS taxable. Registration planned when required.' },
    { code: 'MD', name: 'Maryland', rateMin: 3, rateMax: 3, rateBasis: 'b2b_saas', note: 'SaaS taxable; 3% rate for typical B2B business use.' },
    { code: 'MA', name: 'Massachusetts', rateMin: 6.25, rateMax: 6.25, note: 'Prewritten software access is taxable.' },
    { code: 'MS', name: 'Mississippi', rateMin: 7, rateMax: 8, note: 'SaaS taxable. Registration planned when required.' },
    { code: 'NM', name: 'New Mexico', rateMin: 4.875, rateMax: 9.4375, note: 'Gross receipts tax may apply to SaaS.' },
    { code: 'NY', name: 'New York', rateMin: 4, rateMax: 8.875, note: 'SaaS taxable. Remote registration when thresholds are met.' },
    { code: 'OH', name: 'Ohio', rateMin: 5.75, rateMax: 8, note: 'Business-use SaaS may be taxable.' },
    { code: 'PA', name: 'Pennsylvania', rateMin: 6, rateMax: 8, note: 'SaaS taxable. Registration planned when required.' },
    { code: 'RI', name: 'Rhode Island', rateMin: 7, rateMax: 7, note: 'SaaS taxable. Registration planned when required.' },
    { code: 'SC', name: 'South Carolina', rateMin: 6, rateMax: 9, note: 'SaaS taxable. Registration planned when required.' },
    { code: 'SD', name: 'South Dakota', rateMin: 4.2, rateMax: 8.7, note: 'SaaS taxable. Registration planned when required.' },
    { code: 'TN', name: 'Tennessee', rateMin: 7, rateMax: 9.75, note: 'SaaS taxable. Registration planned when required.' },
    { code: 'UT', name: 'Utah', rateMin: 6.1, rateMax: 10.8, note: 'SaaS taxable. Registration planned when required.' },
    { code: 'VT', name: 'Vermont', rateMin: 6, rateMax: 7, note: 'SaaS taxable. Registration planned when required.' },
    { code: 'WA', name: 'Washington', rateMin: 6.5, rateMax: 10.7, note: 'Digital automated services are taxable.' },
    { code: 'WV', name: 'West Virginia', rateMin: 6, rateMax: 7.4, note: 'SaaS taxable. Registration planned when required.' },
    { code: 'IL', name: 'Illinois', rateMin: 6.25, rateMax: 11, note: 'Some local taxes may apply to SaaS; state rules vary.' },
    { code: 'IA', name: 'Iowa', rateBasis: 'b2b_exempt', note: 'B2B SaaS purchases are often exempt; consumer SaaS may be taxable.' },
    { code: 'AK', name: 'Alaska', rateMin: 0, rateMax: 7.85, rateBasis: 'local_only', note: 'No state sales tax; some local taxes may apply.' }
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

  function toStateRow(s, status) {
    var row = {
      name: s.name,
      code: s.code,
      note: s.note,
      status: status,
      rateMin: s.rateMin,
      rateMax: s.rateMax,
      rateBasis: s.rateBasis || null
    };
    row.rateDisplay = formatRateRange(row);
    row.rateHint = row.rateDisplay || '';
    return row;
  }

  function withStatus(list, status) {
    return list.map(function (s) {
      return toStateRow(s, status);
    });
  }

  var active = withStatus(
    [{
      code: 'TX',
      name: 'Texas',
      rateMin: 6.25,
      rateMax: 8.25,
      note: 'Combined state + local range at checkout (exact rate depends on billing ZIP).'
    }],
    'active'
  );

  var future = FUTURE_TAX.filter(function (s) {
    return TAX_ACTIVE.indexOf(s.code) === -1;
  }).map(function (s) {
    return toStateRow(s, 'future');
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
    formatRateRange: formatRateRange,
    requiresFutureAck: function (code) {
      var row = lookup(code);
      return row && row.status === 'future';
    },
    isActive: function (code) {
      return TAX_ACTIVE.indexOf((code || '').toUpperCase()) !== -1;
    }
  };
})();
