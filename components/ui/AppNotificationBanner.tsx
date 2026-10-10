"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { X, ArrowRight, Bell, Sparkles } from "lucide-react";
import {
  getNotificationTargetUrl,
  getNotificationActionLabel,
} from "@/components/customer/NotificationsClient";
import {
  getSeenNotificationIds,
  markNotificationIdsAsSeen,
  isNotificationSeen,
} from "@/lib/notificationClient";

type NotificationItem = {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
};

/**
 * Tạo âm thanh chuông thông báo nhẹ nhàng dạng "Ding-Dong"
 * bằng Web Audio API (thuần JS, không cần tải file MP3).
 */
function playNotificationChime() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    // Tone 1: Mi (E5 - 659Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(659.25, now);
    gain1.gain.setValueAtTime(0.08, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.3);

    // Tone 2: Si (B5 - 987Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(987.77, now + 0.1);
    gain2.gain.setValueAtTime(0.12, now + 0.1);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.1);
    osc2.stop(now + 0.5);
  } catch {}
}

export function AppNotificationBanner() {
  const router = useRouter();
  const pathname = usePathname();
  const [activeNotification, setActiveNotification] = useState<NotificationItem | null>(null);
  const [unseenTotalCount, setUnseenTotalCount] = useState<number>(1);
  const [visible, setVisible] = useState(false);
  const lastShownIdRef = useRef<string | null>(null);
  const dismissTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Hiển thị thông báo dạng App Push Banner (chỉ hiển thị trên giao diện In-App của website)
  const showBanner = useCallback((notif: NotificationItem, totalCount = 1) => {
    // Không hiện banner nếu người dùng đang ở ngay trang /app/notifications
    if (pathname?.startsWith("/app/notifications")) return;

    setActiveNotification(notif);
    setUnseenTotalCount(totalCount);
    setVisible(true);
    playNotificationChime();

    if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    // Tự động đóng sau 8 giây — và đánh dấu đã xem để không hiện lại lần sau
    dismissTimerRef.current = setTimeout(() => {
      markNotificationIdsAsSeen(notif.id);
      setVisible(false);
    }, 8000);
  }, [pathname]);

  const closeBanner = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (activeNotification) {
      // Đánh dấu thông báo này là đã xem vào localStorage để không hiện lại nữa
      markNotificationIdsAsSeen(activeNotification.id);
    }
    setVisible(false);
    if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
  };

  const handleBannerClick = async () => {
    if (!activeNotification) return;
    const n = activeNotification;

    // Đánh dấu đã xem popup vào localStorage để không hiện lại banner nữa
    markNotificationIdsAsSeen(n.id);
    closeBanner();

    // Chuyển hướng người dùng đến trang xem thông báo (hoặc link đính kèm).
    // Lưu ý: KHÔNG tự ý đánh dấu đã đọc ở đây để người dùng vào danh sách vẫn thấy tin mới.
    const targetUrl = getNotificationTargetUrl(n) || "/app/notifications";
    router.push(targetUrl);
  };

  // Khởi tạo & Polling kiểm tra thông báo mới
  useEffect(() => {
    let isMounted = true;

    async function checkNewNotifications() {
      // Đang ở trang thông báo thì không cần bắn popup banner
      if (pathname?.startsWith("/app/notifications")) return;

      try {
        const res = await fetch("/api/notifications?page=1", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();

        // Đồng bộ số lượng tin chưa đọc vào biểu tượng chuông trên Header
        if (typeof data.unreadCount === "number" && typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("meowback-unread-count", { detail: data.unreadCount })
          );
        }

        const list: NotificationItem[] = data.notifications || [];
        if (list.length === 0) return;

        // Lọc ra các thông báo CHƯA ĐỌC mà người dùng CHƯA TỪNG CLICK XEM (chưa có trong localStorage)
        const seenIds = getSeenNotificationIds();
        const unreadUnseen = list.filter((n) => !n.isRead && !seenIds.has(n.id));

        if (unreadUnseen.length === 0) return;

        const latest = unreadUnseen[0];

        // Tránh bắn lại cùng một thông báo liên tục
        if (lastShownIdRef.current === latest.id) return;

        lastShownIdRef.current = latest.id;
        if (isMounted) {
          showBanner(latest, unreadUnseen.length);
        }
      } catch {}
    }

    // Kiểm tra ngay khi tải trang
    void checkNewNotifications();

    // Polling định kỳ mỗi 15 giây
    const interval = setInterval(() => {
      void checkNewNotifications();
    }, 15000);

    // Lắng nghe sự kiện yêu cầu kiểm tra thông báo ngay lập tức
    const handleCheckTrigger = () => {
      void checkNewNotifications();
    };
    window.addEventListener("meowback-check-notifications" as any, handleCheckTrigger);

    // Lắng nghe sự kiện tức thì khi có thông báo mới phát ra
    const handleLocalBroadcast = (e: CustomEvent<NotificationItem>) => {
      if (e.detail && !isNotificationSeen(e.detail.id)) {
        lastShownIdRef.current = e.detail.id;
        showBanner(e.detail, 1);
      }
    };
    window.addEventListener("meowback-notification" as any, handleLocalBroadcast);

    // Lắng nghe thông điệp từ Service Worker (khi nhận được Web Push từ server)
    const handleSwMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === "MEOWBACK_PUSH_RECEIVED" && event.data.data) {
        const d = event.data.data;
        const item: NotificationItem = {
          id: d.id || `push-${Date.now()}`,
          type: d.type || "system",
          title: d.title || "MeowBack 🎀",
          message: d.body || d.message || "",
          link: d.url || null,
          isRead: false,
          createdAt: new Date().toISOString(),
        };
        if (!isNotificationSeen(item.id)) {
          lastShownIdRef.current = item.id;
          if (isMounted) {
            showBanner(item, 1);
          }
        }
      }
    };

    if (typeof navigator !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener("message", handleSwMessage);
    }

    return () => {
      isMounted = false;
      clearInterval(interval);
      window.removeEventListener("meowback-check-notifications" as any, handleCheckTrigger);
      window.removeEventListener("meowback-notification" as any, handleLocalBroadcast);
      if (typeof navigator !== "undefined" && "serviceWorker" in navigator) {
        navigator.serviceWorker.removeEventListener("message", handleSwMessage);
      }
      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    };
  }, [showBanner]);

  if (!visible || !activeNotification || pathname?.startsWith("/app/notifications")) return null;

  const targetUrl = getNotificationTargetUrl(activeNotification);
  const actionLabel = getNotificationActionLabel(targetUrl);

  return (
    <aside
      aria-label="Thông báo mới"
      className="fixed top-3 left-1/2 -translate-x-1/2 z-[99999] w-[94%] max-w-md pointer-events-auto select-none"
    >
      <div
        role="button"
        tabIndex={0}
        onClick={handleBannerClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleBannerClick();
          }
        }}
        className="group relative flex items-start gap-3 rounded-2xl sm:rounded-3xl bg-white/95 backdrop-blur-xl p-3.5 sm:p-4 shadow-2xl border border-rose-300/90 hover:border-rose-400 transition-all duration-300 animate-in slide-in-from-top-4 fade-in cursor-pointer hover:scale-[1.01] active:scale-[0.99] ring-4 ring-rose-500/10"
      >
        {/* App Mascot Icon */}
        <div className="relative h-11 w-11 shrink-0">
          <div className="h-full w-full rounded-full overflow-hidden bg-gradient-to-br from-rose-400 via-pink-500 to-rose-500 p-[2px] shadow-md shadow-rose-500/20 border-2 border-white">
            <img
              src="/meow-back-mascot.png"
              alt="MeowBack"
              className="h-full w-full object-cover rounded-full"
            />
          </div>
          <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-rose-600 ring-2 ring-white">
            <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pr-6">
          <div className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-rose-600 mb-0.5">
            <Sparkles size={11} className="text-rose-500 shrink-0" />
            <span className="truncate">MeowBack Thông Báo</span>
            <span className="text-neutral-300 font-normal shrink-0">•</span>
            <span className="text-neutral-400 font-bold lowercase shrink-0">mới</span>
            {unseenTotalCount > 1 && (
              <span className="ml-auto bg-rose-500 text-white text-[9.5px] font-black px-1.5 py-0.2 rounded-full shrink-0">
                +{unseenTotalCount - 1} tin khác
              </span>
            )}
          </div>

          <h4 className="text-xs sm:text-[13.5px] font-black text-neutral-900 leading-snug line-clamp-1">
            {activeNotification.title}
          </h4>

          <p className="mt-0.5 text-[11.5px] sm:text-xs font-medium text-neutral-600 leading-relaxed line-clamp-2">
            {activeNotification.message}
          </p>

          {/* Action pill */}
          <div className="mt-2 inline-flex items-center gap-1 text-[11px] font-extrabold text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-lg border border-rose-200 group-hover:bg-rose-100 transition-colors">
            <span>{actionLabel}</span>
            <ArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={closeBanner}
          className="absolute top-3 right-3 flex h-7 w-7 items-center justify-center rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
          title="Đóng thông báo"
          type="button"
        >
          <X size={15} strokeWidth={2.5} />
        </button>
      </div>
    </aside>
  );
}
