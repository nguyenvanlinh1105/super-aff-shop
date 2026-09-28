import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    const body = await req.json();
    const { endpoint, keys, userAgent } = body;

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return NextResponse.json(
        { error: "Dữ liệu subscription không hợp lệ" },
        { status: 400 }
      );
    }

    // Kiểm tra xem userId có tồn tại thật trong bảng User không để tránh lỗi Foreign Key
    let validUserId: string | null = null;
    if (session?.userId) {
      try {
        const userExists = await prisma.user.findUnique({
          where: { id: session.userId },
          select: { id: true },
        });
        if (userExists) {
          validUserId = userExists.id;
        }
      } catch (checkErr) {
        console.warn("User validation check warning:", checkErr);
      }
    }

    let subscriptionId: string;
    const dbAny = prisma as any;

    // Ưu tiên dùng Prisma model nếu client đã reload, nếu chưa reload (server chưa restart) dùng SQL trực tiếp
    if (dbAny.pushSubscription?.upsert) {
      const sub = await dbAny.pushSubscription.upsert({
        where: { endpoint },
        update: {
          p256dh: keys.p256dh,
          auth: keys.auth,
          userId: validUserId,
          userAgent: userAgent || req.headers.get("user-agent") || null,
        },
        create: {
          endpoint,
          p256dh: keys.p256dh,
          auth: keys.auth,
          userId: validUserId,
          userAgent: userAgent || req.headers.get("user-agent") || null,
        },
      });
      subscriptionId = sub.id;
    } else {
      const id = randomUUID();
      const ua = userAgent || req.headers.get("user-agent") || null;
      await prisma.$executeRaw`
        INSERT INTO "push_subscriptions" ("id", "user_id", "endpoint", "p256dh", "auth", "user_agent", "created_at", "updated_at")
        VALUES (${id}, ${validUserId}, ${endpoint}, ${keys.p256dh}, ${keys.auth}, ${ua}, NOW(), NOW())
        ON CONFLICT ("endpoint") DO UPDATE SET
          "p256dh" = EXCLUDED."p256dh",
          "auth" = EXCLUDED."auth",
          "user_id" = EXCLUDED."user_id",
          "user_agent" = EXCLUDED."user_agent",
          "updated_at" = NOW()
      `;
      subscriptionId = id;
    }

    return NextResponse.json({ success: true, id: subscriptionId });
  } catch (error: any) {
    console.error("Push subscribe error:", error);
    return NextResponse.json(
      { error: error?.message || "Không thể lưu thông tin đăng ký thông báo" },
      { status: 500 }
    );
  }
}
