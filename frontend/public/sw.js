// Service Worker para Notificações Push na Tela de Bloqueio (Web Push & PWA)
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
    icon: '/icon.svg',
    badge: '/icon.svg',
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
