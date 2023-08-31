// プッシュ通知を「受信」した時
self.addEventListener('push', (event) => {
    const obj = JSON.parse(event.data.text())
  
    const options = {
      body: obj.message,
      icon: '/icon.png',
      id: obj.id,
      actions: [
        { action: 'action001', title: 'title001' },
        { action: 'action002', title: 'title002' }
      ]
    }
  
    event.waitUntil(self.registration.showNotification(obj.title, options))
  })
  
  // プッシュ通知を「クリック」した時
  self.addEventListener('notificationclick', (event) => {
    event.notification.close()
  
    switch (event.action) {
      case 'action001':
        event.waitUntil(clients.openWindow('https://example.com/1'))
        break
      case 'action002':
        event.waitUntil(clients.openWindow('https://example.com/2'))
        break
      default:
        event.waitUntil(clients.openWindow('https://example.com/3'))
        break
    }
  })