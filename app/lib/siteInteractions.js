// Ported (not rewritten) from the original static site's inline <script>.
// Wrapped so it can be called from a useEffect and fully cleaned up on unmount —
// the DOM query / event-listener style is intentionally unchanged from the original.

export function initSiteInteractions() {
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var cleanups = [];

  /* ---------- preloader ---------- */
  function hidePreloader() {
    var pl = document.getElementById('preloader');
    if (!pl || pl.classList.contains('done')) return;
    pl.classList.add('done');
    setTimeout(function () { pl.style.display = 'none'; }, 950);
  }
  function onLoad() { setTimeout(hidePreloader, 1150); }
  if (document.readyState === 'complete') {
    onLoad();
  } else {
    window.addEventListener('load', onLoad);
    cleanups.push(function () { window.removeEventListener('load', onLoad); });
  }
  var safetyTimer = setTimeout(hidePreloader, 4000);
  cleanups.push(function () { clearTimeout(safetyTimer); });

  /* ---------- custom cursor ---------- */
  var isFinePointer = window.matchMedia('(pointer: fine)').matches;
  if (isFinePointer) {
    document.body.classList.add('has-fine-pointer');
    cleanups.push(function () { document.body.classList.remove('has-fine-pointer'); });

    var dot = document.getElementById('cursorDot');
    var ring = document.getElementById('cursorRing');
    if (dot && ring) {
      var mx = window.innerWidth / 2, my = window.innerHeight / 2, rx = mx, ry = my;
      var mouseMoveHandler = function (e) {
        mx = e.clientX; my = e.clientY;
        dot.style.transform = 'translate3d(' + mx + 'px,' + my + 'px,0) translate(-50%,-50%)';
      };
      window.addEventListener('mousemove', mouseMoveHandler);
      cleanups.push(function () { window.removeEventListener('mousemove', mouseMoveHandler); });

      var ringStopped = false, ringRafId;
      (function ringLoop() {
        if (ringStopped) return;
        rx += (mx - rx) * 0.16; ry += (my - ry) * 0.16;
        ring.style.transform = 'translate3d(' + rx + 'px,' + ry + 'px,0) translate(-50%,-50%)';
        ringRafId = requestAnimationFrame(ringLoop);
      })();
      cleanups.push(function () { ringStopped = true; if (ringRafId) cancelAnimationFrame(ringRafId); });

      var hoverEls = document.querySelectorAll('a, button, .pillar, .work-card');
      var enterHandler = function () { ring.classList.add('hover'); };
      var leaveHandler = function () { ring.classList.remove('hover'); };
      hoverEls.forEach(function (el) {
        el.addEventListener('mouseenter', enterHandler);
        el.addEventListener('mouseleave', leaveHandler);
      });
      cleanups.push(function () {
        hoverEls.forEach(function (el) {
          el.removeEventListener('mouseenter', enterHandler);
          el.removeEventListener('mouseleave', leaveHandler);
        });
      });
    }
  }

  /* ---------- nav scrolled state ---------- */
  var navEl = document.getElementById('nav');
  var scrollHandler = function () {
    if (navEl) navEl.classList.toggle('scrolled', window.scrollY > 30);
  };
  window.addEventListener('scroll', scrollHandler, { passive: true });
  cleanups.push(function () { window.removeEventListener('scroll', scrollHandler); });

  /* ---------- mobile nav overlay ---------- */
  var navToggle = document.getElementById('navToggle');
  var navOverlay = document.getElementById('navOverlay');
  var navClose = document.getElementById('navClose');
  function openNav() { if (navOverlay) { navOverlay.classList.add('open'); document.body.style.overflow = 'hidden'; } }
  function closeNav() { if (navOverlay) { navOverlay.classList.remove('open'); document.body.style.overflow = ''; } }
  if (navToggle) navToggle.addEventListener('click', openNav);
  if (navClose) navClose.addEventListener('click', closeNav);
  var overlayLinks = navOverlay ? navOverlay.querySelectorAll('a') : [];
  overlayLinks.forEach(function (a) { a.addEventListener('click', closeNav); });
  cleanups.push(function () {
    if (navToggle) navToggle.removeEventListener('click', openNav);
    if (navClose) navClose.removeEventListener('click', closeNav);
    overlayLinks.forEach(function (a) { a.removeEventListener('click', closeNav); });
  });

  /* ---------- scroll reveals ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in-view'); io.unobserve(en.target); }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
    cleanups.push(function () { io.disconnect(); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in-view'); });
  }

  /* ---------- counters ---------- */
  function animateCounter(el) {
    var target = parseFloat(el.getAttribute('data-target')) || 0;
    var suffix = el.getAttribute('data-suffix') || '';
    var dur = 1500, start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = target + suffix;
    }
    requestAnimationFrame(step);
  }
  var counters = document.querySelectorAll('.stat .num');
  if ('IntersectionObserver' in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { animateCounter(en.target); cio.unobserve(en.target); }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (c) { cio.observe(c); });
    cleanups.push(function () { cio.disconnect(); });
  } else {
    counters.forEach(function (c) { c.textContent = c.getAttribute('data-target') + (c.getAttribute('data-suffix') || ''); });
  }

  /* ---------- tilt on pillars & work cards ---------- */
  if (isFinePointer) {
    var tiltCards = document.querySelectorAll('.pillar, .work-card');
    var tiltPairs = [];
    tiltCards.forEach(function (card) {
      var mv = function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = 'perspective(1000px) rotateX(' + (py * -5) + 'deg) rotateY(' + (px * 7) + 'deg) translateY(-3px)';
      };
      var ml = function () { card.style.transform = ''; };
      card.addEventListener('mousemove', mv);
      card.addEventListener('mouseleave', ml);
      tiltPairs.push([card, mv, ml]);
    });
    cleanups.push(function () {
      tiltPairs.forEach(function (t) {
        t[0].removeEventListener('mousemove', t[1]);
        t[0].removeEventListener('mouseleave', t[2]);
      });
    });
  }

  /* ---------- marquees ---------- */
  function buildMarquee(trackId, items, altDots) {
    var track = document.getElementById(trackId);
    if (!track) return;
    var html = '';
    for (var rep = 0; rep < 2; rep++) {
      html += '<div class="grp">';
      for (var i = 0; i < items.length; i++) {
        var dotClass = altDots ? (i % 2 === 0 ? 'b' : 'g') : (i % 2 === 0 ? 'g' : 'b');
        html += '<span class="item">' + items[i] + '</span><span class="dot ' + dotClass + '"></span>';
      }
      html += '</div>';
    }
    track.innerHTML = html;
  }
  buildMarquee('marqueeTrack1', ['Web Development', 'App Development', 'AI Automation', 'Digital Marketing', 'Business Development', 'Brand &amp; Product Design'], false);
  buildMarquee('marqueeTrack2', ['React', 'Next.js', 'Node.js', 'Python', 'TensorFlow', 'Flutter', 'Swift', 'AWS', 'PostgreSQL', 'Figma', 'GPT-4', 'LangChain'], true);

  /* ---------- contact form -> mailto ---------- */
  var form = document.getElementById('contactForm');
  if (form) {
    var submitHandler = function (e) {
      e.preventDefault();
      var name = document.getElementById('cf-name').value;
      var email = document.getElementById('cf-email').value;
      var type = document.getElementById('cf-type').value;
      var message = document.getElementById('cf-msg').value;
      var subject = encodeURIComponent('New project inquiry from ' + name + ' (' + type + ')');
      var body = encodeURIComponent('Name: ' + name + '\nEmail: ' + email + '\nProject type: ' + type + '\n\n' + message);
      window.location.href = 'mailto:hello@cevtexa.studio?subject=' + subject + '&body=' + body;
    };
    form.addEventListener('submit', submitHandler);
    cleanups.push(function () { form.removeEventListener('submit', submitHandler); });
  }

  /* ---------- scroll parallax on hero glow ---------- */
  if (!reduceMotion) {
    var glowG1 = document.querySelector('.hero-glow .g1');
    var glowG2 = document.querySelector('.hero-glow .g2');
    var parallaxHandler = function () {
      var y = window.scrollY;
      if (glowG1) glowG1.style.transform = 'translateY(' + (y * 0.12) + 'px)';
      if (glowG2) glowG2.style.transform = 'translateY(' + (-y * 0.09) + 'px)';
    };
    window.addEventListener('scroll', parallaxHandler, { passive: true });
    cleanups.push(function () { window.removeEventListener('scroll', parallaxHandler); });
  }

  return function cleanupAll() {
    cleanups.forEach(function (fn) { try { fn(); } catch (e) { /* noop */ } });
  };
}
