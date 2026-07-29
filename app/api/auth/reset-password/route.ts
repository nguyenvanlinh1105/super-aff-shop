import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { sendMail, buildPasswordChangedEmail } from "@/lib/mailer";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) return NextResponse.json({ valid: false });

  const resetToken = await prisma.passwordResetToken.findUnique({ where: { token } });
  const valid = !!resetToken && !resetToken.usedAt && resetToken.expiresAt.getTime() > Date.now();

  return NextResponse.json({ valid });
}

export async function POST(req: NextRequest) {
  // Chặn dò token tự động — 1 IP tối đa 10 lần/15 phút.
  const ip = getClientIp(req);
  const limit = checkRateLimit(`reset-password:ip:${ip}`, 10, 15 * 60 * 1000);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: `Thử quá nhiều lần, vui lòng thử lại sau ${Math.ceil((limit.retryAfterSeconds ?? 0) / 60)} phút` },
      { status: 429 }
    );
  }

  const { token, newPassword } = await req.json();

  if (!token || !newPassword) {
    return NextResponse.json({ error: "Thiếu token hoặc mật khẩu mới" }, { status: 400 });
  }

  if (String(newPassword).length < 6) {
    return NextResponse.json({ error: "Mật khẩu mới phải có ít nhất 6 ký tự" }, { status: 400 });
  }

  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token },
    include: { user: true },
  });

  const isValid = resetToken && !resetToken.usedAt && resetToken.expiresAt.getTime() > Date.now();
  if (!isValid || !resetToken) {
    return NextResponse.json({ error: "Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn" }, { status: 400 });
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: resetToken.userId },
      data: { passwordHash: hashPassword(newPassword) },
    }),
    prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { usedAt: new Date() },
    }),
    // Vô hiệu hoá luôn các token khác chưa dùng của user này (nếu có).
    prisma.passwordResetToken.updateMany({
      where: { userId: resetToken.userId, usedAt: null, id: { not: resetToken.id } },
      data: { usedAt: new Date() },
    }),
  ]);

  void sendMail({
    to: resetToken.user.email,
    subject: "Mật khẩu của bạn đã được thay đổi - MeowBack Hoàn Tiền",
    html: buildPasswordChangedEmail({ fullName: resetToken.user.fullName }),
  });

  return NextResponse.json({ ok: true });
}
