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

  const where: any = {};
  if (q) {
    where.OR = [
      { fullName: { contains: q } },
      { customerCode: { contains: q } },
      { phone: { contains: q } },
      { telegramUsername: { contains: q } },
    ];
  }
  if (tab === "active") where.status = "active";
  if (tab === "locked") where.status = { not: "active" };
  if (tab === "partner") where.isPartner = true;

  const orderByField = searchParams.sort || "createdAt";
  const orderByDir = searchParams.order || "desc";
  const orderBy = { [orderByField]: orderByDir };

  const [totalCount, activeCount, lockedCount, partnerCount] = await Promise.all([
    prisma.customer.count(),
    prisma.customer.count({ where: { status: "active" } }),
    prisma.customer.count({ where: { status: { not: "active" } } }),
    prisma.customer.count({ where: { isPartner: true } }),
  ]);

  const [customers, filteredCount] = await Promise.all([
    prisma.customer.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        _count: { select: { trackingLinks: true, orders: true } },
        orders: { select: { customerRewardAmount: true, payoutStatus: true } },
      },
    }),
    prisma.customer.count({ where }),
  ]);

  const rows = customers.map((c) => {
    const totalReward = c.orders.reduce((s, o) => s + Number(o.customerRewardAmount), 0);
    const debt = c.orders
      .filter((o) => o.payoutStatus !== "paid")
      .reduce((s, o) => s + Number(o.customerRewardAmount), 0);
    return {
      id: c.id,
      fullName: c.fullName,
      customerCode: c.customerCode,
      phone: c.phone,
      zaloUserId: c.zaloUserId,
      telegramUsername: c.telegramUsername,
      telegramUserId: c.telegramUserId,
      status: c.status,
      isPartner: c.isPartner,
      linkCount: c._count.trackingLinks,
      totalReward,
      debt,
    };
  });

  const totalPages = Math.ceil(filteredCount / limit);

  return (
    <div className="flex flex-col gap-lg fade-in">

      {/* ── HERO BANNER ── */}
      <div
        className="relative overflow-hidden rounded-3xl p-xl sm:p-2xl"
        style={{ background: "linear-gradient(135deg, #fff3ee 0%, #fde8d8 50%, #ffecd2 100%)" }}
      >
        <div className="pointer-events-none absolute -right-8 -top-8 h-36 w-36 rounded-full bg-[#ffcba4] opacity-30" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-40 w-40 rounded-full bg-[#ffe0cc] opacity-40" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-lg flex-wrap">
          <div className="flex items-center gap-lg">
            <img src="/meowback_lucky_cat_logo.png" alt="MeowBack" className="h-20 w-20 object-contain drop-shadow-lg shrink-0" />
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-[#e86a33]/60 mb-1">Quản lý hệ thống</p>
              <h1 className="text-[26px] sm:text-[30px] font-black leading-tight text-[#2d1f14]">
                Khách hàng
              </h1>
              <p className="mt-1 text-[13px] text-[#a0816a]">
                <span className="font-bold text-[#e86a33]">{activeCount}</span> đang hoạt động •{" "}
                <span className="font-bold">{totalCount}</span> tổng cộng
              </p>
            </div>
          </div>
          <CreateCustomerForm />
        </div>
      </div>

      {/* ── STAT CARDS ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-md">
        <div className="group relative overflow-hidden rounded-2xl bg-white p-lg shadow-sm ring-1 ring-black/[0.06] hover:-translate-y-1 hover:shadow-md transition-all">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-sky-50 opacity-60" />
          <div className="relative flex items-center gap-md">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100/90 text-blue-600 shadow-sm transition-transform group-hover:scale-110 shrink-0">
              <Users size={24} strokeWidth={2.5} />
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Tổng khách</div>
              <div className="text-[26px] font-black text-gray-900 tabular-nums leading-tight">{totalCount}</div>
            </div>
          </div>
        </div>
        <div className="group relative overflow-hidden rounded-2xl p-lg shadow-sm ring-1 ring-black/[0.06] hover:-translate-y-1 hover:shadow-md transition-all"
          style={{ background: "linear-gradient(135deg,#e8f5e9,#f1fdf2)" }}>
          <div className="relative flex items-center gap-md">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100/90 text-emerald-600 shadow-sm transition-transform group-hover:scale-110 shrink-0">
              <UserCheck size={24} strokeWidth={2.5} />
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Hoạt động</div>
              <div className="text-[26px] font-black text-emerald-600 tabular-nums leading-tight">{activeCount}</div>
            </div>
          </div>
        </div>
        <div className="group relative overflow-hidden rounded-2xl bg-white p-lg shadow-sm ring-1 ring-black/[0.06] hover:-translate-y-1 hover:shadow-md transition-all col-span-2 sm:col-span-1">
          <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-rose-50 opacity-60" />
          <div className="relative flex items-center gap-md">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100/90 text-rose-600 shadow-sm transition-transform group-hover:scale-110 shrink-0">
              <UserX size={24} strokeWidth={2.5} />
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Bị khoá</div>
              <div className="text-[26px] font-black text-red-500 tabular-nums leading-tight">{lockedCount}</div>
            </div>
          </div>
        </div>
      </div>

      <AdminCustomersClient
        customers={rows}
        totalPages={totalPages}
        currentPage={page}
        counts={{ all: totalCount, active: activeCount, locked: lockedCount, debt: 0, partner: partnerCount }}
      />
    </div>
  );
}
