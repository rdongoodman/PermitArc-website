/**
 * Door hero — flat 2D screenshot carousel + zoom/pan lightbox.
 */
(function () {
  var SLIDES = [
    { src: "assets/door-carousel/01-dashboard.png", caption: "Dashboard — compliance score and intel at a glance" },
    { src: "assets/door-carousel/02-scan.png", caption: "Scan & review — AI fills renewal fields you verify" },
    { src: "assets/door-carousel/03-patrol.png", caption: "Weekly Regulatory Patrol — official updates for your ZIP" },
    { src: "assets/door-carousel/04-proactive.png", caption: "Proactive review — quiet vault cross-checks" },
    { src: "assets/door-carousel/05-shop-ai.png", caption: "Document Ask AI — renewal steps from your file, with official links" },
    { src: "assets/door-carousel/06-intel-deck.png", caption: "Intel Deck — patrol, proactive, and alerts in one place" },
  ];

  var HOLD_MS = 4500;
  var TRANSITION_MS = 550;

  var ring = document.getElementById("doorCarouselRing");
  var captionEl = document.getElementById("doorCarouselCaption");
  var dotsEl = document.getElementById("doorCarouselDots");
  var stage = document.querySelector(".door-carousel__stage");
  if (!ring || !captionEl || !dotsEl || !stage) return;

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var active = 0;
  var slides = [];
  var dots = [];
  var timer = null;
  var lightbox = null;
  var lbState = {
    scale: 1,
    fitScale: 1,
    naturalW: 0,
    naturalH: 0,
    tx: 0,
    ty: 0,
    dragging: false,
    px: 0,
    py: 0,
  };

  function buildSlides() {
    ring.className = "door-carousel__track";
    ring.style.setProperty("--door-carousel-slides", String(SLIDES.length));
    ring.setAttribute("role", "list");
    SLIDES.forEach(function (slide, i) {
      var fig = document.createElement("figure");
      fig.className = "door-carousel__slide";
      fig.setAttribute("role", "listitem");
      var card = document.createElement("div");
      card.className = "door-carousel__card";
      var img = document.createElement("img");
      img.src = slide.src;
      img.alt = slide.caption;
      img.loading = i === 0 ? "eager" : "lazy";
      img.decoding = "async";
      img.draggable = false;
      card.appendChild(img);
      fig.appendChild(card);
      fig.addEventListener("click", function () {
        if (i === active) openLightbox(i);
      });
      ring.appendChild(fig);
      slides.push(fig);
    });
  }

  function buildDots() {
    SLIDES.forEach(function (slide, i) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "door-carousel__dot";
      btn.setAttribute("role", "tab");
      btn.setAttribute("aria-label", "Show screenshot " + (i + 1) + ": " + slide.caption);
      btn.addEventListener("click", function () {
        goTo(i, true);
      });
      dotsEl.appendChild(btn);
      dots.push(btn);
    });
  }

  function update() {
    if (!reducedMotion) {
      var stepPct = (100 / SLIDES.length).toFixed(6);
      ring.style.transform = "translateX(-" + active * stepPct + "%)";
    } else {
      ring.style.transform = "none";
      slides.forEach(function (el, i) {
        el.style.display = i === active ? "flex" : "none";
      });
    }
    captionEl.textContent = SLIDES[active].caption;
    dots.forEach(function (d, i) {
      var on = i === active;
      d.classList.toggle("is-active", on);
      d.setAttribute("aria-selected", on ? "true" : "false");
    });
    slides.forEach(function (el, i) {
      var on = i === active;
      el.classList.toggle("is-active", on);
      el.setAttribute("aria-hidden", on ? "false" : "true");
    });
  }

  function goTo(index, userInitiated) {
    active = ((index % SLIDES.length) + SLIDES.length) % SLIDES.length;
    update();
    if (userInitiated) {
      clearTimeout(timer);
      scheduleAdvance();
    }
  }

  function scheduleAdvance() {
    clearTimeout(timer);
    if (reducedMotion) return;
    if (lightbox && !lightbox.hidden) return;
    timer = setTimeout(function () {
      goTo(active + 1, false);
    }, HOLD_MS);
  }

  function onTransitionEnd(e) {
    if (e.target !== ring || e.propertyName !== "transform") return;
    scheduleAdvance();
  }

  function ensureLightbox() {
    if (lightbox) return lightbox;
    lightbox = document.createElement("div");
    lightbox.className = "door-lightbox";
    lightbox.hidden = true;
    lightbox.setAttribute("role", "dialog");
    lightbox.setAttribute("aria-modal", "true");
    lightbox.setAttribute("aria-label", "Enlarged screenshot");
    var close = document.createElement("button");
    close.type = "button";
    close.className = "door-lightbox__close";
    close.setAttribute("aria-label", "Close");
    close.textContent = "\u00d7";
    var viewport = document.createElement("div");
    viewport.className = "door-lightbox__viewport";
    var figure = document.createElement("figure");
    figure.className = "door-lightbox__figure";
    var img = document.createElement("img");
    img.alt = "";
    figure.appendChild(img);
    viewport.appendChild(figure);
    lightbox.appendChild(close);
    lightbox.appendChild(viewport);
    document.body.appendChild(lightbox);

    function measureFitScale() {
      if (!lbState.naturalW || !lbState.naturalH) return 1;
      var maxW = viewport.clientWidth || window.innerWidth * 0.96;
      var maxH = viewport.clientHeight || window.innerHeight * 0.88;
      return Math.min(1, maxW / lbState.naturalW, maxH / lbState.naturalH);
    }

    function applyLbTransform() {
      var w = Math.round(lbState.naturalW * lbState.scale);
      var h = Math.round(lbState.naturalH * lbState.scale);
      img.style.width = w ? w + "px" : "";
      img.style.height = h ? h + "px" : "";
      figure.style.transform = "translate(" + lbState.tx + "px," + lbState.ty + "px)";
      viewport.classList.toggle("is-pannable", lbState.scale > lbState.fitScale + 0.01);
      viewport.style.cursor = lbState.scale > lbState.fitScale + 0.01 ? "grab" : "zoom-in";
    }

    function resetLbView() {
      lbState.fitScale = measureFitScale();
      lbState.scale = lbState.fitScale;
      lbState.tx = 0;
      lbState.ty = 0;
      applyLbTransform();
    }

    function onLbImageReady() {
      lbState.naturalW = img.naturalWidth;
      lbState.naturalH = img.naturalHeight;
      resetLbView();
    }

    function closeLb() {
      lightbox.hidden = true;
      document.body.classList.remove("door-lightbox-open");
      scheduleAdvance();
    }

    close.addEventListener("click", closeLb);
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) closeLb();
    });
    document.addEventListener("keydown", function (e) {
      if (lightbox.hidden) return;
      if (e.key === "Escape") closeLb();
    });

    viewport.addEventListener(
      "wheel",
      function (e) {
        e.preventDefault();
        var delta = e.deltaY > 0 ? -0.08 : 0.08;
        var minScale = lbState.fitScale || 0.1;
        lbState.scale = Math.min(3, Math.max(minScale, lbState.scale + delta));
        if (lbState.scale <= minScale + 0.01) {
          lbState.tx = 0;
          lbState.ty = 0;
        }
        applyLbTransform();
      },
      { passive: false }
    );

    viewport.addEventListener("pointerdown", function (e) {
      if (lbState.scale <= (lbState.fitScale || 1) + 0.01) return;
      lbState.dragging = true;
      lbState.px = e.clientX;
      lbState.py = e.clientY;
      viewport.classList.add("is-dragging");
      viewport.setPointerCapture(e.pointerId);
    });
    viewport.addEventListener("pointermove", function (e) {
      if (!lbState.dragging) return;
      lbState.tx += e.clientX - lbState.px;
      lbState.ty += e.clientY - lbState.py;
      lbState.px = e.clientX;
      lbState.py = e.clientY;
      applyLbTransform();
    });
    viewport.addEventListener("pointerup", function () {
      lbState.dragging = false;
      viewport.classList.remove("is-dragging");
    });

    lightbox._img = img;
    lightbox._reset = resetLbView;
    lightbox._onReady = onLbImageReady;
    img.addEventListener("load", onLbImageReady);
    return lightbox;
  }

  function openLightbox(index) {
    var lb = ensureLightbox();
    clearTimeout(timer);
    lbState.naturalW = 0;
    lbState.naturalH = 0;
    lb._img.src = SLIDES[index].src;
    lb._img.alt = SLIDES[index].caption;
    if (lb._img.complete && lb._img.naturalWidth) {
      lb._onReady();
    }
    lb.hidden = false;
    document.body.classList.add("door-lightbox-open");
  }

  buildSlides();
  buildDots();
  update();
  ring.addEventListener("transitionend", onTransitionEnd);
  scheduleAdvance();

  stage.addEventListener("mouseenter", function () {
    clearTimeout(timer);
  });
  stage.addEventListener("mouseleave", function () {
    scheduleAdvance();
  });
})();
