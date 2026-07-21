(function () {
  var header = document.querySelector('.site-header');
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('site-nav');
  if (!header || !toggle || !nav) return;

  function closeNav() {
    header.classList.remove('is-nav-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');
  }

  toggle.addEventListener('click', function () {
    var open = header.classList.toggle('is-nav-open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });

  nav.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', closeNav);
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') closeNav();
  });

  window.matchMedia('(min-width: 769px)').addEventListener('change', function (event) {
    if (event.matches) closeNav();
  });

  window.addEventListener('scroll', function () {
    if (header.classList.contains('is-nav-open')) closeNav();
  }, { passive: true });
})();
