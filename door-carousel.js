(function () {
  var SLIDES = [
    {
      src: 'assets/door-carousel/01-dashboard.png',
      alt: 'PermitArc dashboard with compliance score ring and map',
      caption: 'See your shops, compliance score, and pillar alerts in one calm view.',
    },
    {
      src: 'assets/door-carousel/02-scan.png',
      alt: 'New Document Entry with PDF preview and AI-filled fields',
      caption: 'Upload or scan — AI fills renewal fields; you approve and save.',
    },
    {
      src: 'assets/door-carousel/03-patrol.png',
      alt: 'Weekly Regulatory Patrol with verified official source links',
      caption: 'Weekly Patrol surfaces official updates for your ZIP and business type.',
    },
    {
      src: 'assets/door-carousel/04-proactive.png',
      alt: 'Proactive compliance suggestion with source link',
      caption: 'Proactive quietly flags likely gaps — only when there is something to show.',
    },
    {
      src: 'assets/door-carousel/05-shop-ai.png',
      alt: 'Location AI answering from uploaded shop documents',
      caption: 'Shop AI answers from your approved documents — not generic checklists.',
    },
    {
      src: 'assets/door-carousel/06-intel-deck.png',
      alt: 'Intel Deck showing four compliance pillars',
      caption: 'Radar, Patrol, Proactive, and Intelligence Log — included every week.',
    },
  ];

  var COUNT = SLIDES.length;
  var DEG = 360 / COUNT;
  var RADIUS = 520;
  var HOLD_MS = 3000;
  var TRANSITION_MS = 1200;

  var active = 0;
  var ring;
  var captionEl;
  var lightbox;
  var lightboxViewport;
  var lightboxFigure;
  var lightboxImg;
  var paused = false;
  var advanceTimer;
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var zoomScale = 1;
  var panX = 0;
  var panY = 0;
  var dragPointerId = null;
  var dragStartX = 0;
  var dragStartY = 0;
  var panStartX = 0;
  var panStartY = 0;

  function relDistance(i) {
    var d = (i - active + COUNT) % COUNT;
    if (d > COUNT / 2) d -= COUNT;
    return d;
  }

  function clampPan() {
    if (!lightboxViewport || !lightboxFigure) return;
    var vw = lightboxViewport.clientWidth;
    var vh = lightboxViewport.clientHeight;
    var fw = lightboxFigure.offsetWidth * zoomScale;
    var fh = lightboxFigure.offsetHeight * zoomScale;
    var maxX = Math.max(0, (fw - vw) / 2);
    var maxY = Math.max(0, (fh - vh) / 2);
    panX = Math.min(maxX, Math.max(-maxX, panX));
    panY = Math.min(maxY, Math.max(-maxY, panY));
  }

  function applyLightboxTransform() {
    if (!lightboxFigure) return;
    lightboxFigure.style.transform =
      'translate(' + panX + 'px, ' + panY + 'px) scale(' + zoomScale + ')';
    if (lightboxViewport) {
      lightboxViewport.classList.toggle('is-pannable', zoomScale > 1.02);
    }
  }

  function resetLightboxView() {
    zoomScale = 1;
    panX = 0;
    panY = 0;
    applyLightboxTransform();
    if (lightboxViewport) {
      lightboxViewport.classList.remove('is-dragging');
    }
    dragPointerId = null;
  }

  function setZoom(nextScale, clientX, clientY) {
    if (!lightboxViewport || !lightboxFigure) return;
    var rect = lightboxViewport.getBoundingClientRect();
    var cx = clientX - rect.left - rect.width / 2;
    var cy = clientY - rect.top - rect.height / 2;
    var prev = zoomScale;
    zoomScale = Math.min(4, Math.max(1, nextScale));
    if (zoomScale === prev) return;
    var ratio = zoomScale / prev;
    panX = cx - (cx - panX) * ratio;
    panY = cy - (cy - panY) * ratio;
    clampPan();
    applyLightboxTransform();
  }

  function bindLightboxZoomPan() {
    if (!lightboxViewport) return;

    lightboxViewport.addEventListener(
      'wheel',
      function (e) {
        if (lightbox.hasAttribute('hidden')) return;
        e.preventDefault();
        var delta = e.deltaY > 0 ? -0.12 : 0.12;
        setZoom(zoomScale + delta, e.clientX, e.clientY);
      },
      { passive: false }
    );

    lightboxViewport.addEventListener('pointerdown', function (e) {
      if (zoomScale <= 1.02 || e.button !== 0) return;
      dragPointerId = e.pointerId;
      dragStartX = e.clientX;
      dragStartY = e.clientY;
      panStartX = panX;
      panStartY = panY;
      lightboxViewport.classList.add('is-dragging');
      lightboxViewport.setPointerCapture(e.pointerId);
    });

    lightboxViewport.addEventListener('pointermove', function (e) {
      if (dragPointerId !== e.pointerId) return;
      panX = panStartX + (e.clientX - dragStartX);
      panY = panStartY + (e.clientY - dragStartY);
      clampPan();
      applyLightboxTransform();
    });

    lightboxViewport.addEventListener('pointerup', function (e) {
      if (dragPointerId !== e.pointerId) return;
      dragPointerId = null;
      lightboxViewport.classList.remove('is-dragging');
    });

    lightboxViewport.addEventListener('pointercancel', function () {
      dragPointerId = null;
      lightboxViewport.classList.remove('is-dragging');
    });
  }

  function buildLightbox() {
    lightbox = document.createElement('div');
    lightbox.className = 'door-lightbox';
    lightbox.id = 'doorLightbox';
    lightbox.setAttribute('hidden', '');
    lightbox.innerHTML =
      '<button type="button" class="door-lightbox__close" aria-label="Close enlarged screenshot">&times;</button>' +
      '<div class="door-lightbox__viewport" tabindex="-1">' +
      '<figure class="door-lightbox__figure"><img alt="" draggable="false" /></figure>' +
      '</div>';
    document.body.appendChild(lightbox);
    lightboxViewport = lightbox.querySelector('.door-lightbox__viewport');
    lightboxFigure = lightbox.querySelector('.door-lightbox__figure');
    lightboxImg = lightbox.querySelector('img');
    lightbox.querySelector('.door-lightbox__close').addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !lightbox.hasAttribute('hidden')) closeLightbox();
    });
    bindLightboxZoomPan();
  }

  function openLightbox(index) {
    if (!lightbox) return;
    var slide = SLIDES[index];
    lightboxImg.src = slide.src;
    lightboxImg.alt = slide.alt;
    resetLightboxView();
    lightbox.removeAttribute('hidden');
    document.body.classList.add('door-lightbox-open');
    paused = true;
    lightboxImg.addEventListener(
      'load',
      function () {
        resetLightboxView();
      },
      { once: true }
    );
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.setAttribute('hidden', '');
    document.body.classList.remove('door-lightbox-open');
    resetLightboxView();
    paused = false;
    scheduleAdvance();
  }

  function buildSlides() {
    ring = document.getElementById('doorCarouselRing');
    captionEl = document.getElementById('doorCarouselCaption');
    var dots = document.getElementById('doorCarouselDots');
    var stage = document.querySelector('.door-carousel__stage');
    if (!ring || !captionEl || !dots) return;

    buildLightbox();

    SLIDES.forEach(function (slide, i) {
      var fig = document.createElement('figure');
      fig.className = 'door-carousel__slide';
      fig.setAttribute('data-index', String(i));
      var card = document.createElement('div');
      card.className = 'door-carousel__card';
      var img = document.createElement('img');
      img.src = slide.src;
      img.alt = slide.alt;
      img.loading = i === 0 ? 'eager' : 'lazy';
      card.appendChild(img);
      fig.appendChild(card);
      if (!reducedMotion) {
        fig.style.transform =
          'rotateY(' + i * DEG + 'deg) translateZ(' + RADIUS + 'px)';
      }
      fig.addEventListener('click', function () {
        if (fig.classList.contains('is-front')) openLightbox(i);
      });
      ring.appendChild(fig);

      var dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'door-carousel__dot';
      dot.setAttribute('aria-label', 'Show slide ' + (i + 1));
      dot.addEventListener('click', function () {
        goTo(i);
      });
      dots.appendChild(dot);
    });

    if (stage && !reducedMotion) {
      stage.addEventListener('mouseenter', function () {
        paused = true;
      });
      stage.addEventListener('mouseleave', function () {
        paused = false;
        scheduleAdvance();
      });
      ring.addEventListener('transitionend', function (e) {
        if (e.propertyName === 'transform') scheduleAdvance();
      });
    }

    update();
    if (!reducedMotion) scheduleAdvance();
  }

  function scheduleAdvance() {
    window.clearTimeout(advanceTimer);
    if (reducedMotion || paused || document.body.classList.contains('door-lightbox-open')) {
      return;
    }
    advanceTimer = window.setTimeout(function () {
      goTo((active + 1) % COUNT);
    }, HOLD_MS);
  }

  function goTo(index) {
    window.clearTimeout(advanceTimer);
    active = index;
    update();
    if (!reducedMotion) {
      ring.style.transition =
        'transform ' + TRANSITION_MS + 'ms cubic-bezier(0.33, 0.02, 0.2, 1)';
    }
  }

  function update() {
    if (!ring) return;
    var offset = -active * DEG;
    if (!reducedMotion) {
      ring.style.transform = 'rotateY(' + offset + 'deg)';
    }
    var slides = ring.querySelectorAll('.door-carousel__slide');
    slides.forEach(function (el, i) {
      var d = relDistance(i);
      var abs = Math.abs(d);
      el.classList.toggle('is-front', d === 0);
      el.classList.toggle('is-near', abs === 1);
      el.classList.toggle('is-far', abs > 1);
    });
    var dots = document.querySelectorAll('.door-carousel__dot');
    dots.forEach(function (el, i) {
      el.classList.toggle('is-active', i === active);
    });
    captionEl.textContent = SLIDES[active].caption;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildSlides);
  } else {
    buildSlides();
  }
})();
