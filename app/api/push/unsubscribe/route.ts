import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { endpoint } = body;

    if (!endpoint) {
      return NextResponse.json({ error: "Thiếu endpoint" }, { status: 400 });
    }

    const dbAny = prisma as any;
    if (dbAny.pushSubscription?.deleteMany) {
      await dbAny.pushSubscription.deleteMany({
        where: { endpoint },
      });
    } else {
      await prisma.$executeRaw`
        DELETE FROM "push_subscriptions" WHERE "endpoint" = ${endpoint}
      `;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Push unsubscribe error:", error);
    return NextResponse.json(
      { error: error?.message || "Lỗi hủy đăng ký thông báo" },
      { status: 500 }
    );
  }
}
