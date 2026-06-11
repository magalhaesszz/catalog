'use strict';

/* ==========================================
   OPERAÇÕES SUPABASE (CRUD)
   ==========================================
   Arquivo: js/supabase-ops.js
   Responsável por: inicializar cliente, ler/criar/editar/duplicar/excluir
   produtos no banco de dados
   ========================================== */

function inicializarSupabase() {
    if (typeof window.supabase === 'undefined') { setTimeout(inicializarSupabase, 300); return; }
    if (!CONFIG.url || !CONFIG.key) { setStatusConexao(false, 'config'); return; }
    try {
        supabaseClient = window.supabase.createClient(CONFIG.url, CONFIG.key);
        carregarProdutosSupabase();
    } catch (e) {
        setStatusConexao(false, 'erro');
    }
}

async function carregarProdutosSupabase() {
    if (!supabaseClient) return;
    try {
        const { data, error } = await supabaseClient.from(CONFIG.tabela).select('*').order('created_at', { ascending: false });
        if (error) throw error;
        produtosSupabase = data || [];
        setStatusConexao(true);
        renderTodosProdutos();
        atualizarDashboard();
        renderListaGerenciar();
    } catch (e) {
        setStatusConexao(false, 'erro');
    }
}

async function salvarProdutoSupabase() {
    if (!supabaseClient) { mostrarToast('Conecte ao Supabase!', 'error'); return; }
    const isAdmin = await verificarAdmin();
    if (!isAdmin) { mostrarToast('Faça login!', 'error'); fecharModal('modal-admin'); abrirModal('modal-login'); return; }

    const nome = document.getElementById('add-nome').value.trim();
    const preco = parseFloat(document.getElementById('add-preco').value);
    const img1 = document.getElementById('add-img1').value.trim();
    const img2 = document.getElementById('add-img2').value.trim();
    const img3 = document.getElementById('add-img3').value.trim();
    const desc = document.getElementById('add-desc').value.trim();
    const cat = document.getElementById('add-cat').value;
    const loja = document.getElementById('add-loja').value;

    if (!nome || !preco || !img1) { mostrarToast('Preencha nome, preço e imagem principal!', 'error'); return; }

    const idSeguro = Math.floor(Math.random() * 2000000000);
    const btn = document.getElementById('btn-salvar');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...';
    try {
        const { error } = await supabaseClient.from(CONFIG.tabela).insert([{ id: idSeguro, nome, preco, imagem: img1, imagem2: img2, imagem3: img3, descricao: desc, categoria: cat, loja, created_at: new Date().toISOString() }]);
        if (error) throw error;
        mostrarToast('Produto salvo!', 'success');
        ['add-nome','add-preco','add-img1','add-img2','add-img3','add-desc'].forEach(id => document.getElementById(id).value = '');
        atualizarPreview();
        await carregarProdutosSupabase();
    } catch (e) {
        mostrarToast('Erro: ' + e.message, 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-cloud-upload-alt"></i> &nbsp; SALVAR PRODUTO';
    }
}

function editarProduto(id) {
    const p = produtosSupabase.find(x => String(x.id) === String(id));
    if (!p) return;
    document.getElementById('edit-id').value = p.id;
    document.getElementById('edit-loja').value = p.loja || 'canetas';
    document.getElementById('edit-nome').value = p.nome;
    document.getElementById('edit-preco').value = p.preco;
    document.getElementById('edit-img1').value = p.imagem || '';
    document.getElementById('edit-img2').value = p.imagem2 || '';
    document.getElementById('edit-img3').value = p.imagem3 || '';
    document.getElementById('edit-desc').value = p.descricao || '';
    atualizarSelectsAdmin();
    setTimeout(() => { document.getElementById('edit-cat').value = p.categoria; }, 50);
    abrirModal('modal-editar');
}

async function atualizarProdutoSupabase() {
    const isAdmin = await verificarAdmin();
    if (!isAdmin) { mostrarToast('Faça login!', 'error'); return; }
    const id = document.getElementById('edit-id').value;
    try {
        const { error } = await supabaseClient.from(CONFIG.tabela).update({
            nome: document.getElementById('edit-nome').value.trim(),
            preco: parseFloat(document.getElementById('edit-preco').value),
            imagem: document.getElementById('edit-img1').value.trim(),
            imagem2: document.getElementById('edit-img2').value.trim(),
            imagem3: document.getElementById('edit-img3').value.trim(),
            descricao: document.getElementById('edit-desc').value.trim(),
            categoria: document.getElementById('edit-cat').value,
            loja: document.getElementById('edit-loja').value
        }).eq('id', id);
        if (error) throw error;
        mostrarToast('Atualizado!', 'success');
        fecharModal('modal-editar');
        await carregarProdutosSupabase();
    } catch (e) {
        mostrarToast('Erro: ' + e.message, 'error');
    }
}

async function duplicarProduto(id) {
    const isAdmin = await verificarAdmin();
    if (!isAdmin) { mostrarToast('Faça login!', 'error'); return; }
    const p = produtosSupabase.find(x => String(x.id) === String(id));
    if (!p) return;
    try {
        const novoId = Math.floor(Math.random() * 2000000000);
        const { error } = await supabaseClient.from(CONFIG.tabela).insert([{
            id: novoId,
            nome: p.nome + ' (cópia)',
            preco: p.preco,
            imagem: p.imagem,
            imagem2: p.imagem2 || '',
            imagem3: p.imagem3 || '',
            descricao: p.descricao,
            categoria: p.categoria,
            loja: p.loja || 'canetas',
            created_at: new Date().toISOString()
        }]);
        if (error) throw error;
        mostrarToast('Duplicado!', 'success');
        await carregarProdutosSupabase();
    } catch (e) {
        mostrarToast('Erro: ' + e.message, 'error');
    }
}

async function confirmarExclusao(id, nome) {
    if (!confirm(`Excluir "${nome}"?`)) return;
    const isAdmin = await verificarAdmin();
    if (!isAdmin) { mostrarToast('Faça login!', 'error'); return; }
    try {
        const { error } = await supabaseClient.from(CONFIG.tabela).delete().eq('id', id);
        if (error) throw error;
        mostrarToast('Excluído!', 'success');
        await carregarProdutosSupabase();
    } catch (e) {
        mostrarToast('Erro: ' + e.message, 'error');
    }
}
