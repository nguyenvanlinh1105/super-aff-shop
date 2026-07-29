import { prisma } from "@/lib/prisma";
import { formatDate, formatCurrency } from "@/lib/format";
import { AdminPaymentsClient } from "@/components/admin/AdminPaymentsClient";
import { Clock, Receipt, CheckCircle2, Hourglass } from "lucide-react";

export default async function AdminPaymentsPage() {
  const [
    pendingOrders,   // approved + unpaid, CHỈ của khách đã chủ động gửi yêu cầu rút tiền
    waitingOrders,   // pending (affiliate chưa xác nhận) → chưa được tạo phiếu
    batches,
    paidAgg,
    batchPendingCount,
    withdrawRequests,
    allCustomers,    // toàn bộ khách — để admin chủ động chọn tạo phiếu, không chỉ ai đã gửi yêu cầu
  ] = await Promise.all([
    // ✅ Đơn ĐỦ ĐIỀU KIỆN: Shopee đã xác nhận hoa hồng (orderStatus=approved) + chưa thanh toán
    // + khách đang có 1 yêu cầu rút tiền "pending" — admin KHÔNG tự động thấy toàn bộ
    // khách có số dư, chỉ thấy ai đã chủ động yêu cầu, để dễ quản lý hơn.
    prisma.order.findMany({
      where: {
        payoutStatus: "unpaid",
        orderStatus: "approved",
        customer: { withdrawRequests: { some: { status: "pending" } } },
      },
      include: { customer: true },
    }),
    // ⏳ Đơn CHƯA ĐỦ điều kiện: tiếp thị liên kết chưa hoàn thành (orderStatus=pending)
    prisma.order.findMany({
      where: { payoutStatus: "unpaid", orderStatus: "pending" },
      include: {
        customer: true,
        platform: { select: { name: true, code: true } },
        trackingLink: { select: { productTitle: true, productImage: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.paymentBatch.findMany({
      orderBy: { createdAt: "desc" },
      include: { customer: true, items: true },
      take: 200,
    }),
    prisma.paymentBatch.aggregate({
      where: { status: "paid" },
      _sum: { totalAmount: true },
    }),
    prisma.paymentBatch.count({ where: { status: { not: "paid" } } }),
    prisma.withdrawRequest.findMany({
      where: { status: "pending" },
      orderBy: { createdAt: "asc" },
    }),
    prisma.customer.findMany({
      where: { status: "active" },
      orderBy: { fullName: "asc" },
      select: { id: true, fullName: true, customerCode: true },
    }),
  ]);

  const customerOptions = allCustomers.map((c) => ({ id: c.id, label: `${c.fullName} (${c.customerCode})` }));

  const requestedAtByCustomer = new Map(withdrawRequests.map((r) => [r.customerId, r.createdAt.toISOString()]));

  // Group approved orders by customer
  const byCustomer = new Map<string, any>();
  for (const o of pendingOrders) {
    if (!o.customer) continue;
    const cur = byCustomer.get(o.customer.id) ?? {
      id: o.customer.id,
      name: o.customer.fullName,
      code: o.customer.customerCode,
      amount: 0,
      count: 0,
      bankName: o.customer.bankName,
      bankAccountNumber: o.customer.bankAccountNumber,
      bankAccountName: o.customer.bankAccountName,
      requestedAt: requestedAtByCustomer.get(o.customer.id) ?? null,
    };
    cur.amount += Number(o.customerRewardAmount);
    cur.count += 1;
    byCustomer.set(o.customer.id, cur);
  }

  // Sắp xếp theo thời gian yêu cầu — ai gửi trước xử lý trước
  const pendingList = Array.from(byCustomer.values()).sort(
    (a, b) => new Date(a.requestedAt ?? 0).getTime() - new Date(b.requestedAt ?? 0).getTime()
  );
  const totalPendingAmount = pendingList.reduce((s, c) => s + c.amount, 0);
  const totalPaidAmount = Number(paidAgg._sum.totalAmount ?? 0);

  // Group waiting orders (pending affiliate) by customer for display
  const waitingByCustomer = new Map<string, any>();
  for (const o of waitingOrders) {
    if (!o.customer) continue;
    const cur = waitingByCustomer.get(o.customer.id) ?? {
      id: o.customer.id,
      name: o.customer.fullName,
      code: o.customer.customerCode,
      amount: 0,
      count: 0,
      orders: [],
    };
    cur.amount += Number(o.customerRewardAmount);
    cur.count += 1;
    cur.orders.push({
      id: o.id,
      orderExternalId: o.orderExternalId,
      platformName: o.platform?.name ?? "",
      productTitle: o.trackingLink?.productTitle ?? o.itemName ?? null,
      productImage: o.trackingLink?.productImage ?? null,
      productAffiliateStatus: o.productAffiliateStatus,
      customerRewardAmount: Number(o.customerRewardAmount),
      orderedAt: o.orderedAt?.toISOString() ?? null,
    });
    waitingByCustomer.set(o.customer.id, cur);
  }
  const waitingList = Array.from(waitingByCustomer.values());

  const mappedBatches = batches.map((b) => ({
    id: b.id,
    paymentCode: b.paymentCode,
    customerName: b.customer.fullName,
    totalAmount: Number(b.totalAmount),
    status: b.status,
    paidAt: b.paidAt ? formatDate(b.paidAt) : null,
    transferReference: b.transferReference,
    billStorageKey: b.billStorageKey,
    itemCount: b.items.length,
  }));

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
            <img src="/meowback_lucky_cat_logo.png" alt="" className="h-20 w-20 object-contain drop-shadow-lg shrink-0" />
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-[#e86a33]/60 mb-1">Đối soát & Chi trả</p>
              <h1 className="text-[26px] sm:text-[30px] font-black leading-tight text-[#2d1f14]">Thanh toán</h1>
              <p className="mt-1 text-[13px] text-[#a0816a]">
                <span className="font-bold text-[#e86a33]">{pendingList.length}</span> yêu cầu rút tiền •{" "}
                Tổng cần trả:{" "}
                <span className="font-bold text-[#e86a33]">{formatCurrency(totalPendingAmount)}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── STAT CARDS ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-md">
        <div className="group relative overflow-hidden rounded-2xl bg-white p-lg shadow-sm ring-1 ring-black/[0.06] hover:-translate-y-1 hover:shadow-md transition-all">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-orange-50 opacity-70" />
          <div className="relative flex items-center gap-md">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100/90 text-amber-600 shadow-sm transition-transform group-hover:scale-110 shrink-0">
              <Clock size={22} strokeWidth={2.5} />
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Chờ trả</div>
              <div className="text-[24px] font-black text-[#e86a33] tabular-nums leading-tight">{pendingList.length}</div>
              <div className="text-[10px] text-gray-400">Khách đã yêu cầu rút</div>
            </div>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-2xl bg-white p-lg shadow-sm ring-1 ring-black/[0.06] hover:-translate-y-1 hover:shadow-md transition-all">
          <div className="absolute inset-0 bg-gradient-to-br from-rose-50 to-pink-50 opacity-70" />
          <div className="relative flex items-center gap-md">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100/90 text-rose-600 shadow-sm transition-transform group-hover:scale-110 shrink-0">
              <Receipt size={22} strokeWidth={2.5} />
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Tổng nợ</div>
              <div className="text-[16px] font-black text-rose-600 tabular-nums leading-tight">{formatCurrency(totalPendingAmount)}</div>
            </div>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-2xl p-lg shadow-sm ring-1 ring-black/[0.06] hover:-translate-y-1 hover:shadow-md transition-all"
          style={{ background: "linear-gradient(135deg,#e8f5e9,#f1fdf2)" }}>
          <div className="relative flex items-center gap-md">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100/90 text-emerald-600 shadow-sm transition-transform group-hover:scale-110 shrink-0">
              <CheckCircle2 size={22} strokeWidth={2.5} />
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Đã trả</div>
              <div className="text-[16px] font-black text-emerald-600 tabular-nums leading-tight">{formatCurrency(totalPaidAmount)}</div>
            </div>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-2xl bg-white p-lg shadow-sm ring-1 ring-black/[0.06] hover:-translate-y-1 hover:shadow-md transition-all">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-sky-50 opacity-70" />
          <div className="relative flex items-center gap-md">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100/90 text-blue-600 shadow-sm transition-transform group-hover:scale-110 shrink-0">
              <Hourglass size={22} strokeWidth={2.5} />
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Chờ Shopee duyệt</div>
              <div className="text-[24px] font-black text-blue-500 tabular-nums leading-tight">{waitingOrders.length}</div>
              <div className="text-[10px] text-gray-400">Chưa thể tạo phiếu</div>
            </div>
          </div>
        </div>
      </div>

      <AdminPaymentsClient
        pendingList={pendingList}
        batches={mappedBatches}
        waitingList={waitingList}
        customers={customerOptions}
      />
    </div>
  );
}
