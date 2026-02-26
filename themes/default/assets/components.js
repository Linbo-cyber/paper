// Paper Blog — Components (Music Player, Cards, Buttons, Image Loader)
(function () {
  'use strict';

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
    // Loop
    if (showLoop) {
      html += '<button class="pp-btn pp-loop' + (loop ? ' active' : '') + '" title="Loop">' +
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/></svg>' +
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
      loopBtn.addEventListener('click', function () {
        audio.loop = !audio.loop;
        loopBtn.classList.toggle('active', audio.loop);
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

})();
