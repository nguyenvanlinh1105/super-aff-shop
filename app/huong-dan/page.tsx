import type { Metadata } from "next";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { PublicFloatingSupport } from "@/components/marketing/PublicFloatingSupport";
import { DemoConvertLink } from "@/components/marketing/DemoConvertLink";
import { Sparkles, ArrowRight } from "lucide-react";
import { HowItWorksSteps } from "@/components/marketing/HowItWorksSteps";
import Link from "next/link";
import { safeJsonLdString } from "@/lib/jsonLd";
import { IconBow } from "@/components/icons/CatRibbonIcons";

export const metadata: Metadata = {
  title: "Hướng Dẫn Sử Dụng | MeowBack — Hoàn Tiền Shopee, Lazada & TikTok Shop",
  description:
    "Cách sử dụng nền tảng hoàn tiền MeowBack: 3 bước đơn giản để mua sắm Shopee, Lazada, TikTok Shop và nhận hoàn tiền tự động.",
  alternates: { canonical: "/huong-dan" },
  openGraph: {
    title: "Hướng Dẫn Sử Dụng | MeowBack — Hoàn Tiền Shopee, Lazada & TikTok Shop",
    description:
      "Cách sử dụng nền tảng hoàn tiền MeowBack: 3 bước đơn giản để mua sắm Shopee, Lazada, TikTok Shop và nhận hoàn tiền tự động.",
    type: "website",
    locale: "vi_VN",
    url: "/huong-dan",
    siteName: "MeowBack",
  },
};



const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Trang chủ",
      item: "https://meowback.vn/",
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "Hướng Dẫn",
      item: "https://meowback.vn/huong-dan",
    },
  ],
};

export default function HuongDanPage() {
  return (
    <div className="min-h-screen bg-neutral-bg font-sans overflow-x-hidden text-neutral-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLdString(breadcrumbJsonLd) }}
      />
      <MarketingHeader activePath="/huong-dan" />

      <main className="pt-16">
        {/* Header Hero */}
        <section className="bg-gradient-to-b from-primary-100/70 via-primary-50 to-white pt-10 pb-6 relative overflow-hidden">
          <div className="max-w-[1200px] mx-auto px-4 md:px-8 relative z-10 text-center">
            <div className="inline-flex items-center gap-2 bg-white px-4 py-1.5 rounded-full shadow-cute border border-primary-200 mb-3">
              <IconBow className="w-4 h-4 text-accent-bow" />
              <span className="text-[13px] font-black text-primary-600 uppercase tracking-wide">
                Dễ như mèo vờn cuộn len 🧶
              </span>
            </div>
            <h1 className="text-[36px] md:text-[50px] font-black text-neutral-950 tracking-tight mb-3 leading-tight">
              Hướng dẫn{" "}
              <span className="text-primary-600 underline decoration-primary-300 decoration-wavy decoration-2">
                Sử Dụng MeowBack 🐾
              </span>
            </h1>
            <p className="text-[16px] text-neutral-700 max-w-2xl mx-auto leading-relaxed font-semibold">
              Chỉ với 3 bước cực kỳ đơn giản, bạn đã có thể bắt đầu tích luỹ hoa
              hồng cho mỗi đơn mua sắm trực tuyến.
            </p>
          </div>
        </section>

        {/* Steps Grid */}
        <section className="pt-6 pb-12 max-w-[1200px] mx-auto px-4 md:px-8">
          <HowItWorksSteps />
        </section>

        {/* Demo Link Converter Preview */}
        <section className="py-12 bg-gradient-to-b from-white to-primary-50/40 border-t border-primary-100/80">
          <div className="max-w-[1200px] mx-auto px-4 md:px-8 text-center">
            <div className="inline-flex items-center justify-center gap-2 mb-3 bg-primary-100/80 text-[#8A0B37] px-4 py-1.5 rounded-full border border-primary-200/80">
              <Sparkles size={14} className="text-primary-600" />
              <span className="font-extrabold text-[12.5px] uppercase tracking-widest">
                Thử nghiệm công cụ ngay
              </span>
            </div>
            <h2 className="text-[30px] md:text-[40px] font-black text-neutral-950 mb-8">
              Thử Dán Link Sản Phẩm Ngay Bây Giờ 🚀
            </h2>
            <div className="max-w-2xl mx-auto">
              <DemoConvertLink />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 max-w-[1200px] mx-auto px-4 md:px-8">
          <div className="bg-gradient-to-r from-primary-400 via-[#FF3B7B] to-primary-500 rounded-3xl p-8 md:p-12 flex flex-col items-center text-center shadow-cute-lg relative overflow-hidden">
            <Sparkles className="absolute top-6 left-6 text-white/30 w-12 h-12" />
            <Sparkles className="absolute bottom-6 right-6 text-white/30 w-12 h-12" />

            <h2 className="text-[30px] md:text-[42px] font-black text-white mb-4 relative z-10 leading-tight">
              Bắt đầu tích nơ tiền hoàn ngay hôm nay! 🎀
            </h2>
            <p className="text-white/95 text-[16px] font-semibold max-w-xl mb-6 relative z-10">
              Tạo tài khoản miễn phí 100%, tự động nhận tới 80% hoa hồng trên mọi đơn mua Shopee.
            </p>
            <Link
              href="/register"
              className="bg-white text-primary-600 font-black px-8 py-4 rounded-full flex items-center gap-2 hover:scale-105 hover:shadow-cute transition-all relative z-10 text-[16px]"
            >
              Tạo tài khoản & lấy link ngay 🐱 <ArrowRight size={18} />
            </Link>
          </div>
        </section>
      </main>

      <MarketingFooter />
      <PublicFloatingSupport />
    </div>
  );
}

