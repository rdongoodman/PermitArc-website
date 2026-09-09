/**
 * Billing-state popup ack before Stripe Checkout.
 * Plain-language disclosure only — Stripe calculates tax at checkout.
 */
(function () {
  var STORAGE_KEY = 'permitarc_tax_ack_v3';

  var select = document.getElementById('billing-state');
  var modal = document.getElementById('tax-state-modal');
  var modalTitle = document.getElementById('tax-modal-title');
  var modalSummary = document.getElementById('tax-modal-summary');
  var modalDetail = document.getElementById('tax-modal-detail');
  var modalReassurance = document.getElementById('tax-modal-reassurance');
  var modalAck = document.getElementById('tax-modal-ack');
  var modalAckLabel = document.getElementById('tax-modal-ack-label');

  if (!select || !window.PermitArcSalesTax || !modal) return;

  var links = document.querySelectorAll('a.stripe-checkout-link');
  var beyondBtn = document.getElementById('beyond-five-checkout');
  var unlocked = false;

  var REASSURANCE =
    'Not every state has sales tax on checkout yet — PermitArc is registering state by state. If tax is not on your total today, it may appear on a future renewal, often within the next few months. You always approve the full amount on Stripe before you pay.';

  try {
    localStorage.removeItem('permitarc_tax_ack_v1');
    localStorage.removeItem('permitarc_tax_ack_v2');
  } catch (_e) {}

  function getAcks() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    } catch (_e) {
      return {};
    }
  }

  function hasAck(code) {
    return !!getAcks()[(code || '').toUpperCase()];
  }

  function saveAck(code) {
    var acks = getAcks();
    acks[(code || '').toUpperCase()] = true;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(acks));
  }

  function popupCopy(row) {
    if (row.status === 'active') {
      return {
        summary: 'Sales tax for ' + row.name + ': about 6–8% at checkout today (varies by ZIP).',
        detail:
          'Added on top of your plan price (for example $39/mo plus tax). The exact rate depends on your billing ZIP in ' +
          row.name +
          ' — state tax plus city, county, and other local taxes differ by area. Stripe shows your full total before you pay.',
        ack:
          'I understand sales tax at checkout for ' +
          row.name +
          ' depends on my billing ZIP and will be shown on Stripe before I pay.',
      };
    }
    if (row.status === 'future') {
      return {
        summary: 'Sales tax for ' + row.name + ': $0 on your checkout total today.',
        detail:
          row.name +
          ' may require tax on software subscriptions. When PermitArc registers there, the rate will depend on your billing ZIP — state, city, county, and local rules vary by address (not one flat rate for the whole state). Not charged today; may apply on a future renewal.',
        ack:
          'I understand sales tax is $0 today but may apply later in ' +
          row.name +
          ', based on my billing ZIP when PermitArc is registered there.',
      };
    }
    return {
      summary: 'Sales tax for ' + row.name + ': $0 (no state sales tax on this product).',
      detail:
        'Your listed plan price is what you pay at Stripe checkout for PermitArc in ' +
        row.name +
        ' (2026).',
      ack: 'I understand sales tax is $0 for PermitArc in ' + row.name + '.',
    };
  }

  function setSubscribeLocked(locked) {
    unlocked = !locked;
    links.forEach(function (el) {
      if (locked) {
        el.classList.add('is-gated');
        el.setAttribute('aria-disabled', 'true');
      } else {
        el.classList.remove('is-gated');
        el.setAttribute('aria-disabled', 'false');
      }
    });
  }

  function openModal(row) {
    var copy = popupCopy(row);
    modalTitle.textContent = row.name + ' — sales tax';
    modalSummary.textContent = copy.summary;
    modalDetail.textContent = copy.detail;
    modalReassurance.textContent = REASSURANCE;
    modalAckLabel.textContent = copy.ack;
    modalAck.checked = false;
    modal.hidden = false;
    document.body.classList.add('tax-modal-open');
    modalAck.focus();
  }

  function closeModal() {
    modal.hidden = true;
    document.body.classList.remove('tax-modal-open');
    modalAck.checked = false;
  }

  function completeAck(code) {
    saveAck(code);
    closeModal();
    setSubscribeLocked(false);
  }

  function onStateChange() {
    if (!modal.hidden) closeModal();

    var code = select.value;
    setSubscribeLocked(true);

    if (!code) return;

    var row = window.PermitArcSalesTax.lookup(code);
    if (!row) return;

    if (hasAck(code)) {
      setSubscribeLocked(false);
      return;
    }

    openModal(row);
  }

  function populateStates() {
    window.PermitArcSalesTax.states.forEach(function (row) {
      var opt = document.createElement('option');
      opt.value = row.code;
      opt.textContent = row.name;
      select.appendChild(opt);
    });
  }

  links.forEach(function (el) {
    el.addEventListener('click', function (e) {
      e.preventDefault();
      if (!unlocked) {
        select.focus();
        return;
      }
      var url = el.getAttribute('data-stripe-href');
      if (url) window.open(url, '_blank', 'noopener,noreferrer');
    });
  });

  if (beyondBtn) {
    beyondBtn.addEventListener(
      'click',
      function (e) {
        if (!unlocked) {
          e.preventDefault();
          e.stopImmediatePropagation();
          select.focus();
        }
      },
      true
    );
  }

  modalAck.addEventListener('change', function () {
    if (!modalAck.checked) return;
    var code = select.value;
    if (!code) return;
    completeAck(code);
  });

  select.addEventListener('change', onStateChange);

  populateStates();
  onStateChange();
})();
