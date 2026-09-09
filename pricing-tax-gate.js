/**
 * pricing.html — state notice + acknowledgment before Stripe Checkout.
 */
(function () {
  var gate = document.getElementById('permitarc-tax-gate');
  var select = document.getElementById('billing-state');
  var message = document.getElementById('tax-gate-message');
  var ackWrap = document.getElementById('tax-gate-ack-wrap');
  var ack = document.getElementById('tax-gate-ack');
  if (!gate || !select || !window.PermitArcSalesTax) return;

  var links = document.querySelectorAll('a.stripe-checkout-link');
  links.forEach(function (el) {
    el.dataset.permitarcHref = el.getAttribute('href') || '';
    if (el.tagName === 'A') {
      el.removeAttribute('href');
      el.setAttribute('target', '_blank');
      el.setAttribute('rel', 'noopener noreferrer');
    }
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
        if (el.tagName === 'A') {
          el.setAttribute('href', el.dataset.permitarcHref);
          el.setAttribute('target', '_blank');
          el.setAttribute('rel', 'noopener noreferrer');
        }
        el.removeAttribute('aria-disabled');
        el.classList.remove('is-gated');
      } else {
        if (el.tagName === 'A') el.removeAttribute('href');
        el.setAttribute('aria-disabled', 'true');
        el.classList.add('is-gated');
      }
    });
  }

  function refresh() {
    var code = select.value;
    ack.checked = false;
    ackWrap.hidden = true;
    setLinksEnabled(false);

    if (!code) {
      message.textContent = 'Select your billing state to see how sales tax may apply. You can subscribe without selecting, but we recommend reading our Sales tax page first.';
      setLinksEnabled(true);
      return;
    }

    var row = window.PermitArcSalesTax.lookup(code);
    if (!row) {
      setLinksEnabled(true);
      return;
    }

    if (row.status === 'active') {
      message.textContent = 'Texas: sales tax is added at checkout on top of your subscription price when applicable.';
      setLinksEnabled(true);
      return;
    }

    if (row.status === 'future') {
      message.textContent = row.name + ': subscription prices exclude sales tax until PermitArc registers there. Tax may apply on a future renewal. Please read the Sales tax page before subscribing.';
      ackWrap.hidden = false;
      return;
    }

    message.textContent = row.name + ': no state sales tax on PermitArc SaaS subscriptions, or SaaS is not taxed in this state (2026). Listed price is unchanged at checkout.';
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
