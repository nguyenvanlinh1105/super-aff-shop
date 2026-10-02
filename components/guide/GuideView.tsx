"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles, ChevronRight, ArrowRight, ShieldCheck, Zap } from "lucide-react";
import { GUIDE_STEPS, TIP_CARDS } from "./guideData";
import { FloatingElement } from "@/components/ui/FloatingElement";
import { IconBow } from "@/components/icons/CatRibbonIcons";

interface GuideViewProps {
  isPublic?: boolean;
}

export function GuideView({ isPublic = false }: GuideViewProps) {
  useEffect(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash;
      if (hash === "#7-luu-y" || hash === "#luu-y") {
        setTimeout(() => {
          const el = document.getElementById("7-luu-y") || document.getElementById("luu-y");
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }, 150);
      }
    }
  }, []);

  return (
    <div className="flex flex-col gap-6 sm:gap-8 pb-12">
      {/* ── HEADER TRANG HƯỚNG DẪN (Tối ưu cho cả Mobile & PC) ── */}
      <div className="relative overflow-hidden rounded-3xl border border-rose-100 bg-white p-4 sm:p-7 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-5">
          <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-rose-50 via-pink-50 to-amber-50/50 border border-rose-200/70 p-1 flex items-center justify-center shadow-xs shrink-0">
              <img src="/meow-back-mascot.png" alt="MeowBack" className="w-full h-full object-contain" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap mb-1">
                <span className="rounded-full bg-rose-50 border border-rose-200 px-2.5 py-0.5 text-[10px] sm:text-[11px] font-extrabold text-rose-600 uppercase tracking-wide">
                  Cẩm nang MeowBack 📖
                </span>
                <span className="text-[11px] font-bold text-neutral-400 hidden sm:inline">•</span>
                <span className="text-[11px] sm:text-[12px] font-bold text-neutral-500 hidden sm:inline">Shopee • TikTok Shop • Lazada</span>
              </div>
              <h1 className="text-lg sm:text-2xl font-black text-neutral-900 tracking-tight leading-snug">
                Hướng Dẫn Sử Dụng
              </h1>
              <p className="mt-0.5 text-xs sm:text-sm text-neutral-500 font-medium leading-relaxed truncate">
                5 bước đơn giản để mua sắm và nhận hoàn tiền tự động về ví 🎀
              </p>
            </div>
          </div>

          <Link
            href="#7-luu-y"
            className="group inline-flex items-center justify-between sm:justify-start gap-2 rounded-xl bg-amber-50 hover:bg-amber-100/80 text-amber-900 border border-amber-200/70 px-3.5 py-2 text-xs font-bold transition-all shadow-2xs shrink-0"
          >
            <div className="flex items-center gap-1.5 min-w-0">
              <Sparkles size={13} className="text-amber-600 shrink-0" />
              <span className="whitespace-nowrap">7 Lưu ý quan trọng</span>
            </div>
            <ChevronRight size={13} className="text-amber-700 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>

      {/* ── 5 BƯỚC HƯỚNG DẪN TRỰC QUAN (TỰ ĐỘNG HIỂN THỊ ẢNH MOBILE HOẶC PC) ── */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-500 text-xs font-black text-white shadow-xs">
              🐾
            </span>
            <h2 className="text-lg sm:text-xl font-extrabold text-neutral-900">
              Quy trình 5 bước nhận hoàn tiền
            </h2>
          </div>
          <span className="text-xs font-bold text-neutral-400 hidden sm:inline">
            Ảnh chụp tự động tương ứng theo thiết bị bạn đang dùng
          </span>
        </div>

        <div className="flex flex-col gap-5 sm:gap-6">
          {GUIDE_STEPS.map((s) => (
            <div
              key={s.step}
              className="relative overflow-hidden rounded-3xl bg-white border border-primary-100/80 p-5 sm:p-7 shadow-cute transition-all hover:shadow-md"
            >
              {/* Header của từng bước */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3.5 sm:mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-400 to-pink-500 text-white font-black text-sm sm:text-base shadow-md shadow-primary-500/25">
                    {s.step}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-[15px] sm:text-lg font-extrabold text-neutral-900 leading-snug">
                        {s.title}
                      </h3>
                      <span className="rounded-full bg-primary-50 border border-primary-200 px-2 py-0.5 text-[10px] sm:text-[11px] font-bold text-primary-600">
                        {s.tagline}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Nội dung chi tiết */}
              <p className="text-[13px] sm:text-[14px] text-neutral-600 leading-relaxed font-medium mb-3">
                {s.body}
              </p>

              {/* Mẹo hữu ích */}
              <div className="mb-4 rounded-2xl bg-primary-50/50 border border-primary-100 p-3 sm:px-4 text-[12px] sm:text-[13px] text-primary-900 flex items-start gap-2.5 font-medium">
                <Sparkles size={16} className="text-primary-500 shrink-0 mt-0.5" />
                <span>{s.tips}</span>
              </div>

              {/* Mockup Frame chứa ảnh thực tế hệ thống (Tự động thích ứng Mobile & PC) */}
              <div className="overflow-hidden rounded-2xl border border-primary-100/80 bg-neutral-50/40 shadow-xs">
                {/* Mockup top bar */}
                <div className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-2.5 bg-white border-b border-primary-100/60">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-rose-300 shrink-0" />
                    <span className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-amber-300 shrink-0" />
                    <span className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-emerald-300 shrink-0" />
                    <span className="text-[10px] sm:text-[11px] font-semibold text-neutral-500 ml-1.5 truncate">
                      {s.screenTitle}
                    </span>
                  </div>
                  {/* Badge chỉ thị thiết bị */}
                  <div className="flex items-center shrink-0 ml-2">
                    <span className="text-[10px] font-bold text-primary-700 bg-primary-50 px-2 py-0.5 rounded-full border border-primary-200 sm:hidden">
                      📱 Màn hình điện thoại
                    </span>
                    <span className="text-[10px] font-bold text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-full hidden sm:inline">
                      💻 Màn hình máy tính
                    </span>
                  </div>
                </div>

                {/* Mobile View Image: hiển thị tự động trên màn hình điện thoại (< 640px) */}
                <div className="block sm:hidden p-2.5 bg-gradient-to-b from-primary-50/20 to-white">
                  <img
                    src={s.imageMobile}
                    alt={`${s.title} trên điện thoại`}
                    className="w-full max-h-[360px] object-contain rounded-xl shadow-xs border border-primary-100/40 mx-auto"
                    loading="lazy"
                  />
                </div>

                {/* Desktop View Image: hiển thị tự động trên màn hình máy tính (>= 640px) */}
                <div className="hidden sm:flex p-4 bg-gradient-to-b from-primary-50/20 to-white items-center justify-center">
                  <img
                    src={s.imageDesktop}
                    alt={`${s.title} trên máy tính`}
                    className="w-full max-h-[420px] object-contain rounded-xl shadow-xs border border-primary-100/40"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 7 LƯU Ý QUAN TRỌNG (Đồng bộ tone hồng pastel) ── */}
      <div id="7-luu-y" className="scroll-mt-24 flex flex-col gap-6 pt-4 relative">
        <span id="luu-y" className="absolute -top-24 pointer-events-none" />
        {/* Banner header lưu ý: Gọn gàng 1 dòng, siêu dễ thương & không dài dòng */}
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-rose-500 via-pink-500 to-rose-500 p-3.5 sm:p-4.5 shadow-md shadow-rose-500/20 text-white border border-white/30">
          {/* Subtle glowing ambient lights */}
          <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-white/20 blur-2xl pointer-events-none" />
          <div className="absolute -left-6 -top-6 w-28 h-28 rounded-full bg-amber-300/20 blur-xl pointer-events-none" />

          {/* Background watermark paws */}
          <div className="absolute inset-0 opacity-10 pointer-events-none select-none flex items-center justify-between px-6">
            <span className="text-3xl">🐾</span>
            <span className="text-3xl">🎀</span>
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
            {/* Mascot + 1-Line Title */}
            <div className="flex items-center gap-3 min-w-0 w-full sm:w-auto">
              <div className="relative shrink-0">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-white/25 backdrop-blur-md flex items-center justify-center p-1 border border-white/50 shadow-sm overflow-hidden">
                  <img
                    src="/meow-back-mascot.png"
                    alt="MeowBack Mascot"
                    className="w-full h-full object-contain"
                  />
                </div>
                {/* Cute Badge 7 */}
                <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 text-amber-950 font-black text-[11px] flex items-center justify-center border border-white shadow-xs">
                  7
                </div>
              </div>

              <h2 className="text-base sm:text-lg lg:text-xl font-black text-white tracking-tight leading-none drop-shadow-xs flex items-center gap-1.5 truncate">
                <span>7 Lưu Ý Quan Trọng Cần Nhớ</span>
                <span className="text-amber-200">✨</span>
              </h2>
            </div>

            {/* Action Button */}
            {isPublic ? (
              <Link
                href="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-white hover:bg-rose-50 text-rose-600 px-4 py-2 text-xs font-black transition-all hover:scale-105 active:scale-95 shadow-sm shrink-0 border border-white/80"
              >
                <span>Tạo tài khoản ngay 🌸</span>
                <ArrowRight size={14} strokeWidth={2.6} />
              </Link>
            ) : (
              <Link
                href="/app/refunds"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-white hover:bg-rose-50 text-rose-600 px-4 py-2 text-xs font-black transition-all hover:scale-105 active:scale-95 shadow-sm shrink-0 border border-white/80 group"
              >
                <ArrowLeft size={14} strokeWidth={2.6} className="group-hover:-translate-x-0.5 transition-transform" />
                <span>Quay lại tạo link</span>
                <Sparkles size={13} className="text-amber-500 fill-amber-400" />
              </Link>
            )}
          </div>
        </div>

        {/* Grid 6 card lưu ý có ảnh minh họa kawaii cat */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {TIP_CARDS.map((tip, i) => (
            <div
              key={tip.title}
              className={`group relative overflow-hidden rounded-3xl bg-gradient-to-br ${tip.color} border ${tip.borderColor} shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
            >
              {/* Số thứ tự màu hồng */}
              <div className="absolute top-4 left-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary-400 to-pink-500 text-[14px] font-black text-white shadow-md shadow-primary-500/30">
                {i + 1}
              </div>

              {/* Ảnh minh hoạ */}
              <div className="relative h-44 overflow-hidden">
                <img
                  src={tip.image}
                  alt={tip.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-transparent to-transparent" />
              </div>

              {/* Nội dung */}
              <div className="p-5 pt-2">
                <h3 className="text-[14px] font-extrabold text-neutral-900 mb-2 leading-snug">
                  {tip.title}
                </h3>
                <p className="text-[12px] text-neutral-600 leading-relaxed font-medium">
                  {tip.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer hỗ trợ */}
      <div className="rounded-3xl bg-gradient-to-br from-rose-50 to-pink-50/50 p-5 sm:p-6 border border-rose-200/60 flex flex-col sm:flex-row items-center gap-4">
        <img src="/meowback_lucky_cat_logo.png" alt="" className="h-12 w-12 sm:h-14 sm:w-14 object-contain shrink-0" />
        <div className="flex-1 text-center sm:text-left">
          <div className="font-extrabold text-neutral-900 text-sm sm:text-base">Vẫn còn thắc mắc về cách nhận hoàn tiền?</div>
          <div className="text-[12px] sm:text-[13px] text-neutral-500 mt-0.5">Đội ngũ hỗ trợ MeowBack luôn sẵn sàng giải đáp và hướng dẫn bạn 24/7.</div>
        </div>
        {isPublic ? (
          <Link
            href="/register"
            className="shrink-0 rounded-2xl bg-gradient-to-r from-primary-500 to-pink-500 px-6 py-2.5 sm:py-3 text-center text-[13px] font-extrabold text-white shadow-md shadow-primary-500/25 transition-all hover:scale-105 active:scale-[0.98] w-full sm:w-auto"
          >
            Đăng ký tài khoản miễn phí 🐾
          </Link>
        ) : (
          <Link
            href="/app/notifications"
            className="shrink-0 rounded-2xl bg-gradient-to-r from-primary-500 to-pink-500 px-6 py-2.5 sm:py-3 text-center text-[13px] font-extrabold text-white shadow-md shadow-primary-500/25 transition-all hover:scale-105 active:scale-[0.98] w-full sm:w-auto"
          >
            Xem thông báo &amp; hỗ trợ 💬
          </Link>
        )}
      </div>
    </div>
  );
}
