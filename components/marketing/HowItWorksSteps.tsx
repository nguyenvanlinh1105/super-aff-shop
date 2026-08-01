import { UserPlus, Wand2, ShoppingBag } from "lucide-react";

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
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
      {STEPS.map((step, index) => {
        const StepIcon = step.icon;
        return (
          <div
            key={index}
            className="group relative flex flex-col justify-between p-7 bg-white border-2 border-primary-100/90 rounded-3xl hover:border-primary-400 hover:shadow-cute-lg hover:-translate-y-2 transition-all duration-300 overflow-hidden shadow-cute"
          >
            {/* Top Step Header: Icon + Step Badge */}
            <div>
              <div className="flex items-center justify-between mb-5">
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${step.gradient} text-white flex items-center justify-center shadow-cute group-hover:scale-110 transition-transform duration-300`}
                >
                  <StepIcon size={26} strokeWidth={2.2} />
                </div>
                <span className="text-[12px] font-black px-3.5 py-1 rounded-full bg-primary-100 text-primary-800 border border-primary-200/90 shadow-sm">
                  {step.badge}
                </span>
              </div>

              <h3 className="font-black text-[21px] text-neutral-950 mb-3 leading-snug">
                {step.title}
              </h3>
              <p className="text-neutral-700 text-[14.5px] font-semibold leading-relaxed">
                {step.description}
              </p>
            </div>

            {/* Bottom Step Indicator Bar */}
            <div className="mt-8 pt-4 border-t border-primary-100 flex items-center justify-between">
              <span className="text-xs font-black text-primary-600 uppercase tracking-widest">
                Bước {step.stepNum}
              </span>
              <div className="w-8 h-1 rounded-full bg-primary-300 group-hover:w-16 group-hover:bg-primary-500 transition-all duration-300" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
