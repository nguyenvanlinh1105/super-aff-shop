import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { sendReconciliationReminder } from "@/lib/reconciliationReminder";

// POST /api/admin/reconciliation-reminder/test — Gửi thử nghiệm tin nhắn Telegram cho Admin
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 403 });
  }

  try {
    const result = await sendReconciliationReminder(true);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message,
        details: result.details,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.message,
          details: result.details,
        },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error("[POST /api/admin/reconciliation-reminder/test] Lỗi:", error);
    return NextResponse.json(
      { error: error?.message || "Lỗi khi gửi tin thử nghiệm" },
      { status: 500 }
    );
  }
}
