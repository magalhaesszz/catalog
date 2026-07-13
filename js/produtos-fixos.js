'use strict';

/* ==========================================
   PRODUTOS FIXOS (HARDCODED)
   ==========================================
   Arquivo: js/produtos-fixos.js
   Responsável por: catálogo base que sempre aparece
   (produtos extras vêm do Supabase)
   ========================================== */

const PRODUTOS_FIXOS_CANETAS = [
    { nome: "Hallu Labz 3.0 - Strawberry Cheesecake (Indica)", preco: 310.00, imagem: "https://i.postimg.cc/8c7pqBGZ/IMG_2593.jpg", descricao: "Vape descartável de 3g. Sabor de sobremesa com notas doces de morango e creme. Indica potente para relaxamento.", categoria: "pod" },
    { nome: "Hallu Labz - Skywalker OG (Indica)", preco: 310.00, imagem: "https://i.postimg.cc/XqrjTcWh/IMG_2592.jpg", descricao: "Vape descartável de 3g. Embalagem preta com três caixas. Clássico terroso e picante, relaxamento profundo.", categoria: "pod" },
    { nome: "Hallu Labz 3.0 - Sour Diesel (Hybrid)", preco: 310.00, imagem: "https://i.postimg.cc/rsDVvCTP/IMG_2594.jpg", descricao: "Vape descartável de 3g. Embalagem azul ciano. Aroma de combustível e limão, energizante.", categoria: "pod" },
    { nome: "Hallu Labz 10g - White Fire OG (Sativa)", preco: 460.00, imagem: "https://i.postimg.cc/RhWSjQmb/IMG_2591.jpg", descricao: "Dispositivo Tank de 10g. Caixa roxa com preto. Alta potência e efeito duradouro.", categoria: "pod" },
    { nome: "Hallu Labz 3.0 - Purple Haze (Sativa)", preco: 310.00, imagem: "https://i.postimg.cc/Kj1Gdrb6/IMG_2596.jpg", descricao: "Vape descartável de 3g. Embalagem roxa. Sabor doce de uva e terra, euforia mental.", categoria: "pod" },
    { nome: "Hallu Labz 10g - Blackberry Moonrocks (Sativa)", preco: 460.00, imagem: "https://i.postimg.cc/j2DxGQTh/IMG_2589.jpg", descricao: "Dispositivo Tank de 10g. Caixa azul petróleo. Sabor de amora com potência extra.", categoria: "pod" },
    { nome: "Hallu Labz 10g - Mimosa (Sativa)", preco: 460.00, imagem: "https://i.postimg.cc/hvXDHbnZ/IMG_2590.jpg", descricao: "Dispositivo Tank de 10g. Caixa verde clara. Sabor cítrico de laranja e champanhe.", categoria: "pod" },
    { nome: "Hallu Labz 3.0 - Super Lemon Haze (Sativa)", preco: 310.00, imagem: "https://i.postimg.cc/D0Svtdht/IMG_2597.jpg", descricao: "Vape descartável de 3g. Embalagem verde. Sabor intenso de limão siciliano, efeito vibrante.", categoria: "pod" },
    { nome: "Hallu Labz 3.0 - Pineapple (Sativa)", preco: 310.00, imagem: "https://i.postimg.cc/wM1qScHK/IMG_2595.jpg", descricao: "Vape descartável de 3g. Embalagem laranja. Sabor tropical de abacaxi, levanta o humor.", categoria: "pod" },
    { nome: "Jeeter Juice Blueberry Tornado", preco: 200.00, imagem: "https://i.postimg.cc/5N6PHXLL/56ce0c76-fadd-4a2e-9570-00e1d48d943b.jpg", descricao: "Mistura potente com sabor intenso de mirtilo fresco e um toque adocicado.", categoria: "hibrida" },
    { nome: "Jeeter Juice Cherry Punch", preco: 200.00, imagem: "https://i.postimg.cc/qMxy1jkr/IMG-2553.jpg", descricao: "Sabor doce de cereja e notas terrosas.", categoria: "hibrida" },
    { nome: "Jeeter Juice Mac and Cookies", preco: 200.00, imagem: "https://i.postimg.cc/pd8SSwyZ/IMG-2554.jpg", descricao: "Fusão cremosa de notas amanteigadas e de biscoito.", categoria: "hibrida" },
    { nome: "Jeeter Juice Kush Mintz", preco: 200.00, imagem: "https://i.postimg.cc/904Z8hQ5/IMG-2555.jpg", descricao: "Perfil refrescante de menta com fundo terroso.", categoria: "hibrida" },
    { nome: "Jeeter Juice GSC", preco: 200.00, imagem: "https://i.postimg.cc/fLP00rjv/IMG-2556.jpg", descricao: "Clássico absoluto com notas de menta e chocolate.", categoria: "hibrida" },
    { nome: "Jeeter Juice Sugar Melon", preco: 200.00, imagem: "https://i.postimg.cc/zfXjC4Kv/IMG-2557.jpg", descricao: "Sabor doce de melão maduro com notas de açúcar.", categoria: "hibrida" },
    { nome: "Jeeter Juice Lemon Drop", preco: 200.00, imagem: "https://i.postimg.cc/MpzbwgsK/IMG-2552.jpg", descricao: "Aroma cítrico e refrescante que lembra balas de limão.", categoria: "hibrida" },
    { nome: "Papaya | BabyJeeter 3G", preco: 359.99, imagem: "https://i.postimg.cc/qMNXh5Vs/IMG-2578.jpg", descricao: "Babyjeeter 3G - THC 93,8% - Indica.", categoria: "indica" },
    { nome: "OG Kush | BabyJeeter 3G", preco: 359.99, imagem: "https://i.postimg.cc/fTVjtrnf/IMG-2577.jpg", descricao: "Babyjeeter 3G - THC 93% - Indica.", categoria: "indica" },
    { nome: "Liquid Diamonds Goma Bubba", preco: 209.99, imagem: "https://i.postimg.cc/TYKqL4Mr/IMG-2576.jpg", descricao: "Jeeter Juice Liquid Diamonds.", categoria: "indica" },
    { nome: "Jeeter Juice Ice Cream Banana", preco: 200.00, imagem: "https://i.postimg.cc/sxsJvgdT/IMG-2521.jpg", descricao: "Sobremesa pura. Cremosidade do sorvete.", categoria: "indica" },
    { nome: "Jeeter Juice Do-Si-Lato", preco: 200.00, imagem: "https://i.postimg.cc/4db6kR7K/IMG-2522.jpg", descricao: "Combinação floral e de biscoito.", categoria: "indica" },
    { nome: "Jeeter Juice Peach Rings", preco: 200.00, imagem: "https://i.postimg.cc/gJJzdvrc/IMG-2523.jpg", descricao: "Sabor nostálgico de balas de pêssego.", categoria: "indica" },
    { nome: "Jeeter Juice Forbidden Gelato", preco: 200.00, imagem: "https://i.postimg.cc/Ss3JvZVS/IMG-2524.jpg", descricao: "Mix exótico de frutas silvestres e notas cremosas.", categoria: "indica" },
    { nome: "Jeeter Juice Harambe", preco: 200.00, imagem: "https://i.postimg.cc/dVYJDMLZ/IMG-2525.jpg", descricao: "Perfil de sabor encorpado e potente com notas de diesel.", categoria: "indica" },
    { nome: "Jeeter Juice Churros", preco: 200.00, imagem: "https://i.postimg.cc/sgNymF1T/IMG-2526.jpg", descricao: "Aroma de massa frita com açúcar e canela.", categoria: "indica" },
    { nome: "Jeeter Juice Rainbow Belts", preco: 200.00, imagem: "https://i.postimg.cc/d3DWQfmW/IMG-2527.jpg", descricao: "Explosão de balas de goma ácidas.", categoria: "indica" },
    { nome: "Jeeter Juice Blue Zkz", preco: 200.00, imagem: "https://i.postimg.cc/nzbB5PCJ/IMG-2529.jpg", descricao: "Uma mistura rica de mirtilos e doces cítricos.", categoria: "indica" },
    { nome: "Jeeter Juice Super Silver Haze", preco: 200.00, imagem: "https://i.postimg.cc/C1NqrCXL/IMG-2517.jpg", descricao: "Clássico premiado com aroma cítrico e terroso.", categoria: "sativa" },
    { nome: "Jeeter Juice Chocolope Cookies", preco: 200.00, imagem: "https://i.postimg.cc/dtK0ZZfc/IMG-2520.jpg", descricao: "Mistura sofisticada de café e chocolate.", categoria: "sativa" },
    { nome: "Jeeter Juice Durban Poison", preco: 200.00, imagem: "https://i.postimg.cc/9FWhjdSz/IMG-2518.jpg", descricao: "O espresso das Sativas. Aroma picante de anis.", categoria: "sativa" },
    { nome: "Jeeter Juice Maui Wowie", preco: 200.00, imagem: "https://i.postimg.cc/nzBgbgTZ/IMG-2528.jpg", descricao: "Clássico havaiano com notas de abacaxi.", categoria: "sativa" },
    { nome: "Jeeter Juice Honeydew", preco: 200.00, imagem: "https://i.postimg.cc/d08KRhCB/IMG-2530.jpg", descricao: "Refrescante e leve, sabor melão doce.", categoria: "sativa" },
    { nome: "Jeeter - 5 Refil + Caneta", preco: 509.00, imagem: "https://i.postimg.cc/NfZ81kQY/IMG-2582.jpg", descricao: "5 unidades de refil 1ml + caneta.", categoria: "refil" },
    { nome: "Refil Maui Wowie", preco: 409.00, imagem: "https://i.postimg.cc/wTn5hQ9g/IMG-2581.jpg", descricao: "Refil Sativa 98,4%.", categoria: "refil" },
    { nome: "Refil THC Bubba G", preco: 159.99, imagem: "https://i.postimg.cc/DySdJM3k/IMG-2580.jpg", descricao: "Refil THC 1000mg.", categoria: "refil" },
    { nome: "5G POD - BLUE DREAM", preco: 409.99, imagem: "https://i.postimg.cc/MZPmG84y/IMG-2579.jpg", descricao: "Pod 5g - Blue Dream - Indica.", categoria: "refil" },
    { nome: "Cartucho de CBD Black Widow", preco: 209.99, imagem: "https://i.postimg.cc/FHfZ5kVh/f0c03075_86cb_4cf7_90f5_856f7ef7631c.jpg", descricao: "Cartucho de CBD 1g.", categoria: "refil" },
    { nome: "Pink Kush High THC Cartridge", preco: 309.99, imagem: "https://i.postimg.cc/7ZCV8Jnx/43dc5643_035f_45e4_8f04_27a78e5e61df.jpg", descricao: "Cartucho 1g.", categoria: "refil" },
    { nome: "Cartucho Alien OG | 1,2g", preco: 249.99, imagem: "https://i.postimg.cc/jSGhsqZm/8247d49b_66e5_41a7_aa1d_6f5ada54c884.jpg", descricao: "Cartucho 1,2g.", categoria: "refil" },
    { nome: "Cartucho Atomizador de Cerâmica 1ml", preco: 49.99, imagem: "https://i.postimg.cc/8zKVcxTR/cd4bb426-afb4-46b1-928c-753d8553baf0.jpg", descricao: "Cartucho de 1ml.", categoria: "oleo" },
    { nome: "Cannabis Óleo Das Sementes", preco: 259.99, imagem: "https://i.postimg.cc/Njy4q2kc/7e47b6d8_3926_45bf_8a74_fc04d825dcfd.jpg", descricao: "Óleo das sementes de cannabis.", categoria: "oleo" },
    { nome: "Óleo de CBD Delta-9 THC + CBD", preco: 359.99, imagem: "https://i.postimg.cc/DfjPzKD7/IMG-2575.jpg", descricao: "Mix definitivo alívio de estresse full spectrum.", categoria: "oleo" }
];

PRODUTOS_FIXOS_CANETAS.forEach((p, i) => { p.id = 'fix_canetas_' + i; p.fixo = true; p.loja = 'canetas'; });

const PRODUTOS_FIXOS_CYTO = [];
PRODUTOS_FIXOS_CYTO.forEach((p, i) => { p.id = 'fix_cyto_' + i; p.fixo = true; p.loja = 'cyto'; });

function getProdutosFixos(loja) {
    return loja === LOJA_CYTO ? PRODUTOS_FIXOS_CYTO : PRODUTOS_FIXOS_CANETAS;
}
