"use client";

function urlBase64ToUint8Array(base64String: string): BufferSource {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const buffer = new ArrayBuffer(rawData.length);
  const outputArray = new Uint8Array(buffer);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Kiểm tra xem trình duyệt / thiết bị hiện tại có hỗ trợ Web Push Notifications không.
 */
export function isPushNotificationSupported(): boolean {
  if (typeof window === "undefined") return false;
  return (
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

/**
 * Lấy trạng thái quyền thông báo hiện tại ("default" | "granted" | "denied")
 */
export function getNotificationPermission(): NotificationPermission | "unsupported" {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }
  return Notification.permission;
}

/**
 * Đăng ký nhận thông báo màn hình khóa (Web Push).
 */
export async function subscribeUserToPush(): Promise<{ success: boolean; error?: string }> {
  if (!isPushNotificationSupported()) {
    return { success: false, error: "Thiết bị hoặc trình duyệt này chưa hỗ trợ nhận thông báo đẩy." };
  }

  const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!vapidKey) {
    return { success: false, error: "Chưa cấu hình mã VAPID Public Key." };
  }

  try {
    // 1. Xin quyền người dùng
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      return { success: false, error: "Bạn đã từ chối cấp quyền thông báo trên trình duyệt." };
    }

    // 2. Đảm bảo Service Worker đã đăng ký và sẵn sàng
    let reg = await navigator.serviceWorker.getRegistration();
    if (!reg) {
      reg = await navigator.serviceWorker.register("/sw.js");
    }
    await navigator.serviceWorker.ready;

    // 3. Đăng ký với PushManager
    const applicationServerKey = urlBase64ToUint8Array(vapidKey);
    let subscription = await reg.pushManager.getSubscription();

    // Nếu chưa có subscription hoặc subscription cũ thiếu keys, hủy và tạo mới
    const currentKeys = subscription?.toJSON().keys;
    if (!subscription || !currentKeys?.p256dh || !currentKeys?.auth) {
      if (subscription) {
        try {
          await subscription.unsubscribe();
        } catch (_) {}
      }
      subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      });
    }

    // 4. Gửi subscription token lên server MeowBack
    const subJson = subscription.toJSON();
    const res = await fetch("/api/push/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        endpoint: subJson.endpoint,
        keys: subJson.keys,
        userAgent: navigator.userAgent,
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return { success: false, error: data.error || "Lỗi lưu đăng ký thông báo trên máy chủ." };
    }

    return { success: true };
  } catch (err: any) {
    console.error("Lỗi đăng ký Web Push:", err);
    return { success: false, error: err.message || "Không thể kích hoạt thông báo đẩy." };
  }
}

/**
 * Hủy đăng ký nhận thông báo Web Push trên thiết bị này.
 */
export async function unsubscribeUserFromPush(): Promise<boolean> {
  if (!isPushNotificationSupported()) return false;

  try {
    const reg = await navigator.serviceWorker.ready;
    const subscription = await reg.pushManager.getSubscription();
    if (!subscription) return true;

    await fetch("/api/push/unsubscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ endpoint: subscription.endpoint }),
    });

    await subscription.unsubscribe();
    return true;
  } catch (err) {
    console.error("Lỗi hủy đăng ký Web Push:", err);
    return false;
  }
}
