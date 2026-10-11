import { prisma } from "@/lib/prisma";
import { AdminLinksClient } from "@/components/admin/AdminLinksClient";
import { Link2, CheckCircle, MousePointerClick } from "lucide-react";
import { resolveDisplayProductName, resolveDisplayProductImage } from "@/lib/productInfo";
import { buildShortUrl } from "@/lib/shortLink";
import Link from "next/link";

export default async function AdminLinksPage({
  searchParams,
}: {
  searchParams: {
    q?: string;
    page?: string;
    sort?: string;
    order?: string;
    tab?: string;
    platform?: string;
    limit?: string;
  };
}) {
  const page = Number(searchParams.page) || 1;
  const limit = Number(searchParams.limit) || 10;
  const skip = (page - 1) * limit;
  const q = searchParams.q?.trim() || "";

  const baseWhere: any = {};
  if (q) {
    baseWhere.OR = [
      { trackingCode: { contains: q, mode: "insensitive" } },
      { shortCode: { contains: q, mode: "insensitive" } },
      { channelSource: { contains: q, mode: "insensitive" } },
      { customer: { fullName: { contains: q, mode: "insensitive" } } },
      { customer: { customerCode: { contains: q, mode: "insensitive" } } },
      { productTitle: { contains: q, mode: "insensitive" } },
    ];
  }

  const where: any = { ...baseWhere };

  // Lọc theo sàn
  const platform = (searchParams.platform || "ALL").toUpperCase();
  if (platform !== "ALL") {
    where.platform = { code: { equals: platform, mode: "insensitive" } };
  }

  // Lọc theo trạng thái
  const tab = searchParams.tab || "all";
  if (tab === "active") where.status = "active";
  if (tab === "stopped") where.status = "stopped";

  // Sắp xếp
  const sortBy = searchParams.sort || "newest";
  let orderBy: any = { createdAt: "desc" };
  if (sortBy === "oldest") orderBy = { createdAt: "asc" };
  else if (sortBy === "clicks") orderBy = { clicks: "desc" };
  else if (sortBy === "name_asc") orderBy = { customer: { fullName: "asc" } };
  else if (sortBy === "product_asc") orderBy = { productTitle: "asc" };
  else if (searchParams.sort && searchParams.order) {
    orderBy = { [searchParams.sort]: searchParams.order };
  }

  const [
    links,
    filteredCount,
    totalCount,
    activeCount,
    stoppedCount,
    clicksAgg,
    shopeeCount,
    tiktokCount,
    lazadaCount,
  ] = await Promise.all([
    prisma.trackingLink.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: { customer: true, platform: true },
    }),
    prisma.trackingLink.count({ where }),
    prisma.trackingLink.count({ where: baseWhere }),
    prisma.trackingLink.count({ where: { ...baseWhere, status: "active" } }),
    prisma.trackingLink.count({ where: { ...baseWhere, status: "stopped" } }),
    prisma.trackingLink.aggregate({ where, _sum: { clicks: true } }),
    prisma.trackingLink.count({
      where: { ...baseWhere, platform: { code: { equals: "SHOPEE", mode: "insensitive" } } },
    }),
    prisma.trackingLink.count({
      where: { ...baseWhere, platform: { code: { equals: "TIKTOK", mode: "insensitive" } } },
    }),
    prisma.trackingLink.count({
      where: { ...baseWhere, platform: { code: { equals: "LAZADA", mode: "insensitive" } } },
    }),
  ]);

  const rows = links.map((l) => ({
    id: l.id,
    createdAt: l.createdAt.toISOString(),
    customerName: l.customer.fullName,
    customerCode: l.customer.customerCode,
    customerId: l.customer.id,
    platformName: l.platform.name,
    platformCode: l.platform.code,
    trackingCode: l.trackingCode,
    shortCode: l.shortCode,
    shortUrl: l.shortUrl || (l.shortCode ? buildShortUrl(l.shortCode) : null),
    affiliateUrl: l.affiliateUrl,
    channelSource: l.channelSource,
    clicks: l.clicks,
    status: l.status,
    productTitle: resolveDisplayProductName(l.productTitle, null, `Sản phẩm ${l.platform.name}`),
    productImage: resolveDisplayProductImage(l.productImage),
  }));

  const totalPages = Math.ceil(filteredCount / limit) || 1;
  const counts = { all: totalCount, active: activeCount, stopped: stoppedCount };
  const totalClicks = clicksAgg._sum.clicks ?? 0;

  return (
    <div className="flex flex-col gap-6 fade-in pb-8">
      {/* ── LUXURY HERO BANNER ── */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 border border-sky-200/60 shadow-lg shadow-sky-500/5 bg-gradient-to-br from-white via-[#F0F4FF] to-[#E8EEFF]">
        <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-gradient-to-br from-sky-200/30 to-indigo-300/20 blur-xl" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6 flex-wrap">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-br from-sky-400 via-indigo-500 to-sky-600 text-white flex items-center justify-center shadow-md shadow-sky-500/20 shrink-0 border border-white/40 overflow-hidden p-1">
              <img src="/meow-back-links.png" alt="Link Affiliate" className="w-full h-full object-contain rounded-2xl" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/80 border border-sky-200 text-[10px] font-black uppercase tracking-widest text-sky-700 shadow-xs mb-1.5">
                Affiliate Tracking Generator
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight text-neutral-900 tracking-tight">
                Quản Lý Link Affiliate
              </h1>
              <p className="mt-1 text-xs text-neutral-600 font-medium">
                {q ? (
                  <>
                    Tìm thấy <span className="font-bold text-sky-700">{totalCount.toLocaleString()}</span> link phù hợp (<span className="font-bold text-emerald-700">{activeCount.toLocaleString()}</span> đang hoạt động) • Tích lũy{" "}
                    <span className="font-extrabold text-indigo-700 tabular-nums">{totalClicks.toLocaleString()}</span> lượt nhấp click
                  </>
                ) : (
                  <>
                    <span className="font-bold text-sky-700">{activeCount.toLocaleString()}</span> link đang hoạt động • Tích lũy{" "}
                    <span className="font-extrabold text-indigo-700 tabular-nums">{totalClicks.toLocaleString()}</span> lượt nhấp click
                  </>
                )}
              </p>
            </div>
          </div>

          <Link href="/admin/quick-link">
            <button className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 px-5 py-3 text-xs font-black text-white shadow-md shadow-rose-500/20 hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer">
              <span>+ Tạo Link Aff Nhanh</span>
              <span className="text-base leading-none">⚡</span>
            </button>
          </Link>
        </div>
      </div>

      {/* ── STAT CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="group relative overflow-hidden rounded-3xl bg-white p-5 shadow-sm border border-neutral-200/70 hover:border-sky-200 transition-all duration-300 hover:-translate-y-0.5">
          <div className="relative flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 border border-sky-100 font-black text-xl shadow-xs shrink-0 group-hover:scale-105 transition-transform">
              <Link2 size={22} strokeWidth={2.2} />
            </div>
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-widest text-neutral-400">
                {q ? "Link Phù Hợp" : "Tổng Link Khởi Tạo"}
              </div>
              <div className="text-2xl font-black text-neutral-900 tabular-nums leading-tight">{totalCount.toLocaleString()}</div>
            </div>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-3xl bg-white p-5 shadow-sm border border-neutral-200/70 hover:border-emerald-200 transition-all duration-300 hover:-translate-y-0.5">
          <div className="relative flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 font-black text-xl shadow-xs shrink-0 group-hover:scale-105 transition-transform">
              <CheckCircle size={22} strokeWidth={2.2} />
            </div>
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-widest text-neutral-400">Đang Hoạt Động</div>
              <div className="text-2xl font-black text-emerald-900 tabular-nums leading-tight">{activeCount.toLocaleString()}</div>
            </div>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-3xl bg-white p-5 shadow-sm border border-neutral-200/70 hover:border-indigo-200 transition-all duration-300 hover:-translate-y-0.5">
          <div className="relative flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 font-black text-xl shadow-xs shrink-0 group-hover:scale-105 transition-transform">
              <MousePointerClick size={22} strokeWidth={2.2} />
            </div>
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-widest text-neutral-400">Tổng Lượt Click</div>
              <div className="text-2xl font-black text-indigo-600 tabular-nums leading-tight">{totalClicks.toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── DANH SÁCH LINK AFFILIATE (HIỂN THỊ ĐẸP & THÂN THIỆN NHƯ TRANG TẠO LINK AFF NHANH) ── */}
      <AdminLinksClient
        links={rows}
        totalPages={totalPages}
        currentPage={page}
        totalItems={filteredCount}
        pageSize={limit}
        counts={counts}
        totalClicks={totalClicks}
        platformCounts={{
          all: totalCount,
          shopee: shopeeCount,
          tiktok: tiktokCount,
          lazada: lazadaCount,
        }}
      />
    </div>
  );
}

