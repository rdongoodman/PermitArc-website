(function () {
  var SUPPORT = 'support@permitarc.com';

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

  var dialogEl = null;
  var backdropEl = null;
  var pending = null;

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
    dialogEl.innerHTML =
      '<h2 id="email-chooser-title">Send email with</h2>' +
      '<p class="email-chooser-lead">Pick the app you use. We never see your password.</p>' +
      '<div class="email-chooser-actions">' +
      '<button type="button" class="email-chooser-btn" data-provider="gmail">Gmail (web)</button>' +
      '<button type="button" class="email-chooser-btn" data-provider="outlook">Outlook (web)</button>' +
      '<button type="button" class="email-chooser-btn" data-provider="yahoo">Yahoo Mail (web)</button>' +
      '<button type="button" class="email-chooser-btn email-chooser-btn-muted" data-provider="default">Default email app</button>' +
      '</div>' +
      '<button type="button" class="email-chooser-cancel">Cancel</button>';

    backdropEl.hidden = true;
    dialogEl.hidden = true;
    document.body.appendChild(backdropEl);
    document.body.appendChild(dialogEl);

    dialogEl.querySelectorAll('[data-provider]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (!pending) return;
        var provider = btn.getAttribute('data-provider');
        var url;
        if (provider === 'gmail') url = gmailComposeUrl(pending);
        else if (provider === 'outlook') url = outlookComposeUrl(pending);
        else if (provider === 'yahoo') url = yahooComposeUrl(pending);
        else url = mailtoUrl(pending);
        closeDialog();
        window.open(url, '_blank', 'noopener,noreferrer');
      });
    });

    dialogEl.querySelector('.email-chooser-cancel').addEventListener('click', closeDialog);
    backdropEl.addEventListener('click', closeDialog);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && dialogEl && !dialogEl.hidden) closeDialog();
    });
  }

  function openDialog(mail) {
    ensureDialog();
    pending = mail;
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

  function canonicalSupportHref() {
    return window.PermitArcSupportMailto || null;
  }

  function normalizeSupportLinks() {
    var canonical = canonicalSupportHref();
    if (!canonical) return;
    document.querySelectorAll('a[href^="mailto:"]').forEach(function (link) {
      var href = link.getAttribute('href');
      if (!href || !isSupportMailto(href)) return;
      if (href.indexOf('body=') < 0) link.setAttribute('href', canonical);
    });
  }

  function initSupportEmail() {
    normalizeSupportLinks();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSupportEmail);
  } else {
    initSupportEmail();
  }

  document.addEventListener(
    'click',
    function (e) {
      var link = e.target.closest('a[href^="mailto:"]');
      if (!link || !isSupportMailto(link.getAttribute('href'))) return;
      e.preventDefault();
      var parsed = parseMailto(link.getAttribute('href'));
      if (parsed) openDialog(parsed);
    },
    true
  );
})();
