import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Flame } from "lucide-react";
import { DealGrid } from "@/components/customer/DealGrid";
import { ServerSearchInput } from "@/components/ui/ServerSearchInput";
import { FloatingElement } from "@/components/ui/FloatingElement";

export default async function CustomerDealsPage({ searchParams }: { searchParams: { q?: string; page?: string; platform?: string; category?: string; sort?: string; linkType?: string } }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const page = Number(searchParams.page) || 1;
  const limit = 8;
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
    where.AND.push({ OR: [{ title: { contains: q } }, { description: { contains: q } }] });
  }

  const orderBy =
    sort === "discount" ? { discountPercent: "desc" as const }
    : sort === "clicks" ? { clicks: "desc" as const }
    : { createdAt: "desc" as const };

  const [totalCount, activeDealsCount, productTypeCount, shopTypeCount, deals] = await Promise.all([
    prisma.dealPost.count({ where }),
    prisma.dealPost.count({ where: activeNotExpired }),
    prisma.dealPost.count({ where: { ...activeNotExpired, linkType: "product" } }),
    prisma.dealPost.count({ where: { ...activeNotExpired, linkType: "shop" } }),
    prisma.dealPost.findMany({
      where,
      orderBy,
      skip,
      take: limit,
    })
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

  return (
    <div className="flex w-full flex-col gap-4 sm:gap-6 fade-in pb-12">
      {/* Banner Header */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl p-4 sm:p-7 border border-primary-200/60 shadow-xl shadow-primary-500/5 bg-white">
        <img src="/deals-bg.png" alt="" className="absolute inset-0 w-full h-full object-cover opacity-80" />
        <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px]" />

        <div className="relative z-10 flex items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3 sm:gap-5 min-w-0">
            <FloatingElement duration={4}>
              <div className="w-12 h-12 sm:w-18 sm:h-18 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-primary-400 via-primary-500 to-pink-600 text-white flex items-center justify-center shadow-lg shadow-primary-500/25 shrink-0 border-2 border-white overflow-hidden p-1">
                <img src="/meowback_lucky_cat_logo.png" alt="MeowBack" className="w-full h-full object-contain rounded-xl sm:rounded-2xl" />
              </div>
            </FloatingElement>
            <div className="min-w-0">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary-100/90 text-primary-700 text-[10.5px] sm:text-[11px] font-bold mb-1 sm:mb-1.5 border border-primary-200/60 shadow-2xs">
                <Flame size={12} className="text-primary-500 fill-primary-500 shrink-0" />
                <span>Ưu đãi độc quyền</span>
              </div>
              <h1 className="text-lg sm:text-2xl lg:text-3xl font-black leading-tight text-neutral-900 tracking-tight truncate">
                Deal Sập Sàn Hôm Nay
              </h1>
              <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-neutral-600 font-medium leading-relaxed max-w-xl line-clamp-2">
                Những ưu đãi giảm giá tốt nhất do admin tuyển chọn. Bấm deal để mua và tự động tích lũy hoàn tiền!
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-md">
        <ServerSearchInput placeholder="Tìm kiếm deal giảm giá..." />
      </div>

      <DealGrid
        deals={formattedDeals}
        totalPages={totalPages}
        currentPage={page}
        hasQuery={Boolean(q || platform || category)}
        linkTypeCounts={{ product: productTypeCount, shop: shopTypeCount }}
        refundsHref="/app/refunds"
      />
    </div>
  );
}
