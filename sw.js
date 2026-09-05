// =====================================================
// SERVICE WORKER - OTIMIZADO PARA AMBIENTE LOCAL E PWA
// =====================================================

const CACHE_NAME = 'calendario-escalas-v2';

// Assets críticos para funcionamento offline basico
const urlsToCache = [
    './',
    './index.html',
    './manifest.json',
    './css/index.css'
];

// ===== INSTALAÇÃO =====
self.addEventListener('install', event => {
    console.log('🔄 Service Worker: Instalando...');
    self.skipWaiting(); // Força a ativação imediata
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('📦 Cache aberto');
                return cache.addAll(urlsToCache);
            })
            .catch(err => {
                console.warn('⚠️ Erro ao cachear recursos iniciais:', err);
            })
    );
});

// ===== ATIVAÇÃO =====
self.addEventListener('activate', event => {
    console.log('⚡ Service Worker: Ativando...');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('🗑️ Removendo cache antigo:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim()) // Assume o controle da página na hora
    );
});

// ===== INTERCEPTAÇÃO (Network First com Fallback) =====
self.addEventListener('fetch', event => {
    // Não intercepta requisições fora de HTTP/HTTPS (evita erros em protocol file://)
    if (!event.request.url.startsWith('http')) return;

    event.respondWith(
        fetch(event.request)
            .then(networkResponse => {
                // Se a busca na rede funcionar, atualiza o cache e retorna a resposta válida
                if (networkResponse && networkResponse.status === 200 && event.request.method === 'GET') {
                    const responseClone = networkResponse.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseClone));
                }
                return networkResponse;
            })
            .catch(() => {
                // Se a rede falhar (offline real), tenta entregar o arquivo do cache
                return caches.match(event.request).then(cachedResponse => {
                    if (cachedResponse) {
                        return cachedResponse;
                    }
                    // Retorna resposta neutra de erro apenas se não houver nada no cache
                    return new Response('Conteúdo não disponível offline', {
                        status: 404,
                        headers: { 'Content-Type': 'text/plain; charset=utf-8' }
                    });
                });
            })
    );
});

console.log('✅ Service Worker carregado!');