"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Bell,
  ShoppingBag,
  Wallet,
  Gift,
  Megaphone,
  ShieldCheck,
  Check,
  ArrowRight,
  Clock,
  CheckCheck,
  RefreshCw,
} from "lucide-react";
import { Pagination } from "@/components/ui/Pagination";
import { useToast } from "@/components/ui/Toast";

type Notification = {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
};

interface Props {
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  unreadCount: number;
  setUnreadCount: React.Dispatch<React.SetStateAction<number>>;
  currentPage: number;
  totalPages: number;
  categoryCounts: Record<string, number>;
  currentCategory: string;
  currentOnlyUnread: boolean;
  onMarkRead: (n: Notification) => void;
}

const TYPE_CONFIG: Record<
  string,
  {
    label: string;
    icon: typeof Bell;
    bgUnread: string;
    borderUnread: string;
    iconBg: string;
    iconColor: string;
    badgeBg: string;
    badgeColor: string;
  }
> = {
  order_approved: {
    label: "Hoàn tiền",
    icon: ShoppingBag,
    bgUnread: "bg-emerald-50/50",
    borderUnread: "border-emerald-200/90 hover:border-emerald-300",
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    badgeBg: "bg-emerald-100/80 border-emerald-200/70",
    badgeColor: "text-emerald-700",
  },
  payment_paid: {
    label: "Thanh toán",
    icon: Wallet,
    bgUnread: "bg-primary-50/50",
    borderUnread: "border-primary-200/90 hover:border-primary-300",
    iconBg: "bg-primary-100",
    iconColor: "text-primary-600",
    badgeBg: "bg-primary-100/80 border-primary-200/70",
    badgeColor: "text-primary-700",
  },
  referral_bonus: {
    label: "Hoa hồng",
    icon: Gift,
    bgUnread: "bg-amber-50/50",
    borderUnread: "border-amber-200/90 hover:border-amber-300",
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    badgeBg: "bg-amber-100/80 border-amber-200/70",
    badgeColor: "text-amber-700",
  },
  broadcast: {
    label: "Tin MeowBack",
    icon: Megaphone,
    bgUnread: "bg-purple-50/50",
    borderUnread: "border-purple-200/90 hover:border-purple-300",
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
    badgeBg: "bg-purple-100/80 border-purple-200/70",
    badgeColor: "text-purple-700",
  },
  system: {
    label: "Hệ thống",
    icon: ShieldCheck,
    bgUnread: "bg-blue-50/50",
    borderUnread: "border-blue-200/90 hover:border-blue-300",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    badgeBg: "bg-blue-100/80 border-blue-200/70",
    badgeColor: "text-blue-700",
  },
};

const CATEGORIES = [
  { id: "all", label: "Tất cả", icon: Bell },
  { id: "order_approved", label: "Hoàn tiền", icon: ShoppingBag },
  { id: "payment_paid", label: "Thanh toán", icon: Wallet },
  { id: "referral_bonus", label: "Hoa hồng", icon: Gift },
  { id: "broadcast", label: "Tin MeowBack", icon: Megaphone },
  { id: "system", label: "Hệ thống", icon: ShieldCheck },
];

function formatNotificationTime(iso: string) {
  try {
    const date = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Vừa xong";
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays === 1) {
      return `Hôm qua, ${date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}`;
    }
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function NotificationsClient({
  notifications,
  setNotifications,
  unreadCount,
  setUnreadCount,
  currentPage,
  totalPages,
  categoryCounts,
  currentCategory,
  currentOnlyUnread,
  onMarkRead,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const handleCardClick = (n: Notification) => {
    onMarkRead(n);
    if (n.link) {
      router.push(n.link);
    }
  };

  const handleSingleMarkReadBtn = (e: React.MouseEvent, n: Notification) => {
    e.stopPropagation();
    onMarkRead(n);
    toast.success(`Đã đánh dấu đã đọc "${n.title}" 🎀`, "Đã đọc");
  };

  const handleCategoryChange = (catId: string) => {
    const params = new URLSearchParams(searchParams);
    if (catId === "all") {
      params.delete("category");
    } else {
      params.set("category", catId);
    }
    params.delete("page"); // Reset về trang 1
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleToggleUnread = (checked: boolean) => {
    const params = new URLSearchParams(searchParams);
    if (checked) {
      params.set("unread", "true");
    } else {
      params.delete("unread");
    }
    params.delete("page"); // Reset về trang 1
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex flex-col gap-5">
      {/* ═══ FILTER BAR (Dễ nhìn, không trượt ngang, hiển thị trọn vẹn) ═══ */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-primary-100/90 shadow-cute flex flex-col gap-3.5">
        {/* Header hàng lọc: Tiêu đề + Nút bật/tắt Chỉ tin chưa đọc */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-black uppercase tracking-wider text-neutral-400">
              Lọc theo danh mục
            </span>
            <span className="text-[11px] font-bold text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-full">
              {CATEGORIES.length} nhóm tin
            </span>
          </div>

          {/* Toggle Chỉ tin chưa đọc - Dạng pill switch bấm êm tay */}
          <button
            type="button"
            onClick={() => handleToggleUnread(!currentOnlyUnread)}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer select-none ${
              currentOnlyUnread
                ? "bg-rose-50 border border-rose-200 text-rose-600 shadow-2xs"
                : "bg-neutral-50 hover:bg-neutral-100/80 border border-neutral-200/70 text-neutral-600"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full transition-colors ${
                currentOnlyUnread ? "bg-rose-500 animate-pulse" : "bg-neutral-300"
              }`}
            />
            <span>Chỉ tin chưa đọc</span>
            {currentOnlyUnread && (
              <span className="text-[10px] bg-rose-200/70 text-rose-700 px-1.5 py-0.2 rounded-full font-black">
                Bật
              </span>
            )}
          </button>
        </div>

        {/* Danh sách 6 nút danh mục - Hiển thị wrap tự nhiên trên mọi màn hình, không trượt ngang */}
        <div className="flex flex-wrap items-center gap-2">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = currentCategory === cat.id;
            const count = categoryCounts[cat.id] || 0;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategoryChange(cat.id)}
                className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs sm:text-[13px] font-bold transition-all cursor-pointer select-none ${
                  isActive
                    ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-cute scale-[1.02]"
                    : "bg-neutral-50 hover:bg-primary-50/60 text-neutral-600 hover:text-primary-600 border border-neutral-200/70 hover:border-primary-200"
                }`}
              >
                <Icon size={14} className={isActive ? "text-white" : "text-neutral-400"} />
                <span>{cat.label}</span>
                {count > 0 && (
                  <span
                    className={`flex h-4 min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] font-black ${
                      isActive ? "bg-white/25 text-white" : "bg-neutral-200/80 text-neutral-700"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ═══ NOTIFICATION LIST ═══ */}
      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-3xl bg-white py-14 px-6 text-center border border-neutral-200/80 shadow-sm">
          <div className="relative">
            <img
              src="/meow-back-mascot.png"
              alt="No notifications"
              className="h-28 w-28 object-contain opacity-90 mx-auto"
            />
          </div>
          <div className="max-w-md">
            <h3 className="text-base font-extrabold text-neutral-900">
              {currentOnlyUnread ? "Tuyệt vời! Bạn không có tin chưa đọc 🐾" : "Chưa có thông báo nào trong mục này 🎀"}
            </h3>
            <p className="mt-1 text-xs sm:text-sm text-neutral-500 leading-relaxed font-medium">
              {currentOnlyUnread
                ? "Tất cả các tin thông báo đã được bạn xem qua. Bạn có thể bỏ lọc để xem lại lịch sử trước đó."
                : "Mọi cập nhật về duyệt tiền hoàn, thưởng giới thiệu bạn bè và các sự kiện hot sẽ xuất hiện ngay tại đây."}
            </p>
          </div>
          {currentOnlyUnread ? (
            <button
              onClick={() => handleToggleUnread(false)}
              className="mt-2 inline-flex items-center gap-2 rounded-full bg-primary-50 border border-primary-200 px-5 py-2 text-xs font-bold text-primary-600 hover:bg-primary-100 transition-colors cursor-pointer"
            >
              <RefreshCw size={13} />
              <span>Xem toàn bộ thông báo</span>
            </button>
          ) : (
            <Link
              href="/app/deals"
              className="mt-2 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-2.5 text-xs font-bold text-white shadow-cute hover:shadow-cute-lg transition-all"
            >
              <span>Khám phá ưu đãi hoàn tiền ngay</span>
              <ArrowRight size={14} />
            </Link>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {notifications.map((n) => {
            const config = TYPE_CONFIG[n.type] ?? TYPE_CONFIG.system;
            const Icon = config.icon;

            return (
              <div
                key={n.id}
                onClick={() => handleCardClick(n)}
                className={`group relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 rounded-2xl p-4 sm:p-5 transition-all duration-200 cursor-pointer border ${
                  !n.isRead
                    ? `${config.bgUnread} ${config.borderUnread} shadow-cute`
                    : "bg-white border-neutral-200/80 hover:border-neutral-300 hover:bg-neutral-50/40 shadow-xs"
                }`}
              >
                {/* Left Side: Icon + Details */}
                <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                  {/* Icon Box */}
                  <div
                    className={`flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl ${config.iconBg} ${config.iconColor} shadow-2xs border border-white`}
                  >
                    <Icon size={20} strokeWidth={2.3} />
                  </div>

                  {/* Body Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      {/* Category Badge */}
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10.5px] font-extrabold uppercase tracking-wider border ${config.badgeBg} ${config.badgeColor}`}
                      >
                        {config.label}
                      </span>

                      {/* Time ago */}
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-neutral-400">
                        <Clock size={11} />
                        {formatNotificationTime(n.createdAt)}
                      </span>

                      {/* Unread Glowing Dot */}
                      {!n.isRead && (
                        <span className="flex items-center gap-1 text-[11px] font-black text-primary-600 bg-primary-100/90 px-2 py-0.5 rounded-full">
                          <span className="h-2 w-2 rounded-full bg-primary-500 animate-pulse" />
                          Mới
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h4
                      className={`text-sm sm:text-[15px] leading-snug tracking-tight ${
                        !n.isRead ? "font-black text-neutral-900" : "font-bold text-neutral-800"
                      }`}
                    >
                      {n.title}
                    </h4>

                    {/* Message Body */}
                    <p className="mt-1 text-xs sm:text-[13px] text-neutral-600 font-medium leading-relaxed break-words">
                      {n.message}
                    </p>

                    {/* Link Action if available */}
                    {n.link && (
                      <div className="mt-2.5 inline-flex items-center gap-1 text-xs font-bold text-primary-600 group-hover:text-primary-700">
                        <span>Xem chi tiết liên quan</span>
                        <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Side: Mark Read Action */}
                <div className="shrink-0 flex items-center justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-100">
                  {!n.isRead ? (
                    <button
                      onClick={(e) => handleSingleMarkReadBtn(e, n)}
                      title="Đánh dấu đã đọc"
                      className="flex items-center gap-1.5 rounded-xl bg-white hover:bg-primary-50 px-3 py-1.5 text-xs font-bold text-neutral-600 hover:text-primary-600 border border-neutral-200/80 hover:border-primary-300 shadow-2xs transition-all"
                    >
                      <Check size={13} strokeWidth={2.5} />
                      <span>Đánh dấu đã đọc</span>
                    </button>
                  ) : (
                    <span className="text-[11px] font-semibold text-neutral-400 flex items-center gap-1">
                      <CheckCheck size={13} className="text-emerald-500" />
                      <span>Đã xem</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}

          {/* ═══ PAGINATION (TỐI ĐA 10 THÔNG BÁO / TRANG) ═══ */}
          <Pagination totalPages={totalPages} currentPage={currentPage} />
        </div>
      )}
    </div>
  );
}
