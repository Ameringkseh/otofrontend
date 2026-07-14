// sw.js
// Service Worker untuk Notifikasi Global & Fitur Balas (Quick Reply)

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Menangani klik pada notifikasi dan aksi Balas Cepat
self.addEventListener('notificationclick', function (event) {
  event.notification.close();

  const action = event.action;
  const data = event.notification.data; // Kita akan mengirim touring_id dan token di sini

  if (action === 'reply' && event.reply) {
    // Pengguna mengetik balasan dari notifikasi
    const replyText = event.reply;
    
    if (!data.token || !data.touringId) {
      console.error("Token atau Touring ID tidak tersedia di notifikasi");
      return;
    }

    // Karena backend menggunakan axios interceptors di aplikasi utama (dan base url berbeda di dev vs prod),
    // kita lempar pesan kembali ke aplikasi (window client) agar aplikasi yang memproses API request
    event.waitUntil(
      self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        // Jika ada tab yang terbuka, minta tab pertama untuk mengirim API (karena punya konfigurasi axios)
        for (const client of clientList) {
          if (client.url.includes(self.registration.scope)) {
            client.postMessage({
              type: 'SEND_REPLY',
              payload: {
                touringId: data.touringId,
                message: replyText
              }
            });
            return;
          }
        }
        
        // JIKA TIDAK ADA TAB SAMA SEKALI (Pure background)
        if (data.backendUrl) {
          fetch(`${data.backendUrl}/api/touring/${data.touringId}/diskusi`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${data.token}`
            },
            body: JSON.stringify({ message: replyText })
          }).catch(err => console.error("Gagal balas background", err));
        }
      })
    );
  } else {
    // Jika diklik biasa (bukan balas), buka halaman forum
    event.waitUntil(
      self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        if (clientList.length > 0) {
          let client = clientList[0];
          client.focus();
          if (data.touringId) {
             client.navigate(`/dashboard/forum?id=${data.touringId}`);
          }
        } else {
          self.clients.openWindow(data.touringId ? `/dashboard/forum?id=${data.touringId}` : '/dashboard');
        }
      })
    );
  }
});
