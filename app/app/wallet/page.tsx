import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/format";
import { CustomerWalletClient } from "@/components/customer/CustomerWalletClient";

export default async function CustomerWalletPage({ searchParams }: { searchParams: { page?: string; q?: string } }) {
  const session = await getSession();
  if (!session?.customerId) redirect("/admin");

  const page = Number(searchParams.page) || 1;
  const limit = 10;
  const skip = (page - 1) * limit;
  const q = searchParams.q || "";

  const where: any = { customerId: session.customerId };
  if (q) {
    where.paymentCode = { contains: q };
  }

  const [customer, orders, paymentBatches, filteredCount, pendingRequest] = await Promise.all([
    prisma.customer.findUnique({ where: { id: session.customerId } }),
    prisma.order.findMany({ where: { customerId: session.customerId } }),
    prisma.paymentBatch.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.paymentBatch.count({ where }),
    prisma.withdrawRequest.findFirst({
      where: { customerId: session.customerId, status: "pending" },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const totalPages = Math.ceil(filteredCount / limit);

  if (!customer) redirect("/login");

  const available = orders
    .filter((o) => o.orderStatus === "approved" && o.payoutStatus === "unpaid")
    .reduce((s, o) => s + Number(o.customerRewardAmount), 0);
  // "Chờ duyệt" gộp cả đơn chưa xác nhận (pending) lẫn đơn Shopee đã báo
  // hoàn thành nhưng còn trong 15 ngày đối soát (processing) — payoutStatus
  // không có giá trị "processing" nên trước đây tổng này luôn ra 0đ.
  const processing = orders
    .filter((o) => o.orderStatus === "pending" || o.orderStatus === "processing")
    .reduce((s, o) => s + Number(o.customerRewardAmount), 0);
  const paid = orders
    .filter((o) => o.payoutStatus === "paid")
    .reduce((s, o) => s + Number(o.customerRewardAmount), 0);

  const history = paymentBatches.map(p => ({
    time: p.paidAt ? formatDate(p.paidAt) : formatDate(p.createdAt),
    amount: formatCurrency(Number(p.totalAmount)),
    status: p.status,
    code: p.paymentCode,
  }));

  return (
    <CustomerWalletClient
      stats={{ available, pending: processing, paid }}
      history={history}
      totalPages={totalPages}
      currentPage={page}
      paymentInfo={{
        bankName: customer.bankName,
        bankAccountNumber: customer.bankAccountNumber,
        bankAccountName: customer.bankAccountName,
      }}
      pendingRequest={
        pendingRequest
          ? {
              id: pendingRequest.id,
              amount: Number(pendingRequest.amount),
              createdAt: pendingRequest.createdAt.toISOString(),
            }
          : null
      }
    />
  );
}
