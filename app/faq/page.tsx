import type { Metadata } from "next";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { PublicFloatingSupport } from "@/components/marketing/PublicFloatingSupport";
import { FaqAccordion } from "@/components/marketing/FaqAccordion";
import { FAQ_ITEMS } from "@/lib/faqData";
import { safeJsonLdString } from "@/lib/jsonLd";
import { IconBow } from "@/components/icons/CatRibbonIcons";

export const metadata: Metadata = {
  title: "Câu Hỏi Thường Gặp (FAQ) | MeowBack",
  description: "Giải đáp các thắc mắc về nền tảng hoàn tiền MeowBack: rút tiền từ 10K, phí sử dụng 0đ, các sàn hỗ trợ.",
  alternates: { canonical: "/faq" },
  openGraph: {
    title: "Câu Hỏi Thường Gặp (FAQ) | MeowBack",
    description: "Giải đáp các thắc mắc về nền tảng hoàn tiền MeowBack: rút tiền từ 10K, phí sử dụng 0đ, các sàn hỗ trợ.",
    type: "website",
    locale: "vi_VN",
    url: "/faq",
    siteName: "MeowBack",
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_ITEMS.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: { "@type": "Answer", text: item.answer },
  })),
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Trang chủ", item: "https://meowback.shop/" },
    { "@type": "ListItem", position: 2, name: "FAQ", item: "https://meowback.shop/faq" },
  ],
};

export default function FaqPage() {
  return (
    <div className="min-h-screen bg-neutral-bg font-sans overflow-x-hidden text-neutral-900">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLdString(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLdString(breadcrumbJsonLd) }} />
      <MarketingHeader activePath="/faq" />

      <main className="pt-16">
        {/* Header Hero */}
        <section className="bg-gradient-to-b from-primary-100/70 via-primary-50 to-neutral-bg pt-10 pb-6 relative overflow-hidden">
          <div className="max-w-[1200px] mx-auto px-4 md:px-8 relative z-10 text-center">
            <div className="inline-flex items-center gap-2 bg-white px-4 py-1.5 rounded-full shadow-cute border border-primary-200 mb-3">
              <IconBow className="w-4 h-4 text-accent-bow" />
              <span className="text-[13px] font-extrabold text-primary-600">Giải đáp thắc mắc 🐾</span>
            </div>
            <h1 className="text-[36px] md:text-[50px] font-black text-neutral-950 tracking-tight mb-3 leading-tight">
              Câu Hỏi <span className="text-primary-500 underline decoration-primary-200 decoration-wavy">Thường Gặp 🎀</span>
            </h1>
            <p className="text-[16px] text-neutral-600 max-w-2xl mx-auto leading-relaxed font-semibold">
              Bạn có thắc mắc? MeowBack sẵn sàng hỗ trợ. Khám phá cách hệ thống hoạt động và tối ưu số tiền hoàn của bạn.
            </p>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="pt-6 pb-12 max-w-[1200px] mx-auto px-4 md:px-8">
          <FaqAccordion items={FAQ_ITEMS} />
        </section>
      </main>

      <MarketingFooter />
      <PublicFloatingSupport />
    </div>
  );
}

