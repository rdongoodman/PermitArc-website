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
})();
