/**
 * Billing-state modal ack before Stripe Checkout.
 * Tax is calculated on Stripe — this gate is disclosure only.
 * Remembers ack per state in localStorage (this browser).
 */
(function () {
  var STORAGE_KEY = 'permitarc_tax_ack_v1';
  var STATE_KEY = 'permitarc_tax_last_state';

  var select = document.getElementById('billing-state');
  var statusEl = document.getElementById('tax-gate-status');
  var modal = document.getElementById('tax-state-modal');
  var modalClose = document.getElementById('tax-modal-close');
  var modalTitle = document.getElementById('tax-modal-title');
  var modalBadge = document.getElementById('tax-modal-badge');
  var modalBody = document.getElementById('tax-modal-body');
  var modalNote = document.getElementById('tax-modal-note');
  var modalAck = document.getElementById('tax-modal-ack');
  var modalAckLabel = document.getElementById('tax-modal-ack-label');
  var modalDone = document.getElementById('tax-modal-done');

  if (!select || !window.PermitArcSalesTax || !modal) return;

  var links = document.querySelectorAll('a.stripe-checkout-link');
  var beyondBtn = document.getElementById('beyond-five-checkout');
  var unlocked = false;
  var pendingRow = null;

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
    localStorage.setItem(STATE_KEY, (code || '').toUpperCase());
  }

  function modalCopy(row) {
    if (row.status === 'active') {
      return {
        badgeClass: 'tax-modal-badge-active',
        badge: 'Tax at Stripe checkout — now',
        body:
          'For ' +
          row.name +
          ', sales tax is added on top of your plan price at Stripe Checkout (for example $39/mo plus tax). You approve the full total before you pay.',
        note: row.note,
        ack:
          'I understand that sales tax will be added at Stripe Checkout for my ' +
          row.name +
          ' billing address.',
      };
    }
    if (row.status === 'future') {
      return {
        badgeClass: 'tax-modal-badge-future',
        badge: 'May apply on a future renewal',
        body:
          'For ' +
          row.name +
          ', checkout today may show no sales tax line while PermitArc is not registered there yet. If we register later, applicable sales tax may be added on a future renewal — not a hidden price increase.',
        note: row.note,
        ack:
          'I understand sales tax may apply on a future renewal in ' +
          row.name +
          ' after PermitArc registers there.',
      };
    }
    return {
      badgeClass: 'tax-modal-badge-none',
      badge: 'No SaaS sales tax at checkout (2026)',
      body:
        'For ' +
        row.name +
        ', PermitArc SaaS subscriptions are not subject to state sales tax at checkout in 2026. Your listed plan price stays the same on Stripe.',
      note: row.note,
      ack:
        'I understand there is no PermitArc SaaS sales tax at checkout for my ' +
        row.name +
        ' billing address (2026 rules).',
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

  function showStatus(text, kind) {
    if (!statusEl) return;
    statusEl.hidden = false;
    statusEl.className = 'tax-gate-status tax-gate-status-' + (kind || 'ok');
    statusEl.textContent = text;
  }

  function hideStatus() {
    if (!statusEl) return;
    statusEl.hidden = true;
    statusEl.textContent = '';
  }

  function openModal(row) {
    pendingRow = row;
    var copy = modalCopy(row);
    modalTitle.textContent = row.name;
    modalBadge.className = 'tax-modal-badge ' + copy.badgeClass;
    modalBadge.textContent = copy.badge;
    modalBody.textContent = copy.body;
    modalNote.textContent = copy.note || '';
    modalAckLabel.textContent = copy.ack;
    modalAck.checked = false;
    modalDone.disabled = true;
    modalClose.disabled = true;
    modal.hidden = false;
    document.body.classList.add('tax-modal-open');
    modalAck.focus();
  }

  function closeModal() {
    modal.hidden = true;
    document.body.classList.remove('tax-modal-open');
    pendingRow = null;
    modalAck.checked = false;
    modalDone.disabled = true;
    modalClose.disabled = true;
  }

  function completeAck(row) {
    saveAck(row.code);
    closeModal();
    showStatus(
      '\u2713 ' +
        row.name +
        ' acknowledged on this device — choose your plan below.',
      row.status === 'future' ? 'future' : row.status === 'active' ? 'active' : 'none'
    );
    setSubscribeLocked(false);
  }

  function onStateChange() {
    var code = select.value;
    hideStatus();
    setSubscribeLocked(true);

    if (!code) {
      return;
    }

    var row = window.PermitArcSalesTax.lookup(code);
    if (!row) return;

    if (hasAck(code)) {
      showStatus(
        '\u2713 ' + row.name + ' already acknowledged — choose your plan below.',
        row.status === 'future' ? 'future' : row.status === 'active' ? 'active' : 'none'
      );
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
    var last = localStorage.getItem(STATE_KEY);
    if (last && window.PermitArcSalesTax.lookup(last)) {
      select.value = last;
    }
  }

  links.forEach(function (el) {
    el.addEventListener('click', function (e) {
      e.preventDefault();
      if (!unlocked) {
        select.focus();
        if (!select.value) {
          showStatus('Choose your billing state first — a sales tax notice will appear.', 'warn');
        }
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
          showStatus('Choose your billing state and acknowledge the sales tax notice first.', 'warn');
        }
      },
      true
    );
  }

  modalAck.addEventListener('change', function () {
    var on = modalAck.checked;
    modalDone.disabled = !on;
    modalClose.disabled = !on;
  });

  modalDone.addEventListener('click', function () {
    if (!pendingRow || !modalAck.checked) return;
    completeAck(pendingRow);
  });

  modalClose.addEventListener('click', function () {
    if (!pendingRow || !modalAck.checked) return;
    completeAck(pendingRow);
  });

  select.addEventListener('change', onStateChange);

  populateStates();
  onStateChange();

  window.PermitArcTaxGate = {
    isUnlocked: function () {
      return unlocked;
    },
  };
})();
