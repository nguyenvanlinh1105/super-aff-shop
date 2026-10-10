"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { RefreshCw, Upload, Loader2 } from "lucide-react";
import { ShopeeIcon, TiktokIcon } from "@/components/icons/PlatformIcons";
import { useToast } from "@/components/ui/Toast";

export function OrdersHeaderActions() {
  const router = useRouter();
  const { toast } = useToast();
  const [syncingTikTok, setSyncingTikTok] = useState(false);

  async function handleSyncTikTok() {
    if (syncingTikTok) return;
    setSyncingTikTok(true);

    try {
      const res = await fetch("/api/admin/integrations/tiktok/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        toast.error(data.error ?? "Không thể đồng bộ đơn TikTok lúc này", "Lỗi đồng bộ TikTok");
        return;
      }

      const r = data.result;
      toast.success(
        `Đã đồng bộ ${r.processed} đơn TikTok (Mới: ${r.created}, Cập nhật: ${r.updated}, Chưa map: ${r.unmapped}) 🎉`,
        "Đồng bộ TikTok Shop"
      );
      router.refresh();
    } catch (err) {
      toast.error("Có lỗi xảy ra khi gọi API đồng bộ TikTok", "Lỗi kết nối");
    } finally {
      setSyncingTikTok(false);
    }
  }

  return (
    <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
      {/* ── BUTTON 1: ĐỒNG BỘ TIKTOK ── */}
      <button
        type="button"
        onClick={handleSyncTikTok}
        disabled={syncingTikTok}
        title="Đồng bộ đơn hàng TikTok Shop qua API RioHub"
        className="group inline-flex items-center gap-2 rounded-2xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs sm:text-[13px] px-4 py-2.5 shadow-sm hover:shadow-md active:scale-95 transition-all border border-neutral-700/60 disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer"
      >
        <span className="shrink-0 flex items-center justify-center">
          <TiktokIcon size={18} pure />
        </span>
        <span>
          {syncingTikTok ? "Đang đồng bộ..." : "Đồng bộ TikTok"}
        </span>
        <RefreshCw
          size={13}
          strokeWidth={2.4}
          className={`shrink-0 text-neutral-400 group-hover:text-white transition-colors ${
            syncingTikTok ? "animate-spin text-white" : ""
          }`}
        />
      </button>

      {/* ── BUTTON 2: IMPORT ĐỐI SOÁT SHOPEE ── */}
      <Link
        href="/admin/orders/import"
        title="Tải lên file CSV đối soát hoa hồng từ Shopee Affiliate"
        className="group inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#EE4D2D] to-orange-500 hover:from-[#d73211] hover:to-orange-600 text-white font-bold text-xs sm:text-[13px] px-4 py-2.5 shadow-md shadow-orange-500/20 hover:shadow-lg hover:shadow-orange-500/25 active:scale-95 transition-all border border-orange-400/30 cursor-pointer"
      >
        <span className="shrink-0 flex items-center justify-center">
          <ShopeeIcon size={18} />
        </span>
        <span>Import đối soát Shopee</span>
        <Upload
          size={14}
          strokeWidth={2.4}
          className="shrink-0 text-white/80 group-hover:text-white transition-transform group-hover:-translate-y-0.5"
        />
      </Link>
    </div>
  );
}
