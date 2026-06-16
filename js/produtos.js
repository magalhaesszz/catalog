'use strict';

/* ==========================================
   RENDERIZAÇÃO DE PRODUTOS E CARROSSEL
   Arquivo: js/produtos.js
   ========================================== */


function getImagens(p) {
    const imgs = [];
    if (p.imagem)  imgs.push(p.imagem);
    if (p.imagem2) imgs.push(p.imagem2);
    if (p.imagem3) imgs.push(p.imagem3);
    if (p.imagens && Array.isArray(p.imagens))
        p.imagens.forEach(i => { if (i && !imgs.includes(i)) imgs.push(i); });
    return imgs.length > 0 ? imgs : ['https://via.placeholder.com/400x300/0d1711/22a05a?text=Produto'];
}

function getTodosProdutosDaLojaAtual() {
    const fixos  = getProdutosFixos(lojaAtual);
    const doBanco = produtosSupabase
        .filter(p => (p.loja || 'canetas') === lojaAtual)
        .map(p => ({
            id: p.id, nome: p.nome,
            preco: parseFloat(p.preco),
            imagem: p.imagem, imagem2: p.imagem2 || '', imagem3: p.imagem3 || '',
            descricao: p.descricao || '', categoria: p.categoria,
            fixo: false, loja: p.loja || 'canetas'
        }));
    return fixos.concat(doBanco);
}

function renderTodosProdutos() {
    const grade = document.getElementById('grade-produtos');
    grade.innerHTML = '';
    let produtos = getTodosProdutosDaLojaAtual();
    if (produtos.length === 0) {
        grade.innerHTML = '<div class="empty-message" style="display:block; grid-column:1/-1;"><i class="fas fa-box-open" style="font-size:2rem; margin-bottom:12px; display:block; opacity:0.3;"></i><p style="margin:0;">Nenhum produto cadastrado nesta loja ainda.</p></div>';
        return;
    }
    if (ordenacaoAtual === 'asc')  produtos = produtos.slice().sort((a, b) => a.preco - b.preco);
    else if (ordenacaoAtual === 'desc') produtos = produtos.slice().sort((a, b) => b.preco - a.preco);

    produtos.forEach((p, idx) => {
        const c    = obterCorCat(p.categoria, lojaAtual);
        const imgs = getImagens(p);
        const card = document.createElement('div');
        card.className      = 'card';
        card.dataset.categoria = p.categoria;
        card.dataset.id     = p.id;
        card.style.animationDelay = (idx * 0.028) + 's';

        // Carrossel de imagens
        let carouselHtml = '';
        if (imgs.length > 1) {
            const trackImgs = imgs.map(src =>
                `<img loading="lazy" src="${escapeHTML(src)}" onerror="this.src='https://via.placeholder.com/400x300/0d1711/22a05a?text=Produto'">`
            ).join('');
            const dots = imgs.map((_, i) =>
                `<span class="card-img-dot${i === 0 ? ' active' : ''}" data-idx="${i}"></span>`
            ).join('');
            carouselHtml = `
                <div class="card-img-carousel" data-current="0" data-total="${imgs.length}">
                    <div class="card-img-carousel-track">${trackImgs}</div>
                    <button class="card-img-nav prev" onclick="event.stopPropagation(); cardCarouselNav(this, -1)"><i class="fas fa-chevron-left"></i></button>
                    <button class="card-img-nav next" onclick="event.stopPropagation(); cardCarouselNav(this, 1)"><i class="fas fa-chevron-right"></i></button>
                    <div class="card-img-dots">${dots}</div>
                </div>`;
        } else {
            carouselHtml = `
                <div class="card-img-carousel">
                    <div class="card-img-carousel-track">
                        <img loading="lazy" src="${escapeHTML(imgs[0])}" onerror="this.src='https://via.placeholder.com/400x300/0d1711/22a05a?text=Produto'">
                    </div>
                </div>`;
        }

        // Botão favorito
        const favAtivo = ehFavorito(p.nome);
        const favBtn   = `<button class="btn-favorito${favAtivo ? ' ativo' : ''}" data-nome="${escapeHTML(p.nome)}" title="${favAtivo ? 'Remover dos favoritos' : 'Favoritar'}" onclick="event.stopPropagation(); toggleFavorito(${JSON.stringify({nome:p.nome, preco:p.preco, imagem:imgs[0]}).replace(/"/g,'&quot;')})">
            <i class="${favAtivo ? 'fas' : 'far'} fa-heart"></i>
        </button>`;

        card.innerHTML = `
            <span class="tag-tipo" style="background:${c.cor}">${escapeHTML(c.nome)}</span>
            ${p.fixo ? '' : '<span class="tag-novo">NOVO</span>'}
            ${favBtn}
            ${carouselHtml}
            <div class="card-info">
                <div class="card-nome">${escapeHTML(p.nome)}</div>
                <div class="card-preco">
                    ${formatarPreco(p.preco)}
                    <span class="card-btn-add"><i class="fas fa-plus"></i></span>
                </div>
            </div>`;

        card.addEventListener('click', () => abrirModalDetalhes(p));
        card.querySelector('.card-btn-add').addEventListener('click', e => {
            e.stopPropagation();
            adicionarAoCarrinho(p);
        });
        grade.appendChild(card);
    });
    aplicarFiltros();
}

function cardCarouselNav(btn, dir) {
    const carousel = btn.closest('.card-img-carousel');
    if (!carousel) return;
    const total   = parseInt(carousel.dataset.total) || 1;
    let current   = parseInt(carousel.dataset.current) || 0;
    current = (current + dir + total) % total;
    carousel.dataset.current = current;
    carousel.querySelector('.card-img-carousel-track').style.transform = `translateX(-${current * 100}%)`;
    carousel.querySelectorAll('.card-img-dot').forEach((d, i) => d.classList.toggle('active', i === current));
}

function abrirModalDetalhes(p) {
    produtoAtual = p;
    const c = obterCorCat(p.categoria, p.loja || lojaAtual);
    document.getElementById('d-nome').innerText  = p.nome;
    document.getElementById('d-preco').innerText = formatarPreco(p.preco);
    document.getElementById('d-desc').innerText  = p.descricao || 'Produto premium de alta qualidade.';
    document.getElementById('d-tag').innerText   = c.nome.toUpperCase();
    document.getElementById('d-tag').style.background = c.cor;

    const imgs = getImagens(p);
    modalCarouselCurrent = 0;
    modalCarouselTotal   = imgs.length;

    const track = document.getElementById('modal-carousel-track');
    track.innerHTML = imgs.map(src =>
        `<img src="${escapeHTML(src)}" onerror="this.src='https://via.placeholder.com/400x400/0d1711/22a05a?text=Produto'">`
    ).join('');
    track.style.transform = 'translateX(0)';

    const dots = document.getElementById('modal-dots');
    if (imgs.length > 1) {
        dots.innerHTML = imgs.map((_, i) =>
            `<span class="modal-img-dot${i === 0 ? ' active' : ''}" onclick="modalCarouselGoTo(${i})"></span>`
        ).join('');
        dots.style.display = 'flex';
        document.getElementById('modal-nav-prev').style.display = 'flex';
        document.getElementById('modal-nav-next').style.display = 'flex';
    } else {
        dots.innerHTML = '';
        dots.style.display = 'none';
        document.getElementById('modal-nav-prev').style.display = 'none';
        document.getElementById('modal-nav-next').style.display = 'none';
    }
    abrirModal('modal-detalhes');
}

function modalCarouselNav(dir) {
    if (modalCarouselTotal <= 1) return;
    modalCarouselCurrent = (modalCarouselCurrent + dir + modalCarouselTotal) % modalCarouselTotal;
    modalCarouselUpdate();
}

function modalCarouselGoTo(idx) {
    modalCarouselCurrent = idx;
    modalCarouselUpdate();
}

function modalCarouselUpdate() {
    document.getElementById('modal-carousel-track').style.transform = `translateX(-${modalCarouselCurrent * 100}%)`;
    document.querySelectorAll('#modal-dots .modal-img-dot').forEach((d, i) =>
        d.classList.toggle('active', i === modalCarouselCurrent)
    );
}

// Swipe no modal
(function() {
    let startX = 0;
    document.addEventListener('DOMContentLoaded', () => {
        const el = document.getElementById('modal-carousel');
        if (!el) return;
        el.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
        el.addEventListener('touchend',   e => {
            const diff = startX - e.changedTouches[0].clientX;
            if (Math.abs(diff) > 50) modalCarouselNav(diff > 0 ? 1 : -1);
        }, { passive: true });
    });
})();

function adicionarDoModal() {
    adicionarAoCarrinho(produtoAtual);
    fecharModal('modal-detalhes');
}
