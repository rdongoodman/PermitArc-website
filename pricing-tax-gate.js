/**

 * Billing-state popup ack before Stripe Checkout.

 * Plain-language disclosure only — Stripe calculates tax at checkout.

 */

(function () {

  var STORAGE_KEY = 'permitarc_tax_ack_v4';



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



  try {

    localStorage.removeItem('permitarc_tax_ack_v1');

    localStorage.removeItem('permitarc_tax_ack_v2');

    localStorage.removeItem('permitarc_tax_ack_v3');

  } catch (_e) {}



  function getRateDisplay(row) {

    return window.PermitArcSalesTax.formatRateRange(row);

  }



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

    var rateDisplay = getRateDisplay(row);



    if (row.status === 'active') {

      var activeRate = rateDisplay || '6.25–8.25%';

      return {

        summary:

          'About ' + activeRate + ' sales tax at checkout today — exact rate depends on your ZIP.',

        detail:

          'Added on top of your plan price. Stripe uses your billing address and shows the full total before you pay.',

        reassurance: '',

        ack: 'I understand sales tax for ' + row.name + ' will appear at checkout.',

      };

    }



    if (row.status === 'future') {

      if (row.rateBasis === 'b2b_exempt') {

        return {

          summary:

            'Sales tax is $0 at checkout today. B2B SaaS purchases are often exempt in ' +

            row.name +

            '.',

          detail:

            'When PermitArc registers in ' +

            row.name +

            ', tax may apply on a later renewal if your purchase is taxable. Stripe shows the full total before you pay.',

          reassurance: '',

          ack:

            'I understand tax is $0 today and may apply later in ' +

            row.name +

            ' if my purchase is taxable.',

        };

      }



      var ratePhrase = row.rateBasis === 'b2b_saas'

        ? rateDisplay

        : 'combined rate typically ' + rateDisplay;



      return {

        summary:

          'Sales tax is $0 at checkout today. If it applies later: ' +

          ratePhrase +

          ' (varies by ZIP).',

        detail:

          'When PermitArc registers in ' +

          row.name +

          ', tax may apply on a later renewal. Stripe uses your billing address and shows the full total before you pay.',

        reassurance: '',

        ack:

          'I understand tax is $0 today and may apply later in ' +

          row.name +

          ' (' +

          ratePhrase +

          ').',

      };

    }



    return {

      summary: 'Sales tax is $0 for this product in ' + row.name + '.',

      detail: 'Your listed plan price is what you pay at checkout.',

      reassurance: '',

      ack: 'I understand sales tax is $0 in ' + row.name + '.',

    };

  }



  function checkoutAllowed() {

    return window.PermitArcLaunch && window.PermitArcLaunch.checkoutEnabled === true;

  }



  function setSubscribeLocked(locked) {

    if (!checkoutAllowed()) locked = true;

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

    modalReassurance.textContent = copy.reassurance || '';

    modalReassurance.hidden = !copy.reassurance;

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

      if (!checkoutAllowed()) {

        var notice = document.getElementById('prelaunch-notice');

        if (notice) {

          notice.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

          notice.focus({ preventScroll: true });

        }

        return;

      }

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

        if (!checkoutAllowed() || !unlocked) {

          e.preventDefault();

          e.stopImmediatePropagation();

          if (!checkoutAllowed()) {

            var notice = document.getElementById('prelaunch-notice');

            if (notice) notice.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

          } else {

            select.focus();

          }

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


