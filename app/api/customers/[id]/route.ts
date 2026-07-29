import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

/**
 * Số dư khả dụng để admin xem trước trước khi chủ động tạo phiếu rút hộ
 * khách (không cần khách gửi yêu cầu trước) — cùng công thức unpaid+approved
 * dùng ở ví khách hàng và /api/withdraw-requests, nhưng tính riêng cho 1
 * khách theo id thay vì toàn bộ hệ thống.
 */
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
  }

  const customer = await prisma.customer.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      fullName: true,
      customerCode: true,
      bankName: true,
      bankAccountNumber: true,
      bankAccountName: true,
    },
  });
  if (!customer) {
    return NextResponse.json({ error: "Không tìm thấy khách hàng" }, { status: 404 });
  }

  const unpaidOrders = await prisma.order.findMany({
    where: { customerId: params.id, orderStatus: "approved", payoutStatus: "unpaid" },
    select: { customerRewardAmount: true },
  });
  const available = unpaidOrders.reduce((sum, o) => sum + Number(o.customerRewardAmount), 0);

  return NextResponse.json({ customer, available, orderCount: unpaidOrders.length });
}

/**
 * Cập nhật cờ Đối tác và/hoặc người giới thiệu của 1 khách hàng.
 * Đối tác (isPartner) là khách được admin gán cho khách khác (qua
 * referredById) để nhận hoa hồng giới thiệu 5% vĩnh viễn, không giới hạn
 * số đơn hay 6 tháng như người giới thiệu tự do bình thường.
 */
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
  }

  const customer = await prisma.customer.findUnique({ where: { id: params.id } });
  if (!customer) {
    return NextResponse.json({ error: "Không tìm thấy khách hàng" }, { status: 404 });
  }

  const body = await req.json();
  const data: { isPartner?: boolean; referredById?: string | null } = {};

  if (typeof body.isPartner === "boolean") {
    data.isPartner = body.isPartner;
  }

  if ("referredById" in body) {
    const referredById = body.referredById as string | null;
    if (referredById === params.id) {
      return NextResponse.json({ error: "Khách hàng không thể tự giới thiệu chính mình" }, { status: 400 });
    }
    if (referredById) {
      const referrer = await prisma.customer.findUnique({ where: { id: referredById }, select: { id: true } });
      if (!referrer) {
        return NextResponse.json({ error: "Không tìm thấy người giới thiệu" }, { status: 400 });
      }
    }
    data.referredById = referredById;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Không có gì để cập nhật" }, { status: 400 });
  }

  const updated = await prisma.customer.update({ where: { id: params.id }, data });
  return NextResponse.json({ customer: updated });
}

/**
 * Xoá cứng (hard delete) một khách hàng — không thể khôi phục.
 *
 * Order/PaymentBatchItem là dữ liệu đối soát/tài chính thật nên KHÔNG xoá
 * order — chỉ gỡ liên kết (customerId, trackingLinkId = null) để giữ lại
 * lịch sử doanh thu/hoa hồng hệ thống đã ghi nhận. Các bảng con phụ thuộc
 * cứng vào customerId (WithdrawRequest, TelegramLinkCode, PaymentBatch,
 * TrackingLink...) thì xoá theo đúng thứ tự để không vỡ ràng buộc khoá ngoại.
 */
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
  }

  const customer = await prisma.customer.findUnique({
    where: { id: params.id },
    include: { trackingLinks: { select: { id: true } } },
  });
  if (!customer) {
    return NextResponse.json({ error: "Không tìm thấy khách hàng" }, { status: 404 });
  }

  const trackingLinkIds = customer.trackingLinks.map((l) => l.id);

  await prisma.$transaction([
    prisma.withdrawRequest.deleteMany({ where: { customerId: customer.id } }),
    prisma.telegramLinkCode.deleteMany({ where: { customerId: customer.id } }),
    prisma.zaloMessageLog.deleteMany({ where: { customerId: customer.id } }),
    prisma.telegramMessageLog.deleteMany({ where: { customerId: customer.id } }),
    prisma.paymentBatch.deleteMany({ where: { customerId: customer.id } }),
    // Giữ lại order (lịch sử đối soát thật) — chỉ gỡ liên kết khách hàng/link.
    prisma.order.updateMany({
      where: { customerId: customer.id },
      data: { customerId: null, trackingLinkId: null },
    }),
    ...(trackingLinkIds.length > 0
      ? [
          prisma.order.updateMany({
            where: { trackingLinkId: { in: trackingLinkIds } },
            data: { trackingLinkId: null },
          }),
        ]
      : []),
    prisma.trackingLink.deleteMany({ where: { customerId: customer.id } }),
    // Khách khác từng được người này giới thiệu — gỡ liên kết giới thiệu, không xoá họ.
    prisma.customer.updateMany({
      where: { referredById: customer.id },
      data: { referredById: null },
    }),
    prisma.user.deleteMany({ where: { customerId: customer.id } }),
    prisma.customer.delete({ where: { id: customer.id } }),
  ]);

  return NextResponse.json({ success: true });
}
