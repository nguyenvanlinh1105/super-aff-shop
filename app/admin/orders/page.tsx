import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/Button";
import { AdminOrdersClient } from "@/components/admin/AdminOrdersClient";
import { Upload, ShoppingCart, Wallet, Clock, HelpCircle } from "lucide-react";
import { formatCurrency } from "@/lib/format";

export default async function AdminOrdersPage({ searchParams }: { searchParams: { q?: string; page?: string; tab?: string; sort?: string; order?: string } }) {
  const page = Number(searchParams.page) || 1;
  const limit = 50;
  const skip = (page - 1) * limit;
  const q = searchParams.q || "";
  const tab = searchParams.tab || "all";

  const where: any = {};
  if (q) {
    where.OR = [
      { orderExternalId: { contains: q } },
      { trackingCode: { contains: q } },
      { itemName: { contains: q } },
      { customer: { fullName: { contains: q } } },
    ];
  }

  if (tab === "unassigned") where.customerId = null;
  if (tab === "assigned") where.customerId = { not: null };
  if (tab === "pending") where.orderStatus = "pending";
  if (tab === "processing") where.orderStatus = "processing";
  if (tab === "money_in") where.orderStatus = "approved";
  if (tab === "unpaid") { where.orderStatus = "approved"; where.payoutStatus = { not: "paid" }; }
  if (tab === "paid") where.payoutStatus = "paid";
  if (tab === "cancelled") where.orderStatus = { in: ["cancelled", "rejected"] };
  if (tab === "completed") where.orderStatus = "completed";
  if (tab === "clawback") where.orderStatus = "clawback";
  if (tab === "referral") where.sourceType = "referral";

  const orderByField = searchParams.sort || "createdAt";
  const orderByDir = searchParams.order || "desc";
  const orderBy = { [orderByField]: orderByDir };

  const [
    allCount, unassignedCount, assignedCount, pendingCount, processingCount, moneyInCount, unpaidCount, paidCount, cancelledCount, completedCount, clawbackCount, referralCount,
    orders, customers, filteredCount, sumsAgg, moneyInSumAgg, unpaidSumAgg,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { customerId: null } }),
    prisma.order.count({ where: { customerId: { not: null } } }),
    prisma.order.count({ where: { orderStatus: "pending" } }),
    prisma.order.count({ where: { orderStatus: "processing" } }),
    prisma.order.count({ where: { orderStatus: "approved" } }),
    prisma.order.count({ where: { orderStatus: "approved", payoutStatus: { not: "paid" } } }),
    prisma.order.count({ where: { payoutStatus: "paid" } }),
    prisma.order.count({ where: { orderStatus: { in: ["cancelled", "rejected"] } } }),
    prisma.order.count({ where: { orderStatus: "completed" } }),
    prisma.order.count({ where: { orderStatus: "clawback" } }),
    prisma.order.count({ where: { sourceType: "referral" } }),
    prisma.order.findMany({ where, orderBy, skip, take: limit, include: { platform: true, customer: true } }),
    prisma.customer.findMany({ orderBy: { fullName: "asc" } }),
    prisma.order.count({ where }),
    prisma.order.aggregate({ where, _sum: { orderAmount: true, commissionAmount: true, customerRewardAmount: true, systemProfitAmount: true, referralBonusDeducted: true } }),
    prisma.order.aggregate({ where: { orderStatus: "approved" }, _sum: { customerRewardAmount: true } }),
    prisma.order.aggregate({ where: { orderStatus: "approved", payoutStatus: { not: "paid" } }, _sum: { customerRewardAmount: true } }),
  ]);

  const customerOptions = customers.map((c) => ({ id: c.id, label: `${c.fullName} (${c.customerCode})` }));

  const mappedOrders = orders.map((o) => ({
    id: o.id,
    orderExternalId: o.orderExternalId,
    itemName: o.itemName,
    platformName: o.platform.name,
    customerName: o.customer?.fullName ?? null,
    customerId: o.customerId,
    trackingCode: o.trackingCode,
    sourceType: o.sourceType,
    orderAmount: Number(o.orderAmount ?? 0),
    commissionAmount: Number(o.commissionAmount),
    customerRewardAmount: Number(o.customerRewardAmount),
    systemProfitAmount: Number(o.systemProfitAmount),
    referralBonusDeducted: Number(o.referralBonusDeducted),
    orderStatus: o.orderStatus,
    payoutStatus: o.payoutStatus,
    orderedAt: o.orderedAt?.toISOString() ?? null,
    completedAt: o.completedAt?.toISOString() ?? null,
    clawbackWarning: o.orderStatus === "completed" && o.completedAt
      ? (new Date().getTime() - new Date(o.completedAt).getTime()) > 15 * 24 * 60 * 60 * 1000
      : false,
  }));

  const totalPages = Math.ceil(filteredCount / limit);
  const counts = { all: allCount, unassigned: unassignedCount, assigned: assignedCount, pending: pendingCount, processing: processingCount, moneyIn: moneyInCount, unpaid: unpaidCount, paid: paidCount, cancelled: cancelledCount, completed: completedCount, clawback: clawbackCount, referral: referralCount };
  const sums = {
    orderAmount: Number(sumsAgg._sum.orderAmount ?? 0),
    commissionAmount: Number(sumsAgg._sum.commissionAmount ?? 0),
    customerRewardAmount: Number(sumsAgg._sum.customerRewardAmount ?? 0),
    systemProfitAmount: Number(sumsAgg._sum.systemProfitAmount ?? 0),
    referralBonusDeductedTotal: Number(sumsAgg._sum.referralBonusDeducted ?? 0),
    moneyInTotal: Number(moneyInSumAgg._sum.customerRewardAmount ?? 0),
    // "Công nợ chưa trả" thật sự — approved nhưng CHƯA trả khách, khác với
    // moneyInTotal (đã bao gồm cả phần đã trả khách rồi — dùng nhầm chỗ này
    // trước đây khiến banner luôn hiện đúng số "tiền đã về" thay vì "còn nợ").
    unpaidTotal: Number(unpaidSumAgg._sum.customerRewardAmount ?? 0),
  };

  return (
    <div className="flex flex-col gap-lg fade-in">

      {/* ── HERO BANNER ── */}
      <div
        className="relative overflow-hidden rounded-3xl p-xl sm:p-2xl"
        style={{ background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 50%, #d1fae5 100%)" }}
      >
        <div className="pointer-events-none absolute -right-8 -top-8 h-36 w-36 rounded-full bg-[#6ee7b7] opacity-25" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-40 w-40 rounded-full bg-[#a7f3d0] opacity-35" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-lg flex-wrap">
          <div className="flex items-center gap-lg">
            <img src="/meowback_lucky_cat_logo.png" alt="" className="h-20 w-20 object-contain drop-shadow-lg shrink-0" />
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-500 mb-1">Quản lý đối soát</p>
              <h1 className="text-[26px] sm:text-[30px] font-black leading-tight text-[#064e3b]">Đơn hàng</h1>
              <p className="mt-1 text-[13px] text-emerald-600">
                <span className="font-bold text-emerald-700">{allCount.toLocaleString()}</span> đơn •{" "}
                Công nợ chưa trả:{" "}
                <span className="font-bold text-[#e86a33]">{formatCurrency(sums.unpaidTotal)}</span>
              </p>
            </div>
          </div>
          <Link href="/admin/orders/import">
            <Button variant="primary" size="md">
              <Upload size={16} strokeWidth={2} />
              Import đối soát
            </Button>
          </Link>
        </div>
      </div>

      {/* ── STAT CARDS ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-md">
        <div className="group relative overflow-hidden rounded-2xl bg-white p-lg shadow-sm ring-1 ring-black/[0.06] hover:-translate-y-1 hover:shadow-md transition-all">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-slate-50 opacity-60" />
          <div className="relative flex items-center gap-md">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 shadow-sm transition-transform group-hover:scale-110 shrink-0">
              <ShoppingCart size={22} strokeWidth={2.5} />
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Tổng đơn</div>
              <div className="text-[24px] font-black text-gray-900 tabular-nums leading-tight">{allCount.toLocaleString()}</div>
            </div>
          </div>
        </div>
        <div className="group relative overflow-hidden rounded-2xl p-lg shadow-sm ring-1 ring-black/[0.06] hover:-translate-y-1 hover:shadow-md transition-all"
          style={{ background: "linear-gradient(135deg,#e8f5e9,#f1fdf2)" }}>
          <div className="relative flex items-center gap-md">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 shadow-sm transition-transform group-hover:scale-110 shrink-0">
              <Wallet size={22} strokeWidth={2.5} />
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Tiền đã về</div>
              <div className="text-[16px] font-black text-emerald-600 tabular-nums leading-tight">{formatCurrency(sums.moneyInTotal)}</div>
            </div>
          </div>
        </div>
        <div className="group relative overflow-hidden rounded-2xl bg-white p-lg shadow-sm ring-1 ring-black/[0.06] hover:-translate-y-1 hover:shadow-md transition-all">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-orange-50 opacity-60" />
          <div className="relative flex items-center gap-md">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 shadow-sm transition-transform group-hover:scale-110 shrink-0">
              <Clock size={22} strokeWidth={2.5} />
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Chưa trả</div>
              <div className="text-[24px] font-black text-[#e86a33] tabular-nums leading-tight">{unpaidCount}</div>
            </div>
          </div>
        </div>
        <div className="group relative overflow-hidden rounded-2xl bg-white p-lg shadow-sm ring-1 ring-black/[0.06] hover:-translate-y-1 hover:shadow-md transition-all">
          <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-rose-50 opacity-60" />
          <div className="relative flex items-center gap-md">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 shadow-sm transition-transform group-hover:scale-110 shrink-0">
              <HelpCircle size={22} strokeWidth={2.5} />
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Chưa map</div>
              <div className="text-[24px] font-black text-red-500 tabular-nums leading-tight">{unassignedCount}</div>
            </div>
          </div>
        </div>
      </div>

      <AdminOrdersClient
        orders={mappedOrders}
        customers={customerOptions}
        totalPages={totalPages}
        currentPage={page}
        counts={counts}
        sums={sums}
      />
    </div>
  );
}
