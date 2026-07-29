import { Wallet, Users, Quote, Star, UserCheck, Sparkles, ShoppingBag, ShieldCheck, Heart } from "lucide-react";
import { IconBow } from "@/components/icons/CatRibbonIcons";

const TESTIMONIALS = [
  {
    name: "Nguyễn Thanh Thảo",
    location: "TP. Hồ Chí Minh",
    role: "🛒 Shopee Choice VIP",
    avatarImg: "/avatar_user_1.png",
    avatarBg: "from-pink-400 to-rose-500",
    cashback: "Đã rút: 1.250.000đ 💸",
    quote:
      "Mỗi tháng mình chốt đơn Shopee tầm 4-5 triệu mua mỹ phẩm & đồ gia dụng. Dùng MeowBack tự động gắn mã hoàn tiền, đến cuối tháng rút thẳng 1.25 triệu về Vietcombank. Quá tiện & cực kỳ uy tín!",
  },
  {
    name: "Trần Hoàng Nam",
    location: "Hà Nội",
    role: "📦 Creator TikTok Shop",
    avatarImg: "/avatar_user_2.png",
    avatarBg: "from-blue-400 to-[#000000]",
    cashback: "Đã rút: 3.480.000đ ⚡",
    quote:
      "Mình hay dán link mua đồ công nghệ trên TikTok Shop. Tốc độ ghi nhận đơn trên MeowBack cực nhanh chỉ sau 1-2 phút. Hoa hồng minh bạch, rút tiền ngân hàng không tốn 1 đồng phí.",
  },
  {
    name: "Trần Mai Phương",
    location: "Đà Nẵng",
    role: "🛍️ Mua sắm thông thái",
    avatarImg: "/avatar_user_3.png",
    avatarBg: "from-purple-400 to-indigo-600",
    cashback: "Đã rút: 850.000đ 🎁",
    quote:
      "Thích nhất là tính năng mời bạn bè nhận 5% hoa hồng trọn đời. Mình giới thiệu cả phòng làm việc cùng dùng, giờ hàng tháng tiền thụ động đổ về ví MeowBack đủ dư tiền cà phê cả tháng!",
  },
  {
    name: "Phạm Vũ Anh",
    location: "Hải Phòng",
    role: "💳 Khách hàng VIP",
    avatarImg: "/avatar_user_4.png",
    avatarBg: "from-amber-400 to-orange-500",
    cashback: "Đã rút: 2.150.000đ 🚀",
    quote:
      "Giao diện dễ xài nhất trong các nền tảng hoàn tiền hiện nay. Dán link cái có ngay link hoàn tiền. Rút tiền phát là ngân hàng báo Ting Ting trong 60 giây, support hỗ trợ rất nhiệt tình.",
  },
  {
    name: "Đặng Khánh Linh",
    location: "Cần Thơ",
    role: "🍼 Mẹ bỉm săn sale",
    avatarImg: "/avatar_user_5.png",
    avatarBg: "from-emerald-400 to-teal-600",
    cashback: "Đã rút: 1.680.000đ 🎀",
    quote:
      "Tã bỉm và sữa cho bé đắt đỏ nên mỗi tháng tiết kiệm được 15-20% từ hoàn tiền MeowBack là niềm vui lớn của mẹ bỉm. Web rõ ràng, đối soát chuẩn xác, không có quảng cáo rác phiền phức.",
  },
  {
    name: "Hoàng Trọng Nghĩa",
    location: "Bình Dương",
    role: "⚡ Hội viên Pro",
    avatarImg: "/avatar_user_6.png",
    avatarBg: "from-sky-400 to-blue-600",
    cashback: "Đã rút: 4.520.000đ 💎",
    quote:
      "App chạy mượt, đối soát hoa hồng chuẩn từng xu. Thích nhất là mức rút tối thiểu chỉ từ 10K là rút được rồi, chứ không như các nơi khác bắt tích đủ vài trăm K mới cho rút.",
  },
];

const BASE_PAID_OUT = 85500000; // 85.500.000đ base
const BASE_CUSTOMERS = 2450;    // 2.450+ customers base

function formatVnd(n: number) {
  const formatted = Math.floor(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${formatted}đ`;
}

export function SocialProofSection({ totalPaidOut, totalCustomers }: { totalPaidOut: number; totalCustomers: number }) {
  const displayPaidOut = BASE_PAID_OUT + (totalPaidOut || 0);
  const displayCustomers = BASE_CUSTOMERS + (totalCustomers || 0);

  return (
    <section className="py-20 bg-gradient-to-b from-white via-primary-50/30 to-white relative overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-4 md:px-8">
        {/* Live counter cards */}
        <div className="grid sm:grid-cols-2 gap-6 mb-20">
          {/* Card 1: Total Paid Out */}
          <div className="group flex items-center gap-5 rounded-3xl bg-gradient-to-br from-primary-50/70 via-white to-primary-50/30 p-6 border-2 border-primary-200/90 shadow-cute hover:shadow-cute-lg hover:-translate-y-1 transition-all duration-300">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-400 via-[#FF3B7B] to-primary-600 text-white shadow-cute group-hover:scale-110 transition-transform duration-300">
              <Wallet size={30} strokeWidth={2.2} />
            </div>
            <div>
              <p className="text-[12px] font-black uppercase tracking-widest text-primary-600 mb-1">
                Đã hoàn tiền cho ví
              </p>
              <p className="text-[28px] sm:text-[34px] font-black text-neutral-950 tabular-nums leading-tight">
                {formatVnd(displayPaidOut)}+
              </p>
            </div>
          </div>

          {/* Card 2: Total Customers */}
          <div className="group flex items-center gap-5 rounded-3xl bg-gradient-to-br from-emerald-50/70 via-white to-emerald-50/30 p-6 border-2 border-emerald-200/90 shadow-cute hover:shadow-cute-lg hover:-translate-y-1 transition-all duration-300">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 text-white shadow-cute group-hover:scale-110 transition-transform duration-300">
              <Users size={30} strokeWidth={2.2} />
            </div>
            <div>
              <p className="text-[12px] font-black uppercase tracking-widest text-emerald-700 mb-1">
                Người dùng đã nhận tiền
              </p>
              <p className="text-[28px] sm:text-[34px] font-black text-neutral-950 tabular-nums leading-tight">
                {displayCustomers.toLocaleString("vi-VN")}+
              </p>
            </div>
          </div>
        </div>

        {/* Testimonials Title */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center justify-center gap-2 mb-3 bg-primary-50 px-4 py-1.5 rounded-full border border-primary-200/80">
            <IconBow className="w-4 h-4 text-accent-bow" />
            <span className="text-[13px] font-black text-primary-600 uppercase tracking-wide">
              Đánh giá thực tế
            </span>
          </div>
          <h2 className="text-[32px] sm:text-[44px] font-black text-neutral-950 tracking-tight leading-tight">
            Khách hàng nói gì về <span className="text-primary-600 underline decoration-primary-300 decoration-wavy decoration-2">MeowBack</span> 🎀
          </h2>
        </div>

        {/* Testimonial Cards Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              className="group flex flex-col justify-between rounded-3xl bg-white p-6 border-2 border-primary-100/90 shadow-cute hover:shadow-cute-lg hover:-translate-y-1.5 hover:border-primary-300 transition-all duration-300 overflow-hidden"
            >
              {/* Top Row: Avatar Ring + User Info + 5-Star Rating */}
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`relative w-12 h-12 rounded-2xl p-0.5 bg-gradient-to-br ${t.avatarBg} shadow-cute group-hover:scale-105 transition-transform duration-300 shrink-0 overflow-hidden`}
                    >
                      <img
                        src={t.avatarImg}
                        alt={t.name}
                        className="w-full h-full object-cover rounded-[14px]"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="text-[15px] font-black text-neutral-950">
                          {t.name}
                        </p>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-1.5 py-0.5 rounded-md border border-emerald-200">
                          ✓ Đã rút tiền
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11.5px] font-semibold text-neutral-500">
                          {t.location}
                        </span>
                        <span className="text-neutral-300">•</span>
                        <span className="text-[11px] font-bold text-primary-600">
                          {t.role}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 5 Stars Bar */}
                <div className="flex items-center text-amber-400 gap-1 mb-3 bg-amber-50/80 px-2.5 py-1 rounded-xl w-fit border border-amber-200/60">
                  <div className="flex items-center gap-0.5">
                    <Star fill="currentColor" size={12} strokeWidth={0} />
                    <Star fill="currentColor" size={12} strokeWidth={0} />
                    <Star fill="currentColor" size={12} strokeWidth={0} />
                    <Star fill="currentColor" size={12} strokeWidth={0} />
                    <Star fill="currentColor" size={12} strokeWidth={0} />
                  </div>
                  <span className="text-[11px] font-extrabold text-amber-800 ml-1">
                    5.0 / 5.0
                  </span>
                </div>

                {/* Quote Body */}
                <p className="text-[14px] font-medium text-neutral-800 leading-relaxed mb-4">
                  "{t.quote}"
                </p>
              </div>

              {/* Footer: Withdrawal Badge */}
              <div className="pt-3.5 border-t border-primary-100/70 flex items-center justify-between mt-2">
                <span className="text-[12px] font-black bg-primary-100/80 text-primary-800 px-3.5 py-1 rounded-full border border-primary-200/80 shadow-sm">
                  {t.cashback}
                </span>
                <Quote size={18} className="text-primary-300" strokeWidth={2} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

