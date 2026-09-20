import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { MousePointerClick, Tag, Eye, TrendingUp, Sparkles } from "lucide-react";
import { CreateDealForm } from "@/components/admin/CreateDealForm";
import { AdminDealList } from "@/components/admin/AdminDealList";

export default async function AdminDealsPage({ searchParams }: { searchParams: { q?: string; page?: string; sort?: string; order?: string } }) {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/login");

  const page = Number(searchParams.page) || 1;
  const limit = 10;
  const skip = (page - 1) * limit;
  const q = searchParams.q || "";

  const where: any = {};
  if (q) {
    where.OR = [
      { title: { contains: q } },
      { description: { contains: q } },
      { shortCode: { contains: q } },
    ];
  }

  const orderByField = searchParams.sort || "createdAt";
  const orderByDir = searchParams.order || "desc";
  const orderBy = { [orderByField]: orderByDir };

  const [allDealsCount, activeDealsCount, hiddenDealsCount, allDealsData] = await Promise.all([
    prisma.dealPost.count(),
    prisma.dealPost.count({ where: { status: "active" } }),
    prisma.dealPost.count({ where: { status: "hidden" } }),
    prisma.dealPost.findMany({ select: { clicks: true } }),
  ]);
  const totalClicks = allDealsData.reduce((s, d) => s + d.clicks, 0);
  const avgClicks = allDealsCount > 0 ? Math.round(totalClicks / allDealsCount) : 0;

  const [deals, filteredCount] = await Promise.all([
    prisma.dealPost.findMany({ where, orderBy, skip, take: limit }),
    prisma.dealPost.count({ where }),
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
    uploadedImageUrl: d.uploadedImageUrl,
    shopeeImageUrl: d.shopeeImageUrl,
    affiliateUrl: d.affiliateUrl,
    shortUrl: d.shortUrl,
    status: d.status,
    clicks: d.clicks,
    createdAt: d.createdAt.toISOString(),
  }));

  const totalPages = Math.ceil(filteredCount / limit);

  return (
    <div className="flex flex-col gap-6 fade-in pb-8">

      {/* ── LUXURY HERO BANNER ── */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 border border-amber-200/60 shadow-lg shadow-amber-500/5 bg-gradient-to-br from-white via-[#FFF7ED] to-[#FFEDD5]">
        <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-gradient-to-br from-amber-200/30 to-orange-300/20 blur-xl" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6 flex-wrap">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 text-white flex items-center justify-center shadow-md shadow-amber-500/20 shrink-0 border border-white/40 overflow-hidden p-1">
              <img src="/meow-back-deals.png" alt="Deals Hot" className="w-full h-full object-contain rounded-2xl" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/80 border border-amber-200 text-[10px] font-black uppercase tracking-widest text-amber-700 shadow-xs mb-1.5">
                Hot Deals & Flash Sale Manager
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight text-neutral-900 tracking-tight">
                Quản Lý Deals Giảm Giá
              </h1>
              <p className="mt-1 text-xs text-neutral-600 font-medium">
                Đăng tin deal sản phẩm từ cộng đồng — <span className="font-bold text-amber-700">hệ thống tự động gắn mã tracking link affiliate</span>
              </p>
            </div>
          </div>
          <CreateDealForm />
        </div>
      </div>

      {/* ── STAT CARDS ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="group relative overflow-hidden rounded-3xl bg-white p-5 shadow-sm border border-neutral-200/70 hover:border-amber-200 transition-all duration-300 hover:-translate-y-0.5">
          <div className="relative flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 font-black text-xl shadow-xs shrink-0 group-hover:scale-105 transition-transform">
              <Tag size={20} strokeWidth={2.2} />
            </div>
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-widest text-neutral-400">Tổng Deals Đăng</div>
              <div className="text-xl font-black text-amber-600 tabular-nums leading-tight">{allDealsCount.toLocaleString()}</div>
            </div>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-white to-emerald-50/60 p-5 shadow-sm border border-emerald-200/70 hover:border-emerald-300 transition-all duration-300 hover:-translate-y-0.5">
          <div className="relative flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 font-black text-xl shadow-xs shrink-0 group-hover:scale-105 transition-transform">
              <Eye size={20} strokeWidth={2.2} />
            </div>
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-700/70">Đang Hiển Thị</div>
              <div className="text-xl font-black text-emerald-700 tabular-nums leading-tight">{activeDealsCount.toLocaleString()}</div>
            </div>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-3xl bg-white p-5 shadow-sm border border-neutral-200/70 hover:border-sky-200 transition-all duration-300 hover:-translate-y-0.5">
          <div className="relative flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 border border-sky-100 font-black text-xl shadow-xs shrink-0 group-hover:scale-105 transition-transform">
              <MousePointerClick size={20} strokeWidth={2.2} />
            </div>
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-widest text-neutral-400">Tổng Click</div>
              <div className="text-xl font-black text-sky-600 tabular-nums leading-tight">{totalClicks.toLocaleString()}</div>
            </div>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-3xl bg-white p-5 shadow-sm border border-neutral-200/70 hover:border-slate-300 transition-all duration-300 hover:-translate-y-0.5">
          <div className="relative flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 font-black text-xl shadow-xs shrink-0 group-hover:scale-105 transition-transform">
              <TrendingUp size={20} strokeWidth={2.2} />
            </div>
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-widest text-neutral-400">TB Click / Deal</div>
              <div className="text-xl font-black text-slate-700 tabular-nums leading-tight">{avgClicks.toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── DEAL LIST ── */}
      <div className="rounded-3xl bg-white shadow-sm border border-neutral-200/70 overflow-hidden">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-neutral-200/70 bg-gradient-to-r from-amber-50/50 to-white">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 text-amber-600 font-black">
              <Sparkles size={16} />
            </div>
            <h2 className="text-sm font-extrabold text-neutral-900 tracking-tight">Danh Sách Deals Đang Phát Sóng</h2>
          </div>
          <span className="text-xs font-extrabold text-neutral-500 bg-neutral-100 px-3 py-1 rounded-full">{allDealsCount} deals</span>
        </div>
        <div className="p-6">
          <AdminDealList
            initialDeals={formattedDeals}
            totalPages={totalPages}
            currentPage={page}
            totalItems={filteredCount}
            pageSize={limit}
          />
        </div>
      </div>
    </div>
  );
}

