(function () {
  'use strict';

  /* Tlačítka formátování – vkládají jednoduchý zápis do textového pole */
  function wrap(ta, before, after, placeholder) {
    var s = ta.selectionStart, e = ta.selectionEnd;
    var sel = ta.value.slice(s, e) || placeholder;
    ta.setRangeText(before + sel + after, s, e, 'select');
    ta.focus();
  }
  function prefixLines(ta, fn) {
    var v = ta.value, s = ta.selectionStart, e = ta.selectionEnd;
    var ls = v.lastIndexOf('\n', s - 1) + 1;
    var le = v.indexOf('\n', e); if (le === -1) le = v.length;
    var block = v.slice(ls, le) || 'Text';
    var out = block.split('\n').map(fn).join('\n');
    ta.setRangeText(out, ls, le, 'select');
    ta.focus();
  }
  document.querySelectorAll('[data-md]').forEach(function (b) {
    b.addEventListener('click', function () {
      var ta = document.getElementById(b.closest('.field').querySelector('textarea').id);
      switch (b.dataset.md) {
        case 'bold': wrap(ta, '**', '**', 'tučný text'); break;
        case 'italic': wrap(ta, '*', '*', 'text'); break;
        case 'h2': prefixLines(ta, function (l) { return '## ' + l.replace(/^#+\s*/, ''); }); break;
        case 'ul': prefixLines(ta, function (l) { return '- ' + l.replace(/^[-*]\s*/, ''); }); break;
        case 'ol': { var i = 0; prefixLines(ta, function (l) { i++; return i + '. ' + l.replace(/^\d+[.)]\s*/, ''); }); break; }
        case 'note': prefixLines(ta, function (l) { return '> ' + l.replace(/^>\s*/, ''); }); break;
        case 'link': {
          var url = window.prompt('Adresa odkazu (např. https://www.example.cz nebo /edupage):', 'https://');
          if (url) wrap(ta, '[', '](' + url + ')', 'text odkazu');
          break;
        }
      }
    });
  });

  /* Náhled */
  document.querySelectorAll('[data-preview]').forEach(function (b) {
    b.addEventListener('click', function () {
      var id = b.dataset.preview;
      var ta = document.getElementById(id);
      var box = document.getElementById(id + '-preview');
      var fd = new FormData();
      fd.append('text', ta.value);
      fd.append('_csrf', b.dataset.csrf);
      b.disabled = true;
      fetch(b.dataset.previewUrl, { method: 'POST', body: fd, credentials: 'same-origin' })
        .then(function (r) { return r.text(); })
        .then(function (html) {
          box.innerHTML = '<p class="hint"><strong>Náhled:</strong> takto bude text vypadat na webu.</p>' + html;
          box.hidden = false;
        })
        .catch(function () { box.textContent = 'Náhled se nepodařilo načíst.'; box.hidden = false; })
        .finally(function () { b.disabled = false; });
    });
  });
})();
