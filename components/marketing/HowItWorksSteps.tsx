"use client";

import { UserPlus, Wand2, ShoppingBag, ArrowRight } from "lucide-react";

const STEPS = [
  {
    icon: UserPlus,
    stepNum: "01",
    title: "1. Đăng ký tài khoản",
    description:
      "Tạo tài khoản MeowBack miễn phí trong 30 giây, không đòi hỏi thẻ ngân hàng. Hệ thống tự động kích hoạt ví nhận hoàn tiền ngay lập tức.",
    badge: "🔑 Miễn phí 100%",
    gradient: "from-primary-500 via-[#FF3B7B] to-primary-600",
    shadow: "shadow-primary-500/20",
    border: "border-primary-200/90",
    bg: "bg-gradient-to-b from-primary-50/40 via-white to-white",
  },
  {
    icon: Wand2,
    stepNum: "02",
    title: "2. Dán link sản phẩm",
    description:
      "Copy link sản phẩm Shopee, Lazada hoặc TikTok Shop bạn muốn mua, dán vào MeowBack để nhận link hoàn tiền thông minh chỉ trong 1 giây.",
    badge: "🪄 Tự động 1 Giây",
    gradient: "from-sky-500 via-blue-500 to-indigo-600",
    shadow: "shadow-sky-500/20",
    border: "border-sky-200/90",
    bg: "bg-gradient-to-b from-sky-50/40 via-white to-white",
  },
  {
    icon: ShoppingBag,
    stepNum: "03",
    title: "3. Mua sắm & Nhận tiền",
    description:
      "Bấm vào link hoàn tiền để mua hàng — tiền hoàn tự động cộng thẳng vào ví MeowBack. Rút về ngân hàng từ 10.000đ.",
    badge: "💰 Tích lũy về ví",
    gradient: "from-emerald-500 via-teal-500 to-green-600",
    shadow: "shadow-emerald-500/20",
    border: "border-emerald-200/90",
    bg: "bg-gradient-to-b from-emerald-50/40 via-white to-white",
  },
];

export function HowItWorksSteps() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6 max-w-5xl mx-auto">
      {STEPS.map((step, index) => {
        const StepIcon = step.icon;
        return (
          <div
            key={index}
            className={`relative flex flex-col justify-between p-6 sm:p-7 rounded-3xl ${step.bg} border-2 ${step.border} shadow-cute hover:shadow-cute-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden group`}
          >
            {/* Watermark Step Number */}
            <div className="absolute top-2 right-4 text-6xl sm:text-7xl font-black text-neutral-900/[0.04] select-none pointer-events-none">
              {step.stepNum}
            </div>

            <div>
              {/* Header: Icon + Badge */}
              <div className="flex items-center justify-between mb-4 relative z-10">
                <div
                  className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${step.gradient} text-white flex items-center justify-center shadow-md ${step.shadow} group-hover:scale-105 transition-transform duration-300`}
                >
                  <StepIcon size={22} strokeWidth={2.2} />
                </div>
                <span className="text-[11.5px] font-black px-3 py-1 rounded-full bg-white text-neutral-800 border border-neutral-200 shadow-xs tracking-wide">
                  {step.badge}
                </span>
              </div>

              {/* Title */}
              <h3 className="text-lg sm:text-xl font-black text-neutral-950 mb-2 relative z-10">
                {step.title}
              </h3>

              {/* Description */}
              <p className="text-xs sm:text-[13.5px] font-medium text-neutral-600 leading-relaxed relative z-10">
                {step.description}
              </p>
            </div>

            {/* Bottom step progression indicator */}
            <div className="pt-4 mt-4 border-t border-neutral-100 flex items-center justify-between text-xs font-bold text-neutral-400 relative z-10">
              <span>Bước {step.stepNum}</span>
              {index < STEPS.length - 1 && (
                <span className="hidden md:flex items-center gap-1 text-primary-500 font-extrabold text-[11px]">
                  Tiếp theo <ArrowRight size={13} />
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
