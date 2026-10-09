import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/Button";
import { AdminOrdersClient } from "@/components/admin/AdminOrdersClient";
import { Upload, ShoppingCart, Wallet, Clock, HelpCircle } from "lucide-react";
import { formatCurrency } from "@/lib/format";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: {
    q?: string;
    page?: string;
    tab?: string;
    sort?: string;
    order?: string;
    period?: string;
    year?: string;
    month?: string;
    startDate?: string;
    endDate?: string;
  };
}) {
  const page = Number(searchParams.page) || 1;
  const limit = 10;
  const skip = (page - 1) * limit;
  const q = searchParams.q || "";
  const tab = searchParams.tab || "all";
  const period = searchParams.period || "all";
  const yearStr = searchParams.year;
  const monthStr = searchParams.month;
  const startDateStr = searchParams.startDate;
  const endDateStr = searchParams.endDate;

  // Lọc theo khoảng thời gian
  let dateStart: Date | null = null;
  let dateEnd: Date | null = null;
  const now = new Date();

  if (period === "today") {
    dateStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    dateEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  } else if (period === "week") {
    const day = now.getDay();
    const diffToMon = day === 0 ? -6 : 1 - day;
    dateStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diffToMon, 0, 0, 0, 0);
    dateEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diffToMon + 6, 23, 59, 59, 999);
  } else if (period === "month") {
    const targetYear = yearStr ? parseInt(yearStr) : now.getFullYear();
    const targetMonth = monthStr ? parseInt(monthStr) - 1 : now.getMonth();
    dateStart = new Date(targetYear, targetMonth, 1, 0, 0, 0, 0);
    dateEnd = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59, 999);
  } else if (period === "year") {
    const targetYear = yearStr ? parseInt(yearStr) : now.getFullYear();
    dateStart = new Date(targetYear, 0, 1, 0, 0, 0, 0);
    dateEnd = new Date(targetYear, 11, 31, 23, 59, 59, 999);
  } else if (period === "custom_range") {
    if (startDateStr) dateStart = new Date(`${startDateStr}T00:00:00`);
    if (endDateStr) dateEnd = new Date(`${endDateStr}T23:59:59.999`);
  }

  const andConditions: any[] = [];

  if (q) {
    andConditions.push({
      OR: [
        { orderExternalId: { contains: q, mode: "insensitive" } },
        { trackingCode: { contains: q, mode: "insensitive" } },
        { itemName: { contains: q, mode: "insensitive" } },
        { customer: { fullName: { contains: q, mode: "insensitive" } } },
        { customer: { customerCode: { contains: q, mode: "insensitive" } } },
        { customer: { user: { email: { contains: q, mode: "insensitive" } } } },
        { customer: { phone: { contains: q } } },
      ],
    });
  }

  if (dateStart || dateEnd) {
    andConditions.push({
      OR: [
        {
          orderedAt: {
            ...(dateStart ? { gte: dateStart } : {}),
            ...(dateEnd ? { lte: dateEnd } : {}),
          },
        },
        {
          orderedAt: null,
          createdAt: {
            ...(dateStart ? { gte: dateStart } : {}),
            ...(dateEnd ? { lte: dateEnd } : {}),
          },
        },
      ],
    });
  }

  const baseWhere: any = andConditions.length > 0 ? { AND: andConditions } : {};

  const where: any = { ...baseWhere };

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

  // Đơn đã huỷ/từ chối không tính vào tổng giá trị đơn (trừ phi đang lọc xem riêng tab Đã huỷ)
  const orderAmountWhere = tab === "cancelled"
    ? where
    : {
        ...where,
        orderStatus: where.orderStatus
          ? where.orderStatus
          : { notIn: ["cancelled", "rejected"] },
      };

  const [
    allCount, unassignedCount, assignedCount, pendingCount, processingCount, moneyInCount, unpaidCount, paidCount, cancelledCount, completedCount, clawbackCount, referralCount,
    orders, customers, filteredCount, orderAmountAgg, sumsAgg, moneyInSumAgg, unpaidSumAgg, activeRule,
  ] = await Promise.all([
    prisma.order.count({ where: baseWhere }),
    prisma.order.count({ where: { ...baseWhere, customerId: null } }),
    prisma.order.count({ where: { ...baseWhere, customerId: { not: null } } }),
    prisma.order.count({ where: { ...baseWhere, orderStatus: "pending" } }),
    prisma.order.count({ where: { ...baseWhere, orderStatus: "processing" } }),
    prisma.order.count({ where: { ...baseWhere, orderStatus: "approved" } }),
    prisma.order.count({ where: { ...baseWhere, orderStatus: "approved", payoutStatus: { not: "paid" } } }),
    prisma.order.count({ where: { ...baseWhere, payoutStatus: "paid" } }),
    prisma.order.count({ where: { ...baseWhere, orderStatus: { in: ["cancelled", "rejected"] } } }),
    prisma.order.count({ where: { ...baseWhere, orderStatus: "completed" } }),
    prisma.order.count({ where: { ...baseWhere, orderStatus: "clawback" } }),
    prisma.order.count({ where: { ...baseWhere, sourceType: "referral" } }),
    prisma.order.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        platform: true,
        trackingLink: {
          select: {
            productImage: true,
            productTitle: true,
          },
        },
        customer: {
          include: {
            referredBy: {
              include: {
                partnerRatePeriods: {
                  orderBy: { startsAt: "desc" },
                },
              },
            },
          },
        },
      },
    }),
    prisma.customer.findMany({
      include: {
        user: { select: { email: true } },
      },
      orderBy: { fullName: "asc" },
    }),
    prisma.order.count({ where }),
    prisma.order.aggregate({ where: orderAmountWhere, _sum: { orderAmount: true } }),
    prisma.order.aggregate({ where, _sum: { commissionAmount: true, customerRewardAmount: true, systemProfitAmount: true, referralBonusDeducted: true } }),
    prisma.order.aggregate({ where: { ...baseWhere, orderStatus: "approved" }, _sum: { customerRewardAmount: true } }),
    prisma.order.aggregate({ where: { ...baseWhere, orderStatus: "approved", payoutStatus: { not: "paid" } }, _sum: { customerRewardAmount: true } }),
    prisma.commissionRule.findFirst({
      where: { active: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  // Thu thập thêm ảnh sản phẩm từ TrackingLink nếu đơn chưa gắn trực tiếp trackingLinkId
  const lookupCodes = orders
    .map((o) => o.trackingCode || o.subId1)
    .filter((c): c is string => Boolean(c));

  const matchedTrackingLinks = lookupCodes.length > 0
    ? await prisma.trackingLink.findMany({
        where: {
          trackingCode: { in: lookupCodes },
          productImage: { not: null },
        },
        select: { trackingCode: true, productImage: true },
      })
    : [];

  const trackingImageMap = new Map(
    matchedTrackingLinks.map((l) => [l.trackingCode, l.productImage])
  );

  const defaultReferralRate = Number(activeRule?.referralRate ?? 0.05);

  const customerOptions = customers.map((c) => ({
    id: c.id,
    label: c.fullName,
    code: c.customerCode,
    email: c.user?.email ?? null,
    phone: c.phone ?? null,
    subLabel: [c.customerCode, c.user?.email, c.phone].filter(Boolean).join(" • "),
  }));

  const mappedOrders = orders.map((o) => {
    let referralInfo: {
      referrerName: string;
      referrerCode: string;
      isPartner: boolean;
      ratePercent: number;
      bonusAmount: number;
    } | null = null;

    if (o.sourceType === "referral") {
      referralInfo = {
        referrerName: o.customer?.fullName ?? "Người giới thiệu",
        referrerCode: o.customer?.customerCode ?? "",
        isPartner: o.customer?.isPartner ?? false,
        ratePercent: 5,
        bonusAmount: Number(o.customerRewardAmount),
      };
    } else if (o.customer?.referredBy) {
      const ref = o.customer.referredBy;
      const refDate = o.orderedAt ?? o.createdAt ?? new Date();
      let rateDecimal = defaultReferralRate;

      if (ref.isPartner) {
        const matchedPeriod = ref.partnerRatePeriods?.find((p) => {
          const s = new Date(p.startsAt);
          const e = p.endsAt ? new Date(p.endsAt) : null;
          return s <= refDate && (!e || e >= refDate);
        });
        if (matchedPeriod) {
          rateDecimal = Number(matchedPeriod.rate);
        }
      }

      const ratePercent = Math.round(rateDecimal * 100);
      let bonusAmount = Number(o.referralBonusDeducted);

      // Nếu đơn chưa ghi nhận số tiền trích (đang pending/processing)
      // thì tính dự kiến theo phần tiền sau thuế để admin tiện theo dõi
      if (bonusAmount <= 0 && o.orderStatus !== "cancelled" && o.orderStatus !== "rejected" && o.orderStatus !== "clawback") {
        const afterTax = Number(o.customerRewardAmount) + Number(o.systemProfitAmount);
        bonusAmount = Math.round(afterTax * rateDecimal);
      }

      referralInfo = {
        referrerName: ref.fullName,
        referrerCode: ref.customerCode,
        isPartner: ref.isPartner,
        ratePercent,
        bonusAmount,
      };
    }

    const productImage =
      o.trackingLink?.productImage ??
      (o.trackingCode ? trackingImageMap.get(o.trackingCode) : null) ??
      (o.subId1 ? trackingImageMap.get(o.subId1) : null) ??
      null;

    return {
      id: o.id,
      orderExternalId: o.orderExternalId,
      itemName: o.itemName,
      productImage,
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
      referralInfo,
      orderStatus: o.orderStatus,
      payoutStatus: o.payoutStatus,
      orderedAt: o.orderedAt?.toISOString() ?? null,
      completedAt: o.completedAt?.toISOString() ?? null,
      clawbackWarning: o.orderStatus === "completed" && o.completedAt
        ? (new Date().getTime() - new Date(o.completedAt).getTime()) > 15 * 24 * 60 * 60 * 1000
        : false,
    };
  });

  const totalPages = Math.ceil(filteredCount / limit);
  const counts = { all: allCount, unassigned: unassignedCount, assigned: assignedCount, pending: pendingCount, processing: processingCount, moneyIn: moneyInCount, unpaid: unpaidCount, paid: paidCount, cancelled: cancelledCount, completed: completedCount, clawback: clawbackCount, referral: referralCount };
  const sums = {
    orderAmount: Number(orderAmountAgg._sum.orderAmount ?? 0),
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
    <div className="flex flex-col gap-6 fade-in pb-8">

      {/* ── LUXURY HERO BANNER ── */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 border border-emerald-200/60 shadow-lg shadow-emerald-500/5 bg-gradient-to-br from-white via-[#F4FBF7] to-[#E6F8EE]">
        <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-gradient-to-br from-emerald-200/30 to-teal-300/20 blur-xl" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6 flex-wrap">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-br from-emerald-400 via-teal-500 to-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 shrink-0 border border-white/40 overflow-hidden p-1">
              <img src="/meow-back-orders.png" alt="Đơn hàng" className="w-full h-full object-contain rounded-2xl" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/80 border border-emerald-200 text-[10px] font-black uppercase tracking-widest text-emerald-700 shadow-xs mb-1.5">
                Đối Soát Đơn Hàng & Chi Trả
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight text-neutral-900 tracking-tight">
                Quản Lý Đơn Hàng Affiliate
              </h1>
              <p className="mt-1 text-xs text-neutral-600 font-medium">
                <span className="font-bold text-neutral-900">{allCount.toLocaleString()}</span> đơn hàng ghi nhận • Công nợ chưa trả khách:{" "}
                <span className="font-extrabold text-rose-600 tabular-nums">{formatCurrency(sums.unpaidTotal)}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── STAT CARDS ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="group relative overflow-hidden rounded-3xl bg-white p-5 shadow-sm border border-neutral-200/70 hover:border-slate-300 transition-all duration-300 hover:-translate-y-0.5">
          <div className="relative flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 font-black text-xl shadow-xs shrink-0 group-hover:scale-105 transition-transform">
              <ShoppingCart size={20} strokeWidth={2.2} />
            </div>
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-widest text-neutral-400">Tổng Đơn Hàng</div>
              <div className="text-xl font-black text-neutral-900 tabular-nums leading-tight">{allCount.toLocaleString()}</div>
            </div>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-white to-emerald-50/60 p-5 shadow-sm border border-emerald-200/70 hover:border-emerald-300 transition-all duration-300 hover:-translate-y-0.5">
          <div className="relative flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 font-black text-xl shadow-xs shrink-0 group-hover:scale-105 transition-transform">
              <Wallet size={20} strokeWidth={2.2} />
            </div>
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-700/70">Tiền Đã Về Ví</div>
              <div className="text-base font-black text-emerald-700 tabular-nums leading-tight">{formatCurrency(sums.moneyInTotal)}</div>
            </div>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-3xl bg-white p-5 shadow-sm border border-neutral-200/70 hover:border-amber-200 transition-all duration-300 hover:-translate-y-0.5">
          <div className="relative flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 font-black text-xl shadow-xs shrink-0 group-hover:scale-105 transition-transform">
              <Clock size={20} strokeWidth={2.2} />
            </div>
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-widest text-neutral-400">Chưa Trả Khách</div>
              <div className="text-xl font-black text-amber-600 tabular-nums leading-tight">{unpaidCount.toLocaleString()}</div>
            </div>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-3xl bg-white p-5 shadow-sm border border-neutral-200/70 hover:border-rose-200 transition-all duration-300 hover:-translate-y-0.5">
          <div className="relative flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 font-black text-xl shadow-xs shrink-0 group-hover:scale-105 transition-transform">
              <HelpCircle size={20} strokeWidth={2.2} />
            </div>
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-widest text-neutral-400">Chưa Map Khách</div>
              <div className="text-xl font-black text-rose-600 tabular-nums leading-tight">{unassignedCount.toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>

      <AdminOrdersClient
        orders={mappedOrders}
        customers={customerOptions}
        totalPages={totalPages}
        currentPage={page}
        totalItems={filteredCount}
        pageSize={limit}
        counts={counts}
        sums={sums}
      />
    </div>
  );
}

