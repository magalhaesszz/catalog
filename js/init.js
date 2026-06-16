'use strict';

/* ==========================================
   INICIALIZAÇÃO
   Arquivo: js/init.js
   ========================================== */

let inicializado = false;

function iniciarAplicacao() {
    if (inicializado) return;
    inicializado = true;
    carregarFavoritos();
    renderizarFiltrosDOM();
    renderTodosProdutos();
    iniciarBackToTop();
    setTimeout(inicializarSupabase, 250);
}

document.addEventListener('DOMContentLoaded', iniciarAplicacao);
window.addEventListener('load', iniciarAplicacao);