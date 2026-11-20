/* Načte uložené nastavení zobrazení (velikost písma, kontrast) před vykreslením stránky. */
(function () {
  var d = document.documentElement;
  d.classList.add('js');
  try {
    var s = localStorage.getItem('zsnb-size');
    if (s === 'lg') d.setAttribute('data-size', 'lg');
  } catch (e) { /* úložiště nemusí být dostupné */ }
})();
