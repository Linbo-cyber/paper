// Paper Blog — Language switcher (optional)
(function () {
  var el = document.getElementById('langSwitch');
  if (!el) return;

  var langs;
  try {
    langs = JSON.parse(document.documentElement.getAttribute('data-langs') || '[]');
  } catch (e) { return; }

  if (langs.length < 2) return;

  var saved = localStorage.getItem('paper_lang') || document.documentElement.lang || langs[0];

  langs.forEach(function (l) {
    var btn = document.createElement('button');
    btn.textContent = l;
    btn.setAttribute('data-lang', l);
    if (l === saved) btn.className = 'active';
    btn.addEventListener('click', function () {
      localStorage.setItem('paper_lang', l);
      document.documentElement.lang = l;
      el.querySelectorAll('button').forEach(function (b) {
        b.className = b.getAttribute('data-lang') === l ? 'active' : '';
      });
    });
    el.appendChild(btn);
  });
})();
