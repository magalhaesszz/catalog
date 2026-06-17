/* ==========================================
   SERVICE WORKER — Canetas da Paz PWA
   ========================================== */

const CACHE_NAME    = 'cdp-v1';
const CACHE_STATIC  = 'cdp-static-v1';

// Arquivos essenciais que ficam em cache
const ARQUIVOS_CACHE = [
    '/',
    '/index.html',
    '/css/style.css',
    '/js/config.js',
    '/js/lojas.js',
    '/js/produtos-fixos.js',
    '/js/utils.js',
    '/js/filtros.js',
    '/js/produtos.js',
    '/js/carrinho.js',
    '/js/favoritos.js',
    '/js/extras.js',
    '/js/videos.js',
    '/js/cupons.js',
    '/js/pagamento.js',
    '/js/auth.js',
    '/js/admin.js',
    '/js/supabase-ops.js',
    '/js/init.js',
    'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Cinzel:wght@600;700;800;900&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// INSTALL — faz cache dos arquivos essenciais
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_STATIC).then(cache => {
            return cache.addAll(ARQUIVOS_CACHE).catch(() => {});
        }).then(() => self.skipWaiting())
    );
});

// ACTIVATE — limpa caches antigos
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys
                    .filter(k => k !== CACHE_STATIC && k !== CACHE_NAME)
                    .map(k => caches.delete(k))
            )
        ).then(() => self.clients.claim())
    );
});

// FETCH — estratégia: Network First para JS/HTML, Cache First para fontes/imagens
self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);

    // Ignora requisições não HTTP
    if (!event.request.url.startsWith('http')) return;

    // Ignora Supabase e APIs externas (sempre busca da rede)
    if (
        url.hostname.includes('supabase.co') ||
        url.hostname.includes('vimeo.com') ||
        url.hostname.includes('api.') ||
        event.request.method !== 'GET'
    ) {
        return;
    }

    // Fontes e ícones: Cache First
    if (
        url.hostname.includes('googleapis.com') ||
        url.hostname.includes('gstatic.com') ||
        url.hostname.includes('cloudflare.com') ||
        url.pathname.match(/\.(woff2?|ttf|eot)$/)
    ) {
        event.respondWith(
            caches.match(event.request).then(cached => {
                return cached || fetch(event.request).then(response => {
                    if (response && response.status === 200) {
                        const clone = response.clone();
                        caches.open(CACHE_STATIC).then(c => c.put(event.request, clone));
                    }
                    return response;
                });
            })
        );
        return;
    }

    // Imagens: Cache First com fallback
    if (url.pathname.match(/\.(png|jpg|jpeg|gif|webp|svg|ico)$/)) {
        event.respondWith(
            caches.match(event.request).then(cached => {
                return cached || fetch(event.request).catch(() => {
                    return new Response('', { status: 404 });
                });
            })
        );
        return;
    }

    // HTML, JS, CSS: Network First com fallback pro cache
    event.respondWith(
        fetch(event.request).then(response => {
            if (response && response.status === 200) {
                const clone = response.clone();
                caches.open(CACHE_STATIC).then(c => c.put(event.request, clone));
            }
            return response;
        }).catch(() => {
            return caches.match(event.request).then(cached => {
                return cached || caches.match('/index.html');
            });
        })
    );
});
