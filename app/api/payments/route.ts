import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
  }

  const { customerId, periodLabel } = await req.json();
  if (!customerId) return NextResponse.json({ error: "Thiếu khách hàng" }, { status: 400 });

  // Validate: khách phải có thông tin tài khoản ngân hàng
  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    select: { bankAccountNumber: true, fullName: true },
  });

  if (!customer) {
    return NextResponse.json({ error: "Không tìm thấy khách hàng" }, { status: 404 });
  }

  if (!customer.bankAccountNumber) {
    return NextResponse.json({
      error: `Khách hàng "${customer.fullName}" chưa cập nhật thông tin tài khoản ngân hàng. Vui lòng cập nhật trước khi tạo phiếu.`,
    }, { status: 400 });
  }

  const unpaidOrders = await prisma.order.findMany({
    where: { customerId, payoutStatus: "unpaid", orderStatus: "approved" },
  });

  if (unpaidOrders.length === 0) {
    return NextResponse.json({ error: "Khách hàng không có đơn nào chờ thanh toán" }, { status: 400 });
  }

  const totalAmount = unpaidOrders.reduce((sum, o) => sum + Number(o.customerRewardAmount), 0);
  const paymentCode = `PB${Date.now()}`;

  const batch = await prisma.paymentBatch.create({
    data: {
      paymentCode,
      periodLabel,
      customerId,
      totalAmount,
      status: "pending",
      items: {
        create: unpaidOrders.map((o) => ({
          orderId: o.id,
          amount: o.customerRewardAmount,
        })),
      },
    },
    include: { items: true },
  });

  await prisma.order.updateMany({
    where: { id: { in: unpaidOrders.map((o) => o.id) } },
    data: { payoutStatus: "processing" },
  });

  // Đóng yêu cầu rút tiền của khách (nếu có) — phiếu vừa tạo coi như đã xử lý yêu cầu đó.
  await prisma.withdrawRequest.updateMany({
    where: { customerId, status: "pending" },
    data: { status: "fulfilled", resolvedAt: new Date() },
  });

  return NextResponse.json({ batch });
}
