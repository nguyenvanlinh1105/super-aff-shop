"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCheck } from "lucide-react";
import { IllustCatEmpty } from "@/components/icons/CatRibbonIcons";

type Notification = {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
};

const TYPE_STYLE: Record<string, { bg: string; ring: string }> = {
  order_approved: { bg: "bg-[#E6F8EE]", ring: "ring-[#2D8A56]/20" },
  payment_paid: { bg: "bg-primary-50", ring: "ring-primary-200" },
  referral_bonus: { bg: "bg-secondary-50", ring: "ring-secondary-200" },
  broadcast: { bg: "bg-primary-100/60", ring: "ring-primary-300/40" },
  system: { bg: "bg-neutral-bg", ring: "ring-primary-100" },
};

function formatTime(iso: string) {
  return new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short" }).format(new Date(iso));
}

export function NotificationsClient({
  initialNotifications,
  initialUnreadCount,
  initialTotalPages,
}: {
  initialNotifications: Notification[];
  initialUnreadCount: number;
  initialTotalPages: number;
}) {
  const router = useRouter();
  const [notifications, setNotifications] = useState(initialNotifications);
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [loadingMore, setLoadingMore] = useState(false);

  async function markRead(n: Notification) {
    if (!n.isRead) {
      setNotifications((prev) => prev.map((x) => (x.id === n.id ? { ...x, isRead: true } : x)));
      setUnreadCount((c) => Math.max(0, c - 1));
      fetch(`/api/notifications/${n.id}`, { method: "PATCH" }).catch(() => {});
    }
    if (n.link) router.push(n.link);
  }

  async function markAllRead() {
    setNotifications((prev) => prev.map((x) => ({ ...x, isRead: true })));
    setUnreadCount(0);
    await fetch("/api/notifications/mark-all-read", { method: "POST" });
  }

  async function loadMore() {
    setLoadingMore(true);
    const nextPage = page + 1;
    const res = await fetch(`/api/notifications?page=${nextPage}`);
    if (res.ok) {
      const data = await res.json();
      setNotifications((prev) => [...prev, ...data.notifications]);
      setPage(nextPage);
      setTotalPages(data.totalPages);
    }
    setLoadingMore(false);
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div className="text-[13px] font-medium text-neutral-600">
          {unreadCount > 0 ? (
            <span>
              Bạn có <span className="font-extrabold text-primary-600">{unreadCount}</span> thông báo chưa đọc 🎀
            </span>
          ) : (
            "Bạn đã xem hết thông báo 🐾"
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-1.5 rounded-full bg-primary-100 px-4 py-1.5 text-[12px] font-bold text-primary-600 transition-colors hover:bg-primary-200"
          >
            <CheckCheck size={14} /> Đánh dấu tất cả đã đọc
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-3xl bg-white py-12 shadow-cute border border-primary-100/80">
          <IllustCatEmpty className="h-20 w-20" />
          <span className="text-[14px] font-bold text-neutral-400">Chưa có thông báo nào 🎀</span>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {notifications.map((n) => {
            const style = TYPE_STYLE[n.type] ?? TYPE_STYLE.system;
            return (
              <button
                key={n.id}
                onClick={() => markRead(n)}
                className={`flex items-start gap-3 rounded-2xl p-4 text-left shadow-cute border transition-all hover:-translate-y-0.5 ${
                  n.isRead ? "bg-white border-primary-100/80" : `${style.bg} ${style.ring} border-primary-200`
                }`}
              >
                {!n.isRead && <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-primary-500 shadow-cute" />}
                <div className={`min-w-0 flex-1 ${n.isRead ? "ml-4" : ""}`}>
                  <div className="flex items-center justify-between gap-3">
                    <span className={`text-[14px] ${n.isRead ? "font-bold text-neutral-700" : "font-extrabold text-neutral-900"}`}>
                      {n.title}
                    </span>
                    <span className="shrink-0 text-[11px] font-medium text-neutral-400">{formatTime(n.createdAt)}</span>
                  </div>
                  <p className="mt-1 text-[13px] font-medium text-neutral-600 leading-relaxed">{n.message}</p>
                </div>
              </button>
            );
          })}
          {page < totalPages && (
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="mx-auto mt-2 rounded-full border border-primary-200 bg-white px-6 py-2 text-[13px] font-bold text-primary-600 hover:bg-primary-50 transition-colors disabled:opacity-50 shadow-cute"
            >
              {loadingMore ? "Đang tải..." : "Tải thêm thông báo cũ hơn 🐾"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

