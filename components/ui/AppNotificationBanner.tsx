"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { X, ArrowRight, Bell, Sparkles } from "lucide-react";
import {
  getNotificationTargetUrl,
  getNotificationActionLabel,
} from "@/components/customer/NotificationsClient";

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
  const [activeNotification, setActiveNotification] = useState<NotificationItem | null>(null);
  const [visible, setVisible] = useState(false);
  const lastKnownIdRef = useRef<string | null>(null);
  const dismissTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Hiển thị thông báo dạng App Push Banner
  const showBanner = useCallback((notif: NotificationItem) => {
    setActiveNotification(notif);
    setVisible(true);
    playNotificationChime();

    // Đồng thời kích hoạt Web Notification của trình duyệt (nếu người dùng cho phép)
    try {
      if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
        new Notification(notif.title, {
          body: notif.message,
          icon: "/meowback_lucky_cat_logo.png",
          badge: "/meowback_lucky_cat_logo.png",
        });
      }
    } catch {}

    if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    // Tự động đóng sau 7 giây
    dismissTimerRef.current = setTimeout(() => {
      setVisible(false);
    }, 7000);
  }, []);

  const closeBanner = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setVisible(false);
    if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
  };

  const handleBannerClick = async () => {
    if (!activeNotification) return;
    const n = activeNotification;
    closeBanner();

    // Đánh dấu đã đọc trên server
    try {
      void fetch(`/api/notifications/${n.id}`, { method: "PATCH" });
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("meowback-unread-delta", { detail: -1 }));
      }
    } catch {}

    // Chuyển hướng thông minh tới đúng trang (Deals, Ví, Đơn hàng...)
    const targetUrl = getNotificationTargetUrl(n);
    if (targetUrl) {
      router.push(targetUrl);
    }
  };

  // Khởi tạo & Polling kiểm tra thông báo mới
  useEffect(() => {
    let isMounted = true;

    // Yêu cầu quyền thông báo trình duyệt nhẹ nhàng nếu chưa hỏi
    try {
      if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "default") {
        // Hỏi quyền sau 5 giây để không làm phiền ngay khi vừa vào web
        const permTimer = setTimeout(() => {
          void Notification.requestPermission();
        }, 5000);
        return () => clearTimeout(permTimer);
      }
    } catch {}

    async function checkNewNotifications(isInitial = false) {
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

        const latest = list[0];

        // Lần đầu tải trang: chỉ ghi nhận ID mới nhất, không bắn popup thông báo cũ
        if (isInitial) {
          lastKnownIdRef.current = latest.id;
          return;
        }

        // Các lần kiểm tra sau: nếu có thông báo mới chưa đọc và ID khác lần trước
        if (lastKnownIdRef.current && latest.id !== lastKnownIdRef.current && !latest.isRead) {
          lastKnownIdRef.current = latest.id;
          if (isMounted) {
            showBanner(latest);
          }
        }
      } catch {}
    }

    // Kiểm tra lần đầu
    void checkNewNotifications(true);

    // Polling định kỳ mỗi 15 giây
    const interval = setInterval(() => {
      void checkNewNotifications(false);
    }, 15000);

    // Lắng nghe sự kiện tức thì khi Admin phát thông báo trên cùng trình duyệt
    const handleLocalBroadcast = (e: CustomEvent<NotificationItem>) => {
      if (e.detail) {
        showBanner(e.detail);
      }
    };
    window.addEventListener("meowback-notification" as any, handleLocalBroadcast);

    return () => {
      isMounted = false;
      clearInterval(interval);
      window.removeEventListener("meowback-notification" as any, handleLocalBroadcast);
      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    };
  }, [showBanner]);

  if (!visible || !activeNotification) return null;

  const targetUrl = getNotificationTargetUrl(activeNotification);
  const actionLabel = getNotificationActionLabel(targetUrl);

  return (
    <aside
      aria-label="Thông báo mới"
      className="fixed top-3 left-1/2 -translate-x-1/2 z-[9999] w-[92%] max-w-md pointer-events-auto select-none"
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
        className="group relative flex items-start gap-3 rounded-2xl sm:rounded-3xl bg-white/95 backdrop-blur-xl p-3.5 sm:p-4 shadow-2xl border border-rose-300/80 hover:border-rose-400 transition-all duration-300 animate-in slide-in-from-top-4 fade-in cursor-pointer hover:scale-[1.01] active:scale-[0.99] ring-4 ring-rose-500/10"
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
            <Sparkles size={11} className="text-rose-500" />
            <span>MeowBack App</span>
            <span className="text-neutral-300 font-normal">•</span>
            <span className="text-neutral-400 font-bold lowercase">vừa xong</span>
          </div>

          <h4 className="text-xs sm:text-[13.5px] font-black text-neutral-900 leading-snug truncate">
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
