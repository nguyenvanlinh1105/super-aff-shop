import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(_req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
  }

  // Lấy toàn bộ đơn hàng approved + unpaid của các khách có tài khoản ngân hàng
  const unpaidOrders = await prisma.order.findMany({
    where: { payoutStatus: "unpaid", orderStatus: "approved" },
    include: {
      customer: {
        select: {
          id: true,
          fullName: true,
          customerCode: true,
          bankAccountNumber: true,
        },
      },
    },
  });

  const ordersByCustomer = new Map<string, typeof unpaidOrders>();
  for (const o of unpaidOrders) {
    if (!o.customerId || !o.customer?.bankAccountNumber) continue;
    const list = ordersByCustomer.get(o.customerId) ?? [];
    list.push(o);
    ordersByCustomer.set(o.customerId, list);
  }

  if (ordersByCustomer.size === 0) {
    return NextResponse.json({
      success: true,
      count: 0,
      message: "Không có khách hàng nào có số dư khả dụng và đã cập nhật tài khoản ngân hàng",
    });
  }

  let createdCount = 0;
  for (const [customerId, orders] of ordersByCustomer.entries()) {
    const totalAmount = orders.reduce((sum, o) => sum + Number(o.customerRewardAmount), 0);
    if (totalAmount <= 0) continue;

    const paymentCode = `PB${Date.now()}_${Math.floor(100 + Math.random() * 900)}`;

    await prisma.paymentBatch.create({
      data: {
        paymentCode,
        periodLabel: new Date().toLocaleDateString("vi-VN"),
        customerId,
        totalAmount,
        status: "pending",
        items: {
          create: orders.map((o) => ({
            orderId: o.id,
            amount: o.customerRewardAmount,
          })),
        },
      },
    });

    await prisma.order.updateMany({
      where: { id: { in: orders.map((o) => o.id) } },
      data: { payoutStatus: "processing" },
    });

    await prisma.withdrawRequest.updateMany({
      where: { customerId, status: "pending" },
      data: { status: "fulfilled", resolvedAt: new Date() },
    });

    createdCount++;
  }

  return NextResponse.json({
    success: true,
    count: createdCount,
    message: `Đã tự động tạo ${createdCount} phiếu thanh toán thành công!`,
  });
}
