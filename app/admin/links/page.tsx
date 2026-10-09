import { prisma } from "@/lib/prisma";
import { AdminLinksClient } from "@/components/admin/AdminLinksClient";
import { Link2, CheckCircle, MousePointerClick } from "lucide-react";
import { resolveDisplayProductName, resolveDisplayProductImage } from "@/lib/productInfo";

export default async function AdminLinksPage({ searchParams }: { searchParams: { q?: string; page?: string; sort?: string; order?: string; tab?: string } }) {
  const page = Number(searchParams.page) || 1;
  const limit = 10;
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

  const orderByField = searchParams.sort || "createdAt";
  const orderByDir = searchParams.order || "desc";
  const orderBy = { [orderByField]: orderByDir };

  const tab = searchParams.tab || "all";
  if (tab === "active") where.status = "active";
  if (tab === "stopped") where.status = "stopped";

  const [
    customers,
    platforms,
    links,
    filteredCount,
    totalCount,
    activeCount,
    stoppedCount,
    clicksAgg,
  ] = await Promise.all([
    prisma.customer.findMany({ where: { status: "active" }, orderBy: { fullName: "asc" } }),
    prisma.platform.findMany({ where: { status: "active" }, orderBy: { name: "asc" } }),
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
  ]);

  const rows = links.map((l) => ({
    id: l.id,
    createdAt: l.createdAt,
    customerName: l.customer.fullName,
    platformName: l.platform.name,
    trackingCode: l.trackingCode,
    shortCode: l.shortCode,
    channelSource: l.channelSource,
    clicks: l.clicks,
    status: l.status,
    productTitle: resolveDisplayProductName(l.productTitle, null, `Sản phẩm ${l.platform.name}`),
    productImage: resolveDisplayProductImage(l.productImage),
  }));

  const totalPages = Math.ceil(filteredCount / limit);
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

          <a href="/admin/quick-link">
            <button className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 px-5 py-3 text-xs font-black text-white shadow-md shadow-rose-500/20 hover:shadow-lg transition-all active:scale-[0.98]">
              <span>+ Tạo Link Aff Nhanh</span>
              <span className="text-base leading-none">⚡</span>
            </button>
          </a>
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

      {/* ── LINK LIST ── */}
      <div className="rounded-3xl bg-white shadow-sm border border-neutral-200/70 overflow-hidden">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-neutral-200/70 bg-neutral-50/50">
          <div className="flex items-center gap-2.5">
            <img src="/meow-back-voucher.png" alt="" className="h-7 w-7 object-contain rounded-lg" />
            <h2 className="text-sm font-extrabold text-neutral-900 tracking-tight">Lịch Sử Link Đã Khởi Tạo</h2>
          </div>
          <span className="text-xs font-extrabold text-neutral-500 bg-neutral-100 px-3 py-1 rounded-full">{filteredCount} link</span>
        </div>
        <div className="p-6">
          <AdminLinksClient
            links={rows}
            totalPages={totalPages}
            currentPage={page}
            totalItems={filteredCount}
            pageSize={limit}
            counts={counts}
            totalClicks={totalClicks}
          />
        </div>
      </div>
    </div>
  );
}
