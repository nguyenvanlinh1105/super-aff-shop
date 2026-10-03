import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { LandingPage } from "@/components/marketing/LandingPage";
import { safeJsonLdString } from "@/lib/jsonLd";

export const metadata: Metadata = {
  title: "MeowBack — Hoàn Tiền Đến 80% Shopee, TikTok Shop & Lazada",
  description:
    "Hoàn tiền đến 80% hoa hồng khi mua sắm Shopee, Lazada & TikTok Shop. Dán link nhận hoàn tiền tự động vào ví MeowBack, rút tiền từ 10.000đ về ngân hàng và MoMo.",
  alternates: { canonical: "/" },
  keywords: [
    "MeowBack",
    "meowback",
    "meowback shop",
    "meowback.shop",
    "hoàn tiền 80%",
    "hoàn tiền 80% shopee",
    "hoàn tiền shopee 80%",
    "hoàn tiền tiktok 80%",
    "hoàn tiền meowback",
    "hoàn tiền shopee",
    "hoàn tiền lazada",
    "hoàn tiền tiktok shop",
    "affiliate hoàn tiền",
  ],
  openGraph: {
    title: "MeowBack — Hoàn Tiền Đến 80% Shopee, TikTok Shop & Lazada",
    description:
      "Nền tảng hoàn tiền affiliate uy tín hàng đầu cho Shopee, TikTok Shop và Lazada. Nhận lại đến 80% hoa hồng, rút tiền từ 10.000đ về ngân hàng và MoMo.",
    type: "website",
    locale: "vi_VN",
    url: "/",
    siteName: "MeowBack",
    images: [
      {
        url: "/icon-512.png",
        width: 512,
        height: 512,
        alt: "MeowBack - Hoàn Tiền Đến 80% Shopee, Lazada & TikTok Shop",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MeowBack — Hoàn Tiền Đến 80% Shopee, TikTok Shop & Lazada",
    description:
      "Nền tảng hoàn tiền affiliate uy tín hàng đầu cho Shopee, TikTok Shop và Lazada. Nhận lại đến 80% hoa hồng, rút tiền từ 10.000đ về ngân hàng và MoMo.",
    images: ["/icon-512.png"],
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
      alternateName: ["MeowBack Shop", "Meow Back", "meowback.shop"],
      description:
        "Nền tảng affiliate hoàn tiền đến 80% cho Shopee, TikTok Shop và Lazada tại Việt Nam.",
      inLanguage: "vi-VN",
      potentialAction: {
        "@type": "SearchAction",
        target: "https://meowback.shop/uu-dai?q={search_term_string}",
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "Organization",
      "@id": "https://meowback.shop/#organization",
      name: "MeowBack",
      url: "https://meowback.shop",
      logo: "https://meowback.shop/icon-512.png",
      sameAs: [
        "https://www.facebook.com/meowback.official",
        "https://www.tiktok.com/@meowback.official",
        "https://www.instagram.com/meowback.official",
        "https://youtube.com/@meowback.official",
      ],
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "MeowBack hoàn tiền bao nhiêu % khi mua Shopee, TikTok Shop?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "MeowBack hoàn trả lên tới 80% số tiền hoa hồng mà sàn Shopee, TikTok Shop hoặc Lazada chi trả cho đơn hàng của bạn trực tiếp về tài khoản ngân hàng hoặc ví MoMo.",
          },
        },
        {
          "@type": "Question",
          name: "Hệ thống hoàn tiền MeowBack hoạt động như thế nào?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Khi bạn dán link sản phẩm qua MeowBack để mua hàng, sàn thương mại điện tử sẽ trả một khoản hoa hồng affiliate. MeowBack hoàn trả lại đến 80% khoản này cho bạn dưới dạng tiền hoàn vào ví.",
          },
        },
        {
          "@type": "Question",
          name: "Rút tiền hoàn tối thiểu bao nhiêu?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Mức rút tối thiểu chỉ từ 10.000đ. Bạn có thể nhận về tài khoản ngân hàng hoặc ví MoMo nhanh chóng sau khi đơn hàng được sàn đối soát thành công.",
          },
        },
        {
          "@type": "Question",
          name: "Sử dụng MeowBack có mất phí không?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Hoàn toàn miễn phí 100% — không thu phí đăng ký, không thu phí tạo link hay chiết khấu phí rút tiền.",
          },
        },
        {
          "@type": "Question",
          name: "MeowBack hỗ trợ những sàn thương mại điện tử nào?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Hiện tại MeowBack hỗ trợ hoàn tiền cho Shopee, TikTok Shop và Lazada với tỷ lệ hoàn tiền lên tới 80% hoa hồng.",
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
