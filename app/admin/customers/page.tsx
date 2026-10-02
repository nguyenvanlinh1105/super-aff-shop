import { prisma } from "@/lib/prisma";
import { CreateCustomerForm } from "@/components/admin/CreateCustomerForm";
import { AdminCustomersClient } from "@/components/admin/AdminCustomersClient";
import { Users, UserCheck, UserX } from "lucide-react";

export default async function AdminCustomersPage({ searchParams }: { searchParams: { q?: string; page?: string; tab?: string; sort?: string; order?: string } }) {
  const page = Number(searchParams.page) || 1;
  const limit = 10;
  const skip = (page - 1) * limit;
  const q = searchParams.q || "";
  const tab = searchParams.tab || "all";
  const sortBy = searchParams.sort || "createdAt";
  const sortOrder = searchParams.order === "asc" ? "asc" : "desc";

  const where: any = {};
  if (q) {
    where.OR = [
      { fullName: { contains: q, mode: "insensitive" } },
      { customerCode: { contains: q, mode: "insensitive" } },
      { phone: { contains: q } },
      { telegramUsername: { contains: q, mode: "insensitive" } },
      { user: { email: { contains: q, mode: "insensitive" } } },
    ];
  }
  if (tab === "active") where.status = "active";
  if (tab === "locked") where.status = { not: "active" };
  if (tab === "partner") where.isPartner = true;
  if (tab === "debt") {
    where.orders = {
      some: {
        payoutStatus: { not: "paid" },
        customerRewardAmount: { gt: 0 },
      },
    };
  }

  const [totalCount, activeCount, lockedCount, partnerCount, debtCount] = await Promise.all([
    prisma.customer.count(),
    prisma.customer.count({ where: { status: "active" } }),
    prisma.customer.count({ where: { status: { not: "active" } } }),
    prisma.customer.count({ where: { isPartner: true } }),
    prisma.customer.count({
      where: {
        orders: {
          some: {
            payoutStatus: { not: "paid" },
            customerRewardAmount: { gt: 0 },
          },
        },
      },
    }),
  ]);

  // Fetch all matching customers to calculate rewards, debt, and link count
  const allMatching = await prisma.customer.findMany({
    where,
    include: {
      _count: { select: { trackingLinks: true, orders: true } },
      orders: { select: { customerRewardAmount: true, payoutStatus: true } },
      user: { select: { email: true, createdAt: true } },
      referredBy: { select: { id: true, fullName: true, customerCode: true } },
    },
  });

  const computedList = allMatching.map((c) => {
    const totalReward = c.orders.reduce((s, o) => s + Number(o.customerRewardAmount), 0);
    const debt = c.orders
      .filter((o) => o.payoutStatus !== "paid")
      .reduce((s, o) => s + Number(o.customerRewardAmount), 0);
    return {
      id: c.id,
      fullName: c.fullName,
      customerCode: c.customerCode,
      email: c.user?.email || null,
      phone: c.phone,
      zaloUserId: c.zaloUserId,
      telegramUsername: c.telegramUsername,
      telegramUserId: c.telegramUserId,
      status: c.status,
      isPartner: c.isPartner,
      linkCount: c._count.trackingLinks,
      totalReward,
      debt,
      createdAt: c.createdAt.toISOString(),
      registeredAt: (c.user?.createdAt || c.createdAt).toISOString(),
      referredBy: c.referredBy ? {
        id: c.referredBy.id,
        fullName: c.referredBy.fullName,
        customerCode: c.referredBy.customerCode,
      } : null,
    };
  });

  // Sắp xếp dữ liệu theo tiêu chí (reward, debt, link, name, createdAt) và chiều tăng/giảm (asc/desc)
  computedList.sort((a, b) => {
    if (sortBy === "reward") {
      return sortOrder === "asc" ? a.totalReward - b.totalReward : b.totalReward - a.totalReward;
    }
    if (sortBy === "debt") {
      return sortOrder === "asc" ? a.debt - b.debt : b.debt - a.debt;
    }
    if (sortBy === "link") {
      return sortOrder === "asc" ? a.linkCount - b.linkCount : b.linkCount - a.linkCount;
    }
    if (sortBy === "name" || sortBy === "fullName") {
      return sortOrder === "asc"
        ? a.fullName.localeCompare(b.fullName, "vi")
        : b.fullName.localeCompare(a.fullName, "vi");
    }
    if (sortBy === "customerCode") {
      return sortOrder === "asc"
        ? a.customerCode.localeCompare(b.customerCode)
        : b.customerCode.localeCompare(a.customerCode);
    }
    // Mặc định sắp xếp theo ngày tạo (createdAt)
    return sortOrder === "asc"
      ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const filteredCount = computedList.length;
  const rows = computedList.slice(skip, skip + limit);
  const totalPages = Math.ceil(filteredCount / limit);

  return (
    <div className="flex flex-col gap-6 fade-in pb-8">

      {/* ── LUXURY HERO BANNER ── */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 border border-rose-200/60 shadow-lg shadow-rose-500/5 bg-gradient-to-br from-white via-[#FFF5F8] to-[#FFE8F0]">
        <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-gradient-to-br from-rose-200/30 to-pink-300/20 blur-xl" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6 flex-wrap">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-br from-rose-400 via-pink-500 to-rose-600 text-white flex items-center justify-center shadow-md shadow-rose-500/20 shrink-0 border border-white/40 overflow-hidden p-1">
              <img src="/meow-back-customers.png" alt="Khách hàng" className="w-full h-full object-contain rounded-2xl" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/80 border border-rose-200 text-[10px] font-black uppercase tracking-widest text-rose-600 shadow-xs mb-1.5">
                Quản Lý Tài Khoản
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight text-neutral-900 tracking-tight">
                Danh Sách Khách Hàng
              </h1>
              <p className="mt-1 text-xs text-neutral-600 font-medium">
                <span className="font-bold text-rose-600">{activeCount.toLocaleString()}</span> tài khoản đang hoạt động •{" "}
                <span className="font-bold text-neutral-800">{totalCount.toLocaleString()}</span> tổng tài khoản
              </p>
            </div>
          </div>
          <CreateCustomerForm />
        </div>
      </div>

      {/* ── STAT CARDS ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="group relative overflow-hidden rounded-3xl bg-white p-5 shadow-sm border border-neutral-200/70 hover:border-sky-200 transition-all duration-300 hover:-translate-y-0.5">
          <div className="relative flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 border border-sky-100 font-black text-xl shadow-xs shrink-0 group-hover:scale-105 transition-transform">
              <Users size={22} strokeWidth={2.2} />
            </div>
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-widest text-neutral-400">Tổng Khách Hàng</div>
              <div className="text-2xl font-black text-neutral-900 tabular-nums leading-tight">{totalCount.toLocaleString()}</div>
            </div>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-3xl bg-white p-5 shadow-sm border border-neutral-200/70 hover:border-emerald-200 transition-all duration-300 hover:-translate-y-0.5">
          <div className="relative flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 font-black text-xl shadow-xs shrink-0 group-hover:scale-105 transition-transform">
              <UserCheck size={22} strokeWidth={2.2} />
            </div>
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-widest text-neutral-400">Đang Hoạt Động</div>
              <div className="text-2xl font-black text-emerald-600 tabular-nums leading-tight">{activeCount.toLocaleString()}</div>
            </div>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-3xl bg-white p-5 shadow-sm border border-neutral-200/70 hover:border-rose-200 transition-all duration-300 hover:-translate-y-0.5 col-span-2 sm:col-span-1">
          <div className="relative flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 font-black text-xl shadow-xs shrink-0 group-hover:scale-105 transition-transform">
              <UserX size={22} strokeWidth={2.2} />
            </div>
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-widest text-neutral-400">Bị Tạm Khoá</div>
              <div className="text-2xl font-black text-rose-600 tabular-nums leading-tight">{lockedCount.toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>

      <AdminCustomersClient
        customers={rows}
        totalPages={totalPages}
        currentPage={page}
        totalItems={filteredCount}
        pageSize={limit}
        counts={{ all: totalCount, active: activeCount, locked: lockedCount, debt: debtCount, partner: partnerCount }}
      />
    </div>
  );
}

