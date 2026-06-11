'use strict';

/* ==========================================
   FILTROS E BUSCA
   ==========================================
   Arquivo: js/filtros.js
   Responsável por: renderizar botões de filtro, aplicar busca,
   atualizar selects do painel admin
   ========================================== */

function renderizarFiltrosDOM() {
    const categorias = getCategorias(lojaAtual);
    let btnHtml = '<button class="btn-filtro ativo" onclick="filtrar(\'todos\', this)">Todos</button>';
    categorias.forEach(c => {
        btnHtml += `<button class="btn-filtro" onclick="filtrar('${c.id}', this)">${c.nome}</button>`;
    });
    document.getElementById('filtros-lista').innerHTML = btnHtml;
    atualizarSelectsAdmin();
}

function atualizarSelectsAdmin() {
    const addCatEl = document.getElementById('add-cat');
    const editCatEl = document.getElementById('edit-cat');
    const lojaAdd = document.getElementById('add-loja') ? document.getElementById('add-loja').value : 'canetas';
    const lojaEdit = document.getElementById('edit-loja') ? document.getElementById('edit-loja').value : 'canetas';
    const prevAddCat = addCatEl ? addCatEl.value : '';
    const prevEditCat = editCatEl ? editCatEl.value : '';
    let selAdd = '', selEdit = '';
    getCategorias(lojaAdd).forEach(c => { selAdd += `<option value="${c.id}">${c.nome}</option>`; });
    getCategorias(lojaEdit).forEach(c => { selEdit += `<option value="${c.id}">${c.nome}</option>`; });
    if (addCatEl) {
        addCatEl.innerHTML = selAdd;
        if (prevAddCat && [...addCatEl.options].some(o => o.value === prevAddCat)) addCatEl.value = prevAddCat;
    }
    if (editCatEl) {
        editCatEl.innerHTML = selEdit;
        if (prevEditCat && [...editCatEl.options].some(o => o.value === prevEditCat)) editCatEl.value = prevEditCat;
    }
    atualizarFiltroGerenciar();
}

function atualizarFiltroGerenciar() {
    const lojaFiltro = document.getElementById('manage-loja-filter');
    const catFiltro = document.getElementById('manage-filter');
    if (!lojaFiltro || !catFiltro) return;
    let cats = [];
    if (lojaFiltro.value === 'canetas') cats = CATEGORIAS_CANETAS;
    else if (lojaFiltro.value === 'cyto') cats = CATEGORIAS_CYTO;
    else cats = [...CATEGORIAS_CANETAS, ...CATEGORIAS_CYTO];
    let h = '<option value="todos">Todas categorias</option>';
    cats.forEach(c => h += `<option value="${c.id}">${c.nome}</option>`);
    catFiltro.innerHTML = h;
}

function filtrar(cat, btn) {
    categoriaAtiva = cat;
    document.querySelectorAll('.btn-filtro').forEach(b => b.classList.remove('ativo'));
    if (btn) btn.classList.add('ativo');
    aplicarFiltros();
    document.getElementById('catalogo-anchor').scrollIntoView({behavior:'smooth', block:'start'});
}

function aplicarFiltros() {
    const termo = (document.getElementById('search-input').value || '').toLowerCase().trim();
    let visiveis = 0;
    document.querySelectorAll('#grade-produtos .card').forEach(card => {
        const matchCat = (categoriaAtiva === 'todos' || card.dataset.categoria === categoriaAtiva);
        const matchSearch = (!termo || card.querySelector('.card-nome').innerText.toLowerCase().includes(termo));
        if (matchCat && matchSearch) { card.style.display = 'block'; visiveis++; }
        else card.style.display = 'none';
    });
    document.getElementById('msg-vazio').style.display = visiveis === 0 ? 'block' : 'none';
}
