/**
 * pricing.html — state preview + acknowledgment before Stripe Checkout.
 * Does NOT calculate tax here; Stripe adds tax at checkout when registered.
 */
(function () {
  var gate = document.getElementById('permitarc-tax-gate');
  var select = document.getElementById('billing-state');
  var result = document.getElementById('tax-gate-result');
  var badge = document.getElementById('tax-gate-result-badge');
  var message = document.getElementById('tax-gate-message');
  var ackWrap = document.getElementById('tax-gate-ack-wrap');
  var ack = document.getElementById('tax-gate-ack');
  if (!gate || !select || !result || !message || !window.PermitArcSalesTax) return;

  var links = document.querySelectorAll('a.stripe-checkout-link');

  links.forEach(function (el) {
    el.dataset.permitarcHref = el.getAttribute('href') || '';
    el.removeAttribute('href');
    el.setAttribute('target', '_blank');
    el.setAttribute('rel', 'noopener noreferrer');
    el.setAttribute('aria-disabled', 'true');
    el.classList.add('is-gated');
  });

  function populateStates() {
    window.PermitArcSalesTax.states.forEach(function (row) {
      var opt = document.createElement('option');
      opt.value = row.code;
      opt.textContent = row.name;
      select.appendChild(opt);
    });
  }

  function setLinksEnabled(enabled) {
    links.forEach(function (el) {
      if (enabled && el.dataset.permitarcHref) {
        el.setAttribute('href', el.dataset.permitarcHref);
        el.setAttribute('target', '_blank');
        el.setAttribute('rel', 'noopener noreferrer');
        el.removeAttribute('aria-disabled');
        el.classList.remove('is-gated');
      } else {
        el.removeAttribute('href');
        el.setAttribute('aria-disabled', 'true');
        el.classList.add('is-gated');
      }
    });
  }

  function showResult(kind, badgeText, bodyText) {
    result.hidden = false;
    result.className = 'tax-gate-result tax-gate-result-' + kind;
    if (badge) badge.textContent = badgeText;
    message.textContent = bodyText;
  }

  function hideResult() {
    result.hidden = true;
    result.className = 'tax-gate-result tax-gate-result-empty';
    if (badge) badge.textContent = '';
    message.textContent = '';
  }

  function refresh() {
    var code = select.value;
    ack.checked = false;
    ackWrap.hidden = true;
    setLinksEnabled(false);

    if (!code) {
      hideResult();
      return;
    }

    var row = window.PermitArcSalesTax.lookup(code);
    if (!row) {
      hideResult();
      return;
    }

    if (row.status === 'active') {
      showResult(
        'active',
        'Tax at Stripe checkout',
        row.name +
          ': expect sales tax added on top of your plan price at Stripe Checkout (for example $39/mo + tax). You approve the full total before you pay.'
      );
      setLinksEnabled(true);
      return;
    }

    if (row.status === 'future') {
      showResult(
        'future',
        'May apply on a future renewal',
        row.name +
          ': no sales tax line at checkout today while PermitArc is not registered there yet. Tax may apply on a later renewal. Read the sales tax page and check the box below to unlock Subscribe.'
      );
      ackWrap.hidden = false;
      return;
    }

    showResult(
      'none',
      'No SaaS sales tax at checkout (2026)',
      row.name +
        ': listed plan price stays the same at Stripe Checkout for PermitArc SaaS in 2026. You can subscribe below.'
    );
    setLinksEnabled(true);
  }

  select.addEventListener('change', refresh);
  ack.addEventListener('change', function () {
    if (window.PermitArcSalesTax.requiresFutureAck(select.value)) {
      setLinksEnabled(ack.checked);
    }
  });

  populateStates();
  refresh();
})();
