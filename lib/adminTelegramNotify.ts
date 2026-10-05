import { prisma } from "@/lib/prisma";
import { sendTelegramTextMessage } from "@/lib/telegramBot";

function escapeHtml(val: string): string {
  return val.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/**
 * Chuyển đổi Chat ID hoặc Username Telegram thành Chat ID số hợp lệ để gửi tin.
 * Hỗ trợ các trường hợp:
 * - ID số (VD: "7558379347" hoặc "-100xxx")
 * - Username có hoặc không có dấu @ (VD: "@nonamepro123", "nonamepro123")
 */
export async function resolveTelegramChatId(rawInput?: string | null): Promise<string | null> {
  if (!rawInput) return null;
  const trimmed = rawInput.trim();
  if (!trimmed) return null;

  // Nếu là số thuần túy (kể cả số âm ID nhóm Telegram: -100...)
  if (/^-?\d+$/.test(trimmed)) {
    return trimmed;
  }

  // Nếu nhập username (có thể có @ hoặc không)
  const username = trimmed.replace(/^@/, "").toLowerCase();
  if (!username) return null;

  // 1. Tìm trong Customer (đã từng chat với bot hoặc liên kết trên web)
  const customer = await prisma.customer.findFirst({
    where: {
      telegramUsername: {
        equals: username,
        mode: "insensitive",
      },
      telegramUserId: { not: null },
    },
    select: { telegramUserId: true },
  });

  if (customer?.telegramUserId) {
    return customer.telegramUserId;
  }

  // 2. Tìm trong log tin nhắn Telegram gần nhất của username này
  const log = await prisma.telegramMessageLog.findFirst({
    where: {
      payload: {
        contains: username,
        mode: "insensitive",
      },
    },
    orderBy: { createdAt: "desc" },
    select: { senderId: true },
  });

  if (log?.senderId) {
    return log.senderId;
  }

  return null;
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
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        telegramChatId: true,
        customer: {
          select: {
            telegramUserId: true,
            telegramUsername: true,
          },
        },
      },
    });

    const targetChatIds = new Set<string>();

    for (const a of admins) {
      // 1.1 Thử dùng telegramChatId được cấu hình trực tiếp (ID hoặc @username)
      if (a.telegramChatId && a.telegramChatId.trim()) {
        const resolved = await resolveTelegramChatId(a.telegramChatId);
        if (resolved) {
          targetChatIds.add(resolved);
          continue;
        }
      }

      // 1.2 Thử lấy từ hồ sơ Customer liên kết của tài khoản Admin
      if (a.customer?.telegramUserId) {
        targetChatIds.add(a.customer.telegramUserId.trim());
        continue;
      }

      // 1.3 Thử tìm theo email admin trong bảng Customer
      if (a.email) {
        const matchingCustomer = await prisma.customer.findFirst({
          where: {
            OR: [
              { user: { email: a.email } },
              { note: { contains: a.email } },
            ],
            telegramUserId: { not: null },
          },
          select: { telegramUserId: true },
        });
        if (matchingCustomer?.telegramUserId) {
          targetChatIds.add(matchingCustomer.telegramUserId.trim());
        }
      }
    }

    // Kiểm tra thêm biến môi trường TELEGRAM_ADMIN_CHAT_ID (nếu có cấu hình)
    const envAdminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID?.trim();
    if (envAdminChatId) {
      const resolvedEnv = await resolveTelegramChatId(envAdminChatId);
      if (resolvedEnv) targetChatIds.add(resolvedEnv);
    }

    if (targetChatIds.size === 0) {
      console.log("[notifyAdmins] Không có tài khoản admin nào cấu hình Telegram Chat ID hoặc username hợp lệ để nhận thông báo.");
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

// ============================================================
// Gửi thông báo tới admin khi import CSV hoàn tất (thành công hoặc thất bại).
// Chỉ gửi cho admin bật notifyOnImport = true.
// ============================================================
export async function notifyAdminsImportResult(params: {
  success: boolean;
  fileName: string;
  importedByName: string;
  totalRows: number;
  successRows?: number;
  unmappedRows?: number;
  duplicateRows?: number;
  errorRows?: number;
  referralBonusCount?: number;
  referralBonusTotal?: number;
  errorMessage?: string;
}): Promise<void> {
  try {
    // 1. Tìm tất cả Admin bật nhận thông báo import qua Telegram
    const admins = await prisma.user.findMany({
      where: {
        role: "admin",
        status: "active",
        notifyOnImport: true,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        telegramChatId: true,
        customer: {
          select: {
            telegramUserId: true,
            telegramUsername: true,
          },
        },
      },
    });

    const targetChatIds = new Set<string>();

    for (const a of admins) {
      if (a.telegramChatId && a.telegramChatId.trim()) {
        const resolved = await resolveTelegramChatId(a.telegramChatId);
        if (resolved) {
          targetChatIds.add(resolved);
          continue;
        }
      }

      if (a.customer?.telegramUserId) {
        targetChatIds.add(a.customer.telegramUserId.trim());
        continue;
      }

      if (a.email) {
        const matchingCustomer = await prisma.customer.findFirst({
          where: {
            OR: [
              { user: { email: a.email } },
              { note: { contains: a.email } },
            ],
            telegramUserId: { not: null },
          },
          select: { telegramUserId: true },
        });
        if (matchingCustomer?.telegramUserId) {
          targetChatIds.add(matchingCustomer.telegramUserId.trim());
        }
      }
    }

    // Fallback: biến môi trường
    const envAdminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID?.trim();
    if (envAdminChatId) {
      const resolvedEnv = await resolveTelegramChatId(envAdminChatId);
      if (resolvedEnv) targetChatIds.add(resolvedEnv);
    }

    if (targetChatIds.size === 0) {
      console.log("[notifyAdminsImport] Không có admin nào cấu hình Telegram để nhận thông báo import.");
      return;
    }

    // 2. Format thời gian (GMT+7)
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

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://meowback.shop";

    // 3. Soạn nội dung tin nhắn
    let message: string;

    if (params.success) {
      const lines = [
        `📥 <b>IMPORT CSV HOÀN TẤT</b>`,
        ``,
        `📄 <b>File:</b> ${escapeHtml(params.fileName)}`,
        `👤 <b>Người import:</b> ${escapeHtml(params.importedByName)}`,
        `⏰ <b>Thời gian:</b> ${timeStr}`,
        ``,
        `📊 <b>Kết quả:</b>`,
        `├ Tổng dòng: <b>${params.totalRows}</b>`,
        `├ ✅ Thành công: <b>${params.successRows ?? 0}</b>`,
        `├ 🔗 Chưa map: <b>${params.unmappedRows ?? 0}</b>`,
        `├ 🔄 Trùng lặp: <b>${params.duplicateRows ?? 0}</b>`,
        `╰ ❌ Lỗi: <b>${params.errorRows ?? 0}</b>`,
      ];

      if (params.referralBonusCount && params.referralBonusCount > 0) {
        lines.push(
          ``,
          `🎁 <b>Hoa hồng giới thiệu:</b> ${params.referralBonusCount} đơn — ${(params.referralBonusTotal ?? 0).toLocaleString("vi-VN")}₫`
        );
      }

      lines.push(
        ``,
        `👉 <a href="${appUrl}/admin/orders">Xem danh sách đơn hàng</a>`
      );

      message = lines.join("\n");
    } else {
      message = [
        `🚫 <b>IMPORT CSV THẤT BẠI</b>`,
        ``,
        `📄 <b>File:</b> ${escapeHtml(params.fileName)}`,
        `👤 <b>Người import:</b> ${escapeHtml(params.importedByName)}`,
        `⏰ <b>Thời gian:</b> ${timeStr}`,
        ``,
        `❌ <b>Lý do:</b> ${escapeHtml(params.errorMessage || "Lỗi không xác định")}`,
        ``,
        `👉 <a href="${appUrl}/admin/orders/import">Thử import lại</a>`,
      ].join("\n");
    }

    // 4. Gửi đồng loạt
    await Promise.all(
      Array.from(targetChatIds).map(async (chatId) => {
        try {
          const res = await sendTelegramTextMessage({ chatId, message });
          if (!res.ok) {
            console.warn(`[notifyAdminsImport] Gửi tin tới ${chatId} thất bại:`, res.error);
          } else {
            console.log(`[notifyAdminsImport] Đã gửi thông báo import tới ${chatId}`);
          }
        } catch (err) {
          console.error(`[notifyAdminsImport] Lỗi gửi telegram tới ${chatId}:`, err);
        }
      })
    );
  } catch (error) {
    console.error("[notifyAdminsImportResult] Lỗi:", error);
  }
}
