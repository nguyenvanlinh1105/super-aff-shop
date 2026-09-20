"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { MousePointerClick, Flame, Tag, SlidersHorizontal, Store, ArrowRight } from "lucide-react";
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
    { value: "all", label: "Tất cả", icon: <Flame size={13} />, count: counts.product + counts.shop },
    { value: "product", label: DEAL_LINK_TYPES[0].shortLabel, icon: <MousePointerClick size={13} />, count: counts.product },
    { value: "shop", label: DEAL_LINK_TYPES[1].shortLabel, icon: <Store size={13} />, count: counts.shop },
  ];

  return (
    <div className="mb-md flex flex-wrap items-center gap-sm">
      {tabs.map((t) => (
        <button
          key={t.value}
          onClick={() => select(t.value)}
          className={`flex h-10 items-center gap-xs whitespace-nowrap rounded-full px-lg text-[13px] font-bold transition-all ${
            active === t.value
              ? "bg-gradient-to-r from-primary-400 to-primary-500 text-white shadow-cute"
              : "bg-white/90 text-neutral-600 border border-primary-100/80 hover:bg-primary-50/50 hover:text-primary-600"
          }`}
        >
          <span className={active === t.value ? "text-white/90" : "text-primary-400"}>{t.icon}</span>
          {t.label}
          <span className={`flex h-5 min-w-[20px] items-center justify-center rounded-full px-1 text-[11px] font-bold ${
            active === t.value ? "bg-white/20 text-white" : "bg-primary-50 text-primary-500"
          }`}>{t.count}</span>
        </button>
      ))}
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
    "h-10 rounded-2xl bg-white/90 px-md text-[13px] font-semibold text-neutral-700 border border-primary-100/80 shadow-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200/50 transition-all";

  return (
    <div className="mb-lg flex flex-wrap items-center gap-sm">
      <span className="flex items-center gap-1 text-[12px] font-bold text-neutral-400 uppercase tracking-wide">
        <SlidersHorizontal size={13} /> Lọc
      </span>
      <select value={platform} onChange={(e) => updateParam("platform", e.target.value)} className={selectClass}>
        <option value="all">Tất cả sàn</option>
        <option value="SHOPEE">Shopee</option>
        <option value="TIKTOK">TikTok Shop</option>
      </select>
      <select value={category} onChange={(e) => updateParam("category", e.target.value)} className={selectClass}>
        <option value="all">Tất cả danh mục</option>
        {DEAL_CATEGORIES.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>
      <select value={sort} onChange={(e) => updateParam("sort", e.target.value)} className={selectClass}>
        {SORT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

export function DealGrid({
  deals,
  totalPages,
  currentPage,
  hasQuery,
  linkTypeCounts,
  refundsHref,
}: {
  deals: Deal[];
  totalPages?: number;
  currentPage?: number;
  hasQuery?: boolean;
  linkTypeCounts?: { product: number; shop: number };
  refundsHref?: string;
}) {
  const searchParams = useSearchParams();
  const activeLinkType = searchParams.get("linkType") || "all";

  return (
    <div>
      {linkTypeCounts && <LinkTypeTabs counts={linkTypeCounts} />}

      {activeLinkType === "shop" && (
        <div className="mb-lg flex items-start gap-sm rounded-2xl bg-purple-50 border border-purple-200 px-lg py-md">
          <Store size={18} className="text-purple-500 shrink-0 mt-[1px]" />
          <p className="text-[13px] text-purple-700 font-medium leading-relaxed">
            Đây là deal <strong>Cả Shop / Bộ sưu tập</strong> — chọn đúng sản phẩm bạn muốn mua, sau đó{" "}
            {refundsHref ? (
              <Link href={refundsHref} className="font-bold underline underline-offset-2">
                vào mục Hoàn tiền để tạo link riêng
              </Link>
            ) : (
              <strong>tạo link riêng ở mục Hoàn tiền</strong>
            )}{" "}
            trước khi thanh toán, để đảm bảo được ghi nhận hoàn tiền chính xác.
          </p>
        </div>
      )}

      <FilterBar />

      {deals.length === 0 ? (
        <div className="flex flex-col items-center py-3xl text-center">
          <div className="text-6xl mb-lg">🛒</div>
          <p className="text-[16px] font-bold text-neutral-500">
            {hasQuery ? "Không tìm thấy ưu đãi phù hợp" : "Chưa có ưu đãi nào"}
          </p>
          <p className="text-[13px] text-neutral-400 mt-xs">
            {hasQuery ? "Thử đổi bộ lọc hoặc từ khoá khác xem sao!" : "Quay lại sau nhé, admin đang cập nhật deal mới!"}
          </p>
        </div>
      ) : (
        <>
          {/* Grid */}
          <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-md">
            {deals.map((deal) => (
              <DealCard key={deal.id} deal={deal} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages && currentPage && (
            <Pagination totalPages={totalPages} currentPage={currentPage} />
          )}

          {/* Footer note */}
          <div className="mt-xl flex items-center justify-center gap-sm text-[12px] text-neutral-500 text-center">
            <Flame size={13} className="text-primary-500 shrink-0" />
            <span>
              {activeLinkType === "shop"
                ? "Chọn sản phẩm rồi tạo link riêng ở mục Hoàn tiền trước khi mua để nhận hoàn tiền"
                : "Bấm vào sản phẩm để mua trực tiếp trên Shopee và nhận hoàn tiền"}
            </span>
          </div>
        </>
      )}
    </div>
  );
}
