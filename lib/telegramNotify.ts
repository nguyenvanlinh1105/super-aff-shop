import { prisma } from "./prisma";
import { buildReplyKeyboardMenu, sendTelegramTextMessage } from "./telegramBot";

// Gửi thông báo real-time cho khách hàng qua Telegram khi có sự kiện quan trọng
// (đơn được duyệt, đã thanh toán...). Bỏ qua im lặng nếu khách chưa liên kết
// Telegram hoặc bot chưa được bật — không throw để không làm hỏng luồng nghiệp vụ chính.
export async function notifyCustomerTelegram(customerId: string, message: string): Promise<void> {
  try {
    const [customer, account] = await Promise.all([
      prisma.customer.findUnique({ where: { id: customerId } }),
      prisma.telegramAccount.findFirst({ where: { status: "active" }, orderBy: { createdAt: "desc" } }),
    ]);

    if (!customer?.telegramUserId || !account) return;

    const result = await sendTelegramTextMessage({
      chatId: customer.telegramUserId,
      message,
      keyboard: buildReplyKeyboardMenu(),
    });

    await prisma.telegramMessageLog.create({
      data: {
        telegramAccountId: account.id,
        customerId: customer.id,
        direction: "out",
        senderId: null,
        receiverId: customer.telegramUserId,
        messageType: "notification",
        messageText: message,
        payload: JSON.stringify(
          result.response ?? { error: result.error, simulated: result.simulated }
        ),
        processingStatus: result.ok ? (result.simulated ? "simulated" : "sent") : "send_failed",
      },
    });
  } catch {
    // Thông báo là best-effort — lỗi gửi Telegram không được làm fail request chính.
  }
}
