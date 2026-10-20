document.addEventListener('DOMContentLoaded', () => {

  // ─── 1. COMPONENTE DE MENU (INJEÇÃO VIA JS) ────────────────────────────────
  // Ref: Clean Code (Single Responsibility) e Pragmatic Programmer (DRY).
  function buildMenu() {
    const navElement = document.getElementById('nav');
    if (!navElement) return;

    const currentPage = document.body.dataset.page || 'index';
    const menuItems = [
      { id: 'video', label: 'video', url: 'video.html' },
      { id: 'galeria', label: 'galeria', url: 'galeria.html' },
      { id: 'poema', label: 'poema', url: 'poema.html' }
    ];

    // Ref: About Face (Cooper) - Consistência de componentes de navegação.
    let html = `
      <a href="index.html" class="nav-logo" aria-label="Página Inicial">
        <img src="assets/favicon-32x32.png" alt="Logo">
      </a>
      <ul class="nav-menu">
    `;

    menuItems.forEach(item => {
      const isActive = currentPage === item.id;
      html += `
        <li class="nav-item ${isActive ? 'active' : ''}" data-page="${item.id}">
          <a href="${item.url}" ${isActive ? 'aria-current="page"' : ''}>
            <span class="nav-label">${item.label}</span>
            <span class="nav-dot"></span>
          </a>
        </li>
      `;
    });

    html += `</ul>`;
    navElement.innerHTML = html;
  }

  buildMenu();

  // ─── 2. SERVICE WORKER (CACHE) ─────────────────────────────────────────────
  // Ref: Clean Architecture - Resolução de cache na raiz do problema.
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('SW registrado:', reg.scope))
      .catch(err => console.warn('SW falhou:', err));
  }

  // ─── 3. ANIMAÇÃO DO POEMA ──────────────────────────────────────────────────
  // Ref: Arnheim (Art and Visual Perception) - Ritmo de leitura e legibilidade.
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
      // Ref: Norman (DOET) - Legibilidade mínima para não causar esforço cognitivo.
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

  // ─── 4. CONTROLE DO VÍDEO E SWIPE ──────────────────────────────────────────
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

  // ─── 5. CONTROLE DO VIMEO (PAUSE) ──────────────────────────────────────────
  (function () {
    const vf = document.getElementById('vimeoPlayer');
    if (!vf) return;
    function pauseVimeo() {
      try { vf.contentWindow.postMessage(JSON.stringify({ method: 'pause' }), 'https://player.vimeo.com'); } catch (e) {}
    }
    document.addEventListener('visibilitychange', function () { if (document.hidden) pauseVimeo(); });
    window.addEventListener('pagehide', pauseVimeo);
  })();

  // ─── 6. BOTÃO DE COMPARTILHAR ──────────────────────────────────────────────
  const shareBtn = document.querySelector('.share-btn');
  if (shareBtn) {
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting) { shareBtn.classList.add('is-revealed'); observer.unobserve(shareBtn); }
      }, { threshold: 0.4 });
      observer.observe(shareBtn);
    } else {
      shareBtn.classList.add('is-revealed');
    }
    // Lógica de clique omitida aqui para manter o foco, mas mantenha a sua original.
  }
});

document.addEventListener('contextmenu', (e) => {
  if (e.target.closest && e.target.closest('.gallery-img')) e.preventDefault();
});