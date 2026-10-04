"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { X, Trash2, ExternalLink, Flame, Sparkles, ArrowRight, ShieldCheck, ShoppingBag } from "lucide-react";
import { useDealCart, CartDealItem } from "@/components/customer/DealCartContext";
import { ShopeeIcon, TiktokIcon, LazadaIcon } from "@/components/icons/PlatformIcons";

function formatPrice(n: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);
}

function getPlatformBadge(code?: string) {
  const c = (code || "SHOPEE").toUpperCase();
  if (c.includes("TIKTOK")) {
    return { name: "TikTok", icon: <TiktokIcon size={12} className="shrink-0" />, color: "text-neutral-900" };
  }
  if (c.includes("LAZADA")) {
    return { name: "Lazada", icon: <LazadaIcon size={12} className="shrink-0" />, color: "text-blue-600" };
  }
  return { name: "Shopee", icon: <ShopeeIcon size={12} className="shrink-0" />, color: "text-[#EE4D2D]" };
}

export function DealCartDrawer() {
  const {
    cartItems,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    clearCart,
    totalAmount,
    totalEstimatedCashback,
    totalCount,
  } = useDealCart();

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setIsCartOpen(false);
    }
    if (isCartOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isCartOpen, setIsCartOpen]);

  if (!isCartOpen) return null;

  function handleBuyAll() {
    // Mở lần lượt các link sản phẩm trong giỏ hàng
    cartItems.forEach((item, index) => {
      const url = item.shortUrl || `/api/deals/${item.id}/click`;
      setTimeout(() => {
        window.open(url, "_blank");
      }, index * 250);
    });
  }

  function handleBuyItem(item: CartDealItem) {
    const url = item.shortUrl || `/api/deals/${item.id}/click`;
    window.open(url, "_blank");
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="fixed inset-0 bg-neutral-950/50 backdrop-blur-xs transition-opacity"
      />

      {/* Drawer Panel */}
      <aside className="relative flex flex-col w-full max-w-[460px] h-full bg-white shadow-2xl z-10 animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-primary-100 bg-gradient-to-r from-primary-50/80 via-white to-pink-50/50">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-rose-500 text-white shadow-cute">
              <ShoppingBag size={18} strokeWidth={2.4} />
            </div>
            <div>
              <h2 className="text-[16px] font-black text-neutral-900 tracking-tight flex items-center gap-1.5">
                <span>Túi Săn Deal</span>
                <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary-100 px-1.5 text-[11px] font-black text-primary-600">
                  {totalCount}
                </span>
              </h2>
              <p className="text-[11px] font-medium text-neutral-500">
                Gom deal mua chung & nhận hoàn tiền tối đa 🐾
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {totalCount > 0 && (
              <button
                type="button"
                onClick={clearCart}
                title="Xóa tất cả sản phẩm"
                className="p-2 text-neutral-400 hover:text-rose-500 transition-colors rounded-xl hover:bg-rose-50"
              >
                <Trash2 size={16} />
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsCartOpen(false)}
              className="p-2 text-neutral-400 hover:text-neutral-700 transition-colors rounded-xl hover:bg-neutral-100"
            >
              <X size={20} strokeWidth={2.2} />
            </button>
          </div>
        </div>

        {/* Cashback Target Banner */}
        {totalCount > 0 && (
          <div className="mx-4 mt-3 p-3.5 rounded-2xl bg-gradient-to-r from-rose-50 via-primary-50/70 to-pink-50 border border-primary-200/80 shadow-2xs">
            <div className="flex items-center justify-between text-[12px] font-bold text-neutral-800 mb-1.5">
              <span className="flex items-center gap-1 text-primary-600">
                <Sparkles size={14} className="fill-primary-500" />
                <span>Hoàn tiền ước tính về Ví MeowBack:</span>
              </span>
              <span className="text-[14px] font-black text-rose-600 tabular-nums">
                +{formatPrice(totalEstimatedCashback)}
              </span>
            </div>
            <div className="w-full bg-white/80 rounded-full h-2 overflow-hidden border border-primary-100">
              <div
                className="bg-gradient-to-r from-primary-500 to-rose-500 h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, Math.max(15, (totalEstimatedCashback / 10000) * 100))}%`,
                }}
              />
            </div>
            <p className="mt-1.5 text-[10.5px] text-neutral-500 flex items-center justify-between">
              <span>Mức rút tiền tối thiểu: <b>10.000đ</b></span>
              <span className="font-bold text-emerald-600">
                {totalEstimatedCashback >= 10000 ? "✓ Đủ mốc rút tiền ngay!" : "Chỉ cần thêm chút là đủ rút!"}
              </span>
            </p>
          </div>
        )}

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {totalCount === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12 px-4">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary-100 to-pink-100 flex items-center justify-center p-3 mb-4 shadow-cute border-2 border-white">
                <img
                  src="/meowback_lucky_cat_logo.png"
                  alt="Mascot"
                  className="w-full h-full object-contain rounded-2xl"
                />
              </div>
              <h3 className="text-[16px] font-black text-neutral-800">
                Túi Săn Deal Đang Trống 🎀
              </h3>
              <p className="mt-1.5 text-[12.5px] text-neutral-500 max-w-[260px] leading-relaxed">
                Bấm vào nút <b>[ + Thêm vào túi ]</b> ở bất kỳ sản phẩm nào để gom deal săn sale nhận hoàn tiền nhé!
              </p>
              <button
                type="button"
                onClick={() => setIsCartOpen(false)}
                className="mt-5 inline-flex items-center gap-1.5 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-primary-500 to-rose-500 text-white font-bold text-[13px] shadow-cute hover:shadow-cute-lg transition-all"
              >
                <Flame size={15} />
                <span>Khám phá Deal Hot Ngay</span>
              </button>
            </div>
          ) : (
            cartItems.map((item) => {
              const platform = getPlatformBadge(item.platformCode);
              return (
                <div
                  key={item.id}
                  className="group relative flex gap-3 p-3 rounded-2xl bg-white border border-primary-100/90 shadow-[0_2px_8px_rgba(255,109,158,0.06)] hover:border-primary-300 transition-all"
                >
                  {/* Image */}
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-primary-50/50 border border-primary-100/50">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-primary-300">
                        <Flame size={24} />
                      </div>
                    )}
                    {item.discountPercent && (
                      <span className="absolute top-1 left-1 rounded bg-rose-500 px-1 py-0.5 text-[9px] font-black text-white">
                        -{item.discountPercent}%
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div className="pr-6">
                      <div className="flex items-center gap-1 mb-0.5">
                        <span className="text-[10px] font-extrabold text-neutral-500 flex items-center gap-1">
                          {platform.icon}
                          <span className={platform.color}>{platform.name}</span>
                        </span>
                        {item.category && (
                          <span className="text-[9.5px] text-neutral-400">
                            • {item.category}
                          </span>
                        )}
                      </div>
                      <h4
                        className="text-[12.5px] font-bold text-neutral-800 leading-snug line-clamp-2"
                        title={item.title}
                      >
                        {item.title}
                      </h4>
                    </div>

                    <div className="flex items-end justify-between mt-2 pt-1 border-t border-neutral-100">
                      <div>
                        {item.salePrice ? (
                          <div className="flex items-baseline gap-1">
                            <span className="text-[14px] font-black text-primary-600 tabular-nums">
                              {formatPrice(item.salePrice)}
                            </span>
                            {item.originalPrice && item.originalPrice > item.salePrice && (
                              <span className="text-[10px] text-neutral-400 line-through tabular-nums">
                                {formatPrice(item.originalPrice)}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-[11px] font-bold text-primary-600">
                            Giá tốt trên sàn
                          </span>
                        )}
                        <span className="inline-block mt-0.5 text-[10px] font-bold text-emerald-600">
                          💰 Hoàn ~{formatPrice(item.estimatedCashback)}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleBuyItem(item)}
                        className="inline-flex items-center gap-1 rounded-xl bg-primary-50 px-2.5 py-1 text-[11px] font-extrabold text-primary-600 border border-primary-200/80 hover:bg-primary-500 hover:text-white transition-colors"
                      >
                        <span>Mua</span>
                        <ExternalLink size={10} />
                      </button>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => removeFromCart(item.id)}
                    className="absolute top-2 right-2 p-1 text-neutral-300 hover:text-rose-500 transition-colors"
                    title="Xóa món này"
                  >
                    <X size={15} strokeWidth={2.5} />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Summary & Checkout Actions */}
        {totalCount > 0 && (
          <div className="p-4 border-t border-primary-100 bg-white shadow-lg space-y-3">
            {/* Total breakdown */}
            <div className="space-y-1.5 text-[13px]">
              <div className="flex justify-between text-neutral-500">
                <span>Tổng giá trị sản phẩm:</span>
                <span className="font-bold text-neutral-800 tabular-nums">
                  {totalAmount > 0 ? formatPrice(totalAmount) : "Theo giá sàn"}
                </span>
              </div>
              <div className="flex justify-between items-center text-[14px] font-extrabold text-neutral-900 pt-1 border-t border-dashed border-primary-100">
                <span className="flex items-center gap-1 text-primary-600">
                  <Sparkles size={15} className="fill-primary-500" />
                  <span>Tổng tiền hoàn dự kiến:</span>
                </span>
                <span className="text-[17px] font-black text-rose-600 tabular-nums">
                  +{formatPrice(totalEstimatedCashback)}
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={handleBuyAll}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-primary-500 via-rose-500 to-pink-500 hover:from-primary-600 hover:to-rose-600 text-white font-extrabold text-[14px] shadow-cute hover:shadow-cute-lg transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
              >
                <span>Mở mua tất cả & Nhận hoàn tiền</span>
                <ArrowRight size={16} strokeWidth={2.5} />
              </button>

              <Link
                href="/register"
                className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-2xl bg-primary-50 hover:bg-primary-100/80 text-primary-700 font-bold text-[12.5px] border border-primary-200/80 transition-colors text-center"
              >
                <ShieldCheck size={15} className="text-primary-600" />
                <span>Đăng ký tài khoản để tiền tự động vào ví</span>
              </Link>
            </div>

            <p className="text-[10px] text-neutral-400 text-center leading-tight">
              🔒 Hoàn tiền 100% tự động qua hệ thống Affiliate chính hãng Shopee & TikTok Shop.
            </p>
          </div>
        )}
      </aside>
    </div>
  );
}
