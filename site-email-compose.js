(function () {
  if (window.PermitArcEmailChooserReady) return;
  window.PermitArcEmailChooserReady = true;

  var SUPPORT = 'support@permitarc.com';
  var LAST_PROVIDER_KEY = 'permitarc-mail-provider';

  var PROVIDERS = [
    { id: 'gmail', label: 'Gmail (web)' },
    { id: 'outlook', label: 'Outlook (web)' },
    { id: 'yahoo', label: 'Yahoo Mail (web)' },
    { id: 'default', label: 'Default email app', muted: true },
  ];

  function parseMailto(href) {
    if (!href || href.indexOf('mailto:') !== 0) return null;
    var raw = href.slice(7);
    var q = raw.indexOf('?');
    var toPart = q >= 0 ? raw.slice(0, q) : raw;
    var to = decodeURIComponent(toPart.replace(/\+/g, ' '));
    if (!to) to = SUPPORT;
    var subject = '';
    var body = '';
    if (q >= 0) {
      var params = new URLSearchParams(raw.slice(q + 1));
      subject = params.get('subject') || '';
      body = params.get('body') || '';
    }
    return { to: to, subject: subject, body: body };
  }

  function gmailComposeUrl(m) {
    var u = new URL('https://mail.google.com/mail/');
    u.searchParams.set('view', 'cm');
    u.searchParams.set('fs', '1');
    u.searchParams.set('to', m.to);
    if (m.subject) u.searchParams.set('su', m.subject);
    if (m.body) u.searchParams.set('body', m.body);
    return u.toString();
  }

  function outlookComposeUrl(m) {
    var u = new URL('https://outlook.live.com/mail/0/deeplink/compose');
    u.searchParams.set('to', m.to);
    if (m.subject) u.searchParams.set('subject', m.subject);
    if (m.body) u.searchParams.set('body', m.body);
    return u.toString();
  }

  function yahooComposeUrl(m) {
    var u = new URL('https://compose.mail.yahoo.com/');
    u.searchParams.set('to', m.to);
    if (m.subject) u.searchParams.set('subject', m.subject);
    if (m.body) u.searchParams.set('body', m.body);
    return u.toString();
  }

  function mailtoUrl(m) {
    var href = 'mailto:' + encodeURIComponent(m.to);
    var parts = [];
    if (m.subject) parts.push('subject=' + encodeURIComponent(m.subject));
    if (m.body) parts.push('body=' + encodeURIComponent(m.body));
    if (parts.length) href += '?' + parts.join('&');
    return href;
  }

  function readLastProvider() {
    try {
      return window.localStorage.getItem(LAST_PROVIDER_KEY) || '';
    } catch (err) {
      return '';
    }
  }

  function rememberProvider(id) {
    try {
      window.localStorage.setItem(LAST_PROVIDER_KEY, id);
    } catch (err) {
      /* private browsing — ignore */
    }
  }

  function orderedProviders() {
    var last = readLastProvider();
    if (!last) return PROVIDERS.slice();
    var first = [];
    var rest = [];
    PROVIDERS.forEach(function (p) {
      (p.id === last ? first : rest).push(p);
    });
    return first.concat(rest);
  }

  var dialogEl = null;
  var backdropEl = null;
  var pending = null;
  var lastUsedId = '';

  function providerButtonsHtml() {
    lastUsedId = readLastProvider();
    return orderedProviders()
      .map(function (p) {
        var cls =
          'email-chooser-btn' + (p.muted ? ' email-chooser-btn-muted' : '');
        var tag =
          p.id === lastUsedId
            ? '<span class="email-chooser-last">Last used</span>'
            : '';
        return (
          '<button type="button" class="' +
          cls +
          '" data-provider="' +
          p.id +
          '">' +
          p.label +
          tag +
          '</button>'
        );
      })
      .join('');
  }

  function ensureDialog() {
    if (dialogEl) return;
    backdropEl = document.createElement('div');
    backdropEl.className = 'email-chooser-backdrop';
    backdropEl.hidden = true;

    dialogEl = document.createElement('div');
    dialogEl.className = 'email-chooser-dialog';
    dialogEl.setAttribute('role', 'dialog');
    dialogEl.setAttribute('aria-modal', 'true');
    dialogEl.setAttribute('aria-labelledby', 'email-chooser-title');

    document.body.appendChild(backdropEl);
    document.body.appendChild(dialogEl);

    backdropEl.addEventListener('click', closeDialog);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && dialogEl && !dialogEl.hidden) closeDialog();
    });

    dialogEl.addEventListener('click', function (e) {
      var providerBtn = e.target.closest('[data-provider]');
      if (providerBtn) {
        chooseProvider(providerBtn.getAttribute('data-provider'));
        return;
      }
      if (e.target.closest('.email-chooser-copy')) {
        copyAddress(e.target.closest('.email-chooser-copy'));
        return;
      }
      if (e.target.closest('.email-chooser-cancel')) closeDialog();
    });
  }

  function renderChooser() {
    dialogEl.innerHTML =
      '<h2 id="email-chooser-title">Email PermitArc support</h2>' +
      '<p class="email-chooser-lead">Pick the mail app you use. Your draft opens addressed to <strong>' +
      SUPPORT +
      '</strong> — tell us what happened and which page you were on. We reply within one business day. We never see your password.</p>' +
      '<div class="email-chooser-actions">' +
      providerButtonsHtml() +
      '</div>' +
      '<button type="button" class="email-chooser-copy">Copy ' +
      SUPPORT +
      '</button>' +
      '<button type="button" class="email-chooser-cancel">Cancel</button>';
  }

  function renderDefaultAppFallback() {
    dialogEl.innerHTML =
      '<h2 id="email-chooser-title">Opening your mail app</h2>' +
      '<p class="email-chooser-lead">If nothing opened, this computer has no default mail app set. Copy the address and write to us from wherever you read mail.</p>' +
      '<button type="button" class="email-chooser-copy">Copy ' +
      SUPPORT +
      '</button>' +
      '<button type="button" class="email-chooser-cancel">Close</button>';
    var copy = dialogEl.querySelector('.email-chooser-copy');
    if (copy) copy.focus();
  }

  function copyAddress(btn) {
    var done = function () {
      btn.textContent = 'Copied ' + SUPPORT;
      btn.classList.add('email-chooser-copy-done');
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(SUPPORT).then(done, function () {
        btn.textContent = SUPPORT;
      });
      return;
    }
    btn.textContent = SUPPORT;
  }

  function chooseProvider(provider) {
    if (!pending) return;
    rememberProvider(provider);
    var url;
    if (provider === 'gmail') url = gmailComposeUrl(pending);
    else if (provider === 'outlook') url = outlookComposeUrl(pending);
    else if (provider === 'yahoo') url = yahooComposeUrl(pending);
    else url = mailtoUrl(pending);

    if (provider === 'default') {
      window.location.href = url;
      renderDefaultAppFallback();
      return;
    }
    closeDialog();
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  function openDialog(mail) {
    ensureDialog();
    pending = mail;
    renderChooser();
    dialogEl.hidden = false;
    backdropEl.hidden = false;
    document.body.classList.add('email-chooser-open');
    var first = dialogEl.querySelector('.email-chooser-btn');
    if (first) first.focus();
  }

  function closeDialog() {
    if (!dialogEl) return;
    dialogEl.hidden = true;
    backdropEl.hidden = true;
    document.body.classList.remove('email-chooser-open');
    pending = null;
  }

  function isSupportMailto(href) {
    return !!href && href.toLowerCase().indexOf(SUPPORT) >= 0;
  }

  function pageSupportHref() {
    var api = window.PermitArcSupport;
    if (api && typeof api.hrefFor === 'function') {
      return api.hrefFor(api.subjectForPage());
    }
    return window.PermitArcSupportMailto || null;
  }

  function normalizeSupportLinks() {
    var canonical = pageSupportHref();
    if (!canonical) return;
    document.querySelectorAll('a[href^="mailto:"]').forEach(function (link) {
      var href = link.getAttribute('href');
      if (!href || !isSupportMailto(href)) return;
      link.setAttribute('href', canonical);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', normalizeSupportLinks);
  } else {
    normalizeSupportLinks();
  }

  function supportMailForOpen(linkHref) {
    var canonical = pageSupportHref();
    var href = isSupportMailto(linkHref) && canonical ? canonical : linkHref;
    return parseMailto(href);
  }

  document.addEventListener(
    'click',
    function (e) {
      var link = e.target.closest('a[href^="mailto:"]');
      if (!link || !isSupportMailto(link.getAttribute('href'))) return;
      e.preventDefault();
      var parsed = supportMailForOpen(link.getAttribute('href'));
      if (parsed) openDialog(parsed);
    },
    true
  );

  window.PermitArcOpenSupportCompose = function (subject, body) {
    openDialog({
      to: SUPPORT,
      subject: subject || 'PermitArc support',
      body: body || '',
    });
  };
})();
