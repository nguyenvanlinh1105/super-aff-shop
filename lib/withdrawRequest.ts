import { prisma } from "./prisma";
import { sendMail, buildCustomerWithdrawRequestEmail } from "./mailer";
import { notifyAdminsInApp, notifyCustomerInApp } from "./notifications";

export const MIN_WITHDRAW_AMOUNT = 10000;

type CreateWithdrawRequestResult =
  | { ok: true; request: { id: string; amount: number; createdAt: Date } }
  | { ok: false; code: "not_found" | "insufficient_balance" | "missing_bank_info" | "already_pending"; error: string };

// Dùng chung cho CẢ web (app/api/withdraw-requests) lẫn Telegram (/rut) —
// 1 nguồn logic duy nhất để 2 kênh không bao giờ lệch nhau về điều kiện
// rút tiền, số tiền tối thiểu, hay việc chặn gửi trùng yêu cầu.
export async function createWithdrawRequest(customerId: string): Promise<CreateWithdrawRequestResult> {
  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    include: { orders: true, user: true },
  });
  if (!customer) {
    return { ok: false, code: "not_found", error: "Không tìm thấy khách hàng" };
  }

  const available = customer.orders
    .filter((o) => o.orderStatus === "approved" && o.payoutStatus === "unpaid")
    .reduce((s, o) => s + Number(o.customerRewardAmount), 0);

  if (available < MIN_WITHDRAW_AMOUNT) {
    return {
      ok: false,
      code: "insufficient_balance",
      error: `Số dư khả dụng tối thiểu ${MIN_WITHDRAW_AMOUNT.toLocaleString("vi-VN")}đ mới được gửi yêu cầu rút tiền`,
    };
  }

  if (!customer.bankName || !customer.bankAccountNumber || !customer.bankAccountName) {
    return {
      ok: false,
      code: "missing_bank_info",
      error: "Vui lòng cập nhật đầy đủ thông tin tài khoản ngân hàng trước khi rút tiền",
    };
  }

  const existingPending = await prisma.withdrawRequest.findFirst({
    where: { customerId: customer.id, status: "pending" },
  });
  if (existingPending) {
    return {
      ok: false,
      code: "already_pending",
      error: "Bạn đã có một yêu cầu rút tiền đang chờ xử lý, vui lòng đợi admin xác nhận",
    };
  }

  const request = await prisma.withdrawRequest.create({
    data: { customerId: customer.id, amount: available },
  });

  // Tự động tạo phiếu thanh toán (PaymentBatch) ngay khi khách gửi yêu cầu rút tiền
  const unpaidOrders = customer.orders.filter(
    (o) => o.orderStatus === "approved" && o.payoutStatus === "unpaid"
  );
  if (unpaidOrders.length > 0) {
    const paymentCode = `PB${Date.now()}`;
    await prisma.paymentBatch.create({
      data: {
        paymentCode,
        periodLabel: new Date().toLocaleDateString("vi-VN"),
        customerId: customer.id,
        totalAmount: available,
        status: "pending",
        items: {
          create: unpaidOrders.map((o) => ({
            orderId: o.id,
            amount: o.customerRewardAmount,
          })),
        },
      },
    });

    await prisma.order.updateMany({
      where: { id: { in: unpaidOrders.map((o) => o.id) } },
      data: { payoutStatus: "processing" },
    });
  }

  // ── Email notification cho khách hàng ────────────────────────────────

  // Gửi ngược về cho khách để họ phát hiện sớm nếu có ai đó chiếm được tài
  // khoản và tự ý gửi yêu cầu rút tiền mà không phải chính chủ.
  if (customer.user?.email) {
    void sendMail({
      to: customer.user.email,
      subject: "🔒 Yêu cầu rút tiền vừa được tạo trên tài khoản của bạn",
      html: buildCustomerWithdrawRequestEmail({
        fullName: customer.fullName,
        amount: available,
        bankName: customer.bankName,
        bankAccountNumber: customer.bankAccountNumber,
      }),
    });
  }

  // ── In-app notifications ─────────────────────────────────────────────
  const formattedAmount = available.toLocaleString("vi-VN");

  // Thông báo cho TẤT CẢ admin trong hệ thống
  void notifyAdminsInApp({
    type: "system",
    title: "🔔 Yêu cầu rút tiền mới",
    message: `${customer.fullName} (${customer.customerCode}) yêu cầu rút ${formattedAmount}đ`,
    link: "/admin/payments",
  });

  // Xác nhận cho chính khách hàng
  void notifyCustomerInApp(customer.id, {
    type: "system",
    title: "✅ Đã gửi yêu cầu rút tiền",
    message: `Yêu cầu rút ${formattedAmount}đ đã được gửi. Admin sẽ xử lý sớm nhất.`,
    link: "/app/wallet",
  });

  return {
    ok: true,
    request: { id: request.id, amount: Number(request.amount), createdAt: request.createdAt },
  };
}
