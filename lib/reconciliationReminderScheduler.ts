import {
  getReconciliationReminderConfig,
  sendReconciliationReminder,
} from "./reconciliationReminder";

declare global {
  // eslint-disable-next-line no-var
  var __reconciliationReminderSchedulerStarted: boolean | undefined;
  // eslint-disable-next-line no-var
  var __reconciliationReminderLastRunDate: string | undefined;
}

/**
 * Lấy ngày và giờ hiện tại theo múi giờ Việt Nam (Asia/Ho_Chi_Minh - GMT+7)
 */
function getVietnamDateTime(): { dateStr: string; timeStr: string } {
  const now = new Date();
  
  // Format theo YYYY-MM-DD
  const dateParts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now); // Output dạng "2026-10-07"

  // Format theo HH:mm (24h)
  const timeParts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Ho_Chi_Minh",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(now); // Output dạng "07:00"

  return {
    dateStr: dateParts,
    timeStr: timeParts,
  };
}

/**
 * Kiểm tra xem ngày hôm nay đã gửi nhắc nhở chưa
 */
function hasAlreadySentToday(lastSentAtIso?: string | null, todayDateStr?: string): boolean {
  if (!lastSentAtIso || !todayDateStr) return false;
  try {
    const lastDate = new Date(lastSentAtIso);
    const lastDateStr = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Ho_Chi_Minh",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(lastDate);

    return lastDateStr === todayDateStr;
  } catch {
    return false;
  }
}

/**
 * Hàm kiểm tra định kỳ xem đã đến giờ gửi nhắc nhở chưa
 */
export async function checkAndTriggerReconciliationReminder(): Promise<{
  triggered: boolean;
  reason: string;
}> {
  try {
    const config = await getReconciliationReminderConfig();

    if (!config.enabled) {
      return { triggered: false, reason: "Tính năng đang bị tắt trong cài đặt." };
    }

    const { dateStr, timeStr } = getVietnamDateTime();
    const scheduledTime = config.scheduledTime || "07:00";

    // 1. Kiểm tra giờ hiện tại có khớp với giờ được hẹn không (VD: 07:00)
    if (timeStr !== scheduledTime) {
      return {
        triggered: false,
        reason: `Chưa đến giờ hẹn (Hiện tại: ${timeStr}, Giờ hẹn: ${scheduledTime}).`,
      };
    }

    // 2. Kiểm tra bộ nhớ trong tiến trình (In-memory flag)
    if (globalThis.__reconciliationReminderLastRunDate === dateStr) {
      return {
        triggered: false,
        reason: `Đã gửi nhắc nhở trong ngày hôm nay (${dateStr}).`,
      };
    }

    // 3. Kiểm tra bản ghi trong CSDL
    if (hasAlreadySentToday(config.lastSentAt, dateStr)) {
      globalThis.__reconciliationReminderLastRunDate = dateStr;
      return {
        triggered: false,
        reason: `Đã có bản ghi gửi nhắc nhở trong ngày hôm nay (${dateStr}) trong CSDL.`,
      };
    }

    // Đánh dấu đã chạy để không bị gửi lặp lại trong cùng 1 phút
    globalThis.__reconciliationReminderLastRunDate = dateStr;

    console.log(
      `[ReconciliationReminder] ⏰ Đến giờ ${scheduledTime} sáng (GMT+7) ngày ${dateStr}. Đang gửi thông báo nhắc nhở import file đối soát tới Admin...`
    );

    const result = await sendReconciliationReminder(false);
    console.log("[ReconciliationReminder] Kết quả gửi nhắc nhở:", result.message);

    return {
      triggered: true,
      reason: result.message,
    };
  } catch (error: any) {
    console.error("[ReconciliationReminder] Lỗi khi kiểm tra & gửi nhắc nhở:", error);
    return {
      triggered: false,
      reason: error?.message || "Lỗi không xác định",
    };
  }
}

/**
 * Khởi động scheduler chạy ngầm kiểm tra mỗi 30 giây một lần.
 * Dùng cờ toàn cục singleton để chỉ chạy duy nhất 1 bộ hẹn giờ trên tiến trình Node.js.
 */
export function initReconciliationReminderScheduler() {
  if (globalThis.__reconciliationReminderSchedulerStarted) {
    return;
  }

  globalThis.__reconciliationReminderSchedulerStarted = true;
  console.log("🕒 [ReconciliationReminder] Đã kích hoạt bộ lập lịch nhắc nhở import file đối soát hàng ngày (mặc định 07:00 sáng).");

  // Chạy kiểm tra mỗi 30 giây
  setInterval(() => {
    checkAndTriggerReconciliationReminder().catch((err) => {
      console.error("[ReconciliationReminderScheduler] Lỗi vòng lặp kiểm tra:", err);
    });
  }, 30_000);
}
