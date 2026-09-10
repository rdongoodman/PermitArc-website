(function () {
  var cfg = window.PermitArcLaunch || {};
  var params = new URLSearchParams(window.location.search);
  var preview = params.get('preview');
  var token = cfg.downloadPreviewToken || 'permitarc-owner-preview';
  var allowed = cfg.downloadsPublic === true || preview === token;

  if (!allowed) {
    window.location.replace('pricing.html?from=download');
    return;
  }

  document.documentElement.classList.add('download-access-granted');
})();
