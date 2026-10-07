# follow.white.rabbit — HANDOFF v2
# Codex: leia este arquivo inteiro antes de escrever qualquer linha.

> Stack: HTML + CSS + JS vanilla. GitHub Pages (`main` → raiz).
> Figma: `figma.com/design/gABFadnVcKiGwSez76ORhS`
> Repo: `https://github.com/DyogoViana/follow.white.rabbit`
> Referências: Pallas Instrução-Raiz v3.0 · Laudo (R-CLIN-01–04) · AI_SECURITY_PALLAS v1.0 · Arquitetura Pallas v3.0

---

## 0. PRINCÍPIOS INVIOLÁVEIS (Pallas §3 + Laudo §8)

Estas regras sobrepõem qualquer decisão técnica abaixo:

| Código | Regra | Impacto neste projeto |
|---|---|---|
| R-CLIN-01 | Visuoespacial primeiro; texto longo depois | Touch targets grandes; poema revelado por scroll, não listado |
| R-CLIN-02 | Sem paredes de texto nem áudio auto-play | Poema: estrofes reveladas progressivamente; vídeo: play manual |
| R-CLIN-03 | Autosave, estados visíveis, recuperação de sessão | Poema: salvar posição scroll em localStorage; nav: estado ativo visível |
| R-CLIN-04 | Sem urgência fabricada; previsibilidade e autonomia | Sem animações intrusivas; transições ≤ 300ms; sem popups |

**Sapolsky:** interface boa prevê; interface confusa estressa.
Cada elemento deve comunicar seu próximo estado antes do toque.

---

## 1. Estrutura de arquivos

```
/
├── index.html
├── video.html
├── galeria.html
├── poema.html
├── assets/
│   ├── img/
│   │   ├── daruma.png          # exportar do Figma @ 2x
│   │   └── logo-coelho.svg     # node 7:252 — preferir SVG
│   └── svg/
│       ├── nav-rail.svg        # node 7:229
│       └── nav-dot.svg         # node 7:240
├── css/
│   └── style.css               # tokens → base → componentes → páginas
└── js/
    └── main.js
```

---

## 2. Tokens de design

```css
/* ─── TOKENS (Albers: cor como relação, não valor absoluto) ──────────────── */
:root {
  /* Cores */
  --c-bg-light:   #FFFFFF;
  --c-bg-dark:    #333333;
  --c-title:      #18191A;
  --c-nav-label:  #4F4F4F;
  --c-nav-rail:   #353233;
  --c-poem-hero:  #F0E7E2;   /* estrofe no centro do viewport */
  --c-poem-mid:   #828282;   /* estrofes adjacentes */
  --c-poem-far:   #BDBDBD;   /* estrofes periféricas */
  --c-watermark:  rgba(189,189,189,0.4);

  /* Tipografia */
  --font-ui:      'Istok Web', sans-serif;
  --font-nav:     'Inter', sans-serif;
  --font-poem:    'Georgia', serif;

  /* Tamanhos responsivos (R-CLIN-01: visuoespacial primeiro) */
  --title-size:   clamp(28px, 6vw, 64px);
  --nav-width:    52px;       /* mobile */
  --touch-min:    44px;       /* iOS HIG mínimo de touch target */

  /* Motion (R-CLIN-04: sem urgência fabricada) */
  --transition:   0.25s ease;
}

@media (min-width: 768px) {
  :root {
    --nav-width: 63px;
  }
}
```

Google Fonts — no `<head>` de todos os HTML:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Istok+Web&family=Inter&family=Georgia&display=swap" rel="stylesheet">
```

---

## 3. `<head>` padrão (copiar em todos os HTML)

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">

  <!-- Mobile-first: viewport obrigatório -->
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">

  <!-- Segurança (OWASP Top 10:2025 A05 · AI_SECURITY_PALLAS §web_app) -->
  <!-- GitHub Pages não suporta header HTTP; usar meta como fallback -->
  <meta http-equiv="Content-Security-Policy"
        content="default-src 'self';
                 script-src 'self';
                 style-src 'self' https://fonts.googleapis.com;
                 font-src https://fonts.gstatic.com;
                 img-src 'self' data:;
                 frame-src https://player.vimeo.com;
                 connect-src 'none';">

  <!-- Safe area (notch/home indicator iOS) — R-CLIN-04: previsibilidade -->
  <style>
    :root {
      padding-top: env(safe-area-inset-top, 0px);
      padding-bottom: env(safe-area-inset-bottom, 0px);
    }
  </style>

  <link rel="stylesheet" href="css/style.css">
  <title>follow.white.rabbit</title>
</head>
```

---

## 4. CSS — base global (`style.css`)

Organizar no arquivo nesta ordem: tokens → reset → layout → componentes → páginas.

```css
/* ─── RESET ─────────────────────────────────────────────────────────────── */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

html, body {
  height: 100%;
  /* R-CLIN-04: sem scroll indesejado na raiz */
  overflow: hidden;
}

body {
  display: flex;
  font-family: var(--font-ui);
  background: var(--c-bg-light);
  /* Safe area lateral (landscape em iPhone) */
  padding-left:  env(safe-area-inset-left,  0px);
  padding-right: env(safe-area-inset-right, 0px);
}

/* ─── LAYOUT GLOBAL ──────────────────────────────────────────────────────── */
/* Atomic Design: nav = átomo compartilhado; main = organismo por página */

#sidebar {
  width: var(--nav-width);
  height: 100dvh;          /* dvh: cobre barra do browser mobile */
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 10;
}

main {
  flex: 1;
  height: 100dvh;
  position: relative;
  overflow: hidden;
}

/* ─── NAV ────────────────────────────────────────────────────────────────── */
.nav-rail {
  position: absolute;
  left: 11px;
  top: 0; bottom: 0;
  width: 3px;
  background: var(--c-nav-rail);
  border-radius: 50px;
}

/* R-CLIN-03: estado visível — thumb mostra posição atual */
.nav-thumb {
  position: absolute;
  top: 0;
  width: 100%;
  height: 48px;
  background: var(--c-poem-hero);
  border-radius: 50px;
  transition: transform var(--transition);
  will-change: transform;
}

.nav-menu {
  list-style: none;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  gap: 0;
}

.nav-item a {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  /* R-CLIN-01 + iOS HIG: touch target mínimo 44px */
  min-height: var(--touch-min);
  min-width:  var(--touch-min);
  justify-content: center;
  text-decoration: none;
  padding: 8px 4px;
  /* R-CLIN-04: feedback visual antes do toque */
  transition: opacity var(--transition);
}

.nav-item a:active { opacity: 0.6; }

/* Evitar hover-only em touch (R-CLIN-01) */
@media (hover: hover) {
  .nav-item a:hover { opacity: 0.75; }
}

.nav-item .label {
  writing-mode: vertical-rl;
  text-orientation: mixed;
  transform: rotate(180deg);
  font-family: var(--font-nav);
  font-size: 12px;
  color: var(--c-nav-label);
  letter-spacing: 0.04em;
  /* R-CLIN-02: sem texto longo */
  white-space: nowrap;
}

.nav-item .dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--c-nav-label);
  transition: background var(--transition);
}

/* Estado ativo — R-CLIN-03: estado visível */
.nav-item.active .dot    { background: var(--c-title); }
.nav-item.active .label  { color: var(--c-title); font-weight: 600; }
```

---

## 5. HTML estrutura compartilhada (todas as páginas)

```html
<body data-page="PAGINA">

  <nav id="sidebar" aria-label="Navegação principal">
    <div class="nav-rail" aria-hidden="true">
      <div class="nav-thumb" id="navThumb"></div>
    </div>
    <ul class="nav-menu">
      <li class="nav-item" data-page="video">
        <a href="video.html" aria-label="Ir para vídeo">
          <span class="dot" aria-hidden="true"></span>
          <span class="label">video</span>
        </a>
      </li>
      <li class="nav-item" data-page="galeria">
        <a href="galeria.html" aria-label="Ir para galeria">
          <span class="dot" aria-hidden="true"></span>
          <span class="label">galeria</span>
        </a>
      </li>
      <li class="nav-item" data-page="poema">
        <a href="poema.html" aria-label="Ir para poema">
          <span class="dot" aria-hidden="true"></span>
          <span class="label">poema</span>
        </a>
      </li>
    </ul>
  </nav>

  <main id="main">
    <!-- conteúdo específico por página abaixo -->
  </main>

  <script src="js/main.js"></script>
</body>
```

---

## 6. Páginas

### 6.1 home (`index.html`) — `data-page="home"`

```css
/* ─── HOME ───────────────────────────────────────────────────────────────── */
body[data-page="home"] { background: var(--c-bg-light); }

body[data-page="home"] main {
  display: flex;
  align-items: center;
  justify-content: center;
}

.home-watermark {
  position: absolute;
  font-family: var(--font-ui);
  /* clamp: legível em mobile, impactante em desktop */
  font-size: clamp(120px, 22vw, 220px);
  color: var(--c-watermark);
  user-select: none;
  pointer-events: none;
  /* R-CLIN-01: elemento visuoespacial como fundo */
}

.home-title {
  position: relative;
  font-family: var(--font-ui);
  font-size: var(--title-size);
  color: var(--c-title);
  text-align: center;
  z-index: 1;
  /* R-CLIN-02: texto curto, impacto máximo */
}
```

```html
<main>
  <span class="home-watermark" aria-hidden="true">@</span>
  <h1 class="home-title">follow.white.rabbit</h1>
</main>
```

---

### 6.2 video (`video.html`) — `data-page="video"`

```css
/* ─── VIDEO ──────────────────────────────────────────────────────────────── */
body[data-page="video"] { background: var(--c-bg-dark); }

body[data-page="video"] main {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.video-wrapper {
  width: 100%;
  max-width: 960px;
  aspect-ratio: 16 / 9;
  position: relative;
}

.video-wrapper iframe {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border: none;
}
```

```html
<main>
  <div class="video-wrapper">
    <!-- R-CLIN-02: autoplay=0 — play manual; R-CLIN-04: sem urgência -->
    <!-- Segurança: allow restrito ao mínimo necessário (AI_SECURITY §web_app) -->
    <iframe
      src="https://player.vimeo.com/video/SEU_ID_VIMEO?autoplay=0&title=0&byline=0"
      allow="fullscreen; picture-in-picture"
      allowfullscreen
      title="follow.white.rabbit — vídeo"
      loading="lazy">
    </iframe>
  </div>
</main>
```

**⚠ DADO FALTANTE:** substituir `SEU_ID_VIMEO`.

---

### 6.3 galeria (`galeria.html`) — `data-page="galeria"`

```css
/* ─── GALERIA ────────────────────────────────────────────────────────────── */
body[data-page="galeria"] {
  /* ⚠ DADO FALTANTE: extrair hex do node 6:61 no Figma */
  background: #1A3A5C; /* PLACEHOLDER — substituir */
}

body[data-page="galeria"] main {
  display: flex;
  align-items: center;
  justify-content: center;
  /* R-CLIN-01: layout visuoespacial — imagem domina */
  gap: clamp(1rem, 4vw, 3rem);
  padding: 1rem;
  /* Empilha em mobile, lado a lado em desktop */
  flex-direction: column;
}

@media (min-width: 768px) {
  body[data-page="galeria"] main {
    flex-direction: row;
  }
}

.galeria-img {
  /* R-CLIN-01: imagem é o elemento primário */
  max-width: min(80vw, 420px);
  max-height: 75dvh;
  width: auto;
  height: auto;
  object-fit: contain;
  display: block;
}

.galeria-text {
  /* R-CLIN-02: texto secundário, nunca parede */
  font-family: var(--font-poem);
  font-size: clamp(12px, 1.8vw, 16px);
  line-height: 1.7;
  color: var(--c-poem-hero);
  max-width: 360px;
  text-align: left;
}
```

```html
<main>
  <!-- R-CLIN-01: imagem em primeiro no DOM = prioridade visuoespacial -->
  <img src="assets/img/daruma.png"
       alt="Daruma — obra de Dyogo Viana"
       class="galeria-img"
       loading="lazy"
       width="420" height="560">
  <div class="galeria-text">
    <!-- ⚠ DADO FALTANTE: copiar texto do node 7:147 do Figma -->
    <p>PLACEHOLDER — substituir pelo texto da galeria.</p>
  </div>
</main>
```

---

### 6.4 poema (`poema.html`) — `data-page="poema"`

#### Conceito (Arquitetura Pallas §2 — criação como processo)
5 estrofes em profundidade simulada. A estrofe central ao viewport é maior e mais clara; as periféricas encolhem e escurecem. O scroll do usuário move o foco — sem UI de controle explícita (R-CLIN-04: autonomia).

```css
/* ─── POEMA ──────────────────────────────────────────────────────────────── */
body[data-page="poema"] {
  background: var(--c-bg-dark);
  /* R-CLIN-03: recuperação de sessão via JS (localStorage) */
}

.poem-scroll {
  width: 100%;
  height: 100dvh;
  overflow-y: scroll;
  /* R-CLIN-01: scroll nativo por toque */
  -webkit-overflow-scrolling: touch;
  touch-action: pan-y;
  overscroll-behavior-y: contain;
  /* Esconder scrollbar — R-CLIN-04: interface limpa */
  scrollbar-width: none;
}
.poem-scroll::-webkit-scrollbar { display: none; }

.poem-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  /* Padding vertical = 40vh: garante que 1ª e última estrofe
     possam chegar ao centro do viewport (R-CLIN-01) */
  padding: 40dvh clamp(1rem, 5vw, 3rem);
  gap: clamp(2rem, 6vh, 5rem);
}

.strophe {
  font-family: var(--font-poem);
  text-align: center;
  color: var(--c-poem-far);
  font-size: 7px;
  line-height: 1.9;
  max-width: min(520px, 90vw);
  white-space: pre-wrap;
  /* R-CLIN-04: transição suave, não abrupta */
  transition: font-size 0.2s ease, color 0.2s ease;
  /* Evitar layout shift durante a transição */
  will-change: font-size, color;
}
```

```html
<main>
  <div class="poem-scroll" id="poemScroll" role="region" aria-label="Poema">
    <div class="poem-inner" id="poemInner">

      <p class="strophe">debaixo, o mar faz de cada gesto uma espiral,
e nada é à toa, mesmo sem saber a hora.
H� desenho no que ninguém decifrou, e é sinal;
o futuro, que não controlo, atravesso, leve,
e o mar segue inteiro, sereno e natural.</p>

      <p class="strophe">Em volta, duas notas num arabesco breve:
duas cores, uma forma, e o compasso — meu — se expressa;
juntas, o que bate no peito, em curva, se escreve.</p>

      <p class="strophe">Na base, ouro em círculos dentro de círculos; o fio começa,
dá voltas, segue até a luz, só o próximo metro alcança;
o metro basta, e o resto vem sem pressa.</p>

      <p class="strophe">Do lado de fora, onde o dia chega primeiro, a flor avança:
setembro: primavera — e tudo abre para o dia,
e a estação é minha, e é só esperança.</p>

      <p class="strophe">Do lado de fora, onde o dia chega primeiro, a flor avança:
setembro: primavera — e tudo abre para o dia,
e a estação é minha, e é só esperança.</p>

    </div>
  </div>
</main>
```

---

## 7. `main.js` — completo

```js
// ─── NAV: marcar página ativa (R-CLIN-03: estado visível) ────────────────
(function markActive() {
  const page = document.body.dataset.page;
  document.querySelectorAll('.nav-item').forEach(item => {
    if (item.dataset.page === page) item.classList.add('active');
  });
})();

// ─── NAV THUMB: posição do indicador ─────────────────────────────────────
function setNavThumb(ratio) {
  const thumb = document.getElementById('navThumb');
  if (!thumb) return;
  const track = thumb.closest('.nav-rail');
  const max = track.clientHeight - thumb.clientHeight;
  thumb.style.transform = `translateY(${Math.max(0, Math.min(max, max * ratio))}px)`;
}

// ─── POEMA: scroll dinâmico ───────────────────────────────────────────────
const poemScroll = document.getElementById('poemScroll');

if (poemScroll) {

  const FONT_MIN = 7;      // px — periférica
  const FONT_MAX = 15;     // px — central
  const COLOR_FAR  = [189, 189, 189];  // #BDBDBD
  const COLOR_MID  = [130, 130, 130];  // #828282
  const COLOR_HERO = [240, 231, 226];  // #F0E7E2

  function lerp(a, b, t) { return a + (b - a) * t; }

  function lerpColor(c1, c2, t) {
    return `rgb(${Math.round(lerp(c1[0],c2[0],t))},`
         + `${Math.round(lerp(c1[1],c2[1],t))},`
         + `${Math.round(lerp(c1[2],c2[2],t))})`;
  }

  function updatePoem() {
    const strophes = document.querySelectorAll('.strophe');
    const viewCY = poemScroll.scrollTop + poemScroll.clientHeight / 2;
    const maxDist = poemScroll.clientHeight * 0.55;

    strophes.forEach(el => {
      const elCY = el.offsetTop + el.offsetHeight / 2;
      const dist = Math.abs(viewCY - elCY);
      const t = Math.max(0, 1 - dist / maxDist); // 0=longe, 1=centro

      el.style.fontSize = lerp(FONT_MIN, FONT_MAX, t) + 'px';

      let color;
      if (t < 0.5) {
        color = lerpColor(COLOR_FAR, COLOR_MID, t * 2);
      } else {
        color = lerpColor(COLOR_MID, COLOR_HERO, (t - 0.5) * 2);
      }
      el.style.color = color;
    });

    // Sincroniza thumb com progresso do scroll
    const ratio = poemScroll.scrollTop /
                  (poemScroll.scrollHeight - poemScroll.clientHeight);
    setNavThumb(isNaN(ratio) ? 0 : ratio);
  }

  // R-CLIN-03: recuperar posição de scroll da última visita
  const SCROLL_KEY = 'fwr_poem_scroll';
  const saved = localStorage.getItem(SCROLL_KEY);
  if (saved) poemScroll.scrollTop = parseInt(saved, 10);

  // Salvar posição (throttled — a cada 500ms)
  let saveTimer;
  poemScroll.addEventListener('scroll', () => {
    updatePoem();
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      localStorage.setItem(SCROLL_KEY, poemScroll.scrollTop);
    }, 500);
  }, { passive: true });

  updatePoem(); // estado inicial

  // Redimensionamento (orientação do celular)
  window.addEventListener('resize', updatePoem, { passive: true });
}

// ─── NAV THUMB: páginas sem scroll (thumb fixo no item ativo) ─────────────
if (!poemScroll) {
  const active = document.querySelector('.nav-item.active');
  if (active) {
    const menu = document.querySelector('.nav-menu');
    const rail = document.querySelector('.nav-rail');
    const thumb = document.getElementById('navThumb');
    if (thumb && rail && menu) {
      const menuTop    = menu.getBoundingClientRect().top;
      const activeTop  = active.getBoundingClientRect().top;
      const railH      = rail.clientHeight;
      const ratio      = (activeTop - menuTop) / (menu.clientHeight || 1);
      setNavThumb(ratio);
    }
  }
}
```

---

## 8. Export de assets do Figma

| Asset | Node Figma | Formato | Escala |
|---|---|---|---|
| Rail do nav | `7:229` | SVG | — |
| Dot indicador | `7:240` | SVG | — |
| Logo coelho | `7:252` | SVG | — |
| Daruma (galeria) | frame galeria main | PNG | @2x |

Exportar: selecionar node → painel direito → Export → formato da tabela.

---

## 9. Segurança (AI_SECURITY_PALLAS §web_app — OWASP Top 10:2025 A05)

| Controle | Implementação |
|---|---|
| CSP | `<meta http-equiv="Content-Security-Policy">` no `<head>` (seção 3) |
| Iframe Vimeo | `allow="fullscreen; picture-in-picture"` — sem `allow-scripts` extra |
| Inputs externos | Nenhum neste projeto — sem formulários, sem uploads |
| Assets | Servidos do próprio repo; sem CDN de terceiros exceto Google Fonts |
| localStorage | Apenas `fwr_poem_scroll` (inteiro) — sem PII, sem dados sensíveis |

---

## 10. Dados faltantes (não inventar — Pallas §3 R.4)

| # | O que falta | Onde buscar |
|---|---|---|
| 1 | ID do vídeo no Vimeo | URL do vídeo no Vimeo |
| 2 | Cor de fundo da galeria | Figma node `6:61` — fill do frame |
| 3 | Texto da galeria | Figma node `7:147` — campo text |

---

## 11. Issues identificados no Figma (FATO)

| # | Problema | Ação do Codex |
|---|---|---|
| 1 | Design construído rotacionado 90° | Ignorar rotações; reescrever layout horizontal normal |
| 2 | `main_home` e `main` são símbolos placeholder `#d9d9d9` | Usar tokens da seção 2 |
| 3 | Logo `hidden="true"` no frame home | Implementar logo visível com asset SVG exportado |
| 4 | Estrofes com `mask-image` CSS (dissolução complexa) | Substituir pelo efeito JS da seção 6.4 |
| 5 | Coordenadas absolutas (px fixos) | Converter para layout fluido com clamp/dvh/% |

---

## 12. Checklist antes de fazer PR

- [ ] `<meta name="viewport">` presente em todos os HTML
- [ ] `<meta http-equiv="Content-Security-Policy">` presente em todos os HTML
- [ ] Touch targets ≥ 44px (inspecionar no DevTools mobile)
- [ ] Testar orientação landscape em mobile (iOS Safari + Android Chrome)
- [ ] Poema: scroll funciona por toque sem interferência do nav
- [ ] Poema: posição salva e restaurada ao voltar à página
- [ ] Nav: item ativo visualmente distinto em todas as páginas
- [ ] Vídeo: não inicia automaticamente
- [ ] `SEU_ID_VIMEO` substituído pelo ID real
- [ ] Cor e texto da galeria preenchidos (itens 2 e 3 da seção 10)
- [ ] `index.html` na raiz do repo (GitHub Pages)
- [ ] Sem `console.log` em produção
