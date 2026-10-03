import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { MousePointerClick, Tag, Eye, Clock, Sparkles, AlertTriangle } from "lucide-react";
import { CreateDealForm } from "@/components/admin/CreateDealForm";
import { AdminDealList } from "@/components/admin/AdminDealList";

function getDateBounds(period: string, startDate?: string, endDate?: string) {
  const now = new Date();
  if (period === "today") {
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    return { gte: start, lte: end };
  }
  if (period === "yesterday") {
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const start = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 0, 0, 0, 0);
    const end = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 23, 59, 59, 999);
    return { gte: start, lte: end };
  }
  if (period === "last_7_days") {
    const start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return { gte: start, lte: now };
  }
  if (period === "last_30_days") {
    const start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    return { gte: start, lte: now };
  }
  if (period === "custom_range" && (startDate || endDate)) {
    const bounds: { gte?: Date; lte?: Date } = {};
    if (startDate) {
      const [y, m, d] = startDate.split("-").map(Number);
      bounds.gte = new Date(y, m - 1, d, 0, 0, 0, 0);
    }
    if (endDate) {
      const [y, m, d] = endDate.split("-").map(Number);
      bounds.lte = new Date(y, m - 1, d, 23, 59, 59, 999);
    }
    return bounds;
  }
  return null;
}

export default async function AdminDealsPage({
  searchParams,
}: {
  searchParams: {
    q?: string;
    tab?: string;
    status?: string;
    period?: string;
    dateField?: string;
    startDate?: string;
    endDate?: string;
    category?: string;
    page?: string;
    limit?: string;
    sort?: string;
    order?: string;
  };
}) {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/login");

  const page = Math.max(1, Number(searchParams.page) || 1);
  const limit = Math.max(5, Math.min(100, Number(searchParams.limit) || 10));
  const skip = (page - 1) * limit;
  const q = searchParams.q?.trim() || "";
  const tab = searchParams.tab || "active"; // "active" | "history" | "all"
  const status = searchParams.status || "all";
  const period = searchParams.period || "all";
  const dateField = searchParams.dateField === "createdAt" ? "createdAt" : "expiresAt";
  const startDate = searchParams.startDate || "";
  const endDate = searchParams.endDate || "";
  const category = searchParams.category || "";

  const now = new Date();

  // Đếm tổng số cho các tab và stat cards
  const [
    allDealsCount,
    activeDealsCount,
    historyDealsCount,
    expiredDealsCount,
    allDealsData,
  ] = await Promise.all([
    prisma.dealPost.count(),
    prisma.dealPost.count({
      where: {
        status: "active",
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
      },
    }),
    prisma.dealPost.count({
      where: {
        OR: [
          { status: "hidden" },
          { AND: [{ expiresAt: { not: null } }, { expiresAt: { lte: now } }] },
        ],
      },
    }),
    prisma.dealPost.count({
      where: {
        AND: [{ expiresAt: { not: null } }, { expiresAt: { lte: now } }],
      },
    }),
    prisma.dealPost.findMany({ select: { clicks: true } }),
  ]);

  const totalClicks = allDealsData.reduce((s, d) => s + d.clicks, 0);
  const avgClicks = allDealsCount > 0 ? Math.round(totalClicks / allDealsCount) : 0;

  // Xây dựng điều kiện lọc chính
  const andClauses: any[] = [];

  // Tìm kiếm từ khóa
  if (q) {
    andClauses.push({
      OR: [
        { title: { contains: q } },
        { description: { contains: q } },
        { shortCode: { contains: q } },
      ],
    });
  }

  // Danh mục
  if (category) {
    andClauses.push({ category });
  }

  // Phân loại theo Tab:
  // Tab "active" (Đang phát sóng): status === "active" VÀ (chưa hết hạn hoặc không có ngày hết hạn)
  // Tab "history" (Lịch sử / Đã hết hạn): đã hết hạn (expiresAt <= now) HOẶC đã ẩn (status === "hidden")
  // Tab "all": tất cả deal
  if (tab === "active") {
    andClauses.push({
      status: "active",
      OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
    });
  } else if (tab === "history") {
    andClauses.push({
      OR: [
        { status: "hidden" },
        { AND: [{ expiresAt: { not: null } }, { expiresAt: { lte: now } }] },
      ],
    });
  }

  // Lọc theo Trạng Thái chi tiết (nếu có chọn)
  if (status === "active") {
    andClauses.push({
      status: "active",
      OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
    });
  } else if (status === "hidden") {
    andClauses.push({ status: "hidden" });
  } else if (status === "expired") {
    andClauses.push({
      expiresAt: { not: null, lte: now },
    });
  } else if (status === "expiring_soon") {
    const next24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    andClauses.push({
      expiresAt: { gt: now, lte: next24h },
    });
  }

  // Lọc theo Thời Gian (Hôm nay, Hôm qua, Khoảng ngày...)
  const dateBounds = getDateBounds(period, startDate, endDate);
  if (dateBounds) {
    andClauses.push({
      [dateField]: dateBounds,
    });
  }

  const where = andClauses.length > 0 ? { AND: andClauses } : {};

  const orderByField = searchParams.sort || (tab === "history" ? "expiresAt" : "createdAt");
  const orderByDir = (searchParams.order as "asc" | "desc") || "desc";
  const orderBy = { [orderByField]: orderByDir };

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
    <div className="flex flex-col gap-6 fade-in pb-12">
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
                Hot Deals &amp; Flash Sale Manager
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight text-neutral-900 tracking-tight">
                Quản Lý Deals Giảm Giá
              </h1>
              <p className="mt-1 text-xs text-neutral-600 font-medium">
                Đăng tin deal sản phẩm từ cộng đồng —{" "}
                <span className="font-bold text-amber-700">hệ thống tự động gắn mã tracking link affiliate</span>
              </p>
            </div>
          </div>
          <CreateDealForm />
        </div>
      </div>

      {/* ── STAT CARDS ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Tổng deals */}
        <div className="group relative overflow-hidden rounded-3xl bg-white p-5 shadow-sm border border-neutral-200/70 hover:border-amber-200 transition-all duration-300 hover:-translate-y-0.5">
          <div className="relative flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 font-black text-xl shadow-xs shrink-0 group-hover:scale-105 transition-transform">
              <Tag size={20} strokeWidth={2.2} />
            </div>
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-widest text-neutral-400">Tổng Deals Đăng</div>
              <div className="text-xl font-black text-amber-600 tabular-nums leading-tight">
                {allDealsCount.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Đang phát sóng (còn hạn) */}
        <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-white to-emerald-50/60 p-5 shadow-sm border border-emerald-200/70 hover:border-emerald-300 transition-all duration-300 hover:-translate-y-0.5">
          <div className="relative flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 font-black text-xl shadow-xs shrink-0 group-hover:scale-105 transition-transform">
              <Eye size={20} strokeWidth={2.2} />
            </div>
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-700/70">
                Đang Phát Sóng
              </div>
              <div className="text-xl font-black text-emerald-700 tabular-nums leading-tight">
                {activeDealsCount.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Lịch sử / Đã hết hạn */}
        <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-white to-rose-50/50 p-5 shadow-sm border border-rose-200/70 hover:border-rose-300 transition-all duration-300 hover:-translate-y-0.5">
          <div className="relative flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-100 text-rose-700 font-black text-xl shadow-xs shrink-0 group-hover:scale-105 transition-transform">
              <Clock size={20} strokeWidth={2.2} />
            </div>
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-widest text-rose-700/70">
                Lịch Sử / Hết Hạn
              </div>
              <div className="text-xl font-black text-rose-700 tabular-nums leading-tight">
                {historyDealsCount.toLocaleString()}{" "}
                <span className="text-xs font-semibold text-rose-500/80">({expiredDealsCount} hết hạn)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tổng click */}
        <div className="group relative overflow-hidden rounded-3xl bg-white p-5 shadow-sm border border-neutral-200/70 hover:border-sky-200 transition-all duration-300 hover:-translate-y-0.5">
          <div className="relative flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 border border-sky-100 font-black text-xl shadow-xs shrink-0 group-hover:scale-105 transition-transform">
              <MousePointerClick size={20} strokeWidth={2.2} />
            </div>
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-widest text-neutral-400">Tổng Click</div>
              <div className="text-xl font-black text-sky-600 tabular-nums leading-tight">
                {totalClicks.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── DEAL LIST VỚI TABS, BỘ LỌC VÀ PHÂN TRANG ĐẦY ĐỦ ── */}
      <div className="rounded-3xl bg-white shadow-sm border border-neutral-200/70 overflow-hidden">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-neutral-200/70 bg-gradient-to-r from-amber-50/50 via-white to-amber-50/30">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 text-amber-600 font-black">
              <Sparkles size={16} />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-neutral-900 tracking-tight">
                {tab === "active"
                  ? "Danh Sách Deals Đang Phát Sóng (Còn Hạn)"
                  : tab === "history"
                  ? "Lịch Sử Deals (Đã Hết Hạn & Đã Ẩn)"
                  : "Tất Cả Deals Trên Hệ Thống"}
              </h2>
              <p className="text-[11px] text-neutral-500 font-medium">
                {tab === "active"
                  ? "Deals tự động chuyển sang tab Lịch sử ngay khi hết hạn."
                  : tab === "history"
                  ? "Lưu trữ toàn bộ deals đã quá thời gian phát sóng hoặc bị ẩn."
                  : "Toàn bộ deals không phân biệt trạng thái hạn."}
              </p>
            </div>
          </div>
          <span className="text-xs font-extrabold text-neutral-600 bg-neutral-100 px-3 py-1 rounded-full border border-neutral-200">
            {filteredCount} kết quả
          </span>
        </div>

        <div className="p-5 sm:p-6">
          <AdminDealList
            initialDeals={formattedDeals}
            totalPages={totalPages}
            currentPage={page}
            totalItems={filteredCount}
            pageSize={limit}
            tabCounts={{
              active: activeDealsCount,
              history: historyDealsCount,
              all: allDealsCount,
            }}
            currentTab={tab as "active" | "history" | "all"}
            currentStatus={status}
            currentPeriod={period}
            currentDateField={dateField}
            currentStartDate={startDate}
            currentEndDate={endDate}
            currentCategory={category}
            currentQuery={q}
          />
        </div>
      </div>
    </div>
  );
}
