import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { PublicFloatingSupport } from "@/components/marketing/PublicFloatingSupport";
import { DealGrid } from "@/components/customer/DealGrid";
import { DealMarketHero } from "@/components/customer/DealMarketHero";
import { safeJsonLdString } from "@/lib/jsonLd";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Săn Deal & Nhận Hoàn Tiền Đến 80% Shopee, TikTok Shop | MeowBack",
  description:
    "Cập nhật mã giảm giá, deal sập sàn Shopee và TikTok Shop kết hợp hoàn tiền đến 80% hoa hồng. Mua sắm tiết kiệm tối đa cùng MeowBack.",
  alternates: { canonical: "/uu-dai" },
  openGraph: {
    title: "Săn Deal & Nhận Hoàn Tiền Đến 80% Shopee, TikTok Shop | MeowBack",
    description:
      "Cập nhật mã giảm giá, deal sập sàn Shopee và TikTok Shop kết hợp hoàn tiền đến 80% hoa hồng. Mua sắm tiết kiệm tối đa cùng MeowBack.",
    type: "website",
    locale: "vi_VN",
    url: "/uu-dai",
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
      name: "Ưu đãi",
      item: "https://meowback.shop/uu-dai",
    },
  ],
};

export default async function PublicDealsPage({
  searchParams,
}: {
  searchParams: {
    q?: string;
    page?: string;
    platform?: string;
    category?: string;
    sort?: string;
    linkType?: string;
  };
}) {
  const session = await getSession();
  const isLoggedIn = Boolean(session?.userId);

  const page = Number(searchParams.page) || 1;
  const limit = 12;
  const skip = (page - 1) * limit;
  const q = searchParams.q || "";
  const platform = searchParams.platform || "";
  const category = searchParams.category || "";
  const linkType = searchParams.linkType || "";
  const sort = searchParams.sort || "newest";

  const activeNotExpired = {
    status: "active",
    AND: [{ OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] }],
  };
  const where: any = { ...activeNotExpired, AND: [...activeNotExpired.AND] };
  if (platform) where.platformCode = platform;
  if (category) where.category = category;
  if (linkType) where.linkType = linkType;
  if (q) {
    where.AND.push({
      OR: [{ title: { contains: q } }, { description: { contains: q } }],
    });
  }

  const orderBy =
    sort === "discount"
      ? { discountPercent: "desc" as const }
      : sort === "clicks"
        ? { clicks: "desc" as const }
        : { createdAt: "desc" as const };

  const [totalCount, activeDealsCount, productTypeCount, shopTypeCount, deals] =
    await Promise.all([
      prisma.dealPost.count({ where }),
      prisma.dealPost.count({ where: activeNotExpired }),
      prisma.dealPost.count({
        where: { ...activeNotExpired, linkType: "product" },
      }),
      prisma.dealPost.count({
        where: { ...activeNotExpired, linkType: "shop" },
      }),
      prisma.dealPost.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
    ]);

  const formattedDeals = deals.map((d) => ({
    id: d.id,
    title: d.title,
    description: d.description,
    originalPrice: d.originalPrice ? Number(d.originalPrice) : null,
    salePrice: d.salePrice ? Number(d.salePrice) : null,
    discountPercent: d.discountPercent,
    category: d.category,
    linkType: d.linkType,
    platformCode: d.platformCode || "SHOPEE",
    expiresAt: d.expiresAt ? d.expiresAt.toISOString() : null,
    imageUrl: d.uploadedImageUrl || d.shopeeImageUrl || null,
    shortUrl: d.shortUrl,
    clicks: d.clicks,
    createdAt: d.createdAt.toISOString(),
  }));

  const totalPages = Math.ceil(totalCount / limit);

  const itemListJsonLd =
    formattedDeals.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "ItemList",
          itemListElement: formattedDeals.map((d, idx) => ({
            "@type": "ListItem",
            position: idx + 1,
            url: d.shortUrl || "https://meowback.shop/uu-dai",
            name: d.title,
          })),
        }
      : null;

  return (
    <div className="min-h-screen bg-neutral-bg font-sans overflow-x-hidden text-neutral-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLdString(breadcrumbJsonLd) }}
      />
      {itemListJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLdString(itemListJsonLd) }}
        />
      )}
      <MarketingHeader activePath="/uu-dai" />

      {/* Main Container: Strictly matches MarketingHeader width (max-w-[1200px] px-3.5 sm:px-5 md:px-10) */}
      <main className="pt-20 sm:pt-24 pb-16 max-w-[1200px] mx-auto px-3.5 sm:px-5 md:px-10">
        {/* Sleek Hero Banner */}
        <DealMarketHero activeCount={activeDealsCount} />

        {/* Deals Section */}
        <section className="mt-2">
          <DealGrid
            deals={formattedDeals}
            totalPages={totalPages}
            currentPage={page}
            hasQuery={Boolean(q || platform || category)}
            linkTypeCounts={{ product: productTypeCount, shop: shopTypeCount }}
            isLoggedIn={isLoggedIn}
          />
        </section>
      </main>

      <MarketingFooter />
      <PublicFloatingSupport />
    </div>
  );
}
