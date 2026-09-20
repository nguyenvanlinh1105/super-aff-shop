"use client";

import { Check, X, Sparkles, Trophy, ShieldCheck, Zap, ArrowRight } from "lucide-react";
import Link from "next/link";

export function ValueComparisonSection({ customerRate = 80 }: { customerRate?: number }) {
  const comparisonRows = [
    {
      feature: "Hoàn tiền hoa hồng đơn hàng",
      subtext: "Phần hoa hồng tiếp thị từ Shopee & TikTok Shop",
      direct: "0đ (Bị giữ 100% hoa hồng)",
      meowback: `Luôn hoàn ${customerRate}% hoa hồng ròng về ví`,
    },
    {
      feature: "Rút tiền về Ngân hàng Việt Nam",
      subtext: "Chuyển khoản linh hoạt về mọi ngân hàng",
      direct: "Không hỗ trợ",
      meowback: "Rút từ 10.000đ (Duyệt lệnh siêu tốc)",
    },
    {
      feature: "Voucher & Mã giảm giá sàn",
      subtext: "Voucher Freeship, Shopee Choice, Xu...",
      direct: "Áp dụng bình thường",
      meowback: "Giữ 100% Voucher + Thêm tiền hoàn",
    },
    {
      feature: "Thưởng giới thiệu bạn bè (F1)",
      subtext: "Thu nhập thụ động từ bạn bè mua sắm",
      direct: "Không có",
      meowback: "Thưởng 5% doanh số giới thiệu các đơn đầu",
    },
    {
      feature: "Tạo link tự động qua Bot 24/7",
      subtext: "Gửi link qua Zalo OA hoặc Telegram Bot",
      direct: "Không hỗ trợ",
      meowback: "Tạo link hoàn tiền trong 1 giây",
    },
  ];

  return (
    <section className="pt-10 pb-12 md:pt-14 md:pb-16 bg-gradient-to-b from-white via-[#FFF5F8] to-white relative overflow-hidden">
      {/* Dynamic background pastel blur ribbon */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[550px] bg-primary-100/50 rounded-full blur-[150px] pointer-events-none" />

      <div className="relative z-10 max-w-[1050px] mx-auto px-4 md:px-8">
        {/* Title Header */}
        <div className="text-center space-y-3 mb-8 md:mb-10">
          <div className="inline-flex items-center gap-2 bg-primary-100/90 text-[#8A0B37] px-4 py-1.5 rounded-full text-xs font-black shadow-sm border border-primary-200/80">
            <Trophy size={15} className="text-primary-600" />
            <span>So Sánh Lợi Ích Trực Quan 🎀</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-neutral-900 tracking-tight">
            Mua sắm thông minh hơn với <br className="hidden sm:inline" />
            <span className="text-primary-600 underline decoration-primary-300 decoration-wavy decoration-2">
              sự khác biệt từ MeowBack
            </span>
          </h2>
          <p className="text-neutral-600 font-semibold max-w-lg mx-auto text-base">
            Tại sao phải trả nguyên giá khi bạn có thể nhận lại tới {customerRate}% hoa hồng trên từng đơn hàng?
          </p>
        </div>

        {/* Soft Pastel Comparison Card */}
        <div className="rounded-3xl bg-white/95 backdrop-blur-xl shadow-cute-lg border border-primary-200/90 overflow-hidden relative">
          {/* Header Row: Soft Pastel Pink Gradient */}
          <div className="grid grid-cols-12 bg-gradient-to-r from-primary-100/90 via-pink-100/90 to-primary-100/90 text-neutral-800 p-5 md:p-6 items-center border-b border-primary-200/80">
            <div className="col-span-5 md:col-span-5 text-sm md:text-base font-black text-[#6B1B38] tracking-wide flex items-center gap-2">
              <Zap size={18} className="text-amber-500 fill-amber-500" />
              <span>Quyền Lợi Mua Sắm</span>
            </div>

            <div className="col-span-3 md:col-span-3 text-center text-xs md:text-sm font-extrabold text-neutral-500">
              Mua Trực Tiếp
            </div>

            <div className="col-span-4 md:col-span-4 text-center">
              <span className="inline-flex items-center justify-center gap-1.5 bg-gradient-to-r from-primary-500 to-pink-500 text-white text-xs md:text-sm font-black px-4 py-1.5 rounded-full shadow-cute-sm">
                <Sparkles size={14} /> Mua Qua MeowBack 🎀
              </span>
            </div>
          </div>

          {/* Table Body Rows */}
          <div className="divide-y divide-primary-100/60">
            {comparisonRows.map((row, idx) => (
              <div
                key={idx}
                className={`grid grid-cols-12 p-4 md:p-5 text-xs md:text-sm items-center transition-colors ${
                  idx % 2 === 0 ? "bg-white" : "bg-[#FFF9FB]/80"
                } hover:bg-primary-50/50`}
              >
                {/* Feature Column */}
                <div className="col-span-5 md:col-span-5 pr-2">
                  <div className="font-extrabold text-neutral-900 leading-snug text-sm md:text-base">
                    {row.feature}
                  </div>
                  <div className="text-[11.5px] font-medium text-neutral-500 mt-0.5 hidden sm:block">
                    {row.subtext}
                  </div>
                </div>

                {/* Direct Purchase Column */}
                <div className="col-span-3 md:col-span-3 text-center px-1">
                  <div className="inline-flex items-center justify-center gap-1 text-rose-500 bg-rose-50/80 px-3 py-1.5 rounded-xl border border-rose-200/60 w-full sm:w-auto font-medium">
                    <X size={14} className="text-rose-400 shrink-0" />
                    <span className="text-[11px] md:text-xs font-semibold line-through">
                      {row.direct}
                    </span>
                  </div>
                </div>

                {/* MeowBack Highlighted Column (Soft Pastel Mint/Emerald) */}
                <div className="col-span-4 md:col-span-4 text-center px-1">
                  <div className="inline-flex items-center justify-center gap-1.5 text-emerald-900 bg-gradient-to-r from-emerald-50/90 via-teal-50/90 to-emerald-50/90 px-3.5 py-2 rounded-2xl border border-emerald-200/90 font-black shadow-cute-sm w-full">
                    <Check size={16} className="text-emerald-600 shrink-0 stroke-[3]" />
                    <span className="text-[11.5px] md:text-xs text-emerald-950 font-black">
                      {row.meowback}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Banner inside Card: Soft Pastel Pink Gradient with Vibrant CTA */}
          <div className="p-6 md:p-8 bg-gradient-to-r from-primary-100 via-pink-100 to-rose-100 border-t border-primary-200/80 text-neutral-900 flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
            <div className="space-y-1 text-center sm:text-left relative z-10">
              <div className="text-lg md:text-xl font-black text-[#6B1B38] flex items-center justify-center sm:justify-start gap-2">
                <span>Miễn phí 100% • Nhận hoàn tiền tức thì</span>
                <ShieldCheck size={20} className="text-primary-600" />
              </div>
              <div className="text-xs md:text-sm font-bold text-neutral-600">
                Không thu bất kỳ khoản phí nào. Rút tiền về ngân hàng linh hoạt từ 10.000đ.
              </div>
            </div>

            <Link
              href="/register"
              className="relative z-10 px-8 py-3.5 rounded-full bg-gradient-to-r from-primary-500 via-[#FF3B7B] to-primary-600 hover:scale-[1.03] active:scale-95 text-white font-black text-sm md:text-base shadow-cute hover:shadow-cute-lg transition-all shrink-0 border border-white/40 flex items-center gap-2"
            >
              <span>Đăng Ký Trải Nghiệm Ngay 🎀</span>
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
