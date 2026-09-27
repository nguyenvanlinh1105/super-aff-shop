"use client";

import { useState, useEffect } from "react";
import { Bell, MessagesSquare, CheckCheck } from "lucide-react";
import { NotificationsClient } from "./NotificationsClient";
import { CommunityChat } from "./CommunityChat";
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
  const [mobileTab, setMobileTab] = useState<"notifications" | "chat">("notifications");
  const [notifications, setNotifications] = useState(initialNotifications);
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const [markingAll, setMarkingAll] = useState(false);

  useEffect(() => {
    setNotifications(initialNotifications);
  }, [initialNotifications]);

  useEffect(() => {
    setUnreadCount(initialUnreadCount);
  }, [initialUnreadCount]);

  // Lắng nghe sự kiện thông báo từ banner hoặc broadcast để cập nhật số lượng và danh sách
  useEffect(() => {
    const handleSet = (e: CustomEvent<number>) => {
      if (typeof e.detail === "number") setUnreadCount(e.detail);
    };
    const handleNotif = (e: CustomEvent<Notification>) => {
      setUnreadCount((prev) => prev + 1);
      if (e.detail) {
        setNotifications((prev) => [e.detail, ...prev]);
      }
    };
    window.addEventListener("meowback-unread-count" as any, handleSet);
    window.addEventListener("meowback-notification" as any, handleNotif);
    return () => {
      window.removeEventListener("meowback-unread-count" as any, handleSet);
      window.removeEventListener("meowback-notification" as any, handleNotif);
    };
  }, []);

  const handleMarkAllRead = async () => {
    if (unreadCount === 0 || markingAll) return;
    setMarkingAll(true);
    setNotifications((prev) => prev.map((x) => ({ ...x, isRead: true })));
    setUnreadCount(0);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("meowback-unread-count", { detail: 0 }));
    }
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
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("meowback-unread-delta", { detail: -1 }));
      }
      fetch(`/api/notifications/${n.id}`, { method: "PATCH" }).catch(() => {});
    }
  };

  return (
    <div className="flex w-full flex-col gap-5 fade-in pb-12">
      {/* ═══ 1. MOBILE SEGMENTED TAB SWITCHER (Chỉ hiển thị trên mobile < lg) ═══ */}
      <div className="lg:hidden grid grid-cols-2 gap-2 p-1.5 bg-white rounded-3xl border border-primary-100/90 shadow-cute">
        <button
          type="button"
          onClick={() => setMobileTab("notifications")}
          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl text-xs font-black transition-all cursor-pointer ${
            mobileTab === "notifications"
              ? "bg-gradient-to-r from-primary-400 via-primary-500 to-pink-500 text-white shadow-cute"
              : "bg-neutral-50 hover:bg-primary-50/60 text-neutral-600"
          }`}
        >
          <Bell size={15} strokeWidth={2.5} />
          <span>Cá nhân</span>
          {unreadCount > 0 && (
            <span
              className={`flex h-4.5 min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] font-black ${
                mobileTab === "notifications" ? "bg-white text-primary-600" : "bg-rose-500 text-white"
              }`}
            >
              {unreadCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setMobileTab("chat")}
          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl text-xs font-black transition-all cursor-pointer ${
            mobileTab === "chat"
              ? "bg-gradient-to-r from-primary-400 via-primary-500 to-pink-500 text-white shadow-cute"
              : "bg-neutral-50 hover:bg-primary-50/60 text-neutral-600"
          }`}
        >
          <MessagesSquare size={15} strokeWidth={2.5} />
          <span>Cộng đồng</span>
        </button>
      </div>

      {/* ═══ 2. TWO-COLUMN SPLIT LAYOUT (Chia đôi 50/50 song song trên Desktop) ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6 items-start">
        {/* CỘT 1: CÁ NHÂN */}
        <div className={`flex flex-col gap-3.5 ${mobileTab !== "notifications" ? "hidden lg:flex" : "flex"}`}>
          <div className="flex items-center justify-between gap-3 px-1">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center shadow-2xs">
                <Bell size={15} strokeWidth={2.5} />
              </div>
              <h2 className="text-sm sm:text-base font-extrabold text-neutral-900 tracking-tight">
                Cá nhân
              </h2>
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                disabled={markingAll}
                className="text-[11.5px] font-extrabold text-primary-600 hover:text-primary-700 bg-primary-50 hover:bg-primary-100 border border-primary-200/80 px-2.5 py-1 rounded-xl transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <CheckCheck size={13} strokeWidth={2.5} />
                <span>Đã đọc tất cả</span>
              </button>
            )}
          </div>

          {/* Component Danh Sách Thông Báo (Kèm Customer Selection Dropdown & Centered Pagination) */}
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
        </div>

        {/* CỘT 2: CỘNG ĐỒNG */}
        <div className={`flex flex-col gap-3.5 ${mobileTab !== "chat" ? "hidden lg:flex" : "flex"}`}>
          <div className="flex items-center justify-between gap-3 px-1">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center shadow-2xs">
                <MessagesSquare size={15} strokeWidth={2.5} />
              </div>
              <h2 className="text-sm sm:text-base font-extrabold text-neutral-900 tracking-tight">
                Cộng đồng
              </h2>
            </div>
            <div className="flex items-center gap-1 text-[10.5px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Trực tuyến 24/7</span>
            </div>
          </div>

          {/* Component Chat cố định trực tiếp trong cột */}
          <div className="lg:sticky lg:top-6">
            <CommunityChat
              initialMessages={initialChatMessages}
              currentUserId={currentUserId}
              isAdmin={isAdmin}
              isPopup={false}
              isActive={mobileTab === "chat"}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
