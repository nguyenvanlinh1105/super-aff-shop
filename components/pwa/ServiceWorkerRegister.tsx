"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    // Luôn xóa sạch toàn bộ CacheStorage để không bao giờ bị lưu code cũ
    if (typeof window !== "undefined" && "caches" in window) {
      caches.keys().then((keys) => {
        keys.forEach((key) => caches.delete(key));
      }).catch(() => {});
    }

    const enablePwa = process.env.NEXT_PUBLIC_ENABLE_PWA === "true";

    if (!enablePwa) {
      // Proactively clean up service workers during local dev if PWA is disabled
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          for (const registration of registrations) {
            registration.unregister().then((success) => {
              if (success) {
                console.log("🐾 Service Worker unregistered successfully.");
              }
            });
          }
        });
      }
      return;
    }

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .then((reg) => {
          console.log("🐾 Service Worker registered successfully with scope:", reg.scope);
          // Kiểm tra và cập nhật Service Worker mới ngay lập tức
          reg.update().catch(() => {});
        })
        .catch((err) => {
          console.warn("Service Worker registration failed:", err);
        });
    }
  }, []);

  return null;
}
