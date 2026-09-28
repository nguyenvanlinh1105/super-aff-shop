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
import { ShopeeIcon, LazadaIcon, TiktokIcon } from "@/components/icons/PlatformIcons";
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

import { HowItWorksSteps } from "@/components/marketing/HowItWorksSteps";
import { LiveCashbackCalculator } from "@/components/marketing/LiveCashbackCalculator";
import { ValueComparisonSection } from "@/components/marketing/ValueComparisonSection";
import { ShopeeLiveDemo } from "@/components/ui/ShopeeLiveDemo";

const CAT_HIGHLIGHT_CARDS = [
  {
    icon: Zap,
    title: "Tạo link tức thì",
    description:
      "Dán link Shopee, Lazada hoặc TikTok Shop, nhận link hoàn tiền chỉ trong 1 giây.",
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
        <section className="relative overflow-hidden bg-gradient-to-b from-[#FFF0F5] via-[#FFF7FA] to-white pt-4 sm:pt-8 md:pt-12 pb-10 sm:pb-16 md:pb-20">
          {/* Desktop 3D Canvas Background (Cat on left, bags on right, center open) */}
          <div
            className="hidden md:block absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none opacity-95 transition-opacity"
            style={{ backgroundImage: "url('/hero_banner_desktop.jpg')" }}
          />

          {/* Mobile 3D Artwork Top Backdrop */}
          <div
            className="block md:hidden absolute top-0 left-0 right-0 h-[280px] bg-cover bg-top bg-no-repeat pointer-events-none opacity-50"
            style={{
              backgroundImage: "url('/hero_banner_mobile.jpg')",
              maskImage: "linear-gradient(to bottom, rgba(0,0,0,1) 45%, rgba(0,0,0,0) 100%)",
              WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,1) 45%, rgba(0,0,0,0) 100%)",
            }}
          />

          {/* Center radiant spotlight aura */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[720px] h-[450px] bg-gradient-to-b from-white/80 via-white/50 to-transparent rounded-full blur-[70px] pointer-events-none" />

          <div className="relative z-10 max-w-[1200px] mx-auto px-3.5 sm:px-6 md:px-8 text-center">
            <div className="max-w-[760px] mx-auto space-y-2.5 sm:space-y-4 fade-in">
              {/* Cute Badge on Mobile */}
              <div className="md:hidden inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 border border-primary-200/80 shadow-xs backdrop-blur-md mx-auto mb-0.5">
                <span className="text-xs">🎀</span>
                <span className="text-[11px] font-black text-primary-700 whitespace-nowrap">
                  MeowBack • Hoàn tiền đa sàn
                </span>
              </div>

              {/* Main Hero Headline — Engineered for ZERO orphan words */}
              <h1 className="text-[25px] xs:text-[28px] sm:text-[38px] md:text-[46px] lg:text-[50px] font-black leading-[1.22] text-neutral-900 tracking-tight">
                <span className="block sm:inline whitespace-nowrap drop-shadow-xs">Mua sắm đa sàn,</span>{" "}
                <span className="block sm:inline whitespace-nowrap text-transparent bg-clip-text bg-gradient-to-r from-[#EE4D2D] via-[#FF3B7B] to-[#0F146D] animate-text-shimmer drop-shadow-xs">
                  hoàn tiền tới {customerRate}% 🎀
                </span>
              </h1>

              {/* Subtitle with guaranteed balanced lines */}
              <p className="text-[13px] sm:text-[15.5px] text-neutral-600 font-semibold leading-relaxed px-1">
                <span className="block sm:inline whitespace-nowrap">Dán link Shopee, Lazada hoặc TikTok Shop</span>{" "}
                <span className="block sm:inline whitespace-nowrap">— Nhận hoàn tiền tự động về ví!</span>
              </p>

              {/* Platform & Benefit Badges */}
              <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 pt-0.5">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1 rounded-full text-[11px] sm:text-[12px] font-black bg-white/95 text-[#EE4D2D] border border-[#EE4D2D]/30 shadow-xs whitespace-nowrap backdrop-blur-xs">
                  <ShopeeIcon size={13} /> Shopee
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1 rounded-full text-[11px] sm:text-[12px] font-black bg-white/95 text-[#0F146D] border border-[#0F146D]/30 shadow-xs whitespace-nowrap backdrop-blur-xs">
                  <LazadaIcon size={13} /> Lazada
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1 rounded-full text-[11px] sm:text-[12px] font-black bg-white/95 text-neutral-900 border border-neutral-300 shadow-xs whitespace-nowrap backdrop-blur-xs">
                  <TiktokIcon size={13} /> TikTok Shop
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1 rounded-full text-[11px] sm:text-[12px] font-black bg-emerald-50/95 text-emerald-700 border border-emerald-300 shadow-xs whitespace-nowrap backdrop-blur-xs">
                  ⚡ Rút từ 10.000đ
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1 rounded-full text-[11px] sm:text-[12px] font-black bg-amber-50/95 text-amber-700 border border-amber-300 shadow-xs whitespace-nowrap backdrop-blur-xs">
                  ✨ Miễn phí 100%
                </span>
              </div>

              {/* The Core Hero Feature: Demo Link Converter Box */}
              <div className="pt-1 sm:pt-2">
                <DemoConvertLink />
              </div>
            </div>
          </div>
        </section>

        {/* Shopee Live Demo Interactive Section */}
        <section className="py-12 border-b border-primary-100/50 bg-gradient-to-b from-white/50 to-neutral-50/80 backdrop-blur-md overflow-hidden relative">
          <div className="max-w-[1200px] mx-auto px-4 text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-black text-neutral-900 mb-3">
              Chỉ 1 giây để lấy link hoàn tiền Shopee, Lazada &amp; TikTok Shop
            </h2>
            <p className="text-neutral-600 font-semibold max-w-2xl mx-auto">
              Không cần tải app phức tạp. Chỉ cần copy link từ Shopee, Lazada hoặc TikTok Shop, dán vào MeowBack, và hệ thống sẽ lo phần còn lại.
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
                Nhận hoàn tiền tự động từ mọi đơn hàng Shopee, Lazada &amp; TikTok Shop chỉ với 3 bước dễ dàng.
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
                  Tạo tài khoản miễn phí 100%, nhận tới {customerRate}% hoa hồng ròng trên mọi đơn hàng Shopee, Lazada &amp; TikTok Shop.
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
