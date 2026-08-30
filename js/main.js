/* GStickOS — site behaviour (vanilla JS, no deps) */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var reduceMotion = reduce.matches;

  /* ---------- sticky-header scroll offset for anchors ---------- */
  document.documentElement.style.setProperty('--header-h', '64px');

  /* ---------- active nav link ---------- */
  var base = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav a[data-nav]').forEach(function (a) {
    if (a.getAttribute('data-nav') === base) a.setAttribute('aria-current', 'true');
  });

  /* ---------- reveal on scroll ---------- */
  var rvs = document.querySelectorAll('.rv');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    rvs.forEach(function (el) { el.classList.add('on'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('on'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    rvs.forEach(function (el) { io.observe(el); });
  }

  /* ---------- FAQ accordion + TOC (one source of truth: opened item == active TOC) ---------- */
  var items = document.querySelectorAll('.faq-item');
  var toc = document.querySelector('.toc-list');
  var tocLinks = toc ? Array.prototype.slice.call(toc.querySelectorAll('a[data-target]')) : [];

  function setOpen(item, open) {
    var btn = item.querySelector('.faq-q');
    var panel = item.querySelector('.faq-body');
    item.classList[open ? 'add' : 'remove']('open');
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    panel.setAttribute('aria-hidden', open ? 'false' : 'true');
  }
  function syncToc(id) {
    tocLinks.forEach(function (a) { a.classList.toggle('is-active', a.getAttribute('data-target') === id); });
  }
  function openOnly(id) {
    items.forEach(function (it) { setOpen(it, it.id === id); });
    syncToc(id);
  }

  // Accordion buttons: one item open at a time; TOC highlight follows
  items.forEach(function (item) {
    var btn = item.querySelector('.faq-q');
    btn.addEventListener('click', function () {
      var willOpen = !item.classList.contains('open');
      if (willOpen) items.forEach(function (o) { if (o !== item) setOpen(o, false); });
      setOpen(item, willOpen);
      syncToc(willOpen ? item.id : null);
    });
  });

  if (toc) {
    // TOC click: open exactly that accordion, scroll it into view, no hash jump
    tocLinks.forEach(function (a) {
      a.addEventListener('click', function (ev) {
        ev.preventDefault();
        var id = a.getAttribute('data-target');
        openOnly(id);
        var el = document.getElementById(id);
        if (el) el.scrollIntoView({ block: 'start', behavior: reduceMotion ? 'auto' : 'smooth' });
      });
    });

    // Deep link from URL hash (initial load + in-page hash changes); default to the first item
    function fromHash() {
      var id = location.hash.slice(1);
      if (id && document.getElementById(id)) openOnly(id);
    }
    addEventListener('hashchange', fromHash);
    fromHash();
    if (!location.hash && items.length) openOnly(items[0].id);

    // Scroll spy: while scrolling through the open item, keep its TOC entry highlighted
    if ('IntersectionObserver' in window) {
      var spy = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting || !e.target.classList.contains('open')) return;
          var top = Math.abs(e.boundingClientRect.top);
          if (top < 220) syncToc(e.target.id);
        });
      }, { rootMargin: '0px', threshold: 0 });
      items.forEach(function (it) { spy.observe(it); });
    }
  }

  /* ---------- boot-sequence animation (index hero card) ---------- */
  var boot = document.querySelector('[data-boot-seq]');
  if (boot) {
    var lines = Array.prototype.slice.call(boot.querySelectorAll('.boot-line'));
    if (reduceMotion) {
      // reduced motion: leave the final text already in the markup
      return;
    }
    // JS available: clear the static (no-JS) content, then re-type in order
    lines.forEach(function (ln) { ln.innerHTML = ''; });
    var i = 0;
    function next() {
      if (i >= lines.length) return;
      var ln = lines[i];
      ln.innerHTML = ln.getAttribute('data-final') || ln.textContent;
      ln.setAttribute('data-boot', '1');
      i++;
      if (i < lines.length) setTimeout(next, 620);
    }
    next();
  }

  /* ---------- footer year ---------- */
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });
})();
