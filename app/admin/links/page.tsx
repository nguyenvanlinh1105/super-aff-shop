import { prisma } from "@/lib/prisma";
import { QuickLinkForm } from "@/components/admin/QuickLinkForm";
import { AdminLinksClient } from "@/components/admin/AdminLinksClient";
import { Link2, CheckCircle, MousePointerClick } from "lucide-react";

export default async function AdminLinksPage({ searchParams }: { searchParams: { q?: string; page?: string; sort?: string; order?: string; tab?: string } }) {
  const page = Number(searchParams.page) || 1;
  const limit = 10;
  const skip = (page - 1) * limit;
  const q = searchParams.q || "";

  const where: any = {};
  if (q) {
    where.OR = [
      { trackingCode: { contains: q } },
      { shortCode: { contains: q } },
      { channelSource: { contains: q } },
      { customer: { fullName: { contains: q } } },
    ];
  }

  const orderByField = searchParams.sort || "createdAt";
  const orderByDir = searchParams.order || "desc";
  const orderBy = { [orderByField]: orderByDir };

  const tab = searchParams.tab || "all";
  if (tab === "active") where.status = "active";
  if (tab === "stopped") where.status = "stopped";

  const [customers, platforms, links, filteredCount, totalCount, activeCount, stoppedCount, clicksAgg] = await Promise.all([
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
    prisma.trackingLink.count(),
    prisma.trackingLink.count({ where: { status: "active" } }),
    prisma.trackingLink.count({ where: { status: "stopped" } }),
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
    productTitle: l.productTitle,
    productImage: l.productImage,
  }));

  const totalPages = Math.ceil(filteredCount / limit);
  const counts = { all: totalCount, active: activeCount, stopped: stoppedCount };
  const totalClicks = clicksAgg._sum.clicks ?? 0;

  return (
    <div className="flex flex-col gap-lg fade-in">

      {/* ── HERO BANNER ── */}
      <div
        className="relative overflow-hidden rounded-3xl p-xl sm:p-2xl"
        style={{ background: "linear-gradient(135deg, #f0f4ff 0%, #e8eeff 50%, #eef2ff 100%)" }}
      >
        <div className="pointer-events-none absolute -right-8 -top-8 h-36 w-36 rounded-full bg-[#c7d2fe] opacity-30" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-40 w-40 rounded-full bg-[#dde4ff] opacity-40" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-lg flex-wrap">
          <div className="flex items-center gap-lg">
            <img src="/meowback_lucky_cat_logo.png" alt="" className="h-20 w-20 object-contain drop-shadow-lg shrink-0" />
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-indigo-400 mb-1">Affiliate System</p>
              <h1 className="text-[26px] sm:text-[30px] font-black leading-tight text-[#1e1b4b]">Link Affiliate</h1>
              <p className="mt-1 text-[13px] text-indigo-400">
                <span className="font-bold text-indigo-600">{activeCount}</span> đang hoạt động •{" "}
                <span className="font-bold text-gray-600">{totalClicks.toLocaleString()}</span> lượt click
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── STAT CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-md">
        <div className="group relative overflow-hidden rounded-2xl bg-white p-lg shadow-sm ring-1 ring-black/[0.06] hover:-translate-y-1 hover:shadow-md transition-all">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-blue-50 opacity-60" />
          <div className="relative flex items-center gap-md">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100/90 text-indigo-600 shadow-sm transition-transform group-hover:scale-110 shrink-0">
              <Link2 size={24} strokeWidth={2.5} />
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Tổng link</div>
              <div className="text-[26px] font-black text-gray-900 tabular-nums leading-tight">{totalCount}</div>
            </div>
          </div>
        </div>
        <div className="group relative overflow-hidden rounded-2xl p-lg shadow-sm ring-1 ring-black/[0.06] hover:-translate-y-1 hover:shadow-md transition-all"
          style={{ background: "linear-gradient(135deg,#e8f5e9,#f1fdf2)" }}>
          <div className="relative flex items-center gap-md">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100/90 text-emerald-600 shadow-sm transition-transform group-hover:scale-110 shrink-0">
              <CheckCircle size={24} strokeWidth={2.5} />
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Hoạt động</div>
              <div className="text-[26px] font-black text-emerald-600 tabular-nums leading-tight">{activeCount}</div>
            </div>
          </div>
        </div>
        <div className="group relative overflow-hidden rounded-2xl bg-white p-lg shadow-sm ring-1 ring-black/[0.06] hover:-translate-y-1 hover:shadow-md transition-all">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-50 to-purple-50 opacity-60" />
          <div className="relative flex items-center gap-md">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100/90 text-violet-600 shadow-sm transition-transform group-hover:scale-110 shrink-0">
              <MousePointerClick size={24} strokeWidth={2.5} />
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Tổng click</div>
              <div className="text-[22px] font-black text-violet-600 tabular-nums leading-tight">{totalClicks.toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── QUICK LINK FORM ── */}
      <div className="rounded-3xl bg-white shadow-sm ring-1 ring-black/[0.06] overflow-hidden">
        <div className="flex items-center gap-sm px-xl pt-xl pb-lg border-b border-gray-100">
          <img src="/heogiamgia.png" alt="" className="h-8 w-8 object-contain" />
          <h2 className="text-[15px] font-bold text-gray-900">Tạo link nhanh</h2>
        </div>
        <div className="p-xl">
          <QuickLinkForm
            customers={customers.map((c) => ({ id: c.id, label: `${c.fullName} (${c.customerCode})` }))}
            platforms={platforms.map((p) => ({ id: p.id, label: p.name }))}
          />
        </div>
      </div>

      {/* ── LINK LIST ── */}
      <div className="rounded-3xl bg-white shadow-sm ring-1 ring-black/[0.06] overflow-hidden">
        <div className="flex items-center gap-sm px-xl pt-xl pb-lg border-b border-gray-100">
          <img src="/heothongbao.png" alt="" className="h-8 w-8 object-contain" />
          <h2 className="text-[15px] font-bold text-gray-900">Lịch sử link đã tạo</h2>
          <span className="ml-auto text-[12px] font-semibold text-gray-400">{totalCount} link</span>
        </div>
        <div className="p-xl">
          <AdminLinksClient links={rows} totalPages={totalPages} currentPage={page} counts={counts} totalClicks={totalClicks} />
        </div>
      </div>
    </div>
  );
}
