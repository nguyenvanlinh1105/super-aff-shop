"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Sparkles, ShieldCheck, ShoppingBag, Zap } from "lucide-react";

export function DealMarketHero({ activeCount }: { activeCount: number }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [keyword, setKeyword] = useState(searchParams.get("q") || "");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    params.set("page", "1");
    if (keyword.trim()) {
      params.set("q", keyword.trim());
    } else {
      params.delete("q");
    }
    router.replace(`/uu-dai?${params.toString()}`);
  }

  return (
    <div className="relative w-full overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-white via-primary-50/40 to-pink-50/70 border border-primary-200/80 shadow-[0_4px_20px_rgba(255,109,158,0.07)] mb-3 sm:mb-5">
      {/* Decorative ambient blurs */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary-200/35 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-8 -left-8 w-36 h-36 bg-rose-200/25 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 p-3 sm:p-5 lg:p-6">
        {/* Main Content Row: Compact side-by-side on mobile, expansive on desktop */}
        <div className="flex items-center justify-between gap-3 sm:gap-6">
          {/* Left Column: Title & Text */}
          <div className="flex-1 min-w-0">
            {/* Top pill */}
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-0.5 sm:px-3 sm:py-1 shadow-2xs border border-primary-200/90 text-[10.5px] sm:text-[12px] font-extrabold text-primary-600 mb-1 sm:mb-1.5">
              <ShoppingBag size={12} className="text-primary-500 shrink-0" />
              <span>Chợ Săn Deal MeowBack 🐾</span>
              <span className="hidden sm:inline-block h-1 w-1 rounded-full bg-primary-400" />
              <span className="hidden sm:inline-block text-neutral-500 font-semibold">{activeCount} deal đang mở</span>
            </div>

            {/* Headline */}
            <h1 className="text-[17px] sm:text-2xl lg:text-[26px] font-black text-neutral-900 tracking-tight leading-snug">
              Đi Chợ Săn Sale &{" "}
              <span className="bg-gradient-to-r from-primary-600 via-rose-500 to-pink-600 bg-clip-text text-transparent">
                Hoàn Tiền 80% 🎀
              </span>
            </h1>

            {/* Subtitle: 1 concise line on mobile, full on desktop */}
            <p className="mt-0.5 sm:mt-1 text-[11px] sm:text-[13px] text-neutral-600 leading-snug sm:leading-relaxed font-medium line-clamp-1 sm:line-clamp-2 max-w-xl">
              Chọn deal Shopee & TikTok Shop gom vào <b>Túi Săn Deal</b> để nhận hoàn tiền tự động về ví!
            </p>

            {/* Quick Benefits: hidden on very small screens, sleek on tablet/desktop */}
            <div className="hidden sm:flex flex-wrap items-center gap-2 mt-2 text-[11px] font-bold text-neutral-700">
              <span className="flex items-center gap-1 bg-white/90 rounded-lg px-2 py-0.5 border border-primary-100 shadow-2xs">
                <Zap size={12} className="text-amber-500" />
                <span>Rút từ <b>10.000đ</b></span>
              </span>
              <span className="flex items-center gap-1 bg-white/90 rounded-lg px-2 py-0.5 border border-primary-100 shadow-2xs">
                <ShieldCheck size={12} className="text-emerald-500" />
                <span>Đối soát tự động 24/7</span>
              </span>
              <span className="flex items-center gap-1 bg-white/90 rounded-lg px-2 py-0.5 border border-primary-100 shadow-2xs">
                <Sparkles size={12} className="text-primary-500" />
                <span>Hoàn đến <b className="text-primary-600">80% hoa hồng</b></span>
              </span>
            </div>
          </div>

          {/* Right Column: Cute Market Spree Mascot Artwork */}
          <div className="shrink-0">
            {/* Mobile: Compact Square/Rounded Badge */}
            <div className="block md:hidden relative w-[82px] h-[82px] rounded-2xl overflow-hidden shadow-cute border-2 border-white group">
              <img
                src="/meowback_market_spree.jpg"
                alt="MeowBack Đi Chợ Săn Sale"
                className="w-full h-full object-cover object-[62%_center]"
              />
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent py-0.5 text-center">
                <span className="text-[9px] font-black text-amber-300">
                  Hoàn 80%
                </span>
              </div>
            </div>

            {/* Desktop: Panoramic Shopping Market Card */}
            <div className="hidden md:block relative w-[250px] lg:w-[285px] h-[120px] lg:h-[130px] rounded-2xl overflow-hidden shadow-cute border-2 border-white group">
              <img
                src="/meowback_market_spree.jpg"
                alt="MeowBack Đi Chợ Săn Sale"
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent flex items-end p-2.5">
                <div className="flex items-center justify-between w-full">
                  <span className="text-[11px] font-black text-white drop-shadow-sm flex items-center gap-1">
                    <span>🛒 Chợ Deal Shopee & TikTok</span>
                  </span>
                  <span className="rounded-md bg-amber-400 px-1.5 py-0.5 text-[9.5px] font-black text-neutral-900 shadow-xs">
                    Hoàn 80%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom: Mobile mini value props & Smart Search Bar */}
        <div className="mt-2.5 sm:mt-3 pt-2 sm:pt-2.5 border-t border-primary-100/70 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
          {/* Mobile-only compact benefit ticker */}
          <div className="flex sm:hidden items-center justify-between text-[10px] font-extrabold text-neutral-600 px-0.5">
            <span className="flex items-center gap-1">
              <Zap size={11} className="text-amber-500" />
              <span>Rút từ 10k</span>
            </span>
            <span className="text-primary-300">•</span>
            <span className="flex items-center gap-1">
              <ShieldCheck size={11} className="text-emerald-500" />
              <span>Đối soát 24/7</span>
            </span>
            <span className="text-primary-300">•</span>
            <span className="flex items-center gap-1 text-primary-600">
              <Sparkles size={11} className="text-primary-500" />
              <span>Hoàn 80%</span>
            </span>
          </div>

          {/* Search Form: compact & responsive */}
          <form onSubmit={handleSearch} className="w-full max-w-xl">
            <div className="relative flex items-center">
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Tìm deal, sản phẩm hoặc dán link Shopee / TikTok..."
                className="w-full h-8.5 sm:h-10 pl-8 sm:pl-9.5 pr-20 sm:pr-24 rounded-xl sm:rounded-2xl bg-white border border-primary-200 text-xs sm:text-[13px] text-neutral-800 placeholder:text-neutral-400 shadow-2xs focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 font-medium transition-all"
              />
              <Search size={14} className="absolute left-2.5 sm:left-3 text-primary-400 pointer-events-none" />
              <button
                type="submit"
                className="absolute right-1 sm:right-1.5 h-6.5 sm:h-7.5 px-2.5 sm:px-3.5 rounded-lg sm:rounded-xl bg-gradient-to-r from-primary-500 to-rose-500 hover:from-primary-600 hover:to-rose-600 text-white text-[10.5px] sm:text-xs font-bold shadow-xs hover:shadow-cute transition-all cursor-pointer"
              >
                Tìm kiếm
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
