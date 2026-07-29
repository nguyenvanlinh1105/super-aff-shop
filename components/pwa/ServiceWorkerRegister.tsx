"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
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
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Khong chan trai nghiem neu dang ky service worker that bai.
      });
    }
  }, []);

  return null;
}
