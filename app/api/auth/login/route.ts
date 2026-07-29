import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { setSessionCookie } from "@/lib/auth";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ error: "Thiếu email hoặc mật khẩu" }, { status: 400 });
  }

  // Chặn brute-force: giới hạn theo IP (quét diện rộng) VÀ theo email (nhắm
  // vào 1 tài khoản cụ thể từ nhiều IP khác nhau) — vượt 1 trong 2 đều bị chặn.
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

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.status !== "active" || !verifyPassword(password, user.passwordHash)) {
    return NextResponse.json({ error: "Email hoặc mật khẩu không đúng" }, { status: 401 });
  }

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
