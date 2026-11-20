(function () {
  'use strict';
  var doc = document.documentElement;

  /* ---- Nastavení zobrazení ---- */
  function store(k, v) { try { v === null ? localStorage.removeItem(k) : localStorage.setItem(k, v); } catch (e) {} }
  var prefButtons = document.querySelectorAll('.pref');
  function syncPrefs() {
    prefButtons.forEach(function (b) {
      var kind = b.dataset.pref, val = b.dataset.value, on;
      if (kind === 'size') on = (doc.getAttribute('data-size') || 'md') === val;
      else on = doc.getAttribute('data-contrast') === val;
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  }
  prefButtons.forEach(function (b) {
    b.addEventListener('click', function () {
      var kind = b.dataset.pref, val = b.dataset.value;
      if (kind === 'size') {
        if (val === 'md') { doc.removeAttribute('data-size'); store('zsnb-size', null); }
        else { doc.setAttribute('data-size', val); store('zsnb-size', val); }
      } else {
        if (doc.getAttribute('data-contrast') === val) { doc.removeAttribute('data-contrast'); store('zsnb-contrast', null); }
        else { doc.setAttribute('data-contrast', val); store('zsnb-contrast', val); }
      }
      syncPrefs();
    });
  });
  syncPrefs();

  /* ---- Mobilní menu ---- */
  var toggle = document.querySelector('.menu-toggle');
  var nav = document.getElementById('hlavni-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', open ? 'false' : 'true');
      nav.classList.toggle('is-open', !open);
    });
  }

  /* ---- Rozbalovací podmenu (tlačítko, ne hover) ---- */
  var subs = document.querySelectorAll('.sub-toggle');
  function closeAll(except) {
    subs.forEach(function (s) { if (s !== except) s.setAttribute('aria-expanded', 'false'); });
  }
  var hoverMq = window.matchMedia('(min-width: 75.01rem) and (hover: hover)');
  subs.forEach(function (s) {
    s.addEventListener('click', function (e) {
      var open = s.getAttribute('aria-expanded') === 'true';
      closeAll(s);
      // myší na počítači podmenu při kliknutí zůstane otevřené (už se otevřelo najetím); klávesnicí se přepíná
      var mouse = hoverMq.matches && e.detail > 0;
      s.setAttribute('aria-expanded', mouse ? 'true' : (open ? 'false' : 'true'));
    });
  });
  /* Otevření podmenu najetím myší (jen na počítači; klávesnice a dotyk fungují přes tlačítko) */
  document.querySelectorAll('.has-sub').forEach(function (li) {
    var b = li.querySelector('.sub-toggle'), t = null;
    li.addEventListener('mouseenter', function () {
      if (!hoverMq.matches) return;
      clearTimeout(t); closeAll(b); b.setAttribute('aria-expanded', 'true');
    });
    li.addEventListener('mouseleave', function () {
      if (!hoverMq.matches) return;
      t = setTimeout(function () { if (!li.contains(document.activeElement)) b.setAttribute('aria-expanded', 'false'); }, 180);
    });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    var openSub = document.querySelector('.sub-toggle[aria-expanded="true"]');
    if (openSub) { openSub.setAttribute('aria-expanded', 'false'); openSub.focus(); return; }
    if (toggle && toggle.getAttribute('aria-expanded') === 'true' && getComputedStyle(toggle).display !== 'none') {
      toggle.setAttribute('aria-expanded', 'false'); nav.classList.remove('is-open'); toggle.focus();
    }
  });
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.has-sub')) closeAll(null);
  });
  // Když fokus odejde z podmenu klávesnicí, zavřeme ho
  document.querySelectorAll('.has-sub').forEach(function (li) {
    li.addEventListener('focusout', function (e) {
      if (!li.contains(e.relatedTarget)) {
        var b = li.querySelector('.sub-toggle');
        if (b) b.setAttribute('aria-expanded', 'false');
      }
    });
  });
})();

/* Jemné objevování sekcí při rolování (vypnuto při „omezit pohyb“ a bez podpory prohlížeče) */
(function () {
  'use strict';
  if (!('IntersectionObserver' in window)) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var els = document.querySelectorAll('main .section, .nl-row, .termins, .facts, .toc, .doc-group, .contact-cols > *, .signposts li, .footer-grid > *');
  if (!els.length) return;
  document.documentElement.classList.add('anim');
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
    });
  }, { rootMargin: '0px 0px -6% 0px', threshold: 0.04 });
  els.forEach(function (e) { e.classList.add('reveal'); io.observe(e); });
  // pojistka: kdyby se něco neobjevilo (rychlé skoky na kotvu, tisk), po chvíli zobrazit vše
  window.addEventListener('beforeprint', function () { els.forEach(function (e) { e.classList.add('is-in'); }); });
  window.addEventListener('hashchange', function () { els.forEach(function (e) { e.classList.add('is-in'); }); });
})();

/* Karty (tabs): bez JavaScriptu jsou vidět všechny panely pod sebou */
(function () {
  'use strict';
  var uid = 0;
  document.querySelectorAll('[data-tabs]').forEach(function (box) {
    var panels = Array.prototype.slice.call(box.querySelectorAll(':scope > .tab-panel'));
    if (panels.length < 2) return;
    uid++;
    var list = document.createElement('div');
    list.className = 'tab-list';
    list.setAttribute('role', 'tablist');
    list.setAttribute('aria-label', 'Výběr zobrazení');
    var tabs = panels.map(function (p, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'tab-btn';
      b.id = 'tab-' + uid + '-' + i;
      b.setAttribute('role', 'tab');
      b.setAttribute('aria-controls', 'tabp-' + uid + '-' + i);
      b.textContent = p.getAttribute('data-tab-title');
      p.id = 'tabp-' + uid + '-' + i;
      p.setAttribute('role', 'tabpanel');
      p.setAttribute('aria-labelledby', b.id);
      p.setAttribute('tabindex', '0');
      p.querySelector('.tab-h').classList.add('vh');
      list.appendChild(b);
      return b;
    });
    box.insertBefore(list, box.firstChild);
    box.classList.add('is-tabbed');
    function show(i, focus) {
      tabs.forEach(function (b, k) {
        var on = k === i;
        b.setAttribute('aria-selected', on ? 'true' : 'false');
        b.tabIndex = on ? 0 : -1;
        panels[k].hidden = !on;
      });
      if (focus) tabs[i].focus();
    }
    tabs.forEach(function (b, i) {
      b.addEventListener('click', function () { show(i, false); });
      b.addEventListener('keydown', function (e) {
        var k = null;
        if (e.key === 'ArrowRight') k = (i + 1) % tabs.length;
        else if (e.key === 'ArrowLeft') k = (i - 1 + tabs.length) % tabs.length;
        else if (e.key === 'Home') k = 0;
        else if (e.key === 'End') k = tabs.length - 1;
        if (k !== null) { e.preventDefault(); show(k, true); }
      });
    });
    show(0, false);
  });
})();
