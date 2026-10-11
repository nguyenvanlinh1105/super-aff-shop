"use client";

import { Sparkles, CheckCircle2, Copy, ShoppingBag, Wallet, ArrowRight } from "lucide-react";
import { ShopeeIcon, LazadaIcon, TiktokIcon } from "@/components/icons/PlatformIcons";

export function HeroGallerySlider({ customerRate = 80 }: { customerRate?: number }) {
  const steps = [
    {
      num: "1",
      title: "Copy link sản phẩm",
      desc: "Lấy link bất kỳ từ Shopee, Lazada hoặc TikTok Shop bạn muốn mua.",
      icon: Copy,
      color: "bg-amber-100 text-amber-700",
    },
    {
      num: "2",
      title: "Dán vào MeowBack",
      desc: "Nhận link mua hàng hoàn tiền tự động trong 1 giây.",
      icon: ShoppingBag,
      color: "bg-pink-100 text-pink-700",
    },
    {
      num: "3",
      title: `Nhận ${customerRate}% hoàn tiền về ví`,
      desc: "Tiền hoàn tích lũy tự động, rút thẳng ngân hàng chỉ từ 10.000đ.",
      icon: Wallet,
      color: "bg-emerald-100 text-emerald-700",
    },
  ];

  return (
    <div className="relative w-full max-w-[360px] sm:max-w-[440px] md:max-w-[480px] lg:max-w-[500px] mx-auto select-none">
      {/* Background Soft Glow */}
      <div className="absolute -top-6 -left-6 w-48 h-48 bg-primary-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-pink-200/40 rounded-full blur-3xl pointer-events-none" />

      {/* Main Card Container with Mascot Image & Overlay */}
      <div className="relative rounded-3xl sm:rounded-[36px] overflow-hidden border-2 border-primary-200/90 shadow-cute-lg bg-white">
        {/* Mascot Background Image (Responsive Desktop / Mobile) */}
        <div className="relative w-full h-[210px] sm:h-[240px] md:h-[260px] overflow-hidden bg-gradient-to-b from-[#FFE8F0] to-[#FFF5F8]">
          <picture>
            <source media="(max-width: 639px)" srcSet="/meowback_clean_mobile.jpg" />
            <img
              src="/meowback_clean_desktop.jpg"
              alt={`MeowBack Mèo Thần Tài Hoàn Tiền ${customerRate}%`}
              className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-700"
              loading="eager"
            />
          </picture>

          {/* Gradient Overlay to seamlessly merge into the card below */}
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent" />

          {/* Top Floating Badge on Image */}
          <div className="absolute top-3.5 left-3.5 sm:top-4 sm:left-4 z-10 flex items-center gap-1.5 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full border border-primary-200/80 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11.5px] font-black text-neutral-800 tracking-tight">
              Tự động hoàn {customerRate}% hoa hồng
            </span>
          </div>

          {/* Floating Platform Icons on Image */}
          <div className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 z-10 flex items-center gap-1.5 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full border border-neutral-200 shadow-sm">
            <ShopeeIcon size={14} />
            <LazadaIcon size={14} />
            <TiktokIcon size={14} />
          </div>
        </div>

        {/* ── CARD NỘI DUNG: HƯỚNG DẪN SỬ DỤNG BACK 80% ── */}
        <div className="relative z-10 -mt-6 sm:-mt-8 mx-3 sm:mx-4 mb-3 sm:mb-4 bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-primary-100 shadow-md">
          {/* Card Title */}
          <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-neutral-100">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[12px] font-black uppercase text-primary-600 tracking-wider flex items-center gap-1">
                  <Sparkles size={13} className="text-primary-500" />
                  Cơ Chế Hoàn Tiền
                </span>
              </div>
              <h3 className="text-[15px] sm:text-[16px] font-black text-neutral-900 leading-tight">
                3 Bước Nhận Lại {customerRate}% Hoa Hồng 🎀
              </h3>
            </div>
            <div className="text-right shrink-0">
              <span className="inline-block text-[11px] font-black px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
                Rút từ 10.000đ
              </span>
            </div>
          </div>

          {/* 3 Simple Steps */}
          <div className="space-y-2.5">
            {steps.map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.num}
                  className="flex items-start gap-2.5 p-2 sm:p-2.5 rounded-xl bg-neutral-50/80 hover:bg-primary-50/40 border border-neutral-100 transition-colors"
                >
                  <div
                    className={`w-6 h-6 rounded-lg ${s.color} flex items-center justify-center shrink-0 font-black text-[12px] mt-0.5`}
                  >
                    {s.num}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[12.5px] sm:text-[13px] font-extrabold text-neutral-900 leading-snug">
                      {s.title}
                    </p>
                    <p className="text-[11px] sm:text-[11.5px] font-medium text-neutral-500 leading-tight mt-0.5">
                      {s.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Trust Guarantee */}
          <div className="mt-3 pt-2.5 border-t border-neutral-100 flex items-center justify-between text-[11px] font-bold text-neutral-600">
            <span className="flex items-center gap-1 text-emerald-600 font-extrabold">
              <CheckCircle2 size={13} />
              Hoàn tiền tự động 100%
            </span>
            <span className="text-neutral-400">Shopee • Lazada • TikTok</span>
          </div>
        </div>
      </div>
    </div>
  );
}
