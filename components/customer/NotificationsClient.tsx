"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCheck, Bell, ShoppingBag, Wallet, Megaphone, Settings } from "lucide-react";
import { IllustCatEmpty } from "@/components/icons/CatRibbonIcons";
import { motion, AnimatePresence } from "framer-motion";

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

const TABS = [
  { id: "all", label: "Tất cả", icon: Bell },
  { id: "order_approved", label: "Hoàn tiền", icon: Wallet },
  { id: "payment_paid", label: "Thanh toán", icon: ShoppingBag },
  { id: "broadcast", label: "Thông báo", icon: Megaphone },
  { id: "system", label: "Hệ thống", icon: Settings },
];

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
  const [activeTab, setActiveTab] = useState("all");

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

  const filtered = activeTab === "all"
    ? notifications
    : notifications.filter((n) => n.type === activeTab);

  // Count unread per tab
  const tabCounts = TABS.reduce((acc, tab) => {
    acc[tab.id] = tab.id === "all"
      ? notifications.filter((n) => !n.isRead).length
      : notifications.filter((n) => n.type === tab.id && !n.isRead).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
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

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const count = tabCounts[tab.id];
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-[12px] font-bold transition-all ${
                isActive
                  ? "bg-primary-500 text-white shadow-md shadow-primary-500/25"
                  : "bg-white border border-primary-100 text-neutral-500 hover:border-primary-300 hover:text-primary-600"
              }`}
            >
              <Icon size={13} />
              {tab.label}
              {count > 0 && (
                <span className={`flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[10px] font-black ${
                  isActive ? "bg-white/20 text-white" : "bg-primary-100 text-primary-600"
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {filtered.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-3 rounded-3xl bg-white py-12 shadow-cute border border-primary-100/80"
          >
            <IllustCatEmpty className="h-20 w-20" />
            <span className="text-[14px] font-bold text-neutral-400">Chưa có thông báo nào 🎀</span>
          </motion.div>
        ) : (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-3"
          >
            {filtered.map((n, i) => {
              const style = TYPE_STYLE[n.type] ?? TYPE_STYLE.system;
              return (
                <motion.button
                  key={n.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
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
                </motion.button>
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
