'use strict';

/* ==========================================
   VÍDEOS, ORDENAÇÃO E TROCA DE LOJA
   ==========================================
   Arquivo: js/videos.js
   ========================================== */

const CYTO_VIDEOS = {
    1: { id: '1191388314' },
    2: { id: '1191388444' }
};

function toggleVolumeCyto(num) {
    const frame = document.getElementById('vimeo-frame-' + num);
    const btn = document.getElementById('vol-btn-' + num);
    if (!frame || !btn) return;
    const isMuted = btn.classList.contains('muted');
    const videoId = CYTO_VIDEOS[num].id;
    if (isMuted) {
        frame.src = `https://player.vimeo.com/video/${videoId}?background=1&autoplay=1&loop=1&muted=0&playsinline=1`;
        frame.style.pointerEvents = 'auto';
        btn.classList.remove('muted');
        btn.innerHTML = '<i class="fas fa-volume-up"></i>';
        btn.title = 'Silenciar';
    } else {
        frame.src = `https://player.vimeo.com/video/${videoId}?background=1&autoplay=1&loop=1&muted=1&playsinline=1`;
        frame.style.pointerEvents = 'none';
        btn.classList.add('muted');
        btn.innerHTML = '<i class="fas fa-volume-mute"></i>';
        btn.title = 'Ativar som';
    }
}

function toggleFullscreenCyto(num) {
    const card = document.getElementById('vid-card-' + num);
    if (!card) return;
    if (!document.fullscreenElement) {
        if (card.requestFullscreen) card.requestFullscreen();
        else if (card.webkitRequestFullscreen) card.webkitRequestFullscreen();
        else if (card.msRequestFullscreen) card.msRequestFullscreen();
    } else {
        if (document.exitFullscreen) document.exitFullscreen();
        else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
    }
}

let ordenacaoAtual = 'none';

function ordenarPreco(tipo, btn) {
    ordenacaoAtual = tipo;
    document.querySelectorAll('.btn-price-sort').forEach(b => b.classList.remove('ativo'));
    if (btn) btn.classList.add('ativo');
    renderTodosProdutos();
}

function trocarLoja(loja) {
    lojaAtual = loja;
    document.body.setAttribute('data-theme', loja);
    document.querySelectorAll('.main-tab').forEach(t => t.classList.toggle('active', t.dataset.loja === loja));
    const cfg = LOJAS_CONFIG[loja];
    document.getElementById('header-titulo').childNodes[0].nodeValue = cfg.titulo;
    document.getElementById('header-subtitulo').innerText = cfg.subtitulo;

    const provaSubtitle = document.getElementById('prova-subtitle');
    if (provaSubtitle) provaSubtitle.innerText = cfg.prova_subtitle;

    document.getElementById('catalogo-subtitle').innerText = cfg.catalogo_subtitle;
    document.getElementById('footer-texto').innerHTML = cfg.footer;
    document.getElementById('btn-instagram').href = cfg.instagram;

    // Mostrar/esconder seções — com verificação de existência
    const heroCanetas = document.getElementById('hero-canetas');
    const heroCyto    = document.getElementById('hero-cyto');
    const provaCanetas = document.getElementById('prova-canetas');
    const provaCyto    = document.getElementById('prova-cyto');
    const videosCyto   = document.getElementById('videos-cyto');

    if (heroCanetas)  heroCanetas.style.display  = loja === 'canetas' ? 'block' : 'none';
    if (heroCyto)     heroCyto.style.display     = loja === 'cyto'    ? 'block' : 'none';
    if (provaCanetas) provaCanetas.style.display  = loja === 'canetas' ? 'grid'  : 'none';
    if (provaCyto)    provaCyto.style.display     = loja === 'cyto'    ? 'grid'  : 'none';
    if (videosCyto)   videosCyto.style.display    = loja === 'cyto'    ? 'grid'  : 'none';

    // Seções de categorias com ícones
    const catsCanetas     = document.getElementById('cats-canetas');
    const catsCyto        = document.getElementById('cats-cyto');
    const iconCatsCanetas = document.getElementById('icon-cats-canetas');
    const iconCatsCyto    = document.getElementById('icon-cats-cyto');
    if (catsCanetas)     catsCanetas.style.display     = loja === 'canetas' ? 'block' : 'none';
    if (catsCyto)        catsCyto.style.display        = loja === 'cyto'    ? 'block' : 'none';
    if (iconCatsCanetas) iconCatsCanetas.style.display = loja === 'canetas' ? 'grid'  : 'none';
    if (iconCatsCyto)    iconCatsCyto.style.display    = loja === 'cyto'    ? 'grid'  : 'none';

    categoriaAtiva = 'todos';
    ordenacaoAtual = 'none';
    document.querySelectorAll('.btn-price-sort').forEach(b => b.classList.remove('ativo'));
    document.getElementById('search-input').value = '';
    document.getElementById('search-bar').style.display = 'none';

    renderizarFiltrosDOM();
    renderTodosProdutos();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
