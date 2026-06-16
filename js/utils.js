'use strict';

/* ==========================================
   ESTADO GLOBAL + UTILITÁRIOS
   Arquivo: js/utils.js
   ========================================== */

let supabaseClient = null;
let produtosSupabase = [];
let carrinho = [];
let produtoAtual = {};
let categoriaAtiva = 'todos';
let lojaAtual = LOJA_CANETAS;
let conexaoOK = false;

// === HELPERS ===

function escapeHTML(str) {
    if (!str) return '';
    return String(str).replace(/[&<>"']/g, c =>
        ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c])
    );
}

function formatarPreco(preco) {
    return 'R$ ' + parseFloat(preco).toFixed(2).replace('.', ',');
}

// === MODAIS COM LOCK DE FUNDO ===

function abrirModal(id) {
    const m = document.getElementById(id);
    if (!m) return;
    m.classList.add('active');
    const scrollY = window.scrollY;
    document.body.style.overflow   = 'hidden';
    document.body.style.position   = 'fixed';
    document.body.style.top        = `-${scrollY}px`;
    document.body.style.width      = '100%';
    document.body.dataset.scrollY  = scrollY;
}

function fecharModal(id) {
    const m = document.getElementById(id);
    if (!m) return;
    m.classList.remove('active');
    const scrollY = parseInt(document.body.dataset.scrollY || '0');
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.top      = '';
    document.body.style.width    = '';
    window.scrollTo(0, scrollY);
}

function fecharSeClicarFora(e, id) {
    if (e.target.id === id) fecharModal(id);
}

function abrirImagemFullscreen(src) {
    document.getElementById('full-img').src = src;
    abrirModal('modal-img-full');
}

// === TOAST ===

function mostrarToast(mensagem, tipo = 'success') {
    const t = document.getElementById('toast');
    t.className = 'toast ' + tipo;
    const icons = {
        success: '<i class="fas fa-check-circle"></i>',
        error:   '<i class="fas fa-exclamation-circle"></i>',
        info:    '<i class="fas fa-info-circle"></i>'
    };
    t.innerHTML = (icons[tipo] || '') + ' <span>' + escapeHTML(mensagem) + '</span>';
    setTimeout(() => t.classList.add('show'), 10);
    setTimeout(() => t.classList.remove('show'), 3500);
}

// === BUSCA ===

function toggleSearch() {
    const b = document.getElementById('search-bar');
    b.style.display = b.style.display === 'block' ? 'none' : 'block';
    if (b.style.display === 'block') document.getElementById('search-input').focus();
}

// === BOTÃO VOLTAR AO TOPO ===

function iniciarBackToTop() {
    const btn = document.getElementById('btn-back-top');
    if (!btn) return;
    window.addEventListener('scroll', () => {
        btn.classList.toggle('visible', window.scrollY > 380);
    }, { passive: true });
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

// === ANIMAÇÃO SHAKE NO CARRINHO ===

function animarCarrinho() {
    const btn = document.getElementById('btn-carrinho');
    if (!btn) return;
    btn.classList.remove('shake');
    void btn.offsetWidth; // reflow para reiniciar animação
    btn.classList.add('shake');
    setTimeout(() => btn.classList.remove('shake'), 600);
}