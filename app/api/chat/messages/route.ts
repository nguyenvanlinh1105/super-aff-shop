import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

const MAX_MESSAGE_LENGTH = 1000;

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  }

  const since = req.nextUrl.searchParams.get("since");

  const messages = await prisma.chatMessage.findMany({
    where: since ? { createdAt: { gt: new Date(since) } } : undefined,
    orderBy: { createdAt: "desc" },
    take: since ? 100 : 50,
    include: { user: { select: { fullName: true, role: true } } },
  });

  return NextResponse.json({ messages: messages.reverse() });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  }

  const { message } = await req.json();
  const trimmed = typeof message === "string" ? message.trim() : "";
  if (!trimmed) {
    return NextResponse.json({ error: "Nội dung tin nhắn trống" }, { status: 400 });
  }
  if (trimmed.length > MAX_MESSAGE_LENGTH) {
    return NextResponse.json({ error: `Tin nhắn quá dài (tối đa ${MAX_MESSAGE_LENGTH} ký tự)` }, { status: 400 });
  }

  const created = await prisma.chatMessage.create({
    data: { userId: session.userId, message: trimmed },
    include: { user: { select: { fullName: true, role: true } } },
  });

  return NextResponse.json({ message: created });
}
