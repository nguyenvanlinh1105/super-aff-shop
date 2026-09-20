import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: "Thiếu email" }, { status: 400 });

    const ip = getClientIp(req);
    const limit = checkRateLimit(`mfa_reset_req:ip:${ip}`, 3, 15 * 60 * 1000);
    if (!limit.allowed) {
      return NextResponse.json({ error: "Thử quá nhiều lần, vui lòng đợi 15 phút" }, { status: 429 });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    if (user && user.role === "admin" && user.mfaEnabled) {
      const resetToken = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 phút

      await prisma.user.update({
        where: { id: user.id },
        data: {
          mfaResetToken: resetToken,
          mfaResetExpiresAt: expiresAt,
        },
      });

      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
      const resetUrl = `${appUrl}/login/mfa-reset?token=${resetToken}`;

      console.log(`[2MFA RESET LINK GENERATED] for ${user.email}: ${resetUrl}`);
    }

    return NextResponse.json({
      success: true,
      message: "Nếu Email chính xác và đã bật 2MFA, hệ thống đã gửi liên kết khôi phục 2MFA tới hộp thư của bạn.",
    });
  } catch (error: any) {
    return NextResponse.json({ error: "Lỗi gửi yêu cầu khôi phục 2MFA" }, { status: 500 });
  }
}
