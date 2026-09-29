import type { Metadata } from "next";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { ShopeeIcon, TiktokIcon } from "@/components/icons/PlatformIcons";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { safeJsonLdString } from "@/lib/jsonLd";

export const metadata: Metadata = {
  title: "Cửa Hàng — MeowBack | Nền Tảng Hỗ Trợ Hoàn Tiền",
  description: "Danh sách sàn thương mại điện tử được MeowBack hỗ trợ hoàn tiền: Shopee, TikTok Shop và nhiều đối tác khác.",
  alternates: { canonical: "/cua-hang" },
  openGraph: {
    title: "Cửa Hàng — MeowBack",
    description: "Danh sách sàn thương mại điện tử được MeowBack hỗ trợ hoàn tiền: Shopee, TikTok Shop và nhiều đối tác khác.",
    type: "website",
    locale: "vi_VN",
    url: "/cua-hang",
    siteName: "MeowBack",
  },
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Trang chủ", item: "https://meowback.shop/" },
    { "@type": "ListItem", position: 2, name: "Cửa Hàng", item: "https://meowback.shop/cua-hang" },
  ],
};

export default async function CuaHangPage() {
  const activeRule = await prisma.commissionRule.findFirst({
    where: { active: true },
    orderBy: { createdAt: "desc" },
  });
  const customerRate = Number(activeRule?.customerRate ?? 80);

  return (
    <div className="min-h-screen bg-canvas font-sans overflow-x-hidden text-ink">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLdString(breadcrumbJsonLd) }} />
      <MarketingHeader activePath="/cua-hang" />

      <main className="pt-[80px]">
        {/* Header Hero */}
        <section className="bg-gradient-to-b from-[#fff0e6] to-white py-3xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('/background.png')] bg-cover bg-center opacity-10 pointer-events-none" />
          <div className="max-w-[1200px] mx-auto px-lg relative z-10 text-center">
            <h1 className="text-[40px] md:text-[56px] font-black text-ink tracking-tight mb-md">
              Hệ thống <span className="text-primary">Cửa hàng</span>
            </h1>
            <p className="text-[18px] text-mute max-w-2xl mx-auto leading-relaxed">
              Mua sắm thả ga, nhận hoàn tiền tối đa từ những đối tác lớn nhất. Chúng tôi luôn mở rộng hệ thống để mang lại lợi ích tốt nhất cho bạn.
            </p>
          </div>
        </section>

        {/* Stores Grid */}
        <section className="py-3xl max-w-[1200px] mx-auto px-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2xl">
            
            {/* Shopee */}
            <div className="group relative bg-white rounded-[40px] p-2xl border border-primary/10 shadow-lg shadow-primary/5 hover:-translate-y-2 transition-all duration-300 flex flex-col justify-between overflow-hidden h-full">
              <div className="absolute -right-10 -top-10 w-[200px] h-[200px] bg-[#ee4d2d]/10 rounded-full blur-3xl group-hover:bg-[#ee4d2d]/20 transition-all pointer-events-none" />
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-white rounded-3xl shadow-sm border border-gray-100 flex items-center justify-center mb-xl">
                  <ShopeeIcon size={56} />
                </div>
                <h2 className="text-[28px] font-black text-ink mb-sm">Shopee</h2>
                <p className="text-mute text-[16px] leading-relaxed mb-xl">
                  Nhận hoàn tiền cực khủng khi mua sắm qua Shopee. Từ hàng thời trang, mỹ phẩm đến đồ điện tử, mọi đơn hàng đều được đối soát và hoàn tiền minh bạch.
                </p>
                <div className="flex flex-col gap-sm w-full max-w-[200px]">
                  <div className="bg-canvas-soft text-ink font-bold py-2 px-4 rounded-xl border border-gray-100 flex justify-between items-center">
                    <span>Hoàn tiền tối đa</span>
                    <span className="text-[#ee4d2d]">{customerRate}%</span>
                  </div>
                  <div className="bg-canvas-soft text-ink font-bold py-2 px-4 rounded-xl border border-gray-100 flex justify-between items-center">
                    <span>Thời gian duyệt</span>
                    <span>15-30 ngày</span>
                  </div>
                </div>
              </div>
            </div>

            {/* TikTok Shop */}
            <div className="group relative bg-white rounded-[40px] p-2xl border border-primary/10 shadow-lg shadow-primary/5 hover:-translate-y-2 transition-all duration-300 flex flex-col justify-between overflow-hidden h-full">
              <div className="absolute -left-10 -top-10 w-[200px] h-[200px] bg-[#000000]/5 rounded-full blur-3xl group-hover:bg-[#000000]/10 transition-all pointer-events-none" />
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-white rounded-3xl shadow-sm border border-gray-100 flex items-center justify-center mb-xl text-black">
                  <TiktokIcon size={56} />
                </div>
                <h2 className="text-[28px] font-black text-ink mb-sm">TikTok Shop</h2>
                <p className="text-mute text-[16px] leading-relaxed mb-xl">
                  Bắt kịp xu hướng và tận hưởng niềm vui mua sắm giải trí trên TikTok Shop, kèm theo mức hoa hồng affiliate vô cùng hấp dẫn chuyển thẳng vào ví của bạn.
                </p>
                <div className="flex flex-col gap-sm w-full max-w-[200px]">
                  <div className="bg-canvas-soft text-ink font-bold py-2 px-4 rounded-xl border border-gray-100 flex justify-between items-center">
                    <span>Hoàn tiền tối đa</span>
                    <span className="text-primary">{customerRate}%</span>
                  </div>
                  <div className="bg-canvas-soft text-ink font-bold py-2 px-4 rounded-xl border border-gray-100 flex justify-between items-center">
                    <span>Thời gian duyệt</span>
                    <span>15-30 ngày</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-canvas pb-3xl pt-xl max-w-[1200px] mx-auto px-lg">
          <div className="bg-gradient-to-r from-primary to-primary-active rounded-[32px] p-3xl flex flex-col items-center text-center shadow-2xl shadow-primary/20 relative overflow-hidden">
            <Sparkles className="absolute top-10 left-10 text-white/30 w-16 h-16" />
            <Sparkles className="absolute bottom-10 right-10 text-white/30 w-16 h-16" />
            
            <h2 className="text-[32px] font-black text-white mb-md relative z-10">Bạn đã sẵn sàng để tiết kiệm?</h2>
            <p className="text-white/90 text-[16px] mb-xl max-w-xl relative z-10">
              Đăng ký ngay tài khoản để bắt đầu lấy link sản phẩm từ các cửa hàng trên và nhận lại tiền mặt cho mỗi đơn mua hàng thành công.
            </p>
            <Link href="/register" className="bg-white text-primary font-black px-2xl py-lg rounded-2xl flex items-center gap-sm hover:scale-105 hover:shadow-xl transition-all relative z-10">
              Bắt đầu nhận hoàn tiền <ArrowRight size={20} />
            </Link>
          </div>
        </section>

      </main>

      <MarketingFooter />
    </div>
  );
}
