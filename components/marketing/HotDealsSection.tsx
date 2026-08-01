"use client";

import Link from "next/link";
import { Flame, ArrowUpRight, Sparkles, ShoppingBag, Zap } from "lucide-react";
import { ShopeeIcon } from "@/components/icons/PlatformIcons";

export type DealItem = {
  id: string;
  platform: "shopee";
  platformBadge: string;
  title: string;
  category: string;
  originalPrice: number;
  salePrice: number;
  discountPercent: number;
  cashbackAmount: number;
  tagBadge: string;
  imageUrl: string;
  soldCount: string;
};

export function HotDealsSection({ deals }: { deals?: DealItem[] }) {
  if (!deals || deals.length === 0) {
    return (
      <section className="py-20 bg-gradient-to-b from-white via-primary-50/40 to-white relative overflow-hidden flex flex-col items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-black text-neutral-400">Hiện chưa có deal nào</h2>
          <p className="text-neutral-500">Các ưu đãi hoàn tiền cao nhất sẽ sớm được cập nhật tại đây.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gradient-to-b from-white via-primary-50/40 to-white border-b border-primary-100/80 relative overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-4 md:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 bg-rose-50 text-rose-600 px-4 py-1.5 rounded-full text-xs font-black shadow-sm border border-rose-200">
              <Flame size={16} className="text-rose-500 animate-pulse" />
              <span>Deal Hot Xtra Commission ⚡</span>
            </div>
            <h2 className="text-[32px] md:text-[44px] font-black text-neutral-950 tracking-tight leading-tight max-w-2xl">
              Sản phẩm thật có tỉ lệ <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-[#FF3B7B] underline decoration-primary-300 decoration-wavy decoration-2">
                hoàn tiền cao nhất hôm nay
              </span>
            </h2>
          </div>
        </div>

        {/* Deals Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {deals.map((deal) => (
            <div
              key={deal.id}
              className="group relative flex flex-col rounded-3xl bg-white border-2 border-primary-100/60 shadow-cute hover:shadow-cute-lg hover:-translate-y-2 hover:border-primary-300 transition-all duration-300 overflow-hidden"
            >
              {/* Product Image Wrapper */}
              <div className="relative aspect-square w-full overflow-hidden bg-neutral-100 p-3">
                <div className="relative w-full h-full rounded-2xl overflow-hidden">
                  <img
                    src={deal.imageUrl}
                    alt={deal.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  
                  {/* Subtle Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-primary-900/40 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                  <div className="absolute top-2.5 left-2.5 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-extrabold flex items-center gap-1.5 shadow-md">
                    <ShopeeIcon className="w-4 h-4 text-orange-500" />
                    <span className="text-orange-600">{deal.platformBadge}</span>
                  </div>

                  {/* Discount & Tag Badge (Top Right) */}
                  <div className="absolute top-2.5 right-2.5 flex flex-col items-end gap-1">
                    {deal.discountPercent > 0 && (
                      <div className="bg-rose-500 text-white px-2 py-1 rounded-lg text-[11px] font-black shadow-sm">
                        -{deal.discountPercent}%
                      </div>
                    )}
                    {deal.tagBadge && (
                      <div className="bg-neutral-900/80 backdrop-blur-sm text-white px-2 py-1 rounded-lg text-[10px] font-bold shadow-sm whitespace-nowrap">
                        {deal.tagBadge}
                      </div>
                    )}
                  </div>

                  {/* Sold Count (Bottom Left) */}
                  {deal.soldCount && (
                    <div className="absolute bottom-2.5 left-2.5 bg-[#8A0B37]/80 backdrop-blur-sm text-white px-2.5 py-1 rounded-lg text-[10.5px] font-bold shadow-sm">
                      {deal.soldCount}
                    </div>
                  )}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex flex-col flex-1 gap-4 justify-between">
                <div>
                  <span className="text-[10px] font-extrabold text-primary-500 uppercase tracking-widest block mb-2">
                    {deal.category}
                  </span>
                  <h3 className="font-bold text-[14.5px] text-neutral-800 leading-snug line-clamp-2 group-hover:text-primary-600 transition-colors">
                    {deal.title}
                  </h3>
                </div>

                {/* Pricing & Cashback UI */}
                <div className="space-y-3">
                  <div className="flex items-end gap-2">
                    <span className="text-lg font-black text-neutral-950">
                      {deal.salePrice.toLocaleString("vi-VN")}
                      <span className="text-sm font-bold align-top">đ</span>
                    </span>
                    {deal.originalPrice > deal.salePrice && (
                      <span className="text-xs font-bold text-neutral-400 line-through mb-1">
                        {deal.originalPrice.toLocaleString("vi-VN")}đ
                      </span>
                    )}
                  </div>

                  {/* Highlighted Cashback Banner */}
                  <div className="bg-primary-50 border border-primary-200/60 rounded-xl px-3 py-2.5 flex items-center justify-between">
                    <span className="text-[12px] font-bold text-neutral-600 flex items-center gap-1.5">
                      <Sparkles size={14} className="text-primary-500" />
                      Hoàn tiền về ví:
                    </span>
                    <span className="text-[14px] font-black text-primary-600">
                      + {deal.cashbackAmount.toLocaleString("vi-VN")}
                      <span className="text-[11px] align-top">đ</span>
                    </span>
                  </div>
                </div>

                {/* Call to Action Button */}
                <Link
                  href={deal.id ? `/uu-dai/${deal.id}` : "#"}
                  className="w-full flex items-center justify-center gap-2 bg-[#FF3B7B] hover:bg-[#E62E6B] text-white py-3 rounded-xl font-bold text-[13.5px] transition-colors shadow-sm group-hover:shadow-md"
                >
                  <ShoppingBag size={16} />
                  Nhận Hoàn Tiền 🎀
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
