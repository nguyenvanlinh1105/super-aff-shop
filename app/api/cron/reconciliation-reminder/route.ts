import { NextRequest, NextResponse } from "next/server";
import { checkAndTriggerReconciliationReminder } from "@/lib/reconciliationReminderScheduler";
import { sendReconciliationReminder } from "@/lib/reconciliationReminder";

/**
 * Endpoint cron kích hoạt nhắc nhở đối soát hàng ngày.
 * Hỗ trợ gọi từ cron hệ thống ngoài (Vercel Cron, GitHub Actions, PM2, Crontab).
 *
 * Query params:
 * - force=true: Ép buộc gửi ngay lập tức bỏ qua kiểm tra giờ 7h sáng.
 * - secret: Khóa bảo mật nếu có cấu hình CRON_SECRET trong .env
 */
export async function GET(req: NextRequest) {
  return handleCron(req);
}

export async function POST(req: NextRequest) {
  return handleCron(req);
}

async function handleCron(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const force = searchParams.get("force") === "true";
  const secret = searchParams.get("secret");

  const expectedSecret = process.env.CRON_SECRET || process.env.TELEGRAM_WEBHOOK_SECRET;
  if (expectedSecret && secret && secret !== expectedSecret) {
    return NextResponse.json({ error: "Khóa secret không hợp lệ" }, { status: 401 });
  }

  try {
    if (force) {
      console.log("[Cron:reconciliation-reminder] Force triggering reminder...");
      const result = await sendReconciliationReminder(true);
      return NextResponse.json({
        ok: true,
        forced: true,
        result,
      });
    }

    const checkResult = await checkAndTriggerReconciliationReminder();
    return NextResponse.json({
      ok: true,
      ...checkResult,
    });
  } catch (error: any) {
    console.error("[Cron:reconciliation-reminder] Lỗi:", error);
    return NextResponse.json(
      { ok: false, error: error?.message || "Lỗi cron" },
      { status: 500 }
    );
  }
}
