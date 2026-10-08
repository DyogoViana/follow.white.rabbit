(function markActive() {
  const page = document.body.dataset.page;
  const items = [...document.querySelectorAll('.nav-item')];

  items.forEach(item => {
    const isActive = item.dataset.page === page;
    item.classList.toggle('active', isActive);
    const link = item.querySelector('a');
    if (link) {
      if (isActive) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    }
  });

})();

const poemScroll = document.getElementById('poemScroll');

if (poemScroll) {
  const COLOR_FAR = [189, 189, 189];
  const COLOR_MID = [130, 130, 130];
  const COLOR_HERO = [240, 231, 226];

  function lerp(a, b, t) { return a + (b - a) * t; }

  function lerpColor(c1, c2, t) {
    return `rgb(${Math.round(lerp(c1[0], c2[0], t))},`
      + `${Math.round(lerp(c1[1], c2[1], t))},`
      + `${Math.round(lerp(c1[2], c2[2], t))})`;
  }

  function updatePoem() {
    const portrait = window.matchMedia('(orientation: portrait)').matches;
    const FONT_MIN = portrait ? 8 : 6;
    const FONT_MAX = portrait ? 28 : 26;
    const strophes = document.querySelectorAll('.strophe');
    const viewCY = poemScroll.scrollTop + poemScroll.clientHeight / 2;
    const maxDist = poemScroll.clientHeight * 0.55;

    strophes.forEach(el => {
      const elCY = el.offsetTop + el.offsetHeight / 2;
      const dist = Math.abs(viewCY - elCY);
      const t = Math.max(0, 1 - dist / maxDist);

      el.style.fontSize = lerp(FONT_MIN, FONT_MAX, t) + 'px';

      let color;
      if (t < 0.5) {
        color = lerpColor(COLOR_FAR, COLOR_MID, t * 2);
      } else {
        color = lerpColor(COLOR_MID, COLOR_HERO, (t - 0.5) * 2);
      }
      el.style.color = color;
    });

  }

  poemScroll.scrollTop = 0;
  let saveTimer;
  poemScroll.addEventListener('scroll', () => {
    updatePoem();
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      localStorage.setItem('fwr_poem_scroll', poemScroll.scrollTop);
    }, 500);
  }, { passive: true });

  updatePoem();
  window.addEventListener('resize', updatePoem, { passive: true });
  window.addEventListener('orientationchange', updatePoem, { passive: true });
}

const galleryCarousel = document.getElementById('galleryCarousel');
if (galleryCarousel) {
  galleryCarousel.scrollLeft = 0;
}

const videoWrapper = document.querySelector('.video-wrapper');
const videoFrame = document.querySelector('.video-wrapper iframe');

function sizeVideo() {
  if (!videoWrapper || !videoFrame) return;

  const aspect = 16 / 9;
  const w = videoWrapper.clientWidth;
  const h = videoWrapper.clientHeight;
  const containerAspect = w / h;
  const isLandscape = w > h;

  let width;
  let height;

  if (isLandscape) {
    if (containerAspect > aspect) {
      width = w;
      height = w / aspect;
    } else {
      height = h;
      width = h * aspect;
    }
  } else if (containerAspect > aspect) {
    height = h;
    width = h * aspect;
  } else {
    width = w;
    height = w / aspect;
  }

  videoFrame.style.width = `${Math.round(width)}px`;
  videoFrame.style.height = `${Math.round(height)}px`;
}

if (videoFrame) {
  videoFrame.addEventListener('load', sizeVideo);
}

if (videoWrapper) {
  window.addEventListener('resize', sizeVideo, { passive: true });
  window.addEventListener('orientationchange', sizeVideo, { passive: true });
  window.addEventListener('load', sizeVideo, { passive: true });
  sizeVideo();
}

function navigatePage(direction) {
  const order = ['home', 'video', 'galeria', 'poema'];
  const page = document.body.dataset.page;
  const index = order.indexOf(page);
  const nextIndex = direction === 'next' ? Math.min(index + 1, order.length - 1) : Math.max(index - 1, 0);
  if (nextIndex === index) return;

  const map = {
    home: 'index.html',
    video: 'video.html',
    galeria: 'galeria.html',
    poema: 'poema.html'
  };

  window.location.href = map[order[nextIndex]];
}

const EDGE_ZONE = 32;
let touchStartX = 0;
let touchStartY = 0;
let touchActive = false;

function handleTouchStart(event) {
  if (!event.touches || !event.touches[0]) return;
  const touch = event.touches[0];
  touchStartX = touch.clientX;
  touchStartY = touch.clientY;
  touchActive = true;
}

function handleTouchEnd(event) {
  if (!touchActive || !event.changedTouches || !event.changedTouches[0]) return;

  const touch = event.changedTouches[0];
  const deltaX = touch.clientX - touchStartX;
  const deltaY = touch.clientY - touchStartY;
  const absX = Math.abs(deltaX);
  const absY = Math.abs(deltaY);
  const edgeLeft = touchStartX <= EDGE_ZONE;
  const edgeRight = touchStartX >= window.innerWidth - EDGE_ZONE;
  const edgeTop = touchStartY <= EDGE_ZONE;
  const edgeBottom = touchStartY >= window.innerHeight - EDGE_ZONE;

  touchActive = false;

  if (Math.max(absX, absY) < 60) return;

  if (document.body.dataset.page === 'poema') {
    if (absX > absY && edgeLeft && deltaX > 0) {
      navigatePage('prev');
    }
    return;
  }

  if (document.body.dataset.page === 'galeria') return;

  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    if (edgeLeft && deltaX > 0) {
      navigatePage('prev');
      return;
    }

    if (edgeRight && deltaX < 0) {
      navigatePage('next');
      return;
    }
  }

  if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 60) {
    if (edgeTop && deltaY > 0) {
      navigatePage('prev');
      return;
    }

    if (edgeBottom && deltaY < 0) {
      navigatePage('next');
    }
  }
}

if (window.matchMedia('(pointer: coarse)').matches) {
  document.addEventListener('touchstart', handleTouchStart, { passive: true });
  document.addEventListener('touchend', handleTouchEnd, { passive: true });
}

(function () {
  const vf = document.getElementById('vimeoPlayer');
  if (!vf) return;

  function pause() {
    try {
      vf.contentWindow.postMessage(JSON.stringify({ method: 'pause' }), 'https://player.vimeo.com');
    } catch (error) {
      console.error('Unable to pause Vimeo playback.', error);
    }
  }

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) pause();
  });
  window.addEventListener('pagehide', pause);

  const originalNavigatePage = window.navigatePage;
  if (typeof originalNavigatePage === 'function') {
    window.navigatePage = function () {
      pause();
      return originalNavigatePage.apply(this, arguments);
    };
  }
})();

const shareBtn = document.querySelector('.share-btn');
if (shareBtn) {
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          shareBtn.classList.add('is-revealed');
          observer.unobserve(shareBtn);
        }
      });
    }, { threshold: 0.4 });
    observer.observe(shareBtn);
  } else {
    shareBtn.classList.add('is-revealed');
  }

  const url = 'https://dyogoviana.github.io/follow.white.rabbit/';
  const payload = {
    title: 'follow.white.rabbit',
    text: 'Tatuagens de Dyogo Viana — @follow.white.rabbit',
    url
  };

  shareBtn.addEventListener('click', async () => {
    const label = shareBtn.querySelector('.share-label');
    const original = label ? label.textContent : '';
    const flash = (msg, ms) => {
      if (!label) return;
      label.textContent = msg;
      setTimeout(() => {
        label.textContent = original;
      }, ms || 1600);
    };
    const copyFallback = async () => {
      try {
        await navigator.clipboard.writeText(`${payload.url} — ${payload.text}`);
        flash('link copiado');
      } catch (_) {
        flash('não foi possível copiar', 2400);
      }
    };
    if (navigator.share) {
      try {
        await navigator.share(payload);
        flash('compartilhado');
      } catch (err) {
        if (err && err.name === 'AbortError') {
          // Cancelled: no feedback needed.
        } else {
          await copyFallback();
        }
      }
    } else {
      await copyFallback();
    }
  });
}

/* IMG-FRICTION v8 — fricção, não proteção: não impede print, devtools nem URL direta */
document.addEventListener('contextmenu', function (e) {
  if (e.target.closest && e.target.closest('.gallery-img')) e.preventDefault();
});

(function () {
  var car = document.getElementById('galleryCarousel');
  if (!car) return;
  var slides = [].slice.call(car.querySelectorAll('.gallery-slide'));
  var go = function (i) {
    i = Math.max(0, Math.min(slides.length - 1, i));
    car.scrollTo({ left: slides[i].offsetLeft, behavior: 'smooth' });
  };
  var idx = function () { return Math.round(car.scrollLeft / car.clientWidth); };
  var x0 = null, y0 = null;
  car.addEventListener('touchstart', function (e) {
    x0 = e.touches[0].clientX;
    y0 = e.touches[0].clientY;
  }, { passive: true });
  car.addEventListener('touchend', function (e) {
    if (x0 === null) return;
    var dx = e.changedTouches[0].clientX - x0;
    var dy = e.changedTouches[0].clientY - y0;
    x0 = y0 = null;
    if (Math.abs(dx) >= Math.abs(dy)) {
      if (dx < -50 && idx() === slides.length - 1) {
        location.href = 'poema.html';
      }
    } else if (dy < -50) {
      go(idx() + 1);
    } else if (dy > 50) {
      go(idx() - 1);
    }
  }, { passive: true });
})();

(function () {
  var thumb = document.getElementById('navThumb');
  if (!thumb) return;
  var rail = thumb.closest('.nav-rail');
  if (!rail) return;
  var W = 69, KEY = 'fwr_thumb_x';
  var target = function () {
    var a = document.querySelector('.nav-item.active');
    if (!a) return -1;
    var r = rail.getBoundingClientRect(), b = a.getBoundingClientRect();
    return (b.left - r.left) + (b.width - W) / 2;
  };
  var set = function (x, animate) {
    thumb.style.width = W + 'px';
    if (x < 0) {
      thumb.style.opacity = '0';
      return;
    }
    thumb.style.opacity = '1';
    if (!animate) thumb.style.transition = 'none';
    thumb.style.transform = 'translateX(' + Math.round(x) + 'px)';
    if (!animate) {
      void thumb.offsetWidth;
      thumb.style.transition = '';
    }
  };
  var t = target(), prev = parseFloat(sessionStorage.getItem(KEY));
  if (t < 0) {
    set(-1, false);
  } else if (!isNaN(prev) && prev >= 0 && Math.abs(prev - t) > 1) {
    set(prev, false);
    requestAnimationFrame(function () { set(t, true); });
  } else {
    set(t, false);
  }
  if (t >= 0) sessionStorage.setItem(KEY, String(t));
  window.addEventListener('resize', function () {
    var t2 = target();
    if (t2 >= 0) set(t2, false);
  }, { passive: true });
})();

(function () {
  var car = document.getElementById('galleryCarousel');
  if (!car) return;
  var slides = [].slice.call(car.querySelectorAll('.gallery-slide'));
  var rots = [].slice.call(car.querySelectorAll('.gallery-slide--rot .gallery-img'));
  var sizeRot = function () {
    var portraitOk = document.body.classList.contains('allow-portrait');
    rots.forEach(function (im) {
      if (portraitOk) {
        im.style.width = '';
        im.style.height = '';
        im.style.maxWidth = '';
        im.style.maxHeight = '';
        return;
      }
      if (!im.naturalWidth) return;
      var s = im.closest('.gallery-slide'), W = s.clientWidth, H = s.clientHeight;
      var r = im.naturalHeight / im.naturalWidth;
      var Wv = Math.max(W, H * r), Hv = Wv / r;
      im.style.maxWidth = 'none';
      im.style.maxHeight = 'none';
      im.style.width = Hv + 'px';
      im.style.height = Wv + 'px';
    });
  };
  var idx = function () { return Math.round(car.scrollLeft / car.clientWidth); };
  var upd = function () {
    var ok = idx() >= slides.length - 2;
    document.body.classList.toggle('allow-portrait', ok);
    sizeRot();
  };
  car.addEventListener('scroll', upd, { passive: true });
  window.addEventListener('resize', upd, { passive: true });
  window.addEventListener('orientationchange', upd);
  rots.forEach(function (im) {
    im.addEventListener('load', sizeRot);
    im.loading = 'eager';
  });
  upd();
})();
