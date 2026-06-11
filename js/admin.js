'use strict';

/* ==========================================
   PAINEL ADMIN
   ==========================================
   Arquivo: js/admin.js
   Responsável por: abas do admin, dashboard, preview,
   lista de gerenciar, formulário de configurações
   ========================================== */

function trocarAbaAdmin(tab) {
    document.querySelectorAll('.admin-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
    document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
    const el = document.getElementById('admin-' + tab);
    if (el) el.classList.add('active');
    if (tab === 'configuracoes') carregarFormConfiguracao();
    if (tab === 'gerenciar') renderListaGerenciar();
    if (tab === 'dashboard') atualizarDashboard();
}

function atualizarDashboard() {
    const c = produtosSupabase.filter(p => (p.loja || 'canetas') === 'canetas').length;
    const y = produtosSupabase.filter(p => p.loja === 'cyto').length;
    const f = PRODUTOS_FIXOS_CANETAS.length + PRODUTOS_FIXOS_CYTO.length;
    document.getElementById('stat-canetas').innerText = c;
    document.getElementById('stat-cyto').innerText = y;
    document.getElementById('stat-fixos').innerText = f;
    document.getElementById('stat-total').innerText = c + y + f;
    const rec = document.getElementById('recent-products');
    const slice = produtosSupabase.slice(0, 5);
    if (slice.length === 0) {
        rec.innerHTML = '<p style="color:var(--text-muted); text-align:center; padding:var(--spacing-md);">Nenhum produto cadastrado</p>';
    } else {
        rec.innerHTML = slice.map(p => {
            const lojaTag = (p.loja || 'canetas') === 'cyto' ? '<span style="background:rgba(220,38,38,0.15); color:#dc2626; padding:1px 6px; border-radius:4px; font-size:0.6rem;">CYTO</span>' : '<span style="background:rgba(212,175,55,0.15); color:#d4af37; padding:1px 6px; border-radius:4px; font-size:0.6rem;">CANETAS</span>';
            return `<div class="recent-item"><img src="${escapeHTML(p.imagem)}" onerror="this.src='https://via.placeholder.com/40'"><div class="recent-item-info"><strong>${escapeHTML(p.nome)}</strong><small>${formatarPreco(p.preco)} ${lojaTag}</small></div></div>`;
        }).join('');
    }
}

function atualizarPreview() {
    const nome = document.getElementById('add-nome').value || 'Nome do produto';
    const preco = document.getElementById('add-preco').value || '0';
    const img = document.getElementById('add-img1').value;
    const cat = document.getElementById('add-cat').value;
    const loja = document.getElementById('add-loja').value;
    const c = obterCorCat(cat, loja);
    document.getElementById('prev-nome').innerText = nome;
    document.getElementById('prev-preco').innerText = 'R$ ' + parseFloat(preco).toFixed(2).replace('.', ',');
    document.getElementById('prev-tag').innerText = c.nome.toUpperCase();
    document.getElementById('prev-tag').style.background = c.cor;
    const i = document.getElementById('prev-img');
    const ph = document.getElementById('prev-placeholder');
    if (img) { i.src = img; i.style.display = 'block'; ph.style.display = 'none'; }
    else { i.style.display = 'none'; ph.style.display = 'block'; }
    atualizarSelectsAdmin();
}

function renderListaGerenciar() {
    const termo = (document.getElementById('manage-search').value || '').toLowerCase();
    const filtroCat = document.getElementById('manage-filter').value;
    const filtroLoja = document.getElementById('manage-loja-filter').value;
    let filtrados = produtosSupabase;
    if (filtroLoja !== 'todas') filtrados = filtrados.filter(p => (p.loja || 'canetas') === filtroLoja);
    if (filtroCat !== 'todos') filtrados = filtrados.filter(p => p.categoria === filtroCat);
    if (termo) filtrados = filtrados.filter(p => p.nome.toLowerCase().includes(termo));
    document.getElementById('manage-count').innerText = filtrados.length;
    const l = document.getElementById('lista-produtos');
    if (!filtrados.length) {
        l.innerHTML = '<p style="text-align:center; color:var(--text-muted); padding:var(--spacing-2xl);"><i class="fas fa-box-open" style="font-size:2rem; margin-bottom:var(--spacing-md); display:block; opacity:0.4;"></i>Nenhum produto encontrado</p>';
        return;
    }
    l.innerHTML = filtrados.map(p => {
        const c = obterCorCat(p.categoria, p.loja || 'canetas');
        const lojaClass = (p.loja || 'canetas') === 'cyto' ? 'loja-tag-cyto' : 'loja-tag-canetas';
        const lojaText = (p.loja || 'canetas') === 'cyto' ? '⚕️ CYTO' : '🍁 CANETAS';
        return `<div class="produto-item"><img src="${escapeHTML(p.imagem)}" onerror="this.src='https://via.placeholder.com/56'"><div class="produto-item-info"><strong>${escapeHTML(p.nome)}</strong><small><span class="produto-item-loja-tag ${lojaClass}">${lojaText}</span> <span class="produto-item-cat-tag" style="background:${c.cor}20; color:${c.cor};">${c.nome}</span> ${formatarPreco(p.preco)}</small></div><div class="produto-item-actions"><button class="btn-mini btn-edit-mini" onclick="editarProduto('${p.id}')" title="Editar"><i class="fas fa-edit"></i></button><button class="btn-mini btn-duplicate-mini" onclick="duplicarProduto('${p.id}')" title="Duplicar"><i class="fas fa-copy"></i></button><button class="btn-mini btn-delete-mini" onclick="confirmarExclusao('${p.id}','${escapeHTML(p.nome).replace(/'/g,'')}')" title="Excluir"><i class="fas fa-trash"></i></button></div></div>`;
    }).join('');
}

function carregarFormConfiguracao() {
    document.getElementById('cfg-url').value = CONFIG.url;
    document.getElementById('cfg-key').value = CONFIG.key;
    document.getElementById('cfg-tabela').value = CONFIG.tabela;
}

function salvarConfiguracao() {
    CONFIG = {
        url: document.getElementById('cfg-url').value.trim(),
        key: document.getElementById('cfg-key').value.trim(),
        tabela: document.getElementById('cfg-tabela').value.trim() || 'produtos'
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(CONFIG));
    mostrarToast('Configuração salva! Recarregando...', 'success');
    setTimeout(() => location.reload(), 1500);
}

async function testarConexao() {
    if (!supabaseClient) { mostrarToast('Cliente não inicializado!', 'error'); return; }
    try {
        const { error } = await supabaseClient.from(CONFIG.tabela).select('id').limit(1);
        if (error) throw error;
        mostrarToast('Conexão OK ✓', 'success');
    } catch (e) {
        mostrarToast('Erro: ' + e.message, 'error');
    }
}

function recarregarTudo() {
    mostrarToast('Recarregando dados...', 'info');
    carregarProdutosSupabase();
}

function setStatusConexao(online, msg) {
    conexaoOK = online;
    const ind = document.getElementById('conn-indicator');
    ind.className = 'connection-indicator ' + (online ? 'online' : 'offline');
    document.getElementById('conn-text').innerText = online ? 'conectado' : (msg || 'offline');
    ind.classList.add('show');
    if (online) setTimeout(() => ind.classList.remove('show'), 3000);
    const ab = document.getElementById('admin-status');
    if (ab) {
        ab.className = 'status-badge ' + (online ? 'online' : 'offline');
        document.getElementById('admin-status-txt').innerText = online ? 'Conectado' : 'Offline';
    }
}
