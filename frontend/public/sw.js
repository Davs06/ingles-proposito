// Service Worker Oficial para PWA, Cache e Notificações Push na Tela de Bloqueio

const CACHE_NAME = 'proposito-ingles-cache-v2';

// 1. Instalação do Service Worker
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// 2. Ativação do Service Worker com Limpeza Automática de Cache Antigo
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Interceptador de Fetch (Requisito obrigatório do Chrome/Android para validação PWA)
self.addEventListener('fetch', (event) => {
  // Ignora requisições de API/backend para permitir chamadas dinâmicas
  if (event.request.url.includes('/api/')) {
    return;
  }
  
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});

// 4. Notificações Push na Tela de Bloqueio (Web Push & PWA)
self.addEventListener('push', function(event) {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = { title: 'Propósito do Inglês 📝', message: event.data ? event.data.text() : 'Novo Homework Disponível!' };
  }

  const title = data.title || 'Propósito do Inglês 📝';
  const options = {
    body: data.message || 'Novo exercício cadastrado pelo professor. Acesse para responder!',
    icon: '/pwa-192.png',
    badge: '/pwa-192.png',
    vibrate: [200, 100, 200],
    tag: 'homework-notification',
    renotify: true,
    data: {
      url: '/aluno'
    }
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(function(clientList) {
      for (let i = 0; i < clientList.length; i++) {
        let client = clientList[i];
        if (client.url.includes('/aluno') && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/aluno');
      }
    })
  );
});
