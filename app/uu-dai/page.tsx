import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { PublicFloatingSupport } from "@/components/marketing/PublicFloatingSupport";
import { DealGrid } from "@/components/customer/DealGrid";
import { ServerSearchInput } from "@/components/ui/ServerSearchInput";
import { Flame } from "lucide-react";
import { safeJsonLdString } from "@/lib/jsonLd";
import { IconBow, IllustCatWelcome } from "@/components/icons/CatRibbonIcons";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Ưu Đãi & Mã Giảm Giá Shopee, TikTok Shop Mới Nhất | MeowBack",
  description:
    "Cập nhật liên tục mã giảm giá, deal sập sàn Shopee và TikTok Shop. Mua qua link MeowBack vừa được giá tốt vừa nhận thêm hoàn tiền.",
  alternates: { canonical: "/uu-dai" },
  openGraph: {
    title: "Ưu Đãi & Mã Giảm Giá Shopee, TikTok Shop Mới Nhất — MeowBack 🎀",
    description:
      "Cập nhật liên tục mã giảm giá, deal sập sàn Shopee và TikTok Shop. Mua qua link MeowBack vừa được giá tốt vừa nhận thêm hoàn tiền.",
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
      prisma.dealPost.count({ where: { status: "active" } }),
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

      <main className="pt-16">
        {/* Header Hero */}
        <section className="bg-gradient-to-b from-primary-100/70 via-primary-50 to-neutral-bg py-16 relative overflow-hidden">
          <div className="max-w-[1200px] mx-auto px-4 md:px-8 relative z-10 text-center">
            <div className="inline-flex items-center gap-2 bg-white px-4 py-1.5 rounded-full shadow-cute border border-primary-200 mb-4">
              <IconBow className="w-4 h-4 text-accent-bow" />
              <span className="text-[13px] font-extrabold text-primary-600">
                Săn Deal MeowBack 🐾
              </span>
            </div>
            <h1 className="text-[38px] md:text-[54px] font-extrabold text-neutral-900 tracking-tight mb-4">
              Ưu Đãi &{" "}
              <span className="text-primary-500 underline decoration-primary-200 decoration-wavy">
                Mã Giảm Giá 🎀
              </span>
            </h1>
            <p className="text-[17px] text-neutral-600 max-w-2xl mx-auto leading-relaxed font-medium">
              Deal sập sàn Shopee & TikTok Shop được cập nhật mỗi ngày. Mua qua
              link MeowBack vừa được giá tốt, vừa tự động nhận thêm hoàn tiền.
            </p>
          </div>
        </section>

        {/* Deals Section */}
        <section className="py-10 max-w-[1200px] mx-auto px-4 md:px-8 pb-16">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-2">
              <Flame size={20} className="text-primary-500" />
              <span className="text-[15px] font-extrabold text-neutral-900">
                {activeDealsCount} ưu đãi HOT đang mở 🐾
              </span>
            </div>
            <ServerSearchInput
              placeholder="Tìm kiếm ưu đãi..."
              className="sm:max-w-[280px]"
            />
          </div>

          <DealGrid
            deals={formattedDeals}
            totalPages={totalPages}
            currentPage={page}
            hasQuery={Boolean(q || platform || category)}
            linkTypeCounts={{ product: productTypeCount, shop: shopTypeCount }}
          />
        </section>
      </main>

      <MarketingFooter />
      <PublicFloatingSupport />
    </div>
  );
}
