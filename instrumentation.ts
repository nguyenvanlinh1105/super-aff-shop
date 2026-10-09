export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // 1. Khởi tạo scheduler nhắc nhở đối soát hàng ngày cho Admin
    const { initReconciliationReminderScheduler } = await import(
      "@/lib/reconciliationReminderScheduler"
    );
    initReconciliationReminderScheduler();

    // 2. Tự động đồng bộ và khôi phục kết nối Telegram Bot Webhook & Database (Auto-Heal sau deploy)
    const { autoSyncTelegramBot } = await import("@/lib/telegramBotAutoSync");
    setTimeout(() => {
      autoSyncTelegramBot().catch((err) => {
        console.warn("[instrumentation] Lỗi khi auto-sync Telegram Bot:", err);
      });
    }, 2000);
  }
}
