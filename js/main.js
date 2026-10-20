document.addEventListener('DOMContentLoaded', () => {

  // ─── 1. COMPONENTE DE MENU ─────────────────────────────────────────────────
  function buildMenu() {
    const navElement = document.getElementById('nav');
    if (!navElement) return;
    const currentPage = document.body.dataset.page || 'index';
    const menuItems = [
      { id: 'video', label: 'video', url: 'video.html' },
      { id: 'galeria', label: 'galeria', url: 'galeria.html' },
      { id: 'poema', label: 'poema', url: 'poema.html' }
    ];

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

  // ─── 2. SERVICE WORKER ─────────────────────────────────────────────────────
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('SW registrado:', reg.scope))
      .catch(err => console.warn('SW falhou:', err));
  }

  // ─── 3. ANIMAÇÃO DO POEMA (REVISADA) ───────────────────────────────────────
  const poemScroll = document.getElementById('poemScroll');
  if (poemScroll) {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const COLOR_FAR = [130, 130, 130];   // Um pouco mais claro para ler no fundo escuro
    const COLOR_HERO = [240, 231, 226];

    function lerp(a, b, t) { return a + (b - a) * t; }
    function lerpColor(c1, c2, t) {
      return `rgb(${Math.round(lerp(c1[0], c2[0], t))},${Math.round(lerp(c1[1], c2[1], t))},${Math.round(lerp(c1[2], c2[2], t))})`;
    }

    function updatePoem() {
      // Se o usuário pediu menos movimento, não anima via JS (o CSS já resolve)
      if (prefersReducedMotion) return;

      const portrait = window.matchMedia('(orientation: portrait)').matches;
      // Salto menor: 16px a 22px no celular (foco sutil)
      const FONT_MIN = portrait ? 16 : 18; 
      const FONT_MAX = portrait ? 22 : 24;
      
      const strophes = document.querySelectorAll('.strophe');
      const viewCY = poemScroll.scrollTop + poemScroll.clientHeight / 2;
      const maxDist = poemScroll.clientHeight * 0.55;

      strophes.forEach(el => {
        const elCY = el.offsetTop + el.offsetHeight / 2;
        const t = Math.max(0, 1 - Math.abs(viewCY - elCY) / maxDist);

        el.style.fontSize = lerp(FONT_MIN, FONT_MAX, t) + 'px';
        // Transição de cor mais suave
        el.style.color = lerpColor(COLOR_FAR, COLOR_HERO, t);
      });
    }

    if (!prefersReducedMotion) {
      poemScroll.addEventListener('scroll', updatePoem, { passive: true });
      window.addEventListener('resize', updatePoem, { passive: true });
      updatePoem();
    }
  }

  // ─── 4. VÍDEO E SWIPE (Mantidos) ───────────────────────────────────────────
  // ... (Cole aqui o restante do código de sizeVideo, navigatePage e swipe da resposta anterior) ...
  // ... (Vou omitir para não poluir, mas eles continuam iguais) ...

  // ─── 5. BOTÃO DE COMPARTILHAR ──────────────────────────────────────────────
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
    // ... (Mantenha a lógica de clique original do share) ...
  }
});

document.addEventListener('contextmenu', (e) => {
  if (e.target.closest && e.target.closest('.gallery-img')) e.preventDefault();
});