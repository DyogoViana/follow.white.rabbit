document.addEventListener('DOMContentLoaded', () => {
  
  // ─── 1. SERVICE WORKER (CACHE) ─────────────────────────────────────────────
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/follow.white.rabbit/sw.js')
      .then(reg => console.log('SW registrado', reg))
      .catch(err => console.warn('SW falhou', err));
  }

  // ─── 2. ANIMAÇÃO DO POEMA ──────────────────────────────────────────────────
  const poemScroll = document.getElementById('poemScroll');

  if (poemScroll) {
    const COLOR_FAR = [189, 189, 189];
    const COLOR_MID = [130, 130, 130];
    const COLOR_HERO = [240, 231, 226];

    function lerp(a, b, t) { return a + (b - a) * t; }
    function lerpColor(c1, c2, t) {
      return `rgb(${Math.round(lerp(c1[0], c2[0], t))},${Math.round(lerp(c1[1], c2[1], t))},${Math.round(lerp(c1[2], c2[2], t))})`;
    }

    function updatePoem() {
      const portrait = window.matchMedia('(orientation: portrait)').matches;
      const FONT_MIN = portrait ? 14 : 16; 
      const FONT_MAX = portrait ? 26 : 28;
      
      const strophes = document.querySelectorAll('.strophe');
      const viewCY = poemScroll.scrollTop + poemScroll.clientHeight / 2;
      const maxDist = poemScroll.clientHeight * 0.55;

      strophes.forEach(el => {
        const elCY = el.offsetTop + el.offsetHeight / 2;
        const t = Math.max(0, 1 - Math.abs(viewCY - elCY) / maxDist);

        el.style.fontSize = lerp(FONT_MIN, FONT_MAX, t) + 'px';
        let color = (t < 0.5) ? lerpColor(COLOR_FAR, COLOR_MID, t * 2) : lerpColor(COLOR_MID, COLOR_HERO, (t - 0.5) * 2);
        el.style.color = color;
      });
    }

    poemScroll.addEventListener('scroll', updatePoem, { passive: true });
    window.addEventListener('resize', updatePoem, { passive: true });
    updatePoem();
  }

  // ─── 3. CONTROLE DO VÍDEO E SWIPE ──────────────────────────────────────────
  const videoWrapper = document.querySelector('.video-wrapper');
  const videoFrame = document.querySelector('.video-wrapper iframe');

  function sizeVideo() {
    if (!videoWrapper || !videoFrame) return;
    const aspect = 16 / 9;
    const w = videoWrapper.clientWidth;
    const h = videoWrapper.clientHeight;
    let width, height;

    if (w / h > aspect) {
      height = h; width = h * aspect;
    } else {
      width = w; height = w / aspect;
    }
    videoFrame.style.width = `${Math.round(width)}px`;
    videoFrame.style.height = `${Math.round(height)}px`;
  }

  if (videoFrame) videoFrame.addEventListener('load', sizeVideo);
  if (videoWrapper) {
    window.addEventListener('resize', sizeVideo, { passive: true });
    sizeVideo();
  }

  function navigatePage(direction) {
    const order = ['index', 'video', 'galeria', 'poema'];
    const page = document.body.dataset.page;
    const index = order.indexOf(page);
    const nextIndex = direction === 'next' ? Math.min(index + 1, order.length - 1) : Math.max(index - 1, 0);
    if (nextIndex === index) return;

    const map = { index: 'index.html', video: 'video.html', galeria: 'galeria.html', poema: 'poema.html' };
    window.location.href = map[order[nextIndex]];
  }

  const EDGE_ZONE = 32;
  let touchStartX = 0, touchStartY = 0;

  document.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  document.addEventListener('touchend', (e) => {
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartX;
    const deltaY = touch.clientY - touchStartY;
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    if (Math.max(absX, absY) < 60) return;
    
    if (document.body.dataset.page === 'poema' && absX > absY && touchStartX <= EDGE_ZONE && deltaX > 0) {
      navigatePage('prev'); return;
    }
    if (document.body.dataset.page === 'galeria') return;

    if (absX > absY) {
      if (touchStartX <= EDGE_ZONE && deltaX > 0) navigatePage('prev');
      if (touchStartX >= window.innerWidth - EDGE_ZONE && deltaX < 0) navigatePage('next');
    } else {
      if (touchStartY <= EDGE_ZONE && deltaY > 0) navigatePage('prev');
      if (touchStartY >= window.innerHeight - EDGE_ZONE && deltaY < 0) navigatePage('next');
    }
  }, { passive: true });

  // ─── 4. BOTÃO DE COMPARTILHAR ──────────────────────────────────────────────
  const shareBtn = document.querySelector('.share-btn');
  if (shareBtn) {
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting) {
          shareBtn.classList.add('is-revealed');
          observer.unobserve(shareBtn);
        }
      }, { threshold: 0.4 });
      observer.observe(shareBtn);
    } else {
      shareBtn.classList.add('is-revealed');
    }

    shareBtn.addEventListener('click', async () => {
      const payload = {
        title: 'follow.white.rabbit',
        text: 'Tatuagens de Dyogo Viana',
        url: window.location.href
      };
      if (navigator.share) {
        try { await navigator.share(payload); } catch (e) {}
      } else {
        try { 
          await navigator.clipboard.writeText(payload.url);
          const label = shareBtn.querySelector('.share-label');
          if(label) { const orig = label.textContent; label.textContent = 'copiado'; setTimeout(() => label.textContent = orig, 1500); }
        } catch (e) {}
      }
    });
  }
});

document.addEventListener('contextmenu', (e) => {
  if (e.target.closest && e.target.closest('.gallery-img')) e.preventDefault();
});