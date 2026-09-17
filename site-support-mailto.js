/** Canonical support mailto — empty body; real Gmail/Outlook/Yahoo compose UI. */
(function () {
  var subject = encodeURIComponent('PermitArc support');
  window.PermitArcSupportMailto =
    'mailto:support@permitarc.com?subject=' + subject;
})();
