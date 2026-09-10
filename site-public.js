(function () {
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
