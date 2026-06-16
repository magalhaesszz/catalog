'use strict';

/* ==========================================
   EXTRAS
   Arquivo: js/extras.js
   — Frete grátis automático acima de R$300
   — Notificação social proof ao vivo
   — Modo escuro / claro
   ========================================== */

// =====================
// FRETE GRÁTIS +R$300
// =====================
const FRETE_GRATIS_MINIMO = 300;

function verificarFreteGratis() {
    let total = 0;
    carrinho.forEach(c => total += c.preco * c.qtd);
    return total >= FRETE_GRATIS_MINIMO;
}

// Sobrescreve pgAtualizarTotalFrete para incluir frete grátis automático
const _pgAtualizarTotalFreteOriginal = window.pgAtualizarTotalFrete;

function pgAtualizarTotalFreteComBonus() {
    let subtotal = 0;
    carrinho.forEach(c => subtotal += c.preco * c.qtd);

    const freteGratisCupom  = cupomAtivo && cupomAtivo.frete_gratis;
    const freteGratisAuto   = subtotal >= FRETE_GRATIS_MINIMO;
    const freteGratis       = freteGratisCupom || freteGratisAuto;

    const desconto     = cupomAtivo && !freteGratisCupom ? (subtotal * cupomAtivo.desconto_pct / 100) : 0;
    const freteReal    = freteGratis ? 0 : pgFrete;
    const total        = subtotal - desconto + freteReal;

    const elSubtotal   = document.getElementById('pg-subtotal');
    const elFreteVal   = document.getElementById('pg-frete-val');
    const elTotalFinal = document.getElementById('pg-total-final');
    const elDesconto   = document.getElementById('pg-linha-desconto');
    const elDescontoVal= document.getElementById('pg-desconto-val');

    if (elSubtotal)   elSubtotal.innerText = formatarPreco(subtotal);
    if (elFreteVal)   elFreteVal.innerHTML = freteGratis
        ? '<span style="color:#22a05a; font-weight:800;">GRÁTIS 🚚</span>'
        : formatarPreco(pgFrete);
    if (elTotalFinal) elTotalFinal.innerText = formatarPreco(total);

    if (elDesconto) {
        if (desconto > 0) {
            elDesconto.style.display = 'flex';
            if (elDescontoVal) elDescontoVal.innerText = `− ${formatarPreco(desconto)} (${cupomAtivo.desconto_pct}%)`;
        } else {
            elDesconto.style.display = 'none';
        }
    }

    // Banner frete grátis no carrinho
    atualizarBannerFreteGratis(subtotal);
}

window.pgAtualizarTotalFrete = pgAtualizarTotalFreteComBonus;

function atualizarBannerFreteGratis(subtotal) {
    let banner = document.getElementById('banner-frete-gratis');
    if (!banner) {
        banner = document.createElement('div');
        banner.id = 'banner-frete-gratis';
        banner.style.cssText = `
            margin: 0 0 10px;
            padding: 9px 14px;
            border-radius: 12px;
            font-size: 0.76rem;
            font-weight: 700;
            text-align: center;
            transition: all 0.3s;
        `;
        const footer = document.getElementById('cart-footer');
        if (footer) footer.insertBefore(banner, footer.firstChild);
    }

    if (subtotal >= FRETE_GRATIS_MINIMO) {
        banner.style.background = 'rgba(34,160,90,0.12)';
        banner.style.border = '1px solid rgba(34,160,90,0.30)';
        banner.style.color = '#22a05a';
        banner.innerHTML = '<i class="fas fa-truck"></i> Frete grátis aplicado! 🎉';
        banner.style.display = 'block';
    } else {
        const faltam = FRETE_GRATIS_MINIMO - subtotal;
        banner.style.background = 'rgba(255,255,255,0.03)';
        banner.style.border = '1px solid rgba(255,255,255,0.08)';
        banner.style.color = 'var(--text-muted)';
        banner.innerHTML = `<i class="fas fa-truck"></i> Faltam <strong style="color:var(--accent)">${formatarPreco(faltam)}</strong> para frete grátis`;
        banner.style.display = subtotal > 0 ? 'block' : 'none';
    }
}

// Hook no atualizarCarrinhoUI para atualizar banner
const _atualizarCarrinhoUIOriginal = window.atualizarCarrinhoUI;
if (typeof atualizarCarrinhoUI === 'function') {
    const _orig = atualizarCarrinhoUI;
    window.atualizarCarrinhoUI = function() {
        _orig();
        let subtotal = 0;
        carrinho.forEach(c => subtotal += c.preco * c.qtd);
        atualizarBannerFreteGratis(subtotal);
    };
}

// =====================
// SOCIAL PROOF AO VIVO
// =====================
const NOMES_PROVA = [
    'Lucas', 'Ana', 'Pedro', 'Carla', 'Marcos', 'Julia', 'Rafael',
    'Fernanda', 'Diego', 'Camila', 'Bruno', 'Larissa', 'Thiago',
    'Patrícia', 'Gabriel', 'Mariana', 'Felipe', 'Beatriz', 'Rodrigo', 'Amanda'
];

const ESTADOS_PROVA = ['SP', 'RJ', 'MG', 'RS', 'PR', 'SC', 'BA', 'GO', 'DF', 'CE'];

const ACOES_PROVA = [
    p => `acabou de comprar <strong>${escapeHTML(p.nome)}</strong>`,
    p => `adicionou <strong>${escapeHTML(p.nome)}</strong> ao carrinho`,
    p => `está vendo <strong>${escapeHTML(p.nome)}</strong>`
];

let provaAtiva = false;

function iniciarSocialProof() {
    if (provaAtiva) return;
    provaAtiva = true;

    // Cria o elemento
    let el = document.getElementById('social-proof-toast');
    if (!el) {
        el = document.createElement('div');
        el.id = 'social-proof-toast';
        el.style.cssText = `
            position: fixed;
            bottom: 90px;
            left: 16px;
            max-width: 280px;
            background: rgba(13,23,17,0.96);
            border: 1px solid rgba(34,160,90,0.28);
            border-radius: 16px;
            padding: 12px 14px;
            display: flex;
            align-items: center;
            gap: 12px;
            z-index: 8999;
            box-shadow: 0 8px 28px rgba(0,0,0,0.45);
            transform: translateX(-120%);
            transition: transform 0.45s cubic-bezier(0.32,0.72,0,1);
            pointer-events: none;
        `;
        document.body.appendChild(el);
    }

    function mostrarProva() {
        const todos = getTodosProdutosDaLojaAtual();
        if (!todos.length) return;
        const p     = todos[Math.floor(Math.random() * todos.length)];
        const nome  = NOMES_PROVA[Math.floor(Math.random() * NOMES_PROVA.length)];
        const uf    = ESTADOS_PROVA[Math.floor(Math.random() * ESTADOS_PROVA.length)];
        const acao  = ACOES_PROVA[Math.floor(Math.random() * ACOES_PROVA.length)];
        const imgs  = getImagens(p);
        const mins  = Math.floor(Math.random() * 12) + 1;

        el.innerHTML = `
            <img src="${escapeHTML(imgs[0])}" style="width:44px; height:44px; border-radius:10px; object-fit:cover; flex-shrink:0; border:1px solid rgba(34,160,90,0.25);">
            <div style="min-width:0;">
                <div style="font-size:0.75rem; font-weight:700; color:#f0faf4; line-height:1.35;">
                    <span style="color:#22a05a;">${escapeHTML(nome)} (${uf})</span> ${acao(p)}
                </div>
                <div style="font-size:0.62rem; color:#7aaa8f; margin-top:3px;">
                    <i class="fas fa-clock" style="margin-right:3px;"></i>há ${mins} min
                </div>
            </div>
        `;

        el.style.transform = 'translateX(0)';
        setTimeout(() => { el.style.transform = 'translateX(-120%)'; }, 4500);
    }

    // Primeira aparição após 8s, depois a cada 18–30s
    setTimeout(() => {
        mostrarProva();
        setInterval(mostrarProva, Math.random() * 12000 + 18000);
    }, 8000);
}

// =====================
// RELATÓRIO DE VENDAS (simulado com localStorage)
// =====================
const VENDAS_KEY = 'cdp_vendas';

function registrarVenda(itens, total) {
    try {
        const vendas = JSON.parse(localStorage.getItem(VENDAS_KEY) || '[]');
        vendas.unshift({
            data: new Date().toISOString(),
            itens: itens.map(i => ({ nome: i.nome, qtd: i.qtd, preco: i.preco })),
            total
        });
        // Mantém só as últimas 200 vendas
        localStorage.setItem(VENDAS_KEY, JSON.stringify(vendas.slice(0, 200)));
    } catch(e) {}
}

function renderRelatorioVendas() {
    const el = document.getElementById('admin-relatorio');
    if (!el) return;
    try {
        const vendas = JSON.parse(localStorage.getItem(VENDAS_KEY) || '[]');
        if (vendas.length === 0) {
            el.innerHTML = `<div style="text-align:center; padding:40px; color:var(--text-muted);">
                <i class="fas fa-chart-bar" style="font-size:2.5rem; opacity:0.25; display:block; margin-bottom:12px;"></i>
                <p style="font-size:0.85rem;">Nenhuma venda registrada ainda.</p>
                <p style="font-size:0.75rem; margin-top:6px; opacity:0.6;">As vendas aparecerão aqui após o pagamento Pix ser confirmado.</p>
            </div>`;
            return;
        }

        const totalGeral = vendas.reduce((s, v) => s + v.total, 0);
        const hoje = new Date().toDateString();
        const vendasHoje = vendas.filter(v => new Date(v.data).toDateString() === hoje);
        const totalHoje  = vendasHoje.reduce((s, v) => s + v.total, 0);

        el.innerHTML = `
            <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px; margin-bottom:20px;">
                <div style="background:rgba(34,160,90,0.06); border:1px solid rgba(34,160,90,0.18); border-radius:14px; padding:14px; text-align:center;">
                    <div style="font-size:0.6rem; color:var(--text-muted); text-transform:uppercase; letter-spacing:1px; margin-bottom:5px;">Total Vendas</div>
                    <div style="font-size:1.4rem; font-weight:900; color:var(--accent); font-family:'Cinzel';">${vendas.length}</div>
                </div>
                <div style="background:rgba(34,160,90,0.06); border:1px solid rgba(34,160,90,0.18); border-radius:14px; padding:14px; text-align:center;">
                    <div style="font-size:0.6rem; color:var(--text-muted); text-transform:uppercase; letter-spacing:1px; margin-bottom:5px;">Hoje</div>
                    <div style="font-size:1.4rem; font-weight:900; color:var(--accent); font-family:'Cinzel';">${vendasHoje.length}</div>
                </div>
                <div style="background:rgba(34,160,90,0.06); border:1px solid rgba(34,160,90,0.18); border-radius:14px; padding:14px; text-align:center;">
                    <div style="font-size:0.6rem; color:var(--text-muted); text-transform:uppercase; letter-spacing:1px; margin-bottom:5px;">Faturamento</div>
                    <div style="font-size:1rem; font-weight:900; color:var(--accent); font-family:'Cinzel';">${formatarPreco(totalGeral)}</div>
                </div>
            </div>
            <div style="font-size:0.65rem; color:var(--text-muted); text-transform:uppercase; letter-spacing:1px; margin-bottom:10px; font-weight:700;">
                <i class="fas fa-history" style="margin-right:5px;"></i> Últimas vendas
            </div>
            <div style="max-height:380px; overflow-y:auto;">
                ${vendas.map(v => {
                    const d = new Date(v.data);
                    const dataStr = d.toLocaleDateString('pt-BR');
                    const horaStr = d.toLocaleTimeString('pt-BR', { hour:'2-digit', minute:'2-digit' });
                    return `
                    <div style="background:rgba(34,160,90,0.03); border:1px solid rgba(34,160,90,0.12); border-radius:12px; padding:12px; margin-bottom:8px;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:7px;">
                            <span style="font-size:0.7rem; color:var(--text-muted);">${dataStr} às ${horaStr}</span>
                            <span style="font-size:0.88rem; font-weight:800; color:var(--accent);">${formatarPreco(v.total)}</span>
                        </div>
                        <div style="font-size:0.72rem; color:var(--text-sec);">
                            ${v.itens.map(i => `${i.qtd}x ${escapeHTML(i.nome)}`).join(' • ')}
                        </div>
                    </div>`;
                }).join('')}
            </div>`;
    } catch(e) {
        el.innerHTML = '<p style="color:var(--error);">Erro ao carregar relatório.</p>';
    }
}

// Inicializa tudo
document.addEventListener('DOMContentLoaded', () => {
    iniciarTema();
    iniciarSocialProof();
});
