import React, { useEffect, useRef, useState } from 'react';
import API from '../api/axios';

export default function NotificationProvider({ children }) {
  const lastMsgIdRef = useRef(0);
  const myTouringIdsRef = useRef(new Set());
  const username = localStorage.getItem('username') || 'User';
  const token = localStorage.getItem('token');
  const [swRegistration, setSwRegistration] = useState(null);

  // 1. Inisialisasi Service Worker & Dapatkan Pesan Terakhir saat pertama load
  useEffect(() => {
    if (!token) return;

    // Register Service Worker
    if ('serviceWorker' in navigator && 'Notification' in window) {
      navigator.serviceWorker.register('/sw.js')
        .then(reg => setSwRegistration(reg))
        .catch(err => console.error('Service Worker registration failed:', err));
        
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }

    // Set initial lastMsgIdRef agar tidak memanggil notifikasi untuk pesan lampau saat pertama login
    const initLastId = async () => {
      try {
        // Ambil semua grup yang kita ikuti, cari ID terbesar dari diskusinya
        const res = await API.get('/api/my-touring');
        const myRegs = Array.isArray(res.data) ? res.data : [];
        
        // Simpan ID touring yang kita ikuti
        const idSet = new Set();
        myRegs.forEach(reg => idSet.add(reg.touring_id));
        myTouringIdsRef.current = idSet;

        let maxId = 0;
        
        // Kita cukup set ID yang sangat besar atau ambil pesan terbaru secara manual
        // Agar lebih cepat, panggil endpoint terbaru dengan last_id = 0, lalu ambil ID terbesarnya saja TANPA memunculkan notif
        const latestRes = await API.get('/api/diskusi/latest?last_id=0');
        const msgs = Array.isArray(latestRes.data) ? latestRes.data : [];
        
        if (msgs.length > 0) {
          maxId = msgs[msgs.length - 1].id;
        }
        lastMsgIdRef.current = maxId;
      } catch (err) {
        console.error("Gagal inisialisasi notifikasi global", err);
      }
    };

    initLastId();
  }, [token]);

  // 2. Polling Global secara background
  useEffect(() => {
    if (!token || !swRegistration) return;

    let interval = setInterval(async () => {
      try {
        const res = await API.get(`/api/diskusi/latest?last_id=${lastMsgIdRef.current}`);
        const newMsgs = Array.isArray(res.data) ? res.data : [];

        if (newMsgs.length > 0) {
          newMsgs.forEach(msg => {
            // Jangan notif pesan kita sendiri
            if (msg.user?.username !== username) {
              
              // Filter: pastikan grup ini adalah grup yang kita ikuti?
              if (!myTouringIdsRef.current.has(msg.touring_id)) {
                return; // Lewati notifikasi jika kita tidak ikut grup ini
              }

              // Cek apakah user sedang membuka chat ini di layar (aktif)
              const url = new URL(window.location.href);
              const isCurrentlyViewingChat = url.pathname.includes('/dashboard/forum') && 
                                             url.searchParams.get('id') === String(msg.touring_id) && 
                                             document.visibilityState === 'visible';
              
              if (!isCurrentlyViewingChat && Notification.permission === 'granted') {
                const title = `Pesan baru di ${msg.touring?.title || msg.touring?.nama_touring || 'Forum'}`;
                const options = {
                  body: `${msg.user?.username}: ${msg.message}`,
                  icon: '/vite.svg', // Icon bawaan vite
                  data: { 
                    touringId: msg.touring_id,
                    token: token,
                    backendUrl: API.defaults.baseURL // Kirim config axios ke sw
                  },
                  actions: [
                    {
                      action: 'reply',
                      type: 'text',
                      title: 'Balas'
                    }
                  ]
                };
                
                // Gunakan Service Worker untuk memunculkan notifikasi dengan ACTIONS (Balas)
                swRegistration.showNotification(title, options);
              }
            }
          });
          
          // Update last ID
          lastMsgIdRef.current = newMsgs[newMsgs.length - 1].id;
        }
      } catch (err) {
        // Abaikan error polling
      }
    }, 5000); // Polling setiap 5 detik

    return () => clearInterval(interval);
  }, [token, swRegistration, username]);

  // 3. Listener untuk menerima perintah SEND_REPLY dari Service Worker
  useEffect(() => {
    const handleMessage = async (event) => {
      if (event.data && event.data.type === 'SEND_REPLY') {
        const { touringId, message } = event.data.payload;
        try {
          await API.post(`/api/touring/${touringId}/diskusi`, { message });
          console.log("Balasan cepat terkirim dari SW!");
          // Karena kita mengirim pesan, kita akan update lastMsgIdRef saat pesan kita di-fetch nanti
        } catch (err) {
          console.error("Gagal mengirim balasan cepat", err);
        }
      }
    };

    navigator.serviceWorker?.addEventListener('message', handleMessage);
    return () => navigator.serviceWorker?.removeEventListener('message', handleMessage);
  }, []);

  return <>{children}</>;
}
