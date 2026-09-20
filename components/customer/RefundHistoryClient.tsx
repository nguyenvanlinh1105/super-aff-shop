"use client";

import { useState } from "react";
import { Store, ShoppingBag, Music2, Copy, ExternalLink, Star } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Pagination } from "@/components/ui/Pagination";
import { ServerSearchInput } from "@/components/ui/ServerSearchInput";
import { PeriodSelect } from "@/components/ui/PeriodSelect";
import { useToast } from "@/components/ui/Toast";

const PLATFORM_STYLE: Record<string, { icon: typeof ShoppingBag; color: string; bg: string }> = {
  SHOPEE: { icon: ShoppingBag, color: "#FF6D9E", bg: "bg-primary-50" },
  TIKTOK: { icon: Music2, color: "#3D2A30", bg: "bg-neutral-100" },
  LAZADA: { icon: Store, color: "#1E70BF", bg: "bg-blue-50" },
  TIKI: { icon: Store, color: "#2D8A56", bg: "bg-emerald-50" },
};

type LinkItem = {
  id: string;
  createdAt: string;
  shortCode: string;
  shortUrl: string | null;
  productTitle: string | null;
  productImage: string | null;
  isFavorite: boolean;
  platform: { code: string; name: string };
};

function ProductThumb({ image, color, bg, Icon }: { image: string | null; color: string; bg: string; Icon: typeof ShoppingBag }) {
  const [broken, setBroken] = useState(false);
  if (image && !broken) {
    return (
      <img
        src={image}
        alt=""
        onError={() => setBroken(true)}
        className="h-12 w-12 shrink-0 rounded-2xl object-cover border border-primary-100/80 shadow-xs"
      />
    );
  }
  return (
    <div
      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-primary-100/60 ${bg}`}
      style={{ color }}
    >
      <Icon size={20} strokeWidth={2} />
    </div>
  );
}

function FavoriteButton({ linkId, isFavorite }: { linkId: string; isFavorite: boolean }) {
  const router = useRouter();
  const [favorite, setFavorite] = useState(isFavorite);
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    if (loading) return;
    const next = !favorite;
    setFavorite(next); // optimistic
    setLoading(true);
    try {
      const res = await fetch(`/api/links/${linkId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFavorite: next }),
      });
      if (!res.ok) throw new Error();
      router.refresh();
    } catch {
      setFavorite(!next); // rollback nếu lỗi
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      title={favorite ? "Bỏ yêu thích" : "Đánh dấu yêu thích"}
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all ${
        favorite
          ? "bg-amber-50 text-amber-500 border border-amber-200/80 shadow-xs hover:bg-amber-100"
          : "bg-primary-50 text-neutral-400 border border-primary-100/60 hover:bg-primary-100/80 hover:text-primary-600"
      }`}
    >
      <Star size={17} strokeWidth={2.2} fill={favorite ? "currentColor" : "none"} />
    </button>
  );
}

export function RefundHistoryClient({
  links,
  totalPages,
  currentPage,
  totalCount,
  counts,
}: {
  links: LinkItem[];
  totalPages: number;
  currentPage: number;
  totalCount: number;
  counts: { all: number; favorite: number };
}) {
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab") || "all";

  const handleTabChange = (tab: string) => {
    const params = new URLSearchParams(searchParams);
    if (tab === "all") {
      params.delete("tab");
    } else {
      params.set("tab", tab);
    }
    params.delete("page");
    router.replace(`${pathname}?${params.toString()}`);
  };

  const handleCopy = (url: string) => {
    if (!url) return;
    navigator.clipboard.writeText(url);
    toast.success("Đã copy link hoàn tiền vào bộ nhớ tạm! 🛍️", "Đã sao chép");
  };

  return (
    <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-cute border border-primary-100/80 fade-in">
      <div className="mb-6 flex items-center justify-between border-b border-primary-100 pb-4">
        <div>
          <h2 className="text-[17px] font-extrabold text-neutral-900 tracking-tight">Lịch sử tạo link 🎀</h2>
          <p className="text-[12px] font-medium text-neutral-500 mt-0.5">Tất cả link hoàn tiền bạn đã chuyển đổi</p>
        </div>
        <span className="inline-flex items-center rounded-full bg-primary-50 border border-primary-100 px-3 py-1 text-[12px] font-extrabold text-primary-600 shadow-xs">
          {totalCount} link
        </span>
      </div>

      <div className="mb-6 flex flex-col gap-4">
        {/* Tab switcher */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleTabChange("all")}
            className={`flex h-9 items-center gap-1.5 rounded-full px-4 text-[13px] font-extrabold transition-all ${
              currentTab === "all"
                ? "bg-gradient-to-r from-primary-400 to-primary-500 text-white shadow-cute"
                : "bg-primary-50 text-neutral-600 hover:bg-primary-100/80 border border-primary-100/70"
            }`}
          >
            Tất cả
            <span
              className={`rounded-full px-1.5 py-0.2 text-[11px] ${
                currentTab === "all" ? "bg-white/20 text-white" : "bg-white text-neutral-500"
              }`}
            >
              {counts.all}
            </span>
          </button>
          <button
            type="button"
            onClick={() => handleTabChange("favorite")}
            className={`flex h-9 items-center gap-1.5 rounded-full px-4 text-[13px] font-extrabold transition-all ${
              currentTab === "favorite"
                ? "bg-amber-500 text-white shadow-md shadow-amber-500/20"
                : "bg-amber-50 text-amber-700 hover:bg-amber-100/80 border border-amber-200/70"
            }`}
          >
            <Star size={13} strokeWidth={2.5} fill="currentColor" />
            Yêu thích
            <span
              className={`rounded-full px-1.5 py-0.2 text-[11px] ${
                currentTab === "favorite" ? "bg-white/20 text-white" : "bg-white text-amber-600"
              }`}
            >
              {counts.favorite}
            </span>
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <PeriodSelect className="w-full sm:w-[200px] shrink-0" />
          <ServerSearchInput placeholder="Tìm tên sản phẩm hoặc mã..." className="sm:max-w-[320px] flex-1" />
        </div>
      </div>

      {currentTab === "favorite" && counts.favorite === 0 && links.length === 0 && (
        <div className="mb-6 rounded-2xl bg-amber-50 border border-amber-200/70 p-4 text-[13px] font-medium text-amber-800">
          Bấm biểu tượng <Star size={13} className="inline -mt-[2px] text-amber-500" fill="currentColor" /> trên mỗi link để lưu lại vào mục yêu thích — tiện theo dõi và mua sắm lại nhiều lần.
        </div>
      )}

      {links.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-primary-50 border border-primary-100 text-2xl mb-3 shadow-xs">
            🛍️
          </div>
          <div className="text-[15px] font-bold text-neutral-800">
            {currentTab === "favorite" ? "Chưa có link yêu thích nào" : "Không tìm thấy link nào"}
          </div>
          <p className="text-[12px] font-medium text-neutral-500 mt-1">
            {currentTab === "favorite" ? "Hãy đánh dấu ngôi sao các link bạn muốn mua lại sau." : "Hãy dán link Shopee vào ô trên để tạo link hoàn tiền nhé!"}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {links.map((l) => {
            const pStyle = PLATFORM_STYLE[l.platform.code.toUpperCase()] ?? { icon: Store, color: "#FF6D9E", bg: "bg-primary-50" };
            const Icon = pStyle.icon;

            return (
              <div
                key={l.id}
                className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-primary-100/80 bg-white p-4 transition-all hover:border-primary-300 hover:bg-primary-50/25 hover:shadow-cute"
              >
                <div className="flex flex-1 items-center gap-3.5 min-w-0">
                  <ProductThumb image={l.productImage} color={pStyle.color} bg={pStyle.bg} Icon={Icon} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider" style={{ color: pStyle.color }}>
                      {l.platform.name}
                      <span className="text-neutral-300">•</span>
                      <span className="text-neutral-500 font-medium normal-case tracking-normal">{l.createdAt}</span>
                    </div>
                    <p className="mt-0.5 truncate text-[14px] font-bold text-neutral-900">
                      {l.productTitle ?? `Sản phẩm từ ${l.platform.name} (${l.shortCode})`}
                    </p>
                    <a
                      href={l.shortUrl ?? "#"}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-0.5 block truncate text-[12px] font-medium text-neutral-500 transition-colors hover:text-primary-600"
                    >
                      {l.shortUrl}
                    </a>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2 mt-2 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-primary-100/60 justify-end">
                  <FavoriteButton linkId={l.id} isFavorite={l.isFavorite} />
                  <button
                    onClick={() => handleCopy(l.shortUrl ?? "")}
                    className="flex h-10 items-center gap-1.5 rounded-xl border border-primary-200/80 bg-primary-50/80 px-3.5 text-[13px] font-bold text-neutral-800 transition-all hover:bg-primary-100 hover:text-primary-700"
                  >
                    <Copy size={14} strokeWidth={2.2} />
                    <span>Copy</span>
                  </button>
                  <a href={l.shortUrl ?? "#"} target="_blank" rel="noreferrer">
                    <button className="flex h-10 items-center gap-1.5 rounded-xl bg-gradient-to-r from-primary-400 to-primary-500 px-4 text-[13px] font-extrabold text-white shadow-cute transition-all hover:shadow-cute-lg hover:scale-[1.02] active:scale-[0.98]">
                      <ExternalLink size={14} strokeWidth={2.2} />
                      <span>Mở link</span>
                    </button>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-6 border-t border-primary-100/80 pt-4 flex justify-center">
          <Pagination totalPages={totalPages} currentPage={currentPage} />
        </div>
      )}
    </div>
  );
}
