/** Canonical support mailto — empty body; real Gmail/Outlook/Yahoo compose UI. */
(function () {
  var SUPPORT = 'support@permitarc.com';
  var BASE_SUBJECT = 'PermitArc support';

  /** Page context so replies sort themselves in the support inbox. */
  var PAGE_SUBJECTS = {
    pricing: 'Pricing',
    'sales-tax': 'Sales tax',
    download: 'Download',
    terms: 'Terms',
    privacy: 'Privacy',
    ai: 'AI disclaimer',
    tutorial: 'Tutorial',
    'quick-guide': 'Quick guide',
    intelligence: 'Compliance intelligence',
  };

  function subjectForPage() {
    var page =
      (document.body && document.body.getAttribute('data-nav-page')) || '';
    var label = PAGE_SUBJECTS[page];
    return label ? BASE_SUBJECT + ' — ' + label : BASE_SUBJECT;
  }

  function hrefFor(subject) {
    return (
      'mailto:' + SUPPORT + '?subject=' + encodeURIComponent(subject || BASE_SUBJECT)
    );
  }

  window.PermitArcSupport = {
    address: SUPPORT,
    baseSubject: BASE_SUBJECT,
    subjectForPage: subjectForPage,
    hrefFor: hrefFor,
  };

  window.PermitArcSupportMailto = hrefFor(BASE_SUBJECT);
})();
