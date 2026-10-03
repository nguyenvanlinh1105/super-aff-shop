import { prisma } from "@/lib/prisma";
import { sendTelegramTextMessage } from "@/lib/telegramBot";

function escapeHtml(val: string): string {
  return val.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export async function notifyAdminsNewCustomerRegistration(params: {
  fullName: string;
  email: string;
  customerCode: string;
  phone?: string | null;
  source?: "email" | "google" | string;
  referredByCode?: string | null;
  referrerName?: string | null;
}): Promise<void> {
  try {
    // 1. Tìm tất cả Admin đang hoạt động và BẬT nhận thông báo telegram
    const admins = await prisma.user.findMany({
      where: {
        role: "admin",
        status: "active",
        notifyOnNewCustomer: true,
        telegramChatId: { not: null },
      },
      select: {
        id: true,
        fullName: true,
        telegramChatId: true,
      },
    });

    const targetChatIds = new Set<string>();

    for (const a of admins) {
      if (a.telegramChatId && a.telegramChatId.trim()) {
        targetChatIds.add(a.telegramChatId.trim());
      }
    }

    // Kiểm tra thêm biến môi trường TELEGRAM_ADMIN_CHAT_ID (nếu có cấu hình)
    const envAdminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID?.trim();
    if (envAdminChatId) {
      targetChatIds.add(envAdminChatId);
    }

    if (targetChatIds.size === 0) {
      console.log("[notifyAdmins] Không có tài khoản admin nào cấu hình Telegram Chat ID để nhận thông báo.");
      return;
    }

    // 2. Format thời gian đăng ký (GMT+7)
    const now = new Date();
    const timeStr = new Intl.DateTimeFormat("vi-VN", {
      timeZone: "Asia/Ho_Chi_Minh",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(now);

    const sourceLabel =
      params.source === "google"
        ? "🌐 Google OAuth"
        : params.source === "email"
        ? "📝 Đăng ký Form Web"
        : "📱 Hệ thống";

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://meowback.shop";

    // 3. Soạn nội dung tin nhắn Telegram
    const messageLines = [
      `🎉 <b>CÓ KHÁCH HÀNG MỚI ĐĂNG KÝ!</b>`,
      ``,
      `👤 <b>Họ tên:</b> ${escapeHtml(params.fullName)}`,
      `📧 <b>Email:</b> ${escapeHtml(params.email)}`,
      `📱 <b>Số điện thoại:</b> ${params.phone ? escapeHtml(params.phone) : "<i>Chưa cập nhật</i>"}`,
      `🆔 <b>Mã khách hàng:</b> <code>${escapeHtml(params.customerCode)}</code>`,
      `📍 <b>Hình thức:</b> ${sourceLabel}`,
    ];

    if (params.referredByCode) {
      messageLines.push(
        `🎁 <b>Người giới thiệu:</b> ${
          params.referrerName ? escapeHtml(params.referrerName) + " " : ""
        }(<code>${escapeHtml(params.referredByCode)}</code>)`
      );
    }

    messageLines.push(
      `⏰ <b>Thời gian:</b> ${timeStr}`,
      ``,
      `👉 <a href="${appUrl}/admin/customers">Xem danh sách khách hàng</a>`
    );

    const message = messageLines.join("\n");

    // 4. Gửi đồng loạt tới từng admin
    await Promise.all(
      Array.from(targetChatIds).map(async (chatId) => {
        try {
          const res = await sendTelegramTextMessage({
            chatId,
            message,
          });
          if (!res.ok) {
            console.warn(`[notifyAdmins] Gửi tin tới Telegram chat ID ${chatId} thất bại:`, res.error);
          } else {
            console.log(`[notifyAdmins] Đã gửi thông báo khách mới tới Telegram chat ID ${chatId}`);
          }
        } catch (err) {
          console.error(`[notifyAdmins] Lỗi khi gửi telegram tới ${chatId}:`, err);
        }
      })
    );
  } catch (error) {
    console.error("[notifyAdminsNewCustomerRegistration] Lỗi:", error);
  }
}
