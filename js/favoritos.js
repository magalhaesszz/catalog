'use strict';

/* ==========================================
   SISTEMA DE FAVORITOS (localStorage)
   Arquivo: js/favoritos.js
   Sem login — salvo por loja no navegador
   ========================================== */

const FAV_KEY = 'cdp_favoritos';
let favoritosSalvos = [];

function carregarFavoritos() {
    try {
        const s = localStorage.getItem(FAV_KEY);
        favoritosSalvos = s ? JSON.parse(s) : [];
    } catch(e) { favoritosSalvos = []; }
}

function salvarFavoritos() {
    localStorage.setItem(FAV_KEY, JSON.stringify(favoritosSalvos));
}

function ehFavorito(nome) {
    return favoritosSalvos.some(f => f.nome === nome);
}

function toggleFavorito(produto) {
    const idx = favoritosSalvos.findIndex(f => f.nome === produto.nome);
    if (idx >= 0) {
        favoritosSalvos.splice(idx, 1);
        mostrarToast('Removido dos favoritos.', 'info');
    } else {
        favoritosSalvos.push({
            nome:   produto.nome,
            preco:  produto.preco,
            imagem: getImagens(produto)[0]
        });
        mostrarToast('Adicionado aos favoritos!', 'success');
    }
    salvarFavoritos();
    atualizarBotoesFavorito();
}

function atualizarBotoesFavorito() {
    document.querySelectorAll('.btn-favorito').forEach(btn => {
        const ativo = ehFavorito(btn.dataset.nome);
        btn.classList.toggle('ativo', ativo);
        btn.innerHTML = ativo ? '<i class="fas fa-heart"></i>' : '<i class="far fa-heart"></i>';
        btn.title = ativo ? 'Remover dos favoritos' : 'Favoritar';
    });
}

function abrirFavoritos() {
    renderFavoritosModal();
    abrirModal('modal-favoritos');
}

function renderFavoritosModal() {
    const lista = document.getElementById('favoritos-lista');
    if (!lista) return;
    if (favoritosSalvos.length === 0) {
        lista.innerHTML = `<div class="fav-vazio">
            <i class="far fa-heart"></i>
            <p>Nenhum produto favoritado ainda.</p>
        </div>`;
        return;
    }
    lista.innerHTML = favoritosSalvos.map((p, i) => `
        <div class="fav-card">
            <img src="${escapeHTML(p.imagem)}" onerror="this.src='https://via.placeholder.com/200x100/0d1711/22a05a?text=Produto'">
            <div class="fav-card-info">
                <div class="fav-card-nome">${escapeHTML(p.nome)}</div>
                <div class="fav-card-preco">${formatarPreco(p.preco)}</div>
                <div class="fav-card-actions">
                    <button class="fav-btn-add" onclick="adicionarAoCarrinho(favoritosSalvos[${i}]); fecharModal('modal-favoritos');">
                        <i class="fas fa-cart-plus"></i> Carrinho
                    </button>
                    <button class="fav-btn-rem" onclick="removerFavoritoIdx(${i})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function removerFavoritoIdx(i) {
    favoritosSalvos.splice(i, 1);
    salvarFavoritos();
    atualizarBotoesFavorito();
    renderFavoritosModal();
}