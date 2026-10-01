(function () {
  var cfg = window.PermitArcNav;
  if (!cfg) return;

  var navRoot = document.getElementById('site-nav');
  var footerRoot = document.getElementById('site-footer-links');
  var current = (document.body && document.body.getAttribute('data-nav-page')) || '';

  function onLongHome() {
    var path = window.location.pathname || '';
    return /home-more\.html$/i.test(path);
  }

  function resolveHref(href) {
    if (onLongHome()) {
      if (href.indexOf('home-more.html#') === 0) {
        return href.slice('home-more.html'.length);
      }
      if (href === 'home-more.html' || href === 'home-more.html#top') {
        return href === 'home-more.html#top' ? '#top' : './';
      }
    }
    if (href === 'index.html') return './';
    return href;
  }

  function appendBrandWordmark(parent) {
    var wm = document.createElement('span');
    wm.className = 'logo-wordmark';
    wm.appendChild(document.createTextNode('Permit'));
    var arc = document.createElement('span');
    arc.className = 'logo-arc';
    arc.textContent = 'Arc';
    wm.appendChild(arc);
    parent.appendChild(wm);
  }

  function appendLink(parent, item, isCurrent) {
    var a = document.createElement('a');
    a.href = resolveHref(item.href);
    if (item.brandPrefix) {
      a.className = 'nav-link-with-brand';
      if (item.download) a.classList.add('nav-item-download');
      var lead = document.createElement('span');
      lead.className = 'nav-link-lead';
      lead.textContent = item.brandPrefix;
      a.appendChild(lead);
      appendBrandWordmark(a);
      a.setAttribute('aria-label', item.label);
    } else {
      a.textContent = item.label;
      if (item.download) a.className = 'nav-item-download';
    }
    if (isCurrent) a.setAttribute('aria-current', 'page');
    parent.appendChild(a);
  }

  if (navRoot) {
    navRoot.textContent = '';
    navRoot.setAttribute('aria-label', 'Main');
    cfg.items.forEach(function (item) {
      appendLink(navRoot, item, item.id === current);
    });
    navRoot.classList.add('nav-ready');
  }

  if (footerRoot) {
    footerRoot.textContent = '';
    cfg.footer.forEach(function (item) {
      appendLink(footerRoot, item, false);
    });
  }

  function upgradeShieldLogo(img) {
    if (!img || img.closest('.permitarc-shield-logo')) return;

    var wrap = document.createElement('span');
    wrap.className = 'permitarc-shield-logo';

    var glow = document.createElement('span');
    glow.className = 'permitarc-shield-inner-glow';

    var radar = document.createElement('span');
    radar.className = 'permitarc-shield-radar';

    var rotator = document.createElement('span');
    rotator.className = 'permitarc-shield-radar-rotator';

    var wedge = document.createElement('span');
    wedge.className = 'permitarc-shield-radar-wedge';

    var beam = document.createElement('span');
    beam.className = 'permitarc-shield-radar-beam';

    rotator.appendChild(wedge);
    rotator.appendChild(beam);
    radar.appendChild(rotator);

    var parent = img.parentNode;
    parent.insertBefore(wrap, img);
    wrap.appendChild(glow);
    wrap.appendChild(img);
    wrap.appendChild(radar);
  }

  document.querySelectorAll('img.logo-mark').forEach(upgradeShieldLogo);

  var emailChooser = document.createElement('script');
  emailChooser.src = 'site-email-compose.js?v=20260918chooser';
  emailChooser.defer = true;
  document.body.appendChild(emailChooser);
})();
