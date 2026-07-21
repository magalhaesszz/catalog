'use strict';

/* ==========================================
   CONFIGURAÇÕES GLOBAIS
   ==========================================
   Arquivo: js/config.js
   Responsável por: telefone do WhatsApp, chaves do Supabase
   ========================================== */

const TELEFONE = "5517991301373"; // NÚMERO DESTINO DOS PEDIDOS
const STORAGE_KEY = 'cdp_supabase_config';

const CONFIG_DEFAULT = {
    url: 'https://vlosjvsxjmhksncmqmpk.supabase.co',
    key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZsb3NqdnN4am1oa3NuY21xbXBrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzczMjU0ODEsImV4cCI6MjA5MjkwMTQ4MX0.GFQC14TlZDIaubZL8iKYPOrF46tamDXFlnPJAxZN2Aw',
    tabela: 'produtos'
};

function carregarConfig() {
    try {
        const s = localStorage.getItem(STORAGE_KEY);
        if (s) return Object.assign({}, CONFIG_DEFAULT, JSON.parse(s));
    } catch(e) {}
    return Object.assign({}, CONFIG_DEFAULT);
}

let CONFIG = carregarConfig();
