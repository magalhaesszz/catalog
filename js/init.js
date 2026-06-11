'use strict';

/* ==========================================
   INICIALIZAÇÃO
   ==========================================
   Arquivo: js/init.js
   Responsável por: rodar tudo quando a página carrega
   (último arquivo a ser carregado)
   ========================================== */

let inicializado = false;

function iniciarAplicacao() {
    if (inicializado) return;
    inicializado = true;
    renderizarFiltrosDOM();
    renderTodosProdutos();
    setTimeout(inicializarSupabase, 250);
}

document.addEventListener('DOMContentLoaded', iniciarAplicacao);
window.addEventListener('load', iniciarAplicacao);
