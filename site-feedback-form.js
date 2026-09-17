(function () {
  var form = document.getElementById('website-feedback-form');
  if (!form) return;

  var cfg = window.PermitArcPublicSupabase;
  var successEl = document.getElementById('feedback-form-success');
  var errorEl = document.getElementById('feedback-form-error');
  var submitBtn = form.querySelector('[type="submit"]');

  function setError(msg) {
    if (!errorEl) return;
    if (!msg) {
      errorEl.hidden = true;
      errorEl.textContent = '';
      return;
    }
    errorEl.hidden = false;
    errorEl.textContent = msg;
  }

  function setSubmitting(on) {
    if (!submitBtn) return;
    submitBtn.disabled = on;
    submitBtn.textContent = on ? 'Sending…' : 'Send message';
  }

  var categoryLabels = {
    bug: 'Something isn\'t working',
    readability: 'Hard to read or use',
    feature: 'Feature idea',
    account: 'Account or billing',
    other: 'Other',
  };

  function showSuccess() {
    form.hidden = true;
    var alt = document.getElementById('feedback-mail-alt');
    if (alt) alt.hidden = true;
    if (successEl) successEl.hidden = false;
    if (successEl) successEl.focus();
  }

  function openComposeFallback(category, message, contactEmail) {
    var label = categoryLabels[category] || category;
    var body = message;
    if (contactEmail) {
      body += '\n\nReply email: ' + contactEmail;
    }
    if (typeof window.PermitArcOpenSupportCompose === 'function') {
      window.PermitArcOpenSupportCompose('PermitArc support — ' + label, body);
      return true;
    }
    return false;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    setError('');

    var categoryInput = form.querySelector('input[name="category"]:checked');
    var messageEl = form.querySelector('#feedback-message');
    var emailEl = form.querySelector('#feedback-reply-email');

    if (!categoryInput) {
      setError('Pick what this is about.');
      return;
    }
    var message = (messageEl && messageEl.value.trim()) || '';
    if (message.length < 10) {
      setError('Please add a bit more detail (at least 10 characters).');
      if (messageEl) messageEl.focus();
      return;
    }
    if (message.length > 8000) {
      setError('Message is too long. Shorten it or use email below.');
      return;
    }

    var contactEmail = (emailEl && emailEl.value.trim()) || '';
    if (contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) {
      setError('Enter a valid reply email or leave it blank.');
      if (emailEl) emailEl.focus();
      return;
    }

    if (!cfg || !cfg.url || !cfg.anonKey) {
      setError('Could not send right now. Use Gmail or Outlook below.');
      return;
    }

    setSubmitting(true);
    var url =
      cfg.url.replace(/\/$/, '') + '/functions/v1/submit-website-feedback';

    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: cfg.anonKey,
        Authorization: 'Bearer ' + cfg.anonKey,
      },
      body: JSON.stringify({
        category: categoryInput.value,
        message: message,
        contactEmail: contactEmail || null,
      }),
    })
      .then(function (res) {
        return res.json().then(function (data) {
          if (!res.ok) {
            var err =
              (data && data.error) ||
              'Could not send. Try Gmail or Outlook below.';
            throw new Error(err);
          }
          showSuccess();
        });
      })
      .catch(function (err) {
        var cat = categoryInput.value;
        if (openComposeFallback(cat, message, contactEmail)) {
          setError(
            'We opened your mail app with your message — choose Gmail, Outlook, or Yahoo and tap Send.'
          );
          return;
        }
        setError(err.message || 'Could not send. Use the mail link below.');
      })
      .finally(function () {
        setSubmitting(false);
      });
  });
})();
