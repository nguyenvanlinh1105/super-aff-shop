"use client";

import { useState, useEffect } from "react";
import {
  Bell,
  BellOff,
  BellRing,
  Check,
  CheckCircle2,
  X,
  AlertCircle,
} from "lucide-react";
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

  async function handleSendTest() {
    if (typeof window === "undefined" || !("Notification" in window) || Notification.permission !== "granted") {
      toast.error("Vui lòng cấp quyền thông báo trước.");
      return;
    }
    try {
      if ("serviceWorker" in navigator) {
        const reg = await navigator.serviceWorker.ready;
        if (reg && "showNotification" in reg) {
          await reg.showNotification("MeowBack 🐾", {
            body: "✨ Thông báo thử nghiệm hoạt động hoàn hảo trên thiết bị của bạn!",
            icon: "/meowback_lucky_cat_logo.png",
            badge: "/icon-192.png",
            tag: "meowback-test-" + Date.now(),
          });
          toast.success("Đã gửi thông báo thử nghiệm lên thiết bị!");
          return;
        }
      }
      new Notification("MeowBack 🐾", {
        body: "✨ Thông báo thử nghiệm hoạt động hoàn hảo trên thiết bị của bạn!",
        icon: "/meowback_lucky_cat_logo.png",
      });
      toast.success("Đã gửi thông báo thử nghiệm lên thiết bị!");
    } catch {
      toast.info("Không thể gửi thông báo thử trên trình duyệt này.");
    }
  }

  // 1. Nếu trình duyệt không hỗ trợ Web Push
  if (!supported) {
    if (inSettings) {
      return (
        <div className="rounded-2xl bg-neutral-50/90 border border-neutral-200/90 p-4 sm:p-5 flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-neutral-200/60 text-neutral-500 flex items-center justify-center shrink-0">
            <BellOff size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-neutral-800">
              Trình duyệt không hỗ trợ Web Push
            </h4>
            <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
              Trình duyệt hoặc chế độ ẩn danh hiện tại không hỗ trợ nhận thông báo đẩy. Bạn có thể sử dụng tính năng liên kết <strong>Telegram Bot</strong> bên dưới để nhận tin nhắn hoàn tiền tức thì.
            </p>
          </div>
        </div>
      );
    }
    return null;
  }

  // 2. Trạng thái BỊ CHẶN QUYỀN TRÊN TRÌNH DUYỆT (Permission Denied)
  if (permission === "denied") {
    if (!inSettings) return null;

    return (
      <div className="rounded-2xl bg-gradient-to-br from-amber-50/90 via-orange-50/30 to-amber-50/80 border border-amber-200/90 p-4 sm:p-6 flex flex-col gap-4 shadow-xs">
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-amber-100 border border-amber-200/80 text-amber-700 flex items-center justify-center shrink-0 shadow-2xs mt-0.5 sm:mt-0">
            <AlertCircle size={22} strokeWidth={2.2} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="inline-flex items-center gap-1.5 text-[10.5px] font-black uppercase tracking-wider text-amber-800 bg-amber-100/90 px-2.5 py-0.5 rounded-full whitespace-nowrap shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                Bị chặn trên trình duyệt
              </span>
            </div>
            <h4 className="text-base sm:text-[17px] font-black text-amber-950 tracking-tight leading-snug">
              Quyền nhận thông báo đang bị chặn
            </h4>
            <p className="text-xs sm:text-[13px] text-amber-900/80 font-medium mt-1 leading-relaxed">
              Trình duyệt của bạn đang chặn thông báo từ <strong>meowback.shop</strong>. Để bật lại thông báo:
            </p>
          </div>
        </div>

        <div className="rounded-2xl bg-white/90 border border-amber-200/80 p-3.5 sm:p-4 text-xs text-amber-950 space-y-2 font-medium">
          <div className="flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-lg bg-amber-100 text-amber-900 font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">1</span>
            <span>Nhấn vào biểu tượng <strong>Cài đặt / Ổ khóa 🔒</strong> trên thanh địa chỉ của trình duyệt.</span>
          </div>
          <div className="flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-lg bg-amber-100 text-amber-900 font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">2</span>
            <span>Tại mục <strong>Thông báo (Notifications)</strong>, chuyển sang <strong>Cho phép (Allow)</strong>.</span>
          </div>
          <div className="flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-lg bg-amber-100 text-amber-900 font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">3</span>
            <span>Tải lại trang (F5) để hệ thống tự động kết nối lại.</span>
          </div>
        </div>
      </div>
    );
  }

  // 3. Trạng thái ĐÃ BẬT THÔNG BÁO (Active / Subscribed)
  if (permission === "granted" && !inSettings) {
    return null;
  }

  if (permission === "granted" && isSubscribed) {
    return (
      <div className="rounded-2xl bg-gradient-to-br from-emerald-50/90 via-white to-teal-50/60 border border-emerald-200/90 p-4 sm:p-6 flex flex-col gap-4 shadow-xs">
        {/* Header Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5 sm:gap-4 flex-1 min-w-0">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white flex items-center justify-center shrink-0 shadow-sm shadow-emerald-500/25 mt-0.5 sm:mt-0">
              <Check size={22} strokeWidth={2.8} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="inline-flex items-center gap-1.5 text-[10.5px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100/90 px-2.5 py-0.5 rounded-full whitespace-nowrap shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Đang hoạt động
                </span>
                <span className="text-[11px] text-emerald-700/80 font-medium hidden sm:inline whitespace-nowrap">
                  • Thiết bị này đã sẵn sàng
                </span>
              </div>
              <h4 className="text-base sm:text-[17px] font-black text-neutral-900 tracking-tight leading-snug">
                Thông báo trên thiết bị đã được kích hoạt 🎉
              </h4>
              <p className="text-xs sm:text-[13px] text-neutral-600 font-medium mt-1 leading-relaxed">
                Bạn sẽ nhận được thông báo đẩy tức thì mỗi khi phát sinh tiền hoàn về ví hoặc đơn hàng được duyệt.
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 shrink-0 md:pl-2">
            <button
              type="button"
              onClick={handleSendTest}
              className="h-10 sm:h-11 px-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/90 shadow-2xs text-xs sm:text-[13px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-98 whitespace-nowrap"
              title="Gửi thử một thông báo lên màn hình thiết bị"
            >
              <BellRing size={15} />
              <span>Gửi thử thông báo</span>
            </button>
            <button
              type="button"
              onClick={handleDisable}
              disabled={loading}
              className="h-10 sm:h-11 px-4 rounded-xl bg-white hover:bg-rose-50 text-neutral-600 hover:text-rose-600 border border-neutral-200 hover:border-rose-200 shadow-2xs text-xs sm:text-[13px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-98 disabled:opacity-50 whitespace-nowrap"
            >
              <BellOff size={15} />
              <span>{loading ? "Đang tắt..." : "Tắt thông báo"}</span>
            </button>
          </div>
        </div>

        {/* Feature status strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-3.5 border-t border-emerald-100/90 text-xs">
          <div className="flex items-center gap-2 font-semibold text-emerald-950 bg-white/80 rounded-xl px-3 py-2 border border-emerald-100/80 shadow-2xs">
            <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
            <span className="truncate">Tiền hoàn về ví tức thì</span>
          </div>
          <div className="flex items-center gap-2 font-semibold text-emerald-950 bg-white/80 rounded-xl px-3 py-2 border border-emerald-100/80 shadow-2xs">
            <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
            <span className="truncate">Trạng thái đơn hàng duyệt</span>
          </div>
          <div className="flex items-center gap-2 font-semibold text-emerald-950 bg-white/80 rounded-xl px-3 py-2 border border-emerald-100/80 shadow-2xs">
            <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
            <span className="truncate">Nhận chuông cả khi tắt web</span>
          </div>
        </div>
      </div>
    );
  }

  // 4. Trạng thái CHƯA BẬT (trong trang Cài đặt)
  if (inSettings) {
    return (
      <div className="rounded-2xl bg-gradient-to-br from-rose-50/70 via-white to-pink-50/50 border border-rose-200/80 p-4 sm:p-6 flex flex-col gap-4 shadow-xs">
        {/* Main Content Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5 sm:gap-4 flex-1 min-w-0">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-500 text-white flex items-center justify-center shrink-0 shadow-sm shadow-rose-500/25 mt-0.5 sm:mt-0">
              <Bell size={22} strokeWidth={2.2} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="inline-flex items-center gap-1.5 text-[10.5px] font-black uppercase tracking-wider text-rose-700 bg-rose-100/90 px-2.5 py-0.5 rounded-full whitespace-nowrap shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                  Chưa kích hoạt
                </span>
                <span className="text-[11px] text-neutral-400 font-medium hidden sm:inline whitespace-nowrap">
                  • Nhận chuông tức thì trên màn hình
                </span>
              </div>
              <h4 className="text-base sm:text-[17px] font-black text-neutral-900 tracking-tight leading-snug">
                Nhận thông báo đơn hàng &amp; ví tiền trên thiết bị
              </h4>
              <p className="text-xs sm:text-[13px] text-neutral-600 font-medium mt-1 leading-relaxed">
                Bật để nhận thông báo đẩy tức thì mỗi khi có hoa hồng phát sinh, đơn mua thành công hoặc tiền hoàn về ví MeowBack của bạn.
              </p>
            </div>
          </div>

          {/* Action button */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0 md:pl-2">
            <button
              type="button"
              onClick={handleEnable}
              disabled={loading}
              className="h-11 sm:h-12 px-6 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-primary-600 hover:from-rose-600 hover:to-pink-600 text-white text-xs sm:text-sm font-extrabold shadow-md shadow-rose-500/25 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50 hover:shadow-lg hover:shadow-rose-500/30 whitespace-nowrap"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Đang kết nối...
                </span>
              ) : (
                <>
                  <Bell size={16} strokeWidth={2.4} />
                  <span>Bật thông báo ngay 🔔</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Feature benefits strip (3 columns on PC) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-3.5 border-t border-rose-100 text-xs">
          <div className="flex items-center gap-2 font-semibold text-neutral-700 bg-white/90 rounded-xl px-3 py-2 border border-rose-100/70 shadow-2xs">
            <div className="w-5 h-5 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <CheckCircle2 size={13} strokeWidth={2.5} />
            </div>
            <span className="truncate">Báo tiền hoàn về ví 24/7</span>
          </div>
          <div className="flex items-center gap-2 font-semibold text-neutral-700 bg-white/90 rounded-xl px-3 py-2 border border-rose-100/70 shadow-2xs">
            <div className="w-5 h-5 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <CheckCircle2 size={13} strokeWidth={2.5} />
            </div>
            <span className="truncate">Cập nhật đơn duyệt tức thì</span>
          </div>
          <div className="flex items-center gap-2 font-semibold text-neutral-700 bg-white/90 rounded-xl px-3 py-2 border border-rose-100/70 shadow-2xs">
            <div className="w-5 h-5 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <CheckCircle2 size={13} strokeWidth={2.5} />
            </div>
            <span className="truncate">Không cần mở sẵn website</span>
          </div>
        </div>
      </div>
    );
  }

  // 5. Nếu ở trang Thông báo (/app/notifications):
  if (dismissed) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-rose-500 via-pink-500 to-primary-600 p-4 sm:p-5 text-white shadow-cute border border-pink-400/30">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 sm:gap-4">
        <div className="flex items-center gap-3.5 flex-1 min-w-0">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white shrink-0 border border-white/25 shadow-xs p-1">
            <img
              src="/meowback_lucky_cat_logo.png"
              alt="MeowBack"
              className="w-full h-full object-contain rounded-xl"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-pink-100 bg-white/15 px-2 py-0.5 rounded-full mb-1 whitespace-nowrap">
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
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl sm:rounded-2xl bg-white text-rose-600 hover:bg-rose-50 text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer disabled:opacity-50 whitespace-nowrap"
          >
            <Bell size={14} strokeWidth={2.2} />
            <span>{loading ? "Đang bật..." : "Bật thông báo"}</span>
          </button>
          <button
            type="button"
            onClick={handleDismiss}
            className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center transition-all cursor-pointer shrink-0"
            title="Đóng thông báo"
          >
            <X size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
