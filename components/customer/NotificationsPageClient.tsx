"use client";

import { useState } from "react";
import { Bell, MessagesSquare } from "lucide-react";
import { NotificationsClient } from "./NotificationsClient";
import { CommunityChat } from "./CommunityChat";

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

export function NotificationsPageClient({
  initialNotifications,
  initialUnreadCount,
  initialTotalPages,
  initialChatMessages,
  currentUserId,
  isAdmin,
}: {
  initialNotifications: Notification[];
  initialUnreadCount: number;
  initialTotalPages: number;
  initialChatMessages: ChatMessage[];
  currentUserId: string;
  isAdmin: boolean;
}) {
  const [tab, setTab] = useState<Tab>("notifications");

  const tabs: { id: Tab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: "notifications", label: "Thông báo", icon: <Bell size={14} />, badge: initialUnreadCount },
    { id: "chat", label: "Cộng đồng", icon: <MessagesSquare size={14} /> },
  ];

  return (
    <div className="flex flex-col gap-lg">
      <div className="flex items-center gap-sm overflow-x-auto pb-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex h-11 shrink-0 items-center gap-xs whitespace-nowrap rounded-full px-lg text-[14px] font-bold transition-all ${
              tab === t.id
                ? "bg-[#e86a33] text-white shadow-md shadow-[#e86a33]/25"
                : "bg-white text-gray-500 ring-1 ring-black/[0.08] hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            <span className={tab === t.id ? "text-white/80" : "text-gray-400"}>{t.icon}</span>
            {t.label}
            {!!t.badge && t.badge > 0 && (
              <span
                className={`flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[11px] font-extrabold ${
                  tab === t.id ? "bg-white/20 text-white" : "bg-rose-600 text-white"
                }`}
              >
                {t.badge > 99 ? "99+" : t.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === "notifications" && (
        <NotificationsClient
          initialNotifications={initialNotifications}
          initialUnreadCount={initialUnreadCount}
          initialTotalPages={initialTotalPages}
        />
      )}
      {tab === "chat" && (
        <CommunityChat initialMessages={initialChatMessages} currentUserId={currentUserId} isAdmin={isAdmin} />
      )}
    </div>
  );
}
