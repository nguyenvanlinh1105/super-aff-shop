"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  MousePointerClick,
  Flame,
  Tag,
  SlidersHorizontal,
  Store,
  ArrowRight,
  ArrowUpDown,
  Sparkles,
} from "lucide-react";
import { Pagination } from "@/components/ui/Pagination";
import { CustomSelect, CustomSelectOption } from "@/components/ui/CustomSelect";
import { ShopeeIcon, TiktokIcon, LazadaIcon } from "@/components/icons/PlatformIcons";
import { DEAL_CATEGORIES } from "@/lib/dealCategories";

export type Deal = {
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

import { formatVND } from "@/lib/format";

function formatPrice(n: number | null | undefined) {
  return formatVND(n);
}

function calculateEstimatedCashback(salePrice: number | null, discountPercent: number | null): number {
  if (!salePrice || salePrice <= 0) return 0;
  const rate = 0.064; // ước tính ~6.4% hoa hồng về ví
  const raw = salePrice * rate;
  return Math.max(1000, Math.round(raw / 1000) * 1000);
}

function getPlatformBadge(code?: string) {
  const c = (code || "SHOPEE").toUpperCase();
  if (c.includes("TIKTOK")) {
    return { name: "TikTok Shop", icon: <TiktokIcon size={12} className="shrink-0" />, color: "text-neutral-900" };
  }
  if (c.includes("LAZADA")) {
    return { name: "Lazada", icon: <LazadaIcon size={12} className="shrink-0" />, color: "text-blue-600" };
  }
  return { name: "Shopee", icon: <ShopeeIcon size={12} className="shrink-0" />, color: "text-[#EE4D2D]" };
}

function DealCard({
  deal,
  isLoggedIn,
}: {
  deal: Deal;
  isLoggedIn: boolean;
}) {
  const router = useRouter();
  const [clicked, setClicked] = useState(false);
  const [imgError, setImgError] = useState(false);
  const isShop = deal.linkType === "shop";
  const platform = getPlatformBadge(deal.platformCode);

  const discount =
    deal.discountPercent ??
    (deal.originalPrice && deal.salePrice && deal.originalPrice > deal.salePrice
      ? Math.round((1 - deal.salePrice / deal.originalPrice) * 100)
      : null);

  const estimatedCashback = calculateEstimatedCashback(deal.salePrice, discount);

  function handleAction(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    // Chưa đăng nhập -> Bắt buộc chuyển sang trang đăng nhập
    if (!isLoggedIn) {
      router.push(`/login?next=${encodeURIComponent("/uu-dai")}`);
      return;
    }

    // Đã đăng nhập -> Mở link affiliate săn deal
    setClicked(true);
    const target = deal.shortUrl || `/api/deals/${deal.id}/click`;
    window.open(target, "_blank");
    setTimeout(() => setClicked(false), 2000);
  }

  return (
    <div
      onClick={handleAction}
      className="group relative flex flex-col min-w-0 overflow-hidden rounded-2xl bg-white shadow-[0_2px_12px_rgba(255,109,158,0.06)] border border-primary-100/90 cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-cute hover:border-primary-300 active:scale-[0.99]"
    >
      {/* Product Image & Badges */}
      <div className="relative aspect-square w-full overflow-hidden bg-primary-50/30">
        {deal.imageUrl && !imgError ? (
          <img
            src={deal.imageUrl}
            alt={deal.title}
            loading="lazy"
            onError={() => setImgError(true)}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary-50 via-rose-50/30 to-pink-50">
            <Flame size={32} className="text-primary-300" strokeWidth={1.5} />
          </div>
        )}

        {/* Discount badge: top-left */}
        {discount && discount > 0 ? (
          <div className="absolute top-2 left-2 z-10 flex items-center gap-0.5 rounded-lg bg-gradient-to-r from-rose-500 to-pink-500 px-1.5 py-0.5 text-white shadow-xs">
            <Flame size={10} className="fill-white shrink-0" />
            <span className="text-[11px] font-black tracking-tight leading-none">-{discount}%</span>
          </div>
        ) : null}

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
      <div className="flex flex-1 flex-col justify-between p-2.5 sm:p-3.5 gap-2 min-w-0 bg-white">
        {/* Title */}
        <div className="min-w-0">
          <h3
            className="text-[12.5px] sm:text-[13.5px] font-bold text-neutral-800 leading-[1.25rem] line-clamp-2 h-[2.5rem] sm:h-[2.6rem] overflow-hidden group-hover:text-primary-600 transition-colors"
            title={deal.title}
          >
            {deal.title}
          </h3>
        </div>

        {/* Estimated Cashback Pill */}
        <div className="flex items-center gap-1 min-w-0">
          <span className="inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-emerald-50 to-teal-50 px-2 py-0.5 text-[10px] sm:text-[11px] font-black text-emerald-700 border border-emerald-200/80 truncate">
            <Sparkles size={11} className="text-emerald-500 fill-emerald-500 shrink-0" />
            <span className="truncate">Hoàn ~{formatPrice(estimatedCashback)}</span>
          </span>
        </div>

        {/* Price row */}
        <div className="mt-auto pt-0.5 min-w-0">
          {deal.salePrice ? (
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-[15px] sm:text-[16.5px] font-black text-primary-600 tabular-nums tracking-tight">
                {formatPrice(deal.salePrice)}
              </span>
              {deal.originalPrice && deal.originalPrice > deal.salePrice && (
                <span className="text-[11px] sm:text-xs text-neutral-400 line-through tabular-nums">
                  {formatPrice(deal.originalPrice)}
                </span>
              )}
            </div>
          ) : (
            <span className="text-[12px] sm:text-[13px] font-black text-primary-600 flex items-center gap-0.5">
              <span>Xem giá trên sàn</span>
              <ArrowRight size={11} strokeWidth={2.5} />
            </span>
          )}
        </div>

        {/* Single Primary Action Button */}
        <div className="pt-1.5 mt-0.5 border-t border-primary-50/90">
          <button
            type="button"
            onClick={handleAction}
            className="w-full h-8 sm:h-9 rounded-xl bg-gradient-to-r from-primary-500 via-[#FF3B7B] to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-extrabold text-[12px] sm:text-[13px] flex items-center justify-center gap-1.5 shadow-2xs hover:shadow-cute transition-all cursor-pointer active:scale-95"
          >
            <span>Mua ngay</span>
            <ArrowRight size={13} strokeWidth={2.5} />
          </button>
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

  const platformOptions: CustomSelectOption[] = [
    { value: "all", label: "Tất cả sàn", icon: <SlidersHorizontal size={13} className="text-primary-500" /> },
    { value: "SHOPEE", label: "Shopee", icon: <ShopeeIcon size={14} className="shrink-0" /> },
    { value: "TIKTOK", label: "TikTok Shop", icon: <TiktokIcon size={14} className="shrink-0" /> },
  ];

  const categoryOptions: CustomSelectOption[] = [
    { value: "all", label: "Tất cả danh mục", icon: <Tag size={13} className="text-primary-500" /> },
    ...DEAL_CATEGORIES.map((c) => ({ value: c, label: c })),
  ];

  const sortOptions: CustomSelectOption[] = SORT_OPTIONS.map((o) => ({
    value: o.value,
    label: o.label,
    icon: <ArrowUpDown size={13} className="text-primary-500" />,
  }));

  return (
    <div className="my-1 sm:my-2 w-full">
      <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 sm:gap-2.5 w-full">
        <CustomSelect
          value={platform}
          onChange={(val) => updateParam("platform", val)}
          options={platformOptions}
          className="w-full sm:w-[150px]"
          buttonClassName="h-9 sm:h-10 text-[12px] sm:text-[13px] rounded-xl sm:rounded-2xl px-2.5 sm:px-3"
          ariaLabel="Lọc theo sàn mua sắm"
        />

        <CustomSelect
          value={category}
          onChange={(val) => updateParam("category", val)}
          options={categoryOptions}
          className="w-full sm:w-[170px]"
          buttonClassName="h-9 sm:h-10 text-[12px] sm:text-[13px] rounded-xl sm:rounded-2xl px-2.5 sm:px-3"
          ariaLabel="Lọc theo danh mục"
        />

        <CustomSelect
          value={sort}
          onChange={(val) => updateParam("sort", val)}
          options={sortOptions}
          className="col-span-2 sm:col-span-1 w-full sm:w-[185px] sm:ml-auto"
          buttonClassName="h-9 sm:h-10 text-[12px] sm:text-[13px] rounded-xl sm:rounded-2xl px-2.5 sm:px-3"
          align="right"
          ariaLabel="Sắp xếp ưu đãi"
        />
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
  isLoggedIn = false,
}: {
  deals: Deal[];
  totalPages?: number;
  currentPage?: number;
  hasQuery?: boolean;
  linkTypeCounts?: { product: number; shop: number };
  refundsHref?: string;
  isLoggedIn?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeLinkType = searchParams.get("linkType") || "all";

  return (
    <div className="flex flex-col gap-2.5 sm:gap-3">
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
        /* Empty State */
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
            {hasQuery ? "Không tìm thấy ưu đãi phù hợp 🔍" : "Đang cập nhật deal mới hôm nay 🎀"}
          </h3>
          <p className="mt-2 text-xs sm:text-sm text-neutral-500 max-w-md leading-relaxed font-medium">
            {hasQuery
              ? "Thử đổi từ khoá hoặc chọn lại bộ lọc sàn và danh mục khác xem sao nhé!"
              : "Hệ thống đang liên tục săn lùng deal giảm giá sâu từ Shopee & TikTok Shop. Đăng nhập để tự tạo link hoàn tiền ngay cho bất kỳ sản phẩm nào bạn thích!"}
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href={isLoggedIn ? refundsHref : "/login?next=/uu-dai"}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-primary-500 to-rose-500 hover:from-primary-600 hover:to-rose-600 text-white text-[13.5px] font-bold shadow-cute hover:shadow-cute-lg transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Flame size={16} strokeWidth={2.2} />
              <span>{isLoggedIn ? "Tạo link hoàn tiền ngay" : "Đăng nhập ngay"}</span>
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
          {/* Grid danh sách deal: 2 cột trên mobile, 3 cột trên tablet & desktop */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-5">
            {deals.map((deal) => (
              <DealCard
                key={deal.id}
                deal={deal}
                isLoggedIn={isLoggedIn}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages && currentPage && (
            <div className="mt-6 border-t border-primary-100/80 pt-4">
              <Pagination totalPages={totalPages} currentPage={currentPage} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
