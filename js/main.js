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

  const activeIndex = items.findIndex(item => item.classList.contains('active'));
  if (activeIndex >= 0) {
    const ratio = items.length > 1 ? activeIndex / (items.length - 1) : 0;
    setNavThumb(ratio);
  }
})();

function setNavThumb(ratio) {
  const thumb = document.getElementById('navThumb');
  if (!thumb) return;

  const track = thumb.closest('.nav-rail');
  if (!track) return;

  const max = Math.max(0, track.clientWidth - thumb.clientWidth);
  const x = Math.max(0, Math.min(max, max * ratio));
  thumb.style.transform = `translateX(${x}px)`;
}

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
    const FONT_MIN = portrait ? 9 : 7;
    const FONT_MAX = portrait ? 18 : 15;
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

    const ratio = poemScroll.scrollTop / (poemScroll.scrollHeight - poemScroll.clientHeight || 1);
    setNavThumb(isNaN(ratio) ? 0 : ratio);
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
  const slides = [...galleryCarousel.querySelectorAll('.gallery-slide')];
  const GALLERY_KEY = 'fwr_gallery_slide';
  const savedIndex = parseInt(localStorage.getItem(GALLERY_KEY) || '0', 10);

  if (slides[savedIndex] && !Number.isNaN(savedIndex)) {
    galleryCarousel.scrollLeft = slides[savedIndex].offsetLeft;
  }

  let galleryTimer;
  const updateGallery = () => {
    const index = Math.min(slides.length - 1, Math.max(0, Math.round(galleryCarousel.scrollLeft / galleryCarousel.clientWidth)));
    const ratio = slides.length > 1 ? index / (slides.length - 1) : 0;
    setNavThumb(ratio);
    clearTimeout(galleryTimer);
    galleryTimer = setTimeout(() => {
      localStorage.setItem(GALLERY_KEY, index);
    }, 400);
  };

  galleryCarousel.addEventListener('scroll', updateGallery, { passive: true });
  updateGallery();
  window.addEventListener('resize', updateGallery, { passive: true });
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

  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    if (document.body.dataset.page === 'galeria') {
      const slides = [...document.querySelectorAll('.gallery-slide')];
      const index = slides.findIndex(slide => {
        const left = slide.offsetLeft;
        return Math.abs(left - galleryCarousel.scrollLeft) < 4;
      });
      const isFirst = index <= 0;
      const isLast = index >= slides.length - 1;

      if (edgeLeft && deltaX > 0 && isFirst) {
        navigatePage('prev');
        return;
      }

      if (edgeRight && deltaX < 0 && isLast) {
        navigatePage('next');
        return;
      }
    }

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

if (!poemScroll && !galleryCarousel) {
  const active = document.querySelector('.nav-item.active');
  if (active) {
    const items = [...document.querySelectorAll('.nav-item')];
    const index = items.findIndex(item => item === active);
    const ratio = items.length > 1 ? index / (items.length - 1) : 0;
    setNavThumb(ratio);
  }
}

window.addEventListener('resize', () => {
  const active = document.querySelector('.nav-item.active');
  if (active) {
    const items = [...document.querySelectorAll('.nav-item')];
    const index = items.findIndex(item => item === active);
    const ratio = items.length > 1 ? index / (items.length - 1) : 0;
    setNavThumb(ratio);
  }
}, { passive: true });
