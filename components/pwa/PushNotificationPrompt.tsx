"use client";

import { useState, useEffect } from "react";
import {
  isPushNotificationSupported,
  getNotificationPermission,
  subscribeUserToPush,
  unsubscribeUserFromPush,
} from "@/lib/pushClient";
import { useToast } from "@/components/ui/Toast";

const BANNER_DISMISS_KEY = "meowback_push_banner_dismissed_at";
const DISMISS_DAYS = 7;

interface PushNotificationPromptProps {
  inSettings?: boolean;
  compact?: boolean;
}

export function PushNotificationPrompt({
  inSettings = false,
  compact = false,
}: PushNotificationPromptProps) {
  const { toast } = useToast();
  const [supported, setSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">("unsupported");
  const [loading, setLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const isSupp = isPushNotificationSupported();
    setSupported(isSupp);
    if (!isSupp) return;

    const perm = getNotificationPermission();
    setPermission(perm);

    if (perm === "granted") {
      navigator.serviceWorker?.ready.then((reg) => {
        reg.pushManager.getSubscription().then((sub) => {
          setIsSubscribed(Boolean(sub));
        });
      });
    }

    if (!inSettings) {
      const dismissedAt = localStorage.getItem(BANNER_DISMISS_KEY);
      if (dismissedAt) {
        const days = (Date.now() - Number(dismissedAt)) / (1000 * 60 * 60 * 24);
        if (days < DISMISS_DAYS) {
          setDismissed(true);
        }
      }
    }
  }, [inSettings]);

  function handleDismiss() {
    setDismissed(true);
    try {
      localStorage.setItem(BANNER_DISMISS_KEY, String(Date.now()));
    } catch (_) {}
  }

  async function handleEnable() {
    setLoading(true);
    const result = await subscribeUserToPush();
    setLoading(false);

    if (result.success) {
      setPermission("granted");
      setIsSubscribed(true);
      import("canvas-confetti")
        .then((mod) => {
          const confetti = mod.default;
          confetti({ particleCount: 30, spread: 45, origin: { y: 0.8 } });
        })
        .catch(() => {});
      toast.success("Đã kích hoạt nhận thông báo thành công.", "Thành công");
    } else {
      setPermission(getNotificationPermission());
      toast.error(result.error || "Không thể kích hoạt thông báo.", "Thông báo");
    }
  }

  async function handleDisable() {
    setLoading(true);
    const ok = await unsubscribeUserFromPush();
    setLoading(false);
    if (ok) {
      setIsSubscribed(false);
      toast.info("Đã tắt nhận thông báo trên thiết bị này.");
    } else {
      toast.error("Không thể tắt thông báo, vui lòng thử lại sau.", "Lỗi");
    }
  }

  async function handleSendTest() {
    if (typeof window === "undefined" || !("Notification" in window) || Notification.permission !== "granted") {
      toast.error("Vui lòng cấp quyền thông báo trước.");
      return;
    }
    try {
      if ("serviceWorker" in navigator) {
        const reg = await navigator.serviceWorker.ready;
        if (reg && "showNotification" in reg) {
          await reg.showNotification("MeowBack", {
            body: "Thông báo thử nghiệm hoạt động tốt trên thiết bị của bạn!",
            icon: "/favicon-96x96.png",
            badge: "/icon-192.png",
            tag: "meowback-test-" + Date.now(),
          });
          toast.success("Đã gửi thông báo thử nghiệm!");
          return;
        }
      }
      new Notification("MeowBack", {
        body: "Thông báo thử nghiệm hoạt động tốt trên thiết bị của bạn!",
        icon: "/favicon-96x96.png",
      });
      toast.success("Đã gửi thông báo thử nghiệm!");
    } catch {
      toast.info("Không thể gửi thông báo thử trên trình duyệt này.");
    }
  }

  // 1. Không hỗ trợ -> Ẩn hoàn toàn
  if (!supported) {
    return null;
  }

  // 2. Bị chặn quyền
  if (permission === "denied") {
    if (!inSettings) return null;

    return (
      <div className="rounded-2xl bg-amber-50/80 border border-amber-200/80 p-4 flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">
            Trạng thái thiết bị
          </span>
          <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full whitespace-nowrap">
            Đang bị chặn quyền
          </span>
        </div>
        <p className="text-xs text-amber-800 font-medium leading-relaxed">
          Trình duyệt đang chặn quyền thông báo. Vui lòng bấm vào biểu tượng <strong>Cài đặt / Ổ khóa 🔒</strong> trên thanh địa chỉ, chọn <strong>Cho phép thông báo</strong> và tải lại trang (F5).
        </p>
      </div>
    );
  }

  // 3. Đã kích hoạt thành công
  if (permission === "granted" && !inSettings) {
    return null;
  }

  if (permission === "granted" && isSubscribed) {
    return (
      <div className="flex flex-col gap-3">
        <div className="rounded-2xl bg-emerald-50/80 border border-emerald-200/80 p-4 flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
              Trạng thái thiết bị
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full whitespace-nowrap">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Đang hoạt động
            </span>
          </div>
          <p className="text-xs sm:text-[13px] text-emerald-800 font-medium leading-relaxed">
            Thiết bị này đã sẵn sàng nhận thông báo tức thì khi có tiền hoàn và đơn hàng mới.
          </p>
        </div>

        <div className="flex gap-2.5">
          <button
            type="button"
            onClick={handleSendTest}
            className="flex-1 h-10 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold transition-all cursor-pointer flex items-center justify-center active:scale-[0.98]"
          >
            Gửi thử thông báo
          </button>
          <button
            type="button"
            onClick={handleDisable}
            disabled={loading}
            className="h-10 px-4 rounded-xl bg-white hover:bg-rose-50 text-neutral-600 hover:text-rose-600 border border-neutral-200 text-xs font-bold transition-all cursor-pointer flex items-center justify-center active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? "Đang tắt..." : "Tắt thông báo"}
          </button>
        </div>
      </div>
    );
  }

  // 4. Chưa kích hoạt (trong trang Cài đặt)
  if (inSettings) {
    return (
      <div className="flex flex-col gap-3.5">
        <div className="rounded-2xl bg-neutral-50/90 border border-neutral-200/80 p-4 flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
              Trạng thái thiết bị
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-600 bg-neutral-200/70 px-2.5 py-0.5 rounded-full whitespace-nowrap">
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
              Chưa kích hoạt
            </span>
          </div>
          <p className="text-xs sm:text-[13px] text-neutral-600 font-medium leading-relaxed">
            Bật thông báo đẩy để nhận tin tức thì khi có tiền hoàn về ví hoặc đơn hàng mới được duyệt.
          </p>
        </div>

        <button
          type="button"
          onClick={handleEnable}
          disabled={loading}
          className="w-full h-11 rounded-xl bg-gradient-to-r from-primary-400 to-primary-500 hover:from-primary-500 hover:to-primary-600 text-white text-sm font-bold shadow-cute transition-all cursor-pointer flex items-center justify-center active:scale-[0.98] disabled:opacity-50"
        >
          {loading ? "Đang kết nối..." : "Bật thông báo ngay"}
        </button>
      </div>
    );
  }

  // 5. Banner thông báo (/app/notifications)
  if (dismissed) return null;

  return (
    <div className="rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 p-4 text-white shadow-cute flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="min-w-0">
        <h4 className="text-sm font-bold">Nhận thông báo đơn hàng &amp; ưu đãi</h4>
        <p className="text-xs text-pink-100 font-medium mt-0.5">
          Cập nhật tức thì khi tiền hoàn về ví hoặc đơn hàng được duyệt.
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={handleEnable}
          disabled={loading}
          className="px-4 py-2 rounded-xl bg-white text-rose-600 hover:bg-rose-50 text-xs font-bold shadow-sm transition-all active:scale-95 cursor-pointer disabled:opacity-50"
        >
          {loading ? "Đang bật..." : "Bật thông báo"}
        </button>
        <button
          type="button"
          onClick={handleDismiss}
          className="text-xs text-white/80 hover:text-white px-2 py-1 cursor-pointer"
        >
          Đóng
        </button>
      </div>
    </div>
  );
}
