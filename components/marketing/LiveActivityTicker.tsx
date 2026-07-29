"use client";

import { useEffect, useState } from "react";
import { Sparkles, CheckCircle2, Wallet, X } from "lucide-react";

type ActivityItem = {
  id: string;
  name: string;
  avatar: string;
  action: "cashback" | "withdraw";
  platform?: "Shopee" | "TikTok";
  amount: string;
  timeAgo: string;
};

const MOCK_ACTIVITIES: ActivityItem[] = [
  {
    id: "1",
    name: "Nguyễn Hương M.",
    avatar: "🎀",
    action: "cashback",
    platform: "Shopee",
    amount: "48.500đ",
    timeAgo: "15 giây trước",
  },
  {
    id: "2",
    name: "Hoàng Văn K.",
    avatar: "⚡",
    action: "withdraw",
    amount: "150.000đ",
    timeAgo: "1 phút trước",
  },
  {
    id: "3",
    name: "Trần Thu T.",
    avatar: "🌸",
    action: "cashback",
    platform: "TikTok",
    amount: "82.000đ",
    timeAgo: "2 phút trước",
  },
  {
    id: "4",
    name: "Phạm Hải D.",
    avatar: "🎁",
    action: "cashback",
    platform: "Shopee",
    amount: "125.000đ",
    timeAgo: "3 phút trước",
  },
  {
    id: "5",
    name: "Lê Bảo N.",
    avatar: "💫",
    action: "withdraw",
    amount: "320.000đ",
    timeAgo: "5 phút trước",
  },
];

export function LiveActivityTicker() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (isDismissed) return;

    // Show initial toast after 3 seconds
    const timer1 = setTimeout(() => {
      setIsVisible(true);
    }, 3000);

    // Rotate toast every 7 seconds
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % MOCK_ACTIVITIES.length);
        setIsVisible(true);
      }, 500);
    }, 7000);

    return () => {
      clearTimeout(timer1);
      clearInterval(interval);
    };
  }, [isDismissed]);

  if (isDismissed) return null;

  const item = MOCK_ACTIVITIES[currentIndex];

  return (
    <div
      className={`fixed left-4 md:left-6 bottom-20 md:bottom-6 z-40 max-w-xs transition-all duration-500 ease-out transform ${
        isVisible
          ? "translate-y-0 opacity-100 scale-100"
          : "translate-y-6 opacity-0 scale-95 pointer-events-none"
      }`}
    >
      <div className="relative flex items-center gap-3 rounded-2xl bg-white/95 p-3.5 shadow-cute-lg border border-primary-100/90 backdrop-blur-md">
        <button
          type="button"
          onClick={() => setIsDismissed(true)}
          className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-neutral-100 text-neutral-400 hover:bg-neutral-200 hover:text-neutral-700 transition-colors shadow-sm"
          title="Đóng thông báo"
        >
          <X size={12} />
        </button>

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 text-lg shadow-sm border border-primary-200/60">
          {item.avatar}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[12px] font-extrabold text-neutral-900 truncate">
              {item.name}
            </span>
            <span className="text-[10px] font-semibold text-neutral-400 shrink-0">
              {item.timeAgo}
            </span>
          </div>

          <div className="text-[11px] font-bold text-neutral-600 truncate mt-0.5">
            {item.action === "cashback" ? (
              <span className="flex items-center gap-1 text-emerald-600 font-extrabold">
                <CheckCircle2 size={12} />
                + {item.amount} hoàn từ {item.platform}
              </span>
            ) : (
              <span className="flex items-center gap-1 text-primary-600 font-extrabold">
                <Wallet size={12} />
                Vừa rút {item.amount} về Ngân hàng
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
