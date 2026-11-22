/* Kyokushin Karate Coffs Harbour: small enhancements. The site works fully without this file. */
(function () {
  var root = document.documentElement;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var canObserve = 'IntersectionObserver' in window;
  if (canObserve) root.classList.add('js');

  function ready(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }

  /* ---------- Scroll reveal ---------- */
  function setupReveal() {
    if (!canObserve) return;
    var targets = document.querySelectorAll(
      '.section-head, .trio article, .day, .ladder-title, .ladder, .ladder-note, .fees-wrap, .extras, ' +
      '.visit > div, .trial-form, .about-facts, .about-text, .gallery figure, .page-cta, .card, .where'
    );
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    targets.forEach(function (el) {
      var siblings = el.parentElement ? Array.prototype.slice.call(el.parentElement.children).filter(function (c) { return c.classList.contains(el.classList[0]); }) : [];
      var i = Math.max(0, siblings.indexOf(el));
      if (!reduce) el.style.transitionDelay = Math.min(i, 5) * 80 + 'ms';
      el.classList.add('reveal');
      io.observe(el);
    });
  }

  /* ---------- Photo viewer ---------- */
  function setupViewer() {
    var imgs = Array.prototype.slice.call(document.querySelectorAll('.gallery img'));
    if (!imgs.length) return;

    var box = document.createElement('div');
    box.className = 'lb';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.setAttribute('aria-label', 'Photo viewer');
    box.innerHTML =
      '<button type="button" class="lb-close" aria-label="Close">&times;</button>' +
      '<button type="button" class="lb-prev" aria-label="Previous photo">&#8249;</button>' +
      '<img alt="">' +
      '<p class="lb-cap"></p>' +
      '<button type="button" class="lb-next" aria-label="Next photo">&#8250;</button>';
    document.body.appendChild(box);
    var big = box.querySelector('img');
    var cap = box.querySelector('.lb-cap');
    var current = 0, opener = null;

    function show(i, instant) {
      current = (i + imgs.length) % imgs.length;
      var src = imgs[current];
      var fig = src.closest('figure');
      var text = fig && fig.querySelector('figcaption') ? fig.querySelector('figcaption').textContent : '';
      function apply() {
        big.src = src.currentSrc || src.src;
        big.alt = src.alt;
        cap.textContent = text + '  (' + (current + 1) + ' of ' + imgs.length + ')';
        big.classList.remove('swap');
      }
      if (instant || reduce) apply();
      else { big.classList.add('swap'); setTimeout(apply, 150); }
    }
    function open(i, btn) {
      opener = btn;
      show(i, true);
      box.classList.add('open');
      document.body.style.overflow = 'hidden';
      box.querySelector('.lb-close').focus();
    }
    function close() {
      box.classList.remove('open');
      document.body.style.overflow = '';
      if (opener) opener.focus();
    }

    imgs.forEach(function (img, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'zoom';
      b.setAttribute('aria-label', 'View larger: ' + img.alt);
      img.parentNode.insertBefore(b, img);
      b.appendChild(img);
      b.addEventListener('click', function () { open(i, b); });
    });

    box.querySelector('.lb-close').addEventListener('click', close);
    box.querySelector('.lb-prev').addEventListener('click', function () { show(current - 1); });
    box.querySelector('.lb-next').addEventListener('click', function () { show(current + 1); });
    box.addEventListener('click', function (e) { if (e.target === box) close(); });
    document.addEventListener('keydown', function (e) {
      if (!box.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') show(current - 1);
      else if (e.key === 'ArrowRight') show(current + 1);
      else if (e.key === 'Tab') {
        var f = box.querySelectorAll('button');
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    var x0 = null;
    box.addEventListener('touchstart', function (e) { x0 = e.changedTouches[0].clientX; }, { passive: true });
    box.addEventListener('touchend', function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0; x0 = null;
      if (Math.abs(dx) > 50) show(current + (dx < 0 ? 1 : -1));
    }, { passive: true });
  }

  ready(function () { setupReveal(); setupViewer(); });
})();
