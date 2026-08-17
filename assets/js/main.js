const menuToggle = document.querySelector('.menu-toggle');
const menu = document.querySelector('[data-menu]');
const currentYear = document.getElementById('currentYear');
const checkoutLinks = document.querySelectorAll('[data-checkout]');

const pageParams = new URLSearchParams(window.location.search);
const isCoursePostPurchase = pageParams.get('origem') === 'pos-compra-curso';

document.querySelectorAll('[data-post-purchase-only]').forEach((element) => {
  element.hidden = !isCoursePostPurchase;
});

document.querySelectorAll('[data-standard-only]').forEach((element) => {
  element.hidden = isCoursePostPurchase;
});

if (currentYear) currentYear.textContent = new Date().getFullYear();

menuToggle?.addEventListener('click', () => {
  const isOpen = menu.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(isOpen));
  document.body.classList.toggle('menu-open', isOpen);
});

menu?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    menu.classList.remove('open');
    menuToggle?.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
  });
});

checkoutLinks.forEach((link) => {
  const key = link.dataset.checkout;
  const url = window.EA_STORE?.[key]?.trim();
  const readyLabel = link.dataset.readyLabel || 'Comprar';
  const pendingLabel = link.dataset.pendingLabel || 'Em breve';

  if (url) {
    link.href = url;
    link.textContent = readyLabel;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.setAttribute('aria-disabled', 'false');
  } else {
    link.href = '#';
    link.textContent = pendingLabel;
    link.setAttribute('aria-disabled', 'true');
    link.addEventListener('click', (event) => event.preventDefault());
  }
});

const revealElements = document.querySelectorAll('.reveal');

if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const observer = new IntersectionObserver(
    (entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('visible');
        currentObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.12 }
  );

  revealElements.forEach((element) => observer.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add('visible'));
}


// =========================================================
// EA Player — player HTML5 personalizado da Escola de Administradores
// =========================================================
const eaPlayers = document.querySelectorAll('[data-ea-player]');

eaPlayers.forEach((player) => {
  const video = player.querySelector('video');
  const controls = player.querySelector('[data-player-controls]');
  const progress = player.querySelector('[data-player-progress]');
  const volume = player.querySelector('[data-player-volume]');
  const timeLabel = player.querySelector('[data-player-time]');
  const speedMenu = player.querySelector('[data-player-speed-menu]');
  const speedLabel = player.querySelector('[data-player-speed-label]');
  const speedToggle = player.querySelector('[data-player-action="speed"]');
  const endCard = player.querySelector('[data-player-end-card]');
  const toast = player.querySelector('[data-player-toast]');
  const toggleButtons = player.querySelectorAll('[data-player-action="toggle"]');
  const muteButton = player.querySelector('[data-player-action="mute"]');
  const fullscreenButton = player.querySelector('[data-player-action="fullscreen"]');
  const pipButton = player.querySelector('[data-player-action="pip"]');

  if (!video || !controls || !progress) return;

  let hideControlsTimer;
  let toastTimer;
  let isScrubbing = false;

  const formatTime = (seconds) => {
    if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${minutes}:${secs}`;
  };

  const showToast = (message) => {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 720);
  };

  const updateTime = () => {
    if (!timeLabel) return;
    timeLabel.textContent = `${formatTime(video.currentTime)} / ${formatTime(video.duration)}`;
  };

  const updateProgress = () => {
    if (isScrubbing || !Number.isFinite(video.duration) || video.duration <= 0) return;
    const value = Math.round((video.currentTime / video.duration) * 1000);
    progress.value = value;
    const percentage = `${value / 10}%`;
    player.style.setProperty('--ea-player-progress', percentage);
    progress.setAttribute('aria-valuetext', `${formatTime(video.currentTime)} de ${formatTime(video.duration)}`);
    updateTime();
  };

  const updateVolume = () => {
    const effectiveVolume = video.muted ? 0 : video.volume;
    player.classList.toggle('muted', video.muted || video.volume === 0);
    if (volume) {
      volume.value = effectiveVolume;
      player.style.setProperty('--ea-player-volume', `${effectiveVolume * 100}%`);
    }
    if (muteButton) muteButton.setAttribute('aria-label', effectiveVolume === 0 ? 'Ativar som' : 'Silenciar vídeo');
  };

  const syncPlaybackState = () => {
    const playing = !video.paused && !video.ended;
    player.classList.toggle('playing', playing);
    player.classList.toggle('paused', !playing && player.classList.contains('started'));
    toggleButtons.forEach((button) => button.setAttribute('aria-label', playing ? 'Pausar vídeo' : 'Reproduzir vídeo'));
  };

  const revealControls = (keepVisible = false) => {
    player.classList.add('controls-visible');
    player.classList.remove('hide-controls');
    clearTimeout(hideControlsTimer);
    if (!keepVisible && !video.paused && !video.ended) {
      hideControlsTimer = setTimeout(() => {
        player.classList.remove('controls-visible');
        player.classList.add('hide-controls');
        if (speedMenu) speedMenu.hidden = true;
        speedToggle?.setAttribute('aria-expanded', 'false');
      }, 2400);
    }
  };

  const togglePlayback = () => {
    endCard.hidden = true;
    if (!player.classList.contains('started')) player.classList.add('started');
    if (video.paused || video.ended) {
      if (video.ended) video.currentTime = 0;
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  };

  const seekBy = (seconds) => {
    if (!Number.isFinite(video.duration)) return;
    video.currentTime = Math.min(video.duration, Math.max(0, video.currentTime + seconds));
    showToast(`${seconds > 0 ? '+' : '−'}${Math.abs(seconds)} s`);
    revealControls();
  };

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement === player) {
        await document.exitFullscreen();
      } else if (player.requestFullscreen) {
        await player.requestFullscreen();
      } else if (video.webkitEnterFullscreen) {
        video.webkitEnterFullscreen();
      }
    } catch (_) {}
  };

  const togglePiP = async () => {
    if (!document.pictureInPictureEnabled || !video.requestPictureInPicture) return;
    try {
      if (document.pictureInPictureElement === video) {
        await document.exitPictureInPicture();
      } else {
        await video.requestPictureInPicture();
      }
    } catch (_) {}
  };

  player.querySelectorAll('[data-player-action]').forEach((button) => {
    button.addEventListener('click', (event) => {
      event.stopPropagation();
      const action = button.dataset.playerAction;
      if (action === 'toggle') togglePlayback();
      if (action === 'back') seekBy(-10);
      if (action === 'forward') seekBy(10);
      if (action === 'mute') {
        video.muted = !video.muted;
        if (!video.muted && video.volume === 0) video.volume = 0.7;
        updateVolume();
        showToast(video.muted ? 'Sem som' : 'Som ativado');
      }
      if (action === 'fullscreen') toggleFullscreen();
      if (action === 'pip') togglePiP();
      if (action === 'speed' && speedMenu) {
        speedMenu.hidden = !speedMenu.hidden;
        speedToggle?.setAttribute('aria-expanded', String(!speedMenu.hidden));
        revealControls(true);
      }
      if (action === 'replay') {
        endCard.hidden = true;
        video.currentTime = 0;
        video.play().catch(() => {});
      }
    });
  });

  speedMenu?.querySelectorAll('[data-speed]').forEach((button) => {
    button.addEventListener('click', (event) => {
      event.stopPropagation();
      const speed = Number(button.dataset.speed);
      if (!Number.isFinite(speed)) return;
      video.playbackRate = speed;
      speedLabel.textContent = speed === 1 ? '1x' : `${String(speed).replace('.', ',')}x`;
      speedMenu.querySelectorAll('[data-speed]').forEach((item) => item.classList.toggle('active', item === button));
      speedMenu.hidden = true;
      speedToggle?.setAttribute('aria-expanded', 'false');
      showToast(speedLabel.textContent);
      revealControls();
    });
  });

  progress.addEventListener('pointerdown', () => { isScrubbing = true; revealControls(true); });
  progress.addEventListener('input', () => {
    const percentage = Number(progress.value) / 10;
    player.style.setProperty('--ea-player-progress', `${percentage}%`);
    if (Number.isFinite(video.duration)) {
      const previewTime = (Number(progress.value) / 1000) * video.duration;
      progress.setAttribute('aria-valuetext', `${formatTime(previewTime)} de ${formatTime(video.duration)}`);
      if (timeLabel) timeLabel.textContent = `${formatTime(previewTime)} / ${formatTime(video.duration)}`;
    }
  });
  progress.addEventListener('change', () => {
    if (Number.isFinite(video.duration)) video.currentTime = (Number(progress.value) / 1000) * video.duration;
    isScrubbing = false;
    revealControls();
  });
  progress.addEventListener('pointerup', () => { isScrubbing = false; revealControls(); });

  volume?.addEventListener('input', () => {
    video.volume = Number(volume.value);
    video.muted = video.volume === 0;
    updateVolume();
  });

  video.addEventListener('click', () => {
    if (!player.classList.contains('started')) return togglePlayback();
    togglePlayback();
  });
  video.addEventListener('dblclick', (event) => {
    event.preventDefault();
    toggleFullscreen();
  });
  video.addEventListener('play', () => {
    player.classList.add('started');
    endCard.hidden = true;
    syncPlaybackState();
    revealControls();
  });
  video.addEventListener('pause', () => { syncPlaybackState(); revealControls(true); });
  video.addEventListener('timeupdate', updateProgress);
  video.addEventListener('durationchange', () => { updateTime(); updateProgress(); });
  video.addEventListener('volumechange', updateVolume);
  video.addEventListener('waiting', () => player.classList.add('waiting'));
  video.addEventListener('playing', () => { player.classList.remove('waiting'); syncPlaybackState(); });
  video.addEventListener('canplay', () => player.classList.remove('waiting'));
  video.addEventListener('ended', () => {
    syncPlaybackState();
    player.classList.remove('hide-controls');
    player.classList.add('controls-visible');
    endCard.hidden = false;
  });
  video.addEventListener('error', () => {
    player.classList.remove('waiting');
    showToast('Não foi possível carregar o vídeo');
  });

  player.addEventListener('mousemove', () => revealControls());
  player.addEventListener('mouseenter', () => revealControls());
  player.addEventListener('mouseleave', () => {
    if (!video.paused) {
      player.classList.remove('controls-visible');
      player.classList.add('hide-controls');
    }
  });
  player.addEventListener('touchstart', () => revealControls(), { passive: true });

  document.addEventListener('fullscreenchange', () => {
    player.classList.toggle('is-fullscreen', document.fullscreenElement === player);
    fullscreenButton?.setAttribute('aria-label', document.fullscreenElement === player ? 'Sair da tela cheia' : 'Tela cheia');
    revealControls();
  });

  document.addEventListener('click', (event) => {
    if (speedMenu && !speedMenu.hidden && !player.contains(event.target)) {
      speedMenu.hidden = true;
      speedToggle?.setAttribute('aria-expanded', 'false');
    }
  });

  player.setAttribute('tabindex', '0');
  player.addEventListener('keydown', (event) => {
    const targetTag = event.target?.tagName;
    if (targetTag === 'INPUT' || targetTag === 'BUTTON' || targetTag === 'A') return;
    const key = event.key.toLowerCase();
    if (key === ' ' || key === 'k') { event.preventDefault(); togglePlayback(); }
    if (key === 'arrowleft') { event.preventDefault(); seekBy(-5); }
    if (key === 'arrowright') { event.preventDefault(); seekBy(5); }
    if (key === 'm') { event.preventDefault(); video.muted = !video.muted; updateVolume(); showToast(video.muted ? 'Sem som' : 'Som ativado'); }
    if (key === 'f') { event.preventDefault(); toggleFullscreen(); }
  });

  if (!document.pictureInPictureEnabled || !video.requestPictureInPicture) pipButton?.setAttribute('hidden', '');

  updateVolume();
  updateTime();
  syncPlaybackState();
});
