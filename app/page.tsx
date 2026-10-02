import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { LandingPage } from "@/components/marketing/LandingPage";
import { safeJsonLdString } from "@/lib/jsonLd";

export const metadata: Metadata = {
  title: "MeowBack — Hoàn Tiền Mua Sắm Shopee, Lazada & TikTok Shop",
  description:
    "Dán link Shopee, Lazada hoặc TikTok Shop, nhận link hoàn tiền tự động vào ví MeowBack. Rút tiền từ 10.000đ, miễn phí hoàn toàn.",
  alternates: { canonical: "/" },
  keywords: [
    "MeowBack",
    "meowback",
    "meowback shop",
    "meowback.shop",
    "hoàn tiền meowback",
    "hoàn tiền shopee",
    "hoàn tiền lazada",
    "hoàn tiền tiktok shop",
  ],
  openGraph: {
    title: "MeowBack — Hoàn Tiền Mua Sắm Shopee, Lazada & TikTok Shop",
    description:
      "Nền tảng hoàn tiền affiliate uy tín cho Shopee, Lazada và TikTok Shop. Nhận lại tới 80% hoa hồng, rút tiền từ 10.000đ.",
    type: "website",
    locale: "vi_VN",
    url: "/",
    siteName: "MeowBack",
    images: [
      {
        url: "/meowback_lucky_cat_logo.png",
        width: 1536,
        height: 1024,
        alt: "MeowBack - Hoàn Tiền Affiliate Shopee, Lazada & TikTok Shop",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MeowBack — Hoàn Tiền Mua Sắm Shopee, Lazada & TikTok Shop",
    description:
      "Nền tảng hoàn tiền affiliate uy tín cho Shopee, Lazada và TikTok Shop. Nhận lại tới 80% hoa hồng, rút tiền từ 10.000đ.",
    images: ["/meowback_lucky_cat_logo.png"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://meowback.shop/#website",
      url: "https://meowback.shop",
      name: "MeowBack",
      description:
        "Nền tảng affiliate hoàn tiền cho Shopee, Lazada và TikTok Shop tại Việt Nam.",
      inLanguage: "vi-VN",
    },
    {
      "@type": "Organization",
      "@id": "https://meowback.shop/#organization",
      name: "MeowBack",
      url: "https://meowback.shop",
      logo: "https://meowback.shop/meowback_lucky_cat_logo.png",
      telephone: "+84965965439",
      contactPoint: {
        "@type": "ContactPoint",
        telephone: "+84965965439",
        contactType: "customer service",
        areaServed: "VN",
        availableLanguage: "Vietnamese",
      },
      sameAs: [
        "https://www.facebook.com/share/1BShYKizDV/?mibextid=wwXIfr",
        "https://www.tiktok.com/@vi_ha790?_r=1&_t=ZS-983XgTM1aum",
        "https://www.instagram.com/imviihaaa?igsh=M2RqZml1NHpzbmgx&utm_source=qr",
        "https://youtube.com/@hoanphihoahongaff?si=aNywoErGCAi7BGxV",
      ],
    },

    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "Hệ thống hoạt động như thế nào?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Khi bạn mua hàng qua link hoàn tiền của hệ thống, sàn thương mại điện tử sẽ trả một khoản hoa hồng affiliate. Chúng tôi chia lại phần lớn khoản này cho bạn dưới dạng tiền hoàn vào ví.",
          },
        },
        {
          "@type": "Question",
          name: "Rút tiền tối thiểu bao nhiêu?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Mức rút tối thiểu là 10.000đ. Bạn có thể nhận về tài khoản ngân hàng sau khi đơn hàng được duyệt.",
          },
        },
        {
          "@type": "Question",
          name: "Có mất phí sử dụng không?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Hoàn toàn miễn phí — không thu phí đăng ký, tạo link hay rút tiền.",
          },
        },
        {
          "@type": "Question",
          name: "Hệ thống hỗ trợ những sàn nào?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Hiện tại hỗ trợ Shopee và TikTok Shop. Các sàn khác sẽ được bổ sung trong thời gian tới.",
          },
        },
      ],
    },
  ],
};

export default async function RootPage() {
  const session = await getSession();

  if (session) {
    redirect(session.role === "admin" ? "/admin" : "/app");
  }

  // Social proof thật trên trang chủ — dùng orderStatus: "approved" (tiền
  // đã về ví khách, hiển thị "💰 Tiền đã về" ở mọi nơi khác trong hệ thống)
  // chứ KHÔNG dùng payoutStatus: "paid" (đã chuyển khoản ngân hàng thật) —
  // toàn hệ thống hiện chưa có đơn nào payoutStatus=paid nên dùng field đó
  // sẽ luôn hiện 0đ, sai lệch với số tiền khách thực sự đã nhận vào ví.
  const [approvedSumAgg, distinctApprovedCustomers, activeRule] = await Promise.all([
    prisma.order.aggregate({
      where: { orderStatus: "approved" },
      _sum: { customerRewardAmount: true },
    }),
    prisma.order.findMany({
      where: { orderStatus: "approved" },
      distinct: ["customerId"],
      select: { customerId: true },
    }),
    prisma.commissionRule.findFirst({
      where: { active: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);
  const totalPaidOut = Number(approvedSumAgg._sum.customerRewardAmount ?? 0);
  const totalCustomers = distinctApprovedCustomers.length;
  const customerRate = activeRule?.customerRate != null ? Number(activeRule.customerRate) : 80;
  const taxRate = activeRule?.taxRate != null ? Number(activeRule.taxRate) : 10.98;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLdString(jsonLd) }}
      />
      <LandingPage
        totalPaidOut={totalPaidOut}
        totalCustomers={totalCustomers}
        customerRate={customerRate}
        taxRate={taxRate}
      />
    </>
  );
}
