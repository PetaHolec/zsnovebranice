/* Statická ukázka správy (GitHub Pages): formuláře nic neodesílají, náhled se kreslí v prohlížeči. */
(function () {
  'use strict';
  var HOME = document.documentElement.getAttribute('data-home') || '/';

  function notice(form, text) {
    var old = form.parentNode.querySelector('.static-note');
    if (old) old.remove();
    var p = document.createElement('p');
    p.className = 'flash flash-ok static-note';
    p.setAttribute('role', 'status');
    p.tabIndex = -1;
    p.textContent = text;
    form.parentNode.insertBefore(p, form);
    p.focus();
  }

  document.addEventListener('submit', function (ev) {
    var form = ev.target;
    var action = form.getAttribute('data-a') || '';
    ev.preventDefault();
    if (action === 'demo-end') { window.location.href = HOME; return; }
    if (action === 'demo-reset') { notice(form, 'Ukázka je v původním stavu.'); return; }
    if (/delete/.test(action)) {
      notice(form, 'Tohle je jen ukázka: ve skutečné správě by se položka smazala a zmizela z webu.');
      return;
    }
    notice(form, 'Tohle je jen ukázka: ve skutečné správě by se změna po kliknutí uložila a hned by se ukázala na webu.');
  }, true);

  /* Jednoduchý náhled formátování (bez serveru) */
  function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function inline(s) {
    return esc(s)
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, function (m, t, u) {
        return /^(https?:\/\/|\/|mailto:|tel:)/.test(u) ? '<a href="' + u + '">' + t + '</a>' : t;
      });
  }
  function md(text) {
    var out = [], list = null, para = [];
    function flushPara() { if (para.length) { out.push('<p>' + para.join('<br>') + '</p>'); para = []; } }
    function flushList() { if (list) { out.push('</' + list + '>'); list = null; } }
    text.replace(/\r/g, '').split('\n').forEach(function (line) {
      var m;
      if (/^\s*$/.test(line) || /^:::/.test(line) || /^@@ /.test(line)) { flushPara(); flushList(); return; }
      if ((m = line.match(/^(#{2,3})\s+(.*)/))) { flushPara(); flushList(); out.push('<h' + m[1].length + '>' + inline(m[2]) + '</h' + m[1].length + '>'); return; }
      if ((m = line.match(/^>\s?(.*)/))) { flushPara(); flushList(); out.push('<div class="note"><p>' + inline(m[1]) + '</p></div>'); return; }
      if ((m = line.match(/^[-*]\s+(.*)/)) || (m = line.match(/^\d+[.)]\s+(.*)/))) {
        flushPara();
        var t = /^\d/.test(line) ? 'ol' : 'ul';
        if (list !== t) { flushList(); out.push('<' + t + '>'); list = t; }
        out.push('<li>' + inline(m[1]) + '</li>');
        return;
      }
      flushList();
      para.push(inline(line));
    });
    flushPara(); flushList();
    return out.join('');
  }

  window.addEventListener('click', function (ev) {
    var b = ev.target.closest && ev.target.closest('[data-preview]');
    if (!b) return;
    ev.stopPropagation();
    ev.preventDefault();
    var id = b.getAttribute('data-preview');
    var ta = document.getElementById(id);
    var box = document.getElementById(id + '-preview');
    if (!ta || !box) return;
    box.innerHTML = '<p class="hint"><strong>Náhled:</strong> takto bude text vypadat na webu.</p>' + md(ta.value);
    box.hidden = false;
  }, true);
})();
