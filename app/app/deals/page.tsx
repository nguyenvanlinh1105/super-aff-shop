import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Flame } from "lucide-react";
import { DealGrid } from "@/components/customer/DealGrid";
import { ServerSearchInput } from "@/components/ui/ServerSearchInput";

export default async function CustomerDealsPage({ searchParams }: { searchParams: { q?: string; page?: string; platform?: string; category?: string; sort?: string; linkType?: string } }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const page = Number(searchParams.page) || 1;
  const limit = 10;
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
    prisma.dealPost.count({ where: { status: "active" } }),
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
    expiresAt: d.expiresAt ? d.expiresAt.toISOString() : null,
    imageUrl: d.uploadedImageUrl || d.shopeeImageUrl || null,
    shortUrl: d.shortUrl,
    clicks: d.clicks,
    createdAt: d.createdAt.toISOString(),
  }));

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 fade-in pb-12">
      {/* Banner Header */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 border border-primary-200/60 shadow-xl shadow-primary-500/5 bg-gradient-to-br from-white via-[#FFF5F8] to-[#FFE8F0]">
        <div className="pointer-events-none absolute -right-12 -top-12 h-64 w-64 rounded-full bg-gradient-to-br from-primary-200/40 to-pink-300/20 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-10 right-40 h-48 w-48 rounded-full bg-gradient-to-tr from-accent-bow/20 to-primary-100/30 blur-xl" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-br from-primary-400 via-primary-500 to-pink-600 text-white flex items-center justify-center shadow-lg shadow-primary-500/25 shrink-0 border border-white/40 overflow-hidden p-1">
              <img src="/meow-back-deals.png" alt="Deals" className="w-full h-full object-contain rounded-2xl" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold leading-tight text-neutral-900 tracking-tight">
                Deal Sập Sàn Hôm Nay
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-neutral-600 font-medium leading-relaxed max-w-xl">
                Những ưu đãi giảm giá độc quyền được hệ thống tuyển chọn. Bấm vào link và mua ngay để tự động nhận thêm hoàn tiền vào ví!
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
