import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/format";
import { CustomerOrdersClient } from "@/components/customer/CustomerOrdersClient";

export default async function CustomerOrdersPage({ searchParams }: { searchParams: { q?: string; page?: string; tab?: string } }) {
  const session = await getSession();
  if (!session?.customerId) redirect("/admin");

  const page = Number(searchParams.page) || 1;
  const limit = 10;
  const skip = (page - 1) * limit;
  const q = searchParams.q || "";
  const tab = searchParams.tab || "all";

  const where: any = { customerId: session.customerId };
  if (q) {
    where.orderExternalId = { contains: q };
  }

  if (tab === "completed") { where.orderStatus = "approved"; where.payoutStatus = "paid"; }
  if (tab === "pending") where.orderStatus = "pending";
  if (tab === "reconciling") where.orderStatus = "processing";
  if (tab === "processing") { where.orderStatus = "approved"; where.payoutStatus = { not: "paid" }; }
  if (tab === "cancelled") where.orderStatus = { in: ["cancelled", "rejected", "clawback"] };

  const baseWhere = { customerId: session.customerId };

  const [totalCount, completedCount, pendingCount, reconcilingCount, processingCount, cancelledCount, orders, filteredCount] = await Promise.all([
    prisma.order.count({ where: baseWhere }),
    prisma.order.count({ where: { ...baseWhere, orderStatus: "approved", payoutStatus: "paid" } }),
    prisma.order.count({ where: { ...baseWhere, orderStatus: "pending" } }),
    prisma.order.count({ where: { ...baseWhere, orderStatus: "processing" } }),
    prisma.order.count({ where: { ...baseWhere, orderStatus: "approved", payoutStatus: { not: "paid" } } }),
    prisma.order.count({ where: { ...baseWhere, orderStatus: { in: ["cancelled", "rejected", "clawback"] } } }),
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: { platform: true },
    }),
    prisma.order.count({ where })
  ]);

  const SETTLEMENT_DAYS = 15;
  const now = Date.now();

  const formattedOrders = orders.map((o) => {
    let daysLeft: number | null = null;
    let completedAtText: string | null = null;
    let readyAtText: string | null = null;
    if (o.orderStatus === "processing" && o.completedAt) {
      const readyAt = new Date(o.completedAt);
      readyAt.setDate(readyAt.getDate() + SETTLEMENT_DAYS);
      daysLeft = Math.max(0, Math.ceil((readyAt.getTime() - now) / 86400000));
      completedAtText = formatDate(o.completedAt);
      readyAtText = formatDate(readyAt);
    }
    return {
      id: o.id,
      orderExternalId: o.orderExternalId,
      platformName: o.platform.name,
      sourceType: o.sourceType,
      createdAt: formatDate(o.createdAt),
      orderAmount: formatCurrency(Number(o.orderAmount ?? 0)),
      customerRewardAmount: formatCurrency(Number(o.customerRewardAmount)),
      orderStatus: o.orderStatus,
      payoutStatus: o.payoutStatus,
      daysLeft,
      completedAtText,
      readyAtText,
    };
  });

  const totalPages = Math.ceil(filteredCount / limit);
  const counts = {
    all: totalCount,
    completed: completedCount,
    pending: pendingCount,
    reconciling: reconcilingCount,
    processing: processingCount,
    cancelled: cancelledCount,
  };

  return (
    <CustomerOrdersClient orders={formattedOrders} totalPages={totalPages} currentPage={page} counts={counts} />
  );
}
