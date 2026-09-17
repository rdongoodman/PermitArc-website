(function () {
  var cfg = window.PermitArcNav;
  if (!cfg) return;

  var navRoot = document.getElementById('site-nav');
  var footerRoot = document.getElementById('site-footer-links');
  var current = (document.body && document.body.getAttribute('data-nav-page')) || '';

  function onHome() {
    var path = window.location.pathname || '';
    return path === '/' || /index\.html$/i.test(path);
  }

  function resolveHref(href) {
    if (!onHome()) return href;
    if (href.indexOf('index.html#') === 0) return href.slice('index.html'.length);
    if (href === 'index.html') return './';
    return href;
  }

  function appendLink(parent, item, isCurrent) {
    var a = document.createElement('a');
    a.href = resolveHref(item.href);
    a.textContent = item.label;
    if (item.download) a.className = 'nav-item-download';
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
  emailChooser.src = 'site-email-compose.js?v=20260918support2';
  emailChooser.defer = true;
  document.body.appendChild(emailChooser);
})();
