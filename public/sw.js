// Service Worker MeowBack - KHÔNG CACHE BẤT KỲ TÀI NGUYÊN NÀO
// Chỉ phục vụ chức năng Web Push Notification (Thông báo màn hình khóa)

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

// Xóa sạch toàn bộ mọi cache trong CacheStorage ngay khi kích hoạt
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

// ─── WEB PUSH NOTIFICATIONS (HIỂN THỊ MÀN HÌNH KHÓA KỂ CẢ KHI TẮT APP) ────
self.addEventListener("push", (event) => {
  if (!event.data) return;

  let data = {};
  try {
    data = event.data.json();
  } catch (e) {
    data = { body: event.data.text() };
  }

  const title = data.title || "MeowBack 🎀";
  const options = {
    body: data.body || data.message || "Bạn có thông báo mới từ MeowBack 🐾",
    icon: data.icon || "/meowback_lucky_cat_logo.png",
    badge: data.badge || "/icon-192.png",
    data: {
      url: data.url || "/app",
      dateOfArrival: Date.now(),
    },
    vibrate: [100, 50, 100],
    tag: data.tag || "meowback-push",
    renotify: true,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// ─── CHẠM VÀO THÔNG BÁO -> MỞ TRANG TƯƠNG ỨNG ─────────────────────────
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = (event.notification.data && event.notification.data.url) || "/app";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((windowClients) => {
        for (const client of windowClients) {
          if (client.url.includes(self.location.origin) && "focus" in client) {
            client.navigate(targetUrl);
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      })
  );
});
