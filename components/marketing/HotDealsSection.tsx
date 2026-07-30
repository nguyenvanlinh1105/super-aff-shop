"use client";

import Link from "next/link";
import { Flame, ArrowUpRight, Sparkles, ShoppingBag, Zap } from "lucide-react";
import { ShopeeIcon, TiktokIcon } from "@/components/icons/PlatformIcons";

type DealItem = {
  id: string;
  platform: "shopee" | "tiktok";
  platformBadge: "Shopee Mall" | "Shopee Preferred" | "TikTok Choice" | "TikTok Official";
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

const REAL_HOT_DEALS: DealItem[] = [
  {
    id: "1",
    platform: "shopee",
    platformBadge: "Shopee Mall",
    title: "[Thiết Kế Cao Cấp] Đầm Váy 2 Dây Chiết Eo Dáng Xòe Bliss Shop",
    category: "Thời Trang Nữ",
    originalPrice: 739000,
    salePrice: 576400,
    discountPercent: 22,
    cashbackAmount: 77100,
    tagBadge: "🔥 Xtra Comm 10%",
    imageUrl: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=600&q=80",
    soldCount: "1.2k+ đã bán",
  },
  {
    id: "2",
    platform: "tiktok",
    platformBadge: "TikTok Choice",
    title: "Set Áo Polo Thể Thao Promax Coolmate Co Giãn 4 Chiều",
    category: "Thời Trang Nam",
    originalPrice: 448800,
    salePrice: 311000,
    discountPercent: 30,
    cashbackAmount: 51200,
    tagBadge: "⚡ TikTok Flash Sale",
    imageUrl: "https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=600&q=80",
    soldCount: "3.5k+ đã bán",
  },
  {
    id: "3",
    platform: "shopee",
    platformBadge: "Shopee Mall",
    title: "Combo 2 Gói Miếng Lót Sơ Sinh Bobby Newborn 1-108 Miếng",
    category: "Mẹ & Bé",
    originalPrice: 398000,
    salePrice: 298000,
    discountPercent: 25,
    cashbackAmount: 31700,
    tagBadge: "🍼 Top Mẹ & Bé",
    imageUrl: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=600&q=80",
    soldCount: "5.8k+ đã bán",
  },
  {
    id: "4",
    platform: "shopee",
    platformBadge: "Shopee Preferred",
    title: "Cây Lau Nhà Tự Vắt Thông Minh Xoay 360° PTLuxury 2 Bông Lau",
    category: "Nhà Cửa & Đời Sống",
    originalPrice: 180000,
    salePrice: 119000,
    discountPercent: 34,
    cashbackAmount: 28500,
    tagBadge: "🏠 Bão Đơn Hàng",
    imageUrl: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80",
    soldCount: "8.9k+ đã bán",
  },
];

export function HotDealsSection() {
  const formatVND = (val: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(val);

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-white via-primary-50/20 to-white relative overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-rose-500 to-pink-600 text-white px-4 py-1.5 rounded-full text-xs font-black shadow-cute-sm">
              <Flame size={15} className="animate-pulse fill-white" />
              <span>Deal Hot Xtra Commission 🎀</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-primary-900 tracking-tight">
              Sản phẩm thật có tỉ lệ <br className="hidden sm:inline" />
              <span className="text-primary-600 underline decoration-primary-300 decoration-wavy decoration-2">
                hoàn tiền cao nhất hôm nay
              </span>
            </h2>
          </div>

          <Link
            href="/register"
            className="inline-flex items-center gap-2 text-sm font-black text-primary-600 hover:text-primary-700 bg-primary-100/80 px-4 py-2 rounded-full border border-primary-200/80 transition-all hover:bg-primary-200/80 group shrink-0"
          >
            <span>Xem thêm 1.000+ Deal Hot</span>
            <ArrowUpRight size={18} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>

        {/* Deals Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {REAL_HOT_DEALS.map((deal) => (
            <div
              key={deal.id}
              className="group rounded-3xl bg-white p-4 border-2 border-primary-100 shadow-cute hover:shadow-cute-lg transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between relative overflow-hidden"
            >
              <div>
                {/* Product Image Frame */}
                <div className="h-52 rounded-2xl relative overflow-hidden mb-4 bg-primary-50">
                  <img
                    src={deal.imageUrl}
                    alt={deal.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary-900/40 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                  {/* Platform Badge (Top Left) */}
                  <div className="absolute top-2.5 left-2.5 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-extrabold flex items-center gap-1.5 shadow-md">
                    {deal.platform === "shopee" ? (
                      <>
                        <ShopeeIcon className="w-4 h-4 text-orange-500" />
                        <span className="text-orange-600">{deal.platformBadge}</span>
                      </>
                    ) : (
                      <>
                        <TiktokIcon className="w-4 h-4 text-primary-700" />
                        <span className="text-primary-700">{deal.platformBadge}</span>
                      </>
                    )}
                  </div>

                  {/* Discount & Tag Badge (Top Right) */}
                  <div className="absolute top-2.5 right-2.5 flex flex-col items-end gap-1">
                    <span className="bg-rose-500 text-white font-black text-[11px] px-2 py-0.5 rounded-full shadow-sm">
                      -{deal.discountPercent}%
                    </span>
                    <span className="bg-[#8A0B37]/90 backdrop-blur-md text-amber-200 font-bold text-[10px] px-2 py-0.5 rounded-full border border-amber-300/30">
                      {deal.tagBadge}
                    </span>
                  </div>

                  {/* Sold count badge (Bottom Left inside image) */}
                  <div className="absolute bottom-2.5 left-2.5 bg-[#8A0B37]/80 backdrop-blur-md text-white text-[10px] font-semibold px-2 py-0.5 rounded-md">
                    {deal.soldCount}
                  </div>
                </div>

                {/* Category & Title */}
                <div className="space-y-1.5">
                  <div className="text-[10.5px] font-black uppercase tracking-wider text-primary-500/80">
                    {deal.category}
                  </div>
                  <h3 className="text-[13.5px] font-extrabold text-primary-950 line-clamp-2 leading-snug group-hover:text-primary-600 transition-colors">
                    {deal.title}
                  </h3>

                  {/* Price */}
                  <div className="flex items-baseline gap-2 pt-1">
                    <span className="text-base font-black text-primary-900">
                      {formatVND(deal.salePrice)}
                    </span>
                    <span className="text-xs font-bold text-primary-400 line-through">
                      {formatVND(deal.originalPrice)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Cashback Highlight Box & CTA */}
              <div className="mt-4 pt-3 border-t border-primary-100 space-y-2.5">
                <div className="flex items-center justify-between bg-gradient-to-r from-primary-50 to-pink-50 p-2.5 rounded-2xl border border-primary-200/80">
                  <span className="text-[11.5px] font-extrabold text-primary-700 flex items-center gap-1">
                    <Sparkles size={13} className="text-primary-500" /> Hoàn tiền về ví:
                  </span>
                  <span className="text-sm font-black text-primary-600">
                    + {formatVND(deal.cashbackAmount)}
                  </span>
                </div>

                <Link
                  href="/register"
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl bg-gradient-to-r from-primary-500 to-rose-500 hover:from-primary-600 hover:to-rose-600 text-white font-black text-xs shadow-cute hover:shadow-cute-lg transition-all active:scale-95"
                >
                  <ShoppingBag size={14} />
                  <span>Nhận Hoàn Tiền 🎀</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
