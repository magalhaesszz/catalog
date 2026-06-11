'use strict';

/* ==========================================
   AUTENTICAÇÃO (LOGIN / LOGOUT)
   ==========================================
   Arquivo: js/auth.js
   Responsável por: login do admin via Supabase Auth
   ========================================== */

async function fazerLogin() {
    const email = document.getElementById('admin-email').value.trim();
    const senha = document.getElementById('admin-senha').value;
    if (!email || !senha) { mostrarToast('Preencha todos os campos!', 'error'); return; }
    if (!supabaseClient) { mostrarToast('Aguarde a conexão.', 'error'); return; }
    const btn = document.getElementById('btn-login');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Entrando...';
    try {
        const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password: senha });
        if (error) throw error;
        if (data && data.user) {
            mostrarToast('Bem-vindo!', 'success');
            fecharModal('modal-login');
            document.getElementById('admin-email').value = '';
            document.getElementById('admin-senha').value = '';
            abrirModal('modal-admin');
            atualizarDashboard();
            renderListaGerenciar();
        }
    } catch (e) {
        mostrarToast('Credenciais inválidas', 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = 'ENTRAR NO PAINEL';
    }
}

async function fazerLogout() {
    if (supabaseClient) await supabaseClient.auth.signOut();
    fecharModal('modal-admin');
    mostrarToast('Você saiu', 'info');
}

async function verificarAdmin() {
    if (!supabaseClient) return false;
    const { data } = await supabaseClient.auth.getUser();
    return data && data.user;
}
