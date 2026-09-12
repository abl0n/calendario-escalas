// =====================================================
// SERVICE WORKER - CALENDÁRIO DE ESCALAS
// Estratégia: Cache First para assets, Network First para navegação
// =====================================================

const CACHE_VERSION = 'v3';
const CACHE_NAME = `calendario-escalas-${CACHE_VERSION}`;

// =====================================================
// ASSETS CRÍTICOS (tudo que precisa pra rodar offline)
// =====================================================
const ASSETS_CRITICOS = [
    './',
    './index.html',
    './manifest.json',

    // CSS
    './css/style.css',
    './assets/css/icons-animated.css',

    // JS - Módulos principais
    './js/app.js',
    './js/config.js',

    // JS - Core
    './js/core/pessoas.js',
    './js/core/estatisticas.js',
    './js/core/horasExtras.js',

    // JS - UI
    './js/ui/menu.js',
    './js/ui/modais.js',
    './js/ui/popups.js',
    './js/ui/tema.js',

    // JS - Utils
    './js/utils/helpers.js',
    './js/utils/periodos.js',
    './js/utils/storage.js',
    './js/utils/feriadosMoveis.js',

    // JS - Constants
    './js/constants/cores.js',

    // Ícones
    './assets/icons/sprite.svg',
    './icons/icon-192.png',
    './icons/icon-512.png',
    './icons/favicon.ico'
];

// =====================================================
// INSTALAÇÃO
// =====================================================
self.addEventListener('install', event => {
    console.log('🔄 Service Worker: Instalando...');
    self.skipWaiting();

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('📦 Cache aberto. Adicionando', ASSETS_CRITICOS.length, 'arquivos...');

                // addAll falha se UM arquivo der 404. Usamos Promise.allSettled
                // para cachear o que der e reportar o que falhou sem quebrar tudo.
                return Promise.allSettled(
                    ASSETS_CRITICOS.map(url =>
                        cache.add(url).catch(err => {
                            console.warn(`⚠️ Falha ao cachear ${url}:`, err.message);
                        })
                    )
                );
            })
            .then(results => {
                const falhas = results.filter(r => r.status === 'rejected').length;
                if (falhas > 0) {
                    console.warn(`⚠️ ${falhas} arquivo(s) falharam ao cachear.`);
                } else {
                    console.log('✅ Todos os assets foram cacheados!');
                }
            })
    );
});

// =====================================================
// ATIVAÇÃO (limpa caches antigos)
// =====================================================
self.addEventListener('activate', event => {
    console.log('⚡ Service Worker: Ativando...');

    event.waitUntil(
        caches.keys()
            .then(cacheNames => Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('🗑️ Removendo cache antigo:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            ))
            .then(() => {
                console.log('✅ Cache antigo limpo. Assumindo controle...');
                return self.clients.claim();
            })
    );
});

// =====================================================
// FETCH - ESTRATÉGIA INTELIGENTE
// =====================================================
self.addEventListener('fetch', event => {
    const req = event.request;

    // Ignora requisições não-HTTP (file://, chrome-extension://, etc.)
    if (!req.url.startsWith('http')) return;

    // Ignora métodos que não sejam GET
    if (req.method !== 'GET') return;

    // =====================================================
    // NAVEGAÇÃO (HTML) → Network First (conteúdo sempre fresco)
    // =====================================================
    if (req.mode === 'navigate' || req.destination === 'document') {
        event.respondWith(
            fetch(req)
                .then(response => {
                    if (response && response.status === 200) {
                        const clone = response.clone();
                        caches.open(CACHE_NAME).then(c => c.put(req, clone));
                    }
                    return response;
                })
                .catch(() => {
                    return caches.match('./index.html')
                        .then(cached => cached || caches.match('./'));
                })
        );
        return;
    }

    // =====================================================
    // ASSETS (CSS, JS, imagens, ícones) → Cache First
    // =====================================================
    event.respondWith(
        caches.match(req).then(cached => {
            if (cached) {
                // Retorna do cache imediatamente e atualiza em background
                // (stale-while-revalidate simplificado)
                fetch(req).then(response => {
                    if (response && response.status === 200) {
                        caches.open(CACHE_NAME).then(c => c.put(req, response));
                    }
                }).catch(() => {}); // silencioso se offline

                return cached;
            }

            // Não está no cache → busca na rede e guarda
            return fetch(req)
                .then(response => {
                    if (response && response.status === 200) {
                        const clone = response.clone();
                        caches.open(CACHE_NAME).then(c => c.put(req, clone));
                    }
                    return response;
                })
                .catch(() => {
                    // Fallback para imagem quebrada
                    if (req.destination === 'image') {
                        return new Response(
                            '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect width="64" height="64" fill="#ddd"/></svg>',
                            { headers: { 'Content-Type': 'image/svg+xml' } }
                        );
                    }
                    return new Response('Offline', {
                        status: 503,
                        statusText: 'Service Unavailable',
                        headers: { 'Content-Type': 'text/plain; charset=utf-8' }
                    });
                });
        })
    );
});

// =====================================================
// MENSAGENS DO CLIENTE (para forçar update)
// =====================================================
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

console.log('✅ Service Worker carregado!');