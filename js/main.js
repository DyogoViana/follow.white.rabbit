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

  const FONT_MIN = 7;
  const FONT_MAX = 15;
  const COLOR_FAR = [189, 189, 189];
  const COLOR_MID = [130, 130, 130];
  const COLOR_HERO = [240, 231, 226];

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

    const ratio = poemScroll.scrollTop /
                  (poemScroll.scrollHeight - poemScroll.clientHeight);
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

if (!poemScroll) {
  const active = document.querySelector('.nav-item.active');
  if (active) {
    const menu = document.querySelector('.nav-menu');
    const rail = document.querySelector('.nav-rail');
    const thumb = document.getElementById('navThumb');
    if (thumb && rail && menu) {
      const menuTop = menu.getBoundingClientRect().top;
      const activeTop = active.getBoundingClientRect().top;
      const railH = rail.clientHeight;
      const ratio = (activeTop - menuTop) / (menu.clientHeight || 1);
      setNavThumb(ratio);
    }
  }
}

/* JS-OVERRIDE v1 (2026-10-08) - append-only; apague este bloco p/ reverter */
setNavThumb = function(){
  var items=[].slice.call(document.querySelectorAll('.nav-item'));
  var idx=-1; items.forEach(function(it,i){ if(it.classList.contains('active')) idx=i; });
  var thumb=document.getElementById('navThumb'); if(!thumb) return;
  if(idx<0){ thumb.style.opacity='0'; thumb.style.transform='translateX(0)'; return; }
  thumb.style.opacity='1'; thumb.style.transform='translateX('+(idx*100)+'%)';
};
setNavThumb();
window.addEventListener('resize', setNavThumb, {passive:true});