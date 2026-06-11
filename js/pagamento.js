'use strict';

/* ==========================================
   LÓGICA DE PAGAMENTO PIX
   ==========================================
   Arquivo: js/pagamento.js
   Usado em: pagamentos.html
   ========================================== */

const TELEFONE_WPP    = "5551994441493";
const SUPABASE_URL    = "https://vlosjvsxjmhksncmqmpk.supabase.co";
const SUPABASE_ANON   = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZsb3NqdnN4am1oa3NuY21xbXBrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzczMjU0ODEsImV4cCI6MjA5MjkwMTQ4MX0.GFQC14TlZDIaubZL8iKYPOrF46tamDXFlnPJAxZN2Aw";
const EDGE_URL        = `${SUPABASE_URL}/functions/v1/criar-pix`;
const TIMER_MINUTOS   = 10;
const POLL_INTERVALO  = 3000; // ms

let depositId     = null;
let pollingTimer  = null;
let countdownTimer = null;
let segundosRestantes = TIMER_MINUTOS * 60;
let carrinhoItens = [];

// =====================
// INICIALIZAÇÃO
// =====================
document.addEventListener('DOMContentLoaded', () => {
    const dados = lerCarrinhoURL();
    if (!dados || dados.itens.length === 0) {
        mostrarErro('Carrinho vazio ou link inválido. Volte à loja e tente novamente.');
        return;
    }
    carrinhoItens = dados.itens;
    const loja = dados.loja || 'canetas';
    document.getElementById('logo-titulo').innerText =
        loja === 'cyto' ? '⚕️ Cyto' : '🍁 Canetas da Paz';
    gerarPix(dados.total_cents, dados.itens);
});

// =====================
// LÊ DADOS DA URL
// =====================
function lerCarrinhoURL() {
    try {
        const params = new URLSearchParams(window.location.search);
        const raw = params.get('dados');
        if (!raw) return null;
        return JSON.parse(decodeURIComponent(raw));
    } catch(e) {
        return null;
    }
}

// =====================
// GERA PIX
// =====================
async function gerarPix(amount_cents, itens) {
    mostrarTela('loading');
    try {
        const idempotency_key = 'cdp-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8);
        const resp = await fetch(EDGE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_ANON,
                'Authorization': `Bearer ${SUPABASE_ANON}`
            },
            body: JSON.stringify({ amount_cents, idempotency_key })
        });
        const data = await resp.json();
        if (!resp.ok) throw new Error(data.error || 'Erro ao gerar Pix');

        depositId = data.id;
        renderizarPix(data, itens, amount_cents);
        iniciarTimer();
        iniciarPolling();

    } catch(e) {
        mostrarErro(e.message);
    }
}

// =====================
// RENDERIZA TELA PIX
// =====================
function renderizarPix(data, itens, total_cents) {
    // QR Code
    document.getElementById('qr-img').src = data.qr_code_base64;
    // Código copia-e-cola
    document.getElementById('pix-code').value = data.pix_code;

    // Resumo dos itens
    let html = '';
    itens.forEach(item => {
        html += `<div class="resumo-item">
            <span><span class="qtd">${item.qtd}x</span>${escHTML(item.nome)}</span>
            <span>${formatReal(item.preco * item.qtd)}</span>
        </div>`;
    });
    document.getElementById('resumo-itens').innerHTML = html;
    document.getElementById('resumo-total-valor').innerText = formatReal(total_cents / 100);

    mostrarTela('pix');
}

// =====================
// TIMER 10 MINUTOS
// =====================
function iniciarTimer() {
    atualizarDisplayTimer();
    countdownTimer = setInterval(() => {
        segundosRestantes--;
        atualizarDisplayTimer();
        if (segundosRestantes <= 0) {
            clearInterval(countdownTimer);
            clearInterval(pollingTimer);
            mostrarTela('expirado');
        }
        // Fica vermelho nos últimos 2 minutos
        if (segundosRestantes <= 120) {
            document.getElementById('timer-badge').classList.add('urgente');
        }
    }, 1000);
}

function atualizarDisplayTimer() {
    const m = Math.floor(segundosRestantes / 60).toString().padStart(2, '0');
    const s = (segundosRestantes % 60).toString().padStart(2, '0');
    document.getElementById('timer-display').innerText = `${m}:${s}`;
}

// =====================
// POLLING DE STATUS
// =====================
function iniciarPolling() {
    pollingTimer = setInterval(async () => {
        if (!depositId) return;
        try {
            const resp = await fetch(`${SUPABASE_URL}/functions/v1/criar-pix?id=${depositId}`, {
                headers: {
                    'apikey': SUPABASE_ANON,
                    'Authorization': `Bearer ${SUPABASE_ANON}`
                }
            });
            // fallback: consulta direto na pix.direct via edge (reusa o endpoint com GET)
            if (resp.ok) {
                const data = await resp.json();
                if (data.status === 'confirmed') {
                    clearInterval(pollingTimer);
                    clearInterval(countdownTimer);
                    mostrarSucesso();
                }
            }
        } catch(e) {
            // silencioso, tenta de novo no próximo ciclo
        }
    }, POLL_INTERVALO);
}

// =====================
// TELA DE SUCESSO
// =====================
function mostrarSucesso() {
    const nomes = carrinhoItens.map(i => `${i.qtd}x ${i.nome}`).join(', ');
    const total = carrinhoItens.reduce((s, i) => s + i.preco * i.qtd, 0);
    const texto = `Olá! Acabei de realizar o pagamento via Pix e quero dar continuidade ao meu pedido.\n\n*Produtos:* ${nomes}\n*Total pago:* ${formatReal(total)}\n\nAguardo confirmação!`;
    document.getElementById('btn-whatsapp').href =
        `https://wa.me/${TELEFONE_WPP}?text=${encodeURIComponent(texto)}`;
    mostrarTela('sucesso');
}

// =====================
// COPIAR CÓDIGO PIX
// =====================
function copiarCodigo() {
    const input = document.getElementById('pix-code');
    navigator.clipboard.writeText(input.value).then(() => {
        const btn = document.querySelector('.btn-copiar');
        btn.innerHTML = '<i class="fas fa-check"></i> Copiado!';
        setTimeout(() => { btn.innerHTML = '<i class="fas fa-copy"></i> Copiar'; }, 2000);
    });
}

// =====================
// HELPERS
// =====================
function mostrarTela(tela) {
    ['loading','pix','sucesso','expirado','erro'].forEach(t => {
        document.getElementById('tela-' + t).style.display = 'none';
    });
    document.getElementById('tela-' + tela).style.display = 'block';
}

function mostrarErro(msg) {
    document.getElementById('msg-erro').innerText = msg;
    mostrarTela('erro');
}

function formatReal(valor) {
    return 'R$ ' + parseFloat(valor).toFixed(2).replace('.', ',');
}

function escHTML(str) {
    if (!str) return '';
    return String(str).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
