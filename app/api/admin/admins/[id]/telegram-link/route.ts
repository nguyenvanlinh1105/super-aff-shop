import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

const LINK_CODE_TTL_MINUTES = 10;

// GET: Kiểm tra trạng thái liên kết Telegram của Admin
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 403 });
  }

  const { id } = params;
  const targetAdmin = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      fullName: true,
      email: true,
      telegramChatId: true,
      telegramUsername: true,
    },
  });

  if (!targetAdmin) {
    return NextResponse.json({ error: "Không tìm thấy quản trị viên" }, { status: 404 });
  }

  return NextResponse.json({
    linked: Boolean(targetAdmin.telegramChatId),
    telegramChatId: targetAdmin.telegramChatId,
    telegramUsername: targetAdmin.telegramUsername,
    fullName: targetAdmin.fullName,
  });
}

// POST: Tạo mã liên kết Telegram (deep link / QR code) cho Admin
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 403 });
  }

  const { id } = params;
  const targetAdmin = await prisma.user.findUnique({
    where: { id },
    select: { id: true, fullName: true, email: true },
  });

  if (!targetAdmin) {
    return NextResponse.json({ error: "Không tìm thấy quản trị viên" }, { status: 404 });
  }

  const account = await prisma.telegramAccount.findFirst({ where: { status: "active" } });
  const botUsername = account?.botUsername || process.env.TELEGRAM_BOT_USERNAME || "meoback_hoantien_bot";

  // Dọn các mã cũ chưa sử dụng của admin này
  await prisma.adminTelegramLinkCode.deleteMany({
    where: { userId: targetAdmin.id, usedAt: null },
  });

  const code = `ADM${randomBytes(4).toString("hex").toUpperCase()}`;
  const expiresAt = new Date(Date.now() + LINK_CODE_TTL_MINUTES * 60 * 1000);

  await prisma.adminTelegramLinkCode.create({
    data: {
      code,
      userId: targetAdmin.id,
      expiresAt,
    },
  });

  return NextResponse.json({
    code,
    expiresInMinutes: LINK_CODE_TTL_MINUTES,
    deepLink: `https://t.me/${botUsername}?start=${code}`,
    botUsername,
  });
}

// DELETE: Hủy liên kết Telegram hiện tại của Admin (để kết nối tài khoản khác)
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 403 });
  }

  const { id } = params;
  const targetAdmin = await prisma.user.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!targetAdmin) {
    return NextResponse.json({ error: "Không tìm thấy quản trị viên" }, { status: 404 });
  }

  await prisma.user.update({
    where: { id: targetAdmin.id },
    data: {
      telegramChatId: null,
      telegramUsername: null,
    },
  });

  await prisma.adminTelegramLinkCode.deleteMany({
    where: { userId: targetAdmin.id },
  });

  return NextResponse.json({
    ok: true,
    message: "Đã hủy liên kết Telegram thành công. Bây giờ bạn có thể kết nối tài khoản khác.",
  });
}
