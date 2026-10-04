"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Sparkles, ShieldCheck, Zap, X, Flame, ArrowRight } from "lucide-react";

const HOT_KEYWORDS = [
  { label: "Váy & Đầm", icon: "👗" },
  { label: "Son môi", icon: "💄" },
  { label: "Tai nghe", icon: "🎧" },
  { label: "Giày sneaker", icon: "👟" },
  { label: "Mẹ & Bé", icon: "🍼" },
  { label: "Đồ gia dụng", icon: "🏡" },
];

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

  function handleSelectKeyword(kw: string) {
    setKeyword(kw);
    const params = new URLSearchParams(searchParams);
    params.set("page", "1");
    params.set("q", kw);
    router.replace(`/uu-dai?${params.toString()}`);
  }

  function handleClear() {
    setKeyword("");
    const params = new URLSearchParams(searchParams);
    params.set("page", "1");
    params.delete("q");
    router.replace(`/uu-dai?${params.toString()}`);
  }

  return (
    <div className="relative w-full overflow-hidden rounded-3xl sm:rounded-[32px] bg-gradient-to-br from-primary-50/90 via-white to-pink-50/80 border-2 border-primary-200/80 shadow-[0_8px_32px_rgba(255,109,158,0.1)] mb-6 sm:mb-8 transition-all">
      {/* Decorative ambient blurs */}
      <div className="absolute -top-16 -right-16 w-56 h-56 bg-primary-200/35 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-rose-200/25 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 p-4 sm:p-7 lg:p-8 space-y-4 sm:space-y-6">
        {/* Top Section: Heading & Mascot Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
          {/* Left Column: Heading & Information */}
          <div className="flex-1 min-w-0 space-y-2 sm:space-y-2.5">
            {/* Top pill badge */}
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 shadow-2xs border border-primary-200 text-xs font-black text-primary-600">
              <Sparkles size={13} className="text-[#FF4D85]" />
              <span>MeowBack Săn Deal Siêu Hời</span>
              <span className="inline-block h-1 w-1 rounded-full bg-primary-400" />
              <span className="text-neutral-500 font-bold">{activeCount} deal đang mở</span>
            </div>

            {/* Headline */}
            <h1 className="text-xl sm:text-3xl lg:text-[32px] font-black text-neutral-900 tracking-tight leading-snug">
              Săn Deal Siêu Rẻ &amp;{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#EE4D2D] via-[#FF3B7B] to-[#E02868]">
                Hoàn Tiền Đến 80% 🐾
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xs sm:text-sm text-neutral-600 font-semibold leading-relaxed max-w-2xl">
              Kho ưu đãi độc quyền từ Shopee, Lazada &amp; TikTok Shop mỗi ngày. Tự động nhận lại hoa hồng ròng về ví sau khi mua sắm!
            </p>

            {/* Value badges */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] sm:text-xs font-bold text-neutral-700">
              <span className="flex items-center gap-1.5 bg-white rounded-xl px-2.5 sm:px-3 py-1 border border-primary-100/90 shadow-2xs">
                <Zap size={13} className="text-amber-500" />
                <span>Rút từ <strong className="text-neutral-900 font-black">10.000đ</strong></span>
              </span>
              <span className="flex items-center gap-1.5 bg-white rounded-xl px-2.5 sm:px-3 py-1 border border-primary-100/90 shadow-2xs">
                <ShieldCheck size={13} className="text-emerald-500" />
                <span>Đối soát tự động 24/7</span>
              </span>
              <span className="flex items-center gap-1.5 bg-white rounded-xl px-2.5 sm:px-3 py-1 border border-primary-100/90 shadow-2xs">
                <Sparkles size={13} className="text-[#FF4D85]" />
                <span>Hoàn đến <strong className="text-[#E02868] font-black">80% hoa hồng</strong></span>
              </span>
            </div>
          </div>

          {/* Right Column: Panoramic Mascot Card */}
          <div className="shrink-0 self-center md:self-auto">
            <div className="relative w-full sm:w-[260px] lg:w-[290px] h-[100px] sm:h-[125px] rounded-2xl sm:rounded-[22px] overflow-hidden shadow-cute border-2 border-white group">
              <img
                src="/meowback_market_spree.jpg"
                alt="MeowBack Săn Deal"
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-3">
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-black text-white drop-shadow-sm flex items-center gap-1">
                    <span>Shopee • TikTok • Lazada</span>
                  </span>
                  <span className="rounded-lg bg-amber-400 px-2 py-0.5 text-[10px] font-black text-neutral-900 shadow-xs">
                    Hoàn 80% 🎀
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* PRO SEARCH BAR SECTION - To, Nổi Bật, Chuẩn UX PC & Mobile */}
        <div className="pt-2 sm:pt-3 border-t border-primary-100/80 space-y-3">
          <form onSubmit={handleSearch} className="w-full">
            <div className="relative flex items-center w-full rounded-2xl sm:rounded-full bg-white border-2 border-primary-200/90 shadow-[0_8px_25px_rgba(255,109,158,0.12)] hover:border-primary-300 focus-within:border-[#FF4D85] focus-within:ring-4 focus-within:ring-pink-100 transition-all p-1 sm:p-1.5">
              
              {/* Left Search Icon Badge */}
              <div className="pl-2 sm:pl-3 pr-2 flex items-center justify-center shrink-0">
                <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-gradient-to-br from-pink-100 via-rose-100 to-pink-50 flex items-center justify-center text-[#E02868] shadow-2xs">
                  <Search size={18} className="sm:w-5 sm:h-5" />
                </div>
              </div>

              {/* Main Search Input */}
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Tìm deal hot, sản phẩm Shopee, TikTok hoặc dán link sàn..."
                className="w-full h-11 sm:h-13 bg-transparent text-sm sm:text-base md:text-[16.5px] font-bold text-neutral-900 placeholder:text-neutral-400 placeholder:font-medium focus:outline-none px-2"
              />

              {/* Quick Clear Button */}
              {keyword && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="p-1.5 mr-1 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-full transition-colors cursor-pointer shrink-0"
                  title="Xóa từ khóa"
                >
                  <X size={16} />
                </button>
              )}

              {/* Pro Action Button */}
              <button
                type="submit"
                className="h-10 sm:h-12 px-4 sm:px-7 rounded-xl sm:rounded-full bg-gradient-to-r from-[#FF528A] via-[#E02868] to-[#FF4D85] hover:opacity-95 text-white font-black text-xs sm:text-sm shadow-md hover:shadow-cute active:scale-95 transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                <span>Tìm Deal</span>
                <ArrowRight size={15} className="hidden sm:inline-block" />
              </button>
            </div>
          </form>

          {/* Hot Deal Keywords - Gợi ý săn deal hot tương tác */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 px-1 text-xs">
            <span className="flex items-center gap-1 font-black text-[#E02868] text-[11px] sm:text-xs mr-0.5">
              <Flame size={14} className="text-amber-500 fill-amber-500" />
              <span>Gợi ý hot:</span>
            </span>
            {HOT_KEYWORDS.map((kw) => (
              <button
                key={kw.label}
                type="button"
                onClick={() => handleSelectKeyword(kw.label)}
                className={`px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold transition-all cursor-pointer flex items-center gap-1 border ${
                  keyword.toLowerCase() === kw.label.toLowerCase()
                    ? "bg-[#FFF0F5] text-[#E02868] border-pink-300 font-black shadow-xs"
                    : "bg-white text-neutral-600 border-neutral-200/70 hover:border-pink-200 hover:bg-pink-50/60 hover:text-neutral-900"
                }`}
              >
                <span>{kw.icon}</span>
                <span>{kw.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
