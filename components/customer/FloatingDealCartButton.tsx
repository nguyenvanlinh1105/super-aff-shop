"use client";

import React from "react";
import { ShoppingBag, Sparkles } from "lucide-react";
import { useDealCart } from "@/components/customer/DealCartContext";

function formatPrice(n: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);
}

export function FloatingDealCartButton() {
  const { totalCount, totalEstimatedCashback, toggleCart, toastMessage } = useDealCart();

  return (
    <>
      {/* Toast Alert khi thêm món vào giỏ */}
      {toastMessage && (
        <div className="fixed bottom-24 right-4 sm:right-8 z-50 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-center gap-2 rounded-2xl bg-neutral-900/95 text-white px-4 py-2.5 shadow-2xl backdrop-blur-md border border-neutral-700/60 text-[12.5px] font-bold">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-500 text-white text-[11px]">
              ✓
            </span>
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Floating Shopping Bag Button */}
      <button
        type="button"
        onClick={toggleCart}
        aria-label="Mở Túi Săn Deal"
        className="fixed bottom-6 right-5 sm:right-8 z-40 group flex items-center gap-2.5 rounded-full bg-gradient-to-r from-primary-500 via-rose-500 to-pink-500 p-3 sm:px-5 sm:py-3.5 text-white shadow-cute hover:shadow-cute-lg hover:scale-105 active:scale-95 transition-all duration-200 border-2 border-white/80 cursor-pointer"
      >
        <div className="relative">
          <ShoppingBag size={22} strokeWidth={2.4} className="group-hover:rotate-6 transition-transform" />
          {totalCount > 0 && (
            <span className="absolute -top-2.5 -right-2.5 flex h-5.5 min-w-[22px] items-center justify-center rounded-full bg-amber-400 text-neutral-950 px-1 text-[11px] font-black shadow-md ring-2 ring-white animate-bounce">
              {totalCount}
            </span>
          )}
        </div>

        <div className="hidden sm:flex flex-col text-left leading-tight">
          <span className="text-[13px] font-black tracking-tight">Túi Săn Deal</span>
          {totalCount > 0 ? (
            <span className="text-[10.5px] font-extrabold text-amber-200 flex items-center gap-0.5">
              <Sparkles size={10} className="fill-amber-300" />
              <span>+{formatPrice(totalEstimatedCashback)}</span>
            </span>
          ) : (
            <span className="text-[10px] text-white/80 font-medium">Chưa có deal nào</span>
          )}
        </div>
      </button>
    </>
  );
}
