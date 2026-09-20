import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { setSessionCookie } from "@/lib/auth";
import { createMfaPendingToken } from "@/lib/session";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  if (!email || typeof email !== "string" || !/^\S+@\S+\.\S+$/.test(email)) {
    return NextResponse.json({ error: "Email không hợp lệ" }, { status: 400 });
  }

  if (!password || typeof password !== "string" || password.length < 6 || password.length > 255) {
    return NextResponse.json({ error: "Mật khẩu không hợp lệ" }, { status: 400 });
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

  const user = await prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() },
  });

  if (!user || user.status !== "active" || !verifyPassword(password, user.passwordHash)) {
    return NextResponse.json({ error: "Email hoặc mật khẩu không đúng" }, { status: 401 });
  }

  const isMfaEnabled = Boolean(user.mfaEnabled);

  // Nếu là Admin và ĐÃ BẬT 2MFA -> Bắt buộc qua Bước 2
  if (user.role === "admin" && isMfaEnabled) {
    const mfaPendingToken = await createMfaPendingToken({
      userId: user.id,
      role: user.role as "admin",
      fullName: user.fullName,
      customerId: user.customerId,
    });

    return NextResponse.json({
      require2FA: true,
      mfaToken: mfaPendingToken,
      mfaMethod: user.mfaMethod || "totp",
    });
  }

  // Đăng nhập bình thường (Customer hoặc Admin chưa bật 2MFA)
  await setSessionCookie({
    userId: user.id,
    role: user.role as "admin" | "customer",
    fullName: user.fullName,
    customerId: user.customerId,
  });

  return NextResponse.json({
    role: user.role,
    redirectTo: user.role === "admin" ? "/admin" : "/app",
  });
}
