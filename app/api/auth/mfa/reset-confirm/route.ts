import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";

export async function POST(req: NextRequest) {
  try {
    const { resetToken, password } = await req.json();

    if (!resetToken || !password) {
      return NextResponse.json({ error: "Thiếu token reset hoặc mật khẩu hiện tại" }, { status: 400 });
    }

    const nowIso = new Date().toISOString();
    const users: any[] = await prisma.$queryRawUnsafe(
      "SELECT * FROM users WHERE mfa_reset_token = ? AND mfa_reset_expires_at >= ?",
      resetToken,
      nowIso
    );
    const user = users[0];

    if (!user) {
      return NextResponse.json({ error: "Liên kết khôi phục 2MFA không hợp lệ hoặc đã hết hạn (15 phút)." }, { status: 400 });
    }

    const isPassValid = verifyPassword(password, user.password_hash || user.passwordHash);
    if (!isPassValid) {
      return NextResponse.json({ error: "Mật khẩu hiện tại không đúng." }, { status: 401 });
    }

    // Tắt 2MFA và xóa thông tin secret cũ
    await prisma.$executeRawUnsafe(
      "UPDATE users SET mfa_enabled = 0, mfa_secret = NULL, mfa_backup_codes = NULL, mfa_reset_token = NULL, mfa_reset_expires_at = NULL WHERE id = ?",
      user.id
    );

    return NextResponse.json({
      success: true,
      message: "Đã tắt xác thực 2MFA thành công. Bạn có thể đăng nhập bằng Email & Mật khẩu.",
    });
  } catch (error: any) {
    return NextResponse.json({ error: "Xác nhận khôi phục 2MFA thất bại" }, { status: 500 });
  }
}
