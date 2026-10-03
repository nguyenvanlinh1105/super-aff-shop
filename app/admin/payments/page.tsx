import { prisma } from "@/lib/prisma";
import { formatDate, formatCurrency } from "@/lib/format";
import { AdminPaymentsClient } from "@/components/admin/AdminPaymentsClient";
import { Clock, Receipt, CheckCircle2, Hourglass } from "lucide-react";

export default async function AdminPaymentsPage() {
  // Tự động chuyển đổi bất kỳ yêu cầu rút tiền đang chờ thành phiếu thanh toán
  const pendingRequests = await prisma.withdrawRequest.findMany({
    where: { status: "pending" },
    include: {
      customer: {
        include: {
          orders: {
            where: { payoutStatus: "unpaid", orderStatus: "approved" },
          },
        },
      },
    },
  });

  for (const wr of pendingRequests) {
    if (wr.customer?.orders && wr.customer.orders.length > 0) {
      const totalAmount = wr.customer.orders.reduce((sum, o) => sum + Number(o.customerRewardAmount), 0);
      const paymentCode = `PB${Date.now()}_${Math.floor(100 + Math.random() * 900)}`;

      await prisma.paymentBatch.create({
        data: {
          paymentCode,
          periodLabel: new Date().toLocaleDateString("vi-VN"),
          customerId: wr.customerId,
          totalAmount,
          status: "pending",
          items: {
            create: wr.customer.orders.map((o) => ({
              orderId: o.id,
              amount: o.customerRewardAmount,
            })),
          },
        },
      });

      await prisma.order.updateMany({
        where: { id: { in: wr.customer.orders.map((o) => o.id) } },
        data: { payoutStatus: "processing" },
      });
    }

    await prisma.withdrawRequest.update({
      where: { id: wr.id },
      data: { status: "fulfilled", resolvedAt: new Date() },
    });
  }

  const [
    withdrawRequests,
    approvedUnpaidOrders,
    waitingOrders,
    batches,
    paidAgg,
    batchPendingCount,
    allCustomers,
  ] = await Promise.all([
    prisma.withdrawRequest.findMany({
      where: { status: "pending" },
      include: {
        customer: {
          select: {
            id: true,
            fullName: true,
            customerCode: true,
            bankName: true,
            bankAccountNumber: true,
            bankAccountName: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    }),
    // Đơn approved + unpaid — dùng để tính số tiền THỰC TẾ sẵn sàng trả
    // cho từng khách (có thể khác với số tiền trong WithdrawRequest vì
    // WithdrawRequest.amount chỉ là snapshot thời điểm gửi yêu cầu).
    prisma.order.findMany({
      where: { payoutStatus: "unpaid", orderStatus: "approved" },
      select: { customerId: true, customerRewardAmount: true },
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
    prisma.customer.findMany({
      where: { status: "active" },
      orderBy: { fullName: "asc" },
      select: {
        id: true,
        fullName: true,
        customerCode: true,
        phone: true,
        bankName: true,
        bankAccountNumber: true,
        bankAccountName: true,
        user: { select: { email: true } },
      },
    }),
  ]);

  const customerOptions = allCustomers.map((c) => ({
    id: c.id,
    label: c.fullName,
    code: c.customerCode,
    email: c.user?.email ?? null,
    phone: c.phone ?? null,
    subLabel: [c.customerCode, c.user?.email, c.phone].filter(Boolean).join(" • "),
  }));
  const customerMap = new Map(allCustomers.map((c) => [c.id, c]));

  // Tính tổng số tiền approved + unpaid theo từng customer
  const approvedAmountByCustomer = new Map<string, { amount: number; count: number }>();
  for (const o of approvedUnpaidOrders) {
    if (!o.customerId) continue;
    const cur = approvedAmountByCustomer.get(o.customerId) ?? { amount: 0, count: 0 };
    cur.amount += Number(o.customerRewardAmount);
    cur.count += 1;
    approvedAmountByCustomer.set(o.customerId, cur);
  }

  // 1. Khách hàng ĐÃ GỬI YÊU CẦU RÚT TIỀN (WithdrawRequest pending)
  const requestedCustomerIds = new Set<string>();
  const pendingList = withdrawRequests.map((wr) => {
    requestedCustomerIds.add(wr.customer.id);
    const approved = approvedAmountByCustomer.get(wr.customer.id) ?? { amount: 0, count: 0 };
    return {
      id: wr.customer.id,
      name: wr.customer.fullName,
      code: wr.customer.customerCode,
      requestAmount: Number(wr.amount),
      approvedAmount: approved.amount,
      approvedCount: approved.count,
      hasWithdrawRequest: true,
      bankName: wr.customer.bankName,
      bankAccountNumber: wr.customer.bankAccountNumber,
      bankAccountName: wr.customer.bankAccountName,
      requestedAt: wr.createdAt.toISOString(),
    };
  });

  // 2. TỰ ĐỘNG BỔ SUNG: Khách có đơn đã duyệt đối soát (approved) nhưng chưa chủ động gửi yêu cầu rút
  for (const [customerId, approved] of approvedAmountByCustomer.entries()) {
    if (requestedCustomerIds.has(customerId)) continue;
    if (approved.amount <= 0) continue;
    const c = customerMap.get(customerId);
    if (!c) continue;
    pendingList.push({
      id: c.id,
      name: c.fullName,
      code: c.customerCode,
      requestAmount: approved.amount,
      approvedAmount: approved.amount,
      approvedCount: approved.count,
      hasWithdrawRequest: false,
      bankName: c.bankName,
      bankAccountNumber: c.bankAccountNumber,
      bankAccountName: c.bankAccountName,
      requestedAt: new Date().toISOString(),
    });
  }

  const totalApprovedAmount = pendingList.reduce((s, c) => s + c.approvedAmount, 0);
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
    customerCode: b.customer.customerCode,
    bankName: b.customer.bankName,
    bankAccountNumber: b.customer.bankAccountNumber,
    bankAccountName: b.customer.bankAccountName,
    totalAmount: Number(b.totalAmount),
    status: b.status,
    createdAt: b.createdAt.toISOString(),
    paidAt: b.paidAt ? formatDate(b.paidAt) : null,
    transferReference: b.transferReference,
    billStorageKey: b.billStorageKey,
    itemCount: b.items.length,
  }));

  return (
    <div className="flex flex-col gap-6 fade-in pb-8">

      {/* ── LUXURY HERO BANNER ── */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 border border-rose-200/60 shadow-lg shadow-rose-500/5 bg-gradient-to-br from-white via-[#FFF5F8] to-[#FFE8F0]">
        <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-gradient-to-br from-rose-200/30 to-pink-300/20 blur-xl" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6 flex-wrap">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-br from-rose-400 via-pink-500 to-rose-600 text-white flex items-center justify-center shadow-md shadow-rose-500/20 shrink-0 border border-white/40 overflow-hidden p-1">
              <img src="/meow-back-payments.png" alt="Thanh Toán" className="w-full h-full object-contain rounded-2xl" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/80 border border-rose-200 text-[10px] font-black uppercase tracking-widest text-rose-600 shadow-xs mb-1.5">
                Duyệt Lệnh Chi Trả Ngân Hàng
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight text-neutral-900 tracking-tight">
                Quản Lý Rút Tiền & Thanh Toán
              </h1>
              <p className="mt-1 text-xs text-neutral-600 font-medium">
                <span className="font-bold text-rose-600">{pendingList.length}</span> yêu cầu rút tiền đang chờ xử lý • Tổng tiền sẵn sàng trả:{" "}
                <span className="font-extrabold text-emerald-700 tabular-nums">{formatCurrency(totalApprovedAmount)}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── STAT CARDS ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="group relative overflow-hidden rounded-3xl bg-white p-5 shadow-sm border border-neutral-200/70 hover:border-amber-200 transition-all duration-300 hover:-translate-y-0.5">
          <div className="relative flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 font-black text-xl shadow-xs shrink-0 group-hover:scale-105 transition-transform">
              <Clock size={20} strokeWidth={2.2} />
            </div>
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-widest text-neutral-400">Yêu Cầu Rút</div>
              <div className="text-xl font-black text-amber-600 tabular-nums leading-tight">{pendingList.length}</div>
            </div>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-3xl bg-white p-5 shadow-sm border border-neutral-200/70 hover:border-rose-200 transition-all duration-300 hover:-translate-y-0.5">
          <div className="relative flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 font-black text-xl shadow-xs shrink-0 group-hover:scale-105 transition-transform">
              <Receipt size={20} strokeWidth={2.2} />
            </div>
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-widest text-neutral-400">Sẵn Sàng Trả</div>
              <div className="text-base font-black text-rose-600 tabular-nums leading-tight">{formatCurrency(totalApprovedAmount)}</div>
            </div>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-white to-emerald-50/60 p-5 shadow-sm border border-emerald-200/70 hover:border-emerald-300 transition-all duration-300 hover:-translate-y-0.5">
          <div className="relative flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 font-black text-xl shadow-xs shrink-0 group-hover:scale-105 transition-transform">
              <CheckCircle2 size={20} strokeWidth={2.2} />
            </div>
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-700/70">Đã Chi Trả</div>
              <div className="text-base font-black text-emerald-700 tabular-nums leading-tight">{formatCurrency(totalPaidAmount)}</div>
            </div>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-3xl bg-white p-5 shadow-sm border border-neutral-200/70 hover:border-sky-200 transition-all duration-300 hover:-translate-y-0.5">
          <div className="relative flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 border border-sky-100 font-black text-xl shadow-xs shrink-0 group-hover:scale-105 transition-transform">
              <Hourglass size={20} strokeWidth={2.2} />
            </div>
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-widest text-neutral-400">Chờ Đơn Đủ Điều Kiện</div>
              <div className="text-xl font-black text-sky-600 tabular-nums leading-tight">{waitingOrders.length}</div>
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

