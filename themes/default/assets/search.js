// Paper Blog — Client-side search
(function () {
  var index = null;
  var overlay = document.getElementById('searchOverlay');
  var input = document.getElementById('searchInput');
  var results = document.getElementById('searchResults');

  // Detect basePath from script src
  var scripts = document.getElementsByTagName('script');
  var basePath = '';
  for (var i = 0; i < scripts.length; i++) {
    var m = scripts[i].src.match(/(.*)\/assets\/search\.js/);
    if (m) { basePath = m[1].replace(location.origin, ''); break; }
  }

  window.toggleSearch = function () {
    if (!overlay) return;
    var visible = overlay.style.display !== 'none';
    overlay.style.display = visible ? 'none' : 'flex';
    if (!visible) {
      input.value = '';
      results.innerHTML = '';
      input.focus();
      if (!index) loadIndex();
    }
  };

  // Close on Escape
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && overlay && overlay.style.display !== 'none') {
      toggleSearch();
    }
    // Ctrl/Cmd + K to open
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      toggleSearch();
    }
  });

  // Close on backdrop click
  if (overlay) {
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) toggleSearch();
    });
  }

  function loadIndex() {
    fetch(basePath + '/search-index.json')
      .then(function (r) { return r.json(); })
      .then(function (data) { index = data; })
      .catch(function () { index = []; });
  }

  if (input) {
    input.addEventListener('input', function () {
      if (!index) return;
      var q = input.value.trim().toLowerCase();
      if (!q) { results.innerHTML = ''; return; }

      var matches = index.filter(function (item) {
        return item.t.toLowerCase().indexOf(q) !== -1 ||
               item.s.toLowerCase().indexOf(q) !== -1 ||
               (item.tags && item.tags.some(function (t) { return t.toLowerCase().indexOf(q) !== -1; }));
      });

      if (matches.length === 0) {
        results.innerHTML = '<div class="sr-empty">No results</div>';
        return;
      }

      results.innerHTML = matches.slice(0, 20).map(function (m) {
        return '<a href="' + m.u + '"><strong>' + esc(m.t) + '</strong><br><span class="sr-date">' + m.d + '</span></a>';
      }).join('');
    });
  }

  function esc(s) {
    var d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }
})();
