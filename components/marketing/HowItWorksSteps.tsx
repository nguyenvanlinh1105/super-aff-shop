import { UserPlus, Wand2, ShoppingBag } from "lucide-react";
import { StickyStack } from "@/components/ui/StickyStack";

const STEPS = [
  {
    icon: UserPlus,
    stepNum: "01",
    title: "1. Đăng ký tài khoản",
    description:
      "Tạo tài khoản MeowBack miễn phí chưa tới 30 giây, không đòi hỏi thẻ thanh toán. Hệ thống tự động kích hoạt ví nhận hoàn tiền cho bạn.",
    badge: "🔑 Miễn phí 100%",
    gradient: "from-primary-500 via-[#FF3B7B] to-primary-600",
  },
  {
    icon: Wand2,
    stepNum: "02",
    title: "2. Dán link sản phẩm",
    description:
      "Copy link sản phẩm Shopee bạn muốn mua, dán vào MeowBack để lấy link hoàn tiền thông minh chỉ trong 1 giây.",
    badge: "🪄 Tự động 1 Giây",
    gradient: "from-sky-500 via-blue-500 to-indigo-600",
  },
  {
    icon: ShoppingBag,
    stepNum: "03",
    title: "3. Mua sắm & Nhận tiền",
    description:
      "Bấm vào link hoàn tiền và chốt đơn — tiền hoàn tự động tích lũy thẳng vào ví MeowBack. Rút về ngân hàng từ 10.000đ.",
    badge: "💰 Tích lũy về ví",
    gradient: "from-emerald-500 via-teal-500 to-green-600",
  },
];

export function HowItWorksSteps() {
  const cards = STEPS.map((step, index) => {
    const StepIcon = step.icon;
    return (
      <div
        key={index}
        className="w-full max-w-4xl mx-auto flex flex-col md:flex-row gap-8 p-8 md:p-12 bg-white border border-primary-200/90 rounded-[3rem] shadow-cute-lg overflow-hidden relative"
      >
        {/* Step Number Background */}
        <div className="absolute -top-10 -right-10 text-[200px] font-black text-primary-50/50 leading-none pointer-events-none select-none z-0">
          {step.stepNum}
        </div>

        <div className="relative z-10 flex flex-col justify-center flex-1">
          <div className="flex items-center gap-4 mb-6">
            <div
              className={`w-16 h-16 rounded-3xl bg-gradient-to-br ${step.gradient} text-white flex items-center justify-center shadow-lg shadow-primary-500/25`}
            >
              <StepIcon size={32} strokeWidth={2.2} />
            </div>
            <span className="text-[14px] font-black px-4 py-1.5 rounded-full bg-primary-100 text-primary-800 border border-primary-200/90 shadow-sm uppercase tracking-widest">
              {step.badge}
            </span>
          </div>

          <h3 className="font-black text-[32px] md:text-[40px] text-neutral-950 mb-4 leading-tight">
            {step.title}
          </h3>
          <p className="text-neutral-700 text-[18px] md:text-[20px] font-semibold leading-relaxed">
            {step.description}
          </p>
        </div>
      </div>
    );
  });

  return (
    <div className="relative w-full">
      {/* On mobile, fallback to simple stack. On desktop, use GSAP StickyStack */}
      <div className="block md:hidden space-y-6">
        {cards}
      </div>
      <div className="hidden md:block">
        <StickyStack cards={cards} />
      </div>
    </div>
  );
}
