'use strict';

/* ==========================================
   CARRINHO DE COMPRAS
   Arquivo: js/carrinho.js
   ========================================== */

function adicionarAoCarrinho(p) {
    const i = carrinho.findIndex(c => c.nome === p.nome);
    const imgs = getImagens(p);
    if (i >= 0) carrinho[i].qtd++;
    else carrinho.push({ nome: p.nome, preco: parseFloat(p.preco), imagem: imgs[0], qtd: 1 });
    atualizarCarrinhoUI();
    animarCarrinho();
    mostrarToast('Adicionado ao carrinho!', 'success');
}

function atualizarCarrinhoUI() {
    const l = document.getElementById('lista-itens');
    let t = 0, q = 0;
    if (carrinho.length === 0) {
        l.innerHTML = '<p style="text-align:center; padding:40px 20px; color:var(--text-muted);"><i class="fas fa-shopping-cart" style="font-size:2rem; margin-bottom:10px; display:block; opacity:0.28;"></i>Seu carrinho está vazio.</p>';
        document.getElementById('cart-footer').style.display = 'none';
    } else {
        let html = '';
        carrinho.forEach((c, i) => {
            t += c.preco * c.qtd; q += c.qtd;
            html += `<div class="cart-item">
                <img src="${escapeHTML(c.imagem)}">
                <div style="flex:1; min-width:0;">
                    <strong style="color:var(--text); display:block; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-size:0.86rem;">${escapeHTML(c.nome)}</strong>
                    <span style="color:var(--text-muted); font-size:0.82rem;">${formatarPreco(c.preco)}</span>
                </div>
                <div class="cart-qty-ctrl">
                    <div onclick="removerItem(${i})" class="cart-qty-btn">−</div>
                    <span style="min-width:20px; text-align:center; color:var(--text); font-weight:700; font-size:0.82rem;">${c.qtd}</span>
                    <div onclick="aumentarItem(${i})" class="cart-qty-btn">+</div>
                </div>
            </div>`;
        });
        l.innerHTML = html;
        document.getElementById('cart-footer').style.display = 'block';
    }
    document.getElementById('valor-total').innerText = formatarPreco(t);
    document.getElementById('cart-count').innerText = q;
    document.getElementById('cart-count').style.display = q > 0 ? 'flex' : 'none';
}

function removerItem(i) {
    if (carrinho[i].qtd > 1) carrinho[i].qtd--;
    else carrinho.splice(i, 1);
    atualizarCarrinhoUI();
}

function aumentarItem(i) {
    carrinho[i].qtd++;
    atualizarCarrinhoUI();
}

function finalizarCompra() {
    if (!carrinho.length) return;
    const nomeLoja = lojaAtual === 'cyto' ? 'CYTO' : 'CANETAS DA PAZ 🍁';
    let m = `*PEDIDO ${nomeLoja}*\n\n`, t = 0;
    carrinho.forEach(c => {
        t += c.preco * c.qtd;
        m += `• ${c.qtd}x ${c.nome} - ${formatarPreco(c.preco * c.qtd)}\n`;
    });
    m += `\n*TOTAL: ${formatarPreco(t)}*`;
    window.open(`https://wa.me/${TELEFONE}?text=${encodeURIComponent(m)}`, '_blank');
    carrinho = [];
    atualizarCarrinhoUI();
    fecharModal('modal-carrinho');
    mostrarToast('Pedido enviado!', 'success');
}

function pagarComPix() {
    if (!carrinho.length) return;
    fecharModal('modal-carrinho');
    abrirModalPagamento();
}