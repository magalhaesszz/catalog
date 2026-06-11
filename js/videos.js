'use strict';

/* ==========================================
   VÍDEOS, ORDENAÇÃO E TROCA DE LOJA
   ==========================================
   Arquivo: js/videos.js
   Responsável por: controles dos vídeos Cyto (Vimeo),
   ordenação por preço, alternar entre Canetas e Cyto
   ========================================== */

// Mapa dos vídeos Vimeo da Cyto
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

// Ordenação por preço
let ordenacaoAtual = 'none';

function ordenarPreco(tipo, btn) {
    ordenacaoAtual = tipo;
    document.querySelectorAll('.btn-price-sort').forEach(b => b.classList.remove('ativo'));
    if (btn) btn.classList.add('ativo');
    renderTodosProdutos();
}

// Alternar entre lojas
function trocarLoja(loja) {
    lojaAtual = loja;
    document.body.setAttribute('data-theme', loja);
    document.querySelectorAll('.main-tab').forEach(t => t.classList.toggle('active', t.dataset.loja === loja));
    const cfg = LOJAS_CONFIG[loja];
    document.getElementById('header-titulo').childNodes[0].nodeValue = cfg.titulo;
    document.getElementById('header-subtitulo').innerText = cfg.subtitulo;
    document.getElementById('prova-subtitle').innerText = cfg.prova_subtitle;
    document.getElementById('catalogo-subtitle').innerText = cfg.catalogo_subtitle;
    document.getElementById('footer-texto').innerHTML = cfg.footer;
    document.getElementById('btn-instagram').href = cfg.instagram;

    // Mostrar/esconder seções específicas
    document.getElementById('hero-canetas').style.display = loja === 'canetas' ? 'block' : 'none';
    document.getElementById('hero-cyto').style.display = loja === 'cyto' ? 'block' : 'none';
    document.getElementById('prova-canetas').style.display = loja === 'canetas' ? 'grid' : 'none';
    document.getElementById('prova-cyto').style.display = loja === 'cyto' ? 'grid' : 'none';
    document.getElementById('videos-cyto').style.display = loja === 'cyto' ? 'grid' : 'none';

    categoriaAtiva = 'todos';
    ordenacaoAtual = 'none';
    document.querySelectorAll('.btn-price-sort').forEach(b => b.classList.remove('ativo'));
    document.getElementById('search-input').value = '';
    document.getElementById('search-bar').style.display = 'none';

    renderizarFiltrosDOM();
    renderTodosProdutos();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
