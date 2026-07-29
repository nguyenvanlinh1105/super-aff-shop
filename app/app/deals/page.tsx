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
    <div className="flex flex-col gap-xl fade-in">
      {/* Banner Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#ff4500] via-[#e86a33] to-[#ff8c42] p-xl sm:p-2xl">
        <div
          className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "20px 20px" }}
        />
        <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
          <circle cx="90%" cy="20%" r="120" fill="white" fillOpacity="0.06">
            <animate attributeName="cx" values="90%;85%;90%" dur="8s" repeatCount="indefinite" />
          </circle>
          <circle cx="10%" cy="75%" r="80" fill="white" fillOpacity="0.08">
            <animate attributeName="cy" values="75%;65%;75%" dur="10s" repeatCount="indefinite" />
          </circle>
        </svg>

        <div className="relative z-10">
          <div className="flex items-center gap-sm mb-sm">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/20">
              <Flame size={16} className="text-white" strokeWidth={2} />
            </div>
            <span className="text-[12px] font-bold uppercase tracking-[0.12em] text-white/70">Deals Độc Quyền</span>
          </div>
          <h1 className="text-[28px] sm:text-[36px] font-black text-white leading-tight">
            🔥 Deal Sập Sàn Hôm Nay
          </h1>
          <p className="mt-xs text-[14px] text-white/70 max-w-[400px]">
            Những deal giảm giá được admin tuyển chọn kỹ — bấm vào mua ngay để nhận hoàn tiền!
          </p>
          <div className="mt-lg flex items-center gap-md">
            <div className="flex items-center gap-xs bg-white/15 rounded-xl px-md py-xs">
              <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-[13px] font-bold text-white">{activeDealsCount} deals đang có</span>
            </div>
          </div>
        </div>

        <img
          src="/heogiamgia.png"
          alt=""
          className="pointer-events-none absolute -right-2 bottom-0 z-10 hidden h-[140px] w-[140px] object-contain drop-shadow-xl sm:block"
        />
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
