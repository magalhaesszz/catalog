'use strict';

/* ==========================================
   ESTADO GLOBAL + UTILITÁRIOS
   ==========================================
   Arquivo: js/utils.js
   Responsável por: variáveis globais compartilhadas
   e funções auxiliares (escape, modais, toast, etc)
   ========================================== */

// === ESTADO GLOBAL DA APLICAÇÃO ===
let supabaseClient = null;
let produtosSupabase = [];
let carrinho = [];
let produtoAtual = {};
let categoriaAtiva = 'todos';
let lojaAtual = LOJA_CANETAS;
let conexaoOK = false;

// === FUNÇÕES UTILITÁRIAS ===

function escapeHTML(str) {
    if (!str) return '';
    return String(str).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function formatarPreco(preco) {
    return 'R$ ' + parseFloat(preco).toFixed(2).replace('.', ',');
}

function abrirModal(id) {
    const m = document.getElementById(id);
    if(m) { m.classList.add('active'); document.body.style.overflow = 'hidden'; }
}

function fecharModal(id) {
    const m = document.getElementById(id);
    if(m) { m.classList.remove('active'); document.body.style.overflow = ''; }
}

function fecharSeClicarFora(e, id) {
    if (e.target.id === id) fecharModal(id);
}

function abrirImagemFullscreen(src) {
    document.getElementById('full-img').src = src;
    abrirModal('modal-img-full');
}

function mostrarToast(mensagem, tipo = 'success') {
    const t = document.getElementById('toast');
    t.className = 'toast ' + tipo;
    const icons = {
        success: '<i class="fas fa-check-circle"></i>',
        error: '<i class="fas fa-exclamation-circle"></i>',
        info: '<i class="fas fa-info-circle"></i>'
    };
    t.innerHTML = icons[tipo] + ' <span>' + escapeHTML(mensagem) + '</span>';
    setTimeout(() => t.classList.add('show'), 10);
    setTimeout(() => t.classList.remove('show'), 3500);
}

function toggleSearch() {
    const b = document.getElementById('search-bar');
    b.style.display = b.style.display === 'block' ? 'none' : 'block';
    if (b.style.display === 'block') document.getElementById('search-input').focus();
}
