"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { MousePointerClick, Flame, Tag, SlidersHorizontal, Store, ArrowRight, ChevronDown, ArrowUpDown } from "lucide-react";
import { Pagination } from "@/components/ui/Pagination";
import { DEAL_CATEGORIES } from "@/lib/dealCategories";
import { DEAL_LINK_TYPES } from "@/lib/dealLinkTypes";

type Deal = {
  id: string;
  title: string;
  description: string | null;
  originalPrice: number | null;
  salePrice: number | null;
  discountPercent: number | null;
  category: string | null;
  linkType: string;
  platformCode?: string;
  expiresAt: string | null;
  imageUrl: string | null;
  shortUrl: string | null;
  clicks: number;
  createdAt: string;
};

function formatPrice(n: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);
}

function formatExpiry(iso: string) {
  return new Date(iso).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
}

function getPlatformBadge(code?: string) {
  const c = (code || "SHOPEE").toUpperCase();
  if (c.includes("TIKTOK")) {
    return { name: "TikTok", icon: "🎵", color: "text-neutral-900", bg: "bg-white/95" };
  }
  if (c.includes("LAZADA")) {
    return { name: "Lazada", icon: "🔷", color: "text-blue-600", bg: "bg-white/95" };
  }
  return { name: "Shopee", icon: "🛒", color: "text-primary-600", bg: "bg-white/95" };
}

function DealCard({ deal }: { deal: Deal }) {
  const [clicked, setClicked] = useState(false);
  const isShop = deal.linkType === "shop";
  const platform = getPlatformBadge(deal.platformCode);

  function handleClick() {
    setClicked(true);
    const target = deal.shortUrl || `/api/deals/${deal.id}/click`;
    window.open(target, "_blank");
    setTimeout(() => setClicked(false), 2200);
  }

  const discount = deal.discountPercent
    ?? (deal.originalPrice && deal.salePrice && deal.originalPrice > deal.salePrice
      ? Math.round((1 - deal.salePrice / deal.originalPrice) * 100)
      : null);

  return (
    <div
      onClick={handleClick}
      className="group relative flex flex-col min-w-0 overflow-hidden rounded-2xl sm:rounded-3xl bg-white shadow-[0_2px_12px_rgba(255,109,158,0.06)] border border-primary-100/80 cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-cute hover:border-primary-300 active:scale-[0.985]"
    >
      {/* Product Image & Badges */}
      <div className="relative aspect-square w-full overflow-hidden bg-primary-50/40">
        {deal.imageUrl ? (
          <img
            src={deal.imageUrl}
            alt={deal.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary-50 via-rose-50/30 to-pink-50">
            <Flame size={32} className="text-primary-300" strokeWidth={1.5} />
          </div>
        )}

        {/* Discount badge: sleek top-left tag */}
        {discount && discount > 0 ? (
          <div className="absolute top-2 left-2 z-10 flex items-center gap-0.5 rounded-lg bg-gradient-to-r from-rose-500 to-pink-500 px-1.5 py-0.5 text-white shadow-xs">
            <Flame size={10} className="fill-white shrink-0" />
            <span className="text-[11px] font-black tracking-tight leading-none">-{discount}%</span>
          </div>
        ) : null}

        {/* Expiry badge: compact glassmorphic top-right */}
        {deal.expiresAt && (
          <div className="absolute top-2 right-2 z-10 rounded-md bg-neutral-900/65 backdrop-blur-[2px] px-1.5 py-0.5 text-[9.5px] font-bold text-white/95 shadow-xs">
            HSD: {formatExpiry(deal.expiresAt)}
          </div>
        )}

        {/* Platform pill: bottom-left of image */}
        <div className="absolute bottom-2 left-2 z-10 flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[9.5px] font-extrabold shadow-xs backdrop-blur-xs bg-white/95 text-neutral-800 border border-white/70">
          <span>{platform.icon}</span>
          <span className={platform.color}>{platform.name}</span>
        </div>

        {/* Shop badge: bottom-right if linkType is shop */}
        {isShop && (
          <div className="absolute bottom-2 right-2 z-10 flex items-center gap-1 rounded-md bg-purple-600/90 backdrop-blur-xs px-1.5 py-0.5 text-[9.5px] font-extrabold text-white shadow-xs">
            <Store size={10} />
            <span>Cả Shop</span>
          </div>
        )}

        {/* Click loading overlay */}
        {clicked && (
          <div className="absolute inset-0 z-20 bg-neutral-950/40 backdrop-blur-[2px] flex items-center justify-center animate-in fade-in zoom-in-95 duration-150 p-2 text-center">
            <div className="rounded-2xl bg-white/95 px-3 py-2 text-[11px] font-bold text-primary-600 shadow-xl leading-snug border border-primary-100 flex items-center gap-1.5">
              <span className="animate-spin text-xs">⏳</span>
              <span>{isShop ? "Đang mở Shop..." : "Đang mở sàn..."}</span>
            </div>
          </div>
        )}
      </div>

      {/* Card Info */}
      <div className="flex flex-1 flex-col justify-between p-2.5 sm:p-3 gap-1.5 min-w-0 bg-white">
        {/* Title container: exactly 2 lines without line 3 bleed */}
        <div className="min-w-0">
          <h3
            className="text-[12px] sm:text-[13px] font-bold text-neutral-800 leading-[1.25rem] line-clamp-2 h-[2.5rem] sm:h-[2.6rem] overflow-hidden group-hover:text-primary-600 transition-colors"
            title={deal.title}
          >
            {deal.title}
          </h3>
        </div>

        {/* Cash back incentive pill */}
        <div className="flex items-center gap-1 min-w-0">
          <span className="inline-flex items-center gap-1 rounded-md bg-rose-50/90 px-1.5 py-0.5 text-[10px] font-extrabold text-rose-600 border border-rose-100/80 truncate">
            <span>🎀</span>
            <span className="truncate">Hoàn tiền vào ví</span>
          </span>
        </div>

        {/* Price row */}
        <div className="mt-auto pt-0.5 min-w-0">
          {deal.salePrice ? (
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-[14.5px] sm:text-[16px] font-black text-primary-600 tabular-nums tracking-tight">
                {formatPrice(deal.salePrice)}
              </span>
              {deal.originalPrice && deal.originalPrice > deal.salePrice && (
                <span className="text-[10.5px] sm:text-xs text-neutral-400 line-through tabular-nums">
                  {formatPrice(deal.originalPrice)}
                </span>
              )}
            </div>
          ) : (
            <span className="text-[11.5px] sm:text-[12.5px] font-black text-primary-600 flex items-center gap-0.5">
              <span>Xem giá trên sàn</span>
              <ArrowRight size={11} strokeWidth={2.5} />
            </span>
          )}
        </div>

        {/* Footer: Clicks count + Mua action */}
        <div className="flex items-center justify-between border-t border-primary-50/80 pt-1.5 mt-0.5 text-[10px] sm:text-[11px] text-neutral-400 min-w-0">
          <span className="flex items-center gap-1 truncate font-medium text-neutral-500">
            <MousePointerClick size={11} className="shrink-0 text-primary-400" />
            <span className="truncate">{deal.clicks > 0 ? `${deal.clicks} lượt` : "Mới đăng"}</span>
          </span>
          <span className="inline-flex items-center gap-0.5 rounded-lg bg-primary-50 px-2 py-0.5 font-extrabold text-primary-600 border border-primary-100 group-hover:bg-primary-500 group-hover:text-white group-hover:border-primary-500 transition-colors shrink-0">
            <span>Mua</span>
            <ArrowRight size={10} strokeWidth={2.5} className="group-hover:translate-x-0.5 transition-transform" />
          </span>
        </div>
      </div>
    </div>
  );
}

const SORT_OPTIONS = [
  { value: "newest", label: "Mới nhất" },
  { value: "discount", label: "% hoàn cao nhất" },
  { value: "clicks", label: "Nhiều lượt dùng nhất" },
];

function LinkTypeTabs({ counts }: { counts: { product: number; shop: number } }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const active = searchParams.get("linkType") || "all";

  function select(value: string) {
    const params = new URLSearchParams(searchParams);
    params.set("page", "1");
    if (value === "all") params.delete("linkType");
    else params.set("linkType", value);
    router.replace(`${pathname}?${params.toString()}`);
  }

  const tabs = [
    {
      value: "all",
      label: "Tất cả",
      mobileLabel: "Tất cả",
      icon: <Flame size={13} strokeWidth={2.2} />,
      count: counts.product + counts.shop,
    },
    {
      value: "product",
      label: "Sản phẩm cụ thể",
      mobileLabel: "Sản phẩm",
      icon: <MousePointerClick size={13} strokeWidth={2.2} />,
      count: counts.product,
    },
    {
      value: "shop",
      label: "Cả Shop",
      mobileLabel: "Cả Shop",
      icon: <Store size={13} strokeWidth={2.2} />,
      count: counts.shop,
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-1.5 sm:gap-2.5 w-full">
      {tabs.map((t) => {
        const isActive = active === t.value;
        return (
          <button
            key={t.value}
            type="button"
            onClick={() => select(t.value)}
            className={`min-w-0 flex h-9 sm:h-10 items-center justify-center gap-1 sm:gap-1.5 rounded-2xl px-1 sm:px-3 text-[11px] sm:text-[13px] font-bold transition-all cursor-pointer select-none ${
              isActive
                ? "bg-gradient-to-r from-primary-500 to-rose-500 text-white shadow-cute"
                : "bg-white text-neutral-600 border border-neutral-200/80 hover:border-primary-300 hover:text-primary-600 hover:bg-primary-50/40"
            }`}
          >
            <span className={`shrink-0 ${isActive ? "text-white" : "text-primary-500"}`}>{t.icon}</span>
            <span className="truncate">
              <span className="inline sm:hidden">{t.mobileLabel}</span>
              <span className="hidden sm:inline">{t.label}</span>
            </span>
            <span
              className={`flex h-4 min-w-[16px] sm:h-5 sm:min-w-[20px] items-center justify-center rounded-full px-1 text-[9.5px] sm:text-[10.5px] font-black shrink-0 ${
                isActive ? "bg-white/25 text-white" : "bg-primary-50 text-primary-600 border border-primary-100"
              }`}
            >
              {t.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function FilterBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const platform = searchParams.get("platform") || "all";
  const category = searchParams.get("category") || "all";
  const sort = searchParams.get("sort") || "newest";

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams);
    params.set("page", "1");
    if (value === "all" || value === "newest") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.replace(`${pathname}?${params.toString()}`);
  }

  const selectClass =
    "w-full h-9 sm:h-10 rounded-2xl bg-white pl-7 sm:pl-8 pr-6 text-[12px] sm:text-[12.5px] font-semibold text-neutral-700 border border-neutral-200/80 shadow-2xs hover:border-primary-300 focus:outline-none focus:border-primary-500 transition-all cursor-pointer appearance-none truncate";

  return (
    <div className="my-2.5 sm:my-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-2.5 w-full">
      <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full sm:w-auto">
        <div className="relative min-w-0">
          <SlidersHorizontal size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-primary-400 pointer-events-none" />
          <select value={platform} onChange={(e) => updateParam("platform", e.target.value)} className={selectClass}>
            <option value="all">Tất cả sàn</option>
            <option value="SHOPEE">Shopee</option>
            <option value="TIKTOK">TikTok Shop</option>
          </select>
          <ChevronDown size={13} strokeWidth={2.2} className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
        </div>

        <div className="relative min-w-0">
          <Tag size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-primary-400 pointer-events-none" />
          <select value={category} onChange={(e) => updateParam("category", e.target.value)} className={selectClass}>
            <option value="all">Tất cả mục</option>
            {DEAL_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <ChevronDown size={13} strokeWidth={2.2} className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
        </div>
      </div>

      <div className="relative w-full sm:w-auto min-w-0">
        <ArrowUpDown size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-primary-400 pointer-events-none" />
        <select value={sort} onChange={(e) => updateParam("sort", e.target.value)} className={selectClass}>
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <ChevronDown size={13} strokeWidth={2.2} className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
      </div>
    </div>
  );
}

export function DealGrid({
  deals,
  totalPages,
  currentPage,
  hasQuery,
  linkTypeCounts,
  refundsHref = "/app/refunds",
}: {
  deals: Deal[];
  totalPages?: number;
  currentPage?: number;
  hasQuery?: boolean;
  linkTypeCounts?: { product: number; shop: number };
  refundsHref?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeLinkType = searchParams.get("linkType") || "all";

  return (
    <div className="flex flex-col gap-3">
      {linkTypeCounts && <LinkTypeTabs counts={linkTypeCounts} />}

      {activeLinkType === "shop" && (
        <div className="flex items-start gap-3 rounded-2xl bg-purple-50/80 border border-purple-200/80 p-3.5 sm:p-4 text-[13px] text-purple-800 leading-relaxed shadow-2xs">
          <Store size={18} className="text-purple-500 shrink-0 mt-0.5" />
          <p>
            Đây là deal <strong>Cả Shop / Bộ sưu tập</strong> — bạn hãy bấm vào để chọn sản phẩm muốn mua, sau đó{" "}
            <Link href={refundsHref} className="font-extrabold text-purple-700 underline underline-offset-2 hover:text-purple-900">
              vào mục Tạo link hoàn tiền
            </Link>{" "}
            dán link để đảm bảo nhận đầy đủ tiền hoàn vào ví nhé!
          </p>
        </div>
      )}

      <FilterBar />

      {deals.length === 0 ? (
        /* Empty State thiết kế phong cách MeowBack Mascot cao cấp */
        <div className="flex flex-col items-center justify-center py-12 sm:py-16 px-4 text-center rounded-3xl bg-gradient-to-b from-white via-primary-50/30 to-white border border-primary-100/80 shadow-xs my-2">
          <div className="relative mb-5">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-br from-primary-100 via-pink-100 to-rose-100 flex items-center justify-center shadow-cute p-1.5 border-2 border-white">
              <img
                src="/meowback_lucky_cat_logo.png"
                alt="MeowBack Mascot"
                className="w-full h-full object-contain rounded-2xl"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-primary-500 text-white shadow-sm ring-2 ring-white text-xs">
              🎀
            </div>
          </div>

          <h3 className="text-lg sm:text-xl font-extrabold text-neutral-900 tracking-tight">
            {hasQuery ? "Không tìm thấy ưu đãi phù hợp 🔍" : "Chưa có ưu đãi nào hôm nay 🎀"}
          </h3>
          <p className="mt-2 text-xs sm:text-sm text-neutral-500 max-w-md leading-relaxed font-medium">
            {hasQuery
              ? "Thử đổi từ khoá hoặc chọn lại bộ lọc sàn và danh mục khác xem sao nhé!"
              : "Hệ thống đang liên tục săn lùng deal giảm giá sâu từ Shopee & TikTok Shop. Bạn vẫn có thể tự tạo link hoàn tiền ngay cho bất kỳ sản phẩm nào bạn thích!"}
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href={refundsHref}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-primary-500 to-rose-500 hover:from-primary-600 hover:to-rose-600 text-white text-[13.5px] font-bold shadow-cute hover:shadow-cute-lg transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Flame size={16} strokeWidth={2.2} />
              <span>Tạo link hoàn tiền ngay</span>
            </Link>
            {hasQuery && (
              <button
                type="button"
                onClick={() => router.replace(pathname)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white hover:bg-neutral-50 text-neutral-700 text-[13px] font-bold border border-neutral-200 transition-all shadow-2xs cursor-pointer"
              >
                <span>Xoá bộ lọc</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Grid danh sách deal tối ưu cho màn hình 960px và mobile */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-4">
            {deals.map((deal) => (
              <DealCard key={deal.id} deal={deal} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages && currentPage && (
            <div className="mt-6 border-t border-primary-100/80 pt-4">
              <Pagination totalPages={totalPages} currentPage={currentPage} />
            </div>
          )}

          {/* Footer note */}
          <div className="mt-4 flex items-center justify-center gap-2 text-[12px] text-neutral-500 text-center font-medium">
            <Flame size={14} className="text-primary-500 shrink-0" />
            <span>
              {activeLinkType === "shop"
                ? "Chọn sản phẩm rồi tạo link riêng ở mục Hoàn tiền trước khi mua để nhận hoàn tiền"
                : "Bấm vào deal để mua trực tiếp trên sàn và tự động nhận hoàn tiền"}
            </span>
          </div>
        </>
      )}
    </div>
  );
}
