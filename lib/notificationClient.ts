"use client";

export const SEEN_NOTIFICATIONS_STORAGE_KEY = "meowback_seen_notification_ids";

/**
 * Lấy danh sách Set các ID thông báo mà người dùng đã xem/đã click/đã tắt popup.
 * Được lưu trong localStorage để không bao giờ hiện lại popup/toast cho lần sau.
 */
export function getSeenNotificationIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(SEEN_NOTIFICATIONS_STORAGE_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

/**
 * Đánh dấu 1 hoặc nhiều ID thông báo là "đã xem/đã click" vào localStorage.
 * Khi đó, các lần tải trang sau ("lần sau") sẽ KHÔNG bao giờ hiển thị lại popup/toast cho các thông báo này.
 */
export function markNotificationIdsAsSeen(ids: string | string[]) {
  if (typeof window === "undefined") return;
  try {
    const set = getSeenNotificationIds();
    const list = Array.isArray(ids) ? ids : [ids];
    let changed = false;
    for (const id of list) {
      if (id && typeof id === "string" && !set.has(id)) {
        set.add(id);
        changed = true;
      }
    }
    if (changed) {
      // Giới hạn tối đa 300 IDs gần nhất để tránh phình dung lượng localStorage
      const trimmed = Array.from(set).slice(-300);
      localStorage.setItem(SEEN_NOTIFICATIONS_STORAGE_KEY, JSON.stringify(trimmed));
      // Dispatch sự kiện thông báo để đồng bộ giữa các component / tab
      window.dispatchEvent(
        new CustomEvent("meowback-seen-notifications-updated", { detail: trimmed })
      );
    }
  } catch {}
}

/**
 * Kiểm tra xem 1 thông báo cụ thể đã được đánh dấu là "đã xem/đã click" hay chưa.
 */
export function isNotificationSeen(id: string): boolean {
  if (!id) return false;
  return getSeenNotificationIds().has(id);
}
