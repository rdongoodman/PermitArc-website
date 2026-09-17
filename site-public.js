(function () {
  function collapseAllDetails() {
    document.querySelectorAll('details[open]').forEach(function (el) {
      el.removeAttribute('open');
    });
  }

  function initDetailsReset() {
    collapseAllDetails();
    window.addEventListener('pagehide', collapseAllDetails);
    window.addEventListener('pageshow', function (event) {
      if (event.persisted) collapseAllDetails();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDetailsReset);
  } else {
    initDetailsReset();
  }

  var cfg = window.PermitArcLaunch || {};

  if (cfg.downloadsPublic !== true) {
    document.querySelectorAll('.nav-item-download').forEach(function (el) {
      if (el.parentNode) el.parentNode.removeChild(el);
    });
  }

  if (cfg.checkoutEnabled !== true) {
    var notice = document.getElementById('prelaunch-notice');
    if (notice) notice.hidden = false;

    var hint = document.getElementById('tax-gate-hint');
    if (hint) {
      hint.textContent =
        'Preview: choose your state to see the sales tax notice. Self-serve checkout opens when install files are ready.';
    }
  }
})();
