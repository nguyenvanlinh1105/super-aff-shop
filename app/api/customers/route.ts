import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { generateCustomerCode } from "@/lib/customerCode";
import { hashPassword } from "@/lib/password";
import { sendMail, buildAccountCreatedByAdminEmail } from "@/lib/mailer";
import { getRequestOrigin } from "@/lib/requestOrigin";

const SET_PASSWORD_TOKEN_TTL_DAYS = 7; // dài hơn quên mật khẩu thường (30 phút) vì khách có thể không mở mail ngay

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
  }

  const customers = await prisma.customer.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { trackingLinks: true, orders: true } },
      orders: { select: { customerRewardAmount: true, payoutStatus: true } },
    },
  });

  return NextResponse.json({ customers });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
  }

  const { fullName, phone, email, zaloUserId, telegramUserId, telegramUsername, note } = await req.json();
  if (!fullName) {
    return NextResponse.json({ error: "Thiếu họ tên" }, { status: 400 });
  }

  const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";

  // Admin tạo khách kèm email = tương đương tự đăng ký giúp khách — phải
  // kiểm tra trùng TRƯỚC khi tạo Customer, tránh sinh customerCode rác nếu
  // email đã tồn tại rồi mới báo lỗi.
  if (normalizedEmail) {
    const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existingUser) {
      return NextResponse.json({ error: "Email này đã được đăng ký" }, { status: 409 });
    }
  }

  const customerCode = await generateCustomerCode();

  const customer = await prisma.customer.create({
    data: { customerCode, fullName, phone, zaloUserId, telegramUserId, telegramUsername, note },
  });

  if (normalizedEmail) {
    // Mật khẩu ngẫu nhiên không ai biết — khách bắt buộc phải qua link đặt
    // mật khẩu trong email mới đăng nhập lần đầu được, giống hệt cơ chế
    // quên mật khẩu, không gửi mật khẩu dạng plaintext qua email.
    const randomPasswordHash = hashPassword(randomBytes(32).toString("hex"));

    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash: randomPasswordHash,
        fullName,
        role: "customer",
        customerId: customer.id,
      },
    });

    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + SET_PASSWORD_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000);
    await prisma.passwordResetToken.create({ data: { token, userId: user.id, expiresAt } });

    const origin = getRequestOrigin(req);
    const setPasswordUrl = `${origin}/reset-password?token=${token}`;

    void sendMail({
      to: normalizedEmail,
      subject: "Tài khoản MeowBack của bạn đã sẵn sàng",
      html: buildAccountCreatedByAdminEmail({
        fullName,
        setPasswordUrl,
        expiresInDays: SET_PASSWORD_TOKEN_TTL_DAYS,
      }),
    });
  }

  return NextResponse.json({ customer });
}
