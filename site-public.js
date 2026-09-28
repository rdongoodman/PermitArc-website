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

})();
