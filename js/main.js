(function markActive() {
  const page = document.body.dataset.page;
  const items = [...document.querySelectorAll('.nav-item')];

  items.forEach(item => {
    const isActive = item.dataset.page === page;
    item.classList.toggle('active', isActive);
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
  const FONT_MIN = 7;
  const FONT_MAX = 15;
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

    const ratio = poemScroll.scrollTop / (poemScroll.scrollHeight - poemScroll.clientHeight);
    setNavThumb(isNaN(ratio) ? 0 : ratio);
  }

  const SCROLL_KEY = 'fwr_poem_scroll';
  const saved = localStorage.getItem(SCROLL_KEY);
  if (saved) poemScroll.scrollTop = parseInt(saved, 10);

  let saveTimer;
  poemScroll.addEventListener('scroll', () => {
    updatePoem();
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      localStorage.setItem(SCROLL_KEY, poemScroll.scrollTop);
    }, 500);
  }, { passive: true });

  updatePoem();
  window.addEventListener('resize', updatePoem, { passive: true });
}

const galleryCarousel = document.getElementById('galleryCarousel');
if (galleryCarousel) {
  const slides = [...galleryCarousel.querySelectorAll('.gallery-slide')];
  const GALLERY_KEY = 'fwr_gallery_slide';
  const savedIndex = parseInt(localStorage.getItem(GALLERY_KEY) || '0', 10);

  if (slides[savedIndex]) {
    galleryCarousel.scrollLeft = slides[savedIndex].offsetLeft;
  }

  let galleryTimer;
  const updateGallery = () => {
    const index = Math.round(galleryCarousel.scrollLeft / galleryCarousel.clientWidth);
    const ratio = slides.length > 1 ? index / (slides.length - 1) : 0;
    setNavThumb(ratio);
    clearTimeout(galleryTimer);
    galleryTimer = setTimeout(() => {
      localStorage.setItem(GALLERY_KEY, index);
    }, 400);
  };

  galleryCarousel.addEventListener('scroll', updateGallery, { passive: true });
  updateGallery();
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
  const poemRatio = poemScroll ?
    (poemScroll.scrollTop / (poemScroll.scrollHeight - poemScroll.clientHeight || 1)) : null;

  if (poemScroll) {
    setNavThumb(isNaN(poemRatio) ? 0 : poemRatio);
    return;
  }

  const active = document.querySelector('.nav-item.active');
  if (active) {
    const items = [...document.querySelectorAll('.nav-item')];
    const index = items.findIndex(item => item === active);
    const ratio = items.length > 1 ? index / (items.length - 1) : 0;
    setNavThumb(ratio);
  }
}, { passive: true });