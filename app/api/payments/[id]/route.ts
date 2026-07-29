import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { randomUUID } from "crypto";
import { writeFile, mkdir } from "fs/promises";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { notifyCustomerTelegram } from "@/lib/telegramNotify";
import { buildPaymentPaidMessage } from "@/lib/telegramBot";
import { notifyCustomerInApp } from "@/lib/notifications";
import { sendMail, buildPaymentSentEmail } from "@/lib/mailer";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
  }

  const batch = await prisma.paymentBatch.findUnique({
    where: { id: params.id },
    include: {
      customer: true,
      items: {
        include: {
          order: {
            include: {
              platform: { select: { name: true, code: true } },
              trackingLink: { select: { productTitle: true, productImage: true } },
            },
          },
        },
      },
    },
  });

  if (!batch) return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 });
  return NextResponse.json({ batch });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
  }

  // ============================================================
  // CHẶN THANH TOÁN NHẦM ĐƠN ĐÃ BỊ CLAWBACK
  // Giữa lúc tạo phiếu (payoutStatus="processing") và lúc bấm "đã trả",
  // một lần re-import CSV có thể phát hiện Shopee đã đòi lại hoa hồng và
  // tự chuyển đơn sang "clawback" — nhưng phiếu thanh toán vẫn giữ số
  // tiền cũ. Phải kiểm tra lại trạng thái đơn NGAY TRƯỚC KHI đánh dấu đã
  // trả, nếu không sẽ chuyển khoản thật cho hoa hồng đã bị Shopee huỷ.
  // ============================================================
  const existingBatch = await prisma.paymentBatch.findUnique({
    where: { id: params.id },
    include: { items: { include: { order: { select: { orderExternalId: true, orderStatus: true } } } } },
  });
  if (!existingBatch) {
    return NextResponse.json({ error: "Không tìm thấy phiếu" }, { status: 404 });
  }
  const invalidItems = existingBatch.items.filter((i) => i.order.orderStatus !== "approved");
  if (invalidItems.length > 0) {
    return NextResponse.json(
      {
        error: `Không thể đánh dấu đã trả: ${invalidItems.length} đơn trong phiếu đã đổi trạng thái (${invalidItems
          .map((i) => `${i.order.orderExternalId}: ${i.order.orderStatus}`)
          .join(", ")}) — có thể Shopee đã đòi lại hoa hồng. Kiểm tra lại đơn trước khi thanh toán.`,
      },
      { status: 409 }
    );
  }

  const formData = await req.formData();
  const transferReference = formData.get("transferReference") as string | null;
  const transferNote = formData.get("transferNote") as string | null;
  const bill = formData.get("bill") as File | null;

  let billStorageKey: string | undefined;
  if (bill && bill.size > 0) {
    const uploadDir = path.join(process.cwd(), "storage", "bills");
    await mkdir(uploadDir, { recursive: true });
    billStorageKey = `${randomUUID()}-${bill.name}`;
    await writeFile(path.join(uploadDir, billStorageKey), Buffer.from(await bill.arrayBuffer()));
  }

  const batch = await prisma.paymentBatch.update({
    where: { id: params.id },
    data: {
      status: "paid",
      transferReference: transferReference ?? undefined,
      transferNote: transferNote ?? undefined,
      billStorageKey,
      paidByUserId: session.userId,
      paidAt: new Date(),
    },
    include: { items: true, customer: { include: { user: true } } },
  });

  await prisma.order.updateMany({
    where: { id: { in: batch.items.map((i) => i.orderId) } },
    data: { payoutStatus: "paid" },
  });

  void notifyCustomerTelegram(
    batch.customerId,
    buildPaymentPaidMessage({
      amount: Number(batch.totalAmount),
      paymentCode: batch.paymentCode,
      transferReference: batch.transferReference,
    })
  );

  void notifyCustomerInApp(batch.customerId, {
    type: "payment_paid",
    title: "✅ Đã chuyển khoản",
    message: `Phiếu ${batch.paymentCode} — ${Number(batch.totalAmount).toLocaleString("vi-VN")}đ đã được chuyển vào tài khoản của bạn.`,
    link: "/app/wallet",
  });

  const customerEmail = batch.customer.user?.email;
  if (customerEmail) {
    void sendMail({
      to: customerEmail,
      subject: `[Đã chuyển khoản] Phiếu ${batch.paymentCode}`,
      html: buildPaymentSentEmail({
        fullName: batch.customer.fullName,
        amount: Number(batch.totalAmount),
        paymentCode: batch.paymentCode,
        bankAccountNumber: batch.customer.bankAccountNumber,
        transferReference: batch.transferReference,
      }),
    });
  }

  return NextResponse.json({ batch });
}
