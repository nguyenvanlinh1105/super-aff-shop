"use client";

import { useState, useRef, useEffect } from "react";
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
  ChevronDown,
  Filter,
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

export function getNotificationTargetUrl(n: {
  link?: string | null;
  type: string;
  title?: string;
  message?: string;
}): string {
  // 1. Nếu có link cụ thể đã được khai báo
  if (n.link && n.link.trim() !== "") {
    return n.link;
  }

  // 2. Tự động nhận diện điều hướng thông minh theo loại & từ khoá
  const text = `${n.title || ""} ${n.message || ""}`.toLowerCase();

  // Săn deal / sale / flash sale / voucher / khuyến mãi
  if (
    text.includes("deal") ||
    text.includes("seal") ||
    text.includes("sale") ||
    text.includes("voucher") ||
    text.includes("khuyến mãi") ||
    text.includes("giảm giá") ||
    text.includes("săn") ||
    text.includes("ưu đãi")
  ) {
    return "/app/deals";
  }

  // Thanh toán / ví / rút tiền / số dư
  if (
    n.type === "payment_paid" ||
    text.includes("thanh toán") ||
    text.includes("chuyển khoản") ||
    text.includes("rút tiền") ||
    text.includes("ví") ||
    text.includes("số dư")
  ) {
    return "/app/wallet";
  }

  // Đơn hàng / hoàn tiền
  if (
    n.type === "order_approved" ||
    text.includes("đơn hàng") ||
    text.includes("hoàn tiền") ||
    text.includes("đối soát")
  ) {
    return "/app/orders";
  }

  // Hoa hồng / bạn bè / giới thiệu
  if (
    n.type === "referral_bonus" ||
    text.includes("hoa hồng") ||
    text.includes("bạn bè") ||
    text.includes("giới thiệu") ||
    text.includes("mời")
  ) {
    return "/app/referral";
  }

  return "/app";
}

export function getNotificationActionLabel(targetUrl: string): string {
  if (targetUrl.startsWith("/app/deals")) return "Khám phá Deals Hot ngay";
  if (targetUrl.startsWith("/app/wallet")) return "Xem Ví tiền & Số dư";
  if (targetUrl.startsWith("/app/orders")) return "Xem Đơn hàng hoàn tiền";
  if (targetUrl.startsWith("/app/referral")) return "Xem Hoa hồng & Mời bạn";
  return "Xem chi tiết";
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
    const targetUrl = getNotificationTargetUrl(n);
    if (targetUrl) {
      router.push(targetUrl);
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

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activeCat = CATEGORIES.find((c) => c.id === currentCategory) || CATEGORIES[0];
  const ActiveIcon = activeCat.icon;
  const activeCount = categoryCounts[activeCat.id] || 0;

  return (
    <div className="flex flex-col gap-5">
      {/* ═══ FILTER TOOLBAR: CUSTOMER SELECTION STYLE ═══ */}
      <div className="bg-white p-2.5 sm:p-3 rounded-2xl border border-primary-100/90 shadow-2xs flex items-center gap-2">
        {/* Custom Category Selection Dropdown */}
        <div ref={dropdownRef} className="relative flex-1 min-w-0">
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-full flex items-center justify-between gap-2 rounded-xl bg-neutral-50/80 hover:bg-neutral-100/80 border border-neutral-200/80 pl-2.5 pr-3 py-2 text-xs font-extrabold text-neutral-800 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-6 h-6 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center shrink-0">
                <ActiveIcon size={13} strokeWidth={2.2} />
              </div>
              <span className="truncate">{activeCat.label}</span>
              {activeCount > 0 && (
                <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-primary-200/80 text-primary-800 px-1 text-[9.5px] font-black shrink-0">
                  {activeCount}
                </span>
              )}
            </div>
            <ChevronDown
              size={14}
              strokeWidth={2.5}
              className={`text-neutral-400 shrink-0 transition-transform duration-200 ${
                dropdownOpen ? "rotate-180 text-primary-600" : ""
              }`}
            />
          </button>

          {/* Dropdown Menu Popover */}
          {dropdownOpen && (
            <div className="absolute left-0 top-full mt-1.5 w-full min-w-[240px] bg-white/95 backdrop-blur-md rounded-2xl border border-primary-100 shadow-xl shadow-primary-500/10 p-1.5 z-40 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-neutral-400 border-b border-neutral-100 mb-1 flex items-center justify-between">
                <span>Chọn danh mục tin</span>
                <span>{CATEGORIES.length} nhóm</span>
              </div>
              <div className="flex flex-col gap-0.5">
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = (currentCategory || "all") === cat.id;
                  const count = categoryCounts[cat.id] || 0;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        handleCategoryChange(cat.id);
                        setDropdownOpen(false);
                      }}
                      className={`flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isSelected
                          ? "bg-primary-50 text-primary-700 font-black"
                          : "text-neutral-700 hover:bg-neutral-50 hover:text-primary-600"
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 ${
                            isSelected
                              ? "bg-primary-500 text-white shadow-2xs"
                              : "bg-neutral-100 text-neutral-500"
                          }`}
                        >
                          <Icon size={11} strokeWidth={2.2} />
                        </div>
                        <span className="truncate">{cat.label}</span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {count > 0 && (
                          <span
                            className={`flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[9.5px] font-black ${
                              isSelected
                                ? "bg-primary-200/80 text-primary-800"
                                : "bg-neutral-100 text-neutral-600"
                            }`}
                          >
                            {count}
                          </span>
                        )}
                        {isSelected && <Check size={13} className="text-primary-600 shrink-0" strokeWidth={2.5} />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Toggle Chỉ tin chưa đọc */}
        <button
          type="button"
          onClick={() => handleToggleUnread(!currentOnlyUnread)}
          className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer select-none ${
            currentOnlyUnread
              ? "bg-rose-50 border border-rose-300 text-rose-600 ring-2 ring-rose-200/40"
              : "bg-neutral-50/80 hover:bg-neutral-100/80 border border-neutral-200/80 text-neutral-600"
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full transition-colors ${
              currentOnlyUnread ? "bg-rose-500 animate-pulse" : "bg-neutral-300"
            }`}
          />
          <span className="whitespace-nowrap">Chưa đọc</span>
          {currentOnlyUnread && (
            <span className="text-[9.5px] bg-rose-200/80 text-rose-800 px-1 py-0.2 rounded-full font-black">
              Bật
            </span>
          )}
        </button>
      </div>

      {/* ═══ NOTIFICATION LIST ═══ */}
      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-3xl bg-white py-14 px-6 text-center border border-neutral-200/80 shadow-sm">
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 mx-auto rounded-3xl overflow-hidden shadow-cute border-2 border-primary-100/80 bg-pink-50/60 p-1">
            <img
              src="/meow-back-mascot.png"
              alt="No notifications"
              className="w-full h-full object-contain rounded-2xl"
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
                className={`group relative flex items-start gap-3 sm:gap-3.5 rounded-2xl p-3 sm:p-3.5 transition-all duration-150 cursor-pointer border ${
                  !n.isRead
                    ? `${config.bgUnread} ${config.borderUnread} shadow-2xs hover:shadow-cute-sm`
                    : "bg-white border-neutral-200/80 hover:border-neutral-300 hover:bg-neutral-50/50 shadow-2xs"
                }`}
              >
                {/* Left Side: Icon Box */}
                <div
                  className={`flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-2xl ${config.iconBg} ${config.iconColor} shadow-2xs border border-white mt-0.5`}
                >
                  <Icon size={18} strokeWidth={2.3} />
                </div>

                {/* Right Side: Details & Actions */}
                <div className="flex-1 min-w-0">
                  {/* Row 1: Badges, Time & Mark Read */}
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-md text-[9.5px] sm:text-[10px] font-black uppercase tracking-wider border ${config.badgeBg} ${config.badgeColor}`}
                      >
                        {config.label}
                      </span>
                      {!n.isRead && (
                        <span className="flex items-center gap-1 text-[10px] font-black text-rose-600 bg-rose-50 border border-rose-200 px-1.5 py-0.2 rounded-full">
                          <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
                          Mới
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-neutral-400">
                        <Clock size={10} />
                        {formatNotificationTime(n.createdAt)}
                      </span>

                      {!n.isRead ? (
                        <button
                          type="button"
                          onClick={(e) => handleSingleMarkReadBtn(e, n)}
                          title="Đánh dấu đã đọc"
                          className="flex items-center gap-1 px-1.5 py-0.5 rounded-lg text-[10.5px] font-bold text-neutral-400 hover:text-primary-600 hover:bg-white border border-transparent hover:border-primary-200 shadow-2xs transition-all cursor-pointer"
                        >
                          <Check size={12} strokeWidth={2.5} />
                          <span className="hidden sm:inline">Đã đọc</span>
                        </button>
                      ) : (
                        <span title="Đã xem" className="text-emerald-500/80">
                          <CheckCheck size={13} strokeWidth={2.5} />
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title */}
                  <h4
                    className={`text-xs sm:text-[13.5px] leading-snug tracking-tight ${
                      !n.isRead ? "font-black text-neutral-900" : "font-bold text-neutral-800"
                    }`}
                  >
                    {n.title}
                  </h4>

                  {/* Message Body */}
                  <p className="mt-0.5 text-[11.5px] sm:text-xs text-neutral-600 font-medium leading-relaxed line-clamp-2">
                    {n.message}
                  </p>

                  {/* Row 3: Action Link Prompt */}
                  {(() => {
                    const targetUrl = getNotificationTargetUrl(n);
                    const actionLabel = getNotificationActionLabel(targetUrl);
                    return (
                      <div className="mt-1.5 flex items-center justify-between">
                        <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-primary-600 group-hover:text-primary-700 transition-colors">
                          <span>{actionLabel}</span>
                          <ArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
                        </span>
                      </div>
                    );
                  })()}
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
