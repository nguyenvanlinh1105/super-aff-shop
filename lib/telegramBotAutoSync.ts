import { prisma } from "@/lib/prisma";
import { setupTelegramBotCommands } from "@/lib/telegramBot";

/**
 * Tự động đồng bộ và khôi phục (Auto-Heal) kết nối Telegram Bot:
 * 1. Kiểm tra Bot Token hợp lệ qua Telegram API getMe
 * 2. Đảm bảo bản ghi TelegramAccount trong Database luôn tồn tại & có status = 'active'
 * 3. Kiểm tra và tự động đăng ký lại Webhook (setWebhook) nếu bị ngắt hoặc lỗi
 * 4. Đồng bộ danh sách câu lệnh menu Telegram (setMyCommands)
 */
export async function autoSyncTelegramBot(): Promise<{
  ok: boolean;
  message: string;
  details?: Record<string, unknown>;
}> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    console.log("[Telegram Auto-Sync] Bỏ qua: TELEGRAM_BOT_TOKEN chưa được cấu hình.");
    return { ok: false, message: "Missing TELEGRAM_BOT_TOKEN in environment" };
  }

  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://meowback.shop").replace(/\/+$/, "");
  const secretToken = process.env.TELEGRAM_WEBHOOK_SECRET;
  const webhookUrl = `${appUrl}/api/telegram/webhook`;

  try {
    // 1. Kiểm tra bot token và lấy thông tin bot từ Telegram
    const meRes = await fetch(`https://api.telegram.org/bot${token}/getMe`);
    const meData = await meRes.json().catch(() => null);

    if (!meRes.ok || !meData?.ok) {
      const errDetail = meData?.description || `HTTP ${meRes.status}`;
      console.warn(`[Telegram Auto-Sync] Token không hợp lệ hoặc lỗi kết nối Telegram: ${errDetail}`);
      return { ok: false, message: `Invalid Telegram Bot Token: ${errDetail}` };
    }

    const botUser = meData.result;
    const botUsername = botUser.username || "meowback_bot";
    const botName = botUser.first_name || "MeowBack Hoàn Tiền Bot";

    // 2. Tự động đồng bộ trạng thái active trong database
    const existingAccount = await prisma.telegramAccount.findFirst({
      orderBy: { createdAt: "desc" },
    });

    if (!existingAccount) {
      await prisma.telegramAccount.create({
        data: {
          id: "default-telegram-account",
          botName,
          botUsername,
          botTokenHint: token.slice(-8),
          webhookUrl,
          status: "active",
        },
      });
      console.log(`[Telegram Auto-Sync] Đã tạo mới bản ghi TelegramAccount (@${botUsername}) trạng thái [active].`);
    } else {
      await prisma.telegramAccount.update({
        where: { id: existingAccount.id },
        data: {
          status: "active",
          botUsername,
          botName,
          webhookUrl,
        },
      });
      console.log(`[Telegram Auto-Sync] Đã đảm bảo TelegramAccount (@${botUsername}) luôn ở trạng thái [active].`);
    }

    // 3. Kiểm tra trạng thái webhook hiện tại trên Telegram
    const hookInfoRes = await fetch(`https://api.telegram.org/bot${token}/getWebhookInfo`);
    const hookInfoData = await hookInfoRes.json().catch(() => null);
    const currentWebhook = hookInfoData?.result;

    const needsWebhookUpdate =
      !currentWebhook?.url ||
      currentWebhook.url !== webhookUrl ||
      Boolean(currentWebhook.last_error_date);

    if (needsWebhookUpdate) {
      console.log(`[Telegram Auto-Sync] Webhook cần làm mới (URL hiện tại: "${currentWebhook?.url || "none"}", Lỗi: "${currentWebhook?.last_error_message || "none"}"). Đang thiết lập lại...`);

      const setHookRes = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: webhookUrl,
          secret_token: secretToken || undefined,
          allowed_updates: ["message", "callback_query"],
          drop_pending_updates: false,
        }),
      });

      const setHookData = await setHookRes.json().catch(() => null);
      if (!setHookRes.ok || !setHookData?.ok) {
        console.warn("[Telegram Auto-Sync] setWebhook thất bại:", setHookData?.description);
      } else {
        console.log(`[Telegram Auto-Sync] Đã đăng ký thành công Webhook: ${webhookUrl}`);
      }
    } else {
      console.log(`[Telegram Auto-Sync] Webhook Telegram đang hoạt động ổn định (${currentWebhook.url}).`);
    }

    // 4. Đồng bộ danh sách menu commands
    await setupTelegramBotCommands();
    console.log("[Telegram Auto-Sync] Đã đồng bộ danh sách lệnh bot thành công.");

    return {
      ok: true,
      message: "Telegram Bot auto-sync successful",
      details: {
        botUsername,
        webhookUrl,
        lastError: currentWebhook?.last_error_message ?? null,
      },
    };
  } catch (error) {
    console.error("[Telegram Auto-Sync] Lỗi trong quá trình tự động đồng bộ:", error);
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
