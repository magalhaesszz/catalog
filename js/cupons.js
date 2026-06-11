'use strict';

/* ==========================================
   SISTEMA DE CUPONS
   ==========================================
   Arquivo: js/cupons.js
   Tipos: desconto em % OU frete grátis
   ========================================== */

let cupomAtivo = null;

// =====================
// VALIDAR CUPOM (checkout)
// =====================
async function aplicarCupom() {
    if (!supabaseClient) return;
    const codigo = document.getElementById('pg-cupom-input').value.trim().toUpperCase();
    if (!codigo) return pgErro('Digite um código de cupom.');

    const btn = document.getElementById('btn-aplicar-cupom');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

    try {
        const { data, error } = await supabaseClient
            .from('cupons')
            .select('*')
            .eq('codigo', codigo)
            .eq('ativo', true)
            .single();

        if (error || !data) throw new Error('Cupom inválido ou expirado.');
        if (data.usos_realizados >= data.limite_usos) throw new Error('Este cupom já atingiu o limite de usos.');

        cupomAtivo = data;
        document.getElementById('pg-erro').style.display = 'none';
        document.getElementById('pg-cupom-aplicado').style.display = 'flex';

        if (data.frete_gratis) {
            document.getElementById('pg-cupom-aplicado-txt').innerText = `"${data.codigo}" — Frete Grátis! 🚚`;
        } else {
            document.getElementById('pg-cupom-aplicado-txt').innerText = `"${data.codigo}" — ${data.desconto_pct}% de desconto`;
        }

        document.getElementById('pg-cupom-input').disabled = true;
        btn.style.display = 'none';
        pgAtualizarTotalFrete();

    } catch(e) {
        cupomAtivo = null;
        pgErro(e.message);
    } finally {
        btn.disabled = false;
        btn.innerHTML = 'Aplicar';
    }
}

function removerCupom() {
    cupomAtivo = null;
    document.getElementById('pg-cupom-input').value = '';
    document.getElementById('pg-cupom-input').disabled = false;
    document.getElementById('pg-cupom-aplicado').style.display = 'none';
    document.getElementById('btn-aplicar-cupom').style.display = 'inline-flex';
    pgAtualizarTotalFrete();
}

// =====================
// REGISTRAR USO
// =====================
async function registrarUsoCupom() {
    if (!cupomAtivo || !supabaseClient) return;
    try {
        await supabaseClient
            .from('cupons')
            .update({ usos_realizados: cupomAtivo.usos_realizados + 1 })
            .eq('id', cupomAtivo.id);
    } catch(e) {}
}

// =====================
// ADMIN — LISTAR CUPONS
// =====================
async function renderListaCupons() {
    if (!supabaseClient) return;
    const lista = document.getElementById('admin-cupons-lista');
    if (!lista) return;
    lista.innerHTML = '<p style="color:var(--text-muted); font-size:0.82rem;">Carregando...</p>';

    try {
        const { data, error } = await supabaseClient
            .from('cupons')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        if (!data || data.length === 0) {
            lista.innerHTML = '<p style="color:var(--text-muted); text-align:center; padding:var(--spacing-xl);"><i class="fas fa-ticket-alt" style="font-size:2rem; opacity:0.3; display:block; margin-bottom:8px;"></i>Nenhum cupom cadastrado</p>';
            return;
        }

        lista.innerHTML = data.map(c => {
            const usosRestantes = c.limite_usos - c.usos_realizados;
            const pct = Math.round((c.usos_realizados / c.limite_usos) * 100);
            const tipoBadge = c.frete_gratis
                ? `<span class="cupom-badge-frete"><i class="fas fa-truck"></i> Frete Grátis</span>`
                : `<span class="cupom-badge-desc">${c.desconto_pct}% OFF</span>`;

            return `
            <div class="cupom-item" id="cupom-${c.id}">
                <div class="cupom-item-top">
                    <div class="cupom-codigo">${escapeHTML(c.codigo)}</div>
                    <div style="display:flex; align-items:center; gap:8px;">
                        ${tipoBadge}
                        <span class="cupom-status ${c.ativo ? 'ativo' : 'inativo'}">${c.ativo ? 'Ativo' : 'Inativo'}</span>
                    </div>
                </div>
                <div class="cupom-usos-bar-wrap">
                    <div class="cupom-usos-info">
                        <span><i class="fas fa-users"></i> ${c.usos_realizados} de ${c.limite_usos} usos</span>
                        <span>${usosRestantes} restante${usosRestantes !== 1 ? 's' : ''}</span>
                    </div>
                    <div class="cupom-usos-bar">
                        <div class="cupom-usos-fill" style="width:${pct}%"></div>
                    </div>
                </div>
                <div class="cupom-item-actions">
                    <button class="btn-mini ${c.ativo ? 'btn-delete-mini' : 'btn-edit-mini'}"
                        onclick="toggleCupom('${c.id}', ${c.ativo})"
                        title="${c.ativo ? 'Desativar' : 'Ativar'}">
                        <i class="fas fa-${c.ativo ? 'pause' : 'play'}"></i>
                    </button>
                    <button class="btn-mini btn-delete-mini"
                        onclick="excluirCupom('${c.id}', '${escapeHTML(c.codigo)}')"
                        title="Excluir">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>`;
        }).join('');

    } catch(e) {
        lista.innerHTML = `<p style="color:var(--error-color);">Erro: ${escapeHTML(e.message)}</p>`;
    }
}

// =====================
// ADMIN — CRIAR CUPOM
// =====================
async function criarCupom() {
    const codigo      = document.getElementById('novo-cupom-codigo').value.trim().toUpperCase();
    const freteGratis = document.getElementById('novo-cupom-frete').checked;
    const pct         = freteGratis ? 0 : parseInt(document.getElementById('novo-cupom-pct').value);
    const limite      = parseInt(document.getElementById('novo-cupom-limite').value);

    if (!codigo)               return mostrarToast('Informe o código do cupom.', 'error');
    if (!freteGratis && (!pct || pct < 1 || pct > 100)) return mostrarToast('Desconto deve ser entre 1% e 100%.', 'error');
    if (!limite || limite < 1) return mostrarToast('Limite deve ser pelo menos 1.', 'error');

    const isAdmin = await verificarAdmin();
    if (!isAdmin) return mostrarToast('Faça login primeiro.', 'error');

    const btn = document.getElementById('btn-criar-cupom');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Criando...';

    try {
        const { error } = await supabaseClient
            .from('cupons')
            .insert([{ codigo, desconto_pct: pct, limite_usos: limite, frete_gratis: freteGratis }]);

        if (error) {
            if (error.code === '23505') throw new Error('Esse código já existe.');
            throw error;
        }

        mostrarToast(`Cupom "${codigo}" criado!`, 'success');
        document.getElementById('novo-cupom-codigo').value = '';
        document.getElementById('novo-cupom-pct').value = '';
        document.getElementById('novo-cupom-limite').value = '';
        document.getElementById('novo-cupom-frete').checked = false;
        toggleTipoCupom();
        renderListaCupons();

    } catch(e) {
        mostrarToast('Erro: ' + e.message, 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-plus"></i> Criar Cupom';
    }
}

// Mostra/esconde campo de % conforme tipo selecionado
function toggleTipoCupom() {
    const freteGratis = document.getElementById('novo-cupom-frete').checked;
    const campoDesc   = document.getElementById('campo-desconto-pct');
    if (campoDesc) campoDesc.style.display = freteGratis ? 'none' : 'block';
}

// =====================
// ADMIN — ATIVAR/DESATIVAR
// =====================
async function toggleCupom(id, ativoAtual) {
    const isAdmin = await verificarAdmin();
    if (!isAdmin) return mostrarToast('Faça login primeiro.', 'error');
    try {
        const { error } = await supabaseClient
            .from('cupons')
            .update({ ativo: !ativoAtual })
            .eq('id', id);
        if (error) throw error;
        mostrarToast(ativoAtual ? 'Cupom desativado.' : 'Cupom ativado!', 'success');
        renderListaCupons();
    } catch(e) {
        mostrarToast('Erro: ' + e.message, 'error');
    }
}

// =====================
// ADMIN — EXCLUIR
// =====================
async function excluirCupom(id, codigo) {
    if (!confirm(`Excluir o cupom "${codigo}"?`)) return;
    const isAdmin = await verificarAdmin();
    if (!isAdmin) return mostrarToast('Faça login primeiro.', 'error');
    try {
        const { error } = await supabaseClient.from('cupons').delete().eq('id', id);
        if (error) throw error;
        mostrarToast('Cupom excluído.', 'success');
        renderListaCupons();
    } catch(e) {
        mostrarToast('Erro: ' + e.message, 'error');
    }
}