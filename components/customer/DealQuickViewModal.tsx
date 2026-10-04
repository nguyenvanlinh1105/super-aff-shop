"use client";

import React, { useEffect } from "react";
import { X, ExternalLink, Flame, Sparkles, Check, ShoppingBag, ShieldCheck, ArrowRight, Store } from "lucide-react";
import { useDealCart, calculateEstimatedCashback } from "@/components/customer/DealCartContext";
import { ShopeeIcon, TiktokIcon, LazadaIcon } from "@/components/icons/PlatformIcons";

export type QuickViewDeal = {
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
};

function formatPrice(n: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);
}

function getPlatformBadge(code?: string) {
  const c = (code || "SHOPEE").toUpperCase();
  if (c.includes("TIKTOK")) {
    return { name: "TikTok Shop", icon: <TiktokIcon size={14} className="shrink-0" />, color: "text-neutral-900" };
  }
  if (c.includes("LAZADA")) {
    return { name: "Lazada", icon: <LazadaIcon size={14} className="shrink-0" />, color: "text-blue-600" };
  }
  return { name: "Shopee", icon: <ShopeeIcon size={14} className="shrink-0" />, color: "text-[#EE4D2D]" };
}

export function DealQuickViewModal({
  deal,
  onClose,
}: {
  deal: QuickViewDeal | null;
  onClose: () => void;
}) {
  const { addToCart, isInCart, removeFromCart, setIsCartOpen } = useDealCart();

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (deal) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", onKeyDown);
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [deal, onClose]);

  if (!deal) return null;

  const inCart = isInCart(deal.id);
  const platform = getPlatformBadge(deal.platformCode);
  const discount =
    deal.discountPercent ??
    (deal.originalPrice && deal.salePrice && deal.originalPrice > deal.salePrice
      ? Math.round((1 - deal.salePrice / deal.originalPrice) * 100)
      : null);

  const estimatedCashback = calculateEstimatedCashback(deal.salePrice, discount);

  function handleBuyNow() {
    const target = deal!.shortUrl || `/api/deals/${deal!.id}/click`;
    window.open(target, "_blank");
  }

  function handleCartAction() {
    if (inCart) {
      removeFromCart(deal!.id);
    } else {
      addToCart({
        id: deal!.id,
        title: deal!.title,
        description: deal!.description,
        salePrice: deal!.salePrice,
        originalPrice: deal!.originalPrice,
        discountPercent: deal!.discountPercent,
        platformCode: deal!.platformCode,
        category: deal!.category,
        imageUrl: deal!.imageUrl,
        shortUrl: deal!.shortUrl,
        linkType: deal!.linkType,
      });
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div onClick={onClose} className="fixed inset-0 bg-neutral-950/60 backdrop-blur-xs" />

      {/* Modal Card */}
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden z-10 border border-primary-200/80 animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng"
          className="absolute top-3.5 right-3.5 z-20 p-2 rounded-full bg-white/90 text-neutral-500 hover:text-neutral-900 hover:bg-white shadow-md transition-all cursor-pointer"
        >
          <X size={18} strokeWidth={2.5} />
        </button>

        {/* Scrollable Content */}
        <div className="overflow-y-auto">
          {/* Image Banner */}
          <div className="relative aspect-4/3 sm:aspect-16/10 w-full bg-primary-50/40 overflow-hidden">
            {deal.imageUrl ? (
              <img
                src={deal.imageUrl}
                alt={deal.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex w-full h-full items-center justify-center bg-gradient-to-br from-primary-100 to-pink-100">
                <Flame size={48} className="text-primary-400" />
              </div>
            )}

            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
              {discount && discount > 0 && (
                <span className="flex items-center gap-1 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 px-2.5 py-1 text-xs font-black text-white shadow-md">
                  <Flame size={12} className="fill-white" />
                  <span>GIẢM {discount}%</span>
                </span>
              )}
              <span className="flex items-center gap-1 rounded-xl bg-white/95 backdrop-blur-xs px-2.5 py-1 text-xs font-extrabold text-neutral-800 shadow-sm border border-white/80">
                {platform.icon}
                <span className={platform.color}>{platform.name}</span>
              </span>
            </div>
          </div>

          {/* Details Body */}
          <div className="p-4 sm:p-6 space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="inline-flex items-center gap-1 rounded-lg bg-rose-50 px-2 py-0.5 text-[11px] font-extrabold text-primary-600 border border-primary-100">
                  🎀 {deal.category || "Ưu đãi hot"}
                </span>
                {deal.clicks > 0 && (
                  <span className="text-[11px] text-neutral-400 font-medium">
                    🔥 {deal.clicks} lượt đã quan tâm
                  </span>
                )}
              </div>

              <h3 className="text-base sm:text-lg font-black text-neutral-900 leading-snug">
                {deal.title}
              </h3>
            </div>

            {/* Price section */}
            <div className="flex items-baseline gap-2.5 flex-wrap p-3.5 rounded-2xl bg-neutral-50/80 border border-neutral-100">
              {deal.salePrice ? (
                <>
                  <span className="text-xl sm:text-2xl font-black text-primary-600 tabular-nums">
                    {formatPrice(deal.salePrice)}
                  </span>
                  {deal.originalPrice && deal.originalPrice > deal.salePrice && (
                    <span className="text-xs sm:text-sm text-neutral-400 line-through tabular-nums">
                      {formatPrice(deal.originalPrice)}
                    </span>
                  )}
                  {discount && discount > 0 && (
                    <span className="text-xs font-extrabold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-md">
                      Tiết kiệm {formatPrice((deal.originalPrice || 0) - deal.salePrice)}
                    </span>
                  )}
                </>
              ) : (
                <span className="text-base font-black text-primary-600">
                  Giá ưu đãi độc quyền trên sàn
                </span>
              )}
            </div>

            {/* Cashback Reward Highlight Card */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-50 via-primary-50/60 to-rose-50 border border-amber-200/70 shadow-2xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[12.5px] font-bold text-neutral-800 flex items-center gap-1.5">
                  <Sparkles size={15} className="text-amber-500 fill-amber-400" />
                  <span>Tiền hoàn dự kiến về Ví MeowBack:</span>
                </span>
                <span className="text-[15px] font-black text-emerald-600 tabular-nums">
                  ~{formatPrice(estimatedCashback)}
                </span>
              </div>
              <p className="text-[11px] text-neutral-500 leading-relaxed">
                🛡️ Hệ thống tự động ghi nhận hoa hồng sau khi bạn mua qua link. Tiền hoàn được rút từ <b>10.000đ</b> về Ngân hàng hoặc MoMo.
              </p>
            </div>

            {/* Description if any */}
            {deal.description && (
              <div className="text-[12.5px] text-neutral-600 leading-relaxed bg-primary-50/30 p-3 rounded-2xl border border-primary-100/60">
                <p className="font-semibold text-neutral-700 mb-0.5">Mô tả deal:</p>
                <p>{deal.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-3.5 sm:p-4 border-t border-primary-100 bg-white shadow-lg grid grid-cols-2 gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleCartAction}
            className={`flex items-center justify-center gap-1.5 py-3 px-3 rounded-2xl font-extrabold text-[13px] transition-all cursor-pointer ${
              inCart
                ? "bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100"
                : "bg-primary-50 text-primary-600 border border-primary-200 hover:bg-primary-100"
            }`}
          >
            {inCart ? (
              <>
                <Check size={16} strokeWidth={2.5} />
                <span>Đã trong túi (Bỏ)</span>
              </>
            ) : (
              <>
                <ShoppingBag size={16} strokeWidth={2.2} />
                <span>+ Thêm vào túi</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleBuyNow}
            className="flex items-center justify-center gap-1.5 py-3 px-3 rounded-2xl bg-gradient-to-r from-primary-500 via-rose-500 to-pink-500 hover:from-primary-600 hover:to-rose-600 text-white font-extrabold text-[13.5px] shadow-cute hover:shadow-cute-lg transition-all cursor-pointer"
          >
            <span>Mua trên sàn</span>
            <ExternalLink size={14} strokeWidth={2.2} />
          </button>
        </div>
      </div>
    </div>
  );
}
