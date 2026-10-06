import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  getReconciliationReminderConfig,
  saveReconciliationReminderConfig,
  getAdminLinhTarget,
} from "@/lib/reconciliationReminder";
import { initReconciliationReminderScheduler } from "@/lib/reconciliationReminderScheduler";

// GET /api/admin/reconciliation-reminder — Lấy cấu hình nhắc nhở đối soát hàng ngày
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 403 });
  }

  // Khởi động scheduler dự phòng nếu chưa chạy
  initReconciliationReminderScheduler();

  const [config, adminLinh, botAccount] = await Promise.all([
    getReconciliationReminderConfig(),
    getAdminLinhTarget(),
    prisma.telegramAccount.findFirst({
      where: { status: "active" },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return NextResponse.json({
    config,
    adminLinh,
    botInfo: {
      botName: botAccount?.botName ?? "MeowBack Bot",
      botUsername: botAccount?.botUsername ?? "meoback_hoantien_bot",
      status: botAccount?.status ?? "inactive",
    },
  });
}

// PUT /api/admin/reconciliation-reminder — Cập nhật cấu hình nhắc nhở đối soát
export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { enabled, scheduledTime, targetMode, targetAdminId, customMessage } = body;

    const updateData: any = {};
    if (typeof enabled === "boolean") updateData.enabled = enabled;
    if (typeof scheduledTime === "string") {
      // Validate định dạng HH:mm
      const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
      if (timeRegex.test(scheduledTime.trim())) {
        updateData.scheduledTime = scheduledTime.trim();
      }
    }
    if (targetMode === "LINH_ONLY" || targetMode === "ALL_ADMINS") {
      updateData.targetMode = targetMode;
    }
    if (typeof targetAdminId === "string" || targetAdminId === null) {
      updateData.targetAdminId = targetAdminId;
    }
    if (typeof customMessage === "string" || customMessage === null) {
      updateData.customMessage = customMessage ? customMessage.trim() : null;
    }

    const updatedConfig = await saveReconciliationReminderConfig(updateData);

    // Kích hoạt scheduler
    initReconciliationReminderScheduler();

    return NextResponse.json({
      success: true,
      config: updatedConfig,
      message: "Đã cập nhật cấu hình nhắc nhở đối soát thành công!",
    });
  } catch (error: any) {
    console.error("[PUT /api/admin/reconciliation-reminder] Lỗi:", error);
    return NextResponse.json(
      { error: error?.message || "Lỗi khi cập nhật cấu hình" },
      { status: 500 }
    );
  }
}
