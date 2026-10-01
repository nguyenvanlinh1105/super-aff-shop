import type { Metadata } from "next";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { PublicFloatingSupport } from "@/components/marketing/PublicFloatingSupport";
import { DemoConvertLink } from "@/components/marketing/DemoConvertLink";
import { Sparkles, ArrowRight } from "lucide-react";
import { GuideView } from "@/components/guide/GuideView";
import Link from "next/link";
import { safeJsonLdString } from "@/lib/jsonLd";

export const metadata: Metadata = {
  title: "Hướng Dẫn Sử Dụng | MeowBack — Hoàn Tiền Shopee, Lazada & TikTok Shop",
  description:
    "Cách sử dụng nền tảng hoàn tiền MeowBack: 5 bước đơn giản để mua sắm Shopee, Lazada, TikTok Shop và nhận hoàn tiền tự động về ví.",
  alternates: { canonical: "/huong-dan" },
  openGraph: {
    title: "Hướng Dẫn Sử Dụng | MeowBack — Hoàn Tiền Shopee, Lazada & TikTok Shop",
    description:
      "Cách sử dụng nền tảng hoàn tiền MeowBack: 5 bước đơn giản để mua sắm Shopee, Lazada, TikTok Shop và nhận hoàn tiền tự động về ví.",
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
      item: "https://meowback.shop/",
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "Hướng Dẫn",
      item: "https://meowback.shop/huong-dan",
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

      <main className="pt-20 sm:pt-24 max-w-[960px] mx-auto px-4 sm:px-6">
        {/* Full Guide with 5 Steps + 6 Important Tips (Synchronized 100% with /app/guide) */}
        <GuideView isPublic={true} />

        {/* Demo Link Converter Preview */}
        <section className="py-12 border-t border-primary-100/80 text-center">
          <div className="inline-flex items-center justify-center gap-2 mb-3 bg-primary-100/80 text-[#8A0B37] px-4 py-1.5 rounded-full border border-primary-200/80">
            <Sparkles size={14} className="text-primary-600" />
            <span className="font-extrabold text-[12.5px] uppercase tracking-widest">
              Thử nghiệm công cụ ngay
            </span>
          </div>
          <h2 className="text-[26px] sm:text-[34px] md:text-[40px] font-black text-neutral-950 mb-6">
            Thử Dán Link Sản Phẩm Ngay Bây Giờ 🚀
          </h2>
          <div className="max-w-2xl mx-auto">
            <DemoConvertLink />
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12">
          <div className="bg-gradient-to-r from-primary-400 via-[#FF3B7B] to-primary-500 rounded-3xl p-8 md:p-12 flex flex-col items-center text-center shadow-cute-lg relative overflow-hidden">
            <Sparkles className="absolute top-6 left-6 text-white/30 w-12 h-12" />
            <Sparkles className="absolute bottom-6 right-6 text-white/30 w-12 h-12" />

            <h2 className="text-[26px] sm:text-[32px] md:text-[42px] font-black text-white mb-3 relative z-10 leading-tight">
              Bắt đầu tích nơ tiền hoàn ngay hôm nay! 🎀
            </h2>
            <p className="text-white/95 text-[14.5px] sm:text-[16px] font-semibold max-w-xl mb-6 relative z-10">
              Tạo tài khoản miễn phí 100%, tự động nhận tới 80% hoa hồng trên mọi đơn mua Shopee, TikTok Shop & Lazada.
            </p>
            <Link
              href="/register"
              className="bg-white text-primary-600 font-black px-8 py-4 rounded-full flex items-center gap-2 hover:scale-105 hover:shadow-cute transition-all relative z-10 text-[15px] sm:text-[16px]"
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
