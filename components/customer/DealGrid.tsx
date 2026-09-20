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

function DealCard({ deal }: { deal: Deal }) {
  const [clicked, setClicked] = useState(false);
  const isShop = deal.linkType === "shop";

  function handleClick() {
    setClicked(true);
    // Dùng short URL trên domain của mình nếu có, fallback về API redirect
    const target = deal.shortUrl || `/api/deals/${deal.id}/click`;
    window.open(target, "_blank");
    setTimeout(() => setClicked(false), 2200);
  }

  const discount = deal.discountPercent
    ?? (deal.originalPrice && deal.salePrice
      ? Math.round((1 - deal.salePrice / deal.originalPrice) * 100)
      : null);

  return (
    <div
      onClick={handleClick}
      className="group relative flex flex-col overflow-hidden rounded-3xl bg-white shadow-cute border border-primary-100/80 cursor-pointer transition-all duration-300 hover:-translate-y-1.5 hover:shadow-cute-lg hover:border-primary-300 active:scale-[0.98]"
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-primary-50/50">
        {deal.imageUrl ? (
          <img
            src={deal.imageUrl}
            alt={deal.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary-50 to-pink-50">
            <Flame size={36} className="text-primary-300" strokeWidth={1.5} />
          </div>
        )}

        {/* Discount badge */}
        {discount && discount > 0 && (
          <div className="absolute top-2 left-2 flex flex-col items-center justify-center rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 px-2 py-1 shadow-sm">
            <span className="text-[10px] font-medium text-white/90 leading-none">Giảm</span>
            <span className="text-[13px] font-black text-white leading-tight">{discount}%</span>
          </div>
        )}

        {/* Expiry badge */}
        {deal.expiresAt && (
          <div className="absolute top-2 right-2 rounded-xl bg-neutral-900/70 px-2 py-1 text-[10px] font-bold text-white backdrop-blur-sm">
            HH: {formatExpiry(deal.expiresAt)}
          </div>
        )}

        {/* Hot badge */}
        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {isShop ? (
            <span className="flex items-center gap-1 rounded-full bg-neutral-900/70 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-sm">
              <Store size={10} /> Xem Shop
            </span>
          ) : (
            <span className="flex items-center gap-1 rounded-full bg-neutral-900/70 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-sm">
              <MousePointerClick size={10} /> Mua ngay
            </span>
          )}
        </div>

        {/* Click overlay */}
        {clicked && (
          <div className="absolute inset-0 bg-primary-500/20 backdrop-blur-[2px] flex items-center justify-center animate-in fade-in zoom-in-95 duration-150 p-sm text-center">
            <div className="rounded-2xl bg-white/95 px-md py-sm text-[12px] font-bold text-primary-600 shadow-lg leading-snug border border-primary-100">
              {isShop ? "Đang mở Shop... 🏬 Chọn SP rồi tạo link riêng ở mục Hoàn tiền nhé!" : "Đang mở Shopee... 🛒"}
            </div>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-xs p-md">
        {isShop && (
          <span className="inline-flex w-fit items-center gap-1 rounded-md bg-purple-50 px-1.5 py-0.5 text-[10px] font-bold text-purple-600">
            <Store size={10} /> Cả Shop — cần tạo link riêng
          </span>
        )}
        <p className="text-[13px] font-semibold text-neutral-800 leading-snug line-clamp-2 min-h-[40px]">
          {deal.title}
        </p>

        {/* Pricing */}
        <div className="mt-auto">
          {deal.salePrice ? (
            <div className="flex flex-col">
              <span className="text-[16px] font-black text-primary-600 tabular-nums">
                {formatPrice(deal.salePrice)}
              </span>
              {deal.originalPrice && (
                <span className="text-[12px] text-neutral-400 line-through tabular-nums">
                  {formatPrice(deal.originalPrice)}
                </span>
              )}
            </div>
          ) : (
            <span className="text-[13px] font-bold text-primary-500">Xem giá trên Shopee</span>
          )}
        </div>

        {/* Footer: clicks + platform */}
        <div className="flex items-center justify-between border-t border-primary-50 pt-xs mt-xs">
          <span className="flex items-center gap-1 text-[11px] text-neutral-400">
            <MousePointerClick size={11} />
            {deal.clicks > 0 ? `${deal.clicks.toLocaleString()} lượt` : "Mới đăng"}
          </span>
          <span className="rounded-lg bg-primary-50 px-2 py-0.5 text-[10px] font-bold text-primary-600 border border-primary-100/60 uppercase">
            Shopee
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
            className={`flex h-9 sm:h-10 items-center justify-center gap-1 sm:gap-1.5 rounded-2xl px-1.5 sm:px-3 text-[11.5px] xs:text-[12.5px] sm:text-[13px] font-bold transition-all cursor-pointer select-none ${
              isActive
                ? "bg-gradient-to-r from-primary-500 to-rose-500 text-white shadow-cute"
                : "bg-white text-neutral-600 border border-neutral-200/80 hover:border-primary-300 hover:text-primary-600 hover:bg-primary-50/40"
            }`}
          >
            <span className={isActive ? "text-white" : "text-primary-500"}>{t.icon}</span>
            <span className="truncate">
              <span className="inline sm:hidden">{t.mobileLabel}</span>
              <span className="hidden sm:inline">{t.label}</span>
            </span>
            <span
              className={`flex h-4.5 min-w-[18px] sm:h-5 sm:min-w-[20px] items-center justify-center rounded-full px-1 text-[10px] sm:text-[10.5px] font-black shrink-0 ${
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
    "w-full sm:w-auto h-9 sm:h-10 rounded-2xl bg-white pl-8 pr-7 text-[12.5px] font-semibold text-neutral-700 border border-neutral-200/80 shadow-2xs hover:border-primary-300 focus:outline-none focus:border-primary-500 transition-all cursor-pointer appearance-none";

  return (
    <div className="my-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
      <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full sm:w-auto">
        <div className="relative">
          <SlidersHorizontal size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-primary-400 pointer-events-none" />
          <select value={platform} onChange={(e) => updateParam("platform", e.target.value)} className={selectClass}>
            <option value="all">Tất cả sàn</option>
            <option value="SHOPEE">Shopee</option>
            <option value="TIKTOK">TikTok Shop</option>
          </select>
          <ChevronDown size={13} strokeWidth={2.2} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
        </div>

        <div className="relative">
          <Tag size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-primary-400 pointer-events-none" />
          <select value={category} onChange={(e) => updateParam("category", e.target.value)} className={selectClass}>
            <option value="all">Tất cả danh mục</option>
            {DEAL_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <ChevronDown size={13} strokeWidth={2.2} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
        </div>
      </div>

      <div className="relative w-full sm:w-auto">
        <ArrowUpDown size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-primary-400 pointer-events-none" />
        <select value={sort} onChange={(e) => updateParam("sort", e.target.value)} className={selectClass}>
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <ChevronDown size={13} strokeWidth={2.2} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
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
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5 sm:gap-4">
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
