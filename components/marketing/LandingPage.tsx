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
import { ShopeeIcon, TiktokIcon } from "@/components/icons/PlatformIcons";
import {
  LogoMeowBack,
  IconBow,
  IllustCatSuccess,
} from "@/components/icons/CatRibbonIcons";
import { FaqAccordion } from "@/components/marketing/FaqAccordion";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { PublicFloatingSupport } from "@/components/marketing/PublicFloatingSupport";
import { SocialProofSection } from "@/components/marketing/SocialProofSection";
import { DemoConvertLink } from "@/components/marketing/DemoConvertLink";

import { HeroGallerySlider } from "@/components/marketing/HeroGallerySlider";
import { LiveCashbackCalculator } from "@/components/marketing/LiveCashbackCalculator";
import { LiveActivityTicker } from "@/components/marketing/LiveActivityTicker";
import { HotDealsSection } from "@/components/marketing/HotDealsSection";
import { ValueComparisonSection } from "@/components/marketing/ValueComparisonSection";

const CAT_HIGHLIGHT_CARDS = [
  {
    icon: Zap,
    title: "Tạo link tức thì",
    description:
      "Dán link Shopee & TikTok Shop, nhận link hoàn tiền chỉ trong 1 giây.",
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
      "Chia sẻ link giới thiệu MeowBack cho bạn bè, nhận thưởng 5% trọn đời.",
    badge: "🎁 Trọn Đời",
    gradient: "from-emerald-400 to-teal-500 text-white",
    cardBg:
      "bg-gradient-to-b from-emerald-50/70 via-white to-emerald-50/30 border-emerald-200/90 hover:border-emerald-400/80",
    badgeBg: "bg-emerald-100/90 text-emerald-800 border-emerald-200/80",
  },
];

const STEPS = [
  {
    icon: UserPlus,
    stepNum: "01",
    title: "1. Đăng ký tài khoản",
    description:
      "Tạo tài khoản MeowBack miễn phí chưa tới 30 giây, không đòi hỏi thẻ thanh toán.",
    badge: "🔑 Miễn phí 100%",
    gradient: "from-primary-500 via-[#FF3B7B] to-primary-600",
  },
  {
    icon: Wand2,
    stepNum: "02",
    title: "2. Dán link sản phẩm",
    description:
      "Copy link Shopee hoặc TikTok Shop bạn muốn mua, dán vào MeowBack để lấy link hoàn tiền.",
    badge: "🪄 Tự động 1 Giây",
    gradient: "from-sky-500 via-blue-500 to-indigo-600",
  },
  {
    icon: ShoppingBag,
    stepNum: "03",
    title: "3. Mua sắm & Nhận tiền",
    description:
      "Bấm vào link hoàn tiền và chốt đơn — tiền hoàn tự động tích lũy thẳng vào ví MeowBack.",
    badge: "💰 Tích lũy về ví",
    gradient: "from-emerald-500 via-teal-500 to-green-600",
  },
];

export function LandingPage({
  totalPaidOut,
  totalCustomers,
}: {
  totalPaidOut: number;
  totalCustomers: number;
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

          <div className="relative z-10 max-w-[1200px] mx-auto px-4 md:px-8 py-12 md:py-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              <div className="space-y-6 fade-in">
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-100 to-primary-200 text-[#8A0B37] px-4 py-1.5 rounded-full shadow-sm border border-primary-300/60">
                  <IconBow className="w-4 h-4 text-accent-bow" />
                  <span className="text-[13.5px] font-black tracking-wide">
                    Hoàn tới 80% hoa hồng + 5% giới thiệu 🎀
                  </span>
                </div>

                <h1 className="text-[38px] md:text-[54px] font-black leading-tight text-neutral-950 tracking-tight">
                  Hoàn tiền tự động <br className="hidden sm:inline" />
                  <span className="text-primary-600 underline decoration-primary-300 decoration-wavy decoration-2">
                    khi mua sắm Shopee
                  </span>
                </h1>

                <p className="text-[17.5px] text-neutral-800 max-w-lg leading-relaxed font-semibold">
                  Mua sắm{" "}
                  <strong className="text-primary-600 font-extrabold">
                    Shopee & TikTok Shop
                  </strong>{" "}
                  thông minh hơn với MeowBack. Tự động nhận hoàn tiền từng đơn,
                  rút về ví dễ dàng từ{" "}
                  <strong className="text-neutral-950 font-black">
                    10.000đ
                  </strong>
                  .
                </p>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Link
                    href="/login"
                    className="bg-gradient-to-r from-primary-500 via-[#FF3B7B] to-primary-600 hover:scale-[1.02] active:scale-95 text-white px-8 py-3.5 rounded-full font-extrabold text-[16.5px] flex items-center justify-center gap-2 transition-all shadow-cute hover:shadow-cute-lg"
                  >
                    Bắt đầu hoàn tiền ngay
                    <ArrowRight size={18} />
                  </Link>
                  <a
                    href="#how-it-works"
                    className="bg-white hover:bg-primary-50 text-neutral-950 hover:text-primary-600 px-7 py-3.5 rounded-full font-extrabold text-[16px] flex items-center justify-center gap-2 transition-all border-2 border-primary-200/90 shadow-sm"
                  >
                    Cách hoạt động
                  </a>
                </div>

                {/* Demo Link Converter Input Component */}
                <div className="pt-4">
                  <DemoConvertLink />
                </div>
              </div>

              {/* Animated Background Hero Gallery Slider */}
              <div className="flex justify-center items-center">
                <HeroGallerySlider />
              </div>
            </div>
          </div>
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
        <LiveCashbackCalculator />

        {/* Featured Platform Stores Detailed Section */}
        <section
          id="cua-hang"
          className="py-20 bg-gradient-to-b from-white via-primary-50/40 to-white border-b border-primary-100/80 relative overflow-hidden"
        >
          <div className="max-w-[1200px] mx-auto px-4 md:px-8">
            {/* Section Header */}
            <div className="text-center mb-14">
              <div className="inline-flex items-center justify-center gap-2 mb-3 bg-primary-100/80 text-[#8A0B37] px-4 py-1.5 rounded-full border border-primary-200/80">
                <Sparkles size={14} className="text-primary-600" />
                <span className="font-extrabold text-[12.5px] uppercase tracking-widest">
                  Siêu Sàn Hợp Tác Hoàn Tiền
                </span>
              </div>
              <h2 className="text-[32px] md:text-[44px] font-black text-neutral-950 tracking-tight leading-tight">
                Mua sắm thả ga — Hoàn tiền tối đa 80% 🛍️
              </h2>
              <p className="text-neutral-700 text-[16.5px] font-semibold max-w-2xl mx-auto mt-2">
                Nhận hoa hồng tự động từ mọi đơn hàng mua qua Shopee & TikTok
                Shop. Đối soát minh bạch, rút tiền liền tay.
              </p>
            </div>

            {/* 2 Detailed Store Cards */}
            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {/* Shopee Detailed Card */}
              <div className="group relative flex flex-col justify-between rounded-3xl bg-white border-2 border-orange-200 shadow-cute hover:shadow-cute-lg hover:-translate-y-1.5 transition-all duration-300 overflow-hidden">
                {/* Card Header Banner */}
                <div className="bg-gradient-to-r from-[#FF5722] via-[#EE4D2D] to-[#FF7043] p-6 text-white relative">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center p-2 shadow-cute shrink-0">
                        <ShopeeIcon size={36} />
                      </div>
                      <div>
                        <h3 className="text-[24px] font-black tracking-tight leading-none">
                          Shopee
                        </h3>
                        <span className="text-[12px] font-bold text-orange-100 mt-1 inline-block">
                          Sàn TMĐT Hàng Đầu VN
                        </span>
                      </div>
                    </div>
                    <span className="bg-white text-[#EE4D2D] font-black text-[13px] px-3.5 py-1.5 rounded-full shadow-sm">
                      Hoàn tới 80% ⚡
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-7 space-y-6 flex-1 flex flex-col justify-between">
                  <p className="text-neutral-700 text-[14.5px] font-semibold leading-relaxed">
                    Nhận hoàn tiền cực khủng khi mua sắm hàng thời trang, mỹ
                    phẩm, điện tử đến đồ gia dụng trên Shopee. Tự động gắn mã
                    hoàn tiền chỉ trong 1 giây.
                  </p>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-4 bg-orange-50/60 p-4 rounded-2xl border border-orange-100">
                    <div className="text-center">
                      <span className="text-[11px] font-bold text-neutral-500 uppercase block mb-0.5">
                        Mức hoàn tiền
                      </span>
                      <span className="text-[18px] font-black text-[#EE4D2D]">
                        Tối đa 80%
                      </span>
                    </div>
                    <div className="text-center border-l border-orange-200/80">
                      <span className="text-[11px] font-bold text-neutral-500 uppercase block mb-0.5">
                        Thời gian đối soát
                      </span>
                      <span className="text-[18px] font-black text-neutral-900">
                        15 – 30 Ngày
                      </span>
                    </div>
                  </div>

                  {/* Features Check List */}
                  <ul className="space-y-2.5 text-[13.5px] font-bold text-neutral-800">
                    <li className="flex items-center gap-2">
                      <span className="text-orange-500">✓</span> Tự động ghi
                      nhận đơn mua Shopee
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-orange-500">✓</span> Rút tiền từ
                      10.000đ về ngân hàng
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-orange-500">✓</span> Hỗ trợ đối soát
                      và khiếu nại 24/7
                    </li>
                  </ul>

                  {/* Action CTA */}
                  <a
                    href="#demo-convert"
                    className="block text-center w-full bg-gradient-to-r from-[#FF5722] to-[#EE4D2D] hover:from-[#EE4D2D] hover:to-[#FF5722] text-white font-extrabold py-3.5 rounded-2xl shadow-cute hover:shadow-cute-lg transition-all duration-200 text-[15px]"
                  >
                    Dán Link Shopee Nhận Hoàn Tiền ⚡
                  </a>
                </div>
              </div>

              {/* TikTok Shop Detailed Card */}
              <div className="group relative flex flex-col justify-between rounded-3xl bg-white border-2 border-neutral-300 shadow-cute hover:shadow-cute-lg hover:-translate-y-1.5 transition-all duration-300 overflow-hidden">
                {/* Card Header Banner */}
                <div className="bg-gradient-to-r from-[#1E1B1D] via-[#000000] to-[#2D282A] p-6 text-white relative">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center p-2 shadow-cute shrink-0">
                        <TiktokIcon size={32} />
                      </div>
                      <div>
                        <h3 className="text-[24px] font-black tracking-tight leading-none">
                          TikTok Shop
                        </h3>
                        <span className="text-[12px] font-bold text-neutral-300 mt-1 inline-block">
                          Sắm đồ Video & Livestream
                        </span>
                      </div>
                    </div>
                    <span className="bg-white text-neutral-950 font-black text-[13px] px-3.5 py-1.5 rounded-full shadow-sm">
                      Hoàn tới 80% 🔥
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-7 space-y-6 flex-1 flex flex-col justify-between">
                  <p className="text-neutral-700 text-[14.5px] font-semibold leading-relaxed">
                    Bắt kịp xu hướng mua sắm giải trí trên TikTok Shop. Nhận
                    ngay hoa hồng hoàn tiền cực kỳ hấp dẫn tích lũy tự động trực
                    tiếp vào ví MeowBack của bạn.
                  </p>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-4 bg-neutral-100/70 p-4 rounded-2xl border border-neutral-200">
                    <div className="text-center">
                      <span className="text-[11px] font-bold text-neutral-500 uppercase block mb-0.5">
                        Mức hoàn tiền
                      </span>
                      <span className="text-[18px] font-black text-neutral-950">
                        Tối đa 80%
                      </span>
                    </div>
                    <div className="text-center border-l border-neutral-300/80">
                      <span className="text-[11px] font-bold text-neutral-500 uppercase block mb-0.5">
                        Thời gian đối soát
                      </span>
                      <span className="text-[18px] font-black text-neutral-900">
                        15 – 30 Ngày
                      </span>
                    </div>
                  </div>

                  {/* Features Check List */}
                  <ul className="space-y-2.5 text-[13.5px] font-bold text-neutral-800">
                    <li className="flex items-center gap-2">
                      <span className="text-neutral-900">✓</span> Ghi nhận đơn
                      TikTok Shop siêu tốc
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-neutral-900">✓</span> Tích lũy tiền
                      hoàn không giới hạn
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-neutral-900">✓</span> 0đ Phí rút
                      tiền về tài khoản ngân hàng
                    </li>
                  </ul>

                  {/* Action CTA */}
                  <a
                    href="#demo-convert"
                    className="block text-center w-full bg-gradient-to-r from-[#111111] via-[#222222] to-[#333333] hover:from-[#222222] hover:to-[#111111] text-white font-extrabold py-3.5 rounded-2xl shadow-cute hover:shadow-cute-lg transition-all duration-200 text-[15px]"
                  >
                    Dán Link TikTok Shop Nhận Hoàn Tiền 🔥
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section
          id="how-it-works"
          className="py-20 bg-white relative overflow-hidden"
        >
          <div className="max-w-[1200px] mx-auto px-4 md:px-8">
            <div className="text-center mb-16">
              <div className="inline-flex items-center justify-center gap-2 mb-3 bg-primary-50 px-4 py-1.5 rounded-full border border-primary-200/80">
                <IconBow className="w-4 h-4 text-accent-bow" />
                <span className="text-[13px] font-black text-primary-600 uppercase tracking-wide">
                  Hành trình đơn giản
                </span>
              </div>
              <h2 className="font-black text-[32px] md:text-[46px] text-neutral-950 tracking-tight leading-tight">
                3 Bước Đơn Giản Nhận Hoàn Tiền 🎀
              </h2>
              <p className="text-neutral-700 text-[16.5px] font-semibold max-w-xl mx-auto mt-2">
                Nhận hoàn tiền tự động từ mọi đơn hàng Shopee & TikTok Shop chỉ
                với 3 bước dễ dàng.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              {STEPS.map((step, index) => {
                const StepIcon = step.icon;
                return (
                  <div
                    key={index}
                    className="group relative flex flex-col justify-between p-7 bg-gradient-to-b from-primary-50/60 via-white to-primary-50/20 border-2 border-primary-200/90 rounded-3xl hover:border-primary-400 hover:shadow-cute-lg hover:-translate-y-2 transition-all duration-300 overflow-hidden"
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
          </div>
        </section>

        {/* Interactive Value Comparison Table */}
        <ValueComparisonSection />

        {/* Hot Deals High Cashback Section */}
        <HotDealsSection />

        {/* Social Proof Real Stats */}
        <SocialProofSection
          totalPaidOut={totalPaidOut}
          totalCustomers={totalCustomers}
        />

        {/* Quick Registration Banner */}
        <section className="py-16 bg-gradient-to-br from-primary-100 via-primary-50 to-secondary-50 relative">
          <div className="max-w-[1200px] mx-auto px-4 md:px-8">
            <div className="bg-white rounded-3xl p-8 md:p-12 border border-primary-200/80 shadow-cute-lg grid md:grid-cols-12 gap-8 items-center">
              <div className="md:col-span-8 space-y-4">
                <div className="inline-flex items-center gap-1.5 text-xs font-bold bg-primary-100 text-primary-600 px-3 py-1 rounded-full">
                  MeowBack — Hoàn Tiền Mua Sắm
                </div>
                <h2 className="text-[30px] md:text-[40px] font-extrabold text-neutral-900 leading-tight">
                  Nhận hoàn tiền cho{" "}
                  <span className="text-primary-500">
                    ví của bạn ngay hôm nay!
                  </span>
                </h2>
                <p className="text-neutral-600 text-[16px]">
                  Tạo tài khoản miễn phí 100%, tự động nhận tới 80% hoa hồng
                  trên mọi đơn hàng Shopee & TikTok Shop.
                </p>
                <div className="flex flex-wrap gap-4 pt-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-neutral-700 bg-primary-50 px-3.5 py-1.5 rounded-full border border-primary-100">
                    <ShieldCheck className="text-primary-500" size={16} />
                    Miễn phí trọn đời
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-neutral-700 bg-primary-50 px-3.5 py-1.5 rounded-full border border-primary-100">
                    <Wallet className="text-primary-500" size={16} />
                    Rút tiền chỉ từ 10K
                  </div>
                </div>
              </div>

              <div className="md:col-span-4 flex flex-col gap-3">
                <Link
                  href="/register"
                  className="w-full bg-gradient-to-r from-primary-400 to-primary-500 hover:scale-[1.02] text-white py-3.5 rounded-full font-extrabold text-[16px] text-center shadow-cute hover:shadow-cute-lg transition-all"
                >
                  Đăng ký tài khoản
                </Link>
                <Link
                  href="/login"
                  className="w-full bg-primary-50 hover:bg-primary-100 border border-primary-200 text-primary-600 py-3 rounded-full font-bold text-[15px] text-center transition-all"
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
      <LiveActivityTicker />
    </div>
  );
}
