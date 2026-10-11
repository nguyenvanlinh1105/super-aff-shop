import {
  getReconciliationReminderConfig,
  sendReconciliationReminder,
  ReconciliationReminderConfig,
} from "./reconciliationReminder";

declare global {
  // eslint-disable-next-line no-var
  var __reconciliationReminderSchedulerStarted: boolean | undefined;
  // eslint-disable-next-line no-var
  var __reconciliationReminderLastRunSlot: string | undefined;
}

/**
 * Lấy ngày và giờ hiện tại theo múi giờ Việt Nam (Asia/Ho_Chi_Minh - GMT+7)
 */
export function getVietnamDateTime(): { dateStr: string; timeStr: string } {
  const now = new Date();

  // Format theo YYYY-MM-DD
  const dateParts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now); // Output dạng "2026-10-11"

  // Format theo HH:mm (24h)
  const timeParts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Ho_Chi_Minh",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(now); // Output dạng "21:10"

  return {
    dateStr: dateParts,
    timeStr: timeParts,
  };
}

/**
 * Kiểm tra xem khung giờ hẹn này (ví dụ: 2026-10-11_21:10) đã gửi nhắc nhở chưa.
 * - Tránh gửi lặp lại nhiều lần trong cùng 1 phút.
 * - Cho phép gửi ngay khi admin đổi sang giờ hẹn mới trong ngày (ví dụ 9h đã gửi, set lại 9h10 thì 9h10 vẫn gửi bình thường).
 */
function hasAlreadySentForSlot(
  config: ReconciliationReminderConfig,
  todayDateStr: string,
  scheduledTime: string
): boolean {
  const currentSlot = `${todayDateStr}_${scheduledTime}`;

  // 1. Kiểm tra slot đã lưu rõ ràng trong config CSDL
  if (config.lastSentScheduleSlot) {
    return config.lastSentScheduleSlot === currentSlot;
  }

  // 2. Dự phòng (backward compatibility): Nếu chưa có field lastSentScheduleSlot,
  // chỉ coi là đã gửi nếu lần gửi trước rơi đúng vào ngày VÀ đúng vào giờ hẹn này.
  if (config.lastSentAt) {
    try {
      const lastDate = new Date(config.lastSentAt);
      const lastDateStr = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Ho_Chi_Minh",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(lastDate);

      if (lastDateStr !== todayDateStr) return false;

      const lastTimeStr = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Ho_Chi_Minh",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).format(lastDate);

      // Chỉ trùng nếu giờ của lần gửi trước đúng bằng giờ hẹn hiện tại
      return lastTimeStr === scheduledTime;
    } catch {
      return false;
    }
  }

  return false;
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
    const slotKey = `${dateStr}_${scheduledTime}`;

    // 1. Kiểm tra giờ hiện tại có khớp với giờ được hẹn không (VD: 21:10)
    if (timeStr !== scheduledTime) {
      return {
        triggered: false,
        reason: `Chưa đến giờ hẹn (Hiện tại: ${timeStr}, Giờ hẹn: ${scheduledTime}).`,
      };
    }

    // 2. Kiểm tra bộ nhớ trong tiến trình (In-memory slot flag)
    if (globalThis.__reconciliationReminderLastRunSlot === slotKey) {
      return {
        triggered: false,
        reason: `Đã gửi nhắc nhở cho khung giờ ${scheduledTime} ngày ${dateStr}.`,
      };
    }

    // 3. Kiểm tra bản ghi trong CSDL cho khung giờ này
    if (hasAlreadySentForSlot(config, dateStr, scheduledTime)) {
      globalThis.__reconciliationReminderLastRunSlot = slotKey;
      return {
        triggered: false,
        reason: `Đã có bản ghi gửi nhắc nhở cho khung giờ ${scheduledTime} ngày ${dateStr} trong CSDL.`,
      };
    }

    // Đánh dấu đã chạy slot này để không gửi lặp lại trong các chu kỳ lặp kế tiếp của cùng 1 phút
    globalThis.__reconciliationReminderLastRunSlot = slotKey;

    console.log(
      `[ReconciliationReminder] ⏰ Đến giờ hẹn ${scheduledTime} (GMT+7) ngày ${dateStr}. Đang gửi thông báo nhắc nhở import file đối soát tới Admin...`
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
 * Khởi động scheduler chạy ngầm kiểm tra mỗi 15 giây một lần.
 * Dùng cờ toàn cục singleton để chỉ chạy duy nhất 1 bộ hẹn giờ trên tiến trình Node.js.
 */
export function initReconciliationReminderScheduler() {
  if (globalThis.__reconciliationReminderSchedulerStarted) {
    return;
  }

  globalThis.__reconciliationReminderSchedulerStarted = true;
  console.log("🕒 [ReconciliationReminder] Đã kích hoạt bộ lập lịch nhắc nhở import file đối soát hàng ngày.");

  // Chạy kiểm tra mỗi 15 giây để bắt kịp khung giờ hẹn chính xác
  setInterval(() => {
    checkAndTriggerReconciliationReminder().catch((err) => {
      console.error("[ReconciliationReminderScheduler] Lỗi vòng lặp kiểm tra:", err);
    });
  }, 15_000);
}
