import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyMfaPendingToken } from "@/lib/session";
import { setSessionCookie } from "@/lib/auth";
import { verifyTotpCode, verifyBackupCode } from "@/lib/mfa";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  try {
    const { mfaToken, code } = await req.json();

    if (!mfaToken || !code) {
      return NextResponse.json({ error: "Thiếu phiên 2MFA hoặc mã xác thực 6 số" }, { status: 400 });
    }

    const ip = getClientIp(req);
    // Strict Rate Limiting: Tối đa 5 lần thử sai trong 15 phút
    const rateLimit = checkRateLimit(`mfa_verify:ip:${ip}`, 5, 15 * 60 * 1000);
    if (!rateLimit.allowed) {
      const retryAfter = rateLimit.retryAfterSeconds ?? 900;
      return NextResponse.json(
        { error: `Thử sai mã 2MFA quá 5 lần! Tài khoản của bạn tạm thời bị khóa 2MFA trong ${Math.ceil(retryAfter / 60)} phút để chống brute-force.` },
        { status: 429 }
      );
    }

    const payload = await verifyMfaPendingToken(mfaToken);
    if (!payload || !payload.userId) {
      return NextResponse.json({ error: "Phiên đăng nhập 2MFA đã hết hạn (5 phút). Vui lòng đăng nhập lại từ đầu." }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user || user.status !== "active" || !user.mfaEnabled || !user.mfaSecret) {
      return NextResponse.json({ error: "Tài khoản chưa được cấu hình 2MFA hợp lệ." }, { status: 400 });
    }

    const cleanCode = code.trim();
    let isMatch = verifyTotpCode(user.mfaSecret, cleanCode);
    let usedBackupCode = false;

    // Nếu không khớp mã TOTP 6 số, thử kiểm tra mã dự phòng (Backup Code) 8 ký tự
    if (!isMatch && user.mfaBackupCodes) {
      const backupCheck = verifyBackupCode(user.mfaBackupCodes, cleanCode);
      if (backupCheck.valid) {
        isMatch = true;
        usedBackupCode = true;
        // Cập nhật lại danh sách mã dự phòng (xóa mã vừa dùng)
        await prisma.user.update({
          where: { id: user.id },
          data: { mfaBackupCodes: JSON.stringify(backupCheck.remainingCodes) },
        });
      }
    }

    if (!isMatch) {
      // Ghi vết lần thử sai vào AuditLog
      await (prisma as any).auditLog.create({
        data: {
          actorUserId: user.id,
          action: "MFA_VERIFY_FAILED",
          entityType: "user",
          entityId: user.id,
          detail: JSON.stringify({ ip, inputCode: cleanCode, time: new Date().toISOString() }),
        },
      }).catch(() => {});

      return NextResponse.json({ error: "Mã 2MFA không chính xác hoặc đã hết hạn (mỗi mã đổi sau 30s)." }, { status: 400 });
    }

    // Đăng nhập thành công 2MFA -> Cấp chính thức Session Cookie Admin
    await setSessionCookie({
      userId: user.id,
      role: user.role as "admin",
      fullName: user.fullName,
      customerId: user.customerId,
    });

    return NextResponse.json({
      success: true,
      usedBackupCode,
      redirectTo: "/admin",
    });
  } catch (error: any) {
    return NextResponse.json({ error: "Xác thực 2MFA thất bại. Vui lòng thử lại." }, { status: 500 });
  }
}
