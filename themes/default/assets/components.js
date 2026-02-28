// Paper Blog — Components
(function () {
  'use strict';

  // ── Theme Toggle ──────────────────────────────────────
  var themeBtn = document.getElementById('themeToggle');
  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      var html = document.documentElement;
      var current = html.getAttribute('data-theme');
      var isDark;
      if (current === 'auto') {
        isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      } else {
        isDark = current === 'dark';
      }
      var next = isDark ? 'light' : 'dark';
      html.setAttribute('data-theme', next);
      localStorage.setItem('paper_theme', next);
    });
  }

  // ── Reading Progress Bar ──────────────────────────────
  var progressBar = document.getElementById('readingProgress');
  if (progressBar) {
    window.addEventListener('scroll', function () {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      if (h > 0) {
        progressBar.style.width = (window.scrollY / h * 100) + '%';
      }
    }, { passive: true });
  }

  // ── Back to Top ───────────────────────────────────────
  var backBtn = document.getElementById('backToTop');
  if (backBtn) {
    window.addEventListener('scroll', function () {
      backBtn.classList.toggle('visible', window.scrollY > 400);
    }, { passive: true });
    backBtn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ── Code Copy Buttons ─────────────────────────────────
  document.querySelectorAll('.post-content pre').forEach(function (pre) {
    var code = pre.querySelector('code');
    if (!code) return;
    var btn = document.createElement('button');
    btn.className = 'code-copy-btn';
    btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg> Copy';
    btn.addEventListener('click', function () {
      var text = code.textContent;
      navigator.clipboard.writeText(text).then(function () {
        btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg> Copied!';
        btn.classList.add('copied');
        setTimeout(function () {
          btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg> Copy';
          btn.classList.remove('copied');
        }, 2000);
      });
    });
    pre.appendChild(btn);
  });

  // ── Music Player ──────────────────────────────────────
  document.querySelectorAll('.paper-player').forEach(function (el) {
    var src = el.dataset.src;
    if (!src) return;
    var title = el.dataset.title || '';
    var artist = el.dataset.artist || '';
    var cover = el.dataset.cover || '';
    var loop = el.dataset.loop === 'true';
    var autoplay = el.dataset.autoplay === 'true';
    var showVolume = el.dataset.volume !== 'false';
    var showLoop = el.dataset.loopBtn !== 'false';

    var audio = new Audio(src);
    audio.loop = loop;
    audio.volume = 0.8;
    var playing = false;

    // Build UI
    var html = '<div class="pp-inner">';

    // Cover
    html += '<div class="pp-cover">';
    if (cover) {
      html += '<img src="' + cover + '" alt="cover" />';
    } else {
      html += '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="18" r="4"/><path d="M12 18V2l7 4"/></svg>';
    }
    html += '</div>';

    // Info + controls
    html += '<div class="pp-body">';

    // Title & artist
    if (title || artist) {
      html += '<div class="pp-info">';
      if (title) html += '<div class="pp-title">' + title + '</div>';
      if (artist) html += '<div class="pp-artist">' + artist + '</div>';
      html += '</div>';
    }

    // Progress bar
    html += '<div class="pp-progress-wrap"><div class="pp-progress"><div class="pp-progress-bar"></div></div><div class="pp-time"><span class="pp-current">0:00</span><span class="pp-duration">0:00</span></div></div>';

    // Controls
    html += '<div class="pp-controls">';
    // Play/pause
    html += '<button class="pp-btn pp-play" title="Play/Pause">' +
      '<svg class="pp-icon-play" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="6,3 20,12 6,21"/></svg>' +
      '<svg class="pp-icon-pause" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none" style="display:none"><rect x="5" y="3" width="4" height="18"/><rect x="15" y="3" width="4" height="18"/></svg>' +
      '</button>';
    // Loop — 3 states: off → loop-all → loop-one
    if (showLoop) {
      html += '<button class="pp-btn pp-loop' + (loop ? ' active' : '') + '" title="Loop">' +
        '<svg class="pp-loop-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/></svg>' +
        '<svg class="pp-loop1-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:none"><path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/><text x="12" y="15" text-anchor="middle" fill="currentColor" stroke="none" font-size="9" font-weight="bold">1</text></svg>' +
        '</button>';
    }
    // Volume
    if (showVolume) {
      html += '<div class="pp-volume">' +
        '<button class="pp-btn pp-vol-btn" title="Volume">' +
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>' +
        '</button>' +
        '<input type="range" class="pp-vol-slider" min="0" max="100" value="80" />' +
        '</div>';
    }
    html += '</div>'; // pp-controls
    html += '</div>'; // pp-body
    html += '</div>'; // pp-inner

    el.innerHTML = html;

    // Bind events
    var playBtn = el.querySelector('.pp-play');
    var iconPlay = el.querySelector('.pp-icon-play');
    var iconPause = el.querySelector('.pp-icon-pause');
    var progressWrap = el.querySelector('.pp-progress');
    var progressBar = el.querySelector('.pp-progress-bar');
    var currentTime = el.querySelector('.pp-current');
    var durationEl = el.querySelector('.pp-duration');
    var loopBtn = el.querySelector('.pp-loop');
    var volSlider = el.querySelector('.pp-vol-slider');

    function formatTime(s) {
      s = Math.floor(s || 0);
      var m = Math.floor(s / 60);
      s = s % 60;
      return m + ':' + (s < 10 ? '0' : '') + s;
    }

    function updatePlayState() {
      if (playing) {
        iconPlay.style.display = 'none';
        iconPause.style.display = '';
      } else {
        iconPlay.style.display = '';
        iconPause.style.display = 'none';
      }
    }

    playBtn.addEventListener('click', function () {
      if (playing) { audio.pause(); } else { audio.play(); }
    });

    audio.addEventListener('play', function () { playing = true; updatePlayState(); });
    audio.addEventListener('pause', function () { playing = false; updatePlayState(); });
    audio.addEventListener('ended', function () { playing = false; updatePlayState(); });

    audio.addEventListener('loadedmetadata', function () {
      durationEl.textContent = formatTime(audio.duration);
    });

    audio.addEventListener('timeupdate', function () {
      if (!audio.duration) return;
      var pct = (audio.currentTime / audio.duration) * 100;
      progressBar.style.width = pct + '%';
      currentTime.textContent = formatTime(audio.currentTime);
    });

    progressWrap.addEventListener('click', function (e) {
      if (!audio.duration) return;
      var rect = progressWrap.getBoundingClientRect();
      var pct = (e.clientX - rect.left) / rect.width;
      audio.currentTime = pct * audio.duration;
    });

    if (loopBtn) {
      // Loop states: 0=off, 1=loop-all, 2=loop-one
      var loopState = loop ? 1 : 0;
      var loopIcon = loopBtn.querySelector('.pp-loop-icon');
      var loop1Icon = loopBtn.querySelector('.pp-loop1-icon');

      function updateLoopUI() {
        if (loopState === 0) {
          // Off
          audio.loop = false;
          loopBtn.classList.remove('active');
          loopIcon.style.display = '';
          loop1Icon.style.display = 'none';
          loopBtn.title = '循环：关';
        } else if (loopState === 1) {
          // Loop all (for single track = same as loop)
          audio.loop = true;
          loopBtn.classList.add('active');
          loopIcon.style.display = '';
          loop1Icon.style.display = 'none';
          loopBtn.title = '循环：全部';
        } else {
          // Loop one
          audio.loop = true;
          loopBtn.classList.add('active');
          loopIcon.style.display = 'none';
          loop1Icon.style.display = '';
          loopBtn.title = '循环：单曲';
        }
      }
      updateLoopUI();

      loopBtn.addEventListener('click', function () {
        loopState = (loopState + 1) % 3;
        updateLoopUI();
      });
    }

    if (volSlider) {
      volSlider.addEventListener('input', function () {
        audio.volume = this.value / 100;
      });
    }

    if (autoplay) {
      audio.play().catch(function () {});
    }
  });

  // ── Counter Buttons ───────────────────────────────────
  document.querySelectorAll('.paper-counter-btn').forEach(function (el) {
    var key = el.dataset.key || 'paper_counter_' + Math.random().toString(36).slice(2);
    var label = el.dataset.label || 'Click';
    var icon = el.dataset.icon || '';
    var count = parseInt(localStorage.getItem(key) || '0', 10);
    var clicked = localStorage.getItem(key + '_clicked') === '1';

    var btnHtml = '<button class="pcb-btn' + (clicked ? ' clicked' : '') + '">';
    if (icon) btnHtml += '<span class="pcb-icon">' + icon + '</span>';
    btnHtml += '<span class="pcb-label">' + label + '</span>';
    btnHtml += '</button>';
    btnHtml += '<span class="pcb-count">' + count + '</span>';
    el.innerHTML = btnHtml;

    var btn = el.querySelector('.pcb-btn');
    var countEl = el.querySelector('.pcb-count');

    btn.addEventListener('click', function () {
      if (clicked) return;
      count++;
      clicked = true;
      localStorage.setItem(key, count);
      localStorage.setItem(key + '_clicked', '1');
      countEl.textContent = count;
      btn.classList.add('clicked');
    });
  });

  // ── Image Lazy Loading with Skeleton ──────────────────
  document.querySelectorAll('.post-content img, .paper-card img').forEach(function (img) {
    // Skip if already processed or is cover in player
    if (img.closest('.pp-cover') || img.dataset.processed) return;
    img.dataset.processed = '1';

    var wrapper = document.createElement('div');
    wrapper.className = 'paper-img-wrap';

    // Skeleton
    var skeleton = document.createElement('div');
    skeleton.className = 'paper-img-skeleton';
    skeleton.innerHTML = '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>';

    img.parentNode.insertBefore(wrapper, img);
    wrapper.appendChild(skeleton);
    wrapper.appendChild(img);

    img.style.opacity = '0';
    img.style.transition = 'opacity .3s';

    if (img.complete && img.naturalWidth > 0) {
      skeleton.style.display = 'none';
      img.style.opacity = '1';
    } else {
      img.addEventListener('load', function () {
        skeleton.style.display = 'none';
        img.style.opacity = '1';
      });
      img.addEventListener('error', function () {
        skeleton.className = 'paper-img-skeleton error';
        skeleton.innerHTML = '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.3 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6.3"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21"/><path d="m2 2 20 20"/></svg>';
        img.style.display = 'none';
      });
    }
  });

  // ── Incense (上香) ──────────────────────────────────
  var COUNTER_API = 'https://api.shitgfw.top/';

  window.paperIncense = function (uid) {
    var holder = document.getElementById(uid + '_holder');
    var countEl = document.getElementById(uid + '_count');
    var btn = document.querySelector('#' + uid + ' .tomb-incense-btn');
    if (!holder) return;

    // create 3 sticks
    holder.innerHTML = '';
    for (var i = 0; i < 3; i++) {
      var stick = document.createElement('div');
      stick.className = 'tomb-stick';
      var smoke = document.createElement('div');
      smoke.className = 'tomb-smoke';
      stick.appendChild(smoke);
      holder.appendChild(stick);
    }

    btn.classList.add('burning');
    btn.textContent = '🙏 香已点燃';

    // POST +1
    fetch(COUNTER_API + '?key=incense_' + uid, { method: 'POST' })
      .then(function (r) { return r.json(); })
      .then(function (d) { countEl.textContent = '已有 ' + d.count + ' 人上香'; })
      .catch(function () {});

    // after burn complete, re-enable
    setTimeout(function () {
      holder.innerHTML = '';
      btn.classList.remove('burning');
      btn.textContent = '🕯 为此人上香';
    }, 8500);
  };

  // restore incense counts on load from API
  document.querySelectorAll('.paper-tombstone').forEach(function (el) {
    var uid = el.id;
    if (!uid) return;
    var countEl = document.getElementById(uid + '_count');
    if (!countEl) return;
    fetch(COUNTER_API + '?key=incense_' + uid)
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (d.count > 0) countEl.textContent = '已有 ' + d.count + ' 人上香';
      })
      .catch(function () {});
  });

})();
