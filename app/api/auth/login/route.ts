import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { setSessionCookie } from "@/lib/auth";
import { createMfaPendingToken } from "@/lib/session";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ error: "Thiếu email hoặc mật khẩu" }, { status: 400 });
  }

  // Chặn brute-force: giới hạn theo IP (quét diện rộng) VÀ theo email
  const ip = getClientIp(req);
  const ipLimit = checkRateLimit(`login:ip:${ip}`, 20, 15 * 60 * 1000);
  const emailLimit = checkRateLimit(`login:email:${email.toLowerCase()}`, 5, 15 * 60 * 1000);
  if (!ipLimit.allowed || !emailLimit.allowed) {
    const retryAfter = Math.max(ipLimit.retryAfterSeconds ?? 0, emailLimit.retryAfterSeconds ?? 0);
    return NextResponse.json(
      { error: `Thử sai quá nhiều lần, vui lòng đợi ${Math.ceil(retryAfter / 60)} phút rồi thử lại` },
      { status: 429 }
    );
  }

  // Dùng raw SQL query để lấy đầy đủ các cột mới (mfa_enabled, mfa_secret...) trực tiếp từ SQLite
  const users: any[] = await prisma.$queryRawUnsafe(
    "SELECT * FROM users WHERE email = ? LIMIT 1",
    email.trim().toLowerCase()
  );
  const user = users[0];

  if (!user || user.status !== "active" || !verifyPassword(password, user.password_hash || user.passwordHash)) {
    return NextResponse.json({ error: "Email hoặc mật khẩu không đúng" }, { status: 401 });
  }

  const isMfaEnabled = Boolean(user.mfa_enabled || user.mfaEnabled);

  // Nếu là Admin và ĐÃ BẬT 2MFA (mfa_enabled === 1) -> Bắt buộc qua Bước 2
  if (user.role === "admin" && isMfaEnabled) {
    const mfaPendingToken = await createMfaPendingToken({
      userId: user.id,
      role: user.role as "admin",
      fullName: user.full_name || user.fullName,
      customerId: user.customer_id || user.customerId,
    });

    return NextResponse.json({
      require2FA: true,
      mfaToken: mfaPendingToken,
      mfaMethod: user.mfa_method || user.mfaMethod || "totp",
    });
  }

  // Đăng nhập bình thường (Customer hoặc Admin chưa bật 2MFA)
  await setSessionCookie({
    userId: user.id,
    role: user.role as "admin" | "customer",
    fullName: user.full_name || user.fullName,
    customerId: user.customer_id || user.customerId,
  });

  return NextResponse.json({
    role: user.role,
    redirectTo: user.role === "admin" ? "/admin" : "/app",
  });
}
