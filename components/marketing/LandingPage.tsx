import Link from "next/link";
import {
  ArrowRight,
  Link2,
  ClipboardList,
  Wallet,
  Send,
  TicketPercent,
  ShieldCheck,
  Sparkles,
  Gift,
  Zap,
  Users,
  UserPlus,
  Wand2,
  ShoppingBag,
} from "lucide-react";
import { ShopeeIcon } from "@/components/icons/PlatformIcons";
import {
  LogoMeowBack,
  IconBow,
  IllustCatSuccess,
} from "@/components/icons/CatRibbonIcons";
import { FaqAccordion } from "@/components/marketing/FaqAccordion";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { PublicFloatingSupport } from "@/components/marketing/PublicFloatingSupport";
import { DemoConvertLink } from "@/components/marketing/DemoConvertLink";

import { HeroGallerySlider } from "@/components/marketing/HeroGallerySlider";
import { HowItWorksSteps } from "@/components/marketing/HowItWorksSteps";
import { LiveCashbackCalculator } from "@/components/marketing/LiveCashbackCalculator";
import { ValueComparisonSection } from "@/components/marketing/ValueComparisonSection";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { ShopeeLiveDemo } from "@/components/ui/ShopeeLiveDemo";

const CAT_HIGHLIGHT_CARDS = [
  {
    icon: Zap,
    title: "Tạo link tức thì",
    description:
      "Dán link Shopee, nhận link hoàn tiền chỉ trong 1 giây.",
    badge: "⚡ 1 Giây",
    gradient: "from-amber-400 to-amber-500 text-white",
    cardBg:
      "bg-gradient-to-b from-amber-50/70 via-white to-amber-50/30 border-amber-200/90 hover:border-amber-400/80",
    badgeBg: "bg-amber-100/90 text-amber-800 border-amber-200/80",
  },
  {
    icon: ClipboardList,
    title: "Theo dõi minh bạch",
    description:
      "Cập nhật trạng thái đơn hàng & hoa hồng hoàn tiền chính xác theo thời gian thực.",
    badge: "📊 Realtime",
    gradient: "from-sky-400 to-blue-500 text-white",
    cardBg:
      "bg-gradient-to-b from-sky-50/70 via-white to-sky-50/30 border-sky-200/90 hover:border-sky-400/80",
    badgeBg: "bg-sky-100/90 text-sky-800 border-sky-200/80",
  },
  {
    icon: Wallet,
    title: "Rút tiền từ 10.000đ",
    description:
      "Rút tiền linh hoạt từ 10K về tài khoản ngân hàng nhanh chóng, không phí ẩn.",
    badge: "💳 Ngân Hàng",
    gradient: "from-primary-400 via-[#FF3B7B] to-primary-600 text-white",
    cardBg:
      "bg-gradient-to-b from-primary-50/70 via-white to-primary-50/30 border-primary-200/90 hover:border-primary-400/80",
    badgeBg: "bg-primary-100/90 text-primary-800 border-primary-200/80",
  },
  {
    icon: Users,
    title: "Mời bạn nhận 5%",
    description:
      "Chia sẻ link giới thiệu MeowBack cho bạn bè, nhận thưởng 5% cho các đơn hàng đầu.",
    badge: "🎁 Thu Nhập Thêm",
    gradient: "from-emerald-400 to-teal-500 text-white",
    cardBg:
      "bg-gradient-to-b from-emerald-50/70 via-white to-emerald-50/30 border-emerald-200/90 hover:border-emerald-400/80",
    badgeBg: "bg-emerald-100/90 text-emerald-800 border-emerald-200/80",
  },
];



export function LandingPage({
  totalPaidOut,
  totalCustomers,
  customerRate = 80,
  taxRate = 10.98,
}: {
  totalPaidOut: number;
  totalCustomers: number;
  customerRate?: number;
  taxRate?: number;
}) {
  return (
    <div className="min-h-screen bg-neutral-bg font-sans overflow-x-hidden text-neutral-950">
      <MarketingHeader activePath="/" />

      <main className="pt-16">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-primary-50 via-neutral-bg to-white">
          {/* Subtle background ribbons */}
          <div className="absolute top-10 right-10 w-96 h-96 bg-primary-200/30 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute top-40 left-10 w-72 h-72 bg-secondary-100/50 rounded-full blur-[80px] pointer-events-none" />

          <div className="relative z-10 max-w-[1200px] mx-auto px-4 md:px-8 py-8 md:py-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 items-center">
              <div className="space-y-5 fade-in text-center lg:text-left">
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-100 to-primary-200 text-[#8A0B37] px-3 py-1 md:px-4 md:py-1.5 rounded-full shadow-sm border border-primary-300/60">
                  <IconBow className="w-3.5 h-3.5 md:w-4 md:h-4 text-accent-bow" />
                  <span className="text-[12px] md:text-[13.5px] font-black tracking-wide">
                    Luôn hoàn {customerRate}% hoa hồng ròng 🎀
                  </span>
                </div>

                <h1 className="text-[30px] sm:text-[38px] md:text-[54px] font-black leading-[1.15] text-neutral-950 tracking-tight">
                  Hoàn tiền tự động{" "}
                  <span className="text-primary-600 underline decoration-primary-300 decoration-wavy decoration-2">
                    mỗi đơn Shopee
                  </span>
                </h1>

                <p className="text-[15px] md:text-[17px] text-neutral-700 max-w-lg leading-relaxed font-semibold mx-auto lg:mx-0">
                  Mua sắm <strong className="text-primary-600 font-extrabold">Shopee</strong> thông minh hơn với MeowBack.
                  Nhận hoàn tiền tự động, luôn hoàn đến {customerRate}%, rút từ <strong className="text-neutral-950 font-black">10.000đ</strong>.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 pt-1 items-center lg:items-start">
                  <MagneticButton>
                    <Link
                      href="/login"
                      className="w-full sm:w-auto bg-gradient-to-r from-primary-500 via-[#FF3B7B] to-primary-600 hover:scale-[1.02] active:scale-95 text-white px-7 py-3.5 rounded-full font-extrabold text-[15px] md:text-[16.5px] flex items-center justify-center gap-2 transition-all shadow-cute hover:shadow-cute-lg"
                    >
                      Bắt đầu hoàn tiền ngay
                      <ArrowRight size={17} />
                    </Link>
                  </MagneticButton>
                  <a
                    href="#how-it-works"
                    className="w-full sm:w-auto bg-white hover:bg-primary-50 text-neutral-950 hover:text-primary-600 px-6 py-3.5 rounded-full font-extrabold text-[15px] md:text-[16px] flex items-center justify-center gap-2 transition-all border-2 border-primary-200/90 shadow-sm"
                  >
                    Cách hoạt động
                  </a>
                </div>

                {/* Demo Link Converter Input Component */}
                <div className="pt-2">
                  <DemoConvertLink />
                </div>
              </div>

              {/* Hero Gallery — hidden on small mobile, show from sm up */}
              <div className="hidden sm:flex justify-center items-center">
                <HeroGallerySlider customerRate={customerRate} />
              </div>
            </div>
          </div>
        </section>

        {/* Shopee Live Demo Interactive Section */}
        <section className="py-12 border-b border-primary-100/50 bg-gradient-to-b from-white/50 to-neutral-50/80 backdrop-blur-md overflow-hidden relative">
          <div className="max-w-[1200px] mx-auto px-4 text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-black text-neutral-900 mb-3">
              Chỉ 1 giây để lấy link hoàn tiền Shopee
            </h2>
            <p className="text-neutral-600 font-semibold max-w-2xl mx-auto">
              Không cần tải app phức tạp. Chỉ cần copy link từ Shopee, dán vào MeowBack, và hệ thống sẽ lo phần còn lại.
            </p>
          </div>
          <ShopeeLiveDemo />
        </section>

        {/* Feature Highlight Cards */}
        <section className="py-12 bg-white border-y border-primary-100/80">
          <div className="max-w-[1200px] mx-auto px-4 md:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {CAT_HIGHLIGHT_CARDS.map((f) => {
              const IconComponent = f.icon;
              return (
                <div
                  key={f.title}
                  className={`group relative flex flex-col justify-between rounded-3xl ${f.cardBg} p-6 border-2 shadow-cute hover:shadow-cute-lg hover:-translate-y-1.5 transition-all duration-300 overflow-hidden`}
                >
                  {/* Top Row: 3D Gradient Icon Badge (Left) + Mini Feature Tag (Right) */}
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${f.gradient} flex items-center justify-center shadow-cute group-hover:scale-110 transition-transform duration-300 shrink-0`}
                    >
                      <IconComponent size={22} strokeWidth={2.2} />
                    </div>
                    <span
                      className={`text-[11.5px] font-black px-3 py-1 rounded-full border ${f.badgeBg} tracking-wide shadow-sm`}
                    >
                      {f.badge}
                    </span>
                  </div>

                  {/* Middle Line: Card Title */}
                  <h3 className="font-black text-[18px] text-neutral-950 mb-2 leading-snug">
                    {f.title}
                  </h3>

                  {/* Bottom Line: Full-width Description Text on separate block below */}
                  <p className="text-neutral-700 text-[14px] font-semibold leading-relaxed">
                    {f.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Live Cashback Calculator Section */}
        <LiveCashbackCalculator customerRate={customerRate} taxRate={taxRate} />

        {/* How It Works Section */}
        <section
          id="how-it-works"
          className="pt-6 pb-12 md:pt-8 md:pb-16 bg-white relative overflow-hidden"
        >
          <div className="max-w-[1200px] mx-auto px-4 md:px-8">
            <div className="text-center mb-7 md:mb-9">
              <div className="inline-flex items-center justify-center gap-2 mb-3 bg-primary-50 px-4 py-1.5 rounded-full border border-primary-200/80">
                <IconBow className="w-4 h-4 text-accent-bow" />
                <span className="text-[12px] md:text-[13px] font-black text-primary-600 uppercase tracking-wide">
                  Hành trình đơn giản
                </span>
              </div>
              <h2 className="font-black text-[26px] sm:text-[32px] md:text-[46px] text-neutral-950 tracking-tight leading-tight">
                3 Bước Đơn Giản Nhận Hoàn Tiền 🎀
              </h2>
              <p className="text-neutral-700 text-[14px] md:text-[16.5px] font-semibold max-w-xl mx-auto mt-2">
                Nhận hoàn tiền tự động từ mọi đơn hàng Shopee chỉ với 3 bước dễ dàng.
              </p>
            </div>

            <HowItWorksSteps />
          </div>
        </section>

        {/* Interactive Value Comparison Table */}
        <ValueComparisonSection customerRate={customerRate} />

        {/* Quick Registration Banner */}
        <section className="py-10 md:py-16 bg-gradient-to-br from-primary-100 via-primary-50 to-secondary-50 relative">
          <div className="max-w-[1200px] mx-auto px-4 md:px-8">
            <div className="bg-white rounded-3xl p-6 sm:p-8 md:p-12 border border-primary-200/80 shadow-cute-lg flex flex-col md:grid md:grid-cols-12 gap-6 md:gap-8 items-center text-center md:text-left">
              <div className="md:col-span-8 space-y-3 md:space-y-4">
                <div className="inline-flex items-center gap-1.5 text-xs font-bold bg-primary-100 text-primary-600 px-3 py-1 rounded-full">
                  MeowBack — Hoàn Tiền Mua Sắm
                </div>
                <h2 className="text-[24px] sm:text-[30px] md:text-[40px] font-extrabold text-neutral-900 leading-tight">
                  Nhận hoàn tiền cho{" "}
                  <span className="text-primary-500">ví của bạn ngay hôm nay!</span>
                </h2>
                <p className="text-neutral-600 text-[14px] md:text-[16px]">
                  Tạo tài khoản miễn phí 100%, nhận tới {customerRate}% hoa hồng ròng trên mọi đơn hàng Shopee.
                </p>
                <div className="flex flex-wrap justify-center md:justify-start gap-3 pt-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-neutral-700 bg-primary-50 px-3.5 py-1.5 rounded-full border border-primary-100">
                    <ShieldCheck className="text-primary-500" size={15} />
                    Miễn phí trọn đời
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-neutral-700 bg-primary-50 px-3.5 py-1.5 rounded-full border border-primary-100">
                    <Wallet className="text-primary-500" size={15} />
                    Rút tiền chỉ từ 10K
                  </div>
                </div>
              </div>

              <div className="md:col-span-4 flex flex-col gap-3 w-full">
                <Link
                  href="/register"
                  className="w-full bg-gradient-to-r from-primary-400 to-primary-500 hover:scale-[1.02] text-white py-3.5 rounded-full font-extrabold text-[15px] md:text-[16px] text-center shadow-cute hover:shadow-cute-lg transition-all"
                >
                  Đăng ký tài khoản
                </Link>
                <Link
                  href="/login"
                  className="w-full bg-primary-50 hover:bg-primary-100 border border-primary-200 text-primary-600 py-3 rounded-full font-bold text-[14px] md:text-[15px] text-center transition-all"
                >
                  Tôi đã có tài khoản
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <MarketingFooter />
      <PublicFloatingSupport />

    </div>
  );
}
