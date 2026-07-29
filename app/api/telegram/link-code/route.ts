import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

const LINK_CODE_TTL_MINUTES = 10;

function generateLinkCode(): string {
  return randomBytes(5).toString("hex").toUpperCase();
}

export async function POST() {
  const session = await getSession();
  if (!session?.customerId) {
    return NextResponse.json({ error: "Chỉ tài khoản khách hàng mới liên kết được" }, { status: 403 });
  }

  const account = await prisma.telegramAccount.findFirst({ where: { status: "active" } });
  if (!account?.botUsername) {
    return NextResponse.json({ error: "Bot Telegram chưa được cấu hình" }, { status: 400 });
  }

  // Dọn mã cũ chưa dùng của khách này để tránh rác tích luỹ.
  await prisma.telegramLinkCode.deleteMany({
    where: { customerId: session.customerId, usedAt: null },
  });

  const code = generateLinkCode();
  const expiresAt = new Date(Date.now() + LINK_CODE_TTL_MINUTES * 60 * 1000);

  await prisma.telegramLinkCode.create({
    data: { code, customerId: session.customerId, expiresAt },
  });

  return NextResponse.json({
    code,
    expiresInMinutes: LINK_CODE_TTL_MINUTES,
    deepLink: `https://t.me/${account.botUsername}?start=${code}`,
  });
}

export async function GET() {
  const session = await getSession();
  if (!session?.customerId) {
    return NextResponse.json({ error: "Chỉ tài khoản khách hàng mới xem được" }, { status: 403 });
  }

  const customer = await prisma.customer.findUnique({ where: { id: session.customerId } });

  return NextResponse.json({
    linked: Boolean(customer?.telegramUserId),
    telegramUsername: customer?.telegramUsername ?? null,
  });
}

export async function DELETE() {
  const session = await getSession();
  if (!session?.customerId) {
    return NextResponse.json({ error: "Chỉ tài khoản khách hàng mới huỷ liên kết được" }, { status: 403 });
  }

  await prisma.customer.update({
    where: { id: session.customerId },
    data: { telegramUserId: null, telegramUsername: null },
  });

  return NextResponse.json({ ok: true });
}
