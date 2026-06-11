'use strict';

/* ==========================================
   ESTRUTURA DE LOJAS E CATEGORIAS
   ==========================================
   Arquivo: js/lojas.js
   Responsável por: textos das lojas, categorias de cada uma
   ========================================== */

const LOJA_CANETAS = 'canetas';
const LOJA_CYTO = 'cyto';

const LOJAS_CONFIG = {
    canetas: {
        titulo: 'Canetas da Paz',
        subtitulo: 'CATÁLOGO PREMIUM',
        prova_subtitle: 'Veja o que nossos clientes têm dito sobre os produtos. Print é coisa séria — qualidade é nosso compromisso.',
        catalogo_subtitle: 'Selecionados a dedo. Cada item passa por curadoria rigorosa antes de chegar até você.',
        footer: 'Compra 100% segura • Entrega discreta • Suporte WhatsApp 24h<br>Canetas da Paz © 2025 — Todos os direitos reservados',
        instagram: 'https://www.instagram.com/canetasdapaz'
    },
    cyto: {
        titulo: 'Cyto',
        subtitulo: 'FARMÁCIA DE CONFIANÇA',
        prova_subtitle: 'Resultados reais de quem confiou em nós. Veja depoimentos e prints dos nossos clientes satisfeitos.',
        catalogo_subtitle: 'Suplementos selecionados para emagrecimento e bem-estar. Qualidade e confiança em cada item.',
        footer: 'Produtos selecionados • Entrega rápida • Atendimento especializado<br>Cyto © 2025 — Todos os direitos reservados',
        instagram: 'https://www.instagram.com/canetasdapaz'
    }
};

const CATEGORIAS_CANETAS = [
    { id: 'pod', nome: 'PODS THC', cor: '#d4af37' },
    { id: 'hibrida', nome: 'Híbrida', cor: '#d4af37' },
    { id: 'indica', nome: 'Indica', cor: '#d4af37' },
    { id: 'sativa', nome: 'Sativa', cor: '#d4af37' },
    { id: 'refil', nome: 'Refil', cor: '#d4af37' },
    { id: 'oleo', nome: 'Óleos', cor: '#d4af37' },
    { id: 'comestiveis', nome: 'Comestíveis', cor: '#d4af37' }
];

const CATEGORIAS_CYTO = [
    { id: 'emagrecimento', nome: 'Emagrecimento', cor: '#d4af37' },
    { id: 'abortec', nome: 'Abortec', cor: '#d4af37' }
];

function getCategorias(loja) {
    return loja === LOJA_CYTO ? CATEGORIAS_CYTO : CATEGORIAS_CANETAS;
}

function obterCorCat(catId, loja) {
    const lista = getCategorias(loja || lojaAtual);
    const c = lista.find(x => x.id === catId);
    return c ? c : { id: catId, nome: catId, cor: '#888' };
}
