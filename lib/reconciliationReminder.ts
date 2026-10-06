import { prisma } from "@/lib/prisma";
import { sendTelegramTextMessage, TelegramInlineKeyboard } from "@/lib/telegramBot";
import { resolveTelegramChatId } from "@/lib/adminTelegramNotify";

export interface ReconciliationReminderConfig {
  enabled: boolean;
  scheduledTime: string; // "07:00" in 24h format (GMT+7 Asia/Ho_Chi_Minh)
  targetMode: "LINH_ONLY" | "ALL_ADMINS";
  targetAdminId?: string | null;
  customMessage?: string | null;
  lastSentAt?: string | null;
  lastSentStatus?: "success" | "error" | null;
  lastSentDetail?: string | null;
}

export const SETTING_KEY_RECONCILIATION_REMINDER = "RECONCILIATION_REMINDER_CONFIG";

export const DEFAULT_RECONCILIATION_CONFIG: ReconciliationReminderConfig = {
  enabled: true,
  scheduledTime: "07:00",
  targetMode: "LINH_ONLY",
  targetAdminId: "c422ad26-ddf6-4a1d-b729-bae0dcaf54e7", // Admin Nguyễn Văn Linh
  customMessage: null,
  lastSentAt: null,
  lastSentStatus: null,
  lastSentDetail: null,
};

function escapeHtml(val: string): string {
  return val.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/**
 * Lấy cấu hình nhắc nhở đối soát từ bảng system_settings trong CSDL.
 * Nếu chưa có, trả về cấu hình mặc định (bật = true, giờ = 07:00, gửi admin Nguyễn Văn Linh).
 */
export async function getReconciliationReminderConfig(): Promise<ReconciliationReminderConfig> {
  try {
    const record = await prisma.systemSetting.findUnique({
      where: { key: SETTING_KEY_RECONCILIATION_REMINDER },
    });

    if (!record || !record.value) {
      return { ...DEFAULT_RECONCILIATION_CONFIG };
    }

    const parsed = JSON.parse(record.value) as Partial<ReconciliationReminderConfig>;
    return {
      ...DEFAULT_RECONCILIATION_CONFIG,
      ...parsed,
    };
  } catch (error) {
    console.error("[getReconciliationReminderConfig] Lỗi khi đọc cài đặt:", error);
    return { ...DEFAULT_RECONCILIATION_CONFIG };
  }
}

/**
 * Lưu cấu hình nhắc nhở đối soát vào bảng system_settings.
 */
export async function saveReconciliationReminderConfig(
  update: Partial<ReconciliationReminderConfig>
): Promise<ReconciliationReminderConfig> {
  const current = await getReconciliationReminderConfig();
  const merged: ReconciliationReminderConfig = {
    ...current,
    ...update,
  };

  await prisma.systemSetting.upsert({
    where: { key: SETTING_KEY_RECONCILIATION_REMINDER },
    update: {
      value: JSON.stringify(merged),
      updatedAt: new Date(),
    },
    create: {
      key: SETTING_KEY_RECONCILIATION_REMINDER,
      value: JSON.stringify(merged),
    },
  });

  return merged;
}

/**
 * Lấy thông tin tài khoản admin Nguyễn Văn Linh
 */
export async function getAdminLinhTarget() {
  const admin = await prisma.user.findFirst({
    where: {
      role: "admin",
      OR: [
        { email: "vanlinh11052004nguyenvan@gmail.com" },
        { fullName: { contains: "Linh", mode: "insensitive" } },
        { id: "c422ad26-ddf6-4a1d-b729-bae0dcaf54e7" },
      ],
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      telegramChatId: true,
      phone: true,
      status: true,
    },
  });

  return admin;
}

export interface SendReminderResult {
  success: boolean;
  message: string;
  recipientsCount: number;
  details: {
    adminName: string;
    chatId: string;
    ok: boolean;
    error?: string;
  }[];
}

/**
 * Gửi tin nhắn nhắc nhở import file đối soát tới Telegram của Admin.
 * - isTest = true: gửi thử nghiệm (bỏ qua check enabled).
 * - isTest = false: chỉ gửi khi enabled = true.
 */
export async function sendReconciliationReminder(isTest: boolean = false): Promise<SendReminderResult> {
  const config = await getReconciliationReminderConfig();

  if (!isTest && !config.enabled) {
    return {
      success: false,
      message: "Chức năng nhắc nhở import đối soát hiện đang TẮT.",
      recipientsCount: 0,
      details: [],
    };
  }

  // 1. Xác định danh sách admin nhận tin
  type RecipientItem = {
    adminId: string;
    name: string;
    email: string;
    chatId: string;
  };

  const recipients: RecipientItem[] = [];

  if (config.targetMode === "LINH_ONLY") {
    // Chỉ gửi cho admin Nguyễn Văn Linh
    const adminLinh = await getAdminLinhTarget();
    if (adminLinh) {
      let chatId = adminLinh.telegramChatId ? await resolveTelegramChatId(adminLinh.telegramChatId) : null;
      // Fallback ID đã xác thực của Linh: 7558379347
      if (!chatId) {
        chatId = "7558379347";
      }
      recipients.push({
        adminId: adminLinh.id,
        name: adminLinh.fullName,
        email: adminLinh.email,
        chatId,
      });
    } else {
      // Fallback trực tiếp tới Chat ID 7558379347
      recipients.push({
        adminId: "c422ad26-ddf6-4a1d-b729-bae0dcaf54e7",
        name: "Nguyễn Văn Linh",
        email: "vanlinh11052004nguyenvan@gmail.com",
        chatId: "7558379347",
      });
    }
  } else {
    // Gửi cho tất cả Admin đang hoạt động
    const allAdmins = await prisma.user.findMany({
      where: {
        role: "admin",
        status: "active",
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        telegramChatId: true,
      },
    });

    for (const a of allAdmins) {
      if (a.telegramChatId) {
        const resolved = await resolveTelegramChatId(a.telegramChatId);
        if (resolved) {
          recipients.push({
            adminId: a.id,
            name: a.fullName,
            email: a.email,
            chatId: resolved,
          });
        }
      }
    }

    // Nếu không admin nào có chat ID hợp lệ, fallback tới Linh
    if (recipients.length === 0) {
      recipients.push({
        adminId: "c422ad26-ddf6-4a1d-b729-bae0dcaf54e7",
        name: "Nguyễn Văn Linh",
        email: "vanlinh11052004nguyenvan@gmail.com",
        chatId: "7558379347",
      });
    }
  }

  if (recipients.length === 0) {
    const errorMsg = "Không tìm thấy admin nào có Telegram Chat ID hợp lệ để gửi thông báo.";
    await saveReconciliationReminderConfig({
      lastSentAt: new Date().toISOString(),
      lastSentStatus: "error",
      lastSentDetail: errorMsg,
    });
    return {
      success: false,
      message: errorMsg,
      recipientsCount: 0,
      details: [],
    };
  }

  // 2. Format thời gian (GMT+7)
  const now = new Date();
  const timeFormatted = new Intl.DateTimeFormat("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(now);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://meowback.shop";
  const importUrl = `${appUrl}/admin/orders/import`;
  const ordersUrl = `${appUrl}/admin/orders`;

  // 3. Chuẩn bị inline keyboard
  const keyboard: TelegramInlineKeyboard = {
    inline_keyboard: [
      [
        {
          text: "📥 Mở Trang Import Đối Soát Ngay",
          url: importUrl,
        },
      ],
      [
        {
          text: "📊 Danh Sách Đơn Hàng",
          url: ordersUrl,
        },
      ],
    ],
  };

  // 4. Lấy bot account để log
  const botAccount = await prisma.telegramAccount.findFirst({
    where: { status: "active" },
    orderBy: { createdAt: "desc" },
  });

  const sendResults: {
    adminName: string;
    chatId: string;
    ok: boolean;
    error?: string;
  }[] = [];

  for (const r of recipients) {
    const messageLines = [
      `⏰ <b>NHẮC NHỞ ĐỐI SOÁT HÀNG NGÀY</b>`,
      ``,
      `Chào bạn <b>${escapeHtml(r.name)}</b>! 👋`,
      `Đã đến <b>${config.scheduledTime || "07:00"} sáng</b> rồi, hãy tải lên và <b>import file đối soát của khách hàng</b> (Shopee/Lazada) để hệ thống kịp thời cập nhật đơn hàng, đối soát hoa hồng & số dư khả dụng nhé! 📑✨`,
    ];

    if (config.customMessage && config.customMessage.trim()) {
      messageLines.push(``, `📝 <i>Lời nhắn bổ sung: ${escapeHtml(config.customMessage.trim())}</i>`);
    }

    if (isTest) {
      messageLines.push(
        ``,
        `🧪 <i>[Đây là tin nhắn thử nghiệm từ Màn hình Cài đặt Admin — MeowBack]</i>`
      );
    }

    messageLines.push(
      ``,
      `⏰ <b>Thời gian:</b> ${timeFormatted}`,
      ``,
      `👉 <a href="${importUrl}">Bấm vào đây để mở trang Import Đối Soát</a>`
    );

    const message = messageLines.join("\n");

    try {
      const res = await sendTelegramTextMessage({
        chatId: r.chatId,
        message,
        keyboard,
      });

      if (res.ok) {
        sendResults.push({
          adminName: r.name,
          chatId: r.chatId,
          ok: true,
        });

        // Ghi log vào TelegramMessageLog
        await prisma.telegramMessageLog.create({
          data: {
            telegramAccountId: botAccount?.id ?? null,
            direction: "outgoing",
            externalMessageId: (res.response as any)?.result?.message_id
              ? String((res.response as any).result.message_id)
              : null,
            senderId: "system",
            receiverId: r.chatId,
            messageType: "reconciliation_reminder",
            messageText: message,
            payload: JSON.stringify({
              isTest,
              scheduledTime: config.scheduledTime,
              targetMode: config.targetMode,
            }),
            processingStatus: "sent",
          },
        }).catch((err) => {
          console.warn("[sendReconciliationReminder] Không thể lưu log tin nhắn:", err);
        });
      } else {
        sendResults.push({
          adminName: r.name,
          chatId: r.chatId,
          ok: false,
          error: res.error || "Gửi tin thất bại qua Telegram API",
        });
      }
    } catch (err: any) {
      sendResults.push({
        adminName: r.name,
        chatId: r.chatId,
        ok: false,
        error: err?.message || "Lỗi ngoại lệ khi gửi tin",
      });
    }
  }

  const successCount = sendResults.filter((s) => s.ok).length;
  const allSuccess = successCount > 0;
  const summaryDetail = `Đã gửi thành công ${successCount}/${recipients.length} quản trị viên (${sendResults
    .map((s) => `${s.adminName}: ${s.ok ? "✅" : "❌ " + (s.error || "")}`)
    .join(", ")})`;

  // Cập nhật trạng thái lần gửi vào CSDL
  await saveReconciliationReminderConfig({
    lastSentAt: now.toISOString(),
    lastSentStatus: allSuccess ? "success" : "error",
    lastSentDetail: summaryDetail,
  });

  return {
    success: allSuccess,
    message: allSuccess
      ? `Đã gửi thông báo nhắc nhở thành công tới ${successCount} quản trị viên!`
      : "Gửi thông báo nhắc nhở thất bại.",
    recipientsCount: recipients.length,
    details: sendResults,
  };
}
