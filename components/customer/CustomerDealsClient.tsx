"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { CheckCheck, Bell, ShoppingBag, Wallet, Megaphone, Settings, Copy, Check, ExternalLink, CalendarOff, Clock, TicketPercent } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate } from "@/lib/format";
import { motion } from "framer-motion";
import Link from "next/link";

type Deal = {
  id: string;
  title: string;
  benefitText: string | null;
  productImage: string | null;
  platformName: string;
  endsAt: Date | null;
  link: string | null;
};

// Countdown timer hook
function useCountdown(target: Date | null) {
  const [timeLeft, setTimeLeft] = useState<{ h: number; m: number; s: number } | null>(null);

  useEffect(() => {
    if (!target) return;
    const tick = () => {
      const diff = target.getTime() - Date.now();
      if (diff <= 0) { setTimeLeft({ h: 0, m: 0, s: 0 }); return; }
      setTimeLeft({
        h: Math.floor(diff / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);

  return timeLeft;
}

function DealCard({ deal }: { deal: Deal }) {
  const [copiedId, setCopiedId] = useState(false);
  const endsAt = deal.endsAt ? new Date(deal.endsAt) : null;
  const countdown = useCountdown(endsAt);

  // Is "expiring soon" = within 24 hours
  const isExpiringSoon = endsAt && (endsAt.getTime() - Date.now()) < 86400000 && (endsAt.getTime() - Date.now()) > 0;

  function copyLink() {
    if (!deal.link) return;
    navigator.clipboard.writeText(deal.link);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 1500);
  }

  return (
    <div className="flex flex-col overflow-hidden rounded-3xl bg-white border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all relative">
      {/* Expiring Soon badge */}
      {isExpiringSoon && (
        <div className="absolute top-3 left-3 z-10 flex items-center gap-1 rounded-full bg-red-500 px-2.5 py-1 text-[11px] font-black text-white shadow-md animate-pulse">
          🔥 Sắp hết hạn
        </div>
      )}

      <div className="flex h-40 items-center justify-center bg-gray-50">
        {deal.productImage ? (
          <img src={deal.productImage} alt="" className="h-full w-full object-cover" />
        ) : (
          <TicketPercent size={40} className="text-gray-300" />
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <span className="mb-2 inline-block w-fit rounded-md bg-gray-900 px-2 py-1 text-[10px] font-bold text-white uppercase tracking-wider">
          {deal.platformName}
        </span>
        <h3 className="text-[15px] font-bold text-gray-900 leading-tight line-clamp-2">{deal.title}</h3>
        {deal.benefitText && (
          <p className="mt-1 text-[13px] text-gray-500 line-clamp-2">{deal.benefitText}</p>
        )}

        {/* Countdown or expiry date */}
        <div className="mt-3 flex items-center gap-1.5">
          {isExpiringSoon && countdown ? (
            <div className="flex items-center gap-1.5 rounded-xl bg-red-50 border border-red-100 px-3 py-1.5">
              <Clock size={12} className="text-red-500" />
              <span className="text-[12px] font-black text-red-600 tabular-nums">
                {String(countdown.h).padStart(2, "0")}:{String(countdown.m).padStart(2, "0")}:{String(countdown.s).padStart(2, "0")}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-gray-400">
              <CalendarOff size={13} />
              <span className="text-[11px] font-medium">
                {deal.endsAt ? formatDate(deal.endsAt) : "Số lượng có hạn"}
              </span>
            </div>
          )}
        </div>

        <div className="mt-4 flex gap-2">
          {deal.link ? (
            <>
              <a
                href={deal.link}
                target="_blank"
                rel="noreferrer"
                className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#e86a33] text-[13px] font-bold text-white hover:bg-[#d65d2a] transition-colors"
              >
                <ExternalLink size={14} />
                Mua ngay
              </a>
              <button
                onClick={copyLink}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
                title="Copy link"
              >
                {copiedId ? (
                  <Check size={16} className="text-emerald-500" />
                ) : (
                  <Copy size={16} />
                )}
              </button>
            </>
          ) : (
            <span className="flex h-10 flex-1 items-center justify-center rounded-xl bg-gray-100 text-[13px] font-medium text-gray-400">
              Link chưa sẵn sàng
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export function CustomerDealsClient({ deals }: { deals: Deal[] }) {
  if (deals.length === 0) {
    return (
      <EmptyState
        icon={TicketPercent}
        title="Chưa có ưu đãi nào"
        description="Quay lại sau, hệ thống liên tục cập nhật deal mới."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {deals.map((deal, i) => (
        <motion.div
          key={deal.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.07, duration: 0.3 }}
        >
          <DealCard deal={deal} />
        </motion.div>
      ))}
    </div>
  );
}
