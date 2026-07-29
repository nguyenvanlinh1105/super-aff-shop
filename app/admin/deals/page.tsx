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
    <div className="flex flex-col gap-lg fade-in">

      {/* ── HERO BANNER ── */}
      <div
        className="relative overflow-hidden rounded-3xl p-xl sm:p-2xl"
        style={{ background: "linear-gradient(135deg, #fff7ed 0%, #ffedd5 50%, #fef3c7 100%)" }}
      >
        <div className="pointer-events-none absolute -right-8 -top-8 h-36 w-36 rounded-full bg-[#fcd34d] opacity-25" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-40 w-40 rounded-full bg-[#fdba74] opacity-30" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-lg flex-wrap">
          <div className="flex items-center gap-lg">
            <img src="/meowback_lucky_cat_logo.png" alt="" className="h-20 w-20 object-contain drop-shadow-lg shrink-0" />
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-amber-500 mb-1">Hot Deals</p>
              <h1 className="text-[26px] sm:text-[30px] font-black leading-tight text-[#451a03]">Deals giảm giá</h1>
              <p className="mt-1 text-[13px] text-amber-600">
                Đăng deal từ các group —{" "}
                <span className="font-bold text-amber-700">hệ thống tự đổi sang link affiliate</span>
              </p>
            </div>
          </div>
          <CreateDealForm />
        </div>
      </div>

      {/* ── STAT CARDS ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-md">
        <div className="group relative overflow-hidden rounded-2xl bg-white p-lg shadow-sm ring-1 ring-black/[0.06] hover:-translate-y-1 hover:shadow-md transition-all">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-amber-50 opacity-70" />
          <div className="relative flex items-center gap-md">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100/90 text-amber-600 shadow-sm transition-transform group-hover:scale-110 shrink-0">
              <Tag size={24} strokeWidth={2.5} />
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Tổng deal</div>
              <div className="text-[26px] font-black text-[#e86a33] tabular-nums leading-tight">{allDealsCount}</div>
            </div>
          </div>
        </div>
        <div className="group relative overflow-hidden rounded-2xl p-lg shadow-sm ring-1 ring-black/[0.06] hover:-translate-y-1 hover:shadow-md transition-all"
          style={{ background: "linear-gradient(135deg,#e8f5e9,#f1fdf2)" }}>
          <div className="relative flex items-center gap-md">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100/90 text-emerald-600 shadow-sm transition-transform group-hover:scale-110 shrink-0">
              <Eye size={24} strokeWidth={2.5} />
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Đang hiện</div>
              <div className="text-[26px] font-black text-emerald-600 tabular-nums leading-tight">{activeDealsCount}</div>
            </div>
          </div>
        </div>
        <div className="group relative overflow-hidden rounded-2xl bg-white p-lg shadow-sm ring-1 ring-black/[0.06] hover:-translate-y-1 hover:shadow-md transition-all">
          <div className="absolute inset-0 bg-gradient-to-br from-sky-50 to-blue-50 opacity-60" />
          <div className="relative flex items-center gap-md">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100/90 text-sky-600 shadow-sm transition-transform group-hover:scale-110 shrink-0">
              <MousePointerClick size={24} strokeWidth={2.5} />
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-1">
                Tổng click
              </div>
              <div className="text-[22px] font-black text-sky-600 tabular-nums leading-tight">{totalClicks.toLocaleString()}</div>
            </div>
          </div>
        </div>
        <div className="group relative overflow-hidden rounded-2xl bg-white p-lg shadow-sm ring-1 ring-black/[0.06] hover:-translate-y-1 hover:shadow-md transition-all">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-slate-50 opacity-60" />
          <div className="relative flex items-center gap-md">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100/90 text-slate-600 shadow-sm transition-transform group-hover:scale-110 shrink-0">
              <TrendingUp size={24} strokeWidth={2.5} />
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">TB/deal</div>
              <div className="text-[22px] font-black text-gray-600 tabular-nums leading-tight">{avgClicks}</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── DEAL LIST ── */}
      <div className="rounded-3xl bg-white shadow-sm ring-1 ring-black/[0.06] overflow-hidden">
        <div className="flex items-center gap-sm px-xl pt-xl pb-lg border-b border-gray-100">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-500">
            <Sparkles size={18} />
          </div>
          <h2 className="text-[15px] font-bold text-gray-900">Danh sách Deals</h2>
          <span className="ml-auto text-[12px] font-semibold text-gray-400">{allDealsCount} deals</span>
        </div>
        <div className="p-lg">
          <AdminDealList initialDeals={formattedDeals} totalPages={totalPages} currentPage={page} />
        </div>
      </div>
    </div>
  );
}
