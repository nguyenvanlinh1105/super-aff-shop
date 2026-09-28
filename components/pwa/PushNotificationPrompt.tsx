"use client";

import { useState, useEffect } from "react";
import { Bell, BellOff, Check, X, AlertCircle } from "lucide-react";
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
          confetti({ particleCount: 35, spread: 50, origin: { y: 0.8 } });
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

  // 1. Nếu trình duyệt không hỗ trợ Web Push
  if (!supported) {
    if (inSettings) {
      return (
        <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 text-neutral-600 text-xs font-medium">
          Trình duyệt này hiện chưa hỗ trợ tính năng nhận thông báo trực tiếp.
        </div>
      );
    }
    return null;
  }

  // 2. Trạng thái ĐÃ BẬT THÔNG BÁO
  if (permission === "granted" && isSubscribed) {
    if (!inSettings) {
      return null;
    }

    // Khi ở trang Cài đặt -> Hiển thị card trạng thái đang bật và nút "Tắt thông báo"
    return (
      <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Check size={20} strokeWidth={2.8} />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/90 px-2.5 py-0.5 rounded-full mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Đang bật nhận thông báo</span>
            </div>
            <h4 className="text-sm sm:text-base font-bold text-neutral-900 tracking-tight">
              Thông báo trên thiết bị đang hoạt động
            </h4>
            <p className="text-xs text-neutral-600 font-medium mt-0.5">
              Bạn sẽ nhận thông báo tức thì khi có tiền hoàn, duyệt đơn hoặc ưu đãi mới.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleDisable}
          disabled={loading}
          className="px-4 py-2.5 rounded-xl bg-white hover:bg-rose-50 text-rose-600 hover:text-rose-700 border border-rose-200 hover:border-rose-300 shadow-2xs text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 shrink-0 active:scale-95 disabled:opacity-50"
        >
          <BellOff size={16} />
          <span>{loading ? "Đang xử lý..." : "Tắt thông báo"}</span>
        </button>
      </div>
    );
  }

  // 3. Trạng thái BỊ CHẶN QUYỀN TRÊN TRÌNH DUYỆT
  if (permission === "denied") {
    if (!inSettings) return null;

    return (
      <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/90 border border-amber-200/80 text-amber-900 text-xs font-medium flex items-start gap-3.5">
        <AlertCircle size={20} className="text-amber-600 shrink-0 mt-0.5" />
        <div>
          <strong className="font-bold text-sm block mb-1 text-amber-950">
            Quyền nhận thông báo đang bị chặn trên trình duyệt
          </strong>
          <span className="text-amber-800 leading-relaxed text-xs">
            Vui lòng nhấn vào biểu tượng <strong>Cài đặt / Ổ khóa</strong> trên thanh địa chỉ của trình duyệt và chọn <strong>Cho phép thông báo</strong> để có thể bật lại.
          </span>
        </div>
      </div>
    );
  }

  // 4. Trạng thái CHƯA BẬT
  if (inSettings) {
    return (
      <div className="p-4 sm:p-5 rounded-2xl bg-neutral-50/80 border border-neutral-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-neutral-200/80 text-neutral-600 flex items-center justify-center shrink-0">
            <BellOff size={20} />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-neutral-600 bg-neutral-200/70 px-2.5 py-0.5 rounded-full mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
              <span>Đang tắt thông báo</span>
            </div>
            <h4 className="text-sm sm:text-base font-bold text-neutral-900 tracking-tight">
              Chưa bật thông báo trên thiết bị này
            </h4>
            <p className="text-xs text-neutral-500 font-medium mt-0.5">
              Bật để nhận thông báo tức thì khi có tiền hoàn về ví hoặc đơn hàng được duyệt.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleEnable}
          disabled={loading}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-rose-500 hover:from-primary-600 hover:to-rose-600 text-white shadow-cute text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 shrink-0 active:scale-95 disabled:opacity-50"
        >
          <Bell size={16} />
          <span>{loading ? "Đang bật..." : "Bật thông báo"}</span>
        </button>
      </div>
    );
  }

  // Nếu ở trang Thông báo (/app/notifications):
  if (dismissed) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-rose-500 via-pink-500 to-primary-600 p-4 sm:p-5 text-white shadow-cute border border-pink-400/30">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 sm:gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white shrink-0 border border-white/25 shadow-xs p-1">
            <img
              src="/meowback_lucky_cat_logo.png"
              alt="MeowBack"
              className="w-full h-full object-contain rounded-xl"
            />
          </div>
          <div>
            <div className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-pink-100 bg-white/15 px-2 py-0.5 rounded-full mb-1">
              <span>Thông báo tức thì</span>
            </div>
            <h4 className="text-sm sm:text-[15px] font-extrabold tracking-tight leading-snug">
              Nhận thông báo hoàn tiền &amp; ưu đãi
            </h4>
            <p className="text-xs text-pink-100 font-medium leading-relaxed">
              Cập nhật tức thì khi đơn hàng được duyệt hoặc tiền hoàn về ví của bạn.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          <button
            type="button"
            onClick={handleEnable}
            disabled={loading}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl sm:rounded-2xl bg-white text-rose-600 hover:bg-rose-50 text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer disabled:opacity-50"
          >
            <Bell size={14} strokeWidth={2.2} />
            <span>{loading ? "Đang bật..." : "Bật thông báo"}</span>
          </button>
          <button
            type="button"
            onClick={handleDismiss}
            className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center transition-all cursor-pointer"
            title="Đóng thông báo"
          >
            <X size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
