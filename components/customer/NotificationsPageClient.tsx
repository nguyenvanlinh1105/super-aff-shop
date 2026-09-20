"use client";

import { useState, useEffect } from "react";
import { Bell, MessagesSquare, BellRing, TrendingUp, CheckCheck, Sparkles } from "lucide-react";
import { NotificationsClient } from "./NotificationsClient";
import { CommunityChat } from "./CommunityChat";
import { FloatingElement } from "@/components/ui/FloatingElement";
import { IconBow } from "@/components/icons/CatRibbonIcons";
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

type ChatMessage = {
  id: string;
  userId: string;
  message: string;
  createdAt: string;
  user: { fullName: string; role: string };
};

type Tab = "notifications" | "chat";

interface Props {
  initialNotifications: Notification[];
  initialUnreadCount: number;
  currentPage: number;
  totalPages: number;
  initialTotalCount: number;
  cashbackCount: number;
  categoryCounts: Record<string, number>;
  currentCategory: string;
  currentOnlyUnread: boolean;
  totalChatCount: number;
  initialChatMessages: ChatMessage[];
  currentUserId: string;
  isAdmin: boolean;
}

export function NotificationsPageClient({
  initialNotifications,
  initialUnreadCount,
  currentPage,
  totalPages,
  initialTotalCount,
  cashbackCount,
  categoryCounts,
  currentCategory,
  currentOnlyUnread,
  totalChatCount,
  initialChatMessages,
  currentUserId,
  isAdmin,
}: Props) {
  const { toast } = useToast();
  const [tab, setTab] = useState<Tab>("notifications");
  const [notifications, setNotifications] = useState(initialNotifications);
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const [markingAll, setMarkingAll] = useState(false);

  useEffect(() => {
    setNotifications(initialNotifications);
  }, [initialNotifications]);

  useEffect(() => {
    setUnreadCount(initialUnreadCount);
  }, [initialUnreadCount]);

  const handleMarkAllRead = async () => {
    if (unreadCount === 0 || markingAll) return;
    setMarkingAll(true);
    setNotifications((prev) => prev.map((x) => ({ ...x, isRead: true })));
    setUnreadCount(0);
    try {
      await fetch("/api/notifications/mark-all-read", { method: "POST" });
      toast.success("Đã đánh dấu đọc toàn bộ thông báo! 🎀", "Thành công");
    } catch {
      toast.error("Không thể kết nối đến máy chủ", "Lỗi");
    } finally {
      setMarkingAll(false);
    }
  };

  const handleMarkSingleRead = (n: Notification) => {
    if (!n.isRead) {
      setNotifications((prev) => prev.map((x) => (x.id === n.id ? { ...x, isRead: true } : x)));
      setUnreadCount((c) => Math.max(0, c - 1));
      fetch(`/api/notifications/${n.id}`, { method: "PATCH" }).catch(() => {});
    }
  };

  return (
    <div className="flex w-full flex-col gap-6 fade-in pb-12">
      {/* ═══ 1. BANNER HEADER ═══ */}
      <div className="relative overflow-hidden rounded-3xl p-5 sm:p-7 border border-primary-200/60 shadow-xl shadow-primary-500/5 bg-white">
        <img src="/welcome-bg.png" alt="" className="absolute inset-0 w-full h-full object-cover opacity-80" />
        <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px]" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4 sm:gap-5">
            <FloatingElement duration={4}>
              <div className="w-14 h-14 sm:w-18 sm:h-18 rounded-3xl bg-gradient-to-br from-primary-400 via-primary-500 to-pink-600 text-white flex items-center justify-center shadow-lg shadow-primary-500/25 shrink-0 border-2 border-white overflow-hidden p-1">
                <img src="/meow-back-community.png" alt="Community" className="w-full h-full object-contain rounded-2xl" />
              </div>
            </FloatingElement>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary-100/90 text-primary-700 text-[11px] font-bold mb-1.5 border border-primary-200/60 shadow-2xs">
                <IconBow className="w-3.5 h-3.5 text-accent-bow" />
                <span>Trung Tâm Tin Tức & Giao Lưu 🎀</span>
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black leading-tight text-neutral-900 tracking-tight">
                Thông Báo & Cộng Đồng MeowBack
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-neutral-600 font-medium leading-relaxed max-w-xl">
                Cập nhật nhanh tiến độ duyệt hoàn tiền, tiền thưởng hoa hồng và kết nối trò chuyện cùng hội săn sale.
              </p>
            </div>
          </div>

          {/* Quick Mark All Read Action */}
          <div className="shrink-0 flex items-center gap-2 self-start sm:self-center">
            {unreadCount > 0 ? (
              <button
                onClick={handleMarkAllRead}
                disabled={markingAll}
                className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-primary-500 to-primary-600 px-4 py-2.5 text-xs sm:text-[13px] font-extrabold text-white shadow-cute hover:shadow-cute-lg hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
              >
                <CheckCheck size={16} strokeWidth={2.5} />
                <span>Đánh dấu đã đọc tất cả</span>
                <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-white/25 px-1.5 text-[11px] font-black">
                  {unreadCount}
                </span>
              </button>
            ) : (
              <div className="inline-flex items-center gap-2 rounded-2xl bg-emerald-50 border border-emerald-200/80 px-4 py-2 text-xs sm:text-[13px] font-bold text-emerald-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Bạn đã xem hết thông báo 🐾</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ═══ 2. TOP 3 THẺ TỔNG QUAN ═══ */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Thông báo chưa đọc */}
        <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-b from-white via-primary-50/25 to-white p-5 sm:p-6 shadow-cute border border-primary-200/80 hover:border-primary-400 hover:shadow-cute-lg transition-all duration-300 flex flex-col justify-between gap-3">
          <div className="absolute -right-2 -bottom-2 text-6xl select-none opacity-[0.06] pointer-events-none group-hover:scale-110 transition-transform">
            🔔
          </div>
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-100 text-primary-600 shadow-2xs">
                <BellRing size={18} strokeWidth={2.5} className={unreadCount > 0 ? "animate-bounce" : ""} />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Hộp thư</span>
                <div className="text-[13px] font-extrabold text-neutral-800">Tin chưa đọc</div>
              </div>
            </div>
            <span
              className={`rounded-full px-2.5 py-0.5 text-[10.5px] font-black uppercase tracking-wider ${
                unreadCount > 0
                  ? "bg-rose-50 border border-rose-200 text-rose-600 animate-pulse"
                  : "bg-emerald-50 border border-emerald-200 text-emerald-700"
              }`}
            >
              {unreadCount > 0 ? `${unreadCount} mới` : "Đã đọc hết"}
            </span>
          </div>
          <div className="relative z-10 pt-2 border-t border-primary-100/60">
            <div className="text-[10.5px] font-semibold text-neutral-400 uppercase tracking-wider">Thông báo cá nhân</div>
            <div className="text-2xl sm:text-3xl font-black text-primary-600 tabular-nums leading-tight mt-0.5">
              {unreadCount} <span className="text-[14px] font-bold text-neutral-500">/ {initialTotalCount} tổng tin</span>
            </div>
          </div>
          <div className="relative z-10 flex items-center gap-1.5 text-[11px] text-neutral-500 font-medium">
            <span className={`w-1.5 h-1.5 rounded-full ${unreadCount > 0 ? "bg-rose-500 animate-ping" : "bg-emerald-500"} shrink-0`} />
            <span>{unreadCount > 0 ? "Bấm vào từng tin để xem chi tiết" : "Không có tin nhắn tồn đọng"}</span>
          </div>
        </div>

        {/* Card 2: Sự kiện hoàn tiền & Thưởng */}
        <div className="group relative overflow-hidden rounded-3xl bg-white p-5 sm:p-6 shadow-sm border border-neutral-200/80 hover:border-emerald-300 hover:shadow-md transition-all duration-300 flex flex-col justify-between gap-3">
          <div className="absolute -right-2 -bottom-2 text-6xl select-none opacity-[0.06] pointer-events-none group-hover:scale-110 transition-transform">
            💰
          </div>
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-2xs">
                <TrendingUp size={18} strokeWidth={2.5} />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Hoàn tiền</span>
                <div className="text-[13px] font-extrabold text-neutral-800">Đơn & Thưởng ví</div>
              </div>
            </div>
            <span className="rounded-full bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 text-[10.5px] font-black uppercase text-emerald-700 tracking-wider">
              Tích luỹ
            </span>
          </div>
          <div className="relative z-10 pt-2 border-t border-neutral-100">
            <div className="text-[10.5px] font-semibold text-neutral-400 uppercase tracking-wider">Giao dịch đã ghi nhận</div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-600 tabular-nums leading-tight mt-0.5">
              {cashbackCount} <span className="text-[14px] font-bold text-neutral-500">thông báo</span>
            </div>
          </div>
          <div className="relative z-10 flex items-center gap-1.5 text-[11px] text-neutral-500 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
            <span>Bao gồm duyệt hoàn tiền, rút tiền & hoa hồng</span>
          </div>
        </div>

        {/* Card 3: Cộng đồng trò chuyện */}
        <div
          onClick={() => setTab("chat")}
          className="group relative overflow-hidden rounded-3xl bg-white p-5 sm:p-6 shadow-sm border border-neutral-200/80 hover:border-pink-300 hover:shadow-md transition-all duration-300 flex flex-col justify-between gap-3 cursor-pointer"
        >
          <div className="absolute -right-2 -bottom-2 text-6xl select-none opacity-[0.06] pointer-events-none group-hover:scale-110 transition-transform">
            💬
          </div>
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-pink-50 text-pink-600 border border-pink-100 shadow-2xs">
                <MessagesSquare size={18} strokeWidth={2.5} />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Giao lưu</span>
                <div className="text-[13px] font-extrabold text-neutral-800">Cộng đồng MeowBack</div>
              </div>
            </div>
            <span className="rounded-full bg-pink-50 border border-pink-200/80 px-2.5 py-0.5 text-[10.5px] font-black uppercase text-pink-700 tracking-wider">
              Trực tuyến
            </span>
          </div>
          <div className="relative z-10 pt-2 border-t border-neutral-100">
            <div className="text-[10.5px] font-semibold text-neutral-400 uppercase tracking-wider">Hội săn deal sôi nổi</div>
            <div className="text-2xl sm:text-3xl font-black text-neutral-900 tabular-nums leading-tight mt-0.5">
              {totalChatCount}+ <span className="text-[14px] font-bold text-neutral-500">tin nhắn</span>
            </div>
          </div>
          <div className="relative z-10 flex items-center justify-between text-[11px] text-primary-600 font-bold group-hover:translate-x-0.5 transition-transform">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span>Bấm để vào phòng chat ngay</span>
            </div>
            <span>→</span>
          </div>
        </div>
      </div>

      {/* ═══ 3. SEGMENTED TAB SWITCHER (2 Cột đầy đủ, không trượt, chạm bấm dễ dàng) ═══ */}
      <div className="grid grid-cols-2 gap-2 p-1.5 bg-white rounded-3xl border border-primary-100/90 shadow-cute">
        <button
          type="button"
          onClick={() => setTab("notifications")}
          className={`flex items-center justify-center gap-2 sm:gap-2.5 py-3 px-3 sm:px-5 rounded-2xl text-[13.5px] sm:text-[15px] font-black transition-all cursor-pointer select-none ${
            tab === "notifications"
              ? "bg-gradient-to-r from-primary-400 via-primary-500 to-pink-500 text-white shadow-cute"
              : "bg-neutral-50/70 hover:bg-primary-50/60 text-neutral-600 hover:text-primary-600"
          }`}
        >
          <Bell size={18} strokeWidth={tab === "notifications" ? 2.5 : 2} className={tab === "notifications" ? "text-white" : "text-neutral-500"} />
          <span>Thông báo cá nhân</span>
          {unreadCount > 0 && (
            <span
              className={`flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[11px] font-black ${
                tab === "notifications"
                  ? "bg-white text-primary-600 shadow-2xs"
                  : "bg-rose-500 text-white"
              }`}
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setTab("chat")}
          className={`flex items-center justify-center gap-2 sm:gap-2.5 py-3 px-3 sm:px-5 rounded-2xl text-[13.5px] sm:text-[15px] font-black transition-all cursor-pointer select-none ${
            tab === "chat"
              ? "bg-gradient-to-r from-primary-400 via-primary-500 to-pink-500 text-white shadow-cute"
              : "bg-neutral-50/70 hover:bg-primary-50/60 text-neutral-600 hover:text-primary-600"
          }`}
        >
          <MessagesSquare size={18} strokeWidth={tab === "chat" ? 2.5 : 2} className={tab === "chat" ? "text-white" : "text-neutral-500"} />
          <span>Chat cộng đồng</span>
          <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="hidden sm:inline">Online</span>
          </span>
        </button>
      </div>

      {/* ═══ 4. TAB CONTENTS ═══ */}
      {tab === "notifications" && (
        <NotificationsClient
          notifications={notifications}
          setNotifications={setNotifications}
          unreadCount={unreadCount}
          setUnreadCount={setUnreadCount}
          currentPage={currentPage}
          totalPages={totalPages}
          categoryCounts={categoryCounts}
          currentCategory={currentCategory}
          currentOnlyUnread={currentOnlyUnread}
          onMarkRead={handleMarkSingleRead}
        />
      )}

      {tab === "chat" && (
        <CommunityChat
          initialMessages={initialChatMessages}
          currentUserId={currentUserId}
          isAdmin={isAdmin}
        />
      )}
    </div>
  );
}
