import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  }

  const page = Number(req.nextUrl.searchParams.get("page")) || 1;
  const limit = 20;
  const skip = (page - 1) * limit;

  const [notifications, unreadCount, totalCount] = await Promise.all([
    prisma.notification.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.notification.count({ where: { userId: session.userId, isRead: false } }),
    prisma.notification.count({ where: { userId: session.userId } }),
  ]);

  return NextResponse.json({
    notifications,
    unreadCount,
    totalPages: Math.ceil(totalCount / limit),
    currentPage: page,
  });
}
