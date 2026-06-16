'use strict';

/* ==========================================
   LÓGICA DE PAGAMENTO PIX — MODAL INTERNO
   ==========================================
   Arquivo: js/pagamento.js
   Etapas: 1) Formulário  2) Frete  3) Pix  4) Sucesso
   ========================================== */

const TELEFONE_PIX    = "5551994441493";
const SUPABASE_URL_P  = "https://vlosjvsxjmhksncmqmpk.supabase.co";
const SUPABASE_ANON_P = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZsb3NqdnN4am1oa3NuY21xbXBrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzczMjU0ODEsImV4cCI6MjA5MjkwMTQ4MX0.GFQC14TlZDIaubZL8iKYPOrF46tamDXFlnPJAxZN2Aw";
const EDGE_URL_PIX    = `${SUPABASE_URL_P}/functions/v1/criar-pix`;
const CEP_ORIGEM      = "05596020";
const TIMER_SEG       = 600; // 10 minutos

// Estado interno do modal
let pgDados = {};        // dados do formulário
let pgFrete = 0;         // valor do frete em R$
let pgDepositId = null;
let pgPolling = null;
let pgCountdown = null;
let pgSegRestantes = TIMER_SEG;

// =====================
// ABRE O MODAL
// =====================
function abrirModalPagamento() {
    pgDados = {}; pgFrete = 0; pgDepositId = null;
    pgSegRestantes = TIMER_SEG;
    if (pgPolling)   { clearInterval(pgPolling);   pgPolling = null; }
    if (pgCountdown) { clearInterval(pgCountdown); pgCountdown = null; }
    irParaEtapa('formulario');
    abrirModal('modal-pagamento');
}

// =====================
// NAVEGAÇÃO DE ETAPAS
// =====================
function irParaEtapa(etapa) {
    ['formulario','frete','pix','sucesso','expirado'].forEach(e => {
        const el = document.getElementById('pg-' + e);
        if (el) el.style.display = 'none';
    });
    const alvo = document.getElementById('pg-' + etapa);
    if (alvo) alvo.style.display = 'block';

    // atualiza barra de progresso
    const steps = ['formulario','frete','pix'];
    const idx = steps.indexOf(etapa);
    document.querySelectorAll('.pg-step').forEach((s, i) => {
        s.classList.toggle('active', i <= idx);
        s.classList.toggle('done', i < idx);
    });
}

// =====================
// ETAPA 1: FORMULÁRIO
// =====================
function pgAvancarFormulario() {
    const nome  = document.getElementById('pg-nome').value.trim();
    const cpf   = document.getElementById('pg-cpf').value.replace(/\D/g,'');
    const idade = parseInt(document.getElementById('pg-idade').value);
    const tel   = document.getElementById('pg-tel').value.replace(/\D/g,'');
    const termo = document.getElementById('pg-termo').checked;

    if (!nome)              return pgErro('Informe seu nome completo.');
    if (cpf.length !== 11)  return pgErro('CPF inválido. Digite os 11 dígitos.');
    if (!idade || isNaN(idade)) return pgErro('Informe sua idade.');
    if (idade < 18)         return pgErro('Você precisa ter 18 anos ou mais para comprar.');
    if (tel.length < 10)    return pgErro('Informe um número de telefone válido.');
    if (!termo)             return pgErro('Você precisa aceitar os termos para continuar.');

    pgDados = { nome, cpf, idade, tel };
    document.getElementById('pg-erro').style.display = 'none';
    irParaEtapa('frete');
}

// =====================
// ETAPA 2: FRETE
// =====================
async function pgBuscarCEP() {
    const cep = document.getElementById('pg-cep').value.replace(/\D/g,'');
    if (cep.length !== 8) return pgErro('CEP inválido.');

    const btn = document.getElementById('btn-buscar-cep');
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    btn.disabled = true;

    try {
        const resp = await fetch(`https://brasilapi.com.br/api/cep/v1/${cep}`);
        if (!resp.ok) throw new Error('CEP não encontrado.');
        const data = await resp.json();
        document.getElementById('pg-rua').value    = data.street || '';
        document.getElementById('pg-bairro').value = data.neighborhood || '';
        document.getElementById('pg-cidade').value = data.city || '';
        document.getElementById('pg-estado').value = data.state || '';
        document.getElementById('pg-endereco-resultado').style.display = 'block';
        document.getElementById('pg-erro').style.display = 'none';
        pgCalcularFrete(cep);
    } catch(e) {
        pgErro(e.message);
    } finally {
        btn.innerHTML = '<i class="fas fa-search"></i>';
        btn.disabled = false;
    }
}

function pgCalcularFrete(cepDestino) {
    // Cálculo estimado por região (baseado no prefixo do CEP)
    const prefixo = parseInt(cepDestino.slice(0,5));
    const origem  = parseInt(CEP_ORIGEM.slice(0,5));
    const diff    = Math.abs(prefixo - origem);

    let pac, sedex;
    if (diff < 1000) {           // SP capital / grande SP
        pac = 18.90; sedex = 28.90;
    } else if (diff < 5000) {    // Sul / Sudeste
        pac = 24.90; sedex = 38.90;
    } else if (diff < 15000) {   // Centro-Oeste / Nordeste
        pac = 32.90; sedex = 52.90;
    } else {                     // Norte / extremos
        pac = 42.90; sedex = 68.90;
    }

    document.getElementById('pg-frete-pac').innerText   = `R$ ${pac.toFixed(2).replace('.',',')}`;
    document.getElementById('pg-frete-sedex').innerText = `R$ ${sedex.toFixed(2).replace('.',',')}`;
    document.getElementById('pg-frete-opcoes').style.display = 'block';

    // Seleciona PAC por padrão
    document.getElementById('frete-pac').checked = true;
    pgFrete = pac;
    pgAtualizarTotalFrete();

    document.querySelectorAll('input[name="frete-tipo"]').forEach(radio => {
        radio.addEventListener('change', () => {
            pgFrete = radio.value === 'pac' ? pac : sedex;
            pgAtualizarTotalFrete();
        });
    });
}

function pgAtualizarTotalFrete() {
    let subtotal = 0;
    carrinho.forEach(c => subtotal += c.preco * c.qtd);

    const freteGratis  = cupomAtivo && cupomAtivo.frete_gratis;
    const desconto     = cupomAtivo && !freteGratis ? (subtotal * cupomAtivo.desconto_pct / 100) : 0;
    const freteReal    = freteGratis ? 0 : pgFrete;
    const total        = subtotal - desconto + freteReal;

    document.getElementById('pg-subtotal').innerText    = formatarPreco(subtotal);
    document.getElementById('pg-frete-val').innerHTML   = freteGratis
        ? '<span style="color:#10b981; font-weight:800;">GRÁTIS 🚚</span>'
        : formatarPreco(pgFrete);
    document.getElementById('pg-total-final').innerText = formatarPreco(total);

    const linhaDesconto = document.getElementById('pg-linha-desconto');
    if (linhaDesconto) {
        if (desconto > 0) {
            linhaDesconto.style.display = 'flex';
            document.getElementById('pg-desconto-val').innerText =
                `− ${formatarPreco(desconto)} (${cupomAtivo.desconto_pct}%)`;
        } else {
            linhaDesconto.style.display = 'none';
        }
    }
}

function pgAvancarFrete() {
    const cep    = document.getElementById('pg-cep').value.replace(/\D/g,'');
    const numero = document.getElementById('pg-numero').value.trim();
    if (cep.length !== 8)   return pgErro('Busque um CEP válido primeiro.');
    if (!numero)             return pgErro('Informe o número do endereço.');
    if (!document.getElementById('pg-frete-opcoes') ||
        document.getElementById('pg-frete-opcoes').style.display === 'none')
        return pgErro('Calcule o frete primeiro.');

    const tipoFrete = document.querySelector('input[name="frete-tipo"]:checked').value;
    pgDados.endereco = {
        cep,
        rua:        document.getElementById('pg-rua').value,
        numero,
        complemento: document.getElementById('pg-complemento').value,
        bairro:     document.getElementById('pg-bairro').value,
        cidade:     document.getElementById('pg-cidade').value,
        estado:     document.getElementById('pg-estado').value,
        frete_tipo: tipoFrete,
        frete_valor: pgFrete
    };
    document.getElementById('pg-erro').style.display = 'none';
    irParaEtapa('pix');
    pgGerarPix();
}

// =====================
// ETAPA 3: PIX
// =====================
async function pgGerarPix() {
    document.getElementById('pg-pix-loading').style.display = 'block';
    document.getElementById('pg-pix-conteudo').style.display = 'none';

    let subtotal = 0;
    carrinho.forEach(c => subtotal += c.preco * c.qtd);
    const freteGratis  = cupomAtivo && cupomAtivo.frete_gratis;
    const desconto     = cupomAtivo && !freteGratis ? (subtotal * cupomAtivo.desconto_pct / 100) : 0;
    const freteReal    = freteGratis ? 0 : pgFrete;
    const total        = subtotal - desconto + freteReal;
    const amount_cents = Math.round(total * 100);

    try {
        const idempotency_key = 'cdp-' + Date.now() + '-' + Math.random().toString(36).slice(2,8);
        const resp = await fetch(EDGE_URL_PIX, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_ANON_P,
                'Authorization': `Bearer ${SUPABASE_ANON_P}`
            },
            body: JSON.stringify({ amount_cents, idempotency_key })
        });
        const data = await resp.json();
        if (!resp.ok) throw new Error(data.error || 'Erro ao gerar Pix');

        pgDepositId = data.id;
        await registrarUsoCupom();

        // Renderiza resumo
        let resumoHtml = '';
        carrinho.forEach(c => {
            resumoHtml += `<div class="pg-resumo-item">
                <span><span class="pg-qtd">${c.qtd}x</span>${escapeHTML(c.nome)}</span>
                <span>${formatarPreco(c.preco * c.qtd)}</span>
            </div>`;
        });
        resumoHtml += `<div class="pg-resumo-item" style="color:var(--text-muted)">
            <span><i class="fas fa-truck" style="margin-right:5px;"></i>Frete (${pgDados.endereco.frete_tipo.toUpperCase()})</span>
            <span>${formatarPreco(pgFrete)}</span>
        </div>`;
        document.getElementById('pg-resumo-itens').innerHTML = resumoHtml;
        document.getElementById('pg-total-pix').innerText = formatarPreco(total);

        // QR e código
        document.getElementById('pg-qr-img').src = data.qr_code_base64;
        document.getElementById('pg-pix-code').value = data.pix_code;

        document.getElementById('pg-pix-loading').style.display = 'none';
        document.getElementById('pg-pix-conteudo').style.display = 'block';

        pgIniciarTimer();
        pgIniciarPolling(amount_cents);

    } catch(e) {
        pgErro('Erro ao gerar Pix: ' + e.message);
        document.getElementById('pg-pix-loading').style.display = 'none';
    }
}

function pgCopiarCodigo() {
    const val = document.getElementById('pg-pix-code').value;
    navigator.clipboard.writeText(val).then(() => {
        const btn = document.querySelector('.pg-btn-copiar');
        btn.innerHTML = '<i class="fas fa-check"></i> Copiado!';
        setTimeout(() => { btn.innerHTML = '<i class="fas fa-copy"></i> Copiar'; }, 2000);
    });
}

// =====================
// TIMER
// =====================
function pgIniciarTimer() {
    pgSegRestantes = TIMER_SEG;
    pgAtualizarTimer();
    pgCountdown = setInterval(() => {
        pgSegRestantes--;
        pgAtualizarTimer();
        if (pgSegRestantes <= 120) document.getElementById('pg-timer-badge').classList.add('urgente');
        if (pgSegRestantes <= 0) {
            clearInterval(pgCountdown);
            clearInterval(pgPolling);
            irParaEtapa('expirado');
        }
    }, 1000);
}

function pgAtualizarTimer() {
    const m = Math.floor(pgSegRestantes / 60).toString().padStart(2,'0');
    const s = (pgSegRestantes % 60).toString().padStart(2,'0');
    document.getElementById('pg-timer').innerText = `${m}:${s}`;
}

// =====================
// POLLING
// =====================
function pgIniciarPolling(amount_cents) {
    pgPolling = setInterval(async () => {
        if (!pgDepositId) return;
        try {
            const resp = await fetch(`${EDGE_URL_PIX}?id=${pgDepositId}`, {
                headers: { 'apikey': SUPABASE_ANON_P, 'Authorization': `Bearer ${SUPABASE_ANON_P}` }
            });
            if (resp.ok) {
                const data = await resp.json();
                if (data.status === 'confirmed') {
                    clearInterval(pgPolling);
                    clearInterval(pgCountdown);
                    pgMostrarSucesso(amount_cents);
                }
            }
        } catch(e) {}
    }, 3000);
}

// =====================
// SUCESSO
// =====================
function pgMostrarSucesso(total_cents) {
    const nomes = carrinho.map(c => `${c.qtd}x ${c.nome}`).join(', ');
    const total = total_cents / 100;
    const end   = pgDados.endereco;
    const texto = `Olá! Acabei de realizar o pagamento via Pix e quero dar continuidade ao meu pedido.\n\n` +
                  `*Cliente:* ${pgDados.nome}\n` +
                  `*Produtos:* ${nomes}\n` +
                  `*Frete:* ${end.frete_tipo.toUpperCase()} — ${formatarPreco(pgFrete)}\n` +
                  `*Total pago:* ${formatarPreco(total)}\n` +
                  `*Endereço:* ${end.rua}, ${end.numero}${end.complemento ? ', '+end.complemento : ''} — ${end.bairro}, ${end.cidade}/${end.estado} — CEP ${end.cep}\n\n` +
                  `Aguardo confirmação!`;
    document.getElementById('pg-btn-wpp').href = `https://wa.me/${TELEFONE_PIX}?text=${encodeURIComponent(texto)}`;
    if (typeof registrarVenda === 'function') registrarVenda(carrinho, total);
    carrinho = [];
    atualizarCarrinhoUI();
    irParaEtapa('sucesso');
}

// =====================
// HELPERS
// =====================
function pgErro(msg) {
    const el = document.getElementById('pg-erro');
    el.innerText = msg;
    el.style.display = 'block';
}

function pgReiniciar() {
    fecharModal('modal-pagamento');
    setTimeout(() => abrirModalPagamento(), 300);
}